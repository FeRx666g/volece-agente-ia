import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MantenimientoForm.css';

export default function MantenimientoForm({ onMantenimientoRegistrado }) {
  // Estado para la lista de vehículos
  const [vehiculos, setVehiculos] = useState([]);
  
  const [tipo, setTipo] = useState('CAMBIO_ACEITE');
  const [kilometrajeActual, setKilometrajeActual] = useState('');
  const [kilometrajeProximo, setKilometrajeProximo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [kmBase, setKmBase] = useState(null);
  const [vehiculoId, setVehiculoId] = useState('');

  const tiposMantenimiento = [
    { value: 'CAMBIO_ACEITE', label: 'Cambio de Aceite' },
    { value: 'FILTROS', label: 'Cambio de Filtros' },
    { value: 'FRENOS', label: 'Revisión de Frenos' },
    { value: 'LLANTAS', label: 'Revisión de Llantas' },
    { value: 'SUSPENSION', label: 'Revisión de Suspensión' },
    { value: 'ELECTRICO', label: 'Sistema Eléctrico' },
    { value: 'REFRIGERACION', label: 'Sistema de Refrigeración' },
    { value: 'OTRO', label: 'Otro' }
  ];

  const token = localStorage.getItem('access');

  useEffect(() => {
    obtenerVehiculos();
  }, []);

  const obtenerVehiculos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/vehiculos/transportista/vehiculo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Manejamos si la respuesta es un array o un objeto paginado
      const lista = Array.isArray(response.data) ? response.data : [response.data];
      setVehiculos(lista);

      // Seleccionar automáticamente el primero si existe
      if (lista.length > 0) {
        seleccionarVehiculo(lista[0].id, lista);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Función para manejar el cambio de vehículo y actualizar km base
  const seleccionarVehiculo = (id, listaOrigen = vehiculos) => {
    const vehiculoSeleccionado = listaOrigen.find(v => v.id == id);
    if (vehiculoSeleccionado) {
      setVehiculoId(id);
      setKmBase(vehiculoSeleccionado.kilometraje_actual);
      setKilometrajeActual(vehiculoSeleccionado.kilometraje_actual);
    }
  };

  const handleVehiculoChange = (e) => {
    seleccionarVehiculo(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const kmActual = parseInt(kilometrajeActual);
    const kmProximo = parseInt(kilometrajeProximo);

    if (!vehiculoId) {
        alert('Por favor seleccione un vehículo.');
        return;
    }

    if (kmBase !== null && kmActual < kmBase) {
      alert(`El Kilometraje Actual no puede ser menor al registrado: ${kmBase} km`);
      return;
    }

    if (kmProximo <= kmActual) {
      alert('El Kilometraje Próximo debe ser mayor al actual.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        'http://127.0.0.1:8000/api/vehiculos/transportista/mantenimientos',
        {
          tipo,
          kilometraje_actual: kmActual,
          kilometraje_proximo: kmProximo,
          observaciones,
          vehiculo: vehiculoId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Mantenimiento registrado exitosamente.');
      setTipo('CAMBIO_ACEITE');
      setKilometrajeProximo('');
      setObservaciones('');
      // Refrescamos los vehículos para actualizar el kilometraje base localmente
      obtenerVehiculos(); 
      if (onMantenimientoRegistrado) onMantenimientoRegistrado();
    } catch (error) {
      alert('Error al registrar mantenimiento.');
    }
    setLoading(false);
  };

  return (
    <div className="vlc-mnt-container">
      <form className="vlc-mnt-form" onSubmit={handleSubmit}>
        <div className="vlc-mnt-header">
          <h2>Registrar Mantenimiento</h2>
          <p>Ingrese los datos técnicos del servicio realizado a la unidad.</p>
        </div>

        <div className="vlc-mnt-body">
          
          {/* NUEVO CAMPO DE SELECCIÓN DE VEHÍCULO */}
          <div className="vlc-mnt-field">
            <label>Seleccionar Unidad</label>
            <select value={vehiculoId} onChange={handleVehiculoChange} required>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>
                  {v.placa} - {v.modelo}
                </option>
              ))}
            </select>
          </div>

          <div className="vlc-mnt-field">
            <label>Tipo de Mantenimiento</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}>
              {tiposMantenimiento.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>

          <div className="vlc-mnt-grid">
            <div className="vlc-mnt-field">
              <label>Kilometraje Actual</label>
              <input
                type="number"
                value={kilometrajeActual}
                onChange={e => setKilometrajeActual(e.target.value)}
                required
                min={kmBase || 0}
              />
              <small style={{color: '#64748b', fontSize: '0.8rem'}}>Registrado: {kmBase} km</small>
            </div>

            <div className="vlc-mnt-field">
              <label>Kilometraje Próximo</label>
              <input
                type="number"
                value={kilometrajeProximo}
                onChange={e => setKilometrajeProximo(e.target.value)}
                required
                placeholder="Ej: 55000"
              />
            </div>
          </div>

          <div className="vlc-mnt-field">
            <label>Observaciones Adicionales</label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Detalle el trabajo realizado..."
            />
          </div>

          <button type="submit" className="vlc-mnt-submit" disabled={loading}>
            {loading ? 'Procesando...' : 'Guardar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
}