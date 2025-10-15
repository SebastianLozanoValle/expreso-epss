'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const hotels = [
    {
      id: 'saana-45',
      name: 'Hotel Saana 45',
      description: 'Ubicado en el corazón de la ciudad',
      image: '🏨',
      path: '/hotel/saana-45'
    },
    {
      id: 'boulevar-rio',
      name: 'Hotel Boulevar del Rio',
      description: 'Vista panorámica al río',
      image: '🌊',
      path: '/hotel/boulevar-rio'
    },
    {
      id: 'ilar-corferias',
      name: 'Hotel Ilar Corferias',
      description: 'Cerca del centro de convenciones',
      image: '🏢',
      path: '/hotel/ilar-corferias'
    }
  ];

  const handleHotelClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bienvenido a Expreso de Viajes
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-teal-100">
            Selecciona tu hotel y comienza tu experiencia
          </p>
        </div>
      </section>

      {/* Hotels Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nuestros Hoteles
          </h2>
          <p className="text-lg text-gray-600">
            Elige el hotel que mejor se adapte a tus necesidades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              onClick={() => handleHotelClick(hotel.path)}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 p-6 text-center"
            >
              <div className="text-6xl mb-4">{hotel.image}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {hotel.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {hotel.description}
              </p>
              <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition-colors">
                Ver Disponibilidad
              </button>
            </div>
          ))}
        </div>

        {/* Carga Masiva Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/carga-masiva')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            📊 Carga Masiva
          </button>
        </div>
      </main>
    </div>
  );
}
