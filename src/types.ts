/**
 * Types and interfaces for Captain Jeddah (كابتن جدة) Platform
 */

export type PlayerPosition = 
  | 'GK'  // حارس مرمى
  | 'CB'  // قلب دفاع
  | 'LB'  // ظهير أيسر
  | 'RB'  // ظهير أيمن
  | 'CDM' // محور دفاعي
  | 'CM'  // لاعب وسط
  | 'CAM' // صانع ألعاب
  | 'LW'  // جناح أيسر
  | 'RW'  // جناح أيمن
  | 'ST'; // رأس حربة / مهاجم

export type AgeCategory = 'under_18' | 'adults'; // فئة سنية: أقل من 18 سنة أو كبار

export interface FieldPlayerStats {
  pac: number; // سرعة
  sho: number; // تسديد
  pas: number; // تمرير
  dri: number; // مراوغة
  def: number; // دفاع
  phy: number; // بدنية
}

export interface GoalkeeperStats {
  div: number; // ارتماء
  han: number; // إمساك وتصدي
  kic: number; // ركل وتمرير
  ref: number; // ردة فعل
  spd: number; // سرعة حركة
  pos: number; // تمركز
}

export type PlayerStats = FieldPlayerStats | GoalkeeperStats;

export type PlayerAvailabilityStatus = 'available' | 'injured' | 'suspended';

export interface CaptainNotification {
  id: string;
  timestamp: string;
  createdAt: number;
  playerId: string;
  playerName: string;
  playerAvatarUrl?: string;
  playerPosition: PlayerPosition;
  playerOverall: number;
  previousStatus: PlayerAvailabilityStatus;
  newStatus: PlayerAvailabilityStatus;
  reason?: string;
  wasExcludedFromLineup: boolean;
  affectedSquadRole?: string;
  read: boolean;
}

export interface Player {
  id: string;
  name: string;
  height: number; // الطول بالسنتيمتر (سم)
  preferredFoot: 'right' | 'left' | 'both';
  position: PlayerPosition;
  number: number;
  avatarUrl: string;
  neighborhood: string; // حي جدة (مثلاً: الحمدانية، أبحر، السامر...)
  age: number;
  ageCategory: AgeCategory;
  clubName: string;
  overall: number; // يبدأ من 50 للجميع
  stats: PlayerStats;
  status?: PlayerAvailabilityStatus; // 'available' (متاح) | 'injured' (مصاب) | 'suspended' (موقوف)
  statusReason?: string; // سبب الإصابة أو الإيقاف (اختياري)
  matchesPlayed: number;
  allowScoutVisibility: boolean; // موافقة اللاعب على الظهور للكشافين والأكاديميات
  ratingHistory: {
    matchId: string;
    date: string;
    rating: number; // مثلاً 8.5
    deltaPoints: number;
    evaluatedByCount: number;
  }[];
  cardTier: 'bronze' | 'silver' | 'gold' | 'totw';
  badges: string[];
  dynamicBadges?: DynamicBadge[];
  disciplineScore: number; // تقييم الانضباط في الموعد والروح الرياضية (1-100)
  // ملف التحكيم الودي الداخلي (خاص بالكباتن والمنظمين فقط ولا يظهر للعامة)
  internalRefereeProfile?: InternalRefereeProfile;
  // إعدادات سوق الانتقالات المتقدم
  isFreeAgent?: boolean; // هل اللاعب حر (بدون فريق رسمي)
  transferMarketStatus?: 'free_agent' | 'open_to_transfer' | 'not_available';
  freeAgentBio?: string; // نبذة اللاعب ورغبته الكروية في سوق الانتقالات
  phone?: string; // رقم الجوال للتواصل
  // رصيد كابتن كوينز (التي يكتسبها اللاعب من المباريات والتقييمات)
  captainCoins?: number;
}

export type TransferRequestType = 'permanent_signing' | 'match_trial' | 'tournament_guest';
export type TransferRequestStatus = 'pending' | 'accepted' | 'declined';

export interface TransferRequest {
  id: string;
  playerId: string;
  playerName: string;
  playerPosition: PlayerPosition;
  playerOverall: number;
  playerAvatarUrl: string;
  playerNeighborhood: string;
  playerAge: number;
  playerPhone?: string;

