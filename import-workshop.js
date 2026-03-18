// 隨手作登記表匯入腳本
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
  const s = String(val);
  try {
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  } catch {}
  return s.slice(0, 10);
};

const clean = (v) => v ? String(v).trim() : '';

async function importWorkshop() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('import-workshop.xlsx');
  
  let total = 0;
  let batchNum = 0;
  let batch = writeBatch(db);
  let batchSize = 0;

  const commitBatch = async (b, num, size) => {
    try {
      await b.commit();
      console.log(`  Batch ${num}: ${size} 筆 ✓`);
    } catch (err) {
      console.error(`  Batch ${num} error:`, err.message);
    }
  };

  for (const ws of workbook.worksheets) {
    console.log(`處理 sheet: ${ws.name}`);
    
    // 隨手作登記表欄位：日期|課程名稱|人數|時間|金額|學員|報名平台|入帳|登記人員|填寫日期|備註|有無發票
    ws.eachRow((row, rowNumber) => {
      if (rowNumber <= 1) return;
      const vals = row.values; // 1-indexed
      
      const dateStr = formatDate(vals[1]);
      const courseName = clean(vals[2]);
      if (!dateStr || !courseName || courseName === 'xxx' || courseName.includes('示範') || courseName === '錢箱回歸') return;
      
      const record = {
        type: 'workshop',
        date: dateStr,
        courseName: courseName,
        peopleCount: clean(vals[3]) || '1',
        time: clean(vals[4]),
        amount: clean(vals[5]),
        studentName: clean(vals[6]),
        platform: clean(vals[7]),
        paymentStatus: clean(vals[8]) === '是' ? '已入帳' : clean(vals[8]) || '',
        registeredBy: clean(vals[9]),
        registeredDate: formatDate(vals[10]),
        note: clean(vals[11]),
        hasInvoice: clean(vals[12]) || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        _importedFrom: ws.name,
      };
      
      const ref = doc(collection(db, 'registrations_workshop'));
      batch.set(ref, record);
      batchSize++;
      total++;
      
      if (batchSize >= 450) {
        batchNum++;
        commitBatch(batch, batchNum, batchSize);
        batch = writeBatch(db);
        batchSize = 0;
      }
    });
  }
  
  if (batchSize > 0) {
    batchNum++;
    await commitBatch(batch, batchNum, batchSize);
  }
  
  await new Promise(r => setTimeout(r, 5000));
  console.log(`\n✅ 隨手作登記表匯入完成！共 ${total} 筆`);
  process.exit(0);
}

importWorkshop().catch(err => { console.error('匯入失敗:', err); process.exit(1); });
