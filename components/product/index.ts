// Note: ProductView/ProductSlider are intentionally NOT re-exported here —
// they pull in keen-slider and react-spring, which should stay out of the
// bundles of pages that only use ProductCard.
export { default as ProductCard } from './ProductCard'
export { default as ProductOptions } from './ProductOptions'
