let _viewMode='grid';

/* ====== الفلتر الموحد ====== */
let _cat='all', _sort='top';
function toggleFilter(){
  const d=$('filterDrawer');
  const open=d.style.display==='none';
  d.style.display=open?'block':'none';
  $('filterBtn').classList.toggle('active',open);
}
function fdSetCat(el,k){ 
  _cat=k;
  document.querySelectorAll('.fd-chips .fd-chip[data-k]').forEach(b=>b.classList.toggle('on',b.dataset.k===k));
}
function fdSetSort(el,s){
  _sort=s;
  document.querySelectorAll('.fd-chips .fd-chip[data-s]').forEach(b=>b.classList.toggle('on',b.dataset.s===s));
}
function applyFilter(){
  catFilter=_cat; 
  sortMode=_sort;
  $('filterDrawer').style.display='none';
  $('filterBtn').classList.remove('active'); 
  const badge=$('filterBadge');
  badge.style.display=(catFilter!=='all'||_sort!=='top')?'inline':'none';
  $('abroadHint').style.display=sortMode==='abroad'?'block':'none';
  if(_viewMode==='map'){renderMap();}else{render();}
}
function clearFilter(){
  _cat='all';_sort='top';
  document.querySelectorAll('.fd-chip[data-k]').forEach(b=>b.classList.toggle('on',b.dataset.k==='all'));
  document.querySelectorAll('.fd-chip[data-s]').forEach(b=>b.classList.toggle('on',b.dataset.s==='top'));
  catFilter='all';sortMode='top';
  $('filterBadge').style.display='none';
  $('abroadHint').style.display='none';
  $('filterDrawer').style.display='none';
  $('filterBtn').classList.remove('active');
  render();
}

/* ====== الأقرب إليك ====== */
function showNearby(){
  if(!navigator.geolocation){return}
  navigator.geolocation.getCurrentPosition(pos=>{
    const{latitude:lat,longitude:lng}=pos.coords;
    window.__USER_LAT=lat;window.__USER_LNG=lng;
    // لو الخريطة مفتوحة — أضف دبوس موقعك الآن
    if(MAP)addUserPin(lat,lng);
    loadWeatherTip();
    const distKm=(p)=>Math.hypot(((p.lat||0)-lat)*111,(((p.lng||0)-lng)*111*Math.cos(lat*Math.PI/180)));
const near=photos.filter(p=>p.lat&&p.lng&&p.media_type!=='video'&&distKm(p)<=30).sort((a,b)=>distKm(a)-distKm(b)).slice(0,6);

    if(!near.length)return;
    $('nearbyWrap').style.display='block';
    $('nearbyFeed').innerHTML=near.map(p=>`
      <div class="card" onclick="openSheet(${p.id})">
        <div class="ph"><img src="${thumbUrl(p.image_path)}" loading="lazy" alt="${esc(p.title)}">
          <div class="loc-chip">📍 ${esc(p.village||p.city)}</div>
        </div>
        <div class="card-body">
          <div class="card-title">${esc(p.title)}</div>
          <div class="card-meta"><span>⭐ ${Number(p.avg_stars).toFixed(1)}</span></div>
        </div>
      </div>`).join('');
  },()=>{},{timeout:5000});
}

/* ====== البنر الترحيبي مرة وحدة ====== */
function initHero(){
  const el=$('hero');if(!el)return;
  try{
    if(localStorage.getItem('sowra_hero_seen')){el.style.display='none';return;}
    el.style.display='block';
  }catch(e){el.style.display='block';}
}
function closeHero(){
  $('hero').style.display='none';
  try{localStorage.setItem('sowra_hero_seen','1')}catch(e){}
}

/* ====== البنر الجانبي للراعي ====== */
function renderSponsorSide(){
  const el=$('sponsorSide');if(!el)return;
  const sp=window.__SPDATA;
  if(!sp||!sp.side_active){el.style.display='none';return}
  el.style.display='flex';
  el.innerHTML=(sp.image_path?`<img src="${imgUrl(sp.image_path)}" alt="${esc(sp.sponsor_name||'')}">`:'')+
    `<div class="sp-info">
      <div class="sp-name">${esc(sp.sponsor_name||'راعي المنصة')}</div>
      <div class="sp-cat">${esc(sp.sponsor_cat||'')}</div>
    </div>
    <button class="sp-side-btn" onclick="openSponsorsPage()">عروضنا ←</button>`;
}

/* صورة من بلدي — photos.js | نسخة المختبر م1 */
/* ============ الأوسمة ============ */
const BADGES = [
  {k:'wall',  label:'📱 خلفية شاشة'},
  {k:'mine',  label:'❤️ بحطها خلفية جوالي'},
  {k:'global',label:'🌍 تدخل مسابقات عالمية'},
  {k:'face',  label:'🇸🇦 واجهة تشرّف السعودية'},
  {k:'print', label:'🖼️ تستاهل تنطبع لوحة'}
];
function topBadge(p){
  const b=p.badge_counts||{};let best=null,bv=0;
  for(const bd of BADGES)if((b[bd.k]||0)>bv){bv=b[bd.k];best=bd}
  return bv>=2?best:null;
}

/* ============ الحالة ============ */
let photos=[], sortMode='top', curId=null, curPhoto=null, catFilter='all';

let myRating=0, myBadgeSet=new Set();
const $=id=>document.getElementById(id);
/* تعقيم النصوص — يمنع حقن أي كود في الصفحة */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const starsTxt=v=>{let f=Math.round(v);return "★".repeat(f)+"☆".repeat(5-f)};
function toast(m,err){const t=$('toast');t.textContent=m;t.className='toast'+(err?' err':'');t.style.display='block';setTimeout(()=>t.style.display='none',2600)}
function imgUrl(path){return sb.storage.from('photos').getPublicUrl(path).data.publicUrl}
function vidUrl(path){return sb.storage.from('videos').getPublicUrl(path).data.publicUrl}

/* ============ تحميل الصور ============ */
async function loadPhotos(){
  const { data, error } = await sb.from('photos_ranked').select('*');
  if(error){$('feed').innerHTML=`<div class="empty"><span class="big">⚠️</span>تعذر تحميل الصور<br>${error.message}</div>`;return}
  photos = data || [];
  await loadVisitCounts();
  if(typeof _viewMode!=='undefined'&&_viewMode==='map'){renderMap();}
  else{render();}
}

/* ============ الفلاتر والعرض ============ */
function initSelects(){
  const fr=$('fRegion'),ar=$('aRegion');
  fr.innerHTML='<option value="">كل المناطق</option>';
  ar.innerHTML='<option value="">اختر المنطقة</option>';
  for(const r in GEO){fr.innerHTML+=`<option>${r}</option>`;ar.innerHTML+=`<option>${r}</option>`;}
}
function fillCities(){
  const r=$('fRegion').value,c=$('fCity');
  c.innerHTML='<option value="">كل المدن</option>';
  if(r)GEO[r].forEach(x=>c.innerHTML+=`<option>${x}</option>`);
}
function fillAddCities(){
  const r=$('aRegion').value,c=$('aCity');
  c.innerHTML='<option value="">اختر المدينة</option>';
  if(r)GEO[r].forEach(x=>c.innerHTML+=`<option>${x}</option>`);
  $('villList').innerHTML=(r&&VILL[r]?VILL[r]:[]).map(v=>`<option value="${v}">`).join('');
}


