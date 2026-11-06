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

/* ===== Karriere: Entlassung und Jobangebote =====
   Zum Saisonende prüft der Vorstand. Unter 25% Vertrauen wirst du entlassen und musst einen kleineren Verein übernehmen.
   Bei Erfolg kommen Angebote von größeren Vereinen, auch aus anderen Regionen. Gewechselt wird nur in der Saisonpause. */
const SACK_AT=25;
function jobCands(up){const U=S.teams[S.user];return Object.values(S.teams).filter(t=>t.tier!==2&&!t.academy&&t.id!==S.user&&(up?t.rep>=U.rep+3&&t.rep<=U.rep+16:t.rep<=U.rep-3&&t.rep>=U.rep-22))}
function genJobs(up){const L=jobCands(up),U=S.teams[S.user];if(!L.length)return[];
  const w=t=>(t.reg===U.reg?3:1)*(up?1:1);const pool=L.slice(),out=[];
  for(let i=0;i<(up?2:3)&&pool.length;i++){const tot=pool.reduce((a,t)=>a+w(t),0);let x=R()*tot,k=0;for(;k<pool.length-1;k++){x-=w(pool[k]);if(x<=0)break}out.push(pool.splice(k,1)[0].id)}return out}
function careerSeason(){const s=S.summary;if(!s)return;S.career=S.career||[];S.career.unshift({year:S.year,team:S.user,place:s.place,exp:s.exp,board:Math.round(S.board),titles:S.trophies.filter(t=>t.year===S.year).length});
  S.jobs=null;
  if(S.board<SACK_AT){const L=genJobs(false);S.jobless=true;S.jobs={list:L.length?L:genJobs(true),sacked:true};
    mail('Der Vorstand trennt sich von dir',`Das Vertrauen liegt bei ${Math.round(S.board)}%. Die Bilanz: ${(S.goals&&S.goals.final||[]).map(x=>`${x.txt} ${x.st}`).join(', ')}. Damit ist Schluss bei ${S.teams[S.user].name}. Es liegen ${S.jobs.list.length} Angebote vor. Du musst eins annehmen, bevor die neue Saison startet.`,{type:'job'});news(`${S.teams[S.user].name} trennt sich von ${S.manager}.`,'liga');return}
  const good=s.place<=Math.max(1,s.exp-1)||S.trophies.some(t=>t.year===S.year);
  if(good&&R()<.75){const L=genJobs(true);if(L.length){S.jobs={list:L,sacked:false};mail('Jobangebote',`${L.map(id=>S.teams[id].name).join(' und ')} ${L.length>1?'wollen':'will'} dich als Manager. Die Angebote gelten bis zum Start der neuen Saison.`,{type:'job'})}}}
function switchTeam(tid){const T=S.teams[tid];if(!T||T.tier===2||T.academy||tid===S.user||LIVE)return 'Wechsel nicht möglich.';if(S.phase!=='offseason')return 'Gewechselt wird nur in der Saisonpause.';
  const old=S.teams[S.user],oldA=aca();loansReturn();
  if(oldA){for(const id of [...oldA.roster])toFA(S.players[id]);delete S.teams[oldA.id]}
  old.tac=null;S.user=tid;S.jobless=false;S.jobs=null;
  S.fin=newFin((T.rep-40)*20000,T.rep*2000);S.fin.lshare=1;S.fin.ibase=null;infraInit();genOffers();setBudgets();
  S.staffs=null;S.staff={coach:1,analyst:1};initStaff();newStaffPool();syncStaff();S.scouts=null;initScouting();S.trials=[];S.ment={};
  S.tacs=['A','B','C'].map(n=>defTac(T,n));S.tacs[1].style='SCL';S.tacs[2].style='AGG';S.tacA=0;applyTac();initKnow();
  S.board=mgrBoard();S.capt=null;S.scrim=null;VIEWREG=T.reg;KTAB='depth';S.goals=null;
  /* T2-Ligen ausgleichen: die neue Academy braucht in ihrer Region einen Platz */
  const t2n=t2Of(T.reg).filter(t=>!t.academy);if(t2n.length>=8){const w=t2n.sort((a,b)=>teamOvr(a)-teamOvr(b))[0];for(const id of [...w.roster])toFA(S.players[id]);delete S.teams[w.id]}
  for(const r of REGS){const n=t2Of(r).length+(r===T.reg?1:0);if(n<8){const used=new Set(Object.keys(S.teams));const L='ABCDEFGH'.split('').find(x=>!used.has(REGC[r]+'2'+x));if(L)mkT2Team(REGC[r]+'2'+L,`${pick(T2CITY[r])} ${pick(T2SUF)}`,r,clamp(46+REG[r].off+ri(-2,2),36,58),`hsl(${ri(0,359)} 30% 62%)`)}}
  mkT2Team(acaId(),T.name+' Academy',T.reg,clamp(T.rep-30,38,56),T.color,true);t2Init();
  mail(`Neuer Job: ${T.name}`,`Du übernimmst ${T.name} (${T.reg}, Ruf ${T.rep}, ${prestigeOf(T)}). Das Vorstandsziel für die neue Saison: Platz ${expected(tid)}. Trainerstab, Scouts und Finanzen gehören zum Verein, deine Taktik-Ideen musst du dem Team erst beibringen.`);
  news(`${T.name} holt ${S.manager} als neuen Manager.`,'transfer');S.view='home';return null}
