# Configuración de URLs para Emails

## URL de Producción Configurada

El sistema ahora está configurado para usar URLs de producción en los emails.

### 🔗 URLs Configuradas:

- **Desarrollo**: `http://localhost:3001`
- **Producción**: `https://expreso-epss.vercel.app`

### 📧 Enlaces en Emails:

Los emails ahora incluyen enlaces que apuntan a:
```
https://expreso-epss.vercel.app/generar?auth=[numero_autorizacion]
```

### ⚙️ Configuración Automática:

El sistema detecta automáticamente el entorno:
- **Desarrollo**: Usa localhost
- **Producción**: Usa la URL de Vercel

### ✅ Estado Actual:

- ✅ **URLs dinámicas** configuradas
- ✅ **Enlaces de producción** en emails
- ✅ **Fallback** a URL de Vercel si no hay variable de entorno
- ✅ **Número de autorización** incluido en el enlace

### 🚀 Para Despliegue:

Cuando despliegues a Vercel, los emails automáticamente usarán la URL correcta de producción.
