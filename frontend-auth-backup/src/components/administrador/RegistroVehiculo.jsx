import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './estilos/RegistroVehiculo.css';

export default function RegistroVehiculo() {
  const [transportistas, setTransportistas] = useState([]);
  const [formData, setFormData] = useState({
    transportista: '',
    tipo: 'VOLQUETA',
    marca: '',
    modelo: '',
    placa: '',
    anio: '',
    color: '',
    tonelaje: '',
    combustible: 'DIESEL',
    numero_motor: '',
    numero_chasis: '',
    fecha_adquisicion: '',
    observaciones: '',
    estado: 'ACTIVO',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get('http://localhost:8000/api/usuarios/transportistas/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(res => setTransportistas(res.data))
    .catch(err => console.error('Error al cargar transportistas:', err));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validarCampos = () => {
    const nuevosErrores = {};
    const anioActual = new Date().getFullYear();
    const anio = parseInt(formData.anio);
    const tonelaje = parseFloat(formData.tonelaje);

    if (!formData.transportista) nuevosErrores.transportista = "Seleccione un transportista";
    if (!formData.marca) nuevosErrores.marca = "Ingrese la marca";
    if (!formData.modelo) nuevosErrores.modelo = "Ingrese el modelo";
    if (!formData.placa) nuevosErrores.placa = "Ingrese la placa";
    if (!formData.color) nuevosErrores.color = "Ingrese el color";

    if (isNaN(anio) || anio < 1990 || anio > anioActual)
      nuevosErrores.anio = `El año debe estar entre 1990 y ${anioActual}`;

    if (isNaN(tonelaje) || tonelaje <= 3.5 || tonelaje > 50)
      nuevosErrores.tonelaje = "El tonelaje debe ser mayor a 3.5 y menor o igual a 50 toneladas";

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!validarCampos()) return;

    axios.post('http://localhost:8000/api/vehiculos/', formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(() => {
      alert('Vehículo registrado exitosamente');
      setFormData({
        transportista: '', tipo: 'VOLQUETA', marca: '', modelo: '',
        placa: '', anio: '', color: '', tonelaje: '', combustible: 'DIESEL',
        numero_motor: '', numero_chasis: '', fecha_adquisicion: '',
        observaciones: '', estado: 'ACTIVO'
      });
      setErrors({});
    })
    .catch(() => alert('Error al registrar el vehículo'));
  };

  return (
    <div className="registro-container">
      <h2>Registro de Vehículo</h2>
      <form className="registro-form" onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Transportista:</label>
          <select name="transportista" value={formData.transportista} onChange={handleChange} required>
            <option value="">Seleccione un transportista</option>
            {transportistas.map(trans => (
              <option key={trans.id} value={trans.id}>
                {trans.nombre} {trans.apellido}
              </option>
            ))}
          </select>
          {errors.transportista && <span className="error">{errors.transportista}</span>}
        </div>

        <div className="form-group">
          <label>Tipo de Vehículo:</label>
          <select name="tipo" value={formData.tipo} onChange={handleChange} required>
            <option value="VOLQUETA">Volqueta</option>
            <option value="CAMION">Camión</option>
            <option value="TRAILER">Trailer</option>
            <option value="FURGON">Furgón</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Marca:</label>
            <input type="text" name="marca" value={formData.marca} onChange={handleChange} required />
            {errors.marca && <span className="error">{errors.marca}</span>}
          </div>

          <div className="form-group">
            <label>Modelo:</label>
            <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} required />
            {errors.modelo && <span className="error">{errors.modelo}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Placa:</label>
            <input type="text" name="placa" value={formData.placa} onChange={handleChange} required />
            {errors.placa && <span className="error">{errors.placa}</span>}
          </div>

          <div className="form-group">
            <label>Año:</label>
            <input type="number" name="anio" value={formData.anio} onChange={handleChange} required />
            {errors.anio && <span className="error">{errors.anio}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Color:</label>
            <input type="text" name="color" value={formData.color} onChange={handleChange} required />
            {errors.color && <span className="error">{errors.color}</span>}
          </div>

          <div className="form-group">
            <label>Tonelaje (t):</label>
            <input type="number" step="0.01" name="tonelaje" value={formData.tonelaje} onChange={handleChange} required />
            {errors.tonelaje && <span className="error">{errors.tonelaje}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Número de Motor:</label>
            <input type="text" name="numero_motor" value={formData.numero_motor} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Número de Chasis:</label>
            <input type="text" name="numero_chasis" value={formData.numero_chasis} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label>Fecha de Adquisición:</label>
          <input type="date" name="fecha_adquisicion" value={formData.fecha_adquisicion} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Observaciones:</label>
          <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Combustible:</label>
          <select name="combustible" value={formData.combustible} onChange={handleChange} required>
            <option value="DIESEL">Diesel</option>
            <option value="GASOLINA">Gasolina</option>
            <option value="ELECTRICO">Eléctrico</option>
            <option value="HIBRIDO">Híbrido</option>
          </select>
        </div>

        <button type="submit" className="btn-registrar">Registrar Vehículo</button>
      </form>
    </div>
  );
}
