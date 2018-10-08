const { execSync } = require('child_process');
const fs = require('fs');

const files = fs.readdirSync('./bin');

files.filter(f => f.endsWith('.js')).forEach(f => {
  const zip = f.replace(/\.js$/, '.zip');
  console.log(`Zipping ${f} -> ${zip}`);
  execSync(`zip -r ./bin/${zip} ./bin/${f}`);
  console.log(`Zipped ${f} -> ${zip}`);
});
