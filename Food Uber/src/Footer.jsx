import React from 'react'
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { NavDropdown } from 'react-bootstrap';
import "./footer.css"

function Footer() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'ar', name: 'العربية', flag: '🇦🇪' }
  ];

  return (
    <div>
            {/* footer */}
          <footer className="footer" data-aos="fade-up" data-aos-duration="800">
      <div className="footer-container">

        {/* Logo + About */}
        <div className="footer-col">
          <h2 className="logo">FoodExpress</h2>
          <p>
            {t('delicious_food')}
          </p>
        </div>

        {/* Partner with us */}
        <div className="footer-col">
          <h3>{t('for_businesses')}</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><Link to="/partner" className="text-decoration-none">🏪 {t('register_restaurant')}</Link></li>
            <li><Link to="/delivery-join" className="text-decoration-none">🛵 {t('become_rider')}</Link></li>
            <li><Link to="/partner/login" className="text-decoration-none">🔑 {t('partner_login')}</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-col">
          <h3>{t('support')}</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><Link to="/help" className="text-decoration-none">{t('help_center')}</Link></li>
            <li><Link to="/privacy" className="text-decoration-none">{t('privacy_policy')}</Link></li>
            <li><Link to="/terms" className="text-decoration-none">{t('terms_conditions')}</Link></li>
          </ul>
        </div>

        {/* Social */}
        <div className="footer-col">
          <h3>{t('follow_us')}</h3>
          <div className="socials">
            <span>Facebook</span><br />
            <span>Instagram</span><br />
            <span>Twitter</span>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            © {new Date().getFullYear()} FoodExpress. {t('footer_text')}
          </div>
          
          <div className="footer-language-selector">
            <NavDropdown 
              title={
                <span className="text-white-50 d-flex align-items-center gap-2 border border-secondary rounded-pill px-3 py-1">
                  <i className="fa-solid fa-globe"></i>
                  <span>{languages.find(l => l.code === i18n.language)?.name || 'Language'}</span>
                </span>
              } 
              id="footer-language-dropdown" 
              drop="up"
              align="end"
            >
              {languages.map((lang) => (
                <NavDropdown.Item 
                  key={lang.code} 
                  onClick={() => changeLanguage(lang.code)}
                  className={i18n.language === lang.code ? 'active' : ''}
                >
                  <span className="me-2">{lang.flag}</span> {lang.name}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
          </div>
        </div>
      </div>
    </footer>
    </div>
  )
}

export default Footer;
