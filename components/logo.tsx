export function Logo({ className = 'size-7' }: { className?: string }) {
  return (
    <>
      {/* light theme: dark (black) logo */}
      <img
        src="/clouisle-light.svg"
        alt="Clouisle"
        className={`shrink-0 ${className} dark:hidden`}
      />
      {/* dark theme: white logo */}
      <img
        src="/clouisle-dark.svg"
        alt="Clouisle"
        className={`shrink-0 hidden ${className} dark:block`}
      />
    </>
  );
}
