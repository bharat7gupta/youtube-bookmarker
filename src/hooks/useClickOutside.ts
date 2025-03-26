import { RefObject, useCallback, useEffect } from "react";

export function useClickOutside<T extends HTMLElement = HTMLElement>(ref: RefObject<T | null>, callback: () => void) {
    const handleClick = useCallback((event: MouseEvent | FocusEvent) => {
      if (ref.current && event.target && !ref.current.contains(event.target as HTMLElement)) {
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
