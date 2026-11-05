/* ===== Trainerstab ===== */
const SROLE={hc:['Head Coach',1],ac:['Assistenztrainer',2],an:['Analyst',1],yc:['Jugendtrainer',1]};
const SATTR={tech:'Technik-Training',tac:'Taktik & Makro',ment:'Mentales Training',youth:'Jugendarbeit',mot:'Motivation',ana:'Analyse'};
const SFOC={hc:['tech','tac','ment','mot'],ac:['tech','tac','ment'],an:['ana','tac'],yc:['youth','tech','ment']};
function genStaff(role,q){const a={};for(const k in SATTR)a[k]=clamp(Math.round(q*.6+gauss()*2.5),1,20);for(const k of SFOC[role])a[k]=clamp(Math.round(q+gauss()*2),1,20);
  const main=SFOC[role].reduce((s,k)=>s+a[k],0)/SFOC[role].length,wage=r100(Math.max(300,(main-5)**2*28));
  return{id:'st'+(S.nextId++),role,name:genRealName(pick(['DE','KR','FR','ES','EN','DK','SE','CN','BR','PL'])),age:ri(26,52),a,wage,fee:r1000(wage*8),contract:ri(1,3)}}
function staffOf(role){return(S.staffs||[]).filter(s=>s.role===role)}
function bestA(roles,k){let b=0;for(const s of S.staffs||[])if(roles.includes(s.role))b=Math.max(b,s.a[k]);return b||6}
function syncStaff(){S.staff=S.staff||{};S.staff.coach=clamp(Math.round(bestA(['hc','ac'],'tech')/4),1,5);S.staff.analyst=clamp(Math.round(bestA(['an'],'ana')/4),1,5)}
function staffWages(){return(S.staffs||[]).reduce((a,s)=>a+s.wage,0)}
function initStaff(){if(S.staffs)return;const c=(S.staff&&S.staff.coach)||1,an=(S.staff&&S.staff.analyst)||1;S.staffs=[genStaff('hc',6+c*2.4),genStaff('an',6+an*2.4)];S.staffs.forEach(s=>s.fee=0);newStaffPool();syncStaff()}
function newStaffPool(){const rep=S.teams[S.user].rep;S.staffPool=Object.keys(SROLE).flatMap(r=>[genStaff(r,ri(7,11)+rep/20),genStaff(r,ri(10,14)+rep/25),genStaff(r,ri(12,17))])}
function motBonus(){return(bestA(['hc'],'mot')-10)*.08}

/* ===== Trainingsplan ===== */
const SES={soloq:{n:'Solo-Queue',d:'Mechanik, Trading, Farmen, Wellenkontrolle, Skillshots, Spacing, Reaktion',g:['mec','lan','frm','wav','pre','spc','rea'],c:'tech',load:4},
  scrim:{n:'Scrims',d:'Teamplay unter Spielbedingungen: Positionierung, Engage, Objectives, Entscheidungen. Stärkt die Taktik-Vertrautheit.',g:['pos','eng','obj','tw','dec','com'],c:'tac',load:6,fam:2.5},
  vod:{n:'VOD-Analyse',d:'Makro, Vision-Kontrolle, Tracking, Objectives, Entscheidungen',g:['gs','vis','ant','obj','dec'],c:'tac',load:2,fam:1},
  team:{n:'Kommunikation',d:'Teamwork, Kommunikation, Shotcalling, Engage',g:['tw','com','lead','eng'],c:'ment',load:3},
  mind:{n:'Mentaltraining',d:'Konzentration, Nervenstärke, Belastbarkeit, Reaktion',g:['con','nrv','sta','rea'],c:'ment',load:1},
  champ:{n:'Champion-Pool',d:'Meisterschaft der Haupt-Champions, neue Champions lernen',g:[],c:'tech',load:3},
  rest:{n:'Erholung',d:'+3 Form, +1 Moral, baut Belastung ab',g:[],c:'ment',load:-12}};
const PLANS={bal:['soloq','scrim','vod'],tech:['soloq','soloq','champ'],mental:['vod','vod','scrim'],team:['scrim','team','team'],mind:['mind','team','rest'],rest:['rest','rest','vod']};
function sesCoach(ses,aca){if(aca){const y=bestA(['yc'],'youth');return Math.max(y,bestA(['hc'],SES[ses].c)*.7)}const k=SES[ses].c;return ses==='vod'?(bestA(['hc','ac'],'tac')+bestA(['an'],'ana'))/2:bestA(['hc','ac'],k)}
function mentQ(m){return(m.h.pro+m.d.lead+m.d.gs)/3}
function champTrain(p,G){if(!p.ch)return;for(const c of p.ch.slice(0,3))c[1]=clamp(c[1]+G*3,1,20);
  if(R()<.08+G*.2&&p.ch.length<8){const pool=CHR[p.role].filter(c=>!p.ch.some(x=>x[0]===c)),meta=pool.filter(isMeta),nc=meta.length?pick(meta):pick(pool);if(nc!=null)p.ch.push([nc,7])}p.ch.sort((a,b)=>b[1]-a[1])}
