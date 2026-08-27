/* صورة من بلدي — upload.js | نسخة المختبر م1 */
/* ============ الإضافة ============ */
let pendingFile=null,pendingGeo=null,pendingBlob=null,isAbroad=false,pendingVideo=null,pendingVis='public';
/* ====== مستوى الظهور ====== */
function setVis(v){
  pendingVis=v;
  const pb=$('visPublic'), pv=$('visPrivate');
  if(pb)pb.classList.toggle('on',v==='public');
  if(pv)pv.classList.toggle('on',v==='private');
  const b=$('pubBtn');
  if(b){
    const isV=!!pendingVideo;
    b.textContent = v==='private'
      ? (isV?'🔒 احفظ بخزنتي':'🔒 احفظ بخزنتي')
      : (isV?'انشر المقطع 🎬':'انشر الصورة 🚀');
  }
}

window.setVis=setVis;

function setDest(abroad){
  isAbroad=abroad;
  $('destHome').classList.toggle('on-dest',!abroad);
  $('destAbroad').classList.toggle('on-dest',abroad);
  $('abroadForm').style.display=abroad?'block':'none';
  $('grpRegion').style.display=abroad?'none':'block';
  $('grpCity').style.display=abroad?'none':'block';
  $('grpVillage').style.display=abroad?'none':'block';
}
function applyGeo(pos,source){
  const card=$('geoCard');card.style.display='block';
  if(!pos){
    card.classList.add('warn');
    $('geoStatus').textContent=source==='live'
      ?'⚠️ ما قدرنا نوصل لموقعك — تأكد أن الموقع مفعّل'
      :'⚠️ الصورة ما تحتوي معلومات موقع — حدد الموقع يدوياً';
    $('geoCoords').textContent='';
    return;
  }
  card.classList.remove('warn');
  pendingGeo={lat:pos.lat,lng:pos.lng};
  if(isAbroad){
    $('geoStatus').textContent='📡 تم التقاط إحداثيات موقعك'+(pos.acc?` · دقة ±${pos.acc}م`:'');
    $('geoCoords').textContent=`${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
    return;
  }
  const n=nearestCity(pos.lat,pos.lng);
  $('aRegion').value=n.region;fillAddCities();$('aCity').value=n.city;
  $('geoStatus').textContent=`📡 تم تحديد الموقع تلقائياً: قرب ${n.city} (≈${n.km} كم)`+(pos.acc?` · دقة ±${pos.acc}م`:'');
  $('geoCoords').textContent=`${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
}
async function pickImg(inp,isLive){
  const f=inp.files[0];if(!f)return;
  pendingGeo=null;pendingFile=f;pendingBlob=null;pendingVideo=null;
  // إخفاء أي فيديو معلّق
  const _pv=$('videoPreview');
  if(_pv){try{_pv.pause()}catch(e){} _pv.removeAttribute('src'); _pv.load&&_pv.load(); _pv.style.display='none';}
  // معاينة فورية خفيفة (بدون قراءة الملف كاملاً)
  $('drop').style.display='block';
  $('preview').src=URL.createObjectURL(f);$('preview').style.display='block';
  $('dropTxt').textContent='✓ تم اختيار الصورة';
  $('drop').classList.add('has');
  showClearBtn();syncPublishBtn();
  curFilter='none';
  try{ renderFilterRow(URL.createObjectURL(f),false); }catch(e){}
  // ضغط بالخلفية من الحين — عشان النشر يكون لحظي
  compress(f).then(b=>{pendingBlob=b});
  $('geoCard').style.display='block';$('geoCard').classList.remove('warn');
  $('geoStatus').textContent='⏳ جاري تحديد الموقع...';$('geoCoords').textContent='';
  if(isLive){
    let pos=await liveLocation();
    if(!pos)pos=await readExifGPS(f);
    applyGeo(pos,'live');
  }else{
    let pos=await readExifGPS(f);
    applyGeo(pos,pos?'exif':'exif');
  }
  // بيانات الكاميرا
  window.__exifTech=await readExifTech(f);
  renderTechCard();
  inp.value='';
}

/* ====== بطاقة بيانات الكاميرا ====== */
function renderTechCard(){
  const el=$('techCard');if(!el)return;
  const t=window.__exifTech;
  if(!t){el.style.display='none';return}
  el.style.display='block';
  const bits=[];
  if(t.camera)bits.push('<span class="tc-cam">📷 '+esc(t.camera)+'</span>');
  if(t.lens)bits.push('<span class="tc-cam">🔭 '+esc(t.lens)+'</span>');
  const set=[t.focal,t.aperture,t.shutter,t.iso].filter(Boolean);
  el.innerHTML=`
    <div class="tc-head">
      <span>⚙️ بيانات التصوير</span>
      <label class="tc-sw"><input type="checkbox" id="techShow" checked><span>أظهرها مع الصورة</span></label>
    </div>
    <div class="tc-body">
      ${bits.join('')}
      ${set.length?'<div class="tc-set">'+set.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>':''}
    </div>`;
}

/* ====== اختيار فيديو ====== */
async function pickVideo(inp){
  const f=inp.files[0];if(!f)return;
  const MAXMB=25, MAXSEC=30;
  if(f.size>MAXMB*1024*1024){toast('الفيديو كبير — الحد '+MAXMB+' ميجا',true);inp.value='';return}
  // فحص المدة
  const dur=await new Promise(res=>{
    const v=document.createElement('video');
    v.preload='metadata';
    v.onloadedmetadata=()=>{URL.revokeObjectURL(v.src);res(v.duration||0)};
    v.onerror=()=>res(0);
    v.src=URL.createObjectURL(f);
  });
  if(dur>MAXSEC+1){
    toast('الفيديو طويل ('+Math.round(dur)+' ثانية) — الحد '+MAXSEC+' ثانية',true);
    inp.value='';return;
  }
  pendingFile=null;pendingBlob=null;pendingGeo=null;pendingVideo=f;
  $('drop').style.display='block';
  const _im=$('preview');
  if(_im){_im.removeAttribute('src');_im.style.display='none';}
  const pv=$('videoPreview');
  if(pv){pv.src=URL.createObjectURL(f);pv.style.display='block';}
  $('dropTxt').textContent='🎬 تم اختيار الفيديو ('+Math.round(f.size/1048576)+' ميجا)';
  $('drop').classList.add('has');
  showClearBtn();syncPublishBtn();
  curFilter='none';
  const _fu=pv?pv.src:URL.createObjectURL(f);
  try{ renderFilterRow(null,true,_fu); }catch(e){}
  captureVideoFrame(f).then(t=>{if(t)renderFilterRow(t,true)}).catch(()=>{});
  $('geoCard').style.display='block';$('geoCard').classList.remove('warn');
  $('geoStatus').textContent='⏳ جاري تحديد الموقع...';$('geoCoords').textContent='';
  const pos=await liveLocation();
  applyGeo(pos,'live');
  inp.value='';
}

/* ضغط الصورة قبل الرفع (أقصى عرض 1600px) */
function compressTo(file,maxW,quality){
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const scale=Math.min(1,maxW/Math.max(img.width,img.height));
      const cv=document.createElement('canvas');
      cv.width=Math.round(img.width*scale);cv.height=Math.round(img.height*scale);
      const ctx=cv.getContext('2d');
      // حرق الفلتر المختار على الصورة
      if(typeof curFilter!=='undefined'&&curFilter!=='none'){
        try{ctx.filter=filterCss(curFilter)}catch(e){}
      }
      ctx.drawImage(img,0,0,cv.width,cv.height);
      ctx.filter='none';
      // ختم المنصة المحفور
      const fsz=Math.max(11,Math.round(cv.width*0.03));
      ctx.font='bold '+fsz+'px Tajawal, Arial, sans-serif';
      ctx.textBaseline='bottom';ctx.textAlign='left';
      const pad=Math.round(fsz*0.7);
      ctx.lineWidth=Math.max(2,fsz*0.14);ctx.lineJoin='round';
      ctx.strokeStyle='rgba(36,31,28,.55)';ctx.fillStyle='rgba(255,255,255,.88)';
      ctx.strokeText('sowra.app',pad,cv.height-pad);
      ctx.fillText('sowra.app',pad,cv.height-pad);
      cv.toBlob(b=>resolve(b||file),'image/jpeg',quality);
    };
    img.onerror=()=>resolve(file);
    img.src=URL.createObjectURL(file);
  });
}
function compress(file){return compressTo(file,1280,0.8)}
const thumbPath=p=>p.replace(/\.jpg$/,'_t.jpg');
function thumbUrl(p){return imgUrl(thumbPath(p))}

