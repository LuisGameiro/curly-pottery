import React, {
  useRef,
  useEffect,
  MouseEvent,
  FC,
  ReactElement,
  forwardRef,
  Ref,
  ReactNode,
} from "react";
import { mergeRefs } from "react-merge-refs";
import hasParent from "./has-parent";

interface ClickOutsideProps {
  active: boolean;
  onClick: (e?: MouseEvent) => void;
  ref?: Ref<any>;
  children?: ReactNode;
}

const ClickOutside: FC<ClickOutsideProps> = forwardRef(
  ({ active = true, onClick, children }, forwardedRef) => {
    const innerRef = useRef(null);

    const child = children ? (React.Children.only(children) as any) : undefined;

    if (!child || child.type === React.Fragment) {
      throw new Error("A valid non Fragment React Children should be provided");
    }

    if (typeof onClick != "function") {
      throw new Error("onClick must be a valid function");
    }

    useEffect(() => {
      if (active) {
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("touchstart", handleClick);
      }
      return () => {
        if (active) {
          document.removeEventListener("mousedown", handleClick);
          document.removeEventListener("touchstart", handleClick);
        }
      };
    });

    const handleClick = (event: any) => {
      if (!hasParent(event.target, innerRef?.current)) {
        onClick(event);
      }
    };

    const composedRefCallback = (element: ReactElement) => {
      if (typeof child.ref === "function") {
        child.ref(element);
      } else if (child.ref) {
        child.ref.current = element;
      }
    };

    return React.cloneElement(child, {
      ref: mergeRefs([composedRefCallback, innerRef, forwardedRef]),
    });
  },
);

ClickOutside.displayName = "ClickOutside";

export default ClickOutside;
