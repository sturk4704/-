import { TeamChatMessage, TeamDiaryEntry } from '../types';

export const INITIAL_DIARY_ENTRIES: TeamDiaryEntry[] = [
  {
    id: 'diary-1',
    teamId: 'rawdah_stars',
    title: 'تمرين الإعداد البدني والكرات العرضية',
    category: 'training',
    date: '14 سبتمبر 2026',
    authorName: 'الكابتن عمر باوزير',
    authorRole: 'كابتن الفريق ومدرب التكتيك',
    location: 'ملعب النجوم الذهبي - حي الروضة',
    attendanceRate: 92,
    pinned: true,
    content: 'تم التركيز في تدريب اليوم على التحول السريع من الدفاع إلى الهجوم، مع تدريب المهاجمين على استغلال الكرات العرضية من الأطراف. أظهر جميع اللاعبين التزاماً عالياً وحضوراً في الموعد المحدد.',
    highlights: [
      'حضور 12 لاعباً من أصل 14 مع تسجيل انضباط ممتاز',
      'تألق مميز للاعب الجناح في التمريرات العرضية المتقنة',
      'تطبيق خطة الضغط المتقدم 3-2-2 في التقسيمة المصغرة'
    ]
  },
  {
    id: 'diary-2',
    teamId: 'rawdah_stars',
    title: 'فوز مستحق في ودية دربي الأحياء ضد صقور الصفا',
    category: 'match_review',
    date: '10 سبتمبر 2026',
    authorName: 'خالد السعيد',
    authorRole: 'نائب الكابتن ومحلل الأداء',
    location: 'ملعب الفهد الرياضي - حي الصفا',
    opponent: 'صقور الصفا',
    score: '4 - 2',
    attendanceRate: 100,
    highlights: [
      'تسجيل هاتريك من مهاجم الفريق بالقدم اليمنى واليسرى',
      'نسبة دقة التمرير في خط الوسط تجاوزت 84%',
      'تم اعتماد تقييم أعمى إيجابي لجميع المشاركين بمتوسط 8.6/10'
    ],
    content: 'مباراة حماسية جداً امتدت 70 دقيقة. تقدمنا بهدفين مبكرين قبل عودة الخصم، ولكن تنظيم خط الوسط والهدوء في الثلث الأخير حسم النتيجة لصالحنا. الحكم الودي الداخلي قاد اللقاء بكفاءة واحترافية.'
  },
  {
    id: 'diary-3',
    teamId: 'rawdah_stars',
    title: 'توجيهات الكابتن التكتيكية لمباراة الخميس القادمة',
    category: 'tactical_note',
    date: '8 سبتمبر 2026',
    authorName: 'الكابتن عمر باوزير',
    authorRole: 'كابتن الفريق',
    location: 'مركز التدريب الداخلي',
    attendanceRate: 88,
    highlights: [
      'اللعب بنظام 7 ضد 7 متوازن (2 مدافعين - 3 وسط - 1 مهاجم)',
      'الاعتماد على التمريرات القصيرة لكسر تكتل دفاع الخصم',
      'التأكيد على تسديد رسوم الملعب بالمناصفة عبر المنصة قبل 24 ساعة'
    ],
    content: 'نرجو من جميع اللاعبين تثبيت حضورهم عبر استطلاع الموعد في الدردشة الفورية. نحتاج التزاماً صارماً بالتمركز الدفاعي عند فقدان الكرة وتجنب التمريرات الطولية غير المضمونة.'
  }
];

