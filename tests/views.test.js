// Alle Seiten, Reiter und Menüpunkte rendern ohne Fehler, vor und während der Saison.
module.exports=`
function clickAll(tag){
  for(const g of NAVG)for(const i of g[3]){ACT.nav2({v:i[1],k:i[2]||'',t:i[3]||''});chk(tag+' '+i[1]+'/'+(i[3]||''))}
  for(const c of ['ALL',...Object.keys(MCAT)]){ACT.nav2({v:'inbox'});ACT.ibf({v:c});chk('Postfach '+c)}
  ACT.nav2({v:'save'});chk('Spielstand');
  ACT.player({id:S.teams[S.user].roster[0]});chk('Spielerseite');
}
newGame('LYL','Tester');clickAll('Start');
for(let i=0;i<12;i++)playWeek();clickAll('Woche 12');
reload();clickAll('nach Neuladen');
`;
