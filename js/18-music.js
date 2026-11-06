/* ===== Musik: wird im Browser erzeugt (Web Audio), es gibt keine Audiodateien ===== */
/* Vier Stimmungen: calm (Büro), work (Verwaltung), tense (Vorbereitung, Verhandlung, Draft), match (Live-Spiel).
   Gleiche Akkordfolge in D-Moll, die Stimmung ändert Tempo, Dichte und Schlagzeug. Start erst nach einem Klick (Browser-Regel). */
const MUSM={calm:{bpm:76,arp:.2,bass:[0,8],drums:0,pad:1},work:{bpm:92,arp:.36,bass:[0,6,8,14],drums:1,pad:1},tense:{bpm:104,arp:.46,bass:[0,3,6,8,11,14],drums:2,pad:.8},match:{bpm:118,arp:.58,bass:[0,2,4,6,8,10,12,14],drums:3,pad:.7}};
const MUSP=[[0,3,7],[-4,0,3],[3,7,10],[-2,2,5]];   /* Dm, Bb, F, C (Halbtöne über D) */
const MUSS=[0,3,5,7,10,12,15,17,19];               /* Moll-Pentatonik über zwei Oktaven */
const MUSL=['Aus','Leise','Mittel','Laut'],MUSV=[0,.35,.6,.9];
let MCTX=null,MOUT=null,MDEL=null,MTIMER=null,MNEXT=0,MSTEP=0,MMOOD='calm',MBUF=null;
/* Lautstärke 0 bis 1. Ältere Stände speichern 1 bis 3 (Stufe), erkennbar am fehlenden v:2. */
function musPref(){try{const o=JSON.parse(localStorage.getItem('riftmgr_music')||'{}');const vol=o.v===2?Math.max(0,Math.min(1,+o.vol||0)):(o.vol==null?.6:MUSV[Math.max(1,Math.min(3,+o.vol))]);return{on:!!o.on,vol}}catch(e){return{on:false,vol:.6}}}
function musSave(o){try{localStorage.setItem('riftmgr_music',JSON.stringify({on:!!o.on,vol:o.vol,v:2}))}catch(e){}}
function musHz(m){return 440*Math.pow(2,(m-69)/12)}
/* Deterministische Zufallszahl pro Schritt: gleiche Stimmung ergibt gleiche Figur */
function musRnd(i,k){let h=(i*2654435761+k*40503)>>>0;h^=h>>>15;h=Math.imul(h,2246822519)>>>0;h^=h>>>13;return(h>>>0)/4294967296}
/* Melodienote (MIDI) für Schritt i oder null */
function musNote(i,mood){const m=MUSM[mood]||MUSM.calm,pos=i%16,bar=Math.floor(i/16)%4;
  if(musRnd(i,1)>=m.arp*(pos%4===0?1.5:pos%2===0?1:.7))return null;
  const root=50+MUSP[bar][0],deg=MUSS[Math.floor(musRnd(i,2)*MUSS.length)];return root+12+deg}
function musBass(i,mood){const m=MUSM[mood]||MUSM.calm,pos=i%16,bar=Math.floor(i/16)%4;return m.bass.includes(pos)?38+MUSP[bar][0]:null}
function musDrum(i,mood){const m=MUSM[mood]||MUSM.calm,p=i%16,o=[];if(!m.drums)return o;
  if(m.drums===1){if(p===0||p===8)o.push('k');if(p%4===2)o.push('h');return o}
  if(m.drums===2){if(p===0||p===10)o.push('k');if(p===4||p===12)o.push('c');if(p%2===0)o.push('h');return o}
  if(p%4===0)o.push('k');if(p===4||p===12)o.push('c');if(p%2===0||p===15)o.push('h');return o}
function musMood(){if(typeof S==='undefined'||!S)return 'calm';
  if(typeof LIVE!=='undefined'&&LIVE){if(LIVE.phase==='live'||LIVE.phase==='intro')return 'match';if(LIVE.phase==='draft'||LIVE.phase==='pre')return 'tense'}
  if(S.view==='nego'||S.view==='prematch'||S.view==='draft')return 'tense';
  if(['squad','tactic','transfer','league','club'].includes(S.view))return 'work';return 'calm'}
function musSync(){MMOOD=musMood()}
function musCtx(){if(MCTX)return MCTX;const C=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext);if(!C)return null;
  try{MCTX=new C();const comp=MCTX.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=3;comp.connect(MCTX.destination);
    MOUT=MCTX.createGain();MOUT.gain.value=0;MOUT.connect(comp);
    const verb=MCTX.createConvolver(),len=MCTX.sampleRate*2.6,ir=MCTX.createBuffer(2,len,MCTX.sampleRate);
    for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.4)}
    verb.buffer=ir;const vg=MCTX.createGain();vg.gain.value=.5;verb.connect(vg);vg.connect(MOUT);MDEL=verb;
    MBUF=MCTX.createBuffer(1,MCTX.sampleRate*.2,MCTX.sampleRate);const nd=MBUF.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
    return MCTX}catch(e){MCTX=null;return null}}