export const INITIAL_CHAT_MESSAGES: TeamChatMessage[] = [
  {
    id: 'msg-system-welcome',
    teamId: 'rawdah_stars',
    channel: 'scheduling',
    senderId: 'system',
    senderName: 'نظام كابتن جدة المباشر',
    senderRole: 'captain',
    senderPosition: 'BOT',
    senderAvatar: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120&auto=format&fit=crop&q=80',
    text: 'مرحباً بكم في غرفة التواصل المباشر لفريق [نجوم الروضة بجدة]. استخدموا هذه النافذة للتنسيق الفوري لمواعيد المباريات، استطلاع الجاهزية، ومناقشة الخطط.',
    timestamp: 'منذ ساعتين',
    createdAt: Date.now() - 7200000,
    type: 'system_announcement'
  },
  {
    id: 'msg-poll-match',
    teamId: 'rawdah_stars',
    channel: 'scheduling',
    senderId: 'player-1',
    senderName: 'عمر باوزير (الكابتن)',
    senderRole: 'captain',
    senderPosition: 'CAM',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    text: 'يا أبطال، حجزت لنا موعد ودية حماسية 8 ضد 8 بملعب الفهد بحي الروضة. نبي نأكد العدد بالكامل قبل ما نسدد العربون المشترك!',
    timestamp: 'منذ ساعة',
    createdAt: Date.now() - 3600000,
    type: 'schedule_poll',
    pollData: {
      matchType: 'friendly_rival',
      eventTitle: 'مباراة ودية رسمية ضد نمور الكورنيش (8x8)',
      date: 'الخميس 17 سبتمبر 2026',
      time: '09:00 مساءً - 10:30 مساءً',
      pitchName: 'ملعب الفهد الرياضي المعتمد',
      neighborhood: 'حي الروضة، جدة',
      format: '8x8',
      requiredPlayers: 8,
      confirmedPlayerIds: ['player-1', 'player-2', 'player-3', 'player-4', 'player-5'],
      waitingListPlayerIds: [],
      declinedPlayerIds: [],
      tentativePlayerIds: ['player-6']
    },
    reactions: {
      '🔥': ['player-1', 'player-2', 'player-3'],
      '⚽': ['player-1', 'player-4']
    }
  },
  {
    id: 'msg-poll-internal-scrimmage',
    teamId: 'rawdah_stars',
    channel: 'scheduling',
    senderId: 'player-1',
    senderName: 'عمر باوزير (الكابتن)',
    senderRole: 'captain',
    senderPosition: 'CAM',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    text: 'يا كباتن، قررنا نعمل مباراة تقسيمة داخلية حماسية بين لاعبي الفريق (9 ضد 9). نحتاج 18 لاعباً أساسياً من إجمالي لاعبي الفريق الـ 25.\n\n⚖️ نظام النزاهة التلقائي (الأولوية لمن حضر وسجل أولاً):\n• أول 18 لاعباً يؤكدون حضورهم يدخلون التشكيلة الأساسية تلقائياً.\n• اللاعبون اللاحقون يدخلون قائمة الانتظار بالترتيب الزمني.\n• في حال اعتذر أي لاعب أساسي، النظام أوتوماتيك يشرك أول لاعب في الانتظار ويرسل له إشعار فوري بدخوله تشكيلة الكابتن!',
    timestamp: 'منذ 30 دقيقة',
    createdAt: Date.now() - 1800000,
    type: 'schedule_poll',
    pollData: {
      matchType: 'internal_scrimmage',
      eventTitle: 'تقسيمة داخلية بين لاعبي الفريق (9 ضد 9 - 18 لاعباً مطلوباً)',
      date: 'الجمعة 18 سبتمبر 2026',
      time: '08:30 مساءً - 10:00 مساءً',
      pitchName: 'ملعب الكابتن الذهبي المعتمد',
      neighborhood: 'حي الصفا، جدة',
      format: '9x9',
      requiredPlayers: 18,
      // أول 18 لاعب أساسيون حسب أسبقية التسجيل والنزاهة
      confirmedPlayerIds: [
        'player-1', 'player-2', 'player-3', 'player-4', 'player-5',
        'player-6', 'player-7', 'player-8', 'player-9', 'player-10',
        'player-11', 'player-12', 'player-13', 'player-14', 'player-15',
        'player-16', 'player-17', 'player-18'
      ],
      // قائمة الانتظار: من سجلوا بعد اكتمال الـ 18 لاعباً (مرتبون بالأسبقية)
      waitingListPlayerIds: [
        'player-19', // عبدالمجيد السواط (انتظار #1)
        'player-20', // علي هزازي (انتظار #2)
        'player-21'  // سامي النجعي (انتظار #3)
      ],
      declinedPlayerIds: [],
      tentativePlayerIds: ['player-22'],
      teamADivision: [
        'player-1', 'player-3', 'player-5', 'player-7', 'player-9',
        'player-11', 'player-13', 'player-15', 'player-17'
      ],
      teamBDivision: [
        'player-2', 'player-4', 'player-6', 'player-8', 'player-10',
        'player-12', 'player-14', 'player-16', 'player-18'
      ]
    },
    reactions: {
      '⚽': ['player-1', 'player-2', 'player-3', 'player-4'],
      '🔥': ['player-1', 'player-5', 'player-19'],
      '👏': ['player-6', 'player-20']
    }
  },
  {
    id: 'msg-reply-1',
    teamId: 'rawdah_stars',
    channel: 'scheduling',
    senderId: 'player-2',
    senderName: 'طارق الحربي',
    senderRole: 'vice_captain',
    senderPosition: 'CB',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    text: 'أنا أكدت حضوري وجاهز بالكامل إن شاء الله! الدفاع مضمون والتسديد المشترك جاهز في المحفظة 👍',
    timestamp: 'منذ 45 دقيقة',
    createdAt: Date.now() - 2700000,
    type: 'text',
    reactions: {
      '👍': ['player-1', 'player-3']
    }
  },
  {
    id: 'msg-reply-2',
    teamId: 'rawdah_stars',
    channel: 'scheduling',
    senderId: 'player-3',
    senderName: 'سعود الشهري',
    senderRole: 'player',
    senderPosition: 'ST',
    senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    text: 'حاضر ومعاكم بإذن الله! باقي لنا لاعبين في الوسط عشان يكتمل نصاب التشكيلة الأساسية والاحتياط.',
    timestamp: 'منذ 25 دقيقة',
    createdAt: Date.now() - 1500000,
    type: 'text',
    reactions: {
      '⚽': ['player-1']
    }
  },
  {
    id: 'msg-general-1',
    teamId: 'rawdah_stars',
    channel: 'general',
    senderId: 'player-1',
    senderName: 'عمر باوزير (الكابتن)',
    senderRole: 'captain',
    senderPosition: 'CAM',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    text: 'يعطيكم العافية جميعاً، شفت إحصائيات آخر مباراة في لوحة التقييم، التطور في سرعة التحول والتمرير ملحوظ جداً، استمروا على هذا المستوى!',
    timestamp: 'منذ 15 دقيقة',
    createdAt: Date.now() - 900000,
    type: 'text',
    reactions: {
      '👏': ['player-2', 'player-3', 'player-4']
    }
  },
  {
    id: 'msg-tactics-1',
    teamId: 'rawdah_stars',
    channel: 'tactics',
    senderId: 'player-2',
    senderName: 'طارق الحربي',
    senderRole: 'vice_captain',
    senderPosition: 'CB',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    text: 'اقتراح لتكتيك الخميس: نلعب بضغط عالي في أول ربع ساعة مع استغلال سرعة الأجنحة لفتح مساحات خلف أظهرة الخصم.',
    timestamp: 'منذ 10 دقائق',
    createdAt: Date.now() - 600000,
    type: 'text',
    reactions: {
      '💡': ['player-1', 'player-3']
    }
  }
];
