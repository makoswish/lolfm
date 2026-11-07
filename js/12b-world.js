/* ===== Welt: Meta-Wandel, Verletzungen, Berater, Manager-Ruf, Fans, Liga-Ereignisse, Karriereende, Rückblick =====
   Alles hier hängt an worldWeek() (jede Woche), worldSeasonEnd() (Saisonende), retireSeason() (Saisonwechsel). */

/* ----- Meta: Stil- und Rollen-Meta pro Patch, Hotfix mitten im Split ----- */
function metaShift(){S.mst={style:pick(SK),role:pick(ROLES),n:(S.patch||0)}}
function metaPow(T){if(!S.mst)return 0;return styleOf(T)===S.mst.style?1:0}
function metaRoleW(r){return S.mst&&S.mst.role===r?1.05:1}
function metaNote(){if(!S.mst)return'';return `<div class="stat"><span class="muted">Stil-Meta</span><span>${STYLES[S.mst.style].n}: +1 Teamstärke</span></div><div class="stat"><span class="muted">Rollen-Meta</span><span>${RN[S.mst.role]}: Rolle wiegt 5% mehr</span></div>`}
function hotfix(){if(!S.meta)return;const out=shuffle(S.meta.slice()).slice(0,3),add=shuffle(CH.map((c,i)=>i).filter(c=>!S.meta.includes(c))).slice(0,3);
  S.meta=S.meta.filter(c=>!out.includes(c)).concat(add);const old=S.mst&&S.mst.style;if(R()<.5||!S.mst)metaShift();else S.mst.role=pick(ROLES);
  mail(`Hotfix ${S.year-2000}.${S.patch||1}`,`Der Entwickler ändert das Meta mitten im Split. Neu im Meta: ${add.map(c=>CH[c][0]).join(', ')}. Raus: ${out.map(c=>CH[c][0]).join(', ')}. Stil-Meta: ${STYLES[S.mst.style].n}${old&&old!==S.mst.style?' (vorher '+STYLES[old].n+')':''}, Rollen-Meta: ${RN[S.mst.role]}.`);
  metaLog(`Hotfix: ${STYLES[S.mst.style].n} und ${RN[S.mst.role]} im Fokus, neu: ${add.map(c=>CH[c][0]).join(', ')}`);
  news(`Hotfix verändert das Meta: ${STYLES[S.mst.style].n} und ${RN[S.mst.role]} im Fokus.`,'liga')}

/* ----- Verletzungen und Reha ----- */
const INJ=['Handgelenk','Sehnenscheide','Rücken','Grippe','Nackenverspannung','Fingerverletzung'];
function injChance(p){return clamp(.008+(p.load||0)/100*.01-p.d.sta/20*.004,.003,.02)}
function injWeek(){const U=S.teams[S.user];
  for(const id of [...U.roster,...(aca()?aca().roster:[])]){const p=S.players[id];if(!p||p.loan||isOut(p))continue;
    if(R()<injChance(p)){const long=R()<.1,wk=long?ri(5,9):ri(1,3),kind=pick(INJ);p.out={until:S.step+wk,why:'Verletzung',kind,wk};p.form=clamp(p.form-6,30,100);
      mail(`Verletzung: ${p.name}`,`${p.name} (${RN[p.role]}) fällt wegen ${kind} ${wk} ${wk===1?'Woche':'Wochen'} aus.${long?' Das ist eine längere Pause.':''} Ein Reha-Programm kostet ${eurK(rehaCost(p))} und verkürzt die Pause um eine Woche.`);break}}}
function rehaCost(p){return r1000(8000+ovr(p)*250)}
function rehaWhy(p){if(!p||!isMine(p)||!p.out||p.out.why!=='Verletzung'||!isOut(p))return 'Nicht verletzt.';if(p.out.reha)return 'Reha läuft bereits.';
  if(p.out.until-S.step<=1)return 'Er ist ohnehin nächste Woche zurück.';if(S.fin.balance<rehaCost(p))return 'Das Konto reicht nicht.';return null}
function startReha(pid){const p=S.players[pid],e=rehaWhy(p);if(e)return e;book('Reha',-rehaCost(p));p.out.until-=1;p.out.reha=true;return null}
function rehaBtn(p){return rehaWhy(p)===null?`<button class="btn ghost" data-a="reha" data-id="${p.id}">Reha-Programm (${eurK(rehaCost(p))})</button>`:''}

