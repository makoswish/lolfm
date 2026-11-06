/* ===== Spielvorbereitung ===== */
function openSeries(m){{const U=S.teams[S.user],fo=fixOut(U);if(fo.length)mail('Ausfall',fo.map(([a,b])=>`${a.name} fehlt (${a.out.why}), ${b.name} spielt`).join('. ')+'.');const ch=fixImports(U);if(ch.length)mail('Import-Regel',`Für die Startelf gilt: höchstens ${IMPMAX} Importspieler. ${ch.map(([a,b])=>`${b.name} spielt für ${a.name}`).join(', ')}.`)}LIVE={series:{m,a:m.a,b:m.b,bo:m.bo,wins:[0,0],games:[],done:false},talk:null,phase:'pre',sim:null,t:0,speed:4,timer:null};const O=S.teams[m.a===S.user?m.b:m.a];if(O&&R()<adaptChance(O))LIVE.adapt=O.id;S.view='prematch'}
function preView(){
  const s=LIVE.series,U=S.teams[S.user],O=S.teams[s.a===S.user?s.b:s.a],an=S.staff.analyst;
  const gi=s.wins[0]+s.wins[1]+1,myS=s.a===S.user?0:1;
  const lines=ROLES.map(r=>{const a=S.players[U.starters[r]],b=S.players[O.starters[r]],oa=ovr(a),ob=ovr(b);
    return `<div class="l"><span>${a.name}</span><span class="ovr ${oc(oa)}" style="font-size:14px">${oa}</span></div><div class="m">${chip(r)}</div><div class="l"><span class="ovr ${an>=3?oc(ob):''}" style="font-size:14px">${an>=3?ob:'~'+Math.round(ob/5)*5}</span><span style="text-align:right">${b.name}</span></div>`}).join('');
  const fav=teamOvr(U)-teamOvr(O);
  return `<div class="pagehead"><div><h1>${s.m.label.split(' · ').slice(-1)[0]}</h1><p>${s.m.label.split(' · ')[0]} · ${s.bo>1?`Spiel ${gi} · Serie ${s.wins[myS]}:${s.wins[1-myS]} · Bo${s.bo}`:'Best of 1'}</p></div>
   <div class="acts"><button class="btn ghost" data-a="quick">${s.bo>1?'Serie':'Spiel'} simulieren</button><button class="btn" data-a="kickoff">Zum Draft (Spiel ${gi})</button></div></div>
  <div class="grid"><section class="panel s7"><div class="lab"><span>${U.name}</span><span>${O.name} · ${O.reg}</span></div><div class="lineup">${lines}</div>
   ${subBox(U,gi)}
   ${rivLbl(O.id)?`<div class="note warn" style="margin-top:12px">${rivLbl(O.id)}: Bilanz ${rivOf(O.id).w}-${rivOf(O.id).l}. Dieses Duell zählt mehr für Fans und Vorstand.</div>`:''}
   <p class="muted" style="font-size:13px;margin:12px 0 0">${fav>2?'Dein Team ist auf dem Papier Favorit.':fav<-2?'Dein Team ist Außenseiter.':'Die Teams sind etwa gleich stark.'}</p></section>
  <section class="panel s5"><div class="lab">Scouting-Bericht</div>
   <div class="stat"><span class="muted">Spielstil</span><span style="font-family:var(--f-body)">${an>=2||scrimKnows(O.id)?STYLES[O.style].n+(an<2?' (aus Scrims)':''):'Analyst Level 2 nötig'}</span></div>
   ${(()=>{const pa=teamPower(U,O),pb=teamPower(O,U),pc=Math.round(sig(.235*((pa.e+pa.m+pa.l)-(pb.e+pb.m+pb.l))/3)*100),[hw,hn]=h2hOf(U,O);return `<div class="stat"><span class="muted">Siegchance vorab</span><span class="${pc>=55?'good':pc<=45?'bad':''}">${pc}%</span></div><div class="stat"><span class="muted">Bilanz gegeneinander</span><span>${hn?`${hw}-${hn-hw} in ${hn} ${hn===1?'Serie':'Serien'}`:'noch nie gespielt'}</span></div>`})()}
   <div class="stat"><span class="muted">Jungle-Fokus</span><span style="font-family:var(--f-body)">${an>=3?FOCUS[O.focus]:'Analyst Level 3 nötig'}</span></div>
   ${(()=>{const cmp=(x,lbl,show)=>{if(!show)return'';const a=avgD(U,x),b=avgD(O,x),df=a-b;return `<div class="stat"><span class="muted">${lbl}</span><span style="font-family:var(--f-body)" class="${an<2?'dim':df>.5?'good':df<-.5?'bad':''}">${an<2?'unbekannt':df>.5?'Vorteil für dich':df<-.5?'Vorteil Gegner':'ausgeglichen'}</span></div>`};
     return cmp('nrv','Nervenstärke',s.m.big)+cmp('pool','Championpool',s.bo>1)+cmp('cns','Konstanz',true)})()}
   <div class="stat"><span class="muted">Signature-Champs</span><span style="font-family:var(--f-body);text-align:right">${ROLES.map(r=>{const q=S.players[O.starters[r]];return q.ch&&q.ch[0]?CH[q.ch[0][0]][0]:'-'}).join(', ')}</span></div>
   ${LIVE.adapt?(LIVE.astyle?`<div class="note warn" style="margin:8px 0">${O.name} hat sich auf deinen Stil vorbereitet und spielt ${STYLES[LIVE.astyle].n}.</div>`:an>=3?`<div class="note warn" style="margin:8px 0">Dein Analyst erwartet, dass sich ${O.name} auf deinen Stil einstellt. Der Stil oben kann sich ändern.</div>`:''):''}
   <div class="stat"><span class="muted">Konter</span><span style="font-family:var(--f-body)">${an>=2?STYLES[SK.find(k=>COUNTER[k].vs===O.style)].n:'unbekannt'}</span></div>
   <div class="lab" style="margin-top:16px"><span>Deine Taktik</span><button class="linkbtn" data-a="nav" data-v="tactic" style="font-size:12px">bearbeiten</button></div>
   <div class="rows">${S.tacs.map((x,i)=>`<button class="row" style="grid-template-columns:minmax(0,1fr) 90px" data-a="tact" data-v="${i}"><span style="min-width:0"><div class="nm">${i===S.tacA?'● ':''}Taktik ${x.name}: ${STYLES[x.style].n}</div><div class="sub">Tempo ${TEMPO[x.tempo][0]} · ${OBJF[x.obj][0]} · Carry ${CARRY[x.carry]}</div></span>${famBar(famOf(x))}</button>`).join('')}</div>
   <div class="lab" style="margin-top:16px">Ansprache vor dem Spiel</div>
   ${LIVE.talk?`<div class="note">${LIVE.talk}</div>`:`<div class="seg"><button data-a="talk" data-v="calm">Ruhig bleiben</button><button data-a="talk" data-v="hype">Volle Attacke</button><button data-a="talk" data-v="fav">Wir sind besser</button></div>`}
  </section></div>`;
}
/* Wechsel vor jedem Spiel einer Serie: Bankspieler der Rolle direkt einsetzen */
function subBox(U,gi){const opts=ROLES.map(r=>[r,U.roster.map(i=>S.players[i]).filter(p=>p.role===r&&!isStarter(p))]).filter(x=>x[1].length);
  if(!opts.length)return '<p class="dim" style="font-size:13px;margin:12px 0 0">Keine Ersatzspieler im Kader. Für Wechsel in Serien brauchst du Backups.</p>';
  return `<div class="lab" style="margin-top:14px"><span>Wechsel für Spiel ${gi}</span><span>${(LIVE.subs||[]).length?`${LIVE.subs.length} in dieser Serie`:'Bank'}</span></div>
   <div class="subs">${opts.map(([r,L])=>`<div class="subr">${chip(r)}${L.map(p=>{const ie=impWhy(p)&&!isImp(S.players[U.starters[r]],U.reg),o=isOut(p);return `<button class="btn ghost sm" data-a="psub" data-id="${p.id}" ${ie||o?`disabled title="${o?'fällt aus':impWhy(p)}"`:''}>${p.name} <span class="dim">${o?'fällt aus':ovr(p)}</span></button>`}).join('')}</div>`).join('')}</div>`}
