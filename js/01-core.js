/* ===== Konstanten ===== */
const ROLES=['TOP','JGL','MID','ADC','SUP'];
const RN={TOP:'Top',JGL:'Jungle',MID:'Mid',ADC:'ADC',SUP:'Support'};
const ATTR=['mech','lane','macro','tf','comm'];
const AN={mech:'Mechanik',lane:'Laning',macro:'Makro',tf:'Teamfight',comm:'Kommunikation'};
const W={TOP:{lane:.3,mech:.25,tf:.25,macro:.1,comm:.1},JGL:{macro:.35,mech:.2,tf:.2,comm:.15,lane:.1},MID:{mech:.3,lane:.25,tf:.2,macro:.15,comm:.1},ADC:{mech:.35,tf:.3,lane:.25,macro:.05,comm:.05},SUP:{comm:.3,macro:.3,tf:.2,lane:.15,mech:.05}};
const STYLES={
  AGG:{n:'Early Aggro',d:'Druck in der Lane-Phase, frühe Ganks und Dives.',mod:[4,1,-3]},
  OBJ:{n:'Objective Control',d:'Vision, Drachen und Herold. Stark zwischen Minute 14 und 25.',mod:[0,4,-1]},
  TF:{n:'Teamfight',d:'Kämpfe 5 gegen 5 um jedes Objective. Stark ab dem Midgame.',mod:[-2,1,3]},
  SCL:{n:'Scaling',d:'Farmen, sicher spielen, spät gewinnen.',mod:[-3,0,4]}
};
const SK=Object.keys(STYLES);
const COUNTER={AGG:{vs:'SCL',ph:'e'},SCL:{vs:'TF',ph:'l'},TF:{vs:'OBJ',ph:'l'},OBJ:{vs:'AGG',ph:'m'}};
const FOCUS={TOP:'Topside',MID:'Mid',ADC:'Botside'};
const DA=[['mec','Mechanik','T'],['frm','Farmen','T'],['lan','Laning','T'],['pre','Präzision','T'],['pool','Championpool','T'],
  ['gs','Spielverständnis','M'],['dec','Entscheidungen','M'],['vis','Vision','M'],['ant','Antizipation','M'],['pos','Positionierung','M'],['tw','Teamwork','M'],['com','Kommunikation','M'],['lead','Führung','M'],['nrv','Nervenstärke','M'],
  ['rea','Reaktion','P'],['con','Konzentration','P'],['cns','Konstanz','P'],['sta','Belastbarkeit','P']];
const DK=DA.map(x=>x[0]),DN=Object.fromEntries(DA.map(x=>[x[0],x[1]]));
const DG={T:'Technik',M:'Mental',P:'Mindset'};
const DSHORT={mec:'Mec',frm:'Frm',lan:'Lan',pre:'Prä',pool:'Pool',gs:'SpV',dec:'Ent',vis:'Vis',ant:'Ant',pos:'Pos',tw:'Tea',com:'Kom',lead:'Füh',nrv:'Nrv',rea:'Rea',con:'Kon',cns:'Kst',sta:'Bel'};
const DINFO={pool:'Mehr Optionen im Draft. Wirkt ab Spiel 2 einer Serie.',nrv:'Leistung in Playoffs und internationalen Spielen.',cns:'Weniger Schwankung von Spiel zu Spiel.',con:'Weniger Fehler im Lategame.',sta:'Verliert weniger Form durch Training und Streaming.'};
const COMP={mech:{mec:.4,rea:.25,pre:.25,pool:.1},lane:{lan:.4,frm:.3,mec:.15,ant:.15},macro:{gs:.35,vis:.25,dec:.25,ant:.15},tf:{pos:.35,tw:.25,pre:.15,dec:.15,rea:.1},comm:{com:.4,tw:.25,lead:.2,nrv:.15}};
const TGROUP={bal:{n:'Ausgewogen',a:DK.filter(x=>x!=='cns')},tech:{n:'Technik',a:['mec','frm','lan','pre','pool']},mental:{n:'Spielverständnis',a:['gs','dec','vis','ant']},team:{n:'Teamplay',a:['pos','tw','com','lead']},mind:{n:'Mindset',a:['rea','con','sta','nrv']},rest:{n:'Erholung',a:[]}};
const TRAIN={mech:'Mechanik',lane:'Laning',macro:'Makro',tf:'Teamfight',comm:'Kommunikation',rest:'Erholung'};

