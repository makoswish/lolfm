/* ===== Stärke & Simulation ===== */
function teamPower(T,O){
  const ph={e:0,m:0,l:0};
  for(const r of ROLES){const p=S.players[T.starters[r]];const m=(1+(p.form-70)/400+(p.morale-65)/500)*carryW(T,r)*metaRoleW(r);
    ph.e+=(p.a.lane*.5+p.a.mech*.3+p.a.macro*.2)*m;
    ph.m+=(p.a.macro*.5+p.a.comm*.3+p.a.mech*.2)*m;
    ph.l+=(p.a.tf*.6+p.a.mech*.2+p.a.comm*.2)*m}
  for(const k in ph)ph[k]/=5;
  const ts=styleOf(T),sm=STYLES[ts].mod;ph.e+=sm[0];ph.m+=sm[1];ph.l+=sm[2];
  {const cp=chemPow(T);ph.e+=cp;ph.m+=cp;ph.l+=cp}
  ph.m+=capPow(T);{const mp=metaPow(T);ph.e+=mp;ph.m+=mp;ph.l+=mp}
  if(O){const c=COUNTER[ts];if(c.vs===styleOf(O))ph[c.ph]+=2.5;
    const mine=S.players[T.starters[T.focus]],th=S.players[O.starters[T.focus]];ph.e+=ovr(mine)>ovr(th)?2:.8}
  const an=T.id===S.user?S.staff.analyst:2;ph.m+=(an-2)*.6;ph.l+=(an-2)*.4;
  const tm=tacMods(T);ph.e+=tm.e;ph.m+=tm.m;ph.l+=tm.l;
  return ph;
}
/* ===== Champions & Draft ===== */
const CH=[
 ['Bramwulf','TOP','Tank',0,1,2,'Engage'],['Vesska','TOP','Kämpferin',2,1,0,'Dive'],['Orrik','TOP','Tank',0,1,1,'Engage'],['Talhar','TOP','Kämpfer',1,2,0,'Pick'],['Grenna','TOP','Kämpferin',-1,1,3,'Scaling'],
 ['Kordan','TOP','Tank',1,1,0,'Engage'],['Isolde','TOP','Fechterin',2,1,-1,'Dive'],['Morvane','TOP/MID','Magier',0,2,1,'Poke'],['Halvar','TOP','Tank',-1,1,2,'Scaling'],['Yrsa','TOP/JGL','Kämpferin',1,1,1,'Pick'],
 ['Nachtmar','JGL','Assassine',2,1,0,'Pick'],['Fenrik','JGL','Kämpfer',2,1,-1,'Dive'],['Ulgra','JGL/SUP','Tank',1,1,1,'Engage'],['Selwyn','JGL','Magier',-1,1,2,'Scaling'],['Krysa','JGL','Assassine',1,2,0,'Pick'],
 ['Torvald','JGL','Kämpfer',1,1,1,'Dive'],['Myrrh','JGL/MID','Magierin',0,1,2,'Poke'],['Brakka','JGL','Tank',0,2,1,'Engage'],['Silka','JGL','Jägerin',2,1,0,'Dive'],['Ostra','JGL','Kämpferin',0,1,2,'Scaling'],
 ['Lysander','MID','Magier',0,2,1,'Poke'],['Azura','MID','Magierin',-1,1,3,'Scaling'],['Rhenn','MID','Assassine',2,1,0,'Pick'],['Calyx','MID/SUP','Magier',0,2,1,'Engage'],['Duskan','MID','Assassine',1,2,0,'Dive'],
 ['Elowen','MID','Magierin',0,1,2,'Poke'],['Kazimir','MID/TOP','Kämpfer',2,1,0,'Dive'],['Noctis','MID','Magier',1,1,1,'Pick'],['Saphra','MID','Magierin',-1,1,3,'Scaling'],['Tavrin','MID','Magier',1,1,1,'Engage'],
 ['Rhea','ADC','Schützin',-1,1,3,'Scaling'],['Corvin','ADC','Schütze',0,2,1,'Poke'],['Jaskar','ADC','Schütze',2,1,0,'Dive'],['Lirael','ADC','Schützin',0,1,2,'Scaling'],['Mavek','ADC','Schütze',1,1,1,'Pick'],
 ['Sorrel','ADC','Schütze',0,2,1,'Poke'],['Kestrel','ADC','Schützin',1,2,0,'Dive'],['Varga','ADC','Schütze',-1,1,3,'Scaling'],['Ilyra','ADC','Schützin',0,1,2,'Engage'],['Brannoc','ADC','Schütze',2,1,-1,'Dive'],
 ['Ambra','SUP','Tank',1,1,1,'Engage'],['Pellin','SUP','Heilerin',0,1,2,'Scaling'],['Grisk','SUP','Tank',1,2,0,'Engage'],['Oriel','SUP/MID','Magierin',0,2,1,'Poke'],['Thessaly','SUP','Heilerin',-1,1,2,'Scaling'],
 ['Hakon','SUP','Tank',1,1,1,'Pick'],['Wren','SUP','Magierin',1,1,1,'Pick'],['Dorrin','SUP','Tank',0,1,2,'Engage'],['Liss','SUP','Magierin',1,1,1,'Poke'],['Merrow','SUP','Tank',2,1,0,'Dive']
];
const TAGBEAT={Dive:'Scaling',Scaling:'Poke',Poke:'Engage',Engage:'Pick',Pick:'Dive'};
const TAGPH={Dive:['e','m'],Scaling:['l'],Poke:['m'],Engage:['m','l'],Pick:['e','m']};
const TAGD={Dive:'Früher Druck auf die Backline',Scaling:'Wird mit der Zeit stärker',Poke:'Schwächt Gegner aus der Distanz',Engage:'Erzwingt Teamfights',Pick:'Fängt einzelne Gegner ab'};
const CHR={};ROLES.forEach(r=>CHR[r]=CH.map((c,i)=>i).filter(i=>CH[i][1].includes(r)));
function genChamps(p){const n=clamp(3+Math.round(p.d.pool/5),3,7),o=ovr(p);p.ch=shuffle(CHR[p.role].slice()).slice(0,n).map((c,i)=>[c,Math.round(clamp(p.d.pool*.45+o/10+gauss()*2-i*1.2+3,4,20))]).sort((a,b)=>b[1]-a[1])}
function mastery(p,c){const x=(p.ch||[]).find(y=>y[0]===c);return x?x[1]:5}
function isMeta(c){return !!(S.meta&&S.meta.includes(c))}
function compTags(picks){const c={};for(const r in picks){const ch=CH[picks[r]];if(ch)c[ch[6]]=(c[ch[6]]||0)+1}return c}
function compTag(picks){const c=compTags(picks);let b=null,n=0;for(const k in c)if(c[k]>n){n=c[k];b=k}return n>=2?b:null}
function aiPicks(T,banned,taken,roles,opp){const out={},otag=opp?compTag(opp):null;
  for(const r of roles){const p=S.players[T.starters[r]];let best=null,bs=-99;
    for(const c of CHR[r]){if(banned.includes(c)||taken.includes(c))continue;let sc=mastery(p,c)+(isMeta(c)?3:0)+R()*3;if(otag&&TAGBEAT[CH[c][6]]===otag)sc+=2;if(sc>bs){bs=sc;best=c}}
    out[r]=best;taken.push(best)}return out}
