import { useState } from 'react';
import GameEmbed from './components/GameEmbed';
import './App.css';

// Interfaz para almacenar los datos del formulario
interface UserFormData {
  email: string;
  gender: 1 | 2 | null;
  role: 1 | 2 | null;
  age: string; // Fecha de nacimiento en formato YYYY-MM-DD
}

// Interfaz para los datos que envía el juego al completar preguntas
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

function App() {
  // Estado que almacena los datos del formulario
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    gender: null,
    role: null,
    age: ''
  });
  
  // Identificador generado para el usuario (simulado o devuelto por backend)
  const [userId, setUserId] = useState<number | null>(null);

  // Controla si el usuario ya inició el cuestionario
  const [gameStarted, setGameStarted] = useState(false);

  // Indica si el sistema está esperando respuesta del "backend"
  const [isLoading, setIsLoading] = useState(false);

  // Guarda los últimos resultados enviados desde el juego
  const [lastResults, setLastResults] = useState<GameResultsPayload | null>(null);

  
  // Función para calcular edad en años según la fecha de nacimiento
  const calculateAge = (birthdate: string): number => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Se ajusta si el usuario aún no cumple años este año
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Función que procesa los datos del formulario antes de iniciar el juego
  const handleSubmitForm = async () => {
    // Validaciones básicas del formulario
    if (!formData.email || !formData.email.includes('@')) {
      alert('Por favor ingresa un email válido');
      return;
    }
    if (!formData.gender) {
      alert('Por favor selecciona el género');
      return;
    }
    if (!formData.role) {
      alert('Por favor selecciona el rol');
      return;
    }
    if (!formData.age) {
      alert('Por favor selecciona la fecha de nacimiento');
      return;
    }

    setIsLoading(true);

    // Se calcula la edad en años para enviar al servidor
    const ageInYears = calculateAge(formData.age);

    // Imprime el JSON que sería enviado al backend real
    console.log('JSON enviado al backend:');
    console.log(JSON.stringify({
      email: formData.email,
      gender: formData.gender,
      role: formData.role,
      age: ageInYears
    }, null, 2));

    // Simulación de tiempo de espera del backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Se genera un ID simulado ya que aún no existe backend real
    const fakeId = Math.floor(Math.random() * 1000000);
    console.log('ID simulado:', fakeId);
    
    // Se guarda el ID y se inicia el juego
    setUserId(fakeId);
    setGameStarted(true);
    setIsLoading(false);

    /*
      Cuando el backend esté listo, se usará este bloque real:

      try {
        const response = await fetch('https://BACKEND.com/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            gender: formData.gender,
            role: formData.role,
            age: calculateAge(formData.age)
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const receivedId = data.id || data.user_id;
          
          if (receivedId) {
            setUserId(receivedId);
            setGameStarted(true);
          } else {
            alert('Error: El backend no devolvió un ID válido');
          }
        } else {
          const errorData = await response.json();
          alert('Error: ' + (errorData.message || response.statusText));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
      } finally {
        setIsLoading(false);
      }
    */
  };

  // Función que recibe los resultados enviados por el juego (parciales o finales)
  const handleGameResults = async (data: GameResultsPayload) => {
    console.log("Resultados recibidos:", data);
    setLastResults(data);

    // En esta versión, los datos solo se imprimen y no se envían aún
    console.log("Datos que se enviarían al backend:", data);
    
    // Si el cuestionario terminó se muestra una alerta de finalización
    if (!data.is_partial) {
      alert("Cuestionario completado! (modo prueba)");
    }

    /*
      Código real a usar con backend:

      try {
        const response = await fetch('https://BACKEND.com/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          if (!data.is_partial) {
            alert('Cuestionario completado');
          }
        } else {
          alert('Error al guardar los resultados');
        }
      } catch (error) {
        alert('Error de conexión');
      }
    */
  };

  // Restablece el formulario y reinicia el estado del juego
  const handleReset = () => {
    setGameStarted(false);
    setUserId(null);
    setFormData({ email: '', gender: null, role: null, age: '' });
    setLastResults(null);
  };

  // Si el juego ya inició y existe userId, se muestra el modo de juego
  if (gameStarted && userId) {
    return (
      <div className="play-wrap">
        <GameEmbed userId={userId} onGameResults={handleGameResults} />
        
        {lastResults && (
          <div className="debug-panel">
            <h3>Últimos datos recibidos:</h3>
            <pre className="debug-pre">
              {JSON.stringify(lastResults, null, 2)}
            </pre>
          </div>
        )}

        <div className="reset-container">
          <button onClick={handleReset} className="reset-button">
            Reiniciar
          </button>
        </div>
      </div>
    );
  }

  // Vista del formulario antes de iniciar el juego
  return (
    <div className="app-wrap">
      <div className="card">
        <h1 className="title">NOSACQ-50</h1>
        <h2 className="subtitle">Cuestionario de Seguridad Gamificado</h2>
        
        <div className="info-box">
          <h3>Antes de comenzar:</h3>
          <p>Completa tus datos para iniciar el cuestionario</p>
        </div>

        <div className="input-group">
          <label className="label">Correo Electrónico:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="ejemplo@correo.com"
            className="input"
            disabled={isLoading}
          />
        </div>

        <div className="input-group">
          <label className="label">Género:</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.gender === 1}
                onChange={() => setFormData({...formData, gender: 1})}
                className="checkbox"
                disabled={isLoading}
              />
              <span className="checkbox-text">Hombre</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.gender === 2}
                onChange={() => setFormData({...formData, gender: 2})}
                className="checkbox"
                disabled={isLoading}
              />
              <span className="checkbox-text">Mujer</span>
            </label>
          </div>
        </div>

        <div className="input-group">
          <label className="label">Rol:</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.role === 1}
                onChange={() => setFormData({...formData, role: 1})}
                className="checkbox"
                disabled={isLoading}
              />
              <span className="checkbox-text">Trabajador</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.role === 2}
                onChange={() => setFormData({...formData, role: 2})}
                className="checkbox"
                disabled={isLoading}
              />
              <span className="checkbox-text">Líder</span>
            </label>
          </div>
        </div>

        <div className="input-group">
          <label className="label">Fecha de Nacimiento:</label>
          <input
            type="date"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            className="input-date"
            max={new Date().toISOString().split('T')[0]}
            disabled={isLoading}
          />
        </div>

        <button 
          onClick={handleSubmitForm} 
          className="button"
          disabled={isLoading}
        >
          {isLoading ? 'Registrando...' : 'Iniciar Cuestionario'}
        </button>
      </div>
    </div>
  );
}

export default App;