function trainUser(T,aca){const plan=S.training.plan,int=S.training.intensity,ups=[];if(!aca)S.trainLog=[];
  for(const id of T.roster){const p=S.players[id],o=ovr(p),before=Object.assign({},p.d);
    if(isOut(p))continue;
    const room=clamp((p.pot-o)/8,0,1),prof=.7+p.h.pro/20*.6,mm=S.ment&&S.ment[id]&&S.players[S.ment[id]]?1+mentQ(S.players[S.ment[id]])/80:1,lf=1-Math.max(0,(p.load||0)-70)/100;
    let load=0,ptsTot=0;
    for(const ses of plan){const sd=SES[ses];load+=sd.load;if(ses==='rest'){p.form=clamp(p.form+3,30,100);p.morale=clamp(p.morale+1,20,100);continue}
      const G=(S.campBoost&&S.campBoost>=S.step&&!aca?1.3:1)*(.1+sesCoach(ses,aca)/4*.035)*(aca?1+.2*S.fin.infra.ac:tcF())*ageF(p)*hwF()*(!aca&&building('tc')?.9:1)*(int==='high'?1.45:1)*room*(.5+R())*prof*mm*lf/3,pts=G/5*2.6*DSCALE;ptsTot+=pts;
      if(ses==='champ'){champTrain(p,G);continue}
      const Gs=ses==='scrim'&&!aca?scrimF():1;
      const kw=keyW(p.role),tot=sd.g.reduce((s,x)=>s+kw[x]+.03,0);for(const x of sd.g)p.d[x]=clamp(p.d[x]+pts*Gs*(kw[x]+.03)/tot,1,20)}
    if(p.ifoc&&p.d[p.ifoc]!=null)p.d[p.ifoc]=clamp(p.d[p.ifoc]+ptsTot*.45,1,20);
    derive(p);
    const sf=1.3-p.d.sta/20*.6;p.load=clamp((p.load||20)+load*(int==='high'?1.4:1)*sf-(5+(p.load||20)*.15),0,100);
    p.form=clamp(p.form+(int==='high'?-2*sf:1)-(p.load>60?(p.load-60)/8:0)+(p.form<60?2:0),30,100);
    if(p.load>=85&&!p.loadWarn){p.loadWarn=true;if(!aca)mail('Überlastung',`${p.name} ist überlastet (Belastung ${Math.round(p.load)}). Form und Fortschritt leiden. Plane Erholung ein.`)}if(p.load<60)p.loadWarn=false;
    if(!aca){const g=DK.map(x=>[x,p.d[x]-before[x]]).filter(x=>x[1]>.004).sort((a,b)=>b[1]-a[1]);p.sg=p.sg||{};for(const[x,v]of g)p.sg[x]=(p.sg[x]||0)+v;S.trainLog.push({id:p.id,name:p.name,role:p.role,d:ovr(p)-o,gains:g.slice(0,3).map(([x,v])=>[x,+v.toFixed(2)])})}}
  if(!aca){const act=tKeys(S.tacs[S.tacA]).map(x=>x[0]);let fb=0;for(const ses of plan)fb+=SES[ses].fam||0;if(fb)for(const k of act)S.know[k]=clamp(know(k)+fb,0,100)}}
function mentorWeek(){if(!S.ment)return;for(const mid in S.ment){const me=S.players[mid],mo=S.players[S.ment[mid]];
  if(!me||!mo||!isMine(me)||!isMine(mo)){delete S.ment[mid];continue}
  const q=mentQ(mo);me.h.pro=clamp(me.h.pro+(mo.h.pro-me.h.pro)*.03,1,20);me.h.amb=clamp(me.h.amb+(mo.h.amb-me.h.amb)*.02,1,20);
  for(const x of['gs','dec','nrv','com','lead'])if(mo.d[x]>me.d[x])me.d[x]=clamp(me.d[x]+(mo.d[x]-me.d[x])*.012*q/10,1,20);derive(me);
  me.morale=clamp(me.morale+.5,20,100);
  if(mo.role===me.role&&mo.ch&&me.ch&&R()<.06){const c=mo.ch[0][0],e=me.ch.find(x=>x[0]===c);if(e)e[1]=clamp(e[1]+1,1,20);else if(me.ch.length<8)me.ch.push([c,8])}}}
function mentorOk(mo,me){return mo.id!==me.id&&mo.age>=22&&ovr(mo)>=ovr(me)&&Object.values(S.ment||{}).filter(x=>x===mo.id).length<2}

