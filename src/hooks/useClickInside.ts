import { RefObject, useCallback, useEffect } from "react";

export function useClickInside<T extends HTMLElement = HTMLElement>(ref: RefObject<T | null>, callback: () => void) {
    const handleClick = useCallback((event: MouseEvent | FocusEvent) => {
      if (ref.current && ref.current.contains(event.target as HTMLElement)) {
        callback();
      }
    }, [ref, callback]);

    useEffect(() => {
      document.addEventListener('click', handleClick);

      return () => {
        document.removeEventListener('click', handleClick);
      };
    }, [handleClick]);
};
