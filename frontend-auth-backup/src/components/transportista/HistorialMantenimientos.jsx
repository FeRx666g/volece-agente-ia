import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function HistorialMantenimientos() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const token = localStorage.getItem('access');

  const [vehiculoId] = useState(null);
  useEffect(() => {
    fetchMantenimientos();
  }, []);

  const fetchMantenimientos = async () => {
    try {
      const response = await axios.get(
        'http://127.0.0.1:8000/api/vehiculos/transportista/mantenimientos',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMantenimientos(response.data);
    } catch (error) {
      console.error('Error al obtener mantenimientos:', error.response?.data || error.message);
    }
  };

  return (
    <div className="card-section">
      <h2>Historial de Mantenimientos</h2>

      {mantenimientos.length === 0 ? (
        <p>No hay mantenimientos registrados.</p>
      ) : (
        <table className="tabla-mantenimientos">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Kilometraje Actual</th>
              <th>Kilometraje Próximo</th>
              <th>Fecha</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {mantenimientos.map((m, idx) => (
              <tr key={idx}>
                <td>{formatearTipo(m.tipo)}</td>
                <td>{m.kilometraje_actual} km</td>
                <td>{m.kilometraje_proximo} km</td>
                <td>{m.fecha_mantenimiento}</td>
                <td>{m.observaciones || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Opcional: convertir el código del tipo a texto legible
function formatearTipo(tipo) {
  const tipos = {
    'CAMBIO_ACEITE': 'Cambio de Aceite',
    'FILTROS': 'Cambio de Filtros',
    'FRENOS': 'Revisión de Frenos',
    'LLANTAS': 'Revisión de Llantas',
    'SUSPENSION': 'Revisión de Suspensión',
    'ELECTRICO': 'Sistema Eléctrico',
    'REFRIGERACION': 'Sistema de Refrigeración',
    'OTRO': 'Otro'
  };
  return tipos[tipo] || tipo;
}
