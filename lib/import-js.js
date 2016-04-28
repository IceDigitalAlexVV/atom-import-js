'use strict';

const CompositeDisposable = require('atom').CompositeDisposable;
const allowUnsafeNewFunction = require('loophole').allowUnsafeNewFunction;

// import-js depends on eslint, which uses a package called is-my-json-valid
// which uses Function.apply, which Atom's custom CSP forbids. They have
// provided this loophole package to allow this to still work for specified
// packages.
// https://github.com/eslint/eslint/issues/3163
let Importer;
allowUnsafeNewFunction(() => {
  Importer = require('import-js');
});

const AskForSelectionView = require('./AskForSelectionView');

/**
 * @return {Array<String>} projectPath, relativePath
 */
function currentFilePath() {
  const editor = atom.workspace.getActiveTextEditor();
  return atom.project.relativizePath(editor.buffer.file.path);
}

function importer() {
  const editor = atom.workspace.getActiveTextEditor();
  return new Importer(editor.getText().split('\n'), currentFilePath()[1]);
}

/**
 * Runs the given function within the project's current working directory.
 * @param {Function} thunk
 * @return {*}
 */
function inCurrentWorkingDirectory(thunk) {
  const originalCwd = process.cwd();
  process.chdir(currentFilePath()[0]);
  const result = thunk();
  process.chdir(originalCwd);
  return result;
}

/**
 * @return {String} The word under the cursor
 */
function getCurrentWord() {
  const editor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    return undefined;
  }

  const cursor = editor.getLastCursor();
  if (!cursor) {
    return undefined;
  }

  const wordRange = cursor.getCurrentWordBufferRange();
  return editor.getTextInBufferRange(wordRange);
}

/**
 * @param {Object} selections
 */
function addImports(selections) {
  const result = inCurrentWorkingDirectory(() => (
    importer().addImports(selections)
  ));

  handleImporterResult(result); // eslint-disable-line no-use-before-define
}

/**
 * @param {Object} selectionsToAskFor
 * @param {Object} previousSelections
 */
function askForSelections(selectionsToAskFor, previousSelections) {
  const selections = previousSelections || {};

  if (Object.keys(selectionsToAskFor).length === 0) {
    // We have no more selections to ask for, so we can wrap it up!
    if (Object.keys(selections).length === 0) {
      // No selections were chosen.
      return undefined;
    }

    addImports(selections);
    return undefined;
  }

  // Ask for the next selection
  const wordToAskFor = Object.keys(selectionsToAskFor)[0];
  const alternatives = selectionsToAskFor[wordToAskFor];
  const remainingSelectionsToAskFor = selectionsToAskFor;
  delete remainingSelectionsToAskFor[wordToAskFor];

  // TODO show what word we are asking for
  const askView = new AskForSelectionView();
  askView.setItems(alternatives);
  askView.show();
  askView.deferred
    .then((resolved) => {
      selections[wordToAskFor] = resolved.importPath;
      return selections;
    })
    // Selection was cancelled, so let's just move on.
    .catch(() => selections)
    .then((newSelections) => {
      askView.destroy();
      askForSelections(remainingSelectionsToAskFor, newSelections);
    });

  return undefined;
}

/**
 * @param {Object} result
 */
function processResultMessages(result) {
  if (result.messages && result.messages.length) {
    // TODO come up with a better solution for this potential wall of text that
    // can happen when fixing a lot of imports.
    atom.notifications.addSuccess(result.messages.join('\n'));
  }
}

/**
 * @param {Object} result
 * @param {Array} result.messages
 * @param {String} result.fileContent
 * @param {Object} result.unresolvedImports
 */
function handleImporterResult(result) {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor.getText() !== result.fileContent) {
    editor.buffer.setTextViaDiff(result.fileContent);
  }

  processResultMessages(result);

  if (Object.keys(result.unresolvedImports).length) {
    askForSelections(result.unresolvedImports, []);
  }
}

function importWord() {
  const word = getCurrentWord();
  if (!word) {
    return;
  }

  const result = inCurrentWorkingDirectory(() => importer().import(word));
  handleImporterResult(result);
}

function fixImports() {
  // import-js depends on eslint, which uses a package called is-my-json-valid
  // which uses Function.apply, which Atom's custom CSP forbids. They have
  // provided this loophole package to allow this to still work for specified
  // packages.
  // https://github.com/eslint/eslint/issues/3163
  let result;
  allowUnsafeNewFunction(() => {
    result = inCurrentWorkingDirectory(() => importer().fixImports());
  });
  handleImporterResult(result);
}

function gotoWord() {
  const word = getCurrentWord();
  if (!word) {
    return;
  }

  const result = inCurrentWorkingDirectory(() => importer().goto(word));

  // might need to get cwd
  atom.open({ pathsToOpen: [result.goto], newWindow: false });

  processResultMessages(result);
}

const ImportJS = {
  config: {
    binary: {
      title: 'Binary path',
      description: 'Path for import-js',
      type: 'string',
      default: 'import-js',
      order: 1,
    },
  },

  subscriptions: null,

  activate() {
    this.subscriptions = new CompositeDisposable;
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'import-js:import': () => importWord(),
      'import-js:goto': () => gotoWord(),
      'import-js:fix-imports': () => fixImports(),
    }));
  },

  /**
   * @return {*}
   */
  deactivate() {
    this.subscriptions.dispose();
  },

  /**
   * @return {Object}
   */
  serialize() {
    return {};
  },
};

module.exports = ImportJS;
