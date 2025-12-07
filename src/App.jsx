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
} from 'lucide-react';

// ==========  Firebase 設定  ==========
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
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
let analytics;
const isFirebaseReady = !!firebaseConfig.apiKey;

try {
  if (isFirebaseReady) {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
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

const INPUT_CLASS =
  'w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white';
const LABEL_CLASS = 'block text-sm font-bold text-gray-700 mb-1';
const SECTION_CLASS =
  'bg-white p-6 rounded-lg shadow-sm border border-gray-200';

// ========== 課程資料 ==========

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
    { name: '平板課程-工業風擴香花盆', price: 690 },
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
    { name: '手作輕寶石水晶手鍊', price: 980 },
    { name: '編織星球水晶手鍊', price: 1080 },
    { name: '招財水晶樹', price: 750 },
    { name: '大盆招財水晶樹', price: 1380 },
    { name: '水晶礦石月曆', price: 1180 },
    { name: '時光之石水晶時鐘', price: 1080 },
  ],
  蠟燭系列: [
    { name: '花圈香氛蠟片', price: 980 },
    { name: '乾燥花玻璃杯燭台', price: 980 },
    { name: '微景觀湖泊蠟燭', price: 880 },
    { name: '告白蠟燭漂流木燭台', price: 1080 },
    { name: '黑曜石松果香氛蠟燭', price: 850 },
    { name: '微醺調酒香氛蠟燭（含調酒）', price: 1380 },
    { name: '多層透視油畫蠟燭', price: 1380 },
    { name: '南瓜鐵藝乾燥花蠟燭', price: 880 },
    { name: '鐵罐乾燥花香氛蠟燭', price: 650 },
    { name: '瑪格麗特調酒香氛蠟燭（含調酒）', price: 1380 },
    { name: '麋鹿香氛蠟燭', price: 880 },
    { name: '馬芬甜點香氛蠟燭', price: 590 },
    { name: '乾燥花擴香蠟片', price: 650 },
    { name: '果凍海洋蠟燭杯', price: 880 },
  ],
  畫畫系列: [
    { name: '聖誕樹油畫棒', price: 1180 },
    { name: '耶誕窗景酒精畫', price: 1580 },
    { name: '水彩暈染星空畫', price: 650 },
    { name: '月亮燈肌理畫', price: 1980 },
    { name: '絢彩琉璃酒精畫', price: 1480 },
    { name: '經典北歐酒精畫木托盤', price: 1380 },
    { name: '浪花畫油畫棒', price: 1280 },
    { name: '金箔肌理畫', price: 1880 },
    { name: '六角石盤流體畫杯墊', price: 650 },
    { name: '創作雙流體畫方形布畫與杯墊', price: 1180 },
    { name: '雙流體熊圓形布畫', price: 1280 },
    { name: '康乃馨油畫棒', price: 1380 },
    { name: '聖誕樹肌理畫', price: 1380 },
    { name: '聖誕絢彩琉璃酒精畫', price: 1580 },
    { name: '新春吉祥酒精畫', price: 1580 },
  ],
  多肉植栽系列: [
    { name: '路燈多肉相框', price: 1180 },
    { name: '路燈叢林微景觀多肉梯盆', price: 1180 },
    { name: '雪地多肉玻璃球', price: 980 },
    { name: '苔蘚生態玻璃球', price: 980 },
    { name: '能量礦石叢林生態瓶', price: 1280 },
    { name: '上板鹿角蕨', price: 1680 },
    { name: '上板苔球', price: 1380 },
    { name: '木質苔球小院', price: 980 },
    { name: '微景觀多肉暈染石盆', price: 700 },
    { name: '多肉雙八角水泥盆', price: 650 },
    { name: '月牙多肉三角玻璃屋', price: 1180 },
    { name: '日式注連繩掛飾', price: 980 },
    { name: '叢林多肉花圈', price: 1280 },
    { name: '冷杉擴香雪景觀多肉盆', price: 1180 },
    { name: '療癒水苔多肉藤圈', price: 1180 },
    { name: '上板苔球多肉', price: 1380 },
    { name: '多肉盆栽觸控音樂盒', price: 1380 },
  ],
  調香系列: [
    { name: '法式香水精油調香', price: 1180 },
    { name: '法式情侶雙人調香組', price: 1980 },
    { name: '芳療精油滾珠瓶', price: 880 },
    { name: '玻尿酸天然精油調香沐浴精', price: 980 },
    { name: '室內擴香調香課', price: 1580 },
  ],
  花藝系列: [
    { name: '雪影藏花永生繡球花圈', price: 980 },
    { name: '冬夜響鈴玫瑰永生花圈', price: 1280 },
    { name: '水泥樹幹花藝', price: 1180 },
    { name: '迎春花藝木框掛飾', price: 980 },
    { name: '日式注連繩迎春花', price: 980 },
    { name: '北歐胖圈擴香花盆', price: 1080 },
    { name: '工業風擴香乾燥花盆', price: 750 },
    { name: '永恆玫瑰玻璃盅永生花燈', price: 1680 },
    { name: '花藝玻璃珠寶盒', price: 1080 },
    { name: '韓式香水瓶花盒', price: 1080 },
    { name: '韓式質感花束包裝', price: 1780 },
    { name: '多稜角水泥永生花盆', price: 1080 },
    { name: '浮游花瓶永生繡球夜燈', price: 1080 },
    { name: '經典永生花畫框', price: 1080 },
    { name: '迎春乾燥花水泥六角盆', price: 980 },
    { name: '松果花藝名片座', price: 680 },
    { name: '金箔浮游花瓶', price: 680 },
    { name: '水泥六角擴香花盤', price: 650 },
    { name: '工業風永生花', price: 850 },
    { name: '花影藏香擴香花台', price: 1380 },
    { name: '摩天輪玫瑰永生花圈', price: 1680 },
    { name: '玫瑰永生花方瓷盆', price: 1280 },
  ],
  皮革系列: [
    { name: '皮革證件套', price: 880 },
    { name: '皮革零錢包', price: 880 },
  ],
  環氧樹脂系列: [
    { name: '海洋風情托盤與雙杯墊', price: 1180 },
    { name: '海洋收藏盒', price: 1680 },
    { name: '日本樹脂康乃馨水晶花夜燈', price: 1980 },
    { name: '日本樹脂龜背葉水晶花', price: 1980 },
    { name: '磁浮月球燈', price: 3680 },
    { name: '夏日海風衛生紙盒與萬用盤', price: 1580 },
  ],
  手工皂系列: [{ name: '乾燥花圈香氛手工皂', price: 650 }],
  藍染系列: [
    { name: '藍染木架收納袋與編織手機鍊', price: 980 },
    { name: '手染遮陽帽與老公公吊飾', price: 680 },
    { name: '創意染零錢包與提繩', price: 580 },
    { name: '創意染鑰匙套與編織杯袋', price: 650 },
    { name: '藍染編織掛布', price: 720 },
    { name: '藍染兩用手提衛生紙套與編織繩', price: 780 },
    { name: '創意染鑰匙套編織手鍊', price: 650 },
    { name: '藍染識別證件套與午睡枕', price: 980 },
  ],
  其它手作: [
    { name: '擴香石手作', price: 650 },
    { name: '浮游花瓶', price: 780 },
  ],
};

// ========== 車馬費表 ==========

