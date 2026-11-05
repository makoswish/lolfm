/* ===== Taktik ===== */
/* ===== Taktik-System ===== */
const PROLE={
 TOP:{tank:['Tank','Frontline in Teamfights, schützt die Carrys.',['pos','tw','sta'],[-.5,.5,1.2]],carry:['Carry','Gewinnt die Lane und trägt das Spiel.',['mec','lan','frm'],[1,.5,.3]],split:['Splitpusher','Drückt die Seitenlane und bindet Gegner.',['lan','dec','ant'],[.3,1,.5]]},
 JGL:{gank:['Ganker','Frühe Ganks auf allen Lanes.',['ant','mec','dec'],[1.5,.3,-.3]],farm:['Farmer','Farmt viel und skaliert ins Lategame.',['frm','gs','pos'],[-.5,.5,1.2]],vis:['Vision-Jungler','Kontrolliert Karte und Objectives.',['vis','gs','com'],[.2,1.2,.4]]},
 MID:{roam:['Roamer','Hilft früh auf den Seitenlanes.',['dec','ant','com'],[.8,1,0]],dom:['Lane-Dominator','Gewinnt die Midlane hart.',['lan','mec','frm'],[1.4,.3,0]],ctrl:['Control-Mage','Kontrolliert Teamfights aus der zweiten Reihe.',['pos','pre','gs'],[-.3,.6,1.1]]},
 ADC:{hyper:['Hypercarry','Im Lategame der stärkste Spieler.',['frm','pos','pre'],[-.6,.4,1.5]],bully:['Lane-Bully','Macht früh Druck auf der Botlane.',['lan','mec','pre'],[1.3,.4,-.2]],util:['Utility','Spielt für das Team statt für sich.',['tw','pos','dec'],[.2,.8,.6]]},
 SUP:{eng:['Engager','Startet die Kämpfe.',['dec','nrv','ant'],[.5,.8,.6]],ench:['Enchanter','Schützt und verstärkt die Carrys.',['pos','tw','vis'],[.2,.5,1]],roam:['Roamer','Wandert über die Karte und setzt Vision.',['vis','ant','com'],[1,.8,-.1]]}
};
const TEMPO={low:['Ruhig',[-1,0,.8],.85,'Weniger Kämpfe, dafür sauberes Lategame.'],mid:['Normal',[0,0,0],1,'Ausgewogenes Tempo.'],high:['Hoch',[1.5,.3,-1],1.2,'Viele frühe Kämpfe, schwächer im Lategame.']};
const VISION={low:['Wenig',[.4,-.6,-.4],0,'Mehr Fokus aufs Laning, schlechtere Kartenkontrolle.'],mid:['Normal',[0,0,0],0,'Standard-Vision.'],high:['Viel',[-.4,.8,.4],.4,'Bessere Objectives und Mitte, etwas schwächeres Laning.']};
const OBJF={drake:['Drachen',{d:.8,b:-.4},'Priorität auf Drachen und Seele.'],bal:['Ausgewogen',{d:0,b:0},'Keine besondere Priorität.'],baron:['Herold & Baron',{d:-.4,b:.8},'Priorität auf Topside, Herold und Baron.']};
const CARRY={none:'Verteilt',TOP:'Top',MID:'Mid',ADC:'ADC'};
function suit(p,pos,pr){const a=PROLE[pos][pr][2];return a.reduce((s,x)=>s+p.d[x],0)/a.length}
function bestRole(p,pos){pos=pos||p.role;let b=null,bs=-1;for(const k in PROLE[pos]){const v=suit(p,pos,k);if(v>bs){bs=v;b=k}}return b}
function defTac(T,name){const roles={};for(const r of ROLES)roles[r]=bestRole(S.players[T.starters[r]],r);return{name:name||'A',style:T.style||pick(SK),focus:T.focus||'MID',tempo:'mid',vision:'mid',obj:'bal',carry:'none',roles,fam:75}}
function aiTac(T){const t=defTac(T);t.tempo=pick(['low','mid','mid','high']);t.vision=pick(['low','mid','high']);t.obj=pick(['drake','bal','baron']);
  const best=['TOP','MID','ADC'].sort((a,b)=>ovr(S.players[T.starters[b]])-ovr(S.players[T.starters[a]]))[0];t.carry=R()<.6?best:'none';t.style=T.style;t.focus=T.focus;return t}
