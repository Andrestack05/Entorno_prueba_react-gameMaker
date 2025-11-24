import { useState, useEffect, useRef } from 'react';

// 🔹 Interfaz que define la estructura del JSON que envía el juego hacia React
interface GameResultsPayload {
  user_id: number;
  is_partial: boolean;
  total_questions: number;
  answered_questions: number;
  responses: Array<{
    question_number: number;
    value: number;
  }>;
}

interface GameEmbedProps {
  userId: number | '';
  onGameResults?: (data: GameResultsPayload) => void; // Callback para enviar los resultados al componente padre
}

// Resolución base del juego en GameMaker
const nativeWidth = 1440;
const nativeHeight = 780;

function GameEmbed({ userId, onGameResults }: GameEmbedProps) {
  // Estado para controlar fullscreen activado o no
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Detectar si la orientación es vertical
  const [isPortrait, setIsPortrait] = useState(false);

  // Detectar si el usuario está en móvil
  const [isMobile, setIsMobile] = useState(false);

  // Referencias para escalar correctamente el iframe
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 🔥 Escuchar los mensajes que envía el juego mediante window.postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Se asegura que el mensaje venga desde el iframe correcto
      if (event.source !== iframeRef.current?.contentWindow) return;

      const { type, payload } = event.data;

      // El juego envía "GAME_RESULTS" cuando finaliza el cuestionario
      if (type === 'GAME_RESULTS') {
        console.log('📥 Datos recibidos del juego:', payload);

        // Si el componente padre envió un callback, se lo llama
        if (onGameResults) {
          onGameResults(payload);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onGameResults]);

  // Detecta si es móvil y si está en orientación vertical
  useEffect(() => {
    const checkDevice = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile(mobile);
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Calcula el factor de escala dependiendo del tamaño de pantalla
  const getScale = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Escalado base según resolución del juego
    let scale = Math.min((vw - 8) / nativeWidth, (vh - 8) / nativeHeight, 1);

    // Ajustes de escalado específicos para pantallas pequeñas
    if (vw < 400) scale = Math.min(scale, 0.28);
    else if (vw < 500) scale = Math.min(scale, 0.38);
    else if (vw < 600) scale = Math.min(scale, 0.48);
    else if (vw < 700) scale = Math.min(scale, 0.58);
    else if (vw < 900) scale = Math.min(scale, 0.68);

    return scale;
  };

  // Actualiza el tamaño del contenedor y del iframe según el scaling calculado
  const updateScale = () => {
    const container = containerRef.current;
    const iframe = iframeRef.current;
    if (!container || !iframe) return;

    const scale = getScale();

    // Ajusta el contenedor externo
    container.style.width = `${nativeWidth * scale}px`;
    container.style.height = `${nativeHeight * scale}px`;
    container.style.maxWidth = '100vw';
    container.style.maxHeight = '100vh';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.background = '#000';

    // Ajusta el iframe interno (juego)
    iframe.style.width = `${nativeWidth}px`;
    iframe.style.height = `${nativeHeight}px`;
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.transform = `scale(${scale})`;
    iframe.style.transformOrigin = 'top left';
    iframe.style.border = 'none';
    iframe.style.background = '#000';
    iframe.style.display = 'block';
  };

  // Control de fullscreen + aplicar escala
  useEffect(() => {
    // Bloquea scroll al entrar en fullscreen
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }

    updateScale();

    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);

      // Limpia estilos al desmontarse
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isFullscreen, isMobile, isPortrait]);

  // Cambia entre fullscreen y ventana normal
  const toggleFullscreen = async () => {
    const el = document.documentElement;

    try {
      if (!isFullscreen) {
        if (el.requestFullscreen) await el.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error al cambiar fullscreen:', error);
    }
  };

  // Detecta si el usuario sale del fullscreen manualmente (ESC, gesto, botón del navegador)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = !!document.fullscreenElement;
      setIsFullscreen(isFS);
      setTimeout(updateScale, 120); // Pequeño delay para permitir que la UI se ajuste
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Construye la URL del juego enviando el userId como query param
  const gameUrl = `/GAME2/index.html?uid=${userId}`;

  return (
    <div
      style={{
        width: '100vw',
        minHeight: isFullscreen ? '100vh' : 'auto',
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
      {/* Encabezado con título e ID, solo visible fuera de fullscreen */}
      {!isFullscreen && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#fff',
            marginBottom: '8px',
            width: '100%',
            maxWidth: nativeWidth,
          }}
        >
          <h1 style={{ fontSize: '20px', margin: 0 }}>🎮 NOSACQ-50</h1>
          <span
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '6px 12px',
              borderRadius: 16,
            }}
          >
            ID: {userId}
          </span>
        </div>
      )}

      {/* Advertencia para rotar el dispositivo */}
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

      {/* Contenedor escalable del juego */}
      <div
        ref={containerRef}
        style={{
          margin: '0 auto',
          marginBottom: '24px',
          borderRadius: isFullscreen ? '0' : '12px',
          boxShadow: !isFullscreen ? '0 4px 24px rgba(0,0,0,0.25)' : undefined,
          background: '#000',
          maxWidth: '100vw',
          maxHeight: '100vh',
          position: 'relative',
        }}
      >
        {/* Iframe donde corre el juego */}
        <iframe
          ref={iframeRef}
          src={gameUrl}
          title="NOSACQ-50"
          allow="autoplay; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms"
          scrolling="no"
          style={{
    width: "100%",
    height: "100vh",
    border: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
    WebkitTouchCallout: "none",
    touchAction: "none",
  }}
        />
      </div>

      {/* Botón circular para entrar/salir de fullscreen */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '8px',
        }}
      >
        <button
          onClick={toggleFullscreen}
          style={{
            width: '54px',
            height: '54px',
            background: isFullscreen
              ? 'rgba(255,77,77,0.8)'
              : 'rgba(255,255,255,0.15)',
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