function jobsView(){const J=S.jobs;if(!J||!J.list.length)return `<div class="pagehead"><div><h1>Jobangebote</h1><p>Aktuell keine Angebote.</p></div></div>`;
  return `<div class="pagehead"><div><h1>${J.sacked?'Entlassen':'Jobangebote'}</h1><p>${J.sacked?'Du musst einen dieser Vereine übernehmen, bevor die neue Saison startet.':'Du kannst bleiben oder zu einem dieser Vereine wechseln. Die Angebote gelten bis zum Saisonstart.'}</p></div></div>
  <div class="grid">${J.list.map(id=>{const T=S.teams[id];if(!T)return'';const exp=expected(id);return `<section class="panel s4"><div class="lab"><span>${T.name}</span><span>${T.reg}</span></div>
   <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">${crest(T,'lg')}<div><b style="font-size:18px">${prestigeOf(T)}</b><div class="muted" style="font-size:13px">Ruf ${T.rep} · Team-OVR ${teamOvr(T)}</div></div></div>
   <div class="stat"><span class="muted">Philosophie</span><span>${PHIL[philOf(T)][0]}</span></div><div class="stat"><span class="muted">Budget zum Start</span><span>${eurK((T.rep-40)*20000)}</span></div><div class="stat"><span class="muted">Vorstandsziel</span><span>Platz ${exp}</span></div>
   <div class="stat"><span class="muted">Trainingszentrum</span><span>${iWord(iFrac('tc',aiInfra(T,'tc')))}</span></div>
   <div class="acts" style="margin-top:12px"><button class="btn sm" data-a="jobtake" data-v="${id}">Übernehmen</button></div></section>`}).join('')}
  ${J.sacked?'':`<section class="panel s12"><div class="acts"><button class="btn ghost sm" data-a="jobstay">Bei ${S.teams[S.user].name} bleiben</button></div></section>`}</div>`}
function careerPanel(){const C=S.career||[];if(!C.length)return'';return `<section class="panel s12"><div class="lab"><span>Karriere von ${S.manager}</span><span>${C.length} ${C.length===1?'Saison':'Saisons'}</span></div><div class="scroll"><table class="tbl"><thead><tr><th>Jahr</th><th>Verein</th><th class="r">Platz</th><th class="r">Ziel</th><th class="r">Titel</th><th class="r">Vorstand</th></tr></thead><tbody>
  ${C.map(c=>`<tr><td>${c.year}</td><td>${S.teams[c.team]?S.teams[c.team].name:c.team}</td><td class="r">${c.place}</td><td class="r">${c.exp}</td><td class="r">${c.titles||'-'}</td><td class="r">${c.board}%</td></tr>`).join('')}</tbody></table></div></section>`}

/* ===== Rivalitäten =====
   Wichtige Serien gegen denselben Gegner bauen eine Rivalität auf: Playoffs und internationale Spiele zählen doppelt, enge Serien mehr.
   Gegen Rivalen zählen Siege und Niederlagen mehr für Fans und Vorstand. */
