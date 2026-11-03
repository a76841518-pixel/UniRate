/* ============================================================
   نكسوس — v2.0 (Image Upload + Comments + Teams + Store)
   ============================================================ */

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
};
function ic(name, cls=''){ return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||''}</svg>`; }

/* ============ Static Data ============ */
const GAMES = [
  {id:'g1', name:'Arena Clash', cat:'قتال جماعي', icon:'bolt', online:'12.4K', grad:'linear-gradient(135deg,#6c5ce7,#ff3d71)', modes:['1v1','5v5','تعاوني']},
  {id:'g2', name:'Word Duel', cat:'كلمات', icon:'comment', online:'8.1K', grad:'linear-gradient(135deg,#00d2ff,#22c55e)', modes:['1v1','فرق']},
  {id:'g3', name:'Brain Sprint', cat:'ألغاز', icon:'star', online:'5.7K', grad:'linear-gradient(135deg,#f5b301,#ff3d71)', modes:['فردي','تعاوني']},
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
function avatar(u, size=44, extra='', square=false){
  if(!u) return `<div class="av" style="--s:${size}px;background:#333"></div>`;
  const init = (u.name||u.displayName||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('');
  const bg = u.grad || pickGrad(u.uid||u.id||u.name||'');
  const img = u.avatarUrl ? `<img src="${esc(u.avatarUrl)}" alt="">` : init;
  return `<div class="av ${square?'sq':''} ${extra}" style="--s:${size}px;background:${bg}">${img}</div>`;
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
function go(page, opt={}){
  if(state.page === 'messages' && page !== 'messages' && state.chatUnsub){
    try { state.chatUnsub(); } catch(e){}
    state.chatUnsub = null; state.chatWith = null;
  }
  state.page = page;
  Object.assign(state, opt);
  closeDrawer();
  window.scrollTo({top:0});
  render();
}

/* ============ Bottom Nav ============ */
const NAV = [
  {id:'home', icon:'home', label:'الرئيسية'},
  {id:'messages', icon:'message', label:'الرسائل'},
  {id:'games', icon:'gamepad', label:'الألعاب'},
  {id:'teams', icon:'users', label:'الفرق'},
  {id:'store', icon:'store', label:'المتجر'},
  {id:'more', icon:'menu', label:'المزيد'},
];
function renderNav(){
  document.getElementById('bottombar').innerHTML = NAV.map(n=>`
    <button class="nav-btn ${state.page===n.id?'active':''}" data-nav="${n.id}">
      ${ic(n.icon)}<span>${n.label}</span>
    </button>`).join('');
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
}

/* ============ Drawer ============ */
const MORE_ITEMS = [
  {id:'closefriends', icon:'heart', label:'المقربون', desc:'أقرب 10 لاعبين'},
  {id:'inventory', icon:'store', label:'مقتنياتي', desc:'كل مشترياتك وتجهيزاتك'},
  {id:'_daily', icon:'star', label:'المكافأة اليومية', desc:'استلم مكافأتك'},
  {id:'leaderboard', icon:'trophy', label:'لوحة الصدارة', desc:'ترتيب اللاعبين'},
  {id:'achievements', icon:'medal', label:'الإنجازات', desc:'أوسمة وتحديات'},
  {id:'stats', icon:'chart', label:'الإحصائيات', desc:'أرقامك'},
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
function closeModal(){
  const root = document.getElementById('modalRoot');
  if(state.mmInterval){ clearInterval(state.mmInterval); state.mmInterval = null; }
  state.pendingImages = { avatar:null, cover:null, post:null };
  root.innerHTML = '';
}

/* ============ Auth ============ */
function showScreen(id){
  ['loader','setupScreen','authScreen','appShell'].forEach(s=>{
    document.getElementById(s).classList.toggle('hidden', s !== id);
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
      uid:cred.user.uid, name, username, email,
      bio:'مرحباً، أنا جديد في نكسوس!',
      avatarUrl:'', coverUrl:'', grad: pickGrad(cred.user.uid),
      teamId:'', teamName:'', teamEmblem:'',
      level:1, xp:0, fame:0, power:0, support:0,
      likesProfile:0, likesGames:0, followers:0, following:0,
      coins:1000, role:'user', createdAt: serverTimestamp()
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
        uid:cred.user.uid, name: cred.user.displayName||'مستخدم', username,
        email: cred.user.email, bio:'مرحباً!', avatarUrl: cred.user.photoURL||'',
        coverUrl:'', grad: pickGrad(cred.user.uid),
        teamId:'', teamName:'', teamEmblem:'',
        level:1, xp:0, fame:0, power:0, support:0,
        likesProfile:0, likesGames:0, followers:0, following:0,
        coins:1000, role:'user', createdAt: serverTimestamp()
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

    // ★ جديد: تحميل الملف الشخصي مباشرة (getDoc) قبل أي شيء
    // هذا يعمل من الكاش المحلي = فوري، ويضمن أن state.profile ليس null
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        state.profile = snap.data();
      } else {
        console.warn('User document missing, creating placeholder...');
        // إنشاء مستند احتياطي إذا لم يوجد
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
          coins: 1000, role: 'user',
          createdAt: serverTimestamp()
        });
        const snap2 = await getDoc(doc(db, 'users', user.uid));
        if (snap2.exists()) state.profile = snap2.data();
      }
    } catch (e) {
      console.error('Initial profile load failed:', e);
    }

    // الآن أنشئ المستمعين
    attachListeners();

    // ★ الإصلاح الأساسي: اعرض الصفحة فوراً
    render();
    // افحص وجود مباراة نشطة
setTimeout(checkActiveMatch, 2000);
// ★ افحص المكافأة اليومية وأظهرها
setTimeout(async ()=>{
  await checkDailyReward();
  if(state.dailyReward?.available){
    // انتظر قليلاً ثم افتح النافذة
    setTimeout(openDailyRewardModal, 1500);
  }
}, 1000);
  } else {
    state.user = null;
    state.profile = null;
    detachListeners();
    showScreen('authScreen');
  }
});
} else {
  showScreen('setupScreen');
}

/* ============ Listeners ============ */
function detachListeners(){
  state.unsubs.forEach(u=>{ try{u();}catch(e){} });
  state.unsubs = [];
  if(state.chatUnsub){ try{state.chatUnsub();}catch(e){} state.chatUnsub = null; }
  if(state.mmInterval){ clearInterval(state.mmInterval); state.mmInterval = null; }
}

function attachListeners(){
  detachListeners();

state.unsubs.push(onSnapshot(
  doc(db, 'users', state.user.uid),
  snap => {
    if (snap.exists()) {
      state.profile = snap.data();
      renderTopbar();
      if (['profile','stats','settings','userprofile'].includes(state.page)) render();
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
    state.posts = snap.docs.map(d=>({id:d.id, ...d.data()}));
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
  const followId = `${state.user.uid}_${targetId}`;
  const followRef = doc(db,'follows',followId);
  const snap = await getDoc(followRef);
  try {
    if(snap.exists()){
      await deleteDoc(followRef);
      await updateDoc(doc(db,'users',state.user.uid), { following: increment(-1) });
      await updateDoc(doc(db,'users',targetId), { followers: increment(-1) });
    } else {
      await setDoc(followRef, { followerId: state.user.uid, followingId: targetId, createdAt: serverTimestamp() });
      await updateDoc(doc(db,'users',state.user.uid), { following: increment(1) });
      await updateDoc(doc(db,'users',targetId), { followers: increment(1) });
      await notify(targetId, 'follow', `<b>${esc(state.profile.name)}</b> بدأ متابعتك`);
    }
  } catch(e){ toast('تعذّر التحديث'); }
}

async function toggleProfileLike(targetUid){
  if(targetUid === state.user.uid) return toast('لا يمكنك إعجاب ملفك');
  const likeRef = doc(db,'profileLikes',`${state.user.uid}_${targetUid}`);
  const snap = await getDoc(likeRef);
  try {
    if(snap.exists()){
      await deleteDoc(likeRef);
      await updateDoc(doc(db,'users',targetUid), { likesProfile: increment(-1) });
      toast('تم إزالة الإعجاب');
    } else {
      await setDoc(likeRef, { from: state.user.uid, to: targetUid, createdAt: serverTimestamp() });
      await updateDoc(doc(db,'users',targetUid), { likesProfile: increment(1) });
      await notify(targetUid, 'like', `<b>${esc(state.profile.name)}</b> أعجبه ملفك الشخصي`);
      toast('تم إعجاب الملف ✓');
    }
  } catch(e){ toast('تعذّر التحديث'); }
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
    await updateDoc(doc(db,'users',targetUid), { support: increment(10) });
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
          ${c.authorId === state.user.uid
            ? `<button class="icon-btn" style="width:28px;height:28px;background:transparent;border:0;color:var(--muted)" data-delete-comment="${c.id}" data-post-id="${postId}">${ic('trash','xs')}</button>`
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
    
    await addDoc(collection(db,'posts'), {
      authorId: state.user.uid,
      author: {
        name: state.profile.name,
        username: state.profile.username,
        avatarUrl: state.profile.avatarUrl || '',
        grad: state.profile.grad || pickGrad(state.user.uid)
      },
      text: data.text,
      media: mediaUrl,  // Base64 data URL
      place: data.place || '',
      likes: 0, comments: 0,
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
    await updateDoc(doc(db,'rooms',roomId), {
      players: arrayUnion(state.user.uid), status: 'playing'
    });
    toast('انضممت للغرفة ✓');
  } catch(e){ toast('تعذّر الانضمام'); }
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

/* ============ Pages ============ */
function emptyState(msg, icon='grid'){
  return `<div class="empty">${ic(icon)}<div>${msg}</div></div>`;
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
    const posts = [...state.posts].sort((a,b)=>{
      const sa = ((a.likes*2)+(a.comments*3)) / Math.max(((Date.now()-(a.createdAt?.seconds*1000||0))/3600000), 0.4);
      const sb = ((b.likes*2)+(b.comments*3)) / Math.max(((Date.now()-(b.createdAt?.seconds*1000||0))/3600000), 0.4);
      return sb-sa;
    });
    body = `<div class="section-title">${ic('fire','sm')} الأكثر تفاعلاً</div>` +
      (posts.length ? posts.map(p=>postCard(p,true)).join('') : emptyState('لا توجد منشورات دارجة','fire'));
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

function postCard(p, trendMode=false){
  const liked = state.liked[p.id];
  const saved = state.saved[p.id];
  const isMine = p.authorId === state.user.uid;
  const score = (((p.likes||0)*2 + (p.comments||0)*3) / Math.max(((Date.now()-(p.createdAt?.seconds*1000||0))/3600000), 0.4)).toFixed(0);
  return `<article class="post card">
    <header class="post-h">
      <div data-view-profile="${p.authorId}" style="cursor:pointer">${avatar(p.author, 44)}</div>
      <div style="flex:1;min-width:0">
        <div class="post-name" data-view-profile="${p.authorId}" style="cursor:pointer">${esc(p.author?.name||'مستخدم')}</div>
        <div class="post-sub">
          <span>@${esc(p.author?.username||'')}</span>·
          <span>${timeAgo(p.createdAt)}</span>
          ${p.place?`·<span style="display:inline-flex;align-items:center;gap:3px">${ic('location','xs')}${esc(p.place)}</span>`:''}
        </div>
      </div>
      ${trendMode ? `<span class="pill pink">${ic('fire','xs')} ${nf(score)}</span>` : ''}
      ${isMine ? `<button class="post-menu-btn" data-delete-post="${p.id}" title="حذف">${ic('trash','sm')}</button>` : ''}
    </header>
    <p class="post-text">${esc(p.text).replace(/\n/g,'<br>')}</p>
    ${p.media ? `<div class="post-media"><img src="${esc(p.media)}" alt="" onerror="this.style.display='none'"></div>` : ''}
    <div class="post-actions">
      <button class="pact ${liked?'liked':''}" data-like="${p.id}">${ic('heart','sm')} ${nf(p.likes)}</button>
      <button class="pact" data-open-comments="${p.id}">${ic('comment','sm')} ${nf(p.comments)}</button>
      <button class="pact" data-action="toast" data-msg="تم نسخ الرابط">${ic('share','sm')}</button>
      <button class="pact ml ${saved?'saved':''}" data-save="${p.id}">${ic('bookmark','sm')}</button>
    </div>
  </article>`;
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
      <h1 class="page-title" style="margin:0;flex:1">المتجر</h1>
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

async function pageProfile(){
  const p = state.profile;
  if(!p){
    // إذا مر وقت طويل، اعرض زر إعادة محاولة
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
    {id:'posts', label:'المنشورات', icon:'grid'},
    {id:'saved', label:'المحفوظات', icon:'bookmark'},
    {id:'history', label:'سجل اللعب', icon:'clock'},
    {id:'games', label:'الألعاب', icon:'gamepad'},
  ];
  let body = '';
  if(state.profileTab === 'posts'){
    const myPosts = state.posts.filter(x=>x.authorId === state.user.uid);
    body = myPosts.length ? myPosts.map(x=>postCard(x)).join('') : emptyState('لم تنشر بعد','grid');
  } else if(state.profileTab === 'saved'){
    const saved = state.posts.filter(x=>state.saved[x.id]);
    body = saved.length ? saved.map(x=>postCard(x)).join('') : emptyState('لا توجد منشورات محفوظة','bookmark');
} else if(state.profileTab === 'history'){
  // اجلب سجل المباريات
  const historySnap = await getDocs(
    query(collection(db,'users',state.user.uid,'matchHistory'), orderBy('playedAt','desc'), limit(20))
  ).catch(()=>null);
  const history = historySnap ? historySnap.docs.map(d=>({id:d.id, ...d.data()})) : [];
  body = history.length ? history.map(h=>`
    <div class="card" style="margin-bottom:8px;padding:12px">
      <div class="row">
        <div style="width:38px;height:38px;border-radius:12px;display:grid;place-items:center;
          background:${h.result==='win'?'rgba(34,197,94,.15)':'rgba(255,61,113,.15)'};
          color:${h.result==='win'?'var(--ok)':'var(--pink)'};font-weight:900">
          ${h.result==='win'?'✓':'✗'}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:800">${esc(h.gameName||'Quiz Clash')}</div>
          <div class="muted" style="font-size:10.5px">${timeAgo(h.playedAt)}</div>
        </div>
        <div style="text-align:left">
          <div style="font-size:14px;font-weight:900;color:${h.result==='win'?'var(--ok)':'var(--pink)'}">
            ${h.myScore} - ${h.opponentScore}
          </div>
          <div class="muted" style="font-size:9.5px">${h.result==='win'?'فوز':'خسارة'}</div>
        </div>
      </div>
    </div>`).join('') : emptyState('لم تلعب أي مباراة بعد','gamepad');
} else {
    body = `<div class="card" style="text-align:center;padding:30px"><div class="muted">ستظهر إحصائياتك لكل لعبة هنا</div></div>`;
  }
  return `
    <div class="player-card">
      <div class="pc-cover" style="background:${p.coverUrl?`url(${esc(p.coverUrl)})`:p.grad||'linear-gradient(135deg,#6c5ce7,#00d2ff 55%,#ff3d71)'}"></div>
      <div class="pc-topright">
        <div class="pc-like-chip">${ic('heart')} ${nf(p.likesProfile)}</div>
        <div class="pc-like-chip gp">${ic('gamepad')} ${nf(p.likesGames)}</div>
      </div>
      <div class="pc-body">
        <div class="pc-info">
          <div class="pc-nick">${esc(p.name)}</div>
          <div class="pc-user">@${esc(p.username)}</div>
          ${p.teamName ? `<div class="pc-team">${p.teamEmblem||'🛡️'} ${esc(p.teamName)}</div>` : ''}
          <div class="pc-bio">${esc(p.bio||'')}</div>
        </div>
        <div class="pc-avatar">${avatar(p, 82)}</div>
      </div>
      <div class="pc-level">
        <div class="pc-level-bar"><span style="width:${Math.min(100,(p.xp||0)%100)}%"></span></div>
        <div class="pc-level-num">المستوى ${p.level||1}</div>
      </div>
    </div>
    <div class="pc-actions">
      <button data-action="edit-profile">${ic('edit','sm')} تعديل</button>
      <button data-action="toast" data-msg="المتابِعون">${ic('users','sm')} ${nf(p.followers)}</button>
      <button data-action="toast" data-msg="يتابع">${ic('user','sm')} ${nf(p.following)}</button>
    </div>
    <div class="pc-stats">
      <div class="pc-stat f"><div class="v">${nf(p.fame)}</div><div class="l">الشهرة</div></div>
      <div class="pc-stat p"><div class="v">${nf(p.power)}</div><div class="l">القوة</div></div>
      <div class="pc-stat s"><div class="v">${nf(p.support)}</div><div class="l">الدعم</div></div>
    </div>
    <!-- ★ شريط المستوى -->
