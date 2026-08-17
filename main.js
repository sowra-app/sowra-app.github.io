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
  document.body.className='page-'+p;
  if(p==='feed'){
    if(typeof loadPhotos==='function') loadPhotos().then(()=>{if(typeof render==='function')render();});
    else if(typeof render==='function') render();
    const adm=$('page-adm');
    if(adm&&adm.classList.contains('on')) adm.classList.remove('on');
  }
  $('nb-feed').classList.toggle('on',p==='feed');
  $('nb-favs').classList.toggle('on',p==='favs');
  $('nb-msgs').classList.toggle('on',p==='msgs');
  $('nb-acc').classList.toggle('on',p==='acc');
  const fb=$('fab');if(fb)fb.style.display=(p==='add')?'none':'block';
  window.scrollTo(0,0);
}

/* ============ البداية ============ */
(async()=>{
  if(window.__BOOT_FAIL)return;
  initSelects();fillAddCities();
  const authP=ensureAuth().then(()=>{checkAdmin();loadFavs();}).catch(e=>toast('تعذر الاتصال بالحساب',true));
  try{
    await Promise.all([loadPlaces(),loadPhotos()]);
    loadWeek();loadSponsor();
    initHero();
    showNearby();
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
  }
});

/* تحديث دوري كل دقيقتين والتطبيق مفتوح */
setInterval(()=>{
  if(document.visibilityState==='visible'&&typeof loadPhotos==='function')loadPhotos();
},120000);