/* ----- Berater ----- */
const AGT={h:['Hartnäckig',1.08,-1,'verlangt mehr Gehalt und hat wenig Geduld'],f:['Fair',1,0,'bleibt sachlich'],v:['Vereinsnah',.95,1,'macht Zugeständnisse und lässt mit sich reden']};
function agentOf(p){if(!p.ag){const h=[...String(p.id)].reduce((a,c)=>a*31+c.charCodeAt(0),7)%100;p.ag={n:genRealName(pick(['EN','DE','FR','DK','KR','ES'])),t:h<30?'h':h<80?'f':'v'}}return p.ag}
function agF(p,renew){if(renew||isMine(p))return 1;return AGT[agentOf(p).t][1]}
function agPat(p,renew){return renew?0:AGT[agentOf(p).t][2]}
function agFee(p,t){const k=agentOf(p).t;return r100(t.sal*8*(k==='h'?1.25:k==='v'?.7:1))}
function agentRow(p){const a=agentOf(p),d=AGT[a.t];return `<div class="stat"><span class="muted">Berater</span><span>${a.n} <span class="${a.t==='h'?'warn':a.t==='v'?'good':'muted'}" style="font-size:12.5px">· ${d[0]}</span></span></div>`}

/* ----- Manager-Ruf und Lizenz ----- */
const MTIER=[[85,'Weltklasse-Lizenz'],[65,'Elite-Lizenz'],[45,'Pro-Lizenz'],[25,'Challenger-Lizenz'],[0,'Amateur-Lizenz']];
function mgrTier(){return MTIER.find(x=>(S.mrep||0)>=x[0])[1]}
function mgrAttr(){return Math.round(((S.mrep==null?30:S.mrep)-40)/12)}
function mgrBoard(){return clamp(Math.round(60+((S.mrep==null?30:S.mrep)-50)/4),45,75)}
function mgrSeason(){const s=S.summary;if(!s)return;S.mrep=S.mrep==null?30:S.mrep;const titles=S.trophies.filter(t=>t.year===S.year).length,sacked=S.board<SACK_AT;
  let d=clamp((s.exp-s.place)*1.5,-6,8)+titles*5+(S.board>=70?2:0)-(sacked?8:0);d=Math.round(d);S.mrep=clamp(S.mrep+d,0,100);
  S.mgr=S.mgr||[];S.mgr.unshift({year:S.year,d,v:S.mrep});if(S.mgr.length>10)S.mgr.length=10;
  mail('Dein Ruf als Manager',`${d>=0?'+':''}${d} auf ${S.mrep}. Lizenz: ${mgrTier()}. Ein höherer Ruf macht Spieler gesprächsbereiter und gibt dir bei neuen Vereinen mehr Vertrauen im Vorstand.`)}
function mgrPanel(){const v=S.mrep==null?30:S.mrep;return `<section class="panel s6"><div class="lab"><span>Manager-Ruf</span><span>${mgrTier()}</span></div>
  <div class="stat"><span class="muted">Ruf</span><span>${v} / 100</span></div>${bar(v,'var(--brass)')}
  <div class="stat"><span class="muted">Wirkung auf Ruf-Hürden</span><span>${mgrAttr()>0?'-':mgrAttr()<0?'+':'±'}${Math.abs(mgrAttr())} Punkte</span></div>
  <div class="stat"><span class="muted">Start-Vertrauen bei neuem Verein</span><span>${mgrBoard()}%</span></div>
  ${(S.mgr||[]).slice(0,4).map(x=>`<div class="stat"><span class="muted">${x.year}</span><span class="${x.d>=0?'good':'bad'}">${x.d>=0?'+':''}${x.d}</span></div>`).join('')}
  <p class="muted" style="font-size:13px;margin:10px 0 0">Der Ruf wächst mit Ligaplatz über Erwartung und mit Titeln. Eine Entlassung kostet ihn deutlich.</p></section>`}

/* ----- Fans und Events ----- */
const FGROUPS=[['ult','Ultras','Mögen offensiven Stil'],['fam','Familien','Mögen Eigengewächse'],['onl','Online-Community','Mag Content und Sichtbarkeit']];
function fgInit(){if(!S.fg)S.fg={ult:55,fam:55,onl:55};if(!S.fanlog)S.fanlog=[]}
function fgTarget(k){const U=S.teams[S.user],b=S.board/2;
  if(k==='ult')return 25+b+(['AGG','TF'].includes(U.style)?14:-4);
  if(k==='fam'){const yg=ROLES.filter(r=>{const p=S.players[U.starters[r]];return p&&p.age<=21}).length;return 25+b+yg*6-5}
  return 25+b+(S.fin.content||0)*8-3}
function fanLog(t){fgInit();S.fanlog.unshift({t,when:shortLabel()});if(S.fanlog.length>8)S.fanlog.length=8}
function fanWeek(){fgInit();const f=S.fin,U=S.teams[S.user];
  for(const[k]of FGROUPS)S.fg[k]=clamp(S.fg[k]+(fgTarget(k)-S.fg[k])*.12,10,100);
  const avg=(S.fg.ult+S.fg.fam+S.fg.onl)/3;f.fans=Math.round(f.fans*(1+(avg-60)/60000));
  if(S.step>2&&R()<.16){const e=pick(['march','spend','shit','choreo']);
    if(e==='march'){f.fans=Math.round(f.fans*1.02);for(const id of U.roster){const p=S.players[id];p.morale=clamp(p.morale+2,20,100)}const t='Fanmarsch zum Spieltag: Die Spieler spüren den Rückhalt.';mail('Fanmarsch',t);fanLog(t)}
    else if(e==='spend'){const a=r1000(8000+f.fans*.06);book('Fanspende',a);const t=`Der Fanclub sammelt ${eurK(a)} für das Team.`;mail('Fanspende',t);fanLog(t)}
    else if(e==='shit'){f.fans=Math.round(f.fans*.985);S.board=clamp(S.board-1,0,100);const t='Ein Shitstorm im Netz trifft den Verein. Die Fans sind genervt.';mail('Shitstorm',t);fanLog(t)}
    else{S.fg.ult=clamp(S.fg.ult+6,10,100);const t='Die Ultras planen eine Choreo für das nächste Heimspiel.';mail('Fan-Choreo',t);fanLog(t)}}}