/* ===== Interface-Bausteine ===== */
function mailCat(t){return/Transfer|Angebot|Neuzugang|Vertrag|Klausel|Ablöse|verlässt|Weiterverkauf/.test(t)?'transfer':/Budget|Finanz|Kredit|Sponsor|Konto|Vorschuss|Vorstand|Rate|Anfrage von|Ziel erreicht|Ziel verfehlt|Treue Partner/.test(t)?'fin':/Scout/.test(t)?'scout':/Academy|Talent|hochgezogen/.test(t)?'youth':/Überlast|Versprechen|Trainer|Staff|Coach|Mentor|Streit|klagt|streamt|Bootcamp|Meetup|nächsten Schritt/.test(t)?'team':/Split|Stand|MSI|Worlds|Demacia|Saison|Playoffs|Patch|Meister|Turnier|Erfolg|Auszeichnung/.test(t)?'comp':'info'}
const MCAT={transfer:['Transfer','var(--blue)'],fin:['Finanzen','var(--brass)'],scout:['Scouting','#8FD3DA'],youth:['Nachwuchs','var(--good)'],team:['Team','#C3B0F0'],comp:['Wettbewerb','var(--red)'],info:['Info','var(--muted)']};
function staffTab(){const f=S.fin;
  const card=(s,mine)=>`<div class="stcard"><div class="sth"><div><b>${s.name}</b><span class="muted">${SROLE[s.role][0]} · ${s.age} J.${mine?` · Vertrag ${s.contract} ${s.contract===1?'Saison':'Saisons'}`:''}</span></div><span class="mono">${eurK(s.wage)}/Wo.</span></div>
    <div class="stat3">${Object.entries(SATTR).map(([k,n])=>`<div class="${SFOC[s.role].includes(k)?'key':''}"><span>${n}</span>${dbox(s.a[k])}</div>`).join('')}</div>
    <div class="acts" style="margin-top:8px">${mine?(s.role==='hc'&&staffOf('hc').length<=1?'':`<button class="btn danger sm" data-a="stfire" data-id="${s.id}">Entlassen (${eurK(s.wage*6)})</button>`):`<button class="btn sm" data-a="sthire" data-id="${s.id}" ${f.balance<s.fee||staffOf(s.role).length>=SROLE[s.role][1]&&s.role!=='hc'?'disabled':''}>${s.role==='hc'&&staffOf('hc').length?'Als neuen Head Coach holen':'Einstellen'} (${eurK(s.fee)})</button>`}</div></div>`;
  return `<section class="panel s12"><div class="lab"><span>Dein Trainerstab</span><span>Löhne ${eurK(staffWages())} pro Woche</span></div><div class="stgrid">${S.staffs.map(s=>card(s,true)).join('')}</div>
   <ul class="reasons" style="margin-top:12px"><li>Head Coach und Assistenten bestimmen, wie viel jede Trainingseinheit bringt: Technik für Solo-Queue und Champion-Pool, Taktik für Scrims und VOD-Analyse, Mentales für Kommunikation und Mentaltraining.</li><li>Motivation des Head Coaches hebt jede Woche die Moral und verstärkt Ansprachen.</li><li>Der Analyst bestimmt das Scouting der Gegner und gibt einen Bonus auf Makro und Teamfights.</li><li>Der Jugendtrainer trainiert die Academy.</li></ul></section>
  <section class="panel s12"><div class="lab"><span>Trainer auf dem Markt</span><span>neue Kandidaten zu jeder Saison</span></div>
   ${Object.keys(SROLE).map(r=>`<div class="lab" style="margin:12px 0 6px"><span>${SROLE[r][0]}</span><span>${staffOf(r).length}/${SROLE[r][1]}</span></div><div class="stgrid">${S.staffPool.filter(s=>s.role===r).map(s=>card(s,false)).join('')}</div>`).join('')}</section>`}
function dbox(v){return `<span class="av ${dcls(v)}">${v}</span>`}
function trainPanel(){const tr=S.training,U=S.teams[S.user],ps=U.roster.map(i=>S.players[i]);
  const avgL=Math.round(ps.reduce((a,p)=>a+(p.load||20),0)/ps.length),hi=ps.filter(p=>(p.load||0)>=70);
  return `<section class="panel s12"><div class="lab"><span>Wochenplan</span><span>3 Einheiten pro Woche</span></div>
   <div class="acts" style="gap:6px;margin-bottom:10px"><span class="muted" style="font-size:13px;align-self:center">Vorlagen:</span>${Object.entries({bal:'Ausgewogen',tech:'Technik',mental:'Spielverständnis',team:'Teamplay',mind:'Mindset',rest:'Regeneration'}).map(([k,l])=>`<button class="btn ghost sm" data-a="tplan" data-v="${k}">${l}</button>`).join('')}</div>
   <div class="plan">${tr.plan.map((ses,i)=>`<div class="pslot"><div class="lab" style="margin-bottom:6px"><span>Einheit ${i+1}</span><span>${SES[ses].n}</span></div><div class="seg">${Object.entries(SES).map(([k,v])=>`<button class="${ses===k?'on':''}" data-a="tses" data-i="${i}" data-v="${k}">${v.n}</button>`).join('')}</div><p class="muted" style="font-size:12.5px;margin:6px 0 0">${SES[ses].d}${ses==='rest'?'':` · Trainer: ${Math.round(sesCoach(ses,false))}/20`}</p></div>`).join('')}</div>
   <div class="grid" style="margin-top:12px"><div class="s6"><div class="lab" style="margin-bottom:8px">Intensität</div><div class="seg">${[['normal','Normal'],['high','Hoch (+45%, mehr Belastung)']].map(([k,l])=>`<button class="${tr.intensity===k?'on':''}" data-a="intens" data-v="${k}">${l}</button>`).join('')}</div></div>
    <div class="s6"><div class="lab" style="margin-bottom:8px"><span>Belastung im Kader</span><span>Ø ${avgL}</span></div>${bar(avgL,avgL>=70?'var(--bad)':avgL>=55?'var(--warn)':'var(--good)')}<p class="muted" style="font-size:12.5px;margin:6px 0 0">${hi.length?`Hoch belastet: ${hi.map(p=>p.name).join(', ')}. Über 70 sinken Fortschritt und Form.`:'Kein Spieler überlastet.'} Erholung baut Belastung ab, Belastbarkeit dämpft sie.</p></div></div></section>`}
