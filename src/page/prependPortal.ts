import { useLayoutEffect, useRef } from 'preact/hooks';
import { createPortal, ReactNode } from 'preact/compat';

export default function prependPortal(
  children: ReactNode, 
  targetContainer: HTMLElement,
  wrapperElementType: string = 'span'
) {
  const element = useRef(document.createElement(wrapperElementType));
  
  useLayoutEffect(() => {
    if (targetContainer) {
      targetContainer.insertBefore(element.current, targetContainer.firstChild);
      
      return () => {
        if (element.current.parentNode === targetContainer) {
          targetContainer.removeChild(element.current);
        }
      };
    }
  }, [targetContainer]);
  
  return createPortal(children, element.current);
}
