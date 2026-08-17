import React, { useState, useEffect, useMemo } from 'react';
import {
  collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import {
  Search, AlertTriangle, Truck, Check, Plus, X, Pencil, Boxes, Factory, PackageCheck, History, Trash2, ClipboardPaste,
} from 'lucide-react';
import { buildMatIndex, linkMat } from './opsUtils';

/*
 * 庫存管理 InventoryView
 * 資料表（皆為新表，不動 quotes）：
 *   materials         — 材料主檔（active:false = 已刪除，不顯示但保留歷史）
 *   purchase_intransit— 在途清單（materialId/name/qty/source/orderedBy/orderedDate/status）
 *   stock_moves       — 異動紀錄（materialId/name/delta/type/note/at）
 *   shipments         — 到貨接龍批次（title/date/weightKg/cost/vendor/items[]/done/raw）
 */

const SOURCE_LABEL = (s) => (s === '1688' ? '1688' : s === '蝦皮' ? '蝦皮' : s || '—');

// ── 到貨接龍解析 ──
// 👉8/7海快18.52kg$674🧡跨境通  → 批次
// ✅302230097712 13.15         → 單號行（✅=已核對）
// 月亮框*12                     → 品名行（結束一個品項，吃掉前面累積的單號）
export function parseShipmentText(text) {
  const lines = String(text).split('\n').map((l) => l.trim()).filter(Boolean);
  const batches = [];
  let cur = null;
  let pendingTracks = [];
  let pendingChecked = true;

  const flushItem = (name) => {
    if (!cur) return;
    const qtyMatch = name.match(/[xX×*＊]\s*(\d+)/);
    cur.items.push({
      name,
      qty: qtyMatch ? Number(qtyMatch[1]) : null,
      tracking: pendingTracks,
      checked: pendingTracks.length > 0 ? pendingChecked : false,
      inbound: false,
      matId: null,
      matName: null,
    });
    pendingTracks = [];
    pendingChecked = true;
  };

  for (const line of lines) {
    if (/^👉/.test(line)) {
      if (cur) batches.push(cur);
      const h = line.replace(/^👉\s*/, '');
      const dateM = h.match(/(\d{1,2})\/(\d{1,2})/);
      const weightM = h.match(/([\d.]+)\s*kg/i);
      const costM = h.match(/\$\s*([\d,]+)/);
      // 供應商：去掉日期/重量/金額/emoji 後的中英文殘留
      let vendor = h
        .replace(/(\d{1,2})\/(\d{1,2})/, '')
        .replace(/([\d.]+)\s*kg/i, '')
        .replace(/\$\s*[\d,]+/, '')
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
        .trim();
      const y = new Date().getFullYear();
      const date = dateM ? `${y}-${String(dateM[1]).padStart(2, '0')}-${String(dateM[2]).padStart(2, '0')}` : '';
      cur = {
        title: h,
        date,
        weightKg: weightM ? Number(weightM[1]) : null,
        cost: costM ? Number(costM[1].replace(/,/g, '')) : null,
        vendor,
        items: [],
      };
      pendingTracks = []; pendingChecked = true;
      continue;
    }
    // 單號行：長英數字＋可選重量
    const trackM = line.match(/^[✅✔️√\s]*([A-Za-z0-9][A-Za-z0-9-]{5,})\s*([\d.]+)?\s*$/);
    if (trackM && /\d{4,}/.test(trackM[1])) {
      pendingTracks.push(trackM[1]);
      if (!/[✅✔️√]/.test(line)) pendingChecked = false;
      continue;
    }
    // 品名行
    if (cur) flushItem(line);
  }
  if (cur) batches.push(cur);
  return batches.filter((b) => b.items.length > 0);
}

export default function InventoryView({ db }) {
  const [materials, setMaterials] = useState([]);
  const [intransit, setIntransit] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [shortOnly, setShortOnly] = useState(false);
  const [showIntransit, setShowIntransit] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [orderModal, setOrderModal] = useState(null);
  const [editCell, setEditCell] = useState(null);
  const [pasteModal, setPasteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);

  useEffect(() => {
    if (!db) { setLoading(false); return; }
    const un1 = onSnapshot(query(collection(db, 'materials')), (s) => {
      setMaterials(s.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    const un2 = onSnapshot(query(collection(db, 'purchase_intransit')), (s) => {
      setIntransit(s.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const un3 = onSnapshot(query(collection(db, 'shipments')), (s) => {
      setShipments(s.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => { un1(); un2(); un3(); };
  }, [db]);

  const activeMaterials = useMemo(() => materials.filter((m) => m.active !== false), [materials]);
  const matIndex = useMemo(() => buildMatIndex(activeMaterials), [activeMaterials]);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(activeMaterials.map((m) => m.category).filter(Boolean)))],
    [activeMaterials],
  );

  const intransitByMat = useMemo(() => {
    const map = {};
    intransit.filter((t) => t.status === 'ordered').forEach((t) => {
      map[t.materialId] = (map[t.materialId] || 0) + (Number(t.qty) || 0);
    });
    return map;
  }, [intransit]);

  const isShort = (m) => (Number(m.safetyStock) || 0) > 0 && (Number(m.stock) || 0) < (Number(m.safetyStock) || 0);

  const filtered = useMemo(() => {
    let list = activeMaterials;
    if (catFilter !== 'all') list = list.filter((m) => m.category === catFilter);
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      list = list.filter((m) => (`${m.name} ${m.spec} ${m.category}`).toLowerCase().includes(kw));
    }
    if (shortOnly) list = list.filter(isShort);
    return list.slice().sort((a, b) => (a.category || '').localeCompare(b.category || '') || (a.name || '').localeCompare(b.name || ''));
  }, [activeMaterials, catFilter, search, shortOnly]);

  const stats = useMemo(() => {
    const short = activeMaterials.filter(isShort).length;
    const openShipments = shipments.filter((s) => !s.done).length;
    return { total: activeMaterials.length, short, openShipments };
  }, [activeMaterials, shipments]);

  // ---- 材料主檔 actions ----
  const saveCell = async (m, field, value) => {
    let v = value;
    if (['stock', 'safetyStock', 'leadDays', 'orderAheadDays'].includes(field)) v = Number(value) || 0;
    await updateDoc(doc(db, 'materials', m.id), { [field]: v });
    if (field === 'stock') {
      await addDoc(collection(db, 'stock_moves'), {
        materialId: m.id, name: m.name, delta: v - (Number(m.stock) || 0), type: 'adjust', note: '手動調整', at: serverTimestamp(),
      }).catch(() => {});
    }
    setEditCell(null);
  };

  const addMaterial = async (data) => {
    await addDoc(collection(db, 'materials'), {
      ...data,
      stock: Number(data.stock) || 0,
      safetyStock: Number(data.safetyStock) || 0,
      leadDays: data.source === '1688' ? 14 : 4,
      orderAheadDays: data.source === '1688' ? 24 : 9,
      orderCount: 0, lastOrder: '', countDate: '', stockRaw: '',
      stockKnown: true, active: true, createdAt: serverTimestamp(),
    });
    setAddModal(false);
  };

  const removeMaterial = async (m) => {
    if (!window.confirm(`確定刪除品項「${m.name}」？\n（保留歷史紀錄，之後需要可以再請系統還原）`)) return;
    await updateDoc(doc(db, 'materials', m.id), { active: false, deletedAt: new Date().toISOString().slice(0, 10) });
  };

  const placeOrder = async (m, qty, orderedBy) => {
    await addDoc(collection(db, 'purchase_intransit'), {
      materialId: m.id, name: m.name, category: m.category, qty: Number(qty) || 0,
      source: m.source || '', orderedBy: orderedBy || '', orderedDate: new Date().toISOString().slice(0, 10),
      status: 'ordered', at: serverTimestamp(),
    });
    // 記到主檔（叫貨歷史）
    await updateDoc(doc(db, 'materials', m.id), {
      lastOrder: new Date().toISOString().slice(0, 10),
      orderCount: (Number(m.orderCount) || 0) + 1,
    }).catch(() => {});
    setOrderModal(null);
  };

  const receiveOrder = async (t) => {
    const m = materials.find((x) => x.id === t.materialId);
    if (m) {
      await updateDoc(doc(db, 'materials', m.id), { stock: (Number(m.stock) || 0) + (Number(t.qty) || 0) });
      await addDoc(collection(db, 'stock_moves'), {
        materialId: m.id, name: m.name, delta: Number(t.qty) || 0, type: 'inbound', note: `到貨入庫（${t.orderedBy || ''}）`, at: serverTimestamp(),
      }).catch(() => {});
    }
    await updateDoc(doc(db, 'purchase_intransit', t.id), { status: 'arrived', arrivedDate: new Date().toISOString().slice(0, 10) });
  };
  const cancelOrder = async (t) => { await deleteDoc(doc(db, 'purchase_intransit', t.id)); };

  // ---- 到貨接龍 actions ----
  const createShipments = async (batches) => {
    for (const b of batches) {
      // 自動連結庫存主檔
      const items = b.items.map((it) => {
        const cleanName = it.name.replace(/[xX×*＊]\s*\d+.*$/, '').trim();
        const mat = linkMat(matIndex, cleanName);
        return { ...it, matId: mat ? mat.id : null, matName: mat ? mat.name : null };
      });
      await addDoc(collection(db, 'shipments'), {
        ...b, items, done: items.every((i) => i.checked), createdAt: serverTimestamp(),
      });
    }
    setPasteModal(false);
  };

  const toggleShipItem = async (ship, idx) => {
    const items = ship.items.map((it, i) => (i === idx ? { ...it } : it));
    const it = items[idx];
    if (it.checked) {
      if (it.inbound) { alert('這項已入庫，不能取消勾選（要修改請直接改庫存數字）'); return; }
      it.checked = false;
    } else {
      it.checked = true;
      // 有連到主檔＋有數量 → 問要不要入庫
      if (it.matId && it.qty && !it.inbound) {
        const m = materials.find((x) => x.id === it.matId);
        if (m && window.confirm(`「${it.name}」核對到貨 ✓\n\n要同時入庫嗎？\n${m.name}：${m.stock || 0} → ${(Number(m.stock) || 0) + it.qty}`)) {
          await updateDoc(doc(db, 'materials', m.id), { stock: (Number(m.stock) || 0) + it.qty });
          await addDoc(collection(db, 'stock_moves'), {
            materialId: m.id, name: m.name, delta: it.qty, type: 'inbound',
            note: `到貨核對入庫（${ship.title || ship.date}）`, at: serverTimestamp(),
          }).catch(() => {});
          it.inbound = true;
        }
      }
    }
    const done = items.every((i) => i.checked);
    await updateDoc(doc(db, 'shipments', ship.id), { items, done });
  };

  const deleteShipment = async (ship) => {
    if (!window.confirm(`確定刪除批次「${ship.title}」？（已入庫的數量不會回扣）`)) return;
    await deleteDoc(doc(db, 'shipments', ship.id));
  };

  if (loading) return <div className="max-w-6xl mx-auto p-8 text-center text-gray-500">載入庫存中…</div>;

  const openShipments = shipments.filter((s) => !s.done).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const doneShipments = shipments.filter((s) => s.done).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const orderedList = intransit.filter((t) => t.status === 'ordered')
    .sort((a, b) => (a.orderedDate || '').localeCompare(b.orderedDate || ''));

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Tile icon={<Boxes className="w-5 h-5" />} label="材料品項" value={stats.total} />
        <Tile icon={<AlertTriangle className="w-5 h-5" />} label="低於安全量" value={stats.short} alert={stats.short > 0} />
        <Tile icon={<Truck className="w-5 h-5" />} label="到貨核對中" value={stats.openShipments} alert={stats.openShipments > 0} />
        <Tile icon={<Factory className="w-5 h-5" />} label="分類數" value={categories.length - 1} />
      </div>

      {/* ★ 到貨核對（接龍） */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-bold text-gray-800 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-green-600" /> 到貨核對
            {openShipments.length > 0 && <span className="text-xs bg-orange-100 text-orange-700 rounded-full px-2 py-0.5">{openShipments.length} 批未核完</span>}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setShowHistory((v) => !v)} className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1 ${showHistory ? 'bg-gray-800 text-white border-gray-800' : 'text-gray-600 border-gray-300'}`}>
              <History className="w-3 h-3" /> 歷史紀錄 ({doneShipments.length})
            </button>
            <button onClick={() => setPasteModal(true)} className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
              <ClipboardPaste className="w-3 h-3" /> 貼上到貨接龍
            </button>
          </div>
        </div>
        <div className="px-4 py-3">
          {!showHistory ? (
            openShipments.length === 0 ? (
              <div className="text-sm text-gray-400 py-2">目前沒有待核對的到貨。出貨後把接龍貼進來，到貨時打勾就是入庫＋留紀錄。</div>
            ) : (
              openShipments.map((s) => <ShipmentCard key={s.id} ship={s} onToggle={toggleShipItem} onDelete={deleteShipment} />)
            )
          ) : (
            doneShipments.length === 0 ? (
              <div className="text-sm text-gray-400 py-2">還沒有完成核對的批次。</div>
            ) : (
              doneShipments.map((s) => <ShipmentCard key={s.id} ship={s} onToggle={toggleShipItem} onDelete={deleteShipment} history />)
            )
          )}
        </div>
      </div>

      {/* 在途清單（舊：手動叫貨） */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4">
        <button onClick={() => setShowIntransit((v) => !v)} className="w-full flex items-center justify-between px-4 py-3">
          <span className="font-bold text-gray-800 flex items-center gap-2"><Truck className="w-4 h-4 text-blue-600" /> 在途清單（手動叫貨）<span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">{orderedList.length}</span></span>
          <span className="text-gray-400 text-sm">{showIntransit ? '收合' : '展開'}</span>
        </button>
        {showIntransit && (
          <div className="px-4 pb-4">
            {orderedList.length === 0 ? (
              <div className="text-sm text-gray-400 py-2">目前沒有在途中的叫貨。到庫存表按「叫貨」即可加入。</div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="text-gray-500 text-xs border-b">
                  <th className="text-left py-2">品名</th><th className="text-left">數量</th><th className="text-left">來源</th><th className="text-left">下單日</th><th className="text-left">叫貨人</th><th></th>
                </tr></thead>
                <tbody>
                  {orderedList.map((t) => (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="py-2">{t.name}</td>
                      <td>{t.qty}</td>
                      <td>{SOURCE_LABEL(t.source)}</td>
                      <td>{t.orderedDate}</td>
                      <td>{t.orderedBy || '—'}</td>
                      <td className="text-right whitespace-nowrap">
                        <button onClick={() => receiveOrder(t)} className="inline-flex items-center gap-1 bg-green-600 text-white text-xs rounded-full px-3 py-1 mr-1 hover:bg-green-700"><Check className="w-3 h-3" /> 到貨入庫</button>
                        <button onClick={() => cancelOrder(t)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜尋品名 / 規格 / 分類"
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          {categories.map((c) => <option key={c} value={c}>{c === 'all' ? '全部分類' : c}</option>)}
        </select>
        <label className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={shortOnly} onChange={(e) => setShortOnly(e.target.checked)} /> 只看缺料
        </label>
        <button onClick={() => setAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full px-4 py-2 flex items-center gap-1">
          <Plus className="w-4 h-4" /> 新增品項
        </button>
      </div>

      {/* table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs border-b bg-gray-50">
              <th className="text-left px-3 py-2">分類</th>
              <th className="text-left px-2">品名</th>
              <th className="text-left px-2">規格</th>
              <th className="text-right px-2">庫存</th>
              <th className="text-right px-2">安全量</th>
              <th className="text-left px-2">單位</th>
              <th className="text-left px-2">來源</th>
              <th className="text-left px-2">最近叫貨</th>
              <th className="text-left px-2">狀態</th>
              <th className="text-right px-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const inT = intransitByMat[m.id] || 0;
              const short = isShort(m);
              return (
                <tr key={m.id} className="border-b last:border-0 hover:bg-blue-50/40">
                  <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{m.category}</td>
                  <td className="px-2 font-medium text-gray-800">{m.name}</td>
                  <td className="px-2 text-gray-400 text-xs max-w-[160px] truncate" title={m.spec}>{m.spec}</td>
                  <EditableCell m={m} field="stock" editCell={editCell} setEditCell={setEditCell} onSave={saveCell} align="right" strong />
                  <EditableCell m={m} field="safetyStock" editCell={editCell} setEditCell={setEditCell} onSave={saveCell} align="right" placeholder="設定" />
                  <EditableCell m={m} field="unit" editCell={editCell} setEditCell={setEditCell} onSave={saveCell} align="left" placeholder="—" />
                  <td className="px-2 text-gray-500 whitespace-nowrap">{SOURCE_LABEL(m.source)}</td>
                  <td className="px-2 text-gray-400 text-xs whitespace-nowrap">{m.lastOrder || '—'}</td>
                  <td className="px-2 whitespace-nowrap">
                    {short ? <span className="chip bg-red-100 text-red-700 text-xs rounded-full px-2 py-0.5">缺料</span>
                      : <span className="text-xs rounded-full px-2 py-0.5 bg-green-100 text-green-700">足夠</span>}
                    {inT > 0 && <span className="ml-1 text-xs rounded-full px-2 py-0.5 bg-blue-100 text-blue-700">在途 {inT}</span>}
                    {!m.stockKnown && <span className="ml-1 text-[10px] text-amber-500">未盤點</span>}
                  </td>
                  <td className="px-3 text-right whitespace-nowrap">
                    <button onClick={() => setOrderModal(m)} className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs rounded-full px-3 py-1 hover:bg-blue-700"><Plus className="w-3 h-3" /> 叫貨</button>
                    <button onClick={() => removeMaterial(m)} title="刪除品項" className="ml-1 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4 inline" /></button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={10} className="text-center text-gray-400 py-8">沒有符合的材料</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-400 mt-2 mb-8">
        點「庫存 / 安全量 / 單位」數字即可直接修改，改動會進異動紀錄。「新增品項」給合夥人核對清單用；刪除是軟刪除，歷史紀錄都保留。
      </div>

      {orderModal && <OrderModal m={orderModal} onClose={() => setOrderModal(null)} onConfirm={placeOrder} />}
      {pasteModal && <PasteShipmentModal onClose={() => setPasteModal(false)} onConfirm={createShipments} matIndex={matIndex} />}
      {addModal && <AddMaterialModal categories={categories.filter((c) => c !== 'all')} onClose={() => setAddModal(false)} onConfirm={addMaterial} />}
    </div>
  );
}

// ── 到貨批次卡 ──
function ShipmentCard({ ship, onToggle, onDelete, history }) {
  const doneCount = ship.items.filter((i) => i.checked).length;
  return (
    <div className={`border rounded-lg mb-3 last:mb-0 ${history ? 'border-gray-200 bg-gray-50/50' : 'border-orange-200 bg-orange-50/30'}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div className="text-sm font-bold text-gray-800">
          👉 {ship.title}
          <span className={`ml-2 text-xs font-normal ${doneCount === ship.items.length ? 'text-green-600' : 'text-orange-600'}`}>
            {doneCount}/{ship.items.length} 已核對
          </span>
        </div>
        <button onClick={() => onDelete(ship)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
      </div>
      <div className="px-3 py-2 space-y-1.5">
        {ship.items.map((it, idx) => (
          <div key={idx} className="flex items-start justify-between gap-2">
            <label className="flex items-start gap-2 cursor-pointer select-none min-w-0">
              <input type="checkbox" className="w-4 h-4 mt-0.5 shrink-0 text-green-600 rounded" checked={!!it.checked} onChange={() => onToggle(ship, idx)} />
              <span className="min-w-0">
                <span className={`text-sm ${it.checked ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'}`}>{it.name}</span>
                {it.inbound && <span className="ml-1 text-[10px] bg-green-100 text-green-700 rounded px-1">已入庫+{it.qty}</span>}
                {it.matName && !it.inbound && <span className="ml-1 text-[10px] bg-blue-50 text-blue-600 rounded px-1">連結：{it.matName}</span>}
                {!it.matId && <span className="ml-1 text-[10px] text-gray-300">僅記錄</span>}
                <span className="block text-[10px] text-gray-400 break-all">{(it.tracking || []).join('、')}</span>
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 貼上接龍 Modal ──
function PasteShipmentModal({ onClose, onConfirm, matIndex }) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);

  const doParse = () => {
    const batches = parseShipmentText(text);
    if (batches.length === 0) { alert('解析不到批次，請確認格式（要有 👉 開頭的批次行）'); return; }
    setPreview(batches);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-1"><ClipboardPaste className="w-4 h-4 text-green-600" /> 貼上到貨接龍</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        {!preview ? (
          <>
            <textarea
              autoFocus
              className="w-full border rounded-lg p-3 text-sm h-56 focus:outline-none focus:border-green-400 font-mono"
              placeholder={'👉8/7海快18.52kg$674🧡跨境通\n✅302230097712 13.15\n月亮框*12\n...'}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button onClick={doParse} disabled={!text.trim()} className="mt-3 w-full bg-green-600 text-white rounded-full py-2 font-bold hover:bg-green-700 disabled:opacity-40">
              解析預覽
            </button>
          </>
        ) : (
          <>
            <div className="space-y-3 mb-3">
              {preview.map((b, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3">
                  <div className="text-sm font-bold text-gray-800 mb-1">👉 {b.title}</div>
                  {b.items.map((it, j) => {
                    const cleanName = it.name.replace(/[xX×*＊]\s*\d+.*$/, '').trim();
                    const mat = linkMat(matIndex, cleanName);
                    return (
                      <div key={j} className="text-xs text-gray-600 flex justify-between py-0.5">
                        <span>{it.checked ? '✅' : '⬜'} {it.name}{it.qty ? `（數量 ${it.qty}）` : ''}</span>
                        <span className={mat ? 'text-blue-600' : 'text-gray-300'}>{mat ? `→ ${mat.name}` : '僅記錄'}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPreview(null)} className="flex-1 border border-gray-300 rounded-full py-2 text-sm text-gray-600">回上一步</button>
              <button onClick={() => onConfirm(preview)} className="flex-1 bg-green-600 text-white rounded-full py-2 font-bold hover:bg-green-700">
                確認建立 {preview.length} 批
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── 新增品項 Modal ──
function AddMaterialModal({ categories, onClose, onConfirm }) {
  const [f, setF] = useState({ name: '', category: '', spec: '', source: '1688', unit: '', stock: '', safetyStock: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800">新增品項</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <label className="block text-sm text-gray-600 mb-1">品名 *</label>
        <input autoFocus value={f.name} onChange={set('name')} className="w-full border rounded-lg px-3 py-2 mb-2 text-sm" placeholder="例：月亮框" />
        <label className="block text-sm text-gray-600 mb-1">分類</label>
        <input value={f.category} onChange={set('category')} list="xbh-cats" className="w-full border rounded-lg px-3 py-2 mb-2 text-sm" placeholder="選擇或輸入新分類" />
        <datalist id="xbh-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        <label className="block text-sm text-gray-600 mb-1">規格（選填）</label>
        <input value={f.spec} onChange={set('spec')} className="w-full border rounded-lg px-3 py-2 mb-2 text-sm" />
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div>
            <label className="block text-sm text-gray-600 mb-1">來源</label>
            <select value={f.source} onChange={set('source')} className="w-full border rounded-lg px-2 py-2 text-sm">
              <option value="1688">1688</option><option value="台灣">台灣</option><option value="蝦皮">蝦皮</option><option value="">其他</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">庫存</label>
            <input type="number" value={f.stock} onChange={set('stock')} className="w-full border rounded-lg px-2 py-2 text-sm" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">安全量</label>
            <input type="number" value={f.safetyStock} onChange={set('safetyStock')} className="w-full border rounded-lg px-2 py-2 text-sm" placeholder="0" />
          </div>
        </div>
        <button onClick={() => onConfirm(f)} disabled={!f.name.trim()}
          className="w-full bg-blue-600 text-white rounded-full py-2 font-bold hover:bg-blue-700 disabled:opacity-40 mt-2">
          新增
        </button>
      </div>
    </div>
  );
}

function Tile({ icon, label, value, alert }) {
  return (
    <div className={`bg-white rounded-xl border p-3 ${alert ? 'border-red-200' : 'border-gray-200'}`}>
      <div className="flex items-center gap-2 text-gray-500 text-xs">{icon}{label}</div>
      <div className={`text-2xl font-extrabold mt-1 ${alert ? 'text-red-600' : 'text-gray-800'}`}>{value}</div>
    </div>
  );
}

function EditableCell({ m, field, editCell, setEditCell, onSave, align = 'left', strong, placeholder }) {
  const editing = editCell && editCell.id === m.id && editCell.field === field;
  const val = m[field];
  const [tmp, setTmp] = useState(val ?? '');
  useEffect(() => { setTmp(val ?? ''); }, [editing]); // eslint-disable-line
  if (editing) {
    return (
      <td className={`px-2 text-${align}`}>
        <input autoFocus value={tmp} onChange={(e) => setTmp(e.target.value)}
          onBlur={() => onSave(m, field, tmp)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSave(m, field, tmp); if (e.key === 'Escape') setEditCell(null); }}
          className="w-16 border rounded px-1 py-0.5 text-sm" />
      </td>
    );
  }
  return (
    <td className={`px-2 text-${align} cursor-pointer group`} onClick={() => setEditCell({ id: m.id, field })}>
      <span className={strong ? 'font-bold text-gray-800' : 'text-gray-600'}>{(val ?? '') === '' ? <span className="text-gray-300">{placeholder || '—'}</span> : val}</span>
      <Pencil className="w-3 h-3 text-gray-300 inline ml-1 opacity-0 group-hover:opacity-100" />
    </td>
  );
}

function OrderModal({ m, onClose, onConfirm }) {
  const [qty, setQty] = useState('');
  const [by, setBy] = useState('');
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800">叫貨 — {m.name}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="text-xs text-gray-500 mb-3">來源 {SOURCE_LABEL(m.source)}・貨期約 {m.leadDays || '?'} 天・目前庫存 {m.stock || 0}</div>
        <label className="block text-sm text-gray-600 mb-1">叫貨數量</label>
        <input autoFocus type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-blue-300 outline-none" placeholder="0" />
        <label className="block text-sm text-gray-600 mb-1">叫貨人（選填）</label>
        <input value={by} onChange={(e) => setBy(e.target.value)} className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-300 outline-none" placeholder="例：布丁 / 俏俏" />
        <button onClick={() => onConfirm(m, qty, by)} disabled={!qty}
          className="w-full bg-blue-600 text-white rounded-full py-2 font-bold hover:bg-blue-700 disabled:opacity-40">
          加入在途清單
        </button>
      </div>
    </div>
  );
}
