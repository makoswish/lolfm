// Karriere, Import-Regel, Wechsel in Serien, Scrims, Burnout, Rivalitäten, Presse, Shotcaller, Vergleich, Rekorde.
module.exports=`
function ok(c,msg){if(!c){console.log('FEHLER',msg);bad++}}
function html(){return document.querySelector('#app').innerHTML}
function untilStep(n){let k=0;while(S.step<n&&S.phase!=='offseason'&&k++<60)playWeek()}
newGame('LYL','Tester');render();chk('Start');
let U=S.teams[S.user];

// Presse
ok(S.press&&S.press.order.length===teamsOf(U.reg).length&&S.press.order.indexOf(S.press.tip)>=3,'Saisonvorschau fehlt oder Geheimtipp unter den Top 3');
ok(S.inbox.some(m=>m.title.startsWith('Saisonvorschau')),'Keine Vorschau im Postfach');ACT.nav2({v:'home'});chk('Übersicht mit Prognose');

// Import-Regel
ok(REGS.every(r=>teamsOf(r).every(T=>impCount(T)<=IMPMAX)),'Team über dem Import-Limit beim Start');
{const imp=[0,1,2].map(i=>{const p=genPlayer(ROLES[i],70,24,'LCK');p.nat='KR';p.rn=genRealName('KR');sign(p,U,false);return p});
 for(const p of imp.slice(0,2))ACT.setstart({id:p.id});const third=imp[2];
 for(const x of ROLES){const q=S.players[U.starters[x]];if(q&&isImp(q,U.reg)&&!imp.includes(q)){const alt=U.roster.map(i=>S.players[i]).find(z=>z.role===x&&!isImp(z,U.reg));if(alt)U.starters[x]=alt.id}}
 ACT.setstart({id:third.id});ok(impCount(U)<=IMPMAX,'Dritter Import in der Startelf möglich');
 U.starters[third.role]=third.id;const ch=fixImports(U);ok(impCount(U)<=IMPMAX||!ch.length,'fixImports greift nicht');
 for(const p of imp){toFA(p)}ensureRoles(U,false);for(const x of ROLES)if(!U.starters[x]||!S.players[U.starters[x]]||S.players[U.starters[x]].team!==S.user)ensureRoles(U,false)}
{const p=genPlayer('MID',60,24,'LCK');p.nat='KR';p.hist=[1,2,3].map(i=>({y:2020+i,t:U.id,g:20}));ok(!isImp(p,U.reg),'Nach drei Saisons noch Import')}

// Wechsel in Serien und Burnout
{const bench=U.roster.map(i=>S.players[i]).find(p=>!isStarter(p));
 bench.out={until:S.step+3,why:'Burnout'};ok(isOut(bench),'isOut');ACT.setstart({id:bench.id});ok(!isStarter(bench),'Ausgefallener Spieler aufgestellt');
 bench.out=null;const st=S.players[U.starters[bench.role]];st.out={until:S.step+3,why:'Burnout'};
 const pend=userPending();if(pend){ACT.next();ok(S.players[U.starters[bench.role]]!==st,'Ausfall steht in der Startelf');chk('Spielvorbereitung mit Ausfall');
  ok(html().includes('Wechsel für Spiel'),'Wechsel-Box fehlt');st.out=null;ACT.psub({id:st.id});ok(isStarter(st),'Wechsel vor dem Spiel klappt nicht');ACT.quick();chk('Serie')}
 st.out=null;
 const p=U.roster.map(i=>S.players[i])[0];p.load=95;p.hiW=5;let hit=false;for(let i=0;i<30&&!hit;i++){p.load=95;p.hiW=5;p.out=null;burnWeek();hit=isOut(p)}ok(hit,'Burnout tritt nie ein');p.out=null;p.load=40;
 ACT.rest({id:p.id});ok(isOut(p)&&p.out.why==='Pause','Pause klappt nicht');const l0=(p.load=80);burnWeek();ok(p.load<l0,'Pause baut keine Belastung ab');p.out=null}

// Scrims
ACT.nav2({v:'tactic',k:'TACTAB',t:'train'});chk('Training mit Scrims');ok(html().includes('Scrim-Partner'),'Scrim-Panel fehlt');
{const T2=scrimCands().find(t=>t.tier===2);S.scrimTry='';const e=scrimAsk(T2.id);ok(!e&&scrimNow()===T2,'T2-Scrim-Partner sagt ab: '+e+' '+JSON.stringify(S.scrim)+' '+S.step+' '+S.phase);ok(scrimAsk(T2.id),'Zweite Anfrage in derselben Woche');
 ok(scrimKnows(T2.id),'Partner kennt Stil nicht');const top=teamsOf(U.reg).find(t=>t.id!==S.user);ok(adaptChance(top)<=.75,'adaptChance');
 const strong=scrimCands().filter(t=>t.tier!==2).sort((a,b)=>teamOvr(b)-teamOvr(a))[0];S.scrim={tid:strong.id,until:S.step+4};ok(scrimF()>=1||teamOvr(strong)<teamOvr(U),'Starker Partner bringt nichts')}

// Shotcaller
{const st=ROLES.map(r=>S.players[U.starters[r]]),low=st.slice().sort((a,b)=>a.d.lead-b.d.lead)[0];ACT.capt({id:low.id});ok(S.capt===low.id&&shotcaller(U)===low,'Shotcaller nicht gesetzt');
 ok(capPow(U)<=.8&&capPow(U)>=-.6,'capPow');const bench=U.roster.map(i=>S.players[i]).find(p=>!isStarter(p));if(bench){ACT.capt({id:bench.id});ok(S.capt===low.id,'Bankspieler als Shotcaller')}
 ACT.player({id:low.id});chk('Spielerseite Shotcaller');ok(html().includes('Shotcaller'),'Shotcaller-Kennzeichen fehlt')}

// Vergleich
{const a=S.players[U.starters.MID],b=Object.values(S.players).find(p=>p.team&&p.team!==S.user&&p.role==='MID');
 ACT.cmp({id:a.id,b:b.id});ok(S.view==='cmp',' Vergleich öffnet nicht');chk('Vergleich');ok(html().includes(a.name)&&html().includes(b.name),'Vergleich ohne Namen');
 S.kn[b.id]=0;render();ok(html().includes('?'),'Vergleich verrät unbekannte Werte');ACT.cmpclose();
 ACT.cmp({id:a.id});ok(CMP&&CMP.length===1&&S.view!=='cmp','Erster Klick merkt nicht');ACT.cmp({id:b.id});ok(S.view==='cmp','Zweiter Klick vergleicht nicht');ACT.cmpclose()}

// Rivalität
{const O=teamsOf(U.reg).find(t=>t.id!==S.user),m=()=>({a:S.user,b:O.id,bo:5,big:true,w:S.user,score:[3,2]});const b0=S.board;
 for(let i=0;i<4;i++)rivRecord(m());ok(rivLbl(O.id),'Keine Rivalität nach vier engen Playoff-Serien');ok(S.board>b0,'Sieg gegen Rivalen ohne Wirkung');
 ACT.team({id:O.id});chk('Team-Fenster mit Rivalität');ACT.close();rivSeason();ok(rivOf(O.id).p<20,'Rivalität verblasst nicht')}

// Saison zu Ende spielen: Rekorde, Karriere, Entlassung, Jobwechsel
let g=0;while(S.phase!=='offseason'&&g++<200){playWeek();chk('Woche')}
ok(S.career&&S.career.length===1,'Karriere nicht festgehalten');ACT.nav2({v:'hof'});chk('Rekorde');ok(html().includes('Hall of Fame'),'Hall of Fame fehlt');
S.board=10;S.career=[];careerSeason();ok(S.jobless&&S.jobs.sacked&&S.jobs.list.length,'Keine Entlassung bei 10% Vertrauen');
ACT.next();ok(S.view==='jobs',' Neue Saison trotz Entlassung');chk('Jobangebote');
const old=S.user,to=S.jobs.list[0];ACT.jobtake({v:to});ok(MODAL&&MODAL.cf,'Keine Rückfrage');ACT.jobtake({v:to,ok:'1'});
ok(S.user===to&&!S.jobless&&aca()&&aca().reg===S.teams[to].reg,'Wechsel nicht vollständig');ok(!S.teams[old+'A'],'Alte Academy existiert noch');
ok(REGS.every(r=>t2Of(r).length===8),'T2-Ligen nicht bei 8 Teams');chk('Nach Wechsel');
reload();chk('Neu geladen nach Wechsel');ACT.next();chk('Neue Saison beim neuen Verein');
for(let i=0;i<8;i++){playWeek();chk('Woche neuer Verein')}
ok(S.teams[S.user].roster.length>=5,'Kader des neuen Vereins kaputt');
// Gute Saison bringt Angebote nach oben
ok(jobCands(true).every(t=>t.rep>=S.teams[S.user].rep+3),'Angebote nach oben von kleineren Vereinen');
`;
// Vorstandsziele
module.exports+=`
newGame('LYL','Tester');
{const G=S.goals;ok(G&&PHIL[G.phil]&&G.list.length>=3&&G.list.some(g=>g.k==='liga'),'Keine Vorstandsziele');
 ok(G.list.every(g=>g.imp>=1&&g.imp<=3&&g.txt),'Ziel ohne Gewicht oder Text');
 for(const g of G.list){const e=goalEval(g,false);ok(e.st&&e.sc>=-1&&e.sc<=1,'goalEval '+g.k)}
 ACT.nav2({v:'club',k:'CLUBTAB',t:'staff'});chk('Vorstand-Panel');ok(html().includes('Philosophie'),'Philosophie fehlt');
 ACT.nav2({v:'home'});chk('Übersicht mit Zielen');
 const b0=S.board=60;S.rec.S3={};for(const r of REGS)S.rec.S3[r]=teamsOf(r).map(t=>t.id).sort((a,b)=>a===S.user?1:b===S.user?-1:0);
 S.fin.balance=G.bal0-5e6;boardSeason();ok(S.board>=b0-30&&S.board<b0,'Schlechte Saison senkt Vertrauen nicht oder zu stark: '+S.board);
 S.board=60;S.goals.warned=false;const lg=S.goals.list.find(g=>g.k==='liga');S.rec.S1={};for(const r of REGS)S.rec.S1[r]=S.rec.S3[r];S.board=36;boardSplit('S1');
 ok(S.board<35?S.inbox.some(m=>m.title==='Ultimatum des Vorstands'):true,'Kein Ultimatum unter 35%');
 delete S.goals;ensureGoals();ok(S.goals&&S.goals.year===S.year,'Alter Stand bekommt keine Ziele');
 const T=teamsOf('LCK').sort((a,b)=>b.rep-a.rep)[0];ok(philOf(T)==='titel','Topverein ohne Titelhunger')}
`;
