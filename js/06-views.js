/* ===== Transfers ===== */
function transferView(){
  const U=S.teams[S.user];
  let list=Object.values(S.players).filter(p=>!isMine(p)&&(p.team||S.fa.includes(p.id)));
  if(FILT.role!=='ALL')list=list.filter(p=>p.role===FILT.role);
  if(FILT.src==='FA')list=list.filter(p=>!p.team);else if(FILT.src==='T2')list=list.filter(p=>p.team&&S.teams[p.team].tier===2);else if(FILT.src==='SC')list=list.filter(p=>kn(p)>=35);else if(FILT.src!=='ALL')list=list.filter(p=>p.team&&S.teams[p.team].reg===FILT.src);
  const q=FILT.q.trim().toLowerCase();
  if(q)list=list.filter(p=>[p.name,p.rn,p.team&&S.teams[p.team].name,p.team].some(x=>x&&String(x).toLowerCase().includes(q)));
  if(FILT.afford)list=list.filter(canAfford);
  const sk=MSORT[FILT.sort]||MSORT.ovr;list.sort((a,b)=>sk[1](b)-sk[1](a)||ovr(b)-ovr(a));
  const tabs=`<div class="seg" style="margin-bottom:16px">${[['markt','Markt'],['scout','Scouting'],['short','Beobachtung'],['hist','Verlauf']].map(([k,l])=>`<button class="${TTAB===k?'on':''}" data-a="ttab" data-v="${k}">${l}</button>`).join('')}</div>`;
  const rl=releasable();const head=`<div class="pagehead"><div><h1>Transfers</h1><p>Transferbudget ${eurK(S.fin.budget.transfer)} · Gehalt frei ${eurK(Math.max(0,wageFree()))}/Wo. · Kader ${U.roster.length}/${MAXR}</p></div>${rl>=25000?`<button class="btn ghost sm" data-a="gobudget">${eurK(rl)} freigeben</button>`:''}</div>${tabs}`;
  if(TTAB==='scout')return head+`<div class="grid">${scoutTab()}</div>`;
  if(TTAB==='short')return head+`<div class="grid">${shortTab()}</div>`;
  if(TTAB==='hist')return head+`<div class="grid">${historyTab()}</div>`;
  return head+`<div class="grid"><section class="panel s12"><div class="seg" style="margin-bottom:8px">${['ALL',...ROLES].map(r=>`<button class="${FILT.role===r?'on':''}" data-a="frole" data-v="${r}">${r==='ALL'?'Alle Rollen':RN[r]}</button>`).join('')}</div>
  <div class="seg" style="margin-bottom:14px">${[['ALL','Alle'],['SC','Gescoutet'],['FA','Vereinslos'],['T2','T2-Szene'],...REGS.map(r=>[r,r])].map(([k,l])=>`<button class="${FILT.src===k?'on':''}" data-a="fsrc" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="mktbar"><input id="tq" class="inp" type="search" placeholder="Spieler oder Team suchen" value="${esc(FILT.q)}" autocomplete="off" spellcheck="false" aria-label="Suche">
   <label class="mksort"><span class="muted">Sortieren</span><select id="tsort" class="inp">${Object.entries(MSORT).map(([k,[l]])=>`<option value="${k}" ${FILT.sort===k?'selected':''}>${l}</option>`).join('')}</select></label>
   <button class="tog ${FILT.afford?'on':''}" data-a="faff" title="Ablöse und Gehalt passen ins Budget, notfalls mit Umschichtung vom Konto"><span class="tbox">${FILT.afford?'✓':''}</span><span>Nur bezahlbar</span></button></div>
  <div class="rows">${list.slice(0,FILT.n).map(p=>playerRow(p,true)).join('')||'<p class="empty">Keine Spieler für diese Suche.</p>'}</div>
  <div class="mkfoot"><span class="muted">${list.length>FILT.n?`${FILT.n} von ${list.length} Spielern`:`${list.length} Spieler`}</span>${list.length>FILT.n?`<button class="btn ghost sm" data-a="fmore">40 weitere zeigen</button>`:''}</div></section></div>`;
}
/* Sortierung im Markt. Potenzial zählt nur, wenn es gescoutet ist, sonst verrät die Liste mehr als die Spielerseite. */
const MSORT={ovr:['Stärke',p=>ovr(p)],pot:['Potenzial (gescoutet)',p=>potMid(p)??-1],value:['Marktwert',p=>valueFor(p)],fee:['Ablöse niedrig',p=>-askFor(p)],wage:['Gehalt niedrig',p=>-demandFor(p,false)],age:['Jüngste zuerst',p=>-p.age]};

/* ===== Turniere / Liga ===== */
function bmatch(m){const me=meIn(m);return `<div class="bm ${me?'me':''}"><span class="dim" style="font-size:12px;display:flex;justify-content:space-between"><span>Bo${m.bo}</span>${me&&m.w?wlPill(m):me?'<span class="myid" style="font-size:11px">DEIN SPIEL</span>':''}</span>${[m.a,m.b].map((id,i)=>`<div class="${m.w?(m.w===id?'win':'lose'):''} ${isMyT(id)?'mine':''}"><span style="display:flex;gap:8px;align-items:center;min-width:0">${crest(S.teams[id],'sm')}${tname(id)}</span><span class="mono">${m.w?m.score[i]:'-'}</span></div>`).join('')}</div>`}
function stageView(st){
  if(st.kind==='bracket'){const cols=[...st.hist];if(!st.out)cols.push(st.cur);
    return `<div class="bracket">${cols.map((ms,i)=>`<div><div class="lab" style="margin-bottom:6px">${st.label==='Play-In'?'Play-In · Runde '+(i+1):roundName(ms.length*2)}</div>${ms.map(bmatch).join('')}</div>`).join('')}</div>`}
  if(st.kind==='groups'){return `<div class="grid">${st.groups.map((g,gi)=>`<div class="s6"><div class="lab">Gruppe ${'AB'[gi]}</div>${tableView(tableOf(g,st.res),true,2)}</div>`).join('')}</div>${st.out?'':`<div class="lab" style="margin-top:12px">Runde ${st.round+1}</div>${st.cur.map(bmatch).join('')}`}`}
  const rc=st.rec,srt=st.teams.slice().sort((x,y)=>rc[y].w-rc[x].w||rc[x].l-rc[y].l||rc[y].kd-rc[x].kd);
  return `<div class="grid"><div class="s6"><div class="lab">Bilanz</div>${srt.map(t=>{const r=rc[t],stt=st.mode==='33'?(r.w===3?'<span class="good">weiter</span>':r.l===3?'<span class="bad">raus</span>':''):(st.out?(st.out.includes(t)?'<span class="good">weiter</span>':'<span class="bad">raus</span>'):'');
    return `<div class="stat"><span class="rl">${tname(t)}</span><span>${r.w}-${r.l} ${stt}</span></div>`}).join('')}</div>
   <div class="s6">${st.out?'':`<div class="lab">Runde ${st.round+1}</div>${st.cur.map(bmatch).join('')}`}</div></div>`;
}
function leagueView(){
  const reg=VIEWREG||S.teams[S.user].reg,sp=currentSplit();
  let intl='';
  const ev=S.ev&&S.ev.type==='intl'?S.ev:null;
  if(ev)intl=`<section class="panel s12"><div class="lab"><span>${ev.name} ${S.year}</span><span>${stageLabel(ev.stage)}</span></div><p class="muted" style="margin:0 0 14px;font-size:14px">${INTLINFO[ev.id]}</p>
    ${ev.past.length?`<div class="lab" style="margin-bottom:6px">Vorherige Phase</div><p class="muted" style="font-size:14px;margin:0 0 14px">Ausgeschieden: ${ev.past.flatMap(p=>p.elim.flatMap(e=>e.ids)).map(id=>S.teams[id].name).join(', ')}</p>`:''}
    ${stageView(ev.stage)}</section>`;
  let split='';
  if(sp){const g=sp.reg[reg],st=tableOf(g.ids,g.res);
    split=`<section class="panel s7"><div class="lab"><span>${reg} · ${sp.name}</span><span>${sp.stage==='rr'&&sp===S.ev?'Woche '+(sp.round+1)+'/7':'Top 4 in die Playoffs'}</span></div>${tableView(st,false,4)}</section>
    <section class="panel s5"><div class="lab">Playoffs ${reg}</div>${g.po?`${g.po.semis.map(bmatch).join('')}${g.po.final?bmatch(g.po.final):''}${g.order?`<p class="muted" style="font-size:14px;margin:8px 0 0">Sieger: <b style="color:var(--fg)">${S.teams[g.order[0]].name}</b></p>`:''}`:'<p class="empty">Starten nach Woche 7. Halbfinale und Finale im Bo5.</p>'}
     ${!ev&&sp===S.ev&&sp.stage==='rr'?`<div class="lab" style="margin-top:16px">Woche ${sp.round+1}</div>${S.ev.cur.filter(m=>m.tag===reg).map(bmatch).join('')}`:''}</section>`}
  const past=CAL.filter((c,i)=>c.type==='intl'&&S.rec[c.id]).map(c=>{const r=S.rec[c.id];return `<div class="stat"><span>${c.name}</span><span style="font-family:var(--f-body)">${S.teams[r.champ].name} <span class="rg">${S.teams[r.champ].reg}</span></span></div>`}).join('');
  const regseg=`<section class="panel s12" style="padding-block:12px"><div class="seg">${REGS.map(r=>`<button class="${reg===r?'on':''}" data-a="vreg" data-v="${r}">${r} <span style="opacity:.7;font-weight:500">${REG[r].full}</span></button>`).join('')}</div></section>`;
  const head=`<div class="pagehead"><div><h1>Turniere</h1><p>Saison ${S.year} · ${S.ev?evLabel(S.ev):'Saisonpause'}</p></div></div><div class="seg" style="margin-bottom:16px">${[['comp','Wettbewerbe'],['hist','Meine Spiele'],['stats','Statistiken'],['awards','Auszeichnungen'],['t2','T2-Szene']].map(([k,l])=>`<button class="${LTAB===k?'on':''}" data-a="ltab" data-v="${k}">${l}</button>`).join('')}</div>`;
  if(LTAB==='stats')return head+`<div class="grid">${regseg}${statsView(reg)}</div>`;
  if(LTAB==='t2')return head+`<div class="grid">${regseg}${t2View(reg)}</div>`;
  if(LTAB==='hist')return head+`<div class="grid">${mhList()}</div>`;
  if(LTAB==='awards')return head+`<div class="grid">${regseg}${awardsView(reg)}</div>`;
  return head+`<div class="grid">${intl}
  ${qualPanel(reg)}
  <section class="panel s12" style="padding-block:12px"><div class="seg">${REGS.map(r=>`<button class="${reg===r?'on':''}" data-a="vreg" data-v="${r}">${r} <span style="opacity:.7;font-weight:500">${REG[r].full}</span></button>`).join('')}</div></section>
  ${split}
  <section class="panel s6"><div class="lab">Internationale Sieger ${S.year}</div>${past||'<p class="empty">Noch kein internationales Turnier gespielt.</p>'}</section>
  <section class="panel s6"><div class="lab">Vereinsgeschichte</div>${S.history.length?S.history.map(h=>`<div class="stat"><span>${h.year}: Splits ${h.splits.join(' / ')}</span><span style="font-family:var(--f-body)" class="muted">Worlds: ${h.intl[3]||'nicht dabei'}</span></div>`).join(''):'<p class="empty">Die erste Saison läuft.</p>'}
   ${S.trophies.length?`<div class="lab" style="margin-top:14px">Titel</div>${S.trophies.map(t=>`<div class="stat"><span>${t.name}</span><span>${t.year}</span></div>`).join('')}`:''}</section></div>`;
}

const QUAL={
  FS:{split:'S1',n:'Winter-Split',slots:{LCK:[1,2],LPL:[1,2],LEC:[1],LCS:[1],LCP:[1],CBLOL:[1]}},
  MSI:{split:'S2',n:'Frühjahrs-Split',slots:{LCK:[1,2],LPL:[1,2],LEC:[1,2],LCS:[1,2],LCP:[1,2],CBLOL:[1]}},
  DC:{split:'S3',n:'Sommer-Split',slots:{LCK:[5,7],LPL:[5,7],LEC:[4,5],LCS:[3,4],LCP:[3],CBLOL:[3]}},
  WLD:{split:'S3',n:'Sommer-Split',slots:{LCK:[1,4],LPL:[1,4],LEC:[1,3],LCS:[1,2],LCP:[1,2],CBLOL:[1,2]}}
};
function qualPanel(reg){const txt=a=>a.length===1?`Platz ${a[0]}`:a[0]===1&&a[1]===2?'Platz 1 und 2':`Platz ${a[0]} bis ${a[1]}`;
  return `<section class="panel s12"><div class="lab"><span>Qualifikation ${reg}</span><span>Zählt die Endplatzierung nach den Playoffs</span></div>
  ${['FS','MSI','DC','WLD'].map(id=>{const q=QUAL[id];return `<div class="stat"><span>${CAL.find(c=>c.id===id).name}</span><span style="font-family:var(--f-body)">${txt(q.slots[reg])} im ${q.n}</span></div>`}).join('')}
  <p class="muted" style="font-size:13px;margin:10px 0 0">Platz 1 und 2 sind die Finalisten, Platz 3 und 4 die Halbfinal-Verlierer (sortiert nach der Tabelle), ab Platz 5 zählt die Tabelle der Hinrunde. Der Demacia Cup ist für die besten Teams, die Worlds knapp verpasst haben. Nur der Sommer-Split zählt.</p></section>`}
/* ===== Verein ===== */
function clubView(){
  const f=S.fin,U=S.teams[S.user];
  const tabs=[['fin','Übersicht'],['budget','Budgets'],['spons','Sponsoren'],['inc','Einnahmen'],['infra','Infrastruktur'],['staff','Staff & Vorstand']];
  let body='';
  if(CLUBTAB==='fin'){
    const h=f.hist,mn=Math.min(...h,0),mx=Math.max(...h,1),pts=h.map((v,i)=>`${(i/(Math.max(1,h.length-1))*300).toFixed(1)},${(90-(v-mn)/(mx-mn)*80).toFixed(1)}`).join(' ');
    const zero=(90-(0-mn)/(mx-mn)*80).toFixed(1);
    const rows=(o,cls,sg)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="stat"><span class="muted">${k}</span><span class="${cls}">${sg}${eur(v)}</span></div>`).join('');
    const ti=Object.values(f.season.inc).reduce((a,b)=>a+b,0),te=Object.values(f.season.exp).reduce((a,b)=>a+b,0);
    const debtMax=Math.max(250000,U.rep*10000);
    body=`<section class="panel s7"><div class="lab">Kontostand</div><div class="big ${f.balance<0?'bad':''}">${eur(f.balance)}</div>
     <svg viewBox="0 0 300 96" style="width:100%;height:110px;margin:10px 0" preserveAspectRatio="none" role="img" aria-label="Kontoverlauf"><line x1="0" x2="300" y1="${zero}" y2="${zero}" stroke="var(--line)" stroke-dasharray="3 4"/><polyline points="${pts}" fill="none" stroke="var(--brass)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>
     <div class="lab" style="margin-top:6px">Letzte Woche</div>
     ${f.last?Object.entries(f.last).filter(([,v])=>v).map(([k,v])=>`<div class="stat"><span class="muted">${k}</span><span class="${v>=0?'good':'bad'}">${v>=0?'+':''}${eur(v)}</span></div>`).join('')+`<div class="stat"><span>Saldo</span><span class="${netW()>=0?'good':'bad'}">${netW()>=0?'+':''}${eur(netW())}</span></div>`:'<p class="empty">Die erste Abrechnung kommt nach der ersten Woche.</p>'}
     <div class="stat"><span class="muted">Fans</span><span>${f.fans.toLocaleString('de-DE')}</span></div></section>
    <section class="panel s5"><div class="lab"><span>Saison ${S.year}</span><span class="${ti-te>=0?'good':'bad'}">${ti-te>=0?'+':''}${eurK(ti-te)}</span></div>
     <div class="lab" style="margin:4px 0 4px">Einnahmen</div>${rows(f.season.inc,'good','+')||'<p class="empty">Noch keine.</p>'}
     <div class="lab" style="margin:14px 0 4px">Ausgaben</div>${rows(f.season.exp,'bad','-')||'<p class="empty">Noch keine.</p>'}
     <div class="lab" style="margin-top:18px">Kredit</div>
     ${f.loan?`<div class="stat"><span class="muted">Restschuld</span><span class="bad">${eur(f.loan.left)}</span></div><div class="stat"><span class="muted">Rate pro Woche</span><span>${eur(f.loan.weekly)}</span></div>
       <div class="acts" style="margin-top:8px"><button class="btn ghost sm" data-a="payloan" ${f.balance<f.loan.left?'disabled':''}>Sofort ablösen (${eurK(f.loan.left)})</button></div>`
      :`<p class="muted" style="font-size:13px;margin:0 0 8px">Rückzahlung über 26 Wochen mit 12% Zinsen. Die Bank leiht dir abhängig vom Ruf bis ${eurK(debtMax)}.</p><div class="acts">${LOANS.map(a=>`<button class="btn ghost sm" data-a="lend" data-v="${a}" ${a>debtMax?'disabled':''}>${eurK(a)} leihen</button>`).join('')}</div>`}</section>`;
  }else if(CLUBTAB==='budget'){
    const b=f.budget,bill=wageBill(),fs=finState(),wk=f.weeks,months=[];for(let i=0;i<wk.length;i+=4)months.push(wk.slice(i,i+4).reduce((a,c)=>a+c,0));
    const mx=Math.max(1,...months.map(Math.abs)),bw=Math.max(14,Math.min(40,520/Math.max(1,13)));
    const ps=U.roster.map(i=>S.players[i]).sort((a,c)=>c.salary-a.salary);
    body=`<section class="panel s5"><div class="lab">Finanzlage</div><div class="big ${fs.cls}" style="font-family:var(--f-disp);font-stretch:78%;font-weight:800">${fs.label}</div>
      <div class="stat" style="margin-top:8px"><span class="muted">Kontostand</span><span>${eur(f.balance)}</span></div>
      <div class="stat"><span class="muted">Ø Saldo pro Woche (8 Wo.)</span><span class="${fs.avg>=0?'good':'bad'}">${fs.avg>=0?'+':''}${eur(fs.avg)}</span></div>
      <div class="stat"><span class="muted">Prognose Saisonende</span><span class="${fs.proj>=0?'':'bad'}">${eur(fs.proj)}</span></div>
      <div class="lab" style="margin-top:16px">Vorstand</div>
      <p class="muted" style="font-size:13px;margin:0 0 8px">${b.asked?'Du hast diese Saison schon um mehr Budget gebeten.':'Einmal pro Saison kannst du um mehr Transferbudget bitten. Klappt eher bei hohem Vertrauen und positivem Kontostand.'}</p>
      <button class="btn ghost sm" data-a="askboard" ${b.asked?'disabled':''}>Mehr Budget anfragen</button>
      <div class="lab" style="margin-top:16px"><span>Geld vom Konto freigeben</span><span>jederzeit</span></div>
      <div class="stat"><span class="muted">Rücklage (10 Wochen Kosten)</span><span>${eur(reserveAmt())}</span></div>
      <div class="stat"><span class="muted">Freigabe möglich</span><span class="${releasable()?'good':''}">${eur(releasable())}</span></div>
      ${releasable()>=1000?`<div class="acts" style="margin-top:8px">${[.25,.5,1].map(x=>`<button class="btn ${x===1?'':'ghost'} sm" data-a="cashrel" data-v="${x}">${x===1?'Alles':Math.round(x*100)+'%'} (${eurK(r1000(releasable()*x))})</button>`).join('')}</div>`:''}
      <p class="muted" style="font-size:12.5px;margin:6px 0 0">Der Vorstand gibt Geld frei, das über Rücklage und Transferbudget hinaus auf dem Konto liegt. Je höher sein Vertrauen, desto mehr. Vor jedem Split prüft er die Budgets außerdem automatisch.</p></section>
     <section class="panel s7"><div class="lab"><span>Budgets ${S.year}</span><span>${b.frozen?'<span class="bad">Transferbudget eingefroren</span>':`${b.salePct}% der Verkäufe fließen zurück`}</span></div>
      <div class="bud"><div><span class="muted">Transferbudget</span><b class="big">${eurK(b.transfer)}</b></div><div><span class="muted">Gehaltsbudget pro Woche</span><b class="big">${eurK(b.wage)}</b></div></div>
      <div class="lab" style="margin:14px 0 6px"><span>Gehälter</span><span>${eurK(bill)} von ${eurK(b.wage)} genutzt</span></div>${bar(bill/b.wage*100,bill>b.wage?'var(--bad)':bill/b.wage>.92?'var(--warn)':'var(--good)')}
      <p class="muted" style="font-size:13px;margin:8px 0 0">Das Gehaltsbudget richtet sich nach deinen laufenden Einnahmen. Academy-Gehälter zählen mit.</p>
      <div class="lab" style="margin:16px 0 6px">Umschichten</div><p class="muted" style="font-size:13px;margin:0 0 8px">25.000 € Transferbudget entsprechen 625 € Gehaltsbudget pro Woche.</p>
      <div class="acts"><button class="btn ghost sm" data-a="shift" data-v="w" ${b.transfer<25000?'disabled':''}>25k ins Gehaltsbudget</button><button class="btn ghost sm" data-a="shift" data-v="t" ${b.wage-625<bill?'disabled':''}>625 €/Wo. ins Transferbudget</button></div></section>
     <section class="panel s7"><div class="lab"><span>Saldo pro Monat</span><span>4 Wochen je Balken</span></div>${months.length?`<svg viewBox="0 0 560 160" style="width:100%;height:auto" role="img" aria-label="Monatlicher Saldo"><line x1="0" x2="560" y1="80" y2="80" stroke="var(--line)"/>${months.map((v,i)=>{const h=Math.abs(v)/mx*70,x=10+i*(bw+6);return `<rect x="${x}" y="${v>=0?80-h:80}" width="${bw}" height="${Math.max(1,h)}" rx="3" fill="${v>=0?'var(--good)':'var(--bad)'}" opacity=".85"/><text x="${x+bw/2}" y="${v>=0?80-h-5:80+h+13}" text-anchor="middle" font-size="10" fill="var(--muted)" font-family="IBM Plex Mono,monospace">${Math.round(v/1000)}k</text><text x="${x+bw/2}" y="156" text-anchor="middle" font-size="10" fill="var(--dim)" font-family="IBM Plex Mono,monospace">M${i+1}</text>`}).join('')}</svg>`:'<p class="empty">Nach der ersten Woche erscheint hier der Verlauf.</p>'}
      <p class="muted" style="font-size:13px;margin:6px 0 0">Preisgelder und Transfers zählen im Monat, in dem sie anfallen, nicht in der Wochenbilanz.</p></section>
     <section class="panel s5"><div class="lab">Gehaltsstruktur</div>${ps.map(p=>`<div class="wrow"><span class="nmcell" style="font-size:14px">${p.name} <span class="dim mono" style="font-size:11px">${p.role} · bis ${S.year+p.contract-1}</span></span><span class="mono">${eurK(p.salary)}</span>${bar(p.salary/(ps[0].salary||1)*100,'var(--brass)')}</div>`).join('')}</section>`;
  }else if(CLUBTAB==='spons'){
    body=sponsorTab();
  }else if(CLUBTAB==='inc'){
    const merchW=Math.round(f.fans*.012),ps=Math.round(U.roster.length*500*U.rep/70);
    body=`<section class="panel s6"><div class="lab">Merchandise-Preise</div><p class="muted" style="font-size:14px;margin:0 0 10px">Teurere Trikots bringen mehr pro Fan, kosten aber langsam Fans. Günstige Preise machen das Team bekannter.</p>
      <div class="seg">${Object.entries(MERCH).map(([k,m])=>`<button class="${f.merch===k?'on':''}" data-a="merch" data-v="${k}">${m.n}</button>`).join('')}</div>
      <div class="stat" style="margin-top:10px"><span class="muted">Merch pro Woche</span><span>${eur(merchW*MERCH[f.merch].m)}</span></div>
      <div class="stat"><span class="muted">Fan-Effekt pro Woche</span><span>${sgn(MERCH[f.merch].f)}%</span></div></section>
     <section class="panel s6"><div class="lab">Content-Team</div><p class="muted" style="font-size:14px;margin:0 0 10px">Videos, Vlogs und Social Media. Kostet jede Woche Geld, lässt die Fanbasis wachsen. Mehr Fans heißt mehr Streaming- und Merch-Einnahmen.</p>
      <div class="seg">${CONTENT.map((c,i)=>`<button class="${f.content===i?'on':''}" data-a="content" data-v="${i}">${c[2]}</button>`).join('')}</div>
      <div class="stat" style="margin-top:10px"><span class="muted">Kosten pro Woche</span><span>${eur(CONTENT[f.content][0])}</span></div>
      <div class="stat"><span class="muted">Fan-Wachstum pro Woche</span><span>+${CONTENT[f.content][1].toString().replace('.',',')}%</span></div></section>
     <section class="panel s12"><div class="lab">Streaming-Pflicht für Spieler</div><p class="muted" style="font-size:14px;margin:0 0 10px">Deine Spieler streamen neben dem Training. Bringt aktuell ${eur(ps)} pro Woche, kostet aber jede Woche etwas Form.</p>
      <div class="seg"><button class="${f.pstream?'':'on'}" data-a="pstream" data-v="0">Aus</button><button class="${f.pstream?'on':''}" data-a="pstream" data-v="1">An</button></div></section>`;
  }else if(CLUBTAB==='infra'){
    body=Object.entries(INFRA).map(([k,x])=>{const lv=f.infra[k],max=x.cost.length,cost=x.cost[lv];
      return `<section class="panel s4"><div class="lab"><span>${x.n}</span><span>Stufe ${lv}/${max}</span></div>${bar(lv/max*100,'var(--brass)')}<p class="muted" style="font-size:14px;margin:10px 0">${x.d}</p>
       <div class="stat"><span class="muted">Unterhalt pro Woche</span><span>${eur(lv*x.up)}</span></div>
       ${lv<max?`<div class="acts" style="margin-top:10px"><button class="btn sm" data-a="infra" data-v="${k}" ${f.balance<cost?'disabled':''}>Ausbauen für ${eurK(cost)}</button></div><p class="dim" style="font-size:12.5px;margin:6px 0 0">Danach ${eur((lv+1)*x.up)} Unterhalt pro Woche.</p>`:'<p class="good" style="font-size:13px;margin:10px 0 0">Voll ausgebaut.</p>'}</section>`}).join('');
  }else{
    body=`${staffTab()}
    <section class="panel s6"><div class="lab">Vorstand</div>${bar(S.board,barCol(S.board))}<p class="muted" style="font-size:13px">Vertrauen ${Math.round(S.board)}%. Steigt mit guten Platzierungen im Sommer-Split und einer Worlds-Teilnahme. Ziel: Platz ${expected(S.user)}.</p>
     <div class="lab" style="margin-top:16px">Spielstand</div>
     <p class="muted" style="font-size:13px;margin:0 0 8px">Hängt ein Turnier fest, startet "Phase neu starten" die aktuelle Turnierphase neu. Bisherige Ergebnisse bleiben.</p>
     <div class="acts"><button class="btn ghost sm" data-a="repair">Phase neu starten</button>${MODAL==='reset'?`<button class="btn danger sm" data-a="reset" data-ok="1">Ja, alles löschen</button><button class="btn ghost sm" data-a="reset" data-ok="0">Abbrechen</button>`:`<button class="btn ghost sm" data-a="reset">Neue Karriere</button>`}</div></section>`;
  }
  return `<div class="pagehead"><div><h1>Verein</h1><p>${U.reg} · Ruf ${U.rep} · ${eurK(f.balance)}${f.loan?' · Kredit offen':''}</p></div></div>
  <div class="seg" style="margin-bottom:16px">${tabs.map(([k,l])=>`<button class="${CLUBTAB===k?'on':''}" data-a="ctab" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="grid">${body}</div>`;
}

/* ===== Spieler-Details ===== */
function moodText(v){return v>=78?'Sehr zufrieden':v>=60?'Zufrieden':v>=45?'Unruhig':'Unzufrieden'}
function formText(v){return v>=82?'Topform':v>=68?'Gute Form':v>=55?'Durchschnitt':'Formtief'}
function moodReasons(p){const r=[],T=S.teams[p.team],mine=p.team===S.user;
  if(!T)return['Ist vereinslos und sucht ein Team.'];
  if(!isStarter(p))r.push(['bad','Sitzt auf der Bank und verliert jede Woche etwas Moral.']);else r.push(['good','Ist Stammspieler.']);
  const sp=currentSplit();if(sp&&sp.reg[T.reg]){const st=tableOf(sp.reg[T.reg].ids,sp.reg[T.reg].res).find(x=>x.id===T.id);if(st&&st.form.length){const l=st.form.slice(-5),w=l.filter(Boolean).length;r.push([w>=3?'good':w<=1?'bad':'',`Team hat ${w} der letzten ${l.length} Spiele gewonnen.`])}}
  if(p.listed)r.push(['bad','Steht auf der Transferliste.']);
  if(p.contract<=1)r.push(['warn','Vertrag läuft am Saisonende aus.']);
  if(mine&&S.fin.pstream)r.push(['warn','Streaming-Pflicht kostet jede Woche Form.']);
  if(mine&&S.training.intensity==='high')r.push(['warn','Hohe Trainingsintensität kostet Form.']);
  if(mine&&S.training.plan&&S.training.plan.includes('rest'))r.push(['good','Erholung im Wochenplan baut Form und Moral auf.']);
  if((p.load||0)>=70)r.push(['bad',`Hohe Belastung (${Math.round(p.load)}): Form und Fortschritt leiden.`]);
  if(S.ment&&S.ment[p.id]&&S.players[S.ment[p.id]])r.push(['good',`Wird von ${S.players[S.ment[p.id]].name} betreut.`]);
  if(mine&&p.team===S.user&&motBonus()>0)r.push(['good','Der Head Coach motiviert das Team.']);
  if(mine&&S.fin.infra.gh)r.push(['good',`Gaming House Stufe ${S.fin.infra.gh} hebt Moral und Form.`]);
  return r}
function roleAvg(role,reg){const xs=Object.values(S.teams).filter(t=>t.reg===reg&&t.tier!==2).map(t=>S.players[t.starters[role]]).filter(Boolean);const a={};for(const k of ATTR)a[k]=Math.round(xs.reduce((s,p)=>s+p.a[k],0)/xs.length);a.ovr=Math.round(xs.reduce((s,p)=>s+ovr(p),0)/xs.length);return a}
function kda(s){return s&&s.g?(s.d?(s.k/s.d).toFixed(2).replace('.',','):s.k+',00'):'-'}
function wr(s){return s&&s.g?Math.round(s.w/s.g*100)+'%':'-'}
function addStats(g,A,B){[A,B].forEach((T,side)=>{const won=g.winner===side;for(const id of g.st[side]){const p=S.players[id];if(!p)continue;const s=p.st||(p.st={g:0,w:0,k:0,d:0,mvp:0});const x=g.ps[id]||{};s.g++;if(won)s.w++;s.k+=g.K[side][id]||0;s.d+=g.D[side][id]||0;s.a=(s.a||0)+(x.a||0);s.rs=(s.rs||0)+(g.rt[id]||6);s.rn=(s.rn||0)+1;if(id===g.mvp)s.mvp++;s.min=(s.min||0)+g.end;s.cs=(s.cs||0)+(x.cs||0);s.dmg=(s.dmg||0)+(x.dmg||0);s.tk=(s.tk||0)+g.kills[side];const c=g.dr&&g.dr[side].picks[p.role];if(c!=null){s.ch=s.ch||{};const e=s.ch[c]||(s.ch[c]=[0,0]);e[0]++;if(won)e[1]++}}});teamStats(g)}
function avgR(s){return s&&s.rn?(s.rs/s.rn).toFixed(2).replace('.',','):'-'}
/* ===== FM-Bausteine ===== */
function hsh(str){let h=7;for(const c of str)h=(h*31+c.charCodeAt(0))>>>0;return h}
function seeExact(p){return kn(p)>=85}
function seeExactOld(p){return p.team===S.user||S.staff.analyst>=4||(!p.team&&S.staff.analyst>=3)}
function dcls(v){return v>=16?'a5':v>=13?'a4':v>=10?'a3':v>=6?'a2':'a1'}
function dval(p,x){const v=Math.round(p.d[x]);if(seeExact(p))return `<span class="av ${dcls(v)}">${v}</span>`;
  const w=knW(p),off=hsh(p.id+x)%(w+1),lo=clamp(v-off,1,20),hi=clamp(lo+w,1,20);return `<span class="av ${dcls((lo+hi)/2)} rng">${lo}-${hi}</span>`}
function stars(o){const v=clamp(Math.round((o-45)/9*2)/2,.5,5),f=Math.floor(v);return `<span class="stars" title="${v} von 5">${'★'.repeat(f)}${v%1?'<span class="half">★</span>':''}<span class="dimstar">${'★'.repeat(5-Math.ceil(v))}</span></span>`}
function personality(p){const h=p.h,t=[];
  if(h.pro>=16&&h.amb>=15)t.push('Musterprofi');else if(h.pro>=15)t.push('Professionell');else if(h.pro<=7)t.push('Locker');
  if(h.amb>=16&&!t.includes('Musterprofi'))t.push('Sehr ehrgeizig');else if(h.amb<=6)t.push('Genügsam');
  if(p.d.nrv>=15)t.push('Nervenstark');else if(p.d.nrv<=7)t.push('Nervös in großen Spielen');
  if(p.d.lead>=15)t.push('Leitwolf');
  if(!t.length)t.push('Ausgeglichen');return t}
function persNote(p){const h=p.h;return [h.pro>=15?'Trainiert sehr diszipliniert, entwickelt sich schneller.':h.pro<=7?'Nimmt das Training nicht immer ernst, entwickelt sich langsamer.':'Normale Trainingseinstellung.',
  h.amb>=15?'Will zu einem Topteam, ist bei kleinen Teams schwer zu überzeugen.':h.amb<=6?'Bleibt auch bei kleineren Teams gern.':''].filter(Boolean)}
function coachView(p){const o=ovr(p),room=p.pot-o;
  if(p.age>=27)return room<=1?'Hat seinen Höhepunkt erreicht. Mechanik und Reaktion lassen mit dem Alter nach, Erfahrung wächst.':'Kann sich noch etwas steigern, die besten Jahre sind aber vorbei.';
  if(room>=12)return 'Großes Talent. Mit Spielzeit und gezieltem Training ist viel drin.';
  if(room>=6)return 'Hat noch deutlich Luft nach oben.';
  if(room>=2)return 'Nahe an seinem Limit, kleine Fortschritte sind noch möglich.';
  return 'Ist am Limit seines Potenzials.'}

/* ===== Spielerseite ===== */
function playerView(){
  const p=S.players[PV&&PV.id];if(!p){S.view='squad';return squadView()}
  const o=ovr(p),mine=isMine(p),main=p.team===S.user,inAca=p.team===acaId(),T=p.team?S.teams[p.team]:null,ex=seeExact(p),K=kn(p),shl=(S.short||[]).includes(p.id);
  const val=valueFor(p),demand=T?Math.round(Math.max(p.salary,salaryFor(o))*1.15/100)*100:salaryFor(o);
  const st=p.st||{g:0,w:0,k:0,d:0,mvp:0},ka=keyAttrs(p.role),tab=PV.tab||'profil',an=mine?4:knLv(p);
  const ovrTxt=ex||an>=3?o:'~'+Math.round(o/5)*5,pTxt=potTxt(p),pM=potMid(p);
  const head=`<section class="panel s12 phead"><div class="pav">${avatar(p,'xl')}${T?crest(T,'sm'):''}</div>
    <div class="pinfo"><div class="acts" style="gap:6px">${chip(RN[p.role])}${isStarter(p)?'<span class="chip" style="color:var(--good)">Starter</span>':T?'<span class="chip">Bank</span>':''}${p.listed?'<span class="chip" style="color:var(--warn)">Transferliste</span>':''}</div>
     <h1 class="pname">${p.name}</h1>${mine?'':`<div class="acts" style="gap:8px;margin:2px 0 6px"><span class="chip" style="min-width:0">Scouting-Wissen ${K}%</span><button class="btn ghost sm" data-a="short" data-id="${p.id}">${shl?'Von Beobachtung entfernen':'Beobachten'}</button></div>`}<p style="margin:0 0 2px;font-size:15px">„${p.name}“ · ${p.rn||''}</p><p class="muted" style="margin:0">${p.age} Jahre · ${p.nat} · ${T?`<button class="linkbtn" data-a="team" data-id="${T.id}">${T.name}</button> (${T.reg})`:'vereinslos'}</p></div>
    <div class="pab"><div><span class="muted">Aktuell</span>${stars(ex||an>=3?o:Math.round(o/5)*5)}<b class="ovr ${oc(o)}">${ovrTxt}</b></div><div><span class="muted">Potenzial</span>${pTxt==='?'?'<span class="dimstar">★★★★★</span>':stars(pM)}<b class="ovr">${pTxt}</b></div></div>
    <div class="pkpi"><div><span>Marktwert</span><b>${eurK(val)}</b></div><div><span>${mine?'Gehalt':'Forderung'}</span><b>${eurK(mine?p.salary:demand)}/Wo.</b></div><div><span>Vertrag</span><b>${p.team?`bis ${S.year+p.contract-1}`:'-'}</b></div>
     <div><span>Form</span><b style="color:${barCol(p.form)}">${Math.round(p.form)}</b></div><div><span>Moral</span><b style="color:${barCol(p.morale)}">${Math.round(p.morale)}</b></div></div></section>`;
  const tabs=`<div class="seg s12">${[['profil','Profil'],['entw','Entwicklung'],['stat','Statistik'],['vertrag',mine?'Vertrag':'Transfer']].map(([k,l])=>`<button class="${tab===k?'on':''}" data-a="ptab" data-v="${k}">${l}</button>`).join('')}</div>`;
  let body='';
  if(tab==='profil'){
    const col=g=>`<div class="acol"><div class="lab">${DG[g]}</div>${DA.filter(x=>x[2]===g).map(([x,n])=>`<div class="arow ${ka.includes(x)?'key':''}" ${DINFO[x]?`title="${DINFO[x]}"`:''}><span>${n}</span>${dval(p,x)}</div>`).join('')}</div>`;
    const reasons=mine||an>=2?`<ul class="reasons">${moodReasons(p).map(([c,t])=>`<li class="${c}">${t}</li>`).join('')}</ul>`:'<p class="dim" style="font-size:13px;margin:4px 0 0">Gründe sichtbar ab 35% Scouting-Wissen.</p>';
    body=`<section class="panel s8"><div class="lab"><span>Attribute</span><span>Hervorgehoben: wichtig für ${RN[p.role]}${ex?'':` · Scouting-Wissen ${K}%`}</span></div>
      <div class="agrid">${col('T')}${col('M')}${col('P')}</div>
      <p class="muted" style="font-size:13px;margin:12px 0 0">Nervenstärke wirkt in Playoffs und internationalen Spielen, Championpool ab Spiel 2 einer Serie, Konstanz gegen schwankende Leistungen, Konzentration im Lategame, Belastbarkeit gegen Formverlust.</p></section>
     <section class="panel s4"><div class="lab">Kernwerte</div>${ATTR.map(k=>`<div class="attr"><span class="muted">${AN[k]}</span>${bar(ex?p.a[k]:Math.round(p.a[k]/10)*10,'var(--brass)')}<span class="mono" style="text-align:right">${ex?Math.round(p.a[k]):'?'}</span></div>`).join('')}
      <div class="lab" style="margin-top:16px">Rollen-Eignung</div>${ROLES.map(r=>{const v=ovrAs(p,r);return `<div class="attr"><span class="${r===p.role?'':'muted'}">${RN[r]}${r===p.role?' •':''}</span>${bar((v-30)*1.6,r===p.role?'var(--brass)':'var(--dim)')}<span class="mono" style="text-align:right">${ex||an>=3?v:'?'}</span></div>`}).join('')}
      <div class="lab" style="margin-top:16px"><span>Champions</span><span>Meisterschaft</span></div>${(p.ch||[]).slice(0,mine||an>=2?8:2).map(([c,m])=>`<div class="attr"><span class="${isMeta(c)?'':'muted'}">${CH[c][0]}${isMeta(c)?' ★':''}</span>${bar(m*5,'var(--brass)')}<span class="mono" style="text-align:right">${mine||an>=2?m:'?'}</span></div>`).join('')}${!mine&&an<2?'<p class="dim" style="font-size:13px;margin:4px 0 0">Ganzer Pool ab 35% Scouting-Wissen.</p>':''}
      <div class="lab" style="margin-top:16px">Persönlichkeit</div>${mine||an>=3?`<div class="acts" style="gap:6px">${personality(p).map(t=>`<span class="chip" style="min-width:0">${t}</span>`).join('')}</div><ul class="reasons">${persNote(p).map(t=>`<li>${t}</li>`).join('')}</ul>`:'<p class="dim" style="font-size:13px;margin:0">Unbekannt. Ab 60% Scouting-Wissen sichtbar.</p>'}
      <div class="lab" style="margin-top:16px">Zustand</div><p style="margin:0;font-size:14px"><b>${formText(p.form)}</b> · <b>${moodText(p.morale)}</b></p>${reasons}</section>`;
  }else if(tab==='entw'){
    const hist=(p.hist||[]).map(h=>({y:h.y,o:h.o})).concat([{y:S.year,o}]);
    const pl=pM??o,mn=Math.min(...hist.map(h=>h.o),pl)-3,mx=Math.max(...hist.map(h=>h.o),pl)+3,X=i=>hist.length>1?20+i/(hist.length-1)*560:300,Y=v=>130-(v-mn)/(mx-mn)*110;
    const sg=Object.entries(p.sg||{}).sort((a,b)=>b[1]-a[1]).slice(0,6);
    const opts=['none',...keyAttrs(p.role),...DK.filter(x=>!keyAttrs(p.role).includes(x))];
    body=`<section class="panel s7"><div class="lab"><span>OVR-Verlauf</span><span>Potenzial ${pTxt}</span></div>
      <svg viewBox="0 0 600 150" style="width:100%;height:auto" role="img" aria-label="OVR-Verlauf">${pM!=null?`<line x1="0" x2="600" y1="${Y(pM)}" y2="${Y(pM)}" stroke="var(--brass)" stroke-dasharray="4 5" opacity=".7"/><text x="596" y="${Y(pM)-5}" text-anchor="end" font-size="11" fill="var(--brass)" font-family="IBM Plex Mono,monospace">POT</text>`:''}
       <polyline points="${hist.map((h,i)=>X(i)+','+Y(h.o)).join(' ')}" fill="none" stroke="var(--fg)" stroke-width="2"/>${hist.map((h,i)=>`<circle cx="${X(i)}" cy="${Y(h.o)}" r="4" fill="var(--bg)" stroke="var(--fg)" stroke-width="2"/><text x="${X(i)}" y="${Y(h.o)-10}" text-anchor="middle" font-size="12" fill="var(--fg)" font-family="IBM Plex Mono,monospace">${ex||an>=3?h.o:''}</text><text x="${X(i)}" y="146" text-anchor="middle" font-size="11" fill="var(--dim)" font-family="IBM Plex Mono,monospace">${h.y}</text>`).join('')}</svg>
      <p style="margin:8px 0 0;font-size:14px"><b>Einschätzung des Coaches:</b> <span class="muted">${coachView(p)}</span></p></section>
     <section class="panel s5">${mine?`<div class="lab"><span>Belastung</span><span>${Math.round(p.load||20)}/100</span></div>${bar(p.load||20,(p.load||0)>=70?'var(--bad)':(p.load||0)>=55?'var(--warn)':'var(--good)')}<p class="muted" style="font-size:12.5px;margin:6px 0 14px">${S.ment&&S.ment[p.id]&&S.players[S.ment[p.id]]?`Mentor: ${S.players[S.ment[p.id]].name}. `:''}${Object.entries(S.ment||{}).filter(([,m])=>m===p.id).map(([id])=>S.players[id]?S.players[id].name:'').filter(Boolean).length?`Betreut: ${Object.entries(S.ment||{}).filter(([,m])=>m===p.id).map(([id])=>S.players[id]?S.players[id].name:'').join(', ')}.`:''}</p>`:''}${mine?chemPlayerBox(p):''}<div class="lab">Fortschritt diese Saison</div>${mine?(sg.length?sg.map(([x,v])=>`<div class="stat"><span class="muted">${DN[x]}</span><span class="good">+${v.toFixed(1).replace('.',',')}</span></div>`).join(''):'<p class="empty">Noch keine messbaren Fortschritte.</p>'):'<p class="empty">Nur für eigene Spieler sichtbar.</p>'}
      ${youthBox(p,mine||an>=3)}
      ${p.o0!=null&&ex?`<div class="stat"><span>OVR seit Saisonstart</span><span class="${o-p.o0>0?'good':o-p.o0<0?'bad':''}">${o-p.o0>0?'+':''}${o-p.o0}</span></div>`:''}</section>
     ${mine&&!isLoanee(p)?`<section class="panel s12"><div class="lab"><span>Einzeltraining</span><span>Zusätzlicher Fokus neben dem Teamtraining</span></div>
      <div class="seg">${opts.map(x=>`<button class="${(p.ifoc||'none')===x?'on':''}" data-a="ifoc" data-id="${p.id}" data-v="${x}">${x==='none'?'Kein Fokus':DN[x]}${keyAttrs(p.role).includes(x)?' •':''}</button>`).join('')}</div>
      <p class="muted" style="font-size:13px;margin:10px 0 0">Mit • markierte Attribute zählen für ${RN[p.role]} am meisten. Einzeltraining gibt dem gewählten Attribut fast die Hälfte des Wochenfortschritts zusätzlich.</p></section>`:''}`;
  }else if(tab==='stat'){const M=sm(st),chs=Object.entries(st.ch||{}).sort((a,b)=>b[1][0]-a[1][0]);
    body=`<section class="panel s12"><div class="lab"><span>Saison ${S.year}</span><span>${T&&T.tier===2?'T2: nur Spiele und Siege':'alle Spiele inkl. international'}</span></div>
     <div class="kpis"><div><b>${M.g}</b><span>Spiele</span></div><div><b>${M.g?pct(M.wr):'-'}</b><span>Siegquote</span></div><div><b>${M.k}/${M.d}/${M.a}</b><span>K/D/A</span></div><div><b>${M.g?f1(M.kda,2):'-'}</b><span>KDA</span></div><div><b>${M.rt?f1(M.rt,2):'-'}</b><span>Ø Note</span></div></div>
     <div class="kpis" style="margin-top:8px"><div><b>${M.full?pct(M.kp):'-'}</b><span>Kill-Beteiligung</span></div><div><b>${M.full?f1(M.csm):'-'}</b><span>CS pro Minute</span></div><div><b>${M.full?Math.round(M.dpm):'-'}</b><span>Schaden/Min.</span></div><div><b>${M.mvp}</b><span>MVP</span></div><div><b>${st.min?Math.round(st.min/M.g)+"'":'-'}</b><span>Ø Spieldauer</span></div></div></section>
     <section class="panel s6"><div class="lab">Champions diese Saison</div>${chs.length?`<div class="scroll"><table class="tbl"><thead><tr><th>Champion</th><th class="r">Spiele</th><th class="r">Siege</th><th class="r">Meisterschaft</th></tr></thead><tbody>${chs.map(([c,[g,w]])=>`<tr><td>${CH[c][0]} <span class="tagc t-${CH[c][6]}">${CH[c][6]}</span></td><td class="r">${g}</td><td class="r">${pct(w/g)}</td><td class="r mono">${mastery(p,+c)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="empty">Noch keine Spiele.</p>'}</section>
     ${p.awards&&p.awards.length?`<section class="panel s12"><div class="lab">Auszeichnungen</div><div class="acts" style="gap:6px">${p.awards.map(a=>`<span class="chip" style="min-width:0;color:var(--brass2)">${a}</span>`).join('')}</div></section>`:''}
     <section class="panel s6"><div class="lab">Karriere</div>${p.hist&&p.hist.length?`<div class="scroll"><table class="tbl"><thead><tr><th>Jahr</th><th>Team</th><th class="r">OVR</th><th class="r">Spiele</th><th class="r">Siege</th><th class="r">KDA</th><th class="r">Note</th></tr></thead><tbody>${p.hist.slice().reverse().map(h=>{const m=sm(h);return `<tr><td>${h.y}</td><td>${h.t&&S.teams[h.t]?S.teams[h.t].id:'-'}</td><td class="r">${h.o}</td><td class="r">${m.g}</td><td class="r">${m.g?pct(m.wr):'-'}</td><td class="r">${m.g?f1(m.kda,2):'-'}</td><td class="r">${m.rt?f1(m.rt,2):'-'}</td></tr>`}).join('')}</tbody></table></div>`:'<p class="empty">Die Karriere-Tabelle füllt sich ab dem nächsten Saisonwechsel.</p>'}</section>`;
  }else{
    let acts='';
    const lb=canLoan(p)?`<button class="btn ghost" data-a="lendmenu" data-id="${p.id}">An T2-Team verleihen</button>`:'';
    if(isLoanee(p)){acts=`<button class="btn" data-a="lendback" data-id="${p.id}">Zurückholen</button>${p.contract<=2?`<button class="btn ghost" data-a="nego" data-t="renew" data-id="${p.id}">Vertrag verhandeln</button>`:''}`}
    else if(inAca){acts=`${lb}<button class="btn" data-a="promote" data-id="${p.id}">In den Profikader holen</button>${p.contract<=2?`<button class="btn ghost" data-a="nego" data-t="renew" data-id="${p.id}">Vertrag verhandeln</button>`:''}<button class="btn danger" data-a="release" data-id="${p.id}">Entlassen (${eurK(p.salary*8)})</button>`}
    else if(main){acts=`${!isStarter(p)?`<button class="btn" data-a="setstart" data-id="${p.id}">Als Starter setzen</button>`:''}<button class="btn ghost" data-a="demote" data-id="${p.id}">In die Academy schicken</button>${lb}
      ${p.contract<=2?`<button class="btn ghost" data-a="nego" data-t="renew" data-id="${p.id}">Vertrag verhandeln</button>`:''}
      <button class="btn ghost" data-a="list" data-id="${p.id}">${p.listed?'Von Transferliste nehmen':'Auf Transferliste'}</button>
      <button class="btn danger" data-a="release" data-id="${p.id}">Entlassen (${eurK(p.salary*8)})</button>`}
    else if(p.tried===wkKey())acts=`<p class="muted" style="margin:0">Diese Woche keine weiteren Gespräche möglich.</p>`;
    else if(!T)acts=`<button class="btn" data-a="nego" data-t="fa" data-id="${p.id}">Vertrag verhandeln</button>`;
    else acts=`<button class="btn" data-a="nego" data-t="buy" data-id="${p.id}">Transfer verhandeln</button>`;
    const b=S.fin.budget;
    body=`<section class="panel s7"><div class="lab">${mine?'Vertrag':'Verhandlung'}</div>
      <div class="stat"><span class="muted">Marktwert</span><span>${eur(val)}</span></div>
      <div class="stat"><span class="muted">${mine?'Gehalt':'Gehaltsforderung'}</span><span>${eur(mine?p.salary:demand)} / Woche</span></div>
      ${p.team?`<div class="stat"><span class="muted">Vertrag</span><span>${p.contract} ${p.contract===1?'Saison':'Saisons'}</span></div>`:''}
      ${mine&&p.wb?`<div class="stat"><span class="muted">Siegprämie</span><span>${eur(p.wb)} pro Serie</span></div>`:''}
      ${p.clause?`<div class="stat"><span class="muted">Ausstiegsklausel</span><span>${eur(p.clause)}</span></div>`:''}
      ${mine&&p.promise==='start'?`<div class="stat"><span class="muted">Versprechen</span><span style="font-family:var(--f-body)" class="${isStarter(p)?'good':'bad'}">Stammspieler${isStarter(p)?'':' (gebrochen)'}</span></div>`:''}
      ${p.sellon?`<div class="stat"><span class="muted">Weiterverkaufsanteil</span><span>${p.sellon.pct}% an ${S.teams[p.sellon.team]?S.teams[p.sellon.team].id:'-'}</span></div>`:''}
      ${PV.msg?`<div class="note ${PV.ok?'good':PV.ok===false?'bad':''}">${PV.msg}</div>`:''}
      <div class="acts" style="margin-top:14px">${acts}</div></section>
     <section class="panel s5"><div class="lab">Dein Budget</div>
      <div class="stat"><span class="muted">Transferbudget</span><span>${eur(b.transfer)}</span></div>
      <div class="stat"><span class="muted">Gehalt frei pro Woche</span><span class="${wageFree()<0?'bad':''}">${eur(wageFree())}</span></div>
      <p class="muted" style="font-size:13px;margin:10px 0 0">Ablösen gehen vom Transferbudget ab, Gehälter müssen ins Gehaltsbudget passen. Umschichten kannst du unter Verein > Finanzen.</p></section>`;
  }
  return `<div class="pagehead"><button class="btn ghost sm" data-a="pback">Zurück</button></div><div class="grid">${head}${tabs}${body}</div>`;
}

/* ===== Co-Trainer ===== */
function coachReport(U){
  const avgOf=(T,k)=>ROLES.reduce((s,r)=>s+S.players[T.starters[r]].a[k],0)/5;
  const lg=teamsOf(U.reg),lavg={};for(const k of ATTR)lavg[k]=lg.reduce((s,t)=>s+avgOf(t,k),0)/lg.length;
  const rows=ATTR.map(k=>[k,Math.round(avgOf(U,k)-lavg[k])]);
  const gaps=ROLES.map(r=>[r,ovr(S.players[U.starters[r]])-roleAvg(r,U.reg).ovr]).sort((a,b)=>a[1]-b[1]);
  const imp=U.roster.map(i=>S.players[i]).map(p=>[p,ovr(p)-(p.o0??ovr(p))]).sort((a,b)=>b[1]-a[1])[0];
  const tired=U.roster.map(i=>S.players[i]).filter(p=>p.form<55||p.morale<45);
  return `<section class="panel s12"><div class="lab"><span>Bericht des Co-Trainers</span><span>Vergleich mit dem Schnitt der ${U.reg}-Starter</span></div>
   <div class="grid"><div class="s6">${rows.map(([k,v])=>`<div class="stat"><span class="muted">${AN[k]}</span><span class="${v>=2?'good':v<=-2?'bad':''}">${v>0?'+':''}${v}</span></div>`).join('')}</div>
   <div class="s6"><ul class="reasons" style="margin:0">
    <li class="${gaps[0][1]<0?'bad':'good'}">Schwächste Position: <b style="color:var(--fg)">${RN[gaps[0][0]]}</b> (${gaps[0][1]>0?'+':''}${gaps[0][1]} zum Liga-Schnitt). ${gaps[0][1]<-2?'Hier lohnt sich ein Transfer.':''}</li>
    <li class="good">Stärkste Position: <b style="color:var(--fg)">${RN[gaps[4][0]]}</b> (${gaps[4][1]>0?'+':''}${gaps[4][1]}).</li>
    ${imp&&imp[1]>0?`<li class="good">Größter Fortschritt: ${imp[0].name} (+${imp[1]} OVR diese Saison).</li>`:''}
    ${tired.length?`<li class="warn">Formtief oder Unruhe: ${tired.map(p=>p.name).join(', ')}. Eine Erholungswoche hilft.</li>`:'<li class="good">Keine Spieler mit Formtief oder schlechter Stimmung.</li>'}
   </ul></div></div></section>`;
}

function teamModal(){
  const T=S.teams[MODAL.team];if(!T)return'';const mine=T.id===S.user,an=S.staff.analyst;
  const ps=T.roster.map(i=>S.players[i]).sort((a,b)=>(isStarter(b)-isStarter(a))||ROLES.indexOf(a.role)-ROLES.indexOf(b.role));
  const sp=currentSplit(),row=sp&&sp.reg[T.reg]?tableOf(sp.reg[T.reg].ids,sp.reg[T.reg].res).findIndex(x=>x.id===T.id)+1:0;
  return `<div class="ov" data-a="close"><div class="sheet wide" role="dialog" aria-modal="true" aria-label="${T.name}">
  <div style="display:flex;gap:12px;align-items:center">${crest(T,'lg')}<div style="min-width:0"><h2>${T.name}</h2><p class="muted" style="margin:2px 0 0">${T.reg} · Ruf ${T.rep}${row?` · Platz ${row} im ${sp.name}`:''}</p></div></div>
  <div style="margin-top:14px">
   <div class="stat"><span class="muted">Team-OVR</span><span>${mine||an>=3?teamOvr(T):'~'+Math.round(teamOvr(T)/5)*5}</span></div>
   <div class="stat"><span class="muted">Spielstil</span><span style="font-family:var(--f-body)">${mine||an>=2?STYLES[T.style].n:'Analyst Level 2 nötig'}</span></div>
   <div class="stat"><span class="muted">Jungle-Fokus</span><span style="font-family:var(--f-body)">${mine||an>=3?FOCUS[T.focus]:'Analyst Level 3 nötig'}</span></div></div>
  <div class="lab" style="margin-top:16px">Kader</div><div class="rows">${ps.map(p=>playerRow(p,!mine)).join('')}</div>
  <div class="acts" style="margin-top:16px"><button class="btn ghost" data-a="close">Schließen</button></div></div></div>`;
}
