// TokenReader.js

function GetTokenFromURL() {
  try {
    var urlParams = new URLSearchParams(window.location.search);
    var token = urlParams.get("uid");

    if (token && token !== "") {
      var tokenNum = parseInt(token);
      console.log("✅ [EXT] Token obtenido:", tokenNum);
      return tokenNum;
    } else {
      console.log("⚠️ [EXT] No hay token en URL");
      return 999;
    }
  } catch (e) {
    console.error("❌ [EXT] Error:", e);
    return 999;
  }
}
