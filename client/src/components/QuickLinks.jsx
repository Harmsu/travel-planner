import { useState } from 'react';

function QuickLinks({ links, onUpdate }) {
  const [addingToCategory, setAddingToCategory] = useState(null);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddLink = (categoryIndex) => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) return;
    const updated = [...links];
    updated[categoryIndex] = {
      ...updated[categoryIndex],
      links: [...updated[categoryIndex].links, { name: newLinkName.trim(), url: newLinkUrl.trim() }],
    };
    onUpdate(updated);
    setNewLinkName('');
    setNewLinkUrl('');
    setAddingToCategory(null);
  };

  const handleDeleteLink = (categoryIndex, linkIndex) => {
    const linkName = links[categoryIndex].links[linkIndex].name;
    if (!window.confirm(`Haluatko varmasti poistaa linkin "${linkName}"?`)) return;
    const updated = [...links];
    updated[categoryIndex] = {
      ...updated[categoryIndex],
      links: updated[categoryIndex].links.filter((_, i) => i !== linkIndex),
    };
    onUpdate(updated);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const updated = [...links, { category: newCategoryName.trim(), links: [] }];
    onUpdate(updated);
    setNewCategoryName('');
    setAddingCategory(false);
  };

  const handleDeleteCategory = (categoryIndex) => {
    const catName = links[categoryIndex].category;
    if (!window.confirm(`Haluatko varmasti poistaa kategorian "${catName}" ja kaikki sen linkit?`)) return;
    const updated = links.filter((_, i) => i !== categoryIndex);
    onUpdate(updated);
  };

  return (
    <div className="quick-links">
      <h1>Pikalinkit</h1>

      {links.map((category, categoryIndex) => (
        <div key={categoryIndex} className="quick-links-category">
          <div className="quick-links-category-header">
            <h2>{category.category}</h2>
            <button
              className="btn-delete-small"
              onClick={() => handleDeleteCategory(categoryIndex)}
              title="Poista kategoria"
            >
              🗑️
            </button>
          </div>

          <ul className="quick-links-list">
            {category.links.map((link, linkIndex) => (
              <li key={linkIndex}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.name}
                </a>
                <button
                  className="btn-delete-small"
                  onClick={() => handleDeleteLink(categoryIndex, linkIndex)}
                  title="Poista linkki"
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>

          {addingToCategory === categoryIndex ? (
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
                <button className="btn-primary" onClick={() => handleAddLink(categoryIndex)}>Lisää</button>
                <button className="btn-secondary" onClick={() => { setAddingToCategory(null); setNewLinkName(''); setNewLinkUrl(''); }}>Peruuta</button>
              </div>
            </div>
          ) : (
            <button className="btn-add-link" onClick={() => setAddingToCategory(categoryIndex)}>
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
          <div className="quick-link-form-actions">
            <button className="btn-primary" onClick={handleAddCategory}>Lisää kategoria</button>
            <button className="btn-secondary" onClick={() => { setAddingCategory(false); setNewCategoryName(''); }}>Peruuta</button>
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
