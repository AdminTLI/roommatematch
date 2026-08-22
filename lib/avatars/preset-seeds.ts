import type { Options as AvataaarsOptions } from '@dicebear/avataaars'

export type AvatarStyleId = 'avataaars' | 'bottts' | 'shapes' | 'identicon' | 'icons'

type PresetAvatarConfig = {
  seed: string
  style: AvatarStyleId
  options?: Record<string, unknown>
}

/** Shared defaults for human presets — no beards or random glasses. */
const HUMAN_BASE: AvataaarsOptions = {
  facialHairProbability: 0,
  accessoriesProbability: 0,
  style: ['circle'],
}

/** Sixteen curated human avatars with balanced feminine, neutral, and masculine presentation. */
export const HUMAN_PRESET_AVATARS: PresetAvatarConfig[] = [
  {
    seed: 'luna',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['bob'],
      hairColor: ['4a312c'],
      skinColor: ['ffdbb4'],
      eyes: ['hearts'],
      eyebrows: ['flatNatural'],
      mouth: ['smile'],
      clothing: ['shirtScoopNeck'],
      clothesColor: ['ffafb9'],
    },
  },
  {
    seed: 'aria',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['bun'],
      hairColor: ['724133'],
      skinColor: ['edb98a'],
      eyes: ['happy'],
      eyebrows: ['defaultNatural'],
      mouth: ['twinkle'],
      clothing: ['shirtVNeck'],
      clothesColor: ['b1e2ff'],
    },
  },
  {
    seed: 'sofia',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['longButNotTooLong'],
      hairColor: ['2c1b18'],
      skinColor: ['f8d25c'],
      eyes: ['happy'],
      eyebrows: ['flatNatural'],
      mouth: ['smile'],
      clothing: ['shirtScoopNeck'],
      clothesColor: ['ff488e'],
    },
  },
  {
    seed: 'zoe',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['curly'],
      hairColor: ['724133'],
      skinColor: ['d08b5b'],
      eyes: ['hearts'],
      eyebrows: ['flatNatural'],
      mouth: ['twinkle'],
      clothing: ['shirtVNeck'],
      clothesColor: ['a7ffc4'],
    },
  },
  {
    seed: 'rose',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['straight01'],
      hairColor: ['b58143'],
      skinColor: ['ffdbb4'],
      eyes: ['wink'],
      eyebrows: ['defaultNatural'],
      mouth: ['smile'],
      clothing: ['shirtScoopNeck'],
      clothesColor: ['ffdeb5'],
    },
  },
  {
    seed: 'mei',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['straight02'],
      hairColor: ['2c1b18'],
      skinColor: ['fd9841'],
      eyes: ['happy'],
      eyebrows: ['flatNatural'],
      mouth: ['smile'],
      clothing: ['shirtVNeck'],
      clothesColor: ['ffffff'],
    },
  },
  {
    seed: 'nadia',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['hijab'],
      hairColor: ['2c1b18'],
      skinColor: ['ae5d29'],
      eyes: ['default'],
      eyebrows: ['flatNatural'],
      mouth: ['smile'],
      clothing: ['shirtScoopNeck'],
      clothesColor: ['65c9ff'],
    },
  },
  {
    seed: 'amara',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['bigHair'],
      hairColor: ['724133'],
      skinColor: ['614335'],
      eyes: ['surprised'],
      eyebrows: ['defaultNatural'],
      mouth: ['smile'],
      clothing: ['shirtScoopNeck'],
      clothesColor: ['ff488e'],
    },
  },
  {
    seed: 'quinn',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['miaWallace'],
      hairColor: ['2c1b18'],
      skinColor: ['edb98a'],
      eyes: ['default'],
      eyebrows: ['upDownNatural'],
      mouth: ['default'],
      clothing: ['hoodie'],
      clothesColor: ['929598'],
    },
  },
  {
    seed: 'sage',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['dreads01'],
      hairColor: ['724133'],
      skinColor: ['ae5d29'],
      eyes: ['happy'],
      eyebrows: ['defaultNatural'],
      mouth: ['smile'],
      clothing: ['graphicShirt'],
      clothesColor: ['3c4f5c'],
    },
  },
  {
    seed: 'river',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['winterHat1'],
      hairColor: ['4a312c'],
      skinColor: ['ffdbb4'],
      eyes: ['side'],
      eyebrows: ['flatNatural'],
      mouth: ['concerned'],
      clothing: ['collarAndSweater'],
      clothesColor: ['5199e4'],
    },
  },
  {
    seed: 'cedar',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['theCaesar'],
      hairColor: ['2c1b18'],
      skinColor: ['d08b5b'],
      eyes: ['squint'],
      eyebrows: ['defaultNatural'],
      mouth: ['serious'],
      clothing: ['shirtCrewNeck'],
      clothesColor: ['25557c'],
    },
  },
  {
    seed: 'falcon',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['shortFlat'],
      hairColor: ['4a312c'],
      skinColor: ['edb98a'],
      eyes: ['default'],
      eyebrows: ['angryNatural'],
      mouth: ['default'],
      clothing: ['blazerAndShirt'],
      clothesColor: ['262e33'],
    },
  },
  {
    seed: 'harbor',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['shortWaved'],
      hairColor: ['724133'],
      skinColor: ['ffdbb4'],
      eyes: ['side'],
      eyebrows: ['flatNatural'],
      mouth: ['concerned'],
      clothing: ['hoodie'],
      clothesColor: ['3c4f5c'],
    },
  },
  {
    seed: 'maple',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['theCaesarAndSidePart'],
      hairColor: ['b58143'],
      skinColor: ['ae5d29'],
      eyes: ['happy'],
      eyebrows: ['defaultNatural'],
      mouth: ['smile'],
      clothing: ['shirtCrewNeck'],
      clothesColor: ['5199e4'],
    },
  },
  {
    seed: 'orbit',
    style: 'avataaars',
    options: {
      ...HUMAN_BASE,
      top: ['shortRound'],
      hairColor: ['2c1b18'],
      skinColor: ['fd9841'],
      eyes: ['surprised'],
      eyebrows: ['upDownNatural'],
      mouth: ['grimace'],
      clothing: ['graphicShirt'],
      clothesColor: ['e6e6e6'],
    },
  },
]

