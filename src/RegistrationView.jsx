// ========== 統一登記表系統 ==========
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Filter, Edit, Trash2, X, Save, ChevronDown, Download,
  Package, BookOpen, Sparkles, Calendar, User, Truck, FileText, Eye
} from 'lucide-react';
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp, where
} from 'firebase/firestore';

const INPUT_CLASS = 'w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm';
const LABEL_CLASS = 'block text-sm font-bold text-gray-700 mb-1';

const PLATFORMS = ['XIA', 'PIN', 'ACC', 'KKD', 'NIC', 'LINE', 'FB', '電話', '路過', '現場'];
const SHIPPING_METHODS = ['郵局', '統一7-11', '全家', '黑貓', '順豐', '萊爾富', 'OK', '現場', '專送'];
const PAYMENT_STATUS = ['未入帳', '已入帳', '退款'];

const TAB_CONFIG = {
  product: {
    label: '📦 產品出貨',
    color: 'blue',
    icon: Package,
    fields: ['date', 'productName', 'quantity', 'platform', 'customerName', 'orderId', 'shippingDate', 'shippingMethod', 'trackingNo', 'registeredBy', 'note'],
  },
  course: {
    label: '👩‍🏫 課程登記',
    color: 'green',
    icon: BookOpen,
    fields: ['date', 'courseName', 'peopleCount', 'location', 'studentName', 'platform', 'registeredBy', 'registeredDate', 'note', 'hasInvoice'],
  },
  workshop: {
    label: '🎨 隨手作',
    color: 'purple',
    icon: Sparkles,
    fields: ['date', 'courseName', 'peopleCount', 'time', 'amount', 'studentName', 'platform', 'paymentStatus', 'registeredBy', 'registeredDate', 'note', 'hasInvoice'],
  },
};

const FIELD_LABELS = {
  date: '日期',
  productName: '商品名稱',
  courseName: '課程名稱',
  quantity: '數量',
  peopleCount: '人數',
  time: '時間',
  amount: '金額',
  platform: '報名平台',
  customerName: '客戶姓名',
  studentName: '學員姓名',
  orderId: '訂單編號',
  shippingDate: '出貨日期',
  shippingMethod: '出貨管道',
  trackingNo: '包裹編號',
  registeredBy: '登記人員',
  registeredDate: '填寫日期',
  location: '地點',
  note: '備註',
  hasInvoice: '有無發票',
  paymentStatus: '入帳狀態',
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 11);

