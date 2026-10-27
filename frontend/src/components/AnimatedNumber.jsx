import { useEffect, useState } from "react";
import { animate } from "framer-motion";

/** Counts up from 0 to `value` (a 0-1 ratio) and shows it as a percentage. */
export default function AnimatedNumber({ value, digits = 1 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value * 100, { duration: 1.2, ease: "easeOut", onUpdate: setDisplay });
    return () => controls.stop();
  }, [value]);

  return <>{display.toFixed(digits)}%</>;
}
