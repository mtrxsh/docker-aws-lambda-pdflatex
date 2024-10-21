const {
  spawnChildProcessPromise,
} = require("../child-process/child-process-promise");

async function compilePdfLatex({ inputFile, workdir }) {
  // compile latex files
  // run lualatex twice to make sure all references are resolved
  await spawnChildProcessPromise("lualatex", [inputFile], {
    env: process.env,
    cwd: workdir,
  });
  await spawnChildProcessPromise("lualatex", [inputFile], {
    env: process.env,
    cwd: workdir,
  });
}

module.exports = {
  compilePdfLatex,
};
