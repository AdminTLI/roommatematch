import { cn } from "@/lib/utils"

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export default function Container({ className = '', children }: ContainerProps) {
  return (
    <div className={`mx-auto max-w-[1152px] px-4 md:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}