  // الكابتن والفريق الطالب
  senderCaptainName: string;
  senderTeamName: string;
  senderPhone: string;
  senderPitch: string;
  senderNeighborhood: string;

  // تفاصيل طلب الانضمام
  requestType: TransferRequestType;
  proposedRole: string; // مثل: 'مهاجم صريح'، 'صانع ألعاب مايسترو'، 'حارس مرمى أول'
  proposedShirtNumber?: number;
  matchOrTrialDate?: string;
  matchOrTrialTime?: string;
  messageNotes?: string;

  // الحالة والتاريخ
  status: TransferRequestStatus;
  createdAt: string;
  read: boolean;
}

export type BadgeRarity = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';

export interface DynamicBadge {
  id: string;
  name: string; // مثل: 'صخرة الدفاع'، 'مايسترو الوسط'، 'الهداف الحاسم'
  category: 'defense' | 'midfield' | 'attack' | 'goalkeeper' | 'leadership' | 'special';
  icon: string;
  description: string;
  criteriaMetReason: string; // تحليل رياضي تلقائي للسجل التراكمي
  rarity: BadgeRarity;
  glowColor: string;
  isUnlocked: boolean;
  progressPercent?: number; // نسبة التقدم لفتح الشارة (0-100)
}

export interface RefereeEvaluation {
  id: string;
  matchId: string;
  matchTitle?: string;
  evaluatorCaptainName: string;
  evaluatorTeamName: string;
  date: string;
  overallScore: number; // مثلاً 8.5/10
  fairnessScore: number; // الحيادية والنزاهة
  timeManagementScore: number; // إدارة الوقت والتبديلات
  foulDecisionsScore: number; // حسم الأخطاء واللمسات
  composureScore: number; // الهدوء والسيطرة على المباراة
  privateNotes?: string; // ملاحظة سرية للكباتن فقط
}

export interface InternalRefereeProfile {
  matchesOfficiated: number; // عدد المباريات التي حكمها ودياً
  averageRating: number; // متوسط التقييم الودي العام من 10
  fairnessAvg: number;
  timeManagementAvg: number;
  foulDecisionsAvg: number;
  composureAvg: number;
  evaluations: RefereeEvaluation[];
}

export interface FriendlyReferee {
  id: string;
  playerId?: string; // ارتباط بملف لاعب في المنصة إذا وجد
  name: string;
  phone: string;
  avatarUrl: string;
  neighborhood: string; // حي جدة
  experienceYears: number;
  preferredFormats: SquadFormat[]; // مثلاً: 7v7, 8v8, 11v11
  availabilityStatus: 'available' | 'weekend' | 'busy';
  isCaptainVerified: boolean; // حكم موثوق ومزكى من كباتن الأحياء
  matchesOfficiated: number;
  averageRating: number; // التقييم السري العام من 10
  fairnessAvg: number;        // النزاهة والحياد وعدم التحيز
  timeManagementAvg: number;  // إدارة الوقت والتبديلات
  foulDecisionsAvg: number;   // حسم الأخطاء والشجاعة في القرار
  composureAvg: number;       // الهدوء والسيطرة على انفعالات المباراة
  evaluations: RefereeEvaluation[];
  specialties: string[]; // أوسمة الكباتن: عين الصقر، هادئ وحكيم، صارم وعادل
  honorariumType: 'voluntary' | 'standard_honorarium'; // تحكيم تطوعي ودي أو مكافأة رمزية
  honorariumAmount?: number; // مثلاً 50 أو 80 ريال
  bio?: string;
}

