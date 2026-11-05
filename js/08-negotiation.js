/* ===== Verhandlungen ===== */
let NG=null;
const PROM={start:['Stammspieler',3],rot:['Rotation',2],back:['Ersatz',1],youth:['Talent',1.5]};
const SBOPT=[0,10000,25000,50000,100000],WBOPT=[0,500,1000,2000],CLOPT=[0,1.5,2,3];
function expRole(p){const U=S.teams[S.user],cur=S.players[U.starters[p.role]],o=ovr(p);if(!cur||cur.id===p.id)return'start';const co=ovr(cur);return o>=co-1?'start':o>=co-7?'rot':p.age<=20?'youth':'back'}
function demandFor(p,renew){const U=S.teams[S.user],o=ovr(p);let d=salaryFor(o)*(p.team&&p.team!==S.user?1.15:1)*(.9+p.h.amb/20*.3);
  const want=o+p.h.amb/4;if(U.rep<want-6)d*=1+(want-6-U.rep)/40;
  if(renew){d=Math.max(d,p.salary*1.05);if(p.morale<50)d*=1.1}return r100(d)}
function prefYears(p){if(p.age>=27)return 3;if(p.h.amb>=15&&ovr(p)>=75)return 2;return p.age<=21?3:2}
function startNego(type,pid){
  const p=S.players[pid],U=S.teams[S.user],o=ovr(p);
  if(type!=='renew'&&U.roster.length>=MAXR){pmsg(pid,`Dein Kader ist voll (${MAXR}). Gib zuerst einen Spieler ab.`,false);return false}
  if(p.tried===wkKey()){pmsg(pid,'Diese Woche sind keine weiteren Gespräche möglich.',false);return false}
  const pat=clamp(3+Math.round((U.rep-(o+p.h.amb/4-8))/6)+(type==='renew'?1:0)-(p.team&&S.teams[p.team].reg!==U.reg?1:0),1,6);
  if(type!=='renew'){const need=Math.ceil(o+p.h.amb/4-13);if(U.rep<need){pmsg(pid,`${p.name} lehnt Gespräche ab. Er will zu einem Verein mit mehr Renommee (Ruf ab ${need}, deiner: ${U.rep}).`,false);return false}}
  NG={type,pid,stage:type==='buy'?'fee':'contract',pat,patMax:pat,log:[],dem:{sal:demandFor(p,type==='renew'),yrs:prefYears(p),role:expRole(p)},done:false,dead:false};
  NG.terms={sal:NG.dem.sal,yrs:NG.dem.yrs,role:NG.dem.role,sb:0,wb:0,cl:0};
  if(type==='buy'){const T=S.teams[p.team],ask=r1000(valueFor(p)*(isStarter(p)?1.35:1.05)*(1+.06*p.contract)*(T.rep>U.rep+5?1.1:1));
    NG.club={ask,min:r1000(ask*(.86+R()*.1)),pat:3,patMax:3};NG.fee={amt:r1000(ask*.8),pay:'now',sell:0};
    NG.log.push(['club',`${T.name}: Wir hören uns das an. Unsere Vorstellung liegt bei rund ${eurK(ask)}.`])}
  else NG.log.push(['agent',demandText()]);
  S.view='nego';return true}
function demandText(){const d=NG.dem,p=S.players[NG.pid];return `Berater von ${p.name}: Wir erwarten etwa ${eurK(d.sal)} pro Woche über ${d.yrs} ${d.yrs===1?'Saison':'Saisons'} und eine Rolle als ${PROM[d.role][0]}.`}
function ngNeed(){const p=S.players[NG.pid];if(NG.stage==='fee')return{t:feeNow(),w:0};const t=NG.terms,ex=p.team===acaId()?0:t.sal-(NG.type==='renew'?p.salary:0);return{t:feeNow()+t.sb,w:Math.max(0,ex)}}
function fitPlan(nt,nw){const b=S.fin.budget,sw=Math.max(0,r100(Math.ceil(Math.max(0,nw-wageFree())/100)*100)),shiftT=sw*40,tot=nt+shiftT,rel=Math.max(0,r1000(Math.ceil(Math.max(0,tot-b.transfer)/1000)*1000));
  return{sw,shiftT,rel,ok:rel<=releasable(),need:rel>0||sw>0}}
