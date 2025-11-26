import React from 'react';
import './TiposDeCargas.css';
import { useNavigate } from 'react-router-dom';

import arenaImg from '../img/arena-fina.jpg';
import gravaImg from '../img/grava.jpeg';
import piedraImg from '../img/piedra.jpeg';
import cementoImg from '../img/cemento.jpeg';
import rellenoImg from '../img/RELLENO.jpeg';
import tierraImg from '../img/TIERRA.jpg';
import lastreImg from '../img/laztre.jpeg';
import hormigonImg from '../img/hormigon.jpeg';

export default function TiposDeCargas() {
  const cargas = [
    {
      nombre: 'Arena',
      imagen: arenaImg,
      descripcion: 'Material granular usado en construcción. Se utiliza en mezclas de cemento, hormigón y morteros.',
    },
    {
      nombre: 'Grava',
      imagen: gravaImg,
      descripcion: 'Piedras pequeñas usadas como base para pavimentos y en la fabricación de concreto.',
    },
    {
      nombre: 'Piedra',
      imagen: piedraImg,
      descripcion: 'Roca de mayor tamaño empleada en obras de infraestructura pesada y muros de contención.',
    },
    {
      nombre: 'Cemento',
      imagen: cementoImg,
      descripcion: 'Polvo fino que al mezclarse con agua se convierte en una pasta que endurece, usado en toda obra civil.',
    },
    {
    nombre: 'Material de Relleno',
    imagen: rellenoImg,
    descripcion: 'Material no estructural utilizado para nivelar terrenos y cubrir zanjas.',
    },
    {
        nombre: 'Tierra Negra',
        imagen: tierraImg,
        descripcion: 'Tierra fértil usada para jardinería y cultivos en pequeños proyectos.',
    },
    {
        nombre: 'Lastre',
        imagen: lastreImg,
        descripcion: 'Combinación de arena, grava y piedras, ideal para rellenos y bases compactadas en carreteras.',
    },
    {
        nombre: 'Hormigón Premezclado',
        imagen: hormigonImg,
        descripcion: 'Mezcla de cemento, arena, grava y agua, lista para usar en estructuras de concreto armado.',
    },
  ];

    const navigate = useNavigate();
    const handleBack = () => {
    navigate('/inicio'); 
    };

  return (
    <div className="cargas-container">
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
            <button className="back-button" onClick={handleBack}>← Volver</button>
        </div>

      <h1>TIPOS DE CARGAS QUE PUEDES SOLICITAR</h1>
      <div className="cargas-grid">
        {cargas.map((carga, index) => (
          <div className="carga-card" key={index}>
            <img src={carga.imagen} alt={carga.nombre} />
            <h3>{carga.nombre}</h3>
            <p>{carga.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
