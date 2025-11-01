import { useEffect, useRef, useState } from "react";

function App() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [showRotateOverlay, setShowRotateOverlay] = useState(false);

  // Resolución nativa real del viewport del juego
  const nativeWidth = 1440;
  const nativeHeight = 780;

  // Token (cámbialo por el token real)
  const tokenRef = useRef<string>("token_de_prueba_123");

  // Ajusta la altura del contenedor según el ancho disponible (mantiene proporción nativa)
  const updateContainerSize = () => {
    const container = containerRef.current;
    if (!container) return;
    const cw = Math.min(container.parentElement?.clientWidth ?? window.innerWidth, 1200); // límite visual
    container.style.width = `${cw}px`;
    const height = Math.round((cw * nativeHeight) / nativeWidth);
    container.style.height = `${height}px`;
  };

  // Escalar el wrapper que contiene el iframe para que encaje exactamente sin scroll
  const updateScale = () => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!container || !wrapper) return;
    const cw = container.clientWidth;
    const scale = cw / nativeWidth; // solo escala por ancho porque altura ya se ajustó a la proporción
    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.transformOrigin = "top left";
    wrapper.style.left = `0px`;
    wrapper.style.top = `0px`;
  };

  // Función para enviar AUTH de forma controlada
  const sendAuth = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) {
      console.warn("Iframe no disponible para enviar AUTH");
      return;
    }
    const msg = { type: "AUTH", token: tokenRef.current };
    // usar '*' en dev; en producción reemplazar por origin seguro
    iframe.contentWindow.postMessage(msg, "*");
    console.log("➡️ Enviado AUTH al juego:", msg);
  };

  // Escucha mensajes del iframe (handshake + datos)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      // Asegurar que el mensaje venga del iframe correcto
      if (event.source !== iframe.contentWindow) return;

      console.log("📩 Mensaje recibido desde iframe:", event.data);

      const data = event.data;
      if (!data || typeof data !== "object") return;

      switch (data.type) {
        case "READY":
          // El juego indica que está listo para recibir el token
          sendAuth();
          break;
        case "AUTH_ACK":
          // El juego confirma recepción y puede enviar un id o token de vuelta
          console.log("✅ AUTH_ACK recibido. id/token:", data.id ?? data.token ?? data);
          break;
        case "GAME_DATA":
          console.log("🎮 GAME_DATA:", data.data);
          break;
        default:
          console.log("Mensaje desconocido del juego:", data);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enviar token cuando el iframe esté listo (fallback) — mantiene también el handshake por READY
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.onload = () => {
      console.log("🎮 Iframe onload; intento de envío AUTH (fallback)");
      // Envío inmediato (fallback) + luego handshake READY/ACK si el juego lo implementa
      sendAuth();
      requestAnimationFrame(() => {
        updateContainerSize();
        updateScale();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Inicializar tamaño y listeners
    updateContainerSize();
    updateScale();
    const onResize = () => {
      updateContainerSize();
      updateScale();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detectar orientación / tamaño y mostrar overlay en móviles en vertical
  useEffect(() => {
    const check = () => {
      const isMobileWidth = window.innerWidth <= 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      setShowRotateOverlay(isMobileWidth && isPortrait);
    };

    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  // Intentar fullscreen + bloqueo de orientación (requiere gesto del usuario)
  const enterFullscreenAndLock = async () => {
    try {
      const el = containerRef.current || document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      // @ts-ignore
      if (screen.orientation && screen.orientation.lock) {
        // @ts-ignore
        await screen.orientation.lock("landscape");
      }
    } catch (err) {
      console.warn("No se pudo bloquear orientación / abrir fullscreen:", err);
    }
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#222", boxSizing: "border-box", padding: 12, overflowX: "hidden" }}>
      <h1 style={{ color: "white", textAlign: "center" }}>Demo React + GameMaker + FastAPI</h1>

      <div
        ref={containerRef}
        style={{
          width: "100%", // se ajusta en JS a un ancho max (ve updateContainerSize)
          maxWidth: "1200px",
          background: "#000",
          position: "relative",
          overflow: "hidden", // evita barras de scroll en el host
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* wrapper con tamaño nativo y transform scale */}
        <div
          ref={wrapperRef}
          style={{
            position: "absolute",
            width: nativeWidth,
            height: nativeHeight,
            left: 0,
            top: 0,
            overflow: "hidden",
          }}
        >
          <iframe
            ref={iframeRef}
            src="/NOSACQ-50-GAME/index.html"
            title="NOSACQ-50"
            style={{
              width: nativeWidth,
              height: nativeHeight,
              border: "none",
              display: "block",
              background: "#000",
            }}
            allow="autoplay; fullscreen"
            scrolling="no"
          ></iframe>
        </div>

        {showRotateOverlay && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              background: "rgba(0,0,0,0.7)",
              color: "#fff",
              padding: 16,
              textAlign: "center",
              zIndex: 50,
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600 }}>Gira tu dispositivo a horizontal</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Para una mejor experiencia, usa la pantalla en horizontal.</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={() => enterFullscreenAndLock()}
                style={{
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: "#1a73e8",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Abrir en pantalla completa
              </button>
              <button
                onClick={() => setShowRotateOverlay(false)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "transparent",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Continuar igualmente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
