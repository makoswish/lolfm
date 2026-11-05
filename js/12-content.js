/* ===== Match-Historie ===== */
let MHV=null,MHS='ALL';
function mhGame(z){const pl=[0,1].map(i=>z.st[i].map(id=>{const p=S.players[id],x=z.ps[id];return{id,n:p.name,r:p.role,k:x.k,d:x.d,a:x.a,cs:x.cs,dmg:x.dmg,rt:z.rt[id],c:z.dr[i].picks[p.role]}}));
  return{w:z.winner,end:z.end,k:[...z.kills],tw:[...z.s.tw],dr:[...z.s.dr],bn:[...z.s.bn],first:Object.assign({},z.first),bans:[z.dr[0].bans||[],z.dr[1].bans||[]],pl,mvp:z.mvp,
    g:z.tl.filter((x,i)=>i%2===0||i===z.tl.length-1).map(x=>x.G),ev:z.ev.filter(e=>e.big).slice(-14).map(e=>[e.t,e.side,e.text]),tags:[compTag(z.dr[0].picks)||'Gemischt',compTag(z.dr[1].picks)||'Gemischt']}}
function mhRecord(z){const s=LIVE.series;S.mhist=S.mhist||[];let r=s.mhId&&S.mhist.find(x=>x.id===s.mhId);
  if(!r){r={id:'mh'+(S.nextId++),label:s.m.label,a:s.a,b:s.b,year:S.year,bo:s.bo,games:[],score:[0,0],w:null};S.mhist.unshift(r);s.mhId=r.id}
  r.games.push(mhGame(z));r.score=[...s.wins];
  let n=0;for(const x of S.mhist){n+=x.games.length;if(n>140){S.mhist.length=S.mhist.indexOf(x);break}}}
function mhDone(){const s=LIVE.series,r=s.mhId&&(S.mhist||[]).find(x=>x.id===s.mhId);if(r){r.w=s.m.w;r.score=[...s.wins]}}
function mhList(){const L=(S.mhist||[]).filter(r=>MHS==='ALL'||r.year===+MHS),yrs=[...new Set((S.mhist||[]).map(r=>r.year))];
  const tot=L.reduce((a,r)=>{if(!r.w)return a;const won=isMyT(r.w);a[won?0:1]++;return a},[0,0]);
  return `<section class="panel s12"><div class="lab"><span>Match-Historie</span><span>${tot[0]} Siege · ${tot[1]} Niederlagen</span></div>
   <div class="seg" style="margin-bottom:10px">${['ALL',...yrs].map(y=>`<button class="${String(MHS)===String(y)?'on':''}" data-a="mhs" data-v="${y}">${y==='ALL'?'Alle':'Saison '+y}</button>`).join('')}</div>
   ${L.length?L.map(r=>{const me=r.a===S.user?0:1,opp=S.teams[me===0?r.b:r.a],won=r.w&&isMyT(r.w),last=r.games[r.games.length-1],mvp=last&&S.players[last.mvp];
    return `<button class="row mhrow" data-a="mhopen" data-id="${r.id}"><span>${r.w?`<span class="wl ${won?'w':'l'}">${won?'S':'N'}</span>`:'<span class="wl">…</span>'}</span>
     <span style="min-width:0;display:flex;gap:10px;align-items:center">${crest(opp,'sm')}<span style="min-width:0"><div class="nm">vs ${opp.name} <span class="mono" style="font-weight:500">${r.score[me]}:${r.score[1-me]}</span></div><div class="sub">${r.label} · ${r.year} · Bo${r.bo}</div></span></span>
     <span class="rt"><span class="kv hide-s">Kills<b>${r.games.reduce((a,g)=>a+g.k[me],0)}:${r.games.reduce((a,g)=>a+g.k[1-me],0)}</b></span><span class="kv">MVP<b style="font-family:var(--f-body)">${mvp?mvp.name:'-'}</b></span></span></button>`}).join(''):'<p class="empty">Noch keine Spiele gespeichert. Ab jetzt landet jedes Spiel deines Teams hier.</p>'}</section>`}
