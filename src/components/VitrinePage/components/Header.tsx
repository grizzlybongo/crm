import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

interface HeaderProps {
  isScrolled: boolean;
  isHeaderVisible: boolean;
}

const Header: React.FC<HeaderProps> = ({ isScrolled, isHeaderVisible }) => {
  return (
    <header 
      id="main-header" 
      className={`main-header ${isScrolled ? 'scrolled' : ''} ${!isHeaderVisible ? 'hidden' : ''}`}
    >
      <div className="logo-container">
        <div className="logo-wrapper">
          <img 
            src="https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?w=80&h=80&fit=crop" 
            alt="CMT Logo" 
            className="header-logo"
          />
          <div className="logo-overlay">
            <div className="logo-shine"></div>
          </div>
        </div>
        <div className="company-info-header">
          <span className="company-name">CMT Expertise</span>
          <span className="company-tagline">Votre partenaire de confiance</span>
        </div>
      </div>
      
      <div className="contact-info">
        <div className="contact-item">
          <div className="contact-icon">
            <Phone size={14} />
          </div>
          <a href="tel:+33123456789" className="contact-link">01 23 45 67 89</a>
        </div>
        <div className="contact-item">
          <div className="contact-icon">
            <Mail size={14} />
          </div>
          <a href="mailto:contact@cmt-expertise.fr" className="contact-link">contact@cmt-expertise.fr</a>
        </div>
        <div className="contact-item">
          <div className="contact-icon">
            <MapPin size={14} />
          </div>
          <span className="contact-text">Paris, France</span>
        </div>
      </div>
    </header>
  );
};

export default Header;