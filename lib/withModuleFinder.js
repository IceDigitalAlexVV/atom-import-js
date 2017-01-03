const initializeModuleFinder = require('import-js/build/initializeModuleFinder');

const currentFilePath = require('./currentFilePath');

const processedWorkingDirectories = {};

function handleDone(directory, done) {
  processedWorkingDirectories[directory] = true;
  done();
}

function withModuleFinder(done) {
  const workingDirectory = currentFilePath()[0];
  if (processedWorkingDirectories[workingDirectory]) {
    // already initialized for this dir
    done();
    return;
  }
  const doneFunc = handleDone.bind(this, workingDirectory, done);
  initializeModuleFinder(workingDirectory).then(doneFunc).catch((err) => {
    console.error(err); // eslint-disable-line no-console
    doneFunc();
  });
}

module.exports = withModuleFinder;
