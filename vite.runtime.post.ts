// run this with ts-node after vite build of runtime
const fs = require("fs");
const path = require("path");

// Directory path
const dirPath = path.join(__dirname, 'dist', 'plugins', 'assets');

// Read directory
fs.readdir(dirPath, (err, files) => {
  if (err) {
    console.error('Could not list the directory.', err);
    process.exit(1);
  }

  // Filter JS files
  const jsFiles = files.filter(file => path.extname(file) === '.js');

  console.log(jsFiles)

  if (jsFiles.length !== 1 ) {
    console.error('Could not find the runtime file.');
    process.exit(1);
  }

  const htmlPath = path.join(__dirname, 'dist', 'plugins', 'runtime.html');
  const content = fs.readFileSync(htmlPath, 'utf8').replace("runtime.tsx", `assets/${jsFiles[0]}`);
  fs.writeFileSync(htmlPath, content, 'utf8');

});