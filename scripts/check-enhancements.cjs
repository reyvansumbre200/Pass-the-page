const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
process.chdir(path.join(__dirname, '..'));
const html = fs.readFileSync('index.html','utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new Function(script);
new Function(fs.readFileSync('admin.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1]);
const nodes = new Map();
const node = id => { if(!nodes.has(id))nodes.set(id,{value:'',innerHTML:'',textContent:'',classList:{add(){},remove(){}},querySelectorAll:()=>[]});return nodes.get(id); };
const drawn = [], downloads = [];
const context = vm.createContext({
  data:JSON.parse(fs.readFileSync('books.json','utf8')),
  document:{getElementById:node,fonts:{ready:Promise.resolve()},body:{append(){}},createElement:tag=>tag==='canvas'?{getContext:()=>({fillRect(){},fillText:t=>drawn.push(t),measureText:t=>({width:t.length*20})}),toBlob:cb=>cb({})}:{click(){downloads.push(this.download)},remove(){}}},
  location:{href:'https://example.com/Pass-the-page/',origin:'https://example.com'},
  window:{innerWidth:1200},URL:class extends URL {static createObjectURL(){return 'blob:preview'}static revokeObjectURL(){}},setTimeout:()=>1,clearTimeout(){},Image:class{}
});
vm.runInContext(fs.readFileSync('enhancements.js','utf8'),context);
vm.runInContext(script.split('/* ---------- book dialog ---------- */')[0],context);
vm.runInContext('S=data.site; BOOKS=data.books; render(); renderHomeShelf(); renderDonations();',context);
assert(node('donationUpdates').innerHTML.includes('No donation transfers'));
assert(node('homeShelf').innerHTML.includes('first new home'));
vm.runInContext(`BOOKS=[{id:'sold',title:'A good book',author:'A writer',status:'sold',soldFor:500,edition:'original',condition:'good',photos:[]},{id:'blind',title:'Secret title',author:'Secret author',blind:true,hint:'A hidden clue',status:'available',edition:'original',condition:'fair',photos:[]}]; S.donations=[{date:'2026-01-10',amount:200,receipt:'https://example.com/receipt',note:'First donation'},{date:'bad',amount:9000},{date:'2026-02-30',amount:9000},{date:'2026-01-11',amount:-10}];renderHomeShelf();renderDonations();render();`,context);
assert(node('homeShelf').innerHTML.includes('Raised ₹500'));
assert(node('homeShelf').innerHTML.includes('id="home-sold"'));
assert(node('donationTotals').innerHTML.includes('₹200'));
assert(node('donationTotals').innerHTML.includes('₹300'));
assert(node('donationUpdates').innerHTML.includes('View donation receipt'));
assert(!node('grid').innerHTML.includes('Secret title'));
assert(!node('grid').innerHTML.includes('Secret author'));
assert.equal(vm.runInContext("receiptURL('javascript:alert(1)')",context),'');
vm.runInContext("filter='sold';render()",context);
assert(node('grid').innerHTML.includes('id="preview-sold"'));
(async()=>{
 await vm.runInContext('downloadShareCard(BOOKS[1])',context);
 assert.equal(downloads[0],'pass-the-page-mystery-book.png');
 assert(!drawn.join(' ').includes('Secret title'));
 assert(!drawn.join(' ').includes('Secret author'));
 assert(drawn.join(' ').includes('A hidden clue'));
 assert.equal(node('saveCard').disabled,false);
 console.log('Passed: scripts parse, real catalogue renders, empty states, sold shelf, unique preview IDs, donation totals, invalid records, receipt URL safety, mystery card privacy and PNG download flow.');
})().catch(e=>{console.error(e);process.exitCode=1});
// Layout changes beneath a stationary mouse must not switch the selected book.
let clock = 0;
const selected = [];
context.hoverNow = () => clock;
context.onReveal = book => selected.push(book);
const hover = vm.runInContext('createShelfHoverHandler(onReveal, hoverNow)',context);
const bookA = {classList:{contains:()=>false}}, bookB = {classList:{contains:()=>false}};
const move = (book,x,type='mouse') => hover({pointerType:type,clientX:x,clientY:100,target:{closest:()=>book}});
move(bookA,100);
assert.equal(selected.length,1);
clock=100; move(bookB,101); // Ignore neighbours moving into the cursor during expansion.
assert.equal(selected.length,1);
clock=700; move(bookB,101); // No real movement after the layout settles.
assert.equal(selected.length,1);
move(bookB,120); // Deliberate mouse travel still reveals the next book.
assert.equal(selected.length,2);
clock=1400;move(bookA,140,'touch');
assert.equal(selected.length,2);
console.log('Passed: stationary-pointer regression, transition settling, subsequent mouse travel, and touch isolation.');
let dialogOpen = true;
context.isDialogOpen = () => dialogOpen;
const modalHover = vm.runInContext('createShelfHoverHandler(onReveal, hoverNow, isDialogOpen)',context);
const beforeModal = selected.length;
modalHover({pointerType:'mouse',clientX:200,clientY:100,target:{closest:()=>bookA}});
assert.equal(selected.length,beforeModal);
dialogOpen=false;clock+=700;
modalHover({pointerType:'mouse',clientX:220,clientY:100,target:{closest:()=>bookA}});
assert.equal(selected.length,beforeModal+1);
vm.runInContext('filter="all"; shown=100; render()',context);
assert.equal(node('more').hidden,true);
assert.equal(node('more').textContent,'Show more books');
vm.runInContext('BOOKS=data.books; shown=24; render()',context);
assert.equal(node('more').hidden,false);
assert.equal(node('more').textContent,'Show more books (16 left)');
vm.runInContext('shown=48;render()',context);
assert.equal(node('more').hidden,true);
assert(!node('more').textContent.includes('-'));
assert(html.includes('[hidden] { display: none !important; }'));
node('dlg').open=true;
assert.doesNotThrow(()=>vm.runInContext('revealBook(null)',context));
node('dlg').open=false;
console.log('Passed: modal blocks background reveals, hover resumes after closing, and pagination never displays negative counts.');