function dropWhy(){fgInit();if(S.phase==='offseason')return 'Nur während der Saison.';if(S.drop!=null&&S.step-S.drop<8)return `Der nächste Drop ist ab Woche ${S.drop+8} möglich.`;if(S.fin.balance<dropCost())return 'Das Konto reicht nicht.';return null}
function dropCost(){return r1000(8000+S.teams[S.user].rep*100)}
function dropGain(){const avg=(S.fg.ult+S.fg.fam+S.fg.onl)/3,U=S.teams[S.user];return r1000(S.fin.fans*.15*(.5+avg/100)*(.8+clamp(teamOvr(U)-60,0,30)/60))}
function merchDrop(){const e=dropWhy();if(e)return e;const g=dropGain(),c=dropCost();book('Merch-Drop',-c);book('Merch-Drop',g);S.drop=S.step;
  const t=`Merch-Drop: ${eurK(g)} Umsatz bei ${eurK(c)} Kosten.`;mail('Merch-Drop',t);fanLog(t);return null}
function fansTab(){fgInit();const f=S.fin;
  return `<section class="panel s6"><div class="lab"><span>Fan-Gruppen</span><span>${f.fans.toLocaleString('de-DE')} Fans</span></div>
  ${FGROUPS.map(([k,n,d])=>`<div class="stat"><span>${n} <span class="muted" style="font-size:12.5px">· ${d}</span></span><span class="${S.fg[k]>=65?'good':S.fg[k]<40?'bad':''}">${Math.round(S.fg[k])}%</span></div>${bar(S.fg[k],S.fg[k]>=65?'var(--good)':S.fg[k]<40?'var(--bad)':'var(--brass)')}`).join('')}
  <p class="muted" style="font-size:13px;margin:10px 0 0">Die Stimmung zieht jede Woche zu einem Zielwert, der von Vorstandsvertrauen, Spielstil, jungen Starter und Content abhängt. Liegt der Schnitt über 60 %, wächst die Fanbasis.</p></section>
  <section class="panel s6"><div class="lab"><span>Merch-Drop</span><span>alle 8 Wochen</span></div>
  <div class="stat"><span class="muted">Kosten</span><span>${eurK(dropCost())}</span></div><div class="stat"><span class="muted">Erwarteter Umsatz</span><span>${eurK(dropGain())}</span></div>
  <div class="acts" style="margin-top:12px"><button class="btn" data-a="drop" ${dropWhy()?'disabled':''}>Drop starten</button></div>${dropWhy()?`<p class="muted" style="font-size:13px;margin:8px 0 0">${dropWhy()}</p>`:''}</section>
  <section class="panel s12"><div class="lab"><span>Zuletzt bei den Fans</span><span>${S.fanlog.length}</span></div>${S.fanlog.map(x=>`<div class="stat"><span>${x.t}</span><span class="dim">${x.when}</span></div>`).join('')||'<p class="empty">Noch nichts passiert.</p>'}</section>`}

/* ----- Lebendige Liga: Krisen, Trainerwechsel, Skandale, Übernahmen ----- */
function leagueEvent(){const L=Object.values(S.teams).filter(t=>t.tier!==2&&!t.academy&&t.id!==S.user&&t.starters&&ROLES.every(r=>S.players[t.starters[r]]));if(!L.length)return;
  const T=pick(L),e=pick(['crisis','coach','scandal','takeover']),st=ROLES.map(r=>S.players[T.starters[r]]);
  if(e==='crisis'){for(const p of st)p.form=clamp(p.form-10,30,100);T.rep=clamp(T.rep-1,30,100);news(`${T.name} steckt in der Krise: Die Stimmung im Team ist am Boden.`,'liga')}
  else if(e==='coach'){const old=T.style;T.style=pick(SK.filter(k=>k!==old));for(const p of st)p.morale=clamp(p.morale+8,20,100);news(`${T.name} entlässt den Trainer. Der Nachfolger setzt auf ${STYLES[T.style].n}.`,'liga')}
  else if(e==='scandal'){const p=pick(st);p.morale=clamp(p.morale-15,20,100);p.form=clamp(p.form-8,30,100);news(`Skandal bei ${T.name}: ${p.name} sorgt mit Aussagen im Netz für Ärger.`,'liga')}
  else{if(T.rep>=88)return;T.rep=clamp(T.rep+3,30,100);news(`Investoren übernehmen ${T.name}. Der Verein plant größer.`,'liga')}}

