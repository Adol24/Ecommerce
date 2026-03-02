-- =============================================================================
-- SCRIPT DE ESTRUCTURA DE BASE DE DATOS - Ecommerce
-- =============================================================================
-- Ejecuta este script en tu nueva instancia de InsForge para crear toda la 
-- estructura necesaria para el e-commerce.
-- =============================================================================

-- =============================================================================
-- 1. TABLA: store_templates (Plantillas de tienda)
-- =============================================================================
CREATE TABLE IF NOT EXISTS store_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color_theme TEXT DEFAULT 'blue',
    icon TEXT,
    homepage_config JSONB DEFAULT '{}',
    product_fields JSONB NOT NULL DEFAULT '[]',
    checkout_config JSONB DEFAULT '{}',
    use_variants BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. TABLA: categories (Categorías de productos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    template_id TEXT REFERENCES store_templates(id)
);

-- =============================================================================
-- 3. TABLA: brands (Marcas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. TABLA: products (Productos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    compare_price DOUBLE PRECISION,
    stock INTEGER,
    images JSONB,
    specs JSONB DEFAULT '{}',
    is_new BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    category_id UUID NOT NULL REFERENCES categories(id),
    brand_id UUID NOT NULL REFERENCES brands(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    rating DOUBLE PRECISION DEFAULT 0,
    cost NUMERIC DEFAULT 0
);

-- =============================================================================
-- 5. TABLA: product_variants (Variantes de producto para tallas/colores)
-- =============================================================================
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    attributes JSONB NOT NULL DEFAULT '{}',
    price NUMERIC,
    stock INTEGER DEFAULT 0,
    image TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- =============================================================================
-- 6. TABLA: user_profiles (Perfiles de usuario)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'CUSTOMER',
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. TABLA: addresses (Direcciones de envío)
-- =============================================================================
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    label TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. TABLA: orders (Pedidos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    address_id UUID NOT NULL REFERENCES addresses(id),
    order_number TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'PENDING',
    subtotal DOUBLE PRECISION NOT NULL,
    shipping DOUBLE PRECISION NOT NULL,
    total DOUBLE PRECISION NOT NULL,
    payment_method TEXT NOT NULL,
    notes TEXT,
    payment_status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 9. TABLA: order_items (Items de pedidos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    name TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    quantity INTEGER NOT NULL,
    total DOUBLE PRECISION NOT NULL,
    cost NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 10. TABLA: coupons (Cupones de descuento)
-- =============================================================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value NUMERIC NOT NULL,
    min_order_amount NUMERIC DEFAULT 0,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 11. TABLA: favorites (Productos favoritos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- =============================================================================
-- 12. TABLA: notifications (Notificaciones)
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 13. TABLA: banners (Banners del homepage)
-- =============================================================================
CREATE TABLE IF NOT EXISTS banners (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    badge TEXT,
    title TEXT NOT NULL,
    subtitle TEXT,
    cta_text TEXT,
    cta_href TEXT,
    image_url TEXT,
    priority INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    description TEXT,
    secondary_cta_text TEXT,
    secondary_cta_href TEXT,
    gradient TEXT DEFAULT 'from-slate-900 via-slate-800 to-slate-900',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 14. TABLA: app_settings (Configuración de la tienda)
-- =============================================================================
CREATE TABLE IF NOT EXISTS app_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 15. INSERTAR PLANTILLAS DE TIENDA
-- =============================================================================
INSERT INTO store_templates (id, name, description, color_theme, icon, use_variants, product_fields, checkout_config) VALUES
('tecnologia', 'Tecnologia y Electronica', 'Tienda de tecnologia, computadoras, componentes y accesorios electronicos', 'emerald', 'Monitor', false,
 '[{"key": "modelo", "label": "Modelo", "type": "text", "required": false}, {"key": "garantia", "label": "Garantia", "type": "text", "required": false}, {"key": "conectividad", "label": "Conectividad", "type": "multiselect", "options": ["USB", "Bluetooth", "WiFi", "HDMI", "USB-C", "Jack 3.5mm"], "required": false}, {"key": "consumo", "label": "Consumo de Energia", "type": "text", "required": false}, {"key": "voltaje", "label": "Voltaje", "type": "text", "required": false}, {"key": "peso", "label": "Peso", "type": "text", "required": false}]',
 '{"requirePhone": true, "requireCompany": false, "requireRFC": false}'),

('ropa', 'Ropa y Accesorios', 'Tienda de ropa, calzado, accesorios y complementos de moda', 'rose', 'Shirt', true,
 '[{"key": "tallas", "label": "Tallas Disponibles", "type": "size", "required": true}, {"key": "colores", "label": "Colores Disponibles", "type": "color", "required": true}, {"key": "material", "label": "Material", "type": "text", "required": false}, {"key": "temporada", "label": "Temporada", "type": "select", "options": ["Primavera", "Verano", "Otono", "Invierno", "Todo el ano"], "required": false}, {"key": "genero", "label": "Genero", "type": "select", "options": ["Hombre", "Mujer", "Unisex", "Nino", "Nina"], "required": false}, {"key": "cuidado", "label": "Instrucciones de Cuidado", "type": "textarea", "required": false}]',
 '{"requirePhone": true, "requireCompany": false, "requireRFC": false}'),

('muebles', 'Muebles y Hogar', 'Tienda de muebles, decoracion y articulos para el hogar', 'amber', 'Armchair', false,
 '[{"key": "material", "label": "Material Principal", "type": "text", "required": true}, {"key": "dimensiones", "label": "Dimensiones (Alto x Ancho x Fondo)", "type": "text", "required": true}, {"key": "peso", "label": "Peso", "type": "text", "required": false}, {"key": "color", "label": "Color", "type": "text", "required": false}, {"key": "requiereArmado", "label": "Requiere Armado", "type": "boolean", "required": false}, {"key": "tiempoArmado", "label": "Tiempo de Armado Estimado", "type": "text", "required": false}, {"key": "capacidad", "label": "Capacidad de Carga", "type": "text", "required": false}]',
 '{"requirePhone": true, "requireCompany": false, "requireRFC": false}'),

('joyeria', 'Joyeria y Relojeria', 'Tienda de joyeria, relojes y accesorios', 'purple', 'Gem', true,
 '[{"key": "material", "label": "Material", "type": "select", "options": ["Oro", "Plata", "Acero Inoxidable", "Bronce", "Plastico", "Cuero"], "required": true}, {"key": "piedras", "label": "Piedras Preciosas", "type": "multiselect", "options": ["Diamante", "Rubi", "Esmeralda", "Zafiro", "Opalo", "Turquesa", "Ambar"], "required": false}, {"key": "quilates", "label": "Kilates (si es oro)", "type": "select", "options": ["10k", "14k", "18k", "24k"], "required": false}, {"key": "garantia", "label": "Garantia", "type": "text", "required": false}, {"key": "genero", "label": "Genero", "type": "select", "options": ["Hombre", "Mujer", "Unisex"], "required": false}]',
 '{"requirePhone": true, "requireCompany": false, "requireRFC": false}'),

('alimentos', 'Alimentos y Bebidas', 'Tienda de alimentos, bebidas, reposteria y productos perecederos', 'green', 'Coffee', false,
 '[{"key": "ingredientes", "label": "Ingredientes", "type": "textarea", "required": true}, {"key": "caducidad", "label": "Fecha de Caducidad", "type": "date", "required": true}, {"key": "conservacion", "label": "Condiciones de Conservacion", "type": "select", "options": ["Refrigerado", "Congelado", "Temperatura Ambiente"], "required": true}, {"key": "alergenos", "label": "Alergenos", "type": "multiselect", "options": ["Lacteos", "Gluten", "Frutos secos", "Huevos", "Mariscos", "Soja"], "required": false}, {"key": "peso", "label": "Peso Neto", "type": "text", "required": true}, {"key": "presentacion", "label": "Presentacion", "type": "text", "required": false}, {"key": "origen", "label": "Pais de Origen", "type": "text", "required": false}]',
 '{"requirePhone": true, "requireCompany": false, "requireRFC": false}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color_theme = EXCLUDED.color_theme,
  icon = EXCLUDED.icon,
  use_variants = EXCLUDED.use_variants,
  product_fields = EXCLUDED.product_fields,
  checkout_config = EXCLUDED.checkout_config,
  updated_at = NOW();

-- =============================================================================
-- 16. CONFIGURACION INICIAL
-- =============================================================================
INSERT INTO app_settings (id, settings) VALUES 
('default', '{"storeName": "Mi Tienda", "storeEmail": "info@mitienda.com", "storePhone": "+52 55 0000 0000", "storeAddress": "Mi direccion", "storeDescription": "Mi tienda online", "timezone": "america-mexico", "currency": "mxn", "colorTheme": "emerald", "showOutOfStockProducts": true, "showStockCount": true, "allowProductReviews": true, "standardShippingCost": "15", "freeShippingThreshold": "200", "notifyNewOrders": true, "notifyFailedPayments": true, "notifyLowStock": true, "notifyNewUsers": false, "enableCardPayments": true, "enableBankTransfer": true, "enableDigitalWallets": true, "enableCashOnDelivery": false}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- HABILITAR RLS (Row Level Security) - Opcional
-- =============================================================================
-- Descomenta estas lineas si quieres habilitar RLS
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- VERIFICAR QUE TODO SE CREO
-- =============================================================================
SELECT 'Tablas creadas exitosamente!' as resultado;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
