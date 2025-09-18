import React from 'react';
import FloatingShapes from '../../components/FloatingShapes';
import Header from '../../components/Header';
import HeroSection from '../../components/HeroSection';
import FeaturesSection from '../../components/FeaturesSection';
import QuizDemo from '../../components/QuizDemo';
import JourneySection from '../../components/JourneySection';
import CTASection from '../../components/CTASection';
import Footer from '../../components/Footer';
import './Main.css'; // Import CSS thông thường, không phải module
import { useTheme } from '../../contexts/ThemeContext';

const Main = () => {

  return (
    <div className="main-page-wrapper"> 
      <div className="app">
        <FloatingShapes />
        <Header />
        <HeroSection />
        <FeaturesSection />
        <QuizDemo />
        <JourneySection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
};

export default Main;