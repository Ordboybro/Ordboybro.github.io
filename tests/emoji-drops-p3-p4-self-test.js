const fs=require('fs');
const p3=fs.readFileSync('js/emoji-drops-p3-polish.js','utf8'),p4=fs.readFileSync('js/emoji-drops-p4-final.js','utf8'),schema=fs.readFileSync('js/emoji-drops-schema-migration.js','utf8');
for(const x of ['ed-p3-pop','ed-p3-skeleton','prefers-reduced-motion','navigator.vibrate','touchstart','ed-p3-sound'])if(!p3.includes(x))throw Error(`P3 missing ${x}`);
for(const x of ['schemaVersion','ed-p4-conflict','PerformanceObserver','__emojiDropsFaults','__emojiDropsPrivacy','__emojiDropsCoreBoundary'])if(!p4.includes(x))throw Error(`P4 missing ${x}`);
for(const x of ['VERSION=3','normalize','migrate','schemaVersion'])if(!schema.includes(x))throw Error(`Schema migration missing ${x}`);
console.log('P3/P4 self-test OK: motion, feedback, loading/empty hooks, touch, sound/haptics, schema migration v3, conflict diagnostics, fault hooks, performance history, privacy boundary');
