import React, { useState } from 'react';
import { Menu, Search, Users, FileText, Calendar, Shield, MessageSquare, Lock, Home, BarChart3, HelpCircle, Mail, Facebook, Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">FO</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">FOCOM UES ILIAD</h1>
              <p className="text-xs text-gray-600">NOTRE FORCE, VOS DROITS</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-700 hover:text-red-600 font-medium">Accueil</a>
            <a href="#" className="text-gray-700 hover:text-red-600 font-medium">Actualités</a>
            <a href="#" className="text-gray-700 hover:text-red-600 font-medium">Bilan de Mandat</a>
            <a href="#" className="text-gray-700 hover:text-red-600 font-medium">Espace Adhérent</a>
            <a href="#" className="text-gray-700 hover:text-red-600 font-medium">Vos Droits</a>
            <a href="#" className="text-gray-700 hover:text-red-600 font-medium">La FOCOM</a>
            <a href="#" className="text-gray-700 hover:text-red-600 font-medium">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6">
              <Users className="w-4 h-4 mr-2" />
              Nous rejoindre
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-48 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5" />
              Tableau de bord
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'news'
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-5 h-5" />
              Actualités
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'report'
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Bilan de Mandat
            </button>
            <button
              onClick={() => setActiveTab('member')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'member'
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              Espace Adhérent
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100">
              <Shield className="w-5 h-5" />
              Vos Droits
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100">
              <FileText className="w-5 h-5" />
              Documents Utiles
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100">
              <HelpCircle className="w-5 h-5" />
              FAQ
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100">
              <MessageSquare className="w-5 h-5" />
              Nous Contacter
            </button>

            <div className="pt-6 mt-6 border-t border-gray-200">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg">
                <Lock className="w-4 h-4 mr-2" />
                Se connecter à mon espace adhérent
              </Button>
            </div>
          </nav>

          {/* Social Links */}
          <div className="absolute bottom-6 left-4 flex gap-3">
            <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Facebook className="w-4 h-4 text-gray-600" />
            </a>
            <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Linkedin className="w-4 h-4 text-gray-600" />
            </a>
            <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Twitter className="w-4 h-4 text-gray-600" />
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto p-8">
              <div className="grid grid-cols-3 gap-8">
                {/* Left Column - Actualités */}
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-red-600">ACTUALITÉS</h2>
                    <a href="#" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
                      Voir toutes les actualités <span>→</span>
                    </a>
                  </div>

                  <div className="space-y-4">
                    {/* News Item 1 */}
                    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                      <div className="flex gap-4 p-4">
                        <img
                          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop"
                          alt="Negotiation"
                          className="w-24 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="inline-block bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded mb-2">
                            À LA UNE
                          </div>
                          <h3 className="font-bold text-gray-900 mb-1">
                            Négociation Annuelle Obligatoire 2024 : Nos revendications avancent
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">16 mai 2024 • Négociations</p>
                        </div>
                      </div>
                    </div>

                    {/* News Item 2 */}
                    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                      <div className="flex gap-4 p-4">
                        <img
                          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop"
                          alt="Telework"
                          className="w-24 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">
                            Accord Télétravail : Un nouvel accord signé pour plus de flexibilité
                          </h3>
                          <p className="text-sm text-gray-600">8 mai 2024 • Accord</p>
                        </div>
                      </div>
                    </div>

                    {/* News Item 3 */}
                    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                      <div className="flex gap-4 p-4">
                        <img
                          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop"
                          alt="Mobilization"
                          className="w-24 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">
                            Mobilisation réussie pour défendre nos droits et nos emplois
                          </h3>
                          <p className="text-sm text-gray-600">30 avril 2024 • Mobilisation</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Espace Adhérent Section */}
                  <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">ESPACE ADHÉRENT</h2>
                    <p className="text-gray-600 mb-6">Un espace dédié pour vous informer et vous accompagner</p>

                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { icon: '📄', title: 'Mes Documents', desc: 'Accédez à vos documents et modèles utiles' },
                        { icon: '👥', title: 'Mes Avantages', desc: 'Découvrez vos avantages adhérents' },
                        { icon: '📅', title: 'Prendre RDV', desc: 'Prenez rendez-vous avec un élu FOCOM' },
                        { icon: '❓', title: 'Poser une Question', desc: 'Une question ? Nous vous répondons' },
                        { icon: '✉️', title: 'Vos Contacts', desc: 'Trouvez vos interlocuteurs FOCOM' },
                        { icon: '🔐', title: 'Accès Réservés', desc: 'Accédez à des contenus réservés aux adhérents' },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
                          <div className="text-3xl mb-2">{item.icon}</div>
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-xs text-gray-600">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    <Button className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg">
                      <Lock className="w-4 h-4 mr-2" />
                      Se connecter à mon espace adhérent
                    </Button>
                  </div>
                </div>

                {/* Right Column - Stats & Actions */}
                <div className="col-span-1">
                  {/* Bilan Stats */}
                  <div className="bg-white rounded-lg p-6 shadow mb-6">
                    <h3 className="text-lg font-bold text-red-600 mb-4">BILAN DE MANDAT 2021 – 2024</h3>
                    <p className="text-sm text-gray-600 mb-4">3 années d'actions au service de tous les salariés</p>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                          <span className="text-teal-600 font-bold text-lg">✓</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">42</p>
                          <p className="text-xs text-gray-600">Accords signés et améliorés</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 font-bold text-lg">👥</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">78</p>
                          <p className="text-xs text-gray-600">Réunions de négociation</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                          <span className="text-teal-600 font-bold text-lg">📁</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">126</p>
                          <p className="text-xs text-gray-600">Dossiers individuels accompagnés</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 font-bold text-lg">✓</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">100%</p>
                          <p className="text-xs text-gray-600">Présents aux côtés</p>
                        </div>
                      </div>
                    </div>

                    <a href="#" className="text-red-600 hover:text-red-700 font-medium text-sm mt-4 inline-flex items-center gap-1">
                      Voir le bilan complet <span>→</span>
                    </a>
                  </div>

                  {/* Nos Combats */}
                  <div className="bg-white rounded-lg p-6 shadow">
                    <h3 className="text-lg font-bold text-red-600 mb-4">NOS COMBATS, VOS DROITS</h3>
                    <p className="text-sm text-gray-600 mb-4">La FOCOM agit chaque jour pour défendre vos droits</p>

                    <div className="space-y-4">
                      {[
                        { icon: '🛡️', title: 'Défendre', items: ['Respect des accords', 'Égalité & non-discrimination', 'Santé & sécurité', 'Droit à la déconnexion'] },
                        { icon: '💬', title: 'Négocier', items: ['Salaires & primes', 'Télétravail', 'Organisation du temps de travail', 'Formation'] },
                        { icon: '🤝', title: 'Agir ensemble', items: ['Mobilisations', 'Actions collectives', 'Écoles & proximité', 'Informations régulières'] },
                      ].map((section, idx) => (
                        <div key={idx}>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <span>{section.icon}</span>
                            {section.title}
                          </h4>
                          <ul className="text-xs text-gray-600 space-y-1 ml-6">
                            {section.items.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="mt-12 grid grid-cols-3 gap-6 bg-white rounded-lg p-6 shadow">
                <div className="flex gap-3">
                  <HelpCircle className="w-6 h-6 text-teal-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Une question ? Besoin d'aide ?</p>
                    <p className="text-sm text-gray-600">Les élus FOCOM sont à votre écoute.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">01 87 15 43 11</p>
                    <p className="text-sm text-gray-600">Appel non surtaxé</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Mail className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">contact@focom-iliad.fr</p>
                    <p className="text-sm text-gray-600">Nous vous répondons rapidement</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Import Phone icon
import { Phone } from 'lucide-react';

export default Dashboard;
