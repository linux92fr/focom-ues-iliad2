
import React from 'react';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Generated Image */}
      <section className="relative w-full">
        <img
          src="/focom_hero.png"
          alt="FOCOM UES ILIAD - 4 ans de combat pour vos droits"
          className="w-full h-auto object-cover"
        />
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Rejoignez le mouvement
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Depuis 4 ans, FOCOM UES ILIAD se bat pour défendre vos droits et améliorer vos conditions de travail.
          </p>
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-full"
          >
            Nous rejoindre
          </Button>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Nos valeurs fondamentales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Défendre */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <svg
                  className="w-full h-full text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Défendre</h3>
              <p className="text-gray-600">
                Protéger les droits et intérêts de nos membres
              </p>
            </div>

            {/* Représenter */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <svg
                  className="w-full h-full text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 12H9m4 0a4 4 0 110-8 4 4 0 010 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Représenter</h3>
              <p className="text-gray-600">
                Donner une voix aux travailleurs du secteur
              </p>
            </div>

            {/* Négocier */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <svg
                  className="w-full h-full text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Négocier</h3>
              <p className="text-gray-600">
                Obtenir les meilleures conditions possibles
              </p>
            </div>

            {/* Agir */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <svg
                  className="w-full h-full text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Agir</h3>
              <p className="text-gray-600">
                Prendre des mesures concrètes pour le changement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ensemble, nous sommes plus forts
          </h2>
          <p className="text-lg text-red-100 mb-8">
            Rejoignez FOCOM UES ILIAD et faites partie du mouvement syndical
          </p>
          <Button
            size="lg"
            className="bg-white hover:bg-gray-100 text-red-600 px-8 py-6 text-lg rounded-full font-semibold"
          >
            Adhérer maintenant
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
