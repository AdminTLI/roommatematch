import { PastelMeshBackgroundStatic } from '@/components/site/pastel-mesh-background-static'

type PastelMeshBackgroundProps = {
  className?: string
}

/**
 * @deprecated Prefer PastelMeshBackgroundStatic in server pages. Kept for existing client imports.
 */
export function PastelMeshBackground({ className }: PastelMeshBackgroundProps) {
  return <PastelMeshBackgroundStatic className={className} />
}