function applyFit(pl){const b=S.fin.budget;if(!pl.ok)return false;if(pl.rel){b.transfer+=pl.rel;b.frozen=false}if(pl.sw){b.transfer-=pl.shiftT;b.wage+=pl.sw}
  if(pl.rel||pl.sw)NG.log.push(['sys',`Budget angepasst: ${pl.rel?`${eurK(pl.rel)} vom Konto freigegeben`:''}${pl.rel&&pl.sw?', ':''}${pl.sw?`${eurK(pl.shiftT)} Transferbudget in ${eurK(pl.sw)} Gehaltsbudget pro Woche umgeschichtet`:''}.`]);return true}
function autoFit(){if(S.autoFit===false)return;const n=ngNeed(),pl=fitPlan(n.t,n.w);if(pl.need&&pl.ok)applyFit(pl)}
function fitBox(){const n=ngNeed(),pl=fitPlan(n.t,n.w),b=S.fin.budget;
  return `<div class="fitbox"><div class="stat"><span class="muted">Transferbudget</span><span>${eur(b.transfer)}</span></div><div class="stat"><span class="muted">Gehalt frei pro Woche</span><span>${eur(Math.max(0,wageFree()))}</span></div><div class="stat"><span class="muted">Freigabe vom Konto möglich</span><span>${eur(releasable())}</span></div>
   ${pl.need?(pl.ok?`<p style="font-size:13.5px;margin:8px 0">Für dieses Angebot fehlt Budget. Passend machen: ${pl.rel?`<b>${eurK(pl.rel)}</b> vom Konto freigeben`:''}${pl.rel&&pl.sw?' und ':''}${pl.sw?`<b>${eurK(pl.shiftT)}</b> ins Gehaltsbudget umschichten (+${eurK(pl.sw)}/Wo.)`:''}.</p><button class="btn sm" data-a="ngfit">Budget passend machen</button>`:`<p class="bad" style="font-size:13.5px;margin:8px 0 0">Auch mit Freigabe vom Konto reicht das Geld nicht. Senke das Angebot oder verkaufe vorher Spieler.</p>`):'<p class="good" style="font-size:13.5px;margin:8px 0 0">Das Angebot passt ins Budget.</p>'}
   <label class="tog"><input type="checkbox" id="autofit" data-a="ngauto" ${S.autoFit===false?'':'checked'}> Budget beim Abschicken automatisch anpassen</label></div>`}
function feeVal(){const f=NG.fee;return f.amt*(f.pay==='inst'?.95:1)*(1+f.sell/100*.3)}
function feeNow(){return NG.fee?(NG.fee.pay==='inst'?Math.round(NG.fee.amt/2):NG.fee.amt):0}
function sendFee(){const p=S.players[NG.pid],c=NG.club,v=feeVal(),T=S.teams[p.team];
  autoFit();
  if(feeNow()>S.fin.budget.transfer){NG.log.push(['sys',`Das Transferbudget reicht nicht (${eurK(S.fin.budget.transfer)} verfügbar).`]);return}
  NG.log.push(['me',`Angebot: ${eurK(NG.fee.amt)}${NG.fee.pay==='inst'?' in zwei Raten':' sofort'}${NG.fee.sell?`, ${NG.fee.sell}% Weiterverkaufsbeteiligung`:''}.`]);
  if(v>=c.min){NG.stage='contract';NG.log.push(['club',`${T.name}: Einverstanden. Jetzt müsst ihr euch nur noch mit dem Spieler einigen.`]);NG.log.push(['agent',demandText()]);return}
  c.pat--;
  if(c.pat<=0||v<c.min*.65){NG.dead=true;p.tried=wkKey();NG.log.push(['club',`${T.name}: Das ist nicht ernst gemeint. Wir beenden die Gespräche.`]);return}
  const cnt=r1000(c.min*(1+c.pat*.05));NG.log.push(['club',`${T.name}: Zu wenig. Unter ${eurK(cnt)} geben wir ihn nicht ab.${c.pat===1?' Das ist unser letztes Wort.':''}`])}
function wkVal(t){return t.sal+t.wb*.35+t.sb/(t.yrs*26)}
function cScore(){const p=S.players[NG.pid],t=NG.terms,d=NG.dem;let pen=-Math.abs(t.yrs-d.yrs)*.04;
  const pv=PROM[t.role][1],ev=PROM[d.role][1];if(pv<ev)pen-=.12*(ev-pv);else if(pv>ev)pen+=.04;
  if(t.cl)pen+=p.h.amb>=13?.06:.02;else if(p.h.amb>=15)pen-=.03;
  return{sc:wkVal(t)/d.sal+pen,pen}}
