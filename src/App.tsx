import React, { useState, useEffect } from 'react';
import { 
  Player, 
  PlayerPosition, 
  FINANCIAL_FEES, 
  RefereeEvaluation, 
  FriendlyReferee, 
  TransferRequest,
  RewardItem,
  CaptainCoinTransaction,
  RedeemedRewardVoucher,
  CAPTAIN_COINS_CONFIG,
  UserRole
} from './types';
import { INITIAL_REWARD_ITEMS } from './data/mockRewards';
import {
  testConnection,
  initFirebaseAuth,
  syncUserProfile,
  subscribeToPlayers,
  savePlayerToCloud,
  subscribeToReferees,
  saveRefereeToCloud,
  subscribeToTransferRequests,
  saveTransferRequestToCloud,
  updateTransferRequestStatusInCloud,
  markAllTransferRequestsReadInCloud,
  subscribeToUserWallet,
  saveUserWalletToCloud,
  subscribeToRedeemedVouchers,
  saveRedeemedVoucherToCloud,
  purgeAllMockDataFromFirestore
} from './services/firestoreService';
import { AuthScreen } from './components/AuthScreen';
import { 
  getStoredUserSession, 
  logoutUser, 
  updateUserAvatar, 
  UserAccountProfile 
} from './services/authService';
import { processImageFile } from './utils/imageUploadHelper';
import { FifaCard } from './components/FifaCard';
import { PlayerRegistrationModal } from './components/PlayerRegistrationModal';
import { TacticalPitchSquad } from './components/TacticalPitchSquad';
import { PostMatchRatingModal } from './components/PostMatchRatingModal';
import { PitchAndInstitutionsSection } from './components/PitchAndInstitutionsSection';
import { FriendlyChallengesSection } from './components/FriendlyChallengesSection';
import { FriendlyRefereesSection } from './components/FriendlyRefereesSection';
import { RatingSimulatorModal } from './components/RatingSimulatorModal';
import { PlayerDigitalIdentityModal } from './components/PlayerDigitalIdentityModal';
import { TotwSection } from './components/TotwSection';
import { CardExportModal } from './components/CardExportModal';
import { AcademyDashboard } from './components/AcademyDashboard';
import { TeamDiarySection } from './components/TeamDiarySection';
import { TransferMarketSection } from './components/TransferMarketSection';
import { TransferInboxModal } from './components/TransferInboxModal';
import { RewardsStoreSection } from './components/RewardsStoreSection';
import { RoleGuideModal } from './components/RoleGuideModal';
import { analyzeAndGenerateDynamicBadges } from './utils/dynamicBadgeEngine';
import { 
  Trophy, 
  Users, 
  Swords, 
  MapPin, 
  PlusCircle, 
  Plus,
  EyeOff, 
  Sparkles, 
  Search, 
  Award,
  ShieldCheck,
  Flame,
  HelpCircle,
  Menu,
  X,
  CreditCard,
  Crown,
  Star,
  TrendingUp,
  Share2,
  GraduationCap,
  Send,
  MessagesSquare,
  Scale,
  UserCheck,
  ArrowLeftRight,
  UserPlus,
  Bell,
  Coins,
  ChevronDown,
  MoreHorizontal,
  User,
  Lock,
  ArrowRight,
  ShieldAlert,
  LogOut,
  Camera,
  UploadCloud,
} from 'lucide-react';

/**
 * التكوين المخصص للصلاحيات والواجهات حسب نوع الحساب (Role-Based Access & Dashboards)
 * يضمن ظهور الميزات والخدمات الخاصة بكل دور لمنع التشتت والازدحام
 */
export interface RoleProfileConfig {
  name: string;
  roleTitle: string;
  badge: string;
  avatar: string;
  description: string;
  portalName: string;
  portalSubtitle: string;
  kpis: { label: string; value: string; hint: string }[];
  primaryTabs: { id: string; label: string; icon: any }[];
  moreTabs: { id: string; label: string; sub: string; icon: any }[];
}

export const ROLE_PROFILES: Record<UserRole, RoleProfileConfig> = {
  player: {
    name: 'محمد السالم',
    roleTitle: 'لاعب كرة قدم (ST)',
    badge: 'بطاقة 50 OVR أساسية',
    avatar: '',
    description: 'واجهة اللاعب: بطاقتك الشخصية، رصيد كابتن كوينز، ويوميات ودردشة فريقك.',
    portalName: 'بوابة اللاعب الرياضية',
    portalSubtitle: 'هويتك الرقمية، بطاقة أسلوب لعبك، محفظة كابتن كوينز، ويوميات فريقك',
    kpis: [
      { label: 'تقييم البطاقة الأساسية', value: '50 OVR', hint: 'مضاعف التقييم السري ×3' },
      { label: 'رصيد كابتن كوينز', value: 'محفظة نشطة 🪙', hint: 'خصومات ملاعب ومكافآت' },
      { label: 'سوق الانتقالات', value: 'لاعب حر 🔄', hint: 'متاح للتعاقد بجدة' },
    ],
    primaryTabs: [
      { id: 'cards', label: 'بطاقتي وهوية اللاعب', icon: Trophy },
      { id: 'rewards', label: 'محفظة كابتن كوينز والمكافآت', icon: Coins },
      { id: 'team_diary', label: 'يوميات ودردشة فريقي', icon: MessagesSquare },
      { id: 'transfers', label: 'سوق الانتقالات (لاعب حر)', icon: ArrowLeftRight },
    ],
    moreTabs: [
      { id: 'challenges', label: 'المباريات والتحديات الودية', sub: 'جدول المباريات والتحديات', icon: Swords },
      { id: 'totw', label: 'تشكيلة الأسبوع (TOTW)', sub: 'نجوم ملاعب جدة', icon: Crown },
      { id: 'rules', label: 'لوائح التقييم والشارات', sub: 'نظام المضاعف ×3 و -1.5', icon: HelpCircle },
    ],
  },
  captain: {
    name: 'كابتن سامي الحربي',
    roleTitle: 'كابتن ومنظم نادي أبطال جدة',
    badge: 'كابتن معتمد 👑',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    description: 'واجهة الكابتن والمنظم: بناء التكتيك، إصدار التحديات وتقسيم العربون 50/50، وحجز الملاعب.',
    portalName: 'لوحة قيادة الكابتن والمنظم',
    portalSubtitle: 'بناء التشكيلات والتكتيك، إصدار التحديات وتقسيم العربون 50/50، وحجز الملاعب',
    kpis: [
      { label: 'النادي التابع لك', value: 'أبطال جدة', hint: 'تشكيلات 5v5 إلى 11v11' },
      { label: 'نظام العربون المعتمد', value: '50% / 50%', hint: 'تقسيم تلقائي عادل' },
      { label: 'سجل الحكام الوديين', value: 'سري 🔒', hint: 'تقييم خاص بالكباتن' },
    ],
    primaryTabs: [
      { id: 'pitch', label: 'التشكيلات والتكتيك (5-11)', icon: Users },
      { id: 'challenges', label: 'تحديات المباريات (عربون 50/50)', icon: Swords },
      { id: 'facilities', label: 'حجز الملاعب والعربون (100 ر.س)', icon: MapPin },
      { id: 'transfers', label: 'سوق التعاقدات واللاعبين', icon: ArrowLeftRight },
    ],
    moreTabs: [
      { id: 'team_diary', label: 'دردشة وتنسيق الفريق', sub: 'إشعارات وتمرين النادي', icon: MessagesSquare },
      { id: 'referees', label: 'الحكام الوديون (سجل سري 🔒)', sub: 'تقييم سري خاص بالكباتن', icon: Scale },
      { id: 'cards', label: 'استعراض بطاقات اللاعبين', sub: 'قاعدة بيانات لاعبي جدة', icon: Trophy },
      { id: 'rewards', label: 'متجر المكافآت', sub: 'كوبونات وخصومات الملاعب', icon: Coins },
      { id: 'rules', label: 'اللوائح التنظيمية', sub: 'حماية الفئات وشروط العربون', icon: HelpCircle },
    ],
  },
  pitch_owner: {
    name: 'عبدالله القرني (ملاعب الجوهرة)',
    roleTitle: 'مالك منشأة وملاعب رياضية بجدة',
    badge: 'سجل تجاري موثق ✓',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    description: 'واجهة صاحب الملعب: إدارة وتأكيد الحجوزات، محفظة العربون المضمون (100 ر.س)، والتوثيق الرسمي.',
    portalName: 'بوابة إدارة المنشآت وملاعب جدة',
    portalSubtitle: 'إدارة وتأكيد الحجوزات، محفظة العربون المضمون (100 ر.س)، والتوثيق الرسمي',
    kpis: [
      { label: 'المنشأة الرياضية', value: 'ملاعب الجوهرة', hint: 'سجل تجاري موثق ✓' },
      { label: 'العربون المضمون', value: '100.00 ر.س', hint: 'غير مسترد لضمان الجدية' },
      { label: 'رسوم المنصة والوسيط', value: '13.75 ر.س', hint: '10 عمولة + 3.75 مدى' },
    ],
    primaryTabs: [
      { id: 'facilities', label: 'إدارة الملاعب والحجوزات', icon: MapPin },
      { id: 'challenges', label: 'مباريات اليوم بالمنشأة', icon: Swords },
      { id: 'referees', label: 'سجل حكام الملاعب لضمان السلامة', icon: Scale },
      { id: 'rules', label: 'محفظة العربون والرسوم (113.75 ر.س)', icon: ShieldCheck },
    ],
    moreTabs: [],
  },
  academy_scout: {
    name: 'كشاف أكاديمية مواهب جدة',
    roleTitle: 'كشاف ومسؤول استقطاب معتمد',
    badge: 'ترخيص كشافة فئة A ⚡',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    description: 'واجهة الكشاف والأكاديمية: محرك استكشاف المواهب (Opt-in)، إرسال دعوات تجارب الأداء، وباقات الاشتراك.',
    portalName: 'منظومة كشافة وأكاديميات جدة',
    portalSubtitle: 'محرك استكشاف المواهب (Opt-in)، إرسال دعوات تجارب الأداء، ومتابعة نجوم جدة',
    kpis: [
      { label: 'ترخيص الكشافة', value: 'فئة A ⚡', hint: 'كشاف ومسؤول معتمد' },
      { label: 'أمان الناشئين', value: '<18 سنة', hint: 'إشعار ولي الأمر إلزامي' },
      { label: 'نطاق التغطية', value: 'أحياء جدة', hint: 'مواهب أندية وحواري' },
    ],
    primaryTabs: [
      { id: 'academies', label: 'كشاف الأكاديميات والمواهب', icon: GraduationCap },
      { id: 'cards', label: 'قاعدة المواهب المتاحة', icon: Trophy },
      { id: 'totw', label: 'نجوم الأسبوع (TOTW)', icon: Crown },
    ],
    moreTabs: [
      { id: 'transfers', label: 'سوق الانتقالات والأحرار', sub: 'المواهب المتاحة للاستقطاب', icon: ArrowLeftRight },
      { id: 'challenges', label: 'المباريات الودية المفتوحة', sub: 'متابعة المباريات الحية بجدة', icon: Swords },
      { id: 'rules', label: 'ميثاق أمان الناشئين <18', sub: 'شروط إشعار أولياء الأمور', icon: HelpCircle },
    ],
  },
  referee: {
    name: 'الحكم أحمد الغامدي',
    roleTitle: 'حكم ساحة ودي معتمد',
    badge: 'حكم معتمد ⚖️',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    description: 'واجهة الحكم: جدول المباريات والتكليفات، الملف والاعتماد التحكيمي، واللوائح وقوانين اللعبة.',
    portalName: 'بوابة حكام المباريات الودية',
    portalSubtitle: 'جدول المباريات والتكليفات، البدلات المالية (100-200 ر.س)، واللوائح وقوانين اللعبة',
    kpis: [
      { label: 'الاعتماد التحكيمي', value: 'حكم معتمد ⚖️', hint: 'سجل موثق ونزيه' },
      { label: 'بدل المباراة الودية', value: '100 - 200 ر.س', hint: 'مكافأة مباشرة للمباراة' },
      { label: 'تقييم النزاهة', value: 'محمي وسري', hint: 'تقييمات موضوعية من الكباتن' },
    ],
    primaryTabs: [
      { id: 'referees', label: 'جدول تكليفات المباريات', icon: Scale },
      { id: 'challenges', label: 'المباريات الودية القادمة', icon: Swords },
      { id: 'facilities', label: 'دليل مواقع الملاعب بجدة', icon: MapPin },
      { id: 'rules', label: 'اللوائح التحكيمية وقوانين اللعب', icon: HelpCircle },
    ],
    moreTabs: [
      { id: 'cards', label: 'قاعدة بطاقات اللاعبين', sub: 'التحقق من بيانات المشاركين', icon: Trophy },
    ],
  },
};

