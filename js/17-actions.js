/* ===== Aktionen ===== */
const ACT={
  startreg(d){STARTREG=d.v;render()},
  pickteam(d){const n=($('#mgr')||{}).value;useSlot(NEWSLOT||freeSlot()||SLOT);NEWSLOT=null;newGame(d.id,(n||'').trim()||'Manager');render()},
  nav2(d){if(liveLocked())return;if(MODAL==='reset')MODAL=null;
    if(d.k==='KTAB')KTAB=d.t;else if(d.k==='TACTAB')TACTAB=d.t;else if(d.k==='TTAB')TTAB=d.t;else if(d.k==='LTAB')LTAB=d.t;else if(d.k==='CLUBTAB')CLUBTAB=d.t;
    if(d.v==='save'){EXP=null;IMPMSG=null}
    if(d.v==='transfer'&&d.t==='scout')(S.reports||[]).forEach(r=>r.seen=true);S.view=d.v;window.scrollTo(0,0);render()},
  ibf(d){IBF=d.v;render()},
  expmake(){EXP={txt:'',when:''};packSave().then(t=>{EXP={txt:t,when:`${shortLabel()}, Woche ${S.step}`};render()}).catch(e=>{EXP={err:'Export fehlgeschlagen: '+(e&&e.message||e)};render()});render()},
  expcopy(){if(!EXP||!EXP.txt)return;const sel=()=>{const ta=document.querySelector('#exptxt');if(ta){ta.focus();ta.select()}};
    try{navigator.clipboard.writeText(EXP.txt).then(()=>{EXP.msg=['good','Kopiert. Füge den Text jetzt irgendwo sicher ein, zum Beispiel in deine Notizen.'];render()},()=>{EXP.msg=['warn','Automatisches Kopieren klappt hier nicht. Der Text ist markiert, kopiere ihn von Hand.'];sel()})}catch(e){EXP.msg=['warn','Automatisches Kopieren klappt hier nicht. Der Text ist markiert, kopiere ihn von Hand.'];sel()}},
  impgo(){const ta=document.querySelector('#imptxt');IMPMSG=null;doImport(ta?ta.value:'')},
  simmenu(){if(LIVE||S.phase==='offseason')return;MODAL='sim';render()},
  simgo(d){simStart(d.v);render();setTimeout(simLoop,30)},
  simtog(){S.simStop=!S.simStop;save();render()},
  simhalt(){if(SIMRUN){SIMRUN.why='Von dir angehalten.';simFinish()}render()},
  simclose(d){if(MODAL==='sim')MODAL=null;SIMREP=null;if(d.go==='inbox'){IBF='ALL';S.view='inbox'}window.scrollTo(0,0);render()},
  tb(d){tbDo(d.v);render()},nwf(d){NWF=d.v;render()},
  nav(d){if(LIVE&&(LIVE.phase==='live'||LIVE.phase==='intro'))return;if(d.v==='tactic')TACTAB='tac';if(MODAL==='reset')MODAL=null;S.view=d.v;window.scrollTo(0,0);render()},
  vreg(d){VIEWREG=d.v;render()},
  next(){if(S.phase==='offseason'){if(S.jobless){S.view='jobs';render();return}S.jobs=null;newSeason();render();return}const p=userPending();if(p)openSeries(p);else{step();S.view='home'}window.scrollTo(0,0);render()},
  skipto(){let g=0;while(S.phase!=='offseason'&&!userPending()&&g++<80)step();S.view='home';render()},
  resume(){S.view=LIVE.phase==='pre'?'prematch':LIVE.phase==='draft'?'draft':'live';render()},
  kickoff(){startDraft();window.scrollTo(0,0);render()},
  dban(d){const D=LIVE.draft,c=+d.c,i=D.myBans.indexOf(c);if(i>=0)D.myBans.splice(i,1);else if(D.myBans.length<3)D.myBans.push(c);render()},
  dbansok(){const D=LIVE.draft,s=LIVE.series,O=S.teams[myS()===0?s.b:s.a];D.oppPicks=aiPicks(O,[...D.myBans,...D.oppBans],[],D.oppRoles);D.step='pick';window.scrollTo(0,0);render()},
  dpick(d){const D=LIVE.draft;D.picks[d.r]=+d.c;render()},
  dauto(){const D=LIVE.draft,s=LIVE.series,U=S.teams[S.user],O=S.teams[myS()===0?s.b:s.a];
    if(D.step==='ban'){D.myBans=aiBans(O);D.oppPicks=aiPicks(O,[...D.myBans,...D.oppBans],[],D.oppRoles);D.step='pick'}
    D.picks=aiPicks(U,draftTaken(),[],ROLES,D.oppPicks);render()},
  dok(){if(!ROLES.every(r=>LIVE.draft.picks[r]!=null))return;finishDraft();window.scrollTo(0,0);render()},
  press(d){pressAnswer(+d.v);render()},
  quick(){while(!seriesOver()){const s=LIVE.series;recordGame(simGame(S.teams[s.a],S.teams[s.b],gctx()))}commitSeries();LIVE=null;if(!userPending())step();S.view='home';window.scrollTo(0,0);render()},
  talk(d){doTalk(d.v);save();render()},
  speed(d){LIVE.speed=+d.v;LIVE.slow=0;loop();render()},
  gostart(){if(!LIVE||LIVE.phase!=='intro')return;LIVE.phase='live';window.scrollTo(0,0);render();loop()},
  tick1(){if(!LIVE||LIVE.phase!=='live')return;if(simTick(LIVE.sim))gameDone();render()},
  nextm(){if(!LIVE||LIVE.phase!=='live')return;const z=LIVE.sim,n0=z.ev.length;let done=false,g=0;
    while(g++<90){done=simTick(z);if(done||z.ev.slice(n0).some(e=>e.w>=2))break}
    clearInterval(LIVE.timer);LIVE.speed=3;if(done)gameDone();render()},
  snd(){SND=!SND;try{localStorage.setItem('riftmgr_snd',SND?'1':'0')}catch(e){}if(SND&&LIVE)lvBeep({side:myS(),w:2});render()},
  lvtab(d){LIVE.tab=d.v;render()},
  lvf(d){LIVE.filter=d.v;render()},
  pin(d){LIVE.pin=LIVE.pin===d.id?null:d.id;if(LIVE.filter==='pin'&&!LIVE.pin)LIVE.filter='key';render()},
  evsel(d){LIVE.sel=LIVE.sel===+d.i?null:+d.i;liveRefresh()},
  skip(){while(!simTick(LIVE.sim));gameDone();render()},
  nextgame(){LIVE.phase='pre';LIVE.press=null;S.view='prematch';window.scrollTo(0,0);render()},
  after(){LIVE=null;if(!userPending())step();S.view='home';window.scrollTo(0,0);render()},
  style(d){TACE=S.tacA;editTac('style',d.v);render()},
  focus(d){TACE=S.tacA;editTac('focus',d.v);render()},
  tset(d){editTac(d.k,d.v);render()},
  trole(d){editTac(null,d.v,d.r);render()},
  tedit(d){TACE=+d.v;render()},
  tact(d){S.tacA=+d.v;TACE=+d.v;applyTac();save();render()},
  tcopy(d){const i=+d.v,src=S.tacs[S.tacA],n=S.tacs[i].name;S.tacs[i]=JSON.parse(JSON.stringify(src));S.tacs[i].name=n;save();render()},
  nego(d){if(startNego(d.t,d.id))window.scrollTo(0,0);else if(S.view!=='player'&&PV&&PV.id===d.id){PV.tab='vertrag';PV.back=S.view;S.view='player';window.scrollTo(0,0)}render()},
  ngfee(d){NG.fee.amt=Math.max(0,NG.fee.amt+ +d.v);render()},
  ngpay(d){NG.fee.pay=d.v;render()},ngsell(d){NG.fee.sell=+d.v;render()},
  ngsend(){if(!NG.dead&&!NG.done)sendFee();save();render()},
  ngnudge(d){const[mn,mx]=ngRange(d.k);ngPut(d.k,clamp(ngGet(d.k)+ +d.v,mn,mx));render()},
  ngalt(){if(!NG.dead&&!NG.done)ngAlt();render()},
  ngsal(d){NG.terms.sal=Math.max(800,NG.terms.sal+ +d.v);render()},
  ngyrs(d){NG.terms.yrs=+d.v;render()},ngrole(d){NG.terms.role=d.v;render()},
  ngsb(d){NG.terms.sb=+d.v;render()},ngwb(d){NG.terms.wb=+d.v;render()},ngcl(d){NG.terms.cl=+d.v;render()},
  ngdem(){NG.terms.sal=NG.dem.sal;NG.terms.yrs=NG.dem.yrs;NG.terms.role=NG.dem.role;render()},
  ngfit(){const n=ngNeed();applyFit(fitPlan(n.t,n.w));save();render()},
  ngfin(){const n=ngNeed();applyFit(fitPlan(n.t,n.w),true);save();render()},
  ngauto(d,el){S.autoFit=!!(el&&el.checked);save();render()},
  ngsign(){if(!NG.dead&&!NG.done)sendContract();save();render()},
  ngleave(){const id=NG.pid;NG=null;const back=PV&&PV.back||'squad';PV={id,tab:'vertrag',back};S.view='player';window.scrollTo(0,0);render()},
  counter(d){const m=S.inbox.find(x=>x.id===+d.id);if(!m||m.done||m.countered)return;m.countered=true;const p=S.players[m.pid];
    if(R()<(p&&p.listed?.65:.5)){m.fee=r1000(m.fee*1.2);m.body+=` Nach deinem Gegenangebot erhöht ${S.teams[m.from].name} auf ${eurK(m.fee)}.`}else{m.done=true;m.result='Verein hat das Angebot zurückgezogen'}save();render()},
  train(d){S.training.focus=d.v;save();render()},
  intens(d){S.training.intensity=d.v;save();render()},
  frole(d){FILT.role=d.v;FILT.n=40;render()},
  fsrc(d){FILT.src=d.v;FILT.n=40;render()},
  fnoimp(){FILT.noimp=!FILT.noimp;FILT.n=40;render()},
  faff(){FILT.afford=!FILT.afford;FILT.n=40;render()},
  fmore(){FILT.n+=40;render()},
  cfno(){MODAL=null;render()},
  qs(){qsOpen()},
  qsgo(d){qsGo(+d.i)},
  cmp(d){if(d.b){CMP=[d.id,d.b]}else if(CMP&&CMP.length===1&&CMP[0]!==d.id){CMP=[CMP[0],d.id]}else{CMP=[d.id];pmsg(d.id,'Gemerkt. Öffne einen zweiten Spieler und tippe dort auf Vergleichen.',true);render();return}S.view='cmp';window.scrollTo(0,0);render()},
  cmpclose(){CMP=null;S.view='squad';render()},
  capt(d){const m=setCapt(d.id);pmsg(d.id,m,!/Nur Starter/.test(m));save();render()},
  rest(d){const e=restWeek(d.id);pmsg(d.id,e||'Er bekommt diese Woche frei und baut Belastung ab.',!e);if(!e){const U=S.teams[S.user],p=S.players[d.id];if(isStarter(p)){const fo=fixOut(U);if(!fo.length)pmsg(d.id,'Frei gegeben. Ohne Ersatz auf seiner Position spielt er trotzdem.',true)}}save();render()},
  scrimask(d){const e=scrimAsk(d.v);mail(e?'Scrim-Absage':'Scrim-Partner gefunden',e||`${S.teams[d.v].name} scrimmt die nächsten ${SCRIMWK} Wochen mit euch.`);save();render()},
  psub(d){if(!LIVE||LIVE.phase!=='pre')return;const U=S.teams[S.user],p=S.players[d.id];if(!p||p.team!==S.user||isOut(p))return;const cur=S.players[U.starters[p.role]];
    if(impWhy(p)&&!(cur&&isImp(cur,U.reg)))return;U.starters[p.role]=p.id;if(cur){cur.morale=clamp(cur.morale-2,20,100)}p.morale=clamp(p.morale+2,20,100);
    (LIVE.subs=LIVE.subs||[]).push([p.id,cur?cur.id:null]);render()},
  jobs(){S.view='jobs';window.scrollTo(0,0);render()},
  jobtake(d){if(d.ok!=='1'){const T=S.teams[d.v];return askConfirm('jobtake',{v:d.v},`${T.name} übernehmen?`,`Du verlässt ${S.teams[S.user].name}. Trainerstab, Scouts, Finanzen und Academy bleiben beim alten Verein. Dein Spielstand läuft mit ${T.name} weiter.`,'Übernehmen')}
    MODAL=null;const e=switchTeam(d.v);if(e)mail('Wechsel nicht möglich',e);save();window.scrollTo(0,0);render()},
  reha(d){const e=startReha(d.id);if(e)pmsg(d.id,e,false);save();render()},
  drop(){merchDrop();save();render()},
  revcopy(){const t=reviewText();try{navigator.clipboard.writeText(t)}catch(e){}mail('Saisonrückblick kopiert',t);render()},
  jobstay(){if(S.jobless)return;S.jobs=null;S.view='home';save();render()},
  trial(d){const e=startTrial(d.id);pmsg(d.id,e||'Er trainiert diese Woche bei euch mit. Der Bericht kommt nächste Woche.',!e);save();render()},
  linmenu(d){const p=S.players[d.id];if(!p)return;MODAL={lin:p.id};render()},
  linoffer(d){const e=loanIn(d.id,+d.v);MODAL=null;pmsg(d.id,e||'Leihe perfekt. Er gehört bis Saisonende zu deinem Kader.',!e);if(S.view!=='player'){PV.tab='vertrag';PV.back=S.view;S.view='player'}save();render()},
  linend(d){if(d.ok!=='1'){const p=S.players[d.id];return askConfirm('linend',{id:d.id},`Leihe von ${p.name} beenden?`,`Er geht sofort zurück zu seinem Verein. Die Leihgebühr von ${eurK(p.loan.fee||0)} bekommst du nicht zurück.`,'Leihe beenden')}
    MODAL=null;const e=loanInEnd(d.id);if(e)pmsg(d.id,e,false);else{S.view='squad';PV=null}save();render()},
  lendmenu(d){const p=S.players[d.id];if(!canLoan(p))return;MODAL={loan:p.id};render()},
  lend(d){const e=loanOut(d.id,d.t);MODAL=null;if(e)loanErr(d.id,e);save();render()},
  lendback(d){const r=loanBack(d.id);if(typeof r==='string')loanErr(d.id,r);else mail('Leihe beendet',`${S.players[d.id].name} ist zurück (${r.g} Spiele, OVR ${r.d>=0?'+':''}${r.d}).`);save();render()},
  slotpick(d){NEWSLOT=+d.v;render()},
  slotload(d){const n=+d.v;if(LIVE||!slotInfo(n))return;if(S)save();useSlot(n);S=null;NG=null;PV=null;MODAL=null;SIMREP=null;HKEY=null;load();if(S)S.view='home';window.scrollTo(0,0);render()},
  slotdel(d){const n=+d.v;if(S&&n===SLOT)return;
    if(d.ok!=='1'){const m=slotInfo(n);return askConfirm('slotdel',{v:n},`Platz ${n} löschen?`,`Der Spielstand mit ${m?esc(m.team)+', Saison '+m.year:'diesem Platz'} wird gelöscht. Das lässt sich nicht rückgängig machen.`,'Löschen')}
    try{localStorage.removeItem(slotKey(n))}catch(e){}setMeta(n,null);if(NEWSLOT===n)NEWSLOT=null;MODAL=null;render()},
  mainmenu(){if(LIVE)return;save();S=null;NG=null;PV=null;MODAL=null;SIMREP=null;NEWSLOT=null;window.scrollTo(0,0);render()},
  player(d){const back=S.view==='player'&&PV?PV.back:S.view;PV={id:d.id,tab:d.tab||'profil',back};MODAL=null;S.view='player';window.scrollTo(0,0);render()},
  ptab(d){PV.tab=d.v;PV.msg=null;render()},
  pback(){S.view=PV&&PV.back&&PV.back!=='player'?PV.back:'squad';PV=null;window.scrollTo(0,0);render()},
  ifoc(d){const p=S.players[d.id];p.ifoc=d.v==='none'?null:d.v;save();render()},
  close(){MODAL=null;render()},
  setstart(d){const p=S.players[d.id];if(isOut(p)){pmsg(d.id,`Er fällt aus (${p.out.why}) bis Woche ${p.out.until}.`,false);render();return}const ie=impWhy(p),cur=S.players[S.teams[S.user].starters[p.role]];if(ie&&!(cur&&isImp(cur,S.teams[S.user].reg))){pmsg(d.id,ie,false);render();return}S.teams[S.user].starters[p.role]=p.id;pmsg(d.id,`${p.name} startet ab sofort auf ${RN[p.role]}.`,true);save();render()},
  list(d){const p=S.players[d.id];if(isLoanIn(p))return;p.listed=!p.listed;pmsg(d.id,p.listed?'Andere Teams wissen jetzt, dass er zu haben ist.':'Er steht nicht mehr zum Verkauf.');save();render()},
  renew(d){const p=S.players[d.id],dem=Math.round(salaryFor(ovr(p))*1.1/100)*100;
    if(dem-p.salary>wageFree()){pmsg(d.id,`Das Gehaltsbudget reicht nicht. Nötig: ${eurK(dem-p.salary)} mehr pro Woche, frei sind ${eurK(Math.max(0,wageFree()))}. Du kannst unter Verein > Finanzen umschichten.`,false);render();return}
    if(p.morale<45&&R()<.6){p.tried=wkKey();pmsg(d.id,`${p.name} ist unzufrieden und lehnt ab. Mehr Spielzeit oder Siege helfen.`,false)}
    else{p.salary=dem;p.contract=Math.min(4,p.contract+2);pmsg(d.id,`Verlängert bis ${S.year+p.contract-1} für ${eurK(dem)} pro Woche.`,true)}save();render()},
  release(d){const p=S.players[d.id],U=S.teams[S.user];if(!p||isLoanIn(p))return;
    if(d.ok!=='1')return askConfirm('release',{id:p.id},`${p.name} entlassen?`,`Er verlässt den Verein sofort. Die Abfindung von ${eurK(p.salary*8)} geht direkt vom Konto ab. Das lässt sich nicht rückgängig machen.`,`Entlassen für ${eurK(p.salary*8)}`);
    MODAL=null;const wasA=p.team===acaId();book('Abfindungen',-p.salary*8);toFA(p);if(wasA)ensureRoles(aca(),false);else ensureRoles(U,true);S.view='squad';PV=null;save();render()},
  fa(d){const p=S.players[d.id],U=S.teams[S.user],f=+d.f,dem=salaryFor(ovr(p));
    if(U.roster.length>=MAXR){pmsg(d.id,`Dein Kader ist voll (${MAXR}). Entlasse oder verkaufe zuerst einen Spieler.`,false);render();return}
    if(Math.round(dem*f/100)*100>wageFree()){pmsg(d.id,`Das Gehaltsbudget reicht nicht. Frei sind ${eurK(Math.max(0,wageFree()))} pro Woche. Du kannst unter Verein > Finanzen umschichten.`,false);render();return}
    const pr=clamp(.45+(f-1)*2.5+(U.rep-ovr(p))/40+(p.h.amb-10)/60*(U.rep>70?1:-1),.05,.97);p.tried=wkKey();
    if(R()<pr){p.salary=Math.round(dem*f/100)*100;p.contract=2;sign(p,U,false);pmsg(d.id,`${p.name} unterschreibt für zwei Saisons.`,true);mail('Neuzugang',`${p.name} (${RN[p.role]}) verstärkt das Team.`)}
    else pmsg(d.id,`${p.name} lehnt ab. Ein besseres Angebot oder mehr Ruf hätte geholfen.`,false);
    save();render()},
  buy(d){const p=S.players[d.id],U=S.teams[S.user],f=+d.f,fee=Math.round(valueFor(p)*f/5000)*5000,from=S.teams[p.team];
    if(U.roster.length>=MAXR){pmsg(d.id,`Dein Kader ist voll (${MAXR}).`,false);render();return}
    if(fee>S.fin.budget.transfer){pmsg(d.id,`Das Transferbudget reicht nicht. Verfügbar: ${eurK(S.fin.budget.transfer)}.`,false);render();return}
    {const dem0=Math.round(Math.max(p.salary,salaryFor(ovr(p)))*1.15/100)*100;if(dem0>wageFree()){pmsg(d.id,`Das Gehaltsbudget reicht nicht für seine Forderung von ${eurK(dem0)} pro Woche. Frei: ${eurK(Math.max(0,wageFree()))}.`,false);render();return}}
    if(S.fin.balance<fee){pmsg(d.id,`Zu wenig Budget. Dir fehlen ${eurK(fee-S.fin.balance)}.`,false);render();return}
    p.tried=wkKey();const starter=isStarter(p);
    if(R()>(f>1?.85:.4)+(starter?-.15:.25)){pmsg(d.id,`${from.name} lehnt das Angebot ab.`,false);save();render();return}
    const abroad=from.reg!==U.reg?.15:0;
    if((ovr(p)>U.rep+8&&R()<.5)||R()<abroad){pmsg(d.id,`${from.name} würde verkaufen, aber ${p.name} will nicht wechseln${abroad?' und lieber in seiner Region bleiben':''}.`,false);save();render();return}
    book('Ablösen',-fee);S.fin.budget.transfer-=fee;const dem=Math.round(Math.max(p.salary,salaryFor(ovr(p)))*1.15/100)*100;unsign(p);ensureRoles(from,false);p.salary=dem;p.contract=3;sign(p,U,false);
    pmsg(d.id,`Transfer perfekt: ${p.name} kommt für ${eurK(fee)}. Gehalt ${eurK(dem)} pro Woche, Vertrag über drei Saisons.`,true);
    mail('Transfer abgeschlossen',`${p.name} wechselt für ${eurK(fee)} von ${from.name} (${from.reg}) zu dir.`);save();render()},
  offer(d){const m=S.inbox.find(x=>x.id===+d.id);if(!m||m.done)return;const p=S.players[m.pid],U=S.teams[S.user];
    if(d.ok==='1'){if(!p||p.team!==S.user){m.done=true;m.result='nicht mehr möglich';render();return}
      sellPlayer(p,S.teams[m.from],m.fee);
      m.done=true;m.result=`Verkauft für ${eurK(m.fee)}`}
    else{m.done=true;m.result='Abgelehnt';if(p)p.morale=clamp(p.morale-(p.listed?6:0),20,100);if(p&&m.poach){p.morale=clamp(p.morale-12,20,100);p.wantAway=true;m.result='Abgelehnt. Der Spieler ist enttäuscht und will weg.'}}
    save();render()},
  ctab(d){CLUBTAB=d.v;render()},
  kmode(d){KMODE=d.v;render()},ksort(d){KSORT=d.v;render()},
  mhopen(d){MHV={id:d.id,gi:0};S.view='mh';window.scrollTo(0,0);render()},
  mhback(){MHV=null;S.view='league';LTAB='hist';render()},mhgame(d){MHV.gi=+d.v;render()},mhs(d){MHS=d.v==='ALL'?'ALL':+d.v;render()},
  gohist(){S.view='league';LTAB='hist';window.scrollTo(0,0);render()},
  pev(d){const m=S.inbox.find(x=>x.id===+d.id);if(!m||m.done)return;pevAnswer(m,+d.v);save();render()},
  rfilt(d){RFILT=d.v;render()},
  scf(d){const sc=S.scouts.find(x=>x.id===d.id);sc[d.k]=d.k==='frole'?d.v:+d.v;save();render()},
  tplan(d){S.training.plan=PLANS[d.v].slice();save();render()},
  tses(d){S.training.plan[+d.i]=d.v;save();render()},
  ment(d){S.ment=S.ment||{};if(!d.v)delete S.ment[d.id];else{const mo=S.players[d.v],me=S.players[d.id];if(S.ment[d.id]!==d.v&&!mentorOk(mo,me))return;S.ment[d.id]=d.v}save();render()},
  sthire(d){const st=S.staffPool.find(x=>x.id===d.id);if(!st||S.fin.balance<st.fee)return;
    if(st.role==='hc'){for(const o of staffOf('hc')){S.staffs=S.staffs.filter(x=>x.id!==o.id);book('Abfindungen',-o.wage*6);mail('Head Coach entlassen',`${o.name} muss gehen.`)}}
    else if(staffOf(st.role).length>=SROLE[st.role][1])return;
    book('Investitionen',-st.fee);S.staffs.push(st);S.staffPool=S.staffPool.filter(x=>x.id!==st.id);syncStaff();mail('Neuer Trainer',`${st.name} ist neuer ${SROLE[st.role][0]} (${eurK(st.wage)} pro Woche).`);save();render()},
  stfire(d){const st=S.staffs.find(x=>String(x.id)===String(d.id));if(!st||(st.role==='hc'&&staffOf('hc').length<=1))return;
    if(d.ok!=='1')return askConfirm('stfire',{id:st.id},`${st.name} entlassen?`,`${SROLE[st.role][0]} ${st.name} geht sofort. Die Abfindung von ${eurK(st.wage*6)} geht direkt vom Konto ab. Das lässt sich nicht rückgängig machen.`,`Entlassen für ${eurK(st.wage*6)}`);
    MODAL=null;S.staffs=S.staffs.filter(x=>x.id!==d.id);book('Abfindungen',-st.wage*6);syncStaff();save();render()},
  ttab(d){TTAB=d.v;render()},ltab(d){LTAB=d.v;render()},
  promote(d){const e=promote(d.id);if(PV&&S.view==='player')pmsg(d.id,e||'Er gehört jetzt zum Profikader.',!e);else if(e)mail('Hochziehen nicht möglich',e);save();render()},
  demote(d){const e=demote(d.id);pmsg(d.id,e||'Er spielt jetzt in der Academy.',!e);save();render()},
  short(d){S.short=S.short||[];const i=S.short.indexOf(d.id);if(i>=0)S.short.splice(i,1);else S.short.push(d.id);save();render()},
  screg(d){const sc=S.scouts.find(x=>x.id===d.id);sc.reg=d.v;save();render()},
  scscope(d){const sc=S.scouts.find(x=>x.id===d.id);sc.scope=d.v;save();render()},
  scfire(d){if(S.scouts.length<=1)return;S.scouts=S.scouts.filter(x=>x.id!==d.id);save();render()},
  schire(d){const sc=S.scoutPool.find(x=>x.id===d.id);if(!sc||S.scouts.length>=3||S.fin.balance<sc.fee)return;book('Investitionen',-sc.fee);S.scouts.push(sc);S.scoutPool=S.scoutPool.filter(x=>x.id!==d.id);mail('Scout eingestellt',`${sc.name} (Level ${sc.lvl}) arbeitet ab sofort für dich.`);save();render()},
  spcancel(d){const f=S.fin,o=f.slots[d.k];if(!o)return;if(d.ok==='1'){const pen=r1000(o.base*8);book('Sponsor-Kündigung',-pen);f.slots[d.k]=null;genSlotOffers(d.k);SPCONF=null;mail('Sponsor gekündigt',`Der Vertrag mit ${o.name} ist beendet. Strafe: ${eurK(pen)}.`)}else if(d.ok==='0')SPCONF=null;else SPCONF=d.k;save();render()},
  spreq(d){const m=S.inbox.find(x=>x.id===+d.id);if(!m||m.done)return;const o=S.fin.slots[m.k];m.done=true;
    if(d.ok==='1'){book('Sponsor-Events',m.fee);if(o)o.sat=clamp((o.sat||60)+6,0,100);for(const r of ROLES){const p=S.players[S.teams[S.user].starters[r]];p.morale=clamp(p.morale-2,20,100);p.form=clamp(p.form-1,30,100)}m.result=`Angenommen, ${eurK(m.fee)} erhalten`}
    else{if(o)o.sat=clamp((o.sat||60)-10,0,100);m.result='Abgelehnt'}save();render()},
  advance(){const f=S.fin;if(f.adv||f.advUsed)return;const wk=sponsorBase();if(!wk)return;const amt=r1000(wk*6);book('Sponsor-Vorschuss',amt);f.adv={left:Math.round(amt*1.05)};f.advUsed=true;mail('Sponsor-Vorschuss',`${eurK(amt)} sind sofort auf dem Konto. Die Sponsoren behalten dafür 25% ihrer Wochenzahlung ein, bis ${eurK(f.adv.left)} verrechnet sind.`);save();render()},
  shift(d){const b=S.fin.budget;if(d.v==='w'){if(b.transfer<25000)return;b.transfer-=25000;b.wage+=625}else{if(b.wage-625<wageBill())return;b.wage-=625;b.transfer+=25000}save();render()},
  gobudget(){S.view='club';CLUBTAB='budget';window.scrollTo(0,0);render()},
  cashrel(d){const a=r1000(releasable()*(+d.v));if(a<1000)return;S.fin.budget.transfer+=a;S.fin.budget.frozen=false;mail('Geld freigegeben',`Der Vorstand gibt ${eurK(a)} vom Konto für Transfers frei.`);save();render()},
  askboard(){const b=S.fin.budget,U=S.teams[S.user];if(b.asked)return;b.asked=true;const ch=S.board/100*(S.fin.balance>0?.9:.25);
    if(R()<ch){const add=r1000(50000+U.rep*1500);b.transfer+=add;if(b.frozen&&S.fin.balance>0)b.frozen=false;mail('Vorstand gibt Geld frei',`Der Vorstand erhöht das Transferbudget um ${eurK(add)}.`)}
    else{S.board=clamp(S.board-3,0,100);mail('Vorstand lehnt ab','Der Vorstand sieht keinen Spielraum für mehr Budget. Das Vertrauen sinkt leicht.')}save();render()},
  ktab(d){CHMSG=null;KTAB=d.v;render()},
  team(d){MODAL={team:d.id};render()},
  sponsor(d){const f=S.fin;if(f.slots[d.k]||!slotOpen(d.k))return;f.slots[d.k]=f.offers[d.k][+d.i];f.slots[d.k].sat=60;f.slots[d.k].loyal=false;mail('Sponsor unterschrieben',`${f.slots[d.k].name} ist neuer ${SLOTS.find(x=>x[0]===d.k)[1]} (${STYPE[f.slots[d.k].type].n}).`);save();render()},
  merch(d){S.fin.merch=d.v;save();render()},
  content(d){S.fin.content=+d.v;save();render()},
  pstream(d){S.fin.pstream=d.v==='1';save();render()},
  infraask(d){const e=infraAsk(d.v);if(e)mail('Antrag nicht möglich',e);save();render()},
  hwb(d){if(HWB[d.v])S.fin.hwb=d.v;save();render()},
  loan(d){const f=S.fin,a=+d.v;if(f.loan)return;book('Kredit',a);f.budget.transfer+=a;if(f.balance>0)f.budget.frozen=false;f.loan={left:Math.round(a*1.12),weekly:Math.round(a*1.12/26)};mail('Kredit aufgenommen',`${eurK(a)} sind auf dem Konto und im Transferbudget. Rückzahlung: ${eurK(f.loan.weekly)} pro Woche über 26 Wochen.`);save();render()},
  payloan(){const f=S.fin;if(!f.loan||f.balance<f.loan.left)return;book('Kredittilgung',-f.loan.left);f.loan=null;save();render()},
  repair(){if(LIVE){clearInterval(LIVE.timer);LIVE=null}restartEvent();ERR=null;S.view='home';save();render()},
  staff(d){const lv=S.staff[d.v],cost=60000*lv;if(lv>=5||S.fin.balance<cost)return;book('Investitionen',-cost);S.staff[d.v]++;save();render()},
  reset(d){if(d.ok==='1'){try{localStorage.removeItem(SAVEKEY)}catch(e){}setMeta(SLOT,null);S=null;LIVE=null;MODAL=null}else if(d.ok==='0')MODAL=null;else MODAL='reset';render()}
};
function loanErr(id,msg){pmsg(id,msg,false);if(S.view!=='player'){PV.tab='vertrag';PV.back=S.view;S.view='player'}}
/* Bereiche der Live-Ansicht werden pro Minute neu gezeichnet: Eingaben dort reagieren schon beim Drücken */
document.addEventListener('pointerdown',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-pd]');if(!b)return;const f=ACT[b.dataset.pd];if(!f)return;try{f(b.dataset,b)}catch(err){ERR=err.message;render()}});
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b||b.disabled)return;
  if(b.classList.contains('ov')&&e.target!==b)return;if(SIMRUN&&b.dataset.a!=='simhalt')return;
  const f=ACT[b.dataset.a];if(!f)return;if(b.dataset.a==='nav')ERR=null;try{f(b.dataset,b)}catch(err){ERR=err.message;render()}
});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.id==='impfile'&&t.files&&t.files[0]){const r=new FileReader();r.onload=()=>doImport(String(r.result));r.readAsText(t.files[0])}});
document.addEventListener('keydown',e=>{
  if(MODAL&&MODAL.qs){if(e.key==='Escape'){MODAL=null;render()}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const n=QS.items.length;if(n){QS.i=(QS.i+(e.key==='ArrowDown'?1:n-1))%n;qsRefresh();const on=document.querySelector&&document.querySelector('.qsr.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest'})}}else if(e.key==='Enter'){e.preventDefault();qsGo(QS.i)}return}
  if(e.key==='Escape'&&MODAL&&(MODAL.team||MODAL.cf||MODAL.loan||MODAL.lin)){MODAL=null;render();return}
  const t=e.target,typing=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable);
  if(S&&((e.key==='k'&&(e.ctrlKey||e.metaKey))||(e.key==='/'&&!typing&&!e.ctrlKey&&!e.metaKey))){e.preventDefault();qsOpen()}});
document.addEventListener('input',e=>{const t=e.target;if(t&&t.id==='qsin'&&!e.isComposing){QS.q=t.value;QS.i=0;qsRefresh()}});
/* Suche im Transfermarkt: bei jeder Eingabe neu zeichnen und den Cursor im Feld halten */
document.addEventListener('input',e=>{const t=e.target;if(!t||t.id!=='tq'||e.isComposing)return;FILT.q=t.value;FILT.n=40;const pos=t.selectionStart;render();const n=$('#tq');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.id==='tsort'){FILT.sort=t.value;FILT.n=40;render()}if(t&&t.id==='tsgn'){FILT.sgn=+t.value;FILT.n=40;render()}});
initSlot();load();render();

document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.rk&&typeof NG!=='undefined'&&NG){try{ngPut(t.dataset.rk,t.value);const w=t.closest('.rng'),rv=w&&w.querySelector('.rv');if(rv)rv.textContent=ngFmt(t.dataset.rk,+t.value);ngLive()}catch(err){}}});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.rk&&typeof NG!=='undefined'&&NG){try{render()}catch(err){}}});
