import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ActualizarKilometraje({ onKilometrajeActualizado }) {
  const [kilometraje, setKilometraje] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehiculoId, setVehiculoId] = useState(null);  // 👈 Guardamos el ID aquí

  const token = localStorage.getItem('access');

  useEffect(() => {
    obtenerVehiculo();
  }, []);

  const obtenerVehiculo = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/vehiculos/transportista/vehiculo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setVehiculoId(response.data.id);
    } catch (error) {
      console.error('Error al obtener el vehículo:', error.response?.data || error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehiculoId) {
      alert('No se pudo obtener el vehículo del transportista.');
      return;
    }

    setLoading(true);
    try {
      await axios.patch(
        'http://127.0.0.1:8000/api/vehiculos/transportista/vehiculo/kilometraje',
        {
          vehiculo_id: vehiculoId,
          kilometraje_actual: parseInt(kilometraje)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('Kilometraje actualizado exitosamente.');
      setKilometraje('');
      if (onKilometrajeActualizado) {
        onKilometrajeActualizado();
      }
    } catch (error) {
      console.error('Error al actualizar kilometraje:', error.response?.data || error.message);
      alert('Error al actualizar kilometraje.');
    }
    setLoading(false);
  };

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h2>Actualizar Kilometraje Actual</h2>

      <label>Nuevo Kilometraje:</label>
      <input
        type="number"
        value={kilometraje}
        onChange={e => setKilometraje(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Actualizando...' : 'Actualizar'}
      </button>
    </form>
  );
}
