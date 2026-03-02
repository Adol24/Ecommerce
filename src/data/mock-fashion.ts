import type { Category, Brand } from "@/types"
import type {
  FashionProduct,
  FashionHeroSlide,
  FashionMiniSlotBanner,
  FashionCollectionCard,
  FashionReview,
  FashionBlogPost,
} from "@/types/fashion"

// ── Categorías ──────────────────────────────────────────────────────

export const fashionCategories: Category[] = [
  { id: "fc1", name: "Hombres", slug: "hombres", icon: "User", productCount: 48 },
  { id: "fc2", name: "Mujeres", slug: "mujeres", icon: "User", productCount: 72 },
  { id: "fc3", name: "Niños", slug: "ninos", icon: "Baby", productCount: 35 },
  { id: "fc4", name: "Pantalones", slug: "pantalones", icon: "Shirt", productCount: 29 },
  { id: "fc5", name: "Playeras", slug: "playeras", icon: "Shirt", productCount: 54 },
  { id: "fc6", name: "Suéteres", slug: "sueteres", icon: "Shirt", productCount: 22 },
  { id: "fc7", name: "Zapatos", slug: "zapatos", icon: "Footprints", productCount: 41 },
  { id: "fc8", name: "Accesorios", slug: "accesorios", icon: "Watch", productCount: 33 },
]

// ── Marcas ─────────────────────────────────────────────────────────

export const fashionBrands: Brand[] = [
  { id: "fb1", name: "Zara", slug: "zara", productCount: 28 },
  { id: "fb2", name: "H&M", slug: "hm", productCount: 35 },
  { id: "fb3", name: "Nike", slug: "nike", productCount: 22 },
  { id: "fb4", name: "Adidas", slug: "adidas", productCount: 19 },
  { id: "fb5", name: "Levi's", slug: "levis", productCount: 15 },
  { id: "fb6", name: "Pull&Bear", slug: "pull-bear", productCount: 24 },
  { id: "fb7", name: "Mango", slug: "mango", productCount: 18 },
  { id: "fb8", name: "Bershka", slug: "bershka", productCount: 21 },
]

// ── Productos de ropa ───────────────────────────────────────────────

