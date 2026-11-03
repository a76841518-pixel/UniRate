/* ============================================================
   نكسوس — Firebase Integration (v1.1 — Fixed)
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

/* ============ إعدادات Firebase (املأ ببياناتك) ============ */
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

/* ============ الأيقونات ============ */
const LOGO_FALLBACK = window.LOGO_FALLBACK || "data:image/svg+xml;utf8," + encodeURIComponent(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="26" fill="#6c5ce7"/></svg>`);

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
};
function ic(name, cls=''){ return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||''}</svg>`; }

/* ============ كتالوج الألعاب ============ */
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
const AVATAR_GRADS = [
  'linear-gradient(135deg,#6c5ce7,#00d2ff)','linear-gradient(135deg,#ff3d71,#f5b301)',
  'linear-gradient(135deg,#00d2ff,#22c55e)','linear-gradient(135deg,#a78bfa,#ff3d71)',
  'linear-gradient(135deg,#22c55e,#00d2ff)','linear-gradient(135deg,#f5b301,#ff3d71)',
  'linear-gradient(135deg,#ff8a00,#f5b301)','linear-gradient(135deg,#818cf8,#6c5ce7)',
];
function pickGrad(seed=''){ let h=0; for(const c of seed) h=(h*31+c.charCodeAt(0))>>>0; return AVATAR_GRADS[h % AVATAR_GRADS.length]; }

/* ============ الحالة ============ */
const state = {
  user:null, profile:null,
  page:'home', homeTab:'explore', profileTab:'posts',
  searchQ:'', searchCat:'all', lbTab:'fame',
  activeGame:null, chatWith:null,
  viewingUid:null,           // ← جديد: عرض ملف مستخدم آخر
  liked:{}, saved:{}, followed:new Set(),
  posts:[], users:{}, chats:[], messages:{}, notifs:[], rooms:[],
  settings:{notif:true, sound:false, privateAcc:false, twofa:false, location:true, autoplay:true},
  notifRead:false,
  unsubs:[], chatUnsub:null, mmInterval:null,
};

/* ============ Firebase Init ============ */
let auth, db, app;
if (CONFIGURED) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  setPersistence(auth, browserLocalPersistence).catch(()=>{});
}

/* ============ أدوات ============ */
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

/* ============ Navigation ============ */
function go(page, opt={}){
  // تنظيف القناة الحالية عند مغادرة صفحة الرسائل
  if(state.page === 'messages' && page !== 'messages' && state.chatUnsub){
    try { state.chatUnsub(); } catch(e){}
    state.chatUnsub = null;
    state.chatWith = null;
  }
  state.page = page;
  Object.assign(state, opt);
  closeDrawer();
  window.scrollTo({top:0});
  render();
}

/* ============ الشريط السفلي ============ */
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

/* ============ الشريط العلوي ============ */
function renderTopbar(){
  document.getElementById('tbAvatar').innerHTML = avatar(state.profile||{}, 40);
  document.querySelectorAll('.tb-left .icon-btn').forEach(b=>{
    const hasUnread = b.dataset.nav === 'notifs' && state.notifs.some(n=>!n.read);
    b.innerHTML = ic(b.dataset.nav === 'search' ? 'search' : 'bell') +
      (hasUnread ? '<span class="dot-badge"></span>' : '');
  });
}

