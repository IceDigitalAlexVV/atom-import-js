const allowUnsafeNewFunction = require('loophole').allowUnsafeNewFunction;

const currentFilePath = require('./currentFilePath');

// import-js depends on eslint, which uses a package called is-my-json-valid
// which uses Function.apply, which Atom's custom CSP forbids. They have
// provided this loophole package to allow this to still work for specified
// packages.
// https://github.com/eslint/eslint/issues/3163
let Importer;
allowUnsafeNewFunction(() => {
  Importer = require('import-js'); // eslint-disable-line global-require
});

function getImporter() {
  const editor = atom.workspace.getActiveTextEditor();
  const filePath = currentFilePath();
  return new Importer(editor.getText().split('\n'), filePath[1], filePath[0]);
}

module.exports = getImporter;
