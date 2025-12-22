// ============================================
// TEST DATA - Fully typed to match Product interface
// ============================================

// Helper function to create ProductPrice objects
const createPrice = (
  value: number,
  currencyCode = 'USD',
  retailPrice = null,
) => ({
  value,
  currencyCode,
  ...(retailPrice && { retailPrice }),
})

// Helper function to create ProductOption objects
const createOption = (
  id,
  displayName,
  values,
): { id: any; displayName: any; values: any } => ({
  id,
  displayName,
  values: values.map((v) =>
    typeof v === 'string'
      ? { label: v }
      : { label: v.label, ...(v.hexColors && { hexColors: v.hexColors }) },
  ),
})

// Helper function to create ProductVariant objects
const createVariant = (id, options, price, image, available = true) => ({
  id,
  name: `Variant ${id}`,
  options,
  price: createPrice(price.value, price.currencyCode, price.retailPrice),
  ...(price.retailPrice && {
    retailPrice: createPrice(price.retailPrice, price.currencyCode),
  }),
  availableForSale: available,
  requiresShipping: true,
  ...(image && { image }),
})

// Main products list (6 products for homepage)
const productsData = {
  products: [
    {
      id: '1',
      name: 'Test Product 1',
      description: 'A great test product with multiple variants.',
      descriptionHtml: '<p>A great test product with multiple variants.</p>',
      slug: 'test-product-1',
      path: '/products/test-product-1',
      images: [
        { url: '/test-image1.jpg', alt: 'Test Product 1 Main' },
        { url: '/test-image1-2.jpg', alt: 'Test Product 1 Alternate' },
      ],
      variants: [
        createVariant(
          'v1-1',
          [
            createOption('color', 'Color', [
              { label: 'Red', hexColors: ['#ff0000'] },
              { label: 'Blue', hexColors: ['#0000ff'] },
            ]),
          ],
          { value: 2999, retailPrice: 3999 },
          { url: '/test-image1-red.jpg', alt: 'Red Variant' },
        ),
        createVariant(
          'v1-2',
          [
            createOption('color', 'Color', [
              { label: 'Blue', hexColors: ['#0000ff'] },
            ]),
          ],
          { value: 2999 },
          { url: '/test-image1-blue.jpg', alt: 'Blue Variant' },
        ),
      ],
      price: createPrice(2999, 'USD', 3999),
      options: [
        createOption('color', 'Color', ['Red', 'Blue', 'Green']),
        createOption('size', 'Size', ['Small', 'Medium', 'Large']),
      ],
      vendor: 'Test Vendor A',
    },
    {
      id: '2',
      name: 'Test Product 2',
      description: 'Another excellent item with premium features.',
      slug: 'test-product-2',
      path: '/products/test-product-2',
      images: [{ url: '/test-image2.jpg', alt: 'Test Product 2' }],
      variants: [
        createVariant(
          'v2-1',
          [createOption('material', 'Material', ['Wood', 'Metal'])],
          { value: 4999 },
          { url: '/test-image2.jpg', alt: 'Standard Variant' },
        ),
      ],
      price: createPrice(4999, 'USD'),
      options: [createOption('material', 'Material', ['Wood', 'Metal'])],
      vendor: 'Test Vendor B',
    },
    // Add more products following the same structure...
  ],
}

