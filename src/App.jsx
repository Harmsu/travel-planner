import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useSupabaseData } from './hooks/useSupabaseData';
import CityView from './components/CityView';
import QuickLinks from './components/QuickLinks';
import LoginPage from './components/LoginPage';
import './App.css';

function MainContent({ onLogout }) {
  const {
    loading,
    error,
    fetchAll,
    getPlacesByCity,
    addPlace,
    updatePlace,
    deletePlace,
    getGroupedQuickLinks,
    addQuickLink,
    deleteQuickLink,
    deleteQuickLinkCategory,
  } = useSupabaseData();

  const [activeTab, setActiveTab] = useState('bilbao');

  const cities = {
    bilbao: { name: 'Bilbao' },
    sanSebastian: { name: 'San Sebastián' },
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
    } catch (err) {
      console.error('Paikan lisäys epäonnistui:', err);
    }
  };

  const handleUpdatePlace = async (id, updates) => {
    try {
      await updatePlace(id, updates);
    } catch (err) {
      console.error('Paikan päivitys epäonnistui:', err);
    }
  };

  const handleDeletePlace = async (id) => {
    try {
      await deletePlace(id);
    } catch (err) {
      console.error('Paikan poisto epäonnistui:', err);
    }
  };

  const handleAddQuickLink = async (category, name, url) => {
    try {
      await addQuickLink(category, name, url);
    } catch (err) {
      console.error('Pikalinkin lisäys epäonnistui:', err);
    }
  };

  const handleDeleteQuickLink = async (id) => {
    try {
      await deleteQuickLink(id);
    } catch (err) {
      console.error('Pikalinkin poisto epäonnistui:', err);
    }
  };

  const handleDeleteCategory = async (category) => {
    try {
      await deleteQuickLinkCategory(category);
    } catch (err) {
      console.error('Kategorian poisto epäonnistui:', err);
    }
  };

  if (loading) {
    return <div className="loading">Ladataan...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={fetchAll}>Yritä uudelleen</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title"><span className="spain-flag"></span> Harmsun retki Bilbao ja San Sebastián</h1>
        <button className="btn-logout" onClick={onLogout}>Kirjaudu ulos</button>
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
        {activeTab === 'bilbao' && (
          <CityView
            city={{ name: cities.bilbao.name, places: getPlacesByCity('bilbao') }}
            cityName="Bilbao"
            onUpdatePlace={handleUpdatePlace}
            onDeletePlace={handleDeletePlace}
            onAddPlace={handleAddPlace}
          />
        )}
        {activeTab === 'sanSebastian' && (
          <CityView
            city={{ name: cities.sanSebastian.name, places: getPlacesByCity('sanSebastian') }}
            cityName="San Sebastián"
            onUpdatePlace={handleUpdatePlace}
            onDeletePlace={handleDeletePlace}
            onAddPlace={handleAddPlace}
          />
        )}
        {activeTab === 'quickLinks' && (
          <QuickLinks
            groupedLinks={getGroupedQuickLinks()}
            onAddLink={handleAddQuickLink}
            onDeleteLink={handleDeleteQuickLink}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <div className="app">
        <div className="loading">Ladataan...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={() => {}} />;
  }

  return <MainContent onLogout={handleLogout} />;
}

export default App;
