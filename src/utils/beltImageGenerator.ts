import { Championship, BeltPlateStyle, BeltStrapColor } from '../types';

/**
 * Pre-generated high-fidelity visual assets created via AI image generation.
 */
export const PREGENERATED_BELT_ASSETS: Record<string, string> = {
  'apw-world': '/src/assets/images/apw_world_belt_1791101575507.jpg',
  'apw-ic': '/src/assets/images/apw_ic_belt_1791101587067.jpg',
  'apw-womens': '/src/assets/images/apw_women_belt_1791101597228.jpg',
  'apw-tag': '/src/assets/images/apw_tag_belts_1791101609041.jpg',
};

export interface BeltCustomizationOptions {
  plateFinish?: '24K Gold' | 'Platinum White Gold' | 'Antique Bronze' | 'Rose Gold' | 'Blackened Steel';
  strapColor?: BeltStrapColor;
  plateStyle?: BeltPlateStyle;
  gemstoneType?: 'Diamonds' | 'Rubies' | 'Emeralds' | 'Sapphires' | 'Amethysts';
  promotionNameText?: string;
  titleNameText?: string;
  leatherTexture?: 'Smooth Nappa' | 'Crocodile Grain' | 'Distressed Vintage';
  styleTheme?: string;
}

/**
 * Constructs an AI prompt tailored to the promotion's name and style for belt generation.
 */
export function generateBeltPrompt(
  title: Partial<Championship>,
  promotionName: string = 'Apex Pro Wrestling',
  promotionStyle: string = 'Mainstream Giant',
  options?: BeltCustomizationOptions
): string {
  const strap = options?.strapColor || title.strapColor || 'Classic Black';
  const plate = options?.plateStyle || title.plateStyle || 'Big Gold Classic';
  const finish = options?.plateFinish || '24K Gold';
  const gems = options?.gemstoneType || 'Diamonds & Rubies';
  const isTag = Boolean(title.isTagTeam || title.division === 'Tag Team');

  let styleDescriptor = 'luxurious sports entertainment aesthetic, gleaming high-gloss studio lighting';
  if (promotionStyle.toLowerCase().includes('strong style') || promotionStyle.toLowerCase().includes('japanese')) {
    styleDescriptor = 'traditional Japanese heavyweight fighting championship, heavy solid brass, brushed steel, lion heraldry, battle-tested prestige';
  } else if (promotionStyle.toLowerCase().includes('lucha') || promotionStyle.toLowerCase().includes('flyer')) {
    styleDescriptor = 'ornate Mexican lucha libre heritage, Aztec sun calendar engravings, vibrant dual-tone leather craft, aerodynamic wings';
  } else if (promotionStyle.toLowerCase().includes('hardcore') || promotionStyle.toLowerCase().includes('brawler')) {
    styleDescriptor = 'gritty underground deathmatch championship, scarred industrial metal plates, barbed wire engravings, brutal battle-worn patina';
  } else if (promotionStyle.toLowerCase().includes('old-school') || promotionStyle.toLowerCase().includes('rasslin')) {
    styleDescriptor = 'legendary 1980s territory wrestling belt, deep relief floral scrollwork, authentic rope border, classic globe centerpiece';
  }

  const tagSubject = isTag 
    ? 'A pair of twin matching professional wrestling tag team championship belts displayed side-by-side' 
    : 'A professional wrestling championship belt centered in frame';

  return `${tagSubject}, created for "${promotionName}" (${promotionStyle} style). Title name: "${title.name || 'World Championship'}". Featuring an ornate multi-tiered center plate in ${finish} with ${plate} relief motif, engraved banners reading "${promotionName}" and "${title.shortName || title.name || 'CHAMPION'}", accented with faceted ${gems}. Premium ${strap} textured leather strap with matching engraved side plates and metallic tip. Studio lighting on dark luxury display velvet, ultra-detailed 8k, ${styleDescriptor}, photorealistic.`;
}

/**
 * Generates an SVG Data URL representing a unique, dynamic championship belt visual asset
 * procedurally designed for the promotion and championship specification.
 */
