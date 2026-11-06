/* ===== UI-Bausteine ===== */
const ICON={
  home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  squad:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.6c2.4.2 4.2 1.9 4.9 4.9"/>',
  fin:'<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2c-.6-.8-1.6-1.2-2.8-1.2-1.6 0-2.8.8-2.8 2s1 1.7 2.8 2 2.8.8 2.8 2-1.2 2-2.8 2c-1.2 0-2.2-.4-2.8-1.2M12 6.5V8M12 16v1.5"/>',
  train:'<path d="M6 8v8M3.5 10v4M18 8v8M20.5 10v4M6 12h12"/>',
  mgr:'<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',
  tactic:'<path d="M4 6h10M19 6h1M4 12h4M13 12h7M4 18h12"/><circle cx="16.5" cy="6" r="2"/><circle cx="10.5" cy="12" r="2"/><circle cx="18.5" cy="18" r="2"/>',
  transfer:'<path d="M4 8h15l-4-4M20 16H5l4 4"/>',
  league:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5a3 3 0 0 0 3.6 4M16 6h3.5a3 3 0 0 1-3.6 4M12 13v4M8 20h8"/>',
  club:'<path d="M3 9l9-5 9 5M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18"/>'
};
const NAV=[['home','Übersicht'],['squad','Kader'],['tactic','Taktik'],['transfer','Transfers'],['league','Turniere'],['club','Verein']];
function crest(T,cls){const t2=T.tier===2&&!T.academy,sh=t2?'M20 2 L37 11 V33 L20 44 L3 33 V11 Z':'M20 1.5 L37.5 7 V21 C37.5 33 30 40.5 20 44.5 C10 40.5 2.5 33 2.5 21 V7 Z';
  return `<span class="crest ${cls||''}" aria-hidden="true"><svg viewBox="0 0 40 46"><path d="${sh}" fill="${T.color}"/><path d="${t2?'M20 2 L37 11 V33 L20 44 Z':'M20 1.5 L37.5 7 V21 C37.5 33 30 40.5 20 44.5 Z'}" fill="#000" opacity=".16"/><path d="${sh}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.2"/></svg><b>${T.id.length>3?T.id.slice(0,3):T.id}</b></span>`}
function chip(r){return `<span class="chip">${r}</span>`}
function bar(v,col){return `<div class="bar"><i style="width:${clamp(v,0,100)}%;background:${col||barCol(v)}"></i></div>`}
function formDots(arr){return `<span class="formdots">${arr.slice(-5).map(x=>`<i style="background:${x?'var(--good)':'var(--bad)'}" title="${x?'Sieg':'Niederlage'}"></i>`).join('')}</span>`}
function isStarter(p){const T=S.teams[p.team];return !!T&&T.starters[p.role]===p.id}
function tname(id,short){const T=S.teams[id];return `<span class="tn ${id===S.user?'me':''}">${short?T.id:T.name}</span><span class="rg">${T.reg}</span>`}

