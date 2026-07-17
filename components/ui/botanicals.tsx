import type { SVGProps } from "react";

/**
 * Decorative botanical line-art, drawn with `currentColor` so it inherits the
 * active theme accent (use with low-opacity text utilities, e.g.
 * `text-accent/10`). Purely cosmetic — always `aria-hidden`.
 */

/** A stylized eucalyptus-style sprig: curved stem with tapering leaves. */
export function LeafSprig(props: SVGProps<SVGSVGElement>) {
  const leaves: Array<{ x: number; y: number; angle: number; rx: number }> = [
    { x: 59, y: 212, angle: -145, rx: 16 },
    { x: 61, y: 193, angle: -35, rx: 15.5 },
    { x: 58, y: 174, angle: -146, rx: 15 },
    { x: 62, y: 155, angle: -36, rx: 14 },
    { x: 59, y: 136, angle: -147, rx: 13 },
    { x: 63, y: 117, angle: -37, rx: 12 },
    { x: 60, y: 98, angle: -148, rx: 11 },
    { x: 64, y: 79, angle: -38, rx: 10.5 },
    { x: 62, y: 60, angle: -149, rx: 10 },
    { x: 65, y: 41, angle: -39, rx: 9 },
  ];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 130 240"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M58 234 C 57 182, 60 120, 67 22"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {leaves.map((leaf, i) => (
        <g key={i} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`}>
          <ellipse cx={leaf.rx + 3} cy="0" rx={leaf.rx} ry={leaf.rx * 0.36} fill="currentColor" />
        </g>
      ))}
      {/* Terminal leaf pointing along the stem tip. */}
      <g transform="translate(67 22) rotate(-86)">
        <ellipse cx="11" cy="0" rx="10" ry="4" fill="currentColor" />
      </g>
    </svg>
  );
}
