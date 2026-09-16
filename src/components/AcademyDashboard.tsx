import React, { useState } from 'react';
import { 
  Player, 
  PlayerPosition, 
  AgeCategory, 
  AcademyProfile, 
  AcademySubscriptionPlan, 
  AcademyPlanTier, 
  TrialInvitation 
} from '../types';
import { JEDDAH_NEIGHBORHOODS } from '../utils/cardRatingEngine';
import { SendTrialInviteModal } from './SendTrialInviteModal';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  ShieldCheck, 
  Send, 
  Crown, 
  Star, 
  MapPin, 
  Users, 
  Lock, 
  EyeOff, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  CreditCard, 
  ChevronRight, 
  Award, 
  Phone, 
  Clock, 
  AlertCircle,
  FileCheck2,
  Building2,
  TrendingUp,
  LineChart as LineChartIcon,
  Zap,
  X
} from 'lucide-react';

interface AcademyDashboardProps {
  players: Player[];
  onShowToast: (message: string) => void;
  onSelectPlayerDetail?: (player: Player) => void;
}

export const ACADEMY_PLANS: AcademySubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'باقة الأكاديميات الصاعدة (Starter)',
    monthlyPrice: 350,
    annualPrice: 3500,
    badge: 'كشاف مبتدئ',
    invitationsPerMonth: 5,
    searchQuota: '50 عملية بحث شهرياً',
    features: [
      'البحث في بطاقات اللاعبين المتاحة للكشافين',
      'فلترة متقدمة حسب الفئة السنية والموقع بجدة',
      'إرسال حتى 5 دعوات اختبار أداء رسمية شهرياً',
      'حماية خصوصية القصر وإشعار أولياء الأمور',
      'دعم فني عبر المنصة',
    ],
  },
  {
    id: 'scout_pro',
    name: 'باقة كشاف المحترفين (Scout Pro)',
    monthlyPrice: 850,
    annualPrice: 8500,
    badge: 'كشاف معتمد',
    isPopular: true,
    invitationsPerMonth: 20,
    searchQuota: 'بحث غير محدود في جميع أحياء جدة',
    features: [
      'كافة مزايا باقة Starter',
      'إرسال حتى 20 دعوة اختبار أداء رسمية شهرياً',
      'تقارير فنية تفصيلية ومقارنة الرادار الإحصائي',
      'أولوية الوصول لمواهب تشكيلة الأسبوع (TOTW)',
      'سجل تاريخي لتتبع تطور مهارات الموهبة وتدرج بطاقته',
      'توفير نماذج تجارب الأداء المعتمدة رسمياً',
    ],
  },
  {
    id: 'premier_elite',
    name: 'باقة النخبة الممتازة (Premier Elite)',
    monthlyPrice: 1950,
    annualPrice: 19500,
    badge: 'أكاديمية نخبة',
    invitationsPerMonth: 60,
    searchQuota: 'وصول شامل وكامل للمواهب المحتملة',
    features: [
      'كافة مزايا باقة Scout Pro',
      'إرسال حتى 60 دعوة تجربة أداء شهرياً مع متابعة فورية',
      'تنبيهات فورية عند ظهور لاعب واعد بمعدل نمو استثنائي (+5 OVR)',
      'تنسيق مباشر ومحمي مع أولياء أمور الفئات السنية',
      'توثيق علامة الأكاديمية الذهبية المعتمدة في واجهة المنصة',
      'مدير حساب رياضي مخصص لدعم الاستقطاب وتجارب الملاعب',
    ],
  },
];

const INITIAL_ACADEMY: AcademyProfile = {
  id: 'acad-jeddah-1',
  academyName: 'أكاديمية جدة للمواهب والاحتراف الرياضي',
  city: 'جدة',
  headScoutName: 'كابتن تركي الزهراني (كشاف معتمد)',
  licenseNumber: 'KSA-SOP-2026-8841',
  neighborhood: 'حي الصفا',
  contactEmail: 'scouting@jeddah-academy.sa',
  contactPhone: '0567788990',
  avatarUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=400&auto=format&fit=crop&q=80',
  plan: 'scout_pro',
  planStatus: 'active',
  subscribedUntil: '2026-12-31',
  availableInvitations: 16,
  totalInvitationsSent: 4,
  acceptedTrialsCount: 3,
};

