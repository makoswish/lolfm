// Komfortfunktionen: Rückfrage vor Entlassungen, Transfermarkt-Suche und Sortierung,
// Vertragsübersicht, Speicherplätze und Browser-Verlauf.
module.exports=`
function ok(c,msg){if(!c){console.log('FEHLER',msg);bad++}}
newGame('LYL','Tester');render();chk('Start');

// Entlassen fragt erst nach
const U=S.teams[S.user],bank=U.roster.map(i=>S.players[i]).find(p=>!isStarter(p));
const bal=S.fin.balance;
ACT.release({id:bank.id});chk('Rückfrage Spieler');
ok(MODAL&&MODAL.cf&&U.roster.includes(bank.id)&&S.fin.balance===bal,'Entlassen ohne Rückfrage');
ok(document.querySelector('#app').innerHTML.includes('data-ok="1"'),'Rückfrage nicht sichtbar');
ACT.cfno();ok(!MODAL&&U.roster.includes(bank.id),'Abbrechen entlässt trotzdem');
ACT.release({id:bank.id,ok:'1'});chk('Spieler entlassen');
ok(!U.roster.includes(bank.id)&&S.fin.balance<bal&&!MODAL,'Entlassen nach Bestätigung klappt nicht');
const st=S.staffs.find(s=>s.role!=='hc');
if(st){ACT.stfire({id:st.id});ok(S.staffs.includes(st)&&MODAL&&MODAL.cf,'Trainer ohne Rückfrage entlassen');
  ACT.stfire({id:st.id,ok:'1'});ok(!S.staffs.includes(st),'Trainer nach Bestätigung noch da');chk('Trainer entlassen')}

// Transfermarkt
ACT.nav2({v:'transfer',k:'TTAB',t:'markt'});
for(const k of Object.keys(MSORT)){FILT.sort=k;render();chk('Sortierung '+k)}
const other=Object.values(S.players).find(p=>p.team&&p.team!==S.user&&p.team!==acaId()&&S.teams[p.team].tier!==2);
FILT.sort='ovr';FILT.q=other.name.slice(0,4).toUpperCase();render();chk('Suche');
ok(document.querySelector('#app').innerHTML.includes('data-id="'+other.id+'"'),'Suche findet Spieler nicht');
FILT.q=S.teams[other.team].name;render();ok(document.querySelector('#app').innerHTML.includes('data-id="'+other.id+'"'),'Suche nach Team findet Spieler nicht');
FILT.q='<script>';render();chk('Suche mit Sonderzeichen');ok(!document.querySelector('#app').innerHTML.includes('value="<script>'),'Suchtext nicht maskiert');
FILT.q='';ACT.faff();chk('Nur bezahlbar');
const shown=[...document.querySelector('#app').innerHTML.matchAll(/class="row" data-a="player" data-id="([^"]+)"/g)].map(m=>m[1]);
ok(shown.length&&shown.every(id=>canAfford(S.players[id])),'Nur bezahlbar zeigt zu teure Spieler');
ACT.faff();const n0=FILT.n;ACT.fmore();ok(FILT.n===n0+40,'Mehr zeigen');chk('Mehr zeigen');
const fa=S.players[S.fa[0]];ok(askFor(fa)===0,'Vereinslose kosten Ablöse');

// Vertragsübersicht
ACT.nav2({v:'squad',k:'KTAB',t:'vert'});chk('Verträge');
const html=document.querySelector('#app').innerHTML;
for(const [p] of squadAll())ok(html.includes('data-id="'+p.id+'"'),'Vertrag fehlt: '+p.name);
const exp=squadAll().find(([p])=>p.contract<=2);
if(exp){ok(html.includes('data-a="nego" data-t="renew" data-id="'+exp[0].id+'"'),'Verlängern fehlt');
  ACT.nego({t:'renew',id:exp[0].id});ok(S.view==='nego'||S.view==='player','Verlängern öffnet nichts');chk('Verlängern aus Übersicht');if(NG)ACT.ngleave()}

// Speicherplätze
ok(SLOT===1&&slotInfo(1)&&slotInfo(1).team===U.name,'Platz 1 ohne Kurzinfo');
const y1=S.year,t1=S.user;
ACT.mainmenu();chk('Hauptmenü');ok(S===null&&document.querySelector('#app').innerHTML.includes('data-a="slotload" data-v="1"'),'Hauptmenü ohne Laden-Knopf');
ok(document.querySelector('#app').innerHTML.includes('Spielstände'),'Startbildschirm zeigt keine Spielstände');
ok(freeSlot()===2,'Freier Platz falsch');
ACT.pickteam({id:'BBS'});chk('Neues Spiel in Platz 2');
ok(SLOT===2&&S.user==='BBS'&&slotInfo(1).team===S.teams[t1].name,'Platz 1 überschrieben');
ACT.nav2({v:'save'});chk('Spielstand-Seite');
ACT.slotload({v:'1'});chk('Platz 1 laden');ok(SLOT===1&&S.user===t1&&S.year===y1,'Laden von Platz 1');
ACT.slotdel({v:'2'});ok(MODAL&&MODAL.cf&&slotInfo(2),'Löschen ohne Rückfrage');
ACT.slotdel({v:'2',ok:'1'});ok(!slotInfo(2)&&localStorage.getItem(slotKey(2))===null,'Platz 2 nicht gelöscht');
ACT.slotdel({v:'1',ok:'1'});ok(slotInfo(1)&&S,'Aktiver Platz darf nicht gelöscht werden');
initSlot();ok(SLOT===1,'Aktiver Platz nach Neustart');

// Browser-Verlauf
const H=[];globalThis.history={pushState(s){H.push(s)},replaceState(s){H.length=0;H.push(s)}};
HKEY=null;ACT.nav2({v:'home'});ACT.nav2({v:'squad',k:'KTAB',t:'attr'});ACT.player({id:U.roster[0]});
ok(H.length===3&&H[2].v==='player','Verlauf schreibt keine Einträge');
histPop(H[1]);chk('Zurück zum Kader');ok(S.view==='squad'&&KTAB==='attr','Zurück landet falsch');
histPop(H[0]);ok(S.view==='home','Zurück zur Übersicht');
histPop(H[2]);ok(S.view==='player'&&PV&&PV.id===U.roster[0],'Vorwärts zur Spielerseite');
ACT.release({id:U.roster[U.roster.length-1]});histPop(H[0]);ok(!MODAL&&S.view==='player','Zurück schließt Rückfrage nicht');
delete globalThis.history;
`;
