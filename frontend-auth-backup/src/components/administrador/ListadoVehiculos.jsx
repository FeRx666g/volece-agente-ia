import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './estilos/ListadoVehiculos.css';

export default function ListadoVehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [buscarPlaca, setBuscarPlaca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarVehiculos();
  }, [pagina]);

  const cargarVehiculos = () => {
    setLoading(true);
    axios.get(`http://localhost:8000/api/vehiculos/?page=${pagina}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`
      }
    })
    .then(res => {
      // Protegemos el acceso a res.data.results
      if (res.data && Array.isArray(res.data.results)) {
        setVehiculos(res.data.results);
        setTotalPaginas(Math.ceil(res.data.count / 10));
      } else {
        console.error("Respuesta inesperada de la API:", res.data);
        setVehiculos([]);
      }
    })
    .catch(err => {
      console.error('Error al cargar vehículos:', err);
      setVehiculos([]);
    })
    .finally(() => setLoading(false));
  };

  const handleEstadoChange = (vehiculoId, nuevoEstado) => {
    axios.patch(`http://localhost:8000/api/vehiculos/${vehiculoId}/`, 
      { estado: nuevoEstado }, 
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
      }
    )
    .then(() => cargarVehiculos())
    .catch(err => alert('Error al actualizar estado'));
  };

  // Protegemos el filter para evitar que vehiculos sea undefined
  const vehiculosFiltrados = (vehiculos ?? []).filter(v => {
    return (filtroTipo === '' || v.tipo === filtroTipo) &&
           (filtroEstado === '' || v.estado === filtroEstado) &&
           (buscarPlaca === '' || v.placa.toLowerCase().includes(buscarPlaca.toLowerCase()));
  });

  return (
    <div className="contenedor">
      <h2 className="titulo">Listado de Vehículos</h2>

      <div className="filtros">
        <div>
          <label>Buscar por Placa:</label><br />
          <input type="text" value={buscarPlaca} onChange={(e) => setBuscarPlaca(e.target.value)} placeholder="Ej: ABC-0123" />
        </div>

        <div>
          <label>Filtrar por Tipo:</label><br />
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="VOLQUETA">Volqueta</option>
            <option value="CAMION">Camión</option>
            <option value="TRAILER">Trailer</option>
            <option value="FURGON">Furgón</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        <div>
          <label>Filtrar por Estado:</label><br />
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Cargando vehículos...</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Transportista</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {vehiculosFiltrados.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hay vehículos para mostrar</td></tr>
            ) : (
              vehiculosFiltrados.map(vehiculo => (
                <tr key={vehiculo.id}>
                  <td>{vehiculo.placa}</td>
                  <td>{vehiculo.tipo}</td>
                  <td>{vehiculo.marca}</td>
                  <td>{vehiculo.modelo}</td>
                  <td>
                    {vehiculo.transportista_detalle
                      ? `${vehiculo.transportista_detalle.first_name} ${vehiculo.transportista_detalle.last_name}`
                      : 'No asignado'}
                  </td>
                  <td>
                    <select
                      value={vehiculo.estado}
                      onChange={(e) => handleEstadoChange(vehiculo.id, e.target.value)}
                    >
                      <option value="ACTIVO">Activo</option>
                      <option value="INACTIVO">Inactivo</option>
                      <option value="MANTENIMIENTO">Mantenimiento</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <div className="paginacion">
        <button disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>Anterior</button>
        <span>Página {pagina} de {totalPaginas}</span>
        <button disabled={pagina === totalPaginas} onClick={() => setPagina(pagina + 1)}>Siguiente</button>
      </div>
    </div>
  );
}
