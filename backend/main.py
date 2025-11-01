from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # o ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENDPOINT DE PRUEBA ---
@app.post("/submit")
async def submit(request: Request):
    data = await request.json()
    print("📦 Recibido desde el juego:")
    print(data)
    return {"detail": "Datos recibidos correctamente"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
