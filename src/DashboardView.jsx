/**
 * 今日營運看板 — 一頁看懂：今日課程、近7天課程、備課狀況、叫貨警示、LINE 待辦、待收訂金
 * 叫貨回推：最晚下單日 = 開課日 − 提前天數（主檔 orderAheadDays，沒填則 1688=24天、台灣=9天）
 */
import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  LayoutDashboard, Calendar, Package, AlertTriangle, MessageSquare, Wallet, ChevronRight, CheckCircle2, Truck,
} from 'lucide-react';
import { buildMatIndex, expandClassNeeds, aheadDays, fmtDate, addDaysStr } from './opsUtils';

const Tile = ({ icon: Icon, label, value, sub, color, onClick, alert }) => (
  <button
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border p-4 text-left w-full transition hover:shadow-md ${alert ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'}`}
  >
    <div className="flex items-center justify-between">
      <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${color}`}><Icon className="w-4 h-4" />{label}</span>
      {onClick && <ChevronRight className="w-4 h-4 text-gray-300" />}
    </div>
    <div className={`text-3xl font-bold mt-2 ${alert ? 'text-red-600' : 'text-gray-800'}`}>{value}</div>
    {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
  </button>
);

const DashboardView = ({ quotes, db, lineTodoCount, onNavigate }) => {
  const [bomList, setBomList] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    if (!db) return;
    const u1 = onSnapshot(collection(db, 'bom'), (s) => setBomList(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(collection(db, 'materials'), (s) => setMaterials(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); };
  }, [db]);

  const today = fmtDate(new Date());
  const in7 = addDaysStr(today, 7);
  const in35 = addDaysStr(today, 35);

  const matIndex = useMemo(() => buildMatIndex(materials.filter((m) => m.active !== false)), [materials]);

  // 未來 35 天的所有場次（含 BOM 需求）
  const upcoming = useMemo(
    () => expandClassNeeds(quotes, bomList, matIndex, today, in35),
    [quotes, bomList, matIndex, today, in35],
  );

  const todayClasses = upcoming.filter((r) => r.date === today);
  const week = upcoming.filter((r) => r.date > today && r.date <= in7);

  // 備課警示：14 天內未裝箱完成的場次
  const in14 = addDaysStr(today, 14);
  const prepPending = upcoming.filter((r) => r.date <= in14 && !r.prepData?.packedAt);

  // 叫貨警示：彙總未來場次的缺料，回推最晚下單日
  const orderAlerts = useMemo(() => {
    const agg = {}; // matId → {mat, need, firstDate, classes:[]}
    upcoming.forEach((r) => {
      r.needs.forEach((n) => {
        if (!n.mat) return;
        const k = n.mat.id;
        if (!agg[k]) agg[k] = { mat: n.mat, need: 0, firstDate: r.date, classes: [] };
        agg[k].need += n.qty;
        if (r.date < agg[k].firstDate) agg[k].firstDate = r.date;
        agg[k].classes.push(`${r.date} ${r.courseName}`);
      });
    });
    const rows = [];
    Object.values(agg).forEach((a) => {
      const stock = Number(a.mat.stock || 0);
      if (stock >= a.need) return; // 夠用
      const deadline = addDaysStr(a.firstDate, -aheadDays(a.mat));
      rows.push({
        ...a,
        stock,
        short: a.need - stock,
        deadline,
        overdue: deadline < today,
        urgent: deadline <= addDaysStr(today, 3),
      });
    });
    return rows.sort((x, y) => (x.deadline > y.deadline ? 1 : -1));
  }, [upcoming, today]);

  const urgentOrders = orderAlerts.filter((r) => r.urgent);

  // 低於安全庫存
  const belowSafety = materials.filter(
    (m) => m.active !== false && Number(m.safetyStock || 0) > 0 && Number(m.stock || 0) < Number(m.safetyStock || 0),
  );

  // 待收訂金：未來場次、狀態 confirmed 但尚未登記訂金
  const depositPending = useMemo(() => {
    const seen = new Set();
    const rows = [];
    upcoming.forEach((r) => {
      if (seen.has(r.quoteId)) return;
      const q = r.quote;
      if (q.status === 'confirmed' && !Number(q.depositAmount || 0)) {
        seen.add(r.quoteId);
        rows.push(r);
      }
    });
    return rows;
  }, [upcoming]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-1">
        <LayoutDashboard className="mr-2 text-[#fb8e28]" /> 今日看板
      </h2>
      <p className="text-gray-500 text-sm mb-5">{today}・每天上班先看這頁：今天的課、要備的、要叫的、要回的。</p>

      {/* 數字磚 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Tile icon={Calendar} label="今日課程" value={todayClasses.length} color="text-[#fb8e28]"
          sub={todayClasses.length ? todayClasses.map((r) => r.courseName).join('、').slice(0, 20) : '今天沒有課'}
          onClick={() => onNavigate('calendar')} />
        <Tile icon={MessageSquare} label="LINE 待辦" value={lineTodoCount} color="text-green-600"
          sub={lineTodoCount ? '有訊息等處理' : '目前沒有待辦'} alert={lineTodoCount > 0}
          onClick={() => onNavigate('linetodos')} />
        <Tile icon={Truck} label="叫貨警示" value={urgentOrders.length} color="text-orange-600"
          sub={urgentOrders.length ? '已到最晚下單日' : `追蹤中 ${orderAlerts.length} 項`} alert={urgentOrders.length > 0}
          onClick={() => onNavigate('inventory')} />
        <Tile icon={Wallet} label="待收訂金" value={depositPending.length} color="text-purple-600"
          sub={depositPending.length ? '已確認但未登記訂金' : '都有登記'} alert={depositPending.length > 0}
          onClick={() => onNavigate('list')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 今日 + 近7天課程 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center"><Calendar className="w-4 h-4 mr-1.5 text-[#fb8e28]" /> 今日與近 7 天課程</h3>
          {todayClasses.length === 0 && week.length === 0 ? (
            <div className="text-sm text-gray-400 py-6 text-center">近 7 天沒有已確認的課程</div>
          ) : (
            <div className="space-y-2">
              {[...todayClasses, ...week].map((r) => (
                <div key={`${r.quoteId}_${r.itemIdx}`} className={`flex items-center justify-between rounded-lg border p-2.5 ${r.date === today ? 'bg-[#fdf5ea] border-[#f0d9bd]' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-800 truncate">{r.courseName}</div>
                    <div className="text-xs text-gray-500 truncate">{r.clientName}・{r.people} 人{r.time ? `・${r.time}` : ''}</div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className={`text-xs font-bold ${r.date === today ? 'text-[#c47d24]' : 'text-gray-600'}`}>{r.date === today ? '今天' : r.date.slice(5)}</div>
                    {r.prepData?.packedAt
                      ? <span className="text-xs text-green-600 flex items-center justify-end"><CheckCircle2 className="w-3 h-3 mr-0.5" />已裝箱</span>
                      : <span className="text-xs text-orange-500">未裝箱</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 叫貨警示 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-800 mb-1 flex items-center"><Truck className="w-4 h-4 mr-1.5 text-orange-600" /> 叫貨回推警示</h3>
          <p className="text-xs text-gray-400 mb-3">最晚下單日＝開課日 − 提前天數（1688 提早 24 天、台灣 9 天）</p>
          {orderAlerts.length === 0 ? (
            <div className="text-sm text-gray-400 py-6 text-center">未來 35 天課程的材料庫存都夠 ✓</div>
          ) : (
            <div className="space-y-2">
              {orderAlerts.slice(0, 12).map((a) => (
                <div key={a.mat.id} className={`rounded-lg border p-2.5 ${a.overdue ? 'bg-red-50 border-red-300' : a.urgent ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-gray-800 truncate">{a.mat.name}</div>
                    <div className={`text-xs font-bold shrink-0 ml-2 ${a.overdue ? 'text-red-600' : a.urgent ? 'text-orange-600' : 'text-gray-500'}`}>
                      {a.overdue ? `⚠ 已超過最晚下單日 ${a.deadline.slice(5)}` : `最晚 ${a.deadline.slice(5)} 下單`}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    需 {a.need}・庫存 {a.stock}・<span className="text-red-600 font-bold">缺 {a.short}</span>
                    {a.mat.source ? `・${a.mat.source}` : ''}・首場 {a.firstDate.slice(5)}
                  </div>
                </div>
              ))}
              {orderAlerts.length > 12 && <div className="text-xs text-gray-400 text-center">…還有 {orderAlerts.length - 12} 項，到「庫存」查看</div>}
            </div>
          )}
        </div>

        {/* 備課狀況 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center"><Package className="w-4 h-4 mr-1.5 text-teal-600" /> 備課狀況（14 天內未裝箱）</h3>
          {prepPending.length === 0 ? (
            <div className="text-sm text-gray-400 py-6 text-center">14 天內的課都已裝箱 ✓</div>
          ) : (
            <div className="space-y-2">
              {prepPending.map((r) => {
                const shortCount = r.needs.filter((n) => n.enough === false).length;
                return (
                  <button key={`${r.quoteId}_${r.itemIdx}`} onClick={() => onNavigate('prep')} className="w-full text-left flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-2.5 hover:bg-gray-100">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-800 truncate">{r.date.slice(5)}・{r.courseName}</div>
                      <div className="text-xs text-gray-500 truncate">{r.clientName}・{r.people} 人</div>
                    </div>
                    <div className="shrink-0 ml-2 text-right">
                      {shortCount > 0
                        ? <span className="text-xs text-red-600 font-bold flex items-center"><AlertTriangle className="w-3 h-3 mr-0.5" />缺 {shortCount} 項材料</span>
                        : <span className="text-xs text-gray-400">{r.bom ? '材料夠，待裝箱' : '無配方資料'}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 待收訂金 + 安全庫存 */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center"><Wallet className="w-4 h-4 mr-1.5 text-purple-600" /> 已確認但未登記訂金</h3>
            {depositPending.length === 0 ? (
              <div className="text-sm text-gray-400 py-4 text-center">沒有漏登記的 ✓</div>
            ) : (
              <div className="space-y-2">
                {depositPending.slice(0, 8).map((r) => (
                  <button key={r.quoteId} onClick={() => onNavigate('list')} className="w-full text-left flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-2.5 hover:bg-gray-100">
                    <div className="text-sm text-gray-800 truncate">{r.clientName}</div>
                    <div className="text-xs text-gray-500 shrink-0 ml-2">{r.date.slice(5)}・${Number(r.quote.totalAmount || 0).toLocaleString()}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center"><AlertTriangle className="w-4 h-4 mr-1.5 text-red-500" /> 低於安全庫存（{belowSafety.length}）</h3>
            {belowSafety.length === 0 ? (
              <div className="text-sm text-gray-400 py-4 text-center">都在安全量以上 ✓</div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {belowSafety.slice(0, 15).map((m) => (
                  <span key={m.id} className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5">
                    {m.name} {m.stock}/{m.safetyStock}
                  </span>
                ))}
                {belowSafety.length > 15 && <span className="text-xs text-gray-400">…+{belowSafety.length - 15}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
