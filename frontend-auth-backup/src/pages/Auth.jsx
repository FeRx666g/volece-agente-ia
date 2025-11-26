import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    cedula_ruc: '',
    password: '',
    rol: 'CLIENTE'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLoginChange = (e) => setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });

  const validarCedulaEcuatoriana = (cedula) => {
    if (!/^\d{10}$/.test(cedula)) return false;
    const digitos = cedula.split('').map(Number);
    const codigoProvincia = parseInt(cedula.substring(0, 2), 10);
    if (codigoProvincia < 1 || codigoProvincia > 24) return false;
    const digitoVerificador = digitos.pop();
    let suma = 0;

    for (let i = 0; i < digitos.length; i++) {
      let valor = digitos[i];
      if (i % 2 === 0) {
        valor *= 2;
        if (valor > 9) valor -= 9;
      }
      suma += valor;
    }

    const resultado = (10 - (suma % 10)) % 10;
    return resultado === digitoVerificador;
  };

  const esContrasenaRobusta = (password) => {
    const minLength = /.{8,}/;
    const mayuscula = /[A-Z]/;
    const minuscula = /[a-z]/;
    const numero = /[0-9]/;
    const especial = /[^A-Za-z0-9]/;

    return (
      minLength.test(password) &&
      mayuscula.test(password) &&
      minuscula.test(password) &&
      numero.test(password) &&
      especial.test(password)
    );
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/token/', loginForm);
      const { access, refresh } = response.data;
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      const perfilResponse = await axios.get('http://127.0.0.1:8000/api/usuarios/perfil/', {
        headers: { Authorization: `Bearer ${access}` }
      });
      const { rol } = perfilResponse.data;
      if (rol === 'ADMIN') navigate('/dashboard-admin');
      else if (rol === 'TRANSP') navigate('/transportista/dashboard');
      else navigate('/cliente/dashboard');
    } catch (err) {
      console.error(err.response?.data);
      setError('Nombre de usuario o contraseña incorrectos');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    const { username, first_name, last_name, email, cedula_ruc, password } = registerForm;

    if (!username || !first_name || !last_name || !email || !cedula_ruc || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (username.length < 4) {
      setError('El nombre de usuario debe tener al menos 4 caracteres.');
      return;
    }

    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
    if (!soloLetras.test(first_name) || !soloLetras.test(last_name)) {
      setError('El nombre y apellido solo deben contener letras.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('El correo electrónico no tiene un formato válido.');
      return;
    }

    if (!validarCedulaEcuatoriana(cedula_ruc)) {
      setError('La cédula ingresada no es válida.');
      return;
    }

    if (!esContrasenaRobusta(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial.');
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/usuarios/registro/', registerForm);
      setSuccess('Cuenta creada con éxito. Puedes iniciar sesión.');
      setLoginForm({
        username: registerForm.username,
        password: ''
      });
      setIsLogin(true);
    } catch (err) {
      console.error(err.response?.data);
      const errors = err.response?.data;
      if (typeof errors === 'object') {
        const messages = Object.entries(errors)
          .map(([key, val]) => `${key}: ${val}`)
          .join('\n');
        setError('Error al crear la cuenta:\n' + messages);
      } else {
        setError('Error al crear la cuenta: ' + (errors?.detail || 'verifica los datos'));
      }
    }
  };

  return (
    <>
      <button className="back-home" onClick={() => navigate('/inicio')}>← Volver al inicio</button>
      <div className={`auth-container ${isLogin ? '' : 'right-panel-active'}`} id='auth-container'>
        <div className={`form-container ${isLogin ? 'sign-in-container' : 'sign-up-container'}`}>
          {isLogin ? (
            <form onSubmit={handleLoginSubmit}>
              <h1>Iniciar Sesión</h1>
              <div className='auth-infield'>
                <input type='text' name='username' placeholder='Usuario' required value={loginForm.username} onChange={handleLoginChange} />
              </div>
              <div className='auth-infield'>
                <input type='password' name='password' placeholder='Contraseña' required value={loginForm.password} onChange={handleLoginChange} />
              </div>
              <p className="auth-link">
                ¿Olvidaste tu contraseña?{' '}
                <span className="auth-link-action" onClick={() => navigate('/recuperar-password')}>
                  Restablécela aquí
                </span>
              </p>
              {error && <p className='auth-error'>{error}</p>}
              <button type='submit'>Login</button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <h1>Crear Cuenta</h1>
              <div className='auth-infield'>
                <input type='text' name='username' placeholder='Nombre de usuario' required onChange={handleRegisterChange} />
              </div>
              <div className='auth-infield'>
                <input type='text' name='first_name' placeholder='Nombre' required onChange={handleRegisterChange} />
              </div>
              <div className='auth-infield'>
                <input type='text' name='last_name' placeholder='Apellido' required onChange={handleRegisterChange} />
              </div>
              <div className='auth-infield'>
                <input type='email' name='email' placeholder='Correo electrónico' required onChange={handleRegisterChange} />
              </div>
              <div className='auth-infield'>
                <input type='text' name='cedula_ruc' placeholder='Cédula o RUC' required onChange={handleRegisterChange} />
              </div>
              <div className='auth-infield'>
                <input type='password' name='password' placeholder='Contraseña' required onChange={handleRegisterChange} />
              </div>
              {error && <p className='auth-error'>{error}</p>}
              {success && <p className='auth-success'>{success}</p>}
              <button type='submit'>Registrarse</button>
            </form>
          )}
        </div>

        <div className='auth-overlay-container'>
          <div className='auth-overlay'>
            <div className='auth-overlay-panel auth-overlay-left'>
              <h1>¡Bienvenido de nuevo!</h1>
              <p>Inicia sesión con tu información personal</p>
              <button className='ghost' onClick={() => setIsLogin(true)}>Login</button>
            </div>
            <div className='auth-overlay-panel auth-overlay-right'>
              <h1>¡Hola, Volece te da la Bienvenida</h1>
              <p>Regístrate con tus datos personales y comienza tu viaje con nosotros</p>
              <button className='ghost' onClick={() => setIsLogin(false)}>Registrarse</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