function sendContract(){const p=S.players[NG.pid],t=NG.terms,d=NG.dem;
  const extra=t.sal-(NG.type==='renew'?p.salary:0);
  autoFit();
  if(p.team!==acaId()&&extra>wageFree()){NG.log.push(['sys',`Das Gehaltsbudget reicht nicht. Frei sind ${eurK(Math.max(0,wageFree()))} pro Woche.`]);return}
  if(t.sb+feeNow()>S.fin.budget.transfer){NG.log.push(['sys','Ablöse und Handgeld übersteigen dein Transferbudget.']);return}
  NG.log.push(['me',`Angebot: ${eurK(t.sal)} pro Woche, ${t.yrs} ${t.yrs===1?'Saison':'Saisons'}, ${PROM[t.role][0]}${t.sb?`, ${eurK(t.sb)} Handgeld`:''}${t.wb?`, ${eur(t.wb)} Siegprämie`:''}${t.cl?`, Klausel ${CLOPT[t.cl]}× Marktwert`:''}.`]);
  const{sc,pen}=cScore(),need=1+(R()-.5)*.05;
  if(sc>=need){closeDeal();return}
  NG.pat-=sc<.8?2:1;const insult=sc<.8;
  if(NG.pat<=0||sc<.6){NG.dead=true;p.tried=wkKey();NG.log.push(['agent','Berater: So kommen wir nicht zusammen. Wir beenden die Gespräche.']);return}
  const m=[],pv=PROM[t.role][1],ev=PROM[d.role][1];
  if(pv<ev)m.push(`Er will als ${PROM[d.role][0]} eingeplant werden.`);
  if(t.yrs!==d.yrs)m.push(`Er bevorzugt ${d.yrs} ${d.yrs===1?'Saison':'Saisons'}.`);
  const needSal=r100(d.sal*(need-pen)-(t.wb*.35+t.sb/(t.yrs*26)));
  if(needSal>t.sal)m.push(`Unter ${eurK(needSal)} pro Woche unterschreibt er so nicht.`);
  if(!t.cl&&p.h.amb>=15)m.push('Eine Ausstiegsklausel wäre ihm wichtig.');
  NG.log.push(['agent',`Berater: ${insult?'Das Angebot ist weit weg von unseren Vorstellungen. ':''}${m.join(' ')||'Da fehlt noch ein Stück.'}${NG.pat===1?' Wir geben euch noch eine Chance.':''}`])}
function closeDeal(){const p=S.players[NG.pid],t=NG.terms,U=S.teams[S.user],prev={salary:p.salary,contract:p.contract,wb:p.wb||0,clause:p.clause||0,promise:p.promise||null,sellon:p.sellon||null},from0=p.team;
  if(NG.type==='buy'){const from=S.teams[p.team],f=NG.fee,now=feeNow();book('Ablösen',-now);S.fin.budget.transfer-=now;
    if(f.pay==='inst')(S.fin.debts=S.fin.debts||[]).push({amt:f.amt-now,to:from.name,season:S.season+1});
    unsign(p);ensureRoles(from,false);if(f.sell)p.sellon={team:from.id,pct:f.sell};sign(p,U,false);
    mail('Transfer abgeschlossen',`${p.name} kommt für ${eurK(f.amt)} von ${from.name}${f.pay==='inst'?' (zweite Rate nächste Saison)':''}.`)}
  else if(NG.type==='fa'){sign(p,U,false);mail('Neuzugang',`${p.name} (${RN[p.role]}) unterschreibt ablösefrei.`)}
  if(t.sb){book('Handgelder',-t.sb);S.fin.budget.transfer-=t.sb}
  p.salary=t.sal;p.contract=t.yrs;p.wb=t.wb;p.clause=t.cl?r1000(valueFor(p)*CLOPT[t.cl]):0;p.promise=t.role==='start'?'start':null;p.pweeks=0;p.listed=false;
  p.morale=clamp(p.morale+5,20,100);NG.done=true;if(NG.type==='renew'){p.wantRaise=false;p.wantAway=false}
  if(NG.type!=='renew')txRec({type:NG.type,pid:p.id,from:from0,fee:NG.fee?NG.fee.amt:0,now:NG.type==='buy'?feeNow():0,inst:NG.fee&&NG.fee.pay==='inst',sb:t.sb,prev,when:shortLabel()});
  NG.log.push(['agent',`Berater: Abgemacht. ${p.name} unterschreibt bis ${S.year+t.yrs-1}.`]);
  if(NG.type==='renew')mail('Vertrag verlängert',`${p.name}: ${eurK(t.sal)} pro Woche bis ${S.year+t.yrs-1}${p.clause?`, Ausstiegsklausel ${eurK(p.clause)}`:''}.`);
  save()}
