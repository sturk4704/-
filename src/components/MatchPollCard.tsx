import React, { useState } from 'react';
import { ChatPollData, Player } from '../types';
import { TEAM_ROSTER_25, getRosterPlayer } from '../data/teamRoster';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Swords,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Sparkles,
  Shield,
  Zap,
  ArrowUpRight,
  BellRing,
  Shirt,
  AlertTriangle,
  Play
} from 'lucide-react';

interface MatchPollCardProps {
  messageId: string;
  pollData: ChatPollData;
  currentSenderId: string;
  allPlayers: Player[];
  onVote: (messageId: string, voteType: 'confirm' | 'decline' | 'tentative', targetPlayerId?: string) => void;
  onSimulateStarterApology?: (messageId: string, index?: number) => void;
  onSimulateWaitlistJoin?: (messageId: string) => void;
  onShowToast: (msg: string) => void;
}

export const MatchPollCard: React.FC<MatchPollCardProps> = ({
  messageId,
  pollData,
  currentSenderId,
  allPlayers,
  onVote,
  onSimulateStarterApology,
  onSimulateWaitlistJoin,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'starters' | 'waitlist' | 'teams'>('starters');

  const confirmedIds = pollData.confirmedPlayerIds || [];
  const waitingListIds = pollData.waitingListPlayerIds || [];
  const declinedIds = pollData.declinedPlayerIds || [];
  const tentativeIds = pollData.tentativePlayerIds || [];
  const required = pollData.requiredPlayers || 18;
  const isInternalScrimmage = pollData.matchType === 'internal_scrimmage' || pollData.eventTitle.includes('تقسيمة');

  // Helper to resolve player info
  const resolvePlayer = (id: string) => {
    const fromRoster = getRosterPlayer(id);
    if (fromRoster) return fromRoster;
    const fromProps = allPlayers.find((p) => p.id === id);
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

  const isCurrentStarter = confirmedIds.includes(currentSenderId);
  const starterIndex = confirmedIds.indexOf(currentSenderId);
  const isCurrentWaitlist = waitingListIds.includes(currentSenderId);
  const waitlistIndex = waitingListIds.indexOf(currentSenderId);
  const isCurrentDeclined = declinedIds.includes(currentSenderId);
  const isCurrentTentative = tentativeIds.includes(currentSenderId);

  // Auto divide into Team A and Team B for internal scrimmage
  const teamAPlayers = confirmedIds.filter((_, i) => i % 2 === 0).map(resolvePlayer);
  const teamBPlayers = confirmedIds.filter((_, i) => i % 2 !== 0).map(resolvePlayer);

  return (
    <div className="mt-3 p-4 bg-[#08090d] rounded-2xl border border-[#d4af37]/45 space-y-4 shadow-xl">
      {/* 1. Header Badges & Counters */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#1c222e] pb-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${
                isInternalScrimmage
                  ? 'bg-[#d4af37]/20 text-[#f5d77f] border-[#d4af37]/40 shadow-sm'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}
            >
              {isInternalScrimmage ? (
                <>
                  <Users className="w-3 h-3 text-[#f5d77f]" />
                  <span>تقسيمة داخلية بين لاعبي الفريق ({pollData.format})</span>
                </>
              ) : (
                <>
                  <Swords className="w-3 h-3 text-blue-400" />
                  <span>مباراة ودية ضد منافس ({pollData.format})</span>
                </>
              )}
            </span>

            {/* شارة نظام النزاهة التلقائي (من حضر أولاً يلعب أولاً) */}
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>نظام النزاهة الفوري (FIFO)</span>
            </span>
          </div>

          <h4 className="text-base font-black text-white font-['Changa',sans-serif] tracking-wide">
            {pollData.eventTitle}
          </h4>
        </div>

        {/* العداد الذكي للأساسيين وقائمة الانتظار */}
        <div className="flex items-center gap-3">
          <div className="text-center px-3 py-1.5 rounded-xl bg-[#11141b] border border-[#222735]">
            <div className="text-[10px] text-slate-400 font-bold">الأساسيون</div>
            <div className="font-mono text-sm">
              <span className={`font-black ${confirmedIds.length >= required ? 'text-emerald-400' : 'text-[#f5d77f]'}`}>
                {confirmedIds.length}
              </span>
              <span className="text-slate-500">/{required}</span>
            </div>
          </div>

          <div
            className={`text-center px-3 py-1.5 rounded-xl border ${
              waitingListIds.length > 0
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-[#11141b] border-[#222735] text-slate-500'
            }`}
          >
            <div className="text-[10px] font-bold">الانتظار</div>
            <div className="font-mono text-sm font-black">
              {waitingListIds.length > 0 ? `+${waitingListIds.length}` : '0'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. تنبيه ترقية فورية (إذا تم تصعيد لاعب حديثاً) */}
      {pollData.promotedPlayerAlert && (
        <div className="p-3 bg-gradient-to-r from-emerald-950/70 via-emerald-900/40 to-[#08090d] border border-emerald-500/40 rounded-xl flex items-center gap-3 animate-fade-in">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div className="text-xs text-slate-200 leading-relaxed">
            <span className="font-black text-emerald-400">⚡ تصعيد فوري بنظام النزاهة: </span>
            اعتذر اللاعب <strong className="text-white">[{pollData.promotedPlayerAlert.replacedPlayerName}]</strong>، وتم تلقائياً تصعيد اللاعب <strong className="text-[#f5d77f]">[{pollData.promotedPlayerAlert.promotedPlayerName}]</strong> من قائمة الانتظار إلى تشكيلة الكابتن الأساسية!
          </div>
        </div>
      )}

      {/* 3. تفاصيل الملعب والموعد */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[#11141b] p-3 rounded-xl border border-[#222735]">
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{pollData.date} • {pollData.time}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-4 h-4 text-[#f5d77f] shrink-0" />
          <span className="truncate">{pollData.pitchName} ({pollData.neighborhood})</span>
        </div>
      </div>

      {/* 4. حالة المستخدم الحالي في الاستطلاع */}
      {isCurrentStarter && (
        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300 font-bold">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>أنت في التشكيلة الأساسية المعتمدة (الترتيب: #{starterIndex + 1} بأسبقية الحضور)</span>
          </span>
          <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-200">
            أساسي مؤكد
          </span>
        </div>
      )}

      {isCurrentWaitlist && (
        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 font-bold">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>أنت في قائمة الانتظار (الترتيب: #{waitlistIndex + 1}). ستدخل التشكيلة تلقائياً فور اعتذار أي لاعب!</span>
          </span>
          <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-200">
            انتظار #{waitlistIndex + 1}
          </span>
        </div>
      )}

      {/* 5. شريط التقدم لاكتمال النصاب */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>اكتمال قائمة الأساسيين ({confirmedIds.length} من {required})</span>
          <span className="font-mono font-bold text-[#f5d77f]">
            {Math.round((confirmedIds.length / required) * 100)}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-[#11141b] rounded-full overflow-hidden border border-[#222735] p-0.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-[#d4af37] to-amber-500 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.min(100, (confirmedIds.length / required) * 100)}%` }}
          />
        </div>
      </div>

      {/* 6. أزرار التصويت الفوري */}
      <div className="grid grid-cols-3 gap-2">
        {/* زر حاضر */}
        <button
          onClick={() => {
            onVote(messageId, 'confirm');
            if (confirmedIds.length < required) {
              onShowToast('تم تأكيد حضورك ودخول التشكيلة الأساسية بنجاح!');
            } else {
              onShowToast('اكتمل نصاب الـ 18 أساسي، تم تسجيلك في قائمة الانتظار بنجاح!');
            }
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 border ${
            isCurrentStarter
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg font-black'
              : isCurrentWaitlist
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md font-bold'
              : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            حاضر ({confirmedIds.length})
            {waitingListIds.length > 0 && ` + (${waitingListIds.length} انتظار)`}
          </span>
        </button>

        {/* زر متأخر / احتمال */}
        <button
          onClick={() => {
            onVote(messageId, 'tentative');
            onShowToast('تم تسجيل حالتك كـ (احتمال / غير مؤكد)');
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 border ${
            isCurrentTentative
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg font-black'
              : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border-amber-500/30'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>احتمال ({tentativeIds.length})</span>
        </button>

        {/* زر معتذر */}
        <button
          onClick={() => {
            onVote(messageId, 'decline');
            onShowToast('تم تسجيل اعتذارك، وسيتم تصعيد أول لاعب من الانتظار تلقائياً إن وجد!');
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 border ${
            isCurrentDeclined
              ? 'bg-rose-500 text-white border-rose-400 shadow-lg font-black'
              : 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border-rose-500/30'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>معتذر ({declinedIds.length})</span>
        </button>
      </div>

      {/* 7. تبويبات استعراض القوائم والتقسيمة */}
      <div className="pt-2 border-t border-[#1c222e] space-y-3">
        <div className="flex items-center gap-2 border-b border-[#222735] pb-2 text-xs">
          <button
            onClick={() => setActiveTab('starters')}
            className={`pb-1.5 px-2 font-bold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'starters'
                ? 'border-[#d4af37] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#f5d77f]" />
            <span>الأساسيون المعتمدون ({confirmedIds.length}/{required})</span>
          </button>

          <button
            onClick={() => setActiveTab('waitlist')}
            className={`pb-1.5 px-2 font-bold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'waitlist'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>قائمة الانتظار والترقية ({waitingListIds.length})</span>
          </button>

          {isInternalScrimmage && (
            <button
              onClick={() => setActiveTab('teams')}
              className={`pb-1.5 px-2 font-bold flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'teams'
                  ? 'border-emerald-400 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shirt className="w-3.5 h-3.5 text-emerald-400" />
              <span>تقسيم الفريقين (A ضد B)</span>
            </button>
          )}
        </div>

        {/* المحتوى حسب التبويب */}
        {activeTab === 'starters' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>مرتبون حسب أسبقية التسجيل والنزاهة (FIFO):</span>
              <span className="text-emerald-400 font-bold">
                {confirmedIds.length >= required ? '✓ اكتمل نصاب التشكيلة الأساسية' : `باقي ${required - confirmedIds.length} لاعب`}
              </span>
            </div>

            {confirmedIds.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">لم يسجل أي لاعب حضوره بعد. كن أول الحاضرين!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {confirmedIds.map((id, index) => {
                  const p = resolvePlayer(id);
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#11141b] border border-[#222735] hover:border-[#d4af37]/40 transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] font-black w-5 h-5 rounded-full bg-[#182030] text-[#f5d77f] border border-[#d4af37]/30 flex items-center justify-center shrink-0">
                          #{index + 1}
                        </span>
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-7 h-7 rounded-full object-cover border border-[#222735] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span className="text-[#f5d77f] font-mono">{p.position}</span>
                            <span>• رقم {p.number}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                        أساسي ✓
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'waitlist' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed flex items-start gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-black text-amber-300">نظام النزاهة والترقية التلقائية: </strong>
                اللاعبون في هذه القائمة مسجلون بترتيب زمني دقيق. في حال اعتذر أي لاعب أساسي، يصعّد النظام فوراً صاحب المركز رقم (1) بدون تدخل يدوي ويرسل له إشعاراً فورياً.
              </div>
            </div>

            {waitingListIds.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                لا يوجد لاعبون في قائمة الانتظار حالياً. عندما يكتمل العدد ({required}) سينتقل المسجلون اللاحقون إلى هنا تلقائياً.
              </p>
            ) : (
              <div className="space-y-2">
                {waitingListIds.map((id, index) => {
                  const p = resolvePlayer(id);
                  const isFirstInLine = index === 0;
                  return (
                    <div
                      key={id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                        isFirstInLine
                          ? 'bg-amber-500/15 border-amber-500/50 shadow-md'
                          : 'bg-[#11141b] border-[#222735]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full font-mono text-xs font-black flex items-center justify-center ${
                            isFirstInLine
                              ? 'bg-amber-500 text-slate-950 shadow'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          #{index + 1}
                        </span>
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#222735]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {isFirstInLine && (
                              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                                الأولوية الأولى
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            مركز {p.position} • سجل بعد اكتمال العدد
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isFirstInLine
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 animate-pulse'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isFirstInLine ? 'يصعد فور اعتذار أي لاعب ⚡' : `انتظار دور #${index + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'teams' && isInternalScrimmage && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold flex items-center gap-1 text-[#f5d77f]">
                <Shirt className="w-3.5 h-3.5" />
                <span>توزيع الـ {confirmedIds.length} لاعباً الأساسيين على تشكيلتين متوازنتين</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {pollData.format} (فريق أبيض vs فريق أزرق)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* الفريق الأبيض */}
              <div className="bg-[#11141b] p-3 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-400" />
                    <span className="text-xs font-black text-white">الفريق الأبيض (Team A)</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-300 font-bold">
                    {teamAPlayers.length} لاعبين
                  </span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {teamAPlayers.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-[#08090d] border border-[#222735]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[9px] text-slate-500">#{idx + 1}</span>
                        <span className="font-bold text-slate-200 truncate">{p.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#f5d77f] font-bold">{p.position}</span>
                    </div>
                  ))}
                  {teamAPlayers.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-2">لا يوجد لاعبين مؤكدين</p>
                  )}
                </div>
              </div>

              {/* الفريق الأزرق */}
              <div className="bg-[#11141b] p-3 rounded-2xl border border-blue-500/40 space-y-2">
                <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-400" />
                    <span className="text-xs font-black text-blue-300">الفريق الملون / الأزرق (Team B)</span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-400 font-bold">
                    {teamBPlayers.length} لاعبين
                  </span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {teamBPlayers.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-[#08090d] border border-[#222735]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[9px] text-slate-500">#{idx + 1}</span>
                        <span className="font-bold text-slate-200 truncate">{p.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-blue-400 font-bold">{p.position}</span>
                    </div>
                  ))}
                  {teamBPlayers.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-2">لا يوجد لاعبين مؤكدين</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
