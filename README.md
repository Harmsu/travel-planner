# Harmsun retki Bilbao ja San Sebastián - Matkasuunnittelusovellus

Matkasuunnittelusovellus Bilbaon ja San Sebastiánin matkalle.

## Tuotantoversio (suositeltu)

Kaikki pyörii yhdellä palvelimella:
```
cd server
npm install
cd ../client
npm install
npm run build
cd ../server
npm start
```
Avaa selaimessa: http://localhost:3001

## Kehitystila

Kaksi erillistä palvelinta:
```
# Terminal 1 - Backend
cd server && npm start

# Terminal 2 - Frontend
cd client && npm run dev
```
Frontend: http://localhost:5173

## Salasana

Oletussalasana: `harmsu2026`

Voit vaihtaa ympäristömuuttujalla:
```
APP_PASSWORD=omasalasana npm start
```

## Ominaisuudet
- Kaksi kaupunkia: Bilbao, San Sebastián
- Salasanasuojaus
- Paikkojen hallinta kategorioittain
- Automaattinen Google Maps -linkitys
- Käyty-merkinnät ja muistiinpanot
- Pikalinkkien hallinta (lisäys/poisto)
- Synkronointi kaikkien laitteiden välillä
- Responsiivinen design (mobiili, tabletti, desktop)

## Tekniikka
- Frontend: React + Vite
- Backend: Node.js + Express
- Tietokanta: JSON-tiedosto