function sideNav(){
  const locked=liveLocked(),U=S.teams[S.user],cg=grpOf(),pend=!LIVE&&S.phase!=='offseason'?userPending():null,opp=pend?S.teams[pend.a===S.user?pend.b:pend.a]:null;
  const grp=g=>{const[k,l,main,items]=g,open=cg===k,gb=items.map(i=>navBadge(i[1],i[3])).join('');
    return `<div class="ngrp ${open?'open':''}"><button class="navbtn ${open?'on':''}" data-a="nav2" data-v="${main}" data-k="${items[0][2]||''}" data-t="${items[0][3]||''}" ${locked?'disabled':''}><svg viewBox="0 0 24 24">${GICON[k]}</svg><span class="nl">${l}</span><span class="ns">${g[4]||l}</span>${gb&&!open?'<span class="ndot"></span>':''}</button>
     <div class="nsub">${items.map(([il,v,tk,tv])=>{const on=S.view===v&&(!tk||tabVal(tk)===tv);return `<button class="nitem ${on?'on':''}" data-a="nav2" data-v="${v}" data-k="${tk||''}" data-t="${tv||''}" ${locked?'disabled':''}><span>${il}</span>${navBadge(v,tv)}</button>`}).join('')}</div></div>`};
  return `<nav class="side" aria-label="Hauptmenü"><div class="brand">Rift Manager<small>Saison ${S.year}</small></div>
  <div class="mecard">${crest(U)}<div style="min-width:0"><b>${U.name}</b><small>${S.manager} · ${U.reg} · Ruf ${U.rep}</small></div></div>
  ${NAVG.map(grp).join('')}
  <div class="foot">${opp?`<div class="nnext"><span class="muted">Nächstes Spiel · Bo${pend.bo}</span><div>${crest(opp,'sm')}<b>${opp.name}</b></div></div>`:''}
   <div class="lab" style="margin:10px 0 6px"><span>Saison ${S.year}</span><span>${Math.min(52,S.step)}/52</span></div><div class="sprog"><i style="width:${Math.min(100,S.step/52*100)}%"></i></div>
   <div class="nstat"><span>${eurK(S.fin.balance)}</span><span>${S.trophies.length} Titel</span><span>Vorstand ${Math.round(S.board)}%</span></div></div></nav>`;
}
function topBar(){
  const U=S.teams[S.user],lbl=S.ev?evLabel(S.ev):`Saisonpause ${S.year}`;
  let btn='';
  if(LIVE&&(LIVE.phase==='live'||LIVE.phase==='intro'))btn='';
  else if(LIVE&&S.view!=='live'&&S.view!=='prematch')btn=`<button class="btn" data-a="resume">Zum Spiel</button>`;
  else if(!LIVE)btn=`${S.phase!=='offseason'?`<button class="btn ghost simbtn" data-a="simmenu" title="Mehrere Wochen simulieren" aria-label="Simulieren"><svg viewBox="0 0 24 24"><path d="M4 6l8 6-8 6zM12 6l8 6-8 6z"/></svg><span>Simulieren</span></button>`:''}<button class="btn" data-a="next">${S.phase==='offseason'?(S.jobless?'Job wählen':'Neue Saison'):userPending()?'Zum Spiel':'Weiter'}</button>`;
  const pend=!LIVE&&S.phase!=='offseason'?userPending():null,opp=pend?S.teams[pend.a===S.user?pend.b:pend.a]:null;
  return `<header class="top"><div class="who">${crest(U)}<div style="min-width:0"><b>${U.name}</b><div class="meta">${lbl}</div></div></div>
  <button class="qs" data-a="qs" aria-label="Suchen" title="Suchen (Strg+K oder /)"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><span>Suchen</span><kbd>Strg K</kbd></button>
  ${opp?`<div class="nextm hide-s"><span class="muted">Nächstes Spiel</span>${crest(opp,'sm')}<b>${opp.id}</b><span class="dim">Bo${pend.bo}</span></div>`:''}
  <div class="money ${S.fin.balance<0?'bad':''}" title="Kontostand"><span class="dim">Konto</span> ${eurK(S.fin.balance)}</div>${btn}<div class="tprog"><i style="width:${Math.min(100,S.step/52*100)}%"></i></div></header>`;
}

/* ===== Startbildschirm ===== */
function startView(){
  const list=TEAMDATA[STARTREG];
  return `<div class="start"><div class="mast"><b>Rift Manager</b><span>58 Teams · 6 Regionen</span></div>
  ${[1,2,3].some(n=>slotInfo(n))?`<section class="panel" style="margin-bottom:26px"><div class="lab"><span>Spielstände</span><span>${[1,2,3].filter(n=>slotInfo(n)).length} von ${NSLOTS} belegt</span></div>${slotList()}</section>`:''}
  <div class="intro"><div><h1>Neues Spiel</h1>
  <p>Du übernimmst eine Organisation und führst sie durch drei Splits, First Stand, MSI, den Demacia Cup und Worlds. Kader, Training, Taktik und Transfers liegen bei dir. Alle Teams und Spieler sind erfunden.</p></div>
  <div class="field"><label for="mgr">Managername</label><input id="mgr" maxlength="24" value="Marc" autocomplete="off"></div></div>
  <div class="seg" style="margin-bottom:0">${REGS.map(r=>`<button class="${STARTREG===r?'on':''}" data-a="startreg" data-v="${r}">${r} <span style="opacity:.6;font-weight:500">${REG[r].full}</span></button>`).join('')}</div>
  <div class="tlist"><div class="trow th"><span>#</span><span></span><span>Team</span><span class="r">Ruf</span><span class="r">Budget</span><span class="r xs-hide">Ziel</span><span class="xs-hide">Prestige</span></div>
  ${list.map(([id,name],i)=>{const rep=repFor(i,list.length)+REG[STARTREG].off;return `<button class="trow" data-a="pickteam" data-id="${id}"><span class="dim">${i+1}</span>${crest({id,color:`hsl(${(i*53+REGS.indexOf(STARTREG)*29+12)%360} 52% 66%)`},'sm')}<b>${name}</b>
   <span class="r">${rep}</span><span class="r">${eurK((rep-40)*20000)}</span><span class="r xs-hide">Platz ${i+1}</span><span class="muted xs-hide">${prestigeOf({rep})}</span></button>`}).join('')}</div>
  <section class="panel" style="margin-top:28px;max-width:640px">${importBox()}</section></div>`;
}