function render(){
  if(_viewMode==='map')return;
  const q=$('q').value.trim(), r=$('fRegion').value, c=$('fCity').value;
  const mw=$('mapWrap');if(mw)mw.style.display='none';
  $('feed').style.display='';
  const abroadView=sortMode==='abroad';
  let list=photos.filter(p=>!!p.abroad===abroadView&&p.media_type!=='video');
  if(catFilter!=='all')list=list.filter(p=>(p.category||'other')===catFilter);
  if(abroadView){
    list=list.filter(p=>!q||p.title.includes(q)||(p.country||'').includes(q));
    list.sort((a,b)=>(b.avg_stars-a.avg_stars)||(b.ratings_count-a.ratings_count)||(new Date(b.created_at)-new Date(a.created_at)));
  }else{
    list=list.filter(p=>
      (!r||p.region===r)&&(!c||p.city===c)&&
      (!q||p.title.includes(q)||(p.village||'').includes(q)||p.city.includes(q)||p.region.includes(q))
    );
    list.sort((a,b)=>sortMode==='top'
      ?(b.avg_stars-a.avg_stars)||(b.ratings_count-a.ratings_count)
      :new Date(b.created_at)-new Date(a.created_at));
  }
  $('totalPill').textContent=`${photos.length} صورة · V1.1`;
  const feed=$('feed');
  if(!list.length){feed.innerHTML=`<div class="empty"><span class="big">🏜️</span>ما فيه صور بعد..<br>كن أول من يصوّر ديرته! اضغط + وشارك</div>`;return}
  feed.innerHTML=list.map((p,i)=>{
    const medal=((sortMode==='top'||sortMode==='abroad')&&i<3&&p.ratings_count>0)?['🥇','🥈','🥉'][i]:'';
    const isV=p.media_type==='video';
    return `<div class="mcard" onclick="openSheet(${p.id})">
      ${isV
        ? `<video src="${vidUrl(p.image_path)}#t=0.5" muted playsinline preload="metadata" style="width:100%;display:block;filter:${(p.filter_key&&p.filter_key!=='none'&&typeof filterCss==='function')?filterCss(p.filter_key):'none'}"></video>`
        : `<img src="${thumbUrl(p.image_path)}" onerror="this.onerror=null;this.src='${imgUrl(p.image_path)}'" loading="lazy" alt="${esc(p.title)}">`}
      ${medal?`<div class="mc-medal">${medal}</div>`:''}
      ${VISIT_COUNTS[p.id]?`<div class="mc-visits">👣 ${VISIT_COUNTS[p.id]}</div>`:''}
      ${p.media_type==='video'?'<div class="mc-vid">▶</div>':''}
      <div class="mc-overlay">
        <div class="mc-title">${esc(p.title)}</div>
        <div class="mc-sub">${rankOf(p).ic} ${esc(p.photographer)} · ${p.abroad?esc(p.country||p.city):esc(p.village||p.city)} · 👁️ ${p.views||0}</div>
      </div>
    </div>`;
  }).join('');
}

