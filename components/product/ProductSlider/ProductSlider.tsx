"use client";

import { useKeenSlider } from "keen-slider/react";
import React, {
  Children,
  isValidElement,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { a } from "@react-spring/web";
import s from "./ProductSlider.module.css";
import ProductSliderControl from "../ProductSliderControl";
import { cn } from "@lib/utils";

interface ProductSliderProps {
  children?: React.ReactNode[];
  className?: string;
}

const ProductSlider: React.FC<ProductSliderProps> = ({
  children,
  className = "",
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const thumbsContainerRef = useRef<HTMLDivElement>(null);

  const [ref, slider] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    created: () => setIsMounted(true),
    drag: true,
    rubberband: true, // Adds resistance at the end of loops
    slideChanged(s) {
      const slideNumber = s.track.details.rel;
      setCurrentSlide(slideNumber);

      if (thumbsContainerRef.current) {
        const $el = document.getElementById(`thumb-${slideNumber}`);
        if ($el) {
          // Improved smooth scrolling for thumbnails
          thumbsContainerRef.current.scrollTo({
            left:
              $el.offsetLeft -
              thumbsContainerRef.current.offsetWidth / 2 +
              $el.offsetWidth / 2,
            behavior: "smooth",
          });
        }
      }
    },
  });

  // Stop the history navigation gesture on touch devices
  useEffect(() => {
    const preventNavigation = (event: TouchEvent) => {
      // Center point of the touch area
      const touchXPosition = event.touches[0].pageX;
      // Size of the touch area
      const touchXRadius = event.touches[0].radiusX || 0;

      // We set a threshold (10px) on both sizes of the screen,
      // if the touch area overlaps with the screen edges
      // it's likely to trigger the navigation. We prevent the
      // touchstart event in that case.
      if (
        touchXPosition - touchXRadius < 10 ||
        touchXPosition + touchXRadius > window.innerWidth - 10
      )
        event.preventDefault();
    };

    const slider = sliderContainerRef.current!;

    slider.addEventListener("touchstart", preventNavigation);

    return () => {
      if (slider) {
        slider.removeEventListener("touchstart", preventNavigation);
      }
    };
  }, []);
  // useEffect(() => {
  //     const slider = sliderContainerRef.current;
  //     if (!slider) return;

  //     const preventNavigation = (event: TouchEvent) => {
  //       const touchXPosition = event.touches[0].pageX;
  //       const touchXRadius = event.touches[0].radiusX || 0;

  //       // Only prevent if very close to edges to allow browser "Back" gesture
  //       // but keep the slider responsive
  //       if (
  //         touchXPosition - touchXRadius < 10 ||
  //         touchXPosition + touchXRadius > window.innerWidth - 10
  //       ) {
  //         event.preventDefault();
  //       }
  //     };

  //     slider.addEventListener("touchstart", preventNavigation, { passive: false });
  //     return () => slider.removeEventListener("touchstart", preventNavigation);
  //   }, []);

  // const onPrev = React.useCallback(() => slider.current?.prev(), [slider]);
  // const onNext = React.useCallback(() => slider.current?.next(), [slider]);

  const onPrev = useCallback(() => slider.current?.prev(), []);
  const onNext = useCallback(() => slider.current?.next(), []);
  return (
    <div className={cn(s.root, className)} ref={sliderContainerRef}>
      <div
        ref={ref}
        className={cn(s.slider, { [s.show]: isMounted }, "keen-slider")}
      >
        {slider && <ProductSliderControl onPrev={onPrev} onNext={onNext} />}
        {Children.map(children, (child) => {
          // Add the keen-slider__slide className to children
          if (isValidElement<HTMLElement>(child)) {
            return {
              ...child,
              props: {
                ...child.props,
                className: `${
                  child.props.className ? `${child.props.className} ` : ""
                }keen-slider__slide`,
              },
            };
          }
          return child;
        })}
      </div>

      <a.div className={s.album} ref={thumbsContainerRef}>
        {slider &&
          Children.map(children, (child, idx) => {
            if (isValidElement<HTMLElement>(child)) {
              return {
                ...child,
                props: {
                  ...child.props,
                  className: cn(child.props.className, s.thumb, {
                    [s.selected]: currentSlide === idx,
                  }),
                  id: `thumb-${idx}`,
                  onClick: () => {
                    slider.current?.moveToIdx(idx);
                  },
                },
              };
            }
            return child;
          })}
      </a.div>
    </div>
  );
};

export default ProductSlider;
