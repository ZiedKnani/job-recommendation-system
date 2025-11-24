import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

class KaggleNodeService {
  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'kaggle_jobs.json');
  }

  async getDataset() {
    // Essayer de lire les données existantes d'abord
    if (existsSync(this.dataPath)) {
      console.log('📁 Lecture des données existantes...');
      const data = readFileSync(this.dataPath, 'utf8');
      return JSON.parse(data);
    }

    // Sinon, exécuter le script Python
    console.log('🐍 Exécution du script Kaggle...');
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', ['ml-core/kaggle_downloader.py']);

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log(data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error('Python Error:', data.toString());
      });

      pythonProcess.on('close', (code) => {
        if (code === 0 && existsSync(this.dataPath)) {
          const data = readFileSync(this.dataPath, 'utf8');
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Script Python échoué: ${errorOutput}`));
        }
      });
    });
  }
}

export default new KaggleNodeService();