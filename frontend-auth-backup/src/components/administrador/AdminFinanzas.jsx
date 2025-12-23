import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaFilePdf } from 'react-icons/fa';
import './estilos/AdminFinanzas.css';

export default function AdminFinanzas() {
  const [movimientos, setMovimientos] = useState([]);
  const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, balance: 0 });
  const [filtros, setFiltros] = useState({ fecha_inicio: '', fecha_fin: '', tipo: '' });
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    tipo: 'INGRESO',
    monto: '',
    descripcion: '',
    fecha: ''
  });

  const token = localStorage.getItem('access');
  const API_URL = 'http://127.0.0.1:8000/api/finanzas/';

  const cargarDatos = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: filtros
      };
      const resMov = await axios.get(`${API_URL}movimientos/`, config);
      setMovimientos(resMov.data.results || resMov.data);
      const resBalance = await axios.get(`${API_URL}balance/`, config);
      setResumen(resBalance.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [filtros]);

  const handleChange = (e) => {
    setNuevoMovimiento({ ...nuevoMovimiento, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}movimientos/`, 
        nuevoMovimiento, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Movimiento registrado correctamente');
      setMostrarModal(false);
      setNuevoMovimiento({ tipo: 'INGRESO', monto: '', descripcion: '', fecha: '' });
      cargarDatos();
    } catch (error) {
      alert('Error al guardar el movimiento');
    }
  };

  const handleExportarPDF = () => {
    const params = new URLSearchParams(filtros).toString();
    window.open(`http://127.0.0.1:8000/api/reportes/finanzas-pdf/?${params}`, '_blank');
  };

  return (
    <div className="vlc-fin-container">
      <header className="vlc-fin-header">
        <h2>Gestión Financiera</h2>
      </header>

      <div className="vlc-fin-summary-grid">
        <CardResumen titulo="Ingresos" monto={resumen.ingresos} type="ingreso" />
        <CardResumen titulo="Gastos" monto={resumen.gastos} type="gasto" />
        <CardResumen titulo="Balance Neto" monto={resumen.balance} type="balance" isNegative={resumen.balance < 0} />
      </div>

      <div className="vlc-fin-controls">
        <div className="vlc-fin-filters">
          <input 
            type="date" 
            className="vlc-fin-input"
            onChange={(e) => setFiltros({...filtros, fecha_inicio: e.target.value})} 
          />
          <input 
            type="date" 
            className="vlc-fin-input"
            onChange={(e) => setFiltros({...filtros, fecha_fin: e.target.value})} 
          />
          <select 
            className="vlc-fin-select"
            onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
          >
            <option value="">Todos los Tipos</option>
            <option value="INGRESO">Ingresos</option>
            <option value="GASTO">Gastos</option>
          </select>
        </div>

        <div className="vlc-fin-actions">
            <button className="vlc-fin-btn vlc-btn-add" onClick={() => setMostrarModal(true)}>
                <FaPlus /> Registrar
            </button>
            <button className="vlc-fin-btn vlc-btn-pdf" onClick={handleExportarPDF}>
                <FaFilePdf /> Reporte PDF
            </button>
        </div>
      </div>

      <div className="vlc-fin-table-wrapper">
        <table className="vlc-fin-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Registrado Por</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.length === 0 ? (
               <tr><td colSpan="5" className="vlc-fin-empty">No hay movimientos en este rango</td></tr>
            ) : (
              movimientos.map((mov) => (
                  <tr key={mov.id}>
                  <td>{mov.fecha}</td>
                  <td>
                      <span className={`vlc-fin-tag ${mov.tipo}`}>
                        {mov.tipo}
                      </span>
                  </td>
                  <td>{mov.descripcion || '-'}</td>
                  <td className="vlc-fin-amount">${mov.monto}</td>
                  <td>{mov.usuario_nombre}</td>
                  </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {mostrarModal && (
        <div className="vlc-fin-modal-overlay">
          <div className="vlc-fin-modal-card">
            <h3>Registrar Movimiento</h3>
            <form className="vlc-fin-form" onSubmit={handleSubmit}>
              
              <div className="vlc-fin-field">
                <label>Tipo de Movimiento:</label>
                <select name="tipo" value={nuevoMovimiento.tipo} onChange={handleChange} required>
                  <option value="INGRESO">Ingreso</option>
                  <option value="GASTO">Gasto</option>
                </select>
              </div>

              <div className="vlc-fin-field">
                <label>Monto o Cantidad:</label>
                <input type="number" step="0.01" name="monto" placeholder="0.00" value={nuevoMovimiento.monto} onChange={handleChange} required />
              </div>

              <div className="vlc-fin-field">
                <label>Fecha:</label>
                <input type="date" name="fecha" value={nuevoMovimiento.fecha} onChange={handleChange} required />
              </div>

              <div className="vlc-fin-field">
                <label>Descripción:</label>
                <input type="text" name="descripcion" placeholder="Ej: Pago Nómina, Flete..." value={nuevoMovimiento.descripcion} onChange={handleChange} />
              </div>

              <div className="vlc-fin-modal-btns">
                <button type="submit" className="vlc-fin-btn-save">Guardar</button>
                <button type="button" className="vlc-fin-btn-cancel" onClick={() => setMostrarModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const CardResumen = ({ titulo, monto, type, isNegative }) => (
    <div className={`vlc-fin-summary-card vlc-fin-card-${type} ${isNegative ? 'vlc-fin-negative' : ''}`}>
        <h4>{titulo}</h4>
        <p>${monto}</p>
    </div>
);