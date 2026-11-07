// Teamfight-Fokus und Wendepunkt-Clip im Live-Spiel.
// Hinweis: Dieser Test steht in einem Template-String, darum keine Backticks im Code.
module.exports=`
function ok(c,msg){if(!c){console.log('FEHLER',msg);bad++}}
function html(){return document.querySelector('#app').innerHTML}
let sawFocus=0,sawChip=0,zoomVb=0,clips=0;
for(let g=0;g<8&&!(sawFocus&&sawChip&&clips);g++){
 newGame('LYL','Tester');render();ACT.nav2({v:'home'});ACT.next();ACT.kickoff();ACT.dauto();ACT.dok();ACT.gostart();LIVE.speed=3;
 const z=LIVE.sim;let n=0;
 while(LIVE.phase==='live'&&n++<90){ACT.tick1();chk('Minute '+z.t);if(LIVE.phase!=='live')break;const h=html();
  if(fightFocus(z)){sawFocus++;ok(/class="mmap fight"/.test(h),'Fokus ohne Fight-Karte');ok(!/viewBox="0 0 100 100" class="mmap fight"/.test(h),'Fokus zoomt nicht');zoomVb++}
  if(h.includes('clipchip'))sawChip++}
 ok(z.fr&&Object.keys(z.fr).length>=z.t-1,'Bilder pro Minute fehlen: '+(z.fr&&Object.keys(z.fr).length)+' von '+z.t);
 if(LIVE.phase!=='live'||z.winner>=0){ACT.skip();chk('Ende')}
 const L=tpList(z);
 if(L.length){clips++;const t=L[0].t;ACT.clip({t:String(t)});chk('Clip');ok(MODAL&&MODAL.clip&&MODAL.clip.frames.length>=2,'Clip ohne Bilder');
  ok(html().includes('id="clipbody"')&&html().includes('Wendepunkt · Minute '+t),'Clip-Fenster fehlt');ok(ovOpen(),'Overlay nicht als offen erkannt');
  const c=MODAL.clip;ok(!c.play||c.frames.length>0,'Clip-Zustand');
  ACT.clipgo({i:String(c.frames.length-1)});ok(MODAL.clip.i===c.frames.length-1,'Sprung im Clip');ok(html().includes('Kills '),'Kills fehlen im Clip');
  ACT.clipplay();ACT.clipplay();ACT.clipclose();ok(!MODAL,'Clip schließt nicht');chk('Nach Clip')}
 if(LIVE.phase==='post'){render();if(L.length)ok(html().includes('Clip ansehen'),'Clip-Knopf in der Nachbereitung fehlt')}
}
ok(sawFocus>0,'Nie ein Teamfight-Fokus gesehen');ok(clips>0,'Nie einen Wendepunkt für den Clip gefunden');
ok(typeof fightFx==='function'&&fightFx({loc:[40,40],side:0,k:'fight',big:false,dk:[2,1]}).includes('+3'),'Kill-Zahl fehlt im Effekt');
`;
