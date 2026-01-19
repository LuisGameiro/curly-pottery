import React, {
  useRef,
  useEffect,
  forwardRef,
  ReactElement,
  useCallback,
} from "react";
import { mergeRefs } from "react-merge-refs";
import hasParent from "./has-parent";

interface ClickOutsideProps {
  active?: boolean; 
  onClick: (e: MouseEvent | TouchEvent) => void;
  children: ReactElement; 
}

const ClickOutside = forwardRef<HTMLElement, ClickOutsideProps>(
  ({ active = true, onClick, children }, forwardedRef) => {
    const innerRef = useRef<HTMLElement>(null);

    const child = React.Children.only(children);

    if (!child || child.type === React.Fragment) {
      throw new Error("ClickOutside: A valid non-Fragment React element must be provided.");
    }

    // 4. Memoize handleClick to prevent useEffect from re-running on every render
    const handleClick = useCallback(
      (event: MouseEvent | TouchEvent) => {
        if (innerRef.current && !hasParent(event.target as Node, innerRef.current)) {
          onClick(event);
        }
      },
      [onClick, innerRef]
    );

    useEffect(() => {
      if (active) {
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("touchstart", handleClick);
      }

      return () => {
        document.removeEventListener("mousedown", handleClick);
        document.removeEventListener("touchstart", handleClick);
      };
    }, [active, handleClick]);

    // 5. Simplify Ref Merging
    const composedRefs = mergeRefs([
      (child as any).ref, 
      innerRef,
      forwardedRef,
    ]);

    return React.cloneElement(child, {
      ref: composedRefs,
    });
  }
);

ClickOutside.displayName = "ClickOutside";

export default ClickOutside;