import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, token }) => {
  if (!token) {
    // Si no hay token, redirige al login
    return <Navigate to="/login" />;
  }
  return children;  // Si el token está presente, renderiza el componente hijo
};

export default PrivateRoute;


//toca borrar por que no se usa se va a manejar directamente en el app.js