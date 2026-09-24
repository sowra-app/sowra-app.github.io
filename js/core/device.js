/* صورة من بلدي — core/device.js
   هويّة الجهاز — معرّفٌ يُولَّد مرّةً في هذا المتصفّح ويبقى.

   كُتبت أولاً لجدول الإشعارات: كان مفتاح التعارض هو «العنوان» وهو
   أكثر ما يتبدّل، فصار الجهاز الواحد عدّة مشتركين وتكرّرت الإشعارات.
   ثم احتاجها عدّاد الحاضرين ليعدّ الأجهزة لا التبويبات.

   فنُقلت إلى core لأن لها مستعملَين لا يعرف أحدهما الآخر، ولو بقيت
   في app/push.js لاستوردتها الخلاصة منها — وهذا ربطٌ بلا معنى:
   ما شأن شبكة الصور بالإشعارات؟ */

export function deviceId(){
  try{
    let d = localStorage.getItem('sowra_device');
    if(!d){
      d = (crypto && crypto.randomUUID) ? crypto.randomUUID()
        : 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('sowra_device', d);
    }
    return d;
  }catch(e){ return null; }
}
