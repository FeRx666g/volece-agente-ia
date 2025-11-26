import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MantenimientoForm.css';

export default function MantenimientoForm({ onMantenimientoRegistrado }) {
  const [tipo, setTipo] = useState('CAMBIO_ACEITE');
  const [kilometrajeActual, setKilometrajeActual] = useState('');
  const [kilometrajeProximo, setKilometrajeProximo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [kmBase, setKmBase] = useState(null); // <- Kilometraje real desde la BD

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
  obtenerVehiculo();
}, []);

const [vehiculoId, setVehiculoId] = useState(null);

const obtenerVehiculo = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/vehiculos/transportista/vehiculo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = response.data;
    setKmBase(data.kilometraje_actual);
    setKilometrajeActual(data.kilometraje_actual);
    setVehiculoId(data.id); 
  } catch (error) {
    console.error('Error al cargar el vehículo:', error.response?.data || error.message);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const kmActual = parseInt(kilometrajeActual);
    const kmProximo = parseInt(kilometrajeProximo);

    if (isNaN(kmActual) || kmActual < 0) {
      alert('El Kilometraje Actual debe ser un número positivo.');
      return;
    }

    if (kmBase !== null && kmActual < kmBase) {
      alert(`El Kilometraje Actual no puede ser menor al registrado: ${kmBase} km`);
      return;
    }

    if (isNaN(kmProximo) || kmProximo <= 0) {
      alert('El Kilometraje Próximo debe ser un número positivo.');
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
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert('Mantenimiento registrado exitosamente.');
      setTipo('CAMBIO_ACEITE');
      setKilometrajeActual(kmBase);  
      setKilometrajeProximo('');
      setObservaciones('');
      if (onMantenimientoRegistrado) onMantenimientoRegistrado();
    } catch (error) {
      console.error('Error al registrar mantenimiento:', error.response?.data || error.message);
      alert('Error al registrar mantenimiento.');
    }
    setLoading(false);
  };

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h2>Registrar Mantenimiento</h2>

      <label>Tipo de Mantenimiento:</label>
      <select value={tipo} onChange={e => setTipo(e.target.value)}>
        {tiposMantenimiento.map(op => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>

      <label>Kilometraje Actual:</label>
      <input
        type="number"
        value={kilometrajeActual}
        onChange={e => setKilometrajeActual(e.target.value)}
        required
        min={kmBase || 0}
      />

      <label>Kilometraje Próximo:</label>
      <input
        type="number"
        value={kilometrajeProximo}
        onChange={e => setKilometrajeProximo(e.target.value)}
        required
        min="1"
      />

      <label>Observaciones:</label>
      <textarea
        value={observaciones}
        onChange={e => setObservaciones(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrar'}
      </button>
    </form>
  );
}
