import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function localDataPlugin() {
  const dataDir = path.resolve(__dirname, 'data');
  const gamesFile = path.resolve(dataDir, 'games.json');
  const quizFile = path.resolve(dataDir, 'quizResults.json');

  return {
    name: 'local-data-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/api/games' && req.method === 'GET') {
          if (!fs.existsSync(gamesFile)) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify([]));
            return;
          }
          const data = fs.readFileSync(gamesFile, 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
          return;
        }

        if (req.url === '/api/save-game' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            if (!fs.existsSync(dataDir)) {
              fs.mkdirSync(dataDir, { recursive: true });
            }
            let games = [];
            if (fs.existsSync(gamesFile)) {
              try {
                games = JSON.parse(fs.readFileSync(gamesFile, 'utf-8'));
              } catch (e) {}
            }
            try {
              const newGame = JSON.parse(body);
              games.unshift(newGame);
              games = games.slice(0, 50);
              fs.writeFileSync(gamesFile, JSON.stringify(games, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        if (req.url === '/api/quiz-results' && req.method === 'GET') {
          if (!fs.existsSync(quizFile)) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({}));
            return;
          }
          const data = fs.readFileSync(quizFile, 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
          return;
        }

        if (req.url === '/api/save-quiz' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            if (!fs.existsSync(dataDir)) {
              fs.mkdirSync(dataDir, { recursive: true });
            }
            let quizResults: Record<string, any> = {};
            if (fs.existsSync(quizFile)) {
              try {
                quizResults = JSON.parse(fs.readFileSync(quizFile, 'utf-8'));
              } catch (e) {}
            }
            try {
              const payload = JSON.parse(body);
              const { userId } = payload;
              if (!userId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'userId is required' }));
                return;
              }
              quizResults[userId] = payload;
              fs.writeFileSync(quizFile, JSON.stringify(quizResults, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), localDataPlugin()],
  server: {
    port: 3000,
    open: true,
  },
});
