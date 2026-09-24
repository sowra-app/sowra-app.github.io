/* صورة من بلدي — features/account.js
   الحساب والرسائل */

import { currentUser, isAnon, sb, session } from '../core/db.js';
import { checkText } from '../core/format.js';
import { need } from '../core/hub.js';
import { state } from '../core/state.js';
import { $, dbErr, esc, prompt, toast } from '../core/ui.js';
import { geo, COORDS, nearestCity, loadPlaces, BASE_GEO } from '../data/places.js';

/* ═══ عبر الحاجز ═══
   loadFavs ← features/profile.js
   loadPhotos ← features/feed.js
   openAdmin ← admin/index.js
   pushNotify ← features/notify.js
   renderAccAvatar ← features/profile.js
   renderAccCover ← features/profile.js
*/
const loadFavs = need('loadFavs');
const loadPhotos = need('loadPhotos');
const openAdmin = need('openAdmin');
const pushNotify = need('pushNotify');
const renderAccAvatar = need('renderAccAvatar');
const renderAccCover = need('renderAccCover');

/* ═══ من التنقل — عبر الحاجز ═══ */
const go = need('go');


/* state.admPhotos → state.admPhotos */
export async function checkAdmin(){
  try{
    if(isAnon()){
      state.isAdmin=false;
      state.admRole='';
      try{localStorage.removeItem('sowra_admin')}catch(e){}
      const g=$('admGear');if(g)g.style.display='none';
      return false;
    }
    /* ═══ نفيٌ مؤكَّد لا نفيٌ مشكوك فيه ═══
       كانت الأخطاء تُبتلَع هنا بـcatch فارغ، فيبقى data=null، فيصير
       «تعذّر السؤال» و«ليس مشرفاً» شيئاً واحداً — ثم يُمحى مفتاح الجهاز
       في الأسفل بناءً على ذلك. فوميضُ شبكةٍ واحد كان يكفي لتنزع صفة
       الإشراف عن صاحب الموقع. فصار الجواب يُحمل معه: هل وصل أصلاً. */
    let data=null, answered=false;
    try{
      const r=await sb.from('admins').select('id,role').eq('id',currentUser()?.id).maybeSingle();
      if(!r.error){ answered=true; data=r.data; }
    }catch(e){}
    // احتياطي: لو فشل عمود role
    if(!data){
      try{
        const r2=await sb.from('admins').select('id').eq('id',currentUser()?.id).maybeSingle();
        if(!r2.error){ answered=true; data=r2.data; }
      }catch(e){}
    }
    state.isAdmin=!!data;
    state.admRole=(data&&data.role)||(data?'owner':'');

    // صفة المحرّر — مستقلة عن الإشراف
    try{
      const cu=(await sb.from('curators').select('id').eq('id',currentUser()?.id).maybeSingle()).data;
      state.isCurator=!!cu;
    }catch(e){state.isCurator=false}

    // المحرّر غير المشرف يدخل اللوحة لقسم الترشيحات فقط
    if(!state.isAdmin&&state.isCurator){
      const g=$('admGear');
      if(g)g.style.display='block';
    }
    /* لا تمحُ إلا على جوابٍ وصل. وإن لم يصل فالصفة السابقة أصدق من
       تخميننا: نتركها كما هي ولا نُسقطها. */
    try{
      if(state.isAdmin) localStorage.setItem('sowra_admin','1');
      else if(answered) localStorage.removeItem('sowra_admin');
    }catch(e){}
    let held=false;
    if(!answered){ try{ held=localStorage.getItem('sowra_admin')==='1' }catch(e){} }
    const g=$('admGear');if(g)g.style.display=(state.isAdmin||held)?'block':'none';
    return state.isAdmin;
  }catch(e){state.isAdmin=false;return false}
}

/* ============ الحساب الموحد ============ */

export let accMode='in';

export function openAcc(){
  if(currentUser() && !isAnon())renderAccIn();
  else{
    const o=$('accOut'),i=$('accIn');
    if(o)o.style.display='block';
    if(i)i.style.display='none';
  }
  go('acc');
}

