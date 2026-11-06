/* ===== Sprache: Deutsch (Original) und Englisch =====
   Das Spiel ist auf Deutsch geschrieben. Englisch entsteht nach dem Zeichnen: Jeder Text im DOM läuft durch tx().
   Quellen: Wörterbuch EN1/EN2/EN3 (Zeilen "Deutsch=>Englisch", {} steht für Zahlen), dazu Muster für Sätze mit Namen.
   Was nicht im Wörterbuch steht, bleibt Deutsch und landet in I18N.miss (zum Nachpflegen). */
let LANG='de';try{if(localStorage.getItem('riftmgr_lang')==='en')LANG='en'}catch(e){}
const I18N={map:null,cache:new Map(),miss:new Set()};
function i18nInit(){if(I18N.map)return;const m=new Map();
  for(const src of [typeof EN1!=='undefined'?EN1:'',typeof EN2!=='undefined'?EN2:'',typeof EN3!=='undefined'?EN3:''])
    for(const line of src.split('\n')){const i=line.indexOf('=>');if(i>0)m.set(line.slice(0,i),line.slice(i+2))}
  I18N.map=m}
const SPL={Winter:'Winter',Frühjahrs:'Spring',Sommer:'Summer'};
const DRG={Berg:'Mountain',Feuer:'Infernal',Ozean:'Ocean',Wolken:'Cloud'};
/* Zahlen: deutsche Schreibweise (1.234,5) wird englisch (1,234.5) */
function enNum(s){const m=s.match(/^(\d{1,3}(?:\.\d{3})+)(?:,(\d+))?$/);if(m)return m[1].replace(/\./g,',')+(m[2]?'.'+m[2]:'');if(/^\d+,\d+$/.test(s))return s.replace(',','.');return s}
const NUMRE=/\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+,\d+/g;
function enMoney(s){return s.replace(/(\d[\d.,]*)\s?Mio\. €/g,(m,n)=>'€'+enNum(n)+'M').replace(/(\d[\d.,]*)k €/g,(m,n)=>'€'+enNum(n)+'k').replace(/(\d[\d.,]*) €/g,(m,n)=>'€'+enNum(n))}
function tp(s){const o=core(s);return o==null?s:o}
const ABB={Mec:'Mec',Trd:'Trd',CS:'CS',Wel:'Wav',Sks:'Sks',Spa:'Spa',Mak:'Mac',Vis:'Vis',Trk:'Trk',Obj:'Obj',Ent:'Dec',Pos:'Pos',Eng:'Eng',Tea:'Tea',Kom:'Com',Sho:'Sho',Rea:'Rea',Nrv:'Nrv',Kon:'Foc',Kst:'Con',Bel:'Res'};
const SPN={'Promo-Stream mit zwei Spielern':'promo stream with two players','Werbedreh für Social Media':'ad shoot for social media'};
const PAT=[
 [/^Dünn besetzt: (.+)$/,m=>`Thin squad: ${m[1]}`],
 [/^· ((?:Mec|Trd|CS|Wel|Sks|Spa|Mak|Vis|Trk|Obj|Ent|Pos|Eng|Tea|Kom|Sho|Rea|Nrv|Kon|Kst|Bel)(?:\/(?:Mec|Trd|CS|Wel|Sks|Spa|Mak|Vis|Trk|Obj|Ent|Pos|Eng|Tea|Kom|Sho|Rea|Nrv|Kon|Kst|Bel))*)$/,m=>'· '+m[1].split('/').map(a=>ABB[a]||a).join('/')],
 [/^(\w{2,4}) gewinnt$/,m=>`${m[1]} wins`],
 [/^(.+?) wünscht sich einen (Promo-Stream mit zwei Spielern|Werbedreh für Social Media)\. Das bringt (.+?), kostet die Starter aber etwas Moral und Form\. Lehnst du ab, sinkt die Zufriedenheit des Partners\.$/,m=>`${m[1]} would like a ${SPN[m[2]]}. It brings ${tp(m[3])}, but costs the starters a little morale and form. If you decline, the partner's satisfaction drops.`],
 [/^(.+?) gewinnt den (Winter|Frühjahrs|Sommer)-Split der (\w+)\.$/,m=>`${m[1]} wins the ${SPL[m[2]]} Split of the ${m[3]}.`],
 [/^(.+?) gewinnt den (Winter|Frühjahrs|Sommer)-Split\. Dein Team wird (\d+)\. Preisgeld (.+)$/,m=>`${m[1]} wins the ${SPL[m[2]]} Split. Your team finishes ${m[3]}. Prize money ${tp(m[4])}`],
 [/^(.+?) \((\w+)\) gewinnt (First Stand|MSI|Worlds) (\d+)$/,m=>`${m[1]} (${m[2]}) wins ${m[3]} ${m[4]}`],
 [/^(.+?) aus der (\w+) gewinnt (First Stand|MSI|Worlds) (\d+)$/,m=>`${m[1]} from the ${m[2]} wins ${m[3]} ${m[4]}`],
 [/^(.+?) steckt in der Krise: Die Stimmung im Team ist am Boden\.$/,m=>`${m[1]} is in crisis: team spirit is on the floor.`],
 [/^(.+?) entlässt den Trainer\. Der Nachfolger setzt auf (.+)\.$/,m=>`${m[1]} sacks the coach. His successor goes for ${tp(m[2])}.`],
 [/^Investoren übernehmen (.+?)\. Der Verein plant größer\.$/,m=>`Investors take over ${m[1]}. The club is planning bigger.`],
 [/^Skandal bei (.+?): (.+?) sorgt mit Aussagen im Netz für Ärger\.$/,m=>`Scandal at ${m[1]}: ${m[2]} causes trouble with statements online.`],
 [/^Überraschung: (.+?) schlägt (.+)\.$/,m=>`Upset: ${m[1]} beat ${m[2]}.`],
 [/^(.+?) führt die (\w+) mit (\d+)-(\d+) an und hat vier Spiele in Folge gewonnen\.$/,m=>`${m[1]} lead the ${m[2]} at ${m[3]}-${m[4]} and have won four games in a row.`],
 [/^Verletzung: (.+)$/,m=>`Injury: ${m[1]}`],
 [/^(.+?) \((.+?)\) fällt wegen (.+?) (\d+) Wochen? aus\. Ein Reha-Programm kostet (.+?) und verkürzt die Pause um eine Woche\.$/,m=>`${m[1]} (${m[2]}) is out for ${m[4]} weeks with ${m[3]}. A rehab programme costs ${tp(m[5])} and shortens the break by one week.`],
 [/^(.+?) empfiehlt (.+?) \((.+?)\): (.+)\.$/,m=>`${m[1]} recommends ${m[2]} (${m[3]}): ${tp(m[4])}.`],
 [/^Sofort eine Verstärkung$/,()=>'An immediate upgrade'],
 [/^Spannende Perspektive$/,()=>'Exciting prospect'],[/^Solider Ersatz$/,()=>'Solid backup'],[/^Kein Bedarf$/,()=>'No need'],
 [/^Bild von (.+)$/,m=>`Picture of ${m[1]}`],
 [/^Ablöse an (.+)$/,m=>`Transfer fee to ${m[1]}`],
 [/^Bans von (.+)$/,m=>`Bans by ${m[1]}`],
 [/^Vertrag mit (.+)$/,m=>`Contract with ${m[1]}`],
 [/^Scouting: (.+)$/,m=>`Scouting: ${m[1]}`],
 [/^Anfrage von (.+)$/,m=>`Request from ${m[1]}`],
 [/^gegen (.+)$/,m=>`vs ${m[1]}`],
 [/^(.+?) gegen (.+)$/,m=>`${m[1]} vs ${m[2]}`],
 [/^Streit zwischen (.+?) und (.+)$/,m=>`Row between ${m[1]} and ${m[2]}`],
 [/^(.+?) und (.+?) verstehen sich blind$/,m=>`${m[1]} and ${m[2]} understand each other blindly`],
 [/^(.+?) und (.+?) spielen auch nach dem Training zusammen Ranked\. Das Duo funktioniert\.$/,m=>`${m[1]} and ${m[2]} also play ranked together after training. The duo works.`],
 [/^Nach einer Niederlage geraten (.+?) und (.+?) im Voice-Chat aneinander\. Das Team ist angespannt\.$/,m=>`After a defeat ${m[1]} and ${m[2]} clash in voice chat. The team is tense.`],
 [/^Spieler des Spiels: (.+?) \((.+?), Note (.+?)\) · (\d+) Minuten$/,m=>`Player of the match: ${m[1]} (${m[2]}, rating ${m[3].replace(',','.')}) · ${m[4]} minutes`],
 [/^· MVP (.+)$/,m=>`· MVP ${m[1]}`],
 [/^(.+?), Shotcalling (\d+) \(vom Team bestimmt\)$/,m=>`${m[1]}, shotcalling ${m[2]} (chosen by the team)`],
 [/^(.+?) schaltet den Erfolg "(.+?)" frei\.$/,m=>`${m[1]} unlocks the achievement "${tp(m[2])}".`],
 [/^Deine Spiele laufen ohne Draft durch, mit Aufstellung und aktiver Taktik wie eingestellt\. Nächstes Spiel: (.+?) \(Bo(\d+)\)\.$/,m=>`Your games run without a draft, with the line-up and active tactic as set. Next match: ${m[1]} (Bo${m[2]}).`],
 [/^Die Presse tippt (.+?) als Favoriten, dahinter (.+?) und (.+?)\. Geheimtipp: (.+?)\. Wackelkandidat: (.+?)\.?$/,m=>`The press tips ${m[1]} as favourites, followed by ${m[2]} and ${m[3]}. Dark horse: ${m[4]}. Shaky side: ${m[5]}.`],
 [/^Der Vorstand der (.+?) erwartet im Sommer-Split Platz (\d+) in der (\w+) oder besser\. Budget: (.+?)\. (.*)$/,m=>`The board of ${m[1]} expects place ${m[2]} in the ${m[3]} or better in the Summer Split. Budget: ${tp(m[4])}. ${tp(m[5])}`],
 [/^Der Vorstand hat (.+?) als (Hauptsponsor|Hardware-Partner) unter Vertrag genommen \(Festbetrag (.+?) pro Woche bis Saisonende\)\.$/,m=>`The board has signed ${m[1]} as ${m[2]==='Hauptsponsor'?'main sponsor':'hardware partner'} (fixed fee ${tp(m[3])} per week until season end).`],
 [/^Berater von (.+?): Wir erwarten etwa (.+?) pro Woche über (\d+) Saisons? und eine Rolle als (.+?)\.(.*)$/,m=>`Agent of ${m[1]}: We expect about ${tp(m[2])} per week over ${m[3]} seasons and a role as ${tp(m[4])}.${tp(m[5].trim())?' '+tp(m[5].trim()):''}`],
 [/^(.+?): Einverstanden\. Jetzt müsst ihr euch nur noch mit dem Spieler einigen\.$/,m=>`${m[1]}: Agreed. Now you only need to come to terms with the player.`],
 [/^(.+?): Wir hören uns das an\. Unsere Vorstellung liegt bei rund (.+?)\.$/,m=>`${m[1]}: We will hear you out. Our idea is around ${tp(m[2])}.`],
 [/^(.+?): Zu wenig\. Unter (.+?) geben wir ihn nicht ab\.(.*)$/,m=>`${m[1]}: Too little. We will not let him go for less than ${tp(m[2])}.${m[3]?' That is our last word.':''}`],
 [/^Angebot: (.+?)( in zwei Raten| sofort)(.*)$/,m=>`Offer: ${tp(m[1])}${m[2].includes('Raten')?' in two instalments':' now'}${m[3]?', '+tp(m[3].replace(/^[.,]\s*/,'')):''}`],
 [/^Hotfix verändert das Meta: (.+?) und (.+?) im Fokus\.$/,m=>`Hotfix changes the meta: ${tp(m[1])} and ${tp(m[2])} in focus.`],
 [/^Patch (\d+)\.(\d+): (.+?) und (.+?) im Fokus$/,m=>`Patch ${m[1]}.${m[2]}: ${tp(m[3])} and ${tp(m[4])} in focus`],
 [/^Der Entwickler ändert das Meta mitten im Split\. Neu im Meta: (.+?)\. Raus: (.+?)\. Stil-Meta: (.+?)(?: \(vorher (.+?)\))?, Rollen-Meta: (.+?)\.$/,m=>`The developer changes the meta mid-split. New in the meta: ${m[1]}. Out: ${m[2]}. Style meta: ${tp(m[3])}${m[4]?' (previously '+tp(m[4])+')':''}, role meta: ${tp(m[5])}.`],
 [/^Neuer Patch zum Split\. Meta-Champions: (.+?)\. Meta-Picks geben im Draft einen Bonus\.$/,m=>`New patch for the split. Meta champions: ${m[1]}. Meta picks give a bonus in the draft.`],
 [/^Patch (\d+)\.(\d+)$/,m=>`Patch ${m[1]}.${m[2]}`],
 [/^(\d+)' (.+)$/,m=>`${m[1]}' ${evt(m[2])}`],
 [/^(\d+)\. (.+)$/,m=>m[2]===m[2]&&core(m[2])!=null?`${m[1]}. ${core(m[2])}`:null],
];
function evt(s){let m;
  if(m=s.match(/^(.+?) erlegt den Baron\.$/))return `${m[1]} slays the Baron.`;
  if(m=s.match(/^(.+?) setzt den Herold ein und reißt einen Turm\.$/))return `${m[1]} uses the Herald and takes a tower.`;
  if(m=s.match(/^(.+?) sichert den (Berg|Feuer|Ozean|Wolken)-Drachen \((.+?)\)\.$/))return `${m[1]} secures the ${DRG[m[2]]} dragon (${m[3]}).`;
  if(m=s.match(/^(.+?) zerstört einen (Außen|Innen)turm auf der (Top|Mid|Bot)lane\.$/))return `${m[1]} destroys an ${m[2]==='Außen'?'outer':'inner'} tower in the ${m[3].toLowerCase()} lane.`;
  if(m=s.match(/^(.+?) zerstört den Nexus\. Sieg nach (\d+) Minuten\.$/))return `${m[1]} destroys the Nexus. Victory after ${m[2]} minutes.`;
  if(m=s.match(/^Teamfight: (.+?) gewinnt (\d+) zu (\d+)$/))return `Teamfight: ${m[1]} wins ${m[2]} to ${m[3]}`;
  if(m=s.match(/^First Blood! (.+?) erwischt (.+?)\.$/))return `First Blood! ${m[1]} catches ${m[2]}.`;
  if(m=s.match(/^Drachenseele für (.+?)! (.+)$/))return `Dragon soul for ${m[1]}! ${tp(m[2])}`;
  return tp(s)}
function core(t){
  const nums=[];const key=t.replace(/\d[\d.,]*/g,x=>{nums.push(x);return '{}'});
  let out=I18N.map.get(key);
  if(out!=null){let i=0;return out.replace(/\{\}/g,()=>nums[i++]==null?'':nums[i-1])}
  for(const [re,fn] of PAT){const m=t.match(re);if(m){const r=fn(m);if(r!=null)return r}}
  if(t.includes(' · ')){const parts=t.split(' · ');let hit=false;const o=parts.map(p=>{const x=core(p);if(x!=null){hit=true;return x}return p});if(hit)return o.join(' · ')}
  if(t.includes(' – ')){const parts=t.split(' – ');let hit=false;const o=parts.map(p=>{const x=core(p);if(x!=null){hit=true;return x}return p});if(hit)return o.join(' – ')}
  return null}
function tx(s){if(LANG!=='en')return s;i18nInit();
  const c=I18N.cache.get(s);if(c!=null)return c;
  const t=s.replace(/\s+/g,' ').trim();let out=s;
  if(t&&/^[\d.,\s%+\-−]+$/.test(t))out=s.replace(t,()=>t.replace(NUMRE,enNum));
  else if(t&&/[A-Za-zÄÖÜäöüß€]/.test(t)){const r=core(t);
    if(r!=null)out=s.replace(t,()=>enMoney(r).replace(NUMRE,enNum));
    else{if(/[A-Za-zÄÖÜäöüß]{3,}/.test(t)&&I18N.miss.size<4000)I18N.miss.add(t.replace(/\d[\d.,]*/g,'{}'));out=/€/.test(s)?enMoney(s):s}}
  if(I18N.cache.size>6000)I18N.cache.clear();I18N.cache.set(s,out);return out}
function i18nApply(root){if(LANG!=='en'||typeof document==='undefined')return;i18nInit();const r=root||document.body;if(!r)return;
  try{const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentNode&&n.parentNode.nodeName;return p==='SCRIPT'||p==='STYLE'||p==='TEXTAREA'?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
    let n;const nodes=[];while(n=w.nextNode())nodes.push(n);
    for(const x of nodes){const v=x.nodeValue;if(v&&v.trim()){const t=tx(v);if(t!==v)x.nodeValue=t}}
    const els=r.querySelectorAll?r.querySelectorAll('[title],[placeholder],[aria-label]'):[];
    for(const e of els)for(const a of ['title','placeholder','aria-label']){const v=e.getAttribute(a);if(v){const t=tx(v);if(t!==v)e.setAttribute(a,t)}}
    if(r===document.body||(r.id==='app'))document.documentElement.lang='en'}catch(e){}}
/* Dasselbe für einen HTML-Text (Tests ohne DOM): Text zwischen Tags und die Attribute title, placeholder, aria-label */
function i18nHtml(h){if(LANG!=='en')return h;i18nInit();return h.replace(/>([^<>]+)</g,(m,t)=>'>'+tx(t)+'<').replace(/(title|placeholder|aria-label)="([^"]*)"/g,(m,a,v)=>a+'="'+tx(v)+'"')}
function setLang(l){LANG=l==='en'?'en':'de';try{localStorage.setItem('riftmgr_lang',LANG)}catch(e){}I18N.cache.clear();try{document.documentElement.lang=LANG}catch(e){}}
/* Texte der Optionen selbst: sie werden je nach Sprache direkt gewählt, nicht über das Wörterbuch */
function L(de,en){return LANG==='en'?en:de}
function optModal(){const p=musPref(),vol=Math.round(p.vol*100),snd=typeof SND!=='undefined'&&SND;
  return `<div class="ov" data-a="optclose"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="optt" style="max-width:480px">
  <h2 id="optt" style="font-size:26px">${L('Optionen','Options')}</h2>
  <div class="lab" style="margin:18px 0 8px"><span>${L('Sprache','Language')}</span></div>
  <div class="seg"><button class="${LANG==='de'?'on':''}" data-a="lang" data-v="de" >Deutsch</button><button class="${LANG==='en'?'on':''}" data-a="lang" data-v="en" >English</button></div>
  <div class="lab" style="margin:18px 0 8px"><span>${L('Musik','Music')}</span><b class="mono" id="optvol">${p.on?vol+' %':L('Aus','Off')}</b></div>
  <div class="rngr"><button class="btn ghost sm" data-a="musonoff" aria-label="${L('Musik an oder aus','Music on or off')}">${p.on?L('Aus','Off'):L('An','On')}</button><input type="range" data-mvol="1" min="0" max="100" step="5" value="${vol}" aria-label="${L('Lautstärke','Volume')}"></div>
  <p class="muted" style="font-size:12.5px;margin:6px 0 0">${L('Die Musik entsteht live im Browser und startet nach dem ersten Klick.','The music is generated live in the browser and starts after the first click.')}</p>
  <div class="lab" style="margin:18px 0 8px"><span>${L('Töne im Live-Spiel','Live match sounds')}</span></div>
  <div class="seg"><button class="${snd?'on':''}" data-a="optsnd" data-v="1">${L('An','On')}</button><button class="${snd?'':'on'}" data-a="optsnd" data-v="0">${L('Aus','Off')}</button></div>
  <div class="lab" style="margin:18px 0 8px"><span>${L('Skalierung','Scale')}</span><span>${Math.round(uiScale()*100)} %</span></div>
  <div class="seg">${UISC.map(([v,l])=>`<button class="${uiPref()===v?'on':''}" data-a="uisc" data-v="${v}">${v==='auto'?L('Automatisch','Automatic'):l}</button>`).join('')}</div>
  <div class="acts" style="margin-top:22px"><button class="btn" data-a="optclose">${L('Fertig','Done')}</button></div></div></div>`}
function optBtn(){return `<button class="btn ghost sm optb" data-a="opt" title="Optionen" aria-label="Optionen"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/></svg></button>`}
