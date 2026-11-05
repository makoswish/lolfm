/* ===== T2-Szene & Academy ===== */
const REGC={LCK:'K',LPL:'C',LEC:'E',LCS:'N',LCP:'P',CBLOL:'B'};
const T2CITY={LCK:['Seoul','Busan','Daejeon','Incheon','Ulsan','Gwangju','Suwon','Jeju'],LPL:['Shanghai','Beijing','Chengdu','Wuhan','Xiamen','Hefei','Kunming','Dalian'],LEC:['Hamburg','Paris','Madrid','Warschau','Prag','Oslo','Brüssel','Turin'],LCS:['Dallas','Boston','Denver','Atlanta','Portland','Phoenix','Detroit','Montreal'],LCP:['Taichung','Osaka','Da Nang','Cebu','Melbourne','Chiang Mai','Kaohsiung','Perth'],CBLOL:['Campinas','Salvador','Manaus','Belém','Goiânia','Natal','Santos','Recife']};
const T2SUF=['Rising','Next','Prospects','Rookies','Challengers','Ascend','Youth','Nova'];
function acaId(){return S.user+'A'}
function aca(){return S.teams[acaId()]}
function isMine(p){return !!p&&(p.team===S.user||p.team===acaId())}
function t2Of(r){return Object.values(S.teams).filter(t=>t.tier===2&&t.reg===r)}
function mkT2Team(id,name,reg,rep,color,academy){const T={id,name,reg,rep,color,tier:2,academy:!!academy,style:pick(SK),focus:pick(['TOP','MID','ADC']),roster:[],starters:{}};S.teams[id]=T;
  const base=Math.round(48+(rep-40)*.5);
  for(const ro of ROLES){const p=genPlayer(ro,base+ri(-4,4),ri(16,21),reg);p.pot=clamp(ovr(p)+ri(8,24),ovr(p),95);p.salary=Math.min(p.salary,academy?400:1200);sign(p,T,true)}
  if(!academy){const p=genPlayer(pick(ROLES),base-4,ri(16,19),reg);p.pot=clamp(ovr(p)+ri(10,24),ovr(p),95);p.salary=Math.min(p.salary,900);sign(p,T,false)}
  for(const id of T.roster)S.players[id].o0=ovr(S.players[id]);return T}
function genT2(){const U=S.teams[S.user];
  REGS.forEach((r,k)=>{const cities=shuffle(T2CITY[r].slice()),sufs=shuffle(T2SUF.slice()),n=r===U.reg?7:8;
    for(let i=0;i<n;i++){const id=REGC[r]+'2'+'ABCDEFGH'[i];if(S.teams[id])continue;mkT2Team(id,`${cities[i]} ${sufs[i]}`,r,clamp(48+REG[r].off-i*1.5+ri(-2,2),36,58),`hsl(${(i*41+k*67+200)%360} 30% 62%)`)}});
  if(!aca())mkT2Team(acaId(),U.name+' Academy',U.reg,clamp(U.rep-30,38,56),U.color,true);
  t2Init()}
function t2Init(){S.t2={};for(const r of REGS){const ids=t2Of(r).map(t=>t.id);const tab={};ids.forEach(i=>tab[i]={w:0,l:0,form:[]});S.t2[r]={sched:ids.length%2?[]:circle(shuffle(ids.slice())),round:0,tab,last:[]}}}
function t2Week(){if(!S.t2)t2Init();
  for(const r of REGS){const L=S.t2[r];if(!L||!L.sched.length)continue;const rd=L.sched[L.round%L.sched.length];L.round++;L.last=[];
    for(const[a,b]of rd){const A=S.teams[a],B=S.teams[b];if(!A||!B)continue;const w=R()<sig((teamOvr(A)-teamOvr(B)+gauss()*3)/4)?a:b,l=w===a?b:a;
      for(const[id,won]of[[w,1],[l,0]]){const e=L.tab[id]||(L.tab[id]={w:0,l:0,form:[]});won?e.w++:e.l++;e.form.push(won);if(e.form.length>5)e.form.shift()}
      L.last.push({a,b,w});
      for(const T of[A,B])for(const r2 of ROLES){const p=S.players[T.starters[r2]];if(!p)continue;const s=p.st||(p.st={g:0,w:0,k:0,d:0,mvp:0});s.g++;if(T.id===w)s.w++;p.form=clamp(p.form+(T.id===w?1:-1),30,100)}}}}