const INITIAL_INVITATIONS: TrialInvitation[] = [
  {
    id: 'invite-1',
    academyId: 'acad-jeddah-1',
    academyName: 'أكاديمية جدة للمواهب والاحتراف الرياضي',
    scoutName: 'كابتن تركي الزهراني',
    playerId: 'player-2',
    playerName: 'سعود الشهري',
    playerPosition: 'LW',
    playerAge: 16,
    playerAgeCategory: 'under_18',
    playerNeighborhood: 'حي أبحر الشمالية',
    pitchLocation: 'أرينا الصفا الدولية - الملعب الرئيسي للأكاديمية',
    trialDate: '2026-09-20',
    trialTime: '18:00',
    trialType: 'youth_academy_trial',
    status: 'accepted',
    sentAt: '2026-09-12',
    guardianPhoneRequired: true,
    confidentialNotes: 'جناح أيسر مهاري جداً وسريع (91 PAC)، تم التنسيق مع ولي أمره لحضور تجارب فئة الناشئين.',
    transportationProvided: true,
  },
  {
    id: 'invite-2',
    academyId: 'acad-jeddah-1',
    academyName: 'أكاديمية جدة للمواهب والاحتراف الرياضي',
    scoutName: 'كابتن تركي الزهراني',
    playerId: 'player-1',
    playerName: 'فيصل الغامدي',
    playerPosition: 'ST',
    playerAge: 23,
    playerAgeCategory: 'adults',
    playerNeighborhood: 'حي الحمدانية',
    pitchLocation: 'ملاعب الجوهرة سبورتس - مجمع راقي',
    trialDate: '2026-09-24',
    trialTime: '20:30',
    trialType: 'first_team_scouting',
    status: 'sent',
    sentAt: '2026-09-14',
    guardianPhoneRequired: false,
    confidentialNotes: 'مهاجم هداف حاسم برصيد أهداف عالي ومعدل 78 OVR، مطلوب لاختبارات الفريق الرديف.',
    transportationProvided: false,
  },
];

