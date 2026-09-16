import React, { useState, useEffect } from 'react';
import { 
  FriendlyChallenge, 
  AgeCategory, 
  SquadFormat, 
  SkillLevel,
  FINANCIAL_FEES, 
  Player, 
  RefereeEvaluation,
  Pitch 
} from '../types';
import { JEDDAH_NEIGHBORHOODS } from '../utils/cardRatingEngine';
import { MOCK_PITCHES } from './PitchAndInstitutionsSection';
import { FriendlyRefereeModal } from './FriendlyRefereeModal';
import { subscribeToChallenges, saveChallengeToCloud } from '../services/firestoreService';
import { 
  Swords, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Calendar, 
  CreditCard, 
  Users, 
  PlusCircle, 
  CheckCircle, 
  AlertTriangle,
  Send,
  MessageCircle,
  UserCheck,
  Lock,
  Eye,
  Star,
  Filter,
  Layers,
  Sparkles,
  Info,
  Check,
  Building2,
  Phone,
  Globe,
  Calculator,
  ChevronDown,
  ChevronUp,
  Compass,
  ArrowRight,
  Coins
} from 'lucide-react';

interface FriendlyChallengesSectionProps {
  players?: Player[];
  onUpdatePlayerRefereeProfile?: (playerId: string, evaluation: RefereeEvaluation) => void;
  currentCaptainTeam?: string;
  onBookPitchWithChallenge?: (challenge: FriendlyChallenge) => void;
  currentUserRole?: string;
  userCoins?: number;
}

// تصنيف أحياء جدة جغرافياً لتسهيل اختيار الكابتن
export const JEDDAH_ZONES: Record<string, string[]> = {
  'شمال جدة': ['حي الحمدانية', 'حي أبحر الشمالية', 'حي أبحر الجنوبية', 'حي المرجان', 'حي البساتين', 'حي الشاطئ', 'حي المحمدية', 'حي النعيم'],
  'وسط جدة': ['حي الروضة', 'حي الزهراء', 'حي السلامة', 'حي الأندلس', 'حي الخالدية', 'حي الحمراء', 'حي مشرفة'],
  'شرق جدة': ['حي السامر', 'حي الصفا', 'حي المروة', 'حي بريمان', 'حي المنار', 'حي التوفيق', 'حي السلمانية'],
  'جنوب جدة': ['حي الجامعة', 'حي النسيم', 'حي الفيحاء', 'حي الثغر', 'حي الرويس', 'حي البلد'],
};

// خيارات فئات الأعمار المعتمدة مع التكافؤ والأمان
export const AGE_PRESETS = [
  { id: 'adults_open', label: 'كبار وهواة (18 - 35 سنة)', category: 'adults' as AgeCategory, min: 18, max: 35, desc: 'الفئة الأكثر طلباً ومنافسة' },
  { id: 'youth_15_18', label: 'شباب وواعدون (14 - 17 سنة)', category: 'under_18' as AgeCategory, min: 14, max: 17, desc: 'فئة اليافعين بمبدأ الأمان الرياضي' },
  { id: 'juniors_under_14', label: 'براعم وصغار (< 14 سنة)', category: 'under_18' as AgeCategory, min: 10, max: 13, desc: 'تحت إشراف مباشر وأمان معتمد' },
  { id: 'veterans_35_plus', label: 'رواد وأساطير (35+ سنة)', category: 'adults' as AgeCategory, min: 35, max: 55, desc: 'لمسات هادئة وخبرات كروية' },
  { id: 'custom_range', label: 'نطاق عمري مخصص', category: 'adults' as AgeCategory, min: 20, max: 28, desc: 'يحدده الكابتن بدقة' },
];

// دالة حساب تقسيم الفاتورة والعربون مناصفة 50%
export const calculateSplitBreakdown = (pitchPricePerHour: number = 250) => {
  const deposit = FINANCIAL_FEES.NON_REFUNDABLE_DEPOSIT; // 100 ريال
  const platformFee = FINANCIAL_FEES.PLATFORM_COMMISSION; // 10 ريال
  const paymentFee = FINANCIAL_FEES.PAYMENT_GATEWAY_FEE; // 3.75 ريال
  const totalDepositFee = FINANCIAL_FEES.TOTAL_BOOKING_DEPOSIT; // 113.75 ريال
  const splitSharePerTeam = FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM; // 56.88 ريال
  
  // المتبقي للملعب عند الحضور بعد خصم العربون الـ 100 ريال
  const remainingAtPitch = Math.max(0, pitchPricePerHour - deposit);
  const remainingSharePerTeam = remainingAtPitch / 2;
  const totalEstimatedCostPerTeam = Number((splitSharePerTeam + remainingSharePerTeam).toFixed(2));

  return {
    deposit,
    platformFee,
    paymentFee,
    totalDepositFee,
    splitSharePerTeam,
    remainingAtPitch,
    remainingSharePerTeam,
    totalEstimatedCostPerTeam,
  };
};

