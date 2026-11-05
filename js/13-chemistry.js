/* ===== Teamchemie ===== */
const CHLBL=[[80,'Hervorragend','good'],[68,'Gut','good'],[55,'Durchwachsen',''],[40,'Angespannt','warn'],[0,'Zerrüttet','bad']];
function chemLbl(c){return CHLBL.find(x=>c>=x[0])}
function absW(){return S.season*60+S.step}
function gelStart(p,T){const mates=T.roster.map(i=>S.players[i]).filter(q=>q&&q.id!==p.id);let g=22;if(mates.some(q=>q.nat===p.nat))g+=12;if(REGNAT[T.reg]&&REGNAT[T.reg].includes(p.nat))g+=8;if(p.fromAca===T.id)g+=20;return g}
function isImport(p,T){return REGNAT[T.reg]&&!REGNAT[T.reg].includes(p.nat)&&!T.roster.some(i=>i!==p.id&&S.players[i]&&S.players[i].nat===p.nat)}
function chemParts(T){const ps=ROLES.map(r=>S.players[T.starters[r]]).filter(Boolean);if(!ps.length)return null;
  const av=f=>ps.reduce((a,p)=>a+f(p),0)/ps.length,mine=T.id===S.user;
  const gel=av(p=>p.gel??70),mor=av(p=>p.morale),tm=av(p=>p.h.tm??11),lp=ps.slice().sort((a,b)=>(b.d.lead||0)-(a.d.lead||0))[0],ld=lp.d.lead||8;
  const ids=new Set(T.roster),st=new Set(ps.map(p=>p.id));
  const fe=mine?(S.feuds||[]).filter(f=>ids.has(f.a)&&ids.has(f.b)):[],bo=mine?(S.bonds||[]).filter(b=>st.has(b.a)&&st.has(b.b)):[];
  const un=mine?ps.filter(p=>p.wantRaise||p.wantAway):[];
  const parts=[['Eingespieltheit',gel*.5,'Ø der Starter, wächst jede Woche im Team'],['Stimmung',mor*.25,'Ø Moral der Starter'],['Teamgeist',tm,'Charakter der Spieler (Teamplayer oder Einzelgänger)'],
    ['Shotcaller',ld>=15?4:ld>=12?2:0,`${lp.name}, Shotcalling ${Math.round(ld)}`],['Konflikte',-7*fe.length,fe.length?fe.map(f=>`${S.players[f.a].name} gegen ${S.players[f.b].name}`).join(', '):'keine'],
    ['Duos',3*bo.length,bo.length?bo.map(b=>`${S.players[b.a].name} & ${S.players[b.b].name}`).join(', '):'keine'],['Unzufriedene',-2.5*un.length,un.length?un.map(p=>p.name).join(', '):'keine'],['Lauf',T.cmod||0,'Siege, Niederlagen und Teamaktionen der letzten Wochen']];
  const v=clamp(Math.round(parts.reduce((a,x)=>a+x[1],0)),0,100);return{v,parts,gel,ld,leader:lp}}
function chemOf(T){const c=chemParts(T);return c?c.v:65}
function chemPow(T){return clamp((chemOf(T)-68)/7,-4.5,3)}
function tmLbl(v){return v>=16?'Teamplayer':v>=11?'Kollegial':v>=7?'Eigenwillig':'Einzelgänger'}
function chemWeek(){
  for(const id in S.teams){const T=S.teams[id];if(!T.roster.length)continue;
    const lp=ROLES.map(r=>S.players[T.starters[r]]).filter(Boolean).reduce((a,p)=>Math.max(a,p.d.lead||0),0),lb=lp>=15?1.2:1;
    for(const pid of T.roster){const p=S.players[pid];if(!p)continue;const st=T.starters[p.role]===pid;
      p.gel=Math.min(100,(p.gel??70)+(st?4.5:2.2)*(.6+(p.h.tm??11)/20*.8)*(isImport(p,T)?.75:1)*lb)}
    T.cmod=(T.cmod||0)*.85}
  S.feuds=(S.feuds||[]).filter(f=>f.until>absW()&&S.players[f.a]&&S.players[f.b]);
  S.bonds=(S.bonds||[]).filter(b=>S.players[b.a]&&S.players[b.b]&&isMine(S.players[b.a])&&isMine(S.players[b.b]));
  for(const pid of S.teams[S.user].roster){const p=S.players[pid];if(p.wantRaise)p.morale=clamp(p.morale-.7,20,100);if(p.wantAway)p.morale=clamp(p.morale-.5,20,100)}
}
function chemStreak(ev){for(const m of ev.cur){if(!m.w)continue;const W=S.teams[m.w],L=S.teams[m.w===m.a?m.b:m.a];if(W)W.cmod=clamp((W.cmod||0)+1.6,-12,8);if(L)L.cmod=clamp((L.cmod||0)-1.8,-12,8)}}
/* Teamaktionen */
const TB={night:['Teamabend',6000,4,'Pizza, Karaoke und Customs ohne Druck. Lauf +4.'],stream:['Gemeinsamer Stream-Tag',0,3,'Das Team streamt zusammen. Lauf +2, ein paar neue Fans, kostet etwas Form.'],
  retreat:['Team-Retreat',35000,0,'Ein Wochenende weg vom Gaming House. Eingespieltheit aller Spieler +10, Lauf +6, Moral +4. Einmal pro Saison.'],crisis:['Krisensitzung',0,4,'Nur wenn der Lauf negativ ist. Kann die Stimmung drehen oder verschlimmern.']};
