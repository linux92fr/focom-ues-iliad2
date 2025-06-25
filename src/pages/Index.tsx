
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PresentationSection from '@/components/PresentationSection';
import MissionsSection from '@/components/MissionsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <PresentationSection />
        <MissionsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
