// Infrastruktur über Vorstandsanträge, Probetraining, Leihe von anderen Teams.
module.exports=`
function ok(c,msg){if(!c){console.log('FEHLER',msg);bad++}}
function untilStep(n){let k=0;while(S.step<n&&S.phase!=='offseason'&&k++<60)playWeek()}
newGame('LYL','Tester');render();chk('Start');
const U=S.teams[S.user],f=S.fin;
ok(f.hw===60&&f.hwb==='mid'&&Array.isArray(f.builds),'Infrastruktur nicht initialisiert');
ACT.nav2({v:'club',k:'CLUBTAB',t:'infra'});chk('Infrastruktur-Seite');
ok(!document.querySelector('#app').innerHTML.includes('Ausbauen für'),'Alter Kaufknopf noch da');

// Antrag mit genug Geld und Vertrauen wird genehmigt und gebaut
f.balance=3e6;S.board=70;const lv0=f.infra.tc;
ACT.infraask({v:'tc'});ok(f.ireq&&f.ireq.k==='tc'&&f.infra.tc===lv0,'Antrag nicht gestellt oder sofort gebaut');
ok(infraCan('gh'),'Zweiter Antrag gleichzeitig möglich');
untilStep(f.ireq.wk+1);ok(!f.ireq&&building('tc'),'Vorstand hat nicht entschieden oder nicht genehmigt');
const b=building('tc'),bal0=f.balance;render();chk('Bauphase');
untilStep(S.step+b.total+1);ok(f.infra.tc===lv0+1&&!building('tc'),'Bau nicht fertig');
ok(infraCan('tc'),'Zweiter Antrag in derselben Saison möglich');

// Antrag ohne Geld wird abgelehnt
f.balance=10000;S.board=30;const gh0=f.infra.gh;ACT.infraask({v:'gh'});ok(f.ireq,'Antrag Gaming House nicht gestellt');const st=f.ireq.wk;untilStep(st+1);
ok(f.infra.gh===gh0&&!building('gh'),'Antrag trotz leerem Konto genehmigt');
ok(f.ibase&&f.ibase.tc===aiInfra(U,'tc'),'Startstand nicht nach Ruf');
ok(S.inbox.some(m=>m.title.includes('Vorstand lehnt ab')),'Keine Ablehnung im Postfach');

// Hardware
f.balance=2e6;ACT.hwb({v:'high'});const h0=f.hw;untilStep(S.step+3);ok(f.hw>h0,'Hardware steigt nicht bei hohem Budget');
ACT.hwb({v:'low'});const h1=f.hw;untilStep(S.step+3);ok(f.hw<h1,'Hardware sinkt nicht bei niedrigem Budget');

// Wirkung auf Verhandlungen
f.infra.tc=3;f.infra.gh=3;ok(attract()>0,'Gute Einrichtungen bringen keinen Vorteil');f.infra.gh=0;f.infra.tc=0;ok(attract()<=0,'Schlechte Einrichtungen bringen Vorteil');

// Probetraining
const fa=S.players[S.fa[0]];S.kn[fa.id]=0;ok(canTrial(fa),'Vereinsloser nicht einladbar');
const t1=Object.values(S.players).find(p=>p.team&&p.team!==S.user&&S.teams[p.team].tier!==2);ok(!canTrial(t1),'T1-Spieler einladbar');
ACT.trial({id:fa.id});ok(onTrial(fa),'Probetraining startet nicht');
ACT.nav2({v:'transfer',k:'TTAB',t:'short'});chk('Beobachtung mit Probetraining');
const t2s=Object.values(S.players).filter(p=>canTrial(p)&&p.team);ACT.trial({id:t2s[0].id});ACT.trial({id:t2s[1].id});ok(S.trials.length===2,'Mehr als zwei Probetrainings');
untilStep(S.step+2);ok(!onTrial(fa)&&kn(fa)===100&&S.inbox.some(m=>m.title==='Bericht Probetraining: '+fa.name),'Kein Bericht nach Probetraining');

// Leihe von anderen Teams
f.balance=3e6;f.budget.transfer=2e6;f.budget.wage+=50000;
const cand=Object.values(S.players).filter(p=>p.team&&p.team!==S.user&&!S.teams[p.team].academy&&S.teams[p.team].tier!==2&&!isStarter(p)&&p.team!==acaId()).sort((a,b)=>ovr(b)-ovr(a))[0];
while(U.roster.length>=MAXR){const x=U.roster.map(i=>S.players[i]).find(p=>!isStarter(p));toFA(x)}
const starter=Object.values(S.players).find(p=>p.team&&p.team!==S.user&&S.teams[p.team].tier!==2&&isStarter(p));
ok(loanInWhy(starter),'Stammspieler leihbar');
ACT.linmenu({id:cand.id});ok(MODAL&&MODAL.lin===cand.id,'Leih-Dialog');chk('Leih-Dialog');
const need=loanShare(cand);
if(need>50){ACT.linoffer({id:cand.id,v:'50'});ok(cand.team!==S.user,'Zu niedriges Angebot angenommen');ok(loanInWhy(cand),'Zweites Angebot in derselben Woche möglich');untilStep(S.step+1)}
const from=cand.team,tb=f.budget.transfer;ACT.linoffer({id:cand.id,v:String(need)});chk('Leihe');
ok(cand.team===S.user&&isLoanIn(cand)&&cand.loan.from===from,'Leihe nicht ausgeführt');
ok(f.budget.transfer<tb,'Leihgebühr nicht gebucht');ok(wageOf(cand)===Math.round(cand.salary*need/100/100)*100,'Gehaltsanteil falsch');
ACT.release({id:cand.id,ok:'1'});ok(cand.team===S.user,'Leihspieler entlassen');
ACT.list({id:cand.id});ok(!cand.listed,'Leihspieler auf Transferliste');
ok(!startNego('renew',cand.id),'Vertrag mit Leihspieler verhandelt');
ACT.player({id:cand.id,tab:'vertrag'});chk('Spielerseite Leihspieler');
ACT.nav2({v:'squad',k:'KTAB',t:'vert'});chk('Verträge mit Leihe');
reload();ok(isLoanIn(S.players[cand.id]),'Leihe übersteht Neuladen nicht');
let g=0;while(S.phase!=='offseason'&&g++<200){playWeek();chk('Woche')}
ACT.next();chk('Neue Saison');
const c2=S.players[cand.id];ok(!c2||(c2.team!==S.user&&!c2.loan),'Leihspieler nach Saisonende nicht zurück');
ok(S.teams[S.user].roster.length>=5&&ROLES.every(r=>S.teams[S.user].starters[r]),'Startelf unvollständig nach Rückgabe');
ok(S.fin.hw<100,'Hardware altert nicht');
`;
// Rückgabe an den alten Verein, ohne Zufall durch auslaufende Verträge
module.exports+=`
{const f=S.fin;f.balance=3e6;f.budget.transfer=2e6;f.budget.wage+=50000;while(S.teams[S.user].roster.length>=MAXR)toFA(S.teams[S.user].roster.map(i=>S.players[i]).find(p=>!isStarter(p)));
 const c3=Object.values(S.players).find(p=>p.team&&p.team!==S.user&&!S.teams[p.team].academy&&S.teams[p.team].tier!==2&&!isStarter(p)&&p.team!==acaId()&&!loanInWhy(p));
 const fr=c3.team;ok(loanIn(c3.id,100)===null,'Zweite Leihe klappt nicht');loansReturn();ok(c3.team===fr&&!c3.loan,'Rückgabe an falschen Verein');
 ok(S.teams[fr].roster.includes(c3.id)&&!S.teams[S.user].roster.includes(c3.id),'Kader nach Rückgabe falsch')}
`;
