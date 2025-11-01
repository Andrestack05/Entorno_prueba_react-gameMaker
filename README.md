# Demo React + GameMaker + FastAPI

Entorno de prueba para integración de juegos HTML5 exportados desde GameMaker con React.

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

## Instalación

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
```

2. Navega al directorio del frontend:

```bash
cd frontend
```

3. Instala las dependencias:

```bash
npm install
```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:5173` (o el primer puerto disponible).

## Estructura

- `/frontend/` - Aplicación React
- `/frontend/public/NOSACQ-50-GAME/` - Juego exportado desde GameMaker
- `/frontend/src/App.tsx` - Componente principal con integración del juego

## Notas

- El juego debe estar exportado como HTML5 y ubicado en la carpeta public
- El viewport del juego está configurado para 1440x780
- Soporta modo horizontal en dispositivos móviles
- Incluye manejo de mensajes entre React y el juego mediante postMessage

## Características

- ✅ Scaling responsive del juego
- ✅ Detección de orientación en móviles
- ✅ Modo pantalla completa
- ✅ Comunicación bidireccional React ↔ Juego
