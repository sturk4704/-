import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../types';
import {
  renderFifaCardToCanvas,
  captureElementToPng,
  downloadDataUrl,
  copyBlobToClipboard,
  shareCardFile,
  ExportOptions,
} from '../utils/cardExportEngine';
import {
  Download,
  Share2,
  Copy,
  Check,
  X,
  Sparkles,
  Layers,
  Image as ImageIcon,
  MessageCircle,
  Twitter,
  Send,
  Loader2,
  ShieldCheck,
  Sliders,
} from 'lucide-react';

interface CardExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  cardElementRef?: HTMLElement | null;
}

export const CardExportModal: React.FC<CardExportModalProps> = ({
  isOpen,
  onClose,
  player,
  cardElementRef,
}) => {
  const [background, setBackground] = useState<'stadium' | 'transparent' | 'carbon'>('stadium');
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [activeMethod, setActiveMethod] = useState<'canvas' | 'dom'>('canvas');

  // Trigger generation whenever options or player change
  useEffect(() => {
    if (isOpen && player) {
      generateImage();
    } else {
      setGeneratedImageUrl(null);
      setGeneratedBlob(null);
    }
  }, [isOpen, player, background, includeWatermark, activeMethod]);

  if (!isOpen || !player) return null;

  const generateImage = async () => {
    setIsGenerating(true);
    setCopiedSuccess(false);
    setShareSuccess(false);

    try {
      let dataUrl: string = '';

      if (activeMethod === 'dom' && cardElementRef) {
        // Capture DOM element using html-to-image
        dataUrl = await captureElementToPng(cardElementRef, {
          pixelRatio: 3,
          backgroundColor: background === 'transparent' ? null : (background === 'carbon' ? '#08090d' : '#0c0f17'),
        });
      } else {
        // High-precision canvas renderer with perfect geometry and gradients
        dataUrl = await renderFifaCardToCanvas(player, {
          background,
          includeWatermark,
          scale: 2.5,
        });
      }

      setGeneratedImageUrl(dataUrl);

      // Convert dataUrl to blob for Web Share & Clipboard
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      setGeneratedBlob(blob);
    } catch (err) {
      console.error('Error generating card image:', err);
      // Fallback to canvas
      try {
        const fallbackUrl = await renderFifaCardToCanvas(player, {
          background,
          includeWatermark,
          scale: 2,
        });
        setGeneratedImageUrl(fallbackUrl);
        const res = await fetch(fallbackUrl);
        const blob = await res.blob();
        setGeneratedBlob(blob);
      } catch (fallbackErr) {
        console.error('Fallback export failed:', fallbackErr);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    const filename = `KooraCard_${player.name.replace(/\s+/g, '_')}_${player.overall}OVR.png`;
    downloadDataUrl(generatedImageUrl, filename);
  };

  const handleCopy = async () => {
    if (!generatedBlob) return;
    const success = await copyBlobToClipboard(generatedBlob);
    if (success) {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    }
  };

  const handleNativeShare = async () => {
    if (!generatedBlob) return;
    const shared = await shareCardFile(generatedBlob, player);
    if (shared) {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } else {
      // If Web Share not supported or user cancelled, fallback to WhatsApp
      handleWhatsAppShare();
    }
  };

  const shareText = `🔥 بطاقتي الرسمية لكرة القدم في كابتن جدة!\nاللاعب: ${player.name}\nالمعدل: ${player.overall} OVR\nالمركز: ${player.position} | الحي: ${player.neighborhood}\nسجل الآن وقيم أداءك:`;
  const shareUrl = window.location.href;

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=كابتن_جدة,KooraCard,كرة_قدم`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0d1017] border border-[#222735] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-right">
        {/* رأس النافذة */}
        <div className="p-4 sm:p-5 bg-[#11141b] border-b border-[#222735] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#c59b27] via-[#f5d77f] to-[#9e7922] p-0.5 shadow-lg shadow-[#c59b27]/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#08090d] rounded-[14px] flex items-center justify-center">
                <Share2 className="w-5 h-5 text-[#f5d77f]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-['Changa',sans-serif] text-white">
                  تصدير ومشاركة بطاقة اللاعب (PNG)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/35">
                  HD EXPORT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تصدير بطاقة فيفا ثلاثية الأبعاد بدقة فائقة للمشاركة في ستوري إنستغرام، واتساب، وتويتر
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#161a24] hover:bg-[#1f2433] text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* محتوى النافذة */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* الجانب الأيمن: معاينة الصورة المصدرة */}
          <div className="md:col-span-6 flex flex-col items-center justify-center bg-[#08090d] rounded-2xl p-4 border border-[#1c222e] relative min-h-[380px]">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-16 text-center">
                <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
                <span className="text-xs font-bold text-[#f5d77f]">جاري إنشاء بطاقة فيفا فائقة الدقة...</span>
                <span className="text-[10px] text-slate-400">معالجة التدرجات الذهبية والقص الدائري</span>
              </div>
            ) : generatedImageUrl ? (
              <div className="relative group w-full flex flex-col items-center">
                <div
                  className={`rounded-2xl overflow-hidden p-2 transition-transform duration-300 shadow-2xl flex items-center justify-center max-h-[460px] ${
                    background === 'transparent' ? 'bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:10px_10px]' : ''
                  }`}
                >
                  <img
                    src={generatedImageUrl}
                    alt={player.name}
                    className="max-h-[440px] w-auto object-contain rounded-xl drop-shadow-2xl"
                  />
                </div>

                <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-[#11141b] px-3 py-1 rounded-full border border-[#222735]">
                  <span>PNG عالي الدقة (900x1350px)</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">{player.cardTier.toUpperCase()} TIER</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs py-12">تعذر توليد المعاينة</div>
            )}
          </div>

          {/* الجانب الأيسر: خيارات التخصيص وأزرار الإجراء */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-5">
            {/* خيارات التخصيص */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#d4af37]" />
                  نمط خلفية البطاقة:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'stadium', label: 'الملعب الليلي', desc: 'إضاءة فاخرة' },
                    { id: 'transparent', label: 'شفافة مفرغة', desc: 'للتصميم والستوري' },
                    { id: 'carbon', label: 'فحم داكن', desc: 'أناقة وبساطة' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setBackground(bg.id as any)}
                      className={`p-2.5 rounded-xl border text-right transition ${
                        background === bg.id
                          ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5d77f]'
                          : 'bg-[#11141b] border-[#222735] text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold block">{bg.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{bg.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* تبديل الشعار والعلامة الرسمية */}
              <div className="bg-[#11141b] p-3 rounded-xl border border-[#222735] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">شعار منصة كابتن جدة</span>
                  <span className="text-[10px] text-slate-400 block">إضافة العلامة الرسمية للمنظومة أسفل البطاقة</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeWatermark(!includeWatermark)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    includeWatermark ? 'bg-[#d4af37]' : 'bg-[#222735]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-[#08090d] transition-transform ${
                      includeWatermark ? 'translate-x-0' : '-translate-x-5'
                    }`}
                  />
                </button>
              </div>

              {/* بيانات اللاعب المصدرة */}
              <div className="bg-[#11141b] p-3.5 rounded-xl border border-[#222735] space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#1c222e]">
                  <span className="text-slate-400">اللاعب:</span>
                  <span className="font-bold text-white">{player.name} (#{player.number})</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#1c222e]">
                  <span className="text-slate-400">المعدل العام والمركز:</span>
                  <span className="font-bold text-[#f5d77f] font-mono">{player.overall} OVR - {player.position}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">الفريق والحي:</span>
                  <span className="font-semibold text-slate-200">{player.clubName} ({player.neighborhood})</span>
                </div>
              </div>
            </div>

            {/* أزرار التحميل والمشاركة الرئيسية */}
            <div className="space-y-2.5 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* زر التنزيل المباشر */}
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!generatedImageUrl || isGenerating}
                  className="w-full gold-gradient-btn py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>تحميل كصورة PNG</span>
                </button>

                {/* زر المشاركة عبر نظام الهاتف / المتصفح */}
                <button
                  type="button"
                  onClick={handleNativeShare}
                  disabled={!generatedBlob || isGenerating}
                  className="w-full py-3 px-4 rounded-xl bg-[#161a24] hover:bg-[#202637] text-white border border-[#2e374a] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {shareSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">تمت المشاركة!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-[#d4af37]" />
                      <span>مشاركة عبر التطبيقات</span>
                    </>
                  )}
                </button>
              </div>

              {/* زر نسخ الصورة إلى الحافظة */}
              <button
                type="button"
                onClick={handleCopy}
                disabled={!generatedBlob || isGenerating}
                className="w-full py-2.5 px-4 rounded-xl bg-[#11141b] hover:bg-[#181d28] text-slate-300 hover:text-white border border-[#222735] text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">تم نسخ الصورة إلى الحافظة بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>نسخ الصورة للحافظة (Copy Image)</span>
                  </>
                )}
              </button>

              {/* أزرار المشاركة الاجتماعية المباشرة */}
              <div className="pt-2 border-t border-[#1c222e]">
                <span className="text-[10px] text-slate-400 block mb-2">مشاركة مباشرة وسريعة:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#075e54]/30 hover:bg-[#075e54]/50 border border-[#25d366]/40 text-[#25d366] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>واتساب</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTwitterShare}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#1d9bf0]/20 hover:bg-[#1d9bf0]/30 border border-[#1d9bf0]/40 text-[#1d9bf0] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>إكس / تويتر</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTelegramShare}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#229ed9]/20 hover:bg-[#229ed9]/30 border border-[#229ed9]/40 text-[#229ed9] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>تيليجرام</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
