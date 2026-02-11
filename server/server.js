import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, 'data.json');

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_DIST = join(__dirname, '..', 'client', 'dist');

// GitHub-tallennus tuotannossa (pysyvä data)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'Harmsu/travel-planner';
const GITHUB_DATA_PATH = 'server/data.json';
const useGitHub = !!GITHUB_TOKEN;

// Muistivälimuisti
let dataCache = null;
let githubSha = null;

// Salasana - vaihda tämä ennen tuotantoon vientiä!
const PASSWORD = process.env.APP_PASSWORD || 'harmsu2026';

// Aktiiviset tokenit (muistissa)
const activeTokens = new Set();

app.use(cors());
app.use(express.json());

// Auth middleware - suojaa kaikki reitit paitsi /api/login
function requireAuth(req, res, next) {
  if (req.path === '/login') return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Kirjautuminen vaaditaan' });
  }

  const token = authHeader.split(' ')[1];
  if (!activeTokens.has(token)) {
    return res.status(401).json({ error: 'Virheellinen tai vanhentunut token' });
  }

  next();
}

app.use('/api', requireAuth);

// POST /api/login - kirjautuminen
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password !== PASSWORD) {
    return res.status(401).json({ error: 'Väärä salasana' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  activeTokens.add(token);
  res.json({ success: true, token });
});

// POST /api/logout - kirjaudu ulos
app.post('/api/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeTokens.delete(token);
  }
  res.json({ success: true });
});

// Apufunktiot datan lukemiseen ja kirjoittamiseen
async function readData() {
  if (useGitHub) {
    if (dataCache) return dataCache;
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } }
    );
    const json = await res.json();
    githubSha = json.sha;
    const content = Buffer.from(json.content, 'base64').toString('utf-8');
    dataCache = JSON.parse(content);
    return dataCache;
  }
  const raw = readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function writeData(data) {
  dataCache = data;
  if (useGitHub) {
    if (!githubSha) await readData(); // varmista sha
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}`,
      {
        method: 'PUT',
        headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Update travel data', content, sha: githubSha })
      }
    );
    const json = await res.json();
    githubSha = json.content.sha;
    return;
  }
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/data - palauttaa kaiken datan
app.get('/api/data', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (err) {
    console.error('readData error:', err);
    res.status(500).json({ error: 'Datan luku epäonnistui' });
  }
});

// POST /api/data - tallentaa koko datan
app.post('/api/data', async (req, res) => {
  try {
    await writeData(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error('writeData error:', err);
    res.status(500).json({ error: 'Datan tallennus epäonnistui' });
  }
});

// POST /api/places - lisää uuden paikan
app.post('/api/places', async (req, res) => {
  try {
    const { cityKey, place } = req.body;
    const data = await readData();

    if (!data.cities[cityKey]) {
      return res.status(400).json({ error: `Kaupunkia "${cityKey}" ei löydy` });
    }

    data.cities[cityKey].places.push(place);
    await writeData(data);
    res.json({ success: true, place });
  } catch (err) {
    console.error('addPlace error:', err);
    res.status(500).json({ error: 'Paikan lisäys epäonnistui' });
  }
});

// PUT /api/places/:id - päivittää paikan
app.put('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPlace = req.body;
    const data = await readData();

    let found = false;
    for (const cityKey of Object.keys(data.cities)) {
      const places = data.cities[cityKey].places;
      const index = places.findIndex(p => p.id === id);
      if (index !== -1) {
        data.cities[cityKey].places[index] = { ...places[index], ...updatedPlace };
        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ error: `Paikkaa id:llä "${id}" ei löydy` });
    }

    await writeData(data);
    res.json({ success: true });
  } catch (err) {
    console.error('updatePlace error:', err);
    res.status(500).json({ error: 'Paikan päivitys epäonnistui' });
  }
});

// DELETE /api/places/:id - poistaa paikan
app.delete('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readData();

    let found = false;
    for (const cityKey of Object.keys(data.cities)) {
      const places = data.cities[cityKey].places;
      const index = places.findIndex(p => p.id === id);
      if (index !== -1) {
        data.cities[cityKey].places.splice(index, 1);
        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ error: `Paikkaa id:llä "${id}" ei löydy` });
    }

    await writeData(data);
    res.json({ success: true });
  } catch (err) {
    console.error('deletePlace error:', err);
    res.status(500).json({ error: 'Paikan poisto epäonnistui' });
  }
});

// Tarjoile frontendin build-tiedostot tuotannossa
if (existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  // Kaikki muut reitit -> index.html (SPA)
  app.get('*', (req, res) => {
    res.sendFile(join(CLIENT_DIST, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Travel Planner käynnissä: http://localhost:${PORT}`);
});