export const fashionProducts: FashionProduct[] = [
  {
    id: "fp1",
    name: "Vestido Floral Primavera",
    slug: "vestido-floral-primavera",
    brand: "Zara",
    brandId: "fb1",
    category: "mujeres",
    categoryId: "fc2",
    price: 899,
    originalPrice: 1199,
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600",
    ],
    description:
      "Vestido floral de corte midi perfecto para la temporada primavera-verano. Tela ligera de algodón con estampado botánico, cuello redondo y manga corta. Ideal para uso casual o eventos al aire libre.",
    specs: {},
    stock: 24,
    isNew: true,
    isFeatured: true,
    rating: 4.7,
    gender: "mujer",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Rojo Floral", hex: "#e84562", images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600"] },
      { name: "Azul Marino", hex: "#1e3a5f", images: ["https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600"] },
      { name: "Verde Olivo", hex: "#6b7c3d", images: ["https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600"] },
    ],
    variants: [
      { id: "v1", productId: "fp1", size: "XS", color: "Rojo Floral", colorHex: "#e84562", stock: 3 },
      { id: "v2", productId: "fp1", size: "S", color: "Rojo Floral", colorHex: "#e84562", stock: 5 },
      { id: "v3", productId: "fp1", size: "M", color: "Rojo Floral", colorHex: "#e84562", stock: 4 },
      { id: "v4", productId: "fp1", size: "L", color: "Rojo Floral", colorHex: "#e84562", stock: 2 },
      { id: "v5", productId: "fp1", size: "XL", color: "Rojo Floral", colorHex: "#e84562", stock: 0 },
      { id: "v6", productId: "fp1", size: "S", color: "Azul Marino", colorHex: "#1e3a5f", stock: 6 },
      { id: "v7", productId: "fp1", size: "M", color: "Azul Marino", colorHex: "#1e3a5f", stock: 4 },
    ],
    material: "100% Algodón",
    care: ["Lavar a máquina 30°C", "No usar blanqueador", "Planchar temperatura media", "No usar secadora"],
    fit: "regular",
    season: "primavera",
    collectionTag: "Colección Primavera 2026",
  },
  {
    id: "fp2",
    name: "Playera Oversize Básica",
    slug: "playera-oversize-basica",
    brand: "H&M",
    brandId: "fb2",
    category: "playeras",
    categoryId: "fc5",
    price: 299,
    originalPrice: 399,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600",
    ],
    description: "Playera de corte oversize en algodón suave. Cuello redondo, manga corta. Perfecta para el día a día.",
    specs: {},
    stock: 80,
    isNew: false,
    isFeatured: true,
    rating: 4.5,
    gender: "unisex",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Blanco", hex: "#ffffff", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"] },
      { name: "Negro", hex: "#111111", images: ["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600"] },
      { name: "Gris", hex: "#9ca3af" },
      { name: "Rosa Palo", hex: "#f4a7b9" },
    ],
    variants: [
      { id: "v10", productId: "fp2", size: "S", color: "Blanco", colorHex: "#ffffff", stock: 12 },
      { id: "v11", productId: "fp2", size: "M", color: "Blanco", colorHex: "#ffffff", stock: 15 },
      { id: "v12", productId: "fp2", size: "L", color: "Blanco", colorHex: "#ffffff", stock: 10 },
      { id: "v13", productId: "fp2", size: "S", color: "Negro", colorHex: "#111111", stock: 8 },
      { id: "v14", productId: "fp2", size: "M", color: "Negro", colorHex: "#111111", stock: 14 },
      { id: "v15", productId: "fp2", size: "L", color: "Negro", colorHex: "#111111", stock: 9 },
      { id: "v16", productId: "fp2", size: "XL", color: "Negro", colorHex: "#111111", stock: 6 },
    ],
    material: "100% Algodón",
    care: ["Lavar a máquina 40°C", "Apta para secadora"],
    fit: "oversized",
    season: "todo el año",
    collectionTag: "Colección Básicos",
  },
  {
    id: "fp3",
    name: "Jeans Slim Fit Hombre",
    slug: "jeans-slim-fit-hombre",
    brand: "Levi's",
    brandId: "fb5",
    category: "pantalones",
    categoryId: "fc4",
    price: 1199,
    originalPrice: 1499,
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
      "https://images.unsplash.com/photo-1600717707880-17da9ef27e7a?w=600",
    ],
    description: "Jeans slim fit en denim de alta calidad. Corte moderno que se adapta a la silueta. Con 5 bolsas clásicas.",
    specs: {},
    stock: 45,
    isNew: false,
    isFeatured: true,
    rating: 4.8,
    gender: "hombre",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Azul Denim", hex: "#3b5998", images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"] },
      { name: "Negro", hex: "#111111", images: ["https://images.unsplash.com/photo-1600717707880-17da9ef27e7a?w=600"] },
    ],
    variants: [
      { id: "v20", productId: "fp3", size: "S", color: "Azul Denim", colorHex: "#3b5998", stock: 5 },
      { id: "v21", productId: "fp3", size: "M", color: "Azul Denim", colorHex: "#3b5998", stock: 8 },
      { id: "v22", productId: "fp3", size: "L", color: "Azul Denim", colorHex: "#3b5998", stock: 6 },
      { id: "v23", productId: "fp3", size: "XL", color: "Azul Denim", colorHex: "#3b5998", stock: 4 },
      { id: "v24", productId: "fp3", size: "M", color: "Negro", colorHex: "#111111", stock: 7 },
      { id: "v25", productId: "fp3", size: "L", color: "Negro", colorHex: "#111111", stock: 5 },
    ],
    material: "98% Algodón, 2% Elastano",
    care: ["Lavar a máquina 30°C", "No usar blanqueador", "Planchar al revés"],
    fit: "slim",
    season: "todo el año",
    collectionTag: "Colección Básicos",
  },
  {
    id: "fp4",
    name: "Blusa Manga Campana",
    slug: "blusa-manga-campana",
    brand: "Mango",
    brandId: "fb7",
    category: "mujeres",
    categoryId: "fc2",
    price: 649,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600",
    ],
    description: "Blusa elegante con manga campana. Tejido de gasa fluida. Perfecta para combinar con jeans o falda.",
    specs: {},
    stock: 30,
    isNew: true,
    isFeatured: false,
    rating: 4.3,
    gender: "mujer",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Blanco", hex: "#f5f5f5" },
      { name: "Coral", hex: "#e84562" },
      { name: "Mostaza", hex: "#d4a017" },
    ],
    variants: [
      { id: "v30", productId: "fp4", size: "XS", color: "Blanco", colorHex: "#f5f5f5", stock: 4 },
      { id: "v31", productId: "fp4", size: "S", color: "Blanco", colorHex: "#f5f5f5", stock: 6 },
      { id: "v32", productId: "fp4", size: "M", color: "Blanco", colorHex: "#f5f5f5", stock: 5 },
      { id: "v33", productId: "fp4", size: "S", color: "Coral", colorHex: "#e84562", stock: 3 },
      { id: "v34", productId: "fp4", size: "M", color: "Coral", colorHex: "#e84562", stock: 4 },
    ],
    material: "100% Poliéster",
    care: ["Lavar a mano", "No usar secadora"],
    fit: "regular",
    season: "primavera",
  },
  {
    id: "fp5",
    name: "Sudadera con Capucha Nike",
    slug: "sudadera-con-capucha-nike",
    brand: "Nike",
    brandId: "fb3",
    category: "sueteres",
    categoryId: "fc6",
    price: 1499,
    originalPrice: 1899,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600",
      "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600",
    ],
    description: "Sudadera con capucha Nike en tejido polar suave. Logo bordado en el pecho. Bolsa canguro frontal.",
    specs: {},
    stock: 55,
    isNew: false,
    isFeatured: true,
    rating: 4.9,
    gender: "unisex",
    sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    colors: [
      { name: "Negro", hex: "#111111" },
      { name: "Gris", hex: "#6b7280" },
      { name: "Azul Rey", hex: "#1d4ed8" },
      { name: "Rojo", hex: "#dc2626" },
    ],
    variants: [
      { id: "v40", productId: "fp5", size: "S", color: "Negro", colorHex: "#111111", stock: 8 },
      { id: "v41", productId: "fp5", size: "M", color: "Negro", colorHex: "#111111", stock: 12 },
      { id: "v42", productId: "fp5", size: "L", color: "Negro", colorHex: "#111111", stock: 10 },
      { id: "v43", productId: "fp5", size: "XL", color: "Negro", colorHex: "#111111", stock: 6 },
      { id: "v44", productId: "fp5", size: "M", color: "Gris", colorHex: "#6b7280", stock: 9 },
      { id: "v45", productId: "fp5", size: "L", color: "Gris", colorHex: "#6b7280", stock: 7 },
    ],
    material: "80% Algodón, 20% Poliéster",
    care: ["Lavar a máquina 30°C", "Planchar sin capucha"],
    fit: "regular",
    season: "invierno",
    collectionTag: "Colección Deportiva",
  },
  {
    id: "fp6",
    name: "Falda Midi Plisada",
    slug: "falda-midi-plisada",
    brand: "Zara",
    brandId: "fb1",
    category: "mujeres",
    categoryId: "fc2",
    price: 749,
    images: [
      "https://images.unsplash.com/photo-1583496661160-fb5218afa9a4?w=600",
      "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600",
    ],
    description: "Falda midi plisada con cintura elástica. Tela satinada con caída elegante. Versátil para el día y la noche.",
    specs: {},
    stock: 20,
    isNew: true,
    isFeatured: false,
    rating: 4.6,
    gender: "mujer",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Champagne", hex: "#f5e6ca" },
      { name: "Negro", hex: "#111111" },
      { name: "Verde Esmeralda", hex: "#059669" },
    ],
    variants: [
      { id: "v50", productId: "fp6", size: "XS", color: "Champagne", colorHex: "#f5e6ca", stock: 2 },
      { id: "v51", productId: "fp6", size: "S", color: "Champagne", colorHex: "#f5e6ca", stock: 4 },
      { id: "v52", productId: "fp6", size: "M", color: "Champagne", colorHex: "#f5e6ca", stock: 3 },
      { id: "v53", productId: "fp6", size: "M", color: "Negro", colorHex: "#111111", stock: 5 },
      { id: "v54", productId: "fp6", size: "L", color: "Negro", colorHex: "#111111", stock: 4 },
    ],
    material: "100% Poliéster Satinado",
    care: ["Lavar en seco", "Planchar temperatura baja"],
    fit: "regular",
    season: "primavera",
  },
  {
    id: "fp7",
    name: "Conjunto Deportivo Adidas",
    slug: "conjunto-deportivo-adidas",
    brand: "Adidas",
    brandId: "fb4",
    category: "hombres",
    categoryId: "fc1",
    price: 1899,
    originalPrice: 2399,
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600",
    ],
    description:
      "Conjunto deportivo de dos piezas: pantalón y chamarra. Tela técnica con absorción de humedad. Incluye franjas icónicas de Adidas.",
    specs: {},
    stock: 40,
    isNew: false,
    isFeatured: true,
    rating: 4.7,
    gender: "hombre",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Negro/Blanco", hex: "#111111" },
      { name: "Azul Navy", hex: "#1e3a5f" },
    ],
    variants: [
      { id: "v60", productId: "fp7", size: "M", color: "Negro/Blanco", colorHex: "#111111", stock: 10 },
      { id: "v61", productId: "fp7", size: "L", color: "Negro/Blanco", colorHex: "#111111", stock: 8 },
      { id: "v62", productId: "fp7", size: "XL", color: "Negro/Blanco", colorHex: "#111111", stock: 6 },
      { id: "v63", productId: "fp7", size: "M", color: "Azul Navy", colorHex: "#1e3a5f", stock: 7 },
      { id: "v64", productId: "fp7", size: "L", color: "Azul Navy", colorHex: "#1e3a5f", stock: 5 },
    ],
    material: "100% Poliéster Reciclado",
    care: ["Lavar a máquina 30°C", "No usar blanqueador"],
    fit: "regular",
    season: "todo el año",
    collectionTag: "Colección Deportiva",
  },
  {
    id: "fp8",
    name: "Chamarra de Cuero Sintético",
    slug: "chamarra-cuero-sintetico",
    brand: "Pull&Bear",
    brandId: "fb6",
    category: "hombres",
    categoryId: "fc1",
    price: 1599,
    originalPrice: 1999,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
    ],
    description:
      "Chamarra de cuero sintético con cierre YKK. Diseño moto con solapas. Bolsas con cierre en el pecho y frontales.",
    specs: {},
    stock: 18,
    isNew: false,
    isFeatured: false,
    rating: 4.4,
    gender: "hombre",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Negro", hex: "#111111" },
      { name: "Café", hex: "#7c3f00" },
    ],
    variants: [
      { id: "v70", productId: "fp8", size: "S", color: "Negro", colorHex: "#111111", stock: 3 },
      { id: "v71", productId: "fp8", size: "M", color: "Negro", colorHex: "#111111", stock: 5 },
      { id: "v72", productId: "fp8", size: "L", color: "Negro", colorHex: "#111111", stock: 4 },
      { id: "v73", productId: "fp8", size: "M", color: "Café", colorHex: "#7c3f00", stock: 3 },
    ],
    material: "Exterior: PU Sintético | Forro: Poliéster",
    care: ["Limpiar con paño húmedo", "No lavar en máquina"],
    fit: "regular",
    season: "otoño",
  },
  {
    id: "fp9",
    name: "Vestido Niña Bordado",
    slug: "vestido-nina-bordado",
    brand: "Bershka",
    brandId: "fb8",
    category: "ninos",
    categoryId: "fc3",
    price: 449,
    images: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf6?w=600",
    ],
    description: "Vestido infantil con bordados florales. Falda con volantes. Muy cómodo y fácil de lavar.",
    specs: {},
    stock: 25,
    isNew: true,
    isFeatured: false,
    rating: 4.8,
    gender: "niña",
    sizes: ["4", "6", "8", "10", "12"],
    colors: [
      { name: "Rosa", hex: "#f9a8d4" },
      { name: "Lila", hex: "#c084fc" },
    ],
    variants: [
      { id: "v80", productId: "fp9", size: "4", color: "Rosa", colorHex: "#f9a8d4", stock: 5 },
      { id: "v81", productId: "fp9", size: "6", color: "Rosa", colorHex: "#f9a8d4", stock: 4 },
      { id: "v82", productId: "fp9", size: "8", color: "Rosa", colorHex: "#f9a8d4", stock: 3 },
      { id: "v83", productId: "fp9", size: "4", color: "Lila", colorHex: "#c084fc", stock: 4 },
      { id: "v84", productId: "fp9", size: "6", color: "Lila", colorHex: "#c084fc", stock: 5 },
    ],
    material: "95% Algodón, 5% Elastano",
    care: ["Lavar a máquina 30°C", "No usar blanqueador"],
    fit: "regular",
    season: "primavera",
  },
  {
    id: "fp10",
    name: "Pantalón Chino Slim",
    slug: "pantalon-chino-slim",
    brand: "H&M",
    brandId: "fb2",
    category: "pantalones",
    categoryId: "fc4",
    price: 799,
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600",
    ],
    description: "Pantalón chino slim de algodón elasticado. Muy versátil para oficina o casual. Disponible en varios colores.",
    specs: {},
    stock: 60,
    isNew: false,
    isFeatured: true,
    rating: 4.5,
    gender: "hombre",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Beige", hex: "#d4c5a9" },
      { name: "Verde Militar", hex: "#4a5240" },
      { name: "Azul Marino", hex: "#1e3a5f" },
      { name: "Negro", hex: "#111111" },
    ],
    variants: [
      { id: "v90", productId: "fp10", size: "M", color: "Beige", colorHex: "#d4c5a9", stock: 8 },
      { id: "v91", productId: "fp10", size: "L", color: "Beige", colorHex: "#d4c5a9", stock: 6 },
      { id: "v92", productId: "fp10", size: "M", color: "Verde Militar", colorHex: "#4a5240", stock: 7 },
      { id: "v93", productId: "fp10", size: "L", color: "Verde Militar", colorHex: "#4a5240", stock: 5 },
    ],
    material: "97% Algodón, 3% Elastano",
    care: ["Lavar a máquina 30°C"],
    fit: "slim",
    season: "todo el año",
  },
  {
    id: "fp11",
    name: "Top Cropped con Nudo",
    slug: "top-cropped-con-nudo",
    brand: "Bershka",
    brandId: "fb8",
    category: "mujeres",
    categoryId: "fc2",
    price: 249,
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4503?w=600",
    ],
    description: "Top cropped con detalle de nudo frontal. Tela de punto acanalado. Ideal para el verano.",
    specs: {},
    stock: 35,
    isNew: true,
    isFeatured: false,
    rating: 4.2,
    gender: "mujer",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Blanco", hex: "#ffffff" },
      { name: "Negro", hex: "#111111" },
      { name: "Terracota", hex: "#c96d42" },
    ],
    variants: [
      { id: "v100", productId: "fp11", size: "XS", color: "Blanco", colorHex: "#ffffff", stock: 5 },
      { id: "v101", productId: "fp11", size: "S", color: "Blanco", colorHex: "#ffffff", stock: 8 },
      { id: "v102", productId: "fp11", size: "M", color: "Blanco", colorHex: "#ffffff", stock: 6 },
      { id: "v103", productId: "fp11", size: "S", color: "Terracota", colorHex: "#c96d42", stock: 4 },
      { id: "v104", productId: "fp11", size: "M", color: "Terracota", colorHex: "#c96d42", stock: 3 },
    ],
    material: "90% Viscosa, 10% Poliéster",
    care: ["Lavar a mano", "Tendido plano para secar"],
    fit: "slim",
    season: "verano",
    collectionTag: "Colección Verano 2026",
  },
  {
    id: "fp12",
    name: "Pants Jogger Niño",
    slug: "pants-jogger-nino",
    brand: "Adidas",
    brandId: "fb4",
    category: "ninos",
    categoryId: "fc3",
    price: 599,
    images: [
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600",
    ],
    description: "Pants jogger cómodo para niño. Con cintura elástica ajustable y puños en tobillo. Tela suave tipo algodón.",
    specs: {},
    stock: 30,
    isNew: false,
    isFeatured: false,
    rating: 4.6,
    gender: "niño",
    sizes: ["4", "6", "8", "10", "12", "14"],
    colors: [
      { name: "Gris", hex: "#9ca3af" },
      { name: "Azul Navy", hex: "#1e3a5f" },
      { name: "Negro", hex: "#111111" },
    ],
    variants: [
      { id: "v110", productId: "fp12", size: "4", color: "Gris", colorHex: "#9ca3af", stock: 5 },
      { id: "v111", productId: "fp12", size: "6", color: "Gris", colorHex: "#9ca3af", stock: 4 },
      { id: "v112", productId: "fp12", size: "8", color: "Gris", colorHex: "#9ca3af", stock: 6 },
      { id: "v113", productId: "fp12", size: "10", color: "Gris", colorHex: "#9ca3af", stock: 3 },
      { id: "v114", productId: "fp12", size: "6", color: "Azul Navy", colorHex: "#1e3a5f", stock: 4 },
    ],
    material: "80% Algodón, 20% Poliéster",
    care: ["Lavar a máquina 30°C"],
    fit: "regular",
    season: "todo el año",
  },
]

