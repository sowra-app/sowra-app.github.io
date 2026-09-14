async function openAdmin(){
  setTimeout(function(){if(typeof hideRestrictedTabs==='function')hideRestrictedTabs()},150);
  go('adm');
  $('admList').innerHTML='<div class="empty">⏳ جاري التحميل...</div>';
  const [ph,rp]=await Promise.all([
    sb.from('photos').select('*, profiles!user_id(display_name, banned)').order('created_at',{ascending:false}),
    sb.from('reports').select('photo_id')
  ]);
  if(ph.error){$('admList').innerHTML=`<div class="empty">⚠️ خطأ في جلب الصور:<br><span style="direction:ltr;display:inline-block;color:var(--sadu);font-size:12px">${ph.error.message}</span></div>`;return}
  if(rp.error){$('admList').innerHTML=`<div class="empty">⚠️ خطأ في جلب البلاغات:<br><span style="direction:ltr;display:inline-block;color:var(--sadu);font-size:12px">${rp.error.message}</span></div>`;return}
  admPhotos=ph.data||[];
  admReps={};
  (rp.data||[]).forEach(r=>admReps[r.photo_id]=(admReps[r.photo_id]||0)+1);
  admSetTab(admTab);
}
function hideRestrictedTabs(){
  try{
    const st=document.getElementById('admTabSt');
    if(st)st.style.display=isOwner()?'':'none';
    ['Wk','Qs','Plc','Mu'].forEach(function(x){
      const e=document.getElementById('admTab'+x);
      if(e)e.style.display=isEditor()?'':'none';
    });
  }catch(e){}
}

function admRoleBadge(){
  const r=admRole();
  if(!r)return '';
  const x=ADM_ROLES[r]||ADM_ROLES.mod;
  return `<div class="adm-role" style="border-color:${x.c};color:${x.c}">${x.ic} ${x.n}</div>`;
}

function admSetTab(t){
  // فحص الصلاحية
  const need={wk:'editor',qs:'editor',plc:'editor',mu:'editor'};
  if(t==='st'&&!isOwner()){toast('🔒 الإحصائيات للمالك فقط',true);return}
  if(need[t]&&!isEditor()){toast('🔒 هذا القسم يحتاج صلاحية أعلى',true);return}

  admTab=t;
  ['Rep','All','Plc','Fb','St','Wk','Qs','Mu'].forEach(x=>{const e=$('admTab'+x);if(e)e.classList.remove('on')});
  const m={rep:'Rep',all:'All',plc:'Plc',fb:'Fb',st:'St',wk:'Wk',qs:'Qs',mu:'Mu'};
  const cur=$('admTab'+m[t]);if(cur)cur.classList.add('on');
  $('admPlaces').style.display=t==='plc'?'block':'none';
  $('admFb').style.display=t==='fb'?'block':'none';
  $('admSt').style.display=t==='st'?'block':'none';
  $('admWk').style.display=t==='wk'?'block':'none';
  const aq=$('admQs');if(aq)aq.style.display=t==='qs'?'block':'none';
  const am=$('admMu');if(am)am.style.display=t==='mu'?'block':'none';
  $('admList').style.display=(t==='rep'||t==='all')?'block':'none';
  if(t==='plc')renderPlaces();
  else if(t==='fb')loadFb();
  else if(t==='st'){loadStats();setTimeout(loadCommercial,400);}
  else if(t==='wk')loadAdmWeek();
  else if(t==='qs')loadAdmQuests();
  else if(t==='mu')loadAdmMusic();
  else admRender();
}

