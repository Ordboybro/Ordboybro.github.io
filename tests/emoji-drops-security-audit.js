const fs=require('fs');
const files=fs.readdirSync('js').filter(f=>f.endsWith('.js')).map(f=>`js/${f}`);
const dangerous=[];
for(const f of files){const s=fs.readFileSync(f,'utf8');if(/\beval\s*\(/.test(s)||/\bnew\s+Function\s*\(/.test(s))dangerous.push(`${f}:dynamic-code`);const external=/https?:\/\/(?!localhost|127\.0\.0\.1)/i.test(s);const github=/https?:\/\/(?:www\.)?github/i.test(s);const approvedSupabase=f==='js/supabase-config.js'&&/https:\/\/[a-z0-9-]+\.supabase\.co(?:[/'"`]|$)/i.test(s);if(external&&!github&&!approvedSupabase)dangerous.push(`${f}:external-url`)}
if(dangerous.length)throw Error(`Security audit failed: ${dangerous.join(', ')}`);
const html=fs.readFileSync('index.html','utf8');if(/<script[^>]+src=['\"]http/i.test(html))throw Error('Remote script dependency detected');
console.log('Security/privacy audit OK: no dynamic code, no unexpected external runtime URLs, no remote script dependency');