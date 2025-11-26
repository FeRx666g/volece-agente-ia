import { useState, useEffect } from "react";
import "../pages/home.css"; 
import Navbar from "../components/Navbar";
import ImageSlider from "../components/ImageSlider";
import Footer from "../components/footer";
import { FaTruck, FaClock, FaShieldAlt, FaMapMarkedAlt, FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";



/*modales del nav nosotros*/
function NosotrosModales({ visible, onClose }) {
  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{visible.toUpperCase()}</h2>
        <p>
          {visible === 'historia' && "VOLECE C.A. nació con el objetivo de brindar un servicio de transporte de carga pesada más justo, eficiente y tecnológicamente avanzado. Frente a una industria marcada por procesos manuales, ineficiencia y asignaciones desiguales, esta compañía emergió como una propuesta transformadora en Chimborazo, priorizando la digitalización y la equidad operativa. Desde sus inicios, ha evolucionado constantemente, adaptándose a las necesidades del mercado y apostando por la innovación como motor de cambio."}
          {visible === 'mision' && "Brindar un servicio de transporte pesado seguro, puntual y transparente, optimizando cada operación mediante el uso de tecnologías digitales e inteligencia artificial. En VOLECE C.A., nos comprometemos a satisfacer las necesidades logísticas de nuestros clientes y socios transportistas, asegurando eficiencia operativa, equidad en la asignación de turnos y un manejo financiero confiable."}
          {visible === 'vision' && "Convertirse en la empresa líder a nivel nacional en transporte de carga pesada, reconocida por su excelencia operativa, su enfoque innovador y su compromiso con la equidad, la sostenibilidad y la transformación digital del sector logístico en Ecuador."}
          {visible === 'valores' && "En VOLECE C.A. promovemos la transparencia en cada proceso para garantizar la confianza de nuestros socios y clientes; actuamos con responsabilidad en el cumplimiento de nuestros compromisos operativos; fomentamos la equidad mediante una asignación justa de turnos y oportunidades; impulsamos la innovación integrando tecnologías que optimizan nuestros servicios; y mantenemos un firme compromiso con el cliente, ofreciendo una atención personalizada, eficiente y accesible en cada etapa del servicio."}
        </p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visibleNosotros, setVisibleNosotros] = useState(null); // 'historia', 'mision', etc.


  // Mostrar botón cuando el scroll pasa cierto punto
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header>
        <Navbar onOpenModal={(tipo) => setVisibleNosotros(tipo)} />
      </header>

      <section className="image-slider-section">
        <ImageSlider />
      </section>

      <main className="home-container">
        <section className="services" id="servicios">
          <h2>Nuestros Servicios Especializados</h2>
          <div className="service-cards">
            <div className="card">
              <FaTruck className="service-icon" />
              <h3>Transporte de Carga</h3>
              <p>Movemos materiales de construcción, maquinaria y más, de forma segura.</p>
            </div>
            <div className="card">
              <FaClock className="service-icon" />
              <h3>Entrega Puntual</h3>
              <p>Garantizamos tiempos de entrega eficientes y compromiso con el cliente.</p>
            </div>
            <div className="card">
              <FaShieldAlt className="service-icon" />
              <h3>Seguridad Total</h3>
              <p>Monitoreo constante y medidas de protección en cada carga transportada.</p>
            </div>
            <div className="card">
              <FaMapMarkedAlt className="service-icon" />
              <h3>Cobertura Nacional</h3>
              <p>Llegamos a cada rincón del país con rutas planificadas y personal experimentado.</p>
            </div>
            <div className="card">
              <FaMapMarkedAlt className="service-icon" />
              <h3>Gestión de Rutas</h3>
              <p>Optimizamos cada ruta para ahorrar tiempo y maximizar eficiencia operativa.</p>
            </div>
            <div className="card">
              <FaFacebookF className="service-icon" />
              <h3>Atención Personalizada</h3>
              <p>Nuestros asesores te acompañan en todo el proceso logístico.</p>
            </div>
          </div>
        </section>



        <section className="map-section" id="cobertura">
          <h2>Nuestra Cobertura Nacional</h2>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3978.528933130173!2d-78.61589108523878!3d-1.6614642989901307!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d2e913ef6b63d5%3A0x9ec009b48077b1ba!2sPenipe%2C%20Chimborazo!5e0!3m2!1ses!2sec!4v1718046519000!5m2!1ses!2sec"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa cobertura nacional"
            ></iframe>
          </div>
        </section>

        <section className="banner hybrid-banner">
          <div className="banner-overlay">
            <div className="banner-text">
              <h1 className="text-4xl font-bold">VOLECE C.A. — Transporte Pesado Profesional</h1>
              <p className="text-lg mt-4">
                Más de una década brindando soluciones logísticas seguras, eficientes y a tiempo.
              </p>
              <a href="/login" className="cta-button mt-6">
                Cotiza tu Envío Ahora
              </a>
            </div>
          </div>
        </section>

        <section className="advantages">
          <h2>¿Por qué elegir VOLECE C.A.?</h2>
          <ul>
            <li>Flota moderna equipada con GPS, sensores y mantenimiento constante.</li>
            <li>Más de 10 años garantizando entregas seguras en todo el país.</li>
            <li>Conductores calificados, con experiencia en rutas complejas.</li>
            <li>Atención al cliente personalizada y soporte 24/7.</li>
          </ul>
        </section>

        <section className="stats">
          <div className="stat">
            <h3>+10</h3>
            <p>Años de experiencia</p>
          </div>
          <div className="stat">
            <h3>+500</h3>
            <p>Clientes atendidos</p>
          </div>
          <div className="stat">
            <h3>+1000</h3>
            <p>Viajes realizados</p>
          </div>
        </section>

        <section className="video-section">
          <h2>Conoce nuestro trabajo en acción</h2>
          <div className="video-container">
            <video
              src="/videos/Volece-Trabajo.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls={false}
            />
          </div>
        </section>

        <section className="cta-final">
          <h2>¿Listo para optimizar tu logística?</h2>
          <p>Únete a nuestros clientes satisfechos que ya confían en VOLECE C.A.</p>
          <button className="cta-button" onClick={() => setShowModal(true)}>
            Contáctanos
          </button>
        </section>
      </main>

      {/* WhatsApp flotante */}
      <a href="https://wa.me/593998521849" className="whatsapp-float" target="_blank" rel="noreferrer" aria-label="Contactar por WhatsApp">
        <FaWhatsapp />
      </a>
      
      {/* Modal de Nosotros */}
      <NosotrosModales visible={visibleNosotros} onClose={() => setVisibleNosotros(null)} />


      <footer>
        <Footer />
      </footer>

      {/* Modal de contacto */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Contáctanos</h2>
            <p><strong>Dirección:</strong> Av. Principal de ingreso al barrio Chauzazan, <br /> Penipe, Chimborazo, Ecuador</p>
            <p><strong>Teléfonos:</strong></p>
            <ul>
              <li>📞 +593 998521849 </li>
              <li>Jorge Vallejo Gerente</li> <br />
              <li>📞 +593 990384384</li>
              <li>Paul Vallejo Presidente</li>
            </ul>

            <p><strong>Síguenos:</strong></p>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram">
                <FaInstagram />
              </a>
              <a href="https://wa.me/593998521849" target="_blank" rel="noopener noreferrer" title="WhatsApp">
                <FaWhatsapp />
              </a>
            </div>

            <button className="close-button" onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Botón de volver arriba */}
      {showScrollTop && (
        <button
          className="scroll-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="Volver arriba"
        >
          ↑
        </button>
      )}
    </>
  );
}