function t2Table(r){const L=S.t2&&S.t2[r];if(!L)return[];return Object.entries(L.tab).filter(([id])=>S.teams[id]).map(([id,e])=>({id,...e})).sort((a,b)=>b.w-a.w||a.l-b.l)}
function promote(pid){const p=S.players[pid];p.fromAca=true;const U=S.teams[S.user],A=aca();if(U.roster.length>=MAXR)return 'Dein Profikader ist voll.';unsign(p);sign(p,U,false);ensureRoles(A,false);mail('Aus der Academy hochgezogen',`${p.name} (${RN[p.role]}) gehört jetzt zum Profikader.`);return null}
function demote(pid){const p=S.players[pid],U=S.teams[S.user],A=aca();if(A.roster.length>=8)return 'Die Academy ist voll (8 Spieler).';if(!U.roster.some(i=>i!==pid&&S.players[i].role===p.role))return `Ohne ihn hättest du keinen ${RN[p.role]} mehr im Profikader.`;unsign(p);sign(p,A,false);p.promise=null;return null}
function acaIntake(){const A=aca(),U=S.teams[S.user];if(!A)return;const lv=S.fin.infra.ac,n=1+lv;
  for(let i=0;i<n;i++){const p=genPlayer(pick(ROLES),ri(45,50)+lv*3,ri(16,17),U.reg);p.pot=clamp(ovr(p)+ri(14,24)+lv*2,ovr(p),96);p.contract=3;p.salary=350;p.o0=ovr(p);
    if(A.roster.length<8){sign(p,A,false);mail('Neues Academy-Talent',`${p.name} (${RN[p.role]}, 16-17 Jahre) kommt in deine Academy.`)}else{p.contract=0;S.players[p.id]=p;S.fa.push(p.id)}}}

/* ===== Scouting ===== */
const SCOPE={all:'Alle',t1:'Profis (T1)',t2:'T2-Szene',u20:'Talente U20'};
function kn(p){if(isMine(p))return 100;const k=(S.kn&&S.kn[p.id])||0,T=p.team?S.teams[p.team]:null;let b=0;if(T&&T.tier!==2)b=T.reg===S.teams[S.user].reg?S.staff.analyst*12:S.staff.analyst*6;return Math.max(k,b)}
function knW(p){const k=kn(p);return k>=85?0:k>=60?1:k>=35?2:3}
function knLv(p){const k=kn(p);return k>=85?4:k>=60?3:k>=35?2:1}
function genScout(lvl){return{id:'s'+(S.nextId++),name:genRealName(pick(['DE','KR','FR','ES','EN','DK','BR','CN'])),lvl,reg:S.teams[S.user].reg,scope:'all',wage:lvl*700,fee:lvl*25000}}
function initScouting(){S.kn=S.kn||{};S.short=S.short||[];S.reports=S.reports||[];if(!S.scouts){const s=genScout(1);s.fee=0;S.scouts=[s]}if(!S.scoutPool)S.scoutPool=[genScout(ri(1,2)),genScout(ri(2,3)),genScout(ri(3,4))]}
function scoutPool(sc){return Object.values(S.players).filter(p=>{if(isMine(p))return false;const T=p.team?S.teams[p.team]:null;
  if(T&&sc.reg!=='ALL'&&T.reg!==sc.reg)return false;if(!T&&!S.fa.includes(p.id))return false;
  if(sc.frole&&sc.frole!=='ALL'&&p.role!==sc.frole)return false;if(sc.fage&&p.age>sc.fage)return false;if(sc.fval&&valueFor(p)>sc.fval)return false;
  if(sc.scope==='t1')return !!T&&T.tier!==2;if(sc.scope==='t2')return !!T&&T.tier===2;if(sc.scope==='u20')return p.age<=20;return true})}
function grade(p,sc){const U=S.teams[S.user],cur=S.players[U.starters[p.role]],o=ovr(p)+gauss()*(5-sc.lvl),pot=p.pot+gauss()*(5-sc.lvl),co=cur?ovr(cur):0;
  if(o>=co+2)return['A','Sofort eine Verstärkung'];if(pot>=co+3&&p.age<=21)return['B','Spannende Perspektive'];if(o>=co-5)return['C','Solider Ersatz'];return['D','Kein Bedarf']}
