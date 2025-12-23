import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HistorialMantenimientos.css';

export default function HistorialMantenimientos() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [mapaVehiculos, setMapaVehiculos] = useState({}); // Para guardar id -> placa
  const token = localStorage.getItem('access');

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    try {
      // 1. Hacemos las dos peticiones simultáneamente
      const [resMantenimientos, resVehiculos] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/vehiculos/transportista/mantenimientos', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://127.0.0.1:8000/api/vehiculos/transportista/vehiculo', {
            headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setMantenimientos(resMantenimientos.data);

      // 2. Creamos un mapa rápido para buscar nombres por ID
      // Resultado: { 1: "ABC-1234 (Hino)", 2: "XYZ-9999 (Chevrolet)" }
      const listaVehiculos = Array.isArray(resVehiculos.data) ? resVehiculos.data : [resVehiculos.data];
      const mapa = {};
      listaVehiculos.forEach(v => {
        mapa[v.id] = `${v.placa} - ${v.marca}`;
      });
      setMapaVehiculos(mapa);

    } catch (error) {
      console.error("Error cargando historial:", error);
    }
  };

  const formatearTipo = (tipo) => {
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
  };

  return (
    <div className="vlc-hmn-container">
      <div className="vlc-hmn-card">
        <div className="vlc-hmn-header">
          <h2>Historial de Mantenimientos</h2>
          <p>Registro cronológico de servicios realizados a la flota.</p>
        </div>

        <div className="vlc-hmn-body">
          {mantenimientos.length === 0 ? (
            <div className="vlc-hmn-empty">
              No se han encontrado mantenimientos registrados.
            </div>
          ) : (
            <div className="vlc-hmn-table-wrapper">
              <table className="vlc-hmn-table">
                <thead>
                  <tr>
                    {/* NUEVA COLUMNA */}
                    <th>Unidad</th> 
                    <th>Tipo de Servicio</th>
                    <th>KM Actual</th>
                    <th>Próximo KM</th>
                    <th>Fecha</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mantenimientos.map((m, idx) => (
                    <tr key={idx}>
                      {/* MOSTRAMOS EL NOMBRE USANDO EL MAPA */}
                      <td className="vlc-hmn-vehicle">
                        <strong>{mapaVehiculos[m.vehiculo] || 'Vehículo no encontrado'}</strong>
                      </td>
                      
                      <td className="vlc-hmn-type">{formatearTipo(m.tipo)}</td>
                      <td>{m.kilometraje_actual.toLocaleString()} km</td>
                      <td className="vlc-hmn-next-km">{m.kilometraje_proximo.toLocaleString()} km</td>
                      <td>{new Date(m.fecha_mantenimiento).toLocaleDateString()}</td>
                      <td className="vlc-hmn-obs">{m.observaciones || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}