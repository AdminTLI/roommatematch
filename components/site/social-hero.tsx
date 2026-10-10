import type { ReactNode } from 'react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { SocialHeroCopyIsland } from '@/components/site/social-hero-copy-island'
import { SocialHeroPreviewIsland } from '@/components/site/social-hero-preview-island'

/**
 * Server-rendered hero shell. LCP copy stays outside heavy client trees;
 * locale swap and the preview card are isolated islands.
 */
export function SocialHero({ englishCopy }: { englishCopy: ReactNode }) {
  return (
    <Section className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex items-center py-8 md:py-10">
      <Container className="relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:-mt-10">
          <SocialHeroCopyIsland englishCopy={englishCopy} />
          <SocialHeroPreviewIsland />
        </div>
      </Container>
    </Section>
  )
}