export function generateDynamicBeltSvg(
  title: Partial<Championship>,
  promotionName: string = 'Apex Pro Wrestling',
  promotionStyle: string = 'Mainstream Giant',
  options?: BeltCustomizationOptions
): string {
  const strapColorName = options?.strapColor || title.strapColor || 'Classic Black';
  const plateStyleName = options?.plateStyle || title.plateStyle || 'Big Gold Classic';
  const finish = options?.plateFinish || (title.type === "Women's" ? 'Rose Gold' : '24K Gold');
  const promoText = (options?.promotionNameText || promotionName).toUpperCase();
  const titleText = (options?.titleNameText || title.shortName || title.name || 'CHAMPIONSHIP').toUpperCase();
  const prestige = title.prestige || 80;
  const isTag = Boolean(title.isTagTeam || title.division === 'Tag Team');

  // Strap colors
  let strapBase = '#18181b';
  let strapShine = '#27272a';
  let strapBorder = '#09090b';
  let stitchColor = '#3f3f46';

  switch (strapColorName) {
    case 'Pure White':
      strapBase = '#e4e4e7';
      strapShine = '#ffffff';
      strapBorder = '#a1a1aa';
      stitchColor = '#d4d4d8';
      break;
    case 'Crimson Red':
      strapBase = '#7f1d1d';
      strapShine = '#991b1b';
      strapBorder = '#450a0a';
      stitchColor = '#b91c1c';
      break;
    case 'Midnight Blue':
      strapBase = '#172554';
      strapShine = '#1e3a8a';
      strapBorder = '#0f172a';
      stitchColor = '#2563eb';
      break;
    case 'Toxic Purple':
      strapBase = '#581c87';
      strapShine = '#6b21a8';
      strapBorder = '#3b0764';
      stitchColor = '#9333ea';
      break;
    case 'Emerald Green':
      strapBase = '#064e3b';
      strapShine = '#065f46';
      strapBorder = '#022c22';
      stitchColor = '#059669';
      break;
    case 'Championship Gold':
      strapBase = '#713f12';
      strapShine = '#854d0e';
      strapBorder = '#422006';
      stitchColor = '#ca8a04';
      break;
    default: // Classic Black
      strapBase = '#141416';
      strapShine = '#222225';
      strapBorder = '#08080a';
      stitchColor = '#2e2e33';
      break;
  }

  // Plate Finishes
  let goldLight = '#fef08a';
  let goldMid = '#eab308';
  let goldDeep = '#a16207';
  let goldShadow = '#713f12';

  if (finish === 'Platinum White Gold') {
    goldLight = '#f8fafc';
    goldMid = '#cbd5e1';
    goldDeep = '#64748b';
    goldShadow = '#334155';
  } else if (finish === 'Rose Gold') {
    goldLight = '#ffe4e6';
    goldMid = '#fb7185';
    goldDeep = '#be123c';
    goldShadow = '#881337';
  } else if (finish === 'Antique Bronze') {
    goldLight = '#fed7aa';
    goldMid = '#d97706';
    goldDeep = '#92400e';
    goldShadow = '#451a03';
  } else if (finish === 'Blackened Steel') {
    goldLight = '#94a3b8';
    goldMid = '#475569';
    goldDeep = '#1e293b';
    goldShadow = '#0f172a';
  }

  // Gemstones
  let gemFill = '#ef4444'; // default ruby
  let gemGlow = '#f87171';
  if (options?.gemstoneType === 'Emeralds' || prestige >= 90) {
    gemFill = '#10b981';
    gemGlow = '#34d399';
  } else if (options?.gemstoneType === 'Sapphires') {
    gemFill = '#3b82f6';
    gemGlow = '#60a5fa';
  } else if (options?.gemstoneType === 'Amethysts') {
    gemFill = '#a855f7';
    gemGlow = '#c084fc';
  } else if (options?.gemstoneType === 'Diamonds') {
    gemFill = '#38bdf8';
    gemGlow = '#e0f2fe';
  }

  // Center Emblem SVG Content based on Plate Style
  let centerSymbolSvg = '';
  if (plateStyleName === 'Winged Globe') {
    centerSymbolSvg = `
      <!-- Globe with Wings -->
      <circle cx="400" cy="195" r="42" fill="url(#globeGrad)" stroke="${goldDeep}" stroke-width="2.5" />
      <path d="M 360 195 A 40 22 0 0 1 440 195 A 40 22 0 0 1 360 195 Z" fill="none" stroke="${goldLight}" stroke-width="1.8" opacity="0.8" />
      <path d="M 370 180 A 30 15 0 0 1 430 180" fill="none" stroke="${goldLight}" stroke-width="1.2" opacity="0.6" />
      <path d="M 370 210 A 30 15 0 0 0 430 210" fill="none" stroke="${goldLight}" stroke-width="1.2" opacity="0.6" />
      <line x1="400" y1="153" x2="400" y2="237" stroke="${goldLight}" stroke-width="1.5" opacity="0.8" />
      <!-- Left Wing -->
      <path d="M 358 190 C 330 165 300 168 280 178 C 300 192 320 205 358 206 Z" fill="url(#plateGold)" stroke="${goldDeep}" stroke-width="2" />
      <path d="M 355 204 C 335 200 310 206 295 218 C 315 220 338 220 355 212 Z" fill="url(#plateGold)" stroke="${goldDeep}" stroke-width="1.5" />
      <!-- Right Wing -->
      <path d="M 442 190 C 470 165 500 168 520 178 C 500 192 480 205 442 206 Z" fill="url(#plateGold)" stroke="${goldDeep}" stroke-width="2" />
      <path d="M 445 204 C 465 200 490 206 505 218 C 485 220 462 220 445 212 Z" fill="url(#plateGold)" stroke="${goldDeep}" stroke-width="1.5" />
    `;
  } else if (plateStyleName === 'Crown & Regal Lions') {
    centerSymbolSvg = `
      <!-- Royal Crown -->
      <path d="M 370 215 L 360 175 L 382 192 L 400 162 L 418 192 L 440 175 L 430 215 Z" fill="url(#plateGoldHighlight)" stroke="${goldDeep}" stroke-width="2" />
      <circle cx="360" cy="172" r="3.5" fill="${gemFill}" stroke="${goldLight}" />
      <circle cx="400" cy="159" r="4.5" fill="${gemFill}" stroke="${goldLight}" />
      <circle cx="440" cy="172" r="3.5" fill="${gemFill}" stroke="${goldLight}" />
      <circle cx="382" cy="190" r="3" fill="#38bdf8" />
      <circle cx="418" cy="190" r="3" fill="#38bdf8" />
      <rect x="368" y="215" width="64" height="8" rx="2" fill="url(#plateGold)" stroke="${goldDeep}" stroke-width="1.5" />
      <circle cx="380" cy="219" r="2" fill="${gemFill}" />
      <circle cx="400" cy="219" r="2.5" fill="#38bdf8" />
      <circle cx="420" cy="219" r="2" fill="${gemFill}" />
    `;
  } else if (plateStyleName === 'Skull & Barbed Wire') {
    centerSymbolSvg = `
      <!-- Hardcore Skull Motif -->
      <path d="M 378 185 C 378 160 422 160 422 185 C 422 198 412 205 410 218 L 390 218 C 388 205 378 198 378 185 Z" fill="url(#plateGoldHighlight)" stroke="${goldDeep}" stroke-width="2" />
      <circle cx="390" cy="184" r="6" fill="#000" />
      <circle cx="410" cy="184" r="6" fill="#000" />
      <path d="M 397 194 L 400 188 L 403 194 Z" fill="#000" />
      <line x1="392" y1="214" x2="392" y2="218" stroke="#000" stroke-width="2" />
      <line x1="400" y1="214" x2="400" y2="218" stroke="#000" stroke-width="2" />
      <line x1="408" y1="214" x2="408" y2="218" stroke="#000" stroke-width="2" />
      <!-- Barbed Cross -->
      <line x1="340" y1="195" x2="460" y2="195" stroke="${goldLight}" stroke-width="2.5" stroke-dasharray="8,4" />
    `;
  } else if (plateStyleName === 'Eagle Crest' || isTag) {
    centerSymbolSvg = `
      <!-- Majestic Eagle Spread Wings -->
      <path d="M 400 165 C 380 150 320 165 295 190 C 330 195 365 210 395 220 L 400 230 L 405 220 C 435 210 470 195 505 190 C 480 165 420 150 400 165 Z" fill="url(#plateGoldHighlight)" stroke="${goldDeep}" stroke-width="2" />
      <circle cx="400" cy="182" r="14" fill="url(#globeGrad)" stroke="${goldLight}" stroke-width="1.5" />
      <!-- Eagle Head -->
      <path d="M 396 160 C 398 152 406 152 408 160 L 413 162 L 407 165 Z" fill="${goldLight}" stroke="${goldDeep}" />
      <circle cx="402" cy="158" r="1.5" fill="#000" />
    `;
  } else {
    // Big Gold Classic / Default
    centerSymbolSvg = `
      <!-- Classic Big Gold Crest & Twin Wrestlers -->
      <circle cx="400" cy="195" r="38" fill="url(#globeGrad)" stroke="${goldDeep}" stroke-width="2" />
      <path d="M 375 195 A 25 15 0 0 1 425 195 A 25 15 0 0 1 375 195 Z" fill="none" stroke="${goldLight}" stroke-width="1.2" opacity="0.8" />
      <!-- Ornate Laurel Wreath -->
      <path d="M 360 215 C 345 195 350 170 370 155 C 362 170 365 195 378 208 Z" fill="url(#plateGold)" stroke="${goldDeep}" stroke-width="1" />
      <path d="M 440 215 C 455 195 450 170 430 155 C 438 170 435 195 422 208 Z" fill="url(#plateGold)" stroke="${goldDeep}" stroke-width="1" />
      <!-- Twin Stars -->
      <polygon points="345,195 348,190 354,190 349,194 351,200 345,196 339,200 341,194 336,190 342,190" fill="${goldLight}" stroke="${goldDeep}" stroke-width="0.8" />
      <polygon points="455,195 458,190 464,190 459,194 461,200 455,196 449,200 451,194 446,190 452,190" fill="${goldLight}" stroke="${goldDeep}" stroke-width="0.8" />
    `;
  }

  // Tag belt indication
  const tagDuoBadge = isTag ? `
    <g transform="translate(400, 240)">
      <rect x="-55" y="-10" width="110" height="20" rx="4" fill="#09090b" stroke="${goldMid}" stroke-width="1.2" />
      <text x="0" y="4" font-family="'Impact', 'Arial Black', sans-serif" font-size="10" font-weight="900" fill="${goldLight}" text-anchor="middle" letter-spacing="1">
        TAG TEAM DUO
      </text>
    </g>
  ` : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
    <defs>
      <!-- Background Luxury Spotlight -->
      <radialGradient id="bgGrad" cx="50%" cy="45%" r="70%">
        <stop offset="0%" stop-color="#241a08" />
        <stop offset="50%" stop-color="#120e06" />
        <stop offset="100%" stop-color="#050402" />
      </radialGradient>

      <!-- Leather Strap Gradient -->
      <linearGradient id="strapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${strapShine}" />
        <stop offset="15%" stop-color="${strapBase}" />
        <stop offset="85%" stop-color="${strapBase}" />
        <stop offset="100%" stop-color="${strapBorder}" />
      </linearGradient>

      <!-- Gold Plate Metallic Shimmer -->
      <linearGradient id="plateGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${goldDeep}" />
        <stop offset="25%" stop-color="${goldLight}" />
        <stop offset="50%" stop-color="${goldMid}" />
        <stop offset="75%" stop-color="${goldLight}" />
        <stop offset="100%" stop-color="${goldShadow}" />
      </linearGradient>

      <linearGradient id="plateGoldHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${goldLight}" />
        <stop offset="40%" stop-color="${goldMid}" />
        <stop offset="80%" stop-color="${goldDeep}" />
        <stop offset="100%" stop-color="${goldShadow}" />
      </linearGradient>

      <linearGradient id="globeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e3a8a" />
        <stop offset="60%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>

      <!-- Drop Shadows -->
      <filter id="beltShadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="16" stdDeviation="12" flood-color="#000000" flood-opacity="0.8" />
      </filter>
      <filter id="plateGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.7" />
      </filter>
      <filter id="gemGlowFilter">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Canvas Background -->
    <rect width="800" height="450" fill="url(#bgGrad)" />

    <!-- Ambient Grid & Studio Texture -->
    <circle cx="400" cy="210" r="340" fill="none" stroke="${goldLight}" stroke-opacity="0.04" stroke-width="2" />
    <circle cx="400" cy="210" r="260" fill="none" stroke="${goldLight}" stroke-opacity="0.03" stroke-width="1" />

    <!-- Championship Belt Group -->
    <g filter="url(#beltShadow)">
      <!-- 1. LEATHER STRAP (Main contour curved) -->
      <!-- Left tapered strap -->
      <path d="M 50 200 C 90 192 180 185 240 165 L 240 255 C 180 235 90 228 50 220 C 35 217 35 203 50 200 Z"
            fill="url(#strapGrad)" stroke="${strapBorder}" stroke-width="3" />

      <!-- Right tapered strap -->
      <path d="M 750 200 C 710 192 620 185 560 165 L 560 255 C 620 235 710 228 750 220 C 765 217 765 203 750 200 Z"
            fill="url(#strapGrad)" stroke="${strapBorder}" stroke-width="3" />

      <!-- Center belly wide strap -->
      <path d="M 220 165 C 300 135 500 135 580 165 C 610 200 610 220 580 255 C 500 285 300 285 220 255 C 190 220 190 200 220 165 Z"
            fill="url(#strapGrad)" stroke="${strapBorder}" stroke-width="3.5" />

      <!-- Strap Stitching Details -->
      <path d="M 58 204 C 95 197 180 190 235 172" fill="none" stroke="${stitchColor}" stroke-width="1.5" stroke-dasharray="4,3" />
      <path d="M 58 216 C 95 223 180 230 235 248" fill="none" stroke="${stitchColor}" stroke-width="1.5" stroke-dasharray="4,3" />
      <path d="M 742 204 C 705 197 620 190 565 172" fill="none" stroke="${stitchColor}" stroke-width="1.5" stroke-dasharray="4,3" />
      <path d="M 742 216 C 705 223 620 230 565 248" fill="none" stroke="${stitchColor}" stroke-width="1.5" stroke-dasharray="4,3" />

      <!-- Metal Strap Snaps & Rivets -->
      <g fill="url(#plateGold)" stroke="${goldShadow}" stroke-width="1">
        <circle cx="80" cy="204" r="5" />
        <circle cx="80" cy="216" r="5" />
        <circle cx="105" cy="202" r="5" />
        <circle cx="105" cy="218" r="5" />
        <circle cx="130" cy="200" r="5" />
        <circle cx="130" cy="220" r="5" />

        <circle cx="720" cy="204" r="5" />
        <circle cx="720" cy="216" r="5" />
        <circle cx="695" cy="202" r="5" />
        <circle cx="695" cy="218" r="5" />
        <circle cx="670" cy="200" r="5" />
        <circle cx="670" cy="220" r="5" />

        <!-- Strap Tip (Gold end cap) -->
        <path d="M 45 198 L 35 210 L 45 222 L 52 210 Z" fill="url(#plateGold)" stroke="${goldDeep}" />
      </g>

      <!-- 2. SIDE PLATES -->
      <!-- Left Outer Side Plate -->
      <g filter="url(#plateGlow)" transform="translate(170, 185)">
        <rect x="-18" y="-30" width="36" height="60" rx="6" fill="url(#plateGold)" stroke="${goldDeep}" stroke-width="2" />
        <rect x="-14" y="-26" width="28" height="52" rx="4" fill="url(#plateGoldHighlight)" stroke="${goldShadow}" stroke-width="1" />
        <circle cx="0" cy="0" r="9" fill="${goldDeep}" opacity="0.6" />
        <polygon points="0,-6 2,-2 6,-2 3,1 4,5 0,3 -4,5 -3,1 -6,-2 -2,-2" fill="${goldLight}" />
      </g>

      <!-- Left Inner Side Plate -->
      <g filter="url(#plateGlow)" transform="translate(225, 195)">
        <polygon points="-22,-38 22,-38 28,38 -28,38" fill="url(#plateGold)" stroke="${goldDeep}" stroke-width="2.5" />
        <polygon points="-18,-34 18,-34 24,34 -24,34" fill="url(#plateGoldHighlight)" stroke="${goldShadow}" stroke-width="1.2" />
        <!-- Crest in Side Plate -->
        <circle cx="0" cy="0" r="14" fill="url(#globeGrad)" stroke="${goldLight}" stroke-width="1.2" />
        <text x="0" y="4" font-family="'Impact', 'Arial Black', sans-serif" font-size="8" fill="${goldLight}" text-anchor="middle" font-weight="bold">#1</text>
      </g>

      <!-- Right Inner Side Plate -->
      <g filter="url(#plateGlow)" transform="translate(575, 195)">
        <polygon points="-22,-38 22,-38 28,38 -28,38" fill="url(#plateGold)" stroke="${goldDeep}" stroke-width="2.5" />
        <polygon points="-18,-34 18,-34 24,34 -24,34" fill="url(#plateGoldHighlight)" stroke="${goldShadow}" stroke-width="1.2" />
        <!-- Crest in Side Plate -->
        <circle cx="0" cy="0" r="14" fill="url(#globeGrad)" stroke="${goldLight}" stroke-width="1.2" />
        <text x="0" y="4" font-family="'Impact', 'Arial Black', sans-serif" font-size="8" fill="${goldLight}" text-anchor="middle" font-weight="bold">PRO</text>
      </g>

      <!-- Right Outer Side Plate -->
      <g filter="url(#plateGlow)" transform="translate(630, 185)">
        <rect x="-18" y="-30" width="36" height="60" rx="6" fill="url(#plateGold)" stroke="${goldDeep}" stroke-width="2" />
        <rect x="-14" y="-26" width="28" height="52" rx="4" fill="url(#plateGoldHighlight)" stroke="${goldShadow}" stroke-width="1" />
        <circle cx="0" cy="0" r="9" fill="${goldDeep}" opacity="0.6" />
        <polygon points="0,-6 2,-2 6,-2 3,1 4,5 0,3 -4,5 -3,1 -6,-2 -2,-2" fill="${goldLight}" />
      </g>

      <!-- 3. MAIN CENTER PLATE -->
      <g filter="url(#plateGlow)">
        <!-- Center Plate Outer Base Bezel -->
        <path d="M 270 180 C 270 125 330 110 400 110 C 470 110 530 125 530 180 C 540 240 480 300 400 300 C 320 300 260 240 270 180 Z"
              fill="url(#plateGold)" stroke="${goldShadow}" stroke-width="4" />

        <!-- Roped Border / Beaded Relief Rim -->
        <path d="M 280 182 C 280 135 335 120 400 120 C 465 120 520 135 520 182 C 530 232 475 290 400 290 C 325 290 270 232 280 182 Z"
              fill="none" stroke="${goldLight}" stroke-width="2" stroke-dasharray="4,2" />

        <!-- Center Plate Inner Basin -->
        <path d="M 288 184 C 288 140 340 126 400 126 C 460 126 512 140 512 184 C 520 228 470 280 400 280 C 330 280 280 228 288 184 Z"
              fill="url(#plateGoldHighlight)" stroke="${goldDeep}" stroke-width="2" />

        <!-- Intricate Floral & Scrollwork Filigree Background -->
        <g stroke="${goldDeep}" stroke-width="1.2" fill="none" opacity="0.45">
          <path d="M 310 160 Q 340 150 370 165 T 390 190" />
          <path d="M 490 160 Q 460 150 430 165 T 410 190" />
          <path d="M 320 240 Q 350 255 380 240 T 400 220" />
          <path d="M 480 240 Q 450 255 420 240 T 400 220" />
        </g>

        <!-- TOP ENGRAVED BANNER: PROMOTION NAME -->
        <g transform="translate(400, 148)">
          <!-- Banner Ribbon -->
          <path d="M -115 0 C -60 -10 60 -10 115 0 L 105 16 C 60 8 -60 8 -105 16 Z"
                fill="url(#plateGold)" stroke="${goldShadow}" stroke-width="1.8" />
          <!-- Ribbon Fishtails -->
          <polygon points="-115,0 -130,-4 -122,8 -130,20 -105,16" fill="${goldDeep}" stroke="${goldShadow}" stroke-width="1" />
          <polygon points="115,0 130,-4 122,8 130,20 105,16" fill="${goldDeep}" stroke="${goldShadow}" stroke-width="1" />
          <!-- Promotion Text -->
          <text x="0" y="10" font-family="'Impact', 'Arial Black', sans-serif" font-size="11" font-weight="900"
                fill="${goldLight}" text-anchor="middle" letter-spacing="1.5">
            ${promoText}
          </text>
        </g>

        <!-- CENTER EMBLEM (Wings, Globe, Lions, Skulls, or Crest) -->
        ${centerSymbolSvg}

        <!-- BOTTOM ENGRAVED BANNER: TITLE NAME -->
        <g transform="translate(400, 262)">
          <path d="M -130 0 C -70 8 70 8 130 0 L 120 20 C 70 26 -70 26 -120 20 Z"
                fill="url(#plateGold)" stroke="${goldShadow}" stroke-width="2" />
          <polygon points="-130,0 -145,-4 -138,10 -145,24 -120,20" fill="${goldDeep}" stroke="${goldShadow}" stroke-width="1" />
          <polygon points="130,0 145,-4 138,10 145,24 120,20" fill="${goldDeep}" stroke="${goldShadow}" stroke-width="1" />
          <text x="0" y="14" font-family="'Impact', 'Arial Black', sans-serif" font-size="11.5" font-weight="900"
                fill="${goldLight}" text-anchor="middle" letter-spacing="1.8">
            ${titleText}
          </text>
        </g>

        <!-- Tag Team Duo badge if applicable -->
        ${tagDuoBadge}

        <!-- GEMSTONES & DIAMONDS AROUND BEZEL -->
        <g filter="url(#gemGlowFilter)">
          <!-- Top Gems -->
          <circle cx="340" cy="126" r="4.5" fill="${gemFill}" stroke="${goldLight}" stroke-width="1" />
          <circle cx="370" cy="122" r="5" fill="#38bdf8" stroke="${goldLight}" stroke-width="1" />
          <circle cx="400" cy="120" r="6" fill="${gemFill}" stroke="${goldLight}" stroke-width="1.2" />
          <circle cx="430" cy="122" r="5" fill="#38bdf8" stroke="${goldLight}" stroke-width="1" />
          <circle cx="460" cy="126" r="4.5" fill="${gemFill}" stroke="${goldLight}" stroke-width="1" />

          <!-- Bottom Gems -->
          <circle cx="330" cy="272" r="4" fill="${gemFill}" stroke="${goldLight}" stroke-width="1" />
          <circle cx="365" cy="282" r="4.5" fill="#38bdf8" stroke="${goldLight}" stroke-width="1" />
          <circle cx="400" cy="286" r="5.5" fill="${gemFill}" stroke="${goldLight}" stroke-width="1.2" />
          <circle cx="435" cy="282" r="4.5" fill="#38bdf8" stroke="${goldLight}" stroke-width="1" />
          <circle cx="470" cy="272" r="4" fill="${gemFill}" stroke="${goldLight}" stroke-width="1" />

          <!-- Lateral Flank Gems -->
          <circle cx="282" cy="180" r="5" fill="${gemFill}" stroke="${goldLight}" stroke-width="1" />
          <circle cx="518" cy="180" r="5" fill="${gemFill}" stroke="${goldLight}" stroke-width="1" />
        </g>
      </g>
    </g>

    <!-- Bottom Brand Title Watermark -->
    <g transform="translate(400, 420)" opacity="0.8">
      <text x="0" y="0" font-family="'Courier New', monospace" font-size="11" fill="${goldMid}" text-anchor="middle" font-weight="bold" letter-spacing="2">
        ★ ${promoText} • OFFICIAL CHAMPIONSHIP SANCTION ★
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Resolves the primary visual asset URL for a championship belt.
 * Prioritizes:
 * 1. Explicit `title.imageUrl` (user customized or previously generated)
 * 2. Static pregenerated asset for flagship titles (e.g. APW World, IC, Women's, Tag)
 * 3. Dynamically generated SVG asset based on the promotion's name and style.
 */
export function getChampionshipBeltImage(
  title: Championship,
  promotionName: string = 'Apex Pro Wrestling',
  promotionStyle: string = 'Mainstream Giant'
): string {
  if (title.imageUrl && title.imageUrl.trim().length > 0) {
    return title.imageUrl;
  }

  if (PREGENERATED_BELT_ASSETS[title.id]) {
    return PREGENERATED_BELT_ASSETS[title.id];
  }

  // Generate dynamic SVG asset matching promotion name, style, strap and plate
  return generateDynamicBeltSvg(title, promotionName, promotionStyle);
}
