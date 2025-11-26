import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'; 
import './AdminUsers.css';
import './estilos/modal.css';

export default function AdminUsers() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    cedula_ruc: '',
    password: '',
    rol: 'CLIENTE'
  });

  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const token = localStorage.getItem('access');

  const cargarUsuarios = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/usuarios/listar/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data.results);
    } catch (error) {
      console.error('Error al cargar usuarios:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    cargarUsuarios(); //  Carga los usuarios al entrar
  },);
  //manejo de la eliminación de usuarios
  const handleDelete = async (id) => {
    const confirmacion = window.confirm('¿Estás seguro de eliminar este usuario?');
    if (!confirmacion) return;
  
    try {
      await axios.delete(`http://127.0.0.1:8000/api/usuarios/eliminar/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('¡Usuario eliminado exitosamente!');
      cargarUsuarios(); // recargar usuarios después de eliminar uno
    } catch (error) {
      console.error('Error al eliminar usuario:', error.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        alert('Sesión expirada. Por favor vuelve a iniciar sesión.');
        localStorage.clear();
        window.location.href = '/login';
      } else {
        alert('Error al eliminar usuario.');
      }
    }
  };
  // manejo de la edición de usuarios
  const handleEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setMostrarModal(true);
  };
  // edicion de usuarios
  const handleUpdate = async (e) => {
    e.preventDefault();
  
    // Extraemos solo los campos permitidos
    const { id, first_name, last_name, rol, cedula_ruc } = usuarioEditando;
    const datosPermitidos = { first_name, last_name, rol, cedula_ruc };
  
    try {
      await axios.put(`http://127.0.0.1:8000/api/usuarios/editar/${id}/`, datosPermitidos, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      alert("¡Usuario actualizado exitosamente!");
      setMostrarModal(false);
      setUsuarioEditando(null);
      cargarUsuarios();
    } catch (error) {
      console.error("Error al actualizar usuario:", error.response?.data || error.message);
      alert(
        "Error al actualizar usuario:\n" +
          JSON.stringify(error.response?.data || error.message, null, 2)
      );
    }
  };
  
  
   // manejo en cambio de los datos del formulario o creación de usuario
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (usuarioEditando) {
      setUsuarioEditando({ ...usuarioEditando, [name]: value });
    } else {
      setNuevoUsuario({ ...nuevoUsuario, [name]: value });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const {
      username,
      first_name,
      last_name,
      email,
      cedula_ruc,
      password,
      rol
    } = nuevoUsuario;
  
    if (!username || !first_name || !last_name || !email || !cedula_ruc || !password || !rol) {
      alert('Todos los campos son obligatorios.');
      return;
    }
  
    try {
      const token = localStorage.getItem('access');  
      const response = await axios.post(
        'http://127.0.0.1:8000/api/usuarios/registro/',
        nuevoUsuario,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      alert(`Usuario ${response.data.username} creado correctamente`);
      setMostrarModal(false);
      setNuevoUsuario({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        cedula_ruc: '',
        password: '',
        rol: 'CLIENTE'
      });
      cargarUsuarios();
    } catch (error) {
      console.error('Error al crear usuario:', error);
  
      if (error.response && error.response.data) {
        const errores = error.response.data;
        let mensaje = 'Error desconocido.';
  
        if (typeof errores === 'object') {
          mensaje = Object.entries(errores)
            .map(([campo, msgs]) => `${campo}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
        } else {
          mensaje = errores?.detail || 'Error inesperado.';
        }
  
        alert(mensaje);
      } else {
        alert('Error de conexión con el servidor.');
      }
    }
  };
  
  return (
    <div className="usuarios-container">
      <h2>Gestión de Usuarios</h2>

      {/* Botón para abrir modal */}
      <button className="btn-crear-usuario" onClick={() => setMostrarModal(true)}>
        <FaPlus /> Crear Nuevo Usuario
      </button>

      {/* Tabla de usuarios */}
      <table className="tabla-usuarios">
        <thead>
          <tr>
            <th>Cédula</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
            {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                <td>{usuario.cedula_ruc}</td>
                <td>{usuario.first_name} {usuario.last_name}</td>
                <td>{usuario.email}</td>
                <td>{usuario.rol}</td>
                <td>
                    <button className="btn-icon editar" onClick={() => handleEditar(usuario)}>
                        <FaEdit />
                    </button>
                    <button className="btn-icon eliminar" onClick={() => handleDelete(usuario.id)}>
                    <FaTrash />
                    </button>
                </td>
                </tr>
            ))}
        </tbody>

      </table>

      {/* Modal para Crear y editar Usuario */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{usuarioEditando ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
            <form onSubmit={usuarioEditando ? handleUpdate : handleSubmit}>

            <input
                type="text"
                name="first_name"
                placeholder="Nombre"
                value={usuarioEditando ? usuarioEditando.first_name : nuevoUsuario.first_name}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="last_name"
                placeholder="Apellido"
                value={usuarioEditando ? usuarioEditando.last_name : nuevoUsuario.last_name}
                onChange={handleChange}
                required
              />

              {/* muestra estos campos solo en la creacion en la edición les oculta */}
              {!usuarioEditando && (
                <>
                  <input
                    type="text"
                    name="username"
                    placeholder="Nombre de usuario"
                    value={nuevoUsuario.username}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={nuevoUsuario.email}
                    onChange={handleChange}
                    required
                  />
                </>
              )}


              <input
                type="text"
                name="cedula_ruc"
                placeholder="Cédula o RUC"
                value={usuarioEditando ? usuarioEditando.cedula_ruc : nuevoUsuario.cedula_ruc}
                onChange={handleChange}
                required
              />

              {!usuarioEditando && (
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={nuevoUsuario.password}
                  onChange={handleChange}
                  required
                />
              )}

              <select
                name="rol"
                value={usuarioEditando ? usuarioEditando.rol : nuevoUsuario.rol}
                onChange={handleChange}
                required
              >
                <option value="CLIENTE">Cliente</option>
                <option value="TRANSP">Transportista</option>
                <option value="ADMIN">Administrador</option>
              </select>

              <div className="modal-buttons">
                <button type="submit" className="btn-modal">
                  {usuarioEditando ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  className="btn-modal-cancelar"
                  onClick={() => {
                    setMostrarModal(false);
                    setUsuarioEditando(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
