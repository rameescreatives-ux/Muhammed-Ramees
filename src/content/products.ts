import { LEGACY_ORIGIN } from "./site";
import type { Product, Range, SubRange } from "./types";

/**
 * Product catalogue, extracted from the live unikai.com WooCommerce catalogue
 * on 19 Oct 2026.
 *
 * AUDIT NOTE — duplicate ice-cream taxonomy:
 * The legacy site has TWO ice-cream categories. `/product-category/ice-cream/`
 * is the one linked from the brands page and contains a single mislabelled
 * tile. The real 8-sub-range catalogue lives at
 * `/product-category/unikai-ice-cream-range/`. Both are consolidated here into
 * one `ice-cream` range, and both legacy URLs 301 to it (see src/lib/redirects.ts).
 *
 * Product-level detail (pack sizes, nutritionals, ingredients, barcodes) does
 * not exist anywhere on the legacy site. Those fields are intentionally empty
 * and flagged — Unikai complete them in the admin dashboard. Nothing is invented.
 */

const U = `${LEGACY_ORIGIN}/wp-content/uploads`;

export const ranges: Range[] = [
  {
    slug: "dairy",
    accent: "navy",
    name: { en: "Dairy", ar: "الألبان" },
    shortName: { en: "Dairy", ar: "الألبان" },
    tagline: {
      en: "Fresh and long-life milk, laban, yoghurt and milk powder",
      ar: "حليب طازج وطويل الأجل، لبن، زبادي ومسحوق الحليب",
    },
    description: {
      en: "The range Unikai was founded on in 1977. Pasteurised fresh milk, flavoured milk, yoghurt, laban, UHT long-life milk and milk powder, produced at our UAE facilities and distributed across the UAE and Oman.",
      ar: "المجموعة التي تأسست عليها يونيكاي عام ١٩٧٧: حليب طازج مبستر، حليب بنكهات، زبادي، لبن، حليب طويل الأجل ومسحوق الحليب، تُنتج في منشآتنا بالإمارات.",
    },
    image: "/products/dairy.webp",
    legacyUrl: "/product-category/dairy/",
  },
  {
    slug: "ice-cream",
    accent: "red",
    name: { en: "Ice Cream", ar: "الآيس كريم" },
    shortName: { en: "Ice Cream", ar: "الآيس كريم" },
    tagline: {
      en: "Lollies, bars, cones, cups, kulfi and premium tubs",
      ar: "مصاصات، ألواح، كونز، أكواب، كُلفي وعبوات فاخرة",
    },
    description: {
      en: "A full impulse and take-home ice cream portfolio spanning lollies and bars, cones and sandwiches, soft scoop, kulfi, a sugar-free line and the Royal Treat premium range.",
      ar: "محفظة متكاملة من الآيس كريم تشمل المصاصات والألواح والكونز والسوفت سكوب والكُلفي وخط خالٍ من السكر ومجموعة رويال تريت الفاخرة.",
    },
    image: "/products/ice-cream.webp",
    legacyUrl: "/product-category/unikai-ice-cream-range/",
  },
  {
    slug: "juices",
    accent: "red",
    name: { en: "Juices & Drinks", ar: "العصائر والمشروبات" },
    shortName: { en: "Juices", ar: "العصائر" },
    tagline: {
      en: "Fresh juice, long-life juice, carbonated drinks and coconut",
      ar: "عصائر طازجة وطويلة الأجل، مشروبات غازية وجوز الهند",
    },
    description: {
      en: "Chilled fresh juices, UHT long-life juices and juice drinks, the Areej and Tropical Fresh lines, and a carbonated soft drink range.",
      ar: "عصائر طازجة مبردة، وعصائر طويلة الأجل، وخطّا عريج وتروبيكال فريش، ومجموعة مشروبات غازية.",
    },
    image: "/products/juices.webp",
    legacyUrl: "/product-category/juice/",
  },
  {
    slug: "foods",
    accent: "navy",
    name: { en: "Foods", ar: "الأغذية" },
    shortName: { en: "Foods", ar: "الأغذية" },
    tagline: {
      en: "Delite cheese, cakes and nuts, and Mumtaz basmati rice",
      ar: "أجبان وكيك ومكسرات ديلايت، وأرز ممتاز البسمتي",
    },
    description: {
      en: "Processed cheese, cakes and nuts under the Delite brand, plus a basmati rice range — the ambient side of the Unikai portfolio.",
      ar: "أجبان مصنّعة وكيك ومكسرات تحت علامة ديلايت، إضافة إلى مجموعة أرز بسمتي.",
    },
    image: "/products/foods.webp",
    legacyUrl: "/product-category/foods/",
  },
];