/* ----- Karriereende und Ex-Spieler ----- */
function retireChance(p){const a=p.age;if(a<33)return 0;if(a>=38)return 1;const base=a>=36?.6:a>=35?.4:a>=34?.25:.12;return clamp(base+(ovr(p)<62?.2:0)-(ovr(p)>=75?.1:0),0,.9)}
function retireSeason(){S.exs=[];const U=S.teams[S.user];
  for(const p of Object.values(S.players)){if(p.retired||p.loan)continue;if(p.team&&S.teams[p.team]&&S.teams[p.team].tier===2&&p.age<33)continue;
    if(R()>=retireChance(p))continue;const mine=isMine(p),peak=Math.max(ovr(p),...(p.hist||[]).map(h=>h.o));
    if(p.team)unsign(p);else S.fa=S.fa.filter(x=>x!==p.id);p.retired=true;p.team=null;p.listed=false;S.kn&&delete S.kn[p.id];
    if(S.short)S.short=S.short.filter(x=>x!==p.id);
    if(mine){mail(`Karriereende: ${p.name}`,`${p.name} (${RN[p.role]}, ${p.age} J.) beendet die Karriere. Höchster OVR: ${peak}.${peak>=72?' Er bietet an, dem Verein als Trainer oder Scout zu helfen.':''}`)}
    if(peak>=70)S.exs.push({id:p.id,name:p.name,role:p.role,peak,age:p.age});
    if(peak>=76)news(`${p.name} (${RN[p.role]}) beendet die Karriere nach ${p.age} Lebensjahren.`,'liga')}}
function exPool(){S.exs=S.exs||[];if(!S.exs.length)return;S.scoutPool=S.scoutPool||[];S.staffPool=S.staffPool||[];
  for(const x of S.exs.sort((a,b)=>b.peak-a.peak).slice(0,3)){
    const lvl=clamp(Math.round(x.peak/22),2,4),sc=genScout(lvl);sc.name=`${x.name} (Ex-Profi, ${x.role})`;sc.ex=true;sc.wage=Math.round(sc.wage*.85);sc.fee=0;sc.frole=x.role;S.scoutPool.unshift(sc);
    const st=genStaff(x.role==='SUP'||x.role==='JGL'?'an':'ac',clamp(x.peak/6,8,15));st.name=`${x.name} (Ex-Profi)`;st.ex=true;st.age=clamp(x.age+1,30,45);st.fee=0;S.staffPool.unshift(st)}
  if(S.scoutPool.length>6)S.scoutPool.length=6;if(S.staffPool.length>14)S.staffPool.length=14;S.exs=[]}

/* ----- Prämien aus Verträgen: Titelprämie an Spieler, Ablöse-Bonus an den Ex-Verein ----- */
function titleBonus(){const U=S.teams[S.user];let sum=0;for(const id of U.roster){const p=S.players[id];if(p&&p.tb&&!p.loan)sum+=p.tb}
  if(sum){book('Titelprämien',-sum);mail('Titelprämien ausgezahlt',`Für den Titel gehen ${eurK(sum)} an die Spieler.`)}}
function addonWeek(){const U=S.teams[S.user];for(const id of U.roster){const p=S.players[id];if(!p||!p.addon)continue;const a=p.addon,g=(p.st&&p.st.g)||0;
  if(g<a.l)a.l=0;a.c+=g-a.l;a.l=g;
  if(a.c>=a.g){book('Ablöse-Bonus',-a.amt);mail('Ablöse-Bonus fällig',`${p.name} hat ${a.g} Spiele für dich bestritten. ${eurK(a.amt)} gehen an ${S.teams[a.team]?S.teams[a.team].name:'den Ex-Verein'}.`);delete p.addon}}}

/* ----- Branchenwachstum: Marktindex steigt jede Saison um 3 bis 9 Prozent ----- */
function ecoSeason(){S.eco=S.eco||1;S.ecoLog=S.ecoLog||[];const g=+(.03+R()*.06).toFixed(3);S.eco=+(S.eco*(1+g)).toFixed(4);S.ecoLog.unshift({year:S.year+1,g,v:S.eco});if(S.ecoLog.length>10)S.ecoLog.length=10;
  mail(`Marktentwicklung ${S.year+1}`,`Die Branche wächst um ${(g*100).toFixed(1).replace('.',',')} %. Gehälter, Ablösen, Sponsoren, Einnahmen und Preisgelder steigen mit. Marktindex: ${Math.round(S.eco*100)}.`);
  news(`Die Branche wächst: Gehälter und Sponsoren legen um ${(g*100).toFixed(1).replace('.',',')} % zu.`,'liga')}
