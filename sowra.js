var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// js/core/ui.js
var ui_exports = {};
__export(ui_exports, {
  $: () => $,
  ask: () => ask,
  dbErr: () => dbErr,
  esc: () => esc,
  installErrorWatch: () => installErrorWatch,
  prompt: () => prompt,
  starsTxt: () => starsTxt,
  toast: () => toast
});
function toast(m, err) {
  const t = $("toast");
  if (!t) return;
  t.textContent = m;
  t.className = "toast" + (err ? " err" : "");
  t.style.display = "block";
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    t.style.display = "none";
  }, 2600);
}
function dbErr(what, error, friendly) {
  const e = error || {};
  const msg = e.message || e.hint || e.details || "سبب غير معروف";
  const code = e.code ? " [" + e.code + "]" : "";
  console.error("[قاعدة] " + what + " — " + msg + code, e);
  toast(friendly || "⚠️ " + what + ": " + msg + code, true);
}
function installErrorWatch() {
  window.addEventListener("error", (e) => {
    toast("⚠️ خطأ: " + (e.message || "غير معروف"), true);
  });
  window.addEventListener("unhandledrejection", (e) => {
    toast("⚠️ خطأ: " + (e.reason?.message || e.reason || "غير معروف"), true);
  });
}
function ask(msg) {
  return window.confirm(msg);
}
function prompt(msg, def) {
  return window.prompt(msg, def ?? "");
}
var $, esc, starsTxt, _toastTimer;
var init_ui = __esm({
  "js/core/ui.js"() {
    $ = (id) => document.getElementById(id);
    esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    starsTxt = (v) => {
      const f = Math.round(v);
      return "★".repeat(f) + "☆".repeat(5 - f);
    };
    _toastTimer = null;
  }
});

// js/core/db.js
function currentUser() {
  return session.user;
}
async function ensureAuth() {
  const { data: { session: s } } = await sb.auth.getSession();
  if (s) {
    session.user = s.user;
    return s.user;
  }
  try {
    const { data: { user: u } } = await sb.auth.getUser();
    if (u) {
      session.user = u;
      return u;
    }
  } catch (e) {
  }
  const { data, error } = await sb.auth.signInAnonymously();
  if (error) {
    const { toast: toast2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
    toast2("تعذر الاتصال بالحساب — تأكد من تفعيل Anonymous Sign-ins", true);
    throw error;
  }
  session.user = data.user;
  return data.user;
}
function isAnon() {
  return !session.user || session.user.is_anonymous;
}
var SB_URL2, SB_KEY2, sb, session;
var init_db = __esm({
  "js/core/db.js"() {
    SB_URL2 = "https://gquzjaxpqeggknhipmzk.supabase.co";
    SB_KEY2 = "sb_publishable_BNp6Fg3VLXa1Pf4V6QjncQ_f496PquX";
    if (typeof supabase === "undefined") {
      document.body.innerHTML = '<div style="padding:60px 30px;text-align:center;font-family:Tajawal,sans-serif;color:#241F1C"><div style="font-size:40px">⚠️</div><h2>تعذر تحميل مكتبة الاتصال</h2><p>تأكد من اتصالك بالإنترنت ثم حدّث الصفحة</p></div>';
      window.__BOOT_FAIL = true;
      throw new Error("supabase library missing");
    }
    sb = supabase.createClient(SB_URL2, SB_KEY2);
    session = { user: null };
    sb.auth.onAuthStateChange((_event, s) => {
      session.user = s && s.user || null;
    });
  }
});

// js/core/state.js
function banner(key, def) {
  const v = state.banner?.[key];
  return v === void 0 ? def : v;
}
function videoAllowed() {
  return !!banner("video_enabled", false) && !banner("reels_soon", false);
}
function reelsState() {
  if (!banner("video_enabled", false)) return banner("reels_soon", false) ? "soon" : "off";
  return banner("reels_soon", false) ? "soon" : "open";
}
function isOwner() {
  return state.admRole === "owner";
}
function isEditor() {
  return state.admRole === "owner" || state.admRole === "editor";
}
function isCurator() {
  return isEditor() || state.isCurator;
}
var state;
var init_state = __esm({
  "js/core/state.js"() {
    state = {
      /* البيانات */
      photos: [],
      favSet: /* @__PURE__ */ new Set(),
      visitCounts: {},
      claimMap: {},
      /* الصورة المفتوحة */
      curId: null,
      curPhoto: null,
      /* الفلترة والعرض */
      cat: "all",
      sort: "top",
      scope: "home",
      viewMode: "grid",
      /* grid | map */
      tags: [],
      onlyClaims: false,
      onlyEc: false,
      /* البروفايل المفتوح */
      profUid: null,
      /* الصلاحيات */
      isAdmin: false,
      admRole: "",
      isCurator: false,
      /* مفاتيح الموقع من site_banner */
      banner: {},
      /* الحظر */
      myBlocks: /* @__PURE__ */ new Set(),
      /* حالة الواجهة */
      accOpen: "",
      /* القسم المفتوح بحسابي */
      statsSort: "new",
      /* فرز الإحصائيات */
      dmTab: "in",
      /* تبويب الرسائل */
      uniTab: "photos",
      /* تبويب البحث */
      admTab: "rep",
      /* مسوّدة الفلتر — قبل التطبيق */
      draftCat: "all",
      draftSort: "top",
      draftScope: "home",
      /* تقييمي للصورة المفتوحة · موسيقى المستخدم */
      myRating: 0,
      ownMusicFile: null,
      recFilter: "none",
      /* تبويب الإشراف */
      shSort: "photos",
      /* فرز المصورين */
      geoPickMode: null,
      /* وضع اختيار الموقع */
      /* مسوّدة النشر */
      earlyRes: null,
      geoPlace: null,
      edGeo: null,
      exifTech: null,
      pickedTags: [],
      sugT: "",
      sugD: "",
      inspErr: "",
      inspectOn: false,
      recStart: null,
      gpMap: null,
      /* الرسائل والبحث */
      dmTo: null,
      dmPick: null,
      dmBanMap: {},
      uniData: null,
      cuPick: null,
      tmPick: null,
      opened: 0,
      /* لوحة الإشراف */
      admPhotos: [],
      admMusic: [],
      /* كائنات مشتركة بين الملفات */
      map: null,
      /* كائن Leaflet */
      race: [],
      /* سباق الديار */
      reelsList: [],
      /* قائمة الأضواء */
      /* مسوّدة النشر — يكتبها upload وcamera */
      pendingFile: null,
      pendingBlob: null,
      pendingVideo: null,
      pendingGeo: null,
      pendingVis: "public",
      isAbroad: false,
      curFilter: "none",
      pendingMusicName: "",
      pickedMusic: null,
      trTitle: "",
      trDesc: "",
      edTrTitle: "",
      edTrDesc: "",
      /* الكاميرا */
      recorder: null,
      recChunks: [],
      recTimer: null,
      recFacing: "environment",
      audioCtx: null,
      musicAudio: null,
      /* الخريطة والأضواء */
      marks: null,
      gapsOn: false,
      reelObserver: null,
      reelsMuted: true,
      /* البروفايل والكنوز */
      profTab: "public",
      myRegion: "",
      myBadgeSet: /* @__PURE__ */ new Set(),
      qDone: /* @__PURE__ */ new Set(),
      qStops: {},
      admQs: {},
      /* المسابقة */
      weekMode: "live",
      weekEntries: [],
      weekVotes: {},
      myWeekVote: null,
      /* البلاغات */
      admReps: {}
    };
  }
});

// js/core/hub.js
function provide(obj) {
  Object.assign(registry, obj);
}
function need(name) {
  return (...args) => {
    const fn = registry[name];
    if (typeof fn !== "function") {
      console.warn("[hub] مفقود:", name);
      return void 0;
    }
    return fn(...args);
  };
}
function get(name, def) {
  const v = registry[name];
  return v === void 0 ? def : v;
}
function hubReport() {
  const keys = Object.keys(registry).sort();
  console.info("[hub] مسجّل:", keys.length, keys);
  return keys;
}
var registry;
var init_hub = __esm({
  "js/core/hub.js"() {
    registry = /* @__PURE__ */ Object.create(null);
  }
});

// js/data/places.js
function rebuildGeo() {
  geo.GEO = JSON.parse(JSON.stringify(BASE_GEO));
  geo.VILL = {};
  for (const c of geo.custom) {
    if (!geo.GEO[c.region]) geo.GEO[c.region] = [];
    if (c.kind === "city") {
      if (!geo.GEO[c.region].includes(c.name)) geo.GEO[c.region].push(c.name);
    } else {
      (geo.VILL[c.region] = geo.VILL[c.region] || []).push(c.name);
    }
  }
}
async function loadPlaces() {
  const { data } = await sb.from("custom_places").select("*").order("name");
  geo.custom = data || [];
  rebuildGeo();
  return geo;
}
function nearestCity(lat, lng) {
  let best = null, bd = 1e9;
  for (const city in COORDS) {
    const [clat, clng] = COORDS[city];
    const d = (lat - clat) ** 2 + ((lng - clng) * Math.cos(lat * Math.PI / 180)) ** 2;
    if (d < bd) {
      bd = d;
      best = city;
    }
  }
  const km = Math.sqrt(bd) * 111;
  let region = "";
  for (const r in geo.GEO) if (geo.GEO[r].includes(best)) {
    region = r;
    break;
  }
  return { city: best, region, km: Math.round(km) };
}
var BASE_GEO, COORDS, geo;
var init_places = __esm({
  "js/data/places.js"() {
    init_db();
    BASE_GEO = {
      "منطقة الرياض": ["الرياض", "الدرعية", "الخرج", "المجمعة", "الزلفي", "شقراء", "وادي الدواسر", "الأفلاج"],
      "منطقة مكة المكرمة": ["مكة المكرمة", "جدة", "الطائف", "القنفذة", "الليث", "رابغ"],
      "منطقة المدينة المنورة": ["المدينة المنورة", "ينبع", "العلا", "بدر", "خيبر"],
      "منطقة القصيم": ["بريدة", "عنيزة", "الرس", "البكيرية", "المذنب", "رياض الخبراء"],
      "المنطقة الشرقية": ["الدمام", "الخبر", "الظهران", "الأحساء", "الجبيل", "القطيف", "حفر الباطن"],
      "منطقة عسير": ["أبها", "خميس مشيط", "بيشة", "النماص", "محايل عسير", "رجال ألمع", "تنومة"],
      "منطقة تبوك": ["تبوك", "الوجه", "ضباء", "أملج", "حقل", "تيماء", "نيوم"],
      "منطقة حائل": ["حائل", "بقعاء", "الغزالة", "الشنان"],
      "منطقة الحدود الشمالية": ["عرعر", "رفحاء", "طريف"],
      "منطقة جازان": ["جازان", "صبيا", "أبو عريش", "فيفاء", "فرسان", "الدرب"],
      "منطقة نجران": ["نجران", "شرورة", "حبونا"],
      "منطقة الباحة": ["الباحة", "بلجرشي", "المندق", "قلوة"],
      "منطقة الجوف": ["سكاكا", "دومة الجندل", "القريات"]
    };
    COORDS = {
      "الرياض": [24.71, 46.68],
      "الدرعية": [24.74, 46.57],
      "الخرج": [24.15, 47.3],
      "المجمعة": [25.9, 45.35],
      "الزلفي": [26.3, 44.8],
      "شقراء": [25.24, 45.25],
      "وادي الدواسر": [20.46, 44.79],
      "الأفلاج": [22.28, 46.73],
      "مكة المكرمة": [21.39, 39.86],
      "جدة": [21.49, 39.19],
      "الطائف": [21.27, 40.42],
      "القنفذة": [19.13, 41.08],
      "الليث": [20.15, 40.27],
      "رابغ": [22.8, 39.03],
      "المدينة المنورة": [24.47, 39.61],
      "ينبع": [24.09, 38.06],
      "العلا": [26.61, 37.92],
      "بدر": [23.78, 38.79],
      "خيبر": [25.7, 39.29],
      "بريدة": [26.33, 43.97],
      "عنيزة": [26.09, 43.99],
      "الرس": [25.87, 43.5],
      "البكيرية": [26.14, 43.66],
      "المذنب": [25.86, 44.22],
      "رياض الخبراء": [26.06, 43.66],
      "الدمام": [26.43, 50.1],
      "الخبر": [26.28, 50.21],
      "الظهران": [26.29, 50.15],
      "الأحساء": [25.38, 49.59],
      "الجبيل": [27.01, 49.66],
      "القطيف": [26.56, 50.01],
      "حفر الباطن": [28.43, 45.97],
      "أبها": [18.25, 42.51],
      "خميس مشيط": [18.31, 42.73],
      "بيشة": [19.98, 42.6],
      "النماص": [19.15, 42.13],
      "محايل عسير": [18.55, 42.05],
      "رجال ألمع": [18.2, 42.27],
      "تنومة": [18.93, 42.13],
      "تبوك": [28.38, 36.57],
      "الوجه": [26.25, 36.45],
      "ضباء": [27.35, 35.69],
      "أملج": [25.02, 37.27],
      "حقل": [29.28, 34.94],
      "تيماء": [27.63, 38.55],
      "نيوم": [28.1, 35.2],
      "حائل": [27.51, 41.72],
      "بقعاء": [27.88, 42.42],
      "الغزالة": [26.83, 41.29],
      "الشنان": [27.17, 42.43],
      "عرعر": [30.98, 41.02],
      "رفحاء": [29.63, 43.5],
      "طريف": [31.68, 38.65],
      "جازان": [16.89, 42.55],
      "صبيا": [17.15, 42.63],
      "أبو عريش": [16.97, 42.83],
      "فيفاء": [17.25, 43.1],
      "فرسان": [16.7, 42.12],
      "الدرب": [17.72, 42.25],
      "نجران": [17.49, 44.13],
      "شرورة": [17.47, 47.11],
      "حبونا": [17.8, 44.05],
      "الباحة": [20.01, 41.47],
      "بلجرشي": [19.86, 41.57],
      "المندق": [20.16, 41.28],
      "قلوة": [19.77, 41.38],
      "سكاكا": [29.97, 40.2],
      "دومة الجندل": [29.81, 39.87],
      "القريات": [31.33, 37.34]
    };
    geo = { GEO: {}, VILL: {}, custom: [] };
    rebuildGeo();
  }
});

// js/core/format.js
function timeAgo(iso) {
  if (!iso) return { txt: "", full: "" };
  const d = new Date(iso), now = /* @__PURE__ */ new Date();
  const s = Math.floor((now - d) / 1e3);
  const full = d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  let txt;
  if (s < 60) txt = "قبل لحظات";
  else if (s < 3600) {
    const m = Math.floor(s / 60);
    txt = "قبل " + (m === 1 ? "دقيقة" : m === 2 ? "دقيقتين" : m < 11 ? m + " دقائق" : m + " دقيقة");
  } else if (s < 86400) {
    const h = Math.floor(s / 3600);
    txt = "قبل " + (h === 1 ? "ساعة" : h === 2 ? "ساعتين" : h < 11 ? h + " ساعات" : h + " ساعة");
  } else if (s < 604800) {
    const dd = Math.floor(s / 86400);
    txt = "قبل " + (dd === 1 ? "يوم" : dd === 2 ? "يومين" : dd + " أيام");
  } else if (s < 2592e3) {
    const w = Math.floor(s / 604800);
    txt = "قبل " + (w === 1 ? "أسبوع" : w === 2 ? "أسبوعين" : w + " أسابيع");
  } else if (s < 31536e3) {
    const mo = Math.floor(s / 2592e3);
    txt = "قبل " + (mo === 1 ? "شهر" : mo === 2 ? "شهرين" : mo < 11 ? mo + " أشهر" : mo + " شهر");
  } else {
    const y = Math.floor(s / 31536e3);
    txt = "قبل " + (y === 1 ? "سنة" : y === 2 ? "سنتين" : y + " سنوات");
  }
  return { txt, full };
}
function rankOf(p) {
  const ph = p?.photographer_photos || 0;
  const fo = p?.followers_count || 0;
  if (ph >= 15 && fo >= 10) return { ic: "🏆", t: "عين الديرة", c: "gold" };
  if (ph >= 5 || fo >= 5) return { ic: "📸", t: "عدسة الديرة", c: "silver" };
  return { ic: "🌱", t: "مستكشف", c: "bronze" };
}
function hasBadWord(t) {
  if (!t) return false;
  const s = String(t).toLowerCase().replace(/[\u064B-\u0652]/g, "");
  return BAD_WORDS.some((w) => s.includes(w));
}
function hasLink(t) {
  if (!t) return false;
  return /(https?:\/\/|www\.|\.com|\.net|\.org|\.sa\b|t\.me\/|wa\.me\/|@[a-z0-9_]{4,})/i.test(String(t));
}
function hasRepeat(t) {
  if (!t) return false;
  return /(.)\1{7,}/.test(String(t));
}
function checkText(t, { allowLink = false } = {}) {
  if (!t || !String(t).trim()) return null;
  if (hasBadWord(t)) return "فيه ألفاظ غير لائقة — عدّل النص من فضلك";
  if (!allowLink && hasLink(t)) return "الروابط ومعرّفات الحسابات غير مسموحة";
  if (hasRepeat(t)) return "فيه تكرار غير طبيعي بالأحرف";
  return null;
}
function normPlace(s) {
  return String(s || "").replace(/[\u064B-\u0652\u0640]/g, "").replace(/[أإآا]/g, "ا").replace(/[ىي]/g, "ي").replace(/ة/g, "ه").replace(/منطقة|محافظة|امارة|مدينة/g, "").replace(/\s+/g, "").trim();
}
function findOpt(sel, want) {
  if (!sel || !want) return null;
  const w = normPlace(want);
  if (!w) return null;
  const opts = Array.from(sel.options);
  return opts.find((o) => normPlace(o.value) === w || normPlace(o.textContent) === w) || opts.find((o) => {
    const t = normPlace(o.textContent);
    return t && (t.includes(w) || w.includes(t));
  }) || null;
}
var BAD_WORDS;
var init_format = __esm({
  "js/core/format.js"() {
    BAD_WORDS = ["قحب", "شرموط", "منيوك", "عرص", "خرا", "طيز", "نيك", "fuck", "bitch", "asshole", "bastard"];
  }
});

// js/core/media.js
function imgUrl(path) {
  return sb.storage.from("photos").getPublicUrl(path).data.publicUrl;
}
function vidUrl(path) {
  return sb.storage.from("videos").getPublicUrl(path).data.publicUrl;
}
function avatarUrl(path) {
  return sb.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}
function thumbUrl(p) {
  return imgUrl(thumbPath(p));
}
function compressTo(file, maxW, quality) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const cv = document.createElement("canvas");
      cv.width = w;
      cv.height = h;
      const ctx = cv.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      cv.toBlob((b) => resolve(b || file), "image/jpeg", quality);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}
function imgSize(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
var thumbPath, hiPath, allPaths, SIZES, HI_MIN, compress, makeHi;
var init_media = __esm({
  "js/core/media.js"() {
    init_db();
    thumbPath = (p) => String(p || "").replace(/\.jpg$/i, "_t.jpg");
    hiPath = (p) => String(p || "").replace(/\.jpg$/i, "_h.jpg");
    allPaths = (p) => [p, thumbPath(p), hiPath(p)];
    SIZES = {
      full: { w: 1100, q: 0.74 },
      hi: { w: 2400, q: 0.82 },
      /* الأرشيف — يكفي خلفية جوال وطباعة صغيرة */
      thumb: { w: 380, q: 0.72 },
      probe: { w: 640, q: 0.55 }
    };
    HI_MIN = 1400;
    compress = (file) => compressTo(file, SIZES.full.w, SIZES.full.q);
    makeHi = (file) => compressTo(file, SIZES.hi.w, SIZES.hi.q);
  }
});

// js/admin/cleanup.js
var cleanup_exports = {};
__export(cleanup_exports, {
  ORPHANS: () => ORPHANS,
  admCleanupBlock: () => admCleanupBlock,
  admDelOrphans: () => admDelOrphans,
  admFixAbroadGeo: () => admFixAbroadGeo,
  admRebuildThumbs: () => admRebuildThumbs,
  admScanOrphans: () => admScanOrphans
});
function admCleanupBlock() {
  return `<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">🧹 تنظيف التخزين</div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px">الملفات اليتيمة: موجودة بالتخزين وما لها صف بالقاعدة.</div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button class="btn" style="flex:1;font-size:12px;padding:9px;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="admScanOrphans('videos')">🎬 فحص الفيديو</button>
      <button class="btn" style="flex:1;font-size:12px;padding:9px;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="admScanOrphans('photos')">🖼️ فحص الصور</button>
    </div>
    <button class="btn" style="width:100%;font-size:12px;padding:9px;background:var(--qblue)" onclick="admScanOrphans('all')">🔍 فحص الكل</button>
    <div id="cleanResult" style="font-size:12px;color:var(--txt-dim);margin-top:10px;line-height:1.9"></div>
  <button class="btn" style="width:100%;margin-top:9px;background:var(--card2);border:1px solid var(--qblue);color:var(--qblue);font-size:12.5px;padding:10px" onclick="admFixAbroadGeo()">🌍 افحص مواقع صور المسافر</button><button class="btn" style="width:100%;margin-top:9px;background:var(--card2);border:1px solid var(--qteal);color:var(--qteal);font-size:12.5px;padding:10px" onclick="admRebuildThumbs()">🖼️ حسّن دقة المصغّرات</button>
    <div id="rtStatus" style="font-size:11.5px;color:var(--txt-dim);margin-top:8px;line-height:1.8;text-align:center"></div></div>`;
}
async function admScanOrphans(mode) {
  const box = $("cleanResult");
  if (box) box.innerHTML = "⏳ نفحص...";
  ORPHANS = { v: [], p: [] };
  try {
    const r = await sb.from("photos").select("image_path,media_type");
    if (r.error) {
      if (box) box.innerHTML = "⚠️ تعذر قراءة القاعدة: " + r.error.message;
      return;
    }
    const rows = r.data || [];
    if (!rows.length) {
      if (box) box.innerHTML = "⚠️ القاعدة رجعت فاضية — أُوقف الفحص حمايةً للملفات";
      return;
    }
    const keepVid = new Set(rows.filter((x) => x.media_type === "video").map((x) => x.image_path));
    const keepImg = /* @__PURE__ */ new Set();
    rows.filter((x) => x.media_type !== "video").forEach((x) => {
      keepImg.add(x.image_path);
      keepImg.add(thumbPath(x.image_path));
      keepImg.add(hiPath(x.image_path));
    });
    try {
      const sbn = await sb.from("site_banner").select("image_path").eq("id", 1).maybeSingle();
      if (sbn.data && sbn.data.image_path) keepImg.add(sbn.data.image_path);
    } catch (e) {
    }
    if (mode === "videos" || mode === "all") {
      const uv = await listBucketAll("videos");
      ORPHANS.v = uv.filter((p) => !keepVid.has(p));
    }
    if (mode === "photos" || mode === "all") {
      const up = await listBucketAll("photos");
      ORPHANS.p = up.filter((p) => !keepImg.has(p) && !p.startsWith("banners/") && !p.startsWith("admin/"));
    }
    const tv = ORPHANS.v.length, tp = ORPHANS.p.length, tot = tv + tp;
    if (!tot) {
      if (box) box.innerHTML = "✅ نظيف — ما فيه ملفات يتيمة";
      return;
    }
    let html = (tp > keepImg.size ? '<div style="background:#FFF4D6;border:1px solid var(--star);border-radius:8px;padding:8px 11px;margin-bottom:8px;font-size:11.5px;line-height:1.8">⚠️ العدد أكبر من المسجّل — راجع القائمة بعناية قبل الحذف</div>' : "") + '<div style="font-weight:700;color:var(--sadu);margin-bottom:6px">لقينا ' + tot + ' ملفاً يتيماً:</div><div style="font-size:11px;color:var(--txt-dim);margin-bottom:8px">(قُرئ ' + rows.length + " صفاً من القاعدة · " + keepVid.size + " فيديو · " + keepImg.size + " مسار صورة)</div>";
    if (tv) {
      html += '<div style="margin-bottom:6px"><b>🎬 فيديو (' + tv + "):</b></div>";
      html += ORPHANS.v.map((x) => '<div style="background:var(--card2);border-radius:8px;padding:5px 9px;margin-bottom:4px;font-size:11px;direction:ltr;text-align:left;word-break:break-all">' + esc(x) + "</div>").join("");
      html += `<button class="btn" style="width:100%;font-size:12px;padding:8px;margin:6px 0;background:var(--sadu)" onclick="admDelOrphans('v')">🗑️ احذف الفيديوهات اليتيمة (` + tv + ")</button>";
    }
    if (tp) {
      html += '<div style="margin:8px 0 6px"><b>🖼️ صور (' + tp + "):</b></div>";
      html += ORPHANS.p.map((x) => '<div style="background:var(--card2);border-radius:8px;padding:5px 9px;margin-bottom:4px;font-size:11px;direction:ltr;text-align:left;word-break:break-all">' + esc(x) + "</div>").join("");
      html += `<button class="btn" style="width:100%;font-size:12px;padding:8px;margin:6px 0;background:var(--sadu)" onclick="admDelOrphans('p')">🗑️ احذف الصور اليتيمة (` + tp + ")</button>";
    }
    html += '<div style="font-size:11px;color:var(--txt-dim);margin-top:6px">⚠️ راجع القائمة قبل الحذف — العملية نهائية</div>';
    if (box) box.innerHTML = html;
  } catch (e) {
    if (box) box.innerHTML = "⚠️ تعذر الفحص: " + (e.message || "");
  }
}
async function admDelOrphans(kind) {
  const list = kind === "v" ? ORPHANS.v : ORPHANS.p;
  const bucket = kind === "v" ? "videos" : "photos";
  if (!list.length) return;
  if (!confirm("حذف " + list.length + " ملفاً نهائياً من دلو " + bucket + "؟")) return;
  const box = $("cleanResult");
  if (box) box.innerHTML = "⏳ نحذف...";
  let done = 0;
  try {
    for (let i = 0; i < list.length; i += 50) {
      const chunk = list.slice(i, i + 50);
      const { error } = await sb.storage.from(bucket).remove(chunk);
      if (error) throw error;
      done += chunk.length;
    }
    if (kind === "v") ORPHANS.v = [];
    else ORPHANS.p = [];
    if (box) box.innerHTML = "✅ انحذف " + done + " ملفاً";
    toast("انتهى التنظيف 🧹");
  } catch (e) {
    if (box) box.innerHTML = "⚠️ انحذف " + done + " — توقف: " + (e.message || "");
  }
}
async function admFixAbroadGeo() {
  if (!needOwner("إصلاح المواقع")) return;
  try {
    const r = await sb.from("photos").select("id,title,lat,lng,country").eq("abroad", true).not("lat", "is", null);
    const list = r.data || [];
    const inSA = (p) => p.lat >= 16 && p.lat <= 32.2 && p.lng >= 34.5 && p.lng <= 55.7;
    const bad = list.filter(inSA);
    if (!bad.length) {
      toast("✅ ما فيه صور مسافر بإحداثيات محلية");
      return;
    }
    if (!confirm("لقينا " + bad.length + " صورة «عدسة مسافر» بإحداثيات داخل المملكة.\n\nنمسح إحداثياتها؟ (تبقى بالمنصة — لكن تختفي من الخريطة والأقرب إليك)")) return;
    const ids = bad.map((p) => p.id);
    const { error } = await sb.from("photos").update({ lat: null, lng: null }).in("id", ids);
    if (error) {
      toast("تعذر الإصلاح: " + error.message, true);
      return;
    }
    toast("✅ انصلحت " + bad.length + " صورة");
    if (typeof loadPhotos21 === "function") loadPhotos21();
  } catch (e) {
    toast("تعذر الفحص: " + (e && e.message || ""), true);
  }
}
async function admRebuildThumbs() {
  if (!needOwner("إعادة توليد المصغّرات")) return;
  if (!confirm("إعادة توليد مصغّرات كل الصور بدقة أعلى (380px)؟\n\nقد تستغرق دقائق — لا تغلق الصفحة.")) return;
  const box = $("rtStatus");
  const setSt = (t) => {
    if (box) box.innerHTML = t;
  };
  try {
    const r = await sb.from("photos").select("id,image_path").eq("media_type", "image").not("image_path", "is", null);
    const list = r.data || [];
    if (!list.length) {
      toast("ما فيه صور", true);
      return;
    }
    let ok = 0, fail = 0, lastErr = "";
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      setSt(`⏳ ${i + 1} / ${list.length} — نجح ${ok} · أخفق ${fail}`);
      try {
        const dl = await sb.storage.from("photos").download(p.image_path);
        if (dl.error || !dl.data) {
          lastErr = dl.error && dl.error.message || "تعذر التنزيل";
          fail++;
          continue;
        }
        const thumb = await compressTo(dl.data, 380, 0.72);
        if (!thumb) {
          lastErr = "تعذر الضغط";
          fail++;
          continue;
        }
        const tp = thumbPath(p.image_path);
        const up = await sb.storage.from("photos").upload(tp, thumb, {
          contentType: "image/jpeg",
          cacheControl: "31536000",
          upsert: true
        });
        if (up.error) {
          lastErr = up.error.message;
          fail++;
          continue;
        }
        ok++;
      } catch (e) {
        lastErr = e && e.message || "استثناء";
        fail++;
      }
      await new Promise((r2) => setTimeout(r2, 120));
    }
    setSt(`${ok ? "✅" : "⚠️"} اكتمل — نجح ${ok} · أخفق ${fail}` + (lastErr ? `<br><span style="font-size:11px;direction:ltr;display:inline-block;color:var(--sadu)">${esc(lastErr)}</span>` : "") + (ok ? '<br><span style="font-size:11px">حدّث الصفحة لتشوف الفرق</span>' : ""));
    toast("✅ انتهت إعادة التوليد");
  } catch (e) {
    setSt("⚠️ " + (e && e.message || "تعذرت العملية"));
  }
}
var initVideoUpload6, listBucketAll, loadAdmWeek, loadPhotos21, loadSponsor5, needOwner, pushNotify24, go26, ORPHANS;
var init_cleanup = __esm({
  "js/admin/cleanup.js"() {
    init_db();
    init_hub();
    init_media();
    init_state();
    init_ui();
    init_places();
    initVideoUpload6 = need("initVideoUpload");
    listBucketAll = need("listBucketAll");
    loadAdmWeek = need("loadAdmWeek");
    loadPhotos21 = need("loadPhotos");
    loadSponsor5 = need("loadSponsor");
    needOwner = need("needOwner");
    pushNotify24 = need("pushNotify");
    go26 = need("go");
    ORPHANS = { v: [], p: [] };
  }
});

// js/admin/contest.js
var contest_exports2 = {};
__export(contest_exports2, {
  admChSave: () => admChSave,
  admChToggle: () => admChToggle,
  admChallengeBlock: () => admChallengeBlock,
  admSideBannerToggle: () => admSideBannerToggle,
  admSpBlock: () => admSpBlock,
  admSpDelete: () => admSpDelete,
  admSpSaveLink: () => admSpSaveLink,
  admSpToggle: () => admSpToggle,
  admSpUpload: () => admSpUpload,
  admSponsorSideBlock: () => admSponsorSideBlock,
  admSponsorsBtn: () => admSponsorsBtn,
  admSponsorsBtnToggle: () => admSponsorsBtnToggle,
  admWeekAdd: () => admWeekAdd,
  admWeekDelete: () => admWeekDelete,
  admWeekEnd: () => admWeekEnd,
  admWeekNew: () => admWeekNew,
  admWeekPick: () => admWeekPick,
  admWeekRemove: () => admWeekRemove,
  admWeekSave: () => admWeekSave,
  admWeekToggle: () => admWeekToggle,
  chIdea: () => chIdea
});
async function admSpBlock() {
  const r = await sb.from("site_banner").select("*").eq("id", 1).maybeSingle();
  const b = r.data || { active: false, image_path: "", link_url: "" };
  state.banner = b;
  return `
  <div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin-top:16px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">📣 بنر الراعي (رأس الصفحة) ${b.active ? '<span style="font-size:11px;color:var(--palm);font-weight:700">● ظاهر</span>' : '<span style="font-size:11px;color:var(--txt-dim)">○ مخفي</span>'}</div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px;line-height:1.8">📐 مقاس التصميم: <b>1600 × 400 بكسل</b> (نسبة 4:1) · JPG أو PNG · يفضل أقل من 300KB</div>
    ${b.image_path ? `<img src="${imgUrl(b.image_path)}" style="width:100%;aspect-ratio:4/1;object-fit:cover;border-radius:10px;border:1px solid var(--line);margin-bottom:10px">` : ""}
    <input id="spName" placeholder="اسم الراعي (مثال: متجر عدسة)" value="${esc(b.sponsor_name || "")}"/>
    <input id="spCat" placeholder="النشاط (مثال: معدات تصوير)" value="${esc(b.sponsor_cat || "")}"/>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <input id="spLat" placeholder="خط العرض (اختياري)" type="number" step="any" value="${b.sponsor_lat || ""}" style="flex:1;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:10px 12px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;direction:ltr">
      <input id="spLng" placeholder="خط الطول (اختياري)" type="number" step="any" value="${b.sponsor_lng || ""}" style="flex:1;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:10px 12px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;direction:ltr">
    </div>
    <textarea id="spDeal" placeholder="عرض الراعي (اختياري — مثال: خصم 15% على معدات التصوير)" rows="2" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:10px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;resize:none;margin-bottom:8px">${esc(b.sponsor_deal || "")}</textarea>
    <input id="spCode" placeholder="كود الخصم (اختياري — مثال: SOWRA15)" value="${esc(b.sponsor_code || "")}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px;direction:ltr;text-align:left;letter-spacing:1px">
    <input id="spLink" placeholder="رابط الراعي عند الضغط (اختياري)" value="${esc(b.link_url)}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:10px;direction:ltr;text-align:left">
    <input type="file" id="spFile" accept="image/*" style="display:none" onchange="admSpUpload(this.files[0])">
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" style="flex:1" onclick="$('spFile').click()">📤 ${b.image_path ? "تغيير الصورة" : "رفع صورة البنر"}</button>
      <button class="btn" style="flex:1;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="admSpSaveLink()">💾 حفظ الرابط</button>
      ${b.image_path ? `<button class="btn" style="flex:1;${b.active ? "background:var(--card2);border:1px solid var(--line);color:var(--txt)" : "background:var(--palm)"}" onclick="admSpToggle()">${b.active ? "🙈 إخفاء" : "👁️ تفعيل"}</button>` : ""}
      ${b.image_path ? `<button class="btn" style="flex:0 0 auto;background:var(--sadu)" onclick="admSpDelete()">🗑️ حذف</button>` : ""}
    </div>
  </div>`;
}
async function admSpUpload(f) {
  if (!f) return;
  toast("⏳ جاري رفع البنر...");
  const blob = await compressTo(f, 1600, 0.88);
  const path = `banners/sponsor_${Date.now()}.jpg`;
  const up = await sb.storage.from("photos").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (up.error) {
    toast("فشل الرفع: " + up.error.message, true);
    return;
  }
  const { error } = await sb.from("site_banner").update({ image_path: path, sponsor_name: $("spName").value.trim(), sponsor_cat: $("spCat").value.trim(), sponsor_lat: parseFloat($("spLat").value) || null, sponsor_lng: parseFloat($("spLng").value) || null, sponsor_deal: $("spDeal").value.trim(), sponsor_code: $("spCode").value.trim(), updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", 1);
  if (error) {
    dbErr("رفع بنر الراعي", error);
    return;
  }
  toast("ارتفع البنر ✅ — فعّله متى ما جهزت");
  await loadAdmWeek2();
  loadSponsor6();
}
async function admSpSaveLink() {
  const { error } = await sb.from("site_banner").update({ link_url: $("spLink").value.trim(), sponsor_name: $("spName").value.trim(), sponsor_cat: $("spCat").value.trim(), sponsor_lat: parseFloat($("spLat").value) || null, sponsor_lng: parseFloat($("spLng").value) || null, sponsor_deal: $("spDeal").value.trim(), sponsor_code: $("spCode").value.trim() }).eq("id", 1);
  if (error) {
    dbErr("حفظ بيانات الراعي", error);
    return;
  }
  toast("انحفظ الرابط ✅");
  loadSponsor6();
}
async function admSpToggle() {
  if (!needEditor("بنر الراعي")) return;
  const b = state.banner;
  const { error } = await sb.from("site_banner").update({ active: !b.active }).eq("id", 1);
  if (error) {
    dbErr("تفعيل بنر الراعي", error);
    return;
  }
  toast(b.active ? "اختفى البنر" : "انطلق البنر برأس الصفحة 📣");
  await loadAdmWeek2();
  loadSponsor6();
}
async function admWeekSave() {
  const data = { week_label: $("wkLabel").value.trim(), sponsor_name: $("wkSponsor").value.trim(), prize: $("wkPrize").value.trim() };
  const q = _CW_() ? sb.from("weekly_contest").update(data).eq("id", _CW_().id) : sb.from("weekly_contest").insert({ ...data, active: false });
  const { error } = await q;
  if (error) {
    toast("تعذر الحفظ: " + error.message, true);
    return;
  }
  toast("انحفظت المسابقة ✅");
  await loadAdmWeek2();
  await loadWeek5();
}
async function admWeekToggle() {
  if (!needEditor("المسابقة")) return;
  const { error } = await sb.from("weekly_contest").update({ active: !_CW_().active }).eq("id", _CW_().id);
  if (error) {
    dbErr("تفعيل لقطة الأسبوع", error);
    return;
  }
  toast(_CW_().active ? "أُوقفت المسابقة" : "انطلقت المسابقة للجمهور 🎉");
  await loadAdmWeek2();
  await loadWeek5();
}
async function admWeekAdd(pid) {
  if (!_CW_()) {
    toast("أنشئ المسابقة أول من تبويب 🏆", true);
    return;
  }
  if (_CW_().ended_at) {
    toast("المسابقة منتهية — أنشئ جديدة من تبويب 🏆", true);
    return;
  }
  const en = await sb.from("weekly_entries").select("photo_id").eq("contest_id", _CW_().id);
  if ((en.data || []).length >= 5) {
    toast("اكتمل العدد — 5 لقطات كحد أقصى", true);
    return;
  }
  const { error } = await sb.from("weekly_entries").insert({ contest_id: _CW_().id, photo_id: pid });
  if (error) {
    toast(error.code === "23505" ? "مرشحة من قبل" : "تعذر الترشيح", true);
    return;
  }
  toast("انضافت للترشيحات 🏆");
}
async function admWeekRemove(pid) {
  if (!_CW_()) {
    toast("ما فيه مسابقة", true);
    return;
  }
  const { error } = await sb.from("weekly_entries").delete().eq("contest_id", _CW_().id).eq("photo_id", pid);
  if (error) {
    dbErr("إزالة الترشيح", error);
    return;
  }
  toast("أُزيلت");
  await loadAdmWeek2();
}
async function admWeekPick(pid) {
  if (!_CW_()) {
    toast("أنشئ المسابقة أول من أعلى الصفحة", true);
    return;
  }
  if (_CW_().ended_at) {
    toast("المسابقة منتهية — أنشئ جديدة", true);
    return;
  }
  const cell = document.querySelector('.wk-cell[data-id="' + pid + '"]');
  if (!cell) return;
  const box = cell.querySelector(".wk-box");
  const was = cell.classList.contains("on");
  if (!was && document.querySelectorAll(".wk-cell.on").length >= 5) {
    toast("اكتمل العدد — ٥ لقطات كحد أقصى", true);
    return;
  }
  const paint = (v) => {
    cell.classList.toggle("on", v);
    if (box) box.textContent = v ? "✓" : "";
    const c = $("wkCount");
    if (c) c.textContent = "(" + document.querySelectorAll(".wk-cell.on").length + "/5)";
  };
  paint(!was);
  const q = was ? sb.from("weekly_entries").delete().eq("contest_id", _CW_().id).eq("photo_id", pid) : sb.from("weekly_entries").insert({ contest_id: _CW_().id, photo_id: pid });
  const { error } = await q;
  if (error) {
    if (!was && error.code === "23505") {
      toast("مرشحة من قبل");
      return;
    }
    paint(was);
    dbErr(was ? "إزالة الترشيح" : "الترشيح", error);
    return;
  }
  toast(was ? "أُزيلت من الترشيحات" : "انضافت للترشيحات 🏆");
}
async function admWeekEnd() {
  const bd = await sb.from("weekly_board").select("*").eq("contest_id", _CW_().id);
  let win = null, mx = 0;
  (bd.data || []).forEach((r) => {
    if (r.votes > mx) {
      mx = r.votes;
      win = r.photo_id;
    }
  });
  if (!win) {
    if (!confirm("ما فيه أصوات بعد — إنهاء المسابقة بدون فائز؟")) return;
  } else if (!confirm("إنهاء المسابقة وإعلان الفائز؟ يظهر التتويج بالرئيسية لمدة أسبوع.")) return;
  const { error } = await sb.from("weekly_contest").update({ active: false, ended_at: (/* @__PURE__ */ new Date()).toISOString(), winner_photo_id: win }).eq("id", _CW_().id);
  if (error) {
    toast("فشل الإنهاء: " + error.message, true);
    return;
  }
  toast(win ? "أُعلن الفائز — مبروك للمتوّج 👑" : "أُنهيت المسابقة");
  await loadAdmWeek2();
  await loadWeek5();
}
async function admWeekNew() {
  const { error } = await sb.from("weekly_contest").insert({ active: false });
  if (error) {
    dbErr("إنشاء مسابقة جديدة", error);
    return;
  }
  toast("مسابقة جديدة جاهزة للتجهيز ✨");
  await loadAdmWeek2();
}
async function admSpDelete() {
  if (!needEditor("حذف الراعي")) return;
  const b = state.banner;
  if (!confirm("حذف بنر الراعي نهائياً؟ الصورة تنمسح من المخزن والإعدادات تتصفّر.")) return;
  if (b.image_path) await sb.storage.from("photos").remove([b.image_path]).catch(() => {
  });
  const { error } = await sb.from("site_banner").update({ active: false, image_path: "", link_url: "" }).eq("id", 1);
  if (error) {
    dbErr("حذف بنر الراعي", error);
    return;
  }
  toast("انحذف البنر نهائياً 🗑️");
  await loadAdmWeek2();
  loadSponsor6();
}
async function admWeekDelete() {
  if (!needEditor("حذف الجولة")) return;
  if (!confirm(`حذف مسابقة «${_CW_().week_label || "بلا وسم"}» نهائياً؟ تنمسح بترشيحاتها وأصواتها، ويختفي أي تتويج مرتبط بها من الرئيسية.`)) return;
  const { error } = await sb.from("weekly_contest").delete().eq("id", _CW_().id);
  if (error) {
    toast("فشل الحذف: " + error.message, true);
    return;
  }
  toast("انحذفت المسابقة 🗑️");
  await loadAdmWeek2();
  await loadWeek5();
}
function admSponsorsBtn() {
  const b = state.banner;
  const on = !!b.sponsors_btn;
  return `<div style="background:var(--card);border:1.5px solid ${on ? "var(--qblue)" : "var(--line)"};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">🤝 زر الرعاة بالرئيسية <span style="font-size:11px;font-weight:700;color:${on ? "var(--qblue)" : "var(--txt-dim)"}">${on ? "● ظاهر" : "○ مخفي"}</span></div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px">زر «🤝 الرعاة» في قائمة الفلتر.</div>
    <button class="btn" style="width:100%;${on ? "background:var(--sadu)" : "background:var(--qblue)"}" onclick="admSponsorsBtnToggle()">${on ? "🙈 إخفاء زر الرعاة" : "👁️ إظهار زر الرعاة"}</button>
  </div>`;
}
async function admSponsorsBtnToggle() {
  if (!needEditor("صفحة الرعاة")) return;
  const b = state.banner;
  const { error } = await sb.from("site_banner").update({ sponsors_btn: !b.sponsors_btn }).eq("id", 1);
  if (error) {
    dbErr("زر الرعاة", error);
    return;
  }
  toast(!b.sponsors_btn ? "زر الرعاة ظاهر 🤝" : "اختفى الزر");
  await loadAdmWeek2();
  await loadSponsor6();
}
function admSponsorSideBlock() {
  const b = state.banner;
  const on = !!b.side_active;
  return `
  <div style="background:var(--card);border:1.5px solid ${on ? "var(--palm)" : "var(--line)"};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">📌 بطاقة الراعي بالرئيسية ${on ? '<span style="font-size:11px;color:var(--palm);font-weight:700">● ظاهرة</span>' : '<span style="font-size:11px;color:var(--txt-dim)">○ مخفية</span>'}</div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px">البطاقة الصغيرة (الاسم + النشاط) التي تظهر فوق الصور بالرئيسية.</div>
    <button class="btn" style="width:100%;${on ? "background:var(--sadu)" : "background:var(--palm)"}" onclick="admSideBannerToggle()">${on ? "🙈 إخفاء البطاقة" : "👁️ إظهار البطاقة بالرئيسية"}</button>
  </div>`;
}
async function admSideBannerToggle() {
  if (!needEditor("البطاقة الجانبية")) return;
  const b = state.banner;
  const { error } = await sb.from("site_banner").update({ side_active: !b.side_active }).eq("id", 1);
  if (error) {
    toast("فشلت العملية: " + error.message, true);
    return;
  }
  toast(!b.side_active ? "البطاقة ظاهرة بالرئيسية 📌" : "اختفت البطاقة");
  await loadSponsor6();
  await loadAdmWeek2();
}
function admChallengeBlock() {
  const c = window.__CH || {};
  const on = !!c.active;
  return `<div style="background:var(--card);border:1.5px solid ${on ? "var(--qblue)" : "var(--line)"};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">🎯 تحدي الأسبوع <span style="font-size:11px;font-weight:700;color:${on ? "var(--qblue)" : "var(--txt-dim)"}">${on ? "● نشط" : "○ مطفأ"}</span></div>
    <input id="chTitle" placeholder="موضوع التحدي (مثال: الأبواب القديمة)" value="${esc(c.title || "")}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
    <input id="chHint" placeholder="وصف أو تلميح (اختياري)" value="${esc(c.hint || "")}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
    <input id="chEnds" type="date" value="${c.ends_at || ""}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px;direction:ltr;text-align:left">
    <div style="font-size:11.5px;color:var(--txt-dim);margin:10px 0 6px">توجيه التحدي (اختياري)</div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <select id="chRegion" style="flex:1;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px;color:var(--txt);font-family:'Tajawal';font-size:12.5px;outline:none">
        <option value="">كل المناطق</option>
        ${["الرياض", "مكة المكرمة", "المدينة المنورة", "القصيم", "الشرقية", "عسير", "تبوك", "حائل", "الحدود الشمالية", "جازان", "نجران", "الباحة", "الجوف"].map((r) => `<option value="${r}" ${c.region === r ? "selected" : ""}>${r}</option>`).join("")}
      </select>
      <select id="chCat" style="flex:1;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px;color:var(--txt);font-family:'Tajawal';font-size:12.5px;outline:none">
        <option value="">كل التصنيفات</option>
        ${[["nature", "🌿 طبيعة"], ["arch", "🏛️ عمارة"], ["wildlife", "🦅 طيور"], ["people", "👥 أشخاص"], ["bw", "⬛ أبيض وأسود"], ["landmark", "🕌 معلم"], ["heritage", "🏺 تراث"]].map((x) => `<option value="${x[0]}" ${c.cat === x[0] ? "selected" : ""}>${x[1]}</option>`).join("")}
      </select>
    </div>
    <input id="chPrize" placeholder="الجائزة أو الحافز (اختياري)" value="${esc(c.prize || "")}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:10px">
    <div class="ch-ideas">
      <b>أفكار جاهزة:</b>
      <button onclick="chIdea('أجمل غروب في نجد','الرياض','nature')">🌅 غروب نجد</button>
      <button onclick="chIdea('تفاصيل تراثية من الجنوب','عسير','heritage')">🏺 تراث الجنوب</button>
      <button onclick="chIdea('أماكن نادرة في الشرقية','الشرقية','')">💎 نوادر الشرقية</button>
      <button onclick="chIdea('نخيل القصيم','القصيم','nature')">🌴 نخيل القصيم</button>
      <button onclick="chIdea('أبواب ونوافذ قديمة','','arch')">🚪 أبواب قديمة</button>
      <button onclick="chIdea('ليل الصحراء ونجومها','','nature')">🌙 ليل الصحراء</button>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1;font-size:12px;padding:9px;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="admChSave()">💾 حفظ</button>
      <button class="btn" style="flex:1;font-size:12px;padding:9px;${on ? "background:var(--sadu)" : "background:var(--qblue)"}" onclick="admChToggle()">${on ? "🙈 إيقاف" : "▶️ تفعيل"}</button>
    </div>
  </div>`;
}
async function admChSave() {
  const { error } = await sb.from("challenge").update({
    title: $("chTitle").value.trim(),
    hint: $("chHint").value.trim(),
    ends_at: $("chEnds").value || null,
    region: $("chRegion") ? $("chRegion").value : "",
    cat: $("chCat") ? $("chCat").value : "",
    prize: $("chPrize") ? $("chPrize").value.trim() : "",
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", 1);
  if (error) {
    toast("فشل الحفظ: " + error.message, true);
    return;
  }
  toast("انحفظ التحدي ✅");
  await loadChallenge5();
  await loadAdmWeek2();
}
async function admChToggle() {
  const c = window.__CH || {};
  if (!c.active && !$("chTitle").value.trim()) {
    toast("اكتب موضوع التحدي أولاً", true);
    return;
  }
  const { error } = await sb.from("challenge").update({ active: !c.active }).eq("id", 1);
  if (error) {
    dbErr("تفعيل تحدي الأسبوع", error);
    return;
  }
  toast(!c.active ? "التحدي نشط 🎯" : "اتوقف التحدي");
  await loadChallenge5();
  await loadAdmWeek2();
}
function chIdea(title, region, cat) {
  if ($("chTitle")) $("chTitle").value = title;
  if ($("chRegion")) $("chRegion").value = region;
  if ($("chCat")) $("chCat").value = cat;
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() + 7);
  if ($("chEnds")) $("chEnds").value = d.toISOString().slice(0, 10);
  toast("اضغط حفظ ثم تفعيل 🎯");
}
var _CW_, loadAdmWeek2, loadChallenge5, loadSponsor6, loadWeek5, needEditor;
var init_contest = __esm({
  "js/admin/contest.js"() {
    init_db();
    init_hub();
    init_media();
    init_state();
    init_ui();
    init_places();
    _CW_ = need("getCW");
    loadAdmWeek2 = need("loadAdmWeek");
    loadChallenge5 = need("loadChallenge");
    loadSponsor6 = need("loadSponsor");
    loadWeek5 = need("loadWeek");
    needEditor = need("needEditor");
  }
});

// js/admin/curation.js
var curation_exports = {};
__export(curation_exports, {
  ecApprove: () => ecApprove,
  ecNominate: () => ecNominate,
  ecReject: () => ecReject,
  ecRevoke: () => ecRevoke,
  ecVote: () => ecVote,
  loadEC: () => loadEC
});
async function loadEC() {
  const el = $("admEC");
  if (!el) return;
  if (!isCurator()) {
    el.innerHTML = '<div class="empty" style="padding:26px"><span class="big">🔒</span>هذا القسم للمحررين</div>';
    return;
  }
  el.innerHTML = '<div class="empty">⏳</div>';
  try {
    const r = await sb.from("ec_nominations").select("*").eq("status", "open").order("created_at", { ascending: false });
    const noms = r.data || [];
    let curators = 1;
    try {
      const [cu, ad] = await Promise.all([
        sb.from("curators").select("id"),
        sb.from("admins").select("id,role")
      ]);
      const s = new Set((cu.data || []).map((x) => x.id));
      (ad.data || []).forEach((x) => {
        if (x.role === "owner" || x.role === "editor") s.add(x.id);
      });
      curators = s.size || 1;
    } catch (e) {
    }
    const quorum = Math.max(2, Math.ceil(curators / 2));
    const votes = {};
    let myVotes = {};
    if (noms.length) {
      try {
        const ids = noms.map((n) => n.id);
        const v = await sb.from("ec_votes").select("nom_id,voter,vote").in("nom_id", ids);
        (v.data || []).forEach((x) => {
          votes[x.nom_id] = votes[x.nom_id] || { yes: 0, no: 0 };
          votes[x.nom_id][x.vote]++;
          if (currentUser() && x.voter === currentUser()?.id) myVotes[x.nom_id] = x.vote;
        });
      } catch (e) {
      }
    }
    const names = {};
    try {
      const uids = [...new Set(noms.map((n) => n.nominated_by))];
      if (uids.length) {
        const pr = await sb.from("profiles").select("id,display_name").in("id", uids);
        (pr.data || []).forEach((u) => {
          names[u.id] = u.display_name || "محرّر";
        });
      }
    } catch (e) {
    }
    const head = `<div class="ec-head">
      <div class="ec-h1">🏵️ ترشيحات اختيار المحررين</div>
      <div class="ec-h2">${noms.length} مفتوحة · ${curators} محرّراً · تحتاج ${quorum} أصوات للاعتماد</div>
    </div>`;
    if (!noms.length) {
      el.innerHTML = head + '<div class="empty" style="padding:24px"><span class="big">🏵️</span>ما فيه ترشيحات مفتوحة<br><span style="font-size:12px">رشّح صورة من تبويب 🗂️ الصور</span></div>';
      return;
    }
    el.innerHTML = head + noms.map((n) => {
      const p = state.admPhotos.find((x) => x.id === n.photo_id) || state.photos.find((x) => x.id === n.photo_id);
      const v = votes[n.id] || { yes: 0, no: 0 };
      const mine = myVotes[n.id];
      const ready = v.yes >= quorum;
      return `<div class="ec-card${ready ? " ready" : ""}">
        <div class="ec-top">
          ${p ? `<img src="${thumbUrl(p.image_path)}" onerror="this.onerror=null;this.src='${imgUrl(p.image_path)}'" onclick="openSheet(${p.id})" alt="">` : '<div class="ec-noimg">📷</div>'}
          <div class="ec-info">
            <div class="ec-title">${p ? esc(p.title) : "صورة #" + n.photo_id}</div>
            ${p ? `<div class="ec-meta">${esc(p.photographer || "")} · ${esc(p.village || p.city || p.country || "")}</div>` : ""}
            <div class="ec-by">رشّحها: ${esc(names[n.nominated_by] || "محرّر")}</div>
            ${n.reason ? `<div class="ec-reason">«${esc(n.reason)}»</div>` : ""}
          </div>
        </div>
        <div class="ec-votes">
          <div class="ec-bar">
            <span class="ec-yes">✓ ${v.yes}</span>
            <span class="ec-no">✕ ${v.no}</span>
            ${ready ? '<span class="ec-ready">جاهزة للاعتماد</span>' : `<span class="ec-need">تحتاج ${quorum - v.yes} أصوات</span>`}
          </div>
          <div class="ec-btns">
            <button class="ec-v yes ${mine === "yes" ? "on" : ""}" onclick="ecVote(${n.id},'yes')">✓ أوافق</button>
            <button class="ec-v no ${mine === "no" ? "on" : ""}" onclick="ecVote(${n.id},'no')">✕ أعترض</button>
            ${ready && isEditor() ? `<button class="ec-approve" onclick="ecApprove(${n.id},${n.photo_id})">🏵️ اعتمدها</button>` : ""}
            ${isEditor() ? `<button class="ec-rej" onclick="ecReject(${n.id})">🗑️</button>` : ""}
          </div>
        </div>
      </div>`;
    }).join("");
  } catch (e) {
    el.innerHTML = '<div class="empty" style="padding:20px">تعذر التحميل: ' + esc(e.message || "") + "</div>";
  }
}
async function ecNominate(pid) {
  if (!isCurator()) {
    toast("🔒 الترشيح للمحررين", true);
    return;
  }
  const reason = prompt("ليش تستاهل هذي الصورة؟ (اختياري)", "");
  if (reason === null) return;
  const { error } = await sb.from("ec_nominations").insert({
    photo_id: pid,
    nominated_by: currentUser()?.id,
    reason: (reason || "").trim().slice(0, 200)
  });
  if (error) {
    if (error.code === "23505") {
      toast("مرشّحة أصلاً 🏵️", true);
      return;
    }
    toast("تعذر الترشيح: " + error.message, true);
    return;
  }
  try {
    const nn = (await sb.from("ec_nominations").select("id").eq("photo_id", pid).maybeSingle()).data;
    if (nn) await sb.from("ec_votes").insert({ nom_id: nn.id, voter: currentUser()?.id, vote: "yes" });
  } catch (e) {
  }
  try {
    const [cu, ad] = await Promise.all([
      sb.from("curators").select("id"),
      sb.from("admins").select("id,role")
    ]);
    const s = new Set((cu.data || []).map((x) => x.id));
    (ad.data || []).forEach((x) => {
      if (x.role === "owner" || x.role === "editor") s.add(x.id);
    });
    s.delete(currentUser()?.id);
    const ids = [...s];
    if (ids.length && typeof pushNotify25 === "function") {
      const p = state.admPhotos.find((x) => x.id === pid) || state.photos.find((x) => x.id === pid);
      pushNotify25({
        title: "🏵️ ترشيح جديد",
        body: "صورة «" + (p && p.title || "") + "» تنتظر تصويتك",
        url: "/",
        user_ids: ids
      });
    }
  } catch (e) {
  }
  toast("🏵️ انترشّحت — وصل المحررين إشعار");
  if (state.admTab === "ec") loadEC();
}
async function ecVote(nomId, vote) {
  if (!isCurator()) {
    toast("🔒 التصويت للمحررين", true);
    return;
  }
  const { error } = await sb.from("ec_votes").upsert(
    { nom_id: nomId, voter: currentUser()?.id, vote },
    { onConflict: "nom_id,voter" }
  );
  if (error) {
    toast("تعذر التصويت: " + error.message, true);
    return;
  }
  toast(vote === "yes" ? "✓ سجّلنا موافقتك" : "✕ سجّلنا اعتراضك");
  loadEC();
}
async function ecApprove(nomId, pid) {
  if (!needEditor2("اعتماد الاختيار")) return;
  if (!confirm("اعتماد هذي الصورة كـ«اختيار المحررين»؟\n\nراح تنال الوسام ويوصل صاحبها إشعار.")) return;
  const u1 = await sb.from("photos").update({ editors_choice: true, ec_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", pid);
  if (u1.error) {
    toast("تعذر الاعتماد: " + u1.error.message, true);
    return;
  }
  await sb.from("ec_nominations").update({ status: "approved", decided_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", nomId);
  try {
    const p = (await sb.from("photos").select("user_id,title").eq("id", pid).maybeSingle()).data;
    if (p && p.user_id) {
      if (typeof pushNotify25 === "function") pushNotify25({
        title: "🏵️ صورتك اختيار المحررين!",
        body: "«" + (p.title || "") + "» نالت وسام اختيار المحررين",
        url: "/",
        user_ids: [p.user_id]
      });
      await sb.from("feedback").insert({
        user_id: p.user_id,
        kind: "other",
        status: "done",
        body: "🏵️ مبروك! صورتك «" + (p.title || "") + "» اختارها المحررون\n\nهيئة المحررين رشّحتها وصوّتت لها — وصارت تحمل وسام «اختيار المحررين» 🏵️\n\nواصل عدستك، وشكراً لأنك توثّق جمال ديارنا."
      });
    }
  } catch (e) {
  }
  toast("🏵️ انعتمدت — وانبلّغ صاحبها");
  loadEC();
  if (typeof loadPhotos22 === "function") loadPhotos22();
}
async function ecReject(nomId) {
  if (!needEditor2("رفض الترشيح")) return;
  if (!confirm("رفض هذا الترشيح؟")) return;
  const { error } = await sb.from("ec_nominations").update({ status: "rejected", decided_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", nomId);
  if (error) {
    toast("تعذر الرفض: " + error.message, true);
    return;
  }
  toast("انرفض الترشيح");
  loadEC();
}
async function ecRevoke(pid) {
  if (!needEditor2("سحب الوسام")) return;
  if (!confirm("سحب وسام اختيار المحررين من هذي الصورة؟")) return;
  const { error } = await sb.from("photos").update({ editors_choice: false, ec_at: null }).eq("id", pid);
  if (error) {
    toast("تعذر السحب: " + error.message, true);
    return;
  }
  await sb.from("ec_nominations").delete().eq("photo_id", pid);
  toast("انسحب الوسام");
  if (typeof loadAllPhotos === "function") admRender();
  if (typeof loadPhotos22 === "function") loadPhotos22();
}
var admRender, loadPhotos22, needEditor2, pushNotify25;
var init_curation = __esm({
  "js/admin/curation.js"() {
    init_db();
    init_hub();
    init_media();
    init_state();
    init_ui();
    init_places();
    admRender = need("admRender");
    loadPhotos22 = need("loadPhotos");
    needEditor2 = need("needEditor");
    pushNotify25 = need("pushNotify");
  }
});

// js/admin/index.js
var admin_exports = {};
__export(admin_exports, {
  CW: () => CW,
  admClear: () => admClear,
  admRender: () => admRender2,
  admRoleBadge: () => admRoleBadge,
  admSearch: () => admSearch,
  admSetTab: () => admSetTab,
  admTools: () => admTools,
  admWeekSearch: () => admWeekSearch,
  getCW: () => getCW,
  hideRestrictedTabs: () => hideRestrictedTabs,
  loadAdmList: () => loadAdmList,
  loadAdmWeek: () => loadAdmWeek3,
  loadWeekPicker: () => loadWeekPicker,
  openAdmin: () => openAdmin2
});
async function openAdmin2() {
  if (typeof state.isAdmin !== "undefined" && !state.isAdmin && state.isCurator) {
    go27("adm");
    ["Rep", "All", "Plc", "Fb", "St", "Wk", "Qs", "Mu"].forEach(function(x) {
      const e = document.getElementById("admTab" + x);
      if (e) e.style.display = "none";
    });
    state.admTab = "ec";
    const ec = document.getElementById("admTabEc");
    if (ec) {
      ec.style.display = "";
      ec.classList.add("on");
    }
    ["admRep", "admAll", "admPlc", "admFb", "admSt", "admWk", "admQs", "admMu"].forEach(function(id) {
      const e = document.getElementById(id);
      if (e) e.style.display = "none";
    });
    const ae = document.getElementById("admEC");
    if (ae) ae.style.display = "";
    loadEC2();
    return;
  }
  try {
    const c = (await sb.from("curators").select("id").eq("id", currentUser()?.id).maybeSingle()).data;
    state.isCurator = !!c;
  } catch (e) {
  }
  setTimeout(function() {
    if (typeof hideRestrictedTabs === "function") hideRestrictedTabs();
  }, 150);
  go27("adm");
  $("admList").innerHTML = '<div class="empty">⏳ جاري التحميل...</div>';
  const rp = await sb.from("reports").select("photo_id");
  if (rp.error) {
    $("admList").innerHTML = `<div class="empty">⚠️ خطأ في جلب البلاغات:<br><span style="direction:ltr;display:inline-block;color:var(--sadu);font-size:12px">${rp.error.message}</span></div>`;
    return;
  }
  state.admReps = {};
  (rp.data || []).forEach((r) => state.admReps[r.photo_id] = (state.admReps[r.photo_id] || 0) + 1);
  admSetTab(state.admTab);
}
function admTools() {
  if (!$("admTools")) return;
  if ($("adQ")) return;
  const regs = $("fRegion") ? $("fRegion").innerHTML : '<option value="">كل المناطق</option>';
  const cats = [
    ["", "كل التصنيفات"],
    ["nature", "🌿 طبيعة"],
    ["arch", "🏛️ عمارة"],
    ["wildlife", "🦅 طيور"],
    ["people", "👥 أشخاص"],
    ["bw", "⬛ أبيض وأسود"],
    ["heritage", "🏺 تراث"],
    ["landmark", "🕌 معلم"],
    ["other", "📷 أخرى"]
  ];
  const st = "background:var(--card2);border:1px solid var(--line);border-radius:11px;padding:9px;color:var(--txt);font-family:'Tajawal';font-size:12.5px;outline:none;min-width:0";
  $("admTools").innerHTML = `<div class="wk-tools">
    <input id="adQ" placeholder="ابحث بعنوان الصورة…" oninput="admSearch()" style="${st};grid-column:1/-1">
    <select id="adCat" onchange="loadAdmList()" style="${st}">
      ${cats.map((c) => `<option value="${c[0]}">${c[1]}</option>`).join("")}
    </select>
    <select id="adSort" onchange="loadAdmList()" style="${st}">
      <option value="new">🆕 الأحدث</option>
      <option value="old">🕰️ الأقدم</option>
    </select>
    <select id="adReg" onchange="loadAdmList()" style="${st};grid-column:1/-1">${regs}</select>
  </div>`;
}
function admSearch() {
  clearTimeout(_adT);
  _adT = setTimeout(() => {
    loadAdmList();
  }, 350);
}
async function loadAdmList() {
  const box = $("admList");
  if (!box) return;
  const rep = state.admTab === "rep";
  admTools();
  const tb = $("admTools");
  if (tb) tb.style.display = rep ? "none" : "";
  box.innerHTML = '<div class="empty">⏳</div>';
  let q = sb.from("photos").select("*, profiles!user_id(display_name, banned)");
  if (rep) {
    const ids = Object.keys(state.admReps || {}).map(Number);
    q = ids.length ? q.or(`hidden.eq.true,id.in.(${ids.join(",")})`) : q.eq("hidden", true);
    q = q.order("created_at", { ascending: false }).limit(ADM_LIMIT);
  } else {
    const term = ($("adQ") || {}).value || "";
    const cat = ($("adCat") || {}).value || "";
    const reg = ($("adReg") || {}).value || "";
    const srt = ($("adSort") || {}).value || "new";
    if (term.trim()) q = q.ilike("title", "%" + term.trim() + "%");
    if (cat) q = q.eq("category", cat);
    if (reg) q = q.eq("region", reg);
    q = q.order("created_at", { ascending: srt === "old" }).limit(ADM_LIMIT);
  }
  const r = await q;
  if (r.error) {
    dbErr("جلب الصور", r.error);
    box.innerHTML = "";
    return;
  }
  state.admPhotos = r.data || [];
  admRender2();
  if (!rep && state.admPhotos.length >= ADM_LIMIT) {
    box.insertAdjacentHTML(
      "afterbegin",
      `<div class="empty" style="padding:10px;grid-column:1/-1;font-size:12px">بلغنا حدّ العرض (${ADM_LIMIT}) — ضيّق البحث لترى الباقي</div>`
    );
  }
}
function hideRestrictedTabs() {
  try {
    const st = document.getElementById("admTabSt");
    if (st) st.style.display = isOwner() ? "" : "none";
    ["Wk", "Qs", "Plc", "Mu"].forEach(function(x) {
      const e = document.getElementById("admTab" + x);
      if (e) e.style.display = isEditor() ? "" : "none";
    });
  } catch (e) {
  }
}
function admRoleBadge() {
  const r = admRole();
  if (!r) return "";
  const x = _ADM_ROLES_()[r] || _ADM_ROLES_().mod;
  return `<div class="adm-role" style="border-color:${x.c};color:${x.c}">${x.ic} ${x.n}</div>`;
}
function admSetTab(t) {
  const tabPerm = { wk: "editor", qs: "editor", plc: "editor", mu: "editor" };
  if (t === "ec" && !isCurator()) {
    toast("🔒 هذا القسم للمحررين", true);
    return;
  }
  if (t === "st" && !isOwner()) {
    toast("🔒 الإحصائيات للمالك فقط", true);
    return;
  }
  if (tabPerm[t] && !isEditor()) {
    toast("🔒 هذا القسم يحتاج صلاحية أعلى", true);
    return;
  }
  state.admTab = t;
  ["Rep", "All", "Plc", "Fb", "St", "Wk", "Qs", "Mu", "Ec"].forEach((x) => {
    const e = $("admTab" + x);
    if (e) e.classList.remove("on");
  });
  const m = { rep: "Rep", all: "All", plc: "Plc", fb: "Fb", st: "St", wk: "Wk", qs: "Qs", ec: "Ec", mu: "Mu" };
  const cur = $("admTab" + m[t]);
  if (cur) cur.classList.add("on");
  $("admPlaces").style.display = t === "plc" ? "" : "none";
  $("admFb").style.display = t === "fb" ? "" : "none";
  $("admSt").style.display = t === "st" ? "" : "none";
  $("admWk").style.display = t === "wk" ? "" : "none";
  const aq = $("admQs");
  if (aq) aq.style.display = t === "qs" ? "" : "none";
  const am = $("admMu");
  if (am) am.style.display = t === "mu" ? "" : "none";
  const ae = $("admEC");
  if (ae) ae.style.display = t === "ec" ? "" : "none";
  $("admList").style.display = t === "rep" || t === "all" ? "" : "none";
  if (t === "plc") renderPlaces();
  else if (t === "fb") loadFb();
  else if (t === "st") {
    loadStats();
    setTimeout(loadCommercial, 400);
  } else if (t === "wk") loadAdmWeek3();
  else if (t === "qs") loadAdmQuests();
  else if (t === "mu") loadAdmMusic();
  if (t === "ec") loadEC2();
  else if (t === "rep" || t === "all") loadAdmList();
}
function wkTools() {
  const regs = ($("fRegion") ? $("fRegion").innerHTML : '<option value="">كل المناطق</option>').replace("كل المناطق", "كل المناطق");
  const cats = [
    ["", "كل التصنيفات"],
    ["nature", "🌿 طبيعة"],
    ["arch", "🏛️ عمارة"],
    ["wildlife", "🦅 طيور"],
    ["people", "👥 أشخاص"],
    ["bw", "⬛ أبيض وأسود"],
    ["heritage", "🏺 تراث"],
    ["landmark", "🕌 معلم"],
    ["other", "📷 أخرى"]
  ];
  const sel = "background:var(--card2);border:1px solid var(--line);border-radius:11px;padding:9px;color:var(--txt);font-family:'Tajawal';font-size:12.5px;outline:none;min-width:0";
  return `<div class="wk-tools">
    <input id="wkQ" placeholder="ابحث بعنوان الصورة…" oninput="admWeekSearch()" style="${sel};grid-column:1/-1">
    <select id="wkScope" onchange="loadWeekPicker()" style="${sel}">
      <option value="week">🗓️ آخر ٧ أيام</option>
      <option value="month">🗓️ آخر ٣٠ يوماً</option>
      <option value="top">⭐ الأعلى تقييماً</option>
      <option value="all">📚 كل الصور</option>
    </select>
    <select id="wkCat" onchange="loadWeekPicker()" style="${sel}">
      ${cats.map((c) => `<option value="${c[0]}">${c[1]}</option>`).join("")}
    </select>
    <select id="wkReg" onchange="loadWeekPicker()" style="${sel};grid-column:1/-1">${regs}</select>
  </div>
  <div id="wkPickBox"><div class="empty" style="padding:18px">⏳</div></div>`;
}
function admWeekSearch() {
  clearTimeout(_wkT);
  _wkT = setTimeout(() => {
    loadWeekPicker();
  }, 350);
}
async function loadWeekPicker() {
  const box = $("wkPickBox");
  if (!box) return;
  box.innerHTML = '<div class="empty" style="padding:18px">⏳</div>';
  let picked = [];
  if (CW) {
    const en = await sb.from("weekly_entries").select("photo_id").eq("contest_id", CW.id);
    const ids = (en.data || []).map((e) => e.photo_id);
    if (ids.length) {
      const r2 = await sb.from("photos_ranked").select("id,title,image_path,avg_stars").in("id", ids);
      if (r2.error) {
        dbErr("جلب الترشيحات", r2.error);
        return;
      }
      picked = r2.data || [];
    }
  }
  const on = new Set(picked.map((p) => p.id));
  const term = ($("wkQ") || {}).value || "";
  const scope = ($("wkScope") || {}).value || "week";
  const cat = ($("wkCat") || {}).value || "";
  const reg = ($("wkReg") || {}).value || "";
  const since = (d) => new Date(Date.now() - d * 864e5).toISOString();
  let q = sb.from("photos_ranked").select("id,title,image_path,avg_stars");
  if (term.trim()) q = q.ilike("title", "%" + term.trim() + "%");
  if (cat) q = q.eq("category", cat);
  if (reg) q = q.eq("region", reg);
  if (scope === "week") q = q.gte("created_at", since(7));
  if (scope === "month") q = q.gte("created_at", since(30));
  q = scope === "top" ? q.order("avg_stars", { ascending: false }).order("id", { ascending: false }) : q.order("created_at", { ascending: false });
  const r = await q.limit(WK_LIMIT);
  if (r.error) {
    dbErr("جلب صور الترشيح", r.error);
    return;
  }
  const rest = (r.data || []).filter((p) => p.image_path && !on.has(p.id));
  const cell = (p) => {
    const sel = on.has(p.id);
    return `<div class="wk-cell${sel ? " on" : ""}" data-id="${p.id}" onclick="admWeekPick(${p.id})" title="${esc(p.title)}">
      <img src="${thumbUrl(p.image_path)}" loading="lazy" alt="${esc(p.title)}">
      <span class="wk-box">${sel ? "✓" : ""}</span>
      <span class="wk-t">#${p.id} · ${esc(p.title)}</span>
    </div>`;
  };
  const grid = (arr) => '<div class="wk-pick">' + arr.map(cell).join("") + "</div>";
  let html = "";
  if (picked.length) {
    html += `<div class="wk-sec">🏆 المرشَّحة الآن (${picked.length}/5)<span>تظهر دائماً مهما غيّرت المرشِّح</span></div>` + grid(picked);
  }
  html += `<div class="wk-sec">🔎 نتائج البحث (${rest.length})` + (rest.length >= WK_LIMIT ? `<span>بلغنا حدّ العرض ${WK_LIMIT} — ضيّق البحث</span>` : "") + `</div>`;
  html += rest.length ? grid(rest) : '<div class="empty" style="padding:22px">ما فيه صور بهذا المرشِّح — وسّعه أو ابحث باسمٍ آخر</div>';
  box.innerHTML = html;
}
async function loadAdmWeek3() {
  $("admWk").innerHTML = '<div class="empty">⏳</div>';
  const c = await sb.from("weekly_contest").select("*").order("id", { ascending: false }).limit(1).maybeSingle();
  CW = c.data || null;
  let entries = [];
  if (CW) {
    const en = await sb.from("weekly_entries").select("photo_id").eq("contest_id", CW.id);
    const ids = (en.data || []).map((e) => e.photo_id);
    entries = ids.map((id) => ({ id }));
  }
  $("admWk").innerHTML = `
    <div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:14px">
      <div style="font-weight:700;font-size:14px;margin-bottom:10px">🏆 مسابقة لقطة الأسبوع ${CW ? `<span style="font-size:11px;padding:3px 10px;border-radius:10px;font-weight:700;${CW.active ? "background:rgba(46,139,87,.15);color:var(--palm);border:1px solid var(--palm)" : "background:var(--card2);color:var(--txt-dim);border:1px solid var(--line)"}">${CW.ended_at ? "🏁 منتهية — الفائز أُعلن" : CW.active ? "● نشطة الآن" : "○ متوقفة"}</span>` : ""}</div>
      <input id="wkLabel" placeholder="وسم الأسبوع (مثال: أسبوع الغروب)" value="${CW ? esc(CW.week_label) : ""}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
      <input id="wkSponsor" placeholder="اسم الراعي (اختياري)" value="${CW ? esc(CW.sponsor_name) : ""}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
      <input id="wkPrize" placeholder="الجائزة (اختياري)" value="${CW ? esc(CW.prize) : ""}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${CW && CW.ended_at ? "" : '<button class="btn" style="flex:1" onclick="admWeekSave()">' + (CW ? "💾 حفظ البيانات" : "➕ إنشاء المسابقة") + "</button>"}
        ${CW && !CW.ended_at ? `<button class="btn" style="flex:1;${CW.active ? "background:var(--card2);border:1px solid var(--line);color:var(--txt)" : "background:var(--palm)"}" onclick="admWeekToggle()">${CW.active ? "⏸️ إيقاف" : "▶️ تفعيل للجمهور"}</button>` : ""}
        ${CW && CW.active ? `<button class="btn" style="flex:1;background:var(--star);color:var(--ink)" onclick="admWeekEnd()">🏁 إنهاء وإعلان الفائز</button>` : ""}
        ${CW && CW.ended_at ? `<button class="btn" style="flex:1;background:var(--palm)" onclick="admWeekNew()">➕ مسابقة جديدة</button>` : ""}
        ${CW ? `<button class="btn" style="flex:0 0 auto;background:var(--sadu)" onclick="admWeekDelete()">🗑️</button>` : ""}
      </div>
    </div>
    <div style="font-weight:700;font-size:14px;margin-bottom:4px">اللقطات المرشحة <span id="wkCount">(${entries.length}/5)</span></div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:9px">اضغط الصورة لترشيحها — تنقلب العلامة ✓ وتُحفظ فوراً</div>
    ${wkTools()}` + admChallengeBlock2() + admReelsBlock() + admInspectBlock() + admCommBlock() + admCleanupBlock2() + await admSpBlock2() + admSponsorsBtn2() + admSponsorSideBlock2() + admNewsBlock() + admGoogleLoginBlock() + admMaintBlock() + await admCuratorsBlock() + await admTeamBlock();
  loadWeekPicker();
}
function admRender2() {
  let list = state.admTab === "rep" ? state.admPhotos.filter((p) => (state.admReps[p.id] || 0) > 0 || p.hidden) : state.admPhotos;
  if (state.admTab === "rep") {
    list = list.slice().sort((x, y) => (state.admReps[y.id] || 0) - (state.admReps[x.id] || 0));
  }
  if (!list.length) {
    $("admList").innerHTML = `<div class="empty">${state.admTab === "rep" ? "✅ ما فيه شيء للمراجعة — الساحة نظيفة" : "ما فيه صور"}</div>`;
    return;
  }
  $("admList").innerHTML = list.map((p) => {
    const rc = state.admReps[p.id] || 0;
    return `<div class="card" style="margin-bottom:12px;cursor:default">
      <!-- كانت imgUrl: الصورة الأصلية كاملةً لكل صفٍّ بالقائمة. فعند
           مئة صورة تُنزَّل مئة صورة كاملة عند كل فتحةٍ للترس، وعند ألفٍ
           ألف. وهي تُعرض في مربّعٍ صغير لا يحتاج عُشر ذلك.
           thumbUrl المصغّرة، وimgUrl احتياطٌ لصورةٍ قديمة بلا مصغّرة. -->
      <div class="ph sq" style="cursor:zoom-in" onclick="openSheet(${p.id})" title="اضغط للتكبير"><img src="${thumbUrl(p.image_path)}" onerror="this.onerror=null;this.src='${imgUrl(p.image_path)}'" loading="lazy" alt="${esc(p.title)}"></div>
      <div class="card-body">
        <div class="card-title">#${p.id} · ${esc(p.title)}</div>
        <div class="card-meta" style="margin-bottom:8px"><span>📷 ${p.profiles?.display_name || "?"} · 📍 ${p.city}</span></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
          ${rc ? `<span style="font-size:11px;padding:3px 9px;border-radius:10px;font-weight:700;background:rgba(242,179,61,.15);color:var(--star);border:1px solid var(--star)">🚩 ${rc} بلاغ</span>` : ""}
          ${p.hidden ? `<span style="font-size:11px;padding:3px 9px;border-radius:10px;font-weight:700;background:rgba(107,98,89,.15);color:var(--txt-dim);border:1px solid var(--line)">🙈 مخفية بقرار إشراف</span>` : ""}
          ${p.profiles?.banned ? `<span style="font-size:11px;padding:3px 9px;border-radius:10px;font-weight:700;background:rgba(192,57,43,.3);color:#fff;border:1px solid var(--sadu)">صاحبها محظور</span>` : ""}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn" title="${p.hidden ? "إظهار الصورة للزوار مرة أخرى" : "إخفاء الصورة عن الزوار — تبقى محفوظة ويمكن إرجاعها"}" style="font-size:12px;padding:8px 12px;${p.hidden ? "background:var(--palm)" : "background:var(--card2);border:1px solid var(--line)"}" onclick="admHide(${p.id},${!p.hidden})">${p.hidden ? "👁️ إظهار" : "🙈 إخفاء"}</button>
          ${isCurator() ? p.editors_choice ? `<button class="btn" title="سحب وسام «اختيار المحررين» من هذه الصورة" style="font-size:12px;padding:8px 12px;background:var(--qteal)" onclick="ecRevoke(${p.id})">🏵️ اسحب الوسام</button>` : `<button class="btn" title="منح الصورة وسام «اختيار المحررين»" style="font-size:12px;padding:8px 12px;background:var(--card2);border:1px solid var(--qteal);color:var(--qteal)" onclick="ecNominate(${p.id})">🏵️ رشّحها</button>` : ""}
          <button class="btn" title="حذف الصورة وملفها من التخزين نهائياً — لا رجعة" style="font-size:12px;padding:8px 12px" onclick="admDel(${p.id},'${p.image_path}')">🗑️ حذف نهائي</button>
          <button class="btn" title="ترشيح الصورة لمسابقة «لقطة الأسبوع»" style="font-size:12px;padding:8px 12px;background:var(--star);color:var(--ink)" onclick="admWeekAdd(${p.id})">🏆 رشّح</button>
          <button class="btn" title="مسح أوسمة الأعضاء (التقييمات الرمزية) عن هذه الصورة" style="font-size:12px;padding:8px 12px;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="admClearBadges(${p.id})">🗳️ مسح الأوسمة</button>
          <button class="btn" title="إضافة الصورة إلى أحد «كنوز الديرة»" style="font-size:12px;padding:8px 12px;background:var(--star);color:var(--ink)" onclick="admAddToQuest(${p.id})">🗝️ لكنز</button>
          <button class="btn" title="${p.profiles?.banned ? "فك الحظر عن صاحب الصورة ليعود للنشر" : "حظر صاحب الصورة من النشر بالمنصة"}" style="font-size:12px;padding:8px 12px;${p.profiles?.banned ? "background:var(--palm)" : "background:var(--card2);border:1px solid var(--line)"}" onclick="admBan('${p.user_id}',${!p.profiles?.banned})">${p.profiles?.banned ? "فك الحظر" : "⛔ حظر المصور"}</button>
          ${rc ? `<button class="btn" title="مسح البلاغات المسجّلة على هذه الصورة" style="font-size:12px;padding:8px 12px;background:var(--card2);border:1px solid var(--line)" onclick="admClear(${p.id})">مسح البلاغات</button>` : ""}
        </div>
      </div>
    </div>`;
  }).join("");
}
async function admClear(id) {
  const { error } = await sb.from("reports").delete().eq("photo_id", id);
  if (error) {
    dbErr("مسح البلاغات", error);
    return;
  }
  toast("مُسحت البلاغات");
  await openAdmin2();
}
var _ADM_ROLES_, loadCommercial, admChallengeBlock2, admCleanupBlock2, admCommBlock, admCuratorsBlock, admGoogleLoginBlock, admInspectBlock, admMaintBlock, admNewsBlock, admReelsBlock, admRole, admSpBlock2, admSponsorSideBlock2, admSponsorsBtn2, admTeamBlock, loadAdmMusic, loadAdmQuests, loadEC2, loadFb, loadStats, renderPlaces, go27, ADM_LIMIT, _adT, CW, getCW, WK_LIMIT, _wkT;
var init_admin = __esm({
  "js/admin/index.js"() {
    init_db();
    init_hub();
    init_media();
    init_state();
    init_ui();
    init_places();
    _ADM_ROLES_ = () => get("ADM_ROLES");
    loadCommercial = need("loadCommercial");
    admChallengeBlock2 = need("admChallengeBlock");
    admCleanupBlock2 = need("admCleanupBlock");
    admCommBlock = need("admCommBlock");
    admCuratorsBlock = need("admCuratorsBlock");
    admGoogleLoginBlock = need("admGoogleLoginBlock");
    admInspectBlock = need("admInspectBlock");
    admMaintBlock = need("admMaintBlock");
    admNewsBlock = need("admNewsBlock");
    admReelsBlock = need("admReelsBlock");
    admRole = need("admRole");
    admSpBlock2 = need("admSpBlock");
    admSponsorSideBlock2 = need("admSponsorSideBlock");
    admSponsorsBtn2 = need("admSponsorsBtn");
    admTeamBlock = need("admTeamBlock");
    loadAdmMusic = need("loadAdmMusic");
    loadAdmQuests = need("loadAdmQuests");
    loadEC2 = need("loadEC");
    loadFb = need("loadFb");
    loadStats = need("loadStats");
    renderPlaces = need("renderPlaces");
    go27 = need("go");
    ADM_LIMIT = 60;
    _adT = null;
    CW = null;
    getCW = () => CW;
    WK_LIMIT = 48;
    _wkT = null;
  }
});

// js/admin/misc.js
var misc_exports = {};
__export(misc_exports, {
  listBucketAll: () => listBucketAll2,
  loadCommercial: () => loadCommercial2,
  muDelete: () => muDelete,
  muPicked: () => muPicked,
  muToggle: () => muToggle,
  muUpload: () => muUpload,
  muUrl: () => muUrl
});
async function listBucketAll2(bucket) {
  const out = [];
  const skip = (n) => !n || n.startsWith(".") || n === ".emptyFolderPlaceholder";
  const root = await sb.storage.from(bucket).list("", { limit: 1e3 });
  const folders = (root.data || []).filter((x) => !x.id);
  const files = (root.data || []).filter((x) => x.id);
  files.forEach((f) => {
    if (!skip(f.name)) out.push(f.name);
  });
  for (const fo of folders) {
    const sub = await sb.storage.from(bucket).list(fo.name, { limit: 1e3 });
    (sub.data || []).forEach((f) => {
      if (f.id && !skip(f.name)) out.push(fo.name + "/" + f.name);
    });
  }
  return out;
}
function muUrl(path) {
  return sb.storage.from("music").getPublicUrl(path).data.publicUrl;
}
async function muUpload() {
  const name = $("muName").value.trim();
  const f = $("muFile").files[0];
  if (!name) {
    toast("اكتب اسم المقطع", true);
    return;
  }
  if (!f) {
    toast("اختر ملف MP3", true);
    return;
  }
  if (f.size > 5 * 1024 * 1024) {
    toast("الملف كبير — الحد 5 ميجا", true);
    return;
  }
  const btn = $("muUpBtn");
  btn.disabled = true;
  btn.textContent = "⏳ نرفع...";
  try {
    const ext = (f.name.split(".").pop() || "mp3").toLowerCase();
    const path = Date.now() + "." + ext;
    const up = await sb.storage.from("music").upload(path, f, { contentType: f.type || "audio/mpeg", cacheControl: "31536000" });
    if (up.error) throw up.error;
    const ins = await sb.from("music").insert({ name, path });
    if (ins.error) {
      await sb.storage.from("music").remove([path]).catch(() => {
      });
      throw ins.error;
    }
    $("muName").value = "";
    $("muFile").value = "";
    toast("انرفع المقطع 🎵");
    loadAdmMusic2();
  } catch (e) {
    toast("فشل الرفع: " + (e.message || ""), true);
  } finally {
    btn.disabled = false;
    btn.textContent = "📤 رفع المقطع";
  }
}
async function muToggle(id, cur) {
  const { error } = await sb.from("music").update({ active: !cur }).eq("id", id);
  if (error) {
    dbErr("تفعيل المقطع", error);
    return;
  }
  toast(!cur ? "المقطع متاح 🎵" : "اختفى المقطع");
  loadAdmMusic2();
}
async function muDelete(id, path) {
  if (!confirm("حذف المقطع نهائياً؟")) return;
  await sb.from("music").delete().eq("id", id);
  try {
    await sb.storage.from("music").remove([path]);
  } catch (e) {
  }
  toast("انحذف المقطع");
  loadAdmMusic2();
}
function muPicked() {
  const f = $("muFile").files[0];
  const lbl = $("muFileName");
  if (lbl) lbl.textContent = f ? f.name + " · " + Math.round(f.size / 1024) + " كيلو" : "اختر ملف صوتي";
}
async function loadCommercial2() {
  const el = $("admSt");
  if (!el) return;
  try {
    const r = await sb.from("photos_ranked").select("id,title,city,region,photographer,image_path,avg_stars,commercial").eq("commercial", true).eq("visibility", "public").order("avg_stars", { ascending: false });
    const list = r.data || [];
    const box = document.createElement("div");
    box.style.cssText = "background:var(--card);border:1.5px solid var(--palm);border-radius:14px;padding:14px;margin-top:14px";
    box.innerHTML = '<div style="font-weight:700;font-size:14px;margin-bottom:6px">💼 متاحة للاستخدام التجاري <span style="color:var(--palm)">' + list.length + '</span></div><div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px;line-height:1.8">صور وافق أصحابها على عرضها للجهات — تواصل معهم عند أي طلب</div>' + (list.length ? list.slice(0, 20).map(
      (p) => '<div style="display:flex;align-items:center;gap:9px;background:var(--card2);border-radius:10px;padding:7px 10px;margin-bottom:5px;font-size:12px"><img src="' + thumbUrl(p.image_path) + '" style="width:34px;height:34px;border-radius:8px;object-fit:cover"><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(p.title) + ' <span style="color:var(--txt-dim)">· ' + esc(p.photographer || "") + '</span></span><span style="color:var(--star);font-weight:700">★ ' + Number(p.avg_stars).toFixed(1) + "</span></div>"
    ).join("") : '<div style="font-size:12px;color:var(--txt-dim)">ما فيه صور بعد</div>');
    el.appendChild(box);
  } catch (e) {
  }
}
var loadAdmMusic2;
var init_misc = __esm({
  "js/admin/misc.js"() {
    init_db();
    init_hub();
    init_media();
    init_state();
    init_ui();
    init_places();
    loadAdmMusic2 = need("loadAdmMusic");
  }
});

// js/admin/music.js
var music_exports2 = {};
__export(music_exports2, {
  loadAdmMusic: () => loadAdmMusic3
});
async function loadAdmMusic3() {
  const el = $("admMu");
  if (!el) return;
  el.innerHTML = '<div class="loader">⏳</div>';
  const r = await sb.from("music").select("*").order("created_at", { ascending: false });
  state.admMusic = r.data || [];
  el.innerHTML = `
  <div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:14px">
    <div style="font-weight:700;font-size:14px;margin-bottom:8px">🎵 إضافة مقطع</div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px">MP3 خالٍ من الحقوق · حتى 5 ميجا · يُفضّل 30-60 ثانية</div>
    <input id="muName" placeholder="اسم المقطع (مثال: عود هادئ)" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
    <input type="file" id="muFile" accept="audio/*,.mp3,.m4a,.wav" style="display:none" onchange="muPicked()">
    <button class="btn" style="width:100%;background:var(--card2);border:1.5px dashed var(--line);color:var(--txt);margin-bottom:8px" onclick="document.getElementById('muFile').click()">📁 <span id="muFileName">اختر ملف صوتي</span></button>
    <button class="btn" style="width:100%" id="muUpBtn" onclick="muUpload()">📤 رفع المقطع</button>
  </div>
  ${state.admMusic.length ? state.admMusic.map((m) => `
    <div style="background:var(--card);border:1.5px solid ${m.active ? "var(--palm)" : "var(--line)"};border-radius:14px;padding:12px 14px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:20px">🎵</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(m.name)}</div>
          <div style="font-size:11px;color:${m.active ? "var(--palm)" : "var(--txt-dim)"};font-weight:700">${m.active ? "● متاح للأعضاء" : "○ مخفي"}</div>
        </div>
      </div>
      <audio controls preload="none" src="${muUrl2(m.path)}" style="width:100%;height:36px;margin-bottom:8px"></audio>
      <div style="display:flex;gap:8px">
        <button class="btn" style="flex:1;font-size:12px;padding:7px;${m.active ? "background:var(--sadu)" : "background:var(--palm)"}" onclick="muToggle(${m.id},${m.active})">${m.active ? "🙈 إخفاء" : "▶️ إتاحة"}</button>
        <button class="btn" style="flex:1;font-size:12px;padding:7px;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="muDelete(${m.id},'${m.path}')">🗑️ حذف</button>
      </div>
    </div>`).join("") : '<div class="empty" style="padding:20px">ما فيه مقاطع بعد</div>'}`;
}
var muUrl2;
var init_music = __esm({
  "js/admin/music.js"() {
    init_db();
    init_hub();
    init_state();
    init_ui();
    init_places();
    muUrl2 = need("muUrl");
  }
});

// js/admin/news.js
var news_exports = {};
__export(news_exports, {
  admBroadcast: () => admBroadcast,
  admNewsBlock: () => admNewsBlock2,
  admNewsSave: () => admNewsSave,
  admNewsToggle: () => admNewsToggle
});
function admNewsBlock2() {
  if (!isOwner()) return "";
  const b = state.banner;
  const on = !!b.news_on;
  return `<div style="background:var(--card);border:1.5px solid ${on ? "var(--qteal)" : "var(--line)"};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:4px">✨ بنر التحديثات <span style="font-size:11px;color:${on ? "var(--qteal)" : "var(--txt-dim)"}">${on ? "● ظاهر" : "○ مطفأ"}</span></div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:11px;line-height:1.85">
      يظهر بأعلى الرئيسية <b>مرة واحدة لكل عضو</b> — يضغط «فهمت» فيختفي نهائياً.
    </div>
    <input id="nwTitle" placeholder="العنوان — مثال: وصلت ميزات جديدة 🎉" value="${esc(b.news_title || "")}"
      style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
    <textarea id="nwBody" rows="4" placeholder="التفاصيل — اكتب ما الجديد بالمنصة..."
      style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;line-height:1.9;outline:none;resize:vertical;margin-bottom:10px">${esc(b.news_body || "")}</textarea>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" style="flex:1;min-width:110px;background:var(--card2);border:1px solid var(--line);color:var(--txt);font-size:12.5px;padding:10px" onclick="admNewsSave()">💾 احفظ</button>
      <button class="btn" style="flex:1;min-width:110px;${on ? "background:var(--sadu)" : "background:var(--qteal)"};font-size:12.5px;padding:10px" onclick="admNewsToggle()">${on ? "🙈 أخفِ البنر" : "✨ اعرض البنر"}</button>
    </div>
    <button class="btn" style="width:100%;margin-top:8px;background:var(--qblue);font-size:12.5px;padding:11px" onclick="admBroadcast()">🔔 أرسل إشعاراً للجميع</button>
    <div style="font-size:10.5px;color:var(--txt-dim);margin-top:8px;line-height:1.75">
      💡 الحفظ يعطي البنر رقماً جديداً — فيظهر حتى لمن أخفاه سابقاً.
    </div>
  </div>`;
}
async function admNewsSave() {
  if (!needOwner2("تحرير البنر")) return;
  const t = ($("nwTitle").value || "").trim();
  const bd = ($("nwBody").value || "").trim();
  if (!t) {
    toast("اكتب عنواناً", true);
    return;
  }
  const nid = "n" + Date.now();
  const { error } = await sb.from("site_banner").update({
    news_title: t.slice(0, 120),
    news_body: bd.slice(0, 600),
    news_id: nid
  }).eq("id", 1);
  if (error) {
    toast("تعذر الحفظ: " + error.message, true);
    return;
  }
  if (state.banner) {
    state.banner.news_title = t;
    state.banner.news_body = bd;
    state.banner.news_id = nid;
  }
  if (state.banner) {
    state.banner.news_title = t;
    state.banner.news_body = bd;
    state.banner.news_id = nid;
  }
  toast("انحفظ — راح يظهر للجميع من جديد ✨");
  loadAdmWeek4();
}
async function admNewsToggle() {
  if (!needOwner2("عرض البنر")) return;
  const b = state.banner;
  const nv = !b.news_on;
  if (nv && !(b.news_title || "").trim()) {
    toast("اكتب العنوان واحفظ أول", true);
    return;
  }
  const { error } = await sb.from("site_banner").update({ news_on: nv }).eq("id", 1);
  if (error) {
    toast("تعذرت العملية: " + error.message, true);
    return;
  }
  if (state.banner) state.banner.news_on = nv;
  if (state.banner) state.banner.news_on = nv;
  toast(nv ? "✨ البنر ظاهر للجميع" : "انخفى البنر");
  loadAdmWeek4();
}
async function admBroadcast() {
  if (!needOwner2("الإشعار الجماعي")) return;
  const b = state.banner;
  const t = ($("nwTitle").value || b.news_title || "").trim();
  const bd = ($("nwBody").value || b.news_body || "").trim();
  if (!t) {
    toast("اكتب العنوان أول", true);
    return;
  }
  if (!confirm("إرسال إشعار لكل من فعّل الإشعارات؟\n\n«" + t + "»\n\nما ينرسل إلا مرة — تأكد من النص.")) return;
  const btn = event && event.target;
  if (btn) {
    btn.disabled = true;
    btn.textContent = "⏳ نرسل...";
  }
  try {
    const r = await sb.from("push_subs").select("user_id");
    const ids = [...new Set((r.data || []).map((x) => x.user_id))];
    if (!ids.length) {
      toast("ما فيه أحد فعّل الإشعارات بعد", true);
      return;
    }
    if (typeof pushNotify26 === "function") {
      for (let i = 0; i < ids.length; i += 50) {
        await pushNotify26({
          title: t.slice(0, 60),
          body: (bd || "افتح التطبيق وشوف الجديد").slice(0, 120),
          url: "/",
          user_ids: ids.slice(i, i + 50)
        });
      }
    }
    toast("🔔 انرسل لـ" + ids.length + " عضواً");
  } catch (e) {
    toast("تعذر الإرسال: " + (e && e.message || ""), true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "🔔 أرسل إشعاراً للجميع";
    }
  }
}
var initVideoUpload7, listBucketAll3, loadAdmWeek4, loadPhotos23, loadSponsor7, needOwner2, pushNotify26, go28;
var init_news = __esm({
  "js/admin/news.js"() {
    init_db();
    init_hub();
    init_media();
    init_state();
    init_ui();
    init_places();
    initVideoUpload7 = need("initVideoUpload");
    listBucketAll3 = need("listBucketAll");
    loadAdmWeek4 = need("loadAdmWeek");
    loadPhotos23 = need("loadPhotos");
    loadSponsor7 = need("loadSponsor");
    needOwner2 = need("needOwner");
    pushNotify26 = need("pushNotify");
    go28 = need("go");
  }
});

// js/admin/places.js
var places_exports = {};
__export(places_exports, {
  admAddPlace: () => admAddPlace,
  admDelPlace: () => admDelPlace,
  plcFillCities: () => plcFillCities,
  renderPlaces: () => renderPlaces2
});
function plcFillCities() {
  const r = $("plcRegion").value, c = $("plcCity");
  c.innerHTML = '<option value="">المدينة (اختياري)</option>';
  if (r && geo.GEO[r]) geo.GEO[r].forEach((x) => c.innerHTML += `<option>${x}</option>`);
}
function renderPlaces2() {
  const reg = $("plcRegion"), sel = reg.value;
  reg.innerHTML = '<option value="">اختر المنطقة</option>';
  for (const r in BASE_GEO) reg.innerHTML += `<option>${r}</option>`;
  if (sel) reg.value = sel;
  plcFillCities();
  $("plcList").innerHTML = geo.custom.length ? geo.custom.map((c) => `
      <div style="display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 13px;margin-bottom:8px">
        <div style="flex:1">
          <b style="font-size:14px">${esc(c.name)}</b>
          <div style="font-size:11px;color:var(--txt-dim)">${KIND_AR[c.kind]}${c.city ? " · " + esc(c.city) : ""} · ${esc(c.region)}</div>
        </div>
        <button class="btn" style="font-size:12px;padding:7px 12px" onclick="admDelPlace(${c.id},'${esc(c.name).replace(/'/g, "\\'")}')">🗑️ حذف</button>
      </div>`).join("") : `<div class="empty">ما فيه أماكن مضافة بعد — كل اللي تضيفه هنا يظهر فوراً بقوائم التطبيق</div>`;
}
async function admAddPlace() {
  const region = $("plcRegion").value, city = $("plcCity").value, name = $("plcName").value.trim(), kind = $("plcKind").value;
  if (!region) return toast("اختر المنطقة", true);
  if (name.length < 2) return toast("اكتب اسم المكان", true);
  const { error } = await sb.from("custom_places").insert({ region, city, name, kind });
  if (error) {
    toast(error.code === "23505" ? "المكان مضاف من قبل" : "تعذرت الإضافة: " + error.message, true);
    return;
  }
  $("plcName").value = "";
  toast("انضاف المكان ✅");
  await loadPlaces();
  renderPlaces2();
}
async function admDelPlace(id, name) {
  if (!needEditor3("إدارة الأماكن")) return;
  if (!confirm(`حذف «${name}» من القوائم؟ (الصور المنشورة عليه ما تتأثر)`)) return;
  const { error } = await sb.from("custom_places").delete().eq("id", id);
  if (error) {
    dbErr("حذف المكان", error);
    return;
  }
  toast("انحذف المكان");
  await loadPlaces();
  renderPlaces2();
}
var needEditor3;
var init_places2 = __esm({
  "js/admin/places.js"() {
    init_db();
    init_hub();
    init_ui();
    init_places();
    needEditor3 = need("needEditor");
  }
});

// js/admin/quests.js
var quests_exports2 = {};
__export(quests_exports2, {
  ADMQ: () => ADMQ,
  QICONS: () => QICONS,
  admAddToQuest: () => admAddToQuest,
  loadAdmQuests: () => loadAdmQuests2,
  qCreate: () => qCreate,
  qDelStop: () => qDelStop,
  qDelete: () => qDelete,
  qToggle: () => qToggle,
  renderQIcons: () => renderQIcons
});
async function loadAdmQuests2() {
  const el = $("admQs");
  if (!el) return;
  el.innerHTML = '<div class="loader">⏳</div>';
  const q = await sb.from("quests").select("*").order("created_at", { ascending: false });
  ADMQ = q.data || [];
  const s = await sb.from("quest_stops").select("*");
  state.admQs = {};
  (s.data || []).forEach((x) => {
    (state.admQs[x.quest_id] = state.admQs[x.quest_id] || []).push(x);
  });
  const c = await sb.from("quest_completions").select("quest_id");
  const done = {};
  (c.data || []).forEach((x) => {
    done[x.quest_id] = (done[x.quest_id] || 0) + 1;
  });
  el.innerHTML = `
  <div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:14px">
    <div style="font-weight:700;font-size:14px;margin-bottom:10px">🗝️ رحلة جديدة</div>
    <input id="qTitle" placeholder="اسم الرحلة (مثال: صيف عسير)" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
    <input id="qSub" placeholder="وصف قصير" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
    <input id="qBadge" placeholder="اسم الشارة (مكتشف عسير)" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px;box-sizing:border-box">
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:6px">أيقونة الشارة</div>
    <div class="q-icons" id="qIcons"></div>
    <input type="hidden" id="qIcon" value="🏆">
    <input id="qRegion" placeholder="المنطقة" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <input id="qSponsor" placeholder="الراعي (اختياري)" style="flex:1;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none">
      <input id="qPrize" placeholder="الجائزة" style="flex:1;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none">
    </div>
    <input id="qEnds" type="date" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px;direction:ltr;text-align:left">
    <button class="btn" style="width:100%" onclick="qCreate()">➕ إنشاء الرحلة</button>
  </div>
  ${ADMQ.length ? ADMQ.map((q2) => {
    const stops = state.admQs[q2.id] || [];
    return `<div style="background:var(--card);border:1.5px solid ${q2.active ? "var(--palm)" : "var(--line)"};border-radius:14px;padding:14px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-weight:700;font-size:15px">${q2.badge_icon || "🏆"} ${esc(q2.title)}</div>
        <span style="font-size:11px;font-weight:700;color:${q2.active ? "var(--palm)" : "var(--txt-dim)"}">${q2.active ? "● نشطة" : "○ مسودة"}</span>
      </div>
      <div style="font-size:12px;color:var(--txt-dim);margin-bottom:8px">${stops.length} كنز · ${done[q2.id] || 0} أكملوها${q2.region ? " · " + esc(q2.region) : ""}</div>
      <div style="margin:8px 0">${stops.map((s2) => {
      const ph = state.photos.find((p) => p.id === s2.photo_id);
      return `<div style="display:flex;align-items:center;gap:8px;background:var(--card2);border-radius:10px;padding:7px 10px;margin-bottom:5px;font-size:12px">
          <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ph ? esc(ph.title) : "#" + s2.photo_id}</span>
          <button onclick="qDelStop(${s2.id})" style="background:none;border:none;cursor:pointer;font-size:13px">🗑️</button>
        </div>`;
    }).join("") || '<div style="font-size:12px;color:var(--txt-dim)">أضف كنوزاً من تبويب 🗂️ الصور</div>'}</div>
      <div style="display:flex;gap:8px">
        <button class="btn" style="flex:1;font-size:12px;padding:8px;${q2.active ? "background:var(--sadu)" : "background:var(--palm)"}" onclick="qToggle(${q2.id},${q2.active})">${q2.active ? "🙈 إيقاف" : "▶️ تفعيل"}</button>
        <button class="btn" style="flex:1;font-size:12px;padding:8px;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="qDelete(${q2.id})">🗑️ حذف</button>
      </div>
    </div>`;
  }).join("") : '<div class="empty" style="padding:20px">ما فيه رحلات بعد</div>'}`;
  renderQIcons();
}
function renderQIcons() {
  const el = $("qIcons");
  if (!el) return;
  const cur = $("qIcon") ? $("qIcon").value : "🏆";
  el.innerHTML = "";
  QICONS.forEach((ic) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "q-icon" + (ic === cur ? " on" : "");
    b.textContent = ic;
    b.onclick = () => {
      if ($("qIcon")) $("qIcon").value = ic;
      renderQIcons();
    };
    el.appendChild(b);
  });
}
async function qCreate() {
  if (!needEditor4("الكنوز")) return;
  const title = $("qTitle").value.trim();
  if (!title) {
    toast("اكتب اسم الرحلة", true);
    return;
  }
  const { error } = await sb.from("quests").insert({
    title,
    subtitle: $("qSub").value.trim(),
    badge_icon: $("qIcon").value.trim() || "🏆",
    badge_name: $("qBadge").value.trim(),
    region: $("qRegion").value.trim(),
    sponsor: $("qSponsor").value.trim(),
    prize: $("qPrize").value.trim(),
    ends_at: $("qEnds").value || null
  });
  if (error) {
    toast("فشل: " + error.message, true);
    return;
  }
  toast("انشئت الرحلة 🗝️");
  loadAdmQuests2();
}
async function qToggle(id, cur) {
  const { error } = await sb.from("quests").update({ active: !cur }).eq("id", id);
  if (error) {
    dbErr("تفعيل الرحلة", error);
    return;
  }
  toast(!cur ? "الرحلة نشطة 🗝️" : "اتوقفت الرحلة");
  loadAdmQuests2();
}
async function qDelete(id) {
  if (!confirm("حذف الرحلة وكنوزها؟")) return;
  await sb.from("quests").delete().eq("id", id);
  toast("انحذفت");
  loadAdmQuests2();
}
async function qDelStop(sid) {
  await sb.from("quest_stops").delete().eq("id", sid);
  loadAdmQuests2();
}
async function admAddToQuest(pid) {
  if (!ADMQ.length) {
    await loadAdmQuests2();
  }
  if (!ADMQ.length) {
    toast("أنشئ رحلة أولاً من تبويب 🗝️", true);
    return;
  }
  const list = ADMQ.map((q, i) => `${i + 1} = ${q.title} (${(state.admQs[q.id] || []).length} كنز)`).join("\n");
  const pick = prompt("أضف الصورة لأي رحلة؟\n\n" + list);
  if (pick === null) return;
  const idx = parseInt(pick.trim()) - 1;
  if (isNaN(idx) || !ADMQ[idx]) {
    toast("رقم غير صحيح", true);
    return;
  }
  const { error } = await sb.from("quest_stops").insert({ quest_id: ADMQ[idx].id, photo_id: pid });
  if (error) {
    toast(error.code === "23505" ? "موجودة بالرحلة" : "فشلت الإضافة", true);
    return;
  }
  toast("انضافت لـ" + ADMQ[idx].title + " 🗝️");
  loadAdmQuests2();
}
var needEditor4, ADMQ, QICONS;
var init_quests = __esm({
  "js/admin/quests.js"() {
    init_db();
    init_hub();
    init_state();
    init_ui();
    init_places();
    needEditor4 = need("needEditor");
    ADMQ = [];
    state.admQs = {};
    QICONS = ["🏆", "🏔️", "🕌", "🌅", "🐪", "🌴", "🏜️", "🌊", "⛰️", "🗝️", "🎖️", "🌙", "⭐", "🦅", "🏛️", "🌾"];
  }
});

// js/admin/reports.js
var reports_exports = {};
__export(reports_exports, {
  FB_AR: () => FB_AR2,
  KIND_AR: () => KIND_AR2,
  _dmUid: () => _dmUid,
  admBan: () => admBan,
  admClearBadges: () => admClearBadges,
  admDel: () => admDel,
  admDmBan: () => admDmBan,
  admHide: () => admHide,
  fbClearDone: () => fbClearDone,
  fbDel: () => fbDel,
  fbDone: () => fbDone,
  fbReply: () => fbReply,
  loadFb: () => loadFb2,
  notifyDmBan: () => notifyDmBan3
});
async function loadFb2() {
  $("admFb").innerHTML = '<div class="empty">⏳</div>';
  const { data, error } = await sb.from("feedback").select("*, profiles!user_id(display_name)").order("created_at", { ascending: false });
  state.dmBanMap = {};
  try {
    const uids = [...new Set((data || []).map((f) => _dmUid(f.admin_note)).filter(Boolean))];
    if (uids.length) {
      const pr = await sb.from("profiles").select("id,dm_banned").in("id", uids);
      (pr.data || []).forEach((u) => {
        state.dmBanMap[u.id] = !!u.dm_banned;
      });
    }
  } catch (e) {
  }
  if (error) {
    $("admFb").innerHTML = `<div class="empty">⚠️ ${error.message}</div>`;
    return;
  }
  if (!data.length) {
    $("admFb").innerHTML = '<div class="empty">📭 ما فيه رسائل بعد</div>';
    return;
  }
  const newN = data.filter((f) => f.status === "new").length;
  const doneN = data.length - newN;
  $("admFb").innerHTML = `<div class="fb-bar">
      <span>📨 ${data.length} رسالة${newN ? " · <b>" + newN + " جديدة</b>" : ""}</span>
      ${doneN && isOwner() ? `<button onclick="fbClearDone(${doneN})">🗑️ امسح المنتهية (${doneN})</button>` : ""}
    </div>` + data.map((f) => `
    <div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:13px;margin-bottom:10px;${f.status === "done" ? "opacity:.55" : ""}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-size:12px;font-weight:700;padding:3px 10px;border-radius:10px;background:var(--card2);border:1px solid var(--line)">${FB_AR2[f.kind] || f.kind}</span>
        <span style="font-size:11px;color:var(--txt-dim)">${esc(f.profiles?.display_name || "زائر")} · ${new Date(f.created_at).toLocaleDateString("ar-SA")}</span>
      </div>
      <div style="font-size:14px;line-height:1.8;margin-bottom:${f.admin_note ? "8px" : "10px"}">${esc(f.body)}</div>
      ${f.admin_note ? `<div style="background:var(--card2);border:1px solid var(--star);border-radius:11px;padding:10px 12px;margin-bottom:10px;font-size:12.5px;line-height:1.9;white-space:pre-wrap;color:var(--txt-dim)"><b style="color:var(--star);display:block;margin-bottom:5px">🔒 تفاصيل للإدارة</b>${esc(f.admin_note)}${_dmUid(f.admin_note) ? state.dmBanMap && state.dmBanMap[_dmUid(f.admin_note)] ? `<button class="fb-ban ok" onclick="admDmBan('${_dmUid(f.admin_note)}',false)">✅ ارفع منع المراسلة</button>` : `<button class="fb-ban" onclick="admDmBan('${_dmUid(f.admin_note)}',true)">🚫 امنعه من المراسلة</button>` : ""}</div>` : ""}
      <div style="display:flex;gap:8px">
        ${f.status === "new" ? `<button class="btn" style="font-size:12px;padding:7px 14px;background:var(--qblue)" onclick="fbReply(${f.id})">💬 رد</button>
           <button class="btn" style="font-size:12px;padding:7px 14px;background:var(--palm)" onclick="fbDone(${f.id})">✓ تم التعامل</button>` : `<span style="font-size:12px;color:var(--palm);font-weight:700;padding:7px 0">✓ منتهية</span>`}
        <button class="btn" style="font-size:12px;padding:7px 14px;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="fbDel(${f.id})">🗑️ حذف</button>
      </div>
    </div>`).join("");
}
async function fbReply(id) {
  const t = prompt("اكتب رد الإدارة على الرسالة:");
  if (t === null || !t.trim()) return;
  const { error } = await sb.from("feedback").update({ reply: t.trim(), status: "done" }).eq("id", id);
  if (error) {
    toast("فشل الرد: " + error.message, true);
    return;
  }
  try {
    const fb = (await sb.from("feedback").select("user_id").eq("id", id).maybeSingle()).data;
    if (fb && fb.user_id) {
      pushNotify27({
        title: "💬 رد من الإدارة",
        body: t.trim().slice(0, 90),
        url: "/",
        user_ids: [fb.user_id]
      });
    }
  } catch (e) {
  }
  toast("انرسل الرد 💬");
  loadFb2();
}
async function fbDone(id) {
  const { error } = await sb.from("feedback").update({ status: "done" }).eq("id", id);
  if (error) {
    dbErr("تعليم الرسالة", error);
    return;
  }
  loadFb2();
}
async function fbDel(id) {
  if (!confirm("حذف الرسالة نهائياً؟")) return;
  const { error } = await sb.from("feedback").delete().eq("id", id);
  if (error) {
    dbErr("حذف الرسالة", error);
    return;
  }
  loadFb2();
}
async function fbClearDone(n) {
  if (!needOwner3("المسح الجماعي")) return;
  if (!confirm("مسح " + n + " رسالة منتهية؟\n\nالرسائل الجديدة تبقى — والمسح نهائي.")) return;
  if (!confirm("تأكيد أخير: هذا الإجراء لا يمكن التراجع عنه.")) return;
  const q = await sb.from("feedback").select("id").eq("status", "done");
  if (q.error) {
    toast("تعذر القراءة: " + q.error.message, true);
    return;
  }
  const ids = (q.data || []).map((x) => x.id);
  if (!ids.length) {
    toast("ما فيه رسائل منتهية", true);
    return;
  }
  const { data, error } = await sb.from("feedback").delete().in("id", ids).select("id");
  if (error) {
    toast("تعذر المسح: " + (error.message || error.code || ""), true);
    return;
  }
  const n2 = (data || []).length;
  if (!n2) {
    toast("ما انمسح شيء — تحقق من صلاحيات الحذف", true);
    return;
  }
  toast("انمسحت " + n2 + " رسالة ✅");
  loadFb2();
}
async function admHide(id, hide) {
  const { error } = await sb.from("photos").update({ hidden: hide }).eq("id", id);
  if (error) {
    toast("فشلت العملية: " + (error.message || error.code || ""), true);
    return;
  }
  toast(hide ? "أُخفيت الصورة" : "أُظهرت الصورة");
  await openAdmin3();
  await loadPhotos24();
}
async function admDel(id, path) {
  if (!needOwner3("حذف الصور نهائياً")) return;
  if (!confirm("حذف نهائي؟ لا يمكن التراجع.")) return;
  const it = (state.admPhotos || []).find((x) => x.id === id) || state.photos.find((x) => x.id === id);
  const isVid = it && it.media_type === "video";
  const { error } = await sb.from("photos").delete().eq("id", id);
  if (error) {
    dbErr("حذف البلاغ", error);
    return;
  }
  try {
    if (isVid) await sb.storage.from("videos").remove([path]);
    else await sb.storage.from("photos").remove(allPaths(path));
  } catch (e) {
  }
  toast(isVid ? "حُذف الفيديو نهائياً" : "حُذفت الصورة نهائياً");
  await openAdmin3();
  await loadPhotos24();
}
async function admBan(uid, ban) {
  if (!needOwner3("حظر المستخدمين")) return;
  if (ban && !confirm("حظر المصور؟ لن يستطيع النشر أو التعليق.")) return;
  const { error } = await sb.from("profiles").update({ banned: ban }).eq("id", uid);
  if (error) {
    dbErr("الحظر", error);
    return;
  }
  toast(ban ? "تم حظر المصور ⛔" : "فُك الحظر");
  await openAdmin3();
}
async function admClearBadges(pid) {
  const pick = prompt(
    "مسح أوسمة الصورة #" + pid + " — اكتب الرقم:\n\n0 = الكل (تصفير شامل)\n1 = 📱 تصلح خلفية شاشة\n2 = ❤️ بحطها خلفية جوالي\n3 = 🌍 مسابقات عالمية\n4 = 🇸🇦 واجهة تشرّف السعودية\n5 = 🖼️ تستاهل تنطبع لوحة",
    "0"
  );
  if (pick === null) return;
  const keys = { 1: "wall", 2: "mine", 3: "global", 4: "face", 5: "print" };
  let q = sb.from("badge_votes").delete().eq("photo_id", pid);
  const k = keys[pick.trim()];
  if (pick.trim() !== "0" && !k) {
    toast("اكتب رقماً من 0 إلى 5", true);
    return;
  }
  if (k) q = q.eq("badge_key", k);
  const { error } = await q;
  if (error) {
    toast("فشل المسح: " + error.message, true);
    return;
  }
  toast(k ? "انمسح الوسام المحدد 🗳️" : "انصفرت كل أوسمة الصورة 🗳️");
  await loadPhotos24();
  openAdmin3();
}
function _dmUid(note) {
  const m = String(note || "").match(/المعرّف:\s*([0-9a-f-]{36})/i);
  return m ? m[1] : "";
}
async function admDmBan(uid, ban) {
  if (!needEditor5("منع المراسلة")) return;
  if (typeof ban === "undefined") ban = true;
  let reason = "";
  if (ban) {
    reason = prompt("سبب المنع (يصل العضو):", "إساءة استخدام الرسائل الخاصة");
    if (reason === null) return;
    reason = (reason || "").trim() || "إساءة استخدام الرسائل الخاصة";
  } else {
    if (!confirm("رفع المنع عن هذا العضو؟")) return;
  }
  const { error } = await sb.from("profiles").update({ dm_banned: ban }).eq("id", uid);
  if (error) {
    toast("تعذرت العملية: " + error.message, true);
    return;
  }
  if (state.dmBanMap) state.dmBanMap[uid] = ban;
  await notifyDmBan3(uid, ban, reason);
  toast(ban ? "🚫 انمنع — وانبلّغ بالسبب" : "✅ انرفع المنع — وانبلّغ");
  loadFb2();
}
async function notifyDmBan3(uid, ban, reason) {
  try {
    const body = ban ? "🚫 تم إيقاف إرسالك للرسائل الخاصة\n\nالسبب: " + reason + "\n\nحسابك يعمل طبيعياً — تنشر وتعلّق وتقيّم كالعادة، لكن إرسال الرسائل الخاصة موقوف.\n\nلو ترى أن القرار غير صحيح، اضغط «↩️ رد على الإدارة» تحت هذي الرسالة وراح نراجعه." : "✅ تم رفع إيقاف الرسائل عن حسابك\n\nتقدر ترسل رسائل خاصة من جديد — نرجو الالتزام بآداب التواصل.";
    await sb.from("feedback").insert({
      user_id: uid,
      kind: "other",
      body,
      reply: "",
      status: "done"
    });
    if (typeof pushNotify27 === "function") {
      pushNotify27({
        title: ban ? "🚫 إيقاف الرسائل الخاصة" : "✅ رُفع إيقاف الرسائل",
        body: ban ? "السبب: " + reason : "تقدر ترسل رسائل من جديد",
        url: "/",
        user_ids: [uid]
      });
    }
  } catch (e) {
  }
}
var checkRate12, loadPhotos24, logRate12, needEditor5, needOwner3, openAdmin3, pushNotify27, KIND_AR2, FB_AR2;
var init_reports = __esm({
  "js/admin/reports.js"() {
    init_db();
    init_format();
    init_hub();
    init_media();
    init_state();
    init_ui();
    init_places();
    checkRate12 = need("checkRate");
    loadPhotos24 = need("loadPhotos");
    logRate12 = need("logRate");
    needEditor5 = need("needEditor");
    needOwner3 = need("needOwner");
    openAdmin3 = need("openAdmin");
    pushNotify27 = need("pushNotify");
    KIND_AR2 = { city: "مدينة", village: "قرية", landmark: "معلم" };
    FB_AR2 = { suggestion: "💡 اقتراح", complaint: "⚠️ شكوى", question: "❓ استفسار", other: "📝 أخرى" };
  }
});

// js/admin/settings.js
var settings_exports = {};
__export(settings_exports, {
  admCommBlock: () => admCommBlock2,
  admCommToggle: () => admCommToggle,
  admGoogleLoginBlock: () => admGoogleLoginBlock2,
  admGoogleToggle: () => admGoogleToggle,
  admInspectBlock: () => admInspectBlock2,
  admInspectToggle: () => admInspectToggle,
  admMaintBlock: () => admMaintBlock2,
  admMaintSaveMsg: () => admMaintSaveMsg,
  admMaintToggle: () => admMaintToggle,
  admReelsBlock: () => admReelsBlock2,
  admSetReels: () => admSetReels
});
function admGoogleLoginBlock2() {
  const b = state.banner;
  const on = !!b.google_login;
  return `<div style="background:var(--card);border:1.5px solid ${on ? "var(--qblue)" : "var(--line)"};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">🔵 تسجيل الدخول بـ Google <span style="font-size:11px;font-weight:700;color:${on ? "var(--qblue)" : "var(--txt-dim)"}">${on ? "● مفعّل للجميع" : "○ مطفأ"}</span></div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px">يظهر زر Google لكل الزوار في صفحة الحساب.</div>
    <button class="btn" style="width:100%;${on ? "background:var(--sadu)" : "background:var(--qblue)"}" onclick="admGoogleToggle()">${on ? "🙈 إخفاء الزر" : "👁️ إظهار زر Google"}</button>
  </div>`;
}
async function admGoogleToggle() {
  if (!needOwner4("مفاتيح الدخول")) return;
  const b = state.banner;
  const { error } = await sb.from("site_banner").update({ google_login: !b.google_login }).eq("id", 1);
  if (error) {
    toast("فشلت العملية: " + error.message, true);
    return;
  }
  toast(!b.google_login ? "زر Google ظاهر للجميع 🔵" : "اختفى الزر");
  await loadSponsor8();
  await loadAdmWeek5();
}
function admMaintBlock2() {
  const b = state.banner;
  const on = !!b.maintenance;
  return `
  <div style="background:var(--card);border:1.5px solid ${on ? "var(--star)" : "var(--line)"};border-radius:14px;padding:14px;margin-top:16px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">🚧 وضع الصيانة (تحت الإنشاء) ${on ? '<span style="font-size:11px;color:#A87500;font-weight:700">● مفعل — الزوار محجوبون</span>' : '<span style="font-size:11px;color:var(--txt-dim)">○ مطفأ</span>'}</div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px;line-height:1.8">عند التفعيل: الزوار يشوفون صفحة «تحت التطوير» — وأنت كمشرف تتصفح وتشتغل عادي.</div>
    <input id="mtMsg" placeholder="رسالة اختيارية للزوار (مثال: نرجع لكم الساعة 9)" value="${esc(b.maintenance_msg || "")}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:10px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="admMaintSaveMsg()">💾 حفظ الرسالة</button>
      <button class="btn" style="flex:1;${on ? "background:var(--palm)" : "background:var(--star);color:var(--ink)"}" onclick="admMaintToggle()">${on ? "▶️ إعادة فتح الموقع" : "🚧 تفعيل الصيانة"}</button>
    </div>
  </div>`;
}
async function admMaintToggle() {
  if (!needOwner4("ستارة الصيانة")) return;
  const b = state.banner;
  const to = !b.maintenance;
  if (to && !confirm("تفعيل وضع الصيانة؟ كل الزوار (عدا المشرفين) بيشوفون صفحة تحت التطوير.")) return;
  const { error } = await sb.from("site_banner").update({ maintenance: to, maintenance_msg: $("mtMsg").value.trim() }).eq("id", 1);
  if (error) {
    toast("فشلت العملية: " + error.message, true);
    return;
  }
  toast(to ? "الموقع دخل وضع الصيانة 🚧" : "الموقع رجع مفتوحاً للجميع 🎉");
  await loadAdmWeek5();
}
async function admMaintSaveMsg() {
  const { error } = await sb.from("site_banner").update({ maintenance_msg: $("mtMsg").value.trim() }).eq("id", 1);
  if (error) {
    dbErr("حفظ الرسالة", error);
    return;
  }
  toast("انحفظت الرسالة ✅");
}
function admReelsBlock2() {
  if (!isOwner()) return "";
  const st = reelsState();
  const cfg = {
    off: { c: "var(--line)", t: "○ مطفأة", d: "التبويب مخفي · لا رفع للمقاطع" },
    soon: { c: "var(--star)", t: "◐ قريباً", d: "شاشة تشويق · لا رفع للمقاطع" },
    open: { c: "var(--palm)", t: "● مفتوحة", d: "تعمل كاملة · الرفع متاح" }
  }[st];
  return `<div style="background:var(--card);border:1.5px solid ${cfg.c};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:3px">🎬 أضواء الديرة <span style="font-size:11px;color:${cfg.c}">${cfg.t}</span></div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:12px;line-height:1.85">${cfg.d}</div>
    <div class="rs-states">
      <button class="rs-st ${st === "off" ? "on" : ""}" onclick="admSetReels('off')">
        <b>○ مطفأة</b><span>التبويب مخفي تماماً</span>
      </button>
      <button class="rs-st ${st === "soon" ? "on soon" : ""}" onclick="admSetReels('soon')">
        <b>◐ قريباً</b><span>شاشة تشويق تبني التوقع</span>
      </button>
      <button class="rs-st ${st === "open" ? "on open" : ""}" onclick="admSetReels('open')">
        <b>● مفتوحة</b><span>الرفع والعرض يعملان</span>
      </button>
    </div>
    <div style="font-size:10.5px;color:var(--txt-dim);margin-top:9px;line-height:1.75">
      ⚠️ المقطع الواحد يعادل ١٦ صورة نقلاً — راقب الحصة إن فتحتها.
    </div>
  </div>`;
}
async function admSetReels(reelsMode) {
  if (!needOwner4("أضواء الديرة")) return;
  const vals = {
    off: { video_enabled: false, reels_soon: false },
    soon: { video_enabled: false, reels_soon: true },
    open: { video_enabled: true, reels_soon: false }
  }[reelsMode];
  if (!vals) return;
  const { error } = await sb.from("site_banner").update(vals).eq("id", 1);
  if (error) {
    toast("تعذرت العملية: " + error.message, true);
    return;
  }
  state.banner = Object.assign(state.banner || {}, vals);
  const msg = { off: "انطفأت الأضواء", soon: "◐ وضع «قريباً» مفعّل", open: "🎬 الأضواء مفتوحة للجميع" }[reelsMode];
  toast(msg);
  try {
    if (typeof initVideoUpload8 === "function") initVideoUpload8();
  } catch (e) {
  }
  try {
    if (reelsMode === "off") {
      const cur = document.querySelector(".page.on");
      if (cur && cur.id === "page-reels") go29("feed");
    }
  } catch (e) {
  }
  loadAdmWeek5();
}
function admInspectBlock2() {
  const b = state.banner;
  const on = !!b.inspect_enabled;
  return `<div style="background:var(--card);border:1.5px solid ${on ? "var(--qteal)" : "var(--line)"};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">🤖 الفاحص الذكي <span style="font-size:11px;font-weight:700;color:${on ? "var(--qteal)" : "var(--txt-dim)"}">${on ? "● مفعّل" : "○ مطفأ"}</span></div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px;line-height:1.8">يفحص كل صورة قبل النشر: يمنع المخالف، وينبّه على الوجوه ولوحات المركبات، ويقترح التصنيف. التكلفة ~$0.1 لكل 1000 صورة.</div>
    <button class="btn" style="width:100%;${on ? "background:var(--sadu)" : "background:var(--qteal)"}" onclick="admInspectToggle()">${on ? "🙈 إيقاف الفاحص" : "▶️ تفعيل الفاحص"}</button>
  </div>`;
}
async function admInspectToggle() {
  if (!needOwner4("الفاحص الذكي")) return;
  const b = state.banner;
  const { error } = await sb.from("site_banner").update({ inspect_enabled: !b.inspect_enabled }).eq("id", 1);
  if (error) {
    toast("فشلت العملية: " + error.message, true);
    return;
  }
  toast(!b.inspect_enabled ? "الفاحص الذكي مفعّل 🤖" : "اتوقف الفاحص");
  await loadSponsor8();
  await loadAdmWeek5();
}
function admCommBlock2() {
  const b = state.banner;
  const on = !!b.commercial_enabled;
  return `<div style="background:var(--card);border:1.5px solid ${on ? "var(--palm)" : "var(--line)"};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">💼 الاستخدام التجاري <span style="font-size:11px;font-weight:700;color:${on ? "var(--palm)" : "var(--txt-dim)"}">${on ? "● مفعّل" : "○ مطفأ"}</span></div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px;line-height:1.8">يظهر للمصور خيار الموافقة على عرض صورته للجهات. فعّله حين تجهز لاستقبال الطلبات.</div>
    <button class="btn" style="width:100%;${on ? "background:var(--sadu)" : "background:var(--palm)"}" onclick="admCommToggle()">${on ? "🙈 إخفاء الخيار" : "▶️ تفعيل الخيار"}</button>
  </div>`;
}
async function admCommToggle() {
  if (!needOwner4("الاستخدام التجاري")) return;
  const b = state.banner;
  const { error } = await sb.from("site_banner").update({ commercial_enabled: !b.commercial_enabled }).eq("id", 1);
  if (error) {
    toast("فشلت العملية: " + error.message, true);
    return;
  }
  toast(!b.commercial_enabled ? "ظهر خيار الاستخدام التجاري 💼" : "اختفى الخيار");
  await loadSponsor8();
  await loadAdmWeek5();
}
var initVideoUpload8, listBucketAll4, loadAdmWeek5, loadPhotos25, loadSponsor8, needOwner4, pushNotify28, go29;
var init_settings = __esm({
  "js/admin/settings.js"() {
    init_db();
    init_hub();
    init_media();
    init_state();
    init_ui();
    init_places();
    initVideoUpload8 = need("initVideoUpload");
    listBucketAll4 = need("listBucketAll");
    loadAdmWeek5 = need("loadAdmWeek");
    loadPhotos25 = need("loadPhotos");
    loadSponsor8 = need("loadSponsor");
    needOwner4 = need("needOwner");
    pushNotify28 = need("pushNotify");
    go29 = need("go");
  }
});

// js/admin/stats.js
var stats_exports2 = {};
__export(stats_exports2, {
  loadStats: () => loadStats2
});
async function loadStats2() {
  if (!isOwner()) {
    const e = $("admSt");
    if (e) e.innerHTML = '<div class="empty" style="padding:26px"><span class="big">🔒</span>الإحصائيات للمالك فقط</div>';
    return;
  }
  $("admSt").innerHTML = '<div class="empty">⏳</div>';
  const [st, us] = await Promise.all([sb.rpc("admin_stats"), sb.rpc("admin_users")]);
  if (st.error || !st.data) {
    $("admSt").innerHTML = `<div class="empty">⚠️ تعذر تحميل الإحصائيات<br><span style="font-size:11px">${esc(st.error?.message || "لا توجد بيانات")}</span></div>`;
    return;
  }
  const s = st.data;
  const card = (n, l, ic) => `<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:14px 8px;text-align:center">
    <div style="font-size:22px">${ic}</div>
    <div style="font-size:24px;font-weight:700;color:var(--sand)">${n}</div>
    <div style="font-size:11px;color:var(--txt-dim)">${l}</div></div>`;
  let html = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px">
    ${card(s.users, "مسجلين", "👤")}${card(s.guests, "زوار", "👀")}${card(s.photos, "صورة", "📸")}
    ${card(s.ratings, "تقييم", "⭐")}${card(s.comments, "تعليق", "💬")}${card(s.badges, "صوت وسام", "🗳️")}
    ${card(s.fb_new, "رسالة جديدة", "📨")}${card(s.hidden, "مخفية", "🙈")}${card(s.places, "مكان مضاف", "📍")}
  </div>
  <div style="font-weight:700;font-size:15px;margin-bottom:10px">👥 المسجلون (${(us.data || []).length})</div>`;
  html += (us.data || []).length ? us.data.map((u) => `<div style="background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 13px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div style="min-width:0">
          <b style="font-size:14px">${esc(u.display_name)}</b>
          <div style="font-size:11.5px;color:var(--txt-dim);direction:ltr;text-align:right;overflow:hidden;text-overflow:ellipsis">${esc(u.email)}</div>
        </div>
        <div style="text-align:center;flex:0 0 auto">
          <div style="font-size:15px;font-weight:700;color:var(--sand)">${u.photos_count} 📸</div>
          <div style="font-size:10px;color:var(--txt-dim)">${new Date(u.created_at).toLocaleDateString("ar-SA")}</div>
        </div>
      </div>`).join("") : '<div class="empty">ما فيه مسجلين بعد</div>';
  $("admSt").innerHTML = html;
}
var init_stats = __esm({
  "js/admin/stats.js"() {
    init_db();
    init_state();
    init_ui();
    init_places();
  }
});

// js/admin/team.js
var team_exports = {};
__export(team_exports, {
  ADM_ROLES: () => ADM_ROLES,
  _cuRun: () => _cuRun,
  _cuT: () => _cuT,
  _tmRun: () => _tmRun,
  _tmT: () => _tmT,
  admAddCurator: () => admAddCurator,
  admAddMember: () => admAddMember,
  admCuratorsBlock: () => admCuratorsBlock2,
  admRemove: () => admRemove,
  admRemoveCurator: () => admRemoveCurator,
  admRole: () => admRole2,
  admSetRole: () => admSetRole,
  admTeamBlock: () => admTeamBlock2,
  cuClearPick: () => cuClearPick,
  cuPick: () => cuPick,
  cuSearchUsers: () => cuSearchUsers,
  needEditor: () => needEditor6,
  needOwner: () => needOwner5,
  tmClearPick: () => tmClearPick,
  tmPick: () => tmPick,
  tmSearchUsers: () => tmSearchUsers
});
function admRole2() {
  return state.admRole || "";
}
function needOwner5(what) {
  if (isOwner()) return true;
  toast("🔒 " + (what || "هذا الإجراء") + " للمالك فقط", true);
  return false;
}
function needEditor6(what) {
  if (isEditor()) return true;
  toast("🔒 " + (what || "هذا الإجراء") + " يحتاج صلاحية أعلى", true);
  return false;
}
async function admTeamBlock2() {
  if (!isOwner()) return "";
  let rows = "";
  try {
    const r = await sb.from("admins").select("id,role,name,added_at").order("added_at");
    const list = r.data || [];
    rows = list.map((x) => {
      const rl = ADM_ROLES[x.role] || ADM_ROLES.mod;
      const me = !!(currentUser() && x.id === currentUser()?.id);
      return `<div class="tm-row">
        <div class="tm-info">
          <div class="tm-name">${rl.ic} ${esc(x.name || "مشرف")}${me ? ' <span style="font-size:10px;color:var(--txt-dim)">(أنت)</span>' : ""}</div>
          <div class="tm-id">${x.id.slice(0, 8)}…</div>
        </div>
        <select class="tm-sel" ${me ? "disabled" : ""} onchange="admSetRole('${x.id}',this.value)">
          ${Object.keys(ADM_ROLES).map((k) => `<option value="${k}" ${x.role === k ? "selected" : ""}>${ADM_ROLES[k].ic} ${ADM_ROLES[k].n}</option>`).join("")}
        </select>
        ${me ? "" : `<button class="tm-del" onclick="admRemove('${x.id}')">✕</button>`}
      </div>`;
    }).join("");
  } catch (e) {
    rows = '<div style="font-size:12px;color:var(--txt-dim)">تعذر التحميل</div>';
  }
  return `<div style="background:var(--card);border:1.5px solid var(--sadu);border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:4px">👥 فريق الإشراف <span style="font-size:11px;color:var(--sadu)">● للمالك</span></div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:11px;line-height:1.85">
      👑 <b>مالك:</b> كل الصلاحيات · ✏️ <b>محرّر:</b> المسابقة والكنوز والأماكن · 🛡️ <b>مراجع:</b> البلاغات والإخفاء والرسائل
    </div>
    ${rows}
    <div class="tm-add-wrap">
      <div class="tm-lbl">➕ أضف مشرفاً</div>
      <input id="tmSearch" placeholder="ابحث عن العضو بالاسم..." oninput="tmSearchUsers()" autocomplete="off">
      <div id="tmResults" class="tm-results"></div>
      <div id="tmPicked" class="tm-picked" style="display:none"></div>
      <div class="tm-add">
        <select id="tmRole">
          <option value="mod">🛡️ مراجع</option>
          <option value="editor">✏️ محرّر</option>
          <option value="owner">👑 مالك</option>
        </select>
        <button id="tmAddBtn" onclick="admAddMember()" disabled>➕ عيّنه</button>
      </div>
    </div>
  </div>`;
}
async function admSetRole(uid, role) {
  if (!needOwner5("تغيير الرتب")) return;
  const { error } = await sb.from("admins").update({ role }).eq("id", uid);
  if (error) {
    toast("تعذر التغيير: " + error.message, true);
    return;
  }
  toast("انتغيّرت الرتبة ✅");
  loadAdmWeek6();
}
async function admRemove(uid) {
  if (!needOwner5("إزالة المشرفين")) return;
  if (!confirm("إزالة هذا المشرف نهائياً؟")) return;
  const { error } = await sb.from("admins").delete().eq("id", uid);
  if (error) {
    toast("تعذرت الإزالة: " + error.message, true);
    return;
  }
  toast("انحذف المشرف");
  loadAdmWeek6();
}
async function admAddMember() {
  if (!needOwner5("تعيين المشرفين")) return;
  const pick = state.tmPick;
  if (!pick) {
    toast("اختر العضو أول", true);
    return;
  }
  const role = $("tmRole").value;
  const { error } = await sb.from("admins").insert({ id: pick.id, role, name: pick.name });
  if (error) {
    toast("تعذرت الإضافة: " + error.message, true);
    return;
  }
  toast("✅ " + pick.name + " صار " + ((ADM_ROLES[role] || {}).n || role));
  tmClearPick();
  loadAdmWeek6();
}
function tmSearchUsers() {
  clearTimeout(_tmT);
  _tmT = setTimeout(_tmRun, 400);
}
async function _tmRun() {
  const q = ($("tmSearch").value || "").trim();
  const box = $("tmResults");
  if (!box) return;
  if (q.length < 2) {
    box.innerHTML = "";
    return;
  }
  box.innerHTML = '<div class="tm-hint">⏳</div>';
  try {
    const r = await sb.from("profiles").select("id,display_name,region").ilike("display_name", "%" + q + "%").limit(12);
    let list = r.data || [];
    try {
      const ex = await sb.from("admins").select("id");
      const have = (ex.data || []).map((x) => x.id);
      list = list.filter((u) => !have.includes(u.id));
    } catch (e) {
    }
    if (!list.length) {
      box.innerHTML = '<div class="tm-hint">ما لقينا أحداً</div>';
      return;
    }
    box.innerHTML = list.map((u) => `
      <div class="tm-res" onclick="tmPick('${u.id}','${esc(u.display_name || "مصوّر").replace(/'/g, "&#39;")}')">
        <span>${esc(u.display_name || "مصوّر")}</span>
        ${u.region ? `<small>${esc(u.region)}</small>` : ""}
      </div>`).join("");
  } catch (e) {
    box.innerHTML = '<div class="tm-hint">تعذر البحث</div>';
  }
}
function tmPick(id, name) {
  state.tmPick = { id, name };
  $("tmResults").innerHTML = "";
  $("tmSearch").value = "";
  const p = $("tmPicked");
  if (p) {
    p.style.display = "flex";
    p.innerHTML = "<b>" + esc(name) + '</b><button onclick="tmClearPick()">✕</button>';
  }
  const b = $("tmAddBtn");
  if (b) b.disabled = false;
}
function tmClearPick() {
  state.tmPick = null;
  const p = $("tmPicked");
  if (p) p.style.display = "none";
  const b = $("tmAddBtn");
  if (b) b.disabled = true;
}
async function admCuratorsBlock2() {
  if (!isOwner()) return "";
  let rows = "";
  try {
    const r = await sb.from("curators").select("id,name,added_at").order("added_at");
    const list = r.data || [];
    rows = list.length ? list.map((x) => `<div class="cu-row">
          <span class="cu-name">🏵️ ${esc(x.name || "محرّر")}</span>
          <button class="cu-del" onclick="admRemoveCurator('${x.id}','${esc(x.name || "محرّر").replace(/'/g, "&#39;")}')">✕</button>
        </div>`).join("") : '<div class="cu-empty">ما عيّنت محررين بعد</div>';
  } catch (e) {
    rows = '<div class="cu-empty">تعذر التحميل</div>';
  }
  return `<div style="background:var(--card);border:1.5px solid var(--qteal);border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:4px">🏵️ هيئة المحررين <span style="font-size:11px;color:var(--qteal)">● للمالك</span></div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:11px;line-height:1.85">
      اختر <b>أي عضو</b> تراه صاحب عين بصيرة — ما يحتاج يكون مشرفاً. المحررون يرشّحون الصور المميزة ويصوّتون عليها.
      <br><span style="opacity:.8">المالك والمحرّرون (بالرتب) محررون تلقائياً.</span>
    </div>
    ${rows}
    <div class="cu-add">
      <input id="cuSearch" placeholder="ابحث عن العضو بالاسم..." oninput="cuSearchUsers()" autocomplete="off">
      <div id="cuResults" class="cu-results"></div>
      <div id="cuPicked" class="cu-picked" style="display:none"></div>
      <button id="cuAddBtn" onclick="admAddCurator()" disabled>🏵️ عيّنه محرّراً</button>
    </div>
  </div>`;
}
function cuSearchUsers() {
  clearTimeout(_cuT);
  _cuT = setTimeout(_cuRun, 400);
}
async function _cuRun() {
  const q = ($("cuSearch").value || "").trim();
  const box = $("cuResults");
  if (!box) return;
  if (q.length < 2) {
    box.innerHTML = "";
    return;
  }
  box.innerHTML = '<div class="cu-empty">⏳</div>';
  try {
    const r = await sb.from("profiles").select("id,display_name,region").ilike("display_name", "%" + q + "%").limit(12);
    let list = r.data || [];
    try {
      const ex = await sb.from("curators").select("id");
      const have = (ex.data || []).map((x) => x.id);
      list = list.filter((u) => !have.includes(u.id));
    } catch (e) {
    }
    if (!list.length) {
      box.innerHTML = '<div class="cu-empty">ما لقينا أحداً</div>';
      return;
    }
    const counts = {};
    try {
      if (typeof state.photos !== "undefined") {
        state.photos.forEach((p) => {
          counts[p.user_id] = (counts[p.user_id] || 0) + 1;
        });
      }
    } catch (e) {
    }
    box.innerHTML = list.map((u) => {
      const n = counts[u.id] || 0;
      return `<div class="cu-res" onclick="cuPick('${u.id}','${esc(u.display_name || "مصوّر").replace(/'/g, "&#39;")}')">
        <span>${esc(u.display_name || "مصوّر")}</span>
        <small>${u.region ? esc(u.region) + " · " : ""}${n} صورة</small>
      </div>`;
    }).join("");
  } catch (e) {
    box.innerHTML = '<div class="cu-empty">تعذر البحث</div>';
  }
}
function cuPick(id, name) {
  state.cuPick = { id, name };
  $("cuResults").innerHTML = "";
  $("cuSearch").value = "";
  const p = $("cuPicked");
  if (p) {
    p.style.display = "flex";
    p.innerHTML = "<b>" + esc(name) + '</b><button onclick="cuClearPick()">✕</button>';
  }
  const b = $("cuAddBtn");
  if (b) b.disabled = false;
}
function cuClearPick() {
  state.cuPick = null;
  const p = $("cuPicked");
  if (p) p.style.display = "none";
  const b = $("cuAddBtn");
  if (b) b.disabled = true;
}
async function admAddCurator() {
  if (!needOwner5("تعيين المحررين")) return;
  const pick = state.cuPick;
  if (!pick) {
    toast("اختر العضو أول", true);
    return;
  }
  const { error } = await sb.from("curators").insert({ id: pick.id, name: pick.name });
  if (error) {
    if (error.code === "23505") {
      toast("محرّر أصلاً 🏵️", true);
      return;
    }
    toast("تعذر التعيين: " + error.message, true);
    return;
  }
  try {
    if (typeof pushNotify === "function") pushNotify({
      title: "🏵️ صرت من هيئة المحررين",
      body: "تقدر ترشّح الصور المميزة وتصوّت عليها",
      url: "/",
      user_ids: [pick.id]
    });
    await sb.from("feedback").insert({
      user_id: pick.id,
      kind: "other",
      status: "done",
      body: "🏵️ مرحباً بك في هيئة المحررين\n\nاخترناك لعينك البصيرة — صرت تقدر ترشّح الصور المميزة للحصول على وسام «اختيار المحررين» وتصوّت على ترشيحات غيرك.\n\nالترشيح من صفحة أي صورة، والتصويت من قسم المحررين.\n\nشكراً لأنك تساعدنا نبرز أجمل ما توثّقه عدسات أهل الديار."
    });
  } catch (e) {
  }
  toast("🏵️ " + pick.name + " صار محرّراً — وانبلّغ");
  cuClearPick();
  loadAdmWeek6();
}
async function admRemoveCurator(uid, name) {
  if (!needOwner5("إزالة المحررين")) return;
  if (!confirm("سحب صفة المحرّر عن " + (name || "هذا العضو") + "؟")) return;
  const { error } = await sb.from("curators").delete().eq("id", uid);
  if (error) {
    toast("تعذرت الإزالة: " + error.message, true);
    return;
  }
  toast("انسحبت صفة المحرّر");
  loadAdmWeek6();
}
var loadAdmWeek6, ADM_ROLES, _tmT, _cuT;
var init_team = __esm({
  "js/admin/team.js"() {
    init_db();
    init_hub();
    init_state();
    init_ui();
    init_places();
    loadAdmWeek6 = need("loadAdmWeek");
    ADM_ROLES = {
      owner: { n: "مالك", ic: "👑", c: "#D63A2F" },
      editor: { n: "محرّر", ic: "✏️", c: "#E8A020" },
      mod: { n: "مراجع", ic: "🛡️", c: "#2E8B57" }
    };
    _tmT = null;
    state.tmPick = null;
    _cuT = null;
    state.cuPick = null;
  }
});

// js/main.js
init_db();
init_ui();
init_state();
init_hub();

// js/core/bridge.js
function expose(obj) {
  Object.entries(obj).forEach(([k, v]) => {
    if (typeof v === "function" || v !== void 0) window[k] = v;
  });
}

// js/main.js
init_places();

// js/app/nav.js
var nav_exports = {};
__export(nav_exports, {
  accPanel: () => accPanel,
  applyViewPrefs: () => applyViewPrefs,
  boot: () => boot,
  dismissEnBar: () => dismissEnBar,
  getViewPrefs: () => getViewPrefs,
  go: () => go,
  handleAuthReturn: () => handleAuthReturn,
  initEnBar: () => initEnBar,
  initViewPrefs: () => initViewPrefs,
  installTapOverlay: () => installTapOverlay,
  saveViewPrefs: () => saveViewPrefs
});
init_db();
init_hub();
init_state();
init_ui();
init_places();
var renderAccAvatar = need("renderAccAvatar");
var fillAddCities = need("fillAddCities");
var initSelects = need("initSelects");
var renderFdTags = need("renderFdTags");
var renderTagRow = need("renderTagRow");
var checkAdmin = need("checkAdmin");
var loadFavs = need("loadFavs");
var loadPhotos = need("loadPhotos");
var refreshPhotos = need("refreshPhotos");
var loadWeek = need("loadWeek");
var loadSponsor = need("loadSponsor");
var loadChallenge = need("loadChallenge");
var initHero = need("initHero");
var openSheet = need("openSheet");
var showNearby = need("showNearby");
var ensurePos = need("ensurePos");
var startNearWatch = need("startNearWatch");
var stopNearWatch = need("stopNearWatch");
var closeNearPop = need("closeNearPop");
var loadWeatherTip = need("loadWeatherTip");
var initGoogleBtn = need("initGoogleBtn");
var render = need("render");
var renderMap = need("renderMap");
var renderHomeHero = need("renderHomeHero");
var stopAllReels = need("stopAllReels");
var initVideoUpload = need("initVideoUpload");
var renderAccCover = need("renderAccCover");
var dmUnreadCount = need("dmUnreadCount");
var renderInbox = need("renderInbox");
var renderBlockList = need("renderBlockList");
var renderNotifBox_ = need("renderNotifBox");
var renderMyStats = need("renderMyStats");
var renderVault = need("renderVault");
var renderAccIn = need("renderAccIn");
var loadMyMsgs = need("loadMyMsgs");
var openAdminPanel = need("openAdminPanel");
var maybeAskNotifs = need("maybeAskNotifs");
function go(p) {
  if (p === "add" && isAnon()) {
    toast("سجّل أول عشان تنشر صورك باسمك 📸");
    p = "acc";
    $("accOut").style.display = "block";
    $("accIn").style.display = "none";
  }
  if (p === "adm" && !state.isAdmin && !state.isCurator) p = "feed";
  document.querySelectorAll(".page").forEach((x) => x.classList.remove("on"));
  $("page-" + p).classList.add("on");
  const wasDark = document.body.classList.contains("dark");
  document.body.className = "page-" + p + (wasDark ? " dark" : "");
  if (p === "feed") {
    if (typeof loadPhotos === "function") loadPhotos().then(() => {
      if (typeof render === "function") render();
    });
    else if (typeof render === "function") render();
    const adm = $("page-adm");
    if (adm && adm.classList.contains("on")) adm.classList.remove("on");
  }
  const _ov = document.getElementById("overlay");
  if (_ov && _ov.classList.contains("show")) {
    _ov.classList.remove("show");
    document.body.style.overflow = "";
  }
  if (p !== "reels" && typeof stopAllReels === "function") stopAllReels();
  if (p === "add" && typeof initVideoUpload === "function") setTimeout(initVideoUpload, 120);
  if (p === "feed" && typeof applyViewPrefs === "function") setTimeout(applyViewPrefs, 80);
  if (p === "acc" && typeof renderAccAvatar === "function") setTimeout(renderAccAvatar, 150);
  if (p === "acc" && typeof renderAccCover === "function") setTimeout(renderAccCover, 150);
  if (p === "acc" && typeof dmUnreadCount === "function") setTimeout(dmUnreadCount, 300);
  if (p !== "acc" && typeof accPanel === "function" && state.accOpen) accPanel("");
  $("nb-feed").classList.toggle("on", p === "feed");
  const nr = $("nb-reels");
  if (nr) nr.classList.toggle("on", p === "reels");
  $("nb-favs").classList.toggle("on", p === "favs");
  $("nb-msgs").classList.toggle("on", p === "msgs");
  $("nb-acc").classList.toggle("on", p === "acc");
  const fb = $("fab");
  if (fb) fb.style.display = p === "add" ? "none" : "block";
  window.scrollTo(0, 0);
}
async function enterAdmin() {
  if (typeof window.openAdmin !== "function") {
    console.error("[adm] الجسر غير منشور — لم تُفتح اللوحة");
    toast("تعذر تحميل لوحة الإشراف — حدّث الصفحة", true);
    return;
  }
  try {
    await window.openAdmin();
  } catch (e) {
    console.error("[adm] تعذر فتح اللوحة", e);
    toast("تعذر فتح لوحة الإشراف", true);
  }
}
document.addEventListener("click", function(e) {
  const card = e.target.closest(".mcard");
  if (!card) return;
  if (window.matchMedia("(hover:hover)").matches) return;
  if (!card.classList.contains("tapped")) {
    document.querySelectorAll(".mcard.tapped").forEach((c) => c.classList.remove("tapped"));
    card.classList.add("tapped");
    e.stopPropagation();
    return;
  }
}, true);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    if (typeof refreshPhotos === "function") refreshPhotos();
    if (typeof loadSponsor === "function") loadSponsor();
    if (typeof loadWeek === "function") loadWeek();
    if (typeof loadChallenge === "function") loadChallenge();
  }
});
setInterval(() => {
  if (document.visibilityState === "visible" && typeof refreshPhotos === "function") refreshPhotos();
}, 12e4);
window.__VAPID_PUB = "BCeGpOtX3WqUv7u0B8hoOJDdrp8PKUXG1pow2wWyM8sS7bnLJ3v8mzqczz-SmiQJgNeZXz1Z4VouYB9LAwsXe94";
function accPanel(name) {
  state.accOpen = state.accOpen === name ? "" : name;
  const map = { edit: "pnEdit", stats: "pnStats", vault: "pnVault", inbox: "pnInbox", notif: "pnNotif" };
  Object.keys(map).forEach((k) => {
    const el = document.getElementById(map[k]);
    if (el) el.classList.toggle("on", k === state.accOpen);
  });
  document.querySelectorAll(".acc-tile").forEach((t, i) => {
    const keys = ["edit", "stats", "vault", "inbox", "notif"];
    t.classList.toggle("on", keys[i] === state.accOpen);
  });
  if (state.accOpen === "vault" && typeof renderVault === "function") renderVault();
  if (state.accOpen === "stats" && typeof renderMyStats === "function") renderMyStats();
  if (state.accOpen === "notif" && typeof renderNotifBox === "function") renderNotifBox();
  if (state.accOpen === "inbox" && typeof renderInbox === "function") renderInbox();
  if (state.accOpen === "inbox" && typeof renderBlockList === "function") setTimeout(renderBlockList, 400);
  if (state.accOpen) {
    setTimeout(() => {
      const el = document.getElementById(map[state.accOpen]);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 60);
  }
}
function initEnBar() {
  try {
    if (localStorage.getItem("sowra_en_dismissed") === "1") return;
    const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    const isAr = langs.some((l) => String(l).toLowerCase().startsWith("ar"));
    if (isAr) return;
    const el = document.getElementById("enBar");
    if (el) el.classList.add("show");
  } catch (e) {
  }
}
function dismissEnBar() {
  try {
    localStorage.setItem("sowra_en_dismissed", "1");
  } catch (e) {
  }
  const el = document.getElementById("enBar");
  if (el) el.classList.remove("show");
}
async function handleAuthReturn() {
  try {
    const h = window.location.hash || "";
    const q = window.location.search || "";
    const hasCode = q.includes("code=");
    const hasToken = h.includes("access_token");
    if (!hasCode && !hasToken) return;
    if (hasCode && sb.auth.exchangeCodeForSession) {
      try {
        await sb.auth.exchangeCodeForSession(window.location.href);
      } catch (e) {
      }
    }
    try {
      history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
    }
    const s = await sb.auth.getSession();
    if (s && s.data && s.data.session) {
      session.user = s.data.session.user;
      await checkAdmin();
      if (typeof renderAccIn === "function") await renderAccIn();
      toast("حياك الله 🌟");
      await loadPhotos();
    }
  } catch (e) {
  }
}
state.accOpen = "";
function getViewPrefs() {
  let p = { hero: true, weather: true, challenge: true, near: true };
  try {
    const s = localStorage.getItem("sowra_view");
    if (s) p = Object.assign(p, JSON.parse(s));
  } catch (e) {
  }
  return p;
}
function saveViewPrefs() {
  const p = {
    near: !!(document.getElementById("swNear") && document.getElementById("swNear").checked),
    hero: !!(document.getElementById("swHero") && document.getElementById("swHero").checked),
    weather: !!(document.getElementById("swWeather") && document.getElementById("swWeather").checked),
    challenge: !!(document.getElementById("swChallenge") && document.getElementById("swChallenge").checked)
  };
  try {
    localStorage.setItem("sowra_view", JSON.stringify(p));
  } catch (e) {
  }
  applyViewPrefs();
  if (p.near && typeof ensurePos === "function") {
    try {
      ensurePos(true);
    } catch (e) {
    }
  }
}
function applyViewPrefs() {
  const p = getViewPrefs();
  if (!p.near) {
    if (typeof stopNearWatch === "function") stopNearWatch();
    if (typeof closeNearPop === "function") closeNearPop();
  } else {
    if (typeof startNearWatch === "function") startNearWatch();
  }
  const hero = document.getElementById("homeHero");
  const wt = document.getElementById("weatherTip");
  const ch = document.getElementById("challengeStrip");
  if (hero && !p.hero) hero.style.display = "none";
  if (wt) wt.style.display = p.weather ? "" : "none";
  if (ch && !p.challenge) ch.style.display = "none";
  if (hero && p.hero && typeof renderHomeHero === "function") renderHomeHero();
  if (ch && p.challenge && typeof loadChallenge === "function") loadChallenge();
}
function initViewPrefs() {
  const p = getViewPrefs();
  const n = document.getElementById("swNear");
  if (n) n.checked = p.near;
  const a = document.getElementById("swHero"), b = document.getElementById("swWeather"), c = document.getElementById("swChallenge");
  if (a) a.checked = p.hero;
  if (b) b.checked = p.weather;
  if (c) c.checked = p.challenge;
  applyViewPrefs();
}
async function boot() {
  try {
    const t = localStorage.getItem("sowra_theme") || "auto";
    if (t === "dark") document.documentElement.setAttribute("data-preload-dark", "1");
  } catch (e) {
  }
  try {
    initTheme();
  } catch (e) {
  }
  try {
    await handleAuthReturn();
  } catch (e) {
  }
  try {
    renderTagRow();
  } catch (e) {
  }
  try {
    renderFdTags();
  } catch (e) {
  }
  const authP = ensureAuth().then(async () => {
    await checkAdmin();
    loadFavs();
  }).catch(() => {
  });
  if (location.search.indexOf("admin=1") > -1) {
    try {
      await authP;
      if (state.isAdmin) {
        const g = $("admGear");
        if (g) g.style.display = "block";
        await enterAdmin();
      } else {
        console.warn("[adm] الرابط استُعمل بحساب غير مشرف — لم تُفتح اللوحة");
        toast("هذا الرابط للمشرفين فقط", true);
      }
    } catch (e) {
      console.error("[boot] تعذر فتح اللوحة برابط الطوارئ", e);
    }
  }
  try {
    await loadPhotos();
    loadWeek();
    loadSponsor();
    loadChallenge();
    try {
      const pid = parseInt(new URLSearchParams(location.search).get("p"), 10);
      if (pid && typeof openSheet === "function") {
        setTimeout(() => {
          try {
            openSheet(pid);
            history.replaceState({}, document.title, location.pathname);
          } catch (e) {
            console.warn("[رابط] تعذّر فتح الصورة", pid, e);
          }
        }, 120);
      }
    } catch (e) {
    }
    initHero();
    showNearby();
    try {
      startNearWatch();
    } catch (e) {
    }
    setTimeout(() => loadWeatherTip(), 400);
    initGoogleBtn();
    let tries = 0;
    const gi = setInterval(() => {
      tries++;
      if (state.banner && Object.keys(state.banner).length || tries > 12) {
        clearInterval(gi);
        initGoogleBtn();
      }
    }, 500);
  } catch (e) {
    const fd = $("feed");
    if (fd) fd.innerHTML = '<div class="empty"><span class="big">⚠️</span>تعذر تحميل الصور<br>' + esc(e.message || "") + "</div>";
  }
  await authP;
  try {
    initViewPrefs();
  } catch (e) {
  }
  try {
    maybeAskNotifs();
  } catch (e) {
  }
  try {
    initEnBar();
  } catch (e) {
  }
  installTapOverlay();
}
function installTapOverlay() {
  document.addEventListener("click", function(e) {
    const card = e.target.closest(".mcard");
    if (!card) return;
    if (window.matchMedia("(hover:hover)").matches) return;
    if (!card.classList.contains("tapped")) {
      document.querySelectorAll(".mcard.tapped").forEach((c) => c.classList.remove("tapped"));
      card.classList.add("tapped");
    }
  });
}

// js/app/push.js
var push_exports = {};
__export(push_exports, {
  askedBefore: () => askedBefore,
  isStandalone: () => isStandalone,
  markAsked: () => markAsked,
  maybeAskNotifs: () => maybeAskNotifs2,
  notifAskNo: () => notifAskNo,
  notifAskYes: () => notifAskYes,
  notifSupported: () => notifSupported,
  renderNotifBox: () => renderNotifBox2,
  toggleNotifs: () => toggleNotifs,
  urlB64ToUint8: () => urlB64ToUint8
});
init_db();
init_hub();
init_state();
init_ui();
init_places();
var renderAccAvatar2 = need("renderAccAvatar");
var fillAddCities2 = need("fillAddCities");
var initSelects2 = need("initSelects");
var renderFdTags2 = need("renderFdTags");
var renderTagRow2 = need("renderTagRow");
var checkAdmin2 = need("checkAdmin");
var loadFavs2 = need("loadFavs");
var loadPhotos2 = need("loadPhotos");
var loadWeek2 = need("loadWeek");
var loadSponsor2 = need("loadSponsor");
var loadChallenge2 = need("loadChallenge");
var initHero2 = need("initHero");
var showNearby2 = need("showNearby");
var loadWeatherTip2 = need("loadWeatherTip");
var initGoogleBtn2 = need("initGoogleBtn");
var render2 = need("render");
var renderMap2 = need("renderMap");
var renderHomeHero2 = need("renderHomeHero");
var stopAllReels2 = need("stopAllReels");
var initVideoUpload2 = need("initVideoUpload");
var renderAccCover2 = need("renderAccCover");
var dmUnreadCount2 = need("dmUnreadCount");
var renderInbox2 = need("renderInbox");
var renderBlockList2 = need("renderBlockList");
var renderNotifBox_2 = need("renderNotifBox");
var renderMyStats2 = need("renderMyStats");
var renderVault2 = need("renderVault");
var renderAccIn2 = need("renderAccIn");
var loadMyMsgs2 = need("loadMyMsgs");
var openAdminPanel2 = need("openAdminPanel");
function urlB64ToUint8(b64) {
  const pad = "=".repeat((4 - b64.length % 4) % 4);
  const s = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(s);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
function notifSupported() {
  return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
}
function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
async function renderNotifBox2() {
  const box = $("notifBox");
  if (!box) return;
  if (isAnon()) {
    box.style.display = "none";
    return;
  }
  box.style.display = "block";
  const card = box.querySelector(".notif-card");
  const st = $("notifState"), btn = $("notifBtn"), hint = $("notifHint");
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (!notifSupported()) {
    st.textContent = isIOS ? "تحتاج تثبيت التطبيق" : "غير مدعومة بهذا المتصفح";
    btn.style.display = "none";
    hint.style.display = "block";
    hint.innerHTML = isIOS ? '<b>خطوات التفعيل على الأيفون:</b><br>١. افتح sowra.app بمتصفح <b>Safari</b><br>٢. اضغط زر المشاركة <b>⬆️</b> بالأسفل<br>٣. اختر <b>«إضافة إلى الشاشة الرئيسية»</b><br>٤. افتح التطبيق من الأيقونة الجديدة<br>٥. ارجع هنا وفعّل الإشعارات<br><br><span style="opacity:.75">آبل تشترط تثبيت التطبيق قبل السماح بالإشعارات — لا يمكن تفعيلها من المتصفح مباشرة.</span>' : "متصفحك لا يدعم الإشعارات — جرّب كروم أو سفاري حديثاً.";
    return;
  }
  if (isIOS && !isStandalone()) {
    st.textContent = "تحتاج تثبيت التطبيق أولاً";
    btn.style.display = "none";
    hint.style.display = "block";
    hint.textContent = "اضغط زر المشاركة بسفاري ← «إضافة إلى الشاشة الرئيسية» ← افتح التطبيق من الأيقونة، وبعدها تقدر تفعّل الإشعارات.";
    return;
  }
  hint.style.display = "none";
  btn.style.display = "block";
  let sub = null;
  try {
    const reg = await navigator.serviceWorker.ready;
    sub = await reg.pushManager.getSubscription();
  } catch (e) {
  }
  const on = !!sub && Notification.permission === "granted";
  if (card) card.classList.toggle("on", on);
  st.textContent = on ? "● مفعّلة على هذا الجهاز" : "غير مفعّلة";
  btn.textContent = on ? "🔕 إيقاف الإشعارات" : "🔔 فعّل الإشعارات";
  btn.style.background = on ? "var(--card2)" : "var(--sadu)";
  btn.style.color = on ? "var(--txt)" : "#fff";
  btn.style.border = on ? "1px solid var(--line)" : "none";
}
async function toggleNotifs() {
  if (!notifSupported()) {
    toast("جهازك ما يدعم الإشعارات", true);
    return;
  }
  const btn = $("notifBtn");
  btn.disabled = true;
  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing && Notification.permission === "granted") {
      const ep = existing.endpoint;
      await existing.unsubscribe();
      await sb.from("push_subs").delete().eq("endpoint", ep);
      toast("اتوقفت الإشعارات");
      renderNotifBox2();
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      toast(perm === "denied" ? "رفضت الإذن — فعّله من إعدادات المتصفح" : "ما تم التفعيل", true);
      renderNotifBox2();
      return;
    }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8(window.__VAPID_PUB)
    });
    const j = sub.toJSON();
    const { error } = await sb.from("push_subs").upsert({
      user_id: currentUser()?.id,
      endpoint: sub.endpoint,
      p256dh: j.keys.p256dh,
      auth: j.keys.auth
    }, { onConflict: "endpoint" });
    if (error) throw error;
    toast("انفعّلت الإشعارات 🔔");
    reg.showNotification("صورة من بلدي 🇸🇦", {
      body: "الإشعارات مفعّلة — بنوصلك أول ما يصير جديد",
      icon: "icon-192.png",
      dir: "rtl",
      lang: "ar"
    });
    renderNotifBox2();
  } catch (e) {
    toast("تعذر التفعيل: " + (e.message || ""), true);
  } finally {
    btn.disabled = false;
  }
}
function askedBefore() {
  try {
    return localStorage.getItem("sowra_notif_asked") === "1";
  } catch (e) {
    return true;
  }
}
function markAsked() {
  try {
    localStorage.setItem("sowra_notif_asked", "1");
  } catch (e) {
  }
}
async function maybeAskNotifs2() {
  try {
    if (askedBefore()) return;
    if (isAnon()) return;
    if (!notifSupported()) return;
    if (Notification.permission !== "default") return;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !isStandalone()) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) return;
    setTimeout(() => {
      const el = document.getElementById("notifAsk");
      if (el) el.classList.add("show");
    }, 1800);
  } catch (e) {
  }
}
function notifAskNo() {
  markAsked();
  const el = document.getElementById("notifAsk");
  if (el) el.classList.remove("show");
  toast("تقدر تفعّلها من صفحة حسابي متى ما تبي");
}
async function notifAskYes() {
  markAsked();
  const el = document.getElementById("notifAsk");
  if (el) el.classList.remove("show");
  if (typeof toggleNotifs === "function") await toggleNotifs();
}

// js/app/theme.js
var theme_exports = {};
__export(theme_exports, {
  applyTheme: () => applyTheme,
  getThemeMode: () => getThemeMode,
  initTheme: () => initTheme2,
  isNightNow: () => isNightNow,
  loadSunTimes: () => loadSunTimes,
  resolveTheme: () => resolveTheme,
  toggleTheme: () => toggleTheme
});
init_db();
init_hub();
init_state();
init_ui();
init_places();
var renderAccAvatar3 = need("renderAccAvatar");
var fillAddCities3 = need("fillAddCities");
var initSelects3 = need("initSelects");
var renderFdTags3 = need("renderFdTags");
var renderTagRow3 = need("renderTagRow");
var checkAdmin3 = need("checkAdmin");
var loadFavs3 = need("loadFavs");
var loadPhotos3 = need("loadPhotos");
var loadWeek3 = need("loadWeek");
var loadSponsor3 = need("loadSponsor");
var loadChallenge3 = need("loadChallenge");
var initHero3 = need("initHero");
var showNearby3 = need("showNearby");
var loadWeatherTip3 = need("loadWeatherTip");
var initGoogleBtn3 = need("initGoogleBtn");
var render3 = need("render");
var renderMap3 = need("renderMap");
var renderHomeHero3 = need("renderHomeHero");
var stopAllReels3 = need("stopAllReels");
var initVideoUpload3 = need("initVideoUpload");
var renderAccCover3 = need("renderAccCover");
var dmUnreadCount3 = need("dmUnreadCount");
var renderInbox3 = need("renderInbox");
var renderBlockList3 = need("renderBlockList");
var renderNotifBox_3 = need("renderNotifBox");
var renderMyStats3 = need("renderMyStats");
var renderVault3 = need("renderVault");
var renderAccIn3 = need("renderAccIn");
var loadMyMsgs3 = need("loadMyMsgs");
var openAdminPanel3 = need("openAdminPanel");
function isNightNow() {
  try {
    const s = localStorage.getItem("sowra_sun");
    if (s) {
      const o = JSON.parse(s);
      const now = Date.now();
      if (o.rise && o.set && now - o.at < 864e5) return now < o.rise || now > o.set;
    }
  } catch (e) {
  }
  const h = (/* @__PURE__ */ new Date()).getHours();
  return h < 6 || h >= 18;
}
async function loadSunTimes(lat, lng) {
  try {
    const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lng + "&daily=sunrise,sunset&timezone=auto&forecast_days=1");
    const j = await r.json();
    const rise = new Date(j.daily.sunrise[0]).getTime();
    const set = new Date(j.daily.sunset[0]).getTime();
    localStorage.setItem("sowra_sun", JSON.stringify({ rise, set, at: Date.now() }));
    if (getThemeMode() === "auto") applyTheme("auto");
  } catch (e) {
  }
}
function getThemeMode() {
  try {
    return localStorage.getItem("sowra_theme") || "auto";
  } catch (e) {
    return "auto";
  }
}
function resolveTheme(mode) {
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  return isNightNow() ? "dark" : "light";
}
function applyTheme(mode) {
  try {
    if (mode === "auto" || mode === "dark" || mode === "light") {
    } else {
      mode = mode === "dark" ? "dark" : "light";
    }
    const eff = resolveTheme(mode);
    document.body.classList.toggle("dark", eff === "dark");
    const b = document.getElementById("themeBtn");
    if (b) {
      b.textContent = mode === "auto" ? "🔄" : mode === "dark" ? "☀️" : "🌙";
      b.title = mode === "auto" ? "تلقائي حسب الوقت" : mode === "dark" ? "الوضع النهاري" : "الوضع الليلي";
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", eff === "dark" ? "#161310" : "#F7F1E3");
    localStorage.setItem("sowra_theme", mode);
  } catch (e) {
  }
}
function toggleTheme() {
  const cur = getThemeMode();
  const next = cur === "auto" ? "light" : cur === "light" ? "dark" : "auto";
  applyTheme(next);
  const names = { auto: "تلقائي حسب الوقت 🔄", light: "الوضع النهاري ☀️", dark: "الوضع الليلي 🌙" };
  if (typeof toast === "function") toast(names[next]);
}
function initTheme2() {
  applyTheme(getThemeMode());
  setInterval(function() {
    if (getThemeMode() === "auto") applyTheme("auto");
  }, 6e5);
}

// js/features/account-media.js
var account_media_exports = {};
__export(account_media_exports, {
  coverUrl: () => coverUrl,
  renderAccAvatar: () => renderAccAvatar4,
  renderAccCover: () => renderAccCover4,
  saveProfileAll: () => saveProfileAll,
  uploadAvatar: () => uploadAvatar,
  uploadCover: () => uploadCover
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var openAcc = need("openAcc");
var renderAccIn4 = need("renderAccIn");
var go2 = need("go");
var maybeAskNotifs3 = need("maybeAskNotifs");
var checkRaceProgress = need("checkRaceProgress");
var closeSheet = need("closeSheet");
var loadPhotos4 = need("loadPhotos");
var openSheet2 = need("openSheet");
var pushNotify2 = need("pushNotify");
var refreshOne = need("refreshOne");
var render4 = need("render");
var showJoinBox = need("showJoinBox");
async function uploadAvatar(inp) {
  const f = inp.files[0];
  if (!f) return;
  if (isAnon()) {
    toast("📷 سجّل مجاناً وحمّل صورتك الشخصية", true);
    showJoinBox();
    return;
  }
  if (f.size > 4 * 1024 * 1024) {
    toast("الصورة كبيرة — الحد 4 ميجا", true);
    inp.value = "";
    return;
  }
  toast("⏳ نرفع صورتك...");
  try {
    const blob = await new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const S = 400;
        const cv = document.createElement("canvas");
        cv.width = S;
        cv.height = S;
        const ctx = cv.getContext("2d");
        const rt = Math.max(S / img.width, S / img.height);
        const dw = img.width * rt, dh = img.height * rt;
        ctx.drawImage(img, (S - dw) / 2, (S - dh) * 0.3, dw, dh);
        URL.revokeObjectURL(img.src);
        cv.toBlob((b) => b ? res(b) : rej(new Error("فشل")), "image/jpeg", 0.88);
      };
      img.onerror = rej;
      img.src = URL.createObjectURL(f);
    });
    const path = currentUser()?.id + "/avatar.jpg";
    const up = await sb.storage.from("avatars").upload(path, blob, { contentType: "image/jpeg", upsert: true, cacheControl: "60" });
    if (up.error) throw up.error;
    const { error } = await sb.from("profiles").update({ avatar_path: path }).eq("id", currentUser()?.id);
    if (error) throw error;
    toast("انحفظت صورتك ✅");
    if (typeof renderAccAvatar4 === "function") renderAccAvatar4();
    if (state.profUid) state.profUid = "";
  } catch (e) {
    toast("تعذر الرفع: " + (e.message || ""), true);
  } finally {
    inp.value = "";
  }
}
async function renderAccAvatar4() {
  const el = $("accAvatar");
  if (!el) return;
  if (isAnon()) {
    el.innerHTML = "";
    return;
  }
  try {
    const r = await sb.from("profiles").select("avatar_path").eq("id", currentUser()?.id).maybeSingle();
    const path = r.data && r.data.avatar_path;
    const mine = state.photos.filter((x) => x.user_id === currentUser()?.id);
    const rk = mine.length ? rankOf(mine[0]) : { ic: "🌱" };
    el.innerHTML = path ? `<img class="pf-avatar" src="${avatarUrl(path)}?t=${Date.now()}" alt="">` : `<div class="pf-avatar-ph">${rk.ic}</div>`;
  } catch (e) {
  }
}
window.__stPeriod = 7;
state.statsSort = "stars";
async function saveProfileAll() {
  if (isAnon()) {
    toast("💾 سجّل مجاناً واحفظ بياناتك", true);
    showJoinBox();
    return;
  }
  const name = ($("accEditName") ? $("accEditName").value : "").trim();
  const region = ($("accRegion") ? $("accRegion").value : "").trim();
  const bio = ($("accBio") ? $("accBio").value : "").trim();
  if (!name) {
    toast("الاسم ما يصير فاضي", true);
    return;
  }
  const bn = checkText(name);
  if (bn) {
    toast("الاسم: " + bn, true);
    return;
  }
  const br = checkText(region);
  if (br) {
    toast("المنطقة: " + br, true);
    return;
  }
  const bb = checkText(bio);
  if (bb) {
    toast("النبذة: " + bb, true);
    return;
  }
  const { error } = await sb.from("profiles").update({ display_name: name, region, bio }).eq("id", currentUser()?.id);
  if (error) {
    toast("تعذر الحفظ: " + error.message, true);
    return;
  }
  toast("انحفظت بياناتك ✅");
  await loadPhotos4();
  if (typeof renderAccIn4 === "function") renderAccIn4();
  render4();
}
function coverUrl(path) {
  return sb.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}
async function uploadCover(inp) {
  const f = inp.files[0];
  if (!f) return;
  if (!sessionStorage.getItem("cover_hint")) {
    try {
      sessionStorage.setItem("cover_hint", "1");
    } catch (e) {
    }
  }
  if (isAnon()) {
    toast("🖼️ سجّل مجاناً وخصّص غلافك", true);
    showJoinBox();
    return;
  }
  if (f.size > 6 * 1024 * 1024) {
    toast("الصورة كبيرة — الحد 6 ميجا", true);
    inp.value = "";
    return;
  }
  toast("⏳ نرفع الغلاف...");
  try {
    const blob = await new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const W = 1200, H = 400;
        const cv = document.createElement("canvas");
        cv.width = W;
        cv.height = H;
        const ctx = cv.getContext("2d");
        const rt = Math.max(W / img.width, H / img.height);
        const dw = img.width * rt, dh = img.height * rt;
        const oy = (H - dh) * 0.35;
        ctx.drawImage(img, (W - dw) / 2, oy, dw, dh);
        URL.revokeObjectURL(img.src);
        cv.toBlob((b) => b ? res(b) : rej(new Error("فشل")), "image/jpeg", 0.86);
      };
      img.onerror = rej;
      img.src = URL.createObjectURL(f);
    });
    const path = currentUser()?.id + "/cover.jpg";
    const up = await sb.storage.from("avatars").upload(path, blob, { contentType: "image/jpeg", upsert: true, cacheControl: "60" });
    if (up.error) throw up.error;
    const { error } = await sb.from("profiles").update({ cover_path: path }).eq("id", currentUser()?.id);
    if (error) throw error;
    toast("انحفظ الغلاف 🖼️");
    if (typeof renderAccCover4 === "function") renderAccCover4();
    if (state.profUid) state.profUid = "";
  } catch (e) {
    toast("تعذر الرفع: " + (e.message || ""), true);
  } finally {
    inp.value = "";
  }
}
async function renderAccCover4() {
  const el = $("accCover"), hero = $("accHero");
  if (!el || !hero) return;
  if (isAnon()) return;
  try {
    const r = await sb.from("profiles").select("cover_path").eq("id", currentUser()?.id).maybeSingle();
    const path = r.data && r.data.cover_path;
    if (path) {
      el.style.backgroundImage = 'url("' + coverUrl(path) + "?t=" + Date.now() + '")';
      hero.classList.add("has-bg");
    } else {
      el.style.backgroundImage = "";
      hero.classList.remove("has-bg");
    }
  } catch (e) {
  }
}
state.tags = [];

// js/features/account.js
var account_exports = {};
__export(account_exports, {
  accForgot: () => accForgot,
  accLogout: () => accLogout,
  accMode: () => accMode,
  accSubmit: () => accSubmit,
  accTab: () => accTab,
  admLogout: () => admLogout,
  checkAdmin: () => checkAdmin4,
  clearMyMsgs: () => clearMyMsgs,
  delMyMsg: () => delMyMsg,
  initGoogleBtn: () => initGoogleBtn4,
  loadMyMsgs: () => loadMyMsgs4,
  openAcc: () => openAcc2,
  openMsgs: () => openMsgs,
  renderAccIn: () => renderAccIn5,
  replyToAdmin: () => replyToAdmin,
  saveMyName: () => saveMyName,
  signInWithGoogle: () => signInWithGoogle
});
init_db();
init_format();
init_hub();
init_state();
init_ui();
init_places();
var loadFavs4 = need("loadFavs");
var loadPhotos5 = need("loadPhotos");
var openAdmin = need("openAdmin");
var pushNotify3 = need("pushNotify");
var renderAccAvatar5 = need("renderAccAvatar");
var renderAccCover5 = need("renderAccCover");
var go3 = need("go");
async function checkAdmin4() {
  try {
    if (isAnon()) {
      state.isAdmin = false;
      state.admRole = "";
      try {
        localStorage.removeItem("sowra_admin");
      } catch (e) {
      }
      const g2 = $("admGear");
      if (g2) g2.style.display = "none";
      return false;
    }
    let data = null, answered = false;
    try {
      const r = await sb.from("admins").select("id,role").eq("id", currentUser()?.id).maybeSingle();
      if (!r.error) {
        answered = true;
        data = r.data;
      }
    } catch (e) {
    }
    if (!data) {
      try {
        const r2 = await sb.from("admins").select("id").eq("id", currentUser()?.id).maybeSingle();
        if (!r2.error) {
          answered = true;
          data = r2.data;
        }
      } catch (e) {
      }
    }
    state.isAdmin = !!data;
    state.admRole = data && data.role || (data ? "owner" : "");
    try {
      const cu = (await sb.from("curators").select("id").eq("id", currentUser()?.id).maybeSingle()).data;
      state.isCurator = !!cu;
    } catch (e) {
      state.isCurator = false;
    }
    if (!state.isAdmin && state.isCurator) {
      const g2 = $("admGear");
      if (g2) g2.style.display = "block";
    }
    try {
      if (state.isAdmin) localStorage.setItem("sowra_admin", "1");
      else if (answered) localStorage.removeItem("sowra_admin");
    } catch (e) {
    }
    let held = false;
    if (!answered) {
      try {
        held = localStorage.getItem("sowra_admin") === "1";
      } catch (e) {
      }
    }
    const g = $("admGear");
    if (g) g.style.display = state.isAdmin || held ? "block" : "none";
    return state.isAdmin;
  } catch (e) {
    state.isAdmin = false;
    return false;
  }
}
var accMode = "in";
function openAcc2() {
  if (currentUser() && !isAnon()) renderAccIn5();
  else {
    const o = $("accOut"), i = $("accIn");
    if (o) o.style.display = "block";
    if (i) i.style.display = "none";
  }
  go3("acc");
}
function accTab(m) {
  accMode = m;
  const ti = $("accTabIn"), tu = $("accTabUp"), ng = $("accNameGrp"), pb = $("pledgeBox"), ag = $("accGo");
  if (ti) ti.classList.toggle("on", m === "in");
  if (tu) tu.classList.toggle("on", m === "up");
  if (ng) ng.style.display = m === "up" ? "block" : "none";
  if (pb) pb.style.display = m === "up" ? "block" : "none";
  if (ag) ag.textContent = m === "up" ? "إنشاء الحساب" : "دخول";
  const fw = $("accForgotWrap");
  if (fw) fw.style.display = m === "up" ? "none" : "";
}
async function renderAccIn5() {
  try {
    let data = null;
    try {
      const r = await sb.from("profiles").select("display_name,bio,region").eq("id", currentUser()?.id).maybeSingle();
      data = r.data;
    } catch (e) {
    }
    const hi = $("accHello");
    if (hi) hi.textContent = "هلا " + (data && data.display_name || "مصوّر");
    const en = $("accEditName");
    if (en) en.value = data && data.display_name || "";
    const rg = $("accRegion");
    if (rg) rg.value = data && data.region || "";
    const bo = $("accBio");
    if (bo) bo.value = data && data.bio || "";
    const ml = $("accMail");
    if (ml) ml.textContent = currentUser()?.email || "";
    const ab = $("accAdminBtn");
    if (ab) ab.style.display = state.isAdmin ? "block" : "none";
    const o = $("accOut"), i = $("accIn");
    if (o) o.style.display = "none";
    if (i) i.style.display = "block";
    try {
      if (typeof renderAccAvatar5 === "function") renderAccAvatar5();
    } catch (e) {
    }
    try {
      if (typeof renderAccCover5 === "function") renderAccCover5();
    } catch (e) {
    }
  } catch (e) {
    console.warn("renderAccIn", e);
    const o = $("accOut"), i = $("accIn");
    if (o) o.style.display = "none";
    if (i) i.style.display = "block";
  }
}
async function saveMyName() {
  const en = $("accEditName");
  const name = en ? en.value.trim() : "";
  if (!name) return toast("اكتب اسم", true);
  const upd = { display_name: name };
  const rg = $("accRegion");
  if (rg) upd.region = rg.value.trim();
  const bo = $("accBio");
  if (bo) upd.bio = bo.value.trim();
  const { error } = await sb.from("profiles").update(upd).eq("id", currentUser()?.id);
  if (error) {
    dbErr("حفظ الحساب", error, "تعذر الحفظ");
    return;
  }
  const hi = $("accHello");
  if (hi) hi.textContent = "هلا " + name;
  toast("انحفظت بياناتك ✅");
  try {
    await loadPhotos5();
  } catch (e) {
  }
}
async function accForgot() {
  const em = $("accEmail");
  const email = em ? em.value.trim() : "";
  if (!email) {
    toast("اكتب إيميلك بالخانة أول، ثم اضغط «نسيت كلمة السر»", true);
    if (em) em.focus();
    return;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    toast("الإيميل غير صحيح", true);
    if (em) em.focus();
    return;
  }
  const lnk = $("accForgotBtn");
  const was = lnk ? lnk.textContent : "";
  if (lnk) {
    lnk.textContent = "⏳ جاري الإرسال...";
    lnk.style.pointerEvents = "none";
  }
  try {
    const back = location.origin + location.pathname;
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: back });
    if (error) throw error;
    toast("إن كان الإيميل مسجّلاً وصلك رابط الاستعادة 📧 — افحص البريد والمهملات");
  } catch (e) {
    dbErr("إرسال رابط الاستعادة", e, "تعذر الإرسال — جرّب بعد قليل");
  } finally {
    if (lnk) {
      lnk.textContent = was || "🔑 نسيت كلمة السر؟";
      lnk.style.pointerEvents = "";
    }
  }
}
async function accSubmit() {
  const em = $("accEmail"), pw = $("accPass");
  const email = em ? em.value.trim() : "", pass = pw ? pw.value : "";
  if (!email || !pass) return toast("عبّي الإيميل وكلمة السر", true);
  const b = $("accGo");
  const old = b ? b.textContent : "دخول";
  if (b) {
    b.disabled = true;
    b.textContent = "⏳";
  }
  try {
    if (accMode === "up") {
      const nm = $("accName");
      const name = nm ? nm.value.trim() : "";
      if (!name) {
        toast("اكتب اسمك", true);
        return;
      }
      const pc = $("pledgeChk");
      if (pc && !pc.checked) {
        toast("لازم توافق على الشروط والتعهد أول ✋", true);
        return;
      }
      const { data, error } = await sb.auth.signUp({
        email,
        password: pass,
        options: { data: { display_name: name } }
      });
      if (error) throw error;
      if (!data.session) {
        toast("أُرسل رابط تأكيد لإيميلك 📧");
        return;
      }
      session.user = data.session.user;
    } else {
      const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      const { data: { session: s } } = await sb.auth.getSession();
      session.user = s && s.user || data && data.user;
      if (!currentUser()) throw new Error("تعذر قراءة الجلسة");
    }
    try {
      await checkAdmin4();
    } catch (e) {
    }
    try {
      await renderAccIn5();
    } catch (e) {
    }
    toast(state.isAdmin ? "أهلاً بالمشرف 👮" : "حياك الله 🌟");
    try {
      if (state.isAdmin && typeof openAdmin === "function") openAdmin();
    } catch (e) {
    }
    try {
      await loadPhotos5();
    } catch (e) {
    }
    try {
      if (typeof loadFavs4 === "function") loadFavs4();
    } catch (e) {
    }
  } catch (e) {
    const msg = e && e.message || "";
    toast(msg.includes("Invalid") ? "بيانات الدخول غير صحيحة" : msg || "تعذرت العملية", true);
  } finally {
    if (b) {
      b.disabled = false;
      b.textContent = old;
    }
  }
}
async function accLogout() {
  try {
    await sb.auth.signOut();
  } catch (e) {
  }
  try {
    localStorage.removeItem("sowra_admin");
  } catch (e) {
  }
  location.reload();
}
async function admLogout() {
  await accLogout();
}
function openMsgs() {
  go3("msgs");
  loadMyMsgs4();
}
async function loadMyMsgs4() {
  const el = $("myMsgs");
  if (!el) return;
  if (!currentUser()) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = '<div style="text-align:center;color:var(--txt-dim);padding:8px">⏳</div>';
  try {
    const r = await sb.from("feedback").select("*").eq("user_id", currentUser()?.id).order("created_at", { ascending: false });
    const list = r.data || [];
    const done = list.filter((m) => m.status !== "new").length;
    el.innerHTML = (list.length ? `<div class="msgs-bar">
        <span>سجل رسائلك (${list.length})</span>
        ${done ? `<button onclick="clearMyMsgs()">🗑️ امسح المنتهية (${done})</button>` : ""}
      </div>` : "") + (list.map((m) => `
      <div class="msg-card">
        <div class="mk">
          <span>${typeof FB_AR !== "undefined" && FB_AR[m.kind] || m.kind} · ${new Date(m.created_at).toLocaleDateString("ar-SA")}</span>
          <span class="msg-st ${m.status === "new" ? "new" : "done"}">${/^(🚫|✅ تم رفع)/.test(m.body || "") ? "📢 قرار إداري" : m.status === "new" ? "⏳ قيد المراجعة" : "✅ تمت المعالجة"}</span>
        </div>
        <div class="mb">${esc(m.body)}</div>
        ${m.reply ? `<div class="msg-reply"><b>رد الإدارة:</b><br>${esc(m.reply)}</div>` : ""}
        <div class="msg-acts">
          <button class="msg-reply-btn" onclick="replyToAdmin(${m.id})">↩️ رد على الإدارة</button>
          ${m.status === "new" ? '<span class="msg-lock">🔒 قيد المراجعة</span>' : `<button class="msg-del" onclick="delMyMsg(${m.id})">🗑️ حذف</button>`}
        </div>
      </div>`).join("") || '<div class="empty" style="padding:18px">ما أرسلت رسائل بعد</div>');
  } catch (e) {
    el.innerHTML = '<div class="empty" style="padding:14px">تعذر تحميل السجل</div>';
  }
}
async function signInWithGoogle() {
  try {
    try {
      sessionStorage.setItem("oauth_pending", "1");
    } catch (e) {
    }
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + window.location.pathname }
    });
    if (error) toast("تعذر الدخول بـGoogle: " + error.message, true);
  } catch (e) {
    toast("تعذر الدخول بـGoogle", true);
  }
}
function initGoogleBtn4() {
  const wrap = $("googleBtnWrap");
  if (!wrap) return;
  const sp = state.banner;
  wrap.style.display = sp && sp.google_login ? "block" : "none";
}
async function delMyMsg(id) {
  if (!confirm("حذف هذي الرسالة من سجلك؟")) return;
  const { data, error } = await sb.from("feedback").delete().eq("id", id).eq("user_id", currentUser()?.id).select("id");
  if (error) {
    toast("تعذر الحذف: " + error.message, true);
    return;
  }
  if (!data || !data.length) {
    toast("ما تنحذف وهي قيد المراجعة 🔒", true);
    return;
  }
  toast("انحذفت");
  loadMyMsgs4();
}
async function clearMyMsgs() {
  if (!confirm("مسح كل الرسائل المنتهية من سجلك؟\nالرسائل قيد المراجعة تبقى.")) return;
  const { error } = await sb.from("feedback").delete().eq("user_id", currentUser()?.id).neq("status", "new");
  if (error) {
    toast("تعذر المسح: " + error.message, true);
    return;
  }
  toast("انمسح السجل ✅");
  loadMyMsgs4();
}
async function replyToAdmin(refId) {
  const t = prompt("اكتب ردك للإدارة:");
  if (t === null) return;
  const body = (t || "").trim();
  if (body.length < 5) {
    toast("اكتب رسالة أوضح", true);
    return;
  }
  if (body.length > 600) {
    toast("الحد ٦٠٠ حرف", true);
    return;
  }
  if (typeof checkText === "function") {
    const bad = checkText(body);
    if (bad) {
      toast(bad, true);
      return;
    }
  }
  try {
    const { error } = await sb.from("feedback").insert({
      user_id: currentUser()?.id,
      kind: "other",
      body: "↩️ رد على رسالة سابقة (#" + refId + ")\n\n" + body,
      status: "new"
    });
    if (error) throw error;
    try {
      if (typeof pushNotify3 === "function") {
        pushNotify3({
          title: "💬 رد من عضو",
          body: body.slice(0, 80),
          url: "/",
          to: "admins"
        });
      }
    } catch (e) {
    }
    toast("✅ وصل ردك — الإدارة تراجعه");
    loadMyMsgs4();
  } catch (e) {
    toast("تعذر الإرسال: " + (e && e.message || ""), true);
  }
}

// js/features/banners.js
var banners_exports = {};
__export(banners_exports, {
  bumpJoinCounter: () => bumpJoinCounter,
  closeHero: () => closeHero,
  closeNearPop: () => closeNearPop2,
  dismissJoin: () => dismissJoin,
  dismissNews: () => dismissNews,
  ensurePos: () => ensurePos2,
  goJoin: () => goJoin,
  initHero: () => initHero4,
  loadWeatherTip: () => loadWeatherTip4,
  maybePopNear: () => maybePopNear,
  nearPop: () => nearPop,
  renderHomeHero: () => renderHomeHero4,
  renderNewsBanner: () => renderNewsBanner,
  renderSponsorSide: () => renderSponsorSide,
  showJoinBox: () => showJoinBox2,
  showNearby: () => showNearby4,
  startNearWatch: () => startNearWatch2,
  stopNearWatch: () => stopNearWatch2
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var accTab2 = need("accTab");
var openSponsorsPage = need("openSponsorsPage");
var go4 = need("go");
var getViewPrefs2 = need("getViewPrefs");
var loadSunTimes2 = need("loadSunTimes");
var addUserPin = need("addUserPin");
var closeSheet2 = need("closeSheet");
var openSheet3 = need("openSheet");
var closeUni = need("closeUni");
var detectMyRegion = need("detectMyRegion");
var loadClaims = need("loadClaims");
var loadRace = need("loadRace");
var loadVisitCounts = need("loadVisitCounts");
var openQuests = need("openQuests");
var openRace = need("openRace");
var openShooters = need("openShooters");
var openUserSearch = need("openUserSearch");
var openWaiting = need("openWaiting");
var renderMap4 = need("renderMap");
var setView = need("setView");
function initHero4() {
  const el = $("hero");
  if (!el) return;
  try {
    if (localStorage.getItem("sowra_hero_seen")) {
      el.style.display = "none";
      return;
    }
    el.style.display = "block";
  } catch (e) {
    el.style.display = "block";
  }
}
function closeHero() {
  $("hero").style.display = "none";
  try {
    localStorage.setItem("sowra_hero_seen", "1");
  } catch (e) {
  }
}
async function renderHomeHero4() {
  const el = $("homeHero");
  if (!el) return;
  if (!window.__USER_LAT) {
    el.style.display = "none";
    return;
  }
  state.myRegion = detectMyRegion();
  if (!state.myRegion) {
    el.style.display = "block";
    el.innerHTML = `<div class="hh-place">📍 منطقتك بلا صور بعد</div>
      <div class="hh-line">ما وثّق أحدٌ ما حولك — <b>كن أول من يصوّرها</b></div>
      <button class="hh-cta" onclick="go('add')">📷 انشر أول صورة</button>`;
    return;
  }
  const d = (p) => Math.hypot((p.lat - window.__USER_LAT) * 111, (p.lng - window.__USER_LNG) * 111 * Math.cos(window.__USER_LAT * Math.PI / 180));
  const mine = state.photos.filter((p) => p.region === state.myRegion && !p.abroad);
  const near = state.photos.filter((p) => p.lat && p.lng && !p.abroad && d(p) <= 50);
  await loadRace();
  const idx = state.race.findIndex((r) => r.region === state.myRegion);
  const rank = idx >= 0 ? idx + 1 : null;
  const gapTxt = idx > 0 ? `تحتاج <b>${Math.ceil((state.race[idx - 1].total - state.race[idx].total) / 10)}</b> صور لتتجاوز <b>${esc(state.race[idx - 1].region)}</b>` : "";
  el.style.display = "block";
  el.innerHTML = `<div class="hh-place">📍 أنت في ${esc(state.myRegion)}</div>
    <div class="hh-line">${mine.length} صورة من ديرتك · ${near.length} حولك ضمن ٥٠ كم</div>
    ${rank ? `<div class="hh-line" style="margin-top:4px">🏁 ترتيب منطقتك: <b>#${rank}</b>${gapTxt ? " — " + gapTxt : ""}</div>` : ""}
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <button class="hh-cta" onclick="go('add')">📷 وثّق ديرتك</button>
      ${rank ? `<span class="hh-rank" onclick="openRace()">🏆 شوف السباق</span>` : ""}
    </div>`;
}
function renderSponsorSide() {
  const el = $("sponsorSide");
  if (!el) return;
  const sp = state.banner;
  if (!sp || !sp.side_active) {
    el.style.display = "none";
    return;
  }
  el.style.display = "flex";
  el.innerHTML = (sp.image_path ? `<img src="${imgUrl(sp.image_path)}" alt="${esc(sp.sponsor_name || "")}">` : "") + `<div class="sp-info">
      <div class="sp-name">${esc(sp.sponsor_name || "راعي المنصة")}</div>
      <div class="sp-cat">${esc(sp.sponsor_cat || "")}</div>
    </div>
    <button class="sp-side-btn" onclick="openSponsorsPage()">عروضنا ←</button>`;
}
async function loadWeatherTip4() {
  const wel = $("weatherTip");
  if (!window.__USER_LAT) {
    if (wel) wel.style.display = "none";
    return;
  }
  const el = $("weatherTip");
  if (!el) return;
  try {
    const u = `https://api.open-meteo.com/v1/forecast?latitude=${window.__USER_LAT}&longitude=${window.__USER_LNG}&current=temperature_2m,weather_code,cloud_cover,is_day&daily=sunset,sunrise&timezone=auto`;
    const r = await fetch(u);
    const d = await r.json();
    const c = d.current;
    if (!c) return;
    const code = c.weather_code, temp = Math.round(c.temperature_2m), cloud = c.cloud_cover;
    const isDay = c.is_day === 1;
    const now = /* @__PURE__ */ new Date();
    const sunset = d.daily && d.daily.sunset ? new Date(d.daily.sunset[0]) : null;
    const sunrise = d.daily && d.daily.sunrise ? new Date(d.daily.sunrise[0]) : null;
    const minsToSunset = sunset ? Math.round((sunset - now) / 6e4) : null;
    const minsToSunrise = sunrise ? Math.round((sunrise - now) / 6e4) : null;
    let ic, wState, adv;
    if (!isDay) {
      ic = "🌙";
      wState = "ليل";
      if (cloud < 30) adv = "سماء صافية — فرصة لتصوير النجوم ودرب التبانة ✨";
      else if (cloud < 70) adv = "غيوم متفرقة — جرّب تصوير أضواء المدينة";
      else adv = "سماء غائمة — التصوير الليلي صعب الليلة";
      if (code >= 45 && code <= 48) {
        ic = "🌫️";
        wState = "ضباب ليلي";
        adv = "الضباب مع أضواء الشارع = لقطات غامضة جميلة";
      }
      if (minsToSunrise !== null && minsToSunrise > 0 && minsToSunrise < 90) {
        ic = "🌄";
        wState = "قبل الشروق";
        adv = "الشروق بعد " + minsToSunrise + " دقيقة — استعد للساعة الذهبية";
      }
    } else {
      ic = "☀️";
      wState = "صافٍ";
      adv = "إضاءة قوية — صوّر في الظل أو انتظر الساعة الذهبية";
      if (code >= 45 && code <= 48) {
        ic = "🌫️";
        wState = "ضباب";
        adv = "الضباب فرصة ذهبية للقطات دراماتيكية — اخرج الآن!";
      } else if (code >= 51 && code <= 67) {
        ic = "🌧️";
        wState = "مطر";
        adv = "بعد المطر: انعكاسات وألوان مشبعة";
      } else if (code >= 71 && code <= 77) {
        ic = "🌨️";
        wState = "ثلج";
        adv = "مشهد نادر — وثّقه قبل ما يذوب";
      } else if (code >= 95) {
        ic = "⛈️";
        wState = "عاصفة";
        adv = "السلامة أولاً — صوّر من مكان آمن";
      } else if (cloud > 70) {
        ic = "☁️";
        wState = "غائم";
        adv = "إضاءة ناعمة مثالية للتفاصيل والبورتريه";
      } else if (cloud > 30) {
        ic = "⛅";
        wState = "غيوم متفرقة";
        adv = "سماء درامية — وقت ممتاز للمناظر الواسعة";
      }
      if (minsToSunset !== null && minsToSunset > 0 && minsToSunset < 90) {
        ic = "🌅";
        wState = "قبل الغروب";
        adv = "الساعة الذهبية — بعد " + minsToSunset + " دقيقة أجمل ضوء لليوم";
      }
      if (temp >= 42) {
        adv = "الحر شديد (" + temp + "°) — صوّر بالصباح الباكر أو قبل المغرب";
      }
    }
    el.style.display = "flex";
    el.innerHTML = `<div class="wt-ic">${ic}</div>
      <div class="wt-txt">
        <div class="wt-now">${wState} · ${temp}°</div>
        <div class="wt-adv">${adv}</div>
      </div>`;
  } catch (e) {
  }
}
var _posPending = false;
var _posLastTry = 0;
function ensurePos2(force) {
  if (_posPending) return;
  if (!navigator.geolocation) return;
  const now = Date.now();
  if (!force && now - _posLastTry < 1e4) return;
  _posLastTry = now;
  _posPending = true;
  navigator.geolocation.getCurrentPosition((pos) => {
    _posPending = false;
    window.__USER_LAT = pos.coords.latitude;
    window.__USER_LNG = pos.coords.longitude;
    try {
      maybePopNear();
    } catch (e) {
    }
  }, (err) => {
    _posPending = false;
    console.warn("[near] تعذّر تحديد الموقع — code " + err.code + " · " + err.message);
  }, { enableHighAccuracy: false, maximumAge: 6e4, timeout: 15e3 });
}
var POP_KM = 2;
var _watchId = null;
function poppedIds() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem("near_popped") || "[]"));
  } catch (e) {
    return /* @__PURE__ */ new Set();
  }
}
function markPopped(id) {
  const s = poppedIds();
  s.add(id);
  try {
    sessionStorage.setItem("near_popped", JSON.stringify([...s]));
  } catch (e) {
  }
}
function nearPopEnsure() {
  if (document.getElementById("nearPop")) return;
  const css = document.createElement("style");
  css.id = "nearPopCss";
  css.textContent = `
  #nearPop{position:fixed;inset:0;z-index:9998;display:none;align-items:center;justify-content:center;
    background:rgba(36,31,28,.55);backdrop-filter:blur(3px);padding:24px}
  #nearPop.show{display:flex}
  #nearPop .np-card{background:var(--card);border:2px solid var(--palm);border-radius:20px;
    overflow:hidden;max-width:340px;width:100%;box-shadow:0 10px 34px rgba(36,31,28,.3);
    font-family:'Tajawal',sans-serif;animation:npIn .2s ease-out}
  @keyframes npIn{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:none}}
  #nearPop .np-img{width:100%;height:160px;object-fit:cover;display:block;background:var(--card2)}
  #nearPop .np-bd{padding:16px 18px 14px;text-align:center}
  #nearPop .np-kick{font-size:12px;font-weight:700;color:var(--palm);margin-bottom:6px}
  #nearPop .np-ttl{font-family:'Reem Kufi',sans-serif;font-size:18px;color:var(--txt);margin-bottom:4px}
  #nearPop .np-sub{font-size:12.5px;color:var(--txt-dim);line-height:1.9}
  #nearPop .np-btns{display:flex;gap:8px;margin-top:16px}
  #nearPop .np-hint{font-size:11px;color:var(--txt-dim);margin-top:11px;opacity:.85}
  #nearPop .np-btn{flex:1;padding:12px;border-radius:13px;border:1px solid var(--line);
    background:var(--card2);color:var(--txt);font-family:'Tajawal';font-size:14px;font-weight:700;cursor:pointer}
  #nearPop .np-btn.main{background:var(--palm);border-color:var(--palm);color:#fff}
  `;
  document.head.appendChild(css);
  const el = document.createElement("div");
  el.id = "nearPop";
  el.innerHTML = '<div class="np-card"><img class="np-img" alt=""><div class="np-bd"><div class="np-kick"></div><div class="np-ttl"></div><div class="np-sub"></div><div class="np-btns"></div><div class="np-hint">تقدر تطفي هذا التنبيه من «فلتر ← ما يظهر بالرئيسية»</div></div></div>';
  el.addEventListener("click", (ev) => {
    if (ev.target === el) closeNearPop2();
  });
  document.body.appendChild(el);
}
function closeNearPop2() {
  const el = document.getElementById("nearPop");
  if (el) el.classList.remove("show");
}
function nearPop(p, km, total) {
  nearPopEnsure();
  const el = document.getElementById("nearPop");
  const n = total || 1;
  const dt = km < 1 ? Math.round(km * 1e3) + " متر" : km.toFixed(1) + " كم";
  el.querySelector(".np-img").src = thumbUrl(p.image_path);
  el.querySelector(".np-img").onerror = function() {
    this.onerror = null;
    this.src = imgUrl(p.image_path);
  };
  el.querySelector(".np-kick").textContent = n > 1 ? "📍 أنت قرب " + n + " " + (n === 2 ? "صورتين" : n < 11 ? "صور" : "صورة") : "📍 أنت قرب مكان مصوَّر";
  el.querySelector(".np-ttl").textContent = p.title || "";
  el.querySelector(".np-sub").innerHTML = esc(p.village || p.city || "") + " · أقربها على بعد <b>" + dt + "</b>" + (km <= 0.5 ? "<br>تقدر توثّق زيارتك الآن 👣" : "<br>اقترب أكثر لتوثيق الزيارة");
  const bw = el.querySelector(".np-btns");
  bw.innerHTML = "";
  const open = document.createElement("button");
  open.className = "np-btn main";
  open.textContent = n > 1 ? "افتح الأقرب" : "افتحها";
  open.onclick = () => {
    closeNearPop2();
    try {
      openSheet3(p.id);
    } catch (e) {
    }
  };
  if (n > 1) {
    const all = document.createElement("button");
    all.className = "np-btn";
    all.textContent = "شوفها على الخريطة";
    all.onclick = () => {
      closeNearPop2();
      try {
        setView("map");
      } catch (e) {
      }
    };
    bw.appendChild(open);
    bw.appendChild(all);
  } else {
    const later = document.createElement("button");
    later.className = "np-btn";
    later.textContent = "لاحقاً";
    later.onclick = () => closeNearPop2();
    bw.appendChild(open);
    bw.appendChild(later);
  }
  el.classList.add("show");
}
function maybePopNear() {
  const el = document.getElementById("nearPop");
  if (el && el.classList.contains("show")) return;
  try {
    if (typeof getViewPrefs2 === "function" && getViewPrefs2().near === false) return;
  } catch (e) {
  }
  try {
    if (sessionStorage.getItem("near_hidden") === "1") return;
  } catch (e) {
  }
  const lat = window.__USER_LAT, lng = window.__USER_LNG;
  if (!lat || !lng) return;
  const me = typeof currentUser === "function" ? currentUser() : null;
  const seen = poppedIds();
  const d = (p) => Math.hypot(((p.lat || 0) - lat) * 111, ((p.lng || 0) - lng) * 111 * Math.cos(lat * Math.PI / 180));
  const inRange = (state.photos || []).filter((p) => p.lat && p.lng && !p.abroad && p.media_type !== "video" && p.visibility !== "private" && !(me && p.user_id === me.id) && d(p) <= POP_KM).sort((a, b) => d(a) - d(b));
  const fresh = inRange.filter((p) => !seen.has(p.id));
  if (!fresh.length) return;
  inRange.forEach((p) => markPopped(p.id));
  nearPop(fresh[0], d(fresh[0]), fresh.length);
}
var NEAR_TICK = 2e4;
function readPosOnce() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition((pos) => {
    window.__USER_LAT = pos.coords.latitude;
    window.__USER_LNG = pos.coords.longitude;
    try {
      maybePopNear();
    } catch (e) {
    }
  }, (err) => {
    console.warn("[near] تعذّر تحديد الموقع — code " + err.code + " · " + err.message);
    if (err.code === 1) stopNearWatch2();
  }, { enableHighAccuracy: false, maximumAge: 1e4, timeout: 15e3 });
}
function startNearWatch2() {
  if (_watchId !== null) return;
  if (!navigator.geolocation) return;
  try {
    if (typeof getViewPrefs2 === "function" && getViewPrefs2().near === false) return;
  } catch (e) {
  }
  _watchId = setInterval(readPosOnce, NEAR_TICK);
  readPosOnce();
}
function stopNearWatch2() {
  if (_watchId === null) return;
  try {
    clearInterval(_watchId);
  } catch (e) {
  }
  _watchId = null;
}
function showNearby4() {
  if (!navigator.geolocation) {
    return;
  }
  navigator.geolocation.getCurrentPosition((pos) => {
    const { latitude: lat, longitude: lng } = pos.coords;
    window.__USER_LAT = lat;
    window.__USER_LNG = lng;
    if (state.map) addUserPin(lat, lng);
    loadWeatherTip4();
    if (typeof loadSunTimes2 === "function" && window.__USER_LAT) loadSunTimes2(window.__USER_LAT, window.__USER_LNG);
    if (typeof renderNewsBanner === "function") renderNewsBanner();
    if (typeof renderHomeHero4 === "function") renderHomeHero4();
    try {
      maybePopNear();
    } catch (e) {
    }
  }, (err) => {
    console.warn("[near] تعذّر تحديد الموقع عند الإقلاع — code " + err.code + " · " + err.message);
  }, { enableHighAccuracy: false, maximumAge: 6e4, timeout: 15e3 });
}
function renderNewsBanner() {
  const el = $("newsBanner");
  if (!el) return;
  const sp = state.banner;
  if (!sp.news_on || !sp.news_title) {
    el.style.display = "none";
    return;
  }
  const nid = sp.news_id || "n" + (sp.news_title || "").length;
  let seen = false;
  try {
    seen = localStorage.getItem("sowra_news_" + nid) === "1";
  } catch (e) {
  }
  if (seen) {
    el.style.display = "none";
    return;
  }
  el.style.display = "block";
  el.innerHTML = `
    <div class="nb-top">
      <span class="nb-tag">✨ جديد</span>
      <button class="nb-x" onclick="dismissNews('${esc(nid)}')">✕</button>
    </div>
    <div class="nb-title">${esc(sp.news_title)}</div>
    ${sp.news_body ? `<div class="nb-body">${esc(sp.news_body)}</div>` : ""}
    <button class="nb-ok" onclick="dismissNews('${esc(nid)}')">✓ فهمت</button>`;
}
function dismissNews(nid) {
  try {
    localStorage.setItem("sowra_news_" + nid, "1");
  } catch (e) {
  }
  const el = $("newsBanner");
  if (el) {
    el.style.transition = "opacity .25s,transform .25s";
    el.style.opacity = "0";
    el.style.transform = "translateY(-10px)";
    setTimeout(() => {
      el.style.display = "none";
    }, 260);
  }
}
state.edGeo = null;
function bumpJoinCounter() {
  try {
    if (currentUser() && !isAnon()) return;
    if (localStorage.getItem("sowra_join_seen") === "1") return;
    state.opened = (state.opened || 0) + 1;
    let total = parseInt(localStorage.getItem("sowra_opens") || "0") || 0;
    total++;
    localStorage.setItem("sowra_opens", String(total));
    if (total >= 8 || state.opened >= 5) setTimeout(showJoinBox2, 900);
  } catch (e) {
  }
}
function showJoinBox2() {
  if (currentUser() && !isAnon()) return;
  try {
    if (localStorage.getItem("sowra_join_seen") === "1") return;
  } catch (e) {
  }
  const el = $("joinBox");
  if (el) el.classList.add("show");
}
function dismissJoin() {
  try {
    localStorage.setItem("sowra_join_seen", "1");
  } catch (e) {
  }
  const el = $("joinBox");
  if (el) el.classList.remove("show");
}
function goJoin() {
  try {
    localStorage.setItem("sowra_join_seen", "1");
  } catch (e) {
  }
  const el = $("joinBox");
  if (el) el.classList.remove("show");
  if (typeof closeSheet2 === "function") closeSheet2();
  go4("acc");
  setTimeout(function() {
    try {
      const o = $("accOut"), i = $("accIn");
      if (o) o.style.display = "block";
      if (i) i.style.display = "none";
      if (typeof accTab2 === "function") accTab2("up");
      const nm = $("accName");
      if (nm) nm.focus();
    } catch (e) {
    }
  }, 260);
}

// js/features/blocks.js
var blocks_exports = {};
__export(blocks_exports, {
  admProfDmBan: () => admProfDmBan,
  blockUser: () => blockUser,
  isBlockedWith: () => isBlockedWith,
  loadMyBlocks: () => loadMyBlocks,
  renderBlockList: () => renderBlockList4,
  unblockUser: () => unblockUser
});
init_db();
init_format();
init_hub();
init_state();
init_ui();
init_places();
var notifyDmBan = need("notifyDmBan");
var openProfile = need("openProfile");
var pushNotify4 = need("pushNotify");
var showJoinBox3 = need("showJoinBox");
var closeDmBox = need("closeDmBox");
var dmUnreadCount4 = need("dmUnreadCount");
var renderInbox4 = need("renderInbox");
async function loadMyBlocks() {
  try {
    if (isAnon()) {
      state.myBlocks = /* @__PURE__ */ new Set();
      return;
    }
    const r = await sb.from("dm_blocks").select("blocked").eq("blocker", currentUser()?.id);
    state.myBlocks = new Set((r.data || []).map((x) => x.blocked));
  } catch (e) {
  }
}
async function isBlockedWith(uid) {
  try {
    if (isAnon()) return false;
    const r = await sb.from("dm_blocks").select("blocker,blocked").or("and(blocker.eq." + currentUser()?.id + ",blocked.eq." + uid + "),and(blocker.eq." + uid + ",blocked.eq." + currentUser()?.id + ")");
    return !!(r.data && r.data.length);
  } catch (e) {
    return false;
  }
}
async function blockUser(uid, name) {
  if (isAnon()) {
    toast("🚫 سجّل مجاناً وتحكّم بمن يراسلك", true);
    showJoinBox3();
    return;
  }
  if (!confirm("حظر " + (name || "هذا العضو") + "؟\n\n· ما يقدر يراسلك\n· ما تقدر تراسله\n· رسائله تختفي من صندوقك")) return;
  const { error } = await sb.from("dm_blocks").insert({ blocker: currentUser()?.id, blocked: uid });
  if (error && error.code !== "23505") {
    toast("تعذر الحظر: " + error.message, true);
    return;
  }
  state.myBlocks.add(uid);
  toast("🚫 انحظر — ما راح يوصلك منه شيء");
  if (typeof closeDmBox === "function") closeDmBox();
  await loadMyBlocks();
  if (typeof renderInbox4 === "function") renderInbox4();
  if (typeof renderBlockList4 === "function") renderBlockList4();
  if (typeof dmUnreadCount4 === "function") dmUnreadCount4();
  if (typeof state.profUid !== "undefined" && state.profUid === uid && typeof openProfile === "function") openProfile(uid);
}
async function unblockUser(uid, name) {
  if (!confirm("فك الحظر عن " + (name || "هذا العضو") + "؟")) return;
  const { error } = await sb.from("dm_blocks").delete().eq("blocker", currentUser()?.id).eq("blocked", uid);
  if (error) {
    toast("تعذر الفك: " + error.message, true);
    return;
  }
  state.myBlocks.delete(uid);
  toast("✅ انفك الحظر");
  await loadMyBlocks();
  renderBlockList4();
  if (typeof renderInbox4 === "function") renderInbox4();
  if (typeof state.profUid !== "undefined" && state.profUid === uid && typeof openProfile === "function") openProfile(uid);
}
async function renderBlockList4() {
  const el = $("blockList");
  if (!el) return;
  if (isAnon()) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = '<div class="loader" style="padding:14px">⏳</div>';
  try {
    const r = await sb.from("dm_blocks").select("blocked,created_at").eq("blocker", currentUser()?.id).order("created_at", { ascending: false });
    const list = r.data || [];
    if (!list.length) {
      el.innerHTML = '<div class="bl-empty">ما حظرت أحداً</div>';
      return;
    }
    const names = {};
    try {
      const ids = list.map((x) => x.blocked);
      const pr = await sb.from("profiles").select("id,display_name").in("id", ids);
      (pr.data || []).forEach((u) => {
        names[u.id] = u.display_name || "مصوّر";
      });
    } catch (e) {
    }
    el.innerHTML = '<div class="bl-lbl">🚫 المحظورون (' + list.length + ")</div>" + list.map((b) => {
      const nm = names[b.blocked] || "مصوّر";
      return `<div class="bl-row">
          <span>${esc(nm)}</span>
          <button onclick="unblockUser('${b.blocked}','${esc(nm).replace(/'/g, "&#39;")}')">فك الحظر</button>
        </div>`;
    }).join("");
  } catch (e) {
    el.innerHTML = '<div class="bl-empty">تعذر التحميل</div>';
  }
}
async function admProfDmBan(uid, ban, name) {
  if (!state.isAdmin) {
    toast("للمشرفين فقط", true);
    return;
  }
  if (typeof isEditor === "function" && !isEditor()) {
    toast("🔒 يحتاج صلاحية أعلى", true);
    return;
  }
  if (!ban && !confirm("رفع المنع عن " + (name || "هذا العضو") + "؟")) return;
  let reason = "";
  if (ban) {
    reason = prompt("سبب المنع (يصل العضو):", "إساءة استخدام الرسائل الخاصة");
    if (reason === null) return;
    reason = (reason || "").trim() || "إساءة استخدام الرسائل الخاصة";
  }
  const { error } = await sb.from("profiles").update({ dm_banned: ban }).eq("id", uid);
  if (error) {
    toast("تعذرت العملية: " + error.message, true);
    return;
  }
  if (typeof notifyDmBan === "function") await notifyDmBan(uid, ban, reason);
  toast(ban ? "🚫 انمنع — وانبلّغ بالسبب" : "✅ انرفع المنع — وانبلّغ");
  if (typeof openProfile === "function") openProfile(uid);
}
state.uniTab = "photos";

// js/features/camera.js
var camera_exports = {};
__export(camera_exports, {
  REC_MAX: () => REC_MAX,
  bindRecBtn: () => bindRecBtn,
  buzz: () => buzz,
  captureVideoFrame: () => captureVideoFrame,
  initRecBtn: () => initRecBtn,
  initTapFocus: () => initTapFocus,
  makeThumbDataUrl: () => makeThumbDataUrl,
  pickMime: () => pickMime,
  recBegin: () => recBegin,
  recClose: () => recClose,
  recCountdown: () => recCountdown,
  recFinish: () => recFinish,
  recFlip: () => recFlip,
  recOpen: () => recOpen,
  recStop: () => recStop,
  recStream: () => recStream,
  recSupported: () => recSupported,
  renderRecFilters: () => renderRecFilters,
  toggleGrid: () => toggleGrid
});
init_db();

// js/core/geo.js
function validPos(p) {
  if (!p) return null;
  const la = Number(p.lat), ln = Number(p.lng);
  if (!isFinite(la) || !isFinite(ln)) return null;
  if (Math.abs(la) > 90 || Math.abs(ln) > 180) return null;
  if (la === 0 && ln === 0) return null;
  return { lat: la, lng: ln };
}
function liveLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, acc: Math.round(p.coords.accuracy) }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8e3, maximumAge: 3e4 }
    );
  });
}
function readExifGPS(file) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = (e) => {
      try {
        const v = new DataView(e.target.result);
        if (v.getUint16(0) !== 65496) return resolve(null);
        let off = 2;
        while (off < v.byteLength - 4) {
          if (v.getUint16(off) === 65505) {
            const tiff = off + 10;
            const little = v.getUint16(tiff) === 18761;
            const g16 = (o) => v.getUint16(o, little), g32 = (o) => v.getUint32(o, little);
            const ifd0 = tiff + g32(tiff + 4);
            let gpsIFD = 0, n = g16(ifd0);
            for (let i = 0; i < n; i++) {
              const en = ifd0 + 2 + i * 12;
              if (g16(en) === 34853) {
                gpsIFD = tiff + g32(en + 8);
                break;
              }
            }
            if (!gpsIFD) return resolve(null);
            let latRef = "N", lngRef = "E", lat = null, lng = null;
            const rat = (o) => {
              const p = tiff + g32(o + 8);
              return [g32(p) / g32(p + 4), g32(p + 8) / g32(p + 12), g32(p + 16) / g32(p + 20)];
            };
            const gn = g16(gpsIFD);
            for (let i = 0; i < gn; i++) {
              const en = gpsIFD + 2 + i * 12, tag = g16(en);
              if (tag === 1) latRef = String.fromCharCode(v.getUint8(en + 8));
              if (tag === 3) lngRef = String.fromCharCode(v.getUint8(en + 8));
              if (tag === 2) lat = rat(en);
              if (tag === 4) lng = rat(en);
            }
            if (!lat || !lng) return resolve(null);
            const toD = (a, ref) => (a[0] + a[1] / 60 + a[2] / 3600) * (ref === "S" || ref === "W" ? -1 : 1);
            return resolve(validPos({ lat: toD(lat, latRef), lng: toD(lng, lngRef) }));
          }
          off += 2 + v.getUint16(off + 2);
        }
        resolve(null);
      } catch (err) {
        resolve(null);
      }
    };
    r.readAsArrayBuffer(file.slice(0, 256 * 1024));
  });
}
async function readExifGPS2(file) {
  try {
    const buf = await file.slice(0, 512 * 1024).arrayBuffer();
    const dv = new DataView(buf);
    if (dv.getUint16(0) !== 65496) return null;
    let off = 2, tiff = 0;
    while (off < dv.byteLength - 4) {
      const marker = dv.getUint16(off);
      if (marker === 65505 && dv.getUint32(off + 4) === 1165519206) {
        tiff = off + 10;
        break;
      }
      if ((marker & 65280) !== 65280) break;
      const len = dv.getUint16(off + 2);
      if (!len) break;
      off += 2 + len;
    }
    if (!tiff) return null;
    const le = dv.getUint16(tiff) === 18761;
    const u16 = (p) => dv.getUint16(p, le);
    const u32 = (p) => dv.getUint32(p, le);
    const ifd0 = tiff + u32(tiff + 4);
    if (ifd0 >= dv.byteLength) return null;
    const n0 = u16(ifd0);
    let gpsOff = 0;
    for (let i = 0; i < n0; i++) {
      const e = ifd0 + 2 + i * 12;
      if (e + 12 > dv.byteLength) break;
      if (u16(e) === 34853) {
        gpsOff = tiff + u32(e + 8);
        break;
      }
    }
    if (!gpsOff || gpsOff >= dv.byteLength) return null;
    const rat = (p) => {
      const a = u32(p), b = u32(p + 4);
      return b ? a / b : 0;
    };
    const g = {};
    const ng = u16(gpsOff);
    for (let i = 0; i < ng; i++) {
      const e = gpsOff + 2 + i * 12;
      if (e + 12 > dv.byteLength) break;
      const tag = u16(e), type = u16(e + 2), cnt = u32(e + 4);
      if (tag === 1 || tag === 3) {
        g[tag] = String.fromCharCode(dv.getUint8(e + 8));
      } else if ((tag === 2 || tag === 4) && type === 5 && cnt === 3) {
        const vo = tiff + u32(e + 8);
        if (vo + 24 <= dv.byteLength) g[tag] = [rat(vo), rat(vo + 8), rat(vo + 16)];
      }
    }
    if (!g[2] || !g[4]) return null;
    const toDeg = (a) => a[0] + a[1] / 60 + a[2] / 3600;
    let lat = toDeg(g[2]), lng = toDeg(g[4]);
    if (g[1] === "S") lat = -lat;
    if (g[3] === "W") lng = -lng;
    return validPos({ lat, lng });
  } catch (e) {
    return null;
  }
}
async function reverseGeo(lat, lng) {
  try {
    const r = await fetch(
      "https://nominatim.openstreetmap.org/reverse?format=json&zoom=12&lat=" + lat + "&lon=" + lng,
      { headers: { "Accept-Language": "ar" } }
    );
    if (!r.ok) return null;
    const j = await r.json();
    const a = j.address || {};
    return {
      region: a.state || a.region || "",
      city: a.city || a.town || a.municipality || a.county || "",
      village: a.village || a.suburb || a.neighbourhood || a.hamlet || "",
      country: a.country || ""
    };
  } catch (e) {
    return null;
  }
}

// js/features/camera.js
init_hub();
init_state();
init_ui();
init_places();
var _FILTERS_ = () => get("FILTERS");
var applyGeo = need("applyGeo");
var ghostClear = need("ghostClear");
var loadGhosts = need("loadGhosts");
var renderFilterRow = need("renderFilterRow");
var showClearBtn = need("showClearBtn");
var syncPublishBtn = need("syncPublishBtn");
var go5 = need("go");
var buildMixedStream = need("buildMixedStream");
var loadMusicList = need("loadMusicList");
var renderMusicChips = need("renderMusicChips");
var stopMixer = need("stopMixer");
var stopMusicPreview = need("stopMusicPreview");
var recStream = null;
state.recStart = 0;
state.recorder = null;
state.recChunks = [];
state.recTimer = null;
state.recFacing = "environment";
state.pendingMusicName = "";
var REC_MAX = 30;
function recSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
}
function initRecBtn() {
  const b = $("recOpenBtn");
  if (!b) return;
  b.style.display = videoAllowed() && recSupported() ? "flex" : "none";
}
async function recOpen() {
  if (!videoAllowed()) {
    toast("رفع المقاطع مغلق حالياً 🎬", true);
    return;
  }
  if (!recSupported()) {
    toast("جهازك ما يدعم التسجيل الداخلي — استخدم المعرض", true);
    return;
  }
  try {
    recStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: state.recFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true
    });
  } catch (e) {
    toast("تعذر فتح الكاميرا — تأكد من الإذن", true);
    return;
  }
  const pv = $("recPreview");
  pv.srcObject = recStream;
  $("recScreen").classList.add("on");
  setTimeout(function() {
    try {
      if (typeof loadGhosts === "function") loadGhosts();
    } catch (e) {
    }
  }, 800);
  document.body.style.overflow = "hidden";
  $("recFill").style.width = "0%";
  $("recTimer").textContent = "00:00";
  $("recTimer").classList.remove("live");
  $("recHint").textContent = "اضغط مطولاً للتسجيل";
  state.pickedMusic = null;
  state.ownMusicFile = null;
  state.recFilter = "none";
  const pv2 = $("recPreview");
  if (pv2) {
    pv2.style.filter = "none";
    pv2.style.webkitFilter = "none";
  }
  loadMusicList().then(renderMusicChips);
  renderRecFilters();
  initTapFocus();
  bindRecBtn();
}
function recClose() {
  if (typeof ghostClear === "function") ghostClear();
  const _gb = document.getElementById("ghostBar");
  if (_gb) _gb.style.display = "none";
  recStop(true);
  stopMusicPreview();
  stopMixer();
  state.ownMusicFile = null;
  if (recStream) {
    recStream.getTracks().forEach((t) => t.stop());
    recStream = null;
  }
  $("recScreen").classList.remove("on");
  document.body.style.overflow = "";
}
async function recFlip() {
  state.recFacing = state.recFacing === "environment" ? "user" : "environment";
  if (recStream) recStream.getTracks().forEach((t) => t.stop());
  try {
    recStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: state.recFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true
    });
    $("recPreview").srcObject = recStream;
  } catch (e) {
    toast("تعذر تبديل الكاميرا", true);
  }
}
function pickMime() {
  const opts = ["video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  for (const m of opts) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return "";
}
function buzz(ms) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch (e) {
  }
}
async function recCountdown() {
  const el = $("recCount");
  if (!el) return;
  el.classList.add("on");
  for (let n = 3; n >= 1; n--) {
    el.textContent = n;
    buzz(30);
    await new Promise((r) => setTimeout(r, 700));
  }
  el.classList.remove("on");
  el.textContent = "";
}
async function recBegin() {
  if (!recStream || state.recorder) return;
  state.recChunks = [];
  stopMusicPreview();
  await recCountdown();
  if (!recStream) return;
  const mime = pickMime();
  let target = recStream;
  try {
    target = await buildMixedStream(recStream);
  } catch (e) {
  }
  try {
    state.recorder = mime ? new MediaRecorder(target, { mimeType: mime, videoBitsPerSecond: 25e5 }) : new MediaRecorder(target);
  } catch (e) {
    toast("تعذر بدء التسجيل", true);
    stopMixer();
    return;
  }
  state.recorder.ondataavailable = (e) => {
    if (e.data && e.data.size) state.recChunks.push(e.data);
  };
  state.recorder.onstop = recFinish;
  state.recorder.start(200);
  buzz(60);
  state.recStart = Date.now();
  $("recBtn").classList.add("recording");
  const _h = document.getElementById("recHint");
  if (_h) _h.textContent = "● يسجّل — اضغط الزر للإيقاف";
  $("recTimer").classList.add("live");
  $("recHint").textContent = "ارفع إصبعك للإيقاف";
  state.recTimer = setInterval(() => {
    const s = (Date.now() - state.recStart) / 1e3;
    const pct = Math.min(100, s / REC_MAX * 100);
    $("recFill").style.width = pct + "%";
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(Math.floor(s % 60)).padStart(2, "0");
    $("recTimer").textContent = mm + ":" + ss;
    if (s >= REC_MAX) recStop();
  }, 100);
}
function recStop(silent) {
  state.recStart = null;
  if (state.recTimer) {
    clearInterval(state.recTimer);
    state.recTimer = null;
    if (!silent) buzz([40, 40, 40]);
  }
  stopMixer();
  $("recBtn").classList.remove("recording");
  const _h2 = document.getElementById("recHint");
  if (_h2) _h2.textContent = "اضغط الزر لبدء التسجيل";
  $("recTimer").classList.remove("live");
  $("recHint").textContent = "اضغط مطولاً للتسجيل";
  if (state.recorder && state.recorder.state !== "inactive") {
    if (silent) state.recorder.onstop = null;
    state.recorder.stop();
  }
  if (silent) state.recorder = null;
}
async function recFinish() {
  const secs = (Date.now() - state.recStart) / 1e3;
  state.recorder = null;
  if (secs < 1.2) {
    toast("التسجيل قصير جداً — ثانية على الأقل", true);
    state.recChunks = [];
    return;
  }
  const type = state.recChunks[0]?.type || "video/mp4";
  const ext = type.includes("mp4") ? "mp4" : "webm";
  const blob = new Blob(state.recChunks, { type });
  state.recChunks = [];
  if (blob.size > 25 * 1024 * 1024) {
    toast("الفيديو كبير — سجّل مدة أقصر", true);
    return;
  }
  state.pendingMusicName = state.pickedMusic ? state.pickedMusic.name : "";
  if (state.recFilter && state.recFilter !== "none") state.curFilter = state.recFilter;
  state.pendingVideo = new File([blob], "rec." + ext, { type });
  state.pendingFile = null;
  state.pendingBlob = null;
  recClose();
  go5("add");
  $("drop").style.display = "block";
  const _im2 = $("preview");
  if (_im2) {
    _im2.removeAttribute("src");
    _im2.style.display = "none";
  }
  const pv = $("videoPreview");
  if (pv) {
    pv.src = URL.createObjectURL(blob);
    pv.style.display = "block";
  }
  $("dropTxt").textContent = "🎬 تسجيل جاهز (" + Math.round(secs) + " ثانية)";
  $("drop").classList.add("has");
  showClearBtn();
  syncPublishBtn();
  state.curFilter = "none";
  const _vurl = pv ? pv.src : URL.createObjectURL(state.pendingVideo);
  try {
    renderFilterRow(null, true, _vurl);
  } catch (e) {
  }
  captureVideoFrame(state.pendingVideo).then((t) => {
    if (t) renderFilterRow(t, true);
  }).catch(() => {
  });
  $("geoCard").style.display = "block";
  $("geoCard").classList.remove("warn");
  $("geoStatus").textContent = "⏳ جاري تحديد الموقع...";
  $("geoCoords").textContent = "";
  const pos = await liveLocation();
  applyGeo(pos, "live");
  toast("انتهى التسجيل — أضف العنوان وانشر 🎬");
}
function bindRecBtn() {
  const b = $("recBtn");
  if (!b || b._bound) return;
  b._bound = true;
  const toggle = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (state.recorder) {
      if (state.recStart && Date.now() - state.recStart < 2e3) {
        toast("سجّل ثانيتين على الأقل", true);
        return;
      }
      recStop();
    } else {
      state.recStart = Date.now();
      recBegin().catch(() => {
      });
    }
  };
  b.addEventListener("click", toggle);
  b.addEventListener("touchstart", function(e) {
    e.stopPropagation();
  }, { passive: true });
}
function captureVideoFrame(file) {
  return new Promise((res) => {
    try {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.muted = true;
      v.playsInline = true;
      v.onloadeddata = () => {
        try {
          v.currentTime = Math.min(0.6, (v.duration || 1) / 3);
        } catch (e) {
          res(null);
        }
      };
      v.onseeked = () => {
        try {
          const cv = document.createElement("canvas");
          const s = Math.min(1, 160 / Math.max(v.videoWidth, v.videoHeight));
          cv.width = Math.round(v.videoWidth * s);
          cv.height = Math.round(v.videoHeight * s);
          cv.getContext("2d").drawImage(v, 0, 0, cv.width, cv.height);
          URL.revokeObjectURL(v.src);
          res(cv.toDataURL("image/jpeg", 0.7));
        } catch (e) {
          res(null);
        }
      };
      v.onerror = () => res(null);
      v.src = URL.createObjectURL(file);
    } catch (e) {
      res(null);
    }
  });
}
function makeThumbDataUrl(file) {
  return new Promise((res) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const s = Math.min(1, 160 / Math.max(img.width, img.height));
          const cv = document.createElement("canvas");
          cv.width = Math.max(1, Math.round(img.width * s));
          cv.height = Math.max(1, Math.round(img.height * s));
          cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
          URL.revokeObjectURL(img.src);
          res(cv.toDataURL("image/jpeg", 0.72));
        } catch (e) {
          res(null);
        }
      };
      img.onerror = () => res(null);
      img.src = URL.createObjectURL(file);
    } catch (e) {
      res(null);
    }
  });
}
function toggleGrid() {
  const g = $("recGrid");
  if (g) g.classList.toggle("on");
}
function initTapFocus() {
  const pv = $("recPreview");
  if (!pv || pv._focusBound) return;
  pv._focusBound = true;
  pv.addEventListener("click", async (e) => {
    if (!recStream) return;
    const track = recStream.getVideoTracks()[0];
    if (!track) return;
    const rect = pv.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    let ring = document.getElementById("recFocus");
    if (!ring) {
      ring = document.createElement("div");
      ring.id = "recFocus";
      ring.className = "rec-focus";
      $("recScreen").appendChild(ring);
    }
    ring.style.left = e.clientX - rect.left - 38 + "px";
    ring.style.top = e.clientY - rect.top - 38 + "px";
    ring.classList.remove("on");
    void ring.offsetWidth;
    ring.classList.add("on");
    setTimeout(() => ring.classList.remove("on"), 900);
    buzz(20);
    try {
      const caps = track.getCapabilities ? track.getCapabilities() : {};
      if (caps.focusMode && caps.focusMode.includes("manual") && caps.pointsOfInterest) {
        await track.applyConstraints({ advanced: [{ pointsOfInterest: [{ x, y }], focusMode: "manual" }] });
      } else if (caps.focusMode && caps.focusMode.includes("single-shot")) {
        await track.applyConstraints({ advanced: [{ focusMode: "single-shot" }] });
      }
    } catch (err) {
    }
  });
}
state.recFilter = "none";
function renderRecFilters() {
  const el = $("recFilters");
  if (!el) return;
  el.innerHTML = "";
  _FILTERS_().forEach((f) => {
    const b = document.createElement("button");
    b.className = "rf-chip" + (state.recFilter === f.k ? " on" : "");
    b.textContent = f.n;
    const setF = function(ev) {
      if (ev) {
        ev.preventDefault();
        ev.stopPropagation();
      }
      state.recFilter = f.k;
      const pv = $("recPreview");
      if (pv) {
        pv.style.filter = f.css;
        pv.style.webkitFilter = f.css;
      }
      renderRecFilters();
    };
    b.addEventListener("touchend", setF, { passive: false });
    b.addEventListener("click", setF);
    el.appendChild(b);
  });
}

// js/features/claims.js
var claims_exports = {};
__export(claims_exports, {
  claimBadge: () => claimBadge2,
  claimDelete: () => claimDelete,
  claimVote: () => claimVote,
  loadClaims: () => loadClaims2,
  renderClaim: () => renderClaim
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var go6 = need("go");
var pushNotify5 = need("pushNotify");
var render5 = need("render");
async function loadClaims2() {
  try {
    const r = await sb.from("claims").select("id,photo_id,place_name").eq("active", true);
    claimSt.claimMap = {};
    const list = r.data || [];
    if (!list.length) return;
    const ids = list.map((c) => c.id);
    let votes = [];
    try {
      const v = await sb.from("claim_votes").select("claim_id,stance").in("claim_id", ids);
      votes = v.data || [];
    } catch (e) {
    }
    list.forEach((c) => {
      const mine = votes.filter((v) => v.claim_id === c.id);
      const sup = mine.filter((v) => v.stance === "support").length;
      const dbt = mine.filter((v) => v.stance === "doubt").length;
      let claimSt2 = "new";
      if (sup >= 3 && sup > dbt * 2) claimSt2 = "verified";
      else if (dbt > sup && dbt >= 2) claimSt2 = "doubted";
      claimSt2.claimMap[c.photo_id] = { name: c.place_name, sup, dbt, claimSt: claimSt2 };
    });
  } catch (e) {
  }
}
function claimBadge2(pid, small) {
  const c = typeof state.claimMap !== "undefined" && state.claimMap ? state.claimMap[pid] : null;
  if (!c) return "";
  const cfg = {
    verified: { cls: "ok", ic: "🏅", t: "أول موثّق" },
    doubted: { cls: "dbt", ic: "❓", t: "سبق موضع شك" },
    new: { cls: "new", ic: "🏅", t: "سبق" }
  }[c.state];
  return '<div class="mc-claim ' + cfg.cls + (small ? " sm" : "") + '">' + cfg.ic + " " + cfg.t + (c.sup ? "<b>" + c.sup + "</b>" : "") + "</div>";
}
async function renderClaim(p) {
  const el = $("claimBox");
  if (!el) return;
  el.innerHTML = "";
  try {
    const r = await sb.from("claims").select("*").eq("photo_id", p.id).eq("active", true).maybeSingle();
    const c = r.data;
    if (!c) return;
    const v = await sb.from("claim_votes").select("user_id,stance,note,profiles!user_id(display_name)").eq("claim_id", c.id);
    const votes = v.data || [];
    const sup = votes.filter((x) => x.stance === "support").length;
    const dbt = votes.filter((x) => x.stance === "doubt").length;
    const tot = sup + dbt || 1;
    const mine = currentUser() ? votes.find((x) => x.user_id === currentUser()?.id) : null;
    const isOwner2 = !!(currentUser() && c.user_id === currentUser()?.id);
    const days = Math.ceil((new Date(c.expires_at) - /* @__PURE__ */ new Date()) / 864e5);
    const notes = votes.filter((x) => x.note && x.note.trim());
    let claimSt2 = "new";
    if (sup >= 3 && sup > dbt * 2) claimSt2 = "verified";
    else if (dbt > sup && dbt >= 2) claimSt2 = "doubted";
    const stCfg = {
      verified: { cls: "ok", ic: "🏅", t: "أول موثّق — تحقّق منه الجمهور" },
      doubted: { cls: "dbt", ic: "❓", t: "سبق موضع شك" },
      new: { cls: "new", ic: "🏅", t: "ادّعاء سبق — بانتظار الجمهور" }
    }[claimSt2];
    el.innerHTML = `<div class="claim-box ${stCfg.cls}">
      <div class="claim-state">${stCfg.ic} ${stCfg.t}</div>
      <div class="claim-head">
        <span class="claim-place">📍 ${esc(c.place_name)}</span>
      </div>
      <div class="claim-reason">${esc(c.reason)}</div>
      ${c.lat && c.lng ? `<a class="mapbtn" href="https://maps.google.com/?q=${c.lat},${c.lng}" target="_blank" rel="noopener" style="margin-bottom:10px">🗺️ إحداثيات السبق</a>` : ""}
      <div class="claim-bar">
        <div class="sup" style="width:${sup / tot * 100}%"></div>
        <div class="dbt" style="width:${dbt / tot * 100}%"></div>
      </div>
      <div class="claim-nums">
        <span class="s">✅ ${sup} مؤيّد</span>
        <span class="d">${dbt} مشكّك ❓</span>
      </div>
      ${isOwner2 ? `<div style="font-size:12px;color:var(--txt-dim);text-align:center;padding:6px">هذا سبقك — الجمهور يحكم
        <button onclick="claimDelete(${c.id})" style="background:none;border:none;color:var(--sadu);font-family:'Tajawal';font-size:12px;font-weight:700;cursor:pointer;text-decoration:underline;margin-right:8px">سحب السبق</button></div>` : `<div class="claim-acts">
        <button class="claim-btn sup ${mine && mine.stance === "support" ? "on" : ""}" onclick="claimVote(${c.id},'support',${p.id})">✅ أؤيد</button>
        <button class="claim-btn dbt ${mine && mine.stance === "doubt" ? "on" : ""}" onclick="claimVote(${c.id},'doubt',${p.id})">❓ أشكك</button>
      </div>`}
      ${notes.length ? `<div class="claim-notes">${notes.map((n) => `
        <div class="claim-note ${n.stance === "support" ? "s" : "d"}">
          <b>${n.stance === "support" ? "✅" : "❓"} ${esc(n.profiles?.display_name || "زائر")}</b>${esc(n.note)}
        </div>`).join("")}</div>` : ""}
      <div class="claim-left">${days > 0 ? "باقي " + days + " يوم على انتهاء السبق" : "انتهت مدة السبق"}</div>
    </div>`;
  } catch (e) {
  }
}
async function claimVote(cid, stance, pid) {
  if (isAnon()) {
    toast("سجّل أول عشان تشارك بالحكم", true);
    return;
  }
  const note = prompt(stance === "support" ? "تؤيد السبق — تبي تضيف سبباً؟ (اختياري)" : "تشكك بالسبق — وش سببك؟ (اختياري)");
  if (note === null) return;
  const badN = checkText(note);
  if (badN) {
    toast(badN, true);
    return;
  }
  const { error } = await sb.from("claim_votes").upsert({
    claim_id: cid,
    user_id: currentUser()?.id,
    stance,
    note: (note || "").trim()
  });
  if (error) {
    toast("تعذر التصويت: " + error.message, true);
    return;
  }
  toast(stance === "support" ? "سُجّل تأييدك ✅" : "سُجّل تشكيكك ❓");
  const p = state.photos.find((x) => x.id === pid);
  if (p) renderClaim(p);
}
async function claimDelete(cid) {
  if (!confirm("سحب السبق؟ سيختفي مع كل الأصوات.")) return;
  const { error } = await sb.from("claims").delete().eq("id", cid);
  if (error) {
    dbErr("سحب المطالبة", error, "تعذر السحب");
    return;
  }
  toast("انسحب السبق");
  await loadClaims2();
  if (state.curPhoto) renderClaim(state.curPhoto);
  render5();
}

// js/features/contest.js
var contest_exports = {};
__export(contest_exports, {
  CHALLENGE: () => CHALLENGE,
  WEEK: () => WEEK,
  catName: () => catName,
  joinChallenge: () => joinChallenge,
  loadChallenge: () => loadChallenge4,
  loadSponsor: () => loadSponsor4,
  loadWeek: () => loadWeek4,
  openSponsorsPage: () => openSponsorsPage2,
  openWeek: () => openWeek,
  renderSponsorsBtn: () => renderSponsorsBtn,
  renderWeek: () => renderWeek,
  voteWeek: () => voteWeek
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var shootThere = need("shootThere");
var applyPendingPlace = need("applyPendingPlace");
var initCommBox = need("initCommBox");
var initGoogleBtn5 = need("initGoogleBtn");
var initInspect = need("initInspect");
var initVideoUpload4 = need("initVideoUpload");
var renderNewsBanner2 = need("renderNewsBanner");
var renderSponsorSide2 = need("renderSponsorSide");
var go7 = need("go");
var WEEK = null;
state.weekMode = "live";
state.weekEntries = [];
state.weekVotes = {};
state.myWeekVote = null;
async function loadWeek4() {
  WEEK = null;
  state.weekMode = "live";
  try {
    const c = await sb.from("weekly_contest").select("*").eq("active", true).order("id", { ascending: false }).limit(1).maybeSingle();
    if (c.data) {
      WEEK = c.data;
    } else {
      const e = await sb.from("weekly_contest").select("*").not("ended_at", "is", null).order("ended_at", { ascending: false }).limit(1).maybeSingle();
      if (e.data && Date.now() - new Date(e.data.ended_at).getTime() < 7 * 24 * 3600 * 1e3) {
        WEEK = e.data;
        state.weekMode = "results";
      }
    }
  } catch (err) {
    WEEK = null;
  }
  const strip = $("weekStrip");
  if (!strip) return;
  if (!WEEK) {
    strip.style.display = "none";
    return;
  }
  strip.style.display = "block";
  if (state.weekMode === "results") {
    const win = state.photos.find((x) => x.id === WEEK.winner_photo_id);
    strip.classList.add("win");
    strip.innerHTML = win ? `👑 <b>فائز لقطة الأسبوع:</b> ${rankOf(win).ic} ${esc(win.photographer)} — «${esc(win.title)}» · شاهد النتيجة` : `🏁 <b>لقطة الأسبوع انتهت</b> — شاهد النتيجة`;
  } else {
    strip.classList.remove("win");
    strip.innerHTML = `🏆 <b>لقطة الأسبوع</b> — شاهد اللقطات الخمس وصوّت ${WEEK.sponsor_name ? "· برعاية " + esc(WEEK.sponsor_name) : ""}`;
  }
}
async function openWeek() {
  if (!WEEK) {
    toast("ما فيه مسابقة حالياً");
    return;
  }
  go7("week");
  $("weekBody").innerHTML = '<div class="empty">⏳</div>';
  const [en, bd, mv] = await Promise.all([
    sb.from("weekly_entries").select("photo_id").eq("contest_id", WEEK.id),
    sb.from("weekly_board").select("*").eq("contest_id", WEEK.id),
    state.weekMode === "live" && currentUser() ? sb.from("weekly_votes").select("photo_id").eq("contest_id", WEEK.id).eq("user_id", currentUser()?.id).maybeSingle() : Promise.resolve({ data: null })
  ]);
  state.weekVotes = {};
  (bd.data || []).forEach((r) => state.weekVotes[r.photo_id] = r.votes);
  state.myWeekVote = mv.data?.photo_id ?? null;
  const ids = (en.data || []).map((e) => e.photo_id);
  state.weekEntries = state.photos.filter((p) => ids.includes(p.id));
  renderWeek();
}
function renderWeek() {
  const results = state.weekMode === "results";
  $("weekTitle").textContent = (results ? "🏁 نتيجة لقطة الأسبوع" : "🏆 لقطة الأسبوع") + (WEEK.week_label ? " — " + WEEK.week_label : "");
  $("weekSponsor").innerHTML = [WEEK.sponsor_name ? `برعاية <b style="color:var(--sadu)">${esc(WEEK.sponsor_name)}</b>` : "", WEEK.prize ? `🎁 الجائزة: ${esc(WEEK.prize)}` : ""].filter(Boolean).join(" · ") || (results ? "" : "صوّت لأجمل لقطة — صوت واحد وتقدر تغيّره");
  const sorted = state.weekEntries.slice().sort((a, b) => (state.weekVotes[b.id] || 0) - (state.weekVotes[a.id] || 0));
  const winId = results ? WEEK.winner_photo_id ?? sorted[0]?.id : sorted[0] && (state.weekVotes[sorted[0].id] || 0) > 0 ? sorted[0].id : null;
  $("weekBody").innerHTML = state.weekEntries.length ? sorted.map((p, i) => {
    const v = state.weekVotes[p.id] || 0, isWin = p.id === winId;
    return `<div class="card wcard ${isWin && results ? "winner" : ""} ${state.myWeekVote === p.id && !results ? "voted" : ""}">
      <div class="ph sq" style="cursor:zoom-in" onclick="openSheet(${p.id})" title="اضغط للتكبير والتفاصيل"><img src="${thumbUrl(p.image_path)}" onerror="this.onerror=null;this.src='${imgUrl(p.image_path)}'" alt="${esc(p.title)}">
        ${isWin ? '<div class="medal">👑 ' + (results ? "الفائز" : "متصدرة") + "</div>" : results ? `<div class="medal">#${i + 1}</div>` : ""}
        <span class="w-zoom">🔍 تكبير</span>
      </div>
      <div class="card-body">
        <div class="card-title">${esc(p.title)}</div>
        <div class="card-meta"><span class="who">${rankOf(p).ic} ${esc(p.photographer)}</span><span>🗳️ ${v} صوت</span></div>
        <!-- زرٌّ صريح لا شارةٌ بالزاوية: الشارة الصغيرة الشفافة تذوب في
             الصورة فلا يجدها الزائر — وقد لا يجدها صاحب التطبيق نفسه.
             وشاشة تحكيم يجب أن تقول ما يُفعل فيها لا أن تُخفيه. -->
        <button class="btn wzoom-btn" onclick="openSheet(${p.id})">🔍 تكبير وتفاصيل</button>
        ${results ? "" : `<button class="btn wvote ${state.myWeekVote === p.id ? "on" : ""}" onclick="voteWeek(${p.id})">${state.myWeekVote === p.id ? "✓ صوتك هنا" : "صوّت لهذه اللقطة"}</button>`}
      </div>
    </div>`;
  }).join("") : '<div class="empty">🎬 اللقطات الخمس تُعلن قريباً — ترقبوا</div>';
}
async function voteWeek(pid) {
  const { error } = await sb.from("weekly_votes").upsert({ contest_id: WEEK.id, user_id: currentUser()?.id, photo_id: pid });
  if (error) {
    dbErr("تصويت لقطة الأسبوع", error, "تعذر التصويت");
    return;
  }
  state.myWeekVote = pid;
  const bd = await sb.from("weekly_board").select("*").eq("contest_id", WEEK.id);
  state.weekVotes = {};
  (bd.data || []).forEach((r) => state.weekVotes[r.photo_id] = r.votes);
  toast("تم تصويتك 🗳️");
  renderWeek();
}
async function loadSponsor4() {
  try {
    const r = await sb.from("site_banner").select("*").eq("id", 1).maybeSingle();
    const b = r.data || null;
    state.banner = b;
    try {
      if (typeof initGoogleBtn5 === "function") initGoogleBtn5();
    } catch (e) {
    }
    try {
      if (typeof renderNewsBanner2 === "function") renderNewsBanner2();
    } catch (e) {
    }
    state.banner = b || {};
    if (typeof renderSponsorSide2 === "function") renderSponsorSide2();
    renderSponsorsBtn();
    if (typeof initGoogleBtn5 === "function") initGoogleBtn5();
    if (typeof initVideoUpload4 === "function") initVideoUpload4();
    if (typeof initCommBox === "function") initCommBox();
    if (typeof initInspect === "function") initInspect();
  } catch (e) {
  }
}
function openSponsorsPage2() {
  go7("sponsors");
  const SP = state.banner;
  const el = $("spBannerPage");
  if (el && SP && SP.active && SP.image_path) {
    el.innerHTML = (SP.link_url ? `<a href="${esc(SP.link_url)}" target="_blank" rel="noopener">` : "") + `<img src="${imgUrl(SP.image_path)}" style="width:100%;aspect-ratio:4/1;object-fit:cover;border-radius:14px;border:1.5px solid var(--line);display:block" alt="راعي المنصة">` + (SP.link_url ? "</a>" : "");
  } else if (el) {
    el.innerHTML = "";
  }
  if (SP && SP.active && SP.image_path) {
    const logo = imgUrl(SP.image_path);
    $("spListPage").innerHTML = `
      <div class="sp-card">
        <div class="sp-card-head">
          ${SP.link_url ? `<a href="${esc(SP.link_url)}" target="_blank" rel="noopener"><img src="${logo}" alt="${esc(SP.sponsor_name || "")}"></a>` : `<img src="${logo}" alt="${esc(SP.sponsor_name || "")}">`}
          <div class="sp-card-info">
            <div class="sp-card-name">${esc(SP.sponsor_name || "الراعي الرسمي")}</div>
            <div class="sp-card-cat">${esc(SP.sponsor_cat || "")}</div>
          </div>
          <span class="sp-tag">⭐ الراعي الرسمي</span>
        </div>
        ${SP.sponsor_deal ? `<div class="sp-card-body"><div class="sp-deal">${esc(SP.sponsor_deal)}${SP.sponsor_code ? `<br><span class="sp-code">${esc(SP.sponsor_code)}</span>` : ""}</div></div>` : ""}
      </div>`;
  } else {
    $("spListPage").innerHTML = `<div class="empty" style="padding:26px 14px">🌟 مقعد الراعي الرسمي بانتظار علامتك</div>`;
  }
}
function renderSponsorsBtn() {
  const btn = $("fdSponsorsBtn");
  if (!btn) return;
  const sp = state.banner;
  btn.style.display = sp && sp.sponsors_btn ? "inline-block" : "none";
}
var CHALLENGE = null;
async function loadChallenge4() {
  const el = $("challengeStrip");
  if (!el) return;
  try {
    const r = await sb.from("challenge").select("*").eq("id", 1).maybeSingle();
    CHALLENGE = r.data || null;
    window.__CH = CHALLENGE || {};
  } catch (e) {
    CHALLENGE = null;
  }
  if (!CHALLENGE || !CHALLENGE.active || !CHALLENGE.title) {
    el.style.display = "none";
    return;
  }
  let left = "";
  if (CHALLENGE.ends_at) {
    const d = Math.ceil((new Date(CHALLENGE.ends_at) - /* @__PURE__ */ new Date()) / 864e5);
    if (d > 0) left = " · باقي " + d + (d === 1 ? " يوم" : " أيام");
    else if (d === 0) left = " · ينتهي اليوم";
    else {
      el.style.display = "none";
      return;
    }
  }
  el.style.display = "block";
  const reg = CHALLENGE.region ? '<span class="ch-tag">📍 ' + esc(CHALLENGE.region) + "</span>" : "";
  const cat = CHALLENGE.cat ? '<span class="ch-tag">' + esc(catName(CHALLENGE.cat)) + "</span>" : "";
  const prize = CHALLENGE.prize ? '<div class="ch-prize">🎁 ' + esc(CHALLENGE.prize) + "</div>" : "";
  el.innerHTML = "🎯 <b>تحدي الأسبوع:</b> " + esc(CHALLENGE.title) + (reg || cat ? '<div class="ch-tags">' + reg + cat + "</div>" : "") + (CHALLENGE.hint ? '<div class="ch-hint">' + esc(CHALLENGE.hint) + "</div>" : "") + prize + '<div class="ch-left">' + left.replace(" · ", "") + '</div><button class="ch-join" onclick="event.stopPropagation();joinChallenge()">📷 شارك بالتحدي</button>';
  el.onclick = function() {
    joinChallenge();
  };
}
function catName(k) {
  const m = {
    nature: "🌿 طبيعة",
    arch: "🏛️ عمارة",
    wildlife: "🦅 طيور وحيوانات",
    people: "👥 أشخاص",
    bw: "⬛ أبيض وأسود",
    landmark: "🕌 معلم",
    heritage: "🏺 تراث",
    other: "📷 أخرى"
  };
  return m[k] || k;
}
function joinChallenge() {
  go7("add");
  const c = window.__CH || {};
  if (c.region && typeof shootThere === "function") {
    window.__pendingPlace = { region: c.region, city: "" };
    if (typeof applyPendingPlace === "function") applyPendingPlace(0);
  }
  setTimeout(function() {
    try {
      if (c.cat && $("aCat")) {
        const co = Array.from($("aCat").options).find((o) => o.value === c.cat);
        if (co) $("aCat").value = c.cat;
      }
      if (c.title && $("aTitle") && !$("aTitle").value.trim()) {
        $("aTitle").placeholder = "تحدي: " + c.title;
      }
      if (typeof toast === "function") toast("🎯 " + c.title + " — صوّر وشارك");
    } catch (e) {
    }
  }, 240);
}

// js/features/edit.js
var edit_exports = {};
__export(edit_exports, {
  closeEdit: () => closeEdit,
  deleteMyPhoto: () => deleteMyPhoto,
  fillEditGeo: () => fillEditGeo,
  openEdit: () => openEdit,
  openEditGeo: () => openEditGeo,
  saveEdit: () => saveEdit,
  translateEdit: () => translateEdit
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var filterCss2 = need("filterCss");
var gpUpdateInfo = need("gpUpdateInfo");
var openAcc3 = need("openAcc");
var bumpJoinCounter2 = need("bumpJoinCounter");
var checkRate = need("checkRate");
var loadPhotos6 = need("loadPhotos");
var logRate = need("logRate");
var moveToVault = need("moveToVault");
var publishFromVault = need("publishFromVault");
var pushNotify6 = need("pushNotify");
var render6 = need("render");
var renderClaim2 = need("renderClaim");
var renderFollow = need("renderFollow");
var renderProfFeed = need("renderProfFeed");
var renderProfTabs = need("renderProfTabs");
var renderVault4 = need("renderVault");
var renderVisits = need("renderVisits");
var setView2 = need("setView");
var shareCard = need("shareCard");
var tagName = need("tagName");
var closeSheet3 = need("closeSheet");
var openSheet4 = need("openSheet");
function openEdit(pid) {
  const p = state.photos.find((x) => x.id === pid) || (state.admPhotos || []).find((x) => x.id === pid);
  if (!p) return;
  const _mine = !!(currentUser() && p.user_id === currentUser()?.id);
  const _owner = isOwner();
  if (!_mine && !_owner) {
    toast("🔒 ما تقدر تعدّل صورة غيرك", true);
    return;
  }
  const isV = p.media_type === "video";
  const el = $("editBox");
  if (!el) return;
  $("edTitle").value = p.title || "";
  const dg = $("edDescGroup");
  if (dg) dg.style.display = isV ? "none" : "block";
  if ($("edDesc")) $("edDesc").value = p.description || "";
  if ($("edCat")) $("edCat").value = p.category || "other";
  $("edLabel").innerHTML = (isV ? "عدّل بيانات المقطع" : "عدّل بيانات الصورة — العنوان والوصف والتصنيف والموقع") + (_mine ? "" : '<div style="font-size:11px;color:var(--sadu);font-weight:700;margin-top:5px">🛡️ تعديل إداري — صورة ' + esc(p.photographer || "عضو") + "</div>");
  state.edTrTitle = p.title_en || "";
  state.edTrDesc = p.description_en || "";
  const pv = $("edTrPreview");
  if (pv) {
    if (state.edTrTitle || state.edTrDesc) {
      pv.style.display = "block";
      pv.innerHTML = (state.edTrTitle ? "<b>Title</b>" + esc(state.edTrTitle) : "") + (state.edTrDesc ? '<div class="d">' + esc(state.edTrDesc) + "</div>" : "");
    } else {
      pv.style.display = "none";
      pv.innerHTML = "";
    }
  }
  const tb = $("edTrBtn");
  if (tb) {
    tb.style.display = isV ? "none" : "block";
    tb.textContent = state.edTrTitle || state.edTrDesc ? "🌐 أعد الترجمة" : "🌐 ترجم للإنجليزية";
  }
  el.dataset.pid = pid;
  el.classList.add("show");
  try {
    fillEditGeo(p);
  } catch (e) {
  }
}
function closeEdit() {
  state.edGeo = null;
  const el = $("editBox");
  if (el) el.classList.remove("show");
}
async function saveEdit() {
  const el = $("editBox");
  if (!el) return;
  const pid = +el.dataset.pid;
  const title = $("edTitle").value.trim();
  const desc = $("edDesc") ? $("edDesc").value.trim() : "";
  if (!title) {
    toast("العنوان ما يصير فاضي", true);
    return;
  }
  const bt = checkText(title);
  if (bt) {
    toast("العنوان: " + bt, true);
    return;
  }
  const bd = checkText(desc, { allowLink: true });
  if (bd) {
    toast("الوصف: " + bd, true);
    return;
  }
  const btn = $("edSave");
  btn.disabled = true;
  btn.textContent = "⏳";
  const upd = { title, description: desc, title_en: state.edTrTitle, description_en: state.edTrDesc };
  if ($("edCat") && $("edCat").value) upd.category = $("edCat").value;
  const g = state.edGeo;
  const cur = state.photos.find((x) => x.id === pid);
  if (g && (!cur || cur.lat !== g.lat || cur.lng !== g.lng)) {
    upd.lat = g.lat;
    upd.lng = g.lng;
  }
  let q = sb.from("photos").update(upd).eq("id", pid);
  const owner = isOwner();
  if (!owner) q = q.eq("user_id", currentUser()?.id);
  const { error } = await q;
  btn.disabled = false;
  btn.textContent = "💾 احفظ";
  if (error) {
    toast("تعذر الحفظ: " + error.message, true);
    return;
  }
  toast("انحفظ التعديل ✅");
  closeEdit();
  await loadPhotos6();
  const fresh = state.photos.find((x) => x.id === pid);
  if (fresh && state.curPhoto && state.curPhoto.id === pid) {
    state.curPhoto = fresh;
    openSheet4(pid);
  }
  render6();
}
async function translateEdit() {
  const t = $("edTitle") ? $("edTitle").value.trim() : "";
  const d = $("edDesc") ? $("edDesc").value.trim() : "";
  if (!t && !d) {
    toast("اكتب العنوان أول", true);
    return;
  }
  const btn = $("edTrBtn");
  btn.disabled = true;
  btn.textContent = "⏳ نترجم...";
  try {
    let data = null, err = null;
    try {
      const res = await sb.functions.invoke("translate", { body: { title: t, description: d } });
      data = res.data;
      err = res.error;
    } catch (e) {
      err = e;
    }
    if (!data || err) {
      const sess = await sb.auth.getSession();
      const tok = sess?.data?.session?.access_token;
      const r = await fetch("https://gquzjaxpqeggknhipmzk.supabase.co/functions/v1/translate", {
        method: "POST",
        headers: Object.assign(
          { "Content-Type": "application/json", "apikey": "sb_publishable_BNp6Fg3VLXa1Pf4V6QjncQ_f496PquX" },
          tok ? { "Authorization": "Bearer " + tok } : {}
        ),
        body: JSON.stringify({ title: t, description: d })
      });
      const raw = await r.text();
      if (!r.ok) throw new Error("HTTP " + r.status);
      data = JSON.parse(raw);
    }
    if (data && data.error) throw new Error(data.error);
    state.edTrTitle = data && data.title_en || "";
    state.edTrDesc = data && data.description_en || "";
    const pv = $("edTrPreview");
    if (pv && (state.edTrTitle || state.edTrDesc)) {
      pv.style.display = "block";
      pv.innerHTML = (state.edTrTitle ? "<b>Title</b>" + esc(state.edTrTitle) : "") + (state.edTrDesc ? '<div class="d">' + esc(state.edTrDesc) + "</div>" : "");
    }
    btn.textContent = "✅ تُرجم — اضغط للإعادة";
    toast("انترجم ✅");
  } catch (e) {
    toast("تعذرت الترجمة — جرّب مرة ثانية", true);
    btn.textContent = "🌐 ترجم للإنجليزية";
  } finally {
    btn.disabled = false;
  }
}
async function deleteMyPhoto(pid, path) {
  const ph = state.photos.find((x) => x.id === pid);
  const _isV = ph && ph.media_type === "video";
  try {
    const r = await sb.from("weekly_entries").select("id").eq("photo_id", pid).maybeSingle();
    if (r && r.data) {
      toast(_isV ? "⚠️ المقطع مرشح بمسابقة — لا يمكن حذفه" : "⚠️ الصورة مرشحة بمسابقة — لا يمكن حذفها الآن", true);
      return;
    }
  } catch (e) {
  }
  if (!confirm(_isV ? "حذف المقطع نهائياً؟ لا يمكن التراجع." : "حذف الصورة نهائياً؟ لا يمكن التراجع.")) return;
  const isVid = ph && ph.media_type === "video";
  try {
    if (isVid) await sb.storage.from("videos").remove([path]);
    else await sb.storage.from("photos").remove(allPaths(path));
  } catch (e) {
  }
  const { error } = await sb.from("photos").delete().eq("id", pid).eq("user_id", currentUser()?.id);
  if (error) {
    toast("تعذر الحذف: " + error.message, true);
    return;
  }
  toast(isVid ? "انحذف المقطع ✅" : "انحذفت الصورة ✅");
  closeSheet3();
  await loadPhotos6();
  if (typeof renderVault4 === "function") renderVault4();
  if (typeof renderProfTabs === "function" && state.profUid) {
    renderProfTabs();
    renderProfFeed();
  }
  if (typeof state.reelsList !== "undefined") state.reelsList = state.photos.filter((x) => x.media_type === "video");
  render6();
}
function fillEditGeo(p) {
  const card = $("edGeoCard"), main = $("edGeoMain"), sub = $("edGeoSub");
  if (!card) return;
  state.edGeo = p.lat && p.lng ? { lat: p.lat, lng: p.lng } : null;
  const place = p.abroad ? p.country || p.city : (p.village ? p.village + " · " : "") + (p.city || "");
  if (state.edGeo) {
    card.classList.remove("warn");
    if (main) main.textContent = place || "موقع محدّد";
    if (sub) sub.textContent = p.lat.toFixed(5) + ", " + p.lng.toFixed(5);
  } else {
    card.classList.add("warn");
    if (main) main.textContent = "⚠️ بلا إحداثيات";
    if (sub) sub.textContent = "اضغط لتحديد المكان على الخريطة";
  }
}
function openEditGeo() {
  const box = $("geoPickBox");
  if (!box) return;
  state.geoPickMode = "edit";
  box.classList.add("show");
  setTimeout(function() {
    try {
      if (!state.gpMap) {
        let c = [23.8859, 45.0792], z = 5;
        if (state.edGeo) {
          c = [state.edGeo.lat, state.edGeo.lng];
          z = 13;
        } else if (state.curPhoto && state.curPhoto.region) {
          const RC = {
            "الرياض": [24.7136, 46.6753, 9],
            "مكة المكرمة": [21.3891, 39.8579, 9],
            "المدينة المنورة": [24.5247, 39.5692, 9],
            "القصيم": [26.326, 43.975, 9],
            "الشرقية": [26.4207, 50.0888, 8],
            "عسير": [18.2465, 42.5117, 9],
            "تبوك": [28.3835, 36.5662, 8],
            "حائل": [27.5219, 41.6907, 9],
            "الحدود الشمالية": [30.9843, 41.0231, 8],
            "جازان": [16.8892, 42.5511, 9],
            "نجران": [17.4924, 44.1277, 9],
            "الباحة": [20.0129, 41.4677, 10],
            "الجوف": [29.7859, 40.2, 8]
          };
          if (RC[state.curPhoto.region]) {
            c = [RC[state.curPhoto.region][0], RC[state.curPhoto.region][1]];
            z = RC[state.curPhoto.region][2];
          }
        }
        state.gpMap = L.map("gpMap", { zoomControl: true, attributionControl: false }).setView(c, z);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(state.gpMap);
        try {
          state.photos.filter((p) => p.lat && p.lng && !p.abroad).slice(0, 120).forEach((p) => {
            const ic = L.divIcon({ className: "", html: '<div style="width:22px;height:22px;border-radius:50%;overflow:hidden;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"><img src="' + thumbUrl(p.image_path) + '" style="width:100%;height:100%;object-fit:cover"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
            L.marker([p.lat, p.lng], { icon: ic, interactive: false }).addTo(state.gpMap);
          });
        } catch (e) {
        }
        state.gpMap.on("moveend", gpUpdateInfo);
      } else if (state.edGeo) {
        state.gpMap.setView([state.edGeo.lat, state.edGeo.lng], 13);
      }
      state.gpMap.invalidateSize();
      gpUpdateInfo();
    } catch (e) {
    }
  }, 220);
}
state.opened = 0;

// js/features/exif.js
var exif_exports = {};
__export(exif_exports, {
  readExifTech: () => readExifTech,
  renderTechCard: () => renderTechCard
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var captureVideoFrame2 = need("captureVideoFrame");
var checkRaceProgress2 = need("checkRaceProgress");
var checkRate2 = need("checkRate");
var fillAddCities4 = need("fillAddCities");
var loadPhotos7 = need("loadPhotos");
var logRate2 = need("logRate");
var openAcc4 = need("openAcc");
var pushNotify7 = need("pushNotify");
var go8 = need("go");
var maybeAskNotifs4 = need("maybeAskNotifs");
var earlySuggest = need("earlySuggest");
var hideSuggestions = need("hideSuggestions");
var renderFilterRow2 = need("renderFilterRow");
var resetFilter = need("resetFilter");
var runInspection = need("runInspection");
function renderTechCard() {
  const el = $("techCard");
  if (!el) return;
  const t = state.exifTech;
  if (!t) {
    el.style.display = "none";
    return;
  }
  el.style.display = "block";
  const bits = [];
  if (t.camera) bits.push('<span class="tc-cam">📷 ' + esc(t.camera) + "</span>");
  if (t.lens) bits.push('<span class="tc-cam">🔭 ' + esc(t.lens) + "</span>");
  const set = [t.focal, t.aperture, t.shutter, t.iso].filter(Boolean);
  el.innerHTML = `
    <div class="tc-head">
      <span>⚙️ بيانات التصوير</span>
      <label class="tc-sw"><input type="checkbox" id="techShow" checked><span>أظهرها مع الصورة</span></label>
    </div>
    <div class="tc-body">
      ${bits.join("")}
      ${set.length ? '<div class="tc-set">' + set.map((x) => "<span>" + esc(x) + "</span>").join("") + "</div>" : ""}
    </div>`;
}
async function readExifTech(file) {
  try {
    let readTags = function(dirStart, wanted, out2) {
      const n = u16(dirStart);
      for (let i = 0; i < n; i++) {
        const e = dirStart + 2 + i * 12;
        const tag = u16(e), type = u16(e + 2), cnt = u32(e + 4);
        if (!wanted[tag]) continue;
        const key = wanted[tag];
        let valOff = e + 8;
        const sizes = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
        const total = (sizes[type] || 1) * cnt;
        if (total > 4) valOff = tiff + u32(e + 8);
        if (valOff + total > dv.byteLength) continue;
        if (type === 2) {
          let s = "";
          for (let k = 0; k < cnt - 1; k++) {
            const ch = dv.getUint8(valOff + k);
            if (ch) s += String.fromCharCode(ch);
          }
          out2[key] = s.trim();
        } else if (type === 3) {
          out2[key] = u16(valOff);
        } else if (type === 4) {
          out2[key] = u32(valOff);
        } else if (type === 5) {
          const a = u32(valOff), b = u32(valOff + 4);
          if (b) out2[key] = a / b;
        } else if (type === 10) {
          const a = dv.getInt32(valOff, le), b = dv.getInt32(valOff + 4, le);
          if (b) out2[key] = a / b;
        }
      }
    };
    const buf = await file.slice(0, 256 * 1024).arrayBuffer();
    const dv = new DataView(buf);
    if (dv.getUint16(0) !== 65496) return null;
    let off = 2, tiff = 0;
    while (off < dv.byteLength - 4) {
      if (dv.getUint16(off) === 65505) {
        if (dv.getUint32(off + 4) === 1165519206) {
          tiff = off + 10;
          break;
        }
      }
      const len = dv.getUint16(off + 2);
      if (!len) break;
      off += 2 + len;
    }
    if (!tiff) return null;
    const le = dv.getUint16(tiff) === 18761;
    const u16 = (p) => dv.getUint16(p, le);
    const u32 = (p) => dv.getUint32(p, le);
    const out = {};
    const ifd0 = tiff + u32(tiff + 4);
    readTags(ifd0, { 271: "make", 272: "model", 306: "taken" }, out);
    const n0 = u16(ifd0);
    for (let i = 0; i < n0; i++) {
      const e = ifd0 + 2 + i * 12;
      if (u16(e) === 34665) {
        const sub = tiff + u32(e + 8);
        if (sub < dv.byteLength) readTags(sub, {
          33434: "shutter",
          33437: "aperture",
          34855: "iso",
          37386: "focal",
          42036: "lens",
          36867: "taken"
        }, out);
        break;
      }
    }
    const tech = {};
    if (out.make || out.model) {
      let cam = (out.model || "").trim();
      const mk = (out.make || "").trim();
      if (mk && !cam.toLowerCase().startsWith(mk.toLowerCase().split(" ")[0])) cam = mk + " " + cam;
      if (cam) tech.camera = cam.slice(0, 60);
    }
    if (out.lens) tech.lens = String(out.lens).slice(0, 60);
    if (out.focal) tech.focal = Math.round(out.focal) + "mm";
    if (out.aperture) tech.aperture = "f/" + Math.round(out.aperture * 10) / 10;
    if (out.iso) tech.iso = "ISO " + out.iso;
    if (out.shutter) {
      const s = out.shutter;
      tech.shutter = s >= 1 ? Math.round(s * 10) / 10 + "s" : "1/" + Math.round(1 / s);
    }
    return Object.keys(tech).length ? tech : null;
  } catch (e) {
    return null;
  }
}
window.__ghostId = null;

// js/features/favorites.js
var favorites_exports = {};
__export(favorites_exports, {
  loadFavs: () => loadFavs5,
  moveToVault: () => moveToVault2,
  openFavs: () => openFavs,
  publishFromVault: () => publishFromVault2,
  renderFavs: () => renderFavs,
  renderVault: () => renderVault5,
  toggleFav: () => toggleFav
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var openAcc5 = need("openAcc");
var renderAccIn6 = need("renderAccIn");
var go9 = need("go");
var maybeAskNotifs5 = need("maybeAskNotifs");
var checkRaceProgress3 = need("checkRaceProgress");
var closeSheet4 = need("closeSheet");
var loadPhotos8 = need("loadPhotos");
var openSheet5 = need("openSheet");
var pushNotify8 = need("pushNotify");
var refreshOne2 = need("refreshOne");
var render7 = need("render");
var showJoinBox4 = need("showJoinBox");
var renderFollow2 = need("renderFollow");
var renderMyStats4 = need("renderMyStats");
var renderProfFeed2 = need("renderProfFeed");
var renderProfTabs2 = need("renderProfTabs");
async function loadFavs5() {
  if (!currentUser()) return;
  try {
    const r = await sb.from("favorites").select("photo_id").eq("user_id", currentUser()?.id);
    state.favSet = new Set((r.data || []).map((x) => x.photo_id));
  } catch (e) {
  }
}
async function toggleFav(pid) {
  if (!currentUser()) {
    toast("تعذر الحفظ — أعد تحميل الصفحة", true);
    return;
  }
  if (state.favSet.has(pid)) {
    state.favSet.delete(pid);
    await sb.from("favorites").delete().eq("user_id", currentUser()?.id).eq("photo_id", pid);
    toast("انشالت من مفضلتك");
  } else {
    state.favSet.add(pid);
    const { error } = await sb.from("favorites").insert({ user_id: currentUser()?.id, photo_id: pid });
    if (error) {
      state.favSet.delete(pid);
      toast("تعذر الحفظ: " + (error.message || ""), true);
      return;
    }
    toast("انحفظت بمفضلتك ❤️");
  }
  if (state.curPhoto) renderFollow2(state.curPhoto);
  if ($("page-favs").classList.contains("on")) renderFavs();
}
function openFavs() {
  go9("favs");
  renderFavs();
}
function renderFavs() {
  const list = state.photos.filter((p) => state.favSet.has(p.id));
  const el = $("favFeed");
  if (!list.length) {
    el.className = "";
    el.innerHTML = '<div class="empty"><span class="big">🤍</span>مفضلتك فاضية — افتح أي صورة واضغط «حفظ»</div>';
    return;
  }
  el.className = "grid";
  el.innerHTML = list.map((p) => {
    const isV = p.media_type === "video";
    const src = isV ? vidUrl(p.image_path) : thumbUrl(p.image_path);
    return `<div class="mcard" onclick="openSheet(${p.id})">
      ${isV ? `<video src="${src}#t=0.4" muted playsinline preload="metadata"></video>` : `<img src="${src}" loading="lazy" alt="${esc(p.title)}">`}
      ${state.isAdmin ? `<button class="mc-promo" onclick="event.stopPropagation();openPromo(${p.id})" title="انشرها بالسوشال">📢</button>` : ""}
      <div class="mc-overlay">
        <div class="mc-title">${esc(p.title)}</div>
        <div class="mc-sub">${p.abroad ? "🌍 " + esc(p.country || p.city) : "📍 " + esc(p.village || p.city)} · ⭐ ${Number(p.avg_stars).toFixed(1)}</div>
      </div>
    </div>`;
  }).join("");
}
async function renderVault5() {
  const wrap = $("vaultWrap"), el = $("vaultFeed");
  if (!wrap || !el) return;
  if (isAnon()) return;
  try {
    const r = await sb.from("photos").select("id,title,city,village,country,abroad,image_path,media_type,created_at").eq("user_id", currentUser()?.id).eq("visibility", "private").order("created_at", { ascending: false });
    const list = r.data || [];
    if (!list.length) {
      el.innerHTML = '<div class="vault-empty">🔒 خزنتك فاضية<br><span style="font-size:12px">عند النشر اختر «خزنتي» لتحفظ صورك لنفسك أولاً</span></div>';
      return;
    }
    el.innerHTML = list.map((p) => {
      const isV = p.media_type === "video";
      const loc = p.abroad ? p.country || p.city : (p.village ? p.village + " · " : "") + p.city;
      const src = isV ? vidUrl(p.image_path) : thumbUrl(p.image_path);
      return `<div class="vault-item">
        ${isV ? `<video src="${src}#t=0.5" muted playsinline preload="metadata"></video>` : `<img src="${src}" loading="lazy" onerror="this.onerror=null;this.src='${imgUrl(p.image_path)}'">`}
        <div class="vault-info">
          <div class="vault-title">${isV ? "🎬 " : ""}${esc(p.title)}</div>
          <div class="vault-loc">📍 ${esc(loc)}</div>
        </div>
        <button class="vault-pub" onclick="publishFromVault(${p.id})">📢 انشرها</button>
      </div>`;
    }).join("");
  } catch (e) {
  }
}
async function publishFromVault2(pid) {
  const _pv = state.photos.find((x) => x.id === pid);
  const _isVv = _pv && _pv.media_type === "video";
  if (!confirm(_isVv ? "نشر المقطع للجميع؟ بيظهر بالأضواء." : "نشرها للجميع؟ ستدخل الشبكة وتُحتسب لسباق ديرتك.")) return;
  const { error } = await sb.from("photos").update({ visibility: "public" }).eq("id", pid).eq("user_id", currentUser()?.id);
  if (error) {
    toast("تعذر النشر: " + error.message, true);
    return;
  }
  toast(_isVv ? "انتشر المقطع 🎉" : "انتشرت للجميع 🎉");
  if (typeof maybeAskNotifs5 === "function") maybeAskNotifs5();
  setTimeout(() => {
    if (typeof checkRaceProgress3 === "function") checkRaceProgress3();
  }, 2500);
  try {
    const ph = state.photos.find((x) => x.id === pid);
    const nm = (await sb.from("profiles").select("display_name").eq("id", currentUser()?.id).maybeSingle()).data?.display_name || "مصوّر";
    if (ph) {
      const isV = ph.media_type === "video";
      pushNotify8({
        title: isV ? "🎬 مقطع جديد في الأضواء" : "📸 صورة جديدة من " + (ph.city || ph.region || "الديرة"),
        body: ph.title + " — عدسة " + nm,
        url: "/",
        exclude: currentUser()?.id
      });
    }
  } catch (e) {
  }
  if (_pv) _pv.visibility = "public";
  if (state.curPhoto && state.curPhoto.id === pid) state.curPhoto.visibility = "public";
  await loadPhotos8();
  if (typeof renderVault5 === "function") renderVault5();
  if (typeof renderProfTabs2 === "function" && state.profUid) {
    renderProfTabs2();
    renderProfFeed2();
  }
  if (state.curPhoto && state.curPhoto.id === pid) {
    const fresh = state.photos.find((x) => x.id === pid);
    if (fresh) {
      state.curPhoto = fresh;
      openSheet5(pid);
    } else if (typeof closeSheet4 === "function") closeSheet4();
  }
  render7();
  if (typeof renderMyStats4 === "function") renderMyStats4();
}
async function moveToVault2(pid) {
  const _mv = state.photos.find((x) => x.id === pid);
  const _isVm = _mv && _mv.media_type === "video";
  if (!confirm(_isVm ? "سحب المقطع لخزنتك؟ ما راح يشوفه أحد غيرك." : "سحبها لخزنتك؟ ما راح يشوفها أحد غيرك.")) return;
  const { error } = await sb.from("photos").update({ visibility: "private" }).eq("id", pid).eq("user_id", currentUser()?.id);
  if (error) {
    dbErr("سحب المفضلة", error, "تعذر السحب");
    return;
  }
  toast(_isVm ? "انسحب المقطع لخزنتك 🔒" : "انسحبت لخزنتك 🔒");
  if (_mv) _mv.visibility = "private";
  if (state.curPhoto && state.curPhoto.id === pid) state.curPhoto.visibility = "private";
  await loadPhotos8();
  if (typeof renderVault5 === "function") renderVault5();
  if (typeof renderProfTabs2 === "function" && state.profUid) {
    renderProfTabs2();
    renderProfFeed2();
  }
  const fresh = state.photos.find((x) => x.id === pid);
  if (state.curPhoto && state.curPhoto.id === pid) {
    if (fresh) {
      state.curPhoto = fresh;
      openSheet5(pid);
    } else closeSheet4();
  }
  render7();
}

// js/features/feed.js
var feed_exports = {};
__export(feed_exports, {
  RENDER_STEP: () => RENDER_STEP,
  addSentinel: () => addSentinel,
  buildCard: () => buildCard,
  fillAddCities: () => fillAddCities5,
  fillCities: () => fillCities,
  filteredPhotos: () => filteredPhotos,
  initSelects: () => initSelects4,
  loadPhotos: () => loadPhotos9,
  refreshPhotos: () => refreshPhotos2,
  removeSentinel: () => removeSentinel,
  render: () => render8,
  renderBatch: () => renderBatch,
  watchPhotos: () => watchPhotos
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var accTab3 = need("accTab");
var openSponsorsPage3 = need("openSponsorsPage");
var go10 = need("go");
var getViewPrefs3 = need("getViewPrefs");
var loadSunTimes3 = need("loadSunTimes");
var addUserPin2 = need("addUserPin");
var closeSheet5 = need("closeSheet");
var closeUni2 = need("closeUni");
var detectMyRegion2 = need("detectMyRegion");
var loadClaims3 = need("loadClaims");
var loadRace2 = need("loadRace");
var loadVisitCounts2 = need("loadVisitCounts");
var openQuests2 = need("openQuests");
var openRace2 = need("openRace");
var openShooters2 = need("openShooters");
var openUserSearch2 = need("openUserSearch");
var openWaiting2 = need("openWaiting");
var renderMap5 = need("renderMap");
state.draftCat = "all";
state.draftSort = "top";
state.draftScope = "home";
state.scope = "home";
async function loadPhotos9() {
  const { data, error } = await sb.from("photos_ranked").select("*").order("created_at", { ascending: false });
  if (error) {
    $("feed").innerHTML = `<div class="empty"><span class="big">⚠️</span>تعذر تحميل الصور<br>${error.message}</div>`;
    return;
  }
  state.photos = data || [];
  _sig = sigOf(state.photos);
  _lastFull = Date.now();
  try {
    await loadVisitCounts2();
  } catch (e) {
  }
  try {
    await loadClaims3();
  } catch (e) {
  }
  try {
    if (typeof state.viewMode !== "undefined" && state.viewMode === "map") {
      renderMap5();
    } else {
      render8();
    }
  } catch (e) {
    console.warn("render", e);
  }
  watchPhotos();
}
var _ch = null;
var _burst = null;
function watchPhotos() {
  if (_ch) return;
  if (!sb || typeof sb.channel !== "function") return;
  try {
    const hit = () => {
      clearTimeout(_burst);
      _burst = setTimeout(() => {
        refreshPhotos2();
      }, 3e3);
    };
    _ch = sb.channel("sowra-photos").on("postgres_changes", { event: "INSERT", schema: "public", table: "photos" }, hit).on("postgres_changes", { event: "DELETE", schema: "public", table: "photos" }, hit).subscribe((st) => {
      if (st === "SUBSCRIBED") console.info("[حيّ] القناة مفتوحة — الصور الجديدة تصل لحظتها");
      else if (st === "CHANNEL_ERROR" || st === "TIMED_OUT")
        console.warn("[حيّ] تعذّرت القناة (" + st + ") — السؤال الدوري يغطّيها");
    });
  } catch (e) {
    console.warn("[حيّ] تعذّر الاشتراك — السؤال الدوري يغطّيها", e);
    _ch = null;
  }
}
var _sig = "";
var _lastFull = 0;
var FULL_EVERY = 60 * 6e4;
function sigOf(rows) {
  const newest = rows && rows.length ? rows[0].created_at || "" : "";
  return (rows ? rows.length : 0) + "|" + newest;
}
async function refreshPhotos2() {
  if (!state.photos.length) return loadPhotos9();
  if (Date.now() - _lastFull > FULL_EVERY) return loadPhotos9();
  try {
    const r = await sb.from("photos_ranked").select("created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(1);
    if (r.error) return loadPhotos9();
    const sig = (r.count ?? 0) + "|" + (r.data && r.data[0] && r.data[0].created_at || "");
    if (sig === _sig) return;
  } catch (e) {
    return loadPhotos9();
  }
  return loadPhotos9();
}
function initSelects4() {
  const fr = $("fRegion"), ar = $("aRegion");
  fr.innerHTML = '<option value="">كل المناطق</option>';
  ar.innerHTML = '<option value="">اختر المنطقة</option>';
  for (const r in geo.GEO) {
    fr.innerHTML += `<option>${r}</option>`;
    ar.innerHTML += `<option>${r}</option>`;
  }
}
function fillCities() {
  const r = $("fRegion").value, c = $("fCity");
  c.innerHTML = '<option value="">كل المدن</option>';
  if (r && geo.GEO[r]) geo.GEO[r].forEach((x) => c.innerHTML += `<option>${x}</option>`);
}
function fillAddCities5() {
  const r = $("aRegion").value, c = $("aCity");
  c.innerHTML = '<option value="">اختر المدينة</option>';
  if (r && geo.GEO[r]) geo.GEO[r].forEach((x) => c.innerHTML += `<option>${x}</option>`);
  $("villList").innerHTML = (r && geo.VILL[r] ? geo.VILL[r] : []).map((v) => `<option value="${v}">`).join("");
}
function filteredPhotos() {
  const q = ($("q")?.value || "").trim();
  const r = $("fRegion") ? $("fRegion").value : "";
  const c = $("fCity") ? $("fCity").value : "";
  const abroadView = state.scope === "abroad";
  let list = state.photos.filter((p) => !!p.abroad === abroadView && p.media_type !== "video");
  if (state.onlyEc) list = list.filter((p) => p.editors_choice);
  if (state.onlyClaims) list = list.filter((p) => state.claimMap && state.claimMap[p.id]);
  if (state.tags && state.tags.length) {
    list = list.filter((p) => {
      const t = p.tags || [];
      return state.tags.every((k) => t.includes(k));
    });
  }
  if (state.cat !== "all") list = list.filter((p) => (p.category || "other") === state.cat);
  if (abroadView) {
    list = list.filter((p) => !q || (p.title || "").includes(q) || (p.country || "").includes(q));
  } else {
    list = list.filter(
      (p) => (!r || p.region === r) && (!c || p.city === c) && (!q || (p.title || "").includes(q) || (p.village || "").includes(q) || (p.city || "").includes(q) || (p.region || "").includes(q))
    );
  }
  return list;
}
function render8() {
  if (state.viewMode === "map") {
    try {
      renderMap5();
    } catch (e) {
      console.warn("renderMap", e);
    }
    return;
  }
  const mw = $("mapWrap");
  if (mw) mw.style.display = "none";
  $("feed").style.display = "";
  let list = filteredPhotos();
  if (state.sort === "new") {
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (state.sort === "visits") {
    list.sort((a, b) => (state.visitCounts[b.id] || 0) - (state.visitCounts[a.id] || 0) || b.avg_stars - a.avg_stars);
  } else {
    list.sort((a, b) => b.avg_stars - a.avg_stars || b.ratings_count - a.ratings_count || new Date(b.created_at) - new Date(a.created_at));
  }
  $("totalPill").textContent = `${state.photos.length} صورة · V1.2`;
  const feed = $("feed");
  if (!list.length) {
    feed.innerHTML = `<div class="empty"><span class="big">🏜️</span>ما فيه صور بعد..<br>كن أول من يصوّر ديرته! اضغط + وشارك</div>`;
    return;
  }
  window.__renderList = list;
  window.__renderCount = 0;
  feed.innerHTML = "";
  renderBatch();
}
function buildCard(p, i) {
  try {
    const medal = state.sort === "top" && i < 3 && p.ratings_count > 0 ? ["🥇", "🥈", "🥉"][i] : "";
    const isV = p.media_type === "video";
    return `<div class="mcard" onclick="openSheet(${p.id})">
    ${isV ? `<video src="${vidUrl(p.image_path)}#t=0.5" muted playsinline preload="metadata" style="width:100%;display:block;filter:${p.filter_key && p.filter_key !== "none" && typeof filterCss === "function" ? filterCss(p.filter_key) : "none"}"></video>` : `<img src="${thumbUrl(p.image_path)}" onerror="this.onerror=null;this.src='${imgUrl(p.image_path)}'" loading="lazy" decoding="async" alt="${esc(p.title)}">`}
    ${medal ? `<div class="mc-medal">${medal}</div>` : ""}
    ${state.visitCounts[p.id] ? `<div class="mc-visits">👣 ${state.visitCounts[p.id]}</div>` : ""}
    ${p.editors_choice ? '<div class="mc-ec">🏵️ اختيار المحررين</div>' : ""}
    ${claimBadge(p.id)}
    ${p.visibility === "private" ? '<div class="mc-lock">🔒 خاصة</div>' : ""}
    ${p.media_type === "video" ? '<div class="mc-vid">▶</div>' : ""}
    <div class="mc-overlay">
      <div class="mc-title">${esc(p.title)}</div>
      <div class="mc-sub">
        <span class="mc-who" onclick="event.stopPropagation();openProfile('${p.user_id}')">${rankOf(p).ic} ${esc(p.photographer)}</span>
        <span class="mc-dot">·</span>
        <span>${p.abroad ? esc(p.country || p.city) : esc(p.village || p.city)}</span>
        <span class="mc-dot">·</span>
        <span>👁️ ${p.views || 0}</span>
      </div>
    </div>
  </div>`;
  } catch (e) {
    return "";
  }
}
var RENDER_STEP = 24;
function renderBatch() {
  const feed = $("feed");
  if (!feed) return;
  try {
    const list = window.__renderList || [];
    const from = window.__renderCount || 0;
    if (from >= list.length) {
      removeSentinel();
      return;
    }
    const to = Math.min(from + RENDER_STEP, list.length);
    const html = list.slice(from, to).map((p, j) => buildCard(p, from + j)).join("");
    removeSentinel();
    feed.insertAdjacentHTML("beforeend", html);
    window.__renderCount = to;
    if (to < list.length) addSentinel();
  } catch (e) {
    console.warn("renderBatch", e);
    feed.innerHTML = '<div class="empty" style="grid-column:1/-1"><span class="big">⚠️</span>تعذر عرض الصور</div>';
  }
}
function addSentinel() {
  const feed = $("feed");
  if (!feed) return;
  const s = document.createElement("div");
  s.id = "feedSentinel";
  s.className = "feed-sentinel";
  s.innerHTML = '<div class="fs-dot"></div><div class="fs-dot"></div><div class="fs-dot"></div>';
  feed.appendChild(s);
  if (window.__feedObs) window.__feedObs.disconnect();
  window.__feedObs = new IntersectionObserver(function(ents) {
    if (ents[0] && ents[0].isIntersecting) renderBatch();
  }, { rootMargin: "420px" });
  window.__feedObs.observe(s);
}
function removeSentinel() {
  const s = document.getElementById("feedSentinel");
  if (s) s.remove();
  if (window.__feedObs) {
    window.__feedObs.disconnect();
    window.__feedObs = null;
  }
}

// js/features/filterbar.js
var filterbar_exports = {};
__export(filterbar_exports, {
  applyFilter: () => applyFilter,
  clearFilter: () => clearFilter,
  fdNav: () => fdNav,
  fdSetCat: () => fdSetCat,
  fdSetScope: () => fdSetScope,
  fdSetSort: () => fdSetSort,
  lockFdScroll: () => lockFdScroll,
  renderFdTags: () => renderFdTags4,
  toggleClaimFilter: () => toggleClaimFilter,
  toggleEcFilter: () => toggleEcFilter,
  toggleFilter: () => toggleFilter
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var _PHOTO_TAGS_ = () => get("PHOTO_TAGS");
var accTab4 = need("accTab");
var openSponsorsPage4 = need("openSponsorsPage");
var go11 = need("go");
var getViewPrefs4 = need("getViewPrefs");
var loadSunTimes4 = need("loadSunTimes");
var addUserPin3 = need("addUserPin");
var closeSheet6 = need("closeSheet");
var closeUni3 = need("closeUni");
var detectMyRegion3 = need("detectMyRegion");
var loadClaims4 = need("loadClaims");
var loadRace3 = need("loadRace");
var loadVisitCounts3 = need("loadVisitCounts");
var openQuests3 = need("openQuests");
var openRace3 = need("openRace");
var openShooters3 = need("openShooters");
var openUserSearch3 = need("openUserSearch");
var openWaiting3 = need("openWaiting");
var renderMap6 = need("renderMap");
var render9 = need("render");
function toggleFilter() {
  if (typeof closeUni3 === "function") closeUni3();
  const d = $("filterDrawer");
  const open = d.style.display === "none";
  d.style.display = open ? "block" : "none";
  $("filterBtn").classList.toggle("active", open);
  if (open) {
    setTimeout(() => {
      d.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 60);
    if (typeof lockFdScroll === "function") lockFdScroll();
  }
}
function fdSetCat(el, k) {
  state.draftCat = k;
  document.querySelectorAll(".fd-chips .fd-chip[data-k]").forEach((b) => b.classList.toggle("on", b.dataset.k === k));
}
function fdSetSort(el, s) {
  state.draftSort = s;
  document.querySelectorAll(".fd-chips .fd-chip[data-s]").forEach((b) => b.classList.toggle("on", b.dataset.s === s));
}
function fdSetScope(el, sc) {
  state.draftScope = sc;
  document.querySelectorAll(".fd-chip[data-sc]").forEach((b) => b.classList.toggle("on", b.dataset.sc === sc));
  const ps = document.getElementById("fdPlaceSec");
  if (ps) ps.style.display = sc === "abroad" ? "none" : "";
}
function applyFilter() {
  state.cat = state.draftCat;
  state.sort = state.draftSort;
  state.scope = state.draftScope;
  $("filterDrawer").style.display = "none";
  $("filterBtn").classList.remove("active");
  const active = state.cat !== "all" || state.draftSort !== "top" || state.draftScope !== "home" || state.tags && state.tags.length || state.onlyClaims;
  $("filterBadge").style.display = active ? "inline" : "none";
  $("abroadHint").style.display = state.draftScope === "abroad" ? "block" : "none";
  try {
    const cur = document.querySelector(".page.on");
    if (cur && cur.id !== "page-feed" && typeof go11 === "function") go11("feed");
  } catch (e) {
  }
  if (state.viewMode === "map") {
    renderMap6();
  } else {
    render9();
  }
}
function clearFilter() {
  state.tags = [];
  state.onlyClaims = false;
  state.onlyEc = false;
  const _eb = document.getElementById("fdEcBtn");
  if (_eb) _eb.classList.remove("on");
  const _cb = document.getElementById("fdClaimBtn");
  if (_cb) _cb.classList.remove("on");
  if (typeof renderFdTags4 === "function") renderFdTags4();
  state.draftCat = "all";
  state.draftSort = "top";
  state.draftScope = "home";
  state.scope = "home";
  document.querySelectorAll(".fd-chip[data-k]").forEach((b) => b.classList.toggle("on", b.dataset.k === "all"));
  document.querySelectorAll(".fd-chip[data-s]").forEach((b) => b.classList.toggle("on", b.dataset.s === "top"));
  document.querySelectorAll(".fd-chip[data-sc]").forEach((b) => b.classList.toggle("on", b.dataset.sc === "home"));
  const _ps = document.getElementById("fdPlaceSec");
  if (_ps) _ps.style.display = "";
  const _fr = document.getElementById("fRegion");
  if (_fr) _fr.value = "";
  const _fc = document.getElementById("fCity");
  if (_fc) _fc.value = "";
  state.cat = "all";
  state.sort = "top";
  $("filterBadge").style.display = "none";
  $("abroadHint").style.display = "none";
  $("filterDrawer").style.display = "none";
  $("filterBtn").classList.remove("active");
  try {
    const cur = document.querySelector(".page.on");
    if (cur && cur.id !== "page-feed" && typeof go11 === "function") go11("feed");
  } catch (e) {
  }
  render9();
}
function renderFdTags4() {
  const el = $("fdTags");
  if (!el) return;
  el.innerHTML = "";
  if (!_PHOTO_TAGS_()) return;
  _PHOTO_TAGS_().forEach((t) => {
    const b = document.createElement("button");
    b.className = "fd-chip" + (state.tags.includes(t.k) ? " on" : "");
    b.textContent = t.n;
    b.onclick = () => {
      const i = state.tags.indexOf(t.k);
      if (i > -1) state.tags.splice(i, 1);
      else state.tags.push(t.k);
      renderFdTags4();
    };
    el.appendChild(b);
  });
}
function toggleClaimFilter(btn) {
  state.onlyClaims = !state.onlyClaims;
  if (btn) btn.classList.toggle("on", state.onlyClaims);
}
function toggleEcFilter(btn) {
  state.onlyEc = !state.onlyEc;
  if (btn) btn.classList.toggle("on", state.onlyEc);
}
function lockFdScroll() {
  const el = document.querySelector(".fd-scroll");
  if (!el || el.__locked) return;
  el.__locked = true;
  let y0 = 0;
  el.addEventListener("touchstart", function(e) {
    y0 = e.touches[0].clientY;
  }, { passive: true });
  el.addEventListener("touchmove", function(e) {
    const dy = e.touches[0].clientY - y0;
    const atTop = el.scrollTop <= 0;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    if (atTop && dy > 0 || atBottom && dy < 0) e.preventDefault();
  }, { passive: false });
}
function fdNav(where) {
  const d = $("filterDrawer");
  if (d) d.style.display = "none";
  const b = $("filterBtn");
  if (b) b.classList.remove("active");
  setTimeout(function() {
    try {
      if (where === "shooters" && typeof openShooters3 === "function") openShooters3();
      else if (where === "race" && typeof openRace3 === "function") openRace3();
      else if (where === "waiting" && typeof openWaiting3 === "function") openWaiting3();
      else if (where === "quests" && typeof openQuests3 === "function") openQuests3();
      else if (where === "search" && typeof openUserSearch3 === "function") openUserSearch3();
      else if (where === "sponsors" && typeof openSponsorsPage4 === "function") openSponsorsPage4();
    } catch (e) {
    }
  }, 80);
}

// js/features/filters.js
var filters_exports = {};
__export(filters_exports, {
  FILTERS: () => FILTERS,
  applyFilterPreview: () => applyFilterPreview,
  bakeFilter: () => bakeFilter,
  filterCss: () => filterCss3,
  ghostClear: () => ghostClear2,
  ghostOpacity: () => ghostOpacity,
  ghostPick: () => ghostPick,
  loadGhosts: () => loadGhosts2,
  pickFilter: () => pickFilter,
  renderFilterRow: () => renderFilterRow3,
  resetFilter: () => resetFilter2
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var captureVideoFrame3 = need("captureVideoFrame");
var checkRaceProgress4 = need("checkRaceProgress");
var checkRate3 = need("checkRate");
var fillAddCities6 = need("fillAddCities");
var loadPhotos10 = need("loadPhotos");
var logRate3 = need("logRate");
var openAcc6 = need("openAcc");
var pushNotify9 = need("pushNotify");
var go12 = need("go");
var maybeAskNotifs6 = need("maybeAskNotifs");
var FILTERS = [
  { k: "none", n: "الأصلي", css: "none" },
  { k: "sunset", n: "غروب السودة", css: "saturate(1.45) contrast(1.12) sepia(.18) hue-rotate(-8deg) brightness(1.04)" },
  { k: "mist", n: "ضباب أبها", css: "saturate(.78) contrast(.94) brightness(1.12) hue-rotate(6deg)" },
  { k: "sand", n: "رمال الصمان", css: "sepia(.34) saturate(1.28) contrast(1.15) brightness(1.05)" },
  { k: "night", n: "ليل نجد", css: "saturate(1.18) contrast(1.3) brightness(.86) hue-rotate(200deg) saturate(1.1)" },
  { k: "qatt", n: "قط عسيري", css: "saturate(1.85) contrast(1.22) brightness(1.03)" },
  { k: "clay", n: "طين نجران", css: "sepia(.42) saturate(1.35) contrast(1.1) hue-rotate(-12deg)" },
  { k: "sea", n: "بحر جدة", css: "saturate(1.35) hue-rotate(12deg) brightness(1.07) contrast(1.08)" },
  { k: "palm", n: "نخيل القصيم", css: "saturate(1.4) hue-rotate(-10deg) contrast(1.12) brightness(1.02)" },
  { k: "memory", n: "ذاكرة", css: "sepia(.62) saturate(.85) contrast(1.06) brightness(1.05)" },
  { k: "coal", n: "فحم", css: "grayscale(1) contrast(1.32) brightness(1.04)" },
  { k: "clear", n: "صحو", css: "contrast(1.28) saturate(1.15) brightness(1.06)" }
];
function filterCss3(k) {
  const f = FILTERS.find((x) => x.k === k);
  return f ? f.css : "none";
}
function renderFilterRow3(srcUrl, isVideo, videoBlobUrl) {
  try {
    const row = document.getElementById("filterRow");
    if (!row) return;
    if (!srcUrl && !videoBlobUrl) return;
    row.innerHTML = "";
    row.style.display = "flex";
    for (let i = 0; i < FILTERS.length; i++) {
      const f = FILTERS[i];
      const item = document.createElement("div");
      item.className = "f-item" + (state.curFilter === f.k ? " on" : "");
      item.setAttribute("data-k", f.k);
      const thumb = document.createElement("div");
      thumb.className = "f-thumb";
      thumb.style.filter = f.css;
      thumb.style.webkitFilter = f.css;
      if (srcUrl) {
        thumb.style.backgroundImage = 'url("' + srcUrl + '")';
        thumb.style.backgroundSize = "cover";
        thumb.style.backgroundPosition = "center";
      } else {
        const v = document.createElement("video");
        v.src = videoBlobUrl;
        v.muted = true;
        v.playsInline = true;
        v.setAttribute("playsinline", "");
        v.setAttribute("webkit-playsinline", "");
        v.preload = "metadata";
        v.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
        thumb.appendChild(v);
      }
      const name = document.createElement("div");
      name.className = "f-name";
      name.textContent = f.n;
      item.appendChild(thumb);
      item.appendChild(name);
      item.onclick = /* @__PURE__ */ (function(key) {
        return function() {
          pickFilter(key);
        };
      })(f.k);
      row.appendChild(item);
    }
    applyFilterPreview();
  } catch (e) {
  }
}
function pickFilter(k) {
  try {
    state.curFilter = k;
    const items = document.querySelectorAll("#filterRow .f-item");
    for (let i = 0; i < items.length; i++) {
      items[i].classList.toggle("on", items[i].getAttribute("data-k") === k);
    }
    applyFilterPreview();
  } catch (e) {
  }
}
function applyFilterPreview() {
  try {
    const css = filterCss3(state.curFilter);
    const im = document.getElementById("preview"), vd = document.getElementById("videoPreview");
    if (im) {
      im.style.filter = css;
      im.style.webkitFilter = css;
    }
    if (vd) {
      vd.style.filter = css;
      vd.style.webkitFilter = css;
    }
  } catch (e) {
  }
}
function resetFilter2() {
  try {
    state.curFilter = "none";
    const row = $("filterRow");
    if (row) {
      row.style.display = "none";
      row.innerHTML = "";
    }
    const im = $("preview"), vd = $("videoPreview");
    if (im) {
      im.style.filter = "none";
      im.style.webkitFilter = "none";
    }
    if (vd) {
      vd.style.filter = "none";
      vd.style.webkitFilter = "none";
    }
  } catch (e) {
  }
}
function bakeFilter(ctx, w, h) {
  if (state.curFilter === "none") return;
  ctx.filter = filterCss3(state.curFilter);
}
async function loadGhosts2() {
  const bar = $("ghostBar"), strip = $("ghostStrip");
  if (!bar || !strip) return;
  bar.style.display = "none";
  try {
    if (!window.__USER_LAT || typeof state.photos === "undefined") return;
    const lat = window.__USER_LAT, lng = window.__USER_LNG;
    const d = (p) => Math.hypot((p.lat - lat) * 111e3, (p.lng - lng) * 111e3 * Math.cos(lat * Math.PI / 180));
    const near = state.photos.filter(
      (p) => p.lat && p.lng && p.media_type !== "video" && p.visibility !== "private" && d(p) <= 200
    ).sort((a, b) => d(a) - d(b)).slice(0, 10);
    if (!near.length) return;
    bar.style.display = "block";
    strip.innerHTML = near.map(
      (p) => `<img class="gb-thumb" src="${thumbUrl(p.image_path)}" onclick="ghostPick(${p.id},this)" alt="">`
    ).join("");
  } catch (e) {
  }
}
function ghostPick(pid, el) {
  const img = $("ghostImg");
  if (!img) return;
  const p = state.photos.find((x) => x.id === pid);
  if (!p) return;
  if (window.__ghostId === pid) {
    ghostClear2();
    return;
  }
  window.__ghostId = pid;
  img.src = thumbUrl(p.image_path);
  img.style.display = "block";
  const sl = $("ghostSlider"), off = $("ghostOff");
  if (sl) sl.style.display = "flex";
  if (off) off.style.display = "block";
  document.querySelectorAll(".gb-thumb").forEach((t) => t.classList.remove("on"));
  if (el) el.classList.add("on");
  toast("👻 حاذِ المشهد مع الصورة");
}
function ghostOpacity(v) {
  const img = $("ghostImg");
  if (img) img.style.opacity = v / 100;
}
function ghostClear2() {
  window.__ghostId = null;
  const img = $("ghostImg");
  if (img) {
    img.style.display = "none";
    img.src = "";
  }
  const sl = $("ghostSlider"), off = $("ghostOff");
  if (sl) sl.style.display = "none";
  if (off) off.style.display = "none";
  document.querySelectorAll(".gb-thumb").forEach((t) => t.classList.remove("on"));
}

// js/features/geopick.js
var geopick_exports = {};
__export(geopick_exports, {
  bindGeoPickEvents: () => bindGeoPickEvents,
  closeGeoPick: () => closeGeoPick,
  confirmGeoPick: () => confirmGeoPick,
  gpSearchPlace: () => gpSearchPlace,
  gpUpdateInfo: () => gpUpdateInfo2,
  openGeoPick: () => openGeoPick
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var captureVideoFrame4 = need("captureVideoFrame");
var checkRaceProgress5 = need("checkRaceProgress");
var checkRate4 = need("checkRate");
var fillAddCities7 = need("fillAddCities");
var loadPhotos11 = need("loadPhotos");
var logRate4 = need("logRate");
var openAcc7 = need("openAcc");
var pushNotify10 = need("pushNotify");
var go13 = need("go");
var maybeAskNotifs7 = need("maybeAskNotifs");
var fillPlaceFromGeo = need("fillPlaceFromGeo");
function openGeoPick() {
  const box = $("geoPickBox");
  if (!box) return;
  bindGeoPickEvents();
  box.classList.add("show");
  const waitReady = (tries = 0) => {
    const el = document.getElementById("gpMap");
    if (!el) return;
    const h = el.clientHeight, wd = el.clientWidth;
    if ((h < 40 || wd < 40) && tries < 30) {
      return setTimeout(() => waitReady(tries + 1), 60);
    }
    buildMap();
  };
  function buildMap() {
    try {
      if (!state.gpMap) {
        let c = [23.8859, 45.0792], z = 5;
        const reg = $("aRegion") ? $("aRegion").value : "";
        const RC = {
          "الرياض": [24.7136, 46.6753, 9],
          "مكة المكرمة": [21.3891, 39.8579, 9],
          "المدينة المنورة": [24.5247, 39.5692, 9],
          "القصيم": [26.326, 43.975, 9],
          "الشرقية": [26.4207, 50.0888, 8],
          "عسير": [18.2465, 42.5117, 9],
          "تبوك": [28.3835, 36.5662, 8],
          "حائل": [27.5219, 41.6907, 9],
          "الحدود الشمالية": [30.9843, 41.0231, 8],
          "جازان": [16.8892, 42.5511, 9],
          "نجران": [17.4924, 44.1277, 9],
          "الباحة": [20.0129, 41.4677, 10],
          "الجوف": [29.7859, 40.2, 8]
        };
        if (RC[reg]) {
          c = [RC[reg][0], RC[reg][1]];
          z = RC[reg][2];
        } else if (window.__USER_LAT) {
          c = [window.__USER_LAT, window.__USER_LNG];
          z = 11;
        }
        state.gpMap = L.map("gpMap", { zoomControl: true, attributionControl: false }).setView(c, z);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(state.gpMap);
        try {
          if (typeof state.photos !== "undefined") {
            state.photos.filter((p) => p.lat && p.lng && !p.abroad).slice(0, 120).forEach((p) => {
              const ic = L.divIcon({ className: "", html: '<div style="width:22px;height:22px;border-radius:50%;overflow:hidden;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"><img src="' + thumbUrl(p.image_path) + '" style="width:100%;height:100%;object-fit:cover"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
              L.marker([p.lat, p.lng], { icon: ic, interactive: false }).addTo(state.gpMap);
            });
          }
        } catch (e) {
        }
        state.gpMap.on("moveend", gpUpdateInfo2);
      }
      const fix = () => {
        try {
          state.gpMap.invalidateSize(true);
        } catch (e) {
        }
      };
      fix();
      [60, 180, 400, 800].forEach((ms) => setTimeout(fix, ms));
      gpUpdateInfo2();
    } catch (e) {
      console.error("[openGeoPick]", e);
      const gi = $("gpInfo");
      if (gi) gi.textContent = "تعذر تحميل الخريطة: " + (e && e.message || "");
    }
  }
  setTimeout(() => waitReady(), 60);
  if (!window.__gpResizeBound) {
    window.__gpResizeBound = true;
    window.addEventListener("resize", () => {
      if (state.gpMap && $("geoPickBox")?.classList.contains("show")) {
        setTimeout(() => {
          try {
            state.gpMap.invalidateSize(true);
          } catch (e) {
          }
        }, 120);
      }
    });
  }
}
function closeGeoPick() {
  const box = $("geoPickBox");
  if (box) box.classList.remove("show");
  state.geoPickMode = null;
}
function gpUpdateInfo2() {
  try {
    const c = state.gpMap.getCenter();
    $("gpInfo").innerHTML = "📍 " + c.lat.toFixed(5) + " , " + c.lng.toFixed(5) + '<br><span style="font-size:11px">حرّك الخريطة حتى يقع الدبوس على مكان التصوير</span>';
  } catch (e) {
  }
}
async function gpSearchPlace() {
  const q = ($("gpSearch").value || "").trim();
  if (!q) return;
  $("gpInfo").textContent = "⏳ نبحث...";
  try {
    const r = await fetch(
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=sa&q=" + encodeURIComponent(q),
      { headers: { "Accept-Language": "ar" } }
    );
    const j = await r.json();
    if (j && j[0]) {
      state.gpMap.setView([parseFloat(j[0].lat), parseFloat(j[0].lon)], 13);
      gpUpdateInfo2();
    } else {
      $("gpInfo").textContent = "ما لقينا المكان — جرّب اسماً آخر أو حرّك الخريطة يدوياً";
    }
  } catch (e) {
    $("gpInfo").textContent = "تعذر البحث — حرّك الخريطة يدوياً";
  }
}
function confirmGeoPick() {
  try {
    if (!state.gpMap) {
      toast("الخريطة ما جهزت بعد — انتظر لحظة", true);
      return;
    }
    const c = state.gpMap.getCenter();
    if (!c || !isFinite(c.lat) || !isFinite(c.lng)) {
      toast("تعذر قراءة الموقع من الخريطة", true);
      return;
    }
    if (state.geoPickMode === "edit") {
      state.edGeo = { lat: c.lat, lng: c.lng };
      const main = $("edGeoMain"), sub = $("edGeoSub"), card2 = $("edGeoCard");
      if (card2) card2.classList.remove("warn");
      if (main) main.textContent = "📍 موقع جديد";
      if (sub) sub.textContent = c.lat.toFixed(5) + ", " + c.lng.toFixed(5);
      state.geoPickMode = null;
      closeGeoPick();
      toast("انضبط الموقع — اضغط «حفظ» لتثبيته");
      return;
    }
    state.pendingGeo = { lat: c.lat, lng: c.lng };
    window.__geoManual = true;
    const card = $("geoCard");
    if (card) {
      card.classList.remove("warn");
      $("geoStatus").innerHTML = "🗺️ حدّدت الموقع يدوياً على الخريطة";
      $("geoCoords").textContent = c.lat.toFixed(5) + ", " + c.lng.toFixed(5);
    }
    const mb = $("geoManualBox");
    if (mb) mb.style.display = "none";
    closeGeoPick();
    toast("انحفظ الموقع 📍");
    try {
      fillPlaceFromGeo(c.lat, c.lng, false, true);
    } catch (e) {
      console.warn("fillPlaceFromGeo", e);
    }
  } catch (e) {
    console.error("[confirmGeoPick]", e);
    toast("تعذر الحفظ: " + (e && e.message || ""), true);
  }
}
function bindGeoPickEvents() {
  if (window.__gpBound) return;
  window.__gpBound = true;
  document.addEventListener("click", (e) => {
    const box = document.getElementById("geoPickBox");
    if (!box || !box.classList.contains("show")) return;
    const btn = e.target.closest("button");
    if (!btn || !box.contains(btn)) return;
    const txt = (btn.textContent || "").trim();
    if (txt.includes("هذا هو المكان")) {
      e.preventDefault();
      e.stopPropagation();
      confirmGeoPick();
    } else if (txt === "إلغاء" || txt === "✕") {
      e.preventDefault();
      e.stopPropagation();
      closeGeoPick();
    } else if (txt === "🔍") {
      e.preventDefault();
      e.stopPropagation();
      gpSearchPlace();
    }
  }, true);
}

// js/features/inspect.js
var inspect_exports = {};
__export(inspect_exports, {
  earlySuggest: () => earlySuggest2,
  hideSuggestions: () => hideSuggestions2,
  inspClose: () => inspClose2,
  inspPopup: () => inspPopup,
  inspectPhoto: () => inspectPhoto,
  runInspection: () => runInspection2,
  showSuggestions: () => showSuggestions,
  useSug: () => useSug
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var captureVideoFrame5 = need("captureVideoFrame");
var checkRaceProgress6 = need("checkRaceProgress");
var checkRate5 = need("checkRate");
var fillAddCities8 = need("fillAddCities");
var loadPhotos12 = need("loadPhotos");
var logRate5 = need("logRate");
var openAcc8 = need("openAcc");
var pushNotify11 = need("pushNotify");
var go14 = need("go");
var maybeAskNotifs8 = need("maybeAskNotifs");
var descCount = need("descCount");
var _inspResolve = null;
function inspEnsure() {
  if (document.getElementById("inspModal")) return;
  const css = document.createElement("style");
  css.id = "inspModalCss";
  css.textContent = `
  #inspModal{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;
    background:rgba(36,31,28,.55);backdrop-filter:blur(3px);padding:24px}
  #inspModal.show{display:flex}
  #inspModal .ip-card{background:var(--card);border:1.5px solid var(--ink);border-radius:20px;
    padding:22px 20px 18px;max-width:360px;width:100%;text-align:center;
    box-shadow:0 10px 34px rgba(36,31,28,.28);font-family:'Tajawal',sans-serif;
    animation:ipIn .18s ease-out}
  @keyframes ipIn{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}
  #inspModal .ip-ic{font-size:40px;line-height:1;margin-bottom:10px}
  #inspModal .ip-ttl{font-family:'Reem Kufi',sans-serif;font-size:19px;margin-bottom:8px;color:var(--txt)}
  #inspModal .ip-bd{font-size:13.5px;line-height:2;color:var(--txt-dim)}
  #inspModal .ip-btns{display:flex;gap:8px;margin-top:18px}
  #inspModal .ip-btn{flex:1;padding:12px;border-radius:13px;border:1px solid var(--line);
    background:var(--card2);color:var(--txt);font-family:'Tajawal';font-size:14px;font-weight:700;cursor:pointer}
  #inspModal .ip-btn.main{background:var(--sadu);border-color:var(--sadu);color:#fff}
  #inspModal.ok   .ip-ttl{color:var(--palm)}
  #inspModal.bad  .ip-ttl{color:var(--sadu)}
  #inspModal.warn .ip-ttl{color:var(--star)}
  `;
  document.head.appendChild(css);
  const el = document.createElement("div");
  el.id = "inspModal";
  el.innerHTML = '<div class="ip-card"><div class="ip-ic"></div><div class="ip-ttl"></div><div class="ip-bd"></div><div class="ip-btns"></div></div>';
  document.body.appendChild(el);
}
function inspClose2(val) {
  const el = document.getElementById("inspModal");
  if (el) el.classList.remove("show");
  const r = _inspResolve;
  _inspResolve = null;
  if (r) r(val);
}
function inspPopup({ tone = "busy", icon = "", title = "", body = "", buttons = null, autoMs = 0 } = {}) {
  inspEnsure();
  const el = document.getElementById("inspModal");
  el.className = "show " + tone;
  el.querySelector(".ip-ic").textContent = icon || { busy: "🤖", ok: "✅", bad: "⛔", warn: "⚠️" }[tone] || "";
  el.querySelector(".ip-ttl").textContent = title;
  el.querySelector(".ip-bd").innerHTML = body;
  const bw = el.querySelector(".ip-btns");
  bw.innerHTML = "";
  return new Promise((resolve) => {
    _inspResolve = resolve;
    (buttons || []).forEach((b) => {
      const btn = document.createElement("button");
      btn.className = "ip-btn" + (b.primary ? " main" : "");
      btn.textContent = b.label;
      btn.onclick = () => inspClose2(b.value);
      bw.appendChild(btn);
    });
    if (!buttons && autoMs) setTimeout(() => inspClose2(true), autoMs);
    if (!buttons && !autoMs) resolve(true);
  });
}
async function inspectPhoto(blob) {
  try {
    if (blob && blob.size > 900 * 1024 && typeof compressTo === "function") {
      blob = await compressTo(blob, 640, 0.55);
    }
  } catch (e) {
  }
  try {
    const dataUrl = await new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        try {
          const s = Math.min(1, 640 / Math.max(img.width, img.height));
          const cv = document.createElement("canvas");
          cv.width = Math.round(img.width * s);
          cv.height = Math.round(img.height * s);
          cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
          URL.revokeObjectURL(img.src);
          res(cv.toDataURL("image/jpeg", 0.7));
        } catch (e) {
          rej(e);
        }
      };
      img.onerror = rej;
      img.src = URL.createObjectURL(blob);
    });
    let data = null, err = null;
    try {
      const _gp = state.geoPlace || {};
      const _pl = {
        region: $("aRegion") && $("aRegion").value || _gp.region || "",
        city: $("aCity") && $("aCity").value || _gp.city || "",
        village: $("aVillage") && $("aVillage").value || _gp.village || ""
      };
      const r = await sb.functions.invoke("translate", { body: { action: "inspect", image: dataUrl, ..._pl } });
      data = r.data;
      err = r.error;
    } catch (e) {
      err = e;
    }
    if (!data || err) {
      const sess = await sb.auth.getSession();
      const tok = sess?.data?.session?.access_token;
      const r = await fetch("https://gquzjaxpqeggknhipmzk.supabase.co/functions/v1/translate", {
        method: "POST",
        headers: Object.assign(
          { "Content-Type": "application/json", "apikey": "sb_publishable_BNp6Fg3VLXa1Pf4V6QjncQ_f496PquX" },
          tok ? { "Authorization": "Bearer " + tok } : {}
        ),
        body: JSON.stringify(Object.assign({ action: "inspect", image: dataUrl }, {
          region: $("aRegion") && $("aRegion").value || state.geoPlace && state.geoPlace.region || "",
          city: $("aCity") && $("aCity").value || state.geoPlace && state.geoPlace.city || "",
          village: $("aVillage") && $("aVillage").value || state.geoPlace && state.geoPlace.village || ""
        }))
      });
      if (!r.ok) {
        let t = "";
        try {
          t = await r.text();
        } catch (e) {
        }
        console.warn("inspect HTTP", r.status, t);
        state.inspErr = "HTTP " + r.status + " " + t.slice(0, 120);
        return null;
      }
      data = await r.json();
    }
    if (data && data.error) {
      console.warn("inspect error", data.error);
      state.inspErr = String(data.error).slice(0, 140);
      return null;
    }
    state.inspErr = "";
    return data || null;
  } catch (e) {
    console.warn("inspect exception", e);
    state.inspErr = e && e.message || "استثناء";
    return null;
  }
}
async function runInspection2(blob) {
  inspPopup({ tone: "busy", title: "نفحص الصورة…", body: "لحظات من فضلك" });
  const res = state.earlyRes || await inspectPhoto(blob);
  if (!res) {
    if (state.inspErr) {
      await inspPopup({
        tone: "warn",
        title: "تعذر الفحص",
        body: '<span style="direction:ltr;display:inline-block;font-size:11.5px">' + esc(state.inspErr) + "</span>",
        buttons: [{ label: "أكمل النشر", value: true, primary: true }]
      });
    } else inspClose2();
    return true;
  }
  if (res.nsfw || res.violence) {
    await inspPopup({
      tone: "bad",
      title: "الصورة مرفوضة",
      body: "فيها محتوى مخالف لإرشادات النشر — اختر صورة أخرى",
      buttons: [{ label: "حسناً", value: false, primary: true }]
    });
    return false;
  }
  const warns = [];
  if (res.face) warns.push("👤 فيها وجه واضح — تأكد من إذن صاحبه");
  if (res.plate) warns.push("🚗 فيها لوحة مركبة مقروءة");
  if (res.indoor_private) warns.push("🏠 تبدو من داخل منزل خاص");
  if (res.military) warns.push("🚫 قد تكون منشأة عسكرية أو أمنية — تصويرها محظور نظاماً");
  if (warns.length) {
    return await inspPopup({
      tone: "warn",
      title: "تنبيه قبل النشر",
      body: warns.join("<br>"),
      buttons: [
        { label: "أكمل النشر", value: true, primary: true },
        { label: "تراجع", value: false }
      ]
    });
  }
  inspPopup({ tone: "ok", title: "الصورة سليمة", body: "تمام — كمّل نشرك", autoMs: 1800 });
  if (res.category && $("aCat")) {
    const opt = Array.from($("aCat").options).find((o) => o.value === res.category);
    if (opt) $("aCat").value = res.category;
  }
  showSuggestions(res);
  return true;
}
function showSuggestions(res) {
  const box = $("sugBox");
  if (!box) return;
  const t = (res.suggested_title_ar || "").trim();
  const d = (res.suggested_desc_ar || "").trim();
  if (!t && !d) {
    box.style.display = "none";
    return;
  }
  state.sugT = t;
  state.sugD = d;
  box.style.display = "block";
  box.innerHTML = `
    <div class="sg-head">
      <span>✨ اقتراح ذكي</span>
      <button onclick="hideSuggestions()">✕</button>
    </div>
    ${t ? `<div class="sg-row">
      <div class="sg-lbl">العنوان</div>
      <div class="sg-txt">${esc(t)}</div>
      <button class="sg-use" onclick="useSug('t')">استخدمه</button>
    </div>` : ""}
    ${d ? `<div class="sg-row">
      <div class="sg-lbl">الوصف</div>
      <div class="sg-txt">${esc(d)}</div>
      <button class="sg-use" onclick="useSug('d')">استخدمه</button>
    </div>` : ""}
    ${t && d ? `<button class="sg-all" onclick="useSug('all')">✓ استخدم الاثنين</button>` : ""}
    <div class="sg-note">اقتراح من الذكاء الاصطناعي — عدّله كما تحب</div>`;
}
function useSug(what) {
  try {
    const ti = $("aTitle"), de = $("aDesc");
    if ((what === "t" || what === "all") && ti && state.sugT) {
      ti.value = state.sugT;
      try {
        ti.dispatchEvent(new Event("input", { bubbles: true }));
      } catch (e) {
      }
    }
    if ((what === "d" || what === "all") && de && state.sugD) {
      de.value = state.sugD;
      try {
        de.dispatchEvent(new Event("input", { bubbles: true }));
      } catch (e) {
      }
      if (typeof descCount === "function") descCount();
    }
    toast("انتقل للحقل ✍️");
    if (what === "all") hideSuggestions2();
  } catch (e) {
    toast("تعذر النقل", true);
  }
}
function hideSuggestions2() {
  const box = $("sugBox");
  if (box) box.style.display = "none";
}
async function earlySuggest2() {
  try {
    const on = !!state.banner.inspect_enabled || !!state.inspectOn;
    if (!on) return;
    let tries = 0;
    while (!state.pendingBlob && !state.pendingFile && tries < 20) {
      await new Promise((r) => setTimeout(r, 150));
      tries++;
    }
    const blob = state.pendingBlob || state.pendingFile;
    if (!blob) return;
    await new Promise((r) => setTimeout(r, 900));
    const box = $("sugBox");
    if (box) {
      box.style.display = "block";
      box.innerHTML = '<div class="sg-head"><span>✨ نقرأ الصورة...</span></div>';
    }
    const res = await inspectPhoto(blob);
    if (!res) {
      if (box) {
        if (state.inspErr) {
          box.innerHTML = '<div class="sg-head"><span>⚠️ تعذر الاقتراح</span><button onclick="hideSuggestions()">✕</button></div><div style="font-size:11px;direction:ltr;color:var(--txt-dim);padding:4px 2px">' + esc(state.inspErr) + "</div>";
        } else box.style.display = "none";
      }
      return;
    }
    state.earlyRes = res;
    showSuggestions(res);
    const warns = [];
    if (res.face) warns.push("🙂 فيها وجه واضح — تأكد من إذن صاحبه");
    if (res.plate) warns.push("🚗 لوحة مركبة مقروءة");
    if (res.indoor_private) warns.push("🏠 تبدو من داخل منزل خاص");
    if (res.military) warns.push("🚫 قد تكون منشأة عسكرية — تصويرها محظور نظاماً");
    if (res.nsfw || res.violence) {
      inspPopup({
        tone: "bad",
        title: "الصورة مرفوضة",
        body: "محتوى مخالف — اختر صورة أخرى",
        buttons: [{ label: "حسناً", value: false, primary: true }]
      });
    } else if (warns.length) {
      inspPopup({
        tone: "warn",
        title: "تنبيه",
        body: warns.join("<br>"),
        buttons: [{ label: "فهمت", value: true, primary: true }]
      });
    } else {
      inspPopup({ tone: "ok", title: "الصورة سليمة", body: "تمام — كمّل بياناتك", autoMs: 1600 });
    }
    if (res.category && $("aCat")) {
      const opt = Array.from($("aCat").options).find((o) => o.value === res.category);
      if (opt && !$("aCat").value) $("aCat").value = res.category;
    }
  } catch (e) {
  }
}

// js/features/limits.js
var limits_exports = {};
__export(limits_exports, {
  RATE_LIMITS: () => RATE_LIMITS,
  checkRate: () => checkRate6,
  logRate: () => logRate6
});
init_db();
init_state();
init_places();
var RATE_LIMITS = { photo: { n: 10, hours: 1, label: "صور" }, comment: { n: 20, hours: 1, label: "تعليقات" }, message: { n: 5, hours: 24, label: "رسائل" }, claim: { n: 3, hours: 24, label: "سبق" } };
async function checkRate6(kind) {
  if (isAnon()) return null;
  if (state.isAdmin) return null;
  const cfg = RATE_LIMITS[kind];
  if (!cfg) return null;
  try {
    const since = new Date(Date.now() - cfg.hours * 36e5).toISOString();
    const r = await sb.from("rate_log").select("id", { count: "exact", head: true }).eq("user_id", currentUser()?.id).eq("kind", kind).gte("created_at", since);
    if ((r.count || 0) >= cfg.n) {
      return cfg.hours === 24 ? "وصلت الحد اليومي (" + cfg.n + " " + cfg.label + ") — جرّب بكرة" : "خذ نفسك — تقدر تنشر " + cfg.n + " " + cfg.label + " بالساعة";
    }
  } catch (e) {
  }
  return null;
}
async function logRate6(kind) {
  if (isAnon()) return;
  try {
    await sb.from("rate_log").insert({ user_id: currentUser()?.id, kind });
  } catch (e) {
  }
}

// js/features/map.js
var map_exports = {};
__export(map_exports, {
  ALL_REGIONS: () => ALL_REGIONS,
  GAP_LAYERS: () => GAP_LAYERS,
  _userPin: () => _userPin,
  addUserPin: () => addUserPin4,
  applyPendingPlace: () => applyPendingPlace2,
  drawCoverageGaps: () => drawCoverageGaps,
  openWaiting: () => openWaiting4,
  renderMap: () => renderMap7,
  renderWaiting: () => renderWaiting,
  setView: () => setView3,
  shootThere: () => shootThere2,
  toggleGaps: () => toggleGaps
});
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var openSponsorsPage5 = need("openSponsorsPage");
var go15 = need("go");
var fillAddCities9 = need("fillAddCities");
var openSheet6 = need("openSheet");
var render10 = need("render");
var filteredPhotos2 = need("filteredPhotos");
function renderMap7() {
  const wrap = $("mapWrap");
  wrap.style.display = "block";
  $("feed").style.display = "none";
  if (typeof L === "undefined") {
    wrap.innerHTML = '<div class="empty">⚠️ تعذر تحميل الخريطة — تأكد من رفع leaflet.js وleaflet.css</div>';
    return;
  }
  if (!state.map) {
    state.map = L.map("map", { zoomControl: true, attributionControl: true }).setView([23.9, 45.1], 5);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(state.map);
    state.marks = L.layerGroup().addTo(state.map);
    const ZoomHome = L.Control.extend({
      options: { position: "topright" },
      onAdd: function() {
        const b = L.DomUtil.create("button", "");
        b.innerHTML = "📍";
        b.title = "موقعي";
        b.style.cssText = "width:38px;height:38px;background:#fff;border:2px solid rgba(0,0,0,.2);border-radius:8px;font-size:18px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.2)";
        b.onclick = function(e) {
          e.stopPropagation();
          if (window.__USER_LAT) state.map.setView([window.__USER_LAT, window.__USER_LNG], 13);
          else toast("فعّل الموقع أولاً", true);
        };
        return b;
      }
    });
    state.map.addControl(new ZoomHome());
    const GapBtn = L.Control.extend({
      options: { position: "topright" },
      onAdd: function() {
        const b = L.DomUtil.create("button", "");
        b.id = "gapBtn";
        b.innerHTML = "🔍";
        b.title = "مناطق قليلة التغطية";
        b.style.cssText = "width:38px;height:38px;background:#fff;border:2px solid rgba(0,0,0,.2);border-radius:8px;font-size:17px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.2);margin-top:6px";
        b.onclick = function(e) {
          e.stopPropagation();
          toggleGaps();
        };
        return b;
      }
    });
    state.map.addControl(new GapBtn());
  }
  state.marks.clearLayers();
  const list = (filteredPhotos2() || []).filter((p) => p.lat && p.lng);
  const pts = [];
  list.forEach((p) => {
    const cl = typeof state.claimMap !== "undefined" && state.claimMap ? state.claimMap[p.id] : null;
    const clCls = cl ? " claim-" + cl.state : "";
    const clDot = cl ? '<span class="pmark-claim">' + (cl.state === "doubted" ? "❓" : "🏅") + "</span>" : "";
    const ic = L.divIcon({ className: "", html: `<div class="pmark${clCls}"><img src="${thumbUrl(p.image_path)}" onerror="this.onerror=null;this.src='${imgUrl(p.image_path)}'">${clDot}</div>`, iconSize: [46, 46], iconAnchor: [23, 23] });
    L.marker([p.lat, p.lng], { icon: ic }).addTo(state.marks).on("click", () => openSheet6(p.id));
    pts.push([p.lat, p.lng]);
  });
  if (window.__USER_LAT && !state.map._userCentered) {
    state.map.setView([window.__USER_LAT, window.__USER_LNG], 11);
    state.map._userCentered = true;
  } else if (pts.length && !state.map._userCentered) {
    state.map.fitBounds(pts, { padding: [46, 46], maxZoom: 12 });
  }
  const spd = state.banner;
  if (spd && spd.active && spd.image_path && spd.sponsor_lat && spd.sponsor_lng) {
    const sic = L.divIcon({ className: "", html: `<div class="pmark sp-pin"><img src="${thumbUrl(spd.image_path)}"><div class="sp-pin-label">${esc(spd.sponsor_name || "راعي")}</div></div>`, iconSize: [54, 66], iconAnchor: [27, 66] });
    L.marker([spd.sponsor_lat, spd.sponsor_lng], { icon: sic, zIndexOffset: 1e3 }).addTo(state.marks).on("click", () => openSponsorsPage5());
  }
  setTimeout(() => {
    state.map.invalidateSize();
    if (window.__USER_LAT) addUserPin4(window.__USER_LAT, window.__USER_LNG);
  }, 120);
  const sp = state.banner;
  $("mapSponsor").innerHTML = sp && sp.active && sp.image_path ? (sp.link_url ? `<a href="${esc(sp.link_url)}" target="_blank" rel="noopener">` : "") + `<img src="${imgUrl(spd.image_path)}" alt="راعي المنصة">` + (sp.link_url ? "</a>" : "") : "";
}
var _userPin = null;
function addUserPin4(lat, lng) {
  if (!state.map || typeof L === "undefined") return;
  if (_userPin) _userPin.remove();
  const ic = L.divIcon({ className: "", html: '<div class="user-pin">📍<div class="user-pin-label">موقعي</div></div>', iconSize: [40, 52], iconAnchor: [20, 52] });
  _userPin = L.marker([lat, lng], { icon: ic, zIndexOffset: 2e3 }).addTo(state.map);
}
function setView3(v) {
  state.viewMode = v;
  $("vtGrid").classList.toggle("on", v === "grid");
  $("vtMap").classList.toggle("on", v === "map");
  const feed = $("feed");
  const map = $("mapWrap");
  if (v === "map") {
    if (feed) feed.style.display = "none";
    if (map) map.style.display = "block";
    renderMap7();
  } else {
    if (map) map.style.display = "none";
    if (feed) feed.style.display = "";
    render10();
  }
}
var GAP_LAYERS = [];
state.gapsOn = false;
function drawCoverageGaps() {
  if (!state.map || typeof L === "undefined") return;
  GAP_LAYERS.forEach((l) => {
    try {
      state.map.removeLayer(l);
    } catch (e) {
    }
  });
  GAP_LAYERS = [];
  if (!state.gapsOn) return;
  const LAT_MIN = 16.5, LAT_MAX = 32, LNG_MIN = 34.5, LNG_MAX = 55.5;
  const STEP = 0.75;
  const geoPts = state.photos.filter((p) => p.lat && p.lng && !p.abroad);
  const filled = /* @__PURE__ */ new Set();
  geoPts.forEach((p) => {
    const gy = Math.floor((p.lat - LAT_MIN) / STEP);
    const gx = Math.floor((p.lng - LNG_MIN) / STEP);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) filled.add(gy + dy + "_" + (gx + dx));
  });
  const rows = Math.ceil((LAT_MAX - LAT_MIN) / STEP);
  const cols = Math.ceil((LNG_MAX - LNG_MIN) / STEP);
  let count = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (filled.has(y + "_" + x)) continue;
      const clat = LAT_MIN + y * STEP + STEP / 2;
      const clng = LNG_MIN + x * STEP + STEP / 2;
      if (clng < 36.5 && clat > 28) continue;
      if (clng > 51.5 && clat > 26.5) continue;
      const c = L.circle([clat, clng], {
        radius: 38e3,
        color: "#8A7B6A",
        weight: 1.5,
        dashArray: "6,6",
        fillColor: "#8A7B6A",
        fillOpacity: 0.12
      }).addTo(state.map);
      c.bindPopup('<div style="font-family:Tajawal;text-align:center;min-width:170px"><div style="font-weight:700;font-size:14px;color:#8C2F23;margin-bottom:4px">📍 منطقة قليلة التغطية</div><div style="font-size:12px;color:#666;line-height:1.8">ما فيها صور بعد — كن أول من يوثّق جمالها 📸</div></div>');
      GAP_LAYERS.push(c);
      count++;
    }
  }
  if (count) toast(count + " منطقة تنتظر عدستك 📸");
}
function toggleGaps() {
  state.gapsOn = !state.gapsOn;
  const b = $("gapBtn");
  if (b) {
    b.style.background = state.gapsOn ? "#8C2F23" : "#fff";
    b.style.color = state.gapsOn ? "#fff" : "#000";
  }
  drawCoverageGaps();
  if (!state.gapsOn) toast("اختفت المناطق الفارغة");
}
var ALL_REGIONS = [
  "الرياض",
  "مكة المكرمة",
  "المدينة المنورة",
  "القصيم",
  "الشرقية",
  "عسير",
  "تبوك",
  "حائل",
  "الحدود الشمالية",
  "جازان",
  "نجران",
  "الباحة",
  "الجوف"
];
function openWaiting4() {
  go15("waiting");
  renderWaiting();
}
function renderWaiting() {
  const el = $("waitingBody");
  if (!el) return;
  const local = state.photos.filter((p) => !p.abroad && p.visibility !== "private");
  const byReg = {};
  ALL_REGIONS.forEach((r) => byReg[r] = { n: 0, ph: [], cities: /* @__PURE__ */ new Set() });
  local.forEach((p) => {
    if (byReg[p.region]) {
      byReg[p.region].n++;
      byReg[p.region].ph.push(p);
      if (p.city) byReg[p.region].cities.add(p.city);
    }
  });
  const regs = ALL_REGIONS.map((r) => ({ r, ...byReg[r] })).sort((a, b) => a.n - b.n);
  const byCity = {};
  local.forEach((p) => {
    if (!p.city) return;
    const k = p.region + "|" + p.city;
    byCity[k] = byCity[k] || { city: p.city, region: p.region, n: 0 };
    byCity[k].n++;
  });
  const thinCities = Object.values(byCity).filter((c) => c.n <= 2).sort((a, b) => a.n - b.n).slice(0, 12);
  const empty = regs.filter((x) => x.n === 0);
  const thin = regs.filter((x) => x.n > 0 && x.n < 5);
  el.innerHTML = `
    ${empty.length ? `
      <div class="wt-lead">🏜️ ما فيها ولا صورة</div>
      <div class="wt-grid">
        ${empty.map((x) => `
          <div class="wt-card empty" onclick="shootThere('${esc(x.r)}')">
            <div class="wt-name">${esc(x.r)}</div>
            <div class="wt-badge">أول صورة!</div>
            <button class="wt-go">📷 صوّرها</button>
          </div>`).join("")}
      </div>` : ""}

    ${thin.length ? `
      <div class="wt-lead" style="margin-top:20px">🌱 تحتاج مزيداً</div>
      <div class="wt-grid">
        ${thin.map((x) => `
          <div class="wt-card thin" onclick="shootThere('${esc(x.r)}')">
            <div class="wt-name">${esc(x.r)}</div>
            <div class="wt-count">${x.n} ${x.n === 1 ? "صورة" : x.n < 11 ? "صور" : "صورة"} · ${x.cities.size} ${x.cities.size === 1 ? "مدينة" : "مدن"}</div>
            <button class="wt-go">📷 صوّرها</button>
          </div>`).join("")}
      </div>` : ""}

    ${thinCities.length ? `
      <div class="wt-lead" style="margin-top:20px">📍 مدن وقرى بصورة أو صورتين</div>
      <div class="wt-cities">
        ${thinCities.map((c) => `
          <div class="wt-city" onclick="shootThere('${esc(c.region)}','${esc(c.city)}')">
            <span class="wc-name">${esc(c.city)}</span>
            <span class="wc-reg">${esc(c.region)}</span>
            <span class="wc-n">${c.n}</span>
          </div>`).join("")}
      </div>` : ""}

    ${!empty.length && !thin.length && !thinCities.length ? `
      <div class="empty" style="padding:30px">
        <span class="big">🎉</span>
        كل المناطق موثّقة!<br>واصل التوثيق وكثّف صور ديرتك
      </div>` : ""}

    <div class="wt-note">
      💡 كل صورة من مكان جديد ترفع ترتيب منطقتك بسباق الديار — والمصوّر الأول يكسب سبق الموقع 🏅
    </div>`;
}
function shootThere2(region, city) {
  go15("add");
  window.__pendingPlace = { region: region || "", city: city || "" };
  setTimeout(() => applyPendingPlace2(0), 200);
  toast("📍 " + (city || region) + " — صوّرها وكن أول من يوثّقها");
}
function applyPendingPlace2(tries) {
  const pp = window.__pendingPlace;
  if (!pp) return;
  if (tries > 22) {
    window.__pendingPlace = null;
    return;
  }
  const rs = $("aRegion");
  if (!rs || !rs.options.length) {
    setTimeout(() => applyPendingPlace2(tries + 1), 120);
    return;
  }
  if (pp.region && normPlace(rs.value) !== normPlace(pp.region)) {
    const o = findOpt(rs, pp.region);
    if (o) {
      rs.value = o.value;
      rs.dispatchEvent(new Event("change", { bubbles: true }));
      if (typeof fillAddCities9 === "function") fillAddCities9();
    } else if (tries > 6) {
      window.__pendingPlace = null;
      if (typeof toast === "function") toast("اختر المنطقة يدوياً", true);
      return;
    }
  }
  if (!pp.city) {
    if (pp.region && normPlace(rs.value) === normPlace(pp.region)) {
      window.__pendingPlace = null;
      return;
    }
    setTimeout(() => applyPendingPlace2(tries + 1), 140);
    return;
  }
  const cs = $("aCity");
  if (cs && cs.options.length > 1) {
    const c = findOpt(cs, pp.city);
    if (c) {
      cs.value = c.value;
      cs.dispatchEvent(new Event("change", { bubbles: true }));
      window.__pendingPlace = null;
      return;
    }
  }
  setTimeout(() => applyPendingPlace2(tries + 1), 140);
}

// js/features/messages.js
var messages_exports = {};
__export(messages_exports, {
  clearInbox: () => clearInbox,
  closeDmBox: () => closeDmBox2,
  delDm: () => delDm,
  dmCount: () => dmCount,
  dmUnreadCount: () => dmUnreadCount5,
  openDmBox: () => openDmBox,
  renderInbox: () => renderInbox5,
  reportDm: () => reportDm,
  sendDm: () => sendDm,
  sendFeedback: () => sendFeedback,
  setDmTab: () => setDmTab,
  toggleDmOpen: () => toggleDmOpen
});
init_db();
init_format();
init_hub();
init_state();
init_ui();
init_places();
var notifyDmBan2 = need("notifyDmBan");
var openProfile2 = need("openProfile");
var pushNotify12 = need("pushNotify");
var showJoinBox5 = need("showJoinBox");
var checkRate7 = need("checkRate");
var logRate7 = need("logRate");
var isBlockedWith2 = need("isBlockedWith");
var loadMyBlocks2 = need("loadMyBlocks");
function openDmBox(uid, name) {
  if (isAnon()) {
    toast("✉️ سجّل مجاناً وراسل المصورين", true);
    showJoinBox5();
    return;
  }
  state.dmTo = { id: uid, name };
  const el = $("dmBox");
  if (!el) return;
  $("dmTitle").textContent = "✉️ رسالة إلى " + name;
  $("dmText").value = "";
  $("dmCount").textContent = "0 / 400";
  el.classList.add("show");
  setTimeout(() => {
    const t = $("dmText");
    if (t) t.focus();
  }, 220);
}
function closeDmBox2() {
  const el = $("dmBox");
  if (el) el.classList.remove("show");
  state.dmTo = null;
}
function dmCount() {
  const t = $("dmText");
  if (!t) return;
  const n = t.value.length;
  $("dmCount").textContent = n + " / 400";
}
async function sendDm() {
  const to = state.dmTo;
  if (!to) {
    closeDmBox2();
    return;
  }
  const body = ($("dmText").value || "").trim();
  if (body.length < 5) {
    toast("اكتب رسالة أوضح", true);
    return;
  }
  if (body.length > 400) {
    toast("الحد ٤٠٠ حرف", true);
    return;
  }
  if (typeof checkText === "function") {
    const bad = checkText(body);
    if (bad) {
      toast(bad, true);
      return;
    }
  }
  const btn = $("dmSend");
  const old = btn ? btn.textContent : "";
  if (btn) {
    btn.disabled = true;
    btn.textContent = "⏳";
  }
  try {
    if (await isBlockedWith2(to.id)) {
      toast("🚫 ما تقدر تراسله — فيه حظر بينكما", true);
      if (btn) {
        btn.disabled = false;
        btn.textContent = old;
      }
      closeDmBox2();
      return;
    }
    const pr = (await sb.from("profiles").select("dm_open").eq("id", to.id).maybeSingle()).data;
    if (pr && pr.dm_open === false) {
      toast("🔕 هذا العضو أقفل استقبال الرسائل", true);
      if (btn) {
        btn.disabled = false;
        btn.textContent = old;
      }
      closeDmBox2();
      return;
    }
    const me = (await sb.from("profiles").select("dm_banned").eq("id", currentUser()?.id).maybeSingle()).data;
    if (me && me.dm_banned) {
      toast("🚫 إرسال الرسائل موقوف بحسابك — شوف التفاصيل بـ«رسائلي»", true);
      if (btn) {
        btn.disabled = false;
        btn.textContent = old;
      }
      closeDmBox2();
      return;
    }
  } catch (e) {
  }
  try {
    const since = new Date(Date.now() - 864e5).toISOString();
    const c = await sb.from("dm").select("id", { count: "exact", head: true }).eq("from_id", currentUser()?.id).eq("to_id", to.id).gte("created_at", since);
    if ((c.count || 0) >= 2) {
      toast("أرسلت رسالتين له اليوم — انتظر رده", true);
      return;
    }
    const { error } = await sb.from("dm").insert({
      from_id: currentUser()?.id,
      to_id: to.id,
      body,
      photo_id: state.curPhoto && state.curPhoto.user_id === to.id ? state.curPhoto.id : null
    });
    if (error) throw error;
    try {
      const me = (await sb.from("profiles").select("display_name").eq("id", currentUser()?.id).maybeSingle()).data;
      if (typeof pushNotify12 === "function") pushNotify12({
        title: "✉️ رسالة جديدة",
        body: (me && me.display_name || "مصوّر") + " راسلك",
        url: "/",
        user_ids: [to.id]
      });
    } catch (e) {
    }
    toast("انرسلت رسالتك ✅");
    closeDmBox2();
  } catch (e) {
    const msg = String(e && e.message || "");
    if (/row-level|policy|violates|42501/i.test(msg)) {
      toast("🚫 ما تقدر تراسله — إما حاظرك أو أقفل الرسائل", true);
      closeDmBox2();
    } else {
      toast("تعذر الإرسال: " + msg, true);
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = old;
    }
  }
}
state.dmTab = "in";
function setDmTab(t) {
  state.dmTab = t;
  renderInbox5();
}
async function renderInbox5() {
  const el = $("inboxList");
  if (!el) return;
  await loadMyBlocks2();
  if (isAnon()) {
    el.innerHTML = "";
    return;
  }
  const tab = state.dmTab || "in";
  const isOut = tab === "out";
  el.innerHTML = '<div class="loader" style="padding:16px">⏳</div>';
  try {
    const r = await sb.from("dm").select("*").eq(isOut ? "from_id" : "to_id", currentUser()?.id).eq(isOut ? "del_from" : "del_to", false).order("created_at", { ascending: false }).limit(60);
    if (r.error) throw r.error;
    let list = r.data || [];
    if (state.myBlocks && state.myBlocks.size) {
      const k = isOut ? "to_id" : "from_id";
      list = list.filter((m) => !state.myBlocks.has(m[k]));
    }
    const names = {};
    if (list.length) {
      try {
        const key = isOut ? "to_id" : "from_id";
        const ids = [...new Set(list.map((m) => m[key]))];
        const pr = await sb.from("profiles").select("id,display_name").in("id", ids);
        (pr.data || []).forEach((u) => {
          names[u.id] = u.display_name || "مصوّر";
        });
      } catch (e) {
      }
    }
    const tabs = `<div class="dm-tabs">
        <button class="${!isOut ? "on" : ""}" onclick="setDmTab('in')">📥 الوارد</button>
        <button class="${isOut ? "on" : ""}" onclick="setDmTab('out')">📤 المرسلة</button>
      </div>`;
    if (!list.length) {
      el.innerHTML = tabs + '<div class="empty" style="padding:22px"><span class="big">📭</span>' + (isOut ? "ما أرسلت رسائل بعد" : "ما وصلك رسائل") + "</div>";
      return;
    }
    const unreadN = list.filter((m) => !m.read_at).length;
    el.innerHTML = tabs + `<div class="msgs-bar">
        <span>${isOut ? "المرسلة" : "الوارد"} (${list.length})${!isOut && unreadN ? " · " + unreadN + " جديدة" : ""}</span>
        <button onclick="clearInbox()">🗑️ امسح الكل</button>
      </div>` + list.map((m) => {
      const other = isOut ? m.to_id : m.from_id;
      const nm = names[other] || "مصوّر";
      const unread = !isOut && !m.read_at;
      return `<div class="dm-card${unread ? " unread" : ""}">
        <div class="dm-top">
          <span class="dm-from" onclick="openProfile('${other}')">${isOut ? "إلى: " : ""}${esc(nm)}</span>
          <span class="dm-time">${(timeAgo(m.created_at) || {}).txt || ""}${isOut ? m.read_at ? " · ✓✓ قرأها" : " · ✓ أُرسلت" : ""}</span>
        </div>
        <div class="dm-body">${esc(m.body)}</div>
        <div class="dm-acts">
          ${isOut ? "" : `<button onclick="openDmBox('${other}','${esc(nm)}')">↩️ رد</button>`}
          <button onclick="delDm(${m.id})">${isOut && !m.read_at ? "↩️ اسحبها" : "🗑️ حذف"}</button>
          ${isOut ? "" : `<button onclick="reportDm(${m.id})">🚩 إبلاغ</button>
          <button onclick="blockUser('${other}','${esc(nm).replace(/'/g, "&#39;")}')">🚫 احظره</button>`}
        </div>
      </div>`;
    }).join("");
    const un = isOut ? [] : list.filter((m) => !m.read_at).map((m) => m.id);
    if (un.length) {
      try {
        await sb.from("dm").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).in("id", un);
      } catch (e) {
      }
    }
  } catch (e) {
    el.innerHTML = '<div class="empty" style="padding:18px">تعذر تحميل الرسائل<br><span style="font-size:11px;direction:ltr;display:inline-block">' + esc(e && e.message || "") + "</span></div>";
  }
}
async function delDm(id) {
  const isOut = state.dmTab === "out";
  try {
    const m = (await sb.from("dm").select("read_at,from_id,to_id").eq("id", id).maybeSingle()).data;
    if (!m) {
      toast("الرسالة غير موجودة", true);
      return;
    }
    if (isOut && !m.read_at) {
      if (!confirm("سحب الرسالة؟\nما قرأها بعد — راح تختفي من عنده أيضاً.")) return;
      const { data, error } = await sb.from("dm").delete().eq("id", id).select("id");
      if (error) {
        toast("تعذر السحب: " + error.message, true);
        return;
      }
      if (!data || !data.length) {
        toast("تعذر السحب — ربما قرأها الآن", true);
        renderInbox5();
        return;
      }
      toast("انسحبت الرسالة ✅");
    } else {
      const msg = isOut ? "حذف من سجلك؟\nقرأها الطرف الآخر — تبقى عنده." : "حذف الرسالة من صندوقك؟";
      if (!confirm(msg)) return;
      const field = isOut ? { del_from: true } : { del_to: true };
      const { error } = await sb.from("dm").update(field).eq("id", id);
      if (error) {
        toast("تعذر الحذف: " + error.message, true);
        return;
      }
      toast("انحذفت من عندك");
    }
    renderInbox5();
    if (typeof dmUnreadCount5 === "function") dmUnreadCount5();
  } catch (e) {
    toast("تعذر الحذف", true);
  }
}
async function reportDm(id) {
  if (!confirm("إبلاغ الإدارة عن هذي الرسالة؟")) return;
  try {
    let inf = null;
    try {
      const rr = await sb.rpc("dm_report_info", { mid: id });
      inf = rr.data;
    } catch (e) {
    }
    if (!inf) {
      const m = (await sb.from("dm").select("body,from_id,created_at").eq("id", id).maybeSingle()).data;
      if (!m) {
        toast("الرسالة غير موجودة", true);
        return;
      }
      let nm = "مصوّر";
      try {
        const pr = (await sb.from("profiles").select("display_name").eq("id", m.from_id).maybeSingle()).data;
        if (pr && pr.display_name) nm = pr.display_name;
      } catch (e) {
      }
      inf = { uid: m.from_id, name: nm, email: "", body: m.body, created_at: m.created_at };
    }
    const when = new Date(inf.created_at).toLocaleDateString("ar-SA");
    await sb.from("feedback").insert({
      user_id: currentUser()?.id,
      kind: "other",
      body: "🚩 بلاغ عن رسالة خاصة وصلتني بتاريخ " + when,
      admin_note: "المرسِل: " + (inf.name || "مصوّر") + "\n" + (inf.email ? "البريد: " + inf.email + "\n" : "") + "المعرّف: " + inf.uid + "\nالتاريخ: " + when + "\n\nنص الرسالة:\n«" + (inf.body || "") + "»"
    });
    toast("✅ وصل بلاغك — تشوف رد الإدارة بـ«رسائلي»");
    try {
      if (typeof pushNotify12 === "function") {
        pushNotify12({
          title: "🚩 بلاغ جديد",
          body: "رسالة خاصة من " + (inf.name || "مصوّر"),
          url: "/",
          to: "admins"
        });
      }
    } catch (e) {
    }
  } catch (e) {
    toast("تعذر الإبلاغ: " + (e && e.message || ""), true);
  }
}
async function dmUnreadCount5() {
  try {
    if (isAnon()) return 0;
    const r = await sb.from("dm").select("id", { count: "exact", head: true }).eq("to_id", currentUser()?.id).eq("del_to", false).is("read_at", null);
    const n = r.count || 0;
    const b = $("dmBadge");
    if (b) {
      b.textContent = n > 9 ? "9+" : String(n);
      b.style.display = n ? "inline-flex" : "none";
    }
    return n;
  } catch (e) {
    return 0;
  }
}
async function toggleDmOpen(cb) {
  if (isAnon()) return;
  const v = !!cb.checked;
  const { error } = await sb.from("profiles").update({ dm_open: v }).eq("id", currentUser()?.id);
  if (error) {
    dbErr("حفظ التفضيل", error, "تعذر الحفظ");
    cb.checked = !v;
    return;
  }
  toast(v ? "صرت تستقبل الرسائل ✉️" : "أقفلت الرسائل 🔕");
}
async function clearInbox() {
  const isOut = state.dmTab === "out";
  if (!confirm("مسح كل الرسائل " + (isOut ? "المرسلة" : "الواردة") + " من سجلك؟")) return;
  const field = isOut ? { del_from: true } : { del_to: true };
  const { error } = await sb.from("dm").update(field).eq(isOut ? "from_id" : "to_id", currentUser()?.id).eq(isOut ? "del_from" : "del_to", false);
  if (error) {
    toast("تعذر المسح: " + error.message, true);
    return;
  }
  toast("انمسح السجل ✅");
  renderInbox5();
  if (typeof dmUnreadCount5 === "function") dmUnreadCount5();
}
state.myBlocks = /* @__PURE__ */ new Set();
async function sendFeedback() {
  const kind = $("fbKind").value, body = $("fbBody").value.trim();
  if (body.length < 3) return toast("اكتب رسالتك أول", true);
  if (typeof checkText === "function") {
    const bad = checkText(body, { allowLink: true });
    if (bad) {
      toast(bad, true);
      return;
    }
  }
  if (typeof checkRate7 === "function") {
    const lim = await checkRate7("message");
    if (lim) {
      toast(lim, true);
      return;
    }
  }
  const b = $("fbGo");
  b.disabled = true;
  b.textContent = "⏳";
  const { error } = await sb.from("feedback").insert({ user_id: currentUser()?.id, kind, body });
  b.disabled = false;
  b.textContent = "إرسال 📨";
  if (error) {
    toast("تعذر الإرسال: " + error.message, true);
    return;
  }
  if (typeof logRate7 === "function") logRate7("message");
  $("fbBody").value = "";
  toast("وصلت رسالتك للإدارة، شكراً لك 🙏");
  try {
    const KIND = {
      suggestion: "💡 اقتراح",
      complaint: "⚠️ شكوى",
      question: "❓ استفسار",
      other: "📝 رسالة"
    };
    const nm = (await sb.from("profiles").select("display_name").eq("id", currentUser()?.id).maybeSingle()).data?.display_name || "عضو";
    pushNotify12({
      title: (KIND[kind] || "📨 رسالة") + " جديد",
      body: nm + ": " + body.slice(0, 90) + (body.length > 90 ? "…" : ""),
      url: "/",
      to: "admins"
    });
  } catch (e) {
    console.warn("[رسالة] تعذّر إشعار الإدارة", e);
  }
}

// js/features/music.js
var music_exports = {};
__export(music_exports, {
  MUSIC_LIST: () => MUSIC_LIST,
  buildMixedStream: () => buildMixedStream2,
  loadMusicList: () => loadMusicList2,
  musicUrl: () => musicUrl,
  pickOwnMusic: () => pickOwnMusic,
  previewMusic: () => previewMusic,
  renderMusicChips: () => renderMusicChips2,
  stopMixer: () => stopMixer2,
  stopMusicPreview: () => stopMusicPreview2
});
init_db();
init_hub();
init_state();
init_ui();
init_places();
var applyGeo2 = need("applyGeo");
var ghostClear3 = need("ghostClear");
var loadGhosts3 = need("loadGhosts");
var renderFilterRow4 = need("renderFilterRow");
var showClearBtn2 = need("showClearBtn");
var syncPublishBtn2 = need("syncPublishBtn");
var go16 = need("go");
var MUSIC_LIST = [];
state.pickedMusic = null;
state.musicAudio = null;
state.audioCtx = null;
async function loadMusicList2() {
  try {
    const r = await sb.from("music").select("*").eq("active", true).order("created_at");
    MUSIC_LIST = r.data || [];
  } catch (e) {
    MUSIC_LIST = [];
  }
}
function musicUrl(path) {
  return sb.storage.from("music").getPublicUrl(path).data.publicUrl;
}
function renderMusicChips2() {
  const el = $("recMusic");
  if (!el) return;
  el.style.display = "flex";
  el.innerHTML = "";
  const own = document.createElement("button");
  own.className = "m-chip own" + (state.pickedMusic && state.pickedMusic._local ? " on" : "");
  own.textContent = state.pickedMusic && state.pickedMusic._local ? "🎵 " + state.pickedMusic.name.slice(0, 14) : "➕ موسيقاي";
  const openOwn = function(ev) {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    $("recMusicFile").click();
  };
  own.addEventListener("touchend", openOwn, { passive: false });
  own.addEventListener("click", openOwn);
  el.appendChild(own);
  const none = document.createElement("button");
  none.className = "m-chip" + (state.pickedMusic ? "" : " on");
  none.textContent = "🔇 بلا موسيقى";
  none.onclick = () => {
    state.pickedMusic = null;
    stopMusicPreview2();
    renderMusicChips2();
  };
  el.appendChild(none);
  MUSIC_LIST.forEach((m) => {
    const b = document.createElement("button");
    b.className = "m-chip" + (state.pickedMusic && state.pickedMusic.id === m.id ? " on" : "");
    b.textContent = "🎵 " + m.name;
    const pick = function(ev) {
      if (ev) {
        ev.preventDefault();
        ev.stopPropagation();
      }
      state.pickedMusic = m;
      previewMusic(m);
      renderMusicChips2();
    };
    b.addEventListener("touchend", pick, { passive: false });
    b.addEventListener("click", pick);
    el.appendChild(b);
  });
}
function previewMusic(m) {
  try {
    if (!window.__actx) window.__actx = new (window.AudioContext || window.webkitAudioContext)();
    if (window.__actx.state === "suspended") window.__actx.resume();
  } catch (e) {
  }
  const el = document.getElementById("musicPreview");
  if (!el) return;
  try {
    el.pause();
    const src = m._local ? URL.createObjectURL(state.ownMusicFile) : musicUrl(m.path);
    el.onerror = () => {
    };
    el.src = src;
    el.volume = 0.55;
    el.loop = true;
    el.load();
    const pr = el.play();
    if (pr && pr.catch) pr.catch(() => {
    });
    state.musicAudio = el;
  } catch (e) {
  }
}
function stopMusicPreview2() {
  const el = document.getElementById("musicPreview");
  if (el) {
    try {
      el.pause();
    } catch (e) {
    }
  }
  state.musicAudio = null;
}
async function buildMixedStream2(camStream) {
  if (!state.pickedMusic) return camStream;
  const el = document.getElementById("musicPreview");
  if (!el || !el.src) return camStream;
  try {
    if (!window.__actx) window.__actx = new (window.AudioContext || window.webkitAudioContext)();
    state.audioCtx = window.__actx;
    if (state.audioCtx.state === "suspended") {
      try {
        await state.audioCtx.resume();
      } catch (e) {
      }
    }
    const dest = state.audioCtx.createMediaStreamDestination();
    if (camStream.getAudioTracks().length) {
      const micSrc = state.audioCtx.createMediaStreamSource(camStream);
      const micGain = state.audioCtx.createGain();
      micGain.gain.value = 0.9;
      micSrc.connect(micGain).connect(dest);
    }
    if (!el._srcNode) {
      el._srcNode = state.audioCtx.createMediaElementSource(el);
      el._gain = state.audioCtx.createGain();
      el._srcNode.connect(el._gain);
      el._gain.connect(state.audioCtx.destination);
    }
    el._gain.gain.value = 0.45;
    el._gain.connect(dest);
    el.currentTime = 0;
    try {
      await el.play();
    } catch (e) {
    }
    const mixed = new MediaStream();
    camStream.getVideoTracks().forEach((t) => mixed.addTrack(t));
    dest.stream.getAudioTracks().forEach((t) => mixed.addTrack(t));
    window.__mixDest = dest;
    return mixed;
  } catch (e) {
    toast("تعذر دمج الموسيقى — سُجّل بالصوت الأصلي", true);
    return camStream;
  }
}
function stopMixer2() {
  try {
    const el = document.getElementById("musicPreview");
    if (el) {
      try {
        el.pause();
      } catch (e) {
      }
      if (el._gain && window.__mixDest) {
        try {
          el._gain.disconnect(window.__mixDest);
        } catch (e) {
        }
      }
    }
    window.__mixDest = null;
  } catch (e) {
  }
}
state.ownMusicFile = null;
function pickOwnMusic(inp) {
  const f = inp.files[0];
  if (!f) return;
  if (f.size > 8 * 1024 * 1024) {
    toast("الملف كبير — الحد 8 ميجا", true);
    inp.value = "";
    return;
  }
  state.ownMusicFile = f;
  try {
    if (!window.__actx) window.__actx = new (window.AudioContext || window.webkitAudioContext)();
    if (window.__actx.state === "suspended") window.__actx.resume();
  } catch (e) {
  }
  state.pickedMusic = { id: "own", name: f.name.replace(/\.[^.]+$/, ""), path: null, _local: true };
  previewMusic(state.pickedMusic);
  renderMusicChips2();
  inp.value = "";
}

// js/features/notify.js
var notify_exports = {};
__export(notify_exports, {
  initCommBox: () => initCommBox2,
  initInspect: () => initInspect2,
  pushNotify: () => pushNotify13
});
init_state();
init_ui();
init_places();
async function pushNotify13(payload) {
  try {
    const url = (typeof SB_URL !== "undefined" ? SB_URL : "https://gquzjaxpqeggknhipmzk.supabase.co") + "/functions/v1/smart-service";
    const key = typeof SB_KEY !== "undefined" ? SB_KEY : "sb_publishable_BNp6Fg3VLXa1Pf4V6QjncQ_f496PquX";
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": key, "Authorization": "Bearer " + key },
      body: JSON.stringify(payload)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "HTTP " + r.status);
    return j;
  } catch (e) {
    console.warn("push failed", e);
    return null;
  }
}
function initInspect2() {
  state.inspectOn = !!state.banner.inspect_enabled;
}
function initCommBox2() {
  const el = $("commBox");
  if (!el) return;
  const sp = state.banner;
  el.style.display = sp && sp.commercial_enabled ? "block" : "none";
}

// js/features/profile.js
var profile_exports = {};
__export(profile_exports, {
  closeFollows: () => closeFollows,
  loadUserBadges: () => loadUserBadges,
  openMyProfile: () => openMyProfile,
  openProfile: () => openProfile3,
  openShooters: () => openShooters4,
  renderFollow: () => renderFollow3,
  renderProfFeed: () => renderProfFeed3,
  renderProfTabs: () => renderProfTabs3,
  renderShooters: () => renderShooters,
  shSetSort: () => shSetSort,
  showFollows: () => showFollows,
  switchProfTab: () => switchProfTab,
  toggleFollow: () => toggleFollow
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var openAcc9 = need("openAcc");
var renderAccIn7 = need("renderAccIn");
var go17 = need("go");
var maybeAskNotifs9 = need("maybeAskNotifs");
var checkRaceProgress7 = need("checkRaceProgress");
var closeSheet7 = need("closeSheet");
var loadPhotos13 = need("loadPhotos");
var openSheet7 = need("openSheet");
var pushNotify14 = need("pushNotify");
var refreshOne3 = need("refreshOne");
var render11 = need("render");
var showJoinBox6 = need("showJoinBox");
var coverUrl2 = need("coverUrl");
async function openProfile3(uid) {
  go17("profile");
  state.profUid = uid;
  state.profTab = "public";
  $("profHead").innerHTML = '<div class="loader">⏳</div>';
  const r = await sb.from("profiles").select("display_name,bio,region,avatar_path,cover_path,dm_open,dm_banned").eq("id", uid).maybeSingle();
  const pr = r.data || {};
  const mine = state.photos.filter((x) => x.user_id === uid);
  const pub = mine.filter((x) => x.visibility !== "private");
  const totV = pub.reduce((s, x) => s + (x.views || 0), 0);
  const rk = mine.length ? rankOf(mine[0]) : { ic: "🌱", t: "مستكشف", c: "bronze" };
  const fo = mine.length ? mine[0].followers_count || 0 : 0;
  let fg = 0;
  try {
    const fr = await sb.from("follows").select("followed_id", { count: "exact", head: true }).eq("follower_id", uid);
    fg = fr.count || 0;
  } catch (e) {
  }
  const isMe = !!(currentUser() && currentUser()?.id === uid);
  let coverSrc = "";
  if (pr.cover_path) coverSrc = coverUrl2(pr.cover_path) + "?t=" + Date.now();
  else if (pub.length) {
    const top1 = pub.slice().sort((a, b) => (b.avg_stars || 0) - (a.avg_stars || 0))[0];
    if (top1) coverSrc = thumbUrl(top1.image_path);
  }
  const av = pr.avatar_path ? avatarUrl(pr.avatar_path) + "?t=" + Date.now() : "";
  $("profHead").innerHTML = `
    <div class="pf-cover">
      ${coverSrc ? `<img src="${coverSrc}" alt="">` : '<div class="pf-cover-empty">🏔️</div>'}
      ${isMe ? `<button class="pf-cam" onclick="go('acc')">🖼️ غيّره من حسابي</button>` : ""}
    </div>
    <div class="pf-head">
      <div class="pf-avatar-wrap">
        ${av ? `<img class="pf-avatar" src="${av}" alt="">` : `<div class="pf-avatar-ph">${rk.ic}</div>`}
        ${isMe ? `<button class="pf-avatar-cam" onclick="document.getElementById('avatarFile').click()" title="غيّر صورتك">📷</button>` : ""}
      </div>
      <div class="pf-name">${esc(pr.display_name || "مصوّر")}</div>
      <div class="pf-meta">
        <span class="rankchip r-${rk.c}">${rk.ic} ${rk.t}</span>
        ${pr.region ? " · 📍 " + esc(pr.region) : ""}
      </div>
      ${pr.bio ? `<div class="pf-bio">${esc(pr.bio)}</div>` : ""}
      <div class="pf-stats">
        <div class="pf-stat"><b>${pub.length}</b><span>صورة</span></div>
        <div class="pf-stat" onclick="showFollows('${uid}','followers')"><b>${fo}</b><span>متابع</span></div>
        <div class="pf-stat" onclick="showFollows('${uid}','following')"><b>${fg}</b><span>يتابع</span></div>
        <div class="pf-stat"><b>${totV}</b><span>مشاهدة</span></div>
      </div>
      <div class="pf-acts">
        <button class="pf-act" onclick="shareProfile('${uid}')">📤 شارك</button>
        ${!isMe && currentUser() && !isAnon() && pr.dm_open !== false && !(state.myBlocks && state.myBlocks.has(uid)) ? `<button class="pf-act" onclick="openDmBox('${uid}','${esc(pr.display_name || "مصوّر")}')">✉️ راسله</button>` : ""}
        ${!isMe && currentUser() && !isAnon() ? state.myBlocks && state.myBlocks.has(uid) ? `<button class="pf-act" style="border-color:var(--palm);color:var(--palm)" onclick="unblockUser('${uid}','${esc(pr.display_name || "مصوّر")}')">✅ فك الحظر</button>` : `<button class="pf-act" style="border-color:var(--sadu);color:var(--sadu)" onclick="blockUser('${uid}','${esc(pr.display_name || "مصوّر")}')">🚫 احظره</button>` : ""}
      </div>
      ${!isMe && state.isAdmin ? `
      <div class="pf-admin">
        <div class="pa-lbl">🛡️ أدوات الإشراف</div>
        <div class="pa-row">
          ${pr.dm_banned ? `<button class="pa-btn ok" onclick="admProfDmBan('${uid}',false,'${esc(pr.display_name || "مصوّر").replace(/'/g, "&#39;")}')">✅ ارفع منع المراسلة</button>` : `<button class="pa-btn bad" onclick="admProfDmBan('${uid}',true,'${esc(pr.display_name || "مصوّر").replace(/'/g, "&#39;")}')">🚫 امنعه من المراسلة</button>`}
        </div>
        ${pr.dm_banned ? '<div class="pa-note">🚫 ممنوع من إرسال الرسائل حالياً</div>' : ""}
      </div>` : ""}
      <div style="display:none">
        ${isMe ? `<button class="pf-act primary" onclick="go('acc')">⚙️ عدّل بياناتي</button>` : ""}
      </div>
      <div class="pf-badges" id="profBadges"></div>
    </div>
    ${isMe ? `<div class="prof-tabs" id="profTabs"></div>` : ""}`;
  loadUserBadges(uid).then((bs) => {
    const be = $("profBadges");
    if (!be) return;
    be.innerHTML = bs.map((b) => `<span class="prof-badge">${b.badge_icon || "🏆"} ${esc(b.badge_name || b.title)}</span>`).join("");
  });
  renderProfTabs3();
  renderProfFeed3();
}
function renderProfTabs3() {
  const el = $("profTabs");
  if (!el) return;
  const mine = state.photos.filter((x) => x.user_id === state.profUid);
  const pub = mine.filter((x) => x.visibility !== "private").length;
  const prv = mine.filter((x) => x.visibility === "private").length;
  el.innerHTML = `
    <button class="prof-tab ${state.profTab === "public" ? "on" : ""}" onclick="switchProfTab('public')">🌍 عامة (${pub})</button>
    <button class="prof-tab ${state.profTab === "private" ? "on" : ""}" onclick="switchProfTab('private')">🔒 خزنتي (${prv})</button>`;
}
function switchProfTab(t) {
  state.profTab = t;
  renderProfTabs3();
  renderProfFeed3();
}
function renderProfFeed3() {
  const el = $("profFeed");
  if (!el) return;
  const isMe = !!(currentUser() && currentUser()?.id === state.profUid);
  let list = state.photos.filter((x) => x.user_id === state.profUid);
  list = isMe ? list.filter((x) => state.profTab === "private" ? x.visibility === "private" : x.visibility !== "private") : list.filter((x) => x.visibility !== "private");
  if (!list.length) {
    el.innerHTML = isMe && state.profTab === "private" ? '<div class="vault-empty">🔒 خزنتك فاضية<br><span style="font-size:12px">عند النشر اختر «خزنتي»</span></div>' : '<div class="empty">ما نشر صوراً بعد</div>';
    return;
  }
  el.innerHTML = list.map((p) => {
    const isV = p.media_type === "video";
    const src = isV ? vidUrl(p.image_path) : thumbUrl(p.image_path);
    return `<div class="mcard" onclick="openSheet(${p.id})">
      ${isV ? `<video src="${src}#t=0.5" muted playsinline preload="metadata"></video>` : `<img src="${src}" onerror="this.onerror=null;this.src='${imgUrl(p.image_path)}'" loading="lazy" decoding="async" alt="${esc(p.title)}">`}
      ${p.visibility === "private" ? '<div class="mc-lock">🔒</div>' : ""}
      ${isV ? '<div class="mc-vid">▶</div>' : ""}
      <div class="mc-overlay"><div class="mc-title">${esc(p.title)}</div></div>
    </div>`;
  }).join("");
}
async function renderFollow3(p) {
  const el = $("sFollow");
  if (!el) return;
  const mine = currentUser() && p.user_id === currentUser()?.id;
  let following = false;
  if (currentUser() && !isAnon() && !mine) {
    const r = await sb.from("follows").select("follower_id").eq("follower_id", currentUser()?.id).eq("followed_id", p.user_id).maybeSingle();
    following = !!r.data;
  }
  const rk = rankOf(p);
  el.innerHTML = `<span class="rankchip r-${rk.c}" style="cursor:pointer" onclick="closeSheet();openProfile('${p.user_id}')">${rk.ic} ${rk.t}</span><span class="fcount">👥 ${p.followers_count || 0} متابع</span>` + (mine ? "" : `<button class="fbtn ${following ? "on" : ""}" onclick="toggleFollow('${p.user_id}',${following})">${following ? "✓ متابَع" : "＋ متابعة"}</button>`) + `<button class="fbtn fav ${state.favSet.has(p.id) ? "on" : ""}" onclick="toggleFav(${p.id})">${state.favSet.has(p.id) ? "❤️ بالمفضلة" : "🤍 حفظ"}</button>`;
}
async function toggleFollow(uid, isF) {
  if (isAnon()) {
    toast("سجّل أول عشان تتابع المصورين 👥");
    closeSheet7();
    openAcc9();
    return;
  }
  if (isF) {
    await sb.from("follows").delete().eq("follower_id", currentUser()?.id).eq("followed_id", uid);
  } else {
    const { error } = await sb.from("follows").insert({ follower_id: currentUser()?.id, followed_id: uid });
    if (error) {
      dbErr("المتابعة", error, "تعذرت المتابعة");
      return;
    }
    toast("صرت متابعاً 👥");
  }
  await refreshOne3();
  renderFollow3(state.curPhoto);
}
async function showFollows(uid, kind) {
  const el = $("followsBox");
  if (!el) return;
  el.classList.add("show");
  $("fbTitle").textContent = kind === "followers" ? "👥 المتابعون" : "👤 يتابعهم";
  $("fbList").innerHTML = '<div class="loader" style="padding:20px">⏳</div>';
  try {
    const col = kind === "followers" ? "follower_id" : "followed_id";
    const filt = kind === "followers" ? "followed_id" : "follower_id";
    const r = await sb.from("follows").select(col + ",profiles!" + col + "(id,display_name,avatar_path,region)").eq(filt, uid);
    const list = (r.data || []).map((x) => x.profiles).filter(Boolean);
    if (!list.length) {
      $("fbList").innerHTML = '<div style="padding:22px;text-align:center;font-size:13px;color:var(--txt-dim)">' + (kind === "followers" ? "ما فيه متابعون بعد" : "ما يتابع أحداً بعد") + "</div>";
      return;
    }
    $("fbList").innerHTML = list.map((u) => `
      <div class="fb-row" onclick="closeFollows();openProfile('${u.id}')">
        ${u.avatar_path ? `<img src="${avatarUrl(u.avatar_path)}" alt="">` : '<div class="fb-ph">📷</div>'}
        <div class="fb-info">
          <div class="fb-name">${esc(u.display_name || "مصوّر")}</div>
          ${u.region ? `<div class="fb-reg">📍 ${esc(u.region)}</div>` : ""}
        </div>
        <span class="fb-go">←</span>
      </div>`).join("");
  } catch (e) {
    $("fbList").innerHTML = '<div style="padding:20px;text-align:center;font-size:12px;color:var(--txt-dim)">تعذر التحميل</div>';
  }
}
function closeFollows() {
  const el = $("followsBox");
  if (el) el.classList.remove("show");
}
async function loadUserBadges(uid) {
  try {
    const c = await sb.from("quest_completions").select("quest_id").eq("user_id", uid);
    const ids = (c.data || []).map((x) => x.quest_id);
    if (!ids.length) return [];
    const q = await sb.from("quests").select("id,badge_icon,badge_name,title").in("id", ids);
    return q.data || [];
  } catch (e) {
    return [];
  }
}
function openShooters4() {
  go17("shooters");
  renderShooters();
}
function shSetSort(s) {
  state.shSort = s;
  renderShooters();
}
async function renderShooters() {
  const el = $("shootersBody");
  if (!el) return;
  el.innerHTML = '<div class="loader" style="padding:20px">⏳</div>';
  const sb_ = $("shSort");
  const S = state.shSort;
  if (sb_) {
    sb_.innerHTML = [
      ["photos", "📷 الأكثر نشراً"],
      ["stars", "⭐ الأعلى تقييماً"],
      ["visits", "👣 الأكثر زيارة"],
      ["new", "🕐 الأحدث"]
    ].map((x) => `<button class="${S === x[0] ? "on" : ""}" onclick="shSetSort('${x[0]}')">${x[1]}</button>`).join("");
  }
  try {
    const agg = {};
    state.photos.filter((p) => p.visibility !== "private").forEach((p) => {
      if (!p.user_id) return;
      const a = agg[p.user_id] = agg[p.user_id] || {
        uid: p.user_id,
        name: p.photographer || "مصوّر",
        n: 0,
        stars: 0,
        rated: 0,
        visits: 0,
        last: p.created_at,
        region: p.region || ""
      };
      a.n++;
      if (p.avg_stars > 0) {
        a.stars += Number(p.avg_stars);
        a.rated++;
      }
      a.visits += state.visitCounts[p.id] || 0;
      if (p.created_at > a.last) a.last = p.created_at;
      if (!a.region && p.region) a.region = p.region;
    });
    let list = Object.values(agg);
    if (!list.length) {
      el.innerHTML = '<div class="empty" style="padding:26px"><span class="big">📷</span>ما فيه مصوّرون بعد</div>';
      return;
    }
    list.forEach((a) => {
      a.avg = a.rated ? a.stars / a.rated : 0;
    });
    if (S === "stars") list.sort((x, y) => y.avg - x.avg || y.n - x.n);
    else if (S === "visits") list.sort((x, y) => y.visits - x.visits || y.n - x.n);
    else if (S === "new") list.sort((x, y) => new Date(y.last) - new Date(x.last));
    else list.sort((x, y) => y.n - x.n || y.avg - x.avg);
    const avatars = {};
    try {
      const ids = list.slice(0, 60).map((a) => a.uid);
      const pr = await sb.from("profiles").select("id,avatar_path,region").in("id", ids);
      (pr.data || []).forEach((u) => {
        avatars[u.id] = { av: u.avatar_path, rg: u.region };
      });
    } catch (e) {
    }
    el.innerHTML = list.slice(0, 60).map((a, i) => {
      const inf = avatars[a.uid] || {};
      const rg = inf.rg || a.region;
      const medal = i < 3 && S !== "new" ? ["🥇", "🥈", "🥉"][i] : "";
      const rk = typeof rankOf === "function" ? rankOf({ photographer_photos: a.n }) : { ic: "🌱" };
      return `<div class="sh-card" onclick="openProfile('${a.uid}')">
        ${medal ? `<div class="sh-medal">${medal}</div>` : ""}
        ${inf.av ? `<img class="sh-av" src="${avatarUrl(inf.av)}" alt="">` : '<div class="sh-av sh-ph">📷</div>'}
        <div class="sh-info">
          <div class="sh-name">${rk.ic} ${esc(a.name)}</div>
          ${rg ? `<div class="sh-reg">📍 ${esc(rg)}</div>` : ""}
          <div class="sh-stats">
            <span>📷 ${a.n}</span>
            ${a.avg > 0 ? `<span>⭐ ${a.avg.toFixed(1)}</span>` : ""}
            ${a.visits > 0 ? `<span>👣 ${a.visits}</span>` : ""}
          </div>
        </div>
        <span class="sh-go">←</span>
      </div>`;
    }).join("");
  } catch (e) {
    el.innerHTML = '<div class="empty" style="padding:20px">تعذر التحميل</div>';
  }
}
state.onlyEc = false;
function openMyProfile() {
  const u = currentUser();
  if (!u || isAnon()) {
    toast("سجّل أول عشان يكون لك بروفايل 👤", true);
    return;
  }
  openProfile3(u.id);
}

// js/features/promo.js
var promo_exports = {};
__export(promo_exports, {
  PROMO_ID: () => PROMO_ID,
  closePromo: () => closePromo,
  openPromo: () => openPromo,
  promoCopy: () => promoCopy,
  promoDownload: () => promoDownload,
  promoOpen: () => promoOpen,
  promoText: () => promoText
});
init_media();
init_state();
init_ui();
init_places();
init_hub();
var shareCard2 = need("shareCard");
var PROMO_ID = null;
function openPromo(pid) {
  if (!state.isAdmin) {
    toast("للمشرف فقط", true);
    return;
  }
  const p = state.photos.find((x) => x.id === pid) || (state.admPhotos || []).find((x) => x.id === pid);
  if (!p) {
    toast("الصورة غير موجودة بالقائمة الحالية", true);
    return;
  }
  PROMO_ID = pid;
  const loc = p.abroad ? p.country || p.city : (p.village ? p.village + " · " : "") + p.city;
  const txt = "📸 " + p.title + "\n📍 " + loc + "\n📷 عدسة " + (p.photographer || "مصوّر") + "\n\nمن «صورة من بلدي» — عدسات أهل الديار 🇸🇦";
  $("pmText").value = txt;
  $("pmPreview").src = thumbUrl(p.image_path);
  $("promoBox").classList.add("show");
}
function closePromo() {
  const el = $("promoBox");
  if (el) el.classList.remove("show");
  PROMO_ID = null;
}
function promoText() {
  return ($("pmText") ? $("pmText").value : "") + "\n\nhttps://sowra.app";
}
async function promoCopy() {
  try {
    await navigator.clipboard.writeText(promoText());
    toast("انتسخ النص ✅ — الصقه بالمنصة");
  } catch (e) {
    toast("تعذر النسخ", true);
  }
}
async function promoDownload() {
  const p = state.photos.find((x) => x.id === PROMO_ID);
  if (!p) {
    toast("الصورة غير موجودة", true);
    return;
  }
  closePromo();
  shareCard2(p);
}
function promoOpen(net) {
  const t = encodeURIComponent(promoText());
  const u = encodeURIComponent("https://sowra.app");
  const links = {
    x: "https://twitter.com/intent/tweet?text=" + t,
    wa: "https://wa.me/?text=" + t,
    tg: "https://t.me/share/url?url=" + u + "&text=" + encodeURIComponent($("pmText").value),
    ig: "https://www.instagram.com/"
  };
  if (net === "ig") {
    promoCopy();
    toast("انتسخ النص — نزّل الصورة والصقه بإنستقرام");
  }
  window.open(links[net], "_blank", "noopener");
}

// js/features/quests.js
var quests_exports = {};
__export(quests_exports, {
  QUESTS: () => QUESTS,
  loadQuests: () => loadQuests,
  openQuests: () => openQuests4
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var go18 = need("go");
var pushNotify15 = need("pushNotify");
var render12 = need("render");
var QUESTS = [];
state.qStops = {};
state.qDone = /* @__PURE__ */ new Set();
async function loadQuests() {
  try {
    const q = await sb.from("quests").select("*").eq("active", true).order("created_at", { ascending: false });
    QUESTS = q.data || [];
    if (!QUESTS.length) return;
    const s = await sb.from("quest_stops").select("*");
    state.qStops = {};
    (s.data || []).forEach((x) => {
      (state.qStops[x.quest_id] = state.qStops[x.quest_id] || []).push(x.photo_id);
    });
    if (currentUser() && !isAnon()) {
      const c = await sb.from("quest_completions").select("quest_id").eq("user_id", currentUser()?.id);
      state.qDone = new Set((c.data || []).map((x) => x.quest_id));
    }
  } catch (e) {
  }
}
async function openQuests4() {
  go18("quests");
  $("questList").innerHTML = '<div class="loader">⏳</div>';
  await loadQuests();
  if (!QUESTS.length) {
    $("questList").innerHTML = '<div class="empty"><span class="big">🗺️</span>ما فيه رحلات نشطة حالياً<br>ترقّب رحلة الموسم القادم</div>';
    return;
  }
  let myVisits = /* @__PURE__ */ new Set();
  if (currentUser() && !isAnon()) {
    const v = await sb.from("visits").select("photo_id").eq("user_id", currentUser()?.id);
    myVisits = new Set((v.data || []).map((x) => x.photo_id));
  }
  $("questList").innerHTML = QUESTS.map((q) => {
    const stops = state.qStops[q.id] || [];
    const done = stops.filter((id) => myVisits.has(id)).length;
    const pct = stops.length ? Math.round(done / stops.length * 100) : 0;
    const finished = done >= stops.length && stops.length > 0;
    let left = "";
    if (q.ends_at) {
      const d = Math.ceil((new Date(q.ends_at) - /* @__PURE__ */ new Date()) / 864e5);
      left = d > 0 ? `باقي ${d} ${d === 1 ? "يوم" : "أيام"}` : "انتهت";
    }
    return `<div class="quest-card ${finished ? "done" : ""}">
      <div class="q-head">
        <span class="q-badge">${q.badge_icon || "🏆"}</span>
        <div class="q-info">
          <div class="q-title">${esc(q.title)}</div>
          <div class="q-sub">${esc(q.subtitle || "")}${q.region ? " · " + esc(q.region) : ""}</div>
        </div>
      </div>
      ${q.sponsor ? `<div class="q-sponsor">برعاية <b>${esc(q.sponsor)}</b>${q.prize ? ` · 🎁 ${esc(q.prize)}` : ""}</div>` : ""}
      <div class="q-bar"><div class="q-fill" style="width:${pct}%"></div></div>
      <div class="q-meta">
        <span>${done} من ${stops.length} كنز</span>
        ${left ? `<span>${left}</span>` : ""}
      </div>
      ${finished ? `<div class="q-win">🎉 أكملت الرحلة — شارة «${esc(q.badge_name || q.title)}» لك!</div>` : ""}
      <div class="q-stops">${stops.map((id) => {
      const p = state.photos.find((x) => x.id === id);
      if (!p) return "";
      const got = myVisits.has(id);
      return `<div class="q-stop ${got ? "got" : ""}" onclick="openSheet(${id})">
          <img src="${thumbUrl(p.image_path)}" onerror="this.onerror=null;this.src='${imgUrl(p.image_path)}'" loading="lazy" alt="${esc(p.title)}">
          ${got ? '<div class="q-check">✓</div>' : ""}
          <div class="q-stop-name">${esc(p.village || p.city)}</div>
        </div>`;
    }).join("")}</div>
    </div>`;
  }).join("");
  QUESTS.forEach(async (q) => {
    const stops = state.qStops[q.id] || [];
    if (!stops.length || state.qDone.has(q.id)) return;
    const done = stops.filter((id) => myVisits.has(id)).length;
    if (done >= stops.length && currentUser() && !isAnon()) {
      await sb.from("quest_completions").insert({ quest_id: q.id, user_id: currentUser()?.id });
      state.qDone.add(q.id);
      toast("🎉 أكملت رحلة «" + q.title + "» — مبروك الشارة!");
    }
  });
}

// js/features/race.js
var race_exports = {};
__export(race_exports, {
  checkRaceProgress: () => checkRaceProgress8,
  detectMyRegion: () => detectMyRegion4,
  loadRace: () => loadRace4,
  openRace: () => openRace4
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var go19 = need("go");
var pushNotify16 = need("pushNotify");
var render13 = need("render");
async function loadRace4() {
  try {
    const r = await sb.from("region_scores").select("*").order("total", { ascending: false });
    state.race = r.data || [];
  } catch (e) {
    state.race = [];
  }
}
function detectMyRegion4() {
  if (!window.__USER_LAT || !state.photos.length) return "";
  const d = (p) => Math.hypot((p.lat - window.__USER_LAT) * 111, (p.lng - window.__USER_LNG) * 111 * Math.cos(window.__USER_LAT * Math.PI / 180));
  const geoPts = state.photos.filter((p) => p.lat && p.lng && !p.abroad && p.region);
  if (!geoPts.length) return "";
  const near = geoPts.slice().sort((a, b) => d(a) - d(b))[0];
  return near && d(near) <= 120 ? near.region : "";
}
async function openRace4() {
  go19("race");
  const el = $("raceList");
  if (!el) return;
  el.innerHTML = '<div class="loader">⏳</div>';
  await loadRace4();
  if (!state.race.length) {
    el.innerHTML = '<div class="empty"><span class="big">🏁</span>السباق ما بدأ بعد<br><span style="font-size:13px;color:var(--txt-dim)">انشر أول صورة وافتح السباق لمنطقتك</span></div>';
    return;
  }
  state.myRegion = state.myRegion || detectMyRegion4();
  const medals = ["🥇", "🥈", "🥉"];
  let html = "";
  state.race.forEach((r, i) => {
    const mine = state.myRegion && r.region === state.myRegion;
    html += `<div class="race-row ${i === 0 ? "top1" : ""} ${mine ? "mine" : ""}">
      <div class="race-pos">${medals[i] || i + 1}</div>
      <div class="race-info">
        <div class="race-name">${esc(r.region)}${mine ? ' <span style="font-size:11px;color:var(--sadu)">· ديرتك</span>' : ""}</div>
        <div class="race-sub">📸 ${r.photos} صورة · 🎖️ ${r.photographers} مصوّر</div>
      </div>
      <div class="race-pts">${r.total} <span>نقطة</span></div>
    </div>`;
    if (mine && i > 0) {
      const gap = state.race[i - 1].total - r.total;
      const gapNeed = Math.ceil(gap / 10);
      html += `<div class="race-gap">🔥 تحتاج <b>${gapNeed}</b> ${gapNeed === 1 ? "صورة" : "صور"} لتتجاوز <b>${esc(state.race[i - 1].region)}</b></div>`;
    }
  });
  el.innerHTML = html;
}
async function checkRaceProgress8() {
  try {
    if (isAnon()) return;
    const reg = state.myRegion || detectMyRegion4();
    if (!reg) return;
    await loadRace4();
    const idx = state.race.findIndex((r) => r.region === reg);
    if (idx < 0) return;
    const rank = idx + 1;
    let prev = null;
    try {
      prev = parseInt(localStorage.getItem("sowra_rank_" + reg));
    } catch (e) {
    }
    try {
      localStorage.setItem("sowra_rank_" + reg, String(rank));
    } catch (e) {
    }
    if (prev && rank < prev) {
      const up = prev - rank;
      pushNotify16({
        title: "🏁 " + reg + " تقدّمت!",
        body: "صعدت " + (up === 1 ? "مركزاً" : up + " مراكز") + " — الترتيب الآن #" + rank,
        url: "/",
        user_ids: [currentUser()?.id]
      });
    }
  } catch (e) {
  }
}

// js/features/rating.js
var rating_exports = {};
__export(rating_exports, {
  BADGES: () => BADGES,
  addComment: () => addComment,
  drawStars: () => drawStars,
  notifyRating: () => notifyRating,
  rate: () => rate,
  refreshOne: () => refreshOne4,
  renderComments: () => renderComments,
  renderPoll: () => renderPoll,
  reportPhoto: () => reportPhoto,
  topBadge: () => topBadge,
  voteBadge: () => voteBadge
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var filterCss4 = need("filterCss");
var gpUpdateInfo3 = need("gpUpdateInfo");
var openAcc10 = need("openAcc");
var bumpJoinCounter3 = need("bumpJoinCounter");
var checkRate8 = need("checkRate");
var loadPhotos14 = need("loadPhotos");
var logRate8 = need("logRate");
var moveToVault3 = need("moveToVault");
var publishFromVault3 = need("publishFromVault");
var pushNotify17 = need("pushNotify");
var render14 = need("render");
var renderClaim3 = need("renderClaim");
var renderFollow4 = need("renderFollow");
var renderProfFeed4 = need("renderProfFeed");
var renderProfTabs4 = need("renderProfTabs");
var renderVault6 = need("renderVault");
var renderVisits2 = need("renderVisits");
var setView4 = need("setView");
var shareCard3 = need("shareCard");
var tagName2 = need("tagName");
var get2 = need("get");
var closeSheet8 = need("closeSheet");
function drawStars() {
  $("bigStars").innerHTML = [1, 2, 3, 4, 5].map((n) => `<button class="${n <= state.myRating ? "lit" : ""}" onclick="rate(${n})">★</button>`).join("");
  $("sAvg").textContent = `المتوسط ${Number(state.curPhoto.avg_stars).toFixed(1)} من 5 · ${state.curPhoto.ratings_count} تقييم`;
}
async function rate(n) {
  const prev = state.myRating;
  state.myRating = n;
  drawStars();
  const { error } = await sb.from("ratings").upsert({ photo_id: state.curId, user_id: currentUser()?.id, stars: n });
  if (error) {
    state.myRating = prev;
    drawStars();
    dbErr("حفظ التقييم", error, "تعذر حفظ التقييم");
    return;
  }
  $("thanks").style.display = "block";
  await refreshOne4();
  notifyRating(state.curId);
}
async function notifyRating(pid) {
  try {
    const ph = state.photos.find((x) => x.id === pid);
    if (!ph || !ph.user_id || !currentUser() || ph.user_id === currentUser()?.id) return;
    const r = await sb.from("ratings").select("stars").eq("photo_id", pid);
    const list = (r.data || []).map((x) => x.stars);
    const n = list.length;
    if (![1, 3, 10, 25, 50].includes(n)) return;
    const avg = (list.reduce((s, x) => s + x, 0) / n).toFixed(1);
    const cnt = n === 1 ? "تقييم واحد" : n === 2 ? "تقييمان" : n <= 10 ? n + " تقييمات" : n + " تقييماً";
    pushNotify17({
      title: "⭐ صورتك نالت " + avg,
      body: "«" + ph.title + "» — " + cnt + " حتى الآن",
      url: "/",
      user_ids: [ph.user_id]
    });
  } catch (e) {
  }
}
function renderPoll() {
  const b = state.curPhoto.badge_counts || {};
  $("pollChips").innerHTML = BADGES.map(
    (bd) => `<div class="chip ${state.myBadgeSet.has(bd.k) ? "on" : ""}" onclick="voteBadge('${bd.k}')">${bd.label}<span class="n">${b[bd.k] || 0}</span></div>`
  ).join("");
}
async function voteBadge(k) {
  if (state.myBadgeSet.has(k)) {
    state.myBadgeSet.delete(k);
    renderPoll();
    await sb.from("badge_votes").delete().eq("photo_id", state.curId).eq("user_id", currentUser()?.id).eq("badge_key", k);
  } else {
    state.myBadgeSet.add(k);
    renderPoll();
    const { error } = await sb.from("badge_votes").insert({ photo_id: state.curId, user_id: currentUser()?.id, badge_key: k });
    if (error) {
      state.myBadgeSet.delete(k);
      renderPoll();
      dbErr("تصويت الوسام", error, "تعذر التصويت");
      return;
    }
  }
  await refreshOne4();
}
var BADGES = [
  { k: "wall", label: "📱 خلفية شاشة" },
  { k: "mine", label: "❤️ بحطها خلفية جوالي" },
  { k: "global", label: "🌍 تدخل مسابقات عالمية" },
  { k: "face", label: "🇸🇦 واجهة تشرّف السعودية" },
  { k: "print", label: "🖼️ تستاهل تنطبع لوحة" }
];
function topBadge(p) {
  const b = p.badge_counts || {};
  let best = null, bv = 0;
  for (const bd of BADGES) if ((b[bd.k] || 0) > bv) {
    bv = b[bd.k];
    best = bd;
  }
  return bv >= 2 ? best : null;
}
function renderComments() {
  const list = state.curPhoto._comments || [];
  $("cCount").textContent = `(${list.length})`;
  $("cList").innerHTML = list.length ? list.map((c) => `<div class="comment"><b>${esc(c.profiles?.display_name || "زائر")}</b>${esc(c.body)}</div>`).join("") : `<div style="color:var(--txt-dim);font-size:13px;padding:6px 2px">كن أول من يعلق ✍️</div>`;
}
async function reportPhoto() {
  if (!confirm("هل أنت متأكد أن هذه الصورة مخالفة؟ البلاغات الكيدية قد تعرّض حسابك للحظر.")) return;
  const { error } = await sb.from("reports").insert({ photo_id: state.curId, user_id: currentUser()?.id });
  if (error) {
    if (error.code === "23505") toast("سبق أن أبلغت عن هذه الصورة");
    else toast("تعذر إرسال البلاغ", true);
    return;
  }
  toast("وصل بلاغك، شكراً لحرصك 🙏");
}
async function addComment() {
  if (isAnon()) {
    toast("سجّل أول عشان تعلق ✍️");
    closeSheet8();
    openAcc10();
    return;
  }
  const t = $("cText").value.trim();
  if (!t) return;
  const bad = checkText(t);
  if (bad) {
    toast(bad, true);
    return;
  }
  const lim = await checkRate8("comment");
  if (lim) {
    toast(lim, true);
    return;
  }
  const { error } = await sb.from("comments").insert({ photo_id: state.curId, user_id: currentUser()?.id, body: t });
  if (error) {
    dbErr("إرسال التعليق", error, "تعذر إرسال التعليق");
    return;
  }
  logRate8("comment");
  $("cText").value = "";
  const cm = await sb.from("comments").select("body,created_at,profiles!user_id(display_name)").eq("photo_id", state.curId).order("created_at");
  state.curPhoto._comments = cm.data || [];
  renderComments();
  try {
    const ph = state.curPhoto;
    if (ph && ph.user_id && currentUser() && ph.user_id !== currentUser()?.id) {
      const nm = (await sb.from("profiles").select("display_name").eq("id", currentUser()?.id).maybeSingle()).data?.display_name || "أحدهم";
      pushNotify17({
        title: "💬 تعليق جديد على صورتك",
        body: nm + ": " + t.slice(0, 80) + (t.length > 80 ? "…" : ""),
        url: "./?p=" + ph.id,
        /* نسبي — يصحّ باللاب وبالإنتاج معاً */
        user_ids: [ph.user_id]
      });
    }
  } catch (e) {
    console.warn("[تعليق] تعذّر الإشعار", e);
  }
}
async function refreshOne4() {
  const { data } = await sb.from("photos_ranked").select("*").eq("id", state.curId).single();
  if (data) {
    const i = state.photos.findIndex((x) => x.id === state.curId);
    if (i > -1) state.photos[i] = { ...data, _comments: state.curPhoto._comments };
    state.curPhoto = state.photos[i];
    drawStars();
    renderPoll();
    render14();
  }
}

// js/features/reels.js
var reels_exports = {};
__export(reels_exports, {
  initVideoUpload: () => initVideoUpload5,
  openReels: () => openReels,
  reelDelete: () => reelDelete,
  reelFav: () => reelFav,
  reelProfile: () => reelProfile,
  reelReport: () => reelReport,
  reelShare: () => reelShare,
  reelToMap: () => reelToMap,
  reelsRecord: () => reelsRecord,
  renderReels: () => renderReels,
  setupReelPlayback: () => setupReelPlayback,
  stopAllReels: () => stopAllReels4,
  toggleReelMute: () => toggleReelMute
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var _seenViews_ = () => get("seenViews");
var filterCss5 = need("filterCss");
var initRecBtn2 = need("initRecBtn");
var recOpen2 = need("recOpen");
var recSupported2 = need("recSupported");
var go20 = need("go");
var loadPhotos15 = need("loadPhotos");
var openProfile4 = need("openProfile");
var toggleFav2 = need("toggleFav");
async function openReels() {
  const _sp = state.banner;
  if (!_sp.video_enabled && !_sp.reels_soon) {
    toast("🎬 الأضواء غير متاحة حالياً", true);
    return;
  }
  go20("reels");
  const wrap = $("reelsWrap");
  if (!wrap) return;
  const _rs = state.banner && "reels_soon" in state.banner ? state.banner.reels_soon : state.banner && state.banner.reels_soon;
  if (_rs) {
    wrap.innerHTML = `<div class="reels-soon">
      <div class="rs-ic">🎬</div>
      <div class="rs-title">أضواء الديرة</div>
      <div class="rs-badge">قريباً</div>
      <div class="rs-txt">
        الصورة تريك كيف <b>يبدو</b> المكان<br>
        والمقطع يريك كيف <b>يُحَس</b>
      </div>
      <div class="rs-list">
        <div>🌬️ صوت الريح على القمم</div>
        <div>💧 خرير الماء بالأودية</div>
        <div>🚶 وقع الخطى على الدرب</div>
      </div>
      <div class="rs-foot">جهّز عدستك — نفتحها قريباً بإذن الله</div>
    </div>`;
    return;
  }
  wrap.innerHTML = '<div class="reels-empty"><span class="big">⏳</span></div>';
  state.reelsList = state.photos.filter((p) => p.media_type === "video");
  if (!state.reelsList.length) {
    wrap.innerHTML = `<div class="reels-empty">
      <span class="big">🎬</span>
      <div style="font-size:16px;font-weight:700">ما فيه مقاطع بعد</div>
      <div style="font-size:13px;line-height:1.9;color:rgba(255,255,255,.65)">كن أول من يوثّق صوت المكان<br>اضغط الزر الأحمر وسجّل ٣٠ ثانية</div>
    </div>`;
    return;
  }
  renderReels();
}
function renderReels() {
  const wrap = $("reelsWrap");
  if (!wrap) return;
  wrap.innerHTML = state.reelsList.map((p) => {
    const fx = p.filter_key && p.filter_key !== "none" && typeof filterCss5 === "function" ? filterCss5(p.filter_key) : "none";
    const loc = p.abroad ? p.country || p.city : (p.village ? p.village + " · " : "") + p.city;
    const fav = state.favSet.has(p.id);
    const mine = !!(currentUser() && p.user_id === currentUser()?.id);
    const rk = rankOf(p);
    return `<div class="reel" data-id="${p.id}">
      <video src="${vidUrl(p.image_path)}" loop playsinline webkit-playsinline preload="none" muted style="filter:${fx}"></video>
      <div class="reel-shade"></div>
      <div class="reel-prog"><div class="reel-prog-fill"></div></div>
      <div class="reel-time">0:00</div>
      <button class="reel-mute" onclick="toggleReelMute(event)">🔇</button>
      <button class="reel-back" onclick="go('feed')">✕</button>
      <div class="reel-side">
        <button class="reel-avatar" onclick="reelProfile('${p.user_id}',event)" title="${esc(p.photographer)}">
          <span>${rk.ic}</span>
        </button>
        <button class="reel-act ${fav ? "on" : ""}" onclick="reelFav(${p.id},event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          حفظ
        </button>
        <button class="reel-act" onclick="openSheet(${p.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          ${p.comments_count || 0}
        </button>
        <button class="reel-act" onclick="reelShare(${p.id},event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          مشاركة
        </button>
        <button class="reel-act" onclick="openSheet(${p.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15 9 22 9.3 16.5 13.8 18.5 21 12 17 5.5 21 7.5 13.8 2 9.3 9 9"/></svg>
          ${Number(p.avg_stars).toFixed(1)}
        </button>
        ${mine ? `<button class="reel-act del" onclick="reelDelete(${p.id},'${p.image_path}',event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          حذف
        </button>` : `<button class="reel-act" onclick="reelReport(${p.id},event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          إبلاغ
        </button>`}
      </div>
      <div class="reel-info">
        <div class="reel-user" onclick="reelProfile('${p.user_id}',event)">${rk.ic} ${esc(p.photographer)}</div>
        <div class="reel-title">${esc(p.title)}</div>
        <div class="reel-loc" onclick="reelToMap(${p.lat || 0},${p.lng || 0},event)">📍 ${esc(loc)}</div>
        ${p.music_key ? `<div class="reel-music">🎵 ${esc(p.music_key)}</div>` : ""}
      </div>
    </div>`;
  }).join("");
  setupReelPlayback();
}
function setupReelPlayback() {
  if (state.reelObserver) state.reelObserver.disconnect();
  const vids = document.querySelectorAll("#reelsWrap video");
  state.reelObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const v = en.target;
      if (en.isIntersecting && en.intersectionRatio > 0.6) {
        v.muted = state.reelsMuted;
        v.play().catch(() => {
        });
        const pid = v.closest(".reel")?.dataset.id;
        if (pid && !_seenViews_().has(+pid)) {
          _seenViews_().add(+pid);
          try {
            sb.rpc("bump_view", { pid: +pid }).then(() => {
            }, () => {
            });
          } catch (e) {
          }
        }
      } else {
        try {
          v.pause();
        } catch (e) {
        }
      }
    });
  }, { threshold: [0, 0.6, 1] });
  vids.forEach((v) => {
    state.reelObserver.observe(v);
    v.addEventListener("click", () => {
      v.paused ? v.play().catch(() => {
      }) : v.pause();
    });
    v.addEventListener("timeupdate", () => {
      const reel = v.closest(".reel");
      if (!reel) return;
      const fill = reel.querySelector(".reel-prog-fill");
      const tm = reel.querySelector(".reel-time");
      const d = v.duration || 0;
      if (d > 0) {
        const left = Math.max(0, d - v.currentTime);
        if (fill) fill.style.width = v.currentTime / d * 100 + "%";
        if (tm) tm.textContent = "0:" + String(Math.ceil(left)).padStart(2, "0");
      }
    });
  });
  if (vids[0]) {
    vids[0].muted = state.reelsMuted;
    vids[0].play().catch(() => {
    });
  }
}
function toggleReelMute(e) {
  e.stopPropagation();
  state.reelsMuted = !state.reelsMuted;
  document.querySelectorAll("#reelsWrap video").forEach((v) => v.muted = state.reelsMuted);
  document.querySelectorAll(".reel-mute").forEach((b) => b.textContent = state.reelsMuted ? "🔇" : "🔊");
  toast(state.reelsMuted ? "الصوت مكتوم" : "الصوت شغّال 🔊");
}
async function reelFav(pid, e) {
  e.stopPropagation();
  await toggleFav2(pid);
  const btn = e.currentTarget;
  if (btn) btn.classList.toggle("on", state.favSet.has(pid));
}
function reelShare(pid, e) {
  e.stopPropagation();
  const p = state.photos.find((x) => x.id === pid);
  if (!p) return;
  const url = "https://sowra.app";
  if (navigator.share) {
    navigator.share({
      title: p.title,
      text: p.title + " — من عدسات أهل الديار 📍" + (p.village || p.city),
      url: "https://sowra.app"
    }).catch(() => {
    });
  } else {
    try {
      navigator.clipboard.writeText(url);
      toast("انسخ الرابط ✅");
    } catch (err) {
    }
  }
}
function reelToMap(lat, lng, e) {
  e.stopPropagation();
  if (!lat || !lng) {
    toast("ما فيه موقع مسجّل لهذا المقطع", true);
    return;
  }
  window.open("https://maps.google.com/?q=" + lat + "," + lng, "_blank");
}
function reelsRecord() {
  if (typeof recSupported2 === "function" && recSupported2()) {
    if (typeof recOpen2 === "function") recOpen2();
  } else {
    toast("جهازك ما يدعم التسجيل — استخدم صفحة النشر", true);
    go20("add");
  }
}
function stopAllReels4() {
  try {
    if (state.reelObserver) {
      state.reelObserver.disconnect();
      state.reelObserver = null;
    }
    document.querySelectorAll("#reelsWrap video").forEach((v) => {
      try {
        v.pause();
      } catch (e) {
      }
    });
  } catch (e) {
  }
}
function reelProfile(uid, e) {
  e.stopPropagation();
  stopAllReels4();
  openProfile4(uid);
}
async function reelDelete(pid, path, e) {
  e.stopPropagation();
  if (!confirm("حذف المقطع نهائياً؟ لا يمكن التراجع.")) return;
  try {
    await sb.storage.from("videos").remove([path]);
  } catch (err) {
  }
  const { error } = await sb.from("photos").delete().eq("id", pid).eq("user_id", currentUser()?.id);
  if (error) {
    toast("تعذر الحذف: " + error.message, true);
    return;
  }
  toast("انحذف المقطع ✅");
  await loadPhotos15();
  state.reelsList = state.photos.filter((x) => x.media_type === "video");
  if (state.reelsList.length) renderReels();
  else openReels();
}
async function reelReport(pid, e) {
  e.stopPropagation();
  if (!confirm("إبلاغ عن هذا المقطع؟")) return;
  try {
    const { error } = await sb.from("reports").insert({ photo_id: pid });
    if (error) throw error;
    toast("وصل بلاغك — شكراً 🚩");
  } catch (err) {
    toast("تعذر الإبلاغ", true);
  }
}
function initVideoUpload5() {
  try {
    const sp = state.banner;
    const off = !sp.video_enabled && !sp.reels_soon;
    const nb = document.getElementById("nb-reels");
    if (nb) nb.style.display = off ? "none" : "";
  } catch (e) {
  }
  const row = $("videoRow");
  if (!row) return;
  const on = typeof videoAllowed === "function" ? videoAllowed() : false;
  row.style.display = on ? "flex" : "none";
  if (typeof initRecBtn2 === "function") initRecBtn2();
  if (!on) {
    ["recOpenBtn", "fileVid", "videoRow"].forEach(function(id) {
      const e = document.getElementById(id);
      if (e) e.style.display = "none";
    });
  }
}

// js/features/search.js
var search_exports = {};
__export(search_exports, {
  _uSearchT: () => _uSearchT,
  _uniT: () => _uniT,
  closeUni: () => closeUni4,
  closeUserSearch: () => closeUserSearch,
  jumpToPlace: () => jumpToPlace,
  onUniSearch: () => onUniSearch,
  onUserSearchInput: () => onUserSearchInput,
  openUserSearch: () => openUserSearch4,
  renderUniBody: () => renderUniBody,
  runUniSearch: () => runUniSearch,
  runUserSearch: () => runUserSearch,
  setUniTab: () => setUniTab
});
init_db();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var render15 = need("render");
var _uSearchT = null;
function openUserSearch4() {
  const el = $("userSearchBox");
  if (!el) return;
  el.classList.add("show");
  $("usInput").value = "";
  $("usResults").innerHTML = '<div class="us-hint">اكتب اسم المصوّر أو جزءاً منه</div>';
  setTimeout(() => {
    const i = $("usInput");
    if (i) i.focus();
  }, 220);
}
function closeUserSearch() {
  const el = $("userSearchBox");
  if (el) el.classList.remove("show");
  clearTimeout(_uSearchT);
}
function onUserSearchInput() {
  clearTimeout(_uSearchT);
  _uSearchT = setTimeout(runUserSearch, 420);
}
async function runUserSearch() {
  const q = ($("usInput").value || "").trim();
  const box = $("usResults");
  if (!box) return;
  if (q.length < 2) {
    box.innerHTML = '<div class="us-hint">اكتب حرفين على الأقل</div>';
    return;
  }
  box.innerHTML = '<div class="loader" style="padding:18px">⏳</div>';
  try {
    const r = await sb.from("profiles").select("id,display_name,region,avatar_path,bio").ilike("display_name", "%" + q + "%").limit(24);
    let list = r.data || [];
    if (currentUser()) list = list.filter((u) => u.id !== currentUser()?.id);
    if (!list.length) {
      box.innerHTML = '<div class="us-hint">ما لقينا أحداً بهذا الاسم</div>';
      return;
    }
    const ids = list.map((u) => u.id);
    const counts = {};
    try {
      state.photos.forEach((p) => {
        if (ids.includes(p.user_id)) counts[p.user_id] = (counts[p.user_id] || 0) + 1;
      });
    } catch (e) {
    }
    box.innerHTML = list.map((u) => {
      const n = counts[u.id] || 0;
      return `<div class="us-row" onclick="closeUserSearch();openProfile('${u.id}')">
        ${u.avatar_path ? `<img src="${avatarUrl(u.avatar_path)}" alt="">` : '<div class="us-ph">📷</div>'}
        <div class="us-info">
          <div class="us-name">${esc(u.display_name || "مصوّر")}</div>
          <div class="us-meta">${u.region ? "📍 " + esc(u.region) + " · " : ""}${n} ${n === 1 ? "صورة" : n < 11 ? "صور" : "صورة"}</div>
        </div>
        <span class="us-go">←</span>
      </div>`;
    }).join("");
  } catch (e) {
    box.innerHTML = '<div class="us-hint">تعذر البحث</div>';
  }
}
var _uniT = null;
function onUniSearch() {
  clearTimeout(_uniT);
  _uniT = setTimeout(runUniSearch, 350);
}
function setUniTab(t) {
  state.uniTab = t;
  ["P", "U", "L"].forEach((x) => {
    const e = document.getElementById("urTab" + x);
    if (e) e.classList.remove("on");
  });
  const map = { photos: "P", users: "U", places: "L" };
  const b = document.getElementById("urTab" + map[t]);
  if (b) b.classList.add("on");
  renderUniBody();
}
async function runUniSearch() {
  const q = ($("q").value || "").trim();
  const box = $("uniResults");
  if (!box) return;
  if (q.length < 2) {
    box.style.display = "none";
    render15();
    return;
  }
  const ph = state.photos.filter(
    (p) => p.media_type !== "video" && p.visibility !== "private" && ((p.title || "").includes(q) || (p.village || "").includes(q) || (p.city || "").includes(q) || (p.region || "").includes(q) || (p.country || "").includes(q) || (p.photographer || "").includes(q))
  ).slice(0, 30);
  const pl = {};
  state.photos.forEach((p) => {
    [p.village, p.city].forEach((nm) => {
      if (nm && nm.includes(q)) {
        const k = nm + "|" + (p.region || p.country || "");
        pl[k] = pl[k] || { name: nm, area: p.region || p.country || "", n: 0, lat: p.lat, lng: p.lng };
        pl[k].n++;
      }
    });
  });
  const places = Object.values(pl).sort((a, b) => b.n - a.n).slice(0, 20);
  let users = [];
  try {
    const r = await sb.from("profiles").select("id,display_name,region,avatar_path").ilike("display_name", "%" + q + "%").limit(20);
    users = r.data || [];
    if (currentUser()) users = users.filter((u) => u.id !== currentUser()?.id);
  } catch (e) {
  }
  state.uniData = { photos: ph, users, places };
  $("urNP").textContent = ph.length;
  $("urNU").textContent = users.length;
  $("urNL").textContent = places.length;
  if (!ph.length && users.length) state.uniTab = "users";
  else if (!ph.length && !users.length && places.length) state.uniTab = "places";
  setUniTab(state.uniTab);
  box.style.display = "block";
}
function renderUniBody() {
  const el = $("urBody");
  if (!el) return;
  const d = state.uniData || { photos: [], users: [], places: [] };
  const t = state.uniTab;
  if (t === "photos") {
    if (!d.photos.length) {
      el.innerHTML = '<div class="ur-empty">ما لقينا صوراً</div>';
      return;
    }
    el.innerHTML = '<div class="ur-grid">' + d.photos.map((p) => `
      <div class="ur-ph" onclick="closeUni();openSheet(${p.id})">
        <img src="${thumbUrl(p.image_path)}" onerror="this.onerror=null;this.src='${imgUrl(p.image_path)}'" loading="lazy" alt="">
        <div class="ur-ph-t">${esc(p.title)}</div>
      </div>`).join("") + "</div>";
  } else if (t === "users") {
    if (!d.users.length) {
      el.innerHTML = '<div class="ur-empty">ما لقينا مصوّرين</div>';
      return;
    }
    const counts = {};
    state.photos.forEach((p) => {
      counts[p.user_id] = (counts[p.user_id] || 0) + 1;
    });
    el.innerHTML = d.users.map((u) => {
      const n = counts[u.id] || 0;
      return `<div class="ur-row" onclick="closeUni();openProfile('${u.id}')">
        ${u.avatar_path ? `<img src="${avatarUrl(u.avatar_path)}" alt="">` : '<div class="ur-ph-ic">📷</div>'}
        <div class="ur-info">
          <div class="ur-name">${esc(u.display_name || "مصوّر")}</div>
          <div class="ur-meta">${u.region ? "📍 " + esc(u.region) + " · " : ""}${n} ${n === 1 ? "صورة" : n < 11 ? "صور" : "صورة"}</div>
        </div>
        <span class="ur-go">←</span>
      </div>`;
    }).join("");
  } else {
    if (!d.places.length) {
      el.innerHTML = '<div class="ur-empty">ما لقينا أماكن</div>';
      return;
    }
    el.innerHTML = d.places.map((p) => `
      <div class="ur-row" onclick="closeUni();jumpToPlace('${esc(p.name).replace(/'/g, "&#39;")}')">
        <div class="ur-ph-ic">📍</div>
        <div class="ur-info">
          <div class="ur-name">${esc(p.name)}</div>
          <div class="ur-meta">${esc(p.area)} · ${p.n} ${p.n === 1 ? "صورة" : p.n < 11 ? "صور" : "صورة"}</div>
        </div>
        <span class="ur-go">←</span>
      </div>`).join("");
  }
}
function closeUni4() {
  const b = $("uniResults");
  if (b) b.style.display = "none";
}
function jumpToPlace(name) {
  const inp = $("q");
  if (inp) inp.value = name;
  closeUni4();
  render15();
}
state.shSort = "photos";

// js/features/share.js
var share_exports = {};
__export(share_exports, {
  photoUrl: () => photoUrl,
  photoUrlShort: () => photoUrlShort,
  qrDataUrl: () => qrDataUrl,
  shareCard: () => shareCard4,
  sharePhoto: () => sharePhoto,
  shareProfile: () => shareProfile
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var openAcc11 = need("openAcc");
var renderAccIn8 = need("renderAccIn");
var go21 = need("go");
var maybeAskNotifs10 = need("maybeAskNotifs");
var checkRaceProgress9 = need("checkRaceProgress");
var closeSheet9 = need("closeSheet");
var loadPhotos16 = need("loadPhotos");
var openSheet8 = need("openSheet");
var pushNotify18 = need("pushNotify");
var refreshOne5 = need("refreshOne");
var render16 = need("render");
var showJoinBox7 = need("showJoinBox");
async function shareProfile(uid) {
  toast("نجهّز البطاقة...");
  try {
    const r = await sb.from("profiles").select("display_name,bio,region").eq("id", uid).maybeSingle();
    const pr = r.data || {};
    const mine = state.photos.filter((x) => x.user_id === uid && x.visibility !== "private");
    const totV = mine.reduce((s, x) => s + (x.views || 0), 0);
    const fo = mine.length ? mine[0].followers_count || 0 : 0;
    const rk = mine.length ? rankOf(mine[0]) : { ic: "🌱", t: "مستكشف" };
    const top = mine.slice().sort((a, b) => (b.avg_stars || 0) - (a.avg_stars || 0)).slice(0, 4);
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
    } catch (e) {
    }
    const W = 1080, H = 1350;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#F7F1E3";
    ctx.fillRect(0, 0, W, H);
    const cols = ["#D63A2F", "#2E6FB7", "#F2B33D", "#2E8B57"];
    const tw = W / 16;
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tw, 54);
      ctx.lineTo(i * tw + tw / 2, 10);
      ctx.lineTo((i + 1) * tw, 54);
      ctx.closePath();
      ctx.fillStyle = cols[i % 4];
      ctx.fill();
      ctx.strokeStyle = "#241F1C";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.fillStyle = "#8C2F23";
    ctx.font = "bold 74px Tajawal, sans-serif";
    ctx.fillText(String(pr.display_name || "مصوّر").slice(0, 22), W / 2, 180);
    ctx.fillStyle = "#6B6259";
    ctx.font = "40px Tajawal, sans-serif";
    ctx.fillText(rk.ic + " " + rk.t, W / 2, 244);
    if (pr.region) {
      ctx.font = "34px Tajawal, sans-serif";
      ctx.fillText("📍 " + pr.region, W / 2, 300);
    }
    const sy = 380;
    const stats = [[mine.length, "صورة"], [fo, "متابع"], [totV, "مشاهدة"]];
    stats.forEach((s, i) => {
      const x = W / 2 + (i - 1) * 300;
      ctx.fillStyle = "#D63A2F";
      ctx.font = "bold 62px Tajawal, sans-serif";
      ctx.fillText(String(s[0]), x, sy);
      ctx.fillStyle = "#6B6259";
      ctx.font = "30px Tajawal, sans-serif";
      ctx.fillText(s[1], x, sy + 46);
    });
    const gy = 480, gs = 250, gap = 16;
    const startX = (W - (gs * 2 + gap)) / 2;
    await Promise.all(top.map((ph, i) => new Promise((res) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      const guard = setTimeout(res, 6e3);
      img.onload = () => {
        clearTimeout(guard);
        const cx = startX + i % 2 * (gs + gap);
        const cy = gy + Math.floor(i / 2) * (gs + gap);
        try {
          ctx.save();
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(cx, cy, gs, gs, 20);
          else ctx.rect(cx, cy, gs, gs);
          ctx.clip();
          const rt = Math.max(gs / img.width, gs / img.height);
          const dw = img.width * rt, dh = img.height * rt;
          ctx.drawImage(img, cx + (gs - dw) / 2, cy + (gs - dh) / 2, dw, dh);
          ctx.restore();
        } catch (e) {
        }
        res();
      };
      img.onerror = () => {
        clearTimeout(guard);
        res();
      };
      img.src = thumbUrl(ph.image_path);
    })));
    const qr = await qrDataUrl("https://sowra.app", 200);
    if (qr) {
      const qs = 150, qx = 70, qy = H - 215;
      ctx.fillStyle = "#F7F1E3";
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(qx - 10, qy - 10, qs + 20, qs + 20, 14);
        ctx.fill();
      } else ctx.fillRect(qx - 10, qy - 10, qs + 20, qs + 20);
      try {
        ctx.drawImage(qr, qx, qy, qs, qs);
      } catch (e) {
      }
      ctx.fillStyle = "#6B6259";
      ctx.font = "22px Tajawal, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("امسح للزيارة", qx + qs / 2, qy + qs + 34);
    }
    ctx.textAlign = "center";
    ctx.fillStyle = "#D63A2F";
    ctx.font = "bold 56px Tajawal, sans-serif";
    ctx.fillText("صورة من بلدي", W / 2 + (qr ? 90 : 0), H - 155);
    ctx.fillStyle = "#241F1C";
    ctx.font = "bold 40px Tajawal, sans-serif";
    ctx.fillText("sowra.app", W / 2 + (qr ? 90 : 0), H - 100);
    ctx.fillStyle = "#6B6259";
    ctx.font = "28px Tajawal, sans-serif";
    ctx.fillText("عدسات أهل الديار", W / 2 + (qr ? 90 : 0), H - 58);
    cv.toBlob(async function(blob) {
      if (!blob) {
        toast("تعذر إنشاء البطاقة", true);
        return;
      }
      const file = new File([blob], "sowra-profile.jpg", { type: "image/jpeg" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: pr.display_name || "مصوّر",
            text: "عدستي في «صورة من بلدي» 📸\nشوف صور ديرتك وشارك عدستك:\nhttps://sowra.app"
          });
          return;
        } catch (e) {
        }
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "sowra-profile.jpg";
      a.click();
      try {
        await navigator.clipboard.writeText("عدستي في «صورة من بلدي» 📸\nhttps://sowra.app");
      } catch (e) {
      }
      toast("انحفظت البطاقة — والنص بالحافظة 📋");
    }, "image/jpeg", 0.92);
  } catch (e) {
    console.error("[مشاركة] تعذّر التجهيز —", e);
    toast("تعذر التجهيز: " + (e && e.message || e), true);
  }
}
function photoUrlShort(id) {
  return photoUrl(id).replace(/^https?:\/\//, "").replace(/\.html$/, "");
}
function photoUrl(id) {
  try {
    const u = new URL(window.location.href);
    const dir = u.pathname.replace(/\/[^/]*$/, "");
    return `${u.origin}${dir}/p/${id}.html`;
  } catch (e) {
    return "https://sowra.app/p/" + id + ".html";
  }
}
async function sharePhoto(p) {
  const url = photoUrl(p.id);
  try {
    await navigator.clipboard.writeText(url);
    toast("اننسخ الرابط 🔗");
  } catch (e) {
    toast(url);
  }
}
async function shareCard4(p) {
  toast("نجهّز البطاقة...");
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgUrl(p.image_path);
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
    });
    const W = 1080, H = 1350, ih = 1110;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#F7F1E3";
    ctx.fillRect(0, 0, W, H);
    const ratio = Math.max(W / img.width, ih / img.height);
    const dw = img.width * ratio, dh = img.height * ratio;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, ih);
    ctx.clip();
    ctx.drawImage(img, (W - dw) / 2, (ih - dh) / 2, dw, dh);
    ctx.restore();
    const g = ctx.createLinearGradient(0, ih - 300, 0, ih);
    g.addColorStop(0, "rgba(10,8,6,0)");
    g.addColorStop(1, "rgba(10,8,6,.85)");
    ctx.fillStyle = g;
    ctx.fillRect(0, ih - 300, W, 300);
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 58px Tajawal, sans-serif";
    ctx.fillText(String(p.title).slice(0, 28), W - 60, ih - 110);
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.font = "36px Tajawal, sans-serif";
    const loc = p.abroad ? p.country || p.city : (p.village ? p.village + " · " : "") + p.city;
    ctx.fillText(loc + "  ·  عدسة " + p.photographer, W - 60, ih - 50);
    const colors = ["#D63A2F", "#2E6FB7", "#F2B33D", "#2E8B57"];
    const tw = W / 16;
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tw, ih + 42);
      ctx.lineTo(i * tw + tw / 2, ih + 8);
      ctx.lineTo((i + 1) * tw, ih + 42);
      ctx.closePath();
      ctx.fillStyle = colors[i % 4];
      ctx.fill();
      ctx.strokeStyle = "#241F1C";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    if (p.ratings_count > 0) {
      ctx.textAlign = "right";
      ctx.fillStyle = "#E8A020";
      ctx.font = "bold 40px Tajawal, sans-serif";
      ctx.fillText("★ " + Number(p.avg_stars).toFixed(1), W - 60, ih + 108);
    }
    const qr2 = await qrDataUrl(photoUrl(p.id), 180);
    if (qr2) {
      const qs = 120, qx = 60, qy = ih + 110;
      ctx.fillStyle = "#F7F1E3";
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(qx - 8, qy - 8, qs + 16, qs + 16, 12);
        ctx.fill();
      } else ctx.fillRect(qx - 8, qy - 8, qs + 16, qs + 16);
      try {
        ctx.drawImage(qr2, qx, qy, qs, qs);
      } catch (e) {
      }
    }
    ctx.textAlign = "center";
    const cx2 = W / 2 + (qr2 ? 70 : 0);
    ctx.fillStyle = "#D63A2F";
    ctx.font = "bold 50px Tajawal, sans-serif";
    ctx.fillText("صورة من بلدي", cx2, ih + 152);
    ctx.fillStyle = "#241F1C";
    ctx.font = "bold 34px Tajawal, sans-serif";
    ctx.fillText(photoUrlShort(p.id), cx2, ih + 196);
    ctx.fillStyle = "#6B6259";
    ctx.font = "25px Tajawal, sans-serif";
    ctx.fillText("عدسات أهل الديار", cx2, ih + 232);
    cv.toBlob(async function(blob) {
      if (!blob) {
        toast("تعذر إنشاء البطاقة", true);
        return;
      }
      const file = new File([blob], "sowra-" + p.id + ".jpg", { type: "image/jpeg" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: p.title,
            text: p.title + " — من «صورة من بلدي» 📸"
            /* بلا رابط — بطلب المالك */
          });
          return;
        } catch (e) {
        }
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "sowra-" + p.id + ".jpg";
      a.click();
      toast("انحفظت البطاقة");
    }, "image/jpeg", 0.92);
  } catch (e) {
    console.error("[بطاقة] تعذّر التجهيز —", e);
    toast("تعذر تجهيز البطاقة — " + (e && e.message || "سبب غير معروف"), true);
  }
}
async function qrDataUrl(text, size) {
  size = size || 220;
  return new Promise((res) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const guard = setTimeout(() => res(null), 5e3);
    img.onload = () => {
      clearTimeout(guard);
      res(img);
    };
    img.onerror = () => {
      clearTimeout(guard);
      res(null);
    };
    img.src = "https://api.qrserver.com/v1/create-qr-code/?size=" + size + "x" + size + "&margin=0&color=241F1C&bgcolor=F7F1E3&data=" + encodeURIComponent(text);
  });
}

// js/features/sheet.js
var sheet_exports = {};
__export(sheet_exports, {
  closeSheet: () => closeSheet10,
  lbDbl: () => lbDbl,
  lbScaleBy: () => lbScaleBy,
  lbW: () => lbW,
  openSheet: () => openSheet9,
  renderPhotoTags: () => renderPhotoTags,
  renderPhotoTech: () => renderPhotoTech,
  renderTimeline: () => renderTimeline,
  seenViews: () => seenViews,
  togglePhotoZoom: () => togglePhotoZoom,
  zoomClose: () => zoomClose,
  zoomOpen: () => zoomOpen
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var filterCss6 = need("filterCss");
var gpUpdateInfo4 = need("gpUpdateInfo");
var openAcc12 = need("openAcc");
var bumpJoinCounter4 = need("bumpJoinCounter");
var checkRate9 = need("checkRate");
var loadPhotos17 = need("loadPhotos");
var logRate9 = need("logRate");
var moveToVault4 = need("moveToVault");
var publishFromVault4 = need("publishFromVault");
var pushNotify19 = need("pushNotify");
var render17 = need("render");
var renderClaim4 = need("renderClaim");
var renderFollow5 = need("renderFollow");
var renderProfFeed5 = need("renderProfFeed");
var renderProfTabs5 = need("renderProfTabs");
var renderVault7 = need("renderVault");
var renderVisits3 = need("renderVisits");
var setView5 = need("setView");
var shareCard5 = need("shareCard");
var sharePhoto2 = need("sharePhoto");
var tagName3 = need("tagName");
var deleteMyPhoto2 = need("deleteMyPhoto");
var drawStars2 = need("drawStars");
var openEdit2 = need("openEdit");
var renderComments2 = need("renderComments");
var renderPoll2 = need("renderPoll");
state.myRating = 0;
state.myBadgeSet = /* @__PURE__ */ new Set();
window.CLAIM_MAP = window.CLAIM_MAP || {};
async function openSheet9(id) {
  state.curId = id;
  state.curPhoto = state.photos.find((x) => x.id === id) || (state.admPhotos || []).find((x) => x.id === id);
  if (!state.curPhoto) {
    console.warn("[ورقة] لا توجد صورة بالمعرّف", id);
    if (typeof toast === "function") toast("الصورة غير موجودة — قد تكون حُذفت", true);
    return;
  }
  try {
    bumpJoinCounter4();
  } catch (e) {
  }
  const p = state.curPhoto;
  const isVid = p.media_type === "video";
  const vfx = p.filter_key && p.filter_key !== "none" && typeof filterCss6 === "function" ? filterCss6(p.filter_key) : "none";
  $("sPh").innerHTML = isVid ? `<video controls playsinline webkit-playsinline preload="metadata" style="width:100%;height:100%;object-fit:contain;background:#000;filter:${vfx}"><source src="${vidUrl(p.image_path)}" type="video/mp4"></video>` : `<img src="${imgUrl(p.image_path)}" onclick="zoomOpen(this.src)" alt="${esc(p.title)}">
    <button class="zoombtn" id="zoomBtn" onclick="togglePhotoZoom()">⤢ عرض كامل</button>`;
  if (!seenViews.has(p.id)) {
    seenViews.add(p.id);
    try {
      sb.rpc("bump_view", { pid: p.id }).then(() => {
      }, () => {
      });
    } catch (_) {
    }
  }
  $("sPh").classList.remove("full");
  $("sTitle").textContent = p.title;
  const _who = `<span class="s-who" onclick="closeSheet();openProfile('${p.user_id}')">${rankOf(p).ic} ${esc(p.photographer)}</span>`;
  $("sLoc").innerHTML = (p.abroad ? `🌍 عدسة مسافر · ${esc(p.country || p.city)} — عدسة ${_who}` : `📍 ${esc(p.region)} · ${esc(p.city)}${p.village ? " · " + esc(p.village) : ""} — عدسة ${_who}`) + `<br><a class="mapbtn" href="${p.lat ? `https://maps.google.com/?q=${p.lat},${p.lng}` : `https://maps.google.com/?q=${encodeURIComponent(p.abroad ? p.country || p.city : (p.village ? p.village + " " : "") + p.city + " " + p.region)}`}" target="_blank" rel="noopener">🗺️ افتح الموقع على قوقل ماب${p.lat ? "" : " (بحث بالاسم)"}</a>`;
  renderFollow5(p);
  renderVisits3(p);
  renderClaim4(p);
  const en = $("sEn");
  if (en) {
    if (p.title_en || p.description_en) {
      en.style.display = "block";
      en.innerHTML = (p.title_en ? "<b>" + esc(p.title_en) + "</b>" : "") + (p.description_en ? esc(p.description_en) : "");
    } else en.style.display = "none";
  }
  const _ec = $("sEC");
  if (_ec) _ec.style.display = p.editors_choice ? "block" : "none";
  try {
    renderPhotoTags(p);
  } catch (e) {
  }
  try {
    renderPhotoTech(p);
  } catch (e) {
  }
  try {
    renderTimeline(p);
  } catch (e) {
  }
  const cb = $("sComm");
  if (cb) cb.style.display = p.commercial ? "inline-flex" : "none";
  const dsc = $("sDesc");
  if (dsc) {
    if (p.description && p.description.trim()) {
      dsc.style.display = "block";
      dsc.textContent = p.description;
    } else dsc.style.display = "none";
  }
  const dt = $("sDate");
  if (dt) {
    const t = timeAgo(p.created_at);
    if (t && t.txt) {
      dt.style.display = "block";
      dt.innerHTML = '📅 <span title="' + esc(t.full) + '">' + t.txt + "</span>";
      dt.onclick = function() {
        toast(t.full);
      };
    } else dt.style.display = "none";
  }
  const rl = $("rateLabel");
  if (rl) rl.textContent = isVid ? "وش تقييمك للمقطع؟" : "وش تقييمك للصورة؟";
  const pb = $("pollBox");
  if (pb) pb.style.display = isVid ? "none" : "block";
  if (isVid && p.music_key) {
    const lc = $("sLoc");
    if (lc) lc.innerHTML += '<br><span style="font-size:12px;color:var(--txt-dim)">🎵 ' + esc(p.music_key) + "</span>";
  }
  const shb = $("shareBtn");
  if (shb) shb.onclick = function() {
    shareCard5(p);
  };
  const cdb = $("cardBtn");
  if (cdb) cdb.onclick = function() {
    sharePhoto2(p);
  };
  const dbw = $("deleteBtn");
  if (dbw) {
    const isMine = !!(currentUser() && p.user_id === currentUser()?.id);
    const canEdit = isMine || isOwner();
    dbw.style.display = isMine || canEdit ? "block" : "none";
    if (isMine) {
      const dbi = $("deleteBtnInner");
      if (dbi) {
        dbi.textContent = p.media_type === "video" ? "🗑️ حذف المقطع" : "🗑️ حذف صورتي";
        dbi.onclick = function() {
          deleteMyPhoto2(p.id, p.image_path);
        };
      }
      let vb = document.getElementById("vaultBtn");
      if (!vb) {
        vb = document.createElement("button");
        vb.id = "vaultBtn";
        vb.style.cssText = "background:none;border:none;color:var(--txt-dim);font-family:'Tajawal';font-size:12px;font-weight:700;cursor:pointer;text-decoration:underline;display:block;margin:6px auto 0";
        dbw.appendChild(vb);
      }
      const isPriv = p.visibility === "private";
      const isVd = p.media_type === "video";
      vb.textContent = isPriv ? isVd ? "📢 انشر المقطع للجميع" : "📢 انشرها للجميع" : isVd ? "🔒 اسحب المقطع لخزنتي" : "🔒 اسحبها لخزنتي";
      vb.onclick = function() {
        isPriv ? publishFromVault4(p.id) : moveToVault4(p.id);
      };
    }
    let eb = document.getElementById("editBtn");
    if (canEdit) {
      if (!eb) {
        eb = document.createElement("button");
        eb.id = "editBtn";
        eb.style.cssText = "background:none;border:none;color:var(--qblue);font-family:'Tajawal';font-size:12px;font-weight:700;cursor:pointer;text-decoration:underline;display:block;margin:6px auto 0";
        dbw.appendChild(eb);
      }
      eb.style.display = "block";
      const vd = p.media_type === "video";
      eb.textContent = isMine ? vd ? "✏️ عدّل بيانات المقطع" : "✏️ عدّل بيانات الصورة" : vd ? "🛡️ عدّل المقطع (مالك)" : "🛡️ عدّل الصورة (مالك)";
      eb.onclick = function() {
        openEdit2(p.id);
      };
    } else if (eb) {
      eb.style.display = "none";
    }
  }
  $("overlay").classList.add("show");
  document.body.style.overflow = "hidden";
  state.myRating = 0;
  state.myBadgeSet = /* @__PURE__ */ new Set();
  drawStars2();
  renderPoll2();
  $("cList").innerHTML = '<div class="loader" style="padding:10px">⏳</div>';
  const [rt, bd, cm] = await Promise.all([
    sb.from("ratings").select("stars").eq("photo_id", id).eq("user_id", currentUser()?.id).maybeSingle(),
    sb.from("badge_votes").select("badge_key").eq("photo_id", id).eq("user_id", currentUser()?.id),
    sb.from("comments").select("body,created_at,profiles!user_id(display_name)").eq("photo_id", id).order("created_at")
  ]);
  state.myRating = rt.data ? rt.data.stars : 0;
  (bd.data || []).forEach((x) => state.myBadgeSet.add(x.badge_key));
  state.curPhoto._comments = cm.data || [];
  $("thanks").style.display = state.myRating ? "block" : "none";
  drawStars2();
  renderPoll2();
  renderComments2();
}
function closeSheet10() {
  $("overlay").classList.remove("show");
  document.body.style.overflow = "";
}
function togglePhotoZoom() {
  const full = $("sPh").classList.toggle("full");
  $("zoomBtn").textContent = full ? "⤡ تصغير" : "⤢ عرض كامل";
}
function renderPhotoTags(p) {
  const el = $("sTags");
  if (!el) return;
  const tags = p.tags || [];
  if (!tags.length || typeof tagName3 !== "function") {
    el.style.display = "none";
    return;
  }
  el.style.display = "flex";
  el.innerHTML = tags.map((k) => '<span class="s-tag">' + esc(tagName3(k)) + "</span>").join("");
}
state.onlyClaims = false;
function renderPhotoTech(p) {
  const el = $("sTech");
  if (!el) return;
  const t = p.exif || {};
  const has = t.camera || t.lens || t.focal || t.aperture || t.iso || t.shutter;
  if (!has || p.media_type === "video") {
    el.style.display = "none";
    return;
  }
  el.style.display = "block";
  const set = [t.focal, t.aperture, t.shutter, t.iso].filter(Boolean);
  el.innerHTML = (t.camera ? '<div class="st-cam">📷 ' + esc(t.camera) + "</div>" : "") + (t.lens ? '<div class="st-cam" style="font-weight:400;font-size:11.5px;color:var(--txt-dim)">🔭 ' + esc(t.lens) + "</div>" : "") + (set.length ? '<div class="st-set">' + set.map((x) => "<span>" + esc(x) + "</span>").join("") + "</div>" : "");
}
function renderTimeline(p) {
  const el = $("sTimeline");
  if (!el) return;
  if (!p.lat || !p.lng || p.media_type === "video") {
    el.style.display = "none";
    return;
  }
  const d = (x) => Math.hypot((x.lat - p.lat) * 111e3, (x.lng - p.lng) * 111e3 * Math.cos(p.lat * Math.PI / 180));
  const same = state.photos.filter(
    (x) => x.lat && x.lng && x.media_type !== "video" && x.visibility !== "private" && d(x) <= 200
  ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  if (same.length < 2) {
    el.style.display = "none";
    return;
  }
  const first = new Date(same[0].created_at);
  const last = new Date(same[same.length - 1].created_at);
  const span = Math.round((last - first) / 864e5);
  let spanTxt = "";
  if (span >= 365) spanTxt = Math.floor(span / 365) + " سنة";
  else if (span >= 30) spanTxt = Math.floor(span / 30) + " شهر";
  else if (span > 0) spanTxt = span + " يوم";
  el.style.display = "block";
  el.innerHTML = `
    <div class="tl-head">
      <span>📅 هذا المكان عبر الزمن</span>
      <b>${same.length} صورة${spanTxt ? " · " + spanTxt : ""}</b>
    </div>
    <div class="tl-strip">
      ${same.map((x) => {
    const dt = new Date(x.created_at);
    const mon = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"][dt.getMonth()];
    const cur = x.id === p.id;
    return `<div class="tl-item${cur ? " cur" : ""}" onclick="${cur ? "" : "openSheet(" + x.id + ")"}">
          <img src="${thumbUrl(x.image_path)}" onerror="this.onerror=null;this.src='${imgUrl(x.image_path)}'" loading="lazy" alt="">
          <div class="tl-date">${mon} ${dt.getFullYear()}</div>
          ${cur ? '<div class="tl-now">الحالية</div>' : ""}
        </div>`;
  }).join("")}
    </div>`;
}
state.dmTo = null;
var seenViews = /* @__PURE__ */ new Set();
var lbW = 100;
function zoomOpen(src) {
  lbW = 100;
  const im = $("lbImg");
  im.src = src;
  im.style.width = "100%";
  $("lightbox").classList.add("show");
  document.body.style.overflow = "hidden";
}
function zoomClose() {
  $("lightbox").classList.remove("show");
  document.body.style.overflow = "";
}
function lbScaleBy(f) {
  lbW = Math.min(600, Math.max(100, lbW * f));
  $("lbImg").style.width = lbW + "%";
}
function lbDbl() {
  lbW = lbW > 100 ? 100 : 250;
  $("lbImg").style.width = lbW + "%";
}

// js/features/stats.js
var stats_exports = {};
__export(stats_exports, {
  renderMyStats: () => renderMyStats5,
  stSetSort: () => stSetSort
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var openAcc13 = need("openAcc");
var renderAccIn9 = need("renderAccIn");
var go22 = need("go");
var maybeAskNotifs11 = need("maybeAskNotifs");
var checkRaceProgress10 = need("checkRaceProgress");
var closeSheet11 = need("closeSheet");
var loadPhotos18 = need("loadPhotos");
var openSheet10 = need("openSheet");
var pushNotify20 = need("pushNotify");
var refreshOne6 = need("refreshOne");
var render18 = need("render");
var showJoinBox8 = need("showJoinBox");
async function renderMyStats5() {
  const el = $("myStats");
  if (!el) return;
  if (isAnon()) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = '<div class="loader" style="padding:14px">⏳</div>';
  try {
    const mine = state.photos.filter((x) => x.user_id === currentUser()?.id && x.visibility !== "private");
    const ids = mine.map((x) => x.id);
    const since = new Date(Date.now() - 7 * 864e5).toISOString();
    const newPhotos = mine.filter((x) => x.created_at >= since).length;
    let newRatings = 0, newComments = 0, newVisits = 0;
    if (ids.length) {
      try {
        const [r1, r2, r3] = await Promise.all([
          sb.from("ratings").select("photo_id", { count: "exact", head: true }).in("photo_id", ids).gte("created_at", since),
          sb.from("comments").select("id", { count: "exact", head: true }).in("photo_id", ids).gte("created_at", since),
          sb.from("visits").select("photo_id", { count: "exact", head: true }).in("photo_id", ids).gte("created_at", since)
        ]);
        newRatings = r1.count || 0;
        newComments = r2.count || 0;
        newVisits = r3.count || 0;
      } catch (e) {
      }
    }
    const S = state.statsSort;
    const sorted = mine.slice().sort((a, b) => {
      if (S === "views") return (b.views || 0) - (a.views || 0);
      if (S === "comments") return (b.comments_count || 0) - (a.comments_count || 0);
      if (S === "new") return new Date(b.created_at) - new Date(a.created_at);
      const d = (b.avg_stars || 0) - (a.avg_stars || 0);
      return d !== 0 ? d : (b.ratings_count || 0) - (a.ratings_count || 0);
    }).slice(0, 18);
    el.innerHTML = `
      <div class="st-week">نشاطك آخر ٧ أيام</div>
      <div class="st-cards">
        <div class="st-card"><b>${newPhotos}</b><span>📸 نشرت</span></div>
        <div class="st-card"><b>${newRatings}</b><span>⭐ تقييم</span></div>
        <div class="st-card"><b>${newComments}</b><span>💬 تعليق</span></div>
        <div class="st-card"><b>${newVisits}</b><span>👣 زيارة</span></div>
      </div>

      ${(function() {
      const wk = mine.filter((x) => x.created_at >= since);
      if (!wk.length) return `<div class="st-empty">ما نشرت شيئاً هذا الأسبوع — <b onclick="go('add')">انشر صورة الآن</b></div>`;
      return '<div class="st-week" style="margin-top:16px">صور هذا الأسبوع</div><div class="st-grid">' + wk.map(function(p) {
        const isV = p.media_type === "video";
        const src = isV ? vidUrl(p.image_path) : thumbUrl(p.image_path);
        return '<div class="st-item" onclick="openSheet(' + p.id + ')" title="' + esc(p.title) + '"><div class="st-thumb">' + (isV ? '<video src="' + src + '#t=0.4" muted playsinline preload="metadata"></video>' : '<img src="' + src + '" loading="lazy" alt="">') + (p.avg_stars > 0 ? '<div class="st-star">★ ' + Number(p.avg_stars).toFixed(1) + "</div>" : "") + '</div><div class="st-nums"><span>👁️ ' + (p.views || 0) + "</span><span>⭐ " + (p.ratings_count || 0) + "</span><span>💬 " + (p.comments_count || 0) + "</span></div></div>";
      }).join("") + "</div>";
    })()}

      <div class="st-sortbar" style="margin-top:20px">
        <span>كل أعمالك — ترتيب حسب</span>
        <div class="st-sorts">
          <button class="st-sort${S === "stars" ? " on" : ""}" onclick="stSetSort('stars')" title="التقييم">⭐</button>
          <button class="st-sort${S === "views" ? " on" : ""}" onclick="stSetSort('views')" title="المشاهدات">👁️</button>
          <button class="st-sort${S === "comments" ? " on" : ""}" onclick="stSetSort('comments')" title="التعليقات">💬</button>
          <button class="st-sort${S === "new" ? " on" : ""}" onclick="stSetSort('new')" title="الأحدث">🕐</button>
        </div>
      </div>

      ${sorted.length ? `<div class="st-grid">${sorted.map((p) => {
      const isV = p.media_type === "video";
      const src = isV ? vidUrl(p.image_path) : thumbUrl(p.image_path);
      return `<div class="st-item" onclick="openSheet(${p.id})" title="${esc(p.title)}">
          <div class="st-thumb">
            ${isV ? `<video src="${src}#t=0.4" muted playsinline preload="metadata"></video>` : `<img src="${src}" loading="lazy" alt="">`}
            ${p.avg_stars > 0 ? `<div class="st-star">★ ${Number(p.avg_stars).toFixed(1)}</div>` : ""}
          </div>
          <div class="st-nums">
            <span>👁️ ${p.views || 0}</span>
            <span>⭐ ${p.ratings_count || 0}</span>
            <span>💬 ${p.comments_count || 0}</span>
          </div>
        </div>`;
    }).join("")}</div>` : '<div style="font-size:12.5px;color:var(--txt-dim);padding:10px;text-align:center">ما نشرت صوراً بعد</div>'}`;
  } catch (e) {
    el.innerHTML = '<div style="font-size:12px;color:var(--txt-dim)">تعذر تحميل الإحصائيات</div>';
  }
}
function stSetSort(s) {
  state.statsSort = s;
  renderMyStats5();
}

// js/features/translate.js
var translate_exports = {};
__export(translate_exports, {
  resetTranslation: () => resetTranslation,
  translateFields: () => translateFields
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var captureVideoFrame6 = need("captureVideoFrame");
var checkRaceProgress11 = need("checkRaceProgress");
var checkRate10 = need("checkRate");
var fillAddCities10 = need("fillAddCities");
var loadPhotos19 = need("loadPhotos");
var logRate10 = need("logRate");
var openAcc14 = need("openAcc");
var pushNotify21 = need("pushNotify");
var go23 = need("go");
var maybeAskNotifs12 = need("maybeAskNotifs");
var earlySuggest3 = need("earlySuggest");
var hideSuggestions3 = need("hideSuggestions");
var renderFilterRow5 = need("renderFilterRow");
var resetFilter3 = need("resetFilter");
var runInspection3 = need("runInspection");
async function translateFields() {
  const t = $("aTitle") ? $("aTitle").value.trim() : "";
  const d = $("aDesc") ? $("aDesc").value.trim() : "";
  if (!t && !d) {
    toast("اكتب العنوان أول", true);
    return;
  }
  const btn = $("trBtn");
  btn.disabled = true;
  btn.textContent = "⏳ نترجم...";
  try {
    let data = null, err = null;
    try {
      const res = await sb.functions.invoke("translate", { body: { title: t, description: d } });
      data = res.data;
      err = res.error;
    } catch (e) {
      err = e;
    }
    if (!data || err) {
      const sess = await sb.auth.getSession();
      const tok = sess?.data?.session?.access_token;
      const r = await fetch("https://gquzjaxpqeggknhipmzk.supabase.co/functions/v1/translate", {
        method: "POST",
        headers: Object.assign(
          { "Content-Type": "application/json", "apikey": "sb_publishable_BNp6Fg3VLXa1Pf4V6QjncQ_f496PquX" },
          tok ? { "Authorization": "Bearer " + tok } : {}
        ),
        body: JSON.stringify({ title: t, description: d })
      });
      const raw = await r.text();
      if (!r.ok) throw new Error("HTTP " + r.status + " — " + raw.slice(0, 100));
      data = JSON.parse(raw);
    }
    if (data && data.error) throw new Error(data.error);
    state.trTitle = data && data.title_en || "";
    state.trDesc = data && data.description_en || "";
    if (!state.trTitle && !state.trDesc) throw new Error("رد فاضي");
    const pv = $("trPreview");
    if (pv) {
      pv.style.display = "block";
      pv.innerHTML = (state.trTitle ? "<b>Title</b>" + esc(state.trTitle) : "") + (state.trDesc ? '<div class="d">' + esc(state.trDesc) + "</div>" : "");
    }
    btn.textContent = "✅ تُرجم — اضغط لإعادة الترجمة";
    toast("انترجم ✅");
  } catch (e) {
    toast("تعذرت الترجمة — جرّب مرة ثانية", true);
    btn.textContent = "🌐 ترجم العنوان والوصف للإنجليزية";
  } finally {
    btn.disabled = false;
  }
}
function resetTranslation() {
  state.trTitle = "";
  state.trDesc = "";
  const pv = $("trPreview");
  if (pv) {
    pv.style.display = "none";
    pv.innerHTML = "";
  }
  const b = $("trBtn");
  if (b) b.textContent = "🌐 ترجم العنوان والوصف للإنجليزية";
}

// js/features/upload.js
var upload_exports = {};
__export(upload_exports, {
  PHOTO_TAGS: () => PHOTO_TAGS,
  addPhoto: () => addPhoto,
  applyGeo: () => applyGeo3,
  clearDraft: () => clearDraft,
  descCount: () => descCount2,
  fillPlaceFromGeo: () => fillPlaceFromGeo2,
  pickImg: () => pickImg,
  pickVideo: () => pickVideo,
  renderTagRow: () => renderTagRow4,
  saveHiCopy: () => saveHiCopy,
  setDest: () => setDest,
  setVis: () => setVis,
  showClearBtn: () => showClearBtn3,
  syncClaimLabel: () => syncClaimLabel,
  syncPublishBtn: () => syncPublishBtn3,
  syncRulesLabel: () => syncRulesLabel,
  tagName: () => tagName4
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var captureVideoFrame7 = need("captureVideoFrame");
var checkRaceProgress12 = need("checkRaceProgress");
var checkRate11 = need("checkRate");
var fillAddCities11 = need("fillAddCities");
var loadPhotos20 = need("loadPhotos");
var logRate11 = need("logRate");
var openAcc15 = need("openAcc");
var pushNotify22 = need("pushNotify");
var go24 = need("go");
var maybeAskNotifs13 = need("maybeAskNotifs");
var earlySuggest4 = need("earlySuggest");
var hideSuggestions4 = need("hideSuggestions");
var renderFilterRow6 = need("renderFilterRow");
var resetFilter4 = need("resetFilter");
var runInspection4 = need("runInspection");
var readExifTech2 = need("readExifTech");
var renderTechCard2 = need("renderTechCard");
var resetTranslation2 = need("resetTranslation");
function setVis(v) {
  state.pendingVis = v;
  const pb = $("visPublic"), pv = $("visPrivate");
  if (pb) pb.classList.toggle("on", v === "public");
  if (pv) pv.classList.toggle("on", v === "private");
  const b = $("pubBtn");
  if (b) {
    const isV = !!state.pendingVideo;
    b.textContent = v === "private" ? isV ? "🔒 احفظ بخزنتي" : "🔒 احفظ بخزنتي" : isV ? "انشر المقطع 🎬" : "انشر الصورة 🚀";
  }
}
window.setVis = setVis;
function setDest(abroad) {
  state.isAbroad = abroad;
  $("destHome").classList.toggle("on-dest", !abroad);
  $("destAbroad").classList.toggle("on-dest", abroad);
  $("abroadForm").style.display = abroad ? "block" : "none";
  $("grpRegion").style.display = abroad ? "none" : "block";
  $("grpCity").style.display = abroad ? "none" : "block";
  $("grpVillage").style.display = abroad ? "none" : "block";
  try {
    if (abroad) {
      if ($("aRegion")) $("aRegion").value = "";
      if ($("aCity")) $("aCity").value = "";
      if ($("aVillage")) $("aVillage").value = "";
      if (state.pendingGeo && !window.__geoManual) {
        state.pendingGeo = null;
        const card = $("geoCard");
        if (card) {
          card.classList.add("warn");
          $("geoStatus").textContent = "🌍 صورة من خارج المملكة";
          $("geoCoords").textContent = "";
          const mb = $("geoManualBox");
          if (mb) mb.style.display = "block";
        }
      }
    } else {
      if ($("aCountry")) $("aCountry").value = "";
    }
    if (state.pendingGeo && typeof fillPlaceFromGeo2 === "function") {
      fillPlaceFromGeo2(state.pendingGeo.lat, state.pendingGeo.lng, true);
    }
  } catch (e) {
  }
}
function applyGeo3(pos, source) {
  const card = $("geoCard");
  card.style.display = "block";
  pos = validPos(pos);
  const mb = $("geoManualBox");
  if (!pos) {
    card.classList.add("warn");
    $("geoStatus").textContent = source === "live" ? "⚠️ ما قدرنا نوصل لموقعك" : "⚠️ الصورة ما تحمل موقعاً";
    $("geoCoords").textContent = "";
    if (mb) mb.style.display = "block";
    window.__geoManual = false;
    return;
  }
  if (mb) mb.style.display = "none";
  window.__geoManual = false;
  if (typeof fillPlaceFromGeo2 === "function") fillPlaceFromGeo2(pos.lat, pos.lng);
  card.classList.remove("warn");
  state.pendingGeo = { lat: pos.lat, lng: pos.lng };
  if (state.isAbroad) {
    $("geoStatus").textContent = "📡 تم التقاط إحداثيات موقعك" + (pos.acc ? ` · دقة ±${pos.acc}م` : "");
    $("geoCoords").textContent = `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
    return;
  }
  const n = nearestCity(pos.lat, pos.lng);
  $("aRegion").value = n.region;
  fillAddCities11();
  $("aCity").value = n.city;
  $("geoStatus").textContent = `📡 تم تحديد الموقع تلقائياً: قرب ${n.city} (≈${n.km} كم)` + (pos.acc ? ` · دقة ±${pos.acc}م` : "");
  $("geoCoords").textContent = `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
}
async function pickImg(inp, isLive) {
  const f = inp.files[0];
  if (!f) return;
  state.pendingGeo = null;
  state.pendingFile = f;
  state.pendingBlob = null;
  state.pendingVideo = null;
  const _pv = $("videoPreview");
  if (_pv) {
    try {
      _pv.pause();
    } catch (e) {
    }
    _pv.removeAttribute("src");
    _pv.load && _pv.load();
    _pv.style.display = "none";
  }
  $("drop").style.display = "block";
  $("preview").src = URL.createObjectURL(f);
  $("preview").style.display = "block";
  $("dropTxt").textContent = "✓ تم اختيار الصورة";
  $("drop").classList.add("has");
  showClearBtn3();
  syncPublishBtn3();
  state.curFilter = "none";
  try {
    renderFilterRow6(URL.createObjectURL(f), false);
  } catch (e) {
  }
  compress(f).then((b) => {
    state.pendingBlob = b;
  });
  $("geoCard").style.display = "block";
  $("geoCard").classList.remove("warn");
  $("geoStatus").textContent = "⏳ جاري تحديد الموقع...";
  $("geoCoords").textContent = "";
  if (isLive) {
    let pos = validPos(await liveLocation());
    if (!pos) pos = validPos(await readExifGPS(f));
    if (!pos) pos = validPos(await readExifGPS2(f));
    applyGeo3(pos, "live");
  } else {
    let pos = validPos(await readExifGPS(f));
    if (!pos) pos = validPos(await readExifGPS2(f));
    applyGeo3(pos, "exif");
  }
  state.earlyRes = null;
  state.geoPlace = null;
  state.exifTech = await readExifTech2(f);
  renderTechCard2();
  inp.value = "";
  earlySuggest4();
}
async function pickVideo(inp) {
  if (!videoAllowed()) {
    toast("رفع المقاطع مغلق حالياً 🎬", true);
    inp.value = "";
    return;
  }
  const f = inp.files[0];
  if (!f) return;
  const MAXMB = 25, MAXSEC = 30;
  if (f.size > MAXMB * 1024 * 1024) {
    toast("الفيديو كبير — الحد " + MAXMB + " ميجا", true);
    inp.value = "";
    return;
  }
  const dur = await new Promise((res) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(v.src);
      res(v.duration || 0);
    };
    v.onerror = () => res(0);
    v.src = URL.createObjectURL(f);
  });
  if (dur > MAXSEC + 1) {
    toast("الفيديو طويل (" + Math.round(dur) + " ثانية) — الحد " + MAXSEC + " ثانية", true);
    inp.value = "";
    return;
  }
  state.pendingFile = null;
  state.pendingBlob = null;
  state.pendingGeo = null;
  state.pendingVideo = f;
  $("drop").style.display = "block";
  const _im = $("preview");
  if (_im) {
    _im.removeAttribute("src");
    _im.style.display = "none";
  }
  const pv = $("videoPreview");
  if (pv) {
    pv.src = URL.createObjectURL(f);
    pv.style.display = "block";
  }
  $("dropTxt").textContent = "🎬 تم اختيار الفيديو (" + Math.round(f.size / 1048576) + " ميجا)";
  $("drop").classList.add("has");
  showClearBtn3();
  syncPublishBtn3();
  state.curFilter = "none";
  const _fu = pv ? pv.src : URL.createObjectURL(f);
  try {
    renderFilterRow6(null, true, _fu);
  } catch (e) {
  }
  captureVideoFrame7(f).then((t) => {
    if (t) renderFilterRow6(t, true);
  }).catch(() => {
  });
  $("geoCard").style.display = "block";
  $("geoCard").classList.remove("warn");
  $("geoStatus").textContent = "⏳ جاري تحديد الموقع...";
  $("geoCoords").textContent = "";
  const pos = await liveLocation();
  applyGeo3(pos, "live");
  inp.value = "";
}
function mediaRow(title, region, city, country, extra) {
  return Object.assign({
    user_id: currentUser()?.id,
    title,
    region,
    city,
    category: $("aCat").value || "other",
    abroad: state.isAbroad,
    country,
    village: state.isAbroad ? "" : $("aVillage").value.trim(),
    lat: state.pendingGeo?.lat ?? null,
    lng: state.pendingGeo?.lng ?? null,
    visibility: state.pendingVis,
    commercial: !!($("aComm") && $("aComm").checked),
    tags: state.pickedTags || [],
    exif: document.getElementById("techShow") && document.getElementById("techShow").checked && state.exifTech ? state.exifTech : {}
  }, extra);
}
function resetAddForm() {
  $("aTitle").value = "";
  $("aVillage").value = "";
  if ($("aCat")) $("aCat").value = "other";
  if ($("aDesc")) {
    $("aDesc").value = "";
    descCount2();
  }
  if ($("aComm")) $("aComm").checked = false;
  resetTranslation2();
  state.pickedTags = [];
  renderTagRow4();
  if (typeof hideSuggestions4 === "function") hideSuggestions4();
  state.earlyRes = null;
  state.exifTech = null;
  renderTechCard2();
}
async function myDisplayName() {
  try {
    return (await sb.from("profiles").select("display_name").eq("id", currentUser()?.id).maybeSingle()).data?.display_name || "مصوّر";
  } catch (e) {
    return "مصوّر";
  }
}
async function afterPublish(msg, sortMode) {
  if (typeof logRate11 === "function") logRate11("photo");
  toast(msg);
  try {
    state.sort = sortMode;
    state.draftSort = sortMode;
  } catch (e) {
  }
  if (typeof maybeAskNotifs13 === "function") maybeAskNotifs13();
  setTimeout(function() {
    if (typeof checkRaceProgress12 === "function") checkRaceProgress12();
  }, 3e3);
  await loadPhotos20();
  go24("feed");
}
async function saveHiCopy(srcFile, path) {
  try {
    if (!srcFile || !path) return false;
    const dim = await imgSize(srcFile);
    if (!dim || Math.max(dim.w, dim.h) < HI_MIN) {
      console.info("[أرشيف] تُخطّت — المصدر " + (dim ? dim.w + "×" + dim.h : "مجهول") + " دون الحد " + HI_MIN);
      return false;
    }
    const hi = await makeHi(srcFile);
    if (!hi) return false;
    const up = await sb.storage.from("photos").upload(hiPath(path), hi, {
      contentType: "image/jpeg",
      cacheControl: "31536000"
    });
    if (up.error) {
      console.warn("[أرشيف] تعذّر الرفع —", up.error.message);
      return false;
    }
    console.info("[أرشيف] حُفظت " + hiPath(path) + " · " + Math.round(hi.size / 1024) + " كيلو");
    return true;
  } catch (e) {
    console.warn("[أرشيف] استثناء —", e && e.message || e);
    return false;
  }
}
async function addPhoto() {
  if (isAnon()) {
    toast("سجّل أول عشان تنشر 📸");
    openAcc15();
    return;
  }
  const title = $("aTitle").value.trim();
  let region = $("aRegion").value, city = $("aCity").value, country = "";
  if (state.isAbroad) {
    country = $("aCountry").value.trim();
    if (country.length < 2) {
      toast("اكتب الدولة والمدينة 🌍", true);
      return;
    }
    region = "عدسة مسافر";
    city = country;
  }
  if (!state.pendingFile && !state.pendingVideo) return toast("اختر صورة أو فيديو أول ⚠️", true);
  if (typeof checkText === "function") {
    const bt = checkText($("aTitle").value);
    if (bt) {
      toast("العنوان: " + bt, true);
      return;
    }
    const bd = $("aDesc") ? checkText($("aDesc").value, { allowLink: true }) : null;
    if (bd) {
      toast("الوصف: " + bd, true);
      return;
    }
    const bv = checkText($("aVillage") ? $("aVillage").value : "");
    if (bv) {
      toast("اسم القرية: " + bv, true);
      return;
    }
  }
  if (typeof checkRate11 === "function") {
    const lim = await checkRate11("photo");
    if (lim) {
      toast(lim, true);
      return;
    }
  }
  if (!title) return toast("اكتب عنوان للصورة ⚠️", true);
  if (title.length < 2) return toast("العنوان قصير — حرفان على الأقل ✏️", true);
  if (title.length > 100) return toast("العنوان طويل — 100 حرف كحد أقصى ✏️", true);
  if (!state.isAbroad && (!region || !city)) return toast("حدد المنطقة والمدينة ⚠️", true);
  const btn = $("pubBtn");
  btn.disabled = true;
  btn.textContent = "⏳ جاري الرفع...";
  try {
    if (state.pendingVideo) {
      const vpath = `${currentUser()?.id}/${Date.now()}.mp4`;
      const upv = await sb.storage.from("videos").upload(vpath, state.pendingVideo, { contentType: state.pendingVideo.type || "video/mp4", cacheControl: "31536000" });
      if (upv.error) throw upv.error;
      const insv = await sb.from("photos").insert(mediaRow(title, region, city, country, {
        image_path: vpath,
        media_type: "video",
        filter_key: state.curFilter,
        music_key: state.pendingMusicName || "",
        description: ""
      }));
      if (insv.error) {
        await sb.storage.from("videos").remove([vpath]).catch(() => {
        });
        throw insv.error;
      }
      if (state.pendingVis === "public") {
        try {
          const nm2 = await myDisplayName();
          pushNotify22({
            title: "🎬 مقطع جديد في الأضواء",
            body: title + " — عدسة " + nm2,
            url: "/",
            exclude: currentUser()?.id
          });
        } catch (e) {
        }
      }
      state.pendingVideo = null;
      resetFilter4();
      state.pendingVis = "public";
      setVis("public");
      const _c1 = $("clearDraft");
      if (_c1) _c1.style.display = "none";
      const pv = $("videoPreview");
      if (pv) {
        pv.src = "";
        pv.style.display = "none";
      }
      $("drop").style.display = "none";
      $("geoCard").style.display = "none";
      resetAddForm();
      await afterPublish("انرفع الفيديو 🎬", "new");
      btn.disabled = false;
      btn.textContent = state.pendingVideo ? "انشر المقطع 🎬" : "انشر الصورة 🚀";
      return;
    }
    const blob = state.pendingBlob || await compress(state.pendingFile);
    const _insp = !!state.banner.inspect_enabled || !!state.inspectOn;
    if (_insp && typeof runInspection4 === "function") {
      const ok = await runInspection4(blob);
      if (!ok) {
        btn.disabled = false;
        btn.textContent = state.pendingVis === "private" ? "🔒 احفظ بخزنتي" : "انشر الصورة 🚀";
        return;
      }
    }
    const thumb = await compressTo(state.pendingFile, 380, 0.72);
    const path = `${currentUser()?.id}/${Date.now()}.jpg`;
    const [up, upT] = await Promise.all([
      sb.storage.from("photos").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" }),
      sb.storage.from("photos").upload(thumbPath(path), thumb, { contentType: "image/jpeg", cacheControl: "31536000" })
    ]);
    if (up.error) throw up.error;
    const ins = await sb.from("photos").insert(mediaRow(title, region, city, country, {
      image_path: path,
      description: $("aDesc") ? $("aDesc").value.trim() : "",
      title_en: state.trTitle,
      description_en: state.trDesc
    })).select("id").maybeSingle();
    if (ins.error) {
      await sb.storage.from("photos").remove(allPaths(path)).catch(() => {
      });
      throw ins.error;
    }
    saveHiCopy(state.pendingFile, path);
    try {
      const cp = $("clPlace"), cr = $("clReason");
      if (cp && cr && cp.value.trim() && cr.value.trim() && ins.data && ins.data.id && !(typeof checkText === "function" && (checkText(cp.value) || checkText(cr.value)))) {
        const cl = await sb.from("claims").insert({
          photo_id: ins.data.id,
          user_id: currentUser()?.id,
          place_name: cp.value.trim(),
          reason: cr.value.trim(),
          lat: state.pendingGeo?.lat ?? null,
          lng: state.pendingGeo?.lng ?? null
        });
        if (!cl.error) {
          cp.value = "";
          cr.value = "";
          setTimeout(() => toast("انسجّل سبقك 🏅"), 1800);
        }
      }
    } catch (e) {
    }
    if (state.pendingVis === "public") {
      try {
        const nm = await myDisplayName();
        pushNotify22({
          title: "📸 صورة جديدة من " + (city || region),
          body: title + " — عدسة " + nm,
          url: "/",
          exclude: currentUser()?.id
        });
      } catch (e) {
      }
    }
    state.pendingFile = null;
    state.pendingGeo = null;
    state.pendingBlob = null;
    resetFilter4();
    state.pendingVis = "public";
    setVis("public");
    const _c2 = $("clearDraft");
    if (_c2) _c2.style.display = "none";
    $("preview").style.display = "none";
    $("drop").style.display = "none";
    $("geoCard").style.display = "none";
    resetAddForm();
    const wasAbroad = state.isAbroad;
    $("aCountry").value = "";
    await afterPublish(
      state.pendingVis === "private" ? "انحفظت بخزنتك 🔒" : "نُشرت صورتك 🎉",
      wasAbroad ? "abroad" : "new"
    );
  } catch (e) {
    if (e.message && e.message.includes("row-level")) {
      const [ban, lim] = await Promise.all([sb.rpc("am_i_banned"), sb.rpc("my_uploads_today")]);
      if (ban.data === true) toast("حسابك محظور من النشر — راسل الإدارة من صفحة حسابي ⛔", true);
      else if ((lim.data ?? 0) >= 10) toast("وصلت حد النشر اليومي (10 صور) — كمّل بكرة 🌙", true);
      else toast("تعذر النشر — تأكد أنك مسجل دخول", true);
    } else if (e.message && e.message.includes("check constraint")) {
      toast("تأكد من البيانات: العنوان 2–100 حرف ✏️", true);
    } else toast("تعذر النشر: " + (e.message || ""), true);
  } finally {
    btn.disabled = false;
    btn.textContent = "انشر الصورة 🚀";
  }
}
function clearDraft() {
  try {
    const _is = $("inspectStatus");
    if (_is) _is.style.display = "none";
    if (typeof hideSuggestions4 === "function") hideSuggestions4();
    if (typeof inspClose === "function") inspClose();
    state.earlyRes = null;
    state.sugT = "";
    state.sugD = "";
    setTimeout(syncPublishBtn3, 0);
    state.pendingFile = null;
    state.pendingBlob = null;
    state.pendingVideo = null;
    state.pendingGeo = null;
    const im = $("preview");
    if (im) {
      im.removeAttribute("src");
      im.style.display = "none";
    }
    const vd = $("videoPreview");
    if (vd) {
      try {
        vd.pause();
      } catch (e) {
      }
      vd.removeAttribute("src");
      vd.load && vd.load();
      vd.style.display = "none";
    }
    resetFilter4();
    $("drop").style.display = "none";
    $("drop").classList.remove("has");
    $("geoCard").style.display = "none";
    const cd = $("clearDraft");
    if (cd) cd.style.display = "none";
    toast("انلغت المسودة");
  } catch (e) {
  }
}
function showClearBtn3() {
  const cd = $("clearDraft");
  if (cd) cd.style.display = "block";
}
function syncPublishBtn3() {
  const isV = !!state.pendingVideo;
  const b = $("pubBtn");
  if (b) b.textContent = state.pendingVis === "private" ? "🔒 احفظ بخزنتي" : isV ? "انشر المقطع 🎬" : "انشر الصورة 🚀";
  const t = $("addTitle");
  if (t) t.textContent = isV ? "شارك مقطعاً من ديرتك" : "شارك صورة من ديرتك";
  const lt = $("lblTitle");
  if (lt) lt.textContent = isV ? "عنوان المقطع" : "عنوان الصورة";
  const lc = $("lblCat");
  if (lc) lc.textContent = isV ? "تصنيف المقطع" : "تصنيف الصورة";
  const dg = $("descGroup");
  if (dg) dg.style.display = isV ? "none" : "block";
  const tg = $("trGroup");
  if (tg) tg.style.display = isV ? "none" : "block";
  const ti = $("aTitle");
  if (ti) ti.placeholder = isV ? "مثال: ضباب الصباح على السودة" : "مثال: غروب على جبال السودة";
  const cf = $("claimForm");
  if (cf) cf.style.display = isV ? "none" : "block";
}
function syncRulesLabel() {
  const d = $("rulesBox"), l = $("rulesLabel");
  if (!d || !l) return;
  l.textContent = d.open ? "📋 إرشادات النشر — اضغط للطي" : "📋 إرشادات النشر — اضغط للعرض";
}
function syncClaimLabel() {
  const d = $("claimForm"), l = $("claimLabel");
  if (!d || !l) return;
  l.textContent = d.open ? "🏅 سجّل سبقك في هذا الموقع — اضغط للطي" : "🏅 سجّل سبقك في هذا الموقع — اضغط للعرض";
}
function descCount2() {
  const t = $("aDesc"), l = $("descLen");
  if (t && l) l.textContent = t.value.length + " / 600";
}
var PHOTO_TAGS = [
  { k: "pure", n: "💎 طبيعة نقية" },
  { k: "night", n: "🌙 ليلي" },
  { k: "season", n: "🍂 موسمي" },
  { k: "hard", n: "⛰️ صعب الوصول" },
  { k: "rare", n: "✨ مشهد نادر" },
  { k: "sunrise", n: "🌅 شروق/غروب" }
];
state.pickedTags = [];
function renderTagRow4() {
  const el = $("tagRow");
  if (!el) return;
  el.innerHTML = "";
  PHOTO_TAGS.forEach((t) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tag-chip" + (state.pickedTags.includes(t.k) ? " on" : "");
    b.textContent = t.n;
    b.onclick = () => {
      const i = state.pickedTags.indexOf(t.k);
      if (i > -1) state.pickedTags.splice(i, 1);
      else if (state.pickedTags.length < 3) state.pickedTags.push(t.k);
      else {
        toast("حد أقصى ٣ سمات", true);
        return;
      }
      renderTagRow4();
    };
    el.appendChild(b);
  });
}
function tagName4(k) {
  const t = PHOTO_TAGS.find((x) => x.k === k);
  return t ? t.n : k;
}
async function fillPlaceFromGeo2(lat, lng, silent, force) {
  try {
    let info = await reverseGeo(lat, lng);
    if (!info || !info.region && !info.city) {
      try {
        const nc = nearestCity(lat, lng);
        if (nc && nc.city) {
          info = {
            region: info && info.region || (nc.km <= 200 ? nc.region : ""),
            city: info && info.city || (nc.km <= 60 ? nc.city : ""),
            village: info && info.village || "",
            country: info && info.country || "السعودية"
          };
        }
      } catch (e) {
      }
    }
    if (!info) return null;
    state.geoPlace = info;
    const outside = !!(info.country && !/السعود|Saudi/i.test(info.country));
    if (typeof state.isAbroad !== "undefined" && state.isAbroad) {
      const ct = $("aCountry");
      if (ct && !ct.value.trim()) {
        const parts = [info.city || info.village, info.country].filter(Boolean);
        ct.value = parts.join("، ");
      }
      if (!silent && typeof toast === "function" && info.country) toast("🌍 " + info.country);
      return info;
    }
    if (outside) {
      if (!silent && typeof toast === "function") {
        toast("🌍 الصورة من " + info.country + " — بدّل لـ«عدسة مسافر»", true);
      }
      return info;
    }
    const rs = $("aRegion");
    const ro = findOpt(rs, info.region);
    if (ro && rs && (force || !rs.value)) {
      rs.value = ro.value;
      if (typeof fillAddCities11 === "function") fillAddCities11();
      await new Promise((r) => setTimeout(r, 180));
    }
    const cs = $("aCity");
    const co = findOpt(cs, info.city) || findOpt(cs, info.village);
    if (co && cs && (force || !cs.value)) cs.value = co.value;
    const vs = $("aVillage");
    if (vs && info.village && (force || !vs.value.trim()) && vs.tagName === "INPUT") {
      vs.value = info.village;
    }
    if (!silent && typeof toast === "function") {
      const parts = [info.village, info.city, info.region].filter(Boolean).slice(0, 2);
      if (parts.length) toast("📍 " + parts.join(" · "));
    }
    return info;
  } catch (e) {
    return null;
  }
}

// js/features/visits.js
var visits_exports = {};
__export(visits_exports, {
  addVisit: () => addVisit,
  loadVisitCounts: () => loadVisitCounts4,
  removeVisit: () => removeVisit,
  renderVisits: () => renderVisits4,
  saveVisitNote: () => saveVisitNote
});
init_db();
init_format();
init_hub();
init_media();
init_state();
init_ui();
init_places();
var go25 = need("go");
var pushNotify23 = need("pushNotify");
var render19 = need("render");
async function renderVisits4(p) {
  const el = $("visitBox");
  if (!el) return;
  if (!p.lat || !p.lng) {
    el.style.display = "none";
    return;
  }
  el.style.display = "block";
  el.className = "visit-box";
  el.innerHTML = '<div class="visit-far">⏳</div>';
  const r = await sb.from("visits").select("user_id,note,created_at,profiles!user_id(display_name)").eq("photo_id", p.id).order("created_at", { ascending: false });
  const list = r.data || [];
  const mine = currentUser() ? list.find((v) => v.user_id === currentUser()?.id) : null;
  let near = false, dist = null;
  if (window.__USER_LAT) {
    dist = Math.hypot((p.lat - window.__USER_LAT) * 111e3, (p.lng - window.__USER_LNG) * 111e3 * Math.cos(p.lat * Math.PI / 180));
    near = dist <= 500;
  }
  let btn = "";
  if (mine) {
    btn = `<button class="visit-btn done" onclick="removeVisit(${p.id})">✓ زرته — إلغاء</button>`;
  } else if (near) {
    btn = `<button class="visit-btn" onclick="addVisit(${p.id})">✅ زرت هذا المكان</button>`;
  } else if (dist !== null) {
    btn = `<span class="visit-far">📍 تبعد ${dist > 1e3 ? (dist / 1e3).toFixed(1) + " كم" : Math.round(dist) + " م"} — اقترب لتسجيل زيارتك</span>`;
  } else {
    btn = `<span class="visit-far">فعّل الموقع لتسجيل زيارتك</span>`;
  }
  el.innerHTML = `
    <div class="visit-head">
      <span class="visit-count">👣 ${list.length} ${list.length === 1 ? "زائر" : "زائرين"}</span>
      ${btn}
    </div>
    ${mine ? `<div style="display:flex;gap:6px;margin-top:6px">
      <input id="vNote" placeholder="انطباعك عن المكان (اختياري)" value="${esc(mine.note || "")}" style="flex:1;background:var(--card2);border:1px solid var(--line);border-radius:10px;padding:8px 11px;font-family:'Tajawal';font-size:12.5px;color:var(--txt);outline:none">
      <button class="btn" style="font-size:12px;padding:7px 13px" onclick="saveVisitNote(${p.id})">حفظ</button>
    </div>` : ""}
    ${list.filter((v) => v.note).map((v) => `<div class="visit-note"><b>${esc(v.profiles?.display_name || "زائر")}</b>${esc(v.note)}</div>`).join("")}`;
}
async function addVisit(pid) {
  if (isAnon()) {
    toast("سجّل أول عشان توثّق زيارتك", true);
    return;
  }
  const ph = state.photos.find((x) => x.id === pid);
  if (!ph || !ph.lat || !ph.lng) {
    toast("ما فيه موقع مسجّل لهذه الصورة", true);
    return;
  }
  toast("📍 نتحقق من موقعك...");
  const pos = await new Promise((res) => {
    if (!navigator.geolocation) return res(null);
    navigator.geolocation.getCurrentPosition(
      (p2) => res(p2.coords),
      () => res(null),
      { enableHighAccuracy: true, timeout: 12e3, maximumAge: 0 }
    );
  });
  if (!pos) {
    toast("تعذر تحديد موقعك — فعّل الموقع وحاول ثانية", true);
    return;
  }
  window.__USER_LAT = pos.latitude;
  window.__USER_LNG = pos.longitude;
  const dist = Math.hypot((ph.lat - pos.latitude) * 111e3, (ph.lng - pos.longitude) * 111e3 * Math.cos(ph.lat * Math.PI / 180));
  if (dist > 500) {
    const txt = dist > 1e3 ? (dist / 1e3).toFixed(1) + " كم" : Math.round(dist) + " متراً";
    toast("لا زلت بعيداً — " + txt + " عن الموقع", true);
    renderVisits4(ph);
    return;
  }
  const { error } = await sb.from("visits").insert({ photo_id: pid, user_id: currentUser()?.id });
  if (error) {
    toast("تعذر التسجيل: " + error.message, true);
    return;
  }
  toast("انسجّلت زيارتك 👣");
  try {
    if (ph.user_id && ph.user_id !== currentUser()?.id && typeof pushNotify23 === "function") {
      const me = (await sb.from("profiles").select("display_name").eq("id", currentUser()?.id).maybeSingle()).data;
      const loc = ph.abroad ? ph.country || ph.city : ph.village || ph.city;
      pushNotify23({
        title: "👣 أحد زار مكان صورتك",
        body: (me && me.display_name || "زائر") + " وصل إلى " + loc + " — «" + ph.title + "»",
        url: "/",
        user_ids: [ph.user_id]
      });
    }
  } catch (e) {
  }
  await loadVisitCounts4();
  render19();
  renderVisits4(state.curPhoto);
}
async function removeVisit(pid) {
  await sb.from("visits").delete().eq("photo_id", pid).eq("user_id", currentUser()?.id);
  toast("انشالت الزيارة");
  await loadVisitCounts4();
  render19();
  renderVisits4(state.curPhoto);
}
async function saveVisitNote(pid) {
  const t = $("vNote").value.trim();
  const badV = checkText(t);
  if (badV) {
    toast(badV, true);
    return;
  }
  const { error } = await sb.from("visits").update({ note: t }).eq("photo_id", pid).eq("user_id", currentUser()?.id);
  if (error) {
    dbErr("حفظ انطباع الزيارة", error, "تعذر الحفظ");
    return;
  }
  toast("انحفظ انطباعك ✅");
  renderVisits4(state.curPhoto);
}
async function loadVisitCounts4() {
  try {
    const r = await sb.from("visits").select("photo_id");
    state.visitCounts = {};
    (r.data || []).forEach((v) => {
      state.visitCounts[v.photo_id] = (state.visitCounts[v.photo_id] || 0) + 1;
    });
  } catch (e) {
  }
}

// js/main.js
var ALL = Object.assign(
  {},
  nav_exports,
  push_exports,
  theme_exports,
  account_media_exports,
  account_exports,
  banners_exports,
  blocks_exports,
  camera_exports,
  claims_exports,
  contest_exports,
  edit_exports,
  exif_exports,
  favorites_exports,
  feed_exports,
  filterbar_exports,
  filters_exports,
  geopick_exports,
  inspect_exports,
  limits_exports,
  map_exports,
  messages_exports,
  music_exports,
  notify_exports,
  profile_exports,
  promo_exports,
  quests_exports,
  race_exports,
  rating_exports,
  reels_exports,
  search_exports,
  share_exports,
  sheet_exports,
  stats_exports,
  translate_exports,
  upload_exports,
  visits_exports
);
provide(ALL);
expose(ALL);
expose({ toast, $ });
var _admLoaded = false;
async function loadAdminModule() {
  if (_admLoaded) return true;
  try {
    const mods = await Promise.all([
      Promise.resolve().then(() => (init_cleanup(), cleanup_exports)),
      Promise.resolve().then(() => (init_contest(), contest_exports2)),
      Promise.resolve().then(() => (init_curation(), curation_exports)),
      Promise.resolve().then(() => (init_admin(), admin_exports)),
      Promise.resolve().then(() => (init_misc(), misc_exports)),
      Promise.resolve().then(() => (init_music(), music_exports2)),
      Promise.resolve().then(() => (init_news(), news_exports)),
      Promise.resolve().then(() => (init_places2(), places_exports)),
      Promise.resolve().then(() => (init_quests(), quests_exports2)),
      Promise.resolve().then(() => (init_reports(), reports_exports)),
      Promise.resolve().then(() => (init_settings(), settings_exports)),
      Promise.resolve().then(() => (init_stats(), stats_exports2)),
      Promise.resolve().then(() => (init_team(), team_exports))
    ]);
    const bag = Object.assign({}, ...mods);
    provide(bag);
    const { openAdmin: _real, ...rest } = bag;
    expose(rest);
    window.__openAdminReal = _real;
    _admLoaded = true;
    return true;
  } catch (e) {
    console.error("[admin] تعذر التحميل", e);
    toast("تعذر تحميل لوحة الإشراف", true);
    return false;
  }
}
expose({
  openAdmin: async () => {
    const ok = await loadAdminModule();
    if (!ok) return;
    if (typeof window.__openAdminReal === "function") window.__openAdminReal();
  },
  loadAdminModule
});
async function boot2() {
  if (window.__BOOT_FAIL) return;
  installErrorWatch();
  try {
    await ensureAuth();
  } catch (e) {
    console.error("[boot] فشل المصادقة", e);
    return;
  }
  try {
    await loadPlaces();
    initSelects4();
    fillAddCities5();
    fillCities();
    console.info(
      "[boot] القوائم جاهزة:",
      (document.getElementById("aRegion")?.options.length || 0) - 1,
      "منطقة"
    );
  } catch (e) {
    console.error("[boot] تعذر بناء القوائم", e);
  }
  try {
    await boot();
  } catch (e) {
    console.error("[boot] خطأ بالإقلاع", e);
  }
  if (location.search.includes("debug")) hubReport();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot2);
} else {
  boot2();
}
export {
  loadAdminModule
};
