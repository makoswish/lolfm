/* ===== Zusatzfeatures: Transferfenster, Persönlichkeiten, Presse, Medienrechte, Luxussteuer, Fusionen, Verlauf, Glossar =====
   Lädt nach 12c-pages. Umdefinierte Funktionen (demandFor, lsh, todoItems, playerView, transferView, relegPanel) rufen die alte Fassung auf.
   Neue Klick-Aktionen stehen in XACT und werden in 17-actions in ACT übernommen. */

/* ----- Transferfenster ----- */
/* Offen: Saisonpause und die ersten zwei Wochen von Winter- und Sommer-Split. Vereinslose Spieler gehen immer. KI-Transfers bleiben unberührt. */
function winOpen(){if(!S)return true;if(S.phase==='offseason'||S.jobless)return true;const e=S.ev;return !!(e&&e.type==='split'&&(e.id==='S1'||e.id==='S3')&&e.stage==='rr'&&e.round<=1)}
function winNote(){if(S.phase==='offseason')return'Transferfenster offen: Saisonpause';
  if(winOpen())return'Transferfenster offen: schließt nach dieser Woche';
  return'Transferfenster geschlossen: öffnet in der Saisonpause und zu Beginn von Winter- und Sommer-Split. Vereinslose gehen immer.'}
const _transferView=transferView;
transferView=function(){const open=winOpen();return `<div class="winbar ${open?'open':'shut'}"><span class="dot"></span>${winNote()}</div>`+_transferView()};

/* ----- Persönlichkeiten ----- */
const PERS={leader:['Führungsspieler','Hebt die Stimmung im Team.'],pro:['Profi','Zuverlässig, kaum Ausreißer.'],hot:['Hitzkopf','Gerät in Konflikte und hasst die Bank.'],lazy:['Genießer','Beliebt, trainiert aber lockerer.'],merc:['Söldner','Verlangt mehr Gehalt.']};
function persOf(p){if(p.pers&&PERS[p.pers])return p.pers;let h=0;for(const c of String(p.id))h=(h*31+c.charCodeAt(0))|0;const r=Math.abs(h)%100;return p.pers=r<14?'leader':r<48?'pro':r<66?'hot':r<82?'lazy':'merc'}
const _demandFor=demandFor;
demandFor=function(p,renew){const d=_demandFor(p,renew);return persOf(p)==='merc'?Math.round(d*1.08):d};
function persWeek(){const U=S.teams[S.user],ps=U.roster.map(i=>S.players[i]).filter(Boolean);if(!ps.length)return;
  const lead=ps.some(p=>persOf(p)==='leader'),starters=new Set(Object.values(U.starters));
  for(const p of ps){const k=persOf(p);
    if(lead&&k!=='leader'&&p.morale<78)p.morale=clamp(p.morale+1,20,100);
    if(k==='hot'&&!starters.has(p.id))p.morale=clamp(p.morale-2,20,100);
    if(k==='lazy'){if(p.morale<70)p.morale=clamp(p.morale+1,20,100);if(p.form>62&&R()<.25)p.form=clamp(p.form-1,30,100)}}
  const hot=ps.filter(p=>persOf(p)==='hot');
  if(hot.length&&R()<.05&&!S.inbox.some(m=>m.type==='pev'&&!m.done)){const a=pick(hot),b=pick(ps.filter(p=>p!==a));if(b)mail(PEV.conflict.t(a,b),PEV.conflict.b(a,b),{type:'pev',k:'conflict',pid:a.id,qid:b.id,done:false,exp:S.step+3})}}
function persPanel(p){if(!p||!isMine(p))return'';const k=persOf(p),can=p.talked==null||S.step-p.talked>=4||S.step<p.talked;
  return `<section class="panel s12"><div class="lab"><span>Charakter</span><span>${PERS[k][0]}</span></div><p class="muted" style="margin:0 0 10px">${PERS[k][1]}</p>
  <div class="acts"><button class="btn ${can?'':'ghost'}" data-a="talk" data-id="${p.id}" ${can?'':'disabled'}>Einzelgespräch</button></div></section>`}
const _playerView=playerView;
playerView=function(){const h=_playerView();const p=S.players[PV&&PV.id];return p&&isMine(p)?h+persPanel(p):h};