function ecoPanel(){const L=S.ecoLog||[];return `<section class="panel s12"><div class="lab"><span>Marktindex</span><span>${Math.round(eco()*100)}</span></div>
  <p class="muted" style="font-size:13px;margin:0 0 8px">Die Branche wächst jede Saison um 3 bis 9 Prozent. Gehälter, Ablösen, Sponsoren, Liga-Ausschüttung, Streams, Merch und Preisgelder steigen mit dem Index. Laufende Verträge ändern sich erst bei der Verlängerung, Infrastruktur, Content und Hardware kosten gleich viel.</p>
  ${L.slice(0,5).map(x=>`<div class="stat"><span class="muted">${x.year}</span><span>+${(x.g*100).toFixed(1).replace('.',',')} % · Index ${Math.round(x.v*100)}</span></div>`).join('')||'<p class="empty">Noch keine Saison abgeschlossen.</p>'}</section>`}

/* ----- Managerwechsel der KI-Vereine: Zum Saisonende trennen sich Vereine von Managern, die unter den Erwartungen blieben ----- */
function mgrName(){return genRealName(pick(['DE','KR','FR','ES','EN','DK','SE','CN','BR','PL']))}
function perfGap(T){const pl=[];for(const c of CAL){if(c.type!=='split'||!S.rec||!S.rec[c.id])continue;const arr=S.rec[c.id][T.reg];const i=arr?arr.indexOf(T.id):-1;if(i>=0)pl.push(i+1)}
  if(!pl.length)return 0;return pl.reduce((a,b)=>a+b,0)/pl.length-expected(T.id)}
function fireMgr(T,why){if(!T.mgr||T.vac)return;const old=T.mgr;T.mgr=null;T.vac=true;news(`${T.name} trennt sich von Manager ${old}. ${why||'Der Verein sucht einen Nachfolger.'}`,'liga')}
function mgrCarousel(){const U=S.user,L=Object.values(S.teams).filter(t=>t.tier!==2&&!t.academy&&t.id!==U&&t.mgr);
  for(const T of L){const g=perfGap(T),ch=g<=-2?.01:clamp(.04+Math.max(0,g)*.08,.04,.55);if(R()<ch)fireMgr(T,g>0?'Die Saison blieb unter den Erwartungen.':'Der Verein will einen Neuanfang.')}}
/* Mindestens n Vereine aus der Auswahl brauchen einen neuen Manager: die mit dem schlechtesten Saisonverlauf trennen sich zuerst. */
function ensureVac(cands,n){const have=cands.filter(t=>t.vac).length;if(have>=n)return;
  const pool=cands.filter(t=>!t.vac&&t.mgr).map(t=>[t,perfGap(t)+R()*2]).sort((a,b)=>b[1]-a[1]);
  for(const [t] of pool.slice(0,n-have))fireMgr(t,'Der Verein will sich neu aufstellen.')}
function fillVacancies(){for(const T of Object.values(S.teams)){if(!T.vac||T.id===S.user)continue;T.mgr=mgrName();T.vac=false;if(R()<.4)news(`${T.name} stellt ${T.mgr} als neuen Manager vor.`,'liga')}}

/* ----- Auf- und Abstieg: Der Letzte jeder Liga spielt gegen den T2-Meister der Region (Bo5) ----- */
const T1SUF=['Esports','Gaming','United','Legion','Titans','Collective'];
function t2Champ(reg){const x=t2Table(reg).map(r=>S.teams[r.id]).find(t=>t&&!t.academy&&t.tier===2);return x||null}
/* Der Erstligist hat in der Relegation Erfahrung und Heimvorteil: RELB Teamstärke obendrauf (gemessen: rund 78 % Klassenerhalt des Letzten, etwa eine Relegation mit Abstieg pro Saison in allen Regionen zusammen) */
const RELB=7;
function relSeries(A,B){const w=[0,0];let gi=1;A.relB=RELB;try{while(w[0]<3&&w[1]<3&&gi<=5){const g=newSim(A,B,{gi},undefined,false);while(!simTick(g)){}w[g.winner===0?0:1]++;gi++}}finally{delete A.relB}return{w,win:w[0]>w[1]}}
function teamTag(T){let t=(T.name.split(' ')[0]||'XXX').replace(/[^A-Za-z]/g,'').slice(0,3).toUpperCase();const used=new Set(Object.values(S.teams).filter(x=>x!==T).map(x=>(x.tag||x.id).slice(0,3)));
  if(t.length<3)t=(t+'XXX').slice(0,3);for(let i=0;used.has(t)&&i<26;i++)t=t.slice(0,2)+String.fromCharCode(65+i);return t}
