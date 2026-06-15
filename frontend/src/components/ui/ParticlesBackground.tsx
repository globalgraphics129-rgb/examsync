/**
 * AnimatedBackground — A beautiful, zero-dependency animated background
 * using pure SVG and CSS animations. Replaces the tsparticles library
 * which was causing a runtime crash.
 */
const AnimatedBackground = () => {
  // Generate a fixed set of floating orb/dot positions for the particle effect
  const dots = [
    { cx: "10%", cy: "20%", r: 1.5, delay: "0s", dur: "6s" },
    { cx: "25%", cy: "60%", r: 1, delay: "1s", dur: "8s" },
    { cx: "40%", cy: "15%", r: 2, delay: "2s", dur: "7s" },
    { cx: "55%", cy: "75%", r: 1, delay: "0.5s", dur: "9s" },
    { cx: "70%", cy: "35%", r: 1.5, delay: "1.5s", dur: "6s" },
    { cx: "85%", cy: "55%", r: 1, delay: "3s", dur: "8s" },
    { cx: "15%", cy: "85%", r: 2, delay: "2.5s", dur: "7s" },
    { cx: "90%", cy: "10%", r: 1, delay: "0.8s", dur: "10s" },
    { cx: "48%", cy: "48%", r: 1.5, delay: "4s", dur: "6s" },
    { cx: "32%", cy: "90%", r: 1, delay: "1.2s", dur: "9s" },
    { cx: "78%", cy: "80%", r: 2, delay: "3.5s", dur: "7s" },
    { cx: "60%", cy: "5%", r: 1, delay: "2.2s", dur: "8s" },
  ];

  // Static connecting lines between some dots
  const lines = [
    { x1: "10%", y1: "20%", x2: "25%", y2: "60%", delay: "0s" },
    { x1: "25%", y1: "60%", x2: "40%", y2: "15%", delay: "1s" },
    { x1: "55%", y1: "75%", x2: "70%", y2: "35%", delay: "2s" },
    { x1: "70%", y1: "35%", x2: "85%", y2: "55%", delay: "0.5s" },
    { x1: "10%", y1: "20%", x2: "40%", y2: "15%", delay: "1.5s" },
    { x1: "40%", y1: "15%", x2: "70%", y2: "35%", delay: "3s" },
    { x1: "78%", y1: "80%", x2: "85%", y2: "55%", delay: "2.5s" },
  ];

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        {/* Lines */}
        {lines.map((line, i) => (
          <line
            key={`line-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#fbbf24"
            strokeWidth="0.5"
            strokeOpacity="0"
          >
            <animate
              attributeName="stroke-opacity"
              values="0;0.15;0"
              dur="4s"
              begin={line.delay}
              repeatCount="indefinite"
            />
          </line>
        ))}

        {/* Dots */}
        {dots.map((dot, i) => (
          <circle
            key={`dot-${i}`}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill="#10b981"
            opacity="0"
          >
            <animate
              attributeName="opacity"
              values="0;0.4;0"
              dur={dot.dur}
              begin={dot.delay}
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 8,-8; -6,6; 0,0"
              dur={dot.dur}
              begin={dot.delay}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  );
};

export default AnimatedBackground;
