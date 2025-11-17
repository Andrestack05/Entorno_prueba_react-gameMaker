// SendToReact.js - Extensión para enviar datos a React

function SendGameDataToReact(jsonString) {
  try {
    // Parsear el JSON
    var data = JSON.parse(jsonString);

    // Verificar que estamos en un iframe
    if (window.parent && window.parent !== window) {
      // Enviar mensaje a React
      window.parent.postMessage(
        {
          type: "GAME_RESULTS",
          payload: data,
        },
        "*"
      );

      console.log("✅ Datos enviados a React:", data);
      return 1; // éxito
    } else {
      console.warn("⚠️ No se detectó parent window (no está en iframe)");
      return 0; // no está en iframe
    }
  } catch (e) {
    console.error("❌ Error al enviar datos a React:", e);
    console.error("JSON recibido:", jsonString);
    return -1; // error
  }
}
