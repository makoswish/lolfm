// Lädt das Spiel ohne Browser in Node: die JS-Dateien in der Reihenfolge aus index.html,
// mit einem minimalen DOM- und localStorage-Ersatz. Tests laufen im selben Kontext.
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..');
function scriptOrder(){const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');return [...h.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1].split('?')[0])}
const STUB=`const store={};globalThis.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]};
const appEl={innerHTML:''};globalThis.window={scrollTo(){}};
globalThis.document={querySelector:s=>s==='#app'?appEl:(s==='#mgr'?{value:'Tester'}:null),addEventListener(){},documentElement:{style:{setProperty(){},removeProperty(){}}}};
globalThis.setInterval=()=>1;globalThis.clearInterval=()=>{};
let bad=0;
function chk(tag){if(ERR||appEl.innerHTML.includes('Fehler (')){console.log('FEHLER',tag,ERR);ERR=null;bad++}}
function playWeek(){const p=userPending();if(p){ACT.next();ACT.quick()}else ACT.next()}
function playSeason(){let g=0;while(S.phase!=='offseason'&&g++<200){playWeek();chk('Woche '+S.step)}}
function reload(){store[SAVEKEY]=JSON.stringify(S);S=null;load()}
`;
// Führt einen Test-Body im Spielkontext aus. Gibt die Anzahl Probleme zurück.
function run(body,name){
  const code=STUB+scriptOrder().map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+'\n;(function(){\n'+body+'\n})();\nglobalThis.__bad=bad;';
  const ctx={console,require,process,setTimeout,clearTimeout,__dirname:path.join(ROOT,'tests')};ctx.globalThis=ctx;
  vm.createContext(ctx);
  const t0=Date.now();
  try{vm.runInContext(code,ctx,{filename:name||'test'})}catch(e){console.log('ABSTURZ',name,e.stack.split('\n').slice(0,6).join('\n'));return 1}
  console.log(`${name}: ${ctx.__bad?ctx.__bad+' Probleme':'ok'} (${((Date.now()-t0)/1000).toFixed(1)} s)`);return ctx.__bad||0}
module.exports={run,ROOT};