let CHMSG=null;
function tbReady(k){S.tb=S.tb||{};if(k==='retreat')return S.tb.retreat!==S.year;if(k==='crisis'&&(S.teams[S.user].cmod||0)>-3)return false;return !(S.tb[k]!=null&&S.tb[k]>absW()-TB[k][2])}
function tbDo(k){const U=S.teams[S.user],x=TB[k];if(!x||!tbReady(k))return;if(x[1]&&S.fin.balance<x[1]){CHMSG=['bad','Dafür ist nicht genug Geld auf dem Konto.'];return}
  if(x[1])book('Teambuilding',-x[1]);S.tb[k]=k==='retreat'?S.year:absW();const ps=U.roster.map(i=>S.players[i]);
  if(k==='night'){U.cmod=clamp((U.cmod||0)+4,-12,10);CHMSG=['good','Der Abend kam gut an. Die Stimmung im Team ist lockerer.']}
  else if(k==='stream'){U.cmod=clamp((U.cmod||0)+2,-12,10);S.fin.fans=Math.round(S.fin.fans*1.005);ps.forEach(p=>p.form=clamp(p.form-2,30,100));CHMSG=['good','Der Stream lief gut. Etwas müde sind sie trotzdem.']}
  else if(k==='retreat'){U.cmod=clamp((U.cmod||0)+6,-12,10);ps.forEach(p=>{p.gel=Math.min(100,(p.gel??70)+10);p.morale=clamp(p.morale+4,20,100)});CHMSG=['good','Das Retreat hat das Team zusammengeschweißt.']}
  else if(k==='crisis'){const ld=chemParts(U).ld,ok=R()<.45+(ld-10)/25+(S.board-50)/250;
    if(ok){U.cmod=clamp((U.cmod||0)+6,-12,10);ps.forEach(p=>p.morale=clamp(p.morale+3,20,100));CHMSG=['good','Die Sitzung hat gewirkt. Das Team zieht wieder an einem Strang.']}
    else{U.cmod=clamp((U.cmod||0)-2,-12,10);ps.forEach(p=>p.morale=clamp(p.morale-3,20,100));CHMSG=['bad','Die Sitzung ist eskaliert. Einige Spieler fühlen sich vorgeführt.']}}
  save()}
