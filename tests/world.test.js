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
module.exports+=`
function ok(c,msg){if(!c){console.log('FEHLER',msg);bad++}}
function html(){return document.querySelector('#app').innerHTML}
// Regionale Sponsoren: Marken stammen überwiegend aus dem eigenen Markt
for(const [team,reg] of [['LYL','LEC']]){}
{const seen={};for(const tid of ['LYL','LSN','CWM']){newGame(tid,'Tester');const r=S.teams[S.user].reg;let own=0,n=0;
  for(let i=0;i<10;i++){S.fin.slots=Object.fromEntries(SLOTS.map(x=>[x[0],null]));genOffers();for(const k in S.fin.offers)for(const o of S.fin.offers[k]){if(o.loyal)continue;n++;const org=brandOrg(o.name);if(org===r)own++;
    ok(org===r||org==='GL','Marke aus fremdem Markt: '+o.name+' ('+org+') bei '+r)}}
  ok(own/n>.5,'Zu wenig regionale Sponsoren in '+r+': '+own+' von '+n)}}
// Asiatische Ligen: asiatische Marken
{const T=Object.values(S.teams).find(t=>t.tier!==2&&t.reg==='LCK');S.user=T.id;S.fin.slots=Object.fromEntries(SLOTS.map(x=>[x[0],null]));genOffers();
 const names=Object.values(S.fin.offers).flat().map(o=>o.name);ok(names.some(n=>BRANDR.LCK.includes(n)),'Keine koreanische Marke in der LCK');ok(!names.some(n=>BRANDR.CBLOL.includes(n)),'Brasilianische Marke in der LCK')}

// Verhandlung mit Reglern
newGame('LYL','Tester');
{const U=S.teams[S.user];const p=Object.values(S.players).find(x=>x.team&&x.team!==S.user&&S.teams[x.team].tier!==2&&x.team!==acaId()&&ovr(x)<70&&!x.loan);
 while(U.roster.length>=MAXR)toFA(S.players[U.roster.find(i=>!isStarter(S.players[i]))]);S.fin.balance=3000000;S.board=80;
 ok(startNego('buy',p.id)===true,'Verhandlung startet nicht');render();chk('Ablöse');
 ok(html().includes('data-rk="fee"')&&html().includes('data-rk="sell"')&&html().includes('data-rk="addon"'),'Regler für Ablöse fehlen');ok(!html().includes('data-a="ngfee"'),'Alte Ablöse-Schritte noch da');
 const a0=NG.fee.amt;ACT.ngnudge({k:'fee',v:'5000'});ok(NG.fee.amt===a0+5000,'Nudge Ablöse');
 const mn=ngRange('fee')[0];ACT.ngnudge({k:'fee',v:'-99999999'});ok(NG.fee.amt===mn,'Nudge bleibt im Bereich');
 // Bonus an den Verein zählt halb
 NG.fee.amt=NG.club.ask;NG.fee.addon=0;const v0=feeVal();NG.fee.addon=20000;ok(Math.abs(feeVal()-v0-10000)<1,'Bonus zählt nicht halb');
 // Regler bewegen: nur Teilaktualisierung, Zustand folgt
 ngPut('fee',NG.club.ask);NG.fee.addon=0;NG.fee.pay='now';S.fin.budget.transfer=NG.club.ask+1000000;
 ACT.ngsend();ok(NG.stage==='contract','Abschicken kommt nicht durch');render();chk('Vertrag');
 const h=html();ok(['sal','sb','wb','tb'].every(k=>h.includes('data-rk="'+k+'"')),'Regler im Vertrag fehlen');ok(h.includes('data-a="ngalt"')&&h.includes('id="ngmeter"')&&h.includes('id="ngwk"'),'Alternativen, Meter oder Gesamtwert fehlen');
 // Alternativen haben denselben Wert wie die Forderung
 for(let i=0;i<3;i++){ACT.ngalt();ok(Math.abs(wkVal(NG.terms)-NG.dem.sal)/NG.dem.sal<.03,'Alternative '+ALTS[NG.alt]+' weicht vom Wert der Forderung ab: '+Math.round(wkVal(NG.terms))+' gegen '+NG.dem.sal);ok(cScore().sc>=.97,'Alternative '+ALTS[NG.alt]+' wird zu schlecht bewertet: '+cScore().sc.toFixed(3))}
 ok(NG.alt===2&&NG.terms.tb>0&&NG.terms.wb>0,'Prämien-Alternative ohne Prämien');
 // Prämien sind für den Spieler etwas wert
 const t=NG.terms;const w0=wkVal(t);t.tb+=26000;ok(wkVal(t)>w0+90,'Titelprämie ohne Wert');t.tb-=26000;
 // Abschluss: Titelprämie und Ablöse-Bonus werden gespeichert und ausgezahlt
 NG.fee.addon=15000;NG.terms.sal=r100(NG.dem.sal*1.4);NG.terms.tb=30000;NG.terms.wb=500;S.autoFit=true;closeDeal();
 ok(p.tb===30000&&p.wb===500&&p.team===S.user,'Prämien nicht gespeichert');ok(p.addon&&p.addon.amt===15000&&p.addon.g===20,'Ablöse-Bonus nicht vereinbart');
 // eigener Ablöse-Bonus
 NG=null;p.addon={team:'BOH',amt:15000,g:20,c:0,l:0};p.st=p.st||{};p.st.g=19;const b0=S.fin.balance;addonWeek();ok(S.fin.balance===b0&&p.addon.c===19,'Ablöse-Bonus zu früh');p.st.g=21;addonWeek();ok(S.fin.balance===b0-15000&&!p.addon,'Ablöse-Bonus wird nicht gezahlt');
 const b1=S.fin.balance;titleBonus();ok(S.fin.balance===b1-30000,'Titelprämie wird nicht gezahlt');
 ACT.player({id:p.id,tab:'vertrag'});chk('Spielerseite');ok(html().includes('Titelprämie'),'Titelprämie nicht auf der Spielerseite')}
`;