function scoutWeek(){initScouting();
  for(const sc of S.scouts){const pool=scoutPool(sc).filter(p=>kn(p)<90);if(!pool.length)continue;
    const n=1+Math.floor(sc.lvl/2);for(let i=0;i<n;i++){const c=shuffle(pool.slice()).slice(0,14).sort((a,b)=>b.pot-a.pot+(R()-.5)*10)[0];if(!c)break;
      S.kn[c.id]=clamp((S.kn[c.id]||0)+20+sc.lvl*10,0,100);const g=grade(c,sc);S.reports=S.reports.filter(r=>r.pid!==c.id);
      const w=Math.max(1,6-sc.lvl),lo=Math.round(ovr(c)-R()*w),kwc=keyW(c.role),srt=DK.filter(x=>x!=='cns').sort((a,b)=>(c.d[b]-c.d[a])+(kwc[b]-kwc[a])*20);
      S.reports.unshift({pid:c.id,sc:sc.name,lvl:sc.lvl,g:g[0],txt:g[1],when:shortLabel(),lo,hi:lo+w,ps:clamp(c.pot+gauss()*(5-sc.lvl),40,96),fee:r1000(valueFor(c)*(.85+R()*.3)),st:srt.slice(0,2),wk:srt.slice(-1)});
      if(g[0]==='A'&&R()<.5)mail(`Scouting: ${c.name}`,`${sc.name} empfiehlt ${c.name} (${RN[c.role]}, ${c.team?S.teams[c.team].name:'vereinslos'}): ${g[1]}.`)}}
  if(S.reports.length>40)S.reports.length=40;
  if(S.scouts.length)for(const id of S.short)if(S.players[id])S.kn[id]=clamp((S.kn[id]||0)+6,0,100);
  const w=S.scouts.reduce((a,s)=>a+s.wage,0);if(w)book('Scouts',-w)}

/* ===== Statistiken ===== */
function teamStats(g){S.tst=S.tst||{};[g.A,g.B].forEach((id,side)=>{const e=S.tst[id]||(S.tst[id]={g:0,w:0,len:0,fb:0,ft:0,fd:0,dr:0,bn:0,b:[0,0],r:[0,0]});const won=g.winner===side;
  e.g++;if(won)e.w++;e.len+=g.end;if(g.first.fb===side)e.fb++;if(g.first.tw===side)e.ft++;if(g.first.dr===side)e.fd++;e.dr+=g.s.dr[side];e.bn+=g.s.bn[side];const sd=side===0?e.b:e.r;sd[0]++;if(won)sd[1]++})}