function sellPlayer(p,T,fee,why){if(fee>=500000)ach('bigsale');news(`${p.name} wechselt für ${eurK(fee)} von ${S.teams[S.user].name} zu ${T.name}.`,'transfer');const U=S.teams[S.user],prev={salary:p.salary,contract:p.contract,wb:p.wb||0,clause:p.clause||0,promise:p.promise||null,sellon:p.sellon||null,starter:isStarter(p),team:p.team},add=S.fin.budget.frozen?0:r1000(fee*S.fin.budget.salePct/100),son=p.sellon?Math.round(fee*p.sellon.pct/100):0;unsign(p);sign(p,T,false);if(ovr(p)>ovr(S.players[T.starters[p.role]]))T.starters[p.role]=p.id;
  if(T.roster.length>MAXR){const w=T.roster.map(i=>S.players[i]).filter(x=>!isStarter(x)).sort((a,b)=>ovr(a)-ovr(b))[0];if(w)toFA(w)}
  book('Transfererlöse',fee);if(!S.fin.budget.frozen)S.fin.budget.transfer+=r1000(fee*S.fin.budget.salePct/100);
  if(p.sellon){const c=Math.round(fee*p.sellon.pct/100);book('Weiterverkaufsanteile',-c);mail('Weiterverkaufsbeteiligung',`${p.sellon.pct}% der Ablöse (${eurK(c)}) gehen an ${S.teams[p.sellon.team]?S.teams[p.sellon.team].name:'den Ex-Verein'}.`);delete p.sellon}
  p.clause=0;p.promise=null;p.wb=0;ensureRoles(U,true);txRec({type:'sell',pid:p.id,to:T.id,fee,add,son,prev,when:shortLabel()});if(why)mail(why,`${p.name} wechselt für ${eurK(fee)} zu ${T.name} (${T.reg}).`)}
