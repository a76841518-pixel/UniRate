/* ======================================================
   UniRate v3.0 — Community Platform
   ====================================================== */

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

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, addDoc, query, where, orderBy, getDocs, limit, serverTimestamp, runTransaction, increment, writeBatch, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const toEmail = id => `${id}@unirate.app`;

const SEM_LABELS = { first:"الفصل الأول", second:"الفصل الثاني", summer:"الصيفي" };
const TYPE_LABELS = {
  universityMandatory:"إجباري جامعة", universityElective:"اختياري جامعة",
  collegeMandatory:"إجباري كلية", majorMandatory:"إجباري تخصص", majorElective:"اختياري تخصص"
};
const DIFF_LABELS = { easy:"سهل", medium:"متوسط", hard:"صعب" };
const DIFF_EMOJI = { easy:"😄", medium:"😐", hard:"😰" };
const CRITERIA = { workload:"العبء الدراسي", teaching:"جودة التدريس", usefulness:"الفائدة" };
const COURSE_STATUS = { taken:"أنجزتها", taking:"أدرسها حالياً", planned:"أخطط لها" };
const Q_CATEGORIES = ["مفاهيم","حل مسائل","برمجة","نظري","عملي","امتحان","مشروع","أخرى"];
const RES_TYPES = { summary:"ملخص", notes:"مذكرة", slides:"شرائح", video:"فيديو", book:"كتاب", exercise:"تمارين", other:"أخرى" };

const BADGES = {
  firstReview:      { icon:"⭐", name:"أول تقييم",       desc:"أضفت أول تقييم",             xp:"academic" },
  tenReviews:       { icon:"🌟", name:"10 تقييمات",      desc:"أضفت 10 تقييمات",            xp:"academic" },
  pioneer:          { icon:"🚀", name:"رائد",             desc:"من أول 50 مستخدم",           xp:null },
  explorer:         { icon:"🧭", name:"مستكشف",          desc:"تصفحت 50 مادة",              xp:"academic" },
  topContributor:   { icon:"🏆", name:"مساهم مميز",      desc:"+500 نقطة إجمالية",          xp:null },
  academicHelper:   { icon:"🎓", name:"المساعد الأكاديمي", desc:"10 إجابات مفيدة",            xp:"helper" },
  resourceMaker:    { icon:"📚", name:"صانع الموارد",    desc:"شاركت 5 موارد تعليمية",      xp:"resource" },
  organizer:        { icon:"📅", name:"المنظم",           desc:"أنشأت 3 مجموعات/خطط دراسة",  xp:"academic" },
  courseEnricher:   { icon:"💎", name:"مُثري المواد",     desc:"أثريت 20 مادة بمحتوى",       xp:"academic" },
  discussionStarter:{ icon:"💬", name:"باثّ الحوار",     desc:"بدأت 10 نقاشات",             xp:"academic" },
  examMaster:       { icon:"🎯", name:"خبير الامتحانات", desc:"5 أسئلة امتحانية مشاركة",    xp:"helper" },
  acceptedAnswer:   { icon:"✅", name:"إجابة مقبولة",     desc:"قُبلت إجابتك كحل",           xp:"helper" },
  groupFounder:     { icon:"👥", name:"مؤسس مجموعة",     desc:"أسست مجموعة دراسة",          xp:"academic" },
  streak7:          { icon:"🔥", name:"أسبوع متواصل",    desc:"7 أيام نشاط متتالي",         xp:null }
};

// XP levels boundaries
const XP_LEVELS = [0, 50, 150, 350, 700, 1200, 2000, 3500, 5500, 8000];
function xpLevel(xp){ return XP_LEVELS.findIndex((v,i) => xp >= v && (XP_LEVELS[i+1] ?? Infinity) > xp) + 1; }
function xpNext(xp){ const lvl = xpLevel(xp); return XP_LEVELS[lvl] ?? XP_LEVELS[XP_LEVELS.length-1]; }

const WEEKLY_CHALLENGES = [
  { id:"ch_study5",  icon:"📖", name:"مراجعة 5 مواد",  desc:"افتح 5 مواد هذا الأسبوع",       reward:50, target:5 },
  { id:"ch_answer3", icon:"💬", name:"أجب عن 3 أسئلة", desc:"قدّم 3 إجابات على أسئلة",       reward:30, target:3 },
  { id:"ch_res1",    icon:"📚", name:"شارك مورداً",     desc:"انشر ملخصاً أو مورداً تعليمياً", reward:40, target:1 },
  { id:"ch_vote5",   icon:"👍", name:"قيّم 5 إجابات",   desc:"صوّت على 5 إجابات مفيدة",        reward:20, target:5 }
];

/* ---------- Toast / Modal ---------- */
function toast(msg, type = "info") {
  const w = $("#toastWrap");
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  w.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateY(20px)"; t.style.transition = "all .3s"; }, 2600);
  setTimeout(() => t.remove(), 3000);
}
function openModal(html) {
  const root = $("#modalRoot");
  root.innerHTML = `<div class="modal-back"><div class="modal">${html}</div></div>`;
  root.querySelector(".modal-back").addEventListener("click", e => { if (e.target.classList.contains("modal-back")) closeModal(); });
}
function closeModal() { $("#modalRoot").innerHTML = ""; }
window.closeModal = closeModal;

function fmtDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "الآن";
  if (diff < 3600) return `قبل ${Math.floor(diff/60)} د`;
  if (diff < 86400) return `قبل ${Math.floor(diff/3600)} س`;
  if (diff < 604800) return `قبل ${Math.floor(diff/86400)} يوم`;
  return d.toLocaleDateString("ar-EG", { year:"numeric", month:"short", day:"numeric" });
}
function stars(n, max = 5) {
  n = Math.round(n || 0);
  return `<span class="stars-display">${"★".repeat(n)}<span class="off">${"★".repeat(max-n)}</span></span>`;
}

/* ---------- State ---------- */
const state = {
  user: null, profile: null,
  colleges: [], majors: [], courses: [], professors: [],
  questions: [], discussions: [], resources: [], studyGroups: [],
  bookmarks: new Set(), notifications: [], unreadCount: 0,
  userCourses: {},
  savedSearches: [], recentVisits: [],
  view: "home", currentCourseId: null, currentProfessorId: null,
  currentQuestionId: null, currentDiscussionId: null, currentGroupId: null,
  adminTab: "dashboard",
  homeTab: "trending",
  communityTab: "questions",
  filters: { search:"", college:"", major:"", diff:"", sort:"relevance", tag:"" },
  theme: localStorage.getItem("unirate-theme") || "light"
};
window.__state = state;

/* ---------- Theme ---------- */
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  $("#themeBtn").textContent = state.theme === "dark" ? "☀️" : "🌙";
  document.querySelector('meta[name="theme-color"]').content = state.theme === "dark" ? "#0b1020" : "#6366f1";
}
$("#themeBtn").addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("unirate-theme", state.theme);
  applyTheme();
});
applyTheme();

/* ---------- Screens ---------- */
function showScreen(id) {
  ["authScreen","profileScreen"].forEach(s => $("#"+s).classList.add("hidden"));
  $("#mainApp").classList.add("hidden");
  $("#loader").classList.add("hidden");
  if (id === "main") $("#mainApp").classList.remove("hidden");
  else if (id) $("#"+id).classList.remove("hidden");
}

/* ---------- Auth Flow ---------- */
onAuthStateChanged(auth, async user => {
  state.user = user;
  if (!user) { state.profile = null; showScreen("authScreen"); return; }
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) {
    await setDoc(doc(db, "users", user.uid), {
      universityId: user.email.split("@")[0], name:"", collegeId:"", majorId:"",
      branch:"", level:1, role:"student", roles:["student"], points:0,
      xp: { academic:0, resource:0, helper:0 }, badges:[], theme:"light",
      privacy: { showMajor:true, showLevel:true, showBadges:true, showContribs:true, showGroups:true, showResources:true },
      createdAt: serverTimestamp()
    });
    await loadCollegesAndMajors();
    showScreen("profileScreen");
    populateMajorSelect();
    return;
  }
  const data = snap.data();
  if (!data.roles) data.roles = [data.role || "student"];
  if (!data.xp) data.xp = { academic:0, resource:0, helper:0 };
  if (data.role !== "admin" && !data.name) {
    await loadCollegesAndMajors();
    showScreen("profileScreen");
    populateMajorSelect();
    return;
  }
  state.profile = { uid: user.uid, ...data };
  const isAdmin = (data.roles||[]).some(r => ["admin","platformAdmin","moderator","dataManager","studentModerator"].includes(r)) || data.role === "admin";
  $("#userName").textContent = state.profile.name || "المشرف";
  $("#userRole").textContent = isAdmin ? roleLabel(data.roles||[]) : "طالب";
  $("#userRole").classList.toggle("admin", isAdmin);
  $("#userAvatar").textContent = (state.profile.name || "م").charAt(0);
  $$(".admin-only").forEach(el => el.classList.toggle("hidden", !isAdmin));

  await Promise.all([
    loadCollegesAndMajors(), loadCourses(), loadProfessors(),
    loadBookmarks(), loadNotifications(), loadUserCourses(),
    loadQuestions(), loadDiscussions(), loadResources(), loadStudyGroups()
  ]);
  state.savedSearches = JSON.parse(localStorage.getItem("unirate-savedSearches") || "[]");
  state.recentVisits = JSON.parse(localStorage.getItem("unirate-recentVisits") || "[]");
  showScreen("main");
  render();
  updateBadge();
});

function roleLabel(roles) {
  const m = { platformAdmin:"مدير المنصة", admin:"مشرف عام", moderator:"مشرف محتوى", dataManager:"مسؤول بيانات", studentModerator:"مشرف طلابي" };
  return m[roles[0]] || "مشرف";
}

/* ---------- Register / Login ---------- */
$("#loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const id = $("#loginId").value.trim();
  const pass = $("#loginPass").value;
  if (!/^\d{13}$/.test(id)) return toast("الرقم الجامعي 13 رقماً", "error");
  if (!pass) return toast("أدخل كلمة المرور", "error");
  try { await signInWithEmailAndPassword(auth, toEmail(id), pass); toast("مرحباً بك 👋", "success"); }
  catch { toast("بيانات الدخول غير صحيحة", "error"); }
});
$("#registerForm").addEventListener("submit", async e => {
  e.preventDefault();
  const id = $("#regId").value.trim();
  const pass = $("#regPass").value, pass2 = $("#regPass2").value;
  if (!/^\d{13}$/.test(id)) return toast("الرقم الجامعي 13 رقماً", "error");
  if (pass.length < 6) return toast("كلمة المرور 6 أحرف على الأقل", "error");
  if (pass !== pass2) return toast("كلمتا المرور غير متطابقتين", "error");
  try {
    const cred = await createUserWithEmailAndPassword(auth, toEmail(id), pass);
    const usersSnap = await getDocs(collection(db, "users"));
    const isPioneer = usersSnap.size < 50;
    await setDoc(doc(db, "users", cred.user.uid), {
      universityId: id, name:"", collegeId:"", majorId:"", branch:"", level:1,
      role:"student", roles:["student"],
      points: isPioneer ? 50 : 10,
      xp: { academic:0, resource:0, helper:0 },
      badges: isPioneer ? ["pioneer"] : [],
      privacy: { showMajor:true, showLevel:true, showBadges:true, showContribs:true, showGroups:true, showResources:true },
      theme:"light", createdAt: serverTimestamp()
    });
    toast("تم إنشاء الحساب 🎉", "success");
  } catch (err) {
    toast(err.code === "auth/email-already-in-use" ? "الرقم مسجّل مسبقاً" : "فشل الإنشاء", "error");
  }
});
$("#logoutBtn")?.addEventListener("click", async () => { await signOut(auth); toast("تم الخروج", "info"); });
$$(".tab").forEach(t => t.addEventListener("click", () => {
  $$(".tab").forEach(x => x.classList.remove("active"));
  t.classList.add("active");
  const which = t.dataset.tab;
  $("#loginForm").classList.toggle("hidden", which !== "login");
  $("#registerForm").classList.toggle("hidden", which !== "register");
}));
["loginId","regId"].forEach(id => {
  $("#"+id).addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g,"").slice(0,13); });
});

/* ---------- Profile Setup ---------- */
async function loadCollegesAndMajors() {
  const [c,m] = await Promise.all([getDocs(collection(db,"colleges")), getDocs(collection(db,"majors"))]);
  state.colleges = c.docs.map(d => ({ id:d.id, ...d.data() }));
  state.majors = m.docs.map(d => ({ id:d.id, ...d.data() }));
}
function populateMajorSelect() {
  const sel = $("#pfMajor");
  sel.innerHTML = `<option value="">— اختر —</option>` + state.majors.map(m => `<option value="${esc(m.id)}">${esc(m.name)}</option>`).join("");
}
$("#pfMajor").addEventListener("change", e => {
  const m = state.majors.find(x => x.id === e.target.value);
  if (!m) { $("#pfCollege").value = ""; return; }
  const c = state.colleges.find(x => x.id === m.collegeId);
  $("#pfCollege").value = c ? c.name : "—";
});
$("#profileForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = $("#pfName").value.trim();
  const majorId = $("#pfMajor").value;
  const branch = $("#pfBranch").value.trim();
  const level = Number($("#pfLevel").value) || 1;
  if (!name || !majorId || !branch) return toast("أكمل الحقول", "error");
  const major = state.majors.find(m => m.id === majorId);
  if (!major) return toast("التخصص غير موجود", "error");
  await updateDoc(doc(db, "users", state.user.uid), { name, majorId, collegeId: major.collegeId, branch, level });
  toast("تم الحفظ ✅", "success");
  setTimeout(() => location.reload(), 700);
});

/* ---------- Loaders ---------- */
async function loadCourses() { try { const s = await getDocs(collection(db,"courses")); state.courses = s.docs.map(d => ({id:d.id,...d.data()})); } catch { state.courses = []; } }
async function loadProfessors() { try { const s = await getDocs(collection(db,"professors")); state.professors = s.docs.map(d => ({id:d.id,...d.data()})); } catch { state.professors = []; } }
async function loadQuestions() { try { const s = await getDocs(collection(db,"questions")); state.questions = s.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)); } catch { state.questions = []; } }
async function loadDiscussions() { try { const s = await getDocs(collection(db,"discussions")); state.discussions = s.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)); } catch { state.discussions = []; } }
async function loadResources() { try { const s = await getDocs(collection(db,"resources")); state.resources = s.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)); } catch { state.resources = []; } }
async function loadStudyGroups() { try { const s = await getDocs(collection(db,"studyGroups")); state.studyGroups = s.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)); } catch { state.studyGroups = []; } }
async function loadBookmarks() { try { const s = await getDocs(query(collection(db,"bookmarks"), where("userId","==",state.user.uid))); state.bookmarks = new Set(s.docs.map(d => d.data().courseId)); } catch { state.bookmarks = new Set(); } }
async function loadNotifications() {
  try {
    const s = await getDocs(query(collection(db,"notifications"), where("userId","==",state.user.uid)));
    state.notifications = s.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    state.unreadCount = state.notifications.filter(n => !n.read).length;
  } catch { state.notifications = []; }
}
async function loadUserCourses() {
  try {
    const s = await getDocs(query(collection(db,"userCourses"), where("userId","==",state.user.uid)));
    state.userCourses = {}; s.docs.forEach(d => { state.userCourses[d.data().courseId] = d.data().status; });
  } catch { state.userCourses = {}; }
}
function updateBadge() {
  const b = $("#notifBadge");
  if (state.unreadCount > 0) { b.textContent = state.unreadCount; b.classList.remove("hidden"); } else b.classList.add("hidden");
}

/* ---------- Recent visits ---------- */
function trackVisit(type, id, label) {
  const rec = { type, id, label, at: Date.now() };
  state.recentVisits = [rec, ...state.recentVisits.filter(r => !(r.type === type && r.id === id))].slice(0, 20);
  localStorage.setItem("unirate-recentVisits", JSON.stringify(state.recentVisits));
}

