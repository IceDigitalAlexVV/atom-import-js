const currentFilePath = require('./currentFilePath');
const Importer = require('import-js');

function getImporter() {
  const editor = atom.workspace.getActiveTextEditor();
  const filePath = currentFilePath();
  return new Importer(editor.getText().split('\n'), filePath[1], filePath[0]);
}

module.exports = getImporter;
