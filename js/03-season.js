/* ===== Kalender & Events ===== */
function initEvent(def){return def.type==='split'?initSplit(def):initIntl(def)}
function setCur(ev,list){ev.cur=list;const l=evLabel(ev),big=ev.type==='intl'||ev.stage!=='rr';for(const m of list){m.label=l;m.big=big}}
function evLabel(ev){
  if(ev.type==='split')return ev.stage==='rr'?`${ev.name} · Woche ${ev.round+1}/7`:`${ev.name} · ${ev.stage==='semi'?'Halbfinale':'Finale'}`;
  return `${ev.name} · ${stageLabel(ev.stage)}`;
}
function roundName(n){return n>=8?'Viertelfinale':n===4?'Halbfinale':'Finale'}
function stageLabel(st){
  if(st.kind==='groups')return `Gruppenphase · Runde ${st.round+1}/3`;
  if(st.kind==='swiss')return `Swiss-Phase · Runde ${st.round+1}`;
  return st.label==='Play-In'?'Play-In':roundName(st.alive.length);
}
/* Split */
function newPatch(){S.patch=(S.patch||0)+1;metaShift();metaLog(`Patch ${S.year-2000}.${S.patch}: ${STYLES[S.mst.style].n} und ${RN[S.mst.role]} im Fokus`);S.meta=shuffle(CH.map((c,i)=>i)).slice(0,10);mail(`Patch ${S.year-2000}.${S.patch}`,`Neuer Patch zum Split. Meta-Champions: ${S.meta.map(c=>CH[c][0]).join(', ')}. Meta-Picks geben im Draft einen Bonus.`)}
function initSplit(def){newPatch();
  const ev={id:def.id,type:'split',name:def.name,stage:'rr',round:0,reg:{}};
  for(const r of REGS)ev.reg[r]={ids:teamsOf(r).map(t=>t.id),sched:circle(shuffle(teamsOf(r).map(t=>t.id))),res:[],po:null,order:null};
  setCur(ev,splitRound(ev));return ev;
}
function splitRound(ev){const out=[];for(const r of REGS){const sc=ev.reg[r].sched,R=sc.length;sc.forEach((rd,i)=>{if(Math.floor(i*7/R)===ev.round)for(const[a,b]of rd)out.push(mk(a,b,1,r))})}return out}
function splitAdvance(ev){
  if(ev.stage==='rr'){
    for(const m of ev.cur)ev.reg[m.tag].res.push(m);ev.round++;
    if(ev.round<7){setCur(ev,splitRound(ev));return false}
    const list=[];for(const r of REGS){const st=tableOf(ev.reg[r].ids,ev.reg[r].res).map(x=>x.id);ev.reg[r].table=st;ev.reg[r].po={semis:[mk(st[0],st[3],5,r),mk(st[1],st[2],5,r)],final:null};list.push(...ev.reg[r].po.semis)}
    ev.stage='semi';setCur(ev,list);return false;
  }
  if(ev.stage==='semi'){const list=[];for(const r of REGS){const po=ev.reg[r].po;po.final=mk(po.semis[0].w,po.semis[1].w,5,r);list.push(po.final)}ev.stage='final';setCur(ev,list);return false}
  for(const r of REGS){const g=ev.reg[r],f=g.po.final,champ=f.w,run=f.a===champ?f.b:f.a;
    const sl=g.po.semis.map(m=>m.a===m.w?m.b:m.a).sort((x,y)=>g.table.indexOf(x)-g.table.indexOf(y));
    g.order=[champ,run,...sl,...g.table.filter(id=>![champ,run,...sl].includes(id))]}
  return true;
}
/* International */
function seedOf(split,r,i){const o=S.rec[split]&&S.rec[split][r];return o?o[i]:null}
function initIntl(def){
  const ev={id:def.id,type:'intl',name:def.name,stageNo:0,place:{},past:[],teams:[],seeded:[]};
  if(def.id==='FS'){const g=r=>seedOf('S1',r,0),h=r=>seedOf('S1',r,1);
    const A=[g('LCK'),g('LEC'),g('LCP'),h('LPL')],B=[g('LPL'),g('LCS'),g('CBLOL'),h('LCK')];ev.teams=[...A,...B];ev.stage=mkGroups([A,B])}
  else if(def.id==='MSI'){const ones=REGS.map(r=>seedOf('S2',r,0)),twoR=['LCK','LPL','LEC','LCS','LCP'];
    const fsChamp=S.rec.FS&&S.rec.FS.champ;let skipR=fsChamp?S.teams[fsChamp].reg:'LCK';if(!twoR.includes(skipR))skipR='LCK';
    ev.skipR=skipR;ev.seeded=[...ones,seedOf('S2',skipR,1)];const pin=twoR.filter(r=>r!==skipR).map(r=>seedOf('S2',r,1));
    ev.teams=[...ev.seeded,...pin];ev.stage=mkBracket(seedOrder(pin),5,'Play-In')}
  else if(def.id==='DC'){const pk=(r,arr)=>arr.map(i=>seedOf('S3',r,i));
    const list=[...pk('LPL',[4,5,6]),...pk('LCK',[4,5,6]),...pk('LEC',[3,4]),...pk('LCS',[2,3]),...pk('LCP',[2]),...pk('CBLOL',[2])];
    ev.teams=list;ev.stage=mkSwiss(list,'fixed')}
  else{const pk=(r,n)=>Array.from({length:n},(_,i)=>seedOf('S3',r,i));
    ev.seeded=[...pk('LCK',4),...pk('LPL',4),...pk('LEC',3),...pk('LCS',1),...pk('LCP',2),...pk('CBLOL',1)];
    const pin=[seedOf('S3','LCS',1),seedOf('S3','CBLOL',1)];ev.teams=[...ev.seeded,...pin];ev.stage=mkBracket(pin,5,'Play-In')}
  setCur(ev,ev.stage.cur);
  return ev;
}
function seedOrder(l){return l.length===8?[0,7,3,4,1,6,2,5].map(i=>l[i]):l.length===4?[0,3,1,2].map(i=>l[i]):l.slice()}
function pairs(list,bo,tag){const o=[];for(let i=0;i<list.length;i+=2)o.push(mk(list[i],list[i+1],bo,tag));return o}
function mkBracket(alive,bo,label){const st={kind:'bracket',bo,label,alive:alive.slice(),elim:[],hist:[]};st.cur=pairs(st.alive,bo,label);return st}
function mkGroups(groups){const st={kind:'groups',groups,round:0,res:[],sch:groups.map(g=>circle(g)),elim:[]};st.cur=groupRound(st);return st}
function groupRound(st){const o=[];st.sch.forEach((rs,gi)=>rs[st.round].forEach(([a,b])=>o.push(mk(a,b,3,'Gruppe '+'AB'[gi]))));return o}
function mkSwiss(teams,mode){const st={kind:'swiss',mode,teams:teams.slice(),rec:{},round:0,elim:[],res:[]};for(const t of teams)st.rec[t]={w:0,l:0,kd:0,opp:[]};st.cur=swissPair(st);return st}
function swissActive(st){return st.teams.filter(t=>st.mode==='fixed'||(st.rec[t].w<3&&st.rec[t].l<3))}
function swissPair(st){
  const rc=st.rec,pool=shuffle(swissActive(st)).sort((x,y)=>rc[y].w-rc[x].w||rc[x].l-rc[y].l),out=[];
  const key=t=>rc[t].w+'-'+rc[t].l;
  while(pool.length>1){const a=pool.shift();let j=pool.findIndex(b=>key(b)===key(a)&&!rc[a].opp.includes(b));if(j<0&&st.mode!=='fixed')j=pool.findIndex(b=>key(b)===key(a));if(j<0)j=pool.findIndex(b=>!rc[a].opp.includes(b));if(j<0)j=0;const b=pool.splice(j,1)[0];
    let bo;if(st.mode==='fixed')bo=st.round===0?1:3;else bo=(rc[a].w===2||rc[a].l===2||rc[b].w===2||rc[b].l===2)?3:1;
    out.push(mk(a,b,bo,`${rc[a].w}-${rc[a].l}`))}
  return out;
}
function stageAdvance(st){
  if(st.kind==='bracket'){const win=[],lose=[];for(const m of st.cur){win.push(m.w);lose.push(m.w===m.a?m.b:m.a)}
    st.elim.push({label:st.label==='Play-In'?'Play-In':roundName(st.alive.length),ids:lose});st.hist.push(st.cur);st.alive=win;
    if(win.length===1){st.out=win;return true}st.cur=pairs(win,st.bo,st.label);return false}
  if(st.kind==='groups'){st.res.push(...st.cur);st.round++;if(st.round<3){st.cur=groupRound(st);return false}
    const ta=tableOf(st.groups[0],st.res).map(x=>x.id),tb=tableOf(st.groups[1],st.res).map(x=>x.id);
    st.tables=[ta,tb];st.out=[ta[0],tb[1],tb[0],ta[1]];st.elim.push({label:'Gruppenphase',ids:[ta[2],ta[3],tb[2],tb[3]]});return true}
  for(const m of st.cur){const L=m.w===m.a?m.b:m.a,rw=st.rec[m.w],rl=st.rec[L],kw=m.w===m.a?m.k[0]-m.k[1]:m.k[1]-m.k[0];
    rw.w++;rl.l++;rw.kd+=kw;rl.kd-=kw;rw.opp.push(L);rl.opp.push(m.w);st.res.push(m)}
  st.round++;const rc=st.rec;
  if(st.mode==='fixed'){if(st.round<3){st.cur=swissPair(st);return false}
    const srt=st.teams.slice().sort((x,y)=>rc[y].w-rc[x].w||rc[y].kd-rc[x].kd);st.out=srt.slice(0,8);st.elim.push({label:'Swiss-Phase',ids:srt.slice(8)});return true}
  if(swissActive(st).length){st.cur=swissPair(st);if(st.cur.length&&st.round<9)return false;
    for(const t of swissActive(st)){if(rc[t].w>=rc[t].l)rc[t].w=3;else rc[t].l=3}}
  const srt=st.teams.slice().sort((x,y)=>rc[y].w-rc[x].w||rc[x].l-rc[y].l||rc[y].kd-rc[x].kd);st.out=srt.slice(0,8);st.elim.push({label:'Swiss-Phase',ids:srt.slice(8)});return true;
}
function intlAdvance(ev){
  const st=ev.stage;
  if(!stageAdvance(st)){setCur(ev,st.cur);return false}
  for(const e of st.elim)for(const id of e.ids)ev.place[id]=e.label;
  ev.past.push(st);let nx=null;const n=ev.stageNo;
  if(ev.id==='FS'&&n===0)nx=mkBracket(st.out,5,'KO');
  else if(ev.id==='MSI'&&n===0)nx=mkBracket(seedOrder([...ev.seeded,st.out[0]]),5,'KO');
  else if(ev.id==='DC'&&n===0)nx=mkBracket(seedOrder(st.out),5,'KO');
  else if(ev.id==='WLD'&&n===0)nx=mkSwiss([...ev.seeded,st.out[0]],'33');
  else if(ev.id==='WLD'&&n===1)nx=mkBracket(seedOrder(st.out),5,'KO');
  if(nx){ev.stage=nx;ev.stageNo++;setCur(ev,nx.cur);return false}
  ev.champ=st.out[0];ev.place[ev.champ]='Sieger';return true;
}
function startMail(ev){
  const U=S.teams[S.user];
  if(ev.type==='split'){if(ev.id==='S3'){const exp=U.roster.map(i=>S.players[i]).filter(p=>p.contract<=1);if(exp.length)mail('Verträge laufen aus',`Am Saisonende enden die Verträge von ${exp.map(p=>p.name).join(', ')}. Verlängern kannst du im Kader.`)}return}
  const inn=ev.teams.includes(S.user);if(inn)sponsorBonus('intl');
  mail(`${ev.name} ${S.year}`,inn?`Dein Team ist qualifiziert. ${INTLINFO[ev.id]}`:`Dein Team ist nicht dabei. Die Wochen laufen ohne dich, du kannst die Spiele unter Liga verfolgen.`);
}
function finishEvent(ev){
  const U=S.teams[S.user];
  if(ev.type==='split'){S.rec[ev.id]={};for(const r of REGS)S.rec[ev.id][r]=ev.reg[r].order;S.splits[ev.id]=ev;
    const pl=ev.reg[U.reg].order.indexOf(S.user)+1,pr=SPLITPRIZE[pl-1]||5000;book('Preisgeld',pr);if(pl===1)sponsorBonus('title');
    const champ=S.teams[ev.reg[U.reg].order[0]];for(const r of REGS){const c=S.teams[ev.reg[r].order[0]];if(c)news(`${c.name} gewinnt den ${ev.name} der ${r}.`,'title')}
    mail(`${ev.name} beendet`,pl===1?`Dein Team gewinnt den ${ev.name} der ${U.reg}! Preisgeld ${eurK(pr)}.`:`${champ.name} gewinnt den ${ev.name}. Dein Team wird ${pl}. Preisgeld ${eurK(pr)}.`);
    if(pl===1){S.trophies.unshift({year:S.year,name:`${U.reg} ${ev.name}`});raiseDemands();titleBonus()}
    try{boardSplit(ev.id)}catch(e){}
  }else{
    S.rec[ev.id]={champ:ev.champ,place:ev.place};
    for(const id in ev.place){const b=REPB[ev.place[id]]||0;if(b)S.teams[id].rep=clamp(S.teams[id].rep+b,45,95)}
    const myp=ev.place[S.user];
    news(`${S.teams[ev.champ].name} (${S.teams[ev.champ].reg}) gewinnt ${ev.name} ${S.year}.`,'title');
    if(myp){const pr=PRZ[ev.id][myp]||0;book('Preisgeld',pr);if(myp==='Sieger')sponsorBonus('title');S.fin.fans=Math.round(S.fin.fans*(1+(REPB[myp]||0)*.02));
      if(myp==='Sieger'){S.trophies.unshift({year:S.year,name:ev.name});titleBonus()}
      mail(myp==='Sieger'?`${ev.name}-Sieger!`:`${ev.name}: ${myp}`,myp==='Sieger'?`Dein Team gewinnt ${ev.name} ${S.year}. Preisgeld ${eurK(pr)}.`:`Aus in der Runde ${myp}. ${S.teams[ev.champ].name} (${S.teams[ev.champ].reg}) gewinnt das Turnier. Preisgeld ${eurK(pr)}.`)}
    else mail(`${ev.name} vorbei`,`${S.teams[ev.champ].name} aus der ${S.teams[ev.champ].reg} gewinnt ${ev.name} ${S.year}.`);
  }
  S.ci++;
  if(S.ci>=CAL.length){S.ev=null;endSeason();return}
  S.ev=initEvent(CAL[S.ci]);if(S.ev.type==='split'){budgetReview();try{pressPreview()}catch(e){}}startMail(S.ev);
}