${(() => {
  const prog = xpProgress(p.xp || 0);
  return `
    <div class="level-widget">
      <div class="level-top">
        <div class="level-badge">${prog.level}</div>
        <div class="level-info">
          <div class="ln">المستوى ${prog.level}</div>
          <div class="lx">${prog.current} / ${prog.needed} XP حتى المستوى ${prog.level + 1}</div>
        </div>
        <div class="status-chip" data-action="edit-status">
          <span class="status-dot" style="background:${PLAYER_STATUSES[p.status || 'available'].color}"></span>
          ${PLAYER_STATUSES[p.status || 'available'].label}
        </div>
      </div>
      <div class="level-bar"><span style="width:${prog.pct}%"></span></div>
      ${p.statusMsg ? `<div class="muted" style="font-size:11px;margin-top:8px;text-align:center">"${esc(p.statusMsg)}"</div>` : ''}
    </div>
  `;
})()}
    <div class="tabs" style="margin-top:16px">
      ${tabs.map(t=>`<button class="tab ${state.profileTab===t.id?'active':''}" data-ptab="${t.id}">${ic(t.icon,'sm')} ${t.label}</button>`).join('')}
    </div>
    ${body}`;
}

function pageUserProfile(){
  const p = state.users[state.viewingUid];
  if(!p) return emptyState('المستخدم غير موجود','user');
  const on = state.followed.has(state.viewingUid);
  const liked = state.profileLiked[state.viewingUid];
  const myPosts = state.posts.filter(x=>x.authorId === state.viewingUid);
  return `
    <div class="row" style="margin-bottom:14px">
      <button class="icon-btn" data-nav="home">${ic('back','sm')}</button>
      <div style="font-size:15px;font-weight:900">الملف الشخصي</div>
    </div>
    <div class="player-card">
      <div class="pc-cover" style="background:${p.coverUrl?`url(${esc(p.coverUrl)})`:p.grad||'linear-gradient(135deg,#6c5ce7,#00d2ff 55%,#ff3d71)'}"></div>
      <div class="pc-topright">
        <div class="pc-like-chip">${ic('heart')} ${nf(p.likesProfile)}</div>
        <div class="pc-like-chip gp">${ic('gamepad')} ${nf(p.likesGames)}</div>
      </div>
      <div class="pc-body">
        <div class="pc-info">
          <div class="pc-nick">${esc(p.name)}</div>
          <div class="pc-user">@${esc(p.username)}</div>
          ${p.teamName ? `<div class="pc-team">${p.teamEmblem||'🛡️'} ${esc(p.teamName)}</div>` : ''}
          <div class="pc-bio">${esc(p.bio||'')}</div>
        </div>
        <div class="pc-avatar">${avatar(p, 82)}</div>
      </div>
      <div class="pc-level">
        <div class="pc-level-bar"><span style="width:${Math.min(100,(p.xp||0)%100)}%"></span></div>
        <div class="pc-level-num">المستوى ${p.level||1}</div>
      </div>
    </div>
    <div class="pc-actions" style="flex-wrap:wrap">
      <button class="btn-follow-wide ${on?'on':''}" data-follow="${state.viewingUid}" style="flex:1 1 100%">
        ${on?'متابَع ✓':'متابعة'}
      </button>
      <button class="btn-ghost" style="flex:1;padding:12px;border-radius:14px;font-weight:800" data-open-chat="${state.viewingUid}">
        ${ic('message','sm')} رسالة
      </button>
      <button class="btn-ghost" style="flex:1;padding:12px;border-radius:14px;font-weight:800" data-profile-like="${state.viewingUid}">
        ${ic('heart','sm')} ${liked?'إزالة الإعجاب':'إعجاب الملف'}
      </button>
      <button class="btn-ghost" style="flex:1;padding:12px;border-radius:14px;font-weight:800" data-support="${state.viewingUid}">
        ${ic('star','sm')} دعم +10
      </button>
      <button class="challenge-btn" data-send-challenge="${state.viewingUid}">
  ${ic('bolt','sm')} تحدي
