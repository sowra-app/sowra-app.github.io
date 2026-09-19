/* صورة من بلدي — features/feed.js
   الشبكة والبطاقات */

import { currentUser, isAnon, sb } from '../core/db.js';
import { rankOf } from '../core/format.js';
import { get, need } from '../core/hub.js';
import { imgUrl, thumbUrl, vidUrl } from '../core/media.js';
import { state } from '../core/state.js';
import { $, esc } from '../core/ui.js';
import { geo, COORDS, REGION_CENTER, nearestCity, loadPlaces, BASE_GEO } from '../data/places.js';
const _PHOTO_TAGS_ = () => get('PHOTO_TAGS');

/* ═══ عبر الحاجز ═══
   accTab ← features/account.js
   openSponsorsPage ← features/contest.js
*/
const accTab = need('accTab');
const openSponsorsPage = need('openSponsorsPage');

/* ═══ من التنقل — عبر الحاجز ═══ */
const go = need('go');
const getViewPrefs = need('getViewPrefs');
const loadSunTimes = need('loadSunTimes');

/* ═══ من ميزات أخرى — عبر الحاجز (يمنع الدورات) ═══ */
const addUserPin = need('addUserPin');
const closeSheet = need('closeSheet');
const closeUni = need('closeUni');
const detectMyRegion = need('detectMyRegion');
const loadClaims = need('loadClaims');
const loadRace = need('loadRace');
const loadVisitCounts = need('loadVisitCounts');
const openQuests = need('openQuests');
const openRace = need('openRace');
const openShooters = need('openShooters');
const openUserSearch = need('openUserSearch');
const openWaiting = need('openWaiting');
const renderMap = need('renderMap');
/* state.map → state.map */
/* state.race → state.race */
/* state.viewMode → state.viewMode */
/* ====== الفلتر الموحد ====== */
state.draftCat='all';
state.draftSort='top';
state.draftScope='home';
state.scope='home';

/* ═══ الشاشة الأولى لا تنتظر الأرشيف ═══
   كانت loadPhotos تجلب كل الصور بكل أعمدتها ثم ترسم. فالزائر يرى
   صفحةً فارغةً حتى يصل آخر صفٍّ في القاعدة — وقاس قوقل ٤٫٨٦ ثانية
   انتظاراً قبل أن يبدأ المتصفّح تنزيل أوّل صورةٍ أصلاً.
   واليوم ٤٧ صورةً تساوي ١٢ كيلوبايت فلا يُشعَر بها. وعند خمسة آلاف
   تصير ميغابايت وربعاً في كل زيارة — لعرض اثنتي عشرة صورةً في الشاشة
   الأولى. وهذا لا يتدهور شيئاً فشيئاً: ينهار.

   فصار الجلب على نَفَسين:
     الأول: صفحةٌ أولى بالترتيب المعروض — فتُرسم فوراً.
     الثاني: بقيّة الأرشيف في وقت فراغ الخيط، بعد أن يرى الزائر صوره.
   والثاني ضروريٌّ اليوم: خمسةٌ وعشرون ملفاً تقرأ state.photos وتفترضها
   الأرشيف كاملاً — الخريطة والبحث وعدّادات الملف والأضواء والسباق.
   فلا نكسرها، بل نؤخّرها عن الطريق الحرِج. وإسقاطُ الأرشيف المشترك
   نفسِه شغلٌ آخر، كلُّ شاشةٍ تسأل عمّا تحتاج. */
const FIRST_PAGE = 60;
let _restTimer = null;

/* الصفحة الأولى تُجلب بترتيب العرض نفسه — وإلا جلبنا أحدث ستّين
   وعرضنا أعلى اثنتي عشرة تقييماً، فلا يوافق المجلوبُ المعروض. */
function orderedPage(q){
  if(state.sort === 'new') return q.order('created_at',{ascending:false});
  return q.order('avg_stars',{ascending:false}).order('ratings_count',{ascending:false});
}