function doTalk(v){
  const U=S.teams[S.user],O=S.teams[LIVE.series.a===S.user?LIVE.series.b:LIVE.series.a],fav=teamOvr(U)-teamOvr(O);
  let d,txt;
  if(v==='calm'){d=2;txt='Das Team bleibt fokussiert. Moral +2.'}
  else if(v==='hype'){if(fav<=0){d=6;txt='Die Spieler sind heiß auf die Überraschung. Moral +6.'}else{d=-2;txt='Die Ansage wirkt übertrieben. Ein paar Spieler werden nervös. Moral -2.'}}
  else{if(fav>2){d=5;txt='Das Selbstvertrauen steigt. Moral +5.'}else{d=-4;txt='Keiner nimmt dir das ab. Moral -4.'}}
  d=Math.round(d*(1+Math.max(0,motBonus())));for(const r of ROLES){const p=S.players[U.starters[r]];p.morale=clamp(p.morale+d,20,100)}
  LIVE.talk=txt;
}

/* ===== Live-Spiel ===== */
function gctx(){const s=LIVE.series;return{big:!!s.m.big,gi:s.wins[0]+s.wins[1]+1}}
function recordGame(g){const s=LIVE.series;s.wins[g.winner]++;s.games.push(g);try{mhRecord(g)}catch(e){}addStats(g,S.teams[s.a],S.teams[s.b]);moraleAfter(S.teams[s.a],g.winner===0,g.mvp);moraleAfter(S.teams[s.b],g.winner===1,g.mvp)}
function seriesOver(){const s=LIVE.series,need=Math.ceil(s.bo/2);return s.wins[0]>=need||s.wins[1]>=need}
function commitSeries(){
  const s=LIVE.series;s.done=true;const m=s.m,k=[0,0];for(const x of s.games){k[0]+=x.kills[0];k[1]+=x.kills[1]}
  m.w=s.wins[0]>s.wins[1]?s.a:s.b;m.score=[...s.wins];m.k=k;m.mvp=S.players[s.games[s.games.length-1].mvp].name;
  mhDone();try{rivRecord(m)}catch(e){}S.streak=m.w===S.user?(S.streak||0)+1:0;if(m.w===S.user)ach('firstwin');S.bestStreak=Math.max(S.bestStreak||0,S.streak);if(S.streak>=5)ach('streak5');if(S.streak>=10)ach('streak10');
  S.fin.fans=Math.round(S.fin.fans*(m.w===S.user?1.012:.995));if(m.w===S.user){sponsorBonus('perWin');const wb=S.teams[S.user].roster.reduce((a,i)=>a+(S.players[i].wb||0),0);if(wb)book('Siegprämien',-wb)}save();
}
/* ===== Draft ===== */
function chName(c){return c==null?'-':CH[c][0]}
function myS(){return LIVE.series.a===S.user?0:1}
function startDraft(){
  const s=LIVE.series,me=myS(),U=S.teams[S.user],O=S.teams[me===0?s.b:s.a];
  LIVE.draft={step:'ban',myBans:[],oppBans:aiBans(U),picks:{},oppPicks:{},oppRoles:shuffle(ROLES.slice()).slice(0,3)};
  LIVE.phase='draft';S.view='draft';
}
function draftTaken(){const D=LIVE.draft;return[...D.myBans,...D.oppBans,...Object.values(D.oppPicks)]}
function phaseBars(T,dr,od){const P=teamPower(T),x=draftBonus(T,dr,od);return{e:P.e+x.e,m:P.m+x.m,l:P.l+x.l}}
function draftView(){
  const s=LIVE.series,D=LIVE.draft,me=myS(),U=S.teams[S.user],O=S.teams[me===0?s.b:s.a],an=S.staff.analyst;
  const head=`<div class="pagehead"><div><h1>Draft</h1><p>${s.m.label} · Spiel ${s.wins[0]+s.wins[1]+1} · ${U.name} (${me===0?'Blau':'Rot'}) gegen ${O.name}</p></div>
    <div class="acts"><button class="btn ghost" data-a="dauto">Coach entscheidet</button></div></div>`;
  const tagChip=c=>`<span class="tagc t-${CH[c][6]}">${CH[c][6]}</span>`;
  if(D.step==='ban'){
    const rows=ROLES.map(r=>{const p=S.players[O.starters[r]],pool=(p.ch||[]).slice(0,an>=2?5:2);
      return `<div class="drow"><div class="dl">${chip(r)}<span class="nmcell">${p.name}</span></div><div class="dchs">${pool.map(([c,m])=>{const on=D.myBans.includes(c),dis=D.oppBans.includes(c);
        return `<button class="chb ${on?'ban':''}" data-a="dban" data-c="${c}" ${dis?'disabled':''}><b>${CH[c][0]}</b><span>${an>=2?'Meisterschaft '+m:'Signature'}${isMeta(c)?' · Meta':''}</span></button>`}).join('')}</div></div>`}).join('');
    return head+`<div class="grid"><section class="panel s8"><div class="lab"><span>Bans: wähle bis zu 3 Champions des Gegners</span><span>${D.myBans.length}/3</span></div>${rows}
      ${an<2?'<p class="muted" style="font-size:13px;margin:10px 0 0">Ab Analyst Level 2 siehst du den ganzen Pool und die Meisterschaft.</p>':''}</section>
     <section class="panel s4"><div class="lab">Bans von ${O.name}</div>${D.oppBans.map(c=>`<div class="stat"><span>${CH[c][0]}</span><span class="dim" style="font-family:var(--f-body)">gegen ${S.players[U.roster.find(i=>(S.players[i].ch||[]).some(x=>x[0]===c))||U.starters.TOP].name}</span></div>`).join('')}
      <p class="muted" style="font-size:13px;margin:10px 0 14px">Der Gegner nimmt deinen Spielern ihre stärksten Champions weg.</p>
      <button class="btn" data-a="dbansok" style="width:100%">Bans bestätigen</button></section></div>`;
  }
  const opp={picks:D.oppPicks},mine={picks:D.picks},taken=draftTaken();
  const rows=ROLES.map(r=>{const p=S.players[U.starters[r]],cand=CHR[r].filter(c=>!taken.includes(c)&&!Object.entries(D.picks).some(([rr,cc])=>rr!==r&&cc===c)).sort((a,b)=>mastery(p,b)+(isMeta(b)?2:0)-mastery(p,a)-(isMeta(a)?2:0)).slice(0,7);
    return `<div class="drow"><div class="dl">${chip(r)}<span class="nmcell">${p.name}</span>${D.oppPicks[r]!=null?`<span class="dim" style="font-size:12px">vs ${chName(D.oppPicks[r])}</span>`:''}</div><div class="dchs">${cand.map(c=>{const m=mastery(p,c);
      return `<button class="chb ${D.picks[r]===c?'on':''}" data-a="dpick" data-r="${r}" data-c="${c}"><b>${CH[c][0]}${isMeta(c)?' ★':''}</b><span><span class="${m>=14?'good':m<=6?'bad':''}">${m}</span> · ${tagChip(c)}</span></button>`}).join('')}</div></div>`}).join('');
  const myBars=phaseBars(U,mine,opp),opBars=phaseBars(O,opp,mine),tag=compTag(D.picks),otag=compTag(D.oppPicks);
  const verdict=tag&&otag?(TAGBEAT[tag]===otag?`<span class="good">${tag} kontert ${otag}.</span>`:TAGBEAT[otag]===tag?`<span class="bad">${otag} kontert ${tag}.</span>`:'Kein direkter Konter.'):'Noch keine klare Ausrichtung.';
  const bars=(lbl,a,b)=>{const df=a-b;return `<div class="pbar"><span class="muted">${lbl}</span><div class="pb"><i style="width:${clamp(50+df*4,4,96)}%"></i></div><span class="mono ${df>.5?'good':df<-.5?'bad':''}">${df>0?'+':''}${df.toFixed(1).replace('.',',')}</span></div>`};
  const done=ROLES.every(r=>D.picks[r]!=null);
  return head+`<div class="grid"><section class="panel s8"><div class="lab"><span>Picks</span><span>Zahl = Meisterschaft (1-20) · ★ = Meta</span></div>${rows}</section>
   <section class="panel s4"><div class="lab">Deine Komposition</div>
    <p style="margin:0 0 6px"><b>${tag||'Gemischt'}</b> <span class="muted" style="font-size:13px">${tag?TAGD[tag]:''}</span></p>
    <div class="acts" style="gap:4px;margin-bottom:12px">${Object.entries(compTags(D.picks)).map(([k,v])=>`<span class="tagc t-${k}">${k} ×${v}</span>`).join('')||'<span class="dim" style="font-size:13px">noch nichts gewählt</span>'}</div>
    <div class="lab">${O.name}</div>
    ${ROLES.map(r=>`<div class="stat"><span class="muted">${RN[r]}</span><span style="font-family:var(--f-body)">${D.oppPicks[r]!=null?chName(D.oppPicks[r]):'<span class="dim">pickt nach dir</span>'}</span></div>`).join('')}
    <p style="font-size:14px;margin:10px 0">${verdict}</p>
    <div class="lab">Stärke nach Phase (du gegen Gegner)</div>${bars('Früh',myBars.e,opBars.e)}${bars('Mitte',myBars.m,opBars.m)}${bars('Spät',myBars.l,opBars.l)}
    <p class="muted" style="font-size:12.5px;margin:8px 0 12px">Dive schlägt Scaling, Scaling schlägt Poke, Poke schlägt Engage, Engage schlägt Pick, Pick schlägt Dive. Ab drei Champions mit gleicher Ausrichtung gibt es einen Synergie-Bonus.</p>
    <button class="btn" data-a="dok" style="width:100%" ${done?'':'disabled'}>Draft abschließen</button></section></div>`;
}
function finishDraft(){
  const s=LIVE.series,D=LIVE.draft,me=myS(),U=S.teams[S.user],O=S.teams[me===0?s.b:s.a];
  const rest=ROLES.filter(r=>D.oppPicks[r]==null),taken=[...draftTaken(),...Object.values(D.picks)];
  Object.assign(D.oppPicks,aiPicks(O,[],taken,rest,D.picks));
  const mine={bans:D.myBans,picks:D.picks},theirs={bans:D.oppBans,picks:D.oppPicks};
  startLive(me===0?[mine,theirs]:[theirs,mine]);
}
function startLive(drafts){
  const s=LIVE.series,z=newSim(S.teams[s.a],S.teams[s.b],gctx(),drafts,true);
  Object.assign(LIVE,{sim:z,phase:'intro',tab:'map',filter:'key',sel:null,pin:null,slow:0});S.view='live';MODAL=null;window.scrollTo(0,0);
}

