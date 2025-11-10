import { useState } from 'react';
import GameEmbed from './components/GameEmbed';

function App() {
  // manejar userId como number | '' para evitar comparaciones raras
  const [userId, setUserId] = useState<number | ''>('');
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    if (userId !== '' && userId > 0) {
      setGameStarted(true);
    } else {
      alert('Por favor ingresa un ID válido');
    }
  };

  const handleReset = () => {
    setGameStarted(false);
    setUserId('');
  };

  if (gameStarted) {
    return (
      <div style={styles.playWrap}>
        <GameEmbed userId={userId} />
        <div style={styles.resetContainer}>
          <button onClick={handleReset} style={styles.resetButton}>
            🔄 Reiniciar con otro usuario
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appWrap}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎮 NOSACQ-50</h1>
        <h2 style={styles.subtitle}>Cuestionario de Seguridad Gamificado</h2>
        
        <div style={styles.infoBox}>
          <h3 style={{marginTop:0}}>📋 Instrucciones:</h3>
          <ul style={styles.list}>
            <li>Ingresa el ID del usuario</li>
            <li>Completa las 50 preguntas en el juego</li>
            <li>Los resultados se enviarán automáticamente</li>
          </ul>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>ID del Usuario:</label>
          <input
            type="number"
            value={userId === '' ? '' : String(userId)}
            onChange={(e) => setUserId(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Ej: 12345"
            style={styles.input}
            onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
          />
        </div>

        <button onClick={handleStartGame} style={styles.button}>
          🚀 Iniciar Juego
        </button>
      </div>
    </div>
  );
}

const styles: any = {
  appWrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    boxSizing: 'border-box',
    backgroundImage:
      'radial-gradient( circle at 10% 20%, rgba(255,255,255,0.02), transparent 10% ),' +
      'linear-gradient(135deg, #0f1724 0%, #0b1220 50%, #071025 100%)',
    backgroundAttachment: 'fixed'
  },
  // layout para cuando el juego está iniciado: columna y centrado
  playWrap: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 20,
    padding: '40px',
    boxSizing: 'border-box',
    backgroundImage:
      'radial-gradient( circle at 10% 20%, rgba(255,255,255,0.02), transparent 10% ),' +
      'linear-gradient(135deg, #0f1724 0%, #0b1220 50%, #071025 100%)',
  },
  card: {
    width: '100%',
    maxWidth: '560px',
    padding: '34px',
    borderRadius: '16px',
    boxShadow: '0 12px 40px rgba(2,6,23,0.7), inset 0 1px 0 rgba(255,255,255,0.02)',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))',
    border: '1px solid rgba(255,255,255,0.04)',
    color: '#e6eef8',
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    textAlign: 'center'
  },
  title: {
    color: '#ffd166',
    fontSize: '34px',
    margin: '0 0 6px 0',
    textShadow: '0 2px 8px rgba(0,0,0,0.6)'
  },
  subtitle: {
    color: '#cbd7ee',
    fontSize: '15px',
    margin: '0 0 20px 0',
    fontWeight: 500
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '14px',
    borderRadius: '10px',
    marginBottom: '22px',
    border: '1px solid rgba(255,255,255,0.02)',
    textAlign: 'left'
  },
  list: {
    margin: '10px 0 0 18px',
    padding: 0,
    color: '#dbe8ff'
  },
  inputGroup: {
    marginBottom: '20px',
    textAlign: 'left'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    color: '#e6eef8'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '15px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(0,0,0,0.35)',
    color: '#e6eef8',
    outline: 'none',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 700,
    color: '#081224',
    background: 'linear-gradient(90deg, #ffd166 0%, #ff7a59 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(255,121,78,0.18), inset 0 -2px 0 rgba(0,0,0,0.08)'
  },
  resetContainer: {
    width: '100%',
    maxWidth: '960px',
    display: 'flex',
    justifyContent: 'center',
    marginTop: 8
  },
  resetButton: {
    padding: '12px 30px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#081224',
    backgroundColor: '#ffd166',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(0,0,0,0.12)'
  }
};

export default App;