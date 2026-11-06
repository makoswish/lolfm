// Welt: Meta, Verletzungen, Berater, Manager-Ruf, Fans, Liga-Ereignisse, Karriereende, Rückblick.
// Hinweis: Dieser Test steht in einem Template-String, darum keine Backticks im Code.
module.exports=`
function ok(c,msg){if(!c){console.log('FEHLER',msg);bad++}}
function html(){return document.querySelector('#app').innerHTML}
newGame('LYL','Tester');render();chk('Start');
const U=S.teams[S.user];

// Meta: Stil und Rolle, Wirkung in der Teamstärke, Hotfix
ok(S.mst&&SK.includes(S.mst.style)&&ROLES.includes(S.mst.role),'Meta fehlt');
{const T=Object.values(S.teams).find(t=>t.tier!==2&&t.id!==S.user);T.style=S.mst.style;const a=teamPower(T);S.mst.style=SK.find(k=>k!==T.style);const b=teamPower(T);
 ok(Math.abs((a.e+a.m+a.l)-(b.e+b.m+b.l)-3)<.01,'Stil-Meta wirkt nicht mit +1 je Phase')}
{const m0=S.meta.slice();S.step=3;S.ev={type:'split'};const n0=S.inbox.length;hotfix();ok(S.meta.length===m0.length&&S.meta.some(c=>!m0.includes(c)),'Hotfix ändert das Meta nicht');ok(S.inbox.length>n0,'Hotfix ohne Mail');S.ev=null;S.step=0}
ACT.nav2({v:'tactic'});ok(html().includes('Stil-Meta'),'Meta nicht in der Taktikansicht');

// Verletzung und Reha
{const p=S.players[U.starters.MID];p.out=null;p.load=100;let n=0;while(!isOut(p)&&n++<4000){for(const id of U.roster){const q=S.players[id];if(q!==p)q.out={until:99,why:'Pause'}}injWeek();}
 ok(isOut(p)&&p.out.why==='Verletzung'&&p.out.wk>=1,'Keine Verletzung nach vielen Wochen');
 p.out.until=S.step+4;p.out.reha=false;S.fin.balance=500000;const u0=p.out.until,b0=S.fin.balance;ok(rehaWhy(p)===null,'Reha nicht möglich');
 ACT.player({id:p.id,tab:'vertrag'});ok(html().includes('data-a="reha"'),'Reha-Knopf fehlt');ACT.reha({id:p.id});ok(p.out.until===u0-1&&S.fin.balance===b0-rehaCost(p),'Reha wirkt nicht');ok(rehaWhy(p)==='Reha läuft bereits.','Reha doppelt möglich');chk('Reha');
 for(const id of U.roster)S.players[id].out=null}

// Berater
{const p=Object.values(S.players).find(x=>x.team&&x.team!==S.user&&S.teams[x.team].tier!==2);const a=agentOf(p);ok(a&&AGT[a.t],'Berater fehlt');
 ok(agentOf(p).n===a.n,'Berater nicht stabil');ok(agF(p,true)===1&&agF(S.players[U.starters.TOP],false)===1,'Eigene Spieler und Verlängerung ohne Berater-Aufschlag');
 for(const k of ['h','f','v']){p.ag.t=k;ok(agF(p,false)===AGT[k][1],'Berater-Faktor '+k)}
 ACT.player({id:p.id,tab:'vertrag'});chk('Spielerseite Berater');ok(html().includes('Berater'),'Berater nicht sichtbar')}

// Manager-Ruf
{S.mrep=30;const n0=signNeed(Object.values(S.players).find(x=>x.team&&x.team!==S.user));S.mrep=90;const n1=signNeed(Object.values(S.players).find(x=>x.team&&x.team!==S.user));ok(n1<n0,'Manager-Ruf senkt die Ruf-Hürde nicht');
 S.mrep=30;S.summary={place:1,exp:5,splits:[],intl:[]};S.trophies.unshift({year:S.year,name:'Test'});mgrSeason();ok(S.mrep>30&&S.mgr.length===1,'Gute Saison hebt den Manager-Ruf nicht');
 S.trophies.shift();S.summary=null;ok(mgrTier().includes('Lizenz'),'Lizenz fehlt');ok(mgrBoard()>=45&&mgrBoard()<=75,'Start-Vertrauen außerhalb des Rahmens');
 ACT.ctab({v:'staff'});ACT.nav2({v:'club',k:'CLUBTAB',t:'staff'});chk('Staff');ok(html().includes('Manager-Ruf'),'Manager-Ruf-Karte fehlt')}

// Fans
{fgInit();ACT.nav2({v:'club',k:'CLUBTAB',t:'fans'});chk('Fans');ok(html().includes('Fan-Gruppen')&&html().includes('Merch-Drop'),'Fan-Tab unvollständig');
 const f0=S.fin.fans;for(let i=0;i<40;i++){S.step=3+i;fanWeek()}ok(S.fanlog.length>0,'Keine Fan-Ereignisse nach vielen Wochen');ok(S.fin.fans>0&&S.fin.fans<f0*3&&S.fin.fans>f0/3,'Fanzahl läuft aus dem Ruder');
 S.step=20;S.drop=null;S.fin.balance=500000;S.phase='season';const b0=S.fin.balance,g=dropGain(),c=dropCost();ACT.drop();ok(S.fin.balance===b0-c+g&&S.drop===20,'Merch-Drop bucht falsch');ok(dropWhy()&&dropWhy().includes('ab Woche'),'Merch-Drop ohne Sperrzeit');chk('Drop');S.step=0}

// Liga-Ereignisse
{const n0=(S.news||[]).length;for(let i=0;i<60;i++)leagueEvent();ok((S.news||[]).length>n0,'Keine Liga-Ereignisse');
 ok(Object.values(S.teams).every(t=>t.tier===2||(t.rep>=30&&t.rep<=100)),'Ruf außerhalb des Rahmens');chk('Liga-Ereignisse')}

// Karriereende
{const old=Object.values(S.players).filter(p=>p.team&&S.teams[p.team].tier!==2&&p.team!==S.user&&!p.loan).slice(0,6);for(const p of old){p.age=40;p.d&&0}
 const mine=S.players[U.roster.find(i=>S.players[i].role==='SUP')];mine.age=39;const id=mine.id;
 retireSeason();ok(old.every(p=>p.retired&&!p.team),'Karriereende greift nicht');ok(S.players[id].retired&&!U.roster.includes(id),'Eigener Spieler geht nicht in Rente');
 ok(!S.fa.some(x=>S.players[x].retired),'Rentner in der Vereinslosen-Liste');
 S.exs=[{id:'x',name:'Alter Hase',role:'MID',peak:80,age:36}];exPool();ok(S.scoutPool.some(s=>s.ex)&&S.staffPool.some(s=>s.ex),'Ex-Profi nicht im Pool');
 ensureRoles(U,true);for(const t of Object.values(S.teams))ensureRoles(t,false);chk('Karriereende')}

// Rückblick
ACT.nav2({v:'review'});chk('Rückblick');ok(html().includes('Saisonrückblick')&&html().includes('Als Text kopieren'),'Rückblick fehlt');
ok(reviewText().includes('Saisonrückblick '+S.year),'Rückblick-Text fehlt');ACT.revcopy();chk('Kopieren');

// Volle Saisons mit Neuladen: nichts hängt, Rentner kehren nicht zurück
newGame('LYL','Tester');
Object.values(S.players).filter(p=>p.team&&S.teams[p.team].tier!==2).slice(0,12).forEach(p=>p.age=37);
for(let s=0;s<3;s++){playSeason();ACT.next();chk('Saison '+s);ok(S.phase==='season','Saison startet nicht');
 ok(Object.values(S.teams).every(t=>t.tier===2||ROLES.every(r=>S.players[t.starters[r]]&&!S.players[t.starters[r]].retired)),'Rentner in der Startelf');reload()}
ok(Object.values(S.players).some(p=>p.retired),'Nach drei Saisons ist niemand in Rente gegangen');
`;
