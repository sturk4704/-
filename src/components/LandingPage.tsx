import React from 'react';
import { UserRole } from '../types';
import { 
  Trophy, 
  Swords, 
  MapPin, 
  GraduationCap, 
  Scale, 
  ShieldCheck, 
  Zap, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  EyeOff, 
  Coins, 
  LogIn, 
  UserPlus, 
  Compass,
  Star,
  Flame,
  HelpCircle
} from 'lucide-react';

interface LandingPageProps {
  onSelectRoleAndEnter: (role: UserRole) => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
  onExploreAsGuest: () => void;
  onOpenRoleGuide: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRoleAndEnter,
  onOpenRegister,
  onOpenLogin,
  onExploreAsGuest,
  onOpenRoleGuide,
}) => {
  return (
    <div className="space-y-10 sm:space-y-16 pb-12 animate-in fade-in">
      {/* 1. قسم الهيرو الرئيسي الفخم والمعد خصيصاً للجوال */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#141824] via-[#0d1017] to-[#08090d] border border-[#262c3d] p-5 sm:p-8 md:p-12 shadow-2xl">
        {/* خلفية فنية وتأثيرات إضاءة خفيفة لراحة العين */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5 sm:space-y-6">
          {/* شارة الترحيب والتوثيق */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#f5d77f] text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#f5d77f] shrink-0" />
            <span>المنظومة الرقمية الشاملة والموثوقة لكرة القدم في جدة</span>
          </div>

          {/* العنوان الرئيسي الجريء والواضح */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight font-['Changa',sans-serif]">
            كل كورة جدة في منصة واحدة <br className="hidden sm:inline" />
            <span className="gold-gradient-text">بطاقات فيفا، تحديات، وملاعب معتمدة</span>
          </h1>

          {/* نبذة عن التطبيق مبسطة ومباشرة */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            المنصة الأولى المخصصة لأحياء وملاعب جدة: طوّر بطاقة فيفا الرقمية الخاصة بك بتقييم أعمى عادل (×3)، أطلق تحديات 50/50 بتقسيم حجز الملعب والعربون مناصفة، واكتشف مواهب الأكاديميات المرخصة.
          </p>

          {/* أزرار الإجراء السريع (Call To Actions) - مصممة بأحجام لمس كبيرة ومريحة للهواتف */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenRegister}
              className="gold-gradient-btn px-7 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-xl active:scale-95 transition min-h-[48px]"
            >
              <UserPlus className="w-4 h-4 text-black" />
              <span>إنشاء حساب جديد مجاناً</span>
            </button>

            <button
              onClick={onOpenLogin}
              className="px-6 py-3.5 rounded-2xl bg-[#171c28] hover:bg-[#202738] text-white border border-[#2e374d] text-sm font-bold flex items-center justify-center gap-2 transition active:scale-95 min-h-[48px]"
            >
              <LogIn className="w-4 h-4 text-[#f5d77f]" />
              <span>تسجيل الدخول</span>
            </button>

            <button
              onClick={onExploreAsGuest}
              className="px-5 py-3.5 rounded-2xl bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-slate-700/50 text-sm font-bold flex items-center justify-center gap-2 transition active:scale-95 min-h-[48px]"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>تصفح المنصة كزائر</span>
            </button>
          </div>

          {/* شريط الإحصائيات الحية السريعة المتوافقة مع شاشات الجوال */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-4 border-t border-[#1f2637]">
            <div className="bg-[#10131b]/80 border border-[#202636] p-3 rounded-2xl">
              <div className="text-base sm:text-xl font-black text-[#f5d77f] font-mono">OVR 50+</div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">بطاقة فيفا متطورة</div>
            </div>
            <div className="bg-[#10131b]/80 border border-[#202636] p-3 rounded-2xl">
              <div className="text-base sm:text-xl font-black text-emerald-400 font-mono">×3 مضاعف</div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">تقييم أعمى وسري</div>
            </div>
            <div className="bg-[#10131b]/80 border border-[#202636] p-3 rounded-2xl">
              <div className="text-base sm:text-xl font-black text-blue-400 font-mono">50 / 50</div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">تقاسم حجز الملاعب</div>
            </div>
            <div className="bg-[#10131b]/80 border border-[#202636] p-3 rounded-2xl">
              <div className="text-base sm:text-xl font-black text-purple-400 font-mono">100% موثوق</div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">عربون وحكام معتمدون</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. بوابات الدخول السريع بحسب دورك (Choose Your Portal) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2 font-['Changa',sans-serif]">
              <Users className="w-5 h-5 text-[#d4af37]" />
              <span>اختر بوابتك للدخول المباشر والتجربة:</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              كل فئة في ملاعب جدة تحظى بأدوات وواجهة مخصصة 100% لاحتياجاتها
            </p>
          </div>
          <button
            onClick={onOpenRoleGuide}
            className="text-xs font-bold text-[#f5d77f] hover:underline flex items-center gap-1 self-start sm:self-auto py-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>عرض دليل وصلاحيات كل دور</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {/* كارت بوابة اللاعب */}
          <div 
            onClick={() => onSelectRoleAndEnter('player')}
            className="group cursor-pointer bg-[#10131b] hover:bg-[#151924] border border-[#212738] hover:border-[#d4af37]/60 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-md flex flex-col justify-between space-y-4 active:scale-[0.99]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-lg">
                  👤
                </div>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                  بوابة اللاعبين
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-[#f5d77f] transition flex items-center gap-1.5">
                  <span>أنا لاعب كرة قدم</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0" />
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  أنشئ بطاقة فيفا الرسمية لك، طوّر مهاراتك بعد كل مباراة بتقييم زملائك، اكسب كابتن كوينز، واعرض نفسك في سوق الانتقالات للأندية.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#1c2230] flex items-center justify-between text-xs font-bold text-amber-400">
              <span>الدخول لبوابة اللاعبين</span>
              <span className="text-sm">←</span>
            </div>
          </div>

          {/* كارت بوابة كابتن الفريق */}
          <div 
            onClick={() => onSelectRoleAndEnter('captain')}
            className="group cursor-pointer bg-[#10131b] hover:bg-[#151924] border border-[#212738] hover:border-blue-500/60 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-md flex flex-col justify-between space-y-4 active:scale-[0.99]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-lg">
                  👑
                </div>
                <span className="text-[10px] bg-blue-500/10 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
                  بوابة الكباتن
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-blue-300 transition flex items-center gap-1.5">
                  <span>أنا كابتن فريق / منظم</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0" />
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  نظّم تشكيلتك على سبورة التكتيك (5v5 إلى 11v11)، أصدر تحديات 50/50 وتقاسم حجز الملعب مناصفة بضمان المنصة دون إحراج.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#1c2230] flex items-center justify-between text-xs font-bold text-blue-400">
              <span>الدخول لبوابة الكباتن</span>
              <span className="text-sm">←</span>
            </div>
          </div>

          {/* كارت بوابة صاحب الملعب */}
          <div 
            onClick={() => onSelectRoleAndEnter('pitch_owner')}
            className="group cursor-pointer bg-[#10131b] hover:bg-[#151924] border border-[#212738] hover:border-emerald-500/60 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-md flex flex-col justify-between space-y-4 active:scale-[0.99]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  🏟️
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  بوابة الملاعب
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition flex items-center gap-1.5">
                  <span>أنا صاحب ملعب / منشأة</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0" />
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  احمِ ساعات ملعبك من التغيب بحجز إلكتروني مؤكد وعربون مضمون (100 ر.س)، وسوّق منشأتك لآلاف لاعبي وفرق جدة.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#1c2230] flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>الدخول لبوابة الملاعب</span>
              <span className="text-sm">←</span>
            </div>
          </div>

          {/* كارت بوابة كشاف الأكاديميات */}
          <div 
            onClick={() => onSelectRoleAndEnter('academy_scout')}
            className="group cursor-pointer bg-[#10131b] hover:bg-[#151924] border border-[#212738] hover:border-purple-500/60 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-md flex flex-col justify-between space-y-4 active:scale-[0.99]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-lg">
                  🎓
                </div>
                <span className="text-[10px] bg-purple-500/10 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/20">
                  بوابة الأكاديميات
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-purple-300 transition flex items-center gap-1.5">
                  <span>أنا كشاف أكاديمية مرخصة</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0" />
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  استكشف نجوم الأسبوع (TOTW) والناشئين في أحياء جدة، ووجّه دعوات تجارب أداء رسمية موثقة وآمنة لإشعار أولياء الأمور.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#1c2230] flex items-center justify-between text-xs font-bold text-purple-400">
              <span>الدخول لبوابة الكشافة</span>
              <span className="text-sm">←</span>
            </div>
          </div>

          {/* كارت بوابة حكم المباريات */}
          <div 
            onClick={() => onSelectRoleAndEnter('referee')}
            className="group cursor-pointer bg-[#10131b] hover:bg-[#151924] border border-[#212738] hover:border-slate-500/60 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-md flex flex-col justify-between space-y-4 active:scale-[0.99]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-500/15 border border-slate-500/30 text-slate-300 flex items-center justify-center font-bold text-lg">
                  ⚖️
                </div>
                <span className="text-[10px] bg-slate-500/10 text-slate-300 font-bold px-2 py-0.5 rounded-full border border-slate-500/20">
                  بوابة الحكام
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-slate-200 transition flex items-center gap-1.5">
                  <span>أنا حكم مباريات معتمد</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0" />
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  استعرض تكليفات المباريات الودية والبطولات بجدة، احصل على بدلك المالي المضمون (100 - 200 ر.س)، وسجل تقييمك بنزاهة تامة.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#1c2230] flex items-center justify-between text-xs font-bold text-slate-300">
              <span>الدخول لبوابة الحكام</span>
              <span className="text-sm">←</span>
            </div>
          </div>

          {/* كارت استكشاف الملاعب والتحديات السريعة */}
          <div 
            onClick={onExploreAsGuest}
            className="group cursor-pointer bg-gradient-to-br from-[#121622] to-[#1a1f30] border border-[#2e374d] hover:border-[#d4af37] rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-md flex flex-col justify-between space-y-4 active:scale-[0.99]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f5d77f] flex items-center justify-center font-bold text-lg">
                  🌟
                </div>
                <span className="text-[10px] bg-[#d4af37]/15 text-[#f5d77f] font-bold px-2 py-0.5 rounded-full border border-[#d4af37]/30">
                  استكشاف حر
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-[#f5d77f] transition flex items-center gap-1.5">
                  <span>تصفح المنصة والملاعب فوراً</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0" />
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  تصفح قائمة بطاقات اللاعبين المسجلين، مواعيد المباريات والتحديات الودية، ودليل ملاعب جدة المعتمدة دون أي شروط مسبقة.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#262f44] flex items-center justify-between text-xs font-bold text-[#f5d77f]">
              <span>تصفح الآن كزائر</span>
              <span className="text-sm">←</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. كيف تعمل المنصة؟ (How It Works) */}
      <section className="bg-[#10131b] border border-[#202636] rounded-3xl p-5 sm:p-8 space-y-6 shadow-xl">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-lg sm:text-2xl font-black text-white font-['Changa',sans-serif]">
            كيف تعمل منظومة كابتن جدة؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            ثلاث خطوات سهلة تنقلك من اللعب العشوائي إلى تجربة احترافية متكاملة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0b0d13] border border-[#1d222f] p-4 sm:p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/15 text-[#f5d77f] font-black flex items-center justify-center font-mono text-sm border border-[#d4af37]/30">
              1
            </div>
            <h3 className="text-sm font-black text-white">سجّل بطاقتك أو فريقك بدقيقة</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              اختر مركزك، حيك في جدة، وقدمك المفضلة لتصدر لك بطاقة فيفا تبدأ من طاقة 50 OVR للجميع بكل عدالة.
            </p>
          </div>

          <div className="bg-[#0b0d13] border border-[#1d222f] p-4 sm:p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 font-black flex items-center justify-center font-mono text-sm border border-blue-500/30">
              2
            </div>
            <h3 className="text-sm font-black text-white">العب بضمان العربون والتنظيم</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              احجز ملاعب معتمدة، أطلق تحديات 50/50 يتقاسم فيها الفريقان التكلفة تلقائياً، واستعن بحكام معتمدين بجدة.
            </p>
          </div>

          <div className="bg-[#0b0d13] border border-[#1d222f] p-4 sm:p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 font-black flex items-center justify-center font-mono text-sm border border-emerald-500/30">
              3
            </div>
            <h3 className="text-sm font-black text-white">قيّم وارتقِ بطاقتك واكسب كوينز</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              بعد الصافرة، أجرِ تقييماً أعمى وسرياً لزملائك لمضاعفة نقاطك ×3 والحصول على مكافآت وخصومات الملاعب.
            </p>
          </div>
        </div>
      </section>

      {/* 4. ركائز الأمان والنزاهة والعدالة (Trust & Safety) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="bg-[#0d1017] border border-[#1c2230] p-4 rounded-2xl flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white">حماية من التقييم الكيدي</h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
              خوارزمية ذكية تستبعد فوراً أي تقييمات شاذة أو متعصبة لحماية نزاهة وتطور بطاقة اللاعب.
            </p>
          </div>
        </div>

        <div className="bg-[#0d1017] border border-[#1c2230] p-4 rounded-2xl flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#d4af37]/10 text-[#f5d77f] border border-[#d4af37]/20 shrink-0 mt-0.5">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white">ضمان العربون المالي</h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
              حجز الملاعب مشروط بعربون 100 ر.س إلكتروني مضمون، ينهي تماماً ظاهرة التغيب وإلغاء المباريات.
            </p>
          </div>
        </div>

        <div className="bg-[#0d1017] border border-[#1c2230] p-4 rounded-2xl flex items-start gap-3 sm:col-span-2 lg:col-span-1">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0 mt-0.5">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white">ميثاق أمان الناشئين (&lt;18)</h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
              حماية كاملة للناشئين وفصل بطاقاتهم، مع اشتراط إشعار ولي الأمر أو الكابتن عند دعوات التجارب.
            </p>
          </div>
        </div>
      </section>

      {/* 5. دعوة نهائية للانضمام (Bottom CTA) */}
      <section className="bg-gradient-to-r from-amber-500/15 via-[#121622] to-emerald-500/10 border border-[#2e374d] rounded-3xl p-6 sm:p-8 text-center space-y-4">
        <h2 className="text-lg sm:text-2xl font-black text-white font-['Changa',sans-serif]">
          جاهز لبدء رحلتك الكروية في ملاعب جدة؟
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          انضم الآن إلى آلاف اللاعبين والكباتن وأصحاب الملاعب واستمتع بتجربة كرة قدم ذكية وممتعة.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenRegister}
            className="gold-gradient-btn px-8 py-3 rounded-2xl text-xs sm:text-sm font-black shadow-lg active:scale-95 transition w-full sm:w-auto"
          >
            سجل الآن مجاناً 🚀
          </button>
          <button
            onClick={onExploreAsGuest}
            className="px-6 py-3 rounded-2xl bg-[#141824] hover:bg-[#1d2334] text-slate-200 border border-[#283144] text-xs sm:text-sm font-bold transition w-full sm:w-auto"
          >
            استكشف كزائر أولاً
          </button>
        </div>
      </section>
    </div>
  );
};
