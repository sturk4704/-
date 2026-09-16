import React, { useState } from 'react';
import { UserRole } from '../types';
import { 
  X, 
  ShieldCheck, 
  Users, 
  Trophy, 
  MapPin, 
  GraduationCap, 
  Scale, 
  CheckCircle2, 
  ArrowRight,
  EyeOff,
  Coins,
  Swords,
  Sparkles,
  Award,
  Crown
} from 'lucide-react';

interface RoleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: UserRole;
  onSelectRole?: (role: UserRole) => void;
}

interface RoleDetailInfo {
  role: UserRole;
  title: string;
  name: string;
  badge: string;
  avatar: string;
  heroColor: string;
  summary: string;
  primaryFeatures: { title: string; desc: string }[];
  exclusivePermissions: string[];
  kpisSample: string[];
}

const ROLES_INFO: RoleDetailInfo[] = [
  {
    role: 'player',
    title: 'حساب اللاعب (Player Portal)',
    name: 'محمد السالم',
    badge: 'لاعب أساسي • OVR 78',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    heroColor: 'from-amber-500/20 to-amber-950/20 border-[#d4af37]/40',
    summary: 'واجهة مخصصة للاعبين لبناء هويتهم الكروية، متابعة تطور بطاقتهم، والبحث عن فرق ومباريات بجدة.',
    primaryFeatures: [
      {
        title: 'بطاقة فيفا الرقمية التفاعلية',
        desc: 'طاقة تبدأ من 50 OVR وتتطور تلقائياً بعد كل مباراة عبر التقييم الأعمى السري.'
      },
      {
        title: 'معادلة التقييم (×3 / -1.5)',
        desc: 'تقييم زملائك فوق 6.0 يضاعف النقاط ثلاث مرات، مع حماية تامة من التقييم الكيدي.'
      },
      {
        title: 'متجر المكافآت وكابتن كوينز',
        desc: 'تحويل الأداء الممتاز إلى عملات رقمية لاستبدالها بخصومات الملاعب ومعدات رياضية.'
      },
      {
        title: 'سوق الانتقالات كلاعب حر',
        desc: 'عرض بطاقتك للكباتن لتلقي دعوات الانضمام للمباريات والتحديات الودية.'
      }
    ],
    exclusivePermissions: [
      'التقييم الأعمى السري للمباريات',
      'تعديل المهارات والمركز والحي',
      'تجميع كابتن كوينز والمكافآت',
      'تصدير بطاقة فيفا كصورة PNG'
    ],
    kpisSample: ['الطاقة OVR 78', 'رصيد 350 كوينز', '4 شارات مفتوحة']
  },
  {
    role: 'captain',
    title: 'حساب كابتن الفريق والمنظم (Captain Portal)',
    name: 'كابتن سامي الزهراني',
    badge: 'كابتن معتمد • نمور جدة',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    heroColor: 'from-blue-500/20 to-blue-950/20 border-blue-500/40',
    summary: 'بوابة قيادية لكباتن الفرق لإدارة التكتيك والتشكيلة، إصدار تحديات 50/50، واستقطاب أفضل اللاعبين.',
    primaryFeatures: [
      {
        title: 'نظام تحديات 50/50 وتقاسم العربون',
        desc: 'إصدار تحدي ضد فريق آخر مع تقسيم الفاتورة مناصفة (56.88 ريال لكل فريق) بضمان المنصة.'
      },
      {
        title: 'سبورة التكتيك الرياضي والتشكيلات',
        desc: 'بناء خطط اللعب (4-3-3, 4-4-2, 3-2-1) وحفظ وتوزيع اللاعبين الأساسيين والاحتياط.'
      },
      {
        title: 'طلب حكام معتمدين أو تحكيم ودي',
        desc: 'اختيار حكام للمباراة والاطلاع على تقييمات الحكام الوديين السرية والمحمية للكباتن فقط.'
      },
      {
        title: 'استقطاب اللاعبين وإرسال العقود',
        desc: 'البحث في قاعدة بيانات لاعبي جدة وإرسال عروض انتقال فورية وتفاوض مرن.'
      }
    ],
    exclusivePermissions: [
      'إصدار وقبول تحديات 50/50',
      'إدارة بورد التكتيك وحفظ الخطط',
      'عرض التقييمات السرية للحكام الوديين',
      'إرسال عروض الانتقال للاعبين الأحرار'
    ],
    kpisSample: ['14 انتصار متتالي', 'تقاسم تكاليف 100%', 'تشكيلة أساسية مكتملة']
  },
  {
    role: 'pitch_owner',
    title: 'حساب صاحب المنشأة والملعب (Pitch Owner Portal)',
    name: 'ملاعب الجوهرة الخضراء',
    badge: 'منشأة موثقة • شمال جدة',
    avatar: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&auto=format&fit=crop&q=80',
    heroColor: 'from-emerald-500/20 to-emerald-950/20 border-emerald-500/40',
    summary: 'منظومة تجارية متكاملة لملاك الملاعب بجدة لجدولة الحجوزات، تحصيل العربون، وضمان عدم التغيب.',
    primaryFeatures: [
      {
        title: 'العربون المضمون (100 ر.س)',
        desc: 'حماية كاملة من الحجوزات الوهمية والتغيب عبر دفع إلكتروني مسبق غير مسترد للمنشأة.'
      },
      {
        title: 'إدارة الملاعب والخدمات والمرافق',
        desc: 'تحديث نوع الأرضية (عشب صناعي معتمد)، المقاسات (7v7, 11v11)، الإضاءة وغرف الملابس.'
      },
      {
        title: 'تقارير الدخل المالي والفواتير',
        desc: 'متابعة صافي الأرباح، نسبة عمولة المنصة (10 ر.س فقط)، ومعدل إشغال الساعات المسائية.'
      },
      {
        title: 'توثيق الرخص البلدية والسلامة',
        desc: 'رفع المستندات الرسمية لظهور الملعب بالشارة الخضراء الموثقة وجذب كبرى الفرق.'
      }
    ],
    exclusivePermissions: [
      'تعديل أسعار وساعات الملعب الشاغرة',
      'استلام تحويلات العربون الإلكتروني المضمون',
      'حجب الفرق غير الملتزمة بالحضور',
      'رفع التراخيص والاعتمادات البلدية'
    ],
    kpisSample: ['نسبة إشغال 94%', 'عربون مضمون 0 تخلف', '4 ملاعب معتمدة']
  },
  {
    role: 'academy_scout',
    title: 'حساب كشاف الأكاديميات (Academy Scout Portal)',
    name: 'أكاديمية مواهب جدة الرياضية',
    badge: 'كشاف مرخص • اشتراك Scout Pro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    heroColor: 'from-purple-500/20 to-purple-950/20 border-purple-500/40',
    summary: 'رادار متقدم لكشافة الأندية والأكاديميات المعتمدة للبحث عن المواهب وتوجيه دعوات تجارب أداء رسمية.',
    primaryFeatures: [
      {
        title: 'رادار استكشاف المواهب وفلاتر المراكز',
        desc: 'فحص مهارات وسرعة اللاعبين حسب الحي والفئة السنية والمراكز التكتيكية المطلوبة.'
      },
      {
        title: 'دعوات تجارب الأداء الرسمية (Official Trials)',
        desc: 'إصدار استدعاء رسمي مشفر للموهبة مع إشعار ولي الأمر أو الكابتن لحماية الناشئين.'
      },
      {
        title: 'اشتراكات وباقات الكشافة المعتمدة',
        desc: 'باقات شهرية مجدولة تمنح رصيد دعوات رسمي ومحرك بحث مخصص للمحترفين.'
      },
      {
        title: 'متابعة نجوم الأسبوع والشهر (TOTW / TOTM)',
        desc: 'الرصد المبكر للاعبين الأكثر ثباتاً وتطوراً في ملاعب جدة لضمهم للمراحل المتقدمة.'
      }
    ],
    exclusivePermissions: [
      'البحث في بيانات اللاعبين المفعلين لخيار الكشافة',
      'إرسال وثائق تجارب الأداء الرسمية',
      'حفظ التقارير الفنية وأرشيف الملاحظات السرية',
      'الاطلاع على مقاييس السرعة والانضباط التراكمي'
    ],
    kpisSample: ['12 دعوة نشطة', '3 توقيعات الشهر', 'رصيد 15 دعوة متبقية']
  },
  {
    role: 'referee',
    title: 'حساب الحكم المعتمد والودي (Referee Portal)',
    name: 'الحكم أحمد الغامدي',
    badge: 'حكم معتمد • درجة ثانية',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    heroColor: 'from-slate-500/20 to-slate-900/20 border-slate-500/40',
    summary: 'منصة لإدارة التكليفات التحكيمية للمباريات الودية والبطولات، ضبط النزاهة، وحفظ سجل الحالات.',
    primaryFeatures: [
      {
        title: 'جدول تكليفات المباريات الودية',
        desc: 'استعراض المباريات المسندة، الملاعب، الفرق المتبارية، وتأكيد الحضور بضغطة زر.'
      },
      {
        title: 'نظام التحكيم الودي السري بين الفرق',
        desc: 'حماية سجل تقييمات الحكام الوديين بحيث تظهر حصراً للكباتن والمنظمين لضمان المصداقية.'
      },
      {
        title: 'لوائح وضوابط إدارة المباريات',
        desc: 'مرجع كامل لقوانين اللعب، حماية الفئات السنية، وفصل الصغار عن الكبار تماماً.'
      },
      {
        title: 'تقارير الانضباط ومكافحة السلوك الكيدي',
        desc: 'تسجيل الملاحظات الانضباطية التي تسهم في سلامة ونزاهة ملاعب جدة.'
      }
    ],
    exclusivePermissions: [
      'تأكيد واستلام تكليفات تحكيم المباريات',
      'تسجيل تقارير المباريات والإنذارات الرسمية',
      'الاطلاع على تفاصيل الفرق واللاعبين قبل اللقاء',
      'المشاركة في تطوير التحكيم الودي بالأحياء'
    ],
    kpisSample: ['28 مباراة محكمة', 'معدل حيادية 9.6/10', '0 شكاوى انضباطية']
  }
];