/* ============ القائمة الجانبية ============ */
const MORE_ITEMS = [
  {id:'closefriends', icon:'heart', label:'المقربون', desc:'أقرب 10 لاعبين'},
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
      نكسوس · v1.1
    </div>`;
  d.classList.add('open');
  document.getElementById('overlay').classList.add('show');
}
function closeDrawer(){
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

/* ============ المودال (إصلاح: زر الإلغاء يعمل الآن) ============ */
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
  root.innerHTML = '';
}

/* ============ المصادقة ============ */
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
      team:'', level:1, xp:0, fame:0, power:0, support:0,
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
        coverUrl:'', grad: pickGrad(cred.user.uid), team:'',
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

/* ============ مراقبة الحالة ============ */
if (CONFIGURED) {
  onAuthStateChanged(auth, async (user) => {
    if(user){
      state.user = user;
      showScreen('appShell');
      attachListeners();
    } else {
      state.user = null; state.profile = null;
      detachListeners();
      showScreen('authScreen');
    }
  });
} else {
  showScreen('setupScreen');
}

/* ============ المستمعون ============ */
function detachListeners(){
  state.unsubs.forEach(u=>{ try{u();}catch(e){} });
  state.unsubs = [];
  if(state.chatUnsub){ try{state.chatUnsub();}catch(e){} state.chatUnsub = null; }
  if(state.mmInterval){ clearInterval(state.mmInterval); state.mmInterval = null; }
}

function attachListeners(){
  detachListeners();

  // ★ مستمع حي لملف المستخدم الحالي (يحدّث العدادات فوراً)
  state.unsubs.push(onSnapshot(doc(db,'users',state.user.uid), snap=>{
    if(snap.exists()){
      state.profile = snap.data();
      renderTopbar();
      if(['profile','stats','settings'].includes(state.page)) render();
    }
  }));

  // المنشورات
  state.unsubs.push(onSnapshot(
    query(collection(db,'posts'), orderBy('createdAt','desc'), limit(50)),
    snap=>{
      state.posts = snap.docs.map(d=>({id:d.id, ...d.data()}));
      if(['home','profile','userprofile'].includes(state.page)) render();
    }
  ));

  // المستخدمون (بدون إعادة رسم صفحة البحث أثناء الكتابة)
  state.unsubs.push(onSnapshot(collection(db,'users'), snap=>{
    const map = {};
    snap.docs.forEach(d=>{ map[d.id] = d.data(); });
    state.users = map;
    const affectedPages = ['home','leaderboard','closefriends','userprofile'];
    if(affectedPages.includes(state.page)) render();
  }));

  // المتابعات
  state.unsubs.push(onSnapshot(
    query(collection(db,'follows'), where('followerId','==',state.user.uid)),
    snap=>{
      state.followed = new Set(snap.docs.map(d=>d.data().followingId));
      if(['home','userprofile'].includes(state.page)) render();
    }
  ));

  // الإعجابات
  state.unsubs.push(onSnapshot(
    query(collection(db,'postLikes'), where('uid','==',state.user.uid)),
    snap=>{
      state.liked = {};
      snap.docs.forEach(d=>{ state.liked[d.data().postId] = true; });
      if(state.page==='home') render();
    }
  ));

  // المحفوظات
  state.unsubs.push(onSnapshot(
    query(collection(db,'saves'), where('uid','==',state.user.uid)),
    snap=>{
      state.saved = {};
      snap.docs.forEach(d=>{ state.saved[d.data().postId] = true; });
    }
  ));

  // المحادثات
  state.unsubs.push(onSnapshot(
    query(collection(db,'chats'), where('participants','array-contains',state.user.uid)),
    snap=>{
      state.chats = snap.docs.map(d=>({id:d.id, ...d.data()}))
        .sort((a,b)=>(b.lastTime?.seconds||0)-(a.lastTime?.seconds||0));
      if(state.page==='messages' && !state.chatWith) render();
    }
  ));

  // الإشعارات
  state.unsubs.push(onSnapshot(
    query(collection(db,'notifications',state.user.uid,'items'), orderBy('createdAt','desc'), limit(50)),
    snap=>{
      state.notifs = snap.docs.map(d=>({id:d.id, ...d.data()}));
      if(state.notifs.some(n=>!n.read) && state.page !== 'notifs') state.notifRead = false;
      renderTopbar();
      if(state.page==='notifs') render();
    }
  ));

  // الغرف
  state.unsubs.push(onSnapshot(collection(db,'rooms'), snap=>{
    state.rooms = snap.docs.map(d=>({id:d.id, ...d.data()}));
    if(state.page==='games' && state.activeGame) render();
  }));
}

/* ============ العمليات ============ */
async function toggleLike(postId){
  const ref = doc(db,'posts',postId);
  const likeRef = doc(db,'postLikes',`${state.user.uid}_${postId}`);
  try {
    await runTransaction(db, async tx=>{
      const likeSnap = await tx.get(likeRef);
      if(likeSnap.exists()){
        tx.delete(likeRef);
        tx.update(ref, { likes: increment(-1) });
      } else {
        tx.set(likeRef, { uid: state.user.uid, postId, createdAt: new Date() });
        tx.update(ref, { likes: increment(1) });
      }
    });
  } catch(e){ console.error(e); toast('تعذّر تحديث الإعجاب'); }
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
    }
  } catch(e){ toast('تعذّر التحديث'); }
}

async function createPost(data){
  await addDoc(collection(db,'posts'), {
    authorId: state.user.uid,
    author: {
      name: state.profile.name, username: state.profile.username,
      avatarUrl: state.profile.avatarUrl || '',
      grad: state.profile.grad || pickGrad(state.user.uid)
    },
    text: data.text, media: data.media || '', place: data.place || '',
    likes: 0, comments: 0, createdAt: serverTimestamp()
  });
  toast('تم النشر ✓');
}

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

/* ★ إصلاح جوهري: openChat يربط listener للرسائل ويلغي السابق */
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

/* ============ الصفحات ============ */
function emptyState(msg, icon='grid'){
  return `<div class="empty">${ic(icon)}<div>${msg}</div></div>`;
}

/* --- الرئيسية --- */
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
    body = posts.length ? posts.map(p=>postCard(p)).join('') : emptyState('تابع المزيد من الحسابات لتظهر منشوراتهم هنا','users');
  } else {
    const posts = [...state.posts].sort((a,b)=>{
      const sa = ((a.likes*2)+(a.comments*3)) / Math.max(((Date.now()-(a.createdAt?.seconds*1000||0))/3600000), 0.4);
      const sb = ((b.likes*2)+(b.comments*3)) / Math.max(((Date.now()-(b.createdAt?.seconds*1000||0))/3600000), 0.4);
      return sb-sa;
    });
    body = `<div class="section-title">${ic('fire','sm')} الأكثر تفاعلاً</div>` +
      (posts.length ? posts.map(p=>postCard(p,true)).join('') : emptyState('لا توجد منشورات دارجة بعد','fire'));
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
    </header>
    <p class="post-text">${esc(p.text).replace(/\n/g,'<br>')}</p>
    ${p.media ? `<div class="post-media"><img src="${esc(p.media)}" alt="" onerror="this.style.display='none'"></div>` : ''}
    <div class="post-actions">
      <button class="pact ${liked?'liked':''}" data-like="${p.id}">${ic('heart','sm')} ${nf(p.likes)}</button>
      <button class="pact" data-action="toast" data-msg="التعليقات قريباً">${ic('comment','sm')} ${nf(p.comments)}</button>
      <button class="pact" data-action="toast" data-msg="تم نسخ الرابط"><${ic('share','sm')}</button>
      <button class="pact ml ${saved?'saved':''}" data-save="${p.id}">${ic('bookmark','sm')}</button>
    </div>
  </article>`;
}