/* ----- Pressekonferenz ----- */
function teamForm(){const U=S.teams[S.user],ps=U.roster.map(i=>S.players[i]).filter(Boolean);return ps.length?ps.reduce((a,p)=>a+p.form,0)/ps.length:60}
Object.assign(PEV,{
  press:{t:()=>'Pressekonferenz',b:()=>teamForm()>=65?'Das Team ist gut in Form. Die Journalisten wollen wissen, ob ihr jetzt den Titel anpeilt.':teamForm()<52?'Die letzten Wochen liefen schlecht. Die Journalisten fragen, wie lange der Vorstand noch Geduld hat.':'Die Journalisten fragen nach den Zielen für den Rest der Saison.',
    o:[['Selbstbewusst auftreten',()=>{const g=teamForm()>=58;S.fin.fans=Math.round(S.fin.fans*1.005);for(const id of S.teams[S.user].roster){const p=S.players[id];p.morale=clamp(p.morale+(g?2:-2),20,100)}if(!g)S.board=clamp(S.board-1,0,100);return g?'Das passt zur Form. Fans und Spieler freuen sich.':'Das wirkt überzogen. Die Spieler spüren den Druck, der Vorstand runzelt die Stirn.'}],
      ['Sachlich bleiben',()=>{S.board=clamp(S.board+1,0,100);return 'Ruhiger Auftritt. Der Vorstand ist zufrieden.'}],
      ['Die Spieler loben',()=>{for(const id of S.teams[S.user].roster){const p=S.players[id];p.morale=clamp(p.morale+3,20,100)}return 'Das Team fühlt sich gesehen.'}],
      ['Rivalen provozieren',()=>{S.fin.fans=Math.round(S.fin.fans*1.01);for(const id of S.teams[S.user].roster){const p=S.players[id];p.morale=clamp(p.morale+2,20,100)}if(R()<.4){S.mrep=clamp((S.mrep||30)-1,0,100);return 'Die Fans lieben es, die Presse kritisiert dich. Manager-Ruf -1.'}return 'Die Fans lieben es.'}]]},
  expro:{t:p=>`${p.name} bietet sich als Gastcoach an`,b:p=>`Der Ex-Profi ${p.name} würde zwei Wochen mit dem Team arbeiten. Kosten: 12.000 €.`,
    o:[['Einladen',()=>{book('Gastcoach',-Math.round(12000*eco()));S.campBoost=S.step+2;return 'Zwei Wochen mit 30% mehr Trainingsfortschritt.'}],['Absagen',()=>'Kein Gastcoach.']]},
  exstream:{t:p=>`${p.name} streamt jetzt und will kooperieren`,b:p=>`Der Ex-Profi ${p.name} hat eine große Community. Eine gemeinsame Aktion kostet 8.000 €.`,
    o:[['Kooperieren',()=>{book('Fan-Events',-Math.round(8000*eco()));S.fin.fans=Math.round(S.fin.fans*1.015);return '+1,5% Fans.'}],['Absagen',()=>'Keine Kooperation.']]},
  media:{t:()=>'Medienrechte neu verhandeln',b:()=>`Der Vertrag über die Liga-Ausschüttung läuft aus. Der Verband bietet drei Wege an.`,
    o:[['1 Jahr, Standard',()=>{S.media={f:1,until:S.year+1};return 'Ausschüttung bleibt gleich, ein Jahr Laufzeit.'}],
      ['3 Jahre, +6%',()=>{S.media={f:1.06,until:S.year+3};return 'Ausschüttung +6% für drei Jahre.'}],
      ['Bieterverfahren',()=>{if(R()<.6){S.media={f:1.18,until:S.year+2};return 'Starkes Angebot: Ausschüttung +18% für zwei Jahre.'}S.media={f:.96,until:S.year+2};return 'Schwache Nachfrage: Ausschüttung -4% für zwei Jahre.'}]]}});
function extrasWeek(){
  persWeek();
  if(S.phase==='offseason')return;
  luxWeek();
  const pend=S.inbox.some(m=>m.type==='pev'&&!m.done);
  if(!pend&&R()<.14&&(S.step-(S.pressAt||-9))>=3){S.pressAt=S.step;const E=PEV.press;mail(E.t(),E.b(),{type:'pev',k:'press',done:false,exp:S.step+3});return}
  if(!pend&&R()<.04){const ex=Object.values(S.players).filter(p=>p.retired&&p.name);if(ex.length){const p=pick(ex),k=pick(['expro','exstream']),E=PEV[k];mail(E.t(p),E.b(p),{type:'pev',k,pid:p.id,done:false,exp:S.step+3})}}}

/* ----- Medienrechte ----- */
function mediaF(){return S&&S.media&&S.year<=S.media.until?S.media.f:1}
const _lsh=lsh;
lsh=function(){return Math.round(_lsh()*mediaF())};

