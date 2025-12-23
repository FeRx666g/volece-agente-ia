import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './estilos/AdminSolicitudes.css';

const API_SERVICIOS_URL = 'http://127.0.0.1:8000/api/servicios/';
const API_USUARIOS_URL = 'http://127.0.0.1:8000/api/usuarios/';
const API_ASIGNAR_TURNO_URL = `${API_SERVICIOS_URL}asignar-turno/`;
const API_CREAR_TURNO_URL = `${API_SERVICIOS_URL}solicitudes/crear-turno/`;

const AdminSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchSolicitudes = async () => {
    setLoading(true);
    const token = localStorage.getItem('access');
    if (!token) {
      setError('No estás autenticado');
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await axios.get(`${API_SERVICIOS_URL}solicitudes/`, { headers });
      const listaSolicitudes = res.data.results || res.data;

      const solicitudesConPredicciones = await obtenerPrediccionesIA(
        listaSolicitudes,
        headers
      );

      setSolicitudes(solicitudesConPredicciones);
      setError(null);
    } catch (err) {
      setError('Error al cargar solicitudes');
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  const obtenerPrediccionesIA = async (listaSolicitudes, headers) => {
    try {
      const resTransp = await axios.get(`${API_USUARIOS_URL}transportistas/`, { headers });
      const transportistas = resTransp.data;

      const solicitudesConPred = await Promise.all(
        listaSolicitudes.map(async (solicitud) => {
          if (solicitud.estado === 'asignado') {
            return {
              ...solicitud,
              predicciones: [],
              selectedUniqueId: null, // CAMBIO: Usamos un ID único en lugar de solo transportista_id
            };
          }

          let mejor = null;
          let listaCompletaN8N = null;

          try {
            const resIA = await axios.post(
              API_ASIGNAR_TURNO_URL,
              { 
                id_solicitud: solicitud.id,
                tipo_vehiculo: solicitud.tipo_vehiculo 
              },
              { headers }
            );

            mejor = resIA.data?.mejor_transportista || null;
            listaCompletaN8N = resIA.data?.lista_completa || null;
          } catch (e) {
            console.error(e);
          }

          let predicciones = [];

          // CAMBIO: Lógica para construir predicciones con datos de VEHÍCULO y generar id_unico
          if (listaCompletaN8N && listaCompletaN8N.length > 0) {
            const ordenada = [...listaCompletaN8N].sort(
              (a, b) => (b.probabilidad || 0) - (a.probabilidad || 0)
            );

            predicciones = ordenada.map((t, index) => {
                // Generamos un ID único combinando transportista y vehículo (o indice si falla)
                // Asegúrate que n8n devuelve 'vehiculo_id'. Si no, usa el index como fallback.
                const vId = t.vehiculo_id || 'sin_vehiculo'; 
                const uniqueId = `${t.transportista_id}_${vId}_${index}`; 

                return {
                  id_unico: uniqueId, // <--- CLAVE ÚNICA PARA EL SELECT
                  transportista_id: t.transportista_id,
                  transportista_nombre: t.transportista_nombre,
                  // Capturamos datos del vehículo si vienen de n8n
                  vehiculo_id: t.vehiculo_id || null, 
                  vehiculo_info: t.vehiculo_placa ? `${t.vehiculo_placa} (${t.vehiculo_modelo || 'N/A'})` : 'Vehículo no especificado',
                  probabilidad: t.probabilidad ?? null,
                  comentario: t.comentario_ia || 'Comentario no disponible',
                  esIA: mejor && t.transportista_id === mejor.transportista_id && t.vehiculo_id === mejor.vehiculo_id,
                };
            });
          } else if (mejor) {
             // Caso solo 'mejor' (fallback simple)
             const uniqueId = `${mejor.transportista_id}_${mejor.vehiculo_id || 'best'}_0`;
             predicciones = [
              {
                id_unico: uniqueId,
                transportista_id: mejor.transportista_id,
                transportista_nombre: mejor.transportista_nombre,
                vehiculo_id: mejor.vehiculo_id || null,
                vehiculo_info: 'Recomendado IA',
                probabilidad: mejor.probabilidad,
                comentario: 'Recomendación de IA.',
                esIA: true,
              },
              // Agregamos el resto de transportistas (sin info de vehículo específica, genéricos)
              ...transportistas
                .filter((t) => t.id !== mejor.transportista_id)
                .map((t, idx) => ({
                  id_unico: `${t.id}_generico_${idx + 1}`,
                  transportista_id: t.id,
                  transportista_nombre: `${t.nombre} ${t.apellido}`,
                  vehiculo_id: null,
                  vehiculo_info: 'Sin asignar',
                  probabilidad: null,
                  comentario: 'Manual',
                  esIA: false,
                })),
            ];
          } else {
            // Caso sin IA, lista plana
            predicciones = transportistas.map((t, idx) => ({
              id_unico: `${t.id}_manual_${idx}`,
              transportista_id: t.id,
              transportista_nombre: `${t.nombre} ${t.apellido}`,
              vehiculo_id: null,
              vehiculo_info: 'Sin asignar',
              probabilidad: null,
              comentario: 'Manual',
              esIA: false,
            }));
          }

          // Seleccionamos por defecto el primero (la mejor predicción)
          const selectedUniqueId = predicciones.length > 0 ? predicciones[0].id_unico : null;

          return {
            ...solicitud,
            predicciones,
            selectedUniqueId, // CAMBIO: Guardamos el ID único en el estado
          };
        })
      );

      return solicitudesConPred;
    } catch (error) {
      return listaSolicitudes.map((s) => ({
        ...s,
        predicciones: [],
        selectedUniqueId: null,
      }));
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    const token = localStorage.getItem('access');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    setUpdatingId(id);
    try {
      const solicitud = solicitudes.find((s) => s.id === id);
      if (!solicitud) throw new Error('Solicitud no encontrada');

      // CAMBIO: Recuperamos la predicción completa usando el ID Único seleccionado
      let prediccionSeleccionada = null;
      if (solicitud.selectedUniqueId && solicitud.predicciones) {
          prediccionSeleccionada = solicitud.predicciones.find(p => p.id_unico === solicitud.selectedUniqueId);
      }

      // Datos para enviar
      let transportistaId = prediccionSeleccionada?.transportista_id || solicitud.transportista_asignado_id;
      let vehiculoId = prediccionSeleccionada?.vehiculo_id || null; // <--- Importante: enviar el vehículo
      let comentarioIA = prediccionSeleccionada?.comentario || null;

      if (['asignado', 'rechazado'].includes(nuevoEstado)) {
        const payloadTurno = {
          solicitud_id: id,
          transportista_id: transportistaId,
          vehiculo_id: vehiculoId, // <--- Enviamos el vehículo al backend
          nuevo_estado: nuevoEstado,
          ...(nuevoEstado === 'asignado' && { comentario_ia: comentarioIA }),
        };

        await axios.post(API_CREAR_TURNO_URL, payloadTurno, { headers });
      } else {
        const payload = { estado: nuevoEstado };
        await axios.patch(`${API_SERVICIOS_URL}solicitudes/${id}/`, payload, {
          headers,
        });
      }

      await fetchSolicitudes();
      setError(null);
    } catch (err) {
      setError('Error al actualizar estado');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  return (
    <div className="vlc-sol-container">
      <div className="vlc-sol-header">
        <h2>Gestión de Solicitudes</h2>
        <p>Administración y asignación de transporte</p>
      </div>
      
      {loading && <div className="vlc-sol-status-msg">Cargando solicitudes...</div>}
      {error && <div className="vlc-sol-error-msg">{error}</div>}

      <div className="vlc-sol-table-wrapper">
        <table className="vlc-sol-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Origen / Destino</th>
              <th>Detalles</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Asignación (Socio - Unidad)</th> {/* Título actualizado */}
              <th>Comentario IA</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.length === 0 ? (
              <tr><td colSpan="9" className="vlc-sol-empty">No hay solicitudes disponibles</td></tr>
            ) : (
              solicitudes.map((s) => {
                const esAsignado = s.estado === 'asignado';
                
                // Buscar la opción seleccionada usando el ID único
                const opcionSeleccionada = s.predicciones?.find(
                  (p) => p.id_unico === s.selectedUniqueId
                );
                
                const comentarioTexto = esAsignado ? s.comentario_ia_asignado : (opcionSeleccionada?.comentario || 'Sin comentario');

                return (
                  <tr key={s.id}>
                    <td><strong>#{s.id}</strong></td>
                    <td>{s.cliente_nombre || 'N/A'}</td>
                    <td>
                      <div className="vlc-sol-route">
                        <span>{s.origen}</span>
                        <span className="vlc-sol-arrow">→</span>
                        <span>{s.destino}</span>
                      </div>
                    </td>
                    <td>
                      <div className="vlc-sol-details">
                        <small>{s.tipo_vehiculo || '-'}</small>
                        <span>{s.tipo_carga}</span>
                      </div>
                    </td>
                    <td>{s.fecha_solicitud}</td>
                    <td>
                      <span className={`vlc-sol-tag ${s.estado}`}>
                        {s.estado}
                      </span>
                    </td>
                    
                    {/* COLUMNA DEL SELECTOR CORREGIDA */}
                    <td className="vlc-sol-col-select">
                      {esAsignado && s.transportista_asignado_nombre ? (
                        <span className="vlc-sol-assigned-name">
                          {s.transportista_asignado_nombre}
                        </span>
                      ) : s.predicciones && s.predicciones.length > 0 ? (
                        <select
                          className="vlc-sol-select"
                          value={s.selectedUniqueId || ''} // Usamos id_unico
                          onChange={(e) => {
                            const nuevoUniqueId = e.target.value;
                            const nuevasSolicitudes = solicitudes.map((sol) => {
                              if (sol.id === s.id) return { ...sol, selectedUniqueId: nuevoUniqueId };
                              return sol;
                            });
                            setSolicitudes(nuevasSolicitudes);
                          }}
                        >
                          {s.predicciones.map((pred) => {
                            const tieneProb = typeof pred.probabilidad === 'number';
                            const porcentaje = tieneProb ? ` (${Math.round(pred.probabilidad * 100)}%)` : '';
                            // Mostramos Nombre + Vehículo para diferenciar
                            return (
                              <option key={pred.id_unico} value={pred.id_unico}>
                                {pred.transportista_nombre} - {pred.vehiculo_info} {porcentaje}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <span className="vlc-sol-none">Sin opciones</span>
                      )}
                    </td>

                    <td className="vlc-sol-comment-cell">
                      <div className={`vlc-sol-comment-box ${expandedId === s.id ? 'expanded' : ''}`}>
                        {comentarioTexto}
                      </div>
                      {comentarioTexto.length > 60 && (
                        <button className="vlc-sol-read-more" onClick={() => toggleExpand(s.id)}>
                          {expandedId === s.id ? 'Ver menos' : 'Ver más'}
                        </button>
                      )}
                    </td>
                    <td>
                      <div className="vlc-sol-actions">
                        <FaCheckCircle
                          className={`vlc-sol-icon-btn approve ${updatingId === s.id ? 'disabled' : ''}`}
                          onClick={() => updatingId !== s.id && cambiarEstado(s.id, 'asignado')}
                          title="Aprobar"
                        />
                        <FaTimesCircle
                          className={`vlc-sol-icon-btn reject ${updatingId === s.id ? 'disabled' : ''}`}
                          onClick={() => updatingId !== s.id && cambiarEstado(s.id, 'rechazado')}
                          title="Rechazar"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSolicitudes;