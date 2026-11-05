// Baut eine einzelne HTML-Datei mit eingebettetem CSS und JS: dist/rift-manager.html
// Praktisch, um das Spiel als eine Datei weiterzugeben oder als Claude-Artifact zu veröffentlichen.
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
let h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
h=h.replace('<link rel="stylesheet" href="css/style.css">',()=>'<style>\n'+fs.readFileSync(path.join(ROOT,'css/style.css'),'utf8')+'</style>');
const files=[...h.matchAll(/<script src="([^"]+)"><\/script>\n?/g)];
const js=files.map(m=>fs.readFileSync(path.join(ROOT,m[1]),'utf8')).join('\n');
files.forEach((m,i)=>{h=h.replace(m[0],i===files.length-1?'<script>\n'+js.replace(/<\/script>/g,'<\\/script>')+'</script>\n':'')});
fs.mkdirSync(path.join(ROOT,'dist'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'dist/rift-manager.html'),h);
console.log('dist/rift-manager.html',Math.round(h.length/1024)+' KB');
