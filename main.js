/* ====== الوضع الليلي — نهاري · ليلي · تلقائي ====== */
(function(){
  try{
    var t=localStorage.getItem('sowra_theme')||'auto';
    if(t==='dark')document.documentElement.setAttribute('data-preload-dark','1');
  }catch(e){}
})();

function isNightNow(){
  try{
    const s=localStorage.getItem('sowra_sun');
    if(s){
      const o=JSON.parse(s);
      const now=Date.now();
      if(o.rise&&o.set&&(now-o.at)<86400000)return now<o.rise||now>o.set;
    }
  }catch(e){}
  const h=new Date().getHours();
  return h<6||h>=18;
}

async function loadSunTimes(lat,lng){
  try{
    const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lng
      +'&daily=sunrise,sunset&timezone=auto&forecast_days=1');
    const j=await r.json();
    const rise=new Date(j.daily.sunrise[0]).getTime();
    const set=new Date(j.daily.sunset[0]).getTime();
    localStorage.setItem('sowra_sun',JSON.stringify({rise,set,at:Date.now()}));
    if(getThemeMode()==='auto')applyTheme('auto');
  }catch(e){}
}

function getThemeMode(){
  try{return localStorage.getItem('sowra_theme')||'auto'}catch(e){return 'auto'}
}

function resolveTheme(mode){
  if(mode==='dark')return 'dark';
  if(mode==='light')return 'light';
  return isNightNow()?'dark':'light';
}

function applyTheme(mode){
  try{
    if(mode==='auto'||mode==='dark'||mode==='light'){}else{mode=mode==='dark'?'dark':'light'}
    const eff=resolveTheme(mode);
    document.body.classList.toggle('dark',eff==='dark');
    const b=document.getElementById('themeBtn');
    if(b){
      b.textContent=mode==='auto'?'🔄':(mode==='dark'?'☀️':'🌙');
      b.title=mode==='auto'?'تلقائي حسب الوقت':(mode==='dark'?'الوضع النهاري':'الوضع الليلي');
    }
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',eff==='dark'?'#161310':'#F7F1E3');
    localStorage.setItem('sowra_theme',mode);
  }catch(e){}
}

function toggleTheme(){
  const cur=getThemeMode();
  const next=cur==='auto'?'light':(cur==='light'?'dark':'auto');
  applyTheme(next);
  const names={auto:'تلقائي حسب الوقت 🔄',light:'الوضع النهاري ☀️',dark:'الوضع الليلي 🌙'};
  if(typeof toast==='function')toast(names[next]);
}

function initTheme(){
  applyTheme(getThemeMode());
  setInterval(function(){if(getThemeMode()==='auto')applyTheme('auto')},600000);
}

/* صورة من بلدي — main.js | v1.1 */
/* ============ التنقل ============ */
function go(p){
  if(p==='add' && (!USER || USER.is_anonymous)){
    toast('سجّل أول عشان تنشر صورك باسمك 📸');
    p='acc';
    $('accOut').style.display='block';$('accIn').style.display='none';
  }
  if(p==='adm' && !IS_ADMIN)p='feed';
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('on'));
  $('page-'+p).classList.add('on');
  const wasDark=document.body.classList.contains('dark');
  document.body.className='page-'+p+(wasDark?' dark':'');
  if(p==='feed'){
    if(typeof loadPhotos==='function') loadPhotos().then(()=>{if(typeof render==='function')render();});
    else if(typeof render==='function') render();
    const adm=$('page-adm');
    if(adm&&adm.classList.contains('on')) adm.classList.remove('on');
  }
  // أغلق نافذة الصورة عند أي تنقل
  const _ov=document.getElementById('overlay');
  if(_ov&&_ov.classList.contains('show')){
    _ov.classList.remove('show');
    document.body.style.overflow='';
  }
  if(p!=='reels'&&typeof stopAllReels==='function')stopAllReels();
  if(p==='feed'&&typeof applyViewPrefs==='function')setTimeout(applyViewPrefs,80);
  if(p==='acc'&&typeof renderAccAvatar==='function')setTimeout(renderAccAvatar,150);
  if(p==='acc'&&typeof renderAccCover==='function')setTimeout(renderAccCover,150);
  if(p!=='acc'&&typeof accPanel==='function'&&window.__accOpen)accPanel('');
  $('nb-feed').classList.toggle('on',p==='feed');
  const nr=$('nb-reels');if(nr)nr.classList.toggle('on',p==='reels');
  $('nb-favs').classList.toggle('on',p==='favs');
  $('nb-msgs').classList.toggle('on',p==='msgs');
  $('nb-acc').classList.toggle('on',p==='acc');
  const fb=$('fab');if(fb)fb.style.display=(p==='add')?'none':'block';
  window.scrollTo(0,0);
}