/* Der Aufsteiger holt die besten Vereinslosen, damit er nicht chancenlos ist */
function boostPromoted(T){for(const r of ROLES){const cur=S.players[T.starters[r]];const best=S.fa.map(i=>S.players[i]).filter(p=>p&&!p.retired&&p.role===r&&ovr(p)<=T.rep+6&&canJoinReg(p,T.reg)&&impOk(p,T,T.starters[r])).sort((a,b)=>ovr(b)-ovr(a))[0];
    if(best&&(!cur||ovr(best)>ovr(cur)+3)){best.contract=2;best.salary=salaryFor(ovr(best));sign(best,T,true)}}
  while(T.roster.length>MAXR){const w=T.roster.map(i=>S.players[i]).filter(p=>!isStarter(p)).sort((a,b)=>ovr(a)-ovr(b))[0];if(!w)break;toFA(w)}ensureRoles(T,false)}
function swapTiers(down,up){const reg=down.reg,low=Math.min(...teamsOf(reg).filter(t=>t!==down).map(t=>t.rep));
  up.tier=1;up.academy=false;up.rep=clamp(Math.max(up.rep,low-2),48,66);up.name=up.name.replace(/ (Rising|Next|Prospects|Rookies|Challengers|Ascend|Youth|Nova)$/,()=>' '+pick(T1SUF));up.tag=teamTag(up);up.mgr=mgrName();up.vac=false;
  down.tag=down.tag||(down.id.length>3?down.id.slice(0,3):down.id);down.tier=2;down.rep=Math.max(34,down.rep-8);
  if(down.id!==S.user){down.mgr=null;down.vac=false}
  boostPromoted(up)}
function relegationSeason(){S.relegUser=false;S.releg=S.releg||[];
  for(const r of REGS){const o=S.rec&&S.rec.S3&&S.rec.S3[r];if(!o||o.length<4)continue;
    const A=S.teams[o[o.length-1]],B=t2Champ(r);if(!A||!B||A.tier===2||A.academy)continue;
    const res=relSeries(A,B),sc=res.w[0]+':'+res.w[1],mine=A.id===S.user;
    if(res.win){news(`${A.name} hält die Klasse: ${sc} in der Relegation gegen ${B.name}.`,'liga');
      S.releg.unshift({year:S.year,reg:r,stay:A.id,other:B.id,names:[A.name,B.name],sc,down:false});
      if(mine)mail('Relegation gewonnen',`Du bist Letzter geworden, setzt dich aber in der Relegation gegen ${B.name} durch (${sc}). Klassenerhalt.`)}
    else{const an=A.name,bn0=B.name;swapTiers(A,B);news(`${an} steigt ab: ${sc} in der Relegation gegen ${bn0}. ${B.name} ist neu in der ${r}.`,'liga');
      S.releg.unshift({year:S.year,reg:r,stay:B.id,other:A.id,names:[B.name,an],sc,down:true});
      if(mine){S.relegUser=true;mail('Abstieg',`${an} verliert die Relegation gegen ${bn0} (${sc}) und steigt aus der ${r} ab.`)}else if(R()<.7)fireMgr(A,'Der Abstieg kostet den Manager den Job.')}}
  if(S.releg.length>16)S.releg.length=16}
function crisisList(){const L=Object.values(S.teams).filter(t=>t.tier!==2&&!t.academy&&(t.fs||0)>=BK_CRISIS*.6).sort((a,b)=>(b.fs||0)-(a.fs||0));
  return L.length?`<div class="lab" style="margin-top:12px"><span>Finanzlage</span><span>${L.length}</span></div>`+L.slice(0,6).map(t=>`<div class="stat"><span>${t.name} · ${t.reg}</span><span class="${t.fs>=BK_BUST*.8?'bad':'dim'}">${finState2(t)}</span></div>`).join(''):''}
function relegPanel(){const L=S.releg||[];return `<section class="panel s12"><div class="lab"><span>Auf- und Abstieg</span><span>${L.length}</span></div>
  ${L.slice(0,8).map(x=>`<div class="stat"><span>${x.year} · ${x.reg}: ${x.bankrupt?`${x.names[1]} meldet Insolvenz, <b>${x.names[0]}</b> rückt nach`:x.down?`<b>${x.names[0]}</b> steigt auf, ${x.names[1]} steigt ab`:`${x.names[0]} hält die Klasse gegen ${x.names[1]}`}</span><span class="dim">${x.sc}</span></div>`).join('')||'<p class="empty">Noch keine Relegation gespielt.</p>'}
  ${crisisList()}
  <p class="muted" style="font-size:13px;margin:10px 0 0">Der Letzte jeder Liga spielt am Saisonende gegen den Meister der T2-Szene seiner Region (Bo5). Vereine mit dauerhaft zu hohen Gehältern geraten in eine Krise und gehen im Extremfall insolvent. Dann rückt der T2-Meister nach. Verlierst du als Manager, musst du den Verein verlassen und bekommst Angebote anderer Vereine.</p></section>`}

/* ----- KI-Finanzen: Dauerhafte Verluste führen zur Krise und schließlich zur Insolvenz ----- */
/* Pro Saison: Marge m = (Einnahmen mal Tabellenform - Gehälter - Fixkosten) / Einnahmen. Druck T.fs steigt bei Verlust, sinkt bei Gewinn,
   hohe Vereine haben Reserven. Ab BK_CRISIS meldet der Verein eine Krise (er verkauft einen Star), ab BK_BUST droht die Insolvenz (30 % Rettung durch Investoren). */
