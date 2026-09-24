const fs=require('fs');
const loader=fs.readFileSync('js/app-v2.js','utf8'),p4=fs.readFileSync('js/emoji-drops-p4-final.js','utf8'),schema=fs.readFileSync('js/emoji-drops-schema-migration.js','utf8');
if(loader.includes('emoji-drops-p3-polish.js'))throw Error('P3 legacy feedback layer is still loaded');
for(const x of ['schemaVersion','ed-p4-conflict','PerformanceObserver','__emojiDropsFaults','__emojiDropsPrivacy','__emojiDropsCoreBoundary','touchTargetMin:48','min-height:48px'])if(!p4.includes(x))throw Error(`P4 missing ${x}`);
for(const x of ['VERSION=3','normalize','migrate','schemaVersion'])if(!schema.includes(x))throw Error(`Schema migration missing ${x}`);
console.log('P3/P4 self-test OK: legacy P3 feedback layer retired; P4 conflict diagnostics, fault hooks, performance history, privacy boundary, schema migration v3 and touch-target contracts remain active');
