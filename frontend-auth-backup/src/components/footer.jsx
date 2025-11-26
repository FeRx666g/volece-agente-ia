import React from "react";
import './components.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2025 VOLECE C.A. - Todos los derechos reservados.</p>
        <div className="footer-links">
          <a href="#">Política de privacidad</a>
          <a href="#">Términos y condiciones</a>
          <a href="#">Contacto</a>
        </div>
      </div>
    </footer>
  );
}
