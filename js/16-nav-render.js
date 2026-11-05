/* ===== Navigation ===== */
let TACTAB='tac',IBF='ALL',NWF='ALL';
function tacticView(){const h=tacticViewFull(),g=h.indexOf('<div class="grid">'),m=h.indexOf('<!--TRAIN-->');if(g<0||m<0)return h;
  if(TACTAB==='train')return `<div class="pagehead"><div><h1>Training</h1><p>Wochenplan, Belastung, Mentoring und Einzeltraining.</p></div></div><div class="grid">`+h.slice(m+12);
  return h.slice(0,m)+'</div>'}
const NAVG=[
 ['buero','Büro','home',[['Übersicht','home'],['Postfach','inbox'],['News','news'],['Spielstand','save']]],
 ['team','Team','squad',[['Kaderübersicht','squad','KTAB','depth'],['Aufstellung','squad','KTAB','list'],['Attribute','squad','KTAB','attr'],['Teamchemie','squad','KTAB','chem'],['Statistik','squad','KTAB','stats'],['Academy','squad','KTAB','aca'],['Taktik','tactic','TACTAB','tac'],['Training','tactic','TACTAB','train']]],
 ['markt','Markt','transfer',[['Transfermarkt','transfer','TTAB','markt'],['Scouting','transfer','TTAB','scout'],['Beobachtung','transfer','TTAB','short'],['Transferverlauf','transfer','TTAB','hist']]],
 ['comp','Wettbewerb','league',[['Turniere','league','LTAB','comp'],['Meine Spiele','league','LTAB','hist'],['Statistiken','league','LTAB','stats'],['Auszeichnungen','league','LTAB','awards'],['T2-Szene','league','LTAB','t2']]],
 ['verein','Verein','club',[['Finanzen','club','CLUBTAB','fin'],['Budgets','club','CLUBTAB','budget'],['Sponsoren','club','CLUBTAB','spons'],['Einnahmen','club','CLUBTAB','inc'],['Infrastruktur','club','CLUBTAB','infra'],['Staff & Vorstand','club','CLUBTAB','staff']]]];
NAVG[3][4]='Liga';
const GICON={buero:ICON.home,team:ICON.squad,markt:ICON.transfer,comp:ICON.league,verein:ICON.club};
function tabVal(k){return{KTAB,TACTAB,TTAB,LTAB,CLUBTAB}[k]}
function navBadge(v,t){if(v==='inbox'){const n=unseen();return n?`<span class="nbadge">${n>9?'9+':n}</span>`:''}
  if(v==='transfer'&&t==='scout'){const n=(S.reports||[]).filter(r=>r.g==='A'&&!r.seen&&S.players[r.pid]&&!isMine(S.players[r.pid])).length;return n?`<span class="nbadge g">${n}</span>`:''}
  if(v==='squad'&&t==='list'){const n=S.teams[S.user].roster.filter(i=>{const p=S.players[i];return p.form<55||p.morale<45||(p.load||0)>=75}).length;return n?`<span class="nbadge w">${n}</span>`:''}
  return ''}
