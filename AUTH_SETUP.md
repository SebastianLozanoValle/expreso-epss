# Configuración de Autenticación con Supabase

## Pasos para configurar la autenticación

### 1. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a Settings > API para obtener tus credenciales
4. Copia el archivo `env.example` a `.env.local`:
   ```bash
   cp env.example .env.local
   ```
5. Actualiza las variables en `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

### 2. Configurar la base de datos

En el dashboard de Supabase, ve a Authentication > Settings y configura:

- **Site URL**: `http://localhost:3000` (para desarrollo)
- **Redirect URLs**: `http://localhost:3000/auth/callback`

### 3. Habilitar autenticación por email

En Authentication > Settings > Auth Providers:
- Habilita "Email" provider
- Configura las opciones de confirmación de email según necesites

### 4. Ejecutar el proyecto

```bash
npm run dev
```

## Funcionalidades implementadas

### ✅ Página de Login/Registro
- Formulario de login y registro en `/auth/login`
- Validación de formularios
- Manejo de errores
- Interfaz responsive con Tailwind CSS

### ✅ Estado Global con Zustand
- Store global para manejo de estado de autenticación
- Persistencia de sesión
- Listeners de cambios de autenticación

### ✅ Middleware de Autenticación
- Protección de rutas automática
- Redirección a login para rutas protegidas
- Redirección a home para usuarios autenticados en rutas de auth

### ✅ Integración con Supabase
- Cliente de Supabase configurado
- Autenticación con email/password
- Manejo de sesiones
- Logout automático

### ✅ Componentes de UI
- Header con estado de autenticación
- Botón de login/logout
- Indicador de usuario logueado
- AuthProvider para inicialización

## Rutas protegidas

Por defecto, estas rutas requieren autenticación:
- `/dashboard`
- `/profile` 
- `/admin`

Puedes modificar las rutas protegidas en `src/middleware.ts`.

## Uso del store de autenticación

```typescript
import { useAuthStore } from '@/lib/auth-store'

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuthStore()
  
  // user: Usuario actual o null
  // loading: Estado de carga
  // signIn: Función para iniciar sesión
  // signOut: Función para cerrar sesión
}
```

## Personalización

### Cambiar rutas protegidas
Edita el array `protectedRoutes` en `src/middleware.ts`:

```typescript
const protectedRoutes = ['/dashboard', '/profile', '/admin', '/mi-ruta']
```

### Cambiar redirecciones
Modifica las URLs de redirección en `src/middleware.ts` y `src/app/auth/login/page.tsx`.

### Personalizar el formulario
Edita `src/app/auth/login/page.tsx` para cambiar campos, validaciones o estilos.
