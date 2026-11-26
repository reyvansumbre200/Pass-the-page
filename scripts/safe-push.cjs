#!/usr/bin/env node
// Code-only releases: preserve the latest published catalogue byte-for-byte.
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
function safePush(cwd = process.cwd()) {
  const git = (...args) => execFileSync('git', args, {cwd, encoding:'utf8', stdio:['ignore','pipe','pipe']}).trim();
  if (git('branch','--show-current') !== 'main') throw new Error('Run this from main.');
  if (git('status','--porcelain')) throw new Error('Commit or save your working changes before releasing.');
  git('fetch','origin','main'); // Fail closed if GitHub is unreachable.
  const remote = git('rev-parse','origin/main');
  const base = git('merge-base','HEAD','origin/main');
  if (git('diff','--name-only',base,'HEAD','--','books.json','photos'))
    throw new Error('Release stopped: local commits change books.json or photos. Review data changes separately; this command only releases website code.');
  const backupDir = path.join(git('rev-parse','--absolute-git-dir'),'data-backups');
  fs.mkdirSync(backupDir,{recursive:true});
  const backup = path.join(backupDir,`${remote}.bundle`);
  if (!fs.existsSync(backup)) git('bundle','create',backup,'refs/remotes/origin/main');
  git('bundle','verify',backup);
  const before = git('ls-tree','-r','origin/main','--','books.json','photos');
  git('rebase','origin/main'); // Conflicts stop the release; never choose a side automatically.
  const after = git('ls-tree','-r','HEAD','--','books.json','photos');
  if (before !== after) throw new Error('Release stopped: saved data differs from GitHub. Nothing was pushed.');
  git('push','origin','HEAD:main'); // A concurrent admin update rejects this push safely. Rerun to synchronize.
  return {commit:git('rev-parse','HEAD'),backup};
}
module.exports = {safePush};
if (require.main === module) {
  try { const result=safePush(); console.log(`Pushed ${result.commit}\nVerified catalogue and photos unchanged. Backup: ${result.backup}`); }
  catch(e) { console.error(e.stderr?.toString().trim() || e.message); process.exitCode=1; }
}
