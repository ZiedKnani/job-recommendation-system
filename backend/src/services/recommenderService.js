import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Call Python ML model to get recommendations
 */
export const recommendJobs = (profileText, topN = 10) => {
  return new Promise((resolve, reject) => {
    // Path to the Python ML core
    const pythonScriptPath = path.join(__dirname, '../../ml-core/recommender.py');
    
    console.log(`Calling Python ML model with: ${profileText.substring(0, 50)}...`);
    
    const pythonProcess = spawn('python', [pythonScriptPath, profileText, topN.toString()]);

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process error (code ${code}):`, errorOutput);
        reject(new Error(`ML model failed: ${errorOutput}`));
        return;
      }

      try {
        const recommendations = JSON.parse(result);
        
        // Check if Python returned an error
        if (recommendations.error) {
          reject(new Error(recommendations.error));
          return;
        }
        
        console.log(`ML model returned ${recommendations.length} recommendations`);
        resolve(recommendations);
      } catch (parseError) {
        console.error('Failed to parse Python output:', parseError);
        reject(new Error(`Invalid response from ML model: ${parseError.message}`));
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      reject(new Error(`Python not available: ${error.message}`));
    });
  });
};

/**
 * Train the ML model (can be called via API if needed)
 */
export const trainModel = () => {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, '../../ml-core/model_trainer.py');
    
    const pythonProcess = spawn('python', [pythonScriptPath]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Model training failed: ${errorOutput}`));
        return;
      }
      resolve({ message: 'Model trained successfully', output });
    });
  });
};