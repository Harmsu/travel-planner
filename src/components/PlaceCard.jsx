import { useState, useEffect, useRef } from 'react';

const categoryIcons = {
  museums: '🏛️',
  restaurants: '🍷',
  culture: '🎵',
  shopping: '🛍️',
  walking: '🚶',
  other: '📍',
};

function PlaceCard({ place, onUpdate, onDelete }) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(place.notes || '');
  const debounceTimer = useRef(null);

  // Sync notes if place prop changes
  useEffect(() => {
    setNotes(place.notes || '');
  }, [place.notes]);

  const handleVisitedChange = () => {
    onUpdate(place.id, { visited: !place.visited });
  };

  const handleNotesChange = (e) => {
    const value = e.target.value;
    setNotes(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onUpdate(place.id, { notes: value });
    }, 2000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleDelete = () => {
    if (window.confirm(`Haluatko varmasti poistaa "${place.name}"?`)) {
      onDelete(place.id);
    }
  };

  return (
    <div className={`place-card ${place.visited ? 'visited' : ''}`}>
      <div className="place-card-header">
        <span className="category-icon">{categoryIcons[place.category] || '📍'}</span>
        <h3>{place.name}</h3>
      </div>

      {place.description && <p className="place-description">{place.description}</p>}

      <div className="place-links">
        {place.website && (
          <a href={place.website} target="_blank" rel="noopener noreferrer">🌐 Nettisivut</a>
        )}
        {place.googleMaps && (
          <a href={place.googleMaps} target="_blank" rel="noopener noreferrer">📍 Avaa Google Mapsissa</a>
        )}
        {place.otherLinks?.map((link, index) => (
          <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">🔗 {link.name}</a>
        ))}
      </div>

      <div className="place-actions">
        <label className="visited-checkbox">
          <input
            type="checkbox"
            checked={place.visited}
            onChange={handleVisitedChange}
          />
          ✅ Käyty
        </label>

        <button className="btn-icon" onClick={() => setShowNotes(!showNotes)}>
          📝 {showNotes ? 'Piilota muistiinpanot' : 'Näytä muistiinpanot'}
        </button>
      </div>

      {showNotes && (
        <div className="place-notes">
          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Kirjoita muistiinpanoja..."
            rows={3}
          />
        </div>
      )}

      <div className="place-card-footer">
        <button className="btn-edit" onClick={() => onUpdate(place.id, null, true)}>✏️ Muokkaa</button>
        <button className="btn-delete" onClick={handleDelete}>🗑️ Poista</button>
      </div>
    </div>
  );
}

export default PlaceCard;