/* ============ نافذة الصورة ============ */
async function openSheet(id){
  curId=id;curPhoto=photos.find(x=>x.id===id);
   const p=curPhoto;
  const isVid=p.media_type==='video';
  const vfx=(p.filter_key&&p.filter_key!=='none'&&typeof filterCss==='function')?filterCss(p.filter_key):'none';
  $('sPh').innerHTML=isVid
    ? `<video controls playsinline webkit-playsinline preload="metadata" style="width:100%;height:100%;object-fit:contain;background:#000;filter:${vfx}"><source src="${vidUrl(p.image_path)}" type="video/mp4"></video>`
    : `<img src="${imgUrl(p.image_path)}" onclick="zoomOpen(this.src)" alt="${esc(p.title)}">
    <button class="zoombtn" id="zoomBtn" onclick="togglePhotoZoom()">⤢ عرض كامل</button>`;
  if(!seenViews.has(p.id)){seenViews.add(p.id);try{sb.rpc('bump_view',{pid:p.id}).then(()=>{},()=>{})}catch(_){}}
  $('sPh').classList.remove('full');
  $('sTitle').textContent=p.title;
  $('sLoc').innerHTML=(p.abroad?`🌍 عدسة مسافر · ${esc(p.country||p.city)} — عدسة ${esc(p.photographer)}`:`📍 ${esc(p.region)} · ${esc(p.city)}${p.village?' · '+esc(p.village):''} — عدسة ${esc(p.photographer)}`)
    +`<br><a class="mapbtn" href="${p.lat?`https://maps.google.com/?q=${p.lat},${p.lng}`:`https://maps.google.com/?q=${encodeURIComponent(p.abroad?(p.country||p.city):((p.village?p.village+' ':'')+p.city+' '+p.region))}`}" target="_blank" rel="noopener">🗺️ افتح الموقع على قوقل ماب${p.lat?'':' (بحث بالاسم)'}</a>`;
 
  renderFollow(p);
  renderVisits(p);
  // الفيديو: نص تقييم مختلف وإخفاء الأوسمة
  const rl=$('rateLabel');
  if(rl)rl.textContent=isVid?'وش تقييمك للمقطع؟':'وش تقييمك للصورة؟';
  const pb=$('pollBox');
  if(pb)pb.style.display=isVid?'none':'block';
  if(isVid&&p.music_key){
    const lc=$('sLoc');
    if(lc)lc.innerHTML+='<br><span style="font-size:12px;color:var(--txt-dim)">🎵 '+esc(p.music_key)+'</span>';
  }
  const shb=$('shareBtn');
  if(shb)shb.onclick=function(){shareCard(p)};
  const dbw=$('deleteBtn');
  if(dbw){
    const isMine=!!(USER && p.user_id===USER.id);
    dbw.style.display=isMine?'block':'none';
    if(isMine){
      const dbi=$('deleteBtnInner');
      if(dbi)dbi.onclick=function(){deleteMyPhoto(p.id,p.image_path)};
    }
  }
  $('overlay').classList.add('show');
  document.body.style.overflow='hidden';
  // تقييمي وأوسمتي وتعليقات — من القاعدة
  myRating=0;myBadgeSet=new Set();
  drawStars();renderPoll();
  $('cList').innerHTML='<div class="loader" style="padding:10px">⏳</div>';
  const [rt,bd,cm]=await Promise.all([
    sb.from('ratings').select('stars').eq('photo_id',id).eq('user_id',USER.id).maybeSingle(),
    sb.from('badge_votes').select('badge_key').eq('photo_id',id).eq('user_id',USER.id),
    sb.from('comments').select('body,created_at,profiles!user_id(display_name)').eq('photo_id',id).order('created_at')
  ]);
  myRating=rt.data?rt.data.stars:0;
  (bd.data||[]).forEach(x=>myBadgeSet.add(x.badge_key));
  curPhoto._comments=(cm.data||[]);
  $('thanks').style.display=myRating?'block':'none';
  drawStars();renderPoll();renderComments();
}
function rankOf(p){
  const ph=p.photographer_photos||0, fo=p.followers_count||0;
  if(ph>=15&&fo>=10)return{ic:'🏆',t:'عين الديرة',c:'gold'};
  if(ph>=5||fo>=5)  return{ic:'📸',t:'عدسة الديرة',c:'silver'};
  return{ic:'🌱',t:'مستكشف',c:'bronze'};
}
const seenViews=new Set();
/* ====== المفضلة ====== */
let favSet=new Set();
async function loadFavs(){
  if(!USER)return;
  try{
    const r=await sb.from('favorites').select('photo_id').eq('user_id',USER.id);
    favSet=new Set((r.data||[]).map(x=>x.photo_id));
  }catch(e){}
}
async function toggleFav(pid){
  if(!USER){toast('تعذر الحفظ — أعد تحميل الصفحة',true);return}
  if(favSet.has(pid)){
    favSet.delete(pid);
    await sb.from('favorites').delete().eq('user_id',USER.id).eq('photo_id',pid);
    toast('انشالت من مفضلتك');
  }else{
    favSet.add(pid);
    const {error}=await sb.from('favorites').insert({user_id:USER.id,photo_id:pid});
    if(error){favSet.delete(pid);toast('تعذر الحفظ — نفّذ سكربت v15',true);return}
    toast('انحفظت بمفضلتك ❤️');
  }
  if(curPhoto)renderFollow(curPhoto);
  if($('page-favs').classList.contains('on'))renderFavs();
}
function openFavs(){
  go('favs');
  renderFavs();
}
function renderFavs(){
  const list=photos.filter(p=>favSet.has(p.id));
  $('favFeed').innerHTML=list.length?list.map(p=>`
    <div class="card" onclick="openSheet(${p.id})">
      <div class="ph"><img src="${thumbUrl(p.image_path)}" onerror="this.onerror=null;this.src='${imgUrl(p.image_path)}'" alt="${esc(p.title)}" loading="lazy">
        <div class="loc-chip">${p.abroad?'🌍 '+esc(p.country||p.city):'📍 '+esc(p.village||p.city)}</div>
      </div>
      <div class="card-body">
        <div class="card-title">${esc(p.title)}</div>
        <div class="card-meta"><span class="who">${rankOf(p).ic} ${esc(p.photographer)}</span><span>⭐ ${Number(p.avg_stars).toFixed(1)}</span></div>
      </div>
    </div>`).join('')
  :'<div class="empty" style="grid-column:1/-1"><span class="big">🤍</span>مفضلتك فاضية — افتح أي صورة واضغط «حفظ»</div>';
}
async function renderFollow(p){
  const el=$('sFollow');if(!el)return;
  const mine=USER&&p.user_id===USER.id;
  let following=false;
  if(USER&&!USER.is_anonymous&&!mine){
    const r=await sb.from('follows').select('follower_id').eq('follower_id',USER.id).eq('followed_id',p.user_id).maybeSingle();
    following=!!r.data;
  }
  const rk=rankOf(p);
  el.innerHTML=`<span class="rankchip r-${rk.c}" style="cursor:pointer" onclick="closeSheet();openProfile('${p.user_id}')">${rk.ic} ${rk.t}</span><span class="fcount">👥 ${p.followers_count||0} متابع</span>`
    +(mine?'':`<button class="fbtn ${following?'on':''}" onclick="toggleFollow('${p.user_id}',${following})">${following?'✓ متابَع':'＋ متابعة'}</button>`)
    +`<button class="fbtn fav ${favSet.has(p.id)?'on':''}" onclick="toggleFav(${p.id})">${favSet.has(p.id)?'❤️ بالمفضلة':'🤍 حفظ'}</button>`;
}
async function toggleFollow(uid,isF){
  if(!USER||USER.is_anonymous){toast('سجّل أول عشان تتابع المصورين 👥');closeSheet();openAcc();return}
  if(isF){await sb.from('follows').delete().eq('follower_id',USER.id).eq('followed_id',uid);}
  else{
    const{error}=await sb.from('follows').insert({follower_id:USER.id,followed_id:uid});
    if(error){toast('تعذرت المتابعة',true);return}
    toast('صرت متابعاً 👥');
  }
  await refreshOne();
  renderFollow(curPhoto);
}
function closeSheet(){$('overlay').classList.remove('show');document.body.style.overflow=''}
function togglePhotoZoom(){
  const full=$('sPh').classList.toggle('full');
  $('zoomBtn').textContent=full?'⤡ تصغير':'⤢ عرض كامل';
}

function drawStars(){
  $('bigStars').innerHTML=[1,2,3,4,5].map(n=>
    `<button class="${n<=myRating?'lit':''}" onclick="rate(${n})">★</button>`).join('');
  $('sAvg').textContent=`المتوسط ${Number(curPhoto.avg_stars).toFixed(1)} من 5 · ${curPhoto.ratings_count} تقييم`;
}
async function rate(n){
  const prev=myRating;myRating=n;drawStars();
  const { error } = await sb.from('ratings').upsert({photo_id:curId,user_id:USER.id,stars:n});
  if(error){myRating=prev;drawStars();toast('تعذر حفظ التقييم',true);return}
  $('thanks').style.display='block';
  await refreshOne();
}

function renderPoll(){
  const b=curPhoto.badge_counts||{};
  $('pollChips').innerHTML=BADGES.map(bd=>
    `<div class="chip ${myBadgeSet.has(bd.k)?'on':''}" onclick="voteBadge('${bd.k}')">${bd.label}<span class="n">${b[bd.k]||0}</span></div>`
  ).join('');
}
async function voteBadge(k){
  if(myBadgeSet.has(k)){
    myBadgeSet.delete(k);renderPoll();
    await sb.from('badge_votes').delete().eq('photo_id',curId).eq('user_id',USER.id).eq('badge_key',k);
  }else{
    myBadgeSet.add(k);renderPoll();
    const { error } = await sb.from('badge_votes').insert({photo_id:curId,user_id:USER.id,badge_key:k});
    if(error){myBadgeSet.delete(k);renderPoll();toast('تعذر التصويت',true);return}
  }
  await refreshOne();
}

function renderComments(){
  const list=curPhoto._comments||[];
  $('cCount').textContent=`(${list.length})`;
  $('cList').innerHTML=list.length
    ?list.map(c=>`<div class="comment"><b>${esc(c.profiles?.display_name||'زائر')}</b>${esc(c.body)}</div>`).join('')
    :`<div style="color:var(--txt-dim);font-size:13px;padding:6px 2px">كن أول من يعلق ✍️</div>`;
}
async function reportPhoto(){
  if(!confirm('هل أنت متأكد أن هذه الصورة مخالفة؟ البلاغات الكيدية قد تعرّض حسابك للحظر.'))return;
  const { error } = await sb.from('reports').insert({photo_id:curId,user_id:USER.id});
  if(error){
    if(error.code==='23505')toast('سبق أن أبلغت عن هذه الصورة');
    else toast('تعذر إرسال البلاغ',true);
    return;
  }
  toast('وصل بلاغك، شكراً لحرصك 🙏');
}