/* ---------- Navigation ---------- */
$("#mainNav").addEventListener("click", e => { const b = e.target.closest(".nav-btn"); if (b) gotoView(b.dataset.view); });
$("#bottomNav").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.view) gotoView(b.dataset.view);
  else if (b.dataset.menu === "profile") gotoView("profile");
});
function gotoView(view) {
  state.view = view; state.currentCourseId = null; state.currentProfessorId = null;
  state.currentQuestionId = null; state.currentDiscussionId = null; state.currentGroupId = null;
  $$(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  $$("#bottomNav button").forEach(b => b.classList.toggle("active", b.dataset.view === view || (view === "profile" && b.dataset.menu === "profile")));
  render();
  window.scrollTo({ top:0, behavior:"smooth" });
}
window.gotoView = gotoView;
$("#brandBtn").addEventListener("click", () => gotoView("home"));

function render() {
  const root = $("#viewRoot");
  if (state.currentCourseId) return renderCourseDetail(root);
  if (state.currentProfessorId) return renderProfessorDetail(root);
  if (state.currentQuestionId) return renderQuestionDetail(root);
  if (state.currentDiscussionId) return renderDiscussionDetail(root);
  if (state.currentGroupId) return renderGroupDetail(root);
  switch (state.view) {
    case "home":             return renderHome(root);
    case "community":        return renderCommunity(root);
    case "colleges":         return renderColleges(root);
    case "professors":       return renderProfessors(root);
    case "stats":            return renderStats(root);
    case "bookmarks":        return renderBookmarks(root);
    case "profile":          return renderProfile(root);
    case "myCourses":        return renderMyCourses(root);
    case "myContributions":  return renderMyContributions(root);
    case "summary":          return renderSummary(root);
    case "settings":         return renderSettings(root);
    case "admin":
      if (!isAdminUser()) {
        toast("ليست لديك صلاحيات المشرف", "error");
        return gotoView("home");
      }
      return renderAdmin(root);
    default:                 return renderHome(root);
  }
}
function isAdminUser() {
  const p = state.profile;
  if (!p) return false;
  if (p.role === "admin") return true;
  const roles = p.roles || [];
  return roles.some(r => ["admin","platformAdmin","moderator","dataManager","studentModerator"].includes(r));
}
function hasRole(r) { return (state.profile?.roles || []).includes(r) || state.profile?.role === "admin"; }

/* ======================================================
   1) HOME
   ====================================================== */
function difficultyBadge(c) {
  const n = c.ratingsCount || 0;
  if (!n) return `<span class="diff-pill none">لا تقييم</span>`;
  const avg = c.avgDifficulty || 0;
  const k = avg < 1.7 ? "easy" : avg > 2.3 ? "hard" : "medium";
  return `<span class="diff-pill ${k}">${DIFF_EMOJI[k]} ${DIFF_LABELS[k]} · ${avg.toFixed(1)}</span>`;
}
function courseCardHTML(c) {
  const bm = state.bookmarks.has(c.id);
  const tags = (c.tagList || []).slice(0,3).map(t => `<span class="tag custom">${esc(t)}</span>`).join("");
  return `<article class="course-card" data-id="${esc(c.id)}">
    <button class="bookmark-btn ${bm?"on":""}" data-bm="${esc(c.id)}">${bm?"🔖":"📑"}</button>
    <div class="cc-top"><span class="cc-code">${esc(c.code||"—")}</span>${difficultyBadge(c)}</div>
    <h3 class="cc-name">${esc(c.name||"بدون اسم")}</h3>
    <div class="cc-meta">
      ${c.year?`<span class="tag year">📅 سنة ${c.year}</span>`:""}
      ${c.hours?`<span class="tag hours">⏱️ ${c.hours} ساعات</span>`:""}
      ${c.isPractical?`<span class="tag">🧪 عملي</span>`:""}
      ${c.isActivity?`<span class="tag">🎯 نشاط</span>`:""}
      ${tags}
    </div>
    <div class="cc-bottom">
      <span class="cc-count">${c.ratingsCount||0} تقييم · ${c.reviewsCount||0} تعليق</span>
      <span class="muted" style="font-size:12.5px">التفاصيل →</span>
    </div>
  </article>`;
}
function renderHome(root) {
  const pub = state.courses.filter(c => c.status === "published");
  let list = [...pub];
  const f = state.filters;
  if (state.homeTab === "trending") list.sort((a,b) => (b.ratingsCount||0)-(a.ratingsCount||0));
  else if (state.homeTab === "top") list.sort((a,b) => (b.avgOverall||0)-(a.avgOverall||0));
  else if (state.homeTab === "easy") list = list.filter(c => c.ratingsCount && c.avgDifficulty < 1.7);
  else if (state.homeTab === "hard") list = list.filter(c => c.ratingsCount && c.avgDifficulty > 2.3);
  else if (state.homeTab === "recent") list.sort((a,b) => (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));

  if (f.search) { const t = f.search.toLowerCase(); list = list.filter(c => (c.name||"").toLowerCase().includes(t) || (c.code||"").toLowerCase().includes(t)); }
  if (f.college) list = list.filter(c => matchCollege(c, f.college));
  if (f.major) list = list.filter(c => c.targets?.all || (c.targets?.majors||[]).includes(f.major));
  if (f.diff) list = list.filter(c => {
    if (!c.ratingsCount) return false;
    const a = c.avgDifficulty || 0;
    if (f.diff === "easy") return a < 1.7;
    if (f.diff === "medium") return a >= 1.7 && a <= 2.3;
    if (f.diff === "hard") return a > 2.3;
  });
  if (f.tag) list = list.filter(c => (c.tagList||[]).includes(f.tag));
  if (f.sort === "reviews") list.sort((a,b) => (b.ratingsCount||0)-(a.ratingsCount||0));
  if (f.sort === "newest") list.sort((a,b) => (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  if (f.sort === "easiest") list.sort((a,b) => (a.avgDifficulty||99)-(b.avgDifficulty||99));

  const allTags = new Set(); pub.forEach(c => (c.tagList||[]).forEach(t => allTags.add(t)));

  root.innerHTML = `
    <div class="page-head"><div><h1>🏠 الرئيسية</h1><p>${pub.length} مادة · ${state.professors.length} أستاذ · ${state.questions.length} سؤال</p></div></div>
    <div class="pills">
      ${["trending","top","easy","hard","recent","all"].map(t => {
        const L = { trending:"🔥 الأكثر تفاعلاً", top:"⭐ الأعلى تقييماً", easy:"😄 الأسهل", hard:"😰 الأصعب", recent:"🆕 الأحدث", all:"📚 الكل" };
        return `<button class="pill ${state.homeTab===t?"active":""}" data-tab="${t}">${L[t]}</button>`;
      }).join("")}
    </div>
    <div class="filters">
      <input id="fSearch" placeholder="🔍 ابحث…" value="${esc(f.search)}"/>
      <select id="fCollege"><option value="">كل الكليات</option>${state.colleges.map(c => `<option value="${esc(c.id)}" ${f.college===c.id?"selected":""}>${esc(c.name)}</option>`).join("")}</select>
      <select id="fMajor"><option value="">كل التخصصات</option>${state.majors.map(m => `<option value="${esc(m.id)}" ${f.major===m.id?"selected":""}>${esc(m.name)}</option>`).join("")}</select>
      <select id="fDiff"><option value="">كل المستويات</option><option value="easy" ${f.diff==="easy"?"selected":""}>سهل</option><option value="medium" ${f.diff==="medium"?"selected":""}>متوسط</option><option value="hard" ${f.diff==="hard"?"selected":""}>صعب</option></select>
      <select id="fSort"><option value="relevance">افتراضي</option><option value="reviews" ${f.sort==="reviews"?"selected":""}>الأكثر تقييماً</option><option value="newest" ${f.sort==="newest"?"selected":""}>الأحدث</option><option value="easiest" ${f.sort==="easiest"?"selected":""}>الأسهل</option></select>
    </div>
    ${allTags.size ? `<div class="pills">
      <button class="pill ${!f.tag?"active":""}" data-tag="">كل الوسوم</button>
      ${[...allTags].slice(0,12).map(t => `<button class="pill ${f.tag===t?"active":""}" data-tag="${esc(t)}">#${esc(t)}</button>`).join("")}
    </div>` : ""}
    <div id="coursesGrid" class="grid"></div>`;

  $$(".pill[data-tab]").forEach(b => b.addEventListener("click", () => { state.homeTab = b.dataset.tab; renderHome(root); }));
  $$(".pill[data-tag]").forEach(b => b.addEventListener("click", () => { state.filters.tag = b.dataset.tag; renderHome(root); }));
  let d; const redo = () => renderHome(root);
  $("#fSearch").addEventListener("input", () => { clearTimeout(d); d = setTimeout(() => { state.filters.search = $("#fSearch").value.trim(); redo(); }, 250); });
  $("#fCollege").addEventListener("change", () => { state.filters.college = $("#fCollege").value; redo(); });
  $("#fMajor").addEventListener("change", () => { state.filters.major = $("#fMajor").value; redo(); });
  $("#fDiff").addEventListener("change", () => { state.filters.diff = $("#fDiff").value; redo(); });
  $("#fSort").addEventListener("change", () => { state.filters.sort = $("#fSort").value; redo(); });

  const g = $("#coursesGrid");
  if (!list.length) g.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="em">🔍</div><h3>لا نتائج</h3></div>`;
  else {
    g.innerHTML = list.map(courseCardHTML).join("");
    g.querySelectorAll(".course-card").forEach(c => c.addEventListener("click", e => { if (!e.target.closest(".bookmark-btn")) openCourse(c.dataset.id); }));
    g.querySelectorAll(".bookmark-btn").forEach(b => b.addEventListener("click", async e => { e.stopPropagation(); await toggleBookmark(b.dataset.bm, b); }));
  }
}
function matchCollege(c, colId) {
  const t = c.targets || {};
  if (t.all) return true;
  if ((t.colleges||[]).includes(colId)) return true;
  const cm = state.majors.filter(m => m.collegeId === colId).map(m => m.id);
  return (t.majors||[]).some(mid => cm.includes(mid));
}
async function toggleBookmark(courseId, btn) {
  const docId = `${state.user.uid}_${courseId}`;
  const ref = doc(db, "bookmarks", docId);
  if (state.bookmarks.has(courseId)) {
    await deleteDoc(ref); state.bookmarks.delete(courseId);
    if (btn) { btn.classList.remove("on"); btn.textContent = "📑"; }
  } else {
    await setDoc(ref, { userId: state.user.uid, courseId, createdAt: serverTimestamp() });
    state.bookmarks.add(courseId);
    if (btn) { btn.classList.add("on"); btn.textContent = "🔖"; }
  }
}

/* ======================================================
   2) COURSE DETAIL
   ====================================================== */
function openCourse(id) { state.currentCourseId = id; state.currentProfessorId = null; const c = state.courses.find(x => x.id === id); if (c) trackVisit("course", id, c.name); render(); window.scrollTo({top:0,behavior:"smooth"}); }
window.openCourse = openCourse;

async function renderCourseDetail(root) {
  const c = state.courses.find(x => x.id === state.currentCourseId);
  if (!c) return gotoView("home");
  let reviews = [];
  try { const s = await getDocs(query(collection(db,"reviews"), where("courseId","==",c.id))); reviews = s.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)); } catch {}
  const prereq = c.hasPrerequisite && c.prerequisiteId ? state.courses.find(x => x.id === c.prerequisiteId) : null;
  const unlocked = state.courses.filter(x => x.hasPrerequisite && x.prerequisiteId === c.id);
  const myReview = reviews.find(r => r.userId === state.user.uid);
  const total = c.ratingsCount || 0;
  const eP = total ? Math.round((c.easyCount||0)/total*100) : 0;
  const mP = total ? Math.round((c.mediumCount||0)/total*100) : 0;
  const hP = total ? Math.round((c.hardCount||0)/total*100) : 0;
  const courseProfs = state.professors.filter(p => (p.courseIds||[]).includes(c.id));
  const bookmarked = state.bookmarks.has(c.id);
  const myStatus = state.userCourses[c.id];
  const relatedQ = state.questions.filter(q => q.courseId === c.id).slice(0,3);
  const relatedR = state.resources.filter(r => r.courseId === c.id).slice(0,3);
  const relatedG = state.studyGroups.filter(g => g.courseId === c.id).slice(0,3);

  root.innerHTML = `
    <button class="btn btn-ghost btn-sm" id="backBtn" style="margin-bottom:14px">← رجوع</button>
    <div class="detail-head">
      <div class="detail-actions">
        <button id="bookmarkBtn2">${bookmarked?"🔖 محفوظة":"📑 حفظ"}</button>
        <button id="shareBtn">🔗 مشاركة</button>
      </div>
      <span class="d-code">${esc(c.code||"—")}</span>
      <h1>${esc(c.name||"بدون اسم")}</h1>
      <div class="detail-tags">
        ${c.year?`<span class="tag">📅 سنة ${c.year}</span>`:""}
        ${c.hours?`<span class="tag">⏱️ ${c.hours} ساعات</span>`:""}
        ${(c.semesters||[]).map(s => `<span class="tag">${esc(SEM_LABELS[s]||s)}</span>`).join("")}
        ${c.type?`<span class="tag">${esc(TYPE_LABELS[c.type]||c.type)}</span>`:""}
      </div>
      ${c.avgOverall?`<div style="margin-top:14px;font-size:16px;font-weight:700">⭐ ${c.avgOverall.toFixed(1)} / 5 (${total} تقييم)</div>`:""}
    </div>

    <div class="section-title"><span class="bar"></span> حالتي مع المادة</div>
    <div class="pills">
      ${Object.entries(COURSE_STATUS).map(([k,v]) => `<button class="pill ${myStatus===k?"active":""}" data-status="${k}">${v}</button>`).join("")}
      ${myStatus?`<button class="pill" data-status="">✖ إزالة</button>`:""}
    </div>

    <div class="info-grid">
      ${infoItem("الوحدات", c.units ?? "—")}
      ${infoItem("نصفي", c.requiredSemesterUnits || "لا يوجد")}
      ${infoItem("نهائي", c.requiredFinalUnits ?? "—")}
      ${infoItem("نشاط", c.isActivity?"نعم":"لا")}
      ${infoItem("عملي", c.isPractical?"نعم":"لا")}
      ${infoItem("متطلب سابق", prereq ? `${esc(prereq.code)} - ${esc(prereq.name)}` : "لا")}
    </div>

    ${prereq || unlocked.length ? `
      <div class="section-title"><span class="bar"></span> 🌳 شجرة المتطلبات</div>
      <div class="ptree">
        ${prereq?`<div class="ptree-node parent">⬅️ <strong>${esc(prereq.code)}</strong> ${esc(prereq.name)}</div><div class="ptree-arrow" style="text-align:center">⬇️</div>`:""}
        <div class="ptree-node current">📘 <strong>${esc(c.code)}</strong> ${esc(c.name)}</div>
        ${unlocked.length?`<div class="ptree-arrow" style="text-align:center">⬇️</div><div class="ptree-children">${unlocked.map(u => `<div class="ptree-node">📗 <strong>${esc(u.code)}</strong> ${esc(u.name)}</div>`).join("")}</div>`:""}
      </div>` : ""}

    ${courseProfs.length?`
      <div class="section-title"><span class="bar"></span> 👨‍🏫 الأساتذة</div>
      <div class="grid">${courseProfs.map(p => `<div class="prof-card" data-prof="${esc(p.id)}"><div class="prof-top"><div class="prof-avatar">${esc((p.name||"؟").charAt(0))}</div><div class="prof-info"><h3 class="prof-name">${esc(p.name)}</h3><div class="prof-dept">${esc(p.department||"")}</div><div>${stars(p.avgRating)} <span class="muted">(${p.ratingCount||0})</span></div></div></div></div>`).join("")}</div>
    ` : ""}

    ${relatedQ.length || relatedR.length || relatedG.length ? `
      <div class="section-title"><span class="bar"></span> 🔗 من المجتمع</div>
      <div class="pills">
        ${relatedQ.length?`<button class="pill" id="goQs">💬 ${relatedQ.length} سؤال</button>`:""}
        ${relatedR.length?`<button class="pill" id="goRs">📚 ${relatedR.length} مورد</button>`:""}
        ${relatedG.length?`<button class="pill" id="goGs">👥 ${relatedG.length} مجموعة</button>`:""}
      </div>` : ""}

    <div class="section-title"><span class="bar"></span> التقييمات</div>
    <div class="rating-box">
      <div class="rating-stats">
        <div class="rate-stat easy"><div class="n">${c.easyCount||0}</div><div class="l">😄 سهل</div></div>
        <div class="rate-stat medium"><div class="n">${c.mediumCount||0}</div><div class="l">😐 متوسط</div></div>
        <div class="rate-stat hard"><div class="n">${c.hardCount||0}</div><div class="l">😰 صعب</div></div>
      </div>
      <div class="overall-bar"><span class="e" style="width:${eP}%"></span><span class="m" style="width:${mP}%"></span><span class="h" style="width:${hP}%"></span></div>
      <div class="section-title" style="margin:20px 0 6px;font-size:15px">${myReview?"عدّل تقييمك":"قيّم المادة"}</div>
      <div class="rate-actions">
        <button class="rate-btn easy ${myReview?.difficulty==="easy"?"active":""}" data-diff="easy"><span class="emoji">😄</span> سهل</button>
        <button class="rate-btn medium ${myReview?.difficulty==="medium"?"active":""}" data-diff="medium"><span class="emoji">😐</span> متوسط</button>
        <button class="rate-btn hard ${myReview?.difficulty==="hard"?"active":""}" data-diff="hard"><span class="emoji">😰</span> صعب</button>
      </div>
      <div class="section-title" style="margin:20px 0 6px;font-size:15px">تقييم تفصيلي</div>
      <div class="criteria-grid">
        ${Object.entries(CRITERIA).map(([k,label]) => `<div class="criteria-row"><div class="c-label">${label}</div><div class="c-stars" data-crit="${k}">${[1,2,3,4,5].map(n => `<span class="star ${myReview?.criteria?.[k]>=n?"on":""}" data-n="${n}">★</span>`).join("")}</div></div>`).join("")}
      </div>
    </div>

    <div class="section-title"><span class="bar"></span> 💬 التعليقات (${reviews.length})</div>
    <div class="rating-box">
      <div class="comment-form">
        <textarea id="commentText" placeholder="شارك تجربتك…">${esc(myReview?.comment||"")}</textarea>
        <button class="btn btn-primary" id="submitReview">${myReview?"تحديث":"نشر"} التقييم</button>
      </div>
      <div class="comment-list">
        ${reviews.length ? reviews.map(r => commentHTML(r)).join("") : `<div class="empty" style="padding:30px"><div class="em">💬</div><p>لا تعليقات بعد</p></div>`}
      </div>
    </div>`;

  $("#backBtn").addEventListener("click", () => gotoView("home"));
  $("#bookmarkBtn2").addEventListener("click", async () => { await toggleBookmark(c.id); renderCourseDetail(root); });
  $("#shareBtn").addEventListener("click", () => { navigator.clipboard?.writeText(`${location.origin}${location.pathname}#course=${c.id}`); toast("تم نسخ الرابط 🔗", "success"); });
  root.querySelectorAll("[data-prof]").forEach(el => el.addEventListener("click", () => openProfessor(el.dataset.prof)));
  $("#goQs")?.addEventListener("click", () => { state.communityTab = "questions"; gotoView("community"); });
  $("#goRs")?.addEventListener("click", () => { state.communityTab = "resources"; gotoView("community"); });
  $("#goGs")?.addEventListener("click", () => { state.communityTab = "groups"; gotoView("community"); });

  root.querySelectorAll("[data-status]").forEach(b => b.addEventListener("click", async () => {
    const s = b.dataset.status;
    const docId = `${state.user.uid}_${c.id}`;
    const ref = doc(db, "userCourses", docId);
    if (!s) { await deleteDoc(ref); delete state.userCourses[c.id]; }
    else { await setDoc(ref, { userId: state.user.uid, courseId: c.id, status: s, updatedAt: serverTimestamp() }); state.userCourses[c.id] = s; }
    toast("تم التحديث ✅", "success"); renderCourseDetail(root);
  }));

  let selectedDiff = myReview?.difficulty || null;
  const critSel = { workload: myReview?.criteria?.workload||0, teaching: myReview?.criteria?.teaching||0, usefulness: myReview?.criteria?.usefulness||0 };
  root.querySelectorAll(".rate-btn").forEach(b => b.addEventListener("click", () => {
    selectedDiff = b.dataset.diff;
    root.querySelectorAll(".rate-btn").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
  }));
  root.querySelectorAll(".c-stars").forEach(grp => {
    const crit = grp.dataset.crit;
    grp.querySelectorAll(".star").forEach(s => s.addEventListener("click", () => {
      const n = Number(s.dataset.n); critSel[crit] = n;
      grp.querySelectorAll(".star").forEach(x => x.classList.toggle("on", Number(x.dataset.n) <= n));
    }));
  });
  $("#submitReview").addEventListener("click", async () => {
    if (!selectedDiff) return toast("اختر مستوى الصعوبة", "error");
    const comment = $("#commentText").value.trim();
    try {
      await submitReview(c.id, selectedDiff, comment, critSel);
      toast("تم الحفظ ✅", "success");
      await loadCourses(); await refreshProfile();
      renderCourseDetail(root);
    } catch { toast("فشل الحفظ", "error"); }
  });
  bindCommentActions(root, reviews);
}
function infoItem(k,v) { return `<div class="info-item"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`; }
function commentHTML(r) {
  const init = (r.userName||"?").charAt(0);
  return `<div class="comment">
    <div class="comment-head">
      <div class="comment-user"><div class="comment-avatar">${esc(init)}</div><div><div class="comment-name">${esc(r.userName||"طالب")}</div><div class="comment-date">${fmtDate(r.createdAt)}</div></div></div>
      ${r.difficulty?`<span class="diff-pill ${r.difficulty}">${DIFF_EMOJI[r.difficulty]} ${DIFF_LABELS[r.difficulty]}</span>`:""}
    </div>
    ${r.comment?`<div class="comment-body">${esc(r.comment)}</div>`:""}
    <div class="comment-actions">
      <button class="react-btn" data-helpful="${esc(r.id)}">👍 <span class="rc">${r.helpful||0}</span> مفيد</button>
      <button class="react-btn" data-report="${esc(r.id)}">🚨 إبلاغ</button>
    </div>
  </div>`;
}
function bindCommentActions(root, reviews) {
  root.querySelectorAll("[data-helpful]").forEach(b => b.addEventListener("click", async () => {
    const rid = b.dataset.helpful;
    const ref = doc(db, "reviewReactions", `${rid}_${state.user.uid}`);
    const snap = await getDoc(ref);
    const reviewRef = doc(db, "reviews", rid);
    if (snap.exists()) {
      await deleteDoc(ref); await updateDoc(reviewRef, { helpful: increment(-1) });
      b.classList.remove("on");
    } else {
      await setDoc(ref, { reviewId: rid, userId: state.user.uid, createdAt: serverTimestamp() });
      await updateDoc(reviewRef, { helpful: increment(1) });
      b.classList.add("on");
      const rs = await getDoc(reviewRef);
      if (rs.exists()) await addXP(rs.data().userId, "helper", 2, "helpful50");
    }
    const r = reviews.find(x => x.id === rid); if (r) b.querySelector(".rc").textContent = (r.helpful||0) + (snap.exists()?-1:1);
  }));
  root.querySelectorAll("[data-report]").forEach(b => b.addEventListener("click", () => {
    openReportModal("review", b.dataset.report);
  }));
}
async function submitReview(courseId, difficulty, comment, criteria) {
  const uid = state.user.uid;
  const reviewId = `${courseId}_${uid}`;
  const reviewRef = doc(db, "reviews", reviewId);
  const courseRef = doc(db, "courses", courseId);
  const map = { easy:1, medium:2, hard:3 };
  await runTransaction(db, async tx => {
    const cs = await tx.get(courseRef); if (!cs.exists()) throw new Error("x");
    const c = cs.data(); const old = await tx.get(reviewRef);
    let easy = c.easyCount||0, med = c.mediumCount||0, hard = c.hardCount||0;
    let sum = c.ratingsSum||0, count = c.ratingsCount||0;
    let wS = c.workloadSum||0, wC = c.workloadCount||0, tS = c.teachingSum||0, tC = c.teachingCount||0, uS = c.usefulnessSum||0, uC = c.usefulnessCount||0;
    if (old.exists()) {
      const d = old.data();
      if (d.difficulty === "easy") easy--; else if (d.difficulty === "medium") med--; else hard--;
      sum -= map[d.difficulty]||0; count--;
      if (d.criteria?.workload) { wS -= d.criteria.workload; wC--; }
      if (d.criteria?.teaching) { tS -= d.criteria.teaching; tC--; }
      if (d.criteria?.usefulness) { uS -= d.criteria.usefulness; uC--; }
    }
    if (difficulty === "easy") easy++; else if (difficulty === "medium") med++; else hard++;
    sum += map[difficulty]||0; count++;
    if (criteria.workload) { wS += criteria.workload; wC++; }
    if (criteria.teaching) { tS += criteria.teaching; tC++; }
    if (criteria.usefulness) { uS += criteria.usefulness; uC++; }
    const avgOverall = ((wC?wS/wC:0)+(tC?tS/tC:0)+(uC?uS/uC:0)) / [wC,tC,uC].filter(x=>x).length || 0;
    tx.set(reviewRef, {
      courseId, userId: uid, userName: state.profile.name||"طالب",
      difficulty, comment, criteria,
      helpful: old.exists()?(old.data().helpful||0):0,
      createdAt: old.exists()?(old.data().createdAt||serverTimestamp()):serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    tx.update(courseRef, {
      easyCount: easy, mediumCount: med, hardCount: hard,
      ratingsSum: sum, ratingsCount: count, avgDifficulty: count?sum/count:0,
      workloadSum:wS, workloadCount:wC, workloadAvg:wC?wS/wC:0,
      teachingSum:tS, teachingCount:tC, teachingAvg:tC?tS/tC:0,
      usefulnessSum:uS, usefulnessCount:uC, usefulnessAvg:uC?uS/uC:0,
      avgOverall
    });
  });
  await addXP(uid, "academic", 5, "firstReview");
}

/* ======================================================
   3) COMMUNITY HUB
   ====================================================== */
function renderCommunity(root) {
  const tabs = [
    { id:"questions", label:"❓ أسئلة وأجوبة" },
    { id:"discussions", label:"💬 نقاشات" },
    { id:"resources", label:"📚 موارد وملخصات" },
    { id:"groups", label:"👥 مجموعات دراسة" }
  ];
  const addBtn = { questions:"❓ اطرح سؤالاً", discussions:"💬 ابدأ نقاشاً", resources:"📚 شارك مورداً", groups:"👥 أنشئ مجموعة" };
  root.innerHTML = `
    <div class="page-head"><div><h1>💬 المجتمع الأكاديمي</h1><p>نقاشات، أسئلة، موارد، ومجموعات مرتبطة بموادك وتخصصك.</p></div>
      <button class="btn btn-primary" id="addBtn">${addBtn[state.communityTab]}</button>
    </div>
    <div class="comm-tabs">
      ${tabs.map(t => `<button class="comm-tab ${state.communityTab===t.id?"active":""}" data-t="${t.id}">${t.label}</button>`).join("")}
    </div>
    <div class="filters">
      <input id="commSearch" placeholder="🔍 ابحث…"/>
      <select id="commCourse"><option value="">كل المواد</option>${state.courses.filter(c => c.status==="published").map(c => `<option value="${esc(c.id)}">${esc(c.code||"")} ${esc(c.name||"")}</option>`).join("")}</select>
      <select id="commSort"><option value="new">الأحدث</option><option value="top">الأعلى تفاعلاً</option></select>
      <select id="commStatus">
        <option value="all">الكل</option>
        <option value="unsolved">غير محلولة</option>
        <option value="solved">محلولة</option>
      </select>
    </div>
    <div id="commContent"></div>`;

  $$(".comm-tab").forEach(b => b.addEventListener("click", () => { state.communityTab = b.dataset.t; renderCommunity(root); }));
  $("#addBtn").addEventListener("click", () => {
    const t = state.communityTab;
    if (t === "questions") openQuestionForm();
    if (t === "discussions") openDiscussionForm();
    if (t === "resources") openResourceForm();
    if (t === "groups") openGroupForm();
  });
  $("#commSearch").addEventListener("input", drawCommunity);
  $("#commCourse").addEventListener("change", drawCommunity);
  $("#commSort").addEventListener("change", drawCommunity);
  $("#commStatus").addEventListener("change", drawCommunity);
  drawCommunity();

  function drawCommunity() {
    const term = $("#commSearch").value.trim().toLowerCase();
    const courseId = $("#commCourse").value;
    const sort = $("#commSort").value;
    const st = $("#commStatus").value;
    const content = $("#commContent");

    if (state.communityTab === "questions") {
      let list = [...state.questions];
      if (term) list = list.filter(q => (q.title||"").toLowerCase().includes(term) || (q.body||"").toLowerCase().includes(term));
      if (courseId) list = list.filter(q => q.courseId === courseId);
      if (st === "unsolved") list = list.filter(q => !q.acceptedAnswerId);
      if (st === "solved") list = list.filter(q => q.acceptedAnswerId);
      if (sort === "top") list.sort((a,b) => (b.upvotes||0)-(a.upvotes||0));
      content.innerHTML = list.length ? list.map(questionCardHTML).join("") : emptyBox("❓", "لا أسئلة بعد", "كن أول من يطرح سؤالاً");
      content.querySelectorAll("[data-qid]").forEach(el => el.addEventListener("click", () => openQuestion(el.dataset.qid)));
    }
    else if (state.communityTab === "discussions") {
      let list = [...state.discussions];
      if (term) list = list.filter(d => (d.title||"").toLowerCase().includes(term) || (d.body||"").toLowerCase().includes(term));
      if (courseId) list = list.filter(d => d.courseId === courseId);
      if (sort === "top") list.sort((a,b) => (b.replies||0)-(a.replies||0));
      content.innerHTML = list.length ? `<div class="grid">${list.map(discussionCardHTML).join("")}</div>` : emptyBox("💬", "لا نقاشات", "ابدأ نقاشاً جديداً");
      content.querySelectorAll("[data-did]").forEach(el => el.addEventListener("click", () => openDiscussion(el.dataset.did)));
    }
    else if (state.communityTab === "resources") {
      let list = [...state.resources];
      if (term) list = list.filter(r => (r.title||"").toLowerCase().includes(term) || (r.description||"").toLowerCase().includes(term));
      if (courseId) list = list.filter(r => r.courseId === courseId);
      if (sort === "top") list.sort((a,b) => (b.downloads||0)-(a.downloads||0));
      content.innerHTML = list.length ? `<div class="grid">${list.map(resourceCardHTML).join("")}</div>` : emptyBox("📚", "لا موارد", "شارك أول ملخص أو مورد");
      content.querySelectorAll("[data-rid]").forEach(el => el.addEventListener("click", () => openResource(el.dataset.rid)));
    }
    else if (state.communityTab === "groups") {
      let list = [...state.studyGroups];
      if (term) list = list.filter(g => (g.name||"").toLowerCase().includes(term) || (g.description||"").toLowerCase().includes(term));
      if (courseId) list = list.filter(g => g.courseId === courseId);
      content.innerHTML = list.length ? `<div class="grid">${list.map(groupCardHTML).join("")}</div>` : emptyBox("👥", "لا مجموعات", "أنشئ أول مجموعة دراسة");
      content.querySelectorAll("[data-gid]").forEach(el => el.addEventListener("click", () => openGroup(el.dataset.gid)));
    }
  }
}
function emptyBox(em, title, desc) { return `<div class="empty"><div class="em">${em}</div><h3>${title}</h3><p>${desc}</p></div>`; }

/* ---------- Questions ---------- */
function questionCardHTML(q) {
  const c = state.courses.find(x => x.id === q.courseId);
  const solved = !!q.acceptedAnswerId;
  const tags = [];
  if (q.isExam) tags.push(`<span class="tag exam">🎯 امتحاني</span>`);
  if (q.isFrequent) tags.push(`<span class="tag frequent">🔁 متكرر</span>`);
  if (solved) tags.push(`<span class="tag solved">✅ محلول</span>`);
  return `<div class="q-card" data-qid="${esc(q.id)}">
    <div class="q-stats">
      <div class="q-stat">${q.upvotes||0}<span class="ql">صوت</span></div>
      <div class="q-stat ${solved?"solved":""}">${q.answersCount||0}<span class="ql">إجابة</span></div>
    </div>
    <div class="q-body">
      <h3 class="q-title">${esc(q.title||"")}</h3>
      <div class="q-excerpt">${esc((q.body||"").slice(0,180))}</div>
      <div class="q-meta">
        ${c?`<span class="tag">📘 ${esc(c.code||"")} ${esc(c.name||"")}</span>`:""}
        <span class="tag">🏷️ ${esc(q.category||"عام")}</span>
        ${tags.join("")}
        <span class="muted" style="font-size:11.5px">· ${fmtDate(q.createdAt)} · بواسطة ${esc(q.userName||"طالب")}</span>
      </div>
    </div>
  </div>`;
}
function openQuestion(id) { state.currentQuestionId = id; const q = state.questions.find(x => x.id === id); if (q) trackVisit("question", id, q.title); render(); window.scrollTo({top:0,behavior:"smooth"}); }
window.openQuestion = openQuestion;

async function renderQuestionDetail(root) {
  const q = state.questions.find(x => x.id === state.currentQuestionId);
  if (!q) return gotoView("community");
  const c = state.courses.find(x => x.id === q.courseId);
  let answers = [];
  try { const s = await getDocs(query(collection(db,"answers"), where("questionId","==",q.id))); answers = s.docs.map(d => ({id:d.id,...d.data()})).sort((a,b) => (b.upvotes||0)-(a.upvotes||0)); } catch {}
  const myVote = q.voters?.[state.user.uid] || 0;
  const canAccept = q.userId === state.user.uid || isAdminUser();

  root.innerHTML = `
    <button class="btn btn-ghost btn-sm" onclick="gotoView('community')" style="margin-bottom:14px">← رجوع للمجتمع</button>

    <div class="q-detail-head">
      <div class="q-meta" style="margin-bottom:8px">
        ${c?`<span class="tag">📘 ${esc(c.code||"")} ${esc(c.name||"")}</span>`:""}
        <span class="tag">🏷️ ${esc(q.category||"عام")}</span>
        ${q.isExam?`<span class="tag exam">🎯 امتحاني</span>`:""}
        ${q.isFrequent?`<span class="tag frequent">🔁 متكرر</span>`:""}
        ${q.acceptedAnswerId?`<span class="tag solved">✅ محلول</span>`:""}
      </div>
      <h1>${esc(q.title||"")}</h1>
      <div class="muted" style="font-size:13px">بواسطة ${esc(q.userName||"طالب")} · ${fmtDate(q.createdAt)}</div>
      <p style="line-height:1.8;white-space:pre-wrap;margin-top:14px">${esc(q.body||"")}</p>
      <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" id="voteQBtn">${myVote?"👍 صوّت":"👍 صوت"} (${q.upvotes||0})</button>
        <button class="btn btn-ghost btn-sm" data-report="${esc(q.id)}" data-type="question">🚨 إبلاغ</button>
        ${canAccept?`<button class="btn btn-ghost btn-sm" id="toggleSolvedBtn">${q.acceptedAnswerId?"↩️ إلغاء الحل":"✅ تحديد كمحلول"}</button>`:""}
      </div>
    </div>

    <div class="section-title"><span class="bar"></span> الإجابات (${answers.length})</div>
    <div class="rating-box">
      <div class="comment-form">
        <textarea id="answerText" placeholder="اكتب إجابتك بوضوح…"></textarea>
        <button class="btn btn-primary" id="submitAnswer">📤 نشر الإجابة</button>
      </div>
      <div id="answersList">
        ${answers.length ? answers.map(a => answerHTML(a, q, canAccept)).join("") : `<div class="empty" style="padding:30px"><div class="em">💭</div><p>لا إجابات بعد. كن أول من يجيب!</p></div>`}
      </div>
    </div>`;

  $("#voteQBtn").addEventListener("click", async () => { await toggleVote("questions", q.id); await loadQuestions(); renderQuestionDetail(root); });
  $("#toggleSolvedBtn")?.addEventListener("click", async () => {
    await updateDoc(doc(db,"questions",q.id), { acceptedAnswerId: q.acceptedAnswerId ? null : (answers[0]?.id || null) });
    toast("تم التحديث ✅", "success"); await loadQuestions(); renderQuestionDetail(root);
  });
  $("#submitAnswer").addEventListener("click", async () => {
    const body = $("#answerText").value.trim();
    if (body.length < 5) return toast("الإجابة قصيرة جداً", "error");
    await addDoc(collection(db,"answers"), {
      questionId: q.id, body, userId: state.user.uid, userName: state.profile.name||"طالب",
      upvotes: 0, voters: {}, accepted: false, createdAt: serverTimestamp()
    });
    await updateDoc(doc(db,"questions",q.id), { answersCount: increment(1) });
    await addXP(state.user.uid, "helper", 10, "academicHelper");
    await addChallengeProgress("ch_answer3", 1);
    toast("تم نشر الإجابة ✅", "success");
    await loadQuestions(); renderQuestionDetail(root);
  });

  root.querySelectorAll("[data-vote-ans]").forEach(b => b.addEventListener("click", async () => { await toggleVote("answers", b.dataset.voteAns); renderQuestionDetail(root); }));
  root.querySelectorAll("[data-accept]").forEach(b => b.addEventListener("click", async () => {
    const aid = b.dataset.accept;
    await updateDoc(doc(db,"answers",aid), { accepted: true });
    await updateDoc(doc(db,"questions",q.id), { acceptedAnswerId: aid, solvedAt: serverTimestamp() });
    const ans = await getDoc(doc(db,"answers",aid));
    if (ans.exists()) await addXP(ans.data().userId, "helper", 30, "acceptedAnswer");
    toast("تم قبول الإجابة ✅", "success"); await loadQuestions(); renderQuestionDetail(root);
  }));
  root.querySelectorAll("[data-report]").forEach(b => b.addEventListener("click", () => openReportModal(b.dataset.type || "answer", b.dataset.report)));
}

function answerHTML(a, q, canAccept) {
  const myVote = a.voters?.[state.user.uid] || 0;
  const accepted = a.accepted || q.acceptedAnswerId === a.id;
  return `<div class="answer ${accepted?"accepted":""}">
    ${accepted?`<div class="accept-badge">✅ الحل المعتمد</div>`:""}
    <div class="answer-votes">
      <button class="vote-btn ${myVote?"on":""}" data-vote-ans="${esc(a.id)}">▲</button>
      <div class="vote-count">${a.upvotes||0}</div>
    </div>
    <div class="answer-body">
      <div class="comment-user" style="margin-bottom:8px">
        <div class="comment-avatar">${esc((a.userName||"?").charAt(0))}</div>
        <div><div class="comment-name">${esc(a.userName||"طالب")}</div><div class="comment-date">${fmtDate(a.createdAt)}</div></div>
      </div>
      <div class="comment-body">${esc(a.body||"")}</div>
      <div class="comment-actions">
        ${canAccept && !accepted?`<button class="react-btn" data-accept="${esc(a.id)}">✅ قبول كحل</button>`:""}
        <button class="react-btn" data-report="${esc(a.id)}" data-type="answer">🚨 إبلاغ</button>
      </div>
    </div>
  </div>`;
}

async function toggleVote(colName, docId) {
  const ref = doc(db, colName, docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  const voters = data.voters || {};
  const uid = state.user.uid;
  const hasVoted = !!voters[uid];
  if (hasVoted) {
    delete voters[uid];
    await updateDoc(ref, { voters, upvotes: increment(-1) });
  } else {
    voters[uid] = 1;
    await updateDoc(ref, { voters, upvotes: increment(1) });
  }
  if (colName === "answers") await addChallengeProgress("ch_vote5", 1);
}

function openQuestionForm() {
  const courseOpts = state.courses.filter(c => c.status==="published").map(c => `<option value="${esc(c.id)}">${esc(c.code||"")} ${esc(c.name||"")}</option>`).join("");
  openModal(`
    <div class="modal-head"><h3>❓ اطرح سؤالاً</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <label>المادة</label><select id="qfCourse">${courseOpts}</select>
      <label>التصنيف</label><select id="qfCat">${Q_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join("")}</select>
      <label>العنوان</label><input id="qfTitle" placeholder="اكتب سؤالاً واضحاً…"/>
      <label>التفاصيل</label><textarea id="qfBody" placeholder="اشرح المشكلة بالتفصيل…"></textarea>
      <div class="chk-group" style="margin-top:10px">
        <label class="chk" data-chk="exam"><input type="checkbox" id="qfExam"/> 🎯 سؤال امتحاني تدريبي</label>
        <label class="chk" data-chk="freq"><input type="checkbox" id="qfFreq"/> 🔁 مشكلة متكررة</label>
        <label class="chk" data-chk="follow"><input type="checkbox" id="qfFollow"/> 🔔 تنبيهي بالإجابات</label>
      </div>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" id="submitQ">نشر</button></div>
  `);
  $$(".chk").forEach(l => l.addEventListener("click", () => { const i = l.querySelector("input"); if (i) { setTimeout(() => l.classList.toggle("on", i.checked), 0); } }));
  $("#submitQ").addEventListener("click", async () => {
    const title = $("#qfTitle").value.trim();
    const body = $("#qfBody").value.trim();
    if (title.length < 5) return toast("العنوان قصير", "error");
    await addDoc(collection(db,"questions"), {
      courseId: $("#qfCourse").value, category: $("#qfCat").value,
      title, body, userId: state.user.uid, userName: state.profile.name||"طالب",
      upvotes: 0, voters: {}, answersCount: 0, acceptedAnswerId: null,
      isExam: $("#qfExam").checked, isFrequent: $("#qfFreq").checked,
      followers: $("#qfFollow").checked ? [state.user.uid] : [],
      createdAt: serverTimestamp()
    });
    closeModal(); toast("تم نشر السؤال ✅", "success");
    await loadQuestions(); render();
  });
}

/* ---------- Discussions ---------- */
function discussionCardHTML(d) {
  const c = state.courses.find(x => x.id === d.courseId);
  return `<div class="q-card" data-did="${esc(d.id)}">
    <div class="q-stats">
      <div class="q-stat">${d.replies||0}<span class="ql">رد</span></div>
      <div class="q-stat">${d.likes||0}<span class="ql">إعجاب</span></div>
    </div>
    <div class="q-body">
      <h3 class="q-title">${esc(d.title||"")}</h3>
      <div class="q-excerpt">${esc((d.body||"").slice(0,180))}</div>
      <div class="q-meta">
        ${c?`<span class="tag">📘 ${esc(c.code||"")}</span>`:""}
        <span class="muted" style="font-size:11.5px">· ${fmtDate(d.createdAt)} · ${esc(d.userName||"طالب")}</span>
      </div>
    </div>
  </div>`;
}
function openDiscussion(id) { state.currentDiscussionId = id; const d = state.discussions.find(x => x.id === id); if (d) trackVisit("discussion", id, d.title); render(); window.scrollTo({top:0,behavior:"smooth"}); }
window.openDiscussion = openDiscussion;

async function renderDiscussionDetail(root) {
  const d = state.discussions.find(x => x.id === state.currentDiscussionId);
  if (!d) return gotoView("community");
  let replies = [];
  try { const s = await getDocs(query(collection(db,"discussionReplies"), where("discussionId","==",d.id))); replies = s.docs.map(x => ({id:x.id,...x.data()})).sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0)); } catch {}

  root.innerHTML = `
    <button class="btn btn-ghost btn-sm" onclick="gotoView('community')" style="margin-bottom:14px">← رجوع</button>
    <div class="q-detail-head">
      <h1>${esc(d.title||"")}</h1>
      <div class="muted" style="font-size:13px">بواسطة ${esc(d.userName||"طالب")} · ${fmtDate(d.createdAt)}</div>
      <p style="line-height:1.8;white-space:pre-wrap;margin-top:14px">${esc(d.body||"")}</p>
    </div>
    <div class="section-title"><span class="bar"></span> الردود (${replies.length})</div>
    <div class="rating-box">
      <div class="comment-form">
        <textarea id="replyText" placeholder="شارك رأيك…"></textarea>
        <button class="btn btn-primary" id="submitReply">📤 نشر الرد</button>
      </div>
      <div class="comment-list">
        ${replies.length ? replies.map(r => `<div class="comment">
          <div class="comment-head"><div class="comment-user"><div class="comment-avatar">${esc((r.userName||"?").charAt(0))}</div><div><div class="comment-name">${esc(r.userName||"طالب")}</div><div class="comment-date">${fmtDate(r.createdAt)}</div></div></div></div>
          <div class="comment-body">${esc(r.body||"")}</div>
        </div>`).join("") : `<div class="empty" style="padding:30px"><p>لا ردود بعد</p></div>`}
      </div>
    </div>`;

  $("#submitReply").addEventListener("click", async () => {
    const body = $("#replyText").value.trim();
    if (body.length < 3) return toast("الرد قصير", "error");
    await addDoc(collection(db,"discussionReplies"), { discussionId: d.id, body, userId: state.user.uid, userName: state.profile.name||"طالب", createdAt: serverTimestamp() });
    await updateDoc(doc(db,"discussions",d.id), { replies: increment(1), lastReplyAt: serverTimestamp() });
    await addXP(state.user.uid, "academic", 3, null);
    toast("تم النشر ✅", "success");
    await loadDiscussions(); renderDiscussionDetail(root);
  });
}
function openDiscussionForm() {
  const courseOpts = state.courses.filter(c => c.status==="published").map(c => `<option value="${esc(c.id)}">${esc(c.code||"")} ${esc(c.name||"")}</option>`).join("");
  openModal(`
    <div class="modal-head"><h3>💬 ابدأ نقاشاً</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <label>المادة (اختياري)</label><select id="dfCourse"><option value="">— عام —</option>${courseOpts}</select>
      <label>العنوان</label><input id="dfTitle"/>
      <label>المحتوى</label><textarea id="dfBody"></textarea>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" id="submitD">نشر</button></div>
  `);
  $("#submitD").addEventListener("click", async () => {
    const title = $("#dfTitle").value.trim(), body = $("#dfBody").value.trim();
    if (!title) return toast("أدخل العنوان", "error");
    await addDoc(collection(db,"discussions"), { courseId: $("#dfCourse").value||null, title, body, userId: state.user.uid, userName: state.profile.name||"طالب", replies: 0, likes: 0, createdAt: serverTimestamp() });
    await addXP(state.user.uid, "academic", 5, "discussionStarter");
    closeModal(); toast("تم النشر ✅", "success"); await loadDiscussions(); render();
  });
}

/* ---------- Resources ---------- */
function resourceCardHTML(r) {
  const c = state.courses.find(x => x.id === r.courseId);
  const t = RES_TYPES[r.type] || "مورد";
  return `<div class="res-card" data-rid="${esc(r.id)}">
    <div class="res-icon">${r.type === "summary" ? "📝" : r.type === "video" ? "🎬" : r.type === "book" ? "📖" : "📄"}</div>
    <h3 class="res-title">${esc(r.title||"")}</h3>
    <div class="res-desc">${esc(r.description||"")}</div>
    <div class="q-meta">
      <span class="tag">${t}</span>
      ${c?`<span class="tag">📘 ${esc(c.code||"")}</span>`:""}
      <span class="muted" style="font-size:11.5px">· ${esc(r.userName||"طالب")} · ${fmtDate(r.createdAt)}</span>
    </div>
  </div>`;
}
function openResource(id) { const r = state.resources.find(x => x.id === id); if (r) trackVisit("resource", id, r.title); openModal(`
  <div class="modal-head"><h3>📚 ${esc(r.title||"")}</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
    <div class="q-meta" style="margin-bottom:10px">
      <span class="tag">${RES_TYPES[r.type]||"مورد"}</span>
      ${r.courseId?`<span class="tag">${esc(state.courses.find(c=>c.id===r.courseId)?.code||"")}</span>`:""}
    </div>
    <p style="line-height:1.8;white-space:pre-wrap">${esc(r.description||"")}</p>
    ${r.url?`<p style="margin-top:10px"><a href="${esc(r.url)}" target="_blank" rel="noopener">🔗 فتح الرابط</a></p>`:""}
    ${r.content?`<div style="background:var(--surface-2);padding:14px;border-radius:12px;white-space:pre-wrap;line-height:1.8;margin-top:14px">${esc(r.content)}</div>`:""}
  </div>
`);}
window.openResource = openResource;

function openResourceForm() {
  const courseOpts = state.courses.filter(c => c.status==="published").map(c => `<option value="${esc(c.id)}">${esc(c.code||"")} ${esc(c.name||"")}</option>`).join("");
  openModal(`
    <div class="modal-head"><h3>📚 شارك مورداً</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <label>المادة</label><select id="rfCourse">${courseOpts}</select>
      <label>النوع</label><select id="rfType">${Object.entries(RES_TYPES).map(([k,v]) => `<option value="${k}">${v}</option>`).join("")}</select>
      <label>العنوان</label><input id="rfTitle"/>
      <label>الوصف</label><textarea id="rfDesc"></textarea>
      <label>رابط (اختياري)</label><input id="rfUrl" placeholder="https://…"/>
      <label>المحتوى النصي (اختياري)</label><textarea id="rfContent" placeholder="اكتب ملاحظاتك أو ملخصك…"></textarea>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" id="submitR">نشر</button></div>
  `);
  $("#submitR").addEventListener("click", async () => {
    const title = $("#rfTitle").value.trim(), desc = $("#rfDesc").value.trim();
    if (!title) return toast("أدخل العنوان", "error");
    await addDoc(collection(db,"resources"), {
      courseId: $("#rfCourse").value, type: $("#rfType").value, title, description: desc,
      url: $("#rfUrl").value.trim(), content: $("#rfContent").value.trim(),
      userId: state.user.uid, userName: state.profile.name||"طالب", downloads: 0, createdAt: serverTimestamp()
    });
    await addXP(state.user.uid, "resource", 15, "resourceMaker");
    await addChallengeProgress("ch_res1", 1);
    closeModal(); toast("تم النشر ✅", "success"); await loadResources(); render();
  });
}

/* ---------- Study Groups ---------- */
function groupCardHTML(g) {
  const c = state.courses.find(x => x.id === g.courseId);
  const members = (g.members||[]).length;
  return `<div class="group-card" data-gid="${esc(g.id)}">
    <div class="group-icon">${esc((g.name||"؟").charAt(0))}</div>
    <h3 class="res-title">${esc(g.name||"")}</h3>
    <div class="res-desc">${esc(g.description||"")}</div>
    <div class="q-meta">
      ${c?`<span class="tag">📘 ${esc(c.code||"")}</span>`:""}
      <span class="tag">👥 ${members} عضو</span>
      ${g.schedule?`<span class="tag">🗓️ ${esc(g.schedule)}</span>`:""}
    </div>
  </div>`;
}
function openGroup(id) { state.currentGroupId = id; const g = state.studyGroups.find(x => x.id === id); if (g) trackVisit("group", id, g.name); render(); window.scrollTo({top:0,behavior:"smooth"}); }
window.openGroup = openGroup;

async function renderGroupDetail(root) {
  const g = state.studyGroups.find(x => x.id === state.currentGroupId);
  if (!g) return gotoView("community");
  const c = state.courses.find(x => x.id === g.courseId);
  const isMember = (g.members||[]).includes(state.user.uid);
  const members = (g.members||[]).map(id => id);

  root.innerHTML = `
    <button class="btn btn-ghost btn-sm" onclick="gotoView('community')" style="margin-bottom:14px">← رجوع</button>
    <div class="detail-head">
      <h1>👥 ${esc(g.name||"")}</h1>
      <div style="opacity:.9">${c?`📘 ${esc(c.code||"")} · `:""}👥 ${members.length} عضو ${g.schedule?`· 🗓️ ${esc(g.schedule)}`:""}</div>
    </div>
    <div class="rating-box" style="margin-bottom:18px">
      <p style="line-height:1.8;white-space:pre-wrap">${esc(g.description||"")}</p>
      ${!isMember ? `<button class="btn btn-primary" id="joinBtn" style="margin-top:14px">✅ انضم للمجموعة</button>` :
        `<button class="btn btn-ghost" id="leaveBtn" style="margin-top:14px">🚪 مغادرة</button>`}
    </div>
    <div class="section-title"><span class="bar"></span> الأعضاء (${members.length})</div>
    <div class="grid">
      ${members.slice(0,12).map(uid => `<div class="prof-card"><div class="prof-top"><div class="prof-avatar">👤</div><div class="prof-info"><h3 class="prof-name">${uid === state.user.uid ? esc(state.profile.name||"أنا") : "طالب"}</h3></div></div></div>`).join("")}
    </div>`;

  $("#joinBtn")?.addEventListener("click", async () => {
    await updateDoc(doc(db,"studyGroups",g.id), { members: arrayUnion(state.user.uid) });
    await addXP(state.user.uid, "academic", 2, null);
    toast("تم الانضمام ✅", "success"); await loadStudyGroups(); renderGroupDetail(root);
  });
  $("#leaveBtn")?.addEventListener("click", async () => {
    await updateDoc(doc(db,"studyGroups",g.id), { members: arrayRemove(state.user.uid) });
    toast("تمت المغادرة", "info"); await loadStudyGroups(); renderGroupDetail(root);
  });
}
function openGroupForm() {
  const courseOpts = state.courses.filter(c => c.status==="published").map(c => `<option value="${esc(c.id)}">${esc(c.code||"")} ${esc(c.name||"")}</option>`).join("");
  openModal(`
    <div class="modal-head"><h3>👥 أنشئ مجموعة دراسة</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <label>المادة</label><select id="gfCourse">${courseOpts}</select>
      <label>اسم المجموعة</label><input id="gfName" placeholder="مثال: مجموعة مراجعة CS101"/>
      <label>الوصف</label><textarea id="gfDesc"></textarea>
      <label>الجدول (اختياري)</label><input id="gfSched" placeholder="مثال: كل أحد 7م"/>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" id="submitG">إنشاء</button></div>
  `);
  $("#submitG").addEventListener("click", async () => {
    const name = $("#gfName").value.trim();
    if (!name) return toast("أدخل الاسم", "error");
    await addDoc(collection(db,"studyGroups"), {
      courseId: $("#gfCourse").value, name, description: $("#gfDesc").value.trim(),
      schedule: $("#gfSched").value.trim(), ownerId: state.user.uid,
      members: [state.user.uid], createdAt: serverTimestamp()
    });
    await addXP(state.user.uid, "academic", 10, "organizer");
    closeModal(); toast("تم الإنشاء ✅", "success"); await loadStudyGroups(); render();
  });
}

/* ======================================================
   4) XP & BADGES & CHALLENGES
   ====================================================== */
async function addXP(userId, type, amount, badge = null) {
  if (!userId) return;
  const ref = doc(db,"users",userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const d = snap.data();
  const xp = d.xp || { academic:0, resource:0, helper:0 };
  xp[type] = (xp[type]||0) + amount;
  const total = (xp.academic||0) + (xp.resource||0) + (xp.helper||0);
  const badges = new Set(d.badges||[]);
  if (badge) badges.add(badge);
  if (total >= 500) badges.add("topContributor");
  if ((xp.academic||0) >= 100) badges.add("courseEnricher");
  if ((xp.resource||0) >= 100) badges.add("resourceMaker");
  if ((xp.helper||0) >= 200) badges.add("academicHelper");
  await updateDoc(ref, { xp, points: total, badges: [...badges] });
}

/* ---- Challenges (weekly, localStorage) ---- */
function weekKey() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day;
  const sunday = new Date(d.setDate(diff));
  return `${sunday.getFullYear()}-${sunday.getMonth()}-${sunday.getDate()}`;
}
function getChallengesState() {
  const all = JSON.parse(localStorage.getItem("unirate-challenges") || "{}");
  const wk = weekKey();
  if (!all[wk]) all[wk] = {};
  return { all, wk, cur: all[wk] };
}
async function addChallengeProgress(chId, delta) {
  const { all, wk, cur } = getChallengesState();
  if (!cur[chId]) cur[chId] = { progress: 0, claimed: false };
  const ch = WEEKLY_CHALLENGES.find(c => c.id === chId);
  if (!ch) return;
  cur[chId].progress = Math.min((cur[chId].progress || 0) + delta, ch.target);
  all[wk] = cur;
  localStorage.setItem("unirate-challenges", JSON.stringify(all));
  if (cur[chId].progress >= ch.target && !cur[chId].claimed) {
    cur[chId].claimed = true;
    all[wk] = cur;
    localStorage.setItem("unirate-challenges", JSON.stringify(all));
    await addXP(state.user.uid, "academic", ch.reward, null);
    toast(`🏆 أكملت: ${ch.name} (+${ch.reward} نقطة)`, "success");
  }
}

/* ======================================================
   5) PROFESSORS
   ====================================================== */
function renderProfessors(root) {
  root.innerHTML = `
    <div class="page-head"><div><h1>👨‍🏫 الأساتذة</h1><p>تصفّح وقيّم</p></div></div>
    <div class="filters">
      <input id="pSearch" placeholder="🔍 ابحث…"/>
      <select id="pCollege"><option value="">كل الكليات</option>${state.colleges.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("")}</select>
      <select id="pSort"><option value="rating">الأعلى تقييماً</option><option value="name">الاسم</option></select>
    </div>
    <div id="profGrid" class="grid"></div>`;
  function draw() {
    const t = $("#pSearch").value.trim().toLowerCase();
    const col = $("#pCollege").value, sort = $("#pSort").value;
    let list = [...state.professors];
    if (t) list = list.filter(p => (p.name||"").toLowerCase().includes(t));
    if (col) list = list.filter(p => p.collegeId === col);
    if (sort === "rating") list.sort((a,b) => (b.avgRating||0)-(a.avgRating||0));
    if (sort === "name") list.sort((a,b) => (a.name||"").localeCompare(b.name||""));
    const g = $("#profGrid");
    if (!list.length) g.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="em">👨‍🏫</div><p>لا نتائج</p></div>`;
    else {
      g.innerHTML = list.map(p => `<div class="prof-card" data-id="${esc(p.id)}"><div class="prof-top"><div class="prof-avatar">${esc((p.name||"؟").charAt(0))}</div><div class="prof-info"><h3 class="prof-name">${esc(p.name)}</h3><div class="prof-dept">${esc(p.department||"")}</div><div>${stars(p.avgRating)} <span class="muted">(${p.ratingCount||0})</span></div></div></div></div>`).join("");
      g.querySelectorAll(".prof-card").forEach(el => el.addEventListener("click", () => openProfessor(el.dataset.id)));
    }
  }
  ["pSearch","pCollege","pSort"].forEach(id => $("#"+id).addEventListener("input", draw));
  $("#pCollege").addEventListener("change", draw); $("#pSort").addEventListener("change", draw);
  draw();
}
function openProfessor(id) { state.currentProfessorId = id; state.currentCourseId = null; const p = state.professors.find(x => x.id === id); if (p) trackVisit("professor", id, p.name); render(); window.scrollTo({top:0,behavior:"smooth"}); }
window.openProfessor = openProfessor;

async function renderProfessorDetail(root) {
  const p = state.professors.find(x => x.id === state.currentProfessorId);
  if (!p) return gotoView("professors");
  const myRating = p.myRating?.[state.user.uid] || 0;
  root.innerHTML = `
    <button class="btn btn-ghost btn-sm" onclick="gotoView('professors')" style="margin-bottom:14px">← رجوع</button>
    <div class="detail-head">
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
        <div class="prof-avatar" style="width:80px;height:80px;font-size:32px;background:rgba(255,255,255,.25)">${esc((p.name||"؟").charAt(0))}</div>
        <div><h1 style="margin:0 0 4px">${esc(p.name)}</h1><div style="opacity:.9">${esc(p.department||"")}</div><div style="margin-top:8px;font-size:18px">${stars(p.avgRating)} <span style="opacity:.9">(${p.ratingCount||0})</span></div></div>
      </div>
    </div>
    ${p.bio?`<div class="rating-box" style="margin-bottom:18px"><strong>نبذة</strong><p>${esc(p.bio)}</p></div>`:""}
    <div class="section-title"><span class="bar"></span> قيّم الأستاذ</div>
    <div class="rating-box">
      <div class="criteria-row" style="background:transparent;padding:0">
        <div class="c-stars" id="profStars" style="font-size:32px">${[1,2,3,4,5].map(n => `<span class="star ${myRating>=n?"on":""}" data-n="${n}" style="font-size:32px">★</span>`).join("")}</div>
      </div>
      <button class="btn btn-primary" id="rateProfBtn" style="margin-top:12px">حفظ التقييم</button>
    </div>`;
  let picked = myRating;
  root.querySelectorAll("#profStars .star").forEach(s => s.addEventListener("click", () => {
    picked = Number(s.dataset.n);
    root.querySelectorAll("#profStars .star").forEach(x => x.classList.toggle("on", Number(x.dataset.n) <= picked));
  }));
  $("#rateProfBtn").addEventListener("click", async () => {
    if (!picked) return toast("اختر النجوم", "error");
    const myRatings = p.myRating || {};
    const old = myRatings[state.user.uid] || 0;
    myRatings[state.user.uid] = picked;
    let count = p.ratingCount || 0, sum = (p.avgRating || 0) * count;
    sum -= old; count -= old ? 1 : 0; sum += picked; count++;
    await updateDoc(doc(db,"professors",p.id), { myRating: myRatings, ratingCount: count, avgRating: count ? sum/count : 0 });
    toast("تم التقييم ✅", "success"); await loadProfessors(); renderProfessorDetail(root);
  });
}

/* ======================================================
   6) STATS / BOOKMARKS / MY COURSES
   ====================================================== */
function renderStats(root) {
  const pub = state.courses.filter(c => c.status === "published");
  const totalReviews = pub.reduce((s,c) => s + (c.ratingsCount||0), 0);
  const topRated = [...pub].filter(c => c.ratingsCount >= 2).sort((a,b) => (b.avgOverall||0)-(a.avgOverall||0)).slice(0,5);
  const hardest = [...pub].filter(c => c.ratingsCount).sort((a,b) => (b.avgDifficulty||0)-(a.avgDifficulty||0)).slice(0,5);
  const easiest = [...pub].filter(c => c.ratingsCount).sort((a,b) => (a.avgDifficulty||99)-(b.avgDifficulty||99)).slice(0,5);
  const trending = [...pub].sort((a,b) => (b.ratingsCount||0)-(a.ratingsCount||0)).slice(0,5);

  root.innerHTML = `
    <div class="page-head"><div><h1>📊 الإحصائيات</h1><p>نظرة عامة على المجتمع</p></div></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="s-icon">📚</div><div class="s-label">المواد</div><div class="s-value">${pub.length}</div></div>
      <div class="stat-card"><div class="s-icon">⭐</div><div class="s-label">التقييمات</div><div class="s-value">${totalReviews}</div></div>
      <div class="stat-card"><div class="s-icon">💬</div><div class="s-label">الأسئلة</div><div class="s-value">${state.questions.length}</div></div>
      <div class="stat-card"><div class="s-icon">📚</div><div class="s-label">الموارد</div><div class="s-value">${state.resources.length}</div></div>
      <div class="stat-card"><div class="s-icon">👥</div><div class="s-label">المجموعات</div><div class="s-value">${state.studyGroups.length}</div></div>
      <div class="stat-card"><div class="s-icon">👨‍🏫</div><div class="s-label">الأساتذة</div><div class="s-value">${state.professors.length}</div></div>
    </div>
    <div class="section-title"><span class="bar"></span> 🔥 الأكثر تفاعلاً</div>
    <div class="rank-list">${trending.map((c,i) => rankItem(c,i+1,`${c.ratingsCount||0} تقييم`)).join("") || emptyMini()}</div>
    <div class="section-title"><span class="bar"></span> ⭐ الأعلى تقييماً</div>
    <div class="rank-list">${topRated.map((c,i) => rankItem(c,i+1,`${(c.avgOverall||0).toFixed(1)}/5`)).join("") || emptyMini()}</div>
    <div class="section-title"><span class="bar"></span> 😰 الأصعب</div>
    <div class="rank-list">${hardest.map((c,i) => rankItem(c,i+1,`صعوبة ${(c.avgDifficulty||0).toFixed(1)}`)).join("") || emptyMini()}</div>
    <div class="section-title"><span class="bar"></span> 😄 الأسهل</div>
    <div class="rank-list">${easiest.map((c,i) => rankItem(c,i+1,`صعوبة ${(c.avgDifficulty||0).toFixed(1)}`)).join("") || emptyMini()}</div>`;
  root.querySelectorAll(".rank-item").forEach(el => el.addEventListener("click", () => openCourse(el.dataset.id)));
}
function rankItem(c, n, meta) { return `<div class="rank-item" data-id="${esc(c.id)}"><div class="rank-num">${n}</div><div class="ri-body"><div class="ri-title">${esc(c.code||"—")} · ${esc(c.name||"")}</div><div class="ri-meta">${meta}</div></div><span class="muted">→</span></div>`; }
function emptyMini() { return `<div class="empty" style="padding:30px"><div class="em">📊</div><p>لا بيانات كافية</p></div>`; }

function renderBookmarks(root) {
  const list = state.courses.filter(c => state.bookmarks.has(c.id));
  root.innerHTML = `<div class="page-head"><div><h1>🔖 المفضلة</h1><p>${list.length} مادة</p></div></div>
    ${list.length ? `<div class="grid" id="bmGrid">${list.map(courseCardHTML).join("")}</div>` : `<div class="empty"><div class="em">🔖</div><h3>لا مفضلات</h3><p>اضغط 📑 على أي مادة</p></div>`}`;
  root.querySelectorAll(".course-card").forEach(card => card.addEventListener("click", e => { if (!e.target.closest(".bookmark-btn")) openCourse(card.dataset.id); }));
  root.querySelectorAll(".bookmark-btn").forEach(b => b.addEventListener("click", async e => { e.stopPropagation(); await toggleBookmark(b.dataset.bm, b); renderBookmarks(root); }));
}
function renderMyCourses(root) {
  const taken = state.courses.filter(c => state.userCourses[c.id] === "taken");
  const taking = state.courses.filter(c => state.userCourses[c.id] === "taking");
  const planned = state.courses.filter(c => state.userCourses[c.id] === "planned");
  const totalHours = taken.reduce((s,c) => s + (c.hours||0), 0);
  root.innerHTML = `
    <div class="page-head"><div><h1>📚 موادّي</h1><p>تتبّع حالتك الدراسية</p></div></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="s-icon">✅</div><div class="s-label">أنجزت</div><div class="s-value">${taken.length}</div></div>
      <div class="stat-card"><div class="s-icon">📖</div><div class="s-label">أدرس حالياً</div><div class="s-value">${taking.length}</div></div>
      <div class="stat-card"><div class="s-icon">🎯</div><div class="s-label">أخطط</div><div class="s-value">${planned.length}</div></div>
      <div class="stat-card"><div class="s-icon">⏱️</div><div class="s-label">ساعات مُنجزة</div><div class="s-value">${totalHours}</div></div>
    </div>
    ${renderSection("✅ أنجزت", taken)}
    ${renderSection("📖 أدرس حالياً", taking)}
    ${renderSection("🎯 أخطط لها", planned)}`;
  root.querySelectorAll(".course-card").forEach(card => card.addEventListener("click", () => openCourse(card.dataset.id)));
}
function renderSection(t, list) { return list.length ? `<div class="section-title"><span class="bar"></span> ${t} (${list.length})</div><div class="grid" style="margin-bottom:22px">${list.map(courseCardHTML).join("")}</div>` : ""; }

/* ======================================================
   7) PROFILE / CONTRIBUTIONS / SUMMARY / SETTINGS
   ====================================================== */
async function refreshProfile() { const s = await getDoc(doc(db,"users",state.user.uid)); if (s.exists()) state.profile = { uid: state.user.uid, ...s.data() }; }

async function renderProfile(root) {
  const p = state.profile; // استخدم البيانات المخزنة فوراً

  // اعرض فوراً بدون انتظار
  const myQuestions = state.questions.filter(q => q.userId === state.user.uid).length;
  const myResources = state.resources.filter(r => r.userId === state.user.uid).length;
  const myGroups = state.studyGroups.filter(g => (g.members||[]).includes(state.user.uid)).length;
  const xp = p.xp || { academic:0, resource:0, helper:0 };
  const badges = p.badges || [];
  const privacy = p.privacy || {};
  const levelNames = ["","أول","ثاني","ثالث","رابع","خامس+"];

  // استخدم reviewsCount المحفوظ (إن وُجد) أو 0
  const myReviewsCount = p.reviewsCount || 0;
  const myAnswersCount = p.answersCount || 0;

  root.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar-big">${esc((p.name||"؟").charAt(0))}</div>
      <div style="flex:1;min-width:0">
        <h1>${esc(p.name||"طالب")}</h1>
        ${privacy.showMajor !== false ? `<div class="ph-meta">🎓 ${esc(state.majors.find(m=>m.id===p.majorId)?.name||"—")}${privacy.showLevel !== false ? ` · المستوى ${levelNames[p.level]||"—"}`:""}</div>` : ""}
        <div class="ph-meta">🏛️ ${esc(state.colleges.find(c=>c.id===p.collegeId)?.name||"—")} · 📍 ${esc(p.branch||"—")}</div>
      </div>
      <button class="btn btn-ghost" id="editProfileBtn">✏️ تعديل</button>
    </div>

    <div class="section-title"><span class="bar"></span> 📊 مستويات الخبرة</div>
    <div class="xp-grid">
      <div class="xp-card"><div class="xp-icon">🎓</div><div class="xp-name">أكاديمي</div><div class="xp-value">${xp.academic||0}</div><div class="xp-bar"><span style="width:${Math.min(100,(xp.academic||0)/10)}%"></span></div><div class="xp-level">المستوى ${xpLevel(xp.academic||0)}</div></div>
      <div class="xp-card"><div class="xp-icon">📚</div><div class="xp-name">موارد</div><div class="xp-value">${xp.resource||0}</div><div class="xp-bar"><span style="width:${Math.min(100,(xp.resource||0)/10)}%"></span></div><div class="xp-level">المستوى ${xpLevel(xp.resource||0)}</div></div>
      <div class="xp-card"><div class="xp-icon">🤝</div><div class="xp-name">مساعدة</div><div class="xp-value">${xp.helper||0}</div><div class="xp-bar"><span style="width:${Math.min(100,(xp.helper||0)/10)}%"></span></div><div class="xp-level">المستوى ${xpLevel(xp.helper||0)}</div></div>
    </div>

    <div class="section-title"><span class="bar"></span> 📈 إحصائياتي</div>
    <div class="stats-grid">
      <div class="stat-card"><div class="s-icon">⭐</div><div class="s-label">تقييماتي</div><div class="s-value" id="statReviews">…</div></div>
      <div class="stat-card"><div class="s-icon">❓</div><div class="s-label">أسئلتي</div><div class="s-value">${myQuestions}</div></div>
      <div class="stat-card"><div class="s-icon">💬</div><div class="s-label">إجاباتي</div><div class="s-value" id="statAnswers">…</div></div>
      <div class="stat-card"><div class="s-icon">📚</div><div class="s-label">مواردي</div><div class="s-value">${myResources}</div></div>
      <div class="stat-card"><div class="s-icon">👥</div><div class="s-label">مجموعاتي</div><div class="s-value">${myGroups}</div></div>
      <div class="stat-card"><div class="s-icon">🔖</div><div class="s-label">مفضلاتي</div><div class="s-value">${state.bookmarks.size}</div></div>
    </div>

    <div class="section-title"><span class="bar"></span> 🎖️ الشارات (${badges.length}/${Object.keys(BADGES).length})</div>
    <div class="badges-grid">
      ${Object.entries(BADGES).map(([k,b]) => `<div class="badge-item ${badges.includes(k)?"":"locked"}"><div class="b-ico">${b.icon}</div><div class="b-name">${b.name}</div><div class="muted" style="font-size:11.5px;margin-top:4px">${b.desc}</div></div>`).join("")}
    </div>`;

  $("#editProfileBtn").addEventListener("click", () => openEditProfile());

  // ⚡ اجلب البيانات الحية في الخلفية بدون حجب الواجهة
  try {
    const [reviewSnap, ansSnap, freshProfile] = await Promise.all([
      getDocs(query(collection(db,"reviews"), where("userId","==",state.user.uid))),
      getDocs(query(collection(db,"answers"), where("userId","==",state.user.uid))),
      getDoc(doc(db,"users",state.user.uid))
    ]);
    const el1 = $("#statReviews"); if (el1) el1.textContent = reviewSnap.size;
    const el2 = $("#statAnswers"); if (el2) el2.textContent = ansSnap.size;
    if (freshProfile.exists()) state.profile = { uid: state.user.uid, ...freshProfile.data() };
  } catch(e) {
    console.warn("Background profile fetch failed:", e.message);
    const el1 = $("#statReviews"); if (el1) el1.textContent = myReviewsCount;
    const el2 = $("#statAnswers"); if (el2) el2.textContent = myAnswersCount;
  }
}

function openEditProfile() {
  const p = state.profile;
  const colOpts = state.colleges.map(c => `<option value="${esc(c.id)}" ${p.collegeId===c.id?"selected":""}>${esc(c.name)}</option>`).join("");
  const majOpts = state.majors.map(m => `<option value="${esc(m.id)}" ${p.majorId===m.id?"selected":""}>${esc(m.name)}</option>`).join("");
  const priv = p.privacy || {};
  const pRow = (key, label) => `<div class="privacy-row"><span>${label}</span><div class="switch ${priv[key]!==false?"on":""}" data-priv="${key}"></div></div>`;
  openModal(`
    <div class="modal-head"><h3>✏️ تعديل الملف والخصوصية</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <label>الاسم</label><input id="epName" value="${esc(p.name||"")}"/>
      <label>الكلية</label><select id="epCollege"><option value="">—</option>${colOpts}</select>
      <label>التخصص</label><select id="epMajor"><option value="">—</option>${majOpts}</select>
      <label>الفرع</label><input id="epBranch" value="${esc(p.branch||"")}"/>
      <label>المستوى</label><select id="epLevel">${[1,2,3,4,5].map(n => `<option value="${n}" ${p.level===n?"selected":""}>${["","أول","ثاني","ثالث","رابع","خامس+"][n]}</option>`).join("")}</select>
      <div class="section-title" style="margin-top:22px;font-size:15px"><span class="bar"></span> الخصوصية</div>
      ${pRow("showMajor", "إظهار التخصص")}
      ${pRow("showLevel", "إظهار المستوى الدراسي")}
      ${pRow("showBadges", "إظهار الشارات")}
      ${pRow("showContribs", "إظهار المساهمات")}
      ${pRow("showGroups", "إظهار المجموعات")}
      ${pRow("showResources", "إظهار الموارد")}
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" id="saveProfileBtn">حفظ</button></div>
  `);
  const privacy = { ...priv };
  $$("[data-priv]").forEach(sw => sw.addEventListener("click", () => { sw.classList.toggle("on"); privacy[sw.dataset.priv] = sw.classList.contains("on"); }));
  $("#saveProfileBtn").addEventListener("click", async () => {
    await updateDoc(doc(db,"users",state.user.uid), {
      name: $("#epName").value.trim(), collegeId: $("#epCollege").value,
      majorId: $("#epMajor").value, branch: $("#epBranch").value.trim(),
      level: Number($("#epLevel").value)||1, privacy
    });
    toast("تم الحفظ ✅", "success"); closeModal();
    $("#userName").textContent = $("#epName").value.trim();
    renderProfile($("#viewRoot"));
  });
}

async function renderMyContributions(root) {
  const myQs = state.questions.filter(q => q.userId === state.user.uid);
  const myDs = state.discussions.filter(d => d.userId === state.user.uid);
  const myRs = state.resources.filter(r => r.userId === state.user.uid);
  const myGs = state.studyGroups.filter(g => g.ownerId === state.user.uid);

  root.innerHTML = `
    <div class="page-head"><div><h1>📝 مساهماتي</h1><p>كل ما شاركته في المجتمع</p></div></div>
    <div class="section-title"><span class="bar"></span> ❓ أسئلتي (${myQs.length})</div>
    ${myQs.length ? myQs.map(q => `<div class="contrib-item" data-qid="${esc(q.id)}"><div class="contrib-icon">❓</div><div class="contrib-body"><div class="contrib-title">${esc(q.title||"")}</div><div class="contrib-meta">${q.answersCount||0} إجابة · ${fmtDate(q.createdAt)}</div></div></div>`).join("") : `<div class="empty" style="padding:20px"><p>لا أسئلة</p></div>`}
    <div class="section-title"><span class="bar"></span> 💬 نقاشاتي (${myDs.length})</div>
    ${myDs.length ? myDs.map(d => `<div class="contrib-item" data-did="${esc(d.id)}"><div class="contrib-icon">💬</div><div class="contrib-body"><div class="contrib-title">${esc(d.title||"")}</div><div class="contrib-meta">${d.replies||0} رد · ${fmtDate(d.createdAt)}</div></div></div>`).join("") : `<div class="empty" style="padding:20px"><p>لا نقاشات</p></div>`}
    <div class="section-title"><span class="bar"></span> 📚 مواردي (${myRs.length})</div>
    ${myRs.length ? myRs.map(r => `<div class="contrib-item" data-rid="${esc(r.id)}"><div class="contrib-icon">📚</div><div class="contrib-body"><div class="contrib-title">${esc(r.title||"")}</div><div class="contrib-meta">${RES_TYPES[r.type]||"مورد"} · ${fmtDate(r.createdAt)}</div></div></div>`).join("") : `<div class="empty" style="padding:20px"><p>لا موارد</p></div>`}
    <div class="section-title"><span class="bar"></span> 👥 مجموعاتي (${myGs.length})</div>
    ${myGs.length ? myGs.map(g => `<div class="contrib-item" data-gid="${esc(g.id)}"><div class="contrib-icon">👥</div><div class="contrib-body"><div class="contrib-title">${esc(g.name||"")}</div><div class="contrib-meta">${(g.members||[]).length} عضو · ${fmtDate(g.createdAt)}</div></div></div>`).join("") : `<div class="empty" style="padding:20px"><p>لا مجموعات</p></div>`}`;

  root.querySelectorAll("[data-qid]").forEach(el => el.addEventListener("click", () => openQuestion(el.dataset.qid)));
  root.querySelectorAll("[data-did]").forEach(el => el.addEventListener("click", () => openDiscussion(el.dataset.did)));
  root.querySelectorAll("[data-rid]").forEach(el => el.addEventListener("click", () => openResource(el.dataset.rid)));
  root.querySelectorAll("[data-gid]").forEach(el => el.addEventListener("click", () => openGroup(el.dataset.gid)));
}

async function renderSummary(root) {
  const p = state.profile; // استخدم البيانات المخزنة
  const xp = p.xp || { academic:0, resource:0, helper:0 };
  const badges = p.badges || [];
  const year = new Date().getFullYear();
  const { cur } = getChallengesState();
  const myQs = state.questions.filter(q => q.userId === state.user.uid).length;
  const myRs = state.resources.filter(r => r.userId === state.user.uid).length;
  const myGs = state.studyGroups.filter(g => g.ownerId === state.user.uid).length;

  root.innerHTML = `
    <div class="summary-hero">
      <h2>🏆 ملخص إنجازاتك ${year}</h2>
      <p>رحلة ${esc(p.name||"طالب")} في مجتمع UniRate</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="s-icon">🎓</div><div class="s-label">XP أكاديمي</div><div class="s-value">${xp.academic||0}</div></div>
      <div class="stat-card"><div class="s-icon">📚</div><div class="s-label">XP موارد</div><div class="s-value">${xp.resource||0}</div></div>
      <div class="stat-card"><div class="s-icon">🤝</div><div class="s-label">XP مساعدة</div><div class="s-value">${xp.helper||0}</div></div>
      <div class="stat-card"><div class="s-icon">🎖️</div><div class="s-label">الشارات</div><div class="s-value">${badges.length}</div></div>
    </div>
    <div class="section-title"><span class="bar"></span> 🎯 تحديات هذا الأسبوع</div>
    ${WEEKLY_CHALLENGES.map(ch => {
      const st = cur[ch.id] || { progress: 0, claimed: false };
      const done = st.progress >= ch.target;
      const pct = Math.min(100, Math.round((st.progress / ch.target) * 100));
      return `<div class="challenge ${done?"done":""}">
        <div class="challenge-icon">${ch.icon}</div>
        <div class="challenge-body">
          <div class="challenge-title">${ch.name} ${done?"✅":""}</div>
          <div class="challenge-desc">${ch.desc}</div>
          <div class="progress"><span style="width:${pct}%"></span></div>
        </div>
        <div class="challenge-reward">+${ch.reward} XP</div>
      </div>`;
    }).join("")}
    <div class="section-title"><span class="bar"></span> 📌 خلاصة مساهماتك</div>
    <div class="stats-grid">
      <div class="stat-card"><div class="s-icon">❓</div><div class="s-label">أسئلة</div><div class="s-value">${myQs}</div></div>
      <div class="stat-card"><div class="s-icon">📚</div><div class="s-label">موارد</div><div class="s-value">${myRs}</div></div>
      <div class="stat-card"><div class="s-icon">👥</div><div class="s-label">مجموعات أنشأتها</div><div class="s-value">${myGs}</div></div>
    </div>`;

  // حدّث البيانات الحية في الخلفية
  try {
    const fresh = await getDoc(doc(db,"users",state.user.uid));
    if (fresh.exists()) state.profile = { uid: state.user.uid, ...fresh.data() };
  } catch(e) { console.warn(e); }
}

function renderSettings(root) {
  root.innerHTML = `
    <div class="page-head"><div><h1>⚙️ الإعدادات</h1><p>خصّص تجربتك</p></div></div>
    <div class="rating-box">
      <div class="criteria-row" style="margin-bottom:12px"><div class="c-label">الوضع الليلي</div><button class="btn btn-ghost" id="setThemeBtn">${state.theme === "dark" ? "☀️ إيقاف" : "🌙 تفعيل"}</button></div>
      <div class="criteria-row"><div class="c-label">تغيير كلمة المرور</div><button class="btn btn-ghost" id="changePassBtn">🔒 تغيير</button></div>
    </div>`;
  $("#setThemeBtn").addEventListener("click", () => { $("#themeBtn").click(); renderSettings(root); });
  $("#changePassBtn").addEventListener("click", () => {
    openModal(`<div class="modal-head"><h3>تغيير كلمة المرور</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
      <div class="modal-body"><label>الجديدة</label><input id="newPass" type="password"/><label>تأكيد</label><input id="newPass2" type="password"/></div>
      <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" id="doChangePass">حفظ</button></div>`);
    $("#doChangePass").addEventListener("click", async () => {
      const p1 = $("#newPass").value, p2 = $("#newPass2").value;
      if (p1.length < 6) return toast("6 أحرف على الأقل", "error");
      if (p1 !== p2) return toast("غير متطابقتين", "error");
      try { await updatePassword(state.user, p1); toast("تم ✅", "success"); closeModal(); } catch { toast("يتطلب إعادة الدخول", "error"); }
    });
  });
}

/* ======================================================
   8) NOTIFICATIONS
   ====================================================== */
$("#notifBtn").addEventListener("click", () => {
  const p = $("#notifPanel"); p.classList.toggle("hidden");
  if (!p.classList.contains("hidden")) renderNotifications();
});
$("#markAllRead").addEventListener("click", async () => {
  const batch = writeBatch(db);
  state.notifications.filter(n => !n.read).forEach(n => batch.update(doc(db,"notifications",n.id), { read: true }));
  await batch.commit(); await loadNotifications(); updateBadge(); renderNotifications();
});
function renderNotifications() {
  const wrap = $("#notifList");
  if (!state.notifications.length) { wrap.innerHTML = `<div class="empty" style="padding:30px"><div class="em">🔔</div><p>لا إشعارات</p></div>`; return; }
  wrap.innerHTML = state.notifications.map(n => `
    <div class="notif-item ${n.read?"":"unread"}" data-id="${esc(n.id)}" data-cid="${esc(n.courseId||"")}" data-qid="${esc(n.questionId||"")}">
      <div class="n-icon">${n.icon||"🔔"}</div>
      <div class="n-body"><div class="n-title">${esc(n.title||"")}</div><div class="n-text">${esc(n.body||"")}</div><div class="n-date">${fmtDate(n.createdAt)}</div></div>
    </div>`).join("");
  wrap.querySelectorAll(".notif-item").forEach(el => el.addEventListener("click", async () => {
    await updateDoc(doc(db,"notifications",el.dataset.id), { read: true });
    await loadNotifications(); updateBadge();
    $("#notifPanel").classList.add("hidden");
    if (el.dataset.cid) openCourse(el.dataset.cid);
    else if (el.dataset.qid) openQuestion(el.dataset.qid);
  }));
}
async function pushNotification(userId, title, body, icon = "🔔", extra = {}) {
  if (!userId) return;
  await addDoc(collection(db,"notifications"), { userId, title, body, icon, read:false, ...extra, createdAt: serverTimestamp() });
}

/* ======================================================
   9) UNIFIED SEARCH
   ====================================================== */
const STOP_WORDS = ["في","من","على","عن","إلى","هو","هي","ثم","أو"];
function normalize(t) { return t.toLowerCase().replace(/[إأآا]/g,"ا").replace(/[ىي]/g,"ي").replace(/ة/g,"ه").replace(/[^\w\s\u0600-\u06FF]/g," ").trim(); }
function fuzzyMatch(hay, needle) {
  if (!hay || !needle) return false;
  hay = normalize(hay); needle = normalize(needle);
  if (hay.includes(needle)) return true;
  const words = needle.split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.includes(w));
  if (!words.length) return false;
  return words.every(w => hay.includes(w));
}
$("#searchToggle").addEventListener("click", () => {
  const p = $("#searchPanel");
  p.classList.toggle("hidden");
  if (!p.classList.contains("hidden")) { $("#globalSearch").focus(); renderSearchHints(); }
});
function renderSearchHints() {
  const w = $("#searchHints");
  const recent = state.recentVisits.slice(0, 4);
  const saved = state.savedSearches.slice(0, 3);
  if (!recent.length && !saved.length) { w.innerHTML = ""; return; }
  w.innerHTML = `
    ${saved.length ? `<span class="sh-title">🔖 محفوظة:</span>${saved.map(s => `<span class="sh-chip" data-save="${esc(s)}">${esc(s)}</span>`).join("")}` : ""}
    ${recent.length ? `<span class="sh-title">🕐 آخر ما زرته:</span>${recent.map(r => `<span class="sh-chip" data-recent="${esc(r.type)}:${esc(r.id)}">${esc(r.label).slice(0,25)}</span>`).join("")}` : ""}
  `;
  w.querySelectorAll("[data-save]").forEach(el => el.addEventListener("click", () => { $("#globalSearch").value = el.dataset.save; $("#globalSearch").dispatchEvent(new Event("input")); }));
  w.querySelectorAll("[data-recent]").forEach(el => el.addEventListener("click", () => {
    const [t, id] = el.dataset.recent.split(":");
    $("#searchPanel").classList.add("hidden");
    if (t === "course") openCourse(id);
    else if (t === "professor") openProfessor(id);
    else if (t === "question") openQuestion(id);
    else if (t === "discussion") openDiscussion(id);
    else if (t === "resource") openResource(id);
    else if (t === "group") openGroup(id);
  }));
}
$("#globalSearch").addEventListener("input", e => {
  const t = e.target.value.trim();
  const r = $("#globalSearchResults");
  if (!t) { r.innerHTML = ""; renderSearchHints(); return; }
  const results = [];
  state.courses.filter(c => c.status==="published" && (fuzzyMatch(c.name, t) || fuzzyMatch(c.code, t) || fuzzyMatch(c.description, t))).slice(0,5).forEach(c => results.push({ type:"course", id:c.id, title:`${c.code||""} ${c.name||""}`, reason: fuzzyMatch(c.name,t)?"تطابق الاسم":fuzzyMatch(c.code,t)?"تطابق الرمز":"تطابق الوصف" }));
  state.professors.filter(p => fuzzyMatch(p.name, t) || fuzzyMatch(p.department, t)).slice(0,4).forEach(p => results.push({ type:"professor", id:p.id, title:p.name, reason:"أستاذ" }));
  state.colleges.filter(c => fuzzyMatch(c.name, t)).slice(0,3).forEach(c => results.push({ type:"college", id:c.id, title:c.name, reason:"كلية" }));
  state.majors.filter(m => fuzzyMatch(m.name, t)).slice(0,3).forEach(m => results.push({ type:"major", id:m.id, title:m.name, reason:"تخصص" }));
  state.questions.filter(q => fuzzyMatch(q.title, t) || fuzzyMatch(q.body, t)).slice(0,4).forEach(q => results.push({ type:"question", id:q.id, title:q.title, reason:"سؤال" }));
  state.discussions.filter(d => fuzzyMatch(d.title, t) || fuzzyMatch(d.body, t)).slice(0,3).forEach(d => results.push({ type:"discussion", id:d.id, title:d.title, reason:"نقاش" }));
  state.resources.filter(x => fuzzyMatch(x.title, t) || fuzzyMatch(x.description, t)).slice(0,4).forEach(x => results.push({ type:"resource", id:x.id, title:x.title, reason:"مورد" }));
  state.studyGroups.filter(g => fuzzyMatch(g.name, t) || fuzzyMatch(g.description, t)).slice(0,3).forEach(g => results.push({ type:"group", id:g.id, title:g.name, reason:"مجموعة" }));

  const groups = results.reduce((a,r) => { (a[r.type] = a[r.type] || []).push(r); return a; }, {});
  const labels = { course:"📚 المواد", professor:"👨‍🏫 الأساتذة", college:"🏛️ الكليات", major:"🎓 التخصصات", question:"❓ الأسئلة", discussion:"💬 النقاشات", resource:"📚 الموارد", group:"👥 المجموعات" };
  r.innerHTML = results.length ? Object.entries(groups).map(([t, list]) => `
    <div class="muted" style="padding:8px 4px;font-size:12px;font-weight:700">${labels[t]||t}</div>
    ${list.map(x => `<div class="ac-item" data-type="${x.type}" data-id="${esc(x.id)}">${esc(x.title)}<span class="reason-badge">${x.reason}</span></div>`).join("")}
  `).join("") + `<div style="padding:10px 4px;text-align:center;border-top:1px solid var(--border);margin-top:8px"><button class="btn btn-ghost btn-sm" id="saveSearchBtn">🔖 احفظ هذا البحث</button></div>` :
    `<div class="empty" style="padding:30px"><p>لا نتائج</p></div>`;

  r.querySelectorAll(".ac-item").forEach(el => el.addEventListener("click", () => {
    $("#searchPanel").classList.add("hidden");
    $("#globalSearch").value = ""; r.innerHTML = "";
    const { type, id } = el.dataset;
    if (type === "course") openCourse(id);
    else if (type === "professor") openProfessor(id);
    else if (type === "question") openQuestion(id);
    else if (type === "discussion") openDiscussion(id);
    else if (type === "resource") openResource(id);
    else if (type === "group") openGroup(id);
    else if (type === "college") gotoView("colleges");
  }));
  $("#saveSearchBtn")?.addEventListener("click", () => {
    state.savedSearches = [t, ...state.savedSearches.filter(x => x !== t)].slice(0, 8);
    localStorage.setItem("unirate-savedSearches", JSON.stringify(state.savedSearches));
    toast("تم حفظ البحث 🔖", "success");
  });
});

/* ======================================================
   10) USER DROPDOWN
   ====================================================== */
$("#userInfoBtn").addEventListener("click", () => $("#userDropdown").classList.toggle("hidden"));
document.addEventListener("click", e => {
  if (!e.target.closest(".user-menu")) $("#userDropdown").classList.add("hidden");
  if (!e.target.closest(".notif-panel") && !e.target.closest("#notifBtn")) $("#notifPanel").classList.add("hidden");
  if (!e.target.closest(".search-panel") && !e.target.closest("#searchToggle")) $("#searchPanel").classList.add("hidden");
});
$("#userDropdown").addEventListener("click", async e => {
  const btn = e.target.closest("[data-menu]"); if (!btn) return;
  $("#userDropdown").classList.add("hidden");
  const m = btn.dataset.menu;
  if (m === "logout") { await signOut(auth); toast("تم الخروج", "info"); return; }
  gotoView(m);
});

/* ======================================================
   11) ADMIN COMMAND CENTER
   ====================================================== */
function renderAdmin(root) {
  const roles = state.profile.roles || [];
  const tabs = [
    { id:"dashboard", label:"📊 مركز القيادة", roles:["admin","platformAdmin","moderator"] },
    { id:"review",    label:"🛡️ مركز المراجعة", roles:["admin","platformAdmin","moderator","studentModerator"] },
    { id:"courses",   label:"📚 المواد",         roles:["admin","platformAdmin","dataManager"] },
    { id:"colleges",  label:"🏛️ الكليات",       roles:["admin","platformAdmin","dataManager"] },
    { id:"majors",    label:"🎓 التخصصات",      roles:["admin","platformAdmin","dataManager"] },
    { id:"professors",label:"👨‍🏫 الأساتذة",     roles:["admin","platformAdmin","dataManager"] },
    { id:"import",    label:"📥 استيراد CSV",   roles:["admin","platformAdmin","dataManager"] },
    { id:"announce",  label:"📢 الإعلانات",     roles:["admin","platformAdmin"] },
    { id:"roles",     label:"🔐 الصلاحيات",     roles:["platformAdmin"] },
    { id:"audit",     label:"📜 السجل",          roles:["admin","platformAdmin"] }
  ];
  const visibleTabs = tabs.filter(t => t.roles.some(r => hasRole(r) || state.profile.role === "admin"));
  if (!visibleTabs.find(t => t.id === state.adminTab)) state.adminTab = visibleTabs[0]?.id || "dashboard";

  root.innerHTML = `
    <div class="page-head"><div><h1>⚙️ لوحة الإدارة</h1><p>مركز القيادة والتحكم</p>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
        ${(state.profile.roles||[]).map(r => `<span class="role-chip ${r.includes("admin")?"admin":r.includes("moderator")?"moderator":r.includes("data")?"data":"student"}">${roleLabel([r])}</span>`).join("")}
      </div>
    </div></div>
    <div class="admin-tabs">${visibleTabs.map(t => `<button class="admin-tab ${state.adminTab===t.id?"active":""}" data-t="${t.id}">${t.label}</button>`).join("")}</div>
    <div id="adminContent"></div>`;
  $$(".admin-tab").forEach(b => b.addEventListener("click", () => { state.adminTab = b.dataset.t; renderAdmin(root); }));
  const c = $("#adminContent");
  const map = { dashboard:renderAdminDashboard, review:renderAdminReview, courses:renderAdminCourses, colleges:renderAdminColleges, majors:renderAdminMajors, professors:renderAdminProfessors, import:renderAdminImport, announce:renderAdminAnnounce, roles:renderAdminRoles, audit:renderAdminAudit };
  (map[state.adminTab] || renderAdminDashboard)(c);
}

async function renderAdminDashboard(root) {
  const users = (await getDocs(collection(db,"users"))).size;
  const pub = state.courses.filter(c => c.status === "published").length;
  const drafts = state.courses.filter(c => c.status === "draft").length;
  const totalReviews = state.courses.reduce((s,c) => s + (c.ratingsCount||0), 0);
  const pendingReports = (await getDocs(query(collection(db,"reports"), where("status","==","pending")))).size;
  const incomplete = state.courses.filter(c => !c.code || !c.name || !c.hours || !c.year).length;

  root.innerHTML = `
    <div class="cmd-grid">
      <div class="cmd-card"><div class="cmd-icon">👥</div><div class="cmd-label">المستخدمون</div><div class="cmd-value">${users}</div></div>
      <div class="cmd-card"><div class="cmd-icon">📚</div><div class="cmd-label">المواد المنشورة</div><div class="cmd-value">${pub}</div></div>
      <div class="cmd-card"><div class="cmd-icon">📝</div><div class="cmd-label">مسودات</div><div class="cmd-value">${drafts}</div></div>
      <div class="cmd-card"><div class="cmd-icon">⭐</div><div class="cmd-label">التقييمات</div><div class="cmd-value">${totalReviews}</div></div>
      <div class="cmd-card"><div class="cmd-icon">❓</div><div class="cmd-label">الأسئلة</div><div class="cmd-value">${state.questions.length}</div></div>
      <div class="cmd-card"><div class="cmd-icon">📚</div><div class="cmd-label">الموارد</div><div class="cmd-value">${state.resources.length}</div></div>
      <div class="cmd-card"><div class="cmd-icon">👥</div><div class="cmd-label">المجموعات</div><div class="cmd-value">${state.studyGroups.length}</div></div>
      <div class="cmd-card"><div class="cmd-icon">🚨</div><div class="cmd-label">إبلاغات معلقة</div><div class="cmd-value">${pendingReports}</div></div>
    </div>

    <div class="section-title"><span class="bar"></span> ⚠️ تقارير البيانات الناقصة</div>
    <div class="rating-box">
      <div class="cmd-grid" style="margin:0">
        <div class="cmd-card"><div class="cmd-icon">📝</div><div class="cmd-label">مواد بدون وصف كامل</div><div class="cmd-value">${incomplete}</div></div>
        <div class="cmd-card"><div class="cmd-icon">⭐</div><div class="cmd-label">مواد بدون تقييمات</div><div class="cmd-value">${state.courses.filter(c => c.status==="published" && !c.ratingsCount).length}</div></div>
        <div class="cmd-card"><div class="cmd-icon">🌳</div><div class="cmd-label">مواد بمتطلبات ناقصة</div><div class="cmd-value">${state.courses.filter(c => c.hasPrerequisite && !c.prerequisiteId).length}</div></div>
        <div class="cmd-card"><div class="cmd-icon">🎓</div><div class="cmd-label">تخصصات بدون مواد</div><div class="cmd-value">${state.majors.filter(m => !state.courses.some(c => c.targets?.all || (c.targets?.majors||[]).includes(m.id))).length}</div></div>
      </div>
    </div>

    <div class="section-title"><span class="bar"></span> 📊 أعلى المواد تفاعلاً</div>
    <div class="rank-list">${[...state.courses].filter(c => c.status==="published").sort((a,b) => (b.ratingsCount||0)-(a.ratingsCount||0)).slice(0,5).map((c,i) => rankItem(c,i+1,`${c.ratingsCount||0} تقييم`)).join("") || emptyMini()}</div>

    <div class="section-title"><span class="bar"></span> ❓ أسئلة غير محلولة</div>
    <div class="admin-list">
      ${state.questions.filter(q => !q.acceptedAnswerId).slice(0,5).map(q => `<div class="admin-row"><div class="info"><strong>${esc(q.title||"")}</strong><span>${q.answersCount||0} إجابة · ${fmtDate(q.createdAt)}</span></div><button class="btn btn-ghost btn-sm" data-qid="${esc(q.id)}">عرض</button></div>`).join("") || `<div class="empty" style="padding:20px"><p>لا أسئلة معلقة</p></div>`}
    </div>`;
  root.querySelectorAll("[data-qid]").forEach(el => el.addEventListener("click", () => openQuestion(el.dataset.qid)));
  root.querySelectorAll(".rank-item").forEach(el => el.addEventListener("click", () => openCourse(el.dataset.id)));
}

async function renderAdminReview(root) {
  let reports = [];
  try { const s = await getDocs(collection(db,"reports")); reports = s.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)); } catch {}
  const pending = reports.filter(r => r.status === "pending" || !r.status);
  const resolved = reports.filter(r => r.status === "resolved" || r.status === "rejected");

  root.innerHTML = `
    <div class="pills">
      <button class="pill active" id="tabPending">🚨 معلقة (${pending.length})</button>
      <button class="pill" id="tabResolved">✅ معالجة (${resolved.length})</button>
    </div>
    <div id="repList"></div>`;
  function draw(list) {
    const wrap = $("#repList");
    if (!list.length) { wrap.innerHTML = `<div class="empty" style="padding:30px"><div class="em">✅</div><p>لا إبلاغات</p></div>`; return; }
    wrap.innerHTML = list.map(r => `<div class="rep-row">
      <span class="rep-badge ${r.reason === "offensive" ? "high" : "low"}">${esc(r.reason||"بلاغ")}</span>
      <div>
        <div style="font-weight:800;font-size:14px">${esc((r.note||"").slice(0,80) || "(بدون تفاصيل)")}</div>
        <div class="muted" style="font-size:12px">${r.type||"review"} · ${fmtDate(r.createdAt)}</div>
      </div>
      <div class="actions" style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" data-view-content="${esc(r.contentId||r.reviewId||"")}" data-type="${esc(r.type||"review")}">عرض</button>
        ${r.status === "pending" || !r.status ? `<button class="btn btn-ghost btn-sm" data-resolve="${esc(r.id)}">✅ قبول</button><button class="btn btn-danger btn-sm" data-reject="${esc(r.id)}">✖ رفض</button>` : ""}
        <button class="btn btn-danger btn-sm" data-del-content="${esc(r.contentId||r.reviewId||"")}" data-type="${esc(r.type||"review")}">🗑️ حذف المحتوى</button>
      </div>
    </div>`).join("");
    wrap.querySelectorAll("[data-resolve]").forEach(b => b.addEventListener("click", async () => { await updateDoc(doc(db,"reports",b.dataset.resolve), { status:"resolved", reviewedAt: serverTimestamp(), reviewedBy: state.user.uid }); toast("تم ✅", "success"); renderAdminReview(root); }));
    wrap.querySelectorAll("[data-reject]").forEach(b => b.addEventListener("click", async () => { await updateDoc(doc(db,"reports",b.dataset.reject), { status:"rejected", reviewedAt: serverTimestamp(), reviewedBy: state.user.uid }); toast("تم الرفض", "info"); renderAdminReview(root); }));
    wrap.querySelectorAll("[data-view-content]").forEach(b => b.addEventListener("click", async () => {
      const col = b.dataset.type === "question" ? "questions" : b.dataset.type === "answer" ? "answers" : b.dataset.type === "resource" ? "resources" : "reviews";
      const s = await getDoc(doc(db, col, b.dataset.viewContent));
      if (s.exists()) openModal(`<div class="modal-head"><h3>عرض المحتوى</h3><button class="btn-icon" onclick="closeModal()">✕</button></div><div class="modal-body"><pre style="white-space:pre-wrap;font-family:inherit">${esc(JSON.stringify(s.data(), null, 2))}</pre></div>`);
    }));
    wrap.querySelectorAll("[data-del-content]").forEach(b => b.addEventListener("click", async () => {
      if (!confirm("حذف المحتوى؟")) return;
      const col = b.dataset.type === "question" ? "questions" : b.dataset.type === "answer" ? "answers" : b.dataset.type === "resource" ? "resources" : "reviews";
      try { await deleteDoc(doc(db, col, b.dataset.delContent)); } catch {}
      await logAdminAction("delete_content", { col, id: b.dataset.delContent });
      toast("تم الحذف", "success");
    }));
  }
  $("#tabPending").addEventListener("click", () => { $("#tabPending").classList.add("active"); $("#tabResolved").classList.remove("active"); draw(pending); });
  $("#tabResolved").addEventListener("click", () => { $("#tabResolved").classList.add("active"); $("#tabPending").classList.remove("active"); draw(resolved); });
  draw(pending);
}

async function logAdminAction(action, meta) {
  try { await addDoc(collection(db,"adminLogs"), { action, meta, by: state.user.uid, byName: state.profile.name, at: serverTimestamp() }); } catch {}
}

async function renderAdminAudit(root) {
  let logs = [];
  try { const s = await getDocs(collection(db,"adminLogs")); logs = s.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>(b.at?.seconds||0)-(a.at?.seconds||0)).slice(0,50); } catch {}
  root.innerHTML = `<div class="admin-list">${logs.length ? logs.map(l => `<div class="admin-row"><div class="info"><strong>${esc(l.action||"")}</strong><span>${esc(l.byName||"")} · ${fmtDate(l.at)}</span></div><span class="muted" style="font-size:11px">${esc(JSON.stringify(l.meta||{}).slice(0,60))}</span></div>`).join("") : `<div class="empty" style="padding:30px"><p>لا سجل</p></div>`}</div>`;
}

async function renderAdminRoles(root) {
  const users = await getDocs(collection(db,"users"));
  const list = users.docs.map(d => ({id:d.id,...d.data()})).filter(u => (u.roles||[]).length || u.role === "admin");
  root.innerHTML = `
    <div class="muted" style="margin-bottom:14px">أنت تتصفح كـ <strong>مدير المنصة</strong> — يمكنك منح/سحب الصلاحيات.</div>
    <div class="admin-list">
      ${list.length ? list.map(u => `<div class="admin-row">
        <div class="info"><strong>${esc(u.name||u.universityId||"")}</strong>
        <span>${(u.roles||[]).map(r => `<span class="role-chip">${roleLabel([r])}</span>`).join(" ")}</span></div>
        <div class="actions">
          <button class="btn btn-ghost btn-sm" data-roles="${esc(u.id)}">🔐 تعديل الصلاحيات</button>
        </div>
      </div>`).join("") : `<div class="empty" style="padding:30px"><p>لا مشرفين</p></div>`}
    </div>`;
  root.querySelectorAll("[data-roles]").forEach(b => b.addEventListener("click", async () => {
    const u = list.find(x => x.id === b.dataset.roles);
    const allRoles = ["platformAdmin","admin","moderator","dataManager","studentModerator"];
    openModal(`
      <div class="modal-head"><h3>صلاحيات ${esc(u.name||"")}</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
      <div class="modal-body">
        <div class="chk-group">
          ${allRoles.map(r => `<label class="chk ${(u.roles||[]).includes(r)?"on":""}" data-r="${r}"><input type="checkbox" ${(u.roles||[]).includes(r)?"checked":""}/>${roleLabel([r])}</label>`).join("")}
        </div>
      </div>
      <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" id="saveRolesBtn">حفظ</button></div>
    `);
    $$(".chk").forEach(l => l.addEventListener("click", () => { const i = l.querySelector("input"); setTimeout(() => l.classList.toggle("on", i.checked), 0); }));
    $("#saveRolesBtn").addEventListener("click", async () => {
      const roles = $$(".chk").filter(l => l.querySelector("input").checked).map(l => l.dataset.r);
      await updateDoc(doc(db,"users",u.id), { roles, role: roles.includes("platformAdmin") ? "admin" : (roles.length ? "moderator" : "student") });
      await logAdminAction("update_roles", { userId: u.id, roles });
      toast("تم الحفظ ✅", "success"); closeModal(); renderAdminRoles(root);
    });
  }));
}

function renderAdminImport(root) {
  root.innerHTML = `
    <div class="section-title"><span class="bar"></span> 📥 استيراد المواد (CSV)</div>
    <div class="rating-box">
      <p class="muted">الصيغة المطلوبة (صف العناوين): <code>code,name,year,hours,type,semesters,units</code></p>
      <div class="csv-drop" id="csvDrop">
        <div class="csv-icon">📄</div>
        <p>اسحب ملف CSV هنا أو اضغط للاختيار</p>
        <input type="file" id="csvFile" accept=".csv" hidden/>
      </div>
      <div id="csvPreview" style="margin-top:16px"></div>
    </div>`;
  const drop = $("#csvDrop"), input = $("#csvFile");
  drop.addEventListener("click", () => input.click());
  drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("dragging"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("dragging"));
  drop.addEventListener("drop", e => { e.preventDefault(); drop.classList.remove("dragging"); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  input.addEventListener("change", () => { if (input.files[0]) handleFile(input.files[0]); });

  async function handleFile(file) {
    const text = await file.text();
    const rows = text.split(/\r?\n/).filter(Boolean).map(r => r.split(",").map(s => s.trim()));
    const header = rows[0];
    const data = rows.slice(1).map(r => Object.fromEntries(header.map((h,i) => [h, r[i] || ""])));
    const valid = data.filter(d => d.code && d.name);
    const dups = valid.filter(d => state.courses.some(c => c.code === d.code));
    const preview = $("#csvPreview");
    preview.innerHTML = `
      <div class="cmd-grid" style="margin-bottom:14px">
        <div class="cmd-card"><div class="cmd-label">صفوف صحيحة</div><div class="cmd-value">${valid.length}</div></div>
        <div class="cmd-card"><div class="cmd-label">تكرارات</div><div class="cmd-value">${dups.length}</div></div>
        <div class="cmd-card"><div class="cmd-label">أخطاء</div><div class="cmd-value">${data.length - valid.length}</div></div>
      </div>
      <button class="btn btn-primary" id="doImport">📥 استيراد ${valid.filter(d => !dups.includes(d)).length} مادة جديدة</button>
    `;
    $("#doImport").addEventListener("click", async () => {
      const toAdd = valid.filter(d => !dups.includes(d));
      const batch = writeBatch(db);
      toAdd.forEach(d => {
        const ref = doc(collection(db,"courses"));
        batch.set(ref, {
          code: d.code, name: d.name,
          year: Number(d.year) || null, hours: Number(d.hours) || null,
          type: d.type || null, units: Number(d.units) || null,
          semesters: (d.semesters||"").split("|").filter(Boolean),
          targets: { all:true, majors:[], colleges:[] },
          status: "published", avgDifficulty:0, ratingsCount:0,
          easyCount:0, mediumCount:0, hardCount:0, ratingsSum:0,
          avgOverall:0, reviewsCount:0, createdAt: serverTimestamp()
        });
      });
      await batch.commit();
      await logAdminAction("csv_import", { count: toAdd.length, fileName: file.name });
      toast(`تم استيراد ${toAdd.length} مادة ✅`, "success");
      await loadCourses(); renderAdmin($("#viewRoot"));
    });
  }
}

function renderAdminAnnounce(root) {
  const colOpts = state.colleges.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
  const majOpts = state.majors.map(m => `<option value="${esc(m.id)}">${esc(m.name)}</option>`).join("");
  const branches = [...new Set(state.courses.map(c => c.branch).filter(Boolean))];
  root.innerHTML = `
    <div class="rating-box">
      <h3 style="margin-top:0">📢 إرسال إعلان موجّه</h3>
      <label>الفئة المستهدفة</label>
      <select id="anTarget">
        <option value="all">👥 جميع المستخدمين</option>
        <option value="college">🏛️ كلية محددة</option>
        <option value="major">🎓 تخصص محدد</option>
        <option value="level">📚 مستوى دراسي</option>
      </select>
      <div id="anExtra" class="hidden" style="margin-top:10px"></div>
      <label style="margin-top:10px">العنوان</label><input id="anTitle"/>
      <label>النص</label><textarea id="anBody"></textarea>
      <button class="btn btn-primary" id="sendAnnBtn" style="margin-top:12px">🚀 إرسال</button>
    </div>`;
  $("#anTarget").addEventListener("change", () => {
    const t = $("#anTarget").value;
    const ex = $("#anExtra");
    if (t === "all") { ex.classList.add("hidden"); return; }
    ex.classList.remove("hidden");
    ex.innerHTML = t === "college" ? `<select id="anCollege"><option value="">— اختر كلية —</option>${colOpts}</select>` :
      t === "major" ? `<select id="anMajor"><option value="">— اختر تخصص —</option>${majOpts}</select>` :
      `<select id="anLevel">${[1,2,3,4,5].map(n => `<option value="${n}">${["","أول","ثاني","ثالث","رابع","خامس+"][n]}</option>`).join("")}</select>`;
  });
  $("#sendAnnBtn").addEventListener("click", async () => {
    const title = $("#anTitle").value.trim(), body = $("#anBody").value.trim();
    if (!title || !body) return toast("أكمل الحقول", "error");
    const users = await getDocs(collection(db,"users"));
    const target = $("#anTarget").value;
    const filter = u => {
      if (target === "all") return true;
      if (target === "college") return u.data().collegeId === $("#anCollege")?.value;
      if (target === "major") return u.data().majorId === $("#anMajor")?.value;
      if (target === "level") return String(u.data().level) === $("#anLevel")?.value;
      return true;
    };
    const batch = writeBatch(db);
    let count = 0;
    users.forEach(u => {
      if (!filter(u)) return;
      const ref = doc(collection(db,"notifications"));
      batch.set(ref, { userId: u.id, title, body, icon:"📢", read:false, createdAt: serverTimestamp() });
      count++;
    });
    await batch.commit();
    await logAdminAction("announce", { target, count });
    toast(`تم الإرسال لـ ${count} مستخدم ✅`, "success");
    $("#anTitle").value = ""; $("#anBody").value = "";
  });
}

/* Keep original data CRUD (courses/colleges/majors/professors) — same as before */
/* ... أعد استخدام دوال renderAdminCourses / renderAdminColleges / renderAdminMajors / renderAdminProfessors / openCourseForm / openMajorForm / recalcMajorHours من النسخة السابقة ... */
/* (لاختصار المساحة هنا، يُرجى نسخ هذه الدوال كما هي من النسخة v2.0 مع استبدال calls الـ renderAdmin بـ renderAdmin($("#viewRoot")) بعد العمليات) */

/* ---- Report Modal ---- */
function openReportModal(type, contentId) {
  openModal(`
    <div class="modal-head"><h3>🚨 إبلاغ</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <label>السبب</label>
      <select id="repReason">
        <option value="spam">محتوى مكرر / سبام</option>
        <option value="offensive">كلام مسيء</option>
        <option value="offtopic">خارج الموضوع</option>
        <option value="false">معلومات مضللة</option>
        <option value="other">أخرى</option>
      </select>
      <label style="margin-top:10px">ملاحظات</label>
      <textarea id="repNote"></textarea>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">إلغاء</button><button class="btn btn-danger" id="doReport">إرسال</button></div>
  `);
  $("#doReport").addEventListener("click", async () => {
    await addDoc(collection(db,"reports"), {
      type, contentId, reviewId: contentId,
      reason: $("#repReason").value, note: $("#repNote").value.trim(),
      reportedBy: state.user.uid, status:"pending", createdAt: serverTimestamp()
    });
    closeModal(); toast("تم الإرسال، شكراً", "success");
  });
}

/* ---------- Modal scroll lock ---------- */
new MutationObserver(() => { document.body.style.overflow = $("#modalRoot .modal-back") ? "hidden" : ""; }).observe($("#modalRoot"), { childList: true });

/* ---------- Deep link ---------- */
if (location.hash.startsWith("#course=")) {
  const id = location.hash.slice(8);
  setTimeout(() => { if (state.courses.find(c => c.id === id)) openCourse(id); }, 1500);
}

/* ======================================================
   MISSING FUNCTIONS — أضفها في نهاية script.js
   ====================================================== */

/* ---- Colleges (Public View) ---- */
function renderColleges(root) {
  if (!state.colleges.length) {
    root.innerHTML = `<div class="empty"><div class="em">🏛️</div><h3>لا كليات بعد</h3><p>سيقوم المشرف بإضافتها قريباً</p></div>`;
    return;
  }
  root.innerHTML = `
    <div class="page-head"><div><h1>🏛️ الكليات والتخصصات</h1><p>ساعات كل تخصص محسوبة تلقائياً من مواده + الساعات الحرة</p></div></div>
    <div id="collegesList"></div>`;
  const wrap = $("#collegesList");
  state.colleges.forEach(c => {
    const majors = state.majors.filter(m => m.collegeId === c.id);
    const courses = state.courses.filter(x => x.status === "published" && matchCollege(x, c.id));
    wrap.insertAdjacentHTML("beforeend", `
      <div class="college-card">
        <h3>${esc(c.name)}</h3>
        <div class="muted">${majors.length} تخصص · ${courses.length} مادة</div>
        <div class="major-list">
          ${majors.length ? majors.map(m => {
            const mCourses = courses.filter(x => x.targets?.all || (x.targets?.majors||[]).includes(m.id));
            const hrs = mCourses.reduce((s,x) => s + (x.hours||0), 0) + (m.freeHours||0);
            return `<div class="major-item"><span class="mn">${esc(m.name)}</span><span class="mh">${hrs} ساعة</span></div>`;
          }).join("") : `<div class="muted">لا تخصصات</div>`}
        </div>
      </div>`);
  });
}

/* ---- Admin: Courses ---- */
function renderAdminCourses(root) {
  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
      <div class="muted" style="align-self:center">${state.courses.length} مادة</div>
      <button class="btn btn-primary" id="addCourseBtn">➕ إضافة مادة</button>
    </div>
    <div class="admin-list">
      ${state.courses.length ? state.courses.map(c => `
        <div class="admin-row">
          <div class="info">
            <strong>${esc(c.code||"—")} · ${esc(c.name||"بدون اسم")}</strong>
            <span>${c.year?`سنة ${c.year}`:""} ${c.hours?` · ${c.hours} ساعات`:""} ${c.status==="draft"?" · <b style='color:#92400e'>مسودة</b>":""} ${c.ratingsCount?` · ⭐ ${c.ratingsCount}`:""}</span>
          </div>
          <div class="actions">
            <button class="btn btn-ghost btn-sm" data-act="edit" data-id="${esc(c.id)}">تعديل</button>
            <button class="btn btn-danger btn-sm" data-act="del" data-id="${esc(c.id)}">حذف</button>
          </div>
        </div>`).join("") : `<div class="empty"><div class="em">📚</div><p>لا مواد بعد</p></div>`}
    </div>`;
  $("#addCourseBtn").addEventListener("click", () => openCourseForm(null));
  root.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", async () => {
    if (b.dataset.act === "edit") return openCourseForm(b.dataset.id);
    if (b.dataset.act === "del") {
      if (!confirm("تأكيد الحذف؟")) return;
      try { await deleteDoc(doc(db,"courses",b.dataset.id)); toast("حُذفت", "success"); await loadCourses(); renderAdmin($("#viewRoot")); }
      catch(e) { toast("فشل الحذف: "+e.message, "error"); }
    }
  }));
}

function openCourseForm(courseId) {
  const c = courseId ? state.courses.find(x => x.id === courseId) : null;
  const isEdit = !!c;
  const semChks = ["first","second","summer"].map(k => `<label class="chk ${c?.semesters?.includes(k)?"on":""}" data-sem="${k}"><input type="checkbox" ${c?.semesters?.includes(k)?"checked":""}/>${SEM_LABELS[k]}</label>`).join("");
  const typeOpts = Object.entries(TYPE_LABELS).map(([k,v]) => `<option value="${k}" ${c?.type===k?"selected":""}>${v}</option>`).join("");
  const colChks = state.colleges.map(col => `<label class="chk ${c?.targets?.colleges?.includes(col.id)?"on":""}" data-col="${col.id}"><input type="checkbox" ${c?.targets?.colleges?.includes(col.id)?"checked":""}/>${esc(col.name)}</label>`).join("");
  const majChks = state.majors.map(m => `<label class="chk ${c?.targets?.majors?.includes(m.id)?"on":""}" data-maj="${m.id}"><input type="checkbox" ${c?.targets?.majors?.includes(m.id)?"checked":""}/>${esc(m.name)}</label>`).join("");
  const profChks = state.professors.map(p => `<label class="chk ${(c?.professorIds||[]).includes(p.id)?"on":""}" data-prof="${p.id}"><input type="checkbox" ${(c?.professorIds||[]).includes(p.id)?"checked":""}/>${esc(p.name)}</label>`).join("");

  openModal(`
    <div class="modal-head"><h3>${isEdit?"✏️ تعديل مادة":"➕ إضافة مادة"}</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <p class="muted" style="margin-top:0">💡 اترك الحقول فارغة لحفظها كمسودة ثم أكملها لاحقاً.</p>
      <div class="form-grid">
        <div><label>رقم المقرر</label><input id="fCode" value="${esc(c?.code||"")}"/></div>
        <div><label>اسم المقرر</label><input id="fName" value="${esc(c?.name||"")}"/></div>
        <div><label>سنة (1-4)</label><select id="fYear"><option value="">—</option>${[1,2,3,4].map(y=>`<option value="${y}" ${c?.year===y?"selected":""}>${y}</option>`).join("")}</select></div>
        <div><label>ساعات (1-4)</label><select id="fHours"><option value="">—</option>${[1,2,3,4].map(h=>`<option value="${h}" ${c?.hours===h?"selected":""}>${h}</option>`).join("")}</select></div>
        <div class="full"><label>الفصول المطروحة</label><div class="chk-group" id="semGroup">${semChks}</div></div>
        <div class="full"><label>نوعه في الخطة</label><select id="fType"><option value="">—</option>${typeOpts}</select></div>
        <div><label>نشاط؟</label><select id="fActivity"><option value="no" ${!c?.isActivity?"selected":""}>لا</option><option value="yes" ${c?.isActivity?"selected":""}>نعم</option></select></div>
        <div><label>عملي؟</label><select id="fPractical"><option value="no" ${!c?.isPractical?"selected":""}>لا</option><option value="yes" ${c?.isPractical?"selected":""}>نعم</option></select></div>
        <div><label>وحدات المقرر</label><input id="fUnits" type="number" min="0" value="${esc(c?.units??"")}"/></div>
        <div><label>وحدات نصفي</label><input id="fReqSem" type="number" min="0" value="${esc(c?.requiredSemesterUnits??"")}"/></div>
        <div class="full"><label>وحدات نهائي</label><input id="fReqFinal" type="number" min="0" value="${esc(c?.requiredFinalUnits??"")}"/></div>
        <div class="full"><label>وسوم (افصل بفاصلة)</label><input id="fTags" value="${esc((c?.tagList||[]).join(", "))}" placeholder="صعبة، ممتعة، عملية"/></div>
        <div class="full"><label>متطلب سابق؟</label><select id="fHasPrereq"><option value="no" ${!c?.hasPrerequisite?"selected":""}>لا</option><option value="yes" ${c?.hasPrerequisite?"selected":""}>نعم</option></select></div>
        <div class="full hidden" id="prereqWrap">
          <label>المتطلب</label>
          <div class="ac-wrap">
            <input id="fPrereqInput" placeholder="اكتب الاسم أو الرقم…" autocomplete="off" value="${esc(c?.prerequisiteId ? (state.courses.find(x=>x.id===c.prerequisiteId)?.code||"") : "")}"/>
            <div class="ac-list" id="prereqList"></div>
          </div>
        </div>
        <div class="full"><label>التخصصات المستهدفة</label>
          <div class="pills" style="margin-bottom:10px">
            <label class="chk ${c?.targets?.all?"on":""}" data-target="all"><input type="radio" name="targetMode" value="all" ${c?.targets?.all?"checked":""}/>جميع التخصصات</label>
            <label class="chk ${(!c?.targets?.all && (c?.targets?.colleges?.length||0)>0)?"on":""}" data-target="colleges"><input type="radio" name="targetMode" value="colleges" ${(!c?.targets?.all && (c?.targets?.colleges?.length||0)>0)?"checked":""}/>حسب الكلية</label>
            <label class="chk ${(!c?.targets?.all && (c?.targets?.majors?.length||0)>0)?"on":""}" data-target="majors"><input type="radio" name="targetMode" value="majors" ${(!c?.targets?.all && (c?.targets?.majors?.length||0)>0)?"checked":""}/>تخصصات محددة</label>
          </div>
          <div id="collegesBox" class="chk-group hidden" style="margin-bottom:8px">${colChks}</div>
          <div id="majorsBox" class="chk-group hidden">${majChks}</div>
        </div>
        <div class="full"><label>الأساتذة</label><div class="chk-group">${profChks || `<span class="muted">لا أساتذة — أضفهم من تبويب الأساتذة</span>`}</div></div>
      </div>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" id="saveCourseBtn">${isEdit?"💾 حفظ":"➕ إضافة"}</button></div>
  `);

  $$(".chk input").forEach(inp => inp.addEventListener("change", () => {
    const l = inp.closest(".chk");
    if (l.dataset.sem || l.dataset.col || l.dataset.maj || l.dataset.prof || l.dataset.target) l.classList.toggle("on", inp.checked || inp.type === "radio");
  }));
  $$('input[name="targetMode"]').forEach(r => r.addEventListener("change", () => {
    $$(".chk[data-target]").forEach(l => l.classList.remove("on"));
    r.closest(".chk").classList.add("on");
    const m = r.value;
    $("#collegesBox").classList.toggle("hidden", m !== "colleges");
    $("#majorsBox").classList.toggle("hidden", m !== "majors");
  }));
  const hasPre = $("#fHasPrereq"), preWrap = $("#prereqWrap");
  function togglePre() { preWrap.classList.toggle("hidden", hasPre.value !== "yes"); }
  hasPre.addEventListener("change", togglePre); togglePre();

  let selectedPrereqId = c?.prerequisiteId || null;
  const acI = $("#fPrereqInput"), acL = $("#prereqList");
  acI.addEventListener("input", () => {
    const t = acI.value.trim().toLowerCase();
    if (!t) { acL.classList.remove("open"); return; }
    const matches = state.courses.filter(x => x.id !== c?.id).filter(x => (x.name||"").toLowerCase().includes(t) || (x.code||"").toLowerCase().includes(t)).slice(0,8);
    if (!matches.length) { acL.classList.remove("open"); return; }
    acL.innerHTML = matches.map(m => `<div class="ac-item" data-id="${esc(m.id)}">${esc(m.name)}<small>${esc(m.code||"")}</small></div>`).join("");
    acL.classList.add("open");
    acL.querySelectorAll(".ac-item").forEach(el => el.addEventListener("click", () => {
      selectedPrereqId = el.dataset.id;
      const m = state.courses.find(x => x.id === selectedPrereqId);
      acI.value = `${m.code} - ${m.name}`;
      acL.classList.remove("open");
    }));
  });

  $("#saveCourseBtn").addEventListener("click", async () => {
    const code = $("#fCode").value.trim(), name = $("#fName").value.trim();
    const isDraft = !code || !name;
    const targets = { all:false, majors:[], colleges:[] };
    const mode = $$('input[name="targetMode"]').find(r => r.checked)?.value || "all";
    if (mode === "all") targets.all = true;
    if (mode === "colleges") targets.colleges = $$("#collegesBox .chk").filter(l => l.querySelector("input").checked).map(l => l.dataset.col);
    if (mode === "majors") targets.majors = $$("#majorsBox .chk").filter(l => l.querySelector("input").checked).map(l => l.dataset.maj);
    const semesters = $$("#semGroup .chk").filter(l => l.querySelector("input").checked).map(l => l.dataset.sem);
    const professorIds = $$(".chk[data-prof]").filter(l => l.querySelector("input").checked).map(l => l.dataset.prof);
    const tagList = $("#fTags").value.split(",").map(s => s.trim()).filter(Boolean);

    const data = {
      code, name,
      year: Number($("#fYear").value) || null,
      hours: Number($("#fHours").value) || null,
      semesters,
      isActivity: $("#fActivity").value === "yes",
      isPractical: $("#fPractical").value === "yes",
      hasPrerequisite: hasPre.value === "yes",
      prerequisiteId: hasPre.value === "yes" ? selectedPrereqId : null,
      targets, professorIds, tagList,
      type: $("#fType").value || null,
      units: $("#fUnits").value === "" ? null : Number($("#fUnits").value),
      requiredSemesterUnits: $("#fReqSem").value === "" ? null : Number($("#fReqSem").value),
      requiredFinalUnits: $("#fReqFinal").value === "" ? null : Number($("#fReqFinal").value),
      status: isDraft ? "draft" : "published"
    };
    try {
      if (isEdit) await updateDoc(doc(db,"courses",c.id), data);
      else await addDoc(collection(db,"courses"), { ...data, avgDifficulty:0, ratingsCount:0, easyCount:0, mediumCount:0, hardCount:0, ratingsSum:0, avgOverall:0, reviewsCount:0, createdAt: serverTimestamp() });
      toast(isEdit?"✅ تم التحديث":"✅ تمت الإضافة", "success");
      closeModal();
      await loadCourses(); await recalcAllMajors();
      renderAdmin($("#viewRoot"));
    } catch(e) {
      console.error(e);
      toast("فشل الحفظ: " + e.message, "error");
    }
  });
}

/* ---- Admin: Colleges ---- */
function renderAdminColleges(root) {
  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:14px">
      <div class="muted" style="align-self:center">${state.colleges.length} كلية</div>
      <button class="btn btn-primary" id="addCollegeBtn">➕ إضافة كلية</button>
    </div>
    <div class="admin-list">
      ${state.colleges.length ? state.colleges.map(c => `
        <div class="admin-row">
          <div class="info"><strong>${esc(c.name)}</strong><span>${state.majors.filter(m => m.collegeId === c.id).length} تخصص</span></div>
          <div class="actions">
            <button class="btn btn-ghost btn-sm" data-act="edit" data-id="${esc(c.id)}">تعديل</button>
            <button class="btn btn-danger btn-sm" data-act="del" data-id="${esc(c.id)}">حذف</button>
          </div>
        </div>`).join("") : `<div class="empty"><div class="em">🏛️</div><p>لا كليات</p></div>`}
    </div>`;
  $("#addCollegeBtn").addEventListener("click", () => openCollegeForm(null));
  root.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", async () => {
    if (b.dataset.act === "edit") return openCollegeForm(b.dataset.id);
    if (b.dataset.act === "del") {
      if (!confirm("حذف الكلية؟")) return;
      try { await deleteDoc(doc(db,"colleges",b.dataset.id)); toast("حُذفت", "success"); await loadCollegesAndMajors(); renderAdmin($("#viewRoot")); }
      catch(e) { toast("فشل: " + e.message, "error"); }
    }
  }));
}

