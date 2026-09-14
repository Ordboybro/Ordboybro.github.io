const fs=require('fs');
const path=require('path');
const ROOT=process.cwd();
const fail=[];const warn=[];
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const walk=(dir,ext)=>{const full=path.join(ROOT,dir);if(!fs.existsSync(full))return [];return fs.readdirSync(full,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name),ext):e.name.endsWith(ext)?[path.join(dir,e.name)]:[])};
const js=walk('js','.js').filter(f=>!f.includes('/tests/'));const css=walk('css','.css');
const html=read('index.html');const loader=read('js/app-v2.js');
const productionText=[html,loader,...js.map(read),...css.map(read)].join('\n');
const assetRef=new Set();
for(const m of html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)){const x=m[1].split('?')[0];if(/^\/?(?:js|css)\//.test(x))assetRef.add(x.replace(/^\//,''))}
for(const m of loader.matchAll(/(?:write|src)[(=]['"]([^'"]+)["']/g)){const x=m[1].split('?')[0];if(/^js\//.test(x))assetRef.add(x)}
for(const f of js)if(!assetRef.has(f)&&!/(?:\.min)?\.js$/.test(f))warn.push(`unreferenced-js:${f}`);
for(const f of css)if(!assetRef.has(f))warn.push(`unreferenced-css:${f}`);
const legacy=warn.filter(x=>/(final-(?:layout|polish|system)-v\d+|production-layout-v\d+|site-fixes-\d{8})/.test(x));
if(legacy.length)console.log(`Legacy candidates (verified unreferenced): ${legacy.join(', ')}`);
const blocks=new Map();
for(const f of css){const s=read(f).replace(/\/\*[\s\S]*?\*\//g,'');for(const m of s.matchAll(/([^{}]+)\{([^{}]+)\}/g)){const sel=m[1].replace(/\s+/g,' ').trim();const body=m[2].replace(/\s+/g,' ').trim();if(!sel||!body)continue;const key=`${sel}|${body}`;const a=blocks.get(key)||[];a.push(f);blocks.set(key,a)}}
for(const [key,files] of blocks)if(new Set(files).size>1)warn.push(`duplicate-css:${files.join('|')}:${key.slice(0,140)}`);
for(const f of js){const s=read(f);if(/\beval\s*\(/.test(s)||/\bnew\s+Function\s*\(/.test(s))fail.push(`${f}:dynamic-code`);if(/\.innerHTML\s*=/.test(s)&&!/textContent|createElement/.test(s))warn.push(`${f}:innerHTML-assignment-review`);if(/document\.write\s*\(/.test(s)&&f!=='js/app-v2.js')warn.push(`${f}:document-write`);}
if(/<script[^>]+src=["']https?:/i.test(html))fail.push('index.html:remote-script');
if(/javascript\s*:/i.test(productionText))fail.push('javascript-url');
if(/(?:password|passwd|token|secret|api[-_]?key|authorization)\s*[:=]/i.test(productionText))warn.push('secret-like-literal-review');
const numericMutation=js.filter(f=>/(balance|price|chance|multiplier|amount|cost|value)/i.test(read(f))).map(f=>[f,read(f)]);
for(const [f,s] of numericMutation){if(/localStorage\.setItem\([^,]+,[^)]*(balance|price|chance|amount|value)/i.test(s)&&!/Number\.isFinite/.test(s))warn.push(`${f}:numeric-persistence-review`)}
if(fail.length)throw Error(`Engineering audit failed: ${fail.join(', ')}`);
console.log(`Engineering audit OK: ${js.length} production JS, ${css.length} CSS; ${warn.length} review findings. No blocking dynamic-code/remote-script/javascript-url findings.`);
if(warn.length)console.log(warn.slice(0,80).join('\n'));
