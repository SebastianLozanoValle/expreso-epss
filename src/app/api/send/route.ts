import { Resend } from 'resend';
import { ReservaEmail } from '../../../../emails/ReservaEmail';

const resend = new Resend(process.env.RESEND_API_KEY || 'demo_key');

export async function POST(request: Request) {
  try {
    const { to, numeroAutorizacion, patientName } = await request.json();

    if (!to) {
      return Response.json({ error: 'Email destination is required' }, { status: 400 });
    }

    if (!numeroAutorizacion) {
      return Response.json({ error: 'Authorization number is required' }, { status: 400 });
    }

    // Verificar si hay API key configurada
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'demo_key') {
      console.log('⚠️ RESEND_API_KEY no configurada, enviando en modo demo');
      return Response.json({ 
        message: 'Email service not configured. Please set RESEND_API_KEY in environment variables.',
        demo: true,
        warning: 'No se envió email real - configurar RESEND_API_KEY para envío real'
      }, { status: 200 });
    }

    const { data, error } = await resend.emails.send({
      from: 'reservas@hebrara.com', // Cambia por tu dominio verificado en Resend
      to: [to], // Usar el email del usuario logueado
      bcc: ['reservas@hebrara.com'], // Email de copia para el equipo de reservas
      subject: `Confirmación de Reserva Hotelera - ${numeroAutorizacion}`,
      react: ReservaEmail({ 
        patientName: patientName || 'Estimado paciente',
        numeroAutorizacion: numeroAutorizacion
      }),
    });

    if (error) {
      console.error('Error sending email:', error);
      return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return Response.json({ 
      message: 'Email sent successfully', 
      id: data?.id 
    });

  } catch (error) {
    console.error('Error in API route:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
