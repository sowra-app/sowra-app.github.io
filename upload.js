/* صورة من بلدي — upload.js | نسخة المختبر م1 */
/* ============ الإضافة ============ */
let pendingFile=null,pendingGeo=null,pendingBlob=null,isAbroad=false,pendingVideo=null;
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
  pendingGeo=null;pendingFile=f;pendingBlob=null;
  // معاينة فورية خفيفة (بدون قراءة الملف كاملاً)
  $('drop').style.display='block';
  $('preview').src=URL.createObjectURL(f);$('preview').style.display='block';
  $('dropTxt').textContent='✓ تم اختيار الصورة';
  $('drop').classList.add('has');
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
  inp.value='';
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
  $('preview').style.display='none';
  const pv=$('videoPreview');
  if(pv){pv.src=URL.createObjectURL(f);pv.style.display='block';}
  $('dropTxt').textContent='🎬 تم اختيار الفيديو ('+Math.round(f.size/1048576)+' ميجا)';
  $('drop').classList.add('has');
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
      ctx.drawImage(img,0,0,cv.width,cv.height);
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
        image_path:vpath,media_type:'video'
      });
      if(insv.error){
        await sb.storage.from('videos').remove([vpath]).catch(()=>{});
        throw insv.error;
      }
      pendingVideo=null;
      const pv=$('videoPreview');if(pv){pv.src='';pv.style.display='none';}
      $('drop').style.display='none';$('geoCard').style.display='none';
      $('aTitle').value='';$('aVillage').value='';
      toast('انرفع الفيديو 🎬');
      await loadPhotos();go('feed');setSort('new');
      btn.disabled=false;btn.textContent='انشر الصورة 🚀';
      return;
    }
    const blob=pendingBlob||await compress(pendingFile);
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
      image_path:path
    });
    if(ins.error){
      // فشل التسجيل — ننظف ملفات الصورة من المخزن حتى لا تبقى يتيمة
      await sb.storage.from('photos').remove([path,thumbPath(path)]).catch(()=>{});
      throw ins.error;
    }
    pendingFile=null;pendingGeo=null;pendingBlob=null;
    $('preview').style.display='none';$('drop').style.display='none';$('geoCard').style.display='none';
    $('aTitle').value='';$('aVillage').value='';
    toast('نُشرت صورتك 🎉');
    const wasAbroad=isAbroad;
    $('aCountry').value='';
    await loadPhotos();go('feed');setSort(wasAbroad?'abroad':'new');
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
let recStream=null, recorder=null, recChunks=[], recTimer=null, recStart=0, recFacing='environment';
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
  bindRecBtn();
}

function recClose(){
  recStop(true);
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

function recBegin(){
  if(!recStream||recorder)return;
  recChunks=[];
  const mime=pickMime();
  try{
    recorder=mime?new MediaRecorder(recStream,{mimeType:mime,videoBitsPerSecond:2500000})
                 :new MediaRecorder(recStream);
  }catch(e){toast('تعذر بدء التسجيل',true);return}
  recorder.ondataavailable=e=>{if(e.data&&e.data.size)recChunks.push(e.data)};
  recorder.onstop=recFinish;
  recorder.start(200);
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
  if(recTimer){clearInterval(recTimer);recTimer=null}
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

  pendingVideo=new File([blob],'rec.'+ext,{type});
  pendingFile=null;pendingBlob=null;

  recClose();
  go('add');
  $('drop').style.display='block';
  $('preview').style.display='none';
  const pv=$('videoPreview');
  if(pv){pv.src=URL.createObjectURL(blob);pv.style.display='block';}
  $('dropTxt').textContent='🎬 تسجيل جاهز ('+Math.round(secs)+' ثانية)';
  $('drop').classList.add('has');
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
  const down=e=>{e.preventDefault();recBegin()};
  const up=e=>{e.preventDefault();if(recorder)recStop()};
  b.addEventListener('touchstart',down,{passive:false});
  b.addEventListener('touchend',up,{passive:false});
  b.addEventListener('touchcancel',up,{passive:false});
  b.addEventListener('mousedown',down);
  b.addEventListener('mouseup',up);
  b.addEventListener('mouseleave',up);
}
