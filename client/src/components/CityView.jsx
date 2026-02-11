import { useState } from 'react';
import PlaceCard from './PlaceCard';
import PlaceForm from './PlaceForm';

const categories = [
  { key: 'museums', icon: '🏛️', label: 'Nähtävyydet & Museot' },
  { key: 'restaurants', icon: '🍷', label: 'Ravintolat & Pintxos-baarit' },
  { key: 'culture', icon: '🎵', label: 'Jazz-klubit & Kulttuuripaikat' },
  { key: 'shopping', icon: '🛍️', label: 'Kaupat & Torit' },
  { key: 'walking', icon: '🚶', label: 'Kävelykohteet & Puistot' },
  { key: 'other', icon: '📍', label: 'Muut kohteet' },
];

function CityView({ city, cityName, onUpdatePlace, onDeletePlace, onAddPlace }) {
  const [openCategories, setOpenCategories] = useState(() => {
    // Open categories that have places by default
    const open = {};
    categories.forEach(cat => {
      const hasPlaces = city.places.some(p => p.category === cat.key);
      if (hasPlaces) open[cat.key] = true;
    });
    return open;
  });
  const [showForm, setShowForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [formCategory, setFormCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (key) => {
    setOpenCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredPlaces = searchQuery
    ? city.places.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : city.places;

  const totalPlaces = city.places.length;
  const visitedPlaces = city.places.filter(p => p.visited).length;

  const handleUpdate = (id, updates, isEdit) => {
    if (isEdit) {
      const place = city.places.find(p => p.id === id);
      setEditingPlace(place);
      setShowForm(true);
    } else {
      onUpdatePlace(id, updates);
    }
  };

  const handleAddNew = (category) => {
    setEditingPlace(null);
    setFormCategory(category);
    setShowForm(true);
  };

  const handleSave = (placeData) => {
    if (editingPlace) {
      onUpdatePlace(placeData.id, placeData);
    } else {
      onAddPlace({ ...placeData, category: placeData.category || formCategory });
    }
    setShowForm(false);
    setEditingPlace(null);
    setFormCategory(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPlace(null);
    setFormCategory(null);
  };

  return (
    <div className="city-view">
      <h1>{city.name}</h1>
      <p className="city-stats">Paikkoja yhteensä: {totalPlaces} / Käytyjä: {visitedPlaces}</p>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Hae paikkoja..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
        )}
      </div>

      {categories.map(cat => {
        const placesInCategory = filteredPlaces.filter(p => p.category === cat.key);
        return (
          <div key={cat.key} className="category-section">
            <button
              className={`category-header ${openCategories[cat.key] ? 'open' : ''}`}
              onClick={() => toggleCategory(cat.key)}
            >
              <span>{cat.icon} {cat.label}</span>
              <span className="category-count">({placesInCategory.length})</span>
              <span className="category-arrow">{openCategories[cat.key] ? '▼' : '▶'}</span>
            </button>

            {openCategories[cat.key] && (
              <div className="category-content">
                <div className="places-grid">
                  {placesInCategory.map(place => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onUpdate={handleUpdate}
                      onDelete={onDeletePlace}
                    />
                  ))}
                </div>
                <button className="btn-add" onClick={() => handleAddNew(cat.key)}>
                  + Lisää uusi paikka
                </button>
              </div>
            )}
          </div>
        );
      })}

      {showForm && (
        <PlaceForm
          place={editingPlace}
          cityName={cityName}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

export default CityView;