async function addPhoto(){
  if(!USER || USER.is_anonymous){toast('سجّل أول عشان تنشر 📸');openAcc();return}
  const title=$('aTitle').value.trim();
  let region=$('aRegion').value,city=$('aCity').value,country='';
  if(isAbroad){
    country=$('aCountry').value.trim();
    if(country.length<2){toast('اكتب الدولة والمدينة 🌍',true);return}
    region='عدسة مسافر';city=country;
  }
  if(!pendingFile&&!pendingVideo)return toast('اختر صورة أو فيديو أول ⚠️',true);
  // فحص النصوص وحد المعدّل
  if(typeof checkText==='function'){
    const bt=checkText($('aTitle').value);
    if(bt){toast('العنوان: '+bt,true);return}
    const bd=$('aDesc')?checkText($('aDesc').value,{allowLink:true}):null;
    if(bd){toast('الوصف: '+bd,true);return}
    const bv=checkText($('aVillage')?$('aVillage').value:'');
    if(bv){toast('اسم القرية: '+bv,true);return}
  }
  if(typeof checkRate==='function'){
    const lim=await checkRate('photo');
    if(lim){toast(lim,true);return}
  }
  if(!title)return toast('اكتب عنوان للصورة ⚠️',true);
  if(title.length<2)return toast('العنوان قصير — حرفان على الأقل ✏️',true);
  if(title.length>100)return toast('العنوان طويل — 100 حرف كحد أقصى ✏️',true);
  if(!isAbroad&&(!region||!city))return toast('حدد المنطقة والمدينة ⚠️',true);
  const btn=$('pubBtn');btn.disabled=true;btn.textContent='⏳ جاري الرفع...';
  try{
    // ═══ مسار الفيديو ═══
    if(pendingVideo){
      const vpath=`${USER.id}/${Date.now()}.mp4`;
      const upv=await sb.storage.from('videos').upload(vpath,pendingVideo,{contentType:pendingVideo.type||'video/mp4',cacheControl:'31536000'});
      if(upv.error)throw upv.error;
      const insv=await sb.from('photos').insert({
        user_id:USER.id,title,region,city,category:$('aCat').value||'other',
        abroad:isAbroad,country,
        village:isAbroad?'':$('aVillage').value.trim(),
        lat:pendingGeo?.lat??null,lng:pendingGeo?.lng??null,
        image_path:vpath,media_type:'video',filter_key:curFilter,music_key:(pendingMusicName||''),visibility:pendingVis,description:'',commercial:!!($('aComm')&&$('aComm').checked),tags:(window.__pickedTags||[]),exif:((document.getElementById('techShow')&&document.getElementById('techShow').checked&&window.__exifTech)?window.__exifTech:{})
      });
      if(insv.error){
        await sb.storage.from('videos').remove([vpath]).catch(()=>{});
        throw insv.error;
      }
      if(pendingVis==='public'){
        try{
          const nm2=(await sb.from('profiles').select('display_name').eq('id',USER.id).maybeSingle()).data?.display_name||'مصوّر';
          pushNotify({
            title:'🎬 مقطع جديد في الأضواء',
            body:title+' — عدسة '+nm2,
            url:'/',
            exclude:USER.id
          });
        }catch(e){}
      }
      pendingVideo=null;resetFilter();pendingVis='public';setVis('public');const _c1=$('clearDraft');if(_c1)_c1.style.display='none';
      const pv=$('videoPreview');if(pv){pv.src='';pv.style.display='none';}
      $('drop').style.display='none';$('geoCard').style.display='none';
      $('aTitle').value='';$('aVillage').value='';if($('aDesc')){$('aDesc').value='';descCount();}if($('aComm'))$('aComm').checked=false;resetTranslation();window.__pickedTags=[];renderTagRow();window.__exifTech=null;renderTechCard();
      if(typeof logRate==='function')logRate('photo');
      toast('انرفع الفيديو 🎬');
      try{sortMode='new';_sort='new';}catch(e){}
      if(typeof maybeAskNotifs==='function')maybeAskNotifs();
    setTimeout(function(){if(typeof checkRaceProgress==='function')checkRaceProgress()},3000);
    await loadPhotos();go('feed');
      btn.disabled=false;btn.textContent=(pendingVideo?'انشر المقطع 🎬':'انشر الصورة 🚀');
      return;
    }
    const blob=pendingBlob||await compress(pendingFile);
    // الفاحص الذكي
    if(typeof INSPECT_ON!=='undefined'&&INSPECT_ON&&typeof runInspection==='function'){
      const ok=await runInspection(blob);
      if(!ok){btn.disabled=false;btn.textContent=(pendingVis==='private'?'🔒 احفظ بخزنتي':'انشر الصورة 🚀');return}
    }
    const thumb=await compressTo(pendingFile,420,0.7);
    const path=`${USER.id}/${Date.now()}.jpg`;
    const [up,upT]=await Promise.all([
      sb.storage.from('photos').upload(path,blob,{contentType:'image/jpeg',cacheControl:'31536000'}),
      sb.storage.from('photos').upload(thumbPath(path),thumb,{contentType:'image/jpeg',cacheControl:'31536000'})
    ]);
    if(up.error)throw up.error;
    const ins=await sb.from('photos').insert({
      user_id:USER.id,title,region,city,category:$('aCat').value||'other',
      abroad:isAbroad,country,
      village:isAbroad?'':$('aVillage').value.trim(),
      lat:pendingGeo?.lat??null,lng:pendingGeo?.lng??null,
      image_path:path,visibility:pendingVis,description:($('aDesc')?$('aDesc').value.trim():''),commercial:!!($('aComm')&&$('aComm').checked),title_en:trTitle,description_en:trDesc,tags:(window.__pickedTags||[]),exif:((document.getElementById('techShow')&&document.getElementById('techShow').checked&&window.__exifTech)?window.__exifTech:{})
    }).select('id').maybeSingle();
    if(ins.error){
      // فشل التسجيل — ننظف ملفات الصورة من المخزن حتى لا تبقى يتيمة
      await sb.storage.from('photos').remove([path,thumbPath(path)]).catch(()=>{});
      throw ins.error;
    }
    // السبق على الموقع إن سُجّل
    try{
      const cp=$('clPlace'), cr=$('clReason');
      if(cp&&cr&&cp.value.trim()&&cr.value.trim()&&ins.data&&ins.data.id
          &&!(typeof checkText==='function'&&(checkText(cp.value)||checkText(cr.value)))){
        const cl=await sb.from('claims').insert({
          photo_id:ins.data.id,user_id:USER.id,
          place_name:cp.value.trim(),reason:cr.value.trim(),
          lat:pendingGeo?.lat??null,lng:pendingGeo?.lng??null
        });
        if(!cl.error){cp.value='';cr.value='';setTimeout(()=>toast('انسجّل سبقك 🏅'),1800);}
      }
    }catch(e){}
    // إشعار للجميع عند نشر صورة عامة
    if(pendingVis==='public'){
      try{
        const nm=(await sb.from('profiles').select('display_name').eq('id',USER.id).maybeSingle()).data?.display_name||'مصوّر';
        pushNotify({
          title:'📸 صورة جديدة من '+(city||region),
          body:title+' — عدسة '+nm,
          url:'/',
          exclude:USER.id
        });
      }catch(e){}
    }
    pendingFile=null;pendingGeo=null;pendingBlob=null;resetFilter();pendingVis='public';setVis('public');const _c2=$('clearDraft');if(_c2)_c2.style.display='none';
    $('preview').style.display='none';$('drop').style.display='none';$('geoCard').style.display='none';
    $('aTitle').value='';$('aVillage').value='';if($('aDesc')){$('aDesc').value='';descCount();}if($('aComm'))$('aComm').checked=false;resetTranslation();window.__pickedTags=[];renderTagRow();window.__exifTech=null;renderTechCard();
    if(typeof logRate==='function')logRate('photo');
    toast(pendingVis==='private'?'انحفظت بخزنتك 🔒':'نُشرت صورتك 🎉');
    const wasAbroad=isAbroad;
    $('aCountry').value='';
    try{sortMode=wasAbroad?'abroad':'new';_sort=sortMode;}catch(e){}
    if(typeof maybeAskNotifs==='function')maybeAskNotifs();
    setTimeout(function(){if(typeof checkRaceProgress==='function')checkRaceProgress()},3000);
    await loadPhotos();go('feed');
  }catch(e){
    if(e.message&&e.message.includes('row-level')){
      // نسأل القاعدة عن السبب الحقيقي
      const [ban,lim]=await Promise.all([sb.rpc('am_i_banned'),sb.rpc('my_uploads_today')]);
      if(ban.data===true)toast('حسابك محظور من النشر — راسل الإدارة من صفحة حسابي ⛔',true);
      else if((lim.data??0)>=10)toast('وصلت حد النشر اليومي (10 صور) — كمّل بكرة 🌙',true);
      else toast('تعذر النشر — تأكد أنك مسجل دخول',true);
    }else if(e.message&&e.message.includes('check constraint')){
      toast('تأكد من البيانات: العنوان 2–100 حرف ✏️',true);
    }else toast('تعذر النشر: '+(e.message||''),true);
  }finally{
    btn.disabled=false;btn.textContent='انشر الصورة 🚀';
  }
}

