import React from "react";
import './footer.css';

export default function Footer() {
  return (
    <footer className="vlc-foo-footer">
      <div className="vlc-foo-container">
        <div className="vlc-foo-content">
          <div className="vlc-foo-info">
            <p className="vlc-foo-copy">
              &copy; {new Date().getFullYear()} <strong>VOLECE<span>.CA</span></strong> - Todos los derechos reservados.
            </p>
          </div>
          
          <div className="vlc-foo-links">
            <a href="/privacidad" className="vlc-foo-link">Política de privacidad</a>
            <a href="/terminos" className="vlc-foo-link">Términos y condiciones</a>
            <a href="#contacto" className="vlc-foo-link">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
}