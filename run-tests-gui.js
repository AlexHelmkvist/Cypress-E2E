const { spawn } = require('child_process');

const runCypressGUI = (browser) => {
    return new Promise((resolve, reject) => {
        const command = `npx cypress open --browser ${browser}`;
        const process = spawn(command, { shell: true });

        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        process.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        process.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            if (code === 0) {
                resolve();
            } else {
                reject(`Testkörningen misslyckades i ${browser} med kod ${code}`);
            }
        });
    });
};

const runTestsInBrowsers = async () => {
    try {
        console.log('Öppnar Cypress GUI och kör tester i Chrome...');
        await runCypressGUI('chrome');
        console.log('Stäng Cypress GUI för att fortsätta...');

        console.log('Öppnar Cypress GUI och kör tester i Firefox...');
        await runCypressGUI('firefox');
        console.log('Stäng Cypress GUI för att fortsätta...');

        console.log('Öppnar Cypress GUI och kör tester i Edge...');
        await runCypressGUI('edge');
        console.log('Stäng Cypress GUI för att fortsätta...');

        console.log('Alla tester är klara!');
    } catch (error) {
        console.error(error);
    }
};

runTestsInBrowsers();
