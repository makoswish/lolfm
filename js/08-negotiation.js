/* ===== Verhandlungen ===== */
let NG=null;
const PROM={start:['Stammspieler',3],rot:['Rotation',2],back:['Ersatz',1],youth:['Talent',1.5]};
const SBOPT=[0,10000,25000,50000,100000],WBOPT=[0,500,1000,2000],CLOPT=[0,1.5,2,3];
function expRole(p){const U=S.teams[S.user],cur=S.players[U.starters[p.role]],o=ovr(p);if(!cur||cur.id===p.id)return'start';const co=ovr(cur);return o>=co-1?'start':o>=co-7?'rot':p.age<=20?'youth':'back'}
/* ===== Prestige =====
   Der Ruf eines Vereins ist sein Prestige. Spieler, für die ein Verein eine Nummer zu klein ist, verlangen mehr Gehalt.
   Für Spitzenteams nehmen sie Abschläge in Kauf. Eigene Spieler bei der Verlängerung nur halb so stark. */
const PRESTIGE=[[88,'Weltspitze'],[80,'Spitzenteam'],[72,'Etabliert'],[64,'Mittelfeld'],[56,'Herausforderer'],[0,'Kleiner Verein']];
function prestigeOf(T){return PRESTIGE.find(x=>T.rep>=x[0])[1]}
function pStatus(p){return ovr(p)+p.h.amb/4}
function prestF(p,renew){const g=pStatus(p)-S.teams[S.user].rep;let f=g>0?1+g/45:1+g/80;f=clamp(f,.88,1.5);return renew?1+(f-1)/2:f}
function prestTxt(p,renew){const f=prestF(p,renew),pc=Math.round((f-1)*100);if(pc>=3)return['bad',`+${pc}% Aufschlag: Für ihn ist dein Verein eine Nummer zu klein.`];if(pc<=-3)return['good',`${pc}% Abschlag: Er will zu einem Verein mit deinem Prestige.`];return['muted','Dein Prestige passt zu ihm, kein Auf- oder Abschlag.']}
/* Weiche Ruf-Hürde: Unter seiner Schmerzgrenze verhandelt ein Spieler trotzdem, aber teuer. Pro Ruf-Punkt darunter 2,5% Aufschlag aufs Gehalt,
   weniger Geduld und ein kleiner Respekt-Malus. Über SOFTGAP hinaus steigt der Aufschlag auf 5% pro Punkt (höchstens +150% insgesamt).
   Es gibt keine Absage: Die Grenze setzen Gehaltsbudget und Konto. */
const SOFTGAP=14;
function hurdleGap(p){if(isMine(p))return 0;return Math.max(0,signNeed(p)-S.teams[S.user].rep)}
function hurdleF(p,renew){if(renew||isMine(p))return 1;return hurdleCut(hurdleGap(p))}
function hurdleCut(g){return Math.min(2.5,1+Math.min(g,SOFTGAP)*.025+Math.max(0,g-SOFTGAP)*.05)}
function demandFor(p,renew){const o=ovr(p);let d=salaryFor(o)*(p.team&&p.team!==S.user?1.15:1)*(.9+p.h.amb/20*.3)*prestF(p,renew)*hurdleF(p,renew)*agF(p,renew);
  if(renew){d=Math.max(d,p.salary*1.05);if(p.morale<50)d*=1.1}return r100(d)}
/* ===== Wechselbereitschaft =====
   Wie schwer ist ein Spieler zu holen? Nutzt dieselbe Ruf-Hürde wie die Verhandlung, dazu Rolle, Verein und Stimmung. */
