import React, { useState, useEffect, useMemo } from 'react';
import {
  collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import {
  Package, Search, AlertTriangle, Truck, Check, Plus, X, Pencil, Boxes, Factory,
} from 'lucide-react';

/*
 * 庫存管理 InventoryView
 * 資料表（皆為新表，不動 quotes）：
 *   materials         — 材料主檔（name/category/spec/source/leadDays/orderAheadDays/stock/safetyStock/unit/countDate...）
 *   purchase_intransit— 在途清單（materialId/name/qty/source/orderedBy/orderedDate/status: ordered|arrived）
 *   stock_moves       — 異動紀錄（materialId/name/delta/type/note/at）
 */

const SOURCE_LABEL = (s) => (s === '1688' ? '1688' : s === '蝦皮' ? '蝦皮' : s || '—');

export default function InventoryView({ db }) {
  const [materials, setMaterials] = useState([]);
  const [intransit, setIntransit] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [shortOnly, setShortOnly] = useState(false);
  const [showIntransit, setShowIntransit] = useState(true);

  const [orderModal, setOrderModal] = useState(null); // material being ordered
  const [editCell, setEditCell] = useState(null); // {id, field}

  useEffect(() => {
    if (!db) { setLoading(false); return; }
    const un1 = onSnapshot(query(collection(db, 'materials')), (s) => {
      setMaterials(s.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    const un2 = onSnapshot(query(collection(db, 'purchase_intransit')), (s) => {
      setIntransit(s.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => { un1(); un2(); };
  }, [db]);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(materials.map((m) => m.category).filter(Boolean)))],
    [materials],
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
    let list = materials;
    if (catFilter !== 'all') list = list.filter((m) => m.category === catFilter);
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      list = list.filter((m) => (`${m.name} ${m.spec} ${m.category}`).toLowerCase().includes(kw));
    }
    if (shortOnly) list = list.filter(isShort);
    return list.slice().sort((a, b) => (a.category || '').localeCompare(b.category || '') || (a.name || '').localeCompare(b.name || ''));
  }, [materials, catFilter, search, shortOnly]);

  const stats = useMemo(() => {
    const short = materials.filter(isShort).length;
    const inTransitCount = intransit.filter((t) => t.status === 'ordered').length;
    return { total: materials.length, short, inTransitCount };
  }, [materials, intransit]);

  // ---- actions ----
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

  const placeOrder = async (m, qty, orderedBy) => {
    await addDoc(collection(db, 'purchase_intransit'), {
      materialId: m.id, name: m.name, category: m.category, qty: Number(qty) || 0,
      source: m.source || '', orderedBy: orderedBy || '', orderedDate: new Date().toISOString().slice(0, 10),
      status: 'ordered', at: serverTimestamp(),
    });
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

  if (loading) return <div className="max-w-6xl mx-auto p-8 text-center text-gray-500">載入庫存中…</div>;

  const orderedList = intransit.filter((t) => t.status === 'ordered')
    .sort((a, b) => (a.orderedDate || '').localeCompare(b.orderedDate || ''));

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Tile icon={<Boxes className="w-5 h-5" />} label="材料品項" value={stats.total} />
        <Tile icon={<AlertTriangle className="w-5 h-5" />} label="低於安全量" value={stats.short} alert={stats.short > 0} />
        <Tile icon={<Truck className="w-5 h-5" />} label="在途中" value={stats.inTransitCount} />
        <Tile icon={<Factory className="w-5 h-5" />} label="分類數" value={categories.length - 1} />
      </div>

      {/* in-transit */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4">
        <button onClick={() => setShowIntransit((v) => !v)} className="w-full flex items-center justify-between px-4 py-3">
          <span className="font-bold text-gray-800 flex items-center gap-2"><Truck className="w-4 h-4 text-blue-600" /> 在途清單（已叫貨、等待到貨）<span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">{orderedList.length}</span></span>
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
              <th className="text-right px-2">貨期(天)</th>
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
                  <td className="px-2 text-gray-400 text-xs max-w-[180px] truncate" title={m.spec}>{m.spec}</td>
                  <EditableCell m={m} field="stock" editCell={editCell} setEditCell={setEditCell} onSave={saveCell} align="right" strong />
                  <EditableCell m={m} field="safetyStock" editCell={editCell} setEditCell={setEditCell} onSave={saveCell} align="right" placeholder="設定" />
                  <EditableCell m={m} field="unit" editCell={editCell} setEditCell={setEditCell} onSave={saveCell} align="left" placeholder="—" />
                  <td className="px-2 text-gray-500 whitespace-nowrap">{SOURCE_LABEL(m.source)}</td>
                  <td className="px-2 text-right text-gray-500">{m.leadDays || '—'}</td>
                  <td className="px-2 whitespace-nowrap">
                    {short ? <span className="chip bg-red-100 text-red-700 text-xs rounded-full px-2 py-0.5">缺料</span>
                      : <span className="text-xs rounded-full px-2 py-0.5 bg-green-100 text-green-700">足夠</span>}
                    {inT > 0 && <span className="ml-1 text-xs rounded-full px-2 py-0.5 bg-blue-100 text-blue-700">在途 {inT}</span>}
                    {!m.stockKnown && <span className="ml-1 text-[10px] text-amber-500">未盤點</span>}
                  </td>
                  <td className="px-3 text-right whitespace-nowrap">
                    <button onClick={() => setOrderModal(m)} className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs rounded-full px-3 py-1 hover:bg-blue-700"><Plus className="w-3 h-3" /> 叫貨</button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={10} className="text-center text-gray-400 py-8">沒有符合的材料</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-400 mt-2 mb-8">
        點「庫存 / 安全量 / 單位」數字即可直接修改。庫存改動會記錄到異動紀錄。安全量設定後，庫存低於它就會標「缺料」。
      </div>

      {orderModal && (
        <OrderModal m={orderModal} onClose={() => setOrderModal(null)} onConfirm={placeOrder} />
      )}
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
        <input value={by} onChange={(e) => setBy(e.target.value)} className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-300 outline-none" placeholder="例：布丁" />
        <button onClick={() => onConfirm(m, qty, by)} disabled={!qty}
          className="w-full bg-blue-600 text-white rounded-full py-2 font-bold hover:bg-blue-700 disabled:opacity-40">
          加入在途清單
        </button>
      </div>
    </div>
  );
}