export function accTab(m){
  accMode=m;
  const ti=$('accTabIn'),tu=$('accTabUp'),ng=$('accNameGrp'),pb=$('pledgeBox'),ag=$('accGo');
  if(ti)ti.classList.toggle('on',m==='in');
  if(tu)tu.classList.toggle('on',m==='up');
  if(ng)ng.style.display=m==='up'?'block':'none';
  if(pb)pb.style.display=m==='up'?'block':'none';
  if(ag)ag.textContent=m==='up'?'إنشاء الحساب':'دخول';
  /* «نسيت كلمة السر» لا معنى لها في تبويب إنشاء حساب */
  const fw=$('accForgotWrap');
  if(fw)fw.style.display=m==='up'?'none':'';
}

export async function renderAccIn(){
  try{
    let data=null;
    try{
      const r=await sb.from('profiles').select('display_name,bio,region').eq('id',currentUser()?.id).maybeSingle();
      data=r.data;
    }catch(e){}

    const hi=$('accHello');if(hi)hi.textContent='هلا '+((data&&data.display_name)||'مصوّر');
    const en=$('accEditName');if(en)en.value=(data&&data.display_name)||'';
    const rg=$('accRegion');if(rg)rg.value=(data&&data.region)||'';
    const bo=$('accBio');if(bo)bo.value=(data&&data.bio)||'';
    const ml=$('accMail');if(ml)ml.textContent=currentUser()?.email||'';
    const ab=$('accAdminBtn');if(ab)ab.style.display=state.isAdmin?'block':'none';

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

export async function saveMyName(){
  const en=$('accEditName');
  const name=en?en.value.trim():'';
  if(!name)return toast('اكتب اسم',true);
  const upd={display_name:name};
  const rg=$('accRegion');if(rg)upd.region=rg.value.trim();
  const bo=$('accBio');if(bo)upd.bio=bo.value.trim();
  const { error } = await sb.from('profiles').update(upd).eq('id',currentUser()?.id);
  if(error){dbErr('حفظ الحساب',error,'تعذر الحفظ');return}
  const hi=$('accHello');if(hi)hi.textContent='هلا '+name;
  toast('انحفظت بياناتك ✅');
  try{await loadPhotos()}catch(e){}
}

/* ══════════════════════════════════════════════════════════════
   سؤال الاسم بعد أول دخول

   من يدخل بجوجل لا يُسأل عن اسمه أبداً: نأخذ بريده وننتهي. فيبقى
   display_name فارغاً، ويظهر بلا اسمٍ تحت صوره وفي لوحة الإشراف.
   ولا يكتشفه إلا من فتح «بياناتي» من نفسه — وقليلٌ من يفعل.

   فنسأله مرّةً بعد الدخول، سؤالاً يُردّ بضغطة: «لاحقاً» تؤجّله
   أسبوعاً لا للأبد — فمن أجّله اليوم قد يكتبه بعد أن ينشر صورةً
   ويرى اسمه ناقصاً. ولا يُسأل المجهول: ليس له حسابٌ يحمل اسماً.  */
const NAME_ASK_KEY = 'sowra_name_ask';
const NAME_ASK_WAIT = 7 * 24 * 3600 * 1000;

function nameAskDue(){
  try{
    const t = Number(localStorage.getItem(NAME_ASK_KEY) || 0);
    return !t || (Date.now() - t) > NAME_ASK_WAIT;
  }catch(e){ return true; }
}
function nameAskDone(){
  try{ localStorage.setItem(NAME_ASK_KEY, String(Date.now())); }catch(e){}
}

export async function askMyName(){
  if(!currentUser() || isAnon()) return;
  if(!nameAskDue()) return;
  if(document.getElementById('nameAsk')) return;

  let cur = null;
  try{
    const r = await sb.from('profiles').select('display_name').eq('id', currentUser().id).maybeSingle();
    cur = r.data && r.data.display_name;
  }catch(e){ return; }          /* تعذّرت القراءة: لا نزعجه بسؤالٍ قد لا يلزم */
  if(cur && String(cur).trim()) return;

  const box = document.createElement('div');
  box.id = 'nameAsk';
  box.style.cssText = 'position:fixed;inset:0;background:rgba(36,31,28,.62);z-index:9995;display:flex;'
    + 'align-items:center;justify-content:center;padding:22px;backdrop-filter:blur(3px)';
  box.innerHTML = '<div style="background:var(--card);border:1.5px solid var(--line);border-radius:18px;'
    + 'padding:20px 20px 16px;max-width:360px;width:100%;box-shadow:0 8px 28px rgba(0,0,0,.22)">'
    + '<div style="font-family:\'Reem Kufi\',sans-serif;font-size:19px;color:var(--sand);margin-bottom:5px">وش نسمّيك؟ 👋</div>'
    + '<div style="font-size:13.5px;color:var(--txt-dim);line-height:1.8;margin-bottom:13px">'
    + 'هذا الاسم يظهر تحت صورك للناس. تقدر تغيّره وقت ما تبي من «حسابي ← بياناتي».</div>'
    + '<input id="nameAskIn" maxlength="40" placeholder="أبو الذيابة" autocomplete="name" '
    + 'style="width:100%;background:var(--card2);border:1.5px solid var(--line);border-radius:12px;'
    + 'padding:12px 14px;font-family:\'Tajawal\';font-size:15px;color:var(--txt);outline:none;margin-bottom:12px">'
    + '<div style="display:flex;gap:9px">'
    + '<button id="nameAskGo" class="btn" style="flex:1;padding:12px">احفظ</button>'
    + '<button id="nameAskLater" class="btn" style="flex:0 0 auto;padding:12px 16px;background:var(--card2);'
    + 'border:1px solid var(--line);color:var(--txt)">لاحقاً</button>'
    + '</div></div>';
  document.body.appendChild(box);

  const close = () => { nameAskDone(); try{ box.remove(); }catch(e){} };
  const inp = box.querySelector('#nameAskIn');
  try{ inp.focus(); }catch(e){}

  box.querySelector('#nameAskLater').onclick = close;
  box.addEventListener('click', e => { if(e.target === box) close(); });
  inp.addEventListener('keydown', e => { if(e.key === 'Enter') box.querySelector('#nameAskGo').click(); });

  box.querySelector('#nameAskGo').onclick = async () => {
    const name = (inp.value || '').trim();
    if(!name){ toast('اكتب اسم', true); return; }
    if(typeof checkText === 'function' && checkText(name)){ toast('الاسم فيه كلمة غير لائقة', true); return; }
    const btn = box.querySelector('#nameAskGo');
    btn.disabled = true; btn.textContent = '...';
    /* update وحدها تصمت إن لم تُطابق صفّاً — والصفّ قد لا يكون
       أُنشئ بعد. فنسأل عن المُحدَّث: إن لم يرجع شيء أنشأناه. */
    let saved = false;
    try{
      const u = await sb.from('profiles').update({ display_name: name })
                        .eq('id', currentUser().id).select('id');
      if(!u.error && u.data && u.data.length) saved = true;
      if(!saved){
        const i = await sb.from('profiles').insert({ id: currentUser().id, display_name: name }).select('id');
        saved = !i.error && !!(i.data && i.data.length);
        if(i.error) dbErr('حفظ الاسم', i.error, 'تعذر الحفظ');
      }else if(u.error) dbErr('حفظ الاسم', u.error, 'تعذر الحفظ');
    }catch(e){}
    btn.disabled = false; btn.textContent = 'احفظ';
    if(!saved){ toast('تعذر الحفظ — جرّب من حسابي ← بياناتي', true); return; }
    close();
    toast('تشرّفنا يا ' + name + ' ✅');
    const hi = $('accHello'); if(hi) hi.textContent = 'هلا ' + name;
    const en = $('accEditName'); if(en) en.value = name;
    try{ await loadPhotos(); }catch(e){}
  };
}

/* ═══ نسيت كلمة السر ═══
   لم يكن للمنصة بابٌ لاستعادتها إطلاقاً: من نسيها فقد حسابه وصوره
   معه، وليس أمامه إلا أن يفتح حساباً جديداً باسمٍ جديد — وتبقى صوره
   القديمة يتيمةً بلا صاحب. وليست حالةً نادرة: كل منصةٍ بكلمة سرّ
   تحتاجها. سوبابيز يرسل رابط الاستعادة بنفسه، فلم ينقص إلا الزرّ.
   redirectTo يرجع به إلى الصفحة نفسها فيكمل التعيين هناك. */
export async function accForgot(){
  const em=$('accEmail');
  const email=em?em.value.trim():'';
  if(!email){
    toast('اكتب إيميلك بالخانة أول، ثم اضغط «نسيت كلمة السر»',true);
    if(em)em.focus();
    return;
  }
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
    toast('الإيميل غير صحيح',true); if(em)em.focus(); return;
  }
  const lnk=$('accForgotBtn');
  const was=lnk?lnk.textContent:'';
  if(lnk){lnk.textContent='⏳ جاري الإرسال...';lnk.style.pointerEvents='none'}
  try{
    const back=location.origin+location.pathname;
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:back});
    if(error)throw error;
    /* لا نقول «الإيميل غير مسجّل» — تلك ثغرةٌ تكشف من له حساب بالمنصة */
    toast('إن كان الإيميل مسجّلاً وصلك رابط الاستعادة 📧 — افحص البريد والمهملات');
  }catch(e){
    dbErr('إرسال رابط الاستعادة', e, 'تعذر الإرسال — جرّب بعد قليل');
  }finally{
    if(lnk){lnk.textContent=was||'🔑 نسيت كلمة السر؟';lnk.style.pointerEvents=''}
  }
}

