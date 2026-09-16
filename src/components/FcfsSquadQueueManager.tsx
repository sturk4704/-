import React, { useState, useEffect } from 'react';
import { Player, SquadFormat } from '../types';
import { TEAM_ROSTER_25, getRosterPlayer } from '../data/teamRoster';
import { subscribeToFcfsMatch, saveFcfsMatchToCloud } from '../services/firestoreService';
import {
  Users,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  BellRing,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Sliders,
  Calendar,
  Layers,
  ChevronDown,
  UserCheck,
  AlertTriangle,
  Play
} from 'lucide-react';

export interface FcfsNotification {
  id: string;
  timestamp: string;
  createdAt: number;
  title: string;
  body: string;
  type: 'promoted' | 'waitlisted' | 'confirmed' | 'apologized';
  recipientId: string;
  recipientName: string;
  isNew?: boolean;
}

interface FcfsSquadQueueManagerProps {
  players: Player[];
  currentFormat: SquadFormat;
  onApplyStartersToPitch: (starterIds: string[]) => void;
  onShowToast?: (message: string) => void;
  currentUserRole?: string;
  onNavigateToPitch?: () => void;
}

const STORAGE_KEY = 'captain_jeddah_fcfs_squad_state_v1';

export const FcfsSquadQueueManager: React.FC<FcfsSquadQueueManagerProps> = ({
  players,
  currentFormat,
  onApplyStartersToPitch,
  onShowToast,
  currentUserRole = 'captain',
  onNavigateToPitch,
}) => {
  // 1. تفعيل نظام أولوية الحضور من قبل الكابتن
  const [isFcfsActive, setIsFcfsActive] = useState<boolean>(true);
  const [matchFormat, setMatchFormat] = useState<SquadFormat>(currentFormat || '9v9');
  const [matchTitle, setMatchTitle] = useState('مباراة تقسيمة داخلية بين لاعبي الفريق (9 ضد 9)');
  const [startersLimit, setStartersLimit] = useState<number>(18);

  // 2. قوائم اللاعبين
  const [confirmedStarters, setConfirmedStarters] = useState<
    Array<{ id: string; registeredAt: string; queueNumber: number }>
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.confirmedStarters) return parsed.confirmedStarters;
      }
    } catch {
      // fallback
    }
    // تهيئة افتراضية: أول 18 لاعباً أساسيون بالأسبقية
    return [
      { id: 'player-1', registeredAt: '06:00 م', queueNumber: 1 },
      { id: 'player-2', registeredAt: '06:02 م', queueNumber: 2 },
      { id: 'player-3', registeredAt: '06:05 م', queueNumber: 3 },
      { id: 'player-4', registeredAt: '06:08 م', queueNumber: 4 },
      { id: 'player-5', registeredAt: '06:10 م', queueNumber: 5 },
      { id: 'player-6', registeredAt: '06:12 م', queueNumber: 6 },
      { id: 'player-7', registeredAt: '06:15 م', queueNumber: 7 },
      { id: 'player-8', registeredAt: '06:17 م', queueNumber: 8 },
      { id: 'player-9', registeredAt: '06:20 م', queueNumber: 9 },
      { id: 'player-10', registeredAt: '06:22 م', queueNumber: 10 },
      { id: 'player-11', registeredAt: '06:25 م', queueNumber: 11 },
      { id: 'player-12', registeredAt: '06:27 م', queueNumber: 12 },
      { id: 'player-13', registeredAt: '06:30 م', queueNumber: 13 },
      { id: 'player-14', registeredAt: '06:32 م', queueNumber: 14 },
      { id: 'player-15', registeredAt: '06:35 م', queueNumber: 15 },
      { id: 'player-16', registeredAt: '06:37 م', queueNumber: 16 },
      { id: 'player-17', registeredAt: '06:40 م', queueNumber: 17 },
      { id: 'player-18', registeredAt: '06:42 م', queueNumber: 18 },
    ];
  });

  const [waitingList, setWaitingList] = useState<
    Array<{ id: string; registeredAt: string; queueNumber: number }>
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.waitingList) return parsed.waitingList;
      }
    } catch {
      // fallback
    }
    // اللاعبون الذين سجلوا بعد اكتمال الـ 18 لاعباً
    return [
      { id: 'player-19', registeredAt: '06:45 م', queueNumber: 1 },
      { id: 'player-20', registeredAt: '06:50 م', queueNumber: 2 },
      { id: 'player-21', registeredAt: '06:55 م', queueNumber: 3 },
    ];
  });

  const [declinedPlayers, setDeclinedPlayers] = useState<
    Array<{ id: string; apologizedAt: string }>
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.declinedPlayers) return parsed.declinedPlayers;
      }
    } catch {
      // fallback
    }
    return [{ id: 'player-22', apologizedAt: '06:14 م' }];
  });

  // 3. سجل الإشعارات الفورية
  const [notifications, setNotifications] = useState<FcfsNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.notifications) return parsed.notifications;
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'notif-init-1',
        timestamp: 'منذ 15 دقيقة',
        createdAt: Date.now() - 900000,
        title: '⏳ دخول قائمة الانتظار',
        body: 'اكتمل نصاب الـ 18 لاعباً أساسياً. تم تسجيلك يا كابتن [عبدالمجيد السواط] في قائمة الانتظار بالترتيب (#1). ستدخل التشكيلة تلقائياً فور اعتذار أي لاعب!',
        type: 'waitlisted',
        recipientId: 'player-19',
        recipientName: 'عبدالمجيد السواط',
      },
      {
        id: 'notif-init-2',
        timestamp: 'منذ ساعة',
        createdAt: Date.now() - 3600000,
        title: '✓ تأكيد الحضور في التشكيلة الأساسية',
        body: 'تم تسجيل حضورك بنجاح في تشكيلة الكابتن للتقسيمة الداخلية 9x9 (الترتيب: #1 بأسبقية الوصول).',
        type: 'confirmed',
        recipientId: 'player-1',
        recipientName: 'عمر باوزير (الكابتن)',
      },
    ];
  });

  // 4. اللاعب النشط حالياً في الواجهة لاختبار التسجيل الذاتي
  const [activePlayerId, setActivePlayerId] = useState<string>('player-19');

  // تبويب العرض الداخلي
  const [innerTab, setInnerTab] = useState<'starters' | 'waitlist' | 'notifications' | 'declined'>('starters');

  // تنبيه فوري مرئي مباشر عند ترقية لاعب من الانتظار
  const [latestPromotionAlert, setLatestPromotionAlert] = useState<{
    promotedName: string;
    apologizedName: string;
    timestamp: string;
  } | null>(null);

  // اشتراك حي سحابي في قاعدة بيانات Firestore لحالة التشكيلة وقائمة الانتظار
  useEffect(() => {
    const unsub = subscribeToFcfsMatch('main_squad_match', (cloudData) => {
      if (cloudData) {
        setIsFcfsActive(cloudData.isFcfsActive);
        setMatchFormat(cloudData.matchFormat);
        setStartersLimit(cloudData.startersLimit);
        if (cloudData.confirmedStarters) setConfirmedStarters(cloudData.confirmedStarters);
        if (cloudData.waitingList) setWaitingList(cloudData.waitingList);
        if (cloudData.declinedPlayers) setDeclinedPlayers(cloudData.declinedPlayers);
        if (cloudData.notifications && cloudData.notifications.length > 0) {
          setNotifications(cloudData.notifications);
        }
      }
    });
    return () => unsub();
  }, []);

  // حفظ الحالة محلياً وسحابياً في Firestore عند أي تغيير
  useEffect(() => {
    try {
      const payload = {
        isFcfsActive,
        confirmedStarters,
        waitingList,
        declinedPlayers,
        notifications,
        matchFormat,
        startersLimit,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      saveFcfsMatchToCloud({
        id: 'main_squad_match',
        matchTitle: 'تقسيمة الكابتن الداخلية (أسبقية الوصول)',
        ...payload,
      });
    } catch {
      // ignore
    }
  }, [isFcfsActive, confirmedStarters, waitingList, declinedPlayers, notifications, matchFormat, startersLimit]);

  // المساعدة في جلب بيانات اللاعب
  const resolvePlayer = (id: string) => {
    const fromRoster = getRosterPlayer(id);
    if (fromRoster) return fromRoster;
    const fromProps = players.find((p) => p.id === id);
    if (fromProps) {
      return {
        id: fromProps.id,
        name: fromProps.name,
        number: fromProps.number || 10,
        position: fromProps.position,
        role: 'player' as const,
        avatarUrl: fromProps.avatarUrl,
        overall: fromProps.overall,
        attendanceScore: 90,
      };
    }
    return {
      id,
      name: `لاعب ${id}`,
      number: 10,
      position: 'MID',
      role: 'player' as const,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      overall: 78,
      attendanceScore: 85,
    };
  };

  // تغيير نظام التشكيلة وتحديث عدد الأساسيين المطلوبين تلقائياً
  const handleFormatChange = (fmt: SquadFormat) => {
    setMatchFormat(fmt);
    let base = 9;
    if (fmt === '5v5') base = 5;
    else if (fmt === '6v6') base = 6;
    else if (fmt === '7v7') base = 7;
    else if (fmt === '8v8') base = 8;
    else if (fmt === '9v9') base = 9;
    else if (fmt === '10v10') base = 10;
    else if (fmt === '11v11') base = 11;
    const total = base * 2; // فريقين داخلين
    setStartersLimit(total);
    setMatchTitle(`مباراة تقسيمة داخلية بين لاعبي الفريق (${fmt})`);
    if (onShowToast) {
      onShowToast(`تم ضبط نظام المباراة إلى ${fmt} (${total} لاعباً أساسياً مطلوباً)`);
    }
  };

  // إضافة إشعار جديد في السجل وبث رسالة
  const pushNotification = (
    recipientId: string,
    recipientName: string,
    title: string,
    body: string,
    type: 'promoted' | 'waitlisted' | 'confirmed' | 'apologized'
  ) => {
    const newNotif: FcfsNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: 'الآن',
      createdAt: Date.now(),
      title,
      body,
      type,
      recipientId,
      recipientName,
      isNew: true,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // 1. تسجيل اللاعب لنفسه في القائمة (Self-Registration)
  const handlePlayerSelfRegister = (targetPlayerId: string) => {
    if (!isFcfsActive) {
      if (onShowToast) onShowToast('نظام أولوية الحضور غير مفعّل حالياً من قبل الكابتن');
      return;
    }

    const playerObj = resolvePlayer(targetPlayerId);

    // التحقق هل هو مسجل بالفعل
    const isAlreadyStarter = confirmedStarters.some((s) => s.id === targetPlayerId);
    if (isAlreadyStarter) {
      if (onShowToast) onShowToast(`اللاعب [${playerObj.name}] مسجل بالفعل في التشكيلة الأساسية!`);
      return;
    }

    const isAlreadyWaiting = waitingList.some((w) => w.id === targetPlayerId);
    if (isAlreadyWaiting) {
      if (onShowToast) onShowToast(`اللاعب [${playerObj.name}] موجود بالفعل في قائمة الانتظار!`);
      return;
    }

    // إزالة اللاعب من قائمة المعتذرين إن وُجد
    setDeclinedPlayers((prev) => prev.filter((d) => d.id !== targetPlayerId));

    const nowTime = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    // إذا كان هناك شاغر في الأساسيين (< startersLimit)
    if (confirmedStarters.length < startersLimit) {
      const newQueueNumber = confirmedStarters.length + 1;
      setConfirmedStarters((prev) => [
        ...prev,
        { id: targetPlayerId, registeredAt: nowTime, queueNumber: newQueueNumber },
      ]);

      const title = '✓ تم الانضمام للتشكيلة الأساسية';
      const body = `مرحباً [ ${playerObj.name} ]! تم تثبيت حضورك بنجاح في التشكيلة الأساسية (الترتيب: #${newQueueNumber}) بأسبقية التسجيل والنزاهة!`;
      pushNotification(targetPlayerId, playerObj.name, title, body, 'confirmed');

      if (onShowToast) onShowToast(`تم تثبيت حضورك في التشكيلة الأساسية المعتمدة (#${newQueueNumber}) بنجاح!`);
    } else {
      // اكتمل النصاب -> يذهب لقائمة الانتظار بالأسبقية
      const waitlistOrder = waitingList.length + 1;
      setWaitingList((prev) => [
        ...prev,
        { id: targetPlayerId, registeredAt: nowTime, queueNumber: waitlistOrder },
      ]);

      const title = '⏳ إدراج في قائمة الانتظار (أولوية الوصول)';
      const body = `اكتمل نصاب الأساسيين (${startersLimit} لاعباً). تم إدراجك يا كابتن [ ${playerObj.name} ] في قائمة الانتظار بترتيب (#${waitlistOrder}). في حال اعتذر أي لاعب أساسي، ستدخل التشكيلة تلقائياً وفوراً!`;
      pushNotification(targetPlayerId, playerObj.name, title, body, 'waitlisted');

      if (onShowToast) onShowToast(`اكتمل نصاب الـ ${startersLimit} أساسياً. تم إدراجك في قائمة الانتظار (#${waitlistOrder})!`);
    }
  };

  // 2. تسجيل اعتذار لاعب أو استبعاده مع الترقية التلقائية الفورية (Automatic FIFO Promotion)
  const handlePlayerApology = (targetPlayerId: string) => {
    const playerObj = resolvePlayer(targetPlayerId);
    const nowTime = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    // التحقق هل اللاعب في الأساسيين
    const isStarter = confirmedStarters.some((s) => s.id === targetPlayerId);

    if (isStarter) {
      // إزالة من الأساسيين
      const remainingStarters = confirmedStarters.filter((s) => s.id !== targetPlayerId);

      // تسجيله كمعتذر
      setDeclinedPlayers((prev) => [{ id: targetPlayerId, apologizedAt: nowTime }, ...prev]);

      // هل يوجد لاعبون في قائمة الانتظار؟
      if (waitingList.length > 0) {
        // أخذ أول لاعب في قائمة الانتظار (صاحب الترتيب #1)
        const promotedItem = waitingList[0];
        const nextWaitingList = waitingList.slice(1).map((item, idx) => ({
          ...item,
          queueNumber: idx + 1, // تحديث الترتيب (رقم 2 يصبح رقم 1)
        }));

        const promotedPlayer = resolvePlayer(promotedItem.id);

        // إضافة اللاعب المصعد للأساسيين مكان المعتذر
        const updatedStarters = [
          ...remainingStarters,
          {
            id: promotedItem.id,
            registeredAt: `تم التصعيد الآن (${nowTime})`,
            queueNumber: remainingStarters.length + 1,
          },
        ];

        setConfirmedStarters(updatedStarters);
        setWaitingList(nextWaitingList);

        // إرسال إشعار فوري للاعب المصعد
        const title = '🎉 مبروك! ترقية تلقائية للتشكيلة الأساسية';
        const body = `🚨 إشعار فوري للانتظار: اعتذر اللاعب [ ${playerObj.name} ]، وبموجب نظام النزاهة التلقائي (FIFO) تم تصعيدك يا كابتن [ ${promotedPlayer.name} ] فوراً من قائمة الانتظار إلى التشكيلة الأساسية المعتمدة! 🏃‍♂️⚡`;
        pushNotification(promotedItem.id, promotedPlayer.name, title, body, 'promoted');

        setLatestPromotionAlert({
          promotedName: promotedPlayer.name,
          apologizedName: playerObj.name,
          timestamp: nowTime,
        });

        if (onShowToast) {
          onShowToast(`⚡ تم تصعيد [${promotedPlayer.name}] تلقائياً من الانتظار إلى التشكيلة الأساسية بعد اعتذار [${playerObj.name}]!`);
        }
      } else {
        // لا يوجد أحد في الانتظار
        setConfirmedStarters(remainingStarters);
        if (onShowToast) onShowToast(`تم تسجيل اعتذار [${playerObj.name}] وشغر مركز في التشكيلة الأساسية`);
      }
    } else {
      // إذا كان في قائمة الانتظار
      const isWaiting = waitingList.some((w) => w.id === targetPlayerId);
      if (isWaiting) {
        const nextWaiting = waitingList
          .filter((w) => w.id !== targetPlayerId)
          .map((item, idx) => ({ ...item, queueNumber: idx + 1 }));
        setWaitingList(nextWaiting);
        setDeclinedPlayers((prev) => [{ id: targetPlayerId, apologizedAt: nowTime }, ...prev]);
        if (onShowToast) onShowToast(`تم إلغاء تسجيل [${playerObj.name}] من قائمة الانتظار`);
      }
    }
  };

  // 3. تطبيق التشكيلة الأساسية على الملعب التكتيكي
  const handleApplyToPitch = () => {
    const starterIds = confirmedStarters.map((s) => s.id);
    onApplyStartersToPitch(starterIds);
    if (onShowToast) {
      onShowToast(`تم نقل ${starterIds.length} لاعباً أساسياً إلى خانات الملعب التكتيكي بنجاح!`);
    }
    if (onNavigateToPitch) {
      onNavigateToPitch();
    }
  };

  // حالة اللاعب النشط في التسجيل
  const isCurrentActiveStarter = confirmedStarters.some((s) => s.id === activePlayerId);
  const activeStarterRank = confirmedStarters.findIndex((s) => s.id === activePlayerId) + 1;
  const isCurrentActiveWaiting = waitingList.some((w) => w.id === activePlayerId);
  const activeWaitRank = waitingList.findIndex((w) => w.id === activePlayerId) + 1;
  const activePlayerObj = resolvePlayer(activePlayerId);

  return (
    <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-5 md:p-7 space-y-6 shadow-2xl">
      {/* تنبيه الترقية الفورية المباشرة */}
      {latestPromotionAlert && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-[#08090d] border-2 border-emerald-400/70 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-400 text-slate-950">
                  ⚡ ترقية أوتوماتيكية فورية (FIFO)
                </span>
                <span className="text-[11px] text-emerald-300/80 font-mono">
                  {latestPromotionAlert.timestamp}
                </span>
              </div>
              <p className="text-xs md:text-sm font-bold text-white mt-1">
                اعتذر اللاعب <span className="text-rose-300 font-black underline">[{latestPromotionAlert.apologizedName}]</span>، وقام النظام تلقائياً وبنزاهة تامة بتصعيد اللاعب <span className="text-emerald-300 font-black underline">[{latestPromotionAlert.promotedName}]</span> من قائمة الانتظار (#1) إلى التشكيلة الأساسية المعتمدة! 🏃‍♂️⚽
              </p>
            </div>
          </div>
          <button
            onClick={() => setLatestPromotionAlert(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-black/40 border border-white/10 shrink-0"
          >
            إغلاق ✕
          </button>
        </div>
      )}

      {/* 1. Header & Captain Controls */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1c222e] pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#f5d77f]">
              <Zap className="w-5 h-5 text-[#f5d77f]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black font-['Changa',sans-serif] text-white">
                  نظام أولوية الحضور وقائمة الانتظار (FCFS)
                </h3>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isFcfsActive
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isFcfsActive ? 'مفعّل بنزاهة تامة ✓' : 'معطل'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                إدارة أسبقية الحضور التلقائية: يسجل اللاعبون أنفسهم، وتتم الترقية الأوتوماتيكية الفورية للانتظار عند أي اعتذار.
              </p>
            </div>
          </div>
        </div>

        {/* زر تفعيل/إلغاء التفعيل من الكابتن وتطبيق الملعب */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setIsFcfsActive(!isFcfsActive);
              if (onShowToast) {
                onShowToast(
                  !isFcfsActive
                    ? 'تم تفعيل نظام أولوية الحضور (FCFS) للمباراة الداخلية'
                    : 'تم إيقاف نظام أولوية الحضور مؤقتاً'
                );
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
              isFcfsActive
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
                : 'bg-[#181d28] text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{isFcfsActive ? 'نظام النزاهة شغال' : 'تفعيل النظام للمباراة'}</span>
          </button>

          <button
            onClick={handleApplyToPitch}
            className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md hover:scale-[1.02] transition"
          >
            <Layers className="w-4 h-4" />
            <span>تطبيق الأساسيين على الملعب التكتيكي ({confirmedStarters.length})</span>
          </button>
        </div>
      </div>

      {/* 2. إعدادات المباراة الداخلية للكابتن */}
      <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* نظام التشكيلة */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold block">نظام المباراة الداخلية:</label>
          <select
            value={matchFormat}
            onChange={(e) => handleFormatChange(e.target.value as SquadFormat)}
            className="w-full bg-[#11141b] border border-[#222735] text-[#f5d77f] font-bold rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
          >
            <option value="5v5">5 ضد 5 (10 لاعبين أساسيين)</option>
            <option value="6v6">6 ضد 6 (12 لاعباً أساسياً)</option>
            <option value="7v7">7 ضد 7 (14 لاعباً أساسياً)</option>
            <option value="8v8">8 ضد 8 (16 لاعباً أساسياً)</option>
            <option value="9v9">9 ضد 9 (18 لاعباً أساسياً - المعتمد)</option>
            <option value="10v10">10 ضد 10 (20 لاعباً أساسياً)</option>
            <option value="11v11">11 ضد 11 (22 لاعباً أساسياً)</option>
          </select>
        </div>

        {/* الحد الأقصى للأساسيين */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold block">نصاب الأساسيين المطلوب:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={2}
              max={30}
              value={startersLimit}
              onChange={(e) => setStartersLimit(Number(e.target.value))}
              className="w-full bg-[#11141b] border border-[#222735] text-emerald-400 font-mono font-black text-center rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
            />
            <span className="text-slate-500 text-[11px] shrink-0">لاعباً</span>
          </div>
        </div>

        {/* حالة اكتمال النصاب */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold block">حالة المقاعد الأساسية:</label>
          <div className="bg-[#11141b] border border-[#222735] rounded-xl px-3 py-2 flex items-center justify-between font-mono">
            <span className="text-white font-black">
              {confirmedStarters.length} / {startersLimit}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                confirmedStarters.length >= startersLimit
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {confirmedStarters.length >= startersLimit ? 'مكتمل بالكامل' : `باقي ${startersLimit - confirmedStarters.length}`}
            </span>
          </div>
        </div>

        {/* عداد قائمة الانتظار */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold block">المسجلون في الانتظار:</label>
          <div className="bg-[#11141b] border border-amber-500/30 rounded-xl px-3 py-2 flex items-center justify-between font-mono">
            <span className="text-amber-400 font-black text-sm">
              {waitingList.length > 0 ? `+${waitingList.length} لاعبين` : '0 في الانتظار'}
            </span>
            <span className="text-[10px] text-amber-300/80 font-sans font-bold">
              {waitingList.length > 0 ? 'ترقية فورية جاهزة ⚡' : 'شاغر مفتوح'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. نافذة التسجيل الذاتي للاعبين (بحيث يضيف اللاعبون أنفسهم للقائمة) */}
      <div className="bg-gradient-to-r from-[#171c26] via-[#11141b] to-[#0d1017] p-4 md:p-5 rounded-2xl border border-[#d4af37]/35 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#f5d77f]" />
            <div>
              <h4 className="text-xs md:text-sm font-black text-white">
                بوابة تسجيل اللاعب الذاتية (Self-Registration)
              </h4>
              <p className="text-[11px] text-slate-400">
                اختر اسمك من قائمة لاعبي الفريق الـ 25 وسجل حضورك بنظام الأسبقية والنزاهة
              </p>
            </div>
          </div>

          {/* تبديل اللاعب النشط للاختبار */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">اللاعب الحالي:</span>
            <select
              value={activePlayerId}
              onChange={(e) => setActivePlayerId(e.target.value)}
              className="bg-[#08090d] border border-[#222735] text-white text-xs rounded-xl px-3 py-1.5 focus:border-[#d4af37] focus:outline-none"
            >
              {TEAM_ROSTER_25.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.position}) - رقم {p.number}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* بطاقة حالة اللاعب الحالي وأزرار الإجراء */}
        <div className="bg-[#08090d] p-3.5 rounded-xl border border-[#222735] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={activePlayerObj.avatarUrl}
              alt={activePlayerObj.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-[#d4af37]/50"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">{activePlayerObj.name}</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#182030] text-[#f5d77f]">
                  {activePlayerObj.position} #{activePlayerObj.number}
                </span>
              </div>

              {/* بيان حالة اللاعب الحالية */}
              <div className="text-xs mt-0.5">
                {isCurrentActiveStarter ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>أنت في التشكيلة الأساسية المعتمدة (الترتيب: #{activeStarterRank})</span>
                  </span>
                ) : isCurrentActiveWaiting ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    <span>أنت في قائمة الانتظار (الترتيب: #{activeWaitRank}) - تصعد فوراً عند أي اعتذار!</span>
                  </span>
                ) : (
                  <span className="text-slate-400">
                    لم تقم بتسجيل حضورك في هذه المباراة بعد.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* أزرار التسجيل والاعتذار */}
          <div className="flex items-center gap-2">
            {!isCurrentActiveStarter && !isCurrentActiveWaiting ? (
              <button
                onClick={() => handlePlayerSelfRegister(activePlayerId)}
                className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تسجيل حضوري (أولوية FCFS) ⚽</span>
              </button>
            ) : (
              <button
                onClick={() => handlePlayerApology(activePlayerId)}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>تسجيل اعتذار / انسحاب (تصعيد الانتظار)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. تبويبات العرض (الأساسيون / قائمة الانتظار / الإشعارات الفورية / المعتذرون) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#1c222e] pb-2 text-xs flex-wrap">
          <button
            onClick={() => setInnerTab('starters')}
            className={`pb-2 px-3 font-bold flex items-center gap-2 border-b-2 transition ${
              innerTab === 'starters'
                ? 'border-[#d4af37] text-white font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4 text-[#f5d77f]" />
            <span>الأساسيون المعتمدون ({confirmedStarters.length}/{startersLimit})</span>
          </button>

          <button
            onClick={() => setInnerTab('waitlist')}
            className={`pb-2 px-3 font-bold flex items-center gap-2 border-b-2 transition ${
              innerTab === 'waitlist'
                ? 'border-amber-400 text-amber-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>قائمة الانتظار والترقية ({waitingList.length})</span>
            {waitingList.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setInnerTab('notifications')}
            className={`pb-2 px-3 font-bold flex items-center gap-2 border-b-2 transition ${
              innerTab === 'notifications'
                ? 'border-blue-400 text-blue-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BellRing className="w-4 h-4 text-blue-400" />
            <span>سجل الإشعارات الفورية ({notifications.length})</span>
          </button>

          <button
            onClick={() => setInnerTab('declined')}
            className={`pb-2 px-3 font-bold flex items-center gap-2 border-b-2 transition ${
              innerTab === 'declined'
                ? 'border-rose-400 text-rose-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>المعتذرون ({declinedPlayers.length})</span>
          </button>
        </div>

        {/* محتوى تبويب الأساسيين */}
        {innerTab === 'starters' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>ترتيب أسبقية التسجيل والنزاهة (أول من حضر):</span>
              <span className="text-emerald-400 font-bold">
                {confirmedStarters.length >= startersLimit
                  ? '✓ اكتمل نصاب التشكيلة بالكامل'
                  : `متبقي ${startersLimit - confirmedStarters.length} مقاعد شاغرة`}
              </span>
            </div>

            {confirmedStarters.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">لا يوجد لاعبون مسجلون بعد. سجل حضورك الآن!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {confirmedStarters.map((item, index) => {
                  const p = resolvePlayer(item.id);
                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-2xl bg-[#08090d] border border-[#222735] hover:border-[#d4af37]/40 transition flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-xs font-black w-6 h-6 rounded-full bg-[#182030] text-[#f5d77f] border border-[#d4af37]/30 flex items-center justify-center shrink-0">
                          #{index + 1}
                        </span>
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#222735] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span className="text-[#f5d77f] font-mono">{p.position}</span>
                            <span>• {item.registeredAt}</span>
                          </p>
                        </div>
                      </div>

                      {/* زر اعتذار لمحاكاة الترقية التلقائية الفورية */}
                      <button
                        onClick={() => handlePlayerApology(item.id)}
                        className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-[10px] font-bold border border-rose-500/30 transition shrink-0"
                        title="تسجيل اعتذار وترقية أول لاعب في الانتظار فوراً"
                      >
                        اعتذار ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* محتوى تبويب قائمة الانتظار والترقية */}
        {innerTab === 'waitlist' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-black text-amber-300">آلية عمل النزاهة التلقائية: </strong>
                اللاعبون في هذا التبويب مرتبون زمنياً بدقة حسب لحظة تسجيلهم بعد اكتمال النصاب.
                عند اعتذار أي لاعب أساسي، يقوم النظام فوراً ودون أي تدخل بنقل صاحب <strong>الترتيب #1</strong> إلى التشكيلة الأساسية وإرسال إشعار فوري له.
              </div>
            </div>

            {waitingList.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                لا يوجد لاعبون في قائمة الانتظار حالياً. عندما يكتمل نصاب الـ {startersLimit} لاعباً، سينتقل المسجلون اللاحقون إلى هنا تلقائياً.
              </p>
            ) : (
              <div className="space-y-2">
                {waitingList.map((item, index) => {
                  const p = resolvePlayer(item.id);
                  const isFirstInLine = index === 0;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isFirstInLine
                          ? 'bg-amber-500/15 border-amber-500/50 shadow-lg'
                          : 'bg-[#08090d] border-[#222735]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full font-mono text-xs font-black flex items-center justify-center ${
                            isFirstInLine
                              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          #{index + 1}
                        </span>
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#222735]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{p.name}</span>
                            {isFirstInLine && (
                              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                                <Zap className="w-3 h-3" />
                                <span>الأولوية الأولى للصعود</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            مركز {p.position} • سُجل في {item.registeredAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            isFirstInLine
                              ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 animate-pulse'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {isFirstInLine ? 'يصعد فوراً عند أي اعتذار ⚡' : `انتظار دور #${index + 1}`}
                        </span>

                        <button
                          onClick={() => handlePlayerApology(item.id)}
                          className="text-[10px] text-slate-500 hover:text-rose-400 p-1"
                          title="انسحاب من الانتظار"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* محتوى تبويب سجل الإشعارات الفورية */}
        {innerTab === 'notifications' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>سجل التنبيهات المباشرة المرسلة للاعبين:</span>
              <button
                onClick={() => setNotifications([])}
                className="text-slate-500 hover:text-slate-300 text-[11px]"
              >
                مسح السجل
              </button>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">لا توجد إشعارات مسجلة حتى الآن.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                      notif.type === 'promoted'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                        : notif.type === 'waitlisted'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                        : 'bg-[#08090d] border-[#222735] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm flex items-center gap-1.5 text-white">
                        <BellRing className="w-3.5 h-3.5 text-[#f5d77f]" />
                        <span>{notif.title}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300">{notif.body}</p>
                    <div className="text-[10px] text-slate-400 font-bold">
                      المستلم: <span className="text-[#f5d77f]">{notif.recipientName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* محتوى تبويب المعتذرين */}
        {innerTab === 'declined' && (
          <div className="space-y-3">
            {declinedPlayers.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">لا يوجد لاعبين معتذرين عن هذه التقسيمة.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {declinedPlayers.map((item) => {
                  const p = resolvePlayer(item.id);
                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-2xl bg-[#08090d] border border-rose-500/30 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-8 h-8 rounded-full object-cover grayscale opacity-70"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-300 line-through">{p.name}</p>
                          <p className="text-[10px] text-rose-400 font-mono">اعتذر في {item.apologizedAt}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePlayerSelfRegister(item.id)}
                        className="px-2 py-1 rounded-lg bg-[#161a23] hover:bg-[#202634] text-[#f5d77f] text-[10px] font-bold border border-[#222735]"
                      >
                        إعادة تسجيل ↩
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