const RIVL=[[12,'Erzrivale'],[6,'Rivale']];
function rivOf(tid){const r=(S.riv||{})[tid];return r||{p:0,w:0,l:0}}
function rivLbl(tid){const p=rivOf(tid).p;const x=RIVL.find(x=>p>=x[0]);return x?x[1]:null}
function rivRecord(m){if(!m||(m.a!==S.user&&m.b!==S.user))return;S.riv=S.riv||{};const o=m.a===S.user?m.b:m.a,O=S.teams[o];if(!O||O.tier===2)return;
  const r=S.riv[o]||(S.riv[o]={p:0,w:0,l:0}),won=m.w===S.user,before=rivLbl(o),close=Math.abs(m.score[0]-m.score[1])<=1&&m.bo>1;
  r.p+=(m.big?2:.5)+(close?1:0)+(O.rep>=S.teams[S.user].rep-5?.5:0);won?r.w++:r.l++;
  const lb=rivLbl(o);if(lb){const k=lb==='Erzrivale'?2:1;S.board=clamp(S.board+(won?1.5:-1.5)*k,0,100);S.fin.fans=Math.round(S.fin.fans*(1+(won?.008:-.004)*k))}
  if(lb&&lb!==before){mail(`${lb}: ${O.name}`,`Die Duelle mit ${O.name} haben Geschichte: ${r.w} Siege, ${r.l} Niederlagen. Ab jetzt zählen Spiele gegen sie mehr für Fans und Vorstand.`);news(`${S.teams[S.user].name} gegen ${O.name}: eine neue Rivalität.`,'liga')}}
/* Rivalitäten verblassen langsam */
function rivSeason(){for(const k in S.riv||{})S.riv[k].p=Math.max(0,S.riv[k].p*.7)}
function rivPanel(){const L=Object.entries(S.riv||{}).filter(([id,r])=>S.teams[id]&&r.p>=3).sort((a,b)=>b[1].p-a[1].p).slice(0,5);if(!L.length)return'';
  return `<section class="panel s5"><div class="lab"><span>Rivalen</span><span>Bilanz in Serien</span></div>${L.map(([id,r])=>`<div class="stat"><span class="rl">${crest(S.teams[id],'sm')} ${S.teams[id].name} ${rivLbl(id)?`<span class="warn" style="font-size:12px">${rivLbl(id)}</span>`:''}</span><span>${r.w}-${r.l}</span></div>`).join('')}</section>`}

/* ===== Saisonvorschau der Presse =====
   Vor jedem Split tippt die Presse die Tabelle: Kaderstärke plus etwas Ruf und Bauchgefühl.
   Nach dem Split vergleicht sie mit dem Ergebnis. Wer die Prognose klar schlägt, gewinnt Vertrauen beim Vorstand. */
