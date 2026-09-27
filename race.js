/* صورة من بلدي — features/race.js
   سباق الديار */

import { currentUser, isAnon, sb } from '../core/db.js';
import { checkText } from '../core/format.js';
import { need } from '../core/hub.js';
import { imgUrl, thumbUrl } from '../core/media.js';
import { isOwner, state } from '../core/state.js';
import { $, esc, prompt, toast } from '../core/ui.js';
import { geo, COORDS, REGION_CENTER, nearestCity, loadPlaces, BASE_GEO } from '../data/places.js';

/* ═══ من التنقل — عبر الحاجز ═══ */
const go = need('go');

/* ═══ من ميزات أخرى — عبر الحاجز (يمنع الدورات) ═══ */
const pushNotify = need('pushNotify');
const render = need('render');
export async function loadRace(){
  try{
    const r=await sb.from('region_scores').select('*').order('total',{ascending:false});
    state.race=r.data||[];
  }catch(e){state.race=[]}
}

/* ═══ منطقتك من الجغرافيا لا من لافتة صورة ═══
   كانت تُستنتج من «أقرب صورة لك»: تُرتَّب الصور بالمسافة وتُؤخذ
   منطقةُ أقربها. فمن وقف في الرياض وكانت أقرب صورةٍ إليه موسومةً
   بعسير خطأً — وعندنا تصنيفاتٌ خاطئةٌ مسجّلة — قيل له «أنت في
   عسير». صورةٌ واحدةٌ مغلوطة تكذب على كل من حولها.

   والجواب لا يحتاج الصور أصلاً: عندنا COORDS — إحداثيات مدن
   المملكة — وnearestCity تردّ المدينة ومنطقتها والمسافة. فالموقع
   يُسأل عن الجغرافيا، لا عمّا كتبه غيرُك على صورته.

   و٢٠٠ كم حدٌّ للثقة: أبعد منها فأنت بين المدن أو خارج التغطية،
   والصمت أصدق من تخمين. */
export function detectMyRegion(){
  if(!window.__USER_LAT || !window.__USER_LNG) return '';
  try{
    const n = nearestCity(window.__USER_LAT, window.__USER_LNG);
    if(n && n.region && n.km <= 200) return n.region;
  }catch(e){}
  return '';
}

export async function openRace(){
  go('race');
  const el=$('raceList');if(!el)return;
  el.innerHTML='<div class="loader">⏳</div>';
  await loadRace();
  if(!state.race.length){
    el.innerHTML='<div class="empty"><span class="big">🏁</span>السباق ما بدأ بعد<br><span style="font-size:13px;color:var(--txt-dim)">انشر أول صورة وافتح السباق لمنطقتك</span></div>';
    return;
  }
  state.myRegion=state.myRegion||detectMyRegion();
  const medals=['🥇','🥈','🥉'];
  let html='';
  state.race.forEach((r,i)=>{
    const mine=state.myRegion&&r.region===state.myRegion;
    html+=`<div class="race-row ${i===0?'top1':''} ${mine?'mine':''}">
      <div class="race-pos">${medals[i]||(i+1)}</div>
      <div class="race-info">
        <div class="race-name">${esc(r.region)}${mine?' <span style="font-size:11px;color:var(--sadu)">· ديرتك</span>':''}</div>
        <div class="race-sub">📸 ${r.photos} صورة · 🎖️ ${r.photographers} مصوّر</div>
      </div>
      <div class="race-pts">${r.total} <span>نقطة</span></div>
    </div>`;
    // فجوة المنطقة التالية لديرتك
    if(mine&&i>0){
      const gap=state.race[i-1].total-r.total;
      const gapNeed=Math.ceil(gap/10);
      /* ⚠️ كان هنا المتغيّر need — وهو الدالة المستوردة من core/hub.js
         لا العدد، فتُطبع شيفرتها كاملة داخل الرسالة. العدد اسمه gapNeed. */
      html+=`<div class="race-gap">🔥 تحتاج <b>${gapNeed}</b> ${gapNeed===1?'صورة':'صور'} لتتجاوز <b>${esc(state.race[i-1].region)}</b></div>`;
    }
  });
  el.innerHTML=html;
}

/* ====== ديرتك أولاً — بنر الافتتاح ====== */

export async function checkRaceProgress(){
  try{
    if(isAnon())return;
    const reg=state.myRegion||detectMyRegion();
    if(!reg)return;
    await loadRace();
    const idx=state.race.findIndex(r=>r.region===reg);
    if(idx<0)return;
    const rank=idx+1;

    let prev=null;
    try{prev=parseInt(localStorage.getItem('sowra_rank_'+reg))}catch(e){}
    try{localStorage.setItem('sowra_rank_'+reg,String(rank))}catch(e){}

    if(prev&&rank<prev){
      const up=prev-rank;
      pushNotify({
        title:'🏁 '+reg+' تقدّمت!',
        body:'صعدت '+(up===1?'مركزاً':up+' مراكز')+' — الترتيب الآن #'+rank,
        url:'/',
        user_ids:[currentUser()?.id]
      });
    }
  }catch(e){}
}

/* ====== تنبيه: أنت قرب صور ====== */