/* ============ البداية ============ */
(async()=>{
  if(window.__BOOT_FAIL)return;
  initTheme();
  await handleAuthReturn();
  initEnBar();
  initViewPrefs();
  if(typeof renderTagRow==='function')renderTagRow();
  if(typeof renderFdTags==='function')renderFdTags();
  initSelects();fillAddCities();
  const authP=ensureAuth().then(()=>{checkAdmin();loadFavs();}).catch(e=>toast('تعذر الاتصال بالحساب',true));
  try{
    await Promise.all([loadPlaces(),loadPhotos()]);
    loadWeek();loadSponsor();loadChallenge();
    initHero();
    showNearby();
    if(typeof loadWeatherTip==='function')setTimeout(loadWeatherTip,400);
    if(typeof initGoogleBtn==='function')initGoogleBtn();
  }catch(e){
    $('feed').innerHTML=`<div class="empty"><span class="big">⚠️</span>تعذر تحميل الصور<br>${e.message||''}</div>`;
  }
  await authP;
})();

/* ====== Tap overlay للجوال ====== */
document.addEventListener('click',function(e){
  const card=e.target.closest('.mcard');
  if(!card)return;
  if(window.matchMedia('(hover:hover)').matches)return;
  if(!card.classList.contains('tapped')){
    document.querySelectorAll('.mcard.tapped').forEach(c=>c.classList.remove('tapped'));
    card.classList.add('tapped');
    e.stopPropagation();
    return;
  }
},true);
/* ====== تحديث تلقائي عند العودة للتطبيق ====== */
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'){
    if(typeof loadPhotos==='function')loadPhotos();
    if(typeof loadSponsor==='function')loadSponsor();
    if(typeof loadWeek==='function')loadWeek();
    if(typeof loadChallenge==='function')loadChallenge();
  }
});

/* تحديث دوري كل دقيقتين والتطبيق مفتوح */
setInterval(()=>{
  if(document.visibilityState==='visible'&&typeof loadPhotos==='function')loadPhotos();
},120000);

/* ====== الإشعارات ====== */
window.__VAPID_PUB='BCeGpOtX3WqUv7u0B8hoOJDdrp8PKUXG1pow2wWyM8sS7bnLJ3v8mzqczz-SmiQJgNeZXz1Z4VouYB9LAwsXe94';

function urlB64ToUint8(b64){
  const pad='='.repeat((4-b64.length%4)%4);
  const s=(b64+pad).replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(s);
  const arr=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)arr[i]=raw.charCodeAt(i);
  return arr;
}

function notifSupported(){
  return ('Notification' in window) && ('serviceWorker' in navigator) && ('PushManager' in window);
}

function isStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
}

async function renderNotifBox(){
  const box=$('notifBox');if(!box)return;
  if(!USER||USER.is_anonymous){box.style.display='none';return}
  box.style.display='block';

  const card=box.querySelector('.notif-card');
  const st=$('notifState'), btn=$('notifBtn'), hint=$('notifHint');
  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent);

  if(!notifSupported()){
    st.textContent='غير مدعومة بهذا المتصفح';
    btn.style.display='none';
    hint.style.display='block';
    hint.textContent=isIOS
      ? 'على الأيفون: أضف التطبيق للشاشة الرئيسية أولاً (زر المشاركة ← إضافة إلى الشاشة الرئيسية)، ثم افتحه من الأيقونة.'
      : 'جرّب متصفحاً أحدث.';
    return;
  }
  if(isIOS && !isStandalone()){
    st.textContent='تحتاج تثبيت التطبيق أولاً';
    btn.style.display='none';
    hint.style.display='block';
    hint.textContent='اضغط زر المشاركة بسفاري ← «إضافة إلى الشاشة الرئيسية» ← افتح التطبيق من الأيقونة، وبعدها تقدر تفعّل الإشعارات.';
    return;
  }

  hint.style.display='none';
  btn.style.display='block';

  let sub=null;
  try{
    const reg=await navigator.serviceWorker.ready;
    sub=await reg.pushManager.getSubscription();
  }catch(e){}

  const on=!!sub && Notification.permission==='granted';
  if(card)card.classList.toggle('on',on);
  st.textContent=on?'● مفعّلة على هذا الجهاز':'غير مفعّلة';
  btn.textContent=on?'🔕 إيقاف الإشعارات':'🔔 فعّل الإشعارات';
  btn.style.background=on?'var(--card2)':'var(--sadu)';
  btn.style.color=on?'var(--txt)':'#fff';
  btn.style.border=on?'1px solid var(--line)':'none';
}

