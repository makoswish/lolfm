// LoL-Attribute, Prestige bei Gehältern, Wechselbereitschaft im Transfermarkt.
module.exports=`
function ok(c,msg){if(!c){console.log('FEHLER',msg);bad++}}
newGame('LYL','Tester');render();chk('Start');
const U=S.teams[S.user];

// Attribute
ok(DK.length===22&&['wav','spc','obj','eng'].every(k=>DK.includes(k)),'Neue Attribute fehlen');
ok(Object.values(S.players).every(p=>DK.every(k=>p.d[k]>=1&&p.d[k]<=20)),'Spieler ohne gültige Attribute');
ok(DK.every(k=>DINFO[k]&&DSHORT[k]),'Erklärung oder Kürzel fehlt');
ok(Object.values(COMP).every(c=>Math.abs(Object.values(c).reduce((a,b)=>a+b,0)-1)<1e-9),'Gewichte ergeben nicht 1');
ok(keyAttrs('JGL').includes('obj')||keyAttrs('JGL').includes('gs'),'Jungler ohne Makro-Schwerpunkt');
ok(keyAttrs('ADC').includes('mec')||keyAttrs('ADC').includes('pre'),'ADC ohne Mechanik-Schwerpunkt');
{const raw=JSON.parse(require('fs').readFileSync(__dirname+'/fixtures/save-v6.json','utf8'));store[SAVEKEY]=JSON.stringify(raw);S=null;load();chk('Alter Stand');
 ok(Object.values(S.players).every(p=>p.d.wav>=1&&p.d.obj>=1&&p.d.eng>=1&&p.d.spc>=1),'Migration ohne neue Attribute');
 ok(Object.values(S.players).every(p=>p.pot>=ovr(p)),'Potenzial unter OVR nach Migration')}
newGame('LYL','Tester');const V=S.teams[S.user];
ACT.nav2({v:'squad',k:'KTAB',t:'attr'});chk('Attribute-Tabelle');ok(document.querySelector('#app').innerHTML.includes('Attribute erklärt'),'Erklärung fehlt');

// Prestige: derselbe Spieler kostet bei kleinem Verein mehr als bei großem
const p=Object.values(S.players).filter(x=>x.team&&x.team!==S.user&&S.teams[x.team].tier!==2&&ovr(x)>=74&&ovr(x)<=80).sort((a,b)=>ovr(b)-ovr(a))[0];
const rep0=V.rep;V.rep=95;const big=demandFor(p,false);V.rep=55;const small=demandFor(p,false);V.rep=rep0;
ok(small>big*1.2,'Prestige wirkt nicht aufs Gehalt: '+small+' / '+big);
V.rep=95;ok(prestF(p,false)<1&&prestTxt(p,false)[0]==='good','Kein Abschlag beim Topverein');V.rep=55;ok(prestF(p,false)>1&&prestTxt(p,false)[0]==='bad','Kein Aufschlag beim kleinen Verein');V.rep=rep0;
ok(Math.abs(prestF(p,true)-1)<Math.abs(prestF(p,false)-1)||prestF(p,false)===1,'Verlängerung voll vom Prestige betroffen');
ok(prestigeOf({rep:90})==='Weltspitze'&&prestigeOf({rep:40})==='Kleiner Verein','Prestige-Stufen');

// Wechselbereitschaft
V.rep=50;const sd=signDiff(p);ok(sd.lv===4&&sd.why.length,'Star sollte kleinem Verein extrem teuer sein');
ok(hurdleF(p,false)>1.5,'Aufschlag für Star bei kleinem Verein zu niedrig');V.rep=rep0;p.tried='';
const fa=Object.values(S.players).filter(x=>!x.team).sort((a,b)=>ovr(a)-ovr(b))[0];ok(signDiff(fa).lv<=1,'Schwacher Vereinsloser nicht leicht zu holen');
ACT.nav2({v:'transfer',k:'TTAB',t:'markt'});chk('Markt');ok(document.querySelector('#app').innerHTML.includes('class="sgn"'),'Bereitschaft fehlt im Markt');
ok(/Vertrag bis 20\\d\\d/.test(document.querySelector('#app').innerHTML),'Vertragsende fehlt in den Marktzeilen');
for(const v of [3,2,1,0]){FILT.sgn=v;render();chk('Filter '+v);
  const ids=[...document.querySelector('#app').innerHTML.matchAll(/class="row" data-a="player" data-id="([^"]+)"/g)].map(m=>m[1]);
  ok(ids.every(id=>signDiff(S.players[id]).lv<=v),'Filter zeigt zu schwere Spieler bei '+v)}
FILT.sgn=4;FILT.sort='easy';render();chk('Sortierung leicht');FILT.sort='ovr';
ACT.player({id:p.id,tab:'vertrag'});chk('Spielerseite Bereitschaft');ok(document.querySelector('#app').innerHTML.includes('Wechselbereitschaft'),'Bereitschaft fehlt auf Spielerseite');
`;
// Regionen: Reihenfolge, Wechselrichtung, Auffüllen nach Abgängen
module.exports+=`
newGame('LYL','Tester');
{const avg=r=>teamsOf(r).reduce((a,t)=>a+teamOvr(t),0)/teamsOf(r).length;
 ok(avg('LCK')>avg('LEC')+2&&avg('LPL')>avg('LEC')+2,'LCK und LPL nicht klar vor LEC');ok(avg('LEC')>avg('LCS')&&avg('LCS')>avg('CBLOL')+2,'Reihenfolge der Regionen falsch');
 const kr=genPlayer('MID',70,24,'LCK'),br=genPlayer('MID',70,24,'CBLOL');
 ok(canJoinReg(kr,'LPL')&&!canJoinReg(kr,'CBLOL'),'LCK-Spieler darf nach Brasilien');ok(canJoinReg(br,'LCK')&&canJoinReg(br,'CBLOL'),'CBLOL-Spieler darf nicht aufsteigen');
 const T=teamsOf('LEC').find(t=>t.id!==S.user),r='MID',gone=T.roster.filter(i=>S.players[i].role===r);for(const i of gone)toFA(S.players[i]);
 aiRefill(T,r);const st=S.players[T.starters[r]];
 ok(st&&st.role===r&&ovr(st)>=55,'Lücke mit Nachwuchsspieler statt Vereinslosem gefüllt: '+(st&&ovr(st)))}
`;
module.exports+=`
function html(){return document.querySelector('#app').innerHTML}
function room(){const T=S.teams[S.user];while(T.roster.length>=MAXR-1){const i=T.roster.find(function(x){return !isStarter(S.players[x])});if(i==null)break;toFA(S.players[i])}}
newGame('LYL','Tester');
{const V=S.teams[S.user],ro=function(x){return Math.round(x*1000)/1000};
 const star=genPlayer('MID',78,25,'LEC');star.contract=0;S.players[star.id]=star;S.fa.push(star.id);
 const need=signNeed(star);V.rep=need;ok(hurdleGap(star)===0&&hurdleF(star,false)===1,'Hürde ohne Abstand');const d0=demandFor(star,false),pat0=(room(),startNego('fa',star.id),NG.pat);NG=null;star.tried='';
 // Abstand 8: verhandelbar, teurer, weniger Geduld, Stufe Kaum möglich
 V.rep=need-8;ok(hurdleGap(star)===8,'Abstand falsch');ok(Math.abs(hurdleF(star,false)-1.2)<1e-9,'Aufschlag nicht 20 Prozent');
 ok(signDiff(star).lv===3&&signDiff(star).why[0].indexOf('verhandelt')>=0,'Stufe bei Abstand 8');
 ok(demandFor(star,false)>d0*1.15,'Forderung unter der Hürde nicht höher');
 room();ok(startNego('fa',star.id)===true&&NG&&NG.hg===8,'Verhandlung unter der Hürde startet nicht');
 ok(NG.pat<pat0,'Geduld sinkt unter der Hürde nicht');ok(NG.log[0][1].indexOf('Ruf-Punkte zu klein')>=0,'Berater erwähnt die Hürde nicht');
 render();chk('Verhandlung unter der Hürde');ok(html().indexOf('Ruf-Punkte unter seiner Schmerzgrenze')>=0,'Hinweis in der Verhandlung fehlt');
 // Respekt-Malus, mit Gehalt ausgleichbar
 {const a=cScore().sc;NG.hg=0;const b=cScore().sc;NG.hg=8;ok(a<b,'Kein Respekt-Malus')}
 // Mit genug Gehalt kommt ein Deal zustande
 S.fin.balance=3e7;S.fin.budget.wage+=1e6;S.fin.budget.transfer+=1e6;NG.terms.sal=r100(NG.dem.sal*1.3);NG.terms.sb=50000;ACT.ngsign();ok(NG.done===true,'Deal mit hohem Angebot kommt nicht zustande');
 NG=null;
 // Eigene Spieler: keine Hürde bei Verlängerung
 const mine=S.players[V.starters.MID];ok(hurdleF(mine,true)===1&&hurdleGap(mine)===0,'Hürde bei eigenem Spieler');
 // Weit darunter: keine Absage, nur ein hoher Aufschlag
 const far=genPlayer('MID',78,25,'LEC');far.contract=0;S.players[far.id]=far;S.fa.push(far.id);V.rep=signNeed(far)-SOFTGAP-1;
 ok(signDiff(far).lv===4,'Zu großer Abstand ist nicht Extrem teuer');
 {const g=hurdleGap(far);ok(g>SOFTGAP&&hurdleF(far,false)>1+SOFTGAP*.025&&hurdleF(far,false)<=2.5,'Aufschlag jenseits der weichen Grenze steigt nicht gedeckelt');
  room();ok(startNego('fa',far.id)===true&&NG&&NG.hg===g,'Gespräche trotz großem Abstand nicht möglich');ok(NG.pat===1,'Geduld bei großem Abstand nicht minimal');NG=null;far.tried=''}
}
`;
module.exports+=`
newGame('LYL','Tester');
{const V=S.teams[S.user];S.fin.balance=2000000;S.board=70;S.fin.debts=[];
 ok(finLimit()===r1000(150000+S.fin.balance*.5)&&finRoom()===finLimit(),'Finanzierungsrahmen');
 const rl=releasable(),nt=S.fin.budget.transfer+rl+300000,pl=fitPlan(nt,0);
 ok(!pl.ok&&pl.fin>=300000&&pl.finOk&&pl.finCost>=pl.fin*1.1-1000,'Lücke wird nicht als finanzierbar erkannt');
 ok(fitPlan(S.fin.budget.transfer+rl+finRoom()*2,0).finOk===false,'Zu große Lücke ist finanzierbar');
 NG={log:[]};ok(applyFit(pl)===false,'Finanzierung ohne Bestätigung');
 const bal0=S.fin.balance,tb0=S.fin.budget.transfer;ok(applyFit(pl,true)===true,'Finanzierung klappt nicht');
 ok(S.fin.balance===bal0+pl.fin,'Finanzierung bucht kein Geld auf das Konto');ok(S.fin.budget.transfer===tb0+rl+pl.fin-pl.shiftT,'Transferbudget nach Finanzierung falsch');
 ok(S.fin.debts.length===1&&S.fin.debts[0].fin&&S.fin.debts[0].amt===pl.finCost&&S.fin.debts[0].season===S.season+1,'Rate nicht vorgemerkt');
 ok(finRoom()<finLimit(),'Rahmen schrumpft nicht');ok(NG.log.some(function(l){return l[1].indexOf('Finanzierung')===0}),'Kein Hinweis im Gespräch');NG=null;
 // Kein Rahmen ohne Vertrauen, Geld oder bei Minus
 S.board=20;ok(finLimit()===0,'Rahmen trotz Misstrauen');S.board=70;S.fin.balance=-1;ok(finLimit()===0,'Rahmen bei Minus');S.fin.balance=2000000;
 // Verhandlung: Knopf erscheint, Ablöse über dem Budget wird nach Finanzierung akzeptiert
 S.fin.debts=[];S.fin.weeks=[300000,300000,300000];const cheap=Object.values(S.players).filter(function(p){return p.team&&p.team!==S.user&&S.teams[p.team].tier!==2&&p.team!==acaId()&&ovr(p)<66&&!isStarter(p)})[0];
 while(V.roster.length>=MAXR)toFA(S.players[V.roster.find(function(i){return !isStarter(S.players[i])})]);
 ok(startNego('buy',cheap.id)===true,'Kaufverhandlung startet nicht');NG.fee.pay='now';NG.fee.amt=r1000(S.fin.budget.transfer+releasable()+300000);
 render();chk('Verhandlung mit Finanzierung');ok(html().indexOf('data-a="ngfin"')>=0,'Knopf Finanzieren fehlt');
 S.autoFit=true;ACT.ngsend();ok(NG.stage==='fee'&&NG.log.some(function(l){return l[1].indexOf('auf Raten finanzieren')>=0}),'Ohne Bestätigung wird nicht finanziert');
 ACT.ngfin();ok(S.fin.debts.length===1,'Finanzieren per Knopf');ACT.ngsend();ok(NG.stage==='contract'||NG.dead,'Angebot nach Finanzierung nicht abgeschickt');
 // Bezahlbar-Filter zählt die Finanzierung mit
 NG=null;
 // Rate wird zum Saisonstart fällig
 S.fin.debts=[{amt:70000,to:'der Finanzierung',season:S.season+1,fin:true}];let g=0;while(S.phase!=='offseason'&&g++<200)playWeek();
 const b1=S.fin.balance;ACT.next();chk('Neue Saison mit Rate');ok(!S.fin.debts.length,'Rate nicht abgebucht');ok(S.inbox.some(function(m){return m.title==='Finanzierung fällig'}),'Keine Mail zur fälligen Finanzierung');
}
`;
module.exports+=`
// Import-Filter in Markt und Scouting
newGame('LYL','Tester');
{const reg=S.teams[S.user].reg;
 ACT.nav2({v:'transfer',k:'TTAB',t:'markt'});FILT.sgn=4;FILT.n=400;
 const IMPRE=/class="warn">Import/;ok(IMPRE.test(document.querySelector('#app').innerHTML),'Test braucht sichtbare Importe im Markt');
 ACT.fnoimp();chk('Ohne Importe');ok(FILT.noimp===true,'Import-Filter nicht aktiv');
 ok(!IMPRE.test(document.querySelector('#app').innerHTML)&&document.querySelector('#app').innerHTML.includes('class="row"'),'Importe trotz Filter sichtbar oder Liste leer');
 ACT.fnoimp();FILT.n=40;
 initScouting();const sc=S.scouts[0];sc.reg='ALL';sc.scope='all';sc.frole='ALL';sc.fage=99;sc.fval=0;sc.fimp=0;
 const n0=scoutPool(sc).length,imp0=scoutPool(sc).filter(p=>isImp(p,reg)).length;ACT.scf({id:sc.id,k:'fimp',v:'1'});
 const pool=scoutPool(sc);ok(sc.fimp===1&&pool.every(p=>!isImp(p,reg))&&pool.length===n0-imp0&&imp0>0,'Scout-Filter ohne Importe wirkt nicht');
 ACT.nav2({v:'transfer',k:'TTAB',t:'scout'});chk('Scouting-Reiter');ok(document.querySelector('#app').innerHTML.includes('Ohne Importe'),'Import-Auswahl im Suchprofil fehlt')}
`;
