import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [section, setSection] = useState('dashboard')
  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem('hiengame_token'))
  )
  const [settings, setSettings] = useState(null)
  const [saveMessage, setSaveMessage] = useState('')

  async function saveSettings() {
    setSaveMessage('Enregistrement...')

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (!response.ok) {
        setSaveMessage(data.message || 'Enregistrement impossible.')
        return
      }

      setSettings(data.settings)
      setSaveMessage('Paramètres enregistrés.')
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      setSaveMessage('Serveur inaccessible.')
    }
  }

  useEffect(() => {
    fetch('/api/settings')
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.settings)
        }
      })
      .catch((error) => {
        console.error('Erreur paramètres:', error)
      })
  }, [])

  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <p className="eyebrow">HIENGAME ADMIN</p>
          <h1>Connexion</h1>

          <form
            onSubmit={async (e) => {
              e.preventDefault()

              const email = e.target.email.value
              const password = e.target.password.value

              try {
                const response = await fetch(
                  '/api/auth/login',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                  }
                )

                const data = await response.json()

                if (!response.ok || !data.token) {
                  alert(data.message || 'Connexion impossible.')
                  return
                }

                if (data.user.role !== 'admin') {
                  alert('Accès réservé à l’administration.')
                  return
                }

                localStorage.setItem('hiengame_token', data.token)
                setLoggedIn(true)
              } catch (error) {
                console.error(error)
                alert('Serveur inaccessible.')
              }
            }}
          >
            <label>
              Email
              <input name="email" type="email" required />
            </label>

            <label>
              Mot de passe
              <input name="password" type="password" required />
            </label>

            <button className="save-button" type="submit">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    )
  }

  const menu = [
    ['dashboard', 'Tableau de bord'],
    ['products', 'Produits'],
    ['packs', 'Packs'],
    ['inventory', 'Stock numérique'],
    ['orders', 'Commandes'],
    ['settings', 'Paramètres'],
  ]

  return (
    <div className="admin">
      <aside className="sidebar">
        <h1>HIENGAME</h1>

        <nav>
          {menu.map(([id, label]) => (
            <button
              key={id}
              className={section === id ? 'active' : ''}
              onClick={() => setSection(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header>
          <div>
            <p className="eyebrow">ADMINISTRATION</p>
            <h2>
              {menu.find(([id]) => id === section)?.[1]}
            </h2>
          </div>

          <span className="status">● Système opérationnel</span>
        </header>

        {section === 'dashboard' && (
          <section className="cards">
            <article>
              <span>Produits</span>
              <strong>—</strong>
            </article>

            <article>
              <span>Commandes</span>
              <strong>—</strong>
            </article>

            <article>
              <span>Stock disponible</span>
              <strong>—</strong>
            </article>
          </section>
        )}

        {section === 'settings' && (
          <section className="panel">
            <h3>Paramètres du site</h3>

            {!settings ? (
              <p>Chargement des paramètres...</p>
            ) : (
              <div className="settings-form">
                <label>
                  Nom du site
                  <input
                    value={settings.site_name || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, site_name: e.target.value })
                    }
                  />
                </label>

                <label>
                  Numéro Orange Money
                  <input
                    value={settings.orange_money_number || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        orange_money_number: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Numéro Wave
                  <input
                    value={settings.wave_number || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, wave_number: e.target.value })
                    }
                  />
                </label>

                <label>
                  Numéro WhatsApp
                  <input
                    value={settings.whatsapp_number || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        whatsapp_number: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Nom du bénéficiaire
                  <input
                    value={settings.payment_name || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payment_name: e.target.value,
                      })
                    }
                  />
                </label>

                <button
                  className="save-button"
                  onClick={saveSettings}
                >
                  Enregistrer les paramètres
                </button>

                {saveMessage && <p>{saveMessage}</p>}
              </div>
            )}
          </section>
        )}

        {section !== 'dashboard' && section !== 'settings' && (
          <section className="panel">
            <h3>{menu.find(([id]) => id === section)?.[1]}</h3>
            <p>Cette section sera connectée au backend HienGame.</p>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