const SIGNL=[['Leicht','var(--good)'],['Machbar','var(--good)'],['Schwer','var(--warn)'],['Kaum möglich','var(--bad)'],['Extrem teuer','var(--bad)']];
function signNeed(p){return Math.ceil(pStatus(p)-13)-Math.round(attract()*2)-mgrAttr()}
function signDiff(p){const U=S.teams[S.user],T=p.team?S.teams[p.team]:null,need=signNeed(p),why=[];
  const gap=need-U.rep;
  if(gap>SOFTGAP)return{lv:4,why:[`Dein Verein liegt ${gap} Ruf-Punkte unter seiner Schmerzgrenze (${need}). Er verhandelt, verlangt aber ${Math.round((hurdleCut(gap)-1)*100)}% Aufschlag aufs Gehalt und hat kaum Geduld.`]};
  if(gap>0)return{lv:3,why:[`Dein Verein liegt ${gap} Ruf-Punkte unter seiner Schmerzgrenze (${need}). Er verhandelt, verlangt aber zusätzlich ${Math.round((hurdleCut(gap)-1)*100)}% Aufschlag aufs Gehalt und verliert schneller die Geduld.`]};
  const m=U.rep-need;let lv=m>=10?0:m>=5?1:2;why.push(m>=10?'Dein Verein ist für ihn eine klare Verbesserung.':m>=5?'Dein Verein ist für ihn interessant.':'Dein Verein liegt knapp über seiner Schmerzgrenze.');
  const cur=S.players[U.starters[p.role]];if(cur&&ovr(p)<ovr(cur)-1&&p.age>21){lv++;why.push(`Hätte bei dir keinen Stammplatz vor ${cur.name}.`)}
  if(!canJoinReg(p,U.reg)){lv++;why.push(`Will ungern aus der ${homeReg(p)} in eine schwächere Region.`)}
  if(T&&T.tier!==2&&isStarter(p)&&T.rep>U.rep+3){lv++;why.push(`Ist Stammspieler bei einem größeren Verein (${T.name}).`)}
  if(!T){lv--;why.push('Vereinslos, sucht einen neuen Verein.')}else if(T.tier===2){lv--;why.push('Will den Sprung in die erste Liga.')}
  if(p.listed){lv--;why.push('Steht auf der Transferliste seines Vereins.')}
  if(p.morale<45){lv--;why.push('Ist unzufrieden bei seinem Verein.')}
  return{lv:clamp(lv,0,3),why}}
function signTag(p){const s=signDiff(p),[n,c]=SIGNL[s.lv];return `<span class="sgn" style="--c:${c}">${n}</span>`}
function prefYears(p){if(p.age>=27)return 3;if(p.h.amb>=15&&ovr(p)>=75)return 2;return p.age<=21?3:2}
function askFor(p){const U=S.teams[S.user],T=p.team?S.teams[p.team]:null;if(!T)return 0;return r1000(valueFor(p)*(isStarter(p)?1.35:1.05)*(1+.06*p.contract)*(T.rep>U.rep+5?1.1:1))}
function canAfford(p){const pl=fitPlan(askFor(p),demandFor(p,false));return pl.ok||pl.finOk}
function startNego(type,pid){
  const p=S.players[pid],U=S.teams[S.user],o=ovr(p);
  if(type!=='renew'&&U.roster.length>=MAXR){pmsg(pid,`Dein Kader ist voll (${MAXR}). Gib zuerst einen Spieler ab.`,false);return false}
  if(p.tried===wkKey()){pmsg(pid,'Diese Woche sind keine weiteren Gespräche möglich.',false);return false}
  if(isLoanIn(p)){pmsg(pid,'Er ist nur ausgeliehen. Über seinen Vertrag verhandelt sein Verein.',false);return false}
  const hg=type==='renew'?0:hurdleGap(p),at=attract(),pat=clamp(3+Math.round((U.rep-(o+p.h.amb/4-8))/6)+(type==='renew'?1:0)-(p.team&&S.teams[p.team].reg!==U.reg?1:0)+(at>.25?1:at<-.25?-1:0)-Math.ceil(hg/5)+agPat(p,type==='renew'),1,6);
  NG={type,pid,hg,stage:type==='buy'?'fee':'contract',pat,patMax:pat,log:[],dem:{sal:demandFor(p,type==='renew'),yrs:prefYears(p),role:expRole(p)},done:false,dead:false};
  NG.terms={sal:NG.dem.sal,yrs:NG.dem.yrs,role:NG.dem.role,sb:0,wb:0,tb:0,cl:0};
  if(type==='buy'){const T=S.teams[p.team],ask=askFor(p);
    NG.club={ask,min:r1000(ask*(.86+R()*.1)),pat:3,patMax:3};NG.fee={amt:r1000(ask*.8),pay:'now',sell:0,addon:0};
    NG.log.push(['club',`${T.name}: Wir hören uns das an. Unsere Vorstellung liegt bei rund ${eurK(ask)}.`])}
  else NG.log.push(['agent',demandText()]);
  S.view='nego';return true}
function hurdleNote(){const hg=NG&&NG.hg;return hg>0?` Ehrlich gesagt ist dein Verein ihm ${hg} Ruf-Punkte zu klein. Er spricht trotzdem mit euch, aber nur mit ${Math.round((hurdleCut(hg)-1)*100)}% Aufschlag aufs Gehalt, und die Geduld ist kürzer.`:''}
function demandText(){const d=NG.dem,p=S.players[NG.pid];return `Berater von ${p.name}: Wir erwarten etwa ${eurK(d.sal)} pro Woche über ${d.yrs} ${d.yrs===1?'Saison':'Saisons'} und eine Rolle als ${PROM[d.role][0]}.${hurdleNote()}`}
function ngNeed(){const p=S.players[NG.pid];if(NG.stage==='fee')return{t:feeNow(),w:0};const t=NG.terms,ex=p.team===acaId()?0:t.sal-(NG.type==='renew'?p.salary:0);return{t:feeNow()+t.sb,w:Math.max(0,ex)}}
/* Finanzierung auf Raten: Reicht das Konto für die Lücke im Transferbudget nicht, finanziert der Vorstand den Rest bis zu einem Rahmen.
   Aufschlag FINRATE, fällig zum nächsten Saisonstart und dann abgezogen vom Konto und vom Transferbudget. Ohne Vertrauen oder bei Minus gibt es nichts. */
