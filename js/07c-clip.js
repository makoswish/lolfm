/* ===== Live-Spiel: Teamfight-Fokus und Wendepunkt-Clip =====
   Die Engine legt pro Minute ein Bild ab (z.fr[t]: Positionen, Ort, Türme, Kills). Daraus entstehen:
   - Fokus: Bei Teamfights und großen Objectives zoomt die Karte (SMIL-Animation des viewBox) auf den Ort,
     dazu Schockwellen, Kill-Marker und eine aufsteigende Kill-Zahl.
   - Clip: Ein Wendepunkt (Siegchance springt um mindestens 10 Punkte) lässt sich als Wiederholung der Minuten davor
     und danach abspielen. Live erscheint ein Knopf an der Karte, nach dem Spiel in der Nachbereitung. */
const FOCUSK={fight:1,bigfight:1,ace:1,elder:1,baron:1,soul:1,decide:1};
function recFrame(z){z.fr=z.fr||{};z.fr[z.t]={t:z.t,pos:z.pos,loc:z.evLoc?z.evLoc.slice():null,lost:z.lost.map(o=>Object.assign({},o)),k:[...z.s.k]}}
function tlAt(z,t){return z.tl.find(x=>x.t===t)}
function fightFocus(z,fr){const t=fr?fr.t:z.t;if(!fr&&LIVE&&LIVE.phase!=='live')return null;
  const e=z.ev.filter(x=>x.t===t&&FOCUSK[x.k]).sort((a,b)=>b.w-a.w)[0];if(!e)return null;
  const loc=e.loc||(fr?fr.loc:z.evLoc);if(!loc)return null;
  const a=tlAt(z,t),b=tlAt(z,t-1),dk=a&&b?[Math.max(0,a.k[0]-b.k[0]),Math.max(0,a.k[1]-b.k[1])]:[0,0];
  return{loc,side:e.side,k:e.k,big:e.w>=3,dk}}
function fightFx(f){const col=f.side===0?'var(--blue)':'var(--red)',x=f.loc[0],y=f.loc[1],R2=f.big?22:15;
  let o=`<circle cx="${x}" cy="${y}" r="3" fill="${col}" opacity=".35"><animate attributeName="r" values="3;${R2-3};${R2-6}" dur="1.3s" fill="freeze"/><animate attributeName="opacity" values=".45;.12" dur="1.3s" fill="freeze"/></circle>`;
  for(let k=0;k<3;k++)o+=`<circle cx="${x}" cy="${y}" r="2" fill="none" stroke="${col}" stroke-width=".9" opacity="0"><animate attributeName="r" values="2;${R2}" begin="${(k*.22).toFixed(2)}s" dur=".9s" fill="freeze"/><animate attributeName="opacity" values=".9;0" begin="${(k*.22).toFixed(2)}s" dur=".9s" fill="freeze"/></circle>`;
  const n=Math.min(8,f.dk[0]+f.dk[1]);
  for(let i=0;i<n;i++){const a=i*2.4+1,d=3+(i%3)*2.2,cx=x+Math.cos(a)*d,cy=y+Math.sin(a)*d,c2=i<f.dk[0]?'var(--blue)':'var(--red)';
    o+=`<path d="M${(cx-1.3).toFixed(1)} ${(cy-1.3).toFixed(1)}l2.6 2.6M${(cx+1.3).toFixed(1)} ${(cy-1.3).toFixed(1)}l-2.6 2.6" stroke="${c2}" stroke-width=".9" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;1;1;.5" keyTimes="0;.2;.7;1" begin="${(.15+i*.12).toFixed(2)}s" dur="1.4s" fill="freeze"/></path>`}
  if(n)o+=`<text x="${x}" y="${y-5}" text-anchor="middle" font-size="5.2" font-weight="800" fill="var(--brass2)" font-family="Barlow,sans-serif" opacity="0">+${n}<animate attributeName="y" values="${y-4};${y-13}" dur="1.5s" fill="freeze"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.7;1" dur="1.5s" fill="freeze"/></text>`;
  return o}
function swingAt(z,t){const a=tlAt(z,t),b=tlAt(z,t-1);return a&&b&&a.wp!=null&&b.wp!=null?a.wp-b.wp:0}
function recentTurn(z){for(let t=z.t;t>=Math.max(2,z.t-2);t--){const d=swingAt(z,t);if(Math.abs(d)>=.12&&z.fr&&z.fr[t])return{t,d}}return null}
function tpList(z){const out=[];for(const x of z.tl){if(x.t<2||!(z.fr&&z.fr[x.t]))continue;const d=swingAt(z,x.t);if(Math.abs(d)>=.1)out.push({t:x.t,d})}
  const tp=typeof turning==='function'?turning(z):null;if(tp&&z.fr&&z.fr[tp.t]&&!out.some(x=>x.t===tp.t))out.push({t:tp.t,d:(tp.b-tp.a)*(z.winner===0?1:-1)});
  return out.sort((a,b)=>Math.abs(b.d)-Math.abs(a.d)).slice(0,4).sort((a,b)=>a.t-b.t)}
