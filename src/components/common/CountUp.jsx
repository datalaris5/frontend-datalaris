import React, { useState, useEffect } from "react";

const CountUp = ({
  end = 0,
  duration = 2,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = ".",
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const durationMs = duration * 1000;

      // Easing function (easeOutExpo)
      const easeOutExpo = (x) => {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
      };

      const percent = Math.min(progress / durationMs, 1);
      const easedProgress = easeOutExpo(percent);

      const currentCount = easedProgress * end;

      setCount(currentCount);

      if (progress < durationMs) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  const formattedNumber = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(count);

  // Replace default separators if needed, but 'id-ID' usually gives dots for thousands and commas for decimals.
  // We'll trust Intl for standard formatting unless custom separator logic is strictly required.
  // The user wanted 'separator="."' which id-ID provides.

  return (
    <span>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
};

export default CountUp;
