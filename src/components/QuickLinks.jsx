import { useState } from 'react';

function QuickLinks({ groupedLinks, onAddLink, onDeleteLink, onDeleteCategory }) {
  const [addingToCategory, setAddingToCategory] = useState(null);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddLink = (categoryName) => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) return;
    onAddLink(categoryName, newLinkName.trim(), newLinkUrl.trim());
    setNewLinkName('');
    setNewLinkUrl('');
    setAddingToCategory(null);
  };

  const handleDeleteLink = (linkId, linkName) => {
    if (!window.confirm(`Haluatko varmasti poistaa linkin "${linkName}"?`)) return;
    onDeleteLink(linkId);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !newLinkName.trim() || !newLinkUrl.trim()) return;
    onAddLink(newCategoryName.trim(), newLinkName.trim(), newLinkUrl.trim());
    setNewCategoryName('');
    setNewLinkName('');
    setNewLinkUrl('');
    setAddingCategory(false);
  };

  const handleDeleteCategory = (categoryName) => {
    if (!window.confirm(`Haluatko varmasti poistaa kategorian "${categoryName}" ja kaikki sen linkit?`)) return;
    onDeleteCategory(categoryName);
  };

  return (
    <div className="quick-links">
      <h1>Pikalinkit</h1>

      {groupedLinks.map((group) => (
        <div key={group.category} className="quick-links-category">
          <div className="quick-links-category-header">
            <h2>{group.category}</h2>
            <button
              className="btn-delete-small"
              onClick={() => handleDeleteCategory(group.category)}
              title="Poista kategoria"
            >
              🗑️
            </button>
          </div>

          <ul className="quick-links-list">
            {group.links.map((link) => (
              <li key={link.id}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.name}
                </a>
                <button
                  className="btn-delete-small"
                  onClick={() => handleDeleteLink(link.id, link.name)}
                  title="Poista linkki"
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>

          {addingToCategory === group.category ? (
            <div className="quick-link-form">
              <input
                type="text"
                value={newLinkName}
                onChange={(e) => setNewLinkName(e.target.value)}
                placeholder="Linkin nimi"
                autoFocus
              />
              <input
                type="url"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="https://..."
              />
              <div className="quick-link-form-actions">
                <button className="btn-primary" onClick={() => handleAddLink(group.category)}>Lisää</button>
                <button className="btn-secondary" onClick={() => { setAddingToCategory(null); setNewLinkName(''); setNewLinkUrl(''); }}>Peruuta</button>
              </div>
            </div>
          ) : (
            <button className="btn-add-link" onClick={() => setAddingToCategory(group.category)}>
              + Lisää linkki
            </button>
          )}
        </div>
      ))}

      {addingCategory ? (
        <div className="quick-link-form">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Kategorian nimi"
            autoFocus
          />
          <input
            type="text"
            value={newLinkName}
            onChange={(e) => setNewLinkName(e.target.value)}
            placeholder="Ensimmäisen linkin nimi"
          />
          <input
            type="url"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            placeholder="https://..."
          />
          <div className="quick-link-form-actions">
            <button className="btn-primary" onClick={handleAddCategory}>Lisää kategoria</button>
            <button className="btn-secondary" onClick={() => { setAddingCategory(false); setNewCategoryName(''); setNewLinkName(''); setNewLinkUrl(''); }}>Peruuta</button>
          </div>
        </div>
      ) : (
        <button className="btn-add" onClick={() => setAddingCategory(true)}>
          + Lisää uusi kategoria
        </button>
      )}
    </div>
  );
}

export default QuickLinks;
