const KEY='digitalCredentialsPrototype_v5';
const D={
 profile:{firstName:'SAM',lastName:'SAMPLE',dob:'1980-01-01',photo:'assets/sample-profile.jpg'},
 licence:{number:'123 456 789',status:'Current',age:'Over 18',licenceClass:'(C) Car',type:'(L) Learner',expiry:'2025-03-03',refresh:'2022-02-15',address:'123 Example Street, Brisbane QLD 4000'},
 credentials:{driver:true,digital:true,photo:false,marine:false},
 media:{licenceImage:'assets/reference-driver-licence.webp',licenceBackground:'',splashImage:'',brandLogo:'',driverLogo:'',digitalLogo:'',settingsLogo:''},
 settings:{pin:'1234',appPassword:'888888',brandText:'Digital ID',digitalIdText:'Digital ID'}
};
let state=load(),route='splash',qi=null,splashTimer=null,qrExpires=0,appUnlocked=false;
function cp(o){return JSON.parse(JSON.stringify(o))}
function load(){try{return deep(cp(D),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{return cp(D)}}
function deep(a,b){for(const k in b)a[k]&&typeof a[k]=='object'&&!Array.isArray(a[k])&&b[k]&&typeof b[k]=='object'&&!Array.isArray(b[k])?deep(a[k],b[k]):a[k]=b[k];return a}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function date(v){if(!v)return'';return new Date(v+'T00:00:00').toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'numeric'})}
function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
const icon={
 car:'<svg class="icon-svg" viewBox="0 0 48 32" aria-hidden="true"><path fill="currentColor" d="M6 22.5v-4.1c0-1.2.5-2.3 1.4-3.1l3.8-3.4 2.1-5.1c.5-1.2 1.6-2 2.9-2h14.7c1.3 0 2.4.8 2.9 2l2.1 5.1 3.8 3.4c.9.8 1.4 1.9 1.4 3.1v4.1h-3.3v2.7c0 1-.8 1.8-1.8 1.8h-3.1c-1 0-1.8-.8-1.8-1.8v-2.7H16.8v2.7c0 1-.8 1.8-1.8 1.8h-3.1c-1 0-1.8-.8-1.8-1.8v-2.7H6Zm7.2-10.2h21.6l-1.5-3.7c-.2-.5-.7-.8-1.2-.8H16.9c-.5 0-1 .3-1.2.8l-1.5 3.7Zm-2.7 5.4c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8h2.4c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8h-2.4Zm27.8 0h-2.4c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8h2.4c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8Z"/></svg>',
 id:'<svg class="icon-svg id-icon" viewBox="0 0 48 36" aria-hidden="true"><rect x="3" y="5" width="42" height="26" rx="4" fill="currentColor"/><circle cx="13" cy="16" r="5" fill="#fff"/><path d="M8 25c1.4-4 8.6-4 10 0" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M23 13h15M23 18h11M23 23h8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',
 share:'<svg viewBox="0 0 24 24"><path d="M12 16V4M7.5 8.5 12 4l4.5 4.5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
 qr:'<svg viewBox="0 0 24 24"><path d="M4 4h6v2H6v4H4V4Zm10 0h6v6h-2V6h-4V4ZM4 14h2v4h4v2H4v-6Zm14 0h2v6h-6v-2h4v-4Z"/><path d="M8 8h3v3H8V8Zm5 0h3v3h-3V8Zm-5 5h3v3H8v-3Zm5 0h3v3h-3v-3Z"/></svg>',
 lock:'<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="10" y="20" width="28" height="21" rx="4" fill="none" stroke="currentColor" stroke-width="2.8"/><path d="M16 20v-6a8 8 0 0 1 16 0v6" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><circle cx="24" cy="30" r="2.5" fill="currentColor"/><path d="M24 32.5v4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
 delete:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12.5 8 8h11.5v9H8l-4.5-4.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M11 10.5 15 14.5M15 10.5 11 14.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};