/* ═══ آخرُ ما رآه الزائر يُرسَم قبل أن تجيب الشبكة ═══
   الصفحة تُرسم في ١٤٤ مللي ثم تجلس فارغةً حتى يصل جواب القاعدة. ومن
   زار أمس رأى صوراً — فلمَ يُستقبَل اليوم بفراغٍ حتى تُجيب؟
   فنحفظ أوّل أربعٍ وعشرين بطاقةً بجهازه، ونرسمها فور الإقلاع، ثم
   يحلّ محلّها الجوابُ الحقيقي حين يصل — وأكثره لا يتغيّر فلا يرى
   قفزة. ومن زار أوّل مرّةٍ لا ذاكرة له، فيرى ما كان يرى.
   وعمرُها يوم: الأقدم يُهمَل ولا يُعرَض. */
const CACHE_KEY = 'sowra_feed_v1';
const CACHE_MAX = 24;
const CACHE_TTL = 24 * 3600 * 1000;

function saveFeedCache(rows){
  try{
    if(!rows || !rows.length) return;
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      t: Date.now(),
      s: state.sort || 'top',
      r: rows.slice(0, CACHE_MAX)
    }));
  }catch(e){}            /* ممتلئٌ أو محظور — لا يضرّ */
}

function paintFromCache(){
  try{
    const raw = localStorage.getItem(CACHE_KEY);
    if(!raw) return false;
    const c = JSON.parse(raw);
    if(!c || !Array.isArray(c.r) || !c.r.length) return false;
    if(Date.now() - (c.t||0) > CACHE_TTL) return false;
    if(c.s && state.sort && c.s !== state.sort) return false;   /* رُتِّبت بغير ترتيبه */
    state.photos = c.r;
    paintFeed();
    return true;
  }catch(e){ return false; }
}

export async function loadPhotos(){
  clearTimeout(_restTimer);
  /* قبل أي انتظار: ارسم ما بالجهاز إن وُجد ولم يكن عندنا شيء */
  if(!state.photos.length) paintFromCache();
  const first = await orderedPage(sb.from('photos_ranked').select('*')).limit(FIRST_PAGE);
  if(first.error){
    $('feed').innerHTML=`<div class="empty"><span class="big">⚠️</span>تعذر تحميل الصور<br>${first.error.message}</div>`;
    return;
  }
  state.photos = first.data || [];
  saveFeedCache(state.photos);
  try{await loadVisitCounts()}catch(e){}
  try{await loadClaims()}catch(e){}
  paintFeed();
  watchPhotos();
  /* الباقي حين يفرغ الخيط — لا قبله */
  const rest = () => { loadRest().catch(e => console.warn('[خلاصة] تعذّر جلب البقيّة', e)); };
  if(window.requestIdleCallback) requestIdleCallback(rest, {timeout: 2500});
  else _restTimer = setTimeout(rest, 1200);
}

async function loadRest(){
  const { data, error } = await sb.from('photos_ranked')
    .select('*')
    .order('created_at',{ascending:false});
  if(error){ console.warn('[خلاصة] بقيّة الأرشيف لم تصل —', error.message); return; }
  const all = data || [];
  /* لا نرسم إن لم يتغيّر شيء: الصفحة الأولى قد تكون الأرشيف كلّه */
  const grew = all.length !== state.photos.length;
  state.photos = all;
  _sig = sigOf(state.photos);
  _lastFull = Date.now();
  if(grew) paintFeed();
}

function paintFeed(){
  try{
    if(typeof state.viewMode!=='undefined' && state.viewMode==='map'){ renderMap(); }
    else { render(); }
  }catch(e){ console.warn('render', e); }
}