const REGS=['LCK','LPL','LEC','LCS','LCP','CBLOL'];
const REG={LCK:{full:'Korea',off:4},LPL:{full:'China',off:4},LEC:{full:'Europa',off:0},LCS:{full:'Nordamerika',off:-4},LCP:{full:'Asien-Pazifik',off:-5},CBLOL:{full:'Brasilien',off:-7}};
const REGNAT={LCK:['KR'],LPL:['CN','CN','CN','KR'],LEC:['DE','DE','FR','ES','PL','DK','SE','NL','IT','CZ','GR','BE','UK','AT','SI'],LCS:['US','US','US','CA','KR','DK'],LCP:['TW','JP','VN','PH','AU','TH','VN','KR'],CBLOL:['BR','BR','BR','BR','KR','AR']};
const TEAMDATA={
  LCK:[['HBD','Hanbit Dragons'],['SRV','Seoul Ravens'],['BSB','Busan Breakers'],['ICP','Incheon Phantoms'],['DGS','Daegu Sentinels'],['GJS','Gwangju Spark'],['UST','Ulsan Titans'],['SWW','Suwon Wolves'],['JJH','Jeonju Hawks'],['CWM','Changwon Mariners']],
  LPL:[['SHL','Shanghai Lotus'],['BJT','Beijing Thunder'],['CDP','Chengdu Pandas'],['WHC','Wuhan Comets'],['HZJ','Hangzhou Jade'],['SZR','Shenzhen Rising'],['XAW','Xi\'an Warriors'],['CQF','Chongqing Fire'],['NJD','Nanjing Dynasty'],['GZT','Guangzhou Tide'],['SZS','Suzhou Silk'],['TJH','Tianjin Harbor'],['QDS','Qingdao Sails'],['CSB','Changsha Blaze']],
  LEC:[['NWE','Nordwind Esports'],['BBS','Berlin Basilisks'],['MDM','Madrid Meteors'],['CPC','Copenhagen Crows'],['LYL','Lyon Lumen'],['RTR','Rotterdam Rooks'],['WAW','Warsaw Wardens'],['MLM','Milano Mirage'],['VVX','Vienna Vortex'],['LSN','Lisboa Navigators']],
  LCS:[['AUO','Austin Outlaws'],['SEA','Seattle Summit'],['TPB','Toronto Polar Bears'],['CHW','Chicago Wind'],['BOH','Boston Harbor'],['DVP','Denver Peaks'],['MIH','Miami Heatwave'],['VCO','Vancouver Orcas']],
  LCP:[['TPT','Taipei Typhoon'],['TKK','Tokyo Kitsune'],['HNL','Hanoi Lions'],['MNM','Manila Monsoon'],['SSC','Sydney Southern Cross'],['BKG','Bangkok Garuda'],['HCS','Saigon Storm'],['SGM','Singapore Merlions']],
  CBLOL:[['SPJ','São Paulo Jaguars'],['RIO','Rio Tempest'],['CTP','Curitiba Pinheiros'],['RCC','Recife Corsairs'],['PAG','Porto Alegre Gaúchos'],['BHM','Belo Horizonte Minas'],['FTS','Fortaleza Sol'],['BSC','Brasília Capital']]
};
const repFor=(i,n)=>Math.round(84-i*28/(n-1));
const CAL=[
  {id:'S1',type:'split',name:'Winter-Split'},
  {id:'FS',type:'intl',name:'First Stand'},
  {id:'S2',type:'split',name:'Frühjahrs-Split'},
  {id:'MSI',type:'intl',name:'MSI'},
  {id:'S3',type:'split',name:'Sommer-Split'},
  {id:'DC',type:'intl',name:'Demacia Cup'},
  {id:'WLD',type:'intl',name:'Worlds'}
];
const INTLINFO={
  FS:'8 Teams: LCK und LPL je 2, sonst je 1 (Finalisten des Winter-Splits). Zwei Vierergruppen im Bo3, dann Halbfinale und Finale im Bo5.',
  MSI:'11 Teams aus dem Frühjahrs-Split: je 2 pro Region, CBLOL 1. Alle Erstplatzierten und die Nummer 2 der First-Stand-Siegerregion starten direkt im K.-o.-Baum (Bo5). Die anderen vier spielen ein Play-In.',
  DC:'12 Teams, die knapp an Worlds vorbeigeschrammt sind: LPL und LCK je 3, LEC und LCS je 2, LCP und CBLOL je 1. Drei Swiss-Runden (Runde 1 Bo1, danach Bo3), die besten 8 spielen den K.-o.-Baum im Bo5.',
  WLD:'17 Teams aus dem Sommer-Split. Zwei Teams spielen das Play-In, dann Swiss-Phase mit 16 Teams (3 Siege weiter, 3 Niederlagen raus, Entscheidungsspiele im Bo3). Ab dem Viertelfinale Bo5.'
};
const PRZ={
  FS:{Sieger:250000,Finale:120000,Halbfinale:60000,Gruppenphase:25000},
  MSI:{Sieger:500000,Finale:250000,Halbfinale:120000,Viertelfinale:60000,'Play-In':25000},
  DC:{Sieger:300000,Finale:150000,Halbfinale:75000,Viertelfinale:40000,'Swiss-Phase':15000},
  WLD:{Sieger:1200000,Finale:600000,Halbfinale:300000,Viertelfinale:150000,'Swiss-Phase':60000,'Play-In':30000}
};
const REPB={Sieger:5,Finale:3,Halbfinale:2,Viertelfinale:1};
const SPLITPRIZE=[80000,40000,20000,20000,10000,10000,5000,5000];
const NATS=['DE','FR','ES','KR','CN','US','BR','VN','PL','DK'];
const PRE=['Kae','Vy','Mir','Tor','Zen','Ral','Sko','Fen','Ixa','Bru','Nok','Sel','Var','Qui','Dra','Lum','Hex','Ory','Pax','Tyv','Kro','Elu','Sab','Jin','Ruk','Wen','Ash','Cal','Oz','Yri','Mav','Gil','Rho','Fy','Nim','Tez','Baz','Lio','Sor','Xan','Hyu','Doy','Mei','Kai','Lux','Rin','Sha','Tao','Vel','Zu'];
const SUF=['ro','rex','len','ix','ka','dor','vyn','ard','ess','nik','u','os','ay','eth','im','ark','ula','ez','o','yx','an','is','ko','ven','ra','jin','ho','zy','mo','ki'];
const MAXR=9;
const BRANDS=['Nordlicht Energy','Vektor Hardware','Kaiju Snacks','Pulsar Peripherals','Helix Bank','Atlas Mobile','Quanta Cloud','Ember Drinks','Orbit Chairs','Lumen Telecom','Falke Versicherung','Nimbus Airlines','Tessera Monitors','Kobalt Motors','Sora Headsets','Mosaik Fashion'];
const SLOTS=[['main','Hauptsponsor',1,null,'',['fix','perf','risk','goal','multi']],['hw','Hardware-Partner',.5,null,'',['fix','perf','multi','content']],
  ['jersey','Trikot-Ärmel',.2,()=>S.teams[S.user].rep>=55,'Ruf ab 55',['fix','goal','fan']],['drink','Getränkepartner',.15,()=>S.fin.fans>=110000,'110.000 Fans',['fix','fan','perf']],
  ['stream','Streaming-Plattform',.25,()=>S.fin.content>=1,'Content-Team aktiv',['content','fix','fan']],['mobile','Mobilfunk-Partner',.15,()=>S.teams[S.user].rep>=70,'Ruf ab 70',['fix','multi','goal']],
  ['car','Mobilitätspartner',.12,()=>S.teams[S.user].rep>=80,'Ruf ab 80',['fix','multi','perf']]];
