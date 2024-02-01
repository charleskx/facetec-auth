import { onRegister, onLogIn } from '@/lib/faceTec'

export default function App() {
  // ** Vars
  const IDUser = 'f9b8d0e0-4ade-4534-ba6b-bd1750d2a579'

  return (
    <div
      id="controls"
      className="wrapping-box-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        minHeight: '100vh',
      }}
    >
      <button
        id="liveness-button"
        type="button"
        onClick={() => onRegister(IDUser)}
        style={{ minWidth: '250px' }}
      >
        SignUp
      </button>

      <button
        type="button"
        onClick={() => onLogIn(IDUser)}
        style={{ minWidth: '250px' }}
      >
        SignIn
      </button>

      <p id="status">Loading...</p>
    </div>
  )
}