/* ----- Luxussteuer ----- */
function payroll(T){return T.roster.reduce((a,i)=>a+(S.players[i]?S.players[i].salary:0),0)}
const LUXF=2;
function luxCap(reg){const L=teamsOf(reg).filter(t=>t.id!==S.user);if(!L.length)return 1e9;return L.reduce((a,t)=>a+payroll(t),0)/L.length*LUXF}
function luxExcess(){const U=S.teams[S.user];return Math.max(0,payroll(U)-luxCap(U.reg))}
function luxWeek(){if(S.jobless)return;const x=luxExcess();if(x<=0)return;const tax=Math.round(x*.3);book('Luxussteuer',-tax);
  if(!S.luxWarn||S.step-S.luxWarn>=8){S.luxWarn=S.step;mail('Luxussteuer',`Deine Lohnsumme liegt ${eurK(Math.round(x))} pro Woche über der Grenze deiner Liga. Die Liga verlangt 30% des Betrags als Steuer (${eurK(tax)} pro Woche).`)}}
function luxPanel(){const U=S.teams[S.user],cap=luxCap(U.reg),pay=payroll(U),x=Math.max(0,pay-cap);
  return `<div class="lab" style="margin-top:12px"><span>Luxussteuer</span><span>${x>0?'fällig':'frei'}</span></div><div class="stat"><span>Lohnsumme</span><span class="mono">${eurK(pay)}</span></div><div class="stat"><span>Grenze deiner Liga (200% des Schnitts)</span><span class="mono">${eurK(Math.round(cap))}</span></div>`}
const _relegPanel=relegPanel;
relegPanel=function(){return _relegPanel().replace('</section>',luxPanel()+'</section>')};

/* ----- Fusionen ----- */
function mergeSeason(){for(const r of REGS){const L=teamsOf(r).filter(t=>t.id!==S.user&&!t.academy&&(t.fs||0)>=BK_CRISIS*.6&&t.rep<66).sort((a,b)=>b.rep-a.rep);
    if(L.length<2||R()>.35)continue;const A=L[0],B=L[L.length-1],up=t2Champ(r);if(!up||A===B)continue;
    const best=B.roster.map(i=>S.players[i]).filter(Boolean).sort((a,b)=>ovr(b)-ovr(a)).slice(0,2);
    const bn=B.name,an=A.name,un=up.name;
    swapTiers(B,up);
    for(const p of best){if(A.roster.length<MAXR&&B.roster.includes(p.id)){unsign(p);sign(p,A,false)}}
    liquidate(B);A.rep=Math.min(99,A.rep+2);A.fs=Math.max(0,(A.fs||0)-.6);B.fs=0;up.fs=0;
    news(`${an} übernimmt die besten Spieler von ${bn}. ${bn} zieht sich in die T2-Szene zurück, ${un} rückt in die ${r} nach.`,'liga')}}

/* ----- Verlauf (Saison für Saison) ----- */
function extrasSeason(){const U=S.teams[S.user],s=S.summary;S.trend=S.trend||[];
  if(!S.trend.some(x=>x.year===S.year))S.trend.push({year:S.year,team:U.name,rep:U.rep,ovr:Math.round(teamOvr(U)*10)/10,bal:Math.round(S.fin.balance),fans:Math.round(S.fin.fans),place:s?s.place:null,titles:S.trophies.filter(t=>t.year===S.year).length});
  if(S.trend.length>25)S.trend.shift();
  if(!S.jobless&&(!S.media||S.media.until<=S.year)&&!S.inbox.some(m=>m.k==='media'&&!m.done)){const E=PEV.media;mail(E.t(),E.b(),{type:'pev',k:'media',done:false,exp:S.step+60})}
  try{mergeSeason()}catch(e){}}