/* ====== كاميرا التسجيل الداخلية ====== */
let recStream=null, recorder=null, recChunks=[], recTimer=null, recStart=0, recFacing='environment', pendingMusicName='';
const REC_MAX=30;

function recSupported(){
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
}

function initRecBtn(){
  const b=$('recOpenBtn');
  if(b)b.style.display=recSupported()?'flex':'none';
}

async function recOpen(){
  if(!recSupported()){toast('جهازك ما يدعم التسجيل الداخلي — استخدم المعرض',true);return}
  try{
    recStream=await navigator.mediaDevices.getUserMedia({
      video:{facingMode:recFacing,width:{ideal:1280},height:{ideal:720}},
      audio:true
    });
  }catch(e){toast('تعذر فتح الكاميرا — تأكد من الإذن',true);return}
  const pv=$('recPreview');
  pv.srcObject=recStream;
  $('recScreen').classList.add('on');
  document.body.style.overflow='hidden';
  $('recFill').style.width='0%';
  $('recTimer').textContent='00:00';
  $('recTimer').classList.remove('live');
  $('recHint').textContent='اضغط مطولاً للتسجيل';
  pickedMusic=null;ownMusicFile=null;recFilter='none';
  const pv2=$('recPreview');
  if(pv2){pv2.style.filter='none';pv2.style.webkitFilter='none';}
  loadMusicList().then(renderMusicChips);
  renderRecFilters();
  initTapFocus();
  bindRecBtn();
}

function recClose(){
  recStop(true);
  stopMusicPreview();stopMixer();
  ownMusicFile=null;
  if(recStream){recStream.getTracks().forEach(t=>t.stop());recStream=null}
  $('recScreen').classList.remove('on');
  document.body.style.overflow='';
}

