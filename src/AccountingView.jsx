// ========== 帳務對帳模組 ==========
import React, { useState, useMemo, useCallback } from 'react';
import {
  Upload, Download, Check, X, Search, DollarSign, AlertCircle, 
  ChevronDown, Filter, FileText, Building2, CreditCard, Wallet
} from 'lucide-react';

const INPUT_CLASS = 'w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm';

// CSV 解析器
const parseCSV = (text) => {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  return lines.slice(1).map(line => {
    const vals = [];
    let current = '';
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === ',' && !inQuote) { vals.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    vals.push(current.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
};

// 智慧比對：金額相近 + 名稱模糊匹配
const fuzzyMatch = (bankRow, quotes, clients) => {
  const amount = parseFloat(bankRow.amount) || 0;
  if (amount <= 0) return [];

  const suggestions = [];
  const bankNote = (bankRow.note || bankRow.memo || bankRow.remark || '').toLowerCase();

  quotes.forEach(q => {
    if (q.status === 'draft') return;
    const total = q.totalAmount || 0;
    const half = Math.round(total / 2);
    const name = (q.clientInfo?.companyName || '').toLowerCase();

    // 全額匹配
    if (Math.abs(amount - total) <= 10) {
      suggestions.push({ quote: q, type: '全額', confidence: bankNote && name && bankNote.includes(name.slice(0, 2)) ? 95 : 70 });
    }
    // 訂金（50%）匹配
    if (Math.abs(amount - half) <= 10) {
      suggestions.push({ quote: q, type: '訂金(50%)', confidence: bankNote && name && bankNote.includes(name.slice(0, 2)) ? 90 : 60 });
    }
    // 備註包含公司名
    if (bankNote && name.length >= 2 && bankNote.includes(name.slice(0, 2))) {
      if (!suggestions.find(s => s.quote.id === q.id)) {
        suggestions.push({ quote: q, type: '名稱匹配', confidence: 50 });
      }
    }
  });

  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
};

const AccountingView = ({ quotes, clients, onUpdateQuote }) => {
  const [bankRows, setBankRows] = useState([]);
  const [ecpayRows, setEcpayRows] = useState([]);
  const [linepayRows, setLinepayRows] = useState([]);
  const [matchResults, setMatchResults] = useState({}); // { rowIndex: { confirmed: true, quoteId, type } }
  const [activeTab, setActiveTab] = useState('bank'); // bank | ecpay | linepay | summary
  const [filterMonth, setFilterMonth] = useState('');

  // 計算應收帳款
  const receivables = useMemo(() => {
    const confirmed = quotes.filter(q => q.status === 'confirmed' || q.status === 'paid');
    let totalDue = 0, totalReceived = 0;
    confirmed.forEach(q => {
      totalDue += q.totalAmount || 0;
      totalReceived += parseInt(q.depositAmount || 0);
      if (q.status === 'closed') totalReceived += (q.totalAmount || 0) - parseInt(q.depositAmount || 0);
    });
    return { totalDue, totalReceived, outstanding: totalDue - totalReceived };
  }, [quotes]);

  // 上傳 CSV 檔案
  const handleFileUpload = useCallback((e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const rows = parseCSV(text);
      
      // 嘗試標準化欄位名
      const normalized = rows.map((row, idx) => {
        // 猜測金額欄位
        const amountKey = Object.keys(row).find(k => 
          k.includes('金額') || k.includes('amount') || k.includes('Amount') || k.includes('交易金額') || k.includes('入帳金額')
        );
        // 猜測備註欄位
        const noteKey = Object.keys(row).find(k => 
          k.includes('備註') || k.includes('摘要') || k.includes('memo') || k.includes('Memo') || k.includes('附言')
        );
        // 猜測日期欄位
        const dateKey = Object.keys(row).find(k => 
          k.includes('日期') || k.includes('date') || k.includes('Date') || k.includes('交易日')
        );
        // 猜測訂單編號
        const orderKey = Object.keys(row).find(k => 
          k.includes('訂單') || k.includes('order') || k.includes('Order') || k.includes('編號')
        );

        return {
          ...row,
          _idx: idx,
          amount: row[amountKey] || '',
          note: row[noteKey] || '',
          date: row[dateKey] || '',
          orderId: row[orderKey] || '',
        };
      }).filter(r => {
        const amt = parseFloat(r.amount);
        return !isNaN(amt) && amt > 0;
      });

      if (type === 'bank') setBankRows(normalized);
      else if (type === 'ecpay') setEcpayRows(normalized);
      else setLinepayRows(normalized);
    };
    reader.readAsText(file);
    e.target.value = null;
  }, []);

  // 自動比對
  const handleAutoMatch = useCallback((type) => {
    const rows = type === 'bank' ? bankRows : type === 'ecpay' ? ecpayRows : linepayRows;
    const newResults = { ...matchResults };
    
    rows.forEach((row, idx) => {
      const key = `${type}_${idx}`;
      if (newResults[key]?.confirmed) return; // 已確認的跳過
      
      const suggestions = fuzzyMatch(row, quotes, clients);
      if (suggestions.length > 0) {
        newResults[key] = { 
          suggestions, 
          confirmed: false,
          selectedQuoteId: suggestions[0].quote.id,
          selectedType: suggestions[0].type,
        };
      }
    });
    
    setMatchResults(newResults);
  }, [bankRows, ecpayRows, linepayRows, quotes, clients, matchResults]);

  // 確認配對
  const confirmMatch = (key, quoteId, type) => {
    setMatchResults(prev => ({
      ...prev,
      [key]: { ...prev[key], confirmed: true, selectedQuoteId: quoteId, selectedType: type },
    }));
  };

  // 取消配對
  const cancelMatch = (key) => {
    setMatchResults(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const renderBankTab = () => {
    const rows = activeTab === 'bank' ? bankRows : activeTab === 'ecpay' ? ecpayRows : linepayRows;
    const typeLabel = activeTab === 'bank' ? '玉山銀行' : activeTab === 'ecpay' ? '綠界' : 'LINE Pay';

    return (
      <div className="space-y-4">
        {/* 上傳區 */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 font-medium mb-2">上傳{typeLabel}明細 CSV</p>
          <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 text-sm font-bold">
            選擇檔案
            <input type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUpload(e, activeTab)} />
          </label>
          {rows.length > 0 && (
            <p className="text-green-600 text-sm mt-2 font-bold">已載入 {rows.length} 筆交易</p>
          )}
        </div>

        {rows.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{rows.length} 筆交易</span>
              <button
                onClick={() => handleAutoMatch(activeTab)}
                className="px-4 py-2 bg-purple-600 text-white rounded text-sm font-bold hover:bg-purple-700 flex items-center"
              >
                <Search className="w-4 h-4 mr-1" /> 智慧比對
              </button>
            </div>

            <div className="space-y-3">
              {rows.map((row, idx) => {
                const key = `${activeTab}_${idx}`;
                const match = matchResults[key];
                const amount = parseFloat(row.amount) || 0;

                return (
                  <div key={idx} className={`bg-white border rounded-lg p-4 ${match?.confirmed ? 'border-green-300 bg-green-50' : match ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-500">{row.date}</div>
                        <div className="font-bold text-lg text-gray-800">${amount.toLocaleString()}</div>
                        {row.note && <div className="text-sm text-gray-600 mt-1">備註：{row.note}</div>}
                        {row.orderId && <div className="text-xs text-gray-400">訂單：{row.orderId}</div>}
                      </div>
                      <div className="text-right">
                        {match?.confirmed ? (
                          <div className="flex items-center text-green-700">
                            <Check className="w-4 h-4 mr-1" />
                            <span className="text-sm font-bold">已確認</span>
                          </div>
                        ) : !match ? (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">待比對</span>
                        ) : null}
                      </div>
                    </div>

                    {/* 比對建議 */}
                    {match && !match.confirmed && match.suggestions && (
                      <div className="mt-3 pt-3 border-t border-yellow-200">
                        <div className="text-xs font-bold text-yellow-800 mb-2">🔍 系統建議：</div>
                        {match.suggestions.map((s, si) => (
                          <div key={si} className="flex items-center justify-between bg-white p-2 rounded border border-yellow-100 mb-1">
                            <div className="text-sm">
                              <span className="font-medium">{s.quote.clientInfo?.companyName}</span>
                              <span className="text-gray-500 ml-2">${(s.quote.totalAmount || 0).toLocaleString()}</span>
                              <span className="text-xs text-purple-600 ml-2 bg-purple-50 px-1 rounded">{s.type}</span>
                              <span className="text-xs text-gray-400 ml-2">{s.confidence}% 信心度</span>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => confirmMatch(key, s.quote.id, s.type)}
                                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                              >✓ 是</button>
                              <button 
                                onClick={() => cancelMatch(key)}
                                className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                              >✗ 不是</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {match?.confirmed && (
                      <div className="mt-2 text-sm text-green-700">
                        → {quotes.find(q => q.id === match.selectedQuoteId)?.clientInfo?.companyName || '未知'} ({match.selectedType})
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderSummary = () => {
    const confirmedCount = Object.values(matchResults).filter(m => m.confirmed).length;
    const pendingCount = Object.values(matchResults).filter(m => !m.confirmed).length;
    const unmatchedBank = bankRows.length - Object.keys(matchResults).filter(k => k.startsWith('bank_')).length;

    return (
      <div className="space-y-6">
        {/* 應收帳款卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
            <div className="text-sm text-gray-500">應收總額</div>
            <div className="text-2xl font-bold text-blue-700 mt-1">${receivables.totalDue.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <div className="text-sm text-gray-500">已收金額</div>
            <div className="text-2xl font-bold text-green-700 mt-1">${receivables.totalReceived.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500">
            <div className="text-sm text-gray-500">待收金額</div>
            <div className="text-2xl font-bold text-orange-700 mt-1">${receivables.outstanding.toLocaleString()}</div>
          </div>
        </div>

        {/* 對帳統計 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-700 text-lg mb-4">對帳進度</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-700">{bankRows.length + ecpayRows.length + linepayRows.length}</div>
              <div className="text-xs text-gray-500 mt-1">已上傳交易</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-700">{confirmedCount}</div>
              <div className="text-xs text-gray-500 mt-1">已確認配對</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-700">{pendingCount}</div>
              <div className="text-xs text-gray-500 mt-1">待確認</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-700">{unmatchedBank}</div>
              <div className="text-xs text-gray-500 mt-1">未比對</div>
            </div>
          </div>
        </div>

        {/* 待收款企業清單 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-700 text-lg mb-4">待收款企業</h3>
          <div className="space-y-2">
            {quotes
              .filter(q => q.status === 'paid' || q.status === 'confirmed')
              .map(q => {
                const deposit = parseInt(q.depositAmount || 0);
                const remaining = (q.totalAmount || 0) - deposit;
                if (remaining <= 0) return null;
                return (
                  <div key={q.id} className="flex justify-between items-center p-3 bg-orange-50 rounded border border-orange-100">
                    <div>
                      <div className="font-medium text-gray-800">{q.clientInfo?.companyName || '未知'}</div>
                      <div className="text-xs text-gray-500">總額 ${(q.totalAmount || 0).toLocaleString()} | 已收訂金 ${deposit.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-700">${remaining.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">待收</div>
                    </div>
                  </div>
                );
              })
              .filter(Boolean)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Wallet className="mr-2 text-blue-600" />
            帳務對帳
          </h2>
          <p className="text-gray-500 text-sm mt-1">上傳金流明細，智慧比對報價單</p>
        </div>
      </div>

      {/* Tab 切換 */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 flex-wrap">
        {[
          { key: 'summary', label: '📊 總覽', icon: null },
          { key: 'bank', label: '🏦 玉山銀行', icon: null },
          { key: 'ecpay', label: '💳 綠界', icon: null },
          { key: 'linepay', label: '📱 LINE Pay', icon: null },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              activeTab === tab.key ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
            {tab.key === 'bank' && bankRows.length > 0 && <span className="ml-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">{bankRows.length}</span>}
            {tab.key === 'ecpay' && ecpayRows.length > 0 && <span className="ml-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">{ecpayRows.length}</span>}
            {tab.key === 'linepay' && linepayRows.length > 0 && <span className="ml-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">{linepayRows.length}</span>}
          </button>
        ))}
      </div>

      {/* 內容 */}
      {activeTab === 'summary' ? renderSummary() : renderBankTab()}
    </div>
  );
};

export default AccountingView;
