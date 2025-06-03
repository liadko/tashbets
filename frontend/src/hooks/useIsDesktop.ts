import { useState, useEffect } from "react";

export function useIsDesktop(breakpoint = 768): boolean {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth > breakpoint : false
  );

  useEffect(() => {
    const onResize = () => {
      setIsDesktop(window.innerWidth > breakpoint);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isDesktop;
}