function mhView(){const r=(S.mhist||[]).find(x=>x.id===MHV.id);if(!r){S.view='league';return leagueView()}
  const gi=Math.min(MHV.gi||0,r.games.length-1),g=r.games[gi],A=S.teams[r.a],B=S.teams[r.b],me=r.a===S.user?0:1;
  const span=Math.max(30,g.end),pts=g.g.map((v,i)=>[Math.min(g.end,i*2)/span*600,70-clamp(v/14000,-1,1)*62]),path=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const tbl=side=>{const td=g.pl[side].reduce((a,x)=>a+x.dmg,0)||1;return `<div class="scroll"><table class="tbl ptb"><thead><tr><th></th><th>${[A,B][side].id}</th><th class="r">K/D/A</th><th class="r">CS</th><th class="r hide-s">Schaden</th><th class="r">Note</th></tr></thead><tbody>
    ${g.pl[side].map(x=>`<tr class="${x.id===g.mvp?'me':''}"><td><span class="chip">${x.r}</span></td><td class="nmcell">${S.players[x.id]?`<button class="linkbtn" data-a="player" data-id="${x.id}">${x.n}</button>`:x.n}<div class="dim" style="font-size:11.5px;font-weight:500">${x.c!=null?CH[x.c][0]:'-'}</div></td><td class="r mono">${x.k}/${x.d}/${x.a}</td><td class="r mono">${x.cs}</td><td class="r mono hide-s">${Math.round(x.dmg/td*100)}%</td><td class="r"><span class="av ${x.rt>=8?'a5':x.rt>=7?'a4':x.rt>=6?'a3':'a1'}">${f1(x.rt)}</span></td></tr>`).join('')}</tbody></table></div>`};
  const fx=k=>g.first[k]==null?'-':[A,B][g.first[k]].id;
  return `<div class="pagehead"><button class="btn ghost sm" data-a="mhback">Zur Historie</button></div>
  <div class="board"><div class="side-t">${crest(A)}<div style="min-width:0"><b>${A.name}</b><small>Blau · ${g.tags[0]}</small></div></div>
   <div><div class="kills"><span class="b">${r.score[0]}</span><span class="dim" style="font-size:.5em">:</span><span class="r">${r.score[1]}</span></div><div class="clock">${r.label} · ${r.year}</div></div>
   <div class="side-t r">${crest(B)}<div style="min-width:0"><b>${B.name}</b><small>Rot · ${g.tags[1]}</small></div></div></div>
  ${r.games.length>1?`<div class="seg" style="margin:14px 0 0">${r.games.map((x,i)=>`<button class="${i===gi?'on':''}" data-a="mhgame" data-v="${i}">Spiel ${i+1} · ${[A,B][x.w].id}</button>`).join('')}</div>`:''}
  <div class="grid" style="margin-top:14px">
   <section class="panel s7"><div class="lab"><span>Goldverlauf · Spiel ${gi+1}</span><span>${[A,B][g.w].name} gewinnt nach ${g.end} Min.</span></div>
    <svg viewBox="0 0 600 140" style="width:100%;height:auto;display:block" role="img" aria-label="Goldverlauf"><line x1="0" x2="600" y1="70" y2="70" stroke="var(--line)"/>${[10,20,30,40,50].filter(m=>m<span).map(m=>`<line x1="${m/span*600}" x2="${m/span*600}" y1="4" y2="136" stroke="var(--line)" stroke-dasharray="2 5"/><text x="${m/span*600+4}" y="134" fill="var(--dim)" font-size="11" font-family="IBM Plex Mono,monospace">${m}'</text>`).join('')}
     <path d="${path} L${pts[pts.length-1][0].toFixed(1)} 70 L0 70 Z" fill="url(#gg2)"/><defs><linearGradient id="gg2" x1="0" y1="0" x2="0" y2="140" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="var(--blue)" stop-opacity=".45"/><stop offset=".5" stop-color="var(--blue)" stop-opacity=".05"/><stop offset=".5" stop-color="var(--red)" stop-opacity=".05"/><stop offset="1" stop-color="var(--red)" stop-opacity=".45"/></linearGradient></defs><path d="${path}" fill="none" stroke="var(--fg)" stroke-width="2"/></svg>
    <div class="objs"><div>${g.k[0]}</div><div>Kills</div><div>${g.k[1]}</div><div>${g.tw[0]}</div><div>Türme</div><div>${g.tw[1]}</div><div>${g.dr[0]}</div><div>Drachen</div><div>${g.dr[1]}</div><div>${g.bn[0]}</div><div>Baron</div><div>${g.bn[1]}</div></div></section>
   <section class="panel s5"><div class="lab">Spielfakten</div>
    <div class="stat"><span class="muted">First Blood</span><span>${fx('fb')}</span></div><div class="stat"><span class="muted">Erster Turm</span><span>${fx('tw')}</span></div><div class="stat"><span class="muted">Erster Drache</span><span>${fx('dr')}</span></div>
    <div class="stat"><span class="muted">Spieler des Spiels</span><span style="font-family:var(--f-body)">${(g.pl[0].concat(g.pl[1]).find(x=>x.id===g.mvp)||{}).n||'-'}</span></div>
    <div class="lab" style="margin-top:14px">Bans</div>${[0,1].map(i=>`<div class="stat"><span class="muted">${[A,B][i].id}</span><span style="font-family:var(--f-body);text-align:right">${g.bans[i].map(c=>CH[c][0]).join(', ')||'-'}</span></div>`).join('')}</section>
   <section class="panel s6"><div class="lab">${A.name}</div>${tbl(0)}</section><section class="panel s6"><div class="lab">${B.name}</div>${tbl(1)}</section>
   <section class="panel s12"><div class="lab">Schlüsselmomente</div><div class="feed">${g.ev.slice().reverse().map(([t,sd,tx])=>`<div class="ev big"><span class="tm">${String(t).padStart(2,'0')}'</span><span class="dot" style="background:${sd===0?'var(--blue)':'var(--red)'}"></span><span>${tx}</span></div>`).join('')}</div></section></div>`}

/* ===== News ===== */
function news(t,cat){S.news=S.news||[];S.news.unshift({t,cat:cat||'liga',when:shortLabel()});if(S.news.length>40)S.news.length=40}
function newsWeek(list){if(!list)return;for(const m of list){if(!m.w||meIn(m))continue;const W=S.teams[m.w],L=S.teams[m.w===m.a?m.b:m.a];if(!W||!L||W.tier===2)continue;
  if(teamOvr(L)-teamOvr(W)>=6&&R()<.6)news(`Überraschung: ${W.name} schlägt ${L.name}${m.bo>1?` ${Math.max(...m.score)}:${Math.min(...m.score)}`:''}.`,'upset')}
  const sp=S.ev&&S.ev.type==='split'?S.ev:null;if(sp&&sp.stage==='rr'&&R()<.4){const r=pick(REGS),st=tableOf(sp.reg[r].ids,sp.reg[r].res);const lead=st[0];if(lead&&lead.form.length>=4&&lead.form.slice(-4).every(Boolean))news(`${S.teams[lead.id].name} führt die ${r} mit ${lead.w}-${lead.l} an und hat vier Spiele in Folge gewonnen.`,'liga')}}
function newsPanel(){const L=(S.news||[]).slice(0,6);return `<section class="panel s5"><div class="lab"><span>Esports-News</span><button class="linkbtn" data-a="nav2" data-v="news" style="font-size:12px">alle</button></div>${L.length?L.map(n=>`<div class="news"><span class="w">${n.when}</span><span>${n.t}</span></div>`).join(''):'<p class="empty">Noch keine Meldungen.</p>'}</section>`}

/* ===== Auszeichnungen ===== */
function avgRt(p){const s=p.st;return s&&s.rn?s.rs/s.rn:0}
function seasonAwards(){S.awards=S.awards||{};const res={};
  for(const r of REGS){const ps=Object.values(S.players).filter(p=>p.team&&S.teams[p.team]&&S.teams[p.team].reg===r&&S.teams[p.team].tier!==2&&p.st&&p.st.rn);
    const maxG=Math.max(1,...ps.map(p=>p.st.g)),ok=ps.filter(p=>p.st.g>=maxG*.5),best=a=>a.slice().sort((x,y)=>avgRt(y)-avgRt(x))[0];
    const allpro={};for(const ro of ROLES){const b=best(ok.filter(p=>p.role===ro));if(b)allpro[ro]=b.id}
    const mvp=best(ok),rookie=best(ok.filter(p=>p.age<=19));res[r]={mvp:mvp&&mvp.id,rookie:rookie&&rookie.id,allpro};
    const give=(p,t)=>{if(!p)return;(p.awards=p.awards||[]).push(`${t} ${r} ${S.year}`);if(isMine(p)){p.morale=clamp(p.morale+8,20,100);mail(`Auszeichnung: ${p.name}`,`${p.name} ist ${t} der ${r} ${S.year}.`)}};
    give(mvp,'MVP');give(rookie,'Rookie des Jahres');for(const ro in allpro)give(S.players[allpro[ro]],'All-Pro');
    if(mvp)news(`${mvp.name} (${S.teams[mvp.team].name}) ist MVP der ${r} ${S.year}.`,'award')}
  S.awards[S.year]=res}
function awardsView(reg){const yrs=Object.keys(S.awards||{}).sort((a,b)=>b-a),aw=yrs.length?S.awards[yrs[0]][reg]:null;
  const ps=Object.values(S.players).filter(p=>p.team&&S.teams[p.team]&&S.teams[p.team].reg===reg&&S.teams[p.team].tier!==2&&p.st&&p.st.rn),maxG=Math.max(1,...ps.map(p=>p.st.g)),race=ps.filter(p=>p.st.g>=maxG*.5).sort((a,b)=>avgRt(b)-avgRt(a)).slice(0,5);
  const pr=id=>{const p=S.players[id];return p?`<button class="lbrow" data-a="player" data-id="${p.id}"><span class="pos">${p.role}</span>${avatar(p,'sm')}<span class="nmcell">${p.name}<small class="dim"> ${p.team&&S.teams[p.team]?S.teams[p.team].id:''}</small></span><b class="mono">${f1(avgRt(p),2)}</b></button>`:''};
  return `<section class="panel s6"><div class="lab"><span>MVP-Rennen ${S.year}</span><span>Ø Note, ab 50% der Spiele</span></div>${race.map((p,i)=>`<button class="lbrow" data-a="player" data-id="${p.id}"><span class="pos">${i+1}</span>${avatar(p,'sm')}<span class="nmcell">${p.name}<small class="dim"> ${p.role} · ${S.teams[p.team].id}</small></span><b class="mono">${f1(avgRt(p),2)}</b></button>`).join('')||'<p class="empty">Noch zu wenige Spiele.</p>'}</section>
   <section class="panel s6"><div class="lab"><span>Auszeichnungen ${reg}</span><span>${yrs.length?'Saison '+yrs[0]:'nach der ersten Saison'}</span></div>${aw?`<div class="stat"><span class="muted">MVP</span><span style="font-family:var(--f-body)">${aw.mvp&&S.players[aw.mvp]?S.players[aw.mvp].name:'-'}</span></div><div class="stat"><span class="muted">Rookie des Jahres</span><span style="font-family:var(--f-body)">${aw.rookie&&S.players[aw.rookie]?S.players[aw.rookie].name:'-'}</span></div><div class="lab" style="margin-top:12px">All-Pro-Team</div>${ROLES.map(r=>pr(aw.allpro[r])).join('')}`:'<p class="empty">Die ersten Auszeichnungen gibt es am Saisonende.</p>'}</section>
   ${achView()}`}

/* ===== Erfolge ===== */
const ACH=[['firstwin','Erster Sieg','Gewinne deine erste Serie.'],['streak5','Lauf','Gewinne fünf Serien in Folge.'],['streak10','Unaufhaltsam','Gewinne zehn Serien in Folge.'],['split','Regionaler Meister','Gewinne einen Split.'],['intl','Internationaler Titel','Gewinne First Stand, MSI oder den Demacia Cup.'],['worlds','Weltmeister','Gewinne Worlds.'],['million','Millionär','Habe 1 Mio. € auf dem Konto.'],['bigsale','Großverkauf','Verkaufe einen Spieler für mindestens 500k €.'],['academy','Eigengewächs','Ein Academy-Spieler wird Starter mit OVR 75+.'],['mvp','Bester der Liga','Einer deiner Spieler wird MVP.'],['fans','Fanliebling','Erreiche 300.000 Fans.'],['allin','Komplett','Belege alle sieben Sponsorplätze.']];
function ach(k){S.ach=S.ach||{};if(S.ach[k])return;S.ach[k]=S.year;const a=ACH.find(x=>x[0]===k);mail(`Erfolg freigeschaltet: ${a[1]}`,a[2]);news(`${S.teams[S.user].name} schaltet den Erfolg "${a[1]}" frei.`,'ach')}
function achCheck(){const f=S.fin,U=S.teams[S.user];if(f.balance>=1e6)ach('million');if(f.fans>=300000)ach('fans');if(SLOTS.every(([k])=>f.slots[k]))ach('allin');
  for(const r of ROLES){const p=S.players[U.starters[r]];if(p&&p.fromAca&&ovr(p)>=75)ach('academy')}
  for(const t of S.trophies)if(t.year===S.year){if(/Split/.test(t.name))ach('split');if(t.name==='Worlds')ach('worlds');else if(/First Stand|MSI|Demacia/.test(t.name))ach('intl')}
  if(S.awards&&S.awards[S.year]){const a=S.awards[S.year][U.reg];if(a&&a.mvp&&isMine(S.players[a.mvp]))ach('mvp')}}
function achView(){S.ach=S.ach||{};const n=Object.keys(S.ach).length;return `<section class="panel s12"><div class="lab"><span>Deine Erfolge</span><span>${n}/${ACH.length}</span></div><div class="achs">${ACH.map(([k,t,d])=>`<div class="achv ${S.ach[k]?'on':''}"><b>${t}</b><span>${d}</span>${S.ach[k]?`<small>${S.ach[k]}</small>`:''}</div>`).join('')}</div></section>`}

/* ===== Spieler-Ereignisse ===== */
const PEV={
  wish:{t:p=>`${p.name} will den nächsten Schritt machen`,b:p=>`${p.name} fühlt sich zu gut für das aktuelle Niveau und spielt mit dem Gedanken an einen Wechsel.`,o:[['Titel versprechen',p=>{p.morale=clamp(p.morale+6,20,100);p.titleProm=S.year;return 'Er bleibt motiviert. Gibt es diese Saison keinen Titel, ist er enttäuscht.'}],['Auf die Transferliste',p=>{p.listed=true;p.morale=clamp(p.morale+2,20,100);return 'Er steht jetzt auf der Transferliste.'}],['Ablehnen',p=>{p.morale=clamp(p.morale-10,20,100);return 'Er ist verärgert.'}]]},
  conflict:{t:(p,q)=>`Streit zwischen ${p.name} und ${q.name}`,b:(p,q)=>`Nach einer Niederlage geraten ${p.name} und ${q.name} im Voice-Chat aneinander. Das Team ist angespannt.`,o:[['Schlichten',(p,q)=>{p.morale=clamp(p.morale+3,20,100);q.morale=clamp(q.morale+3,20,100);return 'Die Stimmung beruhigt sich.'}],['Für den ersten Partei ergreifen',(p,q)=>{p.morale=clamp(p.morale+6,20,100);q.morale=clamp(q.morale-10,20,100);return `${p.name} fühlt sich bestätigt, ${q.name} ist sauer.`}],['Ignorieren',(p,q)=>{p.morale=clamp(p.morale-4,20,100);q.morale=clamp(q.morale-4,20,100);return 'Der Konflikt schwelt weiter.'}]]},
  night:{t:p=>`${p.name} streamt bis tief in die Nacht`,b:p=>`${p.name} ist nachts stundenlang live. Die Fans lieben es, aber im Training wirkt er müde.`,o:[['Ermahnen',p=>{p.morale=clamp(p.morale-3,20,100);p.form=clamp(p.form+4,30,100);return 'Er geht früher schlafen, ist aber etwas gekränkt.'}],['Laufen lassen',p=>{p.morale=clamp(p.morale+2,20,100);p.form=clamp(p.form-5,30,100);S.fin.fans=Math.round(S.fin.fans*1.006);return 'Ein paar neue Fans, aber weniger Form.'}]]},
  wrist:{t:p=>`${p.name} klagt über Handgelenkschmerzen`,b:p=>`Nach langen Trainingstagen hat ${p.name} Schmerzen im Handgelenk.`,o:[['Pause verordnen',p=>{p.load=Math.max(0,(p.load||30)-35);p.form=clamp(p.form-5,30,100);return 'Er schont sich. Die Belastung sinkt deutlich.'}],['Weiterspielen',p=>{if(R()<.3){p.d.mec=clamp(p.d.mec-.6,1,20);p.d.rea=clamp(p.d.rea-.4,1,20);derive(p);return 'Die Schmerzen werden schlimmer. Mechanik und Reaktion leiden dauerhaft etwas.'}return 'Es geht gut. Glück gehabt.'}]]},
  camp:{t:()=>`Angebot: Bootcamp in Seoul`,b:()=>`Ein Partner bietet ein einwöchiges Bootcamp in Korea an. Kosten: 40k €.`,o:[['Annehmen',()=>{book('Bootcamp',-40000);S.campBoost=S.step+2;for(const id of S.teams[S.user].roster){const p=S.players[id];p.morale=clamp(p.morale+3,20,100)}return 'Das Team trainiert zwei Wochen mit 30% mehr Fortschritt.'}],['Ablehnen',()=>'Kein Bootcamp diesmal.']]},
  meet:{t:()=>`Fan-Meetup möglich`,b:()=>`Ein Veranstalter bietet ein Fan-Meetup an. Kosten: 10k €.`,o:[['Organisieren',()=>{book('Fan-Events',-10000);S.fin.fans=Math.round(S.fin.fans*1.02);for(const id of S.teams[S.user].roster){const p=S.players[id];p.morale=clamp(p.morale+2,20,100)}return '+2% Fans, die Spieler genießen es.'}],['Absagen',()=>'Kein Meetup.']]}};
function pevWeek(){if(R()>.09||S.inbox.some(m=>m.type==='pev'&&!m.done))return;const U=S.teams[S.user],ps=U.roster.map(i=>S.players[i]);
  const opts=[];const amb=ps.filter(p=>p.h.amb>=14&&ovr(p)>=U.rep-2);if(amb.length)opts.push(['wish',pick(amb)]);if(ps.length>=2){const a=shuffle(ps.slice());opts.push(['conflict',a[0],a[1]])}
  opts.push(['night',pick(ps)]);const hl=ps.filter(p=>(p.load||0)>=55);if(hl.length)opts.push(['wrist',pick(hl)]);if(S.fin.balance>80000)opts.push(['camp']);if(S.fin.balance>20000)opts.push(['meet']);
  const[k,p,q]=pick(opts),E=PEV[k];mail(E.t(p,q),E.b(p,q),{type:'pev',k,pid:p&&p.id,qid:q&&q.id,done:false,exp:S.step+3})}
function pevAnswer(m,i){const E=PEV[m.k],p=m.pid&&S.players[m.pid],q=m.qid&&S.players[m.qid];if((m.pid&&!p)||(m.qid&&!q)){m.done=true;m.result='Nicht mehr aktuell';return}
  m.result=`${E.o[i][0]}: ${E.o[i][1](p,q)}`;m.done=true}