/* Chemie-Ereignisse */
Object.assign(PEV,{
  conflict:{t:(p,q)=>`Streit zwischen ${p.name} und ${q.name}`,b:(p,q)=>`Nach einer Niederlage geraten ${p.name} und ${q.name} im Voice-Chat aneinander. Das Team ist angespannt.`,o:[
    ['Schlichten',(p,q)=>{const ok=R()<.4+((p.h.tm??11)+(q.h.tm??11))/60;if(ok){p.morale=clamp(p.morale+3,20,100);q.morale=clamp(q.morale+3,20,100);return 'Die beiden reden sich aus. Die Stimmung beruhigt sich.'}feud(p,q,3);return 'Sie hören zu, aber der Ärger ist nicht verflogen.'}],
    ['Partei für den Ersten ergreifen',(p,q)=>{p.morale=clamp(p.morale+6,20,100);q.morale=clamp(q.morale-10,20,100);feud(p,q,5);return `${p.name} fühlt sich bestätigt, ${q.name} ist sauer.`}],
    ['Ignorieren',(p,q)=>{p.morale=clamp(p.morale-4,20,100);q.morale=clamp(q.morale-4,20,100);feud(p,q,7);return 'Der Konflikt schwelt weiter und belastet die Chemie.'}]]},
  duo:{t:(p,q)=>`${p.name} und ${q.name} verstehen sich blind`,b:(p,q)=>`${p.name} und ${q.name} spielen auch nach dem Training zusammen Ranked. Das Duo funktioniert.`,o:[
    ['Duo-Streams fördern',(p,q)=>{bond(p,q);S.fin.fans=Math.round(S.fin.fans*1.004);return 'Die beiden gelten jetzt als festes Duo. Die Chemie profitiert, solange beide spielen.'}],['Nichts unternehmen',()=>'Keine Änderung.']]},
  voice:{t:p=>`${p.name} will mehr Verantwortung`,b:p=>`${p.name} möchte im Spiel die Calls übernehmen und sieht sich als Führungsspieler.`,o:[
    ['Zum Shotcaller machen',p=>{p.d.lead=clamp(p.d.lead+1.2,1,20);p.d.com=clamp(p.d.com+.6,1,20);derive(p);p.morale=clamp(p.morale+6,20,100);S.teams[S.user].cmod=clamp((S.teams[S.user].cmod||0)+2,-12,10);return 'Er blüht in der neuen Rolle auf. Führung und Kommunikation steigen.'}],
    ['Ablehnen',p=>{p.morale=clamp(p.morale-6,20,100);return 'Er ist enttäuscht.'}]]},
  newbie:{t:p=>`${p.name} fühlt sich noch fremd`,b:p=>`${p.name} ist neu und findet schwer Anschluss. Im Voice-Chat ist er still.`,o:[
    ['Paten zuweisen',p=>{p.gel=Math.min(100,(p.gel??30)+15);p.morale=clamp(p.morale+3,20,100);return 'Ein erfahrener Spieler kümmert sich um ihn. Er findet schneller rein.'}],['Zeit geben',p=>{p.morale=clamp(p.morale-2,20,100);return 'Er muss selbst klarkommen.'}]]}});
function feud(p,q,w){S.feuds=(S.feuds||[]).filter(f=>!((f.a===p.id&&f.b===q.id)||(f.a===q.id&&f.b===p.id)));S.feuds.push({a:p.id,b:q.id,until:absW()+w})}
function bond(p,q){S.bonds=(S.bonds||[]).filter(b=>!((b.a===p.id&&b.b===q.id)||(b.a===q.id&&b.b===p.id)));S.bonds.push({a:p.id,b:q.id});if(S.bonds.length>3)S.bonds.shift()}
function chemEventWeek(){if(S.inbox.some(m=>m.type==='pev'&&!m.done))return;const U=S.teams[S.user],c=chemOf(U),ps=ROLES.map(r=>S.players[U.starters[r]]).filter(Boolean);if(ps.length<5)return;
  const opts=[];
  if(c<62&&R()<.08+(62-c)/250){const a=shuffle(ps.slice()).sort((x,y)=>(x.h.tm??11)-(y.h.tm??11));opts.push(['conflict',a[0],a[1]])}
  if(c>=66&&R()<.04){const a=shuffle(ps.slice());const adc=ps.find(p=>p.role==='ADC'),sup=ps.find(p=>p.role==='SUP');opts.push(R()<.5&&adc&&sup?['duo',adc,sup]:['duo',a[0],a[1]])}
  const nb=ps.filter(p=>(p.gel??70)<35);if(nb.length&&R()<.08)opts.push(['newbie',pick(nb)]);
  const vo=ps.filter(p=>(p.d.lead||0)>=12&&p.age>=21);if(vo.length&&R()<.025)opts.push(['voice',pick(vo)]);
  if(!opts.length)return;const[k,p,q]=pick(opts),E=PEV[k];mail(E.t(p,q),E.b(p,q),{type:'pev',k,pid:p&&p.id,qid:q&&q.id,done:false,exp:S.step+3})}
/* Erfolg macht Ansprüche */
function raiseDemands(){const U=S.teams[S.user],L=[];for(const r of ROLES){const p=S.players[U.starters[r]];if(!p||p.wantRaise)continue;if(p.h.amb>=11&&p.salary<demandFor(p,false)*.8){p.wantRaise=true;L.push(p.name)}}
  if(L.length)mail('Nach dem Titel: Gehaltswünsche',`${L.join(', ')} ${L.length>1?'wollen':'will'} nach dem Erfolg einen besseren Vertrag. Bis zur Verlängerung sinkt die Moral leicht und die Chemie leidet.`)}