async function toggleNotifs(){
  if(!notifSupported()){toast('جهازك ما يدعم الإشعارات',true);return}
  const btn=$('notifBtn');
  btn.disabled=true;
  try{
    const reg=await navigator.serviceWorker.ready;
    const existing=await reg.pushManager.getSubscription();

    if(existing && Notification.permission==='granted'){
      // إيقاف
      const ep=existing.endpoint;
      await existing.unsubscribe();
      await sb.from('push_subs').delete().eq('endpoint',ep);
      toast('اتوقفت الإشعارات');
      renderNotifBox();
      return;
    }

    const perm=await Notification.requestPermission();
    if(perm!=='granted'){
      toast(perm==='denied'?'رفضت الإذن — فعّله من إعدادات المتصفح':'ما تم التفعيل',true);
      renderNotifBox();
      return;
    }

    const sub=await reg.pushManager.subscribe({
      userVisibleOnly:true,
      applicationServerKey:urlB64ToUint8(window.__VAPID_PUB)
    });
    const j=sub.toJSON();
    const {error}=await sb.from('push_subs').upsert({
      user_id:USER.id,
      endpoint:sub.endpoint,
      p256dh:j.keys.p256dh,
      auth:j.keys.auth
    },{onConflict:'endpoint'});
    if(error)throw error;

    toast('انفعّلت الإشعارات 🔔');
    reg.showNotification('صورة من بلدي 🇸🇦',{
      body:'الإشعارات مفعّلة — بنوصلك أول ما يصير جديد',
      icon:'icon-192.png',dir:'rtl',lang:'ar'
    });
    renderNotifBox();
  }catch(e){
    toast('تعذر التفعيل: '+(e.message||''),true);
  }finally{btn.disabled=false}
}

/* ====== دعوة تفعيل الإشعارات بعد أول نشر ====== */
function askedBefore(){
  try{return localStorage.getItem('sowra_notif_asked')==='1'}catch(e){return true}
}
function markAsked(){
  try{localStorage.setItem('sowra_notif_asked','1')}catch(e){}
}

async function maybeAskNotifs(){
  try{
    if(askedBefore())return;
    if(!USER||USER.is_anonymous)return;
    if(!notifSupported())return;
    if(Notification.permission!=='default')return;
    const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent);
    if(isIOS&&!isStandalone())return;
    // تحقق: هل مشترك أصلاً؟
    const reg=await navigator.serviceWorker.ready;
    const sub=await reg.pushManager.getSubscription();
    if(sub)return;
    setTimeout(()=>{
      const el=document.getElementById('notifAsk');
      if(el)el.classList.add('show');
    },1800);
  }catch(e){}
}

function notifAskNo(){
  markAsked();
  const el=document.getElementById('notifAsk');
  if(el)el.classList.remove('show');
  toast('تقدر تفعّلها من صفحة حسابي متى ما تبي');
}

async function notifAskYes(){
  markAsked();
  const el=document.getElementById('notifAsk');
  if(el)el.classList.remove('show');
  if(typeof toggleNotifs==='function')await toggleNotifs();
}

/* ====== شريط اللغة للأجانب ====== */
function initEnBar(){
  try{
    if(localStorage.getItem('sowra_en_dismissed')==='1')return;
    const langs=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language||''];
    const isAr=langs.some(l=>String(l).toLowerCase().startsWith('ar'));
    if(isAr)return;
    const el=document.getElementById('enBar');
    if(el)el.classList.add('show');
  }catch(e){}
}
function dismissEnBar(){
  try{localStorage.setItem('sowra_en_dismissed','1')}catch(e){}
  const el=document.getElementById('enBar');
  if(el)el.classList.remove('show');
}

