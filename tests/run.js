// Startet alle Tests: node tests/run.js  (oder einzelne: node tests/run.js sim views)
const {run}=require('./harness');const fs=require('fs'),path=require('path');
const want=process.argv.slice(2);
const files=fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.js')).filter(f=>!want.length||want.some(w=>f.startsWith(w)));
let bad=0;for(const f of files)bad+=run(require(path.join(__dirname,f)),f.replace('.test.js',''));
console.log(bad?`\n${bad} Probleme gefunden`:'\nAlle Tests bestanden');process.exit(bad?1:0);
