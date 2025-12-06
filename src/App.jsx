import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Calendar, FileText, Check, DollarSign, Printer, Search, Folder, ChevronDown, ChevronRight, ChevronLeft, Save, Trash2, X, Edit, AlertCircle, Eye, EyeOff, Download, MapPin, Clock, Filter, Menu, ArrowDown, BarChart3, TrendingUp, PieChart, Upload, FileJson } from 'lucide-react';

// --- 1. 樣式常數 (Styles) ---
const INPUT_CLASS = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white";
const LABEL_CLASS = "block text-sm font-bold text-gray-700 mb-1";
const SECTION_CLASS = "bg-white p-6 rounded-lg shadow-sm border border-gray-200";

// --- 2. 靜態資料 (Data Models) ---

const COURSE_DATA = {
  "平板課程": [
    { name: "平板課程-招財水晶樹", price: 690 },
    { name: "平板課程-純淨水晶礦石吊飾", price: 590 },
    { name: "平板課程-流體畫方形布畫", price: 890 },
    { name: "平板課程-Macrame星座葉片吊飾", price: 490 },
    { name: "平板課程-招財流體揪吉", price: 590 },
    { name: "平板課程-橙片奶昔蠟燭", price: 750 },
    { name: "平板課程-永生繡球花玻璃杯燭台", price: 750 },
    { name: "平板課程-聖誕金箔浮游花瓶", price: 590 },
    { name: "平板課程-多肉盆栽造型蠟燭手把杯", price: 590 },
    { name: "平板課程-鐵罐乾燥花香氛蠟燭", price: 590 },
    { name: "平板課程-雙棕色玻璃瓶香氛蠟燭", price: 590 },
    { name: "平板課程-彩虹小熊軟糖洗手皂", price: 490 },
    { name: "平板課程-水泥盆微景觀多肉", price: 590 },
    { name: "平板課程-多肉雙八角水泥盆", price: 590 },
    { name: "平板課程-Macrame樹葉壁掛", price: 590 },
    { name: "平板課程-蒙古玻璃乾燥花香氛蠟燭", price: 590 },
    { name: "平板課程-多肉摩艾水泥盆", price: 490 },
    { name: "平板課程-Macrame編織燈串", price: 690 },
    { name: "平板課程-樹幹乾燥花香氛蠟燭", price: 550 },
    { name: "平板課程-永生繡球浮游花筆", price: 490 },
    { name: "平板課程-水泥六角擴香花盤", price: 590 },
    { name: "平板課程-永生繡球浮游花瓶", price: 590 },
    { name: "平板課程-壓克力流體畫杯墊", price: 550 },
    { name: "平板課程-乾燥花香氛橢圓蠟片", price: 590 },
    { name: "平板課程-紳士兔松果擴香座", price: 490 },
    { name: "平板課程-雪松松果樹名片座", price: 590 },
    { name: "平板課程-熊熊愛上你擴香小熊", price: 490 },
    { name: "平板課程-水彩暈染星空畫", price: 590 },
    { name: "平板課程-工業風擴香花盆", price: 690 },
    { name: "平板課程-南瓜鐵藝香氛蠟燭", price: 750 },
    { name: "平板課程-水彩夜景夢幻煙火畫", price: 590 },
    { name: "平板課程-微景觀多肉玻璃球", price: 790 },
    { name: "平板課程-圓方香氛暈染手工皂", price: 550 },
    { name: "平板課程-工業風永生花", price: 790 },
    { name: "平板課程-拼色水磨石吸水雙杯墊", price: 550 },
    { name: "平板課程-流體畫啤酒開瓶器與啤酒墊", price: 690 },
    { name: "平板課程-工業流金擴香片", price: 590 },
    { name: "平板課程-乾燥花圈精油手工皂", price: 550 },
    { name: "平板課程-月牙多肉三角玻璃屋", price: 980 },
    { name: "平板課程-花影藏香擴香花台", price: 1080 }
  ],
  "水晶系列": [
    { name: "手作輕寶石水晶手鍊", price: 980 },
    { name: "編織星球水晶手鍊", price: 1080 },
    { name: "招財水晶樹", price: 750 },
    { name: "大盆招財水晶樹", price: 1380 },
    { name: "水晶礦石月曆", price: 1180 },
    { name: "時光之石水晶時鐘", price: 1080 }
  ],
  "蠟燭系列": [
    { name: "花圈香氛蠟片", price: 980 },
    { name: "乾燥花玻璃杯燭台", price: 980 },
    { name: "微景觀湖泊蠟燭", price: 880 },
    { name: "告白蠟燭漂流木燭台", price: 1080 },
    { name: "黑曜石松果香氛蠟燭", price: 850 },
    { name: "微醺調酒香氛蠟燭（含調酒）", price: 1380 },
    { name: "多層透視油畫蠟燭", price: 1380 },
    { name: "南瓜鐵藝乾燥花蠟燭", price: 880 },
    { name: "鐵罐乾燥花香氛蠟燭", price: 650 },
    { name: "瑪格麗特調酒香氛蠟燭（含調酒）", price: 1380 },
    { name: "麋鹿香氛蠟燭", price: 880 },
    { name: "馬芬甜點香氛蠟燭", price: 590 },
    { name: "乾燥花擴香蠟片", price: 650 },
    { name: "果凍海洋蠟燭杯", price: 880 }
  ],
  "畫畫系列": [
    { name: "聖誕樹油畫棒", price: 1180 },
    { name: "耶誕窗景酒精畫", price: 1580 },
    { name: "水彩暈染星空畫", price: 650 },
    { name: "月亮燈肌理畫", price: 1980 },
    { name: "絢彩琉璃酒精畫", price: 1480 },
    { name: "經典北歐酒精畫木托盤", price: 1380 },
    { name: "浪花畫油畫棒", price: 1280 },
    { name: "金箔肌理畫", price: 1880 },
    { name: "六角石盤流體畫杯墊", price: 650 },
    { name: "創作雙流體畫方形布畫與杯墊", price: 1180 },
    { name: "雙流體熊圓形布畫", price: 1280 },
    { name: "康乃馨油畫棒", price: 1380 },
    { name: "聖誕樹肌理畫", price: 1380 },
    { name: "聖誕絢彩琉璃酒精畫", price: 1580 },
    { name: "新春吉祥酒精畫", price: 1580 }
  ],
  "多肉植栽系列": [
    { name: "路燈多肉相框", price: 1180 },
    { name: "路燈叢林微景觀多肉梯盆", price: 1180 },
    { name: "雪地多肉玻璃球", price: 980 },
    { name: "苔蘚生態玻璃球", price: 980 },
    { name: "能量礦石叢林生態瓶", price: 1280 },
    { name: "上板鹿角蕨", price: 1680 },
    { name: "上板苔球", price: 1380 },
    { name: "木質苔球小院", price: 980 },
    { name: "微景觀多肉暈染石盆", price: 700 },
    { name: "多肉雙八角水泥盆", price: 650 },
    { name: "月牙多肉三角玻璃屋", price: 1180 },
    { name: "日式注連繩掛飾", price: 980 },
    { name: "叢林多肉花圈", price: 1280 },
    { name: "冷杉擴香雪景觀多肉盆", price: 1180 },
    { name: "療癒水苔多肉藤圈", price: 1180 },
    { name: "上板苔球多肉", price: 1380 },
    { name: "多肉盆栽觸控音樂盒", price: 1380 }
  ],
  "調香系列": [
    { name: "法式香水精油調香", price: 1180 },
    { name: "法式情侶雙人調香組", price: 1980 },
    { name: "芳療精油滾珠瓶", price: 880 },
    { name: "玻尿酸天然精油調香沐浴精", price: 980 },
    { name: "室內擴香調香課", price: 1580 }
  ],
  "花藝系列": [
    { name: "雪影藏花永生繡球花圈", price: 980 },
    { name: "冬夜響鈴玫瑰永生花圈", price: 1280 },
    { name: "水泥樹幹花藝", price: 1180 },
    { name: "迎春花藝木框掛飾", price: 980 },
    { name: "日式注連繩迎春花", price: 980 },
    { name: "北歐胖圈擴香花盆", price: 1080 },
    { name: "工業風擴香乾燥花盆", price: 750 },
    { name: "永恆玫瑰玻璃盅永生花燈", price: 1680 },
    { name: "花藝玻璃珠寶盒", price: 1080 },
    { name: "韓式香水瓶花盒", price: 1080 },
    { name: "韓式質感花束包裝", price: 1780 },
    { name: "多稜角水泥永生花盆", price: 1080 },
    { name: "浮游花瓶永生繡球夜燈", price: 1080 },
    { name: "經典永生花畫框", price: 1080 },
    { name: "迎春乾燥花水泥六角盆", price: 980 },
    { name: "松果花藝名片座", price: 680 },
    { name: "金箔浮游花瓶", price: 680 },
    { name: "水泥六角擴香花盤", price: 650 },
    { name: "工業風永生花", price: 850 },
    { name: "花影藏香擴香花台", price: 1380 },
    { name: "摩天輪玫瑰永生花圈", price: 1680 },
    { name: "玫瑰永生花方瓷盆", price: 1280 }
  ],
  "皮革系列": [
    { name: "皮革證件套", price: 880 },
    { name: "皮革零錢包", price: 880 }
  ],
  "環氧樹脂系列": [
    { name: "海洋風情托盤與雙杯墊", price: 1180 },
    { name: "海洋收藏盒", price: 1680 },
    { name: "日本樹脂康乃馨水晶花夜燈", price: 1980 },
    { name: "日本樹脂龜背葉水晶花", price: 1980 },
    { name: "磁浮月球燈", price: 3680 },
    { name: "夏日海風衛生紙盒與萬用盤", price: 1580 }
  ],
  "手工皂系列": [
    { name: "乾燥花圈香氛手工皂", price: 650 }
  ],
  "藍染系列": [
    { name: "藍染木架收納袋與編織手機鍊", price: 980 },
    { name: "手染遮陽帽與老公公吊飾", price: 680 },
    { name: "創意染零錢包與提繩", price: 580 },
    { name: "創意染鑰匙套與編織杯袋", price: 650 },
    { name: "藍染編織掛布", price: 720 },
    { name: "藍染兩用手提衛生紙套與編織繩", price: 780 },
    { name: "創意染鑰匙套編織手鍊", price: 650 },
    { name: "藍染識別證件套與午睡枕", price: 980 }
  ],
  "其它手作": [
    { name: "擴香石手作", price: 650 },
    { name: "浮游花瓶", price: 780 }
  ]
};