function aiBans(opp){const cand=[];for(const r of ROLES){const p=S.players[opp.starters[r]];for(const[c,m]of(p.ch||[]).slice(0,2))cand.push([c,m+ovr(p)/10+(isMeta(c)?2:0)+R()*3])}
  return cand.sort((a,b)=>b[1]-a[1]).map(x=>x[0]).filter((c,i,a)=>a.indexOf(c)===i).slice(0,3)}
function autoDraft(A,B){const b0=aiBans(B),b1=aiBans(A),ban=[...b0,...b1],taken=[];const pa=aiPicks(A,ban,taken,ROLES),pb=aiPicks(B,ban,taken,ROLES,pa);return[{bans:b0,picks:pa},{bans:b1,picks:pb}]}
function draftBonus(T,dr,od){const x={e:0,m:0,l:0};
  for(const r of ROLES){const c=dr.picks[r];if(c==null)continue;const ch=CH[c],p=S.players[T.starters[r]];x.e+=ch[3]*.25;x.m+=ch[4]*.25;x.l+=ch[5]*.25;
    const mb=(mastery(p,c)-11)*.07+(isMeta(c)?.4:0);x.e+=mb;x.m+=mb;x.l+=mb}
  const tags=compTags(dr.picks),tag=compTag(dr.picks),otag=od?compTag(od.picks):null;
  if(tag&&tags[tag]>=3){x.e+=.8;x.m+=.8;x.l+=.8}
  if(tag&&otag&&TAGBEAT[tag]===otag)for(const ph of TAGPH[tag])x[ph]+=2;
  return x}

