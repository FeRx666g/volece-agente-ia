import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TransportistaDashboard.css';
import MantenimientoForm from './MantenimientoForm';
import HistorialMantenimientos from './HistorialMantenimientos';
import ActualizarKilometraje from './ActualizarKilometraje';

export default function TransportistaDashboard() {
  const [vehiculo, setVehiculo] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [activeTab, setActiveTab] = useState('vehiculo');

  const token = localStorage.getItem('access');

  useEffect(() => {
    fetchVehiculo();
    fetchAlertas();
  }, []);

  const fetchVehiculo = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/vehiculos/transportista/vehiculo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setVehiculo(response.data);
    } catch (error) {
      console.error('Error al obtener el vehículo:', error.response?.data || error.message);
      alert('Error: ' + (error.response?.data?.error || 'No se pudo cargar el vehículo.'));
    }
  };

  const fetchAlertas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/vehiculos/transportista/alertas', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAlertas(response.data);
    } catch (error) {
      console.error('Error al obtener alertas:', error);
    }
  };

  const cambiarEstado = async (nuevoEstado) => {
    try {
      await axios.patch('http://127.0.0.1:8000/api/vehiculos/transportista/vehiculo/estado',
        {
        vehiculo_id: vehiculo.id,
        estado: nuevoEstado
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert(`Estado actualizado a ${nuevoEstado}`);
      fetchVehiculo();
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
    }
  };

  const handleKilometrajeActualizado = () => {
    fetchAlertas();
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Volece.CA</h2>
        <button onClick={() => setActiveTab('vehiculo')} className={activeTab === 'vehiculo' ? 'active-sidebar' : ''}>Vehículo</button>
        <button onClick={() => setActiveTab('mantenimientos')} className={activeTab === 'mantenimientos' ? 'active-sidebar' : ''}>Mantenimientos</button>
        <button onClick={() => setActiveTab('alertas')} className={activeTab === 'alertas' ? 'active-sidebar' : ''}>Alertas</button>
        <button onClick={() => setActiveTab('historial')} className={activeTab === 'historial' ? 'active-sidebar' : ''}>Historial</button>
        <button onClick={() => setActiveTab('kilometraje')} className={activeTab === 'kilometraje' ? 'active-sidebar' : ''}>Actualizar Kilometraje</button>
        <br />
        <br />
        <button className="logout-button" onClick={() => {localStorage.removeItem('access');
          window.location.href = '/login'; 
        }}>
  Cerrar sesión
</button>

      </div>

    <div className="dashboard-content">
        <div className="dashboard-content-inner">
        <h1>Dashboard Socio Transportista</h1>
        <hr style={{ marginBottom: '20px', borderColor: '#256d39' }} />

        {activeTab === 'vehiculo' && (
          <div className="card-section">
            {vehiculo ? (
              <div className="vehiculo-info">
                <p><strong>Placa:</strong> {vehiculo.placa}</p>
                <p><strong>Marca:</strong> {vehiculo.marca}</p>
                <p><strong>Modelo:</strong> {vehiculo.modelo}</p>
                <p><strong>Año:</strong> {vehiculo.anio}</p>
                <p><strong>Color:</strong> {vehiculo.color}</p>
                <p><strong>Tonelaje:</strong> {vehiculo.tonelaje} toneladas</p>
                <p><strong>Combustible:</strong> {vehiculo.combustible}</p>
                <p><strong>Estado:</strong> <span className="estado-vehiculo">{vehiculo.estado}</span></p>

                <div className="estado-buttons">
                  <button onClick={() => cambiarEstado('ACTIVO')}>Activo</button>
                  <button onClick={() => cambiarEstado('INACTIVO')}>Inactivo</button>
                  <button onClick={() => cambiarEstado('MANTENIMIENTO')}>Mantenimiento</button>
                </div>
              </div>
            ) : (
              <p>Cargando información del vehículo...</p>
            )}
          </div>
        )}

        {activeTab === 'mantenimientos' && (
          <div className="card-section">
            <MantenimientoForm token={token} />
          </div>
        )}

        {activeTab === 'historial' && (
          <HistorialMantenimientos />
        )}

        {activeTab === 'kilometraje' && (
          <div className="card-section">
            <ActualizarKilometraje onKilometrajeActualizado={handleKilometrajeActualizado} />
          </div>
        )}

        {activeTab === 'alertas' && (
          <div className="card-section">
            {alertas.length > 0 ? (
              alertas.map((alerta, idx) => (
                <div key={idx} className="alerta-item">
                  {alerta.mensaje}
                </div>
              ))
            ) : (
              <p>No hay alertas activas</p>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