async function recFlip(){
  recFacing = recFacing==='environment' ? 'user' : 'environment';
  if(recStream)recStream.getTracks().forEach(t=>t.stop());
  try{
    recStream=await navigator.mediaDevices.getUserMedia({
      video:{facingMode:recFacing,width:{ideal:1280},height:{ideal:720}},audio:true
    });
    $('recPreview').srcObject=recStream;
  }catch(e){toast('تعذر تبديل الكاميرا',true)}
}

function pickMime(){
  const opts=['video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
  for(const m of opts){if(MediaRecorder.isTypeSupported(m))return m}
  return '';
}

function buzz(ms){try{if(navigator.vibrate)navigator.vibrate(ms)}catch(e){}}

async function recCountdown(){
  const el=$('recCount');if(!el)return;
  el.classList.add('on');
  for(let n=3;n>=1;n--){
    el.textContent=n;
    buzz(30);
    await new Promise(r=>setTimeout(r,700));
  }
  el.classList.remove('on');
  el.textContent='';
}

async function recBegin(){
  if(!recStream||recorder)return;
  recChunks=[];
  stopMusicPreview();
  await recCountdown();
  if(!recStream)return;
  const mime=pickMime();
  let target=recStream;
  try{ target=await buildMixedStream(recStream); }catch(e){}
  try{
    recorder=mime?new MediaRecorder(target,{mimeType:mime,videoBitsPerSecond:2500000})
                 :new MediaRecorder(target);
  }catch(e){toast('تعذر بدء التسجيل',true);stopMixer();return}
  recorder.ondataavailable=e=>{if(e.data&&e.data.size)recChunks.push(e.data)};
  recorder.onstop=recFinish;
  recorder.start(200);
  buzz(60);
  recStart=Date.now();
  $('recBtn').classList.add('recording');
  $('recTimer').classList.add('live');
  $('recHint').textContent='ارفع إصبعك للإيقاف';
  recTimer=setInterval(()=>{
    const s=(Date.now()-recStart)/1000;
    const pct=Math.min(100,s/REC_MAX*100);
    $('recFill').style.width=pct+'%';
    const mm=String(Math.floor(s/60)).padStart(2,'0');
    const ss=String(Math.floor(s%60)).padStart(2,'0');
    $('recTimer').textContent=mm+':'+ss;
    if(s>=REC_MAX)recStop();
  },100);
}

function recStop(silent){
  if(recTimer){clearInterval(recTimer);recTimer=null;if(!silent)buzz([40,40,40]);}
  stopMixer();
  $('recBtn').classList.remove('recording');
  $('recTimer').classList.remove('live');
  $('recHint').textContent='اضغط مطولاً للتسجيل';
  if(recorder&&recorder.state!=='inactive'){
    if(silent)recorder.onstop=null;
    recorder.stop();
  }
  if(silent)recorder=null;
}

async function recFinish(){
  const secs=(Date.now()-recStart)/1000;
  recorder=null;
  if(secs<1.2){toast('التسجيل قصير جداً — ثانية على الأقل',true);recChunks=[];return}
  const type=recChunks[0]?.type||'video/mp4';
  const ext=type.includes('mp4')?'mp4':'webm';
  const blob=new Blob(recChunks,{type});
  recChunks=[];
  if(blob.size>25*1024*1024){toast('الفيديو كبير — سجّل مدة أقصر',true);return}

  pendingMusicName=pickedMusic?pickedMusic.name:'';
  if(recFilter&&recFilter!=='none')curFilter=recFilter;
  pendingVideo=new File([blob],'rec.'+ext,{type});
  pendingFile=null;pendingBlob=null;

  recClose();
  go('add');
  $('drop').style.display='block';
  const _im2=$('preview');
  if(_im2){_im2.removeAttribute('src');_im2.style.display='none';}
  const pv=$('videoPreview');
  if(pv){pv.src=URL.createObjectURL(blob);pv.style.display='block';}
  $('dropTxt').textContent='🎬 تسجيل جاهز ('+Math.round(secs)+' ثانية)';
  $('drop').classList.add('has');
  showClearBtn();syncPublishBtn();
  curFilter='none';
  const _vurl=pv?pv.src:URL.createObjectURL(pendingVideo);
  try{ renderFilterRow(null,true,_vurl); }catch(e){}
  captureVideoFrame(pendingVideo).then(t=>{if(t)renderFilterRow(t,true)}).catch(()=>{});
  $('geoCard').style.display='block';$('geoCard').classList.remove('warn');
  $('geoStatus').textContent='⏳ جاري تحديد الموقع...';$('geoCoords').textContent='';
  const pos=await liveLocation();
  applyGeo(pos,'live');
  toast('انتهى التسجيل — أضف العنوان وانشر 🎬');
}

function bindRecBtn(){
  const b=$('recBtn');
  if(!b||b._bound)return;
  b._bound=true;
  const down=e=>{
    if(e.target!==b&&!b.contains(e.target))return;
    e.preventDefault();recBegin().catch(()=>{});
  };
  const up=e=>{e.preventDefault();if(recorder)recStop()};
  b.addEventListener('touchstart',down,{passive:false});
  b.addEventListener('touchend',up,{passive:false});
  b.addEventListener('touchcancel',up,{passive:false});
  b.addEventListener('mousedown',down);
  b.addEventListener('mouseup',up);
  b.addEventListener('mouseleave',up);
}

/* ====== فلاتر بهوية سعودية ====== */
const FILTERS=[
  {k:'none',   n:'الأصلي',        css:'none'},
  {k:'sunset', n:'غروب السودة',   css:'saturate(1.45) contrast(1.12) sepia(.18) hue-rotate(-8deg) brightness(1.04)'},
  {k:'mist',   n:'ضباب أبها',     css:'saturate(.78) contrast(.94) brightness(1.12) hue-rotate(6deg)'},
  {k:'sand',   n:'رمال الصمان',   css:'sepia(.34) saturate(1.28) contrast(1.15) brightness(1.05)'},
  {k:'night',  n:'ليل نجد',       css:'saturate(1.18) contrast(1.3) brightness(.86) hue-rotate(200deg) saturate(1.1)'},
  {k:'qatt',   n:'قط عسيري',      css:'saturate(1.85) contrast(1.22) brightness(1.03)'},
  {k:'clay',   n:'طين نجران',     css:'sepia(.42) saturate(1.35) contrast(1.1) hue-rotate(-12deg)'},
  {k:'sea',    n:'بحر جدة',       css:'saturate(1.35) hue-rotate(12deg) brightness(1.07) contrast(1.08)'},
  {k:'palm',   n:'نخيل القصيم',   css:'saturate(1.4) hue-rotate(-10deg) contrast(1.12) brightness(1.02)'},
  {k:'memory', n:'ذاكرة',         css:'sepia(.62) saturate(.85) contrast(1.06) brightness(1.05)'},
  {k:'coal',   n:'فحم',           css:'grayscale(1) contrast(1.32) brightness(1.04)'},
  {k:'clear',  n:'صحو',           css:'contrast(1.28) saturate(1.15) brightness(1.06)'}
];
let curFilter='none';

function filterCss(k){
  const f=FILTERS.find(x=>x.k===k);
  return f?f.css:'none';
}

function renderFilterRow(srcUrl,isVideo,videoBlobUrl){
  try{
    const row=document.getElementById('filterRow');
    if(!row)return;
    if(!srcUrl&&!videoBlobUrl)return;
    row.innerHTML='';
    row.style.display='flex';
    for(let i=0;i<FILTERS.length;i++){
      const f=FILTERS[i];
      const item=document.createElement('div');
      item.className='f-item'+(curFilter===f.k?' on':'');
      item.setAttribute('data-k',f.k);
      const thumb=document.createElement('div');
      thumb.className='f-thumb';
      thumb.style.filter=f.css;
      thumb.style.webkitFilter=f.css;
      if(srcUrl){
        thumb.style.backgroundImage='url("'+srcUrl+'")';
        thumb.style.backgroundSize='cover';
        thumb.style.backgroundPosition='center';
      }else{
        const v=document.createElement('video');
        v.src=videoBlobUrl;v.muted=true;v.playsInline=true;
        v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');
        v.preload='metadata';
        v.style.cssText='width:100%;height:100%;object-fit:cover;display:block';
        thumb.appendChild(v);
      }
      const name=document.createElement('div');
      name.className='f-name';
      name.textContent=f.n;
      item.appendChild(thumb);
      item.appendChild(name);
      item.onclick=(function(key){return function(){pickFilter(key)}})(f.k);
      row.appendChild(item);
    }
    applyFilterPreview();
  }catch(e){}
}

function pickFilter(k){
  try{
    curFilter=k;
    const items=document.querySelectorAll('#filterRow .f-item');
    for(let i=0;i<items.length;i++){
      items[i].classList.toggle('on',items[i].getAttribute('data-k')===k);
    }
    applyFilterPreview();
  }catch(e){}
}

function applyFilterPreview(){
  try{
    const css=filterCss(curFilter);
    const im=document.getElementById('preview'), vd=document.getElementById('videoPreview');
    if(im){im.style.filter=css;im.style.webkitFilter=css;}
    if(vd){vd.style.filter=css;vd.style.webkitFilter=css;}
  }catch(e){}
}

function resetFilter(){
  try{
  curFilter='none';
  const row=$('filterRow');if(row){row.style.display='none';row.innerHTML=''}
  const im=$('preview'), vd=$('videoPreview');
  if(im){im.style.filter='none';im.style.webkitFilter='none';}
  if(vd){vd.style.filter='none';vd.style.webkitFilter='none';}
  }catch(e){}
}

/* حرق الفلتر على الصورة عند الضغط */
function bakeFilter(ctx,w,h){
  if(curFilter==='none')return;
  ctx.filter=filterCss(curFilter);
}

/* التقاط إطار من الفيديو لمعاينة الفلاتر */
function captureVideoFrame(file){
  return new Promise(res=>{
    try{
      const v=document.createElement('video');
      v.preload='metadata';v.muted=true;v.playsInline=true;
      v.onloadeddata=()=>{
        try{
          v.currentTime=Math.min(0.6,(v.duration||1)/3);
        }catch(e){res(null)}
      };
      v.onseeked=()=>{
        try{
          const cv=document.createElement('canvas');
          const s=Math.min(1,160/Math.max(v.videoWidth,v.videoHeight));
          cv.width=Math.round(v.videoWidth*s);cv.height=Math.round(v.videoHeight*s);
          cv.getContext('2d').drawImage(v,0,0,cv.width,cv.height);
          URL.revokeObjectURL(v.src);
          res(cv.toDataURL('image/jpeg',0.7));
        }catch(e){res(null)}
      };
      v.onerror=()=>res(null);
      v.src=URL.createObjectURL(file);
    }catch(e){res(null)}
  });
}

/* مصغّرة dataURL للمعاينة (أضمن على iOS من blob URL) */
function makeThumbDataUrl(file){
  return new Promise(res=>{
    try{
      const img=new Image();
      img.onload=()=>{
        try{
          const s=Math.min(1,160/Math.max(img.width,img.height));
          const cv=document.createElement('canvas');
          cv.width=Math.max(1,Math.round(img.width*s));
          cv.height=Math.max(1,Math.round(img.height*s));
          cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
          URL.revokeObjectURL(img.src);
          res(cv.toDataURL('image/jpeg',0.72));
        }catch(e){res(null)}
      };
      img.onerror=()=>res(null);
      img.src=URL.createObjectURL(file);
    }catch(e){res(null)}
  });
}

/* ====== إلغاء المسودة ====== */
function clearDraft(){
  try{
    const _is=$('inspectStatus');if(_is)_is.style.display='none';
    setTimeout(syncPublishBtn,0);
    pendingFile=null;pendingBlob=null;pendingVideo=null;pendingGeo=null;
    const im=$('preview');
    if(im){im.removeAttribute('src');im.style.display='none';}
    const vd=$('videoPreview');
    if(vd){try{vd.pause()}catch(e){} vd.removeAttribute('src'); vd.load&&vd.load(); vd.style.display='none';}
    resetFilter();
    $('drop').style.display='none';
    $('drop').classList.remove('has');
    $('geoCard').style.display='none';
    const cd=$('clearDraft');if(cd)cd.style.display='none';
    toast('انلغت المسودة');
  }catch(e){}
}
function showClearBtn(){
  const cd=$('clearDraft');
  if(cd)cd.style.display='block';
}

/* ====== موسيقى التسجيل — دمج حقيقي بالملف ====== */
let MUSIC_LIST=[], pickedMusic=null, musicAudio=null, audioCtx=null;

async function loadMusicList(){
  try{
    const r=await sb.from('music').select('*').eq('active',true).order('created_at');
    MUSIC_LIST=r.data||[];
  }catch(e){MUSIC_LIST=[]}
}

function musicUrl(path){return sb.storage.from('music').getPublicUrl(path).data.publicUrl}

function renderMusicChips(){
  const el=$('recMusic');if(!el)return;
  el.style.display='flex';
  el.innerHTML='';
  // زر رفع موسيقى من الجهاز
  const own=document.createElement('button');
  own.className='m-chip own'+(pickedMusic&&pickedMusic._local?' on':'');
  own.textContent=pickedMusic&&pickedMusic._local?('🎵 '+pickedMusic.name.slice(0,14)):'➕ موسيقاي';
  const openOwn=function(ev){
    if(ev){ev.preventDefault();ev.stopPropagation();}
    $('recMusicFile').click();
  };
  own.addEventListener('touchend',openOwn,{passive:false});
  own.addEventListener('click',openOwn);
  el.appendChild(own);
  const none=document.createElement('button');
  none.className='m-chip'+(pickedMusic?'':' on');
  none.textContent='🔇 بلا موسيقى';
  none.onclick=()=>{pickedMusic=null;stopMusicPreview();renderMusicChips()};
  el.appendChild(none);
  MUSIC_LIST.forEach(m=>{
    const b=document.createElement('button');
    b.className='m-chip'+(pickedMusic&&pickedMusic.id===m.id?' on':'');
    b.textContent='🎵 '+m.name;
    const pick=function(ev){
      if(ev){ev.preventDefault();ev.stopPropagation();}
      pickedMusic=m;previewMusic(m);renderMusicChips();
    };
    b.addEventListener('touchend',pick,{passive:false});
    b.addEventListener('click',pick);
    el.appendChild(b);
  });
}

function previewMusic(m){
  try{
    if(!window.__actx)window.__actx=new (window.AudioContext||window.webkitAudioContext)();
    if(window.__actx.state==='suspended')window.__actx.resume();
  }catch(e){}
  const el=document.getElementById('musicPreview');
  if(!el)return;
  try{
    el.pause();
    const src=m._local?URL.createObjectURL(ownMusicFile):musicUrl(m.path);
    el.onerror=()=>{};
    el.src=src;
    el.volume=0.55;
    el.loop=true;
    el.load();
    const pr=el.play();
    if(pr&&pr.catch)pr.catch(()=>{});
    musicAudio=el;
  }catch(e){}
}

function stopMusicPreview(){
  const el=document.getElementById('musicPreview');
  if(el){try{el.pause()}catch(e){}}
  musicAudio=null;
}

/* بناء مسار صوتي مدمج: ميكروفون + موسيقى */
async function buildMixedStream(camStream){
  if(!pickedMusic)return camStream;
  const el=document.getElementById('musicPreview');
  if(!el||!el.src)return camStream;
  try{
    if(!window.__actx)window.__actx=new (window.AudioContext||window.webkitAudioContext)();
    audioCtx=window.__actx;
    if(audioCtx.state==='suspended'){try{await audioCtx.resume()}catch(e){}}

    const dest=audioCtx.createMediaStreamDestination();

    // صوت الكاميرا
    if(camStream.getAudioTracks().length){
      const micSrc=audioCtx.createMediaStreamSource(camStream);
      const micGain=audioCtx.createGain();
      micGain.gain.value=0.9;
      micSrc.connect(micGain).connect(dest);
    }

    // الموسيقى من عنصر الصفحة (يُنشأ المصدر مرة واحدة فقط)
    if(!el._srcNode){
      el._srcNode=audioCtx.createMediaElementSource(el);
      el._gain=audioCtx.createGain();
      el._srcNode.connect(el._gain);
      el._gain.connect(audioCtx.destination);
    }
    el._gain.gain.value=0.45;
    el._gain.connect(dest);

    el.currentTime=0;
    try{await el.play()}catch(e){}

    const mixed=new MediaStream();
    camStream.getVideoTracks().forEach(t=>mixed.addTrack(t));
    dest.stream.getAudioTracks().forEach(t=>mixed.addTrack(t));
    window.__mixDest=dest;
    return mixed;
  }catch(e){
    toast('تعذر دمج الموسيقى — سُجّل بالصوت الأصلي',true);
    return camStream;
  }
}

function stopMixer(){
  try{
    const el=document.getElementById('musicPreview');
    if(el){
      try{el.pause()}catch(e){}
      if(el._gain&&window.__mixDest){try{el._gain.disconnect(window.__mixDest)}catch(e){}}
    }
    window.__mixDest=null;
  }catch(e){}
}

/* ====== فلاتر حية بشاشة التسجيل ====== */
let recFilter='none';

function renderRecFilters(){
  const el=$('recFilters');if(!el)return;
  el.innerHTML='';
  FILTERS.forEach(f=>{
    const b=document.createElement('button');
    b.className='rf-chip'+(recFilter===f.k?' on':'');
    b.textContent=f.n;
    const setF=function(ev){
      if(ev){ev.preventDefault();ev.stopPropagation();}
      recFilter=f.k;
      const pv=$('recPreview');
      if(pv){pv.style.filter=f.css;pv.style.webkitFilter=f.css;}
      renderRecFilters();
    };
    b.addEventListener('touchend',setF,{passive:false});
    b.addEventListener('click',setF);
    el.appendChild(b);
  });
}

/* ====== شبكة الأثلاث ====== */
function toggleGrid(){
  const g=$('recGrid');
  if(g)g.classList.toggle('on');
}

/* ====== قفل التركيز باللمس ====== */
function initTapFocus(){
  const pv=$('recPreview');
  if(!pv||pv._focusBound)return;
  pv._focusBound=true;
  pv.addEventListener('click',async e=>{
    if(!recStream)return;
    const track=recStream.getVideoTracks()[0];
    if(!track)return;
    const rect=pv.getBoundingClientRect();
    const x=(e.clientX-rect.left)/rect.width;
    const y=(e.clientY-rect.top)/rect.height;
    // مؤشر بصري
    let ring=document.getElementById('recFocus');
    if(!ring){
      ring=document.createElement('div');
      ring.id='recFocus';ring.className='rec-focus';
      $('recScreen').appendChild(ring);
    }
    ring.style.left=(e.clientX-rect.left-38)+'px';
    ring.style.top=(e.clientY-rect.top-38)+'px';
    ring.classList.remove('on');
    void ring.offsetWidth;
    ring.classList.add('on');
    setTimeout(()=>ring.classList.remove('on'),900);
    buzz(20);
    // محاولة ضبط البؤرة إن دعمها الجهاز
    try{
      const caps=track.getCapabilities?track.getCapabilities():{};
      if(caps.focusMode&&caps.focusMode.includes('manual')&&caps.pointsOfInterest){
        await track.applyConstraints({advanced:[{pointsOfInterest:[{x,y}],focusMode:'manual'}]});
      }else if(caps.focusMode&&caps.focusMode.includes('single-shot')){
        await track.applyConstraints({advanced:[{focusMode:'single-shot'}]});
      }
    }catch(err){}
  });
}

/* ====== موسيقى من جهاز الزائر ====== */
let ownMusicFile=null;

function pickOwnMusic(inp){
  const f=inp.files[0];if(!f)return;
  if(f.size>8*1024*1024){toast('الملف كبير — الحد 8 ميجا',true);inp.value='';return}
  ownMusicFile=f;
  try{
    if(!window.__actx)window.__actx=new (window.AudioContext||window.webkitAudioContext)();
    if(window.__actx.state==='suspended')window.__actx.resume();
  }catch(e){}
  pickedMusic={id:'own',name:f.name.replace(/\.[^.]+$/,''),path:null,_local:true};
  previewMusic(pickedMusic);
  renderMusicChips();
  inp.value='';
}

/* نص زر النشر حسب النوع */
function syncPublishBtn(){
  const isV=!!pendingVideo;
  const b=$('pubBtn');
  if(b)b.textContent=(pendingVis==='private')?'🔒 احفظ بخزنتي':(isV?'انشر المقطع 🎬':'انشر الصورة 🚀');
  const t=$('addTitle');
  if(t)t.textContent=isV?'شارك مقطعاً من ديرتك':'شارك صورة من ديرتك';
  const lt=$('lblTitle');
  if(lt)lt.textContent=isV?'عنوان المقطع':'عنوان الصورة';
  const lc=$('lblCat');
  if(lc)lc.textContent=isV?'تصنيف المقطع':'تصنيف الصورة';
  const dg=$('descGroup');
  if(dg)dg.style.display=isV?'none':'block';
  const tg=$('trGroup');
  if(tg)tg.style.display=isV?'none':'block';
  const ti=$('aTitle');
  if(ti)ti.placeholder=isV?'مثال: ضباب الصباح على السودة':'مثال: غروب على جبال السودة';
  const cf=$('claimForm');
  if(cf)cf.style.display=isV?'none':'block';
}

/* ====== نص الصناديق القابلة للطي ====== */
function syncRulesLabel(){
  const d=$('rulesBox'), l=$('rulesLabel');
  if(!d||!l)return;
  l.textContent=d.open?'📋 إرشادات النشر — اضغط للطي':'📋 إرشادات النشر — اضغط للعرض';
}
function syncClaimLabel(){
  const d=$('claimForm'), l=$('claimLabel');
  if(!d||!l)return;
  l.textContent=d.open?'🏅 سجّل سبقك في هذا الموقع — اضغط للطي':'🏅 سجّل سبقك في هذا الموقع — اضغط للعرض';
}


function descCount(){
  const t=$('aDesc'), l=$('descLen');
  if(t&&l)l.textContent=t.value.length+' / 600';
}

/* ====== الترجمة التلقائية ====== */
let trTitle='', trDesc='';

async function translateFields(){
  const t=$('aTitle')?$('aTitle').value.trim():'';
  const d=$('aDesc')?$('aDesc').value.trim():'';
  if(!t&&!d){toast('اكتب العنوان أول',true);return}
  const btn=$('trBtn');btn.disabled=true;btn.textContent='⏳ نترجم...';
  try{
    // المسار الأول: مكتبة Supabase
    let data=null, err=null;
    try{
      const res=await sb.functions.invoke('translate',{body:{title:t,description:d}});
      data=res.data; err=res.error;
    }catch(e){err=e}

    // المسار الثاني: fetch مباشر إن فشل الأول
    if(!data||err){
      const sess=await sb.auth.getSession();
      const tok=sess?.data?.session?.access_token;
      const r=await fetch('https://gquzjaxpqeggknhipmzk.supabase.co/functions/v1/translate',{
        method:'POST',
        headers:Object.assign(
          {'Content-Type':'application/json','apikey':'sb_publishable_BNp6Fg3VLXa1Pf4V6QjncQ_f496PquX'},
          tok?{'Authorization':'Bearer '+tok}:{}
        ),
        body:JSON.stringify({title:t,description:d})
      });
      const raw=await r.text();
      if(!r.ok)throw new Error('HTTP '+r.status+' — '+raw.slice(0,100));
      data=JSON.parse(raw);
    }

    if(data&&data.error)throw new Error(data.error);
    trTitle=(data&&data.title_en)||'';
    trDesc=(data&&data.description_en)||'';
    if(!trTitle&&!trDesc)throw new Error('رد فاضي');

    const pv=$('trPreview');
    if(pv){
      pv.style.display='block';
      pv.innerHTML=(trTitle?'<b>Title</b>'+esc(trTitle):'')
        +(trDesc?'<div class="d">'+esc(trDesc)+'</div>':'');
    }
    btn.textContent='✅ تُرجم — اضغط لإعادة الترجمة';
    toast('انترجم ✅');
  }catch(e){
    toast('تعذرت الترجمة — جرّب مرة ثانية',true);
    btn.textContent='🌐 ترجم العنوان والوصف للإنجليزية';
  }finally{btn.disabled=false}
}

function resetTranslation(){
  trTitle='';trDesc='';
  const pv=$('trPreview');if(pv){pv.style.display='none';pv.innerHTML=''}
  const b=$('trBtn');if(b)b.textContent='🌐 ترجم العنوان والوصف للإنجليزية';
}

/* ====== الفاحص الذكي ====== */
async function inspectPhoto(blob){
  try{
    // تصغير للفحص (توفير تكلفة وسرعة)
    const dataUrl=await new Promise((res,rej)=>{
      const img=new Image();
      img.onload=()=>{
        try{
          const s=Math.min(1,640/Math.max(img.width,img.height));
          const cv=document.createElement('canvas');
          cv.width=Math.round(img.width*s);cv.height=Math.round(img.height*s);
          cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
          URL.revokeObjectURL(img.src);
          res(cv.toDataURL('image/jpeg',0.7));
        }catch(e){rej(e)}
      };
      img.onerror=rej;
      img.src=URL.createObjectURL(blob);
    });

    let data=null,err=null;
    try{
      const r=await sb.functions.invoke('translate',{body:{action:'inspect',image:dataUrl}});
      data=r.data;err=r.error;
    }catch(e){err=e}

    if(!data||err){
      const sess=await sb.auth.getSession();
      const tok=sess?.data?.session?.access_token;
      const r=await fetch('https://gquzjaxpqeggknhipmzk.supabase.co/functions/v1/translate',{
        method:'POST',
        headers:Object.assign(
          {'Content-Type':'application/json','apikey':'sb_publishable_BNp6Fg3VLXa1Pf4V6QjncQ_f496PquX'},
          tok?{'Authorization':'Bearer '+tok}:{}
        ),
        body:JSON.stringify({action:'inspect',image:dataUrl})
      });
      if(!r.ok)return null;
      data=await r.json();
    }
    return (data&&!data.error)?data:null;
  }catch(e){return null}
}

/* يرجع true إذا يُسمح بالمتابعة */
async function runInspection(blob){
  const st=$('inspectStatus');
  if(st){st.style.display='block';st.className='inspect-box';st.innerHTML='🤖 نفحص الصورة...'}
  const res=await inspectPhoto(blob);
  if(!res){if(st)st.style.display='none';return true}

  // منع صريح
  if(res.nsfw||res.violence){
    if(st){
      st.className='inspect-box bad';
      st.innerHTML='⛔ <b>الصورة مرفوضة</b><br><span>فيها محتوى مخالف لإرشادات النشر</span>';
      setTimeout(()=>{if(st)st.style.display='none'},5000);
    }
    return false;
  }

  // تحذيرات
  const warns=[];
  if(res.face)warns.push('👤 فيها وجه واضح — تأكد من إذن صاحبه');
  if(res.plate)warns.push('🚗 فيها لوحة مركبة مقروءة');
  if(res.indoor_private)warns.push('🏠 تبدو من داخل منزل خاص');
  if(res.military)warns.push('🚫 قد تكون منشأة عسكرية أو أمنية — تصويرها محظور نظاماً');

  if(warns.length){
    if(st)st.style.display='none';
    return confirm('تنبيه:\n\n'+warns.join('\n')+'\n\nتبي تكمل النشر؟');
  }

  // نظيفة — نقترح التصنيف
  if(st){
    st.className='inspect-box ok';
    st.innerHTML='✅ <b>الصورة سليمة</b>';
    setTimeout(()=>{if(st)st.style.display='none'},2500);
  }
  if(res.category&&$('aCat')){
    const opt=Array.from($('aCat').options).find(o=>o.value===res.category);
    if(opt)$('aCat').value=res.category;
  }
  if(res.suggested_title_ar&&$('aTitle')&&!$('aTitle').value.trim()){
    $('aTitle').placeholder='اقتراح: '+res.suggested_title_ar;
  }
  return true;
}

/* ====== سمات الصورة ====== */
const PHOTO_TAGS=[
  {k:'pure',   n:'💎 طبيعة نقية'},
  {k:'night',  n:'🌙 ليلي'},
  {k:'season', n:'🍂 موسمي'},
  {k:'hard',   n:'⛰️ صعب الوصول'},
  {k:'rare',   n:'✨ مشهد نادر'},
  {k:'sunrise',n:'🌅 شروق/غروب'}
];
window.__pickedTags=[];

function renderTagRow(){
  const el=$('tagRow');if(!el)return;
  el.innerHTML='';
  PHOTO_TAGS.forEach(t=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='tag-chip'+(window.__pickedTags.includes(t.k)?' on':'');
    b.textContent=t.n;
    b.onclick=()=>{
      const i=window.__pickedTags.indexOf(t.k);
      if(i>-1)window.__pickedTags.splice(i,1);
      else if(window.__pickedTags.length<3)window.__pickedTags.push(t.k);
      else{toast('حد أقصى ٣ سمات',true);return}
      renderTagRow();
    };
    el.appendChild(b);
  });
}

