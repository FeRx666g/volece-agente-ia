import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      axios
        .get("http://127.0.0.1:8000/api/usuarios/perfil/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setPerfil(res.data);

          // Aquí evaluamos el rol
          if (res.data.rol === "ADMIN") {
            navigate("/dashboard-admin"); // Redirecciona al dashboard de admin
          }
        })
        .catch(() => {
          alert("Token inválido o expirado");
          navigate("/login"); // Si hay error, volver al login
        });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (!perfil) {
    return <p>Cargando perfil...</p>;
  }

  return (
    <div>
      <h2>Mi Perfil</h2>
      <p><strong>ID:</strong> {perfil.id}</p>
      <p><strong>Usuario:</strong> {perfil.username}</p>
      <p><strong>Rol:</strong> {perfil.rol}</p>
    </div>
  );
}
