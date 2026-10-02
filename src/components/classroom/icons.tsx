import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function BarnIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 30 32 12l24 18v24H8Z" fill="#e4534a" />
      <path d="M6 31 32 9l26 22" fill="none" stroke="#fff7ea" strokeWidth="4" strokeLinejoin="round" />
      <rect x="26" y="36" width="12" height="18" rx="1.5" fill="#fff7ea" />
      <path d="M32 36v18M26 45h12" stroke="#e4534a" strokeWidth="2" />
      <rect x="14" y="34" width="8" height="7" rx="1" fill="#fff7ea" />
      <rect x="42" y="34" width="8" height="7" rx="1" fill="#fff7ea" />
    </Svg>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="8" y="12" width="48" height="40" rx="8" fill="#7ec8f0" />
      <path d="M8 30h48" stroke="#fff" strokeWidth="4" />
      <path d="M30 12v40" stroke="#fff" strokeWidth="3" />
      <circle cx="44" cy="22" r="6" fill="#e4534a" />
      <path d="M44 28v7" stroke="#e4534a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="18" cy="42" r="5" fill="#3cba55" />
    </Svg>
  );
}

export function SproutIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M32 54V30" stroke="#2f9a45" strokeWidth="4" strokeLinecap="round" />
      <path d="M32 36c-10-2-16-12-14-20 8 1 14 8 14 16" fill="#67d36a" />
      <path d="M32 34c10-1 18-10 16-18-8 0-16 7-16 15" fill="#3cba55" />
      <ellipse cx="32" cy="54" rx="10" ry="3" fill="#c4a06a" />
    </Svg>
  );
}

export function NotebookIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="12" y="10" width="32" height="42" rx="4" fill="#fff7ea" stroke="#6b4424" strokeWidth="3" />
      <path d="M20 20h16M20 28h16M20 36h10" stroke="#d7b48a" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 38l12-12 4 4-12 12-5 1z" fill="#5eb7ee" />
      <path d="M50 28l4 4" stroke="#2a6f99" strokeWidth="2" />
    </Svg>
  );
}

export function ToolboxIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="8" y="24" width="48" height="28" rx="5" fill="#e4534a" />
      <path d="M22 24v-6a10 10 0 0 1 20 0v6" fill="none" stroke="#b4332c" strokeWidth="4" />
      <rect x="26" y="32" width="12" height="8" rx="2" fill="#ffd23a" />
    </Svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="12" fill="#ff9f1c" />
      <g stroke="#ff9f1c" strokeWidth="4" strokeLinecap="round">
        <path d="M32 8v8M32 48v8M8 32h8M48 32h8M14 14l6 6M44 44l6 6M14 50l6-6M44 20l6-6" />
      </g>
    </Svg>
  );
}

export function CanIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 30h26a8 8 0 0 1 8 8v6a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8V30z" fill="#ffd23a" />
      <path d="M16 30c2-12 18-14 20-4" fill="none" stroke="#e2a61a" strokeWidth="4" strokeLinecap="round" />
      <path d="M40 36h8l8-10" fill="none" stroke="#2f86c4" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="52" cy="22" r="3" fill="#5eb7ee" />
      <circle cx="58" cy="30" r="2.5" fill="#5eb7ee" />
      <circle cx="48" cy="18" r="2" fill="#5eb7ee" />
    </Svg>
  );
}

export function ShovelIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M30 26h6l2 24h-10z" fill="#e7c48a" />
      <path d="M18 10h28l-6 18H24z" fill="#f7f3ea" stroke="#d9cbb6" strokeWidth="2" />
      <ellipse cx="33" cy="54" rx="16" ry="6" fill="#6b4424" />
      <ellipse cx="28" cy="52" rx="6" ry="3" fill="#8a5a32" />
    </Svg>
  );
}

export function WindIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M10 24h28a6 6 0 1 0-2-12M10 34h36a6 6 0 1 1-2 12M10 44h18"
        fill="none"
        stroke="#2f86c4"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M32 8l6.5 14.2L54 24.4l-11 10.2 2.8 16.4L32 43.2 18.2 51l2.8-16.4L10 24.4l15.5-2.2Z"
        fill="#ffd23a"
        stroke="#e09a12"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M28 8h8l2 6 6 2 5-4 6 6-4 5 2 6 6 2v8l-6 2-2 6 4 5-6 6-5-4-6 2-2 6h-8l-2-6-6-2-5 4-6-6 4-5-2-6-6-2v-8l6-2 2-6-4-5 6-6 5 4 6-2Z"
        fill="#8d6a45"
      />
      <circle cx="32" cy="32" r="8" fill="#fff6e4" />
    </Svg>
  );
}

export function HelpIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="22" fill="#fff6e4" stroke="#6b4424" strokeWidth="3" />
      <text x="32" y="42" textAnchor="middle" fontSize="28" fontWeight="700" fill="#6b4424" fontFamily="Mali, Loma, sans-serif">
        ?
      </text>
    </Svg>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="8" y="10" width="48" height="34" rx="12" fill="#fff" />
      <path d="M20 44 18 56l16-12" fill="#fff" />
    </Svg>
  );
}

export function SpeakerIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 26h10l12-10v32L22 38H12Z" fill="#fff" />
      <path d="M42 24c4 4 4 12 0 16M48 18c7 7 7 21 0 28" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

export function MusicIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M26 46V18l24-6v28" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <circle cx="20" cy="46" r="7" fill="#fff" />
      <circle cx="44" cy="40" r="7" fill="#fff" />
    </Svg>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 40c16-2 28-16 32-32-16 2-30 16-32 32Z" fill="#3cba55" />
      <path d="M18 36c8-8 16-16 24-22" fill="none" stroke="#1f7a38" strokeWidth="2" />
    </Svg>
  );
}

export function PigFallback(props: IconProps) {
  return (
    <svg viewBox="0 0 200 280" aria-hidden="true" {...props}>
      <ellipse cx="100" cy="262" rx="46" ry="10" fill="rgba(0,0,0,.18)" />
      <path d="M58 150h84l8 70H50z" fill="#d3543c" />
      <rect x="46" y="118" width="108" height="40" rx="16" fill="#f3d27a" />
      <path d="M70 118c4-28 18-40 30-40s26 12 30 40" fill="#3a3a3a" />
      <circle cx="62" cy="78" r="28" fill="#3a3a3a" />
      <circle cx="138" cy="78" r="28" fill="#3a3a3a" />
      <circle cx="100" cy="108" r="48" fill="#3f3f3f" />
      <ellipse cx="100" cy="124" rx="22" ry="16" fill="#f2a18f" />
      <ellipse cx="92" cy="124" rx="4" ry="6" fill="#5c2e32" />
      <ellipse cx="108" cy="124" rx="4" ry="6" fill="#5c2e32" />
      <circle cx="82" cy="108" r="7" fill="#fff" />
      <circle cx="118" cy="108" r="7" fill="#fff" />
      <circle cx="84" cy="108" r="3.5" fill="#2b2118" />
      <circle cx="120" cy="108" r="3.5" fill="#2b2118" />
      <path d="M88 138c8 8 16 8 24 0" fill="none" stroke="#7a3040" strokeWidth="3" strokeLinecap="round" />
      <circle cx="128" cy="168" r="10" fill="#fff" />
      <circle cx="128" cy="168" r="4" fill="#f2c14b" />
    </svg>
  );
}