function sm(s){s=s||{};const g=s.g||0,min=s.min||0;return{g,wr:g?s.w/g:0,k:s.k||0,d:s.d||0,a:s.a||0,kda:((s.k||0)+(s.a||0))/Math.max(1,s.d||0),kp:s.tk?((s.k||0)+(s.a||0))/s.tk:0,csm:min?(s.cs||0)/min:0,dpm:min?(s.dmg||0)/min:0,rt:s.rn?s.rs/s.rn:0,mvp:s.mvp||0,full:!!min}}
const f1=(x,n=1)=>x.toFixed(n).replace('.',',');
const pct=x=>Math.round(x*100)+'%';
function leaders(reg,key,minG,filt){return Object.values(S.players).filter(p=>p.team&&S.teams[p.team]&&S.teams[p.team].reg===reg&&S.teams[p.team].tier!==2&&(!filt||filt(p))).map(p=>[p,sm(p.st)]).filter(([,m])=>m.g>=minG&&m.full).sort((a,b)=>b[1][key]-a[1][key]).slice(0,5)}
function statsView(reg){
  const teams=teamsOf(reg),maxG=Math.max(1,...teams.map(t=>(S.tst&&S.tst[t.id]||{g:0}).g)),minG=Math.max(2,Math.floor(maxG*.3));
  const board=(title,key,fmt,filt)=>{const L=leaders(reg,key,minG,filt);return `<section class="panel s4"><div class="lab"><span>${title}</span><span>ab ${minG} Spielen</span></div>${L.length?L.map(([p,m],i)=>`<button class="lbrow" data-a="player" data-id="${p.id}"><span class="pos">${i+1}</span>${crest(S.teams[p.team],'sm')}<span class="nmcell">${p.name}<small class="dim"> ${p.role}</small></span><b class="mono">${fmt(m)}</b></button>`).join(''):'<p class="empty">Noch zu wenige Spiele.</p>'}</section>`};
  const rows=teams.map(t=>[t,S.tst&&S.tst[t.id]]).filter(([,e])=>e&&e.g).sort((a,b)=>b[1].w/b[1].g-a[1].w/a[1].g);
  return `${board('Ø Note','rt',m=>f1(m.rt,2))}${board('KDA','kda',m=>f1(m.kda,2))}${board('MVP-Auszeichnungen','mvp',m=>m.mvp)}
   ${board('CS pro Minute','csm',m=>f1(m.csm),p=>p.role!=='SUP'&&p.role!=='JGL')}${board('Schaden pro Minute','dpm',m=>Math.round(m.dpm))}${board('Kill-Beteiligung','kp',m=>pct(m.kp))}
   <section class="panel s12"><div class="lab"><span>Teamstatistik ${reg}</span><span>alle Spiele der Saison ${S.year}</span></div>${rows.length?`<div class="scroll"><table class="tbl"><thead><tr><th>Team</th><th class="r">Spiele</th><th class="r">Siege</th><th class="r">Ø Dauer</th><th class="r">First Blood</th><th class="r">Erster Turm</th><th class="r">Drachen/Sp.</th><th class="r">Baron/Sp.</th><th class="r">Blau</th><th class="r">Rot</th></tr></thead><tbody>
    ${rows.map(([t,e])=>`<tr class="${t.id===S.user?'me':''}"><td><button class="linkbtn" data-a="team" data-id="${t.id}" style="display:flex;gap:8px;align-items:center">${crest(t,'sm')}${t.name}</button></td><td class="r">${e.g}</td><td class="r">${pct(e.w/e.g)}</td><td class="r mono">${f1(e.len/e.g)}'</td><td class="r">${pct(e.fb/e.g)}</td><td class="r">${pct(e.ft/e.g)}</td><td class="r">${f1(e.dr/e.g)}</td><td class="r">${f1(e.bn/e.g,2)}</td><td class="r">${e.b[0]?pct(e.b[1]/e.b[0]):'-'}</td><td class="r">${e.r[0]?pct(e.r[1]/e.r[0]):'-'}</td></tr>`).join('')}</tbody></table></div>`:'<p class="empty">Noch keine Spiele in dieser Saison.</p>'}</section>`;
}
function t2View(reg){const tab=t2Table(reg),L=S.t2&&S.t2[reg];
  const tal=t2Of(reg).flatMap(t=>t.roster.map(i=>S.players[i])).filter(p=>p.team!==acaId()).sort((a,b)=>b.pot-a.pot).slice(0,10);
  return `<section class="panel s7"><div class="lab"><span>T2-Liga ${reg}</span><span>Academy- und Nachwuchsteams</span></div>
   <div class="scroll"><table class="tbl"><thead><tr><th>#</th><th>Team</th><th class="r">S</th><th class="r">N</th><th>Form</th></tr></thead><tbody>${tab.map((x,i)=>{const T=S.teams[x.id];return `<tr class="${x.id===acaId()?'me':''}"><td class="pos">${i+1}</td><td><button class="linkbtn" data-a="team" data-id="${T.id}" style="display:flex;gap:8px;align-items:center">${crest(T,'sm')}${T.name}</button></td><td class="r">${x.w}</td><td class="r">${x.l}</td><td>${formDots(x.form)}</td></tr>`}).join('')}</tbody></table></div>
   ${L&&L.last.length?`<div class="lab" style="margin-top:14px">Letzte Woche</div>${L.last.map(m=>`<div class="stat res ${meIn(m)?'me':''}"><span>${meIn(m)?wlPill(m)+' ':''}<span class="${isMyT(m.a)?'myid':m.w===m.a?'':'muted'}">${S.teams[m.a].name}</span> <span class="dim">vs</span> <span class="${isMyT(m.b)?'myid':m.w===m.b?'':'muted'}">${S.teams[m.b].name}</span></span><span>${m.w===m.a?'1:0':'0:1'}</span></div>`).join('')}`:''}</section>
   <section class="panel s5"><div class="lab"><span>Größte Talente</span><span>nach Potenzial</span></div>${tal.map(p=>playerRow(p,true)).join('')}
   <p class="muted" style="font-size:13px;margin:10px 0 0">T2-Spieler sind günstig, aber oft noch roh. Schick einen Scout in die T2-Szene, um ihr Potenzial einzuschätzen.</p></section>`}
