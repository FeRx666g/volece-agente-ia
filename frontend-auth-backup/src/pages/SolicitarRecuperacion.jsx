import { useState } from 'react';
import axios from 'axios';
import './Auth.css'; 

export default function SolicitarRecuperacion() {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/usuarios/recuperar-password/', {
        email
      });

      setMensaje(response.data.message || 'Revisa tu correo para restablecer la contraseña.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'No se pudo enviar el correo.');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h2>Recuperar Contraseña</h2>
        <input
          type="email"
          placeholder="Ingresa tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {mensaje && <p className="auth-success">{mensaje}</p>}
        {error && <p className="auth-error">{error}</p>}
        <button type="submit">Enviar enlace</button>
        <p className="auth-link">
        ¿Ya recordaste tu contraseña?{' '}
        <span className="auth-link-action" onClick={() => window.location.href = '/login'}>
            Inicia sesión aquí
        </span>
        </p>
      </form>
    </div>
  );
}
