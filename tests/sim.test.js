// Simulationsmodus, Teamaktionen, Spieler-Ereignisse.
module.exports=`
function simAll(k){ACT.simgo({v:k});let g=0;while(SIMRUN&&g++<300)simAdvance();render();chk('Simulation '+k);const r=SIMREP;ACT.simclose({});return r}
newGame('LYL','Tester');S.simStop=false;
for(const k of ['week','w4','event','season']){const r=simAll(k);if(!r){console.log('kein Bericht',k);bad++}}
for(const v of Object.keys(TB)){ACT.tb({v});chk('Teamaktion '+v)}
ACT.next();S.simStop=true;
for(let i=0;i<10&&S.phase!=='offseason';i++){simAll('event');for(const m of S.inbox.filter(m=>!m.done)){if(m.type==='pev')pevAnswer(m,0);else if(m.type==='offer')ACT.offer({id:m.id,ok:'0'})}reload();chk('Neuladen')}
`;
