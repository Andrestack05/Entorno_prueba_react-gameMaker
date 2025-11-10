import { useState, useEffect, useRef } from 'react';

interface GameEmbedProps {
  userId: number | '';
}

function GameEmbed({ userId }: GameEmbedProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  const nativeWidth = 1440;
  const nativeHeight = 780;

  const originalFullscreenContainerCss = useRef<string>('');

  useEffect(() => {
    if (fullscreenContainerRef.current) {
      originalFullscreenContainerCss.current = fullscreenContainerRef.current.style.cssText || '';
    }
  }, []);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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

  const updateScale = () => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    const iframe = iframeRef.current;
    const fullEl = fullscreenContainerRef.current;
    if (!container || !wrapper || !iframe || !fullEl) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Escala para que el contenido entre completo en viewport (igual que fullscreen)
    // Usamos el min entre vw/nativeWidth y vh/nativeHeight:
    const scale = Math.min(vw / nativeWidth, vh / nativeHeight);
    const scaledW = Math.round(nativeWidth * scale);
    const scaledH = Math.round(nativeHeight * scale);

    // Ajustamos estilos tanto para fullscreen como para modo normal con el mismo tamaño escalado
    fullEl.style.width = '100vw';
    fullEl.style.height = '100vh';
    fullEl.style.padding = '0';
    fullEl.style.margin = '0';
    fullEl.style.boxSizing = 'border-box';
    fullEl.style.borderRadius = '0';
    fullEl.style.overflow = 'hidden';
    fullEl.style.background = '#000';
    fullEl.style.display = 'flex';
    fullEl.style.alignItems = 'center';
    fullEl.style.justifyContent = 'center';
    fullEl.style.position = 'relative';

    container.style.width = `${scaledW}px`;
    container.style.height = `${scaledH}px`;
    container.style.margin = '0 auto';
    container.style.borderRadius = isFullscreen ? '0' : '12px';
    container.style.overflow = 'hidden';
    container.style.position = 'relative';
    container.style.backgroundColor = '#000';
    container.style.transform = 'none';
    container.style.display = 'block';

    wrapper.style.width = `${nativeWidth}px`;
    wrapper.style.height = `${nativeHeight}px`;
    wrapper.style.position = 'relative';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.transformOrigin = 'top left';
    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.overflow = 'hidden';

    iframe.style.width = `${nativeWidth}px`;
    iframe.style.height = `${nativeHeight}px`;
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.border = 'none';
    iframe.style.transform = 'none';

    // Restaurar estilos al contenedor fullscreen si no estamos en fullscreen real
    if (!isFullscreen) {
      fullEl.style.width = '100%';
      fullEl.style.height = 'auto';
      fullEl.style.padding = '12px';
      fullEl.style.maxWidth = '1400px';
      fullEl.style.margin = '0 auto';
      fullEl.style.borderRadius = '12px';
      fullEl.style.background = '#000';
      fullEl.style.display = 'block';
      fullEl.style.overflow = 'visible';
      fullEl.style.position = 'relative';
    }
  };

  const requestLandscapeOrientation = async () => {
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape');
      }
    } catch (err) {
      console.warn('No se pudo forzar orientación horizontal', err);
    }
  };

  const toggleFullscreen = async () => {
    const element = fullscreenContainerRef.current;
    if (!element) return;

    try {
      if (!isFullscreen) {
        if (element.requestFullscreen) await element.requestFullscreen();
        await requestLandscapeOrientation();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error al cambiar fullscreen:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      setTimeout(() => updateScale(), 120);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange as any);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange as any);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange as any);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange as any);
    };
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
    };
  }, [isFullscreen, isMobile, isPortrait]);

  const gameUrl = `/GAME2/index.html?uid=${userId}`;

  return (
    <div
      ref={fullscreenContainerRef}
      style={{
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '12px',
        boxSizing: 'border-box',
        position: 'relative',
        background: '#000',
        borderRadius: isFullscreen ? '0' : '12px',
      }}
    >
      {!isFullscreen && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '20px', margin: 0 }}>🎮 NOSACQ-50</h1>
          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 16 }}>
            ID: {userId}
          </span>
        </div>
      )}

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
          }}
        >
          <span style={{ fontSize: '32px', display: 'block' }}>📱 ↻</span>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
            Para una mejor experiencia, rota tu dispositivo horizontalmente
          </p>
        </div>
      )}

      <button
        onClick={toggleFullscreen}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10000,
          width: '42px',
          height: '42px',
          background: isFullscreen ? 'rgba(255,77,77,0.8)' : 'rgba(255,255,255,0.15)',
          borderRadius: '8px',
          border: 'none',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          transition: 'background 0.3s',
        }}
      >
        {isFullscreen ? '✕' : '⛶'}
      </button>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#000',
          margin: '0 auto',
        }}
      >
        <div
          ref={wrapperRef}
          style={{
            overflow: 'hidden',
            position: 'relative',
            width: `${nativeWidth}px`,
            height: `${nativeHeight}px`,
            transformOrigin: 'top left',
          }}
        >
          <iframe
            ref={iframeRef}
            src={gameUrl}
            style={{
              width: `${nativeWidth}px`,
              height: `${nativeHeight}px`,
              border: 'none',
              display: 'block',
              background: '#000',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            title="NOSACQ-50"
            allow="autoplay; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms"
            scrolling="no"
          />
        </div>
      </div>
    </div>
  );
}

export default GameEmbed;