/**
 * Sixteen abstract, non-human presets — robots, geometry, patterns, and nature icons.
 * Intended for users who prefer a neutral avatar without gender or human features.
 */
export const ABSTRACT_PRESET_AVATARS: PresetAvatarConfig[] = [
  {
    seed: 'chip',
    style: 'bottts',
    options: {
      eyes: ['round'],
      face: ['round01'],
      mouth: ['smile01'],
      sides: ['antenna01'],
      baseColor: ['5e35b1'],
    },
  },
  {
    seed: 'bolt',
    style: 'bottts',
    options: {
      eyes: ['glow'],
      face: ['square02'],
      mouth: ['grill01'],
      sides: ['cables01'],
      baseColor: ['039be5'],
    },
  },
  {
    seed: 'gear',
    style: 'bottts',
    options: {
      eyes: ['sensor'],
      face: ['square01'],
      mouth: ['smile02'],
      sides: ['round'],
      baseColor: ['546e7a'],
    },
  },
  {
    seed: 'pixel',
    style: 'bottts',
    options: {
      eyes: ['frame1'],
      face: ['square03'],
      mouth: ['smile01'],
      sides: ['antenna02'],
      texture: ['dots'],
      baseColor: ['43a047'],
    },
  },
  {
    seed: 'prism',
    style: 'shapes',
    options: {
      backgroundColor: ['1c799f'],
      shape1: ['polygonFilled'],
      shape1Color: ['69d2e7'],
      shape2: ['ellipseFilled'],
      shape2Color: ['f1f4dc'],
    },
  },
  {
    seed: 'arc',
    style: 'shapes',
    options: {
      backgroundColor: ['0a5b83'],
      shape1: ['ellipse'],
      shape1Color: ['f88c49'],
      shape2: ['rectangleFilled'],
      shape2Color: ['69d2e7'],
    },
  },
  {
    seed: 'bloom',
    style: 'shapes',
    options: {
      backgroundColor: ['f1f4dc'],
      shape1: ['ellipseFilled'],
      shape1Color: ['f88c49'],
      shape2: ['polygon'],
      shape2Color: ['1c799f'],
    },
  },
  {
    seed: 'drift',
    style: 'shapes',
    options: {
      backgroundColor: ['69d2e7'],
      shape1: ['rectangle'],
      shape1Color: ['0a5b83'],
      shape2: ['line'],
      shape2Color: ['f1f4dc'],
    },
  },
  {
    seed: 'mosaic',
    style: 'identicon',
    options: {
      rowColor: ['5e35b1'],
    },
  },
  {
    seed: 'lattice',
    style: 'identicon',
    options: {
      rowColor: ['00897b'],
    },
  },
  {
    seed: 'ripple',
    style: 'identicon',
    options: {
      rowColor: ['1e88e5'],
    },
  },
  {
    seed: 'node',
    style: 'identicon',
    options: {
      rowColor: ['f4511e'],
    },
  },
  {
    seed: 'moon',
    style: 'icons',
    options: {
      icon: ['moon'],
      backgroundColor: ['b39ddb'],
    },
  },
  {
    seed: 'star',
    style: 'icons',
    options: {
      icon: ['star'],
      backgroundColor: ['ffe082'],
    },
  },
  {
    seed: 'cloud',
    style: 'icons',
    options: {
      icon: ['cloud'],
      backgroundColor: ['90caf9'],
    },
  },
  {
    seed: 'tree',
    style: 'icons',
    options: {
      icon: ['tree'],
      backgroundColor: ['a5d6a7'],
    },
  },
]

function interleavePresets(
  human: PresetAvatarConfig[],
  abstract: PresetAvatarConfig[]
): PresetAvatarConfig[] {
  const mixed: PresetAvatarConfig[] = []
  const max = Math.max(human.length, abstract.length)
  for (let i = 0; i < max; i += 1) {
    if (human[i]) mixed.push(human[i])
    if (abstract[i]) mixed.push(abstract[i])
  }
  return mixed
}

export const PRESET_AVATARS = interleavePresets(HUMAN_PRESET_AVATARS, ABSTRACT_PRESET_AVATARS)

export const PRESET_SEEDS = PRESET_AVATARS.map((preset) => preset.seed)

export const PRESET_BY_SEED: Record<string, PresetAvatarConfig> = Object.fromEntries(
  PRESET_AVATARS.map((preset) => [preset.seed, preset])
)

/** @deprecated Use PRESET_BY_SEED instead. */
export const PRESET_AVATAR_OPTIONS = Object.fromEntries(
  PRESET_AVATARS.map((preset) => [preset.seed, preset.options ?? {}])
)
