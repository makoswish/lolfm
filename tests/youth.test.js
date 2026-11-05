// Talententwicklung: Entwicklungstyp, Spielpraxis, Potenzial-Spanne, Leihe, T2-Sichtung.
module.exports=`
function ok(c,msg){if(!c){console.log('FEHLER',msg);bad++}}
newGame('LYL','Tester');render();chk('Start');
const U=S.teams[S.user];
ok(Object.values(S.players).every(p=>DEVT[p.dev]),'Entwicklungstyp fehlt');
const old=S.players[U.roster[0]];delete old.dev;migrate();ok(DEVT[old.dev],'migrate setzt keinen Entwicklungstyp');

// Potenzial-Spanne
const f=Object.values(S.players).find(p=>p.team&&!isMine(p)&&S.teams[p.team].tier===2);
S.kn[f.id]=0;ok(potEst(f)===null&&potTxt(f)==='?','Unbekannter Spieler zeigt Potenzial');
S.kn[f.id]=40;let e=potEst(f);ok(e&&e[0]<=f.pot&&e[1]>=f.pot&&e[1]-e[0]===12,'Spanne bei 40% falsch: '+e+' / '+f.pot);
S.kn[f.id]=70;e=potEst(f);ok(e&&e[0]<=f.pot&&e[1]>=f.pot&&e[1]-e[0]===6,'Spanne bei 70% falsch');
S.kn[f.id]=90;ok(potTxt(f)===String(f.pot),'Bei 90% nicht exakt');
ok(potTxt(S.players[U.roster[0]])===String(S.players[U.roster[0]].pot),'Eigene Spieler nicht exakt');

// Leihe
const y=genPlayer('MID',60,19,U.reg);y.pot=80;y.contract=2;sign(y,U,false);
ok(canLoan(y)&&!isStarter(y),'Junger Bankspieler nicht verleihbar');
const tg=loanTargets(y);ok(tg.length>0,'Keine Leihziele');
ACT.lendmenu({id:y.id});ok(MODAL&&MODAL.loan===y.id,'Leih-Dialog');chk('Leih-Dialog');
ACT.lend({id:y.id,t:tg[0].t.id});chk('Verleihen');
ok(y.team===tg[0].t.id&&isLoanee(y)&&isMine(y)&&!U.roster.includes(y.id)&&isStarter(y),'Leihe nicht ausgeführt');
ok(kn(y)===100,'Leihspieler gilt nicht als eigener');
ACT.player({id:y.id,tab:'entw'});chk('Spielerseite Leihspieler Entwicklung');ACT.player({id:y.id,tab:'vertrag'});chk('Spielerseite Leihspieler Vertrag');
ok(document.querySelector('#app').innerHTML.includes('data-a="lendback"'),'Zurückholen fehlt');
const g0=(y.st&&y.st.g)||0;{const s0=S.step;let k=0;while(S.step===s0&&k++<5)playWeek()}ok(((y.st&&y.st.g)||0)>g0,'Leihspieler spielt nicht in der T2-Liga');
reload();const y2=S.players[y.id];ok(isLoanee(y2)&&S.teams[y2.team].roster.includes(y2.id),'Leihe übersteht Neuladen nicht');
ACT.lendback({id:y.id});ok(S.teams[S.user].roster.includes(y.id)&&!S.players[y.id].loan,'Zurückholen klappt nicht');chk('Zurückholen');
ACT.lend({id:y.id,t:loanTargets(S.players[y.id])[0].t.id});ok(isLoanee(S.players[y.id]),'Zweite Leihe');

// Ansichten
ACT.nav2({v:'squad',k:'KTAB',t:'aca'});chk('Academy mit Talenten');
ok(document.querySelector('#app').innerHTML.includes('Talente bis 21'),'Talentübersicht fehlt');
ACT.nav2({v:'squad',k:'KTAB',t:'vert'});chk('Verträge mit Leihspieler');
ok(document.querySelector('#app').innerHTML.includes('data-id="'+y.id+'"'),'Leihspieler fehlt in Verträgen');
ACT.nav2({v:'league',k:'LTAB',t:'t2'});chk('T2-Szene');
ok(S.t2[U.reg].stars&&S.t2[U.reg].stars.length>0,'Kein Spieler der Woche');
ACT.player({id:f.id,tab:'entw'});chk('Fremder T2-Spieler Entwicklung');

// Scout schaut T2-Spiele
S.scouts[0].reg=U.reg;S.scouts[0].scope='t2';ok(t2Watch(U.reg),'t2Watch');
const t2p=S.players[t2Of(U.reg).find(t=>!t.academy).starters.TOP];S.kn[t2p.id]=0;scoutWeek();ok(S.kn[t2p.id]>=3,'Scout lernt T2-Stammspieler nicht kennen');

// Saisonbilanz: Spielpraxis verschiebt Potenzial
const a=genPlayer('ADC',60,19,U.reg),b=genPlayer('ADC',60,19,U.reg);[a,b].forEach(p=>{p.pot=85;p.h.pro=12;sign(p,S.teams[t2Of(U.reg)[0].id],false)});
a.st={g:0};b.st={g:40};youthSeason();ok(a.pot<85,'Ohne Spiele sinkt Potenzial nicht');ok(b.pot>=85,'Mit Spielen sinkt Potenzial');

// Saisonende holt Leihspieler zurück
let g=0;while(S.phase!=='offseason'&&g++<200){playWeek();chk('Woche')}
ACT.next();chk('Neue Saison');
const y3=S.players[y.id];ok(y3&&!y3.loan&&(y3.team===S.user||!y3.team),'Leihspieler nach Saisonende nicht zurück');
ok(!Object.values(S.players).some(p=>p.loan),'Leihe hängt noch');
`;
