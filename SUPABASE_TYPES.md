# Configuración de Tipos de Supabase

## ✅ Tipos Básicos Instalados

He creado un archivo básico de tipos de Supabase en `src/types/supabase.ts` y actualizado el cliente de Supabase para usarlos.

## 🔧 Cómo Obtener los Tipos Reales de tu Proyecto

Para obtener los tipos específicos de tu base de datos de Supabase, sigue estos pasos:

### Opción 1: Usando el CLI de Supabase (Recomendado)

1. **Instala el CLI de Supabase** (si no lo tienes):
   ```bash
   # En Windows con Chocolatey
   choco install supabase
   
   # O descarga desde: https://github.com/supabase/cli/releases
   ```

2. **Inicia sesión en Supabase**:
   ```bash
   supabase login
   ```

3. **Vincula tu proyecto**:
   ```bash
   supabase link --project-ref TU_PROJECT_ID
   ```

4. **Genera los tipos**:
   ```bash
   supabase gen types typescript --linked > src/types/supabase.ts
   ```

### Opción 2: Usando npx (Sin instalación global)

1. **Obtén tu Project ID**:
   - Ve a tu dashboard de Supabase
   - En Settings > General, copia el "Reference ID"

2. **Genera los tipos**:
   ```bash
   npx supabase gen types typescript --project-id TU_PROJECT_ID > src/types/supabase.ts
   ```

### Opción 3: Desde el Dashboard de Supabase

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Ve a Settings > API
3. En la sección "TypeScript types", copia el código generado
4. Reemplaza el contenido de `src/types/supabase.ts` con el código copiado

## 🎯 Beneficios de los Tipos Reales

Una vez que tengas los tipos reales de tu proyecto:

- **Autocompletado**: IntelliSense completo para todas tus tablas y columnas
- **Validación de tipos**: TypeScript te avisará de errores en tiempo de compilación
- **Mejor DX**: Navegación y refactoring más fácil
- **Documentación automática**: Los tipos sirven como documentación de tu esquema

## 📝 Ejemplo de Uso

Con los tipos configurados, podrás usar Supabase con tipado completo:

```typescript
import { supabase } from '@/lib/supabase'

// Ejemplo de consulta tipada
const { data, error } = await supabase
  .from('users') // Autocompletado de nombres de tabla
  .select('id, name, email') // Autocompletado de columnas
  .eq('active', true) // Tipado de valores
```

## 🔄 Actualización de Tipos

Recuerda regenerar los tipos cada vez que modifiques tu esquema de base de datos:

```bash
# Si usas el CLI vinculado
supabase gen types typescript --linked > src/types/supabase.ts

# Si usas npx
npx supabase gen types typescript --project-id TU_PROJECT_ID > src/types/supabase.ts
```

## 🚨 Nota Importante

El archivo `src/types/supabase.ts` actual contiene tipos básicos. Para obtener los tipos reales de tu proyecto, necesitas ejecutar uno de los comandos de generación mencionados arriba con tu Project ID real.
