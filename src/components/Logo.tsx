// ============================================================
// Indectra Logo — CSS-rendered for pixel-perfect cross-browser display
// Red text with brown dot replacing the tittle on the second "i" (styled as dot on "r")
// ============================================================

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { fontSize: '1.25rem', dotSize: 6, dotTop: -1 },
  md: { fontSize: '1.75rem', dotSize: 8, dotTop: -2 },
  lg: { fontSize: '2.5rem', dotSize: 11, dotTop: -3 },
};

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const s = sizes[size];

  return (
    <span
      className={`inline-flex items-baseline select-none ${className}`}
      style={{ fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif", fontWeight: 900, letterSpacing: '-0.03em' }}
      aria-label="Indectra"
    >
      <span style={{ fontSize: s.fontSize, color: '#C84632' }}>Indect</span>
      <span className="relative inline-block" style={{ fontSize: s.fontSize, color: '#C84632' }}>
        r
        {/* Brown dot above the "r" */}
        <span
          className="absolute rounded-full"
          style={{
            width: s.dotSize,
            height: s.dotSize,
            backgroundColor: '#4A3728',
            top: s.dotTop,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      </span>
      <span style={{ fontSize: s.fontSize, color: '#C84632' }}>a</span>
    </span>
  );
}
