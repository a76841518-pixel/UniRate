/* ============================================================
   نكسوس — v2.0 (Image Upload + Comments + Teams + Store)
   ============================================================ */
import { Timestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut,
  setPersistence, browserLocalPersistence, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, getDocs,
  deleteDoc, increment, runTransaction, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ============ Firebase Config ============ */
const firebaseConfig = {
  apiKey: "AIzaSyAzhloP8j7MG0E8N0OJpLMSHL_pfwmbbe8",
  authDomain: "games-8b039.firebaseapp.com",
  databaseURL: "https://games-8b039-default-rtdb.firebaseio.com",
  projectId: "games-8b039",
  storageBucket: "games-8b039.firebasestorage.app",
  messagingSenderId: "55950069787",
  appId: "1:55950069787:web:c489eefa9cd157a4f768be",
  measurementId: "G-N4T4G9ZVT6"
};
const CONFIGURED = !firebaseConfig.apiKey.includes("YOUR_");

/* ============ Icons ============ */
const ICONS = {
  home:'<path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5.5v-6.5h-5V21H4a1 1 0 0 1-1-1z"/>',
  message:'<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.5 9.5 0 0 1-3.4-.6L3 21l1.7-4.9A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z"/>',
  gamepad:'<path d="M17.5 6H6.5a4.5 4.5 0 0 0-4.4 5.5l1 5A3 3 0 0 0 8.3 18l1.2-1.5h5l1.2 1.5a3 3 0 0 0 5.2-1.5l1-5A4.5 4.5 0 0 0 17.5 6z"/><path d="M6.5 12h4M8.5 10v4"/><circle cx="16" cy="11" r="1"/><circle cx="18.2" cy="13.2" r="1"/>',
  users:'<path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  store:'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell:'<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  chart:'<path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/>',
  trophy:'<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  medal:'<circle cx="12" cy="15" r="6"/><path d="m8.5 3 3.5 6 3.5-6"/><path d="m9 12 2 2 4-4"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  close:'<path d="M18 6 6 18M6 6l12 12"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  send:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  bookmark:'<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  location:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  fire:'<path d="M12 22a7 7 0 0 0 7-7c0-5-4-6-4-11-4 2-5 5-5 7-1-1-2-2-2-4-2 2-3 5-3 8a7 7 0 0 0 7 7z"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  crown:'<path d="M3 8l4 3 5-6 5 6 4-3-2 11H5z"/>',
  share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  comment:'<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.5 9.5 0 0 1-3.4-.6L3 21l1.7-4.9A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z"/>',
  coin:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 0 1 0 3.6h-3a1.8 1.8 0 0 0 0 3.6h4"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  lock:'<rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  play:'<path d="M6 4.5v15l13-7.5z"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
  bolt:'<path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z"/>',
  star:'<path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m21 16-5-5-9 9"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  back:'<path d="M15 18l-6-6 6-6"/>',
  trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/>',
  camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  dots:'<circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>',
  eye:'<path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
};
function ic(name, cls=''){ return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||''}</svg>`; }

/* ============ Static Data ============ */
const GAMES = [
  {id:'g1', name:'Arena Clash', cat:'قتال جماعي', icon:'bolt', online:'12.4K', grad:'linear-gradient(135deg,#6c5ce7,#ff3d71)', modes:['1v1','5v5','تعاوني']},
  {id:'g2', name:'Word Duel', cat:'كلمات', icon:'comment', online:'8.1K', grad:'linear-gradient(135deg,#00d2ff,#22c55e)', modes:['1v1','فرق']},
  {id:'g3', name:'Quiz Clash', cat:'معلومات عامة', icon:'star', online:'5.7K', grad:'linear-gradient(135deg,#f5b301,#ff3d71)', modes:['1v1','تعاوني'], playable:true},
  {id:'g4', name:'Chess Royale', cat:'شطرنج', icon:'crown', online:'9.9K', grad:'linear-gradient(135deg,#a78bfa,#6c5ce7)', modes:['1v1','بطولات']},
  {id:'g5', name:'Trivia Titans', cat:'معلومات', icon:'globe', online:'4.2K', grad:'linear-gradient(135deg,#22c55e,#00d2ff)', modes:['فرق','سريع']},
  {id:'g6', name:'Padel Ping', cat:'رياضة', icon:'play', online:'3.1K', grad:'linear-gradient(135deg,#ff8a00,#f5b301)', modes:['1v1','2v2']},
];
const STORE = [
  {id:'s1', name:'سكن «نيزك»', emoji:'🌠', price:1200, grad:'linear-gradient(135deg,#6c5ce7,#00d2ff)'},
  {id:'s2', name:'إطار برونزي', emoji:'🥉', price:450, grad:'linear-gradient(135deg,#cd7f32,#a05a1f)'},
  {id:'s3', name:'حزمة المبتدئين', emoji:'🎁', price:2000, grad:'linear-gradient(135deg,#22c55e,#00d2ff)'},
  {id:'s4', name:'سكن «تنين»', emoji:'🐉', price:2600, grad:'linear-gradient(135deg,#ff3d71,#f5b301)'},
  {id:'s5', name:'مؤثر انتصار', emoji:'✨', price:800, grad:'linear-gradient(135deg,#f5b301,#ff8a00)'},
  {id:'s6', name:'لقب «الأسطورة»', emoji:'👑', price:5000, grad:'linear-gradient(135deg,#a78bfa,#6c5ce7)'},
];
const ACHIEVEMENTS = [
  {id:'a1', icon:'🏆', name:'أول فوز', desc:'افز بأول مباراة', done:true},
  {id:'a2', icon:'🔥', name:'سلسلة انتصارات', desc:'10 مباريات متتالية', done:true},
  {id:'a3', icon:'🎯', name:'قناص دقيق', desc:'500 إصابة', done:false, p:72},
  {id:'a4', icon:'🤝', name:'روح الفريق', desc:'50 مباراة تعاونية', done:false, p:46},
  {id:'a5', icon:'💬', name:'صوت المجتمع', desc:'100 تعليق', done:true},
  {id:'a6', icon:'⭐', name:'نجم صاعد', desc:'10K شهرة', done:true},
  {id:'a7', icon:'🛡️', name:'درع الفريق', desc:'20 حرب فرق', done:false, p:35},
  {id:'a8', icon:'👑', name:'أسطورة نكسوس', desc:'المستوى 50', done:false, p:84},
];
/* ============ بنك أسئلة Quiz Clash ============ */
const QUIZ_QUESTIONS = [
  {q:'ما هي عاصمة اليابان؟', a:['طوكيو','بكين','سيول','بانكوك'], correct:0},
  {q:'كم عدد كواكب المجموعة الشمسية؟', a:['7','8','9','10'], correct:1},
  {q:'من مؤلف رواية «مئة عام من العزلة»؟', a:['بابلو نيرودا','غابرييل غارسيا ماركيز','خورخي بورخيس','ماريو بارغاس يوسا'], correct:1},
  {q:'ما هو أكبر محيط في العالم؟', a:['الأطلسي','الهندي','الهادئ','المتجمد الشمالي'], correct:2},
  {q:'في أي عام هبط الإنسان على سطح القمر لأول مرة؟', a:['1965','1969','1972','1958'], correct:1},
  {q:'ما هي اللغة الأكثر تحدثاً في العالم كلغة أم؟', a:['الإنجليزية','الصينية الماندرين','الإسبانية','الهندية'], correct:1},
  {q:'كم عدد لاعبي فريق كرة القدم في الملعب؟', a:['9','10','11','12'], correct:2},
  {q:'ما هو أطول نهر في العالم؟', a:['الأمازون','النيل','المسيسيبي','اليانغتسي'], correct:1},
  {q:'من رسم لوحة الموناليزا؟', a:['مايكل أنجلو','ليوناردو دافنشي','رافائيل','فان جوخ'], correct:1},
  {q:'ما هو العنصر الكيميائي الذي رمزه Fe؟', a:['الفضة','الحديد','الذهب','النحاس'], correct:1},
  {q:'كم عدد أضلاع الشكل السداسي؟', a:['4','5','6','8'], correct:2},
  {q:'من هو مخترع المصباح الكهربائي؟', a:['نيكولا تسلا','توماس إديسون','ألساندرو فولتا','بنجامين فرانكلين'], correct:1},
  {q:'ما هي أكبر قارة في العالم؟', a:['أفريقيا','أوروبا','آسيا','أمريكا الشمالية'], correct:2},
  {q:'كم يستغرق ضوء الشمس للوصول إلى الأرض تقريباً؟', a:['8 دقائق','8 ثوان','8 ساعات','8 أيام'], correct:0},
  {q:'ما هي العملة الرسمية في اليابان؟', a:['اليوان','الوون','الين','الروبية'], correct:2},
  {q:'من كتب «مقدمة ابن خلدون»؟', a:['ابن سينا','ابن خلدون','ابن رشد','الفارابي'], correct:1},
  {q:'ما هو أعمق محيط في العالم؟', a:['الأطلسي','الهندي','الهادئ','المتجمد الجنوبي'], correct:2},
  {q:'كم عدد أسنان الإنسان البالغ؟', a:['28','30','32','36'], correct:2},
  {q:'ما هو الرمز الكيميائي للماء؟', a:['CO2','H2O','O2','NaCl'], correct:1},
  {q:'من هو أول رئيس للولايات المتحدة الأمريكية؟', a:['أبراهام لينكولن','جورج واشنطن','توماس جيفرسون','جون آدامز'], correct:1},
];

const QUIZ_CONFIG = {
  totalQuestions: 7,
  secondsPerQuestion: 15,
  pointsPerCorrect: 100,
  bonusPerSecond: 5,
};

/* ============================================================
   🔥 نظام المنشورات الدارجة — ثوابت الخوارزمية
   ============================================================ */
const TRENDING_CONFIG = {
  /* ---- أوزان التفاعل ---- */
  W_LIKE:    1,      // إعجاب = 1 نقطة (إشارة خفيفة)
  W_COMMENT: 3,      // تعليق = 3 نقاط (نقاش)
  W_REBLOG:  5,      // إعادة نشر = 5 نقاط (انتشار)

  /* ---- الانحدار الزمني (Hacker News) ---- */
  GRAVITY: 1.5,

  /* ---- طبقات الحداثة (سقف الساعات → معامل) ---- */
  FRESHNESS: [
    { maxHours: 1,        mult: 2.00 },   // أقل من ساعة
    { maxHours: 3,        mult: 1.65 },
    { maxHours: 6,        mult: 1.35 },
    { maxHours: 12,       mult: 1.15 },
    { maxHours: 24,       mult: 1.00 },   // يوم
    { maxHours: 48,       mult: 0.80 },
    { maxHours: 168,      mult: 0.50 },   // أسبوع
    { maxHours: 720,      mult: 0.20 },   // شهر
    { maxHours: Infinity, mult: 0.05 },   // قديم
  ],

  /* ---- سمعة الناشر ---- */
  AUTHOR_BOOST_CAP:     0.5,      // حد أقصى +50%
  AUTHOR_FAME_DIVISOR:  20000,

  /* ---- السرعة ---- */
  VELOCITY_LOG_FACTOR:  0.3,

  /* ---- عمق النقاش ---- */
  DISCUSSION_BOOST_CAP: 1.5,
  DISCUSSION_DIVISOR:   50,

  /* ---- حماية من التلاعب ---- */
  SUSPICIOUS_LIKES:  50,     // فوق هذا بدون تعليقات/نشر = مشبوه
  SUSPICIOUS_DAMPEN: 0.5,    // عقوبة −50%

  /* ---- أخرى ---- */
  MIN_AGE_HOURS:    0.5,     // تجنّب القسمة على صفر
  MAX_PER_AUTHOR:   2,       // حد أقصى لكل ناشر في الدارج
  MAX_TRENDING:     30,
};

/* ============ مكافآت الدخول اليومي ============ */
const DAILY_REWARDS = [
  { day: 1, coins: 50,  xp: 10  },
  { day: 2, coins: 100, xp: 20  },
  { day: 3, coins: 150, xp: 30  },
  { day: 4, coins: 200, xp: 40  },
  { day: 5, coins: 300, xp: 60  },
  { day: 6, coins: 500, xp: 100 },
  { day: 7, coins: 1000, xp: 200, badge: '🎖️' },
];

/* ============ حالات اللاعب ============ */
const PLAYER_STATUSES = {
  available: { icon: '🟢', label: 'متاح للعب', color: '#22c55e' },
  playing:   { icon: '🎮', label: 'ألعب الآن', color: '#6c5ce7' },
  busy:      { icon: '🔴', label: 'مشغول',     color: '#ff3d71' },
  away:      { icon: '🟡', label: 'بعيد',      color: '#f5b301' },
};

/* ============ فئات المقتنيات ============ */
const ITEM_CATEGORIES = {
  frame: { label: 'إطار',  icon: '🖼️' },
  title: { label: 'لقب',   icon: '👑' },
  badge: { label: 'شارة',  icon: '⭐' },
  theme: { label: 'سكن',   icon: '🎨' },
};
/* ============ البطولات ============ */
const TOURNAMENT_SIZES = [4, 8, 16];
const TOURNAMENT_STATUS = {
  open:     { label: 'التسجيل مفتوح', color: '#22c55e' },
  ongoing:  { label: 'جارية',          color: '#f5b301' },
  finished: { label: 'منتهية',         color: '#8a95ad' },
};

/* ============ حروب الفرق ============ */
const WAR_DURATION_HOURS = 24;
const WAR_POINTS_PER_WIN = 10;
const WAR_POINTS_PER_LOSS = 3;

/* ============ تعريفات الإنجازات ============ */
const ACHIEVEMENT_DEFS = {
  first_match:      { id:'first_match',      icon:'🎮', name:'أول مباراة',       desc:'العب أول مباراة',           tier:'bronze',  reward:{coins:100, xp:20},  trigger:'matches',     threshold:1 },
  ten_wins:         { id:'ten_wins',         icon:'🏆', name:'10 انتصارات',      desc:'افز بـ10 مباريات',           tier:'silver',  reward:{coins:300, xp:80},  trigger:'wins',        threshold:10 },
  fifty_wins:       { id:'fifty_wins',       icon:'👑', name:'50 انتصاراً',      desc:'افز بـ50 مباراة',            tier:'gold',    reward:{coins:1000, xp:300},trigger:'wins',        threshold:50 },
  social_butterfly: { id:'social_butterfly', icon:'🦋', name:'اجتماعي',          desc:'تابع 20 مستخدماً',           tier:'bronze',  reward:{coins:150, xp:30},  trigger:'following',   threshold:20 },
  popular:          { id:'popular',          icon:'⭐', name:'شعبي',             desc:'احصل على 50 متابع',          tier:'silver',  reward:{coins:400, xp:100}, trigger:'followers',   threshold:50 },
  team_player:      { id:'team_player',      icon:'🛡️', name:'لاعب فريق',        desc:'انضم لفريق',                 tier:'bronze',  reward:{coins:100, xp:20},  trigger:'hasTeam',     threshold:1 },
  team_leader:      { id:'team_leader',      icon:'⚔️', name:'قائد',             desc:'أنشئ فريقاً',                tier:'silver',  reward:{coins:300, xp:80},  trigger:'createdTeam', threshold:1 },
  creator:          { id:'creator',          icon:'📝', name:'منشئ محتوى',       desc:'انشر 10 منشورات',            tier:'bronze',  reward:{coins:200, xp:40},  trigger:'posts',       threshold:10 },
  tournament_rookie:{ id:'tournament_rookie',icon:'🥉', name:'مشارك بطولة',      desc:'شارك في بطولة',              tier:'bronze',  reward:{coins:150, xp:30},  trigger:'tournaments', threshold:1 },
  tournament_champ: { id:'tournament_champ', icon:'🥇', name:'بطل بطولة',        desc:'افز ببطولة',                 tier:'gold',    reward:{coins:2000, xp:500},trigger:'tournamentWins',threshold:1 },
  war_hero:         { id:'war_hero',         icon:'🔥', name:'بطل الحرب',        desc:'افز بحرب فريق',              tier:'gold',    reward:{coins:1500, xp:400},trigger:'warWins',     threshold:1 },
  daily_streak_7:   { id:'daily_streak_7',   icon:'📅', name:'مواظب',            desc:'7 أيام متتالية',             tier:'gold',    reward:{coins:500, xp:150}, trigger:'streak',      threshold:7 },
};

const TIER_COLORS = {
  bronze: { bg:'rgba(205,127,50,.18)', border:'rgba(205,127,50,.4)',  text:'#e4a76c' },
  silver: { bg:'rgba(201,211,224,.18)',border:'rgba(201,211,224,.4)', text:'#d4dbe6' },
  gold:   { bg:'rgba(245,179,1,.18)',  border:'rgba(245,179,1,.4)',   text:'#f5c451' },
  diamond:{ bg:'rgba(0,210,255,.18)',  border:'rgba(0,210,255,.4)',   text:'#5fe3ff' },
};
/* ============ الهدايا ============ */
const GIFT_ITEMS = [
  { id:'g_rose',     name:'وردة',          emoji:'🌹', price:50   },
  { id:'g_heart',    name:'قلب',           emoji:'💖', price:100  },
  { id:'g_star',     name:'نجمة',          emoji:'⭐', price:150  },
  { id:'g_gift',     name:'هدية صغيرة',    emoji:'🎁', price:250  },
  { id:'g_diamond',  name:'ألماسة',        emoji:'💎', price:500  },
  { id:'g_crown',    name:'تاج',           emoji:'👑', price:1000 },
  { id:'g_trophy',   name:'كأس ذهبي',      emoji:'🏆', price:1500 },
  { id:'g_rocket',   name:'صاروخ',         emoji:'🚀', price:2000 },
];

/* ============ المواسم ============ */
const SEASON_DURATION_DAYS = 30;
const SEASON_THEMES = [
  { id:'s1', name:'موسم الانطلاق', emoji:'🚀', color:'#6c5ce7' },
  { id:'s2', name:'موسم النار',    emoji:'🔥', color:'#ff3d71' },
  { id:'s3', name:'موسم الجليد',   emoji:'❄️', color:'#00d2ff' },
  { id:'s4', name:'موسم الذهب',    emoji:'👑', color:'#f5b301' },
];

/* ============ الثيمات ============ */
const THEMES = {
  default:   { name:'افتراضي',      colors:['#6c5ce7','#00d2ff'] },
  sunset:    { name:'غروب',         colors:['#ff8a00','#ff3d71'] },
  forest:    { name:'غابة',         colors:['#22c55e','#00d2ff'] },
  midnight:  { name:'منتصف الليل',  colors:['#4c1d95','#1e1b4b'] },
  fire:      { name:'نار',          colors:['#ff3d71','#f5b301'] },
  ocean:     { name:'محيط',         colors:['#0891b2','#22d3ee'] },
  lavender:  { name:'لافندر',       colors:['#a78bfa','#ec4899'] },
  mint:      { name:'نعناع',        colors:['#10b981','#a7f3d0'] },
  rose:      { name:'ورد',          colors:['#f43f5e','#fbcfe8'] },
  sky:       { name:'سماء',         colors:['#0ea5e9','#bae6fd'] },
  gold:      { name:'ذهبي',         colors:['#f5b301','#78350f'] },
  cherry:    { name:'كرز',          colors:['#ec4899','#f43f5e'] },
  cyber:     { name:'سايبر',        colors:['#00ff88','#ff00ff'] },
  aurora:    { name:'شفق',          colors:['#22d3ee','#a78bfa'] },
  blood:     { name:'دم',           colors:['#7f1d1d','#000000'] },
  sand:      { name:'رمال',         colors:['#d97706','#fef3c7'] },
  deep:      { name:'عميق',         colors:['#0f172a','#1e40af'] },
  lime:      { name:'ليمون',        colors:['#84cc16','#06b6d4'] },
  copper:    { name:'نحاسي',        colors:['#a05a1f','#f59e0b'] },
  mono:      { name:'أحادي',        colors:['#475569','#1e293b'] },
};

/* ============================================================
   🌫️ تأثيرات الأفاتار
   ============================================================ */
const AVATAR_FILTERS = {
  none:      { label:'عادي',    css:'none',                              emoji:'⬜' },
  grayscale: { label:'رمادي',   css:'grayscale(1)',                      emoji:'⚫' },
  sepia:     { label:'سيبيا',   css:'sepia(1)',                          emoji:'🟤' },
  invert:    { label:'معكوس',   css:'invert(1)',                         emoji:'🔄' },
  blur:      { label:'ضبابي',   css:'blur(2px)',                         emoji:'💨' },
  bright:    { label:'ساطع',    css:'brightness(1.3) saturate(1.4)',     emoji:'☀️' },
  dark:      { label:'داكن',    css:'brightness(0.65)',                  emoji:'🌑' },
  vintage:   { label:'قديم',    css:'sepia(0.6) contrast(1.1)',          emoji:'📷' },
  cool:      { label:'بارد',    css:'hue-rotate(180deg)',                emoji:'❄️' },
  warm:      { label:'دافئ',    css:'hue-rotate(-30deg) saturate(1.3)',  emoji:'🔥' },
};

/* ============================================================
   🎬 حركات الاسم
   ============================================================ */
const NAME_ANIMATIONS = {
  none:    { label:'بدون',    emoji:'⬜' },
  pulse:   { label:'نبض',     emoji:'💓' },
  shake:   { label:'اهتزاز',  emoji:'🌪️' },
  glow:    { label:'توهج',    emoji:'✨' },
  rainbow: { label:'قزح',     emoji:'🌈' },
  bounce:  { label:'قفز',     emoji:'⬆️' },
};

/* ============================================================
   🌟 توهج البطاقة
   ============================================================ */
const CARD_GLOWS = {
  none:    { label:'بدون',  emoji:'⬜' },
  soft:    { label:'ناعم',  emoji:'🌟' },
  strong:  { label:'قوي',   emoji:'💫' },
  rainbow: { label:'قزح',   emoji:'🌈' },
  gold:    { label:'ذهبي',  emoji:'👑' },
};

/* ============================================================
   💫 ظل البطاقة
   ============================================================ */
const CARD_SHADOWS = {
  none:   { label:'بدون',   emoji:'⬜' },
  small:  { label:'صغير',   emoji:'▪️' },
  medium: { label:'متوسط',  emoji:'◼️' },
  large:  { label:'كبير',   emoji:'⬛' },
};

/* ============================================================
   🏅 نمط شارة المستوى
   ============================================================ */
const LEVEL_STYLES = {
  default: { label:'افتراضي', emoji:'🎖️' },
  badge:   { label:'شارة',   emoji:'🏅' },
  gem:     { label:'جوهرة',  emoji:'💎' },
  crown:   { label:'تاج',    emoji:'👑' },
  star:    { label:'نجمة',   emoji:'⭐' },
  minimal: { label:'بسيط',   emoji:'▫️' },
};

/* ============================================================
   🎨 أنماط الخلفية
   ============================================================ */
const BG_PATTERNS = {
  none:    { label:'بدون',   emoji:'⬜' },
  dots:    { label:'نقاط',   emoji:'⚬' },
  grid:    { label:'شبكة',   emoji:'▦' },
  stripes: { label:'خطوط',   emoji:'▥' },
  waves:   { label:'موج',    emoji:'🌊' },
  stars:   { label:'نجوم',   emoji:'✨' },
};

/* ============ الإطارات المتحركة ============ */
const ANIMATED_FRAMES = {
  none:        { name:'بدون',          class:'',                    tier:'free'   },
  pulse:       { name:'نبض',           class:'frame-pulse',         tier:'free'   },
  glow:        { name:'توهج',          class:'frame-glow',          tier:'plus'   },
  stars:       { name:'نجوم',          class:'frame-stars',         tier:'plus'   },
  rainbow:     { name:'قوس قزح',       class:'frame-rainbow',       tier:'plus'   },
  neon:        { name:'نيون',          class:'frame-neon',          tier:'plus2'  },
  fire:        { name:'نار',           class:'frame-fire',          tier:'plus2'  },
  ice:         { name:'جليد',          class:'frame-ice',           tier:'plus2'  },
  gold:        { name:'ذهبي',          class:'frame-gold',          tier:'exclusive', price:2500 },
  galaxy:      { name:'مجرة',          class:'frame-galaxy',        tier:'exclusive', price:4000 },
  gradient:    { name:'تدرّج متحرك',   class:'frame-gradient-anim', tier:'exclusive', price:3500 },
  dashed:      { name:'متقطع',         class:'frame-dashed',        tier:'exclusive', price:1800 },
  double:      { name:'مزدوج',         class:'frame-double',        tier:'exclusive', price:3000 },
};

/* ============ تخطيطات البطاقة ============ */
const PROFILE_LAYOUTS = {
  default:     { label:'افتراضي' },
  compact:     { label:'مضغوط' },
  banner_top:  { label:'بانر أعلى' },
};

/* ============ تأثيرات الغلاف ============ */
const BANNER_EFFECTS = {
  none:      { label:'بدون',      emoji:'⬜' },
  particles: { label:'جزيئات',   emoji:'✨' },
  stars:     { label:'نجوم',      emoji:'⭐' },
  wave:      { label:'موجة',       emoji:'🌊' },
};

/* ============ الألوان المميزة ============ */
const ACCENT_COLORS = [
  '#6c5ce7', '#00d2ff', '#ff3d71', '#f5b301',
  '#22c55e', '#a78bfa', '#ff8a00', '#ec4899',
];

/* ============ خطط الاشتراك ============ */
const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free', name: 'مجاني', emoji: '🆓',
    price: 0, durationDays: 0, color: '#8a95ad',
    features: {
      maxCustomColors: 0,
      hasMusic: false,
      hasBannerEffect: false,
      hasLayoutCustomization: false,
      hasNameColor: false,
      hasUsernameColor: false,
      hasTitleColor: false,
      maxFrames: 1,
      canCustomizeShape: false,   // ★ Plus فقط
      canCustomizeBorder: false,  // ★ Plus فقط
      canCustomizeTheme: false,   // ★ Plus فقط
    }
  },
  plus: {
    id: 'plus', name: 'بلس', emoji: '💎',
    price: 1500, durationDays: 30, color: '#00d2ff',
    features: {
      maxCustomColors: 3,
      hasMusic: true,
      hasBannerEffect: true,
      hasLayoutCustomization: false,
      hasNameColor: true,
      hasUsernameColor: true,
      hasTitleColor: false,
      maxFrames: 5,
      canCustomizeShape: true,
      canCustomizeBorder: true,
      canCustomizeTheme: true,
    }
  },
  plus2: {
    id: 'plus2', name: 'بلس دبل', emoji: '👑',
    price: 3500, durationDays: 60, color: '#f5b301',
    features: {
      maxCustomColors: 8,
      hasMusic: true,
      hasBannerEffect: true,
      hasLayoutCustomization: true,
      hasNameColor: true,
      hasUsernameColor: true,
      hasTitleColor: true,
      maxFrames: 8,
      canCustomizeShape: true,
      canCustomizeBorder: true,
      canCustomizeTheme: true,
    }
  },
};

/* ============================================================
   🎨 الألوان الموسّعة
   ============================================================ */
const NAME_COLOR_PRESETS = [
  /* محايدة (9) */
  '#ffffff','#f8fafc','#e9eefb','#cbd5e1','#94a3b8','#64748b','#475569','#1e293b','#000000',
  /* هوية نكسوس (5) */
  '#6c5ce7','#00d2ff','#ff3d71','#f5b301','#22c55e',
  /* طيف قزح كامل (17) */
  '#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#14b8a6',
  '#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899','#f43f5e',
  /* باستيل (10) */
  '#fecaca','#fed7aa','#fde68a','#d9f99d','#bbf7d0','#a7f3d0','#bae6fd','#c7d2fe','#ddd6fe','#fbcfe8',
  /* داكنة (11) */
  '#7f1d1d','#78350f','#713f12','#365314','#14532d','#134e4a',
  '#164e63','#1e3a8a','#3730a3','#581c87','#831843',
  /* نيون (10) */
  '#39ff14','#ff10f0','#00ffff','#ff6600','#fb7185',
  '#ff00ff','#00ff88','#ff0080','#00ffcc','#ccff00',
];

/* ============================================================
   🌈 تدرجات للاسم
   ============================================================ */
const NAME_GRADIENTS = {
  none:    { label:'بدون',    css:'none',              emoji:'⬜' },
  sunset:  { label:'غروب',    css:'linear-gradient(90deg,#ff8a00,#ff3d71)', emoji:'🌅' },
  ocean:   { label:'محيط',    css:'linear-gradient(90deg,#0891b2,#22d3ee)', emoji:'🌊' },
  forest:  { label:'غابة',    css:'linear-gradient(90deg,#22c55e,#00d2ff)', emoji:'🌲' },
  purple:  { label:'أرجوان',  css:'linear-gradient(90deg,#a78bfa,#6c5ce7)', emoji:'💜' },
  fire:    { label:'نار',     css:'linear-gradient(90deg,#f5b301,#ff3d71)', emoji:'🔥' },
  rainbow: { label:'قزح',     css:'linear-gradient(90deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#9400d3)', emoji:'🌈' },
  gold:    { label:'ذهبي',    css:'linear-gradient(90deg,#f5b301,#ffd700,#f5b301)', emoji:'👑' },
  ice:     { label:'جليد',    css:'linear-gradient(90deg,#a5f3fc,#22d3ee)', emoji:'❄️' },
  neon:    { label:'نيون',    css:'linear-gradient(90deg,#39ff14,#00ffff)', emoji:'💡' },
  candy:   { label:'حلوى',    css:'linear-gradient(90deg,#f472b6,#a78bfa,#38bdf8)', emoji:'🍬' },
};

/* ============================================================
   ✨ تأثيرات النص
   ============================================================ */
const TEXT_EFFECTS = {
  none:    { label:'بدون',    emoji:'⬜' },
  glow:    { label:'توهج',    emoji:'✨' },
  shadow:  { label:'ظل',      emoji:'🌑' },
  outline: { label:'حدود',    emoji:'⬛' },
  neon:    { label:'نيون',    emoji:'💡' },
};

/* ============================================================
   🔤 أوزان الخط
   ============================================================ */
const FONT_WEIGHTS = {
  normal: { label:'عادي',   value:400 },
  medium: { label:'متوسط',  value:600 },
  bold:   { label:'عريض',   value:700 },
  heavy:  { label:'ثقيل',   value:800 },
  black:  { label:'أسود',   value:900 },
};

/* ============================================================
   🖼️ أشكال الأفاتار الموسّعة (8 أشكال)
   ============================================================ */
const AVATAR_SHAPES = {
  circle:  { label:'دائرية',  radius:'50%' },
  rounded: { label:'مستديرة', radius:'23px' },
  square:  { label:'مربعة',   radius:'6px' },
  hexagon: { label:'سداسية',  radius:'0', clip:'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' },
  octagon: { label:'ثمانية',  radius:'0', clip:'polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)' },
  diamond: { label:'معينة',   radius:'0', clip:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)' },
  star:    { label:'نجمة',    radius:'0', clip:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' },
  blob:    { label:'عضوية',   radius:'60% 40% 30% 70% / 60% 30% 70% 40%' },
};

/* ============================================================
   🎖️ شارات بجانب الاسم
   ============================================================ */
const NAME_BADGES = {
  none:    { emoji:'',   label:'بدون' },
  star:    { emoji:'⭐', label:'نجمة' },
  crown:   { emoji:'👑', label:'تاج' },
  fire:    { emoji:'🔥', label:'نار' },
  gem:     { emoji:'💎', label:'جوهرة' },
  skull:   { emoji:'💀', label:'جمجمة' },
  sword:   { emoji:'⚔️', label:'سيف' },
  heart:   { emoji:'❤️', label:'قلب' },
  bolt:    { emoji:'⚡', label:'برق' },
  moon:    { emoji:'🌙', label:'قمر' },
  sun:     { emoji:'☀️', label:'شمس' },
  flower:  { emoji:'🌸', label:'زهرة' },
  dragon:  { emoji:'🐉', label:'تنين' },
  rocket:  { emoji:'🚀', label:'صاروخ' },
  ghost:   { emoji:'👻', label:'شبح' },
  alien:   { emoji:'👽', label:'فضائي' },
};

/* ============================================================
   📝 أنماط النبذة
   ============================================================ */
const BIO_STYLES = {
  plain:   { label:'عادي',    emoji:'📄' },
  quote:   { label:'اقتباس',  emoji:'💬' },
  italic:  { label:'مائل',    emoji:'✍️' },
  glow:    { label:'متوهج',   emoji:'✨' },
  card:    { label:'بطاقة',   emoji:'🃏' },
};

/* ============================================================
   🔵 أشكال حدود الأفاتار
   ============================================================ */
const AVATAR_BORDERS = {
  gradient: { label:'تدرّج',   emoji:'🎨' },
  solid:    { label:'لون ثابت', emoji:'⚪' },
  glow:     { label:'توهج',    emoji:'✨' },
  rainbow:  { label:'قزح',     emoji:'🌈' },
  none:     { label:'بدون',    emoji:'🚫' },
};

/* ============================================================
   🖼️ إضافات الغلاف
   ============================================================ */
const COVER_PATTERNS = {
  none:     { label:'بدون',    emoji:'⬜' },
  dots:     { label:'نقاط',    emoji:'⚬' },
  grid:     { label:'شبكة',    emoji:'▦' },
  diagonal: { label:'قطري',    emoji:'◨' },
  waves:    { label:'موج',     emoji:'🌊' },
  noise:    { label:'ضجيج',    emoji:'▓' },
  circuit:  { label:'دوائر',   emoji:'⚙️' },
  hexagon:  { label:'سداسي',   emoji:'⬡' },
  cross:    { label:'صليب',    emoji:'✚' },
  gradient_stripes:{ label:'خطوط متدرجة', emoji:'🌈' },
};

const COVER_OVERLAYS = {
  none:      { label:'بدون',         emoji:'⬜' },
  dark:      { label:'داكن',          emoji:'🌑' },
  gradient_t:{ label:'تدرج أعلى',    emoji:'⬆️' },
  gradient_b:{ label:'تدرج أسفل',    emoji:'⬇️' },
  vignette:  { label:'حواف',         emoji:'⚫' },
  radial:    { label:'إشعاعي',       emoji:'🔘' },
  blue:      { label:'أزرق',          emoji:'🔵' },
  purple:    { label:'أرجواني',       emoji:'🟣' },
  pink:      { label:'وردي',          emoji:'🌸' },
};

const COVER_PRESETS = [
  { id:'cp1',  name:'نيزك',   css:'linear-gradient(135deg,#6c5ce7,#00d2ff)' },
  { id:'cp2',  name:'غروب',   css:'linear-gradient(135deg,#ff8a00,#ff3d71)' },
  { id:'cp3',  name:'غابة',   css:'linear-gradient(135deg,#22c55e,#00d2ff)' },
  { id:'cp4',  name:'ليل',    css:'linear-gradient(135deg,#4c1d95,#1e1b4b)' },
  { id:'cp5',  name:'نار',    css:'linear-gradient(135deg,#f5b301,#ff3d71)' },
  { id:'cp6',  name:'محيط',   css:'linear-gradient(135deg,#0891b2,#22d3ee)' },
  { id:'cp7',  name:'لافندر', css:'linear-gradient(135deg,#a78bfa,#ec4899)' },
  { id:'cp8',  name:'ذهب',    css:'linear-gradient(135deg,#f5b301,#78350f)' },
  { id:'cp9',  name:'سايبر',  css:'linear-gradient(135deg,#00ff88,#ff00ff)' },
  { id:'cp10', name:'شفق',    css:'linear-gradient(135deg,#22d3ee,#a78bfa)' },
  { id:'cp11', name:'دم',     css:'linear-gradient(135deg,#7f1d1d,#000000)' },
  { id:'cp12', name:'رمال',   css:'linear-gradient(135deg,#d97706,#fef3c7)' },
];

const COVER_BRIGHTNESS_STEPS = [
  { label:'داكن جداً', value: 0.4 },
  { label:'داكن',      value: 0.7 },
  { label:'عادي',      value: 1.0 },
  { label:'ساطع',      value: 1.2 },
  { label:'ساطع جداً', value: 1.5 },
];

/* ============================================================
   👤 إضافات الصورة الشخصية
   ============================================================ */
const AVATAR_DECORATIONS = {
  none:      { label:'بدون',    emoji:'⬜' },
  crown:     { label:'تاج',     emoji:'👑' },
  halo:      { label:'هالة',    emoji:'😇' },
  horns:     { label:'قرون',    emoji:'😈' },
  cat_ears:  { label:'آذان قط', emoji:'🐱' },
  flowers:   { label:'زهور',    emoji:'🌸' },
  sparkle:   { label:'بريق',    emoji:'✨' },
  headphones:{ label:'سماعات',  emoji:'🎧' },
  fire:      { label:'نار',     emoji:'🔥' },
  star:      { label:'نجمة',    emoji:'⭐' },
  leaf:      { label:'ورقة',    emoji:'🍃' },
  moon:      { label:'قمر',     emoji:'🌙' },
};

const AVATAR_BG_PATTERNS = {
  none:    { label:'بدون',  emoji:'⬜' },
  dots:    { label:'نقاط',  emoji:'⚬' },
  grid:    { label:'شبكة',  emoji:'▦' },
  stripes: { label:'خطوط',  emoji:'▥' },
  rings:   { label:'حلقات', emoji:'◎' },
  hexagon: { label:'سداسي', emoji:'⬡' },
};

const AVATAR_FILTERS_EXTENDED = {
  ...AVATAR_FILTERS,
  vintage:    { label:'قديم',      css:'sepia(0.6) contrast(1.1) saturate(0.8)', emoji:'📷' },
  dreamy:     { label:'حالم',      css:'blur(0.4px) brightness(1.15) saturate(1.3)', emoji:'💭' },
  noir:       { label:'نوار',      css:'grayscale(1) contrast(1.5) brightness(0.9)', emoji:'🎬' },
  technicolor:{ label:'تكنيكولور', css:'saturate(1.8) contrast(1.2)', emoji:'🎨' },
  pastel:     { label:'باستيل',    css:'saturate(0.6) brightness(1.15)', emoji:'🍬' },
  dramatic:   { label:'درامي',     css:'contrast(1.5) brightness(0.85)', emoji:'🎭' },
  dreamy2:    { label:'حالم ٢',    css:'hue-rotate(30deg) saturate(1.2)', emoji:'🌙' },
  sharp:      { label:'حاد',       css:'contrast(1.3) saturate(1.2)', emoji:'🔷' },
  old_photo:  { label:'صورة قديمة', css:'sepia(1) contrast(1.1) brightness(0.95)', emoji:'🖼️' },
  cold:       { label:'بارد',      css:'hue-rotate(200deg) saturate(1.1)', emoji:'🧊' },
  hot:        { label:'حار',       css:'hue-rotate(-20deg) saturate(1.4)', emoji:'🌶️' },
  fade:       { label:'باهت',      css:'opacity(0.85) brightness(1.1)', emoji:'🌫️' },
};

/* ============================================================
   🖼️ أنماط إطارات موسّعة (مع أنواع جديدة)
   ============================================================ */
const FRAME_STYLES = {
  ...ANIMATED_FRAMES,
  // أنماط جديدة
  dotted:     { name:'منقط',        class:'frame-dotted',   tier:'free' },
  striped:    { name:'مخطط',        class:'frame-striped',  tier:'free' },
  sparkle:    { name:'بريق',        class:'frame-sparkle',  tier:'plus' },
  hearts:     { name:'قلوب',        class:'frame-hearts',   tier:'plus' },
  glow_rainbow:{ name:'قزح متوهج',  class:'frame-glow-rb',  tier:'plus' },
  matrix:     { name:'ماتريكس',     class:'frame-matrix',   tier:'plus2' },
  steam:      { name:'بخار',        class:'frame-steam',    tier:'plus2' },
  circuit:    { name:'دوائر',       class:'frame-circuit',  tier:'plus2' },
  royal:      { name:'ملكي',        class:'frame-royal',    tier:'exclusive', price:3500 },
  cosmic:     { name:'كوني',        class:'frame-cosmic',   tier:'exclusive', price:4500 },
  chrome:     { name:'كروم',        class:'frame-chrome',   tier:'exclusive', price:5000 },
  shattered:  { name:'مبعثر',       class:'frame-shattered',tier:'exclusive', price:4000 },
};

/* ============================================================
   🎨 ثيمات موسّعة
   ============================================================ */
const THEMES_EXTENDED = {
  ...THEMES,
  // 20 ثيم جديد
  aurora_b:  { name:'شفق ثانٍ',   colors:['#0ea5e9','#a78bfa'] },
  saffron:   { name:'زعفران',    colors:['#f59e0b','#7c2d12'] },
  mint2:     { name:'نعناع ٢',   colors:['#10b981','#ecfdf5'] },
  candy:     { name:'حلوى',      colors:['#ec4899','#8b5cf6'] },
  toxic:     { name:'سام',        colors:['#84cc16','#000000'] },
  vampire:   { name:'مصاص دماء', colors:['#dc2626','#000000'] },
  arctic:    { name:'قطبي',       colors:['#bae6fd','#0284c7'] },
  sunset2:   { name:'غروب ٢',    colors:['#f97316','#7c2d12'] },
  forest2:   { name:'غابة ٢',    colors:['#15803d','#65a30d'] },
  cyber2:    { name:'سايبر ٢',   colors:['#00f0ff','#ff00aa'] },
  royal_p:   { name:'بنفسجي ملكي', colors:['#7e22ce','#1e1b4b'] },
  bronze:    { name:'برونزي',    colors:['#a16207','#451a03'] },
  platinum:  { name:'بلاتيني',   colors:['#e5e7eb','#6b7280'] },
  neon_pink: { name:'وردي نيون', colors:['#f472b6','#db2777'] },
  galaxy2:   { name:'مجرة ٢',    colors:['#312e81','#f472b6'] },
  lava:      { name:'حمم',        colors:['#dc2626','#f59e0b'] },
  emerald:   { name:'زمردي',     colors:['#059669','#022c22'] },
  twilight:  { name:'شفق الغروب', colors:['#6366f1','#f59e0b'] },
  paper:     { name:'ورقي',      colors:['#f3f4f6','#78716c'] },
  desert:    { name:'صحراوي',    colors:['#d97706','#78350f'] },
};

/* ============================================================
   📐 تخطيطات جديدة للثيم
   ============================================================ */
const PROFILE_LAYOUTS_EXTENDED = {
  ...PROFILE_LAYOUTS,
  split:      { label:'منقسم',     desc:'غلاف يسار/محتوى يمين' },
  centered:   { label:'مركزي',     desc:'كل شيء في المنتصف' },
  minimal:    { label:'بسيط',      desc:'بدون زخرفة' },
  magazine:   { label:'مجلة',      desc:'صور كبيرة' },
  card_stack: { label:'بطاقة مكدسة', desc:'معلومات أعلى' },
  hero:       { label:'بطولي',      desc:'غلاف كامل' },
};

/* ============================================================
   🌈 ألوان مميزة موسّعة
   ============================================================ */
const ACCENT_COLORS_EXTENDED = [
  // الأصلية
  '#6c5ce7','#00d2ff','#ff3d71','#f5b301','#22c55e','#a78bfa','#ff8a00','#ec4899',
  // المزيد
  '#0891b2','#8b5cf6','#ef4444','#10b981','#f59e0b','#6366f1','#ec4899','#14b8a6',
  '#dc2626','#ea580c','#d97706','#ca8a04','#65a30d','#16a34a','#059669','#0d9488',
  '#0284c7','#2563eb','#4f46e5','#7c3aed','#9333ea','#c026d3','#db2777','#e11d48',
  '#7f1d1d','#78350f','#365314','#14532d','#164e63','#1e3a8a','#3730a3','#581c87',
];

/* ============================================================
   ✍️ أنماط نبذة موسّعة
   ============================================================ */
const BIO_STYLES_EXTENDED = {
  ...BIO_STYLES,
  highlight:   { label:'مُبرَز',      emoji:'🖍️' },
  quote_box:   { label:'اقتباس صندوق', emoji:'💬' },
  dashed:      { label:'إطار متقطع',  emoji:'▨' },
  gradient:    { label:'تدرج',         emoji:'🌈' },
  typewriter:  { label:'آلة كاتبة',   emoji:'⌨️' },
  underline:   { label:'تحته خط',     emoji:'▁' },
  code:        { label:'كود',         emoji:'</>' },
  ribbon:      { label:'شريط',        emoji:'🎀' },
};

/* ============================================================
   🏅 تخصيصات مستوى موسّعة
   ============================================================ */
const LEVEL_BADGE_SHAPES = {
  rounded: { label:'دائري', emoji:'●', style:'border-radius:12px' },
  square:  { label:'مربع',  emoji:'■', style:'border-radius:4px' },
  diamond: { label:'معيّن', emoji:'◆', style:'transform:rotate(45deg)' },
  hexagon: { label:'سداسي', emoji:'⬡', style:'clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' },
  star:    { label:'نجمة',  emoji:'⭐', style:'clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' },
};

const LEVEL_BAR_STYLES = {
  solid:    { label:'صلب' },
  gradient: { label:'تدرج' },
  striped:  { label:'مخطط' },
  animated: { label:'متحرك' },
  glow:     { label:'متوهج' },
  dots:     { label:'نقاط' },
};

/* ============================================================
   🃏 أنماط بطاقة موسّعة
   ============================================================ */
const CARD_CORNERS = {
  sharp:   { label:'حاد',      value: 0 },
  slight:  { label:'خفيف',     value: 8 },
  rounded: { label:'دائري',    value: 18 },
  pill:    { label:'كبسولة',   value: 32 },
  super:   { label:'فائق',     value: 44 },
};

const CARD_BORDER_STYLES = {
  none:   { label:'بدون',   css:'none' },
  solid:  { label:'صلب',    css:'solid' },
  dashed: { label:'متقطع',  css:'dashed' },
  dotted: { label:'منقط',   css:'dotted' },
  double: { label:'مزدوج',  css:'double' },
};

const CARD_HOVER_EFFECTS = {
  none:   { label:'بدون',  emoji:'⬜' },
  lift:   { label:'ارتفاع', emoji:'⬆️' },
  tilt:   { label:'ميلان',  emoji:'↷' },
  scale:  { label:'تكبير',  emoji:'⤢' },
  glow:   { label:'توهج',   emoji:'✨' },
  shake:  { label:'اهتزاز', emoji:'🌪️' },
};

/* ============================================================
   🔤 خطوط النصوص
   ============================================================ */
const TEXT_FONTS = {
  cairo:   { label:'القاهرة',   value:"'Cairo',sans-serif" },
  system:  { label:'نظام',      value:'system-ui,sans-serif' },
  serif:   { label:'Serif',     value:'Georgia,serif' },
  mono:    { label:'Monospace', value:'ui-monospace,monospace' },
  cursive: { label:'مائل',      value:'cursive' },
};

/* ============================================================
   ✍️ تخصيصات التواقيع — جديد
   ============================================================ */
const SIGNATURE_STYLES = {
  plain:     { label: 'عادي',     emoji: '📄' },
  quote:     { label: 'اقتباس',   emoji: '💬' },
  card:      { label: 'بطاقة',    emoji: '🃏' },
  ribbon:    { label: 'شريط',     emoji: '🎀' },
  bubble:    { label: 'فقاعة',    emoji: '💭' },
  glow:      { label: 'متوهج',    emoji: '✨' },
  code:      { label: 'كود',      emoji: '⌨️' },
  underline: { label: 'تحته خط',  emoji: '▁' },
  dashed:    { label: 'متقطع',    emoji: '▨' },
  gradient:  { label: 'تدرج',     emoji: '🌈' },
};

const SIGNATURE_ANIMATIONS = {
  none:       { label: 'بدون',      emoji: '⬜' },
  fade:       { label: 'ظهور',      emoji: '💫' },
  slide:      { label: 'انزلاق',    emoji: '➡️' },
  typewriter: { label: 'آلة كاتبة', emoji: '⌨️' },
  glow:       { label: 'توهج',      emoji: '✨' },
  pulse:      { label: 'نبض',       emoji: '💓' },
  float:      { label: 'طوفان',     emoji: '🎈' },
  bounce:     { label: 'قفز',       emoji: '⬆️' },
};

const SIGNATURE_FONTS = {
  cairo:   { label: 'القاهرة',   value: "'Cairo', sans-serif" },
  cursive: { label: 'مائل',      value: 'cursive' },
  serif:   { label: 'Serif',     value: 'Georgia, serif' },
  mono:    { label: 'Monospace', value: 'ui-monospace, monospace' },
  system:  { label: 'النظام',    value: 'system-ui, sans-serif' },
};

/* ============================================================
   📰 تخصيصات المنشورات — جديد
   ============================================================ */
const POST_CARD_STYLES = {
  default:  { label: 'افتراضي', emoji: '📄' },
  minimal:  { label: 'بسيط',    emoji: '⬜' },
  gradient: { label: 'تدرج',    emoji: '🌈' },
  glass:    { label: 'زجاجي',   emoji: '🔷' },
  bordered: { label: 'محدد',    emoji: '🔲' },
  elevated: { label: 'مرتفع',   emoji: '⬆️' },
  outlined: { label: 'مخطط',    emoji: '✏️' },
};

const POST_LAYOUTS = {
  standard:  { label: 'قياسي' },
  compact:   { label: 'مضغوط' },
  spacious:  { label: 'فسيح' },
  magazine:  { label: 'مجلة' },
};

const POST_AVATAR_SHAPES = {
  circle:   { label: 'دائري',     radius: '50%' },
  rounded:  { label: 'مستدير',    radius: '12px' },
  square:   { label: 'مربع',      radius: '4px' },
  squircle: { label: 'مربع ناعم', radius: '30%' },
};

/* ============================================================
   ✨ إضافات لمناطق موجودة
   ============================================================ */
const EXTRA_NAME_ANIMATIONS = {
  typewriter: { label: 'آلة كاتبة', emoji: '⌨️' },
  blink:      { label: 'وميض',      emoji: '💡' },
  wave:       { label: 'موج',       emoji: '🌊' },
  glitch:     { label: 'خلل',       emoji: '⚡' },
};

const EXTRA_AVATAR_DECORATIONS = {
  star_glow:   { label: 'نجمة متوهجة', emoji: '🌟' },
  rainbow_ring:{ label: 'حلقة قزح',    emoji: '🌈' },
  wings:       { label: 'أجنحة',       emoji: '🦋' },
  lightning:   { label: 'برق',         emoji: '⚡' },
  snowflake:   { label: 'ندفة ثلج',    emoji: '❄️' },
  shamrock:    { label: 'برسيم',       emoji: '🍀' },
  skull:       { label: 'جمجمة',       emoji: '💀' },
  music_note:  { label: 'نوتة',        emoji: '🎵' },
};

const EXTRA_AVATAR_FILTERS = {
  cyber:      { label: 'سايبر',   css: 'hue-rotate(180deg) saturate(2)', emoji: '🤖' },
  infrared:   { label: 'أشعة',    css: 'hue-rotate(270deg) saturate(1.8)', emoji: '🔴' },
  matrix:     { label: 'ماتريكس', css: 'hue-rotate(90deg) contrast(1.3)', emoji: '🟢' },
  blueprint:  { label: 'مخطط',    css: 'grayscale(1) brightness(1.2) sepia(1) hue-rotate(180deg)', emoji: '📘' },
  sunset_f:   { label: 'غروب',    css: 'sepia(.5) saturate(1.5) brightness(1.1)', emoji: '🌅' },
};

/* ============================================================
   ✨ حركات دخول البطاقة
   ============================================================ */
const ENTRANCE_ANIMATIONS = {
  none:    { label:'بدون',   emoji:'⬜' },
  fade:    { label:'ظهور',   emoji:'💫' },
  slide_r: { label:'انزلاق يمين', emoji:'➡️' },
  slide_u: { label:'انزلاق أعلى', emoji:'⬆️' },
  zoom:    { label:'تكبير',  emoji:'🔍' },
  flip:    { label:'انقلاب', emoji:'🔄' },
};

/* ============================================================
   💫 تأثيرات البطاقة عند التمرير
   ============================================================ */
const SCROLL_EFFECTS = {
  none:  { label:'بدون',  emoji:'⬜' },
  tilt:  { label:'ميلان', emoji:'↷' },
  float: { label:'طوفان', emoji:'🎈' },
  pulse: { label:'نبض',   emoji:'💓' },
};

/* ============ إطارات لا تظهر في الاشتراكات ============ */
function getFrameTier(frameId){
  return ANIMATED_FRAMES[frameId]?.tier || 'free';
}

/* ============ دوال الاشتراك ============ */
function getSubscription(profile){
  if(!profile) return { plan:'free', expiresAt:null, active:false };
  const sub = profile.subscription || {};
  const plan = sub.plan || 'free';
  const expiresAt = sub.expiresAt?.toDate?.() || null;
  const active = plan !== 'free' && expiresAt && expiresAt > new Date();
  return {
    plan: active ? plan : 'free',
    rawPlan: plan,
    expiresAt,
    active: !!active,
    features: SUBSCRIPTION_PLANS[active ? plan : 'free'].features,
  };
}

function getOwnedItems(profile){
  return profile?.ownedItems || [];
}

/* هل يملك المستخدم إطاراً؟ */
function canUseFrame(profile, frameId){
  const frame = ANIMATED_FRAMES[frameId];
  if(!frame) return false;
  
  /* مجاني للجميع */
  if(frame.tier === 'free') return true;
  
  /* حصري: يجب شراؤه */
  if(frame.tier === 'exclusive'){
    return (profile?.ownedItems || []).includes(`frame_${frameId}`);
  }
  
  /* اشتراك */
  const sub = getSubscription(profile);
  if(frame.tier === 'plus')  return sub.plan === 'plus' || sub.plan === 'plus2';
  if(frame.tier === 'plus2') return sub.plan === 'plus2';
  return false;
}

/* هل يمكنه تغيير لون الاسم؟ */
function canCustomizeNameColor(profile){
  const sub = getSubscription(profile);
  return sub.features.hasNameColor;
}

function canCustomizeUsernameColor(profile){
  const sub = getSubscription(profile);
  return sub.features.hasUsernameColor;
}

function canCustomizeTitleColor(profile){
  const sub = getSubscription(profile);
  return sub.features.hasTitleColor;
}

function canUseMusic(profile){
  return getSubscription(profile).features.hasMusic;
}

function canUseBannerEffect(profile){
  return getSubscription(profile).features.hasBannerEffect;
}

function canUseLayoutCustomization(profile){
  return getSubscription(profile).features.hasLayoutCustomization;
}

function canCustomizeShape(p){ return getSubscription(p).features.canCustomizeShape; }
function canCustomizeBorder(p){ return getSubscription(p).features.canCustomizeBorder; }
function canCustomizeTheme(p){ return getSubscription(p).features.canCustomizeTheme; }

/* ============ حظر ============ */
const BAN_REASONS = [
  'سلوك مسيء', 'سبام متكرر', 'محتوى غير لائق',
  'انتحال هوية', 'غش في الألعاب', 'مخالفة الشروط',
];
const AVATAR_GRADS = [
  'linear-gradient(135deg,#6c5ce7,#00d2ff)','linear-gradient(135deg,#ff3d71,#f5b301)',
  'linear-gradient(135deg,#00d2ff,#22c55e)','linear-gradient(135deg,#a78bfa,#ff3d71)',
  'linear-gradient(135deg,#22c55e,#00d2ff)','linear-gradient(135deg,#f5b301,#ff3d71)',
  'linear-gradient(135deg,#ff8a00,#f5b301)','linear-gradient(135deg,#818cf8,#6c5ce7)',
];
function pickGrad(seed=''){ let h=0; for(const c of seed) h=(h*31+c.charCodeAt(0))>>>0; return AVATAR_GRADS[h % AVATAR_GRADS.length]; }

/* ============ State ============ */
const state = {
  user:null, profile:null,
  page:'home', homeTab:'explore', profileTab:'posts',
  searchQ:'', searchCat:'all', lbTab:'fame',
  activeGame:null, chatWith:null, viewingUid:null,
  viewingTeamId:null,
  liked:{}, saved:{}, profileLiked:{}, followed:new Set(),
  posts:[], users:{}, chats:[], messages:{}, notifs:[], rooms:[], teams:[],
  comments:{},
  settings:{notif:true, sound:false, privateAcc:false, twofa:false, location:true, autoplay:true},
  notifRead:false,
  unsubs:[], chatUnsub:null, mmInterval:null,
  pendingImages:{ avatar:null, cover:null, post:null },
  uploadProgress:{},

  /* ★ الحقول الجديدة — داخل state مباشرة */
  activeMatch: null,
  matchUnsub: null,
  matchChatUnsub: null,
  matchTimer: null,
  matchChat: [],
  teamChat: [],
  teamChatUnsub: null,
  viewingTeamTab: 'info',
  matchInvites: [],
    /* ===== Batch 2 ===== */
  dailyReward: null,
  challenges: [],
  myInventory: [],
  equipped: { frame: null, title: null, badge: null },

    /* ===== Batch 3 ===== */
  activeTournament: null,
  tournamentUnsub: null,
  viewingTournamentId: null,
  viewingWarId: null,
  myAchievements: {},
  activityLog: [],
  activityUnsub: null,
  notifFilter: 'all',
  challengeInProgress: false,

    /* ===== Batch 4 ===== */
  viewingPlayerUid: null,
  adminTab: 'overview',
  bannedUsers: [],
  reports: [],
  seasonInfo: null,
  myGifts: [],
  myGameStats: {},
    /* ★ إصلاحات */
  invTab: 'all',
  giftTab: 'received',
  mmUnsub: null,
  custActiveZone: null,
  _tabsScroll: null,
  lastViewedProfileUid: null,
  navStack: [],   // ★ جديد: مكدس التنقل للرجوع الذكي
  /* ===== إعادة هيكلة التبويبات ===== */
custFieldTab: null,   // ★ جديد: التبويب الثالث (التخصيص الفردي)
};

/* ============ نظام المستويات ============ */
function xpForLevel(level){ return (level - 1) * 500; }
function levelFromXp(xp){ return Math.floor((xp || 0) / 500) + 1; }
function xpProgress(xp){
  const level = levelFromXp(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const current = (xp || 0) - currentLevelXp;
  const needed = nextLevelXp - currentLevelXp;
  return {
    level,
    current: Math.floor(current),
    needed,
    pct: Math.min(100, Math.floor((current / needed) * 100))
  };
}

/* ============ Firebase Init ============ */
let auth, db, app;
if (CONFIGURED) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  setPersistence(auth, browserLocalPersistence).catch(()=>{});
}

/* ============ Utils ============ */
function nf(n){ return Number(n||0).toLocaleString('en-US'); }
function esc(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._tm); t._tm = setTimeout(()=>t.classList.remove('show'), 2400);
}
function timeAgo(ts){
  if(!ts) return 'الآن';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const sec = Math.floor((Date.now()-d.getTime())/1000);
  if(sec < 60) return 'الآن';
  if(sec < 3600) return `قبل ${Math.floor(sec/60)} د`;
  if(sec < 86400) return `قبل ${Math.floor(sec/3600)} س`;
  if(sec < 604800) return `قبل ${Math.floor(sec/86400)} ي`;
  return d.toLocaleDateString('ar-SA');
}
function avatar(u, size=44, extra='', square=false, extraStyle=''){
  if(!u) return `<div class="av" style="--s:${size}px;background:#333;${extraStyle}"></div>`;
  // للأحجام الصغيرة استخدم الوضع البسيط
  if(size < 60){
    const init = (u.name||u.displayName||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('');
    const bg = u.grad || pickGrad(u.uid||u.id||u.name||'');
    const img = u.avatarUrl ? `<img src="${esc(u.avatarUrl)}" alt="">` : init;
    return `<div class="av ${square?'sq':''} ${extra}" style="--s:${size}px;background:${bg};${extraStyle}">${img}</div>`;
  }
  // للأحجام الكبيرة، استخدم البناء الكامل
  return buildAvatarFrameHTML(u, size, extra);
}

/* ============ Image Upload System ============ */
/* ضغط أقوى — يستهدف Base64 صغير */
async function compressImage(file, maxDim = 700, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const c = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      c.width = width; c.height = height;
      c.getContext('2d').drawImage(img, 0, 0, width, height);
      c.toBlob(b => {
        if (!b) return reject(new Error('compress failed'));
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(b);
      }, 'image/jpeg', quality);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/* تحويل الصورة إلى Base64 مع ضغط تلقائي متعدد المراحل */
async function imageToBase64(file, type = 'post', onProgress) {
  // حدود مختلفة لكل نوع
  const steps = {
    avatar: [
      { maxDim: 150, quality: 0.55 },  // ~15KB
      { maxDim: 120, quality: 0.45 },  // ~10KB
      { maxDim: 100, quality: 0.35 },  // ~7KB
    ],
    cover: [
      { maxDim: 500, quality: 0.55 },  // ~40KB
      { maxDim: 400, quality: 0.45 },  // ~25KB
      { maxDim: 300, quality: 0.35 },  // ~15KB
    ],
    post: [
      { maxDim: 700, quality: 0.6 },   // ~80KB
      { maxDim: 600, quality: 0.5 },   // ~60KB
      { maxDim: 500, quality: 0.4 },   // ~40KB
    ],
  }[type] || [{ maxDim: 700, quality: 0.6 }];

  onProgress && onProgress(15);

  for (let i = 0; i < steps.length; i++) {
    const { maxDim, quality } = steps[i];
    const base64 = await compressImage(file, maxDim, quality);
    const sizeKB = Math.round(base64.length * 0.75 / 1024);
    console.log(`[${type}] محاولة ${i + 1}: ${sizeKB}KB (${maxDim}px @ ${quality})`);
    
    // حجم مثالي — عُد فوراً
    if (sizeKB < 250) {
      onProgress && onProgress(100);
      return base64;
    }
  }
  
  // حتى أصغر ضغط لم ينجح — ارفض بوضوح
  const finalSize = Math.round((await compressImage(file, steps[steps.length-1].maxDim, steps[steps.length-1].quality)).length * 0.75 / 1024);
  if (finalSize > 900) {
    throw new Error(`الصورة كبيرة جداً (${finalSize}KB) — الحد الأقصى 900KB`);
  }
  throw new Error('الصورة كبيرة جداً، جرّب صورة أقل تفاصيل');
}

function pickImage(type, onPicked) {
  const input = document.getElementById('globalFileInput');
  input.value = '';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = type === 'post' ? 8 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) { toast(`حجم الصورة كبير (الحد ${maxSize/1024/1024}MB)`); return; }
    if (!file.type.startsWith('image/')) { toast('الرجاء اختيار صورة'); return; }
    state.pendingImages[type] = file;
    onPicked(URL.createObjectURL(file), file);
  };
  input.click();
}

/* ============ Notifications Helper ============ */
async function notify(uid, type, text, link = '') {
  if (!uid || uid === state.user.uid) return;
  try {
    await addDoc(collection(db, 'notifications', uid, 'items'), {
      type, text, link, read: false, createdAt: serverTimestamp()
    });
  } catch (e) { console.warn('notify:', e); }
}

/* ============ Navigation ============ */
function go(page, opt={}, skipHistory=false){
  /* ★ أضف الصفحة الحالية للمكدس (لتمكين الرجوع الذكي) */
  if(!skipHistory && state.page && state.page !== page) {
    state.navStack.push(state.page);
    if(state.navStack.length > 20) state.navStack.shift();
  }

  if(state.page === 'customization' && page !== 'customization'){
    state.custActiveZone = null;
    state.custSubTab = null;
  }

  if(state.page === 'messages' && page !== 'messages' && state.chatUnsub){
    try { state.chatUnsub(); } catch(e){}
    state.chatUnsub = null; state.chatWith = null;
  }

  state.lastViewedProfileUid = null;
  state.page = page;
  Object.assign(state, opt);
  closeDrawer();
  window.scrollTo({top:0});
  render();
}

/* ★★ دالة الرجوع الذكية (تدعم الصفحات الفرعية) ★★ */
function goBack(){
  /* حالات خاصة: تفاصيل بطولة أو حرب */
  if(state.page === 'tournaments' && state.viewingTournamentId){
    state.viewingTournamentId = null;
    render();
    return;
  }
  if(state.page === 'war' && state.viewingWarId){
    state.viewingWarId = null;
    render();
    return;
  }

  /* الرجوع العادي عبر المكدس */
  const prev = state.navStack.pop();
  if(prev && prev !== state.page){
    go(prev, {}, true);
  } else {
    go('home', {}, true);
  }
}

/* ============ Bottom Nav ============ */
const NAV = [
  {id:'home', icon:'home', label:'الرئيسية'},
  {id:'messages', icon:'message', label:'الرسائل'},
  {id:'games', icon:'gamepad', label:'الألعاب'},
  {id:'teams', icon:'users', label:'الفرق'},
  {id:'more', icon:'menu', label:'المزيد'},
];

/* ★★ الصفحات الرئيسية التي تحتفظ بالأشرطة ★★ */
const MAIN_PAGES = ['home', 'messages', 'games', 'teams'];
function renderNav(){
  document.getElementById('bottombar').innerHTML = NAV.map(n=>`
    <button class="nav-btn ${state.page===n.id?'active':''}" data-nav="${n.id}">
      ${ic(n.icon)}<span>${n.label}</span>
    </button>`).join('');
}

/* ============================================================
   📄 إعدادات شريط رأس الصفحة لكل صفحة
   ============================================================ */
function getPageHeaderConfig(){
  const page = state.page;
  const cfg = { title: '', actions: '' };

  switch(page){
    case 'profile':
      cfg.title = 'ملفي الشخصي';
      cfg.actions = `
        <button class="page-hbtn" data-action="edit-profile" title="تعديل">
          ${ic('edit','xs')}<span>تعديل</span>
        </button>
        <button class="page-hbtn" data-nav="customization" title="تخصيص">
          ${ic('image','xs')}<span>تخصيص</span>
        </button>
        <button class="page-hbtn" data-action="preview-profile" title="معاينة">
          ${ic('eye','xs')}<span>معاينة</span>
        </button>
      `;
      break;

    case 'userprofile': {
      const on = state.followed.has(state.viewingUid);
      const name = state.users[state.viewingUid]?.name || 'الملف الشخصي';
      cfg.title = name;
      cfg.actions = `
        <button class="page-hbtn ${on?'on':'primary'}" data-follow="${state.viewingUid}">
          ${on ? '✓ متابَع' : '+ متابعة'}
        </button>
        <button class="page-hbtn" data-action="profile-actions" data-uid="${state.viewingUid}" title="خيارات">
          ${ic('dots','xs')}
        </button>
      `;
      break;
    }

    case 'customization':
      cfg.title = '🎨 استوديو التخصيص';
      cfg.actions = `
        <button class="page-hbtn" data-action="preview-full" title="معاينة">
          ${ic('eye','xs')}<span>معاينة</span>
        </button>
        <button class="page-hbtn danger" data-action="reset-all" title="إعادة تعيين">
          ${ic('trash','xs')}<span>إعادة تعيين</span>
        </button>
        <button class="page-hbtn" data-action="show-plans" title="الاشتراكات">💎</button>
      `;
      break;

    case 'tournaments':
      cfg.title = state.viewingTournamentId ? '🏆 البطولة' : '🏆 البطولات';
      if(!state.viewingTournamentId){
        cfg.actions = `
          <button class="page-hbtn primary" data-action="create-tournament">
            ${ic('plus','xs')}<span>إنشاء</span>
          </button>
        `;
      }
      break;

    case 'war':        cfg.title = state.viewingWarId ? '⚔️ الحرب' : '⚔️ الحروب'; break;
    case 'settings':   cfg.title = '⚙️ الإعدادات'; break;
    case 'admin':      cfg.title = '👑 لوحة الإدارة'; break;
    case 'store':      cfg.title = 'المتجر'; break;
    case 'inventory':  cfg.title = '🎒 مقتنياتي'; break;
    case 'season':     cfg.title = '🏆 الموسم'; break;
    case 'gifts':      cfg.title = '🎁 الهدايا'; break;
    case 'activity':   cfg.title = '📋 النشاطات'; break;
    case 'stats':      cfg.title = 'الإحصائيات'; break;
    case 'achievements': cfg.title = '🏅 الإنجازات'; break;
    case 'leaderboard':  cfg.title = 'لوحة الصدارة'; break;
    case 'support':    cfg.title = 'فريق الدعم'; break;
    case 'closefriends': cfg.title = 'المقربون'; break;
    case 'search':     cfg.title = 'البحث'; break;
    case 'notifs':     cfg.title = '🔔 الإشعارات'; break;
    case 'logout':     cfg.title = 'تسجيل الخروج'; break;
    case 'gamestats':  cfg.title = '📊 الإحصائيات'; break;
  }

  return cfg;
}

function renderTopbar(){
  const tbAvatar = document.getElementById('tbAvatar');
  if (!state.profile) {
    // حالة تحميل: دائرة متحركة
    tbAvatar.innerHTML = `<div class="av" style="--s:40px;background:rgba(255,255,255,.08)">
      <span style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite"></span>
    </div>`;
  } else {
    tbAvatar.innerHTML = avatar(state.profile, 40);
  }
  document.querySelectorAll('.tb-left .icon-btn').forEach(b=>{
    const hasUnread = b.dataset.nav === 'notifs' && state.notifs.some(n=>!n.read);
    b.innerHTML = ic(b.dataset.nav === 'search' ? 'search' : 'bell') +
      (hasUnread ? '<span class="dot-badge"></span>' : '');
  });
  updateTopbarCoins();
}

/* ============ Drawer ============ */
const MORE_ITEMS = [
  {id:'closefriends', icon:'heart', label:'المقربون', desc:'أقرب 10 لاعبين'},
  {id:'_daily', icon:'star', label:'المكافأة اليومية', desc:'استلم مكافأتك'},
  {id:'leaderboard', icon:'trophy', label:'لوحة الصدارة', desc:'ترتيب اللاعبين'},
  {id:'tournaments', icon:'trophy', label:'البطولات', desc:'تصفيات ومسابقات'},
  {id:'war', icon:'bolt', label:'الحروب', desc:'حروب الفرق النشطة'},
  {id:'season', icon:'trophy', label:'الموسم', desc:'موسم تنافسي'},
  {id:'settings', icon:'settings', label:'الإعدادات', desc:'تحكم بحسابك'},
  {id:'support', icon:'shield', label:'فريق الدعم', desc:'المشرفون'},
  {id:'admin', icon:'crown', label:'لوحة الإشراف', desc:'للمشرفين فقط', admin:true},
  {id:'logout', icon:'logout', label:'تسجيل الخروج', desc:'الخروج', danger:true},
];
function openDrawer(){
  const p = state.profile || {};
  const d = document.getElementById('drawer');
  d.innerHTML = `
    <div class="drawer-head">
      ${avatar(p, 48)}
      <div style="flex:1;min-width:0">
        <div class="dname">${esc(p.name||'')}</div>
        <div class="duser">@${esc(p.username||'')} · المستوى ${p.level||1}</div>
      </div>
      <button class="icon-btn" data-action="close-drawer">${ic('close','sm')}</button>
    </div>
    <div class="row" style="margin-bottom:14px;padding:0 4px">
      <div class="pill gold">${ic('coin','xs')} ${nf(p.coins)}</div>
      <div class="pill ok">${ic('star','xs')} ${nf(p.fame)}</div>
    </div>
    ${MORE_ITEMS.filter(m=>!m.admin || p.role==='admin').map(m=>`
      <button class="menu-item ${m.danger?'danger':''}" data-nav="${m.id}">
        <span class="mi-ic">${ic(m.icon)}</span>
        <span class="mi-txt">
          <span class="mi-label">${m.label}</span>
          <span class="mi-desc">${m.desc}</span>
        </span>
      </button>`).join('')}
    <div style="text-align:center;padding:18px 0 6px;color:#3d4864;font-size:10.5px;font-weight:700">
      نكسوس · v2.0
    </div>`;
  d.classList.add('open');
  document.getElementById('overlay').classList.add('show');
}
function closeDrawer(){
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

/* ============ Modal ============ */
function openModal(html){
  const root = document.getElementById('modalRoot');
  root.innerHTML = `<div class="modal-wrap"><div class="modal">${html}</div></div>`;
  root.querySelector('.modal-wrap').addEventListener('click', e=>{
    if(e.target.classList.contains('modal-wrap')) closeModal();
  });
}

/* ============ Auth ============ */
function showScreen(id){
  /* ★ loader يُدار منفصلاً بواسطة NexusLoader — لا نلمسه هنا */
  ['setupScreen','authScreen','appShell'].forEach(s=>{
    const el = document.getElementById(s);
    if(el) el.classList.toggle('hidden', s !== id);
  });
}
function showAuthError(msg){ document.getElementById('authError').textContent = msg || ''; }

async function handleSignup(e){
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const username = document.getElementById('signupUser').value.trim().toLowerCase();
  const email = document.getElementById('signupEmail').value.trim();
  const pass = document.getElementById('signupPass').value;
  showAuthError('');
  try {
    const unameSnap = await getDoc(doc(db,'usernames',username));
    if(unameSnap.exists()){ showAuthError('اسم المستخدم محجوز'); return; }
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
await setDoc(doc(db,'users',cred.user.uid), {
  uid: cred.user.uid,
  name,
  username,
  email,
  bio: 'مرحباً، أنا جديد في نكسوس!',
  avatarUrl: '',
  coverUrl: '',
  grad: pickGrad(cred.user.uid),
  teamId: '',
  teamName: '',
  teamEmblem: '',
  level: 1,
  xp: 0,
  fame: 0,
  power: 0,
  support: 0,
  likesProfile: 0,
  likesGames: 0,
  followers: 0,
  following: 0,
  views: 0,
  coins: 1000,
  role: 'user',
  status: 'available',
  statusMsg: '',
  themeId: 'default',
  frameId: 'none',
  equipped: { frame: null, title: null, badge: null },
  settings: { notif: true, sound: false, privateAcc: false, twofa: false, location: true, autoplay: true },
  dailyStreak: 0,
  lastDailyReward: null,
  achievements: {},

  /* ★★★ الحقول الجديدة للسمعة والهيبة ★★★ */
  uniqueViewers:    0,
  trustReceived:    0,
  reportsReceived:  0,
  blocksReceived:   0,
  warningsReceived: 0,
  reputation:       0,
  heba:             0,

  createdAt: serverTimestamp()
});
    await setDoc(doc(db,'usernames',username), { uid: cred.user.uid });
  } catch(err){
    const msgs = {'auth/email-already-in-use':'البريد مستخدم','auth/weak-password':'كلمة المرور ضعيفة','auth/invalid-email':'بريد غير صالح'};
    showAuthError(msgs[err.code] || err.message);
  }
}
async function handleLogin(e){
  e.preventDefault();
  showAuthError('');
  try { await signInWithEmailAndPassword(auth, document.getElementById('loginEmail').value.trim(), document.getElementById('loginPass').value); }
  catch(err){
    const msgs = {'auth/user-not-found':'لا يوجد حساب','auth/wrong-password':'كلمة المرور خاطئة','auth/invalid-credential':'بيانات غير صحيحة'};
    showAuthError(msgs[err.code] || err.message);
  }
}
async function handleGoogle(){
  showAuthError('');
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const userRef = doc(db,'users',cred.user.uid);
    const snap = await getDoc(userRef);
    if(!snap.exists()){
      const base = (cred.user.email||'user').split('@')[0].replace(/[^a-z0-9]/gi,'').toLowerCase();
      const username = base + Math.floor(Math.random()*1000);
await setDoc(userRef, {
  uid: cred.user.uid,
  name: cred.user.displayName || 'مستخدم',
  username,
  email: cred.user.email,
  bio: 'مرحباً!',
  avatarUrl: cred.user.photoURL || '',
  coverUrl: '',
  grad: pickGrad(cred.user.uid),
  teamId: '',
  teamName: '',
  teamEmblem: '',
  level: 1,
  xp: 0,
  fame: 0,
  power: 0,
  support: 0,
  likesProfile: 0,
  likesGames: 0,
  followers: 0,
  following: 0,
  views: 0,
  coins: 1000,
  role: 'user',
  status: 'available',
  statusMsg: '',
  themeId: 'default',
  frameId: 'none',
  equipped: { frame: null, title: null, badge: null },
  settings: { notif: true, sound: false, privateAcc: false, twofa: false, location: true, autoplay: true },
  dailyStreak: 0,
  lastDailyReward: null,
  achievements: {},

  /* ★★★ الحقول الجديدة ★★★ */
  uniqueViewers:    0,
  trustReceived:    0,
  reportsReceived:  0,
  blocksReceived:   0,
  warningsReceived: 0,
  reputation:       0,
  heba:             0,

  createdAt: serverTimestamp()
});
      await setDoc(doc(db,'usernames',username), { uid: cred.user.uid });
    }
  } catch(err){ showAuthError(err.message); }
}
async function handleLogout(){
  if(!confirm('هل تريد تسجيل الخروج؟')) return;
  await signOut(auth);
}

/* ============ Auth State ============ */
if (CONFIGURED) {
onAuthStateChanged(auth, async (user) => {
  if(user){
    state.user = user;
    showScreen('appShell');

    // ★ تقدّم 20%: بدأ تحميل الملف
    window.NexusLoader?.setProgress?.(20);

    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        state.profile = snap.data();
      } else {
        console.warn('User document missing, creating placeholder...');
console.warn('User document missing, creating placeholder...');
await setDoc(doc(db, 'users', user.uid), {
  uid: user.uid,
  name: user.displayName || 'مستخدم',
  username: (user.email || 'user').split('@')[0].toLowerCase().replace(/[^a-z0-9]/g,'') + Math.floor(Math.random()*1000),
  email: user.email || '',
  bio: 'مرحباً!',
  avatarUrl: '', coverUrl: '',
  grad: pickGrad(user.uid),
  teamId: '', teamName: '', teamEmblem: '',
  level: 1, xp: 0, fame: 0, power: 0, support: 0,
  likesProfile: 0, likesGames: 0,
  followers: 0, following: 0,
  views: 0,
  coins: 1000, role: 'user',

  /* ★★★ الحقول الجديدة ★★★ */
  uniqueViewers:    0,
  trustReceived:    0,
  reportsReceived:  0,
  blocksReceived:   0,
  warningsReceived: 0,
  reputation:       0,
  heba:             0,

  createdAt: serverTimestamp()
});
        const snap2 = await getDoc(doc(db, 'users', user.uid));
        if (snap2.exists()) state.profile = snap2.data();
      }
    } catch (e) {
      console.error('Initial profile load failed:', e);
    }

    // ★★★ [الموقع رقم 1] بعد تحميل الملف الشخصي ★★★
    window.NexusLoader?.setProgress?.(40);

    // الآن أنشئ المستمعين
    attachListeners();

    // ★★★ [الموقع رقم 2] بعد attachListeners ★★★
    window.NexusLoader?.setProgress?.(75);

    // ★ الإصلاح الأساسي: اعرض الصفحة فوراً
    render();

    // ★★★ انتظر 1.2 ثانية حتى تصل بيانات onSnapshot قبل إغلاق الشاشة ★★★
    setTimeout(() => window.NexusLoader?.finish?.(), 1200);

    // ★ حمل الموسم
    setTimeout(loadSeasonInfo, 500);
    // افحص وجود مباراة نشطة
    setTimeout(checkActiveMatch, 2000);
    // ★ افحص المكافأة اليومية وأظهرها
    setTimeout(async ()=>{
      await checkDailyReward();
      if(state.dailyReward?.available){
        setTimeout(openDailyRewardModal, 1500);
      }
    }, 1000);

  } else {
    state.user = null;
    state.profile = null;
    detachListeners();
    showScreen('authScreen');

    // ★★★ حالة عدم تسجيل الدخول — إغلاق شاشة التحميل ★★★
    window.NexusLoader?.finish?.();
  }
});
} else {
  showScreen('setupScreen');
}

/* ============ Listeners ============ */
function detachListeners(){
  state.unsubs.forEach(u=>{ try{u();}catch(e){} });
  state.unsubs = [];
  ['chatUnsub','matchUnsub','matchChatUnsub','teamChatUnsub','activityUnsub','tournamentUnsub','mmUnsub']
    .forEach(k=>{ if(state[k]){ try{state[k]();}catch(e){} state[k]=null; } });
  if(state.matchTimer){ clearInterval(state.matchTimer); state.matchTimer = null; }
  if(state.mmInterval && typeof state.mmInterval === 'number'){
    clearInterval(state.mmInterval);
  }
  state.mmInterval = null;
}

function closeModal(){
  const root = document.getElementById('modalRoot');
  // نظّف المستمع إن وُجد
  if(state.mmUnsub){ try{state.mmUnsub();}catch(e){} state.mmUnsub = null; }
  if(state.mmInterval){
    if(typeof state.mmInterval === 'function'){ try{state.mmInterval();}catch(e){} }
    else clearInterval(state.mmInterval);
    state.mmInterval = null;
  }
  state.pendingImages = { avatar:null, cover:null, post:null };
  root.innerHTML = '';
}

function attachListeners(){
  detachListeners();

state.unsubs.push(onSnapshot(
  doc(db, 'users', state.user.uid),
  snap => {
    if (snap.exists()) {
      state.profile = snap.data();
      updateTopbarCoins();
      renderTopbar();
if (['profile','stats','settings','userprofile','customization'].includes(state.page)) render();
    } else {
      console.warn('Profile document disappeared');
    }
  },
  err => {
    console.error('Profile snapshot error:', err);
    // محاولة getDoc كخطة بديلة
    getDoc(doc(db, 'users', state.user.uid)).then(s => {
      if (s.exists()) {
        state.profile = s.data();
        renderTopbar();
        render();
      }
    }).catch(e => console.error('getDoc fallback failed:', e));
  }
));

state.unsubs.push(onSnapshot(
  query(collection(db,'posts'), orderBy('createdAt','desc'), limit(50)),
  snap => {
    state.posts = snap.docs
      .map(d => ({id: d.id, ...d.data()}))
      .filter(p => !p.reblogOf);   /* ★ إخفاء إعادة النشر القديمة */
    if (['home','profile','userprofile'].includes(state.page)) render();
  },
  err => console.error('Posts snapshot error:', err)
));

state.unsubs.push(onSnapshot(
  collection(db,'users'),
  snap => {
    const map = {};
    snap.docs.forEach(d => { map[d.id] = d.data(); });
    state.users = map;
    const affected = ['home','leaderboard','closefriends','userprofile','teams','team'];
    if (affected.includes(state.page)) render();
  },
  err => console.error('Users snapshot error:', err)
));

  state.unsubs.push(onSnapshot(
    query(collection(db,'follows'), where('followerId','==',state.user.uid)),
    snap=>{
      state.followed = new Set(snap.docs.map(d=>d.data().followingId));
      if(['home','userprofile'].includes(state.page)) render();
    }
  ));

  state.unsubs.push(onSnapshot(
    query(collection(db,'postLikes'), where('uid','==',state.user.uid)),
    snap=>{
      state.liked = {};
      snap.docs.forEach(d=>{ state.liked[d.data().postId] = true; });
      if(state.page==='home') render();
    }
  ));

  state.unsubs.push(onSnapshot(
    query(collection(db,'profileLikes'), where('from','==',state.user.uid)),
    snap=>{
      state.profileLiked = {};
      snap.docs.forEach(d=>{ state.profileLiked[d.data().to] = true; });
      if(state.page==='userprofile') render();
    }
  ));

  state.unsubs.push(onSnapshot(
    query(collection(db,'saves'), where('uid','==',state.user.uid)),
    snap=>{
      state.saved = {};
      snap.docs.forEach(d=>{ state.saved[d.data().postId] = true; });
    }
  ));

  state.unsubs.push(onSnapshot(
    query(collection(db,'chats'), where('participants','array-contains',state.user.uid)),
    snap=>{
      state.chats = snap.docs.map(d=>({id:d.id, ...d.data()}))
        .sort((a,b)=>(b.lastTime?.seconds||0)-(a.lastTime?.seconds||0));
      if(state.page==='messages' && !state.chatWith) render();
    }
  ));

  state.unsubs.push(onSnapshot(
    query(collection(db,'notifications',state.user.uid,'items'), orderBy('createdAt','desc'), limit(50)),
    snap=>{
      state.notifs = snap.docs.map(d=>({id:d.id, ...d.data()}));
      if(state.notifs.some(n=>!n.read) && state.page !== 'notifs') state.notifRead = false;
      renderTopbar();
      if(state.page==='notifs') render();
    }
  ));

  state.unsubs.push(onSnapshot(collection(db,'rooms'), snap=>{
    state.rooms = snap.docs.map(d=>({id:d.id, ...d.data()}));
    if(state.page==='games' && state.activeGame) render();
  }));

  state.unsubs.push(onSnapshot(collection(db,'teams'), snap=>{
    state.teams = snap.docs.map(d=>({id:d.id, ...d.data()}))
      .sort((a,b)=>(b.points||0)-(a.points||0));
    if(['teams','team'].includes(state.page)) render();
  }));
  subscribeToActivity();
}

/* ============ Likes / Follow / Save ============ */
async function toggleLike(postId){
  const ref = doc(db,'posts',postId);
  const likeRef = doc(db,'postLikes',`${state.user.uid}_${postId}`);
  try {
    const postSnap = await getDoc(ref);
    const authorId = postSnap.exists() ? postSnap.data().authorId : null;
    await runTransaction(db, async tx=>{
      const s = await tx.get(likeRef);
      if(s.exists()){
        tx.delete(likeRef);
        tx.update(ref, { likes: increment(-1) });
      } else {
        tx.set(likeRef, { uid: state.user.uid, postId, createdAt: serverTimestamp() });
        tx.update(ref, { likes: increment(1) });
      }
    });
    if(!state.liked[postId] && authorId){
      await notify(authorId, 'like', `<b>${esc(state.profile.name)}</b> أعجبه منشورك`);
    }
  } catch(e){ toast('تعذّر تحديث الإعجاب'); }
}

async function toggleSave(postId){
  const saveRef = doc(db,'saves',`${state.user.uid}_${postId}`);
  const snap = await getDoc(saveRef);
  if(snap.exists()){ await deleteDoc(saveRef); toast('تم إزالة الحفظ'); }
  else { await setDoc(saveRef, { uid: state.user.uid, postId, createdAt: serverTimestamp() }); toast('تم الحفظ ✓'); }
  if(state.page==='profile') render();
}

async function toggleFollow(targetId){
  const followId  = `${state.user.uid}_${targetId}`;
  const followRef = doc(db, 'follows', followId);
  const snap = await getDoc(followRef);

  try {
    if(snap.exists()){
      await deleteDoc(followRef);
      await updateDoc(doc(db, 'users', state.user.uid), { following: increment(-1) });
      await updateDoc(doc(db, 'users', targetId), {
        followers:  increment(-1),
        reputation: increment(-REPUTATION_WEIGHTS.follower),
      });
    } else {
      await setDoc(followRef, {
        followerId:  state.user.uid,
        followingId: targetId,
        createdAt:   serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', state.user.uid), { following: increment(1) });
      await updateDoc(doc(db, 'users', targetId), {
        followers:  increment(1),
        reputation: increment(REPUTATION_WEIGHTS.follower),
      });
      await notify(targetId, 'follow', `<b>${esc(state.profile.name)}</b> بدأ متابعتك`);
    }
  } catch(e){
    toast('تعذّر التحديث');
  }
}

async function toggleProfileLike(targetUid){
  if(targetUid === state.user.uid) return toast('لا يمكنك إعجاب ملفك');

  const likeRef = doc(db, 'profileLikes', `${state.user.uid}_${targetUid}`);
  const snap = await getDoc(likeRef);

  /* ★ الإعجاب نهائي — إذا وُجد، لا يمكن إزالته */
  if(snap.exists()){
    return toast('أعجبت بهذا الملف مسبقاً — الإعجاب نهائي');
  }

  try {
    await setDoc(likeRef, {
      from:      state.user.uid,
      to:        targetUid,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'users', targetUid), {
      likesProfile: increment(1),
      fame:         increment(10),
      reputation:   increment(REPUTATION_WEIGHTS.profileLike),
    });

    await notify(targetUid, 'like',
      `<b>${esc(state.profile.name)}</b> أعجبه ملفك الشخصي`);
    toast('تم إعجاب الملف ✓ (نهائي)');
  } catch(e){
    console.error(e);
    toast('تعذّر التحديث');
  }
}

/* ============================================================
   🤝 نظام الثقة
   ============================================================ */
async function toggleTrust(targetUid){
  if(targetUid === state.user.uid) return toast('لا يمكنك الثقة بنفسك');

  const trustId  = `${state.user.uid}_${targetUid}`;
  const trustRef = doc(db, 'trusts', trustId);
  const snap     = await getDoc(trustRef);

  try {
    if(snap.exists()){
      /* ★ إزالة الثقة */
      await deleteDoc(trustRef);
      await updateDoc(doc(db, 'users', targetUid), {
        trustReceived: increment(-1),
        reputation:    increment(-REPUTATION_WEIGHTS.trust),
      });
      toast('تم سحب الثقة');
    } else {
      /* ★ إضافة الثقة */
      await setDoc(trustRef, {
        from:      state.user.uid,
        to:        targetUid,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', targetUid), {
        trustReceived: increment(1),
        reputation:    increment(REPUTATION_WEIGHTS.trust),
      });
      await notify(targetUid, 'trust',
        `<b>${esc(state.profile.name)}</b> منحك ثقته 🤝`);
      toast('تم منح الثقة ✓');
    }
  } catch(e){
    console.error(e);
    toast('فشل تحديث الثقة');
  }
}

async function sendSupport(targetUid){
  if(targetUid === state.user.uid) return toast('لا يمكنك دعم نفسك');
  const today = new Date().toISOString().split('T')[0];
  const supportId = `${state.user.uid}_${targetUid}_${today}`;
  const supportRef = doc(db,'supports',supportId);
  const snap = await getDoc(supportRef);
  if(snap.exists()) return toast('دعمت هذا اللاعب اليوم بالفعل');
  try {
    await setDoc(supportRef, { from: state.user.uid, to: targetUid, date: today, createdAt: serverTimestamp() });
await updateDoc(doc(db,'users',targetUid), {
  support: increment(10),
  fame: increment(10)   // ★ جديد
});
    await notify(targetUid, 'support', `<b>${esc(state.profile.name)}</b> أرسل لك 10 نقاط دعم`);
    toast('تم إرسال 10 نقاط دعم ✓');
  } catch(e){ toast('فشل الدعم'); }
}

/* ============ Comments ============ */
async function loadComments(postId){
  try {
    const q = query(collection(db,'posts',postId,'comments'), orderBy('createdAt','asc'), limit(100));
    const snap = await getDocs(q);
    state.comments[postId] = snap.docs.map(d=>({id:d.id, ...d.data()}));
  } catch(e){ state.comments[postId] = []; }
}

async function addComment(postId, text){
  if(!text.trim()) return;
  try {
    const postSnap = await getDoc(doc(db,'posts',postId));
    const postData = postSnap.exists() ? postSnap.data() : null;
    await addDoc(collection(db,'posts',postId,'comments'), {
      authorId: state.user.uid,
      author: {
        name: state.profile.name,
        username: state.profile.username,
        avatarUrl: state.profile.avatarUrl || '',
        grad: state.profile.grad || pickGrad(state.user.uid)
      },
      text, createdAt: serverTimestamp()
    });
    await updateDoc(doc(db,'posts',postId), { comments: increment(1) });
    if(postData && postData.authorId !== state.user.uid){
      await notify(postData.authorId, 'comment', `<b>${esc(state.profile.name)}</b> علّق على منشورك`);
    }
    await loadComments(postId);
  } catch(e){ toast('فشل إضافة التعليق'); }
}

async function deleteComment(postId, commentId){
  if(!confirm('حذف هذا التعليق؟')) return;
  try {
    await deleteDoc(doc(db,'posts',postId,'comments',commentId));
    await updateDoc(doc(db,'posts',postId), { comments: increment(-1) });
    await loadComments(postId);
    render();
  } catch(e){ toast('فشل الحذف'); }
}

async function openCommentsModal(postId){
  await loadComments(postId);
  const post = state.posts.find(p=>p.id===postId);
  const comments = state.comments[postId] || [];
  openModal(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <h3 style="margin:0">التعليقات (${comments.length})</h3>
      <button class="icon-btn" data-action="modal-close">${ic('close','sm')}</button>
    </div>
    <div style="max-height:55vh;overflow-y:auto;padding-inline-end:4px" id="commentsList">
      ${comments.length ? comments.map(c=>`
        <div class="comment-item">
          ${avatar(c.author, 36)}
          <div class="comment-body">
            <div class="comment-name">${esc(c.author?.name||'')} <span class="comment-time">${timeAgo(c.createdAt)}</span></div>
            <div class="comment-text">${esc(c.text)}</div>
          </div>

          <!-- ★ زر الحذف (لصاحب التعليق) -->
          ${c.authorId === state.user.uid
            ? `<button class="icon-btn" style="width:28px;height:28px;background:transparent;border:0;color:var(--muted)" data-delete-comment="${c.id}" data-post-id="${postId}">${ic('trash','xs')}</button>`
            : ''}

          <!-- ★ زر الإبلاغ (لغير صاحب التعليق) -->
          ${c.authorId !== state.user.uid
            ? `<button class="icon-btn" style="width:28px;height:28px;background:transparent;border:0;color:var(--muted)"
                       data-report-target="${postId}::${c.id}"
                       data-report-type="comment"
                       title="إبلاغ">
                 ${ic('dots','xs')}
               </button>`
            : ''}
        </div>`).join('') : `<div class="empty" style="padding:30px 0">${ic('comment')}<div>لا تعليقات بعد — كن الأول</div></div>`}
    </div>
    <div class="comment-input-wrap">
      ${avatar(state.profile, 36)}
      <input class="input" id="commentInput" placeholder="أضف تعليقاً…" style="flex:1" autocomplete="off">
      <button class="btn btn-primary" style="padding:10px 14px" id="sendCommentBtn" data-post-id="${postId}">${ic('send','sm')}</button>
    </div>`);
}

/* ============ Create Post ============ */
async function createPost(data){
  const btn = document.getElementById('submitPost');
  if(btn) btn.disabled = true;
  try {
    let mediaUrl = '';
    if(state.pendingImages.post){
      const prog = document.getElementById('postUploadProgress');
      if(prog) prog.classList.add('active');
      try {
        mediaUrl = await imageToBase64(state.pendingImages.post, 'post', p => {
          const bar = prog?.querySelector('span');
          if(bar) bar.style.width = p + '%';
        });
      } catch(e) {
        toast(e.message || 'فشل رفع الصورة');
        if(btn) btn.disabled = false;
        return;
      }
    }
    setTimeout(checkAchievements, 500);
await addDoc(collection(db,'posts'), {
  authorId: state.user.uid,
      author: {
        name: state.profile.name,
        username: state.profile.username,
        avatarUrl: state.profile.avatarUrl || '',
        grad: state.profile.grad || pickGrad(state.user.uid)
      },
  text: data.text,
  media: mediaUrl,
  place: data.place || '',
  likes: 0, comments: 0, reblogs: 0,
  rebloggedBy: [],       /* ★ جديد */
  visibility: 'public',
  pinned: false,
  createdAt: serverTimestamp()
});
    closeModal();
    toast('تم النشر ✓');
  } catch(e){
    console.error(e);
    toast('فشل النشر: ' + (e.message || ''));
    if(btn) btn.disabled = false;
  }
}

async function deletePost(postId){
  if(!confirm('حذف هذا المنشور؟')) return;
  try {
    await deleteDoc(doc(db,'posts',postId));
    toast('تم الحذف');
  } catch(e){ toast('فشل الحذف'); }
}

/* ============ Chat ============ */
async function sendMessage(chatId, text){
  await addDoc(collection(db,'chats',chatId,'messages'), {
    senderId: state.user.uid, text, createdAt: serverTimestamp()
  });
  await updateDoc(doc(db,'chats',chatId), {
    lastMessage: text, lastSender: state.user.uid, lastTime: serverTimestamp()
  });
}

async function openOrCreateChat(otherUid){
  const chatId = [state.user.uid, otherUid].sort().join('_');
  const chatRef = doc(db,'chats',chatId);
  const snap = await getDoc(chatRef);
  if(!snap.exists()){
    await setDoc(chatRef, {
      participants: [state.user.uid, otherUid],
      lastMessage: 'بداية المحادثة', lastSender: state.user.uid,
      lastTime: serverTimestamp(), createdAt: serverTimestamp()
    });
  }
  return chatId;
}

async function openChat(uid){
  if(state.chatUnsub){ try{state.chatUnsub();}catch(e){} state.chatUnsub = null; }
  const chatId = await openOrCreateChat(uid);
  state.chatWith = uid;
  go('messages', { chatWith: uid });
  const q = query(collection(db,'chats',chatId,'messages'), orderBy('createdAt','asc'), limit(200));
  state.chatUnsub = onSnapshot(q, snap=>{
    state.messages[chatId] = snap.docs.map(d=>({id:d.id, ...d.data()}));
    renderMessages(chatId);
  });
}

/* ============ Games ============ */
async function startMatchmaking(gameId){
  const g = GAMES.find(x=>x.id===gameId);
  if(!g) return;
  if(gameId !== 'g3') return toast('هذه اللعبة قيد التطوير');

  openModal(`<div class="match-screen">
    <h3>جاري البحث…</h3>
    <div class="sub">${g.name}</div>
    <div class="spinner"></div>
    <div class="muted" id="mmStatus">نبحث عن خصم…</div>
  </div>`);

  try {
    // ابحث عن غرفة quiz عامة في الانتظار
    const q = query(
      collection(db,'rooms'),
      where('gameId','==',gameId),
      where('public','==',true),
      where('status','==','waiting'),
      limit(5)
    );
    const snap = await getDocs(q);
    // اختر غرفة ليست مليئة وليست لغرفتي
    const available = snap.docs.find(d=>{
      const data = d.data();
      return data.hostId !== state.user.uid && (data.players||[]).length < (data.maxPlayers||2);
    });

    if(available){
      const data = available.data();
      const newPlayers = arrayUnion(state.user.uid);
      const willBeFull = (data.players||[]).length + 1 >= (data.maxPlayers||2);
      await updateDoc(available.ref, { players: newPlayers });
      closeModal();
      // إذا امتلأت — ابدأ المباراة
      if(willBeFull){
        await startQuizMatch(available.id, false);
      } else {
        // انتظر — قد تنضم غرفة أخرى
        state.activeMatch = { roomId: available.id };
        toast('انضممت — بانتظار خصم');
        subscribeToMatch(available.id);
      }
      return;
    }

    // أنشئ غرفة جديدة
    const newRoom = await addDoc(collection(db,'rooms'), {
      gameId, hostId: state.user.uid, name: 'مباراة سريعة',
      players: [state.user.uid], maxPlayers: 2, mode: '1v1',
      public: true, status: 'waiting', createdAt: serverTimestamp(),
      scores: {}, answers: {}
    });

    const mmEl = document.getElementById('mmStatus');
    if(mmEl) mmEl.textContent = 'غرفتك جاهزة — انتظر خصماً…';

    // استمع للغرفة — عندما ينضم لاعب — ابدأ
    let started = false;
    const unsub = onSnapshot(doc(db,'rooms',newRoom.id), snap2=>{
      if(!snap2.exists()) return;
      const d = snap2.data();
      if(!started && (d.players||[]).length >= 2 && d.status === 'waiting'){
        started = true;
        try { unsub(); } catch(e){}
        closeModal();
        startQuizMatch(newRoom.id, true);
      }
    });
    // احفظ مرجع لإلغاء الاستماع
    state.mmInterval = { unsub }; // إعادة استخدام الحقل
  } catch(e){
    console.error(e);
    toast('خطأ: ' + (e.message||''));
    closeModal();
  }
}

async function createRoom(gameId){
  const isQuiz = gameId === 'g3';
  openModal(`
    <h3>إنشاء غرفة${isQuiz?' Quiz Clash':''}</h3>
    <div class="sub">غرفة عامة أو خاصة</div>
    <div class="field"><label>اسم الغرفة</label><input class="input" id="rName" placeholder="مثال: تحدي المساء" maxlength="40"></div>
    <div class="field"><label>النوع</label>
      <select class="input" id="rType"><option value="public">🌐 عامة</option><option value="private">🔒 خاصة</option></select>
    </div>
    ${isQuiz ? '' : `<div class="field"><label>عدد اللاعبين</label>
      <select class="input" id="rMax"><option>2</option><option>4</option><option>8</option><option>10</option></select></div>`}
    ${isQuiz ? `<input type="hidden" id="rMax" value="2">` : ''}
    <div class="field"><label>كلمة المرور (اختياري)</label>
      <input class="input" id="rPassword" placeholder="اتركها فارغة للغرف العامة" maxlength="20"></div>
    <div class="row" style="margin-top:16px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" data-create-room="${gameId}">إنشاء</button>
    </div>`);
}

async function confirmCreateRoom(gameId){
  const name = document.getElementById('rName').value.trim() || 'غرفة بدون اسم';
  const pub = document.getElementById('rType').value === 'public';
  const max = parseInt(document.getElementById('rMax').value);
  const pwd = document.getElementById('rPassword')?.value.trim() || '';
  try {
    await addDoc(collection(db,'rooms'), {
      gameId, hostId: state.user.uid, name,
      players: [state.user.uid], maxPlayers: max,
      mode: max===2?'1v1':'فرق', public: pub,
      password: pwd || null,
      status: 'waiting', createdAt: serverTimestamp(),
      scores: {}, answers: {}
    });
    closeModal(); toast('تم إنشاء الغرفة ✓');
  } catch(e){ toast('فشل الإنشاء'); }
}

async function joinRoom(roomId){
  try {
    const roomRef = doc(db,'rooms',roomId);
    const snap = await getDoc(roomRef);
    if(!snap.exists()) return toast('الغرفة غير موجودة');
    const data = snap.data();
    const players = data.players || [];
    if(players.length >= (data.maxPlayers||2)) return toast('الغرفة ممتلئة');
    if(players.includes(state.user.uid)) return toast('أنت بالفعل في الغرفة');

    // إذا كانت Quiz → استخدم مسار اللعبة الصحيح
    if(data.gameId === 'g3'){
      await updateDoc(roomRef, { players: arrayUnion(state.user.uid) });
      await startQuizMatch(roomId, false);
      return;
    }

    await updateDoc(roomRef, { players: arrayUnion(state.user.uid) });
    toast('انضممت للغرفة ✓');
  } catch(e){ toast('تعذّر الانضمام'); }
}

async function checkActiveMatch(){
  try {
    const snap = await getDocs(query(
      collection(db,'rooms'),
      where('players','array-contains',state.user.uid)
    ));
    const active = snap.docs.find(d=>{
      const data = d.data();
      return data.gameId === 'g3' && (data.status === 'waiting' || data.status === 'playing');
    });
    if(!active){
      document.getElementById('resumeBanner')?.classList.add('hidden');
      return;
    }

    const data = active.data();
    const isHost = data.hostId === state.user.uid;

    if(data.status === 'playing'){
      subscribeToMatch(active.id);
      return;
    }

    const banner = document.getElementById('resumeBanner');
    const text = document.getElementById('resumeBannerText');
    if(banner && text){
      text.textContent = `Quiz Clash · ${(data.players||[]).length}/2 لاعب`;
      banner.classList.remove('hidden');
      document.getElementById('resumeMatchBtn').onclick = ()=> startQuizMatch(active.id, isHost);
      document.getElementById('leaveMatchBtn').onclick = async ()=>{
        try { await updateDoc(active.ref, { players: arrayRemove(state.user.uid) }); } catch(e){}
        banner.classList.add('hidden');
        toast('غادرت المباراة');
      };
    }
  } catch(e){ console.error(e); }
}

async function leaveRoom(roomId){
  try {
    await updateDoc(doc(db,'rooms',roomId), {
      players: arrayRemove(state.user.uid), status: 'waiting'
    });
    toast('تم إلغاء الغرفة');
  } catch(e){ toast('تعذّر الإلغاء'); }
}

/* ============ Teams ============ */
async function createTeam(name, emblem, desc){
  try {
    const teamRef = await addDoc(collection(db,'teams'), {
      name, emblem: emblem || '🛡️', description: desc,
      leaderId: state.user.uid,
      members: [state.user.uid],
      points: 0, level: 1, createdAt: serverTimestamp()
    });
    await updateDoc(doc(db,'users',state.user.uid), {
      teamId: teamRef.id, teamName: name, teamEmblem: emblem || '🛡️'
    });
    toast('تم إنشاء الفريق ✓');
    setTimeout(checkAchievements, 500);
    return teamRef.id;
  } catch(e){ toast('فشل الإنشاء'); throw e; }
}

async function joinTeam(teamId){
  if(state.profile.teamId) return toast('أنت بالفعل في فريق');
  try {
    const teamRef = doc(db,'teams',teamId);
    await updateDoc(teamRef, { members: arrayUnion(state.user.uid) });
    const teamSnap = await getDoc(teamRef);
    if(teamSnap.exists()){
      const t = teamSnap.data();
      await updateDoc(doc(db,'users',state.user.uid), {
        teamId, teamName: t.name, teamEmblem: t.emblem || '🛡️'
      });
    }
    toast('انضممت للفريق ✓');
  } catch(e){ toast('فشل الانضمام'); }
}

async function leaveTeam(){
  const tid = state.profile.teamId;
  if(!tid) return toast('لست في فريق');
  if(!confirm('مغادرة الفريق؟')) return;
  try {
    await updateDoc(doc(db,'teams',tid), { members: arrayRemove(state.user.uid) });
    await updateDoc(doc(db,'users',state.user.uid), {
      teamId:'', teamName:'', teamEmblem:''
    });
    toast('غادرت الفريق');
  } catch(e){ toast('فشل المغادرة'); }
}

/* ============ Store ============ */
async function buyItem(item){
  if(!state.profile) return;
  if((state.profile.coins || 0) < item.price) return toast('رصيد غير كافٍ');
  try {
    await runTransaction(db, async tx => {
      const userRef = doc(db, 'users', state.user.uid);
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists()) throw new Error('no user');
      const current = userSnap.data().coins || 0;
      if (current < item.price) throw new Error('insufficient');
      tx.update(userRef, { coins: current - item.price });
      const invRef = doc(collection(db, 'users', state.user.uid, 'inventory'));
      tx.set(invRef, {
        itemId: item.id, name: item.name, emoji: item.emoji,
        price: item.price, purchasedAt: serverTimestamp()
      });
    });
    toast(`تم شراء ${item.name} ✓`);
  } catch (e) {
    toast(e.message === 'insufficient' ? 'رصيد غير كافٍ' : 'فشل الشراء');
  }
}

/* ============================================================
   🎁 مكافآت الدخول اليومي
   ============================================================ */
async function checkDailyReward(){
  if(!state.profile) return;
  const p = state.profile;
  const last = p.lastDailyReward?.toDate?.() || null;
  const streak = p.dailyStreak || 0;
  const today = new Date(); today.setHours(0,0,0,0);

  if(!last){
    state.dailyReward = { available: true, nextDay: 1, streak: 0, reset: true };
    return;
  }

  const lastDay = new Date(last); lastDay.setHours(0,0,0,0);
  const daysDiff = Math.round((today - lastDay) / (1000*60*60*24));

  if(daysDiff === 0){
    state.dailyReward = { available: false, nextDay: Math.min(streak+1, 7), streak };
  } else if(daysDiff === 1){
    state.dailyReward = { available: true, nextDay: Math.min(streak+1, 7), streak };
  } else {
    state.dailyReward = { available: true, nextDay: 1, streak: 0, reset: true };
  }
}

async function claimDailyReward(){
  if(!state.dailyReward?.available) return toast('لا يمكن الاستلام الآن');
  const day = state.dailyReward.nextDay;
  const r = DAILY_REWARDS[day-1];
  try {
    await updateDoc(doc(db,'users',state.user.uid), {
      coins: increment(r.coins),
      xp: increment(r.xp),
      dailyStreak: day,
      lastDailyReward: serverTimestamp(),
    });
    toast(`🎁 حصلت على ${r.coins} عملة + ${r.xp} XP`);
    setTimeout(checkAchievements, 500);
    state.dailyReward = { available: false, nextDay: Math.min(day+1,7), streak: day };
    closeModal();
    render();
  } catch(e){ toast('فشل الاستلام'); }
}

function openDailyRewardModal(){
  const current = state.dailyReward;
  if(!current) return;
  openModal(`
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:44px;margin-bottom:6px">🎁</div>
      <h3 style="margin:0">مكافآت الدخول</h3>
      <div class="sub" style="margin-bottom:0">
        ${current.available ? 'يومك المجاني جاهز!' : 'عد غداً لمكافأة جديدة'}
      </div>
    </div>
    <div class="daily-grid">
      ${DAILY_REWARDS.map((r, i)=>{
        const day = i + 1;
        const isToday = current.available && day === current.nextDay;
        const isClaimed = day < (current.streak || 0) || (!current.available && day <= current.streak);
        const cls = isToday ? 'today' : isClaimed ? 'claimed' : '';
        return `
          <div class="daily-cell ${cls}">
            <div class="dn">يوم ${day}</div>
            <div class="dc">${r.badge || '💰'}</div>
            <div class="dv">${r.coins}</div>
          </div>`;
      }).join('')}
    </div>
    ${current.available ? `
      <button class="btn btn-primary" style="width:100%;margin-top:16px" id="claimDailyBtn">
        ${ic('check','sm')} استلم مكافأة اليوم ${current.nextDay}
      </button>
    ` : `
      <button class="btn btn-ghost" style="width:100%;margin-top:16px" data-action="modal-close">
        حسناً
      </button>
    `}
    <div style="text-align:center;margin-top:12px;font-size:11px;color:var(--muted)">
      🔥 سلسلة حالية: ${current.streak || 0} يوم
    </div>
  `);
}

/* ============================================================
   🟢 حالة اللاعب
   ============================================================ */
async function setPlayerStatus(status, msg){
  try {
    await updateDoc(doc(db,'users',state.user.uid), {
      status,
      statusMsg: (msg || '').slice(0, 60),
    });
    toast('تم تحديث حالتك ✓');
    closeModal();
  } catch(e){ toast('فشل'); }
}

function openStatusPickerModal(){
  const current = state.profile?.status || 'available';
  const msg = state.profile?.statusMsg || '';
  openModal(`
    <h3>حالة اللاعب</h3>
    <div class="sub">اختر حالتك الحالية ورسالة قصيرة</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
      ${Object.entries(PLAYER_STATUSES).map(([k, s])=>`
        <button class="set-row" data-set-status="${k}" style="${current===k?'border-color:'+s.color+';background:'+s.color+'15':''}">
          <div style="width:10px;height:10px;border-radius:50%;background:${s.color}"></div>
          <div class="sr-txt"><div class="sr-n">${s.label}</div></div>
          ${current===k ? ic('check','sm') : ''}
        </button>
      `).join('')}
    </div>
    <div class="field">
      <label>رسالة قصيرة (اختياري)</label>
      <input class="input" id="statusMsgInput" value="${esc(msg)}" maxlength="60" placeholder="مثال: أبحث عن فريق">
    </div>
    <div class="row">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" id="saveStatusBtn">حفظ</button>
    </div>
  `);
  // معالجة الضغط على الحالة
  document.querySelectorAll('[data-set-status]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const s = btn.dataset.setStatus;
      document.querySelectorAll('[data-set-status]').forEach(b=>{
        b.style.borderColor = '';
        b.style.background = '';
      });
      btn.style.borderColor = PLAYER_STATUSES[s].color;
      btn.style.background = PLAYER_STATUSES[s].color + '15';
      document.getElementById('saveStatusBtn').dataset.pendingStatus = s;
    });
  });
  document.getElementById('saveStatusBtn').dataset.pendingStatus = current;
}

/* ============================================================
   🎒 المقتنيات والتجهيز
   ============================================================ */
async function loadMyInventory(){
  try {
    const snap = await getDocs(collection(db,'users',state.user.uid,'inventory'));
    state.myInventory = snap.docs.map(d=>({id:d.id, ...d.data()}));
    return state.myInventory;
  } catch(e){ state.myInventory = []; return []; }
}

async function equipItem(itemId, category){
  try {
    const updates = { [`equipped.${category}`]: itemId };
    await updateDoc(doc(db,'users',state.user.uid), updates);
    toast('تم التجهيز ✓');
    render();
  } catch(e){ toast('فشل'); }
}

async function unequipItem(category){
  try {
    const updates = { [`equipped.${category}`]: null };
    await updateDoc(doc(db,'users',state.user.uid), updates);
    toast('تم الإزالة');
    render();
  } catch(e){ toast('فشل'); }
}

/* ============================================================
   ⚔️ تحديات 1v1
   ============================================================ */
async function sendChallenge(targetUid){
  if(targetUid === state.user.uid) return toast('لا يمكنك تحدي نفسك');
  try {
    const chRef = await addDoc(collection(db,'challenges'), {
      from: state.user.uid,
      fromName: state.profile.name,
      fromAvatar: state.profile.avatarUrl || '',
      to: targetUid,
      gameId: 'g3',
      gameName: 'Quiz Clash',
      status: 'pending',
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 5*60*1000),
    });
    await notify(targetUid, 'challenge', `<b>${esc(state.profile.name)}</b> تحدّاك في Quiz Clash!`, chRef.id);
    toast('تم إرسال التحدي ⚔️');
  } catch(e){ console.error(e); toast('فشل'); }
}

async function openChallengesModal(){
  try {
    const q = query(
      collection(db,'challenges'),
      where('to','==',state.user.uid),
      where('status','==','pending'),
      orderBy('createdAt','desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map(d=>({id:d.id, ...d.data()}))
      .filter(c => {
        const exp = c.expiresAt?.toDate?.() || new Date(0);
        return exp > new Date();
      });
    
    openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <h3 style="margin:0">⚔️ تحديات واردة</h3>
        <button class="icon-btn" data-action="modal-close">${ic('close','sm')}</button>
      </div>
      ${items.length ? items.map(c=>{
        const u = state.users[c.from] || { name: c.fromName };
        return `
          <div class="card" style="margin-bottom:10px;padding:14px">
            <div class="row" style="margin-bottom:10px">
              ${avatar(u, 44)}
              <div style="flex:1;min-width:0">
                <div style="font-size:13.5px;font-weight:800">${esc(u.name)}</div>
                <div class="muted" style="font-size:10.5px">${esc(c.gameName)} · ${timeAgo(c.createdAt)}</div>
              </div>
            </div>
            <div class="row">
              <button class="btn btn-primary" style="flex:1" data-accept-challenge="${c.id}">
                ${ic('check','sm')} قبول
              </button>
              <button class="btn btn-ghost" style="flex:1" data-reject-challenge="${c.id}">
                رفض
              </button>
            </div>
          </div>`;
      }).join('') : emptyState('لا تحديات حالياً','bolt')}
    `);
  } catch(e){ console.error(e); toast('فشل تحميل التحديات'); }
}

async function acceptChallenge(challengeId){
  try {
    const chRef = doc(db,'challenges',challengeId);
    const chSnap = await getDoc(chRef);
    if(!chSnap.exists()) return toast('التحدي غير موجود');
    const ch = chSnap.data();
    if(ch.status !== 'pending') return toast('التحدي لم يعد متاحاً');
    const exp = ch.expiresAt?.toDate?.() || new Date(0);
    if(exp < new Date()) return toast('انتهت صلاحية التحدي');

    const roomRef = await addDoc(collection(db,'rooms'), {
      gameId: ch.gameId,
      hostId: ch.from,
      name: 'تحدي ' + (ch.fromName || 'لاعب'),
      players: [ch.from, ch.to],
      maxPlayers: 2, mode: '1v1',
      public: false, status: 'waiting',
      createdAt: serverTimestamp(),
      scores: {}, answers: {},
    });

    await updateDoc(chRef, { status: 'accepted', roomId: roomRef.id });
    await notify(ch.from, 'game', `<b>${esc(state.profile.name)}</b> قبل تحديك — المباراة جاهزة!`);

    closeModal();
    toast('قُبل التحدي — بدء المباراة');
    setTimeout(() => startQuizMatch(roomRef.id, state.user.uid === ch.from), 600);
  } catch(e){ console.error(e); toast('فشل القبول'); }
}

async function rejectChallenge(challengeId){
  try {
    await updateDoc(doc(db,'challenges',challengeId), { status: 'rejected' });
    toast('تم الرفض');
    openChallengesModal();
  } catch(e){ toast('فشل'); }
}

/* ============================================================
   👥 طلبات الانضمام للفرق
   ============================================================ */
async function requestJoinTeam(teamId){
  if(state.profile.teamId) return toast('أنت في فريق بالفعل');
  const team = state.teams.find(t => t.id === teamId);
  if(!team) return toast('الفريق غير موجود');
  if((team.joinRequests || []).includes(state.user.uid)) return toast('طلبك مُرسل مسبقاً');
  try {
    await updateDoc(doc(db,'teams',teamId), {
      joinRequests: arrayUnion(state.user.uid),
    });
    await notify(team.leaderId, 'team_request',
      `<b>${esc(state.profile.name)}</b> يطلب الانضمام لفريق ${esc(team.name)}`, teamId);
    toast('تم إرسال الطلب — بانتظار موافقة القائد');
  } catch(e){ console.error(e); toast('فشل'); }
}

async function approveJoinRequest(teamId, uid){
  try {
    const team = state.teams.find(t => t.id === teamId);
    if(!team) return;
    await updateDoc(doc(db,'teams',teamId), {
      members: arrayUnion(uid),
      joinRequests: arrayRemove(uid),
    });
    await updateDoc(doc(db,'users',uid), {
      teamId: teamId,
      teamName: team.name,
      teamEmblem: team.emblem || '🛡️',
    });
    await notify(uid, 'team_accepted', `تم قبول طلبك في فريق <b>${esc(team.name)}</b> 🎉`);
    toast('تمت الموافقة ✓');
    render();
  } catch(e){ console.error(e); toast('فشل'); }
}

async function rejectJoinRequest(teamId, uid){
  try {
    await updateDoc(doc(db,'teams',teamId), {
      joinRequests: arrayRemove(uid),
    });
    await notify(uid, 'team_rejected', 'تم رفض طلب الانضمام للفريق');
    toast('تم الرفض');
    render();
  } catch(e){ console.error(e); toast('فشل'); }
}

/* ============================================================
   👑 إدارة رتب الفريق
   ============================================================ */
async function setTeamRole(teamId, uid, role){
  try {
    const team = state.teams.find(t => t.id === teamId);
    if(!team || team.leaderId !== state.user.uid) return toast('غير مصرح');
    const updates = { [`roles.${uid}`]: role };
    await updateDoc(doc(db,'teams',teamId), updates);
    await notify(uid, 'team_role', `تم تعيينك <b>${role === 'coleader' ? 'نائب القائد' : 'عضواً'}</b>`);
    toast('تم التحديث ✓');
    render();
  } catch(e){ toast('فشل'); }
}

async function kickMember(teamId, uid){
  if(!confirm('طرد هذا العضو؟')) return;
  try {
    const team = state.teams.find(t => t.id === teamId);
    if(!team || team.leaderId !== state.user.uid) return toast('غير مصرح');
    if(uid === team.leaderId) return toast('لا يمكنك طرد نفسك');
    await updateDoc(doc(db,'teams',teamId), {
      members: arrayRemove(uid),
      [`roles.${uid}`]: null,
    });
    await updateDoc(doc(db,'users',uid), {
      teamId: '', teamName: '', teamEmblem: '',
    });
    await notify(uid, 'team_kick', `تم طردك من فريق <b>${esc(team.name)}</b>`);
    toast('تم الطرد');
    render();
  } catch(e){ toast('فشل'); }
}

/* ============================================================
   🏆 نظام البطولات
   ============================================================ */
async function createTournament(name, size, entryCoins){
  if(!state.profile.teamId) return toast('انضم لفريق أولاً');
  const team = state.teams.find(t => t.id === state.profile.teamId);
  if(!team || team.leaderId !== state.user.uid) return toast('فقط القائد ينشئ بطولة');
  
  try {
    const tRef = await addDoc(collection(db,'tournaments'), {
      name, size: parseInt(size),
      entryCoins: parseInt(entryCoins) || 0,
      organizerId: state.user.uid,
      organizerTeamId: state.profile.teamId,
      organizerName: state.profile.name,
      participants: [],
      bracket: [],
      status: 'open',
      currentRound: 0,
      createdAt: serverTimestamp(),
    });
    toast('تم إنشاء البطولة ✓');
    return tRef.id;
  } catch(e){ console.error(e); toast('فشل الإنشاء'); }
}

/* ============================================================
   💰 تحديث الرصيد في الشريط العلوي
   ============================================================ */
function updateTopbarCoins(){
  const el = document.getElementById('tbCoinsValue');
  if(el && state.profile){
    el.textContent = nf(state.profile.coins || 0);
  }
}

async function joinTournament(tournamentId){
  try {
    const tRef = doc(db,'tournaments',tournamentId);
    const snap = await getDoc(tRef);
    if(!snap.exists()) return toast('البطولة غير موجودة');
    const data = snap.data();
    if(data.status !== 'open') return toast('التسجيل مغلق');
    if((data.participants||[]).includes(state.user.uid)) return toast('أنت مسجل بالفعل');
    if((data.participants||[]).length >= data.size) return toast('البطولة ممتلئة');
    
    // خصم رسوم الدخول
    if(data.entryCoins > 0){
      if((state.profile.coins||0) < data.entryCoins) return toast('رصيد غير كافٍ');
      await updateDoc(doc(db,'users',state.user.uid), {
        coins: increment(-data.entryCoins)
      });
    }
    
    await updateDoc(tRef, {
      participants: arrayUnion(state.user.uid),
    });
    
    // تحقق من الامتلاء — ابدأ تلقائياً
    const newSnap = await getDoc(tRef);
    const newData = newSnap.data();
    if((newData.participants||[]).length >= newData.size){
      await startTournament(tournamentId);
    }
    
    toast('تم التسجيل ✓');
  } catch(e){ console.error(e); toast('فشل التسجيل'); }
}

async function startTournament(tournamentId){
  try {
    const tRef = doc(db,'tournaments',tournamentId);
    const snap = await getDoc(tRef);
    const data = snap.data();
    const participants = [...(data.participants||[])];
    
    // shuffle
    for(let i = participants.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [participants[i], participants[j]] = [participants[j], participants[i]];
    }
    
    // round 1 pairs
    const round1 = [];
    for(let i = 0; i < participants.length; i += 2){
      round1.push({
        p1: participants[i],
        p2: participants[i+1],
        score1: 0, score2: 0,
        winner: null,
        status: 'pending',
      });
    }
    
    await updateDoc(tRef, {
      status: 'ongoing',
      currentRound: 0,
      bracket: [round1],
      startedAt: serverTimestamp(),
    });
    
    toast('بدأت البطولة! 🏆');
  } catch(e){ console.error(e); toast('فشل البدء'); }
}

async function reportTournamentResult(tournamentId, round, matchIdx, winnerUid){
  try {
    const tRef = doc(db,'tournaments',tournamentId);
    const snap = await getDoc(tRef);
    const data = snap.data();
    const bracket = JSON.parse(JSON.stringify(data.bracket));
    
    bracket[round][matchIdx].winner = winnerUid;
    bracket[round][matchIdx].status = 'done';
    
    // هل انتهت الجولة؟
    const roundDone = bracket[round].every(m => m.winner);
    
    let newRound = round;
    if(roundDone && round + 1 < Math.log2(data.size)){
      // ولّد الجولة التالية
      const winners = bracket[round].map(m => m.winner);
      const nextRound = [];
      for(let i = 0; i < winners.length; i += 2){
        nextRound.push({
          p1: winners[i],
          p2: winners[i+1],
          score1: 0, score2: 0,
          winner: null,
          status: 'pending',
        });
      }
      bracket.push(nextRound);
      newRound = round + 1;
    }
    
    // هل انتهت البطولة؟
    const finalMatch = bracket[bracket.length - 1][0];
    const isFinished = bracket.length === Math.log2(data.size) && finalMatch?.winner;
    
    await updateDoc(tRef, {
      bracket,
      currentRound: newRound,
      status: isFinished ? 'finished' : 'ongoing',
      winnerId: isFinished ? finalMatch.winner : null,
      finishedAt: isFinished ? serverTimestamp() : null,
    });
    
    if(isFinished){
      // مكافآت
      try {
        await updateDoc(doc(db,'users',finalMatch.winner), {
          coins: increment(500),
          xp: increment(300),
          fame: increment(100),
        });
      } catch(e){}
      toast(`🏆 فاز البطولة: ${state.users[finalMatch.winner]?.name || 'لاعب'}`);
    }
  } catch(e){ console.error(e); }
}

/* ============================================================
   ⚔️ نظام حروب الفرق
   ============================================================ */
async function declareWar(opponentTeamId){
  const myTeam = state.teams.find(t => t.id === state.profile.teamId);
  if(!myTeam) return toast('انضم لفريق أولاً');
  if(myTeam.leaderId !== state.user.uid) return toast('فقط القائد يعلن الحرب');
  
  const opponent = state.teams.find(t => t.id === opponentTeamId);
  if(!opponent) return toast('الفريق غير موجود');
  if(opponent.id === myTeam.id) return toast('لا يمكنك محاربة نفسك');
  
  // تحقق: هل توجد حرب نشطة؟
  try {
    const q = query(
      collection(db,'wars'),
      where('teamAId','==',myTeam.id),
      where('status','==','active')
    );
    const q2 = query(
      collection(db,'wars'),
      where('teamBId','==',myTeam.id),
      where('status','==','active')
    );
    const [snap1, snap2] = await Promise.all([getDocs(q), getDocs(q2)]);
    if(!snap1.empty || !snap2.empty) return toast('لديك حرب نشطة بالفعل');
  } catch(e){}
  
  try {
    const wRef = await addDoc(collection(db,'wars'), {
      teamAId: myTeam.id,
      teamAName: myTeam.name,
      teamAEmblem: myTeam.emblem || '🛡️',
      teamBId: opponent.id,
      teamBName: opponent.name,
      teamBEmblem: opponent.emblem || '🛡️',
      scoreA: 0, scoreB: 0,
      status: 'active',
      contributions: {},
      startedAt: serverTimestamp(),
      endsAt: new Date(Date.now() + WAR_DURATION_HOURS * 60 * 60 * 1000),
    });
    
    // إشعار لقادة الفريق الآخر
    await notify(opponent.leaderId, 'war', `<b>${esc(myTeam.name)}</b> أعلن الحرب على فريقك! ⚔️`);
    
    toast('🔥 بدأت الحرب! لديك 24 ساعة');
    go('war', { viewingWarId: wRef.id });
  } catch(e){ console.error(e); toast('فشل'); }
}

async function contributeToWar(warId, teamSide, points){
  try {
    const wRef = doc(db,'wars',warId);
    const snap = await getDoc(wRef);
    if(!snap.exists()) return;
    const data = snap.data();
    if(data.status !== 'active') return;
    
    const endsAt = data.endsAt?.toDate?.() || new Date(0);
    if(endsAt < new Date()){
      await finishWar(warId);
      return;
    }
    
    const field = teamSide === 'A' ? 'scoreA' : 'scoreB';
    await updateDoc(wRef, {
      [field]: increment(points),
      [`contributions.${state.user.uid}`]: increment(points),
    });
  } catch(e){ console.error(e); }
}

async function finishWar(warId){
  try {
    const wRef = doc(db,'wars',warId);
    const snap = await getDoc(wRef);
    const data = snap.data();
    if(data.status !== 'active') return;
    
    const winner = data.scoreA > data.scoreB ? 'A' :
                   data.scoreB > data.scoreA ? 'B' : null;
    const winnerTeamId = winner === 'A' ? data.teamAId :
                         winner === 'B' ? data.teamBId : null;
    
    await updateDoc(wRef, {
      status: 'finished',
      winnerId: winnerTeamId,
      finishedAt: serverTimestamp(),
    });
    
    if(winnerTeamId){
      // مكافآت
      try {
        await updateDoc(doc(db,'teams',winnerTeamId), {
          points: increment(500),
          warsWon: increment(1),
        });
      } catch(e){}
    }
  } catch(e){ console.error(e); }
}

/* ============================================================
   🏅 نظام الإنجازات الديناميكي
   ============================================================ */
async function checkAchievements(){
  if(!state.profile) return;
  const p = state.profile;
  
  // اجمع الإحصائيات الحالية
  try {
    const matchesSnap = await getDocs(collection(db,'users',state.user.uid,'matchHistory'));
    const matches = matchesSnap.docs.map(d=>d.data());
    const wins = matches.filter(m=>m.result === 'win').length;
    const postsCount = state.posts.filter(x=>x.authorId === state.user.uid).length;
    
    const stats = {
      matches: matches.length,
      wins,
      following: p.following || 0,
      followers: p.followers || 0,
      hasTeam: p.teamId ? 1 : 0,
      createdTeam: 0, // يُحدد لاحقاً
      posts: postsCount,
      tournaments: 0,
      tournamentWins: 0,
      warWins: 0,
      streak: p.dailyStreak || 0,
    };
    
    // تحقق من إنشاء فريق
    try {
      const tq = query(collection(db,'teams'), where('leaderId','==',state.user.uid));
      const ts = await getDocs(tq);
      stats.createdTeam = ts.size;
    } catch(e){}
    
    // تحقق من البطولات
    try {
      const tq = query(collection(db,'tournaments'), where('winnerId','==',state.user.uid));
      const ts = await getDocs(tq);
      stats.tournamentWins = ts.size;
    } catch(e){}
    
    // تحقق من كل إنجاز
    const unlocked = p.achievements || {};
    for(const [id, def] of Object.entries(ACHIEVEMENT_DEFS)){
      if(unlocked[id]) continue;
      const current = stats[def.trigger] || 0;
      if(current >= def.threshold){
        // افتحه
        await updateDoc(doc(db,'users',state.user.uid), {
          [`achievements.${id}`]: {
            unlockedAt: new Date().toISOString(),
          },
          coins: increment(def.reward.coins),
          xp: increment(def.reward.xp),
        });
        await notify(state.user.uid, 'achievement',
          `🏅 إنجاز جديد: <b>${def.name}</b> — ${def.reward.coins} عملة + ${def.reward.xp} XP`);
      }
    }
  } catch(e){ console.error('checkAchievements:', e); }
}

/* ============================================================
   📋 سجل النشاطات
   ============================================================ */
async function logActivity(type, text, icon = '📌'){
  try {
    await addDoc(collection(db,'users',state.user.uid,'activity'), {
      type, text, icon,
      createdAt: serverTimestamp(),
    });
  } catch(e){}
}

function subscribeToActivity(){
  if(state.activityUnsub){ try{state.activityUnsub();}catch(e){} }
  state.activityUnsub = onSnapshot(
    query(collection(db,'users',state.user.uid,'activity'), orderBy('createdAt','desc'), limit(30)),
    snap=>{
      state.activityLog = snap.docs.map(d=>({id:d.id, ...d.data()}));
      if(state.page === 'activity') render();
    }
  );
}

/* ============================================================
   🚨 نظام الإبلاغ
   ============================================================ */
async function reportContent(targetType, targetId, reason, details){
  try {
    await addDoc(collection(db,'reports'), {
      reporterId: state.reporterId || state.user.uid,
      reporterName: state.profile.name,
      targetType, targetId, reason, details,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    /* ★ تحديد صاحب البلاغ */
    let targetUid = null;
    if(targetType === 'user'){
      targetUid = targetId;
    } else if(targetType === 'post'){
      const ps = await getDoc(doc(db, 'posts', targetId));
      if(ps.exists()) targetUid = ps.data().authorId;
    } else if(targetType === 'comment'){
      /* ★ تنسيق: postId::commentId */
      const [postId, commentId] = String(targetId).split('::');
      if(postId && commentId){
        const cs = await getDoc(doc(db, 'posts', postId, 'comments', commentId));
        if(cs.exists()) targetUid = cs.data().authorId;
      }
    }

    /* ★ عقوبة السمعة */
    if(targetUid && targetUid !== state.user.uid){
      await updateDoc(doc(db, 'users', targetUid), {
        reportsReceived: increment(1),
        reputation:      increment(-REPUTATION_WEIGHTS.reportPenalty),
      });
    }

    toast('تم إرسال البلاغ — شكراً لك ✓');
  } catch(e){
    console.error(e);
    toast('فشل الإرسال');
  }
}

/* ============================================================
   💾 حفظ الإعدادات
   ============================================================ */
async function saveSettings(){
  try {
    await updateDoc(doc(db,'users',state.user.uid), {
      settings: state.settings,
    });
    toast('تم الحفظ ✓');
  } catch(e){ toast('فشل'); }
}

async function loadSettings(){
  if(state.profile?.settings){
    state.settings = { ...state.settings, ...state.profile.settings };
  }
}

async function pageTournaments(){
  const snap = await getDocs(
    query(collection(db,'tournaments'), orderBy('createdAt','desc'), limit(20))
  );
  const tournaments = snap.docs.map(d=>({id:d.id, ...d.data()}));
  
  if(state.viewingTournamentId){
    const t = tournaments.find(x => x.id === state.viewingTournamentId);
    if(!t) return emptyState('البطولة غير موجودة','trophy');
    return renderTournamentView(t);
  }
  
  return `
    <div class="row" style="margin-bottom:14px">
    </div>
    ${tournaments.length ? tournaments.map(t => `
      <div class="tournament-card">
        <div class="row" style="margin-bottom:10px;position:relative;z-index:1">
          <div style="font-size:28px">🏆</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:15px;font-weight:900">${esc(t.name)}</div>
            <div class="muted" style="font-size:11px">${t.size} لاعب · بواسطة ${esc(t.organizerName||'?')}</div>
          </div>
          <span class="tournament-status ${t.status}">
            ${TOURNAMENT_STATUS[t.status]?.label || t.status}
          </span>
        </div>
        <div class="row" style="position:relative;z-index:1">
          <div class="pill">${ic('users','xs')} ${(t.participants||[]).length} / ${t.size}</div>
          ${t.entryCoins > 0 ? `<div class="pill gold">${ic('coin','xs')} ${t.entryCoins}</div>` : ''}
          <div style="flex:1"></div>
          <button class="btn btn-primary btn-sm" data-view-tournament="${t.id}">عرض</button>
        </div>
      </div>
    `).join('') : emptyState('لا توجد بطولات — كن أول من ينشئ','trophy')}
  `;
}

function renderTournamentView(t){
  const isParticipant = (t.participants||[]).includes(state.user.uid);
  const canJoin = t.status === 'open' && !isParticipant && (t.participants||[]).length < t.size;
  const bracket = t.bracket || [];
  
  return `
    <div class="row" style="margin-bottom:14px">
      <button class="icon-btn" data-action="back-from-tournament">${ic('back','sm')}</button>
      <h1 class="page-title" style="margin:0;flex:1">${esc(t.name)}</h1>
      <span class="tournament-status ${t.status}">${TOURNAMENT_STATUS[t.status]?.label || t.status}</span>
    </div>
    
    <div class="card" style="margin-bottom:14px;padding:16px">
      <div class="row" style="margin-bottom:8px">
        <div style="flex:1"><div class="muted" style="font-size:10.5px">الحجم</div><div style="font-size:14px;font-weight:800">${t.size} لاعب</div></div>
        <div style="flex:1"><div class="muted" style="font-size:10.5px">المسجلون</div><div style="font-size:14px;font-weight:800">${(t.participants||[]).length}</div></div>
        ${t.entryCoins > 0 ? `<div style="flex:1"><div class="muted" style="font-size:10.5px">رسوم</div><div style="font-size:14px;font-weight:800;color:var(--gold)">${t.entryCoins}</div></div>` : ''}
      </div>
      ${t.winnerId ? `
        <div class="card" style="background:rgba(245,179,1,.15);border-color:rgba(245,179,1,.4);text-align:center;padding:14px">
          <div style="font-size:32px;margin-bottom:6px">🥇</div>
          <div style="font-size:14px;font-weight:900;color:var(--gold)">البطل: ${esc(state.users[t.winnerId]?.name || '?')}</div>
        </div>
      ` : ''}
    </div>

    ${canJoin ? `
      <button class="btn btn-primary" style="width:100%;margin-bottom:14px" data-join-tournament="${t.id}">
        ${ic('plus','sm')} سجّل في البطولة
      </button>
    ` : ''}
    
    ${bracket.length ? `
      <div class="section-title">${ic('trophy','sm')} شجرة البطولة</div>
      <div class="bracket">
        ${bracket.map((round, ri) => `
          <div class="bracket-round">
            <div class="bracket-round-title">
              ${ri === bracket.length-1 ? 'النهائي' : ri === bracket.length-2 ? 'نصف النهائي' : `جولة ${ri+1}`}
            </div>
            ${round.map((m, mi) => `
              <div class="bracket-match ${m.winner?'winner':''}">
                <div class="bracket-player ${m.winner && m.winner !== m.p1 ? 'loser' : ''}">
                  <span>${esc(state.users[m.p1]?.name?.split(' ')[0] || 'TBD')}</span>
                  <span class="score">${m.score1 || 0}</span>
                </div>
                <div class="bracket-player ${m.winner && m.winner !== m.p2 ? 'loser' : ''}">
                  <span>${esc(state.users[m.p2]?.name?.split(' ')[0] || 'TBD')}</span>
                  <span class="score">${m.score2 || 0}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    ` : `<div class="muted" style="text-align:center;padding:24px">البطولة ستبدأ عند اكتمال التسجيل</div>`}
  `;
}

/* ============================================================
   ⚔️ صفحة الحرب
   ============================================================ */
async function pageWar(){
  if(!state.viewingWarId) {
    // عرض كل الحروب النشطة
    const snap = await getDocs(
      query(collection(db,'wars'), where('status','==','active'), limit(20))
    );
    const wars = snap.docs.map(d=>({id:d.id, ...d.data()}));
    return `
      ${wars.length ? wars.map(w => `
        <div class="card" style="margin-bottom:10px;padding:14px;cursor:pointer" data-view-war="${w.id}">
          <div class="row" style="margin-bottom:8px">
            <div style="font-size:20px">${w.teamAEmblem||'🛡️'}</div>
            <div style="flex:1;text-align:center;font-size:12px;font-weight:800">
              ${esc(w.teamAName)} <span style="color:var(--pink)">⚔️</span> ${esc(w.teamBName)}
            </div>
            <div style="font-size:20px">${w.teamBEmblem||'⚔️'}</div>
          </div>
          <div class="row">
            <div class="pill">${w.scoreA || 0}</div>
            <div style="flex:1;text-align:center" class="muted">حتى ${timeAgo(w.endsAt)}</div>
            <div class="pill">${w.scoreB || 0}</div>
          </div>
        </div>
      `).join('') : emptyState('لا توجد حروب نشطة — ابدأ حرباً من صفحة الفريق','bolt')}
    `;
  }
  
  // عرض حرب محددة
  const snap = await getDoc(doc(db,'wars',state.viewingWarId));
  if(!snap.exists()) return emptyState('الحرب غير موجودة','bolt');
  const w = {id:snap.id, ...snap.data()};
  
  const myTeamId = state.profile?.teamId;
  const isSideA = w.teamAId === myTeamId;
  const isSideB = w.teamBId === myTeamId;
  const mySide = isSideA ? 'A' : isSideB ? 'B' : null;
  const myScore = isSideA ? w.scoreA : isSideB ? w.scoreB : 0;
  const oppScore = isSideA ? w.scoreB : isSideB ? w.scoreA : 0;
  const total = (w.scoreA || 0) + (w.scoreB || 0);
  const pctA = total > 0 ? ((w.scoreA || 0) / total * 100) : 50;
  
  return `
    <div class="row" style="margin-bottom:14px">
      <button class="icon-btn" data-action="back-from-war">${ic('back','sm')}</button>
      <h1 class="page-title" style="margin:0;flex:1">⚔️ الحرب</h1>
    </div>
    
    <div class="war-hero">
      <div class="muted" style="font-size:11px;position:relative;z-index:1">
        ${w.status === 'active' ? `تنتهي ${timeAgo(w.endsAt)}` : 'انتهت الحرب'}
      </div>
      <div class="war-teams">
        <div class="war-team">
          <div class="emblem">${w.teamAEmblem||'🛡️'}</div>
          <div class="tname">${esc(w.teamAName)}</div>
          <div class="tscore">${w.scoreA || 0}</div>
        </div>
        <div class="war-vs">VS</div>
        <div class="war-team">
          <div class="emblem">${w.teamBEmblem||'⚔️'}</div>
          <div class="tname">${esc(w.teamBName)}</div>
          <div class="tscore">${w.scoreB || 0}</div>
        </div>
      </div>
      <div class="war-progress">
        <div class="left-part" style="width:${pctA}%"></div>
        <div class="right-part" style="width:${100-pctA}%"></div>
      </div>
      ${w.winnerId ? `
        <div style="margin-top:12px;font-size:15px;font-weight:900;color:var(--gold);position:relative;z-index:1">
          🏆 الفائز: ${esc(w.winnerId === w.teamAId ? w.teamAName : w.teamBName)}
        </div>
      ` : ''}
    </div>
    
    ${mySide && w.status === 'active' ? `
      <div class="card" style="margin-bottom:12px;text-align:center">
        <div style="font-size:12px;color:var(--muted);margin-bottom:8px">
          ساهم بفوز فريقك — العب مباريات واربح نقاط
        </div>
        <button class="btn btn-primary" style="width:100%" data-play-war-match="${w.id}">
          ${ic('play','sm')} العب مباراة الآن
        </button>
      </div>
    ` : ''}
    
    <div class="section-title">${ic('chart','sm')} المساهمات</div>
    <div class="card">
      ${Object.entries(w.contributions || {}).sort((a,b)=>b[1]-a[1]).map(([uid, pts])=>{
        const u = state.users[uid];
        if(!u) return '';
        return `<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)">
          ${avatar(u, 32)}
          <div style="flex:1;font-size:12.5px;font-weight:700">${esc(u.name)}</div>
          <div class="pill ok">${pts} نقطة</div>
        </div>`;
      }).join('') || `<div class="muted" style="text-align:center;padding:16px">لا مساهمات بعد</div>`}
    </div>
  `;
}

/* ============================================================
   📋 صفحة سجل النشاطات
   ============================================================ */
function pageActivity(){
  if(!state.activityLog.length){
    return `<h1 class="page-title">📋 النشاطات</h1>${emptyState('لا نشاطات بعد','clock')}`;
  }
  return `
    <h1 class="page-title">📋 النشاطات</h1>
    <div class="card">
      ${state.activityLog.map(a=>`
        <div class="activity-item">
          <div class="activity-icon" style="background:rgba(108,92,231,.15)">${a.icon || '📌'}</div>
          <div class="activity-text">
            <div class="activity-desc">${esc(a.text || '')}</div>
            <div class="activity-time">${timeAgo(a.createdAt)}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ============ Pages ============ */
function emptyState(msg, icon='grid'){
  return `<div class="empty">${ic(icon)}<div>${msg}</div></div>`;
}

/* ============================================================
   🧮 حساب درجة الرواج لمنشور
   ============================================================ */
function calculateTrendingScore(post){
  if(!post || !post.createdAt) return 0;

  const now = Date.now();
  const createdAt = post.createdAt.seconds
    ? post.createdAt.seconds * 1000
    : (post.createdAt.toDate?.().getTime() || now);

  const ageHours = Math.max(
    TRENDING_CONFIG.MIN_AGE_HOURS,
    (now - createdAt) / 3600000
  );

  const likes    = post.likes    || 0;
  const comments = post.comments || 0;
  const reblogs  = post.reblogs  || 0;

  /* ---- 1) التفاعل المرجّح ---- */
  let engagement =
    likes    * TRENDING_CONFIG.W_LIKE +
    comments * TRENDING_CONFIG.W_COMMENT +
    reblogs  * TRENDING_CONFIG.W_REBLOG;

  if(engagement === 0) return 0;

  /* ---- 2) حماية من التلاعب (إعجابات بدون نقاش) ---- */
  if(
    likes > TRENDING_CONFIG.SUSPICIOUS_LIKES &&
    comments === 0 &&
    reblogs === 0
  ){
    engagement *= TRENDING_CONFIG.SUSPICIOUS_DAMPEN;
  }

  /* ---- 3) عامل الحداثة ---- */
  let freshness = 0.05;
  for(const tier of TRENDING_CONFIG.FRESHNESS){
    if(ageHours <= tier.maxHours){
      freshness = tier.mult;
      break;
    }
  }

  /* ---- 4) سمعة الناشر ---- */
  const authorFame =
    state.users[post.authorId]?.fame ||
    post.author?.fame ||
    0;
  const authorBoost = 1 + Math.min(
    TRENDING_CONFIG.AUTHOR_BOOST_CAP,
    authorFame / TRENDING_CONFIG.AUTHOR_FAME_DIVISOR
  );

  /* ---- 5) عامل السرعة ---- */
  const velocity = engagement / ageHours;
  const velocityBoost = 1 + Math.log10(1 + velocity) * TRENDING_CONFIG.VELOCITY_LOG_FACTOR;

  /* ---- 6) عمق النقاش ---- */
  const discussionBoost = Math.min(
    TRENDING_CONFIG.DISCUSSION_BOOST_CAP,
    1 + comments / TRENDING_CONFIG.DISCUSSION_DIVISOR
  );

  /* ---- 7) الانحدار الزمني ---- */
  const gravityDecay = Math.pow(
    ageHours + 2,
    TRENDING_CONFIG.GRAVITY
  );

  /* ---- النتيجة النهائية ---- */
  const rawScore = (
    engagement *
    freshness *
    authorBoost *
    velocityBoost *
    discussionBoost
  ) / gravityDecay;

  return Math.round(rawScore * 1000);
}

/* ============================================================
   🏷️ تصنيف المنشور الدارج
   ============================================================ */
function getTrendingLabel(post, score){
  if(!post || !post.createdAt) return null;

  const now = Date.now();
  const createdAt = post.createdAt.seconds
    ? post.createdAt.seconds * 1000
    : (post.createdAt.toDate?.().getTime() || now);
  const ageHours = Math.max(0.5, (now - createdAt) / 3600000);

  const engagement =
    (post.likes    || 0) * TRENDING_CONFIG.W_LIKE +
    (post.comments || 0) * TRENDING_CONFIG.W_COMMENT +
    (post.reblogs  || 0) * TRENDING_CONFIG.W_REBLOG;
  const velocity = engagement / ageHours;

  /* أولوية التصنيف */
  if(ageHours <= 3 && velocity >= 15){
    return { icon: '⚡', label: 'سريع الانتشار', class: 'speed' };
  }
  if((post.comments || 0) >= 10){
    return { icon: '💎', label: 'نقاش عميق', class: 'discuss' };
  }
  if(score >= 5000 && ageHours <= 12){
    return { icon: '🔥', label: 'رواج', class: 'hot' };
  }
  if(score >= 1500){
    return { icon: '📈', label: 'تصاعدي', class: 'rising' };
  }
  return null;
}

/* ============================================================
   📊 بطاقة تعريفية — تُعرض أعلى تبويب الدارج
   ============================================================ */
function renderTrendingInfoCard(){
  return `
    <div class="trending-info-card">
      <div class="trending-header">
        <div class="trending-icon">🔥</div>
        <div>
          <div class="trending-title">المنشورات الدارجة</div>
          <div class="trending-desc">ترتيب ذكي: تفاعل مرجّح + سرعة + حداثة + سمعة الناشر</div>
        </div>
      </div>
      <div class="trending-legend">
        <div class="tl-item"><span class="tl-emoji">⚡</span> سريع الانتشار</div>
        <div class="tl-item"><span class="tl-emoji">🔥</span> رواج</div>
        <div class="tl-item"><span class="tl-emoji">📈</span> تصاعدي</div>
        <div class="tl-item"><span class="tl-emoji">💎</span> نقاش عميق</div>
      </div>
      <details class="trending-details">
        <summary>كيف يُحسب الترتيب؟</summary>
        <div class="trending-formula">
          <p>• <b>الإعجاب</b> = 1 نقطة · <b>التعليق</b> = 3 · <b>إعادة النشر</b> = 5</p>
          <p>• <b>عامل الحداثة</b> = ×2 لأقل من ساعة → ×0.05 بعد شهر</p>
          <p>• <b>عامل السرعة</b> = التفاعل ÷ العمر (بمقياس لوغاريتمي)</p>
          <p>• <b>سمعة الناشر</b> = حتى +50% حسب الشهرة</p>
          <p>• <b>الانحدار</b> = 1 / (العمر + 2)<sup>1.5</sup> — نمط Hacker News</p>
          <p>• <b>حماية</b> = إعجابات كثيرة بدون نقاش تُخفَّض 50%</p>
        </div>
      </details>
    </div>
  `;
}

function pageHome(){
  const tabs = `
    <div class="tabs">
      <button class="tab ${state.homeTab==='explore'?'active':''}" data-tab="explore">${ic('globe','sm')} استكشف</button>
      <button class="tab ${state.homeTab==='follow'?'active':''}" data-tab="follow">${ic('users','sm')} متابعة</button>
      <button class="tab ${state.homeTab==='trend'?'active':''}" data-tab="trend">${ic('fire','sm')} دارج</button>
    </div>`;
  let body = '';
  if(state.homeTab === 'explore'){
    const suggestions = Object.values(state.users).filter(u=>u.uid !== state.user.uid).slice(0,8);
    const posts = [...state.posts].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    body = `
      <button class="btn btn-primary" style="width:100%;margin-bottom:14px" data-action="compose">${ic('plus','sm')} منشور جديد</button>
      ${suggestions.length ? `<div class="section-title">${ic('users','sm')} حسابات قد تعجبك</div>
      <div class="hscroll">${suggestions.map(suggestCard).join('')}</div>` : ''}
      <div class="section-title">${ic('grid','sm')} آخر المنشورات</div>
      ${posts.length ? posts.map(p=>postCard(p)).join('') : emptyState('لا توجد منشورات بعد — كن أول من ينشر!')}`;
  } else if(state.homeTab === 'follow'){
    const posts = state.posts.filter(p=>state.followed.has(p.authorId));
    body = posts.length ? posts.map(p=>postCard(p)).join('') : emptyState('تابع المزيد لتظهر منشوراتهم','users');
} else {
    /* 🔥 الخوارزمية العميقة */
    const scored = state.posts
      .filter(p => !p.hidden && !p.reblogOf)   // استبعاد المخفي والنسخ القديمة
      .map(p => ({
        post: p,
        score: calculateTrendingScore(p),
      }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);

    /* تنويع: 2 كحد أقصى لكل ناشر */
    const seen = new Map();
    const diversified = [];
    for(const x of scored){
      const count = seen.get(x.post.authorId) || 0;
      if(count < TRENDING_CONFIG.MAX_PER_AUTHOR){
        diversified.push(x);
        seen.set(x.post.authorId, count + 1);
      }
      if(diversified.length >= TRENDING_CONFIG.MAX_TRENDING) break;
    }

    body = renderTrendingInfoCard() +
      (diversified.length
        ? diversified.map(x => postCard(x.post, true, x.score)).join('')
        : emptyState('لا توجد منشورات دارجة بعد — كن أول من ينشر!', 'fire'));
  }
  return `<h1 class="page-title">الرئيسية</h1>${tabs}${body}`;
}

function suggestCard(u){
  const on = state.followed.has(u.uid);
  return `<div class="suggest-card">
    <div data-view-profile="${u.uid}" style="cursor:pointer">${avatar(u, 56)}</div>
    <div class="suggest-name">${esc(u.name)}</div>
    <div class="suggest-user">@${esc(u.username)}</div>
    <button class="btn-follow ${on?'on':''}" data-follow="${u.uid}">${on?'متابَع ✓':'متابعة'}</button>
  </div>`;
}

function postCard(p, trendMode=false, trendingScore=null){
  /* ♻️ إعادة نشر — مع حماية كاملة */
  if(p && p.reblogOf){
    try { return renderReblogCard(p, trendMode); }
    catch(err){
      console.error('renderReblogCard crashed:', err, p);
      return `<article class="post card reblog-card" style="padding:16px;text-align:center">
        <div style="color:var(--muted);font-size:12px">⚠️ تعذّر عرض إعادة النشر</div>
      </article>`;
    }
  }
  if(!p || !p.id) return '';

  /* ★ تطبيق تخصيصات المنشورات */
  const authorProfile = state.users[p.authorId] || state.profile;
  const authorCust = getProfileCustomization(authorProfile);
  const postStyle = buildPostCardStyle(authorCust, authorProfile);

  const liked = state.liked[p.id];
  const saved = state.saved[p.id];
  const visIcon = p.visibility==='followers'?'users':p.visibility==='private'?'lock':'globe';
  const visLabel = p.visibility==='followers'?'متابعون':p.visibility==='private'?'خاص':'';

  const nameColorStyle = authorCust.postNameColor ? `color:${authorCust.postNameColor}` : '';
  const textColorStyle = authorCust.postTextColor ? `color:${authorCust.postTextColor}` : '';
  const avatarRadius = POST_AVATAR_SHAPES[authorCust.postAvatarShape]?.radius || '50%';
  const avatarSize = authorCust.postAvatarSize || 44;

  return `<article class="post ${authorCust.postCardStyle !== 'minimal' ? 'card' : ''} ${p.pinned?'pinned':''} ${p.hidden?'hidden-post':''}" style="${postStyle}">
    ${p.pinned ? '<div class="pinned-badge">📌 مثبّت</div>' : ''}
    <header class="post-h">
      <div data-view-profile="${p.authorId}" style="cursor:pointer">
        <div class="av ${authorCust.postAvatarShape === 'circle' ? '' : 'sq'}"
             style="--s:${avatarSize}px;border-radius:${avatarRadius};background:${p.author?.grad||pickGrad(p.authorId)};font-size:${Math.round(avatarSize*0.35)}px;overflow:hidden">
          ${p.author?.avatarUrl
            ? `<img src="${esc(p.author.avatarUrl)}" alt="">`
            : esc(((p.author?.name||'?').split(/\s+/).map(w=>w[0]).slice(0,2).join('')))}
        </div>
      </div>
      <div style="flex:1;min-width:0">
        <div class="post-name" data-view-profile="${p.authorId}" style="cursor:pointer;${nameColorStyle}">${esc(p.author?.name||'مستخدم')}</div>
        <div class="post-sub">
          <span>@${esc(p.author?.username||'')}</span>·
          <span>${timeAgo(p.createdAt)}</span>
          ${p.edited?'· <span>معدّل</span>':''}
          ${visLabel?`· <span class="visibility-badge">${ic(visIcon,'xs')} ${visLabel}</span>`:''}
          ${p.place?`·<span style="display:inline-flex;align-items:center;gap:3px">${ic('location','xs')}${esc(p.place)}</span>`:''}
        </div>
      </div>
      ${trendMode ? (() => {
        try {
          const ts = (typeof trendingScore === 'number' && trendingScore > 0)
            ? trendingScore
            : (typeof calculateTrendingScore === 'function' ? calculateTrendingScore(p) : 0);
          const label = typeof getTrendingLabel === 'function' ? getTrendingLabel(p, ts) : null;
          if(label){ return `<span class="trending-badge ${label.class}">${label.icon} ${label.label}</span>`; }
          if(ts > 0){ return `<span class="pill pink">${ic('fire','xs')} ${nf(ts)}</span>`; }
          return '';
        } catch(err){ return ''; }
      })() : ''}
      <button class="post-menu-btn" data-post-menu="${p.id}" title="خيارات">${ic('dots','sm')}</button>
    </header>
    <p class="post-text" style="${textColorStyle}">${esc(p.text||'').replace(/\n/g,'<br>')}</p>
    ${p.media ? `<div class="post-media"><img src="${esc(p.media)}" alt="" onerror="this.style.display='none'"></div>` : ''}
    ${authorCust.postShowActions !== false ? `
    <div class="post-actions">
      <button class="pact ${liked?'liked':''}" data-like="${p.id}">${ic('heart','sm')} ${nf(p.likes)}</button>
      <button class="pact" data-open-comments="${p.id}">${ic('comment','sm')} ${nf(p.comments)}</button>
      ${(()=>{
        const wasReblogged = (p.rebloggedBy || []).includes(state.user.uid);
        return `<button class="pact ${wasReblogged?'reblogged':''}" data-reblog="${p.id}">${ic('share','sm')} ${nf(p.reblogs||0)}</button>`;
      })()}
      <button class="pact ml ${saved?'saved':''}" data-save="${p.id}">${ic('bookmark','sm')}</button>
    </div>` : ''}
  </article>`;
}

function renderReblogCard(p, trendMode){
  const snap = p.reblogSnapshot;
  const original = (!snap && p.reblogOf)
    ? state.posts.find(x => x.id === p.reblogOf)
    : null;

  const oAuthor  = snap?.author  || original?.author  || null;
  const oText    = snap?.text    ?? original?.text    ?? '';
  const oMedia   = snap?.media   ?? original?.media   ?? '';
  const oTime    = snap?.createdAt || original?.createdAt || null;
  const isDeleted = !snap && !original;

  return `<article class="post card reblog-card">
    <header class="post-h">
      <div data-view-profile="${esc(p.authorId||'')}" style="cursor:pointer">${avatar(p.author||{}, 44)}</div>
      <div style="flex:1;min-width:0">
        <div class="post-name">
          <span data-view-profile="${esc(p.authorId||'')}" style="cursor:pointer">${esc(p.author?.name||'مستخدم')}</span>
          <span class="reblog-indicator">${ic('share','xs')} أعاد النشر</span>
        </div>
        <div class="post-sub">
          <span>@${esc(p.author?.username||'')}</span>·<span>${timeAgo(p.createdAt)}</span>
        </div>
      </div>
      <button class="post-menu-btn" data-post-menu="${esc(p.id||'')}">${ic('dots','sm')}</button>
    </header>

    ${isDeleted ? `
      <div class="reblog-deleted">⚠️ المحتوى الأصلي غير متوفر</div>
    ` : `
      <div class="reblog-original">
        <header class="post-h" style="margin-bottom:8px">
          ${avatar(oAuthor||{}, 32)}
          <div style="flex:1;min-width:0">
            <div class="post-name" style="font-size:12.5px">${esc(oAuthor?.name||'مستخدم')}</div>
            <div class="post-sub">
              <span>@${esc(oAuthor?.username||'')}</span>·<span>${timeAgo(oTime)}</span>
            </div>
          </div>
        </header>
        <p class="post-text" style="font-size:13px">${esc(oText||'').replace(/\n/g,'<br>')}</p>
        ${oMedia ? `<div class="post-media" style="height:150px"><img src="${esc(oMedia)}" alt="" onerror="this.style.display='none'"></div>` : ''}
      </div>
    `}

    <div class="post-actions">
      <button class="pact ${state.liked[p.id]?'liked':''}" data-like="${esc(p.id||'')}">${ic('heart','sm')} ${nf(p.likes)}</button>
      <button class="pact" data-open-comments="${esc(p.id||'')}">${ic('comment','sm')} ${nf(p.comments)}</button>
    </div>
  </article>`;
}

/* ============ ♻️ إعادة النشر ============ */
async function toggleReblog(postId){
  const original = state.posts.find(p => p.id === postId);
  if(!original) return toast('المنشور غير موجود');
  if(original.authorId === state.user.uid) return toast('لا يمكنك إعادة نشر منشورك');
  if(original.hidden) return toast('المنشور مخفي');
  if(original.reblogOf) return toast('لا يمكن إعادة نشر منشور معاد');

  const already = (original.rebloggedBy || []).includes(state.user.uid);

  try {
    if(already){
      await updateDoc(doc(db,'posts',postId), {
        rebloggedBy: arrayRemove(state.user.uid),
        reblogs: increment(-1),
      });
      toast('تم إلغاء إعادة النشر');
    } else {
      await updateDoc(doc(db,'posts',postId), {
        rebloggedBy: arrayUnion(state.user.uid),
        reblogs: increment(1),
      });
      await notify(original.authorId, 'reblog',
        `<b>${esc(state.profile.name)}</b> أعاد نشر منشورك`);
      toast('تمت إعادة النشر ✓');
    }
  } catch(e){
    console.error(e);
    toast('فشل');
  }
}

/* ============ 📋 قائمة خيارات المنشور ============ */
function openPostActionsModal(postId){
  const p = state.posts.find(x => x.id === postId);
  if(!p) return toast('المنشور غير موجود');
  const isMine = p.authorId === state.user.uid;
  const isAdmin = state.profile?.role === 'admin';

  let actions = '';

  if(isMine && !p.reblogOf){
    actions += `
      <button class="set-row" data-edit-post="${postId}">
        ${ic('edit','sm')} <span class="sr-txt"><span class="sr-n">تعديل المنشور</span></span>
      </button>
      <button class="set-row" data-pin-post="${postId}">
        ${ic('star','sm')} <span class="sr-txt"><span class="sr-n">${p.pinned?'إلغاء التثبيت':'تثبيت على الملف'}</span></span>
      </button>
      <button class="set-row" data-set-visibility="${postId}">
        ${ic('eye','sm')} <span class="sr-txt"><span class="sr-n">الخصوصية</span><span class="sr-d">${p.visibility==='followers'?'المتابعون فقط':p.visibility==='private'?'خاص':'عام'}</span></span>
      </button>
    `;
  }

  if(!isMine && !p.reblogOf){
    actions += `
${(()=>{
  const wasReblogged = (p.rebloggedBy || []).includes(state.user.uid);
  return `<button class="set-row" data-reblog="${postId}" style="${wasReblogged?'color:var(--ok)':''}">
    ${ic('share','sm')} <span class="sr-txt"><span class="sr-n" style="${wasReblogged?'color:var(--ok)':''}">${wasReblogged?'إلغاء إعادة النشر':'إعادة النشر'}</span></span>
  </button>`;
})()}
      <button class="set-row" data-report-target="${postId}" data-report-type="post">
        ${ic('shield','sm')} <span class="sr-txt"><span class="sr-n">إبلاغ</span></span>
      </button>
    `;
  }

  if(isMine || isAdmin){
    actions += `
      <button class="set-row" data-delete-post="${postId}" style="color:#ff7b9d">
        ${ic('trash','sm')} <span class="sr-txt"><span class="sr-n" style="color:#ff7b9d">حذف المنشور</span></span>
      </button>
    `;
  }

  if(isAdmin && !isMine){
    actions += `
      <button class="set-row" data-admin-hide-post="${postId}" style="color:#f5c451">
        ${ic('lock','sm')} <span class="sr-txt"><span class="sr-n" style="color:#f5c451">${p.hidden?'إظهار المنشور':'إخفاء المنشور'}</span></span>
      </button>
      <button class="set-row" data-admin-ban="${p.authorId}" data-admin-banned="0" style="color:#ff7b9d">
        ${ic('lock','sm')} <span class="sr-txt"><span class="sr-n" style="color:#ff7b9d">حظر صاحب المنشور</span></span>
      </button>
    `;
  }

  openModal(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <h3 style="margin:0">خيارات المنشور</h3>
      <button class="icon-btn" data-action="modal-close" style="width:32px;height:32px">${ic('close','sm')}</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px">${actions}</div>
  `);
}

/* ============ ✏️ تعديل المنشور ============ */
function editPostModal(postId){
  const p = state.posts.find(x => x.id === postId);
  if(!p) return toast('المنشور غير موجود');

  openModal(`
    <h3>✏️ تعديل المنشور</h3>
    <div class="field">
      <label>النص</label>
      <textarea class="input" id="editPostText" rows="4"
        style="resize:vertical;max-height:200px">${esc(p.text||'')}</textarea>
      <div class="char-counter" id="editPostCounter">${(p.text||'').length} / 1000</div>
    </div>
    <div class="row" style="margin-top:14px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" id="savePostEditBtn" data-post-id="${postId}">حفظ</button>
    </div>
  `);
  const el = document.getElementById('editPostText');
  const counter = document.getElementById('editPostCounter');
  el?.addEventListener('input', () => {
    counter.textContent = `${el.value.length} / 1000`;
    if(el.value.length > 1000) el.value = el.value.slice(0,1000);
  });
}

async function savePostEdit(postId){
  const text = document.getElementById('editPostText')?.value.trim() || '';
  try {
    await updateDoc(doc(db,'posts',postId), {
      text, edited: true, editedAt: serverTimestamp(),
    });
    closeModal();
    toast('تم الحفظ ✓');
  } catch(e){ toast('فشل'); }
}

/* ============ 📌 تثبيت المنشور ============ */
async function togglePinPost(postId){
  const p = state.posts.find(x => x.id === postId);
  if(!p) return;
  try {
    await updateDoc(doc(db,'posts',postId), { pinned: !p.pinned });
    closeModal();
    toast(p.pinned ? 'تم إلغاء التثبيت' : 'تم التثبيت 📌');
  } catch(e){ toast('فشل'); }
}

/* ============ 👁️ خصوصية المنشور ============ */
function openVisibilityPicker(postId){
  const p = state.posts.find(x => x.id === postId);
  if(!p) return;
  const cur = p.visibility || 'public';

  openModal(`
    <h3>👁️ خصوصية المنشور</h3>
    <div class="sub">من يمكنه رؤية المنشور؟</div>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${[
        ['public','🌐','عام','الجميع يمكنه الرؤية'],
        ['followers','👥','المتابعون فقط',''],
        ['private','🔒','خاص','أنت فقط'],
      ].map(([k,emoji,lbl,desc])=>`
        <button class="set-row" data-save-visibility="${k}" data-post-id="${postId}"
                style="${cur===k?'border-color:var(--brand-2)':''}">
          <span style="font-size:20px">${emoji}</span>
          <span class="sr-txt">
            <span class="sr-n">${lbl}</span>
            ${desc?`<span class="sr-d">${desc}</span>`:''}
          </span>
          ${cur===k?ic('check','sm'):''}
        </button>
      `).join('')}
    </div>
  `);
}

async function savePostVisibility(postId, visibility){
  try {
    await updateDoc(doc(db,'posts',postId), { visibility });
    closeModal();
    toast('تم التحديث ✓');
  } catch(e){ toast('فشل'); }
}

/* ============ 🚫 إخفاء/إظهار (للمشرف) ============ */
async function adminHidePost(postId){
  const p = state.posts.find(x => x.id === postId);
  if(!p) return;
  try {
    await updateDoc(doc(db,'posts',postId), {
      hidden: !p.hidden,
      hiddenBy: state.user.uid,
      hiddenAt: serverTimestamp(),
    });
    closeModal();
    toast(p.hidden ? 'تم الإظهار' : 'تم الإخفاء');
  } catch(e){ toast('فشل'); }
}

function pageMessages(){
  if(state.chatWith){
    const other = state.users[state.chatWith];
    return `
      <div class="row" style="margin-bottom:16px">
        <button class="icon-btn" data-nav="messages" data-reset="chat">${ic('back','sm')}</button>
        <div data-view-profile="${state.chatWith}" style="cursor:pointer">${avatar(other, 42)}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:900">${esc(other?.name||'')}</div>
          <div class="muted" style="font-size:10.5px">@${esc(other?.username||'')}</div>
        </div>
      </div>
      <div class="card" style="min-height:360px;display:flex;flex-direction:column" id="chatBox">
        <div id="messagesList" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:8px;max-height:55vh"></div>
        <div style="display:flex;gap:8px;padding-top:10px;border-top:1px solid var(--line);margin-top:10px">
          <input class="input" id="msgInput" placeholder="اكتب رسالة…" style="flex:1" autocomplete="off">
          <button class="btn btn-primary" id="sendMsgBtn" style="padding:10px 16px">${ic('send','sm')}</button>
        </div>
      </div>`;
  }
  return `<h1 class="page-title">الرسائل</h1>
    <div class="card pad0" style="padding:6px">
    ${state.chats.length ? state.chats.map(c=>{
      const otherId = c.participants.find(p=>p!==state.user.uid);
      const other = state.users[otherId];
      if(!other) return '';
      return `<button class="chat-item" data-chat="${otherId}">
        <div style="position:relative">${avatar(other, 50)}</div>
        <div class="chat-mid">
          <div class="chat-n"><span>${esc(other.name)}</span><span class="chat-time">${timeAgo(c.lastTime)}</span></div>
          <div class="chat-last">${esc(c.lastMessage||'بداية المحادثة')}</div>
        </div>
      </button>`;
    }).join('') : emptyState('لا توجد محادثات','message')}
    </div>`;
}

function renderMessages(chatId){
  const box = document.getElementById('messagesList');
  if(!box) return;
  const msgs = state.messages[chatId] || [];
  box.innerHTML = msgs.map(m=>{
    const me = m.senderId === state.user.uid;
    return `<div style="align-self:${me?'flex-end':'flex-start'};background:${me?'var(--grad)':'var(--card-2)'};color:${me?'#fff':'var(--txt)'};padding:9px 13px;border-radius:${me?'16px 16px 4px 16px':'16px 16px 16px 4px'};max-width:78%;font-size:13px">${esc(m.text)}</div>`;
  }).join('') || `<div class="muted" style="text-align:center">بداية المحادثة</div>`;
  box.scrollTop = box.scrollHeight;
}

function pageGames(){
  if(state.activeGame){
    const g = GAMES.find(x=>x.id===state.activeGame);
    const rooms = state.rooms.filter(r=>r.gameId === g.id && r.status === 'waiting');
    const isQuiz = g.id === 'g3';
    return `
      <div class="row" style="margin-bottom:14px">
        <button class="icon-btn" data-nav="games" data-reset="game">${ic('back','sm')}</button>
        <div style="flex:1"><div style="font-size:17px;font-weight:900">${g.name}</div>
        <div class="muted" style="font-size:11px">${g.cat} · ${g.online} لاعب</div></div>
        ${isQuiz ? `<span class="pill ok">${ic('play','xs')} قابل للعب</span>` : `<span class="pill">قريباً</span>`}
      </div>
      <div class="card" style="background:${g.grad};border:0;margin-bottom:16px;padding:24px;text-align:center">
        <div style="font-size:34px;margin-bottom:6px">${ic(g.icon)}</div>
        <div style="font-size:19px;font-weight:900">${g.name}</div>
        <div style="font-size:11.5px;opacity:.85;margin-top:4px">${g.modes.join(' · ')}</div>
      </div>

      ${isQuiz ? `
        <div class="section-title">${ic('bolt','sm')} لعب مباشر</div>
        <div class="card" style="margin-bottom:16px">
          <div class="muted" style="line-height:1.8;margin-bottom:12px;font-size:12.5px">
            ابحث عن خصم فوري — ${QUIZ_CONFIG.totalQuestions} أسئلة، ${QUIZ_CONFIG.secondsPerQuestion} ثانية لكل سؤال.
          </div>
          <button class="btn btn-primary" style="width:100%" id="matchmakingBtn" data-game="${g.id}">
            ${ic('play','sm')} لعب مباشر
          </button>
        </div>
      ` : `
        <div class="card" style="margin-bottom:16px;text-align:center;padding:30px">
          ${ic('clock')}
          <div style="font-size:14px;font-weight:800;margin-top:10px">قريباً</div>
          <div class="muted" style="font-size:11.5px;margin-top:6px">هذه اللعبة قيد التطوير</div>
        </div>
      `}

      <div class="section-title">${ic('users','sm')} الغرف المفتوحة</div>
      <div class="card" style="margin-bottom:12px">
        <div class="row" style="margin-bottom:12px">
          <div style="flex:1"><div style="font-size:13px;font-weight:800">غرف عامة</div>
          <div class="muted" style="font-size:10.5px">انضم لأي غرفة</div></div>
          <button class="btn btn-ghost btn-sm" id="createRoomBtn" data-game="${g.id}">${ic('plus','xs')} إنشاء</button>
        </div>
        ${rooms.length ? rooms.map(r=>{
          const host = state.users[r.hostId];
          const isMe = r.hostId === state.user.uid;
          const isFull = (r.players||[]).length >= (r.maxPlayers||2);
          return `<div class="room-item">
            ${avatar(host, 40)}
            <div class="room-info">
              <div class="room-n">${esc(r.name)} ${isMe?'<span class="pill ok" style="font-size:9px">غرفتك</span>':''} ${r.password?'<span class="pill pink" style="font-size:9px">🔐</span>':''}</div>
              <div class="room-m">
                <span>${(r.players||[]).length}/${r.maxPlayers||2}</span>
                <span>${esc(r.mode||'')}</span>
              </div>
            </div>
            ${isMe
              ? (isQuiz
                  ? `<button class="btn btn-primary btn-sm" data-start-quiz="${r.id}">${ic('play','xs')} ابدأ</button>
                     <button class="btn btn-ghost btn-sm" data-invite-room="${r.id}">دعوة</button>`
                  : `<button class="btn btn-ghost btn-sm" data-leave-room="${r.id}">إلغاء</button>`)
              : (isFull
                  ? `<span class="pill">ممتلئة</span>`
                  : `<button class="btn btn-primary btn-sm" data-join-room="${r.id}">انضمام</button>`)}
          </div>`;
        }).join('') : `<div class="empty-sm">لا توجد غرف — أنشئ واحدة</div>`}
      </div>`;
  }
  return `<h1 class="page-title">الألعاب</h1>
    <div class="games-grid">
    ${GAMES.map(g=>`
      <button class="game-card" data-game-open="${g.id}">
        <div class="gc-cover" style="background:${g.grad}">
          <span class="gc-live"><span class="dot"></span>${g.online}</span>
          ${ic(g.icon)}
        </div>
        <div class="gc-body">
          <div class="gc-name">${g.name}</div>
          <div class="gc-meta">
            <span>${g.cat}</span>
            ${g.id === 'g3' ? `<span class="pill ok" style="font-size:9px">${ic('play','xs')} جاهزة</span>` : ''}
          </div>
        </div>
      </button>`).join('')}
    </div>`;
}

/* ============ Teams Page ============ */
function pageTeams(){
  const myTeam = state.profile?.teamId ? state.teams.find(t=>t.id===state.profile.teamId) : null;

if(state.viewingTeamId){
  const t = state.teams.find(x=>x.id===state.viewingTeamId);
  if(!t) return emptyState('الفريق غير موجود','users');
  const isMember = (t.members||[]).includes(state.user.uid);
  const isLeader = t.leaderId === state.user.uid;
  const tab = state.viewingTeamTab || 'info';

  // ابدأ مستمع محادثة الفريق إذا كان عضو
  if(isMember && !state.teamChatUnsub) subscribeToTeamChat(t.id);

  return `
    <div class="row" style="margin-bottom:14px">
      <button class="icon-btn" data-action="back-to-teams">${ic('back','sm')}</button>
      <div style="font-size:15px;font-weight:900">${esc(t.name)}</div>
      <span class="role-chip ${isLeader?'leader':isMember?'member':''}">
        ${isLeader?'قائد':isMember?'عضو':'زائر'}
      </span>
    </div>

    <div class="team-page-hero">
      <div class="team-emblem-lg">${t.emblem||'🛡️'}</div>
      <div class="team-name-lg">${esc(t.name)}</div>
      <div class="team-desc-lg">${esc(t.description||'')}</div>
      <div class="team-hero-stats">
        <div><div class="v">${nf(t.points||0)}</div><div class="l">نقاط</div></div>
        <div><div class="v">${(t.members||[]).length}</div><div class="l">أعضاء</div></div>
        <div><div class="v">${t.level||1}</div><div class="l">مستوى</div></div>
      </div>
      ${isLeader && (t.joinRequests||[]).length ? `
  <div class="section-title">${ic('bell','sm')} طلبات الانضمام (${t.joinRequests.length})</div>
  ${t.joinRequests.map(uid => {
    const u = state.users[uid];
    if(!u) return '';
    return `
      <div class="join-request">
        ${avatar(u, 40)}
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:800">${esc(u.name)}</div>
          <div class="muted" style="font-size:10.5px">@${esc(u.username)}</div>
        </div>
        <button class="btn btn-primary btn-sm" data-approve-join="${uid}" data-team-id="${t.id}">${ic('check','xs')}</button>
        <button class="btn btn-ghost btn-sm" data-reject-join="${uid}" data-team-id="${t.id}">${ic('close','xs')}</button>
      </div>`;
  }).join('')}
` : ''}
    </div>

    ${isMember ? `
      <div class="team-tabs">
        <button class="team-tab ${tab==='info'?'active':''}" data-team-tab="info">معلومات</button>
        <button class="team-tab ${tab==='members'?'active':''}" data-team-tab="members">الأعضاء</button>
        <button class="team-tab ${tab==='chat'?'active':''}" data-team-tab="chat">المحادثة</button>
      </div>
    ` : ''}

    ${tab === 'chat' && isMember ? `
      <div class="team-chat-box" id="teamChatMessages" style="margin-bottom:10px"></div>
      <div style="display:flex;gap:8px">
        <input class="input" id="teamChatInput" placeholder="رسالة للفريق…" style="flex:1" maxlength="500">
        <button class="btn btn-primary" data-send-team-chat="${t.id}" style="padding:10px 16px">${ic('send','sm')}</button>
      </div>
    ` : tab === 'members' ? `
      <div class="section-title">${ic('users','sm')} الأعضاء (${(t.members||[]).length})</div>
${(t.members||[]).map(uid=>{
  const u = state.users[uid];
  if(!u) return '';
  const role = uid === t.leaderId ? 'leader'
    : (t.roles?.[uid] === 'coleader') ? 'coleader' : 'member';
  const roleLabel = role === 'leader' ? '👑 قائد' : role === 'coleader' ? '⭐ نائب' : 'عضو';
  const roleClass = role;
  
  return `
    <div class="card" style="margin-bottom:8px;padding:11px">
      <div class="row">
        ${avatar(u, 40)}
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:800">
            ${esc(u.name)}
            <span class="role-tag ${roleClass}">${roleLabel}</span>
          </div>
          <div class="muted" style="font-size:10.5px">@${esc(u.username)}</div>
        </div>
        <button class="btn btn-ghost btn-sm" data-view-profile="${uid}">عرض</button>
        ${isLeader && uid !== t.leaderId ? `
          <button class="icon-btn" style="width:32px;height:32px;background:rgba(255,61,113,.15);border-color:rgba(255,61,113,.3);color:#ff7b9d" 
                  data-kick-member="${uid}" data-team-id="${t.id}" title="طرد">
            ${ic('trash','xs')}
          </button>
        ` : ''}
      </div>
      ${isLeader && uid !== t.leaderId && role === 'member' ? `
        <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:8px" 
                data-promote="${uid}" data-team-id="${t.id}" data-role="coleader">
          ترقية إلى نائب
        </button>
      ` : ''}
      ${isLeader && role === 'coleader' ? `
        <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:8px" 
                data-promote="${uid}" data-team-id="${t.id}" data-role="member">
          تخفيض إلى عضو
        </button>
      ` : ''}
    </div>`;
}).join('')}
    ` : `
      <div class="pc-actions" style="margin-bottom:14px">
        ${isMember
          ? `<button class="btn btn-danger" data-action="leave-team">مغادرة</button>`
          : (state.profile.teamId
              ? `<button class="btn btn-ghost" disabled style="opacity:.5">أنت في فريق آخر</button>`
              : `<button class="btn btn-primary" data-join-team="${t.id}" style="flex:1">${ic('plus','sm')} انضمام</button>`)}
      </div>
      <div class="card" style="padding:14px">
        <div class="muted" style="font-size:12px;line-height:1.7">
          <b style="color:var(--txt)">القائد:</b> ${esc(state.users[t.leaderId]?.name||'—')}<br>
          <b style="color:var(--txt)">النقاط:</b> ${nf(t.points||0)}<br>
          <b style="color:var(--txt)">المستوى:</b> ${t.level||1}
        </div>
      </div>
    `}
  `;
}

  return `<h1 class="page-title">الفرق</h1>
    ${myTeam ? `
      <div class="team-card">
        <div class="team-row">
          <div class="team-emblem">${myTeam.emblem||'🛡️'}</div>
          <div style="flex:1;min-width:0">
            <div class="team-n">${esc(myTeam.name)} <span class="pill gold" style="font-size:9px">فريقي</span></div>
            <div class="team-m">${(myTeam.members||[]).length} عضو · نقاط ${nf(myTeam.points||0)}</div>
          </div>
          <button class="btn btn-primary btn-sm" data-open-team="${myTeam.id}">فتح</button>
        </div>
      </div>
    ` : `
      <div class="card" style="margin-bottom:14px;text-align:center;padding:22px">
        ${ic('users')}
        <div style="font-size:15px;font-weight:900;margin-top:10px">أنت لست في فريق</div>
        <div class="muted" style="margin:6px 0 14px">انضم إلى فريق أو أنشئ واحداً</div>
        <button class="btn btn-primary" data-action="create-team" style="width:100%">${ic('plus','sm')} إنشاء فريق جديد</button>
      </div>
    `}
    <div class="section-title">${ic('trophy','sm')} ترتيب الفرق</div>
    ${state.teams.length ? state.teams.map((t,i)=>`
      <div class="card" style="margin-bottom:9px;padding:13px;cursor:pointer" data-open-team="${t.id}">
        <div class="row">
          <div class="lb-rank ${i<3?'r'+(i+1):''}">${i+1}</div>
          <div class="team-emblem" style="width:42px;height:42px;font-size:19px;border-radius:13px">${t.emblem||'🛡️'}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13.5px;font-weight:800">${esc(t.name)}</div>
            <div class="muted" style="font-size:10.5px">${(t.members||[]).length} عضو · مستوى ${t.level||1}</div>
          </div>
          <div style="text-align:left">
            <div style="font-size:13px;font-weight:900;color:var(--brand-2)">${nf(t.points||0)}</div>
            <div class="muted" style="font-size:9.5px">نقطة</div>
          </div>
        </div>
      </div>`).join('') : emptyState('لا توجد فرق بعد — كن أول من ينشئ','users')}`;
}

function pageStore(){
  return `
    <div class="row" style="margin-bottom:14px">
      <div class="pill gold" style="font-size:12px;padding:7px 13px">${ic('coin','xs')} ${nf(state.profile?.coins)}</div>
    </div>
    <div class="store-grid">
      ${STORE.map(s=>`
        <div class="store-item">
          <div class="si-cover" style="background:${s.grad}">${s.emoji}</div>
          <div class="si-body">
            <div class="si-n">${s.name}</div>
            <div class="si-buy">
              <div class="si-price">${ic('coin')} ${nf(s.price)}</div>
              <button class="btn btn-primary btn-sm" data-buy-item="${s.id}">شراء</button>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
}

async function pageInventory(){
  await loadMyInventory();
  const equipped = state.profile?.equipped || {};
  const categories = ['frame','title','badge','theme'];
  
  // افتح تبويب "الكل" افتراضياً
  const activeCat = state.invTab || 'all';
  
  const filtered = activeCat === 'all'
    ? state.myInventory
    : state.myInventory.filter(i => (i.category || 'theme') === activeCat);

  return `
    <h1 class="page-title">🎒 مقتنياتي</h1>
    
    <div class="inv-tabs">
      <button class="inv-tab ${activeCat==='all'?'active':''}" data-inv-tab="all">الكل (${state.myInventory.length})</button>
      ${categories.map(c=>{
        const count = state.myInventory.filter(i => (i.category||'theme') === c).length;
        return `<button class="inv-tab ${activeCat===c?'active':''}" data-inv-tab="${c}">
          ${ITEM_CATEGORIES[c].icon}
        </button>`;
      }).join('')}
    </div>

    ${filtered.length ? `
      <div class="inv-grid">
        ${filtered.map(item=>{
          const cat = item.category || 'theme';
          const isEquipped = equipped[cat] === item.id;
          return `
            <div class="inv-item ${isEquipped?'equipped':''}" data-inv-item="${item.id}" data-inv-cat="${cat}">
              ${isEquipped ? '<div class="ii-equipped-badge">مُجهّز</div>' : ''}
              <div class="ii-emoji">${item.emoji || '🎁'}</div>
              <div class="ii-name">${esc(item.name)}</div>
            </div>`;
        }).join('')}
      </div>
    ` : emptyState('لا توجد مقتنيات في هذه الفئة','store')}

    ${Object.entries(equipped).filter(([k,v])=>v).length ? `
      <div class="section-title" style="margin-top:20px">${ic('check','sm')} المُجهّز حالياً</div>
      <div class="card">
        ${Object.entries(equipped).filter(([k,v])=>v).map(([cat, id])=>{
          const item = state.myInventory.find(i => i.id === id);
          if(!item) return '';
          return `
            <div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)">
              <span style="font-size:20px">${item.emoji}</span>
              <div style="flex:1">
                <div style="font-size:12.5px;font-weight:800">${esc(item.name)}</div>
                <div class="muted" style="font-size:10px">${ITEM_CATEGORIES[cat]?.label || cat}</div>
              </div>
              <button class="btn btn-ghost btn-sm" data-unequip="${cat}">إزالة</button>
            </div>`;
        }).join('')}
      </div>
    ` : ''}
  `;
}

/* ============================================================
   📅 تنسيق تاريخ الانضمام
   ============================================================ */
function formatJoinDate(ts){
  if(!ts) return 'حديثاً';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  try {
    return d.toLocaleDateString('ar-EG', { month:'long', year:'numeric' });
  } catch(e){
    return d.toLocaleDateString('ar-SA');
  }
}

/* ============================================================
   🎯 مودال إجراءات اللاعب (لسِواه)
   ============================================================ */
async function openProfileActionsModal(uid){
  const u = state.users[uid];
  if(!u) return;
  if(uid === state.user.uid){
    toast('هذا ملفك الشخصي — استخدم زر تعديل');
    return;
  }

  const blocked = (state.profile.blockedUsers || []).includes(uid);
  const liked   = state.profileLiked[uid];

  /* ★ جلب حالة الثقة */
  let hasTrusted = false;
  try {
    const trustSnap = await getDoc(doc(db, 'trusts', `${state.user.uid}_${uid}`));
    hasTrusted = trustSnap.exists();
  } catch(e){}

  openModal(`
    <div style="text-align:center;margin-bottom:16px">
      ${avatar(u, 60)}
      <div style="font-size:14px;font-weight:900;margin-top:8px">${esc(u.name)}</div>
      <div class="muted" style="font-size:11px">@${esc(u.username)}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px">

      <!-- ★ زر الثقة (الأهم) -->
      <button class="set-row trust-btn ${hasTrusted?'trusted':''}"
              data-toggle-trust="${uid}" data-close-modal="1">
        <span style="font-size:20px">${hasTrusted ? '✅' : '🤝'}</span>
        <span class="sr-txt">
          <span class="sr-n">${hasTrusted ? 'سحب الثقة' : 'منح الثقة'}</span>
          <span class="sr-d">${hasTrusted ? 'أنت تثق بهذا اللاعب' : 'الأهم في السمعة (+100)'}</span>
        </span>
      </button>

      <button class="set-row" data-open-chat="${uid}" data-close-modal="1">
        ${ic('message','sm')} <span class="sr-txt"><span class="sr-n">مراسلة</span></span>
      </button>

      <!-- ★ الإعجاب نهائي -->
      <button class="set-row ${liked?'liked-final':''}"
              ${liked ? 'disabled' : `data-profile-like="${uid}" data-close-modal="1"`}>
        ${ic('heart','sm')} 
        <span class="sr-txt">
          <span class="sr-n">${liked ? 'معجب ✓ (نهائي)' : 'إعجاب الملف'}</span>
          <span class="sr-d">${liked ? 'لا يمكن إزالة الإعجاب' : '+10 شهرة +5 سمعة'}</span>
        </span>
      </button>

      <button class="set-row" data-support="${uid}" data-close-modal="1">
        ${ic('star','sm')} <span class="sr-txt"><span class="sr-n">دعم +10</span></span>
      </button>

      <button class="set-row" data-send-gift="${uid}" data-close-modal="1">
        ${ic('crown','sm')} <span class="sr-txt"><span class="sr-n">إهداء</span></span>
      </button>

      <button class="set-row" data-send-challenge="${uid}" data-close-modal="1">
        ${ic('bolt','sm')} <span class="sr-txt"><span class="sr-n">تحدي</span></span>
      </button>

      <button class="set-row" data-report-target="${uid}" data-report-type="user" data-close-modal="1">
        ${ic('shield','sm')} <span class="sr-txt"><span class="sr-n">إبلاغ</span></span>
      </button>

      <button class="set-row" data-block-user="${uid}" data-close-modal="1"
              style="${blocked?'color:#ff7b9d':''}">
        ${ic('lock','sm')} <span class="sr-txt"><span class="sr-n" style="${blocked?'color:#ff7b9d':''}">${blocked?'إلغاء الحظر':'حظر'}</span></span>
      </button>

      ${state.profile?.role === 'admin' ? `
        <button class="set-row" data-warn-user="${uid}" data-close-modal="1" style="color:#f5c451">
          ${ic('shield','sm')} <span class="sr-txt">
            <span class="sr-n" style="color:#f5c451">تحذير إداري</span>
            <span class="sr-d">−${REPUTATION_WEIGHTS.warningPenalty} سمعة</span>
          </span>
        </button>
      ` : ''}

    </div>
    <div class="row" style="margin-top:14px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إغلاق</button>
    </div>
  `);
}

/* ============================================================
   🖼️ مودال إجراءات الصورة (أفاتار / غلاف)
   ============================================================ */
function openImageActionsModal(type){
  const isAvatar = type === 'avatar';
  const url = isAvatar ? (state.profile.avatarUrl || '') : (state.profile.coverUrl || '');
  const label = isAvatar ? 'الصورة الشخصية' : 'صورة الغلاف';

  openModal(`
    <h3>${label}</h3>
    <div style="display:flex;flex-direction:column;gap:6px;margin-top:14px">
      ${url ? `
        <button class="set-row" data-view-image="${type}">
          ${ic('image','sm')} <span class="sr-txt"><span class="sr-n">عرض الصورة</span></span>
        </button>
        ${!isAvatar ? `
          <button class="set-row" data-recrop-cover="1">
            ${ic('edit','sm')} <span class="sr-txt"><span class="sr-n">إعادة الاقتصاص</span></span>
          </button>
        ` : ''}
      ` : ''}
      <button class="set-row" data-change-image="${type}">
        ${ic('camera','sm')} <span class="sr-txt"><span class="sr-n">${url ? 'تغيير الصورة' : 'إضافة صورة'}</span></span>
      </button>
      ${url ? `
        <button class="set-row" data-delete-image="${type}">
          ${ic('trash','sm')} <span class="sr-txt"><span class="sr-n" style="color:#ff7b9d">حذف الصورة</span></span>
        </button>` : ''}
    </div>
    <div class="row" style="margin-top:14px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إغلاق</button>
    </div>
  `);
}

/* ★ معالج إعادة الاقتصاص */
async function recropCover(){
  const url = state.profile?.coverUrl;
  if(!url) return toast('لا توجد صورة غلاف');

  // استخرج الموضع الحالي
  const current = state.profile.coverPosition || '50% 50%';
  const [curX, curY] = current.split(' ').map(s => parseInt(s) || 50);

  let posX = curX, posY = curY;

  openModal(`
    <h3>✂️ اقتصاص الغلاف</h3>
    <div class="sub">اسحب الشرائط لتحديد الجزء الظاهر</div>

    <div class="crop-preview-wrap">
      <div class="crop-preview-img" id="cropPreviewImg"
           style="background-image:url('${url}');background-position:${curX}% ${curY}%"></div>
      <div class="crop-overlay"></div>
    </div>

    <div class="crop-control">
      <label>
        <span>↕️ الموضع العمودي</span>
        <span class="val" id="cropYVal">${curY}%</span>
      </label>
      <input type="range" class="crop-slider" id="cropY" min="0" max="100" value="${curY}">
    </div>

    <div class="crop-control">
      <label>
        <span>↔️ الموضع الأفقي</span>
        <span class="val" id="cropXVal">${curX}%</span>
      </label>
      <input type="range" class="crop-slider" id="cropX" min="0" max="100" value="${curX}">
    </div>

    <div class="row" style="margin-top:16px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" id="saveRecropBtn">
        ${ic('check','sm')} حفظ
      </button>
    </div>
  `);

  const preview = document.getElementById('cropPreviewImg');
  const sliderX = document.getElementById('cropX');
  const sliderY = document.getElementById('cropY');
  const valX = document.getElementById('cropXVal');
  const valY = document.getElementById('cropYVal');

  const update = () => {
    posX = parseInt(sliderX.value);
    posY = parseInt(sliderY.value);
    preview.style.backgroundPosition = `${posX}% ${posY}%`;
    valX.textContent = `${posX}%`;
    valY.textContent = `${posY}%`;
  };
  sliderX.addEventListener('input', update);
  sliderY.addEventListener('input', update);

  document.getElementById('saveRecropBtn').onclick = async () => {
    try {
      await updateDoc(doc(db, 'users', state.user.uid), {
        coverPosition: `${posX}% ${posY}%`,
      });
      closeModal();
      toast('تم تحديث الاقتصاص ✓');
    } catch(e){
      console.error(e);
      toast('فشل الحفظ');
    }
  };
}

function openImageViewerModal(url){
  if(!url) return toast('لا توجد صورة');
  openModal(`
    <div style="margin-bottom:14px;border-radius:14px;overflow:hidden;background:#000">
      <img src="${esc(url)}" style="width:100%;display:block;max-height:65vh;object-fit:contain">
    </div>
    <div class="row">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إغلاق</button>
    </div>
  `);
}

/* ============================================================
   ✂️ مودال اقتصاص صورة الغلاف
   ============================================================ */
function openCoverCropModal(imageDataUrl, onSave){
  let posX = 50, posY = 50;

  openModal(`
    <h3>✂️ اقتصاص صورة الغلاف</h3>
    <div class="sub">اسحب الشرائط لتحديد الجزء الظاهر</div>

    <div class="crop-preview-wrap">
      <div class="crop-preview-img" id="cropPreviewImg"
           style="background-image:url('${imageDataUrl}');background-position:50% 50%"></div>
      <div class="crop-overlay"></div>
    </div>

    <div class="crop-control">
      <label>
        <span>↕️ الموضع العمودي</span>
        <span class="val" id="cropYVal">50%</span>
      </label>
      <input type="range" class="crop-slider" id="cropY" min="0" max="100" value="50">
    </div>

    <div class="crop-control">
      <label>
        <span>↔️ الموضع الأفقي</span>
        <span class="val" id="cropXVal">50%</span>
      </label>
      <input type="range" class="crop-slider" id="cropX" min="0" max="100" value="50">
    </div>

    <div class="row" style="margin-top:16px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" id="saveCropBtn">
        ${ic('check','sm')} حفظ الغلاف
      </button>
    </div>
  `);

  const preview = document.getElementById('cropPreviewImg');
  const sliderX = document.getElementById('cropX');
  const sliderY = document.getElementById('cropY');
  const valX = document.getElementById('cropXVal');
  const valY = document.getElementById('cropYVal');

  const update = () => {
    posX = parseInt(sliderX.value);
    posY = parseInt(sliderY.value);
    preview.style.backgroundPosition = `${posX}% ${posY}%`;
    valX.textContent = `${posX}%`;
    valY.textContent = `${posY}%`;
  };
  sliderX.addEventListener('input', update);
  sliderY.addEventListener('input', update);

  document.getElementById('saveCropBtn').onclick = () => {
    onSave(`${posX}% ${posY}%`);
    closeModal();
  };
}

async function changeProfileImage(type){
  pickImage(type, async (previewUrl, file) => {
    try {
      const base64 = await imageToBase64(file, type);

      /* ★ الغلاف → افتح مودال الاقتصاص أولاً */
      if(type === 'cover'){
        openCoverCropModal(base64, async (position) => {
          try {
            await updateDoc(doc(db, 'users', state.user.uid), {
              coverUrl: base64,
              coverPosition: position,   /* ★ جديد */
            });
            toast('تم تحديث الغلاف ✓');
          } catch(e){
            console.error(e);
            toast('فشل الحفظ');
          }
        });
        return;
      }

      /* الأفاتار — مباشر */
      await updateDoc(doc(db, 'users', state.user.uid), { avatarUrl: base64 });

      // تحديث صور المنشورات
      try {
        const snap = await getDocs(query(collection(db,'posts'), where('authorId','==',state.user.uid)));
        await Promise.all(snap.docs.map(d => updateDoc(d.ref, { 'author.avatarUrl': base64 })));
      } catch(e){}

      closeModal();
      toast('تم التحديث ✓');
    } catch(e){
      toast(e.message || 'فشل رفع الصورة');
    }
  });
}

async function deleteProfileImage(type){
  if(!confirm('حذف الصورة؟')) return;
  const field = type === 'avatar' ? 'avatarUrl' : 'coverUrl';
  try {
    await updateDoc(doc(db, 'users', state.user.uid), { [field]: '' });
    closeModal();
    toast('تم الحذف');
  } catch(e){ toast('فشل'); }
}

/* ============================================================
   🚫 حظر لاعب
   ============================================================ */
async function toggleBlockUser(uid){
  if(uid === state.user.uid) return toast('لا يمكنك حظر نفسك');

  const blocked = state.profile.blockedUsers || [];
  try {
    if(blocked.includes(uid)){
      await updateDoc(doc(db,'users',state.user.uid), { blockedUsers: arrayRemove(uid) });
      await updateDoc(doc(db,'users',uid), {
        blocksReceived: increment(-1),
        reputation:     increment(REPUTATION_WEIGHTS.blockPenalty),
      });
      toast('تم إلغاء الحظر');
    } else {
      await updateDoc(doc(db,'users',state.user.uid), { blockedUsers: arrayUnion(uid) });
      await updateDoc(doc(db,'users',uid), {
        blocksReceived: increment(1),
        reputation:     increment(-REPUTATION_WEIGHTS.blockPenalty),
      });
      toast('تم الحظر');
    }
  } catch(e){
    toast('فشل');
  }
}

/* ============================================================
   🎒 محتوى تبويب المقتنيات (يُعاد استخدامه)
   ============================================================ */
async function renderInventoryContent(){
  await loadMyInventory();
  const equipped = state.profile?.equipped || {};
  const categories = ['frame','title','badge','theme'];
  const activeCat = state.invTab || 'all';
  const filtered = activeCat === 'all'
    ? state.myInventory
    : state.myInventory.filter(i => (i.category || 'theme') === activeCat);

  return `
    <div class="inv-tabs">
      <button class="inv-tab ${activeCat==='all'?'active':''}" data-inv-tab="all">الكل (${state.myInventory.length})</button>
      ${categories.map(c=>{
        const count = state.myInventory.filter(i => (i.category||'theme') === c).length;
        return `<button class="inv-tab ${activeCat===c?'active':''}" data-inv-tab="${c}">
          ${ITEM_CATEGORIES[c].icon}
        </button>`;
      }).join('')}
    </div>
    ${filtered.length ? `
      <div class="inv-grid">
        ${filtered.map(item=>{
          const cat = item.category || 'theme';
          const isEquipped = equipped[cat] === item.id;
          return `
            <div class="inv-item ${isEquipped?'equipped':''}" data-inv-item="${item.id}" data-inv-cat="${cat}">
              ${isEquipped ? '<div class="ii-equipped-badge">مُجهّز</div>' : ''}
              <div class="ii-emoji">${item.emoji || '🎁'}</div>
              <div class="ii-name">${esc(item.name)}</div>
            </div>`;
        }).join('')}
      </div>
    ` : emptyState('لا توجد مقتنيات في هذه الفئة','store')}
    ${Object.entries(equipped).filter(([k,v])=>v).length ? `
      <div class="section-title" style="margin-top:20px">${ic('check','sm')} المُجهّز حالياً</div>
      <div class="card">
        ${Object.entries(equipped).filter(([k,v])=>v).map(([cat, id])=>{
          const item = state.myInventory.find(i => i.id === id);
          if(!item) return '';
          return `
            <div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)">
              <span style="font-size:20px">${item.emoji}</span>
              <div style="flex:1">
                <div style="font-size:12.5px;font-weight:800">${esc(item.name)}</div>
                <div class="muted" style="font-size:10px">${ITEM_CATEGORIES[cat]?.label || cat}</div>
              </div>
              <button class="btn btn-ghost btn-sm" data-unequip="${cat}">إزالة</button>
            </div>`;
        }).join('')}
      </div>
    ` : ''}
  `;
}

/* ============================================================
   🏅 محتوى تبويب الإنجازات
   ============================================================ */
function renderAchievementsContent(){
  const p = state.profile || {};
  const unlocked = p.achievements || {};
  const all = Object.entries(ACHIEVEMENT_DEFS);
  const done = all.filter(([id]) => unlocked[id]).length;

  return `
    <div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:14px">
      <div class="ach-icon" style="width:56px;height:56px;font-size:26px">🏅</div>
      <div style="flex:1">
        <div style="font-size:15px;font-weight:900">${done} / ${all.length}</div>
        <div class="ach-prog" style="margin-top:8px">
          <span style="width:${(done/all.length*100).toFixed(0)}%"></span>
        </div>
      </div>
    </div>
    ${all.map(([id, def])=>{
      const isUnlocked = !!unlocked[id];
      const tier = TIER_COLORS[def.tier] || TIER_COLORS.bronze;
      return `
        <div class="achievement-card ${isUnlocked?'unlocked':'locked'}">
          <div class="ach-tier-icon ${def.tier}">${def.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:800">${def.name}</div>
            <div class="ach-d">${def.desc}</div>
            <div style="margin-top:5px;font-size:10px;color:${tier.text};font-weight:800">
              ${def.tier.toUpperCase()} · ${def.reward.coins} عملة + ${def.reward.xp} XP
            </div>
          </div>
          ${isUnlocked
            ? `<span class="pill ok" style="font-size:9.5px">✓</span>`
            : `<span class="muted" style="font-size:10px">مقفل</span>`}
        </div>
      `;
    }).join('')}
  `;
}

/* ============================================================
   📊 محتوى تبويب الإحصائيات (مدموج: أساسية + تفصيلية)
   ============================================================ */
async function renderStatsContent(){
  const p = state.profile || {};
  let historyHtml = '';

  try {
    const snap = await getDocs(
      query(collection(db,'users',state.user.uid,'matchHistory'),
            orderBy('playedAt','desc'), limit(100))
    );
    const matches = snap.docs.map(d=>({id:d.id, ...d.data()}));
    const byGame = {};
    matches.forEach(m => {
      const gid = m.gameId || 'g3';
      if(!byGame[gid]) byGame[gid] = { played:0, wins:0, losses:0 };
      byGame[gid].played++;
      if(m.result === 'win') byGame[gid].wins++;
      else byGame[gid].losses++;
    });

    historyHtml = `
      <div class="section-title" style="margin-top:20px">${ic('trophy','sm')} سجل المباريات</div>
      <div class="stat-grid" style="margin-bottom:16px">
        <div class="stat-box"><div class="sv">${matches.length}</div><div class="sl">إجمالي المباريات</div></div>
        <div class="stat-box"><div class="sv">${matches.filter(m=>m.result==='win').length}</div><div class="sl">انتصارات</div></div>
        <div class="stat-box"><div class="sv">${matches.filter(m=>m.result==='loss').length}</div><div class="sl">خسائر</div></div>
        <div class="stat-box"><div class="sv">${matches.length ? Math.round(matches.filter(m=>m.result==='win').length / matches.length * 100) : 0}%</div><div class="sl">نسبة الفوز</div></div>
      </div>

      ${Object.keys(byGame).length ? `
        <div class="section-title">${ic('gamepad','sm')} حسب اللعبة</div>
        ${Object.entries(byGame).map(([gid, stats])=>{
          const g = GAMES.find(x => x.id === gid);
          if(!g) return '';
          const wr = Math.round(stats.wins / stats.played * 100);
          return `
            <div class="game-stat-card">
              <div class="gs-header">
                <div class="gs-icon" style="background:${g.grad}">${ic(g.icon,'sm')}</div>
                <div style="flex:1">
                  <div class="gs-title">${g.name}</div>
                  <div class="gs-sub">${g.cat}</div>
                </div>
              </div>
              <div class="gs-grid">
                <div class="gs-cell"><div class="v">${stats.played}</div><div class="l">مباراة</div></div>
                <div class="gs-cell"><div class="v" style="color:var(--ok)">${stats.wins}</div><div class="l">فوز</div></div>
                <div class="gs-cell"><div class="v" style="color:var(--pink)">${stats.losses}</div><div class="l">خسارة</div></div>
                <div class="gs-cell"><div class="v">${wr}%</div><div class="l">نسبة</div></div>
              </div>
              <div class="gs-wr"><span style="width:${wr}%"></span></div>
            </div>
          `;
        }).join('')}
      ` : ''}

      <div class="section-title">${ic('clock','sm')} آخر 10 مباريات</div>
      ${matches.slice(0, 10).map(m=>`
        <div class="card" style="margin-bottom:8px;padding:11px">
          <div class="row">
            <div style="width:38px;height:38px;border-radius:12px;display:grid;place-items:center;
              background:${m.result==='win'?'rgba(34,197,94,.15)':'rgba(255,61,113,.15)'};
              color:${m.result==='win'?'var(--ok)':'var(--pink)'};font-weight:900;font-size:14px">
              ${m.result==='win'?'✓':'✗'}
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:12.5px;font-weight:800">${esc(m.gameName || 'Quiz Clash')}</div>
              <div class="muted" style="font-size:10px">${timeAgo(m.playedAt)}</div>
            </div>
            <div style="text-align:left">
              <div style="font-size:13px;font-weight:900;color:${m.result==='win'?'var(--ok)':'var(--pink)'}">
                ${m.myScore || 0} - ${m.opponentScore || 0}
              </div>
            </div>
          </div>
        </div>
      `).join('') || emptyState('لا مباريات بعد','gamepad')}
    `;
  } catch(e){ console.error(e); }

  return `
    <div class="stat-grid" style="margin-bottom:16px">
      <div class="stat-box"><div class="sv">${nf(p.fame)}</div><div class="sl">الشهرة</div></div>
      <div class="stat-box"><div class="sv">${nf(p.power)}</div><div class="sl">القوة</div></div>
      <div class="stat-box"><div class="sv">${nf(p.support)}</div><div class="sl">الدعم</div></div>
      <div class="stat-box"><div class="sv">${nf(p.likesProfile)}</div><div class="sl">إعجابات الملف</div></div>
      <div class="stat-box"><div class="sv">${nf(p.likesGames)}</div><div class="sl">إعجابات اللعب</div></div>
      <div class="stat-box"><div class="sv">${nf(p.followers)}</div><div class="sl">المتابِعون</div></div>
    </div>
    ${historyHtml}
  `;
}

/* ============================================================
   📋 محتوى تبويب النشاطات
   ============================================================ */
function renderActivityTimeline(activities){
  const groups = {};
  activities.forEach(a => {
    const d = a.createdAt?.toDate?.() || new Date(a.createdAt || Date.now());
    const key = d.toDateString();
    if(!groups[key]) groups[key] = [];
    groups[key].push(a);
  });

  const typeColors = {
    match:'#6c5ce7', gift_sent:'#f5b301', gift_received:'#22c55e',
    subscription:'#00d2ff', achievement:'#ec4899', team:'#ff8a00',
    post:'#22d3ee', like:'#ff3d71', follow:'#10b981',
  };

  return Object.entries(groups).map(([dateStr, items]) => {
    const date = new Date(dateStr);
    const isToday = new Date().toDateString() === dateStr;
    const isYesterday = new Date(Date.now()-86400000).toDateString() === dateStr;
    const label = isToday ? 'اليوم' : isYesterday ? 'أمس'
      : date.toLocaleDateString('ar-EG', {day:'numeric', month:'long'});

    return `
      <div class="activity-group">
        <div class="activity-date-label">
          <span class="adl-line"></span>
          <span class="adl-text">${label}</span>
          <span class="adl-line"></span>
        </div>
        <div class="activity-timeline">
          ${items.map(a => {
            const color = typeColors[a.type] || '#6c5ce7';
            return `
              <div class="timeline-item">
                <div class="tl-dot" style="background:${color};box-shadow:0 0 12px ${color}88"></div>
                <div class="tl-content">
                  <div class="tl-icon" style="background:${color}18;color:${color}">${a.icon||'📌'}</div>
                  <div class="tl-body">
                    <div class="tl-text">${esc(a.text||'')}</div>
                    <div class="tl-time">${timeAgo(a.createdAt)}</div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderActivityContent(){
  if(!state.activityLog.length) return emptyState('لا نشاطات بعد','clock');
  return `<div class="activity-container">${renderActivityTimeline(state.activityLog)}</div>`;
}

/* ============================================================
   🎁 محتوى تبويب الهدايا
   ============================================================ */
async function renderGiftsContent(){
  try {
    const [rSnap, sSnap] = await Promise.all([
      getDocs(query(collection(db,'gifts'), where('to','==',state.user.uid), limit(100))),
      getDocs(query(collection(db,'gifts'), where('from','==',state.user.uid), limit(100))),
    ]);
    const received = rSnap.docs.map(d=>({id:d.id, ...d.data()}))
      .sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
    const sent = sSnap.docs.map(d=>({id:d.id, ...d.data()}))
      .sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
    const tab = state.giftTab || 'received';
    const list = tab === 'received' ? received : sent;

    return `
      <div class="inv-tabs" style="margin-bottom:14px">
        <button class="inv-tab ${tab==='received'?'active':''}" data-gift-tab="received">
          مستلمة (${received.length})
        </button>
        <button class="inv-tab ${tab==='sent'?'active':''}" data-gift-tab="sent">
          مرسلة (${sent.length})
        </button>
      </div>
      ${list.length ? list.map(g=>`
        <div class="gift-history-item ${tab==='sent'?'sent':'received'}">
          <div style="font-size:26px">${g.giftEmoji || '🎁'}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:12.5px;font-weight:800">
              ${tab === 'received' ? esc(g.fromName || 'مجهول') : esc(state.users[g.to]?.name || 'لاعب')}
            </div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(g.message || g.giftName || '')}</div>
            <div style="font-size:9.5px;color:var(--muted);margin-top:3px">${timeAgo(g.createdAt)}</div>
          </div>
          <div class="pill gold">${ic('coin','xs')} ${nf(g.price || 0)}</div>
        </div>
      `).join('') : emptyState('لا هدايا هنا بعد','star')}
    `;
  } catch(e){
    console.error(e);
    return emptyState('خطأ في التحميل','star');
  }
}

/* ============================================================
   🕒 محتوى تبويب سجل اللعب
   ============================================================ */
function renderHistoryCard(h){
  const isWin = h.result === 'win';
  const diff = (h.myScore||0) - (h.opponentScore||0);
  return `
    <div class="history-card ${isWin?'win':'loss'}">
      <div class="hc-result">
        <div class="hc-icon">${isWin?'🏆':'💔'}</div>
        <div class="hc-badge ${isWin?'win':'loss'}">${isWin?'فوز':'خسارة'}</div>
      </div>
      <div class="hc-body">
        <div class="hc-top">
          <div class="hc-game">${esc(h.gameName||'Quiz Clash')}</div>
          <div class="hc-time">${timeAgo(h.playedAt)}</div>
        </div>
        <div class="hc-scores">
          <div class="hc-score">
            <span class="hc-score-label">أنت</span>
            <span class="hc-score-value ${isWin?'win':''}">${h.myScore||0}</span>
          </div>
          <div class="hc-vs">VS</div>
          <div class="hc-score">
            <span class="hc-score-label">الخصم</span>
            <span class="hc-score-value">${h.opponentScore||0}</span>
          </div>
        </div>
        <div class="hc-diff" style="color:${isWin?'var(--ok)':'var(--pink)'}">
          ${diff > 0 ? '+' : ''}${diff} نقطة
        </div>
      </div>
    </div>
  `;
}

async function renderHistoryContent(){
  try {
    const snap = await getDocs(query(
      collection(db,'users',state.user.uid,'matchHistory'),
      orderBy('playedAt','desc'), limit(50)
    ));
    const history = snap.docs.map(d=>({id:d.id, ...d.data()}));
    if(!history.length) return emptyState('لم تلعب أي مباراة بعد','gamepad');

    const wins = history.filter(h=>h.result==='win').length;
    const losses = history.filter(h=>h.result==='loss').length;
    const wr = Math.round(wins/history.length*100);

    return `
      <div class="history-summary">
        <div class="hs-cell"><div class="hs-val">${history.length}</div><div class="hs-lbl">مباراة</div></div>
        <div class="hs-cell"><div class="hs-val" style="color:var(--ok)">${wins}</div><div class="hs-lbl">فوز</div></div>
        <div class="hs-cell"><div class="hs-val" style="color:var(--pink)">${losses}</div><div class="hs-lbl">خسارة</div></div>
        <div class="hs-cell"><div class="hs-val">${wr}%</div><div class="hs-lbl">نسبة فوز</div></div>
      </div>
      <div class="history-list">${history.map(h=>renderHistoryCard(h)).join('')}</div>
    `;
  } catch(e){
    console.error(e);
    return emptyState('خطأ في التحميل','gamepad');
  }
}

async function purchaseExclusiveItem(itemId, itemType, price){
  const p = state.profile;
  if((p.ownedItems || []).includes(itemId)){
    return toast('تملك هذا العنصر بالفعل');
  }
  if((p.coins || 0) < price){
    return toast(`رصيد غير كافٍ — تحتاج ${nf(price)} عملة`);
  }
  if(!confirm(`شراء هذا العنصر بـ ${nf(price)} عملة؟`)) return;
  
  try {
    await updateDoc(doc(db, 'users', state.user.uid), {
      coins: increment(-price),
      ownedItems: arrayUnion(itemId),
    });
    toast('✨ تم الشراء — يمكنك استخدامه الآن');
  } catch(e){
    console.error(e);
    toast('فشل الشراء');
  }
}

/* ============================================================
   🎮 محتوى تبويب الألعاب
   ============================================================ */
/* ============================================================
   🎮 محتوى تبويب الألعاب — إحصائيات مفصلة لكل لعبة + مستوى
   ============================================================ */
async function renderGamesContent(){
  try {
    const snap = await getDocs(
      query(collection(db,'users',state.user.uid,'matchHistory'),
            orderBy('playedAt','desc'), limit(500))
    );
    const matches = snap.docs.map(d=>({id:d.id, ...d.data()}));

    /* ★ XP افتراضي لكل لعبة: فوز = 100 · خسارة = 30 · 500 XP لكل مستوى */
    const XP_PER_WIN  = 100;
    const XP_PER_LOSS = 30;
    const XP_PER_LVL  = 500;

    // ابنِ إحصائيات كل لعبة (شاملة غير الملعوبة)
    const byGame = {};
    GAMES.forEach(g => {
      byGame[g.id] = {
        played: 0, wins: 0, losses: 0,
        totalScore: 0, bestScore: 0,
        lastPlayed: null, xp: 0,
      };
    });

    matches.forEach(m => {
      const gid = m.gameId || 'g3';
      if(!byGame[gid]) byGame[gid] = {
        played:0, wins:0, losses:0, totalScore:0, bestScore:0, lastPlayed:null, xp:0
      };
      const s = byGame[gid];
      const score = m.myScore || 0;
      s.played++;
      s.totalScore += score;
      if(score > s.bestScore) s.bestScore = score;
      if(m.result === 'win'){ s.wins++;  s.xp += XP_PER_WIN;  }
      else                  { s.losses++; s.xp += XP_PER_LOSS; }
      const ts = m.playedAt?.seconds || 0;
      if(!s.lastPlayed || ts > (s.lastPlayed?.seconds || 0)){
        s.lastPlayed = m.playedAt;
      }
    });

    // فرز: الملعوبة أولاً حسب XP تنازلياً، ثم غير الملعوبة
    const sorted = [...GAMES].sort((a,b)=>{
      const sa = byGame[a.id], sb = byGame[b.id];
      if((sa.played>0) !== (sb.played>0)) return sa.played>0 ? -1 : 1;
      return sb.xp - sa.xp;
    });

    // ملخص علوي
    const totalMatches = matches.length;
    const totalWins = matches.filter(m=>m.result==='win').length;
    const totalXP = Object.values(byGame).reduce((a,s)=>a+s.xp, 0);

    return `
      <div class="stat-grid" style="margin-bottom:16px">
        <div class="stat-box"><div class="sv">${totalMatches}</div><div class="sl">إجمالي المباريات</div></div>
        <div class="stat-box"><div class="sv">${totalWins}</div><div class="sl">انتصارات</div></div>
        <div class="stat-box"><div class="sv">${totalXP}</div><div class="sl">XP من الألعاب</div></div>
        <div class="stat-box"><div class="sv">${
          totalMatches ? Math.round(totalWins / totalMatches * 100) : 0
        }%</div><div class="sl">نسبة الفوز</div></div>
      </div>

      ${sorted.map(g => {
        const s = byGame[g.id];
        const wr  = s.played ? Math.round(s.wins / s.played * 100) : 0;
        const lvl = Math.floor(s.xp / XP_PER_LVL) + 1;
        const curXp = s.xp % XP_PER_LVL;
        const pct   = Math.round(curXp / XP_PER_LVL * 100);
        const avg   = s.played ? Math.round(s.totalScore / s.played) : 0;

        return `
          <div class="game-stat-card game-stat-clickable" data-game-open="${g.id}">
            <div class="gs-header">
              <div class="gs-icon" style="background:${g.grad}">${ic(g.icon,'sm')}</div>
              <div style="flex:1;min-width:0">
                <div class="gs-title">${g.name}</div>
                <div class="gs-sub">
                  ${g.cat}
                  ${s.played
                    ? ` · آخر لعب ${timeAgo(s.lastPlayed)}`
                    : ' · لم تُلعب بعد'}
                </div>
              </div>
              <div class="game-level-badge" style="background:${g.grad}">
                <span class="glb-l">LV</span>
                <span class="glb-v">${lvl}</span>
              </div>
            </div>

            <div class="gs-grid">
              <div class="gs-cell"><div class="v">${s.played}</div><div class="l">مباراة</div></div>
              <div class="gs-cell"><div class="v" style="color:var(--ok)">${s.wins}</div><div class="l">فوز</div></div>
              <div class="gs-cell"><div class="v" style="color:var(--pink)">${s.losses}</div><div class="l">خسارة</div></div>
              <div class="gs-cell"><div class="v">${wr}%</div><div class="l">نسبة فوز</div></div>
            </div>

            <div class="gs-grid" style="margin-top:8px">
              <div class="gs-cell"><div class="v">${nf(s.totalScore)}</div><div class="l">إجمالي النقاط</div></div>
              <div class="gs-cell"><div class="v" style="color:var(--gold)">${nf(s.bestScore)}</div><div class="l">أفضل نتيجة</div></div>
              <div class="gs-cell"><div class="v">${nf(avg)}</div><div class="l">متوسط النقاط</div></div>
              <div class="gs-cell"><div class="v">${nf(s.xp)}</div><div class="l">XP</div></div>
            </div>

            <div class="game-level-progress">
              <div class="glp-top">
                <span>المستوى ${lvl}</span>
                <span>${curXp} / ${XP_PER_LVL} XP</span>
              </div>
              <div class="glp-bar">
                <span style="width:${pct}%;background:${g.grad}"></span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    `;
  } catch(e){
    console.error(e);
    return emptyState('خطأ في التحميل','gamepad');
  }
}

/* ============================================================
   🧭 موجّه محتوى تبويبات الملف
   ============================================================ */
async function renderProfileTabBody(){
  const tab = state.profileTab || 'posts';

  try {
    /* ★ المنشورات (بدون إعادة النشر) */
    if(tab === 'posts'){
      const myPosts = state.posts.filter(x =>
        x.authorId === state.user.uid && !x.reblogOf
      );
      return myPosts.length
        ? myPosts.map(x => postCard(x)).join('')
        : emptyState('لم تنشر بعد','grid');
    }

    /* ★ إعادة النشر */
if(tab === 'reblogs'){
  const myReblogs = state.posts.filter(x =>
    (x.rebloggedBy || []).includes(state.user.uid)
  );
  return myReblogs.length
    ? myReblogs.map(x => postCard(x)).join('')
    : emptyState('لم تعد نشر أي منشور','share');
}

    /* ★ المحفوظات */
    if(tab === 'saved'){
      const saved = state.posts.filter(x => state.saved[x.id]);
      return saved.length
        ? saved.map(x => postCard(x)).join('')
        : emptyState('لا توجد منشورات محفوظة','bookmark');
    }

    if(tab === 'history')      return await renderHistoryContent();
    if(tab === 'games')        return await renderGamesContent();
    if(tab === 'inventory')    return await renderInventoryContent();
    if(tab === 'achievements') return renderAchievementsContent();
    if(tab === 'stats')        return await renderStatsContent();
    if(tab === 'activity')     return renderActivityContent();
    if(tab === 'gifts')        return await renderGiftsContent();

    return emptyState('اختر تبويباً','grid');

  } catch(err) {
    console.error('renderProfileTabBody error:', err);
    return emptyState('تعذّر تحميل المحتوى — حاول مجدداً','close');
  }
}

/* ============================================================
   ⭐ نظام السمعة والثقة والهيبة
   ============================================================ */
const REPUTATION_WEIGHTS = {
  uniqueViewer:   3,      // ★ المشاهدات الفريدة (ضعيف)
  follower:       15,     // ★ المتابعون
  profileLike:    5,      // ★ إعجاب الملف (نهائي)
  trust:          100,    // ★ الثقة (الأهم)

  reportPenalty:  50,     // ★ بلاغ
  blockPenalty:   30,     // ★ حظر
  warningPenalty: 100,    // ★ تنبيه إداري
};

/* حساب السمعة من البيانات (للعرض فقط — الحفظ يتم بـ increment) */
function calculateReputationFromData(u){
  if(!u) return 0;
  const W = REPUTATION_WEIGHTS;

  const positive =
    (u.uniqueViewers || 0)    * W.uniqueViewer +
    (u.followers || 0)        * W.follower +
    (u.likesProfile || 0)     * W.profileLike +
    (u.trustReceived || 0)    * W.trust;

  const negative =
    (u.reportsReceived || 0)  * W.reportPenalty +
    (u.blocksReceived || 0)   * W.blockPenalty +
    (u.warningsReceived || 0) * W.warningPenalty;

  return Math.max(0, positive - negative);
}

/* الهيبة = الشهرة + القوة + السمعة */
function calculateHeba(u){
  if(!u) return 0;
  const rep = typeof u.reputation === 'number'
    ? u.reputation
    : calculateReputationFromData(u);
  return (u.fame || 0) + (u.power || 0) + rep;
}

/* تصنيف المكانة حسب الهيبة */
function getHebaRank(heba){
  if(heba < 500)      return { emoji:'🥚', label:'مبتدئ',   color:'#8a95ad' };
  if(heba < 2000)     return { emoji:'🌱', label:'ناشئ',    color:'#22c55e' };
  if(heba < 5000)     return { emoji:'⭐', label:'معروف',   color:'#00d2ff' };
  if(heba < 15000)    return { emoji:'💎', label:'بارز',    color:'#a78bfa' };
  if(heba < 50000)    return { emoji:'👑', label:'مرموق',   color:'#f5b301' };
  if(heba < 150000)   return { emoji:'🔥', label:'نخبة',    color:'#ff3d71' };
  return                     { emoji:'🌌', label:'أسطورة', color:'#ec4899' };
}

/* ============================================================
   📊 حساب الشهرة والقوة (Requirements 2, 3)
   ============================================================ */
async function calculateFame(uid) {
  try {
    const uSnap = await getDoc(doc(db, 'users', uid));
    if (!uSnap.exists()) return 0;
    const u = uSnap.data();
    const likesProfile = u.likesProfile || 0;
    const support = u.support || 0;
    let giftValue = 0;
    try {
      const gs = await getDocs(query(collection(db, 'gifts'), where('to', '==', uid)));
      giftValue = gs.docs.reduce((s, d) => s + (d.data().price || 0), 0);
    } catch (e) {}
    // الشهرة = إعجابات الملف × 10 + الدعم + قيمة الهدايا ÷ 10
    return likesProfile * 10 + support + Math.floor(giftValue / 10);
  } catch (e) { return 0; }
}

async function calculatePower(uid) {
  try {
    const uSnap = await getDoc(doc(db, 'users', uid));
    if (!uSnap.exists()) return 0;
    const u = uSnap.data();
    const gameLikes = u.likesGames || 0;
    let wins = 0, losses = 0;
    try {
      const ms = await getDocs(collection(db, 'users', uid, 'matchHistory'));
      ms.docs.forEach(d => {
        const m = d.data();
        if (m.result === 'win') wins++; else losses++;
      });
    } catch (e) {}
    const kd = losses > 0 ? wins / losses : wins;
    // القوة = إعجابات اللعب × 2 + K/D × 100
    return gameLikes * 2 + Math.round(kd * 100);
  } catch (e) { return 0; }
}

async function recalcFamePower(uid){
  try {
    const [fame, power] = await Promise.all([
      calculateFame(uid),
      calculatePower(uid),
    ]);

    /* اقرأ reputation الحالي لحساب heba */
    const uSnap = await getDoc(doc(db, 'users', uid));
    const rep = uSnap.exists() ? (uSnap.data().reputation || 0) : 0;
    const heba = fame + power + rep;

    await updateDoc(doc(db, 'users', uid), { fame, power, heba });
  } catch(e){
    console.warn('recalcFamePower:', e);
  }
}

/* ============================================================
   👁️ تسجيل مشاهدة الملف (Requirement 4)
   ============================================================ */
/* ============================================================
   👁️ تسجيل مشاهدة الملف — بدون أي حدود
   (لا sessionStorage، لا نافذة ساعة، كل مشاهدة = +1)
   ============================================================ */
async function recordProfileView(targetUid){
  if(!targetUid || targetUid === state.user.uid) return;

  try {
    const viewId = `${state.user.uid}_${targetUid}`;
    const viewRef = doc(db, 'profileViews', viewId);
    const viewSnap = await getDoc(viewRef);
    const isFirstView = !viewSnap.exists();

    await setDoc(viewRef, {
      viewerId:   state.user.uid,
      targetId:   targetUid,
      lastViewAt: serverTimestamp(),
      views:      increment(1),
    }, { merge: true });

    const updates = {
      views:         increment(1),
      reputation:    increment(REPUTATION_WEIGHTS.uniqueViewer),
    };
    if(isFirstView){
      updates.uniqueViewers = increment(1);
    }

    await updateDoc(doc(db, 'users', targetUid), updates);
  } catch(e){
    console.warn('recordProfileView:', e);
  }
}

/* ============================================================
   👑 شارة الإشراف (Requirement 6)
   ============================================================ */
function getAdminBadge(user) {
  if (!user) return '';
  if (user.role === 'admin') {
    return '<span class="admin-name-badge admin">👑 المشرف العام</span>';
  }
  if (user.role === 'moderator') {
    const labels = {
      games:   '🎮 مشرف ألعاب',
      content: '📝 مشرف محتوى',
      users:   '👥 مشرف مستخدمين',
      data:    '📊 مشرف بيانات',
    };
    return `<span class="admin-name-badge mod">${labels[user.adminTask] || '🛡️ مشرف'}</span>`;
  }
  return '';
}

/* ============================================================
   👥 مودال المتابعين/المتابعات (Requirement 1)
   ============================================================ */
async function openFollowersModal(uid, type) {
  const title = type === 'followers' ? 'المتابعون' : 'يتابع';
  try {
    let ids = [];
    if (type === 'followers') {
      const snap = await getDocs(query(collection(db, 'follows'), where('followingId', '==', uid)));
      ids = snap.docs.map(d => d.data().followerId);
    } else {
      const snap = await getDocs(query(collection(db, 'follows'), where('followerId', '==', uid)));
      ids = snap.docs.map(d => d.data().followingId);
    }
    const users = ids.map(id => state.users[id]).filter(Boolean);

    openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <h3 style="margin:0">${title} (${users.length})</h3>
        <button class="icon-btn" data-action="modal-close">${ic('close','sm')}</button>
      </div>
      <div style="max-height:60vh;overflow-y:auto">
        ${users.length ? users.map(u => `
          <div class="follow-list-item" data-view-profile="${u.uid}" data-close-modal="1">
            ${avatar(u, 44)}
            <div style="flex:1;min-width:0">
              <div class="follow-name">${esc(u.name)} ${getAdminBadge(u)}</div>
              <div class="muted" style="font-size:10.5px">@${esc(u.username)}</div>
            </div>
            ${u.uid !== state.user.uid
              ? `<button class="btn btn-primary btn-sm" data-follow="${u.uid}"
                         onclick="event.stopPropagation()">
                   ${state.followed.has(u.uid) ? '✓' : '+ متابعة'}
                 </button>`
              : '<span class="pill">أنت</span>'}
          </div>
        `).join('') : `<div class="empty" style="padding:30px">${ic('users')}<div>لا ${title} بعد</div></div>`}
      </div>
    `);
  } catch (e) {
    console.error(e);
    toast('فشل تحميل القائمة');
  }
}

/* ============================================================
   👁️ مودال آخر المشاهدات/الإعجابات (Requirement 5)
   ============================================================ */
async function openInteractionsModal(uid, type) {
  const cfg = {
    views:        { title:'👁️ آخر المشاهدات',  coll:'profileViews', field:'targetId', orderBy:'lastViewAt', idField:'viewerId', timeField:'lastViewAt' },
    profileLikes: { title:'❤️ آخر الإعجابات',   coll:'profileLikes', field:'to',       orderBy:'createdAt',  idField:'from',     timeField:'createdAt' },
    gameLikes:    { title:'🎮 إعجابات اللعب',   coll:'gameLikes',    field:'to',       orderBy:'createdAt',  idField:'from',     timeField:'createdAt' },
  }[type];
  if (!cfg) return;

  try {
    let items = [];
    try {
      const snap = await getDocs(query(
        collection(db, cfg.coll),
        where(cfg.field, '==', uid),
        orderBy(cfg.orderBy, 'desc'),
        limit(10)
      ));
      items = snap.docs.map(d => ({
        uid: d.data()[cfg.idField],
        time: d.data()[cfg.timeField],
      })).filter(x => x.uid);
    } catch (e) {
      // في حال عدم وجود index — نستخدم استعلاماً بسيطاً
      const snap = await getDocs(query(collection(db, cfg.coll), where(cfg.field, '==', uid), limit(10)));
      items = snap.docs.map(d => ({ uid: d.data()[cfg.idField], time: d.data()[cfg.timeField] }));
    }

    openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <h3 style="margin:0">${cfg.title}</h3>
        <button class="icon-btn" data-action="modal-close">${ic('close','sm')}</button>
      </div>
      <div style="max-height:60vh;overflow-y:auto">
        ${items.length ? items.map(item => {
          const u = state.users[item.uid];
          if (!u) return '';
          return `
            <div class="follow-list-item" data-view-profile="${u.uid}" data-close-modal="1">
              ${avatar(u, 44)}
              <div style="flex:1;min-width:0">
                <div class="follow-name">${esc(u.name)} ${getAdminBadge(u)}</div>
                <div class="muted" style="font-size:10.5px">@${esc(u.username)}</div>
              </div>
              <span class="muted" style="font-size:10px;white-space:nowrap">${timeAgo(item.time)}</span>
            </div>
          `;
        }).join('') : `<div class="empty" style="padding:30px">${ic('heart')}<div>لا يوجد بعد</div></div>`}
      </div>
    `);
  } catch (e) {
    console.error(e);
    toast('فشل تحميل القائمة');
  }
}

/* ============================================================
   📑 محتوى تبويبات ملف الغير (Requirement 7)
   ============================================================ */
async function renderUserTabBody(uid, tab){
  if(!uid) return emptyState('مستخدم غير موجود','user');

  try {
    /* ★ المنشورات */
    if(tab === 'posts'){
      const posts = state.posts.filter(x => x.authorId === uid && !x.reblogOf);
      return posts.length
        ? posts.map(x => postCard(x)).join('')
        : emptyState('لا منشورات','grid');
    }

    /* ★ إعادة النشر */
if(tab === 'reblogs'){
  const reblogs = state.posts.filter(x =>
    (x.rebloggedBy || []).includes(uid)
  );
  return reblogs.length
    ? reblogs.map(x => postCard(x)).join('')
    : emptyState('لا إعادة نشر','share');
}

    /* ★ سجل اللعب — بدون orderBy */
    if(tab === 'history'){
      try {
        const snap = await getDocs(
          collection(db, 'users', uid, 'matchHistory')
        );
        const history = snap.docs
          .map(d => ({id: d.id, ...d.data()}))
          .sort((a,b) => (b.playedAt?.seconds || 0) - (a.playedAt?.seconds || 0))
          .slice(0, 50);

        if(!history.length) return emptyState('لم يلعب أي مباراة بعد','gamepad');

        const wins   = history.filter(h => h.result === 'win').length;
        const losses = history.filter(h => h.result === 'loss').length;
        const wr     = Math.round(wins / history.length * 100);

        return `
          <div class="history-summary">
            <div class="hs-cell"><div class="hs-val">${history.length}</div><div class="hs-lbl">مباراة</div></div>
            <div class="hs-cell"><div class="hs-val" style="color:var(--ok)">${wins}</div><div class="hs-lbl">فوز</div></div>
            <div class="hs-cell"><div class="hs-val" style="color:var(--pink)">${losses}</div><div class="hs-lbl">خسارة</div></div>
            <div class="hs-cell"><div class="hs-val">${wr}%</div><div class="hs-lbl">نسبة فوز</div></div>
          </div>
          <div class="history-list">${history.map(h => renderHistoryCard(h)).join('')}</div>
        `;
      } catch(e){
        console.error('history error:', e);
        return emptyState('تعذّر تحميل سجل اللعب','gamepad');
      }
    }

    /* ★ النشاطات — بدون orderBy */
    if(tab === 'activity'){
      try {
        const snap = await getDocs(
          collection(db, 'users', uid, 'activity')
        );
        const acts = snap.docs
          .map(d => ({id: d.id, ...d.data()}))
          .sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 50);

        if(!acts.length) return emptyState('لا نشاطات','clock');
        return `<div class="activity-container">${renderActivityTimeline(acts)}</div>`;
      } catch(e){
        console.error('activity error:', e);
        return emptyState('تعذّر تحميل النشاطات','clock');
      }
    }

    /* ★ المقتنيات */
    if(tab === 'inventory'){
      try {
        const snap = await getDocs(
          collection(db, 'users', uid, 'inventory')
        );
        const items = snap.docs.map(d => ({id: d.id, ...d.data()}));
        if(!items.length) return emptyState('لا مقتنيات','store');
        return `
          <div class="inv-grid">
            ${items.map(item => `
              <div class="inv-item" style="cursor:default">
                <div class="ii-emoji">${item.emoji || '🎁'}</div>
                <div class="ii-name">${esc(item.name || '')}</div>
              </div>
            `).join('')}
          </div>
        `;
      } catch(e){
        console.error('inventory error:', e);
        return emptyState('تعذّر تحميل المقتنيات','store');
      }
    }

    /* ★ الإنجازات */
    if(tab === 'achievements'){
      const user = state.users[uid] || {};
      const unlocked = user.achievements || {};
      const all = Object.entries(ACHIEVEMENT_DEFS);
      const done = all.filter(([id]) => unlocked[id]).length;
      return `
        <div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:14px">
          <div class="ach-icon" style="width:56px;height:56px;font-size:26px">🏅</div>
          <div style="flex:1">
            <div style="font-size:15px;font-weight:900">${done} / ${all.length}</div>
            <div class="ach-prog" style="margin-top:8px">
              <span style="width:${(done/all.length*100).toFixed(0)}%"></span>
            </div>
          </div>
        </div>
        ${all.map(([id, def]) => {
          const isUnlocked = !!unlocked[id];
          return `
            <div class="achievement-card ${isUnlocked?'unlocked':'locked'}">
              <div class="ach-tier-icon ${def.tier}">${def.icon}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:800">${def.name}</div>
                <div class="ach-d">${def.desc}</div>
              </div>
              ${isUnlocked ? '<span class="pill ok">✓</span>' : '<span class="muted" style="font-size:10px">مقفل</span>'}
            </div>
          `;
        }).join('')}
      `;
    }

    /* ★ الإحصائيات */
    if(tab === 'stats'){
      const user = state.users[uid] || {};
      let matches = [];
      try {
        const snap = await getDocs(
          collection(db, 'users', uid, 'matchHistory')
        );
        matches = snap.docs.map(d => d.data());
      } catch(e){ console.error('stats history:', e); }
      const wins = matches.filter(m => m.result === 'win').length;
      const losses = matches.filter(m => m.result === 'loss').length;
      return `
        <div class="stat-grid" style="margin-bottom:16px">
          <div class="stat-box"><div class="sv">${nf(user.fame)}</div><div class="sl">الشهرة</div></div>
          <div class="stat-box"><div class="sv">${nf(user.power)}</div><div class="sl">القوة</div></div>
          <div class="stat-box"><div class="sv">${nf(user.support)}</div><div class="sl">الدعم</div></div>
          <div class="stat-box"><div class="sv">${nf(user.views||0)}</div><div class="sl">مشاهدات</div></div>
        </div>
        <div class="stat-grid">
          <div class="stat-box"><div class="sv">${matches.length}</div><div class="sl">مباراة</div></div>
          <div class="stat-box"><div class="sv">${wins}</div><div class="sl">فوز</div></div>
          <div class="stat-box"><div class="sv">${losses}</div><div class="sl">خسارة</div></div>
          <div class="stat-box"><div class="sv">${matches.length ? Math.round(wins/matches.length*100) : 0}%</div><div class="sl">نسبة الفوز</div></div>
        </div>
      `;
    }

    /* ★ الألعاب */
    if(tab === 'games'){
      try {
        const snap = await getDocs(
          collection(db, 'users', uid, 'matchHistory')
        );
        const matches = snap.docs.map(d => d.data());
        const byGame = {};
        GAMES.forEach(g => { byGame[g.id] = { played:0, wins:0, losses:0, xp:0 }; });
        matches.forEach(m => {
          const gid = m.gameId || 'g3';
          if(!byGame[gid]) byGame[gid] = { played:0, wins:0, losses:0, xp:0 };
          byGame[gid].played++;
          if(m.result === 'win'){ byGame[gid].wins++; byGame[gid].xp += 100; }
          else { byGame[gid].losses++; byGame[gid].xp += 30; }
        });
        const hasAny = GAMES.some(g => byGame[g.id].played > 0);
        if(!hasAny) return emptyState('لم يلعب بعد','gamepad');

        return GAMES.map(g => {
          const s = byGame[g.id];
          if(!s.played) return '';
          const wr = Math.round(s.wins/s.played*100);
          const lvl = Math.floor(s.xp/500)+1;
          return `
            <div class="game-stat-card">
              <div class="gs-header">
                <div class="gs-icon" style="background:${g.grad}">${ic(g.icon,'sm')}</div>
                <div style="flex:1">
                  <div class="gs-title">${g.name}</div>
                  <div class="gs-sub">${g.cat}</div>
                </div>
                <div class="game-level-badge" style="background:${g.grad}">
                  <span class="glb-l">LV</span><span class="glb-v">${lvl}</span>
                </div>
              </div>
              <div class="gs-grid">
                <div class="gs-cell"><div class="v">${s.played}</div><div class="l">مباراة</div></div>
                <div class="gs-cell"><div class="v" style="color:var(--ok)">${s.wins}</div><div class="l">فوز</div></div>
                <div class="gs-cell"><div class="v" style="color:var(--pink)">${s.losses}</div><div class="l">خسارة</div></div>
                <div class="gs-cell"><div class="v">${wr}%</div><div class="l">نسبة</div></div>
              </div>
            </div>
          `;
        }).join('');
      } catch(e){
        console.error('games error:', e);
        return emptyState('تعذّر تحميل الألعاب','gamepad');
      }
    }

    /* ★ الهدايا — بدون orderBy */
    if(tab === 'gifts'){
      try {
        const snap = await getDocs(
          query(collection(db, 'gifts'), where('to','==',uid), limit(100))
        );
        const gifts = snap.docs
          .map(d => ({id: d.id, ...d.data()}))
          .sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 50);

        return gifts.length ? gifts.map(g => `
          <div class="gift-history-item received">
            <div style="font-size:26px">${g.giftEmoji || '🎁'}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:12.5px;font-weight:800">${esc(g.fromName || 'مجهول')}</div>
              <div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(g.message || g.giftName || '')}</div>
              <div style="font-size:9.5px;color:var(--muted);margin-top:3px">${timeAgo(g.createdAt)}</div>
            </div>
            <div class="pill gold">${ic('coin','xs')} ${nf(g.price || 0)}</div>
          </div>
        `).join('') : emptyState('لا هدايا','star');
      } catch(e){
        console.error('gifts error:', e);
        return emptyState('تعذّر تحميل الهدايا','star');
      }
    }

    return emptyState('اختر تبويباً','grid');

  } catch(err) {
    console.error('renderUserTabBody top-level error:', err);
    return emptyState('تعذّر تحميل المحتوى','close');
  }
}

/* ============================================================
   📛 الحصول على بيانات التخصيص من الملف (مع defaults)
   ============================================================ */
function getProfileCustomization(p){
  if(!p) return {};
  return {
    /* ============ الأصلي ============ */
    avatarShape:       p.avatarShape       || 'circle',
    avatarBorder:      p.avatarBorder      || 'gradient',
    avatarBorderColor: p.avatarBorderColor || '#6c5ce7',
    avatarBorderWidth: p.avatarBorderWidth || 3,
    profileLayout:     p.profileLayout     || 'default',
    bannerEffect:      p.bannerEffect      || 'none',
    accentColor:       p.accentColor       || '#6c5ce7',
    musicUrl:          p.musicUrl          || '',
    pronouns:          p.pronouns          || '',
    location:          p.location          || '',
    website:           p.website           || '',
    birthday:          p.birthday          || '',
    discord:           p.discord           || '',
    twitter:           p.twitter           || '',
    nameColor:         p.nameColor         || '#ffffff',
    usernameColor:     p.usernameColor     || '#00d2ff',
    titleColor:        p.titleColor        || '#f5b301',
    coverPosition:     p.coverPosition     || '50% 50%',
    nameEffect:        p.nameEffect        || 'none',
    nameGradient:      p.nameGradient      || 'none',
    nameWeight:        p.nameWeight        || 'black',
    usernameEffect:    p.usernameEffect    || 'none',
    usernameWeight:    p.usernameWeight    || 'bold',
    nameBadge:         p.nameBadge         || 'none',
    bioStyle:          p.bioStyle          || 'plain',
    coverBlur:         p.coverBlur         ?? 0,
    coverOverlay:      p.coverOverlay      ?? 0,
    coverBrightness:   p.coverBrightness   ?? 1,
    avatarRotation:    p.avatarRotation    ?? 0,
avatarScale: (() => {
  const v = p.avatarScale;
  if (v == null) return 1;                          // القيمة الافتراضية
  if (v >= 0.5 && v <= 1.5) return v;               // الصيغة الصحيحة
  if (v >= 50  && v <= 150) return v / 100;         // صيغة قديمة خاطئة (100 → 1)
  return 1;                                          // أي قيمة شاذة → الافتراضي
})(),
    avatarFilter:      p.avatarFilter      || 'none',
    nameAnimation:     p.nameAnimation     || 'none',
    cardBorderColor:   p.cardBorderColor   || '',
    cardGlow:          p.cardGlow          || 'none',
    cardShadow:        p.cardShadow        || 'medium',
    levelStyle:        p.levelStyle        || 'default',
    levelColor:        p.levelColor        || '#00d2ff',
    statusEffect:      p.statusEffect      || 'none',
    bgPattern:         p.bgPattern         || 'none',
    joinDateColor:     p.joinDateColor     || '#8a95ad',
    followersBtnColor: p.followersBtnColor || '#00d2ff',
    followersBtnBg:    p.followersBtnBg    || 'transparent',
    locationColor:     p.locationColor     || '#8a95ad',
    levelBarColor:     p.levelBarColor     || '',
    levelTextColor:    p.levelTextColor    || '#ffffff',

    /* ============ 🖼️ الغلاف — جديد ============ */
    coverPattern:       p.coverPattern       || 'none',
    coverPatternColor:  p.coverPatternColor  || '#ffffff',
    coverOverlayStyle:  p.coverOverlayStyle  || 'none',
    coverTint:          p.coverTint          || '',
    coverZoom:          p.coverZoom          ?? 100,
    coverBrightnessNew: p.coverBrightnessNew ?? 100,
    coverContrast:      p.coverContrast      ?? 100,
    coverSaturation:    p.coverSaturation    ?? 100,
    coverVignette:      p.coverVignette      ?? 0,
    coverPreset:        p.coverPreset        || '',

    /* ============ 👤 الأفاتار — جديد ============ */
    avatarDecoration:   p.avatarDecoration   || 'none',
    avatarDecorationColor: p.avatarDecorationColor || '#f5b301',
    avatarBgPattern:    p.avatarBgPattern    || 'none',
    avatarBgColor:      p.avatarBgColor      || '',
    avatarOffsetX:      p.avatarOffsetX      ?? 0,
    avatarOffsetY:      p.avatarOffsetY      ?? 0,
    avatarBreathing:    p.avatarBreathing    || false,

    /* ============ 🖼️ الإطارات — جديد ============ */
    frameColor1:        p.frameColor1        || '#6c5ce7',
    frameColor2:        p.frameColor2        || '#00d2ff',
    frameThickness:     p.frameThickness     ?? 3,
    frameGlowIntensity: p.frameGlowIntensity ?? 60,
    frameRotation:      p.frameRotation      || false,
    frameSpeed:         p.frameSpeed         ?? 3,

    /* ============ ✏️ الاسم — جديد ============ */
    nameGradient2:      p.nameGradient2      || 'none',
    nameSize:           p.nameSize           || 'md',
    nameLetterSpacing:  p.nameLetterSpacing  ?? 0,
    nameFont:           p.nameFont           || 'cairo',
    nameUnderline:      p.nameUnderline      || 'none',
    nameUnderlineColor: p.nameUnderlineColor || '#00d2ff',

    /* ============ @ اسم المستخدم — جديد ============ */
    usernameGradient:   p.usernameGradient   || 'none',
    usernameSize:       p.usernameSize       || 'md',
    usernameLetterSpacing: p.usernameLetterSpacing ?? 0,
    usernameAnimation:  p.usernameAnimation  || 'none',
    usernameBadge:      p.usernameBadge      || 'none',

    /* ============ 📝 النبذة — جديد ============ */
    bioColor:        p.bioColor        || '#b7c2d8',
    bioGradient:     p.bioGradient     || 'none',
    bioEffect:       p.bioEffect       || 'none',
    bioBg:           p.bioBg           || '',
    bioBgOpacity:    p.bioBgOpacity    ?? 100,
    bioBorderColor:  p.bioBorderColor  || '#6c5ce7',
    bioBorderWidth:  p.bioBorderWidth  ?? 2,
    bioAlign:        p.bioAlign        || 'right',
    bioFontSize:     p.bioFontSize     || 'md',
    bioFontWeight:   p.bioFontWeight   || 'normal',
    bioIcon:         p.bioIcon         || '',
    bioIconColor:    p.bioIconColor    || '#00d2ff',

    /* ============ 🎨 الثيم — جديد ============ */
    themeOpacity:     p.themeOpacity     ?? 100,
    themeBlend:       p.themeBlend       || 'normal',
    themeGradientAngle: p.themeGradientAngle ?? 135,
    themePattern:     p.themePattern     || 'none',
    themeGlow:        p.themeGlow        || 'none',

    /* ============ 🃏 البطاقة — جديد ============ */
    cardCorner:       p.cardCorner       || 'rounded',
    cardBorderWidth:  p.cardBorderWidth  ?? 1,
    cardBorderStyle:  p.cardBorderStyle  || 'solid',
    cardInnerPadding: p.cardInnerPadding ?? 16,
    cardOpacity:      p.cardOpacity      ?? 100,
    cardBackdropBlur: p.cardBackdropBlur ?? 14,
    cardHoverEffect:  p.cardHoverEffect  || 'none',
    cardEntrance:     p.cardEntrance     || 'fade',
    cardScrollEffect: p.cardScrollEffect || 'none',
    cardPatternColor: p.cardPatternColor || '#ffffff',

    /* ============ 🏅 المستوى — جديد ============ */
    levelBadgeShape:  p.levelBadgeShape  || 'rounded',
    levelBadgeColor1: p.levelBadgeColor1 || '#6c5ce7',
    levelBadgeColor2: p.levelBadgeColor2 || '#00d2ff',
    levelBarStyle:    p.levelBarStyle    || 'gradient',
    levelBarColor1:   p.levelBarColor1   || '#6c5ce7',
    levelBarColor2:   p.levelBarColor2   || '#00d2ff',
    levelIcon:        p.levelIcon        || '',
    levelShowLabel:   p.levelShowLabel   ?? true,
    levelLabelText:   p.levelLabelText   || 'المستوى',

    /* ============ 🔤 النصوص — جديد ============ */
    globalFont:      p.globalFont      || 'cairo',
    bioTextColor:    p.bioTextColor    || '#b7c2d8',
    joinedTextColor: p.joinedTextColor || '#8a95ad',
    teamTextColor:   p.teamTextColor   || '#f5c451',
    statusTextColor: p.statusTextColor || '#8a95ad',
    pronounsTextColor: p.pronounsTextColor || '#8a95ad',

    /* ============ 💎 أفكار جديدة ============ */
    showParticles:   p.showParticles   || false,
    particleColor:   p.particleColor   || '#00d2ff',
    showSparkles:    p.showSparkles    || false,
    customCursor:    p.customCursor    || 'default',
    profileSoundUrl: p.profileSoundUrl || '',
    bioEmojis:       p.bioEmojis       || '',
    accentButtonColor: p.accentButtonColor || '',

    /* ============ 🆕 تخصيصات الغلاف ============ */
coverHue:          p.coverHue          ?? 0,
coverOpacity:      p.coverOpacity      ?? 100,
coverAnimType:     p.coverAnimType     || 'none',
coverRadius:       p.coverRadius       ?? 0,

/* ============ 🆕 تخصيصات الأفاتار ============ */
avatarOffsetX:     p.avatarOffsetX     ?? 0,
avatarOffsetY:     p.avatarOffsetY     ?? 0,
avatarGlowColor:   p.avatarGlowColor   || '#6c5ce7',
avatarGlowIntensity: p.avatarGlowIntensity ?? 0,
avatarBorderStyle: p.avatarBorderStyle || 'solid',
avatarSize:        p.avatarSize        ?? 88,

/* ============ 🆕 تخصيصات الاسم ============ */
nameShadowColor:   p.nameShadowColor   || '#000000',
nameTransform:     p.nameTransform     || 'none',
nameFontStyle:     p.nameFontStyle     || 'normal',
nameLineHeight:    p.nameLineHeight    ?? 1.3,

/* ============ 🆕 تخصيصات اسم المستخدم ============ */
usernameOpacity:   p.usernameOpacity   ?? 100,
usernameFont:      p.usernameFont      || 'cairo',
usernameShowAt:    p.usernameShowAt    ?? true,
usernameItalic:    p.usernameItalic    ?? false,

/* ============ 🆕 تخصيصات النبذة ============ */
bioLineHeight:     p.bioLineHeight     ?? 1.7,
bioLetterSpacing:  p.bioLetterSpacing  ?? 0,
bioFontFamily:     p.bioFontFamily     || 'cairo',
bioMaxWidth:       p.bioMaxWidth       ?? 100,
bioItalic:         p.bioItalic         ?? false,
bioUnderline:      p.bioUnderline      || 'none',

/* ============ 🆕 تخصيصات الثيم ============ */
themeHue:          p.themeHue          ?? 0,
themeSaturation:   p.themeSaturation   ?? 100,
themeBrightness:   p.themeBrightness   ?? 100,
themeBlur:         p.themeBlur         ?? 0,
accentColor2:      p.accentColor2      || '',
musicVolume:       p.musicVolume       ?? 70,
musicAutoplay:     p.musicAutoplay     ?? false,

/* ============ 🆕 تخصيصات البطاقة ============ */
cardMaxWidth:      p.cardMaxWidth      ?? 100,
cardRotate:        p.cardRotate        ?? 0,
cardPadding:       p.cardPadding       ?? 16,
cardBlendMode:     p.cardBlendMode     || 'normal',
cardZIndex:        p.cardZIndex        ?? 1,

/* ============ 🆕 تخصيصات المستوى ============ */
levelBarHeight:    p.levelBarHeight    ?? 9,
levelTextSize:     p.levelTextSize     || 'md',
levelBadgeSize:    p.levelBadgeSize    || 'md',
levelBadgePosition:p.levelBadgePosition|| 'left',
levelBarSpeed:     p.levelBarSpeed     ?? 2,

/* ============ 🆕 تخصيصات النصوص ============ */
textLetterSpacing: p.textLetterSpacing ?? 0,
textShadowColor:   p.textShadowColor   || 'transparent',
textShadowBlur:    p.textShadowBlur    ?? 0,
textTransform:     p.textTransform     || 'none',

/* ============ 🆕 تخصيصات التأثيرات ============ */
particleCount:     p.particleCount     ?? 15,
particleSpeed:     p.particleSpeed     ?? 5,
sparkleColor:      p.sparkleColor      || '#ffffff',
sparkleCount:      p.sparkleCount      ?? 8,
bgGradient:        p.bgGradient        || 'none',
bgVignette:        p.bgVignette        ?? 0,

    /* ============ ✍️ تخصيصات التواقيع ============ */
    sigStyle:          p.sigStyle          || 'plain',
    sigColor:          p.sigColor          || '#c7d1e6',
    sigGradient:       p.sigGradient       || 'none',
    sigEffect:         p.sigEffect         || 'none',
    sigBg:             p.sigBg             || '',
    sigBgOpacity:      p.sigBgOpacity      ?? 100,
    sigBorderColor:    p.sigBorderColor    || '#6c5ce7',
    sigBorderWidth:    p.sigBorderWidth    ?? 1,
    sigBorderRadius:   p.sigBorderRadius   ?? 10,
    sigFontSize:       p.sigFontSize       || 'md',
    sigFontWeight:     p.sigFontWeight     || 'normal',
    sigFontFamily:     p.sigFontFamily     || 'cairo',
    sigFontStyle:      p.sigFontStyle      || 'italic',
    sigAnimation:      p.sigAnimation      || 'none',
    sigAlign:          p.sigAlign          || 'center',
    sigPadding:        p.sigPadding        ?? 8,
    sigShadow:         p.sigShadow         || 'none',
    sigLetterSpacing:  p.sigLetterSpacing  ?? 0,
    sigLineHeight:     p.sigLineHeight     ?? 1.5,
    sigDisplayCount:   p.sigDisplayCount   ?? 3,
    sigShowAvatar:     p.sigShowAvatar     ?? true,
    sigShowTime:       p.sigShowTime       ?? true,
    sigShowName:       p.sigShowName       ?? true,

    /* ============ 📰 تخصيصات المنشورات ============ */
    postCardStyle:     p.postCardStyle     || 'default',
    postLayout:        p.postLayout        || 'standard',
    postBgColor:       p.postBgColor       || '',
    postBgOpacity:     p.postBgOpacity     ?? 100,
    postBorderColor:   p.postBorderColor   || '',
    postBorderWidth:   p.postBorderWidth   ?? 1,
    postBorderRadius:  p.postBorderRadius  ?? 18,
    postGlow:          p.postGlow          || 'none',
    postAvatarShape:   p.postAvatarShape   || 'circle',
    postAvatarSize:    p.postAvatarSize    ?? 44,
    postShowActions:   p.postShowActions   ?? true,
    postNameColor:     p.postNameColor     || '',
    postTextColor:     p.postTextColor     || '',
  };
}

/* ============================================================
   🎨 أنماط مشتركة للتخصيص — تُستخدم في المعاينة والصفحة الحقيقية
   ============================================================ */
/* ============================================================
   ✏️ بناء نمط الاسم — يحل التعارض بين اللون/التدرج/التأثير/الحركة
   ============================================================ */
function buildNameStyle(cust){
  const weight = FONT_WEIGHTS[cust.nameWeight]?.value || 900;
  const sizeMap = { sm:'15px', md:'19px', lg:'23px', xl:'28px' };
  const size = sizeMap[cust.nameSize] || '19px';
  const font = TEXT_FONTS[cust.nameFont]?.value || "'Cairo',sans-serif";
  const gradient = NAME_GRADIENTS[cust.nameGradient2] || NAME_GRADIENTS[cust.nameGradient] || NAME_GRADIENTS.none;

  let s = `font-weight:${weight};font-size:${size};font-family:${font};`;
  s += `letter-spacing:${cust.nameLetterSpacing}px;`;

  const hasGradient = gradient.css !== 'none';
  const hasRainbowAnim = cust.nameAnimation === 'rainbow';
  const hasEffect = cust.nameEffect !== 'none';

  // ✅ الأولوية: التدرج > اللون، التأثير يُطبَّق كـ drop-shadow مع التدرج
  if(hasGradient && !hasRainbowAnim){
    s += `background:${gradient.css};-webkit-background-clip:text;background-clip:text;color:transparent;`;
    // مع التدرج نستخدم drop-shadow بدلاً من text-shadow (لأنه يتعارض مع color:transparent)
    if(hasEffect){
      const shadow = buildEffectDropShadow(cust.nameEffect, cust.nameColor);
      if(shadow) s += `filter:${shadow};`;
    }
  } else if(hasRainbowAnim){
    // الحركة القزحية تتكفل بالخلفية
    if(hasEffect){
      const shadow = buildEffectDropShadow(cust.nameEffect, cust.nameColor);
      if(shadow) s += `filter:${shadow};`;
    }
  } else {
    // لون عادي + text-shadow
    s += `color:${cust.nameColor};`;
    if(hasEffect){
      const shadow = buildEffectTextShadow(cust.nameEffect, cust.nameColor);
      if(shadow) s += `${shadow};`;
    }
  }

  // ✅ الزخرفة (underline)
  if(cust.nameUnderline && cust.nameUnderline !== 'none'){
    s += buildUnderlineStyle(cust.nameUnderline, cust.nameUnderlineColor);
  }

  return s;
}

function buildEffectTextShadow(effect, color){
  switch(effect){
    case 'glow':    return `text-shadow:0 0 10px ${color}, 0 0 22px ${color}88`;
    case 'shadow':  return `text-shadow:2px 2px 6px rgba(0,0,0,.8)`;
    case 'outline': return `-webkit-text-stroke:1.5px ${color};color:transparent`;
    case 'neon':    return `text-shadow:0 0 4px #fff, 0 0 12px ${color}, 0 0 24px ${color}`;
    default:        return '';
  }
}

function buildEffectDropShadow(effect, color){
  switch(effect){
    case 'glow':    return `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 14px ${color})`;
    case 'shadow':  return `drop-shadow(2px 2px 3px rgba(0,0,0,.8))`;
    case 'neon':    return `drop-shadow(0 0 3px #fff) drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color})`;
    default:        return '';
  }
}

function buildUnderlineStyle(type, color){
  const map = {
    single: `text-decoration:underline;text-decoration-color:${color};text-decoration-thickness:2px;text-underline-offset:3px;`,
    double: `text-decoration:underline double;text-decoration-color:${color};text-decoration-thickness:2px;text-underline-offset:3px;`,
    dotted: `text-decoration:underline dotted;text-decoration-color:${color};text-decoration-thickness:2px;`,
    wavy:   `text-decoration:underline wavy;text-decoration-color:${color};text-decoration-thickness:2px;`,
  };
  return map[type] || '';
}

/* ============================================================
   @ اسم المستخدم
   ============================================================ */
function buildUsernameStyle(cust){
  const weight = FONT_WEIGHTS[cust.usernameWeight]?.value || 700;
  const sizeMap = { sm:'10px', md:'12px', lg:'14px', xl:'16px' };
  const size = sizeMap[cust.usernameSize] || '12px';
  const gradient = NAME_GRADIENTS[cust.usernameGradient] || NAME_GRADIENTS.none;

  let s = `color:${cust.usernameColor};font-weight:${weight};font-size:${size};`;
  s += `letter-spacing:${cust.usernameLetterSpacing}px;`;

  if(gradient.css !== 'none'){
    s += `background:${gradient.css};-webkit-background-clip:text;background-clip:text;color:transparent;`;
    if(cust.usernameEffect === 'glow'){
      s += `filter:drop-shadow(0 0 6px ${cust.usernameColor});`;
    }
  } else if(cust.usernameEffect === 'glow'){
    s += `text-shadow:0 0 10px ${cust.usernameColor};`;
  } else if(cust.usernameEffect === 'shadow'){
    s += `text-shadow:1px 1px 3px rgba(0,0,0,.7);`;
  }

  return s;
}

/* ============================================================
   👤 بناء إطار الأفاتار — يعمل مع كل الأشكال
   ============================================================ */
function buildAvatarFrameHTML(p, size, frameClass){
  const cust = getProfileCustomization(p);
  const shape = AVATAR_SHAPES[cust.avatarShape] || AVATAR_SHAPES.circle;
  const clip = shape.clip || '';
  const radius = shape.clip ? '0' : shape.radius;

  const frameId = p.equipped?.frameId || p.frameId || 'none';
  const frame = FRAME_STYLES[frameId];
  const hasAnimatedFrame = frame && frame.class;

  // لون الإطار (يُستخدم في الحدود الصلبة/التوهج)
  const borderColor = cust.avatarBorderColor || '#6c5ce7';
  const borderWidth = cust.avatarBorderWidth || 3;

  // حاوية الأفاتار
// ✅ Clamp دفاعي — يمنع أي قيمة شاذة من التسبب في حجم خيالي
const safeScale  = Math.max(0.5, Math.min(1.5, cust.avatarScale || 1));
const safeRotate = Math.max(0,   Math.min(360, cust.avatarRotation || 0));
const transform  = `rotate(${safeRotate}deg) scale(${safeScale})`;
  const filter = AVATAR_FILTERS_EXTENDED[cust.avatarFilter]?.css || 'none';

  // ---- طبقة الإطار (خلفية، أكبر بقليل) ----
  const frameThickness = (cust.frameThickness || 3);
  let frameStyle = `
    position:absolute; inset:-${frameThickness}px;
    border-radius:${radius};
    ${clip ? `clip-path:${clip};` : ''}
  `;

  // نمط الإطار حسب النوع
  if(hasAnimatedFrame){
    frameStyle += `background:linear-gradient(135deg,${cust.frameColor1 || '#6c5ce7'},${cust.frameColor2 || '#00d2ff'});`;
    if(frameId === 'neon') frameStyle += `box-shadow:0 0 20px ${cust.frameColor2 || '#00d2ff'}, inset 0 0 20px ${cust.frameColor2 || '#00d2ff'}55;`;
    if(frameId === 'glow') frameStyle += `box-shadow:0 0 20px 3px ${borderColor}aa;`;
    if(frameId === 'gold') frameStyle += `background:linear-gradient(135deg,#f5b301,#ff8a00,#f5b301);`;
    if(frameId === 'fire') frameStyle += `background:linear-gradient(135deg,#ff3d71,#f5b301,#ff3d71);`;
    if(frameId === 'ice')  frameStyle += `background:linear-gradient(135deg,#22d3ee,#0891b2);`;
  } else if(cust.avatarBorder === 'solid'){
    frameStyle += `background:${borderColor};`;
  } else if(cust.avatarBorder === 'gradient'){
    frameStyle += `background:linear-gradient(135deg,${cust.frameColor1 || '#6c5ce7'},${cust.frameColor2 || '#00d2ff'});`;
  } else if(cust.avatarBorder === 'rainbow'){
    frameStyle += `background:conic-gradient(from 0deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#9400d3,#ff0000);`;
  } else if(cust.avatarBorder === 'none'){
    frameStyle += `background:transparent;`;
  }

  // ---- طبقة الصورة (داخلية، بنفس الشكل) ----
  const innerStyle = `
    position:relative; width:100%; height:100%;
    border-radius:${radius};
    ${clip ? `clip-path:${clip};` : ''}
    overflow:hidden;
    transform:${transform};
    filter:${filter};
    transition:transform .3s ease, filter .3s ease;
  `;

  // زخرفة الأفاتار (تاج/هالة/قرون...)
  const decoration = cust.avatarDecoration !== 'none'
    ? `<span class="av-decoration" style="color:${cust.avatarDecorationColor}">${AVATAR_DECORATIONS[cust.avatarDecoration]?.emoji || ''}</span>`
    : '';

  // خلفية الأفاتار
  const bgPattern = cust.avatarBgPattern !== 'none'
    ? `<div class="av-bg av-bg-${cust.avatarBgPattern}" style="--bg-color:${cust.avatarBgColor || cust.frameColor1}"></div>`
    : '';

  return `<div class="av-wrap" style="--s:${size}px; ${cust.avatarBreathing ? 'animation:avBreath 3s ease-in-out infinite;' : ''}">
    <div class="av-frame-layer ${frameClass || ''}" style="${frameStyle}"></div>
    <div class="av-image-layer" style="${innerStyle}">
      ${bgPattern}
      ${p.avatarUrl ? `<img src="${esc(p.avatarUrl)}" style="width:100%;height:100%;object-fit:cover;position:relative;z-index:1">`
        : `<div class="av-initials" style="background:${p.grad || pickGrad(p.uid || '')};position:relative;z-index:1">${esc((p.name||'?').split(/\s+/).map(w=>w[0]).slice(0,2).join(''))}</div>`}
    </div>
    ${decoration}
  </div>`;
}

/* ============================================================
   ✍️ بناء نمط التوقيع
   ============================================================ */
function buildSignatureStyle(cust){
  if(!cust) cust = {};
  const gradient = NAME_GRADIENTS[cust.sigGradient] || NAME_GRADIENTS.none;
  const font = SIGNATURE_FONTS[cust.sigFontFamily]?.value || 'inherit';
  const sizeMap = { sm:'10px', md:'12px', lg:'14px', xl:'16px' };
  const weightMap = { normal:400, medium:600, bold:700, black:900 };

  let s = `font-family:${font};`;
  s += `font-style:${cust.sigFontStyle || 'normal'};`;
  s += `font-weight:${weightMap[cust.sigFontWeight] || 400};`;
  s += `font-size:${sizeMap[cust.sigFontSize] || '12px'};`;
  s += `letter-spacing:${cust.sigLetterSpacing ?? 0}px;`;
  s += `line-height:${cust.sigLineHeight ?? 1.5};`;
  s += `text-align:${cust.sigAlign || 'center'};`;
  s += `padding:${cust.sigPadding ?? 8}px;`;
  s += `border-radius:${cust.sigBorderRadius ?? 10}px;`;
  s += `transition:all .3s ease;`;

  /* اللون / التدرج */
  if(gradient.css !== 'none'){
    s += `background:${gradient.css};-webkit-background-clip:text;background-clip:text;color:transparent;`;
  } else {
    s += `color:${cust.sigColor || '#c7d1e6'};`;
  }

  /* الخلفية */
  if(cust.sigBg){
    const alpha = Math.round(((cust.sigBgOpacity ?? 100) / 100) * 255).toString(16).padStart(2,'0');
    s += `background-color:${cust.sigBg}${alpha};`;
  }

  /* الإطار */
  if((cust.sigBorderWidth ?? 1) > 0){
    s += `border:${cust.sigBorderWidth}px solid ${cust.sigBorderColor || '#6c5ce7'};`;
  } else {
    s += `border:0;`;
  }

  /* الظل */
  const shadowMap = {
    none: '',
    small: 'box-shadow:0 2px 6px rgba(0,0,0,.2);',
    medium: 'box-shadow:0 4px 12px rgba(0,0,0,.3);',
    large: 'box-shadow:0 8px 24px rgba(0,0,0,.45);',
  };
  s += shadowMap[cust.sigShadow] || '';

  /* الأنماط الخاصة */
  const col = cust.sigColor || '#c7d1e6';
  switch(cust.sigStyle){
    case 'quote':
      s += `border-inline-start:3px solid ${col};padding-inline-start:12px;background:rgba(0,210,255,.05);`;
      break;
    case 'card':
      if(!cust.sigBg) s += `background:rgba(255,255,255,.05);`;
      break;
    case 'ribbon':
      if(!cust.sigBg) s += `background:${cust.sigBorderColor};`;
      s += `border-radius:0 ${cust.sigBorderRadius}px ${cust.sigBorderRadius}px 0;`;
      break;
    case 'bubble':
      if(!cust.sigBg) s += `background:rgba(255,255,255,.08);`;
      s += `border-radius:16px;`;
      break;
    case 'glow':
      s += `text-shadow:0 0 8px ${col}, 0 0 16px ${col}88;`;
      break;
    case 'code':
      s += `font-family:ui-monospace, monospace;background:rgba(0,0,0,.35);`;
      break;
    case 'underline':
      s += `text-decoration:underline;text-decoration-color:${col};text-underline-offset:4px;text-decoration-thickness:1.5px;`;
      break;
    case 'dashed':
      s += `border-style:dashed !important;`;
      break;
    case 'gradient':
      if(!cust.sigBg) s += `background:linear-gradient(135deg,${col}22,${cust.sigBorderColor}22);`;
      break;
  }

  /* التأثير */
  if(cust.sigEffect === 'glow') s += `filter:drop-shadow(0 0 6px ${col});`;
  if(cust.sigEffect === 'shadow') s += `filter:drop-shadow(1px 1px 2px rgba(0,0,0,.8));`;
  if(cust.sigEffect === 'neon') s += `filter:drop-shadow(0 0 4px ${col}) drop-shadow(0 0 12px ${col});`;
  if(cust.sigEffect === 'outline') s += `-webkit-text-stroke:1px ${col};`;

  /* الحركة */
  const animKey = cust.sigAnimation || 'none';
  if(animKey !== 'none'){
    s += `animation: sigAnim_${animKey} 3s ease-in-out infinite;`;
  }

  return s;
}

/* ============================================================
   📰 بناء نمط بطاقة المنشور
   ============================================================ */
function buildPostCardStyle(cust, profile){
  if(!cust) cust = {};
  const radius = cust.postBorderRadius ?? 18;
  let s = `border-radius:${radius}px;transition:all .2s;`;

  /* النمط الأساسي */
  switch(cust.postCardStyle){
    case 'minimal':
      s += `background:transparent;border:1px solid var(--line);`;
      break;
    case 'gradient':
      s += `background:linear-gradient(135deg, rgba(108,92,231,.08), rgba(0,210,255,.04));border:1px solid rgba(108,92,231,.25);`;
      break;
    case 'glass':
      s += `background:rgba(255,255,255,.06);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.12);`;
      break;
    case 'bordered':
      s += `background:var(--card);border:2px solid var(--brand-2);`;
      break;
    case 'elevated':
      s += `background:var(--card);border:1px solid var(--line);box-shadow:0 12px 32px rgba(0,0,0,.45);`;
      break;
    case 'outlined':
      s += `background:transparent;border:1.5px dashed var(--line);`;
      break;
    default:
      s += `background:var(--card);border:1px solid var(--line);`;
  }

  /* اللون المخصص للخلفية */
  if(cust.postBgColor){
    const alpha = Math.round(((cust.postBgOpacity ?? 100) / 100) * 255).toString(16).padStart(2,'0');
    s += `background-color:${cust.postBgColor}${alpha} !important;`;
  }

  /* لون الحدود */
  if(cust.postBorderColor){
    s += `border-color:${cust.postBorderColor} !important;`;
  }
  if(cust.postBorderWidth != null){
    s += `border-width:${cust.postBorderWidth}px !important;`;
  }

  /* التوهج */
  const glowMap = {
    none: '',
    soft: 'box-shadow:0 0 16px rgba(0,210,255,.25);',
    strong: 'box-shadow:0 0 28px rgba(0,210,255,.5), 0 0 60px rgba(108,92,231,.25);',
    rainbow: 'box-shadow:0 0 24px rgba(255,0,255,.4), 0 0 48px rgba(0,210,255,.35);',
    gold: 'box-shadow:0 0 24px rgba(245,179,1,.5), 0 0 48px rgba(255,138,0,.25);',
  };
  if(cust.postGlow && cust.postGlow !== 'none'){
    s += glowMap[cust.postGlow];
  }

  /* التخطيط */
  switch(cust.postLayout){
    case 'compact':
      s += `padding:10px 12px;font-size:13px;`;
      break;
    case 'spacious':
      s += `padding:20px;`;
      break;
    case 'magazine':
      s += `padding:16px;border-inline-start:4px solid var(--brand-2);`;
      break;
    default:
      s += `padding:14px;`;
  }

  return s;
}

function buildBioStyle(cust){
  let s = `color:${cust.bioColor};`;
  s += `font-size:${{sm:'11px',md:'12.5px',lg:'14px',xl:'16px'}[cust.bioFontSize] || '12.5px'};`;
  s += `font-weight:${{normal:400,medium:600,bold:700,black:900}[cust.bioFontWeight] || 400};`;
  s += `text-align:${cust.bioAlign || 'right'};`;
  s += `line-height:1.7;white-space:pre-wrap;word-wrap:break-word;`;

  // التدرج
  const gradient = NAME_GRADIENTS[cust.bioGradient] || NAME_GRADIENTS.none;
  if(gradient.css !== 'none'){
    s += `background:${gradient.css};-webkit-background-clip:text;background-clip:text;color:transparent;`;
  }

  // التأثير
  if(cust.bioEffect === 'glow') s += `text-shadow:0 0 8px ${cust.bioColor};`;
  else if(cust.bioEffect === 'shadow') s += `text-shadow:1px 1px 3px rgba(0,0,0,.8);`;

  // الخلفية
  if(cust.bioBg){
    const opacity = cust.bioBgOpacity / 100;
    s += `background:${cust.bioBg}${Math.round(opacity*255).toString(16).padStart(2,'0')};`;
    s += `padding:10px 14px;border-radius:10px;`;
  }

  // الأنماط الخاصة
  const style = cust.bioStyle;
  if(style === 'quote' || style === 'quote_box'){
    s += `padding:10px 14px;border-inline-start:3px solid ${cust.bioBorderColor || 'var(--brand-2)'};background:rgba(0,210,255,.06);border-radius:8px;font-style:italic;`;
  } else if(style === 'italic'){
    s += `font-style:italic;`;
  } else if(style === 'glow'){
    s += `text-shadow:0 0 8px rgba(0,210,255,.4);`;
  } else if(style === 'card'){
    s += `padding:10px 14px;background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:10px;`;
  } else if(style === 'highlight'){
    s += `background:linear-gradient(180deg,transparent 60%,${cust.bioBorderColor || 'rgba(0,210,255,.3)'} 60%);padding:0 4px;`;
  } else if(style === 'dashed'){
    s += `padding:10px 14px;border:2px dashed ${cust.bioBorderColor || 'var(--brand-2)'};border-radius:10px;`;
  } else if(style === 'underline'){
    s += `text-decoration:underline;text-decoration-color:${cust.bioBorderColor || 'var(--brand-2)'};text-underline-offset:4px;`;
  } else if(style === 'code'){
    s += `font-family:monospace;background:rgba(0,0,0,.3);padding:8px 12px;border-radius:8px;border:1px solid ${cust.bioBorderColor || 'var(--line)'};`;
  } else if(style === 'ribbon'){
    s += `padding:10px 16px;background:${cust.bioBorderColor || 'var(--brand-2)'};border-radius:0 8px 8px 0;position:relative;`;
  }

  return s;
}

function buildCoverStyle(p, cust, theme){
  const img = p.coverUrl ? `url('${esc(p.coverUrl)}')` : 'none';
  const pos = p.coverPosition || '50% 50%';
  const zoom = cust.coverZoom || 100;
  const blur = cust.coverBlur || 0;
  const brightness = (cust.coverBrightnessNew ?? 100) / 100;
  const contrast = (cust.coverContrast ?? 100) / 100;
  const saturate = (cust.coverSaturation ?? 100) / 100;

  // خلفية الغلاف
  let bg = img;
  if(!p.coverUrl && cust.coverPreset){
    const preset = COVER_PRESETS.find(x => x.id === cust.coverPreset);
    if(preset) bg = preset.css;
  }
  if(!p.coverUrl && !cust.coverPreset){
    bg = `linear-gradient(135deg,${theme.colors[0]},${theme.colors[1]})`;
  }

  let s = `background-image:${bg};`;
  s += `background-position:${pos};`;
  s += `background-size:${img !== 'none' ? `${zoom}%` : 'cover'};`;
  s += `background-repeat:no-repeat;`;
  s += `filter:blur(${blur}px) brightness(${brightness}) contrast(${contrast}) saturate(${saturate});`;
  if(cust.coverTint){
    s += `background-color:${cust.coverTint};background-blend-mode:multiply;`;
  }
  return s;
}

function buildCoverOverlayHTML(cust){
  let html = '';
  // Overlay
  if(cust.coverOverlayStyle && cust.coverOverlayStyle !== 'none'){
    const cls = `cover-overlay cover-overlay-${cust.coverOverlayStyle}`;
    html += `<div class="${cls}" style="position:absolute;inset:0;pointer-events:none;z-index:1"></div>`;
  }
  // Pattern
  if(cust.coverPattern && cust.coverPattern !== 'none'){
    html += `<div class="cover-pattern cover-pattern-${cust.coverPattern}" style="color:${cust.coverPatternColor};position:absolute;inset:0;pointer-events:none;z-index:2;opacity:.35"></div>`;
  }
  // Vignette
  if(cust.coverVignette > 0){
    html += `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,${cust.coverVignette/100}) 100%);pointer-events:none;z-index:3"></div>`;
  }
  return html;
}

function buildCardStyle(cust){
  const shadowMap = {
    none:'none', small:'0 6px 16px rgba(0,0,0,.3)',
    medium:'0 20px 50px rgba(0,0,0,.45)', large:'0 30px 80px rgba(0,0,0,.65)',
  };
  const glowMap = {
    none:'', soft:'0 0 20px rgba(0,210,255,.4)',
    strong:'0 0 40px rgba(0,210,255,.7), 0 0 80px rgba(108,92,231,.4)',
    rainbow:'0 0 30px rgba(255,0,255,.5), 0 0 60px rgba(0,210,255,.4)',
    gold:'0 0 30px rgba(245,179,1,.6), 0 0 60px rgba(255,138,0,.3)',
  };
  const shadows = [shadowMap[cust.cardShadow] || shadowMap.medium, glowMap[cust.cardGlow] || ''].filter(Boolean);

  const corner = CARD_CORNERS[cust.cardCorner] || CARD_CORNERS.rounded;
  const borderStyle = CARD_BORDER_STYLES[cust.cardBorderStyle] || CARD_BORDER_STYLES.solid;

  return [
    `border-radius:${corner.value}px`,
    `box-shadow:${shadows.join(', ') || 'none'}`,
    cust.cardBorderColor ? `border:${cust.cardBorderWidth || 1}px ${borderStyle.css} ${cust.cardBorderColor}` : 'border:1px solid var(--line)',
    `opacity:${(cust.cardOpacity || 100) / 100}`,
    cust.cardBackdropBlur ? `backdrop-filter:blur(${cust.cardBackdropBlur}px)` : '',
  ].filter(Boolean).join(';');
}

function buildAvatarInnerStyle(_cust){
  return '';
}

/* ============================================================
   👁️ بطاقة المعاينة في استوديو التخصيص
   ============================================================ */
function renderCustomizationPreview(){
  const p = state.profile;
  if(!p) return '';
  const cust = getProfileCustomization(p);
  const theme = THEMES_EXTENDED[p.equipped?.themeId || p.themeId || 'default'] || THEMES_EXTENDED.default;
  const frameClass = FRAME_STYLES[p.equipped?.frameId || p.frameId || 'none']?.class || '';
  const activeZone = state.custActiveZone;
  const badge = NAME_BADGES[cust.nameBadge] || NAME_BADGES.none;

  // ------ overlay pattern للثيم ------
  const themeBgStyle = `
    --tc1:${theme.colors[0]}${Math.round((cust.themeOpacity || 100) * 0.6).toString(16).padStart(2,'0')};
    --tc2:${theme.colors[1]}${Math.round((cust.themeOpacity || 100) * 0.25).toString(16).padStart(2,'0')};
    background:linear-gradient(${cust.themeGradientAngle}deg, ${theme.colors[0]}55, ${theme.colors[1]}22), #0c111c;
  `;

  return `
    <div class="player-card preview-card" style="${buildCardStyle(cust)}">
      <!-- الغلاف + الطبقات -->
      <div class="pc-cover preview-cover cust-zone-target ${activeZone==='cover'?'active':''}"
           data-cust-zone="cover"
           style="${buildCoverStyle(p, cust, theme)}">
        ${buildCoverOverlayHTML(cust)}
        ${!p.coverUrl ? `<div class="preview-cover-fallback" style="background:linear-gradient(135deg,${theme.colors[0]},${theme.colors[1]})">${ic('camera','sm')} <span>غلاف</span></div>` : ''}
        ${cust.bannerEffect !== 'none' ? `<div class="preview-effect effect-${cust.bannerEffect}" style="position:absolute;inset:0;z-index:4"></div>` : ''}
        <div class="cust-zone-hint">${ic('image','xs')} الغلاف</div>
      </div>

      <!-- الجسم -->
      <div class="pc-body-section preview-body-section cust-zone-target ${activeZone==='body'?'active':''}"
           data-cust-zone="body"
           style="${themeBgStyle}position:relative">
        ${buildBgPattern(cust.bgPattern)}
        <div class="pc-body preview-body">
          <div class="pc-info preview-info">
            <!-- الاسم -->
            <div class="pc-nick preview-name anim-name-${cust.nameAnimation} cust-zone-target ${activeZone==='name'?'active':''}"
                 data-cust-zone="name" style="${buildNameStyle(cust)}">
              ${badge.emoji ? `<span style="margin-inline-end:4px">${badge.emoji}</span>` : ''}
              ${esc(p.name)}
              <span class="cust-zone-hint-inline">${ic('edit','xs')}</span>
            </div>
            <!-- اسم المستخدم -->
            <div class="pc-user preview-user cust-zone-target ${activeZone==='username'?'active':''}"
                 data-cust-zone="username" style="${buildUsernameStyle(cust)}">
              @${esc(p.username)}
            </div>
            <!-- تاريخ الانضمام -->
            <div class="pc-joined" style="color:${cust.joinDateColor}">
              ${ic('clock','xs')} انضم حديثاً
            </div>
            <!-- النبذة -->
            <div class="pc-bio cust-zone-target ${activeZone==='bio'?'active':''}"
                 data-cust-zone="bio"
                 style="${buildBioStyle(cust)}">
              ${cust.bioIcon ? `<span style="color:${cust.bioIconColor};margin-inline-end:4px">${cust.bioIcon}</span>` : ''}
              ${esc(p.bio || 'نبذة قصيرة عن نفسك…')}
            </div>
          </div>

          <!-- الأفاتار -->
          <div class="avatar-sig-wrapper" style="margin-top:-40px">
            <div class="pc-avatar cust-zone-target ${activeZone==='avatar'?'active':''}"
                 data-cust-zone="avatar" style="margin-top:0">
              ${avatar(p, 82, frameClass)}
              <div class="cust-zone-hint-avatar">${ic('camera','xs')}</div>
            </div>
          </div>
        </div>

        <!-- شريط المستوى -->
        <div class="pc-level">
          <div class="pc-level-bar level-bar-${cust.levelBarStyle || 'gradient'}">
            <span style="width:45%;
                         ${cust.levelBarColor
                           ? `background:${cust.levelBarColor};box-shadow:0 0 14px ${cust.levelBarColor};`
                           : `background:linear-gradient(90deg, ${cust.levelBarColor1}, ${cust.levelBarColor2});`}"></span>
          </div>
          <div class="pc-level-num"
               style="background:linear-gradient(135deg, ${cust.levelBadgeColor1}, ${cust.levelBadgeColor2});
                      ${cust.levelBadgeShape === 'hexagon' ? 'clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);' : ''}
                      ${cust.levelBadgeShape === 'star'    ? 'clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);' : ''}">
            ${cust.levelIcon || ''} ${cust.levelShowLabel ? (cust.levelLabelText || 'المستوى') + ' 1' : '1'}
          </div>
        </div>

        <!-- ★★★ صف المتابعين — قابل للتخصيص وقابل للنقر ★★★ -->
        <div class="pc-social-row cust-zone-target ${activeZone==='texts'?'active':''}"
             data-cust-zone="texts"
             style="--btn-bg:${cust.followersBtnBg === 'transparent' ? 'rgba(0,0,0,.18)' : cust.followersBtnBg};
                    --btn-fg:${cust.followersBtnColor};
                    --btn-label-fg:${cust.followersBtnColor};">
          <button class="pc-social-btn" type="button">
            <b>${nf(p.followers || 128)}</b>
            <small>متابع</small>
          </button>
          <button class="pc-social-btn" type="button">
            <b>${nf(p.following || 42)}</b>
            <small>متابَع</small>
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   🔍 فحص توفر اسم المستخدم
   ============================================================ */
let _usernameCheckTimer = null;
async function checkUsernameAvailability(username, statusEl){
  if(!statusEl) return;
  username = (username || '').trim().toLowerCase();

  if(!username){
    statusEl.className = 'username-status idle';
    statusEl.textContent = '';
    return;
  }

  // نفس اسمه الحالي — متاح
  if(username === (state.profile.username || '').toLowerCase()){
    statusEl.className = 'username-status available';
    statusEl.textContent = '✓';
    return;
  }

  // تنسيق
  if(!/^[a-z0-9_]{3,20}$/.test(username)){
    statusEl.className = 'username-status taken';
    statusEl.textContent = '✗';
    return;
  }

  statusEl.className = 'username-status checking';
  statusEl.textContent = '…';

  clearTimeout(_usernameCheckTimer);
  _usernameCheckTimer = setTimeout(async () => {
    try {
      const snap = await getDoc(doc(db, 'usernames', username));
      if(snap.exists() && snap.data().uid !== state.user.uid){
        statusEl.className = 'username-status taken';
        statusEl.textContent = '✗';
      } else {
        statusEl.className = 'username-status available';
        statusEl.textContent = '✓';
      }
    } catch(e){
      statusEl.className = 'username-status idle';
      statusEl.textContent = '';
    }
  }, 350);
}

/* ============================================================
   💾 حفظ حقل تخصيص واحد
   ============================================================ */
async function saveCustomField(field, value){
  try{
    await updateDoc(doc(db, 'users', state.user.uid), { [field]: value });
    if(state.profile) state.profile[field] = value;
    updateZonePreview();       // ★ تحديث المعاينة فوق التبويبات
    return true;
  }catch(e){
    console.error('❌ saveCustomField FAILED:', { field, value, code: e.code, message: e.message });
    if(e.code === 'permission-denied') toast(`🔒 القاعدة لا تسمح بحفظ "${field}"`);
    else toast('فشل حفظ ' + field);
    return false;
  }
}

function buildBgPattern(pattern){
  if(!pattern || pattern === 'none') return '';
  return `<div class="bg-pattern bg-${pattern}" aria-hidden="true"></div>`;
}

function buildEffectiveLevelStyle(cust, levelStyle){
  if(cust.levelColor && cust.levelColor !== '#00d2ff'){
    return `background:${cust.levelColor};color:#070a11;`;
  }
  return levelStyle || '';
}

function buildLevelStyle(cust, levelStyle){
  // إذا المستخدم اختار لوناً مخصصاً — يستخدمه كخلفية بدلاً من الستايل
  if(cust.levelColor && cust.levelColor !== '#00d2ff'){
    return `background:${cust.levelColor};color:#070a11;box-shadow:0 4px 12px ${cust.levelColor}66;`;
  }
  return levelStyle;
}

function pageProfile(){ // ★ تم إزالة async
  const p = state.profile;
  if(!p){
    setTimeout(() => {
      const el = document.getElementById('app');
      if(el && state.page === 'profile' && !state.profile){
        const box = el.querySelector('.empty');
        if(box){
          box.innerHTML = `
            ${ic('user')}
            <div>تعذّر تحميل الملف الشخصي</div>
            <button class="btn btn-primary btn-sm" style="margin-top:12px" data-action="retry-profile">
              ${ic('check','xs')} إعادة المحاولة
            </button>`;
        }
      }
    }, 5000);

    return `<div class="empty" style="padding-top:80px">
      <div class="spinner"></div>
      <div>جاري تحميل الملف الشخصي…</div>
    </div>`;
  }

const tabs = [
  {id:'posts',        label:'المنشورات',   icon:'grid'},
  {id:'reblogs',      label:'إعادة النشر', icon:'share'},       // ★
  {id:'saved',        label:'المحفوظات',   icon:'bookmark'},
  {id:'history',      label:'سجل اللعب',   icon:'clock'},
  {id:'games',        label:'الألعاب',     icon:'gamepad'},
  {id:'inventory',    label:'المقتنيات',   icon:'store'},
  {id:'achievements', label:'الإنجازات',   icon:'medal'},
  {id:'stats',        label:'الإحصائيات',  icon:'chart'},
  {id:'activity',     label:'النشاطات',    icon:'clock'},
  {id:'gifts',        label:'الهدايا',     icon:'star'},
];

  const validIds = tabs.map(t=>t.id);
  if(!validIds.includes(state.profileTab)) state.profileTab = 'posts';

  const prog = xpProgress(p.xp || 0);
  const cust = getProfileCustomization(p);

  const theme = THEMES[p.equipped?.themeId || p.themeId || 'default'] || THEMES.default;
  const frameClass = ANIMATED_FRAMES[p.equipped?.frameId || p.frameId || 'none']?.class || '';
  const avatarShapeClass = `shape-${cust.avatarShape}`;
  const avatarBorderClass = `border-${cust.avatarBorder}`;

const levelStyle = {
  default:'', badge:'background:linear-gradient(135deg,#a78bfa,#6c5ce7);',
  gem:'background:linear-gradient(135deg,#00d2ff,#0891b2);',
  crown:'background:linear-gradient(135deg,#f5b301,#ff8a00);',
  star:'background:linear-gradient(135deg,#ec4899,#f43f5e);',
  minimal:'background:rgba(255,255,255,.1);color:#fff;',
}[cust.levelStyle] || '';

  const levelBarBg = cust.levelBarColor ? `background:${cust.levelBarColor};box-shadow:0 0 14px ${cust.levelBarColor};` : '';
  const levelBadgeBg = cust.levelTextColor ? `background:${cust.levelTextColor};color:#070a11;` : '';

setTimeout(() => {
    // 1. التواقيع
    getDocs(query(collection(db, 'users', state.user.uid, 'signatures'), orderBy('createdAt', 'desc'), limit(3)))
      .then(sSnap => {
        const signatures = sSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const sigContainer = document.getElementById('mySigSlider');
        if (sigContainer) {
          if (signatures.length > 0) {
            sigContainer.innerHTML = signatures.map((s, idx) => `
              <div class="sig-preview-item" style="animation-delay: ${idx * 3}s;">"${esc(s.text)}"</div>
            `).join('');
          } else {
            sigContainer.innerHTML = `<div class="sig-preview-item" style="animation:none; opacity:0.6; color:#64748b;">✍️ لا تواقيع</div>`;
          }
        }
      }).catch(e => console.warn('signatures:', e));

/* ★ بطاقة السمعة */
try {
  const repBox = document.getElementById('reputationBox');
  if(repBox){
    const p = state.profile;
    const rep = typeof p.reputation === 'number'
      ? p.reputation
      : calculateReputationFromData(p);
    const heba = calculateHeba({ ...p, reputation: rep });
    const rank = getHebaRank(heba);

    repBox.innerHTML = `
      <div class="rep-header">
        <div class="rep-icon" style="background:${rank.color}22;color:${rank.color};border:1px solid ${rank.color}55">
          ${rank.emoji}
        </div>
        <div style="flex:1">
          <div class="rep-rank-label" style="color:${rank.color}">${rank.label}</div>
          <div class="rep-heba-value">${nf(heba)} <span>هيبة</span></div>
        </div>
      </div>

      <div class="rep-formula">
        <span>شهرة ${nf(p.fame)}</span>
        <span>+</span>
        <span>قوة ${nf(p.power)}</span>
        <span>+</span>
        <span>سمعة ${nf(rep)}</span>
      </div>

      <div class="rep-breakdown">
        <div class="rb-row"><span class="rb-lbl">🤝 ثقة</span><span class="rb-val pos">+${nf((p.trustReceived||0)*100)}</span></div>
        <div class="rb-row"><span class="rb-lbl">👥 متابعون</span><span class="rb-val pos">+${nf((p.followers||0)*15)}</span></div>
        <div class="rb-row"><span class="rb-lbl">❤️ إعجابات الملف</span><span class="rb-val pos">+${nf((p.likesProfile||0)*5)}</span></div>
        <div class="rb-row"><span class="rb-lbl">👁️ مشاهدون فريدون</span><span class="rb-val pos">+${nf((p.uniqueViewers||0)*3)}</span></div>
        ${(p.reportsReceived||0) > 0 ? `<div class="rb-row"><span class="rb-lbl">🚨 بلاغات</span><span class="rb-val neg">−${nf((p.reportsReceived||0)*50)}</span></div>` : ''}
        ${(p.blocksReceived||0) > 0 ? `<div class="rb-row"><span class="rb-lbl">🚫 حظر</span><span class="rb-val neg">−${nf((p.blocksReceived||0)*30)}</span></div>` : ''}
        ${(p.warningsReceived||0) > 0 ? `<div class="rb-row"><span class="rb-lbl">⚠️ تنبيهات</span><span class="rb-val neg">−${nf((p.warningsReceived||0)*100)}</span></div>` : ''}
      </div>
    `;
  }
} catch(e){
  console.warn('rep card:', e);
}

    // 2. محتوى التبويب — ★ مع حماية صارمة
    renderProfileTabBody()
      .then(bodyHtml => {
        const bodyContainer = document.getElementById('profileTabBody');
        if (bodyContainer) bodyContainer.innerHTML = bodyHtml || emptyState('لا محتوى','grid');
      })
      .catch(e => {
        console.error('Tab body error:', e);
        const bodyContainer = document.getElementById('profileTabBody');
        if (bodyContainer) bodyContainer.innerHTML = emptyState('تعذّر تحميل المحتوى','close');
      });
  }, 50);

  return `
    <div class="player-card" style="${buildCardStyle(cust)}">
<div class="pc-cover" data-action="cover-click" style="cursor:pointer;${buildCoverStyle(p, cust, theme)}">
  ${buildCoverOverlayHTML(cust)}
  ${!p.coverUrl ? `
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,${theme.colors[0]},${theme.colors[1]});display:grid;place-items:center;color:rgba(255,255,255,.55);font-size:13px;font-weight:800;z-index:1">
      ${ic('camera','sm')} اضغط لإضافة غلاف
    </div>` : ''}
  ${cust.bannerEffect !== 'none' ? `<div class="preview-effect effect-${cust.bannerEffect}" style="position:absolute;inset:0;z-index:4"></div>` : ''}
</div>

<!-- ★ حُذف .pc-card-actions — انتقل إلى شريط الرأس -->

<div class="pc-body-section" style="--tc1:${theme.colors[0]}35;--tc2:${theme.colors[1]}12;position:relative">
  ${buildBgPattern(cust.bgPattern)}
  <div class="pc-body">
          <div class="pc-info">
            <div class="pc-nick anim-name-${cust.nameAnimation}" style="${buildNameStyle(cust)}">
              ${(NAME_BADGES[cust.nameBadge]||NAME_BADGES.none).emoji ? `<span style="margin-inline-end:4px">${(NAME_BADGES[cust.nameBadge]||NAME_BADGES.none).emoji}</span>` : ''}
              ${esc(p.name)} ${getAdminBadge(p)}
              ${cust.pronouns ? `<span class="pc-pronouns">${esc(cust.pronouns)}</span>` : ''}
            </div>
            <div class="pc-user" style="${buildUsernameStyle(cust)}">@${esc(p.username)}</div>
            <div class="pc-joined" style="color:${cust.joinDateColor}">
              ${ic('clock','xs')} انضم ${formatJoinDate(p.createdAt)}
            </div>

            ${p.teamName ? `<div class="pc-team">${p.teamEmblem||'🛡️'} ${esc(p.teamName)}</div>` : ''}

            ${(cust.location || cust.website || cust.twitter || cust.discord) ? `
              <div class="pc-meta-row">
                ${cust.location ? `<span style="color:${cust.locationColor}">${ic('location','xs')} ${esc(cust.location)}</span>` : ''}
                ${cust.website ? `<a href="${esc(cust.website)}" target="_blank" rel="noopener">${ic('globe','xs')} ${esc(cust.website.replace(/^https?:\/\//,'').slice(0,30))}</a>` : ''}
                ${cust.twitter ? `<span>${ic('share','xs')} ${esc(cust.twitter)}</span>` : ''}
                ${cust.discord ? `<span>${ic('message','xs')} ${esc(cust.discord)}</span>` : ''}
              </div>` : ''}

            <div class="pc-bio" style="${buildBioStyle(cust)}">${esc(p.bio||'').replace(/\n/g,'<br>')}</div>
          </div>

<div class="avatar-sig-wrapper">
  <div class="pc-avatar" data-action="avatar-click" style="cursor:pointer">
    ${avatar(p, 82, frameClass, false, buildAvatarInnerStyle(cust))}
  </div>
            <div class="sig-slider-preview" id="mySigSlider">
              <div class="sig-preview-item" style="animation:none; opacity:0.5;">جاري التحميل...</div>
            </div>
          </div>
        </div>

${(() => {
  const lvlShape = LEVEL_BADGE_SHAPES[cust.levelBadgeShape] || LEVEL_BADGE_SHAPES.rounded;
  const lvlIcon  = cust.levelIcon ? `<span style="margin-inline-end:3px">${cust.levelIcon}</span>` : '';
  const lvlLabel = cust.levelShowLabel ? (cust.levelLabelText || 'المستوى') + ' ' : '';
  const lvlNum   = cust.levelShowLabel ? (p.level || 1) : `${p.level || 1}`;
  const badgeBg = `linear-gradient(135deg, ${cust.levelBadgeColor1}, ${cust.levelBadgeColor2})`;
  const badgeStyle = `
    background:${badgeBg};
    ${cust.levelBadgeShape === 'hexagon' ? 'clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);' : ''}
    ${cust.levelBadgeShape === 'star'    ? 'clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);' : ''}
    ${cust.levelBadgeShape === 'diamond' ? 'transform:rotate(45deg);' : ''}
    ${cust.levelBadgeShape === 'diamond' ? 'padding:6px;' : ''}
  `;
  return `
  <div class="pc-level">
    <div class="pc-level-bar level-bar-${cust.levelBarStyle || 'gradient'}">
      <span style="width:${Math.min(100, (p.xp || 0) % 100)}%;
                   ${cust.levelBarColor ? `background:${cust.levelBarColor};box-shadow:0 0 14px ${cust.levelBarColor};` :
                     `background:linear-gradient(90deg, ${cust.levelBarColor1}, ${cust.levelBarColor2});`}"></span>
    </div>
    <div class="pc-level-num" style="${badgeStyle}" title="${lvlLabel}${lvlNum}">
      ${cust.levelBadgeShape === 'diamond' ? `<div style="transform:rotate(-45deg)">${lvlIcon}${lvlLabel}${lvlNum}</div>` : `${lvlIcon}${lvlLabel}${lvlNum}`}
    </div>
  </div>`;
})()}

  <!-- ★★★ صف المتابعين — مع تطبيق التخصيصات ★★★ -->
  <div class="pc-social-row"
       style="--btn-bg:${cust.followersBtnBg === 'transparent' ? 'rgba(0,0,0,.18)' : cust.followersBtnBg};
              --btn-fg:${cust.followersBtnColor};
              --btn-label-fg:${cust.followersBtnColor};">
    <button class="pc-social-btn" data-action="show-followers" data-uid="${p.uid}" data-type="followers">
      <b>${nf(p.followers)}</b>
      <small>متابع</small>
    </button>
    <button class="pc-social-btn" data-action="show-followers" data-uid="${p.uid}" data-type="following">
      <b>${nf(p.following)}</b>
      <small>متابَع</small>
    </button>
  </div>

      </div>
    </div>

    <div class="pc-stats">
      <div class="pc-stat f"><div class="v">${nf(p.fame)}</div><div class="l">الشهرة</div></div>
      <div class="pc-stat p"><div class="v">${nf(p.power)}</div><div class="l">القوة</div></div>
      <div class="pc-stat s"><div class="v">${nf(p.support)}</div><div class="l">الدعم</div></div>
    </div>

    <div class="reputation-card" id="reputationBox">
      <div class="spinner" style="margin:20px auto;width:24px;height:24px"></div>
    </div>

    <div class="pc-interactions">
      <button class="pci-chip" data-action="show-interactions" data-uid="${p.uid}" data-type="views">
        ${ic('eye','xs')} <b>${nf(p.views||0)}</b> مشاهدة
      </button>
      <button class="pci-chip" data-action="show-interactions" data-uid="${p.uid}" data-type="profileLikes">
        ${ic('heart','xs')} <b>${nf(p.likesProfile)}</b> إعجاب
      </button>
      <button class="pci-chip" data-action="show-interactions" data-uid="${p.uid}" data-type="gameLikes">
        ${ic('gamepad','xs')} <b>${nf(p.likesGames)}</b> لعب
      </button>
    </div>

    <div class="level-widget">
      <div class="level-top">
        <div class="level-badge" style="${levelStyle}">${prog.level}</div>
        <div class="level-info">
          <div class="ln">المستوى ${prog.level}</div>
          <div class="lx">${prog.current} / ${prog.needed} XP حتى المستوى ${prog.level + 1}</div>
        </div>
        <div class="status-chip" data-action="edit-status">
          <span class="status-dot" style="background:${PLAYER_STATUSES[p.status || 'available'].color}"></span>
          ${PLAYER_STATUSES[p.status || 'available'].label}
        </div>
      </div>
      <div class="level-bar"><span style="width:${prog.pct}%;${levelBarBg}"></span></div>
      ${p.statusMsg ? `<div class="muted" style="font-size:11px;margin-top:8px;text-align:center">"${esc(p.statusMsg)}"</div>` : ''}
    </div>

    <div class="tabs scrollable" id="profileTabs" style="margin-top:16px">
      ${tabs.map(t=>`<button class="tab ${state.profileTab===t.id?'active':''}" data-ptab="${t.id}">
        ${ic(t.icon,'xs')} ${t.label}
      </button>`).join('')}
    </div>

    <div id="profileTabBody">
      <div class="spinner" style="margin:40px auto"></div>
    </div>
  `;
}

function pageUserProfile(){ // ★ بدون async لضمان سرعة العرض
  const p = state.users[state.viewingUid];
  if(!p) return emptyState('المستخدم غير موجود','user');

// تسجيل المشاهدة — مرة واحدة لكل تنقل (بدون حد زمني)
if (state.lastViewedProfileUid !== state.viewingUid) {
  state.lastViewedProfileUid = state.viewingUid;
  recordProfileView(state.viewingUid);
}

  const on = state.followed.has(state.viewingUid);
  const cust = getProfileCustomization(p);
  const theme = THEMES[p.equipped?.themeId || p.themeId || 'default'] || THEMES.default;
  const frameClass = ANIMATED_FRAMES[p.equipped?.frameId || p.frameId || 'none']?.class || '';
  const avatarShapeClass = `shape-${cust.avatarShape}`;
  const avatarBorderClass = `border-${cust.avatarBorder}`;

const tabs = [
  {id:'posts',        label:'المنشورات',   icon:'grid'},
  {id:'reblogs',      label:'إعادة النشر', icon:'share'},       // ★
  {id:'history',      label:'سجل اللعب',   icon:'clock'},       // ★
  {id:'games',        label:'الألعاب',     icon:'gamepad'},
  {id:'inventory',    label:'المقتنيات',   icon:'store'},       // ★
  {id:'achievements', label:'الإنجازات',   icon:'medal'},
  {id:'stats',        label:'الإحصائيات',  icon:'chart'},
  {id:'activity',     label:'النشاطات',    icon:'clock'},       // ★
  {id:'gifts',        label:'الهدايا',     icon:'star'},
];
  if(!tabs.find(t => t.id === state.profileTab)) state.profileTab = 'posts';

  // ★ جلب البيانات في الخلفية لتجنب تجميد الواجهة
  setTimeout(async () => {
    try {
      // 1. جلب كل التواقيع
      const sSnap = await getDocs(query(
        collection(db, 'users', state.viewingUid, 'signatures'),
        orderBy('createdAt', 'desc'), limit(50)
      ));
      const signatures = sSnap.docs.map(d => ({id: d.id, ...d.data()}));

      // 2. فحص شرط الـ 24 ساعة لتوقيعي الأخير
      const mySignatures = signatures.filter(s => s.fromId === state.user.uid);
      const lastMySigTime = mySignatures.length > 0 ? (mySignatures[0].createdAt?.toMillis?.() || 0) : 0;
      const hasSignedRecently = (Date.now() - lastMySigTime) < (24 * 60 * 60 * 1000);
      const isSubscribed = getSubscription(state.profile).active;

      // 3. تحديث التواقيع المتحركة تحت الصورة (Slider)
      const sigSlider = document.getElementById('userSigSlider');
      if (sigSlider) {
        const myCust = getProfileCustomization(p);
        const sigStyleInline = buildSignatureStyle({ ...myCust, sigPadding: 2, sigBg: '', sigBorderWidth: 0, sigShadow: 'none' });
        if (signatures.length > 0) {
          const randomSigs = [...signatures].sort(() => 0.5 - Math.random()).slice(0, 3);
          sigSlider.innerHTML = randomSigs.map((s, idx) => `
            <div class="sig-preview-item" style="animation-delay: ${idx * 3}s;${sigStyleInline}">
              "${esc(s.text)}"
            </div>
          `).join('');
        } else {
          sigSlider.innerHTML = `<div class="sig-preview-item" style="animation:none; opacity:0.6; color:#64748b;">✍️ لا تواقيع</div>`;
        }
      }

      // 4. تحديث صندوق التواقيع السفلي (Full List)
      const fullSigContainer = document.getElementById('fullSignaturesBox');
      if (fullSigContainer) {
        const myCust = getProfileCustomization(p);   // ← تخصيصات صاحب الملف
        const displayCount = myCust.sigDisplayCount || 3;
        const displaySigs = signatures.slice(0, displayCount);

        let sigHtml = `
          <div class="signatures-head">
            <span>${ic('edit','xs')} تواقيع الزوار (${signatures.length})</span>
            ${state.viewingUid !== state.user.uid ? `
              ${hasSignedRecently
                ? '<span class="pill ok" style="font-size:9.5px">✓ لقد وقعت مؤخراً</span>'
                : `<button class="sig-btn ${!isSubscribed ? 'locked' : ''}" data-action="open-signature" data-uid="${state.viewingUid}">
                     ${ic('edit','xs')} ${isSubscribed ? 'وقّع الآن' : '🔒 يتطلب بلس'}
                   </button>`}
            ` : ''}
          </div>`;

        if (displaySigs.length > 0) {
          sigHtml += `
            <div class="sig-list">
              ${displaySigs.map(s => {
                const isMe = s.fromId === state.user.uid;
                const isOwner = s.fromId === state.viewingUid;
                const animClass = myCust.sigAnimation !== 'none'
                  ? `sig-anim-${myCust.sigAnimation}` : '';

                return `
                <div class="sig-item ${animClass}">
                  ${myCust.sigShowAvatar
                    ? avatar({name: s.fromName, avatarUrl: s.fromAvatar, grad: pickGrad(s.fromId)}, 32)
                    : ''}
                  <div class="sig-body">
                    ${myCust.sigShowName ? `
                      <div class="sig-name">
                        ${esc(s.fromName || 'لاعب')}
                        ${isMe ? '<span class="pill" style="font-size:8px;padding:1px 4px;background:var(--brand)">أنت</span>' : ''}
                        ${isOwner ? '<span class="pill gold" style="font-size:8px;padding:1px 4px">صاحب الملف</span>' : ''}
                      </div>
                    ` : ''}
                    <div style="${buildSignatureStyle(myCust)}">${esc(s.text || '')}</div>
                    ${myCust.sigShowTime ? `<div class="sig-time">${timeAgo(s.createdAt)}</div>` : ''}
                  </div>
                </div>
              `}).join('')}
            </div>
            ${signatures.length > displayCount
              ? `<div style="text-align:center;margin-top:8px;font-size:10.5px;color:var(--muted)">
                   و ${signatures.length - displayCount} توقيع آخر…
                 </div>`
              : ''}
          `;
        } else {
          sigHtml += `<div class="sig-empty">✍️ لا توجد تواقيع بعد. كن أول من يوقع!</div>`;
        }
        fullSigContainer.innerHTML = sigHtml;
      }
    } catch(e) {
      console.warn('❌ Error loading signatures:', e);
    }

    // 5. تحميل محتوى التبويب
    try {
      const bodyHtml = await renderUserTabBody(state.viewingUid, state.profileTab);
      const bodyContainer = document.getElementById('profileTabBody');
      if (bodyContainer) bodyContainer.innerHTML = bodyHtml || emptyState('لا محتوى','grid');
    } catch(e) {
      console.error('Tab body error:', e);
      const bodyContainer = document.getElementById('profileTabBody');
      if (bodyContainer) bodyContainer.innerHTML = emptyState('تعذّر تحميل المحتوى','close');
    }
  }, 50);

  return `
    <!-- ★ حُذف صف الرجوع الداخلي — انتقل إلى شريط الرأس -->

    <div class="player-card" style="${buildCardStyle(cust)}">
<div class="pc-cover" data-action="cover-click" style="cursor:pointer;${buildCoverStyle(p, cust, theme)}">
  ${buildCoverOverlayHTML(cust)}
  ${!p.coverUrl ? `
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,${theme.colors[0]},${theme.colors[1]});display:grid;place-items:center;color:rgba(255,255,255,.55);font-size:13px;font-weight:800;z-index:1">
      ${ic('camera','sm')} اضغط لإضافة غلاف
    </div>` : ''}
  ${cust.bannerEffect !== 'none' ? `<div class="preview-effect effect-${cust.bannerEffect}" style="position:absolute;inset:0;z-index:4"></div>` : ''}
</div>

<!-- ★ حُذف .pc-card-actions — انتقل إلى شريط الرأس -->

<div class="pc-body-section" style="--tc1:${theme.colors[0]}35;--tc2:${theme.colors[1]}12;position:relative">
  ${buildBgPattern(cust.bgPattern)}
  <div class="pc-body">
          <div class="pc-info">
            <div class="pc-nick anim-name-${cust.nameAnimation}" style="${buildNameStyle(cust)}">
              ${(NAME_BADGES[cust.nameBadge]||NAME_BADGES.none).emoji ? `<span style="margin-inline-end:4px">${(NAME_BADGES[cust.nameBadge]||NAME_BADGES.none).emoji}</span>` : ''}
              ${esc(p.name)} ${getAdminBadge(p)}
            </div>
            <div class="pc-user" style="${buildUsernameStyle(cust)}">@${esc(p.username)}</div>
            <div class="pc-joined" style="color:${cust.joinDateColor}">
              ${ic('clock','xs')} انضم ${formatJoinDate(p.createdAt)}
            </div>

            ${p.teamName ? `<div class="pc-team">${p.teamEmblem||'🛡️'} ${esc(p.teamName)}</div>` : ''}

            ${cust.location ? `<div class="pc-meta-row"><span style="color:${cust.locationColor}">${ic('location','xs')} ${esc(cust.location)}</span></div>` : ''}

            <div class="pc-bio" style="${buildBioStyle(cust)}">${esc(p.bio||'').replace(/\n/g,'<br>')}</div>
          </div>

<div class="avatar-sig-wrapper">
  <div class="pc-avatar">
    ${avatar(p, 82, frameClass, false, buildAvatarInnerStyle(cust))}
  </div>
            <div class="sig-slider-preview" id="userSigSlider">
              <div class="sig-preview-item" style="animation:none; opacity:0.5;">جاري التحميل...</div>
            </div>
          </div>
        </div>

        <div class="pc-level">
          <div class="pc-level-bar">
            <span style="width:${Math.min(100,(p.xp||0)%100)}%;${cust.levelBarColor ? `background:${cust.levelBarColor};box-shadow:0 0 14px ${cust.levelBarColor};` : ''}"></span>
          </div>
          <div class="pc-level-num" style="${cust.levelTextColor ? `background:${cust.levelTextColor};color:#070a11;` : ''}">المستوى ${p.level||1}</div>
        </div>

        <!-- ★★★ صف المتابعين — مع تطبيق التخصيصات ★★★ -->
        <div class="pc-social-row"
             style="--btn-bg:${cust.followersBtnBg === 'transparent' ? 'rgba(0,0,0,.18)' : cust.followersBtnBg};
                    --btn-fg:${cust.followersBtnColor};
                    --btn-label-fg:${cust.followersBtnColor};">
          <button class="pc-social-btn" data-action="show-followers" data-uid="${p.uid}" data-type="followers">
            <b>${nf(p.followers)}</b>
            <small>متابع</small>
          </button>
          <button class="pc-social-btn" data-action="show-followers" data-uid="${p.uid}" data-type="following">
            <b>${nf(p.following)}</b>
            <small>متابَع</small>
          </button>
        </div>

      </div>
    </div>

    <!-- ✍️ قسم التواقيع السفلي -->
    <div class="signatures-box" id="fullSignaturesBox">
      <div class="spinner" style="margin:20px auto;width:24px;height:24px"></div>
    </div>

    <div class="pc-stats" style="margin-top:14px">
      <div class="pc-stat f"><div class="v">${nf(p.fame)}</div><div class="l">الشهرة</div></div>
      <div class="pc-stat p"><div class="v">${nf(p.power)}</div><div class="l">القوة</div></div>
      <div class="pc-stat s"><div class="v">${nf(p.support)}</div><div class="l">الدعم</div></div>
    </div>

    <div class="pc-interactions">
      <button class="pci-chip" data-action="show-interactions" data-uid="${p.uid}" data-type="views">
        ${ic('eye','xs')} <b>${nf(p.views||0)}</b> مشاهدة
      </button>
      <button class="pci-chip" data-action="show-interactions" data-uid="${p.uid}" data-type="profileLikes">
        ${ic('heart','xs')} <b>${nf(p.likesProfile)}</b> إعجاب
      </button>
      <button class="pci-chip" data-action="show-interactions" data-uid="${p.uid}" data-type="gameLikes">
        ${ic('gamepad','xs')} <b>${nf(p.likesGames)}</b> لعب
      </button>
    </div>

    <div class="tabs scrollable" style="margin-top:16px">
      ${tabs.map(t => `<button class="tab ${state.profileTab===t.id?'active':''}" data-ptab="${t.id}">
        ${ic(t.icon,'xs')} ${t.label}
      </button>`).join('')}
    </div>

    <div id="profileTabBody">
      <div class="spinner" style="margin:40px auto"></div>
    </div>
  `;
}

/* ============================================================
   ✍️ نظام التواقيع
   ============================================================ */
async function openSignatureModal(targetUid){
  const sub = getSubscription(state.profile);
  if(!sub.active){
    return openModal(`
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:48px">✍️</div>
        <h3 style="margin-top:8px">التوقيع يتطلب اشتراك</h3>
        <div class="muted">اشترك في بلس أو بلس دبل لتوقيع الملفات</div>
      </div>
      <button class="btn btn-primary" style="width:100%;margin-bottom:8px" data-buy-plan="plus">
        اشتراك بلس — ${nf(SUBSCRIPTION_PLANS.plus.price)} عملة
      </button>
      <button class="btn btn-ghost" style="width:100%" data-action="modal-close">إغلاق</button>
    `);
  }
  if(targetUid === state.user.uid) return toast('لا يمكنك توقيع ملفك');

  openModal(`
    <h3>✍️ وقّع ملف ${esc(state.users[targetUid]?.name || 'اللاعب')}</h3>
    <div class="sub">اترك بصمتك — حتى 100 حرف</div>
    <div class="field">
      <textarea class="input" id="sigInput" rows="3" maxlength="100"
                placeholder="اكتب توقيعك…" style="resize:vertical"></textarea>
      <div class="char-counter" id="sigCounter">0 / 100</div>
    </div>
    <div class="row" style="margin-top:14px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" id="submitSigBtn" data-uid="${targetUid}">
        ${ic('check','sm')} توقيع
      </button>
    </div>
  `);
  const inp = document.getElementById('sigInput');
  const counter = document.getElementById('sigCounter');
  inp.addEventListener('input', () => {
    counter.textContent = `${inp.value.length} / 100`;
  });
  inp.focus();
}

async function submitSignature(targetUid){
  const inp = document.getElementById('sigInput');
  const text = inp?.value.trim();
  if(!text) return toast('اكتب توقيعك أولاً');
  if(text.length > 100) return toast('التوقيع طويل جداً');

  // ★ التحقق من مرور 24 ساعة
  try {
    const q = query(
      collection(db, 'users', targetUid, 'signatures'), 
      where('fromId', '==', state.user.uid), 
      orderBy('createdAt', 'desc'), 
      limit(1)
    );
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      const lastDate = snap.docs[0].data().createdAt?.toMillis?.() || 0;
      const hoursPassed = (Date.now() - lastDate) / (1000 * 60 * 60);
      
      if (hoursPassed < 24) {
        const remaining = Math.ceil(24 - hoursPassed);
        return toast(`⏳ يمكنك التوقيع مرة أخرى بعد ${remaining} ساعة`);
      }
    }
  } catch (error) {
    console.warn('خطأ في فحص وقت التوقيع السابق:', error);
  }

  try {
    await addDoc(collection(db, 'users', targetUid, 'signatures'), {
      fromId: state.user.uid,
      fromName: state.profile.name,
      fromAvatar: state.profile.avatarUrl || '',
      text,
      createdAt: serverTimestamp(),
    });
    
    await notify(targetUid, 'signature', `<b>${esc(state.profile.name)}</b> وقع ملفك ✍️`);
    
    closeModal();
    toast('تم التوقيع ✓');
    render();
  } catch(e){
    console.error(e);
    toast('فشل التوقيع');
  }
}

/* ============================================================
   🖼️ المعاينة الكاملة + الحفظ والمشاركة
   ============================================================ */
async function openFullPreviewModal(){
  const p = state.profile;
  if(!p) return;
  const cust = getProfileCustomization(p);
  const theme = THEMES[p.equipped?.themeId || p.themeId || 'default'] || THEMES.default;
  const frameClass = ANIMATED_FRAMES[p.equipped?.frameId || p.frameId || 'none']?.class || '';
  const levelStyle = {
    default:'', badge:'background:linear-gradient(135deg,#a78bfa,#6c5ce7);',
    gem:'background:linear-gradient(135deg,#00d2ff,#0891b2);',
    crown:'background:linear-gradient(135deg,#f5b301,#ff8a00);',
    star:'background:linear-gradient(135deg,#ec4899,#f43f5e);',
    minimal:'background:rgba(255,255,255,.1);color:#fff;',
  }[cust.levelStyle] || '';

  openModal(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <h3 style="margin:0">🖼️ معاينة الملف</h3>
      <button class="icon-btn" data-action="modal-close" style="width:32px;height:32px">
        ${ic('close','sm')}
      </button>
    </div>

    <div class="preview-full-wrap">
      <div class="player-card" id="previewCaptureTarget" style="${buildCardStyle(cust)}">
        <div class="pc-cover" style="${buildCoverStyle(p, cust, theme)}">
          ${!p.coverUrl ? `<div style="position:absolute;inset:0;background:linear-gradient(135deg,${theme.colors[0]},${theme.colors[1]})"></div>` : ''}
          ${cust.bannerEffect !== 'none'
            ? `<div class="preview-effect effect-${cust.bannerEffect}" style="position:absolute;inset:0;z-index:2"></div>` : ''}
        </div>
        <div class="pc-body-section" style="--tc1:${theme.colors[0]}35;--tc2:${theme.colors[1]}12;position:relative">
          ${buildBgPattern(cust.bgPattern)}
          <div class="pc-body">
            <div class="pc-info">
              <div class="pc-nick anim-name-${cust.nameAnimation}" style="${buildNameStyle(cust)}">
                ${(NAME_BADGES[cust.nameBadge]||NAME_BADGES.none).emoji ? `<span style="margin-inline-end:4px">${(NAME_BADGES[cust.nameBadge]||NAME_BADGES.none).emoji}</span>` : ''}
                ${esc(p.name)} ${getAdminBadge(p)}
                ${cust.pronouns ? `<span class="pc-pronouns">${esc(cust.pronouns)}</span>` : ''}
              </div>
              <div class="pc-user" style="${buildUsernameStyle(cust)}">@${esc(p.username)}</div>
              <div class="pc-joined" style="color:${cust.joinDateColor}">
                ${ic('clock','xs')} انضم ${formatJoinDate(p.createdAt)}
              </div>
              ${(cust.location || cust.website) ? `
                <div class="pc-meta-row">
                  ${cust.location ? `<span style="color:${cust.locationColor}">${ic('location','xs')} ${esc(cust.location)}</span>` : ''}
                  ${cust.website ? `<a href="${esc(cust.website)}" target="_blank" rel="noopener">${ic('globe','xs')} ${esc(cust.website.replace(/^https?:\/\//,'').slice(0,30))}</a>` : ''}
                </div>` : ''}
              <div class="pc-bio" style="${buildBioStyle(cust)}">${esc(p.bio||'').replace(/\n/g,'<br>')}</div>
            </div>
            <div class="pc-avatar">
              ${avatar(p, 82, frameClass, false, buildAvatarInnerStyle(cust))}
            </div>
          </div>
          <div class="pc-level">
            <div class="pc-level-bar">
              <span style="width:${Math.min(100,(p.xp||0)%100)}%;${cust.levelBarColor ? `background:${cust.levelBarColor};` : ''}"></span>
            </div>
            <div class="pc-level-num" style="${buildEffectiveLevelStyle(cust, levelStyle)}${cust.levelTextColor?`background:${cust.levelTextColor};color:#070a11;`:''}">المستوى ${p.level||1}</div>
          </div>

          <!-- ★ صف المتابعين -->
          <div class="pc-social-row"
               style="--btn-bg:${cust.followersBtnBg === 'transparent' ? 'rgba(0,0,0,.18)' : cust.followersBtnBg};
                      --btn-fg:${cust.followersBtnColor};
                      --btn-label-fg:${cust.followersBtnColor};">
            <button class="pc-social-btn" type="button">
              <b>${nf(p.followers || 0)}</b>
              <small>متابع</small>
            </button>
            <button class="pc-social-btn" type="button">
              <b>${nf(p.following || 0)}</b>
              <small>متابَع</small>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row" style="gap:8px">
      <button class="btn btn-primary" style="flex:1" data-action="save-preview">
        ${ic('check','sm')} حفظ الصورة
      </button>
      <button class="btn btn-ghost" style="flex:1" data-action="share-preview">
        ${ic('share','sm')} مشاركة
      </button>
    </div>
  `);
}

async function saveProfilePreview(){
  const target = document.getElementById('previewCaptureTarget');
  if(!target) return;
  toast('جاري إنشاء الصورة…');

  /* ===== 1) تحميل html-to-image (يدعم CSS كاملاً) ===== */
  try {
    if(!window.htmlToImage){
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
  } catch(e){
    console.error('load lib:', e);
    toast('فشل تحميل مكتبة الصور');
    return;
  }

  /* ===== 2) انتظار الخطوط ===== */
  try { await document.fonts.ready; } catch(e){}

  /* ===== 3) تجميد الحركات (لأنها تُلتقط في لقطة عشوائية) ===== */
  const freezeStyle = document.createElement('style');
  freezeStyle.id = 'capture-freeze';
  freezeStyle.textContent = `
    #previewCaptureTarget *,
    #previewCaptureTarget *::before,
    #previewCaptureTarget *::after {
      animation: none !important;
      transition: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
  `;
  document.head.appendChild(freezeStyle);

  /* ===== 4) انتظار إطارين لضمان اكتمال الـ layout ===== */
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  try {
const dataUrl = await window.htmlToImage.toPng(target, {
  backgroundColor: '#0f172a',
  pixelRatio: 2,
  cacheBust: true,
  skipFonts: true,          // ← ★ الحل: تجاوز قراءة CSS من Google Fonts
  width: target.offsetWidth,
  height: target.scrollHeight,
});

    const link = document.createElement('a');
    link.download = `nexus-${state.profile.username}.png`;
    link.href = dataUrl;
    link.click();
    toast('تم حفظ الصورة ✓');
  } catch(e){
    console.error('capture:', e);
    toast('فشل إنشاء الصورة');
  } finally {
    freezeStyle.remove();
  }
}

async function shareProfilePreview(){
  const url = `${window.location.origin}${window.location.pathname}?u=${state.profile.username}`;
  try {
    if(navigator.share){
      await navigator.share({
        title: `ملف ${state.profile.name} على نكسوس`,
        text: `شاهد ملف ${state.profile.name} على نكسوس`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast('تم نسخ الرابط ✓');
    }
  } catch(e){
    if(e.name !== 'AbortError'){
      try {
        await navigator.clipboard.writeText(url);
        toast('تم نسخ الرابط ✓');
      } catch(err){ toast('فشل المشاركة'); }
    }
  }
}

function pageSearch(){
  return `
    <div class="search-bar">${ic('search','sm')}
      <input id="searchInput" placeholder="ابحث عن مستخدم، لعبة، فريق…" value="${esc(state.searchQ)}" autocomplete="off">
    </div>
    <div class="chips">
      ${[['all','الكل'],['users','مستخدمون'],['games','ألعاب'],['teams','فرق']].map(([k,l])=>
        `<button class="chip ${state.searchCat===k?'active':''}" data-scat="${k}">${l}</button>`).join('')}
    </div>
    <div id="searchResults"></div>`;
}

function renderSearchResults(){
  const box = document.getElementById('searchResults');
  if(!box) return;
  const term = (state.searchQ||'').trim().toLowerCase();
  if(!term){ box.innerHTML = `<div class="empty">${ic('search')}<div>اكتب شيئاً للبحث</div></div>`; return; }
  let html = '';
  const cat = state.searchCat;
  if(cat==='all' || cat==='users'){
    const us = Object.values(state.users).filter(u=>
      (u.name||'').toLowerCase().includes(term) || (u.username||'').toLowerCase().includes(term));
    if(us.length) html += `<div class="section-title">${ic('users','sm')} مستخدمون</div>` +
      us.map(u=>`<div class="card" style="margin-bottom:8px;padding:11px"><div class="row">${avatar(u,44)}
        <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:800">${esc(u.name)}</div>
        <div class="muted" style="font-size:10.5px">@${esc(u.username)}</div></div>
        <button class="btn btn-ghost btn-sm" data-view-profile="${u.uid}">عرض</button>
        <button class="btn btn-primary btn-sm" data-open-chat="${u.uid}">رسالة</button>
        </div></div>`).join('');
  }
  if(cat==='all' || cat==='games'){
    const gs = GAMES.filter(g=>g.name.toLowerCase().includes(term) || g.cat.includes(term));
    if(gs.length) html += `<div class="section-title">${ic('gamepad','sm')} ألعاب</div>` +
      gs.map(g=>`<div class="card" style="margin-bottom:8px;padding:11px"><div class="row">
        <div class="team-emblem" style="width:42px;height:42px;background:${g.grad};border:0">${ic(g.icon,'sm')}</div>
        <div style="flex:1"><div style="font-size:13px;font-weight:800">${g.name}</div>
        <div class="muted" style="font-size:10.5px">${g.cat}</div></div>
        <button class="btn btn-primary btn-sm" data-game-open="${g.id}">لعب</button>
        </div></div>`).join('');
  }
  if(cat==='all' || cat==='teams'){
    const ts = state.teams.filter(t=>t.name.toLowerCase().includes(term));
    if(ts.length) html += `<div class="section-title">${ic('users','sm')} فرق</div>` +
      ts.map(t=>`<div class="card" style="margin-bottom:8px;padding:11px"><div class="row">
        <div class="team-emblem" style="width:42px;height:42px;font-size:19px">${t.emblem||'🛡️'}</div>
        <div style="flex:1"><div style="font-size:13px;font-weight:800">${esc(t.name)}</div>
        <div class="muted" style="font-size:10.5px">${(t.members||[]).length} عضو</div></div>
        <button class="btn btn-primary btn-sm" data-open-team="${t.id}">فتح</button>
        </div></div>`).join('');
  }
  box.innerHTML = html || `<div class="empty">${ic('search')}<div>لا نتائج لـ «${esc(state.searchQ)}»</div></div>`;
}

function pageNotifs(){
  state.notifRead = true;
  renderTopbar();
  const unread = state.notifs.filter(n=>!n.read);
  if(unread.length){
    Promise.all(unread.map(n =>
      updateDoc(doc(db,'notifications',state.user.uid,'items',n.id), { read: true }).catch(()=>{})
    ));
  }

  const icons = {
    like:'heart', follow:'user', game:'gamepad',
    comment:'comment', support:'star', challenge:'bolt',
    team_request:'users', team_accepted:'check', team_rejected:'close',
    team_kick:'logout', team_role:'crown',
    achievement:'medal', war:'shield', game_invite:'bolt',
  };

  const filters = [
    {k:'all', l:'الكل'},
    {k:'social', l:'اجتماعي', types:['like','follow','comment','support']},
    {k:'games', l:'ألعاب', types:['game','challenge','game_invite','achievement']},
    {k:'teams', l:'فرق', types:['team_request','team_accepted','team_rejected','team_kick','team_role','war']},
  ];

  const activeFilter = filters.find(f => f.k === state.notifFilter) || filters[0];
  const filtered = activeFilter.types
    ? state.notifs.filter(n => activeFilter.types.includes(n.type))
    : state.notifs;

  const clickMap = {
    challenge: 'data-action="show-challenges"',
    war: 'data-nav="war"',
    gift: 'data-nav="gifts"',
    achievement: 'data-nav="achievements"',
    team_request: 'data-nav="teams"',
    game: 'data-nav="games"',
    game_invite: 'data-nav="games"',
    season_end: 'data-nav="season"',
  };

  const items = filtered.map(function(n){
    const clickAttr = clickMap[n.type] ? clickMap[n.type] + ' style="cursor:pointer"' : '';
    return '<div class="notif-item ' + (n.read ? '' : 'unread') + '" ' + clickAttr + '>'
      + '<div class="notif-ic ' + (n.type || '') + '">' + ic(icons[n.type] || 'bell', 'sm') + '</div>'
      + '<div style="flex:1;min-width:0">'
      +   '<div class="notif-txt">' + (n.text || 'إشعار جديد') + '</div>'
      +   '<div class="notif-time">' + timeAgo(n.createdAt) + '</div>'
      + '</div>'
      + '</div>';
  }).join('');

  return ''
    + '<div class="notif-filters">'
    +   filters.map(function(f){
          return '<button class="notif-filter-btn ' + (state.notifFilter === f.k ? 'active' : '')
            + '" data-notif-filter="' + f.k + '">' + f.l + '</button>';
        }).join('')
    + '</div>'
    + (filtered.length
        ? '<div class="card pad0" style="padding:6px">' + items + '</div>'
        : emptyState('لا إشعارات في هذه الفئة', 'bell'));
}

function pageCloseFriends(){
  const list = Object.values(state.users).filter(u=>u.uid !== state.user.uid).slice(0,10);
  return `
    <div class="card" style="margin-bottom:14px"><div class="muted" style="line-height:1.85">
      أقرب 10 لاعبين إليك — احتساب التفاعل والتعاون والتنافس.
    </div></div>
    ${list.length ? list.map((u,i)=>`<div class="card" style="margin-bottom:8px;padding:12px"><div class="row">
      <div class="lb-rank ${i<3?'r'+(i+1):''}">${i+1}</div>
      ${avatar(u,44)}
      <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:800">${esc(u.name)}</div>
      <div class="muted" style="font-size:10.5px">${esc(u.bio||'')}</div></div>
      <button class="btn btn-primary btn-sm" data-open-chat="${u.uid}">تواصل</button>
    </div></div>`).join('') : emptyState('لا يوجد لاعبون بعد','users')}`;
}

function pageStats(){
  const p = state.profile || {};
  return `<h1 class="page-title">الإحصائيات</h1>
    <div class="stat-grid" style="margin-bottom:16px">
      <div class="stat-box"><div class="sv">${nf(p.fame)}</div><div class="sl">الشهرة</div></div>
      <div class="stat-box"><div class="sv">${nf(p.power)}</div><div class="sl">القوة</div></div>
      <div class="stat-box"><div class="sv">${nf(p.support)}</div><div class="sl">الدعم</div></div>
      <div class="stat-box"><div class="sv">${nf(p.likesProfile)}</div><div class="sl">إعجابات الملف</div></div>
      <div class="stat-box"><div class="sv">${nf(p.likesGames)}</div><div class="sl">إعجابات اللعب</div></div>
      <div class="stat-box"><div class="sv">${nf(p.followers)}</div><div class="sl">المتابِعون</div></div>
    </div>`;
}

function pageAchievements(){
  const p = state.profile || {};
  const unlocked = p.achievements || {};
  const all = Object.entries(ACHIEVEMENT_DEFS);
  const done = all.filter(([id]) => unlocked[id]).length;
  
  return `<h1 class="page-title">🏅 الإنجازات</h1>
    <div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:14px">
      <div class="ach-icon" style="width:56px;height:56px;font-size:26px">🏅</div>
      <div style="flex:1">
        <div style="font-size:15px;font-weight:900">${done} / ${all.length}</div>
        <div class="ach-prog" style="margin-top:8px">
          <span style="width:${(done/all.length*100).toFixed(0)}%"></span>
        </div>
      </div>
    </div>
    ${all.map(([id, def])=>{
      const isUnlocked = !!unlocked[id];
      const tier = TIER_COLORS[def.tier] || TIER_COLORS.bronze;
      return `
        <div class="achievement-card ${isUnlocked?'unlocked':'locked'}">
          <div class="ach-tier-icon ${def.tier}">${def.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:800">${def.name}</div>
            <div class="ach-d">${def.desc}</div>
            <div style="margin-top:5px;font-size:10px;color:${tier.text};font-weight:800">
              ${def.tier.toUpperCase()} · ${def.reward.coins} عملة + ${def.reward.xp} XP
            </div>
          </div>
          ${isUnlocked
            ? `<span class="pill ok" style="font-size:9.5px">✓</span>`
            : `<span class="muted" style="font-size:10px">مقفل</span>`}
        </div>
      `;
    }).join('')}
  `;
}

function pageLeaderboard(){
  const tabs = [
    ['heba',       'الهيبة'],
    ['fame',       'الشهرة'],
    ['power',      'القوة'],
    ['reputation', 'السمعة'],
    ['followers',  'المتابعون'],
  ];

  /* ★ ترتيب حسب القيمة المطلوبة */
  const users = Object.values(state.users).sort((a, b) => {
    if(state.lbTab === 'heba'){
      return calculateHeba(b) - calculateHeba(a);
    }
    return (b[state.lbTab] || 0) - (a[state.lbTab] || 0);
  });

  /* ★ قيمة العرض */
  const getValue = (u) => {
    if(state.lbTab === 'heba') return calculateHeba(u);
    if(state.lbTab === 'reputation') {
      return typeof u.reputation === 'number'
        ? u.reputation
        : calculateReputationFromData(u);
    }
    return u[state.lbTab] || 0;
  };

  return `
    <div class="chips" style="margin-bottom:14px">
      ${tabs.map(([k, l]) =>
        `<button class="chip ${state.lbTab === k ? 'active' : ''}" data-lb="${k}">${l}</button>`
      ).join('')}
    </div>
    ${users.length ? users.map((u, i) => {
      const value = getValue(u);
      const rank = state.lbTab === 'heba' ? getHebaRank(value) : null;
      return `
        <div class="lb-row ${u.uid === state.user.uid ? 'me' : ''}" data-view-profile="${u.uid}" style="cursor:pointer">
          <div class="lb-rank ${i < 3 ? 'r' + (i + 1) : ''}">${i + 1}</div>
          ${avatar(u, 40)}
          <div class="lb-mid">
            <div class="lb-n">
              ${esc(u.name)}
              ${u.uid === state.user.uid ? '<span class="pill" style="font-size:9px">أنت</span>' : ''}
              ${rank ? `<span style="font-size:11px;color:${rank.color}">${rank.emoji}</span>` : ''}
            </div>
            <div class="lb-s">@${esc(u.username)}</div>
          </div>
          <div class="lb-v">${nf(value)}</div>
        </div>`;
    }).join('') : emptyState('لا يوجد لاعبون بعد', 'trophy')}`;
}

function pageSettings(){
  const S = state.settings;
  const row = (k,n,d)=>`<div class="set-row" data-toggle="${k}">
    <div class="sr-txt"><div class="sr-n">${n}</div><div class="sr-d">${d}</div></div>
    <div class="switch ${S[k]?'on':''}"></div>
  </div>`;
  return `
    <div class="set-group">
      <h4>الحساب</h4>
      <div class="set-row" data-action="edit-profile">
        <div class="sr-txt"><div class="sr-n">تعديل الملف الشخصي</div><div class="sr-d">الاسم، النبذة، الصورة</div></div>
        ${ic('edit','sm')}
      </div>
      ${row('privateAcc','حساب خاص','لا يرى منشوراتك إلا المتابعون')}
      ${row('twofa','التحقق بخطوتين','أمان إضافي')}
    </div>
    <div class="set-group">
      <h4>الإشعارات</h4>
      ${row('notif','إشعارات التطبيق','الإعجابات، التعليقات، المتابعات')}
      ${row('sound','أصوات التطبيق','أصوات عند الرسائل')}
    </div>
    <div class="set-group">
      <h4>الخصوصية</h4>
      ${row('location','مشاركة الموقع','للمنشورات القريبة')}
    </div>
    <button class="btn btn-primary" style="width:100%;margin-top:16px" data-action="save-settings">
      ${ic('check','sm')} حفظ الإعدادات
    </button>
    <div class="set-group" style="margin-top:24px">
      <h4>عن التطبيق</h4>
      <div class="set-row" data-action="toast" data-msg="الإصدار 3.0.0">
        <div class="sr-txt"><div class="sr-n">الإصدار</div><div class="sr-d">3.0.0</div></div>
        ${ic('star','sm')}
      </div>
    </div>`;
}

function pageSupport(){
  const admins = Object.values(state.users).filter(u=>u.role==='admin' || u.role==='moderator');
  return `
    <div class="card" style="margin-bottom:14px"><div class="muted" style="line-height:1.85">
      المشرفون مسؤولون عن تنظيم المجتمع. الترقية من قِبل المشرف العام.
    </div></div>
    ${admins.length ? admins.map(u=>`<div class="staff-item">
      ${avatar(u,46)}
      <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:800">${esc(u.name)}</div>
      <div class="muted" style="font-size:10.5px;margin-top:2px">@${esc(u.username)}</div></div>
      <span class="role-badge ${u.role}">${u.role==='admin'?'المشرف العام':'مشرف'}</span>
    </div>`).join('') : emptyState('لا يوجد مشرفون بعد','shield')}`;
}

async function pageAdmin(){
  if(state.profile?.role !== 'admin'){
    return `<div class="empty">${ic('lock')}<div>هذه الصفحة للمشرفين فقط</div></div>`;
  }
  
  const tab = state.adminTab || 'overview';
  
  // حمّل البيانات
  if(tab === 'reports' && !state.reports.length){
    try {
      const snap = await getDocs(
        query(collection(db,'reports'), where('status','==','pending'),
              orderBy('createdAt','desc'), limit(50))
      );
      state.reports = snap.docs.map(d=>({id:d.id, ...d.data()}));
    } catch(e){}
  }
  
  if(tab === 'users'){
    state.bannedUsers = Object.values(state.users).filter(u => u.banned);
  }
  
  return `
    
    <div class="admin-tabs">
      <button class="admin-tab ${tab==='overview'?'active':''}" data-admin-tab="overview">نظرة</button>
      <button class="admin-tab ${tab==='users'?'active':''}" data-admin-tab="users">المستخدمون</button>
      <button class="admin-tab ${tab==='reports'?'active':''}" data-admin-tab="reports">البلاغات</button>
      <button class="admin-tab ${tab==='content'?'active':''}" data-admin-tab="content">المحتوى</button>
      <button class="admin-tab ${tab==='season'?'active':''}" data-admin-tab="season">الموسم</button>
    </div>
    
    ${tab === 'overview' ? `
      <div class="stat-grid" style="margin-bottom:16px">
        <div class="stat-box"><div class="sv">${Object.keys(state.users).length}</div><div class="sl">مستخدم</div></div>
        <div class="stat-box"><div class="sv">${state.posts.length}</div><div class="sl">منشور</div></div>
        <div class="stat-box"><div class="sv">${state.teams.length}</div><div class="sl">فريق</div></div>
        <div class="stat-box"><div class="sv">${state.rooms.length}</div><div class="sl">غرفة</div></div>
      </div>
      <div class="card">
        <div style="font-size:13px;font-weight:900;margin-bottom:10px">إجراءات سريعة</div>
        <button class="btn btn-primary" style="width:100%;margin-bottom:8px" data-action="admin-refresh">
          ${ic('check','sm')} تحديث البيانات
        </button>
        <button class="btn btn-ghost" style="width:100%" data-action="admin-season-end">
          ${ic('trophy','sm')} إنهاء الموسم الحالي
        </button>
      </div>
    ` : ''}
    
    ${tab === 'users' ? `
      <div class="section-title">${ic('users','sm')} إدارة المستخدمين (${Object.keys(state.users).length})</div>
      ${Object.values(state.users).slice(0, 30).map(u=>`
        <div class="admin-user-row">
          ${avatar(u, 40)}
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:800;display:flex;align-items:center;gap:6px">
              ${esc(u.name)}
              ${u.banned ? '<span class="admin-badge banned">محظور</span>' : ''}
              ${u.role === 'admin' ? '<span class="admin-badge admin">مشرف</span>' : ''}
            </div>
            <div class="muted" style="font-size:10.5px">@${esc(u.username)}</div>
          </div>
          ${u.uid !== state.user.uid ? `
            <button class="btn btn-sm ${u.banned?'btn-ghost':'btn-danger'}"
                    data-admin-ban="${u.uid}" data-admin-banned="${u.banned?'1':'0'}">
              ${u.banned ? 'إلغاء الحظر' : 'حظر'}
            </button>
          ` : '<span class="pill gold">أنت</span>'}
        </div>
      `).join('')}
    ` : ''}
    
    ${tab === 'reports' ? `
      <div class="section-title">${ic('shield','sm')} البلاغات المعلقة (${state.reports.length})</div>
      ${state.reports.length ? state.reports.map(r=>`
        <div class="report-card pending">
          <div class="row" style="margin-bottom:8px">
            <span class="report-reason">${esc(r.reason)}</span>
            <div style="flex:1"></div>
            <div class="muted" style="font-size:10px">${timeAgo(r.createdAt)}</div>
          </div>
          <div style="font-size:12.5px;line-height:1.6;margin-bottom:10px">
            <b style="color:var(--txt)">من:</b> ${esc(r.reporterName || '?')}<br>
            <b style="color:var(--txt)">النوع:</b> ${r.targetType}<br>
            ${r.details ? `<b style="color:var(--txt)">التفاصيل:</b> ${esc(r.details)}` : ''}
          </div>
          <div class="row">
            ${r.targetType === 'post' ? `
              <button class="btn btn-danger btn-sm" style="flex:1" data-admin-delete-post="${r.targetId}" data-admin-report="${r.id}">
                حذف المنشور
              </button>
            ` : ''}
            ${r.targetType === 'user' ? `
              <button class="btn btn-danger btn-sm" style="flex:1" data-admin-ban="${r.targetId}" data-admin-banned="0" data-admin-report="${r.id}">
                حظر المستخدم
              </button>
            ` : ''}
            <button class="btn btn-ghost btn-sm" style="flex:1" data-admin-dismiss="${r.id}">
              تجاهل
            </button>
          </div>
        </div>
      `).join('') : emptyState('لا بلاغات معلقة ✅','shield')}
    ` : ''}
    
    ${tab === 'content' ? `
      <div class="section-title">${ic('grid','sm')} آخر المنشورات</div>
      ${state.posts.slice(0, 20).map(p=>`
        <div class="card" style="margin-bottom:8px;padding:11px">
          <div class="row" style="margin-bottom:6px">
            ${avatar(p.author, 32)}
            <div style="flex:1;min-width:0">
              <div style="font-size:12px;font-weight:800">${esc(p.author?.name || '?')}</div>
              <div class="muted" style="font-size:10px">${timeAgo(p.createdAt)}</div>
            </div>
            <button class="btn btn-danger btn-sm" data-admin-delete-post="${p.id}">
              ${ic('trash','xs')}
            </button>
          </div>
          <div style="font-size:12px;color:#b7c2d8;line-height:1.6;max-height:60px;overflow:hidden">
            ${esc((p.text||'').substring(0, 150))}
          </div>
        </div>
      `).join('')}
    ` : ''}
    
    ${tab === 'season' ? `
      <div class="card">
        <div style="font-size:14px;font-weight:900;margin-bottom:10px">🏆 إدارة الموسم</div>
        <div class="muted" style="font-size:12px;line-height:1.8;margin-bottom:14px">
          الموسم الحالي: ${state.seasonInfo?.number || '?'}<br>
          بدأ: ${state.seasonInfo?.startedAt ? timeAgo(state.seasonInfo.startedAt) : '?'}<br>
          ينتهي: ${state.seasonInfo?.endsAt ? timeAgo(state.seasonInfo.endsAt) : '?'}
        </div>
        <button class="btn btn-danger" style="width:100%" data-action="admin-season-end">
          إنهاء الموسم وبدء جديد
        </button>
      </div>
    ` : ''}
  `;
}

async function adminBanUser(uid, currentlyBanned){
  if(uid === state.user.uid) return toast('لا يمكنك حظر نفسك');
  try {
    await updateDoc(doc(db,'users',uid), {
      banned: !currentlyBanned,
    });
    toast(currentlyBanned ? 'تم إلغاء الحظر' : 'تم الحظر ✓');
    render();
  } catch(e){ toast('فشل'); }
}

/* ============================================================
   ⚠️ تنبيه إداري
   ============================================================ */
async function adminWarnUser(uid, reason){
  if(state.profile?.role !== 'admin') return toast('غير مصرح');
  if(uid === state.user.uid) return toast('لا يمكنك تحذير نفسك');

  if(!reason || !reason.trim()) return toast('اذكر سبب التحذير');

  try {
    await updateDoc(doc(db, 'users', uid), {
      warningsReceived: increment(1),
      reputation:       increment(-REPUTATION_WEIGHTS.warningPenalty),
      lastWarning: {
        reason: reason.trim(),
        by:     state.user.uid,
        at:     serverTimestamp(),
      },
    });

    await notify(uid, 'warning',
      `⚠️ تنبيه من الإدارة: ${esc(reason)}`);

    await logActivity('admin_action',
      `حذّر ${state.users[uid]?.name || 'مستخدم'}: ${reason}`,
      '⚠️');

    toast('تم إرسال التنبيه');
  } catch(e){
    console.error(e);
    toast('فشل');
  }
}

/* مودال إدخال السبب */
function openAdminWarnModal(uid){
  const u = state.users[uid];
  if(!u) return;

  openModal(`
    <h3>⚠️ تحذير ${esc(u.name)}</h3>
    <div class="sub">
      التحذير يخفض السمعة بمقدار ${REPUTATION_WEIGHTS.warningPenalty} نقطة.
    </div>
    <div class="field">
      <label>سبب التحذير</label>
      <textarea class="input" id="warnReason" rows="3"
                maxlength="200"
                placeholder="مثال: مخالفة قواعد المجتمع"></textarea>
    </div>
    <div class="row" style="margin-top:14px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-danger" style="flex:1" data-warn-confirm="${uid}">
        إرسال التحذير
      </button>
    </div>
  `);
}

async function adminDeletePost(postId, reportId){
  if(!confirm('حذف هذا المنشور نهائياً؟')) return;
  try {
    await deleteDoc(doc(db,'posts',postId));
    if(reportId){
      await updateDoc(doc(db,'reports',reportId), { status: 'resolved', resolvedBy: state.user.uid, resolvedAt: serverTimestamp() });
    }
    toast('تم الحذف');
    state.reports = state.reports.filter(r => r.id !== reportId);
    render();
  } catch(e){ toast('فشل'); }
}

async function adminDismissReport(reportId){
  try {
    await updateDoc(doc(db,'reports',reportId), {
      status: 'dismissed',
      resolvedBy: state.user.uid,
      resolvedAt: serverTimestamp(),
    });
    toast('تم التجاهل');
    state.reports = state.reports.filter(r => r.id !== reportId);
    render();
  } catch(e){ toast('فشل'); }
}

function pageLogout(){
  return `<div class="empty" style="padding-top:80px">
    ${ic('logout')}
    <div style="font-size:16px;font-weight:900;color:var(--txt);margin-bottom:6px">تسجيل الخروج</div>
    <div style="margin-bottom:22px">هل تريد الخروج من حسابك؟</div>
    <div class="row" style="justify-content:center;gap:10px">
      <button class="btn btn-ghost" data-nav="home">إلغاء</button>
      <button class="btn btn-danger" id="confirmLogout">تسجيل الخروج</button>
    </div>
  </div>`;
}

/* ============ Router ============ */
const PAGES = {
  home:pageHome, messages:pageMessages, games:pageGames, teams:pageTeams,
  store:pageStore, profile:pageProfile, userprofile:pageUserProfile,
  search:pageSearch, notifs:pageNotifs, closefriends:pageCloseFriends,
  stats:pageStats, achievements:pageAchievements, leaderboard:pageLeaderboard,
  settings:pageSettings, support:pageSupport, admin:pageAdmin, logout:pageLogout,
  inventory: pageInventory,
  tournaments: pageTournaments,
  war: pageWar,
  activity: pageActivity,
  season: pageSeason,
customization: pageCustomization,
gifts: pageGifts,
gamestats: pageGameStats,
};

function render(){
  const isMain = MAIN_PAGES.includes(state.page);

  const topbar    = document.querySelector('.topbar');
  const bottombar = document.getElementById('bottombar');
  const appEl     = document.getElementById('app');

  if(topbar)    topbar.classList.toggle('hidden', !isMain);
  if(bottombar) bottombar.classList.toggle('hidden', !isMain);
  if(appEl)     appEl.classList.toggle('no-bars', !isMain);
  document.body.classList.toggle('no-bars', !isMain);

  /* ★ شريط الرأس للصفحات الفرعية */
  const pageHeader = document.getElementById('pageHeader');
  const titleEl    = document.getElementById('pageHeaderTitle');
  const actionsEl  = document.getElementById('pageHeaderActions');
  if(pageHeader){
    if(!isMain){
      const cfg = getPageHeaderConfig();
      if(titleEl)   titleEl.textContent = cfg.title;
      if(actionsEl) actionsEl.innerHTML = cfg.actions;
      pageHeader.classList.remove('hidden');
    } else {
      pageHeader.classList.add('hidden');
    }
  }

  /* ارسم أشرطة القائمة الرئيسية فقط */
  if(isMain){
    renderTopbar();
    renderNav();
  }

  const fn = PAGES[state.page] || pageHome;
  const result = fn();

  const afterRender = () => {
    if(state.page === 'search') renderSearchResults();
    if(state.page === 'teams' && state.viewingTeamTab === 'chat' && state.viewingTeamId){
      setTimeout(renderTeamChat, 50);
    }
    if(state.page === 'customization' && state.custActiveZone){
      tagSubtabsForZone(state.custActiveZone);
    }
    restoreTabsScroll();
  };

  if(result && typeof result.then === 'function'){
    result.then(html => {
      document.getElementById('app').innerHTML = html || '';
      afterRender();
    }).catch(err => {
      console.error('Render error:', err);
      const eb = document.getElementById('errorBoundary');
      const ebMsg = document.getElementById('errorBoundaryMsg');
      if(eb && ebMsg){
        ebMsg.textContent = err?.message || 'خطأ في تحميل الصفحة';
        eb.classList.add('show');
      } else {
        document.getElementById('app').innerHTML =
          `<div class="empty">${ic('close')}<div>خطأ في التحميل</div></div>`;
      }
      afterRender();
    });
  } else {
    document.getElementById('app').innerHTML = result || '';
    afterRender();
  }
}

/* ============================================================
   🔁 استعادة موضع تمرير التبويبات بعد إعادة الرسم
   ============================================================ */
function restoreTabsScroll(){
  if(state._tabsScroll === null || state._tabsScroll === undefined) return;

  const el = document.querySelector('.tabs.scrollable');
  if(!el){ state._tabsScroll = null; return; }

  const saved = state._tabsScroll;
  state._tabsScroll = null;

  // انتظر إطارين لضمان اكتمال layout + scrollWidth
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if(el.scrollWidth <= el.clientWidth) return;   // لا شيء للتمرير
      el.scrollLeft = saved;

      // تحقق من نجاح الإسناد (RTL قد يعكس الإشارة)
      if(Math.abs(el.scrollLeft - saved) > 2){
        el.scrollLeft = -saved;
      }
    });
  });
}

/* ============ Modals with Image Upload ============ */
function composeModal(){
  state.pendingImages.post = null;
  openModal(`
    <h3>منشور جديد</h3>
    <div class="field">
      <textarea class="input" id="composeText" rows="4" placeholder="بماذا تفكر؟" style="resize:vertical;max-height:200px"></textarea>
      <div class="char-counter" id="composeCounter">0 / 1000</div>
    </div>
    <div class="img-field">
      <label>صورة (اختياري)</label>
      <div class="img-preview" id="postPreview" data-pick-image="post">
        <div class="img-empty">${ic('camera')}<span>اضغط لاختيار صورة</span></div>
        <span class="img-badge">تم الاختيار ✓</span>
      </div>
      <div class="img-upload-progress" id="postUploadProgress"><span></span></div>
    </div>
    <div class="row" style="margin-top:14px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" id="submitPost">نشر</button>
    </div>`);
  const textEl = document.getElementById('composeText');
  const counter = document.getElementById('composeCounter');
  textEl.addEventListener('input', ()=>{
    const len = textEl.value.length;
    counter.textContent = `${len} / 1000`;
    counter.className = 'char-counter' + (len > 900 ? ' danger' : len > 750 ? ' warn' : '');
    if(len > 1000) textEl.value = textEl.value.slice(0, 1000);
  });
}

function editProfileModal(){
  const p = state.profile;
  const cust = getProfileCustomization(p);
  const pronouns = cust.pronouns;

  openModal(`
    <h3>✏️ تعديل الملف</h3>
    <div class="sub">حدّث معلوماتك الأساسية</div>

    <div class="edit-tabs">
      <button class="edit-tab active" data-edit-tab="basic">أساسي</button>
      <button class="edit-tab" data-edit-tab="details">تفاصيل</button>
    </div>

    <!-- ===== تبويب أساسي ===== -->
    <div id="editTab_basic" class="edit-panel">
      <div class="field">
        <label>الاسم <span class="field-hint">(يظهر بجانب منشوراتك)</span></label>
        <input class="input" id="epName" value="${esc(p.name||'')}" maxlength="50" autocomplete="off">
      </div>

      <div class="field">
        <label>اسم المستخدم</label>
        <div class="username-input-wrap">
          <span class="username-prefix">@</span>
          <input class="input" id="epUsername" value="${esc(p.username||'')}"
                 maxlength="20" pattern="[a-z0-9_]{3,20}" autocomplete="off">
          <span class="username-status idle" id="epUsernameStatus"></span>
        </div>
      </div>

      <div class="field">
        <label>النبذة</label>
        <textarea class="input" id="epBio" rows="3"
                  style="resize:vertical;max-height:120px"
                  maxlength="200">${esc(p.bio||'')}</textarea>
        <div class="char-counter" id="epBioCounter">0 / 200</div>
      </div>

      <div class="field">
        <label>الضمائر</label>
        <select class="input" id="epPronouns">
          <option value="">غير محدد</option>
          ${[
            ['هو/له','هو / له'],
            ['هي/لها','هي / لها'],
            ['هم/لهم','هم / لهم'],
            ['هو/هي','هو / هي'],
          ].map(([v,l])=>`<option value="${v}" ${pronouns===v?'selected':''}>${l}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- ===== تبويب تفاصيل ===== -->
    <div id="editTab_details" class="edit-panel hidden">
      <div class="field">
        <label>الموقع</label>
        <input class="input" id="epLocation" value="${esc(cust.location)}"
               placeholder="مثال: القاهرة، مصر" maxlength="50">
      </div>
      <div class="field">
        <label>تاريخ الميلاد</label>
        <input class="input" type="date" id="epBirthday" value="${esc(cust.birthday)}">
      </div>
      <div class="field">
        <label>رسالة الحالة</label>
        <input class="input" id="epStatusMsg" value="${esc(p.statusMsg||'')}"
               placeholder="رسالة قصيرة تظهر على ملفك" maxlength="60">
      </div>
    </div>

    <div class="row" style="margin-top:16px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" id="saveProfileBtn">حفظ</button>
    </div>
  `);

  // ===== ربط الأحداث =====
  document.querySelectorAll('[data-edit-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-edit-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      ['basic','details'].forEach(k => {
        const el = document.getElementById('editTab_' + k);
        if(el) el.classList.toggle('hidden', k !== tab.dataset.editTab);
      });
    });
  });

  // عدّاد النبذة
  const bioEl = document.getElementById('epBio');
  const bioCounter = document.getElementById('epBioCounter');
  const updateBioCounter = () => {
    const len = bioEl.value.length;
    bioCounter.textContent = `${len} / 200`;
    bioCounter.className = 'char-counter' + (len > 180 ? ' danger' : len > 150 ? ' warn' : '');
  };
  bioEl.addEventListener('input', updateBioCounter);
  updateBioCounter();

  // فحص اسم المستخدم
  const unameEl = document.getElementById('epUsername');
  const unameStatus = document.getElementById('epUsernameStatus');
  checkUsernameAvailability(unameEl.value, unameStatus);
  unameEl.addEventListener('input', () => {
    unameEl.value = unameEl.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    checkUsernameAvailability(unameEl.value, unameStatus);
  });
}

async function saveProfileData(){
  const btn = document.getElementById('saveProfileBtn');
  const name = document.getElementById('epName').value.trim();
  const username = document.getElementById('epUsername').value.trim().toLowerCase();
  const bio = document.getElementById('epBio').value.trim();
  const pronouns = document.getElementById('epPronouns').value;
  const location = document.getElementById('epLocation').value.trim();
  const birthday = document.getElementById('epBirthday').value;
  const statusMsg = document.getElementById('epStatusMsg').value.trim();

  if(!name) return toast('الاسم مطلوب');
  if(username && !/^[a-z0-9_]{3,20}$/.test(username)){
    return toast('اسم المستخدم: 3–20 حرفاً/رقماً/شرطة سفلية');
  }

  btn.disabled = true;
  btn.classList.add('loading');

  try {
    const updates = {};
    const p = state.profile;

    if(name !== p.name) updates.name = name;
    if(bio !== (p.bio || '')) updates.bio = bio;
    if(pronouns !== (p.pronouns || '')) updates.pronouns = pronouns;
    if(location !== (p.location || '')) updates.location = location;
    if(birthday !== (p.birthday || '')) updates.birthday = birthday;
    if(statusMsg !== (p.statusMsg || '')) updates.statusMsg = statusMsg;

    let usernameChanged = false;
    if(username && username !== p.username){
      const uSnap = await getDoc(doc(db, 'usernames', username));
      if(uSnap.exists() && uSnap.data().uid !== state.user.uid){
        toast('اسم المستخدم محجوز');
        btn.disabled = false; btn.classList.remove('loading');
        return;
      }
      updates.username = username;
      usernameChanged = true;
    }

    if(Object.keys(updates).length === 0){
      toast('لم تغيّر شيئاً');
      btn.disabled = false; btn.classList.remove('loading');
      closeModal();
      return;
    }

    console.log('📤 Sending updates:', updates);
    await updateDoc(doc(db, 'users', state.user.uid), updates);

    if(usernameChanged){
      try {
        await setDoc(doc(db, 'usernames', username), { uid: state.user.uid });
        if(p.username){
          try { await deleteDoc(doc(db, 'usernames', p.username)); } catch(e){}
        }
      } catch(e){ console.warn('username sync failed:', e); }
    }

    if(updates.name || updates.username){
      try {
        const snap = await getDocs(query(collection(db,'posts'), where('authorId','==',state.user.uid)));
        const postUpdates = {};
        if(updates.name) postUpdates['author.name'] = name;
        if(updates.username) postUpdates['author.username'] = username;
        if(Object.keys(postUpdates).length){
          await Promise.all(snap.docs.map(d => updateDoc(d.ref, postUpdates)));
        }
      } catch(e){ console.warn('posts sync failed:', e); }
    }

    Object.assign(state.profile, updates);
    closeModal();
    toast('تم الحفظ ✓');
  } catch(e){
    console.error('❌ saveProfileData error:', e);
    toast('فشل الحفظ: ' + (e.message || e.code || ''));
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
  }
}

function createTeamModal(){
  openModal(`
    <h3>إنشاء فريق جديد</h3>
    <div class="sub">اختر اسماً وشعاراً لفريقك</div>
    <div class="field"><label>اسم الفريق</label>
      <input class="input" id="teamName" placeholder="مثال: نسور الشرق" maxlength="30"></div>
    <div class="field"><label>شعار (إيموجي)</label>
      <input class="input" id="teamEmblem" placeholder="🛡️" maxlength="4" style="font-size:22px;text-align:center"></div>
    <div class="field"><label>وصف</label>
      <textarea class="input" id="teamDesc" rows="3" style="resize:vertical" maxlength="150" placeholder="فريق تنافسي..."></textarea></div>
    <div class="row" style="margin-top:16px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" id="createTeamBtn">إنشاء</button>
    </div>`);
}

function openCreateTournamentModal(){
  openModal(`
    <h3>إنشاء بطولة</h3>
    <div class="sub">اختر الحجم والرسوم</div>
    <div class="field"><label>اسم البطولة</label>
      <input class="input" id="tnName" placeholder="مثال: كأس نكسوس" maxlength="40"></div>
    <div class="field"><label>عدد المشاركين</label>
      <select class="input" id="tnSize">
        <option value="4">4 لاعبين</option>
        <option value="8">8 لاعبين</option>
        <option value="16">16 لاعباً</option>
      </select></div>
    <div class="field"><label>رسوم الدخول (اختياري)</label>
      <input class="input" id="tnCoins" type="number" placeholder="0" min="0" max="1000"></div>
    <div class="row" style="margin-top:16px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" id="confirmCreateTournament">إنشاء</button>
    </div>
  `);
}

function openReportModal(type, id){
  openModal(`
    <h3>🚨 إبلاغ</h3>
    <div class="sub">اختر سبب الإبلاغ</div>
    ${[
      {k:'spam', l:'سبام'},
      {k:'harassment', l:'تحرش/إساءة'},
      {k:'inappropriate', l:'محتوى غير لائق'},
      {k:'misinformation', l:'معلومات مضللة'},
      {k:'other', l:'أخرى'},
    ].map(r=>`
      <div class="report-option" data-reason="${r.k}" onclick="this.parentNode.querySelectorAll('.report-option').forEach(o=>o.classList.remove('selected'));this.classList.add('selected')">
        <span>${r.l}</span>
      </div>
    `).join('')}
    <div class="field" style="margin-top:12px"><label>تفاصيل إضافية (اختياري)</label>
      <textarea class="input" id="reportDetails" rows="3" maxlength="300" placeholder="اشرح المشكلة..."></textarea></div>
    <div class="row" style="margin-top:16px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" id="confirmReport" data-report-type="${type}" data-report-target="${id}">
        إرسال البلاغ
      </button>
    </div>
  `);
}

/* ============================================================
   🎮 محرك اللعبة - Quiz Clash
   ============================================================ */
/* ===== بدء مباراة Quiz Clash (FIXED) ===== */
async function startQuizMatch(roomId, isHost){
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const snap = await getDoc(roomRef);
    if(!snap.exists()) return toast('الغرفة غير موجودة');
    const room = snap.data();
    const players = room.players || [];

    if(room.status === 'finished') return toast('انتهت هذه المباراة');

    // تأكد أن اللاعب في الغرفة
    if(!players.includes(state.user.uid)){
      await updateDoc(roomRef, { players: arrayUnion(state.user.uid) });
    }

    // المضيف يولد الأسئلة عند اكتمال اللاعبين
    if(isHost && players.length >= 2 && !room.quizQuestions){
      const selected = [...QUIZ_QUESTIONS].sort(()=>Math.random()-0.5)
        .slice(0, QUIZ_CONFIG.totalQuestions);
      await updateDoc(roomRef, {
        quizQuestions: selected,
        status: 'playing',
        currentIndex: 0,
        questionStartedAt: Date.now(),
        startedAt: serverTimestamp(),
        scores: {},
        answers: {}
      });
    }

    subscribeToMatch(roomId);
  } catch(e){ console.error(e); toast('خطأ في بدء المباراة'); }
}

/* ===== الاشتراك في غرفة المباراة ===== */
function subscribeToMatch(roomId){
  if(state.matchUnsub){ try{state.matchUnsub();}catch(e){} state.matchUnsub = null; }
  if(state.matchChatUnsub){ try{state.matchChatUnsub();}catch(e){} state.matchChatUnsub = null; }
  if(state.matchTimer){ clearInterval(state.matchTimer); state.matchTimer = null; }

  state.activeMatch = { roomId, _resultCalculated: false };
  document.getElementById('gameOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  state.matchUnsub = onSnapshot(doc(db,'rooms',roomId), snap=>{
    if(!snap.exists()){ exitMatch(); return; }
    const data = snap.data();
    state.activeMatch = { ...(state.activeMatch||{}), roomId, ...data };

    // ★ حالة انتظار
    if(!data.quizQuestions){
      const c = document.getElementById('gameContainer');
      if(c) c.innerHTML = `
        <div class="match-screen" style="padding:60px 20px;text-align:center">
          <div class="spinner"></div>
          <h3 style="margin-top:20px">بانتظار بدء المباراة…</h3>
          <div class="muted">المضيف يجهّز الأسئلة</div>
          <button class="btn btn-ghost" style="margin-top:20px" onclick="exitMatch()">خروج</button>
        </div>`;
      return;
    }

    renderGameUI();

    // ★ نهاية المباراة — مرة واحدة لكل لاعب
    if(data.status === 'finished' && !state.activeMatch._resultCalculated){
      state.activeMatch._resultCalculated = true;
      finalizeMatch(roomId, data);
    }
  });

  state.matchChatUnsub = onSnapshot(
    query(collection(db,'rooms',roomId,'chat'), orderBy('createdAt','asc'), limit(100)),
    snap=>{
      state.matchChat = snap.docs.map(d=>({id:d.id, ...d.data()}));
      renderMatchChat();
    }
  );
}

/* ===== حفظ النتيجة (PER USER — لا تكرار) ===== */
async function finalizeMatch(roomId, data){
  const uid = state.user.uid;
  const scores = data.scores || {};
  const winnerId = data.winnerId;
  const isWinner = winnerId === uid;
  const myScore = scores[uid] || 0;
  const opp = (data.players||[]).find(p=>p!==uid);
  const oppScore = scores[opp] || 0;

  // احفظ سجل للمستخدم الحالي فقط
  try {
    await addDoc(collection(db,'users',uid,'matchHistory'), {
      gameId: data.gameId || 'g3',
      gameName: 'Quiz Clash',
      roomId, opponent: opp,
      myScore, opponentScore: oppScore,
      result: isWinner ? 'win' : 'loss',
      playedAt: serverTimestamp()
    });
  } catch(e){ console.error('save history:', e); }

  // XP/شهرة
  try {
    if(isWinner){
      await updateDoc(doc(db,'users',uid), {
        fame: increment(50), xp: increment(100), power: increment(2)
      });
    } else {
      await updateDoc(doc(db,'users',uid), { xp: increment(25) });
    }
  } catch(e){ console.error('reward:', e); }
await recalcFamePower(uid);
  setTimeout(checkAchievements, 800);
  await logActivity('match',
    isWinner ? `فزت بمباراة Quiz Clash (${myScore}-${oppScore})`
             : `خسرت مباراة Quiz Clash (${myScore}-${oppScore})`,
    isWinner?'🏆':'🎮');

  // شاشة النتيجة
  const container = document.getElementById('gameContainer');
  if(!container) return;
  const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);
  container.innerHTML = `
    <div class="result-screen">
      <span class="result-icon">${isWinner?'🏆':'😔'}</span>
      <div class="result-title" style="color:${isWinner?'var(--gold)':'var(--muted)'}">${isWinner?'فوز رائع!':'خسارة شريفة'}</div>
      <div class="result-subtitle">${isWinner?'+50 شهرة +100 XP +2 قوة':'+25 XP'}</div>
      <div class="result-stats">
        <div class="result-stat"><div class="v">${myScore}</div><div class="l">نقاطك</div></div>
        <div class="result-stat"><div class="v">${oppScore}</div><div class="l">نقاط الخصم</div></div>
        <div class="result-stat"><div class="v">${totalScore}</div><div class="l">الإجمالي</div></div>
      </div>
      <div class="row" style="gap:10px;justify-content:center;margin-top:24px">
        <button class="btn btn-primary" id="playAgainBtn" style="flex:1;max-width:200px">${ic('play','sm')} مباراة أخرى</button>
        <button class="btn btn-ghost" id="backHomeBtn" style="flex:1;max-width:200px">العودة للرئيسية</button>
      </div>
    </div>`;
  document.getElementById('playAgainBtn')?.addEventListener('click', ()=>{
    exitMatch(); go('games', { activeGame: 'g3' });
  });
  document.getElementById('backHomeBtn')?.addEventListener('click', ()=>{
    exitMatch(); go('home');
  });
}

/* ===== الانتقال للسؤال التالي (Fallback للمضيف الغائب) ===== */
async function autoAdvanceQuestion(){
  const m = state.activeMatch;
  if(!m || m.status !== 'playing') return;

  const isHost = m.hostId === state.user.uid;
  const answers = m.answers || {};
  const allAnswered = (m.players||[]).every(uid=>answers[`${uid}_${m.currentIndex}`] !== undefined);
  const timeUp = Date.now() - m.questionStartedAt >= (QUIZ_CONFIG.secondsPerQuestion + 2) * 1000;

  // الضيف يتقدم فقط بعد انتهاء الوقت + ثانيتين (fallback)
  if(!isHost && !timeUp) return;
  if(isHost && !allAnswered && !timeUp) return;

  const nextIdx = m.currentIndex + 1;
  const roomRef = doc(db,'rooms',m.roomId);
  try {
    await runTransaction(db, async tx=>{
      const snap = await tx.get(roomRef);
      const data = snap.data();
      if(data.status !== 'playing' || data.currentIndex !== m.currentIndex) return;
      
      if(nextIdx >= QUIZ_CONFIG.totalQuestions){
        const scores = data.scores || {};
        const winnerId = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;
        tx.update(roomRef, { status: 'finished', finishedAt: serverTimestamp(), winnerId });
      } else {
        tx.update(roomRef, { currentIndex: nextIdx, questionStartedAt: Date.now() });
      }
    });
  } catch(e){ console.error(e); }
}

/** رسم واجهة اللعبة كاملة */
function renderGameUI(){
  const m = state.activeMatch;
  if(!m || !m.quizQuestions) return;

  const container = document.getElementById('gameContainer');
  const me = state.user.uid;
  const q = m.quizQuestions[m.currentIndex];
  const scores = m.scores || {};
  const answers = m.answers || {}; // { uid_questionIdx: selectedIndex }
  const myAnswer = answers[`${me}_${m.currentIndex}`];
  const questionNum = m.currentIndex + 1;
  const total = QUIZ_CONFIG.totalQuestions;

  // نتيجة مؤقتة لخيار
  let correctIndex = q.correct;

  // الوقت المتبقي
  const elapsed = (Date.now() - (m.questionStartedAt || Date.now())) / 1000;
  const remaining = Math.max(0, QUIZ_CONFIG.secondsPerQuestion - elapsed);

  container.innerHTML = `
    <div class="game-topbar">
      <div>
        <div style="font-size:11px;color:var(--muted);font-weight:700">سؤال</div>
        <div style="font-size:18px;font-weight:900">${questionNum} / ${total}</div>
      </div>
      <div style="flex:1"></div>
      <div class="game-timer ${remaining < 5 ? 'warning' : ''}" id="gameTimer">
        ${Math.ceil(remaining)}s
      </div>
      <button class="icon-btn" id="exitGameBtn" style="background:rgba(255,61,113,.15);border-color:rgba(255,61,113,.3);color:#ff7b9d">
        ${ic('close','sm')}
      </button>
    </div>

    <div class="game-players">
      ${(m.players||[]).map(uid=>{
        const u = state.users[uid] || {name:'لاعب'};
        const score = scores[uid] || 0;
        const isMe = uid === me;
        return `
          <div class="game-player ${isMe?'game-player-me':''}">
            <div class="game-player-name">
              ${isMe?'أنت':esc(u.name)}
              ${isMe?'<span class="pill" style="font-size:9px">أنت</span>':''}
            </div>
            <div class="game-player-score">${score}</div>
          </div>`;
      }).join('')}
    </div>

    <div class="question-card">
      <div class="question-text">${esc(q.q)}</div>
      <div class="question-hint">الإجابة الصحيحة = ${QUIZ_CONFIG.pointsPerCorrect} نقطة + مكافأة سرعة</div>
    </div>

    <div class="answers-grid">
      ${q.a.map((ans, i)=>{
        let cls = 'answer-btn';
        if(myAnswer !== undefined){
          if(i === correctIndex) cls += ' correct';
          else if(i === myAnswer) cls += ' wrong';
        }
        return `<button class="${cls}" data-answer="${i}" ${myAnswer !== undefined ? 'disabled' : ''}>
          ${esc(ans)}
        </button>`;
      }).join('')}
    </div>

    ${myAnswer !== undefined ? `<div class="pill ok" style="align-self:center;margin-bottom:16px">✓ أجبت — بانتظار الآخرين…</div>` : ''}

    <div class="match-chat">
      <div class="match-chat-header">${ic('message','xs')} محادثة المباراة</div>
      <div class="match-chat-messages" id="matchChatMessages"></div>
      <div style="display:flex;gap:6px">
        <input class="input" id="matchChatInput" placeholder="رسالة…" style="flex:1;padding:8px 12px;font-size:12px">
        <button class="btn btn-primary btn-sm" id="matchChatSend" style="padding:8px 14px">${ic('send','xs')}</button>
      </div>
    </div>
  `;

  renderMatchChat();

  // مؤقت العد التنازلي
  if(state.matchTimer) clearInterval(state.matchTimer);
  let lastSecond = Math.ceil(remaining);
  state.matchTimer = setInterval(()=>{
    const el = document.getElementById('gameTimer');
    if(!el){ clearInterval(state.matchTimer); return; }
    const e2 = (Date.now() - (m.questionStartedAt || Date.now())) / 1000;
    const r = Math.max(0, QUIZ_CONFIG.secondsPerQuestion - e2);
    el.textContent = `${Math.ceil(r)}s`;
    el.classList.toggle('warning', r < 5);
    if(r <= 0){
      clearInterval(state.matchTimer);
      autoAdvanceQuestion();
    }
  }, 200);

  // مستمعات الأزرار
  container.querySelectorAll('[data-answer]').forEach(b=>{
    b.addEventListener('click', ()=>answerQuestion(parseInt(b.dataset.answer)));
  });
  document.getElementById('exitGameBtn')?.addEventListener('click', ()=>{
    if(confirm('الخروج من المباراة يعني خسارتك. متأكد؟')){
      forfeitMatch();
    }
  });
  document.getElementById('matchChatSend')?.addEventListener('click', sendMatchChat);
  document.getElementById('matchChatInput')?.addEventListener('keydown', e=>{
    if(e.key === 'Enter'){ e.preventDefault(); sendMatchChat(); }
  });
}

/** إرسال إجابة */
async function answerQuestion(idx){
  const m = state.activeMatch;
  if(!m || m.status !== 'playing') return;
  const key = `${state.user.uid}_${m.currentIndex}`;
  if((m.answers||{})[key] !== undefined) return; // أجاب بالفعل

  const q = m.quizQuestions[m.currentIndex];
  const correct = idx === q.correct;
  const elapsed = (Date.now() - m.questionStartedAt) / 1000;
  const bonus = correct ? Math.max(0, Math.round((QUIZ_CONFIG.secondsPerQuestion - elapsed) * QUIZ_CONFIG.bonusPerSecond)) : 0;
  const points = correct ? QUIZ_CONFIG.pointsPerCorrect + bonus : 0;

  const roomRef = doc(db,'rooms',m.roomId);
  try {
    await runTransaction(db, async tx=>{
      const snap = await tx.get(roomRef);
      const data = snap.data();
      const newAnswers = { ...(data.answers||{}) };
      if(newAnswers[key] !== undefined) return; // race protection
      newAnswers[key] = idx;
      const newScores = { ...(data.scores||{}) };
      newScores[state.user.uid] = (newScores[state.user.uid]||0) + points;
      tx.update(roomRef, { answers: newAnswers, scores: newScores });
    });
  } catch(e){ console.error(e); }
}

/** الخروج من المباراة */
function exitMatch(){
  if(state.matchUnsub){ try{state.matchUnsub();}catch(e){} state.matchUnsub = null; }
  if(state.matchChatUnsub){ try{state.matchChatUnsub();}catch(e){} state.matchChatUnsub = null; }
  if(state.matchTimer){ clearInterval(state.matchTimer); state.matchTimer = null; }
  state.activeMatch = null;
  state.matchChat = [];
  document.getElementById('gameOverlay').classList.add('hidden');
  document.body.style.overflow = '';
  render();
}

/** الانسحاب (خسارة) */
async function forfeitMatch(){
  const m = state.activeMatch;
  if(!m || !m.roomId) return exitMatch();
  try {
    const roomRef = doc(db,'rooms',m.roomId);
    const snap = await getDoc(roomRef);
    const data = snap.data();
    const otherPlayer = (data.players||[]).find(p=>p!==state.user.uid);
    await updateDoc(roomRef, {
      status: 'finished',
      finishedAt: serverTimestamp(),
      winnerId: otherPlayer || null
    });
  } catch(e){ console.error(e); }
  exitMatch();
}

/** إرسال رسالة في محادثة المباراة */
async function sendMatchChat(){
  const inp = document.getElementById('matchChatInput');
  const txt = inp?.value.trim();
  if(!txt || !state.activeMatch?.roomId) return;
  inp.value = '';
  try {
    await addDoc(collection(db,'rooms',state.activeMatch.roomId,'chat'), {
      uid: state.user.uid,
      name: state.profile.name,
      text: txt,
      createdAt: serverTimestamp()
    });
  } catch(e){ console.error(e); }
}

/** رسم رسائل محادثة المباراة */
function renderMatchChat(){
  const box = document.getElementById('matchChatMessages');
  if(!box) return;
  if(!state.matchChat.length){
    box.innerHTML = `<div class="muted" style="text-align:center;padding:10px;font-size:11px">لا رسائل بعد</div>`;
    return;
  }
  box.innerHTML = state.matchChat.map(msg=>{
    const me = msg.uid === state.user.uid;
    return `<div class="match-chat-msg ${me?'me':''}">
      <div class="from">${me?'أنت':esc(msg.name)}</div>
      ${esc(msg.text)}
    </div>`;
  }).join('');
  box.scrollTop = box.scrollHeight;
}

/* ============================================================
   👥 محادثة الفريق
   ============================================================ */

async function sendTeamChat(teamId){
  const inp = document.getElementById('teamChatInput');
  const txt = inp?.value.trim();
  if(!txt) return;
  inp.value = '';
  try {
    await addDoc(collection(db,'teams',teamId,'chat'), {
      uid: state.user.uid,
      name: state.profile.name,
      text: txt,
      createdAt: serverTimestamp()
    });
  } catch(e){ console.error(e); }
}

function subscribeToTeamChat(teamId){
  if(state.teamChatUnsub){ try{state.teamChatUnsub();}catch(e){} state.teamChatUnsub = null; }
  state.teamChatUnsub = onSnapshot(
    query(collection(db,'teams',teamId,'chat'), orderBy('createdAt','asc'), limit(100)),
    snap=>{
      state.teamChat = snap.docs.map(d=>({id:d.id, ...d.data()}));
      renderTeamChat();
    }
  );
}

function renderTeamChat(){
  const box = document.getElementById('teamChatMessages');
  if(!box) return;
  if(!state.teamChat.length){
    box.innerHTML = `<div class="muted" style="text-align:center;padding:20px;font-size:12px">لا رسائل — كن الأول</div>`;
    return;
  }
  box.innerHTML = state.teamChat.map(msg=>{
    const me = msg.uid === state.user.uid;
    return `<div style="align-self:${me?'flex-end':'flex-start'};max-width:80%;padding:8px 12px;border-radius:12px;font-size:12.5px;background:${me?'var(--grad)':'var(--card-2)'};color:${me?'#fff':'var(--txt)'}">
      ${!me?`<div style="font-size:10px;font-weight:800;margin-bottom:3px;color:var(--brand-2)">${esc(msg.name)}</div>`:''}
      ${esc(msg.text)}
    </div>`;
  }).join('');
  box.scrollTop = box.scrollHeight;
}

/* ============================================================
   ✉️ دعوات المباريات
   ============================================================ */

async function inviteFriendToMatch(friendUid, roomId){
  try {
    await addDoc(collection(db,'notifications',friendUid,'items'), {
      type: 'game_invite',
      text: `<b>${esc(state.profile.name)}</b> يدعوك لمباراة Quiz Clash`,
      link: roomId,
      read: false,
      createdAt: serverTimestamp()
    });
    // أضف اللاعب للغرفة أيضاً
    await updateDoc(doc(db,'rooms',roomId), { players: arrayUnion(friendUid) });
    toast('تمت الدعوة ✓');
  } catch(e){ toast('فشل الدعوة'); }
}

async function openInviteMatchModal(roomId){
  // اجلب المتابعات المتبادلة
  const fSnap = await getDocs(query(collection(db,'follows'), where('followerId','==',state.user.uid)));
  const myFollowing = new Set(fSnap.docs.map(d=>d.data().followingId));
  const rSnap = await getDocs(query(collection(db,'follows'), where('followingId','==',state.user.uid)));
  const myFollowers = new Set(rSnap.docs.map(d=>d.data().followerId));
  const mutual = [...myFollowing].filter(u=>myFollowers.has(u));
  const friends = mutual.map(uid=>state.users[uid]).filter(Boolean);

  openModal(`
    <h3>دعوة أصدقاء</h3>
    <div class="sub">اختر من تريد دعوته للمباراة</div>
    ${friends.length ? friends.map(u=>`
      <div class="invite-card">
        ${avatar(u, 40)}
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:800">${esc(u.name)}</div>
          <div class="muted" style="font-size:10.5px">@${esc(u.username)}</div>
        </div>
        <button class="btn btn-primary btn-sm" data-send-invite="${u.uid}" data-room-id="${roomId}">دعوة</button>
      </div>`).join('') : `<div class="empty" style="padding:30px">لا أصدقاء متبادلون بعد</div>`}
    <div class="row" style="margin-top:16px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إغلاق</button>
    </div>
  `);
}

/* ============================================================
   🎁 نظام الهدايا
   ============================================================ */
function openSendGiftModal(recipientUid){
  const recipient = state.users[recipientUid];
  if(!recipient) return toast('المستخدم غير موجود');
  if(recipientUid === state.user.uid) return toast('لا يمكنك إهداء نفسك');
  
  openModal(`
    <div style="text-align:center;margin-bottom:14px">
      ${avatar(recipient, 56)}
      <div style="font-size:14px;font-weight:900;margin-top:8px">إهداء إلى ${esc(recipient.name)}</div>
    </div>
    <div class="field">
      <label>اختر هدية</label>
      <div class="gift-picker">
        ${GIFT_ITEMS.map(g=>`
          <div class="gift-option" data-gift-id="${g.id}" data-gift-price="${g.price}">
            <div class="ge">${g.emoji}</div>
            <div class="gn">${g.name}</div>
            <div class="gp">${nf(g.price)}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="field">
      <label>رسالة مع الهدية (اختياري)</label>
      <input class="input" id="giftMsg" maxlength="80" placeholder="مثال: مبروك على الفوز!">
    </div>
    <div class="field">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="giftAnonymous" style="width:auto">
        <span style="font-size:12px">إرسال مجهول</span>
      </label>
    </div>
    <div class="row" style="margin-top:14px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" id="confirmGiftBtn" data-recipient="${recipientUid}" disabled>
        إرسال
      </button>
    </div>
  `);
  
  // اختيار هدية
  let selectedGift = null;
  document.querySelectorAll('[data-gift-id]').forEach(el=>{
    el.addEventListener('click', ()=>{
      document.querySelectorAll('[data-gift-id]').forEach(x=>x.classList.remove('selected'));
      el.classList.add('selected');
      selectedGift = {
        id: el.dataset.giftId,
        price: parseInt(el.dataset.giftPrice),
      };
      const btn = document.getElementById('confirmGiftBtn');
      btn.disabled = false;
      btn.textContent = `إرسال (${nf(selectedGift.price)} عملة)`;
    });
  });
  
  document.getElementById('confirmGiftBtn').onclick = async ()=>{
    if(!selectedGift) return;
    const msg = document.getElementById('giftMsg').value.trim();
    const anon = document.getElementById('giftAnonymous').checked;
    await sendGift(recipientUid, selectedGift, msg, anon);
    closeModal();
  };
}

async function sendGift(toUid, gift, message, anonymous){
  if((state.profile.coins || 0) < gift.price) return toast('رصيد غير كافٍ');
  
  try {
    // خصم العملات من المرسل
    await updateDoc(doc(db,'users',state.user.uid), {
      coins: increment(-gift.price),
    });
    
    // ★★★ [هنا المكان الصحيح] إضافة الشهرة للمستلم ★★★
    await updateDoc(doc(db,'users',toUid), {
      fame: increment(Math.floor(gift.price / 10))
    });
    
    // سجل الهدية
    await addDoc(collection(db,'gifts'), {
      from: state.user.uid,
      fromName: anonymous ? 'مجهول' : state.profile.name,
      to: toUid,
      giftId: gift.id,
      giftName: GIFT_ITEMS.find(g=>g.id===gift.id)?.name,
      giftEmoji: GIFT_ITEMS.find(g=>g.id===gift.id)?.emoji,
      price: gift.price,
      message: message || '',
      anonymous: !!anonymous,
      createdAt: serverTimestamp(),
    });
    
    // إشعار
    await notify(toUid, 'gift',
      `${anonymous ? 'مجهول' : `<b>${esc(state.profile.name)}</b>`} أرسل لك هدية ${gift.emoji}${message ? ' — ' + esc(message) : ''}`);
    
    // سجل نشاط
    await logActivity('gift_sent', `أرسلت ${gift.emoji} إلى ${state.users[toUid]?.name || 'لاعب'}`, '🎁');
    
    toast(`🎁 تم إرسال الهدية!`);
  } catch(e){ console.error(e); toast('فشل الإرسال'); }
}

async function pageGifts(){
  try {
    const rSnap = await getDocs(query(
      collection(db,'gifts'), where('to','==',state.user.uid), limit(100)
    ));
    const received = rSnap.docs.map(d=>({id:d.id, ...d.data()}))
      .sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));

    const sSnap = await getDocs(query(
      collection(db,'gifts'), where('from','==',state.user.uid), limit(100)
    ));
    const sent = sSnap.docs.map(d=>({id:d.id, ...d.data()}))
      .sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
    
    const tab = state.giftTab || 'received';
    const list = tab === 'received' ? received : sent;
    
    return `
      <h1 class="page-title">🎁 الهدايا</h1>
      
      <div class="inv-tabs" style="margin-bottom:14px">
        <button class="inv-tab ${tab==='received'?'active':''}" data-gift-tab="received">
          مستلمة (${received.length})
        </button>
        <button class="inv-tab ${tab==='sent'?'active':''}" data-gift-tab="sent">
          مرسلة (${sent.length})
        </button>
      </div>
      
      ${list.length ? list.map(g=>`
        <div class="gift-history-item ${tab==='sent'?'sent':'received'}">
          <div style="font-size:26px">${g.giftEmoji || '🎁'}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:12.5px;font-weight:800">
              ${tab === 'received' ? esc(g.fromName || 'مجهول') : esc(state.users[g.to]?.name || 'لاعب')}
            </div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(g.message || g.giftName || '')}</div>
            <div style="font-size:9.5px;color:var(--muted);margin-top:3px">${timeAgo(g.createdAt)}</div>
          </div>
          <div class="pill gold">${ic('coin','xs')} ${nf(g.price || 0)}</div>
        </div>
      `).join('') : emptyState('لا هدايا هنا بعد','gift' in ICONS ? 'star' : 'star')}
    `;
  } catch(e){
    console.error(e);
    return `<h1 class="page-title">🎁 الهدايا</h1>${emptyState('خطأ في التحميل','star')}`;
  }
}

/* ============================================================
   🏆 نظام المواسم
   ============================================================ */
async function loadSeasonInfo(){
  try {
    const snap = await getDoc(doc(db,'seasons','current'));
    if(snap.exists()){
      state.seasonInfo = snap.data();
      return;
    }

    // موسم افتراضي محلي (في حال منعت القواعد الإنشاء)
    const virtualSeason = {
      number: 1, themeId: 's1', status: 'active',
      startedAt: new Date(),
      endsAt: new Date(Date.now() + SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000),
      _virtual: true
    };
    state.seasonInfo = virtualSeason;

    // حاول إنشاء المستند — إذا فشلت القواعد، نبقى على الموسم الافتراضي
    try {
      await setDoc(doc(db,'seasons','current'), {
        number: 1, themeId: 's1',
        startedAt: serverTimestamp(),
        endsAt: new Date(Date.now() + SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000),
        status: 'active'
      });
      const s2 = await getDoc(doc(db,'seasons','current'));
      if(s2.exists()) state.seasonInfo = s2.data();
    } catch(e){
      console.warn('season create denied — using virtual season');
    }
  } catch(e){
    console.error(e);
    // حتى لو فشل كل شيء، الموسم الافتراضي يُعرض
    if(!state.seasonInfo) state.seasonInfo = {
      number: 1, themeId: 's1', status: 'active',
      startedAt: new Date(), endsAt: new Date(Date.now() + SEASON_DURATION_DAYS*24*60*60*1000),
      _virtual: true
    };
  }
}

function getSeasonTheme(themeId){
  return SEASON_THEMES.find(t => t.id === themeId) || SEASON_THEMES[0];
}

function seasonTimeLeft(){
  const info = state.seasonInfo;
  if(!info?.endsAt) return null;
  const endsAt = info.endsAt.toDate ? info.endsAt.toDate() : new Date(info.endsAt);
  return Math.max(0, endsAt.getTime() - Date.now());
}

function pageSeason(){
  if(!state.seasonInfo){
    return `<h1 class="page-title">🏆 الموسم</h1>${emptyState('جاري تحميل الموسم…','trophy')}`;
  }
  
  const info = state.seasonInfo;
  const theme = getSeasonTheme(info.themeId);
  const msLeft = seasonTimeLeft();
  const days = Math.floor(msLeft / (1000*60*60*24));
  const hours = Math.floor((msLeft % (1000*60*60*24)) / (1000*60*60));
  const mins = Math.floor((msLeft % (1000*60*60)) / (1000*60));
  
  // أعلى اللاعبين هذا الموسم (حسب XP)
  const topPlayers = Object.values(state.users)
    .sort((a,b) => (b.xp || 0) - (a.xp || 0))
    .slice(0, 10);
  
  return `
    
    <div class="season-hero">
      <span class="season-emblem">${theme.emoji}</span>
      <div class="season-name">${esc(theme.name)}</div>
      <div class="season-dates">الموسم ${info.number} · ${SEASON_DURATION_DAYS} يوم</div>
      
      <div class="season-timer">
        <div><div class="v">${days}</div><div class="l">يوم</div></div>
        <div><div class="v">${hours}</div><div class="l">ساعة</div></div>
        <div><div class="v">${mins}</div><div class="l">دقيقة</div></div>
      </div>
    </div>
    
    <div class="card" style="margin-bottom:14px">
      <div style="font-size:12.5px;color:var(--muted);line-height:1.75">
        🎯 <b style="color:var(--txt)">كيف يعمل الموسم؟</b><br>
        كل موسم يستمر ${SEASON_DURATION_DAYS} يوماً، تنافس على أعلى XP.<br>
        في نهاية الموسم، أفضل 3 لاعبين يحصلون على مكافآت حصرية.<br>
        يتم إعادة ضبط XP بشكل جزئي، والبدء من جديد.
      </div>
    </div>
    
    <div class="section-title">${ic('trophy','sm')} أفضل اللاعبين</div>
    ${topPlayers.map((u,i)=>`
      <div class="lb-row ${u.uid===state.user.uid?'me':''}" data-view-profile="${u.uid}" style="cursor:pointer">
        <div class="lb-rank ${i<3?'r'+(i+1):''}">${i+1}</div>
        ${avatar(u, 40)}
        <div class="lb-mid">
          <div class="lb-n">${esc(u.name)} ${u.uid===state.user.uid?'<span class="pill" style="font-size:9px">أنت</span>':''}</div>
          <div class="lb-s">المستوى ${levelFromXp(u.xp)}</div>
        </div>
        <div class="lb-v">${nf(u.xp || 0)} XP</div>
      </div>
    `).join('')}
    
    <div class="section-title" style="margin-top:20px">${ic('star','sm')} جوائز الموسم</div>
    <div class="card">
      <div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)">
        <div class="lb-rank r1">1</div>
        <div style="flex:1;font-size:13px;font-weight:800">المركز الأول</div>
        <div class="pill gold">${ic('coin','xs')} 5000 + لقب حصري</div>
      </div>
      <div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)">
        <div class="lb-rank r2">2</div>
        <div style="flex:1;font-size:13px;font-weight:800">المركز الثاني</div>
        <div class="pill">${ic('coin','xs')} 3000</div>
      </div>
      <div class="row" style="padding:8px 0">
        <div class="lb-rank r3">3</div>
        <div style="flex:1;font-size:13px;font-weight:800">المركز الثالث</div>
        <div class="pill">${ic('coin','xs')} 1500</div>
      </div>
    </div>
  `;
}

async function endCurrentSeason(){
  // يستدعى من لوحة الإدارة
  if(state.profile?.role !== 'admin') return toast('غير مصرح');
  if(!confirm('إنهاء الموسم الحالي وبدء موسم جديد؟')) return;
  
  try {
    const info = state.seasonInfo;
    if(!info) return;
    
    // وزّع المكافآت على أفضل 3
    const top = Object.values(state.users)
      .sort((a,b) => (b.xp || 0) - (a.xp || 0))
      .slice(0, 3);
    const rewards = [5000, 3000, 1500];
    
    for(let i = 0; i < top.length; i++){
      try {
        await updateDoc(doc(db,'users',top[i].uid), {
          coins: increment(rewards[i]),
        });
        await notify(top[i].uid, 'season_end',
          `🏆 أنهيت الموسم في المركز ${i+1}! حصلت على ${rewards[i]} عملة`);
      } catch(e){}
    }
    
    // أنشئ موسم جديد
    const newNumber = (info.number || 1) + 1;
    const newThemeId = SEASON_THEMES[newNumber % SEASON_THEMES.length].id;
    await setDoc(doc(db,'seasons','current'), {
      id: 'season_' + newNumber,
      number: newNumber,
      themeId: newThemeId,
      startedAt: serverTimestamp(),
      endsAt: new Date(Date.now() + SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000),
      status: 'active',
    });
    
    // احفظ الموسم القديم
    await setDoc(doc(db,'seasons','season_' + info.number), {
      ...info, status: 'finished', finishedAt: serverTimestamp(),
      topPlayers: top.map((u,i) => ({ uid: u.uid, name: u.name, rank: i+1, xp: u.xp })),
    });
    
    toast('تم بدء موسم جديد! 🎉');
    await loadSeasonInfo();
    render();
  } catch(e){ console.error(e); toast('فشل'); }
}

/* ============================================================
   🎨 استوديو التخصيص — دوال المناطق
   ============================================================ */
function getZoneLabel(zone){
  return {
    cover:    '🖼️ الغلاف',
    avatar:   '👤 الصورة الشخصية',
    name:     '✏️ الاسم',
    username: '@ اسم المستخدم',
    bio:      '📝 النبذة',
    body:     '🎨 الثيم',
    card:     '🃏 البطاقة',
    level:    '🏅 المستوى',
    texts:    '🔤 النصوص',
  }[zone] || '';
}

/* تحديث قسم الخيارات فقط (بدون render كامل) */
function refreshCustOptions(){
  const optArea = document.getElementById('custOptionsArea');
  if(!optArea) return;
  const p = state.profile;
  if(!p) return;
  const sub = getSubscription(p);
  const cust = getProfileCustomization(p);
  const themeId = p.equipped?.themeId || p.themeId || 'default';
  const frameId = p.equipped?.frameId || p.frameId || 'none';
  const zone = state.custActiveZone;
  optArea.innerHTML = zone
    ? renderZoneOptions(zone, p, sub, cust, themeId, frameId)
    : '';
}

/* ============================================================
   💎 مودال الاشتراكات
   ============================================================ */
function openSubscriptionPlansModal(){
  const p = state.profile;
  if(!p) return;
  const sub = getSubscription(p);

  openModal(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h3 style="margin:0">💎 الاشتراكات</h3>
      <button class="icon-btn" data-action="modal-close" style="width:32px;height:32px">
        ${ic('close','sm')}
      </button>
    </div>
    <div class="sub-plans-grid">
      ${Object.entries(SUBSCRIPTION_PLANS).filter(([k])=>k!=='free').map(([k, pl])=>{
        const isActive = sub.plan === k;
        return `
          <button class="sub-plan-card ${isActive?'active':''}" data-buy-plan="${k}">
            <div class="sp-top" style="background:${pl.color}20;border-color:${pl.color}50">
              <div style="font-size:28px">${pl.emoji}</div>
              <div style="font-size:14px;font-weight:900;color:${pl.color}">${pl.name}</div>
              <div style="font-size:11px;color:var(--muted)">${pl.durationDays} يوم</div>
            </div>
            <div class="sp-body">
              <div style="font-size:16px;font-weight:900;color:var(--gold)">${nf(pl.price)} عملة</div>
              ${isActive
                ? `<span class="pill ok" style="font-size:9px;margin-top:6px">✓ نشط</span>`
                : `<span class="btn btn-primary btn-sm" style="margin-top:6px;width:100%;font-size:11px">شراء</span>`}
            </div>
          </button>
        `;
      }).join('')}
    </div>
  `);
}

/* ============================================================
   📦 خيارات كل منطقة
   ============================================================ */
function renderZoneBody(zone, p, sub, cust, themeId, frameId){

/* ══════════════════════════════════════════════════════════
   ✍️ التواقيع
   ══════════════════════════════════════════════════════════ */
if(zone === 'signatures'){
  return `
    <!-- ═══ تبويب: النمط ═══ -->
    <div class="cust-field" data-subtab="style">
      <label>نمط التوقيع</label>
      <div class="compact-chips">
        ${Object.entries(SIGNATURE_STYLES).map(([k,s]) =>
          `<button class="cchip ${cust.sigStyle===k?'active':''}" data-cust="sigStyle" data-val="${k}">${s.emoji} ${s.label}</button>`
        ).join('')}
      </div>
    </div>
    <div class="cust-field" data-subtab="style">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="sigShowAvatarChk" ${cust.sigShowAvatar?'checked':''} style="width:auto">
        <span>إظهار صورة صاحب التوقيع</span>
      </label>
    </div>
    <div class="cust-field" data-subtab="style">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="sigShowTimeChk" ${cust.sigShowTime?'checked':''} style="width:auto">
        <span>إظهار الوقت</span>
      </label>
    </div>
    <div class="cust-field" data-subtab="style">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="sigShowNameChk" ${cust.sigShowName?'checked':''} style="width:auto">
        <span>إظهار اسم صاحب التوقيع</span>
      </label>
    </div>

    <!-- ═══ تبويب: اللون ═══ -->
    <div class="cust-field" data-subtab="color">
      <label>لون النص</label>
      <div class="color-strip">
        ${NAME_COLOR_PRESETS.slice(0,20).map(c =>
          `<button class="color-dot ${cust.sigColor===c?'active':''}" style="background:${c}" data-cust="sigColor" data-val="${c}"></button>`
        ).join('')}
      </div>
    </div>
    <div class="cust-field" data-subtab="color">
      <label>تدرج النص</label>
      <div class="compact-chips">
        ${Object.entries(NAME_GRADIENTS).map(([k,g]) =>
          `<button class="cchip ${cust.sigGradient===k?'active':''}" data-cust="sigGradient" data-val="${k}">${g.emoji} ${g.label}</button>`
        ).join('')}
      </div>
    </div>
    <div class="cust-field" data-subtab="color">
      <label>تأثير النص</label>
      <div class="compact-chips">
        ${Object.entries(TEXT_EFFECTS).map(([k,e]) =>
          `<button class="cchip ${cust.sigEffect===k?'active':''}" data-cust="sigEffect" data-val="${k}">${e.emoji} ${e.label}</button>`
        ).join('')}
      </div>
    </div>
    <div class="cust-field" data-subtab="color">
      <label>لون الخلفية</label>
      <div class="color-strip">
        <button class="color-dot ${!cust.sigBg?'active':''}"
                style="background:repeating-linear-gradient(45deg,#333 0 4px,#222 4px 8px)"
                data-cust="sigBg" data-val="" title="بدون"></button>
        ${NAME_COLOR_PRESETS.slice(0,20).map(c =>
          `<button class="color-dot ${cust.sigBg===c?'active':''}" style="background:${c}" data-cust="sigBg" data-val="${c}"></button>`
        ).join('')}
      </div>
    </div>
    <div class="cust-field" data-subtab="color">
      <label>شفافية الخلفية <span class="range-val" id="sigBgOpacityVal">${cust.sigBgOpacity}%</span></label>
      <input type="range" class="crop-slider" id="sigBgOpacitySlider" min="0" max="100" value="${cust.sigBgOpacity}">
    </div>
    <div class="cust-field" data-subtab="color">
      <label>لون الإطار</label>
      <div class="color-strip">
        ${NAME_COLOR_PRESETS.slice(0,20).map(c =>
          `<button class="color-dot ${cust.sigBorderColor===c?'active':''}" style="background:${c}" data-cust="sigBorderColor" data-val="${c}"></button>`
        ).join('')}
      </div>
    </div>

    <!-- ═══ تبويب: الخط ═══ -->
    <div class="cust-field" data-subtab="font">
      <label>الحجم</label>
      <div class="compact-chips">
        ${[['sm','صغير'],['md','عادي'],['lg','كبير'],['xl','أكبر']].map(([v,l]) =>
          `<button class="cchip ${cust.sigFontSize===v?'active':''}" data-cust="sigFontSize" data-val="${v}">${l}</button>`
        ).join('')}
      </div>
    </div>
    <div class="cust-field" data-subtab="font">
      <label>السماكة</label>
      <div class="compact-chips">
        ${Object.entries(FONT_WEIGHTS).map(([k,w]) =>
          `<button class="cchip ${cust.sigFontWeight===k?'active':''}" data-cust="sigFontWeight" data-val="${k}" style="font-weight:${w.value}">${w.label}</button>`
        ).join('')}
      </div>
    </div>
    <div class="cust-field" data-subtab="font">
      <label>الخط</label>
      <div class="compact-chips">
        ${Object.entries(SIGNATURE_FONTS).map(([k,f]) =>
          `<button class="cchip ${cust.sigFontFamily===k?'active':''}" data-cust="sigFontFamily" data-val="${k}" style="font-family:${f.value}">${f.label}</button>`
        ).join('')}
      </div>
    </div>
    <div class="cust-field" data-subtab="font">
      <label>نمط الخط</label>
      <div class="compact-chips">
        ${[['normal','عادي'],['italic','مائل'],['oblique','مائل 2']].map(([k,l]) =>
          `<button class="cchip ${cust.sigFontStyle===k?'active':''}" data-cust="sigFontStyle" data-val="${k}">${l}</button>`
        ).join('')}
      </div>
    </div>

    <!-- ═══ تبويب: التخطيط ═══ -->
    <div class="cust-field" data-subtab="layout">
      <label>المحاذاة</label>
      <div class="compact-chips">
        ${[['right','يمين'],['center','وسط'],['left','يسار']].map(([k,l]) =>
          `<button class="cchip ${cust.sigAlign===k?'active':''}" data-cust="sigAlign" data-val="${k}">${l}</button>`
        ).join('')}
      </div>
    </div>
    <div class="cust-field" data-subtab="layout">
      <label>الحشوة الداخلية <span class="range-val" id="sigPaddingVal">${cust.sigPadding}px</span></label>
      <input type="range" class="crop-slider" id="sigPaddingSlider" min="0" max="24" value="${cust.sigPadding}">
    </div>
    <div class="cust-field" data-subtab="layout">
      <label>سماكة الإطار <span class="range-val" id="sigBorderWidthVal">${cust.sigBorderWidth}px</span></label>
      <input type="range" class="crop-slider" id="sigBorderWidthSlider" min="0" max="8" value="${cust.sigBorderWidth}">
    </div>
    <div class="cust-field" data-subtab="layout">
      <label>استدارة الزوايا <span class="range-val" id="sigBorderRadiusVal">${cust.sigBorderRadius}px</span></label>
      <input type="range" class="crop-slider" id="sigBorderRadiusSlider" min="0" max="30" value="${cust.sigBorderRadius}">
    </div>
    <div class="cust-field" data-subtab="layout">
      <label>تباعد الحروف <span class="range-val" id="sigLetterSpacingVal">${cust.sigLetterSpacing}px</span></label>
      <input type="range" class="crop-slider" id="sigLetterSpacingSlider" min="-1" max="4" step="0.5" value="${cust.sigLetterSpacing}">
    </div>
    <div class="cust-field" data-subtab="layout">
      <label>ارتفاع السطر <span class="range-val" id="sigLineHeightVal">${cust.sigLineHeight}</span></label>
      <input type="range" class="crop-slider" id="sigLineHeightSlider" min="1" max="2.5" step="0.1" value="${cust.sigLineHeight}">
    </div>
    <div class="cust-field" data-subtab="layout">
      <label>الظل</label>
      <div class="compact-chips">
        ${Object.entries(CARD_SHADOWS).map(([k,s]) =>
          `<button class="cchip ${cust.sigShadow===k?'active':''}" data-cust="sigShadow" data-val="${k}">${s.emoji} ${s.label}</button>`
        ).join('')}
      </div>
    </div>

    <!-- ═══ تبويب: الحركة ═══ -->
    <div class="cust-field" data-subtab="animation">
      <label>حركة التوقيع</label>
      <div class="compact-chips">
        ${Object.entries(SIGNATURE_ANIMATIONS).map(([k,a]) =>
          `<button class="cchip ${cust.sigAnimation===k?'active':''}" data-cust="sigAnimation" data-val="${k}">${a.emoji} ${a.label}</button>`
        ).join('')}
      </div>
    </div>

    <!-- ═══ تبويب: العرض ═══ -->
    <div class="cust-field" data-subtab="display">
      <label>عدد التواقيع المعروضة <span class="range-val" id="sigDisplayCountVal">${cust.sigDisplayCount}</span></label>
      <input type="range" class="crop-slider" id="sigDisplayCountSlider" min="1" max="10" value="${cust.sigDisplayCount}">
    </div>
    <div class="info-hint">
      💡 هذه التخصيصات تُطبَّق على <b>قسم التواقيع</b> في ملفك الشخصي عند الزوار
    </div>
  `;
}

/* ══════════════════════════════════════════════════════════
   📰 المنشورات
   ══════════════════════════════════════════════════════════ */
if(zone === 'posts'){
  return `
    <!-- ═══ تبويب: النمط ═══ -->
    <div class="cust-field" data-subtab="style">
      <label>نمط بطاقة المنشور</label>
      <div class="compact-chips">
        ${Object.entries(POST_CARD_STYLES).map(([k,s]) =>
          `<button class="cchip ${cust.postCardStyle===k?'active':''}" data-cust="postCardStyle" data-val="${k}">${s.emoji} ${s.label}</button>`
        ).join('')}
      </div>
    </div>
    <div class="cust-field" data-subtab="style">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="postShowActionsChk" ${cust.postShowActions?'checked':''} style="width:auto">
        <span>إظهار أزرار التفاعل (إعجاب/تعليق/إعادة نشر)</span>
      </label>
    </div>

    <!-- ═══ تبويب: التخطيط ═══ -->
    <div class="cust-field" data-subtab="layout">
      <label>تخطيط المنشور</label>
      <div class="compact-chips">
        ${Object.entries(POST_LAYOUTS).map(([k,l]) =>
          `<button class="cchip ${cust.postLayout===k?'active':''}" data-cust="postLayout" data-val="${k}">${l.label}</button>`
        ).join('')}
      </div>
    </div>
    <div class="cust-field" data-subtab="layout">
      <label>شكل صورة صاحب المنشور</label>
      <div class="compact-chips">
        ${Object.entries(POST_AVATAR_SHAPES).map(([k,s]) =>
          `<button class="cchip ${cust.postAvatarShape===k?'active':''}" data-cust="postAvatarShape" data-val="${k}">${s.label}</button>`
        ).join('')}
      </div>
    </div>
    <div class="cust-field" data-subtab="layout">
      <label>حجم الصورة <span class="range-val" id="postAvatarSizeVal">${cust.postAvatarSize}px</span></label>
      <input type="range" class="crop-slider" id="postAvatarSizeSlider" min="30" max="64" value="${cust.postAvatarSize}">
    </div>
    <div class="cust-field" data-subtab="layout">
      <label>استدارة البطاقة <span class="range-val" id="postBorderRadiusVal">${cust.postBorderRadius}px</span></label>
      <input type="range" class="crop-slider" id="postBorderRadiusSlider" min="0" max="30" value="${cust.postBorderRadius}">
    </div>
    <div class="cust-field" data-subtab="layout">
      <label>سماكة الحدود <span class="range-val" id="postBorderWidthVal">${cust.postBorderWidth}px</span></label>
      <input type="range" class="crop-slider" id="postBorderWidthSlider" min="0" max="4" value="${cust.postBorderWidth}">
    </div>

    <!-- ═══ تبويب: الألوان ═══ -->
    <div class="cust-field" data-subtab="colors">
      <label>لون خلفية المنشور</label>
      <div class="color-strip">
        <button class="color-dot ${!cust.postBgColor?'active':''}"
                style="background:repeating-linear-gradient(45deg,#333 0 4px,#222 4px 8px)"
                data-cust="postBgColor" data-val="" title="افتراضي"></button>
        ${NAME_COLOR_PRESETS.slice(0,20).map(c =>
          `<button class="color-dot ${cust.postBgColor===c?'active':''}" style="background:${c}" data-cust="postBgColor" data-val="${c}"></button>`
        ).join('')}
      </div>
    </div>
    <div class="cust-field" data-subtab="colors">
      <label>شفافية الخلفية <span class="range-val" id="postBgOpacityVal">${cust.postBgOpacity}%</span></label>
      <input type="range" class="crop-slider" id="postBgOpacitySlider" min="0" max="100" value="${cust.postBgOpacity}">
    </div>
    <div class="cust-field" data-subtab="colors">
      <label>لون الحدود</label>
      <div class="color-strip">
        <button class="color-dot ${!cust.postBorderColor?'active':''}"
                style="background:repeating-linear-gradient(45deg,#333 0 4px,#222 4px 8px)"
                data-cust="postBorderColor" data-val="" title="افتراضي"></button>
        ${NAME_COLOR_PRESETS.slice(0,20).map(c =>
          `<button class="color-dot ${cust.postBorderColor===c?'active':''}" style="background:${c}" data-cust="postBorderColor" data-val="${c}"></button>`
        ).join('')}
      </div>
    </div>
    <div class="cust-field" data-subtab="colors">
      <label>لون اسم الناشر</label>
      <div class="color-strip">
        <button class="color-dot ${!cust.postNameColor?'active':''}"
                style="background:repeating-linear-gradient(45deg,#333 0 4px,#222 4px 8px)"
                data-cust="postNameColor" data-val="" title="افتراضي"></button>
        ${NAME_COLOR_PRESETS.slice(0,20).map(c =>
          `<button class="color-dot ${cust.postNameColor===c?'active':''}" style="background:${c}" data-cust="postNameColor" data-val="${c}"></button>`
        ).join('')}
      </div>
    </div>
    <div class="cust-field" data-subtab="colors">
      <label>لون النص</label>
      <div class="color-strip">
        <button class="color-dot ${!cust.postTextColor?'active':''}"
                style="background:repeating-linear-gradient(45deg,#333 0 4px,#222 4px 8px)"
                data-cust="postTextColor" data-val="" title="افتراضي"></button>
        ${NAME_COLOR_PRESETS.slice(0,20).map(c =>
          `<button class="color-dot ${cust.postTextColor===c?'active':''}" style="background:${c}" data-cust="postTextColor" data-val="${c}"></button>`
        ).join('')}
      </div>
    </div>

    <!-- ═══ تبويب: التوهج ═══ -->
    <div class="cust-field" data-subtab="glow">
      <label>توهج بطاقة المنشور</label>
      <div class="compact-chips">
        ${Object.entries(CARD_GLOWS).map(([k,g]) =>
          `<button class="cchip ${cust.postGlow===k?'active':''}" data-cust="postGlow" data-val="${k}">${g.emoji} ${g.label}</button>`
        ).join('')}
      </div>
    </div>
    <div class="info-hint">
      💡 هذه التخصيصات تُطبَّق على <b>منشوراتك</b> التي تظهر في الصفحة الرئيسية وملفك
    </div>
  `;
}

  /* ══════════════════════════════════════════════════════════
     🖼️ الغلاف — 3 تبويبات: الصورة / النمط / التأثير
     ══════════════════════════════════════════════════════════ */
  if(zone === 'cover'){
    return `
      <!-- ═══ تبويب: الصورة ═══ -->
      <div class="cust-field" data-subtab="image">
        <label>الصورة</label>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" data-change-image="cover">${ic('camera','xs')} ${p.coverUrl?'تغيير':'إضافة'}</button>
          ${p.coverUrl ? `<button class="btn btn-ghost btn-sm" data-recrop-cover="1">${ic('edit','xs')} اقتصاص</button><button class="btn btn-ghost btn-sm" data-delete-image="cover">${ic('trash','xs')} حذف</button>` : ''}
        </div>
      </div>
      <div class="cust-field" data-subtab="image">
        <label>التدرج الاحتياطي (بدون صورة)</label>
        <div class="color-strip">
          ${COVER_PRESETS.map(cp => `<button class="cover-preset-btn ${cust.coverPreset===cp.id?'active':''}" data-cust="coverPreset" data-val="${cp.id}" style="background:${cp.css}" title="${cp.name}"></button>`).join('')}
        </div>
      </div>
      ${p.coverUrl ? `
        <div class="cust-field" data-subtab="image"><label>الضبابية <span class="range-val" id="coverBlurVal">${cust.coverBlur}px</span></label><input type="range" class="crop-slider" id="coverBlurSlider" min="0" max="15" value="${cust.coverBlur}"></div>
        <div class="cust-field" data-subtab="image"><label>الزوم <span class="range-val" id="coverZoomVal">${cust.coverZoom}%</span></label><input type="range" class="crop-slider" id="coverZoomSlider" min="50" max="200" value="${cust.coverZoom}"></div>
        <div class="cust-field" data-subtab="image"><label>السطوع <span class="range-val" id="coverBrightnessVal">${cust.coverBrightnessNew}%</span></label><input type="range" class="crop-slider" id="coverBrightnessSlider" min="30" max="180" value="${cust.coverBrightnessNew}"></div>
        <div class="cust-field" data-subtab="image"><label>التباين <span class="range-val" id="coverContrastVal">${cust.coverContrast}%</span></label><input type="range" class="crop-slider" id="coverContrastSlider" min="50" max="200" value="${cust.coverContrast}"></div>
        <div class="cust-field" data-subtab="image"><label>التشبع <span class="range-val" id="coverSaturationVal">${cust.coverSaturation}%</span></label><input type="range" class="crop-slider" id="coverSaturationSlider" min="0" max="200" value="${cust.coverSaturation}"></div>
        <div class="cust-field" data-subtab="image"><label>درجة اللون <span class="range-val" id="coverHueVal">${cust.coverHue}°</span></label><input type="range" class="crop-slider" id="coverHueSlider" min="-180" max="180" value="${cust.coverHue}"></div>
        <div class="cust-field" data-subtab="image"><label>الشفافية <span class="range-val" id="coverOpacityVal">${cust.coverOpacity}%</span></label><input type="range" class="crop-slider" id="coverOpacitySlider" min="20" max="100" value="${cust.coverOpacity}"></div>
      ` : ''}

      <!-- ═══ تبويب: النمط ═══ -->
      <div class="cust-field" data-subtab="style"><label>النمط</label><div class="compact-chips">${Object.entries(COVER_PATTERNS).map(([k,v]) => `<button class="cchip ${cust.coverPattern===k?'active':''}" data-cust="coverPattern" data-val="${k}">${v.emoji} ${v.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="style"><label>لون النمط</label><div class="color-strip">${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust.coverPatternColor===c?'active':''}" style="background:${c}" data-cust="coverPatternColor" data-val="${c}"></button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="style"><label>الطبقة الفوقية</label><div class="compact-chips">${Object.entries(COVER_OVERLAYS).map(([k,v]) => `<button class="cchip ${cust.coverOverlayStyle===k?'active':''}" data-cust="coverOverlayStyle" data-val="${k}">${v.emoji} ${v.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="style"><label>الحواف <span class="range-val" id="coverVignetteVal">${cust.coverVignette}%</span></label><input type="range" class="crop-slider" id="coverVignetteSlider" min="0" max="100" value="${cust.coverVignette}"></div>
      <div class="cust-field" data-subtab="style"><label>استدارة الغلاف <span class="range-val" id="coverRadiusVal">${cust.coverRadius}px</span></label><input type="range" class="crop-slider" id="coverRadiusSlider" min="0" max="40" value="${cust.coverRadius}"></div>

      <!-- ═══ تبويب: التأثير ═══ -->
      <div class="cust-field" data-subtab="effect">
        <label>تأثير متحرك ${!canUseBannerEffect(p)?'<span class="lock-hint">🔒 بلس</span>':''}</label>
        ${canUseBannerEffect(p) ? `<div class="compact-chips">${Object.entries(BANNER_EFFECTS).map(([k,e]) => `<button class="cchip ${cust.bannerEffect===k?'active':''}" data-cust="bannerEffect" data-val="${k}">${e.emoji} ${e.label}</button>`).join('')}</div>` : `<div class="locked-feature" data-action="upsell-plus">${ic('lock','sm')} بلس</div>`}
      </div>
      <div class="cust-field" data-subtab="effect">
        <label>نوع الحركة ${!canUseBannerEffect(p)?'<span class="lock-hint">🔒 بلس</span>':''}</label>
        ${canUseBannerEffect(p) ? `<div class="compact-chips">${[['none','بدون'],['pan','تحريك'],['zoom','تكبير/تصغير'],['pulse','نبض'],['sway','تمايل']].map(([k,l]) => `<button class="cchip ${cust.coverAnimType===k?'active':''}" data-cust="coverAnimType" data-val="${k}">${l}</button>`).join('')}</div>` : `<div class="locked-feature" data-action="upsell-plus">${ic('lock','sm')} بلس</div>`}
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════
     👤 الصورة الشخصية — 4 تبويبات: الشكل / الإطار / التأثيرات / الزخرفة
     ══════════════════════════════════════════════════════════ */
  if(zone === 'avatar'){
    return `
      <!-- ═══ تبويب: الشكل ═══ -->
      <div class="cust-field" data-subtab="shape">
        <label>الصورة</label>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" data-change-image="avatar">${ic('camera','xs')} ${p.avatarUrl?'تغيير':'إضافة'}</button>
          ${p.avatarUrl ? `<button class="btn btn-ghost btn-sm" data-delete-image="avatar">${ic('trash','xs')} حذف</button>` : ''}
        </div>
      </div>
      <div class="cust-field" data-subtab="shape">
        <label>الشكل ${!canCustomizeShape(p)?'<span class="lock-hint">🔒 بلس</span>':''}</label>
        ${canCustomizeShape(p) ? `<div class="shape-picker-row">${Object.entries(AVATAR_SHAPES).map(([k,s]) => `<button class="shape-btn ${cust.avatarShape===k?'active':''}" data-cust="avatarShape" data-val="${k}" title="${s.label}"><div style="width:32px;height:32px;background:var(--grad);${s.clip?`clip-path:${s.clip};border-radius:0;`:`border-radius:${s.radius};`}"></div></button>`).join('')}</div>` : `<div class="locked-feature" data-action="upsell-plus">${ic('lock','sm')} بلس</div>`}
      </div>
      <div class="cust-field" data-subtab="shape">
        <label>حجم الصورة <span class="range-val" id="avatarSizeVal">${cust.avatarSize}px</span></label>
        <input type="range" class="crop-slider" id="avatarSizeSlider" min="60" max="140" value="${cust.avatarSize}">
      </div>
      <div class="cust-field" data-subtab="shape">
        <label>نمط الإطار ${!canCustomizeBorder(p)?'<span class="lock-hint">🔒 بلس</span>':''}</label>
        ${canCustomizeBorder(p) ? `<div class="compact-chips">${Object.entries(AVATAR_BORDERS).map(([k,b]) => `<button class="cchip ${cust.avatarBorder===k?'active':''}" data-cust="avatarBorder" data-val="${k}">${b.emoji} ${b.label}</button>`).join('')}</div>` : `<div class="locked-feature" data-action="upsell-plus">${ic('lock','sm')} بلس</div>`}
      </div>
      <div class="cust-field" data-subtab="shape">
        <label>نمط خط الحدود</label>
        <div class="compact-chips">
          ${[['solid','صلب'],['dashed','متقطع'],['dotted','منقط'],['double','مزدوج'],['none','بدون']].map(([k,l]) => `<button class="cchip ${cust.avatarBorderStyle===k?'active':''}" data-cust="avatarBorderStyle" data-val="${k}">${l}</button>`).join('')}
        </div>
      </div>

      <!-- ═══ تبويب: الإطار ═══ -->
      <div class="cust-field" data-subtab="frame">
        <label>الإطار ${!canUseFrame(p, frameId)?'<span class="lock-hint">🔒</span>':''}</label>
        <div class="frame-picker-row">
          ${Object.entries(FRAME_STYLES).map(([k,f]) => {
            const canUse = canUseFrame(p, k);
            return `<button class="frame-btn ${frameId===k?'active':''} ${!canUse?'locked':''}" ${canUse?`data-set-frame="${k}"`:`data-buy-frame="${k}"`} title="${f.name}"><div style="width:30px;height:30px;border-radius:50%;background:var(--grad);position:relative;" class="${f.class||''}"><span style="position:absolute;inset:0;display:grid;place-items:center;font-weight:900;color:#fff;font-size:12px">${(p.name||'?').charAt(0)}</span></div>${!canUse ? `<span class="frame-lock-mini">${ic('lock','xs')}</span>` : ''}</button>`;
          }).join('')}
        </div>
      </div>
      <div class="cust-field" data-subtab="frame">
        <label>اللون الأول للإطار</label>
        <div class="color-strip">${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust.frameColor1===c?'active':''}" style="background:${c}" data-cust="frameColor1" data-val="${c}"></button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="frame">
        <label>اللون الثاني للإطار</label>
        <div class="color-strip">${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust.frameColor2===c?'active':''}" style="background:${c}" data-cust="frameColor2" data-val="${c}"></button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="frame">
        <label>سماكة الإطار <span class="range-val" id="frameThicknessVal">${cust.frameThickness}px</span></label>
        <input type="range" class="crop-slider" id="frameThicknessSlider" min="1" max="12" value="${cust.frameThickness}">
      </div>
      <div class="cust-field" data-subtab="frame">
        <label>شدة التوهج <span class="range-val" id="frameGlowVal">${cust.frameGlowIntensity}</span></label>
        <input type="range" class="crop-slider" id="frameGlowSlider" min="0" max="100" value="${cust.frameGlowIntensity}">
      </div>

      <!-- ═══ تبويب: التأثيرات ═══ -->
      <div class="cust-field" data-subtab="effects">
        <label>الدوران <span class="range-val" id="avatarRotationVal">${cust.avatarRotation}°</span></label>
        <input type="range" class="crop-slider" id="avatarRotationSlider" min="0" max="360" value="${cust.avatarRotation}">
      </div>
      <div class="cust-field" data-subtab="effects">
        <label>الحجم <span class="range-val" id="avatarScaleVal">${Math.round(cust.avatarScale*100)}%</span></label>
        <input type="range" class="crop-slider" id="avatarScaleSlider" min="70" max="130" value="${Math.round(cust.avatarScale*100)}">
      </div>
      <div class="cust-field" data-subtab="effects">
        <label>إزاحة أفقية <span class="range-val" id="avatarOffsetXVal">${cust.avatarOffsetX}px</span></label>
        <input type="range" class="crop-slider" id="avatarOffsetXSlider" min="-20" max="20" value="${cust.avatarOffsetX}">
      </div>
      <div class="cust-field" data-subtab="effects">
        <label>إزاحة عمودية <span class="range-val" id="avatarOffsetYVal">${cust.avatarOffsetY}px</span></label>
        <input type="range" class="crop-slider" id="avatarOffsetYSlider" min="-20" max="20" value="${cust.avatarOffsetY}">
      </div>
      <div class="cust-field" data-subtab="effects">
        <label>الفلتر ${!canCustomizeShape(p)?'<span class="lock-hint">🔒 بلس</span>':''}</label>
        ${canCustomizeShape(p) ? `<div class="compact-chips">${Object.entries(AVATAR_FILTERS_EXTENDED).map(([k,f]) => `<button class="cchip ${cust.avatarFilter===k?'active':''}" data-cust="avatarFilter" data-val="${k}">${f.emoji} ${f.label}</button>`).join('')}</div>` : `<div class="locked-feature" data-action="upsell-plus">${ic('lock','sm')} بلس</div>`}
      </div>
      ${['solid','glow'].includes(cust.avatarBorder) && canCustomizeBorder(p) ? `
        <div class="cust-field" data-subtab="effects"><label>سماكة الحدود <span class="range-val" id="avatarBorderWidthVal">${cust.avatarBorderWidth}px</span></label><input type="range" class="crop-slider" id="avatarBorderWidthSlider" min="1" max="10" value="${cust.avatarBorderWidth}"></div>
        <div class="cust-field" data-subtab="effects"><label>لون الحدود</label><div class="color-strip">${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust.avatarBorderColor===c?'active':''}" style="background:${c}" data-cust="avatarBorderColor" data-val="${c}"></button>`).join('')}</div></div>
      ` : ''}
      <div class="cust-field" data-subtab="effects">
        <label>لون التوهج</label>
        <div class="color-strip">${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust.avatarGlowColor===c?'active':''}" style="background:${c}" data-cust="avatarGlowColor" data-val="${c}"></button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="effects">
        <label>شدة التوهج <span class="range-val" id="avatarGlowIntensityVal">${cust.avatarGlowIntensity}</span></label>
        <input type="range" class="crop-slider" id="avatarGlowIntensitySlider" min="0" max="100" value="${cust.avatarGlowIntensity}">
      </div>
      <div class="cust-field" data-subtab="effects">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="avatarBreathingChk" ${cust.avatarBreathing?'checked':''} style="width:auto">
          <span>تنفس (حركة مستمرة)</span>
        </label>
      </div>

      <!-- ═══ تبويب: الزخرفة ═══ -->
      <div class="cust-field" data-subtab="decoration">
        <label>الزخرفة</label>
        <div class="compact-chips">${Object.entries(AVATAR_DECORATIONS).map(([k,d]) => `<button class="cchip ${cust.avatarDecoration===k?'active':''}" data-cust="avatarDecoration" data-val="${k}">${d.emoji} ${d.label}</button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="decoration">
        <label>لون الزخرفة</label>
        <div class="color-strip">${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust.avatarDecorationColor===c?'active':''}" style="background:${c}" data-cust="avatarDecorationColor" data-val="${c}"></button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="decoration">
        <label>نمط الخلفية</label>
        <div class="compact-chips">${Object.entries(AVATAR_BG_PATTERNS).map(([k,b]) => `<button class="cchip ${cust.avatarBgPattern===k?'active':''}" data-cust="avatarBgPattern" data-val="${k}">${b.emoji} ${b.label}</button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="decoration">
        <label>لون الخلفية</label>
        <div class="color-strip">${NAME_COLOR_PRESETS.slice(0,16).map(c => `<button class="color-dot ${cust.avatarBgColor===c?'active':''}" style="background:${c}" data-cust="avatarBgColor" data-val="${c}"></button>`).join('')}</div>
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════
     ✏️ الاسم — 4 تبويبات: اللون / الخط / التأثير / الشارة
     ══════════════════════════════════════════════════════════ */
  if(zone === 'name'){
    return `
      <!-- ═══ تبويب: اللون ═══ -->
      <div class="cust-field" data-subtab="color">
        <label>اللون ${!canCustomizeNameColor(p)?'<span class="lock-hint">🔒 بلس</span>':''}</label>
        ${canCustomizeNameColor(p) ? `<div class="color-strip">${NAME_COLOR_PRESETS.map(c => `<button class="color-dot ${cust.nameColor===c?'active':''}" style="background:${c}" data-cust="nameColor" data-val="${c}"></button>`).join('')}</div>` : `<div class="locked-feature" data-action="upsell-plus">${ic('lock','sm')} بلس</div>`}
      </div>
      <div class="cust-field" data-subtab="color">
        <label>التدرج ${!canCustomizeNameColor(p)?'<span class="lock-hint">🔒 بلس</span>':''}</label>
        ${canCustomizeNameColor(p) ? `<div class="compact-chips">${Object.entries(NAME_GRADIENTS).map(([k,g]) => `<button class="cchip ${cust.nameGradient2===k?'active':''}" data-cust="nameGradient2" data-val="${k}">${g.emoji} ${g.label}</button>`).join('')}</div><div class="info-hint">⚠️ عند اختيار تدرج، يُطبَّق بدل اللون</div>` : ''}
      </div>
      <div class="cust-field" data-subtab="color">
        <label>لون الظل</label>
        <div class="color-strip">${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust.nameShadowColor===c?'active':''}" style="background:${c}" data-cust="nameShadowColor" data-val="${c}"></button>`).join('')}</div>
      </div>

      <!-- ═══ تبويب: الخط ═══ -->
      <div class="cust-field" data-subtab="font"><label>سماكة الخط</label><div class="compact-chips">${Object.entries(FONT_WEIGHTS).map(([k,w]) => `<button class="cchip ${cust.nameWeight===k?'active':''}" data-cust="nameWeight" data-val="${k}" style="font-weight:${w.value}">${w.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="font"><label>حجم الخط</label><div class="compact-chips">${[['sm','صغير'],['md','عادي'],['lg','كبير'],['xl','أكبر']].map(([v,l]) => `<button class="cchip ${cust.nameSize===v?'active':''}" data-cust="nameSize" data-val="${v}">${l}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="font"><label>الخط</label><div class="compact-chips">${Object.entries(TEXT_FONTS).map(([k,f]) => `<button class="cchip ${cust.nameFont===k?'active':''}" data-cust="nameFont" data-val="${k}" style="font-family:${f.value}">${f.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="font">
        <label>نمط الخط</label>
        <div class="compact-chips">${[['normal','عادي'],['italic','مائل'],['oblique','مائل 2']].map(([k,l]) => `<button class="cchip ${cust.nameFontStyle===k?'active':''}" data-cust="nameFontStyle" data-val="${k}">${l}</button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="font">
        <label>حالة الأحرف</label>
        <div class="compact-chips">${[['none','عادي'],['uppercase','كبير'],['lowercase','صغير'],['capitalize','أول حرف']].map(([k,l]) => `<button class="cchip ${cust.nameTransform===k?'active':''}" data-cust="nameTransform" data-val="${k}">${l}</button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="font">
        <label>تحت الخط</label>
        <div class="compact-chips">${[['none','بدون'],['single','خط'],['double','مزدوج'],['dotted','منقط'],['wavy','مموج']].map(([v,l]) => `<button class="cchip ${cust.nameUnderline===v?'active':''}" data-cust="nameUnderline" data-val="${v}">${l}</button>`).join('')}</div>
        ${cust.nameUnderline !== 'none' ? `<div class="color-strip" style="margin-top:6px">${NAME_COLOR_PRESETS.slice(0,16).map(c => `<button class="color-dot ${cust.nameUnderlineColor===c?'active':''}" style="background:${c}" data-cust="nameUnderlineColor" data-val="${c}"></button>`).join('')}</div>` : ''}
      </div>
      <div class="cust-field" data-subtab="font">
        <label>تباعد الحروف <span class="range-val" id="nameLetterSpacingVal">${cust.nameLetterSpacing}px</span></label>
        <input type="range" class="crop-slider" id="nameLetterSpacingSlider" min="-2" max="6" step="0.5" value="${cust.nameLetterSpacing}">
      </div>
      <div class="cust-field" data-subtab="font">
        <label>ارتفاع السطر <span class="range-val" id="nameLineHeightVal">${cust.nameLineHeight}</span></label>
        <input type="range" class="crop-slider" id="nameLineHeightSlider" min="1" max="2.5" step="0.1" value="${cust.nameLineHeight}">
      </div>

      <!-- ═══ تبويب: التأثير ═══ -->
      <div class="cust-field" data-subtab="effect">
        <label>التأثير ${!canCustomizeNameColor(p)?'<span class="lock-hint">🔒 بلس</span>':''}</label>
        ${canCustomizeNameColor(p) ? `<div class="compact-chips">${Object.entries(TEXT_EFFECTS).map(([k,e]) => `<button class="cchip ${cust.nameEffect===k?'active':''}" data-cust="nameEffect" data-val="${k}">${e.emoji} ${e.label}</button>`).join('')}</div>` : ''}
      </div>
      <div class="cust-field" data-subtab="effect">
        <label>الحركة ${!canCustomizeNameColor(p)?'<span class="lock-hint">🔒 بلس</span>':''}</label>
        ${canCustomizeNameColor(p) ? `<div class="compact-chips">${Object.entries(NAME_ANIMATIONS).map(([k,a]) => `<button class="cchip ${cust.nameAnimation===k?'active':''}" data-cust="nameAnimation" data-val="${k}">${a.emoji} ${a.label}</button>`).join('')}</div>` : ''}
      </div>

      <!-- ═══ تبويب: الشارة ═══ -->
      <div class="cust-field" data-subtab="badge">
        <label>الشارة ${!canCustomizeTitleColor(p)?'<span class="lock-hint">🔒 بلس دبل</span>':''}</label>
        ${canCustomizeTitleColor(p) ? `<div class="badge-picker-row">${Object.entries(NAME_BADGES).map(([k,b]) => `<button class="badge-btn ${cust.nameBadge===k?'active':''}" data-cust="nameBadge" data-val="${k}">${k==='none'?ic('close','xs'):b.emoji}</button>`).join('')}</div>` : `<div class="locked-feature" data-action="upsell-plus2">${ic('lock','sm')} بلس دبل</div>`}
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════
     @ اسم المستخدم — 3 تبويبات: اللون / الخط / التأثير
     ══════════════════════════════════════════════════════════ */
  if(zone === 'username'){
    return `
      <!-- ═══ تبويب: اللون ═══ -->
      <div class="cust-field" data-subtab="color">
        <label>اللون ${!canCustomizeUsernameColor(p)?'<span class="lock-hint">🔒 بلس</span>':''}</label>
        ${canCustomizeUsernameColor(p) ? `<div class="color-strip">${NAME_COLOR_PRESETS.map(c => `<button class="color-dot ${cust.usernameColor===c?'active':''}" style="background:${c}" data-cust="usernameColor" data-val="${c}"></button>`).join('')}</div>` : `<div class="locked-feature" data-action="upsell-plus">${ic('lock','sm')} بلس</div>`}
      </div>
      <div class="cust-field" data-subtab="color">
        <label>التدرج</label>
        <div class="compact-chips">${Object.entries(NAME_GRADIENTS).map(([k,g]) => `<button class="cchip ${cust.usernameGradient===k?'active':''}" data-cust="usernameGradient" data-val="${k}">${g.emoji} ${g.label}</button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="color">
        <label>الشفافية <span class="range-val" id="usernameOpacityVal">${cust.usernameOpacity}%</span></label>
        <input type="range" class="crop-slider" id="usernameOpacitySlider" min="20" max="100" value="${cust.usernameOpacity}">
      </div>

      <!-- ═══ تبويب: الخط ═══ -->
      <div class="cust-field" data-subtab="font"><label>السماكة</label><div class="compact-chips">${Object.entries(FONT_WEIGHTS).map(([k,w]) => `<button class="cchip ${cust.usernameWeight===k?'active':''}" data-cust="usernameWeight" data-val="${k}" style="font-weight:${w.value}">${w.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="font"><label>الحجم</label><div class="compact-chips">${[['sm','صغير'],['md','عادي'],['lg','كبير'],['xl','أكبر']].map(([v,l]) => `<button class="cchip ${cust.usernameSize===v?'active':''}" data-cust="usernameSize" data-val="${v}">${l}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="font"><label>الخط</label><div class="compact-chips">${Object.entries(TEXT_FONTS).map(([k,f]) => `<button class="cchip ${cust.usernameFont===k?'active':''}" data-cust="usernameFont" data-val="${k}" style="font-family:${f.value}">${f.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="font">
        <label>تباعد الحروف <span class="range-val" id="usernameLetterSpacingVal">${cust.usernameLetterSpacing}px</span></label>
        <input type="range" class="crop-slider" id="usernameLetterSpacingSlider" min="-1" max="5" step="0.5" value="${cust.usernameLetterSpacing}">
      </div>
      <div class="cust-field" data-subtab="font">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="usernameShowAtChk" ${cust.usernameShowAt?'checked':''} style="width:auto">
          <span>إظهار علامة @ قبل الاسم</span>
        </label>
      </div>
      <div class="cust-field" data-subtab="font">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="usernameItalicChk" ${cust.usernameItalic?'checked':''} style="width:auto">
          <span>مائل</span>
        </label>
      </div>

      <!-- ═══ تبويب: التأثير ═══ -->
      <div class="cust-field" data-subtab="effect"><label>التأثير</label><div class="compact-chips">${Object.entries(TEXT_EFFECTS).map(([k,e]) => `<button class="cchip ${cust.usernameEffect===k?'active':''}" data-cust="usernameEffect" data-val="${k}">${e.emoji} ${e.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="effect"><label>الحركة</label><div class="compact-chips">${Object.entries(NAME_ANIMATIONS).map(([k,a]) => `<button class="cchip ${cust.usernameAnimation===k?'active':''}" data-cust="usernameAnimation" data-val="${k}">${a.emoji} ${a.label}</button>`).join('')}</div></div>
    `;
  }

  /* ══════════════════════════════════════════════════════════
     📝 النبذة — 4 تبويبات: النمط / اللون / التنسيق / الأيقونة
     ══════════════════════════════════════════════════════════ */
  if(zone === 'bio'){
    return `
      <!-- ═══ تبويب: النمط ═══ -->
      <div class="cust-field" data-subtab="style">
        <label>النمط</label>
        <div class="compact-chips">${Object.entries(BIO_STYLES_EXTENDED).map(([k,b]) => `<button class="cchip ${cust.bioStyle===k?'active':''}" data-cust="bioStyle" data-val="${k}">${b.emoji} ${b.label}</button>`).join('')}</div>
      </div>

      <!-- ═══ تبويب: اللون ═══ -->
      <div class="cust-field" data-subtab="color">
        <label>لون النص</label>
        <div class="color-strip">${NAME_COLOR_PRESETS.slice(0,30).map(c => `<button class="color-dot ${cust.bioColor===c?'active':''}" style="background:${c}" data-cust="bioColor" data-val="${c}"></button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="color">
        <label>تدرج النص</label>
        <div class="compact-chips">${Object.entries(NAME_GRADIENTS).map(([k,g]) => `<button class="cchip ${cust.bioGradient===k?'active':''}" data-cust="bioGradient" data-val="${k}">${g.emoji} ${g.label}</button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="color">
        <label>تأثير النص</label>
        <div class="compact-chips">${Object.entries(TEXT_EFFECTS).map(([k,e]) => `<button class="cchip ${cust.bioEffect===k?'active':''}" data-cust="bioEffect" data-val="${k}">${e.emoji} ${e.label}</button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="color">
        <label>لون الحدود</label>
        <div class="color-strip">${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust.bioBorderColor===c?'active':''}" style="background:${c}" data-cust="bioBorderColor" data-val="${c}"></button>`).join('')}</div>
      </div>

      <!-- ═══ تبويب: التنسيق ═══ -->
      <div class="cust-field" data-subtab="layout"><label>الحجم</label><div class="compact-chips">${[['sm','صغير'],['md','عادي'],['lg','كبير'],['xl','أكبر']].map(([v,l]) => `<button class="cchip ${cust.bioFontSize===v?'active':''}" data-cust="bioFontSize" data-val="${v}">${l}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="layout"><label>السماكة</label><div class="compact-chips">${Object.entries(FONT_WEIGHTS).map(([k,w]) => `<button class="cchip ${cust.bioFontWeight===k?'active':''}" data-cust="bioFontWeight" data-val="${k}" style="font-weight:${w.value}">${w.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="layout"><label>الخط</label><div class="compact-chips">${Object.entries(TEXT_FONTS).map(([k,f]) => `<button class="cchip ${cust.bioFontFamily===k?'active':''}" data-cust="bioFontFamily" data-val="${k}" style="font-family:${f.value}">${f.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="layout"><label>المحاذاة</label><div class="compact-chips">${[['right','يمين'],['center','وسط'],['left','يسار']].map(([v,l]) => `<button class="cchip ${cust.bioAlign===v?'active':''}" data-cust="bioAlign" data-val="${v}">${l}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="layout">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="bioItalicChk" ${cust.bioItalic?'checked':''} style="width:auto">
          <span>مائل</span>
        </label>
      </div>
      <div class="cust-field" data-subtab="layout">
        <label>لون الخلفية</label>
        <div class="color-strip">${NAME_COLOR_PRESETS.slice(0,16).map(c => `<button class="color-dot ${cust.bioBg===c?'active':''}" style="background:${c}" data-cust="bioBg" data-val="${c}"></button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="layout">
        <label>شفافية الخلفية <span class="range-val" id="bioBgOpacityVal">${cust.bioBgOpacity}%</span></label>
        <input type="range" class="crop-slider" id="bioBgOpacitySlider" min="0" max="100" value="${cust.bioBgOpacity}">
      </div>
      <div class="cust-field" data-subtab="layout">
        <label>سماكة الإطار <span class="range-val" id="bioBorderWidthVal">${cust.bioBorderWidth}px</span></label>
        <input type="range" class="crop-slider" id="bioBorderWidthSlider" min="0" max="10" value="${cust.bioBorderWidth}">
      </div>
      <div class="cust-field" data-subtab="layout">
        <label>ارتفاع السطر <span class="range-val" id="bioLineHeightVal">${cust.bioLineHeight}</span></label>
        <input type="range" class="crop-slider" id="bioLineHeightSlider" min="1.2" max="2.5" step="0.1" value="${cust.bioLineHeight}">
      </div>
      <div class="cust-field" data-subtab="layout">
        <label>تباعد الحروف <span class="range-val" id="bioLetterSpacingVal">${cust.bioLetterSpacing}px</span></label>
        <input type="range" class="crop-slider" id="bioLetterSpacingSlider" min="-1" max="4" step="0.5" value="${cust.bioLetterSpacing}">
      </div>
      <div class="cust-field" data-subtab="layout">
        <label>العرض الأقصى <span class="range-val" id="bioMaxWidthVal">${cust.bioMaxWidth}%</span></label>
        <input type="range" class="crop-slider" id="bioMaxWidthSlider" min="50" max="100" value="${cust.bioMaxWidth}">
      </div>

      <!-- ═══ تبويب: الأيقونة ═══ -->
      <div class="cust-field" data-subtab="icon">
        <label>أيقونة قبل النبذة</label>
        <div class="compact-chips">${['','💫','✨','🔥','💎','⭐','🎯','📌','💡','🚀','⚡','🎨','🌈','💜'].map(e => `<button class="cchip ${cust.bioIcon===e?'active':''}" data-cust="bioIcon" data-val="${e}">${e || 'بدون'}</button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="icon">
        <label>لون الأيقونة</label>
        <div class="color-strip">${NAME_COLOR_PRESETS.slice(0,16).map(c => `<button class="color-dot ${cust.bioIconColor===c?'active':''}" style="background:${c}" data-cust="bioIconColor" data-val="${c}"></button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="icon">
        <label>نص النبذة</label>
        <button class="btn btn-ghost btn-sm" style="width:100%" data-action="edit-profile">${ic('edit','xs')} فتح محرر النبذة</button>
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════
     🎨 الثيم — 4 تبويبات: الثيم / التخطيط / اللون المميز / الموسيقى
     ══════════════════════════════════════════════════════════ */
  if(zone === 'body'){
    return `
      <!-- ═══ تبويب: الثيم ═══ -->
      <div class="cust-field" data-subtab="theme">
        <label>الثيم ${!canCustomizeTheme(p)?'<span class="lock-hint">🔒 بلس</span>':''}</label>
        ${canCustomizeTheme(p) ? `<div class="theme-picker-row">${Object.entries(THEMES_EXTENDED).map(([k,t]) => `<button class="theme-btn ${themeId===k?'active':''}" data-set-theme="${k}"><div class="theme-swatch" style="background:linear-gradient(${cust.themeGradientAngle}deg,${t.colors[0]},${t.colors[1]})"></div><div class="theme-btn-name">${t.name}</div></button>`).join('')}</div>` : `<div class="locked-feature" data-action="upsell-plus">${ic('lock','sm')} بلس</div>`}
      </div>
      <div class="cust-field" data-subtab="theme"><label>زاوية التدرج <span class="range-val" id="themeAngleVal">${cust.themeGradientAngle}°</span></label><input type="range" class="crop-slider" id="themeGradientAngleSlider" min="0" max="360" step="15" value="${cust.themeGradientAngle}"></div>
      <div class="cust-field" data-subtab="theme"><label>شفافية الثيم <span class="range-val" id="themeOpacityVal">${cust.themeOpacity}%</span></label><input type="range" class="crop-slider" id="themeOpacitySlider" min="0" max="100" value="${cust.themeOpacity}"></div>
      <div class="cust-field" data-subtab="theme">
        <label>درجة اللون <span class="range-val" id="themeHueVal">${cust.themeHue}°</span></label>
        <input type="range" class="crop-slider" id="themeHueSlider" min="-180" max="180" value="${cust.themeHue}">
      </div>
      <div class="cust-field" data-subtab="theme">
        <label>التشبع <span class="range-val" id="themeSaturationVal">${cust.themeSaturation}%</span></label>
        <input type="range" class="crop-slider" id="themeSaturationSlider" min="30" max="200" value="${cust.themeSaturation}">
      </div>
      <div class="cust-field" data-subtab="theme">
        <label>السطوع <span class="range-val" id="themeBrightnessVal">${cust.themeBrightness}%</span></label>
        <input type="range" class="crop-slider" id="themeBrightnessSlider" min="30" max="180" value="${cust.themeBrightness}">
      </div>
      <div class="cust-field" data-subtab="theme">
        <label>الضبابية <span class="range-val" id="themeBlurVal">${cust.themeBlur}px</span></label>
        <input type="range" class="crop-slider" id="themeBlurSlider" min="0" max="20" value="${cust.themeBlur}">
      </div>
      <div class="cust-field" data-subtab="theme"><label>نمط الثيم</label><div class="compact-chips">${Object.entries(BG_PATTERNS).map(([k,b]) => `<button class="cchip ${cust.themePattern===k?'active':''}" data-cust="themePattern" data-val="${k}">${b.emoji} ${b.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="theme"><label>توهج الثيم</label><div class="compact-chips">${Object.entries(CARD_GLOWS).map(([k,g]) => `<button class="cchip ${cust.themeGlow===k?'active':''}" data-cust="themeGlow" data-val="${k}">${g.emoji} ${g.label}</button>`).join('')}</div></div>

      <!-- ═══ تبويب: التخطيط ═══ -->
      <div class="cust-field" data-subtab="layout">
        <label>التخطيط ${!canUseLayoutCustomization(p)?'<span class="lock-hint">🔒 بلس دبل</span>':''}</label>
        ${canUseLayoutCustomization(p) ? `<div class="compact-chips">${Object.entries(PROFILE_LAYOUTS_EXTENDED).map(([k,l]) => `<button class="cchip ${cust.profileLayout===k?'active':''}" data-cust="profileLayout" data-val="${k}">${l.label}</button>`).join('')}</div>` : `<div class="locked-feature" data-action="upsell-plus2">${ic('lock','sm')} بلس دبل</div>`}
      </div>

      <!-- ═══ تبويب: اللون المميز ═══ -->
      <div class="cust-field" data-subtab="accent">
        <label>اللون المميز ${sub.features.maxCustomColors===0?'<span class="lock-hint">🔒 بلس</span>':''}</label>
        ${sub.features.maxCustomColors > 0 ? `<div class="info-hint">💡 اللون المميز = لون الأزرار والحدود والتفاصيل</div><div class="color-strip" style="margin-top:6px">${ACCENT_COLORS_EXTENDED.map(c => `<button class="color-dot ${cust.accentColor===c?'active':''}" style="background:${c}" data-cust="accentColor" data-val="${c}"></button>`).join('')}</div>` : `<div class="locked-feature" data-action="upsell-plus">${ic('lock','sm')} بلس</div>`}
      </div>
      <div class="cust-field" data-subtab="accent">
        <label>اللون المميز الثاني (للتدرج)</label>
        <div class="color-strip">
          <button class="color-dot ${!cust.accentColor2?'active':''}"
                  style="background:repeating-linear-gradient(45deg,#333 0 4px,#222 4px 8px)"
                  data-cust="accentColor2" data-val="" title="بدون"></button>
          ${ACCENT_COLORS_EXTENDED.map(c => `<button class="color-dot ${cust.accentColor2===c?'active':''}" style="background:${c}" data-cust="accentColor2" data-val="${c}"></button>`).join('')}
        </div>
      </div>

      <!-- ═══ تبويب: الموسيقى ═══ -->
      <div class="cust-field" data-subtab="music">
        <label>موسيقى الملف ${!canUseMusic(p)?'<span class="lock-hint">🔒 بلس</span>':''}</label>
        ${canUseMusic(p) ? `<input class="input" id="musicUrlInput" value="${esc(cust.musicUrl)}" placeholder="https://..." maxlength="200" style="margin-bottom:8px"><button class="btn btn-primary btn-sm" style="width:100%" id="saveMusicBtn">${ic('check','xs')} حفظ</button>` : `<div class="locked-feature" data-action="upsell-plus">${ic('lock','sm')} بلس</div>`}
      </div>
      <div class="cust-field" data-subtab="music">
        <label>مستوى الصوت <span class="range-val" id="musicVolumeVal">${cust.musicVolume}%</span></label>
        <input type="range" class="crop-slider" id="musicVolumeSlider" min="0" max="100" value="${cust.musicVolume}">
      </div>
      <div class="cust-field" data-subtab="music">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="musicAutoplayChk" ${cust.musicAutoplay?'checked':''} style="width:auto">
          <span>تشغيل تلقائي</span>
        </label>
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════
     🃏 البطاقة — 4 تبويبات: الحدود / الظل والتوهج / التأثيرات / الخلفية
     ══════════════════════════════════════════════════════════ */
  if(zone === 'card'){
    return `
      <!-- ═══ تبويب: الحدود ═══ -->
      <div class="cust-field" data-subtab="border"><label>لون الحدود</label><div class="color-strip">${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust.cardBorderColor===c?'active':''}" style="background:${c}" data-cust="cardBorderColor" data-val="${c}"></button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="border"><label>سماكة الحدود <span class="range-val" id="cardBorderWidthVal">${cust.cardBorderWidth}px</span></label><input type="range" class="crop-slider" id="cardBorderWidthSlider" min="0" max="6" value="${cust.cardBorderWidth}"></div>
      <div class="cust-field" data-subtab="border"><label>نمط الحدود</label><div class="compact-chips">${Object.entries(CARD_BORDER_STYLES).map(([k,s]) => `<button class="cchip ${cust.cardBorderStyle===k?'active':''}" data-cust="cardBorderStyle" data-val="${k}">${s.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="border"><label>الزوايا</label><div class="compact-chips">${Object.entries(CARD_CORNERS).map(([k,c]) => `<button class="cchip ${cust.cardCorner===k?'active':''}" data-cust="cardCorner" data-val="${k}">${c.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="border">
        <label>الحشوة الداخلية <span class="range-val" id="cardPaddingVal">${cust.cardPadding}px</span></label>
        <input type="range" class="crop-slider" id="cardPaddingSlider" min="0" max="30" value="${cust.cardPadding}">
      </div>
      <div class="cust-field" data-subtab="border">
        <label>التدوير <span class="range-val" id="cardRotateVal">${cust.cardRotate}°</span></label>
        <input type="range" class="crop-slider" id="cardRotateSlider" min="-15" max="15" value="${cust.cardRotate}">
      </div>

      <!-- ═══ تبويب: الظل والتوهج ═══ -->
      <div class="cust-field" data-subtab="shadow"><label>توهج البطاقة</label><div class="compact-chips">${Object.entries(CARD_GLOWS).map(([k,g]) => `<button class="cchip ${cust.cardGlow===k?'active':''}" data-cust="cardGlow" data-val="${k}">${g.emoji} ${g.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="shadow"><label>الظل</label><div class="compact-chips">${Object.entries(CARD_SHADOWS).map(([k,s]) => `<button class="cchip ${cust.cardShadow===k?'active':''}" data-cust="cardShadow" data-val="${k}">${s.emoji} ${s.label}</button>`).join('')}</div></div>

      <!-- ═══ تبويب: التأثيرات ═══ -->
      <div class="cust-field" data-subtab="effect"><label>تأثير التمرير</label><div class="compact-chips">${Object.entries(CARD_HOVER_EFFECTS).map(([k,h]) => `<button class="cchip ${cust.cardHoverEffect===k?'active':''}" data-cust="cardHoverEffect" data-val="${k}">${h.emoji} ${h.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="effect"><label>تأثير الدخول</label><div class="compact-chips">${Object.entries(ENTRANCE_ANIMATIONS).map(([k,e]) => `<button class="cchip ${cust.cardEntrance===k?'active':''}" data-cust="cardEntrance" data-val="${k}">${e.emoji} ${e.label}</button>`).join('')}</div></div>

      <!-- ═══ تبويب: الخلفية ═══ -->
      <div class="cust-field" data-subtab="pattern"><label>شفافية البطاقة <span class="range-val" id="cardOpacityVal">${cust.cardOpacity}%</span></label><input type="range" class="crop-slider" id="cardOpacitySlider" min="30" max="100" value="${cust.cardOpacity}"></div>
      <div class="cust-field" data-subtab="pattern"><label>ضبابية الخلفية <span class="range-val" id="cardBlurVal">${cust.cardBackdropBlur}px</span></label><input type="range" class="crop-slider" id="cardBackdropBlurSlider" min="0" max="30" value="${cust.cardBackdropBlur}"></div>
      <div class="cust-field" data-subtab="pattern"><label>نمط الخلفية</label><div class="compact-chips">${Object.entries(BG_PATTERNS).map(([k,b]) => `<button class="cchip ${cust.bgPattern===k?'active':''}" data-cust="bgPattern" data-val="${k}">${b.emoji} ${b.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="pattern">
        <label>وضع الدمج</label>
        <div class="compact-chips">${[['normal','عادي'],['multiply','ضرب'],['screen','شاشة'],['overlay','تراكب'],['soft-light','خفيف']].map(([k,l]) => `<button class="cchip ${cust.cardBlendMode===k?'active':''}" data-cust="cardBlendMode" data-val="${k}">${l}</button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="pattern">
        <label>العرض الأقصى <span class="range-val" id="cardMaxWidthVal">${cust.cardMaxWidth}%</span></label>
        <input type="range" class="crop-slider" id="cardMaxWidthSlider" min="60" max="100" value="${cust.cardMaxWidth}">
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════
     🏅 المستوى — 3 تبويبات: الشارة / الشريط / النص
     ══════════════════════════════════════════════════════════ */
  if(zone === 'level'){
    return `
      <!-- ═══ تبويب: الشارة ═══ -->
      <div class="cust-field" data-subtab="badge"><label>شكل الشارة</label><div class="compact-chips">${Object.entries(LEVEL_BADGE_SHAPES).map(([k,s]) => `<button class="cchip ${cust.levelBadgeShape===k?'active':''}" data-cust="levelBadgeShape" data-val="${k}">${s.emoji} ${s.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="badge"><label>اللون الأول للشارة</label><div class="color-strip">${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust.levelBadgeColor1===c?'active':''}" style="background:${c}" data-cust="levelBadgeColor1" data-val="${c}"></button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="badge"><label>اللون الثاني للشارة</label><div class="color-strip">${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust.levelBadgeColor2===c?'active':''}" style="background:${c}" data-cust="levelBadgeColor2" data-val="${c}"></button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="badge"><label>أيقونة قبل الرقم</label><div class="compact-chips">${['','🏅','⭐','💎','👑','🎖️','🔥','⚡','🌟'].map(e => `<button class="cchip ${cust.levelIcon===e?'active':''}" data-cust="levelIcon" data-val="${e}">${e || 'بدون'}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="badge">
        <label>حجم الشارة</label>
        <div class="compact-chips">${[['sm','صغيرة'],['md','عادية'],['lg','كبيرة'],['xl','ضخمة']].map(([k,l]) => `<button class="cchip ${cust.levelBadgeSize===k?'active':''}" data-cust="levelBadgeSize" data-val="${k}">${l}</button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="badge">
        <label>موضع الشارة</label>
        <div class="compact-chips">${[['left','يسار'],['right','يمين']].map(([k,l]) => `<button class="cchip ${cust.levelBadgePosition===k?'active':''}" data-cust="levelBadgePosition" data-val="${k}">${l}</button>`).join('')}</div>
      </div>

      <!-- ═══ تبويب: الشريط ═══ -->
      <div class="cust-field" data-subtab="bar"><label>نمط شريط XP</label><div class="compact-chips">${Object.entries(LEVEL_BAR_STYLES).map(([k,s]) => `<button class="cchip ${cust.levelBarStyle===k?'active':''}" data-cust="levelBarStyle" data-val="${k}">${s.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="bar"><label>اللون الأول للشريط</label><div class="color-strip">${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust.levelBarColor1===c?'active':''}" style="background:${c}" data-cust="levelBarColor1" data-val="${c}"></button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="bar"><label>اللون الثاني للشريط</label><div class="color-strip">${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust.levelBarColor2===c?'active':''}" style="background:${c}" data-cust="levelBarColor2" data-val="${c}"></button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="bar">
        <label>لون الشريط (بسيط — يتجاوز التدرج)</label>
        <div class="color-strip">
          <button class="color-dot ${!cust.levelBarColor?'active':''}"
                  style="background:repeating-linear-gradient(45deg,#333 0 4px,#222 4px 8px)"
                  data-cust="levelBarColor" data-val="" title="بدون (استخدام التدرج)"></button>
          ${NAME_COLOR_PRESETS.slice(0,16).map(c => `<button class="color-dot ${cust.levelBarColor===c?'active':''}" style="background:${c}" data-cust="levelBarColor" data-val="${c}"></button>`).join('')}
        </div>
        <div class="info-hint">💡 اختر "بدون" لاستخدام التدرج، أو لوناً واحداً لاستخدامه مباشرة</div>
      </div>
      <div class="cust-field" data-subtab="bar">
        <label>سماكة الشريط <span class="range-val" id="levelBarHeightVal">${cust.levelBarHeight}px</span></label>
        <input type="range" class="crop-slider" id="levelBarHeightSlider" min="3" max="20" value="${cust.levelBarHeight}">
      </div>
      <div class="cust-field" data-subtab="bar">
        <label>سرعة الحركة <span class="range-val" id="levelBarSpeedVal">${cust.levelBarSpeed}s</span></label>
        <input type="range" class="crop-slider" id="levelBarSpeedSlider" min="0.5" max="6" step="0.5" value="${cust.levelBarSpeed}">
      </div>

      <!-- ═══ تبويب: النص ═══ -->
      <div class="cust-field" data-subtab="label"><label>نص "المستوى"</label><input class="input" id="levelLabelTextInput" value="${esc(cust.levelLabelText)}" maxlength="20" placeholder="المستوى"></div>
      <div class="cust-field" data-subtab="label">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="levelShowLabelChk" ${cust.levelShowLabel?'checked':''} style="width:auto">
          <span>إظهار كلمة "المستوى"</span>
        </label>
      </div>
      <div class="cust-field" data-subtab="label">
        <label>حجم النص</label>
        <div class="compact-chips">${[['sm','صغير'],['md','عادي'],['lg','كبير'],['xl','أكبر']].map(([k,l]) => `<button class="cchip ${cust.levelTextSize===k?'active':''}" data-cust="levelTextSize" data-val="${k}">${l}</button>`).join('')}</div>
      </div>
      <div class="cust-field" data-subtab="label">
        <label>لون النص</label>
        <div class="color-strip">${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust.levelTextColor===c?'active':''}" style="background:${c}" data-cust="levelTextColor" data-val="${c}"></button>`).join('')}</div>
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════
     🔤 النصوص — 2 تبويبات: الألوان / الخطوط
     ══════════════════════════════════════════════════════════ */
  if(zone === 'texts'){
    return `
      <!-- ═══ تبويب: الألوان ═══ -->
      <div class="info-hint" style="margin-bottom:12px" data-subtab="colors">💡 تحكم بألوان كل نص في بطاقتك</div>
      ${[['joinDateColor','تاريخ الانضمام'],['followersBtnColor','أزرار المتابعين'],['locationColor','الموقع'],['levelTextColor','نص المستوى'],['teamTextColor','اسم الفريق'],['statusTextColor','رسالة الحالة'],['pronounsTextColor','الضمائر']].map(([field,label]) => `
        <div class="cust-field" data-subtab="colors">
          <label>${label}</label>
          <div class="color-strip">${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust[field]===c?'active':''}" style="background:${c}" data-cust="${field}" data-val="${c}"></button>`).join('')}</div>
        </div>
      `).join('')}
      <div class="cust-field" data-subtab="colors">
        <label>خلفية أزرار المتابعين</label>
        <div class="color-strip">
          <button class="color-dot ${cust.followersBtnBg==='transparent'?'active':''}"
                  style="background:repeating-linear-gradient(45deg,#333 0 4px,#222 4px 8px)"
                  data-cust="followersBtnBg" data-val="transparent" title="شفاف"></button>
          ${NAME_COLOR_PRESETS.slice(0,20).map(c => `<button class="color-dot ${cust.followersBtnBg===c?'active':''}" style="background:${c}" data-cust="followersBtnBg" data-val="${c}"></button>`).join('')}
        </div>
      </div>
      <div class="cust-field" data-subtab="colors">
        <label>لون ظل النصوص</label>
        <div class="color-strip">
          <button class="color-dot ${cust.textShadowColor==='transparent'?'active':''}"
                  style="background:repeating-linear-gradient(45deg,#333 0 4px,#222 4px 8px)"
                  data-cust="textShadowColor" data-val="transparent" title="بدون"></button>
          ${NAME_COLOR_PRESETS.slice(0,16).map(c => `<button class="color-dot ${cust.textShadowColor===c?'active':''}" style="background:${c}" data-cust="textShadowColor" data-val="${c}"></button>`).join('')}
        </div>
      </div>
      <div class="cust-field" data-subtab="colors">
        <label>شدة الظل <span class="range-val" id="textShadowBlurVal">${cust.textShadowBlur}px</span></label>
        <input type="range" class="crop-slider" id="textShadowBlurSlider" min="0" max="15" value="${cust.textShadowBlur}">
      </div>

      <!-- ═══ تبويب: الخطوط ═══ -->
      <div class="cust-field" data-subtab="fonts"><label>الخط العام</label><div class="compact-chips">${Object.entries(TEXT_FONTS).map(([k,f]) => `<button class="cchip ${cust.globalFont===k?'active':''}" data-cust="globalFont" data-val="${k}" style="font-family:${f.value}">${f.label}</button>`).join('')}</div></div>
      <div class="cust-field" data-subtab="fonts">
        <label>تباعد الحروف <span class="range-val" id="textLetterSpacingVal">${cust.textLetterSpacing}px</span></label>
        <input type="range" class="crop-slider" id="textLetterSpacingSlider" min="-1" max="4" step="0.5" value="${cust.textLetterSpacing}">
      </div>
      <div class="cust-field" data-subtab="fonts">
        <label>حالة الأحرف</label>
        <div class="compact-chips">${[['none','عادي'],['uppercase','كبير'],['lowercase','صغير']].map(([k,l]) => `<button class="cchip ${cust.textTransform===k?'active':''}" data-cust="textTransform" data-val="${k}">${l}</button>`).join('')}</div>
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════
     ✨ التأثيرات — 2 تبويبات: التأثيرات / المؤشر
     ══════════════════════════════════════════════════════════ */
  if(zone === 'effects'){
    return `
      <!-- ═══ تبويب: التأثيرات ═══ -->
      <div class="cust-field" data-subtab="visual">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="showParticlesChk" ${cust.showParticles?'checked':''} style="width:auto">
          <span>جزيئات متحركة حول البطاقة</span>
        </label>
      </div>
      ${cust.showParticles ? `
        <div class="cust-field" data-subtab="visual">
          <label>لون الجزيئات</label>
          <div class="color-strip">${NAME_COLOR_PRESETS.slice(0,16).map(c => `<button class="color-dot ${cust.particleColor===c?'active':''}" style="background:${c}" data-cust="particleColor" data-val="${c}"></button>`).join('')}</div>
        </div>
        <div class="cust-field" data-subtab="visual">
          <label>عدد الجزيئات <span class="range-val" id="particleCountVal">${cust.particleCount}</span></label>
          <input type="range" class="crop-slider" id="particleCountSlider" min="5" max="40" value="${cust.particleCount}">
        </div>
        <div class="cust-field" data-subtab="visual">
          <label>سرعة الجزيئات <span class="range-val" id="particleSpeedVal">${cust.particleSpeed}s</span></label>
          <input type="range" class="crop-slider" id="particleSpeedSlider" min="1" max="15" value="${cust.particleSpeed}">
        </div>
      ` : ''}
      <div class="cust-field" data-subtab="visual">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="showSparklesChk" ${cust.showSparkles?'checked':''} style="width:auto">
          <span>بريق متلألئ</span>
        </label>
      </div>
      ${cust.showSparkles ? `
        <div class="cust-field" data-subtab="visual">
          <label>لون البريق</label>
          <div class="color-strip">${NAME_COLOR_PRESETS.slice(0,16).map(c => `<button class="color-dot ${cust.sparkleColor===c?'active':''}" style="background:${c}" data-cust="sparkleColor" data-val="${c}"></button>`).join('')}</div>
        </div>
        <div class="cust-field" data-subtab="visual">
          <label>عدد البريق <span class="range-val" id="sparkleCountVal">${cust.sparkleCount}</span></label>
          <input type="range" class="crop-slider" id="sparkleCountSlider" min="3" max="20" value="${cust.sparkleCount}">
        </div>
      ` : ''}
      <div class="cust-field" data-subtab="visual">
        <label>حواف مظللة <span class="range-val" id="bgVignetteVal">${cust.bgVignette}%</span></label>
        <input type="range" class="crop-slider" id="bgVignetteSlider" min="0" max="100" value="${cust.bgVignette}">
      </div>

      <!-- ═══ تبويب: المؤشر ═══ -->
      <div class="cust-field" data-subtab="cursor">
        <label>شكل المؤشر</label>
        <div class="compact-chips">${[['default','عادي'],['pointer','يد'],['crosshair','صليب'],['cell','مربع'],['help','مساعدة']].map(([v,l]) => `<button class="cchip ${cust.customCursor===v?'active':''}" data-cust="customCursor" data-val="${v}">${l}</button>`).join('')}</div>
      </div>
    `;
  }

  return '';
}

/* ============================================================
   🎨 استوديو التخصيص — البنية الجديدة
   ============================================================ */

const ZONE_ICONS = {
  cover:'🖼️', avatar:'👤', name:'✏️', username:'@',
  bio:'📝', body:'🎨', card:'🃏', level:'🏅',
  texts:'🔤', effects:'✨',
  signatures:'✍️',           // ★ جديد
  posts:'📰',                // ★ جديد
};
function getZoneIcon(zone){ return ZONE_ICONS[zone] || '🎨'; }

const ZONE_SUBTABS = {
  cover: [
    { id:'image',  label:'الصورة',   icon:'🖼️' },
    { id:'style',  label:'النمط',    icon:'🎭' },
    { id:'effect', label:'التأثير',  icon:'✨' },
  ],
  avatar: [
    { id:'shape',      label:'الشكل',      icon:'⬜' },
    { id:'frame',      label:'الإطار',     icon:'🖼️' },
    { id:'effects',    label:'التأثيرات',  icon:'✨' },
    { id:'decoration', label:'الزخرفة',    icon:'👑' },
  ],
  name: [
    { id:'color',  label:'اللون',    icon:'🎨' },
    { id:'font',   label:'الخط',     icon:'🔤' },
    { id:'effect', label:'التأثير',  icon:'✨' },
    { id:'badge',  label:'الشارة',   icon:'👑' },
  ],
  username: [
    { id:'color',  label:'اللون',    icon:'🎨' },
    { id:'font',   label:'الخط',     icon:'🔤' },
    { id:'effect', label:'التأثير',  icon:'✨' },
  ],
  bio: [
    { id:'style',  label:'النمط',     icon:'📝' },
    { id:'color',  label:'اللون',     icon:'🎨' },
    { id:'layout', label:'التنسيق',   icon:'📐' },
    { id:'icon',   label:'الأيقونة',  icon:'💫' },
  ],
  body: [
    { id:'theme',  label:'الثيم',         icon:'🎨' },
    { id:'layout', label:'التخطيط',       icon:'📐' },
    { id:'accent', label:'اللون المميز',  icon:'🌟' },
    { id:'music',  label:'الموسيقى',      icon:'🎵' },
  ],
  card: [
    { id:'border',  label:'الحدود',       icon:'⬜' },
    { id:'shadow',  label:'الظل والتوهج', icon:'🌟' },
    { id:'effect',  label:'التأثيرات',    icon:'✨' },
    { id:'pattern', label:'الخلفية',      icon:'🎨' },
  ],
  level: [
    { id:'badge', label:'الشارة', icon:'🏅' },
    { id:'bar',   label:'الشريط', icon:'📊' },
    { id:'label', label:'النص',   icon:'📝' },
  ],
  texts: [
    { id:'colors', label:'الألوان', icon:'🎨' },
    { id:'fonts',  label:'الخطوط',  icon:'🔤' },
  ],
  effects: [
    { id:'visual', label:'التأثيرات', icon:'✨' },
    { id:'cursor', label:'المؤشر',    icon:'🖱️' },
  ],
  signatures: [
    { id:'style',     label:'النمط',    icon:'📝' },
    { id:'color',     label:'اللون',    icon:'🎨' },
    { id:'font',      label:'الخط',     icon:'🔤' },
    { id:'layout',    label:'التخطيط',  icon:'📐' },
    { id:'animation', label:'الحركة',   icon:'✨' },
    { id:'display',   label:'العرض',    icon:'👁️' },
  ],

  posts: [
    { id:'style',   label:'النمط',   icon:'📄' },
    { id:'layout',  label:'التخطيط', icon:'📐' },
    { id:'colors',  label:'الألوان', icon:'🎨' },
    { id:'glow',    label:'التوهج',  icon:'✨' },
  ],
};

/* حقول كل فئة — لإعادة التعيين */
const ZONE_FIELDS = {
  cover: ['coverPreset','coverPattern','coverPatternColor','coverOverlayStyle',
          'coverVignette','coverBlur','coverZoom','coverBrightnessNew','coverContrast',
          'coverSaturation','bannerEffect','coverPosition'],
  avatar: ['avatarShape','avatarBorder','avatarBorderColor','avatarBorderWidth',
           'frameColor1','frameColor2','frameThickness','frameGlowIntensity',
           'avatarRotation','avatarScale','avatarFilter','avatarDecoration',
           'avatarDecorationColor','avatarBgPattern','avatarBgColor','avatarBreathing'],
  name: ['nameColor','nameGradient2','nameEffect','nameAnimation','nameWeight',
         'nameSize','nameFont','nameUnderline','nameUnderlineColor',
         'nameLetterSpacing','nameBadge'],
  username: ['usernameColor','usernameGradient','usernameEffect','usernameAnimation',
             'usernameWeight','usernameSize','usernameLetterSpacing'],
  bio: ['bioStyle','bioColor','bioGradient','bioEffect','bioFontSize','bioFontWeight',
        'bioAlign','bioBorderColor','bioBorderWidth','bioBg','bioBgOpacity',
        'bioIcon','bioIconColor'],
  body: ['themeGradientAngle','themeOpacity','themePattern','themeGlow',
         'accentColor','profileLayout','musicUrl'],
  card: ['cardBorderColor','cardBorderWidth','cardBorderStyle','cardCorner',
         'cardGlow','cardShadow','cardHoverEffect','cardEntrance','cardOpacity',
         'cardBackdropBlur','bgPattern'],
  level: ['levelBadgeShape','levelBadgeColor1','levelBadgeColor2','levelBarStyle',
          'levelBarColor1','levelBarColor2','levelBarColor','levelIcon',
          'levelLabelText','levelShowLabel'],
  texts: ['joinDateColor','followersBtnColor','followersBtnBg','locationColor',
          'levelTextColor','teamTextColor','statusTextColor','pronounsTextColor',
          'globalFont'],
  effects: ['showParticles','particleColor','showSparkles','customCursor'],
  signatures: [
    'sigStyle','sigColor','sigGradient','sigEffect','sigBg','sigBgOpacity',
    'sigBorderColor','sigBorderWidth','sigBorderRadius','sigFontSize',
    'sigFontWeight','sigFontFamily','sigFontStyle','sigAnimation',
    'sigAlign','sigPadding','sigShadow','sigLetterSpacing','sigLineHeight',
    'sigDisplayCount','sigShowAvatar','sigShowTime','sigShowName',
  ],

  posts: [
    'postCardStyle','postLayout','postBgColor','postBgOpacity',
    'postBorderColor','postBorderWidth','postBorderRadius','postGlow',
    'postAvatarShape','postAvatarSize','postShowActions',
    'postNameColor','postTextColor',
  ],
};

/* ربط كل حقل بتبويبه الفرعي */
const SUBTAB_FIELD_MAP = {
  cover: {
    coverPreset:'image', coverBlur:'image', coverZoom:'image',
    coverBrightnessNew:'image', coverContrast:'image', coverSaturation:'image',
    coverPattern:'style', coverPatternColor:'style',
    coverOverlayStyle:'style', coverVignette:'style',
    bannerEffect:'effect',
  coverHue:'image', coverOpacity:'image',           // ★
  coverRadius:'style',                              // ★
  coverAnimType:'effect',                           // ★
},
  avatar: {
    avatarShape:'shape', avatarBorder:'shape',
    frameColor1:'frame', frameColor2:'frame',
    frameThickness:'frame', frameGlowIntensity:'frame',
    avatarFilter:'effects', avatarRotation:'effects', avatarScale:'effects',
    avatarBreathing:'effects', avatarBorderWidth:'effects', avatarBorderColor:'effects',
    avatarDecoration:'decoration', avatarBgPattern:'decoration',
  avatarSize:'shape', avatarBorderStyle:'shape',    // ★
  avatarOffsetX:'effects', avatarOffsetY:'effects', // ★
  avatarGlowColor:'frame', avatarGlowIntensity:'frame', // ★
},
  name: {
    nameColor:'color', nameGradient2:'color',
    nameWeight:'font', nameSize:'font', nameFont:'font',
    nameLetterSpacing:'font', nameUnderline:'font', nameUnderlineColor:'font',
    nameEffect:'effect', nameAnimation:'effect',
    nameBadge:'badge',
  nameShadowColor:'color',                          // ★
  nameFontStyle:'font', nameTransform:'font',       // ★
  nameLineHeight:'font',                            // ★
},
  username: {
    usernameColor:'color', usernameGradient:'color',
    usernameWeight:'font', usernameSize:'font', usernameLetterSpacing:'font',
    usernameEffect:'effect', usernameAnimation:'effect',
  usernameOpacity:'color',                          // ★
  usernameFont:'font', usernameShowAt:'font',       // ★
  usernameItalic:'font',                            // ★
},
  bio: {
    bioStyle:'style',
    bioColor:'color', bioGradient:'color', bioEffect:'color', bioBorderColor:'color',
    bioFontSize:'layout', bioFontWeight:'layout', bioAlign:'layout',
    bioBg:'layout', bioBgOpacity:'layout', bioBorderWidth:'layout',
    bioIcon:'icon', bioIconColor:'icon',
  bioLineHeight:'layout', bioLetterSpacing:'layout',// ★
  bioFontFamily:'layout', bioMaxWidth:'layout',     // ★
  bioItalic:'layout',                               // ★
},
  body: {
    themeGradientAngle:'theme', themeOpacity:'theme',
    themePattern:'theme', themeGlow:'theme',
    profileLayout:'layout', accentColor:'accent', musicUrl:'music',
  themeHue:'theme', themeSaturation:'theme',        // ★
  themeBrightness:'theme', themeBlur:'theme',       // ★
  accentColor2:'accent',                            // ★
  musicVolume:'music', musicAutoplay:'music',       // ★
},
  card: {
    cardBorderColor:'border', cardBorderWidth:'border',
    cardBorderStyle:'border', cardCorner:'border',
    cardGlow:'shadow', cardShadow:'shadow',
    cardHoverEffect:'effect', cardEntrance:'effect',
    bgPattern:'pattern', cardOpacity:'pattern', cardBackdropBlur:'pattern',
  cardPadding:'border', cardRotate:'border',        // ★
  cardBlendMode:'pattern', cardMaxWidth:'pattern',  // ★
},
  level: {
    levelBadgeShape:'badge', levelBadgeColor1:'badge', levelBadgeColor2:'badge',
    levelIcon:'badge',
    levelBarStyle:'bar', levelBarColor1:'bar', levelBarColor2:'bar', levelBarColor:'bar',
    levelLabelText:'label', levelShowLabel:'label',
  levelBarHeight:'bar', levelBarSpeed:'bar',        // ★
  levelTextSize:'label', levelBadgeSize:'badge',    // ★
  levelBadgePosition:'badge',                       // ★
},
  texts: {
    joinDateColor:'colors', followersBtnColor:'colors', followersBtnBg:'colors',
    locationColor:'colors', levelTextColor:'colors', teamTextColor:'colors',
    statusTextColor:'colors', pronounsTextColor:'colors',
    globalFont:'fonts',
  textLetterSpacing:'fonts', textTransform:'fonts', // ★
  textShadowColor:'colors', textShadowBlur:'colors',// ★
},
  effects: {
    showParticles:'visual', particleColor:'visual', showSparkles:'visual',
    customCursor:'cursor',
  particleCount:'visual', particleSpeed:'visual',   // ★
  sparkleColor:'visual', sparkleCount:'visual',     // ★
  bgVignette:'visual',                              // ★
},
  signatures: {
    sigStyle: 'style',
    sigShowAvatar: 'style', sigShowTime: 'style', sigShowName: 'style',
    sigColor: 'color', sigGradient: 'color', sigEffect: 'color',
    sigBg: 'color', sigBgOpacity: 'color', sigBorderColor: 'color',
    sigFontSize: 'font', sigFontWeight: 'font', sigFontFamily: 'font', sigFontStyle: 'font',
    sigAlign: 'layout', sigPadding: 'layout', sigBorderWidth: 'layout',
    sigBorderRadius: 'layout', sigLetterSpacing: 'layout',
    sigLineHeight: 'layout', sigShadow: 'layout',
    sigAnimation: 'animation',
    sigDisplayCount: 'display',
  },

  posts: {
    postCardStyle: 'style', postShowActions: 'style',
    postLayout: 'layout', postAvatarShape: 'layout', postAvatarSize: 'layout',
    postBorderRadius: 'layout', postBorderWidth: 'layout',
    postBgColor: 'colors', postBgOpacity: 'colors',
    postBorderColor: 'colors', postNameColor: 'colors', postTextColor: 'colors',
    postGlow: 'glow',
  },
};

/* ربط السلايدرز بالحقول */
const SLIDER_TO_FIELD = {
  coverBlurSlider:'coverBlur', coverZoomSlider:'coverZoom',
  coverBrightnessSlider:'coverBrightnessNew', coverContrastSlider:'coverContrast',
  coverSaturationSlider:'coverSaturation', coverVignetteSlider:'coverVignette',
  avatarBorderWidthSlider:'avatarBorderWidth', avatarRotationSlider:'avatarRotation',
  avatarScaleSlider:'avatarScale', frameThicknessSlider:'frameThickness',
  frameGlowSlider:'frameGlowIntensity', nameLetterSpacingSlider:'nameLetterSpacing',
  usernameLetterSpacingSlider:'usernameLetterSpacing',
  bioBgOpacitySlider:'bioBgOpacity', bioBorderWidthSlider:'bioBorderWidth',
  themeGradientAngleSlider:'themeGradientAngle', themeOpacitySlider:'themeOpacity',
  cardBorderWidthSlider:'cardBorderWidth', cardOpacitySlider:'cardOpacity',
  cardBackdropBlurSlider:'cardBackdropBlur',
};

const CHECKBOX_TO_FIELD = {
  avatarBreathingChk:'avatarBreathing', levelShowLabelChk:'levelShowLabel',
  showParticlesChk:'showParticles', showSparklesChk:'showSparkles',
  /* أضف داخل CHECKBOX_TO_FIELD: */
  sigShowAvatarChk: 'sigShowAvatar',
  sigShowTimeChk:   'sigShowTime',
  sigShowNameChk:   'sigShowName',
  postShowActionsChk: 'postShowActions',
};

/* الحقول التي تحتاج إعادة رسم كامل عند التغيير */
const CONDITIONAL_FIELDS = ['avatarBorder', 'nameUnderline', 'showParticles'];

/* ============================================================
   🖼️ معاينة العنصر المخصص (فوق التبويبات)
   ============================================================ */
function renderZonePreview(zone, p){
  if(!zone || !p) return '';
  const cust = getProfileCustomization(p);
  const themeId = p.equipped?.themeId || p.themeId || 'default';
  const frameId = p.equipped?.frameId || p.frameId || 'none';
  const theme = THEMES_EXTENDED[themeId] || THEMES_EXTENDED.default;

/* ★ إضافة فلتر Hue للتأثيرات */
if(zone === 'cover'){
  return `<div class="zone-preview-inner">
    <div style="width:100%;aspect-ratio:16/7;border-radius:10px;overflow:hidden;position:relative;
                ${buildCoverStyle(p, cust, theme)}
                filter:hue-rotate(${cust.coverHue}deg) opacity(${cust.coverOpacity/100});
                border-radius:${cust.coverRadius}px;">
      ${buildCoverOverlayHTML(cust)}
      ${cust.bannerEffect !== 'none' ? `<div class="preview-effect effect-${cust.bannerEffect}" style="position:absolute;inset:0;z-index:4"></div>` : ''}
      ${cust.coverAnimType !== 'none' ? `<div class="cover-anim-${cust.coverAnimType}" style="position:absolute;inset:0;background:inherit;background-size:cover;"></div>` : ''}
      ${!p.coverUrl ? `<div style="position:absolute;inset:0;background:linear-gradient(135deg,${theme.colors[0]},${theme.colors[1]});display:grid;place-items:center;color:rgba(255,255,255,.75);font-size:11px;font-weight:800;z-index:1;gap:4px">${ic('camera','sm')} <span>الغلاف</span></div>` : ''}
    </div>
  </div>`;
}

  if(zone === 'avatar'){
    return `<div class="zone-preview-inner" style="display:flex;justify-content:center;padding:16px 0">
      ${avatar(p, 100, FRAME_STYLES[frameId]?.class || '')}
    </div>`;
  }

  if(zone === 'name'){
    const badge = NAME_BADGES[cust.nameBadge] || NAME_BADGES.none;
    return `<div class="zone-preview-inner" style="display:flex;justify-content:center;align-items:center;padding:20px;text-align:center">
      <div class="anim-name-${cust.nameAnimation}" style="${buildNameStyle(cust)}">
        ${badge.emoji ? `<span style="margin-inline-end:4px">${badge.emoji}</span>` : ''}
        ${esc(p.name)}
      </div>
    </div>`;
  }

  if(zone === 'username'){
    return `<div class="zone-preview-inner" style="display:flex;justify-content:center;padding:20px">
      <div style="${buildUsernameStyle(cust)}">@${esc(p.username)}</div>
    </div>`;
  }

  if(zone === 'bio'){
    return `<div class="zone-preview-inner" style="padding:14px">
      <div style="${buildBioStyle(cust)}">${cust.bioIcon ? `<span style="color:${cust.bioIconColor};margin-inline-end:4px">${cust.bioIcon}</span>` : ''}${esc(p.bio || 'نبذة قصيرة عن نفسك…')}</div>
    </div>`;
  }

  if(zone === 'body'){
    const bg = `background:linear-gradient(${cust.themeGradientAngle}deg, ${theme.colors[0]}55, ${theme.colors[1]}22), #0c111c;`;
    return `<div class="zone-preview-inner">
      <div style="height:100px;border-radius:10px;position:relative;overflow:hidden;display:grid;place-items:center;${bg}">
        ${buildBgPattern(cust.themePattern)}
        <div style="position:relative;z-index:1;text-align:center">
          <div style="font-size:26px">🎨</div>
          <div style="font-size:12px;font-weight:900;color:#fff;margin-top:4px">${theme.name}</div>
        </div>
      </div>
    </div>`;
  }

  if(zone === 'card'){
    return `<div class="zone-preview-inner" style="padding:14px 0">
      <div style="${buildCardStyle(cust)};height:90px;background:linear-gradient(135deg, rgba(108,92,231,.15), rgba(0,210,255,.08));display:grid;place-items:center">
        <div style="font-size:11px;color:var(--muted);font-weight:800">معاينة شكل البطاقة</div>
      </div>
    </div>`;
  }

  if(zone === 'level'){
    const badgeBg = `linear-gradient(135deg, ${cust.levelBadgeColor1}, ${cust.levelBadgeColor2})`;
    const badgeStyle = `
      background:${badgeBg};
      ${cust.levelBadgeShape === 'hexagon' ? 'clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);' : ''}
      ${cust.levelBadgeShape === 'star' ? 'clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);' : ''}
    `;
    return `<div class="zone-preview-inner" style="padding:14px 0">
      <div class="pc-level" style="padding:8px 0">
        <div class="pc-level-bar level-bar-${cust.levelBarStyle || 'gradient'}" style="flex:1">
          <span style="width:60%;${cust.levelBarColor ? `background:${cust.levelBarColor};box-shadow:0 0 14px ${cust.levelBarColor};` : `background:linear-gradient(90deg, ${cust.levelBarColor1}, ${cust.levelBarColor2});`}"></span>
        </div>
        <div class="pc-level-num" style="${badgeStyle}">
          ${cust.levelIcon || ''} ${cust.levelShowLabel ? (cust.levelLabelText || 'المستوى') + ' ' : ''}${p.level || 1}
        </div>
      </div>
    </div>`;
  }

  if(zone === 'texts'){
    return `<div class="zone-preview-inner">
      <div style="background:var(--card);border-radius:10px;padding:12px;font-size:11px;display:flex;flex-direction:column;gap:7px">
        <div style="color:${cust.joinDateColor}">${ic('clock','xs')} انضم حديثاً</div>
        <div style="color:${cust.locationColor}">${ic('location','xs')} القاهرة، مصر</div>
        <div style="color:${cust.teamTextColor}">🛡️ فريق نكسوس</div>
        <div style="color:${cust.statusTextColor}">متاح للعب</div>
      </div>

      <!-- ★ معاينة صف المتابعين بالنمط الجديد -->
      <div class="pc-social-row"
           style="margin-top:10px;border-radius:10px;
                  --btn-bg:${cust.followersBtnBg === 'transparent' ? 'rgba(0,0,0,.18)' : cust.followersBtnBg};
                  --btn-fg:${cust.followersBtnColor};
                  --btn-label-fg:${cust.followersBtnColor};">
        <button class="pc-social-btn" type="button">
          <b>128</b>
          <small>متابع</small>
        </button>
        <button class="pc-social-btn" type="button">
          <b>42</b>
          <small>متابَع</small>
        </button>
      </div>
    </div>`;
  }

  if(zone === 'effects'){
    return `<div class="zone-preview-inner">
      <div style="height:90px;border-radius:10px;background:linear-gradient(135deg, rgba(108,92,231,.15), rgba(0,210,255,.08));display:grid;place-items:center;position:relative;overflow:hidden">
        ${cust.showParticles ? `<div class="card-particles" style="color:${cust.particleColor}"></div>` : ''}
        ${cust.showSparkles ? `<div style="position:absolute;inset:0;background-image:radial-gradient(1px 1px at 20% 30%,#fff,transparent),radial-gradient(1px 1px at 70% 60%,#f5b301,transparent),radial-gradient(1px 1px at 40% 80%,#fff,transparent);animation:pulse 2s infinite"></div>` : ''}
        <div style="position:relative;z-index:1;font-size:11px;color:var(--muted);font-weight:800">
          ${(cust.showParticles || cust.showSparkles) ? '✨ تأثيرات نشطة' : 'لا تأثيرات'}
        </div>
      </div>
    </div>`;
  }

  /* ══════════════════════════════════════════════════════════
     ✍️ معاينة التوقيعات
     ══════════════════════════════════════════════════════════ */
  if(zone === 'signatures'){
    return `<div class="zone-preview-inner" style="padding:14px">
      <div class="sig-preview-list">
        ${Array.from({length: Math.min(3, cust.sigDisplayCount || 3)}).map((_, i) => `
          <div class="sig-preview-row" style="animation-delay:${i*0.2}s">
            ${cust.sigShowAvatar
              ? `<span style="display:inline-block;width:22px;height:22px;border-radius:50%;
                            background:var(--grad);margin-inline-end:8px;vertical-align:middle;
                            box-shadow:0 2px 6px rgba(0,0,0,.3)"></span>`
              : ''}
            <div style="${buildSignatureStyle(cust)};display:inline-block;text-align:${cust.sigAlign};min-width:60%">
              ${cust.sigShowName ? `<b style="font-size:10px;color:${cust.sigColor};display:block;margin-bottom:2px;font-style:normal">لاعب ${i+1}</b>` : ''}
              <span>هذا توقيع تجريبي ✨</span>
              ${cust.sigShowTime ? `<small style="display:block;font-size:8px;opacity:.55;font-style:normal;margin-top:3px">الآن</small>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  /* ══════════════════════════════════════════════════════════
     📰 معاينة المنشورات
     ══════════════════════════════════════════════════════════ */
  if(zone === 'posts'){
    const postStyle = buildPostCardStyle(cust, p);
    return `<div class="zone-preview-inner" style="padding:12px 0">
      <div class="post" style="${postStyle}">
        <div class="post-h" style="padding:${cust.postLayout === 'compact' ? '8px' : cust.postLayout === 'spacious' ? '18px' : '12px'};margin-bottom:${cust.postLayout === 'compact' ? '6px' : '10px'}">
          <div class="av ${cust.postAvatarShape === 'circle' ? 'sq' : ''}"
               style="--s:${cust.postAvatarSize}px;background:var(--grad);border-radius:${POST_AVATAR_SHAPES[cust.postAvatarShape]?.radius || '50%'};font-size:${Math.round(cust.postAvatarSize*0.35)}px">
            ${(p.name || 'ن').charAt(0)}
          </div>
          <div style="flex:1;min-width:0">
            <div class="post-name" style="color:${cust.postNameColor || 'var(--txt)'}">${esc(p.name || 'لاعب')}</div>
            <div class="post-sub">@${esc(p.username || 'user')}·الآن</div>
          </div>
        </div>
        <p class="post-text" style="color:${cust.postTextColor || '#dbe3f5'};padding:0 ${cust.postLayout === 'compact' ? '8px' : cust.postLayout === 'spacious' ? '18px' : '12px'}">
          هذا منشور تجريبي لمعاينة النمط…
        </p>
        ${cust.postShowActions ? `
          <div class="post-actions" style="padding:${cust.postLayout === 'compact' ? '8px' : '11px 12px 12px'}">
            <button class="pact">❤️ 12</button>
            <button class="pact">💬 5</button>
            <button class="pact">🔗 3</button>
          </div>
        ` : ''}
      </div>
    </div>`;
  }

  return '';
}

/* تحديث المعاينة فقط (بدون إعادة رسم) */
function updateZonePreview(){
  const wrap = document.getElementById('zonePreviewWrap');
  if(!wrap || !state.profile || !state.custActiveZone) return;
  wrap.innerHTML = renderZonePreview(state.custActiveZone, state.profile);
}

/* ============================================================
   🔄 إعادة تعيين فئة معينة
   ============================================================ */
async function resetZone(zone){
  const fields = ZONE_FIELDS[zone] || [];
  if(!fields.length) return;
  if(!confirm(`إعادة تعيين جميع تخصيصات "${getZoneLabel(zone)}"؟`)) return;

  const defaults = getProfileCustomization({});
  const updates = {};

  /* ★ الحقول التي تغيّرت فعلاً فقط */
  fields.forEach(f => {
    if(f in defaults && state.profile[f] !== defaults[f]){
      updates[f] = defaults[f];
    }
  });

  if(zone === 'avatar' && state.profile.frameId !== 'none'){
    updates.frameId = 'none';
  }
  if(zone === 'body' && state.profile.themeId !== 'default'){
    updates.themeId = 'default';
  }

  const entries = Object.entries(updates);
  if(entries.length === 0){
    await resetEquippedFields({
      frame: zone === 'avatar',
      theme: zone === 'body',
    });
    toast('الفئة بالفعل افتراضية ✓');
    render();
    return;
  }

  /* دفعة واحدة */
  let batchOk = false;
  try {
    await updateDoc(doc(db, 'users', state.user.uid), updates);
    Object.assign(state.profile, updates);
    batchOk = true;
  } catch(e){
    if(e.code !== 'permission-denied') throw e;
    console.warn('Zone batch rejected — writing per-field…');
  }

  /* احتياطي: حقل بحقل */
  if(!batchOk){
    let ok = 0, fail = 0;
    for(const [field, value] of entries){
      try {
        await updateDoc(doc(db, 'users', state.user.uid), { [field]: value });
        state.profile[field] = value;
        ok++;
      } catch(err){ fail++; }
    }
    if(fail > 0){
      toast(`تم ${ok}، فشل ${fail} — راجع قواعد Firebase`);
    } else {
      toast(`تم إعادة تعيين ${ok} حقل ✓`);
    }
  } else {
    toast('تم إعادة التعيين ✓');
  }

  await resetEquippedFields({
    frame: zone === 'avatar',
    theme: zone === 'body',
  });
  render();
}

/* ============================================================
   🔄 إعادة تعيين كل التخصيصات
   ============================================================ */
async function resetAllCustomizations(){
  if(!confirm('إعادة تعيين جميع تخصيصات البطاقة؟ (لن تُحذف الصور)')) return;

  const allFields = new Set();
  Object.values(ZONE_FIELDS).forEach(arr => arr.forEach(f => allFields.add(f)));
  const defaults = getProfileCustomization({});

  /* ★ فقط الحقول التي تختلف عن الافتراضي فعلاً */
  const updates = {};
  allFields.forEach(f => {
    if(f in defaults && state.profile[f] !== defaults[f]){
      updates[f] = defaults[f];
    }
  });

  /* ★ بدون dot-notation ولا null */
  if(state.profile.frameId && state.profile.frameId !== 'none'){
    updates.frameId = 'none';
  }
  if(state.profile.themeId && state.profile.themeId !== 'default'){
    updates.themeId = 'default';
  }

  const entries = Object.entries(updates);

  /* ═══════════ الحالة 1: لا شيء لتغييره ═══════════ */
  if(entries.length === 0){
    await resetEquippedFields({ frame: true, theme: true });
    toast('البطاقة بالفعل بالإعدادات الافتراضية ✓');
    render();
    return;
  }

  /* ═══════════ الحالة 2: محاولة دفعة واحدة ═══════════ */
  let batchSucceeded = false;
  try {
    await updateDoc(doc(db, 'users', state.user.uid), updates);
    Object.assign(state.profile, updates);
    batchSucceeded = true;
  } catch(e){
    if(e.code !== 'permission-denied'){
      console.error('resetAll:', e);
      toast('فشل: ' + (e.message || e.code));
      return;
    }
    console.warn('Batch reset rejected — falling back to per-field writes…');
  }

  /* ═══════════ الحالة 3: كتابة حقل بحقل (احتياطي) ═══════════ */
  if(!batchSucceeded){
    let okCount = 0;
    const failedFields = [];

    for(const [field, value] of entries){
      try {
        await updateDoc(doc(db, 'users', state.user.uid), { [field]: value });
        state.profile[field] = value;
        okCount++;
      } catch(err){
        failedFields.push(field);
        console.warn(`❌ reset failed → ${field}:`, err.code);
      }
    }

    if(failedFields.length > 0){
      console.error('🚫 حقول رفضتها قواعد Firebase:', failedFields);
      toast(`تم ${okCount} حقل · فشل ${failedFields.length} (راجع Console)`);
    } else {
      toast(`تم إعادة تعيين ${okCount} حقل ✓`);
    }
  } else {
    toast('تم إعادة تعيين البطاقة بالكامل ✓');
  }

  /* ═══════════ تنظيف equipped بدون null ═══════════ */
  await resetEquippedFields({ frame: true, theme: true });
  render();
}

/* ★ كتابة كائن equipped كامل بدلًا من dot-notation/null */
async function resetEquippedFields(opts = {}){
  try{
    const eq = { ...(state.profile.equipped || {}) };
    if(opts.frame) delete eq.frameId;
    if(opts.theme) eq.themeId = 'default';

    await updateDoc(doc(db, 'users', state.user.uid), { equipped: eq });
    state.profile.equipped = eq;
  } catch(e){
    console.warn('resetEquippedFields:', e.code);
  }
}

/* ============================================================
   🎨 بناء شريط التخصيصات الفردية (المستوى الثالث)
   ============================================================ */
function buildFieldNav(zone){
  /* احذف أي شريط سابق */
  document.querySelectorAll('.cust-field-nav').forEach(el => el.remove());

  const body = document.querySelector('.cust-zone-body');
  if(!body) return;

  /* الحقول الظاهرة بعد فلترة التبويب الفرعي */
  const visibleFields = [...body.querySelectorAll('.cust-field.subtab-visible')];
  if(visibleFields.length === 0) return;

  /* استخرج العناوين وأضف معرّفات */
  const fieldData = visibleFields.map((f, i) => {
    const fid = `${zone}_${state.custSubTab}_${i}`;
    f.dataset.fieldId = fid;

    const labelEl = f.querySelector(':scope > label');
    let label = 'خيار ' + (i + 1);
    if(labelEl){
      const clone = labelEl.cloneNode(true);
      /* احذف العناصر المزعجة من العنوان */
      clone.querySelectorAll('.lock-hint, .range-val, .ic, .field-hint').forEach(el => el.remove());
      const txt = clone.textContent.trim();
      if(txt) label = txt.substring(0, 22);
    }
    return { id: fid, label };
  });

  /* قرّر التبويب النشط */
  if(!state.custFieldTab || !fieldData.find(fd => fd.id === state.custFieldTab)){
    state.custFieldTab = fieldData[0].id;
  }

  /* ابنِ الشريط */
  const nav = document.createElement('div');
  nav.className = 'cust-field-nav';
  nav.innerHTML = fieldData.map(fd => `
    <button type="button"
            class="cust-field-tab ${fd.id === state.custFieldTab ? 'active' : ''}"
            data-field-tab="${fd.id}">
      ${fd.label}
    </button>
  `).join('');

  /* أدرجه بعد شريط التبويبات الفرعية */
  const subtabs = document.querySelector('.cust-sub-tabs');
  if(subtabs) subtabs.after(nav);
  else body.before(nav);

  /* طبّق الرؤية */
  applyFieldVisibility(visibleFields);
}

function applyFieldVisibility(fields){
  const list = fields || [...document.querySelectorAll('.cust-zone-body .cust-field.subtab-visible')];
  list.forEach(f => {
    const matchesActiveField = f.dataset.fieldId === state.custFieldTab;
    f.style.display = matchesActiveField ? 'block' : 'none';
  });
  document.querySelectorAll('.cust-field-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.fieldTab === state.custFieldTab);
  });
}

/* ============================================================
   🏷️ وسم الحقول بتبويباتها الفرعية بعد الرسم
   ============================================================ */
function tagSubtabsForZone(zone){
  const body = document.querySelector('.cust-zone-body');
  if(!body) return;
  const mapping = SUBTAB_FIELD_MAP[zone] || {};

  body.querySelectorAll('[data-cust]').forEach(el => {
    const subtab = mapping[el.dataset.cust];
    if(subtab){
      const f = el.closest('.cust-field');
      if(f) f.dataset.subtab = subtab;
    }
  });

  body.querySelectorAll('[id]').forEach(el => {
    const fieldName = SLIDER_TO_FIELD[el.id] || CHECKBOX_TO_FIELD[el.id];
    if(fieldName){
      const subtab = mapping[fieldName];
      if(subtab){
        const f = el.closest('.cust-field');
        if(f) f.dataset.subtab = subtab;
      }
    }
  });

  applySubtabVisibility(zone);

  /* ★★ جديد: ابنِ المستوى الثالث بعد فلترة المستوى الثاني ★★ */
  buildFieldNav(zone);
}

function applySubtabVisibility(zone){
  const body = document.querySelector('.cust-zone-body');
  if(!body) return;
  const active = state.custSubTab;
  body.querySelectorAll('.cust-field[data-subtab]').forEach(f => {
    const isVisible = f.dataset.subtab === active;
    f.classList.toggle('subtab-visible', isVisible);

    /* ★★★ الإصلاح الأساسي ★★★
       امسح inline display السابق (الذي وضعه فلتر المستوى الثالث)،
       لكي يتحكم CSS مرة أخرى ثم يضبطه buildFieldNav من جديد. */
    f.style.display = '';

    /* ★ امسح معرّف الحقل القديم أيضاً (تنظيف) */
    delete f.dataset.fieldId;
  });
}

/* إعادة رسم مع الحفاظ على التمرير */
function renderKeepScroll(){
  const y = window.scrollY;
  render();
  setTimeout(() => window.scrollTo(0, y), 25);
}

async function pageCustomization(){
  const p = state.profile;
  if(!p) return emptyState('جاري التحميل…','image');

  const sub = getSubscription(p);
  const plan = SUBSCRIPTION_PLANS[sub.plan] || SUBSCRIPTION_PLANS.free;
  const cust = getProfileCustomization(p);
  const themeId = p.equipped?.themeId || p.themeId || 'default';
  const frameId = p.equipped?.frameId || p.frameId || 'none';
  const zone = state.custActiveZone;

  // ضبط التبويب الفرعي الافتراضي
  if(zone){
    const subs = ZONE_SUBTABS[zone] || [];
    if(!state.custSubTab || !subs.find(s => s.id === state.custSubTab)){
      state.custSubTab = subs[0]?.id;
    }
  }

  const subBadge = sub.active ? `
    <div class="cust-sub-badge" style="background:${plan.color}22;border-color:${plan.color}55;color:${plan.color}">
      <span>${plan.emoji}</span>
      <div>
        <div style="font-size:13px;font-weight:900">${plan.name}</div>
        <div style="font-size:10px;opacity:.8">ينتهي ${sub.expiresAt.toLocaleDateString('ar-EG')}</div>
      </div>
    </div>
  ` : `
    <div class="cust-sub-badge" style="background:rgba(138,149,173,.15);border-color:rgba(138,149,173,.35);color:#8a95ad">
      <span>🆓</span>
      <div>
        <div style="font-size:13px;font-weight:900">اشتراك مجاني</div>
        <div style="font-size:10px;opacity:.8">اشترك لفتح المزيد</div>
      </div>
    </div>
  `;

  const zoneNav = `
    <div class="cust-quick-nav">
      ${Object.keys(ZONE_ICONS).map(k => `
        <button class="cq-btn ${zone===k?'active':''}" data-cust-zone="${k}">
          <span class="cq-icon">${ZONE_ICONS[k]}</span>
          <span class="cq-label">${getZoneLabel(k).replace(/^[^\s]+\s*/, '')}</span>
        </button>
      `).join('')}
    </div>
  `;

  // بناء لوحة الفئة النشطة
  let zonePanel = '';
  if(zone){
    const zoneSubs = ZONE_SUBTABS[zone] || [];
    const activeSub = state.custSubTab;

    zonePanel = `
      <div class="cust-zone-panel">
        <div class="cust-zone-header">
          <span class="cust-zone-icon">${getZoneIcon(zone)}</span>
          <div style="flex:1"><div class="cust-zone-title">${getZoneLabel(zone).replace(/^[^\s]+\s*/, '')}</div></div>
          <button class="btn-reset-zone" data-reset-zone="${zone}" title="إعادة تعيين هذه الفئة">
            ${ic('trash','xs')} إعادة تعيين
          </button>
          <button class="icon-btn" data-action="close-cust-zone" style="width:30px;height:30px">${ic('close','sm')}</button>
        </div>

        <!-- معاينة العنصر المخصص -->
        <div class="zone-preview-wrap" id="zonePreviewWrap">
          ${renderZonePreview(zone, p)}
        </div>

        <!-- التبويبات الفرعية -->
        <div class="cust-sub-tabs">
          ${zoneSubs.map(st => `
            <button class="cust-sub-tab ${activeSub===st.id?'active':''}" data-cust-subtab="${st.id}">
              <span>${st.icon}</span>
              <span>${st.label}</span>
            </button>
          `).join('')}
        </div>

        <!-- محتوى التبويب الفرعي -->
        <div class="cust-zone-body" data-active-subtab="${activeSub}">
          ${renderZoneBody(zone, p, sub, cust, themeId, frameId)}
        </div>
      </div>
    `;
  } else {
    zonePanel = `
      <div class="cust-empty-hint">
        ${ic('image')}
        <div>اختر فئة من الشريط أعلاه<br>لبدء تخصيص بطاقتك</div>
      </div>
    `;
  }

  return `

    ${subBadge}

    ${zoneNav}
    ${zonePanel}
  `;
}

/* ============================================================
   🎨 تطبيق الثيم (إصلاح nested update)
   ============================================================ */
async function applyTheme(themeId){
  if(!state.profile) return;

  /* ★ 1) تحديث فوري للـ state (Optimistic) */
  state.profile.themeId = themeId;
  if(!state.profile.equipped) state.profile.equipped = {};
  state.profile.equipped.themeId = themeId;

  /* ★ 2) تحديث المعاينة مباشرة (بدون render كامل) */
updateZonePreview();

  /* ★ 3) تحديـد البطاقة المختارة */
  document.querySelectorAll('[data-set-theme]').forEach(el=>{
    const isSelected = el.dataset.setTheme === themeId;
    el.classList.toggle('selected', isSelected);
    // تحديث شارة "مُطبَّق"
    const existing = el.querySelector('.tier-badge');
    const nameEl = el.querySelector('.theme-name');
    if(isSelected && !existing && nameEl){
      const badge = document.createElement('span');
      badge.className = 'tier-badge free';
      badge.style.marginTop = '2px';
      badge.textContent = '✓ مُطبَّق';
      nameEl.after(badge);
    } else if(!isSelected && existing){
      existing.remove();
    }
  });

  /* ★ 4) الحفظ في Firestore */
  try {
    const equipped = { ...(state.profile.equipped || {}), themeId };
    await updateDoc(doc(db, 'users', state.user.uid), {
      themeId,
      equipped,
    });
    toast('تم تطبيق الثيم ✓');
  } catch(e){
    console.error('applyTheme:', e);
    toast('فشل التطبيق');
    /* Rollback — إعادة القراءة من DB */
    try {
      const s = await getDoc(doc(db, 'users', state.user.uid));
      if(s.exists()) state.profile = s.data();
      if(previewBox) previewBox.innerHTML = renderCustomizationPreview();
    } catch(err){}
  }
}

/* ============================================================
   🖼️ تطبيق الإطار (إصلاح nested update)
   ============================================================ */
async function applyFrame(frameId){
  try {
    const equipped = { ...(state.profile.equipped || {}), frameId };
    await updateDoc(doc(db, 'users', state.user.uid), {
      frameId,
      equipped,   // ← كائن كامل
    });
    toast('تم تطبيق الإطار ✓');
    render();
  } catch(e){
    console.error('applyFrame:', e);
    toast('فشل التطبيق');
  }
}

/* ============================================================
   💳 شراء الاشتراك (إصلاح nested update)
   ============================================================ */
async function purchaseSubscription(planId){
  const plan = SUBSCRIPTION_PLANS[planId];
  if(!plan || planId === 'free') return toast('خطة غير صالحة');
  const p = state.profile;
  if((p.coins || 0) < plan.price) return toast(`رصيد غير كافٍ — تحتاج ${nf(plan.price)} عملة`);
  if(!confirm(`شراء اشتراك "${plan.name}" بـ ${nf(plan.price)} عملة؟`)) return;
  
  try {
    const now = new Date();
    const currentSub = p.subscription || {};
    const currentEnd = currentSub.expiresAt?.toDate?.() || null;
    let newEnd;
    if(currentEnd && currentEnd > now && currentSub.plan === planId){
      newEnd = new Date(currentEnd.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    } else {
      newEnd = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    }
    
    // ★ بناء كائن subscription كامل
    const subscription = {
      plan: planId,
      expiresAt: Timestamp.fromDate(newEnd),
      purchasedAt: Timestamp.fromDate(now),
    };
    
    await updateDoc(doc(db, 'users', state.user.uid), {
      coins: increment(-plan.price),
      subscription,   // ← كائن كامل بدلاً من 3 dot-notation
    });
    
    toast(`✨ تم تفعيل ${plan.emoji} ${plan.name} حتى ${newEnd.toLocaleDateString('ar-EG')}`);
    await logActivity('subscription', `اشترى باقة ${plan.name}`, plan.emoji);
  } catch(e){
    console.error('purchaseSubscription:', e);
    toast('فشل الشراء: ' + (e.message || ''));
  }
}

/* ============================================================
   ✅ مستمع موحّد لكل الحقول الرقمية والنصية والمربعات
   ============================================================ */
/* ============================================================
   ✅ خريطة السلايدرز — ربط الحقول بالحفظ الصحيح
   ============================================================ */
const SLIDER_MAP = {
  /* الغلاف */
  coverBlurSlider:          { field: 'coverBlur',          type: 'int',   label: 'coverBlurVal',          suffix: 'px' },
  coverZoomSlider:          { field: 'coverZoom',          type: 'int',   label: 'coverZoomVal',          suffix: '%'  },
  coverBrightnessSlider:    { field: 'coverBrightnessNew', type: 'int',   label: 'coverBrightnessVal',    suffix: '%'  },
  coverContrastSlider:      { field: 'coverContrast',      type: 'int',   label: 'coverContrastVal',      suffix: '%'  },
  coverSaturationSlider:    { field: 'coverSaturation',    type: 'int',   label: 'coverSaturationVal',    suffix: '%'  },
  coverVignetteSlider:      { field: 'coverVignette',      type: 'int',   label: 'coverVignetteVal',      suffix: '%'  },
  /* الأفاتار */
  avatarBorderWidthSlider:  { field: 'avatarBorderWidth',  type: 'int',   label: 'avatarBorderWidthVal',  suffix: 'px' },
  avatarRotationSlider:     { field: 'avatarRotation',     type: 'int',   label: 'avatarRotationVal',     suffix: '°'  },
  avatarScaleSlider:        { field: 'avatarScale',        type: 'int',   label: 'avatarScaleVal',        suffix: '%',
                              saveTransform: v => v / 100 },   /* ★ الحل الجذري */
  frameThicknessSlider:     { field: 'frameThickness',     type: 'int',   label: 'frameThicknessVal',     suffix: 'px' },
  frameGlowSlider:          { field: 'frameGlowIntensity', type: 'int',   label: 'frameGlowVal',          suffix: ''   },
  /* الاسم */
  nameLetterSpacingSlider:  { field: 'nameLetterSpacing',  type: 'float', label: 'nameLetterSpacingVal',  suffix: 'px' },
  /* اسم المستخدم */
  usernameLetterSpacingSlider:{ field:'usernameLetterSpacing',type:'float',label:'usernameLetterSpacingVal',suffix:'px'},
  /* النبذة */
  bioBgOpacitySlider:       { field: 'bioBgOpacity',       type: 'int',   label: 'bioBgOpacityVal',       suffix: '%'  },
  bioBorderWidthSlider:     { field: 'bioBorderWidth',     type: 'int',   label: 'bioBorderWidthVal',     suffix: 'px' },
  /* الثيم */
  themeGradientAngleSlider: { field: 'themeGradientAngle', type: 'int',   label: 'themeAngleVal',         suffix: '°'  },
  themeOpacitySlider:       { field: 'themeOpacity',       type: 'int',   label: 'themeOpacityVal',       suffix: '%'  },
  /* البطاقة */
  cardBorderWidthSlider:    { field: 'cardBorderWidth',    type: 'int',   label: 'cardBorderWidthVal',    suffix: 'px' },
  cardOpacitySlider:        { field: 'cardOpacity',        type: 'int',   label: 'cardOpacityVal',        suffix: '%'  },
  cardBackdropBlurSlider:   { field: 'cardBackdropBlur',   type: 'int',   label: 'cardBlurVal',           suffix: 'px' },
  /* غلاف جديد */
coverHueSlider:           { field:'coverHue',           type:'int',   label:'coverHueVal',          suffix:'°' },
coverOpacitySlider:       { field:'coverOpacity',       type:'int',   label:'coverOpacityVal',      suffix:'%' },
coverRadiusSlider:        { field:'coverRadius',        type:'int',   label:'coverRadiusVal',       suffix:'px' },
/* أفاتار جديد */
avatarSizeSlider:         { field:'avatarSize',         type:'int',   label:'avatarSizeVal',        suffix:'px' },
avatarOffsetXSlider:      { field:'avatarOffsetX',      type:'int',   label:'avatarOffsetXVal',     suffix:'px' },
avatarOffsetYSlider:      { field:'avatarOffsetY',      type:'int',   label:'avatarOffsetYVal',     suffix:'px' },
avatarGlowIntensitySlider:{ field:'avatarGlowIntensity',type:'int',   label:'avatarGlowIntensityVal',suffix:''  },
/* اسم جديد */
nameLineHeightSlider:     { field:'nameLineHeight',     type:'float', label:'nameLineHeightVal',    suffix:''   },
/* اسم المستخدم */
usernameOpacitySlider:    { field:'usernameOpacity',    type:'int',   label:'usernameOpacityVal',   suffix:'%' },
/* نبذة */
bioLineHeightSlider:      { field:'bioLineHeight',      type:'float', label:'bioLineHeightVal',     suffix:''   },
bioLetterSpacingSlider:   { field:'bioLetterSpacing',   type:'float', label:'bioLetterSpacingVal',  suffix:'px' },
bioMaxWidthSlider:        { field:'bioMaxWidth',        type:'int',   label:'bioMaxWidthVal',       suffix:'%' },
/* ثيم */
themeHueSlider:           { field:'themeHue',           type:'int',   label:'themeHueVal',          suffix:'°' },
themeSaturationSlider:    { field:'themeSaturation',    type:'int',   label:'themeSaturationVal',   suffix:'%' },
themeBrightnessSlider:    { field:'themeBrightness',    type:'int',   label:'themeBrightnessVal',   suffix:'%' },
themeBlurSlider:          { field:'themeBlur',          type:'int',   label:'themeBlurVal',         suffix:'px' },
musicVolumeSlider:        { field:'musicVolume',        type:'int',   label:'musicVolumeVal',       suffix:'%' },
/* بطاقة */
cardPaddingSlider:        { field:'cardPadding',        type:'int',   label:'cardPaddingVal',       suffix:'px' },
cardRotateSlider:         { field:'cardRotate',         type:'int',   label:'cardRotateVal',        suffix:'°' },
cardMaxWidthSlider:       { field:'cardMaxWidth',       type:'int',   label:'cardMaxWidthVal',      suffix:'%' },
/* مستوى */
levelBarHeightSlider:     { field:'levelBarHeight',     type:'int',   label:'levelBarHeightVal',    suffix:'px' },
levelBarSpeedSlider:      { field:'levelBarSpeed',      type:'float', label:'levelBarSpeedVal',     suffix:'s'  },
/* نصوص */
textLetterSpacingSlider:  { field:'textLetterSpacing',  type:'float', label:'textLetterSpacingVal', suffix:'px' },
textShadowBlurSlider:     { field:'textShadowBlur',     type:'int',   label:'textShadowBlurVal',    suffix:'px' },
/* تأثيرات */
particleCountSlider:      { field:'particleCount',      type:'int',   label:'particleCountVal',     suffix:''   },
particleSpeedSlider:      { field:'particleSpeed',      type:'int',   label:'particleSpeedVal',     suffix:'s'  },
sparkleCountSlider:       { field:'sparkleCount',       type:'int',   label:'sparkleCountVal',      suffix:''   },
bgVignetteSlider:         { field:'bgVignette',         type:'int',   label:'bgVignetteVal',        suffix:'%'  },
/* أضف داخل SLIDER_MAP: */
  /* ✍️ التواقيع */
  sigBgOpacitySlider:      { field:'sigBgOpacity',      type:'int',   label:'sigBgOpacityVal',      suffix:'%'  },
  sigPaddingSlider:        { field:'sigPadding',        type:'int',   label:'sigPaddingVal',        suffix:'px' },
  sigBorderWidthSlider:    { field:'sigBorderWidth',    type:'int',   label:'sigBorderWidthVal',    suffix:'px' },
  sigBorderRadiusSlider:   { field:'sigBorderRadius',   type:'int',   label:'sigBorderRadiusVal',   suffix:'px' },
  sigLetterSpacingSlider:  { field:'sigLetterSpacing',  type:'float', label:'sigLetterSpacingVal',  suffix:'px' },
  sigLineHeightSlider:     { field:'sigLineHeight',     type:'float', label:'sigLineHeightVal',     suffix:''   },
  sigDisplayCountSlider:   { field:'sigDisplayCount',   type:'int',   label:'sigDisplayCountVal',   suffix:''   },

  /* 📰 المنشورات */
  postAvatarSizeSlider:    { field:'postAvatarSize',    type:'int',   label:'postAvatarSizeVal',    suffix:'px' },
  postBorderRadiusSlider:  { field:'postBorderRadius',  type:'int',   label:'postBorderRadiusVal',  suffix:'px' },
  postBorderWidthSlider:   { field:'postBorderWidth',   type:'int',   label:'postBorderWidthVal',   suffix:'px' },
  postBgOpacitySlider:     { field:'postBgOpacity',     type:'int',   label:'postBgOpacityVal',     suffix:'%'  },
};

/* ============================================================
   ✅ مستمع input موحّد (يشمل السلايدرز + البحث + نص المستوى)
   ============================================================ */
document.addEventListener('input', async (e) => {

  /* ===== البحث ===== */
  if(e.target.id === 'searchInput'){
    state.searchQ = e.target.value;
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(renderSearchResults, 200);
    return;
  }

  /* ===== نص المستوى (debounced) ===== */
  if(e.target.id === 'levelLabelTextInput'){
    clearTimeout(window._lvlLabelTimer);
    window._lvlLabelTimer = setTimeout(async () => {
      const ok = await saveCustomField('levelLabelText', e.target.value.slice(0, 20));
      if(ok){
        const box = document.getElementById('custPreviewBox');
        if(box) box.innerHTML = renderCustomizationPreview();
      }
    }, 400);
    return;
  }

  /* ===== السلايدرز ===== */
  const cfg = SLIDER_MAP[e.target.id];
  if(!cfg) return;

  const raw = e.target.value;
  const numValue = cfg.type === 'float' ? parseFloat(raw) : parseInt(raw, 10);

  /* 1) تحديث النص فوراً */
  if(cfg.label){
    const lbl = document.getElementById(cfg.label);
    if(lbl) lbl.textContent = raw + (cfg.suffix || '');
  }

  /* 2) تحويل القيمة إن لزم (مثل avatarScale) */
  const saveValue = cfg.saveTransform ? cfg.saveTransform(numValue) : numValue;

  /* 3) حفظ + معاينة فورية */
  const ok = await saveCustomField(cfg.field, saveValue);
  if(ok){
    const box = document.getElementById('custPreviewBox');
    if(box) box.innerHTML = renderCustomizationPreview();
  }
});

/* ============================================================
   ✅ مستمع change للـ checkboxes
   ============================================================ */
document.addEventListener('change', async (e) => {
  const id = e.target.id;
  const fieldName = CHECKBOX_TO_FIELD[id];
  if(fieldName){
    const ok = await saveCustomField(fieldName, e.target.checked);
    if(ok && CONDITIONAL_FIELDS.includes(fieldName)){
      renderKeepScroll();
    }
    return;
  }
});

async function pageGameStats(){
  // احسب إحصائيات لكل لعبة
  try {
    const snap = await getDocs(
      query(collection(db,'users',state.user.uid,'matchHistory'),
            orderBy('playedAt','desc'), limit(100))
    );
    const matches = snap.docs.map(d=>({id:d.id, ...d.data()}));
    
    const byGame = {};
    matches.forEach(m => {
      const gid = m.gameId || 'g3';
      if(!byGame[gid]) byGame[gid] = { played:0, wins:0, losses:0, totalScore:0 };
      byGame[gid].played++;
      byGame[gid].totalScore += (m.myScore || 0);
      if(m.result === 'win') byGame[gid].wins++;
      else byGame[gid].losses++;
    });
    
    return `
      
      <div class="stat-grid" style="margin-bottom:16px">
        <div class="stat-box"><div class="sv">${matches.length}</div><div class="sl">إجمالي المباريات</div></div>
        <div class="stat-box"><div class="sv">${matches.filter(m=>m.result==='win').length}</div><div class="sl">انتصارات</div></div>
        <div class="stat-box"><div class="sv">${matches.filter(m=>m.result==='loss').length}</div><div class="sl">خسائر</div></div>
        <div class="stat-box"><div class="sv">${
          matches.length ? Math.round(matches.filter(m=>m.result==='win').length / matches.length * 100) : 0
        }%</div><div class="sl">نسبة الفوز</div></div>
      </div>
      
      <div class="section-title">${ic('gamepad','sm')} حسب اللعبة</div>
      ${Object.keys(byGame).length ? Object.entries(byGame).map(([gid, stats])=>{
        const g = GAMES.find(x => x.id === gid);
        if(!g) return '';
        const wr = Math.round(stats.wins / stats.played * 100);
        return `
          <div class="game-stat-card">
            <div class="gs-header">
              <div class="gs-icon" style="background:${g.grad}">${ic(g.icon,'sm')}</div>
              <div style="flex:1">
                <div class="gs-title">${g.name}</div>
                <div class="gs-sub">${g.cat}</div>
              </div>
            </div>
            <div class="gs-grid">
              <div class="gs-cell"><div class="v">${stats.played}</div><div class="l">مباراة</div></div>
              <div class="gs-cell"><div class="v" style="color:var(--ok)">${stats.wins}</div><div class="l">فوز</div></div>
              <div class="gs-cell"><div class="v" style="color:var(--pink)">${stats.losses}</div><div class="l">خسارة</div></div>
              <div class="gs-cell"><div class="v">${wr}%</div><div class="l">نسبة فوز</div></div>
            </div>
            <div class="gs-wr"><span style="width:${wr}%"></span></div>
          </div>
        `;
      }).join('') : emptyState('لم تلعب أي مباراة بعد','gamepad')}
      
      <div class="section-title" style="margin-top:20px">${ic('clock','sm')} آخر 10 مباريات</div>
      ${matches.slice(0, 10).map(m=>`
        <div class="card" style="margin-bottom:8px;padding:11px">
          <div class="row">
            <div style="width:38px;height:38px;border-radius:12px;display:grid;place-items:center;
              background:${m.result==='win'?'rgba(34,197,94,.15)':'rgba(255,61,113,.15)'};
              color:${m.result==='win'?'var(--ok)':'var(--pink)'};font-weight:900;font-size:14px">
              ${m.result==='win'?'✓':'✗'}
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:12.5px;font-weight:800">${esc(m.gameName || 'Quiz Clash')}</div>
              <div class="muted" style="font-size:10px">${timeAgo(m.playedAt)}</div>
            </div>
            <div style="text-align:left">
              <div style="font-size:13px;font-weight:900;color:${m.result==='win'?'var(--ok)':'var(--pink)'}">
                ${m.myScore || 0} - ${m.opponentScore || 0}
              </div>
            </div>
          </div>
        </div>
      `).join('') || emptyState('لا مباريات بعد','gamepad')}
    `;
  } catch(e){
    console.error(e);
    return `<h1 class="page-title">📊 الإحصائيات</h1>${emptyState('خطأ في التحميل','chart')}`;
  }
}

/* ============================================================
   🔑 استعادة كلمة المرور
   ============================================================ */
document.getElementById('forgotPassBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  if(!email){ showAuthError('أدخل بريدك الإلكتروني أولاً'); return; }
  try {
    await sendPasswordResetEmail(auth, email);
    showAuthError('');
    toast('✓ تحقق من بريدك — تم إرسال رابط إعادة التعيين');
  } catch(e){
    const msgs = {
      'auth/user-not-found': 'لا يوجد حساب بهذا البريد',
      'auth/invalid-email': 'البريد غير صالح',
    };
    showAuthError(msgs[e.code] || 'فشل الإرسال — حاول مجدداً');
  }
});

/* ============ Event Handlers ============ */
document.addEventListener('click', async (e)=>{

  /* ============================================================
     1) معالجة اختيار الصور — قبل تعريف t
     ============================================================ */
  const imgEl = e.target.closest('[data-pick-image]');
  if(imgEl){
    const type = imgEl.dataset.pickImage;
    pickImage(type, (previewUrl)=>{
      const el = document.getElementById(
        type === 'post' ? 'postPreview' :
        type === 'avatar' ? 'avatarPreview' : 'coverPreview'
      );
      if(el){
        el.style.backgroundImage = `url(${previewUrl})`;
        el.classList.add('has-image');
      }
    });
    return;
  }

  /* ============================================================
     2) إيجاد العنصر المستهدف — ★ يجب أن يكون قبل أي استخدام لـ t
     ============================================================ */
const t = e.target.closest(
  '[data-nav],[data-action],[data-tab],[data-ptab],[data-follow],' +
  '[data-like],[data-save],[data-chat],[data-open-chat],[data-game-open],' +
  '[data-join-room],[data-leave-room],[data-create-room],[data-scat],[data-lb],' +
  '[data-toggle],[data-view-profile],[data-open-comments],[data-delete-comment],' +
  '[data-delete-post],[data-profile-like],[data-support],[data-buy-item],' +
  '[data-open-team],[data-join-team],[data-leave-team],[data-cust],' +
  '[data-cust-zone],' +
  '[data-toggle-tag],[data-inv-tab],[data-inv-item],[data-unequip],' +
  '[data-gift-tab],[data-team-tab],[data-edit-tab],[data-view-image],' +
  '[data-change-image],[data-delete-image],[data-block-user],[data-start-quiz],' +
  '[data-invite-room],[data-send-invite],[data-send-team-chat],[data-send-challenge],' +
  '[data-send-gift],[data-accept-challenge],[data-reject-challenge],[data-approve-join],' +
  '[data-reject-join],[data-kick-member],[data-promote],[data-request-join],' +
  '[data-set-theme],[data-set-frame],[data-view-tournament],[data-join-tournament],' +
  '[data-view-war],[data-declare-war],[data-play-war-match],[data-admin-tab],' +
  '[data-admin-ban],[data-admin-delete-post],[data-admin-dismiss],[data-report-target],' +
  '[data-notif-filter],[data-gift-id],[data-reason],[data-pick-image],' +
  '[data-post-menu],[data-reblog],[data-edit-post],[data-pin-post],' +
  '[data-set-visibility],[data-save-visibility],[data-admin-hide-post],' +
  '[data-toggle-trust],[data-warn-user],[data-warn-confirm],' +   // ★ جديد
  'button'
);

  /* 3) حماية null */
  if(!t) return;

if(t.dataset.closeModal) closeModal();

/* ★★ مناطق التخصيص التفاعلية (المستوى 1) ★★ */
/* فئة نشطة */
if(t.dataset.custZone){
  const zone = t.dataset.custZone;
  if(state.custActiveZone === zone){
    state.custActiveZone = null;
    state.custSubTab    = null;
    state.custFieldTab  = null;   // ★ امسح المستوى الثالث
  } else {
    state.custActiveZone = zone;
    const subs = ZONE_SUBTABS[zone] || [];
    state.custSubTab   = subs[0]?.id;
    state.custFieldTab = null;    // ★ امسح المستوى الثالث
  }
  render();
  return;
}

/* إغلاق الفئة (زر X) */
if(t.dataset.action === 'close-cust-zone'){
  state.custActiveZone = null;
  state.custSubTab     = null;
  state.custFieldTab   = null;    // ★ امسح المستوى الثالث
  render();
  return;
}

/* التبويبات الفرعية (المستوى 2) */
if(t.dataset.custSubtab){
  state.custSubTab   = t.dataset.custSubtab;
  state.custFieldTab = null;      // ★ إعادة تعيين المستوى الثالث
  document.querySelectorAll('.cust-sub-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.custSubtab === state.custSubTab);
  });
  applySubtabVisibility(state.custActiveZone);
  buildFieldNav(state.custActiveZone);   // ★ أعد بناء المستوى الثالث
  return;
}

/* ★★ التخصيص الفردي (المستوى 3) ★★ */
if(t.dataset.fieldTab){
  state.custFieldTab = t.dataset.fieldTab;
  applyFieldVisibility();
  return;
}

/* زر إعادة تعيين الفئة */
if(t.dataset.resetZone){
  await resetZone(t.dataset.resetZone);
  return;
}

/* زر معاينة البطاقة الكاملة */
if(t.dataset.action === 'preview-full'){
  await openFullPreviewModal();
  return;
}

/* زر إعادة تعيين الكل */
if(t.dataset.action === 'reset-all'){
  await resetAllCustomizations();
  return;
}

/* زر التواقيع */
if(t.dataset.action === 'open-signature'){
  await openSignatureModal(t.dataset.uid);
  return;
}
if(t.id === 'submitSigBtn'){
  await submitSignature(t.dataset.uid);
  return;
}

/* إغلاق الفئة */
if(t.dataset.action === 'close-cust-zone'){
  state.custActiveZone = null;
  state.custSubTab = null;
  render();
  return;
}

/* ✍️ التواقيع */
if(t.dataset.action === 'open-signature'){
  await openSignatureModal(t.dataset.uid);
  return;
}
if(t.id === 'submitSigBtn'){
  await submitSignature(t.dataset.uid);
  return;
}

/* 🖼️ المعاينة الكاملة */
if(t.dataset.action === 'preview-profile'){
  await openFullPreviewModal();
  return;
}
if(t.dataset.action === 'save-preview'){
  await saveProfilePreview();
  return;
}
if(t.dataset.action === 'share-preview'){
  await shareProfilePreview();
  return;
}

if(t.dataset.action === 'close-cust-zone'){
  state.custActiveZone = null;
  refreshCustOptions();
updateZonePreview();
  return;
}

if(t.dataset.action === 'show-plans'){
  openSubscriptionPlansModal();
  return;
}

  /* ★★★ زر الرجوع العائم ★★★ */
  if(t.dataset.action === 'go-back'){
    goBack();
    return;
  }

if(t.dataset.action === 'go-back'){ goBack(); return; }

  /* ============================================================
     5) ★★★ المعالجات الجديدة — الآن بعد تعريف t (TDZ FIXED)
     ============================================================ */
  if(t.dataset.action === 'show-followers'){
    await openFollowersModal(t.dataset.uid, t.dataset.type);
    return;
  }
  if(t.dataset.action === 'show-interactions'){
    await openInteractionsModal(t.dataset.uid, t.dataset.type);
    return;
  }

  /* ============================================================
     6) شراء اشتراك
     ============================================================ */
  if(t.dataset.buyPlan){
    await purchaseSubscription(t.dataset.buyPlan);
    return;
  }

  /* ============================================================
     7) شراء إطار حصري
     ============================================================ */
  if(t.dataset.buyFrame){
    const frameId = t.dataset.buyFrame;
    const frame = ANIMATED_FRAMES[frameId];
    if(!frame) return;
    if(frame.tier !== 'exclusive'){
      toast('🔒 هذا الإطار يحتاج اشتراك — اشترك أولاً');
      return;
    }
    const alreadyOwned = (state.profile.ownedItems || []).includes(`frame_${frameId}`);
    if(alreadyOwned){
      await applyFrame(frameId);
      return;
    }
    await purchaseExclusiveItem(`frame_${frameId}`, 'frame', frame.price);
    return;
  }

  /* ============================================================
     8) Upsell — بلس / بلس دبل
     ============================================================ */
  if(t.dataset.action === 'upsell-plus'){
    openModal(`
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:48px">💎</div>
        <h3 style="margin-top:8px">يتطلب اشتراك بلس</h3>
        <div class="muted">افتح الألوان المخصصة، الموسيقى، تأثيرات الغلاف، وأكثر</div>
      </div>
      <button class="btn btn-primary" style="width:100%;margin-bottom:8px" data-buy-plan="plus">
        اشتراك بلس — ${nf(SUBSCRIPTION_PLANS.plus.price)} عملة / 30 يوم
      </button>
      <button class="btn btn-ghost" style="width:100%" data-action="modal-close">إغلاق</button>
    `);
    return;
  }
  if(t.dataset.action === 'upsell-plus2'){
    openModal(`
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:48px">👑</div>
        <h3 style="margin-top:8px">يتطلب بلس دبل</h3>
        <div class="muted">افتح كل شيء — تخطيطات، ألوان اللقب، وأكثر</div>
      </div>
      <button class="btn btn-primary" style="width:100%;margin-bottom:8px" data-buy-plan="plus2">
        اشتراك بلس دبل — ${nf(SUBSCRIPTION_PLANS.plus2.price)} عملة / 60 يوم
      </button>
      <button class="btn btn-ghost" style="width:100%" data-action="modal-close">إغلاق</button>
    `);
    return;
  }

  /* ============================================================
     9) المكافأة اليومية
     ============================================================ */
  if(t.dataset.nav === '_daily'){
    closeDrawer();
    await checkDailyReward();
    openDailyRewardModal();
    return;
  }
  if(t.dataset.nav === '_challenges'){
    closeDrawer();
    await openChallengesModal();
    return;
  }

  /* ============================================================
     10) مودال إجراءات اللاعب
     ============================================================ */
  if(t.dataset.action === 'profile-actions'){
    openProfileActionsModal(t.dataset.uid);
    return;
  }

  /* ============================================================
     11) نقر الأفاتار / الغلاف
     ============================================================ */
  if(t.dataset.action === 'avatar-click'){ openImageActionsModal('avatar'); return; }
  if(t.dataset.action === 'cover-click'){  openImageActionsModal('cover');  return; }

  /* ============================================================
     12) استوديو التخصيص (مع فحص الأذونات)
     ============================================================ */
if(t.dataset.cust){
  const field = t.dataset.cust;
  const val = t.dataset.val;

  // فحوصات الأذونات (كما هي)
  if(field === 'avatarShape' && !canCustomizeShape(state.profile)){ toast('🔒 شكل الصورة يتطلب اشتراك'); return; }
    if(field === 'avatarBorder'   && !canCustomizeBorder(state.profile))   { toast('🔒 حدود الصورة تتطلب اشتراك'); return; }
    if(field === 'avatarBorderColor' && !canCustomizeBorder(state.profile)){ toast('🔒 لون الحدود يتطلب اشتراك'); return; }
    if(field === 'nameColor'      && !canCustomizeNameColor(state.profile)){ toast('🔒 لون الاسم يتطلب بلس'); return; }
    if(field === 'usernameColor'  && !canCustomizeUsernameColor(state.profile)){ toast('🔒 لون اسم المستخدم يتطلب بلس'); return; }
    if(field === 'titleColor'     && !canCustomizeTitleColor(state.profile)){ toast('🔒 لون اللقب يتطلب بلس دبل'); return; }
    if(field === 'profileLayout'  && !canUseLayoutCustomization(state.profile)){ toast('🔒 التخطيط يتطلب بلس دبل'); return; }
    if(field === 'bannerEffect'   && !canUseBannerEffect(state.profile))   { toast('🔒 تأثيرات الغلاف تتطلب بلس'); return; }
    if(field === 'accentColor'    && getSubscription(state.profile).features.maxCustomColors === 0){
      toast('🔒 اللون المميز يتطلب بلس'); return;
    }

  const ok = await saveCustomField(field, val);
  if(ok){
    document.querySelectorAll(`[data-cust="${field}"]`).forEach(el => {
      el.classList.toggle('active', el.dataset.val === val);
    });
    // ★ الحقول الشرطية تحتاج إعادة رسم كامل
    if(CONDITIONAL_FIELDS.includes(field)){
      renderKeepScroll();
    }
  }
  return;
}

  /* ============================================================
     13) حفظ موسيقى الملف
     ============================================================ */
  if(t.id === 'saveMusicBtn'){
    const url = document.getElementById('musicUrlInput')?.value.trim() || '';
    const ok = await saveCustomField('musicUrl', url);
    if(ok) toast('تم الحفظ ✓');
    return;
  }

  /* ============================================================
     14) منتقي الألوان المخصص
     ============================================================ */
  if(t.id === 'avatarBorderColorPicker'){
    t.addEventListener('change', async (ev)=>{
      await saveCustomField('avatarBorderColor', ev.target.value);
updateZonePreview();
    }, { once: false });
    return;
  }
  if(t.id === 'accentColorPicker'){
    t.addEventListener('change', async (ev)=>{
      await saveCustomField('accentColor', ev.target.value);
updateZonePreview();
    }, { once: false });
    return;
  }

  /* ============================================================
     15) إجراءات الصورة (عرض/تغيير/حذف)
     ============================================================ */
  /* ============================================================
     15) إجراءات الصورة (عرض/تغيير/حذف/اقتصاص)
     ============================================================ */
  if(t.dataset.viewImage){
    const url = t.dataset.viewImage === 'avatar'
      ? state.profile?.avatarUrl : state.profile?.coverUrl;
    openImageViewerModal(url);
    return;
  }
  if(t.dataset.changeImage){ await changeProfileImage(t.dataset.changeImage); return; }
  if(t.dataset.deleteImage){ await deleteProfileImage(t.dataset.deleteImage); return; }

  /* ★★ جديد: إعادة اقتصاص الغلاف ★★ */
  if(t.dataset.recropCover){
    await recropCover();
    return;
  }

  /* ============================================================
     16) حظر مستخدم
     ============================================================ */
  if(t.dataset.blockUser){ await toggleBlockUser(t.dataset.blockUser); return; }

  /* ============================================================
     17) التنقل العام
     ============================================================ */
  if(t.dataset.nav){
    if(t.dataset.reset === 'chat') state.chatWith = null;
    if(t.dataset.reset === 'game') state.activeGame = null;
    if(t.dataset.nav === 'more'){ openDrawer(); return; }
    go(t.dataset.nav);
    return;
  }

  /* ============================================================
     18) إجراءات عامة (فتح/إغلاق/توست/مودالات)
     ============================================================ */
  if(t.dataset.action === 'close-drawer'){ closeDrawer(); return; }
  if(t.dataset.action === 'modal-close'){ closeModal(); return; }
  if(t.dataset.action === 'toast'){ toast(t.dataset.msg || ''); return; }
  if(t.dataset.action === 'compose'){ composeModal(); return; }
  if(t.dataset.action === 'edit-profile'){ editProfileModal(); return; }
  if(t.dataset.action === 'create-team'){ createTeamModal(); return; }
  if(t.dataset.action === 'leave-team'){ await leaveTeam(); return; }
  if(t.dataset.action === 'back-to-teams'){ state.viewingTeamId = null; render(); return; }

  /* ============================================================
     19) إعادة محاولة تحميل الملف الشخصي (مفصولة الآن)
     ============================================================ */
  if(t.dataset.action === 'retry-profile'){
    toast('جاري إعادة المحاولة…');
    getDoc(doc(db,'users',state.user.uid)).then(s => {
      if(s.exists()){
        state.profile = s.data();
        renderTopbar();
        render();
        toast('تم التحميل ✓');
      } else {
        toast('لم يتم العثور على الملف');
      }
    }).catch(e => {
      console.error(e);
      toast('فشل التحميل — تحقق من الاتصال');
    });
    return;
  }

  /* ============================================================
     20) ★★★ المكافأة اليومية (كانت محشورة داخل retry-profile)
     ============================================================ */
  if(t.id === 'claimDailyBtn'){ await claimDailyReward(); return; }
  if(t.dataset.action === 'show-daily'){ openDailyRewardModal(); return; }

  /* ============================================================
     21) حالة اللاعب
     ============================================================ */
  if(t.dataset.action === 'edit-status'){ openStatusPickerModal(); return; }
  if(t.id === 'saveStatusBtn'){
    const status = t.dataset.pendingStatus || 'available';
    const msg = document.getElementById('statusMsgInput')?.value.trim() || '';
    await setPlayerStatus(status, msg);
    return;
  }

  /* ============================================================
     22) التحديات
     ============================================================ */
  if(t.dataset.action === 'show-challenges'){ await openChallengesModal(); return; }
  if(t.dataset.sendChallenge){ await sendChallenge(t.dataset.sendChallenge); return; }
  if(t.dataset.acceptChallenge){ await acceptChallenge(t.dataset.acceptChallenge); return; }
  if(t.dataset.rejectChallenge){ await rejectChallenge(t.dataset.rejectChallenge); return; }

  /* ============================================================
     23) المقتنيات
     ============================================================ */
  if(t.dataset.invTab){ state.invTab = t.dataset.invTab; render(); return; }
  if(t.dataset.invItem){
    const cat = t.dataset.invCat;
    const id = t.dataset.invItem;
    const equipped = (state.profile?.equipped || {})[cat] === id;
    if(equipped) await unequipItem(cat);
    else await equipItem(id, cat);
    return;
  }
  if(t.dataset.unequip){ await unequipItem(t.dataset.unequip); return; }

  /* ============================================================
     24) طلبات الفرق والرتب
     ============================================================ */
  if(t.dataset.requestJoin){ await requestJoinTeam(t.dataset.requestJoin); return; }
  if(t.dataset.approveJoin){ await approveJoinRequest(t.dataset.teamId, t.dataset.approveJoin); return; }
  if(t.dataset.rejectJoin){ await rejectJoinRequest(t.dataset.teamId, t.dataset.rejectJoin); return; }
  if(t.dataset.kickMember){ await kickMember(t.dataset.teamId, t.dataset.kickMember); return; }
  if(t.dataset.promote){ await setTeamRole(t.dataset.teamId, t.dataset.promote, t.dataset.role); return; }

  /* ============================================================
     25) Quiz Clash
     ============================================================ */
  if(t.dataset.startQuiz){
    await startQuizMatch(t.dataset.startQuiz, true);
    return;
  }
  if(t.dataset.inviteRoom){
    await openInviteMatchModal(t.dataset.inviteRoom);
    return;
  }
  if(t.dataset.sendInvite){
    await inviteFriendToMatch(t.dataset.sendInvite, t.dataset.roomId);
    closeModal();
    return;
  }

  /* ============================================================
     26) محادثة الفريق
     ============================================================ */
  if(t.dataset.sendTeamChat){
    await sendTeamChat(t.dataset.sendTeamChat);
    return;
  }
  if(t.dataset.teamTab){
    state.viewingTeamTab = t.dataset.teamTab;
    render();
    return;
  }

  /* ============================================================
     27) تبويبات الصفحة الرئيسية والملف
     ============================================================ */
  if(t.dataset.tab){ state.homeTab = t.dataset.tab; render(); return; }
  if(t.dataset.ptab){
    const tabsEl = document.querySelector('.tabs.scrollable');
    state._tabsScroll = tabsEl ? tabsEl.scrollLeft : 0;
    state.profileTab = t.dataset.ptab;
    render();
    return;
  }

  /* ============================================================
     28) التفاعلات (متابعة/إعجاب/حفظ/دعم)
     ============================================================ */
  if(t.dataset.follow){ await toggleFollow(t.dataset.follow); return; }
  if(t.dataset.like){ await toggleLike(t.dataset.like); return; }
  if(t.dataset.save){ await toggleSave(t.dataset.save); return; }
  if(t.dataset.profileLike){ await toggleProfileLike(t.dataset.profileLike); return; }
  if(t.dataset.support){ await sendSupport(t.dataset.support); return; }

  /* ============================================================
     29) عرض الملف الشخصي
     ============================================================ */
  if(t.dataset.viewProfile){
    state.profileTab = 'posts';
    if(t.dataset.viewProfile === state.user.uid){ go('profile'); return; }
    go('userprofile', { viewingUid: t.dataset.viewProfile });
    return;
  }

  /* ============================================================
     30) التعليقات
     ============================================================ */
  if(t.dataset.openComments){ await openCommentsModal(t.dataset.openComments); return; }
  if(t.dataset.deleteComment){
    await deleteComment(t.dataset.postId, t.dataset.deleteComment);
    const comments = state.comments[t.dataset.postId] || [];
    const listEl = document.getElementById('commentsList');
    if(listEl){
      listEl.innerHTML = comments.length ? comments.map(c=>`
        <div class="comment-item">
          ${avatar(c.author, 36)}
          <div class="comment-body">
            <div class="comment-name">${esc(c.author?.name||'')} <span class="comment-time">${timeAgo(c.createdAt)}</span></div>
            <div class="comment-text">${esc(c.text)}</div>
          </div>
          ${c.authorId === state.user.uid
            ? `<button class="icon-btn" style="width:28px;height:28px;background:transparent;border:0;color:var(--muted)" data-delete-comment="${c.id}" data-post-id="${t.dataset.postId}">${ic('trash','xs')}</button>`
            : ''}
        </div>`).join('') : `<div class="empty" style="padding:30px 0">${ic('comment')}<div>لا تعليقات بعد</div></div>`;
    }
    return;
  }
  if(t.dataset.deletePost){ await deletePost(t.dataset.deletePost); return; }

  /* ============================================================
     31) المحادثات
     ============================================================ */
  if(t.dataset.chat){ await openChat(t.dataset.chat); return; }
  if(t.dataset.openChat){ await openChat(t.dataset.openChat); return; }

  /* ============================================================
     32) الألعاب والغرف
     ============================================================ */
  if(t.dataset.gameOpen){ go('games', { activeGame: t.dataset.gameOpen }); return; }
  if(t.id === 'matchmakingBtn'){ startMatchmaking(t.dataset.game); return; }
  if(t.id === 'createRoomBtn'){ createRoom(t.dataset.game); return; }
  if(t.dataset.createRoom){ await confirmCreateRoom(t.dataset.createRoom); return; }
  if(t.dataset.joinRoom){ await joinRoom(t.dataset.joinRoom); return; }
  if(t.dataset.leaveRoom){ await leaveRoom(t.dataset.leaveRoom); return; }

  /* ============================================================
     33) البحث / الصدارة / الإعدادات
     ============================================================ */
  if(t.dataset.scat){ state.searchCat = t.dataset.scat; render(); return; }
  if(t.dataset.lb){ state.lbTab = t.dataset.lb; render(); return; }
  if(t.dataset.toggle){ state.settings[t.dataset.toggle] = !state.settings[t.dataset.toggle]; render(); return; }

  /* ============================================================
     34) تسجيل الخروج
     ============================================================ */
  if(t.id === 'confirmLogout'){ await handleLogout(); return; }

  /* ============================================================
     35) إرسال رسالة الدردشة
     ============================================================ */
  if(t.id === 'sendMsgBtn'){
    const inp = document.getElementById('msgInput');
    const txt = inp?.value.trim();
    if(!txt || !state.chatWith) return;
    const chatId = [state.user.uid, state.chatWith].sort().join('_');
    inp.value = '';
    try { await sendMessage(chatId, txt); } catch(err){ toast('فشل الإرسال'); }
    return;
  }

  /* ============================================================
     36) إرسال تعليق
     ============================================================ */
  if(t.id === 'sendCommentBtn'){
    const inp = document.getElementById('commentInput');
    const txt = inp?.value.trim();
    if(!txt) return;
    inp.value = '';
    await addComment(t.dataset.postId, txt);
    const comments = state.comments[t.dataset.postId] || [];
    const listEl = document.getElementById('commentsList');
    if(listEl){
      listEl.innerHTML = comments.length ? comments.map(c=>`
        <div class="comment-item">
          ${avatar(c.author, 36)}
          <div class="comment-body">
            <div class="comment-name">${esc(c.author?.name||'')} <span class="comment-time">${timeAgo(c.createdAt)}</span></div>
            <div class="comment-text">${esc(c.text)}</div>
          </div>
          ${c.authorId === state.user.uid
            ? `<button class="icon-btn" style="width:28px;height:28px;background:transparent;border:0;color:var(--muted)" data-delete-comment="${c.id}" data-post-id="${t.dataset.postId}">${ic('trash','xs')}</button>`
            : ''}
        </div>`).join('') : `<div class="empty" style="padding:30px 0">${ic('comment')}<div>لا تعليقات بعد</div></div>`;
      listEl.scrollTop = listEl.scrollHeight;
    }
    return;
  }

  /* ============================================================
     37) نشر منشور / حفظ الملف / إنشاء فريق
     ============================================================ */
  if(t.id === 'submitPost'){
    const txt = document.getElementById('composeText').value.trim();
    if(!txt && !state.pendingImages.post){ toast('اكتب شيئاً أو أضف صورة'); return; }
    await createPost({ text: txt });
    return;
  }
  if(t.id === 'saveProfileBtn'){ await saveProfileData(); return; }

  if(t.id === 'createTeamBtn'){
    const name = document.getElementById('teamName').value.trim();
    const emblem = document.getElementById('teamEmblem').value.trim() || '🛡️';
    const desc = document.getElementById('teamDesc').value.trim();
    if(!name){ toast('الاسم مطلوب'); return; }
    await createTeam(name, emblem, desc);
    closeModal();
    return;
  }

  /* ============================================================
     38) المتجر / الفرق
     ============================================================ */
  if(t.dataset.buyItem){
    const item = STORE.find(x => x.id === t.dataset.buyItem);
    if(item) await buyItem(item);
    return;
  }
  if(t.dataset.openTeam){ state.viewingTeamId = t.dataset.openTeam; render(); return; }
  if(t.dataset.joinTeam){ await joinTeam(t.dataset.joinTeam); return; }

  /* ============================================================
     39) البطولات
     ============================================================ */
  if(t.dataset.action === 'create-tournament'){ openCreateTournamentModal(); return; }
  if(t.dataset.viewTournament){ go('tournaments', { viewingTournamentId: t.dataset.viewTournament }); return; }
  if(t.dataset.joinTournament){ await joinTournament(t.dataset.joinTournament); render(); return; }
  if(t.dataset.action === 'back-from-tournament'){ state.viewingTournamentId = null; render(); return; }
  if(t.id === 'confirmCreateTournament'){
    const name = document.getElementById('tnName').value.trim();
    const size = document.getElementById('tnSize').value;
    const coins = document.getElementById('tnCoins').value;
    if(!name) return toast('الاسم مطلوب');
    const id = await createTournament(name, size, coins);
    closeModal();
    if(id) go('tournaments', { viewingTournamentId: id });
    return;
  }

  /* ============================================================
     40) الحروب
     ============================================================ */
  if(t.dataset.viewWar){ state.viewingWarId = t.dataset.viewWar; go('war'); return; }
  if(t.dataset.action === 'back-from-war'){ state.viewingWarId = null; render(); return; }
  if(t.dataset.declareWar){ await declareWar(t.dataset.declareWar); return; }
  if(t.dataset.playWarMatch){
    toast('ستبدأ مباراة — النقاط تُضاف للحرب');
    setTimeout(()=>startMatchmaking('g3'), 500);
    return;
  }

  /* ============================================================
     41) الإشعارات
     ============================================================ */
  if(t.dataset.notifFilter){ state.notifFilter = t.dataset.notifFilter; render(); return; }

  /* ============================================================
     42) الإعدادات
     ============================================================ */
  if(t.dataset.action === 'save-settings'){ await saveSettings(); return; }

  /* ============================================================
     43) الإبلاغ
     ============================================================ */
  if(t.dataset.reportTarget){ openReportModal(t.dataset.reportType, t.dataset.reportTarget); return; }
  if(t.id === 'confirmReport'){
    const reason = document.querySelector('.report-option.selected')?.dataset.reason;
    const details = document.getElementById('reportDetails')?.value.trim() || '';
    if(!reason) return toast('اختر سبباً');
    await reportContent(t.dataset.reportType, t.dataset.reportTarget, reason, details);
    closeModal();
    return;
  }

  /* ============================================================
     44) الهدايا
     ============================================================ */
  if(t.dataset.sendGift){ openSendGiftModal(t.dataset.sendGift); return; }
  if(t.dataset.giftTab){ state.giftTab = t.dataset.giftTab; render(); return; }

  /* ============================================================
     45) المواسم
     ============================================================ */
  if(t.dataset.action === 'admin-season-end'){ await endCurrentSeason(); return; }

  /* ============================================================
     46) التخصيص (ثيم / إطار)
     ============================================================ */
  if(t.dataset.setTheme){
    if(!canCustomizeTheme(state.profile)){
      toast('🔒 الثيم يتطلب اشتراك'); return;
    }
    await applyTheme(t.dataset.setTheme);
    return;
  }
  if(t.dataset.setFrame){
    const frameId = t.dataset.setFrame;
    if(!canUseFrame(state.profile, frameId)){
      toast('🔒 هذا الإطار مقفل'); return;
    }
    await applyFrame(frameId);
    return;
  }

  /* ============================================================
     47) الإدارة
     ============================================================ */
  if(t.dataset.adminTab){ state.adminTab = t.dataset.adminTab; render(); return; }
  if(t.dataset.action === 'admin-refresh'){ state.reports = []; await loadSeasonInfo(); render(); toast('تم التحديث'); return; }
  if(t.dataset.adminBan){ await adminBanUser(t.dataset.adminBan, t.dataset.adminBanned === '1'); return; }
  if(t.dataset.adminDeletePost){
    await adminDeletePost(t.dataset.adminDeletePost, t.dataset.adminReport || null);
    return;
  }
  if(t.dataset.adminDismiss){ await adminDismissReport(t.dataset.adminDismiss); return; }
  /* ============================================================
     48) ★★★ خيارات المنشورات (جديد)
     ============================================================ */
  if(t.dataset.postMenu){ openPostActionsModal(t.dataset.postMenu); return; }
  if(t.dataset.reblog){ await toggleReblog(t.dataset.reblog); closeModal(); return; }
  if(t.dataset.editPost){ editPostModal(t.dataset.editPost); return; }
  if(t.dataset.pinPost){ await togglePinPost(t.dataset.pinPost); return; }
  if(t.dataset.setVisibility){ openVisibilityPicker(t.dataset.setVisibility); return; }
  if(t.dataset.saveVisibility){ await savePostVisibility(t.dataset.postId, t.dataset.saveVisibility); return; }
  if(t.dataset.adminHidePost){ await adminHidePost(t.dataset.adminHidePost); return; }

  /* حفظ تعديل المنشور */
  if(t.id === 'savePostEditBtn'){ await savePostEdit(t.dataset.postId); return; }

  /* ============================================================
     49) ★★★ الثقة والتحذيرات (جديد)
     ============================================================ */
  if(t.dataset.toggleTrust){ await toggleTrust(t.dataset.toggleTrust); closeModal(); return; }
  if(t.dataset.warnUser){ openAdminWarnModal(t.dataset.warnUser); return; }
  if(t.dataset.warnConfirm){
    const reason = document.getElementById('warnReason')?.value.trim();
    await adminWarnUser(t.dataset.warnConfirm, reason);
    closeModal();
    return;
  }

});  // ← الإغلاق النهائي

/* Input events */
document.addEventListener('input', async (e)=>{

  /* ===== البحث (يبقى كما هو) ===== */
  if(e.target.id === 'searchInput'){
    state.searchQ = e.target.value;
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(renderSearchResults, 200);
    return;
  }

  /* ===== منتقي لون الاسم ===== */
  if(e.target.id === 'nameColorPicker'){
    if(!canCustomizeNameColor(state.profile)) return;
    await saveCustomField('nameColor', e.target.value);
    const box = document.getElementById('custPreviewBox');
    if(box) box.innerHTML = renderCustomizationPreview();
    return;
  }

  /* ===== سماكة حدود الأفاتار ===== */
  if(e.target.id === 'avatarBorderWidthSlider'){
    await saveCustomField('avatarBorderWidth', parseInt(e.target.value));
updateZonePreview();
    const valEl = document.getElementById('borderWidthVal');
    if(valEl) valEl.textContent = e.target.value + 'px';
    return;
  }

  /* ===== دوران الأفاتار ===== */
  if(e.target.id === 'avatarRotationSlider'){
    await saveCustomField('avatarRotation', parseInt(e.target.value));
    const b = document.getElementById('custPreviewBox');
    if(b) b.innerHTML = renderCustomizationPreview();
    const v = document.getElementById('rotationVal');
    if(v) v.textContent = e.target.value + '°';
    return;
  }

  /* ===== حجم الأفاتار ===== */
  if(e.target.id === 'avatarScaleSlider'){
    await saveCustomField('avatarScale', parseFloat(e.target.value));
    const b = document.getElementById('custPreviewBox');
    if(b) b.innerHTML = renderCustomizationPreview();
    const v = document.getElementById('scaleVal');
    if(v) v.textContent = Math.round(parseFloat(e.target.value) * 100) + '%';
    return;
  }

  /* ===== ضبابية الغلاف ===== */
  if(e.target.id === 'coverBlurSlider'){
    await saveCustomField('coverBlur', parseInt(e.target.value));
    const b = document.getElementById('custPreviewBox');
    if(b) b.innerHTML = renderCustomizationPreview();
    const v = document.getElementById('blurVal');
    if(v) v.textContent = e.target.value + 'px';
    return;
  }

  /* ===== تعتيم الغلاف ===== */
  if(e.target.id === 'coverOverlaySlider'){
    await saveCustomField('coverOverlay', parseInt(e.target.value));
    const b = document.getElementById('custPreviewBox');
    if(b) b.innerHTML = renderCustomizationPreview();
    const v = document.getElementById('overlayVal');
    if(v) v.textContent = e.target.value + '%';
    return;
  }

  /* ===== ألوان إضافية ===== */
  if(e.target.id === 'usernameColorPicker'){
    if(!canCustomizeUsernameColor(state.profile)) return;
    await saveCustomField('usernameColor', e.target.value);
    const box = document.getElementById('custPreviewBox');
    if(box) box.innerHTML = renderCustomizationPreview();
    return;
  }

  if(e.target.id === 'titleColorPicker'){
    if(!canCustomizeTitleColor(state.profile)) return;
    await saveCustomField('titleColor', e.target.value);
    const box = document.getElementById('custPreviewBox');
    if(box) box.innerHTML = renderCustomizationPreview();
    return;
  }

  if(e.target.id === 'avatarBorderColorPicker'){
    await saveCustomField('avatarBorderColor', e.target.value);
updateZonePreview();
    return;
  }

  if(e.target.id === 'accentColorPicker'){
    await saveCustomField('accentColor', e.target.value);
updateZonePreview();
    return;
  }

});  // ← لا تحذف هذا الإغلاق

/* Enter to send */
document.addEventListener('keydown', (e)=>{
  if(e.target.id === 'msgInput' && e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    document.getElementById('sendMsgBtn')?.click();
  }
  if(e.target.id === 'commentInput' && e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    document.getElementById('sendCommentBtn')?.click();
  }
});

/* Auth */
document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.getElementById('signupForm').addEventListener('submit', handleSignup);
document.getElementById('googleBtn').addEventListener('click', handleGoogle);

document.querySelectorAll('.auth-tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const t = tab.dataset.tab;
    document.getElementById('loginForm').classList.toggle('hidden', t !== 'login');
    document.getElementById('signupForm').classList.toggle('hidden', t !== 'signup');
    showAuthError('');
  });
});