function poachBids(){const U=S.teams[S.user];const tops=U.roster.map(i=>S.players[i]).filter(p=>!p.loan&&isStarter(p)&&ovr(p)>=U.rep-2).sort((a,b)=>ovr(b)-ovr(a)).slice(0,2);
  for(const p of tops){if(R()>.5)continue;const bs=Object.values(S.teams).filter(t=>t.id!==S.user&&t.tier!==2&&!t.academy&&t.rep>=U.rep+4).sort((a,b)=>b.rep-a.rep).slice(0,6);if(!bs.length)continue;
    const T=pick(bs),fee=r1000(valueFor(p)*(1.15+R()*.35));
    mail(`${T.name} will ${p.name}`,`${T.name} (${T.reg}, Ruf ${T.rep}) bietet ${eurK(fee)} für ${p.name}. Der Spieler wäre gerne dabei. Lehnst du ab, ist er enttäuscht und will weg.`,{type:'offer',pid:p.id,from:T.id,fee,done:false,exp:S.step+3,poach:true})}}
/* KI-Teams verstärken sich */
function bestStarters(T){for(const r of ROLES){const b=T.roster.map(i=>S.players[i]).filter(p=>p.role===r).sort((x,y)=>ovr(y)-ovr(x))[0];if(b)T.starters[r]=b.id}}
function aiPoach(){for(const reg of REGS){const L=teamsOf(reg).filter(t=>t.id!==S.user&&!t.academy).sort((a,b)=>b.rep-a.rep).slice(0,4);
  for(const T of L){if(R()>.55)continue;const weak=ROLES.map(r=>[r,S.players[T.starters[r]]]).filter(x=>x[1]).sort((a,b)=>ovr(a[1])-ovr(b[1]))[0];if(!weak)continue;const[r,cur]=weak;
    const c=Object.values(S.players).filter(p=>p.role===r&&p.team&&p.team!==S.user&&p.team!==T.id&&!S.teams[p.team].academy&&S.teams[p.team].tier!==2&&S.teams[p.team].id!==acaId()&&S.teams[p.team].rep<T.rep&&ovr(p)>ovr(cur)+3&&ovr(p)<=T.rep+6).sort((a,b)=>ovr(b)-ovr(a))[0];
    if(!c)continue;const from=S.teams[c.team];unsign(c);ensureRoles(from,false);bestStarters(from);c.contract=ri(2,3);c.salary=salaryFor(ovr(c));sign(c,T,true);
    if(T.roster.length>MAXR){const w=T.roster.map(i=>S.players[i]).filter(x=>!isStarter(x)).sort((a,b)=>ovr(a)-ovr(b))[0];if(w)toFA(w)}
    if(R()<.5||T.reg===S.teams[S.user].reg)news(`${T.name} holt ${c.name} von ${from.name}`,'transfer')}}}
/* Anpassung der Gegner */
function styleOf(T){if(LIVE&&LIVE.adapt===T.id){if(!LIVE.astyle){const us=S.teams[S.user].style;LIVE.astyle=SK.find(k=>COUNTER[k].vs===us)||T.style}return LIVE.astyle}return T.style}
function adaptChance(O){const U=S.teams[S.user];return clamp(.12+(O.rep-55)/90+(U.rep-60)/90+Math.min(.1,S.trophies.length*.03),.08,.55)}
/* Ansichten */
function chemGauge(v){const l=chemLbl(v);return `<div class="chg"><div class="chg-n ${l[2]}">${v}</div><div style="flex:1;min-width:0"><b>${l[1]}</b>${bar(v,l[2]==='good'?'var(--good)':l[2]==='bad'?'var(--bad)':l[2]==='warn'?'var(--warn)':'var(--brass)')}</div></div>`}
function powTxt(T){const pw=chemPow(T);return `${pw>=0?'+':'−'}${Math.abs(pw).toFixed(1).replace('.',',')} Teamstärke`}
function chemMini(){const U=S.teams[S.user],c=chemParts(U);if(!c)return '';
  return `<section class="panel s5"><div class="lab"><span>Teamchemie</span><button class="linkbtn" data-a="nav2" data-v="squad" data-k="KTAB" data-t="chem" style="font-size:12px">Details</button></div>${chemGauge(c.v)}
   <p class="muted" style="font-size:13px;margin:8px 0 0">${powTxt(U)} im Spiel. ${c.gel<55?'Das Team ist noch nicht eingespielt.':(U.cmod||0)<-4?'Die Niederlagen drücken auf die Stimmung.':(U.cmod||0)>4?'Der Lauf trägt das Team.':'Stabil.'}</p></section>`}
