const { exec } = require('child_process');

const browsers = ['chrome', 'firefox', 'edge'];

const runTests = (browser) => {
  return new Promise((resolve, reject) => {
    console.log(`Starting tests in ${browser}...`);
    exec(`npx cypress run --browser ${browser}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running tests in ${browser}:`, stderr);
        console.error(`Standard output: ${stdout}`);
        reject(error);
      } else {
        console.log(`Tests completed in ${browser}:`, stdout);
        resolve();
      }
    });
  });
};

const runAllTests = async () => {
  for (const browser of browsers) {
    try {
      await runTests(browser);
    } catch (error) {
      console.error(`Failed to run tests in ${browser}:`, error);
    }
  }
  console.log('All tests completed.');
};

runAllTests();