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
V.rep=50;const sd=signDiff(p);ok(sd.lv===4&&sd.why.length,'Star sollte kleinem Verein absagen');
ok(!startNego('buy',p.id),'Verhandlung trotz Unmöglich gestartet');V.rep=rep0;p.tried='';
const fa=Object.values(S.players).filter(x=>!x.team).sort((a,b)=>ovr(a)-ovr(b))[0];ok(signDiff(fa).lv<=1,'Schwacher Vereinsloser nicht leicht zu holen');
ACT.nav2({v:'transfer',k:'TTAB',t:'markt'});chk('Markt');ok(document.querySelector('#app').innerHTML.includes('class="sgn"'),'Bereitschaft fehlt im Markt');
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
 ok(avg('LCK')>avg('LEC')+3&&avg('LPL')>avg('LEC')+3,'LCK und LPL nicht klar vor LEC');ok(avg('LEC')>avg('LCS')&&avg('LCS')>avg('CBLOL')+2,'Reihenfolge der Regionen falsch');
 const kr=genPlayer('MID',70,24,'LCK'),br=genPlayer('MID',70,24,'CBLOL');
 ok(canJoinReg(kr,'LPL')&&!canJoinReg(kr,'CBLOL'),'LCK-Spieler darf nach Brasilien');ok(canJoinReg(br,'LCK')&&canJoinReg(br,'CBLOL'),'CBLOL-Spieler darf nicht aufsteigen');
 const T=teamsOf('LEC').find(t=>t.id!==S.user),r='MID',gone=T.roster.filter(i=>S.players[i].role===r);for(const i of gone)toFA(S.players[i]);
 aiRefill(T,r);const st=S.players[T.starters[r]];
 ok(st&&st.role===r&&ovr(st)>=55,'Lücke mit Nachwuchsspieler statt Vereinslosem gefüllt: '+(st&&ovr(st)))}
`;
