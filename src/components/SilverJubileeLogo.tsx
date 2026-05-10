interface SilverJubileeLogoProps {
  size?: number;
  className?: string;
}

export default function SilverJubileeLogo({ size = 120, className = '' }: SilverJubileeLogoProps) {
  return (
    <img 
      src="25years.png" 
      alt="AITAM 25 Years Silver Jubilee - Celebrating 25 Years of Excellence - Estd. 2001"
      width={size}
      height={size}
      className={`inline-block object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