function mentorPanel(){const U=S.teams[S.user],all=[...U.roster,...(aca()?aca().roster:[])].map(i=>S.players[i]),young=all.filter(p=>p.age<=21).sort((a,b)=>a.age-b.age),seniors=all.filter(p=>p.age>=22);S.ment=S.ment||{};
  return `<section class="panel s12"><div class="lab"><span>Mentoring</span><span>erfahrene Spieler betreuen Talente</span></div>
   ${young.length?young.map(p=>{const cur=S.ment[p.id]&&S.players[S.ment[p.id]];return `<div class="drow"><div class="dl">${chip(p.role)}<span class="nmcell">${p.name}</span><span class="dim" style="font-size:12px">${p.age} J. · Prof. ${p.h.pro>=15?'hoch':p.h.pro<=7?'niedrig':'mittel'}</span></div>
    <div class="dchs"><button class="chb ${cur?'':'on'}" data-a="ment" data-id="${p.id}" data-v=""><b>Kein Mentor</b><span>-</span></button>${seniors.filter(m=>mentorOk(m,p)||(cur&&cur.id===m.id)).map(m=>`<button class="chb ${cur&&cur.id===m.id?'on':''}" data-a="ment" data-id="${p.id}" data-v="${m.id}"><b>${m.name}</b><span>${m.role} · Eignung ${f1(mentQ(m))}</span></button>`).join('')}</div></div>`}).join(''):'<p class="empty">Keine Spieler bis 21 Jahre im Kader oder in der Academy.</p>'}
   <p class="muted" style="font-size:13px;margin:10px 0 0">Ein Mentor (ab 22 Jahren, mindestens so stark) überträgt Professionalität und Ehrgeiz, hebt Makro, Entscheidungen, Nerven, Kommunikation und Shotcalling und beschleunigt das Training. Auf gleicher Position gibt er auch Champions weiter. Eignung = Schnitt aus Professionalität, Shotcalling und Makro. Jeder Mentor betreut höchstens zwei Talente.</p></section>`}

/* ===== Kaderübersicht ===== */
function squadAll(){const U=S.teams[S.user],A=aca();return[...U.roster.map(i=>[S.players[i],'pro']),...(A?A.roster.map(i=>[S.players[i],'aca']):[])]}
/* Verträge: alle Spieler und Trainer nach Vertragsende, mit Verlängern direkt in der Zeile */
function contractsTab(){const all=[...squadAll(),...Object.values(S.players).filter(isLoanee).map(p=>[p,'loan'])].sort((a,b)=>a[0].contract-b[0].contract||(a[1]==='aca')-(b[1]==='aca')||ovr(b[0])-ovr(a[0]));
  const exp=all.filter(([p])=>p.contract<=1),wk=wkKey();
  const row=([p,k])=>{const end=S.year+p.contract-1,can=p.contract<=2,tried=p.tried===wk;
   const act=isLoanIn(p)?`<span class="dim">Leihe von ${S.teams[p.loan.from]?S.teams[p.loan.from].id:'-'}</span>`:!can?`<span class="dim">ab ${end-1}</span>`:tried?'<span class="dim">nächste Woche</span>':`<button class="btn sm ${p.contract<=1?'':'ghost'}" data-a="nego" data-t="renew" data-id="${p.id}">Verlängern</button>`;
   return `<tr class="${k==='aca'?'benchrow':''}"><td><span class="chip">${p.role}</span></td><td class="nmcell stick"><button class="linkbtn" data-a="player" data-id="${p.id}">${p.name}</button></td>
    <td>${k==='loan'?'Leihe':k==='aca'?'Academy':isStarter(p)?'<span class="good">Starter</span>':'Bank'}</td><td class="r">${p.age}</td><td class="r mono">${ovr(p)}</td>
    <td class="r">${end}${p.contract<=1?' <span class="warn">läuft aus</span>':''}</td><td class="r">${eurK(p.salary)}</td><td class="r">${can?eurK(demandFor(p,true)):'<span class="dim">-</span>'}</td><td class="r">${act}</td></tr>`};
  const st=(S.staffs||[]).slice().sort((a,b)=>a.contract-b.contract);
  return `<section class="panel s12"><div class="lab"><span>Spielerverträge</span><span class="${exp.length?'warn':''}">${exp.length?`${exp.length} ${exp.length===1?'läuft':'laufen'} am Saisonende aus`:'keiner läuft am Saisonende aus'}</span></div>
   <div class="scroll"><table class="tbl"><thead><tr><th></th><th class="stick">Spieler</th><th>Status</th><th class="r">Alter</th><th class="r">OVR</th><th class="r">bis</th><th class="r">Gehalt</th><th class="r">Forderung</th><th></th></tr></thead><tbody>${all.map(row).join('')}</tbody></table></div>
   <p class="muted" style="font-size:13px;margin:10px 0 0">Verlängern geht ab dem vorletzten Vertragsjahr. Die Forderung ist der Startwert des Beraters pro Woche. Gescheiterte Gespräche sind erst in der nächsten Woche wieder möglich.</p></section>
  ${st.length?`<section class="panel s12"><div class="lab"><span>Trainerverträge</span><span>verlängern sich nicht</span></div>
   <div class="scroll"><table class="tbl"><thead><tr><th>Trainer</th><th>Aufgabe</th><th class="r">Gehalt</th><th class="r">bis</th></tr></thead><tbody>
   ${st.map(s=>`<tr><td class="nmcell">${s.name}</td><td>${SROLE[s.role][0]}</td><td class="r">${eurK(s.wage)}</td><td class="r">${S.year+s.contract-1}${s.contract<=1?' <span class="warn">läuft aus</span>':''}</td></tr>`).join('')}</tbody></table></div>
   <p class="muted" style="font-size:13px;margin:10px 0 0">Trainer gehen am Vertragsende. Ersatz findest du unter Verein, Staff und Vorstand.</p></section>`:''}`}