const TRANSPORT_FEES = {
  "台北市": {
    "default": 0,
    "zones": {
      "中正區": 500, "大同區": 500, "中山區": 500, "大安區": 500, "萬華區": 500, "信義區": 500,
      "文山區": 800, "松山區": 800, "士林區": 800, "北投區": 800,
      "南港區": 1000, "內湖區": 1000, "陽明山": 1000
    }
  },
  "新北市": {
    "default": 0,
    "zones": {
      "新莊區": 500, "板橋區": 500, "三重區": 500, "中和區": 500, "永和區": 500,
      "林口區": 1000, "五股區": 1000, "泰山區": 1000, "蘆洲區": 1000, "新店區": 1000, "深坑區": 1000, "石碇區": 1000, "汐止區": 1000, "土城區": 1000, "樹林區": 1000,
      "淡水區": 1500, "雙溪區": 1500, "三芝區": 1500, "三峽區": 1500, "鶯歌區": 1500, "烏來區": 1500,
      "八里區": 1800, "萬里區": 1800, "金山區": 1800, "石門區": 1800, "瑞芳區": 1800, "平溪區": 1800, "坪林區": 1800, "貢寮區": 1800
    }
  },
  "基隆市": { "default": 2000, "zones": {} },
  "桃園市": { "default": 2000, "zones": {} },
  "新竹縣市": { "default": 2500, "zones": {} },
  "宜蘭縣": { "default": 2500, "holiday": 3500, "zones": {} },
  "苗栗縣": { "default": 2800, "zones": {} },
  "台中市(北部出發)": { "default": 3500, "zones": {} },
  "彰化縣(北部出發)": { "default": 3800, "zones": {} },
  "南投縣(北部出發)": { "default": 4800, "zones": {} },
  "雲林縣(北部出發)": { "default": 5000, "zones": {} },
  "嘉義縣市(北部出發)": { "default": 5500, "zones": {} },
  "台南市(北部出發)": { "default": 6500, "zones": {} },
  "高雄市(北部出發)": { "default": 6500, "zones": {} },
  
  "台中市": {
     "default": 0,
     "zones": {
        "中區": 500, "東區": 500, "南區": 500, "西區": 500, "北區": 500, "西屯區": 500, "南屯區": 500, "北屯區": 500,
        "太平區": 800, "大里區": 800, "霧峰區": 800, "烏日區": 800,
        "豐原區": 1200, "后里區": 1200, "石岡區": 1200, "東勢區": 1200, "和平區": 1200, "新社區": 1200, "潭子區": 1200, "大雅區": 1200, "神岡區": 1200, "大肚區": 1200, "外埔區": 1200,
        "沙鹿區": 1500, "龍井區": 1500, "梧棲區": 1500, "清水區": 1500, "大甲區": 1500, "大安區": 1500
     }
  },
  "彰化縣": { "default": 1800, "zones": {} },
  "南投縣": { "default": 1800, "zones": {} },
  "苗栗縣(中部出發)": { "default": 1800, "zones": {} },

  "高雄市": {
    "default": 0,
    "zones": {
      "前金區": 500, "新興區": 500, "鹽埕區": 500, "鼓山區": 500, "旗津區": 500, "左營區": 500, "楠梓區": 500, "三民區": 500, "苓雅區": 500, "前鎮區": 500, "小港區": 500,
      "鳳山區": 800, "大寮區": 800, "仁武區": 800, "大樹區": 800, "大社區": 800, "橋頭區": 800, "梓官區": 800,
      "鳥松區": 1000, "彌陀區": 1000, "永安區": 1000, "岡山區": 1000, "燕巢區": 1000, "阿蓮區": 1000, "路竹區": 1000,
      "林園區": 1500, "田寮區": 1500, "湖內區": 1500,
      "山區(茂林/桃源等)": 2500
    }
  },
  "台南市": { "default": 1500, "zones": {} },
  "嘉義縣市": { "default": 2200, "zones": {} },
  "雲林縣(南部出發)": { "default": 2500, "zones": {} },
  "屏東縣": { 
      "default": 0,
      "zones": {
          "屏東市區": 2000,
          "其他地區": 2500
      }
  }
};

// --- Helper: Get Available Cities for Region ---
const getAvailableCities = (region) => {
    const allCities = Object.keys(TRANSPORT_FEES);
    
    if (region === 'North') {
        return [
            '台北市', '新北市', '基隆市', '桃園市', '新竹縣市', '宜蘭縣', '苗栗縣',
            '台中市(北部出發)', '彰化縣(北部出發)', '南投縣(北部出發)', '雲林縣(北部出發)',
            '嘉義縣市(北部出發)', '台南市(北部出發)', '高雄市(北部出發)'
        ];
    }
    
    if (region === 'Central') {
        return [
            '台中市', '彰化縣', '南投縣', '苗栗縣(中部出發)'
        ];
    }
    
    if (region === 'South') {
        return [
            '高雄市', '台南市', '嘉義縣市', '屏東縣', '雲林縣(南部出發)'
        ];
    }
    
    return [];
};

// --- 3. 核心計算邏輯 (Business Logic) ---

const calculateItem = (item) => {
  const { 
    price, peopleCount, locationMode, 
    outingRegion, city, area, 
    hasInvoice, customDiscount, extraFee,
    enableDiscount90 // New field
  } = item;

  let error = null;
  let teacherFee = 0;
  let transportFee = 0;
  let discountRate = 1.0;
  let isDiscountApplied = false;

  const count = parseInt(peopleCount) || 0;
  const unitPrice = parseInt(price) || 0;
  const cDiscount = parseInt(customDiscount) || 0;
  const eFee = parseInt(extraFee) || 0;

  // --- CHANGED: Logic for minimum people counts kept, but automatic discount removed ---
  if (locationMode === 'outing') {
    if (outingRegion === 'North') {
        const isRemote = ['桃園市', '新竹縣市', '苗栗縣', '宜蘭縣'].includes(city) || city.includes('(北部出發)');
        
        if (isRemote) {
            if (count < 25) error = `北部遠程外派(${city.replace(/\(.*\)/, '')})最低出課人數為 25 人`;
        } else {
            if (['台北市', '新北市'].includes(city)) {
                if (count >= 10 && count <= 14) teacherFee = 2000;
            }
        }
    } else if (outingRegion === 'Central') {
        if (city === '台中市') {
            if (count < 10) error = "中部市區外派最低出課人數為 10 人";
        } else {
            if (count < 15) error = "中部其他地區外派最低出課人數為 15 人";
        }
    } else if (outingRegion === 'South') {
        if (city === '高雄市') {
             if (count < 10) error = "南部市區外派最低出課人數為 10 人";
        } else {
             if (count < 15) error = "南部其他地區外派最低出課人數為 15 人";
        }
    }
  } else {
    // Store mode checks
    if (outingRegion === 'Central') {
        if (count < 10) error = "中部店內包班最低人數 10 人";
    } else if (outingRegion === 'South') {
        if (count < 6) error = "南部店內包班最低人數 6 人";
    }
  }

  // --- NEW: Manual 90% Discount Logic ---
  if (enableDiscount90) {
      discountRate = 0.9;
      isDiscountApplied = true;
  }

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
  const taxableAmount = discountedSubTotal - cDiscount;
  const tax = hasInvoice ? Math.round(taxableAmount * 0.05) : 0;
  const finalTotal = (taxableAmount + tax) + transportFee + teacherFee + eFee;

  return { subTotal, discountAmount, isDiscountApplied, tax, transportFee, teacherFee, finalTotal, error };
};

