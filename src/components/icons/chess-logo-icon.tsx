import type { SVGProps } from 'react';

export function ChessLogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10.5 2.5L8 8h8l-2.5-5.5" />
      <path d="M7.5 8H10l2-3 2 3h2.5C17.67 8 19 9.33 19 11c0 2.21-2.24 4-5 4H10c-2.76 0-5-1.79-5-4 0-1.67 1.33-3 2.5-3z" />
      <path d="M7 15s1.5 2 5 2 5-2 5-2" />
      <path d="M7 19h10" />
    </svg>
  );
}