// ── Slides del Hero ─────────────────────────────────────────────────

export const fashionHeroSlides: FashionHeroSlide[] = [
  {
    id: "hs1",
    badgeText: "Colección Primavera/Verano 2026",
    title: "Casual y con Estilo",
    subtitle: "Para Todas las Temporadas",
    startingPrice: 129,
    ctaText: "Ver Colección",
    ctaLink: "/productos",
    secondaryCtaText: "Ver más →",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800",
    bgColor: "#fff5f5",
  },
  {
    id: "hs2",
    badgeText: "Nueva Temporada",
    title: "Estilo Urbano",
    subtitle: "Colección Hombre 2026",
    startingPrice: 299,
    ctaText: "Comprar Ahora",
    ctaLink: "/productos?genero=hombre",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    bgColor: "#f0f4ff",
  },
  {
    id: "hs3",
    badgeText: "Oferta Especial",
    title: "Hasta 40% Off",
    subtitle: "En Toda la Colección Infantil",
    ctaText: "Ver Ofertas",
    ctaLink: "/productos?genero=nino",
    image: "https://images.unsplash.com/photo-1621786030484-4c855eed6974?w=800",
    bgColor: "#fff9f0",
  },
]

// ── Mini banners del Hero (35% derecho) ────────────────────────────

