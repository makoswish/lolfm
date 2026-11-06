/* ===== Live-Ansicht =====
   Das Spiel läuft von selbst, du schaust zu. Aufbau: Kopf mit Spielstand, Siegchance und Ticker bleibt stehen, darunter die Steuerleiste.
   Darunter drei Bereiche: Karte, Verlauf (Graph und Ereignisse), Spieler. Am Handy sind das Reiter.
   Solange das Spiel läuft, zeichnet liveRefresh() nur die Bereiche mit Ids neu. So gehen Klicks auf die Steuerung nicht verloren.
   Elemente in diesen Bereichen reagieren auf pointerdown (data-pd) statt auf click. */
let SND=false;try{SND=localStorage.getItem('riftmgr_snd')==='1'}catch(e){}
function liveLocked(){return !!(LIVE&&(LIVE.phase==='live'||LIVE.phase==='draft'||LIVE.phase==='intro'))}
const lvPad=n=>String(n).padStart(2,'0');
const EVI={duel:'M5 5l14 14M19 5L5 19',gank:'M5 19L19 5M9 5h10v10',fight:'M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3',
  ace:'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z',fb:'M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z',tower:'M7 21V8h10v13M5 8V5h3v3M10 8V5h4v3M16 8V5h3v3',
  inhib:'M12 3l7 4v10l-7 4-7-4V7z',drake:'M12 3l8 9-8 9-8-9z',soul:'M12 3l8 9-8 9-8-9zM12 8l4 4-4 4-4-4z',herald:'M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  baron:'M3 18l2-10 5 5 2-8 2 8 5-5 2 10z',decide:'M13 2L4 14h7l-1 8 9-12h-7z',nexus:'M12 2l9 5v10l-9 5-9-5V7zM12 8l4 2v4l-4 2-4-2v-4z'};
EVI.bigfight=EVI.fight;EVI.elder=EVI.soul;
function evIcon(k){return `<svg viewBox="0 0 24 24" class="evsvg" aria-hidden="true"><path d="${EVI[k]||EVI.duel}"/></svg>`}
/* Teamnamen im Ereignistext in Teamfarbe */
function lvTxt(z,txt){const a=S.teams[z.A].name,b=S.teams[z.B].name,q=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return String(txt).replace(new RegExp('('+q(a)+'|'+q(b)+')','g'),m=>`<i class="${m===a?'tA':'tB'}">${m}</i>`)}
function lvReduced(){try{return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(e){return false}}

/* ---- Takt ---- */
function loop(){clearInterval(LIVE.timer);const sp=LIVE.speed;if(sp===3)return;
  const eff=sp===4?(LIVE.slow>0?0:2):sp,ms=[900,330,110][eff];
  LIVE.timer=setInterval(()=>{if(!LIVE||LIVE.phase!=='live'){clearInterval(LIVE&&LIVE.timer);return}
    const z=LIVE.sim,n0=z.ev.length,done=simTick(z),fresh=z.ev.slice(n0);
    for(const e of fresh)if(e.w>=2)lvBeep(e);
    if(LIVE.speed===4){if(fresh.some(e=>e.w>=2)){LIVE.slow=2;loop()}else if(LIVE.slow>0){LIVE.slow--;if(LIVE.slow===0)loop()}}
    if(done){gameDone();render();return}
    if(S.view==='live')liveRefresh()},ms)}
function gameDone(){clearInterval(LIVE.timer);finishSim(LIVE.sim);LIVE.phase='post';LIVE.tab='feed';LIVE.sel=null;recordGame(LIVE.sim);if(seriesOver())commitSeries();LIVE.talk=null}
/* Zeichnet nur die Bereiche neu, die sich pro Minute ändern. Ohne Ids (Tests, erste Anzeige) die ganze Seite. */
function liveRefresh(){const z=LIVE&&LIVE.sim;if(!z)return;if(!$('#lvhead')){render();return}
  const set=(id,h)=>{const n=$('#'+id);if(n){n.innerHTML=h;i18nApply(n)}};
  const old={},oldK=[...document.querySelectorAll('#lvhead .kills [data-k]')].map(x=>x.dataset.k);
  document.querySelectorAll('#lvmap g.mk').forEach(g=>{const c=g.querySelector('circle:nth-of-type(2)');if(c)old[g.dataset.id]=[+c.getAttribute('cx'),+c.getAttribute('cy')]});
  set('lvhead',lvHead(z));set('lvmap',lvMapBox(z));set('lvtimers',lvTimers(z));set('lvgraph',lvGraph(z));set('lvfeed',lvFeed(z));set('lvpl',lvTables(z));
  try{lvFx(z,old,oldK)}catch(e){}}
/* Bewegung: Spieler gleiten über die Karte, die Siegchance-Leiste läuft sanft, neue Kills springen auf */
function lvFx(z,old,oldK){if(lvReduced())return;const dur=Math.max(250,Math.min(900,(LIVE.speed===2?280:LIVE.speed===1?520:800)));
  if(typeof Element==='undefined'||!Element.prototype.animate)return;
  document.querySelectorAll('#lvmap g.mk').forEach(g=>{const c=g.querySelector('circle:nth-of-type(2)'),o=old[g.dataset.id];if(!c||!o)return;
    const dx=o[0]-(+c.getAttribute('cx')),dy=o[1]-(+c.getAttribute('cy'));if(Math.abs(dx)+Math.abs(dy)<.2)return;
    g.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:dur,easing:'cubic-bezier(.3,.7,.3,1)'})});
  const pa=Math.round((z.tl[z.tl.length-1].wp??.5)*100),i=document.querySelector('#lvhead .wbar i');
  if(i&&LIVE.pwp!=null&&LIVE.pwp!==pa)i.animate([{width:LIVE.pwp+'%'},{width:pa+'%'}],{duration:dur,easing:'ease-out'});LIVE.pwp=pa;
  document.querySelectorAll('#lvhead .kills [data-k]').forEach((x,n)=>{if(oldK[n]!=null&&oldK[n]!==x.dataset.k)x.animate([{transform:'scale(1.5)',filter:'brightness(1.6)'},{transform:'scale(1)',filter:'none'}],{duration:520,easing:'ease-out'})})}
