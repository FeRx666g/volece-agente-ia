import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilList, cilNotes, cilEnvelopeOpen, cilAccountLogout } from '@coreui/icons'
import { FaWhatsapp, FaTruck, FaHistory } from 'react-icons/fa'
import axios from 'axios'

import './estilos/ClienteDashboard.css'
import SolicitarServicio from './Solicitudes/SolicitarServicio'

const API_URL = 'http://127.0.0.1:8000/api/servicios/'

const ClienteDashboard = () => {
  const navigate = useNavigate()
  const [modalVisible, setModalVisible] = useState(false)
  const [view, setView] = useState('dashboard')
  const [solicitudes, setSolicitudes] = useState([])
  const [error, setError] = useState(null)

  const clienteNombre = localStorage.getItem('user_name') || "Usuario"

  const fetchSolicitudes = async () => {
    const token = localStorage.getItem('access')
    if (!token) {
      setError('No estás autenticado')
      return
    }
    try {
      const res = await axios.get(`${API_URL}solicitudes/mis-solicitudes/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSolicitudes(res.data.results || [])
      setError(null)
    } catch (err) {
      setError('Error al cargar solicitudes')
    }
  }

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="vlc-dash-wrapper">
      <main className="vlc-main-content">
        <header className="vlc-dash-header">
          <div className="vlc-user-info">
            Bienvenido, <strong>{clienteNombre}</strong>
          </div>
        </header>

        <section className="vlc-content-body">
          {!modalVisible ? (
            <>
              {view === 'dashboard' && (
                <div className="vlc-fade-in">
                  <h2 className="vlc-page-title">Dashboard Cliente</h2>
                  <div className="vlc-stats-grid">
                    {/* Tarjeta 1: Solicitar */}
                    <div className="vlc-stat-card primary" onClick={() => setModalVisible(true)}>
                      <div className="vlc-stat-info">
                        <span className="vlc-stat-label">Nueva Orden</span>
                        <span className="vlc-stat-value">Solicitar</span>
                        <p className="vlc-stat-desc">Crea una nueva solicitud de transporte de carga.</p>
                      </div>
                      <div className="vlc-stat-icon"><FaTruck /></div>
                    </div>

                    {/* Tarjeta 2: Solicitudes Totales */}
                    <div className="vlc-stat-card" onClick={() => setView('solicitudes')}>
                      <div className="vlc-stat-info">
                        <span className="vlc-stat-label">Solicitudes Totales</span>
                        <span className="vlc-stat-value">{solicitudes.length}</span>
                        <p className="vlc-stat-desc">Revisa el historial y estado de tus pedidos.</p>
                      </div>
                      <div className="vlc-stat-icon"><FaHistory /></div>
                    </div>

                    {/* Tarjeta 3: WhatsApp */}
                    <a href="https://wa.me/593998521849" target="_blank" rel="noreferrer" className="vlc-stat-card wa">
                      <div className="vlc-stat-info">
                        <span className="vlc-stat-label">Ayuda Directa</span>
                        <span className="vlc-stat-value">WhatsApp</span>
                        <p className="vlc-stat-desc">Contacta directamente con nuestro equipo de soporte.</p>
                      </div>
                      <div className="vlc-stat-icon"><FaWhatsapp /></div>
                    </a>

                    {/* Tarjeta 4: Cerrar Sesión */}
                    <div className="vlc-stat-card logout" onClick={handleLogout}>
                      <div className="vlc-stat-info">
                        <span className="vlc-stat-label">Salir</span>
                        <span className="vlc-stat-value">Cerrar Sesión</span>
                        <p className="vlc-stat-desc">Cierra tu sesión actual de forma segura.</p>
                      </div>
                      <div className="vlc-stat-icon"><CIcon icon={cilAccountLogout} /></div>
                    </div>
                  </div>
                </div>
              )}

              {view === 'solicitudes' && (
                <div className="vlc-fade-in">
                  <h2 className="vlc-page-title">Mis Solicitudes</h2>
                  {error && <div className="vlc-error-msg">{error}</div>}
                  <div className="vlc-table-container">
                    <table className="vlc-modern-table">
                      <thead>
                        <tr>
                          <th>Origen</th>
                          <th>Destino</th>
                          <th>Carga</th>
                          <th>Fecha</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solicitudes.length === 0 ? (
                          <tr><td colSpan="5" className="vlc-empty">No hay registros</td></tr>
                        ) : (
                          solicitudes.map((s) => (
                            <tr key={s.id}>
                              <td>{s.origen}</td>
                              <td>{s.destino}</td>
                              <td>{s.tipo_carga}</td>
                              <td>{new Date(s.fecha_solicitud).toLocaleDateString()}</td>
                              <td><span className={`vlc-status-badge ${s.estado.toLowerCase()}`}>{s.estado}</span></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="vlc-modal-container vlc-fade-in">
              <SolicitarServicio
                onClose={() => {
                  setModalVisible(false);
                  fetchSolicitudes(); 
                }}
              />
            </div>
          )}
        </section>
      </main>

      <aside className="vlc-sidebar">
        <div className="vlc-sidebar-logo">
          <h1>VOLECE<span>.CA</span></h1>
        </div>
        <nav className="vlc-nav-menu">
          <div className={`vlc-nav-item ${view === 'dashboard' && !modalVisible ? 'active' : ''}`}
            onClick={() => { setModalVisible(false); setView('dashboard') }}>
            <CIcon icon={cilSpeedometer} className="vlc-icon" />
            <span>Panel de Control</span>
          </div>
          <div className={`vlc-nav-item ${modalVisible ? 'active' : ''}`}
            onClick={() => { setModalVisible(true); setView('dashboard') }}>
            <CIcon icon={cilList} className="vlc-icon" />
            <span>Solicitar Transporte</span>
          </div>
          <div className={`vlc-nav-item ${view === 'solicitudes' ? 'active' : ''}`}
            onClick={() => { setModalVisible(false); setView('solicitudes') }}>
            <CIcon icon={cilNotes} className="vlc-icon" />
            <span>Mis Solicitudes</span>
          </div>
          <div className="vlc-nav-item" onClick={() => window.open("https://wa.me/593998521849", "_blank")}>
            <CIcon icon={cilEnvelopeOpen} className="vlc-icon" />
            <span>Soporte Técnico</span>
          </div>
        </nav>
        <div className="vlc-sidebar-footer">
          <div className="vlc-nav-item logout" onClick={handleLogout}>
            <CIcon icon={cilAccountLogout} className="vlc-icon" />
            <span>Cerrar Sesión</span>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default ClienteDashboard