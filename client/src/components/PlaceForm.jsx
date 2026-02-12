import { useState, useEffect, useRef } from 'react';

const generateGoogleMapsLink = (placeName, cityName) => {
  const searchQuery = `${placeName}, ${cityName}`;
  const encoded = encodeURIComponent(searchQuery);
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
};

function PlaceForm({ place, cityName, onSave, onCancel }) {
  const isEditing = !!place;
  const [name, setName] = useState(place?.name || '');
  const [category, setCategory] = useState(place?.category || 'museums');
  const [description, setDescription] = useState(place?.description || '');
  const [website, setWebsite] = useState(place?.website || '');
  const [googleMaps, setGoogleMaps] = useState(place?.googleMaps || '');
  const [otherLinks, setOtherLinks] = useState(place?.otherLinks || []);
  const [mapsManuallyEdited, setMapsManuallyEdited] = useState(isEditing && !!place?.googleMaps);

  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // Auto-generate Google Maps link when name changes
  useEffect(() => {
    if (!mapsManuallyEdited && name.trim()) {
      setGoogleMaps(generateGoogleMapsLink(name, cityName));
    }
  }, [name, cityName, mapsManuallyEdited]);

  const handleGoogleMapsChange = (e) => {
    const value = e.target.value;
    setGoogleMaps(value);
    if (value === '') {
      setMapsManuallyEdited(false);
    } else {
      setMapsManuallyEdited(true);
    }
  };

  const handleAddLink = () => {
    setOtherLinks([...otherLinks, { name: '', url: '' }]);
  };

  const handleRemoveLink = (index) => {
    setOtherLinks(otherLinks.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index, field, value) => {
    const updated = [...otherLinks];
    updated[index] = { ...updated[index], [field]: value };
    setOtherLinks(updated);
  };

  const normalizeUrl = (url) => {
    if (!url || !url.trim()) return '';
    const trimmed = url.trim();
    if (trimmed.match(/^https?:\/\//i)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !category) return;

    const finalGoogleMaps = googleMaps || generateGoogleMapsLink(name, cityName);

    onSave({
      ...(place || {}),
      id: place?.id || Date.now().toString(),
      name: name.trim(),
      category,
      description,
      website: normalizeUrl(website),
      googleMaps: finalGoogleMaps,
      otherLinks: otherLinks.filter(l => l.name && l.url).map(l => ({ ...l, url: normalizeUrl(l.url) })),
      visited: place?.visited || false,
      notes: place?.notes || '',
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? 'Muokkaa paikkaa' : 'Lisää uusi paikka'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nimi *</label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Paikan nimi"
              required
            />
          </div>

          <div className="form-group">
            <label>Kategoria *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="museums">🏛️ Nähtävyydet & Museot</option>
              <option value="restaurants">🍷 Ravintolat & Pintxos-baarit</option>
              <option value="culture">🎵 Jazz-klubit & Kulttuuripaikat</option>
              <option value="shopping">🛍️ Kaupat & Torit</option>
              <option value="walking">🚶 Kävelykohteet & Puistot</option>
              <option value="other">📍 Muut kohteet</option>
            </select>
          </div>

          <div className="form-group">
            <label>Kuvaus</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lisätietoja paikasta..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Nettisivut</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label>Google Maps</label>
            <input
              type="text"
              value={googleMaps}
              onChange={handleGoogleMapsChange}
              placeholder="Generoidaan automaattisesti paikan nimestä"
            />
            <small className="form-hint">Linkki luodaan automaattisesti. Voit muokata sitä tarvittaessa.</small>
          </div>

          <div className="form-group">
            <label>Muut linkit</label>
            {otherLinks.map((link, index) => (
              <div key={index} className="other-link-row">
                <input
                  type="text"
                  value={link.name}
                  onChange={(e) => handleLinkChange(index, 'name', e.target.value)}
                  placeholder="Linkin nimi"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  placeholder="https://..."
                />
                <button type="button" className="btn-icon" onClick={() => handleRemoveLink(index)}>❌</button>
              </div>
            ))}
            <button type="button" className="btn-secondary" onClick={handleAddLink}>➕ Lisää linkki</button>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">Tallenna</button>
            <button type="button" className="btn-secondary" onClick={onCancel}>Peruuta</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PlaceForm;