/* ====== الإحصائيات ====== */
async function loadStats(){
  if(!isOwner()){
    const e=$('admSt');
    if(e)e.innerHTML='<div class="empty" style="padding:26px"><span class="big">🔒</span>الإحصائيات للمالك فقط</div>';
    return;
  }
  $('admSt').innerHTML='<div class="empty">⏳</div>';
  const [st,us]=await Promise.all([sb.rpc('admin_stats'),sb.rpc('admin_users')]);
  if(st.error||!st.data){$('admSt').innerHTML=`<div class="empty">⚠️ تعذر تحميل الإحصائيات<br><span style="font-size:11px">${esc(st.error?.message||'لا توجد بيانات')}</span></div>`;return}
  const s=st.data;
  const card=(n,l,ic)=>`<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:14px 8px;text-align:center">
    <div style="font-size:22px">${ic}</div>
    <div style="font-size:24px;font-weight:700;color:var(--sand)">${n}</div>
    <div style="font-size:11px;color:var(--txt-dim)">${l}</div></div>`;
  let html=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px">
    ${card(s.users,'مسجلين','👤')}${card(s.guests,'زوار','👀')}${card(s.photos,'صورة','📸')}
    ${card(s.ratings,'تقييم','⭐')}${card(s.comments,'تعليق','💬')}${card(s.badges,'صوت وسام','🗳️')}
    ${card(s.fb_new,'رسالة جديدة','📨')}${card(s.hidden,'مخفية','🙈')}${card(s.places,'مكان مضاف','📍')}
  </div>
  <div style="font-weight:700;font-size:15px;margin-bottom:10px">👥 المسجلون (${(us.data||[]).length})</div>`;
  html+=(us.data||[]).length
    ?(us.data.map(u=>`<div style="background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 13px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div style="min-width:0">
          <b style="font-size:14px">${esc(u.display_name)}</b>
          <div style="font-size:11.5px;color:var(--txt-dim);direction:ltr;text-align:right;overflow:hidden;text-overflow:ellipsis">${esc(u.email)}</div>
        </div>
        <div style="text-align:center;flex:0 0 auto">
          <div style="font-size:15px;font-weight:700;color:var(--sand)">${u.photos_count} 📸</div>
          <div style="font-size:10px;color:var(--txt-dim)">${new Date(u.created_at).toLocaleDateString('ar-SA')}</div>
        </div>
      </div>`).join(''))
    :'<div class="empty">ما فيه مسجلين بعد</div>';
  $('admSt').innerHTML=html;
}

/* صورة من بلدي — admin.js | نسخة المختبر م1 */
const KIND_AR={city:'مدينة',village:'قرية',landmark:'معلم'};
/* ====== مراسلة الإدارة ====== */
const FB_AR={suggestion:'💡 اقتراح',complaint:'⚠️ شكوى',question:'❓ استفسار',other:'📝 أخرى'};
async function sendFeedback(){
  const kind=$('fbKind').value,body=$('fbBody').value.trim();
  if(body.length<3)return toast('اكتب رسالتك أول',true);
  if(typeof checkText==='function'){
    const bad=checkText(body,{allowLink:true});
    if(bad){toast(bad,true);return}
  }
  if(typeof checkRate==='function'){
    const lim=await checkRate('message');
    if(lim){toast(lim,true);return}
  }
  const b=$('fbGo');b.disabled=true;b.textContent='⏳';
  const { error } = await sb.from('feedback').insert({user_id:USER.id,kind,body});
  b.disabled=false;b.textContent='إرسال 📨';
  if(error){toast('تعذر الإرسال: '+error.message,true);return}
  if(typeof logRate==='function')logRate('message');
  $('fbBody').value='';
  toast('وصلت رسالتك للإدارة، شكراً لك 🙏');
}
async function loadFb(){
  $('admFb').innerHTML='<div class="empty">⏳</div>';
  const { data, error } = await sb.from('feedback').select('*, profiles!user_id(display_name)').order('created_at',{ascending:false});
  // حالة المنع لكل معرّف مذكور بالبلاغات
  window.__dmBanMap={};
  try{
    const uids=[...new Set((data||[]).map(f=>_dmUid(f.admin_note)).filter(Boolean))];
    if(uids.length){
      const pr=await sb.from('profiles').select('id,dm_banned').in('id',uids);
      (pr.data||[]).forEach(u=>{window.__dmBanMap[u.id]=!!u.dm_banned});
    }
  }catch(e){}
  if(error){$('admFb').innerHTML=`<div class="empty">⚠️ ${error.message}</div>`;return}
  if(!data.length){$('admFb').innerHTML='<div class="empty">📭 ما فيه رسائل بعد</div>';return}
  const newN=data.filter(f=>f.status==='new').length;
  const doneN=data.length-newN;
  $('admFb').innerHTML=`<div class="fb-bar">
      <span>📨 ${data.length} رسالة${newN?' · <b>'+newN+' جديدة</b>':''}</span>
      ${(doneN&&isOwner())?`<button onclick="fbClearDone(${doneN})">🗑️ امسح المنتهية (${doneN})</button>`:''}
    </div>`+data.map(f=>`
    <div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:13px;margin-bottom:10px;${f.status==='done'?'opacity:.55':''}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-size:12px;font-weight:700;padding:3px 10px;border-radius:10px;background:var(--card2);border:1px solid var(--line)">${FB_AR[f.kind]||f.kind}</span>
        <span style="font-size:11px;color:var(--txt-dim)">${esc(f.profiles?.display_name||'زائر')} · ${new Date(f.created_at).toLocaleDateString('ar-SA')}</span>
      </div>
      <div style="font-size:14px;line-height:1.8;margin-bottom:${f.admin_note?'8px':'10px'}">${esc(f.body)}</div>
      ${f.admin_note?`<div style="background:var(--card2);border:1px solid var(--star);border-radius:11px;padding:10px 12px;margin-bottom:10px;font-size:12.5px;line-height:1.9;white-space:pre-wrap;color:var(--txt-dim)"><b style="color:var(--star);display:block;margin-bottom:5px">🔒 تفاصيل للإدارة</b>${esc(f.admin_note)}${_dmUid(f.admin_note)?(
            (window.__dmBanMap&&window.__dmBanMap[_dmUid(f.admin_note)])
              ? `<button class="fb-ban ok" onclick="admDmBan('${_dmUid(f.admin_note)}',false)">✅ ارفع منع المراسلة</button>`
              : `<button class="fb-ban" onclick="admDmBan('${_dmUid(f.admin_note)}',true)">🚫 امنعه من المراسلة</button>`
          ):''}</div>`:''}
      <div style="display:flex;gap:8px">
        ${f.status==='new'
          ?`<button class="btn" style="font-size:12px;padding:7px 14px;background:var(--qblue)" onclick="fbReply(${f.id})">💬 رد</button>
           <button class="btn" style="font-size:12px;padding:7px 14px;background:var(--palm)" onclick="fbDone(${f.id})">✓ تم التعامل</button>`
          :`<span style="font-size:12px;color:var(--palm);font-weight:700;padding:7px 0">✓ منتهية</span>`}
        <button class="btn" style="font-size:12px;padding:7px 14px;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="fbDel(${f.id})">🗑️ حذف</button>
      </div>
    </div>`).join('');
}
async function fbReply(id){
  const t=prompt('اكتب رد الإدارة على الرسالة:');
  if(t===null||!t.trim())return;
  const {error}=await sb.from('feedback').update({reply:t.trim(),status:'done'}).eq('id',id);
  if(error){toast('فشل الرد: '+error.message,true);return}
  // إشعار لصاحب الرسالة
  try{
    const fb=(await sb.from('feedback').select('user_id').eq('id',id).maybeSingle()).data;
    if(fb&&fb.user_id){
      pushNotify({
        title:'💬 رد من الإدارة',
        body:t.trim().slice(0,90),
        url:'/',
        user_ids:[fb.user_id]
      });
    }
  }catch(e){}
  toast('انرسل الرد 💬');loadFb();
}
async function fbDone(id){
  const { error } = await sb.from('feedback').update({status:'done'}).eq('id',id);
  if(error){toast('فشلت العملية',true);return}
  loadFb();
}
async function fbDel(id){
  if(!confirm('حذف الرسالة نهائياً؟'))return;
  const { error } = await sb.from('feedback').delete().eq('id',id);
  if(error){toast('فشل الحذف',true);return}
  loadFb();
}
function plcFillCities(){
  const r=$('plcRegion').value,c=$('plcCity');
  c.innerHTML='<option value="">المدينة (اختياري)</option>';
  if(r&&GEO[r])GEO[r].forEach(x=>c.innerHTML+=`<option>${x}</option>`);
}
function renderPlaces(){
  const reg=$('plcRegion'),sel=reg.value;
  reg.innerHTML='<option value="">اختر المنطقة</option>';
  for(const r in BASE_GEO)reg.innerHTML+=`<option>${r}</option>`;
  if(sel)reg.value=sel;
  plcFillCities();
  $('plcList').innerHTML=customPlaces.length
    ?customPlaces.map(c=>`
      <div style="display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 13px;margin-bottom:8px">
        <div style="flex:1">
          <b style="font-size:14px">${esc(c.name)}</b>
          <div style="font-size:11px;color:var(--txt-dim)">${KIND_AR[c.kind]}${c.city?' · '+esc(c.city):''} · ${esc(c.region)}</div>
        </div>
        <button class="btn" style="font-size:12px;padding:7px 12px" onclick="admDelPlace(${c.id},'${esc(c.name).replace(/'/g,"\\'")}')">🗑️ حذف</button>
      </div>`).join('')
    :`<div class="empty">ما فيه أماكن مضافة بعد — كل اللي تضيفه هنا يظهر فوراً بقوائم التطبيق</div>`;
}
async function admAddPlace(){
  const region=$('plcRegion').value,city=$('plcCity').value,name=$('plcName').value.trim(),kind=$('plcKind').value;
  if(!region)return toast('اختر المنطقة',true);
  if(name.length<2)return toast('اكتب اسم المكان',true);
  const { error } = await sb.from('custom_places').insert({region,city,name,kind});
  if(error){
    toast(error.code==='23505'?'المكان مضاف من قبل':'تعذرت الإضافة: '+error.message,true);
    return;
  }
  $('plcName').value='';
  toast('انضاف المكان ✅');
  await loadPlaces();renderPlaces();
}
async function admDelPlace(id,name){
  if(!needEditor('إدارة الأماكن'))return;
  if(!confirm(`حذف «${name}» من القوائم؟ (الصور المنشورة عليه ما تتأثر)`))return;
  const { error } = await sb.from('custom_places').delete().eq('id',id);
  if(error){toast('تعذر الحذف',true);return}
  toast('انحذف المكان');
  await loadPlaces();renderPlaces();
}
function admRender(){
  let list=admTab==='rep'?admPhotos.filter(p=>(admReps[p.id]||0)>0||p.hidden):admPhotos;
  if(admTab==='rep'){
    list=list.slice().sort((x,y)=>((admReps[y.id]||0)-(admReps[x.id]||0)));
  }
  if(!list.length){$('admList').innerHTML=`<div class="empty">${admTab==='rep'?'✅ ما فيه شيء للمراجعة — الساحة نظيفة':'ما فيه صور'}</div>`;return}
  $('admList').innerHTML=list.map(p=>{
    const rc=admReps[p.id]||0;
    return `<div class="card" style="margin-bottom:12px;cursor:default">
      <div class="ph" style="height:150px"><img src="${imgUrl(p.image_path)}" loading="lazy"></div>
      <div class="card-body">
        <div class="card-title">#${p.id} · ${esc(p.title)}</div>
        <div class="card-meta" style="margin-bottom:8px"><span>📷 ${p.profiles?.display_name||'?'} · 📍 ${p.city}</span></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
          ${rc?`<span style="font-size:11px;padding:3px 9px;border-radius:10px;font-weight:700;background:rgba(242,179,61,.15);color:var(--star);border:1px solid var(--star)">🚩 ${rc} بلاغ</span>`:''}
          ${p.hidden?`<span style="font-size:11px;padding:3px 9px;border-radius:10px;font-weight:700;background:rgba(107,98,89,.15);color:var(--txt-dim);border:1px solid var(--line)">🙈 مخفية بقرار إشراف</span>`:''}
          ${p.profiles?.banned?`<span style="font-size:11px;padding:3px 9px;border-radius:10px;font-weight:700;background:rgba(192,57,43,.3);color:#fff;border:1px solid var(--sadu)">صاحبها محظور</span>`:''}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn" style="font-size:12px;padding:8px 12px;${p.hidden?'background:var(--palm)':'background:var(--card2);border:1px solid var(--line)'}" onclick="admHide(${p.id},${!p.hidden})">${p.hidden?'👁️ إظهار':'🙈 إخفاء'}</button>
          <button class="btn" style="font-size:12px;padding:8px 12px" onclick="admDel(${p.id},'${p.image_path}')">🗑️ حذف نهائي</button>
          <button class="btn" style="font-size:12px;padding:8px 12px;background:var(--star);color:var(--ink)" onclick="admWeekAdd(${p.id})">🏆 رشّح</button>
          <button class="btn" style="font-size:12px;padding:8px 12px;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="admClearBadges(${p.id})">🗳️ مسح الأوسمة</button>
          <button class="btn" style="font-size:12px;padding:8px 12px;background:var(--star);color:var(--ink)" onclick="admAddToQuest(${p.id})">🗝️ لكنز</button>
          <button class="btn" style="font-size:12px;padding:8px 12px;${p.profiles?.banned?'background:var(--palm)':'background:var(--card2);border:1px solid var(--line)'}" onclick="admBan('${p.user_id}',${!(p.profiles?.banned)})">${p.profiles?.banned?'فك الحظر':'⛔ حظر المصور'}</button>
          ${rc?`<button class="btn" style="font-size:12px;padding:8px 12px;background:var(--card2);border:1px solid var(--line)" onclick="admClear(${p.id})">مسح البلاغات</button>`:''}
        </div>
      </div>
    </div>`;
  }).join('');
}
async function admHide(id,hide){
  const { error } = await sb.from('photos').update({hidden:hide}).eq('id',id);
  if(error){toast('فشلت العملية: '+(error.message||error.code||''),true);return}
  toast(hide?'أُخفيت الصورة':'أُظهرت الصورة');
  await openAdmin();await loadPhotos();
}
async function admDel(id,path){
  if(!needOwner('حذف الصور نهائياً'))return;
  if(!confirm('حذف نهائي؟ لا يمكن التراجع.'))return;
  const it=(admPhotos||[]).find(x=>x.id===id)||photos.find(x=>x.id===id);
  const isVid=it&&it.media_type==='video';
  const { error } = await sb.from('photos').delete().eq('id',id);
  if(error){toast('فشل الحذف',true);return}
  try{
    if(isVid) await sb.storage.from('videos').remove([path]);
    else await sb.storage.from('photos').remove([path,path.replace('.jpg','_t.jpg')]);
  }catch(e){}
  toast(isVid?'حُذف الفيديو نهائياً':'حُذفت الصورة نهائياً');
  await openAdmin();await loadPhotos();
}
async function admBan(uid,ban){
  if(!needOwner('حظر المستخدمين'))return;
  if(ban&&!confirm('حظر المصور؟ لن يستطيع النشر أو التعليق.'))return;
  const { error } = await sb.from('profiles').update({banned:ban}).eq('id',uid);
  if(error){toast('فشلت العملية',true);return}
  toast(ban?'تم حظر المصور ⛔':'فُك الحظر');
  await openAdmin();
}
async function admClear(id){
  const { error } = await sb.from('reports').delete().eq('photo_id',id);
  if(error){toast('فشلت العملية',true);return}
  toast('مُسحت البلاغات');
  await openAdmin();
}


/* ====== إدارة لقطة الأسبوع ====== */
let CW=null;
async function loadAdmWeek(){
  $('admWk').innerHTML='<div class="empty">⏳</div>';
  const c=await sb.from('weekly_contest').select('*').order('id',{ascending:false}).limit(1).maybeSingle();
  CW=c.data||null;
  let entries=[];
  if(CW){
    const en=await sb.from('weekly_entries').select('photo_id').eq('contest_id',CW.id);
    const ids=(en.data||[]).map(e=>e.photo_id);
    entries=admPhotos.filter(p=>ids.includes(p.id));
    if(!admPhotos.length){
      const ph=await sb.from('photos').select('id,title').in('id',ids.length?ids:[0]);
      entries=ph.data||[];
    }
  }
  $('admWk').innerHTML=`
    <div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:14px">
      <div style="font-weight:700;font-size:14px;margin-bottom:10px">🏆 مسابقة لقطة الأسبوع ${CW?`<span style="font-size:11px;padding:3px 10px;border-radius:10px;font-weight:700;${CW.active?'background:rgba(46,139,87,.15);color:var(--palm);border:1px solid var(--palm)':'background:var(--card2);color:var(--txt-dim);border:1px solid var(--line)'}">${CW.ended_at?'🏁 منتهية — الفائز أُعلن':(CW.active?'● نشطة الآن':'○ متوقفة')}</span>`:''}</div>
      <input id="wkLabel" placeholder="وسم الأسبوع (مثال: أسبوع الغروب)" value="${CW?esc(CW.week_label):''}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
      <input id="wkSponsor" placeholder="اسم الراعي (اختياري)" value="${CW?esc(CW.sponsor_name):''}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
      <input id="wkPrize" placeholder="الجائزة (اختياري)" value="${CW?esc(CW.prize):''}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${CW&&CW.ended_at?'':'<button class="btn" style="flex:1" onclick="admWeekSave()">'+(CW?'💾 حفظ البيانات':'➕ إنشاء المسابقة')+'</button>'}
        ${CW&&!CW.ended_at?`<button class="btn" style="flex:1;${CW.active?'background:var(--card2);border:1px solid var(--line);color:var(--txt)':'background:var(--palm)'}" onclick="admWeekToggle()">${CW.active?'⏸️ إيقاف':'▶️ تفعيل للجمهور'}</button>`:''}
        ${CW&&CW.active?`<button class="btn" style="flex:1;background:var(--star);color:var(--ink)" onclick="admWeekEnd()">🏁 إنهاء وإعلان الفائز</button>`:''}
        ${CW&&CW.ended_at?`<button class="btn" style="flex:1;background:var(--palm)" onclick="admWeekNew()">➕ مسابقة جديدة</button>`:''}
        ${CW?`<button class="btn" style="flex:0 0 auto;background:var(--sadu)" onclick="admWeekDelete()">🗑️</button>`:''}
      </div>
    </div>
    <div style="font-weight:700;font-size:14px;margin-bottom:8px">اللقطات المرشحة (${entries.length}/5) <span style="font-size:11px;color:var(--txt-dim);font-weight:400">— رشّح من تبويب 🗂️ بزر 🏆</span></div>
    ${entries.length?entries.map(p=>`
      <div style="display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 13px;margin-bottom:8px">
        <div style="flex:1"><b style="font-size:13px">#${p.id} · ${esc(p.title)}</b></div>
        <button class="btn" style="font-size:12px;padding:7px 12px;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="admWeekRemove(${p.id})">إزالة</button>
      </div>`).join(''):'<div class="empty" style="padding:20px">ما فيه ترشيحات بعد</div>'}` + admChallengeBlock() + admVideoBlock() + admReelsSoonBlock() + admInspectBlock() + admCommBlock() + admCleanupBlock() + await admSpBlock() + admSponsorsBtn() + admSponsorSideBlock() +  admGoogleLoginBlock() + admMaintBlock() + await admTeamBlock();
}
/* ====== بنر الراعي ====== */
async function admSpBlock(){
  const r=await sb.from('site_banner').select('*').eq('id',1).maybeSingle();
  const b=r.data||{active:false,image_path:'',link_url:''};
  window.__SPB=b;
  window.__SPDATA=b;
  return `
  <div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin-top:16px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">📣 بنر الراعي (رأس الصفحة) ${b.active?'<span style="font-size:11px;color:var(--palm);font-weight:700">● ظاهر</span>':'<span style="font-size:11px;color:var(--txt-dim)">○ مخفي</span>'}</div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px;line-height:1.8">📐 مقاس التصميم: <b>1600 × 400 بكسل</b> (نسبة 4:1) · JPG أو PNG · يفضل أقل من 300KB</div>
    ${b.image_path?`<img src="${imgUrl(b.image_path)}" style="width:100%;aspect-ratio:4/1;object-fit:cover;border-radius:10px;border:1px solid var(--line);margin-bottom:10px">`:''}
    <input type="file" id="spFile" accept="image/*" style="display:none" onchange="admSpUpload(this.files[0])">
    <input id="spName" placeholder="اسم الراعي (مثال: متجر عدسة)" value="${esc(b.sponsor_name||'')}"/>
    <input id="spCat" placeholder="النشاط (مثال: معدات تصوير)" value="${esc(b.sponsor_cat||'')}"/>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <input id="spLat" placeholder="خط العرض (اختياري)" type="number" step="any" value="${b.sponsor_lat||''}" style="flex:1;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:10px 12px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;direction:ltr">
      <input id="spLng" placeholder="خط الطول (اختياري)" type="number" step="any" value="${b.sponsor_lng||''}" style="flex:1;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:10px 12px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;direction:ltr">
    </div>
    <textarea id="spDeal" placeholder="عرض الراعي (اختياري — مثال: خصم 15% على معدات التصوير)" rows="2" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:10px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;resize:none;margin-bottom:8px">${esc(b.sponsor_deal||'')}</textarea>
    <input id="spCode" placeholder="كود الخصم (اختياري — مثال: SOWRA15)" value="${esc(b.sponsor_code||'')}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px;direction:ltr;text-align:left;letter-spacing:1px">
    <input id="spLink" placeholder="رابط الراعي عند الضغط (اختياري)" value="${esc(b.link_url)}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:10px;direction:ltr;text-align:left">
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" style="flex:1" onclick="$('spFile').click()">📤 ${b.image_path?'تغيير الصورة':'رفع صورة البنر'}</button>
      <button class="btn" style="flex:1;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="admSpSaveLink()">💾 حفظ الرابط</button>
      ${b.image_path?`<button class="btn" style="flex:1;${b.active?'background:var(--card2);border:1px solid var(--line);color:var(--txt)':'background:var(--palm)'}" onclick="admSpToggle()">${b.active?'🙈 إخفاء':'👁️ تفعيل'}</button>`:''}
      ${b.image_path?`<button class="btn" style="flex:0 0 auto;background:var(--sadu)" onclick="admSpDelete()">🗑️ حذف</button>`:''}
    </div>
  </div>`;
}
async function admSpUpload(f){
  if(!f)return;
  toast('⏳ جاري رفع البنر...');
  const blob=await compressTo(f,1600,0.88);
  const path=`banners/sponsor_${Date.now()}.jpg`;
  const up=await sb.storage.from('photos').upload(path,blob,{contentType:'image/jpeg',cacheControl:'31536000'});
  if(up.error){toast('فشل الرفع: '+up.error.message,true);return}
  const {error}=await sb.from('site_banner').update({image_path:path,sponsor_name:$('spName').value.trim(),sponsor_cat:$('spCat').value.trim(),sponsor_lat:parseFloat($('spLat').value)||null,sponsor_lng:parseFloat($('spLng').value)||null,sponsor_deal:$('spDeal').value.trim(),sponsor_code:$('spCode').value.trim(),updated_at:new Date().toISOString()}).eq('id',1);
  if(error){toast('فشل الحفظ',true);return}
  toast('ارتفع البنر ✅ — فعّله متى ما جهزت');
  await loadAdmWeek();loadSponsor();
}
async function admSpSaveLink(){
  const {error}=await sb.from('site_banner').update({link_url:$('spLink').value.trim(),sponsor_name:$('spName').value.trim(),sponsor_cat:$('spCat').value.trim(),sponsor_lat:parseFloat($('spLat').value)||null,sponsor_lng:parseFloat($('spLng').value)||null,sponsor_deal:$('spDeal').value.trim(),sponsor_code:$('spCode').value.trim()}).eq('id',1);
  if(error){toast('فشل الحفظ',true);return}
  toast('انحفظ الرابط ✅');loadSponsor();
}
async function admSpToggle(){
  if(!needEditor('بنر الراعي'))return;
  const b=window.__SPB;
  const {error}=await sb.from('site_banner').update({active:!b.active}).eq('id',1);
  if(error){toast('فشلت العملية',true);return}
  toast(b.active?'اختفى البنر':'انطلق البنر برأس الصفحة 📣');
  await loadAdmWeek();loadSponsor();
}

async function admWeekSave(){
  const data={week_label:$('wkLabel').value.trim(),sponsor_name:$('wkSponsor').value.trim(),prize:$('wkPrize').value.trim()};
  const q=CW?sb.from('weekly_contest').update(data).eq('id',CW.id):sb.from('weekly_contest').insert({...data,active:false});
  const {error}=await q;
  if(error){toast('تعذر الحفظ: '+error.message,true);return}
  toast('انحفظت المسابقة ✅');await loadAdmWeek();await loadWeek();
}
async function admWeekToggle(){
  if(!needEditor('المسابقة'))return;
  const {error}=await sb.from('weekly_contest').update({active:!CW.active}).eq('id',CW.id);
  if(error){toast('فشلت العملية',true);return}
  toast(CW.active?'أُوقفت المسابقة':'انطلقت المسابقة للجمهور 🎉');
  await loadAdmWeek();await loadWeek();
}
async function admWeekAdd(pid){
  if(!CW){toast('أنشئ المسابقة أول من تبويب 🏆',true);return}
  if(CW.ended_at){toast('المسابقة منتهية — أنشئ جديدة من تبويب 🏆',true);return}
  const en=await sb.from('weekly_entries').select('photo_id').eq('contest_id',CW.id);
  if((en.data||[]).length>=5){toast('اكتمل العدد — 5 لقطات كحد أقصى',true);return}
  const {error}=await sb.from('weekly_entries').insert({contest_id:CW.id,photo_id:pid});
  if(error){toast(error.code==='23505'?'مرشحة من قبل':'تعذر الترشيح',true);return}
  toast('انضافت للترشيحات 🏆');
}
async function admWeekRemove(pid){
  await sb.from('weekly_entries').delete().eq('contest_id',CW.id).eq('photo_id',pid);
  toast('أُزيلت');await loadAdmWeek();
}

async function admWeekEnd(){
  const bd=await sb.from('weekly_board').select('*').eq('contest_id',CW.id);
  let win=null,mx=0;(bd.data||[]).forEach(r=>{if(r.votes>mx){mx=r.votes;win=r.photo_id}});
  if(!win){if(!confirm('ما فيه أصوات بعد — إنهاء المسابقة بدون فائز؟'))return}
  else if(!confirm('إنهاء المسابقة وإعلان الفائز؟ يظهر التتويج بالرئيسية لمدة أسبوع.'))return;
  const {error}=await sb.from('weekly_contest').update({active:false,ended_at:new Date().toISOString(),winner_photo_id:win}).eq('id',CW.id);
  if(error){toast('فشل الإنهاء: '+error.message,true);return}
  toast(win?'أُعلن الفائز — مبروك للمتوّج 👑':'أُنهيت المسابقة');
  await loadAdmWeek();await loadWeek();
}
async function admWeekNew(){
  const {error}=await sb.from('weekly_contest').insert({active:false});
  if(error){toast('تعذر الإنشاء',true);return}
  toast('مسابقة جديدة جاهزة للتجهيز ✨');
  await loadAdmWeek();
}

async function admSpDelete(){
  if(!needEditor('حذف الراعي'))return;
  const b=window.__SPB;
  if(!confirm('حذف بنر الراعي نهائياً؟ الصورة تنمسح من المخزن والإعدادات تتصفّر.'))return;
  if(b.image_path)await sb.storage.from('photos').remove([b.image_path]).catch(()=>{});
  const {error}=await sb.from('site_banner').update({active:false,image_path:'',link_url:''}).eq('id',1);
  if(error){toast('فشل الحذف',true);return}
  toast('انحذف البنر نهائياً 🗑️');
  await loadAdmWeek();loadSponsor();
}

async function admWeekDelete(){
  if(!needEditor('حذف الجولة'))return;
  if(!confirm(`حذف مسابقة «${CW.week_label||'بلا وسم'}» نهائياً؟ تنمسح بترشيحاتها وأصواتها، ويختفي أي تتويج مرتبط بها من الرئيسية.`))return;
  const {error}=await sb.from('weekly_contest').delete().eq('id',CW.id);
  if(error){toast('فشل الحذف: '+error.message,true);return}
  toast('انحذفت المسابقة 🗑️');
  await loadAdmWeek();await loadWeek();
}

async function admClearBadges(pid){
  const pick=prompt(
'مسح أوسمة الصورة #'+pid+' — اكتب الرقم:\n\n'+
'0 = الكل (تصفير شامل)\n'+
'1 = 📱 تصلح خلفية شاشة\n'+
'2 = ❤️ بحطها خلفية جوالي\n'+
'3 = 🌍 مسابقات عالمية\n'+
'4 = 🇸🇦 واجهة تشرّف السعودية\n'+
'5 = 🖼️ تستاهل تنطبع لوحة','0');
  if(pick===null)return;
  const keys={1:'wall',2:'mine',3:'global',4:'face',5:'print'};
  let q=sb.from('badge_votes').delete().eq('photo_id',pid);
  const k=keys[pick.trim()];
  if(pick.trim()!=='0'&&!k){toast('اكتب رقماً من 0 إلى 5',true);return}
  if(k)q=q.eq('badge_key',k);
  const {error}=await q;
  if(error){toast('فشل المسح: '+error.message,true);return}
  toast(k?'انمسح الوسام المحدد 🗳️':'انصفرت كل أوسمة الصورة 🗳️');
  await loadPhotos();openAdmin();
}

/* ====== وضع الصيانة ====== */
function admSponsorsBtn(){
  const b=window.__SPB||{};
  const on=!!b.sponsors_btn;
  return `<div style="background:var(--card);border:1.5px solid ${on?'var(--qblue)':'var(--line)'};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">🤝 زر الرعاة بالرئيسية <span style="font-size:11px;font-weight:700;color:${on?'var(--qblue)':'var(--txt-dim)'}">${on?'● ظاهر':'○ مخفي'}</span></div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px">زر «🤝 الرعاة» في قائمة الفلتر.</div>
    <button class="btn" style="width:100%;${on?'background:var(--sadu)':'background:var(--qblue)'}" onclick="admSponsorsBtnToggle()">${on?'🙈 إخفاء زر الرعاة':'👁️ إظهار زر الرعاة'}</button>
  </div>`;
}
async function admSponsorsBtnToggle(){
  if(!needEditor('صفحة الرعاة'))return;
  const b=window.__SPB||{};
  const{error}=await sb.from('site_banner').update({sponsors_btn:!b.sponsors_btn}).eq('id',1);
  if(error){toast('فشلت العملية',true);return}
  toast(!b.sponsors_btn?'زر الرعاة ظاهر 🤝':'اختفى الزر');
  await loadAdmWeek();await loadSponsor();
}
function admSponsorSideBlock(){
  const b=window.__SPB||{};
  const on=!!b.side_active;
  return `
  <div style="background:var(--card);border:1.5px solid ${on?'var(--palm)':'var(--line)'};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">📌 بطاقة الراعي بالرئيسية ${on?'<span style="font-size:11px;color:var(--palm);font-weight:700">● ظاهرة</span>':'<span style="font-size:11px;color:var(--txt-dim)">○ مخفية</span>'}</div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px">البطاقة الصغيرة (الاسم + النشاط) التي تظهر فوق الصور بالرئيسية.</div>
    <button class="btn" style="width:100%;${on?'background:var(--sadu)':'background:var(--palm)'}" onclick="admSideBannerToggle()">${on?'🙈 إخفاء البطاقة':'👁️ إظهار البطاقة بالرئيسية'}</button>
  </div>`;
}
async function admSideBannerToggle(){
  if(!needEditor('البطاقة الجانبية'))return;
  const b=window.__SPB||{};
  const {error}=await sb.from('site_banner').update({side_active:!b.side_active}).eq('id',1);
  if(error){toast('فشلت العملية: '+error.message,true);return}
  toast(!b.side_active?'البطاقة ظاهرة بالرئيسية 📌':'اختفت البطاقة');
  await loadSponsor();await loadAdmWeek();
}
function admGoogleLoginBlock(){
  const b=window.__SPB||{};
  const on=!!b.google_login;
  return `<div style="background:var(--card);border:1.5px solid ${on?'var(--qblue)':'var(--line)'};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">🔵 تسجيل الدخول بـ Google <span style="font-size:11px;font-weight:700;color:${on?'var(--qblue)':'var(--txt-dim)'}">${on?'● مفعّل للجميع':'○ مطفأ'}</span></div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px">يظهر زر Google لكل الزوار في صفحة الحساب.</div>
    <button class="btn" style="width:100%;${on?'background:var(--sadu)':'background:var(--qblue)'}" onclick="admGoogleToggle()">${on?'🙈 إخفاء الزر':'👁️ إظهار زر Google'}</button>
  </div>`;
}
async function admGoogleToggle(){
  if(!needOwner('مفاتيح الدخول'))return;
  const b=window.__SPB||{};
  const {error}=await sb.from('site_banner').update({google_login:!b.google_login}).eq('id',1);
  if(error){toast('فشلت العملية: '+error.message,true);return}
  toast(!b.google_login?'زر Google ظاهر للجميع 🔵':'اختفى الزر');
  await loadSponsor();await loadAdmWeek();
}
function admMaintBlock(){
  const b=window.__SPB||{};
  const on=!!b.maintenance;
  return `
  <div style="background:var(--card);border:1.5px solid ${on?'var(--star)':'var(--line)'};border-radius:14px;padding:14px;margin-top:16px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">🚧 وضع الصيانة (تحت الإنشاء) ${on?'<span style="font-size:11px;color:#A87500;font-weight:700">● مفعل — الزوار محجوبون</span>':'<span style="font-size:11px;color:var(--txt-dim)">○ مطفأ</span>'}</div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px;line-height:1.8">عند التفعيل: الزوار يشوفون صفحة «تحت التطوير» — وأنت كمشرف تتصفح وتشتغل عادي.</div>
    <input id="mtMsg" placeholder="رسالة اختيارية للزوار (مثال: نرجع لكم الساعة 9)" value="${esc(b.maintenance_msg||'')}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:10px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="admMaintSaveMsg()">💾 حفظ الرسالة</button>
      <button class="btn" style="flex:1;${on?'background:var(--palm)':'background:var(--star);color:var(--ink)'}" onclick="admMaintToggle()">${on?'▶️ إعادة فتح الموقع':'🚧 تفعيل الصيانة'}</button>
    </div>
  </div>`;
}
async function admMaintToggle(){
  if(!needOwner('ستارة الصيانة'))return;
  const b=window.__SPB||{};
  const to=!b.maintenance;
  if(to&&!confirm('تفعيل وضع الصيانة؟ كل الزوار (عدا المشرفين) بيشوفون صفحة تحت التطوير.'))return;
  const {error}=await sb.from('site_banner').update({maintenance:to,maintenance_msg:$('mtMsg').value.trim()}).eq('id',1);
  if(error){toast('فشلت العملية: '+error.message,true);return}
  toast(to?'الموقع دخل وضع الصيانة 🚧':'الموقع رجع مفتوحاً للجميع 🎉');
  await loadAdmWeek();
}
async function admMaintSaveMsg(){
  const {error}=await sb.from('site_banner').update({maintenance_msg:$('mtMsg').value.trim()}).eq('id',1);
  if(error){toast('فشل الحفظ',true);return}
  toast('انحفظت الرسالة ✅');
}

/* ====== تحدي الأسبوع ====== */
function admChallengeBlock(){
  const c=window.__CH||{};
  const on=!!c.active;
  return `<div style="background:var(--card);border:1.5px solid ${on?'var(--qblue)':'var(--line)'};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">🎯 تحدي الأسبوع <span style="font-size:11px;font-weight:700;color:${on?'var(--qblue)':'var(--txt-dim)'}">${on?'● نشط':'○ مطفأ'}</span></div>
    <input id="chTitle" placeholder="موضوع التحدي (مثال: الأبواب القديمة)" value="${esc(c.title||'')}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
    <input id="chHint" placeholder="وصف أو تلميح (اختياري)" value="${esc(c.hint||'')}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
    <input id="chEnds" type="date" value="${c.ends_at||''}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
    <div style="font-size:11.5px;color:var(--txt-dim);margin:10px 0 6px">توجيه التحدي (اختياري)</div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <select id="chRegion" style="flex:1;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px;color:var(--txt);font-family:'Tajawal';font-size:12.5px;outline:none">
        <option value="">كل المناطق</option>
        ${['الرياض','مكة المكرمة','المدينة المنورة','القصيم','الشرقية','عسير','تبوك','حائل','الحدود الشمالية','جازان','نجران','الباحة','الجوف'].map(r=>`<option value="${r}" ${c.region===r?'selected':''}>${r}</option>`).join('')}
      </select>
      <select id="chCat" style="flex:1;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px;color:var(--txt);font-family:'Tajawal';font-size:12.5px;outline:none">
        <option value="">كل التصنيفات</option>
        ${[['nature','🌿 طبيعة'],['arch','🏛️ عمارة'],['wildlife','🦅 طيور'],['people','👥 أشخاص'],['bw','⬛ أبيض وأسود'],['landmark','🕌 معلم'],['heritage','🏺 تراث']].map(x=>`<option value="${x[0]}" ${c.cat===x[0]?'selected':''}>${x[1]}</option>`).join('')}
      </select>
    </div>
    <input id="chPrize" placeholder="الجائزة أو الحافز (اختياري)" value="${esc(c.prize||'')}" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:10px">
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
      <button class="btn" style="flex:1;font-size:12px;padding:9px;${on?'background:var(--sadu)':'background:var(--qblue)'}" onclick="admChToggle()">${on?'🙈 إيقاف':'▶️ تفعيل'}</button>
    </div>
  </div>`;
}
async function admChSave(){
  const {error}=await sb.from('challenge').update({
    title:$('chTitle').value.trim(),
    hint:$('chHint').value.trim(),
    ends_at:$('chEnds').value||null,
    region:$('chRegion')?$('chRegion').value:'',
    cat:$('chCat')?$('chCat').value:'',
    prize:$('chPrize')?$('chPrize').value.trim():'',
    updated_at:new Date().toISOString()
  }).eq('id',1);
  if(error){toast('فشل الحفظ: '+error.message,true);return}
  toast('انحفظ التحدي ✅');
  await loadChallenge();await loadAdmWeek();
}
async function admChToggle(){
  const c=window.__CH||{};
  if(!c.active&&!$('chTitle').value.trim()){toast('اكتب موضوع التحدي أولاً',true);return}
  const {error}=await sb.from('challenge').update({active:!c.active}).eq('id',1);
  if(error){toast('فشلت العملية',true);return}
  toast(!c.active?'التحدي نشط 🎯':'اتوقف التحدي');
  await loadChallenge();await loadAdmWeek();
}

/* ====== إدارة كنوز الديرة ====== */
let ADMQ=[],ADMQS={};

async function loadAdmQuests(){
  const el=$('admQs');if(!el)return;
  el.innerHTML='<div class="loader">⏳</div>';
  const q=await sb.from('quests').select('*').order('created_at',{ascending:false});
  ADMQ=q.data||[];
  const s=await sb.from('quest_stops').select('*');
  ADMQS={};
  (s.data||[]).forEach(x=>{(ADMQS[x.quest_id]=ADMQS[x.quest_id]||[]).push(x)});
  const c=await sb.from('quest_completions').select('quest_id');
  const done={};
  (c.data||[]).forEach(x=>{done[x.quest_id]=(done[x.quest_id]||0)+1});

  el.innerHTML=`
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
    <input id="qEnds" type="date" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
    <button class="btn" style="width:100%" onclick="qCreate()">➕ إنشاء الرحلة</button>
  </div>
  ${ADMQ.length?ADMQ.map(q=>{
    const stops=ADMQS[q.id]||[];
    return `<div style="background:var(--card);border:1.5px solid ${q.active?'var(--palm)':'var(--line)'};border-radius:14px;padding:14px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-weight:700;font-size:15px">${q.badge_icon||'🏆'} ${esc(q.title)}</div>
        <span style="font-size:11px;font-weight:700;color:${q.active?'var(--palm)':'var(--txt-dim)'}">${q.active?'● نشطة':'○ مسودة'}</span>
      </div>
      <div style="font-size:12px;color:var(--txt-dim);margin-bottom:8px">${stops.length} كنز · ${done[q.id]||0} أكملوها${q.region?' · '+esc(q.region):''}</div>
      <div style="margin:8px 0">${stops.map(s=>{
        const ph=photos.find(p=>p.id===s.photo_id);
        return `<div style="display:flex;align-items:center;gap:8px;background:var(--card2);border-radius:10px;padding:7px 10px;margin-bottom:5px;font-size:12px">
          <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ph?esc(ph.title):'#'+s.photo_id}</span>
          <button onclick="qDelStop(${s.id})" style="background:none;border:none;cursor:pointer;font-size:13px">🗑️</button>
        </div>`;
      }).join('')||'<div style="font-size:12px;color:var(--txt-dim)">أضف كنوزاً من تبويب 🗂️ الصور</div>'}</div>
      <div style="display:flex;gap:8px">
        <button class="btn" style="flex:1;font-size:12px;padding:8px;${q.active?'background:var(--sadu)':'background:var(--palm)'}" onclick="qToggle(${q.id},${q.active})">${q.active?'🙈 إيقاف':'▶️ تفعيل'}</button>
        <button class="btn" style="flex:1;font-size:12px;padding:8px;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="qDelete(${q.id})">🗑️ حذف</button>
      </div>
    </div>`;
  }).join(''):'<div class="empty" style="padding:20px">ما فيه رحلات بعد</div>'}`;
  renderQIcons();
}

const QICONS=['🏆','🏔️','🕌','🌅','🐪','🌴','🏜️','🌊','⛰️','🗝️','🎖️','🌙','⭐','🦅','🏛️','🌾'];

function renderQIcons(){
  const el=$('qIcons');if(!el)return;
  const cur=$('qIcon')?$('qIcon').value:'🏆';
  el.innerHTML='';
  QICONS.forEach(ic=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='q-icon'+(ic===cur?' on':'');
    b.textContent=ic;
    b.onclick=()=>{if($('qIcon'))$('qIcon').value=ic;renderQIcons()};
    el.appendChild(b);
  });
}

async function qCreate(){
  if(!needEditor('الكنوز'))return;
  const title=$('qTitle').value.trim();
  if(!title){toast('اكتب اسم الرحلة',true);return}
  const {error}=await sb.from('quests').insert({
    title,subtitle:$('qSub').value.trim(),badge_icon:$('qIcon').value.trim()||'🏆',
    badge_name:$('qBadge').value.trim(),region:$('qRegion').value.trim(),
    sponsor:$('qSponsor').value.trim(),prize:$('qPrize').value.trim(),
    ends_at:$('qEnds').value||null
  });
  if(error){toast('فشل: '+error.message,true);return}
  toast('انشئت الرحلة 🗝️');loadAdmQuests();
}
async function qToggle(id,cur){
  const {error}=await sb.from('quests').update({active:!cur}).eq('id',id);
  if(error){toast('فشلت العملية',true);return}
  toast(!cur?'الرحلة نشطة 🗝️':'اتوقفت الرحلة');loadAdmQuests();
}
async function qDelete(id){
  if(!confirm('حذف الرحلة وكنوزها؟'))return;
  await sb.from('quests').delete().eq('id',id);
  toast('انحذفت');loadAdmQuests();
}
async function qDelStop(sid){
  await sb.from('quest_stops').delete().eq('id',sid);
  loadAdmQuests();
}
async function admAddToQuest(pid){
  if(!ADMQ.length){await loadAdmQuests();}
  if(!ADMQ.length){toast('أنشئ رحلة أولاً من تبويب 🗝️',true);return}
  const list=ADMQ.map((q,i)=>`${i+1} = ${q.title} (${(ADMQS[q.id]||[]).length} كنز)`).join('\n');
  const pick=prompt('أضف الصورة لأي رحلة؟\n\n'+list);
  if(pick===null)return;
  const idx=parseInt(pick.trim())-1;
  if(isNaN(idx)||!ADMQ[idx]){toast('رقم غير صحيح',true);return}
  const {error}=await sb.from('quest_stops').insert({quest_id:ADMQ[idx].id,photo_id:pid});
  if(error){toast(error.code==='23505'?'موجودة بالرحلة':'فشلت الإضافة',true);return}
  toast('انضافت لـ'+ADMQ[idx].title+' 🗝️');
  loadAdmQuests();
}

/* ====== تفعيل رفع الفيديو ====== */
function admVideoBlock(){
  const b=window.__SPDATA||window.__SPB||{};
  const on=!!b.video_enabled;
  return `<div style="background:var(--card);border:1.5px solid ${on?'var(--qblue)':'var(--line)'};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">🎬 رفع الفيديوهات <span style="font-size:11px;font-weight:700;color:${on?'var(--qblue)':'var(--txt-dim)'}">${on?'● مفعّل':'○ مطفأ'}</span></div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px">يظهر خيار «فيديو قصير» بصفحة النشر. ⚠️ الفيديو يستهلك التخزين بسرعة.</div>
    <button class="btn" style="width:100%;${on?'background:var(--sadu)':'background:var(--qblue)'}" onclick="admVideoToggle()">${on?'🙈 إيقاف الفيديو':'▶️ تفعيل الفيديو'}</button>
  </div>`;
}
async function admVideoToggle(){
  if(!needOwner('مفتاح الفيديو'))return;
  const b=window.__SPDATA||window.__SPB||{};
  const nv=!b.video_enabled;
  const {error}=await sb.from('site_banner').update({video_enabled:nv}).eq('id',1);
  if(error){toast('فشلت العملية: '+error.message,true);return}
  if(window.__SPB)window.__SPB.video_enabled=nv;
  if(window.__SPDATA)window.__SPDATA.video_enabled=nv;
  toast(nv?'رفع الفيديو مفعّل 🎬':'اتوقف رفع الفيديو');
  await loadSponsor();
  await loadAdmWeek();
  try{if(typeof initVideoUpload==='function')initVideoUpload()}catch(e){}
}

/* ====== وضع «قريباً» للأضواء ====== */
function admReelsSoonBlock(){
  const b=window.__SPDATA||window.__SPB||{};
  const on=!!b.reels_soon;
  return `<div style="background:var(--card);border:1.5px solid ${on?'var(--star)':'var(--line)'};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">🎬 أضواء الديرة — وضع «قريباً» <span style="font-size:11px;font-weight:700;color:${on?'var(--star)':'var(--txt-dim)'}">${on?'● مفعّل':'○ مطفأ'}</span></div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px;line-height:1.85">لما يكون مفعّلاً، التبويب يعرض شاشة تشويق بدل المقاطع — <b>ويتوقف رفع الفيديو تلقائياً</b> لأن المقطع لن يظهر لأحد.</div>
    <button class="btn" style="width:100%;${on?'background:var(--palm)':'background:var(--star);color:var(--ink)'}" onclick="admReelsSoonToggle()">${on?'▶️ افتح الأضواء للجميع':'🎬 فعّل وضع «قريباً»'}</button>
  </div>`;
}

async function admReelsSoonToggle(){
  if(!needOwner('مفتاح الأضواء'))return;
  const b=window.__SPDATA||window.__SPB||{};
  const nv=!b.reels_soon;
  const {error}=await sb.from('site_banner').update({reels_soon:nv}).eq('id',1);
  if(error){toast('فشلت العملية: '+error.message,true);return}
  // تحديث محلي فوري للمصدرين
  if(window.__SPB)window.__SPB.reels_soon=nv;
  if(window.__SPDATA)window.__SPDATA.reels_soon=nv;
  toast(nv?'وضع «قريباً» مفعّل 🎬':'الأضواء مفتوحة للجميع ✅');
  await loadSponsor();
  await loadAdmWeek();
  // تحديث عناصر الفيديو فوراً
  try{if(typeof initVideoUpload==='function')initVideoUpload()}catch(e){}
}

/* ====== تنظيف الملفات اليتيمة ====== */
let ORPHANS={v:[],p:[]};

function admCleanupBlock(){
  return `<div style="background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">🧹 تنظيف التخزين</div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px">الملفات اليتيمة: موجودة بالتخزين وما لها صف بالقاعدة.</div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button class="btn" style="flex:1;font-size:12px;padding:9px;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="admScanOrphans('videos')">🎬 فحص الفيديو</button>
      <button class="btn" style="flex:1;font-size:12px;padding:9px;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="admScanOrphans('photos')">🖼️ فحص الصور</button>
    </div>
    <button class="btn" style="width:100%;font-size:12px;padding:9px;background:var(--qblue)" onclick="admScanOrphans('all')">🔍 فحص الكل</button>
    <div id="cleanResult" style="font-size:12px;color:var(--txt-dim);margin-top:10px;line-height:1.9"></div>
  </div>`;
}

async function admScanOrphans(mode){
  const box=$('cleanResult');
  if(box)box.innerHTML='⏳ نفحص...';
  ORPHANS={v:[],p:[]};
  try{
    const r=await sb.from('photos').select('image_path,media_type');
    if(r.error){if(box)box.innerHTML='⚠️ تعذر قراءة القاعدة: '+r.error.message;return}
    const rows=r.data||[];
    // حماية: لا نفحص لو القاعدة رجعت فاضية (خطر حذف كل شيء)
    if(!rows.length){if(box)box.innerHTML='⚠️ القاعدة رجعت فاضية — أُوقف الفحص حمايةً للملفات';return}
    const keepVid=new Set(rows.filter(x=>x.media_type==='video').map(x=>x.image_path));
    const keepImg=new Set();
    rows.filter(x=>x.media_type!=='video').forEach(x=>{
      keepImg.add(x.image_path);
      keepImg.add(x.image_path.replace('.jpg','_t.jpg'));
    });
    // بنر الراعي وملفات الإدارة — مسجّلة بجداول أخرى
    try{
      const sbn=await sb.from('site_banner').select('image_path').eq('id',1).maybeSingle();
      if(sbn.data&&sbn.data.image_path)keepImg.add(sbn.data.image_path);
    }catch(e){}

    if(mode==='videos'||mode==='all'){
      const uv=await listBucketAll('videos');
      ORPHANS.v=uv.filter(p=>!keepVid.has(p));
    }
    if(mode==='photos'||mode==='all'){
      const up=await listBucketAll('photos');
      ORPHANS.p=up.filter(p=>!keepImg.has(p)&&!p.startsWith('banners/')&&!p.startsWith('admin/'));
    }

    const tv=ORPHANS.v.length, tp=ORPHANS.p.length, tot=tv+tp;
    if(!tot){if(box)box.innerHTML='✅ نظيف — ما فيه ملفات يتيمة';return}

    let html=(tp>keepImg.size?'<div style="background:#FFF4D6;border:1px solid var(--star);border-radius:8px;padding:8px 11px;margin-bottom:8px;font-size:11.5px;line-height:1.8">⚠️ العدد أكبر من المسجّل — راجع القائمة بعناية قبل الحذف</div>':'')
      +'<div style="font-weight:700;color:var(--sadu);margin-bottom:6px">لقينا '+tot+' ملفاً يتيماً:</div>'
      +'<div style="font-size:11px;color:var(--txt-dim);margin-bottom:8px">(قُرئ '+rows.length+' صفاً من القاعدة · '+keepVid.size+' فيديو · '+keepImg.size+' مسار صورة)</div>';
    if(tv){
      html+='<div style="margin-bottom:6px"><b>🎬 فيديو ('+tv+'):</b></div>';
      html+=ORPHANS.v.map(x=>'<div style="background:var(--card2);border-radius:8px;padding:5px 9px;margin-bottom:4px;font-size:11px;direction:ltr;text-align:left;word-break:break-all">'+esc(x)+'</div>').join('');
      html+='<button class="btn" style="width:100%;font-size:12px;padding:8px;margin:6px 0;background:var(--sadu)" onclick="admDelOrphans(\'v\')">🗑️ احذف الفيديوهات اليتيمة ('+tv+')</button>';
    }
    if(tp){
      html+='<div style="margin:8px 0 6px"><b>🖼️ صور ('+tp+'):</b></div>';
      html+=ORPHANS.p.map(x=>'<div style="background:var(--card2);border-radius:8px;padding:5px 9px;margin-bottom:4px;font-size:11px;direction:ltr;text-align:left;word-break:break-all">'+esc(x)+'</div>').join('');
      html+='<button class="btn" style="width:100%;font-size:12px;padding:8px;margin:6px 0;background:var(--sadu)" onclick="admDelOrphans(\'p\')">🗑️ احذف الصور اليتيمة ('+tp+')</button>';
    }
    html+='<div style="font-size:11px;color:var(--txt-dim);margin-top:6px">⚠️ راجع القائمة قبل الحذف — العملية نهائية</div>';
    if(box)box.innerHTML=html;
  }catch(e){
    if(box)box.innerHTML='⚠️ تعذر الفحص: '+(e.message||'');
  }
}

async function admDelOrphans(kind){
  const list=kind==='v'?ORPHANS.v:ORPHANS.p;
  const bucket=kind==='v'?'videos':'photos';
  if(!list.length)return;
  if(!confirm('حذف '+list.length+' ملفاً نهائياً من دلو '+bucket+'؟'))return;
  const box=$('cleanResult');
  if(box)box.innerHTML='⏳ نحذف...';
  let done=0;
  try{
    for(let i=0;i<list.length;i+=50){
      const chunk=list.slice(i,i+50);
      const {error}=await sb.storage.from(bucket).remove(chunk);
      if(error)throw error;
      done+=chunk.length;
    }
    if(kind==='v')ORPHANS.v=[];else ORPHANS.p=[];
    if(box)box.innerHTML='✅ انحذف '+done+' ملفاً';
    toast('انتهى التنظيف 🧹');
  }catch(e){
    if(box)box.innerHTML='⚠️ انحذف '+done+' — توقف: '+(e.message||'');
  }
}

/* سرد كل ملفات دلو (يمشي على مجلدات المستخدمين) */
async function listBucketAll(bucket){
  const out=[];
  const skip=n=>!n||n.startsWith('.')||n==='.emptyFolderPlaceholder';
  const root=await sb.storage.from(bucket).list('',{limit:1000});
  const folders=(root.data||[]).filter(x=>!x.id);
  const files=(root.data||[]).filter(x=>x.id);
  files.forEach(f=>{if(!skip(f.name))out.push(f.name)});
  for(const fo of folders){
    const sub=await sb.storage.from(bucket).list(fo.name,{limit:1000});
    (sub.data||[]).forEach(f=>{if(f.id&&!skip(f.name))out.push(fo.name+'/'+f.name)});
  }
  return out;
}

/* ====== مكتبة الموسيقى ====== */
let MUSIC=[];

async function loadAdmMusic(){
  const el=$('admMu');if(!el)return;
  el.innerHTML='<div class="loader">⏳</div>';
  const r=await sb.from('music').select('*').order('created_at',{ascending:false});
  MUSIC=r.data||[];
  el.innerHTML=`
  <div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:14px">
    <div style="font-weight:700;font-size:14px;margin-bottom:8px">🎵 إضافة مقطع</div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px">MP3 خالٍ من الحقوق · حتى 5 ميجا · يُفضّل 30-60 ثانية</div>
    <input id="muName" placeholder="اسم المقطع (مثال: عود هادئ)" style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;color:var(--txt);font-family:'Tajawal';font-size:13px;outline:none;margin-bottom:8px">
    <input type="file" id="muFile" accept="audio/*,.mp3,.m4a,.wav" style="display:none" onchange="muPicked()">
    <button class="btn" style="width:100%;background:var(--card2);border:1.5px dashed var(--line);color:var(--txt);margin-bottom:8px" onclick="document.getElementById('muFile').click()">📁 <span id="muFileName">اختر ملف صوتي</span></button>
    <button class="btn" style="width:100%" id="muUpBtn" onclick="muUpload()">📤 رفع المقطع</button>
  </div>
  ${MUSIC.length?MUSIC.map(m=>`
    <div style="background:var(--card);border:1.5px solid ${m.active?'var(--palm)':'var(--line)'};border-radius:14px;padding:12px 14px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:20px">🎵</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(m.name)}</div>
          <div style="font-size:11px;color:${m.active?'var(--palm)':'var(--txt-dim)'};font-weight:700">${m.active?'● متاح للأعضاء':'○ مخفي'}</div>
        </div>
      </div>
      <audio controls preload="none" src="${muUrl(m.path)}" style="width:100%;height:36px;margin-bottom:8px"></audio>
      <div style="display:flex;gap:8px">
        <button class="btn" style="flex:1;font-size:12px;padding:7px;${m.active?'background:var(--sadu)':'background:var(--palm)'}" onclick="muToggle(${m.id},${m.active})">${m.active?'🙈 إخفاء':'▶️ إتاحة'}</button>
        <button class="btn" style="flex:1;font-size:12px;padding:7px;background:var(--card2);border:1px solid var(--line);color:var(--txt)" onclick="muDelete(${m.id},'${m.path}')">🗑️ حذف</button>
      </div>
    </div>`).join(''):'<div class="empty" style="padding:20px">ما فيه مقاطع بعد</div>'}`;
}

function muUrl(path){return sb.storage.from('music').getPublicUrl(path).data.publicUrl}

async function muUpload(){
  const name=$('muName').value.trim();
  const f=$('muFile').files[0];
  if(!name){toast('اكتب اسم المقطع',true);return}
  if(!f){toast('اختر ملف MP3',true);return}
  if(f.size>5*1024*1024){toast('الملف كبير — الحد 5 ميجا',true);return}
  const btn=$('muUpBtn');btn.disabled=true;btn.textContent='⏳ نرفع...';
  try{
    const ext=(f.name.split('.').pop()||'mp3').toLowerCase();
    const path=Date.now()+'.'+ext;
    const up=await sb.storage.from('music').upload(path,f,{contentType:f.type||'audio/mpeg',cacheControl:'31536000'});
    if(up.error)throw up.error;
    const ins=await sb.from('music').insert({name,path});
    if(ins.error){await sb.storage.from('music').remove([path]).catch(()=>{});throw ins.error}
    $('muName').value='';$('muFile').value='';
    toast('انرفع المقطع 🎵');
    loadAdmMusic();
  }catch(e){toast('فشل الرفع: '+(e.message||''),true)}
  finally{btn.disabled=false;btn.textContent='📤 رفع المقطع'}
}

async function muToggle(id,cur){
  const {error}=await sb.from('music').update({active:!cur}).eq('id',id);
  if(error){toast('فشلت العملية',true);return}
  toast(!cur?'المقطع متاح 🎵':'اختفى المقطع');
  loadAdmMusic();
}

async function muDelete(id,path){
  if(!confirm('حذف المقطع نهائياً؟'))return;
  await sb.from('music').delete().eq('id',id);
  try{await sb.storage.from('music').remove([path])}catch(e){}
  toast('انحذف المقطع');
  loadAdmMusic();
}

function muPicked(){
  const f=$('muFile').files[0];
  const lbl=$('muFileName');
  if(lbl)lbl.textContent=f?(f.name+' · '+Math.round(f.size/1024)+' كيلو'):'اختر ملف صوتي';
}

/* ====== الصور المتاحة تجارياً ====== */
async function loadCommercial(){
  const el=$('admSt');if(!el)return;
  try{
    const r=await sb.from('photos_ranked').select('id,title,city,region,photographer,image_path,avg_stars,commercial')
      .eq('commercial',true).eq('visibility','public').order('avg_stars',{ascending:false});
    const list=r.data||[];
    const box=document.createElement('div');
    box.style.cssText='background:var(--card);border:1.5px solid var(--palm);border-radius:14px;padding:14px;margin-top:14px';
    box.innerHTML='<div style="font-weight:700;font-size:14px;margin-bottom:6px">💼 متاحة للاستخدام التجاري <span style="color:var(--palm)">'+list.length+'</span></div>'
      +'<div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px;line-height:1.8">صور وافق أصحابها على عرضها للجهات — تواصل معهم عند أي طلب</div>'
      +(list.length?list.slice(0,20).map(p=>
        '<div style="display:flex;align-items:center;gap:9px;background:var(--card2);border-radius:10px;padding:7px 10px;margin-bottom:5px;font-size:12px">'
        +'<img src="'+thumbUrl(p.image_path)+'" style="width:34px;height:34px;border-radius:8px;object-fit:cover">'
        +'<span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(p.title)+' <span style="color:var(--txt-dim)">· '+esc(p.photographer||'')+'</span></span>'
        +'<span style="color:var(--star);font-weight:700">★ '+Number(p.avg_stars).toFixed(1)+'</span></div>'
      ).join(''):'<div style="font-size:12px;color:var(--txt-dim)">ما فيه صور بعد</div>');
    el.appendChild(box);
  }catch(e){}
}

/* ====== تفعيل الاستخدام التجاري ====== */
function admCommBlock(){
  const b=window.__SPB||{};
  const on=!!b.commercial_enabled;
  return `<div style="background:var(--card);border:1.5px solid ${on?'var(--palm)':'var(--line)'};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">💼 الاستخدام التجاري <span style="font-size:11px;font-weight:700;color:${on?'var(--palm)':'var(--txt-dim)'}">${on?'● مفعّل':'○ مطفأ'}</span></div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px;line-height:1.8">يظهر للمصور خيار الموافقة على عرض صورته للجهات. فعّله حين تجهز لاستقبال الطلبات.</div>
    <button class="btn" style="width:100%;${on?'background:var(--sadu)':'background:var(--palm)'}" onclick="admCommToggle()">${on?'🙈 إخفاء الخيار':'▶️ تفعيل الخيار'}</button>
  </div>`;
}
async function admCommToggle(){
  if(!needOwner('الاستخدام التجاري'))return;
  const b=window.__SPB||{};
  const {error}=await sb.from('site_banner').update({commercial_enabled:!b.commercial_enabled}).eq('id',1);
  if(error){toast('فشلت العملية: '+error.message,true);return}
  toast(!b.commercial_enabled?'ظهر خيار الاستخدام التجاري 💼':'اختفى الخيار');
  await loadSponsor();await loadAdmWeek();
}

/* ====== الفاحص الذكي ====== */
function admInspectBlock(){
  const b=window.__SPB||{};
  const on=!!b.inspect_enabled;
  return `<div style="background:var(--card);border:1.5px solid ${on?'var(--qteal)':'var(--line)'};border-radius:14px;padding:14px;margin-top:12px">
    <div style="font-weight:700;font-size:14px;margin-bottom:6px">🤖 الفاحص الذكي <span style="font-size:11px;font-weight:700;color:${on?'var(--qteal)':'var(--txt-dim)'}">${on?'● مفعّل':'○ مطفأ'}</span></div>
    <div style="font-size:11.5px;color:var(--txt-dim);margin-bottom:10px;line-height:1.8">يفحص كل صورة قبل النشر: يمنع المخالف، وينبّه على الوجوه ولوحات المركبات، ويقترح التصنيف. التكلفة ~$0.1 لكل 1000 صورة.</div>
    <button class="btn" style="width:100%;${on?'background:var(--sadu)':'background:var(--qteal)'}" onclick="admInspectToggle()">${on?'🙈 إيقاف الفاحص':'▶️ تفعيل الفاحص'}</button>
  </div>`;
}
async function admInspectToggle(){
  if(!needOwner('الفاحص الذكي'))return;
  const b=window.__SPB||{};
  const {error}=await sb.from('site_banner').update({inspect_enabled:!b.inspect_enabled}).eq('id',1);
  if(error){toast('فشلت العملية: '+error.message,true);return}
  toast(!b.inspect_enabled?'الفاحص الذكي مفعّل 🤖':'اتوقف الفاحص');
  await loadSponsor();await loadAdmWeek();
}

/* أفكار تحديات جاهزة */
function chIdea(title,region,cat){
  if($('chTitle'))$('chTitle').value=title;
  if($('chRegion'))$('chRegion').value=region;
  if($('chCat'))$('chCat').value=cat;
  const d=new Date();d.setDate(d.getDate()+7);
  if($('chEnds'))$('chEnds').value=d.toISOString().slice(0,10);
  toast('اضغط حفظ ثم تفعيل 🎯');
}

/* ====== نظام الرتب ====== */
const ADM_ROLES={
  owner:  {n:'مالك',   ic:'👑', c:'#D63A2F'},
  editor: {n:'محرّر',  ic:'✏️', c:'#E8A020'},
  mod:    {n:'مراجع',  ic:'🛡️', c:'#2E8B57'}
};

function admRole(){ return window.ADM_ROLE||''; }
function isOwner(){ return admRole()==='owner'; }
function isEditor(){ return admRole()==='owner'||admRole()==='editor'; }

/* فحص صلاحية قبل أي فعل حساس */
function needOwner(what){
  if(isOwner())return true;
  toast('🔒 '+(what||'هذا الإجراء')+' للمالك فقط',true);
  return false;
}
function needEditor(what){
  if(isEditor())return true;
  toast('🔒 '+(what||'هذا الإجراء')+' يحتاج صلاحية أعلى',true);
  return false;
}

/* ====== إدارة المشرفين (للمالك) ====== */
async function admTeamBlock(){
  if(!isOwner())return '';
  let rows='';
  try{
    const r=await sb.from('admins').select('id,role,name,added_at').order('added_at');
    const list=r.data||[];
    rows=list.map(x=>{
      const rl=ADM_ROLES[x.role]||ADM_ROLES.mod;
      const me=!!(USER&&x.id===USER.id);
      return `<div class="tm-row">
        <div class="tm-info">
          <div class="tm-name">${rl.ic} ${esc(x.name||'مشرف')}${me?' <span style="font-size:10px;color:var(--txt-dim)">(أنت)</span>':''}</div>
          <div class="tm-id">${x.id.slice(0,8)}…</div>
        </div>
        <select class="tm-sel" ${me?'disabled':''} onchange="admSetRole('${x.id}',this.value)">
          ${Object.keys(ADM_ROLES).map(k=>`<option value="${k}" ${x.role===k?'selected':''}>${ADM_ROLES[k].ic} ${ADM_ROLES[k].n}</option>`).join('')}
        </select>
        ${me?'':`<button class="tm-del" onclick="admRemove('${x.id}')">✕</button>`}
      </div>`;
    }).join('');
  }catch(e){rows='<div style="font-size:12px;color:var(--txt-dim)">تعذر التحميل</div>'}

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

async function admSetRole(uid,role){
  if(!needOwner('تغيير الرتب'))return;
  const {error}=await sb.from('admins').update({role}).eq('id',uid);
  if(error){toast('تعذر التغيير: '+error.message,true);return}
  toast('انتغيّرت الرتبة ✅');
  loadAdmWeek();
}

async function admRemove(uid){
  if(!needOwner('إزالة المشرفين'))return;
  if(!confirm('إزالة هذا المشرف نهائياً؟'))return;
  const {error}=await sb.from('admins').delete().eq('id',uid);
  if(error){toast('تعذرت الإزالة: '+error.message,true);return}
  toast('انحذف المشرف');
  loadAdmWeek();
}

let _tmT=null;
window.__tmPick=null;

function tmSearchUsers(){
  clearTimeout(_tmT);
  _tmT=setTimeout(_tmRun,400);
}

async function _tmRun(){
  const q=($('tmSearch').value||'').trim();
  const box=$('tmResults');if(!box)return;
  if(q.length<2){box.innerHTML='';return}
  box.innerHTML='<div class="tm-hint">⏳</div>';
  try{
    const r=await sb.from('profiles').select('id,display_name,region')
      .ilike('display_name','%'+q+'%').limit(12);
    let list=r.data||[];
    // استبعاد المشرفين الحاليين
    try{
      const ex=await sb.from('admins').select('id');
      const have=(ex.data||[]).map(x=>x.id);
      list=list.filter(u=>!have.includes(u.id));
    }catch(e){}

    if(!list.length){box.innerHTML='<div class="tm-hint">ما لقينا أحداً</div>';return}
    box.innerHTML=list.map(u=>`
      <div class="tm-res" onclick="tmPick('${u.id}','${esc(u.display_name||'مصوّر').replace(/'/g,"&#39;")}')">
        <span>${esc(u.display_name||'مصوّر')}</span>
        ${u.region?`<small>${esc(u.region)}</small>`:''}
      </div>`).join('');
  }catch(e){box.innerHTML='<div class="tm-hint">تعذر البحث</div>'}
}

function tmPick(id,name){
  window.__tmPick={id,name};
  $('tmResults').innerHTML='';
  $('tmSearch').value='';
  const p=$('tmPicked');
  if(p){
    p.style.display='flex';
    p.innerHTML='<b>'+esc(name)+'</b><button onclick="tmClearPick()">✕</button>';
  }
  const b=$('tmAddBtn');if(b)b.disabled=false;
}

function tmClearPick(){
  window.__tmPick=null;
  const p=$('tmPicked');if(p)p.style.display='none';
  const b=$('tmAddBtn');if(b)b.disabled=true;
}

async function admAddMember(){
  if(!needOwner('تعيين المشرفين'))return;
  const pick=window.__tmPick;
  if(!pick){toast('اختر العضو أول',true);return}
  const role=$('tmRole').value;
  const {error}=await sb.from('admins').insert({id:pick.id,role,name:pick.name});
  if(error){toast('تعذرت الإضافة: '+error.message,true);return}
  toast('✅ '+pick.name+' صار '+((ADM_ROLES[role]||{}).n||role));
  tmClearPick();
  loadAdmWeek();
}

/* ====== مسح الرسائل المنتهية (للمالك) ====== */
async function fbClearDone(n){
  if(!needOwner('المسح الجماعي'))return;
  if(!confirm('مسح '+n+' رسالة منتهية؟\n\nالرسائل الجديدة تبقى — والمسح نهائي.'))return;
  if(!confirm('تأكيد أخير: هذا الإجراء لا يمكن التراجع عنه.'))return;

  // نجلب المعرّفات أولاً ثم نحذفها — أوثق من neq
  const q=await sb.from('feedback').select('id').eq('status','done');
  if(q.error){toast('تعذر القراءة: '+q.error.message,true);return}
  const ids=(q.data||[]).map(x=>x.id);
  if(!ids.length){toast('ما فيه رسائل منتهية',true);return}
  const {data,error}=await sb.from('feedback').delete().in('id',ids).select('id');
  if(error){toast('تعذر المسح: '+(error.message||error.code||''),true);return}
  const n2=(data||[]).length;
  if(!n2){toast('ما انمسح شيء — تحقق من صلاحيات الحذف',true);return}
  toast('انمسحت '+n2+' رسالة ✅');
  loadFb();
}

/* ====== منع من المراسلة (إداري) ====== */
function _dmUid(note){
  const m=String(note||'').match(/المعرّف:\s*([0-9a-f-]{36})/i);
  return m?m[1]:'';
}

async function admDmBan(uid,ban){
  if(!needEditor('منع المراسلة'))return;
  if(typeof ban==='undefined')ban=true;

  let reason='';
  if(ban){
    reason=prompt('سبب المنع (يصل العضو):','إساءة استخدام الرسائل الخاصة');
    if(reason===null)return;
    reason=(reason||'').trim()||'إساءة استخدام الرسائل الخاصة';
  }else{
    if(!confirm('رفع المنع عن هذا العضو؟'))return;
  }

  const {error}=await sb.from('profiles').update({dm_banned:ban}).eq('id',uid);
  if(error){toast('تعذرت العملية: '+error.message,true);return}
  if(window.__dmBanMap)window.__dmBanMap[uid]=ban;

  await notifyDmBan(uid,ban,reason);
  toast(ban?'🚫 انمنع — وانبلّغ بالسبب':'✅ انرفع المنع — وانبلّغ');
  loadFb();
}

/* إبلاغ العضو بقرار المنع أو رفعه */
async function notifyDmBan(uid,ban,reason){
  try{
    const body=ban
      ? '🚫 تم إيقاف إرسالك للرسائل الخاصة\n\n'
        +'السبب: '+reason+'\n\n'
        +'حسابك يعمل طبيعياً — تنشر وتعلّق وتقيّم كالعادة، لكن إرسال الرسائل الخاصة موقوف.\n\n'
        +'لو ترى أن القرار غير صحيح، رد على هذي الرسالة وراح نراجعه.'
      : '✅ تم رفع إيقاف الرسائل عن حسابك\n\n'
        +'تقدر ترسل رسائل خاصة من جديد — نرجو الالتزام بآداب التواصل.';

    await sb.from('feedback').insert({
      user_id:uid,
      kind:'other',
      body:body,
      reply:'',
      status:'new'
    });

    if(typeof pushNotify==='function'){
      pushNotify({
        title: ban?'🚫 إيقاف الرسائل الخاصة':'✅ رُفع إيقاف الرسائل',
        body: ban?('السبب: '+reason):'تقدر ترسل رسائل من جديد',
        url:'/',
        user_ids:[uid]
      });
    }
  }catch(e){}
}
