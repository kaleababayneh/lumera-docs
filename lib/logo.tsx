export function LumeraLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="hsl(174, 72%, 30%)" />
      <path
        d="M8 24V8h3.5v12.8h8.2V24H8Z"
        fill="white"
      />
      <path
        d="M20.5 8h3.5v16h-3.5V8Z"
        fill="hsl(170, 65%, 75%)"
      />
    </svg>
  );
}
