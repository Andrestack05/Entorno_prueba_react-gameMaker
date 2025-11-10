import { useState, useEffect, useRef } from 'react';

// Interfaz del componente: recibe un userId (token o ID del usuario que se pasa desde React)
interface GameEmbedProps {
  userId: number | '';
}

// Tamaño nativo del juego exportado desde GameMaker
const nativeWidth = 1440;
const nativeHeight = 780;

function GameEmbed({ userId }: GameEmbedProps) {
  // Estados del componente
  const [isFullscreen, setIsFullscreen] = useState(false); // controla si está en pantalla completa
  const [isPortrait, setIsPortrait] = useState(false);     // controla si el dispositivo está en orientación vertical
  const [isMobile, setIsMobile] = useState(false);         // detecta si el usuario está en un dispositivo móvil

  // Referencias al contenedor y al iframe (para manipularlos directamente)
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ---  Detecta si el usuario está en móvil y si la pantalla está en orientación vertical ---
  useEffect(() => {
    const checkDevice = () => {
      // Expresión regular que detecta navegadores móviles
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      setIsPortrait(window.innerHeight > window.innerWidth); // true si el dispositivo está en modo vertical
    };
    checkDevice();

    // Actualiza cuando el usuario cambia el tamaño o la orientación
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // ---  Calcula el "escala" del iframe según el tamaño de la ventana ---
  const getScale = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Calcula la escala para mantener proporción del juego
    let scale = Math.min((vw - 8) / nativeWidth, (vh - 8) / nativeHeight, 1);

    // Ajustes específicos para pantallas pequeñas (breakpoints)
    if (vw < 400) scale = Math.min(scale, 0.28);
    else if (vw < 500) scale = Math.min(scale, 0.38);
    else if (vw < 600) scale = Math.min(scale, 0.48);
    else if (vw < 700) scale = Math.min(scale, 0.58);
    else if (vw < 900) scale = Math.min(scale, 0.68);

    return scale;
  };

  // --- Actualiza manualmente el tamaño del contenedor e iframe ---
  const updateScale = () => {
    const container = containerRef.current;
    const iframe = iframeRef.current;
    if (!container || !iframe) return;

    const scale = getScale();

    // Contenedor del juego
    container.style.width = `${nativeWidth * scale}px`;
    container.style.height = `${nativeHeight * scale}px`;
    container.style.maxWidth = '100vw';
    container.style.maxHeight = '100vh';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.background = '#000';

    // Iframe (juego embebido)
    iframe.style.width = `${nativeWidth}px`;
    iframe.style.height = `${nativeHeight}px`;
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.transform = `scale(${scale})`; // Se ajusta visualmente al tamaño
    iframe.style.transformOrigin = 'top left';
    iframe.style.border = 'none';
    iframe.style.background = '#000';
    iframe.style.display = 'block';
  };

  // --- Bloquea el scroll de la página y recalcula escala en cambios ---
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    updateScale();

    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isFullscreen, isMobile, isPortrait]);

  // --- Control del modo pantalla completa ---
  const toggleFullscreen = async () => {
    const el = document.documentElement;
    try {
      if (!isFullscreen) {
        if (el.requestFullscreen) await el.requestFullscreen(); // activa fullscreen
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) await document.exitFullscreen(); // sale de fullscreen
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error al cambiar fullscreen:', error);
    }
  };

  // --- 6️⃣ Detecta cuando cambia el estado de pantalla completa (manual o automático) ---
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = !!document.fullscreenElement;
      setIsFullscreen(isFS);
      setTimeout(updateScale, 120); // reajusta el tamaño después de entrar/salir del modo fullscreen
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // ---  URL del juego ---
  // Aquí se pasa el ID del usuario como parámetro (uid), que el juego puede leer desde el query string.
  // Ejemplo: /GAME2/index.html?uid=123
  const gameUrl = `/GAME2/index.html?uid=${userId}`;

  // ---  Renderizado del componente ---
  return (
    <div
      style={{
        width: '100vw',
        minHeight: isFullscreen ? '100vh' : undefined,
        background: '#000',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isFullscreen ? 'center' : 'flex-start',
        position: 'relative',
        borderRadius: isFullscreen ? '0' : '12px',
        padding: isFullscreen ? '0' : '12px',
        boxSizing: 'border-box',
      }}
    >
      {/* 🔹 Cabecera visible solo fuera del fullscreen */}
      {!isFullscreen && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', marginBottom: '8px', width: '100%', maxWidth: nativeWidth }}>
          <h1 style={{ fontSize: '20px', margin: 0 }}>🎮 NOSACQ-50</h1>
          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 16 }}>
            ID: {userId}
          </span>
        </div>
      )}

      {/*  Mensaje de rotación solo para móviles en vertical */}
      {isMobile && isPortrait && !isFullscreen && (
        <div
          style={{
            backgroundColor: 'rgba(255, 193, 7, 0.15)',
            border: '2px solid rgba(255, 193, 7, 0.4)',
            borderRadius: 10,
            padding: '12px',
            marginBottom: 12,
            textAlign: 'center',
            color: '#ffc107',
            maxWidth: nativeWidth,
          }}
        >
          <span style={{ fontSize: '32px', display: 'block' }}>📱 ↻</span>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
            Para una mejor experiencia, rota tu dispositivo horizontalmente
          </p>
        </div>
      )}

      {/*  Contenedor principal del juego */}
      <div
        ref={containerRef}
        style={{
          margin: '0 auto',
          marginBottom: '24px', // espacio para el botón de fullscreen
          borderRadius: isFullscreen ? '0' : '12px',
          boxShadow: !isFullscreen ? '0 4px 24px rgba(0,0,0,0.25)' : undefined,
          background: '#000',
          maxWidth: '100vw',
          maxHeight: '100vh',
          position: 'relative',
        }}
      >
        {/*  Iframe del juego GameMaker */}
        <iframe
          ref={iframeRef}
          src={gameUrl} // ← aquí se pasa el userId al juego
          title="NOSACQ-50"
          allow="autoplay; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms"
          scrolling="no"
        />
      </div>

      {/* 🔘 Botón de pantalla completa */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '8px',
      }}>
        <button
          onClick={toggleFullscreen}
          style={{
            width: '54px',
            height: '54px',
            background: isFullscreen ? 'rgba(255,77,77,0.8)' : 'rgba(255,255,255,0.15)',
            borderRadius: '50%',
            border: 'none',
            color: '#fff',
            fontSize: '28px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(4px)',
            transition: 'background 0.3s',
          }}
        >
          {isFullscreen ? '✕' : '⛶'}
        </button>
      </div>
    </div>
  );
}

export default GameEmbed;