function depthCard(p,kind){const o=ovr(p),end=S.year+p.contract-1,st=kind==='pro'&&isStarter(p);
  const tag=isOut(p)?`<span class="dtag" style="color:var(--bad)">${p.out.why==='Pause'?'Pause':'Ausfall'}</span>`:st?'<span class="dtag st">Starter</span>':kind==='aca'?'<span class="dtag ac">Academy</span>':'<span class="dtag">Bank</span>';
  return `<button class="dcard ${st?'is-st':''} ${kind==='aca'?'is-ac':''}" data-a="player" data-id="${p.id}">
   <div class="dch">${avatar(p,'sm')}<b>${p.name}</b>${tag}</div>
   <div class="dsub">${p.age} J. · ${p.nat}${isImp(p,S.teams[S.user].reg)?' <span class="warn">Import</span>':''} · bis ${end}${p.contract<=1?' <span class="warn">läuft aus</span>':''}</div>
   <div class="dst"><span class="muted">Aktuell</span>${stars(o)}<span class="mono">${o}</span></div>
   <div class="dst"><span class="muted">Potenzial</span>${stars(p.pot)}<span class="mono">${p.pot}</span></div>
   <div class="dft"><span>${eurK(valueFor(p))}</span><span class="dim">${eurK(p.salary)}/Wo.</span><i style="background:${barCol(p.form)}" title="Form ${Math.round(p.form)}"></i></div></button>`}
function depthView(){const U=S.teams[S.user],all=squadAll(),pros=all.filter(x=>x[1]==='pro').map(x=>x[0]);
  const tv=all.reduce((a,[p])=>a+valueFor(p),0),pv=pros.reduce((a,p)=>a+valueFor(p),0),age=all.reduce((a,[p])=>a+p.age,0)/all.length,wages=all.reduce((a,[p])=>a+p.salary,0);
  const exp=all.filter(([p])=>p.contract<=1).length,avgS=pros.reduce((a,p)=>a+clamp((ovr(p)-45)/9,.5,5),0)/pros.length;
  const thin=ROLES.filter(r=>pros.filter(p=>p.role===r).length<2);
  const tiles=`<section class="s12 tiles">
   <div class="tile"><span>Kaderwert</span><b>${eurK(tv)}</b><small>Profis ${eurK(pv)} · Academy ${eurK(tv-pv)}</small></div>
   <div class="tile"><span>Ø Stärke Profis</span><b>${stars(teamOvr(U))}</b><small>Team-OVR ${teamOvr(U)}</small></div>
   <div class="tile"><span>Ø Alter</span><b>${f1(age)}</b><small>${all.length} Spieler gesamt</small></div>
   <div class="tile"><span>Gehälter</span><b>${eurK(wages)}</b><small>pro Woche inkl. Academy</small></div>
   <button class="tile tilebtn" data-a="ktab" data-v="vert"><span>Verträge</span><b class="${exp?'warn':''}">${exp}</b><small>laufen am Saisonende aus · Übersicht</small></button></section>`;
  const modes=`<div class="seg s12" style="margin:0">${[['pos','Nach Position'],['list','Als Liste']].map(([k,l])=>`<button class="${KMODE===k?'on':''}" data-a="kmode" data-v="${k}">${l}</button>`).join('')}</div>`;
  if(KMODE==='list'){const keys={value:['Marktwert',p=>valueFor(p)],ovr:['Aktuell',p=>ovr(p)],pot:['Potenzial',p=>p.pot],age:['Alter',p=>-p.age],wage:['Gehalt',p=>p.salary],end:['Vertragsende',p=>-p.contract]};
    const L=all.slice().sort((a,b)=>keys[KSORT][1](b[0])-keys[KSORT][1](a[0]));
    return tiles+modes+`<section class="panel s12"><div class="lab"><span>Gesamter Kader</span><span>sortiert nach ${keys[KSORT][0]}</span></div>
     <div class="seg" style="margin-bottom:10px">${Object.entries(keys).map(([k,[l]])=>`<button class="${KSORT===k?'on':''}" data-a="ksort" data-v="${k}">${l}</button>`).join('')}</div>
     <div class="scroll"><table class="tbl"><thead><tr><th></th><th class="stick">Spieler</th><th>Status</th><th class="r">Alter</th><th>Aktuell</th><th>Potenzial</th><th class="r">Marktwert</th><th class="r">Gehalt</th><th class="r">bis</th></tr></thead><tbody>
     ${L.map(([p,k])=>`<tr class="click ${k==='aca'?'benchrow':''}" data-a="player" data-id="${p.id}" tabindex="0"><td><span class="chip">${p.role}</span></td><td class="nmcell stick">${p.name}</td><td>${k==='aca'?'Academy':isStarter(p)?'<span class="good">Starter</span>':'Bank'}</td><td class="r">${p.age}</td><td>${stars(ovr(p))} <span class="mono dim">${ovr(p)}</span></td><td>${stars(p.pot)} <span class="mono dim">${p.pot}</span></td><td class="r mono">${eurK(valueFor(p))}</td><td class="r mono">${eurK(p.salary)}</td><td class="r ${p.contract<=1?'warn':''}">${S.year+p.contract-1}</td></tr>`).join('')}</tbody></table></div></section>`}
  const cols=ROLES.map(r=>{const ps=all.filter(([p])=>p.role===r).sort((a,b)=>(b[1]==='pro'&&isStarter(b[0]))-(a[1]==='pro'&&isStarter(a[0]))||(a[1]==='aca')-(b[1]==='aca')||ovr(b[0])-ovr(a[0]));
    const stp=S.players[U.starters[r]],ra=roleAvg(r,U.reg).ovr,df=ovr(stp)-ra,val=ps.reduce((a,[p])=>a+valueFor(p),0);
    return `<div class="dcol"><div class="dhead"><b>${RN[r]}</b><span class="${df>=2?'good':df<=-2?'bad':'muted'}">${df>0?'+':''}${df} zum Ø</span></div>
     <div class="dmeta"><span>${ps.filter(x=>x[1]==='pro').length} Profi${ps.filter(x=>x[1]==='pro').length===1?'':'s'}${ps.some(x=>x[1]==='aca')?` · ${ps.filter(x=>x[1]==='aca').length} Academy`:''}</span><span>${eurK(val)}</span></div>
     ${ps.map(([p,k])=>depthCard(p,k)).join('')}${ps.filter(x=>x[1]==='pro').length<2?'<div class="dgap">Kein Backup im Profikader</div>':''}</div>`}).join('');
  return tiles+modes+`<section class="panel s12"><div class="lab"><span>Kader nach Position</span><span>${thin.length?`<span class="warn">Dünn besetzt: ${thin.map(r=>RN[r]).join(', ')}</span>`:'Alle Positionen doppelt besetzt'}</span></div><div class="depth">${cols}</div>
   <p class="muted" style="font-size:13px;margin:12px 0 0">Sterne: Aktuell und Potenzial von 0,5 bis 5. Farbiger Punkt unten rechts = Form. "zum Ø" vergleicht deinen Starter mit dem Schnitt der Starter in der ${U.reg}.</p></section>`}
