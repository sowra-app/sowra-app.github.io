/* صورة من بلدي — admin/stats.js
   الإحصائيات */

import { sb } from '../core/db.js';
import { isOwner } from '../core/state.js';
import { $, esc } from '../core/ui.js';
import { need, has } from '../core/hub.js';
import { geo, COORDS, REGION_CENTER, nearestCity, loadPlaces, BASE_GEO } from '../data/places.js';

/* ═══ من يتصفّح الآن ═══
   يُقرأ من جدول presence — كلٌّ يكتب صفّه والمشرف وحده يقرأ.
   «الآن» تعني: نبض خلال الخمس دقائق الماضية.

   وعبر الحاجز لا باستيرادٍ ثابت: استيرادٌ ساقطٌ يُسقط الوحدة كلّها
   ومعها اللوحة — وقع هذا حين استوردنا onlineNow من feed.js. */
let _live = null;      /* آخر ما وصل: null = لم نعرف بعد */

function liveBox(){
  const box = (body, tone) => `<div id="admLive" style="background:var(--card);border:1.5px solid ${tone};border-radius:14px;padding:13px 16px;margin-bottom:14px">${body}</div>`;
  if(!_live) return box('<span style="color:var(--txt-dim);font-size:13.5px">⏳ نقرأ الحضور…</span>', 'var(--line)');
  if(_live.err) return box('<span style="color:var(--txt-dim);font-size:13.5px">⚪ تعذّرت قراءة الحضور — لا نعرف من يتصفّح الآن</span>', 'var(--line)');
  const rows = _live.rows || [];
  if(!rows.length) return box('<span style="font-size:14px">🟢 الآن — <b>ما فيه أحد</b></span>', 'var(--line)');
  const named = rows.filter(r => !r.is_anon && r.display_name && String(r.display_name).trim());
  const rest  = rows.length - named.length;
  const chips = named.map(r => `<span style="background:var(--card2);border-radius:9px;padding:3px 9px;font-size:12.5px;display:inline-block;margin:3px 3px 0 0">${esc(r.display_name || "عضو")}</span>`).join('');
  return box(`<div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap">
      <span style="font-size:15px;font-weight:700">🟢 الآن</span>
      <span style="font-size:22px;font-weight:700;color:var(--palm)">${rows.length}</span>
      <span style="font-size:13.5px">متصلاً</span>
    </div>
    ${chips ? '<div style="margin-top:7px">' + chips + '</div>' : ''}
    ${rest ? `<div style="font-size:12.5px;color:var(--txt-dim);margin-top:6px">و${rest} بلا حساب</div>` : ''}`,
    'var(--palm)');
}

function paintLive(){
  const el = $('admLive');
  if(!el) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = liveBox();
  el.replaceWith(tmp.firstElementChild);
}

async function pullLive(){
  const rows = has('fetchOnline') ? await need('fetchOnline')(5) : null;
  _live = rows ? { rows } : { err: true };
  paintLive();
}

/* يُحدَّث وحده ما دام تبويب الإحصائيات مفتوحاً، ويتوقّف إن أُغلق —
   لا نترك مؤقّتاً يسأل القاعدة عن عنصرٍ لم يعد في الصفحة. */
let _liveTimer = null;
function watchLive(){
  clearInterval(_liveTimer);
  pullLive();
  _liveTimer = setInterval(() => {
    const el = $('admLive');
    if(!el || !el.isConnected || !el.offsetParent){ clearInterval(_liveTimer); _liveTimer = null; return; }
    pullLive();
  }, 20000);
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
          <b style="font-size:14px">${u.display_name ? esc(u.display_name) : '<span style="color:var(--txt-dim);font-weight:500">بلا اسم</span>'}</b>
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
