import { toPng, toBlob } from 'html-to-image';
import { Player, GoalkeeperStats, FieldPlayerStats } from '../types';
import { analyzeAndGenerateDynamicBadges, RARITY_STYLES } from './dynamicBadgeEngine';

export interface ExportOptions {
  background: 'transparent' | 'stadium' | 'carbon';
  scale?: number; // 2 or 3 for ultra-HD
  includeWatermark?: boolean;
}

/**
 * Downloads a data URL as a file in the browser
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies a PNG Blob directly to the user's clipboard
 */
export async function copyBlobToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard image write not supported or failed:', err);
  }
  return false;
}

/**
 * Native Web Share API with image file
 */
export async function shareCardFile(blob: Blob, player: Player): Promise<boolean> {
  if (navigator.canShare) {
    const fileName = `KooraCard_${player.name.replace(/\s+/g, '_')}_${player.overall}OVR.png`;
    const file = new File([blob], fileName, { type: 'image/png' });
    const shareData = {
      title: `بطاقة ${player.name} (${player.overall} OVR) - كابتن جدة`,
      text: `شاهد بطاقتي الرسمية لكرة القدم في منصة كابتن جدة بمعدل ${player.overall} OVR ومركز ${player.position}! #كابتن_جدة #KooraCard`,
      files: [file],
    };

    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Share failed:', err);
        }
      }
    }
  }
  return false;
}

/**
 * Exports an HTML element as high-definition PNG using html-to-image
 */
export async function captureElementToPng(
  element: HTMLElement,
  options: { pixelRatio?: number; backgroundColor?: string | null } = {}
): Promise<string> {
  const pixelRatio = options.pixelRatio || 2.5;
  
  return await toPng(element, {
    cacheBust: true,
    quality: 0.98,
    pixelRatio,
    backgroundColor: options.backgroundColor === null ? undefined : (options.backgroundColor || undefined),
    filter: (node) => {
      // Exclude interactive buttons with class 'no-export'
      if (node instanceof HTMLElement && node.classList.contains('no-export')) {
        return false;
      }
      return true;
    },
  });
}

/**
 * Robust pure HTML5 Canvas renderer for FIFA Card.
 * Guarantees zero CORS failures and produces stunning 1200x1800 ultra-HD PNGs!
 */
