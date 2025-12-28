// 第 1 段：Imports、Firebase 設定、工具函式與課程資料
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  Calendar,
  FileText,
  Check,
  DollarSign,
  Printer,
  Search,
  Folder,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Save,
  Trash2,
  X,
  Edit,
  AlertCircle,
  Eye,
  Download,
  Upload,
  MapPin,
  BarChart3,
  TrendingUp,
  PieChart,
  Link as LinkIcon,
  Lock,
  Wallet,
  User,
  Clock,
  Store,
  Filter,
  Copy,
  Share2,
  ShieldCheck,
  ClipboardList,
  Users,
  CheckSquare,
  MessageSquare
} from 'lucide-react';

// ★★★ 新增：Excel 匯出套件 ★★★
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// ==========  Firebase 設定  ==========
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

// ★★★ 印章圖片路徑（請放在 public/stamp.png） ★★★
const STAMP_URL = '/stamp.png';

// Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyChK75njpy0zmk3wPfq0vnlORfTVFPkxAo',
  authDomain: 'xiabenhow-quote.firebaseapp.com',
  projectId: 'xiabenhow-quote',
  storageBucket: 'xiabenhow-quote.firebasestorage.app',
  messagingSenderId: '572897867092',
  appId: '1:572897867092:web:0be379e659e1a0613544c1',
  measurementId: 'G-H4CTY88LLF',
};

let app;
let db;
const isFirebaseReady = !!firebaseConfig.apiKey;

try {
  if (isFirebaseReady) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase 已連線：xiabenhow-quote');
  }
} catch (err) {
  console.error('Firebase 初始化失敗', err);
}

// ========== 共用小工具 ========== 

// 動態載入 html2pdf
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 11);

const getSafeDate = (val) => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (val.seconds) return new Date(val.seconds * 1000);
  if (typeof val === 'string' || typeof val === 'number') return new Date(val);
  return new Date();
};

const formatDate = (val) => {
  try {
    return getSafeDate(val).toLocaleDateString('zh-TW');
  } catch {
    return '';
  }
};

