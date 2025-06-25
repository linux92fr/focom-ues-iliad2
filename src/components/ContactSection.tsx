
import React from 'react';
import { Mail, Phone, MapPin, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContactSection = () => {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="section-title text-center">Nous Contacter</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Une question, un problème au travail, besoin d'aide ? 
            Notre équipe syndicale est à votre écoute et vous accompagne 
            dans toutes vos démarches.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-8 animate-slide-in-left">
            <div className="union-card p-6">
              <h3 className="text-xl font-bold text-union-red mb-6">Informations de Contact</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-union-red/20 rounded-lg">
                    <Phone className="h-5 w-5 text-union-red" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Ligne syndicale</h4>
                    <p className="text-gray-400">+33 (0)1 XX XX XX XX</p>
                    <p className="text-gray-400 text-sm">Du lundi au vendredi</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-union-red/20 rounded-lg">
                    <Mail className="h-5 w-5 text-union-red" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Email</h4>
                    <p className="text-gray-400">contact@syndicat-unis.fr</p>
                    <p className="text-gray-400 text-sm">Réponse sous 24h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-union-red/20 rounded-lg">
                    <MapPin className="h-5 w-5 text-union-red" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Adresse</h4>
                    <p className="text-gray-400">Maison des Syndicats</p>
                    <p className="text-gray-400 text-sm">123 Avenue de la République</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-union-red/20 rounded-lg">
                    <Clock className="h-5 w-5 text-union-red" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Permanences</h4>
                    <p className="text-gray-400">Lun-Ven : 9h-17h</p>
                    <p className="text-gray-400 text-sm">Sur rendez-vous</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="union-card p-6">
              <h3 className="text-xl font-bold text-union-red mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <Button className="solidarity-button w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Adhérer au syndicat
                </Button>
                <Button variant="outline" className="w-full justify-start border-union-steel text-white hover:bg-union-steel/20">
                  <Mail className="h-4 w-4 mr-2" />
                  Demander de l'aide
                </Button>
                <Button variant="outline" className="w-full justify-start border-union-steel text-white hover:bg-union-steel/20">
                  <Phone className="h-4 w-4 mr-2" />
                  Prendre rendez-vous
                </Button>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="union-card p-8 animate-fade-in">
            <h3 className="text-xl font-bold text-union-red mb-6">Formulaire de Contact</h3>
            
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-union-blue/50 border border-union-steel rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-union-red"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prénom</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-union-blue/50 border border-union-steel rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-union-red"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-union-blue/50 border border-union-steel rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-union-red"
                  placeholder="votre.email@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sujet</label>
                <select className="w-full px-4 py-3 bg-union-blue/50 border border-union-steel rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-union-red">
                  <option value="">Sélectionnez un sujet</option>
                  <option value="adhesion">Adhésion</option>
                  <option value="conflit">Conflit au travail</option>
                  <option value="information">Demande d'information</option>
                  <option value="assistance">Assistance juridique</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 bg-union-blue/50 border border-union-steel rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-union-red resize-none"
                  placeholder="Décrivez votre situation ou votre demande..."
                ></textarea>
              </div>

              <Button className="solidarity-button w-full">
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
