import React, { useState, useRef, useEffect } from 'react';
import { Player, TeamDiaryEntry, ChatPollData, TeamChatChannel } from '../types';
import { INITIAL_DIARY_ENTRIES } from '../data/mockTeamDiary';
import { useTeamChat } from '../utils/useTeamChat';
import { CreateSchedulePollModal } from './CreateSchedulePollModal';
import { AddDiaryEntryModal } from './AddDiaryEntryModal';
import { MatchPollCard } from './MatchPollCard';
import { subscribeToTeamDiaryEntries, saveTeamDiaryEntryToCloud } from '../services/firestoreService';
import { 
  MessagesSquare, 
  BookOpenCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Send, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  Swords, 
  ShieldCheck, 
  Trophy, 
  Pin, 
  Flame, 
  Zap, 
  Radio, 
  MessageSquareQuote,
  ChevronRight,
  Smile,
  AlertCircle
} from 'lucide-react';

interface TeamDiarySectionProps {
  players: Player[];
  onShowToast: (message: string) => void;
}

const QUICK_PROMPTS = [
  'مين جاهز لودية الخميس القادم؟ نبي نأكد العدد! ⚽',
  'باقي لاعبين في الوسط ويكتمل نصاب التشكيلة! 🏃‍♂️',
  'الملعب تم اختياره: ملعب الفهد بالساعة 9 مساءً 📍',
  'الرجاء تأكيد الحضور ودفع العربون قبل الساعة 6 م ⏰'
];

const EMOJI_REACTIONS = ['⚽', '🔥', '👍', '👏', '💡'];

