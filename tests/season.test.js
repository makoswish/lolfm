// Mehrere komplette Saisons, jede Woche speichern und neu laden.
module.exports=`
for(const id of ['LYL','HBD']){newGame(id,'Tester');
  for(let y=0;y<2;y++){let g=0;while(S.phase!=='offseason'&&g++<200){playWeek();chk('Woche');reload();chk('Neuladen')}ACT.next();chk('Neue Saison')}
  if(S.fin.balance<-2e6){console.log('Finanzen entgleist',S.fin.balance);bad++}}
`;