function musEnv(g,t,a,peak,rel,dur){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setTargetAtTime(0,t+dur,rel)}
function musVoice(type,f,t,dur,peak,a,rel,cut,wet){const o=MCTX.createOscillator(),g=MCTX.createGain(),lp=MCTX.createBiquadFilter();o.type=type;o.frequency.value=f;lp.type='lowpass';lp.frequency.value=cut;
  o.connect(lp);lp.connect(g);g.connect(MOUT);if(wet){const s=MCTX.createGain();s.gain.value=wet;g.connect(s);s.connect(MDEL)}musEnv(g,t,a,peak,rel,dur);o.start(t);o.stop(t+dur+rel*6)}
function musStepPlay(i,t,sd){const m=MUSM[MMOOD],pos=i%16,bar=Math.floor(i/16)%4;
  if(pos===0){const root=50+MUSP[bar][0];for(const iv of MUSP[bar]){const n=50+iv;for(const d of [-6,6])musVoice('sawtooth',musHz(n)*Math.pow(2,d/1200),t,sd*15,.05*m.pad,sd*6,sd*4,900,.35)}}
  const b=musBass(i,MMOOD);if(b!=null)musVoice('sine',musHz(b),t,sd*1.6,.34,.01,.12,420,0);
  const n=musNote(i,MMOOD);if(n!=null)musVoice('triangle',musHz(n),t,sd*1.4,.11,.005,.18,2600,.55);
  for(const d of musDrum(i,MMOOD)){
    if(d==='k'){const o=MCTX.createOscillator(),g=MCTX.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.14);g.gain.setValueAtTime(.55,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(g);g.connect(MOUT);o.start(t);o.stop(t+.25)}
    else{const s=MCTX.createBufferSource(),hp=MCTX.createBiquadFilter(),g=MCTX.createGain();s.buffer=MBUF;hp.type='highpass';hp.frequency.value=d==='h'?7000:1800;g.gain.setValueAtTime(d==='h'?.07:.16,t);g.gain.exponentialRampToValueAtTime(.001,t+(d==='h'?.04:.12));s.connect(hp);hp.connect(g);g.connect(MOUT);s.start(t);s.stop(t+.14)}}}
function musTick(){if(!MCTX||MCTX.state==='closed')return;const m=MUSM[MMOOD],sd=60/m.bpm/4;
  if(MNEXT<MCTX.currentTime)MNEXT=MCTX.currentTime+.05;
  while(MNEXT<MCTX.currentTime+.3){musStepPlay(MSTEP,MNEXT,sd);MNEXT+=sd;MSTEP++}}
function musApplyVol(){if(!MCTX||!MOUT)return;const p=musPref();MOUT.gain.setTargetAtTime(p.on?p.vol*.55:0,MCTX.currentTime,.25)}
function musStart(){const p=musPref();if(!p.on)return false;const c=musCtx();if(!c)return false;try{if(c.state==='suspended')c.resume()}catch(e){}
  musSync();if(!MTIMER)MTIMER=setInterval(()=>{try{musTick()}catch(e){}},90);musApplyVol();return true}
function musStop(){if(MOUT&&MCTX)MOUT.gain.setTargetAtTime(0,MCTX.currentTime,.25);if(MTIMER){const t=MTIMER;MTIMER=null;setTimeout(()=>clearInterval(t),700)}}
function musToggle(){const p=musPref();p.on=!p.on;musSave(p);if(p.on)musStart();else musStop();return p.on}
function musSetVol(i){const p=musPref();if(i===0){p.on=false;musSave(p);musStop();return}p.on=true;p.vol=MUSV[i];musSave(p);musStart();musApplyVol()}
/* Stufenlos: Regler in den Optionen */
function musSetVolF(f){const p=musPref();p.vol=Math.max(0,Math.min(1,f));p.on=p.vol>0;musSave(p);if(p.on)musStart();else musStop();musApplyVol()}
function musStep(){const v=musPref().vol;return v<=.45?1:v<=.75?2:3}
function musLabel(){const p=musPref();return p.on?MUSL[musStep()]:'Aus'}
function musBtn(){const on=musPref().on;return `<button class="btn ghost sm musb ${on?'on':''}" data-a="music" aria-pressed="${on}" title="Musik ${on?'ausschalten':'einschalten'}" aria-label="Musik"><svg viewBox="0 0 24 24"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></svg></button>`}
function musPanel(){const p=musPref();return `<section class="panel s12"><div class="lab"><span>Musik</span><span>${musLabel()}</span></div>
  <div class="seg">${MUSL.map((l,i)=>`<button class="${(i===0?!p.on:p.on&&musStep()===i)?'on':''}" data-a="musvol" data-v="${i}">${l}</button>`).join('')}</div>
  <p class="muted" style="font-size:13px;margin:10px 0 0">Die Musik entsteht live im Browser, es gibt keine Audiodateien. Sie wechselt mit der Lage: ruhig im Büro, treibend bei Verwaltung und Training, angespannt bei Verhandlung und Spielvorbereitung, schnell im Live-Spiel. Sie startet nach dem ersten Klick.</p></section>`}
/* Beim Laden: War Musik an, startet sie mit dem ersten Klick oder Tastendruck */
if(typeof window!=='undefined'&&window.addEventListener){
  const go=()=>{try{if(musPref().on)musStart()}catch(e){}};
  window.addEventListener('pointerdown',go,{once:true});window.addEventListener('keydown',go,{once:true});
  document.addEventListener('visibilitychange',()=>{try{if(!MCTX)return;if(document.hidden)MCTX.suspend();else if(musPref().on)MCTX.resume()}catch(e){}})}
