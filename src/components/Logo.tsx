// ============================================================
// Indectra Logo — Matches the original brand logo exactly
// Heavy condensed red text with brown dot between "t" and "r"
// Uses "Anton" Google Font (closest match to the original typeface)
// ============================================================

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { fontSize: '1.5rem', dotSize: 7, dotOffset: -2 },
  md: { fontSize: '2.2rem', dotSize: 9, dotOffset: -3 },
  lg: { fontSize: '3.2rem', dotSize: 13, dotOffset: -4 },
};

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const s = sizes[size];

  return (
    <span
      className={`inline-block select-none ${className}`}
      style={{
        fontFamily: "'Anton', 'Impact', 'Arial Black', sans-serif",
        fontWeight: 400, // Anton only has 400 but it's already ultra-bold
        letterSpacing: '0.02em',
        lineHeight: 1,
      }}
      aria-label="Indectra"
      role="img"
    >
      <span className="relative inline-block" style={{ fontSize: s.fontSize }}>
        {/* Full word in red */}
        <span style={{ color: '#C84632' }}>Indect</span>
        <span className="relative" style={{ color: '#C84632' }}>
          r
          {/* Brown dot — positioned at top-right of the "r" stem, matching original logo */}
          <span
            className="absolute rounded-full"
            style={{
              width: s.dotSize,
              height: s.dotSize,
              backgroundColor: '#4A3728',
              top: s.dotOffset,
              right: 0,
            }}
          />
        </span>
        <span style={{ color: '#C84632' }}>a</span>
      </span>
    </span>
  );
}