const STYPE={fix:{n:'Festbetrag',d:'Planbare Zahlung jede Woche, keine Boni.'},perf:{n:'Leistungsvertrag',d:'Weniger Fixum, dafür Prämie für jeden Seriensieg und für Titel.'},risk:{n:'Risikovertrag',d:'Kleines Fixum, große Prämien für Titel und internationale Qualifikationen.'},goal:{n:'Zielvertrag',d:'Mittleres Fixum, großer Bonus wenn das Saisonziel erreicht wird.'},multi:{n:'Mehrjahresvertrag',d:'Fast volles Fixum über 2-3 Saisons. Planbar über die Saison hinaus.'},fan:{n:'Reichweiten-Deal',d:'Kleines Fixum plus Betrag je nach Fanzahl.'},content:{n:'Content-Deal',d:'Hohes Fixum, Spieler drehen Content. Kostet etwas Form, braucht ein Content-Team.'}};
const INFRA={tc:{n:'Trainingszentrum',d:'Mehr Fortschritt im Wochentraining, +15% pro Stufe.',cost:[120000,250000,400000],up:1500},gh:{n:'Gaming House',d:'Jede Woche etwas mehr Moral und Form für den ganzen Kader.',cost:[100000,200000,350000],up:2000},ac:{n:'Academy',d:'Mehr und bessere Talente für deine Academy zum Saisonstart, dazu schnelleres Academy-Training.',cost:[80000,180000],up:4000}};
const CONTENT=[[0,0,'Keins'],[2500,.25,'Klein'],[6000,.6,'Mittel'],[12000,1.1,'Groß']];
const MERCH={low:{n:'Günstig',m:.7,f:.35},normal:{n:'Normal',m:1,f:0},high:{n:'Premium',m:1.4,f:-.3}};
const LOANS=[250000,500000,1000000];
const LSHARE={LCK:6000,LPL:6000,LEC:4500,LCS:4500,LCP:3500,CBLOL:3000};
const r100=x=>Math.round(x/100)*100,r1000=x=>Math.round(x/1000)*1000;
const SAVEKEY='riftmgr_v2';