export async function accSubmit(){
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
      const { data, error } = await sb.auth.signUp({
        email,password:pass,options:{data:{display_name:name}}
      });
      if(error)throw error;
      if(!data.session){toast('أُرسل رابط تأكيد لإيميلك 📧');return}
      session.user = data.session.user;
    }else{
      const { data, error } = await sb.auth.signInWithPassword({email,password:pass});
      if(error)throw error;
      /* ⚠️ كان هنا:  const { data:{ session } } = ...
         الاسم session يحجب الكائن المشترك المستورد من core/db.js،
         فتُكتب الجلسة على المتغير المحلي ويبقى المشترك على المستخدم
         المجهول — فيرى checkAdmin مستخدماً مجهولاً ولا يظهر الترس.
         نسمّي المحلي s حتى يصل التحديث للكائن المشترك فعلاً. */
      const { data:{ session: s } } = await sb.auth.getSession();
      session.user = (s&&s.user)||(data&&data.user);
      if(!currentUser())throw new Error('تعذر قراءة الجلسة');
    }

    // كل ما بعد الدخول محصّن — لا يمنع اكتمال العملية
    try{await checkAdmin()}catch(e){}
    try{await renderAccIn()}catch(e){}
    toast(state.isAdmin?'أهلاً بالمشرف 👮':'حياك الله 🌟');
    try{if(state.isAdmin&&typeof openAdmin==='function')openAdmin()}catch(e){}
    try{await loadPhotos()}catch(e){}
    try{if(typeof loadFavs==='function')loadFavs()}catch(e){}
  }catch(e){
    const msg=(e&&e.message)||'';
    toast(msg.includes('Invalid')?'بيانات الدخول غير صحيحة':(msg||'تعذرت العملية'),true);
  }finally{
    if(b){b.disabled=false;b.textContent=old}
  }
}

