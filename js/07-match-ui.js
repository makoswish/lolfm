/* ===== Spielvorbereitung ===== */
function openSeries(m){{const U=S.teams[S.user],fo=fixOut(U);if(fo.length)mail('Ausfall',fo.map(([a,b])=>`${a.name} fehlt (${a.out.why}), ${b.name} spielt`).join('. ')+'.');const ch=fixImports(U);if(ch.length)mail('Import-Regel',`Für die Startelf gilt: höchstens ${IMPMAX} Importspieler. ${ch.map(([a,b])=>`${b.name} spielt für ${a.name}`).join(', ')}.`)}LIVE={series:{m,a:m.a,b:m.b,bo:m.bo,wins:[0,0],games:[],done:false},talk:null,phase:'pre',sim:null,t:0,speed:1,timer:null};const O=S.teams[m.a===S.user?m.b:m.a];if(O&&R()<adaptChance(O))LIVE.adapt=O.id;S.view='prematch'}
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
  const s=LIVE.series,z=newSim(S.teams[s.a],S.teams[s.b],gctx(),drafts,true);z.human[myS()]=true;
  LIVE.sim=z;LIVE.phase='live';S.view='live';MODAL=null;loop();
}

/* ===== Live ===== */
function loop(){clearInterval(LIVE.timer);if(LIVE.speed===3)return;const ms=[900,330,110][LIVE.speed];
  LIVE.timer=setInterval(()=>{if(!LIVE||LIVE.phase!=='live'){clearInterval(LIVE&&LIVE.timer);return}if(simTick(LIVE.sim))gameDone();if(S.view==='live')render()},ms)}
function gameDone(){clearInterval(LIVE.timer);finishSim(LIVE.sim);LIVE.phase='post';recordGame(LIVE.sim);if(seriesOver())commitSeries();LIVE.talk=null}
function miniMap(z){
  const tw=[0,1].map(i=>{const L=z.lost[i],col=i===0?'var(--blue)':'var(--red)';
    return ['top','mid','bot','nex'].map(l=>TWR[i][l].map((p,k)=>{const dead=k<L[l];return `<rect x="${p[0]-1.6}" y="${p[1]-1.6}" width="3.2" height="3.2" rx=".6" fill="${dead?'var(--dim)':col}" opacity="${dead?.35:1}"/>`}).join('')).join('')}).join('');
  const dots=z.pos?[0,1].map(i=>z.st[i].map(id=>{const q=z.pos[id];if(!q)return'';const p=S.players[id];
    return `<g opacity="${q[2]?.35:1}"><circle cx="${q[0]}" cy="${q[1]}" r="2.9" fill="${i===0?'var(--blue)':'var(--red)'}" stroke="var(--bg)" stroke-width=".7"/><text x="${q[0]}" y="${q[1]+1.1}" text-anchor="middle" font-size="2.8" font-weight="700" fill="var(--bg)" font-family="Barlow,sans-serif">${p.role[0]}</text></g>`}).join('')).join(''):'';
  const pulse=z.evLoc&&z.winner<0?`<circle cx="${z.evLoc[0]}" cy="${z.evLoc[1]}" r="7" fill="none" stroke="var(--brass2)" stroke-width=".8" opacity=".8"/><circle cx="${z.evLoc[0]}" cy="${z.evLoc[1]}" r="3.5" fill="var(--brass)" opacity=".25"/>`:'';
  return `<svg viewBox="0 0 100 100" class="mmap" role="img" aria-label="Minimap">
    <rect width="100" height="100" rx="4" fill="var(--panel2)"/>
    <path d="M8 92 L8 8 L92 8 M8 92 L92 8 M8 92 L92 92 L92 8" stroke="var(--line)" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 6 L94 94" stroke="var(--blue)" stroke-opacity=".14" stroke-width="7" fill="none"/>
    <circle cx="30" cy="30" r="4" fill="none" stroke="var(--muted)" stroke-width=".7"/><text x="30" y="31.3" text-anchor="middle" font-size="3.6" fill="var(--muted)" font-family="Barlow,sans-serif">B</text>
    <circle cx="70" cy="70" r="4" fill="none" stroke="var(--muted)" stroke-width=".7"/><text x="70" y="71.3" text-anchor="middle" font-size="3.6" fill="var(--muted)" font-family="Barlow,sans-serif">D</text>
    <circle cx="8" cy="92" r="5" fill="var(--blue)" opacity=".35"/><circle cx="92" cy="8" r="5" fill="var(--red)" opacity=".35"/>
    ${tw}${pulse}${dots}</svg>`;
}
function pTable(z,side,post){const T=S.teams[side===0?z.A:z.B],dr=z.dr[side];
  const td=z.st[side].reduce((s,i)=>s+z.ps[i].dmg,0)||1;
  return `<div class="scroll"><table class="tbl ptb"><thead><tr><th></th><th>${T.id}</th><th class="r">K/D/A</th><th class="r">CS</th><th class="r hide-s">Schaden</th><th class="r">Note</th></tr></thead><tbody>
  ${z.st[side].map(id=>{const p=S.players[id],x=z.ps[id],r=post?z.rt[id]:rating(z,id,side);
   return `<tr${post&&id===z.mvp?' class="me"':''}><td><span class="chip">${p.role}</span></td><td class="nmcell">${p.name}<div class="dim" style="font-size:11.5px;font-weight:500">${chName(dr.picks[p.role])}</div></td><td class="r mono">${x.k}/${x.d}/${x.a}</td><td class="r mono">${x.cs}</td><td class="r mono hide-s">${Math.round(x.dmg/td*100)}%</td><td class="r"><span class="av ${r>=8?'a5':r>=7?'a4':r>=6?'a3':'a1'}">${r.toFixed(1).replace('.',',')}</span></td></tr>`}).join('')}</tbody></table></div>`}
