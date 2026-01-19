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
  active?: boolean; // Made optional since you provide a default
  onClick: (e: MouseEvent | TouchEvent) => void;
  children: ReactElement; // Required, as the component crashes without it
}

// 1. Properly typed forwardRef: <RefType, PropsType>
const ClickOutside = forwardRef<HTMLElement, ClickOutsideProps>(
  ({ active = true, onClick, children }, forwardedRef) => {
    const innerRef = useRef<HTMLElement>(null);

    // 2. Remove @ts-ignore and use Children.only properly
    const child = React.Children.only(children);

    // 3. Validation
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
    // mergeRefs handles function refs and object refs automatically.
    // We include the child's own ref to ensure we don't overwrite it.
    const composedRefs = mergeRefs([
      (child as any).ref, // Capture existing ref on the child
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