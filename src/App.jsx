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
              error = `北部遠程外派(${city.replace(/\(.*\)/, '')})最低出課人數為 25 人`;
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
          <p>報價日期: ${dateStr}</p>
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
                    $${Number(item.price || 0).toLocaleString()}
                  </td>
                  <td className="p-2 text-right text-gray-600">
                    {item.peopleCount}
                  </td>
                  <td className="p-2 text-right font-medium">
                    $${item.calc.subTotal.toLocaleString()}
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
                      車馬費 ({item.city.replace(/\(.*\)/, '')}
                      {item.area})
                    </td>
                    <td className="p-1 text-right font-bold">
                      +$${item.calc.transportFee.toLocaleString()}
                    </td>
                  </tr>
                )}

                {item.calc.teacherFee > 0 && (
                  <tr className="bg-green-50 text-[10px] text-green-900 break-inside-avoid">
                    <td colSpan={3} className="p-1 pl-2 text-right">
                      師資費
                    </td>
                    <td className="p-1 text-right font-bold">
                      +$${item.calc.teacherFee.toLocaleString()}
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
                          +$${parseInt(fee.amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}

                {item.hasInvoice && (
                  <tr className="bg-green-50 text-[10px] text-green-900 break-inside-avoid">
                    <td colSpan={3} className="p-1 pl-2 text-right">
                      營業稅 (5%)
                    </td>
                    <td className="p-1 text-right font-bold">
                      +$${item.calc.tax.toLocaleString()}
                    </td>
                  </tr>
                )}

                <tr className="bg-gray-100 font-bold text-gray-900 border-b-2 border-gray-300 break-inside-avoid text-xs">
                  <td colSpan={3} className="p-1.5 text-right">
                    項目總計
                  </td>
                  <td className="p-1.5 text-right">
                    $${item.calc.finalTotal.toLocaleString()}
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
            <span>$${totalAmount.toLocaleString()}</span>
          </div>
          <p className="text-right text-[10px] text-gray-500 mt-1">
            總金額
          </p>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="mt-2 pt-2 border-t-2 border-gray-800 text-[10px] text-gray-700 leading-relaxed break-inside-avoid">
        <h4 className="font-bold text-xs mb-1">注意事項 / 條款：</h4>
        <div className="space-y-0.5">
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
              <div className="w-4 pr-1 text-right">{index + 1}.</div>
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
        <div className="mt-2 p-2 bg-gray-100 rounded border border-gray-300">
          <p className="font-bold text-[10px]">
            銀行：玉山銀行 永安分行 808　戶名：下班文化國際有限公司　帳號：1115-940-021201
          </p>
        </div>
      </div>

      {/* 簽章區 */}
      <div
        className="mt-4 border-t border-gray-300 flex justify-between text-sm items-end relative break-inside-avoid"
        style={{ pageBreakInside: 'avoid' }}
      >
        {/* 左邊：公司代表 + 印章 */}
        <div className="relative mt-2 h-32 w-1/2">
          {isSigned && (
            <img
              src={stampUrl || STAMP_URL}
              alt="Company Stamp"
              crossOrigin="anonymous"
              className="absolute top-0 left-36 w-[152px] opacity-90 rotate-[-5deg]"
              style={{ mixBlendMode: 'multiply', zIndex: 0 }}
              onError={() =>
                console.warn(
                  'Stamp load failed，PDF 可能看不到印章（CORS 問題）',
                )
              }
            />
          )}
          {/* 文字定位在底部 */}
          <div className="absolute bottom-2 left-0 z-10 w-full">
             <p className="font-bold text-sm">下班隨手作代表：_________________</p>
          </div>
        </div>

        {/* 右邊：客戶簽章 */}
        <div className="relative mt-2 h-32 w-1/2 flex items-end justify-end">
          <div className="absolute bottom-2 right-0">
             <p className="font-bold text-sm">客戶確認簽章：_________________</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== PaymentModal ==========

const PaymentModal = ({ quote, onClose, onSave }) => {
  const [data, setData] = useState({
    depositAmount: quote.depositAmount || '',
    depositNote: quote.depositNote || '',
    adjustmentAmount: quote.adjustmentAmount || '',
    adjustmentNote: quote.adjustmentNote || '',
  });

  const total = quote.totalAmount || 0;
  const deposit = parseInt(data.depositAmount || 0);
  const adjustment = parseInt(data.adjustmentAmount || 0);
  const remaining = total - deposit + adjustment;

  const handleSubmit = () => {
    onSave(quote.id, data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="bg-orange-500 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            款項管理 - {quote.clientInfo.companyName}
          </h3>
          <button
            onClick={onClose}
            className="hover:bg-orange-600 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <span className="text-gray-500 font-medium">報價總額</span>
            <span className="text-2xl font-bold text-gray-800">
              $${total.toLocaleString()}
            </span>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              預收訂金 (減項)
            </label>
            <div className="flex gap-2 mb-2">
              <span className="flex items-center text-gray-500 font-bold px-2">
                $
              </span>
              <input
                type="number"
                className="w-full border rounded p-2 focus:ring-2 focus:ring-orange-300 outline-none"
                placeholder="0"
                value={data.depositAmount}
                onChange={(e) =>
                  setData({ ...data, depositAmount: e.target.value })
                }
              />
            </div>
            <input
              type="text"
              className="w-full border rounded p-2 text-sm"
              placeholder="訂金備註 (如: 匯款後五碼)"
              value={data.depositNote}
              onChange={(e) =>
                setData({ ...data, depositNote: e.target.value })
              }
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              追加金額 (加項)
            </label>
            <div className="flex gap-2 mb-2">
              <span className="flex items-center text-gray-500 font-bold px-2">
                $
              </span>
              <input
                type="number"
                className="w-full border rounded p-2 focus:ring-2 focus:ring-orange-300 outline-none"
                placeholder="0"
                value={data.adjustmentAmount}
                onChange={(e) =>
                  setData({ ...data, adjustmentAmount: e.target.value })
                }
              />
            </div>
            <input
              type="text"
              className="w-full border rounded p-2 text-sm"
              placeholder="追加備註 (如: 現場加人)"
              value={data.adjustmentNote}
              onChange={(e) =>
                setData({ ...data, adjustmentNote: e.target.value })
              }
            />
          </div>

          <div className="bg-orange-50 p-4 rounded-lg flex justify-between items-center">
            <span className="text-orange-800 font-bold">
              待付款金額 (尾款)
            </span>
            <span className="text-2xl font-bold text-orange-600">
              $${remaining.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-4 bg-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-orange-600 text-white rounded font-bold hover:bg-orange-700"
          >
            儲存款項資訊
          </button>
        </div>
      </div>
    </div>
  );
};

const PreviewModal = ({ quote, onClose }) => {
  const [isSigned, setIsSigned] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const displayDateStr = formatDate(quote.createdAt || new Date());

  // ★★★ 修正：產生 Excel 的核心函式 (最終版：包含樣式、圖片、頁面設定) ★★★
  const generateExcel = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('報價單', {
        pageSetup: {
          paperSize: 9, // A4
          orientation: 'portrait',
          fitToWidth: 1,
          fitToHeight: 1,
          margins: {
            left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3
          }
        }
      });

      worksheet.columns = [
        { key: 'A', width: 45 }, { key: 'B', width: 15 },
        { key: 'C', width: 10 }, { key: 'D', width: 20 },
      ];

      const titleRow = worksheet.addRow(['下班隨手作活動報價單']);
      worksheet.mergeCells(`A\${titleRow.number}:D\${titleRow.number}`);
      titleRow.getCell(1).font = { name: '微軟正黑體', size: 20, bold: true };
      titleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      
      const dateRow1 = worksheet.addRow(['', '', '', `報價日期: \${displayDateStr}`]);
      worksheet.mergeCells(`A\${dateRow1.number}:C\${dateRow1.number}`);
      dateRow1.getCell(4).font = { size: 10 };
      dateRow1.getCell(4).alignment = { horizontal: 'right' };
      const dateRow2 = worksheet.addRow(['', '', '', '有效期限：3天']);
      worksheet.mergeCells(`A\${dateRow2.number}:C\${dateRow2.number}`);
      dateRow2.getCell(4).font = { size: 10, bold: true };
      dateRow2.getCell(4).alignment = { horizontal: 'right' };
      worksheet.addRow([]);

      const infoStartRow = worksheet.lastRow.number + 1;
      worksheet.getCell(`A\${infoStartRow}`).value = '品牌單位';
      worksheet.getCell(`A\${infoStartRow}`).font = { bold: true, size: 12 };
      worksheet.getCell(`A\${infoStartRow}`).border = { bottom: { style: 'thin' } };
      worksheet.getCell(`A\${infoStartRow + 1}`).value = '公司行號: 下班文化國際有限公司';
      worksheet.getCell(`A\${infoStartRow + 2}`).value = '統一編號: 83475827';
      worksheet.getCell(`A\${infoStartRow + 3}`).value = '聯絡電話: 02-2371-4171';
      worksheet.getCell(`A\${infoStartRow + 4}`).value = '聯絡人: 下班隨手作';

      const rightCol = 'B';
      worksheet.getCell(`\${rightCol}\${infoStartRow}`).value = '客戶資料';
      worksheet.mergeCells(`\${rightCol}\${infoStartRow}:D\${infoStartRow}`);
      worksheet.getCell(`\${rightCol}\${infoStartRow}`).font = { bold: true, size: 12 };
      worksheet.getCell(`\${rightCol}\${infoStartRow}`).border = { bottom: { style: 'thin' } };
      worksheet.getCell(`\${rightCol}\${infoStartRow + 1}`).value = `名稱: \${quote.clientInfo.companyName || '-'}`;
      worksheet.mergeCells(`\${rightCol}\${infoStartRow + 1}:D\${infoStartRow + 1}`);
      worksheet.getCell(`\${rightCol}\${infoStartRow + 2}`).value = `統編: \${quote.clientInfo.taxId || '-'}`;
      worksheet.mergeCells(`\${rightCol}\${infoStartRow + 2}:D\${infoStartRow + 2}`);
      worksheet.getCell(`\${rightCol}\${infoStartRow + 3}`).value = `聯絡人: \${quote.clientInfo.contactPerson || '-'}`;
      worksheet.mergeCells(`\${rightCol}\${infoStartRow + 3}:D\${infoStartRow + 3}`);
      worksheet.getCell(`\${rightCol}\${infoStartRow + 4}`).value = `電話: \${quote.clientInfo.phone || '-'}`;
      worksheet.mergeCells(`\${rightCol}\${infoStartRow + 4}:D\${infoStartRow + 4}`);
      worksheet.addRow([]);
      worksheet.addRow([]);

      const headerRow = worksheet.addRow(['項目', '單價', '人數', '小計']);
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF333333' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      headerRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
      headerRow.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' };

      quote.items.forEach((item) => {
          const itemRow = worksheet.addRow([item.courseName, item.price, item.peopleCount, item.calc.subTotal]);
          itemRow.getCell(1).font = { bold: true };
          itemRow.getCell(2).numFmt = '"$"#,##0';
          itemRow.getCell(4).numFmt = '"$"#,##0';
          itemRow.getCell(4).font = { bold: true };

          let details = [];
          if (item.itemNote) details.push(`[備註] \${item.itemNote}`);
          if (item.eventDate) details.push(`時間: \${formatDateWithDay(item.eventDate)} \${item.timeRange || ''}`);
          if (item.address) details.push(`地點: \${item.address}`);
          if (details.length > 0) {
              const detailRow = worksheet.addRow([details.join('\n')]);
              worksheet.mergeCells(`A\${detailRow.number}:D\${detailRow.number}`);
              detailRow.height = details.length * 15;
              detailRow.getCell(1).alignment = { wrapText: true, vertical: 'top' };
              detailRow.getCell(1).font = { color: { argb: 'FF666666' }, size: 10 };
          }

          if (item.calc.isDiscountApplied || item.customDiscount > 0) {
              const val = (item.calc.discountAmount || 0) + (parseInt(item.customDiscount || 0) || 0);
              const row = worksheet.addRow(['', '', '折扣優惠', -val]);
              worksheet.mergeCells(`A\${row.number}:C\${row.number}`);
              row.getCell(3).alignment = { horizontal: 'right' };
              row.getCell(3).font = { color: { argb: 'FFFF0000' } };
              row.getCell(4).font = { color: { argb: 'FFFF0000' }, bold: true };
              row.getCell(4).numFmt = '"-$"#,##0';
              row.eachCell(c => c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F0' } });
          }

          if (item.calc.transportFee > 0) {
              const row = worksheet.addRow(['', '', `車馬費 (\${item.city}\${item.area})`, item.calc.transportFee]);
              worksheet.mergeCells(`A\${row.number}:C\${row.number}`);
              row.getCell(3).alignment = { horizontal: 'right' };
              row.getCell(4).numFmt = '"+"#,##0';
          }
          if (item.calc.teacherFee > 0) {
              const row = worksheet.addRow(['', '', '師資費', item.calc.teacherFee]);
              worksheet.mergeCells(`A\${row.number}:C\${row.number}`);
              row.getCell(3).alignment = { horizontal: 'right' };
              row.getCell(4).numFmt = '"+"#,##0';
          }
          if (item.extraFees) {
              item.extraFees.filter(f => f.isEnabled).forEach(fee => {
                  const row = worksheet.addRow(['', '', `加價: \${fee.description}`, parseInt(fee.amount)]);
                  worksheet.mergeCells(`A\${row.number}:C\${row.number}`);
                  row.getCell(3).alignment = { horizontal: 'right' };
                  row.getCell(4).numFmt = '"+"#,##0';
              });
          }
          if (item.hasInvoice) {
              const row = worksheet.addRow(['', '', '營業稅 (5%)', item.calc.tax]);
              worksheet.mergeCells(`A\${row.number}:C\${row.number}`);
              row.getCell(3).alignment = { horizontal: 'right' };
              row.getCell(4).numFmt = '"+"#,##0';
          }
          
          const itemTotalRow = worksheet.addRow(['', '', '項目總計', item.calc.finalTotal]);
          worksheet.mergeCells(`A\${itemTotalRow.number}:C\${itemTotalRow.number}`);
          itemTotalRow.eachCell(c => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } };
            c.font = { bold: true };
          });
          itemTotalRow.getCell(3).alignment = { horizontal: 'right' };
          itemTotalRow.getCell(4).alignment = { horizontal: 'right' };
          itemTotalRow.getCell(4).numFmt = '"$"#,##0';

          worksheet.addRow([]);
      });

      worksheet.addRow([]);
      const totalRow = worksheet.addRow(['', '', '總金額', quote.totalAmount]);
      worksheet.mergeCells(`A\${totalRow.number}:B\${totalRow.number}`);
      
      const totalCellC = totalRow.getCell(3);
      const totalCellD = totalRow.getCell(4);
      totalCellC.font = { size: 14, bold: true };
      totalCellC.alignment = { horizontal: 'right', vertical: 'middle' };
      totalCellD.font = { size: 16, bold: true, color: { argb: 'FF0000FF' } };
      totalCellD.numFmt = '"$"#,##0';
      totalCellD.alignment = { horizontal: 'right', vertical: 'middle' };
      [totalCellC, totalCellD].forEach(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });

      worksheet.addRow([]);
      const noteTitle = worksheet.addRow(['注意事項 / 條款：']);
      noteTitle.getCell(1).font = { bold: true };
      const notes = [
          '1. 本報價單有效時間以接到合作案3天為主，經買家簽章後則視為訂單確認單，並於活動前彼此簽訂總人數之報價單視同正式合作簽署，下班隨手作可依此作為收款依據。',
          '2. 人數以報價單協議人數為主，可再臨時新增但不能臨時減少，如當天未達人數老師會製作成品補齊給客戶。',
          '3. 教學老師依報價單數量人數進行分配，為鞏固教學品質，實際報價人數以報價單【數量】等同【現場課程參與人數】，超過報價數量人數則依現場實際增加人數加收陪同費，並於尾款一併收費。',
          '4. 客戶確認訂單簽章後，回傳 Mail：xiabenhow@gmail.com。或官方 Line：@xiabenhow 下班隨手作。',
          '5. 付款方式：確認日期金額，回傳報價單，並蓋章付50%訂金方可協議出課，於課當天結束後7天內匯款付清尾款。',
          '6. 已預定的課程，由於此時間老師已經推掉其他手作課程，恕無法無故延期，造成老師損失。',
          '銀行：玉山銀行 永安分行 808　戶名：下班文化國際有限公司　帳號：1115-940-021201'
      ];
      notes.forEach(note => {
          const r = worksheet.addRow([note]);
          worksheet.mergeCells(`A\${r.number}:D\${r.number}`);
          r.getCell(1).alignment = { wrapText: true };
          if (note.includes('付款方式')) r.getCell(1).font = { color: { argb: 'FFFF0000' }, bold: true };
      });

      worksheet.addRow([]);
      worksheet.addRow([]);
      
      const signRow = worksheet.addRow(['下班隨手作代表：_________________', '', '客戶確認簽章：_________________']);
      worksheet.mergeCells(`A\${signRow.number}:B\${signRow.number}`);
      worksheet.mergeCells(`C\${signRow.number}:D\${signRow.number}`);
      signRow.getCell(1).font = { bold: true };
      signRow.getCell(3).font = { bold: true };
      signRow.getCell(3).alignment = { horizontal: 'right' };
      
      if (isSigned) {
        try {
          const response = await fetch(STAMP_URL);
          const imageBuffer = await response.arrayBuffer();
          const imageId = workbook.addImage({
            buffer: imageBuffer,
            extension: 'png',
          });
          worksheet.addImage(imageId, {
            tl: { col: 1.5, row: signRow.number - 2 },
            ext: { width: 152, height: 152 }
          });
        } catch (imgError) {
          console.error("讀取印章圖片失敗:", imgError);
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `\${quote.clientInfo.companyName || '報價單'}_\${new Date().toISOString().slice(0, 10)}.xlsx`);

    } catch (error) {
      console.error("產生 Excel 失敗:", error);
      alert(`抱歉，產生 Excel 檔案時發生錯誤：\n\${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById('preview-modal-area');
    if (!element) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `\${quote.clientInfo.companyName || '客戶'}_\${dateStr}.pdf`;
    if (!window.html2pdf) {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
      } catch {
        alert('無法載入 PDF 產生器，請檢查網路連線。');
        return;
      }
    }
    const opt = {
      margin: 5, filename, image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    window.html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center overflow-auto p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full flex flex-col max-h-full">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 sticky top-0 z-10 rounded-t-lg flex-wrap gap-2">
          <h3 className="font-bold text-lg text-gray-700 flex items-center">
            <Printer className="w-5 h-5 mr-2" />
            報價單預覽
          </h3>
          <div className="flex gap-2 items-center flex-wrap">
            <label className="flex items-center space-x-2 cursor-pointer select-none bg-blue-50 px-3 py-2 rounded border border-blue-200">
              <input type="checkbox" checked={isSigned} onChange={(e) => setIsSigned(e.target.checked)} className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-bold text-blue-800">蓋上印章</span>
            </label>

            <button
              onClick={generateExcel}
              disabled={isGenerating}
              className={`px-4 py-2 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 flex items-center shadow disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              <FileText className="w-4 h-4 mr-2" />
              {isGenerating ? '產生中...' : '下載編輯檔 (Excel)'}
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 flex items-center shadow"
            >
              <Download className="w-4 h-4 mr-2" />
              下載 PDF
            </button>

            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <X />
            </button>
          </div>
        </div>

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

// 第 5 段：QuoteCreator (新增/編輯報價單)

//第四部份 ========== QuoteCreator ==========

// ========== QuoteCreator ==========

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
  const [internalNote, setInternalNote] = useState(initialData?.internalNote || '');
  const [isSigned, setIsSigned] = useState(false);

  // 初始化 items
  const [items, setItems] = useState(() => {
    if (initialData?.items) {
      return initialData.items.map((raw) => {
        const item = { ...raw };
        if (!item.extraFees) item.extraFees = [];

        // 確保有預設的 applyTransportFee
        if (item.applyTransportFee === undefined) item.applyTransportFee = true;
        // 確保有自訂模式旗標
        if (item.isCustom === undefined) item.isCustom = false;
        // 確保有 85 折旗標
        if (item.enableDiscount85 === undefined) item.enableDiscount85 = false;

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

        if (!item.timeRange) {
          if (item.startTime && item.endTime) {
            item.timeRange = `\${item.startTime}-\${item.endTime}`;
          } else if (item.startTime) {
            item.timeRange = item.startTime;
          } else {
            item.timeRange = '';
          }
        }
        return item;
      });
    }

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
        timeRange: '',
        hasInvoice: false,
        enableDiscount90: false,
        enableDiscount85: false,
        customDiscount: 0,
        customDiscountDesc: '',
        extraFees: [],
        extraFee: 0,
        extraFeeDesc: '',
        address: '',
        itemNote: '',
        applyTransportFee: true,
        isCustom: false,
      },
    ];
  });

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
    const item = { ...newItems[index], [field]: value };
    
    // 課程選單連動單價 (僅在非自訂模式下生效)
    if (!item.isCustom) {
        if (field === 'courseName') {
            const series = COURSE_DATA[item.courseSeries];
            const course = series?.find((c) => c.name === value);
            if (course) item.price = course.price;
        }
        if (field === 'courseSeries') {
            const series = COURSE_DATA[value];
            if (series && series.length > 0) {
                item.courseName = series[0].name;
                item.price = series[0].price;
            }
        }
    }

    if (field === 'outingRegion') {
      const available = getAvailableCities(value);
      item.city = available[0] || '';
      item.area = '';
    }
    if (field === 'city') {
      item.area = '';
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const toggleCustomMode = (index) => {
      const newItems = [...items];
      const current = newItems[index];
      // 切換模式時
      if (!current.isCustom) {
          // 變成自訂
          current.isCustom = true;
          // 清除 9 折，避免混淆 (自訂模式用 85 折)
          current.enableDiscount90 = false;
      } else {
          // 變回選單
          current.isCustom = false;
          current.courseSeries = '水晶系列'; 
          const series = COURSE_DATA['水晶系列'];
          if(series) {
              current.courseName = series[0].name;
              current.price = series[0].price;
          }
          // 清除 85 折
          current.enableDiscount85 = false;
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
        enableDiscount85: false,
        extraFees: [],
        extraFee: 0,
        timeRange: '',
        isCustom: false,
        applyTransportFee: true,
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
      internalNote,
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
                  setClientInfo((prev) => ({ ...prev, companyName: e.target.value }))
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
                  setClientInfo((prev) => ({ ...prev, taxId: e.target.value }))
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
                  setClientInfo((prev) => ({ ...prev, contactPerson: e.target.value }))
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
                  setClientInfo((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
          </div>
          
          {/* ★★★ 新增：內部備註輸入框 ★★★ */}
          <div className="mt-4 pt-4 border-t border-gray-100">
             <label className="block text-sm font-bold text-red-600 mb-1 flex items-center">
               <Lock className="w-3 h-3 mr-1"/> 內部備註 (不會顯示在報價單上，僅顯示於行事曆)
             </label>
             <textarea
               className={INPUT_CLASS}
               rows="2"
               placeholder="例如：客戶偏好、注意事項、內部交代事項..."
               value={internalNote}
               onChange={(e) => setInternalNote(e.target.value)}
             />
          </div>
        </section>

        {/* 課程項目 */}
        {items.map((item, idx) => {
          const calcItem = calculatedItems[idx];
          return (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-blue-800 flex items-center">
                  <Plus className="w-5 h-5 mr-2" /> 課程項目 ({idx + 1})
                </h3>
                {items.length > 1 && (
                  <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* ★★★ 新增：手動/選單模式切換按鈕 ★★★ */}
              <div className="flex justify-end mb-2">
                 <button 
                    type="button"
                    onClick={() => toggleCustomMode(idx)}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors"
                 >
                     {item.isCustom ? "↩ 切換回選單選擇" : "✎ 改為手動輸入名稱與價格"}
                 </button>
              </div>

              {/* 課程選擇 or 手動輸入 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* 如果是手動模式：
                   1. 隱藏系列選單
                   2. 課程名稱變成 input
                   3. 單價變成 number input
                */}
                {!item.isCustom ? (
                    <>
                        <div>
                          <label className={LABEL_CLASS}>課程系列</label>
                          <select className={INPUT_CLASS} value={item.courseSeries} onChange={(e) => updateItem(idx, 'courseSeries', e.target.value)}>
                            {Object.keys(COURSE_DATA).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className={LABEL_CLASS}>課程名稱 （單價: $${item.price}）</label>
                          <select className={INPUT_CLASS} value={item.courseName} onChange={(e) => updateItem(idx, 'courseName', e.target.value)}>
                            {COURSE_DATA[item.courseSeries]?.map((c) => (
                              <option key={c.name} value={c.name}>{c.name} ($${c.price})</option>
                            ))}
                          </select>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="md:col-span-2">
                             <label className={LABEL_CLASS}>課程名稱 (自訂)</label>
                             <input 
                                className={INPUT_CLASS} 
                                value={item.courseName} 
                                onChange={(e) => updateItem(idx, 'courseName', e.target.value)} 
                                placeholder="請輸入課程名稱"
                             />
                        </div>
                        <div>
                             <label className={LABEL_CLASS}>單價</label>
                             <input 
                                type="number"
                                className={INPUT_CLASS} 
                                value={item.price} 
                                onChange={(e) => updateItem(idx, 'price', e.target.value)} 
                                placeholder="請輸入單價"
                             />
                        </div>
                    </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div><label className={LABEL_CLASS}>人數</label><input type="number" className={INPUT_CLASS} value={item.peopleCount} onChange={(e) => updateItem(idx, 'peopleCount', e.target.value)} /></div>
                
                {/* ★★★ 修改：日期欄位一律顯示，但在自訂模式下標記為選填 ★★★ */}
                <div>
                    <label className={LABEL_CLASS}>
                        日期 {item.isCustom ? '(選填)' : ''}
                    </label>
                    <input 
                        type="date" 
                        className={INPUT_CLASS} 
                        value={item.eventDate} 
                        onChange={(e) => updateItem(idx, 'eventDate', e.target.value)} 
                    />
                </div>
                
                <div><label className={LABEL_CLASS}>時間（手動輸入）</label><input type="text" className={INPUT_CLASS} placeholder="例如：12:00-14:00" value={item.timeRange || ''} onChange={(e) => updateItem(idx, 'timeRange', e.target.value)} /></div>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer select-none p-2 bg-yellow-50 rounded border border-yellow-100 flex-1">
                    <input type="checkbox" className="mr-2 w-4 h-4" checked={item.hasInvoice} onChange={(e) => updateItem(idx, 'hasInvoice', e.target.checked)} />
                    <span className="text-sm font-medium text-gray-700">是否開立發票？（加 5%）</span>
                  </label>
                  
                  {/* ★★★ 修改：根據模式顯示 9折 或 85折 ★★★ */}
                  <label className="flex items-center cursor-pointer select-none p-2 bg-red-50 rounded border border-red-100 flex-1">
                    <input 
                        type="checkbox" 
                        className="mr-2 w-4 h-4" 
                        checked={item.isCustom ? (item.enableDiscount85 || false) : (item.enableDiscount90 || false)} 
                        onChange={(e) => updateItem(idx, item.isCustom ? 'enableDiscount85' : 'enableDiscount90', e.target.checked)} 
                    />
                    <span className="text-sm font-medium text-red-700">
                        {item.isCustom ? '套用 85 折優惠 (自訂模式)' : '套用 9 折優惠'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4">
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center cursor-pointer font-bold text-gray-700"><input type="radio" name={`mode-\${item.id}`} className="mr-2 w-4 h-4" checked={item.locationMode === 'outing'} onChange={() => updateItem(idx, 'locationMode', 'outing')} /> 外派教學</label>
                  <label className="flex items-center cursor-pointer font-bold text-gray-700"><input type="radio" name={`mode-\${item.id}`} className="mr-2 w-4 h-4" checked={item.locationMode === 'store'} onChange={() => updateItem(idx, 'locationMode', 'store')} /> 店內包班</label>
                </div>

                {item.locationMode === 'outing' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={LABEL_CLASS}>車馬費計算區域</label>
                      <select className={INPUT_CLASS} value={item.outingRegion} onChange={(e) => updateItem(idx, 'outingRegion', e.target.value)}>
                        <option value="North">北部出課</option>
                        <option value="Central">中部老師出課</option>
                        <option value="South">南部老師出課</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>縣市 {calcItem.calc.transportFee > 0 && !calcItem.area && (<span className="text-blue-600 ml-2 text-xs bg-blue-50 px-2 py-0.5 rounded">預估: $${calcItem.calc.transportFee.toLocaleString()}</span>)}</label>
                      <select className={INPUT_CLASS} value={item.city} onChange={(e) => updateItem(idx, 'city', e.target.value)}>
                        {getAvailableCities(item.outingRegion).map((c) => (
                          <option key={c} value={c}>{c.replace('(北部出發)', '').replace('(中部出發)', '').replace('(南部出發)', '')}</option>
                        ))}
                      </select>
                    </div>
                    {TRANSPORT_FEES[item.city]?.zones && Object.keys(TRANSPORT_FEES[item.city].zones).length > 0 && (
                        <div>
                          <label className={LABEL_CLASS}>區域 {calcItem.calc.transportFee > 0 && (<span className="text-blue-600 ml-2 text-xs bg-blue-50 px-2 py-0.5 rounded">+$${calcItem.calc.transportFee.toLocaleString()}</span>)}</label>
                          <select className={INPUT_CLASS} value={item.area} onChange={(e) => updateItem(idx, 'area', e.target.value)}>
                            <option value="">選擇區域...</option>
                            {Object.entries(TRANSPORT_FEES[item.city].zones).map(([zone, fee]) => (
                              <option key={zone} value={zone}>{zone} (+$${fee})</option>
                            ))}
                          </select>
                        </div>
                      )}
                    <div className="md:col-span-3">
                      <label className={LABEL_CLASS}>詳細地址</label>
                      <input className={INPUT_CLASS} placeholder="請輸入詳細地址" value={item.address || ''} onChange={(e) => updateItem(idx, 'address', e.target.value)} />
                    </div>
                    
                    {/* ★★★ 新增：是否套用車馬費 ★★★ */}
                    <div className="md:col-span-3">
                          <label className="flex items-center cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                className="mr-2 w-4 h-4 text-blue-600" 
                                checked={item.applyTransportFee} 
                                onChange={(e) => updateItem(idx, 'applyTransportFee', e.target.checked)} 
                            />
                            <span className="text-sm font-bold text-gray-700">是否計算車馬費？ (取消勾選則車馬費為 $0)</span>
                          </label>
                    </div>

                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div>
                      <label className={LABEL_CLASS}>店內區域</label>
                      <select className={INPUT_CLASS} value={item.regionType || 'North'} onChange={(e) => updateItem(idx, 'regionType', e.target.value)}>
                        <option value="North">北部店內</option>
                        <option value="Central">中部店內</option>
                        <option value="South">南部店內</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className={LABEL_CLASS}>該堂課備註說明（選填）</label>
                <input type="text" className={INPUT_CLASS} placeholder="例如：需提前半小時進場、特殊需求..." value={item.itemNote || ''} onChange={(e) => updateItem(idx, 'itemNote', e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded border border-red-100">
                  <label className={LABEL_CLASS + ' text-red-800'}>手動折扣（減項）</label>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500 font-bold">-</span>
                      <input type="number" className={INPUT_CLASS + ' pl-6'} placeholder="金額" value={item.customDiscount} onChange={(e) => updateItem(idx, 'customDiscount', e.target.value)} />
                    </div>
                    <input type="text" className={INPUT_CLASS} placeholder="折扣說明" value={item.customDiscountDesc || ''} onChange={(e) => updateItem(idx, 'customDiscountDesc', e.target.value)} />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className={LABEL_CLASS + ' text-blue-800 mb-0'}>額外加價（加項）</label>
                    <button onClick={() => addExtraFee(idx)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 font-bold flex items-center"><Plus className="w-3 h-3 mr-1" /> 新增</button>
                  </div>
                  <div className="space-y-2">
                    {item.extraFees && item.extraFees.map((fee) => (
                        <div key={fee.id} className="flex gap-2 items-center">
                          <input type="checkbox" className="w-5 h-5 cursor-pointer accent-blue-600" checked={fee.isEnabled} onChange={(e) => updateExtraFee(idx, fee.id, 'isEnabled', e.target.checked)} />
                          <input type="text" className={INPUT_CLASS + ' flex-1 ' + (!fee.isEnabled ? 'opacity-50' : '')} placeholder="加價說明" value={fee.description} onChange={(e) => updateExtraFee(idx, fee.id, 'description', e.target.value)} disabled={!fee.isEnabled} />
                          <div className="relative w-32">
                            <span className="absolute left-2 top-2 text-gray-500 font-bold">+</span>
                            <input type="number" className={INPUT_CLASS + ' pl-5 ' + (!fee.isEnabled ? 'opacity-50' : '')} placeholder="金額" value={fee.amount} onChange={(e) => updateExtraFee(idx, fee.id, 'amount', e.target.value)} disabled={!fee.isEnabled} />
                          </div>
                          <button onClick={() => removeExtraFee(idx, fee.id)} className="text-red-400 hover:text-red-600 p-2"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <button onClick={addItem} className="w-full py-4 bg-white border-2 border-dashed border-gray-300 shadow-sm rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition flex justify-center items-center font-bold text-lg">
          <Plus className="w-6 h-6 mr-2" /> 增加更多課程
        </button>
      </div>

      <div className="mt-10 border-t-4 border-gray-800 pt-8 print:border-none print:mt-0 print:pt-0">
        <div className="flex justify-between items-center mb-6 print:hidden flex-wrap gap-4">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center"><Eye className="mr-2" /> 即時報價單預覽</h3>
          <div className="flex gap-4 items-center flex-wrap">
            <label className="flex items-center space-x-2 cursor-pointer select-none bg-blue-50 px-3 py-2 rounded border border-blue-200">
              <input type="checkbox" checked={isSigned} onChange={(e) => setIsSigned(e.target.checked)} className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-bold text-blue-800">蓋上印章</span>
            </label>
            <button onClick={handleSave} className="px-8 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow flex items-center"><Save className="w-4 h-4 mr-2" /> 儲存至資料庫</button>
            <button onClick={onCancel} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50">取消</button>
          </div>
        </div>

        <div className="border shadow-2xl mx-auto print:shadow-none print:border-none overflow-hidden">
          <QuotePreview idName="creator-preview-area" clientInfo={clientInfo} items={calculatedItems} totalAmount={totalAmount} dateStr={new Date().toISOString().slice(0, 10)} isSigned={isSigned} stampUrl={STAMP_URL} />
        </div>
      </div>
    </div>
  );
};

// 第 6 段：統計頁面、備註與材料元件

// 第五部份========== 統計頁面 (含北中南對比圖) ==========

const StatsView = ({ quotes }) => {
  // 過濾掉內部排程
  const validQuotes = quotes.filter((q) => q.type !== 'internal');

  const availableMonths = useMemo(() => {
    const months = new Set();
    validQuotes.forEach((q) => {
      if (q.status !== 'draft') {
        const d = getSafeDate(q.createdAt);
        const key = `\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(
          2,
          '0',
        )}`;
        months.add(key);
      }
    });
    return Array.from(months).sort().reverse();
  }, [validQuotes]);

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
        North: {
          name: '北部',
          revenue: 0,
          count: 0,
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
        },
        Central: {
          name: '中部',
          revenue: 0,
          count: 0,
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600',
        },
        South: {
          name: '南部',
          revenue: 0,
          count: 0,
          color: 'bg-green-500',
          textColor: 'text-green-600',
        },
      },
      statuses: {
        draft: {
          name: '草稿',
          count: 0,
          color: 'bg-gray-100 text-gray-800',
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

    validQuotes.forEach((q) => {
      // 統計不包含草稿
      if (q.status === 'draft') return;
      const d = getSafeDate(q.createdAt);
      const monthKey = `\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}`;
      if (monthKey !== selectedMonth) return;

      // 統計時仍以第一項課程為主要區域判斷
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
  }, [validQuotes, selectedMonth]);

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
      {/* 頂部篩選與總計 */}
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

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg mb-8">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-100 font-medium mb-1">
              本月總業績 ({selectedMonth})
            </p>
            <h3 className="text-4xl font-bold tracking-tight">
              $${stats.totalRevenue.toLocaleString()}
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

      {/* 北中南業績對比圖 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 左側：區域營收長條圖 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            區域營收對比
          </h3>
          <div className="space-y-6">
            {Object.entries(stats.regions).map(([key, region]) => (
              <div key={key}>
                <div className="flex justify-between items-end mb-1">
                  <span className="font-bold text-gray-600">{region.name}</span>
                  <span className={`font-bold \${region.textColor}`}>
                    $${region.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 \${region.color}`}
                    style={{
                      width: `\${(region.revenue / stats.totalRevenue) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 text-right mt-1">
                  佔比{' '}
                  {stats.totalRevenue > 0
                    ? Math.round((region.revenue / stats.totalRevenue) * 100)
                    : 0}
                  %
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側：案件數量圓餅圖模擬 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            案件分佈佔比
          </h3>
          <div className="flex flex-col justify-center h-full pb-6">
            <div className="flex h-8 w-full rounded-full overflow-hidden mb-6">
              {Object.entries(stats.regions).map(([key, region]) => (
                <div
                  key={key}
                  className={`\${region.color} transition-all duration-1000`}
                  style={{
                    width: `\${
                      stats.totalOrders > 0
                        ? (region.count / stats.totalOrders) * 100
                        : 0
                    }%`,
                  }}
                  title={`\${region.name}: \${region.count}件`}
                ></div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {Object.entries(stats.regions).map(([key, region]) => (
                <div key={key} className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full mb-2 \${region.color}`}
                  ></div>
                  <span className="text-gray-500 text-sm">{region.name}</span>
                  <span className="text-xl font-bold text-gray-800">
                    {region.count}
                  </span>
                  <span className="text-xs text-gray-400">件</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 案件狀態統計 (卡片式) */}
      <h3 className="text-lg font-bold text-gray-700 mb-4">案件狀態總覽</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats.statuses).map(([key, status]) => (
          <div
            key={key}
            className={`p-4 rounded-lg border \${status.color.replace(
              'text-',
              'border-',
            )} bg-opacity-50`}
          >
            <p className="text-sm font-bold opacity-70 mb-1">{status.name}</p>
            <p className="text-2xl font-bold">{status.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
};



// 第 7 段：備課表、行事曆、列表與 App 主體

//第六部份 ========== 備課表、行事曆、列表與 App 主體 ==========

const PreparationView = ({ quotes, onUpdateQuote, publicMode = false, publicRegion = null }) => {
  const validQuotes = quotes.filter((q) => q.status === 'confirmed' || q.status === 'paid');
  const [filterDate, setFilterDate] = useState(() => { const d = new Date(); d.setMonth(d.getMonth() + 2); return d.toISOString().slice(0, 10); });
  const [currentRegion, setCurrentRegion] = useState(publicRegion || 'North');
  const [staffData, setStaffData] = useState({ North: [], Central: [], South: [] });
  const [newStaffName, setNewStaffName] = useState('');

  useEffect(() => { if (!db) return; const unsub = onSnapshot(doc(db, 'settings', 'staff'), (docSnap) => { if (docSnap.exists()) { const data = docSnap.data(); setStaffData({ North: data.North || (Array.isArray(data.list) ? data.list : []), Central: data.Central || [], South: data.South || [] }); } else { setDoc(doc(db, 'settings', 'staff'), { North: ['小明', '小華'], Central: [], South: [] }, { merge: true }); } }); return () => unsub(); }, []);
  const updateStaffToFirebase = async (newList) => { const updatedData = { ...staffData, [currentRegion]: newList }; setStaffData(updatedData); if (db) await setDoc(doc(db, 'settings', 'staff'), { [currentRegion]: newList }, { merge: true }); };
  const addStaff = (e) => { if (e) e.preventDefault(); if (newStaffName.trim() && !staffData[currentRegion].includes(newStaffName.trim())) updateStaffToFirebase([...staffData[currentRegion], newStaffName.trim()]); setNewStaffName(''); };
  const removeStaff = (name) => { if (window.confirm(`確定移除 \${name}?`)) updateStaffToFirebase(staffData[currentRegion].filter((s) => s !== name)); };
  const handleCopyPrepLink = (region) => { const url = `\${window.location.href.split('?')[0]}?view=prep&mode=public&region=\${region}`; navigator.clipboard.writeText(url).then(() => alert(`已複製「\${region === 'Central' ? '中部' : '南部'}備課表」連結！`)).catch(() => prompt("請複製連結：", url)); };
  const handleGoToCalendar = () => { const url = new URL(window.location.href); url.searchParams.set('view', 'calendar'); window.location.href = url.toString(); };
  
  const prepItems = useMemo(() => {
    const list = [];
    validQuotes.forEach((q) => {
      if (!q.items) return;
      q.items.forEach((item, idx) => {
        if (item.eventDate > filterDate) return;
        let effectiveRegion = item.outingRegion || item.regionType || 'North';
        if (item.city && (item.city.includes('台中') || item.city.includes('彰化') || item.city.includes('南投'))) effectiveRegion = 'Central';
        if (item.city && (item.city.includes('高雄') || item.city.includes('台南') || item.city.includes('屏東'))) effectiveRegion = 'South';
        if (effectiveRegion !== currentRegion) return;
        const standardMaterials = COURSE_MATERIALS[item.courseName] || [];
        const savedData = q.prepData?.[idx] || {};
        const customMaterials = Object.keys(savedData).filter(key => key !== 'note' && !standardMaterials.includes(key));
        list.push({ quoteId: q.id, itemIdx: idx, clientName: q.clientInfo.companyName, courseName: item.courseName, date: item.eventDate, time: item.timeRange || item.startTime || '', people: item.peopleCount, standardMaterials, customMaterials, prepData: savedData });
      });
    });
    return list.sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [validQuotes, filterDate, currentRegion]);

  const handleMaterialUpdate = (qid, idx, mat, f, v) => { const q = quotes.find((x) => x.id === qid); if (!q) return; const n = { ...(q.prepData || {}) }; if (!n[idx]) n[idx] = {}; if (!n[idx][mat]) n[idx][mat] = { done: false, staff: '' }; n[idx][mat] = { ...n[idx][mat], [f]: v }; onUpdateQuote(qid, { prepData: n }); };
  const handleNoteUpdate = (qid, idx, v) => { const q = quotes.find((x) => x.id === qid); if (!q) return; const n = { ...(q.prepData || {}) }; if (!n[idx]) n[idx] = {}; n[idx].note = v; onUpdateQuote(qid, { prepData: n }); };
  const canEditStaff = !publicMode || !!publicRegion;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4"><div><h2 className="text-2xl font-bold flex items-center"><ClipboardList className="mr-2" /> 備課檢查表 {publicRegion && `(\${publicRegion})`}</h2></div><div className="flex flex-col gap-2 items-end">{!publicMode ? (<div className="flex gap-2">{['North', 'Central', 'South'].map(r => <button key={r} onClick={() => setCurrentRegion(r)} className={`px-3 py-1 rounded border \${currentRegion === r ? 'bg-blue-600 text-white' : 'bg-white'}`}>{r}</button>)}<button onClick={() => handleCopyPrepLink('Central')} className="text-xs bg-yellow-100 px-2 py-1 rounded border">中部連結</button><button onClick={() => handleCopyPrepLink('South')} className="text-xs bg-green-100 px-2 py-1 rounded border">南部連結</button></div>) : (<button onClick={handleGoToCalendar} className="bg-white border px-3 py-2 rounded">切換至行事曆</button>)}<div className="flex items-center gap-2"><label className="text-sm font-bold">截止：</label><input type="date" className={INPUT_CLASS} value={filterDate} onChange={(e) => setFilterDate(e.target.value)} /></div></div></div>
      <div className="bg-white p-4 rounded shadow mb-6"><h3 className="font-bold mb-2">備課人員 ({currentRegion})</h3><div className="flex flex-wrap gap-2">{(staffData[currentRegion] || []).map((s) => (<span key={s} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">{s} {canEditStaff && <button onClick={() => removeStaff(s)} className="ml-2 text-red-500"><X size={12} /></button>}</span>))}{canEditStaff && <div className="flex items-center"><input value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} placeholder="新人員" className="border p-1 w-20 text-sm" /><button onClick={addStaff} type="button" className="ml-1 bg-blue-600 text-white p-1 rounded"><Plus size={14} /></button></div>}</div></div>
      <div className="space-y-6">{prepItems.length === 0 ? <div className="text-center text-gray-400">無資料</div> : prepItems.map((item) => (
        <div key={`\${item.quoteId}_\${item.itemIdx}`} className="bg-white rounded shadow border-l-4 border-blue-500 p-6">
          <div className="flex justify-between mb-4"><div><h3 className="font-bold text-lg">{item.courseName}</h3><div className="text-sm text-gray-600">{item.clientName} | {item.date} {item.time} | {item.people}人</div></div></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{[...item.standardMaterials, ...item.customMaterials].map(mat => { const st = item.prepData[mat] || {}; return <div key={mat} className="flex justify-between bg-gray-50 p-2 rounded border"><label className="flex items-center"><input type="checkbox" checked={st.done} onChange={(e) => handleMaterialUpdate(item.quoteId, item.itemIdx, mat, 'done', e.target.checked)} className="mr-2" />{mat}</label><select value={st.staff || ''} onChange={(e) => handleMaterialUpdate(item.quoteId, item.itemIdx, mat, 'staff', e.target.value)} className="text-xs bg-white border rounded"><option value="">未指派</option>{staffData[currentRegion].map(s => <option key={s} value={s}>{s}</option>)}</select></div> })}</div>
          <AddMaterialRow onAdd={(n) => handleMaterialUpdate(item.quoteId, item.itemIdx, n, 'done', false)} />
          <div className="mt-2"><NoteInput value={item.prepData.note} onSave={(v) => handleNoteUpdate(item.quoteId, item.itemIdx, v)} /></div>
        </div>
      ))}</div>
    </div>
  );
};

const CalendarView = ({ quotes, regularClasses, onAddRegularClass, onUpdateRegularClass, onDeleteRegularClass, publicMode, publicRegion }) => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [filterRegion, setFilterRegion] = useState(publicRegion || 'all');
  const [modal, setModal] = useState({ show: false, editId: null, data: {} });
  const events = useMemo(() => {
    const list = [];
    quotes.filter(q => q.status !== 'draft').forEach(q => q.items?.forEach((it, idx) => list.push({ id: `\${q.id}_\${idx}`, type: 'quote', date: it.eventDate, time: it.timeRange, title: q.clientInfo.companyName, sub: it.courseName, region: it.outingRegion || it.regionType || 'North', raw: q, contact: q.clientInfo.contactPerson, phone: q.clientInfo.phone, addr: it.address, note: q.internalNote })));
    regularClasses.forEach(r => list.push({ id: r.id, type: 'regular', date: r.date, time: r.time, title: r.courseName, sub: '常態課', region: r.region || 'North', raw: r }));
    return list.filter(e => (publicRegion ? e.region === publicRegion : filterRegion === 'all' || e.region === filterRegion));
  }, [quotes, regularClasses, filterRegion, publicRegion]);
  const getDayEvents = (d) => events.filter(e => e.date === d.toISOString().slice(0, 10));
  const handleEventClick = (e, evt) => { if (evt.type === 'regular' && !publicMode) { e.stopPropagation(); setModal({ show: true, editId: evt.id, data: { ...evt.raw } }); } else if (!publicMode) { e.stopPropagation(); alert(`\${evt.title}\n\${evt.sub}\n\${evt.time}\n\${evt.addr}`); } else { setDate(new Date(evt.date)); setView('day'); } };
  const handleCopyLink = (r, t) => { const url = `\${window.location.href.split('?')[0]}?view=\${t}&mode=public&region=\${r}`; navigator.clipboard.writeText(url).then(() => alert('複製成功')); };
  const renderMonth = () => (<div className="grid grid-cols-7 border bg-gray-200 gap-px">{['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className="bg-gray-50 p-2 text-center">{d}</div>)}{Array(new Date(date.getFullYear(), date.getMonth(), 1).getDay()).fill(0).map((_, i) => <div key={`b\${i}`} className="bg-white h-24" />)}{Array(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()).fill(0).map((_, i) => { const d = new Date(date.getFullYear(), date.getMonth(), i + 1); return <div key={i} onClick={() => { setDate(d); setView('day'); }} className="bg-white h-24 p-1 cursor-pointer hover:bg-blue-50"><div className="text-xs text-gray-400">{i + 1}</div>{getDayEvents(d).map(e => <div key={e.id} onClick={(ev) => handleEventClick(ev, e)} className={`text-[10px] truncate rounded px-1 mb-1 \${e.type === 'regular' ? 'bg-purple-100' : 'bg-blue-100'}`}>{e.time.slice(0, 5)} {e.title}</div>)}</div> })}</div>);
  const renderWeek = () => { const start = new Date(date); start.setDate(start.getDate() - start.getDay()); return <div className="grid grid-cols-7 gap-2">{Array(7).fill(0).map((_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return <div key={i} className="bg-white border rounded min-h-[200px]" onClick={() => { setDate(d); setView('day'); }}><div className="bg-gray-50 p-2 text-center border-b">{d.getMonth() + 1}/{d.getDate()}</div><div className="p-2 space-y-1">{getDayEvents(d).map(e => <div key={e.id} onClick={(ev) => handleEventClick(ev, e)} className="text-xs p-1 rounded border bg-blue-50">{e.time} {e.title}</div>)}</div></div> })}</div> };
  const renderDay = () => (<div className="bg-white border rounded p-6 min-h-[400px]"><h3 className="text-xl font-bold mb-4">{date.toLocaleDateString()}</h3>{getDayEvents(date).map(e => <div key={e.id} onClick={(ev) => handleEventClick(ev, e)} className="flex border-l-4 border-blue-500 pl-4 mb-4 cursor-pointer hover:bg-gray-50 p-2"><div className="w-20 font-bold">{e.time}</div><div><div className="font-bold">{e.title}</div><div>{e.sub}</div>{e.type === 'quote' && <div className="text-xs text-gray-500"><div>{e.contact} {e.phone}</div><div>{e.addr}</div>{e.note && <div className="text-red-500 bg-red-50 px-1">{e.note}</div>}</div>}</div></div>)}</div>);

  return (
    <div className="bg-white p-6 rounded shadow"><div className="flex justify-between mb-4"><div className="flex gap-4"><h2 className="text-2xl font-bold">{date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}</h2><div className="flex gap-1"><button onClick={() => setView('month')}>月</button><button onClick={() => setView('week')}>週</button><button onClick={() => setView('day')}>日</button></div></div><div className="flex gap-2">{!publicMode && <><button onClick={() => setModal({ show: true, editId: null, data: {} })} className="bg-purple-600 text-white px-2 rounded">+常態</button><button onClick={() => handleCopyLink('Central', 'calendar')}>中</button><button onClick={() => handleCopyLink('South', 'calendar')}>南</button></>}<button onClick={() => { const d = new Date(date); d.setMonth(d.getMonth() - 1); setDate(d); }}>&lt;</button><button onClick={() => { const d = new Date(date); d.setMonth(d.getMonth() + 1); setDate(d); }}>&gt;</button></div></div>{view === 'month' && renderMonth()}{view === 'week' && renderWeek()}{view === 'day' && renderDay()}{modal.show && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded w-96 space-y-4"><h3>常態課</h3><input className={INPUT_CLASS} placeholder="名稱" value={modal.data.courseName || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, courseName: e.target.value } })} /><input type="date" className={INPUT_CLASS} value={modal.data.date || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, date: e.target.value } })} /><input className={INPUT_CLASS} placeholder="時間" value={modal.data.time || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, time: e.target.value } })} /><select className={INPUT_CLASS} value={modal.data.region || 'North'} onChange={e => setModal({ ...modal, data: { ...modal.data, region: e.target.value } })}><option value="North">北</option><option value="Central">中</option><option value="South">南</option></select><div className="flex justify-end gap-2"><button onClick={() => setModal({ show: false, editId: null, data: {} })}>取消</button><button onClick={() => { (modal.editId ? onUpdateRegularClass(modal.editId, modal.data) : onAddRegularClass(modal.data)); setModal({ show: false, editId: null, data: {} }); }}>儲存</button>{modal.editId && <button onClick={() => { if (confirm('刪除?')) { onDeleteRegularClass(modal.editId); setModal({ show: false, editId: null, data: {} }); } }}>刪除</button>}</div></div></div>}</div>
  );
};

const NoteInput = ({ value, onSave }) => {
  const [localValue, setLocalValue] = useState(value || '');
  useEffect(() => { setLocalValue(value || ''); }, [value]);
  return <textarea className="w-full text-sm border-gray-300 rounded bg-yellow-50 focus:ring-blue-500 focus:border-blue-500 p-2 placeholder-gray-400" rows="2" placeholder="在此填寫交接事項..." value={localValue} onChange={(e) => setLocalValue(e.target.value)} onBlur={() => onSave(localValue)} />;
};

const AddMaterialRow = ({ onAdd }) => {
  const [name, setName] = useState('');
  const handleAdd = (e) => { if (e) e.preventDefault(); if (!name.trim()) return; onAdd(name.trim()); setName(''); };
  return (
    <div className="flex items-center gap-2 mt-3 p-2 bg-gray-50 rounded border border-dashed border-gray-300">
      <Plus className="w-4 h-4 text-gray-400" /><input type="text" className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-400" placeholder="新增額外準備項目..." value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd(e)} />
      <button type="button" onClick={(e) => handleAdd(e)} className="text-xs bg-blue-100 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-200 font-bold transition-colors">新增</button>
    </div>
  );
};

const QuoteList = ({ quotes, onCreateNew, onEdit, onPreview, onDelete, onChangeStatus, onSwitchView, onOpenPayment, onOpenInvoiceManager }) => {
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const months = Array.from(new Set(quotes.map(q => getSafeDate(q.createdAt).toISOString().slice(0, 7)))).sort().reverse();
  const getRegion = (q) => { if (q.items?.some(i => i.city?.includes('高雄') || i.city?.includes('台南') || i.outingRegion === 'South')) return 'South'; if (q.items?.some(i => i.city?.includes('台中') || i.outingRegion === 'Central')) return 'Central'; return 'North'; };
  const filtered = quotes.filter(q => { const d = getSafeDate(q.createdAt).toISOString().slice(0, 7); const r = getRegion(q); const kw = search.trim(); const txt = !kw || q.clientInfo.companyName?.includes(kw) || q.depositNote?.includes(kw); return (filterMonth === 'all' || d === filterMonth) && (filterStatus === 'all' || q.status === filterStatus) && (filterRegion === 'all' || r === filterRegion) && txt; });
  const exportCSV = () => { let csv = '\uFEFFID,日期,公司,統編,聯絡人,電話,總額,狀態,區域\n'; filtered.forEach(q => csv += `\${q.id},\${formatDate(q.createdAt)},"\${q.clientInfo.companyName}",\${q.clientInfo.taxId},\${q.clientInfo.contactPerson},\${q.clientInfo.phone},\${q.totalAmount},\${q.status},\${getRegion(q)}\n`); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'quotes.csv'; link.click(); };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8"><div className="flex justify-between mb-6 gap-4"><h1 className="text-2xl font-bold flex items-center"><Folder className="mr-2"/> 報價單管理 ({quotes.length})</h1><div className="flex gap-2 items-center"><input className="border p-2 rounded text-sm" placeholder="搜尋..." value={search} onChange={e => setSearch(e.target.value)} /><div className="flex bg-white rounded border p-1"><button onClick={() => setFilterRegion('all')} className={`px-2 rounded \${filterRegion === 'all' ? 'bg-blue-600 text-white' : ''}`}>全</button><button onClick={() => setFilterRegion('North')} className={`px-2 rounded \${filterRegion === 'North' ? 'bg-blue-600 text-white' : ''}`}>北</button><button onClick={() => setFilterRegion('Central')} className={`px-2 rounded \${filterRegion === 'Central' ? 'bg-blue-600 text-white' : ''}`}>中</button><button onClick={() => setFilterRegion('South')} className={`px-2 rounded \${filterRegion === 'South' ? 'bg-blue-600 text-white' : ''}`}>南</button></div><select className="border p-2 rounded text-sm" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}><option value="all">所有月份</option>{months.map(m => <option key={m} value={m}>{m}</option>)}</select><button onClick={exportCSV} className="border p-2 rounded"><Download size={16} /></button><button onClick={() => onSwitchView('calendar')} className="border p-2 rounded flex items-center"><Calendar size={16} className="mr-1" /> 行事曆</button><button onClick={onCreateNew} className="bg-blue-600 text-white px-4 py-2 rounded font-bold shadow flex items-center"><Plus size={16} className="mr-1" /> 新增</button></div></div>
      <div className="bg-white rounded shadow overflow-hidden"><table className="w-full text-sm"><thead className="bg-gray-50 border-b"><tr><th className="p-3 text-left">日期</th><th className="p-3 text-left">客戶</th><th className="p-3 text-left">課程</th><th className="p-3 text-right">金額</th><th className="p-3 text-center">狀態</th><th className="p-3 text-right">操作</th></tr></thead><tbody>{filtered.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-gray-400">無資料</td></tr> : filtered.map(q => (<tr key={q.id} className="border-t hover:bg-gray-50"><td className="p-3">{formatDate(q.createdAt)}</td><td className="p-3 font-bold">{q.clientInfo.companyName}</td><td className="p-3">{q.items?.[0]?.courseName}</td><td className="p-3 text-right font-bold">$${q.totalAmount?.toLocaleString()}</td><td className="p-3 text-center"><StatusSelector status={q.status} onChange={(v) => onChangeStatus(q, v)} /></td><td className="p-3 text-right flex justify-end gap-1"><button onClick={() => onOpenInvoiceManager(q)} className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold"><Receipt size={14}/></button><button onClick={() => onOpenPayment(q)} className="bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">$</button><button onClick={() => onPreview(q)} className="border p-1 rounded"><Printer size={14} /></button><button onClick={() => onEdit(q)} className="border p-1 rounded text-blue-600"><Edit size={14} /></button><button onClick={() => onDelete(q)} className="border p-1 rounded text-red-600"><Trash2 size={14} /></button></td></tr>))}</tbody></table></div></div>
  );
};

const App = () => {
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view'), modeParam = params.get('mode'), regionParam = params.get('region');
  const [quotes, setQuotes] = useState([]);
  const [regulars, setRegulars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(viewParam === 'calendar' ? 'calendar' : viewParam === 'prep' ? 'prep' : 'list');
  const [editQuote, setEditQuote] = useState(null);
  const [prevQuote, setPrevQuote] = useState(null);
  const [payQuote, setPayQuote] = useState(null);
  const [invoiceQuote, setInvoiceQuote] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const isPublic = modeParam === 'public';

  useEffect(() => {
    if (!db) { setLoading(false); return; }
    const subQ = onSnapshot(query(collection(db, 'quotes'), orderBy('createdAt', 'desc')), s => { setQuotes(s.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); });
    const subR = onSnapshot(collection(db, 'regularClasses'), s => setRegulars(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { subQ(); subR(); };
  }, []);

  const saveQ = async (d) => { try { if (editQuote?.id) await updateDoc(doc(db, 'quotes', editQuote.id), { ...d, updatedAt: serverTimestamp() }); else await addDoc(collection(db, 'quotes'), { ...d, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); setEditQuote(null); setView('list'); } catch (e) { alert('儲存失敗'); } };
  const delQ = async (q) => { if (confirm('刪除?')) await deleteDoc(doc(db, 'quotes', q.id)); };
  const statusQ = async (q, s) => { await updateDoc(doc(db, 'quotes', q.id), { status: s, updatedAt: serverTimestamp() }); };
  const savePay = async (id, d) => { await updateDoc(doc(db, 'quotes', id), d); };
  const addReg = async (d) => await addDoc(collection(db, 'regularClasses'), { ...d, createdAt: serverTimestamp() });
  const upReg = async (id, d) => await updateDoc(doc(db, 'regularClasses', id), { ...d, updatedAt: serverTimestamp() });
  const delReg = async (id) => await deleteDoc(doc(db, 'regularClasses', id));
  const upQDirect = async (id, d) => await updateDoc(doc(db, 'quotes', id), { ...d, updatedAt: serverTimestamp() });

  if (isPublic) return <div className="min-h-screen bg-gray-100 py-4">{view === 'prep' ? <PreparationView quotes={quotes} onUpdateQuote={upQDirect} publicMode publicRegion={regionParam} /> : <CalendarView quotes={quotes} regularClasses={regulars} publicMode publicRegion={regionParam} />}</div>;
  if (!unlocked) return <AdminLock onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b px-4 py-3 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3 font-bold text-gray-800"><div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">下</div> 下班隨手作系統 v4.3</div>
        <nav className="flex gap-2 text-sm items-center">
          <button onClick={() => { setEditQuote(null); setView('list'); }} className={`px-3 py-1 rounded-full \${view === 'list' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>列表</button>
          <button onClick={() => { setEditQuote({}); setView('create'); }} className={`px-3 py-1 rounded-full \${view === 'create' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>新增</button>
          <button onClick={() => { setEditQuote(null); setView('calendar'); }} className={`px-3 py-1 rounded-full \${view === 'calendar' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>行事曆</button>
          <button onClick={() => { setEditQuote(null); setView('prep'); }} className={`px-3 py-1 rounded-full \${view === 'prep' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>備課表</button>
          <button onClick={() => { setEditQuote(null); setView('stats'); }} className={`px-3 py-1 rounded-full \${view === 'stats' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>統計</button>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><Settings size={18} /></button>
        </nav>
      </header>
      <main className="py-6">
        {loading ? <div className="text-center p-8">載入中...</div> : (
          <>
            {view === 'list' && !editQuote && <QuoteList quotes={quotes} onCreateNew={() => { setEditQuote({}); setView('create'); }} onEdit={q => { setEditQuote(q); setView('create'); }} onPreview={setPrevQuote} onDelete={delQ} onChangeStatus={statusQ} onSwitchView={setView} onSave={saveQ} onOpenPayment={setPayQuote} onOpenInvoiceManager={setInvoiceQuote} />}
            {(view === 'create' || editQuote) && <QuoteCreator initialData={editQuote} onSave={saveQ} onCancel={() => { setEditQuote(null); setView('list'); }} />}
            {view === 'calendar' && <CalendarView quotes={quotes} regularClasses={regulars} onAddRegularClass={addReg} onUpdateRegularClass={upReg} onDeleteRegularClass={delReg} />}
            {view === 'prep' && <PreparationView quotes={quotes} onUpdateQuote={upQDirect} />}
            {view === 'stats' && <StatsView quotes={quotes} />}
          </>
        )}
      </main>
      {prevQuote && <PreviewModal quote={prevQuote} onClose={() => setPrevQuote(null)} />}
      {payQuote && <PaymentModal quote={payQuote} onClose={() => setPayQuote(null)} onSave={savePay} />}
      {invoiceQuote && <InvoiceManagerModal quote={invoiceQuote} onClose={() => setInvoiceQuote(null)} onQuoteUpdated={(q) => setQuotes(quotes.map(oq => oq.id === q.id ? q : oq))} />}
      {showSettings && <EcpaySettingsModal onClose={() => setShowSettings(false)} />}
      <style>{`@media print { @page { margin: 0; size: auto; } body { margin: 0; padding: 0; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } tr { break-inside: avoid; } .print\\:hidden { display: none !important; } } .animate-fade-in { animation: fadeIn 0.3s ease-in-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default App;