const BK_CRISIS=1.0,BK_BUST=2.0;
function aiInc(T){const rv=(REGREV[T.reg]||1)*eco();return((sponsorFor(T.rep)+6000)/1.5*2.1+T.rep*2000*.03)*rv+Math.round((LSHARE[T.reg]||4000)*eco())}
function aiWages(T){return T.roster.reduce((a,i)=>a+(S.players[i]?S.players[i].salary:0),0)}
function aiMargin(T,place,n,exp){const perf=1.14-.34*((place-1)/Math.max(1,n-1)),inc=aiInc(T)*perf;return(exp==null?.55:exp)+.1-(aiWages(T)+3500*eco())/inc}
function aiExp(L){const x=L.map(t=>t.rep),y=L.map(t=>(aiWages(t)+3500*eco())/aiInc(t)),n=x.length,mx=x.reduce((a,b)=>a+b,0)/n,my=y.reduce((a,b)=>a+b,0)/n;let sxy=0,sxx=0;for(let i=0;i<n;i++){sxy+=(x[i]-mx)*(y[i]-my);sxx+=(x[i]-mx)**2}const k=sxx?sxy/sxx:0;return t=>my+k*(t.rep-mx)}
function finState2(T){const f=T.fs||0;return f>=BK_BUST?'Insolvenzgefahr':f>=BK_CRISIS?'Krise':f>=.5?'Angespannt':'Gesund'}
function liquidate(T){for(const id of [...T.roster]){const p=S.players[id];if(p)toFA(p)}
  for(const r of ROLES){const p=genPlayer(r,ri(44,50)+Math.round(Math.max(0,T.rep-40)/6),ri(16,19),T.reg);p.pot=clamp(ovr(p)+ri(8,22),ovr(p),90);p.salary=Math.min(p.salary,500);sign(p,T,true)}
  T.starters={};for(const r of ROLES){const b=T.roster.map(i=>S.players[i]).filter(p=>p.role===r).sort((a,b)=>ovr(b)-ovr(a))[0];if(b)T.starters[r]=b.id}}
function bankrupt(T,up){const reg=T.reg,nm=T.name,un=up.name;swapTiers(T,up);liquidate(T);T.rep=Math.max(30,T.rep-6);T.fs=0;up.fs=0;
  news(`${nm} meldet Insolvenz an und startet neu in der T2-Szene. ${up.name} rückt in die ${reg} nach.`,'liga');
  S.releg=S.releg||[];S.releg.unshift({year:S.year,reg,stay:up.id,other:T.id,names:[up.name,nm],sc:'Insolvenz',down:true,bankrupt:true});if(S.releg.length>16)S.releg.length=16}
function aiFinSeason(){const out=[];
  for(const r of REGS){const o=S.rec&&S.rec.S3&&S.rec.S3[r];const L=teamsOf(r).filter(t=>t.id!==S.user&&!t.academy);
    const expF=aiExp(L);
    for(const T of L){const place=o?Math.max(1,o.indexOf(T.id)+1):Math.ceil(teamsOf(r).length/2),n=teamsOf(r).length;
      const m=aiMargin(T,place,n,expF(T));const res=(T.rep-60)/100;
      T.fs=Math.max(0,+((T.fs||0)*.7+(m<0?(.0-m)*3:-.15)-res*.1).toFixed(3));
      if(T.fs>=BK_CRISIS&&!T.crisis){T.crisis=true;news(`${T.name} kämpft mit finanziellen Problemen: Sponsoren fehlen und die Gehälter sind zu hoch.`,'liga');
        const star=T.roster.map(i=>S.players[i]).sort((a,b)=>ovr(b)-ovr(a))[0];if(star&&T.roster.length>6&&R()<.6){T.rep=Math.max(34,T.rep-2)}}
      if(T.fs<BK_CRISIS*.6)T.crisis=false;
      if(T.fs>=BK_BUST)out.push(T)}}
  for(const T of out){const up=t2Champ(T.reg);if(!up||T.tier===2)continue;
    if(R()<.3){T.fs=BK_CRISIS*.5;T.crisis=false;news(`Investoren retten ${T.name} vor der Insolvenz.`,'liga');continue}
    bankrupt(T,up)}}

/* ----- Wöchentlicher Haken und Saisonende ----- */
function worldWeek(){
  if(!S.mst)metaShift();
  if(S.ev&&S.ev.type==='split'&&S.step>0&&S.step%7===3&&S.phase!=='offseason')hotfix();
  injWeek();fanWeek();addonWeek();try{extrasWeek()}catch(e){}
  if(R()<.5)leagueEvent()}
function worldSeasonEnd(){mgrCarousel();mgrSeason();try{extrasSeason()}catch(e){}}

