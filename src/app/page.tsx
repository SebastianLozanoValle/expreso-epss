'use client';

import { useRouter } from 'next/navigation';
// import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  const hotels = [
    {
      id: 'medellin',
      name: 'Hotel Medellín',
      description: 'Ubicado en el corazón de la ciudad de la eterna primavera',
      image: '',
      path: '/hotel/medellin',
      price: 163841 // Precio real de Medellín
    },
    {
      id: 'cali',
      name: 'Hotel Cali',
      description: 'En la sucursal del cielo, con vista panorámica',
      image: '',
      path: '/hotel/cali',
      price: 182011 // Precio real de Cali
    },
    {
      id: 'bogota',
      name: 'Hotel Bogotá',
      description: 'En la capital, cerca de los principales centros de convenciones',
      image: '',
      path: '/hotel/bogota',
      price: 133256 // Precio real de Bogotá
    }
  ];

  const handleHotelClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
              Hebrara
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              Explora Nuestra Disponibilidad
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              
              <button 
                onClick={() => router.push('/carga-masiva')}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-green-600 transition-all duration-300"
              >
                Carga Masiva
              </button>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-bounce"></div>
      </section>

      {/* Unified Container for Destinations and Cards */}
      <div className="relative">
        {/* Background Decorations for this section - Enhanced */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating circles - More variety and intensity */}
          <div className="absolute top-10 left-5 w-28 h-28 bg-green-200/40 rounded-full animate-pulse delay-100"></div>
          <div className="absolute top-32 right-10 w-20 h-20 bg-emerald-200/50 rounded-full animate-bounce delay-800"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-teal-200/30 rounded-full animate-pulse delay-1500"></div>
          <div className="absolute bottom-10 right-1/4 w-32 h-32 bg-green-300/40 rounded-full animate-bounce delay-2500"></div>
          <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-emerald-100/60 rounded-full animate-ping delay-200"></div>
          <div className="absolute top-1/2 right-1/5 w-12 h-12 bg-teal-100/70 rounded-full animate-pulse delay-1200"></div>
          <div className="absolute bottom-1/4 left-10 w-20 h-20 bg-green-200/50 rounded-full animate-bounce delay-3000"></div>
          <div className="absolute top-10 right-1/2 w-18 h-18 bg-emerald-300/40 rounded-full animate-pulse delay-600"></div>
          
          {/* Geometric shapes - More variety and intensity */}
          <div className="absolute top-1/3 right-5 w-20 h-20 bg-green-400/30 rotate-45 animate-pulse delay-400"></div>
          <div className="absolute bottom-1/3 left-5 w-16 h-16 bg-emerald-400/40 rotate-12 animate-bounce delay-1000"></div>
          <div className="absolute top-1/5 left-10 w-14 h-14 bg-teal-300/50 rotate-90 animate-spin delay-1800"></div>
          <div className="absolute bottom-1/5 right-10 w-18 h-18 bg-green-500/30 rotate-30 animate-pulse delay-2200"></div>
          <div className="absolute top-2/3 left-1/5 w-12 h-12 bg-emerald-500/40 rotate-60 animate-bounce delay-2800"></div>
          <div className="absolute bottom-2/3 right-1/5 w-10 h-10 bg-teal-400/50 rotate-15 animate-pulse delay-3500"></div>
          
          {/* Additional decorative elements */}
          <div className="absolute top-1/6 left-1/6 w-8 h-8 bg-green-300/60 rotate-45 animate-pulse delay-500"></div>
          <div className="absolute top-3/4 right-1/6 w-6 h-6 bg-emerald-200/70 rotate-30 animate-bounce delay-700"></div>
          <div className="absolute bottom-1/6 left-1/2 w-14 h-14 bg-teal-300/40 rotate-75 animate-pulse delay-900"></div>
          <div className="absolute top-1/2 left-1/3 w-22 h-22 bg-green-400/25 rotate-120 animate-bounce delay-1100"></div>
          
          {/* Small decorative dots */}
          <div className="absolute top-1/8 left-1/8 w-4 h-4 bg-green-500/80 rounded-full animate-ping delay-300"></div>
          <div className="absolute top-3/8 right-1/8 w-3 h-3 bg-emerald-400/90 rounded-full animate-pulse delay-600"></div>
          <div className="absolute bottom-1/8 left-3/4 w-5 h-5 bg-teal-500/70 rounded-full animate-bounce delay-900"></div>
          <div className="absolute bottom-3/8 right-3/4 w-2 h-2 bg-green-600/85 rounded-full animate-ping delay-1200"></div>
          
          {/* Enhanced patterns */}
          <div className="absolute top-0 left-0 w-full h-full opacity-8">
            <div className="w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 20% 20%, #10b981 2px, transparent 2px),
                               radial-gradient(circle at 80% 80%, #059669 2px, transparent 2px),
                               radial-gradient(circle at 50% 50%, #0d9488 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          {/* Additional subtle pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-4">
            <div className="w-full h-full" style={{
              backgroundImage: `linear-gradient(45deg, transparent 49%, rgba(16, 185, 129, 0.1) 50%, transparent 51%)`,
              backgroundSize: '20px 20px'
            }}></div>
          </div>
        </div>

        {/* Hotels Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Nuestros Destinos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cada ciudad tiene su encanto único. Elige tu destino perfecto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              onClick={() => handleHotelClick(hotel.path)}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 overflow-hidden h-[400px] flex flex-col"
            >
              <div className="relative h-48 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl opacity-80">{hotel.image}</div>
                </div>
              </div>
              
              <div className="p-6 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                    {hotel.name}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {hotel.description}
                  </p>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <span className="text-sm font-semibold text-green-600">Desde ${hotel.price.toLocaleString('es-CO')}</span>
                  
                  <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Ver Disponibilidad
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      </div>
    </div>
  );
}
