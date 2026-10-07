/** A typographic house mark, drawn locally with no external assets. */
export function Monogram({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="56"
      viewBox="0 0 48 56"
      fill="none"
      aria-hidden="true"
    >
      <path d="M24 2 44 12v31L24 54 4 43V12Z" stroke="currentColor" />
      <path d="M24 6 40 14v27L24 50 8 41V14Z" stroke="currentColor" strokeWidth="0.5" />
      <text
        x="24"
        y="37"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="Baskerville, Georgia, serif"
        fontSize="31"
      >
        R
      </text>
    </svg>
  );
}