/* ===== Spielerbilder (generiert) ===== */
const SKIN=['#F3D3B5','#E8BE98','#D7A57C','#B97F57','#8D5A3B','#5E3B26'];
const HAIRC=['#1C1714','#2E2119','#4A3020','#7A4E2A','#B5853F','#D9B26A','#8C8C8C','#A33A2E','#3B4A7A'];
const HAIR=[
 'M29 42 C28 22 41 15 51 16 C63 17 73 25 71 42 C67 31 59 27 50 27 C42 27 33 31 29 42 Z',
 'M29 41 L31 25 L37 30 L40 17 L46 26 L51 14 L56 25 L62 17 L64 29 L70 24 L71 41 C66 31 58 28 50 28 C42 28 33 31 29 41 Z',
 'M29 44 C27 24 38 15 52 16 C66 17 74 27 71 44 C69 34 64 30 57 29 C48 33 38 31 33 30 C31 34 30 39 29 44 Z',
 'M28 62 C24 40 30 18 50 16 C70 18 76 40 72 62 C70 50 70 38 66 32 C60 28 40 28 34 32 C30 38 30 50 28 62 Z',
 'M31 38 C32 25 42 20 50 20 C58 20 68 25 69 38 C64 31 57 29 50 29 C43 29 36 31 31 38 Z',
 'M30 41 C29 24 40 17 50 17 C60 17 71 24 70 41 C66 31 58 28 50 28 C42 28 34 31 30 41 Z M44 13 C44 6 56 6 56 13 C56 18 44 18 44 13 Z'];
