// Partavio 品牌标识。LogoMark = 蓝色切角方块 + 镂空 P 图标(任何背景都清晰);
// Logo = 图标 + PARTAVIO 字标(浅底两色,深底用 light 转白)。
export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="pvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2B6CF6" />
          <stop offset="100%" stopColor="#0B3FA8" />
        </linearGradient>
      </defs>
      <path d="M28 0 H120 L120 92 L92 120 H0 L0 28 Z" fill="url(#pvGrad)" />
      <path d="M34 26 H74 a24 24 0 0 1 0 48 H54 V94 H34 Z M54 44 V56 H72 a6 6 0 0 0 0 -12 Z" fill="#ffffff" fillRule="evenodd" />
      <path d="M84 84 L108 84 L96 108 L72 108 Z" fill="#ffffff" opacity="0.85" />
    </svg>
  );
}

export function Logo({ className = "", light = false, markSize = 36 }: { className?: string; light?: boolean; markSize?: number }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={markSize} />
      <span className="text-2xl font-black leading-none tracking-tight">
        {light ? (
          <span className="text-white">PARTAVIO</span>
        ) : (
          <>
            <span className="text-[#0B2545]">PART</span>
            <span className="text-[#2B6CF6]">AVIO</span>
          </>
        )}
      </span>
    </span>
  );
}