/* ═══ القناة الحيّة ═══
   سأل المالك: ولمَ لا نستعمل الحيّ؟ وكان محقاً — قاعدةُ سوبابيز تدفع
   الجديد بنفسها، والمشروع لم يستعمل هذا الباب قطّ: لا sb.channel بحرفٍ
   واحد. فكنّا نسأل كل دقيقتين عمّا تستطيع القاعدة أن تخبرنا به لحظته.

   وهي هنا مُسرِّعٌ لا معتمَدٌ عليه — وهذا شرط سلامتها:
     · إن لم تُفعَّل بإعدادات المشروع، أو انقطع الاتصال، أو رُفض
       الاشتراك — لا ينكسر شيء، والسؤال الدوري يبقى شبكةَ أمانٍ تحته.
     · لا نُصغي لـUPDATE إطلاقاً: عدّاد المشاهدات يُحدّث جدول الصور عند
       كل فتحة، فالإصغاء له يعني سيلاً من الأحداث ونحن نهرب من السيل.
       الإدراج والحذف وحدهما، وهما ما يهمّ الزائر.
     · ولا نجلب عند كل حدث: خمسُ صورٍ تُرفع معاً تعني خمسة أحداث،
       فنُمهل ثلاث ثوانٍ ثم نسأل سؤالاً واحداً رخيصاً. */
let _ch = null, _burst = null;

/* ═══ القناة تستسلم بعد ثلاثٍ ═══
   عميل سوبابيس يعيد وصل القناة بلا نهاية. وحيث لا تمرّ WebSocket —
   شبكةٌ تحجبها، أو وكيلٌ بالعمل، أو بيئة فحصٍ كبيئة PageSpeed التي
   ردّت ERR_NAME_NOT_RESOLVED أربع مرّات في لقطةٍ واحدة — تصير محاولةً
   أبديّة: أخطاءٌ تتراكم بالسجلّ، ومقبسٌ يُفتح ويُغلق بلا فائدة،
   وبطاريّةٌ تُستهلك على جوّالٍ لن يتصل أبداً.
   والقناة مُسرِّعٌ لا معتمَدٌ عليه: السؤال الدوري كل دقيقتين يغطّي
   عملها كاملاً. فبعد ثلاث خيبات نصرفها ونكتفي بالسؤال — ونقولها مرّةً
   واحدة لا مع كل محاولة. */
const GIVE_UP_AFTER = 3;
let _fails = 0, _gone = false;

export function watchPhotos(){
  if(_ch || _gone) return;
  if(!sb || typeof sb.channel !== 'function') return;
  try{
    const hit = () => {
      clearTimeout(_burst);
      _burst = setTimeout(() => { refreshPhotos(); }, 3000);
    };
    _ch = sb.channel('sowra-photos')
      .on('postgres_changes', {event:'INSERT', schema:'public', table:'photos'}, hit)
      .on('postgres_changes', {event:'DELETE', schema:'public', table:'photos'}, hit)
      .subscribe(st => {
        if(st === 'SUBSCRIBED'){
          _fails = 0;
          console.info('[حيّ] القناة مفتوحة — الصور الجديدة تصل لحظتها');
        }else if(st === 'CHANNEL_ERROR' || st === 'TIMED_OUT'){
          if(++_fails >= GIVE_UP_AFTER) dropChannel(st);
        }
      });
  }catch(e){
    console.warn('[حيّ] تعذّر الاشتراك — السؤال الدوري يغطّيها', e);
    _ch = null;
  }
}

function dropChannel(why){
  /* العميل يواصل نداء الردّ بعد الصرف، والشرط يبقى صادقاً — فكانت
     تُقال ستّ مرّات. الحارس هنا لا في موضع النداء، لأن مواضع النداء
     تكثر والقرار واحد. */
  if(_gone) return;
  _gone = true;
  try{ if(_ch && typeof sb.removeChannel === 'function') sb.removeChannel(_ch); }catch(e){}
  _ch = null;
  console.warn('[حيّ] تعذّرت القناة ('+why+') بعد '+GIVE_UP_AFTER+' محاولات — صُرفت، والسؤال الدوري كل دقيقتين يغطّيها');
}

