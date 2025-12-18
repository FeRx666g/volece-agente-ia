import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import './DashboardAdmin.css';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Administración</h2>
        <nav className="sidebar-menu">
          <ul>
            <li><Link to="/dashboard-admin" className={location.pathname === "/dashboard-admin" ? "active" : ""}>Inicio</Link></li>
            <li><Link to="/dashboard-admin/usuarios" className={location.pathname.includes("usuarios") ? "active" : ""}>Usuarios</Link></li>
            <li><Link to="/dashboard-admin/solicitudes" className={location.pathname.includes("solicitudes") ? "active" : ""}>Solicitudes</Link></li>
            <li><Link to="/dashboard-admin/vehiculos" className={location.pathname.includes("vehiculos") ? "active" : ""}>Vehículos</Link></li>
            <li><Link to="/dashboard-admin/finanzas" className={location.pathname.includes("finanzas") ? "active" : ""}>Finanzas</Link></li>
            <li><Link to="/dashboard-admin/reportes" className={location.pathname.includes("reportes") ? "active" : ""}>Reportes</Link></li>
          </ul>
        </nav>

        <div className="logout-container">
          <button onClick={handleLogout} className="btn-logout">
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Compañía Volquetas El Cedral VOLECE.C.A.</h1>
        </header>

        {/* AQUÍ ES IMPORTANTE: envolver el Outlet */}
        <div className="dashboard-content-admin">
          <Outlet />
        </div>

        <footer className="dashboard-footer">
          <p>&copy; 2025 VOLECE C.A. Todos los derechos reservados.</p>
        </footer>
      </main>
    </div>
  );
}
