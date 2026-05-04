import React from 'react'
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { NavDropdown } from 'react-bootstrap';
import "./Footer.css"

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
    <>
      {/* ── PREMIUM FOOTER ── */}
      <footer className="footer-premium">
        <div className="footer-top">
          <div className="footer-container">
            {/* Brand Section */}
            <div className="footer-col brand-col">
              <h2 className="footer-logo">Food<span>Express</span></h2>
              <p className="footer-about">
                {t('delicious_food')}
              </p>
              <div className="social-links">
                <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
                <a href="#"><i className="fa-brands fa-instagram"></i></a>
                <a href="#"><i className="fa-brands fa-twitter"></i></a>
                <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
              </div>
            </div>

            {/* Links Columns */}
            <div className="footer-col links-col">
              <h4>{t('for_businesses')}</h4>
              <ul>
                <li><Link to="/partner"><i className="fa-solid fa-store"></i> {t('register_restaurant')}</Link></li>
                <li><Link to="/delivery-join"><i className="fa-solid fa-motorcycle"></i> {t('become_rider')}</Link></li>
                <li><Link to="/partner/login"><i className="fa-solid fa-lock"></i> {t('partner_login')}</Link></li>
              </ul>
            </div>

            <div className="footer-col links-col">
              <h4>{t('support')}</h4>
              <ul>
                <li><Link to="/help">{t('help_center')}</Link></li>
                <li><Link to="/privacy">{t('privacy_policy')}</Link></li>
                <li><Link to="/terms">{t('terms_conditions')}</Link></li>
                <li><Link to="/contact">{t('contact')}</Link></li>
              </ul>
            </div>

            {/* Newsletter Section */}
            <div className="footer-col newsletter-col">
              <h4>Stay Updated</h4>
              <p>Subscribe to get exclusive offers and food updates.</p>
              <div className="subscribe-box">
                <input type="email" placeholder="Your email address" />
                <button><i className="fa-solid fa-paper-plane"></i></button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom-premium">
          <div className="footer-bottom-container bottom-flex">
            <div className="copyright">
              {t('footer_text')}
            </div>
            
            <div className="bottom-right">
              <div className="footer-language-selector">
                <NavDropdown 
                  title={
                    <span className="lang-toggle">
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
        </div>
      </footer>
    </>

  )
}

export default Footer;