/* --- الرسائل --- */
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
    }).join('') : emptyState('لا توجد محادثات — ابدأ بمراسلة صديق','message')}
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

/* --- الألعاب --- */
function pageGames(){
  if(state.activeGame){
    const g = GAMES.find(x=>x.id===state.activeGame);
    const rooms = state.rooms.filter(r=>r.gameId === g.id && r.status === 'waiting');
    return `
      <div class="row" style="margin-bottom:14px">
        <button class="icon-btn" data-nav="games" data-reset="game">${ic('back','sm')}</button>
        <div style="flex:1"><div style="font-size:17px;font-weight:900">${g.name}</div>
        <div class="muted" style="font-size:11px">${g.cat} · ${g.online} لاعب</div></div>
      </div>
      <div class="card" style="background:${g.grad};border:0;margin-bottom:16px;padding:24px;text-align:center">
        <div style="font-size:34px;margin-bottom:6px">${ic(g.icon)}</div>
        <div style="font-size:19px;font-weight:900">${g.name}</div>
        <div style="font-size:11.5px;opacity:.85;margin-top:4px">${g.modes.join(' · ')}</div>
      </div>
      <div class="section-title">${ic('bolt','sm')} لعب مباشر</div>
      <div class="card" style="margin-bottom:16px">
        <div class="muted" style="line-height:1.8;margin-bottom:12px;font-size:12.5px">
          ابحث عن لاعب بنفس مستواك وانضم لمباراة فورية.
        </div>
        <button class="btn btn-primary" style="width:100%" id="matchmakingBtn" data-game="${g.id}">
          ${ic('play','sm')} لعب مباشر
        </button>
      </div>
      <div class="section-title">${ic('users','sm')} الغرف المفتوحة</div>
      <div class="card" style="margin-bottom:12px">
        <div class="row" style="margin-bottom:12px">
          <div style="flex:1"><div style="font-size:13px;font-weight:800">غرف عامة</div>
          <div class="muted" style="font-size:10.5px">انضم لأي غرفة مفتوحة</div></div>
          <button class="btn btn-ghost btn-sm" id="createRoomBtn" data-game="${g.id}">${ic('plus','xs')} إنشاء</button>
        </div>
        ${rooms.length ? rooms.map(r=>{
          const host = state.users[r.hostId];
          const isMe = r.hostId === state.user.uid;
          return `<div class="room-item">
            ${avatar(host, 40)}
            <div class="room-info">
              <div class="room-n">${esc(r.name)} ${isMe?'<span class="pill ok" style="font-size:9px">غرفتك</span>':''}</div>
              <div class="room-m">
                <span>${(r.players||[]).length}/${r.maxPlayers||2}</span>
                <span>${esc(r.mode||'')}</span>
              </div>
            </div>
            ${isMe
              ? `<button class="btn btn-ghost btn-sm" data-leave-room="${r.id}">إلغاء</button>`
              : `<button class="btn btn-primary btn-sm" data-join-room="${r.id}">انضمام</button>`}
          </div>`;
        }).join('') : `<div class="empty-sm">لا توجد غرف مفتوحة — أنشئ واحدة</div>`}
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
          <div class="gc-meta"><span>${g.cat}</span></div>
        </div>
      </button>`).join('')}
    </div>`;
}

/* ★ Matchmaking مع استقصاء دوري (polling) لالتقاط الخصم */
async function startMatchmaking(gameId){
  openModal(`<div class="match-screen">
    <h3>جاري البحث…</h3>
    <div class="sub">${GAMES.find(g=>g.id===gameId).name}</div>
    <div class="spinner"></div>
    <div class="muted" id="mmStatus">نبحث عن خصم…</div>
  </div>`);
  try {
    const q = query(
      collection(db,'rooms'),
      where('gameId','==',gameId),
      where('public','==',true),
      where('status','==','waiting'),
      limit(1)
    );
    const snap = await getDocs(q);
    if(!snap.empty){
      const roomDoc = snap.docs[0];
      if(roomDoc.data().hostId === state.user.uid){
        toast('أنت بالفعل في غرفة انتظار');
        closeModal();
        return;
      }
      await updateDoc(roomDoc.ref, {
        players: arrayUnion(state.user.uid),
        status: 'playing'
      });
      closeModal();
      toast('تم إيجاد خصم! بدأت المباراة 🎮');
      return;
    }
    // لا توجد غرفة → أنشئ واحدة وراقبها
    const newRoom = await addDoc(collection(db,'rooms'), {
      gameId, hostId: state.user.uid, name: 'مباراة سريعة',
      players: [state.user.uid], maxPlayers: 2, mode: '1v1',
      public: true, status: 'waiting', createdAt: serverTimestamp()
    });
    const mmEl = document.getElementById('mmStatus');
    if(mmEl) mmEl.textContent = 'غرفتك جاهزة — انتظر خصماً…';

    let attempts = 0;
    state.mmInterval = setInterval(async ()=>{
      attempts++;
      if(attempts > 45 || !document.querySelector('.match-screen')){
        clearInterval(state.mmInterval); state.mmInterval = null;
        return;
      }
      try {
        const roomSnap = await getDoc(newRoom);
        if(roomSnap.exists()){
          const data = roomSnap.data();
          if(data.status === 'playing' && (data.players||[]).length > 1){
            clearInterval(state.mmInterval); state.mmInterval = null;
            closeModal();
            toast('بدأت المباراة! 🎮');
          }
        }
      } catch(e){ /* silent */ }
    }, 2000);
  } catch(e){
    console.error(e);
    if(e.code === 'failed-precondition'){
      toast('يجب إنشاء فهرس Firestore — راجع Console');
    } else {
      toast('خطأ في البحث: ' + (e.message||''));
    }
    closeModal();
  }
}

async function createRoom(gameId){
  openModal(`
    <h3>إنشاء غرفة</h3>
    <div class="sub">غرفة عامة أو خاصة</div>
    <div class="field"><label>اسم الغرفة</label><input class="input" id="rName" placeholder="مثال: تحدي المساء"></div>
    <div class="field"><label>النوع</label>
      <select class="input" id="rType"><option value="public">🌐 عامة</option><option value="private">🔒 خاصة</option></select>
    </div>
    <div class="field"><label>عدد اللاعبين</label>
      <select class="input" id="rMax"><option>2</option><option>4</option><option>8</option><option>10</option></select>
    </div>
    <div class="row" style="margin-top:16px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" data-create-room="${gameId}">إنشاء</button>
    </div>`);
}

async function confirmCreateRoom(gameId){
  const name = document.getElementById('rName').value.trim() || 'غرفة بدون اسم';
  const pub = document.getElementById('rType').value === 'public';
  const max = parseInt(document.getElementById('rMax').value);
  try {
    await addDoc(collection(db,'rooms'), {
      gameId, hostId: state.user.uid, name,
      players: [state.user.uid], maxPlayers: max,
      mode: max===2?'1v1':'فرق', public: pub,
      status: 'waiting', createdAt: serverTimestamp()
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

/* --- الفرق --- */
function pageTeams(){
  return `<h1 class="page-title">الفرق</h1>
    <div class="card" style="padding:22px;text-align:center">
      ${ic('users')}
      <div style="font-size:15px;font-weight:900;margin-top:10px">نظام الفرق قادم قريباً</div>
      <div class="muted" style="margin-top:6px;line-height:1.8">
        إنشاء الفرق، الانضمام، والحروب الدورية في التحديث القادم.
      </div>
    </div>`;
}

/* --- المتجر --- */
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
              <button class="btn btn-primary btn-sm" data-action="toast" data-msg="الشراء قريباً">شراء</button>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
}

/* --- الملف الشخصي --- */
function pageProfile(){
  const p = state.profile;
  if(!p) return '';
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
    body = `<div class="card" style="text-align:center;padding:30px"><div class="muted">سيظهر سجل مبارياتك هنا بعد لعب أول مباراة</div></div>`;
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
          ${p.team ? `<div class="pc-team">${esc(p.team)}</div>` : ''}
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
      <button data-action="edit-profile">${ic('edit','sm')} تعديل الملف</button>
      <button data-action="toast" data-msg="المتابِعون">${ic('users','sm')} ${nf(p.followers)}</button>
      <button data-action="toast" data-msg="يتابع">${ic('user','sm')} ${nf(p.following)}</button>
    </div>
    <div class="pc-stats">
      <div class="pc-stat f"><div class="v">${nf(p.fame)}</div><div class="l">الشهرة</div></div>
      <div class="pc-stat p"><div class="v">${nf(p.power)}</div><div class="l">القوة</div></div>
      <div class="pc-stat s"><div class="v">${nf(p.support)}</div><div class="l">الدعم</div></div>
    </div>
    <div class="tabs" style="margin-top:16px">
      ${tabs.map(t=>`<button class="tab ${state.profileTab===t.id?'active':''}" data-ptab="${t.id}">${ic(t.icon,'sm')} ${t.label}</button>`).join('')}
    </div>
    ${body}`;
}

