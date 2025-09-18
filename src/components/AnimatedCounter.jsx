import React, { useState, useEffect, useRef } from 'react';

const AnimatedCounter = ({ target, suffix = '', prefix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const targetStr = String(target); // luôn convert sang string
          let numericTarget = parseInt(targetStr.replace(/[^\d]/g, ''), 10) || 0;
          const isMillion = targetStr.includes('M');
          const isThousand = targetStr.includes('K');

          if (isMillion) numericTarget *= 1000000;
          if (isThousand) numericTarget *= 1000;

          const startTime = Date.now();

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(numericTarget * progress);

            let displayValue = current;
            if (isMillion) {
              displayValue = (current / 1000000).toFixed(1) + 'M';
            } else if (isThousand) {
              displayValue = Math.floor(current / 1000) + 'K';
            }

            setCount(displayValue);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
};

export default AnimatedCounter;


