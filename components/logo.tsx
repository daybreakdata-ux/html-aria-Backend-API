import { Globe } from "lucide-react"

interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className = "", size = 24 }: LogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Globe size={size} className="text-current" />
    </div>
  )
}