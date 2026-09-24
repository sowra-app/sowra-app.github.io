/* صورة من بلدي — admin/stats.js
   الإحصائيات */

import { sb } from '../core/db.js';
import { isOwner } from '../core/state.js';
import { $, esc } from '../core/ui.js';
import { onlineNow } from '../features/feed.js';
import { geo, COORDS, REGION_CENTER, nearestCity, loadPlaces, BASE_GEO } from '../data/places.js';

/* ═══ من يتصفّح الآن ═══
   يُقرأ من قناة الحضور التي يفتحها كل زائر — لا من جدول، فلا كتابة
   ولا صفوف تتراكم. والعدّ للأجهزة لا للتبويبات: مفتاح الحضور هو
   معرّف الجهاز، فتبويبات الجهاز الواحد تجتمع تحته.

   وإن كانت القناة غير قائمة (انقطعت أو صُرفت) نقول «لا نعرف» ولا
   نكتب صفراً — الصفر كذبةٌ يصدّقها من يقرأها. */
function liveBox(){
  const n = onlineNow();
  const box = (body, tone) => `<div id="admLive" style="background:var(--card);border:1.5px solid ${tone};border-radius:14px;padding:13px 16px;margin-bottom:14px">${body}</div>`;
  if(!n) return box('<span style="color:var(--txt-dim);font-size:13.5px">⚪ القناة الحيّة غير قائمة — لا نعرف من يتصفّح الآن</span>', 'var(--line)');
  const tabsNote = n.tabs > n.devices ? ` <span style="color:var(--txt-dim);font-size:11.5px">(${n.tabs} تبويباً)</span>` : '';
  return box(`<div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap">
      <span style="font-size:15px;font-weight:700">🟢 الآن</span>
      <span style="font-size:22px;font-weight:700;color:var(--palm)">${n.devices}</span>
      <span style="font-size:13.5px">جهازاً${tabsNote}</span>
    </div>
    <div style="font-size:13px;color:var(--txt-dim);margin-top:4px">
      ${n.signed} بحساب · ${n.anon} بلا حساب
    </div>`, 'var(--palm)');
}

/* يُحدَّث وحده ما دام تبويب الإحصائيات مفتوحاً، ويتوقّف إن أُغلق —
   لا نترك مؤقّتاً يدور على عنصرٍ لم يعد في الصفحة. */
let _liveTimer = null;
function watchLive(){
  clearInterval(_liveTimer);
  _liveTimer = setInterval(() => {
    const el = $('admLive');
    if(!el || !el.isConnected || !el.offsetParent){ clearInterval(_liveTimer); _liveTimer = null; return; }
    const fresh = liveBox();
    const tmp = document.createElement('div');
    tmp.innerHTML = fresh;
    el.replaceWith(tmp.firstElementChild);
  }, 5000);
}

export async function loadStats(){
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
  let html=liveBox()+`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px">
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
  watchLive();
}

/* صورة من بلدي — admin.js | نسخة المختبر م1 */