/* ★ جديد: صفحة عرض ملف مستخدم آخر */
function pageUserProfile(){
  const p = state.users[state.viewingUid];
  if(!p) return emptyState('المستخدم غير موجود','user');
  const on = state.followed.has(state.viewingUid);
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
          ${p.team ? `<div class="pc-team">${esc(p.team)}</div>` : ''}
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
      <button class="btn-follow-wide ${on?'on':''}" data-follow="${state.viewingUid}">${on?'متابَع ✓':'متابعة'}</button>
      <button class="btn-ghost" style="flex:1;padding:12px;border-radius:14px;font-weight:800" data-open-chat="${state.viewingUid}">${ic('message','sm')} رسالة</button>
    </div>
    <div class="pc-stats">
      <div class="pc-stat f"><div class="v">${nf(p.fame)}</div><div class="l">الشهرة</div></div>
      <div class="pc-stat p"><div class="v">${nf(p.power)}</div><div class="l">القوة</div></div>
      <div class="pc-stat s"><div class="v">${nf(p.support)}</div><div class="l">الدعم</div></div>
    </div>
    <div class="section-title" style="margin-top:16px">${ic('grid','sm')} منشوراته</div>
    ${myPosts.length ? myPosts.map(x=>postCard(x)).join('') : emptyState('لا توجد منشورات','grid')}`;
}

/* --- البحث --- */
function pageSearch(){
  return `<h1 class="page-title">البحث</h1>
    <div class="search-bar">${ic('search','sm')}
      <input id="searchInput" placeholder="ابحث عن مستخدم، لعبة، فريق…" value="${esc(state.searchQ)}" autocomplete="off">
    </div>
    <div class="chips">
      ${[['all','الكل'],['users','مستخدمون'],['games','ألعاب']].map(([k,l])=>
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
  box.innerHTML = html || `<div class="empty">${ic('search')}<div>لا نتائج لـ «${esc(state.searchQ)}»</div></div>`;
}

/* --- الإشعارات --- */
async function pageNotifs(){
  state.notifRead = true;
  renderTopbar();
  // علّم كمقروء في Firestore
  const unread = state.notifs.filter(n=>!n.read);
  if(unread.length){
    Promise.all(unread.map(n =>
      updateDoc(doc(db,'notifications',state.user.uid,'items',n.id), { read: true }).catch(()=>{})
    ));
  }
  const icons = {like:'heart', follow:'user', game:'gamepad', comment:'comment'};
  if(!state.notifs.length){
    return `<h1 class="page-title">الإشعارات</h1>${emptyState('لا توجد إشعارات','bell')}`;
  }
  return `<h1 class="page-title">الإشعارات</h1>
    <div class="card pad0" style="padding:6px">
    ${state.notifs.map(n=>`
      <div class="notif-item ${n.read?'':'unread'}">
        <div class="notif-ic ${n.type}">${ic(icons[n.type]||'bell','sm')}</div>
        <div style="flex:1;min-width:0">
          <div class="notif-txt">${n.text||''}</div>
          <div class="notif-time">${timeAgo(n.createdAt)}</div>
        </div>
      </div>`).join('')}
    </div>`;
}

/* --- المقربون / إحصائيات / إنجازات --- */
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
    </div>
    <div class="card"><div class="muted" style="text-align:center;padding:20px">المزيد من الإحصائيات بعد لعب مباريات</div></div>`;
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
    ${users.length ? users.map((u,i)=>`<div class="lb-row ${u.uid===state.user.uid?'me':''}">
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
      <div class="set-row" data-action="toast" data-msg="الإصدار 1.1.0">
        <div class="sr-txt"><div class="sr-n">الإصدار</div><div class="sr-d">1.1.0</div></div>
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

/* ============ الموجّه ============ */
const PAGES = {
  home:pageHome, messages:pageMessages, games:pageGames, teams:pageTeams,
  store:pageStore, profile:pageProfile, userprofile:pageUserProfile,
  search:pageSearch, notifs:pageNotifs, closefriends:pageCloseFriends,
  stats:pageStats, achievements:pageAchievements, leaderboard:pageLeaderboard,
  settings:pageSettings, support:pageSupport, admin:pageAdmin, logout:pageLogout,
};

function render(){
  renderTopbar();
  renderNav();
  const fn = PAGES[state.page] || pageHome;
  document.getElementById('app').innerHTML = fn();
  if(state.page === 'search'){
    // لا نركّز تلقائياً إذا كان المستخدم يكتب بالفعل
    const inp = document.getElementById('searchInput');
    if(inp && document.activeElement !== inp){ renderSearchResults(); }
  }
}

/* ============ مودالات ============ */
function composeModal(){
  openModal(`
    <h3>منشور جديد</h3>
    <div class="field"><textarea class="input" id="composeText" rows="4" placeholder="بماذا تفكر؟" style="resize:vertical"></textarea></div>
    <div class="field"><label>رابط صورة (اختياري)</label><input class="input" id="composeMedia" placeholder="https://…"></div>
    <div class="row" style="margin-top:14px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" id="submitPost">نشر</button>
    </div>`);
}

function editProfileModal(){
  const p = state.profile;
  openModal(`
    <h3>تعديل الملف</h3>
    <div class="field"><label>الاسم</label><input class="input" id="epName" value="${esc(p.name||'')}"></div>
    <div class="field"><label>النبذة</label><textarea class="input" id="epBio" rows="3" style="resize:vertical">${esc(p.bio||'')}</textarea></div>
    <div class="field"><label>رابط الصورة الشخصية</label><input class="input" id="epAvatar" value="${esc(p.avatarUrl||'')}" placeholder="https://…"></div>
    <div class="field"><label>رابط صورة الغلاف</label><input class="input" id="epCover" value="${esc(p.coverUrl||'')}" placeholder="https://…"></div>
    <div class="row" style="margin-top:16px">
      <button class="btn btn-ghost" style="flex:1" data-action="modal-close">إلغاء</button>
      <button class="btn btn-primary" style="flex:1" id="saveProfileBtn">حفظ</button>
    </div>`);
}

async function saveProfileData(){
  const name = document.getElementById('epName').value.trim();
  const bio = document.getElementById('epBio').value.trim();
  const avatarUrl = document.getElementById('epAvatar').value.trim();
  const coverUrl = document.getElementById('epCover').value.trim();
  if(!name){ toast('الاسم مطلوب'); return; }
  try {
    await updateDoc(doc(db,'users',state.user.uid), { name, bio, avatarUrl, coverUrl });
    // تحديث المنشورات القديمة
    try {
      const snap = await getDocs(query(collection(db,'posts'), where('authorId','==',state.user.uid)));
      await Promise.all(snap.docs.map(d => updateDoc(d.ref, {
        'author.name': name,
        'author.avatarUrl': avatarUrl
      })));
    } catch(e){ /* silent */ }
    closeModal();
    toast('تم الحفظ ✓');
  } catch(e){ toast('فشل الحفظ'); }
}

/* ============ الأحداث ============ */
document.addEventListener('click', async (e)=>{
  const t = e.target.closest('[data-nav], [data-action], [data-tab], [data-ptab], [data-follow], [data-like], [data-save], [data-chat], [data-open-chat], [data-game-open], [data-join-room], [data-leave-room], [data-create-room], [data-scat], [data-lb], [data-toggle], [data-view-profile], button');
  if(!t) return;

  // Navigation
  if(t.dataset.nav){
    if(t.dataset.reset === 'chat'){ state.chatWith = null; }
    if(t.dataset.reset === 'game'){ state.activeGame = null; }
    if(t.dataset.nav === 'more'){ openDrawer(); return; }
    go(t.dataset.nav);
    return;
  }
  // Actions
  if(t.dataset.action === 'close-drawer'){ closeDrawer(); return; }
  if(t.dataset.action === 'modal-close'){ closeModal(); return; }
  if(t.dataset.action === 'toast'){ toast(t.dataset.msg || ''); return; }
  if(t.dataset.action === 'compose'){ composeModal(); return; }
  if(t.dataset.action === 'edit-profile'){ editProfileModal(); return; }
  // Tabs
  if(t.dataset.tab){ state.homeTab = t.dataset.tab; render(); return; }
  if(t.dataset.ptab){ state.profileTab = t.dataset.ptab; render(); return; }
  // Follow / Like / Save
  if(t.dataset.follow){ await toggleFollow(t.dataset.follow); return; }
  if(t.dataset.like){ await toggleLike(t.dataset.like); return; }
  if(t.dataset.save){ await toggleSave(t.dataset.save); return; }
  // View profile
  if(t.dataset.viewProfile){
    if(t.dataset.viewProfile === state.user.uid){ go('profile'); return; }
    go('userprofile', { viewingUid: t.dataset.viewProfile });
    return;
  }
  // Chats (both open chat directly and via list)
  if(t.dataset.chat){ await openChat(t.dataset.chat); return; }
  if(t.dataset.openChat){ await openChat(t.dataset.openChat); return; }
  // Games
  if(t.dataset.gameOpen){ go('games', { activeGame: t.dataset.gameOpen }); return; }
  if(t.id === 'matchmakingBtn'){ startMatchmaking(t.dataset.game); return; }
  if(t.id === 'createRoomBtn'){ createRoom(t.dataset.game); return; }
  if(t.dataset.createRoom){ await confirmCreateRoom(t.dataset.createRoom); return; }
  if(t.dataset.joinRoom){ await joinRoom(t.dataset.joinRoom); return; }
  if(t.dataset.leaveRoom){ await leaveRoom(t.dataset.leaveRoom); return; }
  // Search / Leaderboard
  if(t.dataset.scat){ state.searchCat = t.dataset.scat; render(); return; }
  if(t.dataset.lb){ state.lbTab = t.dataset.lb; render(); return; }
  // Settings
  if(t.dataset.toggle){ state.settings[t.dataset.toggle] = !state.settings[t.dataset.toggle]; render(); return; }
  // Logout
  if(t.id === 'confirmLogout'){ await handleLogout(); return; }
  // Send message
  if(t.id === 'sendMsgBtn'){
    const inp = document.getElementById('msgInput');
    const txt = inp?.value.trim();
    if(!txt || !state.chatWith) return;
    const chatId = [state.user.uid, state.chatWith].sort().join('_');
    inp.value = '';
    try { await sendMessage(chatId, txt); } catch(e){ toast('فشل الإرسال'); }
    return;
  }
  // Submit post
  if(t.id === 'submitPost'){
    const txt = document.getElementById('composeText').value.trim();
    const media = document.getElementById('composeMedia').value.trim();
    if(!txt){ toast('اكتب شيئاً'); return; }
    closeModal();
    await createPost({ text: txt, media });
    return;
  }
  // Save profile
  if(t.id === 'saveProfileBtn'){ await saveProfileData(); return; }
});

// Input: search
document.addEventListener('input', (e)=>{
  if(e.target.id === 'searchInput'){
    state.searchQ = e.target.value;
    renderSearchResults();
  }
});

// Enter to send message
document.addEventListener('keydown', (e)=>{
  if(e.target.id === 'msgInput' && e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    document.getElementById('sendMsgBtn')?.click();
  }
});

// Auth
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