const TRANSPORT_FEES = {
  台北市: {
    default: 0,
    zones: {
      中正區: 500,
      大同區: 500,
      中山區: 500,
      大安區: 500,
      萬華區: 500,
      信義區: 500,
      文山區: 800,
      松山區: 800,
      士林區: 800,
      北投區: 800,
      南港區: 1000,
      內湖區: 1000,
      陽明山: 1000,
    },
  },
  新北市: {
    default: 0,
    zones: {
      新莊區: 500,
      板橋區: 500,
      三重區: 500,
      中和區: 500,
      永和區: 500,
      林口區: 1000,
      五股區: 1000,
      泰山區: 1000,
      蘆洲區: 1000,
      新店區: 1000,
      深坑區: 1000,
      石碇區: 1000,
      汐止區: 1000,
      土城區: 1000,
      樹林區: 1000,
      淡水區: 1500,
      雙溪區: 1500,
      三芝區: 1500,
      三峽區: 1500,
      鶯歌區: 1500,
      烏來區: 1500,
      八里區: 1800,
      萬里區: 1800,
      金山區: 1800,
      石門區: 1800,
      瑞芳區: 1800,
      平溪區: 1800,
      坪林區: 1800,
      貢寮區: 1800,
    },
  },
  基隆市: { default: 2000, zones: {} },
  桃園市: { default: 2000, zones: {} },
  新竹縣市: { default: 2500, zones: {} },
  宜蘭縣: { default: 2500, holiday: 3500, zones: {} },
  苗栗縣: { default: 2800, zones: {} },
  '台中市(北部出發)': { default: 3500, zones: {} },
  '彰化縣(北部出發)': { default: 3800, zones: {} },
  '南投縣(北部出發)': { default: 4800, zones: {} },
  '雲林縣(北部出發)': { default: 5000, zones: {} },
  '嘉義縣市(北部出發)': { default: 5500, zones: {} },
  '台南市(北部出發)': { default: 6500, zones: {} },
  '高雄市(北部出發)': { default: 6500, zones: {} },

  台中市: {
    default: 0,
    zones: {
      中區: 500,
      東區: 500,
      南區: 500,
      西區: 500,
      北區: 500,
      西屯區: 500,
      南屯區: 500,
      北屯區: 500,
      太平區: 800,
      大里區: 800,
      霧峰區: 800,
      烏日區: 800,
      豐原區: 1200,
      后里區: 1200,
      石岡區: 1200,
      東勢區: 1200,
      和平區: 1200,
      新社區: 1200,
      潭子區: 1200,
      大雅區: 1200,
      神岡區: 1200,
      大肚區: 1200,
      外埔區: 1200,
      沙鹿區: 1500,
      龍井區: 1500,
      梧棲區: 1500,
      清水區: 1500,
      大甲區: 1500,
      大安區: 1500,
    },
  },
  彰化縣: { default: 1800, zones: {} },
  南投縣: { default: 1800, zones: {} },
  '苗栗縣(中部出發)': { default: 1800, zones: {} },

  高雄市: {
    default: 0,
    zones: {
      前金區: 500,
      新興區: 500,
      鹽埕區: 500,
      鼓山區: 500,
      旗津區: 500,
      左營區: 500,
      楠梓區: 500,
      三民區: 500,
      苓雅區: 500,
      前鎮區: 500,
      小港區: 500,
      鳳山區: 800,
      大寮區: 800,
      仁武區: 800,
      大樹區: 800,
      大社區: 800,
      橋頭區: 800,
      梓官區: 800,
      鳥松區: 1000,
      彌陀區: 1000,
      永安區: 1000,
      岡山區: 1000,
      燕巢區: 1000,
      阿蓮區: 1000,
      路竹區: 1000,
      林園區: 1500,
      田寮區: 1500,
      湖內區: 1500,
      '山區(茂林/桃源等)': 2500,
    },
  },
  台南市: { default: 1500, zones: {} },
  嘉義縣市: { default: 2200, zones: {} },
  '雲林縣(南部出發)': { default: 2500, zones: {} },
  屏東縣: {
    default: 0,
    zones: {
      屏東市區: 2000,
      其他地區: 2500,
    },
  },
};

