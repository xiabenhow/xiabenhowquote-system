/**
 * LINE 待辦 — 判讀橋 (line_todos) 的員工處理介面
 * 資料來源：WordPress webhook → Claude 判讀 → Firestore line_todos
 * status: open（待處理）→ done（已處理）
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import {
  MessageSquare, Check, RotateCcw, Wallet, Calendar, Users, FileText, Clock, ChevronDown, ChevronUp, Sparkles, RefreshCw,
} from 'lucide-react';
import { fmtDate } from './opsUtils';

const SUMMARY_ENDPOINT = 'https://www.xiabenhow.com/wp-json/xbh-line/v1/daily-summary';
const SUMMARY_SECRET = 'xbh_sum_9dk2vq';

const TYPE_STYLE = {
  '付款回報':   { color: 'bg-green-100 text-green-800 border-green-300', icon: Wallet },
  '付款預告':   { color: 'bg-lime-100 text-lime-800 border-lime-300', icon: Clock },
  '確定舉辦':   { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Check },
  '改期請求':   { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: Calendar },
  '人數調整':   { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Users },
  '課後人數核對': { color: 'bg-teal-100 text-teal-800 border-teal-300', icon: Users },
  '報價詢價':   { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: FileText },
};

const toDate = (at) => {
  if (!at) return null;
  if (typeof at?.toDate === 'function') return at.toDate();
  const d = new Date(at);
  return Number.isNaN(d.getTime()) ? null : d;
};
const fmtTime = (at) => {
  const d = toDate(at);
  if (!d) return '';
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const STATUS_LABEL = { draft: '草稿', confirmed: '已回簽', paid: '已付訂', closed: '已結案' };
const STATUS_COLOR = {
  draft: 'bg-gray-100 text-gray-600',
  confirmed: 'bg-purple-100 text-purple-700',
  paid: 'bg-orange-100 text-orange-700',
  closed: 'bg-green-100 text-green-700',
};

// ★ 套用到報價單：確定舉辦→改「已回簽」；付款回報→記訂金(改已付訂)或尾款(改已結案)
const ApplyToQuote = ({ todo, quotes, db, onApplied }) => {
  const [open, setOpen] = useState(false);
  const [kw, setKw] = useState('');
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState(todo.amount ? String(todo.amount) : '');
  const [busy, setBusy] = useState(false);

  const isPay = todo.type === '付款回報';
  const candidates = useMemo(() => {
    let list = quotes.filter((q) => q.status !== 'closed');
    const k = kw.trim();
    if (k) {
      list = list.filter((q) =>
        (q.clientInfo?.companyName || '').includes(k) ||
        (q.clientInfo?.contactPerson || '').includes(k));
    }
    return list.slice(0, 8);
  }, [quotes, kw]);

  const dateTag = () => {
    const d = new Date();
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const apply = async (kind) => {
    if (!selected) { alert('請先選一張報價單'); return; }
    const company = selected.clientInfo?.companyName || '';
    const noteTag = `${dateTag()} LINE回報${todo.last5 && todo.last5 !== 'null' ? ' 末五碼' + todo.last5 : ''}`;
    let update = {};
    let desc = '';
    if (kind === 'confirm') {
      update = { status: 'confirmed' };
      desc = `「${company}」狀態 → 已回簽`;
    } else if (kind === 'deposit') {
      const amt = parseInt(amount || 0);
      if (!amt) { alert('請填訂金金額'); return; }
      update = {
        status: 'paid',
        depositAmount: String(amt),
        depositNote: ((selected.depositNote ? selected.depositNote + ' / ' : '') + noteTag).slice(0, 200),
      };
      desc = `「${company}」狀態 → 已付訂，記訂金 $${amt.toLocaleString()}`;
    } else if (kind === 'final') {
      const amt = parseInt(amount || 0);
      if (!amt) { alert('請填尾款金額'); return; }
      update = {
        status: 'closed',
        finalPaidAmount: String(amt),
        finalPaidNote: ((selected.finalPaidNote ? selected.finalPaidNote + ' / ' : '') + noteTag).slice(0, 200),
      };
      desc = `「${company}」狀態 → 已結案，記尾款 $${amt.toLocaleString()}`;
    }
    if (!window.confirm(`確定套用？\n\n${desc}\n\n（套用後這張待辦會自動標記完成）`)) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, 'quotes', selected.id), { ...update, updatedAt: serverTimestamp() });
      await updateDoc(doc(db, 'line_todos', todo.id), {
        status: 'done',
        doneAt: new Date().toISOString(),
        applied: { quoteId: selected.id, company, action: desc },
      });
      onApplied && onApplied();
    } catch (e) { console.error(e); alert('套用失敗，請再試一次'); }
    setBusy(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-2 text-xs font-bold text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1 flex items-center gap-1">
        <FileText className="w-3 h-3" /> 套用到報價單{isPay ? '（記訂金/尾款）' : '（改已回簽）'}
      </button>
    );
  }

  return (
    <div className="mt-2 border border-blue-200 bg-blue-50/50 rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-blue-800">選擇對應的報價單</span>
        <button onClick={() => setOpen(false)} className="text-gray-400 text-xs">收合</button>
      </div>
      <input
        type="text"
        className="w-full border rounded p-1.5 text-sm mb-2 focus:outline-none focus:border-blue-400"
        placeholder="搜尋公司名 / 聯絡人…"
        value={kw}
        onChange={(e) => { setKw(e.target.value); setSelected(null); }}
      />
      <div className="space-y-1 mb-2 max-h-44 overflow-y-auto">
        {candidates.length === 0 ? (
          <div className="text-xs text-gray-400 py-2 text-center">找不到符合的報價單</div>
        ) : candidates.map((q) => (
          <button
            key={q.id}
            onClick={() => setSelected(q)}
            className={`w-full text-left rounded border p-2 text-xs flex justify-between items-center ${selected?.id === q.id ? 'border-blue-500 bg-white ring-1 ring-blue-300' : 'border-gray-200 bg-white hover:border-blue-300'}`}
          >
            <div className="min-w-0">
              <div className="font-bold text-gray-800 truncate">{q.clientInfo?.companyName || '未命名'}</div>
              <div className="text-gray-400 truncate">
                {(q.items?.[0]?.eventDate || '')} {(q.items?.[0]?.courseName || '').slice(0, 12)}・${Number(q.totalAmount || 0).toLocaleString()}
              </div>
            </div>
            <span className={`shrink-0 ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLOR[q.status] || 'bg-gray-100 text-gray-500'}`}>
              {STATUS_LABEL[q.status] || q.status}
            </span>
          </button>
        ))}
      </div>
      {isPay && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500 font-bold">金額 $</span>
          <input
            type="number"
            className="w-28 border rounded p-1.5 text-sm focus:outline-none focus:border-blue-400"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="金額"
          />
          {todo.amount ? <span className="text-[10px] text-gray-400">（AI 從訊息抓到 ${Number(todo.amount).toLocaleString()}）</span> : null}
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {isPay ? (
          <>
            <button disabled={busy || !selected} onClick={() => apply('deposit')} className={`text-xs font-bold rounded px-3 py-1.5 ${!selected || busy ? 'bg-gray-200 text-gray-400' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
              記訂金 → 已付訂
            </button>
            <button disabled={busy || !selected} onClick={() => apply('final')} className={`text-xs font-bold rounded px-3 py-1.5 ${!selected || busy ? 'bg-gray-200 text-gray-400' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
              記尾款 → 已結案
            </button>
          </>
        ) : (
          <button disabled={busy || !selected} onClick={() => apply('confirm')} className={`text-xs font-bold rounded px-3 py-1.5 ${!selected || busy ? 'bg-gray-200 text-gray-400' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
            狀態改「已回簽」
          </button>
        )}
      </div>
    </div>
  );
};

const TodoCard = ({ todo, onDone, onReopen, isDone, quotes, db }) => {
  const [expanded, setExpanded] = useState(false);
  const style = TYPE_STYLE[todo.type] || { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: MessageSquare };
  const Icon = style.icon;
  const conf = Math.round((todo.confidence || 0) * 100);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${isDone ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${style.color}`}>
              <Icon className="w-3 h-3" />{todo.type}
            </span>
            {conf > 0 && (
              <span className={`text-xs ${conf >= 80 ? 'text-gray-400' : 'text-orange-500 font-bold'}`}>
                {conf >= 80 ? `信心 ${conf}%` : `⚠ 信心僅 ${conf}%，請人工確認`}
              </span>
            )}
            <span className="text-xs text-gray-400">{fmtTime(todo.at)}</span>
          </div>
          <div className="text-sm font-medium text-gray-800">{todo.summary || todo.text}</div>
          <div className="flex gap-3 mt-1 flex-wrap text-xs text-gray-600">
            {todo.amount ? <span className="font-bold text-green-700">金額 ${Number(todo.amount).toLocaleString()}</span> : null}
            {todo.last5 && todo.last5 !== 'null' ? <span>末五碼 {todo.last5}</span> : null}
            {todo.newDate && todo.newDate !== 'null' ? <span className="text-orange-700 font-bold">新日期 {todo.newDate}</span> : null}
            {todo.people ? <span className="text-purple-700 font-bold">人數 {todo.people}</span> : null}
          </div>
          {todo.text && todo.text !== todo.summary && (
            <button onClick={() => setExpanded(!expanded)} className="mt-1 text-xs text-blue-500 flex items-center gap-0.5">
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />} 原始訊息
            </button>
          )}
          {expanded && (
            <div className="mt-1 text-xs text-gray-500 bg-gray-50 rounded p-2 whitespace-pre-wrap break-all">{todo.text}</div>
          )}
          {/* ★ 已套用資訊 */}
          {todo.applied?.action && (
            <div className="mt-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1 inline-block">
              ✅ 已套用：{todo.applied.action}
            </div>
          )}
          {/* ★ 套用到報價單（確定舉辦 / 付款回報） */}
          {!isDone && (todo.type === '確定舉辦' || todo.type === '付款回報') && (
            <ApplyToQuote todo={todo} quotes={quotes} db={db} />
          )}
        </div>
        <div className="shrink-0">
          {isDone ? (
            <button onClick={() => onReopen(todo)} className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 border rounded px-2 py-1">
              <RotateCcw className="w-3 h-3" /> 還原
            </button>
          ) : (
            <button onClick={() => onDone(todo)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded px-3 py-1.5 flex items-center gap-1">
              <Check className="w-4 h-4" /> 處理完成
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ★ 今日訊息摘要卡（每晚 22:00 自動更新，可手動立即更新）
const DailySummaryCard = ({ db }) => {
  const [summary, setSummary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const todayStr = fmtDate(new Date());

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, 'line_daily_summary', todayStr), (snap) => {
      setSummary(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [db, todayStr]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const r = await fetch(SUMMARY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: SUMMARY_SECRET }),
      });
      const j = await r.json();
      if (!j.ok) alert('摘要更新失敗，請稍後再試');
    } catch (e) { alert('連線失敗，請確認網路'); }
    setRefreshing(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-200 p-5 mb-5">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-indigo-900 flex items-center">
          <Sparkles className="w-4 h-4 mr-1.5 text-indigo-500" /> 今日訊息摘要
          {summary?.upTo && <span className="ml-2 text-xs font-normal text-indigo-400">統計到 {summary.upTo}</span>}
        </h3>
        <button
          onClick={refresh}
          disabled={refreshing}
          className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1 ${refreshing ? 'bg-gray-200 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> {refreshing ? '整理中…' : '立即更新'}
        </button>
      </div>
      {summary?.summary ? (
        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{summary.summary}</div>
      ) : (
        <div className="text-sm text-gray-400">今天還沒有摘要——每晚 10:00 會自動整理，也可以按「立即更新」馬上看。</div>
      )}
      <div className="text-[11px] text-indigo-300 mt-2">AI 只摘要企業訂單相關訊息（舉辦/人數/匯款/改期/詢價），閒聊與零售訊息會自動略過</div>
    </div>
  );
};

const LineTodosView = ({ db, quotes = [] }) => {
  const [openTodos, setOpenTodos] = useState([]);
  const [doneTodos, setDoneTodos] = useState([]);
  const [showDone, setShowDone] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (!db) return;
    const unsub1 = onSnapshot(query(collection(db, 'line_todos'), where('status', '==', 'open')), (snap) => {
      setOpenTodos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsub2 = onSnapshot(query(collection(db, 'line_todos'), where('status', '==', 'done')), (snap) => {
      setDoneTodos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => { unsub1(); unsub2(); };
  }, [db]);

  const sortByAt = (arr) => arr.slice().sort((a, b) => {
    const da = toDate(a.at)?.getTime() || 0;
    const dbb = toDate(b.at)?.getTime() || 0;
    return dbb - da;
  });

  const list = useMemo(() => {
    let arr = showDone ? doneTodos : openTodos;
    if (typeFilter !== 'all') arr = arr.filter((t) => t.type === typeFilter);
    return sortByAt(arr).slice(0, showDone ? 50 : 200);
  }, [openTodos, doneTodos, showDone, typeFilter]);

  const typeCounts = useMemo(() => {
    const c = {};
    openTodos.forEach((t) => { c[t.type] = (c[t.type] || 0) + 1; });
    return c;
  }, [openTodos]);

  const markDone = async (todo) => {
    try {
      await updateDoc(doc(db, 'line_todos', todo.id), { status: 'done', doneAt: new Date().toISOString() });
    } catch (e) { console.error(e); alert('更新失敗，請再試一次'); }
  };
  const reopen = async (todo) => {
    try {
      await updateDoc(doc(db, 'line_todos', todo.id), { status: 'open' });
    } catch (e) { console.error(e); alert('更新失敗，請再試一次'); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <MessageSquare className="mr-2 text-green-600" /> LINE 待辦
            {openTodos.length > 0 && <span className="ml-2 bg-red-500 text-white text-sm rounded-full px-2.5 py-0.5">{openTodos.length}</span>}
          </h2>
          <p className="text-gray-500 text-sm mt-1">這不是未回覆清單——回客人照舊在 LINE 上。這裡是「回完之後要回頭改系統」的重點整理：確定舉辦→改已回簽、收到款→記訂金/尾款，直接在卡片上按「套用到報價單」。</p>
        </div>
        <button onClick={() => setShowDone(!showDone)} className={`text-sm px-3 py-1.5 rounded-full border ${showDone ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300'}`}>
          {showDone ? '← 回到待處理' : `已完成 (${doneTodos.length})`}
        </button>
      </div>

      {/* ★ 今日摘要 */}
      <DailySummaryCard db={db} />

      {/* 類型篩選 */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button onClick={() => setTypeFilter('all')} className={`text-xs px-3 py-1 rounded-full border ${typeFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
          全部 {!showDone && openTodos.length > 0 ? `(${openTodos.length})` : ''}
        </button>
        {Object.keys(TYPE_STYLE).map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`text-xs px-3 py-1 rounded-full border ${typeFilter === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
            {t} {!showDone && typeCounts[t] ? `(${typeCounts[t]})` : ''}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {showDone ? '還沒有已完成的項目' : '🎉 目前沒有待處理的 LINE 訊息'}
          </div>
        ) : (
          list.map((todo) => (
            <TodoCard key={todo.id} todo={todo} onDone={markDone} onReopen={reopen} isDone={showDone} quotes={quotes} db={db} />
          ))
        )}
      </div>
    </div>
  );
};

export default LineTodosView;