/* ═══ التحديث الآليّ: نسأل قبل أن نجلب ═══
   loadPhotos تجلب كل الصور بكل أعمدتها بلا حدّ. وهي محقّةٌ في ثمانية
   عشر موضعاً تناديها بعد تغييرٍ فعليّ — نشرٍ أو تعديلٍ أو حذف.
   لكن موضعين ينادياها بلا أن يتغيّر شيء: عند كل رجوعٍ للتطبيق من
   الخلفية، وكل دقيقتين ما دام مفتوحاً. فمن تَرك تبويباً مفتوحاً ساعة
   جلب الأرشيف كاملاً ثلاثين مرة، وهو نفسه لم يتغيّر.

   فصار الآليّ يسأل أولاً بسؤالٍ رخيص: كم عدد الصور؟ وما أحدث تاريخ؟
   الأول head:true فلا يعيد صفّاً واحداً — عدداً فقط. والثاني صفٌّ
   واحد بعمودٍ واحد. فإن تطابقا مع ما عندنا فلا جديد ولا جلب.
   ونُجبر جلبةً كاملة كل حينٍ على أي حال — انظر FULL_EVERY أدناه. */
let _sig = '', _lastFull = 0;
/* ═══ لماذا ساعة ═══
   هذه الجلبة الإجبارية هي ٩٩٫٩٪ من الحمل المتبقي: ثلاث جلباتٍ كاملة
   بالساعة عند ربع الساعة، مقابل ٢٧ سؤالاً مجموعها كيلوبايت.
   وما تشتريه بها قليل: عدّاد 👁️ المشاهدات على البطاقة، وترتيب
   الميداليات عند «الأعلى تقييماً»، ووسام اختيار المحررين لو مُنح
   أثناء جلسة الزائر. أما الصور الجديدة والمحذوفة — وهي ما يهمّ —
   فتصل بالقناة الحيّة لحظتها، وبالسؤال الدوري خلال دقيقتين.
   ولا نُلغيها بالكامل: تبقى شبكةَ أمانٍ أخيرة لما لا تراه البصمة ولا
   تدفعه القناة — صورةٌ يُخفيها الإشراف، أو عنوانٌ يُعدَّل. فإن سقط
   الطريقان معاً، فساعةٌ تضمن الصحّة ولو متأخّرة. ثمنُها نصف ميغابايت
   بالساعة بدل ميغا ونصف. */
const FULL_EVERY = 60 * 60000;

function sigOf(rows){
  const newest = rows && rows.length ? (rows[0].created_at || '') : '';
  return (rows ? rows.length : 0) + '|' + newest;
}

export async function refreshPhotos(){
  /* لم نُحمّل بعد — لا بصمة نقارن بها */
  if(!state.photos.length) return loadPhotos();
  if(Date.now() - _lastFull > FULL_EVERY) return loadPhotos();
  try{
    /* نداءٌ واحد يعطينا الاثنين: العدد يأتي بالترويسة مع count:'exact'،
       وأحدث تاريخ يأتي بالصفّ الواحد. كانا نداءين فصارا واحداً — لأن
       عدد النداءات يهمّ حين يكون الزوار مئة. */
    const r = await sb.from('photos_ranked')
      .select('created_at', {count:'exact'})
      .order('created_at',{ascending:false}).limit(1);
    if(r.error) return loadPhotos();                /* عند الشكّ نجلب */
    const sig = (r.count ?? 0) + '|' + ((r.data && r.data[0] && r.data[0].created_at) || '');
    if(sig === _sig) return;                        /* لا جديد */
  }catch(e){ return loadPhotos(); }
  return loadPhotos();
}

/* ============ الفلاتر والعرض ============ */

export function initSelects(){
  const fr=$('fRegion'),ar=$('aRegion');
  fr.innerHTML='<option value="">كل المناطق</option>';
  ar.innerHTML='<option value="">اختر المنطقة</option>';
  for(const r in geo.GEO){fr.innerHTML+=`<option>${r}</option>`;ar.innerHTML+=`<option>${r}</option>`;}
}