export const subRanges: SubRange[] = [
  // ---------- DAIRY ----------
  { slug: "fresh-milk", range: "dairy", name: { en: "Fresh Milk", ar: "الحليب الطازج" }, image: `${U}/2016/02/FRESH-MILK-BOTTLE-350-1.png`, legacyUrl: "/product-category/dairy/fresh-milk/" },
  { slug: "fresh-flavoured-milk", range: "dairy", name: { en: "Fresh Flavoured Milk", ar: "الحليب الطازج بنكهات" }, image: `${U}/2016/02/STRAWBERRY-MILK-350.png`, legacyUrl: "/product-category/dairy/fresh-flavoured/" },
  { slug: "yoghurt", range: "dairy", name: { en: "Fresh Yoghurt", ar: "الزبادي الطازج" }, image: `${U}/2016/02/YOGHURT-1KG-350.png`, legacyUrl: "/product-category/dairy/yoghurt/" },
  { slug: "laban", range: "dairy", name: { en: "Laban Drink", ar: "مشروب اللبن" }, image: `${U}/2016/02/200ml-blue-laban-350.png`, legacyUrl: "/product-category/dairy/laban/" },
  {
    slug: "long-life-flavoured-milk",
    range: "dairy",
    name: { en: "Long-life Flavoured Milk", ar: "حليب بنكهات طويل الأجل" },
    legacyUrl: "/product-category/dairy/long-life-flavoured/",
    gaps: [{ field: "subRange.long-life-flavoured-milk.image", note: "Legacy site renders an empty <img src> for this sub-range. Pack shot required from Unikai.", severity: "blocker" }],
  },
  { slug: "long-life-milk", range: "dairy", name: { en: "Long Life Milk", ar: "الحليب طويل الأجل" }, image: `${U}/2016/02/1L-full-cream-milk-copy350.png`, legacyUrl: "/product-category/dairy/long-life/" },
  { slug: "milk-powder", range: "dairy", name: { en: "Milk Powder", ar: "مسحوق الحليب" }, image: `${U}/2016/02/FINAL-PACK-FINISH-350.png`, legacyUrl: "/product-category/dairy/milk-powder/" },

  // ---------- ICE CREAM ----------
  { slug: "lollies-and-bars", range: "ice-cream", name: { en: "Lollies & Bars", ar: "المصاصات والألواح" }, image: `${U}/2016/02/bars-lollies.png`, legacyUrl: "/product-category/unikai-ice-cream-range/lollies/" },
  { slug: "royal-treat", range: "ice-cream", name: { en: "Royal Treat Premium", ar: "رويال تريت الفاخرة" }, image: `${U}/2016/02/Royal-Treat-Range.png`, legacyUrl: "/product-category/unikai-ice-cream-range/bars/" },
  { slug: "cups", range: "ice-cream", name: { en: "Ice Cream Cups", ar: "أكواب الآيس كريم" }, image: `${U}/2016/02/150ML-MANGO-350px.png`, legacyUrl: "/product-category/unikai-ice-cream-range/soft-scoop-cups/" },
  { slug: "kulfi", range: "ice-cream", name: { en: "Kulfi", ar: "الكُلفي" }, image: `${U}/2016/09/PISTA-KULFI-TUB.png`, legacyUrl: "/product-category/unikai-ice-cream-range/kulfi/" },
  { slug: "sugar-free", range: "ice-cream", name: { en: "Sugar Free", ar: "خالٍ من السكر" }, image: `${U}/2016/02/Unikai_iceCream_sugerFree_tub-strawberry.png`, legacyUrl: "/product-category/unikai-ice-cream-range/sugar-free/" },
  { slug: "soft-scoop", range: "ice-cream", name: { en: "Soft Scoop", ar: "سوفت سكوب" }, image: `${U}/2016/02/Soft-Scoop-Range.png`, legacyUrl: "/product-category/unikai-ice-cream-range/soft-scoop-box/" },
  { slug: "cones-and-sandwich", range: "ice-cream", name: { en: "Cones & Sandwich", ar: "الكونز والساندويتش" }, image: `${U}/2016/02/cones-Sandwich.png`, legacyUrl: "/product-category/unikai-ice-cream-range/cone/" },
  { slug: "ice-cream-bars", range: "ice-cream", name: { en: "Bars & Sandwich", ar: "الألواح والساندويتش" }, image: `${U}/2016/02/CHOCOBAR-300.png`, legacyUrl: "/product-category/unikai-ice-cream-range/ice-cream-bars/" },

  // ---------- JUICES ----------
  { slug: "fresh-juice", range: "juices", name: { en: "Fresh Juice", ar: "العصائر الطازجة" }, image: `${U}/2016/02/ORANGE-350-1.png`, legacyUrl: "/product-category/juice/fresh-juice/" },
  { slug: "long-life-juice", range: "juices", name: { en: "Long-life Juice", ar: "العصائر طويلة الأجل" }, image: `${U}/2016/02/ORANGE-2.png`, legacyUrl: "/product-category/juice/uht-pure-juices/" },
  { slug: "areej", range: "juices", name: { en: "Areej Juice Drinks", ar: "مشروبات عريج" }, image: `${U}/2016/02/AREEJ-COCKTAIL-350.png`, legacyUrl: "/product-category/juice/areej/" },
  { slug: "uht-drinks-250ml", range: "juices", name: { en: "Long Life Juice Drinks — 250ml", ar: "مشروبات العصير طويلة الأجل — ٢٥٠ مل" }, image: `${U}/2016/02/COCKTAIL.png`, legacyUrl: "/product-category/juice/unikai-uht-drinks/" },
  { slug: "carbonated", range: "juices", name: { en: "Carbonated Soft Drinks", ar: "المشروبات الغازية" }, image: `${U}/2018/04/LEMON-1.png`, legacyUrl: "/product-category/juice/carbonated-soft-drinks/" },
  { slug: "tropical-fresh", range: "juices", name: { en: "Tropical Fresh Coconut", ar: "تروبيكال فريش — جوز الهند" }, image: `${U}/2016/02/Tropical-fresh-small.png`, legacyUrl: "/product-category/juice/tropical-fresh/" },

  // ---------- FOODS ----------
  { slug: "cheese", range: "foods", name: { en: "Delite Cheese", ar: "أجبان ديلايت" }, image: `${U}/2016/02/TRIANGLE-CHEESE-1.png`, legacyUrl: "/product-category/foods/cheese/" },
  { slug: "cakes", range: "foods", name: { en: "Delite Cakes", ar: "كيك ديلايت" }, image: `${U}/2016/02/mountain-cake-copy350.png`, legacyUrl: "/product-category/foods/cakes/" },
  { slug: "nuts", range: "foods", name: { en: "Delite Nuts", ar: "مكسرات ديلايت" }, image: `${U}/2018/05/MIXED.png`, legacyUrl: "/product-category/foods/nuts/" },
  { slug: "rice", range: "foods", name: { en: "Basmati Rice", ar: "أرز بسمتي" }, image: `${U}/2016/02/MUMTAZ-RICE-BAG-350.png`, legacyUrl: "/product-category/foods/rice/" },
];