const FINRATE=.1;
function finDebts(){return(S.fin.debts||[]).reduce((a,x)=>a+x.amt,0)}
function finLimit(){const f=S.fin;if(f.balance<=0||S.board<35||(f.budget&&f.budget.frozen))return 0;return r1000(150000+f.balance*.5)}
function finRoom(){return Math.max(0,finLimit()-finDebts())}
function fitPlan(nt,nw){const b=S.fin.budget,sw=Math.max(0,r100(Math.ceil(Math.max(0,nw-wageFree())/100)*100)),shiftT=sw*40,tot=nt+shiftT,rel=Math.max(0,r1000(Math.ceil(Math.max(0,tot-b.transfer)/1000)*1000));
  const rl=releasable(),short=Math.max(0,rel-rl),finCost=r1000(Math.ceil(short*(1+FINRATE)/1000)*1000);
  return{sw,shiftT,rel,ok:rel<=rl,need:rel>0||sw>0,fin:short,finCost,finOk:short>0&&finCost<=finRoom()}}
function applyFit(pl,useFin){const b=S.fin.budget;
  if(!pl.ok){if(!(useFin&&pl.finOk))return false;const all=releasable();
    b.transfer+=all+pl.fin;b.frozen=false;book('Finanzierung',pl.fin);(S.fin.debts=S.fin.debts||[]).push({amt:pl.finCost,to:'der Finanzierung',season:S.season+1,fin:true});
    if(pl.sw){b.transfer-=pl.shiftT;b.wage+=pl.sw}
    NG.log.push(['sys',`Finanzierung: ${eurK(all)} vom Konto freigegeben, ${eurK(pl.fin)} auf Raten. Zum nächsten Saisonstart werden ${eurK(pl.finCost)} fällig (${Math.round(FINRATE*100)}% Aufschlag).`]);return true}if(pl.rel){b.transfer+=pl.rel;b.frozen=false}if(pl.sw){b.transfer-=pl.shiftT;b.wage+=pl.sw}
  if(pl.rel||pl.sw)NG.log.push(['sys',`Budget angepasst: ${pl.rel?`${eurK(pl.rel)} vom Konto freigegeben`:''}${pl.rel&&pl.sw?', ':''}${pl.sw?`${eurK(pl.shiftT)} Transferbudget in ${eurK(pl.sw)} Gehaltsbudget pro Woche umgeschichtet`:''}.`]);return true}
function autoFit(){if(S.autoFit===false)return;const n=ngNeed(),pl=fitPlan(n.t,n.w);if(pl.need&&pl.ok)applyFit(pl)}
function fitBox(){const n=ngNeed(),pl=fitPlan(n.t,n.w),b=S.fin.budget;
  return `<div class="fitbox"><div class="stat"><span class="muted">Transferbudget</span><span>${eur(b.transfer)}</span></div><div class="stat"><span class="muted">Gehalt frei pro Woche</span><span>${eur(Math.max(0,wageFree()))}</span></div><div class="stat"><span class="muted">Freigabe vom Konto möglich</span><span>${eur(releasable())}</span></div>
   ${pl.need?(pl.ok?`<p style="font-size:13.5px;margin:8px 0">Für dieses Angebot fehlt Budget. Passend machen: ${pl.rel?`<b>${eurK(pl.rel)}</b> vom Konto freigeben`:''}${pl.rel&&pl.sw?' und ':''}${pl.sw?`<b>${eurK(pl.shiftT)}</b> ins Gehaltsbudget umschichten (+${eurK(pl.sw)}/Wo.)`:''}.</p><button class="btn sm" data-a="ngfit">Budget passend machen</button>`:(pl.finOk?`<p style="font-size:13.5px;margin:8px 0">Dein Konto allein reicht dafür nicht. Du kannst die Lücke finanzieren: ${eurK(releasable())} vom Konto, <b>${eurK(pl.fin)}</b> auf Raten. Zum nächsten Saisonstart werden ${eurK(pl.finCost)} fällig (${Math.round(FINRATE*100)}% Aufschlag), dein Transferbudget dann sinkt entsprechend. Rahmen: ${eurK(finRoom())}.</p><button class="btn sm" data-a="ngfin">Finanzieren und Budget passend machen</button>`:`<p class="bad" style="font-size:13.5px;margin:8px 0 0">Auch mit Freigabe vom Konto reicht das Geld nicht. ${pl.fin>0?`Für eine Finanzierung von ${eurK(pl.finCost)} ist kein Rahmen frei (${eurK(finRoom())}).`:''} Senke das Angebot oder verkaufe vorher Spieler.</p>`)):'<p class="good" style="font-size:13.5px;margin:8px 0 0">Das Angebot passt ins Budget.</p>'}
   <label class="tog"><input type="checkbox" id="autofit" data-a="ngauto" ${S.autoFit===false?'':'checked'}> Budget beim Abschicken automatisch anpassen</label></div>`}
