import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './estilos/RegistroVehiculo.css';

export default function RegistroVehiculo() {
  const [transportistas, setTransportistas] = useState([]);
  const [formData, setFormData] = useState({
    transportista: '', tipo: 'VOLQUETA', marca: '', modelo: '',
    placa: '', anio: '', color: '', tonelaje: '', combustible: 'DIESEL',
    numero_motor: '', numero_chasis: '', fecha_adquisicion: '',
    observaciones: '', estado: 'ACTIVO',
    foto: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get('http://localhost:8000/api/usuarios/transportistas/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(res => setTransportistas(res.data))
    .catch(err => console.error(err));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, foto: file }));
  };

  const validarCampos = () => {
    const nuevosErrores = {};
    const anioActual = new Date().getFullYear();
    const anio = parseInt(formData.anio);
    const tonelaje = parseFloat(formData.tonelaje);

    if (!formData.transportista) nuevosErrores.transportista = "Seleccione un socio";
    if (!formData.marca) nuevosErrores.marca = "Ingrese la marca";
    if (!formData.modelo) nuevosErrores.modelo = "Ingrese el modelo";
    if (!formData.placa) nuevosErrores.placa = "Ingrese la placa";
    if (!formData.color) nuevosErrores.color = "Ingrese el color";

    if (isNaN(anio) || anio < 1990 || anio > anioActual)
      nuevosErrores.anio = `Rango válido: 1990 - ${anioActual}`;

    if (isNaN(tonelaje) || tonelaje <= 3.5 || tonelaje > 50)
      nuevosErrores.tonelaje = "Debe estar entre 3.5 y 50 t";

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validarCampos()) return;

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'foto') {
        dataToSend.append(key, formData[key]);
      }
    });

    if (formData.foto) {
      dataToSend.append('foto', formData.foto);
    }

    axios.post('http://localhost:8000/api/vehiculos/', dataToSend, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('access')}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(() => {
      alert('Vehículo registrado exitosamente');
      setFormData({
        transportista: '', tipo: 'VOLQUETA', marca: '', modelo: '',
        placa: '', anio: '', color: '', tonelaje: '', combustible: 'DIESEL',
        numero_motor: '', numero_chasis: '', fecha_adquisicion: '',
        observaciones: '', estado: 'ACTIVO',
        foto: null
      });
      setErrors({});
    })
    .catch(() => alert('Error al registrar el vehículo'));
  };

  return (
    <div className="vlc-reg-container">
      <div className="vlc-reg-card">
        <div className="vlc-reg-header">
          <h2>Registro de Nueva Unidad</h2>
          <p>Ingrese los datos detallados del vehículo para integrarlo a la flota.</p>
        </div>

        <form className="vlc-reg-form" onSubmit={handleSubmit}>
          
          <div className="vlc-reg-section">
            <h3><span className="vlc-reg-step">1</span> Información de Propiedad</h3>
            <div className="vlc-reg-grid">
              <div className="vlc-reg-group full">
                <label>Socio Transportista</label>
                <select name="transportista" value={formData.transportista} onChange={handleChange} required>
                  <option value="">Seleccione un transportista...</option>
                  {transportistas.map(trans => (
                    <option key={trans.id} value={trans.id}>
                      {trans.nombre} {trans.apellido}
                    </option>
                  ))}
                </select>
                {errors.transportista && <span className="vlc-reg-error">{errors.transportista}</span>}
              </div>
            </div>
          </div>

          <div className="vlc-reg-section">
            <h3><span className="vlc-reg-step">2</span> Especificaciones Técnicas</h3>
            <div className="vlc-reg-grid">
              <div className="vlc-reg-group">
                <label>Tipo de Vehículo</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                  <option value="VOLQUETA">Volqueta</option>
                  <option value="CAMION">Camión</option>
                  <option value="TRAILER">Trailer</option>
                  <option value="FURGON">Furgón</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              <div className="vlc-reg-group">
                <label>Marca</label>
                <input type="text" name="marca" value={formData.marca} onChange={handleChange} required placeholder="Ej: Hino" />
                {errors.marca && <span className="vlc-reg-error">{errors.marca}</span>}
              </div>

              <div className="vlc-reg-group">
                <label>Modelo</label>
                <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} required placeholder="Ej: GH 500" />
                {errors.modelo && <span className="vlc-reg-error">{errors.modelo}</span>}
              </div>

              <div className="vlc-reg-group">
                <label>Placa</label>
                <input type="text" name="placa" value={formData.placa} onChange={handleChange} required placeholder="ABC-1234" />
                {errors.placa && <span className="vlc-reg-error">{errors.placa}</span>}
              </div>

              <div className="vlc-reg-group">
                <label>Año de Fabricación</label>
                <input type="number" name="anio" value={formData.anio} onChange={handleChange} required />
                {errors.anio && <span className="vlc-reg-error">{errors.anio}</span>}
              </div>

              <div className="vlc-reg-group">
                <label>Color</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} required />
                {errors.color && <span className="vlc-reg-error">{errors.color}</span>}
              </div>

              <div className="vlc-reg-group">
                <label>Tonelaje (t)</label>
                <input type="number" step="0.01" name="tonelaje" value={formData.tonelaje} onChange={handleChange} required />
                {errors.tonelaje && <span className="vlc-reg-error">{errors.tonelaje}</span>}
              </div>

              <div className="vlc-reg-group">
                <label>Tipo de Combustible</label>
                <select name="combustible" value={formData.combustible} onChange={handleChange} required>
                  <option value="DIESEL">Diesel</option>
                  <option value="GASOLINA">Gasolina</option>
                  <option value="ELECTRICO">Eléctrico</option>
                  <option value="HIBRIDO">Híbrido</option>
                </select>
              </div>

              <div className="vlc-reg-group full">
                 <label>Fotografía del Vehículo</label>
                 <input 
                    type="file" 
                    name="foto" 
                    accept="image/*"
                    onChange={handleFileChange} 
                 />
              </div>
            </div>
          </div>

          <div className="vlc-reg-section">
            <h3><span className="vlc-reg-step">3</span> Datos Identificativos y Adicionales</h3>
            <div className="vlc-reg-grid">
              <div className="vlc-reg-group">
                <label>Número de Motor</label>
                <input type="text" name="numero_motor" value={formData.numero_motor} onChange={handleChange} />
              </div>

              <div className="vlc-reg-group">
                <label>Número de Chasis</label>
                <input type="text" name="numero_chasis" value={formData.numero_chasis} onChange={handleChange} />
              </div>

              <div className="vlc-reg-group">
                <label>Fecha de Adquisición</label>
                <input type="date" name="fecha_adquisicion" value={formData.fecha_adquisicion} onChange={handleChange} />
              </div>

              <div className="vlc-reg-group full">
                <label>Observaciones</label>
                <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} placeholder="Detalles adicionales sobre el estado o equipamiento..." />
              </div>
            </div>
          </div>

          <button type="submit" className="vlc-reg-submit">Finalizar Registro</button>
        </form>
      </div>
    </div>
  );
}