export const fashionMiniSlotBanners: FashionMiniSlotBanner[] = [
  {
    id: "mb1",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400",
    link: "/productos?categoria=mujeres",
    alt: "Colección Mujer",
  },
  {
    id: "mb2",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400",
    link: "/productos?categoria=hombres",
    alt: "Colección Hombre",
  },
  {
    id: "mb3",
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf6?w=400",
    link: "/productos?categoria=ninos",
    alt: "Colección Niños",
  },
]

// ── Cards de colecciones (Mujer / Hombre / Niños) ──────────────────

export const fashionCollectionCards: FashionCollectionCard[] = [
  {
    id: "cc1",
    title: "Colección Mujer",
    count: "72 Prendas",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600",
    link: "/productos?genero=mujer",
    overlayColor: "rgba(0,0,0,0.38)",
  },
  {
    id: "cc2",
    title: "Colección Hombre",
    count: "48 Prendas",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600",
    link: "/productos?genero=hombre",
    overlayColor: "rgba(0,0,0,0.38)",
  },
  {
    id: "cc3",
    title: "Colección Niños",
    count: "35 Prendas",
    image: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600",
    link: "/productos?genero=nino",
    overlayColor: "rgba(0,0,0,0.38)",
  },
]

// ── Reseñas de clientes ─────────────────────────────────────────────