function feeVal(){const f=NG.fee;return f.amt*(f.pay==='inst'?.95:1)*(1+f.sell/100*.3)+(f.addon||0)*.5}
function feeNow(){return NG.fee?(NG.fee.pay==='inst'?Math.round(NG.fee.amt/2):NG.fee.amt):0}
function sendFee(){const p=S.players[NG.pid],c=NG.club,v=feeVal(),T=S.teams[p.team];
  autoFit();
  if(feeNow()>S.fin.budget.transfer){const pl=fitPlan(feeNow(),0);NG.log.push(['sys',pl.finOk?`Das Transferbudget reicht nicht (${eurK(S.fin.budget.transfer)} verfügbar). Du kannst die Lücke auf Raten finanzieren, siehe unten.`:`Das Transferbudget reicht nicht (${eurK(S.fin.budget.transfer)} verfügbar), und für eine Finanzierung ist kein Rahmen frei (${eurK(finRoom())}).`]);return}
  NG.log.push(['me',`Angebot: ${eurK(NG.fee.amt)}${NG.fee.pay==='inst'?' in zwei Raten':' sofort'}${NG.fee.sell?`, ${NG.fee.sell}% Weiterverkaufsbeteiligung`:''}.`]);
  if(v>=c.min){NG.stage='contract';NG.log.push(['club',`${T.name}: Einverstanden. Jetzt müsst ihr euch nur noch mit dem Spieler einigen.`]);NG.log.push(['agent',demandText()]);return}
  c.pat--;
  if(c.pat<=0||v<c.min*.65){NG.dead=true;p.tried=wkKey();NG.log.push(['club',`${T.name}: Das ist nicht ernst gemeint. Wir beenden die Gespräche.`]);return}
  const cnt=r1000(c.min*(1+c.pat*.05));NG.log.push(['club',`${T.name}: Zu wenig. Unter ${eurK(cnt)} geben wir ihn nicht ab.${c.pat===1?' Das ist unser letztes Wort.':''}`])}
function wkVal(t){return t.sal+t.wb*.35+t.sb/(t.yrs*26)+(t.tb||0)*.1/26}
function cScore(){const p=S.players[NG.pid],t=NG.terms,d=NG.dem;let pen=-Math.abs(t.yrs-d.yrs)*.04-(NG.hg||0)*.006;
  const pv=PROM[t.role][1],ev=PROM[d.role][1];if(pv<ev)pen-=.12*(ev-pv);else if(pv>ev)pen+=.04;
  if(t.cl)pen+=p.h.amb>=13?.06:.02;else if(p.h.amb>=15)pen-=.03;
  return{sc:wkVal(t)/d.sal+pen,pen}}
