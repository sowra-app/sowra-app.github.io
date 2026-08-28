/* صورة من بلدي — auth.js */
/* ============ وضع المشرف ============ */
let IS_ADMIN=false,admTab='rep';
let admPhotos=[],admReps={};

async function checkAdmin(){
  try{
    if(!USER||USER.is_anonymous){
      IS_ADMIN=false;
      try{localStorage.removeItem('sowra_admin')}catch(e){}
      const g=$('admGear');if(g)g.style.display='none';
      return false;
    }
    const { data } = await sb.from('admins').select('id').maybeSingle();
    IS_ADMIN=!!data;
    try{IS_ADMIN?localStorage.setItem('sowra_admin','1'):localStorage.removeItem('sowra_admin')}catch(e){}
    const g=$('admGear');if(g)g.style.display=IS_ADMIN?'block':'none';
    return IS_ADMIN;
  }catch(e){IS_ADMIN=false;return false}
}

/* ============ الحساب الموحد ============ */
let accMode='in';

function openAcc(){
  if(USER && !USER.is_anonymous)renderAccIn();
  else{
    const o=$('accOut'),i=$('accIn');
    if(o)o.style.display='block';
    if(i)i.style.display='none';
  }
  go('acc');
}

function accTab(m){
  accMode=m;
  const ti=$('accTabIn'),tu=$('accTabUp'),ng=$('accNameGrp'),pb=$('pledgeBox'),ag=$('accGo');
  if(ti)ti.classList.toggle('on',m==='in');
  if(tu)tu.classList.toggle('on',m==='up');
  if(ng)ng.style.display=m==='up'?'block':'none';
  if(pb)pb.style.display=m==='up'?'block':'none';
  if(ag)ag.textContent=m==='up'?'إنشاء الحساب':'دخول';
}

async function renderAccIn(){
  try{
    let data=null;
    try{
      const r=await sb.from('profiles').select('display_name,bio,region').eq('id',USER.id).maybeSingle();
      data=r.data;
    }catch(e){}

    const hi=$('accHello');if(hi)hi.textContent='هلا '+((data&&data.display_name)||'مصوّر');
    const en=$('accEditName');if(en)en.value=(data&&data.display_name)||'';
    const rg=$('accRegion');if(rg)rg.value=(data&&data.region)||'';
    const bo=$('accBio');if(bo)bo.value=(data&&data.bio)||'';
    const ml=$('accMail');if(ml)ml.textContent=USER.email||'';
    const ab=$('accAdminBtn');if(ab)ab.style.display=IS_ADMIN?'block':'none';

    const o=$('accOut'),i=$('accIn');
    if(o)o.style.display='none';
    if(i)i.style.display='block';

    // إضافات اختيارية — لا توقف الصفحة إن أخفقت
    try{if(typeof renderAccAvatar==='function')renderAccAvatar()}catch(e){}
    try{if(typeof renderAccCover==='function')renderAccCover()}catch(e){}
  }catch(e){
    console.warn('renderAccIn',e);
    const o=$('accOut'),i=$('accIn');
    if(o)o.style.display='none';
    if(i)i.style.display='block';
  }
}

async function saveMyName(){
  const en=$('accEditName');
  const name=en?en.value.trim():'';
  if(!name)return toast('اكتب اسم',true);
  const upd={display_name:name};
  const rg=$('accRegion');if(rg)upd.region=rg.value.trim();
  const bo=$('accBio');if(bo)upd.bio=bo.value.trim();
  const { error } = await sb.from('profiles').update(upd).eq('id',USER.id);
  if(error){toast('تعذر الحفظ',true);return}
  const hi=$('accHello');if(hi)hi.textContent='هلا '+name;
  toast('انحفظت بياناتك ✅');
  try{await loadPhotos()}catch(e){}
}