/* ===== Match-Engine (minutenweise) ===== */
const KW={TOP:.15,JGL:.2,MID:.25,ADC:.3,SUP:.1};
const DMG={TOP:1,JGL:.9,MID:1.25,ADC:1.3,SUP:.55};
const CSR={TOP:8,JGL:5.8,MID:8.5,ADC:9,SUP:1.2};
const DRAKES=['Feuer','Ozean','Berg','Wolken'];
const INS={std:{n:'Standard',d:'Normales Spiel nach Plan.'},agg:{n:'Aggressiv',d:'Mehr Kämpfe und Druck im Early- und Midgame. Höheres Risiko.'},safe:{n:'Sicher spielen',d:'Weniger Kämpfe, Rückstände wachsen langsamer.'},obj:{n:'Objectives',d:'Vorteil bei Drachen, Baron und Türmen.'},split:{n:'Splitpush',d:'Mehr Türme, dafür schwächer in Teamfights im Lategame.'}};
const BT={top:[[8,30],[8,52],[8,72]],mid:[[36,64],[28,72],[20,80]],bot:[[70,92],[48,92],[28,92]],nex:[[12,84],[16,88]]};
const refl=([x,y])=>[100-x,100-y];
const TWR=[BT,{top:BT.bot.map(refl),mid:BT.mid.map(refl),bot:BT.top.map(refl),nex:BT.nex.map(refl)}];
const EPOS=[{TOP:[12,24],MID:[44,56],ADC:[76,88],SUP:[72,90]},{TOP:[24,12],MID:[56,44],ADC:[88,76],SUP:[90,72]}];
const JPOS=[[[26,62],[22,42],[58,80],[40,74],[34,50]],[[74,38],[78,58],[42,20],[60,26],[66,50]]];
const LANEPOS={TOP:[14,14],MID:[50,50],ADC:[84,86],SUP:[84,86]};
function avgD(T,x){let s=0;for(const r of ROLES)s+=S.players[T.starters[r]].d[x];return s/5}
function newSim(A,B,ctx,drafts,live){
  ctx=ctx||{};const dr=drafts||autoDraft(A,B);
  const XB={e:0,m:0,l:0},lscale=1.25-(avgD(A,'cns')+avgD(B,'cns'))/40*.6;
  if(ctx.big){const n=(avgD(A,'nrv')-avgD(B,'nrv'))*.35;XB.e+=n;XB.m+=n;XB.l+=n}
  if(ctx.gi>=2){const n=(avgD(A,'pool')-avgD(B,'pool'))*.15*Math.min(3,ctx.gi-1);XB.e+=n;XB.m+=n;XB.l+=n}
  XB.l+=(avgD(A,'con')-avgD(B,'con'))*.2;
  const ob=T=>(S.players[T.starters.JGL].d.obj*2+S.players[T.starters.SUP].d.obj+avgD(T,'obj')*2)/5,XO=(ob(A)-ob(B))*.25;
  const da=draftBonus(A,dr[0],dr[1]),db=draftBonus(B,dr[1],dr[0]);for(const k in XB)XB[k]+=da[k]-db[k];
  const st=[ROLES.map(r=>S.players[A.starters[r]].id),ROLES.map(r=>S.players[B.starters[r]].id)],ps={};
  for(const ids of st)for(const id of ids)ps[id]={k:0,d:0,a:0,cs:0,dmg:0};
  const z={tac:[tacOf(A),tacOf(B)],A:A.id,B:B.id,ctx,dr,live:!!live,P:[teamPower(A,B),teamPower(B,A)],XB,luck:gauss()*4.6*lscale,XO,G:0,t:0,fb:false,nextDrag:5,nextBaron:20,buff:[-1,-1],elder:[-1,-1],soul:-1,winner:-1,end:0,
    s:{k:[0,0],tw:[0,0],dr:[0,0],bn:[0,0]},st,ps,ev:[],tl:[{t:0,G:0,k:[0,0],tw:[0,0],dr:[0,0],bn:[0,0]}],ins:['std','std'],lost:[{top:0,mid:0,bot:0,nex:0},{top:0,mid:0,bot:0,nex:0}],dead:{},pos:null,evLoc:null,first:{}};
  z.pw=((z.P[0].e+z.P[0].m+z.P[0].l)-(z.P[1].e+z.P[1].m+z.P[1].l))/3+(XB.e+XB.m+XB.l)/3;z.tl[0].wp=winProb(z);
  return z;
}
/* Geschätzte Siegchance von Blau (Seite 0) aus dem sichtbaren Spielstand: Stärke und Draft vorab, mit der Zeit zählen Gold und Objectives mehr.
   Nur Anzeige, verändert nichts am Spiel. */
