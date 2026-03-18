// 課程登記表匯入腳本
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import ExcelJS from 'exceljs';

const firebaseConfig = {
  apiKey: 'AIzaSyChK75njpy0zmk3wPfq0vnlORfTVFPkxAo',
  authDomain: 'xiabenhow-quote.firebaseapp.com',
  projectId: 'xiabenhow-quote',
  storageBucket: 'xiabenhow-quote.firebasestorage.app',
  messagingSenderId: '572897867092',
  appId: '1:572897867092:web:0be379e659e1a0613544c1',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const formatDate = (val) => {
  if (!val) return '';
  if (val instanceof Date) {
    return `${val.getFullYear()}-${String(val.getMonth()+1).padStart(2,'0')}-${String(val.getDate()).padStart(2,'0')}`;
  }
  try { const dt = new Date(String(val)); if (!isNaN(dt.getTime())) return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; } catch {}
  return String(val).slice(0, 10);
};
const clean = (v) => v ? String(v).trim() : '';

async function importCourse() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('import-course.xlsx');
  
  let total = 0, batchNum = 0, batch = writeBatch(db), batchSize = 0;
  const pendingBatches = [];

  for (const ws of workbook.worksheets) {
    console.log(`處理 sheet: ${ws.name}`);
    
    // 課程登記表欄位：日期|課程名稱|人數|地點|學員|報名平台|登記人員|填寫日期|備註|有無發票
    ws.eachRow((row, rowNumber) => {
      if (rowNumber <= 1) return;
      const vals = row.values;
      
      const dateStr = formatDate(vals[1]);
      const courseName = clean(vals[2]);
      if (!dateStr || !courseName || courseName === 'xxx' || courseName.includes('示範')) return;
      
      const record = {
        type: 'course',
        date: dateStr,
        courseName,
        peopleCount: clean(vals[3]) || '1',
        location: clean(vals[4]),
        studentName: clean(vals[5]),
        platform: clean(vals[6]),
        registeredBy: clean(vals[7]),
        registeredDate: formatDate(vals[8]),
        note: clean(vals[9]),
        hasInvoice: clean(vals[10]) || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        _importedFrom: ws.name,
      };
      
      const ref = doc(collection(db, 'registrations_course'));
      batch.set(ref, record);
      batchSize++;
      total++;
      
      if (batchSize >= 400) {
        batchNum++;
        const b = batch, n = batchNum, s = batchSize;
        pendingBatches.push(
          b.commit().then(() => console.log(`  Batch ${n}: ${s} 筆 ✓`))
            .catch(err => console.error(`  Batch ${n} error:`, err.message))
        );
        // Wait between batches to avoid rate limit
        if (batchNum % 10 === 0) {
          pendingBatches.push(new Promise(r => setTimeout(r, 2000)));
        }
        batch = writeBatch(db);
        batchSize = 0;
      }
    });
  }
  
  if (batchSize > 0) {
    batchNum++;
    const n = batchNum, s = batchSize;
    pendingBatches.push(
      batch.commit().then(() => console.log(`  Batch ${n}: ${s} 筆 ✓`))
        .catch(err => console.error(`  Batch ${n} error:`, err.message))
    );
  }
  
  await Promise.all(pendingBatches);
  await new Promise(r => setTimeout(r, 3000));
  console.log(`\n✅ 課程登記表匯入完成！共 ${total} 筆`);
  process.exit(0);
}

importCourse().catch(err => { console.error('匯入失敗:', err); process.exit(1); });