/**
 * Individual SKUs. The legacy site exposes only two product detail pages
 * (`/product/fresh-milk/` and `/product/orange-lolly-family-pack/`), neither
 * carrying specifications. The full SKU master list is pending from Unikai.
 */
export const products: Product[] = [
  {
    slug: "fresh-milk",
    range: "dairy",
    subRange: "fresh-milk",
    name: { en: "Unikai Fresh Milk", ar: "حليب يونيكاي الطازج" },
    image: `${U}/2016/02/FRESH-MILK-BOTTLE-350-1.png`,
    gaps: [
      { field: "product.fresh-milk.description", note: "No description exists on the legacy site.", severity: "blocker" },
      { field: "product.fresh-milk.packSizes", note: "Pack sizes and case configuration required.", severity: "blocker" },
      { field: "product.fresh-milk.nutritionals", note: "Nutritional panel required from packaging artwork.", severity: "blocker" },
      { field: "product.fresh-milk.certifications", note: "Awaiting confirmation of which certifications may be displayed.", severity: "review" },
    ],
  },
  {
    slug: "orange-lolly-family-pack",
    range: "ice-cream",
    subRange: "lollies-and-bars",
    name: { en: "Orange Lolly Family Pack", ar: "عبوة عائلية مصاصة البرتقال" },
    image: `${U}/2018/03/mango-6-pk-box-small.png`,
    gaps: [
      { field: "product.orange-lolly-family-pack.image", note: "Legacy image filename is 'mango-6-pk-box' on an orange-flavour product — likely the wrong pack shot. Verify with Unikai.", severity: "review" },
      { field: "product.orange-lolly-family-pack.packSizes", note: "Pack count and case configuration required.", severity: "blocker" },
    ],
  },
];

// ---------------------------------------------------------------- lookups

export const getRange = (slug: string) => ranges.find((r) => r.slug === slug);

export const getSubRanges = (rangeSlug: string) =>
  subRanges.filter((s) => s.range === rangeSlug);

export const getSubRange = (rangeSlug: string, subSlug: string) =>
  subRanges.find((s) => s.range === rangeSlug && s.slug === subSlug);

export const getProducts = (rangeSlug: string, subSlug: string) =>
  products.filter((p) => p.range === rangeSlug && p.subRange === subSlug);

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);

export const countSubRanges = (rangeSlug: string) =>
  getSubRanges(rangeSlug).length;