async function addComment(){
  if(!USER || USER.is_anonymous){toast('سجّل أول عشان تعلق ✍️');closeSheet();openAcc();return}
  const t=$('cText').value.trim();if(!t)return;
  const { error } = await sb.from('comments').insert({photo_id:curId,user_id:USER.id,body:t});
  if(error){toast('تعذر إرسال التعليق',true);return}
  $('cText').value='';
  const cm=await sb.from('comments').select('body,created_at,profiles!user_id(display_name)').eq('photo_id',curId).order('created_at');
  curPhoto._comments=cm.data||[];renderComments();
}

/* تحديث بيانات صورة واحدة من العرض المجمّع */
async function refreshOne(){
  const { data } = await sb.from('photos_ranked').select('*').eq('id',curId).single();
  if(data){
    const i=photos.findIndex(x=>x.id===curId);
    if(i>-1)photos[i]={...data,_comments:curPhoto._comments};
    curPhoto=photos[i];
    drawStars();renderPoll();render();
  }
}

/* ====== عارض الزوم ====== */
let lbW=100;
function zoomOpen(src){
  lbW=100;
  const im=$('lbImg');im.src=src;im.style.width='100%';
  $('lightbox').classList.add('show');
  document.body.style.overflow='hidden';
}
function zoomClose(){
  $('lightbox').classList.remove('show');
  document.body.style.overflow='';
}
function lbScaleBy(f){
  lbW=Math.min(600,Math.max(100,lbW*f));
  $('lbImg').style.width=lbW+'%';
}
function lbDbl(){lbW=lbW>100?100:250;$('lbImg').style.width=lbW+'%';}

/* ====== الخريطة التفاعلية ====== */
let MAP=null,MARKS=null;
function renderMap(){
  const wrap=$('mapWrap');
  wrap.style.display='block';$('feed').style.display='none';
  if(typeof L==='undefined'){wrap.innerHTML='<div class="empty">⚠️ تعذر تحميل الخريطة — تأكد من رفع leaflet.js وleaflet.css</div>';return}
  if(!MAP){
    MAP=L.map('map',{zoomControl:true,attributionControl:true}).setView([23.9,45.1],5);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(MAP);
    MARKS=L.layerGroup().addTo(MAP);
    // زر العودة لموقعي
    const ZoomHome=L.Control.extend({
      options:{position:'topright'},
      onAdd:function(){
        const b=L.DomUtil.create('button','');
        b.innerHTML='📍';
        b.title='موقعي';
        b.style.cssText='width:38px;height:38px;background:#fff;border:2px solid rgba(0,0,0,.2);border-radius:8px;font-size:18px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.2)';
        b.onclick=function(e){
          e.stopPropagation();
          if(window.__USER_LAT)MAP.setView([window.__USER_LAT,window.__USER_LNG],13);
          else toast('فعّل الموقع أولاً',true);
        };
        return b;
      }
    });
    MAP.addControl(new ZoomHome());
    // زر المناطق قليلة التغطية
    const GapBtn=L.Control.extend({
      options:{position:'topright'},
      onAdd:function(){
        const b=L.DomUtil.create('button','');
        b.id='gapBtn';
        b.innerHTML='🔍';
        b.title='مناطق قليلة التغطية';
        b.style.cssText='width:38px;height:38px;background:#fff;border:2px solid rgba(0,0,0,.2);border-radius:8px;font-size:17px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.2);margin-top:6px';
        b.onclick=function(e){e.stopPropagation();toggleGaps();};
        return b;
      }
    });
    MAP.addControl(new GapBtn());
  }
  MARKS.clearLayers();
  const q=($('q').value||'').trim();
  const list=photos.filter(p=>p.lat&&p.lng&&p.media_type!=='video'
    &&(catFilter==='all'||(p.category||'other')===catFilter)
    &&(!q||p.title.includes(q)||(p.village||'').includes(q)||(p.city||'').includes(q)||(p.country||'').includes(q)));
  const pts=[];
  list.forEach(p=>{
    const ic=L.divIcon({className:'',html:`<div class="pmark"><img src="${thumbUrl(p.image_path)}" onerror="this.onerror=null;this.src='${imgUrl(p.image_path)}'"></div>`,iconSize:[46,46],iconAnchor:[23,23]});
    L.marker([p.lat,p.lng],{icon:ic}).addTo(MARKS).on('click',()=>openSheet(p.id));
    pts.push([p.lat,p.lng]);
  });
 // التمركز الذكي: موقع المستخدم أولاً، وإلا كل الصور
  if(window.__USER_LAT && !MAP._userCentered){
    MAP.setView([window.__USER_LAT,window.__USER_LNG],11);
    MAP._userCentered=true;
  } else if(pts.length && !MAP._userCentered){
    MAP.fitBounds(pts,{padding:[46,46],maxZoom:12});
  }
  // دبوس الراعي
  const spd=window.__SPDATA;
  if(spd&&spd.active&&spd.image_path&&spd.sponsor_lat&&spd.sponsor_lng){
    const sic=L.divIcon({className:'',html:`<div class="pmark sp-pin"><img src="${imgUrl(spd.image_path)}"><div class="sp-pin-label">${esc(spd.sponsor_name||'راعي')}</div></div>`,iconSize:[54,66],iconAnchor:[27,66]});
    L.marker([spd.sponsor_lat,spd.sponsor_lng],{icon:sic,zIndexOffset:1000}).addTo(MARKS).on('click',()=>openSponsorsPage());
  }
  setTimeout(()=>{MAP.invalidateSize();if(window.__USER_LAT)addUserPin(window.__USER_LAT,window.__USER_LNG);},120);
  const sp=window.__SPDATA;
  $('mapSponsor').innerHTML=(sp&&sp.active&&sp.image_path)
    ?((sp.link_url?`<a href="${esc(sp.link_url)}" target="_blank" rel="noopener">`:'')+`<img src="${imgUrl(spd.image_path)}" alt="راعي المنصة">`+(sp.link_url?'</a>':''))
    :'';
}

/* ====== دبوس موقع المستخدم بالخريطة ====== */
let _userPin=null;
function addUserPin(lat,lng){
  if(!MAP||typeof L==='undefined')return;
  if(_userPin)_userPin.remove();
  const ic=L.divIcon({className:'',html:'<div class="user-pin">📍<div class="user-pin-label">موقعي</div></div>',iconSize:[40,52],iconAnchor:[20,52]});
  _userPin=L.marker([lat,lng],{icon:ic,zIndexOffset:2000}).addTo(MAP);
}

