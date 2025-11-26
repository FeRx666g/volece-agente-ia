import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../img/LOGO2.png';
import './components.css';
import { FaBars } from 'react-icons/fa';

export default function Navbar({ onOpenModal }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {/* Sombra oscura cuando el menú está abierto */}
      {menuOpen && <div className="overlay" onClick={closeMenu}></div>}

      <header className="navbar">
        <div className="navbar-left">
          <img src={logo} alt="Logo" className="navbar-img" />
          <h2 className="navbar-title">VOLECE C.A.</h2>
        </div>

        <div className="menu-toggle" onClick={toggleMenu}>
          <FaBars />
        </div>

        <nav className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <ul>
            <li><Link to="/inicio" onClick={closeMenu}>Inicio</Link></li>
            <li><a href="#servicios" onClick={closeMenu}>Servicios</a></li>
            
            {/* Submenú de "Nosotros" */}
            <li className="dropdown">
              <button className="dropbtn" onClick={closeMenu}>Nosotros</button>
              <div className="dropdown-content">
                  <a onClick={() => { closeMenu(); onOpenModal('historia'); }}>Historia</a>
                  <a onClick={() => { closeMenu(); onOpenModal('mision'); }}>Misión</a>
                  <a onClick={() => { closeMenu(); onOpenModal('vision'); }}>Visión</a>
                  <a onClick={() => { closeMenu(); onOpenModal('valores'); }}>Valores</a>
              </div>
            </li>
            <li><Link to="/tipos-de-cargas" onClick={closeMenu}>Tipos de Cargas</Link></li>
            <li><a href="#contacto" onClick={closeMenu}>Contacto</a></li>
            <li><Link to="/login" onClick={closeMenu}>Iniciar Sesión</Link></li>
          </ul>
        </nav>
      </header>
    </>
  );
}