</button>
    </div>
    <div class="pc-stats">
      <div class="pc-stat f"><div class="v">${nf(p.fame)}</div><div class="l">الشهرة</div></div>
      <div class="pc-stat p"><div class="v">${nf(p.power)}</div><div class="l">القوة</div></div>
      <div class="pc-stat s"><div class="v">${nf(p.support)}</div><div class="l">الدعم</div></div>
    </div>
    <div class="section-title" style="margin-top:16px">${ic('grid','sm')} منشوراته</div>
    ${myPosts.length ? myPosts.map(x=>postCard(x)).join('') : emptyState('لا توجد منشورات','grid')}`;
}

function pageSearch(){
  return `<h1 class="page-title">البحث</h1>
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
  comment:'comment', support:'star',
  challenge:'bolt', team_request:'users',
  team_accepted:'check', team_rejected:'close',
  team_kick:'logout', team_role:'crown',
};
  if(!state.notifs.length){
    return `<h1 class="page-title">الإشعارات</h1>${emptyState('لا توجد إشعارات','bell')}`;
  }
  return `<h1 class="page-title">الإشعارات</h1>
    <div class="card pad0" style="padding:6px">
${state.notifs.map(n=>`
  <div class="notif-item ${n.read?'':'unread'}" 
       ${n.type === 'challenge' ? `data-action="show-challenges" style="cursor:pointer"` : ''}>
    <div class="notif-ic ${n.type||''}">${ic(icons[n.type]||'bell','sm')}</div>
    <div style="flex:1;min-width:0">
      <div class="notif-txt">${n.text||'إشعار جديد'}</div>
      <div class="notif-time">${timeAgo(n.createdAt)}</div>
    </div>
    ${n.type === 'challenge' ? `<span class="pill pink">اضغط للعرض</span>` : ''}
  </div>`).join('')}
    </div>`;
}

