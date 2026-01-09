export function AnimatedLogo() {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Diamond 1 - Top (White) */}
        <g className="animate-float" style={{ animationDelay: "0s" }}>
          <path
            d="M 100 40 L 115 55 L 100 70 L 85 55 Z"
            fill="none"
            stroke="white"
            strokeWidth="3"
            className="opacity-90"
          />
        </g>

        {/* Diamond 2 - Left (Yellow) */}
        <g className="animate-float" style={{ animationDelay: "0.3s" }}>
          <path
            d="M 70 70 L 85 85 L 70 100 L 55 85 Z"
            fill="none"
            stroke="#f9ec4e"
            strokeWidth="3"
            className="opacity-100 drop-shadow-[0_0_10px_rgba(249,236,78,0.5)]"
          />
        </g>

        {/* Diamond 3 - Right (Yellow) */}
        <g className="animate-float" style={{ animationDelay: "0.6s" }}>
          <path
            d="M 130 70 L 145 85 L 130 100 L 115 85 Z"
            fill="none"
            stroke="#f9ec4e"
            strokeWidth="3"
            className="opacity-100 drop-shadow-[0_0_10px_rgba(249,236,78,0.5)]"
          />
        </g>

        {/* Diamond 4 - Bottom (White) */}
        <g className="animate-float" style={{ animationDelay: "0.9s" }}>
          <path
            d="M 100 100 L 115 115 L 100 130 L 85 115 Z"
            fill="none"
            stroke="white"
            strokeWidth="3"
            className="opacity-90"
          />
        </g>

        {/* Connecting Lines */}
        <g className="opacity-30">
          {/* Top to Left */}
          <line
            x1="92"
            y1="62"
            x2="78"
            y2="78"
            stroke="#f9ec4e"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="animate-pulse"
          />
          {/* Top to Right */}
          <line
            x1="108"
            y1="62"
            x2="122"
            y2="78"
            stroke="#f9ec4e"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="animate-pulse"
            style={{ animationDelay: "0.3s" }}
          />
          {/* Left to Bottom */}
          <line
            x1="78"
            y1="92"
            x2="92"
            y2="108"
            stroke="#f9ec4e"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="animate-pulse"
            style={{ animationDelay: "0.6s" }}
          />
          {/* Right to Bottom */}
          <line
            x1="122"
            y1="92"
            x2="108"
            y2="108"
            stroke="#f9ec4e"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="animate-pulse"
            style={{ animationDelay: "0.9s" }}
          />
        </g>

        {/* Rotating outer ring */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="1"
          opacity="0.2"
          className="animate-spin"
          style={{ animationDuration: "20s" }}
        />

        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f9ec4e" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#e5d948" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f9ec4e" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent blur-2xl animate-pulse" />
    </div>
  );
}
