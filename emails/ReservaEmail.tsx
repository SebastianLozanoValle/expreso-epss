import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ReservaEmailProps {
  patientName?: string;
  numeroAutorizacion?: string;
}

export const ReservaEmail = ({ patientName = 'Estimado paciente', numeroAutorizacion }: ReservaEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirmación de reserva hotelera</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirmación de Reserva Hotelera</Heading>
        
        <Text style={text}>
          {patientName},
        </Text>
        
        <Text style={text}>
          Su reserva hotelera ha sido confirmada exitosamente. A continuación encontrará los detalles de su estadía.
        </Text>
        
        <Section style={buttonContainer}>
          <Button
            style={button}
            href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://evtxhebrara.vercel.app/'}/generar?auth=${numeroAutorizacion || 'demo'}`}
          >
            Ir por el comprobante
          </Button>
        </Section>
        
        <Text style={text}>
          Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos.  
        </Text>
        
        <Text style={footer}>
          Atentamente,<br />
          Equipo de Reservas
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const buttonContainer = {
  padding: '27px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '0 auto',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '40px',
  textAlign: 'center' as const,
};

export default ReservaEmail;