const PRESS={win:{q:'Starker Auftritt heute. Wie ordnen Sie den Sieg ein?',a:[['Das Team hat hart dafür gearbeitet.','Die Spieler freuen sich über das Lob.',{mor:3}],['Unser Ziel ist der Titel, nichts anderes.','Die Fans feiern die Ansage, das Team spürt Druck.',{fans:1.5,mor:-1,board:1}],['Wir bleiben bescheiden, nächste Woche zählt.','Ruhige Reaktion, keine Auswirkungen.',{}]]},
  loss:{q:'Das lief nicht nach Plan. Was ist schiefgegangen?',a:[['Das nehme ich auf meine Kappe.','Die Spieler rechnen dir das hoch an.',{mor:3,board:-1}],['Einige Spieler müssen mehr liefern.','Die Profis im Team nehmen es als Ansporn, der Rest ist verärgert.',{crit:1}],['Der Gegner war heute einfach besser.','Neutral aufgenommen.',{}]]}};
function pressAnswer(i){const s=LIVE.series,won=s.m.w===S.user,P=PRESS[won?'win':'loss'],e=P.a[i][2],U=S.teams[S.user];
  for(const id of U.roster){const p=S.players[id];if(e.mor)p.morale=clamp(p.morale+e.mor,20,100);if(e.crit)p.morale=clamp(p.morale+(p.h.pro>=13?3:-4),20,100)}
  if(e.fans)S.fin.fans=Math.round(S.fin.fans*(1+e.fans/100));if(e.board)S.board=clamp(S.board+e.board,0,100);
  LIVE.press={done:true,i,txt:P.a[i][1]};save()}