export async function accLogout(){
  try{await sb.auth.signOut()}catch(e){}
  try{localStorage.removeItem('sowra_admin')}catch(e){}
  location.reload();
}

export async function admLogout(){await accLogout()}

/* ====== رسائلي ====== */

export function openMsgs(){
  go('msgs');
  loadMyMsgs();
}

export async function loadMyMsgs(){
  const el=$('myMsgs');if(!el)return;
  if(!currentUser()){el.innerHTML='';return}
  el.innerHTML='<div style="text-align:center;color:var(--txt-dim);padding:8px">⏳</div>';
  try{
    const r=await sb.from('feedback').select('*').eq('user_id',currentUser()?.id).order('created_at',{ascending:false});
    const list=r.data||[];
    const done=list.filter(m=>m.status!=='new').length;
    el.innerHTML=(list.length?`<div class="msgs-bar">
        <span>سجل رسائلك (${list.length})</span>
        ${done?`<button onclick="clearMyMsgs()">🗑️ امسح المنتهية (${done})</button>`:''}
      </div>`:'')
      +(list.map(m=>`
      <div class="msg-card">
        <div class="mk">
          <span>${(typeof FB_AR!=='undefined'&&FB_AR[m.kind])||m.kind} · ${new Date(m.created_at).toLocaleDateString('ar-SA')}</span>
          <span class="msg-st ${m.status==='new'?'new':'done'}">${
            /^(🚫|✅ تم رفع)/.test(m.body||'') ? '📢 قرار إداري'
            : (m.status==='new'?'⏳ قيد المراجعة':'✅ تمت المعالجة')
          }</span>
        </div>
        <div class="mb">${esc(m.body)}</div>
        ${m.reply?`<div class="msg-reply"><b>رد الإدارة:</b><br>${esc(m.reply)}</div>`:''}
        <div class="msg-acts">
          <button class="msg-reply-btn" onclick="replyToAdmin(${m.id})">↩️ رد على الإدارة</button>
          ${m.status==='new'
            ?'<span class="msg-lock">🔒 قيد المراجعة</span>'
            :`<button class="msg-del" onclick="delMyMsg(${m.id})">🗑️ حذف</button>`}
        </div>
      </div>`).join('')||'<div class="empty" style="padding:18px">ما أرسلت رسائل بعد</div>');
  }catch(e){
    el.innerHTML='<div class="empty" style="padding:14px">تعذر تحميل السجل</div>';
  }
}