// Single product detail (with full variant/option structure)
const getSingleProductData = (slug) => {
  return {
    product: {
      id: '101',
      name: `Detailed Product: ${slug}`,
      description: `Complete description for ${slug} with all product details.`,
      descriptionHtml: `<p>Complete description for <strong>${slug}</strong> with all product details.</p>`,
      slug,
      path: `/products/${slug}`,
      images: [
        { url: `/products/${slug}/main.jpg`, alt: 'Main View' },
        { url: `/products/${slug}/angle.jpg`, alt: 'Angle View' },
        { url: `/products/${slug}/detail.jpg`, alt: 'Detail View' },
      ],
      variants: [
        createVariant(
          'v101-1',
          [
            createOption('color', 'Color', [
              { label: 'Midnight Black', hexColors: ['#000000', '#1a1a1a'] },
            ]),
            createOption('size', 'Size', ['256GB', '512GB', '1TB']),
          ],
          { value: 8999, retailPrice: 9999 },
          { url: `/products/${slug}/black.jpg`, alt: 'Black Variant' },
        ),
        createVariant(
          'v101-2',
          [
            createOption('color', 'Color', [
              { label: 'Arctic Silver', hexColors: ['#c0c0c0', '#d8d8d8'] },
            ]),
            createOption('size', 'Size', ['256GB', '512GB']),
          ],
          { value: 8999 },
          { url: `/products/${slug}/silver.jpg`, alt: 'Silver Variant' },
        ),
      ],
      price: createPrice(8999, 'USD', 9999),
      options: [
        createOption('color', 'Color', [
          { label: 'Midnight Black', hexColors: ['#000000', '#1a1a1a'] },
          { label: 'Arctic Silver', hexColors: ['#c0c0c0', '#d8d8d8'] },
          { label: 'Ocean Blue', hexColors: ['#1e3a8a', '#3b82f6'] },
        ]),
        createOption('size', 'Size', ['256GB', '512GB', '1TB']),
        createOption('warranty', 'Warranty', ['1 Year', '2 Years', '3 Years']),
      ],
      vendor: 'Premium Electronics Co.',
      sku: `PROD-${slug.toUpperCase()}`,
    },
  }
}

// Related products (4 products)
const relatedProductsData = {
  products: [
    {
      id: '7',
      name: 'Related Product 1',
      description: 'Compatible accessory for the main product.',
      slug: 'related-1',
      path: '/products/related-1',
      images: [{ url: '/related1.jpg', alt: 'Related Product 1' }],
      variants: [
        createVariant(
          'v7-1',
          [],
          { value: 3499 },
          { url: '/related1.jpg', alt: 'Standard' },
        ),
      ],
      price: createPrice(3499, 'USD'),
      options: [createOption('type', 'Type', ['Standard', 'Pro'])],
      vendor: 'Accessory Maker',
    },
    // Add 3 more related products...
  ],
}

// Static pages data
const pagesData = {
  pages: [
    {
      id: 'page-1',
      title: 'About Us',
      slug: 'about-us',
      body: 'Test about page content.',
    },
    {
      id: 'page-2',
      title: 'Contact',
      slug: 'contact',
      body: 'Test contact page content.',
    },
  ],
}

// Site info data
const siteInfoData = {
  categories: [
    { id: 'cat-1', name: 'Electronics', slug: 'electronics', productCount: 12 },
    { id: 'cat-2', name: 'Clothing', slug: 'clothing', productCount: 24 },
  ],
  brands: [
    { id: 'brand-1', name: 'Brand A', slug: 'brand-a' },
    { id: 'brand-2', name: 'Brand B', slug: 'brand-b' },
  ],
}

// 3. Site categories and brands
const siteInfo = {
  categories: [
    { id: 1, name: 'Electronics', slug: 'electronics', productCount: 12 },
    { id: 2, name: 'Clothing', slug: 'clothing', productCount: 24 },
  ],
  brands: [
    { id: 1, name: 'Brand A', slug: 'brand-a' },
    { id: 2, name: 'Brand B', slug: 'brand-b' },
  ],
}

// ============================================
// ASSIGN DATA (matching your destructuring pattern)
// ============================================

// const { products } = productsData;
// const { pages } = pagesData;
// const { categories, brands } = siteInfo;

export {
  productsData,
  pagesData,
  siteInfo,
  getSingleProductData,
  relatedProductsData,
}

// // Get single product detail based on the slug from params
// // Replace 'test-product-1' with params!.slug from your actual params
// const productSlug = params!.slug || 'test-product-1';
// const { product } = getSingleProductData(productSlug);

// // Get related products
// const { products: relatedProducts } = relatedProductsData;

// // Now you have: products, pages, categories, brands, product, relatedProducts
