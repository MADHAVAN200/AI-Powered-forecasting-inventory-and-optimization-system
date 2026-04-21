import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const defaultCheckoutVisionPython = path.resolve(
    projectRoot,
    '..',
    'Multimodal_classifier',
    '.venv',
    'Scripts',
    'python.exe'
);
const checkoutVisionScript = path.resolve(
    projectRoot,
    'ml',
    'checkout_vision',
    'infer.py'
);
const checkoutVisionTimeoutMs = Number(process.env.CHECKOUT_VISION_TIMEOUT_MS || 120000);

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
    },

    runCheckoutVision: (imagePath) => {
        return new Promise((resolve, reject) => {
            const pythonExecutable =
                process.env.CHECKOUT_VISION_PYTHON || defaultCheckoutVisionPython;

            console.log(`[ML Service] Running checkout vision for: ${imagePath}`);
            const pythonProcess = spawn(pythonExecutable, [checkoutVisionScript, imagePath]);
            let output = '';
            let errorOutput = '';
            let didTimeout = false;

            const timeout = setTimeout(() => {
                didTimeout = true;
                pythonProcess.kill();
            }, checkoutVisionTimeoutMs);

            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
                console.error(data.toString());
            });

            pythonProcess.on('error', (error) => {
                clearTimeout(timeout);
                reject({
                    error: 'Checkout vision process failed to start',
                    details: error.message,
                });
            });

            pythonProcess.on('close', (code) => {
                clearTimeout(timeout);
                let parsedOutput = null;

                try {
                    parsedOutput = JSON.parse(output);
                } catch (error) {
                    parsedOutput = null;
                }

                if (didTimeout) {
                    return reject({
                        error: 'Checkout vision inference timed out',
                        details: `The Python inference process exceeded ${checkoutVisionTimeoutMs} ms.`,
                    });
                }

                if (code !== 0) {
                    return reject({
                        error: parsedOutput?.error || 'Checkout vision inference failed',
                        details: errorOutput || output,
                    });
                }

                if (!parsedOutput?.success) {
                    return reject({
                        error: parsedOutput?.error || 'Checkout vision inference failed',
                        details: errorOutput || output,
                    });
                }

                resolve(parsedOutput.data);
            });
        });
    }
};