function scoutTab(){initScouting();
  const reps=S.reports.filter(r=>S.players[r.pid]&&!isMine(S.players[r.pid]));
  return `<section class="panel s12"><div class="lab"><span>Deine Scouts</span><span>${S.scouts.length}/3 · je Woche 1-3 Berichte</span></div>
   ${S.scouts.map(sc=>`<div class="scard"><div class="scd"><b>${sc.name}</b><span class="muted">Level ${sc.lvl} · ${eur(sc.wage)}/Woche</span>${bar(sc.lvl*20,'var(--brass)')}</div>
    <div><div class="lab" style="margin-bottom:4px">Suchprofil</div><div class="seg" style="margin-bottom:6px">${['ALL',...ROLES].map(r=>`<button class="${(sc.frole||'ALL')===r?'on':''}" data-a="scf" data-k="frole" data-id="${sc.id}" data-v="${r}">${r==='ALL'?'Alle Rollen':r}</button>`).join('')}</div>
     <div class="seg" style="margin-bottom:6px">${[[99,'Jedes Alter'],[23,'bis 23'],[20,'bis 20']].map(([v,l])=>`<button class="${(sc.fage||99)===v?'on':''}" data-a="scf" data-k="fage" data-id="${sc.id}" data-v="${v}">${l}</button>`).join('')}${[[0,'Jeder Preis'],[100000,'bis 100k'],[300000,'bis 300k']].map(([v,l])=>`<button class="${(sc.fval||0)===v?'on':''}" data-a="scf" data-k="fval" data-id="${sc.id}" data-v="${v}">${l}</button>`).join('')}</div>
     <div class="lab" style="margin:8px 0 4px">Region</div><div class="seg">${['ALL',...REGS].map(r=>`<button class="${sc.reg===r?'on':''}" data-a="screg" data-id="${sc.id}" data-v="${r}">${r==='ALL'?'Weltweit':r}</button>`).join('')}</div>
     <div class="lab" style="margin:8px 0 4px">Auftrag</div><div class="seg">${Object.entries(SCOPE).map(([k,l])=>`<button class="${sc.scope===k?'on':''}" data-a="scscope" data-id="${sc.id}" data-v="${k}">${l}</button>`).join('')}</div></div>
    ${S.scouts.length>1?`<button class="btn danger sm" data-a="scfire" data-id="${sc.id}">Entlassen</button>`:''}</div>`).join('')}
   ${S.scouts.length<3?`<div class="lab" style="margin-top:16px">Scouts auf dem Markt</div><div class="cards">${S.scoutPool.map(sc=>`<div class="card" style="cursor:default"><b>${sc.name}</b><p>Level ${sc.lvl} · ${eur(sc.wage)} pro Woche</p>${bar(sc.lvl*20,'var(--brass)')}<button class="btn sm" style="align-self:flex-start;margin-top:6px" data-a="schire" data-id="${sc.id}" ${S.fin.balance<sc.fee?'disabled':''}>Einstellen (${eurK(sc.fee)})</button></div>`).join('')}</div>`:''}
   <p class="muted" style="font-size:13px;margin:12px 0 0">Scouts erhöhen das Wissen über Spieler. Mit mehr Wissen werden die Attribut-Spannen enger, und Potenzial und Persönlichkeit werden sichtbar. Spieler auf deiner Beobachtungsliste beobachten sie zusätzlich jede Woche.</p></section>
  <section class="panel s12"><div class="lab"><span>Scouting-Berichte</span><span>${reps.length}</span></div>
   <div class="seg" style="margin-bottom:10px">${['ALL','A','B','C','D'].map(g=>`<button class="${RFILT===g?'on':''}" data-a="rfilt" data-v="${g}">${g==='ALL'?'Alle':g+' ('+reps.filter(r=>r.g===g).length+')'}</button>`).join('')}</div>
   ${reps.filter(r=>RFILT==='ALL'||r.g===RFILT).map(r=>{const p=S.players[r.pid];return `<button class="row rep" data-a="player" data-id="${p.id}"><span class="grade g${r.g}">${r.g}</span><span style="min-width:0"><div class="nm">${chip(p.role)} ${p.name} <span class="muted" style="font-weight:500;font-size:13px">${r.txt}</span></div>
     <div class="sub">${p.age} J. · ${p.team?S.teams[p.team].name:'vereinslos'} · ${r.sc} (L${r.lvl}) · ${r.when}</div>${r.st?`<div class="sub">Stärken: ${r.st.map(x=>DN[x]).join(', ')} · Schwäche: ${DN[r.wk[0]]}</div>`:''}</span>
     <span class="rt"><span class="kv">OVR<b>${r.lo!=null?r.lo+'-'+r.hi:'?'}</b></span><span class="kv">POT${r.ps?stars(r.ps):'<b>?</b>'}</span><span class="kv hide-s">Preis ca.<b>${r.fee?eurK(r.fee):'-'}</b></span></span></button>`}).join('')||'<p class="empty">Keine Berichte für diesen Filter.</p>'}</section>`}