function sendContract(){const p=S.players[NG.pid],t=NG.terms,d=NG.dem;
  const extra=t.sal-(NG.type==='renew'?p.salary:0);
  autoFit();
  if(p.team!==acaId()&&extra>wageFree()){NG.log.push(['sys',`Das Gehaltsbudget reicht nicht. Frei sind ${eurK(Math.max(0,wageFree()))} pro Woche.`]);return}
  if(t.sb+feeNow()>S.fin.budget.transfer){const pl=fitPlan(t.sb+feeNow(),0);NG.log.push(['sys',pl.finOk?'Ablöse und Handgeld übersteigen dein Transferbudget. Du kannst die Lücke auf Raten finanzieren, siehe unten.':`Ablöse und Handgeld übersteigen dein Transferbudget, und für eine Finanzierung ist kein Rahmen frei (${eurK(finRoom())}).`]);return}
  NG.log.push(['me',`Angebot: ${eurK(t.sal)} pro Woche, ${t.yrs} ${t.yrs===1?'Saison':'Saisons'}, ${PROM[t.role][0]}${t.sb?`, ${eurK(t.sb)} Handgeld`:''}${t.wb?`, ${eur(t.wb)} Siegprämie`:''}${t.tb?`, ${eur(t.tb)} Titelprämie`:''}${t.cl?`, Klausel ${CLOPT[t.cl]}× Marktwert`:''}.`]);
  const{sc,pen}=cScore(),need=1+(R()-.5)*.05;
  if(sc>=need){closeDeal();return}
  NG.pat-=sc<.8?2:1;const insult=sc<.8;
  if(NG.pat<=0||sc<.6){NG.dead=true;p.tried=wkKey();NG.log.push(['agent','Berater: So kommen wir nicht zusammen. Wir beenden die Gespräche.']);return}
  const m=[],pv=PROM[t.role][1],ev=PROM[d.role][1];
  if(pv<ev)m.push(`Er will als ${PROM[d.role][0]} eingeplant werden.`);
  if(NG.hg>0)m.push('Dein Verein ist ihm eigentlich zu klein, da muss mehr kommen.');
  if(t.yrs!==d.yrs)m.push(`Er bevorzugt ${d.yrs} ${d.yrs===1?'Saison':'Saisons'}.`);
  const needSal=r100(d.sal*(need-pen)-(t.wb*.35+t.sb/(t.yrs*26)+(t.tb||0)*.1/26));
  if(needSal>t.sal)m.push(`Unter ${eurK(needSal)} pro Woche unterschreibt er so nicht.`);
  if(!t.cl&&p.h.amb>=15)m.push('Eine Ausstiegsklausel wäre ihm wichtig.');
  NG.log.push(['agent',`Berater: ${insult?'Das Angebot ist weit weg von unseren Vorstellungen. ':''}${m.join(' ')||'Da fehlt noch ein Stück.'}${NG.pat===1?' Wir geben euch noch eine Chance.':''}`])}
function closeDeal(){const p=S.players[NG.pid],t=NG.terms,U=S.teams[S.user],prev={salary:p.salary,contract:p.contract,wb:p.wb||0,clause:p.clause||0,promise:p.promise||null,sellon:p.sellon||null},from0=p.team;
  if(NG.type==='buy'){const from=S.teams[p.team],f=NG.fee,now=feeNow();book('Ablösen',-now);S.fin.budget.transfer-=now;
    if(f.pay==='inst')(S.fin.debts=S.fin.debts||[]).push({amt:f.amt-now,to:from.name,season:S.season+1});
    unsign(p);ensureRoles(from,false);if(f.sell)p.sellon={team:from.id,pct:f.sell};if(f.addon)p.addon={team:from.id,amt:f.addon,g:20,c:0,l:0};sign(p,U,false);
    mail('Transfer abgeschlossen',`${p.name} kommt für ${eurK(f.amt)} von ${from.name}${f.pay==='inst'?' (zweite Rate nächste Saison)':''}.`)}
  else if(NG.type==='fa'){sign(p,U,false);mail('Neuzugang',`${p.name} (${RN[p.role]}) unterschreibt ablösefrei.`)}
  if(t.sb){book('Handgelder',-t.sb);S.fin.budget.transfer-=t.sb}
  p.salary=t.sal;p.contract=t.yrs;p.wb=t.wb;p.tb=t.tb||0;p.clause=t.cl?r1000(valueFor(p)*CLOPT[t.cl]):0;p.promise=t.role==='start'?'start':null;p.pweeks=0;p.listed=false;
  if(NG.type!=='renew'){const af=agFee(p,t);book('Beraterprovision',-af);NG.log.push(['agent',`${agentOf(p).n} stellt ${eurK(af)} Provision in Rechnung.`])}
  p.morale=clamp(p.morale+5,20,100);NG.done=true;if(NG.type==='renew'){p.wantRaise=false;p.wantAway=false}
  if(NG.type!=='renew')txRec({type:NG.type,pid:p.id,from:from0,fee:NG.fee?NG.fee.amt:0,now:NG.type==='buy'?feeNow():0,inst:NG.fee&&NG.fee.pay==='inst',sb:t.sb,prev,when:shortLabel()});
  NG.log.push(['agent',`Berater: Abgemacht. ${p.name} unterschreibt bis ${S.year+t.yrs-1}.`]);
  if(NG.type==='renew')mail('Vertrag verlängert',`${p.name}: ${eurK(t.sal)} pro Woche bis ${S.year+t.yrs-1}${p.clause?`, Ausstiegsklausel ${eurK(p.clause)}`:''}.`);
  save()}
