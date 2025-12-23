import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TransportistaDashboard.css';
import MantenimientoForm from './MantenimientoForm';
import HistorialMantenimientos from './HistorialMantenimientos';
import ActualizarKilometraje from './ActualizarKilometraje';
import CIcon from '@coreui/icons-react';
import { cilTruck, cilSettings, cilBell, cilHistory, cilAccountLogout, cilSpeedometer } from '@coreui/icons';

export default function TransportistaDashboard() {
  const [listaVehiculos, setListaVehiculos] = useState([]);
  const [vehiculoActual, setVehiculoActual] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [activeTab, setActiveTab] = useState('vehiculo');

  const token = localStorage.getItem('access');
  const BASE_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchVehiculos();
    fetchAlertas();
    fetchAsignaciones();
  }, []);

  const fetchVehiculos = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/vehiculos/transportista/vehiculo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const datos = Array.isArray(response.data) ? response.data : [response.data];
      setListaVehiculos(datos);
      if (datos.length > 0) {
        setVehiculoActual(datos[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAlertas = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/vehiculos/transportista/alertas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlertas(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAsignaciones = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/servicios/mis-asignaciones/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listaViajes = response.data.results || response.data;
      setAsignaciones(Array.isArray(listaViajes) ? listaViajes : []);
    } catch (error) {
      setAsignaciones([]); 
    }
  };

  const cambiarEstado = async (nuevoEstado) => {
    if (!vehiculoActual) return;
    try {
      await axios.patch(`${BASE_URL}/api/vehiculos/transportista/vehiculo/estado`,
        { vehiculo_id: vehiculoActual.id, estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Estado actualizado a ${nuevoEstado}`);
      fetchVehiculos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login'; 
  };

  return (
    <div className="vlc-tra-wrapper">
      <aside className="vlc-tra-sidebar">
        <div className="vlc-tra-logo">
          <h1>VOLECE<span>.CA</span></h1>
        </div>
        <nav className="vlc-tra-nav">
          <div className={`vlc-tra-nav-item ${activeTab === 'vehiculo' ? 'active' : ''}`} onClick={() => setActiveTab('vehiculo')}>
            <CIcon icon={cilTruck} className="vlc-tra-icon" />
            <span>Mis Vehículos</span>
          </div>
          <div className={`vlc-tra-nav-item ${activeTab === 'mantenimientos' ? 'active' : ''}`} onClick={() => setActiveTab('mantenimientos')}>
            <CIcon icon={cilSettings} className="vlc-tra-icon" />
            <span>Mantenimientos</span>
          </div>
          <div className={`vlc-tra-nav-item ${activeTab === 'kilometraje' ? 'active' : ''}`} onClick={() => setActiveTab('kilometraje')}>
            <CIcon icon={cilSpeedometer} className="vlc-tra-icon" />
            <span>Kilometraje</span>
          </div>
          <div className={`vlc-tra-nav-item ${activeTab === 'alertas' ? 'active' : ''}`} onClick={() => setActiveTab('alertas')}>
            <CIcon icon={cilBell} className="vlc-tra-icon" />
            <span>Viajes y Alertas</span>
          </div>
          <div className={`vlc-tra-nav-item ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>
            <CIcon icon={cilHistory} className="vlc-tra-icon" />
            <span>Historial</span>
          </div>
        </nav>
        <div className="vlc-tra-sidebar-footer">
          <div className="vlc-tra-nav-item logout" onClick={handleLogout}>
            <CIcon icon={cilAccountLogout} className="vlc-tra-icon" />
            <span>Cerrar Sesión</span>
          </div>
        </div>
      </aside>

      <main className="vlc-tra-main">
        <header className="vlc-tra-header">
          <h2>Panel del Socio Transportista</h2>
        </header>

        <section className="vlc-tra-content">
          {activeTab === 'vehiculo' && (
            <div className="vlc-tra-fade-in">
              {listaVehiculos.length > 1 && (
                <div className="vlc-tra-selector">
                    <p>Seleccione unidad:</p>
                    <div className="vlc-tra-selector-list">
                        {listaVehiculos.map(v => (
                            <button 
                                key={v.id} 
                                className={`vlc-tra-sel-btn ${vehiculoActual?.id === v.id ? 'active' : ''}`}
                                onClick={() => setVehiculoActual(v)}
                            >
                                {v.placa} - {v.modelo}
                            </button>
                        ))}
                    </div>
                </div>
              )}

              {vehiculoActual ? (
                <div className="vlc-tra-card-info">
                  <div className="vlc-tra-card-header">
                    <h3>Información de la Unidad</h3>
                    <span className={`vlc-tra-badge ${vehiculoActual.estado}`}>{vehiculoActual.estado}</span>
                  </div>

                  <div className="vlc-tra-detail-layout">
                      <div className="vlc-tra-photo-container">
                          {vehiculoActual.foto ? (
                              <img 
                                src={`${BASE_URL}${vehiculoActual.foto}`} 
                                alt="Foto Vehículo" 
                                className="vlc-tra-vehiculo-img"
                              />
                          ) : (
                              <div className="vlc-tra-no-photo">
                                  <CIcon icon={cilTruck} size="3xl"/>
                                  <p>Sin foto</p>
                              </div>
                          )}
                      </div>

                      <div className="vlc-tra-info-grid">
                        <div className="vlc-tra-info-item"><strong>Placa:</strong> <span>{vehiculoActual.placa}</span></div>
                        <div className="vlc-tra-info-item"><strong>Marca:</strong> <span>{vehiculoActual.marca}</span></div>
                        <div className="vlc-tra-info-item"><strong>Modelo:</strong> <span>{vehiculoActual.modelo}</span></div>
                        <div className="vlc-tra-info-item"><strong>Año:</strong> <span>{vehiculoActual.anio}</span></div>
                        <div className="vlc-tra-info-item"><strong>Color:</strong> <span>{vehiculoActual.color}</span></div>
                        <div className="vlc-tra-info-item"><strong>Tonelaje:</strong> <span>{vehiculoActual.tonelaje} t</span></div>
                        <div className="vlc-tra-info-item"><strong>Combustible:</strong> <span>{vehiculoActual.combustible}</span></div>
                      </div>
                  </div>
                  
                  <div className="vlc-tra-state-actions">
                    <p>Actualizar estado operativo:</p>
                    <div className="vlc-tra-btn-group">
                      <button className="vlc-tra-btn active" onClick={() => cambiarEstado('ACTIVO')}>Activo</button>
                      <button className="vlc-tra-btn inactive" onClick={() => cambiarEstado('INACTIVO')}>Inactivo</button>
                      <button className="vlc-tra-btn repair" onClick={() => cambiarEstado('MANTENIMIENTO')}>Mantenimiento</button>
                    </div>
                  </div>
                </div>
              ) : <p className="vlc-tra-loading">Cargando datos...</p>}
            </div>
          )}

          {activeTab === 'mantenimientos' && <div className="vlc-tra-fade-in"><MantenimientoForm token={token} /></div>}
          {activeTab === 'historial' && <div className="vlc-tra-fade-in"><HistorialMantenimientos /></div>}
          {activeTab === 'kilometraje' && <div className="vlc-tra-fade-in"><ActualizarKilometraje onKilometrajeActualizado={fetchAlertas} /></div>}

          {activeTab === 'alertas' && (
            <div className="vlc-tra-fade-in">
              <div className="vlc-tra-card">
                <h3>Mis Viajes Asignados</h3>
                <div className="vlc-tra-table-wrapper">
                  <table className="vlc-tra-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Vehículo</th>
                        <th>Ruta (Origen - Destino)</th>
                        <th>Carga</th>
                        <th>Cliente</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asignaciones.length === 0 ? (
                        <tr><td colSpan="7" className="vlc-tra-empty">No hay viajes registrados</td></tr>
                      ) : (
                        asignaciones.map((turno) => (
                          <tr key={turno.id}>
                            <td>#{turno.id}</td>
                            <td>{turno.fecha_turno}</td>
                            
                            <td style={{fontWeight: 'bold', color: '#279200'}}>
                                {turno.vehiculo_data ? (
                                    <span>{turno.vehiculo_data.placa}</span>
                                ) : (
                                    <span style={{color: '#94a3b8', fontStyle: 'italic'}}>Sin Asignar</span>
                                )}
                            </td>

                            <td>
                              <div className="vlc-tra-route">
                                {turno.solicitud_data?.origen} <span className="vlc-tra-arrow">→</span> {turno.solicitud_data?.destino}
                              </div>
                            </td>
                            <td>{turno.solicitud_data?.tipo_carga}</td>
                            <td><strong>{turno.solicitud_data?.cliente_nombre}</strong></td>
                            <td><span className={`vlc-tra-tag ${turno.estado_solicitud}`}>{turno.estado_solicitud}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {alertas.length > 0 && (
                <div className="vlc-tra-alerts-section">
                  <h3>Notificaciones del Vehículo</h3>
                  {alertas.map((alerta, idx) => (
                    <div key={idx} className="vlc-tra-alert-item">
                      <CIcon icon={cilBell} className="vlc-tra-alert-icon" />
                      <span>{alerta.mensaje}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}