/* ===== Helfer ===== */
const $=s=>document.querySelector(s);
const R=Math.random;
const ri=(a,b)=>Math.floor(R()*(b-a+1))+a;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pick=a=>a[Math.floor(R()*a.length)];
const gauss=()=>{let u=0,v=0;while(!u)u=R();while(!v)v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const sig=x=>1/(1+Math.exp(-x));
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const eur=n=>(n<0?'-':'')+Math.abs(Math.round(n)).toLocaleString('de-DE')+' €';
const eurK=n=>{const a=Math.abs(n),s=n<0?'-':'';if(a>=1e6)return s+(a/1e6).toFixed(2).replace('.',',')+' Mio. €';if(a>=1000)return s+Math.round(a/1000).toLocaleString('de-DE')+'k €';return s+Math.round(a)+' €'};
const oc=o=>o>=85?'o5':o>=75?'o4':o>=65?'o3':o>=55?'o2':'o1';
const barCol=v=>v>=75?'var(--good)':v>=55?'var(--warn)':'var(--bad)';
const sgn=n=>n>0?'+'+n:n<0?String(n).replace('-','−'):'±0';

let RFILT='ALL',CLUBTAB='fin',ERR=null,KTAB='depth',KSORT='value',KMODE='pos',PV=null,TACE=0,TTAB='markt',LTAB='comp';
function pmsg(id,msg,ok){PV=Object.assign(PV||{tab:'vertrag',back:'squad'},{id,msg,ok})}
let S=null,LIVE=null,MODAL=null,FILT={role:'ALL',src:'ALL'},VIEWREG=null,STARTREG='LEC';

/* ===== Spieler ===== */
function ovr(p){const w=W[p.role];let s=0;for(const k in w)s+=p.a[k]*w[k];return Math.round(s)}
function salaryFor(o){return Math.max(800,Math.round(Math.max(0,o-40)**2*3.5*(1+Math.max(0,o-70)/12)/100)*100)}
function valueFor(p){const o=ovr(p);let v=Math.max(0,o-40)**3*4*(1+Math.max(0,o-70)**1.5/25);if(p.team&&S.teams[p.team]&&S.teams[p.team].tier===2)v*=.6;v*=1+Math.max(0,p.pot-o)/30;if(p.age>=27)v*=.8;return Math.max(5000,Math.round(v/5000)*5000)}
const RNAMES={
  KR:{f:['Min-jun','Seo-jun','Ji-hoon','Do-yun','Hyun-woo','Jun-ho','Sung-min','Tae-yang','Woo-jin','Dong-hyun','Jae-won','Sang-woo','Eun-seok','Ha-joon'],l:['Kim','Lee','Park','Choi','Jung','Kang','Cho','Yoon','Jang','Lim','Han','Oh','Seo','Shin'],fam:1},
  CN:{f:['Wei','Hao','Jun','Yi','Chen','Lei','Bo','Yu','Tian','Zhe','Kai','Rui','Ming','Xuan'],l:['Wang','Li','Zhang','Liu','Chen','Yang','Huang','Zhao','Wu','Zhou','Xu','Sun','Ma','Hu'],fam:1},
  TW:{f:['Chia-hao','Yu-ting','Po-yen','Wei-lun','Chun-yi','Hsiang','Kuan-yu','Tzu-wei'],l:['Chen','Lin','Huang','Chang','Lee','Wang','Wu','Tsai'],fam:1},
  VN:{f:['Minh','Duc','Huy','Khang','Phuc','Bao','Quan','Tuan'],l:['Nguyen','Tran','Le','Pham','Hoang','Phan','Vu','Dang'],fam:1},
  JP:{f:['Haruto','Ren','Sota','Yuki','Kaito','Riku','Takumi','Daiki'],l:['Sato','Suzuki','Takahashi','Tanaka','Ito','Watanabe','Yamamoto','Kobayashi']},
  TH:{f:['Anan','Krit','Niran','Somchai','Thanawat','Phum','Chai','Arthit'],l:['Saelim','Chaiyaporn','Wongsa','Srisuk','Kittisak','Thongdee','Boonma','Rattana']},
  PH:{f:['Miguel','Joshua','Carlo','Paolo','Rafael','Andrei','Joaquin','Marco'],l:['Santos','Reyes','Cruz','Bautista','Garcia','Mendoza','Villanueva','Ramos']},
  DE:{f:['Lukas','Jonas','Leon','Felix','Niklas','Tim','Jan','Moritz','Paul','Max','Fabian','David'],l:['Müller','Schmidt','Schneider','Fischer','Weber','Becker','Hoffmann','Wagner','Koch','Richter','Klein','Wolf']},
  AT:{f:['Lukas','Tobias','Florian','Simon','Elias','Julian'],l:['Gruber','Huber','Bauer','Wagner','Pichler','Steiner']},
  FR:{f:['Lucas','Hugo','Théo','Louis','Nathan','Mathis','Enzo','Maxime'],l:['Martin','Bernard','Dubois','Thomas','Robert','Petit','Moreau','Laurent']},
  BE:{f:['Arthur','Noah','Louis','Victor','Jules','Mats'],l:['Peeters','Janssens','Maes','Jacobs','Mertens','Willems']},
  ES:{f:['Pablo','Álvaro','Hugo','Javier','Adrián','Daniel','Sergio','Marcos'],l:['García','Fernández','López','Martínez','Sánchez','Pérez','Gómez','Ruiz']},
  AR:{f:['Santiago','Mateo','Thiago','Lautaro','Facundo','Tomás'],l:['González','Rodríguez','Fernández','López','Díaz','Romero']},
  PT:{f:['João','Tiago','Rodrigo','Diogo','Afonso','Miguel'],l:['Silva','Santos','Ferreira','Pereira','Oliveira','Costa']},
  BR:{f:['Gabriel','Lucas','Matheus','Guilherme','Rafael','Felipe','Vinícius','Thiago','Caio','Bruno'],l:['Silva','Santos','Oliveira','Souza','Lima','Pereira','Costa','Almeida','Ribeiro','Carvalho']},
  IT:{f:['Lorenzo','Matteo','Andrea','Alessandro','Davide','Simone'],l:['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano']},
  PL:{f:['Jakub','Kacper','Mateusz','Szymon','Bartosz','Michał'],l:['Nowak','Kowalski','Wiśniewski','Wójcik','Kamiński','Lewandowski']},
  CZ:{f:['Jakub','Tomáš','Ondřej','Matěj','Vojtěch','Adam'],l:['Novák','Svoboda','Dvořák','Černý','Procházka','Kučera']},
  SI:{f:['Luka','Nejc','Žiga','Jan','Matic','Gal'],l:['Novak','Horvat','Kovačič','Krajnc','Zupančič','Potočnik']},
  DK:{f:['Mads','Rasmus','Emil','Frederik','Magnus','Oliver'],l:['Nielsen','Jensen','Hansen','Pedersen','Andersen','Larsen']},
  SE:{f:['Erik','Oscar','William','Elias','Hugo','Axel'],l:['Andersson','Johansson','Karlsson','Nilsson','Eriksson','Lindberg']},
  NL:{f:['Daan','Sem','Bram','Luuk','Thijs','Jesse'],l:['de Jong','Jansen','de Vries','van Dijk','Bakker','Visser']},
  GR:{f:['Giorgos','Nikos','Dimitris','Kostas','Yannis','Alexandros'],l:['Papadopoulos','Pappas','Oikonomou','Georgiou','Nikolaidis','Vlachos']},
  EN:{f:['James','Oliver','Jack','Ethan','Liam','Noah','Ryan','Tyler','Connor','Ben'],l:['Smith','Johnson','Brown','Taylor','Wilson','Davies','Miller','Walker','Clark','Hall']}
};
function genRealName(nat){const k=RNAMES[nat]?nat:['UK','US','CA','AU'].includes(nat)?'EN':'EN',L=RNAMES[k];const f=pick(L.f),l=pick(L.l);return L.fam?`${l} ${f}`:`${f} ${l}`}
function genName(){for(let i=0;i<400;i++){let n=pick(PRE)+pick(SUF);if(R()<.12)n+=pick(['x','z','y']);if(!S.usedNames[n]){S.usedNames[n]=1;return n}}return 'Rookie'+S.nextId}
function pickAge(){const r=R();return r<.25?ri(17,19):r<.7?ri(20,23):ri(24,28)}
const KWC={};
function keyW(role){if(KWC[role])return KWC[role];const o={};for(const x of DK){let s=0;for(const k in COMP)s+=(W[role][k]||0)*(COMP[k][x]||0);o[x]=s}return KWC[role]=o}
function keyAttrs(role){const w=keyW(role);return DK.slice().sort((a,b)=>w[b]-w[a]).slice(0,6)}
function derive(p){p.a=p.a||{};for(const k in COMP){let s=0;for(const x in COMP[k])s+=p.d[x]*COMP[k][x];p.a[k]=s*5}}
function ovrAs(p,role){let s=0;for(const k in W[role])s+=p.a[k]*W[role][k];return Math.round(s)}
function genPlayer(role,target,age,reg){
  age=age??pickAge();
  const nat0=pick(reg?REGNAT[reg]:NATS);const p={id:'p'+(S.nextId++),name:genName(),rn:genRealName(nat0),nat:nat0,role,age,a:{},d:{},h:{pro:ri(4,20),amb:ri(4,20),tm:ri(4,20)},ifoc:null,form:ri(68,82),morale:ri(62,78),contract:ri(1,3),team:null,listed:false,tried:''};
  const t=target/5,kw=keyW(role);
  for(const x of DK){let v=['con','cns','sta','nrv'].includes(x)?t+gauss()*2.2:t+gauss()*1.5+(kw[x]>=.08?.9:kw[x]<.02?-.6:0);if(age>=25&&['gs','dec','lead'].includes(x))v+=.6;p.d[x]=clamp(v,1,20)}
  derive(p);
  const o=ovr(p);
  p.pot=clamp(o+(age<=19?ri(6,18):age<=22?ri(2,10):ri(0,3)),o,96);
  p.salary=salaryFor(o);genChamps(p);
  return p;
}
function sign(p,T,starter){if(S&&S.teams)p.gel=gelStart(p,T);p.team=T.id;T.roster.push(p.id);S.players[p.id]=p;S.fa=S.fa.filter(x=>x!==p.id);if(starter||!T.starters[p.role])T.starters[p.role]=p.id}
function unsign(p){const T=S.teams[p.team];if(!T)return;T.roster=T.roster.filter(x=>x!==p.id);if(T.starters[p.role]===p.id){delete T.starters[p.role];const alt=T.roster.map(i=>S.players[i]).filter(x=>x.role===p.role).sort((a,b)=>ovr(b)-ovr(a))[0];if(alt)T.starters[p.role]=alt.id}p.team=null;p.listed=false}
function toFA(p){unsign(p);p.contract=0;p.salary=salaryFor(ovr(p));if(!S.fa.includes(p.id))S.fa.push(p.id)}
function teamOvr(T){let s=0;for(const r of ROLES)s+=ovr(S.players[T.starters[r]]);return Math.round(s/5)}
function ensureRoles(T,notify){for(const r of ROLES){if(!T.starters[r]){if(T.id===S.user&&S.teams[acaId()]){const A=S.teams[acaId()],c=A.roster.map(i=>S.players[i]).filter(p=>p.role===r).sort((x,y)=>ovr(y)-ovr(x))[0];if(c){c.fromAca=true;unsign(c);sign(c,T,true);if(notify)mail('Aus der Academy hochgezogen',`${c.name} (${RN[r]}) springt aus der Academy ein, weil dir ein ${RN[r]} fehlte.`);continue}}const p=genPlayer(r,ri(44,52),ri(17,19),T.reg);p.contract=1;p.salary=800;sign(p,T,true);if(notify)mail('Academy-Spieler hochgezogen',`${p.name} (${RN[r]}) rückt aus der Academy nach, weil dir ein Spieler auf dieser Position fehlte.`)}}}
function wkKey(){return S.season+'-'+S.step}
function teamsOf(r){return Object.values(S.teams).filter(t=>t.reg===r&&t.tier!==2)}
function expected(id){const T=S.teams[id];return teamsOf(T.reg).sort((a,b)=>b.rep-a.rep).findIndex(t=>t.id===id)+1}
function sponsorFor(rep){return Math.round((rep-28)**2*7.5/100)*100}
function newFin(bal,fans){return{weeks:[],balance:bal,fans,slots:Object.fromEntries(SLOTS.map(x=>[x[0],null])),offers:{},merch:'normal',content:0,infra:{tc:0,gh:0,ac:0},loan:null,pstream:false,season:{inc:{},exp:{}},last:null,hist:[bal]}}
function wageBill(){const A=S.teams[S.user+'A'];return S.teams[S.user].roster.reduce((s,id)=>s+S.players[id].salary,0)+(A?A.roster.reduce((s,id)=>s+S.players[id].salary,0):0)}
function proWages(){return S.teams[S.user].roster.reduce((s,id)=>s+S.players[id].salary,0)}
function sustainW(){const f=S.fin,U=S.teams[S.user];const inc=(sponsorBase()||SLOTS.slice(0,2).reduce((a,[k])=>a+(f.offers[k]?f.offers[k][0].base:0),0))+f.fans*.03+(LSHARE[U.reg]||4000)+(S.teams[S.user+'A']?2000:0);const oth=staffWages()+CONTENT[f.content][0]+Object.keys(INFRA).reduce((a,k)=>a+f.infra[k]*INFRA[k].up,0)+(S.scouts||[]).reduce((a,x)=>a+x.wage,0);return Math.max(0,(inc-oth)*.95)}
function wageFree(){return S.fin.budget.wage-wageBill()}
function setBudgets(){const f=S.fin,U=S.teams[S.user],bill=wageBill(),pos=f.balance>0;
  f.budget={transfer:pos?r1000(Math.min(f.balance*.45,f.balance*.2+U.rep*2500)):0,wage:r100(Math.max(bill+1500,Math.min(Math.max(bill*1.1+2500,U.rep*300),sustainW()))),salePct:clamp(50+Math.round((S.board-50)/2),35,80),asked:false,frozen:!pos}}
function weeklyCosts(){const f=S.fin;return wageBill()+staffWages()+CONTENT[f.content][0]+Object.keys(INFRA).reduce((a,k)=>a+f.infra[k]*INFRA[k].up,0)+(S.scouts||[]).reduce((a,x)=>a+x.wage,0)+(f.loan?f.loan.weekly:0)}
function reserveAmt(){return r1000(weeklyCosts()*10)}
function releasable(){const f=S.fin;if(f.balance<=0)return 0;return Math.max(0,r1000((f.balance-reserveAmt()-f.budget.transfer)*(.5+S.board/200)))}
function budgetReview(){const f=S.fin,b=f.budget,U=S.teams[S.user];if(f.balance<=0)return;const bill=wageBill();
  const nt=r1000(Math.min(f.balance*.45,f.balance*.2+U.rep*2500)),nw=r100(Math.max(bill+1500,Math.min(Math.max(bill*1.1+2500,U.rep*300),sustainW())));
  const dt=Math.max(0,nt-b.transfer),dw=Math.max(0,nw-b.wage);if(!dt&&!dw)return;b.transfer+=dt;b.wage+=dw;b.frozen=false;
  mail('Budgetprüfung des Vorstands',`Vor dem neuen Split hat der Vorstand die Budgets angepasst: ${dt?`Transferbudget +${eurK(dt)}`:''}${dt&&dw?', ':''}${dw?`Gehaltsbudget +${eurK(dw)} pro Woche`:''}.`)}
function finState(){const f=S.fin,w=f.weeks.slice(-8),avg=w.length?w.reduce((a,b)=>a+b,0)/w.length:0,proj=f.balance+avg*Math.max(0,52-S.step);
  const st=f.balance<0?['Kritisch','bad']:proj<0?['Angespannt','warn']:avg<0?['Stabil','warn']:f.balance>800000?['Sehr gesund','good']:['Gesund','good'];return{avg,proj,label:st[0],cls:st[1]}}
function book(cat,amt){if(!amt)return;S.fin.balance+=amt;const t=amt>=0?S.fin.season.inc:S.fin.season.exp;t[cat]=(t[cat]||0)+Math.abs(amt)}
function addMissingTeams(){const added=[];REGS.forEach((r,ri_)=>TEAMDATA[r].forEach(([id,name],i)=>{if(S.teams[id])return;
    const rep=repFor(i,TEAMDATA[r].length)+REG[r].off,T={id,name,reg:r,rep,color:`hsl(${(i*53+ri_*29+12)%360} 52% 66%)`,style:pick(SK),focus:pick(['TOP','MID','ADC']),roster:[],starters:{}};
    S.teams[id]=T;const base=Math.round(61+(rep-56)*.55);for(const ro of ROLES)sign(genPlayer(ro,base+ri(-4,4),undefined,r),T,true);for(let k=0;k<2;k++)sign(genPlayer(pick(ROLES),base-8+ri(-4,4),ri(17,20),r),T,false);added.push(name)}));
  if(added.length)mail('Neue Teams',`${added.length} Teams sind neu dabei (${added.join(', ')}). Sie steigen mit dem nächsten Split in ihre Ligen ein.`)}
const DOM={mec:'mech',frm:'lane',lan:'lane',pre:'mech',pool:'mech',gs:'macro',dec:'macro',vis:'macro',ant:'macro',pos:'tf',tw:'tf',com:'comm',lead:'comm',nrv:'comm',rea:'mech'};
function migrate(){addMissingTeams();for(const p of Object.values(S.players)){if(p.h&&p.h.tm==null)p.h.tm=ri(4,20);if(p.gel==null)p.gel=p.team?ri(60,90):40}
  for(const p of Object.values(S.players)){if(!p.d){const av=ATTR.reduce((s,k)=>s+p.a[k],0)/5;p.d={};for(const x of DK)p.d[x]=clamp((DOM[x]?p.a[DOM[x]]:av)/5+gauss()*(DOM[x]?.8:2),1,20);p.h={pro:ri(4,20),amb:ri(4,20)};p.ifoc=null;derive(p);p.pot=Math.max(p.pot,ovr(p));p.o0=ovr(p)}if(p.o0==null)p.o0=ovr(p)}
  if(!TGROUP[S.training.focus])S.training.focus='bal';
  const f=S.fin;if(!f.slots){const keep={balance:f.balance,fans:f.fans,hist:f.hist||[f.balance],last:null};S.fin=Object.assign(newFin(0,0),keep);genOffers()}
  if(!S.fin.budget){setBudgets();mail('Neue Budgets','Der Vorstand arbeitet ab jetzt mit Transfer- und Gehaltsbudget. Details unter Verein > Finanzen.')}
  if(!S.fin.weeks)S.fin.weeks=[];
  for(const p of Object.values(S.players)){if(!p.ch)genChamps(p);if(!p.rn)p.rn=genRealName(p.nat)}
  if(!S.meta){S.patch=0;newPatch()}
  if(!S.tacs){const U=S.teams[S.user];S.tacs=['A','B','C'].map(n=>defTac(U,n));S.tacs[0].fam=85;S.tacs[1].fam=40;S.tacs[2].fam=40;S.tacA=0;applyTac()}
  if(!S.know)initKnow();
  if(!aca())genT2();if(!S.t2)t2Init();
  {const f=S.fin;for(const[k]of SLOTS){if(!(k in f.slots))f.slots[k]=null;if(f.slots[k]&&f.slots[k].sat==null)f.slots[k].sat=60;if(!f.slots[k]&&!(f.offers&&f.offers[k]))genSlotOffers(k)}}
  initStaff();if(!S.training.plan)S.training.plan=(PLANS[S.training.focus]||PLANS.bal).slice();S.ment=S.ment||{};
  if(!S.fin.lshare){S.fin.lshare=1;const A=aca();if(A)for(const id of A.roster){const p=S.players[id];if(p.age<=19)p.salary=Math.min(p.salary,450)}setBudgets();mail('Finanzen überarbeitet','Neu: Liga-Ausschüttung und T2-Förderung jede Woche, günstigere Academy-Gehälter, Sponsor-Vorschuss und eine einmalige Vorstandshilfe im Notfall. Die Budgets wurden neu berechnet.')}initScouting();if(!S.tst)S.tst={}}
function relink(ev){if(!ev)return;if(ev.type==='intl'){ev.stage.cur=ev.cur;return}
  if(ev.stage==='semi')for(const r of REGS)ev.reg[r].po.semis=ev.cur.filter(m=>m.tag===r);
  if(ev.stage==='final')for(const r of REGS)ev.reg[r].po.final=ev.cur.find(m=>m.tag===r)}
function evBroken(ev){if(!ev)return false;const ok=id=>!!S.teams[id];
  if(ev.cur.some(m=>!ok(m.a)||!ok(m.b)))return true;
  if(ev.type==='split'){if(ev.stage!=='rr')for(const r of REGS){const po=ev.reg[r].po;if(!po||po.semis.some(m=>!ok(m.a)||!ok(m.b)))return true}return false}
  const st=ev.stage;if((st.alive&&st.alive.some(x=>!ok(x)))||(st.out&&st.out.some(x=>!ok(x))))return true;
  if(st.kind==='swiss'&&Object.keys(st.rec).some(x=>!ok(x)))return true;
  return false}
function restartEvent(){const ev=S.ev;if(!ev)return;
  if(ev.type==='intl'){S.ev=initIntl(CAL[S.ci])}
  else if(ev.stage==='rr'){relink(ev)}
  else{const list=[];for(const r of REGS){const g=ev.reg[r],st=g.table||tableOf(g.ids,g.res).map(x=>x.id);g.table=st;g.order=null;g.po={semis:[mk(st[0],st[3],5,r),mk(st[1],st[2],5,r)],final:null};list.push(...g.po.semis)}ev.stage='semi';setCur(ev,list)}
  mail('Turnier neu aufgesetzt',`${S.ev.name}: Die aktuelle Phase wurde wegen eines Fehlers im Spielstand neu gestartet. Bisherige Ergebnisse der Saison bleiben erhalten.`)}

/* ===== Neues Spiel ===== */
function newGame(teamId,mgr){
  S={v:2,nextId:1,usedNames:{},season:1,year:2027,step:0,phase:'season',teams:{},players:{},fa:[],user:teamId,manager:mgr||'Manager',
     ci:0,ev:null,rec:{},splits:{},fin:{},staff:{coach:1,analyst:1},training:{focus:'bal',intensity:'normal'},inbox:[],view:'home',
     board:60,history:[],trophies:[],lastRound:null,summary:null,trainLog:[],mailId:1};
  REGS.forEach((r,ri_)=>TEAMDATA[r].forEach(([id,name],i)=>{
    const rep=repFor(i,TEAMDATA[r].length)+REG[r].off,T={id,name,reg:r,rep,color:`hsl(${(i*53+ri_*29+12)%360} 52% 66%)`,style:pick(SK),focus:pick(['TOP','MID','ADC']),roster:[],starters:{}};
    S.teams[id]=T;const base=Math.round(61+(rep-56)*.55);
    for(const ro of ROLES)sign(genPlayer(ro,base+ri(-4,4),undefined,r),T,true);
    const subs=ri(2,3);for(let k=0;k<subs;k++)sign(genPlayer(pick(ROLES),base-8+ri(-4,4),ri(17,20),r),T,false);
  }));
  for(let i=0;i<45;i++){const p=genPlayer(ROLES[i%5],ri(46,70),undefined,pick(REGS));p.contract=0;S.players[p.id]=p;S.fa.push(p.id)}
  const U=S.teams[teamId];
  S.fin=newFin((U.rep-40)*20000,U.rep*2000);S.fin.lshare=1;genOffers();setBudgets();
  VIEWREG=U.reg;
  S.tacs=['A','B','C'].map(n=>defTac(U,n));S.tacs[1].style='SCL';S.tacs[2].style='AGG';S.tacA=0;applyTac();initKnow();for(const k in S.know)S.know[k]=tKeys(S.tacs[0]).some(x=>x[0]===k)?80:45;
  genT2();initScouting();initStaff();S.training.plan=PLANS.bal.slice();S.ment={};
  for(const p of Object.values(S.players)){p.o0=ovr(p);p.gel=p.team?ri(55,92):40}
  S.ev=initEvent(CAL[0]);
  mail('Willkommen im Büro',`Der Vorstand der ${U.name} erwartet im Sommer-Split Platz ${expected(teamId)} in der ${U.reg} oder besser. Budget: ${eurK(S.fin.balance)}. Wähle unter Verein deine Sponsoren, sonst unterschreibt der Vorstand nach der ersten Woche die Festbetrag-Angebote. Die Saison hat drei Splits (je eine Hin-Runde im Bo1 über 7 Wochen plus Top-4-Playoffs im Bo5) und vier internationale Turniere: First Stand, MSI, Demacia Cup und Worlds.`);
  save();
}
function mail(title,body,extra){S.inbox.unshift(Object.assign({id:S.mailId++,when:shortLabel(),title,body,type:'info'},extra||{}));if(S.inbox.length>40)S.inbox.length=40}
function shortLabel(){if(!S||!S.ev)return S?`${S.year} · Pause`:'';return `${S.year} · ${S.ev.name}`}
