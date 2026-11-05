/* ===== Sponsoren ===== */
let SPCONF=null;
const SPGOAL={po:['Playoffs in mindestens einem Split',()=>['S1','S2','S3'].some(id=>S.rec[id]&&S.rec[id][S.teams[S.user].reg].indexOf(S.user)<4)],
  top3:['Top 3 im Sommer-Split',()=>S.rec.S3&&S.rec.S3[S.teams[S.user].reg].indexOf(S.user)<3],
  intl:['Teilnahme an einem internationalen Turnier',()=>['FS','MSI','DC','WLD'].some(id=>S.rec[id]&&S.rec[id].place[S.user])],
  worlds:['Worlds-Teilnahme',()=>!!(S.rec.WLD&&S.rec.WLD.place[S.user])],
  title:['Mindestens ein Titel in der Saison',()=>S.trophies.some(t=>t.year===S.year)]};
function goalFor(){const U=S.teams[S.user],e=expected(S.user),n=teamsOf(U.reg).length;return e<=2?pick(['title','worlds']):e<=4?pick(['top3','intl','worlds']):e<=n*.6?pick(['po','intl']):'po'}
function sponsorBase(){const f=S.fin;let s=0;for(const[k]of SLOTS){const o=f.slots[k];if(!o)continue;let b=o.base;if(o.type==='fan')b+=Math.round(f.fans*o.fanRate);if(o.type==='content'&&!f.content)b=Math.round(b*.5);s+=b}return s}
function slotOpen(k){const sl=SLOTS.find(x=>x[0]===k);return !sl[3]||sl[3]()}
function mkOffer(type,b,nm){const o={name:nm(),type,base:r100(b)};
  if(type==='perf'){o.base=r100(b*.55);o.perWin=r100(b*1);o.title=r100(b*6)}
  else if(type==='risk'){o.base=r100(b*.3);o.perWin=r100(b*.4);o.title=r100(b*8);o.intl=r100(b*5)}
  else if(type==='goal'){o.base=r100(b*.7);o.goal=goalFor();o.gbonus=r1000(b*12)}
  else if(type==='multi'){o.base=r100(b*.92);o.yrs=ri(2,3)}
  else if(type==='fan'){o.base=r100(b*.5);o.fanRate=+(b*.5/Math.max(20000,S.fin.fans)).toFixed(4)}
  else if(type==='content'){o.base=r100(b*1.3)}
  return o}
function genSlotOffers(k,used){const f=S.fin,sl=SLOTS.find(x=>x[0]===k),B=(sponsorFor(S.teams[S.user].rep)+6000)/1.5,b=B*sl[2]*(.9+R()*.2);used=used||new Set(Object.values(f.slots).filter(Boolean).map(o=>o.name));
  const nm=()=>{let n,g=0;do n=pick(BRANDS);while(used.has(n)&&g++<60);used.add(n);return n};
  const pool=shuffle(sl[5].filter(t=>t!=='fix').slice()).slice(0,k==='main'?3:2),types=['fix',...pool];
  const list=types.map(t=>mkOffer(t,b,nm));
  const loyal=(f.loyal||[]).find(n=>!used.has(n)||list.some(o=>o.name===n));if(loyal&&R()<.7){const o=mkOffer(pick(['fix','multi']),b*1.12,()=>loyal);o.loyal=true;list.push(o)}
  f.offers[k]=list}
