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
      console.error(err);
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
              selectedTransportistaId: null,
            };
          }

          let mejor = null;
          let listaCompletaN8N = null;

          try {
            const resIA = await axios.post(
              API_ASIGNAR_TURNO_URL,
              { id_solicitud: solicitud.id },
              { headers }
            );

            mejor = resIA.data?.mejor_transportista || null;
            listaCompletaN8N = resIA.data?.lista_completa || null;
          } catch (e) {
            console.error(
              `Error al obtener sugerencia IA para solicitud ${solicitud.id}:`,
              e
            );
          }

          let predicciones = [];

          if (listaCompletaN8N && listaCompletaN8N.length > 0) {
            const ordenada = [...listaCompletaN8N].sort(
              (a, b) => (b.probabilidad || 0) - (a.probabilidad || 0)
            );

            predicciones = ordenada.map((t) => ({
              transportista_id: t.transportista_id,
              transportista_nombre: t.transportista_nombre,
              probabilidad: t.probabilidad ?? null,
              comentario: t.comentario_ia || 'Comentario no disponible',
              esIA: mejor && t.transportista_id === mejor.transportista_id,
            }));
          } else if (mejor) {
            predicciones = [
              {
                transportista_id: mejor.transportista_id,
                transportista_nombre: mejor.transportista_nombre,
                probabilidad: mejor.probabilidad,
                comentario: 'Recomendación de IA para este transportista.',
                esIA: true,
              },
              ...transportistas
                .filter((t) => t.id !== mejor.transportista_id)
                .map((t) => ({
                  transportista_id: t.id,
                  transportista_nombre: `${t.nombre} ${t.apellido}`,
                  probabilidad: null,
                  comentario: 'Comentario no disponible',
                  esIA: false,
                })),
            ];
          } else {
            predicciones = transportistas.map((t) => ({
              transportista_id: t.id,
              transportista_nombre: `${t.nombre} ${t.apellido}`,
              probabilidad: null,
              comentario: 'Comentario no disponible',
              esIA: false,
            }));
          }

          const selectedTransportistaId =
            predicciones.length > 0 ? predicciones[0].transportista_id : null;

          return {
            ...solicitud,
            predicciones,
            selectedTransportistaId,
          };
        })
      );

      return solicitudesConPred;
    } catch (error) {
      console.error('Error al obtener transportistas o predicciones IA:', error);
      return listaSolicitudes.map((s) => ({
        ...s,
        predicciones: [],
        selectedTransportistaId: null,
      }));
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    const token = localStorage.getItem('access');
    if (!token) {
      setError('No estás autenticado');
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    setUpdatingId(id);
    try {
      const solicitud = solicitudes.find((s) => s.id === id);
      if (!solicitud) {
        throw new Error('Solicitud no encontrada en el estado local');
      }

      let transportistaId = solicitud?.selectedTransportistaId || null;

      if (!transportistaId && solicitud.transportista_asignado_id) {
        transportistaId = solicitud.transportista_asignado_id;
      }

      if (!transportistaId && solicitud?.predicciones?.length > 0) {
        transportistaId = solicitud.predicciones[0].transportista_id;
      }

      let comentarioIASeleccionado = null;
      if (
        nuevoEstado === 'asignado' &&
        solicitud?.predicciones?.length > 0 &&
        transportistaId
      ) {
        const predSel = solicitud.predicciones.find(
          (p) => p.transportista_id === transportistaId
        );
        comentarioIASeleccionado = predSel?.comentario || null;
      }

      if (['asignado', 'rechazado'].includes(nuevoEstado)) {
        const payloadTurno = {
          solicitud_id: id,
          transportista_id: transportistaId,
          nuevo_estado: nuevoEstado,
          ...(nuevoEstado === 'asignado' && { comentario_ia: comentarioIASeleccionado }),
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
      console.error(err);
      setError('Error al actualizar estado');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  return (
    <div className="admin-solicitudes-container" >
      <h2>Solicitudes - Administrador</h2>
      {loading && <p>Cargando solicitudes...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table className="solicitudes-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Tipo de carga</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Transportista</th>
            <th>Comentario IA</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.length === 0 ? (
            <tr>
              <td colSpan="10" className="td-centered">No hay solicitudes</td>
            </tr>
          ) : (
            solicitudes.map((s) => {
              const esAsignado = s.estado === 'asignado';

              const opcionSeleccionada = s.predicciones?.find(
                (p) => p.transportista_id === s.selectedTransportistaId
              );

              const infoMostrar = opcionSeleccionada || (s.predicciones && s.predicciones[0]);

              return (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.cliente_nombre_completo || 'N/A'}</td>
                  <td>{s.origen}</td>
                  <td>{s.destino}</td>
                  <td>{s.tipo_carga}</td>
                  <td>{s.fecha_solicitud}</td>
                  <td>{s.estado}</td>

                  {/* ==== COLUMNA TRANSPORTISTA ==== */}
                  <td>
                    {esAsignado && s.transportista_asignado_nombre ? (
                      <span>
                        {s.transportista_asignado_nombre} - Asignado
                      </span>
                    ) : s.predicciones && s.predicciones.length > 0 ? (
                      <select
                        value={s.selectedTransportistaId || ''}
                        onChange={(e) => {
                          const nuevoId = e.target.value ? parseInt(e.target.value, 10) : null;
                          const nuevasSolicitudes = solicitudes.map((sol) => {
                            if (sol.id === s.id) {
                              return { ...sol, selectedTransportistaId: nuevoId };
                            }
                            return sol;
                          });
                          setSolicitudes(nuevasSolicitudes);
                        }}
                      >
                        {s.predicciones.map((pred, index) => {
                          const tieneProb =
                            typeof pred.probabilidad === 'number' && !isNaN(pred.probabilidad);

                          const porcentajeTexto = tieneProb
                            ? `${Math.round(pred.probabilidad * 100)}%`
                            : null;

                          let label = pred.transportista_nombre;

                          if (porcentajeTexto) {
                            label = `${label} (${porcentajeTexto})`;
                          }

                          if (pred.esIA) {
                            label = `${label}`;
                          }

                          return (
                            <option key={index} value={pred.transportista_id}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      'Sin opciones'
                    )}
                  </td>

                  {/* ==== COLUMNA COMENTARIO ==== */}
                  <td className="cell-comment">
                    {esAsignado && s.comentario_ia_asignado ? (
                      <div title={s.comentario_ia_asignado}>
                        {s.comentario_ia_asignado}
                      </div>
                    ) : (
                      <div title={infoMostrar?.comentario || 'Comentario no disponible'}>
                        {infoMostrar?.comentario || 'Comentario no disponible'}
                      </div>
                    )}
                  </td>

                  <td className="actions-cell">
                    <FaCheckCircle
                      className={`actions-icon ${updatingId === s.id ? 'disabled' : ''}`}
                      color="green"
                      onClick={() => updatingId !== s.id && cambiarEstado(s.id, 'asignado')}
                      title="Aprobar"
                    />
                    <FaTimesCircle
                      className={`actions-icon ${updatingId === s.id ? 'disabled' : ''}`}
                      color="red"
                      onClick={() => updatingId !== s.id && cambiarEstado(s.id, 'rechazado')}
                      title="Rechazar"
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminSolicitudes;
