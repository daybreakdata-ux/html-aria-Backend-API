interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className = "", size = 24 }: LogoProps) {
  return (
    <img
      src="/High-quality_black_and_white_vector_ARIA_logo.png"
      alt="ARIA Logo"
      className={className}
      style={{ width: size, height: size }}
    />
  )
}