export function fillCities(){
  const r=$('fRegion').value,c=$('fCity');
  c.innerHTML='<option value="">كل المدن</option>';
  if(r&&geo.GEO[r])geo.GEO[r].forEach(x=>c.innerHTML+=`<option>${x}</option>`);
}

export function fillAddCities(){
  const r=$('aRegion').value,c=$('aCity');
  c.innerHTML='<option value="">اختر المدينة</option>';
  if(r&&geo.GEO[r])geo.GEO[r].forEach(x=>c.innerHTML+=`<option>${x}</option>`);
  $('villList').innerHTML=(r&&geo.VILL[r]?geo.VILL[r]:[]).map(v=>`<option value="${v}">`).join('');
}

/* ═══ مصدر الفلترة الوحيد ═══
   الشبكة والخريطة تناديان هذه الدالة نفسها.
   ⚠️ لا تكرّر منطق الفلترة بمكان آخر — التكرار هو سبب تجاهل الخريطة
   للفلاتر سابقاً (كانت تطبّق ٣ شروط من ٨). */
export function filteredPhotos(){
  const q=($('q')?.value||'').trim();
  const r=$('fRegion')?$('fRegion').value:'';
  const c=$('fCity')?$('fCity').value:'';
  const abroadView=(state.scope==='abroad');

  let list=state.photos.filter(p=>!!p.abroad===abroadView&&p.media_type!=='video');
  if(state.onlyEc)list=list.filter(p=>p.editors_choice);
  if(state.onlyClaims)list=list.filter(p=>state.claimMap&&state.claimMap[p.id]);
  if(state.tags&&state.tags.length){
    list=list.filter(p=>{
      const t=p.tags||[];
      return state.tags.every(k=>t.includes(k));
    });
  }
  if(state.cat!=='all')list=list.filter(p=>(p.category||'other')===state.cat);

  if(abroadView){
    list=list.filter(p=>!q||(p.title||'').includes(q)||(p.country||'').includes(q));
  }else{
    list=list.filter(p=>
      (!r||p.region===r)&&(!c||p.city===c)&&
      (!q||(p.title||'').includes(q)||(p.village||'').includes(q)
        ||(p.city||'').includes(q)||(p.region||'').includes(q))
    );
  }
  return list;
}

export function render(){
  /* كل أزرار الفلترة تنادي render — فلو كنا بالخريطة نحدّثها هي.
     سابقاً كان هنا return فقط، فتغيير الفلتر وأنت بالخريطة لا يفعل شيئاً. */
  if(state.viewMode==='map'){ try{ renderMap(); }catch(e){ console.warn('renderMap', e); } return; }
  const mw=$('mapWrap');if(mw)mw.style.display='none';
  $('feed').style.display='';
  let list=filteredPhotos();
  // الترتيب يعمل بالنطاقين
  if(state.sort==='new'){
    list.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  }else if(state.sort==='visits'){
    list.sort((a,b)=>((state.visitCounts[b.id]||0)-(state.visitCounts[a.id]||0))
      ||(b.avg_stars-a.avg_stars));
  }else{
    list.sort((a,b)=>(b.avg_stars-a.avg_stars)||(b.ratings_count-a.ratings_count)
      ||(new Date(b.created_at)-new Date(a.created_at)));
  }
  $('totalPill').textContent=`${state.photos.length} صورة · V1.2`;
  const feed=$('feed');
  if(!list.length){feed.innerHTML=`<div class="empty"><span class="big">🏜️</span>ما فيه صور بعد..<br>كن أول من يصوّر ديرته! اضغط + وشارك</div>`;return}
  // ═══ عرض تدريجي ═══
  window.__renderList=list;
  window.__renderCount=0;
  feed.innerHTML='';
  renderBatch();
}

/* بناء بطاقة واحدة */