const PRESS={win:{q:'Starker Auftritt heute. Wie ordnen Sie den Sieg ein?',a:[['Das Team hat hart dafür gearbeitet.','Die Spieler freuen sich über das Lob.',{mor:3}],['Unser Ziel ist der Titel, nichts anderes.','Die Fans feiern die Ansage, das Team spürt Druck.',{fans:1.5,mor:-1,board:1}],['Wir bleiben bescheiden, nächste Woche zählt.','Ruhige Reaktion, keine Auswirkungen.',{}]]},
  loss:{q:'Das lief nicht nach Plan. Was ist schiefgegangen?',a:[['Das nehme ich auf meine Kappe.','Die Spieler rechnen dir das hoch an.',{mor:3,board:-1}],['Einige Spieler müssen mehr liefern.','Die Profis im Team nehmen es als Ansporn, der Rest ist verärgert.',{crit:1}],['Der Gegner war heute einfach besser.','Neutral aufgenommen.',{}]]}};
function pressAnswer(i){const s=LIVE.series,won=s.m.w===S.user,P=PRESS[won?'win':'loss'],e=P.a[i][2],U=S.teams[S.user];
  for(const id of U.roster){const p=S.players[id];if(e.mor)p.morale=clamp(p.morale+e.mor,20,100);if(e.crit)p.morale=clamp(p.morale+(p.h.pro>=13?3:-4),20,100)}
  if(e.fans)S.fin.fans=Math.round(S.fin.fans*(1+e.fans/100));if(e.board)S.board=clamp(S.board+e.board,0,100);
  LIVE.press={done:true,i,txt:P.a[i][1]};save()}
