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
function genSlotOffers(k,used){const f=S.fin,sl=SLOTS.find(x=>x[0]===k),B=(sponsorFor(S.teams[S.user].rep)+6000)/1.5*regRev(),b=B*sl[2]*(.9+R()*.2);used=used||new Set(Object.values(f.slots).filter(Boolean).map(o=>o.name));
  const reg=S.teams[S.user].reg,nm=()=>{let n,g=0;do n=pick(R()<.7&&BRANDR[reg]?BRANDR[reg]:BRANDS);while(used.has(n)&&g++<80);if(used.has(n))do n=pick(BRANDS.concat(BRANDR[reg]||[]));while(used.has(n)&&g++<160);used.add(n);return n};
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
  return `<div class="card spc ${signed?'on':''} ${o.loyal?'loyal':''}" style="cursor:default"><span class="tag">${t.n}${o.loyal?' · Treuer Partner':''} · ${ORGN[brandOrg(o.name)]}</span><b>${o.name}</b><p>${t.d}</p>
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

/* ===== Infrastruktur =====
   Ausbau läuft über einen Antrag beim Vorstand. Der antwortet nach ein bis zwei Wochen mit Begründung.
   Genehmigte Projekte haben eine Bauzeit und werden in Wochenraten bezahlt. Pro Einrichtung ein Antrag pro Saison. */
const IRATE=['Einfach','Ordentlich','Gut','Sehr gut','Erstklassig'];
const IWEEKS={tc:[10,14,18],gh:[6,9,12],ac:[8,12]};
const HWB={low:{n:'Sparsam',c:0,d:-.5},mid:{n:'Normal',c:800,d:-.08},high:{n:'Hoch',c:2500,d:.6}};
/* Startstand: Trainingszentrum und Gaming House passend zum Vereinsruf wie bei der KI. Unterhalt kostet nur, was darüber hinaus gebaut wurde.
   Alte Spielstände bekommen beim ersten Laden denselben Startstand, bereits gekaufte Ausbauten bleiben. */
function infraInit(){const f=S.fin;if(!f.ibase){const U=S.teams[S.user];f.ibase={tc:aiInfra(U,'tc'),gh:aiInfra(U,'gh'),ac:0};for(const k of['tc','gh'])f.infra[k]=Math.max(f.infra[k]||0,f.ibase[k])}if(f.hw==null)f.hw=60;if(!HWB[f.hwb])f.hwb='mid';f.iask=f.iask||{};f.builds=f.builds||[];if(f.ireq===undefined)f.ireq=null}
function iFrac(k,lv){return lv/INFRA[k].cost.length}
function iWord(fr){return IRATE[clamp(Math.round(fr*4),0,4)]}
/* Einrichtungen der KI-Teams leiten sich aus ihrem Ruf ab */
function aiInfra(T,k){const max=INFRA[k].cost.length;return clamp(Math.round((T.rep-52)/12*max/3),0,max)}
function leagueLv(k){const U=S.teams[S.user],L=teamsOf(U.reg).filter(t=>t.id!==S.user);return L.length?L.reduce((a,t)=>a+aiInfra(t,k),0)/L.length:0}
/* Wirkung relativ zum Ligaschnitt: darüber Bonus, darunter Malus */
function tcF(){return clamp(1+.15*(S.fin.infra.tc-leagueLv('tc')),.9,1.5)}
function ghRel(){return Math.max(-.5,S.fin.infra.gh-leagueLv('gh'))}
function upkeep(){const f=S.fin,b=f.ibase||{};return Object.keys(INFRA).reduce((a,k)=>a+Math.max(0,f.infra[k]-(b[k]||0))*INFRA[k].up,0)}
function leagueFrac(k){const U=S.teams[S.user],L=teamsOf(U.reg).filter(t=>t.id!==S.user);return L.length?L.reduce((a,t)=>a+iFrac(k,aiInfra(t,k)),0)/L.length:0}
function building(k){return(S.fin.builds||[]).find(b=>b.k===k)}
/* Wirkung auf Spieler: Trainingszentrum und Gaming House im Vergleich zum Ligaschnitt, von -1 bis +1 */
function attract(){if(!S||!S.fin||!S.fin.infra)return 0;const f=S.fin.infra;return clamp(((iFrac('tc',f.tc)-leagueFrac('tc'))+(iFrac('gh',f.gh)-leagueFrac('gh')))/2*2,-1,1)}
function hwF(){const f=S.fin;return 1+((f.hw??60)-60)/400}
function infraCan(k){const f=S.fin;infraInit();const lv=f.infra[k],max=INFRA[k].cost.length;
  if(lv>=max)return 'Voll ausgebaut.';if(building(k))return 'Wird gerade gebaut.';if(f.ireq)return f.ireq.k===k?'Der Vorstand berät noch.':'Es läuft schon ein anderer Antrag.';
  if(f.iask[k]===S.season)return `Diese Saison schon beantragt. Nächster Antrag ab Saison ${S.year+1}.`;if(S.phase==='offseason')return 'Der Vorstand berät erst wieder zum Saisonstart.';return null}
function infraAsk(k){const e=infraCan(k);if(e)return e;const f=S.fin;f.ireq={k,wk:S.step+ri(1,2)};f.iask[k]=S.season;
  mail('Antrag an den Vorstand',`Du hast den Ausbau ${INFRA[k].n} beantragt (rund ${eurK(INFRA[k].cost[f.infra[k]])}). Der Vorstand antwortet in den nächsten zwei Wochen.`);return null}
function infraDecide(k){const f=S.fin,lv=f.infra[k],cost=INFRA[k].cost[lv],free=f.balance-reserveAmt(),why=[];let sc=0;
  if(f.balance<0||f.budget&&f.budget.frozen){sc-=5;why.push('Das Konto ist im Minus, Investitionen sind gesperrt.')}
  else if(free>=cost){sc+=2;why.push('Das Geld ist über die Rücklage hinaus vorhanden.')}
  else if(free>=cost*.5){sc+=1;why.push('Mit Raten über die Bauzeit ist das finanzierbar, aber knapp.')}
  else{sc-=2;why.push(`Nach Abzug der Rücklage fehlen rund ${eurK(cost-Math.max(0,free))}.`)}
  if(S.board>=60){sc+=1;why.push('Der Vorstand vertraut dir.')}else if(S.board<35){sc-=2;why.push('Das Vertrauen des Vorstands ist gering.')}
  const own=iFrac(k,lv),lg=k==='ac'?own:leagueFrac(k);if(own<lg-.1){sc+=1;why.push(`Die Konkurrenz ist im Schnitt besser aufgestellt (${iWord(lg)}).`)}else if(own>lg+.3){sc-=1;why.push(`Du liegst schon klar über dem Ligaschnitt (${iWord(lg)}).`)}
  const ok=sc>=2,U=S.teams[S.user];
  if(ok){const wk=IWEEKS[k][lv];f.builds.push({k,to:lv+1,left:wk,total:wk,cost,paid:0});
    mail(`Vorstand genehmigt: ${INFRA[k].n}`,`${why.join(' ')} Der Ausbau auf ${iWord(iFrac(k,lv+1))} startet sofort und dauert ${wk} Wochen. Die Kosten von ${eurK(cost)} laufen in Wochenraten.${k==='tc'?' Während der Bauphase leidet das Training etwas.':''}`)}
  else mail(`Vorstand lehnt ab: ${INFRA[k].n}`,`${why.join(' ')} Einen neuen Antrag kannst du ab Saison ${S.year+1} stellen.`);
  return ok}
function infraWeek(){infraInit();const f=S.fin;
  if(f.ireq&&S.step>=f.ireq.wk){const k=f.ireq.k;f.ireq=null;infraDecide(k)}
  for(const b of [...f.builds]){const rate=Math.min(b.cost-b.paid,Math.round(b.cost/b.total));book('Bauprojekte',-rate);b.paid+=rate;b.left--;
    if(b.left<=0){book('Bauprojekte',-(b.cost-b.paid));f.infra[b.k]=b.to;f.builds=f.builds.filter(x=>x!==b);mail(`Fertig: ${INFRA[b.k].n}`,`Der Ausbau ist abgeschlossen. ${INFRA[b.k].n}: jetzt ${iWord(iFrac(b.k,b.to))}.`)}}
  const h=HWB[f.hwb];if(h.c)book('Ausstattung',-h.c);f.hw=clamp(f.hw+h.d,10,100)}
function infraSeason(){infraInit();const f=S.fin;f.hw=clamp(f.hw-8,10,100);if(f.ireq){const k=f.ireq.k;f.ireq=null;infraDecide(k)}}
function buildCost(){return(S.fin.builds||[]).reduce((a,b)=>a+Math.round(b.cost/b.total),0)}
function infraTab(){infraInit();const f=S.fin,at=attract();
  const fac=Object.entries(INFRA).map(([k,x])=>{const lv=f.infra[k],max=x.cost.length,fr=iFrac(k,lv),lg=leagueFrac(k),b=building(k),e=infraCan(k);
   const status=b?`<div class="stat"><span class="muted">Ausbau auf ${iWord(iFrac(k,b.to))}</span><span>noch ${b.left} ${b.left===1?'Woche':'Wochen'}</span></div>${bar((b.total-b.left)/b.total*100,'var(--team)')}<p class="dim" style="font-size:12.5px;margin:6px 0 0">Bezahlt ${eurK(b.paid)} von ${eurK(b.cost)}.</p>`
    :f.ireq&&f.ireq.k===k?`<p class="warn" style="font-size:13px;margin:10px 0 0">Antrag liegt beim Vorstand. Antwort bis Woche ${f.ireq.wk}.</p>`
    :lv<max?`<div class="acts" style="margin-top:10px"><button class="btn ghost sm" data-a="infraask" data-v="${k}" ${e?'disabled':''}>Ausbau beantragen</button></div><p class="dim" style="font-size:12.5px;margin:6px 0 0">${e||`Rund ${eurK(x.cost[lv])}, Bauzeit ${IWEEKS[k][lv]} Wochen, danach ${eur(x.up)} mehr Unterhalt pro Woche.`}</p>`
    :'<p class="good" style="font-size:13px;margin:10px 0 0">Voll ausgebaut.</p>';
   return `<section class="panel s4"><div class="lab"><span>${x.n}</span><span>${iWord(fr)}</span></div>
    <div class="cmpbar"><span>Dein Verein</span>${bar(fr*100,'var(--team)')}<span>${iWord(fr)}</span>${k==='ac'?'':`<span class="muted">Schnitt ${S.teams[S.user].reg}</span>${bar(lg*100,'var(--dim)')}<span class="muted">${iWord(lg)}</span>`}</div>
    <p class="muted" style="font-size:13.5px;margin:10px 0">${x.d}</p>
    <div class="stat"><span class="muted">Wirkung jetzt</span><span>${k==='tc'?`Training ${tcF()>=1?'+':''}${Math.round((tcF()-1)*100)}%`:k==='gh'?(ghRel()>.2?'<span class="good">hebt Moral und Form</span>':ghRel()<-.2?'<span class="bad">drückt Moral und Form</span>':'neutral'):`${1+lv} ${lv?'Talente':'Talent'} pro Saison`}</span></div>
    <div class="stat"><span class="muted">Unterhalt pro Woche</span><span>${eur(Math.max(0,lv-(f.ibase[k]||0))*x.up)}</span></div>${status}</section>`}).join('');
  const hw=Math.round(f.hw),h=HWB[f.hwb];
  return fac+`<section class="panel s6"><div class="lab"><span>Hardware und Technik</span><span>${iWord(hw/100)}</span></div>
   <div class="cmpbar"><span>Zustand</span>${bar(hw,hw>=60?'var(--good)':hw>=40?'var(--warn)':'var(--bad)')}<span>${hw}/100</span></div>
   <p class="muted" style="font-size:13.5px;margin:10px 0">PCs, Peripherie, Analyse-Software. Guter Zustand gibt bis zu 10% mehr Trainingsfortschritt und etwas Form. Jede neue Saison altert die Technik spürbar.</p>
   <div class="seg">${Object.entries(HWB).map(([k,v])=>`<button class="${f.hwb===k?'on':''}" data-a="hwb" data-v="${k}">${v.n} · ${v.c?eurK(v.c)+'/Wo.':'0 €'}</button>`).join('')}</div>
   <p class="dim" style="font-size:12.5px;margin:8px 0 0">${h.d>0?'Der Zustand steigt jede Woche.':h.d<-.2?'Der Zustand sinkt jede Woche spürbar.':'Der Zustand hält sich, sinkt nur leicht.'} Trainingswirkung aktuell ${hwF()>=1?'+':''}${Math.round((hwF()-1)*100)}%.</p></section>
  <section class="panel s6"><div class="lab"><span>Wirkung auf Spieler</span><span>${at>.2?'<span class="good">Vorteil</span>':at<-.2?'<span class="bad">Nachteil</span>':'neutral'}</span></div>
   <p class="muted" style="font-size:13.5px;margin:0 0 10px">Spieler vergleichen Trainingszentrum und Gaming House mit dem Rest der Liga. Liegst du darüber, verhandeln auch etwas bessere Spieler mit dir und bleiben länger am Tisch.</p>
   <div class="stat"><span class="muted">Ruf-Hürde bei Verhandlungen</span><span>${Math.round(at*2)>0?'-':Math.round(at*2)<0?'+':'±'}${Math.abs(Math.round(at*2))} Punkte</span></div>
   <div class="stat"><span class="muted">Geduld der Berater</span><span>${at>.25?'+1 Runde':at<-.25?'-1 Runde':'normal'}</span></div>
   <ul class="reasons" style="margin-top:12px"><li>Anträge prüft der Vorstand nach Kontostand, Rücklage, Vertrauen und Ligaschnitt.</li><li>Pro Einrichtung ein Antrag pro Saison.</li><li>Genehmigte Projekte zahlst du in Wochenraten über die Bauzeit.</li></ul></section>`}