function pageCloseFriends(){
  const list = Object.values(state.users).filter(u=>u.uid !== state.user.uid).slice(0,10);
  return `<h1 class="page-title">المقربون</h1>
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
  const done = ACHIEVEMENTS.filter(a=>a.done).length;
  return `<h1 class="page-title">الإنجازات</h1>
    <div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:14px">
      <div class="ach-icon" style="width:56px;height:56px;font-size:26px">🏅</div>
      <div style="flex:1">
        <div style="font-size:15px;font-weight:900">${done} / ${ACHIEVEMENTS.length}</div>
        <div class="ach-prog" style="margin-top:8px"><span style="width:${(done/ACHIEVEMENTS.length*100).toFixed(0)}%"></span></div>
      </div>
    </div>
    ${ACHIEVEMENTS.map(a=>`<div class="ach-item">
      <div class="ach-icon ${a.done?'':'locked'}">${a.icon}</div>
      <div class="ach-mid">
        <div class="ach-n">${a.name}</div>
        <div class="ach-d">${a.desc}</div>
        ${a.done?'':`<div class="ach-prog"><span style="width:${a.p||0}%"></span></div>`}
      </div>
      <div class="muted" style="font-size:11px;font-weight:800">${a.done?'✓':(a.p||0)+'%'}</div>
    </div>`).join('')}`;
}

function pageLeaderboard(){
  const tabs = [['fame','الشهرة'],['power','القوة'],['support','الدعم'],['followers','المتابعون']];
  const users = Object.values(state.users).sort((a,b)=>(b[state.lbTab]||0)-(a[state.lbTab]||0));
  return `<h1 class="page-title">لوحة الصدارة</h1>
    <div class="chips" style="margin-bottom:14px">
      ${tabs.map(([k,l])=>`<button class="chip ${state.lbTab===k?'active':''}" data-lb="${k}">${l}</button>`).join('')}
    </div>
    ${users.length ? users.map((u,i)=>`<div class="lb-row ${u.uid===state.user.uid?'me':''}" data-view-profile="${u.uid}" style="cursor:pointer">
      <div class="lb-rank ${i<3?'r'+(i+1):''}">${i+1}</div>
      ${avatar(u,40)}
      <div class="lb-mid"><div class="lb-n">${esc(u.name)} ${u.uid===state.user.uid?'<span class="pill" style="font-size:9px">أنت</span>':''}</div>
      <div class="lb-s">@${esc(u.username)}</div></div>
      <div class="lb-v">${nf(u[state.lbTab])}</div>
    </div>`).join('') : emptyState('لا يوجد لاعبون بعد','trophy')}`;
}

function pageSettings(){
  const S = state.settings;
  const row = (k,n,d)=>`<div class="set-row" data-toggle="${k}">
    <div class="sr-txt"><div class="sr-n">${n}</div><div class="sr-d">${d}</div></div>
    <div class="switch ${S[k]?'on':''}"></div>
  </div>`;
  return `<h1 class="page-title">الإعدادات</h1>
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
    <div class="set-group">
      <h4>عن التطبيق</h4>
      <div class="set-row" data-action="toast" data-msg="الإصدار 2.0.0">
        <div class="sr-txt"><div class="sr-n">الإصدار</div><div class="sr-d">2.0.0</div></div>
        ${ic('star','sm')}
      </div>
    </div>`;
}

function pageSupport(){
  const admins = Object.values(state.users).filter(u=>u.role==='admin' || u.role==='moderator');
  return `<h1 class="page-title">فريق الدعم</h1>
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

function pageAdmin(){
  if(state.profile?.role !== 'admin'){
    return `<div class="empty">${ic('lock')}<div>هذه الصفحة للمشرفين فقط</div></div>`;
  }
  const cards = [
    {ic:'users', t:'إدارة المستخدمين', v:Object.keys(state.users).length},
    {ic:'grid', t:'إدارة المحتوى', v:state.posts.length + ' منشور'},
    {ic:'gamepad', t:'إدارة الألعاب', v:state.rooms.length + ' غرفة'},
    {ic:'shield', t:'فريق الإشراف', v:'—'},
    {ic:'chart', t:'الإحصائيات', v:'—'},
  ];
  return `<h1 class="page-title">لوحة الإشراف</h1>
    <div class="card" style="margin-bottom:16px;background:linear-gradient(135deg,rgba(245,179,1,.14),rgba(255,61,113,.06));border-color:rgba(245,179,1,.28)">
      <div class="row">
        <div class="ach-icon" style="background:rgba(245,179,1,.2)">${ic('crown','sm')}</div>
        <div style="flex:1"><div style="font-size:14px;font-weight:900">المشرف العام</div>
        <div class="muted" style="font-size:11px">صلاحيات كاملة</div></div>
        <span class="role-badge admin">ADMIN</span>
      </div>
    </div>
    <div class="games-grid">
    ${cards.map(c=>`<button class="card" style="text-align:right" data-action="toast" data-msg="${c.t}">
      <div class="mi-ic" style="margin-bottom:10px">${ic(c.ic,'sm')}</div>
      <div style="font-size:12.5px;font-weight:800">${c.t}</div>
      <div class="pill" style="margin-top:9px;display:inline-block">${c.v}</div>
    </button>`).join('')}
    </div>`;
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
};

function render(){
  renderTopbar();
  renderNav();
  const fn = PAGES[state.page] || pageHome;
  const result = fn();

  if(result && typeof result.then === 'function'){
    result.then(html => {
      document.getElementById('app').innerHTML = html || '';
      if(state.page === 'search') renderSearchResults();
      
      /* ★ جديد: رسم محادثة الفريق بعد تحديث الصفحة */
      if(state.page === 'teams' && state.viewingTeamTab === 'chat' && state.viewingTeamId){
        setTimeout(renderTeamChat, 50);
      }
    }).catch(err => {
      console.error('Render error:', err);
      document.getElementById('app').innerHTML = `<div class="empty">${ic('close')}<div>خطأ في التحميل</div></div>`;
    });
  } else {
    document.getElementById('app').innerHTML = result || '';
    if(state.page === 'search'){
      const inp = document.getElementById('searchInput');
      if(inp && document.activeElement !== inp) renderSearchResults();
    }
    
    /* ★ جديد: رسم محادثة الفريق بعد تحديث الصفحة */
    if(state.page === 'teams' && state.viewingTeamTab === 'chat' && state.viewingTeamId){
      setTimeout(renderTeamChat, 50);
    }
  }
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
  state.pendingImages.avatar = null;
  state.pendingImages.cover = null;
  openModal(`
    <h3>تعديل الملف</h3>
    <div class="field">
      <label>الاسم</label>
      <input class="input" id="epName" value="${esc(p.name||'')}" maxlength="50">
    </div>
    <div class="field">
      <label>النبذة</label>
      <textarea class="input" id="epBio" rows="3" style="resize:vertical;max-height:120px" maxlength="200">${esc(p.bio||'')}</textarea>
    </div>
    <div class="img-field">
      <label>الصورة الشخصية</label>
      <div class="img-preview avatar-preview ${p.avatarUrl?'has-image':''}"
           id="avatarPreview" data-pick-image="avatar"
           style="background-image:${p.avatarUrl?`url(${esc(p.avatarUrl)})`:'none'}">
        <div class="img-empty">${ic('camera')}<span style="font-size:10px">تغيير</span></div>
      </div>
    </div>
    <div class="img-field">
      <label>صورة الغلاف</label>
      <div class="img-preview ${p.coverUrl?'has-image':''}"
           id="coverPreview" data-pick-image="cover"
           style="background-image:${p.coverUrl?`url(${esc(p.coverUrl)})`:'none'}">
        <div class="img-empty">${ic('camera')}<span>اضغط لاختيار صورة غلاف</span></div>
      </div>
    </div>
    <div class="img-upload-progress" id="profileUploadProgress"><span></span></div>
    <div class="row" style="margin-top:16px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" id="saveProfileBtn">حفظ</button>
    </div>`);
}

async function saveProfileData(){
  const btn = document.getElementById('saveProfileBtn');
  const name = document.getElementById('epName').value.trim();
  const bio = document.getElementById('epBio').value.trim();
  if(!name){ toast('الاسم مطلوب'); return; }
  btn.disabled = true;
  btn.classList.add('loading');
  try {
    const prog = document.getElementById('profileUploadProgress');
    let avatarUrl = state.profile.avatarUrl || '';
    let coverUrl = state.profile.coverUrl || '';

    if(state.pendingImages.avatar){
      prog.classList.add('active');
      try {
        avatarUrl = await imageToBase64(state.pendingImages.avatar, 'avatar', p => {
          prog.querySelector('span').style.width = p + '%';
        });
      } catch(e) {
        toast(e.message || 'فشل رفع الصورة');
        btn.disabled = false; btn.classList.remove('loading');
        return;
      }
    }
    if(state.pendingImages.cover){
      prog.classList.add('active');
      try {
        coverUrl = await imageToBase64(state.pendingImages.cover, 'cover', p => {
          prog.querySelector('span').style.width = p + '%';
        });
      } catch(e) {
        toast(e.message || 'فشل رفع الغلاف');
        btn.disabled = false; btn.classList.remove('loading');
        return;
      }
    }
    
    await updateDoc(doc(db,'users',state.user.uid), { name, bio, avatarUrl, coverUrl });
    
    // تحديث المنشورات القديمة
    try {
      const snap = await getDocs(query(collection(db,'posts'), where('authorId','==',state.user.uid)));
      await Promise.all(snap.docs.map(d => updateDoc(d.ref, {
        'author.name': name,
        'author.avatarUrl': avatarUrl
      })));
    } catch(e){}
    
    closeModal();
    toast('تم الحفظ ✓');
  } catch(e){
    console.error(e);
    toast('فشل الحفظ: ' + (e.message||''));
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

/* ============================================================
   🎮 محرك اللعبة - Quiz Clash
   ============================================================ */

/** بدء مباراة Quiz Clash */
async function startQuizMatch(roomId, isHost){
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const snap = await getDoc(roomRef);
    if(!snap.exists()) return toast('الغرفة غير موجودة');
    const room = snap.data();

    // Host يولد الأسئلة عشوائياً مرة واحدة
    if(isHost && !room.quizQuestions){
      const selected = [...QUIZ_QUESTIONS].sort(()=>Math.random()-0.5)
        .slice(0, QUIZ_CONFIG.totalQuestions);
      await updateDoc(roomRef, {
        quizQuestions: selected,
        status: 'playing',
        currentIndex: 0,
        questionStartedAt: Date.now(),
        startedAt: serverTimestamp()
      });
    }

    // استمع للغرفة
    subscribeToMatch(roomId);
  } catch(e){ console.error(e); toast('خطأ في بدء المباراة'); }
}

/** الاشتراك في غرفة المباراة (بما فيها محادثتها) */
function subscribeToMatch(roomId){
  // تنظيف سابق
  if(state.matchUnsub){ try{state.matchUnsub();}catch(e){} state.matchUnsub = null; }
  if(state.matchChatUnsub){ try{state.matchChatUnsub();}catch(e){} state.matchChatUnsub = null; }
  if(state.matchTimer){ clearInterval(state.matchTimer); state.matchTimer = null; }

  state.activeMatch = { roomId };
  document.getElementById('gameOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // مستمع بيانات الغرفة
  state.matchUnsub = onSnapshot(doc(db,'rooms',roomId), snap=>{
    if(!snap.exists()){ exitMatch(); return; }
    const data = snap.data();
    state.activeMatch = { roomId, ...data };
    renderGameUI();

    // إذا انتهت المباراة — أعرض النتيجة واحفظها
    if(data.status === 'finished' && !data._resultRendered){
      finalizeMatch(roomId, data);
    }
  });

  // مستمع محادثة المباراة
  state.matchChatUnsub = onSnapshot(
    query(collection(db,'rooms',roomId,'chat'), orderBy('createdAt','asc'), limit(100)),
    snap=>{
      state.matchChat = snap.docs.map(d=>({id:d.id, ...d.data()}));
      renderMatchChat();
    }
  );
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

/** الانتقال للسؤال التالي (يتم من الـ host تلقائياً) */
async function autoAdvanceQuestion(){
  const m = state.activeMatch;
  if(!m || m.status !== 'playing') return;
  if(m.hostId !== state.user.uid) return; // فقط المضيف يقدم

  // تحقق: هل أجاب الجميع؟ أو انتهى الوقت؟
  const answers = m.answers || {};
  const allAnswered = (m.players||[]).every(uid=>answers[`${uid}_${m.currentIndex}`] !== undefined);
  const timeUp = Date.now() - m.questionStartedAt >= QUIZ_CONFIG.secondsPerQuestion * 1000;

  if(!allAnswered && !timeUp) return;

  const nextIdx = m.currentIndex + 1;
  const roomRef = doc(db,'rooms',m.roomId);

  if(nextIdx >= QUIZ_CONFIG.totalQuestions){
    // انتهت اللعبة
    const scores = m.scores || {};
    const winnerId = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;
    await updateDoc(roomRef, {
      status: 'finished',
      finishedAt: serverTimestamp(),
      winnerId
    });
  } else {
    await updateDoc(roomRef, {
      currentIndex: nextIdx,
      questionStartedAt: Date.now()
    });
  }
}

/** حفظ النتيجة عند انتهاء المباراة */
async function finalizeMatch(roomId, data){
  if(data._finalizedBy === state.user.uid) return;
  await updateDoc(doc(db,'rooms',roomId), { _resultRendered: true });

  const scores = data.scores || {};
  const winnerId = data.winnerId;
  const isWinner = winnerId === state.user.uid;
  const myScore = scores[state.user.uid] || 0;

  // احفظ النتيجة في سجل كل لاعب
  try {
    await Promise.all((data.players||[]).map(uid=>{
      const result = uid === winnerId ? 'win' : 'loss';
      return addDoc(collection(db,'users',uid,'matchHistory'), {
        gameId: data.gameId, gameName: 'Quiz Clash',
        roomId, opponent: (data.players||[]).find(p=>p!==uid) || null,
        myScore: scores[uid]||0,
        opponentScore: scores[(data.players||[]).find(p=>p!==uid)] || 0,
        result, playedAt: serverTimestamp()
      });
    }));
  } catch(e){ console.error(e); }

  // منح نقاط خبرة/شهرة
  if(isWinner){
    try {
      await updateDoc(doc(db,'users',state.user.uid), {
        fame: increment(50),
        xp: increment(100),
        power: increment(2)
      });
    } catch(e){}
  } else {
    try {
      await updateDoc(doc(db,'users',state.user.uid), {
        xp: increment(25)
      });
    } catch(e){}
  }

  // عرض شاشة النتيجة
  const container = document.getElementById('gameContainer');
  container.innerHTML = `
    <div class="result-screen">
      <span class="result-icon">${isWinner ? '🏆' : '😔'}</span>
      <div class="result-title" style="color:${isWinner?'var(--gold)':'var(--muted)'}">
        ${isWinner ? 'فوز رائع!' : 'خسارة شريفة'}
      </div>
      <div class="result-subtitle">
        ${isWinner ? 'أضفت 50 شهرة + 100 XP' : 'حصلت على 25 XP'}
      </div>
      <div class="result-stats">
        <div class="result-stat">
          <div class="v">${myScore}</div>
          <div class="l">نقاطك</div>
        </div>
        <div class="result-stat">
          <div class="v">${Object.values(scores).reduce((a,b)=>a+b,0)}</div>
          <div class="l">إجمالي</div>
        </div>
      </div>
      <div class="row" style="gap:10px;justify-content:center;margin-top:24px">
        <button class="btn btn-primary" id="playAgainBtn" style="flex:1;max-width:200px">
          ${ic('play','sm')} مباراة أخرى
        </button>
        <button class="btn btn-ghost" id="backHomeBtn" style="flex:1;max-width:200px">
          العودة للرئيسية
        </button>
      </div>
    </div>
  `;
  document.getElementById('playAgainBtn')?.addEventListener('click', ()=>{
    exitMatch();
    go('games', { activeGame: 'g3' });
  });
  document.getElementById('backHomeBtn')?.addEventListener('click', ()=>{
    exitMatch();
    go('home');
  });
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
   🔄 نظام إعادة الاتصال
   ============================================================ */

/** فحص هل المستخدم في مباراة نشطة */
async function checkActiveMatch(){
  try {
    const q = query(
      collection(db,'rooms'),
      where('players','array-contains',state.user.uid),
      where('status','in',['waiting','playing'])
    );
    const snap = await getDocs(q);
    if(snap.empty){ 
      document.getElementById('resumeBanner')?.classList.add('hidden');
      return;
    }
    const match = snap.docs[0];
    const data = match.data();
    if(data.gameId !== 'g3') return; // Quiz Clash فقط حالياً

    // اعرض البانر
    const banner = document.getElementById('resumeBanner');
    const text = document.getElementById('resumeBannerText');
    if(banner && text){
      text.textContent = `Quiz Clash · ${(data.players||[]).length} لاعب`;
      banner.classList.remove('hidden');
      document.getElementById('resumeMatchBtn').onclick = ()=> startQuizMatch(match.id, false);
      document.getElementById('leaveMatchBtn').onclick = async ()=>{
        try {
          await updateDoc(match.ref, { players: arrayRemove(state.user.uid) });
        } catch(e){}
        banner.classList.add('hidden');
        toast('غادرت المباراة');
      };
    }
  } catch(e){ console.error(e); }
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

/* ============ Event Handlers ============ */
document.addEventListener('click', async (e)=>{
  // Image preview click
  const imgEl = e.target.closest('[data-pick-image]');
  if(imgEl){
    const type = imgEl.dataset.pickImage;
    pickImage(type, (previewUrl)=>{
      const el = document.getElementById(type === 'post' ? 'postPreview' : type === 'avatar' ? 'avatarPreview' : 'coverPreview');
      if(el){
        el.style.backgroundImage = `url(${previewUrl})`;
        el.classList.add('has-image');
      }
    });
    return;
  }

  const t = e.target.closest('[data-nav], [data-action], [data-tab], [data-ptab], [data-follow], [data-like], [data-save], [data-chat], [data-open-chat], [data-game-open], [data-join-room], [data-leave-room], [data-create-room], [data-scat], [data-lb], [data-toggle], [data-view-profile], [data-open-comments], [data-delete-comment], [data-delete-post], [data-profile-like], [data-support], [data-buy-item], [data-open-team], [data-join-team], [data-leave-team], button');
  if(!t) return;

  /* المكافأة اليومية */
if(t.dataset.nav === '_daily'){ 
  await checkDailyReward();
  openDailyRewardModal(); 
  return; 
}

/* التحديات */
if(t.dataset.nav === '_challenges'){ 
  await openChallengesModal(); 
  return; 
}

  if(t.dataset.nav){
    if(t.dataset.reset === 'chat'){ state.chatWith = null; }
    if(t.dataset.reset === 'game'){ state.activeGame = null; }
    if(t.dataset.nav === 'more'){ openDrawer(); return; }
    go(t.dataset.nav); return;
  }
  if(t.dataset.action === 'close-drawer'){ closeDrawer(); return; }
  if(t.dataset.action === 'modal-close'){ closeModal(); return; }
  if(t.dataset.action === 'toast'){ toast(t.dataset.msg || ''); return; }
  if(t.dataset.action === 'compose'){ composeModal(); return; }
  if(t.dataset.action === 'edit-profile'){ editProfileModal(); return; }
  if(t.dataset.action === 'create-team'){ createTeamModal(); return; }
if(t.dataset.action === 'leave-team'){ await leaveTeam(); return; }
if(t.dataset.action === 'back-to-teams'){ state.viewingTeamId = null; render(); return; }

/* ★ جديد: إعادة محاولة تحميل الملف الشخصي */
if(t.dataset.action === 'retry-profile'){
  /* ★ مكافآت الدخول */
if(t.id === 'claimDailyBtn'){ await claimDailyReward(); return; }
if(t.dataset.action === 'show-daily'){ openDailyRewardModal(); return; }

/* ★ الحالة */
if(t.dataset.action === 'edit-status'){ openStatusPickerModal(); return; }
if(t.id === 'saveStatusBtn'){
  const status = t.dataset.pendingStatus || 'available';
  const msg = document.getElementById('statusMsgInput')?.value.trim() || '';
  await setPlayerStatus(status, msg);
  return;
}

/* ★ التحديات */
if(t.dataset.action === 'show-challenges'){ await openChallengesModal(); return; }
if(t.dataset.sendChallenge){ await sendChallenge(t.dataset.sendChallenge); return; }
if(t.dataset.acceptChallenge){ await acceptChallenge(t.dataset.acceptChallenge); return; }
if(t.dataset.rejectChallenge){ await rejectChallenge(t.dataset.rejectChallenge); return; }

/* ★ المقتنيات */
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

/* ★ طلبات الفرق */
if(t.dataset.requestJoin){ await requestJoinTeam(t.dataset.requestJoin); return; }
if(t.dataset.approveJoin){ await approveJoinRequest(t.dataset.teamId, t.dataset.approveJoin); return; }
if(t.dataset.rejectJoin){ await rejectJoinRequest(t.dataset.teamId, t.dataset.rejectJoin); return; }
if(t.dataset.kickMember){ await kickMember(t.dataset.teamId, t.dataset.kickMember); return; }
if(t.dataset.promote){ await setTeamRole(t.dataset.teamId, t.dataset.promote, t.dataset.role); return; }
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
/* ★ بدء Quiz Clash */
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
/* ★ محادثة الفريق */
if(t.dataset.sendTeamChat){
  await sendTeamChat(t.dataset.sendTeamChat);
  return;
}
if(t.dataset.teamTab){
  state.viewingTeamTab = t.dataset.teamTab;
  render();
  return;
}

if(t.dataset.tab){ state.homeTab = t.dataset.tab; render(); return; }
if(t.dataset.ptab){ state.profileTab = t.dataset.ptab; render(); return; }

  if(t.dataset.follow){ await toggleFollow(t.dataset.follow); return; }
  if(t.dataset.like){ await toggleLike(t.dataset.like); return; }
  if(t.dataset.save){ await toggleSave(t.dataset.save); return; }
  if(t.dataset.profileLike){ await toggleProfileLike(t.dataset.profileLike); return; }
  if(t.dataset.support){ await sendSupport(t.dataset.support); return; }

  if(t.dataset.viewProfile){
    if(t.dataset.viewProfile === state.user.uid){ go('profile'); return; }
    go('userprofile', { viewingUid: t.dataset.viewProfile }); return;
  }

  if(t.dataset.openComments){ await openCommentsModal(t.dataset.openComments); return; }
  if(t.dataset.deleteComment){
    await deleteComment(t.dataset.postId, t.dataset.deleteComment);
    // reopen modal
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

  if(t.dataset.chat){ await openChat(t.dataset.chat); return; }
  if(t.dataset.openChat){ await openChat(t.dataset.openChat); return; }

  if(t.dataset.gameOpen){ go('games', { activeGame: t.dataset.gameOpen }); return; }
  if(t.id === 'matchmakingBtn'){ startMatchmaking(t.dataset.game); return; }
  if(t.id === 'createRoomBtn'){ createRoom(t.dataset.game); return; }
  if(t.dataset.createRoom){ await confirmCreateRoom(t.dataset.createRoom); return; }
  if(t.dataset.joinRoom){ await joinRoom(t.dataset.joinRoom); return; }
  if(t.dataset.leaveRoom){ await leaveRoom(t.dataset.leaveRoom); return; }

  if(t.dataset.scat){ state.searchCat = t.dataset.scat; render(); return; }
  if(t.dataset.lb){ state.lbTab = t.dataset.lb; render(); return; }
  if(t.dataset.toggle){ state.settings[t.dataset.toggle] = !state.settings[t.dataset.toggle]; render(); return; }

  if(t.id === 'confirmLogout'){ await handleLogout(); return; }

  if(t.id === 'sendMsgBtn'){
    const inp = document.getElementById('msgInput');
    const txt = inp?.value.trim();
    if(!txt || !state.chatWith) return;
    const chatId = [state.user.uid, state.chatWith].sort().join('_');
    inp.value = '';
    try { await sendMessage(chatId, txt); } catch(e){ toast('فشل الإرسال'); }
    return;
  }
  if(t.id === 'sendCommentBtn'){
    const inp = document.getElementById('commentInput');
    const txt = inp?.value.trim();
    if(!txt) return;
    inp.value = '';
    await addComment(t.dataset.postId, txt);
    // refresh comments in modal
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

  if(t.dataset.buyItem){
    const item = STORE.find(x=>x.id === t.dataset.buyItem);
    if(item) await buyItem(item);
    return;
  }

  if(t.dataset.openTeam){ state.viewingTeamId = t.dataset.openTeam; render(); return; }
  if(t.dataset.joinTeam){ await joinTeam(t.dataset.joinTeam); return; }
});

/* Input events */
document.addEventListener('input', (e)=>{
  if(e.target.id === 'searchInput'){
    state.searchQ = e.target.value;
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(renderSearchResults, 200);
  }
});

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