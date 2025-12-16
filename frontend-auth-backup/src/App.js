import { BrowserRouter, Routes, Route} from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Perfil from "./pages/perfil";
import { Navigate } from "react-router-dom";
import './App.css';
import Home from './pages/home';
import ClienteDashboard from './components/cliente/ClienteDashboard';
import Auth from "./pages/Auth";  

//componentes de cliente

import SolicitarServicio from './components/cliente/Solicitudes/SolicitarServicio';
import SolicitudesList from './components/cliente/Solicitudes/SolicitudesList';

//componentes de administrador
import DashboardAdmin from './components/administrador/DashboardAdmin';
import AdminUsers from './components/administrador/AdminUsers';
/* compnonentes de finanzas administrador
import AdminFinanzas from './components/administrador/FinancieroList';
import Mensualidades from './components/administrador/FormularioCuota';
import ListadoCuotas from "./components/administrador/ListadoCuotas";*/ 

import AdminVehiculos from './components/administrador/AdminVehiculos';
import AdminReportes from './components/administrador/AdminReportes';
import AdminSolicitudes from './components/administrador/AdminSolicitudes';
import DashboardHome from './components/administrador/DashboardHome';
import RecuperarPassword from './pages/RecuperarPassword';
import SolicitarRecuperacion from './pages/SolicitarRecuperacion';
import RegistroVehiculo from './components/administrador/RegistroVehiculo';
import ListadoVehiculos from './components/administrador/ListadoVehiculos';
import AdminFinanzas from './components/administrador/AdminFinanzas';

// componentes página de inicio
import TiposDeCargas from './pages/TiposDeCargas';


//componentes de transportista
import TransportistaDashboard from './components/transportista/TransportistaDashboard.jsx';

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));  

  useEffect(() => {
    setToken(localStorage.getItem('authToken'));  
  }, []);
  return (
    <BrowserRouter>
      <div>
        <Routes>

        <Route path="/tipos-de-cargas" element={<TiposDeCargas />} />
        
        <Route path="/" element={<Navigate to="/inicio" />} />
        <Route path="/inicio" element={<Home/>} />
        <Route path="/login" element={<Auth />} />
        <Route path="/perfil" element={<Perfil />} />

        {/* Rutas de cliente */}
        <Route path="/cliente/dashboard" element={<ClienteDashboard />} />
        <Route path="/cliente/solicitar-servicio" element={token ? <SolicitarServicio /> : <Navigate to="/login" />}/>
        <Route path="/cliente/mis-solicitudes"  element={token ? <SolicitudesList /> : <Navigate to="/login" />}/>
         
        {/* Rutas de transportista*/}
        <Route path="/transportista/dashboard" element={<TransportistaDashboard />} /> 
        
        {/* Rutas de administrador*/}
        <Route path="/dashboard-admin" element={<DashboardAdmin />}>
        <Route index element={<DashboardHome />} />
        <Route path="usuarios" element={<AdminUsers />} />
        <Route path="solicitudes" element={<AdminSolicitudes />} />
        <Route path="vehiculos" element={<AdminVehiculos />} />
        <Route path="reportes" element={<AdminReportes />} />
        <Route path="vehiculos/registrar-vehiculo" element={<RegistroVehiculo />} />
        <Route path="vehiculos/listar-vehiculos" element={<ListadoVehiculos />} />
        <Route path="finanzas" element={<AdminFinanzas />} />
      </Route>

        <Route path="/recuperar-password" element={<SolicitarRecuperacion />} />
        <Route path="/restablecer-password/:uid/:token" element={<RecuperarPassword />} />
        
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
