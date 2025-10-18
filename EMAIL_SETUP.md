# Configuración del Sistema de Emails

## Librerías Instaladas

Se han instalado las siguientes librerías para el sistema de emails y generación de PDFs:

- `resend` - Servicio de envío de emails
- `@react-email/components` - Componentes para templates de email
- `@react-email/render` - Renderizado de emails
- `pdf-lib` - Generación y manipulación de PDFs
- `file-saver` - Descarga de archivos en el navegador

## Configuración de Variables de Entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# Email Configuration (Resend)
RESEND_API_KEY=tu_api_key_de_resend
RESEND_FROM_EMAIL=tu_email_verificado@tudominio.com
```

## Configuración de Resend

1. Ve a [resend.com](https://resend.com) y crea una cuenta
2. Obtén tu API key desde el dashboard
3. Verifica tu dominio para poder enviar emails desde tu propio dominio
4. Agrega la API key a tu archivo `.env.local`

## Funcionalidades Implementadas

### 1. API de Envío de Emails (`/api/send`)
- Endpoint POST que acepta un email de destino
- Envía emails usando el template `ReservaEmail`
- Maneja errores y casos cuando no hay API key configurada

### 2. Template de Email (`emails/ReservaEmail.tsx`)
- Template profesional para confirmación de reservas
- Incluye botón para generar comprobante
- Diseño responsive y moderno

### 3. Generación de PDFs (`/generar`)
- Genera PDFs de confirmación de reserva
- Usa un template base (`CONFIRMACION-RESERVA.pdf`)
- Rellena automáticamente los datos del paciente
- Descarga automática del archivo generado

## Uso

### Envío de Emails
```javascript
const response = await fetch('/api/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'paciente@email.com',
  }),
});
```

### Generación de PDFs
- Visita `/generar` para generar y descargar el comprobante
- El PDF se genera con los datos del paciente
- Se descarga automáticamente con nombre único

## Archivos Importantes

- `src/app/api/send/route.ts` - API endpoint para envío de emails
- `emails/ReservaEmail.tsx` - Template de email
- `src/app/generar/page.tsx` - Página de generación de PDFs
- `public/CONFIRMACION-RESERVA.pdf` - Template base del PDF

## Notas

- El sistema funciona en modo demo cuando no hay API key configurada
- Para producción, asegúrate de configurar las variables de entorno
- El template PDF base debe estar en la carpeta `public/`
- Los emails se envían desde el email verificado en Resend