export function buildCard(p,i){
 try{
  const medal=(state.sort==='top'&&i<3&&p.ratings_count>0)?['🥇','🥈','🥉'][i]:'';
  const isV=p.media_type==='video';
  /* ═══ أوّل صورةٍ لا تُؤجَّل ═══
     قوقل يقيس سرعة الموقع بأكبر عنصرٍ مرئي، وهو عندنا أوّل صورةٍ في
     الخلاصة. وكانت تحمل loading="lazy" — أي أننا نطلب من المتصفّح أن
     يؤخّر الصورة نفسَها التي ينتظرها ليحكم علينا.
     فالأربع الأولى (ما يُرى قبل التمرير) تُجلب فوراً، وأولاهنّ بأولويّة
     عالية. وما بعدهنّ يبقى كسولاً — وهو الأكثر. */
  const eager = i < 4
    ? 'fetchpriority="' + (i === 0 ? 'high' : 'auto') + '"'
    : 'loading="lazy"';
  return `<div class="mcard" onclick="openSheet(${p.id})">
    ${isV
      ? `<video src="${vidUrl(p.image_path)}#t=0.5" muted playsinline preload="metadata" style="width:100%;display:block;filter:${(p.filter_key&&p.filter_key!=='none'&&typeof filterCss==='function')?filterCss(p.filter_key):'none'}"></video>`
      : `<img src="${thumbUrl(p.image_path)}" onerror="this.onerror=null;this.src='${imgUrl(p.image_path)}'" ${eager} decoding="async" alt="${esc(p.title)}">`}
    ${medal?`<div class="mc-medal">${medal}</div>`:''}
    ${state.visitCounts[p.id]?`<div class="mc-visits">👣 ${state.visitCounts[p.id]}</div>`:''}
    ${p.editors_choice?'<div class="mc-ec">🏵️ اختيار المحررين</div>':''}
    ${claimBadge(p.id)}
    ${p.visibility==='private'?'<div class="mc-lock">🔒 خاصة</div>':''}
    ${p.media_type==='video'?'<div class="mc-vid">▶</div>':''}
    <div class="mc-overlay">
      <div class="mc-title">${esc(p.title)}</div>
      <div class="mc-sub">
        <span class="mc-who" onclick="event.stopPropagation();openProfile('${p.user_id}')">${rankOf(p).ic} ${esc(p.photographer)}</span>
        <span class="mc-dot">·</span>
        <span>${p.abroad?esc(p.country||p.city):esc(p.village||p.city)}</span>
        <span class="mc-dot">·</span>
        <span>👁️ ${p.views||0}</span>
      </div>
    </div>
  </div>`;
 }catch(e){return ''}
}

/* دفعة جديدة من البطاقات */

export const RENDER_STEP=24;

export function renderBatch(){
  const feed=$('feed');if(!feed)return;
  try{
  const list=window.__renderList||[];
  const from=window.__renderCount||0;
  if(from>=list.length){removeSentinel();return}

  const to=Math.min(from+RENDER_STEP,list.length);
  const html=list.slice(from,to).map((p,j)=>buildCard(p,from+j)).join('');
  removeSentinel();
  feed.insertAdjacentHTML('beforeend',html);
  window.__renderCount=to;

  if(to<list.length)addSentinel();
  }catch(e){
    console.warn('renderBatch',e);
    feed.innerHTML='<div class="empty" style="grid-column:1/-1"><span class="big">⚠️</span>تعذر عرض الصور</div>';
  }
}

export function addSentinel(){
  const feed=$('feed');if(!feed)return;
  const s=document.createElement('div');
  s.id='feedSentinel';
  s.className='feed-sentinel';
  s.innerHTML='<div class="fs-dot"></div><div class="fs-dot"></div><div class="fs-dot"></div>';
  feed.appendChild(s);

  if(window.__feedObs)window.__feedObs.disconnect();
  window.__feedObs=new IntersectionObserver(function(ents){
    if(ents[0]&&ents[0].isIntersecting)renderBatch();
  },{rootMargin:'420px'});
  window.__feedObs.observe(s);
}

export function removeSentinel(){
  const s=document.getElementById('feedSentinel');
  if(s)s.remove();
  if(window.__feedObs){window.__feedObs.disconnect();window.__feedObs=null}
}

/* ============ نافذة الصورة ============ */