function avatar(p,cls){const h=hsh(p.id+p.name),pk=(a,k)=>a[(h>>>k)%a.length],T=p.team?S.teams[p.team]:null,jc=T?T.color:'#5B6776';
  const skin=pk(SKIN,1),hc=p.age>=29&&h%3===0?'#8C8C8C':pk(HAIRC,5),hs=pk(HAIR,9),rx=19+(h>>>13)%4,ry=23+(h>>>15)%3,beard=p.age>=21&&(h>>>17)%4===0,gl=(h>>>19)%5===0,ey=45+(h>>>21)%2,smile=(h>>>22)%3;
  return `<svg class="avatar ${cls||''}" viewBox="0 0 100 100" role="img" aria-label="Bild von ${p.name}"><defs><clipPath id="ac${p.id}"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#ac${p.id})">
   <rect width="100" height="100" style="fill:color-mix(in srgb,${jc} 22%,#1C2632)"/>
   <path d="M10 104 C12 82 28 73 50 73 C72 73 88 82 90 104 Z" fill="${jc}"/><path d="M40 73 L50 86 L60 73 Z" fill="#000" opacity=".22"/><path d="M10 104 C12 82 28 73 50 73 L50 104 Z" fill="#fff" opacity=".06"/>
   <rect x="42" y="58" width="16" height="17" rx="5" fill="${skin}"/><rect x="42" y="66" width="16" height="9" fill="#000" opacity=".12"/>
   <circle cx="${50-rx}" cy="47" r="4.5" fill="${skin}"/><circle cx="${50+rx}" cy="47" r="4.5" fill="${skin}"/>
   <ellipse cx="50" cy="45" rx="${rx}" ry="${ry}" fill="${skin}"/>
   ${beard?`<path d="M${50-rx+2} 48 C${50-rx+3} 66 42 70 50 70 C58 70 ${50+rx-3} 66 ${50+rx-2} 48 C${50+rx-6} 60 56 63 50 63 C44 63 ${50-rx+6} 60 ${50-rx+2} 48 Z" fill="${hc}" opacity=".88"/>`:''}
   <path d="${hs}" fill="${hc}"/>
   <path d="M38 ${ey-5} L46 ${ey-6}" stroke="${hc}" stroke-width="2" stroke-linecap="round"/><path d="M54 ${ey-6} L62 ${ey-5}" stroke="${hc}" stroke-width="2" stroke-linecap="round"/>
   <circle cx="42" cy="${ey}" r="2.3" fill="#1B1B1B"/><circle cx="58" cy="${ey}" r="2.3" fill="#1B1B1B"/>
   <path d="M50 ${ey+2} L48 ${ey+9} L51 ${ey+9}" stroke="#000" stroke-opacity=".25" stroke-width="1.2" fill="none"/>
   <path d="${smile===0?`M44 ${ey+13} Q50 ${ey+17} 56 ${ey+13}`:smile===1?`M45 ${ey+14} L55 ${ey+14}`:`M44 ${ey+13} Q50 ${ey+16} 56 ${ey+12}`}" stroke="#5A2E25" stroke-width="1.8" fill="none" stroke-linecap="round"/>
   ${gl?`<rect x="35.5" y="${ey-4.5}" width="12" height="9" rx="3" fill="none" stroke="#222" stroke-width="1.6"/><rect x="52.5" y="${ey-4.5}" width="12" height="9" rx="3" fill="none" stroke="#222" stroke-width="1.6"/><path d="M47.5 ${ey} L52.5 ${ey}" stroke="#222" stroke-width="1.4"/>`:''}
   <path d="M${50-rx-3} 46 C${50-rx-3} 14 ${50+rx+3} 14 ${50+rx+3} 46" stroke="#20262E" stroke-width="3.6" fill="none"/>
   <rect x="${50-rx-7}" y="38" width="8" height="15" rx="3.5" fill="#20262E"/><rect x="${50+rx-1}" y="38" width="8" height="15" rx="3.5" fill="#20262E"/>
   <rect x="${50-rx-6}" y="41" width="2.2" height="9" rx="1" fill="${jc}"/><rect x="${50+rx+3.8}" y="41" width="2.2" height="9" rx="1" fill="${jc}"/>
   <path d="M${50-rx-3} 52 C${50-rx} 62 38 63 41 ${ey+14}" stroke="#20262E" stroke-width="1.8" fill="none"/><circle cx="41" cy="${ey+14}" r="1.9" fill="#20262E"/>
  </g></svg>`}
/* ===== Transfer-Verlauf ===== */
function txRec(r){S.txlog=S.txlog||[];r.id='tx'+(S.nextId++);try{const p=S.players[r.pid];if(p&&(r.type==='buy'||r.type==='sell')&&r.fee)recNote(r.type,r.fee,`${p.name} ${r.type==='buy'?'von '+(S.teams[r.from]?S.teams[r.from].name:'?'):'an '+(S.teams[r.to]?S.teams[r.to].name:'?')}`)}catch(e){}S.txlog.unshift(r);if(S.txlog.length>12)S.txlog.length=12}
function txText(r){const p=S.players[r.pid];if(!p)return'-';if(r.type==='buy')return `Kauf: ${p.name} von ${S.teams[r.from]?S.teams[r.from].name:'?'} für ${eurK(r.fee)}${r.sb?` + ${eurK(r.sb)} Handgeld`:''}`;
  if(r.type==='fa')return `Ablösefrei: ${p.name}${r.sb?` (${eurK(r.sb)} Handgeld)`:''}`;return `Verkauf: ${p.name} an ${S.teams[r.to]?S.teams[r.to].name:'?'} für ${eurK(r.fee)}`}
function historyTab(){const L=(S.txlog||[]);
  return `<section class="panel s12"><div class="lab"><span>Transferverlauf</span><span>${L.length} Transfers</span></div>
   ${L.map(r=>`<div class="stat"><span>${txText(r)}</span><span class="dim" style="font-family:var(--f-body)">${r.when||''}</span></div>`).join('')||'<p class="empty">Noch keine Transfers.</p>'}</section>`}

/* ===== Scrim-Partner =====
   Partner aus der eigenen Region für vier Wochen. Stärkere Partner bringen mehr aus den Scrim-Einheiten, sagen aber kleineren Vereinen eher ab.
   Wer mit dir scrimmt, kennt deinen Stil: Trefft ihr euch in dieser Zeit im Spiel, stellt er sich öfter darauf ein. Umgekehrt kennst du seinen Stil. */
