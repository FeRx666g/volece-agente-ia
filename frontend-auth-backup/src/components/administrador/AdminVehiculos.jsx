import React from 'react';
import { Link } from 'react-router-dom';
import {FaList, FaTruck } from 'react-icons/fa';

export default function DashboardHome() {
  return (
    <section className="dashboard-cards">
        <div className="dashboard-card">
        <FaTruck className="dashboard-icon" />
        <Link to="registrar-vehiculo" className="dashboard-link">
          <h2>Registrar Vehículo</h2>
          <p>Registrar un nuevo vehículo asociado a un transportista</p>
        </Link>
      </div>

      <div className="dashboard-card">
        <FaList className="dashboard-icon" />
        <Link to="listar-vehiculos" className="dashboard-link">
          <h2>Listado de Vehículos</h2>
          <p>Visualice y gestione la flota de vehículos</p>
        </Link>
      </div>

    </section>
  );
}