/* ----- Saisonrückblick ----- */
function reviewData(){const U=S.teams[S.user],c=(S.career&&S.career[0]&&S.career[0].year===S.year)?S.career[0]:null,s=S.summary,y=String(S.year);
  const titles=S.trophies.filter(t=>t.year===S.year),tx=(S.txlog||[]).filter(r=>String(r.when||'').startsWith(y)),
    ps=U.roster.map(i=>S.players[i]).map(p=>[p,sm(p.st)]).filter(([,m])=>m.g>=3).sort((a,b)=>b[1].rt-a[1].rt).slice(0,3);
  const lg=(S.news||[]).filter(n=>n.cat==='liga'&&String(n.when||'').startsWith(y)).slice(0,5);
  return{U,c,s,titles,tx,ps,lg}}
function reviewText(){const d=reviewData(),U=d.U;const L=[`Saisonrückblick ${S.year}: ${U.name}`];
  if(d.s)L.push(`Platz ${d.s.place} (Ziel: Platz ${d.s.exp}), Vorstandsvertrauen ${Math.round(S.board)}%`);else L.push(`Saison läuft, Vorstandsvertrauen ${Math.round(S.board)}%`);
  L.push(`Titel: ${d.titles.length?d.titles.map(t=>t.name).join(', '):'keiner'}`);
  if(d.ps.length)L.push('Beste Spieler: '+d.ps.map(([p,m])=>`${p.name} (${f1(m.rt,2)})`).join(', '));
  L.push(`Manager-Ruf: ${S.mrep==null?30:S.mrep} (${mgrTier()})`);
  if(S.mst)L.push(`Meta: ${STYLES[S.mst.style].n}, ${RN[S.mst.role]}`);
  return L.join('\n')}
function reviewView(){const d=reviewData(),U=d.U;
  return `<div class="pagehead"><div><h1>Saisonrückblick ${S.year}</h1><p>${U.name} · ${S.phase==='offseason'?'Saison abgeschlossen':'Saison läuft'}</p></div><div class="acts"><button class="btn ghost" data-a="revcopy">Als Text kopieren</button></div></div>${mgrTabs()}
  <div class="grid"><section class="panel s6"><div class="lab">Bilanz</div>
   <div class="stat"><span class="muted">Ligaplatz</span><span>${d.s?'Platz '+d.s.place+' (Ziel '+d.s.exp+')':'noch offen'}</span></div>
   <div class="stat"><span class="muted">Titel</span><span>${d.titles.length?d.titles.map(t=>t.name).join(', '):'keiner'}</span></div>
   <div class="stat"><span class="muted">Vorstandsvertrauen</span><span class="${S.board>=60?'good':S.board<35?'bad':''}">${Math.round(S.board)}%</span></div>
   <div class="stat"><span class="muted">Konto</span><span>${eurK(S.fin.balance)}</span></div>
   <div class="stat"><span class="muted">Manager-Ruf</span><span>${S.mrep==null?30:S.mrep} · ${mgrTier()}</span></div></section>
  <section class="panel s6"><div class="lab">Beste Spieler</div>${d.ps.length?d.ps.map(([p,m],i)=>`<button class="lbrow" data-a="player" data-id="${p.id}"><span class="pos">${i+1}</span><span class="nmcell">${p.name}<small class="dim"> ${p.role}</small></span><b class="mono">${f1(m.rt,2)}</b></button>`).join(''):'<p class="empty">Noch zu wenige Spiele.</p>'}</section>
  <section class="panel s6"><div class="lab"><span>Transfers</span><span>${d.tx.length}</span></div>${d.tx.map(r=>{const p=S.players[r.pid];return p?`<div class="stat"><span>${r.type==='sell'?'Verkauf':r.type==='buy'?'Kauf':'Ablösefrei'}: ${p.name}</span><span>${r.fee?eurK(r.fee):'-'}</span></div>`:''}).join('')||'<p class="empty">Keine Transfers in dieser Saison.</p>'}</section>
  <section class="panel s6"><div class="lab"><span>Aus der Liga</span><span>${d.lg.length}</span></div>${d.lg.map(n=>`<div class="stat"><span>${n.t}</span></div>`).join('')||'<p class="empty">Keine Meldungen.</p>'}</section></div>`}

/* Gegner-Analyse vor dem Draft: Bann-Tipps aus dem Pool des Gegners, erwartete Bans gegen dich */
function banTips(O,an){if(an<2)return `<div class="stat"><span class="muted">Draft-Plan</span><span class="dim">Analyst Level 2 nötig</span></div>`;
  const U=S.teams[S.user],mine=aiBans(O).map(c=>CH[c][0]),exp=an>=3?aiBans(U).map(c=>CH[c][0]):null;
  return `<div class="stat"><span class="muted">Bann-Tipp</span><span style="font-family:var(--f-body);text-align:right">${mine.join(', ')}</span></div>
  <div class="stat"><span class="muted">Er bannt wohl</span><span style="font-family:var(--f-body);text-align:right">${exp?exp.join(', '):'<span class="dim">Analyst Level 3 nötig</span>'}</span></div>`}
