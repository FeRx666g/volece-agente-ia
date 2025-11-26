import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaTruck, FaClipboardList, FaChartBar } from 'react-icons/fa';

export default function DashboardHome() {
  return (
    <div className="dashboard-wrapper">
      <section className="dashboard-cards">
        <div className="dashboard-card">
          <FaUsers className="dashboard-icon" />
          <Link to="usuarios" className="dashboard-link">
            <h2>Gestión de Usuarios</h2>
            <p>Administra transportistas, clientes y administradores.</p>
          </Link>
        </div>

        <div className="dashboard-card">
          <FaClipboardList className="dashboard-icon" />
          <Link to="solicitudes" className="dashboard-link">
            <h2>Gestión de Solicitudes</h2>
            <p>Aprueba o visualiza solicitudes de transporte.</p>
          </Link>
        </div>

        <div className="dashboard-card">
          <FaTruck className="dashboard-icon" />
          <Link to="vehiculos" className="dashboard-link">
            <h2>Gestión de Vehículos</h2>
            <p>Administra camiones, volquetas y maquinaria.</p>
          </Link>
        </div>

        <div className="dashboard-card">
          <FaChartBar className="dashboard-icon" />
          <Link to="reportes" className="dashboard-link">
            <h2>Reportes</h2>
            <p>Visualiza estadísticas de servicios.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