function clipFrames(z,t){const out=[];for(let k=Math.max(1,t-3);k<=Math.min(t+1,z.end||t+1);k++)if(z.fr&&z.fr[k])out.push(z.fr[k]);return out}
function clipBody(){const c=MODAL.clip,z=LIVE.sim,fr=c.frames[c.i],A=S.teams[z.A],B=S.teams[z.B],wp=(tlAt(z,fr.t)||{}).wp,pa=Math.round((wp==null?.5:wp)*100),evs=z.ev.filter(e=>e.t===fr.t&&e.w>=1);
  return `<div class="mapwrap${fightFocus(z,fr)?' fx':''}" id="clipmap">${miniMap(z,fr)}</div>
  <div class="lvwp" style="margin-top:10px"><span class="wa ${z.A===S.user?'me':''}"><small>${A.id}</small> ${pa}%</span><div class="wbar"><i id="clipbar" style="width:${pa}%"></i></div><span class="wb ${z.B===S.user?'me':''}">${100-pa}% <small>${B.id}</small></span></div>
  <div class="clipline">${c.frames.map((f,i)=>`<button class="btn sm ${i===c.i?'':'ghost'}" data-a="clipgo" data-i="${i}">${lvPad(f.t)}'</button>`).join('')}</div>
  <div class="cliptxt">${evs.length?evs.map(e=>`<div class="ev2"><span class="evi s${e.side}">${evIcon(e.k)}</span><span class="evt">${lvTxt(z,e.text)}</span></div>`).join(''):'<p class="muted" style="margin:0">Ruhige Minute.</p>'}</div>
  <p class="muted" style="margin:8px 0 0;font-size:13px">Kills ${fr.k[0]} : ${fr.k[1]}</p>`}
function clipModal(){const c=MODAL.clip;if(!c||!LIVE||!LIVE.sim)return'';
  return `<div class="ov" data-a="clipclose"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="clipt" style="max-width:560px"><h2 id="clipt" style="font-size:24px">Wendepunkt · Minute ${c.t}</h2>
  <div id="clipbody">${clipBody()}</div>
  <div class="acts" style="margin-top:12px"><button class="btn" data-a="clipplay">${c.play?'Pause':c.i>=c.frames.length-1?'Noch einmal':'Abspielen'}</button><button class="btn ghost" data-a="clipclose">Schließen</button></div></div></div>`}
function clipPaint(animate){const c=MODAL&&MODAL.clip,body=$('#clipbody');if(!c||!body)return;
  const old={};body.querySelectorAll('g.mk').forEach(g=>{const ci=g.querySelector('circle:nth-of-type(2)');if(ci)old[g.dataset.id]=[+ci.getAttribute('cx'),+ci.getAttribute('cy')]});
  const w0=$('#clipbar')?parseFloat($('#clipbar').style.width):null;
  body.innerHTML=clipBody();i18nApply(body);
  if(animate&&!lvReduced()&&typeof Element!=='undefined'&&Element.prototype.animate){
    body.querySelectorAll('g.mk').forEach(g=>{const ci=g.querySelector('circle:nth-of-type(2)'),o=old[g.dataset.id];if(!ci||!o)return;const dx=o[0]-(+ci.getAttribute('cx')),dy=o[1]-(+ci.getAttribute('cy'));if(Math.abs(dx)+Math.abs(dy)<.2)return;
      g.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:900,easing:'cubic-bezier(.3,.7,.3,1)'})});
    const bar=$('#clipbar');if(bar&&w0!=null)bar.animate([{width:w0+'%'},{width:bar.style.width}],{duration:900,easing:'ease-out'})}
  const pb=$('[data-a="clipplay"]');if(pb)pb.textContent=c.play?'Pause':c.i>=c.frames.length-1?'Noch einmal':'Abspielen'}
function clipStop(){if(CLIPTM){clearInterval(CLIPTM);CLIPTM=null}if(MODAL&&MODAL.clip)MODAL.clip.play=false}
let CLIPTM=null;
function clipStart(){const c=MODAL&&MODAL.clip;if(!c)return;if(c.i>=c.frames.length-1)c.i=0;c.play=true;clipPaint(true);if(CLIPTM)clearInterval(CLIPTM);
  CLIPTM=setInterval(()=>{const cc=MODAL&&MODAL.clip;if(!cc){clearInterval(CLIPTM);CLIPTM=null;return}if(cc.i>=cc.frames.length-1){clipStop();clipPaint(false);return}cc.i++;clipPaint(true)},1400)}
const CLIPACT={
  clip(d){const z=LIVE&&LIVE.sim;if(!z)return;const t=+d.t,frames=clipFrames(z,t);if(!frames.length)return;
    if(LIVE.phase==='live'&&LIVE.speed!==3){LIVE.speed=3;if(typeof loop==='function')loop()}
    const i=Math.max(0,frames.findIndex(f=>f.t===t));MODAL={clip:{t,frames,i:0,play:false,vb:null}};render();
    clipStart()},
  clipgo(d){const c=MODAL&&MODAL.clip;if(!c)return;clipStop();c.i=+d.i;clipPaint(true)},
  clipplay(){const c=MODAL&&MODAL.clip;if(!c)return;if(c.play){clipStop();clipPaint(false);return}clipStart()},
  clipclose(){clipStop();MODAL=null;render()}};
function clipBtn(t){return `<button class="btn ghost sm" data-a="clip" data-t="${t}">Clip ansehen</button>`}