function sellPlayer(p,T,fee,why){if(fee>=500000)ach('bigsale');news(`${p.name} wechselt für ${eurK(fee)} von ${S.teams[S.user].name} zu ${T.name}.`,'transfer');const U=S.teams[S.user],prev={salary:p.salary,contract:p.contract,wb:p.wb||0,clause:p.clause||0,promise:p.promise||null,sellon:p.sellon||null,starter:isStarter(p),team:p.team},add=S.fin.budget.frozen?0:r1000(fee*S.fin.budget.salePct/100),son=p.sellon?Math.round(fee*p.sellon.pct/100):0;unsign(p);sign(p,T,false);if(ovr(p)>ovr(S.players[T.starters[p.role]]))T.starters[p.role]=p.id;
  if(T.roster.length>MAXR){const w=T.roster.map(i=>S.players[i]).filter(x=>!isStarter(x)).sort((a,b)=>ovr(a)-ovr(b))[0];if(w)toFA(w)}
  book('Transfererlöse',fee);if(!S.fin.budget.frozen)S.fin.budget.transfer+=r1000(fee*S.fin.budget.salePct/100);
  if(p.sellon){const c=Math.round(fee*p.sellon.pct/100);book('Weiterverkaufsanteile',-c);mail('Weiterverkaufsbeteiligung',`${p.sellon.pct}% der Ablöse (${eurK(c)}) gehen an ${S.teams[p.sellon.team]?S.teams[p.sellon.team].name:'den Ex-Verein'}.`);delete p.sellon}
  p.clause=0;p.promise=null;p.wb=0;p.tb=0;if(p.addon&&p.addon.team!==T.id){const a=p.addon;book('Ablöse-Bonus',-a.amt);mail('Ablöse-Bonus fällig',`Beim Verkauf von ${p.name} werden ${eurK(a.amt)} an ${S.teams[a.team]?S.teams[a.team].name:'den Ex-Verein'} fällig.`)}delete p.addon;ensureRoles(U,true);txRec({type:'sell',pid:p.id,to:T.id,fee,add,son,prev,when:shortLabel()});if(why)mail(why,`${p.name} wechselt für ${eurK(fee)} zu ${T.name} (${T.reg}).`)}
/* Regler statt fester Schritte: Jeder Wert hat einen Bereich, der aus Forderung oder Ablöse-Vorstellung folgt. */
function ngRange(k){const d=NG.dem?NG.dem.sal:0,a=NG.club?NG.club.ask:0;
  if(k==='fee')return[Math.max(1000,r1000(a*.6)),Math.max(5000,r1000(a*1.6)),1000];
  if(k==='sell')return[0,30,1];if(k==='addon')return[0,Math.max(10000,r1000(a*.35)),1000];
  if(k==='sal')return[Math.max(800,r100(d*.6)),Math.max(1600,r100(d*1.7)),100];
  if(k==='sb')return[0,Math.max(30000,r1000(d*45)),1000];
  if(k==='wb')return[0,Math.max(4000,r100(d*3)),100];
  return[0,Math.max(20000,r1000(d*25)),1000]}
function ngGet(k){return k==='fee'?NG.fee.amt:k==='sell'?NG.fee.sell:k==='addon'?(NG.fee.addon||0):(NG.terms[k]||0)}
function ngPut(k,v){v=+v;if(k==='fee')NG.fee.amt=v;else if(k==='sell')NG.fee.sell=v;else if(k==='addon')NG.fee.addon=v;else NG.terms[k]=v}
function ngFmt(k,v){return k==='sell'?v+'%':v?eur(v):'Keine'}
function slider(k,label,hint){const[mn,mx,st]=ngRange(k),v=clamp(ngGet(k),mn,mx),shown=ngGet(k);
  return `<div class="rng"><div class="lab" style="margin:14px 0 6px"><span>${label}</span><span>${hint||''}</span></div>
   <div class="rngh"><button class="btn ghost sm" data-a="ngnudge" data-k="${k}" data-v="${-st*(k==='sell'?1:5)}" aria-label="weniger">−</button><b class="rv">${ngFmt(k,shown)}</b><button class="btn ghost sm" data-a="ngnudge" data-k="${k}" data-v="${st*(k==='sell'?1:5)}" aria-label="mehr">+</button></div>
   <input type="range" data-rk="${k}" min="${mn}" max="${mx}" step="${st}" value="${v}"><div class="rngm"><span>${k==='sell'?mn+'%':eurK(mn)}</span><span>${k==='sell'?mx+'%':eurK(mx)}</span></div></div>`}
