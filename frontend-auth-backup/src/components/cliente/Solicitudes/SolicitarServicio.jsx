import React, { useState } from 'react';
import { crearSolicitud } from '../../../Servicios/SolicitudServicio';
import './estilosSolicitudes.css';

const SolicitarServicio = ({ onClose }) => {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState('');
  const [tipoCarga, setTipoCarga] = useState('');
  const [fechaSolicitud, setFechaSolicitud] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      origen,
      destino,
      tipo_vehiculo: tipoVehiculo,
      tipo_carga: tipoCarga,
      fecha_solicitud: fechaSolicitud
    };

    try {
      await crearSolicitud(data, localStorage.getItem('authToken'));
      setSuccessMessage("Solicitud creada con éxito");
      setError(null);
      
      setOrigen('');
      setDestino('');
      setTipoVehiculo('');
      setTipoCarga('');
      setFechaSolicitud('');
    } catch (err) {
      setError("Error al crear solicitud");
      setSuccessMessage(null);
    }
  };

  return (
    <div className="form-overlay">
      <form onSubmit={handleSubmit} className="form-solicitar-servicio">
        <button
          type="button"
          className="btn-close-x"
          onClick={onClose}
          aria-label="Cerrar formulario"
        >
          &times;
        </button>

        <h2>Crear Solicitud de Transporte</h2>

        <label>Origen</label>
        <input
          type="text"
          value={origen}
          onChange={(e) => setOrigen(e.target.value)}
          required
          placeholder="Ciudad o dirección de origen"
        />

        <label>Destino</label>
        <input
          type="text"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          required
          placeholder="Ciudad o dirección de destino"
        />

        <label>Tipo de Vehículo</label>
        <select
          value={tipoVehiculo}
          onChange={(e) => setTipoVehiculo(e.target.value)}
          required
        >
          <option value="">Seleccione un vehículo</option>
          <option value="Volqueta">Volqueta</option>
          <option value="Camión">Camión</option>
          <option value="Trailer">Trailer</option>
          <option value="Furgón">Furgón</option>
          <option value="Otro">Otro</option>
        </select>

        <label>Tipo de Carga</label>
        <input
          type="text"
          value={tipoCarga}
          onChange={(e) => setTipoCarga(e.target.value)}
          required
          placeholder="Ejemplo: Mercancía general, material pétreo..."
        />

        <label>Fecha de Solicitud</label>
        <input
          type="date"
          value={fechaSolicitud}
          onChange={(e) => setFechaSolicitud(e.target.value)}
          required
        />

        {error && <p className="form-error">{error}</p>}
        {successMessage && <p className="form-success">{successMessage}</p>}

        <button type="submit" className="btn-primary btn-submit">
          Crear Solicitud
        </button>
      </form>
    </div>
  );
};

export default SolicitarServicio;