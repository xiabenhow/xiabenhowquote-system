// 產品登記表匯入腳本
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
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
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(val);
  if (s.includes('T') || s.includes(' ')) {
    try {
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) {
        return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
      }
    } catch {}
  }
  return s.slice(0, 10);
};

async function importProducts() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('import-data.xlsx');
  
  let total = 0;
  let batchCount = 0;
  let batch = writeBatch(db);
  let batchSize = 0;

  for (const ws of workbook.worksheets) {
    console.log(`處理 sheet: ${ws.name}`);
    
    ws.eachRow((row, rowNumber) => {
      if (rowNumber <= 1) return; // skip header
      
      const vals = row.values; // 1-indexed
      const dateVal = vals[1];
      const product = vals[2];
      
      if (!dateVal || !product) return;
      const dateStr = formatDate(dateVal);
      const productStr = String(product).trim();
      if (!dateStr || !productStr || productStr === 'xxx' || productStr.includes('示範') || productStr === '錢箱回歸') return;
      
      const record = {
        type: 'product',
        date: dateStr,
        productName: productStr,
        quantity: String(vals[3] || '1'),
        platform: String(vals[4] || '').trim(),
        customerName: String(vals[5] || '').trim(),
        orderId: String(vals[6] || '').trim(),
        shippingDate: formatDate(vals[7]),
        shippingMethod: String(vals[8] || '').trim(),
        trackingNo: String(vals[9] || '').trim(),
        registeredBy: String(vals[10] || '').trim(),
        note: String(vals[11] || '').trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
        _importedFrom: ws.name,
      };
      
      const ref = doc(collection(db, 'registrations_product'));
      batch.set(ref, record);
      batchSize++;
      total++;
      
      if (batchSize >= 450) {
        // commit this batch
        const currentBatch = batch;
        const currentCount = batchSize;
        batchCount++;
        console.log(`  Batch ${batchCount}: ${currentCount} 筆...`);
        currentBatch.commit().then(() => {
          console.log(`  Batch ${batchCount} committed`);
        }).catch(err => {
          console.error(`  Batch error:`, err.message);
        });
        batch = writeBatch(db);
        batchSize = 0;
      }
    });
  }
  
  // commit remaining
  if (batchSize > 0) {
    batchCount++;
    console.log(`  Final batch ${batchCount}: ${batchSize} 筆...`);
    await batch.commit();
    console.log(`  Final batch committed`);
  }
  
  // Wait for all batches
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log(`\n✅ 匯入完成！共 ${total} 筆產品登記資料`);
  process.exit(0);
}

importProducts().catch(err => {
  console.error('匯入失敗:', err);
  process.exit(1);
});