export const AcademyDashboard: React.FC<AcademyDashboardProps> = ({
  players,
  onShowToast,
  onSelectPlayerDetail,
}) => {
  // حالة الأكاديمية والاشتراك
  const [academy, setAcademy] = useState<AcademyProfile>(INITIAL_ACADEMY);
  const [activeTab, setActiveTab] = useState<'scout_search' | 'invitations' | 'subscription'>('scout_search');

  // الدعوات المرسلة
  const [invitations, setInvitations] = useState<TrialInvitation[]>(INITIAL_INVITATIONS);

  // إدارة مودال إرسال الدعوة
  const [selectedTargetPlayer, setSelectedTargetPlayer] = useState<Player | null>(null);

  // إدارة مودال ترقية الاشتراك
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<AcademySubscriptionPlan>(ACADEMY_PLANS[1]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // فلاتر محرك بحث المواهب المتقدم
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgeCategory, setFilterAgeCategory] = useState<'all' | AgeCategory>('all');
  const [filterPosition, setFilterPosition] = useState<'all' | PlayerPosition>('all');
  const [filterMinOverall, setFilterMinOverall] = useState<number>(50);
  const [filterNeighborhood, setFilterNeighborhood] = useState<string>('all');
  const [filterFoot, setFilterFoot] = useState<'all' | 'right' | 'left' | 'both'>('all');
  const [filterMinPace, setFilterMinPace] = useState<number>(0);
  const [filterDisciplineMin, setFilterDisciplineMin] = useState<number>(0);

  // خيار استثناء اللاعبين الذين حجبوا الظهور للكشافين لحماية خصوصيتهم
  const [respectPrivacyFlag, setRespectPrivacyFlag] = useState(true);

  // معالجة إرسال دعوة جديدة
  const handleSendInvite = (newInvite: TrialInvitation) => {
    setInvitations([newInvite, ...invitations]);
    setAcademy((prev) => ({
      ...prev,
      availableInvitations: Math.max(0, prev.availableInvitations - 1),
      totalInvitationsSent: prev.totalInvitationsSent + 1,
    }));
    onShowToast(`تم بنجاح إرسال دعوة اختبار الأداء الرسمية للاعب [${newInvite.playerName}]! مع تشفير البيانات وإشعار الجهة المختصة.`);
  };

  // معالجة ترقية الاشتراك
  const handleConfirmUpgrade = (plan: AcademySubscriptionPlan) => {
    setAcademy((prev) => ({
      ...prev,
      plan: plan.id,
      planStatus: 'active',
      availableInvitations: prev.availableInvitations + plan.invitationsPerMonth,
    }));
    setIsUpgradeModalOpen(false);
    onShowToast(`🎉 تهانينا! تم تفعيل [${plan.name}] بنجاح، وإضافة ${plan.invitationsPerMonth} دعوة اختبار أداء إلى رصيدك!`);
  };

  // محرك البحث المتقدم في قائمة اللاعبين
  const scoutablePlayers = players.filter((player) => {
    // التحقق من خصوصية اللاعب: إذا فعل خيار الخصوصية، يظهر فقط من وافقوا على الظهور للكشافين
    if (respectPrivacyFlag && !player.allowScoutVisibility) {
      return false;
    }

    // البحث النصي
    const matchesText =
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.clubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());

    // فلتر الفئة السنية
    const matchesAge =
      filterAgeCategory === 'all' ? true : player.ageCategory === filterAgeCategory;

    // فلتر المركز
    const matchesPosition =
      filterPosition === 'all' ? true : player.position === filterPosition;

    // فلتر التقييم الإجمالي الأدنى OVR
    const matchesOverall = player.overall >= filterMinOverall;

    // فلتر الحي
    const matchesNeighborhood =
      filterNeighborhood === 'all' ? true : player.neighborhood === filterNeighborhood;

    // فلتر القدم المفضلة
    const matchesFoot =
      filterFoot === 'all' ? true : player.preferredFoot === filterFoot;

    // فلتر السرعة للـ Field Players
    const paceValue = 'pac' in player.stats ? player.stats.pac : 0;
    const matchesPace = filterMinPace > 0 ? paceValue >= filterMinPace : true;

    // فلتر نقاط الانضباط
    const matchesDiscipline =
      filterDisciplineMin > 0 ? (player.disciplineScore || 100) >= filterDisciplineMin : true;

    return (
      matchesText &&
      matchesAge &&
      matchesPosition &&
      matchesOverall &&
      matchesNeighborhood &&
      matchesFoot &&
      matchesPace &&
      matchesDiscipline
    );
  });

  const currentPlanObj = ACADEMY_PLANS.find((p) => p.id === academy.plan) || ACADEMY_PLANS[0];

  return (
    <div className="space-y-6">
      {/* الرأس الترحيبي وبطاقة ترخيص الأكاديمية والاشتراك النشط */}
      <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={academy.avatarUrl}
                alt={academy.academyName}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-[#d4af37]/60 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full border-2 border-[#11141b]" title="ترخيص معتمد">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold font-['Changa',sans-serif] text-white">
                  {academy.academyName}
                </h2>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-[#f5d77f]" />
                  <span>{currentPlanObj.badge}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <FileCheck2 className="w-3 h-3" />
                  <span>ترخيص: {academy.licenseNumber}</span>
                </span>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                <span className="text-slate-300 font-bold">{academy.headScoutName}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#d4af37]">
                  <MapPin className="w-3.5 h-3.5" />
                  {academy.neighborhood}، جدة
                </span>
                <span>•</span>
                <span>ساري حتى: {academy.subscribedUntil}</span>
              </div>
            </div>
          </div>

          {/* إحصائيات سريعة للرصيد والدعوات */}
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1">
            <div className="bg-[#08090d] border border-[#222735] p-3.5 rounded-2xl text-center min-w-[110px] flex-1 lg:flex-initial">
              <div className="text-xs text-slate-400 font-medium">رصيد الدعوات</div>
              <div className="text-xl md:text-2xl font-black text-[#f5d77f] font-mono mt-0.5">
                {academy.availableInvitations}
              </div>
              <div className="text-[10px] text-slate-400">متاحة هذا الشهر</div>
            </div>

            <div className="bg-[#08090d] border border-[#222735] p-3.5 rounded-2xl text-center min-w-[110px] flex-1 lg:flex-initial">
              <div className="text-xs text-slate-400 font-medium">دعوات مرسلة</div>
              <div className="text-xl md:text-2xl font-black text-white font-mono mt-0.5">
                {invitations.length}
              </div>
              <div className="text-[10px] text-blue-400">تجارب أداء</div>
            </div>

            <div className="bg-[#08090d] border border-[#222735] p-3.5 rounded-2xl text-center min-w-[110px] flex-1 lg:flex-initial">
              <div className="text-xs text-slate-400 font-medium">تجارب مقبولة</div>
              <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono mt-0.5">
                {invitations.filter((i) => i.status === 'accepted').length}
              </div>
              <div className="text-[10px] text-emerald-400">حضور مؤكد</div>
            </div>

            <button
              id="btn-upgrade-plan-header"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="gold-gradient-btn px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-lg hover:scale-105 transition"
            >
              <CreditCard className="w-4 h-4" />
              <span>ترقية الاشتراك</span>
            </button>
          </div>
        </div>

        {/* شريط تبويبات لوحة التحكم */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#222735] text-xs">
          {[
            { id: 'scout_search', label: 'محرك بحث المواهب الذكي', icon: Search },
            { id: 'invitations', label: `دعوات تجارب الأداء (${invitations.length})`, icon: Send },
            { id: 'subscription', label: 'إدارة باقات الاشتراك والترقية', icon: Crown },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#161a23]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. تبويب محرك بحث المواهب المتقدم */}
      {activeTab === 'scout_search' && (
        <div className="space-y-5">
          {/* قسم الفلاتر المتقدمة (العمر، التقييم، الموقع بجدة، المركز، السرعة، الانضباط) */}
          <div className="bg-[#11141b] border border-[#222735] p-5 rounded-3xl space-y-4 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#222735] pb-3.5">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#f5d77f]" />
                <h3 className="text-sm font-bold text-white">
                  معايير البحث والاستكشاف الفني المتقدم (Advanced Scouting Engine)
                </h3>
              </div>

              {/* صمام الأمان وحماية خصوصية بيانات اللاعبين */}
              <label className="flex items-center gap-2 bg-[#08090d] px-3.5 py-1.5 rounded-xl border border-blue-500/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={respectPrivacyFlag}
                  onChange={(e) => setRespectPrivacyFlag(e.target.checked)}
                  className="accent-[#d4af37] w-4 h-4 rounded"
                />
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-200 font-bold">
                  إنفاذ خصوصية اللاعبين (إظهار المصرّح لهم فقط بالظهور للكشافين)
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* شريط البحث النصي */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">اسم اللاعب أو الفريق:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم أو الفريق..."
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white pr-9 focus:border-[#d4af37] focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute top-2.5 right-3" />
                </div>
              </div>

              {/* فلتر الفئة السنية الإلزامي */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>الفئة السنية:</span>
                </label>
                <select
                  id="filter-scout-age"
                  value={filterAgeCategory}
                  onChange={(e) => setFilterAgeCategory(e.target.value as any)}
                  className="w-full bg-[#08090d] border border-[#222735] text-slate-200 rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="all">كافة الأعمار السنية</option>
                  <option value="under_18">فئات سنية وناشئين (&lt; 18 سنة)</option>
                  <option value="adults">كبار (18 سنة فما فوق)</option>
                </select>
              </div>

              {/* فلتر المركز */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>المركز التكتيكي:</span>
                </label>
                <select
                  id="filter-scout-position"
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value as any)}
                  className="w-full bg-[#08090d] border border-[#222735] text-slate-200 rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="all">جميع المراكز في الملعب</option>
                  <option value="GK">GK - حارس مرمى</option>
                  <option value="CB">CB - قلب دفاع</option>
                  <option value="LB">LB - ظهير أيسر</option>
                  <option value="RB">RB - ظهير أيمن</option>
                  <option value="CDM">CDM - محور ارتكاز</option>
                  <option value="CM">CM - وسط ميدان</option>
                  <option value="CAM">CAM - صانع ألعاب</option>
                  <option value="LW">LW - جناح أيسر</option>
                  <option value="RW">RW - جناح أيمن</option>
                  <option value="ST">ST - رأس حربة ومهاجم</option>
                </select>
              </div>

              {/* فلتر الموقع والحي بجدة */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#f5d77f]" />
                  <span>الحي والموقع في جدة:</span>
                </label>
                <select
                  id="filter-scout-neighborhood"
                  value={filterNeighborhood}
                  onChange={(e) => setFilterNeighborhood(e.target.value)}
                  className="w-full bg-[#08090d] border border-[#222735] text-slate-200 rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="all">جميع أحياء جدة</option>
                  {JEDDAH_NEIGHBORHOODS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* صف الفلاتر الإحصائية: الحد الأدنى OVR، السرعة، الانضباط، والقدم */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#1c222e] text-xs">
              {/* شريط تمرير الحد الأدنى للتقييم OVR */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    الحد الأدنى للتقييم:
                  </span>
                  <span className="font-mono text-[#f5d77f] font-bold text-sm">{filterMinOverall} OVR</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  value={filterMinOverall}
                  onChange={(e) => setFilterMinOverall(Number(e.target.value))}
                  className="w-full accent-[#d4af37]"
                />
              </div>

              {/* شريط الحد الأدنى للسرعة */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    سرعة الانطلاق (PAC):
                  </span>
                  <span className="font-mono text-teal-400 font-bold text-sm">{filterMinPace > 0 ? `+${filterMinPace}` : 'الكل'}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={95}
                  value={filterMinPace}
                  onChange={(e) => setFilterMinPace(Number(e.target.value))}
                  className="w-full accent-teal-400"
                />
              </div>

              {/* فلتر نقاط الانضباط والأخلاق الرياضية */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    انضباط الحضور والموعد:
                  </span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {filterDisciplineMin > 0 ? `+${filterDisciplineMin}%` : 'الكل'}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={95}
                  value={filterDisciplineMin}
                  onChange={(e) => setFilterDisciplineMin(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              {/* فلتر القدم المفضلة */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">القدم المفضلة:</label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'right', label: 'يمنى' },
                    { id: 'left', label: 'يسرى' },
                    { id: 'both', label: 'كلتاهما' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilterFoot(f.id as any)}
                      className={`py-1.5 rounded-lg text-center transition font-bold ${
                        filterFoot === f.id
                          ? 'bg-[#d4af37]/20 border border-[#d4af37] text-[#f5d77f]'
                          : 'bg-[#08090d] border border-[#222735] text-slate-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* شريط الإحصائيات ومعلومات الخصوصية */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span>تم العثور على <strong>{scoutablePlayers.length}</strong> موهبة مطابقة لمعايير الاستكشاف</span>
              {respectPrivacyFlag && (
                <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1 text-[11px]">
                  <Lock className="w-3 h-3" />
                  حماية الخصوصية مفعلة: تم حجب اللاعبين غير الراغبين بالظهور
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-400">
              الرصيد المتاح لإرسال دعوات التجارب: <strong className="text-[#f5d77f] font-mono">{academy.availableInvitations}</strong> دعوة
            </div>
          </div>

          {/* نتائج محرك البحث وبطاقات المواهب */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {scoutablePlayers.map((player) => {
              const isMinor = player.ageCategory === 'under_18' || player.age < 18;
              const hasExistingInvite = invitations.some((inv) => inv.playerId === player.id);

              return (
                <div
                  key={player.id}
                  className="bg-[#11141b] rounded-3xl border border-[#222735] hover:border-[#d4af37]/40 p-5 flex flex-col justify-between space-y-4 transition shadow-lg relative group"
                >
                  <div className="space-y-3.5">
                    {/* رأس بطاقة الموهبة */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={player.avatarUrl}
                            alt={player.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#d4af37]/40"
                          />
                          <span className="absolute -bottom-1 -left-1 bg-slate-900 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold text-white border border-[#222735]">
                            #{player.number}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-white group-hover:text-[#f5d77f] transition flex items-center gap-1.5">
                            {player.name}
                          </h4>
                          <div className="text-xs text-slate-400">{player.clubName}</div>
                          <div className="text-[11px] text-[#d4af37] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{player.neighborhood}</span>
                          </div>
                        </div>
                      </div>

                      {/* شارة التقييم الإجمالي والفئة السنية */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xl font-black text-[#f5d77f] font-mono bg-[#08090d] px-2.5 py-1 rounded-xl border border-[#d4af37]/30 shadow-inner">
                          {player.overall}
                        </div>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                            isMinor
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {isMinor ? 'فئة الناشئين (<18)' : 'فئة الكبار (18+)'}
                        </span>
                      </div>
                    </div>

                    {/* شبكة الإحصائيات الفنية */}
                    <div className="bg-[#08090d] p-3 rounded-2xl border border-[#222735] space-y-2 text-xs">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-1.5 rounded-xl bg-[#11141b] border border-[#222735]">
                          <div className="text-[10px] text-slate-400">المركز</div>
                          <div className="font-bold text-[#f5d77f] font-mono">{player.position}</div>
                        </div>
                        <div className="p-1.5 rounded-xl bg-[#11141b] border border-[#222735]">
                          <div className="text-[10px] text-slate-400">العمر</div>
                          <div className="font-bold text-white font-mono">{player.age} سنة</div>
                        </div>
                        <div className="p-1.5 rounded-xl bg-[#11141b] border border-[#222735]">
                          <div className="text-[10px] text-slate-400">القدم</div>
                          <div className="font-bold text-white">
                            {player.preferredFoot === 'right' ? 'يمنى' : player.preferredFoot === 'left' ? 'يسرى' : 'كلتاهما'}
                          </div>
                        </div>
                      </div>

                      {/* إحصائيات الميدان الرئيسية */}
                      {'pac' in player.stats && (
                        <div className="grid grid-cols-6 gap-1 text-center font-mono text-[10px] pt-1">
                          <div className="bg-[#161a23] p-1 rounded">
                            <span className="text-slate-400 block text-[8px]">PAC</span>
                            <span className="font-bold text-teal-400">{player.stats.pac}</span>
                          </div>
                          <div className="bg-[#161a23] p-1 rounded">
                            <span className="text-slate-400 block text-[8px]">SHO</span>
                            <span className="font-bold text-amber-400">{player.stats.sho}</span>
                          </div>
                          <div className="bg-[#161a23] p-1 rounded">
                            <span className="text-slate-400 block text-[8px]">PAS</span>
                            <span className="font-bold text-blue-400">{player.stats.pas}</span>
                          </div>
                          <div className="bg-[#161a23] p-1 rounded">
                            <span className="text-slate-400 block text-[8px]">DRI</span>
                            <span className="font-bold text-purple-400">{player.stats.dri}</span>
                          </div>
                          <div className="bg-[#161a23] p-1 rounded">
                            <span className="text-slate-400 block text-[8px]">DEF</span>
                            <span className="font-bold text-red-400">{player.stats.def}</span>
                          </div>
                          <div className="bg-[#161a23] p-1 rounded">
                            <span className="text-slate-400 block text-[8px]">PHY</span>
                            <span className="font-bold text-emerald-400">{player.stats.phy}</span>
                          </div>
                        </div>
                      )}

                      {/* مؤشر الانضباط والحضور */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#161a24]">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          الانضباط والروح الرياضية:
                        </span>
                        <span className="font-bold text-white font-mono">{player.disciplineScore || 95}%</span>
                      </div>
                    </div>

                    {/* حماية خصوصية بيانات الاتصال */}
                    <div className="p-2.5 bg-slate-900/60 rounded-xl border border-[#222735] flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>بيانات الاتصال المباشرة:</span>
                      </span>
                      <span className="text-[10px] bg-[#161a23] text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                        {isMinor ? 'محمية (تواصل عبر ولي الأمر)' : 'مشفرة عبر دعوة المنصة'}
                      </span>
                    </div>
                  </div>

                  {/* إجراءات الكشاف: إرسال دعوة اختبار أداء رسمية أو استعراض البطاقة */}
                  <div className="space-y-2 pt-1">
                    {hasExistingInvite ? (
                      <div className="w-full py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        <span>تم إرسال دعوة تجربة أداء مسبقاً</span>
                      </div>
                    ) : (
                      <button
                        id={`btn-invite-player-${player.id}`}
                        onClick={() => setSelectedTargetPlayer(player)}
                        disabled={academy.availableInvitations <= 0}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md ${
                          academy.availableInvitations > 0
                            ? 'gold-gradient-btn text-slate-950 hover:scale-[1.02]'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>إرسال دعوة اختبار أداء رسمية</span>
                      </button>
                    )}

                    {onSelectPlayerDetail && (
                      <button
                        id={`btn-scout-analytics-${player.id}`}
                        onClick={() => onSelectPlayerDetail(player)}
                        className="w-full py-2 rounded-xl bg-[#08090d] hover:bg-[#161a23] hover:border-[#d4af37]/50 text-slate-200 border border-[#222735] text-[11px] font-bold transition flex items-center justify-between px-3"
                      >
                        <span className="flex items-center gap-1.5 text-[#f5d77f]">
                          <LineChartIcon className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>تحليلات الأداء (السرعة، التمرير، الدفاع)</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">10 مباريات ➔</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {scoutablePlayers.length === 0 && (
            <div className="p-12 text-center bg-[#11141b] rounded-3xl border border-[#222735] space-y-3">
              <AlertCircle className="w-10 h-10 text-[#d4af37] mx-auto opacity-70" />
              <h4 className="text-base font-bold text-white">لم يتم العثور على لاعبين يطابقون شروط البحث</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                يرجى تخفيف معايير التقييم أو فلاتر الأحياء في جدة، أو تأكد من تفعيل خيار خصوصية ظهور اللاعبين.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterAgeCategory('all');
                  setFilterPosition('all');
                  setFilterMinOverall(50);
                  setFilterNeighborhood('all');
                  setFilterFoot('all');
                  setFilterMinPace(0);
                  setFilterDisciplineMin(0);
                }}
                className="px-4 py-2 bg-[#161a23] hover:bg-[#1e2330] rounded-xl text-xs font-bold text-[#f5d77f] border border-[#222735]"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. تبويب دعوات اختبار الأداء المرسلة ومتابعة الحالات */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          <div className="bg-[#11141b] p-5 rounded-3xl border border-[#222735] flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-[#f5d77f]" />
                <span>سجل دعوات اختبارات الأداء الرسمية (Trials Tracker)</span>
              </h3>
              <p className="text-xs text-slate-400">
                متابعة حالة الدعوات المرسلة للاعبين، مواعيد التجمع في ملاعب جدة، وردود أولياء الأمور
              </p>
            </div>

            <button
              onClick={() => setActiveTab('scout_search')}
              className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>البحث عن موهبة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {invitations.map((inv) => {
              const isAccepted = inv.status === 'accepted';
              const isSent = inv.status === 'sent';

              return (
                <div
                  key={inv.id}
                  className="bg-[#11141b] border border-[#222735] p-5 rounded-3xl space-y-3 shadow-md"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#222735] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center font-mono font-black text-[#f5d77f]">
                        {inv.playerPosition}
                      </div>

                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{inv.playerName}</span>
                          <span className="text-[10px] text-slate-400">({inv.playerAge} سنة • {inv.playerNeighborhood})</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>الكشاف المسؤول: {inv.scoutName}</span>
                          <span>•</span>
                          <span>أُرسلت في: {inv.sentAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold border flex items-center gap-1.5 ${
                          isAccepted
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : isSent
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isAccepted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تم قبول الدعوة وتأكيد الحضور</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>بانتظار رد اللاعب / ولي الأمر</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* تفاصيل الموعد والملعب */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#08090d] p-3 rounded-2xl border border-[#222735]">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-[#f5d77f]" />
                      <span>الموعد: <strong>{inv.trialDate} ({inv.trialTime})</strong></span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span className="truncate">المقر: <strong>{inv.pitchLocation}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span>
                        نوع الاختبار:{' '}
                        <strong>
                          {inv.trialType === 'youth_academy_trial'
                            ? 'تجارب فئات سنية'
                            : inv.trialType === 'first_team_scouting'
                            ? 'معايشة فريق أول'
                            : 'تقييم بدني'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* الملاحظات الفنية وميثاق الخصوصية */}
                  {inv.confidentialNotes && (
                    <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-[#222735]">
                      <span className="text-[#f5d77f] font-bold block mb-1">التقرير الفني وملاحظة الكشاف:</span>
                      {inv.confidentialNotes}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                      {inv.guardianPhoneRequired && (
                        <span className="text-blue-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          تم إشعار ولي الأمر نظاماً
                        </span>
                      )}
                      {inv.transportationProvided && (
                        <span className="text-emerald-400">• شامل توفير حافلة نقل من مقر الحي</span>
                      )}
                    </div>

                    {isSent && (
                      <span className="text-[11px] text-amber-400/80 font-medium">
                        بانتظار رد اللاعب أو ولي أمره
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. تبويب إدارة باقات الاشتراكات المدفوعة */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="bg-[#11141b] border border-[#222735] p-6 rounded-3xl space-y-3 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#f5d77f]" />
                  <span>باقات اشتراكات الأكاديميات والكشافين المعتمدة</span>
                </h3>
                <p className="text-xs text-slate-400">
                  حلول تقنية متكاملة تمنح أكاديميتك صلاحيات الاستكشاف الفني المباشر وإرسال دعوات التجارب مع حفظ خصوصية القصر
                </p>
              </div>

              {/* زر التبديل بين الدفع الشهري والسنوي (مع خصم شهرين مجاناً) */}
              <div className="flex items-center gap-2 bg-[#08090d] p-1.5 rounded-2xl border border-[#222735]">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    billingCycle === 'monthly'
                      ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  اشتراك شهري
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    billingCycle === 'annual'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>اشتراك سنوي</span>
                  <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                    وفر 17%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* بطاقات الباقات الثلاث */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ACADEMY_PLANS.map((plan) => {
              const isCurrent = academy.plan === plan.id;
              const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;

              return (
                <div
                  key={plan.id}
                  className={`bg-[#11141b] rounded-3xl border p-6 flex flex-col justify-between space-y-5 transition shadow-xl relative ${
                    isCurrent
                      ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30 bg-gradient-to-b from-[#11141b] to-[#171c26]'
                      : plan.isPopular
                      ? 'border-emerald-500/40 hover:border-emerald-500'
                      : 'border-[#222735] hover:border-slate-700'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[10px] px-3 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                      الباقة الأكثر طلباً للأكاديميات
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/30">
                        {plan.badge}
                      </span>
                      {isCurrent && (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          باقتك الحالية
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{plan.searchQuota}</p>
                    </div>

                    <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-black text-white font-mono">{price}</span>
                        <span className="text-xs text-slate-400">ريال سعودي / {billingCycle === 'monthly' ? 'شهرياً' : 'سنوياً'}</span>
                      </div>
                      <div className="text-[11px] text-[#f5d77f] font-bold mt-1">
                        تتضمن <strong>{plan.invitationsPerMonth}</strong> دعوة اختبار أداء شهرياً
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-300">
                      <span className="font-bold text-slate-400 block text-[11px]">مزايا الباقة:</span>
                      {plan.features.map((f, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#f5d77f] shrink-0 mt-0.5" />
                          <span className="leading-tight">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {isCurrent ? (
                      <div className="w-full py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs text-center flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>اشتراكك نشط حالياً</span>
                      </div>
                    ) : (
                      <button
                        id={`btn-select-plan-${plan.id}`}
                        onClick={() => {
                          setSelectedPlanForUpgrade(plan);
                          setIsUpgradeModalOpen(true);
                        }}
                        className="w-full py-2.5 rounded-xl gold-gradient-btn text-xs font-bold text-slate-950 transition hover:scale-105 shadow-md flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>اختيار والترقية لهذه الباقة</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* نافذة مودال إرسال دعوة اختبار الأداء الرسمية */}
      {selectedTargetPlayer && (
        <SendTrialInviteModal
          player={selectedTargetPlayer}
          academy={academy}
          isOpen={true}
          onClose={() => setSelectedTargetPlayer(null)}
          onSendInvite={handleSendInvite}
        />
      )}

      {/* نافذة مودال ترقية الاشتراك وتأكيد السداد */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-6 md:p-8 max-w-md w-full space-y-5 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222735] pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#f5d77f]" />
                <h3 className="text-base font-bold text-white">ترقية اشتراك الأكاديمية</h3>
              </div>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="p-1 rounded-xl bg-[#161a23] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-2">
                <div className="text-slate-400">الباقة المختارة:</div>
                <div className="font-bold text-white text-sm">{selectedPlanForUpgrade.name}</div>
                <div className="flex items-center justify-between pt-2 border-t border-[#1c222e]">
                  <span className="text-slate-400">قيمة الاشتراك:</span>
                  <span className="font-mono text-lg font-bold text-[#f5d77f]">
                    {billingCycle === 'monthly' ? selectedPlanForUpgrade.monthlyPrice : selectedPlanForUpgrade.annualPrice} ر.س
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>سيتم فوراً تفعيل رصيد {selectedPlanForUpgrade.invitationsPerMonth} دعوة اختبار أداء شهرياً</span>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl space-y-1 text-blue-300">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>ضمان الاعتماد وسرية التعاقدات:</span>
                </div>
                <p className="text-[11px] text-blue-200/90 leading-relaxed">
                  تتيح الباقة التواصل مع أولياء الأمور وحجز الملاعب المعتمدة بجدة لإجراء اختبارات الأداء وفق لائحة الاتحاد السعودي لكرة القدم.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#161a23] text-slate-400 hover:text-white font-bold"
                >
                  إلغاء
                </button>
                <button
                  id="btn-confirm-plan-payment"
                  type="button"
                  onClick={() => handleConfirmUpgrade(selectedPlanForUpgrade)}
                  className="gold-gradient-btn px-5 py-2 rounded-xl text-slate-950 font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>تأكيد السداد وتفعيل الباقة</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