function pressPreview(){const ev=S.ev;if(!ev||ev.type!=='split')return;pressEval();const U=S.teams[S.user],L=teamsOf(U.reg);
  const sc=t=>teamOvr(t)+(t.rep-60)*.12+gauss()*1.2,order=L.map(t=>[t.id,sc(t)]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  const rk=id=>order.indexOf(id)+1,byRep=L.slice().sort((a,b)=>b.rep-a.rep).map(t=>t.id),gap=id=>byRep.indexOf(id)+1-rk(id);
  const tip=order.slice(3).sort((a,b)=>gap(b)-gap(a))[0]||order[3],shaky=order.slice(0,4).filter(id=>id!==order[0]).sort((a,b)=>gap(a)-gap(b))[0],me=rk(S.user);
  S.press={ev:ev.id,year:S.year,reg:U.reg,order,me,tip,shaky};
  const T=id=>S.teams[id].name;
  mail(`Saisonvorschau: ${ev.name}`,`Die Presse tippt ${T(order[0])} als Favoriten, dahinter ${T(order[1])} und ${T(order[2])}. Geheimtipp: ${T(tip)}. Wackelkandidat: ${T(shaky)}. Für ${U.name} sehen die Experten Platz ${me}${me<=2?', also ein Titelanwärter':me<=4?', also einen Playoff-Platz':me>=L.length-1?', also den Tabellenkeller':''}. Das Vorstandsziel ist Platz ${expected(S.user)}.`)}
function pressEval(){const P=S.press;if(!P||P.done)return;const R0=S.rec&&S.rec[P.ev]&&S.rec[P.ev][P.reg];if(!R0||P.year!==S.year&&P.ev!=='S3')return;
  const place=R0.indexOf(S.user)+1;if(!place)return;P.done=true;const d=P.me-place;
  if(d>=3){S.board=clamp(S.board+3,0,100);mail('Presse: Prognose übertroffen',`Getippt war Platz ${P.me}, geworden ist es Platz ${place}. Die Presse spricht von der Überraschung des Splits.`)}
  else if(d<=-3){S.board=clamp(S.board-3,0,100);mail('Presse: Prognose verfehlt',`Getippt war Platz ${P.me}, geworden ist es Platz ${place}. Die Kritik wird lauter.`)}}
function pressPanel(){const P=S.press;if(!P||!S.ev||S.ev.id!==P.ev||!S.teams[P.order[0]])return'';
  return `<section class="panel s5"><div class="lab"><span>Presse-Prognose</span><span>${S.ev.name}</span></div>${P.order.slice(0,6).map((id,i)=>`<div class="stat ${id===S.user?'res me':''}"><span class="rl"><span class="pos">${i+1}</span>${crest(S.teams[id],'sm')} ${S.teams[id].name}${id===P.tip?' <span class="good" style="font-size:12px">Geheimtipp</span>':''}${id===P.shaky?' <span class="warn" style="font-size:12px">Wackelkandidat</span>':''}</span></div>`).join('')}
   ${P.me>6?`<div class="stat res me"><span class="rl"><span class="pos">${P.me}</span>${crest(S.teams[S.user],'sm')} ${S.teams[S.user].name}</span></div>`:''}</section>`}

/* ===== Rekorde und Hall of Fame =====
   Rekorde gelten für deine Karriere als Manager. Vereinslegenden sind Spieler mit mindestens drei Saisons bei deinem Verein
   oder einem Titel mit ihm. Sie werden jede Saison festgehalten, auch wenn sie später gehen oder aufhören. */
function recNote(k,val,txt){S.recs=S.recs||{};const r=S.recs[k];if(!r||val>r.v){S.recs[k]={v:val,t:txt,year:S.year};return true}return false}
function clubGames(p,tid){return(p.hist||[]).filter(h=>h.t===tid).reduce((a,h)=>a+(h.g||0),0)+(p.team===tid?(p.st&&p.st.g)||0:0)}
function clubSeasons(p,tid){return(p.hist||[]).filter(h=>h.t===tid).length+(p.team===tid?1:0)}
function clubMvp(p,tid){return(p.hist||[]).filter(h=>h.t===tid).reduce((a,h)=>a+(h.mvp||0),0)+(p.team===tid?(p.st&&p.st.mvp)||0:0)}
function hofSeason(){S.hof=S.hof||{};const tid=S.user,ty=S.trophies.filter(t=>t.year===S.year).length;
  for(const p of Object.values(S.players)){const se=clubSeasons(p,tid),won=p.team===tid&&isStarter(p)&&ty;if(se<3&&!won&&!S.hof[p.id])continue;
    const h=S.hof[p.id]||(S.hof[p.id]={name:p.name,role:p.role,club:tid,titles:0,first:S.year});if(h.club!==tid)continue;
    h.seasons=Math.max(h.seasons||0,se);h.games=Math.max(h.games||0,clubGames(p,tid));h.mvp=Math.max(h.mvp||0,clubMvp(p,tid));h.last=S.year;if(won)h.titles+=ty;h.awards=(p.awards||[]).length}}
function hofView(){const C=S.career||[],R=S.recs||{},H=Object.values(S.hof||{}).filter(h=>h.seasons>=3||h.titles).sort((a,b)=>(b.titles-a.titles)||(b.games-a.games));
  const best=C.length?C.slice().sort((a,b)=>a.place-b.place)[0]:null;
  const cur=Object.values(S.players).filter(p=>(p.hist||[]).some(h=>h.t===S.user)||p.team===S.user).map(p=>[p,clubGames(p,S.user),clubMvp(p,S.user)]);
  const most=cur.slice().sort((a,b)=>b[1]-a[1])[0],mvp=cur.slice().sort((a,b)=>b[2]-a[2])[0];
  const rec=(l,v,s)=>`<div class="stat"><span class="muted">${l}</span><span style="text-align:right">${v}${s?` <span class="dim" style="font-size:12px">${s}</span>`:''}</span></div>`;
  return `<div class="pagehead"><div><h1>Rekorde</h1><p>${S.manager} · ${S.trophies.length} ${S.trophies.length===1?'Titel':'Titel'} · ${C.length} ${C.length===1?'Saison':'Saisons'}</p></div></div>
  <div class="grid"><section class="panel s6"><div class="lab"><span>Rekorde</span><span>Karriere</span></div>
   ${rec('Titel',S.trophies.length,S.trophies.slice(0,3).map(t=>t.name+' '+t.year).join(', '))}
   ${rec('Beste Platzierung im Sommer',best?`Platz ${best.place}`:'-',best?`${best.year}, ${S.teams[best.team]?S.teams[best.team].name:''}`:'')}
   ${rec('Längste Siegesserie',`${S.bestStreak||0} Serien`)}
   ${rec('Teuerster Einkauf',R.buy?eurK(R.buy.v):'-',R.buy?`${R.buy.t}, ${R.buy.year}`:'')}
   ${rec('Teuerster Verkauf',R.sell?eurK(R.sell.v):'-',R.sell?`${R.sell.t}, ${R.sell.year}`:'')}
   ${rec('Meiste Spiele für den Verein',most&&most[1]?`${most[1]}`:'-',most&&most[1]?most[0].name:'')}
   ${rec('Meiste MVP-Auszeichnungen',mvp&&mvp[2]?`${mvp[2]}`:'-',mvp&&mvp[2]?mvp[0].name:'')}</section>
  <section class="panel s6"><div class="lab"><span>Titel</span><span>${S.trophies.length}</span></div>${S.trophies.map(t=>`<div class="stat"><span>${t.name}</span><span>${t.year}</span></div>`).join('')||'<p class="empty">Noch kein Titel.</p>'}</section>
  <section class="panel s12"><div class="lab"><span>Hall of Fame</span><span>ab drei Saisons im Verein oder mit Titel</span></div>${H.length?`<div class="scroll"><table class="tbl"><thead><tr><th>Spieler</th><th></th><th>Verein</th><th class="r">Saisons</th><th class="r">Spiele</th><th class="r">MVP</th><th class="r">Titel</th><th class="r">Jahre</th></tr></thead><tbody>
   ${H.map(h=>`<tr><td class="nmcell">${h.name}</td><td><span class="chip">${h.role}</span></td><td>${S.teams[h.club]?S.teams[h.club].name:h.club}</td><td class="r">${h.seasons}</td><td class="r">${h.games}</td><td class="r">${h.mvp||0}</td><td class="r">${h.titles||0}</td><td class="r">${h.first}-${h.last}</td></tr>`).join('')}</tbody></table></div>`:'<p class="empty">Noch keine Vereinslegenden. Spieler kommen hier hinein, wenn sie drei Saisons für dich spielen oder einen Titel holen.</p>'}</section>
  ${careerPanel()}</div>`}

/* ===== Vorstandsziele =====
   Jeder Verein hat eine Philosophie. Daraus setzt der Vorstand zu Saisonbeginn Ziele mit Gewicht: Pflicht (3), Wichtig (2), Wunsch (1).
   Jedes Ziel liefert einen Wert von -1 (klar verfehlt) bis +1 (klar erfüllt). Zum Saisonende ändert sich das Vertrauen um
   3 + Summe(Gewicht x Wert x 4), höchstens -30 bis +25. Nach jedem Split zählt der Ligaplatz als Zwischenbilanz. Unter 25 % folgt die Entlassung. */
const PHIL={titel:['Titelhunger','Der Verein will Trophäen und Auftritte auf der großen Bühne. Geld ist zweitrangig.'],aufbau:['Aufbau','Der Verein will Schritt für Schritt nach oben, ohne sich zu verschulden.'],
  jugend:['Jugend','Der Verein setzt auf eigene Talente und will sie in der ersten Mannschaft sehen.'],wirtschaft:['Wirtschaft','Der Verein muss Geld verdienen. Sportlicher Erfolg zählt, aber nicht um jeden Preis.']};
const GIMP=['','Wunsch','Wichtig','Pflicht'];
function philOf(T){if(!T.phil)T.phil=T.rep>=82?'titel':['aufbau','jugend','wirtschaft'][hashId(T.id)%3];return T.phil}
function genGoals(){const U=S.teams[S.user],ph=philOf(U),exp=expected(S.user),f=S.fin,G=[];
  const lg=(imp,tgt)=>G.push({k:'liga',imp,tgt,txt:`Sommer-Split: Platz ${tgt} oder besser`});
  const intlTgt=U.rep>=80?'WLD':U.rep>=70?'any':null;
  if(ph==='titel'){lg(3,Math.min(exp,2));G.push({k:'intl',imp:3,tgt:'WLD',txt:'Worlds erreichen'});G.push({k:'fans',imp:1,tgt:5,txt:'Fans: +5% in der Saison'});G.push({k:'fin',imp:1,tgt:-.4,txt:'Kein Verlust über 40% des Kontos'})}
  else if(ph==='aufbau'){lg(3,Math.max(1,exp-1));if(intlTgt)G.push({k:'intl',imp:2,tgt:intlTgt,txt:intlTgt==='WLD'?'Worlds erreichen':'Ein internationales Turnier erreichen'});G.push({k:'fin',imp:2,tgt:-.15,txt:'Kein Verlust über 15% des Kontos'})}
  else if(ph==='jugend'){lg(2,exp);G.push({k:'jugend',imp:3,tgt:2,txt:'Zwei Talente bis 21 mit 20 Spielen im Profikader'});G.push({k:'fin',imp:2,tgt:-.2,txt:'Kein Verlust über 20% des Kontos'});if(intlTgt==='WLD')G.push({k:'intl',imp:1,tgt:'any',txt:'Ein internationales Turnier erreichen'})}
  else{lg(2,exp);G.push({k:'fin',imp:3,tgt:0,txt:'Saison ohne Verlust abschließen'});G.push({k:'fans',imp:2,tgt:8,txt:'Fans: +8% in der Saison'});if(intlTgt)G.push({k:'intl',imp:1,tgt:'any',txt:'Ein internationales Turnier erreichen'})}
  S.goals={year:S.year,team:S.user,phil:ph,bal0:f.balance,fans0:f.fans,list:G};return S.goals}
function ensureGoals(){if(!S.goals||S.goals.year!==S.year||S.goals.team!==S.user)genGoals();return S.goals}
/* Stand eines Ziels: st = Status, sc = -1..1, now = Text zum aktuellen Stand */
function goalEval(g,final){const U=S.teams[S.user],G=S.goals,f=S.fin;
  if(g.k==='liga'){const id=final?'S3':(currentSplit()?currentSplit().id:null),sp=id&&S.rec[id]?null:currentSplit();let place;
    if(final&&S.rec.S3)place=S.rec.S3[U.reg].indexOf(S.user)+1;else if(sp){const t=tableOf(sp.reg[U.reg].ids,sp.reg[U.reg].res);place=t.findIndex(x=>x.id===S.user)+1}else{const last=['S3','S2','S1'].find(x=>S.rec[x]);place=last?S.rec[last][U.reg].indexOf(S.user)+1:0}
    if(!place)return{st:'offen',sc:0,now:'noch kein Spiel'};const d=g.tgt-place;return{st:d>=0?(final?'erfüllt':'auf Kurs'):d>=-2?(final?'verfehlt':'gefährdet'):'verfehlt',sc:clamp(d>=0?.4+d*.2:d/3,-1,1),now:`aktuell Platz ${place}`}}
  if(g.k==='intl'){const ids=g.tgt==='WLD'?['WLD']:['FS','MSI','DC','WLD'],hit=ids.some(id=>S.rec[id]&&S.rec[id].place&&S.rec[id].place[S.user]),cur=S.ev&&S.ev.type!=='split'&&ids.includes(S.ev.id)&&S.ev.teams.includes(S.user);
    if(hit||cur)return{st:'erfüllt',sc:1,now:'qualifiziert'};const left=ids.some(id=>!S.rec[id]&&!(S.ev&&S.ev.id===id));return left&&!final?{st:'offen',sc:0,now:'Qualifikation läuft'}:{st:'verfehlt',sc:-1,now:'nicht qualifiziert'}}
  if(g.k==='fin'){const b0=Math.max(100000,Math.abs(G.bal0)),end=final?f.balance:finState().proj,ch=(end-G.bal0)/b0,d=ch-g.tgt;
    return{st:d>=0?(final?'erfüllt':'auf Kurs'):d>-.15?(final?'verfehlt':'gefährdet'):'verfehlt',sc:clamp(d*3,-1,1),now:`${final?'Saisonende':'Prognose'} ${ch>=0?'+':''}${Math.round(ch*100)}%`}}
  if(g.k==='jugend'){const n=[...U.roster].map(i=>S.players[i]).filter(p=>p.age<=21&&!p.loan&&((p.st&&p.st.g)||0)>=PRAX_HI).length,pot=[...U.roster].map(i=>S.players[i]).filter(p=>p.age<=21&&!p.loan&&isStarter(p)).length;
    return{st:n>=g.tgt?'erfüllt':final?'verfehlt':pot>=g.tgt?'auf Kurs':'gefährdet',sc:clamp((n-g.tgt)/2+(n>=g.tgt?.5:0),-1,1),now:`${n} von ${g.tgt}`}}
  if(g.k==='fans'){const ch=(f.fans/Math.max(1,G.fans0)-1)*100,d=ch-g.tgt;return{st:d>=0?(final?'erfüllt':'auf Kurs'):d>-4?(final?'verfehlt':'gefährdet'):'verfehlt',sc:clamp(d/8,-1,1),now:`${ch>=0?'+':''}${ch.toFixed(1).replace('.',',')}%`}}
  return{st:'offen',sc:0,now:''}}
function boardSeason(){const G=ensureGoals(),res=G.list.map(g=>({g,e:goalEval(g,true)}));let d=3;for(const{g,e}of res)d+=g.imp*e.sc*4;d=clamp(d,-30,25);S.board=clamp(S.board+d,0,100);G.final=res.map(({g,e})=>({txt:g.txt,imp:g.imp,st:e.st,now:e.now}));G.delta=Math.round(d);return res}
function boardSplit(id){const G=ensureGoals(),g=G.list.find(x=>x.k==='liga');if(!g||id==='S3')return;const U=S.teams[S.user],pl=S.rec[id][U.reg].indexOf(S.user)+1,d=g.tgt-pl,ch=clamp(d>=0?1+d*.5:d,-4,3)*(g.imp/2);
  S.board=clamp(S.board+ch,0,100);if(S.board<35&&!G.warned){G.warned=true;mail('Ultimatum des Vorstands',`Das Vertrauen liegt bei ${Math.round(S.board)}%. ${goalLines(false)} Der Vorstand erwartet bis Saisonende eine klare Steigerung, sonst trennt er sich von dir.`)}}
function goalLines(final){const G=ensureGoals();return G.list.map(g=>{const e=goalEval(g,final);return `${g.txt} (${GIMP[g.imp]}): ${e.st}, ${e.now}.`}).join(' ')}
function goalsPanel(){const G=ensureGoals(),U=S.teams[S.user],ph=PHIL[G.phil];
  const col=st=>st==='erfüllt'||st==='auf Kurs'?'good':st==='gefährdet'?'warn':st==='verfehlt'?'bad':'muted';
  return `<section class="panel s12"><div class="lab"><span>Vorstand</span><span>Vertrauen ${Math.round(S.board)}%</span></div>${bar(S.board,barCol(S.board))}
   <p class="muted" style="font-size:13px;margin:8px 0 12px">Philosophie: <b style="color:var(--fg)">${ph[0]}</b>. ${ph[1]} Unter ${SACK_AT}% Vertrauen zum Saisonende trennt sich der Vorstand von dir.</p>
   <div class="scroll"><table class="tbl"><thead><tr><th>Ziel ${S.year}</th><th>Gewicht</th><th>Stand</th><th class="r">Status</th></tr></thead><tbody>
   ${G.list.map(g=>{const e=goalEval(g,S.phase==='offseason');return `<tr><td>${g.txt}</td><td class="${g.imp===3?'warn':''}">${GIMP[g.imp]}</td><td class="muted">${e.now}</td><td class="r ${col(e.st)}">${e.st}</td></tr>`}).join('')}</tbody></table></div>
   <p class="muted" style="font-size:12.5px;margin:10px 0 0">Zum Saisonende ändert sich das Vertrauen nach den Zielen: Pflicht wiegt dreifach, Wichtig doppelt. Nach jedem Split zählt der Tabellenplatz als Zwischenbilanz.${G.delta!=null&&S.phase==='offseason'?` Diese Saison: ${G.delta>=0?'+':''}${G.delta} Punkte.`:''}</p></section>`}