/* Töne und Vibration bei großen Momenten, standardmäßig aus */
let AC=null;
function lvBeep(e){if(!SND)return;try{const mine=e.side===myS();
  if(typeof navigator!=='undefined'&&navigator.vibrate&&e.w>=3)navigator.vibrate([35,40,35]);
  const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;AC=AC||new Ctx();const t0=AC.currentTime;
  const tone=(f,d,at)=>{const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t0+at);g.gain.exponentialRampToValueAtTime(.08,t0+at+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+at+d);o.connect(g);g.connect(AC.destination);o.start(t0+at);o.stop(t0+at+d+.02)};
  if(mine){tone(660,.14,0);if(e.w>=3)tone(880,.2,.12)}else{tone(330,.16,0);if(e.w>=3)tone(247,.22,.14)}}catch(err){}}

/* ---- Kopf: Spielstand, Siegchance, Ticker ---- */
function lvHead(z){const s=LIVE.series,A=S.teams[z.A],B=S.teams[z.B],t=z.t,snap=z.tl[z.tl.length-1],post=LIVE.phase==='post',pa=Math.round((snap.wp??.5)*100);
  const dots=i=>s.bo>1?`<span class="sdots" title="Serie Bo${s.bo}">${Array.from({length:Math.ceil(s.bo/2)},(_,k)=>`<i class="${k<s.wins[i]?'on':''}"></i>`).join('')}</span>`:'';
  const plan=i=>post?'':` · ${INS[z.ins[i]].n}`,last=[...z.ev].reverse().find(e=>e.w>=1),flash=!post&&last&&last.t===t&&last.w>=2;
  return `<div class="board lvboard"><div class="side-t">${crest(A)}<div style="min-width:0"><b class="${z.A===S.user?'myid':''}">${A.name}</b><small>Blau · ${compTag(z.dr[0].picks)||'Gemischt'}${plan(0)}${dots(0)}</small></div></div>
   <div><div class="kills"><span class="b" data-k="${snap.k[0]}">${snap.k[0]}</span><span class="dim" style="font-size:.5em">:</span><span class="r" data-k="${snap.k[1]}">${snap.k[1]}</span></div><div class="clock">${lvPad(t)}:00${!post&&LIVE.speed===3?' · Pause':''}</div></div>
   <div class="side-t r">${crest(B)}<div style="min-width:0"><b class="${z.B===S.user?'myid':''}">${B.name}</b><small>Rot · ${compTag(z.dr[1].picks)||'Gemischt'}${plan(1)}${dots(1)}</small></div></div></div>
   <div class="lvwp" title="Geschätzte Siegchance aus Stärke, Draft, Gold und Objectives. Nur Anzeige."><span class="wa ${z.A===S.user?'me':''}"><small>${A.id}${z.A===S.user?' (du)':''}</small> ${pa}%</span><div class="wbar"><i style="width:${pa}%"></i></div><span class="wb ${z.B===S.user?'me':''}">${100-pa}% <small>${B.id}${z.B===S.user?' (du)':''}</small></span></div>
   <div class="lvtick ${flash?'flash s'+last.side:''}">${last?`<span class="evi s${last.side}">${evIcon(last.k)}</span><span class="tm">${lvPad(last.t)}'</span><span class="evt">${lvTxt(z,last.text)}</span>`:`<span class="evt muted">${post?'Das Spiel ist vorbei.':'Die Champions sind unterwegs.'}</span>`}</div>`}
/* ---- Steuerleiste: Tempo, nächster Moment, Ton. Wird nur beim vollen Neuzeichnen erzeugt. ---- */
function lvCtl(){const sp=LIVE.speed,b=(v,l,t)=>`<button class="btn sm ${sp===v?'':'ghost'}" data-a="speed" data-v="${v}" aria-pressed="${sp===v}" ${t?`title="${t}"`:''}>${l}</button>`;
  return `<div class="lvctl"><div class="lvspd" role="group" aria-label="Tempo">${b(3,'Pause')}${b(0,'1×')}${b(1,'3×')}${b(2,'8×')}${b(4,'Highlights','Schnell in ruhigen Phasen, langsam bei großen Momenten')}</div>
   <div class="lvact">${sp===3?`<button class="btn ghost sm" data-a="tick1" title="Eine Minute weiter">+1 Min</button>`:''}<button class="btn ghost sm" data-a="nextm" title="Bis zum nächsten großen Moment spielen und dort pausieren">Nächster Moment</button><button class="btn ghost sm" data-a="skip">Zum Ende</button>
   <button class="btn ghost sm sndb ${SND?'on':''}" data-a="snd" aria-pressed="${SND}" title="Töne und Vibration bei großen Momenten">${SND?'Ton an':'Ton aus'}</button></div></div>`}

/* ---- Karte ---- */
function lvMapBox(z){const post=LIVE.phase==='post',big=post?null:[...z.ev].filter(e=>z.t-e.t<=1&&e.w>=2).pop();
  return `<div class="mapwrap">${miniMap(z)}${big?`<div class="mapban s${big.side} ${big.w>=3?'big3':''}"><span class="evi s${big.side}">${evIcon(big.k)}</span><b>${EVK[big.k][1]}</b><span class="muted">${S.teams[big.side===0?z.A:z.B].id}</span></div>`:''}</div>
   <p class="maplab">${z.t<14?'Lane-Phase':z.t<25?'Midgame':'Lategame'} · Minute ${z.t}</p>`}
function miniMap(z){
  const tw=[0,1].map(i=>{const L=z.lost[i],col=i===0?'var(--blue)':'var(--red)';
    return ['top','mid','bot','nex'].map(l=>TWR[i][l].map((p,k)=>{const dead=k<L[l],key=i+l+k,fresh=dead&&LIVE&&LIVE.tdead&&!LIVE.tdead[key]&&LIVE.phase==='live';if(dead&&LIVE){(LIVE.tdead=LIVE.tdead||{})[key]=1}
      return `<rect class="${fresh?'tfall':''}" x="${p[0]-1.6}" y="${p[1]-1.6}" width="3.2" height="3.2" rx=".6" fill="${dead?'var(--dim)':col}" opacity="${dead?.35:1}"/>`}).join('')).join('')}).join('');
  const pin=LIVE&&LIVE.pin;
  const dots=z.pos?[0,1].map(i=>z.st[i].map(id=>{const q=z.pos[id];if(!q)return'';const p=S.players[id],pn=id===pin;
    return `<g class="mk" data-pd="pin" data-id="${id}" opacity="${q[2]?.35:1}"><title>${esc(p.name)} (${RN[p.role]})</title><circle cx="${q[0]}" cy="${q[1]}" r="6" fill="transparent"/><circle cx="${q[0]}" cy="${q[1]}" r="2.9" fill="${i===0?'var(--blue)':'var(--red)'}" stroke="${pn?'var(--brass2)':'var(--bg)'}" stroke-width="${pn?1.2:.7}"/><text x="${q[0]}" y="${q[1]+1.1}" text-anchor="middle" font-size="2.8" font-weight="700" fill="var(--bg)" font-family="Barlow,sans-serif">${p.role[0]}</text>${pn?`<text x="${q[0]}" y="${q[1]-4.4}" text-anchor="middle" font-size="3.4" font-weight="700" fill="var(--fg)" stroke="var(--bg)" stroke-width=".6" paint-order="stroke" font-family="Barlow,sans-serif">${esc(p.name)}</text>`:''}</g>`}).join('')).join(''):'';
  const an=lvReduced()?'':'<animate attributeName="r" values="2;10" dur=".9s" fill="freeze"/><animate attributeName="opacity" values=".95;0" dur=".9s" fill="freeze"/>';
  const pulse=z.evLoc&&z.winner<0?`<circle cx="${z.evLoc[0]}" cy="${z.evLoc[1]}" r="3.5" fill="var(--brass)" opacity=".25"/><circle cx="${z.evLoc[0]}" cy="${z.evLoc[1]}" r="7" fill="none" stroke="var(--brass2)" stroke-width=".8" opacity=".8">${an}</circle>`:'';
  return `<svg viewBox="0 0 100 100" class="mmap" role="img" aria-label="Minimap">
    <rect width="100" height="100" rx="4" fill="var(--panel2)"/>
    <path d="M8 92 L8 8 L92 8 M8 92 L92 8 M8 92 L92 92 L92 8" stroke="var(--line)" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 6 L94 94" stroke="var(--blue)" stroke-opacity=".14" stroke-width="7" fill="none"/>
    <circle cx="30" cy="30" r="4" fill="none" stroke="var(--muted)" stroke-width=".7"/><text x="30" y="31.3" text-anchor="middle" font-size="3.6" fill="var(--muted)" font-family="Barlow,sans-serif">B</text>
    <circle cx="70" cy="70" r="4" fill="none" stroke="var(--muted)" stroke-width=".7"/><text x="70" y="71.3" text-anchor="middle" font-size="3.6" fill="var(--muted)" font-family="Barlow,sans-serif">D</text>
    <circle cx="8" cy="92" r="5" fill="var(--blue)" opacity=".35"/><circle cx="92" cy="8" r="5" fill="var(--red)" opacity=".35"/>
    ${tw}${pulse}${dots}</svg>`}
/* Countdown für Herold, Drache und Baron, laufende Buffs, Objectives-Stand */
function lvTimers(z){const t=z.t,sn=z.tl[z.tl.length-1],post=LIVE.phase==='post',c=[],nm=i=>S.teams[i===0?z.A:z.B].id;
  if(!post){
    if(t<8)c.push(['Herold',`in ${8-t} Min`]);else if(t<14)c.push(['Herold',`in ${14-t} Min`]);
    if(z.soul===-1)c.push(['Drache',z.nextDrag>t?`in ${z.nextDrag-t} Min`:'jetzt']);
    else if(t<30)c.push(['Elder-Drache','ab Minute 30']);else c.push(['Elder-Drache',z.nextDrag>t?`in ${z.nextDrag-t} Min`:'jetzt']);
    const bi=[0,1].find(i=>z.buff[i]>=t);
    if(bi!=null)c.push(['Baron-Buff',`${nm(bi)} bis Min ${z.buff[bi]}`,bi]);else if(t<20)c.push(['Baron','ab Minute 20']);else c.push(['Baron',z.nextBaron>t?`in ${z.nextBaron-t} Min`:'verfügbar']);
    if(z.soul>=0)c.push(['Drachenseele',nm(z.soul),z.soul]);
    const ei=[0,1].find(i=>z.elder[i]>=t);if(ei!=null)c.push(['Elder-Buff',`${nm(ei)} bis Min ${z.elder[ei]}`,ei])}
  return `<div class="tmrs">${c.map(([l,v,sd])=>`<div class="tmr ${sd!=null?'s'+sd:''}"><span>${l}</span><b>${v}</b></div>`).join('')}</div>
   <div class="objs"><div>${sn.tw[0]}</div><div>Türme</div><div>${sn.tw[1]}</div><div>${sn.dr[0]}</div><div>Drachen</div><div>${sn.dr[1]}</div><div>${sn.bn[0]}</div><div>Baron</div><div>${sn.bn[1]}</div></div>`}

/* ---- Verlauf: Graph mit Markern ---- */
const MKS={fight:'c',bigfight:'c',gank:'c',fb:'c',decide:'c',tower:'s',inhib:'s',herald:'s',drake:'d',soul:'d',elder:'d',baron:'t',ace:'t',nexus:'t'};
function mkShape(sh,x,y,fill,sel){const st=`fill="${fill}" stroke="var(--bg)" stroke-width="1.2"`,r=sel?6:4.2;
  if(sh==='s')return `<rect x="${x-r}" y="${y-r}" width="${2*r}" height="${2*r}" rx="1" ${st}/>`;
  if(sh==='d')return `<path d="M${x} ${y-r-1}L${x+r+1} ${y}L${x} ${y+r+1}L${x-r-1} ${y}Z" ${st}/>`;
  if(sh==='t')return `<path d="M${x} ${y-r-1.5}L${x+r+1.5} ${y+r}L${x-r-1.5} ${y+r}Z" ${st}/>`;
  return `<circle cx="${x}" cy="${y}" r="${r}" ${st}/>`}
function lvGraph(z){const post=LIVE.phase==='post',span=Math.max(30,z.t+(post?0:5)),W=(typeof window!=='undefined'&&window.innerWidth&&window.innerWidth<700)?340:600,H=W<600?200:170,mid=H/2,gy=g=>mid-clamp(g/14000,-1,1)*(mid-10),wy=w=>mid-(w-.5)*2*(mid-10),X=t=>t/span*W;
  const pts=z.tl.map(x=>[X(x.t),gy(x.G)]),path=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const area=pts.length>1?path+` L${pts[pts.length-1][0].toFixed(1)} ${mid} L0 ${mid} Z`:'';
  const wp=z.tl.map((x,i)=>(i?'L':'M')+X(x.t).toFixed(1)+' '+wy(x.wp??.5).toFixed(1)).join(' ');
  const sel=LIVE.sel!=null?z.ev[LIVE.sel]:null;
  const mk=z.ev.map((e,i)=>({e,i})).filter(({e})=>e.w>=1&&z.tl[e.t]).map(({e,i})=>{const x=X(e.t),y=gy(z.tl[e.t].G),on=LIVE.sel===i;
    return `<g class="mk" data-pd="evsel" data-i="${i}"><title>${lvPad(e.t)}' ${esc(e.text)}</title><circle cx="${x}" cy="${y}" r="11" fill="transparent"/>${mkShape(MKS[e.k]||'c',x,y,e.side===0?'var(--blue)':'var(--red)',on)}</g>`}).join('');
  let cap='<span class="dim">Tippe auf einen Marker, um das Ereignis zu sehen.</span>';
  if(sel){const a=z.tl[sel.t-1]?z.tl[sel.t-1].wp:z.tl[0].wp,b=z.tl[sel.t].wp;cap=`<span class="tm">${lvPad(sel.t)}'</span> ${lvTxt(z,sel.text)} <span class="muted">· Siegchance Blau (${S.teams[z.A].id}) ${Math.round(a*100)}% → ${Math.round(b*100)}%</span>`}
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" role="img" aria-label="Goldvorsprung und Siegchance über die Zeit"><defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="var(--blue)" stop-opacity=".45"/><stop offset=".5" stop-color="var(--blue)" stop-opacity=".05"/><stop offset=".5" stop-color="var(--red)" stop-opacity=".05"/><stop offset="1" stop-color="var(--red)" stop-opacity=".45"/></linearGradient></defs>
    <line x1="0" x2="${W}" y1="${mid}" y2="${mid}" stroke="var(--line)"/>${[10,20,30,40,50].filter(m=>m<span).map(m=>`<line x1="${X(m)}" x2="${X(m)}" y1="4" y2="${H-4}" stroke="var(--line)" stroke-dasharray="2 5"/><text x="${X(m)+4}" y="${H-5}" fill="var(--dim)" font-size="11" font-family="IBM Plex Mono,monospace">${m}'</text>`).join('')}
    ${area?`<path d="${area}" fill="url(#gg)"/><path d="${path}" fill="none" stroke="var(--fg)" stroke-width="2"/>`:''}<path d="${wp}" fill="none" stroke="var(--brass2)" stroke-width="1.6" stroke-dasharray="5 4"/>
    ${sel?`<line x1="${X(sel.t)}" x2="${X(sel.t)}" y1="4" y2="${H-4}" stroke="var(--brass2)" stroke-width="1" stroke-dasharray="3 3"/>`:''}${mk}</svg>
   <div class="lvleg"><span><i class="lg gold"></i>Gold (Fläche)</span><span><i class="lg wp"></i>Siegchance Blau (Linie)</span><span><svg viewBox="0 0 10 10" class="lgs"><circle cx="5" cy="5" r="3.5"/></svg>Kampf</span><span><svg viewBox="0 0 10 10" class="lgs"><rect x="1.5" y="1.5" width="7" height="7"/></svg>Turm, Herold</span><span><svg viewBox="0 0 10 10" class="lgs"><path d="M5 0.5L9.5 5L5 9.5L0.5 5Z"/></svg>Drache</span><span><svg viewBox="0 0 10 10" class="lgs"><path d="M5 0.5L9.5 9L0.5 9Z"/></svg>Baron, Ace</span></div>
   <div class="lvsel">${cap}</div>`}
function lvFeed(z){const F=LIVE.filter||'key',pin=LIVE.pin&&S.players[LIVE.pin],hit=e=>pin&&e.text.includes(pin.name);
  const L=z.ev.map((e,i)=>({e,i})).filter(({e})=>F==='all'?true:F==='key'?e.w>=1:F==='hl'?e.w>=2:hit(e)).reverse();
  return L.map(({e,i})=>`<div class="ev2 ${e.w>=2?'hl':''} ${LIVE.sel===i?'sel':''} ${hit(e)?'pin':''} ${LIVE.phase==='live'&&e.t===z.t?'fresh':''}"><span class="tm">${lvPad(e.t)}'</span><span class="evi s${e.side}">${evIcon(e.k)}</span><span class="evt">${lvTxt(z,e.text)}</span></div>`).join('')||'<p class="empty">Noch nichts Wichtiges passiert.</p>'}
/* ---- Spielertabellen mit Merken ---- */
const PINSVG='<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z"/></svg>';
function pTable(z,side,post){const T=S.teams[side===0?z.A:z.B],dr=z.dr[side],pin=LIVE&&LIVE.pin;
  const td=z.st[side].reduce((s,i)=>s+z.ps[i].dmg,0)||1;
  return `<div class="scroll"><table class="tbl ptb"><thead><tr><th></th><th>${T.id}</th><th class="r">K/D/A</th><th class="r">CS</th><th class="r hide-s">Schaden</th><th class="r">Note</th></tr></thead><tbody>
  ${z.st[side].map(id=>{const p=S.players[id],x=z.ps[id],r=post?z.rt[id]:rating(z,id,side),on=id===pin;
   return `<tr class="${post&&id===z.mvp?'me':''} ${on?'pinned':''}"><td><span class="chip">${p.role}</span></td><td class="nmcell"><button class="pinb ${on?'on':''}" data-pd="pin" data-id="${id}" aria-label="${on?'Nicht mehr verfolgen':'Spieler verfolgen'}" title="Verfolgen">${PINSVG}</button>${p.name}<div class="dim" style="font-size:11.5px;font-weight:500">${chName(dr.picks[p.role])}</div></td><td class="r mono">${x.k}/${x.d}/${x.a}</td><td class="r mono">${x.cs}</td><td class="r mono hide-s">${Math.round(x.dmg/td*100)}%</td><td class="r"><span class="av ${r>=8?'a5':r>=7?'a4':r>=6?'a3':'a1'}">${r.toFixed(1).replace('.',',')}</span></td></tr>`}).join('')}</tbody></table></div>`}
function lvTables(z){const post=LIVE.phase==='post';return `<div class="lab"><span>${S.teams[z.A].name}</span><span class="dim" style="font-weight:500">Blau</span></div>${pTable(z,0,post)}<div class="lab" style="margin-top:16px"><span>${S.teams[z.B].name}</span><span class="dim" style="font-weight:500">Rot</span></div>${pTable(z,1,post)}`}

/* ---- Ansicht ---- */
function liveView(){const z=LIVE.sim;if(!z)return '';if(LIVE.phase==='intro')return lvIntro();
  const s=LIVE.series,post=LIVE.phase==='post',pin=LIVE.pin&&S.players[LIVE.pin],F=LIVE.filter||'key';let tab=LIVE.tab||(post?'feed':'map');if(post&&tab==='map')tab='feed';
  const tabs=[['map','Karte'],['feed','Verlauf'],['pl','Spieler']].filter(x=>!(post&&x[0]==='map'));
  return `<div class="lv ${post?'post':''}">
  <div class="lvstick"><div id="lvhead">${lvHead(z)}</div>${post?'':lvCtl()}</div>
  ${post?lvPost(z):''}
  <div class="seg lvtabs" role="tablist" aria-label="Bereich">${tabs.map(([k,l])=>`<button role="tab" aria-selected="${tab===k}" class="${tab===k?'on':''}" data-a="lvtab" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="lvgrid">
   ${post?'':`<section class="panel lvpane lvmap ${tab==='map'?'on':''}"><div class="lab"><span>Karte</span><span>Tippe einen Spieler an, um ihn zu verfolgen</span></div><div id="lvmap">${lvMapBox(z)}</div><div id="lvtimers">${lvTimers(z)}</div></section>`}
   <section class="panel lvpane lvmid ${tab==='feed'?'on':''}"><div class="lab"><span>Goldverlauf und Siegchance</span><span>${s.m.label}</span></div><div id="lvgraph">${lvGraph(z)}</div>
    <div class="lab" style="margin-top:14px"><span>Spielverlauf</span></div>
    <div class="seg lvfilter">${[['key','Wichtig'],['all','Alles'],['hl','Highlights']].concat(pin?[['pin',pin.name]]:[]).map(([k,l])=>`<button class="${F===k?'on':''}" data-a="lvf" data-v="${k}">${l}</button>`).join('')}</div>
    <div id="lvfeed" class="feed">${lvFeed(z)}</div></section>
   <section class="panel lvpane lvpl ${tab==='pl'?'on':''}"><div id="lvpl">${lvTables(z)}</div></section></div></div>`}

/* ---- Spielstart: Lane gegen Lane mit den Champions aus dem Draft ---- */
function h2hOf(U,O){const L=(S.mhist||[]).filter(r=>r.w&&((r.a===U.id&&r.b===O.id)||(r.a===O.id&&r.b===U.id)));return[L.filter(r=>r.w===U.id).length,L.length]}
function lvIntro(){const s=LIVE.series,z=LIVE.sim,U=S.teams[S.user],me=myS(),O=S.teams[me===0?s.b:s.a],an=S.staff.analyst,gi=s.wins[0]+s.wins[1]+1;
  const wpU=me===0?z.tl[0].wp:1-z.tl[0].wp,pU=Math.round(wpU*100),[hw,hn]=h2hOf(U,O);
  const rows=ROLES.map(r=>{const a=S.players[U.starters[r]],b=S.players[O.starters[r]],ca=z.dr[me].picks[r],cb=z.dr[1-me].picks[r],oa=ovr(a),ob=ovr(b),df=oa-ob;
    return `<div class="lane"><div class="ln l"><div><b>${a.name}</b><small>${chName(ca)} <span class="dim">${mastery(a,ca)}</span></small></div><span class="ovr ${oc(oa)}">${oa}</span></div>
     <div class="lm">${chip(r)}<i class="adv ${df>2?'good':df<-2?'bad':''}">${an>=3?(df>2?'+'+df:df<-2?df:'±'):''}</i></div>
     <div class="ln r"><span class="ovr ${an>=3?oc(ob):''}">${an>=3?ob:'~'+Math.round(ob/5)*5}</span><div><b>${b.name}</b><small>${chName(cb)}${an>=2?` <span class="dim">${mastery(b,cb)}</span>`:''}</small></div></div></div>`}).join('');
  const bans=i=>(z.dr[i].bans||[]).map(chName).join(', ')||'keine';
  return `<div class="pagehead"><div><h1>Spielstart</h1><p>${s.m.label} · ${s.bo>1?`Spiel ${gi} · Serie ${s.wins[me]}:${s.wins[1-me]} · Bo${s.bo}`:'Best of 1'}</p></div><div class="acts"><button class="btn" data-a="gostart">Spiel starten</button></div></div>
  <div class="grid"><section class="panel s8"><div class="lab"><span>Lane gegen Lane</span><span>${U.name} gegen ${O.name}</span></div>${rows}
   <p class="muted" style="font-size:13px;margin:12px 0 0">Zahl neben dem Champion: Meisterschaft von 1 bis 20. Während des Spiels schaust du zu. Tempo, Highlights und "Nächster Moment" steuerst du über die Leiste oben.</p></section>
  <section class="panel s4"><div class="lab">Siegchance</div><div class="bigwp ${pU>=55?'good':pU<=45?'bad':''}">${pU}%</div><div class="wbar" style="margin:8px 0 14px"><i style="width:${pU}%"></i></div>
   <div class="stat"><span class="muted">Teamstärke</span><span>${teamOvr(U)} gegen ${an>=3?teamOvr(O):'~'+Math.round(teamOvr(O)/5)*5}</span></div>
   <div class="stat"><span class="muted">Comps</span><span style="font-family:var(--f-body)">${compTag(z.dr[me].picks)||'Gemischt'} gegen ${compTag(z.dr[1-me].picks)||'Gemischt'}</span></div>
   <div class="stat"><span class="muted">Bilanz gegeneinander</span><span>${hn?`${hw}-${hn-hw} in ${hn} ${hn===1?'Serie':'Serien'}`:'noch nie gespielt'}</span></div>
   <div class="stat"><span class="muted">Deine Bans</span><span style="font-family:var(--f-body);text-align:right">${bans(me)}</span></div>
   <div class="stat"><span class="muted">Gegner-Bans</span><span style="font-family:var(--f-body);text-align:right">${bans(1-me)}</span></div>
   <p class="muted" style="font-size:12.5px;margin:10px 0 0">Die Siegchance rechnet Stärke und Draft ein. Im Spiel verschiebt sie sich mit Gold, Türmen und Objectives.</p></section></div>`}

/* ---- Nach dem Spiel: Wendepunkt, große Momente, Fakten ---- */
function turning(z){const sg=z.winner===0?1:-1;let best=null;for(let i=1;i<z.tl.length-1;i++){const d=(z.tl[i].wp-z.tl[i-1].wp)*sg;if(!best||d>best.d)best={d,t:z.tl[i].t,a:z.tl[i-1].wp,b:z.tl[i].wp}}
  if(!best||best.d<.04)return null;best.e=z.ev.filter(e=>e.t===best.t).sort((x,y)=>y.w-x.w)[0]||null;return best}
function lvPost(z){const s=LIVE.series,A=S.teams[z.A],B=S.teams[z.B],me=myS(),won=z.winner===me,mvp=S.players[z.mvp],F=z.first,fx=k=>F[k]==null?'-':(F[k]===0?A:B).id;
  const P=PRESS[s.done?(s.m.w===S.user?'win':'loss'):'win'],tp=turning(z),hl=z.ev.filter(e=>e.w>=2),W=z.winner===0?A:B,wv=p=>Math.round((z.winner===0?p:1-p)*100);
  return `<div class="banner" style="background:color-mix(in srgb,${won?'var(--good)':'var(--bad)'} 12%,var(--panel))"><h2 class="${won?'good':'bad'}">${won?'Sieg':'Niederlage'}</h2>
   <div style="display:flex;justify-content:center;margin:8px 0 4px">${avatar(mvp,'lg')}</div><p class="muted" style="margin:4px 0 12px">Spieler des Spiels: ${mvp.name} (${RN[mvp.role]}, Note ${z.rt[z.mvp].toFixed(1).replace('.',',')}) · ${z.end} Minuten${s.bo>1?` · Serie ${s.wins[me]}:${s.wins[1-me]}`:''}</p>
   ${s.done?`<button class="btn" data-a="after">Weiter</button>`:`<button class="btn" data-a="nextgame">Zum nächsten Spiel</button>`}</div>
   <div class="grid" style="margin-top:16px">
   <section class="panel s6"><div class="lab">Wendepunkt</div>${tp?`<p style="margin:0 0 6px"><span class="tm">${lvPad(tp.t)}'</span> <b>${tp.e?lvTxt(z,tp.e.text):'Der Goldvorsprung kippt.'}</b></p><p class="muted" style="margin:0;font-size:13.5px">Die Siegchance von ${W.name} steigt hier von ${wv(tp.a)}% auf ${wv(tp.b)}%.</p>`:'<p class="muted" style="margin:0">Das Spiel war von Anfang an klar. Es gab keinen Wendepunkt.</p>'}</section>
   <section class="panel s6"><div class="lab">Spielfakten</div><div class="stat"><span class="muted">First Blood</span><span>${fx('fb')}</span></div><div class="stat"><span class="muted">Erster Turm</span><span>${fx('tw')}</span></div><div class="stat"><span class="muted">Erster Drache</span><span>${fx('dr')}</span></div>
    <div class="stat"><span class="muted">Größter Goldvorsprung</span><span>${A.id} ${eurK(Math.max(0,...z.tl.map(x=>x.G))).replace(' €','')} · ${B.id} ${eurK(Math.max(0,...z.tl.map(x=>-x.G))).replace(' €','')}</span></div>
    <div class="stat"><span class="muted">Comps</span><span style="font-family:var(--f-body)">${compTag(z.dr[0].picks)||'Gemischt'} vs ${compTag(z.dr[1].picks)||'Gemischt'}</span></div></section>
   <section class="panel s${s.done?6:12}"><div class="lab"><span>Die großen Momente</span><span>${hl.length}</span></div><div class="feed hls">${hl.map(e=>`<div class="ev2 hl"><span class="tm">${lvPad(e.t)}'</span><span class="evi s${e.side}">${evIcon(e.k)}</span><span class="evt">${lvTxt(z,e.text)}</span></div>`).join('')||'<p class="empty">Keine großen Momente.</p>'}</div></section>
   ${s.done?`<section class="panel s6"><div class="lab">Pressekonferenz</div><p style="margin:0 0 10px"><b>„${P.q}“</b></p>
    ${LIVE.press&&LIVE.press.done?`<div class="note">${P.a[LIVE.press.i][0]}<br><span class="muted">${LIVE.press.txt}</span></div>`:`<div class="rows">${P.a.map((a,i)=>`<button class="btn ghost" style="text-transform:none;letter-spacing:0;font-family:var(--f-body);font-weight:500;text-align:left;white-space:normal" data-a="press" data-v="${i}">${a[0]}</button>`).join('')}</div>`}</section>`:''}</div>`}