function ngLive(){const el=id=>document.querySelector('#'+id);
  if(NG.stage==='contract'){const{sc}=cScore(),cv=clamp(sc*100,0,130),c=cv>=100?'var(--good)':cv>=90?'var(--warn)':'var(--bad)',m=el('ngmeter'),l=el('ngverd'),o=el('ngonce'),w=el('ngwk');
    if(m){m.style.width=(cv/1.3)+'%';m.style.background=c}if(l)l.innerHTML=cv>=100?'<span class="good">sollte reichen</span>':cv>=90?'<span class="warn">knapp</span>':'<span class="bad">zu wenig</span>';
    if(o)o.textContent=eur(feeNow()+NG.terms.sb);if(w)w.textContent=eur(Math.round(wkVal(NG.terms)))+' / Wo. (Forderung '+eur(NG.dem.sal)+')'}
  else{const n=el('ngnow'),v=el('ngfv');if(n)n.textContent=eur(feeNow());if(v)v.textContent=eur(Math.round(feeVal()))+' ('+Math.round(feeVal()/NG.club.ask*100)+'% der Vorstellung)'}}
/* Alternativen des Beraters: gleicher Wert, andere Zusammensetzung */
const ALTS=['Fixgehalt','Mehr Handgeld','Mehr Prämien'];
function ngAlt(){const d=NG.dem,t=NG.terms,k=((NG.alt==null?-1:NG.alt)+1)%3;NG.alt=k;t.yrs=d.yrs;t.role=d.role;
  if(k===0){t.sal=d.sal;t.sb=0;t.wb=0;t.tb=0}
  else if(k===1){t.sal=r100(d.sal*.88);t.sb=r1000(d.sal*.12*d.yrs*26);t.wb=0;t.tb=0}
  else{t.sal=r100(d.sal*.82);t.sb=0;t.wb=r100(d.sal*.10/.35);t.tb=r1000(d.sal*.08*26/.1)}
  NG.log.push(['agent',`Berater: Alternative "${ALTS[k]}": ${eurK(t.sal)} pro Woche${t.sb?`, ${eurK(t.sb)} Handgeld`:''}${t.wb?`, ${eur(t.wb)} Siegprämie`:''}${t.tb?`, ${eur(t.tb)} Titelprämie`:''}. Für ihn gleich viel wert wie die Forderung.`])}
