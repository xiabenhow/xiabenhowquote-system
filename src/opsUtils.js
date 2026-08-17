/**
 * opsUtils — BOM(配方) 與庫存連動的共用邏輯
 * bom 集合：每門課一筆 { course, category, aliases:[], materials:[{t, mode, n, m2}] }
 *   mode: 'pp'=每人一份×n, 'shared'=n人共用1份, 'fixed'=固定帶n份
 * materials 集合：材料主檔 { name, category, stock, safetyStock, unit, source, leadDays, orderAheadDays }
 */

// 課程名稱正規化（與匯入 BOM 時相同邏輯）
const COURSE_PREFIXES = /^(高雄|台中|台南|新竹)?(手作課程|平板課程|手作DIY材料包|線上體驗|手作DIY|企業)[-—－:：\s]*/;
export function normCourse(s) {
  if (!s) return '';
  let t = String(s).replace(/\s+/g, '');
  t = t.replace(/[【\[].*?[】\]]/g, '');
  for (let i = 0; i < 3; i++) t = t.replace(COURSE_PREFIXES, '');
  t = t.replace(/[（(].*?[)）]/g, '');
  return t;
}

// 在 bom 清單中找對應課程（course 全等 → alias 全等 → 互相包含）
export function matchBom(bomList, courseName) {
  const key = normCourse(courseName);
  if (!key) return null;
  for (const b of bomList) {
    if (normCourse(b.course) === key) return b;
  }
  for (const b of bomList) {
    if ((b.aliases || []).some((a) => normCourse(a) === key)) return b;
  }
  for (const b of bomList) {
    const bk = normCourse(b.course);
    if (bk.length >= 3 && (key.includes(bk) || bk.includes(key))) return b;
    if ((b.aliases || []).some((a) => {
      const ak = normCourse(a);
      return ak.length >= 3 && (key.includes(ak) || ak.includes(key));
    })) return b;
  }
  return null;
}

// 材料名稱正規化（用來對庫存主檔）
export function normMat(s) {
  if (!s) return '';
  let t = String(s).replace(/[（(].*?[)）]/g, '');
  t = t.replace(/[xX×]\s*\d+(\.\d+)?\s*人.*$/, '');
  t = t.replace(/[xX×]\s*\d+(\.\d+)?\s*(份|支|條|個|台|隻|罐|包|捲|張)?.*$/, '');
  return t.replace(/\s+/g, '').trim();
}

// 顯示用材料名（去掉 xN人 尾巴，保留括號說明）
export function matLabel(t) {
  return String(t)
    .replace(/[xX×]\s*\d+(\.\d+)?\s*人\s*$/, '')
    .replace(/[xX×]\s*\d+(\.\d+)?\s*(份|支|條|個|台|隻|罐|包|捲|張)?\s*$/, '')
    .trim() || String(t);
}

// 依人數計算需求量
export function calcQty(m, people) {
  const p = Number(people) || 0;
  const n = Number(m.n) || 1;
  if (m.mode === 'pp') return Math.ceil(p * n);
  if (m.mode === 'shared') return Math.max(1, Math.ceil(p / Math.max(1, n)));
  return Math.max(1, Math.round(n)); // fixed
}

// 建立 材料正規名 → 主檔 doc 的索引
export function buildMatIndex(materials) {
  const idx = {};
  materials.forEach((m) => {
    const k = normMat(m.name);
    if (k && !idx[k]) idx[k] = m;
  });
  return idx;
}

// BOM 材料 ↔ 庫存主檔 連結
// 只允許：全等，或「主檔名包含配方名」（主檔較具體，如 配方「鐵絲」→主檔「鐵絲 綠色#26」）
// 不允許「配方名包含主檔名」：會把「水晶樹講義」錯連到「水晶樹（商品）」而扣錯庫存
export function linkMat(matIndex, bomMatName) {
  const k = normMat(bomMatName);
  if (!k) return null;
  if (matIndex[k]) return matIndex[k];
  if (k.length >= 3) {
    let best = null;
    for (const key of Object.keys(matIndex)) {
      if (key.length >= k.length && key.includes(k)) {
        if (!best || key.length < normMat(best.name).length) best = matIndex[key];
      }
    }
    return best;
  }
  return null;
}

// 叫貨提前天數：主檔有填就用主檔，否則 1688=24天、台灣=9天
export function aheadDays(mat) {
  const d = Number(mat?.orderAheadDays) || 0;
  if (d > 0) return d;
  if ((mat?.source || '').includes('1688')) return 24;
  return 9;
}

export function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function addDaysStr(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + days);
  return fmtDate(d);
}

// 展開報價單 → 課程場次（含 BOM 需求）
// 回傳 [{quoteId, itemIdx, clientName, courseName, date, time, people, bom, needs:[{t,label,qty,mat,enough}]}]
export function expandClassNeeds(quotes, bomList, matIndex, fromDate, toDate) {
  const rows = [];
  quotes
    .filter((q) => q.status === 'confirmed' || q.status === 'paid')
    .forEach((q) => {
      (q.items || []).forEach((item, idx) => {
        const d = item.eventDate;
        if (!d) return;
        if (fromDate && d < fromDate) return;
        if (toDate && d > toDate) return;
        const bom = matchBom(bomList, item.courseName);
        const needs = bom
          ? bom.materials.map((m) => {
              const qty = calcQty(m, item.peopleCount);
              const mat = linkMat(matIndex, m.t);
              return {
                t: m.t,
                label: matLabel(m.t),
                qty,
                mat,
                enough: mat ? Number(mat.stock || 0) >= qty : null,
              };
            })
          : [];
        rows.push({
          quoteId: q.id,
          itemIdx: idx,
          clientName: q.clientInfo?.companyName || '',
          courseName: item.courseName,
          date: d,
          time: item.timeRange || item.startTime || '',
          people: item.peopleCount,
          bom,
          needs,
          prepData: q.prepData?.[idx] || {},
          quote: q,
        });
      });
    });
  return rows.sort((a, b) => (a.date > b.date ? 1 : -1));
}