function unseen(){return S.inbox.filter(m=>m.id>(S.seenMail||0)).length+S.inbox.filter(m=>['offer','spreq','pev'].includes(m.type)&&!m.done&&m.id<=(S.seenMail||0)).length}
function grpOf(){for(const g of NAVG)if(g[3].some(i=>i[1]===S.view)||(g[2]===S.view))return g[0];if(['player','nego','mh','prematch','live','draft'].includes(S.view))return{player:'team',nego:'markt',mh:'comp'}[S.view]||'buero';return 'buero'}
function inboxView(){S.seenMail=Math.max(S.seenMail||0,...S.inbox.map(m=>m.id),0);const cats=['ALL',...Object.keys(MCAT)],L=S.inbox.filter(m=>IBF==='ALL'||mailCat(m.title)===IBF),open=S.inbox.filter(m=>['offer','spreq','pev'].includes(m.type)&&!m.done);
  return `<div class="pagehead"><div><h1>Postfach</h1><p>${S.inbox.length} Nachrichten${open.length?` · ${open.length} warten auf deine Entscheidung`:''}</p></div></div>
  <div class="seg" style="margin-bottom:16px">${cats.map(c=>`<button class="${IBF===c?'on':''}" data-a="ibf" data-v="${c}">${c==='ALL'?'Alle':MCAT[c][0]} ${c==='ALL'?'':`<span class="dim">${S.inbox.filter(m=>mailCat(m.title)===c).length}</span>`}</button>`).join('')}</div>
  <div class="grid">${open.length&&IBF==='ALL'?`<section class="panel s12"><div class="lab"><span>Offene Entscheidungen</span><span>${open.length}</span></div><div class="inbox">${open.map(msgView).join('')}</div></section>`:''}
  <section class="panel s12"><div class="lab"><span>${IBF==='ALL'?'Alle Nachrichten':MCAT[IBF][0]}</span><span>${L.length}</span></div><div class="inbox">${L.map(msgView).join('')||'<p class="empty">Keine Nachrichten in dieser Kategorie.</p>'}</div></section></div>`}
const NCAT={upset:'Überraschung',title:'Titel',transfer:'Transfer',award:'Auszeichnung',ach:'Erfolg',liga:'Liga'};
function newsView(){const L=(S.news||[]).filter(n=>NWF==='ALL'||n.cat===NWF);
  return `<div class="pagehead"><div><h1>Esports-News</h1><p>Meldungen aus allen Regionen</p></div></div>
  <div class="seg" style="margin-bottom:16px">${['ALL',...Object.keys(NCAT)].map(c=>`<button class="${NWF===c?'on':''}" data-a="nwf" data-v="${c}">${c==='ALL'?'Alle':NCAT[c]}</button>`).join('')}</div>
  <div class="grid"><section class="panel s12">${L.map(n=>`<div class="news"><span class="w"><span class="mc" style="--mc:var(--brass)">${NCAT[n.cat]||'Liga'}</span> ${n.when}</span><span>${n.t}</span></div>`).join('')||'<p class="empty">Noch keine Meldungen.</p>'}</section></div>`}
/* ===== Render ===== */
function render(){
  const app=$('#app');
  if(!S){document.documentElement.style.removeProperty('--team');app.innerHTML=startView();return}
  try{document.documentElement.style.setProperty('--team',S.teams[S.user].color)}catch(e){}
  if((S.view==='prematch'||S.view==='live'||S.view==='draft')&&!LIVE)S.view='home';
  if(S.view==='nego'&&!NG)S.view='squad';
  if(S.view==='mh'&&!MHV)S.view='league';
  const v={home:homeView,squad:squadView,tactic:tacticView,transfer:transferView,league:leagueView,club:clubView,prematch:preView,live:liveView,player:playerView,draft:draftView,nego:negoView,mh:mhView,inbox:inboxView,news:newsView,save:saveView}[S.view]||homeView;
  try{app.innerHTML=`<div class="shell">${sideNav()}<div class="main">${topBar()}<main class="content">${ERR?errView():v()}</main></div></div>${MODAL&&MODAL.team?teamModal():''}${MODAL==='sim'&&!SIMRUN?simMenu():''}${SIMRUN?simOverlay():''}${SIMREP&&!SIMRUN?simReport():''}`}
  catch(e){ERR=e.message;try{app.innerHTML=`<main class="content">${errView()}</main>`}catch(_){app.innerHTML='<p style="padding:20px">Fehler im Spielstand.</p>'}}
}
function errView(){return `<section class="panel"><div class="lab">Fehler</div><p style="margin:0 0 6px">Hier ist etwas schiefgelaufen (${ERR}). Dein Spielstand ist gespeichert.</p><p class="muted" style="margin:0 0 12px;font-size:14px">"Phase neu starten" setzt die aktuelle Turnierphase neu auf. Die bisherigen Ergebnisse der Saison bleiben erhalten.</p><div class="acts"><button class="btn" data-a="repair">Phase neu starten</button><button class="btn ghost" data-a="nav" data-v="home">Zur Übersicht</button></div></section>`}