const INITIAL_CHALLENGES: FriendlyChallenge[] = [
  {
    id: 'chall-1',
    creatorTeamName: 'نسور الحمدانية',
    creatorCaptainName: 'كابتن فيصل السلمي',
    creatorCaptainPhone: '0551234567',
    neighborhood: 'حي الحمدانية',
    neighborhoodZone: 'شمال جدة',
    allowNearbyNeighborhoods: true,
    isPublic: true,
    date: '2026-09-16',
    time: '20:30',
    format: '8v8',
    ageCategory: 'adults',
    targetAgeGroup: '18 - 28 سنة (كبار وهواة)',
    minAge: 18,
    maxAge: 28,
    skillLevel: 'intermediate',
    pitchPreference: 'ملاعب الجوهرة سبورتس - مجمع راقي',
    pitchId: 'pitch-1',
    pitchPricePerHour: 250,
    status: 'open_for_challengers',
    depositStatus: {
      creatorPaid: true,
      challengerPaid: false,
      totalPaid: FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM,
      splitPerTeam: FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM,
      depositAmount: 100,
      platformCommission: 10,
      paymentGatewayFee: 3.75,
      remainingAtPitch: 150,
      remainingPerTeam: 75,
    },
    friendlyReferee: {
      playerId: 'player-1',
      playerName: 'فيصل الغامدي',
      playerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      teamName: 'نسور الحمدانية',
      assignedByCaptain: 'كابتن فيصل السلمي',
      assignedAt: '2026-09-14',
      status: 'assigned',
    },
  },
  {
    id: 'chall-2',
    creatorTeamName: 'أشبال أبحر الواعدة',
    creatorCaptainName: 'كابتن ريان الغامدي',
    creatorCaptainPhone: '0549876543',
    neighborhood: 'حي أبحر الشمالية',
    neighborhoodZone: 'شمال جدة',
    allowNearbyNeighborhoods: true,
    isPublic: true,
    date: '2026-09-17',
    time: '18:00',
    format: '7v7',
    ageCategory: 'under_18',
    targetAgeGroup: '14 - 17 سنة (شباب وواعدون)',
    minAge: 14,
    maxAge: 17,
    skillLevel: 'amateur',
    pitchPreference: 'مجمع أكاديمية الموج الأزرق الدولي',
    pitchId: 'pitch-2',
    pitchPricePerHour: 320,
    status: 'open_for_challengers',
    depositStatus: {
      creatorPaid: true,
      challengerPaid: false,
      totalPaid: FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM,
      splitPerTeam: FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM,
      depositAmount: 100,
      platformCommission: 10,
      paymentGatewayFee: 3.75,
      remainingAtPitch: 220,
      remainingPerTeam: 110,
    },
  },
  {
    id: 'chall-3',
    creatorTeamName: 'نجوم السامر الذهبية',
    creatorCaptainName: 'كابتن طارق الشهري',
    creatorCaptainPhone: '0562233445',
    neighborhood: 'حي السامر',
    neighborhoodZone: 'شرق جدة',
    allowNearbyNeighborhoods: false,
    isPublic: true,
    date: '2026-09-18',
    time: '21:00',
    format: '7v7',
    ageCategory: 'adults',
    targetAgeGroup: '20 - 32 سنة (مستوى متقدم)',
    minAge: 20,
    maxAge: 32,
    skillLevel: 'pro',
    pitchPreference: 'صالات كابتن جدة المغلقة الفاخرة',
    pitchId: 'pitch-3',
    pitchPricePerHour: 220,
    status: 'accepted',
    acceptedTeamName: 'فهود الصفا',
    acceptedCaptainName: 'كابتن مازن الحربي',
    depositStatus: {
      creatorPaid: true,
      challengerPaid: true,
      totalPaid: FINANCIAL_FEES.TOTAL_BOOKING_DEPOSIT,
      splitPerTeam: FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM,
      depositAmount: 100,
      platformCommission: 10,
      paymentGatewayFee: 3.75,
      remainingAtPitch: 120,
      remainingPerTeam: 60,
    },
    friendlyReferee: {
      playerId: 'player-3',
      playerName: 'خالد السلمي',
      playerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      teamName: 'نجوم السامر الذهبية',
      assignedByCaptain: 'كابتن طارق الشهري',
      assignedAt: '2026-09-13',
      status: 'assigned',
    },
  },
  {
    id: 'chall-4',
    creatorTeamName: 'كتيبة الروضة الرياضية',
    creatorCaptainName: 'كابتن هاني بخش',
    creatorCaptainPhone: '0531122334',
    neighborhood: 'حي الروضة',
    neighborhoodZone: 'وسط جدة',
    allowNearbyNeighborhoods: true,
    isPublic: true,
    date: '2026-09-19',
    time: '22:00',
    format: '6v6',
    ageCategory: 'adults',
    targetAgeGroup: '22 - 35 سنة (سداسي سريع)',
    minAge: 22,
    maxAge: 35,
    skillLevel: 'intermediate',
    pitchPreference: 'ملاعب الكورنيش الخضراء - عشب طبيعي',
    pitchId: 'pitch-4',
    pitchPricePerHour: 280,
    status: 'open_for_challengers',
    depositStatus: {
      creatorPaid: true,
      challengerPaid: false,
      totalPaid: FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM,
      splitPerTeam: FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM,
      depositAmount: 100,
      platformCommission: 10,
      paymentGatewayFee: 3.75,
      remainingAtPitch: 180,
      remainingPerTeam: 90,
    },
  },
];