function liveView(){
  const s=LIVE.series,z=LIVE.sim,t=z.t,A=S.teams[s.a],B=S.teams[s.b],snap=z.tl[z.tl.length-1],me=myS();
  const evs=z.ev.slice().reverse(),gd=snap.G,lead=gd>=0?A:B,post=LIVE.phase==='post';
  const span=Math.max(30,t+(post?0:5)),pts=z.tl.map(x=>[x.t/span*600,70-clamp(x.G/14000,-1,1)*62]);
  const path=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const area=pts.length>1?path+` L${pts[pts.length-1][0].toFixed(1)} 70 L0 70 Z`:'';
  let res='';
  if(post){const won=z.winner===me,mvp=S.players[z.mvp],F=z.first,fx=k=>F[k]==null?'-':(F[k]===0?A:B).id;
    const P=PRESS[s.done?(s.m.w===S.user?'win':'loss'):'win'];
    res=`<div class="banner" style="background:color-mix(in srgb,${won?'var(--good)':'var(--bad)'} 12%,var(--panel))"><h2 class="${won?'good':'bad'}">${won?'Sieg':'Niederlage'}</h2>
     <div style="display:flex;justify-content:center;margin:8px 0 4px">${avatar(mvp,'lg')}</div><p class="muted" style="margin:4px 0 12px">Spieler des Spiels: ${mvp.name} (${RN[mvp.role]}, Note ${z.rt[z.mvp].toFixed(1).replace('.',',')}) · ${z.end} Minuten${s.bo>1?` · Serie ${s.wins[me]}:${s.wins[1-me]}`:''}</p>
     ${s.done?`<button class="btn" data-a="after">Weiter</button>`:`<button class="btn" data-a="nextgame">Zum nächsten Spiel</button>`}</div>
     <div class="grid" style="margin-top:16px"><section class="panel s6"><div class="lab">${A.name}</div>${pTable(z,0,true)}</section><section class="panel s6"><div class="lab">${B.name}</div>${pTable(z,1,true)}</section>
     <section class="panel s${s.done?6:12}"><div class="lab">Spielfakten</div><div class="stat"><span class="muted">First Blood</span><span>${fx('fb')}</span></div><div class="stat"><span class="muted">Erster Turm</span><span>${fx('tw')}</span></div><div class="stat"><span class="muted">Erster Drache</span><span>${fx('dr')}</span></div>
      <div class="stat"><span class="muted">Größter Goldvorsprung</span><span>${A.id} ${eurK(Math.max(0,...z.tl.map(x=>x.G))).replace(' €','')} · ${B.id} ${eurK(Math.max(0,...z.tl.map(x=>-x.G))).replace(' €','')}</span></div>
      <div class="stat"><span class="muted">Comps</span><span style="font-family:var(--f-body)">${compTag(z.dr[0].picks)||'Gemischt'} vs ${compTag(z.dr[1].picks)||'Gemischt'}</span></div></section>
     ${s.done?`<section class="panel s6"><div class="lab">Pressekonferenz</div><p style="margin:0 0 10px"><b>„${P.q}“</b></p>
      ${LIVE.press&&LIVE.press.done?`<div class="note">${P.a[LIVE.press.i][0]}<br><span class="muted">${LIVE.press.txt}</span></div>`:`<div class="rows">${P.a.map((a,i)=>`<button class="btn ghost" style="text-transform:none;letter-spacing:0;font-family:var(--f-body);font-weight:500;text-align:left;white-space:normal" data-a="press" data-v="${i}">${a[0]}</button>`).join('')}</div>`}</section>`:''}</div>`}
  return `<div class="board"><div class="side-t">${crest(A)}<div style="min-width:0"><b>${A.name}</b><small>Blau · ${compTag(z.dr[0].picks)||'Gemischt'}${s.bo>1?' · '+s.wins[0]+' Siege':''}</small></div></div>
   <div><div class="kills"><span class="b">${snap.k[0]}</span><span class="dim" style="font-size:.5em">:</span><span class="r">${snap.k[1]}</span></div><div class="clock">${String(t).padStart(2,'0')}:00${!post&&LIVE.speed===3?' · Pause':''}</div></div>
   <div class="side-t r">${crest(B)}<div style="min-width:0"><b>${B.name}</b><small>Rot · ${compTag(z.dr[1].picks)||'Gemischt'}${s.bo>1?' · '+s.wins[1]+' Siege':''}</small></div></div></div>
  ${post?res:''}
  <div class="grid" style="margin-top:16px">
   <section class="panel s5"><div class="lab"><span>Minimap</span><span>${t<14?'Lane-Phase':t<25?'Midgame':'Lategame'}</span></div>${miniMap(z)}
    <div class="objs"><div>${snap.tw[0]}</div><div>Türme</div><div>${snap.tw[1]}</div><div>${snap.dr[0]}</div><div>Drachen</div><div>${snap.dr[1]}</div><div>${snap.bn[0]}</div><div>Baron</div><div>${snap.bn[1]}</div></div></section>
   <section class="panel s7"><div class="lab"><span>Goldverlauf</span><span class="mono" style="color:${gd>=0?'var(--blue)':'var(--red)'}">${Math.abs(gd)<300?'ausgeglichen':lead.id+' +'+(Math.abs(gd)/1000).toFixed(1).replace('.',',')+'k'}</span></div>
    <svg viewBox="0 0 600 140" style="width:100%;height:auto;display:block" role="img" aria-label="Goldvorsprung über die Zeit"><defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="140" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="var(--blue)" stop-opacity=".45"/><stop offset=".5" stop-color="var(--blue)" stop-opacity=".05"/><stop offset=".5" stop-color="var(--red)" stop-opacity=".05"/><stop offset="1" stop-color="var(--red)" stop-opacity=".45"/></linearGradient></defs>
     <line x1="0" x2="600" y1="70" y2="70" stroke="var(--line)"/>${[10,20,30,40,50].filter(m=>m<span).map(m=>`<line x1="${m/span*600}" x2="${m/span*600}" y1="4" y2="136" stroke="var(--line)" stroke-dasharray="2 5"/><text x="${m/span*600+4}" y="134" fill="var(--dim)" font-size="11" font-family="IBM Plex Mono,monospace">${m}'</text>`).join('')}
     ${area?`<path d="${area}" fill="url(#gg)"/><path d="${path}" fill="none" stroke="var(--fg)" stroke-width="2"/>`:''}</svg>
    ${post?'':`<div class="lab" style="margin-top:14px"><span>Anweisung an dein Team</span><span>${INS[z.ins[me]].n}</span></div>
     <div class="seg">${Object.entries(INS).map(([k,v])=>`<button class="${z.ins[me]===k?'on':''}" data-a="ins" data-v="${k}" title="${v.d}">${v.n}</button>`).join('')}<button data-a="bcall" ${t<20||z.call[me]||z.buff[0]>=t||z.buff[1]>=t?'disabled':''}>${z.call[me]?'Baron-Call läuft':'Baron callen'}</button></div>
     <p class="muted" style="font-size:13px;margin:8px 0 0">${INS[z.ins[me]].d} Baron-Call ab Minute 20: riskanter Versuch, den Baron sofort zu nehmen.</p>
     <div class="speed" style="margin-top:14px">${['1×','3×','8×','Pause'].map((l,i)=>`<button class="btn ${LIVE.speed===i?'':'ghost'} sm" data-a="speed" data-v="${i}">${l}</button>`).join('')}<button class="btn ghost sm" data-a="skip">Zum Ende</button></div>`}</section>
   ${post?'':`<section class="panel s6"><div class="lab">${A.name}</div>${pTable(z,0,false)}</section><section class="panel s6"><div class="lab">${B.name}</div>${pTable(z,1,false)}</section>`}
   <section class="panel s12"><div class="lab"><span>Spielverlauf</span><span>${s.m.label}</span></div><div class="feed">${evs.map(e=>`<div class="ev ${e.big?'big':''}"><span class="tm">${String(e.t).padStart(2,'0')}'</span><span class="dot" style="background:${e.side===0?'var(--blue)':'var(--red)'}"></span><span>${e.text}</span></div>`).join('')||'<p class="empty">Die Champions laufen in ihre Lanes.</p>'}</div></section></div>`;
}