function stepper(act,vals){return `<div class="stepper">${vals.map(v=>`<button class="btn ghost sm" data-a="${act}" data-v="${v}">${v>0?'+':'−'}${eurK(Math.abs(v)).replace(' €','')}</button>`).join('')}</div>`}
function negoView(){
  const p=S.players[NG.pid],U=S.teams[S.user],o=ovr(p),T=p.team?S.teams[p.team]:null,t=NG.terms,over=NG.done||NG.dead;
  const dots=(n,m)=>`<span class="pat">${Array.from({length:m},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</span>`;
  let main='';
  if(NG.stage==='fee'){const f=NG.fee;
    main=`<section class="panel s7"><div class="lab"><span>Ablöse an ${T.name}</span><span>Geduld ${dots(NG.club.pat,NG.club.patMax)}</span></div>
     <div class="big">${eur(f.amt)}</div>${stepper('ngfee',[-50000,-10000,10000,50000])}
     <div class="lab" style="margin:14px 0 6px"><span>Zahlung</span><span>Raten sind dem Verein etwas weniger wert</span></div>
     <div class="seg"><button class="${f.pay==='now'?'on':''}" data-a="ngpay" data-v="now">Sofort</button><button class="${f.pay==='inst'?'on':''}" data-a="ngpay" data-v="inst">2 Raten (Hälfte nächste Saison)</button></div>
     <div class="lab" style="margin:14px 0 6px"><span>Weiterverkaufsbeteiligung</span><span>macht das Angebot attraktiver</span></div>
     <div class="seg">${[0,10,20].map(v=>`<button class="${f.sell===v?'on':''}" data-a="ngsell" data-v="${v}">${v}%</button>`).join('')}</div>
     <div class="stat" style="margin-top:14px"><span class="muted">Marktwert</span><span>${eur(valueFor(p))}</span></div>
     <div class="stat"><span class="muted">Sofort fällig</span><span>${eur(feeNow())}</span></div>
     ${fitBox()}
     <div class="acts" style="margin-top:14px"><button class="btn" data-a="ngsend" ${over?'disabled':''}>Angebot abschicken</button></div></section>`}
  else{const{sc}=cScore(),cv=clamp(sc*100,0,130),val=valueFor(p);
    main=`<section class="panel s7"><div class="lab"><span>Vertrag mit ${p.name}</span><span>Geduld des Beraters ${dots(NG.pat,NG.patMax)}</span></div>
     <div class="dem"><div><span>Forderung</span><b>${eurK(NG.dem.sal)}/Wo.</b></div><div><span>Laufzeit</span><b>${NG.dem.yrs} J.</b></div><div><span>Rolle</span><b>${PROM[NG.dem.role][0]}</b></div></div>
     <div class="lab" style="margin:14px 0 6px">Wochengehalt</div><div class="big">${eur(t.sal)}</div>${stepper('ngsal',[-1000,-100,100,1000])}
     <div class="lab" style="margin:14px 0 6px">Laufzeit</div><div class="seg">${[1,2,3,4].map(v=>`<button class="${t.yrs===v?'on':''}" data-a="ngyrs" data-v="${v}">${v} ${v===1?'Saison':'Saisons'}</button>`).join('')}</div>
     <div class="lab" style="margin:14px 0 6px"><span>Rolle im Team</span><span>Stammspieler-Versprechen muss gehalten werden</span></div><div class="seg">${Object.entries(PROM).map(([k,v])=>`<button class="${t.role===k?'on':''}" data-a="ngrole" data-v="${k}">${v[0]}</button>`).join('')}</div>
     <div class="lab" style="margin:14px 0 6px"><span>Handgeld</span><span>einmalig, aus dem Transferbudget</span></div><div class="seg">${SBOPT.map(v=>`<button class="${t.sb===v?'on':''}" data-a="ngsb" data-v="${v}">${v?eurK(v):'Keins'}</button>`).join('')}</div>
     <div class="lab" style="margin:14px 0 6px"><span>Siegprämie</span><span>pro gewonnener Serie</span></div><div class="seg">${WBOPT.map(v=>`<button class="${t.wb===v?'on':''}" data-a="ngwb" data-v="${v}">${v?eur(v):'Keine'}</button>`).join('')}</div>
     <div class="lab" style="margin:14px 0 6px"><span>Ausstiegsklausel</span><span>andere Teams können ihn dafür kaufen</span></div><div class="seg">${CLOPT.map((v,i)=>`<button class="${t.cl===i?'on':''}" data-a="ngcl" data-v="${i}">${v?`${String(v).replace('.',',')}× (${eurK(val*v)})`:'Keine'}</button>`).join('')}</div>
     <div class="lab" style="margin:16px 0 6px"><span>Einschätzung</span><span>${cv>=100?'<span class="good">sollte reichen</span>':cv>=90?'<span class="warn">knapp</span>':'<span class="bad">zu wenig</span>'}</span></div>
     <div class="bar" style="height:8px"><i style="width:${cv/1.3}%;background:${cv>=100?'var(--good)':cv>=90?'var(--warn)':'var(--bad)'}"></i></div>
     <div class="stat" style="margin-top:12px"><span class="muted">Einmalig (Ablöse + Handgeld)</span><span>${eur(feeNow()+t.sb)}</span></div>
     ${fitBox()}
     <div class="acts" style="margin-top:14px"><button class="btn" data-a="ngsign" ${over?'disabled':''}>Angebot machen</button><button class="btn ghost" data-a="ngdem">Forderung übernehmen</button></div></section>`}
  return `<div class="pagehead"><div><h1>Verhandlung</h1><p>${p.name} · ${p.rn||''} · ${RN[p.role]} · ${p.age} J. · OVR ${seeExact(p)||S.staff.analyst>=3?o:'~'+Math.round(o/5)*5}${T?' · '+T.name:' · vereinslos'}</p></div><button class="btn ghost" data-a="ngleave">${over?'Zurück zum Spieler':'Gespräche abbrechen'}</button></div>
  <div class="grid">${main}<section class="panel s5"><div class="lab">Gesprächsverlauf</div><div class="chat">${NG.log.map(([w,x])=>`<div class="cm ${w}"><span>${w==='me'?'Du':w==='club'?'Verein':w==='agent'?'Berater':'Hinweis'}</span>${x}</div>`).join('')}</div>
   ${NG.done?`<div class="note good">Deal perfekt.</div>`:NG.dead?`<div class="note bad">Die Gespräche sind gescheitert. Nächste Woche kannst du es erneut versuchen.</div>`:''}</section></div>`;
}
