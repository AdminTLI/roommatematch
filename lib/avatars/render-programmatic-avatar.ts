import { createAvatar } from '@dicebear/core'
import * as avataaars from '@dicebear/avataaars'
import * as bottts from '@dicebear/bottts'
import * as shapes from '@dicebear/shapes'
import * as identicon from '@dicebear/identicon'
import * as icons from '@dicebear/icons'
import { PRESET_BY_SEED } from '@/lib/avatars/preset-seeds'

export function renderProgrammaticAvatarSvg(seed: string, size = 128): string {
  const preset = PRESET_BY_SEED[seed]

  if (preset) {
    switch (preset.style) {
      case 'avataaars':
        return createAvatar(avataaars, {
          seed,
          size,
          ...(preset.options as Parameters<typeof createAvatar<typeof avataaars>>[1]),
        }).toString()
      case 'bottts':
        return createAvatar(bottts, {
          seed,
          size,
          ...(preset.options as Parameters<typeof createAvatar<typeof bottts>>[1]),
        }).toString()
      case 'shapes':
        return createAvatar(shapes, {
          seed,
          size,
          ...(preset.options as Parameters<typeof createAvatar<typeof shapes>>[1]),
        }).toString()
      case 'identicon':
        return createAvatar(identicon, {
          seed,
          size,
          ...(preset.options as Parameters<typeof createAvatar<typeof identicon>>[1]),
        }).toString()
      case 'icons':
        return createAvatar(icons, {
          seed,
          size,
          ...(preset.options as Parameters<typeof createAvatar<typeof icons>>[1]),
        }).toString()
    }
  }

  return createAvatar(avataaars, {
    seed,
    size,
    style: ['circle'],
    facialHairProbability: 0,
    accessoriesProbability: 0,
  }).toString()
}