export const FriendlyChallengesSection: React.FC<FriendlyChallengesSectionProps> = ({
  players = [],
  onUpdatePlayerRefereeProfile,
  currentUserRole = 'player',
  userCoins = 420,
}) => {
  const [challenges, setChallenges] = useState<FriendlyChallenge[]>([]);

  // اشتراك حي في تحديات ومباريات الملاعب بقاعدة بيانات Firestore
  useEffect(() => {
    const unsub = subscribeToChallenges((cloudChallenges) => {
      setChallenges(cloudChallenges || []);
    });
    return () => unsub();
  }, []);

  // التبويب الرئيسي: التحديات العامة المفتوحة، تحديات فريقي، المباريات المؤكدة
  const [activeTab, setActiveTab] = useState<'public' | 'my_team' | 'accepted'>('public');
  
  // فلاتر البحث والمستوى والأعمار والأحياء
  const [ageFilter, setAgeFilter] = useState<'all' | AgeCategory>('all');
  const [skillFilter, setSkillFilter] = useState<'all' | SkillLevel>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | SquadFormat>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'accepted'>('all');

  // تبديل بين وضع الكابتن ووضع العرض العام السري
  const [isCaptainView, setIsCaptainView] = useState(currentUserRole === 'captain');

  // شريط حاسبة تقسيم العربون التفاعلية
  const [showSplitCalculator, setShowSplitCalculator] = useState(false);
  const [calcPitchPrice, setCalcPitchPrice] = useState<number>(250);

  // نافذة إدارة وتقييم الحكم الودي
  const [refereeModal, setRefereeModal] = useState<{
    isOpen: boolean;
    mode: 'assign' | 'evaluate';
    challenge?: FriendlyChallenge;
  }>({
    isOpen: false,
    mode: 'assign',
  });

  // نافذة نشر طلب مباراة ودية جديد للكابتن
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  
  // خيارات الحي والمنطقة لكابتن الفريق
  const [selectedZone, setSelectedZone] = useState<string>('شمال جدة');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(JEDDAH_NEIGHBORHOODS[0]);
  const [allowNearby, setAllowNearby] = useState(true);

  // خيارات تحديد العمر من قبل كابتن الفريق
  const [selectedAgePreset, setSelectedAgePreset] = useState<string>('adults_open');
  const [selectedAgeCategory, setSelectedAgeCategory] = useState<AgeCategory>('adults');
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(35);
  const [customAgeTitle, setCustomAgeTitle] = useState<string>('18 - 35 سنة (كبار وهواة)');

  const [selectedFormat, setSelectedFormat] = useState<SquadFormat>('8v8');
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel>('intermediate');
  const [isPublicChallenge, setIsPublicChallenge] = useState(true);
  const [matchDate, setMatchDate] = useState('2026-09-20');
  const [matchTime, setMatchTime] = useState('20:30');
  
  // ربط الملعب وتحديد التكاليف
  const [selectedPitchId, setSelectedPitchId] = useState<string>('pitch-1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // مودال تأكيد قبول التحدي وسداد الحصة المقسمة تلقائياً
  const [acceptingChallenge, setAcceptingChallenge] = useState<FriendlyChallenge | null>(null);
  const [acceptingTeamName, setAcceptingTeamName] = useState('');
  const [acceptingCaptainName, setAcceptingCaptainName] = useState('');
  const [acceptingCaptainPhone, setAcceptingCaptainPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mada' | 'apple_pay' | 'captain_coins'>('mada');

  // تحديث إعدادات العمر عند اختيار فئة محددة
  const handleAgePresetChange = (presetId: string) => {
    setSelectedAgePreset(presetId);
    const preset = AGE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedAgeCategory(preset.category);
      setMinAge(preset.min);
      setMaxAge(preset.max);
      setCustomAgeTitle(preset.label);
    }
  };

  // فتح نافذة تعيين أو تقييم الحكم الودي
  const handleOpenRefereeModal = (challenge: FriendlyChallenge, mode: 'assign' | 'evaluate') => {
    setRefereeModal({
      isOpen: true,
      mode,
      challenge,
    });
  };

  // تعيين حكم ودّي من قائمة اللاعبين
  const handleAssignReferee = (challengeId: string, player: Player) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === challengeId) {
          const updated: FriendlyChallenge = {
            ...c,
            friendlyReferee: {
              playerId: player.id,
              playerName: player.name,
              playerAvatar: player.avatarUrl,
              teamName: player.clubName,
              assignedByCaptain: c.creatorCaptainName || 'كابتن المباراة',
              assignedAt: new Date().toISOString().split('T')[0],
              status: 'assigned',
            },
          };
          saveChallengeToCloud(updated);
          return updated;
        }
        return c;
      })
    );
    setToastMessage(`تم تعيين اللاعب [${player.name}] حكماً ودياً للمباراة! التقييم الداخلي محفوظ للكباتن فقط 🔒`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // حفظ تقييم الحكم الودي بعد المباراة
  const handleSaveRefereeEvaluation = (playerId: string, evaluation: RefereeEvaluation) => {
    if (onUpdatePlayerRefereeProfile) {
      onUpdatePlayerRefereeProfile(playerId, evaluation);
    }
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === refereeModal.challenge?.id && c.friendlyReferee) {
          const updated: FriendlyChallenge = {
            ...c,
            friendlyReferee: {
              ...c.friendlyReferee,
              status: 'evaluated',
              evaluation,
            },
          };
          saveChallengeToCloud(updated);
          return updated;
        }
        return c;
      })
    );
    setToastMessage(`تم تسجيل تقييم أداء الحكم الودي بنجاح! التقييم أضيف للسجل الداخلي السري المخصص للكباتن.`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // تأكيد قبول التحدي ودفع نصيب الفريق المنافس (56.88 ر.س) تلقائياً
  const handleConfirmAcceptChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptingChallenge || !acceptingTeamName) return;

    const matchedPitch = MOCK_PITCHES.find((p) => p.id === acceptingChallenge.pitchId) || MOCK_PITCHES[0];
    const splitCalc = calculateSplitBreakdown(matchedPitch.pricePerHour);

    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === acceptingChallenge.id) {
          const updated: FriendlyChallenge = {
            ...c,
            status: 'accepted',
            acceptedTeamName: acceptingTeamName,
            acceptedCaptainName: acceptingCaptainName || 'كابتن المنافس',
            depositStatus: {
              ...c.depositStatus,
              creatorPaid: true,
              challengerPaid: true,
              totalPaid: FINANCIAL_FEES.TOTAL_BOOKING_DEPOSIT,
              splitPerTeam: FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM,
              depositAmount: FINANCIAL_FEES.NON_REFUNDABLE_DEPOSIT,
              platformCommission: FINANCIAL_FEES.PLATFORM_COMMISSION,
              paymentGatewayFee: FINANCIAL_FEES.PAYMENT_GATEWAY_FEE,
              remainingAtPitch: splitCalc.remainingAtPitch,
              remainingPerTeam: splitCalc.remainingSharePerTeam,
            },
          };
          saveChallengeToCloud(updated);
          return updated;
        }
        return c;
      })
    );

    const chal = acceptingChallenge;
    setAcceptingChallenge(null);
    setAcceptingTeamName('');
    setAcceptingCaptainName('');
    setAcceptingCaptainPhone('');

    setToastMessage(`🎉 تم قبول التحدي بنجاح وتأكيد حجز الملعب! تم سداد حصة فريقك (${FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM} ر.س) بنجاح واكتمال العربون الإجمالي (${FINANCIAL_FEES.TOTAL_BOOKING_DEPOSIT} ر.س) مناصفة بين الفريقين.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // إنشاء ونشر طلب مباراة ودية جديد من كابتن الفريق مع تحديد الحي والعمر وتقسيم العربون
  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !captainName) return;

    const matchedPitch = MOCK_PITCHES.find((p) => p.id === selectedPitchId) || MOCK_PITCHES[0];
    const splitCalc = calculateSplitBreakdown(matchedPitch.pricePerHour);

    // تجهيز وصف الفئة السنية الدقيقة
    const ageDesc = `${minAge} - ${maxAge} سنة (${selectedAgeCategory === 'under_18' ? 'ناشئون وصغار' : 'كبار وهواة'})`;

    const newChallenge: FriendlyChallenge = {
      id: `chall-${Date.now()}`,
      creatorTeamName: teamName,
      creatorCaptainName: captainName,
      creatorCaptainPhone: captainPhone || '0500000000',
      neighborhood: selectedNeighborhood,
      neighborhoodZone: selectedZone as any,
      allowNearbyNeighborhoods: allowNearby,
      isPublic: isPublicChallenge,
      date: matchDate,
      time: matchTime,
      format: selectedFormat,
      ageCategory: selectedAgeCategory,
      targetAgeGroup: ageDesc,
      minAge,
      maxAge,
      skillLevel: selectedSkill,
      pitchPreference: matchedPitch.name,
      pitchId: matchedPitch.id,
      pitchPricePerHour: matchedPitch.pricePerHour,
      status: 'open_for_challengers',
      depositStatus: {
        creatorPaid: true,
        challengerPaid: false,
        totalPaid: FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM,
        splitPerTeam: FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM,
        depositAmount: FINANCIAL_FEES.NON_REFUNDABLE_DEPOSIT,
        platformCommission: FINANCIAL_FEES.PLATFORM_COMMISSION,
        paymentGatewayFee: FINANCIAL_FEES.PAYMENT_GATEWAY_FEE,
        remainingAtPitch: splitCalc.remainingAtPitch,
        remainingPerTeam: splitCalc.remainingSharePerTeam,
      },
    };

    setChallenges([newChallenge, ...challenges]);
    saveChallengeToCloud(newChallenge);
    setIsCreateModalOpen(false);
    setTeamName('');
    setCaptainName('');
    setCaptainPhone('');

    setToastMessage(`تم بنجاح نشر طلب المباراة الودية وحجز الملعب بنظام تقسيم الفاتورة التلقائي (نصيب فريقك: ${FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM} ر.س)!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // تطبيق الفلاتر الشاملة (المستوى، الأعمار، الحي، المنطقة، التشكيلة، وحالة المباراة)
  const filteredChallenges = challenges.filter((c) => {
    // فلتر التبويب العام مقابل الخاص أو المقبول
    if (activeTab === 'public') {
      if (c.status !== 'open_for_challengers' && c.status !== 'accepted') return false;
    } else if (activeTab === 'my_team') {
      // محاكاة إظهار تحديات فريق المستخدم
      if (c.creatorTeamName !== 'نسور الحمدانية' && c.acceptedTeamName !== 'نسور الحمدانية') return false;
    } else if (activeTab === 'accepted') {
      if (c.status !== 'accepted') return false;
    }

    const matchesAge = ageFilter === 'all' || c.ageCategory === ageFilter;
    const matchesSkill = skillFilter === 'all' || (c.skillLevel || 'intermediate') === skillFilter;
    const matchesFormat = formatFilter === 'all' || c.format === formatFilter;
    
    const matchesZone = zoneFilter === 'all' || c.neighborhoodZone === zoneFilter;
    const matchesNeigh = neighborhoodFilter === 'all' || c.neighborhood === neighborhoodFilter;
    
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'open'
        ? c.status === 'open_for_challengers'
        : c.status === 'accepted';

    return matchesAge && matchesSkill && matchesFormat && matchesZone && matchesNeigh && matchesStatus;
  });

  const getSkillLabel = (skill?: SkillLevel) => {
    switch (skill) {
      case 'amateur':
        return { label: 'هواة وبداية', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'intermediate':
        return { label: 'متوسط وحماسي', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
      case 'pro':
        return { label: 'متقدم ومحترف', color: 'bg-amber-500/15 text-amber-300 border-amber-500/35' };
      default:
        return { label: 'مستوى مفتوح', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  // حساب الحاسبة التفاعلية
  const liveCalc = calculateSplitBreakdown(calcPitchPrice);

  return (
    <div className="space-y-6">
      {/* إشعار منبثق توضيحي */}
      {toastMessage && (
        <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs md:text-sm rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-slate-950 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-950 font-bold p-1">✕</button>
        </div>
      )}

      {/* الرأس التوضيحي للنظام وتفعيل التحديات العامة */}
      <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/35 shadow-inner">
              <Globe className="w-6 h-6 text-[#f5d77f]" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold font-['Changa',sans-serif] text-white">
                  سوق التحديات الودية العامة وتقسيم الملاعب
                </h2>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  متاح للعامة بجدة 🌐
                </span>
              </div>
              <p className="text-xs text-[#d4af37] font-medium">
                نظام كابتن جدة الذكي للمباريات الودية وتقسيم الفاتورة مناصفة (50% لكل فريق)
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            استعرض التحديات المفتوحة للعامة في كافة أحياء جدة، أو انشر تحدياً لفريقك وحدد <strong>الحي بدقة</strong> و<strong>الفئة العمرية المستهدفة</strong>. يتكفل النظام بحجز الملعب <strong>وتقسيم العربون والرسوم تلقائياً مناصفة (56.88 ر.س لكل فريق)</strong> مع حماية تكافؤ الأعمار وحجب تقييم الحكام عن العامة.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full sm:w-auto relative z-10">
          <button
            onClick={() => setShowSplitCalculator(!showSplitCalculator)}
            className="px-4 py-2.5 rounded-2xl bg-[#161a24] hover:bg-[#1f2533] border border-[#2d3447] text-[#f5d77f] text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Calculator className="w-4 h-4 text-[#d4af37]" />
            <span>حاسبة تقسيم العربون</span>
            {showSplitCalculator ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            id="btn-open-create-challenge"
            onClick={() => setIsCreateModalOpen(true)}
            className="gold-gradient-btn px-6 py-3 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap shadow-xl hover:scale-105 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>نشر تحدي ودي جديد</span>
          </button>
        </div>
      </div>

      {/* حاسبة تقسيم العربون والرسوم التلقائية (منطق 50% / 50%) */}
      {showSplitCalculator && (
        <div className="bg-[#0c0f16] border border-[#d4af37]/30 rounded-3xl p-5 md:p-6 space-y-4 animate-in fade-in shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#222735] pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#d4af37]/15 text-[#f5d77f]">
                <Calculator className="w-5 h-5 text-[#f5d77f]" />
              </span>
              <div>
                <h3 className="text-sm md:text-base font-bold text-white">حاسبة تقسيم العربون والرسوم التلقائي (50% / 50%)</h3>
                <p className="text-[11px] text-slate-400">احسب نصيب كل فريق بدقة لأي سعر ملعب بجدة</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              تقسيم عادل بنسبة 50%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#11141b] p-4 rounded-2xl border border-[#222735] space-y-2">
              <label className="text-slate-300 font-bold block">سعر حجز الملعب في الساعة (ر.س):</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="100"
                  max="1000"
                  step="10"
                  value={calcPitchPrice}
                  onChange={(e) => setCalcPitchPrice(Math.max(100, Number(e.target.value) || 100))}
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-[#d4af37] focus:outline-none"
                />
                <span className="text-slate-400 shrink-0 font-bold">ريال / ساعة</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[180, 220, 250, 300, 350].map((pr) => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => setCalcPitchPrice(pr)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition ${
                      calcPitchPrice === pr ? 'bg-[#d4af37] text-slate-950 border-[#d4af37]' : 'bg-[#161a23] text-slate-300 border-[#222735]'
                    }`}
                  >
                    {pr} ر.س
                  </button>
                ))}
              </div>
            </div>

            {/* تفصيل العربون والرسوم المعتمدة */}
            <div className="bg-[#11141b] p-4 rounded-2xl border border-[#222735] space-y-2">
              <div className="text-slate-400 font-bold text-[11px] flex items-center justify-between">
                <span>عربون الملعب غير المسترد:</span>
                <span className="font-mono text-white">100.00 ر.س</span>
              </div>
              <div className="text-slate-400 text-[11px] flex items-center justify-between">
                <span>عمولة منصة كابتن جدة:</span>
                <span className="font-mono text-white">10.00 ر.س</span>
              </div>
              <div className="text-slate-400 text-[11px] flex items-center justify-between">
                <span>رسوم بوابة الدفع الإلكتروني (مدى / Apple Pay):</span>
                <span className="font-mono text-white">3.75 ر.س</span>
              </div>
              <div className="border-t border-[#222735] pt-1.5 flex items-center justify-between font-bold text-xs text-white">
                <span>إجمالي المبلغ المطلوب لتثبيت الملعب:</span>
                <span className="font-mono text-[#f5d77f]">113.75 ر.س</span>
              </div>
            </div>

            {/* الحصة المقسمة تلقائياً على كل فريق */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-[#11141b] p-4 rounded-2xl border border-emerald-500/30 space-y-2">
              <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                <span>نصيب كل فريق عند الحجز (50% مناصفة):</span>
              </div>
              <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
                <span className="text-[#f5d77f]">{liveCalc.splitSharePerTeam}</span>
                <span className="text-xs text-slate-400 font-normal">ريال سعودي</span>
              </div>
              <div className="text-[11px] text-slate-300 border-t border-emerald-500/20 pt-1.5 space-y-1">
                <div className="flex justify-between">
                  <span>المتبقي للملعب عند الاستقبال:</span>
                  <span className="font-mono text-white font-bold">{liveCalc.remainingAtPitch} ر.س</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>(نصيب كل فريق في الملعب: {liveCalc.remainingSharePerTeam} ر.س)</span>
                  <span className="text-emerald-400 font-bold">الإجمالي المتوقع: {liveCalc.totalEstimatedCostPerTeam} ر.س</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* التبويبات الثلاثة: التحديات العامة المفتوحة، تحديات فريقي، المباريات المؤكدة */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#222735] pb-3">
        <div className="flex items-center gap-2 bg-[#0c0f16] p-1.5 rounded-2xl border border-[#222735]">
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'public'
                ? 'gold-gradient-btn shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>التحديات العامة المفتوحة بجدة</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {challenges.filter((c) => c.status === 'open_for_challengers').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('my_team')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'my_team'
                ? 'gold-gradient-btn shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>تحديات فريقي</span>
          </button>

          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'accepted'
                ? 'gold-gradient-btn shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>المباريات المؤكدة والمكتملة</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {challenges.filter((c) => c.status === 'accepted').length}
            </span>
          </button>
        </div>

        {/* زر التبديل بين وضع الكابتن ووضع العرض العام السري */}
        <div className="flex items-center gap-1 bg-[#08090d] p-1 rounded-xl border border-[#222735]">
          <button
            type="button"
            onClick={() => setIsCaptainView(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              isCaptainView
                ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="إظهار التقييمات الداخلية السرية للحكام الوديين"
          >
            <Lock className="w-3.5 h-3.5 text-[#f5d77f]" />
            <span>وضع الكابتن 🔒</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCaptainView(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              !isCaptainView
                ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="عرض التحديات المتاحة للجمهور واللاعبين"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>وضع العرض العام 👁️</span>
          </button>
        </div>
      </div>

      {/* شريط الفلاتر الذكية: الحي بجدة، المنطقة، الفئة السنية، والمستوى */}
      <div className="bg-[#11141b] p-4 md:p-5 rounded-3xl border border-[#222735] space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#222735] pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#f5d77f]">
            <Filter className="w-4 h-4" />
            <span>تصفية التحديات حسب الحي والعمر والتكافؤ الرياضي:</span>
          </div>

          <button
            onClick={() => {
              setAgeFilter('all');
              setSkillFilter('all');
              setFormatFilter('all');
              setZoneFilter('all');
              setNeighborhoodFilter('all');
              setStatusFilter('all');
            }}
            className="text-[11px] text-slate-400 hover:text-white font-medium"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {/* فلتر منطقة جدة */}
          <div className="space-y-1">
            <label className="text-slate-400 font-bold block flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>منطقة جدة:</span>
            </label>
            <select
              value={zoneFilter}
              onChange={(e) => {
                setZoneFilter(e.target.value);
                setNeighborhoodFilter('all');
              }}
              className="w-full bg-[#08090d] border border-[#222735] text-slate-200 rounded-xl px-2.5 py-2 focus:border-[#d4af37] focus:outline-none"
            >
              <option value="all">كافة مناطق جدة</option>
              <option value="شمال جدة">شمال جدة</option>
              <option value="وسط جدة">وسط جدة</option>
              <option value="شرق جدة">شرق جدة</option>
              <option value="جنوب جدة">جنوب جدة</option>
            </select>
          </div>

          {/* فلتر الحي الدقيق بجدة */}
          <div className="space-y-1">
            <label className="text-slate-400 font-bold block flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#f5d77f]" />
              <span>الحي في جدة:</span>
            </label>
            <select
              value={neighborhoodFilter}
              onChange={(e) => setNeighborhoodFilter(e.target.value)}
              className="w-full bg-[#08090d] border border-[#222735] text-slate-200 rounded-xl px-2.5 py-2 focus:border-[#d4af37] focus:outline-none"
            >
              <option value="all">كل الأحياء</option>
              {(zoneFilter === 'all' ? JEDDAH_NEIGHBORHOODS : JEDDAH_ZONES[zoneFilter] || JEDDAH_NEIGHBORHOODS).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* فلتر الفئات السنية */}
          <div className="space-y-1">
            <label className="text-slate-400 font-bold block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>الفئة السنية:</span>
            </label>
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value as any)}
              className="w-full bg-[#08090d] border border-[#222735] text-slate-200 rounded-xl px-2.5 py-2 focus:border-[#d4af37] focus:outline-none"
            >
              <option value="all">كافة الأعمار</option>
              <option value="adults">كبار (18 سنة فما فوق)</option>
              <option value="under_18">صغار وناشئون (&lt; 18 سنة)</option>
            </select>
          </div>

          {/* فلتر حجم التشكيلة */}
          <div className="space-y-1">
            <label className="text-slate-400 font-bold block flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>حجم التشكيلة:</span>
            </label>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value as any)}
              className="w-full bg-[#08090d] border border-[#222735] text-slate-200 rounded-xl px-2.5 py-2 font-mono focus:border-[#d4af37] focus:outline-none"
            >
              <option value="all">كل التشكيلات (5v5 - 11v11)</option>
              <option value="5v5">5v5 (خماسي)</option>
              <option value="6v6">6v6 (سداسي)</option>
              <option value="7v7">7v7 (سباعي)</option>
              <option value="8v8">8v8 (ثماني)</option>
              <option value="9v9">9v9 (تساعي)</option>
              <option value="11v11">11v11 (قانوني)</option>
            </select>
          </div>

          {/* فلتر المستوى الرياضي */}
          <div className="space-y-1">
            <label className="text-slate-400 font-bold block flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>المستوى الكروي:</span>
            </label>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value as any)}
              className="w-full bg-[#08090d] border border-[#222735] text-slate-200 rounded-xl px-2.5 py-2 focus:border-[#d4af37] focus:outline-none"
            >
              <option value="all">كافة المستويات</option>
              <option value="amateur">هواة وبداية</option>
              <option value="intermediate">متوسط وحماسي</option>
              <option value="pro">متقدم ومحترف</option>
            </select>
          </div>
        </div>
      </div>

      {/* شريط الإحصائيات والتكافؤ */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>عرض <strong>{filteredChallenges.length}</strong> من إجمالي <strong>{challenges.length}</strong> مباراة ودية متاحة</span>
        <span className="text-emerald-400 flex items-center gap-1 font-bold">
          <ShieldCheck className="w-4 h-4" />
          مبدأ تقسيم العربون 50/50 وتكافؤ الأعمار مفعل وصارم 100%
        </span>
      </div>

      {/* شبكة بطاقات التحديات الودية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredChallenges.map((c) => {
          const isOpen = c.status === 'open_for_challengers';
          const isUnder18 = c.ageCategory === 'under_18';
          const skillInfo = getSkillLabel(c.skillLevel);

          return (
            <div
              key={c.id}
              className={`bg-[#11141b] rounded-3xl border p-5 flex flex-col justify-between space-y-4 transition shadow-lg relative overflow-hidden ${
                isOpen ? 'border-[#222735] hover:border-[#d4af37]/50' : 'border-emerald-500/30 bg-[#0d1217]'
              }`}
            >
              <div className="space-y-3.5">
                {/* رأس البطاقة: شارة التحدي العام، اسم الفريق، الفئة السنية الدقيقة والمستوى */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-bold text-white">
                        {c.creatorTeamName}
                      </h3>
                      {c.isPublic && (
                        <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5" />
                          عام للجميع
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">كابتن الفريق: <strong className="text-slate-200">{c.creatorCaptainName}</strong></div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isUnder18
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : 'bg-[#d4af37]/15 text-[#f5d77f] border-[#d4af37]/35'
                      }`}
                    >
                      {c.targetAgeGroup || (isUnder18 ? 'صغار (< 18 سنة)' : 'كبار (18+ سنة)')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${skillInfo.color}`}>
                      {skillInfo.label}
                    </span>
                  </div>
                </div>

                {/* التفاصيل اللوجستية: الحي والمنطقة، الملعب، الموعد، التشكيل */}
                <div className="bg-[#08090d] p-3 rounded-2xl border border-[#222735] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-[#f5d77f]" />
                      الحي والمنطقة:
                    </span>
                    <span className="font-bold text-white text-right">
                      {c.neighborhood} {c.neighborhoodZone ? `(${c.neighborhoodZone})` : ''}
                    </span>
                  </div>

                  {c.allowNearbyNeighborhoods && (
                    <div className="text-[10px] text-emerald-400/90 flex items-center justify-end gap-1">
                      <span>✓ مستعدون للعب في الأحياء المجاورة</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      الملعب المختار:
                    </span>
                    <span className="font-bold text-white text-right max-w-[170px] truncate">{c.pitchPreference}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      الموعد:
                    </span>
                    <span className="font-mono">{c.date} | {c.time}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-[#f5d77f]" />
                      التشكيل المطلوب:
                    </span>
                    <span className="font-black text-[#f5d77f] font-mono">{c.format}</span>
                  </div>
                </div>

                {/* نظام تقسيم العربون التلقائي والمؤشر البصري للدفع */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-3.5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-[11px] font-bold flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      تقسيم العربون التلقائي (50% / 50%):
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-[11px]">
                      {FINANCIAL_FEES.TOTAL_BOOKING_DEPOSIT} ر.س إجمالي
                    </span>
                  </div>

                  {/* شريط حالة سداد الفريقين */}
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                        <span>{c.creatorTeamName}:</span>
                        <span className="font-bold">56.88 ر.س مدفوع ✓</span>
                      </div>
                      <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                        c.depositStatus.challengerPaid
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>
                        <span>المنافس:</span>
                        <span className="font-bold">
                          {c.depositStatus.challengerPaid ? '56.88 ر.س مدفوع ✓' : '56.88 ر.س بانتظار القبول'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 bg-[#08090d] rounded-xl border border-emerald-500/30 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300 text-[11px]">حصة فريقك المطلوبة:</span>
                    <span className="text-[#f5d77f] font-mono text-sm">
                      {FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM} ريال
                    </span>
                  </div>

                  {c.pitchPricePerHour && (
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>إيجار الملعب المتبقي عند الحضور:</span>
                      <span className="font-mono text-slate-300">{Math.max(0, c.pitchPricePerHour - 100)} ر.س ({Math.max(0, c.pitchPricePerHour - 100) / 2} ر.س/فريق)</span>
                    </div>
                  )}
                </div>

                {/* الحكم الودي وسجل التقييم الداخلي المحجوب عن العامة */}
                {(() => {
                  const refPlayer = c.friendlyReferee ? players.find((p) => p.id === c.friendlyReferee?.playerId) : null;
                  const refProfile = refPlayer?.internalRefereeProfile;

                  return (
                    <div className="bg-[#08090d] border border-[#222735] rounded-2xl p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                          <UserCheck className="w-4 h-4 text-[#f5d77f]" />
                          حكم المباراة الودي:
                        </span>
                        {isCaptainView ? (
                          <span className="text-[10px] bg-[#d4af37]/15 text-[#f5d77f] px-2 py-0.5 rounded-full border border-[#d4af37]/30 flex items-center gap-1 font-bold">
                            <Lock className="w-2.5 h-2.5" />
                            سجل داخلي للكباتن
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-1">
                            <Eye className="w-2.5 h-2.5" />
                            عرض عام (التقييم محجوب)
                          </span>
                        )}
                      </div>

                      {c.friendlyReferee ? (
                        <div className="flex items-center justify-between bg-[#11141b] p-2 rounded-xl border border-[#222735]">
                          <div className="flex items-center gap-2">
                            <img
                              src={c.friendlyReferee.playerAvatar}
                              alt={c.friendlyReferee.playerName}
                              className="w-7 h-7 rounded-full object-cover border border-[#d4af37]/40"
                            />
                            <div>
                              <div className="font-bold text-white text-xs">{c.friendlyReferee.playerName}</div>
                              <div className="text-[10px] text-slate-400">{c.friendlyReferee.teamName}</div>
                            </div>
                          </div>

                          {isCaptainView ? (
                            <div className="text-left">
                              {refProfile ? (
                                <div className="text-xs font-bold text-[#f5d77f] font-mono">
                                  ★ {refProfile.averageRating} / 10
                                </div>
                              ) : (
                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                  مباراته الأولى
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                              محجوب للعامة
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-2 bg-[#11141b] rounded-xl border border-dashed border-[#222735]">
                          <span className="text-[11px] text-slate-400">لم يتم تكليف حكم ودّي بعد</span>
                          {isCaptainView && (
                            <button
                              type="button"
                              onClick={() => handleOpenRefereeModal(c, 'assign')}
                              className="px-2.5 py-1 rounded-lg bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/35 text-[10px] font-bold"
                            >
                              تكليف حكم
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* أزرار الإجراء: قبول التحدي للعامة أو عرض حالة التأكيد */}
              <div>
                {isOpen ? (
                  <div className="space-y-2">
                    <button
                      id={`btn-accept-challenge-${c.id}`}
                      onClick={() => {
                        setAcceptingChallenge(c);
                        setAcceptingTeamName('');
                        setAcceptingCaptainName('');
                        setAcceptingCaptainPhone('');
                      }}
                      className="w-full py-2.5 rounded-xl gold-gradient-btn text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg hover:brightness-110"
                    >
                      <Swords className="w-4 h-4 text-slate-950" />
                      <span>قبول التحدي وسداد حصة فريقك ({FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM} ر.س)</span>
                    </button>

                    {c.creatorCaptainPhone && (
                      <a
                        href={`https://wa.me/966${c.creatorCaptainPhone.replace(/^0+/, '')}?text=${encodeURIComponent(
                          `السلام عليكم كابتن ${c.creatorCaptainName}، بخصوص مباراة ${c.creatorTeamName} الودية بـ ${c.neighborhood} عبر تطبيق كابتن جدة.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1.5 rounded-xl bg-[#161a23] hover:bg-[#1f2533] border border-[#222735] text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>محادثة واتساب للتنسيق</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <CheckCircle className="w-4 h-4" />
                      <span>المباراة مؤكدة والحجز مكتمل مناصفة (100%)</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      الفريق المنافس: <strong>{c.acceptedTeamName}</strong> (كابتن {c.acceptedCaptainName})
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="p-12 text-center bg-[#11141b] rounded-3xl border border-[#222735] space-y-3">
          <AlertTriangle className="w-10 h-10 text-[#d4af37] mx-auto opacity-70" />
          <h4 className="text-base font-bold text-white">لا توجد طلبات تطابق الفلاتر المحددة حالياً</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            جرّب تغيير فلاتر الحي أو الفئة السنية، أو انشر طلب مباراة ودية جديدة لفريقك الآن وسيتكفل تطبيق كابتن جدة بإيجاد المنافس الملائم وتقسيم العربون تلقائياً!
          </p>
          <button
            onClick={() => {
              setAgeFilter('all');
              setSkillFilter('all');
              setFormatFilter('all');
              setZoneFilter('all');
              setNeighborhoodFilter('all');
              setStatusFilter('all');
            }}
            className="px-4 py-2 bg-[#161a23] hover:bg-[#1e2330] rounded-xl text-xs font-bold text-[#f5d77f] border border-[#222735]"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      )}

      {/* نافذة إنشاء ونشر طلب مباراة ودية جديد مع خيارات العمر والحي وتقسيم العربون */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-6 md:p-8 max-w-2xl w-full space-y-5 my-8 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222735] pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#d4af37]/15 text-[#f5d77f]">
                  <Swords className="w-5 h-5 text-[#f5d77f]" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">نشر طلب مباراة ودية في جدة</h3>
                  <p className="text-[11px] text-slate-400">تحديد الحي والعمر ونظام تقسيم العربون التلقائي</p>
                </div>
              </div>
              <button 
                id="btn-close-create-modal"
                onClick={() => setIsCreateModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-xl bg-[#161a23]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4 text-xs">
              {/* بيانات الفريق والكابتن */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">اسم فريقك:</label>
                  <input
                    id="input-team-name"
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="مثال: صقور الشاطئ"
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">اسم كابتن الفريق:</label>
                  <input
                    id="input-captain-name"
                    type="text"
                    required
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    placeholder="مثال: كابتن ماجد"
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">رقم الجوال للتنسيق:</label>
                  <input
                    id="input-captain-phone"
                    type="tel"
                    value={captainPhone}
                    onChange={(e) => setCaptainPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              {/* خيار تحديد العمر بدقة والأمان الرياضي */}
              <div className="p-4 bg-[#08090d] border border-[#222735] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[#f5d77f] font-bold flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                    <span>تحديد الفئة العمرية للمباراة (خيار الكابتن والتكافؤ):</span>
                  </label>
                  <span className="text-[10px] text-slate-400">ممنوع لعب الكبار ضد الصغار &lt;18</span>
                </div>

                {/* أزرار سريعة لاختيار الفئة السنية */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AGE_PRESETS.filter(p => p.id !== 'custom_range').map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleAgePresetChange(preset.id)}
                      className={`p-2 rounded-xl border text-center transition ${
                        selectedAgePreset === preset.id
                          ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5d77f] font-bold'
                          : 'bg-[#11141b] border-[#222735] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-[11px]">{preset.label}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{preset.min} - {preset.max} سنة</div>
                    </button>
                  ))}
                </div>

                {/* تحديد يدوي للنطاق العمري الدقيق */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px] font-bold">الحد الأدنى لعمر اللاعبين:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="10"
                        max="60"
                        value={minAge}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setMinAge(val);
                          if (val < 18) setSelectedAgeCategory('under_18');
                          else setSelectedAgeCategory('adults');
                        }}
                        className="w-full bg-[#11141b] border border-[#222735] rounded-xl px-3 py-1.5 text-white font-mono"
                      />
                      <span className="text-slate-400 text-[11px]">سنة</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px] font-bold">الحد الأقصى لعمر اللاعبين:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="10"
                        max="65"
                        value={maxAge}
                        onChange={(e) => setMaxAge(Number(e.target.value))}
                        className="w-full bg-[#11141b] border border-[#222735] rounded-xl px-3 py-1.5 text-white font-mono"
                      />
                      <span className="text-slate-400 text-[11px]">سنة</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#11141b] border border-[#222735] flex items-center justify-between text-[11px]">
                  <span className="text-slate-300">الفئة المسجلة في التحدي:</span>
                  <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                    selectedAgeCategory === 'under_18'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/30'
                  }`}>
                    {minAge} - {maxAge} سنة ({selectedAgeCategory === 'under_18' ? 'صغار وناشئون < 18' : 'كبار وهواة 18+'})
                  </span>
                </div>
              </div>

              {/* خيار تحديد الحي والمنطقة الجغرافية بجدة */}
              <div className="p-4 bg-[#08090d] border border-[#222735] rounded-2xl space-y-3">
                <label className="text-[#f5d77f] font-bold flex items-center gap-1.5 text-xs">
                  <MapPin className="w-4 h-4 text-[#d4af37]" />
                  <span>تحديد الحي والموقع الجغرافي بجدة (خيار الكابتن):</span>
                </label>

                {/* أزرار اختيار المنطقة السريعة */}
                <div className="grid grid-cols-4 gap-1.5">
                  {['شمال جدة', 'وسط جدة', 'شرق جدة', 'جنوب جدة'].map((zone) => (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => {
                        setSelectedZone(zone);
                        const firstNeigh = JEDDAH_ZONES[zone]?.[0];
                        if (firstNeigh) {
                          setSelectedNeighborhood(firstNeigh);
                          const p = MOCK_PITCHES.find((item) => item.neighborhood === firstNeigh);
                          if (p) setSelectedPitchId(p.id);
                        }
                      }}
                      className={`py-1.5 px-2 rounded-xl text-center text-[11px] font-bold transition border ${
                        selectedZone === zone
                          ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5d77f]'
                          : 'bg-[#11141b] border-[#222735] text-slate-400'
                      }`}
                    >
                      {zone}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">الحي المفضل للعب:</label>
                    <select
                      value={selectedNeighborhood}
                      onChange={(e) => {
                        const neigh = e.target.value;
                        setSelectedNeighborhood(neigh);
                        const p = MOCK_PITCHES.find((item) => item.neighborhood === neigh);
                        if (p) setSelectedPitchId(p.id);
                      }}
                      className="w-full bg-[#11141b] border border-[#222735] text-white rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
                    >
                      {(JEDDAH_ZONES[selectedZone] || JEDDAH_NEIGHBORHOODS).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">الملعب الشريك المقترح:</label>
                    <select
                      value={selectedPitchId}
                      onChange={(e) => setSelectedPitchId(e.target.value)}
                      className="w-full bg-[#11141b] border border-[#222735] text-white rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
                    >
                      {MOCK_PITCHES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.neighborhood}) - {p.pricePerHour} ر.س/ساعة
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* مرونة اللعب في الأحياء المجاورة */}
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={allowNearby}
                    onChange={(e) => setAllowNearby(e.target.checked)}
                    className="w-4 h-4 rounded text-[#d4af37] bg-[#11141b] border-[#222735] focus:ring-0"
                  />
                  <span className="text-slate-300 text-xs">
                    مستعدون للعب في الأحياء المجاورة إذا توفر منافس أو ملعب أفضل
                  </span>
                </label>
              </div>

              {/* التشكيل والمستوى والموعد */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">حجم التشكيلة:</label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as SquadFormat)}
                    className="w-full bg-[#08090d] border border-[#222735] text-white rounded-xl px-3 py-2 font-mono focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="5v5">5v5 (خماسي)</option>
                    <option value="6v6">6v6 (سداسي)</option>
                    <option value="7v7">7v7 (سباعي)</option>
                    <option value="8v8">8v8 (ثماني)</option>
                    <option value="9v9">9v9 (تساعي)</option>
                    <option value="11v11">11v11 (قانوني)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">تاريخ المباراة:</label>
                  <input
                    type="date"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    className="w-full bg-[#08090d] border border-[#222735] text-white rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">توقيت البداية:</label>
                  <input
                    type="time"
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                    className="w-full bg-[#08090d] border border-[#222735] text-white rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              {/* تفعيل التحدي للعامة */}
              <div className="p-3 bg-[#08090d] border border-[#222735] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white text-xs block">نشر التحدي في السوق العام المفتوح (Public):</span>
                    <span className="text-[10px] text-slate-400">إتاحة التحدي لكافة أندية وفرق جدة لقبوله ودفع حصتهم فوراً</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isPublicChallenge}
                  onChange={(e) => setIsPublicChallenge(e.target.checked)}
                  className="w-4 h-4 rounded text-[#d4af37] bg-[#11141b] border-[#222735]"
                />
              </div>

              {/* تفاصيل السداد المالي وتقسيم الفاتورة التلقائي (50% / 50%) */}
              <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
                <div className="flex justify-between text-xs text-slate-300 font-bold">
                  <span>العربون الإجمالي لتثبيت الملعب (100 + 10 منصة + 3.75 بوابة):</span>
                  <span className="font-mono text-white">113.75 ريال</span>
                </div>
                <div className="flex justify-between text-sm font-black text-emerald-400 border-t border-emerald-500/20 pt-2">
                  <span>المبلغ المطلوب سداده من فريقك الآن (حصة 50% مناصفة):</span>
                  <span className="font-mono text-[#f5d77f] text-base">{FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM} ريال</span>
                </div>
                <div className="text-[10px] text-slate-300">
                  * يقوم الفريق المتحدي بسداد الـ 50% الأخرى فور قبول التحدي لتأكيد حجز الملعب نهائياً بنسبة 100%.
                </div>
              </div>

              <button
                id="btn-submit-create-challenge"
                type="submit"
                className="w-full py-3 gold-gradient-btn text-xs font-bold rounded-xl shadow-lg transition hover:brightness-110 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-slate-950" />
                <span>تأكيد ونشر التحدي وسداد حصة فريقك ({FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM} ر.س)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* نافذة قبول التحدي وسداد الحصة المقسمة تلقائياً (56.88 ر.س) */}
      {acceptingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 my-8 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222735] pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Swords className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">قبول التحدي وحجز الملعب</h3>
                  <p className="text-[11px] text-slate-400">سداد حصة فريقك وتأكيد المباراة مناصفة</p>
                </div>
              </div>
              <button 
                onClick={() => setAcceptingChallenge(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-xl bg-[#161a23]"
              >
                ✕
              </button>
            </div>

            {/* تفاصيل التحدي المراد قبوله */}
            <div className="p-4 bg-[#08090d] rounded-2xl border border-[#222735] space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>الفريق المتحدي:</span>
                <span className="font-bold text-white">{acceptingChallenge.creatorTeamName} (كابتن {acceptingChallenge.creatorCaptainName})</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>الحي والملعب:</span>
                <span className="font-bold text-[#f5d77f]">{acceptingChallenge.neighborhood} - {acceptingChallenge.pitchPreference}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>الموعد والتشكيلة:</span>
                <span className="font-mono">{acceptingChallenge.date} | {acceptingChallenge.time} ({acceptingChallenge.format})</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>الفئة السنية المحددة:</span>
                <span className="font-bold text-emerald-400">
                  {acceptingChallenge.targetAgeGroup || (acceptingChallenge.ageCategory === 'under_18' ? 'صغار (<18)' : 'كبار (18+)')}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmAcceptChallenge} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">اسم فريقك المنافس:</label>
                <input
                  type="text"
                  required
                  value={acceptingTeamName}
                  onChange={(e) => setAcceptingTeamName(e.target.value)}
                  placeholder="مثال: أسود الرويس"
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">اسم الكابتن:</label>
                  <input
                    type="text"
                    required
                    value={acceptingCaptainName}
                    onChange={(e) => setAcceptingCaptainName(e.target.value)}
                    placeholder="مثال: كابتن حسام"
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">رقم الجوال:</label>
                  <input
                    type="tel"
                    value={acceptingCaptainPhone}
                    onChange={(e) => setAcceptingCaptainPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              {/* اختيار وسيلة الدفع لحصة الفريق (56.88 ر.س) */}
              <div className="space-y-2">
                <label className="text-slate-300 font-bold block">اختر وسيلة دفع نصيب فريقك:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mada')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition ${
                      paymentMethod === 'mada' ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5d77f]' : 'bg-[#08090d] border-[#222735] text-slate-400'
                    }`}
                  >
                    مدى Mada
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition ${
                      paymentMethod === 'apple_pay' ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5d77f]' : 'bg-[#08090d] border-[#222735] text-slate-400'
                    }`}
                  >
                    Apple Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('captain_coins')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition ${
                      paymentMethod === 'captain_coins' ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5d77f]' : 'bg-[#08090d] border-[#222735] text-slate-400'
                    }`}
                  >
                    كابتن كوينز 🪙
                  </button>
                </div>
              </div>

              {/* تفاصيل السداد الفوري وتأكيد المناصفة */}
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-1.5">
                <div className="flex justify-between text-slate-300 font-bold">
                  <span>سداد حصة فريقك في العربون والرسوم (50%):</span>
                  <span className="font-bold text-[#f5d77f] font-mono text-sm">
                    {acceptingChallenge.depositStatus.splitPerTeam || FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM} ريال
                  </span>
                </div>
                <div className="text-[10px] text-emerald-400">
                  ✓ تم سداد حصة الفريق الأول مسبقاً ({FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM} ر.س)، وبسدادك الآن يكتمل العربون الإجمالي ({FINANCIAL_FEES.TOTAL_BOOKING_DEPOSIT} ر.س) ويتم تثبيت الحجز بالملعب رسمياً.
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 gold-gradient-btn text-xs font-bold rounded-xl shadow-lg transition hover:brightness-110 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-slate-950" />
                <span>تأكيد قبول التحدي وسداد حصة فريقك ({FINANCIAL_FEES.SPLIT_SHARE_PER_TEAM} ر.س)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تحديد وتقييم الحكم الودي */}
      <FriendlyRefereeModal
        isOpen={refereeModal.isOpen}
        onClose={() => setRefereeModal((prev) => ({ ...prev, isOpen: false }))}
        mode={refereeModal.mode}
        challenge={refereeModal.challenge}
        players={players}
        onAssignReferee={handleAssignReferee}
        onSaveEvaluation={handleSaveRefereeEvaluation}
      />
    </div>
  );
};
