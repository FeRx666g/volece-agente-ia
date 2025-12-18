import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaFilePdf } from 'react-icons/fa';
import './AdminUsers.css';
import './estilos/modal.css';

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
      console.error(error);
      alert('Error al guardar el movimiento');
    }
  };

  const handleExportarPDF = () => {
    const params = new URLSearchParams(filtros).toString();
    window.open(`http://127.0.0.1:8000/api/reportes/finanzas-pdf/?${params}`, '_blank');
  };

  return (
    <div className="usuarios-container">
      <h2>Gestión Financiera</h2>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', marginTop: '10px' }}>
        <CardResumen titulo="Ingresos" monto={resumen.ingresos} color="#28a745" />
        <CardResumen titulo="Gastos" monto={resumen.gastos} color="#dc3545" />
        <CardResumen titulo="Balance Neto" monto={resumen.balance} color={resumen.balance >= 0 ? '#007bff' : '#dc3545'} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="date" 
            className="form-control"
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            onChange={(e) => setFiltros({...filtros, fecha_inicio: e.target.value})} 
          />
          <input 
            type="date" 
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            onChange={(e) => setFiltros({...filtros, fecha_fin: e.target.value})} 
          />
          <select 
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
          >
            <option value="">Todos los Tipos</option>
            <option value="INGRESO">Ingresos</option>
            <option value="GASTO">Gastos</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-crear-usuario" onClick={() => setMostrarModal(true)}>
                <FaPlus /> Registrar
            </button>
            <button className="btn-crear-usuario" style={{backgroundColor: '#cc3333'}} onClick={handleExportarPDF}>
                <FaFilePdf /> Reporte PDF
            </button>
        </div>
      </div>

      <table className="tabla-usuarios">
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
             <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No hay movimientos en este rango</td></tr>
          ) : (
            movimientos.map((mov) => (
                <tr key={mov.id}>
                <td>{mov.fecha}</td>
                <td>
                    <span style={{ 
                    fontWeight: 'bold',
                    color: mov.tipo === 'INGRESO' ? 'green' : 'red' 
                    }}>
                    {mov.tipo}
                    </span>
                </td>
                <td>{mov.descripcion || '-'}</td>
                <td style={{fontWeight: 'bold'}}>${mov.monto}</td>
                <td>{mov.usuario_nombre}</td>
                </tr>
            ))
          )}
        </tbody>
      </table>

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Registrar Movimiento</h3>
            <form onSubmit={handleSubmit}>
              
              <label style={{display:'block', marginBottom:'5px', fontWeight: 'bold'}}>Tipo de Movimiento:</label>
              <select
                name="tipo"
                value={nuevoMovimiento.tipo}
                onChange={handleChange}
                required
                style={{width: '100%', padding: '10px', marginBottom: '15px'}}
              >
                <option value="INGRESO">Ingreso </option>
                <option value="GASTO">Gasto </option>
              </select>

              <label style={{display:'block', marginBottom:'5px', fontWeight: 'bold'}}>Monto o Cantidad:</label>
              <input
                type="number"
                step="0.01"
                name="monto"
                placeholder="0.00"
                value={nuevoMovimiento.monto}
                onChange={handleChange}
                required
                style={{marginBottom: '15px'}}
              />

              <label style={{display:'block', marginBottom:'5px', fontWeight: 'bold'}}>Fecha del ingreso o gasto:</label>
              <input
                type="date"
                name="fecha"
                value={nuevoMovimiento.fecha}
                onChange={handleChange}
                required
                style={{marginBottom: '15px'}}
              />

              <label style={{display:'block', marginBottom:'5px', fontWeight: 'bold'}}>Descripción:</label>
              <input
                type="text"
                name="descripcion"
                placeholder="Ej: Pago Nómina, Flete..."
                value={nuevoMovimiento.descripcion}
                onChange={handleChange}
                style={{marginBottom: '20px'}}
              />

              <div className="modal-buttons">
                <button type="submit" className="btn-modal">
                  Guardar
                </button>
                <button
                  type="button"
                  className="btn-modal-cancelar"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const CardResumen = ({ titulo, monto, color }) => (
    <div style={{ 
        flex: 1, 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderLeft: `5px solid ${color}`
    }}>
        <h4 style={{ margin: 0, color: '#666', fontSize: '14px' }}>{titulo}</h4>
        <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            ${monto}
        </p>
    </div>
);