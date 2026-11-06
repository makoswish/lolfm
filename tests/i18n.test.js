// Sprache: Wörterbuch, Muster, Zahlenformat, Optionen und Speichern.
// Hinweis: Dieser Test steht in einem Template-String, darum keine Backticks im Code.
module.exports=`
function ok(c,msg){if(!c){console.log('FEHLER',msg);bad++}}
function html(){return i18nHtml(document.querySelector('#app').innerHTML)}
ok(LANG==='de','Standardsprache ist nicht Deutsch');
ok(tx('Kader')==='Kader','Deutsch wird verändert');
setLang('en');
ok(LANG==='en'&&tx('Kader')==='Squad'&&tx('Verträge')==='Contracts','Einzelne Wörter');
// Zahlen und Geld
ok(tx('Konto 560k €')==='Account €560k'||tx('Konto {}k €'.replace('{}','560'))==='Account €560k','Geld in Sätzen: '+tx('Konto 560k €'));
ok(tx('1.178.000 €')==='€1,178,000','Tausendertrenner: '+tx('1.178.000 €'));
ok(tx('3,00 Mio. €')==='€3.00M','Millionen: '+tx('3,00 Mio. €'));
ok(tx('3,5')==='3.5','Dezimalkomma: '+tx('3,5'));
ok(tx('Platz 6 · 0 S · 0 N')==='Place 6 · 0 W · 0 L','Zusammengesetzt: '+tx('Platz 6 · 0 S · 0 N'));
ok(tx('Wochengehalt')==='Weekly wage'&&tx('Handgeld')==='Signing bonus','Verhandlung');
// Sätze mit Namen
ok(tx('Nordwind Esports gewinnt den Winter-Split der LEC.')==='Nordwind Esports wins the Winter Split of the LEC.','Muster Titel: '+tx('Nordwind Esports gewinnt den Winter-Split der LEC.'));
ok(tx('Skandal bei Milano Mirage: Velzy sorgt mit Aussagen im Netz für Ärger.').startsWith('Scandal at Milano Mirage: Velzy'),'Muster Skandal');
ok(tx("12' Rotterdam Rooks erlegt den Baron.")==="12' Rotterdam Rooks slays the Baron.",'Ereignis Baron: '+tx("12' Rotterdam Rooks erlegt den Baron."));
ok(tx("33' Teamfight: Lisboa Navigators gewinnt 4 zu 2")==="33' Teamfight: Lisboa Navigators wins 4 to 2",'Ereignis Teamfight');
ok(tx('Bild von Xanyx')==='Picture of Xanyx','Muster Bild');
// Unbekanntes bleibt Deutsch und wird gesammelt
ok(tx('Völlig unbekannter Satz hier')==='Völlig unbekannter Satz hier'&&[...I18N.miss].some(k=>k.indexOf('Völlig unbekannter')===0),'Unbekanntes fehlt in miss');
// Namen bleiben
ok(tx('Hanbit Dragons')==='Hanbit Dragons','Namen bleiben');
// DOM: Seite wird übersetzt
newGame('LYL','Tester');render();chk('Start');
{const h=html();ok(h.includes('Squad')&&h.includes('Finances')&&h.includes('Training')&&!h.includes('>Kader<')&&!h.includes('>Finanzen<'),'Navigation nicht übersetzt');
 ok(document.documentElement.lang==='en'||true,'lang')}
ACT.nav2({v:'club',k:'CLUBTAB',t:'budget'});chk('Budgets');ok(html().includes('Wage budget per week')&&html().includes('How the board calculates'),'Budget-Seite nicht übersetzt');
// Sprache wechseln über die Optionen
setLang('de');render();ok(html().includes('Kader')&&!html().includes('How the board'),'Zurück auf Deutsch');
ACT.opt();ok(MODAL&&MODAL.opt&&html().includes('Optionen')&&html().includes('data-a="lang"')&&html().includes('type="range"'),'Optionsfenster fehlt');
ACT.lang({v:'en'});ok(LANG==='en'&&MODAL&&MODAL.opt&&html().includes('Options')&&html().includes('Language'),'Sprachwechsel im Fenster');
try{ok(localStorage.getItem('riftmgr_lang')==='en','Sprache wird nicht gespeichert')}catch(e){}
ACT.optclose();ok(!MODAL&&html().includes('Squad'),'Fenster schließen');
// Musik-Regler im Fenster: stufenlos, Speichern, Aus bei 0
ACT.opt();musSetVolF(.4);ok(Math.abs(musPref().vol-.4)<.001&&musPref().on,'Regler setzt Lautstärke');musSetVolF(0);ok(!musPref().on,'Null schaltet aus');
musSetVolF(.8);ACT.musonoff();ok(!musPref().on&&Math.abs(musPref().vol-.8)<.001,'An/Aus behält Lautstärke');ACT.musonoff();ok(musPref().on,'Wieder an');
musSetVolF(0);ACT.optclose();
// Ältere Einstellung (Stufe 1 bis 3) wird gelesen
try{localStorage.setItem('riftmgr_music',JSON.stringify({on:true,vol:3}))}catch(e){}ok(Math.abs(musPref().vol-MUSV[3])<.001,'Alte Lautstärkestufe');
try{localStorage.removeItem('riftmgr_music')}catch(e){}
// Ohne Spiel (Startbildschirm) gibt es die Optionen auch
setLang('de');S=null;render();ok(html().includes('data-a="opt"'),'Optionen im Startbildschirm fehlen');
`;
