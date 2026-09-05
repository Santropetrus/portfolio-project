import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement>;

function Dasar({ children, ...sisa }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...sisa}
    >
      {children}
    </svg>
  );
}

export const IkonSurel = (p: Props) => (
  <Dasar {...p}>
    <rect x="2.75" y="5" width="18.5" height="14" rx="1.6" />
    <path d="m3.5 6.5 8.5 6 8.5-6" />
  </Dasar>
);

export const IkonMenu = (p: Props) => (
  <Dasar {...p}>
    <path d="M4 10h16M4 14h16" />
  </Dasar>
);

export const IkonTutup = (p: Props) => (
  <Dasar {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Dasar>
);

export const IkonPanah = (p: Props) => (
  <Dasar {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Dasar>
);
