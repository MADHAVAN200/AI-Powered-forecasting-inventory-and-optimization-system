import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const mlService = {
    triggerTraining: (driverScriptPath) => {
        return new Promise((resolve, reject) => {
            console.log(`[ML Service] Triggering: ${driverScriptPath}`);
            const pythonProcess = spawn('python', [driverScriptPath]);
            let output = '';
            let errorOutput = '';

            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
                console.log(data.toString());
            });

            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
                console.error(data.toString());
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error(`[ML Service] Script exited with code ${code}`);
                    return reject({ error: 'Model training failed', details: errorOutput });
                }
                console.log(`[ML Service] Script finished successfully.`);
                resolve({ success: true, message: 'Training completed successfully', output });
            });
        });
    }
};