const formatDate = (dateStr) => {
    if(!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('zh-TW');
}

// --- 4. UI Components ---

const StatusSelector = ({ status, onChange }) => {
    const options = [
        { value: "draft", label: "草稿", color: "bg-gray-100 text-gray-800" },
        { value: "pending", label: "報價中", color: "bg-blue-100 text-blue-800" },
        { value: "confirmed", label: "已回簽", color: "bg-purple-100 text-purple-800" },
        { value: "paid", label: "已付訂", color: "bg-orange-100 text-orange-800" },
        { value: "closed", label: "已結案", color: "bg-green-100 text-green-800" }
    ];

    const current = options.find(o => o.value === status) || options[0];

    return (
        <div className="relative inline-block text-left group">
            <select 
                value={status}
                onChange={(e) => onChange(e.target.value)}
                className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-offset-1 focus:ring-blue-300 ${current.color}`}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-white text-gray-900">
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-1.5 pointer-events-none opacity-50" />
        </div>
    );
};

// --- QuotePreview Component ---
const QuotePreview = ({ clientInfo, items, totalAmount, dateStr, idStr }) => {
    return (
        <div id="printable-area" className="bg-white w-full min-h-[600px] shadow-lg p-8 text-sm scale-100 origin-top mx-auto max-w-[210mm] print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0 print:text-black">
            {/* Header */}
            <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">下班隨手作活動報價單</h1>
                </div>
                <div className="text-right text-gray-600">
                    <p>報價日期: {dateStr}</p>
                    <p className="font-bold mt-1">有效期限：3天</p>
                </div>
            </div>
            {/* Client */}
            <div className="mb-8 bg-gray-50 p-4 rounded border border-gray-100 print:bg-white print:border-gray-300">
                <h2 className="font-bold text-gray-800 border-b border-gray-200 mb-3 pb-1">客戶資料</h2>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <p><span className="text-gray-500 mr-2">名稱:</span> {clientInfo.companyName || '-'}</p>
                    <p><span className="text-gray-500 mr-2">統編:</span> {clientInfo.taxId || '-'}</p>
                    <p><span className="text-gray-500 mr-2">聯絡人:</span> {clientInfo.contactPerson || '-'}</p>
                    <p><span className="text-gray-500 mr-2">電話:</span> {clientInfo.phone || '-'}</p>
                    <p className="col-span-2"><span className="text-gray-500 mr-2">Email:</span> {clientInfo.email || '-'}</p>
                </div>
            </div>
            {/* Table */}
            <table className="w-full mb-6 border-collapse">
                <thead>
                    <tr className="bg-gray-800 text-white print:bg-gray-200 print:text-black">
                        <th className="p-3 text-left rounded-l print:rounded-none">項目</th>
                        <th className="p-3 text-right">單價</th>
                        <th className="p-3 text-right">數量</th>
                        <th className="p-3 text-right rounded-r print:rounded-none">小計</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {items.map((item, i) => (
                        <React.Fragment key={i}>
                            <tr>
                                <td className="p-3">
                                    <div className="font-bold text-gray-800">{item.courseName}</div>
                                    {item.itemNote && (
                                        <div className="text-xs text-gray-500 mt-1 font-medium bg-yellow-50 inline-block px-1 rounded border border-yellow-100 print:bg-transparent print:border-gray-400">
                                            備註: {item.itemNote}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1 flex flex-col gap-1">
                                        {(item.eventDate || item.eventTime) && (
                                            <div>
                                                時間：{item.eventDate} {item.eventTime}
                                            </div>
                                        )}
                                        {item.address && (
                                            <div>
                                                地點：{item.address}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 text-right text-gray-600">${item.price.toLocaleString()}</td>
                                <td className="p-3 text-right text-gray-600">{item.peopleCount}</td>
                                <td className="p-3 text-right font-medium">${item.calc.subTotal.toLocaleString()}</td>
                            </tr>
                            {/* Detail Rows */}
                            {(item.calc.isDiscountApplied || item.customDiscount > 0) && (
                                <tr className="bg-red-50 text-xs print:bg-transparent">
                                    <td colSpan="3" className="p-2 pl-4 text-right text-red-600 print:text-black">
                                        折扣優惠 {item.customDiscountDesc ? `(${item.customDiscountDesc})` : ''}
                                    </td>
                                    <td className="p-2 text-right text-red-600 font-bold print:text-black">
                                        -${((item.calc.discountAmount || 0) + parseInt(item.customDiscount || 0)).toLocaleString()}
                                    </td>
                                </tr>
                            )}
                            {(item.calc.transportFee > 0) && (
                                <tr className="bg-green-50 text-xs text-green-900 print:bg-transparent print:text-black">
                                    <td colSpan="3" className="p-2 pl-4 text-right">
                                        車馬費 ({item.city.replace(/\(.*\)/, '')}{item.area})
                                    </td>
                                    <td className="p-2 text-right font-bold">+${item.calc.transportFee.toLocaleString()}</td>
                                </tr>
                            )}
                            {(item.calc.teacherFee > 0) && (
                                <tr className="bg-green-50 text-xs text-green-900 print:bg-transparent print:text-black">
                                    <td colSpan="3" className="p-2 pl-4 text-right">師資費</td>
                                    <td className="p-2 text-right font-bold">+${item.calc.teacherFee.toLocaleString()}</td>
                                </tr>
                            )}
                            {(item.extraFee > 0) && (
                                <tr className="bg-green-50 text-xs text-green-900 print:bg-transparent print:text-black">
                                    <td colSpan="3" className="p-2 pl-4 text-right">
                                        額外加價 {item.extraFeeDesc ? `(${item.extraFeeDesc})` : ''}
                                    </td>
                                    <td className="p-2 text-right font-bold">+${parseInt(item.extraFee).toLocaleString()}</td>
                                </tr>
                            )}
                            {(item.hasInvoice) && (
                                <tr className="bg-green-50 text-xs text-green-900 print:bg-transparent print:text-black">
                                    <td colSpan="3" className="p-2 pl-4 text-right">營業稅 (5%)</td>
                                    <td className="p-2 text-right font-bold">+${item.calc.tax.toLocaleString()}</td>
                                </tr>
                            )}
                            <tr className="bg-gray-100 font-bold text-gray-900 border-b-2 border-gray-300 print:bg-gray-50">
                                <td colSpan="3" className="p-2 text-right">項目總計</td>
                                <td className="p-2 text-right">${item.calc.finalTotal.toLocaleString()}</td>
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            {/* Total */}
            <div className="flex justify-end mt-8">
                <div className="w-1/2 bg-gray-50 p-4 rounded border border-gray-200 print:w-2/3 print:bg-white print:border-gray-800">
                    <div className="flex justify-between items-center text-2xl font-bold text-blue-900 print:text-black">
                        <span>總金額</span>
                        <span>${totalAmount.toLocaleString()}</span>
                    </div>
                    <p className="text-right text-xs text-gray-500 mt-2">含稅及所有費用</p>
                </div>
            </div>
            
            {/* Notes Section - New Requirement */}
            <div className="mt-8 pt-6 border-t-2 border-gray-800 text-xs text-gray-700 leading-relaxed">
                <h4 className="font-bold text-sm mb-2">注意事項 / 條款：</h4>
                <ol className="list-decimal list-inside space-y-1">
                    <li>本報價單有效時間以接到合作案3天為主，經買家簽章後則視為訂單確認單，並於活動前彼此簽訂總人數之報價單視同正式合作簽署，下班隨手作可依此作為收款依據。</li>
                    <li>人數以報價單協議人數為主，可再臨時新增但不能臨時減少，如當天未達人數老師會製作成品補齊給客戶。</li>
                    <li>教學老師依報價單數量人數進行分配，為鞏固教學品質，實際報價人數以報價單【數量】等同【現場課程參與人數】，超過報價數量人數則依現場實際增加人數加收陪同費，並於尾款一併收費。</li>
                    <li>客戶確認訂單簽章後，回覆Mail: xiabenhow@gmail.com。 或官方Line :@xiabenhow下班隨手作</li>
                    <li className="text-red-600 font-bold">付款方式：確認日期金額，回傳報價單，並蓋章付50%訂金方可協議出課，於課當天結束後7天內匯款付清尾款。</li>
                    <li>已預定的課程，由於此時間老師已經推掉其他手作課程，恕無法無故延期，造成老師損失。</li>
                </ol>
                <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-300 print:bg-transparent print:border-gray-800">
                    <p className="font-bold text-sm">銀行：玉山銀行 永安分行 808 &nbsp;&nbsp;&nbsp; 戶名：下班文化國際有限公司 &nbsp;&nbsp;&nbsp; 帳號：1115-940-021201</p>
                </div>
            </div>

            {/* Footer Sign */}
            <div className="mt-12 pt-8 border-t border-gray-300 flex justify-between text-sm">
                <div>
                    <p>下班隨手作代表：_________________</p>
                </div>
                <div>
                    <p>客戶確認簽章：_________________</p>
                </div>
            </div>
        </div>
    );
};


const PaymentModal = ({ quote, onClose, onSave }) => {
    const [details, setDetails] = useState({
        depositAmount: 0,
        depositNote: '',
        additionalPayment: 0,
        additionalPaymentNote: '',
        finalPayment: 0,
        finalPaymentNote: ''
    });

    useEffect(() => {
        if (quote.paymentDetails) {
            setDetails(quote.paymentDetails);
        }
    }, [quote]);

    const actualTotal = (quote.totalAmount || 0) + parseInt(details.additionalPayment || 0);
    const paidTotal = parseInt(details.depositAmount || 0) + parseInt(details.finalPayment || 0);
    const remaining = actualTotal - paidTotal;

    const handleSave = () => {
        let newStatus = quote.status;
        let closedAt = quote.closedAt;

        if (remaining === 0) {
            if (confirm("款項已全數結清，確認將此案件結案 (Closed)？")) {
                newStatus = 'closed';
                closedAt = new Date().toISOString();
            }
        } else if (remaining < 0) {
            alert("錯誤：收款金額超過總金額！");
            return;
        }

        onSave(quote.id, {
            paymentDetails: details,
            status: newStatus,
            closedAt
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 overflow-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">款項管理 ({quote.clientInfo.companyName})</h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-500" /></button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">原始報價總額</h3>
                        <div className="text-2xl font-bold">${quote.totalAmount?.toLocaleString()}</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold text-blue-500 mb-2">實際應收總額 (含追加)</h3>
                        <div className="text-2xl font-bold text-blue-700">${actualTotal.toLocaleString()}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="border p-4 rounded-lg">
                        <h4 className="font-bold mb-3 flex items-center"><Check className="w-4 h-4 mr-2 text-green-500"/> 1. 訂金 (Deposit)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={LABEL_CLASS}>金額</label>
                                <input 
                                    type="number" 
                                    className={INPUT_CLASS}
                                    value={details.depositAmount}
                                    onChange={e => setDetails({...details, depositAmount: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={LABEL_CLASS}>備註 (匯款後五碼等)</label>
                                <input 
                                    type="text" 
                                    className={INPUT_CLASS}
                                    value={details.depositNote}
                                    onChange={e => setDetails({...details, depositNote: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border p-4 rounded-lg border-orange-200 bg-orange-50">
                        <h4 className="font-bold mb-3 flex items-center text-orange-800"><Plus className="w-4 h-4 mr-2"/> 2. 追加款項 (Additional)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={LABEL_CLASS}>金額</label>
                                <input 
                                    type="number" 
                                    className={INPUT_CLASS}
                                    value={details.additionalPayment}
                                    onChange={e => setDetails({...details, additionalPayment: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={LABEL_CLASS}>原因說明</label>
                                <input 
                                    type="text" 
                                    className={INPUT_CLASS}
                                    value={details.additionalPaymentNote}
                                    onChange={e => setDetails({...details, additionalPaymentNote: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border p-4 rounded-lg">
                        <h4 className="font-bold mb-3 flex items-center"><DollarSign className="w-4 h-4 mr-2 text-green-500"/> 3. 尾款 (Final)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={LABEL_CLASS}>金額</label>
                                <input 
                                    type="number" 
                                    className={INPUT_CLASS}
                                    value={details.finalPayment}
                                    onChange={e => setDetails({...details, finalPayment: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={LABEL_CLASS}>備註</label>
                                <input 
                                    type="text" 
                                    className={INPUT_CLASS}
                                    value={details.finalPaymentNote}
                                    onChange={e => setDetails({...details, finalPaymentNote: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                    <div>
                        <span className="text-gray-600">剩餘未付金額：</span>
                        <span className={`text-xl font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${remaining.toLocaleString()}
                        </span>
                    </div>
                    <div className="space-x-2">
                        <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">取消</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold flex items-center">
                            <Save className="w-4 h-4 mr-2" /> 儲存並更新狀態
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- StatsView Component ---
const StatsView = ({ quotes }) => {
    // 1. Get unique months from quotes
    const availableMonths = useMemo(() => {
        const months = new Set();
        quotes.forEach(q => {
            if (q.status !== 'draft') {
                const date = new Date(q.createdAt);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                months.add(key);
            }
        });
        return Array.from(months).sort().reverse();
    }, [quotes]);

    const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] || "");

    useEffect(() => {
        if (!selectedMonth && availableMonths.length > 0) {
            setSelectedMonth(availableMonths[0]);
        }
    }, [availableMonths]);

    // 2. Calculate Stats
    const stats = useMemo(() => {
        const result = {
            totalRevenue: 0,
            totalOrders: 0,
            regions: {
                'North': { name: '北部', revenue: 0, count: 0, color: 'bg-blue-500' },
                'Central': { name: '中部', revenue: 0, count: 0, color: 'bg-yellow-500' },
                'South': { name: '南部', revenue: 0, count: 0, color: 'bg-green-500' }
            },
            // New: Status Breakdown
            statuses: {
                'pending': { name: '報價中', count: 0, color: 'bg-blue-100 text-blue-800' },
                'confirmed': { name: '已回簽 (待付訂)', count: 0, color: 'bg-purple-100 text-purple-800' },
                'paid': { name: '已付訂 (待結清)', count: 0, color: 'bg-orange-100 text-orange-800' },
                'closed': { name: '已結案', count: 0, color: 'bg-green-100 text-green-800' }
            }
        };

        if (!selectedMonth) return result;

        quotes.forEach(q => {
            const qDate = new Date(q.createdAt);
            const qMonth = `${qDate.getFullYear()}-${String(qDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (q.status !== 'draft' && qMonth === selectedMonth) {
                // Region
                let regionKey = 'North'; 
                if (q.items && q.items.length > 0) {
                    const firstItem = q.items[0];
                    const r = firstItem.outingRegion || firstItem.regionType;
                    if (r && result.regions[r]) {
                        regionKey = r;
                    }
                }

                const amount = q.totalAmount || 0;
                result.totalRevenue += amount;
                result.totalOrders += 1;
                result.regions[regionKey].revenue += amount;
                result.regions[regionKey].count += 1;

                // Status
                if (result.statuses[q.status]) {
                    result.statuses[q.status].count += 1;
                }
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
                    <TrendingUp className="mr-3 text-blue-600" /> 業績統計儀表板
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">選擇月份:</span>
                    <select 
                        className={INPUT_CLASS + " w-40"}
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                    >
                        {availableMonths.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Total Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-blue-100 font-medium mb-1">本月總業績 ({selectedMonth})</p>
                        <h3 className="text-4xl font-bold tracking-tight">${stats.totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-blue-100 font-medium mb-1">總成交案件</p>
                        <h3 className="text-3xl font-bold">{stats.totalOrders} <span className="text-base font-normal opacity-80">件</span></h3>
                    </div>
                </div>
            </div>

            {/* Status Breakdown (New) */}
            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2"/> 案件狀態分佈
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {Object.keys(stats.statuses).map(key => (
                    <div key={key} className={`p-4 rounded-lg border ${stats.statuses[key].color.replace('bg-', 'border-').replace('100', '200')} ${stats.statuses[key].color}`}>
                        <p className="text-xs font-bold uppercase opacity-70">{stats.statuses[key].name}</p>
                        <p className="text-2xl font-bold mt-1">{stats.statuses[key].count}</p>
                    </div>
                ))}
            </div>

            {/* Region Cards */}
            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2"/> 地區業績佔比
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.keys(stats.regions).map(key => {
                    const region = stats.regions[key];
                    const percentage = stats.totalRevenue > 0 ? Math.round((region.revenue / stats.totalRevenue) * 100) : 0;
                    
                    return (
                        <div key={key} className="bg-white p-6 rounded-xl shadow border border-gray-100 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-2 h-full ${region.color}`}></div>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-bold text-gray-700">{region.name}區域</h4>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600`}>
                                    {percentage}% 佔比
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider">區域營收</p>
                                    <p className="text-2xl font-bold text-gray-900">${region.revenue.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider">案件數量</p>
                                    <p className="text-lg font-semibold text-gray-700">{region.count} 件</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- ListView Component (Updated with Status Filter) ---
const ListView = ({ quotes, onEdit, onDelete, onPayment, onPreview, onStatusChange, onExport, onCreate, onImportBackup, onExportBackup }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); 
    const importRef = useRef(null);

    const groupedQuotes = useMemo(() => {
        const groups = {};
        quotes.forEach(q => {
            const date = new Date(q.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(q);
        });
        return groups;
    }, [quotes]);

    const filteredMonths = Object.keys(groupedQuotes).sort().reverse().filter(m => !monthFilter || m === monthFilter);

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">報價單管理</h2>
                <div className="flex gap-2 flex-wrap">
                     <button onClick={onExport} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-50 flex items-center shadow-sm font-medium">
                        <FileText className="w-4 h-4 mr-2"/> 匯出報表 (CSV)
                     </button>
                     
                     {/* Backup Buttons */}
                     <button onClick={onExportBackup} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-50 flex items-center shadow-sm font-medium">
                        <Download className="w-4 h-4 mr-2"/> 備份資料 (JSON)
                     </button>
                     <button onClick={() => importRef.current.click()} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-50 flex items-center shadow-sm font-medium">
                        <Upload className="w-4 h-4 mr-2"/> 還原資料 (JSON)
                     </button>
                     <input type="file" ref={importRef} onChange={onImportBackup} className="hidden" accept=".json" />

                     <button onClick={onCreate} className="md:hidden px-4 py-2 bg-teal-600 text-white rounded font-medium shadow-sm">新增</button>
                </div>
            </div>

            {/* Filters */}
            <div className={SECTION_CLASS + " mb-6 flex flex-col md:flex-row gap-4 items-center"}>
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5"/>
                    <input 
                        type="text" 
                        placeholder="搜尋客戶名稱、電話..." 
                        className={INPUT_CLASS + " pl-10"}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {/* Month Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 whitespace-nowrap">月份:</span>
                    <select 
                        className={INPUT_CLASS + " md:w-40"}
                        value={monthFilter}
                        onChange={e => setMonthFilter(e.target.value)}
                    >
                        <option value="">全部月份</option>
                        {Object.keys(groupedQuotes).sort().reverse().map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 whitespace-nowrap">狀態:</span>
                    <select 
                        className={INPUT_CLASS + " md:w-40"}
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="all">全部狀態</option>
                        <option value="draft">草稿</option>
                        <option value="pending">報價中</option>
                        <option value="confirmed">已回簽 (未付訂)</option>
                        <option value="paid">已付訂 (未結清)</option>
                        <option value="closed">已結案</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="space-y-6">
                {filteredMonths.map(month => {
                    const monthQuotes = groupedQuotes[month].filter(q => {
                        const matchesSearch = q.clientInfo.companyName.includes(searchTerm) || q.clientInfo.phone.includes(searchTerm);
                        const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
                        return matchesSearch && matchesStatus;
                    });

                    if (monthQuotes.length === 0) return null;

                    return (
                        <div key={month} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center font-semibold text-gray-700">
                                <Folder className="w-5 h-5 mr-2 text-yellow-500" />
                                {month} ({monthQuotes.length})
                            </div>
                            <div className="divide-y divide-gray-100">
                                {monthQuotes.map(quote => (
                                    <div key={quote.id} className="p-4 hover:bg-blue-50 transition flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                <StatusSelector 
                                                    status={quote.status} 
                                                    onChange={(val) => onStatusChange(quote.id, val)}
                                                />
                                                <span className="font-bold text-lg text-gray-900 truncate">{quote.clientInfo.companyName}</span>
                                                <span className="text-xs text-gray-400 font-mono">#{quote.id.slice(-4)}</span>
                                            </div>
                                            <div className="text-sm text-gray-600 truncate">
                                                <span className="mr-3">聯絡人: {quote.clientInfo.contactPerson}</span>
                                                <span>課程: {quote.items[0]?.courseName} {quote.items.length > 1 ? `(+${quote.items.length - 1})` : ''}</span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                建立於: {formatDate(quote.createdAt)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 min-w-[150px]">
                                            <div className="text-xl font-bold text-blue-600">
                                                ${quote.totalAmount?.toLocaleString()}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => onPreview(quote)} className="p-2 text-blue-600 hover:bg-blue-100 rounded tooltip transition-colors" title="預覽報價單">
                                                    <Eye className="w-5 h-5"/>
                                                </button>
                                                {quote.status === 'paid' && (
                                                    <button onClick={() => onPayment(quote)} className="p-2 text-orange-600 hover:bg-orange-100 rounded tooltip transition-colors" title="款項管理">
                                                        <DollarSign className="w-5 h-5"/>
                                                    </button>
                                                )}
                                                <button onClick={() => onEdit(quote)} className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="編輯">
                                                    <Edit className="w-5 h-5"/>
                                                </button>
                                                <button onClick={() => onDelete(quote.id)} className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors" title="刪除">
                                                    <Trash2 className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- QuoteCreator Component (Restored & Updated) ---
const QuoteCreator = ({ initialData, onSave, onCancel }) => {
    const [clientInfo, setClientInfo] = useState(initialData?.clientInfo || {
        companyName: '', taxId: '', contactPerson: '', phone: '', email: '', address: ''
    });
    const [status, setStatus] = useState(initialData?.status || 'draft');
    const [dueDate, setDueDate] = useState(initialData?.paymentDueDate || '');
    const [adminNotes, setAdminNotes] = useState(initialData?.adminNotes || '');
    const [showPreviewMobile, setShowPreviewMobile] = useState(false); 

    const [items, setItems] = useState(initialData?.items || [{
        id: Date.now(),
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
        eventTime: '',
        hasInvoice: false,
        enableDiscount90: false, // NEW DEFAULT
        customDiscount: 0,
        customDiscountDesc: '', 
        extraFee: 0,
        extraFeeDesc: '', 
        address: '',
        itemNote: ''
    }]);

    const calculatedItems = useMemo(() => {
        return items.map(item => ({
            ...item,
            calc: calculateItem(item)
        }));
    }, [items]);

    const totalAmount = calculatedItems.reduce((sum, item) => sum + (item.calc.finalTotal || 0), 0);

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        if (field === 'courseName') {
            const series = COURSE_DATA[newItems[index].courseSeries];
            const course = series.find(c => c.name === value);
            if (course) newItems[index].price = course.price;
        }
        if (field === 'courseSeries') {
             const series = COURSE_DATA[value];
             if(series && series.length > 0) {
                 newItems[index].courseName = series[0].name;
                 newItems[index].price = series[0].price;
             }
        }
        if (field === 'outingRegion') {
            const available = getAvailableCities(value);
            // Default to first city in the list
            newItems[index].city = available[0] || '';
            newItems[index].area = '';
        }
        if (field === 'city') {
             newItems[index].area = '';
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { ...items[items.length-1], id: Date.now(), itemNote: '', enableDiscount90: false }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        const hasError = calculatedItems.some(i => i.calc.error);
        if (hasError) {
            alert("報價單中有項目不符合規則，請修正後再儲存。");
            return;
        }

        onSave({
            clientInfo,
            items: calculatedItems, 
            totalAmount,
            status,
            paymentDueDate: dueDate,
            adminNotes
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto p-4 md:p-8 relative print:block print:w-full print:h-auto">
            
            {/* 1. Client Info */}
            <div className="print:hidden">
                <section className={SECTION_CLASS}>
                    <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-700 flex items-center">
                        <div className="w-1 h-6 bg-slate-800 mr-2 rounded"></div>
                        客戶基本資料 (報價單抬頭)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_CLASS}>公司/客戶名稱</label>
                            <input className={INPUT_CLASS} placeholder="請輸入名稱" value={clientInfo.companyName} onChange={e => setClientInfo({...clientInfo, companyName: e.target.value})} />
                        </div>
                        <div>
                            <label className={LABEL_CLASS}>統一編號</label>
                            <input className={INPUT_CLASS} placeholder="選填" value={clientInfo.taxId} onChange={e => setClientInfo({...clientInfo, taxId: e.target.value})} />
                        </div>
                        <div>
                            <label className={LABEL_CLASS}>聯絡人</label>
                            <input className={INPUT_CLASS} placeholder="請輸入聯絡人" value={clientInfo.contactPerson} onChange={e => setClientInfo({...clientInfo, contactPerson: e.target.value})} />
                        </div>
                        <div>
                            <label className={LABEL_CLASS}>電話</label>
                            <input className={INPUT_CLASS} placeholder="請輸入電話" value={clientInfo.phone} onChange={e => setClientInfo({...clientInfo, phone: e.target.value})} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={LABEL_CLASS}>電子信箱</label>
                            <input className={INPUT_CLASS} placeholder="選填" value={clientInfo.email} onChange={e => setClientInfo({...clientInfo, email: e.target.value})} />
                        </div>
                    </div>
                </section>
            </div>

            {/* 2. Items List */}
            <div className="space-y-6 print:hidden">
                {items.map((item, idx) => (
                    <div key={item.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 relative">
                            <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-blue-800 flex items-center">
                                <Plus className="w-5 h-5 mr-2" /> 課程項目 ({idx + 1})
                            </h3>
                            {items.length > 1 && (
                                <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 className="w-5 h-5"/></button>
                            )}
                            </div>

                            {/* Course Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className={LABEL_CLASS}>課程系列</label>
                                <select className={INPUT_CLASS} value={item.courseSeries} onChange={e => updateItem(idx, 'courseSeries', e.target.value)}>
                                    {Object.keys(COURSE_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className={LABEL_CLASS}>課程名稱 (單價: ${item.price})</label>
                                <select className={INPUT_CLASS} value={item.courseName} onChange={e => updateItem(idx, 'courseName', e.target.value)}>
                                    {COURSE_DATA[item.courseSeries]?.map(c => <option key={c.name} value={c.name}>{c.name} (${c.price})</option>)}
                                </select>
                            </div>
                            </div>

                            {/* Event Details */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className={LABEL_CLASS}>人數</label>
                                    <input type="number" className={INPUT_CLASS} value={item.peopleCount} onChange={e => updateItem(idx, 'peopleCount', e.target.value)} />
                                </div>
                                <div>
                                    <label className={LABEL_CLASS}>日期</label>
                                    <input type="date" className={INPUT_CLASS} value={item.eventDate} onChange={e => updateItem(idx, 'eventDate', e.target.value)} />
                                </div>
                                <div>
                                    <label className={LABEL_CLASS}>時間 (24h)</label>
                                    <input type="time" className={INPUT_CLASS} value={item.eventTime} onChange={e => updateItem(idx, 'eventTime', e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-2 pt-6">
                                    <label className="flex items-center cursor-pointer select-none p-1.5 bg-yellow-50 rounded border border-yellow-100 w-full">
                                        <input type="checkbox" className="mr-2 w-4 h-4" checked={item.hasInvoice} onChange={e => updateItem(idx, 'hasInvoice', e.target.checked)} />
                                        <span className="text-sm font-medium text-gray-700">是否開立發票? (5%)</span>
                                    </label>
                                    {/* NEW: Manual 90% Discount Checkbox */}
                                    <label className="flex items-center cursor-pointer select-none p-1.5 bg-red-50 rounded border border-red-100 w-full">
                                        <input type="checkbox" className="mr-2 w-4 h-4" checked={item.enableDiscount90 || false} onChange={e => updateItem(idx, 'enableDiscount90', e.target.checked)} />
                                        <span className="text-sm font-medium text-red-700">套用九折優惠 (10% Off)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Location Logic */}
                            <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4">
                                <div className="flex gap-6 mb-4">
                                    <label className="flex items-center cursor-pointer font-bold text-gray-700">
                                        <input type="radio" name={`mode-${item.id}`} className="mr-2 w-4 h-4" checked={item.locationMode === 'outing'} onChange={() => updateItem(idx, 'locationMode', 'outing')} /> 
                                        外派教學
                                    </label>
                                    <label className="flex items-center cursor-pointer font-bold text-gray-700">
                                        <input type="radio" name={`mode-${item.id}`} className="mr-2 w-4 h-4" checked={item.locationMode === 'store'} onChange={() => updateItem(idx, 'locationMode', 'store')} /> 
                                        店內包班
                                    </label>
                                </div>

                                {item.locationMode === 'outing' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className={LABEL_CLASS}>車馬費計算區域</label>
                                        <select className={INPUT_CLASS} value={item.outingRegion} onChange={e => updateItem(idx, 'outingRegion', e.target.value)}>
                                            <option value="North">北部出課</option>
                                            <option value="Central">中部老師出課</option>
                                            <option value="South">南部老師出課</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={LABEL_CLASS}>
                                            縣市 
                                            {calculatedItems[idx].calc.transportFee > 0 && !calculatedItems[idx].area && (
                                                <span className="text-blue-600 ml-2 font-normal text-xs bg-blue-50 px-2 py-0.5 rounded">
                                                    預估: ${calculatedItems[idx].calc.transportFee}
                                                </span>
                                            )}
                                        </label>
                                        <select className={INPUT_CLASS} value={item.city} onChange={e => updateItem(idx, 'city', e.target.value)}>
                                            {getAvailableCities(item.outingRegion).map(c => (
                                                <option key={c} value={c}>{c.replace('(北部出發)', '').replace('(中部出發)', '').replace('(南部出發)', '')}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {TRANSPORT_FEES[item.city]?.zones && Object.keys(TRANSPORT_FEES[item.city].zones).length > 0 && (
                                        <div>
                                            <label className={LABEL_CLASS}>
                                                選擇區域
                                                {calculatedItems[idx].calc.transportFee > 0 && (
                                                    <span className="text-blue-600 ml-2 font-normal text-xs bg-blue-50 px-2 py-0.5 rounded">
                                                        +${calculatedItems[idx].calc.transportFee}
                                                    </span>
                                                )}
                                            </label>
                                            <select className={INPUT_CLASS} value={item.area} onChange={e => updateItem(idx, 'area', e.target.value)}>
                                                <option value="">選擇區域...</option>
                                                {Object.entries(TRANSPORT_FEES[item.city].zones).map(([zone, fee]) => (
                                                    <option key={zone} value={zone}>{zone} (+${fee})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="md:col-span-3">
                                        <label className={LABEL_CLASS}>詳細地址</label>
                                        <input className={INPUT_CLASS} placeholder="請輸入詳細地址" value={item.address} onChange={e => updateItem(idx, 'address', e.target.value)} />
                                    </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-4">
                                        <div>
                                        <label className={LABEL_CLASS}>店內區域</label>
                                        <select className={INPUT_CLASS} value={item.regionType} onChange={e => updateItem(idx, 'regionType', e.target.value)}>
                                            <option value="North">北部店內</option>
                                            <option value="Central">中部店內</option>
                                            <option value="South">南部店內</option>
                                        </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* New Field: Item Note */}
                            <div className="mb-4">
                            <label className={LABEL_CLASS}>該堂課備註說明 (選填)</label>
                            <input 
                                type="text" 
                                className={INPUT_CLASS} 
                                placeholder="例如: 需提前半小時進場、特殊需求..." 
                                value={item.itemNote} 
                                onChange={e => updateItem(idx, 'itemNote', e.target.value)} 
                            />
                            </div>

                            {/* Adjustments (Updated layout with descriptions) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Discount Section */}
                                <div className="bg-red-50 p-4 rounded border border-red-100">
                                    <label className={LABEL_CLASS + " text-red-800"}>手動折扣 (減項)</label>
                                    <div className="flex flex-col gap-2">
                                        <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500 font-bold">-</span>
                                        <input type="number" className={INPUT_CLASS + " pl-6"} placeholder="金額" value={item.customDiscount} onChange={e => updateItem(idx, 'customDiscount', e.target.value)} />
                                        </div>
                                        <input type="text" className={INPUT_CLASS} placeholder="折扣說明 (如: 老客戶優惠)" value={item.customDiscountDesc || ''} onChange={e => updateItem(idx, 'customDiscountDesc', e.target.value)} />
                                    </div>
                                </div>
                                {/* Extra Fee Section */}
                                <div className="bg-blue-50 p-4 rounded border border-blue-100">
                                    <label className={LABEL_CLASS + " text-blue-800"}>額外加價 (加項)</label>
                                    <div className="flex flex-col gap-2">
                                        <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500 font-bold">+</span>
                                        <input type="number" className={INPUT_CLASS + " pl-6"} placeholder="金額" value={item.extraFee} onChange={e => updateItem(idx, 'extraFee', e.target.value)} />
                                        </div>
                                        <input type="text" className={INPUT_CLASS} placeholder="加價說明 (如: 指定花材)" value={item.extraFeeDesc || ''} onChange={e => updateItem(idx, 'extraFeeDesc', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {calculatedItems[idx].calc.error && (
                                <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    <span className="font-bold">{calculatedItems[idx].calc.error}</span>
                                </div>
                            )}
                    </div>
                ))}
                
                <button onClick={addItem} className="w-full py-4 bg-white border-2 border-dashed border-gray-300 shadow-sm rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition flex justify-center items-center font-bold text-lg">
                    <Plus className="w-6 h-6 mr-2" /> 增加更多課程
                </button>
            </div>

            {/* 3. Final Settings (Status & Notes) */}
            <div className="print:hidden">
                <section className={SECTION_CLASS}>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className={LABEL_CLASS}>狀態</label>
                             <select className={INPUT_CLASS} value={status} onChange={e => setStatus(e.target.value)}>
                                 <option value="draft">草稿</option>
                                 <option value="pending">報價中</option>
                                 <option value="confirmed">已回簽</option>
                                 <option value="paid">已付訂</option>
                                 <option value="closed">已結案</option>
                             </select>
                         </div>
                         <div>
                             <label className={LABEL_CLASS}>付款期限</label>
                             <input type="date" className={INPUT_CLASS} value={dueDate} onChange={e => setDueDate(e.target.value)} />
                         </div>
                         <div className="col-span-2">
                             <label className={LABEL_CLASS}>內部備註</label>
                             <textarea className={INPUT_CLASS} rows="3" placeholder="僅供內部查看..." value={adminNotes} onChange={e => setAdminNotes(e.target.value)} />
                         </div>
                     </div>
                </section>
            </div>

            {/* 4. Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 print:hidden">
                <button onClick={onCancel} className="px-6 py-3 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-bold">取消</button>
                <button onClick={handleSave} className="px-8 py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow-lg flex items-center">
                    <Save className="w-5 h-5 mr-2" /> 儲存報價單
                </button>
            </div>

            {/* 5. Preview Section (Moved to Bottom) */}
            <div className="mt-8 border-t-4 border-gray-800 pt-8">
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FileText className="w-6 h-6 mr-2" /> 報價單即時預覽 (Live Preview)
                    </h2>
                    <button onClick={handlePrint} className="bg-gray-800 text-white px-6 py-2 rounded shadow hover:bg-gray-700 flex items-center gap-2 font-bold">
                        <Download className="w-4 h-4" /> 下載/列印 PDF
                    </button>
                </div>
                
                {/* Reused Preview Component */}
                <QuotePreview 
                    clientInfo={clientInfo}
                    items={calculatedItems}
                    totalAmount={totalAmount}
                    dateStr={new Date().toLocaleDateString('zh-TW')}
                    idStr="PREVIEW"
                />
            </div>
        </div>
    );
};

// --- CalendarView Component ---
const CalendarView = ({ quotes }) => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);
    const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
    const [filterRegion, setFilterRegion] = useState('all'); // 'all', 'North', 'Central', 'South'

    const activeQuotes = quotes.filter(q => q.status !== 'draft');

    // Helper: Filter events by Region
    const getFilteredEvents = (events) => {
        if (filterRegion === 'all') return events;
        return events.filter(q => {
            const region = q.items[0]?.outingRegion || q.items[0]?.regionType || 'North'; // Fallback
            return region === filterRegion;
        });
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const nextPeriod = () => {
        if (viewMode === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        if (viewMode === 'week') {
            const d = new Date(currentDate);
            d.setDate(d.getDate() + 7);
            setCurrentDate(d);
        }
        if (viewMode === 'day') {
            const d = new Date(currentDate);
            d.setDate(d.getDate() + 1);
            setCurrentDate(d);
        }
    };

    const prevPeriod = () => {
        if (viewMode === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        if (viewMode === 'week') {
            const d = new Date(currentDate);
            d.setDate(d.getDate() - 7);
            setCurrentDate(d);
        }
        if (viewMode === 'day') {
            const d = new Date(currentDate);
            d.setDate(d.getDate() - 1);
            setCurrentDate(d);
        }
    };

    const handleDayClick = (day) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setCurrentDate(newDate);
        setViewMode('day');
    };

    const getEventsForDay = (date) => {
        const events = activeQuotes.filter(q => {
            if(!q.items || q.items.length === 0) return false;
            return q.items.some(item => {
                if(!item.eventDate) return false;
                const d = new Date(item.eventDate);
                return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
            });
        });
        return getFilteredEvents(events);
    };

    const regionColors = {
        'North': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
        'Central': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
        'South': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
    };

    // Render Logic
    const renderHeader = () => (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
             <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-bold flex items-center">
                     <Calendar className="mr-2"/>
                     {viewMode === 'month' && `${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`}
                     {viewMode === 'week' && `週視圖 (${currentDate.toLocaleDateString()})`}
                     {viewMode === 'day' && `${currentDate.toLocaleDateString()} (${['日','一','二','三','四','五','六'][currentDate.getDay()]})`}
                 </h2>
                 <div className="flex bg-gray-100 rounded-lg p-1">
                     <button onClick={() => setViewMode('month')} className={`px-3 py-1 text-sm rounded ${viewMode === 'month' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-600'}`}>月</button>
                     <button onClick={() => setViewMode('week')} className={`px-3 py-1 text-sm rounded ${viewMode === 'week' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-600'}`}>週</button>
                     <button onClick={() => setViewMode('day')} className={`px-3 py-1 text-sm rounded ${viewMode === 'day' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-600'}`}>日</button>
                 </div>
             </div>
             
             <div className="flex items-center gap-4 w-full md:w-auto">
                 {/* Region Filter */}
                 <div className="flex bg-gray-100 rounded-lg p-1 overflow-x-auto">
                     <button onClick={() => setFilterRegion('all')} className={`px-3 py-1 text-sm whitespace-nowrap rounded ${filterRegion === 'all' ? 'bg-gray-800 text-white shadow' : 'text-gray-600'}`}>全部</button>
                     <button onClick={() => setFilterRegion('North')} className={`px-3 py-1 text-sm whitespace-nowrap rounded ${filterRegion === 'North' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'}`}>北部</button>
                     <button onClick={() => setFilterRegion('Central')} className={`px-3 py-1 text-sm whitespace-nowrap rounded ${filterRegion === 'Central' ? 'bg-yellow-600 text-white shadow' : 'text-gray-600'}`}>中部</button>
                     <button onClick={() => setFilterRegion('South')} className={`px-3 py-1 text-sm whitespace-nowrap rounded ${filterRegion === 'South' ? 'bg-green-600 text-white shadow' : 'text-gray-600'}`}>南部</button>
                 </div>

                 <div className="flex gap-2">
                     <button onClick={prevPeriod} className="p-2 hover:bg-gray-100 rounded border"><ChevronLeft/></button>
                     <button onClick={nextPeriod} className="p-2 hover:bg-gray-100 rounded border"><ChevronRight/></button>
                 </div>
             </div>
        </div>
    );

    const renderMonthView = () => {
        const days = Array.from({ length: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }, (_, i) => i + 1);
        const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
        return (
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
                 {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                     <div key={d} className="bg-gray-50 p-2 text-center font-bold text-gray-500">{d}</div>
                 ))}
                 {blanks.map(b => <div key={`blank-${b}`} className="bg-white min-h-[100px]"/>)}
                 {days.map(day => {
                     const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                     const events = getEventsForDay(date);
                     return (
                         <div key={day} onClick={() => handleDayClick(day)} className="bg-white min-h-[100px] p-2 border hover:bg-blue-50 transition relative cursor-pointer group">
                             <span className="text-sm text-gray-400 font-semibold absolute top-1 right-2 group-hover:text-blue-600">{day}</span>
                             <div className="mt-4 space-y-1">
                                 {events.map(q => {
                                     const region = q.items[0]?.outingRegion || 'North';
                                     return (
                                         <div key={q.id} className={`text-xs p-1 rounded border truncate ${regionColors[region]}`} title={`${q.clientInfo.companyName}`}>
                                             {q.items[0]?.eventTime?.slice(0,5)} {q.clientInfo.companyName}
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
        // Find start of week (Sunday)
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
                            <div>{['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}</div>
                            <div className="text-2xl">{date.getDate()}</div>
                        </div>
                        <div className="flex-1 p-2 space-y-2 overflow-auto">
                            {getEventsForDay(date).map(q => {
                                const region = q.items[0]?.outingRegion || 'North';
                                return (
                                    <div key={q.id} className={`text-xs p-2 rounded border shadow-sm ${regionColors[region]}`}>
                                        <div className="font-bold">{q.items[0]?.eventTime?.slice(0,5)}</div>
                                        <div>{q.clientInfo.companyName}</div>
                                        <div className="text-[10px] mt-1 opacity-75">{q.items[0]?.courseName}</div>
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
        const events = getEventsForDay(currentDate).sort((a,b) => (a.items[0]?.eventTime || '').localeCompare(b.items[0]?.eventTime || ''));
        return (
            <div className="border rounded-lg bg-white min-h-[500px] p-6">
                <h3 className="text-xl font-bold mb-6 border-b pb-4">行程列表</h3>
                {events.length === 0 ? (
                    <div className="text-gray-400 text-center py-10">本日無行程</div>
                ) : (
                    <div className="space-y-4">
                        {events.map(q => {
                            const region = q.items[0]?.outingRegion || 'North';
                            return (
                                <div key={q.id} className={`flex items-start p-4 rounded-lg border-l-4 shadow-sm bg-white ${region.includes('North') ? 'border-l-blue-500' : region.includes('Central') ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
                                    <div className="mr-6 text-center min-w-[80px]">
                                        <div className="text-xl font-bold text-gray-800">{q.items[0]?.eventTime}</div>
                                        <div className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${regionColors[region]}`}>
                                            {region === 'North' ? '北部' : region === 'Central' ? '中部' : '南部'}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">{q.clientInfo.companyName}</h4>
                                        <div className="text-gray-600 mt-1 flex items-center">
                                            <FileText className="w-4 h-4 mr-1"/> {q.items[0]?.courseName} ({q.items[0]?.peopleCount}人)
                                        </div>
                                        <div className="text-gray-500 mt-1 text-sm flex items-center">
                                            <MapPin className="w-4 h-4 mr-1"/> {q.items[0]?.city} {q.items[0]?.address}
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500">聯絡人: {q.clientInfo.contactPerson} ({q.clientInfo.phone})</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
             {renderHeader()}
             {viewMode === 'month' && renderMonthView()}
             {viewMode === 'week' && renderWeekView()}
             {viewMode === 'day' && renderDayView()}
             
             <div className="mt-4 flex gap-4 text-xs text-gray-500 justify-end">
                 <span className="flex items-center"><div className="w-3 h-3 bg-blue-100 border border-blue-200 mr-1"></div> 北部行程</span>
                 <span className="flex items-center"><div className="w-3 h-3 bg-yellow-100 border border-yellow-200 mr-1"></div> 中部行程</span>
                 <span className="flex items-center"><div className="w-3 h-3 bg-green-100 border border-green-200 mr-1"></div> 南部行程</span>
             </div>
        </div>
    );
};

// --- Main App Component ---

const App = () => {
  const [activeTab, setActiveTab] = useState('list'); 
  const [quotes, setQuotes] = useState([]);
  const [editingQuote, setEditingQuote] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState(null);
  const [selectedQuoteForPreview, setSelectedQuoteForPreview] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('hbh_quotes');
    if (saved) {
        setQuotes(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hbh_quotes', JSON.stringify(quotes));
  }, [quotes]);

  const handleCreateNew = () => {
    setEditingQuote(null);
    setActiveTab('create');
  };

  const handleEdit = (quote) => {
    setEditingQuote(quote);
    setActiveTab('create');
  };

  const handleSaveQuote = (quoteData) => {
      if (editingQuote) {
          setQuotes(quotes.map(q => q.id === editingQuote.id ? { ...quoteData, id: q.id } : q));
      } else {
          setQuotes([...quotes, { 
              ...quoteData, 
              id: Date.now().toString(), 
              createdAt: new Date().toISOString(), 
              status: quoteData.status || 'draft' 
          }]);
      }
      setActiveTab('list');
  };

  const handleDelete = (id) => {
      if (confirm("確定要刪除此報價單嗎？")) {
          setQuotes(quotes.filter(q => q.id !== id));
      }
  };

  const handleOpenPayment = (quote) => {
      setSelectedQuoteForPayment(quote);
      setShowPaymentModal(true);
  };

  const handleOpenPreview = (quote) => {
      setSelectedQuoteForPreview(quote);
      setShowPreviewModal(true);
  }

  const handleUpdatePayment = (id, updates) => {
      setQuotes(quotes.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const handleStatusChange = (id, newStatus) => {
      setQuotes(quotes.map(q => q.id === id ? { ...q, status: newStatus } : q));
  }

  const exportCSV = () => {
      const headers = ["ID", "狀態", "客戶名稱", "聯絡人", "電話", "總金額", "建立日期"];
      const rows = quotes.map(q => [
          q.id, q.status, q.clientInfo.companyName, q.clientInfo.contactPerson, q.clientInfo.phone, q.totalAmount, formatDate(q.createdAt)
      ]);
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
          + [headers, ...rows].map(e => e.join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "quotes_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
  };

  const exportJSON = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quotes));
      const link = document.createElement('a');
      link.setAttribute("href", dataStr);
      link.setAttribute("download", "quotes_backup_" + new Date().toISOString().slice(0,10) + ".json");
      document.body.appendChild(link);
      link.click();
      link.remove();
  };

  const importJSON = (event) => {
      const fileObj = event.target.files[0];
      if (!fileObj) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const json = JSON.parse(e.target.result);
              if (Array.isArray(json)) {
                  setQuotes(json);
                  alert("資料還原成功！已載入 " + json.length + " 筆報價單。");
              } else {
                  alert("檔案格式錯誤：請確認上傳的是正確的備份檔 (JSON)");
              }
          } catch (error) {
              alert("無法讀取檔案：" + error);
          }
      };
      reader.readAsText(fileObj);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
        {/* TOP HEADER NAVIGATION */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <div className="bg-slate-800 text-white p-2 rounded mr-2">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-xl text-gray-800 tracking-wide">下班隨手作報價管理系統</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <button 
                            onClick={() => setActiveTab('create')} 
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            報價計算
                        </button>
                        <button 
                            onClick={() => setActiveTab('list')} 
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            追蹤清單
                        </button>
                        <button 
                            onClick={() => setActiveTab('calendar')} 
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            行事曆
                        </button>
                        <button 
                            onClick={() => setActiveTab('stats')} 
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'stats' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            業績統計
                        </button>
                    </div>
                    {/* Mobile Menu Button (Simplified) */}
                    <div className="flex items-center md:hidden">
                        <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </header>

      <main className="flex-1 overflow-auto bg-gray-50 print:bg-white print:p-0 print:overflow-visible">
            {activeTab === 'list' && (
                <div className="print:hidden p-4 md:p-8">
                <ListView 
                    quotes={quotes} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                    onPayment={handleOpenPayment} 
                    onPreview={handleOpenPreview}
                    onStatusChange={handleStatusChange}
                    onExport={exportCSV}
                    onExportBackup={exportJSON}
                    onImportBackup={importJSON}
                    onCreate={handleCreateNew}
                />
                </div>
            )}
            {activeTab === 'create' && (
                <QuoteCreator 
                    initialData={editingQuote} 
                    onSave={handleSaveQuote} 
                    onCancel={() => setActiveTab('list')} 
                />
            )}
            {activeTab === 'calendar' && (
                <div className="print:hidden p-4 md:p-8">
                <CalendarView quotes={quotes} />
                </div>
            )}
            {activeTab === 'stats' && (
                <div className="print:hidden p-4 md:p-8">
                <StatsView quotes={quotes} />
                </div>
            )}
      </main>

      {showPaymentModal && selectedQuoteForPayment && (
          <PaymentModal 
              quote={selectedQuoteForPayment} 
              onClose={() => setShowPaymentModal(false)}
              onSave={handleUpdatePayment}
          />
      )}
      
      {showPreviewModal && selectedQuoteForPreview && (
          <QuotePreview 
            clientInfo={selectedQuoteForPreview.clientInfo}
            items={selectedQuoteForPreview.items} // Pass full items to calculate on the fly correctly in preview
            totalAmount={selectedQuoteForPreview.totalAmount}
            dateStr={formatDate(selectedQuoteForPreview.createdAt)}
            idStr={selectedQuoteForPreview.id}
          />
      )}
    </div>
  );
};

export default App;