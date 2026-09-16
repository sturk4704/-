import React, { useState } from 'react';
import { Player, FriendlyChallenge, RefereeEvaluation } from '../types';
import { 
  UserCheck, 
  ShieldCheck, 
  Star, 
  Check, 
  Lock, 
  EyeOff, 
  Sparkles, 
  Clock, 
  Scale, 
  AlertCircle,
  MessageSquare,
  Award,
  ChevronRight
} from 'lucide-react';

interface FriendlyRefereeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'assign' | 'evaluate';
  challenge?: FriendlyChallenge;
  players: Player[];
  onAssignReferee?: (challengeId: string, player: Player) => void;
  onSaveEvaluation?: (playerId: string, evaluation: RefereeEvaluation) => void;
}

export const FriendlyRefereeModal: React.FC<FriendlyRefereeModalProps> = ({
  isOpen,
  onClose,
  mode: initialMode,
  challenge,
  players,
  onAssignReferee,
  onSaveEvaluation,
}) => {
  const [currentMode, setCurrentMode] = useState<'assign' | 'evaluate'>(initialMode);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    challenge?.friendlyReferee?.playerId || (players[0]?.id ?? '')
  );

  // حقول التقييم الودي
  const [fairnessScore, setFairnessScore] = useState<number>(9.0);
  const [timeManagementScore, setTimeManagementScore] = useState<number>(8.5);
  const [foulDecisionsScore, setFoulDecisionsScore] = useState<number>(8.5);
  const [composureScore, setComposureScore] = useState<number>(9.0);
  const [privateNotes, setPrivateNotes] = useState<string>('');
  const [captainName, setCaptainName] = useState<string>(challenge?.creatorCaptainName || 'كابتن المباراة');
  const [captainTeam, setCaptainTeam] = useState<string>(challenge?.creatorTeamName || 'فريق التحدي');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // تحديث النمط إذا تغيرت الخاصية
  React.useEffect(() => {
    setCurrentMode(initialMode);
    if (challenge?.friendlyReferee?.playerId) {
      setSelectedPlayerId(challenge.friendlyReferee.playerId);
    }
  }, [initialMode, challenge]);

  if (!isOpen) return null;

  const targetPlayer = players.find((p) => p.id === selectedPlayerId);
  const overallCalc = Math.round(((fairnessScore + timeManagementScore + foulDecisionsScore + composureScore) / 4) * 10) / 10;

  // تنفيذ تعيين الحكم
  const handleAssign = (player: Player) => {
    if (!challenge || !onAssignReferee) return;
    onAssignReferee(challenge.id, player);
    onClose();
  };

  // تنفيذ حفظ تقييم الحكم
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPlayer || !onSaveEvaluation) return;

    const evaluation: RefereeEvaluation = {
      id: `ref-eval-${Date.now()}`,
      matchId: challenge?.id || `match-${Date.now()}`,
      matchTitle: challenge 
        ? `${challenge.creatorTeamName} vs ${challenge.acceptedTeamName || 'المنافس'} (${challenge.format})`
        : 'مباراة ودية بجدة',
      evaluatorCaptainName: captainName,
      evaluatorTeamName: captainTeam,
      date: new Date().toISOString().split('T')[0],
      overallScore: overallCalc,
      fairnessScore,
      timeManagementScore,
      foulDecisionsScore,
      composureScore,
      privateNotes: privateNotes.trim() || 'إدارة جيدة للمباراة والتزام بالروح الرياضية.',
    };

    onSaveEvaluation(targetPlayer.id, evaluation);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto text-right">
      <div className="relative w-full max-w-2xl bg-[#11141b] border border-[#222735] rounded-3xl p-5 md:p-7 shadow-2xl space-y-6 my-8">
        
        {/* رأس النافذة */}
        <div className="flex items-center justify-between border-b border-[#222735] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/35 flex items-center justify-center text-[#f5d77f]">
              <UserCheck className="w-5 h-5 text-[#f5d77f]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-bold font-['Changa',sans-serif] text-white">
                  {currentMode === 'assign' ? 'تحديد حكم ودّي من قائمة اللاعبين' : 'تقييم أداء الحكم الودي بعد المباراة'}
                </h3>
                <span className="flex items-center gap-1 text-[10px] bg-[#d4af37]/15 text-[#f5d77f] px-2 py-0.5 rounded-full border border-[#d4af37]/30 font-bold">
                  <Lock className="w-3 h-3" />
                  خاص بالكباتن فقط
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {challenge ? `لمباراة: ${challenge.creatorTeamName} بحي ${challenge.neighborhood}` : 'مباريات كابتن جدة الودية'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#161a23] text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* تنبيه الخصوصية الصارم: التقييم الداخلي لا يظهر للعامة */}
        <div className="bg-[#161a24] border border-[#222735] rounded-2xl p-3.5 flex items-start gap-3">
          <Lock className="w-4 h-4 text-[#f5d77f] shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <p className="font-bold text-white mb-0.5 flex items-center gap-1.5">
              <span>نظام السرية المعتمد للتحكيم الودي:</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-0.2 rounded">حماية الروح الرياضية</span>
            </p>
            <p className="text-slate-400 text-[11px]">
              تقييمات التحكيم وسجل المباريات المدارة تظهر <strong>حصراً لكباتن الفرق والمنظمين</strong> لمساعدتهم في اختيار أفضل حكم للمباريات القادمة، <strong>ولا تظهر للعامة</strong> أو في بطاقات فيفا الخاصة باللاعبين.
            </p>
          </div>
        </div>

        {/* محتوى النمط: إما تعيين حكم أو تقييمه */}
        {currentMode === 'assign' ? (
          /* 1. قائمة اختيار وتعيين الحكم الودي */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#f5d77f]" />
                اختر حكماً ودياً من اللاعبين المتواجدين بالمنصة:
              </span>
              <span className="text-slate-400 text-[11px]">مرتبين حسب الكفاءة والانضباط</span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {players.map((p) => {
                const isSelected = selectedPlayerId === p.id;
                const isCurrentAssigned = challenge?.friendlyReferee?.playerId === p.id;
                const refProfile = p.internalRefereeProfile;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-[#161a23] border-[#d4af37] shadow-lg shadow-[#d4af37]/5'
                        : 'bg-[#08090d] border-[#222735] hover:border-[#343d52]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#222735]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs md:text-sm text-white">{p.name}</span>
                            <span className="text-[10px] bg-[#d4af37]/15 text-[#f5d77f] px-2 py-0.5 rounded-full font-bold border border-[#d4af37]/30">
                              {p.position}
                            </span>
                            {isCurrentAssigned && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/40">
                                الحكم المعين حالياً
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {p.clubName} • {p.neighborhood} • بطاقة كروية {p.overall} OVR
                          </div>
                        </div>
                      </div>

                      {/* التقييم الداخلي السري الخاص بالكباتن */}
                      <div className="text-left shrink-0">
                        {refProfile ? (
                          <div className="bg-[#11141b] border border-[#d4af37]/30 px-3 py-1.5 rounded-xl text-center">
                            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                              <Lock className="w-2.5 h-2.5 text-[#f5d77f]" />
                              <span>تقييم الكباتن الداخلي:</span>
                            </div>
                            <div className="text-sm font-black text-[#f5d77f] font-mono">
                              ⭐ {refProfile.averageRating.toFixed(1)} / 10
                            </div>
                            <div className="text-[9px] text-slate-400">
                              ({refProfile.matchesOfficiated} مباريات سابقة)
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[#11141b] border border-[#222735] px-2.5 py-1.5 rounded-xl text-center">
                            <span className="text-[10px] text-slate-400">مرشح جديد</span>
                            <div className="text-[11px] text-slate-300 font-bold">بدون مباريات سابقة</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* تفاصيل السجل التحكيمي إذا كان لديه تقييم سابق */}
                    {refProfile && (
                      <div className="pt-2 border-t border-[#222735] text-xs">
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                          <div className="bg-[#11141b] p-1.5 rounded-lg border border-[#1f2430]">
                            <span className="text-slate-400 block">النزاهة والحياد</span>
                            <span className="font-bold text-[#f5d77f] font-mono">{refProfile.fairnessAvg.toFixed(1)}/10</span>
                          </div>
                          <div className="bg-[#11141b] p-1.5 rounded-lg border border-[#1f2430]">
                            <span className="text-slate-400 block">إدارة الوقت</span>
                            <span className="font-bold text-[#f5d77f] font-mono">{refProfile.timeManagementAvg.toFixed(1)}/10</span>
                          </div>
                          <div className="bg-[#11141b] p-1.5 rounded-lg border border-[#1f2430]">
                            <span className="text-slate-400 block">حسم الأخطاء</span>
                            <span className="font-bold text-[#f5d77f] font-mono">{refProfile.foulDecisionsAvg.toFixed(1)}/10</span>
                          </div>
                          <div className="bg-[#11141b] p-1.5 rounded-lg border border-[#1f2430]">
                            <span className="text-slate-400 block">الهدوء والسيطرة</span>
                            <span className="font-bold text-[#f5d77f] font-mono">{refProfile.composureAvg.toFixed(1)}/10</span>
                          </div>
                        </div>

                        {/* آخر ملاحظة سرية من الكباتن */}
                        {refProfile.evaluations.length > 0 && (
                          <div className="mt-2 text-[10px] text-slate-300 bg-[#11141b]/90 p-2 rounded-xl border border-[#222735] flex items-start gap-1.5">
                            <MessageSquare className="w-3 h-3 text-[#f5d77f] shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[#f5d77f] font-bold">آخر تقرير كابتن: </span>
                              <span>"{refProfile.evaluations[0].privateNotes}"</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* زر الاختيار المباشر */}
                    {isSelected && (
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssign(p);
                          }}
                          className="gold-gradient-btn px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>اعتماد {p.name} حكماً للمباراة</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* 2. نافذة تقييم الحكم بعد المباراة */
          <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
            {targetPlayer && (
              <div className="bg-[#08090d] p-3.5 rounded-2xl border border-[#222735] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={targetPlayer.avatarUrl}
                    alt={targetPlayer.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#222735]"
                  />
                  <div>
                    <div className="font-bold text-sm text-white">{targetPlayer.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {targetPlayer.clubName} • {targetPlayer.neighborhood}
                    </div>
                  </div>
                </div>

                <div className="text-left bg-[#11141b] px-3 py-2 rounded-xl border border-[#d4af37]/30">
                  <div className="text-[10px] text-slate-400">التقييم الإجمالي:</div>
                  <div className="text-lg font-black text-[#f5d77f] font-mono">
                    {overallCalc.toFixed(1)} / 10
                  </div>
                </div>
              </div>
            )}

            {/* تفاصيل الكابتن المقيم */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">اسم الكابتن المُقيّم:</label>
                <input
                  type="text"
                  required
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">فريق الكابتن:</label>
                <input
                  type="text"
                  required
                  value={captainTeam}
                  onChange={(e) => setCaptainTeam(e.target.value)}
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>

            {/* معايير التقييم الـ 4 الأساسية */}
            <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-4">
              <div className="font-bold text-white flex items-center gap-1.5 border-b border-[#1c222e] pb-2">
                <Scale className="w-4 h-4 text-[#f5d77f]" />
                <span>معايير أداء الحكم الودي في المباراة:</span>
              </div>

              {/* 1. الحيادية والنزاهة */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <span>1. النزاهة والحياد وعدم التحيز لفريقه:</span>
                  </span>
                  <span className="text-[#f5d77f] font-bold font-mono">{fairnessScore.toFixed(1)} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={fairnessScore}
                  onChange={(e) => setFairnessScore(parseFloat(e.target.value))}
                  className="w-full accent-[#d4af37] cursor-pointer"
                />
              </div>

              {/* 2. إدارة الوقت والتبديلات */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <span>2. إدارة وقت الشوطين والتبديلات والإيقافات:</span>
                  </span>
                  <span className="text-[#f5d77f] font-bold font-mono">{timeManagementScore.toFixed(1)} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={timeManagementScore}
                  onChange={(e) => setTimeManagementScore(parseFloat(e.target.value))}
                  className="w-full accent-[#d4af37] cursor-pointer"
                />
              </div>

              {/* 3. حسم الأخطاء واللمسات */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <span>3. دقة وشجاعة احتساب الأخطاء ولمسات اليد:</span>
                  </span>
                  <span className="text-[#f5d77f] font-bold font-mono">{foulDecisionsScore.toFixed(1)} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={foulDecisionsScore}
                  onChange={(e) => setFoulDecisionsScore(parseFloat(e.target.value))}
                  className="w-full accent-[#d4af37] cursor-pointer"
                />
              </div>

              {/* 4. الهدوء والسيطرة على المباراة */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <span>4. هدوء الشخصية والسيطرة على انفعالات اللاعبين:</span>
                  </span>
                  <span className="text-[#f5d77f] font-bold font-mono">{composureScore.toFixed(1)} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={composureScore}
                  onChange={(e) => setComposureScore(parseFloat(e.target.value))}
                  className="w-full accent-[#d4af37] cursor-pointer"
                />
              </div>
            </div>

            {/* الملاحظة السرية الخاصة للكباتن فقط */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#f5d77f]" />
                <span>ملاحظة وتوصية سرية للكباتن القادمين (لن يراها الحكم أو الجمهور):</span>
              </label>
              <textarea
                rows={3}
                value={privateNotes}
                onChange={(e) => setPrivateNotes(e.target.value)}
                placeholder="اكتب انطباعك الصادق عن أداء الحكم (مثال: حكم حازم وعادل في الكرات المشتركة، هادئ ولا ينفعل، ينصح به في المباريات الحماسية)..."
                className="w-full bg-[#08090d] border border-[#222735] rounded-xl p-3 text-white placeholder-slate-500 focus:border-[#d4af37] focus:outline-none text-xs leading-relaxed"
              />
            </div>

            {/* زر الحفظ النهائي */}
            <div className="pt-2">
              {savedSuccess ? (
                <div className="p-3.5 bg-[#d4af37] text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg">
                  <Check className="w-4 h-4" />
                  تم حفظ التقييم الودي الداخلي بنجاح! تم تحديث سجل الكباتن السري للحكم.
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentMode('assign')}
                    className="px-4 py-2.5 rounded-xl bg-[#161a23] text-slate-300 hover:text-white font-bold text-xs"
                  >
                    تغيير الحكم
                  </button>
                  <button
                    type="submit"
                    className="flex-1 gold-gradient-btn py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>اعتماد تقييم الحكم الودي وسجله الداخلي</span>
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