function chemTab(){const U=S.teams[S.user],c=chemParts(U),all=U.roster.map(i=>S.players[i]).sort((a,b)=>(isStarter(b)-isStarter(a))||ROLES.indexOf(a.role)-ROLES.indexOf(b.role));
  const reg=teamsOf(U.reg).filter(t=>t.id!==S.user),avgC=Math.round(reg.reduce((a,t)=>a+chemOf(t),0)/Math.max(1,reg.length));
  const rel=p=>{const f=(S.feuds||[]).filter(x=>x.a===p.id||x.b===p.id).map(x=>S.players[x.a===p.id?x.b:x.a]).filter(Boolean),b=(S.bonds||[]).filter(x=>x.a===p.id||x.b===p.id).map(x=>S.players[x.a===p.id?x.b:x.a]).filter(Boolean);
    return [...f.map(q=>`<span class="bad">Streit mit ${q.name}</span>`),...b.map(q=>`<span class="good">Duo mit ${q.name}</span>`),p.wantRaise?'<span class="warn">will mehr Gehalt</span>':'',p.wantAway?'<span class="warn">will wechseln</span>':'',isImport(p,U)?'<span class="dim">Import</span>':''].filter(Boolean).join(' · ')};
  return `${CHMSG?`<section class="panel s12 note ${CHMSG[0]}">${CHMSG[1]}</section>`:''}
  <section class="panel s5"><div class="lab"><span>Teamchemie</span><span>Liga-Schnitt ${avgC}</span></div>${chemGauge(c.v)}
   <p class="muted" style="font-size:13px;margin:8px 0 12px">Wirkt im Spiel mit ${powTxt(U)}. Jeder Punkt Teamstärke ist etwa 5 bis 6 Prozent Siegchance pro Spiel. Neue Spieler brauchen rund einen Split, bis sie eingespielt sind.</p>
   ${c.parts.map(([n,v,d])=>`<div class="stat"><span><span>${n}</span><small class="dim" style="display:block;font-family:var(--f-body);font-size:11.5px">${d}</small></span><span class="${v<0?'bad':''}">${v>=0?'+':''}${v.toFixed(1).replace('.',',')}</span></div>`).join('')}</section>
  <section class="panel s7"><div class="lab"><span>Teamaktionen</span><span>Konto ${eurK(S.fin.balance)}</span></div>
   <div class="rows">${Object.entries(TB).map(([k,[n,cost,cd,d]])=>{const ok=tbReady(k);return `<div class="tbrow"><div style="min-width:0"><b>${n}</b><small class="muted" style="display:block">${d}</small></div><button class="btn sm ${ok?'':'ghost'}" data-a="tb" data-v="${k}" ${ok?'':'disabled'}>${ok?(cost?eurK(cost):'Kostenlos'):k==='crisis'&&(U.cmod||0)>-3?'Nicht nötig':'Erledigt'}</button></div>`}).join('')}</div></section>
  <section class="panel s12"><div class="lab"><span>Spieler</span><span>Eingespieltheit · Charakter · Beziehungen</span></div>
   <div class="rows">${all.map(p=>`<button class="row chrow" data-a="player" data-id="${p.id}"><span style="min-width:0;display:flex;gap:10px;align-items:center">${avatar(p,'xs')}<span style="min-width:0"><div class="nm">${p.name} ${isStarter(p)?'':'<span class="dim" style="font-size:12px">Bank</span>'}</div><div class="sub">${RN[p.role]} · ${tmLbl(p.h.tm??11)}${rel(p)?' · '+rel(p):''}</div></span></span><span class="chbar"><small class="dim">${Math.round(p.gel??70)}</small>${bar(p.gel??70)}</span></button>`).join('')}</div></section>`}
function chemPlayerBox(p){const T=S.teams[p.team];return `<div class="lab" style="margin-top:4px"><span>Eingespieltheit</span><span>${Math.round(p.gel??70)}/100</span></div>${bar(p.gel??70)}<p class="muted" style="font-size:12.5px;margin:6px 0 14px">Charakter: ${tmLbl(p.h.tm??11)}.${T&&isImport(p,T)?' Import ohne Landsmann im Team, gewöhnt sich langsamer ein.':''}${p.wantRaise?' Will einen besseren Vertrag.':''}${p.wantAway?' Will wechseln.':''}</p>`}
