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
    
    // Información del hotel - espaciado mínimo entre líneas, equidistante del voucher y saludo
    const hotelStartY = 65; // 15 unidades después del voucher (Y: 50)
    pdf.text('Señores HOTEL', 20, hotelStartY);
    pdf.text(data.hotel || 'Hotel por asignar', 60, hotelStartY);
    pdf.text('Dirección:', 20, hotelStartY + 5);
    
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
      } else if (hotelName.includes('street 47')) {
        direccion = 'Cra. 45 #46-43';
        // Precios reales de Medellín (Street 47)
        precioPorNoche = 163841; // Solo usuario
      }
    }
    
    pdf.text(direccion, 60, hotelStartY + 5);
    
    // Determinar teléfonos según la ciudad/hotel
    let telefonoReservas = '3243396016';
    let telefonoRecepcion = '';
    let telefonoTransporte = '';
    
    if (data.hotel) {
      const hotelName = data.hotel.toLowerCase();
      if (hotelName.includes('street 47')) {
        // Medellín
        telefonoRecepcion = '3217936061';
        telefonoTransporte = '3217936061';
      } else if (hotelName.includes('ilar 74')) {
        // Bogotá
        telefonoRecepcion = '3112088015';
        telefonoTransporte = '3134552772, 3001894937, 3124154315';
      } else if (hotelName.includes('bulevar del rio')) {
        // Cali
        telefonoRecepcion = '3005792624';
        telefonoTransporte = '3170789137, 3005792624';
      }
    }
    
    // Mostrar teléfonos
    let telefonoY = hotelStartY + 10;
    pdf.text('Reservas:', 20, telefonoY);
    pdf.text(telefonoReservas, 60, telefonoY);
    
    if (telefonoRecepcion) {
      telefonoY += 5;
      pdf.text('Recepción:', 20, telefonoY);
      pdf.text(telefonoRecepcion, 60, telefonoY);
    }
    
    if (telefonoTransporte) {
      telefonoY += 5;
      pdf.text('Transporte:', 20, telefonoY);
      pdf.text(telefonoTransporte, 60, telefonoY);
    }
    
    pdf.text('COLOMBIA', 20, telefonoY + 5);
    pdf.text('reservas@hebrara.com', 20, telefonoY + 10);
    
    // Saludo - espaciado dinámico basado en la posición final de los teléfonos
    const saludoStartY = telefonoY + 10 + 15; // 15 unidades después del email
    pdf.text('Apreciados Señores,', 20, saludoStartY);
    pdf.text('Confirmamos Reserva de la siguiente manera:', 20, saludoStartY + 5);
    
    // Parsear descripcion_servicio para separar tipo de habitación y descripción del servicio
    let tipoHabitacion = 'Habitación Estándar';
    let descripcionServicio = data.descripcion_servicio || '';
    
    if (data.descripcion_servicio && data.descripcion_servicio.includes(' / ')) {
      const partes = data.descripcion_servicio.split(' / ');
      tipoHabitacion = partes[0] || 'Habitación Estándar';
      descripcionServicio = partes[1] || data.descripcion_servicio;
    }
    
    // Observaciones reales del campo observaciones de la base de datos
    const observacionesReales = data.observaciones || '';

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

    // Detalles de la reserva
    let yPosition = 117; // Ajustado después del saludo (Y: 110 + 7 unidades)
    const lineHeight = 5; // Reducir espaciado entre líneas
    
    // Preparar datos del usuario para la tabla
    const userInfo: Array<{ label: string; value: string }> = [];
    userInfo.push({ label: 'Huésped(es):', value: (data.nombre_paciente || 'N/A').toUpperCase() });
    
    if (data.documento_paciente) {
      userInfo.push({ label: 'Doc:', value: data.documento_paciente });
    }
    
    if (data.telefono) {
      userInfo.push({ label: 'Número de contacto huésped:', value: data.telefono });
    }
    
    if (data.acompañante) {
      userInfo.push({ label: 'Acompañante:', value: data.acompañante.toUpperCase() });
      
      if (data.documento_acompañante) {
        userInfo.push({ label: 'Doc:', value: data.documento_acompañante });
      }
    }
    
    // Dibujar tabla de información del usuario
    const userTableX = 18;
    const userTableWidth = 175;
    const userTableY = yPosition - 1;
    const userRowHeight = 6;
    const userPadding = 2;
    const userLabelX = userTableX + 4;
    const userValueX = userLabelX + 95;
    const userRadius = 3;
    
    const userTableHeight = userInfo.length * userRowHeight + userPadding * 2;
    
    // Dibujar fondo de la tabla de usuario
    pdf.setFillColor(250, 250, 250);
    if (typeof (pdf as any).roundedRect === 'function') {
      (pdf as any).roundedRect(userTableX, userTableY, userTableWidth, userTableHeight, userRadius, userRadius, 'F');
    } else {
      pdf.rect(userTableX, userTableY, userTableWidth, userTableHeight, 'F');
    }
    
    // Dibujar borde de la tabla de usuario
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.5);
    if (typeof (pdf as any).roundedRect === 'function') {
      (pdf as any).roundedRect(userTableX, userTableY, userTableWidth, userTableHeight, userRadius, userRadius, 'S');
    } else {
      pdf.rect(userTableX, userTableY, userTableWidth, userTableHeight, 'S');
    }
    
    // Dibujar filas de la tabla de usuario
    let currentUserY = userTableY + userPadding;
    
    userInfo.forEach((info, index) => {
      // Dibujar línea separadora entre filas (excepto la última)
      if (index < userInfo.length - 1) {
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.3);
        pdf.line(userTableX + 2, currentUserY + userRowHeight - 1, userTableX + userTableWidth - 2, currentUserY + userRowHeight - 1);
      }
      
      // Escribir etiqueta
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont('helvetica', 'bold');
      pdf.text(info.label, userLabelX, currentUserY + 4);
      
      // Escribir valor
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(info.value, userValueX, currentUserY + 4);
      
      currentUserY += userRowHeight;
    });
    
    // Actualizar posición Y después de la tabla de usuario
    yPosition = userTableY + userTableHeight + 4;
    
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
          // Validar que las fechas no sean strings vacíos o inválidos
          const fechaLlegadaStr = data.fecha_llegada.toString().trim();
          const fechaSalidaStr = data.fecha_salida.toString().trim();
          
          if (fechaLlegadaStr && fechaSalidaStr && fechaLlegadaStr !== 'null' && fechaSalidaStr !== 'null') {
            // Función auxiliar para parsear fecha sin problemas de zona horaria
            const parseDate = (dateStr: string): { year: number; month: number; day: number } | null => {
              let year: number, month: number, day: number;
              
              if (dateStr.includes('-')) {
                const parts = dateStr.split('-');
                if (parts[0].length === 4) {
                  year = parseInt(parts[0], 10);
                  month = parseInt(parts[1], 10);
                  day = parseInt(parts[2], 10);
                } else {
                  day = parseInt(parts[0], 10);
                  month = parseInt(parts[1], 10);
                  year = parseInt(parts[2], 10);
                }
              } else if (dateStr.includes('/')) {
                const parts = dateStr.split('/');
                if (parts[0].length === 4) {
                  year = parseInt(parts[0], 10);
                  month = parseInt(parts[1], 10);
                  day = parseInt(parts[2], 10);
                } else {
                  day = parseInt(parts[0], 10);
                  month = parseInt(parts[1], 10);
                  year = parseInt(parts[2], 10);
                }
              } else {
                return null;
              }
              
              if (isNaN(year) || isNaN(month) || isNaN(day)) {
                return null;
              }
              
              return { year, month, day };
            };
            
            const fechaLlegada = parseDate(fechaLlegadaStr);
            const fechaSalida = parseDate(fechaSalidaStr);
            
            if (fechaLlegada && fechaSalida) {
              // Crear objetos Date usando UTC para evitar problemas de zona horaria
              const fechaLlegadaUTC = new Date(Date.UTC(fechaLlegada.year, fechaLlegada.month - 1, fechaLlegada.day));
              const fechaSalidaUTC = new Date(Date.UTC(fechaSalida.year, fechaSalida.month - 1, fechaSalida.day));
              
              // Calcular diferencia en días
              const diferenciaMs = fechaSalidaUTC.getTime() - fechaLlegadaUTC.getTime();
              const diferenciaDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
              
              // Si la diferencia es válida y positiva, usarla; sino usar 1 noche
              if (diferenciaDias > 0 && diferenciaDias <= 30) { // Máximo 30 días para evitar errores
                cantidadNoches = diferenciaDias;
              }
            }
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
    // Mostrar la fecha tal cual viene de la BD, sin restar días
    const formatDateForDisplay = (dateStr: string) => {
      if (!dateStr || dateStr.trim() === '' || dateStr === 'null' || dateStr === 'undefined') return 'N/A';
      try {
        const dateStrClean = dateStr.toString().trim();
        
        // Parsear la fecha manualmente para evitar problemas de zona horaria
        // Soporta formatos: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
        let year: number, month: number, day: number;
        
        if (dateStrClean.includes('-')) {
          // Formato ISO o con guiones (YYYY-MM-DD o DD-MM-YYYY)
          const parts = dateStrClean.split('-');
          if (parts[0].length === 4) {
            // Formato ISO: YYYY-MM-DD
            year = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10);
            day = parseInt(parts[2], 10);
          } else {
            // Formato: DD-MM-YYYY
            day = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10);
            year = parseInt(parts[2], 10);
          }
        } else if (dateStrClean.includes('/')) {
          // Formato: DD/MM/YYYY o YYYY/MM/DD
          const parts = dateStrClean.split('/');
          if (parts[0].length === 4) {
            // Formato: YYYY/MM/DD
            year = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10);
            day = parseInt(parts[2], 10);
          } else {
            // Formato: DD/MM/YYYY
            day = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10);
            year = parseInt(parts[2], 10);
          }
        } else {
          // Si no coincide con ningún formato conocido, intentar con Date pero usando UTC
          const date = new Date(dateStrClean);
          if (isNaN(date.getTime())) {
            return 'N/A';
          }
          // Usar métodos UTC para evitar problemas de zona horaria
          year = date.getUTCFullYear();
          month = date.getUTCMonth() + 1; // getUTCMonth() devuelve 0-11
          day = date.getUTCDate();
        }
        
        // Validar que los valores sean números válidos
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
          return 'N/A';
        }
        
        // Validar rango de valores
        if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
          return 'N/A';
        }
        
        // Formatear con ceros a la izquierda - mostrar tal cual viene de la BD
        const dayStr = day.toString().padStart(2, '0');
        const monthStr = month.toString().padStart(2, '0');
        
        return `${dayStr}/${monthStr}/${year}`;
      } catch (error) {
        console.log('Error formateando fecha:', error, 'Fecha original:', dateStr);
        return 'N/A';
      }
    };
    
    // Función para dibujar rectángulo redondeado
    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
      // Esquinas redondeadas usando curvas
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(200, 200, 200); // Color gris claro para los bordes
      
      // Dibujar rectángulo con bordes redondeados
      // Top-left corner
      pdf.line(x + radius, y, x + width - radius, y);
      // pdf.ellipse(x + radius, y + radius, radius, radius, 0, 90, 180, 'S'); // Comentado - formato no compatible
      
      // Top-right corner
      pdf.line(x + width, y + radius, x + width, y + height - radius);
      // pdf.ellipse(x + width - radius, y + radius, radius, radius, 0, 0, 90, 'S'); // Comentado - formato no compatible
      
      // Bottom-right corner
      pdf.line(x + width - radius, y + height, x + radius, y + height);
      // pdf.ellipse(x + width - radius, y + height - radius, radius, radius, 0, 270, 360, 'S'); // Comentado - formato no compatible
      
      // Bottom-left corner
      pdf.line(x, y + height - radius, x, y + radius);
      // pdf.ellipse(x + radius, y + height - radius, radius, radius, 0, 180, 270, 'S'); // Comentado - formato no compatible
      
      // Líneas rectas
      pdf.line(x + radius, y, x + width - radius, y); // Top
      pdf.line(x + width, y + radius, x + width, y + height - radius); // Right
      pdf.line(x + width - radius, y + height, x + radius, y + height); // Bottom
      pdf.line(x, y + height - radius, x, y + radius); // Left
    };
    
    // Preparar datos para la tabla
    const details = [
      { label: 'Cliente:', value: 'Sura' },
      { label: 'Fecha de Llegada:', value: formatDateForDisplay(data.fecha_llegada) },
      { label: 'Fecha de Salida:', value: formatDateForDisplay(data.fecha_salida) },
      { label: 'Tipo de Habitación:', value: tipoHabitacion },
      { label: 'Cantidad de Habitaciones:', value: '1' },
      { label: 'Adultos:', value: cantidadInquilinos.toString() },
      { label: 'Incluye:', value: descripcionServicio },
      { label: 'Confirmado Por:', value: 'Sistema de Reservas' },
      { label: 'Forma de Pago:', value: 'Facturar a agencia' }
    ];
    
    // Configuración de la tabla
    const tableX = 18;
    const tableWidth = 175;
    const tableY = yPosition - 1;
    const rowHeight = 6;
    const padding = 2;
    const labelX = tableX + 4;
    const valueX = labelX + 95;
    const radius = 3;
    
    // Calcular altura de cada fila y altura total
    const rowHeights: number[] = [];
    details.forEach(detail => {
      if (detail.label === 'Incluye:' && detail.value && detail.value.trim()) {
        const observacionesLines = splitTextIntoLines(detail.value, 60);
        rowHeights.push(Math.max(rowHeight, observacionesLines.length * lineHeight + 1));
      } else {
        rowHeights.push(rowHeight);
      }
    });
    
    const tableHeight = rowHeights.reduce((sum, height) => sum + height, 0) + padding * 2;
    
    // Dibujar fondo de la tabla con bordes redondeados
    pdf.setFillColor(250, 250, 250); // Color de fondo gris muy claro
    if (typeof (pdf as any).roundedRect === 'function') {
      (pdf as any).roundedRect(tableX, tableY, tableWidth, tableHeight, radius, radius, 'F');
    } else {
      // Fallback si roundedRect no está disponible
      pdf.rect(tableX, tableY, tableWidth, tableHeight, 'F');
    }
    
    // Dibujar borde de la tabla con bordes redondeados
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.5);
    if (typeof (pdf as any).roundedRect === 'function') {
      (pdf as any).roundedRect(tableX, tableY, tableWidth, tableHeight, radius, radius, 'S');
    } else {
      // Fallback si roundedRect no está disponible
      pdf.rect(tableX, tableY, tableWidth, tableHeight, 'S');
    }
    
    // Dibujar filas de la tabla
    let currentY = tableY + padding;
    
    details.forEach((detail, index) => {
      const currentRowHeight = rowHeights[index];
      
      // Dibujar línea separadora entre filas (excepto la última)
      if (index < details.length - 1) {
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.3);
        pdf.line(tableX + 2, currentY + currentRowHeight - 1, tableX + tableWidth - 2, currentY + currentRowHeight - 1);
      }
      
      // Escribir etiqueta
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont('helvetica', 'bold');
      pdf.text(detail.label, labelX, currentY + 4);
      
      // Escribir valor
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      if (detail.label === 'Incluye:') {
        // Aplicar salto de línea automático para "Incluye"
        if (detail.value && detail.value.trim()) {
          const observacionesLines = splitTextIntoLines(detail.value, 60);
          observacionesLines.forEach((line, lineIndex) => {
            pdf.text(line, valueX, currentY + 4 + (lineIndex * lineHeight));
          });
        }
      } else {
        pdf.text(detail.value, valueX, currentY + 4);
      }
      
      currentY += currentRowHeight;
    });
    
    // Actualizar posición Y después de la tabla
    yPosition = tableY + tableHeight + 4;
    
    // Preparar datos de observaciones para la tabla
    const textoPorDefecto = 'Traslado aeropuerto o terminal - hotel (ida y regreso), Alojamiento en hotel por noche, Tres alimentaciones por día y Un traslado interno redondo (usuario y acompañantes)';
    
    const observacionesInfo: Array<{ label: string; value: string; multiline?: boolean }> = [];
    observacionesInfo.push({ 
      label: 'Observaciones:', 
      value: textoPorDefecto,
      multiline: true
    });
    
    if (observacionesReales && observacionesReales.trim() !== '') {
      observacionesInfo.push({ 
        label: 'Otras observaciones:', 
        value: observacionesReales,
        multiline: true
      });
    }
    
    // Dibujar tabla de observaciones
    const obsTableX = 18;
    const obsTableWidth = 175;
    const obsTableY = yPosition - 1;
    const obsRowHeight = 6;
    const obsPadding = 2;
    const obsLabelX = obsTableX + 4;
    const obsValueX = obsLabelX + 95;
    const obsRadius = 3;
    
    // Calcular altura de cada fila de observaciones
    const obsRowHeights: number[] = [];
    observacionesInfo.forEach(obs => {
      if (obs.multiline && obs.value) {
        const obsLines = splitTextIntoLines(obs.value, 60);
        obsRowHeights.push(Math.max(obsRowHeight, obsLines.length * lineHeight + 1));
      } else {
        obsRowHeights.push(obsRowHeight);
      }
    });
    
    const obsTableHeight = obsRowHeights.reduce((sum, height) => sum + height, 0) + obsPadding * 2;
    
    // Dibujar fondo de la tabla de observaciones
    pdf.setFillColor(250, 250, 250);
    if (typeof (pdf as any).roundedRect === 'function') {
      (pdf as any).roundedRect(obsTableX, obsTableY, obsTableWidth, obsTableHeight, obsRadius, obsRadius, 'F');
    } else {
      pdf.rect(obsTableX, obsTableY, obsTableWidth, obsTableHeight, 'F');
    }
    
    // Dibujar borde de la tabla de observaciones
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.5);
    if (typeof (pdf as any).roundedRect === 'function') {
      (pdf as any).roundedRect(obsTableX, obsTableY, obsTableWidth, obsTableHeight, obsRadius, obsRadius, 'S');
    } else {
      pdf.rect(obsTableX, obsTableY, obsTableWidth, obsTableHeight, 'S');
    }
    
    // Dibujar filas de la tabla de observaciones
    let currentObsY = obsTableY + obsPadding;
    
    observacionesInfo.forEach((obs, index) => {
      const currentObsRowHeight = obsRowHeights[index];
      
      // Dibujar línea separadora entre filas (excepto la última)
      if (index < observacionesInfo.length - 1) {
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.3);
        pdf.line(obsTableX + 2, currentObsY + currentObsRowHeight - 1, obsTableX + obsTableWidth - 2, currentObsY + currentObsRowHeight - 1);
      }
      
      // Escribir etiqueta
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont('helvetica', 'bold');
      pdf.text(obs.label, obsLabelX, currentObsY + 4);
      
      // Escribir valor
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      if (obs.multiline && obs.value) {
        const obsLines = splitTextIntoLines(obs.value, 60);
        obsLines.forEach((line, lineIndex) => {
          pdf.text(line, obsValueX, currentObsY + 4 + (lineIndex * lineHeight));
        });
      } else {
        pdf.text(obs.value, obsValueX, currentObsY + 4);
      }
      
      currentObsY += currentObsRowHeight;
    });
    
    // Actualizar posición Y después de la tabla de observaciones
    yPosition = obsTableY + obsTableHeight + 4;
    
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
