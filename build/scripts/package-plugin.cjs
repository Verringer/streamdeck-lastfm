const { readdirSync, readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { zipSync } = require('fflate');
const { manifestNs } = require('./manifest');

const pluginName = `${manifestNs}.sdPlugin`;
const pluginDirectory = path.resolve(__dirname, '../../dist', pluginName);
const files = {};

const addDirectory = (directory, archiveDirectory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    const destination = path.posix.join(archiveDirectory, entry.name);

    if (entry.isDirectory()) {
      addDirectory(source, destination);
    } else if (entry.isFile()) {
      files[destination] = readFileSync(source);
    }
  }
};

addDirectory(pluginDirectory, pluginName);
writeFileSync(path.resolve(__dirname, `../../${manifestNs}.streamDeckPlugin`), zipSync(files, { level: 9 }));
