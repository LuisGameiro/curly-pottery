// ============================================
// TEST DATA - Fully typed to match Product interface
// ============================================

import { Categories } from "@lib/types/categories";
import { url } from "node:inspector";

// Helper function to create ProductPrice objects
const createPrice = (value:number, currencyCode = 'USD', retailPrice = null) => ({
  value,
  currencyCode,
  ...(retailPrice && { retailPrice })
});

// Helper function to create ProductOption objects
const createOption = (id, displayName, values): { id: any; displayName: any; values: any; } => ({
  id,
  displayName,
  values: values.map(v => typeof v === 'string' 
    ? { label: v }
    : { label: v.label, ...(v.hexColors && { hexColors: v.hexColors }) }
  )
});

// Helper function to create ProductVariant objects
const createVariant = (id, options, price, image, available = true) => ({
  id,
  name: `Variant ${id}`,
  options,
  price: createPrice(price.value, price.currencyCode, price.retailPrice),
  ...(price.retailPrice && { 
    retailPrice: createPrice(price.retailPrice, price.currencyCode) 
  }),
  availableForSale: available,
  requiresShipping: true,
  ...(image && { image })
});

// Main products list (6 products for homepage)
const productsData = {
  products: [
    {
      id: '1',
      name: 'Test Product 1',
      description: 'A great test product with multiple variants.',
      slug: 'test-product-1',
      categories: ['plates'],
      path: '/products/test-product-1',
      images: [
        { url: 'https://picsum.photos/600/600?random=2', alt: 'Test Product 1' }
      ],
      price: { value: 2999, currencyCode: 'GBP' },
      stock: 12,
      dimensions: {
        widthCm: 28,
        heightCm: 3,
        depthCm: 28
      },
      glazeVariants: [
        { name: 'Gloss White', hex: '#f5f5f5' },
        { name: 'Ocean Blue', hex: '#2f6fa3' }
      ],
      vendor: 'Curly Pottery'
    },

    {
      id: '2',
      name: 'Stoneware Mug',
      description: 'Durable stoneware mug for daily use.',
      slug: 'stoneware-mug',
      categories: ['mugs'],
      path: '/products/stoneware-mug',
      images: [
        { url: 'https://picsum.photos/600/600?random=3', alt: 'Stoneware Mug' }
      ],
      price: { value: 1899, currencyCode: 'GBP' },
      stock: 34,
      dimensions: {
        widthCm: 9,
        heightCm: 10,
        depthCm: 9
      },
      glazeVariants: [
        { name: 'Matte Black', hex: '#2b2b2b' },
        { name: 'Speckled Cream', hex: '#e8e1d6' }
      ],
      vendor: 'Curly Pottery'
    },

    {
      id: '3',
      name: 'Ceramic Vase',
      description: 'Handcrafted ceramic vase.',
      slug: 'ceramic-vase',
      categories: ['vases'],
      path: '/products/ceramic-vase',
      images: [
        { url: 'https://picsum.photos/600/600?random=4', alt: 'Ceramic Vase' }
      ],
      price: { value: 3599, currencyCode: 'GBP' },
      stock: 8,
      dimensions: {
        widthCm: 14,
        heightCm: 26,
        depthCm: 14
      },
      glazeVariants: [
        { name: 'Forest Green', hex: '#2f5d50' },
        { name: 'Sandstone', hex: '#c8b79e' }
      ],
      vendor: 'Curly Pottery'
    },

    {
      id: '4',
      name: 'Clay Bowl',
      description: 'Minimalist clay bowl.',
      slug: 'clay-bowl',
      categories: ['bowls'],
      path: '/products/clay-bowl',
      images: [
        { url: 'https://picsum.photos/600/600?random=5', alt: 'Clay Bowl' }
      ],
      price: { value: 2499, currencyCode: 'GBP' },
      stock: 20,
      dimensions: {
        widthCm: 18,
        heightCm: 6,
        depthCm: 18
      },
      glazeVariants: [
        { name: 'Warm Beige', hex: '#d6c6ad' },
        { name: 'Charcoal', hex: '#444444' }
      ],
      vendor: 'Curly Pottery'
    },

    {
      id: '5',
      name: 'Decorative Plate',
      description: 'Decorative handmade plate.',
      slug: 'decorative-plate',
      categories: ['plates'],
      path: '/products/decorative-plate',
      images: [
        { url: 'https://picsum.photos/600/600?random=6', alt: 'Decorative Plate' }
      ],
      price: { value: 2799, currencyCode: 'GBP' },
      stock: 15,
      dimensions: {
        widthCm: 30,
        heightCm: 2.5,
        depthCm: 30
      },
      glazeVariants: [
        { name: 'Indigo', hex: '#3f51b5' },
        { name: 'Ivory', hex: '#faf7f2' }
      ],
      vendor: 'Curly Pottery'
    },

    {
      id: '6',
      name: 'Porcelain Cup',
      description: 'Fine porcelain cup.',
      slug: 'porcelain-cup',
      categories: ['cups', 'mugs'],
      path: '/products/porcelain-cup',
      images: [
        { url: 'https://picsum.photos/600/600?random=11', alt: 'Porcelain Cup' }
      ],
      price: { value: 1599, currencyCode: 'GBP' },
      stock: 40,
      dimensions: {
        widthCm: 8,
        heightCm: 9,
        depthCm: 8
      },
      glazeVariants: [
        { name: 'Pure White', hex: '#ffffff' },
        { name: 'Soft Grey', hex: '#dcdcdc' }
      ],
      vendor: 'Curly Pottery'
    },

    {
      id: '7',
      name: 'Serving Platter',
      description: 'Large serving platter for gatherings.',
      slug: 'serving-platter',
      categories: ['platters', 'plates'],
      path: '/products/serving-platter',
      images: [
        { url: 'https://picsum.photos/600/600?random=12', alt: 'Serving Platter' }
      ],
      price: { value: 4299, currencyCode: 'GBP' },
      stock: 6,
      dimensions: {
        widthCm: 40,
        heightCm: 3,
        depthCm: 28
      },
      glazeVariants: [
        { name: 'Deep Blue', hex: '#1f3c88' },
        { name: 'Stone Grey', hex: '#9e9e9e' }
      ],
      vendor: 'Curly Pottery'
    },

    {
      id: '8',
      name: 'Planter Pot',
      description: 'Indoor ceramic planter pot.',
      slug: 'planter-pot',
      categories: ['planters'],
      path: '/products/planter-pot',
      images: [
        { url: 'https://picsum.photos/600/600?random=13', alt: 'Planter Pot' }
      ],
      price: { value: 3199, currencyCode: 'GBP' },
      stock: 10,
      dimensions: {
        widthCm: 20,
        heightCm: 18,
        depthCm: 20
      },
      glazeVariants: [
        { name: 'Moss Green', hex: '#6b8f71' },
        { name: 'Terracotta', hex: '#c96f4a' }
      ],
      vendor: 'Curly Pottery'
    },

    {
      id: '9',
      name: 'Ceramic Storage Box',
      description: 'Lidded ceramic storage box.',
      slug: 'ceramic-box',
      categories: ['boxes', 'storage'],
      path: '/products/ceramic-box',
      images: [
        { url: 'https://picsum.photos/600/600?random=14', alt: 'Ceramic Box' }
      ],
      price: { value: 2899, currencyCode: 'GBP' },
      stock: 9,
      dimensions: {
        widthCm: 16,
        heightCm: 12,
        depthCm: 16
      },
      glazeVariants: [
        { name: 'Ash Grey', hex: '#b0b0b0' },
        { name: 'Midnight Blue', hex: '#1a237e' }
      ],
      vendor: 'Curly Pottery'
    },

    {
      id: '10',
      name: 'Tea Set',
      description: 'Complete handcrafted tea set.',
      slug: 'tea-set',
      categories: ['sets', 'teaware'],
      path: '/products/tea-set',
      images: [
        { url: 'https://picsum.photos/600/600?random=15', alt: 'Tea Set' }
      ],
      price: { value: 8999, currencyCode: 'GBP' },
      stock: 4,
      dimensions: {
        widthCm: 32,
        heightCm: 18,
        depthCm: 32
      },
      glazeVariants: [
        { name: 'Celadon', hex: '#9bb7a5' },
        { name: 'Crackle White', hex: '#f2efe9' }
      ],
      vendor: 'Curly Pottery'
    }
  ]
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
        { url:'https://picsum.photos/600/600?random=16', alt: 'Main View' },
        { url: 'https://picsum.photos/600/600?random=17', alt: 'Angle View' },
        { url: 'https://picsum.photos/600/600?random=18', alt: 'Detail View' }
      ],
      variants: [
        createVariant('v101-1', [
          createOption('color', 'Color', [
            { label: 'Midnight Black', hexColors: ['#000000', '#1a1a1a'] }
          ]),
          createOption('size', 'Size', ['256GB', '512GB', '1TB'])
        ], { value: 8999, retailPrice: 9999 }, 
        { url: 'https://picsum.photos/600/600?random=21', alt: 'Black Variant' }),
        createVariant('v101-2', [
          createOption('color', 'Color', [
            { label: 'Arctic Silver', hexColors: ['#c0c0c0', '#d8d8d8'] }
          ]),
          createOption('size', 'Size', ['256GB', '512GB'])
        ], { value: 8999 }, 
        { url: 'https://picsum.photos/600/600?random=22', alt: 'Silver Variant' })
      ],
      price: createPrice(8999, 'USD', 9999),
      options: [
        createOption('color', 'Color', [
          { label: 'Midnight Black', hexColors: ['#000000', '#1a1a1a'] },
          { label: 'Arctic Silver', hexColors: ['#c0c0c0', '#d8d8d8'] },
          { label: 'Ocean Blue', hexColors: ['#1e3a8a', '#3b82f6'] }
        ]),
        createOption('size', 'Size', ['256GB', '512GB', '1TB']),
        createOption('warranty', 'Warranty', ['1 Year', '2 Years', '3 Years'])
      ],
      vendor: 'Premium Electronics Co.',
      sku: `PROD-${slug.toUpperCase()}`
    }
  };
};

