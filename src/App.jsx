import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Calendar, FileText, Check, DollarSign, Printer, Search, Folder, ChevronDown, ChevronRight, ChevronLeft, Save, Trash2, X, Edit, AlertCircle, Eye, EyeOff, Download, MapPin, Clock, Filter, Menu, ArrowDown, BarChart3, TrendingUp, PieChart, Upload, FileJson, UploadCloud, Loader2, Cloud } from 'lucide-react';

// === FIREBASE IMPORTS ===
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";

// === FIREBASE CONFIGURATION ===
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// --- STYLES ---
const INPUT_CLASS = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white";
const LABEL_CLASS = "block text-sm font-bold text-gray-700 mb-1";
const SECTION_CLASS = "bg-white p-6 rounded-lg shadow-sm border border-gray-200";

// --- DATA MODELS ---
const COURSE_DATA = {
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

const getAvailableCities = (region) => {
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

// --- BUSINESS LOGIC ---
const calculateItem = (item) => {
    const {
        price, peopleCount, locationMode,
        outingRegion, city, area,
        hasInvoice, customDiscount, extraFee
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

    if (locationMode === 'outing') {
        if (outingRegion === 'North') {
            const isRemote = ['桃園市', '新竹縣市', '苗栗縣', '宜蘭縣'].includes(city) || city.includes('(北部出發)');
            if (isRemote) {
                if (count < 25) error = `北部遠程外派(${city.replace(/\(.*?\)/, '')})最低出課人數為 25 人`;
                else if (count >= 35) { discountRate = 0.9; isDiscountApplied = true; }
            } else {
                if (count >= 20) { discountRate = 0.9; isDiscountApplied = true; }
                if (['台北市', '新北市'].includes(city)) {
                    if (count >= 10 && count <= 14) teacherFee = 2000;
                }
            }
        } else if (outingRegion === 'Central') {
            if (city === '台中市') {
                if (count < 10) error = "中部市區外派最低出課人數為 10 人";
                else if (count >= 15) { discountRate = 0.9; isDiscountApplied = true; }
            } else {
                if (count < 15) error = "中部其他地區外派最低出課人數為 15 人";
                else if (count >= 20) { discountRate = 0.9; isDiscountApplied = true; }
            }
        } else if (outingRegion === 'South') {
            if (city === '高雄市') {
                if (count < 10) error = "南部市區外派最低出課人數為 10 人";
                else if (count >= 15) { discountRate = 0.9; isDiscountApplied = true; }
            } else {
                if (count < 15) error = "南部其他地區外派最低出課人數為 15 人";
                else if (count >= 20) { discountRate = 0.9; isDiscountApplied = true; }
            }
        }
    } else { // store mode
        if (item.regionType === 'North') {
            if (count >= 20) { discountRate = 0.9; isDiscountApplied = true; }
        } else if (item.regionType === 'Central') {
            if (count < 10) error = "中部店內包班最低人數 10 人";
            else if (count >= 15) { discountRate = 0.9; isDiscountApplied = true; }
        } else if (item.regionType === 'South') {
            if (count < 6) error = "南部店內包班最低人數 6 人";
            else if (count >= 15) { discountRate = 0.9; isDiscountApplied = true; }
        }
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
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('zh-TW');
}

// --- UI COMPONENTS ---

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

const QuotePreview = ({ clientInfo, items, totalAmount, dateStr, idStr }) => {
    return (
        <div id="printable-area" className="bg-white w-full min-h-[600px] shadow-lg p-8 text-sm scale-100 origin-top mx-auto max-w-[210mm] print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0 print:text-black">
            <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">下班隨手作活動報價單</h1>
                </div>
                <div className="text-right text-gray-600">
                    <p>報價日期: {dateStr}</p>
                    <p className="font-bold mt-1">有效期限：3天</p>
                </div>
            </div>
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
                                        車馬費 ({item.city.replace(/\(.*?\)/, '')}{item.area})
                                    </td>
                                    <td className="p-2 text-right font-bold">${item.calc.transportFee.toLocaleString()}</td>
                                </tr>
                            )}
                            {(item.calc.teacherFee > 0) && (
                                <tr className="bg-green-50 text-xs text-green-900 print:bg-transparent print:text-black">
                                    <td colSpan="3" className="p-2 pl-4 text-right">師資費</td>
                                    <td className="p-2 text-right font-bold">${item.calc.teacherFee.toLocaleString()}</td>
                                </tr>
                            )}
                            {(item.extraFee > 0) && (
                                <tr className="bg-green-50 text-xs text-green-900 print:bg-transparent print:text-black">
                                    <td colSpan="3" className="p-2 pl-4 text-right">
                                        額外加價 {item.extraFeeDesc ? `(${item.extraFeeDesc})` : ''}
                                    </td>
                                    <td className="p-2 text-right font-bold">${parseInt(item.extraFee).toLocaleString()}</td>
                                </tr>
                            )}
                            {(item.hasInvoice) && (
                                <tr className="bg-green-50 text-xs text-green-900 print:bg-transparent print:text-black">
                                    <td colSpan="3" className="p-2 pl-4 text-right">營業稅 (5%)</td>
                                    <td className="p-2 text-right font-bold">${item.calc.tax.toLocaleString()}</td>
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
            <div className="flex justify-end mt-8">
                <div className="w-1/2 bg-gray-50 p-4 rounded border border-gray-200 print:w-2/3 print:bg-white print:border-gray-800">
                    <div className="flex justify-between items-center text-2xl font-bold text-blue-900 print:text-black">
                        <span>總金額</span>
                        <span>${totalAmount.toLocaleString()}</span>
                    </div>
                    <p className="text-right text-xs text-gray-500 mt-2">含稅及所有費用</p>
                </div>
            </div>
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

const PreviewModal = ({ quote, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-[900px] p-6 overflow-auto max-h-[95vh] printable-area">
                <div className="flex justify-between items-center mb-6 border-b pb-4 print:hidden">
                    <h2 className="text-xl font-bold text-gray-800">報價單預覽 ({quote.clientInfo.companyName})</h2>
                    <div className='flex gap-2'>
                        <button onClick={handlePrint} className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700 flex items-center gap-2 font-bold text-sm">
                            <Download className="w-4 h-4" /> 列印/下載
                        </button>
                        <button onClick={onClose} className='p-2'><X className="w-6 h-6 text-gray-500" /></button>
                    </div>
                </div>
                <div id="modal-preview-area" className='transform scale-[0.8] origin-top mx-auto min-h-[700px] w-[125%] print:scale-100 print:w-full print:min-h-0 print:max-w-none print:mx-0 print:p-0'>
                    <QuotePreview
                        clientInfo={quote.clientInfo}
                        items={quote.items}
                        totalAmount={quote.totalAmount}
                        dateStr={formatDate(quote.createdAt)}
                        idStr={quote.id.slice(-4)}
                    />
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
            setDetails({
                depositAmount: parseInt(quote.paymentDetails.depositAmount) || 0,
                depositNote: quote.paymentDetails.depositNote || '',
                additionalPayment: parseInt(quote.paymentDetails.additionalPayment) || 0,
                additionalPaymentNote: quote.paymentDetails.additionalPaymentNote || '',
                finalPayment: parseInt(quote.paymentDetails.finalPayment) || 0,
                finalPaymentNote: quote.paymentDetails.finalPaymentNote || ''
            });
        }
    }, [quote]);

    const actualTotal = (quote.totalAmount || 0) + parseInt(details.additionalPayment || 0);
    const paidTotal = parseInt(details.depositAmount || 0) + parseInt(details.finalPayment || 0);
    const remaining = actualTotal - paidTotal;

    const handleSave = () => {
        let newStatus = quote.status;
        let closedAt = quote.closedAt || null;

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
                        <h4 className="font-bold mb-3 flex items-center"><Plus className="w-4 h-4 mr-2"/> 2. 追加款項 (Additional)</h4>
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

const StatsView = ({ quotes }) => {
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

    const stats = useMemo(() => {
        const result = {
            totalRevenue: 0,
            totalOrders: 0,
            regions: {
                'North': { name: '北部', revenue: 0, count: 0, color: 'bg-blue-500' },
                'Central': { name: '中部', revenue: 0, count: 0, color: 'bg-yellow-500' },
                'South': { name: '南部', revenue: 0, count: 0, color: 'bg-green-500' }
            },
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
                let regionKey = 'North';
                if (q.items && q.items.length > 0) {
                    const firstItem = q.items[0];
                    const r = firstItem.locationMode === 'outing' ? (firstItem.outingRegion || 'North') : (firstItem.regionType || 'North');
                    if (r && result.regions[r]) {
                        regionKey = r;
                    }
                }

                const amount = q.totalAmount || 0;
                result.totalRevenue += amount;
                result.totalOrders += 1;
                result.regions[regionKey].revenue += amount;
                result.regions[regionKey].count += 1;

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

const CalendarView = ({ quotes }) => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);
    const [viewMode, setViewMode] = useState('month');
    const [filterRegion, setFilterRegion] = useState('all');

    const activeQuotes = quotes.filter(q => q.status !== 'draft');

    const getFilteredEvents = (events) => {
        if (filterRegion === 'all') return events;
        return events.filter(q => {
            if(!q.items || q.items.length === 0) return false;
            const region = q.items[0]?.locationMode === 'outing' ? (q.items[0]?.outingRegion || 'North') : (q.items[0]?.regionType || 'North');
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
                    const isToday = date.toDateString() === today.toDateString();
                    return (
                        <div key={day} onClick={() => handleDayClick(day)} className={`bg-white min-h-[100px] p-2 border hover:bg-blue-50 transition relative cursor-pointer group ${isToday ? 'ring-2 ring-red-500' : ''}`}>
                            <span className={`text-sm text-gray-400 font-semibold absolute top-1 right-2 group-hover:text-blue-600 ${isToday ? 'text-red-600' : ''}`}>{day}</span>
                            <div className="mt-4 space-y-1">
                                {events.map(q => {
                                    const region = q.items[0]?.locationMode === 'outing' ? (q.items[0]?.outingRegion || 'North') : (q.items[0]?.regionType || 'North');
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
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return d;
        });

        return (
            <div className="grid grid-cols-7 gap-px bg-gray-200 border h-[600px]">
                {weekDays.map((date, i) => {
                    const isToday = date.toDateString() === today.toDateString();
                    return (
                        <div key={i} className={`bg-white flex flex-col h-full ${isToday ? 'ring-2 ring-red-500' : ''}`}>
                            <div className="p-2 border-b bg-gray-50 text-center font-bold">
                                <div>{['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}</div>
                                <div className={`text-2xl ${isToday ? 'text-red-600' : ''}`}>{date.getDate()}</div>
                            </div>
                            <div className="flex-1 p-2 space-y-2 overflow-auto">
                                {getEventsForDay(date).map(q => {
                                    const region = q.items[0]?.locationMode === 'outing' ? (q.items[0]?.outingRegion || 'North') : (q.items[0]?.regionType || 'North');
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
                    );
                })}
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
                            const region = q.items[0]?.locationMode === 'outing' ? (q.items[0]?.outingRegion || 'North') : (q.items[0]?.regionType || 'North');
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

const ListView = ({ quotes, onEdit, onDelete, onPayment, onPreview, onStatusChange, onExport, onCreate }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">報價單管理 ({quotes.length} 筆資料)</h2>
                <div className="flex gap-2 flex-wrap">
                      <button onClick={onExport} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-50 flex items-center shadow-sm font-medium text-sm">
                        <FileText className="w-4 h-4 mr-2"/> 匯出報表 (CSV)
                      </button>
                      <button onClick={onCreate} className="md:hidden px-4 py-2 bg-teal-600 text-white rounded font-medium shadow-sm">新增</button>
                </div>
            </div>
            
            <div className={SECTION_CLASS + " mb-6 flex flex-col md:flex-row gap-4 items-center"}>
                 <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5"/>
                    <input type="text" placeholder="搜尋客戶名稱、電話..." className={INPUT_CLASS + " pl-10"} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                 </div>
                 <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm text-gray-500 whitespace-nowrap min-w-[3rem]">月份:</span>
                    <select className={INPUT_CLASS + " md:w-40"} value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
                         <option value="">全部月份</option>
                         {Object.keys(groupedQuotes).sort().reverse().map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                 </div>
                 <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm text-gray-500 whitespace-nowrap min-w-[3rem]">狀態:</span>
                    <select className={INPUT_CLASS + " md:w-40"} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                         <option value="all">全部狀態</option>
                         <option value="draft">草稿</option>
                         <option value="pending">報價中</option>
                         <option value="confirmed">已回簽 (未付訂)</option>
                         <option value="paid">已付訂 (未結清)</option>
                         <option value="closed">已結案</option>
                    </select>
                 </div>
            </div>
            <div className="space-y-6">
                 {filteredMonths.map(month => {
                    const monthQuotes = groupedQuotes[month].filter(q => {
                        const searchLower = searchTerm.toLowerCase();
                        const matchesSearch = q.clientInfo.companyName.toLowerCase().includes(searchLower) || q.clientInfo.phone.includes(searchLower);
                        const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
                        return matchesSearch && matchesStatus;
                    });
                    if (monthQuotes.length === 0) return null;
                    return (
                        <div key={month} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                             <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center font-semibold text-gray-700">
                                <Folder className="w-5 h-5 mr-2 text-yellow-500" /> {month} ({monthQuotes.length})
                             </div>
                             <div className="divide-y divide-gray-100">
                                {monthQuotes.map(quote => (
                                    <div key={quote.id} className="p-4 hover:bg-blue-50 transition flex flex-col md:flex-row justify-between items-center gap-4">
                                         <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                 <StatusSelector status={quote.status} onChange={(val) => onStatusChange(quote.id, val)} />
                                                 <span className="font-bold text-lg text-gray-900 truncate">{quote.clientInfo.companyName}</span>
                                                 <span className="text-xs text-gray-400 font-mono">#{quote.id.slice(-4)}</span>
                                              </div>
                                              <div className="text-sm text-gray-600 truncate">
                                                 <span className="mr-3">聯絡人: {quote.clientInfo.contactPerson}</span>
                                                 <span>課程: {quote.items[0]?.courseName} {quote.items.length > 1 ? `(+${quote.items.length - 1})` : ''}</span>
                                              </div>
                                         </div>
                                         <div className="flex flex-col items-end gap-2 min-w-[150px]">
                                              <div className="text-xl font-bold text-blue-600">${quote.totalAmount?.toLocaleString()}</div>
                                              <div className="flex gap-2">
                                                 <button onClick={() => onPreview(quote)} className="p-2 text-blue-600 hover:bg-blue-100 rounded tooltip transition-colors"><Eye className="w-5 h-5"/></button>
                                                 {['confirmed', 'paid', 'closed'].includes(quote.status) && (
                                                     <button onClick={() => onPayment(quote)} className="p-2 text-orange-600 hover:bg-orange-100 rounded tooltip transition-colors"><DollarSign className="w-5 h-5"/></button>
                                                 )}
                                                 <button onClick={() => onEdit(quote)} className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"><Edit className="w-5 h-5"/></button>
                                                 <button onClick={() => onDelete(quote.id)} className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"><Trash2 className="w-5 h-5"/></button>
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

// === 重構後的 QuoteCreator ===
const QuoteCreator = ({ initialData, onSave, onCancel }) => {
    // 基本資訊
    const [clientInfo, setClientInfo] = useState(initialData?.clientInfo || {
        companyName: '', taxId: '', contactPerson: '', phone: '', email: '', address: ''
    });
    const [status, setStatus] = useState(initialData?.status || 'draft');
    const [dueDate, setDueDate] = useState(initialData?.paymentDueDate || '');
    const [adminNotes, setAdminNotes] = useState(initialData?.adminNotes || '');

    // 已加入的課程列表 (Fixed Items)
    const [addedItems, setAddedItems] = useState(initialData?.items || []);

    // 正在編輯的課程 (Pending Item Form State)
    const defaultPendingItem = {
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
        customDiscount: 0,
        customDiscountDesc: '',
        extraFee: 0,
        extraFeeDesc: '',
        address: '',
        itemNote: ''
    };
    const [pendingItem, setPendingItem] = useState(defaultPendingItem);

    // 計算 "已加入" 的項目總額
    const totalAmount = useMemo(() => {
        return addedItems.reduce((sum, item) => sum + (item.calc.finalTotal || 0), 0);
    }, [addedItems]);

    // 更新 Pending Item 的欄位
    const updatePendingItem = (field, value) => {
        const newItem = { ...pendingItem, [field]: value };
        
        if (field === 'courseName') {
            const series = COURSE_DATA[newItem.courseSeries];
            const course = series.find(c => c.name === value);
            if (course) newItem.price = course.price;
        }
        if (field === 'courseSeries') {
            const series = COURSE_DATA[value];
            if(series && series.length > 0) {
                newItem.courseName = series[0].name;
                newItem.price = series[0].price;
            }
        }
        if (field === 'outingRegion') {
            const available = getAvailableCities(value);
            newItem.city = available[0] || '';
            newItem.area = '';
        }
        if (field === 'city') {
            newItem.area = '';
        }
        setPendingItem(newItem);
    };

    // 執行加入動作
    const handleAddItem = () => {
        // 先計算
        const calculated = calculateItem(pendingItem);
        if (calculated.error) {
            alert(`無法加入：${calculated.error}`);
            return;
        }
        // 加入列表
        setAddedItems([...addedItems, { ...pendingItem, id: Date.now(), calc: calculated }]);
        // 重置表單 (保留部分設定如日期地點可能比較方便，這裡選擇重置回預設但保留部分邏輯)
        setPendingItem({ ...defaultPendingItem, id: Date.now() + 1 });
    };

    const removeAddedItem = (index) => {
        const newItems = [...addedItems];
        newItems.splice(index, 1);
        setAddedItems(newItems);
    };

    const handleSave = () => {
        if (addedItems.length === 0) {
            alert("請至少加入一項課程");
            return;
        }
        onSave({
            clientInfo,
            items: addedItems,
            totalAmount,
            status,
            paymentDueDate: dueDate,
            adminNotes
        });
    };

    // 即時計算 Pending Item 的費用預覽 (僅供顯示)
    const pendingCalc = calculateItem(pendingItem);

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto p-4 md:p-8 relative print:block print:w-full print:h-auto">
            {/* 客戶資料區塊 */}
            <div className="print:hidden">
                <section className={SECTION_CLASS}>
                    <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-700 flex items-center">
                        <div className="w-1 h-6 bg-slate-800 mr-2 rounded"></div>
                        客戶基本資料
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={LABEL_CLASS}>公司/客戶名稱</label><input className={INPUT_CLASS} value={clientInfo.companyName} onChange={e => setClientInfo({...clientInfo, companyName: e.target.value})} /></div>
                        <div><label className={LABEL_CLASS}>統一編號</label><input className={INPUT_CLASS} value={clientInfo.taxId} onChange={e => setClientInfo({...clientInfo, taxId: e.target.value})} /></div>
                        <div><label className={LABEL_CLASS}>聯絡人</label><input className={INPUT_CLASS} value={clientInfo.contactPerson} onChange={e => setClientInfo({...clientInfo, contactPerson: e.target.value})} /></div>
                        <div><label className={LABEL_CLASS}>電話</label><input className={INPUT_CLASS} value={clientInfo.phone} onChange={e => setClientInfo({...clientInfo, phone: e.target.value})} /></div>
                        <div className="md:col-span-2"><label className={LABEL_CLASS}>電子信箱</label><input className={INPUT_CLASS} value={clientInfo.email} onChange={e => setClientInfo({...clientInfo, email: e.target.value})} /></div>
                    </div>
                </section>
            </div>

            {/* 新增課程表單區塊 (Pending Item) */}
            <div className="print:hidden">
                <section className={`${SECTION_CLASS} border-blue-300 border-2`}>
                    <h3 className="text-lg font-bold mb-4 border-b pb-2 text-blue-800 flex items-center">
                        <Plus className="w-5 h-5 mr-2" /> 新增課程項目
                    </h3>
                    
                    {/* 課程選擇 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className={LABEL_CLASS}>課程系列</label>
                            <select className={INPUT_CLASS} value={pendingItem.courseSeries} onChange={e => updatePendingItem('courseSeries', e.target.value)}>
                                {Object.keys(COURSE_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className={LABEL_CLASS}>課程名稱 (單價: ${pendingItem.price})</label>
                            <select className={INPUT_CLASS} value={pendingItem.courseName} onChange={e => updatePendingItem('courseName', e.target.value)}>
                                {COURSE_DATA[pendingItem.courseSeries]?.map(c => <option key={c.name} value={c.name}>{c.name} (${c.price})</option>)}
                            </select>
                        </div>
                    </div>

                    {/* 人數時間 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div><label className={LABEL_CLASS}>人數</label><input type="number" className={INPUT_CLASS} value={pendingItem.peopleCount} onChange={e => updatePendingItem('peopleCount', e.target.value)} /></div>
                        <div><label className={LABEL_CLASS}>日期</label><input type="date" className={INPUT_CLASS} value={pendingItem.eventDate} onChange={e => updatePendingItem('eventDate', e.target.value)} /></div>
                        <div><label className={LABEL_CLASS}>時間</label><input type="time" className={INPUT_CLASS} value={pendingItem.eventTime} onChange={e => updatePendingItem('eventTime', e.target.value)} /></div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center cursor-pointer select-none"><input type="checkbox" className="mr-2 w-4 h-4" checked={pendingItem.hasInvoice} onChange={e => updatePendingItem('hasInvoice', e.target.checked)} /> 開立發票(5%)</label>
                        </div>
                    </div>

                    {/* 地點模式 */}
                    <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4">
                        <div className="flex gap-6 mb-4">
                            <label className="flex items-center cursor-pointer font-bold"><input type="radio" className="mr-2" checked={pendingItem.locationMode === 'outing'} onChange={() => updatePendingItem('locationMode', 'outing')} /> 外派教學</label>
                            <label className="flex items-center cursor-pointer font-bold"><input type="radio" className="mr-2" checked={pendingItem.locationMode === 'store'} onChange={() => { updatePendingItem('locationMode', 'store'); updatePendingItem('city', ''); updatePendingItem('area', '');}} /> 店內包班</label>
                        </div>
                        {pendingItem.locationMode === 'outing' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={LABEL_CLASS}>區域</label>
                                    <select className={INPUT_CLASS} value={pendingItem.outingRegion} onChange={e => updatePendingItem('outingRegion', e.target.value)}>
                                        <option value="North">北部出課</option><option value="Central">中部老師</option><option value="South">南部老師</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={LABEL_CLASS}>縣市</label>
                                    <select className={INPUT_CLASS} value={pendingItem.city} onChange={e => updatePendingItem('city', e.target.value)}>
                                        {getAvailableCities(pendingItem.outingRegion).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                {TRANSPORT_FEES[pendingItem.city]?.zones && (
                                    <div>
                                        <label className={LABEL_CLASS}>行政區 ({pendingCalc.transportFee > 0 ? `+$${pendingCalc.transportFee}` : ''})</label>
                                        <select className={INPUT_CLASS} value={pendingItem.area} onChange={e => updatePendingItem('area', e.target.value)}>
                                            <option value="">選擇...</option>
                                            {Object.entries(TRANSPORT_FEES[pendingItem.city].zones).map(([zone, fee]) => <option key={zone} value={zone}>{zone} (+${fee})</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="md:col-span-3"><label className={LABEL_CLASS}>詳細地址</label><input className={INPUT_CLASS} value={pendingItem.address} onChange={e => updatePendingItem('address', e.target.value)} /></div>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <div><label className={LABEL_CLASS}>店內區域</label><select className={INPUT_CLASS} value={pendingItem.regionType} onChange={e => updatePendingItem('regionType', e.target.value)}><option value="North">北部店內</option><option value="Central">中部店內</option><option value="South">南部店內</option></select></div>
                            </div>
                        )}
                    </div>

                    {/* 加減價 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         <div className="bg-red-50 p-2 rounded"><label className={LABEL_CLASS}>折扣</label><input type="number" className={INPUT_CLASS} value={pendingItem.customDiscount} onChange={e => updatePendingItem('customDiscount', e.target.value)} placeholder="金額" /></div>
                         <div className="bg-blue-50 p-2 rounded"><label className={LABEL_CLASS}>加價</label><input type="number" className={INPUT_CLASS} value={pendingItem.extraFee} onChange={e => updatePendingItem('extraFee', e.target.value)} placeholder="金額" /></div>
                    </div>
                    
                    {/* 備註欄位 */}
                    <div className="mb-4">
                        <label className={LABEL_CLASS}>該堂課備註說明 (選填)</label>
                        <input type="text" className={INPUT_CLASS} placeholder="例如: 需提前半小時進場、特殊需求..." value={pendingItem.itemNote} onChange={e => updatePendingItem('itemNote', e.target.value)} />
                    </div>

                    {/* 預覽錯誤或金額 */}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <div className="text-gray-600 font-medium">
                            {pendingCalc.error ? (
                                <span className="text-red-600 flex items-center"><AlertCircle className="w-5 h-5 mr-2"/> {pendingCalc.error}</span>
                            ) : (
                                <span>預估單項金額: <span className="text-xl font-bold text-blue-600">${pendingCalc.finalTotal.toLocaleString()}</span></span>
                            )}
                        </div>
                        <button 
                            onClick={handleAddItem}
                            disabled={!!pendingCalc.error}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                        >
                            <Plus className="w-5 h-5 mr-2"/> 加入此課程項目
                        </button>
                    </div>
                </section>
            </div>

            {/* 已加入列表 (Added Items) */}
            <div className="print:hidden space-y-4">
                <h3 className="font-bold text-gray-700">已加入的項目 ({addedItems.length})</h3>
                {addedItems.length === 0 ? (
                    <div className="text-center py-8 bg-gray-100 rounded text-gray-500 border-dashed border-2">尚未加入任何課程，請填寫上方表單並點擊「加入」</div>
                ) : (
                    addedItems.map((item, idx) => (
                        <div key={item.id} className="bg-white p-4 rounded shadow border-l-4 border-green-500 flex justify-between items-center">
                            <div>
                                <div className="font-bold text-lg">{item.courseName}</div>
                                <div className="text-sm text-gray-500">{item.peopleCount}人 | {item.locationMode === 'outing' ? '外派' : '店內'} | {item.city} {item.area}</div>
                                {item.calc.error && <div className="text-red-500 text-xs">{item.calc.error}</div>}
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-xl">${item.calc.finalTotal.toLocaleString()}</span>
                                <button onClick={() => removeAddedItem(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 其他設定 */}
            <div className="print:hidden">
                <section className={SECTION_CLASS}>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={LABEL_CLASS}>狀態</label><select className={INPUT_CLASS} value={status} onChange={e => setStatus(e.target.value)}><option value="draft">草稿</option><option value="pending">報價中</option><option value="confirmed">已回簽</option><option value="paid">已付訂</option><option value="closed">已結案</option></select></div>
                        <div><label className={LABEL_CLASS}>付款期限</label><input type="date" className={INPUT_CLASS} value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
                        <div className="col-span-2"><label className={LABEL_CLASS}>內部備註</label><textarea className={INPUT_CLASS} rows="2" value={adminNotes} onChange={e => setAdminNotes(e.target.value)} /></div>
                    </div>
                </section>
            </div>

            <div className="flex justify-end gap-4 pt-4 print:hidden">
                <button onClick={onCancel} className="px-6 py-3 bg-white border border-gray-300 rounded text-gray-700 font-bold">取消</button>
                <button onClick={handleSave} className="px-8 py-3 bg-green-600 text-white rounded font-bold hover:bg-green-700 shadow-lg flex items-center">
                    <Save className="w-5 h-5 mr-2" /> 儲存報價單
                </button>
            </div>

            {/* 預覽區塊 */}
            <div className="mt-8 border-t-4 border-gray-800 pt-8 print:block">
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center"><FileText className="w-6 h-6 mr-2" /> 報價單即時預覽</h2>
                    <button onClick={() => window.print()} className="bg-gray-800 text-white px-6 py-2 rounded shadow font-bold flex items-center"><Download className="w-4 h-4 mr-2" /> 下載 PDF</button>
                </div>
                <QuotePreview clientInfo={clientInfo} items={addedItems} totalAmount={totalAmount} dateStr={new Date().toLocaleDateString('zh-TW')} idStr="PREVIEW" />
            </div>
        </div>
    );
};

const MobileNavButton = ({ tab, label, currentTab, onClick }) => (
    <button onClick={() => onClick(tab)} className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${currentTab === tab ? 'bg-blue-50 border-blue-500 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}>
        {label}
    </button>
);

const App = () => {
    const [activeTab, setActiveTab] = useState('list');
    const [quotes, setQuotes] = useState([]);
    const [editingQuote, setEditingQuote] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState(null);
    const [selectedQuoteForPreview, setSelectedQuoteForPreview] = useState(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // === FIREBASE LISTENER (取代 localStorage) ===
    useEffect(() => {
        // 使用 Firestore 監聽，自動同步資料
        const q = query(collection(db, "quotes"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const quotesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setQuotes(quotesData);
        }, (error) => {
            console.error("Firebase Snapshot Error:", error);
            // 避免在開發環境一直彈窗，可視情況開啟
            // alert("讀取資料失敗，請檢查網路連線。");
        });
        return () => unsubscribe();
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setShowMobileMenu(false);
    };

    const handleCreateNew = () => {
        setEditingQuote(null);
        setActiveTab('create');
    };

    const handleEdit = (quote) => {
        setEditingQuote(quote);
        setActiveTab('create');
    };

    // === FIREBASE CRUD ===
    const handleSaveQuote = async (quoteData) => {
        try {
            if (editingQuote) {
                // Update
                const quoteRef = doc(db, "quotes", editingQuote.id);
                // 移除 id 因為 firestore 不存這個
                const { id, ...dataToUpdate } = quoteData; 
                await updateDoc(quoteRef, {
                    ...dataToUpdate,
                    updatedAt: new Date().toISOString()
                });
            } else {
                // Create
                await addDoc(collection(db, "quotes"), {
                    ...quoteData,
                    createdAt: new Date().toISOString(),
                    status: quoteData.status || 'draft'
                });
            }
            setActiveTab('list');
        } catch (e) {
            console.error("Error adding/updating document: ", e);
            alert("儲存失敗: " + e.message);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("確定要刪除此報價單嗎？")) {
            try {
                await deleteDoc(doc(db, "quotes", id));
            } catch (e) {
                console.error("Error deleting document: ", e);
                alert("刪除失敗");
            }
        }
    };

    const handleUpdatePayment = async (id, updates) => {
        try {
            const quoteRef = doc(db, "quotes", id);
            await updateDoc(quoteRef, updates);
        } catch(e) {
            console.error(e);
            alert("更新失敗");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const quoteRef = doc(db, "quotes", id);
            await updateDoc(quoteRef, { status: newStatus });
        } catch (e) {
            console.error(e);
            alert("狀態更新失敗");
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

    const exportCSV = () => {
        const headers = ["ID", "狀態", "客戶名稱", "聯絡人", "電話", "總金額", "建立日期"];
        const rows = quotes.map(q => [q.id, q.status, q.clientInfo.companyName, q.clientInfo.contactPerson, q.clientInfo.phone, q.totalAmount, formatDate(q.createdAt)]);
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "quotes_report.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="bg-slate-800 text-white p-2 rounded mr-2"><FileText className="w-6 h-6" /></div>
                            <span className="font-bold text-xl text-gray-800 tracking-wide">下班隨手作報價系統 (雲端版)</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            <button onClick={handleCreateNew} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>報價計算</button>
                            <button onClick={() => handleTabChange('list')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>追蹤清單</button>
                            <button onClick={() => handleTabChange('calendar')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>行事曆</button>
                            <button onClick={() => handleTabChange('stats')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'stats' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>業績統計</button>
                        </div>
                        <div className="flex items-center md:hidden">
                            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
                {/* 手機選單修復：加入 absolute top-16 left-0 z-50 bg-white shadow-lg */}
                {showMobileMenu && (
                    <div className="md:hidden absolute top-16 left-0 w-full bg-white z-50 border-t border-gray-200 shadow-xl">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <MobileNavButton tab="create" label="報價計算" currentTab={activeTab} onClick={handleTabChange} />
                            <MobileNavButton tab="list" label="追蹤清單" currentTab={activeTab} onClick={handleTabChange} />
                            <MobileNavButton tab="calendar" label="行事曆" currentTab={activeTab} onClick={handleTabChange} />
                            <MobileNavButton tab="stats" label="業績統計" currentTab={activeTab} onClick={handleTabChange} />
                        </div>
                    </div>
                )}
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
                {activeTab === 'stats' && <StatsView quotes={quotes} />}
                {activeTab === 'calendar' && <CalendarView quotes={quotes} />}
            </main>

            {showPaymentModal && <PaymentModal quote={selectedQuoteForPayment} onClose={() => setShowPaymentModal(false)} onSave={handleUpdatePayment} />}
            {showPreviewModal && <PreviewModal quote={selectedQuoteForPreview} onClose={() => setShowPreviewModal(false)} />}
        </div>
    );
};

export default App;