const SCRIMWK=4;
function scrimCands(){const U=S.teams[S.user];return[...teamsOf(U.reg).filter(t=>t.id!==S.user),...t2Of(U.reg).filter(t=>!t.academy).sort((a,b)=>teamOvr(b)-teamOvr(a)).slice(0,2)].sort((a,b)=>teamOvr(b)-teamOvr(a))}
function scrimP(T){const U=S.teams[S.user];if(T.tier===2)return 1;return clamp(sig((U.rep-T.rep+6)/4),.05,.97)}
function scrimNow(){const s=S.scrim;return s&&S.teams[s.tid]&&S.step<s.until&&S.phase!=='offseason'?S.teams[s.tid]:null}
function scrimF(){const P=scrimNow(),U=S.teams[S.user];if(!P)return 1;return clamp(1+(teamOvr(P)-teamOvr(U))*.025,.85,1.25)}
function scrimKnows(tid){const s=S.scrim;return !!(s&&s.tid===tid&&S.step<s.until+2)}
function scrimAsk(tid){const T=S.teams[tid];if(!T||!scrimCands().some(t=>t.id===tid))return 'Kein Scrim-Partner aus deiner Region.';if(S.scrimTry===wkKey())return 'Diese Woche hast du schon angefragt.';
  S.scrimTry=wkKey();if(R()>=scrimP(T))return `${T.name} sagt ab. Für Scrims mit ihnen fehlt deinem Verein das Prestige.`;
  S.scrim={tid,until:S.step+SCRIMWK};return null}
function scrimPanel(){const U=S.teams[S.user],P=scrimNow(),L=scrimCands(),asked=S.scrimTry===wkKey(),n=(S.training.plan||[]).filter(x=>x==='scrim').length;
  return `<section class="panel s12"><div class="lab"><span>Scrim-Partner</span><span>${P?`${P.name} bis Woche ${S.scrim.until}`:'kein fester Partner'}</span></div>
   <p class="muted" style="font-size:13px;margin:0 0 10px">Wirkt auf die Scrim-Einheiten im Wochenplan (aktuell ${n}). Ohne Partner scrimmt das Team mit wechselnden Gegnern, ohne Bonus. Aktuell: ${Math.round((scrimF()-1)*100)>=0?'+':''}${Math.round((scrimF()-1)*100)}%. Wer mit dir scrimmt, kennt deinen Stil, und du kennst seinen.</p>
   <div class="rows">${L.map(T=>{const p=scrimP(T),q=clamp(1+(teamOvr(T)-teamOvr(U))*.025,.85,1.25),cur=P&&P.id===T.id;
    return `<div class="row" style="grid-template-columns:26px minmax(0,1fr) auto;cursor:default">${crest(T,'sm')}<span style="min-width:0"><div class="nm">${T.name}${T.tier===2?' <span class="dim" style="font-size:12px">T2</span>':''}</div><div class="sub">OVR ${teamOvr(T)} · Scrim-Wert ${q>=1?'+':''}${Math.round((q-1)*100)}% · ${p>=.8?'sagt sicher zu':p>=.45?'unsicher':'eher Absage'}</div></span>
     <span class="rt">${cur?'<span class="good" style="font-size:13px">Partner</span>':`<button class="btn ghost sm" data-a="scrimask" data-v="${T.id}" ${asked||S.phase==='offseason'?'disabled':''}>Anfragen</button>`}</span></div>`}).join('')}</div>
   ${asked&&!P?'<p class="dim" style="font-size:12.5px;margin:8px 0 0">Eine Anfrage pro Woche.</p>':''}</section>`}

/* ===== Burnout und Pausen =====
   Zwei Wochen am Stück mit Belastung ab 90 können zum Ausfall führen: zwei bis vier Wochen ohne Spiel und Training.
   Eine Woche Pause baut Belastung stark ab, der Spieler fehlt aber in dieser Woche. */
function isOut(p){return !!(p&&p.out&&S.step<p.out.until&&S.phase!=='offseason')}
function burnWeek(){const U=S.teams[S.user];for(const id of [...U.roster,...(aca()?aca().roster:[])]){const p=S.players[id];if(!p)continue;
  if(p.out&&!isOut(p)){const was=p.out.why;p.out=null;if(was==='Burnout'&&p.team===S.user)mail('Zurück nach Burnout',`${p.name} ist wieder einsatzbereit.`)}
  if(isOut(p)){p.load=clamp((p.load||0)-(p.out.why==='Pause'?30:15),0,100);continue}
  p.hiW=(p.load||0)>=90?(p.hiW||0)+1:0;
  if(p.hiW>=2&&R()<.35){const wk=ri(2,4);p.out={until:S.step+wk,why:'Burnout'};p.hiW=0;p.morale=clamp(p.morale-6,20,100);p.form=clamp(p.form-10,30,100);
    if(p.team===S.user)mail(`Burnout: ${p.name}`,`${p.name} fällt ${wk} Wochen aus. Die Belastung war zu lange zu hoch. Plane mehr Erholung ein.`)}}}
function restWeek(pid){const p=S.players[pid];if(!p||!isMine(p)||p.loan)return 'Nicht möglich.';if(isOut(p))return 'Er fällt ohnehin aus.';if(S.phase==='offseason')return 'In der Saisonpause erholen sich alle.';
  p.out={until:S.step+1,why:'Pause'};return null}
/* Vor jeder Serie: Ausfälle durch den besten verfügbaren Spieler der Rolle ersetzen */
function fixOut(T){const out=[];for(const r of ROLES){const p=S.players[T.starters[r]];if(!isOut(p))continue;
  const alt=T.roster.map(i=>S.players[i]).filter(q=>q.role===r&&!isOut(q)&&q.id!==p.id&&impOk(q,T,p.id)).sort((a,b)=>ovr(b)-ovr(a))[0];
  if(alt){T.starters[r]=alt.id;out.push([p,alt])}}return out}