export const fashionReviews: FashionReview[] = [
  {
    id: "r1",
    author: "María Flores",
    role: "Compradora verificada",
    rating: 5,
    text: "Excelente calidad en todas las prendas. El vestido floral superó mis expectativas, la tela es muy suave y el tallaje es exacto. ¡Sin duda volveré a comprar!",
  },
  {
    id: "r2",
    author: "Esther Ramírez",
    role: "Compradora verificada",
    rating: 4,
    text: "Me encantó la blusa que pedí. El envío fue rápido y el empaque muy cuidado. Solo le quito una estrella porque el color era ligeramente diferente a la foto.",
  },
  {
    id: "r3",
    author: "Lucía Alexander",
    role: "Compradora verificada",
    rating: 5,
    text: "Calidad increíble para el precio. La sudadera Nike es exactamente como se describe. Mi hijo la usa todos los días y sigue como nueva después de varios lavados.",
  },
  {
    id: "r4",
    author: "Ana Torres",
    role: "Compradora verificada",
    rating: 4,
    text: "Muy buena experiencia de compra. La talla fue correcta siguiendo la guía del sitio. El material es de primera. Definitivamente recomiendo esta tienda.",
  },
]

// ── Posts del Blog ──────────────────────────────────────────────────

export const fashionBlogPosts: FashionBlogPost[] = [
  {
    id: "bp1",
    slug: "tendencias-primavera-2026",
    tag: "Tendencias",
    title: "Las 10 Tendencias de Moda para Primavera 2026",
    excerpt:
      "Descubre los colores, siluetas y estilos que dominarán esta temporada. Desde el color del año hasta los patrones más llamativos.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
    date: "15 Feb 2026",
    author: "Valentina Ríos",
    readTime: "5 min",
    content: `La primavera 2026 llega cargada de propuestas frescas y atrevidas. Los diseñadores apostaron este año por siluetas fluidas, colores terrosos mezclados con vibrantes tonos neón y estampados botánicos de gran escala.

**1. Verde Sage — El color del año**
Este tono verdoso apagado domina desde las pasarelas hasta las calles. Combínalo con beige o blanco para un look sereno, o atrévete con un contraste en coral para hacerlo más dinámico.

**2. Siluetas Oversize**
Las prendas holgadas siguen siendo protagonistas. Blazers XXL, pantalones anchos y camisas extragrandes conforman los looks más buscados de la temporada.

**3. Estampados Florales Maxi**
A diferencia de los florales delicados de temporadas pasadas, esta primavera dominan las flores grandes, expresivas y multicolores sobre fondos oscuros o neutros.

**4. Transparencias con estilo**
Las telas semitransparentes en organza y chifón se llevan sobre básicos o como capas sobre prendas sólidas. La clave está en el equilibrio: transparencia controlada, no atrevida.

**5. Crochet y tejidos artesanales**
El crochet vuelve con fuerza. Tops, bolsos, faldas y hasta trajes de baño en este tejido manual son tendencia absoluta para la temporada cálida.

**6. Denim en todas las formas**
El denim ya no se limita a los jeans. Faldas midi, blazers, corsets y accesorios en mezclilla protagonizan los looks más versátiles del año.

**7. Colores pastel neon**
Una fusión inesperada: tonos pastel saturados como el lavanda eléctrico, el limón neón y el rosa chicle se convierten en los favoritos para piezas statement.

**8. Botas de plataforma**
El calzado se reinventa. Las botas chunky y de plataforma, ya sea en cuero o sintético, elevan cualquier look casual o formal.

**9. Mini faldas de plisé**
El plisado vuelve en versión mini para la primavera. Combinadas con camisas estructuradas o crop tops, son la prenda comodín de la temporada.

**10. Accesorios XXL**
Los bolsos grandes, los sombreros statement y los cinturones anchos completan los looks más fashionistas. Este año, los accesorios no son un complemento sino el centro de atención.`,
  },
  {
    id: "bp2",
    slug: "guia-tallas-ropa",
    tag: "Guías",
    title: "Guía Completa para Elegir tu Talla Correcta",
    excerpt:
      "Aprende a medirte correctamente y a interpretar las tablas de tallas para que tu ropa siempre te quede perfecta.",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200",
    date: "10 Feb 2026",
    author: "Sofía Mendoza",
    readTime: "4 min",
    content: `Una de las principales dudas al comprar ropa en línea es elegir la talla correcta. Con esta guía aprenderás a tomarte las medidas y a interpretar las tablas de tallas para que cada prenda te quede perfecta.

**¿Cómo medirte correctamente?**

Necesitarás una cinta métrica flexible. Tómate las medidas con ropa interior o ropa ajustada para mayor precisión.

**Busto / Pecho:** Rodea el pecho por la parte más prominente, manteniendo la cinta paralela al suelo. No comprimas la cinta.

**Cintura:** Mide en el punto más estrecho del torso, generalmente unos 2-3 cm por encima del ombligo. Mantén la cinta holgada, sin apretar.

**Cadera:** Mide en la parte más prominente de las caderas, generalmente unos 20-23 cm por debajo de la cintura.

**Longitud de pierna (entrepierna):** Mide desde la entrepierna hasta el tobillo a lo largo de la pierna interior.

**Tabla de tallas Olarics — Adultos**

| Talla | Busto (cm) | Cintura (cm) | Cadera (cm) |
|-------|-----------|-------------|------------|
| XS    | 80–84     | 60–64       | 88–92      |
| S     | 84–88     | 64–68       | 92–96      |
| M     | 88–92     | 68–72       | 96–100     |
| L     | 92–96     | 72–76       | 100–104    |
| XL    | 96–104    | 76–84       | 104–112    |
| XXL   | 104–112   | 84–92       | 112–120    |

**Tabla de tallas — Niños**

| Talla | Edad aprox. | Altura (cm) | Peso aprox. (kg) |
|-------|------------|-------------|-----------------|
| 2     | 2–3 años   | 86–98       | 11–14           |
| 4     | 3–4 años   | 98–110      | 14–17           |
| 6     | 5–6 años   | 110–122     | 17–22           |
| 8     | 7–8 años   | 122–134     | 22–27           |
| 10    | 9–10 años  | 134–146     | 27–34           |
| 12    | 11–12 años | 146–158     | 34–42           |
| 14    | 13–14 años | 158–164     | 42–50           |

**Consejos finales**
- Si estás entre dos tallas, elige la más grande para mayor comodidad.
- Para ropa deportiva o ajustada, ve con tu talla exacta.
- Lee siempre la descripción del producto; algunos artículos tienen fit específico (slim, regular, oversized).
- No dudes en contactarnos si tienes dudas sobre una prenda en particular.`,
  },
  {
    id: "bp3",
    slug: "outfits-casuales-hombre",
    tag: "Estilo",
    title: "5 Outfits Casuales para Hombre que Nunca Fallan",
    excerpt:
      "Combinaciones sencillas y versátiles que puedes usar en diferentes ocasiones sin sacrificar el estilo.",
    image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1200",
    date: "5 Feb 2026",
    author: "Diego Morales",
    readTime: "3 min",
    content: `El estilo masculino no tiene que ser complicado. Con piezas clave y combinaciones inteligentes puedes construir outfits que funcionen para el día a día sin esfuerzo. Aquí te presentamos 5 combinaciones que nunca fallan.

**1. Jeans + Playera Básica + Tenis Blancos**
El clásico infalible. Un par de jeans slim en azul medio, una playera blanca o negra de algodón y unos tenis blancos limpios. Simple, fresco y siempre vigente. Añade una cadena fina para darle un toque extra.

**2. Chinos Beis + Camisa Oxford + Mocasines**
Para esos días en que quieres verte arreglado sin demasiado esfuerzo. Un pantalón chino beis o verde militar combinado con una camisa oxford de cuadros y mocasines de cuero te dará un look smart casual perfecto para la oficina o una salida con amigos.

**3. Jogger + Hoodie + Sneakers Retro**
El outfit más cómodo sin sacrificar estilo. Un jogger gris o negro, una sudadera con capucha en tono complementario y unos sneakers retro de colores neutros. Ideal para el día a día, ir al gym o un café casual.

**4. Camisa de Lino + Shorts + Sandalias**
Para los días de calor, el lino es tu mejor aliado. Una camisa de lino en color arena o blanco abierta sobre una camiseta interior, combinada con shorts chinos y sandalias planas. Fresco, ligero y con mucho estilo.

**5. Chamarra de Mezclilla + Pantalón Negro + Botas**
El outfit con más actitud de esta lista. Una chamarra denim sobre una playera negra, pantalón negro slim y botas chelsea o de combate. Funciona igual de bien en un concierto, una cita o una noche de fin de semana.

**Piezas clave que todo hombre debe tener**
- 2-3 playeras básicas en blanco, negro y gris
- Un par de jeans slim y uno straight
- Pantalón chino en beis o kaki
- Camisa oxford de cuadros
- Sudadera sólida sin estampados
- Tenis blancos limpios
- Chamarra de mezclilla o ligera

Con estas piezas puedes construir decenas de outfits diferentes. La clave está en la calidad sobre la cantidad y en elegir colores que combinen entre sí.`,
  },
]

// ── Fotos de Instagram (mock) ───────────────────────────────────────

export const fashionInstagramPhotos = [
  { id: "ig1", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200", link: "#" },
  { id: "ig2", image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200", link: "#" },
  { id: "ig3", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200", link: "#" },
  { id: "ig4", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=200", link: "#" },
  { id: "ig5", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200", link: "#" },
  { id: "ig6", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200", link: "#" },
]

// ── Helpers ─────────────────────────────────────────────────────────

export const featuredFashionProducts = fashionProducts.filter((p) => p.isFeatured)
export const newArrivalFashionProducts = fashionProducts.filter((p) => p.isNew)
export const bestSellerFashionProducts = [...fashionProducts].sort((a, b) => b.rating - a.rating).slice(0, 8)
export const saleFashionProducts = fashionProducts.filter((p) => p.originalPrice && p.originalPrice > p.price)