const getAvailableCities = (region) => {
  if (region === 'North') {
    return [
      '台北市',
      '新北市',
      '基隆市',
      '桃園市',
      '新竹縣市',
      '宜蘭縣',
      '苗栗縣',
      '台中市(北部出發)',
      '彰化縣(北部出發)',
      '南投縣(北部出發)',
      '雲林縣(北部出發)',
      '嘉義縣市(北部出發)',
      '台南市(北部出發)',
      '高雄市(北部出發)',
    ];
  }
  if (region === 'Central') {
    return ['台中市', '彰化縣', '南投縣', '苗栗縣(中部出發)'];
  }
  if (region === 'South') {
    return ['高雄市', '台南市', '嘉義縣市', '屏東縣', '雲林縣(南部出發)'];
  }
  return [];
};

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

  // --- 最低人數 & 師資費規則 ---
  if (locationMode === 'outing') {
    if (outingRegion === 'North') {
      const isRemote =
        ['桃園市', '新竹縣市', '苗栗縣', '宜蘭縣'].includes(city) ||
        city.includes('(北部出發)');
      if (isRemote) {
        if (count < 25) {
          error = `北部遠程外派(${city.replace(/\(.*\)/, '')})最低出課人數為 25 人`;
        }
      } else {
        if (['台北市', '新北市'].includes(city)) {
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
      } else {
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

  // --- 九折優惠 ---
  if (enableDiscount90) {
    discountRate = 0.9;
    isDiscountApplied = true;
  }

  // --- 車馬費 ---
  if (locationMode === 'outing' && city) {
    const cityData = TRANSPORT_FEES[city];
    if (cityData) {
      if (cityData.zones && area && cityData.zones[area]) {
        transportFee = cityData.zones[area];
      } else {
        transportFee = cityData.default;
      }
    }
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

// ========== UI 小元件 ==========

const StatusSelector = ({ status, onChange }) => {
  const options = [
    { value: 'draft', label: '草稿', color: 'bg-gray-100 text-gray-800' },
    { value: 'pending', label: '報價中', color: 'bg-blue-100 text-blue-800' },
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

// ========== 報價單預覽（含印章） ==========

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
      className="bg-white w-[210mm] max-w-full shadow-none px-8 pb-8 pt-[5px] text-sm mx-auto relative print:p-0 print:m-0 print:w-full"
    >
      {/* 標題 */}
      <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            下班隨手作活動報價單
          </h1>
        </div>
        <div className="text-right text-gray-600">
          <p>報價日期: {dateStr}</p>
          <p className="font-bold mt-1">有效期限：3天</p>
        </div>
      </div>

      {/* 品牌單位 + 客戶資料 */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          {/* 左邊：品牌單位（固定公司資料） */}
          <div className="bg-gray-50 p-4 rounded border border-gray-100">
            <h2 className="font-bold text-gray-800 border-b border-gray-200 mb-3 pb-1">
              品牌單位
            </h2>
            <div className="space-y-1 text-sm text-gray-700">
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

          {/* 右邊：客戶資料 */}
          <div className="bg-gray-50 p-4 rounded border border-gray-100">
            <h2 className="font-bold text-gray-800 border-b border-gray-200 mb-3 pb-1">
              客戶資料
            </h2>
            <div className="space-y-1 text-sm text-gray-700">
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
      <table className="w-full mb-6 border-collapse">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-2 text-left rounded-l">項目</th>
            <th className="p-2 text-right">單價</th>
            <th className="p-2 text-right">人數</th>
            <th className="p-2 text-right rounded-r">小計</th>
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
                  <td className="p-3">
                    <div className="font-bold text-gray-800">
                      {item.courseName}
                    </div>
                    {item.itemNote && (
                      <div className="text-xs text-gray-500 mt-1 font-medium bg-yellow-50 inline-block px-1 rounded border border-yellow-100">
                        備註: {item.itemNote}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1 flex flex-col gap-1">
                      {(item.eventDate || timeText) && (
                        <div>
                          時間：{item.eventDate}{' '}
                          {timeText ? ` ${timeText}` : ''}
                        </div>
                      )}
                      {item.address && <div>地點：{item.address}</div>}
                    </div>
                  </td>
                  <td className="p-3 text-right text-gray-600">
                    ${Number(item.price || 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-gray-600">
                    {item.peopleCount}
                  </td>
                  <td className="p-3 text-right font-medium">
                    ${item.calc.subTotal.toLocaleString()}
                  </td>
                </tr>

                {/* 折扣 / 加價 / 車馬費 / 稅 */}
                {(item.calc.isDiscountApplied || item.customDiscount > 0) && (
                  <tr className="bg-red-50 text-xs break-inside-avoid">
                    <td
                      colSpan={3}
                      className="p-1 pl-4 text-right text-red-600"
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
                  <tr className="bg-green-50 text-xs text-green-900 break-inside-avoid">
                    <td colSpan={3} className="p-1 pl-4 text-right">
                      車馬費 ({item.city.replace(/\(.*\)/, '')}
                      {item.area})
                    </td>
                    <td className="p-1 text-right font-bold">
                      +${item.calc.transportFee.toLocaleString()}
                    </td>
                  </tr>
                )}

                {item.calc.teacherFee > 0 && (
                  <tr className="bg-green-50 text-xs text-green-900 break-inside-avoid">
                    <td colSpan={3} className="p-1 pl-4 text-right">
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
                        className="bg-green-50 text-xs text-green-900 break-inside-avoid"
                      >
                        <td colSpan={3} className="p-1 pl-4 text-right">
                          額外加價 ({fee.description || '未說明'})
                        </td>
                        <td className="p-1 text-right font-bold">
                          +${parseInt(fee.amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}

                {item.hasInvoice && (
                  <tr className="bg-green-50 text-xs text-green-900 break-inside-avoid">
                    <td colSpan={3} className="p-1 pl-4 text-right">
                      營業稅 (5%)
                    </td>
                    <td className="p-1 text-right font-bold">
                      +${item.calc.tax.toLocaleString()}
                    </td>
                  </tr>
                )}

                <tr className="bg-gray-100 font-bold text-gray-900 border-b-2 border-gray-300 break-inside-avoid">
                  <td colSpan={3} className="p-2 text-right">
                    項目總計
                  </td>
                  <td className="p-2 text-right">
                    ${item.calc.finalTotal.toLocaleString()}
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* 總金額 */}
      <div className="flex justify-end mt-4 break-inside-avoid">
        <div className="w-1/2 bg-gray-50 p-4 rounded border border-gray-200">
          <div className="flex justify-between items-center text-2xl font-bold text-blue-900">
            <span>總金額</span>
            <span>${totalAmount.toLocaleString()}</span>
          </div>
          <p className="text-right text-xs text-gray-500 mt-2">
            含稅及所有費用
          </p>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="mt-6 pt-4 border-t-2 border-gray-800 text-xs text-gray-700 leading-relaxed break-inside-avoid">
        <h4 className="font-bold text-sm mb-2">注意事項 / 條款：</h4>
        <div className="space-y-1">
          {[
            {
              text: '本報價單有效時間以接到合作案3天為主，經買家簽章後則視為訂單確認單，並於活動前彼此簽訂總人數之報價單視同正式合作簽署，下班隨手作可依此作為收款依據。',
            },
            {
              text: '人數以報價單協議人數為主，可再臨時新增但不能臨時減少，如當天未達人數老師會製作成品補齊給客戶。',
            },
            {
              text: '教學老師依報價單數量人數進行分配，為鞏固教學品質，實際報價人數以報價單【數量】等同【現場課程參與人數】，超過報價數量人數則依現場實際增加人數加收陪同費，並於尾款一併收費。',
            },
            {
              text: '客戶確認訂單簽章後，回傳 Mail：xiabenhow@gmail.com。或官方 Line：@xiabenhow 下班隨手作。',
            },
            {
              text: '付款方式：確認日期金額，回傳報價單，並蓋章付50%訂金方可協議出課，於課當天結束後7天內匯款付清尾款。',
              highlight: true,
            },
            {
              text: '已預定的課程，由於此時間老師已經推掉其他手作課程，恕無法無故延期，造成老師損失。',
            },
          ].map((item, index) => (
            <div key={index} className="flex items-start">
              <div className="w-5 pr-1 text-right">{index + 1}.</div>
              <div
                className={`flex-1 ${
                  item.highlight ? 'text-red-600 font-bold' : ''
                }`}
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-300">
          <p className="font-bold text-sm">
            銀行：玉山銀行 永安分行 808　戶名：下班文化國際有限公司　帳號：1115-940-021201
          </p>
        </div>
      </div>

      {/* 簽章區：避免換頁 */}
      <div
        className="mt-6 pt-4 border-t border-gray-300 flex justify-between text-sm items-end relative break-inside-avoid"
        style={{ pageBreakInside: 'avoid' }}
      >
        {/* 左邊：公司代表 + 印章 */}
        <div className="relative flex items-end h-[110px]">
          {isSigned && (
            <img
              src={stampUrl || STAMP_URL}
              alt="Company Stamp"
              crossOrigin="anonymous"
              className="absolute top-0 left-16 w-28 opacity-90 rotate-[-5deg] pointer-events-none"
              style={{ mixBlendMode: 'multiply' }}
              onError={() =>
                console.warn(
                  'Stamp load failed，PDF 可能看不到印章（CORS 問題）',
                )
              }
            />
          )}
          <p className="z-10 relative mt-10">
            下班隨手作代表：_________________
          </p>
        </div>

        {/* 右邊：客戶簽章 */}
        <div className="flex items-end h-[110px]">
          <p>客戶確認簽章：_________________</p>
        </div>
      </div>
    </div>
  );
};

// ========== 報價單預覽 Modal（含下載 PDF） ==========

const PreviewModal = ({ quote, onClose }) => {
  const [isSigned, setIsSigned] = useState(false);
  const displayDateStr = formatDate(quote.createdAt || new Date());

  const handleDownload = async () => {
    const element = document.getElementById('preview-modal-area');
    if (!element) return;

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${quote.clientInfo.companyName || '客戶'}_${dateStr}.pdf`;

    if (!window.html2pdf) {
      try {
        await loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
        );
      } catch {
        alert('無法載入 PDF 產生器，請檢查網路連線。');
        return;
      }
    }

    const opt = {
      margin: 5,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    window.html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center overflow-auto p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full flex flex-col max-h-full">
        {/* 工具列 */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 sticky top-0 z-10 rounded-t-lg flex-wrap gap-2">
          <h3 className="font-bold text-lg text-gray-700 flex items-center">
            <Printer className="w-5 h-5 mr-2" />
            報價單預覽
          </h3>
          <div className="flex gap-2 items-center flex-wrap">
            <label className="flex items-center space-x-2 cursor-pointer select-none bg-blue-50 px-3 py-2 rounded border border-blue-200">
              <input
                type="checkbox"
                checked={isSigned}
                onChange={(e) => setIsSigned(e.target.checked)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-sm font-bold text-blue-800">
                蓋上印章
              </span>
            </label>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 flex items-center shadow"
            >
              <Download className="w-4 h-4 mr-2" />
              下載 PDF
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X />
            </button>
          </div>
        </div>

        {/* 內容 */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <div className="shadow-lg mx-auto">
            <QuotePreview
              idName="preview-modal-area"
              clientInfo={quote.clientInfo}
              items={quote.items}
              totalAmount={quote.totalAmount}
              dateStr={displayDateStr}
              isSigned={isSigned}
              stampUrl={STAMP_URL}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== 報價單建立 / 編輯表單 ==========

const QuoteCreator = ({ initialData, onSave, onCancel }) => {
  const [clientInfo, setClientInfo] = useState(
    initialData?.clientInfo || {
      companyName: '',
      taxId: '',
      contactPerson: '',
      phone: '',
      address: '',
    },
  );
  const [status] = useState(initialData?.status || 'draft');
  const [isSigned, setIsSigned] = useState(false);

  // 初始化 items（包含舊資料轉換成 timeRange）
  const [items, setItems] = useState(() => {
    if (initialData?.items) {
      return initialData.items.map((raw) => {
        const item = { ...raw };
        if (!item.extraFees) item.extraFees = [];

        // 舊版的 extraFee 搬到 extraFees 陣列
        if (item.extraFee > 0 && item.extraFees.length === 0) {
          item.extraFees.push({
            id: generateId(),
            description: item.extraFeeDesc || '額外加價',
            amount: item.extraFee,
            isEnabled: true,
          });
          item.extraFee = 0;
          item.extraFeeDesc = '';
        }

        // 把舊的 startTime/endTime 轉成 timeRange 顯示
        if (!item.timeRange) {
          if (item.startTime && item.endTime) {
            item.timeRange = `${item.startTime}-${item.endTime}`;
          } else if (item.startTime) {
            item.timeRange = item.startTime;
          } else {
            item.timeRange = '';
          }
        }

        return item;
      });
    }

    // 新增報價的預設一筆
    return [
      {
        id: generateId(),
        courseSeries: '水晶系列',
        courseName: '手作輕寶石水晶手鍊',
        price: 980,
        peopleCount: 1,
        locationMode: 'store',
        regionType: 'North',
        outingRegion: 'North',
        city: '台北市',
        area: '',
        eventDate: '',
        timeRange: '', // ★ 新欄位：時間區間（手動輸入）
        hasInvoice: false,
        enableDiscount90: false,
        customDiscount: 0,
        customDiscountDesc: '',
        extraFees: [],
        extraFee: 0,
        extraFeeDesc: '',
        address: '',
        itemNote: '',
      },
    ];
  });

  // 先逐筆計算 → 再做「車馬費去重」
  const calculatedItems = useMemo(() => {
    const withCalc = items.map((item) => ({
      ...item,
      calc: calculateItem(item),
    }));
    return applyTransportDedup(withCalc);
  }, [items]);

  const totalAmount = calculatedItems.reduce(
    (sum, item) => sum + (item.calc.finalTotal || 0),
    0,
  );

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // 課程選單連動單價
    if (field === 'courseName') {
      const series = COURSE_DATA[newItems[index].courseSeries];
      const course = series.find((c) => c.name === value);
      if (course) newItems[index].price = course.price;
    }
    if (field === 'courseSeries') {
      const series = COURSE_DATA[value];
      if (series && series.length > 0) {
        newItems[index].courseName = series[0].name;
        newItems[index].price = series[0].price;
      }
    }
    if (field === 'outingRegion') {
      const available = getAvailableCities(value);
      newItems[index].city = available[0] || '';
      newItems[index].area = '';
    }
    if (field === 'city') {
      newItems[index].area = '';
    }

    setItems(newItems);
  };

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      {
        ...prev[prev.length - 1],
        id: generateId(),
        itemNote: '',
        enableDiscount90: false,
        extraFees: [],
        extraFee: 0,
        timeRange: '',
      },
    ]);

  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const addExtraFee = (index) => {
    const newItems = [...items];
    if (!newItems[index].extraFees) newItems[index].extraFees = [];
    newItems[index].extraFees.push({
      id: generateId(),
      description: '',
      amount: 0,
      isEnabled: true,
    });
    setItems(newItems);
  };

  const removeExtraFee = (itemIndex, feeId) => {
    const newItems = [...items];
    newItems[itemIndex].extraFees = newItems[itemIndex].extraFees.filter(
      (f) => f.id !== feeId,
    );
    setItems(newItems);
  };

  const updateExtraFee = (itemIndex, feeId, field, value) => {
    const newItems = [...items];
    const feeIndex = newItems[itemIndex].extraFees.findIndex(
      (f) => f.id === feeId,
    );
    if (feeIndex > -1) {
      newItems[itemIndex].extraFees[feeIndex][field] = value;
      setItems(newItems);
    }
  };

  const handleSave = () => {
    const hasError = calculatedItems.some((i) => i.calc.error);
    if (hasError) {
      alert('報價單中有項目不符合規則，請修正後再儲存。');
      return;
    }
    onSave({
      clientInfo,
      items: calculatedItems,
      totalAmount,
      status,
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto p-4 md:p-8">
      {/* 客戶資訊 */}
      <div className="print:hidden space-y-6">
        <section className={SECTION_CLASS}>
          <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-700 flex items-center">
            <div className="w-1 h-6 bg-slate-800 mr-2 rounded" />
            客戶基本資料 (報價單抬頭)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>公司/客戶名稱</label>
              <input
                className={INPUT_CLASS}
                placeholder="請輸入名稱"
                value={clientInfo.companyName}
                onChange={(e) =>
                  setClientInfo((prev) => ({
                    ...prev,
                    companyName: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>統一編號</label>
              <input
                className={INPUT_CLASS}
                placeholder="選填"
                value={clientInfo.taxId}
                onChange={(e) =>
                  setClientInfo((prev) => ({
                    ...prev,
                    taxId: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>聯絡人</label>
              <input
                className={INPUT_CLASS}
                placeholder="請輸入聯絡人"
                value={clientInfo.contactPerson}
                onChange={(e) =>
                  setClientInfo((prev) => ({
                    ...prev,
                    contactPerson: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>電話</label>
              <input
                className={INPUT_CLASS}
                placeholder="請輸入電話"
                value={clientInfo.phone}
                onChange={(e) =>
                  setClientInfo((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </section>

        {/* 課程項目 */}
        {items.map((item, idx) => {
          const calcItem = calculatedItems[idx];

          return (
            <div
              key={item.id}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 relative"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-blue-800 flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  課程項目 ({idx + 1})
                </h3>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(idx)}
                    className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* 課程選擇 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className={LABEL_CLASS}>課程系列</label>
                  <select
                    className={INPUT_CLASS}
                    value={item.courseSeries}
                    onChange={(e) =>
                      updateItem(idx, 'courseSeries', e.target.value)
                    }
                  >
                    {Object.keys(COURSE_DATA).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={LABEL_CLASS}>
                    課程名稱 （單價: ${item.price}）
                  </label>
                  <select
                    className={INPUT_CLASS}
                    value={item.courseName}
                    onChange={(e) =>
                      updateItem(idx, 'courseName', e.target.value)
                    }
                  >
                    {COURSE_DATA[item.courseSeries]?.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} (${c.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 日期 + 時間（手動） + 人數 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className={LABEL_CLASS}>人數</label>
                  <input
                    type="number"
                    className={INPUT_CLASS}
                    value={item.peopleCount}
                    onChange={(e) =>
                      updateItem(idx, 'peopleCount', e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>日期</label>
                  <input
                    type="date"
                    className={INPUT_CLASS}
                    value={item.eventDate}
                    onChange={(e) =>
                      updateItem(idx, 'eventDate', e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>時間（手動輸入）</label>
                  <input
                    type="text"
                    className={INPUT_CLASS}
                    placeholder="例如：12:00-14:00"
                    value={item.timeRange || ''}
                    onChange={(e) =>
                      updateItem(idx, 'timeRange', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* 發票、九折 */}
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer select-none p-2 bg-yellow-50 rounded border border-yellow-100 flex-1">
                    <input
                      type="checkbox"
                      className="mr-2 w-4 h-4"
                      checked={item.hasInvoice}
                      onChange={(e) =>
                        updateItem(idx, 'hasInvoice', e.target.checked)
                      }
                    />
                    <span className="text-sm font-medium text-gray-700">
                      是否開立發票？（加 5%）
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer select-none p-2 bg-red-50 rounded border border-red-100 flex-1">
                    <input
                      type="checkbox"
                      className="mr-2 w-4 h-4"
                      checked={item.enableDiscount90 || false}
                      onChange={(e) =>
                        updateItem(idx, 'enableDiscount90', e.target.checked)
                      }
                    />
                    <span className="text-sm font-medium text-red-700">
                      套用九折優惠
                    </span>
                  </label>
                </div>
              </div>

              {/* 地點 / 車馬費設定 */}
              <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4">
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center cursor-pointer font-bold text-gray-700">
                    <input
                      type="radio"
                      name={`mode-${item.id}`}
                      className="mr-2 w-4 h-4"
                      checked={item.locationMode === 'outing'}
                      onChange={() => updateItem(idx, 'locationMode', 'outing')}
                    />
                    外派教學
                  </label>

                  <label className="flex items-center cursor-pointer font-bold text-gray-700">
                    <input
                      type="radio"
                      name={`mode-${item.id}`}
                      className="mr-2 w-4 h-4"
                      checked={item.locationMode === 'store'}
                      onChange={() => updateItem(idx, 'locationMode', 'store')}
                    />
                    店內包班
                  </label>
                </div>

                {item.locationMode === 'outing' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={LABEL_CLASS}>車馬費計算區域</label>
                      <select
                        className={INPUT_CLASS}
                        value={item.outingRegion}
                        onChange={(e) =>
                          updateItem(idx, 'outingRegion', e.target.value)
                        }
                      >
                        <option value="North">北部出課</option>
                        <option value="Central">中部老師出課</option>
                        <option value="South">南部老師出課</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>
                        縣市{' '}
                        {calcItem.calc.transportFee > 0 && !calcItem.area && (
                          <span className="text-blue-600 ml-2 text-xs bg-blue-50 px-2 py-0.5 rounded">
                            預估: $
                            {calcItem.calc.transportFee.toLocaleString()}
                          </span>
                        )}
                      </label>
                      <select
                        className={INPUT_CLASS}
                        value={item.city}
                        onChange={(e) =>
                          updateItem(idx, 'city', e.target.value)
                        }
                      >
                        {getAvailableCities(item.outingRegion).map((c) => (
                          <option key={c} value={c}>
                            {c
                              .replace('(北部出發)', '')
                              .replace('(中部出發)', '')
                              .replace('(南部出發)', '')}
                          </option>
                        ))}
                      </select>
                    </div>

                    {TRANSPORT_FEES[item.city]?.zones &&
                      Object.keys(TRANSPORT_FEES[item.city].zones).length >
                        0 && (
                        <div>
                          <label className={LABEL_CLASS}>
                            區域{' '}
                            {calcItem.calc.transportFee > 0 && (
                              <span className="text-blue-600 ml-2 text-xs bg-blue-50 px-2 py-0.5 rounded">
                                +$
                                {calcItem.calc.transportFee.toLocaleString()}
                              </span>
                            )}
                          </label>
                          <select
                            className={INPUT_CLASS}
                            value={item.area}
                            onChange={(e) =>
                              updateItem(idx, 'area', e.target.value)
                            }
                          >
                            <option value="">選擇區域...</option>
                            {Object.entries(
                              TRANSPORT_FEES[item.city].zones,
                            ).map(([zone, fee]) => (
                              <option key={zone} value={zone}>
                                {zone} (+${fee})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                    <div className="md:col-span-3">
                      <label className={LABEL_CLASS}>詳細地址</label>
                      <input
                        className={INPUT_CLASS}
                        placeholder="請輸入詳細地址"
                        value={item.address || ''}
                        onChange={(e) =>
                          updateItem(idx, 'address', e.target.value)
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div>
                      <label className={LABEL_CLASS}>店內區域</label>
                      <select
                        className={INPUT_CLASS}
                        value={item.regionType || 'North'}
                        onChange={(e) =>
                          updateItem(idx, 'regionType', e.target.value)
                        }
                      >
                        <option value="North">北部店內</option>
                        <option value="Central">中部店內</option>
                        <option value="South">南部店內</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 備註 */}
              <div className="mb-4">
                <label className={LABEL_CLASS}>該堂課備註說明（選填）</label>
                <input
                  type="text"
                  className={INPUT_CLASS}
                  placeholder="例如：需提前半小時進場、特殊需求..."
                  value={item.itemNote || ''}
                  onChange={(e) => updateItem(idx, 'itemNote', e.target.value)}
                />
              </div>

              {/* 折扣 & 額外收費 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 手動折扣 */}
                <div className="bg-red-50 p-4 rounded border border-red-100">
                  <label className={LABEL_CLASS + ' text-red-800'}>
                    手動折扣（減項）
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500 font-bold">
                        -
                      </span>
                      <input
                        type="number"
                        className={INPUT_CLASS + ' pl-6'}
                        placeholder="金額"
                        value={item.customDiscount}
                        onChange={(e) =>
                          updateItem(idx, 'customDiscount', e.target.value)
                        }
                      />
                    </div>
                    <input
                      type="text"
                      className={INPUT_CLASS}
                      placeholder="折扣說明"
                      value={item.customDiscountDesc || ''}
                      onChange={(e) =>
                        updateItem(idx, 'customDiscountDesc', e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* 額外加價 */}
                <div className="bg-blue-50 p-4 rounded border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className={LABEL_CLASS + ' text-blue-800 mb-0'}>
                      額外加價（加項）
                    </label>
                    <button
                      onClick={() => addExtraFee(idx)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 font-bold flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      新增
                    </button>
                  </div>
                  <div className="space-y-2">
                    {item.extraFees &&
                      item.extraFees.map((fee) => (
                        <div
                          key={fee.id}
                          className="flex gap-2 items-center"
                        >
                          <input
                            type="checkbox"
                            className="w-5 h-5 cursor-pointer accent-blue-600"
                            checked={fee.isEnabled}
                            onChange={(e) =>
                              updateExtraFee(
                                idx,
                                fee.id,
                                'isEnabled',
                                e.target.checked,
                              )
                            }
                          />
                          <input
                            type="text"
                            className={
                              INPUT_CLASS +
                              ' flex-1 ' +
                              (!fee.isEnabled ? 'opacity-50' : '')
                            }
                            placeholder="加價說明"
                            value={fee.description}
                            onChange={(e) =>
                              updateExtraFee(
                                idx,
                                fee.id,
                                'description',
                                e.target.value,
                              )
                            }
                            disabled={!fee.isEnabled}
                          />
                          <div className="relative w-32">
                            <span className="absolute left-2 top-2 text-gray-500 font-bold">
                              +
                            </span>
                            <input
                              type="number"
                              className={
                                INPUT_CLASS +
                                ' pl-5 ' +
                                (!fee.isEnabled ? 'opacity-50' : '')
                              }
                              placeholder="金額"
                              value={fee.amount}
                              onChange={(e) =>
                                updateExtraFee(
                                  idx,
                                  fee.id,
                                  'amount',
                                  e.target.value,
                                )
                              }
                              disabled={!fee.isEnabled}
                            />
                          </div>
                          <button
                            onClick={() => removeExtraFee(idx, fee.id)}
                            className="text-red-400 hover:text-red-600 p-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* 規則錯誤提示 */}
              {calcItem.calc.error && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-bold">{calcItem.calc.error}</span>
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={addItem}
          className="w-full py-4 bg-white border-2 border-dashed border-gray-300 shadow-sm rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition flex justify-center items-center font-bold text-lg"
        >
          <Plus className="w-6 h-6 mr-2" />
          增加更多課程
        </button>
      </div>

      {/* 下方即時預覽 + 儲存 */}
      <div className="mt-10 border-t-4 border-gray-800 pt-8 print:border-none print:mt-0 print:pt-0">
        <div className="flex justify-between items-center mb-6 print:hidden flex-wrap gap-4">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            <Eye className="mr-2" />
            即時報價單預覽
          </h3>
          <div className="flex gap-4 items-center flex-wrap">
            <label className="flex items-center space-x-2 cursor-pointer select-none bg-blue-50 px-3 py-2 rounded border border-blue-200">
              <input
                type="checkbox"
                checked={isSigned}
                onChange={(e) => setIsSigned(e.target.checked)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-sm font-bold text-blue-800">
                蓋上印章
              </span>
            </label>

            <button
              onClick={handleSave}
              className="px-8 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              儲存至資料庫
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        </div>

        <div className="border shadow-2xl mx-auto print:shadow-none print:border-none overflow-hidden">
          <QuotePreview
            idName="creator-preview-area"
            clientInfo={clientInfo}
            items={calculatedItems}
            totalAmount={totalAmount}
            dateStr={new Date().toISOString().slice(0, 10)}
            isSigned={isSigned}
            stampUrl={STAMP_URL}
          />
        </div>
      </div>
    </div>
  );
};

// ========== 統計頁面 ==========

const StatsView = ({ quotes }) => {
  const availableMonths = useMemo(() => {
    const months = new Set();
    quotes.forEach((q) => {
      if (q.status !== 'draft') {
        const d = getSafeDate(q.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          '0',
        )}`;
        months.add(key);
      }
    });
    return Array.from(months).sort().reverse();
  }, [quotes]);

  const [selectedMonth, setSelectedMonth] = useState(
    availableMonths[0] || '',
  );

  useEffect(() => {
    if (!selectedMonth && availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const stats = useMemo(() => {
    const result = {
      totalRevenue: 0,
      totalOrders: 0,
      regions: {
        North: { name: '北部', revenue: 0, count: 0, color: 'bg-blue-500' },
        Central: {
          name: '中部',
          revenue: 0,
          count: 0,
          color: 'bg-yellow-500',
        },
        South: { name: '南部', revenue: 0, count: 0, color: 'bg-green-500' },
      },
      statuses: {
        pending: {
          name: '報價中',
          count: 0,
          color: 'bg-blue-100 text-blue-800',
        },
        confirmed: {
          name: '已回簽 (待付訂)',
          count: 0,
          color: 'bg-purple-100 text-purple-800',
        },
        paid: {
          name: '已付訂 (待結清)',
          count: 0,
          color: 'bg-orange-100 text-orange-800',
        },
        closed: {
          name: '已結案',
          count: 0,
          color: 'bg-green-100 text-green-800',
        },
      },
    };

    if (!selectedMonth) return result;

    quotes.forEach((q) => {
      if (q.status === 'draft') return;
      const d = getSafeDate(q.createdAt);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}`;
      if (monthKey !== selectedMonth) return;

      let regionKey = 'North';
      if (q.items && q.items.length > 0) {
        const r = q.items[0].outingRegion || q.items[0].regionType;
        if (r && result.regions[r]) regionKey = r;
      }

      const amount = q.totalAmount || 0;
      result.totalRevenue += amount;
      result.totalOrders += 1;
      result.regions[regionKey].revenue += amount;
      result.regions[regionKey].count += 1;

      if (result.statuses[q.status]) {
        result.statuses[q.status].count += 1;
      }
    });

    return result;
  }, [quotes, selectedMonth]);

  if (availableMonths.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>目前沒有有效的報價單資料可供統計。</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <TrendingUp className="mr-3 text-blue-600" />
          業績統計儀表板
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">選擇月份：</span>
          <select
            className={INPUT_CLASS + ' w-40'}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 總業績 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg mb-8">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-100 font-medium mb-1">
              本月總業績 ({selectedMonth})
            </p>
            <h3 className="text-4xl font-bold tracking-tight">
              ${stats.totalRevenue.toLocaleString()}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-blue-100 font-medium mb-1">總成交案件</p>
            <h3 className="text-3xl font-bold">
              {stats.totalOrders}
              <span className="text-base font-normal opacity-80">
                {' '}
                件
              </span>
            </h3>
          </div>
        </div>
      </div>

      {/* 狀態分佈 */}
      <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
        <PieChart className="w-5 h-5 mr-2" />
        案件狀態分佈
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.keys(stats.statuses).map((key) => (
          <div
            key={key}
            className={`p-4 rounded-lg border ${stats.statuses[
              key
            ].color
              .replace('bg-', 'border-')
              .replace('100', '200')} ${stats.statuses[key].color}`}
          >
            <p className="text-xs font-bold uppercase opacity-70">
              {stats.statuses[key].name}
            </p>
            <p className="text-2xl font-bold mt-1">
              {stats.statuses[key].count}
            </p>
          </div>
        ))}
      </div>

      {/* 地區佔比 */}
      <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
        <MapPin className="w-5 h-5 mr-2" />
        地區業績佔比
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.keys(stats.regions).map((key) => {
          const region = stats.regions[key];
          const percentage =
            stats.totalRevenue > 0
              ? Math.round((region.revenue / stats.totalRevenue) * 100)
              : 0;
          return (
            <div
              key={key}
              className="bg-white p-6 rounded-xl shadow border border-gray-100 relative overflow-hidden"
            >
              <div
                className={`absolute top-0 left-0 w-2 h-full ${region.color}`}
              />
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-gray-700">
                  {region.name}區域
                </h4>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {percentage}% 佔比
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">
                    區域營收
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${region.revenue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">
                    案件數量
                  </p>
                  <p className="text-lg font-semibold text-gray-700">
                    {region.count} 件
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ========== 行事曆視圖（含常態課 regularClasses） ==========

const CalendarView = ({
  quotes,
  regularClasses = [],
  publicMode = false,
  onCreateRegularClass,
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [viewMode, setViewMode] = useState('month');

  const urlParams = new URLSearchParams(window.location.search);
  const initialFilter = urlParams.get('filter');
  const [filterRegion, setFilterRegion] = useState(initialFilter || 'all');

  const [showRegularForm, setShowRegularForm] = useState(false);
  const [regularForm, setRegularForm] = useState({
    title: '',
    date: '',
    timeRange: '',
    city: '台北',
  });

  const activeQuotes = quotes.filter((q) => q.status !== 'draft');

  const getQuoteRegion = (q) => {
    const first = q.items[0] || {};
    return first.outingRegion || first.regionType || 'North';
  };

  const getRegularRegion = (rc) => rc.region || 'North';

  const filterByRegion = (list, getRegion) => {
    if (filterRegion === 'all') return list;
    return list.filter((item) => getRegion(item) === filterRegion);
  };

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
      );
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
      );
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleDayClick = (day) => {
    const d = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    setCurrentDate(d);
    setViewMode('day');
  };

  const getEventsForDay = (date) => {
    // 企業報價事件
    const quoteEvents = activeQuotes.filter((q) => {
      if (!q.items || q.items.length === 0) return false;
      return q.items.some((item) => {
        if (!item.eventDate) return false;
        const d = new Date(item.eventDate);
        return (
          d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
        );
      });
    });

    // 老師常態課事件
    const regularEvents = regularClasses.filter((rc) => {
      if (!rc.date) return false;
      const d = new Date(rc.date);
      return (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      );
    });

    const filteredQuotes = filterByRegion(quoteEvents, getQuoteRegion);
    const filteredRegulars = filterByRegion(regularEvents, getRegularRegion);

    return [
      ...filteredQuotes.map((q) => ({ kind: 'quote', quote: q })),
      ...filteredRegulars.map((regular) => ({ kind: 'regular', regular })),
    ];
  };

  const copyLink = (region) => {
    const baseUrl = window.location.href.split('?')[0];
    const link = `${baseUrl}?view=calendar&filter=${region}&mode=public`;

    const textarea = document.createElement('textarea');
    textarea.value = link;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      const ok = document.execCommand('copy');
      if (ok) {
        // eslint-disable-next-line no-alert
        alert(`已複製行程公開連結：\n${link}`);
      } else {
        // eslint-disable-next-line no-alert
        prompt('無法自動複製，請手動複製：', link);
      }
    } catch {
      // eslint-disable-next-line no-alert
      prompt('無法自動複製，請手動複製：', link);
    }
    document.body.removeChild(textarea);
  };

  const regionColors = {
    North:
      'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    Central:
      'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
    South:
      'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  };

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Calendar className="mr-2" />
          {viewMode === 'month' &&
            `${currentDate.getFullYear()}年 ${
              currentDate.getMonth() + 1
            }月`}
          {viewMode === 'week' &&
            `週視圖 (${currentDate.toLocaleDateString('zh-TW')})`}
          {viewMode === 'day' &&
            `${currentDate.toLocaleDateString('zh-TW')} (${
              ['日', '一', '二', '三', '四', '五', '六'][
                currentDate.getDay()
              ]
            })`}
        </h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'month'
                ? 'bg-white shadow text-blue-600 font-bold'
                : 'text-gray-600'
            }`}
          >
            月
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'week'
                ? 'bg-white shadow text-blue-600 font-bold'
                : 'text-gray-600'
            }`}
          >
            週
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'day'
                ? 'bg-white shadow text-blue-600 font-bold'
                : 'text-gray-600'
            }`}
          >
            日
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto">
        {!publicMode && (
          <div className="flex bg-gray-100 rounded-lg p-1 overflow-x-auto">
            <button
              onClick={() => setFilterRegion('all')}
              className={`px-3 py-1 text-sm whitespace-nowrap rounded ${
                filterRegion === 'all'
                  ? 'bg-gray-800 text-white shadow'
                  : 'text-gray-600'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterRegion('North')}
              className={`px-3 py-1 text-sm whitespace-nowrap rounded ${
                filterRegion === 'North'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600'
              }`}
            >
              北部
            </button>
            <button
              onClick={() => setFilterRegion('Central')}
              className={`px-3 py-1 text-sm whitespace-nowrap rounded ${
                filterRegion === 'Central'
                  ? 'bg-yellow-600 text-white shadow'
                  : 'text-gray-600'
              }`}
            >
              中部
            </button>
            <button
              onClick={() => setFilterRegion('South')}
              className={`px-3 py-1 text-sm whitespace-nowrap rounded ${
                filterRegion === 'South'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-gray-600'
              }`}
            >
              南部
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={prevPeriod}
            className="p-2 hover:bg-gray-100 rounded border"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={nextPeriod}
            className="p-2 hover:bg-gray-100 rounded border"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );

  const renderMonthView = () => {
    const days = Array.from(
      {
        length: getDaysInMonth(
          currentDate.getFullYear(),
          currentDate.getMonth(),
        ),
      },
      (_, i) => i + 1,
    );
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
        {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
          <div
            key={d}
            className="bg-gray-50 p-2 text-center font-bold text-gray-500"
          >
            {d}
          </div>
        ))}
        {blanks.map((b) => (
          <div key={`blank-${b}`} className="bg-white min-h-[100px]" />
        ))}
        {days.map((day) => {
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day,
          );
          const events = getEventsForDay(date);

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className="bg-white min-h-[100px] p-2 border hover:bg-blue-50 transition relative cursor-pointer group"
            >
              <span className="text-sm text-gray-400 font-semibold absolute top-1 right-2 group-hover:text-blue-600">
                {day}
              </span>
              <div className="mt-4 space-y-1">
                {events.map((e) => {
                  if (e.kind === 'quote') {
                    const q = e.quote;
                    const first = q.items[0] || {};
                    const region = getQuoteRegion(q);
                    const timeText =
                      first.timeRange ||
                      first.startTime?.slice(0, 5) ||
                      '';
                    return (
                      <div
                        key={`q-${q.id}`}
                        className={`text-xs p-1 rounded border truncate ${regionColors[region]}`}
                        title={q.clientInfo.companyName}
                      >
                        {timeText && `${timeText} `}
                        {q.clientInfo.companyName}
                      </div>
                    );
                  }
                  const rc = e.regular;
                  const region = getRegularRegion(rc);
                  const timeText = rc.timeRange || '';
                  return (
                    <div
                      key={`r-${rc.id}`}
                      className={`text-xs p-1 rounded border truncate ${regionColors[region]}`}
                      title={rc.title}
                    >
                      {timeText && `${timeText} `}
                      {rc.title}（常態課）
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 border h-[600px]">
        {weekDays.map((date, i) => (
          <div key={i} className="bg-white flex flex-col h-full">
            <div className="p-2 border-b bg-gray-50 text-center font-bold">
              <div>
                {['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}
              </div>
              <div className="text-2xl">{date.getDate()}</div>
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-auto">
              {getEventsForDay(date).map((e) => {
                if (e.kind === 'quote') {
                  const q = e.quote;
                  const first = q.items[0] || {};
                  const region = getQuoteRegion(q);
                  const timeText =
                    first.timeRange ||
                    first.startTime?.slice(0, 5) ||
                    '';
                  return (
                    <div
                      key={`q-${q.id}`}
                      className={`text-xs p-2 rounded border shadow-sm ${regionColors[region]}`}
                    >
                      <div className="font-bold">{timeText}</div>
                      <div>{q.clientInfo.companyName}</div>
                      <div className="text-[10px] mt-1 opacity-75">
                        {first.courseName}
                      </div>
                    </div>
                  );
                }
                const rc = e.regular;
                const region = getRegularRegion(rc);
                const timeText = rc.timeRange || '';
                return (
                  <div
                    key={`r-${rc.id}`}
                    className={`text-xs p-2 rounded border shadow-sm ${regionColors[region]}`}
                  >
                    <div className="font-bold">{timeText}</div>
                    <div>{rc.title}（常態課）</div>
                    <div className="text-[10px] mt-1 opacity-75">
                      {rc.city}店內
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const events = getEventsForDay(currentDate).sort((a, b) => {
      const getTimeKey = (e) => {
        if (e.kind === 'quote') {
          const first = e.quote.items[0] || {};
          return (
            (first.timeRange || first.startTime || '').slice(0, 5) || '00:00'
          );
        }
        const rc = e.regular;
        return (rc.timeRange || '').slice(0, 5) || '00:00';
      };
      return getTimeKey(a).localeCompare(getTimeKey(b));
    });

    return (
      <div className="border rounded-lg bg-white min-h-[500px] p-6">
        <h3 className="text-xl font-bold mb-6 border-b pb-4">行程列表</h3>
        {events.length === 0 ? (
          <div className="text-gray-400 text-center py-10">
            本日無行程
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((e) => {
              if (e.kind === 'quote') {
                const q = e.quote;
                const first = q.items[0] || {};
                const region = getQuoteRegion(q);
                const timeText = first.timeRange || first.startTime || '';
                return (
                  <div
                    key={`q-${q.id}`}
                    className={`flex items-start p-4 rounded-lg border-l-4 shadow-sm bg-white ${
                      region.includes('North')
                        ? 'border-l-blue-500'
                        : region.includes('Central')
                        ? 'border-l-yellow-500'
                        : 'border-l-green-500'
                    }`}
                  >
                    <div className="mr-6 text-center min-w-[80px]">
                      <div className="text-xl font-bold text-gray-800">
                        {timeText}
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${regionColors[region]}`}
                      >
                        {region === 'North'
                          ? '北部'
                          : region === 'Central'
                          ? '中部'
                          : '南部'}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        {q.clientInfo.companyName}
                      </h4>
                      <div className="text-gray-600 mt-1 flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {first.courseName} ({first.peopleCount} 人)
                      </div>
                      <div className="text-gray-500 mt-1 text-sm flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {first.city} {first.address}
                      </div>
                      {!publicMode && (
                        <div className="mt-2 text-sm text-gray-500">
                          聯絡人：{q.clientInfo.contactPerson}（
                          {q.clientInfo.phone}）
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              const rc = e.regular;
              const region = getRegularRegion(rc);
              const timeText = rc.timeRange || '';

              return (
                <div
                  key={`r-${rc.id}`}
                  className={`flex items-start p-4 rounded-lg border-l-4 shadow-sm bg-white ${
                    region.includes('North')
                      ? 'border-l-blue-500'
                      : region.includes('Central')
                      ? 'border-l-yellow-500'
                      : 'border-l-green-500'
                  }`}
                >
                  <div className="mr-6 text-center min-w-[80px]">
                    <div className="text-xl font-bold text-gray-800">
                      {timeText}
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${regionColors[region]}`}
                    >
                      {region === 'North'
                        ? '北部'
                        : region === 'Central'
                        ? '中部'
                        : '南部'}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      {rc.title}（常態課）
                    </h4>
                    <div className="text-gray-500 mt-1 text-sm flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {rc.city}店內
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const handleRegularSubmit = () => {
    if (!onCreateRegularClass) return;
    if (!regularForm.title || !regularForm.date) {
      alert('請填寫課程名稱與日期');
      return;
    }
    const city = regularForm.city;
    const region =
      city === '台北' ? 'North' : city === '台中' ? 'Central' : 'South';

    onCreateRegularClass({
      title: regularForm.title,
      date: regularForm.date,
      timeRange: regularForm.timeRange,
      city,
      region,
    });

    setShowRegularForm(false);
    setRegularForm({
      title: '',
      date: '',
      timeRange: '',
      city: '台北',
    });
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow relative">
      {publicMode && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm font-bold text-center rounded border border-blue-200 flex items-center justify-center">
          <Lock className="w-4 h-4 mr-2" />
          此頁為行程分享連結（唯讀模式）
        </div>
      )}

      {renderHeader()}

      {/* 內部模式下：新增常態課 + 複製分享連結按鈕 */}
      {!publicMode && (
        <div className="flex justify-between mb-4 gap-2 flex-wrap">
          <button
            onClick={() => setShowRegularForm(true)}
            className="px-3 py-1 text-xs bg-purple-50 text-purple-800 rounded border border-purple-200 hover:bg-purple-100 flex items-center"
          >
            <Plus className="w-3 h-3 mr-1" />
            新增常態課（老師排課）
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => copyLink('North')}
              className="px-3 py-1 text-xs bg-blue-50 text-blue-800 rounded border border-blue-200 hover:bg-blue-100 flex items-center"
            >
              <LinkIcon className="w-3 h-3 mr-1" />
              複製北部行程連結
            </button>
            <button
              onClick={() => copyLink('Central')}
              className="px-3 py-1 text-xs bg-yellow-50 text-yellow-800 rounded border border-yellow-200 hover:bg-yellow-100 flex items-center"
            >
              <LinkIcon className="w-3 h-3 mr-1" />
              複製中部行程連結
            </button>
            <button
              onClick={() => copyLink('South')}
              className="px-3 py-1 text-xs bg-green-50 text-green-800 rounded border border-green-200 hover:bg-green-100 flex items-center"
            >
              <LinkIcon className="w-3 h-3 mr-1" />
              複製南部行程連結
            </button>
          </div>
        </div>
      )}

      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}

      {/* 常態課建立 Modal */}
      {showRegularForm && !publicMode && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                新增常態課（老師排課）
              </h3>
              <button
                onClick={() => setShowRegularForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={LABEL_CLASS}>課程名稱</label>
                <input
                  className={INPUT_CLASS}
                  placeholder="例如：水晶手鍊常態班"
                  value={regularForm.title}
                  onChange={(e) =>
                    setRegularForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>日期</label>
                  <input
                    type="date"
                    className={INPUT_CLASS}
                    value={regularForm.date}
                    onChange={(e) =>
                      setRegularForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>時間（選填）</label>
                  <input
                    className={INPUT_CLASS}
                    placeholder="例如：14:00-16:00"
                    value={regularForm.timeRange}
                    onChange={(e) =>
                      setRegularForm((prev) => ({
                        ...prev,
                        timeRange: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className={LABEL_CLASS}>地區（店內）</label>
                <select
                  className={INPUT_CLASS}
                  value={regularForm.city}
                  onChange={(e) =>
                    setRegularForm((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                >
                  <option value="台北">台北店內（北部）</option>
                  <option value="台中">台中店內（中部）</option>
                  <option value="高雄">高雄店內（南部）</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowRegularForm(false)}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleRegularSubmit}
                className="px-6 py-2 text-sm bg-blue-600 text-white rounded font-bold hover:bg-blue-700 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                儲存常態課
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ========== 報價單列表（追蹤清單 + 月份/狀態篩選 + CSV） ==========

const QuoteList = ({
  quotes,
  onCreateNew,
  onEdit,
  onPreview,
  onDelete,
  onChangeStatus,
  onSwitchView,
  onExportCSV,
  onImportCSV,
}) => {
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const fileInputRef = useRef(null);

  const availableMonths = useMemo(() => {
    const months = new Set();
    quotes.forEach((q) => {
      if (!q.createdAt) return;
      const d = getSafeDate(q.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}`;
      months.add(key);
    });
    return Array.from(months).sort().reverse();
  }, [quotes]);

  const filtered = quotes.filter((q) => {
    // 月份篩選
    if (filterMonth !== 'all') {
      const d = getSafeDate(q.createdAt);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}`;
      if (monthKey !== filterMonth) return false;
    }

    // 狀態篩選
    if (filterStatus !== 'all') {
      const s = q.status || 'draft';
      if (s !== filterStatus) return false;
    }

    // 搜尋篩選
    if (!search.trim()) return true;
    const kw = search.trim();
    const firstItem = q.items[0] || {};
    return (
      (q.clientInfo.companyName || '').includes(kw) ||
      (firstItem.courseName || '').includes(kw)
    );
  });

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImportCSV) {
      onImportCSV(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* 上方工具列 */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Folder className="w-6 h-6 mr-2 text-blue-600" />
            報價單管理
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            已建立 {quotes.length} 筆報價單
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* 月份篩選 */}
          <select
            className="px-2 py-2 text-sm rounded border border-gray-300 bg-white"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="all">全部月份</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* 狀態篩選 */}
          <select
            className="px-2 py-2 text-sm rounded border border-gray-300 bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">全部狀態</option>
            <option value="draft">草稿</option>
            <option value="pending">報價中</option>
            <option value="confirmed">已回簽</option>
            <option value="paid">已付訂</option>
            <option value="closed">已結案</option>
          </select>

          {/* 搜尋 */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              className="pl-8 pr-3 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="搜尋公司名稱 / 課程名稱"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* CSV 匯出 / 匯入 */}
          <button
            onClick={onExportCSV}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Download className="w-4 h-4 mr-1" />
            匯出 CSV
          </button>
          <button
            onClick={handleImportClick}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Upload className="w-4 h-4 mr-1" />
            匯入 CSV
          </button>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* 視圖切換 */}
          <button
            onClick={() => onSwitchView('calendar')}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Calendar className="w-4 h-4 mr-1" />
            行事曆
          </button>
          <button
            onClick={() => onSwitchView('stats')}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            統計
          </button>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 flex items-center shadow"
          >
            <Plus className="w-4 h-4 mr-1" />
            新增報價單
          </button>
        </div>
      </div>

      {/* 列表 */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">
                建立日期
              </th>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">
                客戶名稱
              </th>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">
                課程摘要
              </th>
              <th className="px-4 py-2 text-right text-gray-500 font-medium">
                總金額
              </th>
              <th className="px-4 py-2 text-center text-gray-500 font-medium">
                地區
              </th>
              <th className="px-4 py-2 text-center text-gray-500 font-medium">
                狀態
              </th>
              <th className="px-4 py-2 text-right text-gray-500 font-medium">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  尚無符合條件的報價單
                </td>
              </tr>
            )}

            {filtered.map((q) => {
              const first = q.items[0] || {};
              const region =
                first.outingRegion || first.regionType || 'North';
              const regionText =
                region === 'North'
                  ? '北部'
                  : region === 'Central'
                  ? '中部'
                  : '南部';

              return (
                <tr
                  key={q.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-2 align-middle">
                    {formatDate(q.createdAt)}
                  </td>
                  <td className="px-4 py-2 align-middle">
                    <div className="font-medium text-gray-800">
                      {q.clientInfo.companyName || '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {q.clientInfo.contactPerson || ''}
                    </div>
                  </td>
                  <td className="px-4 py-2 align-middle">
                    <div className="text-gray-800">
                      {first.courseName || '-'}
                    </div>
                    {q.items.length > 1 && (
                      <div className="text-xs text-gray-500">
                        + 其他 {q.items.length - 1} 堂課
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right align-middle font-bold text-gray-800">
                    ${Number(q.totalAmount || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-center align-middle">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        region === 'North'
                          ? 'bg-blue-50 text-blue-700'
                          : region === 'Central'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {regionText}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center align-middle">
                    <StatusSelector
                      status={q.status || 'draft'}
                      onChange={(value) => onChangeStatus(q, value)}
                    />
                  </td>
                  <td className="px-4 py-2 text-right align-middle">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onPreview(q)}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center"
                      >
                        <Printer className="w-3 h-3 mr-1" />
                        預覽
                      </button>
                      <button
                        onClick={() => onEdit(q)}
                        className="px-2 py-1 text-xs bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50 flex items-center"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        編輯
                      </button>
                      <button
                        onClick={() => onDelete(q)}
                        className="px-2 py-1 text-xs bg-white border border-red-300 text-red-700 rounded hover:bg-red-50 flex items-center"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========== App 主元件 ==========

const App = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlView = urlParams.get('view');
  const urlMode = urlParams.get('mode');

  const [quotes, setQuotes] = useState([]);
  const [regularClasses, setRegularClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState(
    urlView === 'calendar' ? 'calendar' : 'list',
  );
  const [editingQuote, setEditingQuote] = useState(null);
  const [previewQuote, setPreviewQuote] = useState(null);

  const publicCalendarMode = urlMode === 'public' && urlView === 'calendar';

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const qRef = query(
      collection(db, 'quotes'),
      orderBy('createdAt', 'desc'),
    );

    const unsubQuotes = onSnapshot(
      qRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setQuotes(list);
        setLoading(false);
      },
      (err) => {
        console.error('取得 quotes 失敗', err);
        setLoading(false);
      },
    );

    // 監聽老師常態課 regularClasses
    const rRef = query(
      collection(db, 'regularClasses'),
      orderBy('date', 'asc'),
    );
    const unsubRegular = onSnapshot(
      rRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setRegularClasses(list);
      },
      (err) => {
        console.error('取得 regularClasses 失敗', err);
      },
    );

    return () => {
      unsubQuotes && unsubQuotes();
      unsubRegular && unsubRegular();
    };
  }, []);

  const handleSaveQuote = async (data) => {
    try {
      if (!db) {
        alert('沒有連線 Firebase，僅在前端參考使用。');
        setQuotes((prev) => {
          if (editingQuote?.id) {
            return prev.map((q) =>
              q.id === editingQuote.id ? { ...q, ...data } : q,
            );
          }
          return [
            {
              id: generateId(),
              ...data,
              createdAt: new Date(),
            },
            ...prev,
          ];
        });
      } else if (editingQuote?.id) {
        await updateDoc(doc(db, 'quotes', editingQuote.id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'quotes'), {
          ...data,
          status: data.status || 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setEditingQuote(null);
      setCurrentView('list');
    } catch (err) {
      console.error('儲存報價單失敗', err);
      alert('儲存失敗，請稍後再試。');
    }
  };

  const handleDeleteQuote = async (q) => {
    if (!window.confirm(`確定要刪除「${q.clientInfo.companyName}」這筆報價單？`))
      return;

    try {
      if (db) {
        await deleteDoc(doc(db, 'quotes', q.id));
      }
      setQuotes((prev) => prev.filter((x) => x.id !== q.id));
    } catch (err) {
      console.error('刪除失敗', err);
      alert('刪除失敗，請稍後再試。');
    }
  };

  const handleChangeStatus = async (quote, newStatus) => {
    try {
      if (db) {
        await updateDoc(doc(db, 'quotes', quote.id), {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
      }
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === quote.id ? { ...q, status: newStatus } : q,
        ),
      );
    } catch (err) {
      console.error('更新狀態失敗', err);
      alert('更新狀態失敗，請稍後再試。');
    }
  };

  const handleCreateRegularClass = async (data) => {
    try {
      if (db) {
        await addDoc(collection(db, 'regularClasses'), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        setRegularClasses((prev) => [
          {
            id: generateId(),
            ...data,
            createdAt: new Date(),
          },
          ...prev,
        ]);
      }
      alert('已新增常態課');
    } catch (err) {
      console.error('新增常態課失敗', err);
      alert('新增常態課失敗，請稍後再試。');
    }
  };

  // CSV 匯出
  const handleExportCSV = () => {
    if (!quotes || quotes.length === 0) {
      alert('目前沒有報價單可以匯出。');
      return;
    }

    const headers = [
      'id',
      'createdAt',
      'status',
      'companyName',
      'taxId',
      'contactPerson',
      'phone',
      'totalAmount',
      'itemsJson',
    ];

    const escapeCsv = (value) => {
      if (value == null) return '""';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = quotes.map((q) => {
      const createdAt = getSafeDate(q.createdAt).toISOString();
      const itemsJson = JSON.stringify(q.items || []);
      const cells = [
        q.id || '',
        createdAt,
        q.status || '',
        q.clientInfo?.companyName || '',
        q.clientInfo?.taxId || '',
        q.clientInfo?.contactPerson || '',
        q.clientInfo?.phone || '',
        q.totalAmount != null ? q.totalAmount : '',
        itemsJson,
      ];
      return cells.map(escapeCsv).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes-export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 簡易 CSV parser（支援引號與逗號）
  const parseCsvLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  // CSV 匯入
  const handleImportCSV = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = String(e.target.result || '');
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l);
        if (lines.length <= 1) {
          alert('CSV 內容為空或沒有資料列。');
          return;
        }

        const headers = parseCsvLine(lines[0]);
        const idxId = headers.indexOf('id');
        const idxCreatedAt = headers.indexOf('createdAt');
        const idxStatus = headers.indexOf('status');
        const idxCompanyName = headers.indexOf('companyName');
        const idxTaxId = headers.indexOf('taxId');
        const idxContactPerson = headers.indexOf('contactPerson');
        const idxPhone = headers.indexOf('phone');
        const idxTotalAmount = headers.indexOf('totalAmount');
        const idxItemsJson = headers.indexOf('itemsJson');

        if (
          idxId === -1 ||
          idxCreatedAt === -1 ||
          idxStatus === -1 ||
          idxCompanyName === -1 ||
          idxItemsJson === -1
        ) {
          alert('CSV 欄位格式不正確，請使用系統匯出的原始格式。');
          return;
        }

        const importedDocs = [];

        for (let i = 1; i < lines.length; i += 1) {
          const line = lines[i];
          if (!line.trim()) continue;
          const cells = parseCsvLine(line);
          const safe = (idx) =>
            idx >= 0 && idx < cells.length ? cells[idx] : '';

          const idRaw = safe(idxId);
          const id = idRaw || generateId();

          const createdAtStr = safe(idxCreatedAt);
          const status = safe(idxStatus) || 'pending';
          const companyName = safe(idxCompanyName);
          const taxId = safe(idxTaxId);
          const contactPerson = safe(idxContactPerson);
          const phone = safe(idxPhone);
          const totalAmountStr = safe(idxTotalAmount);
          const totalAmount = totalAmountStr
            ? Number(totalAmountStr)
            : 0;

          let items = [];
          const itemsJsonStr = safe(idxItemsJson);
          try {
            items = itemsJsonStr ? JSON.parse(itemsJsonStr) : [];
          } catch (err) {
            console.warn('解析 itemsJson 失敗，該列略過 items', err);
          }

          const createdAt = createdAtStr
            ? new Date(createdAtStr)
            : new Date();

          const clientInfo = {
            companyName,
            taxId,
            contactPerson,
            phone,
          };

          const docData = {
            clientInfo,
            items,
            totalAmount,
            status,
            createdAt,
          };

          importedDocs.push({
            id,
            docData,
            localData: {
              id,
              clientInfo,
              items,
              totalAmount,
              status,
              createdAt,
            },
          });
        }

        if (importedDocs.length === 0) {
          alert('沒有任何有效資料列可匯入。');
          return;
        }

        if (db) {
          await Promise.all(
            importedDocs.map((item) =>
              setDoc(doc(db, 'quotes', item.id), {
                ...item.docData,
                updatedAt: serverTimestamp(),
              }),
            ),
          );
        } else {
          // 無 Firebase 模式：直接寫入前端 state
          setQuotes((prev) => {
            const map = new Map(prev.map((q) => [q.id, q]));
            importedDocs.forEach((item) => {
              map.set(item.id, item.localData);
            });
            return Array.from(map.values()).sort(
              (a, b) =>
                getSafeDate(b.createdAt) - getSafeDate(a.createdAt),
            );
          });
        }

        alert(`匯入完成，共 ${importedDocs.length} 筆資料。`);
      } catch (err) {
        console.error('匯入 CSV 失敗', err);
        alert('匯入失敗，請確認檔案格式是否正確。');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          資料載入中...
        </div>
      );
    }

    // 公開行事曆模式：只顯示行事曆
    if (publicCalendarMode) {
      return (
        <CalendarView
          quotes={quotes}
          regularClasses={regularClasses}
          publicMode={true}
        />
      );
    }

    // 編輯 / 新增報價單
    if (editingQuote) {
      return (
        <QuoteCreator
          initialData={editingQuote}
          onSave={handleSaveQuote}
          onCancel={() => {
            setEditingQuote(null);
            setCurrentView('list');
          }}
        />
      );
    }

    // 其它主視圖
    if (currentView === 'calendar') {
      return (
        <CalendarView
          quotes={quotes}
          regularClasses={regularClasses}
          publicMode={false}
          onCreateRegularClass={handleCreateRegularClass}
        />
      );
    }

    if (currentView === 'stats') {
      return <StatsView quotes={quotes} />;
    }

    // 預設：列表視圖
    return (
      <QuoteList
        quotes={quotes}
        onCreateNew={() => {
          setEditingQuote({}); // 新增：給空資料，讓 QuoteCreator 走預設
          setCurrentView('list');
        }}
        onEdit={(q) => {
          setEditingQuote(q);
          setCurrentView('list');
        }}
        onPreview={(q) => setPreviewQuote(q)}
        onDelete={handleDeleteQuote}
        onChangeStatus={handleChangeStatus}
        onSwitchView={(view) => setCurrentView(view)}
        onExportCSV={handleExportCSV}
        onImportCSV={handleImportCSV}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              下
            </div>
            <div>
              <div className="font-bold text-gray-800">
                下班隨手作｜企業報價系統
              </div>
              <div className="text-xs text-gray-500">
                內部管理系統 v2.0
              </div>
            </div>
          </div>

          <nav className="flex gap-2 text-sm overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => {
                setEditingQuote(null);
                setCurrentView('list');
              }}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                currentView === 'list' && !editingQuote
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              追蹤清單
            </button>
            <button
              onClick={() => {
                setEditingQuote({});
                setCurrentView('list'); // 讓狀態變更觸發 renderContent -> QuoteCreator
              }}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                editingQuote && Object.keys(editingQuote).length === 0
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              新增報價
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                currentView === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              行事曆
            </button>
            <button
              onClick={() => setCurrentView('stats')}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                currentView === 'stats'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              業績統計
            </button>
          </nav>
        </div>
      </div>

      {renderContent()}
      {previewQuote && (
        <PreviewModal
          quote={previewQuote}
          onClose={() => setPreviewQuote(null)}
        />
      )}
    </div>
  );
};

export default App;