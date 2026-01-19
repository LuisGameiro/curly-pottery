import { MouseEventHandler, memo } from "react";
import cn from "clsx";
import s from "./ProductSliderControl.module.css";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ProductSliderControl {
  onPrev: MouseEventHandler<HTMLButtonElement>;
  onNext: MouseEventHandler<HTMLButtonElement>;
}

const ProductSliderControl = (
  {
    onPrev,
    onNext
  }: ProductSliderControl
) => (<div className={s.control}>
  <button
    className={cn(s.leftControl)}
    onClick={onPrev}
    aria-label="Previous Product Image"
  >
    <ArrowLeft />
  </button>
  <button
    className={cn(s.rightControl)}
    onClick={onNext}
    aria-label="Next Product Image"
  >
    <ArrowRight />
  </button>
</div>);

export default memo(ProductSliderControl);
