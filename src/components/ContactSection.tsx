
import React from 'react';
import { Mail, Phone, MapPin, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContactSection = () => {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="section-title text-center">Nous Contacter</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Pour toute demande d'information, mission ou collaboration, 
            notre équipe est à votre disposition 24h/24 et 7j/7.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-8 animate-slide-in-left">
            <div className="military-card p-6">
              <h3 className="text-xl font-bold text-military-olive mb-6">Informations de Contact</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-military-olive/20 rounded-lg">
                    <Phone className="h-5 w-5 text-military-olive" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Ligne directe</h4>
                    <p className="text-gray-400">+33 (0)1 XX XX XX XX</p>
                    <p className="text-gray-400 text-sm">Urgences 24h/24</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-military-olive/20 rounded-lg">
                    <Mail className="h-5 w-5 text-military-olive" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Email</h4>
                    <p className="text-gray-400">contact@focomues.fr</p>
                    <p className="text-gray-400 text-sm">Réponse sous 24h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-military-olive/20 rounded-lg">
                    <MapPin className="h-5 w-5 text-military-olive" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Adresse</h4>
                    <p className="text-gray-400">Base Opérationnelle</p>
                    <p className="text-gray-400 text-sm">France Métropolitaine</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-military-olive/20 rounded-lg">
                    <Clock className="h-5 w-5 text-military-olive" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Disponibilité</h4>
                    <p className="text-gray-400">24h/24 - 7j/7</p>
                    <p className="text-gray-400 text-sm">Interventions d'urgence</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="military-card p-6">
              <h3 className="text-xl font-bold text-military-olive mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <Button className="tactical-button w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Demande d'intervention d'urgence
                </Button>
                <Button variant="outline" className="w-full justify-start border-military-steel text-white hover:bg-military-steel/20">
                  <Mail className="h-4 w-4 mr-2" />
                  Demande de devis
                </Button>
                <Button variant="outline" className="w-full justify-start border-military-steel text-white hover:bg-military-steel/20">
                  <Phone className="h-4 w-4 mr-2" />
                  Planifier un entretien
                </Button>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="military-card p-8 animate-fade-in">
            <h3 className="text-xl font-bold text-military-olive mb-6">Formulaire de Contact</h3>
            
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-military-steel/50 border border-military-steel rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-military-olive"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prénom</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-military-steel/50 border border-military-steel rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-military-olive"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-military-steel/50 border border-military-steel rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-military-olive"
                  placeholder="votre.email@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type de demande</label>
                <select className="w-full px-4 py-3 bg-military-steel/50 border border-military-steel rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-military-olive">
                  <option value="">Sélectionnez une option</option>
                  <option value="security">Sécurité rapprochée</option>
                  <option value="training">Formation</option>
                  <option value="consultation">Consultation</option>
                  <option value="emergency">Intervention d'urgence</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 bg-military-steel/50 border border-military-steel rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-military-olive resize-none"
                  placeholder="Décrivez votre demande en détail..."
                ></textarea>
              </div>

              <Button className="tactical-button w-full">
                <Mail className="h-4 w-4 mr-2" />
                Envoyer le message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