const formatDateWithDay = (dateStr) => {
  if (!dateStr) return '';
  try {
    const dayMap = ['日', '一', '二', '三', '四', '五', '六'];
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return `${dateStr} (${dayMap[d.getDay()]})`;
      }
    }
    const d = getSafeDate(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} (${dayMap[d.getDay()]})`;
  } catch (e) {
    return dateStr;
  }
};

const INPUT_CLASS =
  'w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white';
const LABEL_CLASS = 'block text-sm font-bold text-gray-700 mb-1';
const SECTION_CLASS =
  'bg-white p-6 rounded-lg shadow-sm border border-gray-200';

// ========== 課程資料 (完整版) ========== 

const COURSE_DATA = {
  平板課程: [
    { name: '平板課程-招財水晶樹', price: 690 },
    { name: '平板課程-純淨水晶礦石吊飾', price: 590 },
    { name: '平板課程-流體畫方形布畫', price: 890 },
    { name: '平板課程-Macrame星座葉片吊飾', price: 490 },
    { name: '平板課程-招財流體揪吉', price: 590 },
    { name: '平板課程-橙片奶昔蠟燭', price: 750 },
    { name: '平板課程-永生繡球花玻璃杯燭台', price: 750 },
    { name: '平板課程-聖誕金箔浮游花瓶', price: 590 },
    { name: '平板課程-多肉盆栽造型蠟燭手把杯', price: 590 },
    { name: '平板課程-鐵罐乾燥花香氛蠟燭', price: 590 },
    { name: '平板課程-雙棕色玻璃瓶香氛蠟燭', price: 590 },
    { name: '平板課程-彩虹小熊軟糖洗手皂', price: 490 },
    { name: '平板課程-水泥盆微景觀多肉', price: 590 },
    { name: '平板課程-多肉雙八角水泥盆', price: 590 },
    { name: '平板課程-Macrame樹葉壁掛', price: 590 },
    { name: '平板課程-蒙古玻璃乾燥花香氛蠟燭', price: 590 },
    { name: '平板課程-多肉摩艾水泥盆', price: 490 },
    { name: '平板課程-Macrame編織燈串', price: 690 },
    { name: '平板課程-樹幹乾燥花香氛蠟燭', price: 550 },
    { name: '平板課程-永生繡球浮游花筆', price: 490 },
    { name: '平板課程-水泥六角擴香花盤', price: 590 },
    { name: '平板課程-永生繡球浮游花瓶', price: 590 },
    { name: '平板課程-壓克力流體畫杯墊', price: 550 },
    { name: '平板課程-乾燥花香氛橢圓蠟片', price: 590 },
    { name: '平板課程-紳士兔松果擴香座', price: 490 },
    { name: '平板課程-雪松松果樹名片座', price: 590 },
    { name: '平板課程-熊熊愛上你擴香小熊', price: 490 },
    { name: '平板課程-水彩暈染星空畫', price: 590 },
    { name: '平板課程-工業風擴香乾燥花盆', price: 690 },
    { name: '平板課程-南瓜鐵藝香氛蠟燭', price: 750 },
    { name: '平板課程-水彩夜景夢幻煙火畫', price: 590 },
    { name: '平板課程-微景觀多肉玻璃球', price: 790 },
    { name: '平板課程-圓方香氛暈染手工皂', price: 550 },
    { name: '平板課程-工業風永生花', price: 790 },
    { name: '平板課程-拼色水磨石吸水雙杯墊', price: 550 },
    { name: '平板課程-流體畫啤酒開瓶器與啤酒墊', price: 690 },
    { name: '平板課程-工業流金擴香片', price: 590 },
    { name: '平板課程-乾燥花圈精油手工皂', price: 550 },
    { name: '平板課程-月牙多肉三角玻璃屋', price: 980 },
    { name: '平板課程-花影藏香擴香花台', price: 1080 },
  ],
  水晶系列: [
    { name: '純淨水晶礦石吊飾', price: 650 },
    { name: '招財水晶樹', price: 750 },
    { name: '手作輕寶石水晶手鍊', price: 980 },
    { name: '編織星球水晶手鍊', price: 1080 },
    { name: '時光之石水晶時鐘', price: 1080 },
    { name: '水晶礦石月曆', price: 1180 },
    { name: '大盆招財水晶樹', price: 1380 },
  ],
  蠟燭系列: [
    { name: '瑪芬甜點香氛蠟燭', price: 590 },
    { name: '鐵罐乾燥花香氛蠟燭', price: 650 },
    { name: '乾燥花擴香蠟片', price: 650 },
    { name: '黑曜石松果香氛蠟燭', price: 850 },
    { name: '微景觀湖泊蠟燭', price: 880 },
    { name: '果凍海洋蠟燭杯', price: 880 },
    { name: '麋鹿香氛蠟燭', price: 880 },
    { name: '南瓜鐵藝乾燥花蠟燭', price: 880 },
    { name: '花圈香氛蠟片', price: 980 },
    { name: '乾燥花玻璃杯燭台', price: 980 },
    { name: '告白蠟燭漂流木燭台', price: 1080 },
    { name: '多層透視油畫蠟燭', price: 1380 },
    { name: '微醺調酒香氛蠟燭', price: 1380 },
    { name: '瑪格麗特調酒香氛蠟燭', price: 1380 },
  ],
  畫畫系列: [
    { name: '水彩暈染星空畫', price: 650 },
    { name: '六角石盤流體畫杯墊', price: 650 },
    { name: '創作雙流體畫方形布畫與杯墊', price: 1180 },
    { name: '聖誕樹油畫棒', price: 1180 },
    { name: '雙流體熊圓形布畫', price: 1280 },
    { name: '浪花畫油畫棒', price: 1280 },
    { name: '經典北歐酒精畫木托盤', price: 1380 },
    { name: '康乃馨油畫棒', price: 1380 },
    { name: '聖誕樹肌理畫', price: 1380 },
    { name: '絢彩琉璃酒精畫', price: 1480 },
    { name: '耶誕窗景酒精畫', price: 1580 },  
    { name: '聖誕絢彩琉璃酒精畫', price: 1580 },
    { name: '新春吉祥酒精畫', price: 1580 },
    { name: '金箔肌理畫', price: 1880 },
    { name: '月亮燈肌理畫', price: 1980 },
  ],
  多肉植栽系列: [
    { name: '多肉雙八角水泥盆', price: 650 },
    { name: '微景觀多肉暈染石盆', price: 700 },
    { name: '雪地多肉玻璃球', price: 980 },
    { name: '苔蘚生態玻璃球', price: 980 },
    { name: '日式注連繩掛飾', price: 980 },
    { name: '木質苔球小院', price: 980 },
    { name: '路燈叢林微景觀多肉梯盆', price: 1180 },
    { name: '月牙多肉三角玻璃屋', price: 1180 },
    { name: '路燈多肉相框', price: 1180 },
    { name: '冷杉擴香雪景觀多肉盆', price: 1180 },
    { name: '療癒水苔多肉藤圈', price: 1180 },
    { name: '能量礦石叢林生態瓶', price: 1280 },
    { name: '叢林多肉花圈', price: 1280 },
    { name: '上板苔球', price: 1380 },
    { name: '上板鹿角蕨', price: 1680 },
    { name: '上板苔球多肉', price: 1380 },
    { name: '多肉盆栽觸控音樂盒', price: 1380 },
  ],
  調香系列: [
    { name: '芳療精油滾珠瓶', price: 880 },
    { name: '玻尿酸天然精油調香沐浴精', price: 980 },
    { name: '法式香水精油調香', price: 1180 },
    { name: '天然大地療癒花藥鹽', price: 1180 },
    { name: '室內擴香調香課', price: 1580 },
    { name: '法式情侶雙人調香組', price: 1980 },
  ],
  花藝系列: [
    { name: '水泥六角擴香花盤', price: 650 },
    { name: '松果聖誕樹名片座', price: 680 },
    { name: '金箔浮游花瓶', price: 680 },
    { name: '工業風擴香乾燥花盆', price: 750 },
    { name: '工業風永生花', price: 850 },
    { name: '雪影藏花永生繡球花圈', price: 980 },
    { name: '迎春花藝木框掛飾', price: 980 },
    { name: '日式注連繩迎春花', price: 980 },
    { name: '迎春乾燥花水泥六角盆', price: 980 },
    { name: '花藝玻璃珠寶盒', price: 1080 },
    { name: '韓式香水瓶花盒', price: 1080 },
    { name: '北歐胖圈擴香花盆', price: 1080 },
    { name: '多稜角水泥永生花盆', price: 1080 },
    { name: '浮游花瓶永生繡球夜燈', price: 1080 },
    { name: '經典永生花畫框', price: 1080 },
    { name: '水泥樹幹花藝', price: 1180 },
    { name: '冬夜響鈴玫瑰永生花圈', price: 1280 },
    { name: '玫瑰永生花方瓷盆', price: 1280 },
    { name: '花影藏香擴香花台', price: 1380 },
    { name: '永恆玫瑰玻璃盅永生花燈', price: 1680 },
    { name: '摩天輪玫瑰永生花圈', price: 1680 },
    { name: '韓式質感花束包裝', price: 1780 },
  ],
  皮革系列: [
    { name: '皮革證件套', price: 880 },
    { name: '皮革零錢包', price: 880 },
  ],
  環氧樹脂系列: [
    { name: '海洋風情托盤與雙杯墊', price: 1180 },
    { name: '夏日海風衛生紙盒與萬用盤', price: 1580 },
    { name: '海洋收藏盒', price: 1680 },
    { name: '日本樹脂康乃馨水晶花夜燈', price: 1980 },
    { name: '日本樹脂龜背葉水晶花', price: 1980 },
    { name: '磁浮月球燈', price: 3680 },
  ],
  手工皂系列: [{ name: '乾燥花圈精油手工皂', price: 650 }],
  藍染系列: [
    { name: '創意染零錢包與提繩', price: 580 },   
    { name: '創意染鑰匙套與編織杯袋', price: 650 },
    { name: '創意染鑰匙套編織手鍊', price: 650 },
    { name: '手染遮陽帽與老公公吊飾', price: 680 },
    { name: '藍染編織掛布', price: 720 },
    { name: '藍染兩用手提衛生紙套與編織繩', price: 780 },
    { name: '藍染木架收納袋與編織手機鍊', price: 980 },
    { name: '藍染識別證件套與午睡枕', price: 980 },
  ],
  其它手作: [
    { name: '擴香石手作', price: 650 },
    { name: '浮游花瓶', price: 780 },
  ],
};



// 第 3 段：價格計算與車馬費去重邏輯

// ========== 價格計算邏輯 ========== 

const calculateItem = (item) => {
  const {
    price,
    peopleCount,
    locationMode,
    outingRegion,
    city,
    area,
    hasInvoice,
    customDiscount,
    extraFees,
    extraFee,
    enableDiscount90,
    applyTransportFee = true,
    isCustom = false, // ★★★ 新增：自訂模式標記
  } = item;

  let error = null;
  let teacherFee = 0;
  let transportFee = 0;
  let discountRate = 1;
  let isDiscountApplied = false;

  const count = parseInt(peopleCount) || 0;
  const unitPrice = parseInt(price) || 0;
  const manualDiscount = parseInt(customDiscount) || 0;

  let totalExtraFee = parseInt(extraFee) || 0;
  if (extraFees && Array.isArray(extraFees)) {
    totalExtraFee += extraFees
      .filter((f) => f.isEnabled)
      .reduce((sum, f) => sum + (parseInt(f.amount) || 0), 0);
  }

  // ★★★ 關鍵修改：如果是自訂模式 (isCustom)，完全跳過最低人數與師資費規則檢查 ★★★
  if (!isCustom) {
      if (locationMode === 'outing') {
        if (outingRegion === 'North') {
          const isRemote =
            ['桃園市', '新竹縣市', '苗栗縣', '宜蘭縣'].includes(city) ||
            city.includes('(北部出發)');
          if (isRemote) {
            if (count < 25) {
              error = `北部遠程外派(${city.replace(/\(.*?\)/, '')})最低出課人數為 25 人`;
            }
          } else {
            if (['台北市', '新北市'].includes(city)) {
              // 正常模式下，自動計算師資費
              if (count >= 10 && count <= 14) teacherFee = 2000;
            }
          }
        } else if (outingRegion === 'Central') {
          if (city === '台中市') {
            if (count < 10) error = '中部市區外派最低出課人數為 10 人';
          } else {
            if (count < 15) error = '中部其他地區外派最低出課人數為 15 人';
          }
        } else if (outingRegion === 'South') {
          if (city === '高雄市') {
            if (count < 10) error = '南部市區外派最低出課人數為 10 人';
          }
          else {
            if (count < 15) error = '南部其他地區外派最低出課人數為 15 人';
          }
        }
      } else {
        if (outingRegion === 'Central') {
          if (count < 10) error = '中部店內包班最低人數 10 人';
        } else if (outingRegion === 'South') {
          if (count < 6) error = '南部店內包班最低人數 6 人';
        }
      }
  }

  // --- 九折優惠 ---
  if (enableDiscount90) {
    discountRate = 0.9;
    isDiscountApplied = true;
  }

  // --- 車馬費計算 ---
  if (locationMode === 'outing' && city && applyTransportFee) {
    const cityData = TRANSPORT_FEES[city];
    if (cityData) {
      if (cityData.zones && area && cityData.zones[area]) {
        transportFee = cityData.zones[area];
      } else {
        transportFee = cityData.default;
      }
    }
  } else {
    // 沒選地點，或者使用者手動取消了車馬費 (即使在自訂模式，若勾選套用車馬費依然會算)
    transportFee = 0;
  }

  const subTotal = unitPrice * count;
  const discountedSubTotal = Math.round(subTotal * discountRate);
  const discountAmount = subTotal - discountedSubTotal;
  const taxableAmount = discountedSubTotal - manualDiscount;
  const tax = hasInvoice ? Math.round(taxableAmount * 0.05) : 0;
  const finalTotal =
    taxableAmount + tax + transportFee + teacherFee + totalExtraFee;

  return {
    subTotal,
    discountAmount,
    isDiscountApplied,
    tax,
    transportFee,
    teacherFee,
    finalTotal,
    totalExtraFee,
    error,
  };
};

// ★★★ 車馬費去重：同日 + 縣市 + 區域 + 地址，只收一次車馬費 ★★★
const applyTransportDedup = (itemsWithCalc) => {
  const seenKeys = new Set();

  return itemsWithCalc.map((item) => {
    const calc = { ...item.calc };

    if (item.locationMode === 'outing' && calc.transportFee > 0) {
      const key = [
        item.eventDate || '',
        item.city || '',
        item.area || '',
        (item.address || '').trim(),
      ].join('|');

      if (seenKeys.has(key)) {
        // 已經有同條件課程收過車馬費 → 這一筆不再收
        calc.finalTotal -= calc.transportFee;
        calc.transportFee = 0;
      } else {
        seenKeys.add(key);
      }
    }

    return { ...item, calc };
  });
};

// 第 4 段：UI 小元件、後台鎖定與報價單預覽 (含新增 Excel 下載按鈕 - 修正條款全文)

// ========== UI 小元件 ========== 

const StatusSelector = ({ status, onChange }) => {
  // ★ 修改：只保留四種狀態：草稿、已回簽、已付訂、已結案
  const options = [
    { value: 'draft', label: '草稿', color: 'bg-gray-100 text-gray-800' },
    {
      value: 'confirmed',
      label: '已回簽',
      color: 'bg-purple-100 text-purple-800',
    },
    { value: 'paid', label: '已付訂', color: 'bg-orange-100 text-orange-800' },
    { value: 'closed', label: '已結案', color: 'bg-green-100 text-green-800' },
  ];
  const current = options.find((o) => o.value === status) || options[0];

  return (
    <div className="relative inline-block text-left">
      <select
        value={status}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-offset-1 focus:ring-blue-300 ${current.color}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3 h-3 absolute right-2 top-1.5 pointer-events-none opacity-50" />
    </div>
  );
};

// ========== 後台鎖定畫面 (AdminLock) ========== 
const AdminLock = ({ onUnlock }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === '8888') {
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
        <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">後台管理鎖定</h2>
        <p className="text-gray-500 mb-6 text-sm">請輸入通行碼以存取內部資料</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            className={`w-full text-center text-2xl tracking-widest border-2 rounded-lg p-3 outline-none transition-colors ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}
            placeholder="••••"
            maxLength={4}
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value);
              setError(false);
            }}
            autoFocus
          />
          {error && <p className="text-red-500 text-sm font-bold">通行碼錯誤</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            解鎖進入
          </button>
        </form>
        <p className="mt-6 text-xs text-gray-400">下班隨手作內部系統 v4.0</p>
      </div>
    </div>
  );
};

