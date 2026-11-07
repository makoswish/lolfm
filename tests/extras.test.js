// Zusatzfeatures: Transferfenster, Charakter, Presse, Medienrechte, Luxussteuer, Fusion, Verlauf, Glossar.
// Hinweis: Dieser Test steht in einem Template-String, darum keine Backticks im Code.
module.exports=`
function ok(c,msg){if(!c){console.log('FEHLER',msg);bad++}}
function html(){return document.querySelector('#app').innerHTML}
newGame('LYL','Tester');render();chk('Start');

// Transferfenster
{ok(winOpen(),'Zu Beginn ist das Fenster offen');
 const r=S.ev.round;S.ev.stage='rr';S.ev.round=5;S.ev.id='S2';
 ok(!winOpen(),'Fenster mitten im Split geschlossen');
 const q=Object.values(S.players).find(p=>p.team&&p.team!==S.user&&!isMine(p));
 ok(startNego('buy',q.id)===false&&/Transferfenster/.test(PV.msg),'Kauf bei geschlossenem Fenster nicht blockiert');
 ACT.nav2({v:'transfer',k:'TTAB',t:'markt'});chk('Markt');ok(html().includes('Transferfenster geschlossen'),'Banner fehlt');
 S.ev.round=0;S.ev.id='S1';ok(winOpen(),'Fenster offen in Woche 1');}

// Charakter und Gespräch
{const U=S.teams[S.user],ps=U.roster.map(i=>S.players[i]),kinds=new Set(ps.map(persOf));
 ok(ps.every(p=>PERS[persOf(p)]),'Unbekannter Charakter');
 const all=Object.values(S.players).slice(0,300).map(persOf);ok(new Set(all).size>=4,'Zu wenig Vielfalt bei Charakteren');
 const p=ps[0];p.pers='merc';const a=demandFor(p,false);p.pers='pro';const b=demandFor(p,false);ok(a>b,'Söldner verlangen nicht mehr: '+a+' gegen '+b);
 p.morale=50;delete p.talked;ACT.talk({id:p.id});ok(p.morale>50,'Gespräch ohne Wirkung');const m1=p.morale;ACT.talk({id:p.id});ok(p.morale===m1,'Zweites Gespräch sofort möglich');
 PV={id:p.id,tab:'vertrag',back:'squad'};S.view='player';render();chk('Spielerseite');ok(html().includes('Einzelgespräch'),'Charakter-Panel fehlt');
 // Hitzkopf auf der Bank wird unzufrieden, Führungsspieler hebt andere
 const bench=ps.find(x=>!Object.values(U.starters).includes(x.id));bench.pers='hot';bench.morale=70;persWeek();ok(bench.morale<70,'Hitzkopf auf der Bank bleibt gelassen');}

// Pressekonferenz, Ex-Profi, Medienrechte als Postfach-Entscheidung
{const E=PEV.press;mail(E.t(),E.b(),{type:'pev',k:'press',done:false,exp:99});const m=S.inbox[0];const f0=S.fin.fans;pevAnswer(m,0);ok(m.done&&m.result,'Pressekonferenz ohne Ergebnis');
 const e=Object.values(S.players)[0];mail(PEV.expro.t(e),PEV.expro.b(e),{type:'pev',k:'expro',pid:e.id,done:false,exp:99});const m2=S.inbox[0];const b0=S.fin.balance;pevAnswer(m2,0);ok(S.fin.balance<b0&&S.campBoost>=S.step,'Gastcoach kostet nichts oder wirkt nicht');
 S.media=null;const l0=lsh();mail(PEV.media.t(),PEV.media.b(),{type:'pev',k:'media',done:false,exp:99});pevAnswer(S.inbox[0],1);
 ok(S.media&&S.media.f===1.06&&mediaF()===1.06&&lsh()>l0,'3-Jahres-Vertrag wirkt nicht auf die Ausschüttung: '+lsh()+' gegen '+l0);
 S.media={f:1.2,until:S.year-1};ok(mediaF()===1,'Abgelaufener Medienvertrag wirkt noch');}

// Luxussteuer
{const U=S.teams[S.user];ok(luxExcess()===0||luxExcess()>0,'Luxus-Rechnung');const p=S.players[U.roster[0]],s0=p.salary;p.salary=s0+luxCap(U.reg);
 ok(luxExcess()>0,'Überschreitung nicht erkannt');const b0=S.fin.balance;luxWeek();ok(S.fin.balance<b0,'Luxussteuer nicht gebucht');p.salary=s0;
 ACT.nav2({v:'league',k:'LTAB',t:'lage'});chk('Liga-Lage');ok(html().includes('Luxussteuer'),'Luxussteuer-Karte fehlt');}

// Fusion: zwei kriselnde Klubs, der schwächere zieht sich zurück, der stärkere übernimmt
{const r='LEC',L=teamsOf(r).filter(t=>t.id!==S.user).sort((a,b)=>b.rep-a.rep),A=L[L.length-3],B=L[L.length-1];A.rep=Math.min(A.rep,60);B.rep=Math.min(B.rep,55);A.rep=Math.max(A.rep,B.rep+1);
 A.fs=BK_CRISIS;B.fs=BK_CRISIS;for(const t of L)if(t!==A&&t!==B)t.fs=0;const n0=teamsOf(r).length,aid=A.id;for(let k=0;k<60&&B.tier!==2;k++){A.fs=BK_CRISIS;B.fs=BK_CRISIS;mergeSeason()}
 ok(B.tier===2&&teamsOf(r).length===n0&&!teamsOf(r).includes(B),'Fusion greift nicht');ok(A.roster.length<=MAXR&&A.roster.length>=5,'Kader nach Fusion ungültig');
 ok(S.news.some(n=>/übernimmt die besten Spieler/.test(n.t)),'Keine Fusions-News');}

// Verlauf und Glossar
{ACT.nav2({v:'trend'});chk('Verlauf');ok(html().includes('Verlauf'),'Verlauf-Seite fehlt');
 playSeason();chk('Saison 1');ok(S.trend&&S.trend.length===1,'Kein Verlaufseintrag');ok(S.inbox.some(m=>m.k==='media'),'Kein Medienrechte-Angebot am Saisonende');
 nextSeason();playSeason();chk('Saison 2');ok(S.trend.length>=2,'Zweiter Eintrag fehlt');ACT.nav2({v:'trend'});chk('Verlauf 2');ok(html().includes('<svg'),'Diagramm fehlt');
 ACT.nav2({v:'help'});chk('Hilfe');ok(html().includes('Transferfenster'),'Glossar fehlt');}

// Benannte Spielstände
{save();ACT.slotname({v:String(SLOT),name:'Meisterjahr'});ok(slotName(SLOT)==='Meisterjahr','Name nicht gespeichert');
 ok(slotList().includes('Meisterjahr'),'Name nicht in der Liste');ACT.slotname({v:String(SLOT),name:''});ok(!slotName(SLOT),'Name nicht entfernt');}
`;
