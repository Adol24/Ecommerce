# Ecommerce

E-commerce de productos de computación construido con Next.js 16, TypeScript, Tailwind CSS e InsForge.

## Descripción

Tienda online especializada en hardware, periféricos y componentes de computación. Incluye:

- **Tienda pública**: Catálogo con filtros, carrito y checkout
- **Panel de usuario**: Perfil, historial de pedidos y direcciones
- **Panel de administración**: Gestión de productos, usuarios y pedidos

## Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| Next.js 16 | Framework (App Router) |
| TypeScript | Lenguaje |
| Tailwind CSS v4 | Estilos |
| shadcn/ui | Componentes UI |
| InsForge | Backend-as-a-Service |
| Zustand | Estado global |

## InsForge

Este proyecto utiliza [InsForge](https://insforge.dev) como backend:

- **Database**: PostgreSQL con API automática
- **Auth**: Autenticación con email/password
- **Storage**: Almacenamiento de archivos (opcional)

## Requisitos

- Node.js 18+
- Cuenta en InsForge (gratuita)

## Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd ecommerce-basictech

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de InsForge
```

## Variables de Entorno

```env
NEXT_PUBLIC_INSFORGE_URL=https://your-app.region.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Abrir http://localhost:3000
```

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Genera build de producción |
| `npm run start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta ESLint |

## Estructura del Proyecto

```
src/
├── app/
│   ├── (shop)/          # Rutas públicas (tienda)
│   ├── (admin-panel)/   # Panel de administración
│   └── (auth)/          # Login y registro
├── components/
│   ├── ui/              # shadcn/ui
│   ├── layout/          # Header, Footer, Nav
│   ├── products/        # Componentes de productos
│   ├── cart/            # Carrito
│   └── admin/           # Panel admin
├── data/                # Datos mock (fallback)
├── lib/                 # Utilidades y cliente InsForge
├── hooks/               # Custom hooks (useAuth)
├── stores/              # Zustand stores
└── types/               # Tipos TypeScript
```

## Licencia

MIT