/* ====== معالجة عودة تسجيل Google ====== */
async function handleAuthReturn(){
  try{
    const h=window.location.hash||'';
    const q=window.location.search||'';
    const hasCode=q.includes('code=');
    const hasToken=h.includes('access_token');
    if(!hasCode&&!hasToken)return;

    // تبادل الرمز بجلسة
    if(hasCode&&sb.auth.exchangeCodeForSession){
      try{await sb.auth.exchangeCodeForSession(window.location.href)}catch(e){}
    }
    // تنظيف الرابط
    try{history.replaceState({},document.title,window.location.pathname)}catch(e){}

    const s=await sb.auth.getSession();
    if(s&&s.data&&s.data.session){
      USER=s.data.session.user;
      await checkAdmin();
      if(typeof renderAccIn==='function')await renderAccIn();
      toast('حياك الله 🌟');
      await loadPhotos();
    }
  }catch(e){}
}

/* ====== أقسام صفحة حسابي ====== */
window.__accOpen='';

function accPanel(name){
  window.__accOpen=(window.__accOpen===name)?'':name;
  const map={edit:'pnEdit',stats:'pnStats',vault:'pnVault',notif:'pnNotif'};
  Object.keys(map).forEach(k=>{
    const el=document.getElementById(map[k]);
    if(el)el.classList.toggle('on',k===window.__accOpen);
  });
  document.querySelectorAll('.acc-tile').forEach((t,i)=>{
    const keys=['edit','stats','vault','notif'];
    t.classList.toggle('on',keys[i]===window.__accOpen);
  });
  // تحميل عند الفتح
  if(window.__accOpen==='vault'&&typeof renderVault==='function')renderVault();
  if(window.__accOpen==='stats'&&typeof renderMyStats==='function')renderMyStats();
  if(window.__accOpen==='notif'&&typeof renderNotifBox==='function')renderNotifBox();
  if(window.__accOpen){
    setTimeout(()=>{
      const el=document.getElementById(map[window.__accOpen]);
      if(el)el.scrollIntoView({behavior:'smooth',block:'nearest'});
    },60);
  }
}

/* ====== تفضيلات العرض ====== */
function getViewPrefs(){
  let p={hero:true,weather:true,challenge:true,near:true};
  try{
    const s=localStorage.getItem('sowra_view');
    if(s)p=Object.assign(p,JSON.parse(s));
  }catch(e){}
  return p;
}

function saveViewPrefs(){
  const p={
    near:!!(document.getElementById('swNear')&&document.getElementById('swNear').checked),
    hero:!!(document.getElementById('swHero')&&document.getElementById('swHero').checked),
    weather:!!(document.getElementById('swWeather')&&document.getElementById('swWeather').checked),
    challenge:!!(document.getElementById('swChallenge')&&document.getElementById('swChallenge').checked)
  };
  try{localStorage.setItem('sowra_view',JSON.stringify(p))}catch(e){}
  applyViewPrefs();
}

function applyViewPrefs(){
  const p=getViewPrefs();
  const na=document.getElementById('nearAlert');
  if(na&&!p.near)na.style.display='none';
  const hero=document.getElementById('homeHero');
  const wt=document.getElementById('weatherTip');
  const ch=document.getElementById('challengeStrip');
  if(hero&&!p.hero)hero.style.display='none';
  if(wt)wt.style.display=p.weather?'':'none';
  if(ch&&!p.challenge)ch.style.display='none';
  if(hero&&p.hero&&typeof renderHomeHero==='function')renderHomeHero();
  if(ch&&p.challenge&&typeof loadChallenge==='function')loadChallenge();
}

function initViewPrefs(){
  const p=getViewPrefs();
  const n=document.getElementById('swNear');
  if(n)n.checked=p.near;
  const a=document.getElementById('swHero'),b=document.getElementById('swWeather'),c=document.getElementById('swChallenge');
  if(a)a.checked=p.hero;
  if(b)b.checked=p.weather;
  if(c)c.checked=p.challenge;
  applyViewPrefs();
}