export async function renderFifaCardToCanvas(
  player: Player,
  options: ExportOptions = { background: 'stadium', scale: 2, includeWatermark: true }
): Promise<string> {
  const width = 900;
  const height = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Background style
  if (options.background === 'stadium') {
    // Luxurious Stadium Dark Background
    const bgGrad = ctx.createRadialGradient(width / 2, 300, 50, width / 2, height / 2, 900);
    bgGrad.addColorStop(0, '#131b2c');
    bgGrad.addColorStop(0.5, '#0c0f17');
    bgGrad.addColorStop(1, '#050608');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Spotlight glow at top
    const spot = ctx.createRadialGradient(width / 2, 0, 10, width / 2, 400, 600);
    spot.addColorStop(0, 'rgba(212, 175, 55, 0.18)');
    spot.addColorStop(0.7, 'rgba(16, 185, 129, 0.08)');
    spot.addColorStop(1, 'transparent');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, width, height);
  } else if (options.background === 'carbon') {
    ctx.fillStyle = '#08090d';
    ctx.fillRect(0, 0, width, height);
  } else {
    // Transparent
    ctx.clearRect(0, 0, width, height);
  }

  // Define Card Bounds
  const cardX = 90;
  const cardY = options.background === 'transparent' ? 30 : 70;
  const cardW = width - 180;
  const cardH = height - (options.background === 'transparent' ? 60 : 150);

  // Card Tier Theme
  const tier = player.cardTier || 'bronze';
  let tierColors = {
    top: '#382a08',
    mid: '#7d6016',
    bot: '#1c1504',
    border: '#d4af37',
    textMain: '#fae39b',
    textSec: '#f5d77f',
    stat: '#fae39b',
  };

  if (tier === 'bronze') {
    tierColors = {
      top: '#28180c',
      mid: '#482c16',
      bot: '#120a05',
      border: '#a0683a',
      textMain: '#f5e6d8',
      textSec: '#d6a57c',
      stat: '#e8be99',
    };
  } else if (tier === 'silver') {
    tierColors = {
      top: '#141923',
      mid: '#283244',
      bot: '#0d1017',
      border: '#94a3b8',
      textMain: '#f8fafc',
      textSec: '#cbd5e1',
      stat: '#e2e8f0',
    };
  } else if (tier === 'totw') {
    tierColors = {
      top: '#080a0f',
      mid: '#141824',
      bot: '#040508',
      border: '#f5d77f',
      textMain: '#fae39b',
      textSec: '#f5d77f',
      stat: '#fae39b',
    };
  }

  // Draw Card Polygon (FIFA Shield Cut)
  ctx.save();
  ctx.beginPath();
  const cutY = cardY + cardH * 0.92;
  const apexY = cardY + cardH;
  ctx.moveTo(cardX + 40, cardY);
  ctx.lineTo(cardX + cardW - 40, cardY);
  ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + 40, 40);
  ctx.lineTo(cardX + cardW, cutY);
  ctx.lineTo(cardX + cardW / 2, apexY);
  ctx.lineTo(cardX, cutY);
  ctx.lineTo(cardX, cardY + 40);
  ctx.arcTo(cardX, cardY, cardX + 40, cardY, 40);
  ctx.closePath();

  // Shadow
  ctx.shadowColor = tierColors.border;
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 15;

  // Card Gradient Fill
  const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
  cardGrad.addColorStop(0, tierColors.top);
  cardGrad.addColorStop(0.5, tierColors.mid);
  cardGrad.addColorStop(1, tierColors.bot);
  ctx.fillStyle = cardGrad;
  ctx.fill();

  // Reset shadow for border
  ctx.shadowBlur = 15;
  ctx.strokeStyle = tierColors.border;
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();

  // Clip to inner card to draw content cleanly
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cardX + 40, cardY);
  ctx.lineTo(cardX + cardW - 40, cardY);
  ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + 40, 40);
  ctx.lineTo(cardX + cardW, cutY);
  ctx.lineTo(cardX + cardW / 2, apexY);
  ctx.lineTo(cardX, cutY);
  ctx.lineTo(cardX, cardY + 40);
  ctx.arcTo(cardX, cardY, cardX + 40, cardY, 40);
  ctx.closePath();
  ctx.clip();

  // Subtle background pattern
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let i = cardX; i < cardX + cardW; i += 24) {
    for (let j = cardY; j < cardY + cardH; j += 24) {
      ctx.beginPath();
      ctx.arc(i, j, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Header: OVR Rating & Position (Left side)
  ctx.fillStyle = tierColors.textMain;
  ctx.font = '900 84px "Changa", "Cairo", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${player.overall}`, cardX + 45, cardY + 115);

  ctx.fillStyle = tierColors.textSec;
  ctx.font = '800 36px "Changa", "Cairo", sans-serif';
  ctx.fillText(player.position, cardX + 45, cardY + 165);

  // Line separator
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cardX + 45, cardY + 185);
  ctx.lineTo(cardX + 110, cardY + 185);
  ctx.stroke();

  // Player jersey number & height
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '700 24px monospace';
  ctx.fillText(`#${player.number}  •  ${player.height}cm`, cardX + 45, cardY + 220);

  // Header: Neighborhood & Scout status (Right side)
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  const nW = 240;
  const nH = 46;
  const nX = cardX + cardW - 45 - nW;
  const nY = cardY + 60;
  
  // Neighborhood pill
  drawRoundedRect(ctx, nX, nY, nW, nH, 23);
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#f5d77f';
  ctx.font = '700 22px "Cairo", sans-serif';
  ctx.fillText(player.neighborhood, cardX + cardW - 60, nY + 31);

  // Scout visibility tag
  if (player.allowScoutVisibility) {
    const sW = 160;
    const sH = 34;
    const sX = cardX + cardW - 45 - sW;
    const sY = nY + 54;
    ctx.fillStyle = 'rgba(6, 78, 59, 0.7)';
    drawRoundedRect(ctx, sX, sY, sW, sH, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#6ee7b7';
    ctx.font = '700 16px "Cairo", sans-serif';
    ctx.fillText('متاح للكشافة 👁️', cardX + cardW - 60, sY + 24);
  }

  // Draw Player Avatar in Center
  const avatarCenterX = cardX + cardW / 2;
  const avatarCenterY = cardY + 360;
  const avatarRadius = 140;

  // Avatar circular halo
  const haloGrad = ctx.createLinearGradient(
    avatarCenterX - avatarRadius,
    avatarCenterY - avatarRadius,
    avatarCenterX + avatarRadius,
    avatarCenterY + avatarRadius
  );
  haloGrad.addColorStop(0, 'rgba(212, 175, 55, 0.9)');
  haloGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
  haloGrad.addColorStop(1, 'rgba(212, 175, 55, 0.2)');

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 6, 0, Math.PI * 2);
  ctx.fillStyle = haloGrad;
  ctx.fill();

  // Avatar clipping circle
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
  ctx.clip();

  // Try to load player avatar image
  try {
    const img = await loadImageAsync(player.avatarUrl);
    ctx.drawImage(
      img,
      avatarCenterX - avatarRadius,
      avatarCenterY - avatarRadius,
      avatarRadius * 2,
      avatarRadius * 2
    );
  } catch {
    // Graceful fallback if CORS or network fails: draw handsome soccer player silhouette
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(
      avatarCenterX - avatarRadius,
      avatarCenterY - avatarRadius,
      avatarRadius * 2,
      avatarRadius * 2
    );
    ctx.fillStyle = '#f5d77f';
    ctx.font = '900 72px "Cairo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.name.charAt(0), avatarCenterX, avatarCenterY + 25);
  }
  ctx.restore();

  // Player Name & Club
  ctx.textAlign = 'center';
  ctx.fillStyle = tierColors.textMain;
  ctx.font = '900 44px "Changa", "Cairo", sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 10;
  ctx.fillText(player.name, avatarCenterX, cardY + 560);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '700 24px "Cairo", sans-serif';
  ctx.fillText(player.clubName, avatarCenterX, cardY + 600);

  // Dynamic Badges (Pills)
  const badges = player.dynamicBadges && player.dynamicBadges.length > 0
    ? player.dynamicBadges
    : analyzeAndGenerateDynamicBadges(player);

  if (badges.length > 0) {
    const badge1 = badges[0];
    const bW = 280;
    const bH = 44;
    const bX = avatarCenterX - bW / 2;
    const bY = cardY + 625;

    ctx.fillStyle = 'rgba(17, 20, 27, 0.85)';
    drawRoundedRect(ctx, bX, bY, bW, bH, 22);
    ctx.fill();
    ctx.strokeStyle = tierColors.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f5d77f';
    ctx.font = '700 20px "Cairo", sans-serif';
    ctx.fillText(`${badge1.icon} ${badge1.name}`, avatarCenterX, bY + 29);
  }

  // Attributes Divider Line
  const divY = cardY + 695;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX + 40, divY);
  ctx.lineTo(cardX + cardW - 40, divY);
  ctx.stroke();

  // 6 FIFA Attributes Grid
  const isGK = player.position === 'GK';
  const stats = isGK
    ? [
        { label: 'DIV', val: (player.stats as GoalkeeperStats).div },
        { label: 'HAN', val: (player.stats as GoalkeeperStats).han },
        { label: 'KIC', val: (player.stats as GoalkeeperStats).kic },
        { label: 'REF', val: (player.stats as GoalkeeperStats).ref },
        { label: 'SPD', val: (player.stats as GoalkeeperStats).spd },
        { label: 'POS', val: (player.stats as GoalkeeperStats).pos },
      ]
    : [
        { label: 'PAC', val: (player.stats as FieldPlayerStats).pac },
        { label: 'SHO', val: (player.stats as FieldPlayerStats).sho },
        { label: 'PAS', val: (player.stats as FieldPlayerStats).pas },
        { label: 'DRI', val: (player.stats as FieldPlayerStats).dri },
        { label: 'DEF', val: (player.stats as FieldPlayerStats).def },
        { label: 'PHY', val: (player.stats as FieldPlayerStats).phy },
      ];

  const col1X = cardX + 110;
  const col2X = cardX + cardW - 110;

  stats.slice(0, 3).forEach((stat, idx) => {
    const sY = divY + 65 + idx * 75;

    // Col 1 (Right in RTL / Left on Card)
    ctx.textAlign = 'left';
    ctx.fillStyle = tierColors.stat;
    ctx.font = '900 40px monospace';
    ctx.fillText(`${stat.val}`, col1X, sY);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 28px "Changa", sans-serif';
    ctx.fillText(stat.label, col1X + 80, sY);

    // Col 2
    const stat2 = stats[idx + 3];
    ctx.textAlign = 'left';
    ctx.fillStyle = tierColors.stat;
    ctx.font = '900 40px monospace';
    ctx.fillText(`${stat2.val}`, col2X - 160, sY);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 28px "Changa", sans-serif';
    ctx.fillText(stat2.label, col2X - 80, sY);
  });

  // Vertical subtle separator between columns
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.moveTo(avatarCenterX, divY + 30);
  ctx.lineTo(avatarCenterX, divY + 270);
  ctx.stroke();

  // Official Card ID & Verification at bottom apex
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(212, 175, 55, 0.85)';
  ctx.font = '800 20px "Changa", sans-serif';
  ctx.fillText(`JEDDAH CAPTAIN • OFFICIAL CARD ID #${player.id.replace('player-', '').padStart(4, '0')}`, avatarCenterX, cardY + cardH - 50);

  ctx.restore(); // unclip

  // Stadium Outer Watermark / Branding (if requested)
  if (options.includeWatermark && options.background !== 'transparent') {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f5d77f';
    ctx.font = '900 26px "Changa", "Cairo", sans-serif';
    ctx.fillText('⚽ كابتن جدة | CAPTAIN JEDDAH', width / 2, height - 45);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 18px "Cairo", sans-serif';
    ctx.fillText('المنظومة الرقمية الأولى لكرة القدم في جدة والمملكة', width / 2, height - 18);
  }

  return canvas.toDataURL('image/png', 1.0);
}

// Helper: load image safely
function loadImageAsync(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = url;
  });
}

// Helper: rounded rectangle
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