function render(){
 document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.route===route));
 document.getElementById('bottom-nav').style.display=(route==='splash'||route==='password')?'none':'grid';
 updateNavIcons();
 const s=document.getElementById('screen');
 s.innerHTML=route==='home'?home():route==='licence'?licence():route==='digital'?digital():route==='scan'?qrPage('scan'):route==='settings'?settings():route==='dev'?dev():route==='share'?qrPage('share'):route==='password'?password():splash();
 bind();
}
function updateNavIcons(){const nav=document.querySelectorAll('.nav-item');if(!nav.length)return;const custom=[null,null,state.media.settingsLogo];nav.forEach((b,i)=>{const el=b.querySelector('.nav-icon');if(i===2&&custom[i])el.innerHTML=`<img class="nav-custom-icon" src="${esc(custom[i])}" alt="">`;});}
function brandMark(light=false){const logo=state.media.brandLogo?`<img class="brand-logo" src="${esc(state.media.brandLogo)}" alt="Custom app logo">`:'';const text=esc(state.settings.brandText||'Digital ID');return `<span class="brand-custom">${logo}<span class="brand-wordmark">${text}</span></span>`}
function home(){
 const refreshed=state.licence.refresh?date(state.licence.refresh):'Not available';
 return `<header class="home-head" id="secret"><div class="home-decor" aria-hidden="true"><span></span><span></span><span></span></div><div class="brandline">${brandMark()}</div><div class="home-profile"><img class="avatar" src="${esc(state.profile.photo)}" alt="Profile photo"><div class="profile-name">${esc(state.profile.firstName)}<strong>${esc(state.profile.lastName)}</strong></div></div></header><section class="home-content"><div class="section-title"><span>Credentials</span><small>${credentialCount()} available</small></div><div class="credential-list">${state.credentials.driver?card(credentialIcon('driverLogo',icon.car),'Driver Licence','licence','icon-gradient'):''}${state.credentials.digital?card(credentialIcon('digitalLogo',icon.id),state.settings.digitalIdText||'Digital ID','digital','icon-maroon'):''}${state.credentials.photo?card(credentialIcon('digitalLogo',icon.id),'Photo ID','digital','icon-maroon'):''}${state.credentials.marine?card(credentialIcon('digitalLogo',icon.id),'Marine Licence','digital','icon-orange'):''}</div><section class="home-status"><div class="home-status-mark">${icon.id}</div><div class="home-status-copy"><strong>Digital credentials</strong><span>View, manage and share your available credentials.</span></div><div class="home-status-meta"><span>Last refreshed</span><b>${refreshed}</b></div></section></section>`;
}
function credentialCount(){return [state.credentials.driver,state.credentials.digital,state.credentials.photo,state.credentials.marine].filter(Boolean).length}
function credentialIcon(key,fallback){const src=state.media[key];return src?`<img class="credential-custom-logo" src="${esc(src)}" alt="">`:fallback}
function card(i,t,a,c){return `<button class="credential-card" data-a="${a}"><span class="credential-icon ${c}">${i}</span><span class="label">${t}</span><span class="chevron">›</span></button>`}
function licence(){
 const bg=state.media.licenceBackground?` style="--licence-bg:url('${esc(state.media.licenceBackground)}')"`:'';
 return `<div class="topbar licence-top"><button class="back" data-a="back">‹&nbsp; Back</button><div class="brandline dark">${brandMark(true)}</div><h1>Driver licence</h1></div><section class="licence-head licence-panel"${bg}><div class="licence-watermark"></div><div class="licence-art-wrap"><img class="licence-art" src="${esc(state.media.licenceImage)}" alt="Credential artwork"></div><div class="detail-name">${esc(state.profile.firstName)}<strong>${esc(state.profile.lastName)}</strong><div class="field-label">Date of birth</div><div class="field-value strong">${date(state.profile.dob)}</div><div class="field-spacer"></div><div class="field-label">Licence no.</div><div class="field-value strong">${esc(state.licence.number)}</div></div></section><div class="refresh">Information was refreshed online:<strong>${date(state.licence.refresh)}</strong></div><div class="detail-list"><div class="detail-row"><div class="row-label">Status</div><div class="row-value"><span class="status-pill">${esc(state.licence.status)}</span></div></div><div class="detail-row"><div class="row-label">Age</div><div class="row-value"><span class="check">✓</span>${esc(state.licence.age)}</div></div><div class="detail-row"><div class="row-label">Class</div><div class="row-value">${esc(state.licence.licenceClass)}</div></div><div class="detail-row"><div class="row-label">Type</div><div class="row-value">${esc(state.licence.type)}</div></div><div class="detail-row"><div class="row-label">Expiry</div><div class="row-value">${date(state.licence.expiry)}</div></div><div class="detail-row address-row"><div class="row-label">Address</div><div class="row-value">${esc(state.licence.address)}</div></div></div><div class="bottom-action"><button class="primary-button" data-a="share">SHARE DRIVER LICENCE</button></div>`;
}
function digital(){
 return `<div class="digital-page"><div class="topbar digital-top"><button class="back" data-a="back">‹&nbsp; Back</button><div class="brandline dark">${brandMark(true)}</div><h1>${esc(state.settings.digitalIdText||'Digital ID')}</h1></div><section class="digital-profile"><img class="avatar large" src="${esc(state.profile.photo)}" alt="Profile photo"><div><div class="digital-name">${esc(state.profile.firstName)} ${esc(state.profile.lastName)}</div><div class="digital-sub">Digital identity profile</div></div></section><div class="digital-details"><div class="digital-section-title">Personal details</div><div class="detail-row"><div class="row-label">Date of birth</div><div class="row-value">${date(state.profile.dob)}</div></div><div class="detail-row"><div class="row-label">Address</div><div class="row-value">${esc(state.licence.address)}</div></div><div class="detail-row"><div class="row-label">Identity status</div><div class="row-value"><span class="status-pill">Active</span></div></div><div class="digital-section-title">Credentials</div><button class="credential-card compact" data-a="licence">${credentialIcon('driverLogo',icon.car)}<span><strong>Driver Licence</strong><small>View credential details</small></span><span class="chevron">›</span></button><button class="credential-card compact" data-a="share">${icon.share}<span><strong>Share credentials</strong><small>Generate a temporary QR</small></span><span class="chevron">›</span></button></div></div>`;
}
function qrPage(mode){
 return `<div class="qr-page"><button class="back" data-a="back">‹&nbsp; Back</button><div class="share-heading"><div class="share-icon">${icon.qr}</div><h1>${mode==='scan'?'Share Credentials':'Share Driver Licence'}</h1><p>Display a temporary prototype QR code. A new  code is generated every 15 seconds.</p></div><div class="qr-box"><div id="qrcode"></div></div><div class="timer"><span id="sec">15</span><small>seconds remaining</small></div>${mode==='share'?'<button class="primary-button" style="margin-top:18px" id="share">SHARE</button>':''}</div>`;
}
function settings(){
 return `<div class="topbar"><h1>Settings</h1><div class="subtitle">Manage your app preferences</div></div><div class="section-title">Preferences</div><div class="settings-list">${['Account','Privacy','Security','Notifications','Help','Digital Identity Information','Terms & Conditions','About'].map(x=>`<button class="settings-card" data-link="${x}"><span>${x}</span><span class="chevron">›</span></button>`).join('')}</div>`;
}
function row(l,k,v,t='text'){return `<div class="form-row"><label>${l}</label><input data-f="${k}" type="${t}" value="${esc(v)}"></div>`}
function tog(l,k,v){return `<div class="form-row toggle-row"><span>${l}</span><button class="toggle ${v?'on':''}" data-t="${k}"><span></span></button></div>`}
function fileRow(label,key){const val=key==='profilePhoto'?state.profile.photo:state.media[key];return `<div class="form-row"><label>${label}</label><input data-file="${key}" type="file" accept="image/*"><div class="file-preview">${val?`<img src="${esc(val)}" alt="Selected image">`:'No image selected'}</div></div>`}
function dev(){
 let p=state.profile,l=state.licence,c=state.credentials;
 return `<div class="topbar gradient"><button class="back" data-a="back">‹&nbsp; Back</button><h1>Developer Settings</h1><div class="subtitle" style="color:#fffC">Local prototype configuration</div></div><div class="form"><div class="form-section">Personal information</div><div class="form-group">${row('First Name','profile.firstName',p.firstName)}${row('Last Name','profile.lastName',p.lastName)}${row('Date of Birth','profile.dob',p.dob,'date')}${fileRow('Profile Photo','profilePhoto')}</div><div class="form-section">Driver licence</div><div class="form-group">${row('Licence Number','licence.number',l.number)}${row('Status','licence.status',l.status)}${row('Age Category','licence.age',l.age)}${row('Licence Class','licence.licenceClass',l.licenceClass)}${row('Licence Type','licence.type',l.type)}${row('Expiry','licence.expiry',l.expiry,'date')}${row('Refresh Date','licence.refresh',l.refresh,'date')}${row('Address','licence.address',l.address)}${fileRow('Licence / Digital ID Image','licenceImage')}${fileRow('Licence Background Image','licenceBackground')}</div><div class="form-section">App branding</div><div class="form-group">${row('Brand text','settings.brandText',state.settings.brandText)}${row('Digital ID text','settings.digitalIdText',state.settings.digitalIdText)}${fileRow('Brand logo','brandLogo')}${fileRow('Driver Licence logo','driverLogo')}${fileRow('Digital ID logo','digitalLogo')}${fileRow('Settings icon','settingsLogo')}</div><div class="form-section">Splash screen</div><div class="form-group">${fileRow('Splash Screen Image','splashImage')}<button class="settings-card" data-a="clearSplash">Clear splash image <span class="chevron">›</span></button></div><div class="form-section">Home credentials</div><div class="form-group">${tog('Driver Licence','credentials.driver',c.driver)}${tog(state.settings.digitalIdText||'Digital ID','credentials.digital',c.digital)}${tog('Photo ID','credentials.photo',c.photo)}${tog('Marine Licence','credentials.marine',c.marine)}</div><div class="form-section">App access</div><div class="form-group">${row('App Passcode','settings.appPassword',state.settings.appPassword)}<div class="form-row"><small>Prototype app passcode. The splash fades into this screen on launch.</small></div></div><div class="form-section">Developer</div><div class="form-group"><button class="settings-card" data-a="pin">Change Developer PIN <span class="chevron">›</span></button><button class="settings-card" data-a="reset">Reset Prototype Data <span class="chevron">›</span></button></div><button class="primary-button" data-a="save">SAVE CHANGES</button></div>`;
}
function splash(){return `<div class="splash-screen">${state.media.splashImage?`<img src="${esc(state.media.splashImage)}" alt="Splash screen">`:`<div class="splash-fallback"><div class="splash-mark">QLD ID</div><div class="splash-sub">Digital identity</div></div>`}</div>`}
function password(){return `<div class="password-screen"><div class="password-brand"><div class="password-brand-title">${brandMark()}</div></div><div class="password-gate"><h1>Enter password<br>to unlock</h1><div class="pin-dots">${[0,1,2,3,4,5].map(i=>`<span class="pin-dot" data-d="${i}"></span>`).join('')}</div><div class="pin-pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="pin-key" data-app-pin="${n}">${n}</button>`).join('')}<button class="pin-key pin-empty" aria-hidden="true"></button><button class="pin-key" data-app-pin="0">0</button><button class="pin-key pin-delete" data-app-pin="x" aria-label="Delete">${icon.delete}</button></div><button class="unlock-button" data-app-pin="ok" aria-label="Unlock">${icon.lock}</button></div></div>`}
function bind(){
 document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{stopQR();route=b.dataset.route;render()});
 document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>act(b.dataset.a));
 document.querySelectorAll('[data-app-pin]').forEach(b=>b.onclick=()=>appPin(b.dataset.appPin));
 document.querySelectorAll('[data-link]').forEach(b=>b.onclick=()=>window.open('https://www.qld.gov.au/digital-identity','_blank','noopener'));
 document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{let [a,k]=b.dataset.t.split('.');state[a][k]=!state[a][k];save();render()});
 document.querySelectorAll('[data-f]').forEach(i=>i.onchange=()=>{let parts=i.dataset.f.split('.');let obj=state;for(let n=0;n<parts.length-1;n++)obj=obj[parts[n]];obj[parts.at(-1)]=i.value;save()});
 document.querySelectorAll('[data-file]').forEach(i=>i.onchange=()=>readFile(i.dataset.file,i.files?.[0]));
 let z=document.getElementById('secret');if(z){let timer;z.onpointerdown=()=>timer=setTimeout(openDevPin,900);z.onpointerup=()=>clearTimeout(timer);z.onpointerleave=()=>clearTimeout(timer)}
 if(route==='share'||route==='scan')startQR();
}
function readFile(key,file){if(!file)return;const r=new FileReader();r.onload=()=>{if(key==='profilePhoto')state.profile.photo=r.result;else state.media[key]=r.result;save();render()};r.readAsDataURL(file)}
function act(a){
 if(a==='licence'){route='licence';render();return}
 if(a==='digital'){route='digital';render();return}
 if(a==='back'){route=route==='share'||route==='licence'||route==='digital'?'home':'home';render();return}
 if(a==='backToSplash'){route='splash';render();return}
 if(a==='share'){route='share';render();return}
 if(a==='save'){save();toast('Changes saved');render();return}
 if(a==='reset'){if(confirm('Reset all prototype data?')){state=cp(D);save();route='home';render();toast('Reset complete')}return}
 if(a==='pin'){changePin();return}
 if(a==='clearSplash'){state.media.splashImage='';save();render();return}
}
function appPin(v){
 let r=document.getElementById('modal-root');
 if(!window.__appPin)window.__appPin='';
 if(v==='x')window.__appPin=window.__appPin.slice(0,-1);
 else if(v==='ok'){if(window.__appPin===state.settings.appPassword){window.__appPin='';appUnlocked=true;route='home';render();return}else{toast('Incorrect passcode');window.__appPin='';}}
 else if(window.__appPin.length<6)window.__appPin+=v;
 document.querySelectorAll('[data-d]').forEach((d,i)=>d.classList.toggle('filled',i<window.__appPin.length));
}
function openDevPin(){
 let pin='',r=document.getElementById('modal-root');
 r.innerHTML=`<div class="modal-backdrop"><div class="modal"><h2>Developer Access</h2><p>Enter the local prototype PIN.</p><div class="pin-dots">${[0,1,2,3].map(i=>`<span class="pin-dot" data-d="${i}"></span>`).join('')}</div><div class="pin-pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="pin-key" data-p="${n}">${n}</button>`).join('')}<button class="pin-key" data-p="x">⌫</button><button class="pin-key" data-p="0">0</button><button class="pin-key" data-p="ok">OK</button></div></div></div>`;
 r.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{let v=b.dataset.p;if(v==='x')pin=pin.slice(0,-1);else if(v==='ok'){if(pin===state.settings.pin){r.innerHTML='';route='dev';render()}else{toast('Incorrect PIN');pin=''}}else if(pin.length<6)pin+=v;r.querySelectorAll('[data-d]').forEach((d,i)=>d.classList.toggle('filled',i<pin.length))});
}
function changePin(){
 let r=document.getElementById('modal-root');
 r.innerHTML=`<div class="modal-backdrop"><div class="modal"><h2>Change Developer PIN</h2><p>Set a new 4–6 digit local prototype PIN.</p><input id="np" inputmode="numeric" maxlength="6" style="width:100%;padding:14px;border:1px solid #ddd;border-radius:12px;font-size:20px"><button class="primary-button" id="sp" style="margin-top:12px">SAVE PIN</button></div></div>`;
 r.querySelector('#sp').onclick=()=>{let p=r.querySelector('#np').value;if(/^\d{4,6}$/.test(p)){state.settings.pin=p;save();r.innerHTML='';toast('Developer PIN changed')}else toast('Enter 4 to 6 digits')};
}
function startQR(){
 stopQR();makeQR();qrExpires=Date.now()+15000;
 qi=setInterval(()=>{const n=Math.max(0,Math.ceil((qrExpires-Date.now())/1000));const el=document.getElementById('sec');if(el)el.textContent=n;if(n<=0){makeQR();qrExpires=Date.now()+15000}},250);
 const share=document.getElementById('share');if(share)share.onclick=()=>navigator.share?navigator.share({title:'Digital ID Prototype',text:'Synthetic prototype share session'}):toast('Native sharing is unavailable');
}
function makeQR(){
 const e=document.getElementById('qrcode');if(!e)return;e.innerHTML='';
 const p=JSON.stringify({prototype:true,session_id:crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2),created_at:new Date().toISOString(),expires_at:new Date(Date.now()+15000).toISOString()});
 if(window.QRCode)new QRCode(e,{text:p,width:250,height:250,colorDark:'#6b1d2b',colorLight:'#ffffff'});
}
function stopQR(){if(qi){clearInterval(qi);qi=null}}
function toast(m){let d=document.createElement('div');d.className='toast';d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),2200)}
function boot(){route='splash';render();splashTimer=setTimeout(()=>{route='password';render()},state.media.splashImage?2200:1300)}
window.addEventListener('beforeunload',()=>{stopQR();if(splashTimer)clearTimeout(splashTimer)});
boot();
