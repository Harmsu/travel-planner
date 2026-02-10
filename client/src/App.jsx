import { useState, useEffect } from 'react';
import { fetchData, saveData, addPlace, updatePlace, deletePlace, isLoggedIn, logout } from './api';
import CityView from './components/CityView';
import QuickLinks from './components/QuickLinks';
import LoginPage from './components/LoginPage';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('bilbao');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loggedIn) loadData();
  }, [loggedIn]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await fetchData();
      setData(result);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        setLoggedIn(false);
      } else {
        setError('Datan lataus epäonnistui. Onko backend käynnissä?');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = async () => {
    await logout();
    setLoggedIn(false);
    setData(null);
  };

  const getCityKey = () => {
    if (activeTab === 'bilbao') return 'bilbao';
    if (activeTab === 'sanSebastian') return 'sanSebastian';
    return null;
  };

  const handleAddPlace = async (place) => {
    const cityKey = getCityKey();
    if (!cityKey) return;
    try {
      await addPlace(cityKey, place);
      await loadData();
    } catch (err) {
      console.error('Paikan lisäys epäonnistui:', err);
    }
  };

  const handleUpdatePlace = async (id, updates) => {
    try {
      await updatePlace(id, updates);
      await loadData();
    } catch (err) {
      console.error('Paikan päivitys epäonnistui:', err);
    }
  };

  const handleDeletePlace = async (id) => {
    try {
      await deletePlace(id);
      await loadData();
    } catch (err) {
      console.error('Paikan poisto epäonnistui:', err);
    }
  };

  const handleUpdateQuickLinks = async (updatedLinks) => {
    try {
      const updatedData = { ...data, quickLinks: updatedLinks };
      await saveData(updatedData);
      setData(updatedData);
    } catch (err) {
      console.error('Pikalinkkien päivitys epäonnistui:', err);
    }
  };

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (loading) {
    return <div className="loading">Ladataan...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={loadData}>Yritä uudelleen</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title"><span className="spain-flag"></span> Harmsun retki Bilbao ja San Sebastián</h1>
        <button className="btn-logout" onClick={handleLogout}>Kirjaudu ulos</button>
      </header>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'bilbao' ? 'active' : ''}`}
          onClick={() => setActiveTab('bilbao')}
        >
          Bilbao
        </button>
        <button
          className={`nav-tab ${activeTab === 'sanSebastian' ? 'active' : ''}`}
          onClick={() => setActiveTab('sanSebastian')}
        >
          San Sebastián
        </button>
        <button
          className={`nav-tab ${activeTab === 'quickLinks' ? 'active' : ''}`}
          onClick={() => setActiveTab('quickLinks')}
        >
          Pikalinkit
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'bilbao' && data?.cities?.bilbao && (
          <CityView
            city={data.cities.bilbao}
            cityName="Bilbao"
            onUpdatePlace={handleUpdatePlace}
            onDeletePlace={handleDeletePlace}
            onAddPlace={handleAddPlace}
          />
        )}
        {activeTab === 'sanSebastian' && data?.cities?.sanSebastian && (
          <CityView
            city={data.cities.sanSebastian}
            cityName="San Sebastián"
            onUpdatePlace={handleUpdatePlace}
            onDeletePlace={handleDeletePlace}
            onAddPlace={handleAddPlace}
          />
        )}
        {activeTab === 'quickLinks' && data?.quickLinks && (
          <QuickLinks links={data.quickLinks} onUpdate={handleUpdateQuickLinks} />
        )}
      </main>
    </div>
  );
}

export default App;
