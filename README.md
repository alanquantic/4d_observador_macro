# OBSERVADOR 4D

**Plataforma de Expansión de Conciencia y Manifestación Estratégica**

Una aplicación web que te permite desarrollar tu conciencia de observador desde una perspectiva 4D, visualizar tu realidad dimensional y manifestar estratégicamente tus objetivos.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.7-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql)

---

## 🌟 Características

### Dashboard 4D
- **Tablero 2D/3D Interactivo**: Visualización de proyectos, relaciones y manifestaciones
- **Métricas de Coherencia**: Seguimiento de coherencia emocional, lógica y energética
- **Timeline de Eventos**: Visualización temporal de tu progreso
- **Flujos de Energía**: Monitoreo de niveles energéticos

### Mapeo Diario
- **Registro de Estados**: Emocional, energético y de sueño
- **Seguimiento de Intenciones**: Define y rastrea tus intenciones diarias
- **Detección de Patrones**: Análisis automático de patrones recurrentes
- **Sincronicidades**: Registro de coincidencias significativas

### Análisis con IA (Gemini)
- **Preguntas Reflexivas**: Generación de preguntas personalizadas
- **Detección de Patrones**: Identificación de patrones conductuales
- **Insights Personalizados**: Análisis profundo de tu progreso

### Gestión de Relaciones
- **Mapa de Conexiones**: Visualización de tu red relacional
- **Calidad de Conexión**: Métricas de energía y reciprocidad
- **Categorización**: Personal, profesional, espiritual, etc.

### Proyectos y Manifestaciones
- **Seguimiento de Proyectos**: Estado, progreso y próximos pasos
- **Manifestaciones**: Tracker de intenciones a largo plazo
- **Métricas de Impacto**: Evaluación de energía invertida vs resultados

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Lenguaje** | TypeScript 5.3 |
| **Base de Datos** | PostgreSQL + Prisma ORM |
| **Autenticación** | NextAuth.js (Credentials) |
| **Estilos** | Tailwind CSS + Radix UI |
| **Visualización 3D** | Three.js + React Three Fiber |
| **IA** | Google Gemini API |
| **State Management** | Zustand + Jotai |
| **Animaciones** | Framer Motion |

---

## 📦 Instalación Local

### Requisitos Previos
- Node.js 18.17.0 o superior
- PostgreSQL 15 o superior (o servicio cloud: Neon, Supabase, Vercel Postgres)
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/observador-4d.git
cd observador-4d/observador_4d/nextjs_space
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp ENV_SETUP.md .env.local
# Editar .env.local con tus valores
```

4. **Configurar base de datos**
```bash
npx prisma db push
npx prisma generate
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

6. **Abrir en navegador**
```
http://localhost:3000
```

---

## ⚙️ Variables de Entorno

Crear archivo `.env.local` con:

```env
# Base de Datos (Requerido)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth (Requerido)
NEXTAUTH_SECRET="genera-con-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Google Gemini (Opcional - para IA)
GOOGLE_GEMINI_API_KEY="tu-api-key-de-gemini"

# AWS S3 (Opcional - para uploads)
AWS_ACCESS_KEY_ID="tu-access-key"
AWS_SECRET_ACCESS_KEY="tu-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="tu-bucket"
```

---

## 🚀 Despliegue en Vercel

### Preparación

1. **Subir a GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

### En Vercel Dashboard

1. Ir a [vercel.com](https://vercel.com) → "Add New Project"
2. Importar repositorio de GitHub
3. **Configurar Root Directory**: `observador_4d/nextjs_space`
4. **Agregar Environment Variables**:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (tu dominio Vercel)
   - `GOOGLE_GEMINI_API_KEY` (opcional)

### Post-Despliegue

Ejecutar migraciones de base de datos:
```bash
npx prisma db push
```

---

## 📁 Estructura del Proyecto

```
nextjs_space/
├── app/                    # App Router (Next.js 14)
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── daily-mapping/ # Mapeo diario
│   │   ├── dashboard/     # Dashboard data
│   │   ├── gemini/        # IA endpoints
│   │   └── ...
│   ├── auth/              # Páginas de autenticación
│   ├── daily-mapping/     # Página de mapeo diario
│   ├── dashboard/         # Dashboard principal
│   └── tablero-3d/        # Tablero 3D inmersivo
├── components/            # Componentes React
│   ├── dashboard/         # Componentes del dashboard
│   ├── daily-mapping/     # Componentes de mapeo
│   ├── tablero3d/         # Componentes 3D
│   └── ui/                # Componentes UI (shadcn)
├── lib/                   # Utilidades
│   ├── auth.ts           # Configuración NextAuth
│   ├── db.ts             # Cliente Prisma
│   └── utils.ts          # Funciones utilitarias
├── prisma/
│   └── schema.prisma     # Schema de base de datos
└── public/               # Assets estáticos
```

---

## 🗄️ Modelos de Base de Datos

| Modelo | Descripción |
|--------|-------------|
| `User` | Usuarios del sistema |
| `DailyEntry` | Entradas del mapeo diario |
| `Intention` | Intenciones y hábitos |
| `Pattern` | Patrones detectados |
| `Project` | Proyectos activos |
| `Relationship` | Red de relaciones |
| `Manifestation` | Manifestaciones en progreso |
| `UserMetrics` | Métricas de coherencia |

---

## 🔧 Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run lint       # Linter
npm run db:push    # Sincronizar schema con DB
npm run db:migrate # Ejecutar migraciones
```

---

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

---

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisar la consola del navegador (F12)
2. Verificar logs del servidor (`npm run dev`)
3. Confirmar variables de entorno configuradas
4. Verificar conexión a base de datos