/* ====== تبديل العرض مع حفظ الحالة ====== */
function setView(v){
  _viewMode=v;
  $('vtGrid').classList.toggle('on',v==='grid');
  $('vtMap').classList.toggle('on',v==='map');
  const feed=$('feed');
  const map=$('mapWrap');
  const nearby=$('nearbyWrap');
  if(v==='map'){
    if(feed)feed.style.display='none';
    if(nearby)nearby.style.display='none';
    if(map)map.style.display='block';
    renderMap();
  } else {
    if(map)map.style.display='none';
    if(feed)feed.style.display='';
    render();
  }
}
/* ====== حذف الصورة لصاحبها ====== */
async function deleteMyPhoto(pid,path){
  try{
    const r=await sb.from('weekly_entries').select('id').eq('photo_id',pid).maybeSingle();
    if(r&&r.data){toast('⚠️ الصورة مرشحة بمسابقة — لا يمكن حذفها الآن',true);return}
  }catch(e){}
  if(!confirm('حذف الصورة نهائياً؟ لا يمكن التراجع.'))return;
  const ph=photos.find(x=>x.id===pid);
  const isVid=ph&&ph.media_type==='video';
  try{
    if(isVid) await sb.storage.from('videos').remove([path]);
    else await sb.storage.from('photos').remove([path,path.replace('.jpg','_t.jpg')]);
  }catch(e){}
  const {error}=await sb.from('photos').delete().eq('id',pid).eq('user_id',USER.id);
  if(error){toast('تعذر الحذف: '+error.message,true);return}
  toast(isVid?'انحذف الفيديو ✅':'انحذفت الصورة ✅');
  closeSheet();
  await loadPhotos();
}
/* ====== بروفايل المصور ====== */
async function openProfile(uid){
  go('profile');
  $('profHead').innerHTML='<div class="loader">⏳</div>';
  const r=await sb.from('profiles').select('display_name,bio,region').eq('id',uid).maybeSingle();
  const pr=r.data||{};
  const mine=photos.filter(x=>x.user_id===uid);
  const totV=mine.reduce((s,x)=>s+(x.views||0),0);
  const rk=mine.length?rankOf(mine[0]):{ic:'🌱',t:'مستكشف',c:'bronze'};
  const fo=mine.length?(mine[0].followers_count||0):0;
  $('profHead').innerHTML=`
    <div class="prof-card">
      <div class="prof-name">${esc(pr.display_name||'مصوّر')}</div>
      <span class="rankchip r-${rk.c}">${rk.ic} ${rk.t}</span>
      ${pr.region?`<div class="prof-bio">📍 ${esc(pr.region)}</div>`:''}
      ${pr.bio?`<div class="prof-bio">${esc(pr.bio)}</div>`:''}
      <div class="prof-stats">
        <div class="prof-stat"><b>${mine.length}</b><span>صورة</span></div>
        <div class="prof-stat"><b>${fo}</b><span>متابع</span></div>
        <div class="prof-stat"><b>${totV}</b><span>مشاهدة</span></div>
      </div>
      <div class="prof-badges" id="profBadges"></div>
    </div>`;
  loadUserBadges(uid).then(bs=>{
    const be=$('profBadges');if(!be)return;
    be.innerHTML=bs.map(b=>`<span class="prof-badge">${b.badge_icon||'🏆'} ${esc(b.badge_name||b.title)}</span>`).join('');
  });
  $('profFeed').innerHTML=mine.length?mine.map(p=>`
    <div class="mcard" onclick="openSheet(${p.id})">
      <img src="${thumbUrl(p.image_path)}" loading="lazy" alt="${esc(p.title)}">
      <div class="mc-overlay"><div class="mc-title">${esc(p.title)}</div></div>
    </div>`).join(''):'<div class="empty">ما نشر صوراً بعد</div>';
}
/* ====== نصيحة الطقس للمصور ====== */

async function loadWeatherTip(){
  const wel=$('weatherTip');
  if(!window.__USER_LAT){if(wel)wel.style.display='none';return;}
  const el=$('weatherTip');if(!el)return;
  try{
    const u=`https://api.open-meteo.com/v1/forecast?latitude=${window.__USER_LAT}&longitude=${window.__USER_LNG}&current=temperature_2m,weather_code,cloud_cover,is_day&daily=sunset,sunrise&timezone=auto`;
    const r=await fetch(u);
    const d=await r.json();
    const c=d.current;if(!c)return;
    const code=c.weather_code, temp=Math.round(c.temperature_2m), cloud=c.cloud_cover;
    const isDay=c.is_day===1;
    const now=new Date();
    const sunset=d.daily&&d.daily.sunset?new Date(d.daily.sunset[0]):null;
    const sunrise=d.daily&&d.daily.sunrise?new Date(d.daily.sunrise[0]):null;
    const minsToSunset=sunset?Math.round((sunset-now)/60000):null;
    const minsToSunrise=sunrise?Math.round((sunrise-now)/60000):null;

    let ic,state,adv;

    // ═══ الليل ═══
    if(!isDay){
      ic='🌙';state='ليل';
      if(cloud<30) adv='سماء صافية — فرصة لتصوير النجوم ودرب التبانة ✨';
      else if(cloud<70) adv='غيوم متفرقة — جرّب تصوير أضواء المدينة';
      else adv='سماء غائمة — التصوير الليلي صعب الليلة';
      if(code>=45&&code<=48){ic='🌫️';state='ضباب ليلي';adv='الضباب مع أضواء الشارع = لقطات غامضة جميلة';}
      if(minsToSunrise!==null&&minsToSunrise>0&&minsToSunrise<90){
        ic='🌄';state='قبل الشروق';adv='الشروق بعد '+minsToSunrise+' دقيقة — استعد للساعة الذهبية';
      }
    }
    // ═══ النهار ═══
    else {
      ic='☀️';state='صافٍ';adv='إضاءة قوية — صوّر في الظل أو انتظر الساعة الذهبية';
      if(code>=45&&code<=48){ic='🌫️';state='ضباب';adv='الضباب فرصة ذهبية للقطات دراماتيكية — اخرج الآن!';}
      else if(code>=51&&code<=67){ic='🌧️';state='مطر';adv='بعد المطر: انعكاسات وألوان مشبعة';}
      else if(code>=71&&code<=77){ic='🌨️';state='ثلج';adv='مشهد نادر — وثّقه قبل ما يذوب';}
      else if(code>=95){ic='⛈️';state='عاصفة';adv='السلامة أولاً — صوّر من مكان آمن';}
      else if(cloud>70){ic='☁️';state='غائم';adv='إضاءة ناعمة مثالية للتفاصيل والبورتريه';}
      else if(cloud>30){ic='⛅';state='غيوم متفرقة';adv='سماء درامية — وقت ممتاز للمناظر الواسعة';}

      if(minsToSunset!==null&&minsToSunset>0&&minsToSunset<90){
        ic='🌅';state='قبل الغروب';adv='الساعة الذهبية — بعد '+minsToSunset+' دقيقة أجمل ضوء لليوم';
      }
      if(temp>=42){adv='الحر شديد ('+temp+'°) — صوّر بالصباح الباكر أو قبل المغرب';}
    }

    el.style.display='flex';
    el.innerHTML=`<div class="wt-ic">${ic}</div>
      <div class="wt-txt">
        <div class="wt-now">${state} · ${temp}°</div>
        <div class="wt-adv">${adv}</div>
      </div>`;
  }catch(e){}
}
/* ====== الزيارات الميدانية ====== */
async function renderVisits(p){
  const el=$('visitBox');if(!el)return;
  if(!p.lat||!p.lng){el.style.display='none';return}
  el.style.display='block';
  el.className='visit-box';
  el.innerHTML='<div class="visit-far">⏳</div>';

  const r=await sb.from('visits').select('user_id,note,created_at,profiles!user_id(display_name)').eq('photo_id',p.id).order('created_at',{ascending:false});
  const list=r.data||[];
  const mine=USER?list.find(v=>v.user_id===USER.id):null;

  // احسب المسافة
  let near=false, dist=null;
  if(window.__USER_LAT){
    dist=Math.hypot((p.lat-window.__USER_LAT)*111000,(p.lng-window.__USER_LNG)*111000*Math.cos(p.lat*Math.PI/180));
    near=dist<=500;
  }

  let btn='';
  if(mine){
    btn=`<button class="visit-btn done" onclick="removeVisit(${p.id})">✓ زرته — إلغاء</button>`;
  } else if(near){
    btn=`<button class="visit-btn" onclick="addVisit(${p.id})">✅ زرت هذا المكان</button>`;
  } else if(dist!==null){
    btn=`<span class="visit-far">📍 تبعد ${dist>1000?(dist/1000).toFixed(1)+' كم':Math.round(dist)+' م'} — اقترب لتسجيل زيارتك</span>`;
  } else {
    btn=`<span class="visit-far">فعّل الموقع لتسجيل زيارتك</span>`;
  }

  el.innerHTML=`
    <div class="visit-head">
      <span class="visit-count">👣 ${list.length} ${list.length===1?'زائر':'زائرين'}</span>
      ${btn}
    </div>
    ${mine?`<div style="display:flex;gap:6px;margin-top:6px">
      <input id="vNote" placeholder="انطباعك عن المكان (اختياري)" value="${esc(mine.note||'')}" style="flex:1;background:var(--card2);border:1px solid var(--line);border-radius:10px;padding:8px 11px;font-family:'Tajawal';font-size:12.5px;color:var(--txt);outline:none">
      <button class="btn" style="font-size:12px;padding:7px 13px" onclick="saveVisitNote(${p.id})">حفظ</button>
    </div>`:''}
    ${list.filter(v=>v.note).map(v=>`<div class="visit-note"><b>${esc(v.profiles?.display_name||'زائر')}</b>${esc(v.note)}</div>`).join('')}`;
}

