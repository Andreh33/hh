# CRM Pro — Sistema CRM Full-Stack

CRM web completo con autenticación, tracking de sesiones, roles de usuario y tabla CRM estilo Excel.

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Backend**: API Routes de Next.js
- **Base de datos**: PostgreSQL + Prisma ORM
- **Autenticación**: NextAuth.js v4 (JWT)
- **Estilos**: Tailwind CSS + Glassmorphism

---

## Instalación y configuración

### 1. Clonar e instalar dependencias

```bash
git clone <tu-repositorio>
cd crm-app
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/crm_db"
NEXTAUTH_SECRET="genera-uno-con: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Configurar la base de datos

**Opción A — PostgreSQL local:**
```bash
# Crea la base de datos
psql -U postgres -c "CREATE DATABASE crm_db;"

# Aplica el schema
npm run db:push

# Carga datos de demostración
npm run db:seed
```

**Opción B — Neon / Supabase / Railway (recomendado para producción):**
1. Crea una base de datos PostgreSQL en [neon.tech](https://neon.tech) (gratuito)
2. Copia la connection string en `DATABASE_URL`
3. Ejecuta `npm run db:push && npm run db:seed`

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Credenciales por defecto

| Rol   | Email               | Contraseña |
|-------|---------------------|------------|
| Admin | admin123@crm.com    | admin123   |
| Demo  | demo@crm.com        | user123    |

---

## Despliegue en Vercel

1. Sube el proyecto a GitHub
2. Importa el repositorio en [vercel.com](https://vercel.com)
3. Configura las variables de entorno en Vercel:
   - `DATABASE_URL` (usa Neon o Supabase)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (tu dominio de Vercel, ej: `https://mi-crm.vercel.app`)
4. El comando de build ya incluye `prisma generate`: `prisma generate && next build`

---

## Estructura del proyecto

```
crm-app/
├── prisma/
│   ├── schema.prisma       # Modelos de base de datos
│   └── seed.ts             # Datos iniciales
├── src/
│   ├── app/
│   │   ├── (auth)/         # Páginas de login, registro, recuperación
│   │   ├── (dashboard)/    # Páginas protegidas
│   │   │   ├── dashboard/  # Panel principal con stats
│   │   │   ├── crm/        # Tabla CRM editable
│   │   │   └── admin/      # Panel de administración
│   │   └── api/            # API Routes
│   │       ├── auth/       # NextAuth + forgot-password
│   │       ├── leads/      # CRUD de leads
│   │       ├── sessions/   # Tracking de sesiones
│   │       └── users/      # Gestión de usuarios
│   ├── components/
│   │   ├── crm/            # Tabla CRM con edición inline
│   │   ├── admin/          # Tablas de usuarios y sesiones
│   │   ├── layout/         # Sidebar y Header
│   │   └── ui/             # Componentes reutilizables
│   ├── lib/
│   │   ├── auth.ts         # Configuración NextAuth
│   │   ├── db.ts           # Cliente Prisma singleton
│   │   └── utils.ts        # Utilidades (fechas, duración)
│   ├── types/
│   │   └── next-auth.d.ts  # Extensión de tipos NextAuth
│   └── middleware.ts       # Protección de rutas
```

---

## Funcionalidades

### Autenticación
- Registro, login, recuperación de contraseña
- JWT sessions con NextAuth
- Protección de rutas vía middleware

### Tracking de Sesiones
- Registro automático de inicio/fin de sesión
- Duración calculada automáticamente
- IP y User Agent almacenados

### CRM (Tabla Excel)
- 12 columnas editables con click-to-edit
- Guardado automático con debounce (600ms)
- Toggles para campos booleanos
- Búsqueda y ordenación por columnas
- Añadir/eliminar filas

### Panel Admin
- Estadísticas globales en tiempo real
- Gestión de usuarios (editar nombre, cambiar rol, eliminar)
- Log completo de sesiones con duración
- Visible solo para rol ADMIN

---

## Comandos útiles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run db:push      # Aplicar schema sin migraciones
npm run db:migrate   # Crear migración y aplicar
npm run db:seed      # Cargar datos de demostración
npm run db:studio    # Abrir Prisma Studio (GUI)
```