/**
 * جدول الصلاحيات الرسمي لكل شاشة وميزة في المنصة (Role-Based Access Control)
 * يضمن منع الوصول غير المصرح به للواجهات (مثل إخفاء لوحة الكشاف والتكتيك السري عن غير المعنيين)
 */
export const VIEW_ROLE_PERMISSIONS: Record<string, {
  allowedRoles: UserRole[];
  viewTitle: string;
  description: string;
}> = {
  cards: {
    allowedRoles: ['player', 'captain', 'academy_scout', 'referee'],
    viewTitle: 'بطاقات اللاعبين (FUT)',
    description: 'قاعدة بيانات وهوية بطاقات اللاعبين الرقمية في جدة.',
  },
  rewards: {
    allowedRoles: ['player', 'captain'],
    viewTitle: 'متجر كابتن كوينز والمكافآت',
    description: 'محفظة النقاط ومكافآت خصومات الملاعب المخصصة للاعبين والكباتن.',
  },
  transfers: {
    allowedRoles: ['player', 'captain', 'academy_scout'],
    viewTitle: 'سوق الانتقالات واللاعبين الأحرار',
    description: 'استقطاب اللاعبين وإرسال واستقبال عروض الانتقال الرسمية.',
  },
  team_diary: {
    allowedRoles: ['player', 'captain'],
    viewTitle: 'يوميات ودردشة الفريق',
    description: 'مساحة التواصل الداخلي والتنسيق المباشر بين أعضاء الفريق والكابتن.',
  },
  referees: {
    allowedRoles: ['captain', 'pitch_owner', 'referee'],
    viewTitle: 'منظومة الحكام الوديين (سري)',
    description: 'سجل التكليفات والتقييم السري المخصص للكباتن والحكام وأصحاب الملاعب.',
  },
  totw: {
    allowedRoles: ['player', 'captain', 'academy_scout'],
    viewTitle: 'تشكيلة الأسبوع والشهر (TOTW)',
    description: 'نجوم جولة ملاعب جدة والبطاقات التكريمية للمواهب.',
  },
  academies: {
    allowedRoles: ['academy_scout'],
    viewTitle: 'لوحة كشاف الأكاديميات والمواهب',
    description: 'محرك استكشاف المواهب وإرسال دعوات تجارب الأداء الرسمية للأكاديميات المرخصة.',
  },
  pitch: {
    allowedRoles: ['captain'],
    viewTitle: 'التشكيلات والتكتيك الرياضي',
    description: 'بناء التكتيك وتوزيع مراكز اللاعبين على الملعب (مقتصر على كباتن الفرق).',
  },
  challenges: {
    allowedRoles: ['player', 'captain', 'pitch_owner', 'academy_scout', 'referee'],
    viewTitle: 'تحديات المباريات الودية العامة وتقسيم الملاعب',
    description: 'سوق المباريات المفتوحة للعامة بجدة وتقسيم العربون 50/50 تلقائياً.',
  },
  facilities: {
    allowedRoles: ['captain', 'pitch_owner', 'referee'],
    viewTitle: 'حجز الملاعب والمنشآت الرياضية',
    description: 'إدارة وحجز الملاعب والعربون المعتمد في جدة.',
  },
  rules: {
    allowedRoles: ['player', 'captain', 'pitch_owner', 'academy_scout', 'referee'],
    viewTitle: 'اللوائح والرسوم الرسمية',
    description: 'المرجع التنظيمي والمالي لمنصة كابتن جدة لكافة الأطراف.',
  },
};

/**
 * التحقق من صلاحية وصول الدور للشاشة المطلوبة
 */
export const isViewAllowedForRole = (view: string, role: UserRole): boolean => {
  const perm = VIEW_ROLE_PERMISSIONS[view];
  if (!perm) return true;
  return perm.allowedRoles.includes(role);
};