function stepper(act,vals){return `<div class="stepper">${vals.map(v=>`<button class="btn ghost sm" data-a="${act}" data-v="${v}">${v>0?'+':'−'}${eurK(Math.abs(v)).replace(' €','')}</button>`).join('')}</div>`}
function negoView(){
  const p=S.players[NG.pid],U=S.teams[S.user],o=ovr(p),T=p.team?S.teams[p.team]:null,t=NG.terms,over=NG.done||NG.dead;
  const dots=(n,m)=>`<span class="pat">${Array.from({length:m},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</span>`;
  let main='';
  if(NG.stage==='fee'){const f=NG.fee;
    main=`<section class="panel s7"><div class="lab"><span>Ablöse an ${T.name}</span><span>Geduld ${dots(NG.club.pat,NG.club.patMax)}</span></div>
     ${slider('fee','Ablöse','Vorstellung des Vereins: '+eurK(NG.club.ask))}
     <div class="lab" style="margin:14px 0 6px"><span>Zahlung</span><span>Raten sind dem Verein etwas weniger wert</span></div>
     <div class="seg"><button class="${f.pay==='now'?'on':''}" data-a="ngpay" data-v="now">Sofort</button><button class="${f.pay==='inst'?'on':''}" data-a="ngpay" data-v="inst">2 Raten (Hälfte nächste Saison)</button></div>
     ${slider('sell','Weiterverkaufsbeteiligung','macht das Angebot attraktiver')}
     ${slider('addon','Bonus nach 20 Spielen','Zusatzzahlung an den Verein, zählt halb')}
     <div class="stat" style="margin-top:14px"><span class="muted">Marktwert</span><span>${eur(valueFor(p))}</span></div>
     <div class="stat"><span class="muted">Sofort fällig</span><span id="ngnow">${eur(feeNow())}</span></div>
     <div class="stat"><span class="muted">Wert für den Verein</span><span id="ngfv">${eur(Math.round(feeVal()))} (${Math.round(feeVal()/NG.club.ask*100)}% der Vorstellung)</span></div>
     ${fitBox()}
     <div class="acts" style="margin-top:14px"><button class="btn" data-a="ngsend" ${over?'disabled':''}>Angebot abschicken</button></div></section>`}
  else{const{sc}=cScore(),cv=clamp(sc*100,0,130),val=valueFor(p);
    main=`<section class="panel s7"><div class="lab"><span>Vertrag mit ${p.name}</span><span>Geduld des Beraters ${dots(NG.pat,NG.patMax)}</span></div>
     <div class="dem"><div><span>Forderung</span><b>${eur(NG.dem.sal)}/Wo.</b></div><div><span>Laufzeit</span><b>${NG.dem.yrs} J.</b></div><div><span>Rolle</span><b>${PROM[NG.dem.role][0]}</b></div></div>
     ${NG.hg>0?`<div class="note warn" style="margin-top:10px">Dein Verein liegt ${NG.hg} Ruf-Punkte unter seiner Schmerzgrenze. In der Forderung stecken ${Math.round((hurdleCut(NG.hg)-1)*100)}% Ruf-Aufschlag, zusätzlich zum Prestige-Aufschlag. Mit mehr Gehalt oder Handgeld lässt er sich überzeugen, die Geduld ist aber kürzer.</div>`:''}
     ${slider('sal','Wochengehalt','Forderung '+eur(NG.dem.sal))}
     <div class="lab" style="margin:14px 0 6px">Laufzeit</div><div class="seg">${[1,2,3,4].map(v=>`<button class="${t.yrs===v?'on':''}" data-a="ngyrs" data-v="${v}">${v} ${v===1?'Saison':'Saisons'}</button>`).join('')}</div>
     <div class="lab" style="margin:14px 0 6px"><span>Rolle im Team</span><span>Stammspieler-Versprechen muss gehalten werden</span></div><div class="seg">${Object.entries(PROM).map(([k,v])=>`<button class="${t.role===k?'on':''}" data-a="ngrole" data-v="${k}">${v[0]}</button>`).join('')}</div>
     ${slider('sb','Handgeld','einmalig, aus dem Transferbudget')}
     ${slider('wb','Siegprämie','pro gewonnener Serie')}
     ${slider('tb','Titelprämie','pro gewonnenem Titel, an alle Spieler mit Prämie')}
     <div class="acts" style="margin-top:10px"><button class="btn ghost sm" data-a="ngalt">Berater um Alternative bitten${NG.alt!=null?' (zuletzt: '+ALTS[NG.alt]+')':''}</button></div>
     <div class="lab" style="margin:14px 0 6px"><span>Ausstiegsklausel</span><span>andere Teams können ihn dafür kaufen</span></div><div class="seg">${CLOPT.map((v,i)=>`<button class="${t.cl===i?'on':''}" data-a="ngcl" data-v="${i}">${v?`${String(v).replace('.',',')}× (${eurK(val*v)})`:'Keine'}</button>`).join('')}</div>
     <div class="lab" style="margin:16px 0 6px"><span>Einschätzung</span><span id="ngverd">${cv>=100?'<span class="good">sollte reichen</span>':cv>=90?'<span class="warn">knapp</span>':'<span class="bad">zu wenig</span>'}</span></div>
     <div class="bar" style="height:8px"><i id="ngmeter" style="width:${cv/1.3}%;background:${cv>=100?'var(--good)':cv>=90?'var(--warn)':'var(--bad)'}"></i></div>
     <div class="stat" style="margin-top:12px"><span class="muted">Einmalig (Ablöse + Handgeld)</span><span id="ngonce">${eur(feeNow()+t.sb)}</span></div>
     <div class="stat"><span class="muted">Wert für den Spieler</span><span id="ngwk">${eur(Math.round(wkVal(t)))} / Wo. (Forderung ${eur(NG.dem.sal)})</span></div>
     ${fitBox()}
     <div class="acts" style="margin-top:14px"><button class="btn" data-a="ngsign" ${over?'disabled':''}>Angebot machen</button><button class="btn ghost" data-a="ngdem">Forderung übernehmen</button></div></section>`}
  return `<div class="pagehead"><div><h1>Verhandlung</h1><p>${p.name} · ${p.rn||''} · ${RN[p.role]} · ${p.age} J. · OVR ${seeExact(p)||S.staff.analyst>=3?o:'~'+Math.round(o/5)*5}${T?' · '+T.name:' · vereinslos'}</p></div><button class="btn ghost" data-a="ngleave">${over?'Zurück zum Spieler':'Gespräche abbrechen'}</button></div>
  <div class="grid">${main}<section class="panel s5"><div class="lab">Gesprächsverlauf</div><div class="chat">${NG.log.map(([w,x])=>`<div class="cm ${w}"><span>${w==='me'?'Du':w==='club'?'Verein':w==='agent'?'Berater':'Hinweis'}</span>${x}</div>`).join('')}</div>
   ${NG.done?`<div class="note good">Deal perfekt.</div>`:NG.dead?`<div class="note bad">Die Gespräche sind gescheitert. Nächste Woche kannst du es erneut versuchen.</div>`:''}</section></div>`;
}
