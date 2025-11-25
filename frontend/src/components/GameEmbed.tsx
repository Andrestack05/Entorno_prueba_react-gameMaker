import { useState, useEffect, useRef } from 'react';

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
  onGameResults?: (data: GameResultsPayload) => void;
}

const nativeWidth = 1440;
const nativeHeight = 780;

function GameEmbed({ userId, onGameResults }: GameEmbedProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIos, setIsIos] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Detección de dispositivo
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(mobile);

      const ios = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
      setIsIos(ios);

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

  // Lógica de mensajes del juego (INTACTA)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const { type, payload } = event.data;

      if (type === 'GAME_RESULTS' && onGameResults) {
        onGameResults(payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onGameResults]);

  // Cálculo de escala y actualización de dimensiones
  const updateScale = () => {
    const container = containerRef.current;
    const iframe = iframeRef.current;
    if (!container || !iframe) return;

    // Obtenemos las dimensiones reales de la ventana visible
    // 🔥 IMPORTANTE: Usamos window.innerWidth/Height en lugar de CSS 100vw/vh
    // para evitar el problema de la barra de navegación en Safari iOS.
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Cálculo del factor de escala (INTACTO)
    let scale = Math.min((vw - 8) / nativeWidth, (vh - 8) / nativeHeight, 1);

    if (isFullscreen) {
         scale = Math.min(vw / nativeWidth, vh / nativeHeight);
         
         // 🔥 FIX: Forzamos scroll a 0,0 para evitar que el navegador piense que hay scroll
         window.scrollTo(0, 0);

         container.style.position = 'fixed';
         container.style.top = '0';
         container.style.left = '0';
         
         // 🔥 FIX: Usamos píxeles explícitos en lugar de 100vw/100vh
         container.style.width = `${vw}px`;
         container.style.height = `${vh}px`;
         
         container.style.zIndex = '9999';
         container.style.borderRadius = '0';
         container.style.margin = '0';
         container.style.maxWidth = 'none';
         container.style.maxHeight = 'none';
    } else {
        // Estilos modo normal (Responsive)
        if (vw < 400) scale = Math.min(scale, 0.28);
        else if (vw < 500) scale = Math.min(scale, 0.38);
        else if (vw < 600) scale = Math.min(scale, 0.48);
        else if (vw < 700) scale = Math.min(scale, 0.58);
        else if (vw < 900) scale = Math.min(scale, 0.68);

        container.style.position = 'relative';
        container.style.width = `${nativeWidth * scale}px`;
        container.style.height = `${nativeHeight * scale}px`;
        container.style.maxWidth = '100vw';
        container.style.maxHeight = '100vh';
        container.style.zIndex = 'auto';
        container.style.top = 'auto';
        container.style.left = 'auto';
    }

    // El iframe siempre se centra y escala
    iframe.style.width = `${nativeWidth}px`;
    iframe.style.height = `${nativeHeight}px`;
    iframe.style.position = 'absolute';
    iframe.style.top = '50%';
    iframe.style.left = '50%';
    iframe.style.transform = `translate(-50%, -50%) scale(${scale})`;
    iframe.style.border = 'none';
  };

  useEffect(() => {
    // Si entramos en fullscreen, bloqueamos scroll del body
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed'; // Evita scroll de fondo en iOS
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    updateScale();
    
    // 🔥 FIX: Forzamos actualizaciones múltiples al rotar para dar tiempo a Safari a ocultar barras
    const timer1 = setTimeout(updateScale, 100); 
    const timer2 = setTimeout(updateScale, 500); // Un segundo check por si la animación de rotación es lenta

    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);

    // FIX: Escuchar evento de scroll para forzar posición en fullscreen iOS
    const handleScroll = () => {
        if(isFullscreen && isIos) window.scrollTo(0,0);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        window.removeEventListener('resize', updateScale);
        window.removeEventListener('orientationchange', updateScale);
        window.removeEventListener('scroll', handleScroll);
        
        // Limpieza de estilos globales
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    };
  }, [isFullscreen, isMobile, isPortrait, isIos]);

  // FIX: Función Fullscreen Híbrida
  const toggleFullscreen = async () => {
    const el = containerRef.current; 

    if (isIos) {
        setIsFullscreen(!isFullscreen);
        // Pequeño delay para asegurar que el renderizado ocurra antes de recalcular
        setTimeout(() => updateScale(), 50);
        return;
    }

    try {
      if (!isFullscreen) {
        if (el?.requestFullscreen) await el.requestFullscreen();
        else if ((el as any)?.webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('API Fullscreen falló, forzando modo CSS:', error);
      setIsFullscreen(!isFullscreen);
    }
  };

  // Detectar salida de fullscreen nativo
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement;
      if (!isIos) {
          setIsFullscreen(isFS);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isIos]);

  const gameUrl = `/GAME2/index.html?uid=${userId}`;

  return (
    <div
      style={{
        width: '100vw',
        minHeight: isFullscreen ? '100vh' : 'auto', 
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isFullscreen ? 'center' : 'flex-start',
        position: 'relative',
        padding: isFullscreen ? '0' : '12px',
        boxSizing: 'border-box',
      }}
    >
      {!isFullscreen && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', marginBottom: '8px', width: '100%', maxWidth: nativeWidth }}>
          <h1 style={{ fontSize: '20px', margin: 0 }}>🎮 NOSACQ-50</h1>
          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 16 }}>ID: {userId}</span>
        </div>
      )}

      {isMobile && isPortrait && !isFullscreen && (
        <div style={{ backgroundColor: 'rgba(255, 193, 7, 0.15)', border: '2px solid rgba(255, 193, 7, 0.4)', borderRadius: 10, padding: '12px', marginBottom: 12, textAlign: 'center', color: '#ffc107', maxWidth: nativeWidth }}>
          <span style={{ fontSize: '32px', display: 'block' }}>📱 ↻</span>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Rota tu dispositivo horizontalmente</p>
        </div>
      )}

      {/* CONTENEDOR DEL JUEGO */}
      <div
        ref={containerRef}
        style={{
            // Estilos para evitar selección y highlight
            WebkitTapHighlightColor: 'transparent',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            WebkitTouchCallout: 'none',
            touchAction: 'none',
            outline: 'none',
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <iframe
          ref={iframeRef}
          src={gameUrl}
          title="NOSACQ-50"
          allow="autoplay; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
          scrolling="no"
          style={{
            border: "none",
            pointerEvents: "auto",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            touchAction: "none", 
          }}
        />
      </div>

      {/* Solo muestra el botón si NO está en fullscreen */}
      {!isFullscreen && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '8px', position: 'static', bottom: '20px', zIndex: 10000, pointerEvents: 'none' }}>
          <button
            onClick={toggleFullscreen}
            style={{
              pointerEvents: 'auto',
              width: '54px', height: '54px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '50%', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              opacity: 1
            }}
          >
            {'⛶'}
          </button>
        </div>
      )}
    </div>
  );
}

export default GameEmbed;