export const TeamDiarySection: React.FC<TeamDiarySectionProps> = ({
  players,
  onShowToast,
}) => {
  // تتبع هوية العضو المتحدث (افتراضياً كابتن الفريق أو التبديل للاعبين آخرين لاختبار المحادثة)
  const defaultPlayer = players[0] || {
    id: 'player-1',
    name: 'عمر باوزير (الكابتن)',
    position: 'CAM',
    overall: 82,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  };

  const [currentSenderId, setCurrentSenderId] = useState<string>(defaultPlayer.id);
  const activePlayer = players.find((p) => p.id === currentSenderId) || defaultPlayer;

  const currentSender = {
    id: activePlayer.id,
    name: activePlayer.name,
    role: (activePlayer.id === defaultPlayer.id ? 'captain' : 'player') as 'captain' | 'vice_captain' | 'player',
    position: activePlayer.position,
    avatar: activePlayer.avatarUrl,
  };

  // تبويب الواجهة: عرض الدردشة المباشرة أو يوميات وسجل الفريق
  const [viewMode, setViewMode] = useState<'all' | 'chat_only' | 'diary_only'>('all');

  // خطاف الدردشة المباشرة بتقنية WebSocket الحقيقية
  const {
    messages,
    channelMessages,
    activeChannel,
    setActiveChannel,
    isConnected,
    onlineUsers,
    sendMessage,
    votePoll,
    simulateStarterApology,
    simulateWaitlistJoin,
    toggleReaction,
  } = useTeamChat(currentSender);

  // حالة إدخال الرسالة
  const [inputText, setInputText] = useState('');

  // يوميات الفريق - مزامنة حية سحابية مع Firestore
  const [diaryEntries, setDiaryEntries] = useState<TeamDiaryEntry[]>(INITIAL_DIARY_ENTRIES);
  const [diaryFilter, setDiaryFilter] = useState<string>('all');

  // اشتراك حي في يوميات الفريق بقاعدة بيانات Firestore
  useEffect(() => {
    const unsub = subscribeToTeamDiaryEntries((entries) => {
      if (entries && entries.length > 0) {
        setDiaryEntries(entries);
      }
    });
    return () => unsub();
  }, []);

  // المودالز
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [isAddDiaryModalOpen, setIsAddDiaryModalOpen] = useState(false);

  // مرجع التمرير لأسفل المحادثة
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length, activeChannel]);

  // إرسال رسالة عادية
  const handleSendTextMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText.trim(), 'text');
    setInputText('');
  };

  // إرسال قالب سريع
  const handleSendQuickPrompt = (prompt: string) => {
    sendMessage(prompt, 'text');
    onShowToast('تم إرسال التوجيه السريع في الدردشة!');
  };

  // إنشاء استطلاع موعد مباراة
  const handleCreatePoll = (pollData: ChatPollData, initialNote: string) => {
    sendMessage(initialNote, 'schedule_poll', pollData, 'scheduling');
    setActiveChannel('scheduling');
    onShowToast(`تم نشر استطلاع موعد [ ${pollData.eventTitle} ] بنجاح للتصويت الفوري!`);
  };

  // إضافة قيد في يوميات الفريق وحفظه سحابياً في Firestore
  const handleSaveDiaryEntry = (newEntry: TeamDiaryEntry) => {
    setDiaryEntries([newEntry, ...diaryEntries]);
    saveTeamDiaryEntryToCloud(newEntry);
    onShowToast(`تم تدوين [ ${newEntry.title} ] وحفظه سحابياً في قاعدة بيانات الفريق!`);
  };

  // تصفية اليوميات
  const filteredDiaryEntries = diaryEntries.filter((entry) => {
    if (diaryFilter === 'all') return true;
    return entry.category === diaryFilter;
  });

  return (
    <div className="space-y-6">
      {/* 1. رأس قسم يوميات الفريق والتواصل المباشر */}
      <div className="bg-[#11141b] rounded-3xl border border-[#222735] p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#d4af37]/15 text-[#f5d77f] text-xs font-bold px-3 py-1 rounded-full border border-[#d4af37]/35 flex items-center gap-1.5 shadow-sm">
                <Radio className="w-3.5 h-3.5 text-[#f5d77f] animate-pulse" />
                <span>غرفة الفريق الحية • Real-time Team Hub</span>
              </span>

              {/* مؤشر اتصال WebSocket المباشر */}
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                  isConnected
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                  }`}
                />
                <span>{isConnected ? 'الخادم المباشر متصل (WebSocket)' : 'جارٍ الاتصال...'}</span>
              </span>

              <span className="text-xs text-slate-400 bg-[#08090d] px-3 py-1 rounded-full border border-[#222735]">
                {onlineUsers.length} متصلين الآن في الغرفة
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Changa',sans-serif] tracking-tight flex items-center gap-2">
              <MessagesSquare className="w-7 h-7 text-[#f5d77f]" />
              <span>يوميات الفريق والدردشة المباشرة</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              منصة تواصل فورية بين أعضاء الفريق الواحد: تنسيق مواعيد المباريات والتمارين، استطلاعات حصر العدد، مناقشة الخطط، وتوثيق سجل إنجازات الفريق في ملاعب جدة.
            </p>
          </div>

          {/* تبديل العرض والأزرار السريعة */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* تبديل هوية المتحدث للتجربة */}
            <div className="bg-[#08090d] p-2 rounded-2xl border border-[#222735] flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap">أنت تتحدث كـ:</span>
              <select
                value={currentSenderId}
                onChange={(e) => setCurrentSenderId(e.target.value)}
                className="bg-[#11141b] border border-[#222735] text-[#f5d77f] font-bold text-xs rounded-xl px-2.5 py-1.5 focus:border-[#d4af37] focus:outline-none"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.position})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsPollModalOpen(true)}
              className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 font-bold shadow-md hover:scale-[1.02] transition"
            >
              <Calendar className="w-4 h-4" />
              <span>تنسيق موعد مباراة 📅</span>
            </button>

            <button
              onClick={() => setIsAddDiaryModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#161a23] hover:bg-[#202634] text-slate-200 border border-[#222735] text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <BookOpenCheck className="w-4 h-4 text-[#f5d77f]" />
              <span>تدوين يومية ✍️</span>
            </button>
          </div>
        </div>

        {/* شريط المتواجدين الآن من أعضاء الفريق */}
        <div className="mt-5 pt-4 border-t border-[#1c222e] flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#f5d77f]" />
              <span>أعضاء غرفة الملابس المتواجدون:</span>
            </span>
            <div className="flex items-center -space-x-2 space-x-reverse">
              {onlineUsers.map((user) => (
                <div key={user.id} className="relative group" title={`${user.name} (${user.role})`}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#11141b] hover:border-[#d4af37] transition cursor-pointer"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#11141b]" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'all'
                  ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              عرض متكامل (الدردشة + اليوميات)
            </button>
            <button
              onClick={() => setViewMode('chat_only')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'chat_only'
                  ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الدردشة المباشرة فقط
            </button>
            <button
              onClick={() => setViewMode('diary_only')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'diary_only'
                  ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              سجل اليوميات فقط
            </button>
          </div>
        </div>
      </div>

      {/* 2. المحتوى الرئيسي: تقسيم ثنائي (نافذة الدردشة المباشرة + لوحة يوميات الفريق) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ==================================================== */}
        {/* نافذة الدردشة المباشرة (Real-time Chat) */}
        {/* ==================================================== */}
        {(viewMode === 'all' || viewMode === 'chat_only') && (
          <div
            className={`${
              viewMode === 'chat_only' ? 'lg:col-span-12' : 'lg:col-span-7 xl:col-span-8'
            } bg-[#11141b] rounded-3xl border border-[#222735] flex flex-col h-[700px] shadow-2xl overflow-hidden`}
          >
            {/* شريط رأس الدردشة وقنوات الفريق */}
            <div className="p-4 bg-[#0d1017] border-b border-[#1c222e] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f5d77f]">
                  <MessageSquareQuote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>غرفة دردشة فريق نجوم الروضة</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      LIVE WS
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">تواصل فوري مشفر وتنسيق مباريات ودية</p>
                </div>
              </div>

              {/* أزرار القنوات الثلاث */}
              <div className="flex items-center gap-1.5 bg-[#08090d] p-1 rounded-xl border border-[#222735] text-xs font-bold">
                <button
                  onClick={() => setActiveChannel('scheduling')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    activeChannel === 'scheduling'
                      ? 'bg-[#d4af37] text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>تنسيق المواعيد</span>
                </button>

                <button
                  onClick={() => setActiveChannel('general')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    activeChannel === 'general'
                      ? 'bg-[#d4af37] text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessagesSquare className="w-3.5 h-3.5" />
                  <span>غرفة الملابس</span>
                </button>

                <button
                  onClick={() => setActiveChannel('tactics')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    activeChannel === 'tactics'
                      ? 'bg-[#d4af37] text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>الخطط</span>
                </button>
              </div>
            </div>

            {/* شريط الإجراءات والقوالب السريعة */}
            <div className="px-4 py-2.5 bg-[#08090d]/70 border-b border-[#1c222e] flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
              <span className="text-slate-500 font-bold whitespace-nowrap flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#f5d77f]" />
                قوالب سريعة:
              </span>
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuickPrompt(prompt)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#161a23] hover:bg-[#222735] text-slate-300 border border-[#222735] hover:border-[#d4af37]/40 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* منطقة رسائل المحادثة المتدفقة */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              {channelMessages.map((msg) => {
                const isMe = msg.senderId === currentSender.id;
                const isSystem = msg.type === 'system_announcement';
                const isPoll = msg.type === 'schedule_poll' && msg.pollData;

                if (isSystem) {
                  return (
                    <div
                      key={msg.id}
                      className="mx-auto max-w-lg p-3 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-center space-y-1 my-3 text-xs"
                    >
                      <div className="flex items-center justify-center gap-1.5 text-[#f5d77f] font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{msg.senderName}</span>
                      </div>
                      <p className="text-slate-300">{msg.text}</p>
                      <span className="text-[10px] text-slate-400 block font-mono">{msg.timestamp}</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* الصورة الرمزية */}
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-9 h-9 rounded-xl object-cover border border-[#222735] shrink-0 mt-1"
                    />

                    {/* فقاعة الرسالة */}
                    <div
                      className={`max-w-xl space-y-2 rounded-2xl p-3.5 shadow-md ${
                        isMe
                          ? 'bg-[#182030] border border-[#d4af37]/40 text-slate-100 rounded-tr-none'
                          : 'bg-[#0d1017] border border-[#222735] text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {/* رأس الرسالة: الاسم والرتبة والتوقيت */}
                      <div className="flex items-center justify-between gap-3 text-[11px] pb-1 border-b border-[#222735]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{msg.senderName}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              msg.senderRole === 'captain'
                                ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40'
                                : msg.senderRole === 'vice_captain'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {msg.senderRole === 'captain'
                              ? 'الكابتن'
                              : msg.senderRole === 'vice_captain'
                              ? 'نائب الكابتن'
                              : msg.senderPosition}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                      </div>

                      {/* نص الرسالة */}
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                      {/* بطاقة استطلاع الموعد والتقسيمة التفاعلية (مع نظام النزاهة وقائمة الانتظار والترقية التلقائية) */}
                      {isPoll && msg.pollData && (
                        <MatchPollCard
                          messageId={msg.id}
                          pollData={msg.pollData}
                          currentSenderId={currentSender.id}
                          allPlayers={players}
                          onVote={votePoll}
                          onSimulateStarterApology={simulateStarterApology}
                          onSimulateWaitlistJoin={simulateWaitlistJoin}
                          onShowToast={onShowToast}
                        />
                      )}

                      {/* شريط التفاعلات بالرموز التعبيرية */}
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#1c222e]/60 text-[11px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {EMOJI_REACTIONS.map((emoji) => {
                            const count = msg.reactions?.[emoji]?.length || 0;
                            const hasReacted = msg.reactions?.[emoji]?.includes(currentSender.id);
                            return (
                              <button
                                key={emoji}
                                onClick={() => toggleReaction(msg.id, emoji)}
                                className={`px-2 py-0.5 rounded-lg border text-xs transition flex items-center gap-1 ${
                                  hasReacted
                                    ? 'bg-[#d4af37]/20 border-[#d4af37]/60 text-[#f5d77f]'
                                    : 'bg-[#11141b] border-[#222735] text-slate-400 hover:text-white'
                                }`}
                              >
                                <span>{emoji}</span>
                                {count > 0 && <span className="text-[10px] font-mono">{count}</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={chatBottomRef} />
            </div>

            {/* شريط كتابة وإرسال الرسالة */}
            <form
              onSubmit={handleSendTextMessage}
              className="p-3 bg-[#0d1017] border-t border-[#1c222e] flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setIsPollModalOpen(true)}
                className="p-2.5 rounded-xl bg-[#161a23] hover:bg-[#222735] text-[#f5d77f] border border-[#222735] hover:border-[#d4af37]/50 transition shrink-0"
                title="إنشاء استطلاع موعد مباراة"
              >
                <Calendar className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`اكتب رسالتك في قناة #${
                  activeChannel === 'scheduling'
                    ? 'تنسيق المواعيد'
                    : activeChannel === 'general'
                    ? 'غرفة الملابس'
                    : 'الخطط'
                }...`}
                className="flex-1 bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:border-[#d4af37] focus:outline-none"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`p-2.5 rounded-xl flex items-center justify-center transition shrink-0 ${
                  inputText.trim()
                    ? 'gold-gradient-btn text-slate-950 font-bold hover:scale-105 shadow-md'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5 rotate-180" />
              </button>
            </form>
          </div>
        )}

        {/* ==================================================== */}
        {/* لوحة يوميات الفريق وسجل المباريات (Team Diary Logs) */}
        {/* ==================================================== */}
        {(viewMode === 'all' || viewMode === 'diary_only') && (
          <div
            className={`${
              viewMode === 'diary_only' ? 'lg:col-span-12' : 'lg:col-span-5 xl:col-span-4'
            } space-y-4`}
          >
            {/* بطاقة ملخص سجل الفريق */}
            <div className="bg-[#11141b] rounded-3xl border border-[#222735] p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1c222e] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#d4af37]/15 text-[#f5d77f]">
                    <BookOpenCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">سجل يوميات الفريق</h3>
                    <p className="text-[10px] text-slate-400">توثيق التمارين، النتائج، وملاحظات الكباتن</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddDiaryModalOpen(true)}
                  className="p-2 rounded-xl bg-[#08090d] hover:bg-[#161a23] text-[#f5d77f] border border-[#222735] text-xs font-bold flex items-center gap-1 transition"
                  title="تدوين جديد"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">تدوين جديد</span>
                </button>
              </div>

              {/* أزرار تصفية اليوميات */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'training', label: 'التمارين' },
                  { id: 'match_review', label: 'المباريات' },
                  { id: 'tactical_note', label: 'التكتيك' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDiaryFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                      diaryFilter === tab.id
                        ? 'bg-[#d4af37] text-slate-950 font-black'
                        : 'bg-[#08090d] text-slate-400 hover:text-white border border-[#222735]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* قائمة بطاقات اليوميات */}
              <div className="space-y-3.5 max-h-[580px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                {filteredDiaryEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`bg-[#0d1017] rounded-2xl border p-4 space-y-3 transition hover:border-[#d4af37]/40 relative ${
                      entry.pinned ? 'border-[#d4af37]/60 shadow-lg' : 'border-[#222735]'
                    }`}
                  >
                    {entry.pinned && (
                      <div className="absolute top-3 left-3 text-[#f5d77f] flex items-center gap-1 text-[10px] font-bold bg-[#d4af37]/15 px-2 py-0.5 rounded-full border border-[#d4af37]/35">
                        <Pin className="w-3 h-3" />
                        <span>مثبت</span>
                      </div>
                    )}

                    {/* تصنيف اليومية والتاريخ */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          entry.category === 'training'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : entry.category === 'match_review'
                            ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                            : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                        }`}
                      >
                        {entry.category === 'training'
                          ? 'تمرين إعداد'
                          : entry.category === 'match_review'
                          ? 'مراجعة ودية'
                          : 'توجيه تكتيكي'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{entry.date}</span>
                    </div>

                    {/* العنوان والموقع */}
                    <div>
                      <h4 className="text-sm font-bold text-white hover:text-[#f5d77f] transition">
                        {entry.title}
                      </h4>
                      {entry.location && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-[#d4af37]" />
                          <span>{entry.location}</span>
                        </div>
                      )}
                    </div>

                    {/* النتيجة إن وجدت */}
                    {entry.score && (
                      <div className="p-2 bg-[#11141b] rounded-xl border border-[#222735] flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-bold">الخصم: {entry.opponent}</span>
                        <span className="font-mono font-black text-[#f5d77f] text-sm">{entry.score}</span>
                      </div>
                    )}

                    {/* المحتوى وسرد اليومية */}
                    <p className="text-xs text-slate-300 leading-relaxed">{entry.content}</p>

                    {/* أبرز النقاط والإنجازات */}
                    {entry.highlights && entry.highlights.length > 0 && (
                      <div className="p-2.5 bg-[#08090d] rounded-xl border border-[#222735] space-y-1 text-[11px]">
                        <span className="text-[10px] font-bold text-[#f5d77f] block">
                          أبرز المخرجات والملاحظات:
                        </span>
                        {entry.highlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-slate-300">
                            <span className="text-[#d4af37] font-bold">•</span>
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* مؤلف التدوينة */}
                    <div className="pt-2 border-t border-[#1c222e] flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-slate-300">{entry.authorName}</span>
                      <span className="text-slate-500">{entry.authorRole}</span>
                    </div>
                  </div>
                ))}

                {filteredDiaryEntries.length === 0 && (
                  <div className="text-center p-8 bg-[#08090d] rounded-2xl border border-[#222735] space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-400">لا توجد يوميات مسجلة ضمن هذا التصنيف</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* مودال إنشاء استطلاع موعد مباراة */}
      <CreateSchedulePollModal
        isOpen={isPollModalOpen}
        onClose={() => setIsPollModalOpen(false)}
        onSubmit={handleCreatePoll}
      />

      {/* مودال تدوين قيد جديد في يوميات الفريق */}
      <AddDiaryEntryModal
        isOpen={isAddDiaryModalOpen}
        onClose={() => setIsAddDiaryModalOpen(false)}
        onSave={handleSaveDiaryEntry}
      />
    </div>
  );
};