function tacOf(T){if(T.id===S.user&&S.tacs)return S.tacs[S.tacA];if(!T.tac)T.tac=aiTac(T);return T.tac}
function applyTac(){const U=S.teams[S.user],t=S.tacs[S.tacA];U.style=t.style;U.focus=t.focus}
function roleFit(p,pos,pr){return clamp((suit(p,pos,pr)-10)/5,-1,1.5)}
function tacMods(T){const tac=tacOf(T),x={e:0,m:0,l:0};
  for(const r of ROLES){const p=S.players[T.starters[r]],pr=PROLE[r][tac.roles[r]]?tac.roles[r]:bestRole(p,r),f=roleFit(p,r,pr),md=PROLE[r][pr][3];x.e+=md[0]*.5*f;x.m+=md[1]*.5*f;x.l+=md[2]*.5*f}
  const tp=TEMPO[tac.tempo][1],vs=VISION[tac.vision][1];x.e+=tp[0]+vs[0];x.m+=tp[1]+vs[1];x.l+=tp[2]+vs[2];
  const fm=clamp((famOf(tac)-70)/15,-4,2);x.e+=fm;x.m+=fm;x.l+=fm;return x}
const FW={style:3,tempo:1,vision:1,obj:1,carry:1,focus:.5};
function tKeys(t){const o=Object.keys(FW).map(k=>[k+':'+t[k],FW[k]]);for(const r of ROLES)o.push(['role:'+r+':'+t.roles[r],1]);return o}
function know(k){if(!S.know)S.know={};return S.know[k]??30}
function famOf(t){if(!t)return 75;if(t!==S.tacs[0]&&t!==S.tacs[1]&&t!==S.tacs[2])return t.fam??75;const ks=tKeys(t);let a=0,w=0;for(const[k,x]of ks){a+=know(k)*x;w+=x}return a/w}
function famParts(t){return tKeys(t).filter(([k])=>know(k)<70).map(([k])=>{const p=k.split(':');return p[0]==='role'?`${RN[p[1]]}: ${PROLE[p[1]][p[2]][0]}`:p[0]==='style'?STYLES[p[1]].n:p[0]==='tempo'?'Tempo '+TEMPO[p[1]][0]:p[0]==='vision'?'Vision '+VISION[p[1]][0]:p[0]==='obj'?OBJF[p[1]][0]:p[0]==='carry'?'Carry '+CARRY[p[1]]:'Jungle '+FOCUS[p[1]]})}
function trainKnow(){const act=new Set(tKeys(S.tacs[S.tacA]).map(x=>x[0]));for(const k of act)S.know[k]=clamp(know(k)+8,0,100);for(const k in S.know)if(!act.has(k))S.know[k]=clamp(S.know[k]-.6,25,100)}
function initKnow(){S.know={};S.tacs.forEach((t,i)=>{for(const[k]of tKeys(t))S.know[k]=Math.max(S.know[k]||0,i===S.tacA?Math.max(80,t.fam||0):Math.max(45,t.fam||0))})}
function carryW(T,r){const c=tacOf(T).carry;return c==='none'?1:c===r?1.3:.925}
function editTac(k,v,role){const t=S.tacs[TACE];if(role){if(t.roles[role]===v)return;t.roles[role]=v}
  else{if(t[k]===v)return;t[k]=v}if(TACE===S.tacA)applyTac();save()}
function tacNotes(T){const tac=tacOf(T),n=[];
  for(const r of ROLES){const p=S.players[T.starters[r]],pr=tac.roles[r],s=suit(p,r,pr),b=bestRole(p,r);
    if(s<10)n.push(['bad',`${p.name} passt schlecht zur Rolle ${PROLE[r][pr][0]} (Eignung ${s.toFixed(1).replace('.',',')}).${b!==pr?` Besser: ${PROLE[r][b][0]}.`:''}`])}
  if(tac.carry!=='none'){const c=S.players[T.starters[tac.carry]],best=ROLES.map(r=>S.players[T.starters[r]]).sort((a,b)=>ovr(b)-ovr(a))[0];
    n.push(c.id===best.id?['good',`Ressourcen-Fokus auf ${c.name} passt, er ist dein stärkster Spieler.`]:['warn',`Ressourcen gehen an ${c.name}, dein stärkster Spieler ist aber ${best.name}.`])}
  if(tac.tempo==='high'&&tac.style==='SCL')n.push(['warn','Hohes Tempo und Scaling widersprechen sich.']);
  if(tac.tempo==='low'&&tac.style==='AGG')n.push(['warn','Ruhiges Tempo bremst den Early-Aggro-Stil.']);
  const fo=famOf(tac),fp=famParts(tac);if(fo<60)n.push(['bad',`Das Team kennt diese Taktik kaum (Vertrautheit ${Math.round(fo)}%).`]);else if(fo>=90)n.push(['good','Das Team beherrscht diese Taktik.']);
  if(fp.length)n.push(['warn',`Noch ungewohnt: ${fp.join(', ')}.`]);
  if(!n.length)n.push(['good','Keine Auffälligkeiten.']);return n}
