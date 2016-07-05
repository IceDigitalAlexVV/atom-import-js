const WatchmanFileCache = require('import-js/build/WatchmanFileCache');

const currentFilePath = require('./currentFilePath');

const processedWorkingDirectories = {};

function handleWatchmanDone(directory, done) {
  processedWorkingDirectories[directory] = true;
  done();
}

function withWatchmanCache(done) {
  const workingDirectory = currentFilePath()[0];
  if (processedWorkingDirectories[workingDirectory]) {
    // already initialized for this dir
    done();
    return;
  }
  const doneFunc = handleWatchmanDone.bind(this, workingDirectory, done);
  WatchmanFileCache.getForWorkingDirectory(workingDirectory).initialize()
    .then(doneFunc)
    .catch(doneFunc);
}

module.exports = withWatchmanCache;