// Related products (4 products)
const relatedProductsData = {
  products: [
    productsData.products[2],
    productsData.products[5],
    productsData.products[3],
    productsData.products[6],
    productsData.products[1],

  ]
};

// Static pages data
const pagesData = {
  pages: [
    { id: 'page-1', title: 'About Us', slug: 'about-us', body: 'Test about page content.' ,url: '/about'},
    { id: 'page-2', title: 'Contact', slug: 'contact', body: 'Test contact page content.' ,url: '/contact'}
  ]
};

// Site info data
const siteInfoData = {
  categories: [
    { id: 'cat-1', name: 'Electronics', slug: 'electronics', productCount: 12 },
    { id: 'cat-2', name: 'Clothing', slug: 'clothing', productCount: 24 }
  ],
  brands: [
    { id: 'brand-1', name: 'Brand A', slug: 'brand-a' },
    { id: 'brand-2', name: 'Brand B', slug: 'brand-b' }
  ]
};





// 3. Site categories and brands
const siteInfo = {
  categories: [
    { id: 1, name: 'Electronics', slug: 'electronics', productCount: 12 },
    { id: 2, name: 'Clothing', slug: 'clothing', productCount: 24 }
  ],
  brands: [
    { id: 1, name: 'Brand A', slug: 'brand-a' },
    { id: 2, name: 'Brand B', slug: 'brand-b' }
  ]
};





// ============================================
// ASSIGN DATA (matching your destructuring pattern)
// ============================================

// const { products } = productsData;
// const { pages } = pagesData;
// const { categories, brands } = siteInfo;

export { productsData, pagesData, siteInfo ,categories,getSingleProductData ,relatedProductsData};

// // Get single product detail based on the slug from params
// // Replace 'test-product-1' with params!.slug from your actual params
// const productSlug = params!.slug || 'test-product-1';
// const { product } = getSingleProductData(productSlug);

// // Get related products
// const { products: relatedProducts } = relatedProductsData;

// // Now you have: products, pages, categories, brands, product, relatedProducts