function famBar(f){return `<div class="fam"><div class="bar"><i style="width:${f}%;background:${f>=80?'var(--good)':f>=55?'var(--warn)':'var(--bad)'}"></i></div><span class="mono">${Math.round(f)}%</span></div>`}
function tacticViewFull(){
  const U=S.teams[S.user],tr=S.training,t=S.tacs[TACE],act=TACE===S.tacA;
  const save0=S.tacA;S.tacA=TACE;const P=teamPower(U),lg=teamsOf(U.reg).filter(x=>x.id!==U.id).map(x=>teamPower(x)),avg=k=>lg.reduce((s,x)=>s+x[k],0)/lg.length,notes=tacNotes(U);S.tacA=save0;
  const seg=(k,obj,lab)=>`<div class="lab" style="margin:14px 0 6px"><span>${lab}</span><span>${obj[t[k]][3]||obj[t[k]][2]||''}</span></div><div class="seg">${Object.entries(obj).map(([v,o])=>`<button class="${t[k]===v?'on':''}" data-a="tset" data-k="${k}" data-v="${v}">${o[0]}</button>`).join('')}</div>`;
  const pb=(lbl,a,b)=>{const df=a-b;return `<div class="pbar"><span class="muted">${lbl}</span><div class="pb"><i style="width:${clamp(50+df*4,4,96)}%"></i></div><span class="mono ${df>.5?'good':df<-.5?'bad':''}">${df>0?'+':''}${df.toFixed(1).replace('.',',')}</span></div>`};
  return `<div class="pagehead"><div><h1>Taktik</h1><p>Drei Taktik-Slots. Die aktive Taktik spielt dein Team, Vertrautheit wächst mit jeder Woche.</p></div></div>
  <div class="grid"><section class="panel s12"><div class="tacslots">${S.tacs.map((x,i)=>`<button class="card ${TACE===i?'on':''}" data-a="tedit" data-v="${i}"><span class="tag">${i===S.tacA?'Aktiv':'Slot '+x.name}</span><b>Taktik ${x.name}: ${STYLES[x.style].n}</b><p>Tempo ${TEMPO[x.tempo][0]} · ${OBJF[x.obj][0]} · Carry ${CARRY[x.carry]}</p>${famBar(famOf(x))}</button>`).join('')}</div>
    ${act?'':`<div class="acts" style="margin-top:12px"><button class="btn" data-a="tact" data-v="${TACE}">Taktik ${t.name} aktivieren</button><button class="btn ghost" data-a="tcopy" data-v="${TACE}">Aktive Taktik hierher kopieren</button></div>`}</section>
  <section class="panel s12"><div class="lab"><span>Spielstil · Taktik ${t.name}</span><span>Aggro schlägt Scaling, Scaling schlägt Teamfight, Teamfight schlägt Objective, Objective schlägt Aggro</span></div>
   <div class="cards">${SK.map(k=>`<button class="card ${t.style===k?'on':''}" data-a="tset" data-k="style" data-v="${k}"><b>${STYLES[k].n}</b><p>${STYLES[k].d}</p><span class="tag mono">Früh ${sgn(STYLES[k].mod[0])} · Mitte ${sgn(STYLES[k].mod[1])} · Spät ${sgn(STYLES[k].mod[2])}</span></button>`).join('')}</div></section>
  <section class="panel s6"><div class="lab">Teamanweisungen</div>
   ${seg('tempo',TEMPO,'Tempo')}${seg('vision',VISION,'Vision')}${seg('obj',OBJF,'Objective-Priorität')}
   <div class="lab" style="margin:14px 0 6px"><span>Ressourcen-Fokus</span><span>Wer bekommt Gold und Farm</span></div><div class="seg">${Object.entries(CARRY).map(([v,l])=>`<button class="${t.carry===v?'on':''}" data-a="tset" data-k="carry" data-v="${v}">${l}</button>`).join('')}</div>
   <div class="lab" style="margin:14px 0 6px"><span>Jungle-Fokus</span><span>Wo der Jungler früh Druck macht</span></div><div class="seg">${Object.keys(FOCUS).map(k=>`<button class="${t.focus===k?'on':''}" data-a="tset" data-k="focus" data-v="${k}">${FOCUS[k]}</button>`).join('')}</div></section>
  <section class="panel s6"><div class="lab"><span>Analyse</span><span>gegen Ø ${U.reg}</span></div>${pb('Früh',P.e,avg('e'))}${pb('Mitte',P.m,avg('m'))}${pb('Spät',P.l,avg('l'))}
   <div class="lab" style="margin-top:14px">Vertrautheit</div>${famBar(famOf(t))}<p class="muted" style="font-size:13px;margin:6px 0 0">Das Team lernt jede Einstellung einzeln. Was die aktive Taktik nutzt, wird jede Woche vertrauter. Ungenutzte Einstellungen werden nur ganz langsam vergessen. Ein Wechsel auf schon bekannte Einstellungen kostet nichts.</p>
   <div class="lab" style="margin-top:14px">Hinweise des Co-Trainers</div><ul class="reasons">${notes.map(([c,x])=>`<li class="${c}">${x}</li>`).join('')}</ul></section>
  <section class="panel s12"><div class="lab"><span>Spielerrollen</span><span>Eignung aus den Attributen (1-20)</span></div>
   ${ROLES.map(r=>{const p=S.players[U.starters[r]];return `<div class="drow"><div class="dl">${chip(r)}<span class="nmcell">${p.name}</span></div><div class="dchs">${Object.entries(PROLE[r]).map(([k,o])=>{const s=suit(p,r,k);
     return `<button class="chb ${t.roles[r]===k?'on':''}" data-a="trole" data-r="${r}" data-v="${k}" title="${o[1]}"><b>${o[0]}</b><span><span class="av ${dcls(s)}" style="font-size:12px">${s.toFixed(1).replace('.',',')}</span> · ${o[2].map(x=>DSHORT[x]).join('/')}</span></button>`}).join('')}</div></div>`}).join('')}
   <p class="muted" style="font-size:13px;margin:10px 0 0">Gute Eignung (ab 13) verstärkt die Wirkung der Rolle, schlechte Eignung (unter 10) dreht sie ins Negative.</p></section>
  <section class="panel s12"><div class="lab"><span>Patch ${S.year-2000}.${S.patch||1} · Meta</span><span>★ im Draft = Bonus</span></div>
   <div class="metagrid">${ROLES.map(r=>`<div><div class="lab" style="margin-bottom:4px">${RN[r]}</div>${CHR[r].filter(isMeta).map(c=>`<div style="font-size:14px">${CH[c][0]} <span class="tagc t-${CH[c][6]}">${CH[c][6]}</span></div>`).join('')||'<span class="dim" style="font-size:13px">keine</span>'}</div>`).join('')}</div></section>
  <!--TRAIN-->${trainPanel()}${mentorPanel()}
  <section class="panel s6"><div class="lab"><span>Einzeltraining</span><span>Tippe einen Spieler</span></div>
   ${U.roster.map(i=>S.players[i]).sort((a,b)=>ROLES.indexOf(a.role)-ROLES.indexOf(b.role)).map(p=>{const l=S.trainLog.find(x=>x.id===p.id);return `<button class="row" style="grid-template-columns:46px minmax(0,1fr) auto" data-a="player" data-id="${p.id}" data-tab="entw"><span>${chip(p.role)}</span><span style="min-width:0"><div class="nm">${p.name}</div><div class="sub">${p.ifoc?'Fokus: '+DN[p.ifoc]:'kein Einzelfokus'}${l&&l.gains&&l.gains.length?' · '+l.gains.map(([x,v])=>`${DN[x]} +${String(v).replace('.',',')}`).join(', '):''}</div></span><span class="mono ${l&&l.d>0?'good':'dim'}">${l&&l.d>0?'+'+l.d:''}</span></button>`}).join('')}</section></div>`;
}