export interface RefereeBookingRequest {
  id: string;
  refereeId: string;
  refereeName: string;
  captainName: string;
  captainPhone: string;
  teamName: string;
  opponentTeamName: string;
  matchDate: string;
  matchTime: string;
  pitchName: string;
  neighborhood: string;
  format: SquadFormat;
  honorariumProposed: number;
  notes?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface FriendlyRefereeAssignment {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  teamName: string;
  assignedByCaptain: string;
  assignedAt: string;
  status: 'assigned' | 'evaluated';
  evaluation?: RefereeEvaluation;
}

export interface SquadSlot {
  slotId: string;
  role: PlayerPosition;
  x: number; // نسبة مئوية %
  y: number; // نسبة مئوية %
  assignedPlayerId: string | null;
}

export type SquadFormat = '5v5' | '6v6' | '7v7' | '8v8' | '9v9' | '10v10' | '11v11';

export interface Formation {
  id: string;
  name: string;
  format: SquadFormat;
  slots: SquadSlot[];
  isCustom?: boolean;
}

export const FINANCIAL_FEES = {
  NON_REFUNDABLE_DEPOSIT: 100, // عربون 100 ريال غير مسترد
  PLATFORM_COMMISSION: 10,     // عمولة المنصة 10 ريال
  PAYMENT_GATEWAY_FEE: 3.75,   // رسوم بوابة الدفع 3.75 ريال
  TOTAL_BOOKING_DEPOSIT: 113.75,
  SPLIT_SHARE_PER_TEAM: 56.88, // نصيب كل فريق عند التقسيم 50%
};

export type SkillLevel = 'amateur' | 'intermediate' | 'pro' | 'all_levels';

export interface FriendlyChallenge {
  id: string;
  creatorTeamName: string;
  creatorCaptainName: string;
  creatorCaptainPhone: string;
  neighborhood: string; // حي في جدة
  neighborhoodZone?: 'شمال جدة' | 'وسط جدة' | 'شرق جدة' | 'جنوب جدة' | 'كافة أحياء جدة';
  allowNearbyNeighborhoods?: boolean; // مرونة اللعب في الأحياء المجاورة
  isPublic?: boolean; // تفعيل منطق التحديات الودية للعامة
  date: string;
  time: string;
  format: SquadFormat;
  ageCategory: AgeCategory; // حماية الفئات السنية: صغار ضد صغار (<18)، كبار ضد كبار (18+)
  targetAgeGroup?: string; // وصف الفئة العمرية المحددة من الكابتن (مثلاً: 18 - 25 سنة، ناشئون 14 - 17)
  minAge?: number; // الحد الأدنى للعمر
  maxAge?: number; // الحد الأقصى للعمر
  skillLevel?: SkillLevel; // فلتر المستوى: هواة، متوسط، متقدم/محترفين، مفتوح
  pitchPreference: string;
  pitchId?: string;
  pitchPricePerHour?: number; // سعر الساعة للملعب المختار لتقسيم التكاليف الشاملة
  status: 'open_for_challengers' | 'accepted' | 'deposit_paid' | 'completed';
  acceptedTeamName?: string;
  acceptedCaptainName?: string;
  depositStatus: {
    creatorPaid: boolean;
    challengerPaid: boolean;
    totalPaid: number;
    splitPerTeam: number; // المبلغ الدقيق المقسم على الفريقين (56.88 ر.س)
    depositAmount?: number; // العربون الأساسي 100 ر.س
    platformCommission?: number; // عمولة المنصة 10 ر.س
    paymentGatewayFee?: number; // رسوم الدفع 3.75 ر.س
    remainingAtPitch?: number; // المتبقي للملعب عند الحضور
    remainingPerTeam?: number; // نصيب كل فريق من الملعب عند الحضور
  };
  friendlyReferee?: FriendlyRefereeAssignment;
}

export interface MissingPlayerRequest {
  id: string;
  teamName: string;
  pitchName: string;
  neighborhood: string;
  date: string;
  time: string;
  neededPosition: PlayerPosition;
  minRating: number; // التقييم المطلوب لا يقل عن مثلاً 65 OVR
  feeShare: number; // نصيبه من الإيجار (مثلاً 25 ريال)
  ageCategory: AgeCategory;
  applicants: string[]; // معرفات اللاعبين المتقدمين
}

export interface GroupWallet {
  id: string;
  groupName: string;
  pitchName: string;
  neighborhood: string;
  weeklyDay: string; // مثلاً كل اثنين
  weeklyTime: string; // مثلاً 21:00
  memberCount: number;
  balance: number;
  weeklyDeduction: number;
  members: {
    playerId: string;
    playerName: string;
    status: 'paid' | 'pending';
    lastPaidAt?: string;
  }[];
}

export interface Pitch {
  id: string;
  name: string;
  neighborhood: string; // حي بجدة
  city: 'جدة';
  type: 'عشب صناعي (جيل رابع)' | 'عشب طبيعي' | 'صالات داخلية مكيفة';
  capacity: SquadFormat[];
  pricePerHour: number;
  rating: number;
  isCoveredAirConditioned: boolean; // مكيف لمواجهة طقس ورطوبة جدة
  features: string[];
  imageUrl: string;
  verificationStatus: 'verified' | 'pending';
  commercialRegFile?: string;
}

export type InstitutionRole = 'pitch_owner' | 'scout' | 'academy' | 'coach' | 'certified_referee';

export interface PendingVerificationRequest {
  id: string;
  role: InstitutionRole;
  fullNameOrEntity: string;
  neighborhood: string;
  phone: string;
  email: string;
  licenseOrCRNumber: string;
  documentsUploaded: string[]; // صور الملعب، رخصة العمل، السجل التجاري
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  monthlyPlan?: 'starter' | 'pro' | 'elite';
}

export interface MatchCrewOption {
  id: string;
  name: string;
  role: 'حكم معتمد' | 'مصور احترافي (فيديو وفوتو)' | 'مسعف أولي للمباريات';
  price: number;
  rating: number;
  avatarUrl: string;
  neighborhood: string;
}

export interface SquadLineupPlayer {
  player: Player;
  slotRole: PlayerPosition;
  isCaptain?: boolean;
  isMvp?: boolean;
  performanceScore: number;
  highlightReason: string;
  isElite11Displaced?: boolean;
  x: number; // نسبة الموضع الأفقي في الملعب (0 - 100)
  y: number; // نسبة الموضع الرأسي في الملعب (0 - 100)
}

export interface TotwSelection {
  id: string;
  type: 'week' | 'month';
  periodLabel: string; // e.g. 'الأسبوع 3 - سبتمبر 2026'
  editionNumber: number;
  formation: string;
  format: SquadFormat;
  elite11PlayerIds?: string[];
  startingLineup: SquadLineupPlayer[];
  bench: SquadLineupPlayer[];
  mvpPlayerId: string;
  captainPlayerId: string;
  publishedDate: string;
  curatorNotes: string;
}

export interface SkillMatchHistoryPoint {
  matchIndex: number;
  matchLabel: string;
  matchDate: string;
  speed: number;    // السرعة (PAC)
  passing: number;  // التمرير (PAS)
  defense: number;  // الدفاع (DEF)
  skill: number;    // المهارة والمراوغة (DRI)
  strength: number; // القوة والبدنية (PHY)
  overall: number;  // المعدل العام
  matchRating: number;
  delta: number;
  opponentTeam?: string;
  pitchName?: string;
  scoutNote?: string;
}

export interface PerformanceAnalyticsSummary {
  timeline: SkillMatchHistoryPoint[];
  initialStats: { speed: number; passing: number; defense: number; skill: number; strength: number; overall: number };
  currentStats: { speed: number; passing: number; defense: number; skill: number; strength: number; overall: number };
  growth: { speed: number; passing: number; defense: number; skill: number; strength: number; overall: number };
  bestSkillGrowth: { name: string; key: 'speed' | 'passing' | 'defense' | 'skill' | 'strength'; gain: number };
  avgRatingLast10: number;
  formStatus: 'exceptional' | 'rising' | 'steady';
  totalDeltaLast10: number;
  scoutRecommendation: string;
}

// -------------------------------------------------------------
// الأكاديميات والكشافين: الاشتراكات المدفوعة ومحرك بحث المواهب ودعوات التجارب
// -------------------------------------------------------------

export type AcademyPlanTier = 'starter' | 'scout_pro' | 'premier_elite';

export interface AcademySubscriptionPlan {
  id: AcademyPlanTier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  badge: string;
  invitationsPerMonth: number; // رصيد دعوات اختبارات الأداء شهرياً
  searchQuota: string; // حصة البحث
  features: string[];
  isPopular?: boolean;
}

export interface AcademyProfile {
  id: string;
  academyName: string;
  city: 'جدة';
  headScoutName: string;
  licenseNumber: string; // ترخيص وزارة الرياضة / الاتحاد السعودي
  neighborhood: string;
  contactEmail: string;
  contactPhone: string;
  avatarUrl: string;
  plan: AcademyPlanTier;
  planStatus: 'active' | 'trial' | 'expired';
  subscribedUntil: string;
  availableInvitations: number;
  totalInvitationsSent: number;
  acceptedTrialsCount: number;
}

export interface TrialInvitation {
  id: string;
  academyId: string;
  academyName: string;
  scoutName: string;
  playerId: string;
  playerName: string;
  playerPosition: PlayerPosition;
  playerAge: number;
  playerAgeCategory: AgeCategory;
  playerNeighborhood: string;
  pitchLocation: string; // موقع الملعب المعتمد للتجربة بجدة
  trialDate: string;
  trialTime: string;
  trialType: 'first_team_scouting' | 'youth_academy_trial' | 'fitness_evaluation';
  status: 'sent' | 'accepted' | 'declined' | 'completed';
  sentAt: string;
  guardianPhoneRequired: boolean; // إلزامي إذا كان اللاعب أقل من 18 سنة
  confidentialNotes?: string; // تقرير الكشاف الفني السري
  transportationProvided?: boolean; // توفير مواصلات للاعب
}

export type TeamChatChannel = 'scheduling' | 'general' | 'tactics';

export interface ChatPollData {
  eventTitle: string;
  matchType?: 'internal_scrimmage' | 'friendly_rival'; // نوع المباراة: تقسيمة داخلية بين لاعبي الفريق أو ودية ضد منافس
  date: string;
  time: string;
  pitchName: string;
  neighborhood: string;
  format: '5x5' | '7x7' | '8x8' | '9x9' | '11x11';
  requiredPlayers: number;
  confirmedPlayerIds: string[]; // اللاعبون الأساسيون المعتمدون (الحد الأقصى = requiredPlayers) مرتبين بأسبقية الحضور (FIFO)
  waitingListPlayerIds?: string[]; // قائمة الانتظار المرتبة زمنياً بالنزاهة (من حضر أولاً)
  declinedPlayerIds: string[];
  tentativePlayerIds: string[];
  teamADivision?: string[]; // توزيع الفريق أ (أبيض)
  teamBDivision?: string[]; // توزيع الفريق ب (ملون / أزرق)
  promotedPlayerAlert?: {
    promotedPlayerId: string;
    promotedPlayerName: string;
    replacedPlayerName: string;
    timestamp: string;
  };
}

export interface TeamChatMessage {
  id: string;
  teamId: string;
  channel: TeamChatChannel;
  senderId: string;
  senderName: string;
  senderRole: 'captain' | 'vice_captain' | 'player';
  senderPosition: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  createdAt: number;
  type: 'text' | 'schedule_poll' | 'system_announcement';
  pollData?: ChatPollData;
  reactions?: Record<string, string[]>; // emoji -> array of senderIds
}

export interface TeamDiaryEntry {
  id: string;
  teamId: string;
  title: string;
  category: 'training' | 'match_review' | 'announcement' | 'tactical_note';
  date: string;
  authorName: string;
  authorRole: string;
  content: string;
  location?: string;
  opponent?: string;
  score?: string;
  highlights: string[];
  attendanceRate?: number;
  pinned?: boolean;
}

// ==========================================
// 🪙 نظام كابتن كوينز ومتجر المكافآت (Captain Coins & Rewards Store)
// المعادلة الاقتصادية للأمان المالي:
// عند حجز 22 لاعب لملعب، ربح المنصة = 10 ريال.
// يتم تخصيص نسبة آمنة (حد أقصى 20% إلى 30%) = 2 إلى 3 ريال كحد أقصى توزع على اللاعبين.
// وبالتالي يتبقى للمنصة ربح مضمون 70% إلى 80% (7 إلى 8 ريال صافي دون خسارة).
// ==========================================

export const CAPTAIN_COINS_CONFIG = {
  PLATFORM_COMMISSION_SAR: 10,        // مكسب المنصة عند حجز 22 لاعب لملعب (10 ريال)
  MAX_REWARD_PERCENTAGE: 30,          // أقصى نسبة توزيع (30%) تضمن عدم الخسارة
  MIN_REWARD_PERCENTAGE: 20,          // الحد الأدنى للمكافآت (20%)
  DEFAULT_REWARD_PERCENTAGE: 25,      // النسبة الافتراضية الذكية (25% = 2.50 ريال)
  SAR_TO_COINS_RATIO: 100,            // كل 1 ريال = 100 كابتن كوين (1 كوين = 1 هللة)
  MAX_COINS_POOL_PER_MATCH: 300,      // أقصى كوينز توزع لمباراة 22 لاعب (300 كوين = 3.00 ريال)
  STANDARD_PLAYERS_PER_MATCH: 22,     // 22 لاعب في التشكيلة الكاملة للملعب
  BASE_EARNING_PER_PLAYER: 10,        // 10 كوينز لكل لاعب حضر ولعب (22 × 10 = 220 كوينز = 2.20 ريال)
  RATING_SUBMISSION_BONUS: 3,         // 3 كوينز عند تقديم تقييم موضوعي للحكم أو الزملاء
  MOTM_REWARD_BONUS: 7,               // 7 كوينز إضافية لرجل المباراة (MOTM)
  CLEAN_SHEET_BONUS: 5,               // 5 كوينز لحارس المرمى والدفاع عند الشباك النظيفة
  SAFE_MINIMUM_NET_PROFIT_SAR: 7.0,   // صافي ربح المنصة المحمي الأدنى (7.00 - 8.00 ريال)
};

export type RewardCategory = 
  | 'all'
  | 'shoes'           // أحذية ملاعب العشب الصناعي TF
  | 'gloves_guards'   // قفازات حراس المرمى وواقي قصبة الساق
  | 'jerseys'         // أطقم وتيشرتات وطباعة أرقام وأسماء
  | 'equipment'       // كرات معتمدة وشنط رياضية
  | 'pitch_vouchers'; // خصومات على حجوزات الملاعب بجدة

export interface SportsPartner {
  id: string;
  name: string;
  brand: string;
  category: string;
  neighborhood: string;
  address: string;
  phone: string;
  logoUrl: string;
  verifiedPartner: boolean;
  rating: number;
  perksDescription: string;
}

export interface RewardItem {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerNeighborhood: string;
  partnerPhone: string;
  title: string;
  description: string;
  category: RewardCategory;
  originalPriceSar: number;
  discountValueSar: number; // قيمة الخصم بالريال (يتحمل الشريك جزء التسويق والمنصة تضمن الحصة)
  discountPercentage?: number;
  coinsRequired: number; // عدد الكابتن كوينز المطلوبة للاستبدال
  imageUrl: string;
  tag: string; // مثل: 'شريك معتمد بجدة', 'خصم حصري', 'الأكثر طلباً'
  stockRemaining: number;
  terms: string[];
  expiresInDays: number;
  coMarketingPartnerDiscount: boolean; // هل الخصم مدعوم من شريك التجزئة لزيادة زبائنه؟
}

export interface CaptainCoinTransaction {
  id: string;
  playerId: string;
  playerName: string;
  amount: number; // موجب للاكتساب، سالب للاستبدال
  type: 'match_played' | 'rating_submitted' | 'motm_bonus' | 'clean_sheet' | 'store_redemption' | 'welcome_bonus';
  description: string;
  timestamp: string;
  matchId?: string;
  platformProfitSarSnapshot?: number; // لتوثيق أن المكافأة مقتطعة بنسبة ≤ 30% من الـ 10 ريال
  rewardPercentSnapshot?: number;
}

export interface RedeemedRewardVoucher {
  id: string;
  rewardId: string;
  rewardTitle: string;
  partnerName: string;
  partnerPhone: string;
  partnerNeighborhood: string;
  partnerAddress: string;
  voucherCode: string;
  coinsSpent: number;
  discountSummary: string;
  redeemedAt: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired';
  qrPlaceholderText?: string;
}

/**
 * أنواع الحسابات والأدوار المعتمدة في منصة كابتن جدة
 */
export type UserRole = 
  | 'player'         // لاعب كرة قدم (بطاقته، كوينز، فريقه، تقييمه)
  | 'captain'        // كابتن فريق / منظم (تكتيك، تحديات، حجز ملاعب، تقييم حكام)
  | 'pitch_owner'    // صاحب ملعب / منشأة (إدارة الملاعب، العربون، التراخيص)
  | 'academy_scout'  // أكاديمية / كشاف مواهب (محرك استكشاف المواهب، تجارب أداء)
  | 'referee';       // حكم مباريات (تكليفات المباريات، التراخيص، معايير التحكيم)

export interface CurrentUserProfile {
  role: UserRole;
  name: string;
  title: string;
  avatarUrl: string;
  badge: string;
  details: string;
}