// ========== 報價單預覽 (PDF 顯示用) ========== 

const QuotePreview = ({
  clientInfo,
  items,
  totalAmount,
  dateStr,
  isSigned,
  stampUrl,
  idName = 'printable-area',
}) => {
  return (
    <div
      id={idName}
      className="bg-white w-[210mm] max-w-full shadow-none px-8 pb-4 pt-[5px] text-sm mx-auto relative print:p-0 print:m-0 print:w-full"
    >
      {/* 標題 */}
      <div className="flex justify-between items-end border-b-2 border-gray-800 pb-2 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            下班隨手作活動報價單
          </h1>
        </div>
        <div className="text-right text-gray-600 text-xs">
          <p>報價日期: {dateStr}</p>
          <p className="font-bold mt-0.5">有效期限：3天</p>
        </div>
      </div>

      {/* 品牌單位 + 客戶資料 */}
      <div className="mb-2">
        <div className="grid grid-cols-2 gap-3">
          {/* 左邊 */}
          <div className="bg-gray-50 p-2 rounded border border-gray-100">
            <h2 className="font-bold text-gray-800 border-b border-gray-200 mb-1 pb-1 text-xs">
              品牌單位
            </h2>
            <div className="space-y-0.5 text-xs text-gray-700">
              <p>
                <span className="text-gray-500 mr-2">公司行號:</span>
                下班文化國際有限公司
              </p>
              <p>
                <span className="text-gray-500 mr-2">統一編號:</span>
                83475827
              </p>
              <p>
                <span className="text-gray-500 mr-2">聯絡電話:</span>
                02-2371-4171
              </p>
              <p>
                <span className="text-gray-500 mr-2">聯絡人:</span>
                下班隨手作
              </p>
            </div>
          </div>

          {/* 右邊 */}
          <div className="bg-gray-50 p-2 rounded border border-gray-100">
            <h2 className="font-bold text-gray-800 border-b border-gray-200 mb-1 pb-1 text-xs">
              客戶資料
            </h2>
            <div className="space-y-0.5 text-xs text-gray-700">
              <p>
                <span className="text-gray-500 mr-2">名稱:</span>
                {clientInfo.companyName || '-'}
              </p>
              <p>
                <span className="text-gray-500 mr-2">統編:</span>
                {clientInfo.taxId || '-'}
              </p>
              <p>
                <span className="text-gray-500 mr-2">聯絡人:</span>
                {clientInfo.contactPerson || '-'}
              </p>
              <p>
                <span className="text-gray-500 mr-2">電話:</span>
                {clientInfo.phone || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 明細表 */}
      <table className="w-full mb-2 border-collapse text-xs">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-1.5 text-left rounded-l">項目</th>
            <th className="p-1.5 text-right">單價</th>
            <th className="p-1.5 text-right">人數</th>
            <th className="p-1.5 text-right rounded-r">小計</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item, idx) => {
            const timeText =
              item.timeRange ||
              (item.startTime && item.endTime
                ? `${item.startTime}-${item.endTime}`
                : item.startTime || '');

            return (
              <React.Fragment key={idx}>
                <tr className="break-inside-avoid">
                  <td className="p-2">
                    <div className="font-bold text-gray-800 text-sm">
                      {item.courseName}
                    </div>
                    {item.itemNote && (
                      <div className="text-[10px] text-gray-500 mt-0.5 font-medium bg-yellow-50 inline-block px-1 rounded border border-yellow-100">
                        備註: {item.itemNote}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-500 mt-0.5 flex flex-col">
                      {(item.eventDate || timeText) && (
                        <div>
                          時間：{formatDateWithDay(item.eventDate)}{' '}
                          {timeText ? ` ${timeText}` : ''}
                        </div>
                      )}
                      {item.address && <div>地點：{item.address}</div>}
                    </div>
                  </td>
                  <td className="p-2 text-right text-gray-600">
                    ${Number(item.price || 0).toLocaleString()}
                  </td>
                  <td className="p-2 text-right text-gray-600">
                    {item.peopleCount}
                  </td>
                  <td className="p-2 text-right font-medium">
                    ${item.calc.subTotal.toLocaleString()}
                  </td>
                </tr>

                {(item.calc.isDiscountApplied || item.customDiscount > 0) && (
                  <tr className="bg-red-50 text-[10px] break-inside-avoid">
                    <td
                      colSpan={3}
                      className="p-1 pl-2 text-right text-red-600"
                    >
                      折扣優惠{' '}
                      {item.customDiscountDesc
                        ? `(${item.customDiscountDesc})`
                        : ''}
                    </td>
                    <td className="p-1 text-right text-red-600 font-bold">
                      -$
                      {(
                        (item.calc.discountAmount || 0) +
                        (parseInt(item.customDiscount || 0) || 0)
                      ).toLocaleString()}
                    </td>
                  </tr>
                )}

                {item.calc.transportFee > 0 && (
                  <tr className="bg-green-50 text-[10px] text-green-900 break-inside-avoid">
                    <td colSpan={3} className="p-1 pl-2 text-right">
                      車馬費 ({item.city.replace(/\(.*?\)/, '')}
                      {item.area})
                    </td>
                    <td className="p-1 text-right font-bold">
                      +${item.calc.transportFee.toLocaleString()}
                    </td>
                  </tr>
                )}

                {item.calc.teacherFee > 0 && (
                  <tr className="bg-green-50 text-[10px] text-green-900 break-inside-avoid">
                    <td colSpan={3} className="p-1 pl-2 text-right">
                      師資費
                    </td>
                    <td className="p-1 text-right font-bold">
                      +${item.calc.teacherFee.toLocaleString()}
                    </td>
                  </tr>
                )}

                {item.extraFees &&
                  item.extraFees
                    .filter((f) => f.isEnabled)
                    .map((fee) => (
                      <tr
                        key={fee.id}
                        className="bg-green-50 text-[10px] text-green-900 break-inside-avoid"
                      >
                        <td colSpan={3} className="p-1 pl-2 text-right">
                          額外加價 ({fee.description || '未說明'})
                        </td>
                        <td className="p-1 text-right font-bold">
                          +${parseInt(fee.amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}

                {item.hasInvoice && (
                  <tr className="bg-green-50 text-[10px] text-green-900 break-inside-avoid">
                    <td colSpan={3} className="p-1 pl-2 text-right">
                      營業稅 (5%)
                    </td>
                    <td className="p-1 text-right font-bold">
                      +${item.calc.tax.toLocaleString()}
                    </td>
                  </tr>
                )}

                <tr className="bg-gray-100 font-bold text-gray-900 border-b-2 border-gray-300 break-inside-avoid text-xs">
                  <td colSpan={3} className="p-1.5 text-right">
                    項目總計
                  </td>
                  <td className="p-1.5 text-right">
                    ${item.calc.finalTotal.toLocaleString()}
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* 總金額 */}
      <div className="flex justify-end mt-2 break-inside-avoid">
        <div className="w-1/2 bg-gray-50 p-2 rounded border border-gray-200">
          <div className="flex justify-between items-center text-xl font-bold text-blue-900">
            <span>總金額</span>
            <span>${totalAmount.toLocaleString()}</span>
          </div>
          <p className="text-right text-[10px] text-gray-500 mt-1">
            總金額
          </p>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="mt-2 pt-2 border-t-2 border-gray-800 text-[10px] text-gray-700 leading-relaxed break-inside-avoid">
        <h4 className=