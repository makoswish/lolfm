// Alte Spielstände (v6, v10) werden geladen, migriert und laufen eine Saison.
module.exports=`
for(const f of ['save-v6.json','save-v10.json']){
  store[SAVEKEY]=require('fs').readFileSync(require('path').join(__dirname,'fixtures',f),'utf8');load();render();chk(f+' laden');
  for(const v of ['home','squad','tactic','transfer','league','club','inbox','save']){S.view=v;render();chk(f+' '+v)}
  playSeason();nextSeason();chk(f+' neue Saison')}
`;
