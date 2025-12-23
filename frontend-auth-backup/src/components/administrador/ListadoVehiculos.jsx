import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './estilos/ListadoVehiculos.css';

export default function ListadoVehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [transportistas, setTransportistas] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [buscarPlaca, setBuscarPlaca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editData, setEditData] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);

  useEffect(() => {
    cargarTransportistas();
  }, []);

  useEffect(() => {
    cargarVehiculos();
  }, [pagina]);

  const cargarVehiculos = () => {
    setLoading(true);
    axios.get(`http://localhost:8000/api/vehiculos/?page=${pagina}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(res => {
      if (res.data && Array.isArray(res.data.results)) {
        setVehiculos(res.data.results);
        setTotalPaginas(Math.ceil(res.data.count / 10));
      } else {
        setVehiculos([]);
      }
    })
    .catch(() => setVehiculos([]))
    .finally(() => setLoading(false));
  };

  const cargarTransportistas = () => {
    axios.get('http://localhost:8000/api/usuarios/transportistas/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(res => {
      if (Array.isArray(res.data)) {
        setTransportistas(res.data);
      } else if (res.data && Array.isArray(res.data.results)) {
        setTransportistas(res.data.results);
      } else {
        setTransportistas([]);
      }
    })
    .catch(() => setTransportistas([]));
  };

  const handleEstadoChange = (vehiculoId, nuevoEstado) => {
    axios.patch(`http://localhost:8000/api/vehiculos/${vehiculoId}/`, 
      { estado: nuevoEstado }, 
      { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } }
    )
    .then(() => cargarVehiculos())
    .catch(() => alert('Error al actualizar estado'));
  };

  const abrirModalEditar = (vehiculo) => {
    const transportistaId = vehiculo.transportista || vehiculo.transportista_detalle?.id || '';
    setEditData({
      id: vehiculo.id,
      transportista: transportistaId,
      tipo: vehiculo.tipo,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      placa: vehiculo.placa,
      anio: vehiculo.anio,
      color: vehiculo.color,
      tonelaje: vehiculo.tonelaje,
      combustible: vehiculo.combustible,
      numero_motor: vehiculo.numero_motor || '',
      numero_chasis: vehiculo.numero_chasis || '',
      fecha_adquisicion: vehiculo.fecha_adquisicion || '',
      observaciones: vehiculo.observaciones || '',
      fotoActual: vehiculo.foto,
      nuevaFoto: null
    });
    setPreviewFoto(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditData(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditData(prev => ({ ...prev, nuevaFoto: file }));
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const guardarCambios = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('transportista', editData.transportista);
    formData.append('tipo', editData.tipo);
    formData.append('marca', editData.marca);
    formData.append('modelo', editData.modelo);
    formData.append('placa', editData.placa);
    formData.append('anio', editData.anio);
    formData.append('color', editData.color);
    formData.append('tonelaje', editData.tonelaje);
    formData.append('combustible', editData.combustible);
    formData.append('numero_motor', editData.numero_motor);
    formData.append('numero_chasis', editData.numero_chasis);
    formData.append('fecha_adquisicion', editData.fecha_adquisicion);
    formData.append('observaciones', editData.observaciones);

    if (editData.nuevaFoto) {
      formData.append('foto', editData.nuevaFoto);
    }

    axios.patch(`http://localhost:8000/api/vehiculos/${editData.id}/`, formData, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('access')}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(() => {
      alert('Vehículo actualizado correctamente');
      cerrarModal();
      cargarVehiculos();
    })
    .catch(() => {
      alert('Error al guardar cambios. Verifique los datos.');
    });
  };

  const vehiculosFiltrados = (vehiculos ?? []).filter(v => {
    return (filtroTipo === '' || v.tipo === filtroTipo) &&
           (filtroEstado === '' || v.estado === filtroEstado) &&
           (buscarPlaca === '' || v.placa.toLowerCase().includes(buscarPlaca.toLowerCase()));
  });

  return (
    <div className="vlc-vls-container">
      <div className="vlc-vls-header">
        <h2 className="vlc-vls-title">Gestión de Flota Vehicular</h2>
        <p>Monitoreo y administración del estado operativo de las unidades.</p>
      </div>

      <div className="vlc-vls-filters-bar">
        <div className="vlc-vls-filter-group">
          <label>Placa</label>
          <input type="text" value={buscarPlaca} onChange={(e) => setBuscarPlaca(e.target.value)} placeholder="Ej: ABC-1234" />
        </div>
        <div className="vlc-vls-filter-group">
            <label>Tipo</label>
             <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                <option value="">Todos</option>
                <option value="VOLQUETA">Volqueta</option>
                <option value="CAMION">Camión</option>
                <option value="TRAILER">Trailer</option>
                <option value="FURGON">Furgón</option>
                <option value="OTRO">Otro</option>
             </select>
        </div>
         <div className="vlc-vls-filter-group">
            <label>Estado</label>
             <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="">Todos</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
             </select>
        </div>
      </div>

      <div className="vlc-vls-table-wrapper">
        {loading ? (
          <div className="vlc-vls-loading">Actualizando registros...</div>
        ) : (
          <table className="vlc-vls-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Marca / Modelo</th>
                <th>Socio Transportista</th>
                <th>Estado Operativo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculosFiltrados.length === 0 ? (
                <tr><td colSpan="6" className="vlc-vls-empty">No se encontraron unidades</td></tr>
              ) : (
                vehiculosFiltrados.map(vehiculo => (
                  <tr key={vehiculo.id}>
                    <td className="vlc-vls-placa"><strong>{vehiculo.placa}</strong></td>
                    <td>{vehiculo.tipo}</td>
                    <td>
                      <div className="vlc-vls-model-info">
                        <span>{vehiculo.marca}</span>
                        <small>{vehiculo.modelo}</small>
                      </div>
                    </td>
                    <td>
                      <span className="vlc-vls-owner">
                        {vehiculo.transportista_detalle
                          ? `${vehiculo.transportista_detalle.first_name || vehiculo.transportista_detalle.nombre || ''} ${vehiculo.transportista_detalle.last_name || vehiculo.transportista_detalle.apellido || ''}`
                          : 'No asignado'}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`vlc-vls-status-select ${vehiculo.estado.toLowerCase()}`}
                        value={vehiculo.estado}
                        onChange={(e) => handleEstadoChange(vehiculo.id, e.target.value)}
                      >
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                        <option value="MANTENIMIENTO">Mantenimiento</option>
                      </select>
                    </td>
                    <td>
                        <button className="vlc-vls-btn-edit" onClick={() => abrirModalEditar(vehiculo)}>
                            Editar
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="vlc-vls-pagination">
        <button disabled={pagina === 1} onClick={() => setPagina(pagina - 1)} className="vlc-vls-page-btn">Anterior</button>
        <span className="vlc-vls-page-info">Página <strong>{pagina}</strong> de {totalPaginas}</span>
        <button disabled={pagina === totalPaginas} onClick={() => setPagina(pagina + 1)} className="vlc-vls-page-btn">Siguiente</button>
      </div>

      {modalAbierto && editData && (
        <div className="vlc-modal-overlay">
            <div className="vlc-modal-content">
                <div className="vlc-modal-header">
                    <h3>Editar Vehículo</h3>
                    <button onClick={cerrarModal} className="vlc-modal-close">&times;</button>
                </div>
                <form onSubmit={guardarCambios}>
                    <div className="vlc-modal-body">
                        <div className="vlc-modal-photo-section">
                            <div className="vlc-photo-preview">
                                {previewFoto ? (
                                    <img src={previewFoto} alt="Preview" />
                                ) : editData.fotoActual ? (
                                    <img src={`${editData.fotoActual}`} alt="Actual" />
                                ) : (
                                    <div className="vlc-no-photo">Sin Foto</div>
                                )}
                            </div>
                            <label className="vlc-file-upload">
                                Cambiar Foto
                                <input type="file" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>

                        <div className="vlc-modal-grid">
                            <div className="vlc-group full-width">
                                <label>Socio Transportista</label>
                                <select 
                                    name="transportista" 
                                    value={editData.transportista || ""} 
                                    onChange={handleEditChange} 
                                    required
                                >
                                    <option value="">Seleccione un socio...</option>
                                    {transportistas.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.nombre} {t.apellido}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <h4 className="vlc-modal-subtitle">Especificaciones Técnicas</h4>
                        <div className="vlc-modal-grid">
                            <div className="vlc-group">
                                <label>Tipo</label>
                                <select name="tipo" value={editData.tipo} onChange={handleEditChange}>
                                    <option value="VOLQUETA">Volqueta</option>
                                    <option value="CAMION">Camión</option>
                                    <option value="TRAILER">Trailer</option>
                                    <option value="FURGON">Furgón</option>
                                    <option value="OTRO">Otro</option>
                                </select>
                            </div>
                            <div className="vlc-group">
                                <label>Combustible</label>
                                <select name="combustible" value={editData.combustible} onChange={handleEditChange}>
                                    <option value="DIESEL">Diesel</option>
                                    <option value="GASOLINA">Gasolina</option>
                                    <option value="ELECTRICO">Eléctrico</option>
                                    <option value="HIBRIDO">Híbrido</option>
                                </select>
                            </div>
                            <div className="vlc-group">
                                <label>Marca</label>
                                <input type="text" name="marca" value={editData.marca} onChange={handleEditChange} required />
                            </div>
                            <div className="vlc-group">
                                <label>Modelo</label>
                                <input type="text" name="modelo" value={editData.modelo} onChange={handleEditChange} required />
                            </div>
                            <div className="vlc-group">
                                <label>Placa</label>
                                <input type="text" name="placa" value={editData.placa} onChange={handleEditChange} required />
                            </div>
                            <div className="vlc-group">
                                <label>Año</label>
                                <input type="number" name="anio" value={editData.anio} onChange={handleEditChange} required />
                            </div>
                            <div className="vlc-group">
                                <label>Color</label>
                                <input type="text" name="color" value={editData.color} onChange={handleEditChange} required />
                            </div>
                            <div className="vlc-group">
                                <label>Tonelaje (t)</label>
                                <input type="number" step="0.01" name="tonelaje" value={editData.tonelaje} onChange={handleEditChange} required />
                            </div>
                        </div>

                        <h4 className="vlc-modal-subtitle">Identificación y Detalles</h4>
                        <div className="vlc-modal-grid">
                            <div className="vlc-group">
                                <label>Nº Motor</label>
                                <input type="text" name="numero_motor" value={editData.numero_motor} onChange={handleEditChange} />
                            </div>
                            <div className="vlc-group">
                                <label>Nº Chasis</label>
                                <input type="text" name="numero_chasis" value={editData.numero_chasis} onChange={handleEditChange} />
                            </div>
                            <div className="vlc-group">
                                <label>Fecha Adquisición</label>
                                <input type="date" name="fecha_adquisicion" value={editData.fecha_adquisicion} onChange={handleEditChange} />
                            </div>
                        </div>
                        <div className="vlc-group full-width" style={{marginTop: '10px'}}>
                            <label>Observaciones</label>
                            <textarea 
                                name="observaciones" 
                                value={editData.observaciones} 
                                onChange={handleEditChange}
                                style={{width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '80px'}}
                            />
                        </div>

                    </div>
                    <div className="vlc-modal-footer">
                        <button type="button" onClick={cerrarModal} className="vlc-btn-cancel">Cancelar</button>
                        <button type="submit" className="vlc-btn-save">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}