function chart(vals,col,fmt){const w=300,h=90,n=vals.length;if(n<2)return'<p class="muted">Noch zu wenig Daten.</p>';
  const mn=Math.min(...vals),mx=Math.max(...vals),sp=mx-mn||1,pts=vals.map((v,i)=>[8+i*(w-16)/(n-1),h-10-(v-mn)/sp*(h-22)]);
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block"><polyline fill="none" stroke="${col}" stroke-width="2.4" points="${pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')}"/>${pts.map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="${col}"/>`).join('')}</svg>
  <div class="stat"><span class="muted">${fmt(vals[0])}</span><span>${fmt(vals[n-1])}</span></div>`}
function trendView(){const T=S.trend||[];
  return `<div class="pagehead"><div><h1>Verlauf</h1><p>Deine Jahre als Manager im Überblick</p></div></div>
  ${T.length<2?'<section class="panel s12"><p class="empty">Der Verlauf füllt sich zum Ende jeder Saison. Nach der zweiten Saison erscheinen die Diagramme.</p></section>':`<div class="grid">
  <section class="panel s6"><div class="lab">Vereinsruf</div>${chart(T.map(x=>x.rep),'var(--brass)',v=>v)}</section>
  <section class="panel s6"><div class="lab">Teamstärke</div>${chart(T.map(x=>x.ovr),'var(--good)',v=>v.toFixed(1))}</section>
  <section class="panel s6"><div class="lab">Kontostand</div>${chart(T.map(x=>x.bal),'var(--team)',v=>eurK(v))}</section>
  <section class="panel s6"><div class="lab">Fans</div>${chart(T.map(x=>x.fans),'var(--bad)',v=>v.toLocaleString('de-DE'))}</section></div>`}
  <section class="panel s12" style="margin-top:14px"><div class="lab">Saisons</div>${T.slice().reverse().map(x=>`<div class="stat"><span>${x.year} · ${x.team}</span><span class="mono">${x.place?'Platz '+x.place:'ohne Platz'} · ${x.titles} ${x.titles===1?'Titel':'Titel'} · Ruf ${x.rep}</span></div>`).join('')||'<p class="empty">Noch keine Saison abgeschlossen.</p>'}</section>`}

/* ----- Glossar ----- */
const GLOSS=[
 ['Vereinsruf','Das Prestige deines Vereins. Gute Spieler wechseln lieber zu Vereinen mit hohem Ruf und verlangen bei kleinen Vereinen Aufschläge.'],
 ['Gehaltsbudget','Obergrenze für die Wochengehälter. Es folgt aus den Einnahmen und der Philosophie deines Vereins.'],
 ['Transferbudget','Eigener Topf für Ablösen und Handgelder. Verkäufe füllen ihn zu einem Teil auf.'],
 ['Vorstands-Veto','Der Vorstand blockiert Verträge, die dein Konto bis Saisonende unter die Grenze drücken würden.'],
 ['Teamchemie','Eingespielte Teams spielen besser. Neue Spieler brauchen etwa einen Split.'],
 ['Transferfenster','Gekauft wird in der Saisonpause und in den ersten zwei Wochen von Winter- und Sommer-Split. Vereinslose gehen immer.'],
 ['Charakter','Jeder Spieler hat eine Persönlichkeit. Hitzköpfe hassen die Bank, Führungsspieler heben die Stimmung, Söldner verlangen mehr Gehalt.'],
 ['Luxussteuer','Liegt deine Lohnsumme über 200% des Ligaschnitts, zahlst du 30% des Überschusses pro Woche.'],
 ['Relegation','Der Letzte jeder Liga spielt gegen den T2-Meister um den Klassenerhalt.'],
 ['Insolvenz','KI-Vereine mit dauerhaft zu hohen Gehältern gehen pleite. Der T2-Meister rückt nach.'],
 ['Import-Regel','Höchstens zwei Importe in der Startelf. Nach drei Jahren in einer Region zählt ein Spieler als Einheimischer.'],
 ['Medienrechte','Alle paar Jahre verhandelt der Verband die Ausschüttung neu. Du wählst Laufzeit und Risiko.']];
function helpView(){return `<div class="pagehead"><div><h1>Hilfe und Glossar</h1><p>Die wichtigsten Begriffe</p></div></div><section class="panel s12">${GLOSS.map(g=>`<div class="stat" style="align-items:flex-start"><b style="min-width:150px">${g[0]}</b><span class="muted" style="flex:1">${g[1]}</span></div>`).join('')}</section>`}

/* ----- Benannte Spielstände ----- */
function slotNames(){try{return JSON.parse(localStorage.getItem('riftmgr_slotnames')||'{}')||{}}catch(e){return{}}}
function slotName(n){return slotNames()[n]||''}
function setSlotName(n,v){const m=slotNames();v=String(v||'').trim().slice(0,24);if(v)m[n]=v;else delete m[n];try{localStorage.setItem('riftmgr_slotnames',JSON.stringify(m))}catch(e){}}
const XACT={
  slotname(d){const n=+d.v;let v=d.name;if(v==null&&typeof prompt==='function')v=prompt('Name für diesen Spielstand',slotName(n));if(v==null)return;setSlotName(n,v);render()},
  talk(d){const p=S.players[d.id];if(!p||!isMine(p))return;if(p.talked!=null&&S.step-p.talked<4&&S.step>=p.talked)return;const k=persOf(p);p.talked=S.step;
    p.morale=clamp(p.morale+(k==='hot'?5:k==='leader'?3:8),20,100);pmsg(p.id,`${p.name} fühlt sich ernst genommen (Moral +${k==='hot'?5:k==='leader'?3:8}).`,true);save();render()}};

const _todoItems=todoItems;
todoItems=function(){const L=_todoItems();if(S.phase!=='offseason'&&winOpen()&&S.ev&&S.ev.round===1&&!S.jobless)L.push({lvl:'info',txt:'Transferfenster schließt nach dieser Woche',attrs:'data-a="nav2" data-v="transfer" data-k="TTAB" data-t="markt"',btn:'Zum Markt'});return L};
