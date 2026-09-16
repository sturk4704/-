import React, { useState } from 'react';
import { Player, RefereeEvaluation } from '../types';
import { applyMatchRating, FIELD_SKILLS_INFO, GK_SKILLS_INFO } from '../utils/cardRatingEngine';
import { 
  EyeOff, 
  Sparkles, 
  Award, 
  Check, 
  ShieldAlert, 
  Users, 
  UserCheck,
  Star,
  Info,
  Flame,
  AlertTriangle,
  Lock,
  Scale
} from 'lucide-react';

interface PostMatchRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onApplyRatings: (updatedPlayers: Player[], refereeRating: number, toxicDiscarded: boolean) => void;
}

export const PostMatchRatingModal: React.FC<PostMatchRatingModalProps> = ({
  isOpen,
  onClose,
  players,
  onApplyRatings,
}) => {
  // الحد الأقصى 5 لاعبين للتقييم الأعمى
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  // التقييم من 1 إلى 10 (الافتراضي 6.0 نقطة التعادل)
  const [ratingsMap, setRatingsMap] = useState<Record<string, number>>({});
  // السلوك والانضباط في الموعد (1 إلى 5 نجوم)
  const [disciplineMap, setDisciplineMap] = useState<Record<string, number>>({});
  // المهارة الاستثنائية التي تألق بها اللاعب
  const [highlightedSkillsMap, setHighlightedSkillsMap] = useState<Record<string, string>>({});

  // خيار تعيين حكم ودي من اللاعبين (ودي سري لا يظهر للعامة)
  const [friendlyRefereePlayerId, setFriendlyRefereePlayerId] = useState<string>('');
  const [fairnessScore, setFairnessScore] = useState<number>(8.5);
  const [timeManagementScore, setTimeManagementScore] = useState<number>(8.5);
  const [foulDecisionsScore, setFoulDecisionsScore] = useState<number>(8.5);
  const [composureScore, setComposureScore] = useState<number>(8.5);
  const [privateRefNotes, setPrivateRefNotes] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleSelectPlayer = (id: string) => {
    if (selectedPlayerIds.includes(id)) {
      setSelectedPlayerIds(selectedPlayerIds.filter((pId) => pId !== id));
    } else {
      if (selectedPlayerIds.length >= 5) {
        return; // حد أقصى 5 لاعبين
      }
      setSelectedPlayerIds([...selectedPlayerIds, id]);
      if (!ratingsMap[id]) {
        setRatingsMap((prev) => ({ ...prev, [id]: 7.5 }));
        setDisciplineMap((prev) => ({ ...prev, [id]: 5 }));
      }
    }
  };

  const handleRatingChange = (id: string, value: number) => {
    setRatingsMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleSkillHighlight = (id: string, skillKey: string) => {
    setHighlightedSkillsMap((prev) => ({ ...prev, [id]: skillKey }));
  };

  const refOverall = Math.round(((fairnessScore + timeManagementScore + foulDecisionsScore + composureScore) / 4) * 10) / 10;
  const selectedRefereePlayer = players.find((p) => p.id === friendlyRefereePlayerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlayerIds.length === 0) return;

    let anyToxicDiscarded = false;

    let updated = players.map((player) => {
      if (selectedPlayerIds.includes(player.id)) {
        const rating = ratingsMap[player.id] || 6.0;
        const skill = highlightedSkillsMap[player.id];
        // محاكاة تقييمات الزملاء الآخرين لتفعيل مكافحة التقييم الكيدي
        const simulatedPeerVotes = [rating, Math.min(10, rating + 0.5), Math.max(1, rating - 0.5)];
        const result = applyMatchRating(player, simulatedPeerVotes, skill);
        if (result.discardedToxicVotes) anyToxicDiscarded = true;
        return result.updatedPlayer;
      }
      return player;
    });

    // تحديث سجل الحكم الودي الداخلي إذا تم اختياره
    if (friendlyRefereePlayerId) {
      updated = updated.map((player) => {
        if (player.id === friendlyRefereePlayerId) {
          const curr = player.internalRefereeProfile || {
            matchesOfficiated: 0,
            averageRating: 0,
            fairnessAvg: 0,
            timeManagementAvg: 0,
            foulDecisionsAvg: 0,
            composureAvg: 0,
            evaluations: [],
          };
          const count = curr.matchesOfficiated + 1;
          const newEval: RefereeEvaluation = {
            id: `eval-${Date.now()}`,
            matchId: `match-${Date.now()}`,
            matchTitle: 'مباراة ودية بعد التقييم الأعمى',
            evaluatorCaptainName: 'كابتن المباراة',
            evaluatorTeamName: player.clubName,
            date: new Date().toISOString().split('T')[0],
            overallScore: refOverall,
            fairnessScore,
            timeManagementScore,
            foulDecisionsScore,
            composureScore,
            privateNotes: privateRefNotes.trim() || 'إدارة جيدة للمباراة والتزام بالروح الرياضية.',
          };
          const newEvals = [newEval, ...curr.evaluations];
          return {
            ...player,
            internalRefereeProfile: {
              matchesOfficiated: count,
              averageRating: Math.round((newEvals.reduce((s, e) => s + e.overallScore, 0) / count) * 10) / 10,
              fairnessAvg: Math.round((newEvals.reduce((s, e) => s + e.fairnessScore, 0) / count) * 10) / 10,
              timeManagementAvg: Math.round((newEvals.reduce((s, e) => s + e.timeManagementScore, 0) / count) * 10) / 10,
              foulDecisionsAvg: Math.round((newEvals.reduce((s, e) => s + e.foulDecisionsScore, 0) / count) * 10) / 10,
              composureAvg: Math.round((newEvals.reduce((s, e) => s + e.composureScore, 0) / count) * 10) / 10,
              evaluations: newEvals,
            },
          };
        }
        return player;
      });
    }

    onApplyRatings(updated, refOverall, anyToxicDiscarded);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#11141b] border border-[#222735] rounded-3xl p-5 md:p-8 shadow-2xl space-y-6 my-8 text-right">
        {/* رأس النافذة */}
        <div className="flex items-center justify-between border-b border-[#222735] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/35 flex items-center justify-center text-[#f5d77f]">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-['Changa',sans-serif] text-white">
                  غرفة التقييم الأعمى السري بعد المباراة
                </h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                  سرية 100%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                لا يعلم أحد من قيّمه لمنع المجاملات أو الحساسيات، مع نظام حماية ضد التقييمات الكيدية.
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

        {/* تنبيه قانون التقييم الإيجابي ×3 والسلبي -1.5 */}
        <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#f5d77f] shrink-0 mt-0.5" />
          <div className="text-xs text-slate-200 leading-relaxed space-y-1">
            <p>
              <strong>قانون كابتن جدة:</strong> نقطة التعادل هي 6.0/10. إذا قيّمت أداء اللاعب بأعلى من 6.0 سيُضرب الفارق في <strong>(×3.0)</strong> لتسريع تطور بطاقته، وإذا كان أقل فسيُخصم <strong>(-1.5)</strong> دون إجحاف.
            </p>
            <p className="text-[11px] text-[#f5d77f]">
              💡 يمكنك اختيار حتى 5 لاعبين شاركوا معك في المباراة لتقييمهم.
            </p>
          </div>
        </div>

        {/* اختيار اللاعبين للتقييم */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#f5d77f]" />
              اختر اللاعبين للتقييم (تم اختيار {selectedPlayerIds.length} من 5):
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {players.map((p) => {
              const isSelected = selectedPlayerIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleSelectPlayer(p.id)}
                  className={`p-2.5 rounded-2xl border text-right transition flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-[#d4af37]/15 border-[#d4af37] text-white shadow-md'
                      : 'bg-[#08090d] border-[#222735] text-slate-400 hover:border-[#343d52]'
                  }`}
                >
                  <img
                    src={p.avatarUrl}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-[#222735] shrink-0"
                  />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold truncate text-white">{p.name}</div>
                    <div className="text-[10px] text-slate-500">{p.position} | {p.overall} OVR</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#f5d77f] mr-auto shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* تفاصيل تقييم كل لاعب مختار */}
        {selectedPlayerIds.length > 0 && (
          <div className="space-y-4 border-t border-[#222735] pt-4 max-h-[350px] overflow-y-auto pr-1">
            {selectedPlayerIds.map((pId) => {
              const player = players.find((p) => p.id === pId);
              if (!player) return null;

              const rating = ratingsMap[pId] || 7.0;
              const isGK = player.position === 'GK';
              const skills = isGK ? GK_SKILLS_INFO : FIELD_SKILLS_INFO;
              const selectedSkill = highlightedSkillsMap[pId];

              const delta = rating - 6.0;
              const potentialPoints = delta > 0 ? (delta * 3.0).toFixed(1) : (delta * 1.5).toFixed(1);

              return (
                <div key={player.id} className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{player.name}</span>
                      <span className="text-[10px] text-[#f5d77f] bg-[#d4af37]/15 px-2 py-0.5 rounded-full border border-[#d4af37]/30">
                        {player.position}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">الدرجة:</span>
                      <span className="font-black text-sm text-[#f5d77f] font-['Changa',sans-serif]">
                        {rating} / 10
                      </span>
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${delta >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'}`}>
                        {delta >= 0 ? `+${potentialPoints} طاقة` : `${potentialPoints} طاقة`}
                      </span>
                    </div>
                  </div>

                  {/* شريط السحب لتحديد الدرجة من 1 إلى 10 */}
                  <div>
                    <input
                      type="range"
                      min="1.0"
                      max="10.0"
                      step="0.5"
                      value={rating}
                      onChange={(e) => handleRatingChange(player.id, parseFloat(e.target.value))}
                      className="w-full accent-[#d4af37] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>1.0 (ضعيف جداً)</span>
                      <span>6.0 (تعادل طبيعي)</span>
                      <span>10.0 (أسطوري خارق)</span>
                    </div>
                  </div>

                  {/* المهارة الأبرز التي تألق بها اللاعب (تنال الحصة الكبرى من النقاط) */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#f5d77f]" />
                      المهارة التي أبدع فيها اليوم (تحصل على النسبة الأكبر من التطور):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(skills).map(([key, info]) => {
                        const isChosen = selectedSkill === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleSkillHighlight(player.id, key)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition ${
                              isChosen
                                ? 'bg-[#d4af37] text-slate-950 border-[#f5d77f]'
                                : 'bg-[#161a23] border-[#222735] text-slate-300 hover:border-[#343d52]'
                            }`}
                          >
                            {info.iconBadge} ({info.code})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ميزة تعيين حكم ودي من اللاعبين وتقييم أدائه (سري ولا يظهر للعامة) */}
        <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#f5d77f]" />
              <span className="text-xs font-bold text-white">حكم المباراة الودي (من قائمة اللاعبين):</span>
            </div>
            <span className="text-[10px] bg-[#161a23] text-[#f5d77f] px-2.5 py-1 rounded-full border border-[#d4af37]/35 flex items-center gap-1 font-bold">
              <Lock className="w-2.5 h-2.5 text-[#f5d77f]" />
              تقييم داخلي خاص بالكباتن فقط (لا يظهر للعامة)
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            حدد زميلكم الذي أدار المباراة تحكيمياً. هذا التقييم يُحفظ في سجل داخلي سري للكباتن والمنظمين فقط لاختيار أفضل الحكام للمباريات الودية القادمة، <strong>ولا يُنشر في ملف اللاعب العام ولا يؤثر على طاقته الكروية (OVR)</strong>.
          </p>

          <div>
            <select
              value={friendlyRefereePlayerId}
              onChange={(e) => setFriendlyRefereePlayerId(e.target.value)}
              className="w-full bg-[#11141b] border border-[#222735] text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:border-[#d4af37] focus:outline-none"
            >
              <option value="">-- اختياري: اختر من أدار المباراة كحكم ودي من اللاعبين --</option>
              {players.map((p) => {
                const currentRating = p.internalRefereeProfile?.averageRating;
                return (
                  <option key={p.id} value={p.id} className="bg-[#08090d]">
                    {p.name} ({p.clubName} - {p.neighborhood})
                    {currentRating ? ` [⭐ تقييم داخلي: ${currentRating.toFixed(1)}/10]` : ' [مرشح جديد]'}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedRefereePlayer && (
            <div className="bg-[#11141b] p-3.5 rounded-2xl border border-[#222735] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1c222e]">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedRefereePlayer.avatar}
                    alt={selectedRefereePlayer.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#d4af37]/40"
                  />
                  <div>
                    <div className="font-bold text-white text-xs">{selectedRefereePlayer.name}</div>
                    <div className="text-[10px] text-slate-400">
                      فريق {selectedRefereePlayer.clubName} • حي {selectedRefereePlayer.neighborhood}
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  {selectedRefereePlayer.internalRefereeProfile ? (
                    <div className="bg-[#08090d] px-2.5 py-1 rounded-xl border border-[#d4af37]/30 text-center">
                      <div className="text-[9px] text-slate-400 flex items-center justify-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-[#f5d77f]" />
                        <span>التقييم الداخلي السابق:</span>
                      </div>
                      <span className="text-xs font-black text-[#f5d77f]">
                        ⭐ {selectedRefereePlayer.internalRefereeProfile.averageRating.toFixed(1)} / 10
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-lg">
                      أول مباراة كحكم ودي
                    </span>
                  )}
                </div>
              </div>

              {/* معايير التقييم الأربعة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1 bg-[#08090d] p-2.5 rounded-xl border border-[#222735]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">1. الحيادية والنزاهة:</span>
                    <span className="font-bold text-[#f5d77f]">{fairnessScore}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={fairnessScore}
                    onChange={(e) => setFairnessScore(parseFloat(e.target.value))}
                    className="w-full accent-[#d4af37]"
                  />
                </div>

                <div className="space-y-1 bg-[#08090d] p-2.5 rounded-xl border border-[#222735]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">2. إدارة الوقت وتوقف اللعب:</span>
                    <span className="font-bold text-[#f5d77f]">{timeManagementScore}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={timeManagementScore}
                    onChange={(e) => setTimeManagementScore(parseFloat(e.target.value))}
                    className="w-full accent-[#d4af37]"
                  />
                </div>

                <div className="space-y-1 bg-[#08090d] p-2.5 rounded-xl border border-[#222735]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">3. حسم الأخطاء والاحتسابات:</span>
                    <span className="font-bold text-[#f5d77f]">{foulDecisionsScore}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={foulDecisionsScore}
                    onChange={(e) => setFoulDecisionsScore(parseFloat(e.target.value))}
                    className="w-full accent-[#d4af37]"
                  />
                </div>

                <div className="space-y-1 bg-[#08090d] p-2.5 rounded-xl border border-[#222735]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">4. الهدوء والسيطرة على الأجواء:</span>
                    <span className="font-bold text-[#f5d77f]">{composureScore}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={composureScore}
                    onChange={(e) => setComposureScore(parseFloat(e.target.value))}
                    className="w-full accent-[#d4af37]"
                  />
                </div>
              </div>

              {/* المتوسط العام وملاحظات الكابتن السرية */}
              <div className="flex items-center justify-between bg-[#08090d] p-2.5 rounded-xl border border-[#d4af37]/30">
                <span className="text-xs text-slate-300 font-bold">التقييم العام لهذه المباراة:</span>
                <span className="text-sm font-black text-[#f5d77f] font-mono">⭐ {refOverall.toFixed(1)} / 10</span>
              </div>

              <div>
                <input
                  type="text"
                  value={privateRefNotes}
                  onChange={(e) => setPrivateRefNotes(e.target.value)}
                  placeholder="ملاحظات سرية للكباتن فقط حول أداء هذا الحكم الودي..."
                  className="w-full bg-[#08090d] border border-[#222735] text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* زر الاعتماد النهائي */}
        <div className="pt-2">
          {submittedSuccess ? (
            <div className="p-3.5 bg-[#d4af37] text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg">
              <Check className="w-4 h-4" />
              تم حفظ التقييم الأعمى وتحديث بطاقات اللاعبين بمعادلة (×3) وتصفية أي تقييمات شاذة بنجاح!
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={selectedPlayerIds.length === 0}
              className={`w-full py-3 rounded-2xl font-black text-xs md:text-sm transition flex items-center justify-center gap-2 shadow-lg ${
                selectedPlayerIds.length > 0
                  ? 'gold-gradient-btn'
                  : 'bg-[#161a23] text-slate-600 cursor-not-allowed'
              }`}
            >
              <EyeOff className="w-4 h-4 text-slate-950" />
              <span>إرسال التقييم الأعمى وتحديث البطاقات فوراً</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