/* ===== Wochenablauf ===== */
function userPending(){if(!S.ev)return null;return S.ev.cur.find(m=>!m.w&&(m.a===S.user||m.b===S.user))||null}
function step(){
  const ev=S.ev;if(!ev)return;
  relink(ev);
  for(const m of ev.cur)if(!m.w)resolve(m);
  const ur=S.teams[S.user].reg;
  S.lastRound={label:evLabel(ev),list:ev.type==='split'?ev.cur.filter(m=>m.tag===ur):ev.cur.slice()};
  chemStreak(ev);newsWeek(ev.cur);S.step++;weekTick();chemWeek();pevWeek();chemEventWeek();achCheck();
  for(const m of S.inbox)if(m.type==='pev'&&!m.done&&m.exp<=S.step){m.done=true;m.result='Keine Entscheidung getroffen'}
  const done=ev.type==='split'?splitAdvance(ev):intlAdvance(ev);
  if(done)finishEvent(ev);
  save();
}
function weekTick(){
  const U=S.teams[S.user];
  const f=S.fin;
  for(const[k,n]of SLOTS.slice(0,2))if(!f.slots[k]&&f.offers[k]){f.slots[k]=f.offers[k][0];f.slots[k].sat=60;mail('Sponsor unterschrieben',`Der Vorstand hat ${f.slots[k].name} als ${n} unter Vertrag genommen (Festbetrag ${eurK(f.slots[k].base)} pro Woche bis Saisonende).`)}
  const L={};
  L.Sponsoren=sponsorBase();sponsorWeek();
  L.Streaming=Math.round(f.fans*.018*regRev());
  L.Merchandise=Math.round(f.fans*.012*MERCH[f.merch].m*regRev());
  L['Liga-Ausschüttung']=LSHARE[U.reg]||4000;
  if(S.teams[S.user+'A'])L['T2-Förderung']=2000;
  L.Spielerstreams=f.pstream?Math.round(U.roster.length*500*U.rep/70):0;
  L.Gehälter=-U.roster.reduce((s,id)=>s+wageOf(S.players[id]),0);
  if(f.adv){const cut=Math.min(f.adv.left,Math.round(L.Sponsoren*.25));L['Vorschuss-Rückzahlung']=-cut;f.adv.left-=cut;if(f.adv.left<=0){f.adv=null;mail('Vorschuss beglichen','Der Sponsor-Vorschuss ist vollständig verrechnet.')}}
  L.Staff=-staffWages();
  L['Content-Team']=-CONTENT[f.content][0];
  L.Infrastruktur=-upkeep();
  {const A=aca();if(A)L['Academy-Gehälter']=-A.roster.reduce((x,i)=>x+S.players[i].salary,0)}
  if(f.loan){const pay=Math.min(f.loan.weekly,f.loan.left);L.Kreditrate=-pay;f.loan.left-=pay;if(f.loan.left<=0){f.loan=null;mail('Kredit abbezahlt','Der Kredit ist vollständig zurückgezahlt.')}}
  for(const k in L)book(k,L[k]);
  infraWeek();trialWeek();burnWeek();worldWeek();
  f.last=L;f.weeks.push(netW());f.hist.push(f.balance);
  {const fs=finState();if(fs.proj<0&&f.balance>=0&&S.step%8===4)mail('Finanzen: Warnung',`Die Prognose fürs Saisonende liegt bei ${eurK(fs.proj)}. Mögliche Hebel: Spieler verkaufen, Content-Team oder Infrastruktur zurückfahren, Merch-Preise anpassen, einen Sponsor-Vorschuss nehmen oder Gehälter beim nächsten Vertrag drücken.`)}
  if(f.balance<-50000&&!f.bail){f.bail=true;const amt=r1000(150000+U.rep*1500);book('Vorstandshilfe',amt);S.board=clamp(S.board-12,0,100);mail('Der Vorstand springt ein',`Das Konto lag deutlich im Minus. Der Vorstand schießt einmalig ${eurK(amt)} nach, das Vertrauen sinkt deutlich. Ein zweites Mal gibt es diese Saison nicht.`)}
  if(f.balance<0&&!f.budget.frozen){f.budget.frozen=true;f.budget.transfer=0;mail('Budget eingefroren','Das Konto ist im Minus. Der Vorstand streicht das Transferbudget, bis die Finanzen wieder stimmen.')}if(f.hist.length>80)f.hist.shift();
  f.fans=Math.round(f.fans*(1+(CONTENT[f.content][1]+MERCH[f.merch].f)/100));
  for(const id of U.roster){const p=S.players[id];if(f.pstream)p.form=clamp(p.form-1.2*(1.3-p.d.sta/20*.6),30,100);{const gr=ghRel();if(gr){p.morale=clamp(p.morale+.6*gr,20,100);p.form=clamp(p.form+.3*gr,30,100)}}p.form=clamp(p.form+((f.hw??60)-60)/150,30,100)}
  for(const id in S.teams){const T=S.teams[id];if(id===S.user)trainUser(T,false);else if(id===acaId())trainUser(T,true);else trainTeam(T,pick(['bal','tech','mental','team','mind']),'normal',2,false)}
  for(const id of U.roster){const p=S.players[id];if(!ROLES.some(r=>U.starters[r]===id))p.morale=clamp(p.morale-.5,20,100)}
  trainKnow();t2Week();scoutWeek();mentorWeek();
  {const mb=motBonus();if(mb)for(const id of U.roster){const p=S.players[id];p.morale=clamp(p.morale+mb,20,100)}}

  for(const id of U.roster){const p=S.players[id];if(p.promise==='start'){if(isStarter(p))p.pweeks=0;else{p.pweeks=(p.pweeks||0)+1;p.morale=clamp(p.morale-2,20,100);if(p.pweeks===4)mail('Versprechen gebrochen',`${p.name} wurde ein Stammplatz versprochen und sitzt seit vier Wochen auf der Bank. Seine Moral sinkt jede Woche.`)}}}
  for(const id of [...U.roster]){const p=S.players[id];if(p.clause&&p.clause<=valueFor(p)*1.25&&R()<.03){const bs=Object.values(S.teams).filter(t=>t.id!==S.user&&!t.academy&&t.rep>=ovr(p)-6);if(bs.length&&U.roster.length>5){sellPlayer(p,pick(bs),p.clause,'Ausstiegsklausel gezogen');break}}}
  for(const m of S.inbox)if(m.type==='offer'&&!m.done&&m.exp<=S.step){m.done=true;m.result='abgelaufen'}
  const listed=U.roster.filter(id=>S.players[id].listed&&!S.players[id].loan);
  if(R()<(listed.length?.3:.07)&&U.roster.length>5){
    const pool=listed.length?listed:U.roster.filter(id=>!S.players[id].loan);const p=pool.length?S.players[pick(pool)]:null;
    const buyers=p?Object.values(S.teams).filter(t=>t.id!==S.user&&!t.academy&&t.rep>=ovr(p)-8):[];
    if(buyers.length&&!S.inbox.some(m=>m.type==='offer'&&!m.done&&m.pid===p.id)){const from=pick(buyers);const fee=Math.round(valueFor(p)*(.85+R()*.45)/5000)*5000;
      mail(`Angebot für ${p.name}`,`${from.name} (${from.reg}) bietet ${eurK(fee)} Ablöse für ${p.name} (${RN[p.role]}, OVR ${ovr(p)}). Das Angebot gilt zwei Wochen.`,{type:'offer',pid:p.id,from:from.id,fee,done:false,exp:S.step+2})}
  }
  if(S.fin.balance<0&&S.step%4===0)mail('Konto im Minus','Der Kontostand ist negativ. Verkaufe Spieler oder senke die Gehälter, bevor der Vorstand eingreift.');
}
function trainTeam(T,focus,intensity,coach,log){
  if(log)S.trainLog=[];
  const grp=TGROUP[focus]||TGROUP.bal;
  for(const id of T.roster){const p=S.players[id],o=ovr(p),before=log?Object.assign({},p.d):null;
    if(focus==='rest'){p.form=clamp(p.form+6,30,100);p.morale=clamp(p.morale+2,20,100)}
    else{const room=clamp((p.pot-o)/8,0,1),prof=.7+p.h.pro/20*.6;
      const G=(.1+coach*.035)*(log?tcF():1)*ageF(p)*(intensity==='high'?1.45:1)*room*(.5+R())*prof,pts=G/5*2.6*DSCALE,kw=keyW(p.role);
      const tot=grp.a.reduce((s,x)=>s+kw[x]+.03,0);
      for(const x of grp.a)p.d[x]=clamp(p.d[x]+pts*(kw[x]+.03)/tot,1,20);
      if(p.ifoc&&p.d[p.ifoc]!=null)p.d[p.ifoc]=clamp(p.d[p.ifoc]+pts*.45,1,20);
      derive(p);
      p.form=clamp(p.form+(intensity==='high'?-3*(1.3-p.d.sta/20*.6):1)+(p.form<60?2:0),30,100)}
    if(log){const g=DK.map(x=>[x,p.d[x]-before[x]]).filter(x=>x[1]>.004).sort((a,b)=>b[1]-a[1]);p.sg=p.sg||{};for(const[x,v]of g)p.sg[x]=(p.sg[x]||0)+v;
      S.trainLog.push({id:p.id,name:p.name,role:p.role,d:ovr(p)-o,gains:g.slice(0,3).map(([x,v])=>[x,+v.toFixed(2)])})}
  }
}

