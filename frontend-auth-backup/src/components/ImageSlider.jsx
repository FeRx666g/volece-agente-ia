import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Importamos las flechas
import './components.css'; // Asegúrate de que el CSS esté importado

// Usamos imágenes locales dentro de src/img/
import image1 from '../img/img4.jpg'; // Imagen 1
import image2 from '../img/imgVol2.jpg'; // Imagen 2
import image3 from '../img/img3.jpg'; // Imagen 3
import image4 from '../img/imgVolqueta.jpg'; // Imagen 4

const ImageSlider = () => {
  // Array de imágenes y textos asociados
  const images = [
    { src: image1, text: "Líder en el mercado del transporte pesado" },
    { src: image2, text: "Comprometidos con la puntualidad y la seguridad en cada carga" },
    { src: image3, text: "Tu carga, nuestra responsabilidad: transporte de calidad garantizada" },
    { src: image4, text: "Más de 10 años de experiencia en el transporte de materiales pesados" },
  ];

  const [currentImage, setCurrentImage] = useState(0);

  // Cambiar la imagen cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 5000); // 3 segundos

    return () => clearInterval(interval); 
  }, [images.length]);

  // Funciones para cambiar las imágenes manualmente
  const nextImage = () => {
    setCurrentImage((prevImage) => (prevImage + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prevImage) => (prevImage - 1 + images.length) % images.length);
  };

  return (
    <div className="image-slider">
        <div className="slider-image-container">
        {images.map((image, index) => (
            <div
            key={index}
            className={`slider-image ${index === currentImage ? 'active' : ''}`}
            style={{
                backgroundImage: `url(${image.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
            >
            <div className="slider-overlay"></div>
            {index === currentImage && (
                <div className="slider-text">
                <h2>{image.text}</h2>
                </div>
            )}
            </div>
        ))}
        </div>

        <div className="slider-controls">
        <button className="slider-button left" onClick={prevImage}>
            <FaChevronLeft />
        </button>
        <button className="slider-button right" onClick={nextImage}>
            <FaChevronRight />
        </button>
        </div>
    </div>
    );

};

export default ImageSlider;
