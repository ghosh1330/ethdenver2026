import Image from 'next/image'

interface LogoProps {
  size?: number
}

export default function Logo({ size = 52 }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="ThreadHunt"
      width={size}
      height={size}
      style={{ borderRadius: '50%', display: 'block' }}
      priority
    />
  )
}