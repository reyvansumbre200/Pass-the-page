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
const node = id => { if(!nodes.has(id))nodes.set(id,{value:'',innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){}},querySelectorAll:()=>[],showModal(){this.open=true}});return nodes.get(id); };
const drawn = [], downloads = [];
const context = vm.createContext({
  data:JSON.parse(fs.readFileSync('books.json','utf8')),
  document:{querySelectorAll:()=>[],getElementById:node,fonts:{ready:Promise.resolve()},body:{append(){}},createElement:tag=>tag==='canvas'?{getContext:()=>({fillRect(){},fillText:t=>drawn.push(t),measureText:t=>({width:t.length*20})}),toBlob:cb=>cb({})}:{click(){downloads.push(this.download)},remove(){}}},
  location:{href:'https://example.com/Pass-the-page/',origin:'https://example.com'},
  history:{replaceState(){}},matchMedia:()=>({matches:false}),
  window:{innerWidth:1200},URL:class extends URL {static createObjectURL(){return 'blob:preview'}static revokeObjectURL(){}},setTimeout:()=>1,clearTimeout(){},Image:class{}
});
vm.runInContext(fs.readFileSync('enhancements.js','utf8'),context);
vm.runInContext(script.split('/* ---------- book dialog ---------- */')[0],context);
vm.runInContext('S=data.site; BOOKS=data.books; render(); renderHomeGrid(); renderDonations();',context);
assert(node('donationUpdates').innerHTML.includes('No donation transfers'));
assert(node('homeGrid').innerHTML.includes('first new home'));
vm.runInContext(`BOOKS=[{id:'sold',title:'A good book',author:'A writer',status:'sold',soldFor:500,edition:'original',condition:'good',photos:[]},{id:'blind',title:'Secret title',author:'Secret author',blind:true,hint:'A hidden clue',status:'available',edition:'original',condition:'fair',photos:[]}]; S.donations=[{date:'2026-01-10',amount:200,receipt:'https://example.com/receipt',note:'First donation'},{date:'bad',amount:9000},{date:'2026-02-30',amount:9000},{date:'2026-01-11',amount:-10}];renderHomeGrid();renderDonations();render();`,context);
assert(node('homeGrid').innerHTML.includes('₹500'));
assert(node('homeGrid').innerHTML.includes('data-id="sold"'));
assert(node('donationTotals').innerHTML.includes('₹200'));
assert(node('donationTotals').innerHTML.includes('₹300'));
assert(node('donationUpdates').innerHTML.includes('View donation receipt'));
assert(!node('grid').innerHTML.includes('Secret title'));
assert(!node('grid').innerHTML.includes('Secret author'));
assert.equal(vm.runInContext("receiptURL('javascript:alert(1)')",context),'');
vm.runInContext("filter='sold';render()",context);
assert(node('grid').innerHTML.includes('data-id="sold"'));
(async()=>{
 await vm.runInContext('downloadShareCard(BOOKS[1])',context);
 assert.equal(downloads[0],'pass-the-page-mystery-book.png');
 assert(!drawn.join(' ').includes('Secret title'));
 assert(!drawn.join(' ').includes('Secret author'));
 assert(drawn.join(' ').includes('A hidden clue'));
 assert.equal(node('saveCard').disabled,false);
 console.log('Passed: scripts parse, real catalogue renders, empty states, sold grid, donation totals, invalid records, receipt URL safety, mystery card privacy and PNG download flow.');
})().catch(e=>{console.error(e);process.exitCode=1});

// Exercise the real dialog and direct card click flow without hover state.
vm.runInContext(script.slice(script.indexOf('/* ---------- book dialog ---------- */'),script.indexOf('$("slides").addEventListener')),context);
context.bookClick = {target:{closest:()=>({dataset:{id:'blind'}})}};
vm.runInContext('handleBookClick(bookClick)',context);
assert.equal(node('dlg').open,true);
assert(node('info').innerHTML.includes('A hidden clue'));
assert(!node('info').innerHTML.includes('Secret title'));
assert(!node('slides').innerHTML.includes('Secret author'));
assert(node('info').innerHTML.includes('You pay Reyvan Sumbre directly'));
context.soldClick = {target:{closest:()=>({dataset:{id:'sold'}})}};
vm.runInContext('handleBookClick(soldClick)',context);
assert(node('info').innerHTML.includes('A hidden clue')); // Background blocked while open.
node('dlg').open=false;
vm.runInContext('handleBookClick(soldClick)',context);
assert(node('info').innerHTML.includes('This one found a home'));
assert(!node('info').innerHTML.includes('id="take"'));
node('dlg').open=false;
vm.runInContext('handleBookClick(bookClick);setAmt(1,true)',context);
assert.equal(node('take').disabled,true);
vm.runInContext('setAmt(100)',context);
assert.equal(node('take').disabled,false);
assert.equal(node('takeTxt').textContent,'Take it for ₹100');
vm.runInContext('filter="all"; BOOKS=data.books; shown=24; render()',context);
assert.equal(node('more').hidden,false);
assert.equal(node('more').textContent,'Show more books (16 left)');
assert.equal((node('grid').innerHTML.match(/class="book"/g)||[]).length,24);
vm.runInContext('shown=48;render()',context);
assert.equal(node('more').hidden,true);
assert(!node('more').textContent.includes('-'));
const searchable=JSON.parse(fs.readFileSync('books.json')).books.find(b=>!b.blind && b.status!=='sold');
node('q').value=searchable.title;vm.runInContext('shown=24;render()',context);
assert(node('grid').innerHTML.includes(`data-id="${searchable.id}"`));
node('q').value='no matching book';vm.runInContext('render()',context);
assert(node('grid').innerHTML.includes('No books match'));
node('q').value='';node('fCond').value='good';vm.runInContext('render()',context);
assert(!node('grid').innerHTML.includes(' Fair</div>'));
node('fCond').value='';node('fSort').value='az';vm.runInContext('render()',context);
const ordered=[...node('grid').innerHTML.matchAll(/data-id="([^"]+)"/g)].map(m=>m[1]);
const expected=JSON.parse(fs.readFileSync('books.json')).books.filter(b=>b.status!=='sold').sort((a,b)=>(a.blind?'Blind date with a book':a.title).localeCompare(b.blind?'Blind date with a book':b.title)).slice(0,24).map(b=>b.id);
assert.deepEqual(ordered,expected);
assert(html.includes('[hidden] { display: none !important; }'));
assert(!html.includes('createShelfHoverHandler'));
assert(!html.includes('book-spine'));
console.log('Passed: direct card opening, modal isolation, mystery detail privacy, sold-book state, price limits, pagination, search, condition filter and sorting.');

vm.runInContext('setAmt(50)',context);
assert(node('mealEquivalent').textContent.includes('2 nutritious meals'));
vm.runInContext('setAmt(100)',context);
assert(node('mealEquivalent').textContent.includes('4 nutritious meals'));
vm.runInContext('setAmt(500)',context);
assert(node('mealEquivalent').textContent.includes('20 nutritious meals'));
vm.runInContext('setAmt(60)',context);
assert(node('mealEquivalent').textContent.includes('2 nutritious meals'));
vm.runInContext('setAmt(0,true)',context);
assert(!node('mealEquivalent').textContent.includes('Could help fund'));
console.log('Passed: ₹25 meal equivalents for minimum, maximum, non-multiple and invalid amounts.');
