// Musik: Muster, Stimmungen, Einstellungen. Ein Audiogerät gibt es im Test nicht, Start und Stopp müssen trotzdem ohne Fehler laufen.
// Hinweis: Dieser Test steht in einem Template-String, darum keine Backticks im Code.
module.exports=`
function ok(c,msg){if(!c){console.log('FEHLER',msg);bad++}}
function html(){return document.querySelector('#app').innerHTML}
newGame('LYL','Tester');render();chk('Start');

// Muster: Noten liegen in der Tonleiter, Dichte wächst mit der Stimmung, Muster sind deterministisch
{const dens=m=>{let n=0;for(let i=0;i<640;i++)if(musNote(i,m)!=null)n++;return n/640};
 const d={calm:dens('calm'),work:dens('work'),tense:dens('tense'),match:dens('match')};
 ok(d.calm<d.work&&d.work<d.tense&&d.tense<d.match,'Dichte steigt nicht mit der Stimmung: '+JSON.stringify(d));
 ok(d.calm>.08&&d.match<.9,'Dichte außerhalb des Rahmens');
 for(let i=0;i<256;i++){const n=musNote(i,'match');if(n!=null){const rel=((n-50-MUSP[Math.floor(i/16)%4][0])%12+12)%12;ok(MUSS.some(s=>s%12===rel),'Note außerhalb der Tonleiter: '+n)}}
 ok(JSON.stringify([...Array(64)].map((_,i)=>musNote(i,'work')))===JSON.stringify([...Array(64)].map((_,i)=>musNote(i,'work'))),'Muster nicht deterministisch');
 ok(musBass(0,'calm')===38&&musBass(1,'calm')==null&&musBass(2,'match')!=null,'Basslinie');
 ok(musDrum(0,'calm').length===0&&musDrum(0,'match').includes('k')&&musDrum(4,'match').includes('c')&&musDrum(2,'tense').includes('h'),'Schlagzeug je Stimmung');
 ok(Object.values(MUSM).every(m=>m.bpm>=70&&m.bpm<=130),'Tempo außerhalb des Rahmens')}

// Stimmung folgt der Ansicht
{S.view='home';ok(musMood()==='calm','Büro ruhig');S.view='squad';ok(musMood()==='work','Kader arbeitsam');S.view='nego';ok(musMood()==='tense','Verhandlung angespannt');S.view='prematch';ok(musMood()==='tense','Vorbereitung angespannt');
 S.view='live';LIVE={phase:'live'};ok(musMood()==='match','Live-Spiel schnell');LIVE={phase:'draft'};ok(musMood()==='tense','Draft angespannt');LIVE=null;S.view='home'}

// Einstellungen: Standard aus, Lautstärke, Speichern, Knopf und Seite
{try{localStorage.removeItem('riftmgr_music')}catch(e){}
 ok(musPref().on===false&&musLabel()==='Aus','Musik startet nicht aus');
 ok(html().includes('data-a="music"'),'Musik-Knopf in der Statusleiste fehlt');
 ACT.music();ok(musPref().on===true&&musLabel()==='Mittel','Einschalten greift nicht: '+musLabel());
 ACT.musvol({v:'3'});ok(musPref().on&&musPref().vol===MUSV[3]&&musLabel()==='Laut','Lautstärke Laut');
 ACT.musvol({v:'1'});ok(musLabel()==='Leise','Lautstärke Leise');
 ACT.musvol({v:'0'});ok(!musPref().on&&musLabel()==='Aus','Ausschalten über die Stufen');
 ACT.nav2({v:'save'});chk('Spielstand');ok(html().includes('Musik')&&html().includes('data-a="musvol"'),'Musik-Karte im Spielstand fehlt');
 ACT.music();ACT.music();ok(!musPref().on,'Doppelter Wechsel');
 ok(musStart()===false,'Start ohne Audiogerät oder bei Aus meldet Erfolg');musStop()}
`;