function openCollegeForm(id) {
  const c = id ? state.colleges.find(x => x.id === id) : null;
  openModal(`
    <div class="modal-head"><h3>${c?"✏️ تعديل كلية":"➕ إضافة كلية"}</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <label>اسم الكلية</label>
      <input id="colName" value="${esc(c?.name||"")}" placeholder="مثال: كلية الهندسة"/>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" id="saveCollegeBtn">💾 حفظ</button></div>
  `);
  $("#saveCollegeBtn").addEventListener("click", async () => {
    const name = $("#colName").value.trim();
    if (!name) return toast("أدخل اسم الكلية", "error");
    try {
      if (c) await updateDoc(doc(db,"colleges",c.id), { name });
      else await addDoc(collection(db,"colleges"), { name, createdAt: serverTimestamp() });
      toast("✅ تم الحفظ", "success");
      closeModal(); await loadCollegesAndMajors(); renderAdmin($("#viewRoot"));
    } catch(e) { toast("فشل: " + e.message, "error"); }
  });
}

/* ---- Admin: Majors ---- */
function renderAdminMajors(root) {
  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:14px">
      <div class="muted" style="align-self:center">${state.majors.length} تخصص</div>
      <button class="btn btn-primary" id="addMajorBtn">➕ إضافة تخصص</button>
    </div>
    <div class="admin-list">
      ${state.majors.length ? state.majors.map(m => {
        const col = state.colleges.find(c => c.id === m.collegeId);
        return `<div class="admin-row">
          <div class="info"><strong>${esc(m.name)}</strong><span>${esc(col?.name||"—")} · ${m.freeHours||0} ساعات حرة · إجمالي ${m.totalHours||0} ساعة</span></div>
          <div class="actions">
            <button class="btn btn-ghost btn-sm" data-act="recalc" data-id="${esc(m.id)}">🔄</button>
            <button class="btn btn-ghost btn-sm" data-act="edit" data-id="${esc(m.id)}">تعديل</button>
            <button class="btn btn-danger btn-sm" data-act="del" data-id="${esc(m.id)}">حذف</button>
          </div>
        </div>`;
      }).join("") : `<div class="empty"><div class="em">🎓</div><p>لا تخصصات</p></div>`}
    </div>`;
  $("#addMajorBtn").addEventListener("click", () => openMajorForm(null));
  root.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", async () => {
    const id = b.dataset.id;
    if (b.dataset.act === "edit") return openMajorForm(id);
    if (b.dataset.act === "recalc") { await recalcMajorHours(id); await loadCollegesAndMajors(); toast("✅ تم", "success"); renderAdmin($("#viewRoot")); }
    if (b.dataset.act === "del") {
      if (!confirm("حذف التخصص؟")) return;
      try { await deleteDoc(doc(db,"majors",id)); toast("حُذف", "success"); await loadCollegesAndMajors(); renderAdmin($("#viewRoot")); }
      catch(e) { toast("فشل: " + e.message, "error"); }
    }
  }));
}

function openMajorForm(id) {
  const m = id ? state.majors.find(x => x.id === id) : null;
  const colOpts = state.colleges.map(c => `<option value="${esc(c.id)}" ${m?.collegeId===c.id?"selected":""}>${esc(c.name)}</option>`).join("");
  openModal(`
    <div class="modal-head"><h3>${m?"✏️ تعديل تخصص":"➕ إضافة تخصص"}</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <label>اسم التخصص</label><input id="majName" value="${esc(m?.name||"")}"/>
      <label>الكلية</label><select id="majCollege"><option value="">— اختر —</option>${colOpts}</select>
      <label>الساعات الحرة (اختياري / مواد حرة)</label>
      <input id="majFree" type="number" min="0" value="${esc(m?.freeHours??0)}"/>
      <p class="muted" style="font-size:12.5px;margin-top:6px">يُحسب إجمالي الساعات = مجموع ساعات المواد + الساعات الحرة</p>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" id="saveMajorBtn">💾 حفظ</button></div>
  `);
  $("#saveMajorBtn").addEventListener("click", async () => {
    const name = $("#majName").value.trim();
    const collegeId = $("#majCollege").value;
    const freeHours = Number($("#majFree").value) || 0;
    if (!name || !collegeId) return toast("أكمل الحقول", "error");
    let docId = m?.id;
    try {
      if (m) await updateDoc(doc(db,"majors",m.id), { name, collegeId, freeHours });
      else { const ref = await addDoc(collection(db,"majors"), { name, collegeId, freeHours, totalHours: freeHours, createdAt: serverTimestamp() }); docId = ref.id; }
      await recalcMajorHours(docId);
      toast("✅ تم", "success");
      closeModal(); await loadCollegesAndMajors(); renderAdmin($("#viewRoot"));
    } catch(e) { toast("فشل: " + e.message, "error"); }
  });
}

async function recalcMajorHours(majorId) {
  try {
    const ref = doc(db,"majors",majorId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const free = snap.data().freeHours || 0;
    const major = state.majors.find(x => x.id === majorId);
    const s = await getDocs(query(collection(db,"courses"), where("status","==","published")));
    let sum = 0;
    s.forEach(d => {
      const c = d.data();
      const t = c.targets || {};
      if (t.all) { sum += (c.hours||0); return; }
      if ((t.majors||[]).includes(majorId)) { sum += (c.hours||0); return; }
      if (major && (t.colleges||[]).includes(major.collegeId)) sum += (c.hours||0);
    });
    await updateDoc(ref, { totalHours: sum + free });
  } catch(e) { console.warn("recalcMajorHours:", e.message); }
}

async function recalcAllMajors() {
  for (const m of state.majors) await recalcMajorHours(m.id);
  await loadCollegesAndMajors();
}

/* ---- Admin: Professors ---- */
function renderAdminProfessors(root) {
  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:14px">
      <div class="muted" style="align-self:center">${state.professors.length} أستاذ</div>
      <button class="btn btn-primary" id="addProfBtn">➕ إضافة أستاذ</button>
    </div>
    <div class="admin-list">
      ${state.professors.length ? state.professors.map(p => `
        <div class="admin-row">
          <div class="info"><strong>${esc(p.name)}</strong><span>${esc(p.department||"")} · ⭐ ${(p.avgRating||0).toFixed(1)} (${p.ratingCount||0})</span></div>
          <div class="actions">
            <button class="btn btn-ghost btn-sm" data-act="edit" data-id="${esc(p.id)}">تعديل</button>
            <button class="btn btn-danger btn-sm" data-act="del" data-id="${esc(p.id)}">حذف</button>
          </div>
        </div>`).join("") : `<div class="empty"><div class="em">👨‍🏫</div><p>لا أساتذة</p></div>`}
    </div>`;
  $("#addProfBtn").addEventListener("click", () => openProfForm(null));
  root.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", async () => {
    const id = b.dataset.id;
    if (b.dataset.act === "edit") return openProfForm(id);
    if (b.dataset.act === "del") {
      if (!confirm("حذف الأستاذ؟")) return;
      try { await deleteDoc(doc(db,"professors",id)); await loadProfessors(); toast("حُذف", "success"); renderAdmin($("#viewRoot")); }
      catch(e) { toast("فشل: " + e.message, "error"); }
    }
  }));
}

