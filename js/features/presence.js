/* صورة من بلدي — features/presence.js
   من يتصفّح الآن

   ═══ لماذا جدولٌ لا قناةٌ حيّة ═══
   جرّبنا أولاً حضور سوبابيز على القناة القائمة: مجّانيٌّ ودقيق، لكن
   حمولته تُبَثّ لكل من فتح الموقع. فإضافة الاسم إليها تكشف «فلانٌ
   يتصفّح الآن» لكل فضولي. والجدول يقلب المعادلة: كلٌّ يكتب صفّه
   وحده، والمشرف وحده يقرأ — فالخصوصية في السياسة لا في الاتفاق.

   ═══ وثمنه ═══
   نبضةٌ عند الفتح، ثم كل دقيقةٍ ما دام التبويب ظاهراً. من تركه في
   الخلفية لا يكتب — وهو ليس متصفّحاً على كل حال. فعشرة متصفّحين
   معاً لا يكلّفون إلا ستّمئة صفٍّ صغيرٍ في الساعة، وكلّها تحديثٌ
   لصفٍّ واحدٍ لكلٍّ منهم لا صفوفٌ تتراكم. */

import { currentUser, isAnon, sb } from '../core/db.js';

const BEAT = 60 * 1000;
let _timer = null, _started = false;

async function beat(){
  const u = currentUser();
  if(!u || !u.id) return;
  try{
    await sb.from('presence').upsert({
      user_id: u.id,
      last_seen: new Date().toISOString(),
      is_anon: isAnon()
    }, { onConflict: 'user_id' });
  }catch(e){ /* صامتة: حضورٌ لم يُسجَّل لا يستحقّ إزعاج زائر */ }
}

export function startPresence(){
  if(_started) return;
  _started = true;
  beat();
  clearInterval(_timer);
  _timer = setInterval(() => {
    /* لا نكتب لمن غادر التبويب — الكتابة له كذبٌ على العدّاد */
    if(document.visibilityState === 'visible') beat();
  }, BEAT);
  /* وعند العودة من الخلفية: نبضةٌ فوراً لا بعد دقيقة */
  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState === 'visible') beat();
  });
}

/* ═══ للوحة الإشراف ═══
   الدالّة في القاعدة تحرس نفسها (is_admin)، فلا نكرّر الحراسة هنا.
   وتُرجع null عند العطل لا مصفوفةً فارغة: الفرق بين «لا أحد» و«لم
   أعرف» فرقٌ يقرأه المشرف ويبني عليه. */
export async function fetchOnline(mins){
  try{
    const { data, error } = await sb.rpc('online_now', { mins: mins || 5 });
    if(error) return null;
    return data || [];
  }catch(e){ return null; }
}
