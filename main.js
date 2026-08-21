/* ====== الوضع الليلي ====== */
(function(){
  try{
    var t=localStorage.getItem('sowra_theme');
    if(!t){
      t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
    }
    if(t==='dark')document.documentElement.setAttribute('data-preload-dark','1');
  }catch(e){}
})();

function applyTheme(t){
  try{
    document.body.classList.toggle('dark',t==='dark');
    var b=document.getElementById('themeBtn');
    if(b){b.textContent=t==='dark'?'☀️':'🌙';b.title=t==='dark'?'الوضع النهاري':'الوضع الليلي';}
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',t==='dark'?'#161310':'#F7F1E3');
    localStorage.setItem('sowra_theme',t);
  }catch(e){}
}

function toggleTheme(){
  var cur=document.body.classList.contains('dark')?'dark':'light';
  applyTheme(cur==='dark'?'light':'dark');
}

function initTheme(){
  var t='light';
  try{
    t=localStorage.getItem('sowra_theme');
    if(!t)t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';
  }catch(e){}
  applyTheme(t);
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
  if(p!=='reels'&&typeof stopAllReels==='function')stopAllReels();
  if(p==='acc'&&typeof renderVault==='function')setTimeout(renderVault,150);
  if(p==='acc'&&typeof renderNotifBox==='function')setTimeout(renderNotifBox,150);
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
  initEnBar();
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
