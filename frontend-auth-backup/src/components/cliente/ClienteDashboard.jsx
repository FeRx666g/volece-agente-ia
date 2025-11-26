import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilList, cilNotes, cilEnvelopeOpen, cilAccountLogout } from '@coreui/icons'
import { FaWhatsapp } from 'react-icons/fa'
import axios from 'axios'

import './ClienteDashboard.css'
import SolicitarServicio from './Solicitudes/SolicitarServicio'

const API_URL = 'http://127.0.0.1:8000/api/servicios/'

const ClienteDashboard = () => {
  const navigate = useNavigate()
  const [modalVisible, setModalVisible] = useState(false)
  const [view, setView] = useState('dashboard')
  const [solicitudes, setSolicitudes] = useState([])
  const [error, setError] = useState(null)

  const clienteNombre = ""

  const fetchSolicitudes = async () => {
    const token = localStorage.getItem('access') || localStorage.getItem('authToken')
    if (!token) {
      setError('No estás autenticado')
      return
    }
    try {
      const res = await axios.get(`${API_URL}solicitudes/mis-solicitudes/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setSolicitudes(res.data.results)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Error al cargar solicitudes')
      setSolicitudes([])
    }
  }

  useEffect(() => {
    if (view === 'solicitudes') {
      fetchSolicitudes()
    }
  }, [view])

  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('authToken')
    navigate('/login')
  }

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <h1>VOLECE<span>.CA</span></h1>
        </div>
        <div className="nav-menu">
          <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => { setModalVisible(false); setView('dashboard') }}>
            <CIcon icon={cilSpeedometer} className="me-2" />
            <span>Dashboard</span>
          </div>
          <div className="nav-item" onClick={() => { setModalVisible(true); setView('dashboard') }}>
            <CIcon icon={cilList} className="me-2" />
            <span>Solicitar Transporte</span>
          </div>
          <div className={`nav-item ${view === 'solicitudes' ? 'active' : ''}`} onClick={() => { setModalVisible(false); setView('solicitudes') }}>
            <CIcon icon={cilNotes} className="me-2" />
            <span>Mis Solicitudes</span>
          </div>
          <div className="nav-item" onClick={() => window.open("https://wa.me/593998521849", "_blank")}>
            <CIcon icon={cilEnvelopeOpen} className="me-2" />
            <span>Soporte</span>
          </div>
        </div>
        <div className="nav-item logout-button" onClick={handleLogout}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          <span>Cerrar Sesión</span>
        </div>
      </div>

      {/* Header */}
      <div className="header">
        Bienvenido <strong>{clienteNombre}</strong>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {!modalVisible ? (
          <>
            {view === 'dashboard' && (
              <>
                <div className="page-title"><div className="title">Dashboard Cliente</div></div>

                <div className="stats-cards">
                  <div className="stat-card" onClick={() => { setModalVisible(true); setView('dashboard') }}>
                    <div className="card-header">
                      <div>
                        <div className="card-value">+</div>
                        <div className="card-label">Solicitar Transporte</div>
                      </div>
                      <div className="card-icon green"><i className="fas fa-truck"></i></div>
                    </div>
                    <div className="card-change positive">
                      <span>Ir al formulario</span>
                    </div>
                  </div>

                  <div className="stat-card" onClick={() => { setModalVisible(false); setView('solicitudes') }}>
                    <div className="card-header">
                      <div>
                        <div className="card-value">{solicitudes.length}</div>
                        <div className="card-label">Mis Solicitudes</div>
                      </div>
                      <div className="card-icon green"><i className="fas fa-history"></i></div>
                    </div>
                    <div className="card-change neutral">
                      <span>Ver historial</span>
                    </div>
                  </div>

                  {/* WhatsApp Soporte */}
                  <a
                    href="https://wa.me/593998521849"
                    target="_blank"
                    rel="noreferrer"
                    className="stat-card"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="card-header">
                      <div>
                        <div className="card-value">Chat</div>
                        <div className="card-label">Soporte</div>
                      </div>
                      <div className="card-icon green">
                        <FaWhatsapp />
                      </div>
                    </div>
                    <div className="card-change neutral">
                      <span>Chat de ayuda</span>
                    </div>
                  </a>

                  <div className="stat-card" onClick={handleLogout}>
                    <div className="card-header">
                      <div>
                        <div className="card-value">Salir</div>
                        <div className="card-label">Cerrar sesión</div>
                      </div>
                      <div className="card-icon green"><i className="fas fa-sign-out-alt"></i></div>
                    </div>
                    <div className="card-change neutral">
                      <span>Volver al login</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {view === 'solicitudes' && (
              <>
                <div className="page-title"><div className="title">Mis Solicitudes</div></div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Origen</th>
                      <th>Destino</th>
                      <th>Tipo de carga</th>
                      <th>Fecha solicitud</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center' }}>No tienes solicitudes registradas.</td></tr>
                    ) : (
                      solicitudes.map((s) => (
                        <tr key={s.id}>
                          <td>{s.origen}</td>
                          <td>{s.destino}</td>
                          <td>{s.tipo_carga}</td>
                          <td>{s.fecha_solicitud}</td>
                          <td>{s.estado}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            )}
          </>
        ) : (
          <div className="modal-overlay">
            <div className="modal-container">
              <SolicitarServicio onClose={() => setModalVisible(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClienteDashboard
