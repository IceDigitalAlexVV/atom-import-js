# ImportJS Atom package

This is the Atom package for ImportJS.

## Installing

1. Install the atom-import-js package via Atom's package manager. (apm install https://github.com/IceDigitalAlexVV/atom-import-js.git)

2. [Configure import-js for your
   project](https://github.com/galooshi/import-js#configuration) (there's no need to globally install import-js for the atom plugin)

3. Open the root of your project as a folder (File -> Add Project Folder…)

4. Import a file!

## Default keybindings

By default, atom-import-js attempts to set up the following keybindings:

Mapping       | Action      | Description
--------------|-------------|---------------------------------------------------------------------
`Cmd+Shift+j` | Import word | Import the module for the variable under the cursor.
`Cmd+Shift+i` | Fix imports | Import any missing modules and remove any modules that are not used.
`Cmd+Shift+k` | Go to word  | Go to the module of the variable under the cursor.



******  ================================  *****
Modified:
1. sqlite3:
   - version 5.1.2
   - add x64_library (lib/binding/napi-v6-darwin-unknown-x64)
2. space-pen:
   - modify lib/space-pen.js -> registerElement_function ->
    if ((_base = window.__spacePenCustomElements)[customTagName] != null) {
      _base[customTagName] =customElements.define(customTagName,customHTMLElement)
    }
******  ================================  *****