function shortTab(){const L=(S.short||[]).map(i=>S.players[i]).filter(p=>p&&!isMine(p));
  return `<section class="panel s12"><div class="lab"><span>Beobachtungsliste</span><span>${L.length} Spieler</span></div>${L.length?`<div class="rows">${L.map(p=>playerRow(p,true)).join('')}</div>`:'<p class="empty">Noch leer. Auf jeder Spielerseite kannst du Spieler zur Beobachtung hinzufügen.</p>'}</section>`}
function acaTab(){const A=aca();if(!A)return'<section class="panel s12"><p class="empty">Keine Academy.</p></section>';
  const ps=A.roster.map(i=>S.players[i]).sort((a,b)=>ROLES.indexOf(a.role)-ROLES.indexOf(b.role)),tab=t2Table(A.reg),pos=tab.findIndex(x=>x.id===A.id)+1;
  return `<section class="panel s8"><div class="lab"><span>${A.name}</span><span>${ps.length}/8 Spieler · spielt in der T2-Liga ${A.reg}</span></div>
   <div class="scroll"><table class="tbl"><thead><tr><th></th><th>Spieler</th><th class="r">Alter</th><th class="r">OVR</th><th class="r">POT</th><th class="r">Form</th><th class="r">Gehalt</th><th></th></tr></thead><tbody>
   ${ps.map(p=>`<tr><td><span class="chip">${p.role}</span></td><td class="nmcell"><button class="linkbtn" data-a="player" data-id="${p.id}">${p.name}</button>${isStarter(p)?'':' <span class="dim" style="font-size:12px">Bank</span>'}</td><td class="r">${p.age}</td><td class="r ovr ${oc(ovr(p))}" style="font-size:14px">${ovr(p)}</td><td class="r mono">${p.pot}</td><td class="r mono" style="color:${barCol(p.form)}">${Math.round(p.form)}</td><td class="r mono">${eurK(p.salary)}</td><td class="r"><button class="btn sm" data-a="promote" data-id="${p.id}">Hochziehen</button></td></tr>`).join('')}</tbody></table></div>
   <p class="muted" style="font-size:13px;margin:10px 0 0">Academy-Spieler trainieren mit deinem Teamtraining, aber mit 70% des Coach-Effekts plus Bonus aus der Academy-Stufe (${S.fin.infra.ac}). Ihre Gehälter laufen nicht über das Gehaltsbudget. Zum Saisonstart kommen ${1+S.fin.infra.ac} neue Talente.</p></section>
  <section class="panel s4"><div class="lab"><span>T2-Liga ${A.reg}</span><span>${pos?`Platz ${pos}`:''}</span></div>${tab.map((x,i)=>`<div class="stat ${x.id===A.id?'warn':''}"><span>${i+1}. ${S.teams[x.id].name}</span><span>${x.w}-${x.l}</span></div>`).join('')}</section>`}
