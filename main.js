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