function winProb(z){const t=z.t,s=z.s,x0=.235*(z.pw||0)*Math.max(.25,1-t/45);
  const x=x0+(z.G/7000)*(.5+Math.min(1,t/30)*.9)+(s.tw[0]-s.tw[1])*.12+(s.dr[0]-s.dr[1])*.12+(s.bn[0]-s.bn[1])*.35+(z.soul===0?.5:z.soul===1?-.5:0)+(z.elder[0]>=t?.6:0)-(z.elder[1]>=t?.6:0)+(z.buff[0]>=t?.3:0)-(z.buff[1]>=t?.3:0);
  return clamp(sig(x),.02,.98)}
/* Ereignisarten: Gewicht 0 Nebensache, 1 Wichtig, 2 Highlight, 3 Wendepunkt-Kandidat */
const EVK={duel:[0,'Duell'],gank:[1,'Gank'],fight:[1,'Teamfight'],bigfight:[2,'Teamfight'],fb:[2,'First Blood'],ace:[3,'Ace'],drake:[2,'Drache'],soul:[3,'Drachenseele'],elder:[3,'Elder'],herald:[2,'Herold'],tower:[1,'Turm'],inhib:[2,'Inhibitor'],baron:[3,'Baron'],decide:[3,'Entscheidung'],nexus:[3,'Nexus']};
function simTick(z){
  if(z.winner>=0)return true;
  const t=++z.t,ph=t<14?'e':t<25?'m':'l',T=[S.teams[z.A],S.teams[z.B]],P=z.ps,s=z.s;
  const pl=i=>z.st[i].map(id=>S.players[id]);
  const sg=w=>w===0?1:-1,tn=w=>T[w].name;
  for(const i of[0,1])if(t%4===1){const lead=sg(i)*z.G;z.ins[i]=lead>2500?'obj':lead<-3500?pick(['safe','agg','split']):pick(['std','std','obj','agg'])}
  const I=z.ins;
  let d=z.P[0][ph]-z.P[1][ph]+z.luck+z.XB[ph];if(z.soul===0)d+=3;if(z.soul===1)d-=3;
  for(const i of[0,1]){const v=I[i],q=sg(i);if(v==='agg'&&ph!=='l')d+=1.2*q;if(v==='safe')d-=.6*q;if(v==='split'&&ph==='l')d-=1*q}
  const objB=(I[0]==='obj'?.8:0)-(I[1]==='obj'?.8:0);
  z.G+=d*9+gauss()*320;
  const tk=(k,i)=>OBJF[z.tac[i].obj][1][k]+VISION[z.tac[i].vision][2];
  const pA=(div,ob)=>sig((d+(ob?objB+tk(ob,0)-tk(ob,1)+(z.XO||0):0)+z.G/(div||2200))/10);
  let loc=null;
  const add=(side,text,big,kind)=>{kind=kind||'duel';z.ev.push({t,side,text,big:!!big,k:kind,w:EVK[kind][0]})};
  const killer=w=>{let x=R(),acc=0;const a=pl(w);for(const p of a){acc+=KW[p.role];if(x<acc)return p}return a[3]};
  const kill=w=>{const k=killer(w),v=pick(pl(1-w));P[k.id].k++;P[v.id].d++;s.k[w]++;z.dead[v.id]=t;
    const helpers=shuffle(pl(w).filter(p=>p.id!==k.id)).slice(0,ri(0,3));for(const h of helpers)P[h.id].a++;return[k,v]};
  const swing=(w,amt)=>{let a=amt;if(I[1-w]==='safe')a*=.7;if(I[0]==='agg'||I[1]==='agg')a*=1.15;z.G+=sg(w)*a};
  const fightDmg=(w,mul)=>{for(const i of[0,1])for(const p of pl(i))P[p.id].dmg+=Math.round((600+R()*1200)*DMG[p.role]*(.7+p.d.mec/20*.6)*mul*(i===w?1:.6))};
  // Farm & Poke
  for(const i of[0,1])for(const p of pl(i)){const x=P[p.id];if(z.dead[p.id]!==t-1)x.cs+=Math.round(CSR[p.role]*(.72+p.d.frm/20*.28+(p.d.wav||p.d.frm)/20*.1)*(.85+R()*.3)*(ph==='l'?.85:1));x.dmg+=Math.round(140*DMG[p.role]*(1+t/40))}
  // Kämpfe
  let fp=(ph==='e'?.3:ph==='m'?.4:.45)*(TEMPO[z.tac[0].tempo][2]+TEMPO[z.tac[1].tempo][2])/2;for(const v of I){if(v==='agg')fp*=1.3;if(v==='safe')fp*=.75}
  if(R()<Math.min(.85,fp)){
    const w=R()<pA()?0:1;
    if(!z.fb){const[k,v]=kill(w);swing(w,400);add(w,`First Blood! ${k.name} erwischt ${v.name}.`,true,'fb');z.fb=true;z.first.fb=w;loc=LANEPOS[v.role]||pick(JPOS[1-w]);fightDmg(w,.4)}
    else if(ph==='e'){
      const n=R()<.32?2:1,ln=R()<.2?1:0;let k,v;for(let i=0;i<n;i++)[k,v]=kill(w);for(let i=0;i<ln;i++)kill(1-w);swing(w,(n-ln)*300);fightDmg(w,.5);
      loc=LANEPOS[v.role]||pick(JPOS[1-w]);
      if(n===2){const j=pl(w)[1];add(w,`Gank von ${j.name}: ${tn(w)} holt ${n} Kills${ln?', verliert aber einen Spieler':''}.`,false,'gank')}
      else add(w,ln?`Trade auf der Lane: ${k.name} und ${tn(1-w)} tauschen je einen Kill.`:`${k.name} gewinnt das Duell gegen ${v.name}.`,false,'duel');
    }else{
      const n=ri(2,ph==='l'?5:4),ln=ri(0,Math.min(2,n-1));for(let i=0;i<n;i++)kill(w);for(let i=0;i<ln;i++)kill(1-w);swing(w,(n-ln)*320);fightDmg(w,1);
      loc=[50+clamp(z.G/600,-22,22),50-clamp(z.G/600,-22,22)];
      add(w,n===5&&ln===0?`ACE! ${tn(w)} löscht das gegnerische Team aus.`:`Teamfight: ${tn(w)} gewinnt ${n} zu ${ln}.`,n>=4,n===5&&ln===0?'ace':n>=4?'bigfight':'fight');
    }
  }
  // Drachen
  if(t===z.nextDrag){
    if(z.soul===-1){const w=R()<pA(1200,'d')?0:1;s.dr[w]++;swing(w,250);z.nextDrag=t+5;loc=[70,70];if(z.first.dr==null)z.first.dr=w;
      if(s.dr[w]===4){z.soul=w;add(w,`Drachenseele für ${tn(w)}! Das Team ist im Lategame klar stärker.`,true,'soul')}
      else add(w,`${tn(w)} sichert den ${pick(DRAKES)}-Drachen (${s.dr[w]}).`,false,'drake')}
    else if(t>=30){const w=R()<pA(1000,'d')?0:1;z.elder[w]=t+2;swing(w,600);z.nextDrag=t+6;loc=[70,70];add(w,`${tn(w)} holt den Elder-Drachen.`,true,'elder')}
    else z.nextDrag=t+5;
  }
  // Herold & Türme
  const tower=w=>{const L=z.lost[1-w],lanes=['top','mid','bot'].filter(l=>L[l]<3);let ln,pos;
    if(lanes.length){ln=pick(lanes);pos=TWR[1-w][ln][L[ln]];L[ln]++}else if(L.nex<2){ln='nex';pos=TWR[1-w].nex[L.nex];L.nex++}else return null;
    s.tw[w]++;swing(w,250);if(z.first.tw==null)z.first.tw=w;return{ln,pos,c:s.tw[w]}};
  const tkind=r=>r.ln==='nex'||r.c>6?'inhib':'tower';
  const twTxt=(w,r)=>`${tn(w)} zerstört ${r.ln==='nex'?'einen Nexus-Turm':(r.c<=3?'einen Außenturm':r.c<=6?'einen Innenturm':'einen Inhibitor-Turm')+(r.ln==='top'?' auf der Toplane':r.ln==='mid'?' auf der Midlane':' auf der Botlane')}.`;
  if(t===8||t===14){const w=R()<pA(1200,'b')?0:1;const r=tower(w);swing(w,100);loc=[30,30];add(w,`${tn(w)} setzt den Herold ein${r?' und reißt einen Turm':''}.`,false,'herald')}
  if(t>=11){let ch=Math.min(.45,.08+Math.abs(z.G)/14000);const lead=z.G>=0?0:1;if(I[lead]==='obj')ch*=1.2;
    if(R()<ch){const w=R()<.8?lead:1-lead,r=tower(w);if(r){add(w,twTxt(w,r),false,tkind(r));loc=r.pos}}
    for(const i of[0,1])if(I[i]==='split'&&R()<.12){const r=tower(i);if(r){add(i,`Splitpush: ${twTxt(i,r)}`,false,tkind(r));loc=r.pos}}}
  // Baron
  const baron=(w,txt)=>{s.bn[w]++;swing(w,1200);z.buff[w]=t+3;z.nextBaron=t+6;loc=[30,30];add(w,txt,true,'baron');if(R()<.6){const n=ri(1,3);for(let i=0;i<n;i++)kill(w)}};
  if(t>=z.nextBaron&&z.buff[0]<t&&z.buff[1]<t&&R()<.3){const w=R()<pA(1000,'b')?0:1;baron(w,R()<.12?`Steal! ${pl(w)[1].name} klaut den Baron für ${tn(w)}.`:`${tn(w)} erlegt den Baron.`)}
  // Ende
  if(t>=25){
    const L=z.G>=0?0:1,lead=Math.abs(z.G);
    let pusher=L,ch=(z.buff[L]>=t?.18:0)+Math.max(0,(lead-9000)/17000)+(s.tw[L]>=8?.12:0)+(t>=38?.1:0);
    if(z.elder[0]>=t||z.elder[1]>=t){pusher=z.elder[0]>=t?0:1;ch=Math.max(ch,.45)}
    if(R()<ch)z.winner=pusher;
    else if(t>=31&&R()<.08){const w=R()<pA(2000)?0:1;z.winner=w;const n=ri(3,5);for(let i=0;i<n;i++)kill(w);fightDmg(w,1.2);loc=[50,50];add(w,`Entscheidender Teamfight in Minute ${t}: ${tn(w)} gewinnt ${n} zu 0 und rennt durch.`,true,'decide')}
  }
  if(t>=55&&z.winner<0)z.winner=z.G>=0?0:1;
  z.tl.push({t,G:Math.round(z.G),k:[...s.k],tw:[...s.tw],dr:[...s.dr],bn:[...s.bn],wp:+winProb(z).toFixed(3)});
  z.evLoc=loc;for(let i=z.ev.length-1;i>=0&&z.ev[i].t===t;i--)z.ev[i].loc=loc;
  if(z.winner>=0){add(z.winner,`${tn(z.winner)} zerstört den Nexus. Sieg nach ${t} Minuten.`,true,'nexus');z.tl[z.tl.length-1].wp=z.winner===0?1:0;z.end=t;z.evLoc=z.winner===0?[92,8]:[8,92];finishSim(z);return true}
  if(z.live)z.pos=simPos(z,ph);
  return false;
}
function simPos(z,ph){const pos={},t=z.t,c=[50+clamp(z.G/600,-22,22),50-clamp(z.G/600,-22,22)];
  [0,1].forEach(i=>z.st[i].forEach(id=>{const p=S.players[id],j=()=>(R()-.5)*8;let x,y;
    if(z.dead[id]===t){[x,y]=i===0?[6,94]:[94,6];pos[id]=[x,y,1];return}
    if(ph==='e'&&!z.evLoc){if(p.role==='JGL')[x,y]=pick(JPOS[i]);else[x,y]=EPOS[i][p.role]}
    else{const ctr=z.evLoc||c;if(z.ins[i]==='split'&&p.role==='TOP'&&!z.evLoc)[x,y]=i===0?[10,20]:[80,90];else[x,y]=[ctr[0]+(i===0?-4:4),ctr[1]+(i===0?4:-4)]}
    pos[id]=[clamp(x+j(),3,97),clamp(y+j(),3,97),0]}));return pos}