function openProfForm(id) {
  const p = id ? state.professors.find(x => x.id === id) : null;
  const colOpts = state.colleges.map(c => `<option value="${esc(c.id)}" ${p?.collegeId===c.id?"selected":""}>${esc(c.name)}</option>`).join("");
  openModal(`
    <div class="modal-head"><h3>${p?"✏️ تعديل أستاذ":"➕ إضافة أستاذ"}</h3><button class="btn-icon" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <label>الاسم</label><input id="pName" value="${esc(p?.name||"")}"/>
      <label>الكلية</label><select id="pCollege2"><option value="">—</option>${colOpts}</select>
      <label>القسم / التخصص</label><input id="pDept" value="${esc(p?.department||"")}"/>
      <label>نبذة</label><textarea id="pBio">${esc(p?.bio||"")}</textarea>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" id="saveProfBtn">💾 حفظ</button></div>
  `);
  $("#saveProfBtn").addEventListener("click", async () => {
    const data = { name: $("#pName").value.trim(), collegeId: $("#pCollege2").value, department: $("#pDept").value.trim(), bio: $("#pBio").value.trim() };
    if (!data.name) return toast("أدخل الاسم", "error");
    try {
      if (p) await updateDoc(doc(db,"professors",p.id), data);
      else await addDoc(collection(db,"professors"), { ...data, avgRating:0, ratingCount:0, myRating:{}, courseIds:[], createdAt: serverTimestamp() });
      toast("✅ تم", "success");
      closeModal(); await loadProfessors(); renderAdmin($("#viewRoot"));
    } catch(e) { toast("فشل: " + e.message, "error"); }
  });
}