function genOffers(){const f=S.fin;f.offers=f.offers||{};const used=new Set(Object.values(f.slots||{}).filter(Boolean).map(o=>o.name));for(const[k]of SLOTS)if(!f.slots[k])genSlotOffers(k,used)}
function sponsorBonus(kind){for(const[k]of SLOTS){const sp=S.fin.slots[k];if(!sp)continue;if(sp[kind])book('Sponsor-Prämien',sp[kind]);if(kind==='perWin')sp.sat=clamp((sp.sat||60)+1,0,100);if(kind==='title')sp.sat=clamp((sp.sat||60)+8,0,100)}}
function sponsorWeek(){const f=S.fin;
  for(const[k]of SLOTS){const o=f.slots[k];if(o&&o.type==='content'&&f.content){for(const id of S.teams[S.user].roster){const p=S.players[id];p.form=clamp(p.form-.4,30,100)}}}
  const act=SLOTS.map(x=>x[0]).filter(k=>f.slots[k]);
  if(act.length&&R()<.09&&!S.inbox.some(m=>m.type==='spreq'&&!m.done)){const k=pick(act),o=f.slots[k],fee=r1000(Math.max(5000,o.base*1.6));
    const ev=pick(['ein Fotoshooting mit dem ganzen Team','einen Promo-Stream mit zwei Spielern','einen Auftritt auf einer Messe','einen Werbedreh für Social Media']);
    mail(`Anfrage von ${o.name}`,`${o.name} wünscht sich ${ev}. Das bringt ${eurK(fee)}, kostet die Starter aber etwas Moral und Form. Lehnst du ab, sinkt die Zufriedenheit des Partners.`,{type:'spreq',k,fee,done:false,exp:S.step+2})}
  for(const m of S.inbox)if(m.type==='spreq'&&!m.done&&m.exp<=S.step){m.done=true;m.result='abgelaufen';const o=f.slots[m.k];if(o)o.sat=clamp((o.sat||60)-5,0,100)}}
function sponsorSeasonEnd(){const f=S.fin;f.loyal=[];
  for(const[k,n]of SLOTS){const o=f.slots[k];if(!o)continue;
    if(o.type==='goal'){const ok=SPGOAL[o.goal][1]();if(ok){book('Sponsor-Prämien',o.gbonus);o.sat=clamp((o.sat||60)+15,0,100);mail(`Ziel erreicht: ${o.name}`,`"${SPGOAL[o.goal][0]}" geschafft. Bonus: ${eurK(o.gbonus)}.`)}else{o.sat=clamp((o.sat||60)-15,0,100);mail(`Ziel verfehlt: ${o.name}`,`"${SPGOAL[o.goal][0]}" nicht geschafft. Der Bonus entfällt.`)}}
    if((o.sat||60)>=75)f.loyal.push(o.name)}}
function sponsorNewSeason(){const f=S.fin;for(const[k]of SLOTS){const o=f.slots[k];if(o&&o.type==='multi'&&o.yrs>1){o.yrs--}else f.slots[k]=null}genOffers();
  if(f.loyal&&f.loyal.length)mail('Treue Partner',`${f.loyal.join(', ')} ${f.loyal.length===1?'war':'waren'} sehr zufrieden und ${f.loyal.length===1?'bietet':'bieten'} dir bessere Konditionen an.`)}
function spCard(k,o,i,signed){const t=STYPE[o.type],sat=o.sat??60,cpen=r1000(o.base*8);
  return `<div class="card spc ${signed?'on':''} ${o.loyal?'loyal':''}" style="cursor:default"><span class="tag">${t.n}${o.loyal?' · Treuer Partner':''}</span><b>${o.name}</b><p>${t.d}</p>
   <div class="stat"><span class="muted">Pro Woche</span><span>${eur(o.base)}</span></div>
   ${o.perWin?`<div class="stat"><span class="muted">Pro Seriensieg</span><span>${eur(o.perWin)}</span></div>`:''}
   ${o.title?`<div class="stat"><span class="muted">Pro Titel</span><span>${eur(o.title)}</span></div>`:''}
   ${o.intl?`<div class="stat"><span class="muted">Pro int. Qualifikation</span><span>${eur(o.intl)}</span></div>`:''}
   ${o.goal?`<div class="stat"><span class="muted">Ziel</span><span style="font-family:var(--f-body);text-align:right">${SPGOAL[o.goal][0]}</span></div><div class="stat"><span class="muted">Bonus bei Erfolg</span><span>${eur(o.gbonus)}</span></div>`:''}
   ${o.yrs?`<div class="stat"><span class="muted">Laufzeit</span><span>${o.yrs} ${o.yrs===1?'Saison':'Saisons'}${signed?' übrig':''}</span></div>`:''}
   ${o.fanRate?`<div class="stat"><span class="muted">Plus pro 10.000 Fans</span><span>${eur(o.fanRate*10000)}</span></div>`:''}
   ${o.type==='content'?`<div class="stat"><span class="muted">Bedingung</span><span style="font-family:var(--f-body)" class="${S.fin.content?'good':'bad'}">Content-Team ${S.fin.content?'vorhanden':'fehlt, nur 50%'}</span></div>`:''}
   ${signed?`<div class="lab" style="margin:8px 0 4px;border:0;padding:0"><span>Zufriedenheit</span><span>${Math.round(sat)}%</span></div>${bar(sat,barCol(sat))}
     ${SPCONF===k?`<div class="acts" style="margin-top:8px"><button class="btn danger sm" data-a="spcancel" data-k="${k}" data-ok="1">Kündigen (${eurK(cpen)})</button><button class="btn ghost sm" data-a="spcancel" data-k="${k}" data-ok="0">Abbrechen</button></div>`:`<button class="btn ghost sm" style="margin-top:8px;align-self:flex-start" data-a="spcancel" data-k="${k}">Vertrag kündigen</button>`}`
    :`<button class="btn sm" style="margin-top:6px;align-self:flex-start" data-a="sponsor" data-k="${k}" data-i="${i}">Unterschreiben</button>`}</div>`}