async function accSubmit(){
  const em=$('accEmail'),pw=$('accPass');
  const email=em?em.value.trim():'', pass=pw?pw.value:'';
  if(!email||!pass)return toast('عبّي الإيميل وكلمة السر',true);

  const b=$('accGo');
  const old=b?b.textContent:'دخول';
  if(b){b.disabled=true;b.textContent='⏳'}

  try{
    if(accMode==='up'){
      const nm=$('accName');
      const name=nm?nm.value.trim():'';
      if(!name){toast('اكتب اسمك',true);return}
      const pc=$('pledgeChk');
      if(pc&&!pc.checked){toast('لازم توافق على الشروط والتعهد أول ✋',true);return}
      const r=await Promise.race([
        sb.auth.signUp({email,password:pass,options:{data:{display_name:name}}}),
        new Promise((_,rj)=>setTimeout(()=>rj(new Error('انتهت المهلة — تحقق من اتصالك')),15000))
      ]);
      const data=r.data, error=r.error;
      if(error)throw error;
      if(!data.session){toast('أُرسل رابط تأكيد لإيميلك 📧');return}
      USER=data.session.user;
    }else{
      // مهلة ١٥ ثانية — لا ننتظر للأبد
      const race=await Promise.race([
        sb.auth.signInWithPassword({email,password:pass}),
        new Promise((_,rj)=>setTimeout(()=>rj(new Error('انتهت المهلة — تحقق من اتصالك')),15000))
      ]);
      if(race.error)throw race.error;
      const sess=await Promise.race([
        sb.auth.getSession(),
        new Promise((_,rj)=>setTimeout(()=>rj(new Error('تعذر قراءة الجلسة')),8000))
      ]);
      USER=(sess&&sess.data&&sess.data.session)?sess.data.session.user:(race.data&&race.data.user);
      if(!USER)throw new Error('ما رجعت الجلسة');
    }

    // كل ما بعد الدخول محصّن — لا يمنع اكتمال العملية
    try{await checkAdmin()}catch(e){}
    try{await renderAccIn()}catch(e){}
    toast(IS_ADMIN?'أهلاً بالمشرف 👮':'حياك الله 🌟');
    try{if(IS_ADMIN&&typeof openAdmin==='function')openAdmin()}catch(e){}
    try{await loadPhotos()}catch(e){}
    try{if(typeof loadFavs==='function')loadFavs()}catch(e){}
  }catch(e){
    const msg=(e&&e.message)||'';
    toast(msg.includes('Invalid')?'بيانات الدخول غير صحيحة':(msg||'تعذرت العملية'),true);
  }finally{
    if(b){b.disabled=false;b.textContent=old}
  }
}

async function accLogout(){
  try{await sb.auth.signOut()}catch(e){}
  try{localStorage.removeItem('sowra_admin')}catch(e){}
  location.reload();
}

async function admLogout(){await accLogout()}

/* ====== رسائلي ====== */
function openMsgs(){
  go('msgs');
  loadMyMsgs();
}

async function loadMyMsgs(){
  const el=$('myMsgs');if(!el)return;
  if(!USER){el.innerHTML='';return}
  el.innerHTML='<div style="text-align:center;color:var(--txt-dim);padding:8px">⏳</div>';
  try{
    const r=await sb.from('feedback').select('*').eq('user_id',USER.id).order('created_at',{ascending:false});
    const list=r.data||[];
    el.innerHTML=(list.length?'<div style="font-weight:700;font-size:14px;margin-bottom:10px">سجل رسائلك:</div>':'')
      +(list.map(m=>`
      <div class="msg-card">
        <div class="mk">
          <span>${(typeof FB_AR!=='undefined'&&FB_AR[m.kind])||m.kind} · ${new Date(m.created_at).toLocaleDateString('ar-SA')}</span>
          <span class="msg-st ${m.status==='new'?'new':'done'}">${m.status==='new'?'⏳ قيد المراجعة':'✅ تمت المعالجة'}</span>
        </div>
        <div class="mb">${esc(m.body)}</div>
        ${m.reply?`<div class="msg-reply"><b>رد الإدارة:</b><br>${esc(m.reply)}</div>`:''}
      </div>`).join('')||'<div class="empty" style="padding:18px">ما أرسلت رسائل بعد</div>');
  }catch(e){
    el.innerHTML='<div class="empty" style="padding:14px">تعذر تحميل السجل</div>';
  }
}

async function signInWithGoogle(){
  try{
    const{error}=await sb.auth.signInWithOAuth({
      provider:'google',
      options:{redirectTo:window.location.origin}
    });
    if(error)toast('تعذر الدخول بـGoogle: '+error.message,true);
  }catch(e){toast('تعذر الدخول بـGoogle',true)}
}

function initGoogleBtn(){
  const wrap=$('googleBtnWrap');if(!wrap)return;
  const sp=window.__SPDATA;
  wrap.style.display=(sp&&sp.google_login)?'block':'none';
}