/* ===== Übersicht ===== */
function homeView(){
  const U=S.teams[S.user],pend=userPending();
  let next;
  if(S.phase==='offseason'){const s=S.summary;
    next=`<section class="panel s12"><div class="lab">Saisonbilanz ${S.year}</div>
     <h2 style="font-size:36px">Sommer: Platz ${s.place}</h2>
     <p class="muted" style="margin:6px 0 14px">Vorstandsziel war Platz ${s.exp}. ${s.place<=s.exp?'Der Vorstand ist zufrieden.':'Der Vorstand ist enttäuscht.'}</p>
     <div class="grid" style="margin-bottom:16px"><div class="s6">${s.splits.map(x=>`<div class="stat"><span class="muted">${x.name}</span><span>Platz ${x.place}</span></div>`).join('')}</div>
     <div class="s6">${s.intl.map(x=>`<div class="stat"><span class="muted">${x.name}</span><span style="font-family:var(--f-body)" class="${x.res==='Sieger'?'warn':x.res?'':'dim'}">${x.res||'nicht qualifiziert'}</span></div>`).join('')}</div></div>
     ${S.jobs&&S.jobs.list.length?`<div class="note ${S.jobless?'bad':'good'}" style="margin:0 0 14px">${S.jobless?'Der Vorstand hat dich entlassen. Wähle einen neuen Verein.':`${S.jobs.list.length} ${S.jobs.list.length===1?'Verein will':'Vereine wollen'} dich als Manager.`} <button class="linkbtn" data-a="jobs">Angebote ansehen</button></div>`:''}
     <button class="btn" data-a="next">${S.jobless?'Neuen Verein wählen':`Saison ${S.year+1} starten`}</button></section>`}
  else if(pend||LIVE){const m=LIVE?LIVE.series.m:pend,opp=S.teams[m.a===S.user?m.b:m.a],fav=teamOvr(U)-teamOvr(opp),an=S.staff.analyst>=3;
    next=`<section class="panel s8 nx"><div class="lab"><span>Nächstes Spiel</span><span>${m.label} · Bo${m.bo}${rivLbl(opp.id)?` · <span class="warn">${rivLbl(opp.id)}</span>`:''}</span></div>
     <div class="nxrow"><div class="nxt">${crest(U,'lg')}<div><b>${U.name}</b><span class="muted">OVR ${teamOvr(U)}</span></div></div>
      <div class="nxm"><span class="nxvs">VS</span><span class="nxf ${fav>2?'good':fav<-2?'bad':'muted'}">${fav>2?'Favorit':fav<-2?'Außenseiter':'Ausgeglichen'}</span></div>
      <div class="nxt r"><div><b>${opp.name}</b><span class="muted">${opp.reg} · OVR ${an?teamOvr(opp):'~'+(Math.round(teamOvr(opp)/5)*5)}</span></div>${crest(opp,'lg')}</div></div>
     <div class="acts" style="margin-top:14px"><button class="btn" data-a="${LIVE?'resume':'next'}">Zur Spielvorbereitung</button><button class="btn ghost" data-a="quick" ${LIVE?'disabled':''}>Serie simulieren</button></div></section>`}
  else next=`<section class="panel s8 nx"><div class="lab"><span>Diese Woche</span><span>${evLabel(S.ev)}</span></div><p class="muted" style="margin:0 0 14px">Dein Team spielt diese Woche nicht. ${S.ev.type==='intl'?`Bei ${S.ev.name} bist du nicht (mehr) dabei.`:''}</p>
     <div class="acts"><button class="btn" data-a="next">Woche simulieren</button><button class="btn ghost" data-a="skipto">Bis zum nächsten eigenen Spiel</button></div></section>`;
  const sp=currentSplit(),st=sp?tableOf(sp.reg[U.reg].ids,sp.reg[U.reg].res):null,me=st?st.find(x=>x.id===S.user):null,pos=st?st.findIndex(x=>x.id===S.user)+1:0;
  const ps=U.roster.map(i=>S.players[i]),am=Math.round(ps.reduce((a,p)=>a+p.morale,0)/ps.length),af=Math.round(ps.reduce((a,p)=>a+p.form,0)/ps.length),fs=finState();
  const goalSt=(()=>{const G=ensureGoals(),c={};for(const g of G.list){const x=goalEval(g,false).st;c[x]=(c[x]||0)+1}return ['auf Kurs','gefährdet','verfehlt','erfüllt','offen'].filter(k=>c[k]).map(k=>`${c[k]} ${k}`).join(' · ')})();
  const tiles=`<section class="s12 tiles">
    <button class="tile tilebtn" data-a="nav" data-v="league"><span>${ICN.table}Tabelle ${U.reg}</span><b>${pos?pos+'.':'-'}</b><small>${me?me.w+' S · '+me.l+' N':'noch keine Spiele'}</small></button>
    <button class="tile tilebtn" data-a="nav2" data-v="squad" data-k="KTAB" data-t="mood"><span>${ICN.form}Form</span><b style="color:${barCol(af)}">${af}</b><small>${me&&me.form.length?formDots(me.form):'Ø im Kader'}</small></button>
    <button class="tile tilebtn" data-a="nav2" data-v="squad" data-k="KTAB" data-t="chem"><span>${ICN.mood}Moral</span><b style="color:${barCol(am)}">${am}</b><small>${moodText(am)}</small></button>
    <button class="tile tilebtn" data-a="nav2" data-v="club" data-k="CLUBTAB" data-t="fin"><span>${ICN.money}Konto</span><b class="${S.fin.balance<0?'bad':''}">${eurK(S.fin.balance)}</b><small class="${fs.cls}">${fs.label} · Prognose ${eurK(fs.proj)}</small></button>
    <button class="tile tilebtn" data-a="nav2" data-v="club" data-k="CLUBTAB" data-t="staff"><span>${ICN.board}Vorstand</span><b>${Math.round(S.board)}%</b><small>${goalSt}</small></button></section>`;
  const todo=todoItems(),mail5=S.inbox.slice(0,5),open=S.inbox.filter(m=>['offer','spreq','pev','job'].includes(m.type)&&!m.done).length;
  const around=st&&pos?(()=>{const a=Math.max(0,Math.min(pos-3,st.length-5)),rows=[];if(a>0)rows.push(0);for(let r=Math.max(a,a>0?1:0);r<Math.min(st.length,a+5);r++)rows.push(r);return rows})():[];
  return `<div class="pagehead"><div><h1>Übersicht</h1><p>${S.manager} · ${U.name} · ${S.ev?evLabel(S.ev):'Saisonpause'}</p></div></div>
  <div class="grid">${tiles}${next}${todoPanel(todo)}
  <section class="panel s7"><div class="lab"><span>Postfach${open?` <span class="mc" style="--mc:var(--warn)">${open} offen</span>`:''}</span><button class="btn ghost sm" data-a="nav2" data-v="inbox">Alle ${S.inbox.length}</button></div>
   <div class="mlist">${mail5.map(m=>{const c=MCAT[mailCat(m.title)],dec=['offer','spreq','pev','job'].includes(m.type)&&!m.done;return `<button class="mrow ${dec?'dec':''}" data-a="nav2" data-v="inbox"><span class="mc" style="--mc:${c[1]}">${c[0]}</span><span class="mt">${m.title}</span><span class="mw">${dec?'Entscheidung':m.when}</span></button>`}).join('')||'<p class="empty">Keine Nachrichten.</p>'}</div></section>
  <section class="panel s5">${st?`<div class="lab"><span>${U.reg} · ${sp.name}</span><button class="btn ghost sm" data-a="nav" data-v="league">Tabelle</button></div><div class="scroll"><table class="tbl"><tbody>${around.map(i=>{const x=st[i],T=S.teams[x.id];return `<tr class="${x.id===S.user?'me':''}"><td class="pos">${i+1}</td><td><button class="linkbtn" data-a="team" data-id="${T.id}" style="display:flex;gap:8px;align-items:center">${crest(T,'sm')}${T.name}</button></td><td class="r">${x.w}-${x.l}</td></tr>`}).join('')}</tbody></table></div>`:`<div class="lab">Tabelle</div><p class="empty">Der Split hat noch nicht begonnen.</p>`}</section>
  ${S.phase!=='offseason'&&S.lastRound?`<section class="panel s12"><div class="lab"><span>Ergebnisse · ${S.lastRound.label}</span><button class="btn ghost sm" data-a="gohist">Meine Spiele</button></div>${resultList(S.lastRound.list)}</section>`:''}
  <details class="more s12"><summary>Mehr: Kalender, Teamchemie, News, Presse${rivPanel()?', Rivalen':''}</summary><div class="grid" style="margin-top:14px"><section class="panel s4"><div class="lab">Saisonkalender</div>${calendarList()}</section>${chemMini()}${newsPanel()}${pressPanel()}${rivPanel()}</div></details>
  </div>`;
}
/* Kleine Linien-Icons für Kennzahlen */
const ICN={table:'<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',form:'<svg viewBox="0 0 24 24"><path d="M3 17l5-6 4 3 8-9"/></svg>',mood:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M8.5 14c1 1.4 2.2 2 3.5 2s2.5-.6 3.5-2M9 10h.01M15 10h.01"/></svg>',money:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',board:'<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>'};
/* Aufgabenliste: alles, was jetzt Aufmerksamkeit braucht, nach Dringlichkeit */
function todoItems(){const U=S.teams[S.user],L=[],nav=(v,k,t)=>`data-a="nav2" data-v="${v}" data-k="${k||''}" data-t="${t||''}"`;
  const add=(lvl,txt,attrs,btn)=>L.push({lvl,txt,attrs,btn});
  if(S.phase==='offseason'&&S.jobs&&S.jobs.list.length)add(S.jobless?'bad':'info',S.jobless?'Du bist entlassen. Wähle einen neuen Verein.':`${S.jobs.list.length} Jobangebote`,'data-a="jobs"','Ansehen');
  const dec=S.inbox.filter(m=>['offer','spreq','pev'].includes(m.type)&&!m.done);
  if(dec.length)add('warn',`${dec.length} ${dec.length===1?'Entscheidung wartet':'Entscheidungen warten'} im Postfach`,nav('inbox'),'Postfach');
  if(S.fin.balance<0)add('bad','Das Konto ist im Minus',nav('club','CLUBTAB','fin'),'Finanzen');
  const out=ROLES.map(r=>S.players[U.starters[r]]).filter(p=>p&&isOut(p));
  if(out.length)add('bad',`${out.map(p=>p.name).join(', ')} ${out.length>1?'fallen':'fällt'} aus`,nav('squad','KTAB','list'),'Kader');
  const tired=U.roster.map(i=>S.players[i]).filter(p=>(p.load||0)>=80&&!isOut(p));
  if(tired.length)add('warn',`${tired.length} ${tired.length===1?'Spieler ist':'Spieler sind'} überlastet`,nav('tactic','TACTAB','train'),'Training');
  const ex=squadAll().filter(([p])=>p.contract<=1&&p.tried!==wkKey()&&!isLoanIn(p));
  if(ex.length&&S.phase!=='offseason')add('warn',`${ex.length} ${ex.length===1?'Vertrag läuft':'Verträge laufen'} am Saisonende aus`,nav('squad','KTAB','vert'),'Verträge');
  const un=U.roster.map(i=>S.players[i]).filter(p=>p.wantRaise||p.wantAway);
  if(un.length)add('warn',`${un.map(p=>p.name).join(', ')} ${un.length>1?'sind':'ist'} unzufrieden`,nav('squad','KTAB','chem'),'Chemie');
  const lo=squadAll().filter(([p])=>p.age<=21&&!p.loan&&praxis(p)==='lo'&&S.step>=20);
  if(lo.length)add('info',`${lo.length} ${lo.length===1?'Talent hat':'Talente haben'} kaum Spielpraxis`,nav('squad','KTAB','aca'),'Talente');
  const emp=SLOTS.filter(([k])=>!S.fin.slots[k]&&slotOpen(k)&&(S.fin.offers[k]||[]).length);
  if(emp.length&&S.phase!=='offseason')add('info',`${emp.length===1?'Ein Sponsor-Slot ist':emp.length+' Sponsor-Slots sind'} frei`,nav('club','CLUBTAB','spons'),'Sponsoren');
  if((S.training.plan||[]).includes('scrim')&&!scrimNow()&&S.phase!=='offseason')add('info','Kein Scrim-Partner für die Scrim-Einheiten',nav('tactic','TACTAB','train'),'Partner');
  const rep=(S.reports||[]).filter(r=>r.g==='A'&&!r.seen&&S.players[r.pid]&&!isMine(S.players[r.pid])).length;
  if(rep)add('info',`${rep} ${rep===1?'neuer Top-Bericht':'neue Top-Berichte'} der Scouts`,nav('transfer','TTAB','scout'),'Scouting');
  return L}
function todoPanel(L){const lv={bad:0,warn:1,info:2};L=L.slice().sort((a,b)=>lv[a.lvl]-lv[b.lvl]);const sh=L.slice(0,6);
  return `<section class="panel s4"><div class="lab"><span>Zu erledigen</span><span class="${L.length?'':'good'}">${L.length?L.length:'alles erledigt'}</span></div>
   ${sh.length?`<div class="todo">${sh.map(x=>`<button class="todoi ${x.lvl}" ${x.attrs}><i class="td"></i><span>${x.txt}</span><em>${x.btn} ›</em></button>`).join('')}</div>${L.length>6?`<p class="dim" style="font-size:12.5px;margin:8px 0 0">und ${L.length-6} weitere</p>`:''}`:'<p class="muted" style="font-size:14px;margin:0">Nichts offen. Du kannst die Woche spielen.</p>'}</section>`}
function currentSplit(){if(S.ev&&S.ev.type==='split')return S.ev;for(const id of ['S3','S2','S1'])if(S.splits[id])return S.splits[id];return null}
function calendarList(){
  const U=S.teams[S.user];
  return CAL.map((c,i)=>{let st;
    if(S.phase==='offseason'||i<S.ci){if(c.type==='split'){const o=S.rec[c.id][U.reg];st=`Platz ${o.indexOf(S.user)+1}`}else{const r=S.rec[c.id];st=r.place[S.user]||`<span class="dim">${S.teams[r.champ].id} gewinnt</span>`}}
    else if(i===S.ci)st='<span class="warn">läuft</span>';else st='<span class="dim">offen</span>';
    return `<div class="stat"><span class="${i===S.ci&&S.phase!=='offseason'?'':'muted'}">${c.name}</span><span style="font-family:var(--f-body)">${st}</span></div>`}).join('');
}
function netW(){const l=S.fin.last;return Object.values(l).reduce((a,b)=>a+b,0)}
function isMyT(id){return id===S.user||id===S.user+'A'}
function meIn(m){return isMyT(m.a)||isMyT(m.b)}
function wlPill(m){const won=isMyT(m.w);return `<span class="wl ${won?'w':'l'}">${won?'S':'N'}</span>`}
function resultList(list){const L=list.slice().sort((x,y)=>meIn(y)-meIn(x));return `<div class="rows">${L.map(m=>{const me=meIn(m),nm=id=>`<span class="${isMyT(id)?'myid':m.w===id?'':'muted'}">${S.teams[id].id}</span>`;
  return `<div class="stat res ${me?'me':''}"><span class="rl">${me?wlPill(m):''}${nm(m.a)}<span class="dim">vs</span>${nm(m.b)}${m.tag&&!REGS.includes(m.tag)?`<span class="rg">${m.tag}</span>`:''}</span><span>${m.score.join(':')}${m.mvp?` <span class="dim" style="font-family:var(--f-body)">· MVP ${m.mvp}</span>`:''}</span></div>`}).join('')}</div>`}
function msgView(m){
  let acts='';
  if(m.type==='pev'){acts=m.done?`<span class="dim" style="font-size:13px">${m.result}</span>`:`<div class="acts">${PEV[m.k].o.map((o,i)=>`<button class="btn ${i?'ghost':''} sm" data-a="pev" data-id="${m.id}" data-v="${i}">${o[0]}</button>`).join('')}</div>`}
  if(m.type==='spreq'){acts=m.done?`<span class="dim" style="font-size:13px">${m.result}</span>`:`<div class="acts"><button class="btn sm" data-a="spreq" data-id="${m.id}" data-ok="1">Annehmen (${eurK(m.fee)})</button><button class="btn ghost sm" data-a="spreq" data-id="${m.id}" data-ok="0">Ablehnen</button></div>`}
  if(m.type==='job'){acts=S.jobs&&S.jobs.list.length?`<div class="acts"><button class="btn sm" data-a="jobs">Angebote ansehen</button></div>`:'<span class="dim" style="font-size:13px">erledigt</span>'}
  if(m.type==='offer'){if(!m.done)acts=`<div class="acts"><button class="btn sm" data-a="offer" data-id="${m.id}" data-ok="1">Annehmen</button>${m.countered?'':`<button class="btn ghost sm" data-a="counter" data-id="${m.id}">+20% fordern</button>`}<button class="btn ghost sm" data-a="offer" data-id="${m.id}" data-ok="0">Ablehnen</button></div>`;else acts=`<span class="dim" style="font-size:13px">${m.result}</span>`}
  const c=MCAT[mailCat(m.title)];
  return `<div class="msg" style="--mc:${c[1]}"><span class="w"><span class="mc" style="--mc:${c[1]}">${c[0]}</span> ${m.when}</span><span class="t">${m.title}</span><p>${m.body}</p>${acts}</div>`;
}
function tableView(st,mini,cut){
  return `<div class="scroll"><table class="tbl"><thead><tr><th>#</th><th>Team</th><th class="r">S</th><th class="r">N</th>${mini?'':'<th class="r">Kills</th><th>Form</th>'}</tr></thead><tbody>
  ${st.map((x,i)=>{const T=S.teams[x.id];return `<tr class="${x.id===S.user?'me':''} ${cut&&i===cut-1?'cut':''}"><td class="pos">${i+1}</td><td><button class="linkbtn" data-a="team" data-id="${T.id}" style="display:flex;gap:8px;align-items:center">${crest(T,'sm')}${mini?T.id:T.name}</button></td><td class="r">${x.w}</td><td class="r">${x.l}</td>${mini?'':`<td class="r">${x.kd>0?'+':''}${x.kd}</td><td>${formDots(x.form)}</td>`}</tr>`}).join('')}</tbody></table></div>`;
}

/* ===== Kader ===== */
function playerRow(p,showTeam){
  const o=ovr(p),T=p.team?S.teams[p.team]:null,k=kn(p),hide=!isMine(p)&&k<60;
  return `<button class="row" data-a="player" data-id="${p.id}"><span>${chip(p.role)}</span>
  <span style="min-width:0;display:flex;gap:10px;align-items:center">${avatar(p,'xs')}<span style="min-width:0"><div class="nm">${p.name}${isLoanee(p)?' <span class="muted" style="font-size:12px">· verliehen</span>':''}${isLoanIn(p)?' <span class="muted" style="font-size:12px">· Leihe</span>':''}${S.trials&&onTrial(p)?' <span class="good" style="font-size:12px">· Probetraining</span>':''}${p.listed?' <span class="warn" style="font-size:12px">· Transferliste</span>':''}</div><div class="sub">${p.rn?`<span class="hide-s">${p.rn} · </span>`:''}${!showTeam&&p.team===S.user?`<span class="show-s"><span style="color:${barCol(p.form)}">Form ${Math.round(p.form)}</span> · <span style="color:${barCol(p.morale)}">Moral ${Math.round(p.morale)}</span> · </span>`:''}${p.age} J. · ${p.nat}${isImp(p,S.teams[S.user].reg)?' <span class="warn">Import</span>':''}${showTeam?` · ${T?T.name+' ('+T.reg+(T.tier===2?' T2':'')+')':'vereinslos'}${T&&p.contract>0?` · Vertrag bis ${S.year+p.contract-1}${p.contract<=1?' <span class="warn">läuft aus</span>':''}`:''}${isMine(p)?'':` · Wissen ${k}%`}`:` · Vertrag ${p.contract} ${p.contract===1?'Saison':'Saisons'}`}</div></span></span>
  <span class="rt">${showTeam?`<span class="kv hide-s">Wert<b>${eurK(valueFor(p))}</b></span><span class="kv hide-s">Gehalt<b>${eurK(isMine(p)?p.salary:demandFor(p,false))}</b></span>${isMine(p)?'':`<span class="kv">Wechsel${signTag(p)}</span>`}`:
   `<span class="kv hide-s fm">Form${bar(p.form)}</span><span class="kv hide-s fm">Moral${bar(p.morale)}</span><span class="kv hide-s">Gehalt<b>${eurK(p.salary)}</b></span>`}
   <span class="kv">${hide?(potEst(p)?'POT '+potTxt(p):'OVR'):'POT '+potTxt(p)}<b class="ovr ${oc(o)}">${hide?'~'+Math.round(o/5)*5:o}</b></span></span></button>`;
}
function squadView(){
  const U=S.teams[S.user],ps=U.roster.map(i=>S.players[i]);
  const starters=ROLES.map(r=>S.players[U.starters[r]]),bench=ps.filter(p=>!isStarter(p)).sort((a,b)=>ROLES.indexOf(a.role)-ROLES.indexOf(b.role)||ovr(b)-ovr(a));
  const all=[...starters,...bench],sal=ps.reduce((s,p)=>s+p.salary,0);
  const avgM=Math.round(all.reduce((s,p)=>s+p.morale,0)/all.length),avgF=Math.round(all.reduce((s,p)=>s+p.form,0)/all.length);
  const cell=v=>`<td class="r mono" style="color:${v>=80?'var(--brass2)':v>=70?'var(--good)':v>=60?'var(--fg)':'var(--muted)'}">${Math.round(v)}</td>`;
  const tr=(p,inner)=>`<tr class="click ${isStarter(p)?'':'benchrow'}" data-a="player" data-id="${p.id}" tabindex="0"><td><span class="chip">${p.role}</span></td><td class="nmcell">${p.name}</td>${inner}</tr>`;
  let body;
  if(KTAB==='depth')body=depthView();
  else if(KTAB==='attr')body=`<section class="panel s12"><div class="lab"><span>Attribute (1-20)</span><span>Grau: Bank · fett: wichtig für die Rolle</span></div><div class="scroll"><table class="tbl atbl"><thead><tr><th></th><th class="stick">Spieler</th><th class="r">OVR</th><th class="r">POT</th>${DA.map(([x,n,g],i)=>`<th class="r ${i&&DA[i-1][2]!==g?'gsep':''}" title="${n}">${DSHORT[x]}</th>`).join('')}<th class="r gsep">Form</th><th class="r">Moral</th></tr></thead><tbody>
    ${all.map(p=>{const ka=keyAttrs(p.role);return `<tr class="click ${isStarter(p)?'':'benchrow'}" data-a="player" data-id="${p.id}" tabindex="0"><td><span class="chip">${p.role}</span></td><td class="nmcell stick">${p.name}</td><td class="r ovr ${oc(ovr(p))}" style="font-size:14px">${ovr(p)}</td><td class="r mono">${p.pot}</td>${DA.map(([x,,g],i)=>{const v=Math.round(p.d[x]);return `<td class="r ${i&&DA[i-1][2]!==g?'gsep':''}"><span class="av ${dcls(v)} ${ka.includes(x)?'kb':''}">${v}</span></td>`}).join('')}<td class="r mono gsep" style="color:${barCol(p.form)}">${Math.round(p.form)}</td><td class="r mono" style="color:${barCol(p.morale)}">${Math.round(p.morale)}</td></tr>`}).join('')}</tbody></table></div>
    <details class="ainfo"><summary>Attribute erklärt</summary><div class="ainfo-g">${Object.entries(DG).map(([g,gn])=>`<div><div class="lab">${gn}</div>${DA.filter(x=>x[2]===g).map(([x,n])=>`<p><b>${DSHORT[x]} · ${n}</b><span class="muted">${DINFO[x]||''}</span></p>`).join('')}</div>`).join('')}</div></details></section>`;
  else if(KTAB==='stats')body=`<section class="panel s12"><div class="lab"><span>Statistik Saison ${S.year}</span><span>alle Spiele inkl. international</span></div><div class="scroll"><table class="tbl"><thead><tr><th></th><th class="stick">Spieler</th><th class="r">Sp.</th><th class="r">Siege</th><th class="r">K/D/A</th><th class="r">KDA</th><th class="r">KP</th><th class="r">CS/Min</th><th class="r">DPM</th><th class="r">Ø Note</th><th class="r">MVP</th><th class="r">OVR +/-</th></tr></thead><tbody>
    ${all.map(p=>{const m=sm(p.st),dv=ovr(p)-(p.o0??ovr(p));return tr(p,`<td class="r">${m.g}</td><td class="r">${m.g?pct(m.wr):'-'}</td><td class="r mono">${m.k}/${m.d}/${m.a}</td><td class="r">${m.g?f1(m.kda,2):'-'}</td><td class="r">${m.full?pct(m.kp):'-'}</td><td class="r">${m.full?f1(m.csm):'-'}</td><td class="r">${m.full?Math.round(m.dpm):'-'}</td><td class="r"><b>${m.rt?f1(m.rt,2):'-'}</b></td><td class="r">${m.mvp}</td><td class="r ${dv>0?'good':dv<0?'bad':'muted'}">${dv>0?'+':''}${dv}</td>`)}).join('')}</tbody></table></div>
    <p class="muted" style="font-size:13px;margin:10px 0 0">KDA = (Kills + Assists) / Tode. KP = Kill-Beteiligung. DPM = Schaden pro Minute.</p></section>`;
  else if(KTAB==='aca')body=acaTab();
  else if(KTAB==='chem')body=chemTab();
  else if(KTAB==='med')body=medTab();
  else if(KTAB==='vert')body=contractsTab();
  else if(KTAB==='mood')body=`<section class="panel s12"><div class="lab"><span>Stimmung</span><span>Ø Form ${avgF} · Ø Moral ${avgM}</span></div><div class="rows">${all.map(p=>`<button class="row" data-a="player" data-id="${p.id}" style="grid-template-columns:46px minmax(0,1fr)"><span>${chip(p.role)}</span><span style="min-width:0"><div class="nm">${p.name} <span class="muted" style="font-weight:500;font-size:13px">${formText(p.form)} · ${moodText(p.morale)}</span></div>
     <div class="mood2"><span>Form</span>${bar(p.form)}<span class="mono">${Math.round(p.form)}</span><span>Moral</span>${bar(p.morale)}<span class="mono">${Math.round(p.morale)}</span></div>
     <div class="sub" style="white-space:normal">${moodReasons(p).filter(x=>x[0]!=='good'||x[1].startsWith('Team')).map(x=>x[1]).join(' ')}</div></span></button>`).join('')}</div></section>`;
  else body=`${coachReport(U)}<section class="panel s12"><div class="lab"><span>Startaufstellung</span><span>Tippe einen Spieler für Details</span></div><div class="rows">${starters.map(p=>playerRow(p)).join('')}</div></section>
  <section class="panel s12"><div class="lab"><span>Bank</span><span>${bench.length} Spieler</span></div><div class="rows">${bench.map(p=>playerRow(p)).join('')||'<p class="empty">Keine Ersatzspieler. Auf dem Transfermarkt findest du Backups.</p>'}</div></section>`;
  return `<div class="pagehead"><div><h1>Kader</h1><p>Team-OVR ${teamOvr(U)} · Ø Form ${avgF} · Ø Moral ${avgM} · ${ps.length}/${MAXR} Spieler · Importe in der Startelf ${impCount(U)}/${IMPMAX} · ${eurK(sal)} Gehälter pro Woche</p></div></div>
  ${groupTabs()}
  <div class="grid">${body}</div>`;
}