async function addVisit(pid){
  if(!USER||USER.is_anonymous){toast('سجّل أول عشان توثّق زيارتك',true);return}
  const {error}=await sb.from('visits').insert({photo_id:pid,user_id:USER.id});
  if(error){toast('تعذر التسجيل: '+error.message,true);return}
  toast('انسجّلت زيارتك 👣');
  await loadVisitCounts();render();
  renderVisits(curPhoto);
}

async function removeVisit(pid){
  await sb.from('visits').delete().eq('photo_id',pid).eq('user_id',USER.id);
  toast('انشالت الزيارة');
  await loadVisitCounts();render();
  renderVisits(curPhoto);
}

async function saveVisitNote(pid){
  const t=$('vNote').value.trim();
  const {error}=await sb.from('visits').update({note:t}).eq('photo_id',pid).eq('user_id',USER.id);
  if(error){toast('تعذر الحفظ',true);return}
  toast('انحفظ انطباعك ✅');
  renderVisits(curPhoto);
}
/* ====== عدادات الزيارات للشبكة ====== */
let VISIT_COUNTS={};
async function loadVisitCounts(){
  try{
    const r=await sb.from('visits').select('photo_id');
    VISIT_COUNTS={};
    (r.data||[]).forEach(v=>{VISIT_COUNTS[v.photo_id]=(VISIT_COUNTS[v.photo_id]||0)+1});
  }catch(e){}
}

/* ====== بطاقة المشاركة ====== */
async function shareCard(p){
  toast('نجهّز البطاقة...');
  try{
    const img=new Image();
    img.crossOrigin='anonymous';
    img.src=imgUrl(p.image_path);
    await new Promise((res,rej)=>{img.onload=res;img.onerror=rej});

    const W=1080,H=1350,ih=1110;
    const cv=document.createElement('canvas');
    cv.width=W;cv.height=H;
    const ctx=cv.getContext('2d');

    ctx.fillStyle='#F7F1E3';ctx.fillRect(0,0,W,H);

    const ratio=Math.max(W/img.width,ih/img.height);
    const dw=img.width*ratio, dh=img.height*ratio;
    ctx.save();
    ctx.beginPath();ctx.rect(0,0,W,ih);ctx.clip();
    ctx.drawImage(img,(W-dw)/2,(ih-dh)/2,dw,dh);
    ctx.restore();

    const g=ctx.createLinearGradient(0,ih-300,0,ih);
    g.addColorStop(0,'rgba(10,8,6,0)');
    g.addColorStop(1,'rgba(10,8,6,.85)');
    ctx.fillStyle=g;ctx.fillRect(0,ih-300,W,300);

    ctx.direction='rtl';
    ctx.textAlign='right';

    ctx.fillStyle='#fff';
    ctx.font='bold 58px Tajawal, sans-serif';
    ctx.fillText(String(p.title).slice(0,28),W-60,ih-110);

    ctx.fillStyle='rgba(255,255,255,.85)';
    ctx.font='36px Tajawal, sans-serif';
    const loc=p.abroad?(p.country||p.city):((p.village?p.village+' · ':'')+p.city);
    ctx.fillText(loc+'  ·  عدسة '+p.photographer,W-60,ih-50);

    const colors=['#D63A2F','#2E6FB7','#F2B33D','#2E8B57'];
    const tw=W/16;
    for(let i=0;i<16;i++){
      ctx.beginPath();
      ctx.moveTo(i*tw,ih+42);
      ctx.lineTo(i*tw+tw/2,ih+8);
      ctx.lineTo((i+1)*tw,ih+42);
      ctx.closePath();
      ctx.fillStyle=colors[i%4];ctx.fill();
      ctx.strokeStyle='#241F1C';ctx.lineWidth=2.5;ctx.stroke();
    }

    if(p.ratings_count>0){
      ctx.textAlign='right';
      ctx.fillStyle='#E8A020';
      ctx.font='bold 40px Tajawal, sans-serif';
      ctx.fillText('★ '+Number(p.avg_stars).toFixed(1),W-60,ih+108);
    }

    ctx.textAlign='center';
    ctx.fillStyle='#D63A2F';
    ctx.font='bold 52px Tajawal, sans-serif';
    ctx.fillText('صورة من بلدي',W/2,ih+168);

    ctx.fillStyle='#6B6259';
    ctx.font='30px Tajawal, sans-serif';
    ctx.fillText('عدسات أهل الديار  ·  sowra.app',W/2,ih+212);

    cv.toBlob(async function(blob){
      if(!blob){toast('تعذر إنشاء البطاقة',true);return}
      const file=new File([blob],'sowra-'+p.id+'.jpg',{type:'image/jpeg'});
      if(navigator.canShare&&navigator.canShare({files:[file]})){
        try{
          await navigator.share({files:[file],title:p.title,text:p.title+' — sowra.app'});
          return;
        }catch(e){}
      }
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download='sowra-'+p.id+'.jpg';
      a.click();
      toast('انحفظت البطاقة');
    },'image/jpeg',0.92);

  }catch(e){toast('تعذر تجهيز البطاقة',true)}
}

/* ====== مناطق قليلة التغطية ====== */
let GAP_LAYERS=[], GAPS_ON=false;