function sponsorTab(){const f=S.fin,act=SLOTS.filter(([k])=>f.slots[k]),avgSat=act.length?Math.round(act.reduce((a,[k])=>a+(f.slots[k].sat??60),0)/act.length):0;
  const tiles=`<section class="s12 tiles"><div class="tile"><span>Sponsoring pro Woche</span><b>${eurK(sponsorBase())}</b><small>Fixum aller Partner</small></div>
   <div class="tile"><span>Partner</span><b>${act.length}/${SLOTS.length}</b><small>${SLOTS.filter(([k])=>!slotOpen(k)).length} Plätze noch gesperrt</small></div>
   <div class="tile"><span>Zufriedenheit</span><b style="color:${barCol(avgSat)}">${act.length?avgSat+'%':'-'}</b><small>ab 75% bessere Angebote</small></div>
   <div class="tile"><span>Prämien ${S.year}</span><b>${eurK(f.season.inc['Sponsor-Prämien']||0)}</b><small>Siege, Titel, Ziele</small></div>
   <div class="tile"><span>Events ${S.year}</span><b>${eurK(f.season.inc['Sponsor-Events']||0)}</b><small>angenommene Anfragen</small></div></section>`;
  const secs=SLOTS.map(([k,n,fac,,req,types])=>{const cur=f.slots[k],open=slotOpen(k);
    return `<section class="panel s12"><div class="lab"><span>${n}</span><span>${!open?`<span class="dim">Gesperrt: ${req}</span>`:cur?'Vertrag läuft':`${(f.offers[k]||[]).length} Angebote`}</span></div>
     ${!open?`<p class="muted" style="margin:0;font-size:14px">Wird frei, sobald gilt: ${req}.</p>`:`<div class="cards">${cur?spCard(k,cur,0,true):(f.offers[k]||[]).map((o,i)=>spCard(k,o,i,false)).join('')}</div>`}</section>`}).join('');
  return tiles+secs+`<section class="panel s12"><div class="lab"><span>Sponsor-Vorschuss</span><span>einmal pro Saison</span></div>${f.adv?`<p style="margin:0;font-size:14px">Offen: <b>${eur(f.adv.left)}</b>. Die Sponsoren behalten 25% ihrer Wochenzahlung ein.</p>`:f.advUsed?'<p class="muted" style="margin:0;font-size:14px">Diese Saison schon genutzt.</p>':`<p class="muted" style="margin:0 0 10px;font-size:14px">Sechs Wochen Sponsorgeld sofort, zurückgezahlt mit 5% Aufschlag über einbehaltene Sponsorzahlungen.</p><button class="btn ghost sm" data-a="advance" ${sponsorBase()?'':'disabled'}>Vorschuss nehmen (${eurK(r1000(sponsorBase()*6))})</button>`}</section>
   <section class="panel s12"><ul class="reasons" style="margin:0"><li>Verträge laufen bis Saisonende, Mehrjahresverträge entsprechend länger. Haupt- und Hardware-Sponsor unterschreibt der Vorstand nach einer Woche automatisch, die übrigen Plätze sind freiwillig.</li><li>Zufriedenheit steigt mit Siegen, Titeln, erreichten Zielen und angenommenen Anfragen. Partner ab 75% bieten zur neuen Saison bessere Konditionen.</li><li>Kündigen kostet acht Wochenzahlungen. Danach kommen neue Angebote für den Platz.</li></ul></section>`}
