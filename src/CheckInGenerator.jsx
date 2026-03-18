// ========== 簽到表產生器 ==========
import React, { useState, useMemo, useRef } from 'react';
import { Printer, Calendar, Users, Download, ChevronLeft, ChevronRight, FileText, Check } from 'lucide-react';

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });

const getSafeDate = (val) => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (val.seconds) return new Date(val.seconds * 1000);
  if (typeof val === 'string' || typeof val === 'number') return new Date(val);
  return new Date();
};

const formatDateWithDay = (dateStr) => {
  if (!dateStr) return '';
  const dayMap = ['日', '一', '二', '三', '四', '五', '六'];
  try {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd} (${dayMap[d.getDay()]})`;
  } catch { return dateStr; }
};

const CheckInGenerator = ({ quotes, regularClasses }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10) // 預設明天
  );
  const [extraRows, setExtraRows] = useState(5); // 額外空白行數
  const [selectedEvents, setSelectedEvents] = useState(new Set());
  const printRef = useRef(null);

  // 找出該日期的所有課程
  const dayEvents = useMemo(() => {
    const events = [];

    // 從報價單找
    quotes.forEach(q => {
      if (q.status === 'draft') return;
      if (!q.items) return;
      q.items.forEach((item, idx) => {
        if (item.eventDate === selectedDate) {
          events.push({
            id: `q_${q.id}_${idx}`,
            type: 'enterprise',
            title: q.clientInfo?.companyName || '企業客戶',
            courseName: item.courseName || '未定課程',
            time: item.timeRange || item.startTime || '',
            peopleCount: parseInt(item.peopleCount) || 0,
            address: item.address || '',
            contactPerson: q.clientInfo?.contactPerson || '',
            phone: q.clientInfo?.phone || '',
            note: item.itemNote || '',
          });
        }
      });
    });

    // 從常態課找
    regularClasses.forEach(r => {
      if (r.date === selectedDate) {
        events.push({
          id: `r_${r.id}`,
          type: 'regular',
          title: r.courseName || r.title || '常態課',
          courseName: r.courseName || '常態課',
          time: r.time || '',
          peopleCount: 0,
          address: r.location || '',
          note: '',
        });
      }
    });

    return events.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [quotes, regularClasses, selectedDate]);

  // 日期導航
  const goDay = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
    setSelectedEvents(new Set());
  };

  // 全選/取消全選
  const toggleAll = () => {
    if (selectedEvents.size === dayEvents.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(dayEvents.map(e => e.id)));
    }
  };

  // 切換選取
  const toggleEvent = (id) => {
    setSelectedEvents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 產生 PDF
  const handlePrint = async () => {
    const el = document.getElementById('checkin-print-area');
    if (!el) return;

    if (!window.html2pdf) {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
      } catch {
        alert('無法載入 PDF 工具');
        return;
      }
    }

    const opt = {
      margin: 10,
      filename: `簽到表_${selectedDate}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css'] },
    };

    window.html2pdf().from(el).set(opt).save();
  };

  // 直接列印
  const handleDirectPrint = () => {
    const el = document.getElementById('checkin-print-area');
    if (!el) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>簽到表 ${selectedDate}</title>
      <style>
        body { font-family: 'Microsoft JhengHei', sans-serif; margin: 0; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { border: 1px solid #333; padding: 8px 12px; text-align: left; }
        th { background: #f0f0f0; font-weight: bold; }
        h1 { font-size: 20px; margin-bottom: 5px; }
        h2 { font-size: 16px; color: #666; margin-top: 0; }
        .header-info { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .header-info span { font-size: 14px; color: #555; }
        .page-break { page-break-after: always; }
        @media print { body { padding: 0; } }
      </style></head><body>
      ${el.innerHTML}
      </body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const eventsToRender = dayEvents.filter(e => selectedEvents.has(e.id));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* 標題 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FileText className="mr-2 text-blue-600" />
            簽到表產生器
          </h2>
          <p className="text-gray-500 text-sm mt-1">選擇日期，一鍵產出可列印簽到表</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDirectPrint} disabled={eventsToRender.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
            <Printer className="w-4 h-4 mr-1" /> 直接列印
          </button>
          <button onClick={handlePrint} disabled={eventsToRender.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded font-bold text-sm hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
            <Download className="w-4 h-4 mr-1" /> 下載 PDF
          </button>
        </div>
      </div>

      {/* 日期選擇 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => goDay(-1)} className="p-2 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5" /></button>
          <div className="text-center">
            <input type="date" className="text-xl font-bold text-gray-800 border-none focus:outline-none text-center cursor-pointer"
              value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedEvents(new Set()); }} />
            <div className="text-sm text-gray-500">{formatDateWithDay(selectedDate)}</div>
          </div>
          <button onClick={() => goDay(1)} className="p-2 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* 課程列表 */}
      {dayEvents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>此日期無排定課程</p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">找到 {dayEvents.length} 個課程</span>
            <div className="flex gap-2 items-center">
              <label className="text-sm text-gray-600">
                額外空白行：
                <input type="number" className="w-16 border rounded px-2 py-1 ml-1 text-sm" min="0" max="20"
                  value={extraRows} onChange={(e) => setExtraRows(parseInt(e.target.value) || 0)} />
              </label>
              <button onClick={toggleAll} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 font-bold">
                {selectedEvents.size === dayEvents.length ? '取消全選' : '全選'}
              </button>
            </div>
          </div>

          {dayEvents.map(event => (
            <div key={event.id}
              className={`bg-white rounded-lg shadow border-l-4 p-4 cursor-pointer transition-colors ${
                selectedEvents.has(event.id) ? 'border-l-blue-500 bg-blue-50' : 'border-l-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => toggleEvent(event.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    selectedEvents.has(event.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                  }`}>
                    {selectedEvents.has(event.id) && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{event.title}</div>
                    <div className="text-sm text-gray-500">{event.courseName} {event.time && `| ${event.time}`}</div>
                    {event.address && <div className="text-xs text-gray-400 mt-1">📍 {event.address}</div>}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    event.type === 'enterprise' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {event.type === 'enterprise' ? '企業' : '常態'}
                  </span>
                  {event.peopleCount > 0 && (
                    <div className="text-sm text-gray-600 mt-1">{event.peopleCount} 人</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 列印預覽區（隱藏，列印時用） */}
      <div id="checkin-print-area" className="hidden print:block">
        {eventsToRender.map((event, ei) => (
          <div key={event.id} style={{ pageBreakAfter: ei < eventsToRender.length - 1 ? 'always' : 'auto' }}>
            <h1 style={{ fontSize: '22px', marginBottom: '5px', fontFamily: 'Microsoft JhengHei, sans-serif' }}>
              下班隨手作 簽到表
            </h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#555', fontFamily: 'Microsoft JhengHei, sans-serif' }}>
              <span>日期：{formatDateWithDay(selectedDate)}</span>
              <span>課程：{event.courseName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px', color: '#555', fontFamily: 'Microsoft JhengHei, sans-serif' }}>
              <span>{event.type === 'enterprise' ? `客戶：${event.title}` : `場次：${event.title}`}</span>
              <span>時間：{event.time || '全天'}</span>
            </div>
            {event.address && (
              <div style={{ marginBottom: '15px', fontSize: '13px', color: '#777', fontFamily: 'Microsoft JhengHei, sans-serif' }}>
                地點：{event.address}
              </div>
            )}
            {(event.contactPerson || event.phone) && (
              <div style={{ marginBottom: '15px', fontSize: '13px', color: '#777', fontFamily: 'Microsoft JhengHei, sans-serif' }}>
                聯絡人：{event.contactPerson || '-'} | 電話：{event.phone || '-'}
              </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Microsoft JhengHei, sans-serif' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #333', padding: '8px', background: '#f0f0f0', width: '50px', textAlign: 'center' }}>#</th>
                  <th style={{ border: '1px solid #333', padding: '8px', background: '#f0f0f0' }}>姓名</th>
                  <th style={{ border: '1px solid #333', padding: '8px', background: '#f0f0f0', width: '80px', textAlign: 'center' }}>簽到</th>
                  <th style={{ border: '1px solid #333', padding: '8px', background: '#f0f0f0' }}>備註</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: (event.peopleCount || 10) + extraRows }, (_, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', color: '#999' }}>{i + 1}</td>
                    <td style={{ border: '1px solid #333', padding: '8px', minWidth: '150px' }}>&nbsp;</td>
                    <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>☐</td>
                    <td style={{ border: '1px solid #333', padding: '8px', minWidth: '150px' }}>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {event.note && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#888', fontFamily: 'Microsoft JhengHei, sans-serif' }}>
                備註：{event.note}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 預覽 */}
      {eventsToRender.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-gray-700 mb-3">📋 預覽（已選 {eventsToRender.length} 份）</h3>
          {eventsToRender.map(event => (
            <div key={event.id} className="bg-white border rounded-lg p-6 mb-4 shadow-sm">
              <div className="flex justify-between items-center border-b pb-3 mb-3">
                <div>
                  <div className="font-bold text-lg">下班隨手作 簽到表</div>
                  <div className="text-sm text-gray-500">{event.courseName} | {event.title}</div>
                </div>
                <div className="text-sm text-gray-500 text-right">
                  <div>{formatDateWithDay(selectedDate)}</div>
                  <div>{event.time || '全天'}</div>
                </div>
              </div>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 w-12 text-center">#</th>
                    <th className="border p-2 text-left">姓名</th>
                    <th className="border p-2 w-16 text-center">簽到</th>
                    <th className="border p-2 text-left">備註</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.min((event.peopleCount || 10) + extraRows, 8) }, (_, i) => (
                    <tr key={i}>
                      <td className="border p-2 text-center text-gray-400">{i + 1}</td>
                      <td className="border p-2">&nbsp;</td>
                      <td className="border p-2 text-center">☐</td>
                      <td className="border p-2">&nbsp;</td>
                    </tr>
                  ))}
                  {(event.peopleCount || 10) + extraRows > 8 && (
                    <tr><td colSpan={4} className="border p-2 text-center text-gray-400 text-xs">... 共 {(event.peopleCount || 10) + extraRows} 行（預覽僅顯示前 8 行）</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckInGenerator;
