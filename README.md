# GhostKitchen

Jeu de gestion de restaurant en temps réel. Découvrez des recettes dans le lab, achetez des ingrédients au shop, servez les commandes en service et suivez vos performances sur le dashboard.

## Prérequis

- **Node.js** (v18+)
- **MySQL** (v8+)

## Installation

```bash
# Cloner le repo
git clone <url-du-repo>
cd ghostkitchen

# Installer les dépendances serveur
cd server
npm install

# Installer les dépendances client
cd ../client
npm install
```

## Configuration

Créer un fichier `server/.env` à partir de l'exemple :

```bash
cp server/.env.exemple server/.env
```

Puis remplir les valeurs :

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votremotdepasse
DB_NAME=ghostkitchen
JWT_SECRET=une_clef_secrete
```

## Base de données

Créer la base de données et exécuter les migrations dans l'ordre :

```sql
CREATE DATABASE ghostkitchen;
USE ghostkitchen;
```

```bash
mysql -u root -p ghostkitchen < server/src/db/migrations/001_palier1.sql
mysql -u root -p ghostkitchen < server/src/db/migrations/002_palier2.sql
mysql -u root -p ghostkitchen < server/src/db/migrations/003_palier3.sql
```

Puis lancer le seed pour insérer les données initiales (ingrédients, recettes) :

```bash
cd server
node src/db/seed.js
```

## Lancement

Ouvrir deux terminaux :

```bash
# Terminal 1 — Serveur (port 5000)
cd server
npm run dev

# Terminal 2 — Client (port 5173)
cd client
npm run dev
```

L'application est accessible sur **http://localhost:5173**.

## Stack technique

| Couche   | Technologies                                |
|----------|---------------------------------------------|
| Frontend | React 19, Vite, React Router v7, Chart.js, React DnD, Socket.io-client |
| Backend  | Node.js, Express 5, Socket.io, JWT, bcrypt  |
| BDD      | MySQL (mysql2/promise)                      |
