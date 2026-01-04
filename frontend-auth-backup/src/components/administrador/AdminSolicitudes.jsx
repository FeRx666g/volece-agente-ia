import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './estilos/AdminSolicitudes.css';

const API_SERVICIOS_URL = 'http://127.0.0.1:8000/api/servicios/';
const API_USUARIOS_URL = 'http://127.0.0.1:8000/api/usuarios/';
const API_ASIGNAR_TURNO_URL = `${API_SERVICIOS_URL}asignar-turno/`;
const API_CREAR_TURNO_URL = `${API_SERVICIOS_URL}solicitudes/crear-turno/`;

const ITEMS_PER_PAGE = 5;

const AdminSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const generarTodasLasRecomendaciones = async () => {
    const pendientes = solicitudes.filter(s => s.estado === 'pendiente');

    if (pendientes.length === 0) {
      alert("No hay solicitudes pendientes para generar recomendaciones.");
      return;
    }

    if (!window.confirm(`Se generarán recomendaciones para ${pendientes.length} solicitudes. Esto puede tardar unos segundos. ¿Continuar?`)) {
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('access');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await Promise.all(pendientes.map(async (s) => {
        try {
          await axios.post(
            API_ASIGNAR_TURNO_URL,
            {
              id_solicitud: s.id,
              tipo_vehiculo: s.tipo_vehiculo
            },
            { headers }
          );
        } catch (error) {
        }
      }));

      await fetchSolicitudes();
      alert("Recomendaciones actualizadas correctamente.");

    } catch (err) {
      setError("Error al regenerar recomendaciones masivas.");
    } finally {
      setLoading(false);
    }
  };

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

      const solicitudesProcesadas = await procesarSolicitudes(listaSolicitudes, headers);

      setSolicitudes(solicitudesProcesadas);
      setError(null);
    } catch (err) {
      setError('Error al cargar solicitudes');
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  const procesarSolicitudes = async (listaSolicitudes, headers) => {
    try {
      const resTransp = await axios.get(`${API_USUARIOS_URL}transportistas/`, { headers });
      const transportistas = resTransp.data;

      return listaSolicitudes.map((solicitud) => {
        if (solicitud.estado === 'asignado') {
          return {
            ...solicitud,
            predicciones: [],
            selectedUniqueId: null,
          };
        }

        let datosGuardados = solicitud.prediccion_data;

        if (datosGuardados && typeof datosGuardados === 'string') {
          try {
            datosGuardados = JSON.parse(datosGuardados);
          } catch (e) {
          }
        }

        let mejor = datosGuardados?.mejor_transportista || null;
        let listaCompletaN8N = datosGuardados?.lista_completa || null;

        let predicciones = [];

        if (listaCompletaN8N && listaCompletaN8N.length > 0) {
          const ordenada = [...listaCompletaN8N].sort(
            (a, b) => (b.probabilidad || 0) - (a.probabilidad || 0)
          );

          predicciones = ordenada.map((t, index) => {
            const vId = t.vehiculo_id || 'sin_vehiculo';
            const uniqueId = `${t.transportista_id}_${vId}_${index}`;

            return {
              id_unico: uniqueId,
              transportista_id: t.transportista_id,
              transportista_nombre: t.transportista_nombre,
              vehiculo_id: t.vehiculo_id || null,
              vehiculo_info: t.vehiculo_placa ? `${t.vehiculo_placa}` : 'Vehículo no especificado',
              probabilidad: t.probabilidad ?? null,
              comentario: t.comentario_ia || 'Comentario no disponible',
              esIA: mejor && t.transportista_id === mejor.transportista_id && t.vehiculo_id === mejor.vehiculo_id,
            };
          });
        } else if (mejor) {
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

        const selectedUniqueId = predicciones.length > 0 ? predicciones[0].id_unico : null;

        return {
          ...solicitud,
          predicciones,
          selectedUniqueId,
        };
      });

    } catch (error) {
      return listaSolicitudes.map((s) => ({
        ...s,
        predicciones: [],
        selectedUniqueId: null,
      }));
    }
  };

  const generarRecomendacionIndividual = async (solicitudId, tipoVehiculo) => {
    setUpdatingId(solicitudId);
    const token = localStorage.getItem('access');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.post(
        API_ASIGNAR_TURNO_URL,
        {
          id_solicitud: solicitudId,
          tipo_vehiculo: tipoVehiculo
        },
        { headers }
      );

      await fetchSolicitudes();

    } catch (error) {
      alert("Error generando recomendación");
    } finally {
      setUpdatingId(null);
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

      let prediccionSeleccionada = null;
      if (solicitud.selectedUniqueId && solicitud.predicciones) {
        prediccionSeleccionada = solicitud.predicciones.find(p => p.id_unico === solicitud.selectedUniqueId);
      }

      let transportistaId = prediccionSeleccionada?.transportista_id || solicitud.transportista_asignado_id;
      let vehiculoId = prediccionSeleccionada?.vehiculo_id || null;
      let comentarioIA = prediccionSeleccionada?.comentario || null;

      if (['asignado', 'rechazado'].includes(nuevoEstado)) {
        const payloadTurno = {
          solicitud_id: id,
          transportista_id: transportistaId,
          vehiculo_id: vehiculoId,
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
        <div>
          <h2>Gestión de Solicitudes</h2>
          <p>Administración y asignación de transporte</p>
        </div>
        <button
          className="vlc-sol-btn-global-gen"
          onClick={generarTodasLasRecomendaciones}
          disabled={loading}
          style={{
            backgroundColor: '#2563eb', color: 'white', padding: '10px 15px',
            borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600'
          }}
        >
          {loading ? 'Procesando...' : '↻ Regenerar Todas (IA)'}
        </button>
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
              <th>Asignación (Socio - Unidad)</th>
              <th>Comentario IA</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.length === 0 ? (
              <tr><td colSpan="9" className="vlc-sol-empty">No hay solicitudes disponibles</td></tr>
            ) : (
              solicitudes
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((s) => {
                  const esAsignado = s.estado === 'asignado';

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

                      <td className="vlc-sol-col-select">
                        {esAsignado && s.transportista_asignado_nombre ? (
                          <div className="vlc-sol-assigned-info" style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="vlc-sol-assigned-name" style={{ fontWeight: '700', color: '#1e293b' }}>
                              {s.transportista_asignado_nombre}
                            </span>
                            {s.vehiculo_asignado_placa && (
                              <span className="vlc-sol-assigned-plate" style={{ fontSize: '0.8rem', color: '#279200', fontWeight: '600' }}>
                                Unidad: {s.vehiculo_asignado_placa}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              {s.predicciones && s.predicciones.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                  <select
                                    className="vlc-sol-select"
                                    value={s.selectedUniqueId || ''}
                                    onChange={(e) => {
                                      const nuevoUniqueId = e.target.value;
                                      const nuevasSolicitudes = solicitudes.map((sol) => {
                                        if (sol.id === s.id) return { ...sol, selectedUniqueId: nuevoUniqueId };
                                        return sol;
                                      });
                                      setSolicitudes(nuevasSolicitudes);
                                    }}
                                    disabled={updatingId === s.id}
                                  >
                                    {s.predicciones.map((pred) => {
                                      const tieneProb = typeof pred.probabilidad === 'number';
                                      const porcentaje = tieneProb ? ` (${Math.round(pred.probabilidad * 100)}%)` : '';
                                      return (
                                        <option key={pred.id_unico} value={pred.id_unico}>
                                          {pred.transportista_nombre} - {pred.vehiculo_info} {porcentaje}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>
                              )}

                              <button
                                className="vlc-sol-btn-generate"
                                title={s.predicciones && s.predicciones.length > 0 ? "Regenerar recomendación" : "Generar recomendación"}
                                style={{
                                  backgroundColor: s.predicciones && s.predicciones.length > 0 ? '#facc15' : '#4f46e5',
                                  color: s.predicciones && s.predicciones.length > 0 ? 'black' : 'white',
                                  padding: '5px 8px',
                                  borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.8rem',
                                  whiteSpace: 'nowrap'
                                }}
                                onClick={() => generarRecomendacionIndividual(s.id, s.tipo_vehiculo)}
                                disabled={updatingId === s.id}
                              >
                                {updatingId === s.id ? '...' : (s.predicciones && s.predicciones.length > 0 ? '↻' : 'Generar')}
                              </button>
                            </div>
                          </div>
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

      {solicitudes.length > ITEMS_PER_PAGE && (
        <div className="vlc-sol-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>

          <span>Página {currentPage} de {Math.ceil(solicitudes.length / ITEMS_PER_PAGE)}</span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(solicitudes.length / ITEMS_PER_PAGE)))}
            disabled={currentPage === Math.ceil(solicitudes.length / ITEMS_PER_PAGE)}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSolicitudes;