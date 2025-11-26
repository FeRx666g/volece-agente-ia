import React, { useState } from 'react';
import './estilos/ReportesDashboar.css';

const initialFiltros = {
  usuarios: { texto: '', fechaDesde: '', fechaHasta: '' },
  solicitudes: { texto: '', fechaDesde: '', fechaHasta: '', estado: '' },
  vehiculos: { texto: '', fechaDesde: '', fechaHasta: '', estado: '' },
};

const initialPreviewState = {
  usuarios: { data: [], total: null, loading: false, error: null },
  solicitudes: { data: [], total: null, loading: false, error: null },
  vehiculos: { data: [], total: null, loading: false, error: null },
};

const ReportesDashboard = () => {
  const [filtros, setFiltros] = useState(initialFiltros);
  const [previews, setPreviews] = useState(initialPreviewState);

  const reportes = [
    {
      id: 'usuarios',
      titulo: 'Reporte de Usuarios',
      icono: '👤',
      pdfEndpoint: 'http://127.0.0.1:8000/api/reportes/usuarios/pdf/',
      previewEndpoint: 'http://127.0.0.1:8000/api/reportes/usuarios/preview/',
    },
    {
      id: 'solicitudes',
      titulo: 'Reporte de Solicitudes',
      icono: '📄',
      pdfEndpoint: 'http://127.0.0.1:8000/api/reportes/solicitudes/pdf/',
      previewEndpoint: 'http://127.0.0.1:8000/api/reportes/solicitudes/preview/',
    },
    {
      id: 'vehiculos',
      titulo: 'Reporte de Vehículos',
      icono: '🚚',
      pdfEndpoint: 'http://127.0.0.1:8000/api/reportes/vehiculos/pdf/',
      previewEndpoint: 'http://127.0.0.1:8000/api/reportes/vehiculos/preview/',
    },
  ];

  const handleChange = (tipo, e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [tipo]: { ...prev[tipo], [name]: value },
    }));
  };

  const handleLimpiar = (tipo) => {
    setFiltros((prev) => ({ ...prev, [tipo]: initialFiltros[tipo] }));
    setPreviews((prev) => ({
      ...prev,
      [tipo]: { data: [], total: null, loading: false, error: null },
    }));
  };

  const buildUrlWithFilters = (baseUrl, tipo) => {
    const params = new URLSearchParams();
    const f = filtros[tipo];

    if (f.texto) params.append('search', f.texto);
    if (f.fechaDesde) params.append('fecha_desde', f.fechaDesde);
    if (f.fechaHasta) params.append('fecha_hasta', f.fechaHasta);
    if (f.estado) params.append('estado', f.estado); // solo aplica donde exista

    const query = params.toString();
    return query ? `${baseUrl}?${query}` : baseUrl;
  };

  const handlePreview = async (reporte) => {
    const { id, previewEndpoint } = reporte;
    const url = buildUrlWithFilters(previewEndpoint, id);

    setPreviews((prev) => ({
      ...prev,
      [id]: { ...prev[id], loading: true, error: null },
    }));

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al obtener la vista previa');
      const json = await res.json(); // { total, data }

      setPreviews((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          data: json.data || [],
          total: typeof json.total === 'number' ? json.total : (json.data || []).length,
          loading: false,
          error: null,
        },
      }));
    } catch (err) {
      setPreviews((prev) => ({
        ...prev,
        [id]: { ...prev[id], loading: false, error: err.message, data: [], total: 0 },
      }));
    }
  };

  const handleDescargar = (reporte) => {
    const { id, pdfEndpoint } = reporte;

    // Si ya hay preview y no hay resultados, no descargamos nada
    if (previews[id].total === 0) {
      alert('No hay resultados para los filtros seleccionados.');
      return;
    }

    const urlConFiltros = buildUrlWithFilters(pdfEndpoint, id);
    window.open(urlConFiltros, '_blank');
  };

  return (
    <div className="reportes-container">
      <h1>Reportes del Sistema</h1>

      <div className="card-grid">
        {reportes.map((reporte) => {
          const prev = previews[reporte.id];

          return (
            <div className="reporte-card" key={reporte.id}>
              <span className="icon">{reporte.icono}</span>
              <h3>{reporte.titulo}</h3>

              {/* FILTROS */}
              <details className="reporte-filtros">
                <summary>Filtros</summary>

                <div className="filtro-item">
                  <label>Buscar</label>
                  <input
                    type="text"
                    name="texto"
                    value={filtros[reporte.id].texto}
                    onChange={(e) => handleChange(reporte.id, e)}
                    placeholder={
                      reporte.id === 'usuarios'
                        ? 'Nombre, cédula, correo...'
                        : reporte.id === 'solicitudes'
                        ? 'Origen, destino, cliente...'
                        : 'Placa, marca, transportista...'
                    }
                  />
                </div>

                <div className="filtro-item">
                  <label>Fecha desde</label>
                  <input
                    type="date"
                    name="fechaDesde"
                    value={filtros[reporte.id].fechaDesde}
                    onChange={(e) => handleChange(reporte.id, e)}
                  />
                </div>

                <div className="filtro-item">
                  <label>Fecha hasta</label>
                  <input
                    type="date"
                    name="fechaHasta"
                    value={filtros[reporte.id].fechaHasta}
                    onChange={(e) => handleChange(reporte.id, e)}
                  />
                </div>

                {(reporte.id === 'solicitudes' || reporte.id === 'vehiculos') && (
                  <div className="filtro-item">
                    <label>Estado</label>
                    <select
                      name="estado"
                      value={filtros[reporte.id].estado}
                      onChange={(e) => handleChange(reporte.id, e)}
                    >
                      <option value="">Todos</option>

                      {reporte.id === 'solicitudes' && (
                        <>
                          <option value="pendiente">Pendiente</option>
                          <option value="asignado">Asignado</option>
                          <option value="completado">Completado</option>
                          <option value="rechazado">Rechazado</option>
                        </>
                      )}

                      {reporte.id === 'vehiculos' && (
                        <>
                          <option value="ACTIVO">Activo</option>
                          <option value="INACTIVO">Inactivo</option>
                          <option value="MANTENIMIENTO">En mantenimiento</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                <div className="filtros-actions">
                  <button
                    type="button"
                    onClick={() => handleLimpiar(reporte.id)}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </details>

              {/* BOTONES ACCIÓN */}
              <div className="reporte-actions">
                <button
                  type="button"
                  className="btn-secundario"
                  onClick={() => handlePreview(reporte)}
                >
                  Ver vista previa
                </button>

                <button
                  type="button"
                  className="btn-principal"
                  onClick={() => handleDescargar(reporte)}
                  disabled={prev.total === 0}
                  title={
                    prev.total === 0 && prev.total !== null
                      ? 'No hay resultados para descargar'
                      : 'Descargar PDF'
                  }
                >
                  Descargar PDF
                </button>
              </div>

              {/* VISTA PREVIA */}
              <div className="preview-container">
                {prev.loading && <p className="preview-info">Cargando vista previa...</p>}
                {prev.error && <p className="preview-error">{prev.error}</p>}

                {prev.total !== null && !prev.loading && !prev.error && (
                  <>
                    <p className="preview-info">
                      {prev.total === 0
                        ? 'No se encontraron resultados para estos filtros.'
                        : `Se encontraron ${prev.total} resultado(s). Mostrando los primeros:`}
                    </p>

                    {prev.total > 0 && (
                      <table className="preview-table">
                        <thead>
                          {reporte.id === 'usuarios' && (
                            <tr>
                              <th>Nombre</th>
                              <th>Cédula</th>
                              <th>Correo</th>
                            </tr>
                          )}
                          {reporte.id === 'solicitudes' && (
                            <tr>
                              <th>Cliente</th>
                              <th>Origen</th>
                              <th>Destino</th>
                              <th>Estado</th>
                            </tr>
                          )}
                          {reporte.id === 'vehiculos' && (
                            <tr>
                              <th>Placa</th>
                              <th>Vehículo</th>
                              <th>Transportista</th>
                              <th>Estado</th>
                            </tr>
                          )}
                        </thead>
                        <tbody>
                          {prev.data.slice(0, 5).map((item, idx) => {
                            if (reporte.id === 'usuarios') {
                              return (
                                <tr key={idx}>
                                  <td>{item.nombre}</td>
                                  <td>{item.cedula}</td>
                                  <td>{item.email}</td>
                                </tr>
                              );
                            }
                            if (reporte.id === 'solicitudes') {
                              return (
                                <tr key={idx}>
                                  <td>{item.cliente}</td>
                                  <td>{item.origen}</td>
                                  <td>{item.destino}</td>
                                  <td>{item.estado}</td>
                                </tr>
                              );
                            }
                            if (reporte.id === 'vehiculos') {
                              return (
                                <tr key={idx}>
                                  <td>{item.placa}</td>
                                  <td>{item.vehiculo}</td>
                                  <td>{item.transportista}</td>
                                  <td>{item.estado}</td>
                                </tr>
                              );
                            }
                            return null;
                          })}
                        </tbody>
                      </table>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportesDashboard;
