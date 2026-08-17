/**
 * LINE 待辦 — 判讀橋 (line_todos) 的員工處理介面
 * 資料來源：WordPress webhook → Claude 判讀 → Firestore line_todos
 * status: open（待處理）→ done（已處理）
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  collection, query, where, onSnapshot, doc, updateDoc,
} from 'firebase/firestore';
import {
  MessageSquare, Check, RotateCcw, Wallet, Calendar, Users, FileText, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';

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

const TodoCard = ({ todo, onDone, onReopen, isDone }) => {
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

const LineTodosView = ({ db }) => {
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
          <p className="text-gray-500 text-sm mt-1">客服訊息由 AI 自動判讀，處理完請按「處理完成」。回覆客人仍照舊在 LINE 上人工回。</p>
        </div>
        <button onClick={() => setShowDone(!showDone)} className={`text-sm px-3 py-1.5 rounded-full border ${showDone ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300'}`}>
          {showDone ? '← 回到待處理' : `已完成 (${doneTodos.length})`}
        </button>
      </div>

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
            <TodoCard key={todo.id} todo={todo} onDone={markDone} onReopen={reopen} isDone={showDone} />
          ))
        )}
      </div>
    </div>
  );
};

export default LineTodosView;