export const RoleGuideModal: React.FC<RoleGuideModalProps> = ({
  isOpen,
  onClose,
  currentUserRole,
  onSelectRole
}) => {
  const [selectedTabRole, setSelectedTabRole] = useState<UserRole>(currentUserRole);

  if (!isOpen) return null;

  const currentInfo = ROLES_INFO.find((r) => r.role === selectedTabRole) || ROLES_INFO[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#0e1117] border border-[#262c3d] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* رأس النافذة */}
        <div className="p-4 sm:p-6 border-b border-[#1c222e] flex items-center justify-between bg-[#121620]/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f5d77f]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-['Changa',sans-serif]">
                دليل منظومة الحسابات والصلاحيات (RBAC Directory)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تخصص المنصة واجهتها وتجربتها بالكامل حسب نوع الحساب المختار لتلبية احتياجاتك بدقة.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#161a24] hover:bg-[#202634] text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* شريط اختيار الدور للاستعراض */}
        <div className="flex items-center gap-1.5 p-3 bg-[#08090d] border-b border-[#1c222e] overflow-x-auto scrollbar-none shrink-0">
          {ROLES_INFO.map((item) => {
            const isSelected = item.role === selectedTabRole;
            const isCurrent = item.role === currentUserRole;
            return (
              <button
                key={item.role}
                onClick={() => setSelectedTabRole(item.role)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#d4af37] text-black shadow-md font-black'
                    : 'bg-[#121620] hover:bg-[#181f2c] text-slate-300 border border-[#222735]'
                }`}
              >
                <img src={item.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                <span>{item.title.split(' ')[1]}</span>
                {isCurrent && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-black/25 text-black font-black' : 'bg-emerald-500/20 text-emerald-400 font-mono'
                  }`}>
                    حسابك الحالي
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* محتوى الدور التفصيلي */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* بطاقة هيرو للدور المختار */}
          <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r ${currentInfo.heroColor} border flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
            <div className="flex items-center gap-3.5">
              <img 
                src={currentInfo.avatar} 
                alt="" 
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-lg shrink-0" 
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-white">{currentInfo.name}</h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black/40 text-[#f5d77f] border border-white/10">
                    {currentInfo.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  {currentInfo.summary}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 self-stretch md:self-auto">
              {currentUserRole === currentInfo.role ? (
                <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-1.5 w-full justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>أنت مسجل حالياً بهذا الدور</span>
                </div>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-[#121620] border border-[#222735] text-slate-400 font-bold text-xs flex items-center gap-1.5 w-full justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                  <span>صلاحية حصرية لهذا الدور</span>
                </div>
              )}
            </div>
          </div>

          {/* مؤشرات الأداء الحصرية لهذا الدور */}
          <div>
            <h4 className="text-xs font-black text-[#f5d77f] flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span>مؤشرات وإحصائيات تظهر في لوحة هذا الدور:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentInfo.kpisSample.map((kpi, idx) => (
                <div key={idx} className="bg-[#121620] border border-[#1e2433] p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{kpi}</span>
                  <span className="text-[10px] bg-[#090b10] px-2 py-0.5 rounded text-[#f5d77f] border border-[#222735]">
                    مفعل ✅
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* الميزات الأساسية */}
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-1.5 mb-3">
              <Trophy className="w-4 h-4 text-[#d4af37]" />
              <span>الميزات والخدمات المتاحة لهذا الحساب:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentInfo.primaryFeatures.map((feat, idx) => (
                <div key={idx} className="bg-[#121620] border border-[#1e2433] hover:border-[#d4af37]/30 transition p-3.5 rounded-2xl space-y-1">
                  <div className="text-xs font-black text-[#f5d77f] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                    <span>{feat.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* الصلاحيات المخصصة */}
          <div className="bg-[#090b10] border border-[#1e2433] p-4 rounded-2xl space-y-2.5">
            <h4 className="text-xs font-black text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>الصلاحيات الحصرية الممنوحة لحساب ({currentInfo.title}):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {currentInfo.exclusivePermissions.map((perm, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#121620] p-2 rounded-xl border border-[#1a1f2c]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* تذييل النافذة */}
        <div className="p-3.5 sm:p-4 border-t border-[#1c222e] bg-[#090b10] flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            تُفعل الميزات تلقائياً وفق نوع الحساب المعتمد أثناء التسجيل.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#161a24] hover:bg-[#202634] text-slate-200 font-bold text-xs transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
