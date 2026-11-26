const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const {safePush}=require('./safe-push.cjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'ptp-data-safety-'));
const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const identity=cwd=>{git(cwd,'config','user.email','test@example.invalid');git(cwd,'config','user.name','Data safety test');};
const commit=(cwd,message)=>{git(cwd,'add','.');git(cwd,'commit','-m',message);};
async function main(){
 const remote=path.join(root,'remote.git'),seed=path.join(root,'seed'),dev=path.join(root,'dev'),admin=path.join(root,'admin');
 fs.mkdirSync(seed);git(root,'init','--bare',remote);git(seed,'init','-b','main');identity(seed);
 const original={site:{donations:[]},books:[{id:'existing',status:'available',photos:['photos/one.jpg']}]};
 fs.writeFileSync(path.join(seed,'books.json'),JSON.stringify(original));fs.mkdirSync(path.join(seed,'photos'));fs.writeFileSync(path.join(seed,'photos/one.jpg'),'original image bytes');fs.writeFileSync(path.join(seed,'index.html'),'old design');commit(seed,'Initial data');git(seed,'remote','add','origin',remote);git(seed,'push','-u','origin','main');
 git(root,'clone','-b','main',remote,dev);git(root,'clone','-b','main',remote,admin);identity(dev);identity(admin);
 fs.writeFileSync(path.join(dev,'index.html'),'updated design');commit(dev,'Update design from older checkout');
 const updated=structuredClone(original);updated.books[0].status='sold';updated.books[0].soldFor=250;updated.books.push({id:'new-book',status:'reserved',note:'Keep my notes',photos:['photos/two.jpg']});updated.site.donations=[{date:'2026-01-10',amount:100,receipt:'https://example.com/receipt'}];
 fs.writeFileSync(path.join(admin,'books.json'),JSON.stringify(updated));fs.writeFileSync(path.join(admin,'photos/two.jpg'),'new photo bytes');commit(admin,'New admin data');git(admin,'push','origin','main');
 assert.throws(()=>git(dev,'push','origin','main')); // Normal Git rejects stale writes.
 const result=safePush(dev);
 assert.deepEqual(JSON.parse(git(remote,'show','main:books.json')),updated);
 assert.equal(git(remote,'show','main:photos/two.jpg'),'new photo bytes');
 assert.equal(git(remote,'show','main:index.html'),'updated design');
 assert(fs.existsSync(result.backup));
 const recovery=path.join(root,'recovery');fs.mkdirSync(recovery);git(recovery,'init');git(recovery,'fetch',result.backup,'refs/remotes/origin/main:refs/heads/recovered');
 assert.deepEqual(JSON.parse(git(recovery,'show','recovered:books.json')),updated);
 assert.equal(git(recovery,'show','recovered:photos/one.jpg'),'original image bytes');
 // A committed accidental reset is blocked before it can reach the remote.
 fs.writeFileSync(path.join(dev,'books.json'),JSON.stringify(original));commit(dev,'Accidental stale catalogue');
 const before=git(remote,'rev-parse','main');assert.throws(()=>safePush(dev),/local commits change/);assert.equal(git(remote,'rev-parse','main'),before);
 // Photo deletions are also guarded, independently of catalogue changes.
 const photoDev=path.join(root,'photo-dev');git(root,'clone','-b','main',remote,photoDev);identity(photoDev);fs.unlinkSync(path.join(photoDev,'photos/one.jpg'));commit(photoDev,'Accidental photo deletion');assert.throws(()=>safePush(photoDev),/local commits change/);assert.equal(git(remote,'rev-parse','main'),before);
 console.log('Passed: stale push rejection; code-only release preserves books, statuses, notes, donation records and photos; verified backup restores data; accidental catalogue reset and photo deletion blocked.');
 // Execute the actual admin publishing function with a controlled GitHub response.
 const html=fs.readFileSync(path.join(__dirname,'../admin.html'),'utf8');
 const publish=html.slice(html.indexOf('async function publish()'),html.indexOf('$("pubBtn").onclick = publish;'));
 const dirty=html.match(/function setDirty\(v = true\) \{[^\n]+/)[0];
 const requests=[];let resolve,reject;const nodes={fSite:{reportValidity:()=>true},pubBtn:{},publish:{classList:{toggle(){}}}};
 const ctx=vm.createContext({$:id=>nodes[id],readSite(){},toast(){},b64:s=>Buffer.from(s).toString('base64'),BRANCH:'main',gh:async(p,o)=>{requests.push(JSON.parse(o.body));return new Promise((a,b)=>{resolve=a;reject=b;});}});
 vm.runInContext('let data={site:{},books:[{id:"saved"}]},sha="old",dirty=true,editRevision=1,publishing=false;'+publish+dirty,ctx);
 const first=vm.runInContext('publish()',ctx);await vm.runInContext('publish()',ctx);assert.equal(requests.length,1);
 vm.runInContext('data.books.push({id:"new-during-save"});setDirty()',ctx);resolve({content:{sha:'new'}});await first;
 assert.equal(vm.runInContext('dirty',ctx),true);assert.equal(vm.runInContext('sha',ctx),'new');assert.equal(JSON.parse(Buffer.from(requests[0].content,'base64')).books.length,1);
 const second=vm.runInContext('publish()',ctx);assert.equal(requests[1].sha,'new');resolve({content:{sha:'newer'}});await second;assert.equal(vm.runInContext('dirty',ctx),false);
 vm.runInContext('data.books.push({id:"unsaved"});setDirty()',ctx);const stale=vm.runInContext('publish()',ctx);reject(new Error('409 conflict'));await stale;
 assert.equal(vm.runInContext('dirty',ctx),true);assert.equal(vm.runInContext('data.books.length',ctx),3);assert.equal(vm.runInContext('sha',ctx),'newer');assert.equal(vm.runInContext('publishing',ctx),false);assert.equal(nodes.pubBtn.disabled,false);
 console.log('Passed: duplicate publish prevented; in-flight edits stay dirty; next save uses new SHA; stale/failed saves preserve drafts and re-enable publishing.');
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>fs.rmSync(root,{recursive:true,force:true}));