function drawCoverageGaps(){
  if(!MAP||typeof L==='undefined')return;
  GAP_LAYERS.forEach(l=>{try{MAP.removeLayer(l)}catch(e){}});
  GAP_LAYERS=[];
  if(!GAPS_ON)return;

  const LAT_MIN=16.5, LAT_MAX=32.0, LNG_MIN=34.5, LNG_MAX=55.5;
  const STEP=0.75;

  const geo=photos.filter(p=>p.lat&&p.lng&&!p.abroad);
  const filled=new Set();
  geo.forEach(p=>{
    const gy=Math.floor((p.lat-LAT_MIN)/STEP);
    const gx=Math.floor((p.lng-LNG_MIN)/STEP);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)filled.add((gy+dy)+'_'+(gx+dx));
  });

  const rows=Math.ceil((LAT_MAX-LAT_MIN)/STEP);
  const cols=Math.ceil((LNG_MAX-LNG_MIN)/STEP);
  let count=0;

  for(let y=0;y<rows;y++){
    for(let x=0;x<cols;x++){
      if(filled.has(y+'_'+x))continue;
      const clat=LAT_MIN+y*STEP+STEP/2;
      const clng=LNG_MIN+x*STEP+STEP/2;
      if(clng<36.5&&clat>28)continue;
      if(clng>51.5&&clat>26.5)continue;

      const c=L.circle([clat,clng],{
        radius:38000,
        color:'#8A7B6A',weight:1.5,dashArray:'6,6',
        fillColor:'#8A7B6A',fillOpacity:.12
      }).addTo(MAP);
      c.bindPopup('<div style="font-family:Tajawal;text-align:center;min-width:170px">'+
        '<div style="font-weight:700;font-size:14px;color:#8C2F23;margin-bottom:4px">📍 منطقة قليلة التغطية</div>'+
        '<div style="font-size:12px;color:#666;line-height:1.8">ما فيها صور بعد — كن أول من يوثّق جمالها 📸</div></div>');
      GAP_LAYERS.push(c);
      count++;
    }
  }
  if(count)toast(count+' منطقة تنتظر عدستك 📸');
}

function toggleGaps(){
  GAPS_ON=!GAPS_ON;
  const b=$('gapBtn');
  if(b){b.style.background=GAPS_ON?'#8C2F23':'#fff';b.style.color=GAPS_ON?'#fff':'#000';}
  drawCoverageGaps();
  if(!GAPS_ON)toast('اختفت المناطق الفارغة');
}

/* ====== كنوز الديرة — رحلات الاكتشاف ====== */
let QUESTS=[], QSTOPS={}, QDONE=new Set();

async function loadQuests(){
  try{
    const q=await sb.from('quests').select('*').eq('active',true).order('created_at',{ascending:false});
    QUESTS=q.data||[];
    if(!QUESTS.length)return;
    const s=await sb.from('quest_stops').select('*');
    QSTOPS={};
    (s.data||[]).forEach(x=>{(QSTOPS[x.quest_id]=QSTOPS[x.quest_id]||[]).push(x.photo_id)});
    if(USER&&!USER.is_anonymous){
      const c=await sb.from('quest_completions').select('quest_id').eq('user_id',USER.id);
      QDONE=new Set((c.data||[]).map(x=>x.quest_id));
    }
  }catch(e){}
}

async function openQuests(){
  go('quests');
  $('questList').innerHTML='<div class="loader">⏳</div>';
  await loadQuests();
  if(!QUESTS.length){
    $('questList').innerHTML='<div class="empty"><span class="big">🗺️</span>ما فيه رحلات نشطة حالياً<br>ترقّب رحلة الموسم القادم</div>';
    return;
  }
  // زياراتي
  let myVisits=new Set();
  if(USER&&!USER.is_anonymous){
    const v=await sb.from('visits').select('photo_id').eq('user_id',USER.id);
    myVisits=new Set((v.data||[]).map(x=>x.photo_id));
  }

  $('questList').innerHTML=QUESTS.map(q=>{
    const stops=QSTOPS[q.id]||[];
    const done=stops.filter(id=>myVisits.has(id)).length;
    const pct=stops.length?Math.round(done/stops.length*100):0;
    const finished=done>=stops.length&&stops.length>0;
    let left='';
    if(q.ends_at){
      const d=Math.ceil((new Date(q.ends_at)-new Date())/86400000);
      left=d>0?`باقي ${d} ${d===1?'يوم':'أيام'}`:'انتهت';
    }
    return `<div class="quest-card ${finished?'done':''}">
      <div class="q-head">
        <span class="q-badge">${q.badge_icon||'🏆'}</span>
        <div class="q-info">
          <div class="q-title">${esc(q.title)}</div>
          <div class="q-sub">${esc(q.subtitle||'')}${q.region?' · '+esc(q.region):''}</div>
        </div>
      </div>
      ${q.sponsor?`<div class="q-sponsor">برعاية <b>${esc(q.sponsor)}</b>${q.prize?` · 🎁 ${esc(q.prize)}`:''}</div>`:''}
      <div class="q-bar"><div class="q-fill" style="width:${pct}%"></div></div>
      <div class="q-meta">
        <span>${done} من ${stops.length} كنز</span>
        ${left?`<span>${left}</span>`:''}
      </div>
      ${finished?`<div class="q-win">🎉 أكملت الرحلة — شارة «${esc(q.badge_name||q.title)}» لك!</div>`:''}
      <div class="q-stops">${stops.map(id=>{
        const p=photos.find(x=>x.id===id);
        if(!p)return '';
        const got=myVisits.has(id);
        return `<div class="q-stop ${got?'got':''}" onclick="openSheet(${id})">
          <img src="${thumbUrl(p.image_path)}" loading="lazy" alt="${esc(p.title)}">
          ${got?'<div class="q-check">✓</div>':''}
          <div class="q-stop-name">${esc(p.village||p.city)}</div>
        </div>`;
      }).join('')}</div>
    </div>`;
  }).join('');

  // سجّل الإكمال تلقائياً
  QUESTS.forEach(async q=>{
    const stops=QSTOPS[q.id]||[];
    if(!stops.length||QDONE.has(q.id))return;
    const done=stops.filter(id=>myVisits.has(id)).length;
    if(done>=stops.length&&USER&&!USER.is_anonymous){
      await sb.from('quest_completions').insert({quest_id:q.id,user_id:USER.id});
      QDONE.add(q.id);
      toast('🎉 أكملت رحلة «'+q.title+'» — مبروك الشارة!');
    }
  });
}

/* شارات المستخدم بالبروفايل */
async function loadUserBadges(uid){
  try{
    const c=await sb.from('quest_completions').select('quest_id').eq('user_id',uid);
    const ids=(c.data||[]).map(x=>x.quest_id);
    if(!ids.length)return [];
    const q=await sb.from('quests').select('id,badge_icon,badge_name,title').in('id',ids);
    return q.data||[];
  }catch(e){return []}
}

/* ====== تفعيل الفيديو ====== */
function initVideoUpload(){
  const row=$('videoRow');if(!row)return;
  const sp=window.__SPDATA;
  const on=!!(sp&&sp.video_enabled);
  row.style.display=on?'flex':'none';
  if(on&&typeof initRecBtn==='function')initRecBtn();
}

