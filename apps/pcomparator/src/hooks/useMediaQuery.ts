import { useCallback, useLayoutEffect, useState } from "react";

export enum MediaQuery {
  sm = "(max-width: 640px)",
  md = "(max-width: 768px)",
  lg = "(max-width: 1024px)",
  xl = "(max-width: 1280px)",
  xxl = "(max-width: 1536px)"
}

const useMediaQuery = (mediaScreen: MediaQuery) => {
  const [targetReached, setTargetReached] = useState<boolean | undefined>(undefined);

  const updateTarget = useCallback((e: MediaQueryListEvent) => {
    if (e.matches) {
      setTargetReached(true);
    } else {
      setTargetReached(false);
    }
  }, []);

  useLayoutEffect(() => {
    targetReached === undefined && setTargetReached(false);
    const media = window.matchMedia(mediaScreen);
    media.addEventListener("change", updateTarget);

    if (media.matches) setTargetReached(true);

    return () => media.removeEventListener("change", updateTarget);
  }, []);

  return targetReached;
};

export default useMediaQuery;