function tagName(k){
  const t=PHOTO_TAGS.find(x=>x.k===k);
  return t?t.n:k;
}

/* ====== قراءة بيانات الكاميرا من EXIF ====== */
async function readExifTech(file){
  try{
    const buf=await file.slice(0,256*1024).arrayBuffer();
    const dv=new DataView(buf);
    if(dv.getUint16(0)!==0xFFD8)return null;

    let off=2, tiff=0;
    while(off<dv.byteLength-4){
      if(dv.getUint16(off)===0xFFE1){
        if(dv.getUint32(off+4)===0x45786966){tiff=off+10;break}
      }
      const len=dv.getUint16(off+2);
      if(!len)break;
      off+=2+len;
    }
    if(!tiff)return null;

    const le=dv.getUint16(tiff)===0x4949;
    const u16=(p)=>dv.getUint16(p,le);
    const u32=(p)=>dv.getUint32(p,le);

    function readTags(dirStart,wanted,out){
      const n=u16(dirStart);
      for(let i=0;i<n;i++){
        const e=dirStart+2+i*12;
        const tag=u16(e), type=u16(e+2), cnt=u32(e+4);
        if(!wanted[tag])continue;
        const key=wanted[tag];
        let valOff=e+8;
        const sizes={1:1,2:1,3:2,4:4,5:8,7:1,9:4,10:8};
        const total=(sizes[type]||1)*cnt;
        if(total>4)valOff=tiff+u32(e+8);
        if(valOff+total>dv.byteLength)continue;

        if(type===2){
          let s='';
          for(let k=0;k<cnt-1;k++){
            const ch=dv.getUint8(valOff+k);
            if(ch)s+=String.fromCharCode(ch);
          }
          out[key]=s.trim();
        }else if(type===3){
          out[key]=u16(valOff);
        }else if(type===4){
          out[key]=u32(valOff);
        }else if(type===5){
          const a=u32(valOff), b=u32(valOff+4);
          if(b)out[key]=a/b;
        }else if(type===10){
          const a=dv.getInt32(valOff,le), b=dv.getInt32(valOff+4,le);
          if(b)out[key]=a/b;
        }
      }
    }

    const out={};
    const ifd0=tiff+u32(tiff+4);
    readTags(ifd0,{0x010F:'make',0x0110:'model',0x0132:'taken'},out);

    // IFD الفرعي (بيانات التصوير)
    const n0=u16(ifd0);
    for(let i=0;i<n0;i++){
      const e=ifd0+2+i*12;
      if(u16(e)===0x8769){
        const sub=tiff+u32(e+8);
        if(sub<dv.byteLength)readTags(sub,{
          0x829A:'shutter',0x829D:'aperture',0x8827:'iso',
          0x920A:'focal',0xA434:'lens',0x9003:'taken'
        },out);
        break;
      }
    }

    const tech={};
    if(out.make||out.model){
      let cam=(out.model||'').trim();
      const mk=(out.make||'').trim();
      if(mk&&!cam.toLowerCase().startsWith(mk.toLowerCase().split(' ')[0]))cam=mk+' '+cam;
      if(cam)tech.camera=cam.slice(0,60);
    }
    if(out.lens)tech.lens=String(out.lens).slice(0,60);
    if(out.focal)tech.focal=Math.round(out.focal)+'mm';
    if(out.aperture)tech.aperture='f/'+(Math.round(out.aperture*10)/10);
    if(out.iso)tech.iso='ISO '+out.iso;
    if(out.shutter){
      const s=out.shutter;
      tech.shutter=s>=1?(Math.round(s*10)/10)+'s':'1/'+Math.round(1/s);
    }
    return Object.keys(tech).length?tech:null;
  }catch(e){return null}
}