/* ====== أضواء الديرة — منصة الفيديو ====== */
let REELS=[], reelObserver=null, reelsMuted=true;

async function openReels(){
  go('reels');
  const wrap=$('reelsWrap');if(!wrap)return;
  wrap.innerHTML='<div class="reels-empty"><span class="big">⏳</span></div>';
  REELS=photos.filter(p=>p.media_type==='video');
  if(!REELS.length){
    wrap.innerHTML=`<div class="reels-empty">
      <span class="big">🎬</span>
      <div style="font-size:16px;font-weight:700">ما فيه مقاطع بعد</div>
      <div style="font-size:13px;line-height:1.9;color:rgba(255,255,255,.65)">كن أول من يوثّق صوت المكان<br>اضغط الزر الأحمر وسجّل ٣٠ ثانية</div>
    </div>`;
    return;
  }
  renderReels();
}

function renderReels(){
  const wrap=$('reelsWrap');if(!wrap)return;
  wrap.innerHTML=REELS.map(p=>{
    const fx=(p.filter_key&&p.filter_key!=='none'&&typeof filterCss==='function')?filterCss(p.filter_key):'none';
    const loc=p.abroad?(p.country||p.city):((p.village?p.village+' · ':'')+p.city);
    const fav=favSet.has(p.id);
    const mine=!!(USER&&p.user_id===USER.id);
    const rk=rankOf(p);
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
        <button class="reel-act ${fav?'on':''}" onclick="reelFav(${p.id},event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          حفظ
        </button>
        <button class="reel-act" onclick="openSheet(${p.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          ${p.comments_count||0}
        </button>
        <button class="reel-act" onclick="reelShare(${p.id},event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          مشاركة
        </button>
        <button class="reel-act" onclick="openSheet(${p.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15 9 22 9.3 16.5 13.8 18.5 21 12 17 5.5 21 7.5 13.8 2 9.3 9 9"/></svg>
          ${Number(p.avg_stars).toFixed(1)}
        </button>
        ${mine?`<button class="reel-act del" onclick="reelDelete(${p.id},'${p.image_path}',event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          حذف
        </button>`:`<button class="reel-act" onclick="reelReport(${p.id},event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          إبلاغ
        </button>`}
      </div>
      <div class="reel-info">
        <div class="reel-user" onclick="reelProfile('${p.user_id}',event)">${rk.ic} ${esc(p.photographer)}</div>
        <div class="reel-title">${esc(p.title)}</div>
        <div class="reel-loc" onclick="reelToMap(${p.lat||0},${p.lng||0},event)">📍 ${esc(loc)}</div>
        ${p.music_key?`<div class="reel-music">🎵 ${esc(p.music_key)}</div>`:''}
      </div>
    </div>`;
  }).join('');
  setupReelPlayback();
}

function setupReelPlayback(){
  if(reelObserver)reelObserver.disconnect();
  const vids=document.querySelectorAll('#reelsWrap video');
  reelObserver=new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      const v=en.target;
      if(en.isIntersecting&&en.intersectionRatio>0.6){
        v.muted=reelsMuted;
        v.play().catch(()=>{});
        const pid=v.closest('.reel')?.dataset.id;
        if(pid&&!seenViews.has(+pid)){
          seenViews.add(+pid);
          try{sb.rpc('bump_view',{pid:+pid}).then(()=>{},()=>{})}catch(e){}
        }
      }else{
        try{v.pause()}catch(e){}
      }
    });
  },{threshold:[0,0.6,1]});
  vids.forEach(v=>{
    reelObserver.observe(v);
    v.addEventListener('click',()=>{v.paused?v.play().catch(()=>{}):v.pause()});
    v.addEventListener('timeupdate',()=>{
      const reel=v.closest('.reel');if(!reel)return;
      const fill=reel.querySelector('.reel-prog-fill');
      const tm=reel.querySelector('.reel-time');
      const d=v.duration||0;
      if(d>0){
        const left=Math.max(0,d-v.currentTime);
        if(fill)fill.style.width=(v.currentTime/d*100)+'%';
        if(tm)tm.textContent='0:'+String(Math.ceil(left)).padStart(2,'0');
      }
    });
  });
  // شغّل الأول فوراً
  if(vids[0]){vids[0].muted=reelsMuted;vids[0].play().catch(()=>{})}
}

function toggleReelMute(e){
  e.stopPropagation();
  reelsMuted=!reelsMuted;
  document.querySelectorAll('#reelsWrap video').forEach(v=>v.muted=reelsMuted);
  document.querySelectorAll('.reel-mute').forEach(b=>b.textContent=reelsMuted?'🔇':'🔊');
  toast(reelsMuted?'الصوت مكتوم':'الصوت شغّال 🔊');
}

async function reelFav(pid,e){
  e.stopPropagation();
  await toggleFav(pid);
  const btn=e.currentTarget;
  if(btn)btn.classList.toggle('on',favSet.has(pid));
}

function reelShare(pid,e){
  e.stopPropagation();
  const p=photos.find(x=>x.id===pid);
  if(!p)return;
  const url='https://sowra.app';
  if(navigator.share){
    navigator.share({title:p.title,text:p.title+' — من عدسات أهل الديار 📍'+(p.village||p.city),url}).catch(()=>{});
  }else{
    try{navigator.clipboard.writeText(url);toast('انسخ الرابط ✅')}catch(err){}
  }
}

function reelToMap(lat,lng,e){
  e.stopPropagation();
  if(!lat||!lng){toast('ما فيه موقع مسجّل لهذا المقطع',true);return}
  window.open('https://maps.google.com/?q='+lat+','+lng,'_blank');
}

function reelsRecord(){
  if(typeof recSupported==='function'&&recSupported()){
    if(typeof recOpen==='function')recOpen();
  }else{
    toast('جهازك ما يدعم التسجيل — استخدم صفحة النشر',true);
    go('add');
  }
}

function stopAllReels(){
  try{
    if(reelObserver){reelObserver.disconnect();reelObserver=null}
    document.querySelectorAll('#reelsWrap video').forEach(v=>{try{v.pause()}catch(e){}});
  }catch(e){}
}

/* ====== إجراءات الأضواء ====== */
function reelProfile(uid,e){
  e.stopPropagation();
  stopAllReels();
  openProfile(uid);
}

async function reelDelete(pid,path,e){
  e.stopPropagation();
  if(!confirm('حذف المقطع نهائياً؟ لا يمكن التراجع.'))return;
  try{await sb.storage.from('videos').remove([path])}catch(err){}
  const {error}=await sb.from('photos').delete().eq('id',pid).eq('user_id',USER.id);
  if(error){toast('تعذر الحذف: '+error.message,true);return}
  toast('انحذف المقطع ✅');
  await loadPhotos();
  REELS=photos.filter(x=>x.media_type==='video');
  if(REELS.length)renderReels();
  else openReels();
}

async function reelReport(pid,e){
  e.stopPropagation();
  if(!confirm('إبلاغ عن هذا المقطع؟'))return;
  try{
    const {error}=await sb.from('reports').insert({photo_id:pid});
    if(error)throw error;
    toast('وصل بلاغك — شكراً 🚩');
  }catch(err){toast('تعذر الإبلاغ',true)}
}