/* ---- مؤشر التمرير الأفقي ---- */
function enableHScroll(selector) {
  document.querySelectorAll(selector).forEach(el => {
    const hasOverflow = el.scrollWidth > el.clientWidth;
    if (!hasOverflow) return;
    el.style.cursor = "grab";

    let isDown = false, startX, scrollLeft;
    el.addEventListener("mousedown", e => {
      isDown = true;
      el.style.cursor = "grabbing";
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    });
    el.addEventListener("mouseleave", () => { isDown = false; el.style.cursor = "grab"; });
    el.addEventListener("mouseup", () => { isDown = false; el.style.cursor = "grab"; });
    el.addEventListener("mousemove", e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      el.scrollLeft = scrollLeft - (x - startX);
    });

    // عجلة الفأرة الأفقية
    el.addEventListener("wheel", e => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      el.scrollLeft += e.deltaY;
    }, { passive: true });
  });
}

// فعّلها بعد كل render
const _origRender = window.render;
window.render = function() {
  const r = _origRender?.apply(this, arguments);
  setTimeout(() => {
    enableHScroll(".pills");
    enableHScroll(".admin-tabs");
    enableHScroll(".comm-tabs");
    enableHScroll(".filters");
    enableHScroll(".main-nav");
  }, 50);
  return r;
};