const RegistrationView = ({ db }) => {
  const [activeTab, setActiveTab] = useState('product');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');

  // 表單狀態
  const [form, setForm] = useState({});

  // 監聽 Firebase
  useEffect(() => {
    if (!db) { setLoading(false); return; }
    const collName = `registrations_${activeTab}`;
    const q = query(collection(db, collName), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [db, activeTab]);

  // 初始化表單
  const initForm = (record) => {
    const fields = TAB_CONFIG[activeTab].fields;
    const newForm = {};
    fields.forEach(f => {
      newForm[f] = record?.[f] || '';
    });
    return newForm;
  };

  // 開新增
  const handleNew = () => {
    setForm(initForm());
    setEditingRecord(null);
    setShowForm(true);
  };

  // 開編輯
  const handleEdit = (record) => {
    setForm(initForm(record));
    setEditingRecord(record);
    setShowForm(true);
  };

  // 儲存
  const handleSave = async () => {
    if (!db) return;
    const collName = `registrations_${activeTab}`;
    try {
      if (editingRecord?.id) {
        await updateDoc(doc(db, collName, editingRecord.id), { ...form, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, collName), { ...form, type: activeTab, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      setShowForm(false);
      setEditingRecord(null);
    } catch (err) {
      console.error('儲存失敗', err);
      alert('儲存失敗');
    }
  };

  // 刪除
  const handleDelete = async (record) => {
    if (!window.confirm('確定要刪除此筆記錄？')) return;
    if (!db) return;
    const collName = `registrations_${activeTab}`;
    try {
      await deleteDoc(doc(db, collName, record.id));
    } catch (err) {
      console.error('刪除失敗', err);
    }
  };

  // 篩選
  const filtered = useMemo(() => {
    return records.filter(r => {
      const term = searchTerm.toLowerCase();
      const matchSearch = !term || 
        Object.values(r).some(v => typeof v === 'string' && v.toLowerCase().includes(term));
      
      const matchMonth = !filterMonth || (r.date || '').startsWith(filterMonth);
      const matchPlatform = !filterPlatform || r.platform === filterPlatform;
      
      return matchSearch && matchMonth && matchPlatform;
    });
  }, [records, searchTerm, filterMonth, filterPlatform]);

  // 可用月份
  const availableMonths = useMemo(() => {
    const months = new Set();
    records.forEach(r => {
      if (r.date) {
        const m = r.date.slice(0, 7);
        if (m.match(/^\d{4}-\d{2}$/)) months.add(m);
      }
    });
    return Array.from(months).sort().reverse();
  }, [records]);

  // 匯出 CSV
  const handleExport = () => {
    const fields = TAB_CONFIG[activeTab].fields;
    const bom = '\uFEFF';
    const header = fields.map(f => FIELD_LABELS[f] || f).join(',');
    const rows = filtered.map(r => 
      fields.map(f => `"${(r[f] || '').toString().replace(/"/g, '""')}"`).join(',')
    );
    const csv = bom + header + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${TAB_CONFIG[activeTab].label.replace(/[^\w\u4e00-\u9fff]/g, '')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const config = TAB_CONFIG[activeTab];
  const fields = config.fields;

  // 表格顯示的欄位（前幾個重要的）
  const tableFields = fields.slice(0, 7);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* 標題 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FileText className="mr-2 text-blue-600" />
            統一登記表
          </h2>
          <p className="text-gray-500 text-sm mt-1">產品出貨、課程登記、隨手作報名統一管理</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-3 py-2 bg-white border border-green-600 text-green-700 rounded text-sm font-bold hover:bg-green-50 flex items-center">
            <Download className="w-4 h-4 mr-1" /> 匯出
          </button>
          <button onClick={handleNew} className="px-4 py-2 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700 flex items-center">
            <Plus className="w-4 h-4 mr-1" /> 新增登記
          </button>
        </div>
      </div>

      {/* Tab 切換 */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6">
        {Object.entries(TAB_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSearchTerm(''); setFilterMonth(''); setFilterPlatform(''); }}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1 ${
              activeTab === key ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {cfg.label}
            {activeTab === key && records.length > 0 && (
              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs ml-1">{records.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* 搜尋與篩選 */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="搜尋姓名、商品、訂單..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          <option value="">所有月份</option>
          {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
          <option value="">所有平台</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* 統計列 */}
      <div className="flex gap-4 mb-4 text-sm">
        <span className="text-gray-500">顯示 {filtered.length} / {records.length} 筆</span>
        {activeTab === 'workshop' && (
          <span className="text-green-600 font-bold">
            總金額：${filtered.reduce((sum, r) => sum + (parseInt(r.amount) || 0), 0).toLocaleString()}
          </span>
        )}
        {activeTab === 'product' && (
          <span className="text-blue-600 font-bold">
            總數量：{filtered.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0)}
          </span>
        )}
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {tableFields.map(f => (
                <th key={f} className="text-left p-3 font-bold text-gray-600 whitespace-nowrap">{FIELD_LABELS[f]}</th>
              ))}
              <th className="text-center p-3 font-bold text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={tableFields.length + 1} className="text-center py-8 text-gray-400">載入中...</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={tableFields.length + 1} className="text-center py-8 text-gray-400">尚無資料，點擊「新增登記」開始</td></tr>
            )}
            {filtered.slice(0, 100).map(r => (
              <tr key={r.id} className="border-b hover:bg-blue-50 cursor-pointer" onClick={() => handleEdit(r)}>
                {tableFields.map(f => (
                  <td key={f} className="p-3 text-gray-700 whitespace-nowrap max-w-[200px] truncate">
                    {f === 'hasInvoice' ? (r[f] === '是' || r[f] === true ? '✅' : '') :
                     f === 'amount' ? (r[f] ? `$${parseInt(r[f]).toLocaleString()}` : '') :
                     r[f] || '-'}
                  </td>
                ))}
                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center gap-1">
                    <button onClick={() => handleEdit(r)} className="px-2 py-1 text-xs bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50">
                      <Edit className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDelete(r)} className="px-2 py-1 text-xs bg-white border border-red-300 text-red-700 rounded hover:bg-red-50">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length > 100 && (
              <tr><td colSpan={tableFields.length + 1} className="text-center py-2 text-gray-400 text-xs">僅顯示前 100 筆</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 新增/編輯 Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className={`bg-blue-600 p-4 flex justify-between items-center text-white rounded-t-xl`}>
              <h3 className="font-bold text-lg">{editingRecord ? '編輯' : '新增'}{config.label}</h3>
              <button onClick={() => { setShowForm(false); setEditingRecord(null); }} className="text-white hover:text-blue-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {fields.map(f => (
                <div key={f}>
                  <label className={LABEL_CLASS}>{FIELD_LABELS[f]}</label>
                  {f === 'date' || f === 'shippingDate' || f === 'registeredDate' ? (
                    <input type="date" className={INPUT_CLASS} value={form[f] || ''} onChange={(e) => setForm(prev => ({ ...prev, [f]: e.target.value }))} />
                  ) : f === 'platform' ? (
                    <select className={INPUT_CLASS} value={form[f] || ''} onChange={(e) => setForm(prev => ({ ...prev, [f]: e.target.value }))}>
                      <option value="">選擇平台</option>
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : f === 'shippingMethod' ? (
                    <select className={INPUT_CLASS} value={form[f] || ''} onChange={(e) => setForm(prev => ({ ...prev, [f]: e.target.value }))}>
                      <option value="">選擇管道</option>
                      {SHIPPING_METHODS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : f === 'paymentStatus' ? (
                    <select className={INPUT_CLASS} value={form[f] || ''} onChange={(e) => setForm(prev => ({ ...prev, [f]: e.target.value }))}>
                      <option value="">選擇狀態</option>
                      {PAYMENT_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : f === 'hasInvoice' ? (
                    <select className={INPUT_CLASS} value={form[f] || ''} onChange={(e) => setForm(prev => ({ ...prev, [f]: e.target.value }))}>
                      <option value="">選擇</option>
                      <option value="是">是</option>
                      <option value="否">否</option>
                    </select>
                  ) : f === 'note' ? (
                    <textarea className={INPUT_CLASS} rows="2" value={form[f] || ''} onChange={(e) => setForm(prev => ({ ...prev, [f]: e.target.value }))} />
                  ) : f === 'quantity' || f === 'peopleCount' || f === 'amount' ? (
                    <input type="number" className={INPUT_CLASS} value={form[f] || ''} onChange={(e) => setForm(prev => ({ ...prev, [f]: e.target.value }))} />
                  ) : (
                    <input type="text" className={INPUT_CLASS} value={form[f] || ''} onChange={(e) => setForm(prev => ({ ...prev, [f]: e.target.value }))} />
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-2 rounded-b-xl">
              <button onClick={() => { setShowForm(false); setEditingRecord(null); }} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50">取消</button>
              <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 flex items-center">
                <Save className="w-4 h-4 mr-1" /> 儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationView;
