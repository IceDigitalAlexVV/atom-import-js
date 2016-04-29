/**
 * @return {Array<String>} projectPath, relativePath
 */
function currentFilePath() {
  const editor = atom.workspace.getActiveTextEditor();
  return atom.project.relativizePath(editor.buffer.file.path);
}

module.exports = currentFilePath;
