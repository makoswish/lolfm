// Übersicht mit Aufgabenliste und Schnellsuche.
module.exports=`
function ok(c,msg){if(!c){console.log('FEHLER',msg);bad++}}
function html(){return document.querySelector('#app').innerHTML}
newGame('LYL','Tester');render();chk('Start');
const U=S.teams[S.user];

// Aufgabenliste
ACT.nav2({v:'home'});chk('Übersicht');ok(html().includes('Zu erledigen'),'Aufgabenliste fehlt');
const base=todoItems().length;
S.fin.balance=-1000;ok(todoItems().some(x=>x.lvl==='bad'&&/Minus/.test(x.txt)),'Konto im Minus nicht gemeldet');S.fin.balance=500000;
const st=S.players[U.starters.MID];st.out={until:S.step+3,why:'Burnout'};ok(todoItems().some(x=>/fällt aus/.test(x.txt)),'Ausfall nicht gemeldet');st.out=null;
const p0=S.players[U.roster[0]];p0.load=90;ok(todoItems().some(x=>/überlastet/.test(x.txt)),'Überlastung nicht gemeldet');p0.load=20;
S.inbox.unshift({id:S.mailId++,when:'x',title:'Angebot für Test',body:'x',type:'offer',done:false,pid:p0.id,from:'BBS',fee:1,exp:S.step+2});
ok(todoItems().some(x=>/Entscheidung/.test(x.txt)),'Offene Entscheidung nicht gemeldet');S.inbox.shift();
{const L=todoItems(),order=['bad','warn','info'];render();chk('Übersicht mit Aufgaben');ok(L.every(x=>x.attrs&&x.btn&&x.txt),'Aufgabe ohne Ziel')}
ok(!html().includes('1 neue Top-Berichte'),'Grammatik Berichte');

// Schnellsuche
ACT.qs();ok(MODAL&&MODAL.qs,'Schnellsuche öffnet nicht');chk('Schnellsuche offen');ok(html().includes('qsin'),'Eingabefeld fehlt');
ok(QS.items.length>=5&&QS.items.every(x=>x.k==='page'),'Leere Suche zeigt keine Seiten');
const pl=Object.values(S.players).find(p=>p.team&&p.team!==S.user&&p.team!==acaId());
QS.q=pl.name.slice(0,4);let it=qsItems(QS.q);ok(it.some(x=>x.k==='player'&&x.id===pl.id),'Spielersuche findet Spieler nicht');
QS.q=U.name.slice(0,5);it=qsItems(QS.q);ok(it.some(x=>x.k==='team'&&x.id===U.id),'Teamsuche findet Team nicht');
QS.q='transfer';it=qsItems(QS.q);ok(it.length&&it[0].k==='page'&&it[0].label.toLowerCase().includes('transfer'),'Seitensuche: Treffer nach vorn');
QS.q='<script>';it=qsItems(QS.q);ok(Array.isArray(it),'Sonderzeichen');QS.items=it;ok(!qsHtml().includes('<script>'),'Suchtext nicht maskiert');
QS.q='zzzzqq';ok(qsItems(QS.q).length===0&&qsHtml().includes('Nichts gefunden'),'Leerer Treffer');
QS.q='verträge';QS.items=qsItems(QS.q);ACT.qsgo({i:0});ok(S.view==='squad'&&KTAB==='vert'&&!MODAL,'Seitensprung zu Verträge');chk('Sprung Seite');
ACT.qs();QS.q=pl.name;QS.items=qsItems(QS.q);const ix=QS.items.findIndex(x=>x.k==='player'&&x.id===pl.id);ACT.qsgo({i:ix});ok(S.view==='player'&&PV&&PV.id===pl.id,'Sprung zum Spieler');chk('Sprung Spieler');
ACT.qs();QS.q=teamsOf('LEC').find(t=>t.id!==S.user).name;QS.items=qsItems(QS.q);ACT.qsgo({i:QS.items.findIndex(x=>x.k==='team')});ok(MODAL&&MODAL.team,'Sprung zum Team');chk('Sprung Team');ACT.close();
// gesperrt im Live-Spiel
ACT.nav2({v:'home'});const pend=userPending();if(pend){ACT.next();ACT.kickoff();ok(LIVE&&LIVE.phase==='draft','Draft startet nicht');MODAL=null;ACT.qs();ok(!MODAL,'Schnellsuche im Draft offen');ACT.quick&&0}

// Übersicht in der Saisonpause
newGame('LYL','Tester');{let g=0;while(S.phase!=='offseason'&&g++<200)playWeek()}
ACT.nav2({v:'home'});chk('Übersicht Saisonpause');ok(html().includes('Saisonbilanz')&&html().includes('Zu erledigen'),'Saisonpause: Bilanz oder Aufgaben fehlen');
`;
