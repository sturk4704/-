import React, { useState } from 'react';
import { TransferRequest, Player } from '../types';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  XCircle, 
  MessageCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Shield, 
  UserCheck, 
  UserPlus, 
  Trophy, 
  Sparkles,
  Inbox
} from 'lucide-react';

interface TransferInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: TransferRequest[];
  onAcceptRequest: (request: TransferRequest) => void;
  onDeclineRequest: (requestId: string) => void;
  onMarkAllAsRead: () => void;
  onShowToast: (message: string) => void;
}

export const TransferInboxModal: React.FC<TransferInboxModalProps> = ({
  isOpen,
  onClose,
  requests,
  onAcceptRequest,
  onDeclineRequest,
  onMarkAllAsRead,
  onShowToast,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');

  if (!isOpen) return null;

  const unreadCount = requests.filter((r) => !r.read).length;

  const filteredRequests = requests.filter((r) => {
    if (filterTab === 'all') return true;
    return r.status === filterTab;
  });

  const getStatusBadge = (status: TransferRequest['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم القبول والانضمام</span>
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>اعتذر عن العرض</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>قيد مراجعة الكابتن</span>
          </span>
        );
    }
  };

  const getTypeLabel = (type: TransferRequest['requestType']) => {
    switch (type) {
      case 'permanent_signing':
        return { label: 'انضمام دائم ورسمي', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'match_trial':
        return { label: 'مباراة تجريبية (Trial)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'tournament_guest':
        return { label: 'مشاركة ببطولة ودية', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      default:
        return { label: 'طلب انضمام', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const handleWhatsAppChat = (req: TransferRequest) => {
    const text = encodeURIComponent(
      `مرحباً كابتن ${req.senderCaptainName}، بخصوص طلب انضمام اللاعب [${req.playerName}] لفريق [${req.senderTeamName}]...`
    );
    window.open(`https://wa.me/966${req.senderPhone.replace(/^0/, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#0e1117] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden my-6 text-right flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* شريط الإضاءة */}
        <div className="h-1.5 bg-gradient-to-r from-[#c59b27] via-[#f5d77f] to-[#9e7922]" />

        {/* رأس النافذة */}
        <div className="p-5 sm:p-6 border-b border-[#1c222e] flex items-center justify-between bg-[#11141b]/95">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#d4af37]/20 to-[#f5d77f]/10 border border-[#d4af37]/40 flex items-center justify-center text-[#f5d77f]">
              <Inbox className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white font-black text-[10px] rounded-full flex items-center justify-center border-2 border-[#0e1117] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  صندوق طلبات الانتقال وإشعارات الكباتن
                </h2>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                    {unreadCount} طلب جديد
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                متابعة وإدارة طلبات استقطاب اللاعبين الأحرار والرد عليها بالقبول أو الاعتذار
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="hidden sm:inline-flex text-[11px] font-bold text-[#f5d77f] hover:underline px-2.5 py-1 bg-[#d4af37]/10 rounded-lg border border-[#d4af37]/20"
              >
                تحديد الكل كمقروء
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#1c222e] hover:bg-[#252c3b] text-slate-400 hover:text-white flex items-center justify-center transition border border-[#2b3345]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* فلاتر التبويب */}
        <div className="px-5 sm:px-6 py-3 border-b border-[#1c222e] bg-[#0c0e14] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[
              { id: 'all', label: `الكل (${requests.length})` },
              { id: 'pending', label: `قيد الانتظار (${requests.filter((r) => r.status === 'pending').length})` },
              { id: 'accepted', label: `المقبولة (${requests.filter((r) => r.status === 'accepted').length})` },
              { id: 'declined', label: `المعتذر عنها (${requests.filter((r) => r.status === 'declined').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  filterTab === tab.id
                    ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/50 shadow-sm'
                    : 'bg-[#11141b] text-slate-400 border border-[#1f2533] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="sm:hidden text-[10px] font-bold text-[#f5d77f] px-2 py-1 bg-[#d4af37]/10 rounded-lg whitespace-nowrap"
            >
              تحديد كمقروء
            </button>
          )}
        </div>

        {/* قائمة الطلبات */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {filteredRequests.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#141824] border border-[#222736] flex items-center justify-center mx-auto mb-3 text-slate-500">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-200">لا توجد طلبات انضمام في هذا القسم حالياً</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                يمكنك التوجه إلى سوق الانتقالات وتصفية اللاعبين الأحرار لإرسال عروض استقطاب جديدة لفرقك.
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const typeInfo = getTypeLabel(req.requestType);
              return (
                <div
                  key={req.id}
                  className={`bg-[#11141b] border rounded-2xl p-4 sm:p-5 transition-all duration-200 space-y-4 ${
                    !req.read
                      ? 'border-[#d4af37]/50 shadow-lg shadow-[#d4af37]/5 bg-gradient-to-b from-[#161a24] to-[#11141b]'
                      : 'border-[#222735] hover:border-[#2f374a]'
                  }`}
                >
                  {/* رأس الطلب: بيانات اللاعب والفريق الطالب */}
                  <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={req.playerAvatarUrl}
                          alt={req.playerName}
                          className="w-12 h-12 rounded-2xl object-cover border border-[#d4af37]/50 shadow"
                        />
                        <span className="absolute -bottom-1 -left-1 bg-[#08090d] text-[#f5d77f] font-black text-[9px] px-1 rounded border border-[#d4af37]/40">
                          {req.playerPosition}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-black text-white">{req.playerName}</h4>
                          <span className="text-[11px] bg-[#d4af37] text-slate-950 font-black px-1.5 py-0.2 rounded">
                            {req.playerOverall} OVR
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{req.playerNeighborhood}</span>
                          <span>•</span>
                          <span>{req.playerAge} سنة</span>
                          <span>•</span>
                          <span className="text-slate-500">{req.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>
                  </div>

                  {/* تفاصيل العرض: الفريق والكابتن والموعد */}
                  <div className="bg-[#0b0d13] border border-[#1d222e] rounded-xl p-3 sm:p-3.5 space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-[#f5d77f]" />
                        <span className="text-slate-400">الفريق الطالب:</span>
                        <span className="font-bold text-white">{req.senderTeamName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#f5d77f]" />
                        <span className="text-slate-400">الكابتن:</span>
                        <span className="font-bold text-white">{req.senderCaptainName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-[#f5d77f]" />
                        <span className="text-slate-400">المركز المقترح:</span>
                        <span className="font-bold text-amber-300">
                          {req.proposedRole} {req.proposedShirtNumber ? `(#${req.proposedShirtNumber})` : ''}
                        </span>
                      </div>
                    </div>

                    {(req.matchOrTrialDate || req.senderPitch) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5 border-t border-[#181d28] text-slate-400">
                        {req.matchOrTrialDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#f5d77f]" />
                            <span>الموعد المقترح:</span>
                            <span className="text-white font-medium">
                              {req.matchOrTrialDate} {req.matchOrTrialTime ? `(الساعة ${req.matchOrTrialTime})` : ''}
                            </span>
                          </div>
                        )}
                        {req.senderPitch && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#f5d77f]" />
                            <span>الملعب:</span>
                            <span className="text-white font-medium">{req.senderPitch}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* نص الرسالة */}
                    {req.messageNotes && (
                      <div className="pt-2 border-t border-[#181d28] text-slate-300 text-xs italic leading-relaxed">
                        "{req.messageNotes}"
                      </div>
                    )}
                  </div>

                  {/* إجراءات الكابتن المعني */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                    <button
                      onClick={() => handleWhatsAppChat(req)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>محادثة الكابتن واتساب</span>
                    </button>

                    {req.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDeclineRequest(req.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>اعتذار عن الطلب</span>
                        </button>

                        <button
                          onClick={() => onAcceptRequest(req)}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#f5d77f] to-[#9e7922] text-slate-950 text-xs font-black shadow-md shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>قبول الانضمام وتأكيد الانتقال</span>
                        </button>
                      </div>
                    ) : req.status === 'accepted' ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم انضمام اللاعب إلى فريق [{req.senderTeamName}] بنجاح!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-rose-400 font-bold">
                        <XCircle className="w-4 h-4" />
                        <span>تم تقديم الاعتذار عن هذا العرض.</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