/* ===== Saisonende ===== */
function endSeason(){sponsorSeasonEnd();
  const U=S.teams[S.user],exp=expected(S.user),order=S.rec.S3[U.reg],place=order.indexOf(S.user)+1;
  for(const r of REGS){const o=S.rec.S3[r],ranks=teamsOf(r).sort((a,b)=>b.rep-a.rep).map(t=>t.id);
    o.forEach((id,i)=>{const T=S.teams[id];T.rep=clamp(Math.round(T.rep+(ranks.indexOf(id)-i)*1.2),45,95)})}
  const intl=['FS','MSI','DC','WLD'].map(id=>({id,name:CAL.find(c=>c.id===id).name,res:S.rec[id]&&S.rec[id].place[S.user]||null,champ:S.rec[id]&&S.rec[id].champ}));
  boardSeason();
  S.fin.fans=Math.round(S.fin.fans*(1+(4.5-place)*.03));
  const splits=['S1','S2','S3'].map(id=>({id,name:CAL.find(c=>c.id===id).name,place:S.rec[id][U.reg].indexOf(S.user)+1}));
  S.summary={place,exp,splits,intl};
  try{seasonAwards()}catch(e){}achCheck();
  for(const id of S.teams[S.user].roster){const p=S.players[id];if(p.titleProm===S.year&&!S.trophies.some(t=>t.year===S.year)){p.morale=clamp(p.morale-15,20,100);mail('Versprechen nicht gehalten',`${p.name} wurde ein Titel versprochen. Ohne Titel ist er enttäuscht.`)}}
  S.history.unshift({year:S.year,splits:splits.map(s=>s.place),intl:intl.map(x=>x.res),worlds:S.teams[S.rec.WLD.champ].name});
  S.phase='offseason';
  mail('Saison beendet',`Sommer-Split: Platz ${place} (Ziel: ${exp}). Worlds-Sieger: ${S.teams[S.rec.WLD.champ].name}. Starte die neue Saison, wenn du bereit bist.`);
  try{pressEval()}catch(e){}try{hofSeason()}catch(e){}try{worldSeasonEnd()}catch(e){}try{careerSeason()}catch(e){}
}
function newSeason(){
  loansReturn();youthSeason();infraSeason();trialsEnd();rivSeason();
  for(const p of Object.values(S.players)){(p.hist=p.hist||[]).push(Object.assign({y:S.year,o:ovr(p),t:p.team},p.st||{}));if(p.hist.length>8)p.hist.shift();p.st={g:0,w:0,k:0,d:0,mvp:0};p.sg={};if(p.ch){for(const c of p.ch)if(p.age<=25)c[1]=clamp(c[1]+ri(0,2),1,20);if(p.age<=25&&R()<.4&&p.ch.length<8){const nw=CHR[p.role].filter(c=>!p.ch.some(x=>x[0]===c));if(nw.length)p.ch.push([pick(nw),ri(7,12)])}p.ch.sort((a,b)=>b[1]-a[1])}p.age++;const o=ovr(p),room=clamp((p.pot-o)/6,0,1);
    const gl=growLimit(p),gf=p.dev==='s'&&p.age>=22?1.3:p.dev==='f'&&p.age<=19?1.25:1;
    for(const x of DK){if(p.age<=gl)p.d[x]=clamp(p.d[x]+R()*.55*room*gf,1,20);
      else if(p.age>=27){if(['rea','mec','con'].includes(x))p.d[x]=clamp(p.d[x]-R()*(p.age>=29?.75:.45),1,20);else if(['gs','dec','lead','pos','wav','obj','vis'].includes(x))p.d[x]=clamp(p.d[x]+R()*.15,1,20);else p.d[x]=clamp(p.d[x]-R()*.15,1,20)}}
    derive(p);
    if(ovr(p)>p.pot)p.pot=ovr(p);p.form=clamp(p.form+5,30,85);p.listed=false}
  retireSeason();
  for(const id in S.teams){const T=S.teams[id];
    for(const pid of [...T.roster]){const p=S.players[pid];p.contract--;
      if(p.contract<=0){if(id===S.user||id===acaId()){toFA(p);mail('Spieler verlässt das Team',`Der Vertrag von ${p.name} ist ausgelaufen. Er ist jetzt vereinslos.`)}
        else if(R()<.75){p.contract=2;p.salary=salaryFor(ovr(p))}else toFA(p)}}}
  S.fa=S.fa.filter(id=>{const p=S.players[id];if(p.age>=30&&R()<.6){delete S.players[id];return false}return true});
  for(let i=0;i<30;i++){const r=pick(REGS);const p=genPlayer(pick(ROLES),ri(45,63)+Math.max(0,REG[r].off)+Math.round(REG[r].str),ri(17,19),r);p.contract=0;S.players[p.id]=p;S.fa.push(p.id)}
  for(const id in S.teams){if(id===S.user||id===acaId())continue;const T=S.teams[id];
    if(T.tier!==2)for(const r of ROLES){if(R()<.25){const cur=S.players[T.starters[r]],tp=t2Of(T.reg).filter(t=>!t.academy).flatMap(t=>t.roster.map(i=>S.players[i])).filter(p=>p.role===r&&!p.loan).sort((a,b)=>ovr(b)-ovr(a))[0];if(tp&&cur&&ovr(tp)>ovr(cur)-2&&T.roster.length<MAXR){const from=S.teams[tp.team];news(`${T.name} holt Talent ${tp.name} aus der T2-Szene (${from.name}).`,'transfer');unsign(tp);sign(tp,T,ovr(tp)>ovr(cur));tp.contract=2;tp.salary=salaryFor(ovr(tp));ensureRoles(from,false)}}}
    for(const r of ROLES){const best=()=>S.fa.map(i=>S.players[i]).filter(p=>p.role===r&&ovr(p)<=T.rep+4&&canJoinReg(p,T.reg)&&impOk(p,T,T.starters[r])).sort((a,b)=>ovr(b)-ovr(a))[0];
      const have=T.roster.map(i=>S.players[i]).filter(p=>p.role===r);
      if(!have.length){const b=best();if(b){b.contract=2;b.salary=salaryFor(ovr(b));sign(b,T,true)}}
      else if(R()<.35){const b=best(),cur=S.players[T.starters[r]];if(b&&cur&&ovr(b)>ovr(cur)+3){b.contract=2;b.salary=salaryFor(ovr(b));sign(b,T,true);if(T.roster.length>8){const worst=T.roster.map(i=>S.players[i]).filter(p=>p.id!==b.id).sort((x,y)=>ovr(x)-ovr(y))[0];toFA(worst)}}}
    }
    ensureRoles(T,false);
    for(const r of ROLES){const b=T.roster.map(i=>S.players[i]).filter(p=>p.role===r).sort((x,y)=>ovr(y)-ovr(x))[0];if(b)T.starters[r]=b.id}fixImports(T);
    T.style=pick(SK);T.focus=pick(['TOP','MID','ADC']);
  }
  aiPoach();for(const p of Object.values(S.players))p.wantAway=false;
  ensureRoles(S.teams[S.user],true);
  if(aca())ensureRoles(aca(),false);acaIntake();
  S.fin.season={inc:{},exp:{}};S.fin.weeks=[];S.fin.bail=false;S.fin.advUsed=false;sponsorNewSeason();
  for(const st of [...S.staffs]){st.contract--;if(st.contract<=0){if(st.role==='hc'&&staffOf('hc').length<=1){st.contract=2;st.wage=r100(st.wage*1.1);mail('Head Coach verlängert',`${st.name} bleibt zwei weitere Saisons für ${eurK(st.wage)} pro Woche.`)}else{S.staffs=S.staffs.filter(x=>x.id!==st.id);mail('Trainer verlässt den Verein',`Der Vertrag von ${st.name} (${SROLE[st.role][0]}) ist ausgelaufen.`)}}}newStaffPool();syncStaff();
  S.tstLast=S.tst;S.tst={};t2Init();S.scoutPool=[genScout(ri(1,2)),genScout(ri(2,3)),genScout(ri(3,4))];exPool();S.season++;S.year++;S.step=0;S.patch=0;S.phase='season';S.ci=0;S.rec={};S.splits={};S.summary=null;S.lastRound=null;
  for(const p of Object.values(S.players))p.o0=ovr(p);
  setBudgets();
  if(S.fin.debts){for(const x of S.fin.debts.filter(x=>x.season<=S.season)){book('Ablöse-Raten',-x.amt);S.fin.budget.transfer=Math.max(0,S.fin.budget.transfer-x.amt);x.fin?mail('Finanzierung fällig',`Die Finanzierung vom letzten Jahr wird abgebucht: ${eurK(x.amt)}. Dein Transferbudget sinkt um denselben Betrag.`):mail('Ablöse-Rate fällig',`${eurK(x.amt)} gehen als zweite Rate an ${x.to}.`)}S.fin.debts=S.fin.debts.filter(x=>x.season>S.season)}
  for(const id in S.teams)S.teams[id].tac=null;
  S.ev=initEvent(CAL[0]);try{pressPreview()}catch(e){}
  mail(`Budgets ${S.year}`,`Transferbudget ${eurK(S.fin.budget.transfer)}, Gehaltsbudget ${eurK(S.fin.budget.wage)} pro Woche (aktuell genutzt: ${eurK(wageBill())}). ${S.fin.budget.salePct}% der Verkaufserlöse fließen ins Transferbudget.`);
  poachBids();
  genGoals();mail(`Saison ${S.year} startet`,`Die Sponsorverträge sind ausgelaufen. Unter Verein warten neue Angebote. Die Ziele des Vorstands (${PHIL[S.goals.phil][0]}): ${S.goals.list.map(g=>`${g.txt} (${GIMP[g.imp]})`).join(', ')}.`);
  S.view='home';save();
}

/* ===== Speichern ===== */
function save(){try{localStorage.setItem(SAVEKEY,JSON.stringify(S));setMeta(SLOT,metaOf(S))}catch(e){}}
function load(){try{const t=localStorage.getItem(SAVEKEY);if(t){S=JSON.parse(t);if(S.view==='live'||S.view==='prematch'||S.view==='draft'||S.view==='nego')S.view='home';VIEWREG=S.teams[S.user].reg;migrate();if(evBroken(S.ev))restartEvent();else relink(S.ev);save()}}catch(e){S=null}}
