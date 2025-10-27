import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

// Función para cargar y procesar imágenes
async function loadImage(imagePath: string): Promise<{data: string, width: number, height: number} | null> {
  try {
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    if (fs.existsSync(fullPath)) {
      const imageBuffer = fs.readFileSync(fullPath);
      const base64 = imageBuffer.toString('base64');
      
      // Detectar el tipo de imagen
      const extension = path.extname(imagePath).toLowerCase();
      let mimeType = 'image/png';
      if (extension === '.jpg' || extension === '.jpeg') {
        mimeType = 'image/jpeg';
      } else if (extension === '.gif') {
        mimeType = 'image/gif';
      }
      
      return {
        data: `data:${mimeType};base64,${base64}`,
        width: 0, // Se calculará automáticamente por jsPDF
        height: 0
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API route called');
    const data = await request.json();
    console.log('Data received:', data);
    
    // Crear un nuevo PDF usando jsPDF
    const pdf = new jsPDF();
    
    // Configurar fuente
    pdf.setFont('helvetica');
    
    // Cargar logos si existen
    const logo1 = await loadImage('hebrara.png'); // Logo principal
    const logo2 = await loadImage('expreso-viajes-y-turismo.jpg'); // Logo secundario
    
    // Agregar logos si existen con dimensiones ajustadas
    if (logo1) {
      try {
        // Logo principal: reducir un poco más
        pdf.addImage(logo1.data, 'PNG', 20, 10, 30, 0);
      } catch (error) {
        console.log('Error adding logo1:', error);
      }
    }
    
    if (logo2) {
      try {
        // Logo secundario: bajar un poco para centrarlo verticalmente
        pdf.addImage(logo2.data, 'JPEG', 160, 15, 45, 0);
      } catch (error) {
        console.log('Error adding logo2:', error);
      }
    }
    
    // Título de la empresa
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EXPRESO VIAJES Y TURISMO EXPRESO S A S', 105, 20, { align: 'center' });
    
    // Título del documento
    pdf.setFontSize(14);
    pdf.text('Confirmación de Reserva Hotelera', 105, 30, { align: 'center' });
    
    // Información de fecha y número de autorización
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Solicitud y/o Voucher #: ${data.numero_autorizacion || 'N/A'}`, 20, 50);
    pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 150, 50);
    
    // Información del hotel
    pdf.text('Señores HOTEL', 20, 70);
    pdf.text(data.hotel || 'Hotel por asignar', 60, 70);
    pdf.text('Dirección:', 20, 80);
    
    // Asignar dirección automáticamente según el hotel
    let direccion = '';
    let precioPorNoche = 0;
    if (data.hotel) {
      const hotelName = data.hotel.toLowerCase();
      if (hotelName.includes('ilar 74')) {
        direccion = 'Cl. 74 #15-62';
        // Precios reales de Bogotá (Ilar 74)
        precioPorNoche = 133256; // Solo usuario
      } else if (hotelName.includes('bulevar del rio')) {
        direccion = 'Av. 3 N #17';
        // Precios reales de Cali (Bulevar del Rio)
        precioPorNoche = 182011; // Solo usuario
      } else if (hotelName.includes('saana 45')) {
        direccion = 'Cra. 45 #46-43';
        // Precios reales de Medellín (Saana 45)
        precioPorNoche = 163841; // Solo usuario
      }
    }
    
    pdf.text(direccion, 60, 80);
    pdf.text('Teléfono(s):', 20, 90);
    pdf.text(data.telefono || 'N/A', 60, 90);
    pdf.text('Fax:', 20, 100);
    pdf.text('COLOMBIA', 20, 110);
    pdf.text('reservas@hebrara.com', 20, 120);
    
    // Saludo
    pdf.text('Apreciados Señores,', 20, 140);
    pdf.text('Confirmamos Reserva de la siguiente manera:', 20, 150);
    
    // Detalles de la reserva
    let yPosition = 170;
    const lineHeight = 6; // Reducir espaciado entre líneas
    
    // Huésped con información adicional
    pdf.text('Huésped(es):', 20, yPosition);
    pdf.text(data.nombre_paciente || 'N/A', 120, yPosition);
    yPosition += lineHeight;
    
    // Número de documento del paciente
    if (data.documento_paciente) {
      pdf.text(`Doc: ${data.documento_paciente}`, 120, yPosition);
      yPosition += lineHeight;
    }
    
    // Acompañante si existe
    if (data.acompañante) {
      pdf.text(`Acompañante: ${data.acompañante}`, 120, yPosition);
      yPosition += lineHeight;
      
      // Número de documento del acompañante si existe
      if (data.documento_acompañante) {
        pdf.text(`Doc: ${data.documento_acompañante}`, 120, yPosition);
        yPosition += lineHeight;
      }
    }
    
    // Calcular cantidad de inquilinos reales (usuario + acompañante si existe)
    let cantidadInquilinos = 1; // Siempre hay al menos el usuario principal
    if (data.acompañante && data.acompañante.trim() !== '') {
      cantidadInquilinos = 2; // Usuario + acompañante
    }
    
    // Calcular tarifa total basada en fechas reales y cantidad de inquilinos
    let tarifaTotal = 0;
    if (precioPorNoche > 0) {
      // Calcular cantidad de noches basada en fechas reales
      let cantidadNoches = 1; // Por defecto 1 noche
      
      if (data.fecha_llegada && data.fecha_salida) {
        try {
          const fechaLlegada = new Date(data.fecha_llegada);
          const fechaSalida = new Date(data.fecha_salida);
          
          // Calcular diferencia en días
          const diferenciaMs = fechaSalida.getTime() - fechaLlegada.getTime();
          const diferenciaDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
          
          // Si la diferencia es válida y positiva, usarla; sino usar 1 noche
          if (diferenciaDias > 0 && diferenciaDias <= 30) { // Máximo 30 días para evitar errores
            cantidadNoches = diferenciaDias;
          }
        } catch (error) {
          console.log('Error calculando fechas, usando 1 noche por defecto:', error);
        }
      }
      
      // Calcular precio según cantidad de inquilinos usando la lógica del sistema
      let precioPorPersona = precioPorNoche; // Precio base (solo usuario)
      
      // Aplicar lógica de precios según cantidad de inquilinos
      if (cantidadInquilinos === 1) {
        precioPorPersona = precioPorNoche; // Solo usuario
      } else if (cantidadInquilinos === 2) {
        // Usuario + Acompañante: precio base * 1.5
        precioPorPersona = Math.round(precioPorNoche * 1.5);
      } else if (cantidadInquilinos >= 3) {
        // Usuario + 2+ Acompañantes: precio base * 2
        precioPorPersona = precioPorNoche * 2;
      }
      
      tarifaTotal = precioPorPersona * cantidadNoches;
    }
    
    // Formatear fechas para mostrar en el PDF
    const formatDateForDisplay = (dateStr: string) => {
      if (!dateStr) return 'N/A';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (error) {
        return 'N/A';
      }
    };
    
    const details = [
      { label: 'Fecha de Llegada:', value: formatDateForDisplay(data.fecha_llegada) },
      { label: 'Fecha de Salida:', value: formatDateForDisplay(data.fecha_salida) },
      { label: 'Tipo de Habitación:', value: "Habitación Estándar" },
      { label: 'Tarifa Antes de Impuestos:', value: tarifaTotal > 0 ? `$${tarifaTotal.toLocaleString('es-CO')}` : '$0' },
      { label: 'Cantidad de Habitaciones:', value: '1' },
      { label: 'Adultos:', value: cantidadInquilinos.toString() },
      { label: 'Incluye:', value: 'Alojamiento' },
      { label: 'Confirmado Por:', value: 'Sistema de Reservas' },
      { label: 'Forma de Pago:', value: 'EPS' }
    ];
    
    details.forEach(detail => {
      pdf.text(detail.label, 20, yPosition);
      pdf.text(detail.value, 120, yPosition);
      yPosition += lineHeight;
    });
    
    // Observaciones con salto de línea automático
    pdf.text('Observaciones:', 20, yPosition);
    const observaciones = data.observaciones || 'N/A';
    
    // Función para dividir texto en líneas
    const splitTextIntoLines = (text: string, maxWidth: number) => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        if (pdf.getTextWidth(testLine) <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            lines.push(word);
          }
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      return lines;
    };
    
    // Dividir observaciones en líneas
    const observacionesLines = splitTextIntoLines(observaciones, 60); // 60 caracteres máximo por línea
    
    // Escribir cada línea de observaciones
    observacionesLines.forEach((line, index) => {
      pdf.text(line, 120, yPosition);
      yPosition += lineHeight;
    });
    
    // Salto de línea adicional después de observaciones
    yPosition += lineHeight;
    
    // Generar el PDF
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    console.log('PDF generated successfully, size:', pdfBuffer.length);
    
    // Devolver el PDF como respuesta
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="confirmacion-reserva-${data.numero_autorizacion || 'demo'}.pdf"`
      }
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    );
  }
}
