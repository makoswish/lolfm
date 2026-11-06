// Live-Ansicht: kein Eingreifen mehr, Spielstart, Steuerung, Siegchance, Marker, Verfolgen, Nachbereitung.
// Hinweis: Dieser Test steht in einem Template-String, darum keine Backticks im Code.
module.exports=`
function ok(c,msg){if(!c){console.log('FEHLER',msg);bad++}}
function html(){return document.querySelector('#app').innerHTML}
newGame('LYL','Tester');render();chk('Start');
const U=S.teams[S.user];

// Eingreifen ist weg
ok(ACT.ins===undefined&&ACT.bcall===undefined,'Eingreifen-Aktionen existieren noch');

// Siegchance vorab in der Spielvorbereitung
ACT.nav2({v:'home'});ok(userPending(),'Kein Spiel offen');ACT.next();chk('Spielvorbereitung');
ok(html().includes('Siegchance vorab')&&html().includes('Bilanz gegeneinander'),'Siegchance vorab oder Bilanz fehlt');

// Draft, dann Spielstart mit Lane-Vergleich
ACT.kickoff();ACT.dauto();ACT.dok();chk('Spielstart');
ok(LIVE&&LIVE.phase==='intro'&&S.view==='live','Nach dem Draft kein Spielstart-Bildschirm');
ok(html().includes('Lane gegen Lane')&&html().includes('Siegchance')&&html().includes('data-a="gostart"'),'Spielstart ohne Lane-Vergleich, Siegchance oder Knopf');
ok(liveLocked(),'Navigation im Spielstart nicht gesperrt');const v0=S.view;ACT.nav2({v:'squad'});ok(S.view===v0,'Navigation im Spielstart möglich');ACT.qs();ok(!MODAL,'Suche im Spielstart offen');
ACT.tick1();ok(LIVE.sim.t===0,'Spiel läuft vor dem Start');

// Läuft: Kopf, Steuerleiste, drei Bereiche, kein Eingreifen
ACT.gostart();chk('Live');ok(LIVE.phase==='live','Spiel startet nicht');
let h=html();
ok(h.includes('id="lvhead"')&&h.includes('class="lvctl"')&&h.includes('id="lvmap"')&&h.includes('id="lvgraph"')&&h.includes('id="lvfeed"')&&h.includes('id="lvpl"'),'Bereiche der Live-Ansicht fehlen');
ok(h.includes('(du)')&&/class="wa me"|class="wb me"/.test(h),'Siegchance-Leiste markiert die eigene Seite nicht');
ok(h.includes('Highlights')&&h.includes('Nächster Moment')&&h.includes('Zum Ende')&&h.includes('Pause'),'Steuerleiste unvollständig');
ok(!h.includes('Baron callen')&&!h.includes('Anweisung an dein Team'),'Eingreifen-Oberfläche noch da');
ok(LIVE.speed===4,'Standardtempo ist nicht Highlights');

// Takt von Hand, wie der Timer es tut
const z=LIVE.sim;ACT.speed({v:'3'});ok(LIVE.speed===3,'Pause');
while(z.t<12&&!simTick(z));liveRefresh();chk('Nach 12 Minuten');
ok(z.tl.length===z.t+1&&z.tl.every(x=>x.wp>=0&&x.wp<=1),'Siegchance fehlt oder liegt außerhalb von 0 bis 1');
ok(z.ev.every(e=>EVK[e.k]&&e.w===EVK[e.k][0]&&e.t>=1),'Ereignisse ohne Art oder Gewicht');
ok(z.ev.some(e=>e.loc)||z.ev.length===0,'Ereignisse ohne Position');
ok(lvTimers(z).includes('Herold')&&lvTimers(z).includes('Baron'),'Countdown fehlt');
const t0=z.t;ACT.tick1();ok(z.t===t0+1||z.winner>=0,'+1 Minute');

// Nächster Moment bleibt bei einem Highlight stehen
{const n0=z.ev.length;ACT.nextm();ok(z.winner>=0||(z.ev.slice(n0).some(e=>e.w>=2)&&LIVE.speed===3),'Nächster Moment hält nicht an einem Highlight')}
chk('Nach nächstem Moment');

// Verfolgen, Marker, Filter, Reiter
if(LIVE.phase==='live'){
 const pid=z.st[0][2];ACT.pin({id:pid});ok(LIVE.pin===pid&&html().includes('pinb on'),'Verfolgen setzt nichts');
 ACT.lvf({v:'pin'});ok(html().includes('class="on" data-a="lvf" data-v="pin"'),'Filter Spieler nicht aktiv');chk('Filter Spieler');
 const mi=z.ev.findIndex(e=>e.w>=1);if(mi>=0){ok(lvGraph(z).includes('data-pd="evsel" data-i="'+mi+'"'),'Marker fehlt im Graph');ACT.evsel({i:String(mi)});ok(LIVE.sel===mi&&lvGraph(z).includes('Siegchance Blau'),'Marker wählen zeigt keine Details');ACT.evsel({i:String(mi)});ok(LIVE.sel===null,'Marker abwählen')}
 ACT.pin({id:pid});ok(!LIVE.pin&&LIVE.filter!=='pin','Verfolgen aufheben');
 for(const k of ['key','all','hl']){ACT.lvf({v:k});chk('Filter '+k)}
 for(const k of ['map','feed','pl']){ACT.lvtab({v:k});chk('Reiter '+k);ok(html().includes('lvpane')&&LIVE.tab===k,'Reiter '+k)}
 ACT.snd();ok(SND===true,'Ton an');ACT.snd();ok(SND===false,'Ton aus');
}

// Ende und Nachbereitung
ACT.skip();chk('Nach dem Spiel');ok(LIVE.phase==='post','Spiel endet nicht');
{const zz=LIVE.sim,last=zz.tl[zz.tl.length-1];ok(last.wp===(zz.winner===0?1:0),'Siegchance am Ende nicht 0 oder 100');
 ok(zz.ev[zz.ev.length-1].k==='nexus','Letztes Ereignis ist nicht der Nexus')}
h=html();ok(h.includes('Wendepunkt')&&h.includes('Die großen Momente')&&h.includes('Spielfakten'),'Nachbereitung unvollständig');
ok(!h.includes('class="lvctl"'),'Steuerleiste nach dem Spiel noch da');
{const tp=turning(LIVE.sim);ok(tp===null||(tp.t>=1&&tp.t<=LIVE.sim.end&&tp.d>=.04),'Wendepunkt unplausibel')}
ACT.lvtab({v:'map'});chk('Reiter Karte nach dem Spiel');
if(LIVE.series.done)ACT.after();else{ACT.nextgame();ACT.after&&0}
LIVE=null;

// Engine: Siegchance passt zu den Ausgängen
{const T=[];for(const r of REGS)T.push.apply(T,teamsOf(r));let n=0,br20=0,br0=0;
 for(let i=0;i<400;i++){const a=T[ri(0,T.length-1)],b=T[ri(0,T.length-1)];if(a===b)continue;
  const g=newSim(a,b,{gi:1},undefined,false);while(!simTick(g));if(g.end<21)continue;const o=g.winner===0?1:0;n++;br0+=Math.pow(g.tl[0].wp-o,2);br20+=Math.pow(g.tl[20].wp-o,2);
  ok(g.ev.every(e=>EVK[e.k]),'Ereignisart fehlt in Simulation')}
 br0/=n;br20/=n;ok(n>100&&br0<.17&&br20<.15,'Siegchance schlecht kalibriert: Brier vorab '+br0.toFixed(3)+', Minute 20 '+br20.toFixed(3));
 ok(br20<br0,'Siegchance wird mit dem Spielverlauf nicht besser')}
`;