function rating(z,id,side){const x=z.ps[id],ids=z.st[side],td=ids.reduce((s,i)=>s+z.ps[i].dmg,0)||1,p=S.players[id],opp=z.st[1-side][ROLES.indexOf(p.role)];
  let r=6.2+.32*x.k+.14*x.a-.38*x.d+(x.cs-z.ps[opp].cs)/70+(x.dmg/td-.2)*4;if(z.winner>=0)r+=z.winner===side?.5:-.2;return clamp(r,3,10)}
function finishSim(z){if(z.fin)return z;z.fin=true;if(!z.end)z.end=z.t;
  z.K=[{},{}];z.D=[{},{}];z.rt={};z.kills=[...z.s.k];
  [0,1].forEach(i=>z.st[i].forEach(id=>{z.K[i][id]=z.ps[id].k;z.D[i][id]=z.ps[id].d;z.rt[id]=+rating(z,id,i).toFixed(1)}));
  let best=-1;for(const id of z.st[z.winner])if(z.rt[id]>best){best=z.rt[id];z.mvp=id}
  z.pos=null;return z}
function simGame(A,B,ctx,drafts){const z=newSim(A,B,ctx,drafts,false);while(!simTick(z));return z}

function moraleAfter(T,won,mvp){for(const id of ROLES.map(r=>T.starters[r])){const p=S.players[id];p.morale=clamp(p.morale+(won?4:-3),20,100);p.form=clamp(p.form+(won?2:-2)+(id===mvp?3:0),30,100)}}
function simSeries(a,b,bo,big){
  const A=S.teams[a],B=S.teams[b],need=Math.ceil(bo/2),sc=[0,0],k=[0,0];let last;
  while(sc[0]<need&&sc[1]<need){const g=simGame(A,B,{big,gi:sc[0]+sc[1]+1});sc[g.winner]++;k[0]+=g.kills[0];k[1]+=g.kills[1];last=g;addStats(g,A,B);moraleAfter(A,g.winner===0,g.mvp);moraleAfter(B,g.winner===1,g.mvp)}
  return{w:sc[0]>sc[1]?a:b,k,score:sc,mvp:S.players[last.mvp].name};
}
function mk(a,b,bo,tag){return{a,b,bo,tag,label:'',w:null,score:[0,0],k:[0,0],mvp:null}}
function resolve(m){const r=simSeries(m.a,m.b,m.bo,m.big);m.w=r.w;m.score=r.score;m.k=r.k;m.mvp=r.mvp}
function circle(ids){const n=ids.length;let arr=ids.slice();const rounds=[];
  for(let r=0;r<n-1;r++){const pairs=[];for(let i=0;i<n/2;i++){const a=arr[i],b=arr[n-1-i];pairs.push(r%2?[b,a]:[a,b])}rounds.push(pairs);arr=[arr[0],arr[n-1],...arr.slice(1,n-1)]}
  return rounds}
function tableOf(ids,matches){
  const tb={};for(const id of ids)tb[id]={id,w:0,l:0,kd:0,form:[]};
  for(const m of matches){if(!m.w||!tb[m.a]||!tb[m.b])continue;const L=m.w===m.a?m.b:m.a;tb[m.w].w++;tb[L].l++;tb[m.a].kd+=m.k[0]-m.k[1];tb[m.b].kd+=m.k[1]-m.k[0];tb[m.w].form.push(1);tb[L].form.push(0)}
  return Object.values(tb).sort((x,y)=>y.w-x.w||y.kd-x.kd);
}