export default function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState<UserAccountProfile | null>(() => getStoredUserSession());
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => authenticatedUser?.role || 'player');
  const [players, setPlayers] = useState<Player[]>([]);
  const [referees, setReferees] = useState<FriendlyReferee[]>([]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [activeView, setActiveView] = useState<'cards' | 'transfers' | 'rewards' | 'totw' | 'pitch' | 'challenges' | 'academies' | 'facilities' | 'rules' | 'team_diary' | 'referees'>('cards');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);

  // نظام كابتن كوينز ومكافآت المنصة
  const [userCoins, setUserCoins] = useState<number>(50);
  const [coinTransactions, setCoinTransactions] = useState<CaptainCoinTransaction[]>([]);
  const [redeemedVouchers, setRedeemedVouchers] = useState<RedeemedRewardVoucher[]>([]);
  const [rewardItems, setRewardItems] = useState<RewardItem[]>(INITIAL_REWARD_ITEMS);

  // تهيئة Firebase والاشتراك الحي في مجموعات Firestore الحقيقية
  useEffect(() => {
    if (!authenticatedUser) return;

    // مزامنة حالة المستخدم الحالي مع Firestore
    syncUserProfile({
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      role: authenticatedUser.role,
      teamName: authenticatedUser.clubName,
      phone: authenticatedUser.phoneNumber,
    });

    testConnection().then((connected) => {
      setIsCloudConnected(connected);
    });

    // 1. اشتراك حي في اللاعبين الحقيقيين المسجلين في Firestore
    const unsubPlayers = subscribeToPlayers((cloudPlayers) => {
      if (cloudPlayers) {
        setPlayers(cloudPlayers);
      }
    });

    // 2. اشتراك حي في الحكام الوديين
    const unsubReferees = subscribeToReferees((cloudReferees) => {
      if (cloudReferees) {
        setReferees(cloudReferees);
      }
    });

    // 3. اشتراك حي في طلبات الانتقال وسوق اللاعبين
    const unsubTransfers = subscribeToTransferRequests((cloudTransfers) => {
      if (cloudTransfers) {
        setTransferRequests(cloudTransfers);
      }
    });

    // 4. اشتراك حي في محفظة كابتن كوينز للمستخدم الحالي
    const unsubWallet = subscribeToUserWallet(authenticatedUser.id, (walletData) => {
      if (walletData && typeof walletData.coins === 'number') {
        setUserCoins(walletData.coins);
        if (walletData.transactions) {
          setCoinTransactions(walletData.transactions);
        }
      }
    });

    // 5. اشتراك حي في الكوبونات المستبدلة للمستخدم الحالي
    const unsubVouchers = subscribeToRedeemedVouchers(authenticatedUser.id, (cloudVouchers) => {
      if (cloudVouchers) {
        setRedeemedVouchers(cloudVouchers);
      }
    });

    return () => {
      unsubPlayers();
      unsubReferees();
      unsubTransfers();
      unsubWallet();
      unsubVouchers();
    };
  }, [authenticatedUser]);

  // تحديث الدور عند تغير المستخدم
  useEffect(() => {
    if (authenticatedUser && authenticatedUser.role !== currentUserRole) {
      setCurrentUserRole(authenticatedUser.role);
    }
  }, [authenticatedUser]);

  // حماية تلقائية: إذا حاول الدور الوصول لواجهة غير مصرح بها، يعاد توجيهه تلقائياً لواجهته الرئيسية المسموحة
  useEffect(() => {
    if (!isViewAllowedForRole(activeView, currentUserRole)) {
      const fallbackTab = ROLE_PROFILES[currentUserRole].primaryTabs[0].id as any;
      setActiveView(fallbackTab);
    }
  }, [currentUserRole, activeView]);

  // دالة انتقال آمنة مع فحص الصلاحية فوراً وإشعار المستخدم في حال الحجب
  const handleNavigateToView = (view: any) => {
    if (!isViewAllowedForRole(view, currentUserRole)) {
      const targetPerm = VIEW_ROLE_PERMISSIONS[view];
      const allowedTitles = targetPerm?.allowedRoles.map((r) => ROLE_PROFILES[r].roleTitle).join(' أو ') || '';
      showToast(`⛔ وصول مقيد: صفحة [${targetPerm?.viewTitle || view}] مخصصة لـ (${allowedTitles}) وليست مصرحة لحساب ${ROLE_PROFILES[currentUserRole].roleTitle}.`);
      return false;
    }
    setActiveView(view);
    setIsMoreMenuOpen(false);
    setMobileMenuOpen(false);
    return true;
  };

  // تسجيل الخروج الآمن
  const handleLogout = () => {
    logoutUser();
    setAuthenticatedUser(null);
    showToast('تم تسجيل الخروج بنجاح. نراك قريباً في ملاعب جدة!');
  };

  // رفع وتحديث صورة اللاعب المباشرة
  const handleUpdateMyAvatar = async (file: File) => {
    if (!authenticatedUser) return;
    try {
      const base64 = await processImageFile(file, 400, 0.85);
      await updateUserAvatar(authenticatedUser.id, base64);
      setAuthenticatedUser((prev) => (prev ? { ...prev, avatarUrl: base64 } : null));
      setPlayers((prev) =>
        prev.map((p) => (p.id === authenticatedUser.id ? { ...p, avatarUrl: base64 } : p))
      );
      showToast('تم تحديث صورتك الشخصية على بطاقة فيفا بنجاح! 📸');
    } catch (err: any) {
      showToast(err.message || 'تعذر معالجة الصورة');
    }
  };

  // تسجيل الدخول أو إنشاء الحساب بنجاح
  const handleAuthSuccess = (profile: UserAccountProfile) => {
    setAuthenticatedUser(profile);
    setCurrentUserRole(profile.role);
    const defaultTab = ROLE_PROFILES[profile.role]?.primaryTabs[0]?.id || 'cards';
    setActiveView(defaultTab as any);
    showToast(`أهلاً بك كابتن ${profile.name}! تم تسجيل الدخول بنجاح.`);
  };
  
  // المودالز
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isGlobalInboxOpen, setIsGlobalInboxOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [simulatingPlayer, setSimulatingPlayer] = useState<Player | null>(null);
  const [selectedPlayerDetail, setSelectedPlayerDetail] = useState<Player | null>(null);
  const [exportingPlayer, setExportingPlayer] = useState<Player | null>(null);
  const [playerDetailInitialTab, setPlayerDetailInitialTab] = useState<'analytics' | 'unlocked' | 'catalog' | 'history'>('analytics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // فلاتر بطاقات اللاعبين
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>('all');
  const [badgeFilter, setBadgeFilter] = useState<string>('all');

  // رسالة إشعار سريعة (Toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // تسجيل لاعب جديد
  const handleSavePlayer = (newPlayer: Player) => {
    setPlayers((prev) => {
      const exists = prev.some((p) => p.id === newPlayer.id);
      if (exists) {
        return prev.map((p) => (p.id === newPlayer.id ? newPlayer : p));
      }
      return [newPlayer, ...prev];
    });
    // حفظ دائم في قاعدة بيانات Firestore السحابية
    savePlayerToCloud(newPlayer);
    showToast(`تم تسجيل بطاقة اللاعب [ ${newPlayer.name} ] بنجاح وحفظها في Firestore!`);
  };

  // تطبيق التقييم الأعمى
  const handleApplyPostMatchRatings = (updatedPlayers: Player[], refereeRating: number, toxicDiscarded: boolean) => {
    setPlayers(updatedPlayers);
    // حفظ تقييمات وتحديثات كل لاعب في Firestore سحابياً
    updatedPlayers.forEach((p) => savePlayerToCloud(p));

    const toxicMsg = toxicDiscarded ? ' وتم استبعاد التقييمات الشاذة أو الكيدية تلقائياً لحماية اللاعبين!' : '';
    
    // مكافأة كابتن كوينز للمشاركة بالتقييم الأعمى والروح الرياضية
    const earned = 5;
    const newBalance = userCoins + earned;
    setUserCoins(newBalance);
    const ratingTx: CaptainCoinTransaction = {
      id: `tx-${Date.now()}`,
      playerId: 'current-user-player',
      playerName: 'أنت (الكابتن المسجل)',
      amount: +earned,
      type: 'rating_submitted',
      description: 'تقديم التقييم الأعمى للمباراة والروح الرياضية',
      timestamp: 'الآن',
      platformProfitSarSnapshot: 10,
      rewardPercentSnapshot: 5,
    };
    const newTxList = [ratingTx, ...coinTransactions];
    setCoinTransactions(newTxList);
    saveUserWalletToCloud('current-user-player', newBalance, newTxList);

    showToast(`تم بنجاح احتساب التقييم الأعمى للمباراة وتحديث البطاقات في Firestore، وحصلت على +5 كابتن كوينز! تقييم الحكم: ${refereeRating}/10.${toxicMsg}`);
  };

  // تحديث السجل الداخلي للحكم الودي عند تقييمه بعد المباراة
  const handleUpdatePlayerRefereeProfile = (playerId: string, evaluation: RefereeEvaluation) => {
    setPlayers((prev) =>
      prev.map((player) => {
        if (player.id === playerId) {
          const currentProfile = player.internalRefereeProfile || {
            matchesOfficiated: 0,
            averageRating: 0,
            fairnessAvg: 0,
            timeManagementAvg: 0,
            foulDecisionsAvg: 0,
            composureAvg: 0,
            evaluations: [],
          };

          const newMatchesCount = currentProfile.matchesOfficiated + 1;
          const newEvals = [evaluation, ...currentProfile.evaluations];
          const newAvg =
            newEvals.reduce((sum, item) => sum + item.overallScore, 0) / newMatchesCount;
          const newFairness =
            newEvals.reduce((sum, item) => sum + item.fairnessScore, 0) / newMatchesCount;
          const newTime =
            newEvals.reduce((sum, item) => sum + item.timeManagementScore, 0) / newMatchesCount;
          const newFoul =
            newEvals.reduce((sum, item) => sum + item.foulDecisionsScore, 0) / newMatchesCount;
          const newComposure =
            newEvals.reduce((sum, item) => sum + item.composureScore, 0) / newMatchesCount;

          return {
            ...player,
            internalRefereeProfile: {
              matchesOfficiated: newMatchesCount,
              averageRating: Math.round(newAvg * 10) / 10,
              fairnessAvg: Math.round(newFairness * 10) / 10,
              timeManagementAvg: Math.round(newTime * 10) / 10,
              foulDecisionsAvg: Math.round(newFoul * 10) / 10,
              composureAvg: Math.round(newComposure * 10) / 10,
              evaluations: newEvals,
            },
          };
        }
        return player;
      })
    );
    showToast(`تم حفظ تقييم أداء الحكم الودي وتحديث سجله الداخلي بنجاح! السجل سري وخاص بالكباتن.`);
  };

  // حفظ تقييم الحكم في قسم الحكام الوديين
  const handleSaveRefereeEvaluation = (refereeId: string, evaluation: RefereeEvaluation) => {
    let linkedPlayerId: string | undefined;

    setReferees((prev) =>
      prev.map((ref) => {
        if (ref.id === refereeId) {
          linkedPlayerId = ref.playerId;
          const newMatchesCount = ref.matchesOfficiated + 1;
          const newEvals = [evaluation, ...ref.evaluations];
          const newAvg = newEvals.reduce((s, item) => s + item.overallScore, 0) / newEvals.length;
          const newFairness = newEvals.reduce((s, item) => s + item.fairnessScore, 0) / newEvals.length;
          const newTime = newEvals.reduce((s, item) => s + item.timeManagementScore, 0) / newEvals.length;
          const newFoul = newEvals.reduce((s, item) => s + item.foulDecisionsScore, 0) / newEvals.length;
          const newComposure = newEvals.reduce((s, item) => s + item.composureScore, 0) / newEvals.length;

          const updatedRef: FriendlyReferee = {
            ...ref,
            matchesOfficiated: newMatchesCount,
            averageRating: Math.round(newAvg * 10) / 10,
            fairnessAvg: Math.round(newFairness * 10) / 10,
            timeManagementAvg: Math.round(newTime * 10) / 10,
            foulDecisionsAvg: Math.round(newFoul * 10) / 10,
            composureAvg: Math.round(newComposure * 10) / 10,
            evaluations: newEvals,
          };
          saveRefereeToCloud(updatedRef);
          return updatedRef;
        }
        return ref;
      })
    );

    // إذا كان مرتبطاً بلاعب في المنصة نقوم بتحديث سجله الكروي أيضاً
    if (linkedPlayerId) {
      handleUpdatePlayerRefereeProfile(linkedPlayerId, evaluation);
    }
  };

  // تسجيل حكم ودي جديد
  const handleRegisterNewReferee = (newRef: FriendlyReferee) => {
    setReferees((prev) => [newRef, ...prev]);
    saveRefereeToCloud(newRef);
    showToast(`تم تسجيل الحكم الودي [ ${newRef.name} ] وحفظه سحابياً في Firestore!`);
  };

  // إرسال طلب انضمام لاعب حر
  const handleSendTransferRequest = (newRequest: TransferRequest) => {
    setTransferRequests((prev) => [newRequest, ...prev]);
    saveTransferRequestToCloud(newRequest);
    showToast(`تم إرسال طلب الانضمام إلى الكابتن [ ${newRequest.playerName} ] وتحديث Firestore بنجاح!`);
  };

  // قبول طلب الانضمام وتأكيد الانتقال
  const handleAcceptTransferRequest = (request: TransferRequest) => {
    // 1. تحديث حالة الطلب إلى مقبول
    setTransferRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'accepted' as const, read: true } : r))
    );
    updateTransferRequestStatusInCloud(request.id, 'accepted', true);

    // 2. تحديث نادي اللاعب ليصبح مع الفريق الطالب وحفظه سحابياً
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === request.playerId) {
          const updatedPlayer: Player = {
            ...p,
            clubName: request.senderTeamName,
            isFreeAgent: false,
            transferMarketStatus: 'not_available' as const,
          };
          savePlayerToCloud(updatedPlayer);
          return updatedPlayer;
        }
        return p;
      })
    );

    showToast(`تهانينا! تم قبول العرض وانضمام [ ${request.playerName} ] رسمياً إلى كتيبة [ ${request.senderTeamName} ]! 🎉`);
  };

  // الاعتذار عن طلب الانضمام
  const handleDeclineTransferRequest = (requestId: string) => {
    setTransferRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'declined' as const, read: true } : r))
    );
    updateTransferRequestStatusInCloud(requestId, 'declined', true);
    showToast(`تم تسجيل الاعتذار عن طلب الانضمام باحترام في Firestore.`);
  };

  // تحديد كل إشعارات الانتقال كمقروءة
  const handleMarkAllRequestsRead = () => {
    setTransferRequests((prev) => prev.map((r) => ({ ...r, read: true })));
    markAllTransferRequestsReadInCloud();
  };

  // 🪙 إدارة استبدال كابتن كوينز بالخصومات
  const handleRedeemReward = (reward: RewardItem) => {
    if (userCoins < reward.coinsRequired) {
      showToast(`رصيدك الحالي (${userCoins} كوينز) لا يكفي للاستبدال.`);
      return;
    }

    const code = `JED-${reward.category.toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // خصم الكوينز من المحفظة
    const newBalance = userCoins - reward.coinsRequired;
    setUserCoins(newBalance);

    // تسجيل المعاملة في سجل الكوينز
    const newTx: CaptainCoinTransaction = {
      id: `tx-${Date.now()}`,
      playerId: 'current-user-player',
      playerName: 'أنت (الكابتن المسجل)',
      amount: -reward.coinsRequired,
      type: 'store_redemption',
      description: `استبدال كوبون: ${reward.title} (${reward.partnerName})`,
      timestamp: 'الآن',
    };
    const newTxList = [newTx, ...coinTransactions];
    setCoinTransactions(newTxList);
    saveUserWalletToCloud('current-user-player', newBalance, newTxList);

    // إصدار الكوبون الرقمي النشط وحفظه في Firestore
    const newVoucher: RedeemedRewardVoucher = {
      id: `vch-${Date.now()}`,
      rewardId: reward.id,
      rewardTitle: reward.title,
      partnerName: reward.partnerName,
      partnerPhone: reward.partnerPhone,
      partnerNeighborhood: reward.partnerNeighborhood,
      partnerAddress: reward.partnerNeighborhood,
      voucherCode: code,
      coinsSpent: reward.coinsRequired,
      discountSummary: `خصم ${reward.discountValueSar} ريال عند الشراء`,
      redeemedAt: 'الآن',
      expiresAt: new Date(Date.now() + reward.expiresInDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
    };
    setRedeemedVouchers((prev) => [newVoucher, ...prev]);
    saveRedeemedVoucherToCloud(newVoucher);

    // تقليل الكمية المتبقية
    setRewardItems((prev) =>
      prev.map((item) =>
        item.id === reward.id ? { ...item, stockRemaining: Math.max(0, item.stockRemaining - 1) } : item
      )
    );

    showToast(`تم استبدال الخصم بنجاح وحفظ الكوبون في Firestore! كودك: ${code}`);
  };

  // 🏟️ محاكاة لعب مباراة 22 لاعب وفق المعادلة الاقتصادية الصارمة (20% إلى 30% من مكسب 10 ريال)
  const handleSimulateMatchEarning = () => {
    // المعادلة الصارمة: حجز 22 لاعب -> مكسب المنصة 10 ريال.
    // نسبة التوزيع 22% = 2.20 ريال مسبح المكافآت (10 كوينز لكل لاعب).
    // صافي ربح المنصة المضمون = 7.80 ريال صافية بدون أي خسارة.
    const earned = CAPTAIN_COINS_CONFIG.BASE_EARNING_PER_PLAYER; // 10 كوينز
    const newBalance = userCoins + earned;
    setUserCoins(newBalance);

    const newTx: CaptainCoinTransaction = {
      id: `tx-${Date.now()}`,
      playerId: 'current-user-player',
      playerName: 'أنت (الكابتن المسجل)',
      amount: +earned,
      type: 'match_played',
      description: 'حضور ولعب مباراة 22 لاعباً (الصفا) - مكسب المنصة 10 ر.س (مكافأة 22% = 10 كوينز)',
      timestamp: 'الآن',
      platformProfitSarSnapshot: 10,
      rewardPercentSnapshot: 22,
    };
    const newTxList = [newTx, ...coinTransactions];
    setCoinTransactions(newTxList);
    saveUserWalletToCloud('current-user-player', newBalance, newTxList);

    showToast(`تمت محاكاة حجز ولعب مباراة 22 لاعباً: كسبت +${earned} كوينز! (صافي ربح المنصة المحمي: 7.80 ر.س من أصل 10 ر.س)`);
  };

  // ⚖️ محاكاة تقييم مباراة
  const handleSimulateRatingEarning = () => {
    const earned = 5;
    setUserCoins((prev) => prev + earned);

    const newTx: CaptainCoinTransaction = {
      id: `tx-${Date.now()}`,
      playerId: 'current-user-player',
      playerName: 'أنت (الكابتن المسجل)',
      amount: +earned,
      type: 'rating_submitted',
      description: 'تقديم تقييم موضوعي ومحايد لحكم مباراة ودية والروح الرياضية',
      timestamp: 'الآن',
      platformProfitSarSnapshot: 10,
      rewardPercentSnapshot: 5,
    };
    setCoinTransactions((prev) => [newTx, ...prev]);

    showToast(`شكراً لتقييمك الرياضي! كسبت +${earned} كوينز أضيفت لمحفظتك.`);
  };

  // محاكي التقييم
  const handleUpdateSimulatedPlayer = (updated: Player) => {
    setPlayers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`تم تحديث بطاقة ${updated.name} إلى ${updated.overall} OVR!`);
  };

  // تصفية اللاعبين
  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.clubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPos = positionFilter === 'all' || player.position === positionFilter;
    const matchesTier = tierFilter === 'all' || player.cardTier === tierFilter;
    const matchesAge = ageGroupFilter === 'all' || player.ageCategory === ageGroupFilter;
    const matchesBadge =
      badgeFilter === 'all' ||
      (player.dynamicBadges || analyzeAndGenerateDynamicBadges(player)).some(
        (b) => b.id === badgeFilter
      );
    return matchesSearch && matchesPos && matchesTier && matchesAge && matchesBadge;
  });

  // إذا لم يكن المستخدم مسجلاً، تصبح الصفحة الرئيسية هي صفحة تسجيل وتسجيل الدخول الرسمية
  if (!authenticatedUser) {
    return (
      <AuthScreen
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col selection:bg-[#d4af37] selection:text-[#08090d] relative overflow-x-hidden">
      {/* هالة إضاءة الملعب الاحترافية الخافتة والمريحة للعين */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(16,185,129,0.07),rgba(212,175,55,0.04)_60%,transparent)] z-0" />

      {/* شريط الإشعار التفاعلي المنبثق */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#11141b] border border-[#d4af37]/60 text-[#f5d77f] font-bold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs md:text-sm animate-bounce">
          <Sparkles className="w-5 h-5 text-[#f5d77f] shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="font-bold text-base mr-2 text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* الشريط العلوي الفاخر (Header) متوافق تماماً مع الجوال والألوان الملكية - منظم ومرتب */}
      <header className="sticky top-0 z-40 bg-[#0a0c11]/95 backdrop-blur-xl border-b border-[#1c222e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative z-10">
          {/* الشعار والهوية الرسمية */}
          <div 
            onClick={() => handleNavigateToView(ROLE_PROFILES[currentUserRole].primaryTabs[0].id as any)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#c59b27] via-[#f5d77f] to-[#9e7922] p-0.5 shadow-lg shadow-[#c59b27]/20 flex items-center justify-center group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#08090d] rounded-[14px] flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[#f5d77f]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-['Changa',sans-serif] text-lg font-black tracking-tight text-white group-hover:text-[#f5d77f] transition">
                  كابتن جدة
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/35">
                  جدة 🇸🇦
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">المنظومة الرقمية الشاملة لكرة القدم في جدة</p>
            </div>
          </div>

          {/* أزرار الإجراء السريع للديسكتوب - مختصرة ومرتبة مع محدد نوع الحساب */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* مؤشر حالة قاعدة بيانات Firestore السحابية الحية */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition ${
                isCloudConnected
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-400'
              }`}
              title="حالة اتصال قاعدة بيانات Firebase Firestore السحابية الحية"
            >
              <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="hidden lg:inline">{isCloudConnected ? 'قاعدة بيانات سحابية متصلة ⚡' : 'جاري المزامنة...'}</span>
            </div>

            {/* بطاقة المستخدم المسجل الفعلي وإجراءات الحساب */}
            <div className="flex items-center gap-2.5 bg-[#11141b] border border-[#222735] px-3 py-1.5 rounded-xl">
              <img
                src={authenticatedUser?.avatarUrl || ROLE_PROFILES[currentUserRole].avatar}
                alt=""
                className="w-7 h-7 rounded-full object-cover border border-[#d4af37]/60 shrink-0"
              />
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-white leading-tight">
                  {authenticatedUser?.name || ROLE_PROFILES[currentUserRole].name}
                </span>
                <span className="text-[10px] text-[#f5d77f] font-bold leading-none">
                  {ROLE_PROFILES[currentUserRole].badge}
                </span>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="p-1 text-slate-400 hover:text-[#f5d77f] transition"
                title="دليل وصلاحيات حسابي"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleLogout}
                className="mr-1 px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1 border border-rose-500/30"
                title="تسجيل الخروج من الحساب"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden lg:inline">خروج</span>
              </button>
            </div>

            {/* محفظة كابتن كوينز (تظهر للأدوار التي تمتلك رصيد مكافآت: اللاعبين والكباتن) */}
            {['player', 'captain'].includes(currentUserRole) && (
              <button
                onClick={() => handleNavigateToView('rewards')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                  activeView === 'rewards'
                    ? 'bg-[#d4af37]/20 text-[#f5d77f] border-[#d4af37]'
                    : 'bg-[#11141b] hover:bg-[#161a24] text-slate-200 border-[#222735]'
                }`}
                title="رصيد كابتن كوينز ومتجر المكافآت"
              >
                <Coins className="w-3.5 h-3.5 text-[#f5d77f]" />
                <span className="text-[11px] font-mono font-black text-[#f5d77f]">
                  {userCoins} 🪙
                </span>
              </button>
            )}

            {/* جرس إشعارات وطلبات الانتقال والتحديات */}
            <button
              onClick={() => setIsGlobalInboxOpen(true)}
              className="relative p-2 rounded-xl bg-[#11141b] hover:bg-[#161a24] text-[#f5d77f] border border-[#222735] transition flex items-center justify-center"
              title="صندوق الإشعارات وطلبات الانتقال"
            >
              <Bell className="w-4 h-4" />
              {transferRequests.filter(r => !r.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-pulse">
                  {transferRequests.filter(r => !r.read).length}
                </span>
              )}
            </button>

            {/* أزرار الإجراء السريع مخصصة ومصممة وفق نوع الحساب النشط */}
            {currentUserRole === 'player' && (
              <>
                <button
                  onClick={() => setIsRatingModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#161a24] hover:bg-[#1d2332] text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  title="بدء التقييم الأعمى السري للمباراة"
                >
                  <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تقييم أعمى</span>
                </button>
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="gold-gradient-btn px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-bold shadow-md"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>بطاقتي الشخصية</span>
                </button>
              </>
            )}

            {currentUserRole === 'captain' && (
              <>
                <button
                  onClick={() => handleNavigateToView('challenges')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#161a24] hover:bg-[#1d2332] text-[#f5d77f] border border-[#d4af37]/30 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  title="إصدار تحدي 50/50 جديد"
                >
                  <Swords className="w-3.5 h-3.5 text-[#f5d77f]" />
                  <span>تحدي 50/50 ⚔️</span>
                </button>
                <button
                  onClick={() => handleNavigateToView('pitch')}
                  className="gold-gradient-btn px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-bold shadow-md"
                  title="إعداد التشكيلة والتكتيك الرياضي"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>التشكيلة والتكتيك</span>
                </button>
              </>
            )}

            {currentUserRole === 'pitch_owner' && (
              <>
                <button
                  onClick={() => handleNavigateToView('rules')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#161a24] hover:bg-[#1d2332] text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>العربون (100 ر.س)</span>
                </button>
                <button
                  onClick={() => handleNavigateToView('facilities')}
                  className="gold-gradient-btn px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-bold shadow-md"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>إدارة الملاعب</span>
                </button>
              </>
            )}

            {currentUserRole === 'academy_scout' && (
              <>
                <button
                  onClick={() => handleNavigateToView('totw')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#161a24] hover:bg-[#1d2332] text-[#f5d77f] border border-[#d4af37]/30 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Crown className="w-3.5 h-3.5 text-[#f5d77f]" />
                  <span>نجوم TOTW</span>
                </button>
                <button
                  onClick={() => handleNavigateToView('academies')}
                  className="gold-gradient-btn px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-bold shadow-md"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>رادار المواهب</span>
                </button>
              </>
            )}

            {currentUserRole === 'referee' && (
              <>
                <button
                  onClick={() => handleNavigateToView('rules')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#161a24] hover:bg-[#1d2332] text-slate-200 border border-[#2d3447] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>لوائح التحكيم</span>
                </button>
                <button
                  onClick={() => handleNavigateToView('referees')}
                  className="gold-gradient-btn px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-bold shadow-md"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>جدول تكليفاتي</span>
                </button>
              </>
            )}
          </div>

          {/* أزرار سريعة للجوال مخصصة حسب الدور */}
          <div className="flex md:hidden items-center gap-2">
            {['player', 'captain'].includes(currentUserRole) && (
              <button
                onClick={() => handleNavigateToView('rewards')}
                className="px-2.5 py-1.5 rounded-xl bg-[#11141b] border border-[#d4af37]/40 text-[#f5d77f] text-xs font-bold flex items-center gap-1 font-mono"
              >
                <Coins className="w-3.5 h-3.5 text-[#f5d77f]" />
                <span>{userCoins}</span>
              </button>
            )}
            <button
              onClick={() => setIsGlobalInboxOpen(true)}
              className="relative p-2 rounded-xl bg-[#11141b] border border-[#222735] text-[#f5d77f]"
              title="الإشعارات"
            >
              <Bell className="w-4 h-4" />
              {transferRequests.filter(r => !r.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white font-black text-[8px] rounded-full flex items-center justify-center">
                  {transferRequests.filter(r => !r.read).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="p-2 rounded-xl bg-[#11141b] border border-[#222735] text-[#f5d77f]"
              title="دليل الأدوار"
            >
              <UserCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#11141b] border border-[#222735] text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* شريط التبويبات المخصص بدقة حسب الدور النشط (Role-Tailored Tabs) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-2.5 border-t border-[#161a24] text-xs relative z-20">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            {/* التبويبات الأساسية المخصصة لهذا الحساب فقط */}
            {ROLE_PROFILES[currentUserRole].primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleNavigateToView(tab.id as any);
                  }}
                  className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap text-xs ${
                    isActive
                      ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/60 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#11141b] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#f5d77f]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {/* قائمة "المزيد" المخصصة والمفلترة بحسب نوع الحساب (تظهر فقط إذا كانت هناك تبويبات إضافية) */}
            {ROLE_PROFILES[currentUserRole].moreTabs.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap text-xs ${
                    ROLE_PROFILES[currentUserRole].moreTabs.some((t) => t.id === activeView)
                      ? 'bg-[#d4af37]/25 text-[#f5d77f] border border-[#d4af37] shadow-md'
                      : 'bg-[#11141b] hover:bg-[#171d28] text-slate-300 border border-[#222735]'
                  }`}
                >
                  <MoreHorizontal className="w-4 h-4 text-[#f5d77f]" />
                  <span>
                    {ROLE_PROFILES[currentUserRole].moreTabs.find((t) => t.id === activeView)
                      ? `المزيد: ${ROLE_PROFILES[currentUserRole].moreTabs.find((t) => t.id === activeView)?.label}`
                      : 'المزيد لدورك'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180 text-[#f5d77f]' : 'text-slate-400'}`} />
                </button>

                {/* القائمة المنسدلة المخصصة للأدوار */}
                {isMoreMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setIsMoreMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-[#0e1117] border border-[#262c3d] rounded-2xl p-2.5 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-1.5 border-b border-[#1c222e] mb-1.5 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">
                          ميزات إضافية خاصة بـ: {ROLE_PROFILES[currentUserRole].roleTitle}
                        </span>
                        <span className="text-[10px] bg-[#d4af37]/15 text-[#f5d77f] px-2 py-0.5 rounded-full font-bold">
                          {ROLE_PROFILES[currentUserRole].moreTabs.length} ميزات
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[70vh] overflow-y-auto">
                        {ROLE_PROFILES[currentUserRole].moreTabs.map((item) => {
                          const Icon = item.icon;
                          const isCurrent = activeView === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                handleNavigateToView(item.id as any);
                              }}
                              className={`p-2.5 rounded-xl text-right transition flex items-start gap-2.5 border ${
                                isCurrent
                                  ? 'bg-[#d4af37]/20 border-[#d4af37]/60 text-[#f5d77f]'
                                  : 'bg-[#121620] hover:bg-[#19202f] border-[#1e2433] text-slate-300'
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                                isCurrent ? 'bg-[#d4af37]/30 text-[#f5d77f]' : 'bg-[#08090d] text-slate-400'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold leading-snug truncate">{item.label}</div>
                                <div className="text-[10px] text-slate-400 truncate">{item.sub}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* مؤشر بصري يوضح الدور الحالي وحصر الخيارات */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{ROLE_PROFILES[currentUserRole].portalName}</span>
          </div>
        </div>

        {/* قائمة الجوال المنبثقة: مخصصة بالكامل للدور المختار */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0e1117] border-b border-[#1c222e] p-4 space-y-3 animate-in fade-in">
            {/* بطاقة المستخدم المسجل بالجوال */}
            <div className="bg-[#121620] p-3.5 rounded-2xl border border-[#222735] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={authenticatedUser?.avatarUrl || ROLE_PROFILES[currentUserRole].avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border border-[#d4af37]/60 shrink-0"
                />
                <div>
                  <div className="text-xs font-black text-white">{authenticatedUser?.name || ROLE_PROFILES[currentUserRole].name}</div>
                  <div className="text-[10px] text-[#f5d77f] font-bold">{ROLE_PROFILES[currentUserRole].badge}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-rose-500/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            </div>

            {/* قسم الخدمات الأساسية المخصصة للدور */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-black text-[#f5d77f] px-1 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>الخدمات الأساسية لحسابك</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {ROLE_PROFILES[currentUserRole].primaryTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isCurrent = activeView === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        handleNavigateToView(tab.id as any);
                      }}
                      className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 ${
                        isCurrent
                          ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5d77f]'
                          : 'bg-[#121620] border-[#1e2433] text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#f5d77f]" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* قسم المزيد من الخدمات المخصصة للدور (إن وجدت) */}
            {ROLE_PROFILES[currentUserRole].moreTabs.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[#1c222e]">
                <div className="text-[11px] font-black text-slate-400 px-1 flex items-center gap-1.5">
                  <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span>المزيد من الخدمات المتاحة لدورك</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {ROLE_PROFILES[currentUserRole].moreTabs.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          handleNavigateToView(item.id as any);
                        }}
                        className="p-2.5 rounded-xl bg-[#11141b] border border-[#222735] text-slate-200 font-bold text-xs flex items-center gap-2"
                      >
                        <Icon className="w-3.5 h-3.5 text-[#f5d77f]" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* زر التقييم الأعمى السريع بالجوال (متاح للاعبين والكباتن فقط) */}
            {['player', 'captain'].includes(currentUserRole) && (
              <button
                onClick={() => {
                  setIsRatingModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#161a24] border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2"
              >
                <EyeOff className="w-4 h-4" />
                <span>بدء التقييم الأعمى للمباراة</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* شريط الحساب النشط وتوضيح الصلاحيات المخصصة (Active Role Command Bar) */}
      <section className="bg-[#0b0e14] border-b border-[#181d28] py-3.5 px-4 sm:px-6 lg:px-8 relative z-10 shadow-inner">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* الصف الأول: معلومات الحساب النشط + أزرار التفاعل المباشر */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <img 
                  src={authenticatedUser?.avatarUrl || ROLE_PROFILES[currentUserRole].avatar} 
                  alt="" 
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-[#d4af37]/60 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0b0e14]" title="متصل الآن" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm md:text-base font-black text-white">{authenticatedUser?.name || ROLE_PROFILES[currentUserRole].name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40">
                    {ROLE_PROFILES[currentUserRole].badge}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold bg-[#161a24] px-2.5 py-0.5 rounded-lg border border-[#222735]">
                    {ROLE_PROFILES[currentUserRole].portalName}
                  </span>
                  {authenticatedUser?.neighborhood && (
                    <span className="text-[11px] text-slate-400 bg-[#090b10] px-2 py-0.5 rounded-lg border border-[#1f2636]">
                      📍 حي {authenticatedUser.neighborhood}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {ROLE_PROFILES[currentUserRole].portalSubtitle}
                </p>
              </div>
            </div>

            {/* أدوات الحساب النشط: رفع وتحديث الصورة + دليل الصلاحيات + تسجيل الخروج */}
            <div className="flex items-center gap-2 self-stretch lg:self-auto justify-between sm:justify-end flex-wrap">
              {currentUserRole === 'player' && (
                <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f5d77f] to-[#d4af37] text-black font-black text-xs hover:opacity-90 transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#d4af37]/20">
                  <Camera className="w-4 h-4" />
                  <span>رفع صورتي على البطاقة</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpdateMyAvatar(file);
                    }}
                  />
                </label>
              )}

              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-[#161a24] hover:bg-[#1e2330] border border-[#d4af37]/40 text-[#f5d77f] text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                title="شرح تفصيلي لصلاحيات وميزات حسابك"
              >
                <HelpCircle className="w-4 h-4 text-[#f5d77f]" />
                <span className="hidden sm:inline">دليل الصلاحيات</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                title="تسجيل الخروج من المنصة"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>

          {/* الصف الثاني: 3 بطاقات مؤشرات أداء (KPIs) مخصصة وحصرية لهذا الحساب */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {ROLE_PROFILES[currentUserRole].kpis.map((kpi, idx) => (
              <div 
                key={idx} 
                className="bg-[#121620]/80 border border-[#1e2433] hover:border-[#d4af37]/30 transition p-2.5 rounded-xl flex items-center justify-between gap-2 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-bold truncate">{kpi.label}</div>
                  <div className="text-xs font-black text-[#f5d77f] font-mono mt-0.5 truncate">{kpi.value}</div>
                </div>
                <div className="text-[10px] bg-[#090b10] border border-[#222735] text-slate-300 px-2 py-0.5 rounded-lg shrink-0">
                  {kpi.hint}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* المحتوى الرئيسي المحمي بنظام الصلاحيات (Role-Based Access Control) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10">
        {/* شاشة الحجب الأمني عند محاولة الوصول غير المصرح به لواجهة محظورة على هذا الدور */}
        {!isViewAllowedForRole(activeView, currentUserRole) && (
          <div className="bg-[#11141b] border border-rose-500/30 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <Lock className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                وصول مقيّد بنظام الصلاحيات (RBAC Restricted)
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white font-['Changa',sans-serif]">
                هذه الصفحة مخصصة لأدوار أخرى
              </h2>
              <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                صفحة <strong className="text-[#f5d77f]">[{VIEW_ROLE_PERMISSIONS[activeView]?.viewTitle || activeView}]</strong> غير مصرح بها لحساب <strong className="text-white">({ROLE_PROFILES[currentUserRole].roleTitle})</strong>.
              </p>
            </div>

            <div className="bg-[#08090d] border border-[#222735] rounded-2xl p-4 text-right space-y-2 text-xs">
              <div className="text-slate-400 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#d4af37]" />
                <span>من يملك صلاحية الوصول لهذه الشاشة؟</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {VIEW_ROLE_PERMISSIONS[activeView]?.allowedRoles.map((r) => (
                  <span
                    key={r}
                    className="px-2.5 py-1 bg-[#161a24] border border-[#2d3447] text-[#f5d77f] rounded-lg font-bold text-xs"
                  >
                    {ROLE_PROFILES[r].roleTitle}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <button
                onClick={() => setActiveView(ROLE_PROFILES[currentUserRole].primaryTabs[0].id as any)}
                className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg"
              >
                العودة للواجهة الرئيسية لحسابي ({ROLE_PROFILES[currentUserRole].primaryTabs[0].label})
              </button>
            </div>
          </div>
        )}

        {/* 1. تبويب بطاقات اللاعبين (FIFA Ultimate Team) - متاح للجميع للاطلاع */}
        {isViewAllowedForRole('cards', currentUserRole) && activeView === 'cards' && (
          <div className="space-y-6">
            {/* شريط الإيضاح المنظم والأنيق المخصص حسب الدور */}
            <div className="bg-[#11141b] border border-[#222735] rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base md:text-lg font-bold font-['Changa',sans-serif] text-white">
                    {currentUserRole === 'player' && 'بطاقات اللاعبين بملاعب جدة (FUT)'}
                    {currentUserRole === 'captain' && 'قاعدة مواهب جدة (استقطاب الكباتن والتشكيلات)'}
                    {currentUserRole === 'pitch_owner' && 'سجل لاعبي وفرق جدة (رواد الملاعب)'}
                    {currentUserRole === 'academy_scout' && 'رادار كشافة الأكاديميات واستكشاف المواهب'}
                    {currentUserRole === 'referee' && 'كشوفات اللاعبين الرسمية لمباريات جدة'}
                  </h2>
                  <span className="text-[10px] bg-[#d4af37]/15 text-[#f5d77f] px-2 py-0.5 rounded-full border border-[#d4af37]/30 font-bold font-mono">
                    {filteredPlayers.length} لاعب مسجل
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                    البداية 50 OVR • مضاعف ×3
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  {currentUserRole === 'player' && 'تقييم أعمى وسري بعد كل مباراة: التقييم فوق 6.0 يتضاعف ×3 لتسريع تطورك، ودون 6.0 يخصم -1.5 فقط مع حماية كاملة من التقييم الكيدي.'}
                  {currentUserRole === 'captain' && 'استكشف مواهب أحياء جدة ومراكز اللعب وقم بضمهم إلى تكتيك فريقك أو تقديم عروض انتقال مباشرة لقائمتك.'}
                  {currentUserRole === 'pitch_owner' && 'اطّلع على نشاط اللاعبين والفرق الرياضية التي تحجز في ملاعبك ونسب التزامهم بالروح الرياضية.'}
                  {currentUserRole === 'academy_scout' && 'استعرض إحصائيات اللاعبين والناشئين المؤهلين لتجارب الأداء، مع إمكانية إرسال استدعاء تجربة أداء رسمي.'}
                  {currentUserRole === 'referee' && 'تحقق من هويات وبطاقات اللاعبين المشاركين في المباريات الودية لضمان سلامة التنافس والنزاهة.'}
                </p>
              </div>

              {/* أزرار الإجراءات التفاعلية المخصصة للدور */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {currentUserRole === 'player' && (
                  <>
                    <button
                      onClick={() => setIsRatingModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-[#161a24] hover:bg-[#1e2330] text-emerald-400 border border-emerald-500/30 font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                      <EyeOff className="w-4 h-4 text-emerald-400" />
                      <span>بدء التقييم الأعمى</span>
                    </button>
                    <button
                      onClick={() => setIsRegisterOpen(true)}
                      className="px-3.5 py-2 rounded-xl gold-gradient-btn font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>تعديل بطاقتي</span>
                    </button>
                  </>
                )}

                {currentUserRole === 'captain' && (
                  <button
                    onClick={() => handleNavigateToView('pitch')}
                    className="px-3.5 py-2 rounded-xl gold-gradient-btn font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span>تجهيز التشكيلة والتكتيك</span>
                  </button>
                )}

                {currentUserRole === 'academy_scout' && (
                  <button
                    onClick={() => handleNavigateToView('academies')}
                    className="px-3.5 py-2 rounded-xl gold-gradient-btn font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>رادار ومحرك الكشافة</span>
                  </button>
                )}

                {currentUserRole === 'referee' && (
                  <button
                    onClick={() => handleNavigateToView('referees')}
                    className="px-3.5 py-2 rounded-xl gold-gradient-btn font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Scale className="w-4 h-4" />
                    <span>جدول تكليفاتي</span>
                  </button>
                )}
              </div>
            </div>

            {/* بطاقة اللاعب المسجل الشخصية مع إمكانية رفع وتعديل الصورة فورياً والبدء بـ 50 OVR */}
            {currentUserRole === 'player' && authenticatedUser && (
              <div className="bg-gradient-to-r from-[#121620] via-[#161b27] to-[#121620] border-2 border-[#d4af37]/40 rounded-3xl p-5 md:p-7 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="space-y-3 text-right flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40">
                        ⭐ بطاقتي الرسمية المعتمدة (FUT)
                      </span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-mono">
                        تقييم الانطلاق: 50 OVR
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-black text-white font-['Changa',sans-serif]">
                      أهلاً بك كابتن {authenticatedUser.name}
                    </h3>
                    
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                      هذه هي بطاقتك الرسمية التفاعلية في منصة كابتن جدة. جميع اللاعبين يبدأون بتقييم موحد (50 OVR)، وترتفع طاقتك وتتطور بطاقتك مع كل مباراة تسجلها وتخوضها بناءً على التقييم الأعمى لزملائك. يمكنك رفع صورتك الشخصية وتعديل بياناتك في أي وقت.
                    </p>

                    <div className="flex items-center gap-2.5 pt-2 flex-wrap">
                      <label className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f5d77f] to-[#d4af37] text-black font-black text-xs hover:opacity-90 transition cursor-pointer flex items-center gap-2 shadow-lg shadow-[#d4af37]/20">
                        <Camera className="w-4 h-4" />
                        <span>رفع / تغيير صورتي الشخصية</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpdateMyAvatar(file);
                          }}
                        />
                      </label>

                      <button
                        onClick={() => {
                          const myCard = players.find((p) => p.id === authenticatedUser.id);
                          if (myCard) {
                            setPlayerDetailInitialTab('unlocked');
                            setSelectedPlayerDetail(myCard);
                          } else {
                            showToast('بطاقتك في طور التجهيز');
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#161a24] hover:bg-[#1e2330] border border-[#262c3d] text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4 text-[#f5d77f]" />
                        <span>هويتي وشاراتي الرقمية</span>
                      </button>

                      <button
                        onClick={() => {
                          const myCard = players.find((p) => p.id === authenticatedUser.id);
                          if (myCard) {
                            setExportingPlayer(myCard);
                          } else {
                            // إنشاء نموذج للتصدير فورياً إذا لم تكن مسجلة بعد في Firestore
                            setExportingPlayer({
                              id: authenticatedUser.id,
                              name: authenticatedUser.name,
                              position: (authenticatedUser.position as any) || 'ST',
                              overall: 50,
                              cardTier: 'bronze',
                              clubName: authenticatedUser.clubName || 'لاعب حر (جدة)',
                              clubLogo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=100&auto=format&fit=crop&q=80',
                              avatarUrl: authenticatedUser.avatarUrl,
                              number: authenticatedUser.number || 10,
                              preferredFoot: (authenticatedUser.preferredFoot as any) || 'right',
                              neighborhood: authenticatedUser.neighborhood || 'جدة',
                              ageCategory: 'adults',
                              allowScoutVisibility: true,
                              isFreeAgent: true,
                              disciplineScore: 100,
                              matchesPlayed: 0,
                              stats: { pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50 },
                              badges: ['🚀 بداية المشوار']
                            });
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#161a24] hover:bg-[#1e2330] border border-[#262c3d] text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
                      >
                        <Share2 className="w-4 h-4 text-[#d4af37]" />
                        <span>تصدير بطاقتي كصورة</span>
                      </button>
                    </div>
                  </div>

                  {/* عرض بطاقة اللاعب المباشرة بتقييم 50 OVR */}
                  <div className="shrink-0 scale-90 md:scale-100">
                    {(() => {
                      const myCard = players.find((p) => p.id === authenticatedUser.id) || {
                        id: authenticatedUser.id,
                        name: authenticatedUser.name,
                        position: (authenticatedUser.position as any) || 'ST',
                        overall: 50,
                        cardTier: 'bronze' as const,
                        clubName: authenticatedUser.clubName || 'لاعب حر (جدة)',
                        clubLogo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=100&auto=format&fit=crop&q=80',
                        avatarUrl: authenticatedUser.avatarUrl,
                        number: authenticatedUser.number || 10,
                        preferredFoot: (authenticatedUser.preferredFoot as any) || 'right',
                        neighborhood: authenticatedUser.neighborhood || 'جدة',
                        ageCategory: 'adults' as const,
                        allowScoutVisibility: true,
                        isFreeAgent: true,
                        disciplineScore: 100,
                        matchesPlayed: 0,
                        stats: { pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50 },
                        badges: ['🚀 بداية المشوار']
                      };
                      return (
                        <FifaCard
                          player={myCard as any}
                          size="md"
                          showBadges={true}
                          onExport={(p) => setExportingPlayer(p)}
                          onClick={() => {
                            setPlayerDetailInitialTab('analytics');
                            setSelectedPlayerDetail(myCard as any);
                          }}
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* شريط البحث والفلاتر المتقدمة لأحياء ومراكز جدة */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#11141b] p-4 rounded-2xl border border-[#222735]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم اللاعب، النادي، أو حي جدة..."
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl pr-10 pl-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* المركز */}
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="bg-[#08090d] border border-[#222735] text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="all">كل المراكز</option>
                  <option value="GK">حراس (GK)</option>
                  <option value="CB">دفاع (CB)</option>
                  <option value="LB">أظهرة (LB/RB)</option>
                  <option value="CM">وسط (CM/CDM)</option>
                  <option value="CAM">صانع ألعاب (CAM)</option>
                  <option value="LW">أجنحة (LW/RW)</option>
                  <option value="ST">مهاجم صريح (ST)</option>
                </select>

                {/* الفئة السنية */}
                <select
                  value={ageGroupFilter}
                  onChange={(e) => setAgeGroupFilter(e.target.value)}
                  className="bg-[#08090d] border border-[#222735] text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="all">كافة الأعمار</option>
                  <option value="adults">كبار (18+)</option>
                  <option value="under_18">صغار وناشئون (&lt;18)</option>
                </select>

                {/* الفئة */}
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="bg-[#08090d] border border-[#222735] text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="all">كافة البطاقات</option>
                  <option value="bronze">برونزي (50 - 64)</option>
                  <option value="silver">فضي (65 - 74)</option>
                  <option value="gold">ذهبي ملكي (75+)</option>
                  <option value="totw">نجم الأسبوع (TOTW)</option>
                </select>

                {/* الشارات الرقمية التراكمية */}
                <select
                  value={badgeFilter}
                  onChange={(e) => setBadgeFilter(e.target.value)}
                  className="bg-[#08090d] border border-[#222735] text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="all">كافة الشارات الرقمية</option>
                  <option value="rock_defense">🛡️ صخرة الدفاع</option>
                  <option value="midfield_maestro">🪄 مايسترو الوسط</option>
                  <option value="clinical_finisher">🎯 الهداف الحاسم</option>
                  <option value="speed_rocket">⚡ سهم نفاثة</option>
                  <option value="steel_gloves">🧤 قفاز فولاذي</option>
                  <option value="iron_wall_gk">🧱 الحائط البشري</option>
                  <option value="capitano_spirit">👑 روح الكابيتانو</option>
                  <option value="engine_room">⚙️ محرك الفريق</option>
                  <option value="totw_hero">⭐ نجم الأسبوع</option>
                </select>
              </div>
            </div>

            {/* شبكة البطاقات */}
            {filteredPlayers.length === 0 ? (
              <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#c59b27]/20 to-[#f5d77f]/20 border border-[#d4af37]/30 text-[#f5d77f] flex items-center justify-center mx-auto shadow-lg">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white font-['Changa',sans-serif]">
                    لا توجد بطاقات لاعبين مسجلة بعد
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    تم إخلاء البيانات التجريبية والتطبيق الآن جاهز بالكامل لاستقبال اللاعبين الحقيقيين في ملاعب جدة وحساب تقييماتهم التراكمية.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#f5d77f] to-[#d4af37] text-black font-extrabold text-xs sm:text-sm hover:opacity-90 transition shadow-lg shadow-[#d4af37]/20 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    تسجيل أول لاعب حقيقي
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                {filteredPlayers.map((player) => (
                  <div key={player.id} className="flex flex-col items-center space-y-3">
                    <FifaCard
                      player={player}
                      size="md"
                      showBadges={true}
                      onExport={(p) => setExportingPlayer(p)}
                      onClick={() => {
                        setPlayerDetailInitialTab('analytics');
                        setSelectedPlayerDetail(player);
                      }}
                    />
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      <button
                        id={`btn-export-player-${player.id}`}
                        onClick={() => setExportingPlayer(player)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#161a24] hover:bg-[#1e2330] border border-[#d4af37]/40 hover:border-[#d4af37] text-[11px] text-[#f5d77f] font-bold transition flex items-center gap-1 shadow-sm"
                        title="تصدير ومشاركة البطاقة كصورة PNG فائقة الجودة"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#d4af37]" />
                        تصدير PNG
                      </button>
                      <button
                        onClick={() => {
                          setPlayerDetailInitialTab('analytics');
                          setSelectedPlayerDetail(player);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-[#11141b] hover:bg-[#181d28] border border-[#222735] hover:border-[#d4af37]/60 text-[11px] text-[#f5d77f] font-bold transition flex items-center gap-1 shadow-sm"
                        title="تحليلات الأداء المتقدمة ومخططات تطور المهارات عبر آخر 10 مباريات"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-[#d4af37]" />
                        تحليلات الأداء
                      </button>
                      <button
                        onClick={() => {
                          setPlayerDetailInitialTab('unlocked');
                          setSelectedPlayerDetail(player);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-[#161a24] hover:bg-[#1e2330] border border-[#222735] text-[11px] text-slate-300 hover:text-white font-bold transition flex items-center gap-1 shadow-sm"
                        title="استعراض الشارات الرقمية والهوية التراكمية"
                      >
                        <Award className="w-3.5 h-3.5 text-[#d4af37]" />
                        الشارات
                      </button>
                      <button
                        onClick={() => {
                          setPlayerDetailInitialTab('catalog');
                          setSelectedPlayerDetail(player);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-[#161a24] hover:bg-[#1e2330] border border-[#222735] text-[11px] text-slate-300 hover:text-white font-bold transition flex items-center gap-1 shadow-sm"
                        title="استعراض كتالوج الشارات والهوية الرياضية"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#f5d77f]" />
                        الهوية
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 1.4. تبويب متجر المكافآت واستبدال كابتن كوينز (نظام اقتصادي آمن ضد الخسارة) */}
        {isViewAllowedForRole('rewards', currentUserRole) && activeView === 'rewards' && (
          <div className="space-y-6">
            <RewardsStoreSection
              userCoins={userCoins}
              transactions={coinTransactions}
              vouchers={redeemedVouchers}
              rewardItems={rewardItems}
              onRedeemReward={handleRedeemReward}
              onSimulateMatchEarning={handleSimulateMatchEarning}
              onSimulateRatingEarning={handleSimulateRatingEarning}
              onShowToast={showToast}
            />
          </div>
        )}

        {/* 1.5. تبويب سوق الانتقالات المتقدم واستقطاب اللاعبين الأحرار */}
        {isViewAllowedForRole('transfers', currentUserRole) && activeView === 'transfers' && (
          <div className="space-y-6">
            <TransferMarketSection
              players={players}
              transferRequests={transferRequests}
              onSendTransferRequest={handleSendTransferRequest}
              onAcceptTransferRequest={handleAcceptTransferRequest}
              onDeclineTransferRequest={handleDeclineTransferRequest}
              onMarkAllRequestsRead={handleMarkAllRequestsRead}
              onOpenPlayerIdentity={(p) => setSelectedPlayerDetail(p)}
              onShowToast={showToast}
            />
          </div>
        )}

        {/* 2. تبويب يوميات الفريق والدردشة المباشرة (Real-time Team Hub) */}
        {isViewAllowedForRole('team_diary', currentUserRole) && activeView === 'team_diary' && (
          <div className="space-y-6">
            <TeamDiarySection
              players={players}
              onShowToast={showToast}
            />
          </div>
        )}

        {/* 2.5. تبويب إدارة وتقييم الحكام الوديين (سري للكباتن والمنظمين والحكام) */}
        {isViewAllowedForRole('referees', currentUserRole) && activeView === 'referees' && (
          <div className="space-y-6">
            <FriendlyRefereesSection
              referees={referees}
              players={players}
              onSaveRefereeEvaluation={handleSaveRefereeEvaluation}
              onRegisterNewReferee={handleRegisterNewReferee}
              onShowToast={showToast}
            />
          </div>
        )}

        {/* 3. تبويب تشكيلة الأسبوع والشهر (TOTW & TOTM) */}
        {isViewAllowedForRole('totw', currentUserRole) && activeView === 'totw' && (
          <TotwSection
            players={players}
            onUpdatePlayers={setPlayers}
            onSelectPlayer={(p) => setSelectedPlayerDetail(p)}
            onExportPlayer={(p) => setExportingPlayer(p)}
            onShowToast={showToast}
          />
        )}

        {/* 3. تبويب لوحة تحكم الأكاديميات واستكشاف المواهب (محصور بكشافي الأكاديميات) */}
        {isViewAllowedForRole('academies', currentUserRole) && activeView === 'academies' && (
          <div className="space-y-6">
            <AcademyDashboard
              players={players}
              onShowToast={showToast}
              onSelectPlayerDetail={(p) => setSelectedPlayerDetail(p)}
            />
          </div>
        )}

        {/* 4. تبويب التشكيلات والتكتيك الرياضي (محصور بكباتن الفرق) */}
        {isViewAllowedForRole('pitch', currentUserRole) && activeView === 'pitch' && (
          <div className="space-y-6">
            <TacticalPitchSquad
              players={players}
              currentUserRole={currentUserRole}
              onShowToast={showToast}
            />
          </div>
        )}

        {/* 3. تبويب تحديات المباريات الودية العامة (مع حماية الفئات السنية وتقسيم العربون) */}
        {isViewAllowedForRole('challenges', currentUserRole) && activeView === 'challenges' && (
          <div className="space-y-6">
            <FriendlyChallengesSection
              players={players}
              onUpdatePlayerRefereeProfile={handleUpdatePlayerRefereeProfile}
              currentUserRole={currentUserRole}
              userCoins={userCoins}
            />
          </div>
        )}

        {/* 4. تبويب ملاعب جدة والتراخيص والمحفظة المشتركة */}
        {isViewAllowedForRole('facilities', currentUserRole) && activeView === 'facilities' && (
          <div className="space-y-6">
            <PitchAndInstitutionsSection />
          </div>
        )}

        {/* 5. تبويب قوانين الرسوم والتقييم السري */}
        {isViewAllowedForRole('rules', currentUserRole) && activeView === 'rules' && (
          <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-6 md:p-8 space-y-8 max-w-4xl mx-auto text-xs md:text-sm shadow-xl">
            <div className="border-b border-[#1c222e] pb-4">
              <h2 className="text-xl md:text-2xl font-bold font-['Changa',sans-serif] text-white">
                دليل منظومة وقوانين منصة "كابتن جدة" الرسمية
              </h2>
              <p className="text-slate-400 mt-1">
                المرجع التشغيلي والمالي المعتمد للاعبين، الكباتن، أصحاب الملاعب، الأكاديميات، والكشافين
              </p>
            </div>

            {/* 1. نظام الرسوم المعتمد بدقة */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#f5d77f] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#d4af37]" />
                1. نظام الرسوم والمدفوعات المعتمد (العربون):
              </h3>
              <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-2 text-slate-300">
                <div className="flex justify-between py-1 border-b border-[#161a24]">
                  <span>• عربون تأكيد الحجز (غير مسترد لضمان الحضور والجدية):</span>
                  <span className="font-bold text-white font-mono">100.00 ريال</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#161a24]">
                  <span>• عمولة منصة كابتن جدة:</span>
                  <span className="font-bold text-white font-mono">10.00 ريال</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#161a24]">
                  <span>• رسوم بوابة الدفع الإلكتروني (مدى / Apple Pay / STC Pay):</span>
                  <span className="font-bold text-white font-mono">3.75 ريال</span>
                </div>
                <div className="flex justify-between pt-2 text-emerald-400 font-bold">
                  <span>المجموع الإجمالي لتأكيد الحجز:</span>
                  <span className="font-mono text-base">113.75 ريال</span>
                </div>
                <div className="p-3 bg-[#d4af37]/10 border border-[#d4af37]/25 rounded-xl text-[11px] text-[#f5d77f] mt-2">
                  💡 <strong>في المباريات الودية بين فريقين:</strong> يقوم النظام تلقائياً بتقسيم الفاتورة مناصفة (50% / 50%) بواقع <strong>56.88 ريال</strong> لكل فريق ليتم الدفع بعدالة وسلاسة.
                </div>
              </div>
            </div>

            {/* 2. معادلة التقييم الأعمى السري */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#f5d77f] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d4af37]" />
                2. معادلة التقييم الأعمى السري السريع (×3 / -1.5):
              </h3>
              <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-2 text-slate-300">
                <p>• يبدأ جميع اللاعبين الجدد من طاقة أساسية <strong className="text-[#f5d77f]">50 OVR</strong>.</p>
                <p>• التقييم أعمى وسري 100% بين اللاعبين بعد المباراة (يحق لكل لاعب تقييم حتى 5 لاعبين).</p>
                <p>• نقطة التعادل الطبيعية هي <strong>6.0 / 10</strong>.</p>
                <p>• إذا قيّم الزملاء اللاعب بأعلى من 6.0: يُضرب الفارق في <strong className="text-emerald-400">(×3.0)</strong> لتسريع تطور بطاقته.</p>
                <p>• إذا قيّم بأقل من 6.0: يخصم الفارق بمعدل <strong className="text-rose-400">(-1.5)</strong> فقط دون إجحاف.</p>
                <p>• نظام مكافحة التقييم الكيدي (Anti-Toxicity) يستبعد التقييمات الشاذة أو الانتقامية فوراً.</p>
              </div>
            </div>

            {/* 3. شروط التوثيق والرخص */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#f5d77f] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
                3. نظام التوثيق والتراخيص:
              </h3>
              <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-2 text-slate-300">
                <p>• <strong>اللاعب:</strong> هو الوحيد الذي يسجل مباشرة في المنصة دون الحاجة لرفع أي وثائق أو مستندات.</p>
                <p>• <strong>صاحب الملعب:</strong> ملزم برفع صور الملعب ورخصة البلدية أو السجل التجاري النظامي وتأكيد السلامة قبل تفعيل حسابه.</p>
                <p>• <strong>الكشافين والأكاديميات:</strong> يتطلب تسجيلهم رفع رخص التدريب أو الكشافة المعتمدة مع اشتراك شهري مدفوع، ولا يمكنهم الوصول لبيانات أي لاعب إلا إذا كان اللاعب قد وافق صراحة على إتاحة بياناته.</p>
              </div>
            </div>

            {/* 4. حماية الفئات السنية في المباريات الودية */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#f5d77f] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#d4af37]" />
                4. حماية الفئات السنية:
              </h3>
              <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-2 text-slate-300">
                <p>• يمنع النظام تماماً إقامة أي مباراة بين الكبار (18 سنة فما فوق) وبين الصغار والناشئين (أقل من 18 سنة).</p>
                <p>• الصغار يلعبون ضد الصغار حصراً، والكبار ضد الكبار لضمان السلامة والعدالة التنافسية.</p>
              </div>
            </div>

            {/* 5. التحكيم الودي الداخلي ونظام التقييم السري للكباتن */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#f5d77f] flex items-center gap-2">
                <EyeOff className="w-5 h-5 text-[#d4af37]" />
                5. التحكيم الودي الداخلي بين اللاعبين (سري ومحمي):
              </h3>
              <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-2 text-slate-300">
                <p>• <strong>تحديد الحكم الودي:</strong> يمكن لمنظم المباراة أو كباتن الفرق تحديد حكم ودّي من قائمة اللاعبين المشاركين أو المرشحين بالحي.</p>
                <p>• <strong>سرية التقييم الداخلي:</strong> تظهر تقييمات الحكم الودي وسجل أدائه حصراً لكباتن الفرق والمنظمين (مع أيقونة القفل 🔒) لمساعدتهم في اختيار أفضل الحكام للمباريات الودية.</p>
                <p>• <strong>الحجب التام عن العامة:</strong> لا تظهر تقييمات التحكيم الودي للجمهور أو في الملف العام للاعب، ولا تؤثر إطلاقاً على طاقات بطاقته الكروية (OVR).</p>
                <p>• <strong>معايير التقييم الودي الأربعة (1-10):</strong> تشمل: (1) الحيادية والنزاهة، (2) إدارة الوقت وتوقف اللعب، (3) حسم الأخطاء والاحتسابات، (4) الهدوء والسيطرة على الأجواء والملاحظات السرية.</p>
                <p>• <strong>الاعتماد الرسمي:</strong> الحكام المعتمدون برخص رسمية من الاتحاد فقط هم من يحملون صفة "حكم معتمد" معلنة للعامة.</p>
              </div>
            </div>

            {/* 6. نظام الشارات الرقمية الديناميكية والهوية التراكمية */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#f5d77f] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#d4af37]" />
                6. نظام الشارات الرقمية التراكمية (الهوية الرقمية للاعب):
              </h3>
              <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-2 text-slate-300">
                <p>• <strong>منح ديناميكي مؤتمت 100%:</strong> تُمنح الشارات الرقمية تلقائياً على بطاقات اللاعبين بناءً على خوارزمية تحليل سجل التقييمات التراكمي وتطور المهارات بعد كل مباراة ودية.</p>
                <p>• <strong>شارات المراكز والخصائص الفنية:</strong> تشمل شارات ريادية مثل: <strong>'صخرة الدفاع'</strong> (لقوة الافتكاك)، و<strong>'مايسترو الوسط'</strong> (لدقة التمرير وصناعة اللعب)، و<strong>'الهداف الحاسم'</strong> (لفاعلية إنهاء الهجمات)، و<strong>'سهم نفاثة'</strong> (للسرعة والانطلاق)، و<strong>'قفاز فولاذي'</strong> (لحراس المرمى البارعين)، و<strong>'روح الكابيتانو'</strong> (للانضباط والقيادة).</p>
                <p>• <strong>مستويات الندرة الملكية:</strong> تنقسم الشارات إلى فئات (ماسي، ذهبي، فضي، برونزي) مع وهج وتصميم مخصص يبرز فخامة بطاقة اللاعب فيفا.</p>
                <p>• <strong>تتبع مسار التقدم (Badge Catalog & Progress):</strong> يستطيع كل لاعب الاطلاع على نسب التقدم التراكمي نحو فتح الشارات القادمة ومعرفة المعايير الدقيقة المطلوبة في مبارياته القادمة بجدة.</p>
              </div>
            </div>

            {/* 7. تشكيلة الأسبوع والشهر الرسمية (TOTW & TOTM) */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#f5d77f] flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#d4af37]" />
                7. تشكيلة الأسبوع والشهر الرسمية (TOTW & TOTM):
              </h3>
              <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-2 text-slate-300">
                <p>• <strong>تشكيلة الأسبوع (Team of the Week):</strong> تصدر دورياً كل أسبوع وتضم نخبة اللاعبين الذين حققوا أعلى تقييم أعمى وفارق نقاط إيجابي بمعادلة (×3) في مباريات الجولة، مع توزيع تكتيكي متوازن (11v11 أو 8v8 أو 7v7).</p>
                <p>• <strong>تشكيلة الشهر (Team of the Month):</strong> تحتفي باللاعبين الأكثر ثباتاً واستمرارية طوال الشهر وفق معايير عدد المباريات، متوسط التقييم التراكمي، ونسبة الانضباط والروح الرياضية (90%+).</p>
                <p>• <strong>ترقية بطاقات النجوم:</strong> يحصل نجوم التشكيلة الأساسية على ترقية فورية لبطاقتهم إلى فئة <strong>TOTW الملكية (الأسود والذهب)</strong> مع شارة نجم الأسبوع/الشهر الخاصة.</p>
                <p>• <strong>مشاركة سهلة:</strong> يمكن بضغطة زر نسخ التقرير التكتيكي الشامل للتشكيلة ونشره عبر مجموعات الواتساب بين فرق وأحياء جدة.</p>
              </div>
            </div>

            {/* 8. منظومة اشتراكات الأكاديميات واستكشاف المواهب ودعوات التجارب */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#f5d77f] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#d4af37]" />
                8. منظومة الأكاديميات وبحث المواهب ودعوات تجارب الأداء (Scouting & Trials):
              </h3>
              <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-2 text-slate-300">
                <p>• <strong>الاشتراكات المدفوعة:</strong> باقات معتمدة ومجدولة (Starter: 350 ر.س، Scout Pro: 850 ر.س، Premier Elite: 1950 ر.س) تمنح الأكاديميات رصيد دعوات رسمي شهرياً ومحرك بحث متقدم.</p>
                <p>• <strong>حماية خصوصية اللاعبين المطلقة:</strong> لا تظهر في محرك البحث إلا بطاقات اللاعبين الذين فعلوا صراحة خيار السماح بالظهور للكشافين (Opt-in)، وتُحجب أرقام التواصل المباشرة تلقائياً.</p>
                <p>• <strong>حماية القُصّر (دون 18 عاماً):</strong> إرسال أي دعوة تجربة أداء للاعبين الناشئين يشترط إشعار وتأكيد ولي الأمر أو كابتن النادي المعتمد نظاماً، ويمنع التواصل المنفرد حفظاً للأمان الرياضي.</p>
                <p>• <strong>دعوات تجارب الأداء الرسمية:</strong> تصدر عبر المنصة بوثيقة مشفرة تحدد موعد الاختبار وموقع الملعب المعتمد بجدة والتقرير الفني للكشاف، مع خيار توفير وسيلة النقل الآمنة.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* النوافذ المنبثقة (Modals) */}
      <PlayerRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSavePlayer={handleSavePlayer}
        onShowToast={showToast}
      />

      <PostMatchRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        players={players}
        onApplyRatings={handleApplyPostMatchRatings}
      />

      {simulatingPlayer && (
        <RatingSimulatorModal
          isOpen={!!simulatingPlayer}
          onClose={() => setSimulatingPlayer(null)}
          player={simulatingPlayer}
          onSaveUpdatedPlayer={handleUpdateSimulatedPlayer}
        />
      )}

      {/* نافذة استعراض الهوية الرقمية وشارات اللاعب التراكمية */}
      <PlayerDigitalIdentityModal
        isOpen={!!selectedPlayerDetail}
        onClose={() => setSelectedPlayerDetail(null)}
        player={selectedPlayerDetail}
        initialTab={playerDetailInitialTab}
        onOpenSimulator={(p) => {
          setSelectedPlayerDetail(null);
          setSimulatingPlayer(p);
        }}
        onOpenExport={(p) => {
          setExportingPlayer(p);
        }}
      />

      {/* نافذة تصدير ومشاركة بطاقة فيفا كصورة PNG عالية الجودة */}
      <CardExportModal
        isOpen={!!exportingPlayer}
        onClose={() => setExportingPlayer(null)}
        player={exportingPlayer}
      />

      {/* صندوق طلبات الانتقال وإشعارات الكباتن العام */}
      <TransferInboxModal
        isOpen={isGlobalInboxOpen}
        onClose={() => setIsGlobalInboxOpen(false)}
        requests={transferRequests}
        onAcceptRequest={handleAcceptTransferRequest}
        onDeclineRequest={handleDeclineTransferRequest}
        onMarkAllAsRead={handleMarkAllRequestsRead}
        onShowToast={showToast}
      />

      {/* دليل وبوابات وصلاحيات الأدوار الموحدة (Role Guide Modal) */}
      <RoleGuideModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