export async function signInWithGoogle(){
  try{
    /* علامة أن رحلة تسجيل الدخول بدأت من هنا فعلاً — يقرأها حارس
       الصيانة ليعفي العودة وحدها، لا أي رابط يحمل ?code= */
    try{ sessionStorage.setItem('oauth_pending','1'); }catch(e){}
    /* origin وحده يسقط المسار: بـsowra-lab يصير
       https://alialasmari-oss.github.io بدل .../sowra-lab/ — ولأنه غير
       مُدرج بقائمة Redirect URLs يتجاهله Supabase ويرجع لـSite URL
       (sowra.app)، فينتهي المستخدم بموقع آخر كلياً.
       إضافة pathname تُبقينا بنفس النشر — وعلى sowra.app النتيجة ذاتها. */
    const{error}=await sb.auth.signInWithOAuth({
      provider:'google',
      options:{redirectTo:window.location.origin+window.location.pathname}
    });
    if(error)toast('تعذر الدخول بـGoogle: '+error.message,true);
  }catch(e){toast('تعذر الدخول بـGoogle',true)}
}

export function initGoogleBtn(){
  const wrap=$('googleBtnWrap');if(!wrap)return;
  const sp=state.banner;
  wrap.style.display=(sp&&sp.google_login)?'block':'none';
}

/* ====== حذف رسائلي ====== */

export async function delMyMsg(id){
  if(!confirm('حذف هذي الرسالة من سجلك؟'))return;
  const {data,error}=await sb.from('feedback').delete().eq('id',id).eq('user_id',currentUser()?.id).select('id');
  if(error){toast('تعذر الحذف: '+error.message,true);return}
  if(!data||!data.length){toast('ما تنحذف وهي قيد المراجعة 🔒',true);return}
  toast('انحذفت');
  loadMyMsgs();
}

export async function clearMyMsgs(){
  if(!confirm('مسح كل الرسائل المنتهية من سجلك؟\nالرسائل قيد المراجعة تبقى.'))return;
  const {error}=await sb.from('feedback').delete()
    .eq('user_id',currentUser()?.id).neq('status','new');
  if(error){toast('تعذر المسح: '+error.message,true);return}
  toast('انمسح السجل ✅');
  loadMyMsgs();
}

/* ====== الرد على الإدارة ====== */

export async function replyToAdmin(refId){
  const t=prompt('اكتب ردك للإدارة:');
  if(t===null)return;
  const body=(t||'').trim();
  if(body.length<5){toast('اكتب رسالة أوضح',true);return}
  if(body.length>600){toast('الحد ٦٠٠ حرف',true);return}

  if(typeof checkText==='function'){
    const bad=checkText(body);
    if(bad){toast(bad,true);return}
  }

  try{
    const {error}=await sb.from('feedback').insert({
      user_id:currentUser()?.id,
      kind:'other',
      body:'↩️ رد على رسالة سابقة (#'+refId+')\n\n'+body,
      status:'new'
    });
    if(error)throw error;

    /* إشعار للإدارة — to:'admins' (المتصفح لم يعد يقرأ جدول admins) */
    try{
      if(typeof pushNotify==='function'){
        pushNotify({
          title:'💬 رد من عضو',
          body:body.slice(0,80),
          url:'/',
          to:'admins'
        });
      }
    }catch(e){}

    toast('✅ وصل ردك — الإدارة تراجعه');
    loadMyMsgs();
  }catch(e){
    toast('تعذر الإرسال: '+((e&&e.message)||''),true);
  }
}
