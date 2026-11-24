const $ = s => document.querySelector(s);
const bundledAssets = globalThis.LENSUP_ASSETS || {};
const asset = name => bundledAssets[name] || new URL('assets/' + name, document.baseURI).href;
const photo = asset('landscape.jpg');
const icons = {home:'⌂',practice:'◎',modules:'▤',community:'◌',progress:'▥',save:'◇',camera:'⊙',check:'✓'};
const onboardingRoutes=['signup','tour-practice','tour-learn','tour-feedback'];
const routes = [
 ['signup','Account setup','onboarding'],['tour-practice','Tour · Practice','onboarding'],['tour-learn','Tour · Learn','onboarding'],['tour-feedback','Tour · Feedback','onboarding'],
 ['welcome','Welcome','onboarding'],['home','Home','main'],['source','Starting photo','main'],['goal','Set a goal','main'],['ideas','AI suggestions','main'],['capture','Try the adjustment','main'],['compare','Compare & reflect','main'],['alternatives','Try a different experiment','main'],['newideas','New AI suggestions','main'],['tree','Practice tree','main'],['saved','Saved practice','main'],
 ['assessment','Upload collection','modules'],['modules','Skill modules','modules'],['module-detail','Module challenges','modules'],['lesson','Lighting challenge','modules'],['results','Challenge results','modules'],
 ['community','Community critique','community'],['peer-discussion','Community discussion','community'],['post','Ask for advice','community'],['critique','Photo feedback','community'],['carousel','Critique carousel','community'],['experiments','My experiments','main'],['progress','My progress','progress'],['history','Compare my practice','progress'],['achievements','Achievements','progress']
];
const evidence = {
 signup:['A simple introduction','A1 DR2–DR4; A2 §1.4.','Minimal local account setup introduces the learner without requiring an assessment or changing the existing practice flow.'],
 'tour-practice':['Explain purposeful practice','A1 DR3–DR4; A2 syntheses 1–2.','A photo-led preview explains taking a new attempt and comparing results, rather than editing the original.'],
 'tour-learn':['Introduce optional learning support','A1 DR3–DR4; A2 §1.4.2 and synthesis 5.','A short visual preview shows a lesson leading to a practical photo challenge.'],
 'tour-feedback':['Show the human feedback option','A1 DR1; A2 synthesis 3 and §1.4.2.','Named human feedback stays attached to its photograph. Community sharing is optional.'],
 welcome:['Make the process legible','S3A audio feedback: help learners understand how the intended process teaches photography.','A short capture → adjust → compare explanation establishes expectations before practice begins.'],
 home:['Preserve the A2 foundation','A2 §1.4 and §3.1; S3A slide 4.','Home centers the main experiment loop. The bottom navigation provides Learn, Community and Progress without duplicating them as large Home cards.'],
 goal:['Creative intention stays central','A2 §1.4, §2.3; DR3 / DR4.','After choosing a photograph, learners describe the intended effect with that image in view. This grounds creative choice in their own work.'],
 source:['Make both photo sources visible','A2 synthesis 1, p.25; S3A slide 4.','The first practice step exposes Take New Photo and Upload from Gallery equally, following A2 synthesis 1. Intention comes next; the sample keeps testing consistent.'],
 ideas:['Turn terminology into a usable action','A2 synthesis 5, p.29; S3A slide 8.','Two contextual options per photo, plain-language definitions, camera guidance and a relevant lesson.'],
 capture:['Simulate capture consistently','S3A recorded feedback: use predetermined photos to control the comparison.','Capture uses staged sample states. This tests comprehension of the workflow rather than participants’ camera skill.'],
 compare:['Support interpretation, not automatic judgement','A2 syntheses 2 and 6, pp.26,30; DR4 / DR5.','Named comparison endpoints, a conditions check and separate learner reflection prevent a better-looking image from becoming proof of skill.'],
 tree:['Distinguish alternatives from refinements','A2 synthesis 2, p.26; S3A audio feedback on organizing the tree.','A collapsible outline preserves the parent of every attempt. Two ideas per photo and three adjustment levels keep the trail manageable.'],
 saved:['Carry practice into a later opportunity','A2 synthesis 6, p.30; S3A slide 9.','Save advice and its starting point. Resume with the same scene or use another subject with context retained.'],
 assessment:['Offer a focus without claiming accurate diagnosis','A2 §3.1–3.2; DR3.','First-time Learn starts with a photo collection. Later visits resume the plan; the first re-upload extends it while retaining progress. Assessment remains staged.'],
 modules:['Keep modules as optional support','A2 §1.4.2 and §3.2.','Lighting, composition and framing remain. A recommendation explains its connection to the learner’s goal.'],
 lesson:['Bridge learning and doing','A2 synthesis 5, p.29; DR4.','A short lesson, one focused challenge and visible success criteria lead into capture.'],
 results:['Separate retry, continue and leave','A2 synthesis 4, p.28; S3A slide 7.','Results explain strengths and a next adjustment. Continue, retry and save/leave have distinct hierarchy.'],
 community:['Separate human feedback from AI','A2 synthesis 3, p.27; S3A slide 6.','Human names, source labels and photo-specific replies keep community critique identifiable.'],
 post:['Give sharing a clear target and audience','A2 §1.4.1 and §2.5.','The selected attempt, focused question and audience are shown before posting. Posts remain local to this prototype.'],
 critique:['Attach every critique to an attempt','A2 synthesis 3, p.27; DR1 / DR4.','The target thumbnail, reviewer, numbered annotation and practical action stay together.'],
 carousel:['Close the human critique loop','A2 §2.5 and §3.2.','A follow-up remains linked to its parent and the advice applied. Changing attempts changes the displayed feedback.'],
 progress:['Show evidence behind activity','A2 §2.4; DR2 / DR5.','Totals are activity, not skill scores. Skill-specific history provides photographs, context and a next practice action.'],
 history:['Reflect on transfer across conditions','A2 §2.4.1–2; DR5.','Earlier and later attempts retain their shooting contexts. Learners record what changed and what still needs practice.'],
 achievements:['Celebrate participation without claiming mastery','A2 flow-map extension; A2 §3.1 notes progress was untested.','Achievements reward practice actions. They are secondary to evidence in the skill history.']
};
let store;
try {store=JSON.parse(localStorage.getItem('lensup-v1')||'{}')} catch {store={}}
const initialState = () => ({version:globalThis.LENSUP_DEFAULT_VERSION||'improved',view:'prototype',route:'welcome',accountName:'',accountEmail:'',accountComplete:false,onboardingComplete:false,goal:'Better lighting',intent:'',idea:0,parent:'A',attempts:[],saved:false,conditions:'Similar conditions',reflection:'',source:null,modal:null,selectedNode:null,postPhoto:1,moduleSkill:'Lighting',challenge:1,communityAttempt:0,module:false,posted:false,question:'How can I keep the sky detail without losing the bright atmosphere?',audience:'Photography learners'});
const state={...initialState(),...store};
state.modal=null;state.authBusy=false;delete state.accountPassword;
state.ownPosts=state.ownPosts||[];
state.expandedNodes = Array.isArray(state.expandedNodes) ? state.expandedNodes : ['A'];
state.learnReady = !!state.learnReady;
state.moduleProgress = state.moduleProgress || {Lighting:[],Composition:[],Framing:[]};
state.critiquePhotos = state.critiquePhotos || (state.communityFollow ? [state.communityFollow] : []);
const ideas=[['Lower the exposure','Reveal more detail in the sky.','The land may become darker.'],['Change the angle','Try less sky and more foreground.','You may lose some of the open-sky feeling.'],['Add a foreground','Include a nearby detail to create depth.','A busy foreground can compete with your subject.']];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const profileName=()=>state.accountName?.trim()||'Maya';
const profileInitials=()=>profileName().split(/\s+/).slice(0,2).map(part=>Array.from(part)[0]).join('').toUpperCase();
const improved=()=>state.version==='improved';
const btn=(label,action,style='primary',extra='')=>`<button class="button ${style}" data-action="${action}" ${extra}>${label}</button>`;
const go=(label,route,style='primary')=>btn(label,`go:${route}`,style);
const tag=(text,style='')=>`<span class="tag ${style}">${text}</span>`;
const image=(variant='',label='',cls='',src=photo)=>{const fixture=photoFixture(variant,src);return `<figure class="photo ${variant} ${cls} ${fixture.scene?'study-scene':''}" data-component="Photo"><img src="${esc(fixture.src)}" alt="${src.startsWith('blob:')?'Your uploaded photograph':'Alpine lake, mountain and lakeside cabin'}, ${label||'practice sample'}">${label?`<figcaption>${label}</figcaption>`:''}</figure>`;};
const heading=(eyebrow,title,description='')=>`<header class="screen-heading"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${description?`<p>${description}</p>`:''}</header>`;
const field=(label,name,value,placeholder='',type='text')=>{const error=state.validationErrors?.[name],attrs=error?` aria-invalid="true" aria-describedby="error-${esc(name)}"`:'';return `<label class="field"><span>${label}</span>${type==='textarea'?`<textarea name="${name}" rows="2" ${name==='question'?'maxlength="30"':''} placeholder="${placeholder}"${attrs}>${esc(value)}</textarea>`:`<input type="${type}" name="${name}" value="${esc(value)}" placeholder="${placeholder}"${attrs}>`}${error?`<small class="field-error" id="error-${esc(name)}" role="alert">${esc(error)}</small>`:''}</label>`;};
function fieldError(name,message){state.validationErrors={...state.validationErrors,[name]:message};save();render();const target=[...document.querySelectorAll('[name]')].find(el=>el.name===name)||document.querySelector('.field-error');target?.scrollIntoView?.({block:'center',behavior:'smooth'});target?.focus?.();}
document.addEventListener('input',e=>{const name=e.target.name;if(state.validationErrors?.[name]&&e.target.value.trim()){delete state.validationErrors[name];e.target.removeAttribute('aria-invalid');e.target.removeAttribute('aria-describedby');e.target.closest('.field')?.querySelector('.field-error')?.remove();save();}});

const card=(content,cls='')=>`<section class="card ${cls}">${content}</section>`;
const sourceBadge=(human=false)=>tag(human?'Community · Human feedback':'AI · App suggestion',human?'human':'ai');
function captureVariant(){if(state.communityCapture){const parent=communityPhoto(state.communityCapture.parent);return variantFor({adjustments:[...(parent?.adjustments||[]),state.idea]});}if(state.module)return moduleVariant(state.moduleSkill,state.challenge);return variantFor({adjustments:[...(state.attempts.find(a=>a.id===state.parent)?.adjustments||[]),state.idea]})}
function variantFor(attempt){if(attempt?.zoom)return [...new Set(attempt.adjustments||[attempt.idea])].map(i=>['exposure','angle','foreground'][i]).join(' ')+' zoom-capture';if(attempt?.variant)return attempt.variant;return [...new Set(attempt.adjustments||[attempt.idea])].map(i=>['exposure','angle','foreground'][i]).join(' ')}
function save(){delete state.accountPassword;syncPractice();localStorage.setItem('lensup-v1',JSON.stringify({...state,modal:null,source:null}));}
function syncRouteUrl(){
 if(!window.history?.replaceState)return;
 const url=new URL(document.baseURI);url.searchParams.set('version',state.version);url.searchParams.set('screen',state.route);
 window.history.replaceState(null,'',url.pathname+url.search+url.hash);
}
function navigate(route){if(route!==state.route)state.validationErrors={};if(state.communityCapture&&route!=='capture')restoreCommunityCapture();if(state.route==='modules'&&route!=='modules'){state.moduleNotice='';state.moduleUpdateUnread=false;}if(improved()&&route==='goal'&&!state.activePracticeId){if(state.source)initializePracticeHistory();else{newPractice();return;}}if(improved()&&route==='modules'&&!state.learnReady)route='assessment';if(improved()&&route==='carousel')route='critique';state.route=route;if(route==='compare'){const a=state.attempts.find(a=>a.id===state.selectedNode)||state.attempts.at(-1);if(a){state.conditions=a.conditions||'Similar conditions';state.reflection=a.reflection||''}}state.modal=null;syncRouteUrl();save();render();window.scrollTo(0,0)}
function navIcon(name){
 const paths={
  home:'<path d="m3 10 9-7 9 7M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M9 21v-8h6v8"/>',
  modules:'<path d="M12 5v16M12 5C9 3 5.5 3 3 4v15c3-1 6-.5 9 2 3-2.5 6-3 9-2V4c-2.5-1-6-1-9 1Z"/>',
  community:'<path d="M15 4H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h1v4l4-4h5a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z"/><path d="M17 8h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-1v3l-4-3h-3M7 8h6M7 11h4"/>',
  progress:'<path d="M3 3v17a1 1 0 0 0 1 1h17M8 16v-5M13 16V7M18 16V3"/>'
 };
 return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}
function nav(active='home'){return `<nav class="bottom-nav" aria-label="App navigation">${[['home','Home'],['modules','Learn'],['community','Community'],['progress','Progress']].map(([r,l])=>`<button data-action="go:${r}" class="${r===active?'active':''}" ${r===active?'aria-current="page"':''}><span class="nav-icon" aria-hidden="true">${improved()?navIcon(r):icons[r]}</span>${l}</button>`).join('')}</nav>`}
function legacyTop(route){
 if(improved()&&route==='signup')return '';
 if(improved()&&onboardingRoutes.includes(route)){const index=onboardingRoutes.indexOf(route);return `<div class="app-top onboarding-top">${index?btn('‹ Back','go:'+onboardingRoutes[index-1],'text-button'):`<img class="app-logo" src="${asset('lensup-logo.png')}" alt="LensUp">`}${index?btn('Skip tour','onboarding-finish','text-button'):''}</div>`;}

 const back={goal:[improved()?'Photo':'Home',improved()?'source':'home'],source:[improved()?'Home':'Goal',improved()?'home':'goal'],ideas:['Goal','goal'],capture:['Suggestions','ideas'],compare:['Suggestions','ideas'],tree:['Comparison','compare'],assessment:['Home','home'],modules:['Home','home'],experiments:[state.experimentsFrom==='progress'?'Progress':'Home',state.experimentsFrom==='progress'?'progress':'home'],'module-detail':['Modules','modules'],lesson:['Modules','modules'],results:['Lesson','lesson'],'peer-discussion':['Community','community'],post:['Community','community'],critique:['Community','community'],carousel:['Feedback','critique'],history:['Progress','progress'],achievements:['Progress','progress']};
 if(improved()&&route==='tree')back.tree=['My Experiments','experiments'];
 if(improved()&&route==='compare')back.compare=['Back to practice tree','tree'];
 if(route==='ideas'&&state.suggestionsFrom==='tree')back.ideas=['Back to practice tree','tree'];
 if(route==='capture'&&state.module)back.capture=['Lesson','lesson'];else if(route==='capture'&&state.communityCapture)back.capture=['Feedback','critique'];else if(route==='capture'&&state.retry)back.capture=['Back to comparison','compare'];
 if(route==='post'&&improved())back.post=['Back to '+postingReturnLabel(),postingReturnRoute()];
 const backAction=route==='post'&&improved()?'cancel-post':back[route]?'go:'+back[route][1]:null;
 const rightAction=route==='post'?'cancel-post':state.communityCapture?'go:critique':['critique','peer-discussion'].includes(route)?'go:community':'exit';
 const rightLabel=route==='post'||state.communityCapture?'Cancel':['critique','peer-discussion'].includes(route)?'Done':'Save & exit';
 return `<div class="app-top">${back[route]?`<button class="text-button" data-action="${backAction}">‹ ${improved()?back[route][0]:'Back'}</button>`:`${headerLogo()}`}${improved()&&back[route]?`<button class="text-button" data-action="${rightAction}">${rightLabel}</button>`:`<span class="avatar">${esc(profileInitials())}</span>`}</div>`;
}

function screen(route,board=false){return `<article class="phone ${improved()?'improved':'baseline'}" data-screen="${state.version}/${route}" aria-label="${routes.find(x=>x[0]===route)?.[1]}"><div class="status-bar"><span>9:41</span><span aria-label="Full signal and battery">▮▮▮ &nbsp; ◒ &nbsp; ▰</span></div>${top(route)}<div class="screen-content" data-scroll="vertical"><div class="screen-body">${moduleReturnLink(route)}${content(route)}</div></div>${['home','assessment','modules','community','progress'].includes(route)?nav(route==='assessment'?'modules':route):'<div class="home-indicator"></div>'}${phoneOverlays(route)}</article>`}
function onboardingContent(route){
 if(route==='signup')return accountScreen();
 const index=onboardingRoutes.indexOf(route)-1;
 const pages=[
  ['PRACTISE WITH INTENTION','One idea.<br>One new photo.','Start with a photo and what you want to explore. Try an adjustment, take another photo, and compare.'],
  ['LEARN AS YOU GO','A little guidance.<br>Then try it.','Short skill modules explain the technique and give you a focused photo challenge.'],
  ['ANOTHER PERSPECTIVE','Feedback on<br>the photo you choose.','Ask other photographers a focused question. Their comments stay with that photo, so you know what to try next.']
 ];
 return `${tutorialPreview(index)}${heading(...pages[index])}<div class="push onboarding-actions"><div class="tour-pagination" aria-label="Tutorial progress">${pages.map((_,i)=>`<span class="${i===index?'active':''}" ${i===index?'aria-current="step"':''}></span>`).join('')}<small>${index+1} of 3</small></div>${index<2?go('Next',onboardingRoutes[index+2]):btn('Next','onboarding-finish')}</div>`;
}
function tutorialPreview(index){
 if(index===0)return `<section class="tutorial-preview practice-preview" aria-label="Preview of comparing two photo attempts"><div class="tutorial-photo-pair">${image('original','Attempt 1')}${image('angle','Attempt 1.1')}</div><div class="tutorial-example"><span class="tutorial-icon tutorial-ai" aria-label="AI app suggestion">AI</span><div><strong>Try a different viewpoint</strong><p>Take another photo. See what changes.</p></div></div><div class="tutorial-compare-label"><span>Your intention</span><span>Compare & reflect</span></div></section>`;
 if(index===1)return `<section class="tutorial-preview learning-preview" aria-label="Preview of a Lighting module"><div class="tutorial-module">${image('original','','tutorial-module-photo')}<div><p class="eyebrow">SKILL MODULE</p><h2>Lighting</h2><p>One skill. Small steps.</p></div></div><div class="tutorial-lesson"><span>01</span><div><strong>Find your light</strong><p>Notice where the light comes from.</p></div><b>›</b></div><div class="tutorial-lesson"><span>02</span><div><strong>Try a photo challenge</strong><p>Put one technique into practice.</p></div><b>›</b></div><p class="tutorial-caption">Learn · Try · Reflect</p></section>`;
 return `<section class="tutorial-preview feedback-preview" aria-label="Preview of photo-specific community feedback"><div class="tutorial-feedback-photo">${image('original','Attempt 1')}<span class="tutorial-annotation">1</span></div><div class="tutorial-comment"><div class="row"><span class="avatar amber">AC</span><div><strong>Alex Chen</strong><small class="muted">Community · On Attempt 1</small></div></div><p>Try a small change of viewpoint to give the cabin more room.</p></div></section>`;
}

function content(r){const up=improved();if(up&&onboardingRoutes.includes(r))return onboardingContent(r);const current=state.selectedNode==='A'?null:state.attempts.find(a=>a.id===state.selectedNode)||state.attempts.at(-1);const reference=state.attempts.find(a=>a.id===current?.parent);const parentLabel=branchAttemptLabel(current?.parent||'A');const letter=current?.id||'B';const selection=ideas[state.idea];switch(r){
case 'welcome':return `<div class="welcome-art">${image('original','','welcome-photo')}<img class="floating-mark" src="${asset('lensup-mark.png')}" alt=""></div>${up?heading('WELCOME TO LENSUP','See more in<br>every shot.','Take a photo, try one adjustment, and compare what changed. Your eye gets better with every experiment.'):heading('Welcome to LensUp','Try it. Compare it.<br>Get better.','Improve your photography with AI, practice, and community feedback.')}<div class="cycle"><span>◎<small>Take a photo</small></span><i>· · ·</i><span>☼<small>Try an adjustment</small></span><i>· · ·</i><span>▣<small>Compare & learn</small></span></div><div class="push">${go('Get started','home')}<p class="center muted small">${up?'Practice your photography. Keep your creative voice.':'Your photography journey starts here.'}</p></div>`;
case 'experiments':return experimentsScreen();
case 'home':return `${heading('YOUR NEXT PERSPECTIVE','Hello, '+esc(profileName().split(/\s+/)[0])+'.','What would you like to explore today?')}<button class="feature-card" data-action="new-practice"><div>${tag('GUIDED PRACTICE','light')}<h2>${up?'Practice a<br>Technique':'Improve a Photo'}</h2><p>${up?'Take a photo. Try an idea.<br>See what changes.':'Explore new ways to improve<br>your photograph.'}</p><span class="feature-cta">${up?'Start practice':'Let’s experiment'} &nbsp; +</span></div><img src="${photo}" alt="Woodland photography sample"></button>${homeExperimentCard()}`;
case 'goal':return `${heading(up?'PRACTICE · 2 OF 3':'PRACTICE · 1 OF 3',up?'What do you want<br>to explore?':"What’s your goal?",up?'Choose a starting direction. You can change your mind as you experiment.':'Choose a goal for your photograph.')}${up?`<div class="context-strip">${image('original','','thumb',state.source||photo)}<div><strong>Attempt 1</strong><small>Starting photo</small></div></div>`:''}<div class="options">${['Better lighting','More creative','Stronger composition','Other'].map((v,i)=>`<button class="option ${state.goal===v?'selected':''}" data-action="goal:${v}"><span class="option-icon">${['☼','✧','▣','+'][i]}</span><span><strong>${v}</strong>${up?`<small>${['Balance brightness and detail','Try a new way of seeing','Give your subject more presence','Follow your own intention'][i]}</small>`:''}</span><span class="radio"></span></button>`).join('')}</div>${up||state.goal==='Other'?field('Add a little detail (optional)','intent',state.intent,'What would you like to explore in this photograph?','textarea'):''}<div class="push">${up?btn('See suggested experiments','goal-continue'):go('Continue','source')}</div>`;
case 'source':return `${heading(up?'PRACTICE · 1 OF 3':'PRACTICE · 2 OF 3',up?'Choose your<br>starting photo.':'Take a Photo',up?'Start with a new capture or a photo you already have. This will be your starting photo.':'Add a photograph to begin.')}<div class="source-preview">${state.source||!up?image('original',up?'Attempt 1 · Starting photo':'','',state.source||photo): `<div class="empty-photo"><span>▧</span><p>Your first perspective</p><small>Every experiment starts somewhere.</small></div>`}</div><div class="two-columns">${btn('⊙ &nbsp; Take New Photo','initial-camera','secondary')}${btn('▧ &nbsp; Upload from Gallery','upload','secondary')}</div>${up?`<div class="note"><span>◎</span><p>You’ll take another photo after trying an adjustment, then compare the two.</p></div>`:''}<div class="push">${btn('Continue','source-continue')}</div>`;
case 'ideas':if(up)return suggestionScreen();return `${heading('PRACTICE · 3 OF 3','Try these<br>experiments.',up?'Three possibilities, not three rules. Choose the one that fits your intention.':'Choose one suggestion to try.')} ${up?`<div class="context-strip">${image(state.parent==='A'?'original':variantFor(state.attempts.find(a=>a.id===state.parent)||{idea:0}),'','thumb',state.parent==='A'?(state.source||photo):photo)}<div><strong>Starting from ${state.parent==='A'?'Original A':'Attempt '+state.parent}</strong><small>${esc(state.intent)}</small></div></div>${sourceBadge()}`:''}<div class="ideas">${ideas.map(([t,d,trade],i)=>`<button class="idea ${state.idea===i?'selected':''}" data-action="idea:${i}"><div class="row between"><span class="idea-number">${['☼','▱','▧'][i]}</span><span class="radio"></span></div><h3>${t}</h3>${up?`<p>${d}</p><small>Tradeoff: ${trade}</small>`:''}</button>`).join('')}</div>${up?`${btn('What does exposure mean?','definition','inline')}<div class="howto"> <p class="eyebrow">TRY IT ON YOUR PHONE</p><p>Tap the bright sky to focus. Drag the sun slider down a little. Keep the framing similar.</p>${btn('Open the 1-minute lighting lesson','open-lesson','inline')}</div>`:''}<div class="push">${btn('Try an experiment','try')}${up?btn('Save suggestion for later','defer','secondary'):''}</div>`;
case 'capture':return `${heading(state.module?(state.moduleSkill||'Lighting').toUpperCase()+' CHALLENGE':'TRY AN ADJUSTMENT',state.module?lessonsFor(state.moduleSkill)[Math.min(moduleLength()-1,state.challenge-1)][0]:selection[0],up?(state.communityCapture?'Try the advice in another photograph.':state.module?'Take a photograph for this challenge.':'Use the guide, take another photograph, then compare.'):'Take another photo using this suggestion.')}${up&&!state.module?`<p class="capture-context">${state.retry?'Retaking <strong>'+branchAttemptLabel(state.retryTarget)+'</strong>':state.communityCapture?'Trying advice on <strong>'+attemptLabel(state.parent)+'</strong>':'New attempt from <strong>'+branchAttemptLabel(state.parent)+'</strong>'}</p>`:''}<div class="capture-view ${state.cameraZoom?'zoomed':''}">${image(captureVariant())}<div class="camera-grid"></div><span class="live-camera"><i></i> Camera preview</span>${btn(state.cameraZoom?'1.2×':'1×','camera-zoom','camera-zoom')}</div>${up?card(`<p class="eyebrow">${state.module?'YOUR CHALLENGE':state.human?'FROM '+(state.selectedFeedback?.author||'Alex Chen').toUpperCase()+' · COMMUNITY ADVICE':'KEEP IN MIND'}</p><p>${state.module?lessonsFor(state.moduleSkill)[Math.min(moduleLength()-1,state.challenge-1)][1]:state.human?(esc(state.selectedFeedback?.body||'Include less of the dark foreground so the cabin remains the subject.')):state.idea===0?'Reduce brightness a little. Look for sky detail while keeping the subject visible.':selection[1]}</p>${state.module?`<label class="check-field"><input type="checkbox" name="newSubject" ${state.newSubject?'checked':''}> I’m trying this on a different subject</label>`:''}`):''}<div class="capture-actions">${btn('▧ Gallery','upload-attempt','text-button')}${btn('<span class="shutter-inner"></span>','shutter','shutter','aria-label="Take photo"')}${btn('? Guide','definition','text-button')}</div>`;
case 'alternatives':case 'newideas':return content('ideas');
case 'compare':return `${heading('YOUR EXPERIMENT',up?'Look at what<br>changed.':'Lower the exposure',up?'Judge the result against your intention.':'Original vs. New')}<div class="comparison"><div>${image(reference?variantFor(reference):'original',up?parentLabel:'Original','',reference?photo:state.source||photo)}<p class="small muted">${up?'Reference photo':'Starting photograph'}</p></div><div>${image(current?variantFor(current):'exposure',`${up?branchAttemptLabel(letter):'New'} · ${ideas[current?.idea??0][0]}`)}<p class="small muted">${up?'From '+parentLabel:'New photograph'}</p>${up&&canRetake(current)?btn('Retake this photo','retry-experiment','secondary comparison-retake'):''}</div></div>${up?`<p class="intention"><strong>YOUR INTENTION</strong> ${esc(state.intent)}</p>${current?.human?card(`${sourceBadge(true)}<h3>${esc(current.feedbackAuthor||'Community')}’s advice</h3><p>${esc(current.feedbackText||'Compare your choices against the advice you acted on.')}</p><p class="small muted">Advice on ${parentLabel}</p>`,'feedback-card'):card(`${tag('AI · Explanation','ai')}<h3>${current?.idea===1?'A new balance in the frame.':current?.idea===2?'More depth in the foreground.':'More detail. A different mood.'}</h3><p>${current?.idea===1?'The cabin’s outline and surrounding shapes change with your viewpoint. Does this balance serve your intention?':current?.idea===2?`The nearby ${current&&variantFor(current).includes('angle')?'boat':'branches'} add${current&&variantFor(current).includes('angle')?'s':''} a sense of depth but may compete with the cabin. Which do you notice first?`:'The brighter areas look less washed out, while the foreground is darker. Does that still feel like the photograph you wanted?'}</p>`,'feedback-card')}${shootingConditions('condition',state.conditions,current?.parent||'A')}${state.conditions!=='Similar conditions'?`<p class="context-warning">Conditions differ. The change may come from the scene as well as the adjustment.</p>`:''}${field('Your reflection','reflection',state.reflection,'What worked? What would you keep or change?','textarea')}<div class="push">${state.comparisonFrom==='tree'?'':go('View practice tree','tree')}${btn(`Try another idea from ${parentLabel}`,`branch-from:${current?.parent||'A'}`,'secondary')}${depthOf(letter)<3?btn(`Try another idea from ${branchAttemptLabel(letter)}`,`branch-from:${letter}`,'secondary'):tag('Three adjustments complete on this path','success')}${btn('Get feedback on this photo','share-community','text-button')}</div>`:`${card('<h3>What changed?</h3><p>Lower exposure adds detail.</p>')}<div class="push">${go('Try a different suggestion','alternatives','secondary')}${go('Get new AI suggestions','newideas','secondary')}${go('Get feedback from others','post','secondary')}${btn('Finish / Save and Exit','finish','primary')}</div>`}`;
case 'tree':return treeScreen();
case 'saved':if(up)return savedActionScreen();return `${heading('READY WHEN YOU ARE','A good idea<br>can wait.','Your practice is saved.')}<div class="saved-icon">✓</div>${card(`<div class="context-strip">${image('original','','thumb')}<div><p class="eyebrow">YOUR NEXT EXPERIMENT</p><h3>${selection[0]}</h3><small>From ${state.parent==='A'?'Original A':'Attempt '+state.parent} · Lighting</small></div></div><p>${esc(state.intent)}</p>${tag('Saved to My Progress','success')}`)}${up?`<div class="note"><span>☼</span><p>Try this technique on another subject if the original scene is no longer available.</p></div>`:''}<div class="push">${go('Resume this experiment','ideas')}${go('View my progress','progress','secondary')}${go('Back to home','home','text-button')}</div>`;
case 'assessment':return `${heading('LEARN · START WITH YOUR WORK',state.learnReady?'Refresh your<br>practice focus.':'Start with<br>your photographs.',state.learnReady?'Upload another collection to update your practice plan. Completed challenges, feedback and experiments stay saved.':'Upload a collection of your photographs to find a skill to practise and generate your modules.')}<div class="collection">${image('original')}${image('angle')}${image('exposure')}</div>${card('<h3>From your photos to purposeful practice.</h3><p>Identify a focus, learn the technique, and apply it in a short photography challenge.</p>')}<div class="push">${btn(state.learnReady?'Upload new photos':'Upload photos','collection-upload')}${btn('Use sample collection','assess','secondary')}</div>`;
case 'modules':if(up)return moduleScreen();return `${heading('MAKE ROOM TO LEARN','Skill Modules',up?'A little understanding. A focused challenge.':'Choose a skill to practise.')} ${up?`<div class="note"><span>✧</span><p><strong>A starting point for you</strong><br>Lighting connects to your goal of balancing bright areas with detail.</p></div>`:''}<div class="module-list">${[['☼','Lighting', '2 of 3 challenges explored',66],['▣','Composition','3 of 5 challenges explored',60],['▧','Framing','1 of 5 challenges explored',20]].map(([i,t,d,p])=>`<button class="module-card" data-action="module:${t}"><div class="row"><span class="activity-icon">${i}</span><div><h3>${t}</h3><p class="small muted">${d}</p></div><span class="chevron">›</span></div><div class="progress-track"><span style="width:${p}%"></span></div>${up&&t==='Lighting'?tag('Recommended for your goal','ai'):''}</button>`).join('')}</div><p class="small muted">${up?'Challenge completion shows activity, not a measure of mastery.':'2 of 5 modules complete'}</p>`;
case 'module-detail':return moduleDetailScreen();
case 'lesson':if(up)return lessonScreen();return `${heading(`${(state.moduleSkill||'Lighting').toUpperCase()} · LEVEL ${state.challenge}`,state.moduleSkill==='Composition'?'Make your subject stand out.':state.moduleSkill==='Framing'?'Choose what belongs.':state.challenge>1?'Find a new kind of light.':'Find the light.',state.moduleSkill==='Composition'?'Find a subject against a busy background.':state.moduleSkill==='Framing'?'Use a doorway or nearby branches to frame a subject.':'Take a photo with good lighting.')} ${image('original','Watch where the light falls')}${up?`${card(state.moduleSkill==='Composition'?'<h3>Give the subject some space.</h3><p>Check the edges of your subject. Moving slightly can stop a background object from overlapping it.</p>':state.moduleSkill==='Framing'?'<h3>Lead the eye inward.</h3><p>A natural frame can draw attention to a subject. Include enough to create context without covering it.</p>':'<h3>Light gives a subject shape.</h3><p>Side light makes one side brighter and the other darker. That difference helps a flat photograph feel more dimensional.</p>')}<div class="howto"><p class="eyebrow">YOUR CHALLENGE</p><p>${state.moduleSkill==='Composition'?'Photograph a subject in a busy setting. Move until its outline is separated from the background.':state.moduleSkill==='Framing'?'Photograph a subject through a natural frame. Keep the subject visible and the frame secondary.':state.challenge>1?'Find a different subject outdoors. Look for a lit side and a shadow side, and retain detail in both.':'Place an object beside a window. Photograph it so you can see a lit side and a shadow side.'}</p><ul><li>Keep the subject easy to identify.</li><li>Retain detail in the bright side.</li><li>Notice where the shadow falls.</li></ul></div>`:''}<div class="push">${btn(state.lessonReturn?'Return to my experiment':'Take photo','lesson-capture')}${up?btn('Save lesson for later','save-lesson','secondary'):''}</div>`;
case 'results':if(up)return moduleResultScreen();return `${heading(`${(state.moduleSkill||'Lighting').toUpperCase()} · LEVEL ${state.challenge}`,'Results & Feedback',up?'A useful attempt. Here’s what to try next.':'8/10')}${image('exposure','Your '+(state.moduleSkill||'Lighting').toLowerCase()+' challenge')}${up?sourceBadge():''}${card(`<h3>✓ ${up?'What’s working':'Good lighting'}</h3><p>The subject stands apart from the background, and the light gives it shape.</p><h3>☼ ${up?'Next adjustment':'Try less shadow'}</h3><p>Keep a little more detail on the shadow side. Try moving closer to the window.</p>`)}<div class="push">${btn('Next challenge','next-challenge')}${btn('Try again','retry-module','secondary')}${up?btn('Save & finish practice','finish','text-button'):''}</div>`;
case 'peer-discussion':return peerDiscussionScreen();
case 'community':if(up)return communityScreen();return `${heading('A FRESH PAIR OF EYES','Community Critique','Learn from another perspective.')}<div class="segmented">${btn('For you','feed:for-you',state.feed!=='following'?'selected':'')}${btn('Following','feed:following',state.feed==='following'?'selected':'')}</div><div class="feed-card"><div class="row"><span class="avatar amber">A</span><div><strong>${state.feed==='following'?'Alex Chen':'Sam Rivera'}</strong><small class="muted">${state.feed==='following'?'Following · Landscape practice':'Photography learners · 2 hours ago'}</small></div></div>${image('angle','Finding a quieter foreground')}<h3>Does the foreground add depth?</h3><p class="small muted">Exploring composition · 2 attempts · 3 comments</p>${go('View photo & critique','critique','secondary')}</div>${up?card(`${sourceBadge(true)}<p>Every reply belongs to a specific photograph. Share only when you want another perspective.</p>`):''}<div class="push">${go(up?'Ask community for advice':'Post for feedback','post')}</div>`;
case 'post':if(up)return feedbackPostScreen();return `${heading('ASK THE COMMUNITY','Another perspective,<br>on your terms.','Choose a photo and ask one focused question.')}${up&&state.postOrigin==='direct'?directPostSource():`<div class="context-strip">${image(state.postPhoto&&current?variantFor(current):'original','','thumb')}<div><strong>${state.postPhoto&&current?'Attempt '+letter:'Original A'}</strong><small>${esc(state.goal)} · ${state.postPhoto&&current?ideas[current?.idea??0][0]:'Starting photo'}</small></div>${btn('Change','choose-photo','inline')}</div>`}${field('What feedback would you like?','question',state.question,'What are you unsure about?','textarea')}<label class="field"><span>Who can see this?</span><select name="audience"><option ${state.audience==='Photography learners'?'selected':''}>Photography learners</option><option ${state.audience==='Only invited reviewers'?'selected':''}>Only invited reviewers</option></select></label>${up?`<div class="note"><span>◌</span><p>Community feedback comes from people. You can keep practising while you wait for replies.</p></div>`:''}<div class="push">${btn('Post request','post')}${go('Cancel · Back to community','community','text-button')}</div>`;
case 'critique':if(up)return unifiedCritiqueScreen();return `${heading('PHOTO FEEDBACK',up?'A fresh perspective.':'Feedback (3)',state.posted?'Your request is saved in this prototype. A sample reply is shown below.':'A sample critique on your photograph.')}<div class="annotated-photo">${image(state.postPhoto&&current?variantFor(current):'original',state.postPhoto&&current?'Attempt '+letter+' · '+ideas[current?.idea??0][0]:'Original A · Starting photo')}<button class="annotation-pin" data-action="annotation" aria-label="Read annotation 1">1</button></div>${up?sourceBadge(true):''}<div class="critique-card"><div class="row"><span class="avatar amber">AC</span><div><strong>Alex Chen</strong><small class="muted">Community member · Landscape hobbyist</small></div></div>${up?`<div class="target-photo">${image(state.postPhoto&&current?variantFor(current):'original','','tiny')}<span>Comment on <strong>${state.postPhoto&&current?'Attempt '+letter:'Original A'}</strong></span></div>`:''}<h3>1 · Let the subject breathe.</h3><p>The dark foreground draws my eye before the cabin. Include a little less of it by moving to a slightly higher viewpoint.</p><p class="small muted">That could keep the depth while making your intended subject clearer.</p>${btn(up?'Try Alex’s advice':'Try this advice','human-try','secondary')}${btn('Ask a follow-up question','reply','inline')}</div><div class="push">${go('View critique carousel','carousel','secondary')}${btn('Save advice for later','defer','text-button')}</div>`;
case 'carousel':if(up)return unifiedCritiqueScreen();return `${heading('LINKED ATTEMPTS','Critique Carousel','The photo changes. Its feedback stays attached.')}<div class="segmented">${btn(state.critiqueTarget&&state.critiqueTarget!=='A'?'Attempt '+state.critiqueTarget:'Original A','carousel:0',state.communityAttempt===0?'selected':'')}${btn('Attempt '+(state.communityFollow||'B'),'carousel:1',state.communityAttempt===1?'selected':'')}</div>${image(state.communityAttempt?'angle':'original',state.communityAttempt?'Attempt '+(state.communityFollow||'B')+' · Applied Alex’s advice':(state.critiqueTarget&&state.critiqueTarget!=='A'?'Attempt '+state.critiqueTarget:'Original A')+' · Critiqued photo')}<p class="center small muted">${state.communityAttempt?'2 of 2 · Based on '+(state.critiqueTarget&&state.critiqueTarget!=='A'?'Attempt '+state.critiqueTarget:'Original A'):'1 of 2 · Critiqued photograph'}</p>${card(`${sourceBadge(true)}<div class="target-photo">${image(state.communityAttempt?'angle':'original','','tiny')}<strong>Feedback on ${state.communityAttempt?'Attempt '+(state.communityFollow||'B'):(state.critiqueTarget&&state.critiqueTarget!=='A'?'Attempt '+state.critiqueTarget:'Original A')}</strong></div><h3>${state.communityAttempt?'Your follow-up is linked.':'Alex · Try a higher viewpoint.'}</h3><p>${state.communityAttempt?'The foreground takes up less of the frame. Your reflection and the advice that led here are saved together.':'Include less of the dark foreground so the cabin remains the subject.'}</p>${state.communityAttempt?'<p class="small muted">No new community replies on this attempt yet.</p>':''}`)}<div class="push">${btn('Add another attempt','human-try')}${go('Back to community','community','secondary')}</div>`;
case 'progress':if(up)return progressScreen();return `${heading('YOUR EYE IS DEVELOPING','My Progress')}<div class="stats">${[[state.practiceSessions.length,'Practice sessions'],[state.practiceSessions.reduce((n,s)=>n+(s.snapshot.attempts?.length||0),0),'Photo attempts'],[Object.values(state.moduleProgress).reduce((n,steps)=>n+steps.length,0),'Challenges complete']].map(([n,l])=>`<div><strong>${n}</strong><small>${l}</small></div>`).join('')}</div>${card(`<h3>My Experiments</h3>${btn('View my experiments','experiments:progress','secondary')}`)}<h2>Skills in practice</h2>${[['☼','Lighting','Balancing light and detail'],['▣','Composition','Making the subject stand out'],['▧','Framing','Choosing what stays in the frame'],...(state.moduleUpdateApplied?[['▱','Depth','Working with near and far']]:[])].map(([i,t,d])=>`<button class="activity-card" data-action="history:${t}"><span class="activity-icon">${i}</span><span><strong>${t}</strong><small>${d}</small></span><span>›</span></button>`).join('')}${pendingPracticeCard()}<div class="push">${go('View achievements','achievements','secondary')}</div>`;
case 'history':if(up)return skillHistoryScreen();return `${heading(`${(state.skill||'Lighting').toUpperCase()} · PRACTICE HISTORY`,'Look beyond<br>the numbers.','Compare your decisions, not just your photographs.')}<div class="comparison"><div>${image('original','Earlier · Nov 6')}<p class="small muted">Overcast · familiar setting</p></div><div>${image('angle','Later · Nov 10')}<p class="small muted">Direct sun · busier background</p></div></div>${card('<h3>What do you notice?</h3><p>A clearer subject can come from a more deliberate choice, an easier scene, or both. Keep the different conditions in mind.</p>')}${field('Your developing eye','historyReflection',state.historyReflection||'I check the background more deliberately now, but busy scenes are still difficult.','','textarea')}<div class="note"><span>▣</span><p><strong>A focused next step</strong><br>Try separating a subject from a busier background.</p></div><div class="push">${btn('Continue with a focused challenge','history-challenge')}${btn('Save reflection','save-reflection','secondary')}</div>`;
case 'achievements':if(up)return achievementScreen();return `${heading('SMALL STEPS, NEW PERSPECTIVES','Your Achievements')}<div class="badges">${[['◎','10','Experiments'],['▤','1','Module explored'],['◌','5','Feedback exchanges'],['◇','?','Next discovery']].map(([i,n,l])=>`<div class="badge"><span>${i}</span><strong>${n}</strong><small>${l}</small></div>`).join('')}</div><p class="center muted">7 of 10 steps toward your next practice badge.</p><div class="progress-track"><span style="width:70%"></span></div><div class="push">${go('Back to home','home')}${go('Review the photographs behind your progress','progress','text-button')}</div>`;
default:return ''}}

function baselineContent(r){const map={progress:()=>`${heading('','My Progress')}<div class="baseline-stats"><div><strong>8</strong><small>Experiments</small></div><div><strong>6</strong><small>Feedback given</small></div></div><p class="center small">Modules: 2 of 5 complete</p>${[['Lighting','Done ✓',100],['Composition','60%',60],['Framing','20%',20]].map(([t,n,p])=>`<div class="module-card"><div class="row between"><strong>${t}</strong><small>${n}</small></div><div class="progress-track"><span style="width:${p}%"></span></div></div>`).join('')}<div class="push">${go('View Achievements','achievements')}</div>`,achievements:()=>`${heading('','Achievements')}<div class="baseline-badges">${[['10','Experiments'],['1','Module done'],['5','Feedback'],['?','Locked']].map(([n,t])=>`<div><span>${n}</span><small>${t}</small></div>`).join('')}</div><p class="small">7 / 10 to next badge</p><div class="progress-track"><span style="width:70%"></span></div><div class="push">${go('Back to home','home')}</div>`,alternatives:()=>`${heading('','Try a Different Experiment')}<div class="options">${ideas.map(([t],i)=>btn(t+(state.idea===i?' ✓':''),`idea:${i}`,'secondary')).join('')}</div><div class="push">${btn('Take Photo','try')}</div>`,newideas:()=>`${heading('','New Suggestions for This Photo')}<div class="options">${['Try a lower angle','Increase contrast','Add leading lines'].map((t,i)=>btn(t,`idea:${i}`,'secondary')).join('')}</div><div class="push">${btn('Take Photo','try')}</div>`,welcome:()=>`${image('original')}<p class="center">Improve your photography with AI, practice, and community feedback.</p><div class="push">${go('Get Started','home')}</div>`,home:()=>`<div class="options">${[['goal','Improve a Photo','practice'],['assessment','Skill Modules','modules'],['community','Community Critique','community'],['progress','My Progress','progress']].map(([r,t,i])=>go(`<span class="dot ${i}"></span>${t} &nbsp; ›`,r,'secondary')).join('')}</div>`,goal:()=>`${heading('',"What’s your goal?")}<div class="baseline-goals">${['Better lighting','More creative','Stronger composition','Other'].map(v=>`<label><input type="radio" name="baselineGoal" value="${v}" ${state.goal===v?'checked':''}> ${v}</label>`).join('')}</div><div class="push">${go('Continue','source')}</div>`,source:()=>`${heading('','Take a Photo')}${image('original')}<div class="two-columns">${btn('Gallery','upload','secondary')}${btn('Camera','initial-camera','secondary')}</div><div class="push">${go('Next','ideas')}</div>`,ideas:()=>`${heading('','Try these experiments')}<div class="options">${ideas.map(([t],i)=>btn(t+(state.idea===i?' &nbsp; ✓':''),`idea:${i}`,state.idea===i?'secondary selected':'secondary')).join('')}</div><div class="push">${btn('Try an Experiment','try')}</div>`,assessment:()=>`${heading('','Upload a photo so we can generate your skill modules.')}${image('original')}<div class="push">${btn('Upload Photo','assess')}</div>`,modules:()=>`${heading('','Skill Modules')}${[['Lighting','Done ✓',100],['Composition','60%',60],['Framing','20%',20]].map(([t,n,p])=>`<button class="module-card" data-action="module:${t}"><div class="row between"><strong>${t}</strong><small>${n}</small></div><div class="progress-track"><span style="width:${p}%"></span></div></button>`).join('')}<p>2 of 5 modules complete</p>`,lesson:()=>`${heading('','Lighting – Level 1','Take a photo<br>with good lighting.')}${image('original')}<div class="push">${btn('Take Photo','lesson-capture')}</div>`,results:()=>`${heading('','Results & Feedback')}<h2 class="center">8/10</h2><div class="checklist"><p>■ Good lighting</p><p>■ Clear subject</p><p>□ Try less shadow</p></div><div class="push">${btn('Next Challenge','next-challenge','secondary')}${go('Back to Modules','modules','secondary')}</div>`,community:()=>`${heading('','Community Critique')}<div class="segmented">${btn('For You','feed:for-you',state.feed!=='following'?'selected':'')}${btn('Following','feed:following',state.feed==='following'?'selected':'')}</div>${['Sunset Shot','City Street','Portrait'].map(t=>go(t,'critique','secondary')).join('')}<div class="push">${go('+','post')}</div>`,post:()=>`${heading('','Post for Feedback')}${image('original')}${field('What feedback do you want? (e.g., lighting, composition)','question',state.question,'','textarea')}<div class="push">${btn('Post','post')}</div>`,critique:()=>`${heading('','Feedback (3)')}${['Try a lower angle.','Increase contrast.','Crop in tighter.'].map(t=>card(`<p>${t}</p>`)).join('')}<div class="push">${btn('+ New Attempt','human-try')}</div>`,carousel:()=>`${heading('','Critique Carousel')}${image(state.communityAttempt?'angle':'original')}<div class="two-columns">${btn('‹','carousel:0','secondary')}${btn('›','carousel:1','secondary')}</div><p class="center">Critique 2 of 3 · swipe or tap</p>${card('Tip: Add a foreground to create depth.')}<div class="push">${btn('+ Add Another Attempt','human-try')}</div>`,saved:()=>`${heading('','Saved to My Progress!')}<div class="saved-icon">✓</div><div class="push">${go('View Progress','progress','secondary')}${go('Back to home','home','secondary')}</div>`};return map[r]?map[r]():content(r)}
function renderScreen(r){if(improved())return screen(r);return `<article class="phone baseline" data-screen="baseline/${r}" aria-label="${routes.find(x=>x[0]===r)?.[1]}"><div class="status-bar"><span>9:41</span><span>▮▮▮ &nbsp; ▰</span></div><div class="baseline-logo"><img src="${asset('lensup-logo.png')}" alt="LensUp"></div><div class="screen-content" data-scroll="vertical"><div class="screen-body">${baselineContent(r)}</div></div><div class="home-indicator"></div>${phoneOverlays(r)}</article>`}
function availableRoutes(){const core=routes.filter(([r])=>!onboardingRoutes.includes(r));const ordered=improved()?routes:[...core].sort((a,b)=>{const key=r=>r==='goal'?2:r==='source'?3:core.findIndex(x=>x[0]===r);return key(a[0])-key(b[0])});return ordered.filter(([r])=>improved()?!['alternatives','newideas','carousel'].includes(r):!['capture','tree','history','module-detail','experiments','peer-discussion'].includes(r))}
function legacyRender(){document.body.className='';$('#app').innerHTML=`<div class="demo-shell"><header class="demo-toolbar"><img src="${asset('lensup-logo.png')}" alt="LensUp">${btn('Interactive','view:prototype','secondary')}${btn('Reset demo','reset','reset-button')}</header><main class="screen-board">${availableRoutes().map(([id,title])=>`<section class="artboard"><div class="artboard-label"><span>${esc(title)}</span>${btn('Open','open:'+id,'inline')}</div>${renderScreen(id)}</section>`).join('')}</main></div>`;}

function phoneOverlays(route){return route===state.route?`<div class="phone-overlays">${state.modal?modal():''}<div class="toast" role="status" aria-live="polite" aria-atomic="true"></div></div>`:'';}
function modal(){if(state.modal==='delete-post')return deletePostDialog();if(state.modal==='account-settings')return settingsDialog();if(state.modal==='peer-profile')return peerProfileDialog();if(improved()&&state.modal==='post-camera')return postCameraDialog();if(improved()&&state.modal==='annotation')return annotationDialog();let body='';switch(state.modal){case 'viewpoint':body=viewpointGuide();break;case 'legacy-viewpoint':body=`<p class="eyebrow">PHOTOGRAPHY, IN PLAIN WORDS</p><h2>Viewpoint is where you take the photo from.</h2><p>Moving higher, lower or to one side changes what overlaps, what fills the frame, and how the subject feels.</p><div class="howto"><p>Move a small amount. Watch the subject’s outline and how much sky and foreground remain.</p></div>${btn('Got it · return to practice','close')}`;break;case 'foreground':body=`<p class="eyebrow">PHOTOGRAPHY, IN PLAIN WORDS</p><h2>The foreground is the part closest to you.</h2><p>A nearby branch or railing can add depth. Keep it secondary so it does not cover or compete with your subject.</p>${btn('Got it · return to practice','close')}`;break;case 'depth-guide':body=`<h2>Depth is the sense of near and far.</h2>${image('angle foreground','Near boat · cabin · distant mountains')}<p>Look for a nearby element, a middle layer and a distant background. Keep the subject clear as you change viewpoint.</p>${btn('Return to challenge','close')}`;break;case 'definition':body=`<p class="eyebrow">PHOTOGRAPHY, IN PLAIN WORDS</p><h2>Exposure is how bright<br>your photograph looks.</h2><div class="comparison">${image('original','Brighter')}${image('exposure','Less exposure')}</div><p>Lowering exposure makes the whole image darker. It can recover detail in bright areas, but may hide detail in shadows.</p>${visualCameraGuide()}<div class="howto"><h3>On your phone</h3><ol><li>Tap your subject to focus.</li><li>Find the sun or brightness slider.</li><li>Drag it down slightly and take another photo.</li></ol></div>${btn('Got it · return to practice','close')}`;break;case 'capture':body=`<p class="eyebrow">CAMERA</p><h2>Your new perspective.</h2>${image(state.initialCapture?'original':captureVariant()+(state.cameraZoom?' zoom-capture':''),state.initialCapture?'Starting photo preview':'New attempt preview')}${improved()&&state.retry?`<p class="small muted">Using this photo replaces ${branchAttemptLabel(state.retryTarget)}. The starting photo and technique stay the same.</p>`:''}${btn(improved()&&state.retry?'Use replacement photo':improved()&&state.communityCapture?'Add photo to post':'Use this photo','confirm-capture')}${btn('Retake photo','close','secondary')}`;break;case 'exit':body=`<p class="eyebrow">LEAVE PRACTICE</p><h2>Go home?</h2><p>Your progress is saved. You can continue this experiment later.</p>${btn('Go home','exit-confirm')}${btn('Keep practising','close','secondary')}`;break;case 'notes':body=`<p class="eyebrow">A2 FOUNDATION → A3 REFINEMENT</p><h2>Same practice loop.<br>Clearer decisions.</h2><div class="notes-list">${Object.entries(evidence).filter(([r])=>['welcome','source','ideas','compare','tree','critique','saved'].includes(r)).map(([r,e])=>`<div><h3>${e[0]}</h3><p>${e[2]}</p><small>${e[1]}</small></div>`).join('')}</div><p>Brand palette: blue #2B4C9B, amber #F2A93B, cream #FFF1D0. All controls and text remain HTML; only photographs and supplied logos are image assets.</p>${btn('Return to prototype','close')}`;break;case 'reply':body=`<h2>Ask ${esc(state.replyRecipient||'Alex Chen')} a question.</h2>${field('Your question','reply',state.reply||'','Ask about this suggestion.','textarea')}${btn('Post reply','send-reply')}`;break;case 'choose-photo':body=`<h2>Choose the photo<br>for your request.</h2>${['Original A',attemptLabel(state.selectedNode&&state.selectedNode!=='A'?state.selectedNode:state.attempts.at(-1)?.id||'A')].map((t,i)=>`<button class="photo-choice" data-action="post-photo:${i}">${image(i?'exposure':'original','','thumb')}<strong>${t}</strong></button>`).join('')}`;break;default:body=`<h2>Annotation 1</h2><p>The dark foreground competes with the cabin. Try a slightly higher viewpoint to reduce how much foreground fills the frame.</p>${btn('Back to critique','close')}`;}return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="${state.modal}"><button class="modal-close" data-action="close" aria-label="Close dialog">×</button>${body}</section></div>`}
let toastSequence=0;
function toast(text,tone=/^(Take a new photo or upload|Choose a photo|Complete the previous|Select an attempt|Enter |Write |Add a question|This path|Choose an earlier|This photo already)/.test(text)?'error':'success'){const el=$('.toast');if(!el)return;const sequence=++toastSequence;el.textContent=text;el.classList.remove('error','success');el.classList.add(tone);el.classList.add('visible');setTimeout(()=>{if(sequence===toastSequence)el.classList.remove('visible');},2000)}
function action(a){const [type,...rest]=a.split(':');const value=rest.join(':');if(type==='reset'){resetDemo();return}if(polishAction(type,value))return;if(materialAction(type,value))return;if(practiceHistoryAction(type,value))return;if(revisedAction(type,value))return;switch(type){case 'go':navigate(value);break;case 'open':state.view='prototype';navigate(value);break;case 'version':state.version=value;if(value==='improved'&&state.route==='welcome'&&!state.accountComplete)state.route='signup';state.modal=null;syncRouteUrl();save();render();break;case 'view':state.view=value;save();render();break;case 'goal':state.goal=value;state.intent='';save();render();break;case 'idea':state.idea=+value;save();render();break;case 'sample':state.sourceKind='sample';state.source=photo;save();render();toast(improved()?'Starting photo selected.':'Study sample selected as Original A.');break;case 'source-continue':if(!state.source&&improved()){toast('Take a new photo or upload one to continue.');break}navigate('ideas');break;case 'initial-camera':state.initialCapture=true;state.modal='capture';render();break;case 'upload':case 'collection-upload':case 'upload-attempt':{const input=document.createElement('input');input.type='file';input.accept='image/*';input.multiple=type==='collection-upload';input.onchange=()=>{if(!input.files.length)return;if(type==='upload-attempt'){state.initialCapture=false;state.modal='capture';render()}else{state.sourceKind='upload';state.source=URL.createObjectURL(input.files[0]);if(type==='collection-upload')navigate('modules');else{render();toast('Photo selected.')}}};input.click();break}case 'try':state.module=false;state.human=false;navigate('capture');break;case 'shutter':state.initialCapture=false;state.modal='capture';render();break;case 'confirm-capture':if(state.initialCapture){state.initialCapture=false;state.sourceKind='sample';state.source=photo;state.modal=null;navigate('source');break}if(state.module){navigate('results');break}if(state.newSubject)state.conditions='Different subject';state.attempts.push({id:String.fromCharCode(66+state.attempts.length),parent:state.parent,idea:state.idea,retry:!!state.retry,conditions:state.conditions,reflection:state.reflection,adjustments:[...(state.attempts.find(a=>a.id===state.parent)?.adjustments||[]),state.idea]});state.selectedNode=state.attempts.at(-1).id;state.retry=false;if(state.human){state.communityFollow=state.attempts.at(-1).id;state.communityAttempt=1;navigate('carousel')}else navigate('compare');break;case 'branch':state.retry=false;state.parent='A';state.idea=(state.idea+1)%3;navigate('ideas');break;case 'refine':state.retry=false;state.parent=state.selectedNode||state.attempts.at(-1)?.id||'A';navigate('ideas');break;case 'retry-experiment':{const attempt=state.attempts.find(a=>a.id===state.selectedNode)||state.attempts.at(-1);state.retry=true;state.parent=attempt?.parent||'A';state.idea=attempt?.idea||0;state.module=false;navigate('capture');break;}case 'node':state.selectedNode=value;save();render();break;case 'compare-node':{const chosen=state.attempts.find(a=>a.id===state.selectedNode);if(chosen){state.idea=chosen.idea;state.parent=chosen.parent;}}if(!state.selectedNode){toast('Select an attempt in the tree first.');break}navigate('compare');break;case 'condition':state.conditions=value;{const a=state.attempts.find(a=>a.id===state.selectedNode);if(a)a.conditions=value;}save();render();break;case 'defer':case 'finish':state.saved=true;navigate('saved');break;case 'assess':navigate('modules');break;case 'module':state.challenge=1;state.moduleSkill=value;state.lessonReturn=false;navigate('lesson');break;case 'open-lesson':state.lessonReturn=true;navigate('lesson');break;case 'lesson-capture':if(state.lessonReturn){state.lessonReturn=false;navigate('ideas')}else{state.module=true;navigate('capture')}break;case 'save-lesson':state.saved=true;navigate('home');toast('Lesson saved for your next practice opportunity.');break;case 'retry-module':state.module=true;navigate('capture');break;case 'next-challenge':state.challenge++;state.module=true;navigate('lesson');toast('Next challenge: try the same lighting skill with a different subject.');break;case 'feed':state.feed=value;render();break;case 'post':if(!state.question.trim()){toast('Add a question so reviewers know what to focus on.');break}state.posted=true;state.critiqueTarget=state.postPhoto?(state.selectedNode||state.attempts.at(-1)?.id||'A'):'A';navigate('critique');break;case 'human-try':state.parent=state.critiqueTarget||'A';state.human=true;state.module=false;state.idea=1;navigate('capture');break;case 'carousel':state.communityAttempt=+value;save();render();break;case 'history':state.moduleFromExperiment=null;state.skill=value;navigate('history');break;case 'history-challenge':state.moduleSkill='Composition';state.challenge=1;state.module=true;state.lessonReturn=false;navigate('lesson');break;case 'save-reflection':save();toast('Your reflection is saved with these attempts.');break;case 'post-photo':state.postPhoto=+value;state.modal=null;render();toast(`${+value?'Attempt B':'Original A'} selected for your request.`);break;case 'send-reply':state.modal=null;save();render();toast('Reply posted.');break;case 'exit-confirm':state.saved=true;navigate('home');toast('Practice saved. Come back when you’re ready.');break;case 'reset':state.attempts=[];state.selectedNode=null;state.parent='A';state.idea=0;state.saved=false;state.reflection='';state.source=null;state.conditions='Similar conditions';state.posted=false;state.challenge=1;state.moduleSkill='Lighting';state.goal='Better lighting';state.intent='Keep the bright feel; show more sky detail.';navigate('welcome');toast('Study reset. Ready for the next participant.');break;case 'close':state.pendingDeletePostId=null;state.modal=null;renderPreservingScroll();break;default:state.modal=type;render();}
 if(state.modal){setTimeout(()=>$('.modal button, .modal input')?.focus(),0)}save();}
document.addEventListener('click',e=>{const target=e.target.closest('[data-action]');if(target){e.preventDefault();action(target.dataset.action)}});
document.addEventListener('input',e=>{if(e.target.tagName==='TEXTAREA')growTextarea(e.target);if(e.target.name){if(e.target.name==='accountPassword'){accountPassword=e.target.value;return;}state[e.target.name]=e.target.type==='checkbox'?e.target.checked:e.target.value;if(e.target.name==='reflection'){const a=state.attempts.find(a=>a.id===state.selectedNode);if(a)a.reflection=state.reflection;}if(['experienceRating','settingsExperience'].includes(e.target.name)){const level=experienceLevels[Number(e.target.value)];e.target.setAttribute('aria-valuetext',level);const output=e.target.closest('label')?.querySelector('output');if(output)output.textContent=level;}if(e.target.name==='guideExposure'){const preview=document.querySelector('.guide-photo img');if(preview)preview.style.filter=`brightness(${Math.pow(2,+e.target.value*.5)})`;}save()}});
document.addEventListener('change',e=>{if(e.target.name?.startsWith('historyPick:')){const [,skill,side]=e.target.name.split(':');setHistoryChoice(skill,side,e.target.value);}if(e.target.name==='baselineGoal'){state.goal=e.target.value;save()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.modal){state.pendingDeletePostId=null;state.modal=null;renderPreservingScroll()}if(e.key==='Tab'&&state.modal){const items=[...document.querySelectorAll('.modal button,.modal input,.modal textarea,.modal select')];const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
// Sessions keep their own photograph tree, intention and resume location.
const practiceFields=['comparisonFrom','suggestionsFrom','sourceKind','goal','intent','idea','parent','attempts','saved','conditions','reflection','selectedNode','newSubject','human','retry','retryTarget','selectedFeedback'];
const practiceRoutes=['goal','source','ideas','capture','compare','tree','saved','post','critique'];
function practiceSnapshot(){
 const result={};for(const key of practiceFields)if(state[key]!==undefined)result[key]=JSON.parse(JSON.stringify(state[key]));
 result.sourceReady=!!state.source||state.attempts.length>0;
 return result;
}
function activePractice(){return state.practiceSessions.find(session=>session.id===state.activePracticeId);}
function initializePracticeHistory(){
 state.practiceSessions=state.practiceSessions||[];
 if((state.attempts.length||state.source)&&!state.activePracticeId){
  state.practiceCounter=(state.practiceCounter||0)+1;
  state.activePracticeId='practice-'+state.practiceCounter;
  state.practiceSessions.push({id:state.activePracticeId,number:state.practiceCounter,status:state.attempts.length?'saved':'in-progress',resumeRoute:state.attempts.length?'tree':'source',snapshot:practiceSnapshot()});
 }
}
function syncPractice(){
 if(!improved()||state.communityCapture||['community','critique','peer-discussion','post'].includes(state.route)||state.module||state.lessonReturn||(state.route==='post'&&state.postOrigin==='direct'))return;
 const session=activePractice();if(!session)return;
 session.snapshot=practiceSnapshot();
 if(practiceRoutes.includes(state.route)&&state.route!=='saved')session.resumeRoute=state.route;
}
function newPractice(){
 syncPractice();
 const defaults=initialState();for(const key of practiceFields){delete state[key];if(defaults[key]!==undefined)state[key]=JSON.parse(JSON.stringify(defaults[key]));}
 state.treeFromHistory=false;state.source=null;state.initialCapture=false;state.module=false;state.lessonReturn=false;state.expandedNodes=['A'];
 state.practiceCounter=(state.practiceCounter||0)+1;
 state.activePracticeId='practice-'+state.practiceCounter;
 state.practiceSessions.push({id:state.activePracticeId,number:state.practiceCounter,status:'in-progress',resumeRoute:'source',snapshot:practiceSnapshot()});
 navigate('source');
}
function resumePractice(id,tree=false){
 const session=state.practiceSessions.find(s=>s.id===id);if(!session)return;
 syncPractice();
 const defaults=initialState();for(const key of practiceFields){delete state[key];if(defaults[key]!==undefined)state[key]=JSON.parse(JSON.stringify(defaults[key]));}
 Object.assign(state,JSON.parse(JSON.stringify(session.snapshot)));
 state.source=session.snapshot.sourceReady?photo:null;delete state.sourceReady;
 state.activePracticeId=id;state.module=false;state.lessonReturn=false;state.initialCapture=false;state.expandedNodes=['A',...pathTo(state.selectedNode||'A')];
 state.treeFromHistory=tree||session.resumeRoute==='tree';navigate(tree?'tree':session.pendingAction&&session.pendingAction.type!=='ai'?'saved':session.resumeRoute||'tree');
}
function experimentsScreen(){
 const sessions=[...state.practiceSessions].reverse();
 return `${heading('YOUR PHOTOGRAPHY PRACTICE','My Experiments')}<div class="experiments-list">${sessions.length?sessions.map(session=>{const snap=session.snapshot,last=snap.attempts?.find(a=>a.id===snap.selectedNode)||snap.attempts?.at(-1);return `<section class="card experiment-session"><div class="row">${image(last?variantFor(last):'original','','session-thumb')}<div><p class="eyebrow">PRACTICE ${session.number} · ${esc(snap.goal)}</p><h3>${esc(snap.intent||'Explore a new perspective')}</h3></div></div><div class="row between"><span class="small muted">${snap.attempts?.length||0} attempts · Last viewed ${branchAttemptLabel(snap.selectedNode||'A',snap.attempts||[])}</span>${tag(session.status==='completed'?'Finished':session.status==='saved-for-later'?'Saved for later':'In progress',session.status==='completed'?'success':'ai')}</div>${btn(session.status==='completed'?'Reopen experiment':'Continue where you left off',`resume-practice:${session.id}`)}</section>`}).join(''):card('<h3>Your first experiment starts here.</h3><p>Choose an intention, try an adjustment and compare. Your practice will appear here automatically. Start a new practice whenever you want a different focus.','empty-experiments')}</div><div class="push">${btn('Start a new practice','new-practice','secondary')}</div>`;
}
function practiceHistoryAction(type,value){
 if(!improved())return false;
 switch(type){
  case 'new-practice':newPractice();return true;
  case 'try':case 'human-try':{const session=activePractice();if(session)session.status='in-progress';return false;}
  case 'experiments':syncPractice();state.experimentsFrom=value||'home';navigate('experiments');return true;
  case 'resume-practice':{const session=state.practiceSessions.find(s=>s.id===value),hasAttempts=value===state.activePracticeId?state.attempts.length:session?.snapshot.attempts?.length;resumePractice(value,!!hasAttempts);return true;}
  case 'session-tree':resumePractice(value,true);return true;
  case 'finish':case 'defer':case 'exit-confirm': {
   const session=activePractice();if(session){session.status=type==='finish'?'completed':type==='defer'?'saved-for-later':'in-progress';if(type==='finish')session.resumeRoute='tree';}
   return false;
  }
  default:return false;
 }
}

function resetDemo() {
  accountPassword='';
  const version=state.version;
  if(state.source?.startsWith('blob:'))URL.revokeObjectURL?.(state.source);
  for(const key of Object.keys(state))delete state[key];
  Object.assign(state,initialState(),{version,view:'prototype',expandedNodes:['A'],moduleProgress:{Lighting:[],Composition:[],Framing:[]},learnReady:false,critiquePhotos:[],practiceSessions:[],activePracticeId:null,practiceCounter:0,ownPosts:[],communityPostCounter:0});
  navigate(improved()?'signup':'welcome');
  toast('Demo reset.');
}
function generateModules(count=3,sample=true) {
  const returning=state.learnReady;
  state.learnReady=true;
  state.collectionCount=count;
  state.collectionSample=sample;
  state.collectionReviewCount=(state.collectionReviewCount||0)+1;
  state.recommendedSkill=state.recommendedSkill||'Lighting';
  if(!returning){
    state.moduleGeneration=1;
    state.moduleNotice='';
  } else if(!state.moduleUpdateApplied){
    state.moduleUpdateApplied=true;
    state.moduleGeneration=2;state.moduleUpdateUnread=true;
    state.moduleProgress.Depth=state.moduleProgress.Depth||[];
    state.moduleNotice='Added Depth and one Lighting challenge. Your progress is kept.';
  } else {
    state.moduleNotice='Your plan is up to date. No changes were needed.';
  }
  state.lessonReturn=false;
  navigate(state.moduleFromExperiment?'module-detail':'modules');
  toast(state.moduleNotice||'Your modules are ready.');
}
// Mobile outline tree. Expansion changes presentation, never the stored relationships.
const attemptById = id => state.attempts.find(a => a.id === id);
const attemptLabel = id => !improved() ? (id==='A'?'Original A':`Attempt ${id}`) : `Attempt ${Math.max(1,String(id).charCodeAt(0)-64)}`;
function branchAttemptLabel(id,attempts=state.attempts){
 if(!improved())return id==='A'?'Original A':`Attempt ${id}`;
 if(!id||id==='A')return 'Attempt 1';
 const path=[],seen=new Set();let current=id;
 while(current&&current!=='A'&&!seen.has(current)){
  seen.add(current);const node=attempts.find(a=>a.id===current);if(!node)break;
  const parent=node.parent||'A',siblings=attempts.filter(a=>(a.parent||'A')===parent);
  path.unshift(siblings.findIndex(a=>a.id===current)+1);current=parent;
 }
 return path.length?`Attempt 1.${path.join('.')}`:'Saved attempt';
}
function depthOf(id, seen = new Set()) {
  if (!id || id === 'A' || seen.has(id)) return 0;
  seen.add(id);
  const a = attemptById(id);
  return a ? 1 + depthOf(a.parent, seen) : 0;
}
function pathTo(id) {
  const path = [id || 'A'];
  while (path[0] !== 'A') {
    const parent = attemptById(path[0])?.parent || 'A';
    if (path.includes(parent)) break;
    path.unshift(parent);
  }
  return path;
}
function suggestionIds(parent = state.parent) {
  const previous = attemptById(parent)?.idea;
  return previous === 0 ? [1, 2] : previous === 1 ? [0, 2] : [0, 1];
}
function existingSuggestion(parent, idea) {
  return state.attempts.find(a => a.parent === parent && a.idea === idea && !a.human);
}
function openBranch(parent) {
  if (depthOf(parent) >= 3) {
    toast('This path has three adjustments. Select an earlier photo to explore another direction.');
    return;
  }
  state.suggestionsFrom='tree';state.selectedNode=parent;
  state.parent = parent;
  state.newSubject=false;state.conditions='Similar conditions';
  state.retry = false;
  state.human = false;
  state.module = false;
  state.idea = suggestionIds(parent).find(i => !existingSuggestion(parent, i)) ?? suggestionIds(parent)[0];
  navigate('ideas');
}
function expandPath(id) {
  state.expandedNodes = [...new Set(['A', ...pathTo(id)])];
}
function focusTree() {
  const row = document.querySelector(`[data-tree-row="${state.selectedNode || 'A'}"]`);
  row?.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
}
function outlineTree(parent = 'A', level = 0) {
  const a = attemptById(parent);
  const children = state.attempts.filter(n => n.parent === parent);
  const expanded = state.expandedNodes.includes(parent);
  const selected = (state.selectedNode || 'A') === parent;
  return `<li class="outline-item" role="treeitem" aria-level="${level + 1}" aria-selected="${selected}" ${children.length ? `aria-expanded="${expanded}"` : ''}>
    <div class="outline-row ${selected ? 'selected' : ''}" data-tree-row="${parent}">
      <button class="outline-toggle ${children.length ? '' : 'leaf'}" data-action="toggle-tree:${parent}" aria-label="${expanded ? 'Collapse' : 'Expand'} ${branchAttemptLabel(parent)}" ${children.length ? '' : 'disabled'}>${children.length ? (expanded ? '⌄' : '›') : '·'}</button>
      <button class="outline-select" data-action="node:${parent}">
        ${image(a ? variantFor(a) : 'original', '', 'outline-thumb')}
        <span class="outline-copy"><strong>${branchAttemptLabel(parent)}</strong><span>${a ? ideas[a.idea][0] : 'Your starting photograph'}</span><small>${a ? `From ${branchAttemptLabel(a.parent)}${a.human?' · Community advice':''}` : `${children.length} directions explored`}</small></span>
        <span class="outline-status">${selected ? '✓' : children.length ? children.length : ''}</span>
      </button>
    </div>
    ${expanded && children.length ? `<ul role="group" class="outline-children">${children.map(child => outlineTree(child.id, level + 1)).join('')}</ul>` : ''}
  </li>`;
}
function photoAction(title,description,action,primary=false){return `<button class="photo-action ${primary?'photo-action-primary':''}" data-action="${action}"><span><strong>${title}</strong><small>${description}</small></span><span class="photo-action-arrow" aria-hidden="true">›</span></button>`;}
function treeScreen() {
  const id = state.selectedNode || 'A', a = attemptById(id), depth = depthOf(id);
  const used = suggestionIds(id).filter(idea => existingSuggestion(id, idea)).length;
  return `${heading('YOUR PRACTICE TRAIL', 'One starting point.<br>Different directions.', 'Open a branch to explore it. Select any photograph to choose what happens next.')}
    <div class="tree-toolbar"><span>YOUR PHOTOGRAPHS <strong>${state.attempts.length + 1}</strong></span></div>
    <div class="outline-viewport" aria-label="Scrollable practice tree"><ul class="outline-tree" role="tree" aria-label="Photograph relationships">${outlineTree()}</ul></div>
    
    <section class="card selected-attempt" data-component="SelectedPhotoActions"><p class="eyebrow">SELECTED PHOTO</p>
    <div class="selected-photo-summary">${image(a?variantFor(a):'original','','selected-photo-thumb',id==='A'?(state.source||photo):photo)}<div><h3>${branchAttemptLabel(id)}</h3><p>${a?ideas[a.idea][0]:'Your starting photo'}</p>${a?`<small>Based on ${branchAttemptLabel(a.parent)}</small>`:''}</div></div>
    ${depth<3?photoAction(used===2?'Review tried ideas':'Try a new idea',used===2?`See the ideas already tried from ${branchAttemptLabel(id)}`:`Create a new attempt from ${branchAttemptLabel(id)}`,`branch-from:${id}`,true):'<p class="depth-note">This path is complete. Select an earlier photo to try another idea.</p>'}
    ${a?photoAction('Compare change',`${branchAttemptLabel(id)} and ${branchAttemptLabel(a.parent)}`,'compare-node'):''}
    ${canRequestFeedback(id)?btn('Get feedback on '+branchAttemptLabel(id),`feedback-photo:${id}`,'text-button selected-photo-feedback'):''}</section>

    `;
}
function suggestionScreen() {
  const ids = suggestionIds(), parent = state.parent, atLimit = depthOf(parent) >= 3;
  const selectedExisting = existingSuggestion(parent, state.idea);
  const help = state.idea === 0 ? ['What does exposure mean?', 'Tap the bright sky to focus. Drag the sun slider down a little. Keep the framing similar.', 'Lighting'] : state.idea === 1 ? ['What does changing the angle mean?', 'Move a little higher or lower. Keep your subject visible and notice how much sky stays in the frame.', 'Composition'] : ['What is foreground?', 'Include a nearby branch or railing near the edge. Keep it from covering your subject.', 'Framing'];
  return `${heading('PRACTICE · CHOOSE AN ADJUSTMENT', 'Try these<br>experiments.', 'Choose one adjustment to try on this photograph.')}
    <div class="context-strip">${image(parent === 'A' ? 'original' : variantFor(attemptById(parent)), '', 'thumb')}<div><strong>Starting from ${branchAttemptLabel(parent)}</strong><small>${esc(state.intent)}</small></div></div>${sourceBadge()}
    <div class="ideas">${ids.map(i => {const [title,desc,trade] = ideas[i], done = existingSuggestion(parent,i);return `<button class="idea ${state.idea === i ? 'selected' : ''}" data-action="idea:${i}"><div class="row between"><span class="idea-number">${['☼','▱','▧'][i]}</span>${done ? tag(`Saved as ${branchAttemptLabel(done.id)}`,'success') : '<span class="radio"></span>'}</div><h3>${title}</h3><p>${desc}</p><small>Tradeoff: ${trade}</small></button>`}).join('')}</div>
    ${btn(help[0], 'definition', 'inline')}<div class="howto"><p class="eyebrow">TRY IT ON YOUR PHONE</p><p>${help[1]}</p>${btn(`Open ${help[2]} module`, 'open-lesson', 'inline')}</div>
    <div class="push">${atLimit ? go('Choose an earlier photograph','tree') : selectedExisting ? btn(`Open saved ${branchAttemptLabel(selectedExisting.id)}`,`open-attempt:${selectedExisting.id}`) : btn(`Try this idea from ${branchAttemptLabel(parent)}`,'try')}${btn('Save suggestion for later','defer','secondary')}</div>`;
}
const moduleLessons = {
  Lighting: [
    ['Find the light.', 'Use the lakeside cabin photo. Look for its lit surfaces and shaded side; keep detail in both.', 'Notice how side light gives a subject shape.', ['Keep the subject easy to identify.','Retain detail in the bright side.','Notice where the shadow falls.']],
    ['Keep the bright details.', 'Photograph a bright scene. Lower exposure slightly and check that important shadow detail remains.', 'Balance bright detail with the mood you intended.', ['Find a bright area with texture.','Reduce brightness a little.','Check both the highlights and shadows.']],
    ['Try a different kind of light.', 'Use the same technique outdoors or with another subject. Record how the light changed.', 'Transfer the idea to a different shooting opportunity.', ['Identify the direction of light.','Adapt the adjustment to the scene.','Record what you would keep or change.']]
  ],
  Composition: [
    ['Make your subject stand out.', 'Photograph a subject against a simple background. Keep its outline clear.', 'A clear subject gives the viewer somewhere to look.', ['Choose one main subject.','Check its outline.','Remove distracting overlaps.']],
    ['Work with a busy background.', 'Find a subject in a busier setting. Move until its outline separates from the background.', 'A small change of viewpoint can reduce competing details.', ['Notice competing shapes.','Try two viewpoints.','Choose the one that serves your intention.']],
    ['Keep the sense of place.', 'Keep your subject clear while including enough surroundings to tell its story.', 'Subject clarity and context can work together.', ['Decide which context matters.','Balance the subject and setting.','Explain your preferred framing.']]
  ],
  Framing: [
    ['Choose what belongs.', 'Use the nearby branches to frame the cabin. Keep the cabin visible and the branches near the edges.', 'A natural frame can guide the eye inward.', ['Keep the subject visible.','Use the frame near the edges.','Check the corners.']],
    ['Find a foreground frame.', 'Use a nearby branch or railing to frame a more distant subject.', 'Near and far elements can create depth.', ['Choose a nearby element.','Avoid covering the subject.','Compare a wider and tighter frame.']],
    ['Make the frame your own.', 'Try a less obvious natural frame in another setting. Explain what it adds.', 'Use framing deliberately rather than adding it by habit.', ['Find a new subject.','Keep a clear visual priority.','Record the tradeoff.']]
  ]
};
function completedSteps(skill = state.moduleSkill) { return state.moduleProgress[skill] || []; }
const depthLessons = [
 ['Find near and far.','Include something nearby and something distant in the same frame.','Depth helps a flat photograph convey space.',['Identify a nearby element.','Keep the distant subject visible.','Notice the space between them.']],
 ['Use overlapping layers.','Try a viewpoint where foreground, middle ground and background form separate layers.','Overlapping layers can make distance easier to read.',['Find three layers.','Avoid confusing overlaps.','Keep one main subject.']],
 ['Choose your depth.','Compare a layered composition with a simpler view. Choose the one that serves your intention.','More depth is useful when it supports your intended effect.',['Try both approaches.','Compare what changes.','Explain your preference.']]
];
const extraLightingLesson=['Balance light across a layered scene.','Photograph a scene with a bright background and a darker foreground. Find an exposure that keeps the detail you value.','Apply the lighting choices you have already practised in a more demanding scene.',['Check detail in both bright and dark areas.','Keep your intended mood in mind.','Explain the tradeoff you chose.']];
function activeModules(){return ['Lighting','Composition','Framing',...(state.moduleUpdateApplied?['Depth']:[])];}
function lessonsFor(skill){const base=skill==='Depth'?depthLessons:moduleLessons[skill];return skill==='Lighting'&&state.moduleUpdateApplied?[...base,extraLightingLesson]:base;}
function moduleLength(skill=state.moduleSkill){return lessonsFor(skill)?.length||3;}
function stepUnlocked(skill,step){return step>=1&&step<=moduleLength(skill)&&(step===1||completedSteps(skill).includes(step-1));}
function moduleSteps(skill){return Array.from({length:moduleLength(skill)},(_,i)=>i+1);}
function moduleScreen() {
  return `${heading('MAKE ROOM TO LEARN','Skill Modules')}${state.lastModuleSkill?card(`<p class="eyebrow">${esc(state.lastModuleSkill.toUpperCase())}</p>${btn('Continue where you left off','module:'+state.lastModuleSkill,'secondary')}`):''}${state.moduleNotice?card(`<p>${esc(state.moduleNotice)}</p>`,'plan-update'):''}<div class="module-list">${activeModules().map(skill=>{const done=completedSteps(skill),total=moduleLength(skill);return `<button class="module-card module-overview" data-action="module:${skill}"><div class="row"><span class="activity-icon">${({Lighting:'☼',Composition:'▣',Framing:'▧',Depth:'▱'})[skill]}</span><div><h3>${skill}</h3><p class="small muted">${done.length} of ${total} challenges complete</p></div><span class="chevron">›</span></div><div class="progress-track ${done.length===total?'is-complete':''}" role="progressbar" aria-label="${skill} completion" aria-valuenow="${done.length}" aria-valuemin="0" aria-valuemax="${total}"><span style="width:${done.length/total*100}%"></span></div>${state.moduleUpdateUnread?(skill==='Depth'?tag('New module','success'):skill==='Lighting'?tag('1 new challenge','ai'):''):''}</button>`}).join('')}</div><div class="regenerate-modules"><p class="small muted">Your collection: ${state.collectionCount||3} photographs</p>${go('Upload photos to update my practice plan','assessment','secondary')}</div>`;
}
function moduleDetailScreen(){
 const skill=state.moduleSkill,total=moduleLength(skill),done=completedSteps(skill);
 return `${heading('LEARN · '+skill.toUpperCase(),skill)}<div class="module-completion ${done.length===total?'is-complete':''}"><span>${done.length} of ${total} complete</span><div class="progress-track"><span style="width:${done.length/total*100}%"></span></div></div><div class="challenge-list">${lessonsFor(skill).map(([title,prompt],index)=>{const step=index+1,unlocked=stepUnlocked(skill,step),complete=done.includes(step);return `<button class="challenge-row ${complete?'complete':unlocked?'available':'locked'}" data-action="module-step:${skill}:${step}" ${unlocked?'':'disabled'}><span class="challenge-number">${complete?'✓':step}</span><span><strong>${title}</strong><small>${complete?'Completed · Review':unlocked?'Ready to practise':'Complete the previous challenge to unlock'}${skill==='Lighting'&&step===4?' · Added from your new collection':''}</small></span></button>`}).join('')}</div>`;
}
function lessonScreen() {
  const skill=state.moduleSkill, step=Math.min(moduleLength(skill),Math.max(1,state.challenge)), [title,prompt,explanation,criteria]=lessonsFor(skill)[step-1];
  return `${heading(`${skill.toUpperCase()} · CHALLENGE ${step} OF ${moduleLength(skill)}`,title,'')}${image(moduleVariant(skill,step,false),`Explore ${skill.toLowerCase()}`)}${card(`<h3>${explanation}</h3><p>${prompt}</p>`)}<div class="howto"><p class="eyebrow">LOOK FOR THESE IN YOUR PHOTOGRAPH</p><ul>${criteria.map(c=>`<li>${c}</li>`).join('')}</ul></div><div class="push">${btn(state.lessonReturn?'Return to my experiment':'Take photo','lesson-capture')}</div>`;
}
function moduleResultScreen() {
  const skill=state.moduleSkill, step=state.challenge, done=completedSteps(skill), criteria=lessonsFor(skill)[step-1][3];
  return `${heading(`${skill.toUpperCase()} · CHALLENGE ${step} OF ${moduleLength(skill)}`,'Results & Feedback')}${tag(`✓ Challenge ${step} complete`,'success')}${image(moduleVariant(skill,step),`Your ${skill.toLowerCase()} challenge`)}${sourceBadge()}${card(`<h3>✓ What’s working</h3><p>${skill==='Lighting'?'The light gives the subject shape while the bright areas retain detail.':skill==='Composition'?'The subject is clearer against the background.':skill==='Depth'?'The near and far elements give the scene depth. Check that your subject remains the main focus.':'The surrounding frame directs attention toward your subject.'}</p><h3>Next adjustment</h3><p>${step<moduleLength(skill)?lessonsFor(skill)[step][2]:'Try this skill in a new setting and compare the choices you make.'}</p>`)}<div class="module-completion ${done.length===moduleLength(skill)?'is-complete':''}"><span>${done.length} of ${moduleLength(skill)} complete</span><div class="progress-track"><span style="width:${done.length/moduleLength(skill)*100}%"></span></div></div><div class="push">${step<moduleLength(skill)?btn(`Continue to challenge ${step+1}`,'next-challenge'):`<div class="completion-summary"><span>✓</span><h2>${esc(skill)} complete</h2><p>You’ve completed every challenge in this module.</p></div>${go('Explore modules','modules')}`}${btn('Try this challenge again','retry-module','secondary')}${go('Review this lesson','lesson','text-button')}</div>`;
}
function critiquePhotos(){const post=activeOwnPost();return post?.photos?.map(p=>p.id)||['A'];}
function communityPhoto(id,post=activeOwnPost()){return post?.photos?.find(p=>p.id===id)||null;}
function communitySource(id,post=activeOwnPost()){return communityPhoto(id,post)?.src||photo;}

function highlightSourceComment(id){
 const target=[...document.querySelectorAll('[data-comment-id]')].find(el=>el.dataset.commentId===id);
 if(target){target.classList.add('source-comment-highlight');target.scrollIntoView({block:'center',behavior:'smooth'});}
}
function communityAdviceReference(capture,peer=false,link=true){
 if(!capture?.parent)return '';
 if(!capture.feedbackText)return `<div class="community-advice-reference"><p class="small">Your own follow-up to <strong>${attemptLabel(capture.parent)}</strong></p></div>`;
 return `<section class="community-advice-reference" aria-label="Advice behind this photo"><p class="eyebrow">ADVICE USED FOR ${attemptLabel(capture.id).toUpperCase()}</p><p><strong>${esc(capture.feedbackAuthor||'Community member')}</strong> · Comment on <strong>${attemptLabel(capture.parent)}</strong></p><blockquote>“${esc(capture.feedbackText)}”</blockquote>${link?btn('View original comment',peer?`peer-source-comment:${capture.feedbackId}`:`view-source-comment:${capture.id}`,'inline'):''}</section>`;
}
function photoMetadata(capture){
 return `${capture?.notes?`<p class="photo-notes">${esc(capture.notes)}</p>`:''}${capture?.conditions&&capture.conditions!=='Not specified'?`<p class="photo-conditions">${esc(shootingConditionOptions.find(([id])=>id===capture.conditions)?.[1]||capture.conditions)}</p>`:''}`;
}
const shootingConditionOptions=[['Similar conditions','Same scene and lighting'],['Light changed','Lighting changed'],['Different subject','Different subject'],['Location changed','Different location']];
function shootingConditions(action,selected,parent){
 const label=shootingConditionOptions.find(([value])=>value===selected)?.[1]||'Select conditions';
 return `<div class="field condition-field"><span>Did the scene or lighting change?</span><small class="muted">Compared with ${action==='condition'?branchAttemptLabel(parent):attemptLabel(parent)}</small><details class="condition-dropdown"><summary aria-label="Shooting conditions: ${label}">${label}<span class="dropdown-chevron" aria-hidden="true"></span></summary><div class="condition-menu" role="group" aria-label="Shooting conditions">${shootingConditionOptions.map(([value,label])=>`<button type="button" data-action="${action}:${value}" aria-pressed="${selected===value}"><span>${label}</span><span aria-hidden="true">${selected===value?'✓':''}</span></button>`).join('')}</div></details></div>`;
}
document.addEventListener('click',e=>{document.querySelectorAll('.condition-dropdown[open]').forEach(menu=>{if(!menu.contains(e.target))menu.open=false;});});
document.addEventListener('keydown',e=>{const menu=e.target.closest?.('.condition-dropdown');if(!menu)return;const options=[...menu.querySelectorAll('.condition-menu button')];if(e.key==='Escape'){e.preventDefault();menu.open=false;menu.querySelector('summary').focus();}else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();menu.open=true;const index=options.indexOf(document.activeElement);options[e.key==='Home'?0:e.key==='End'?options.length-1:(index+(e.key==='ArrowDown'?1:-1)+options.length)%options.length]?.focus();}});
document.addEventListener('toggle',e=>{const menu=e.target;if(!menu.matches?.('.condition-dropdown')||!menu.open)return;const viewport=menu.closest('.screen-content'),panel=menu.querySelector('.condition-menu');if(viewport){const overflow=panel.getBoundingClientRect().bottom-viewport.getBoundingClientRect().bottom+12;if(overflow>0)viewport.scrollTop+=overflow;}},true);
function photoDetailFields(){
 return `${field('Details about this photo (optional)','photoNotes',state.photoNotes||'','What did you try or change?','textarea')}${state.postOrigin==='followup'?shootingConditions('photo-condition',state.photoConditions,state.postDraft.parent):''}`;
}
function beginFollowupPost(post,parent,comment=null){
 if(!post||!communityPhoto(parent,post))return;
 state.postContext=postingContext('critique');state.postOrigin='followup';
 state.postDraft={postId:post.id,parent,comment:comment?copyValue(comment):null,ready:false,source:null};
 state.question='';state.photoNotes='';state.photoConditions='Not specified';navigate('post');
}
function followupPostScreen(){
 const draft=state.postDraft||{},id=String.fromCharCode(65+(activeOwnPost()?.photos.length||1));
 return `${heading('COMMUNITY · '+attemptLabel(id).toUpperCase(),'Add an attempt')}${directPostSource()}${communityAdviceReference({id,parent:draft.parent,feedbackAuthor:draft.comment?.author,feedbackText:draft.comment?.body,feedbackId:draft.comment?.id},false,false)}${field('Your question · post title (30 characters max)','question',state.question,'Ask about this photograph.','textarea')}${photoDetailFields()}<div class="push">${btn('Add to carousel','post')}</div>`;
}
function publishFollowup(){
 const draft=state.postDraft,post=state.ownPosts.find(p=>p.id===draft?.postId);if(!post)return;
 if(!state.question.trim()){fieldError('question','Add a question for this photo.');return;}
 const id=String.fromCharCode(65+post.photos.length),comment=draft.comment;
 post.photos.push({id,parent:draft.parent,idea:comment?.idea??null,variant:draft.variant||'original',adjustments:[],src:draft.source,question:state.question,notes:state.photoNotes,conditions:state.photoConditions,feedbackAuthor:comment?.author||null,feedbackId:comment?.id||null,feedbackText:comment?.body||null});
 post.photoIds=post.photos.map(p=>p.id);if(comment)post.savedAdvice=(post.savedAdvice||[]).filter(item=>!(item.photoId===draft.parent&&item.comment.id===comment.id));state.postOrigin=null;state.postDraft=null;
 const context=state.postContext;state.postContext=null;if(context?.values)Object.assign(state,context.values);
 openOwnPost(post.id,id);toast('Attempt added to this carousel.');
}

function unifiedCritiqueScreen(){
 const photos=critiquePhotos(),index=Math.min(state.communityAttempt||0,photos.length-1),id=photos[index],a=communityPhoto(id),variant=a?variantFor(a):'original',comments=ownCommentsFor(id),post=activeOwnPost();
 return `${heading('COMMUNITY · PHOTO FEEDBACK',esc(a?.question||post?.question||'Photo feedback'))}${sharedExperimentLink(post)}<div class="critique-photo-tabs" aria-label="Critique photographs">${photos.map((pid,i)=>btn(attemptLabel(pid),`carousel:${i}`,i===index?'chip selected':'chip')).join('')}</div><section class="carousel-photo-context"><div class="annotated-photo">${image(variant,attemptLabel(id),'',communitySource(id))}</div>${id==='A'?'<p class="small muted">Starting photo</p>':''}${photoMetadata(a)}${communityAdviceReference(a)}</section><div class="row between carousel-position">${btn('Previous photo','critique-prev','text-button',index===0?'disabled':'')}<span>${index+1} of ${photos.length}</span>${btn('Next photo','critique-next','text-button',index===photos.length-1?'disabled':'')}</div>${post?btn("Add an attempt",'add-community-attempt','secondary'):''}<div class="responses-toolbar"><h2 class="responses-heading">${comments.length} responses to ${attemptLabel(id)}</h2>${btn('Add a comment','focus-comment','inline')}</div><div class="responses-list">${commentThreads(comments,attemptLabel(id),true)}</div>${post?commentComposer('own',post.id,id,attemptLabel(id)):''}`;
}

function revisedAction(type,value) {
  if (!improved()) return false;
  const renderAndSave=()=>{save();render()};
  switch(type) {
    case 'source-continue':if(!state.source){toast('Take a new photo or upload one to continue.');return true;}navigate('goal');return true;
    case 'goal-continue':if(!state.source){navigate('source');toast('Choose your starting photograph first.');return true;}navigate('ideas');return true;
    case 'peer-post':state.peerPostId=value;state.peerAttempt=0;navigate('peer-discussion');return true;
    case 'peer-attempt':state.peerAttempt=Math.max(0,Math.min((communityPosts.find(p=>p.id===state.peerPostId)||communityPosts[0]).variants.length-1,+value));renderAndSave();return true;
    case 'assess': generateModules(3,true);return true;
    case 'collection-upload': {const input=document.createElement('input');input.type='file';input.accept='image/*';input.multiple=true;input.onchange=()=>{if(input.files?.length)generateModules(input.files.length,false)};input.click();return true;}
    case 'branch-from': openBranch(value); return true;
    case 'branch': openBranch(attemptById(state.selectedNode)?.parent||'A'); return true;
    case 'refine': openBranch(state.selectedNode||'A'); return true;
    case 'node': state.selectedNode=value;expandPath(value);renderAndSave();focusTree();return true;
    case 'toggle-tree': {
      if(state.expandedNodes.includes(value))state.expandedNodes=state.expandedNodes.filter(id=>id!==value);
      else {const parent=attemptById(value)?.parent;const siblings=state.attempts.filter(a=>a.parent===parent&&a.id!==value).map(a=>a.id);state.expandedNodes=state.expandedNodes.filter(id=>!siblings.includes(id));state.expandedNodes.push(value);}
      renderAndSave();return true;
    }
    case 'open-attempt':openComparison(value,'ideas');return true;
    case 'idea': if(suggestionIds().includes(+value)){state.idea=+value;renderAndSave()}return true;
    case 'try': {
      if(depthOf(state.parent)>=3){toast('Choose an earlier photograph. This path already has three adjustments.');return true;}
      if(!suggestionIds().includes(state.idea)){state.idea=suggestionIds()[0];}
      const old=existingSuggestion(state.parent,state.idea);
      if(old){openComparison(old.id,'ideas');return true;}
      state.retry=false;state.newSubject=false;state.conditions='Similar conditions';state.module=false;state.human=false;navigate('capture');return true;
    }
    case 'retry-experiment': {const a=attemptById(state.selectedNode);if(!canRetake(a)){toast('This photo already has follow-ups. Its reference stays fixed.');return true;}if(a){state.newSubject=false;state.conditions='Similar conditions';state.retry=true;state.retryTarget=a.id;state.parent=a.parent;state.idea=a.idea;state.module=false;state.human=false;navigate('capture')}return true;}
    case 'confirm-capture': {
      if(state.initialCapture)return false;
      if(state.module){if(!stepUnlocked(state.moduleSkill,state.challenge)){state.modal=null;renderAndSave();toast('Complete the previous challenge first.');return true;}const done=completedSteps();state.moduleProgress[state.moduleSkill]=[...new Set([...done,state.challenge])].sort();navigate('results');return true;}
      if(state.retry){const a=attemptById(state.retryTarget);if(a&&canRetake(a)){a.zoom=!!state.cameraZoom;a.captureId=state.captureCounter;a.capturedAt=state.captureTime;a.sequence=state.captureSequence;a.conditions=captureConditions();a.reflection='';delete a.retries;state.selectedNode=a.id;}state.retry=false;state.retryTarget=null;navigate('compare');toast('Photo replaced in this experiment.');return true;}
      if(!state.human&&depthOf(state.parent)>=3){state.modal=null;renderAndSave();toast('This path is complete. Select an earlier photo in the tree.');return true;}
      if(!state.human){const old=existingSuggestion(state.parent,state.idea);if(old){openComparison(old.id,'ideas');return true;}}
      const next=state.attempts.reduce((n,a)=>Math.max(n,a.id.charCodeAt(0)),65)+1;
      const a={capturedAt:state.captureTime,zoom:!!state.cameraZoom,sequence:state.captureSequence,skill:['Lighting','Composition','Framing'][state.idea],id:String.fromCharCode(next),parent:state.parent,idea:state.idea,human:!!state.human,communityPostId:state.human?(state.selectedFeedback?.postId||state.activeCommunityPostId):null,feedbackOn:state.human?state.parent:null,feedbackAuthor:state.human?state.selectedFeedback?.author:null,feedbackId:state.human?state.selectedFeedback?.id:null,feedbackText:state.human?state.selectedFeedback?.body:null,adjustments:[...(attemptById(state.parent)?.adjustments||[]),state.idea],conditions:captureConditions(),reflection:'',retries:[]};
      state.attempts.push(a);completePrivateSuggestion(a);state.selectedNode=a.id;expandPath(a.id);
      navigate('compare');return true;
    }
    case 'open-lesson': state.moduleSkill=['Lighting','Composition','Framing'][state.idea];state.challenge=1;state.lessonReturn=true;navigate('lesson');return true;
    case 'module': if(state.moduleFromExperiment&&state.moduleReturnSkill!==value)state.moduleFromExperiment=null;state.moduleSkill=value;state.challenge=moduleSteps(value).find(step=>!completedSteps(value).includes(step))||moduleLength(value);state.lessonReturn=false;navigate('module-detail');return true;
    case 'lesson-capture': if(!state.lessonReturn&&!stepUnlocked(state.moduleSkill,state.challenge)){toast('Complete the previous challenge first.');return true;}return false;
    case 'module-step': {const [skill,num]=value.split(':');const step=+num;if(!activeModules().includes(skill)||!stepUnlocked(skill,step)){toast('Complete the previous challenge to unlock this step.');return true;}state.moduleSkill=skill;state.challenge=step;state.lessonReturn=false;navigate(completedSteps(skill).includes(step)?'results':'lesson');return true;}
    case 'next-challenge': if(state.challenge<moduleLength()&&stepUnlocked(state.moduleSkill,state.challenge+1)){state.challenge++;state.lessonReturn=false;navigate('lesson')}else navigate('modules');return true;
    case 'history-challenge': state.moduleSkill='Composition';state.challenge=completedSteps('Composition').includes(1)?2:1;state.lessonReturn=false;navigate('lesson');return true;
    case 'post-photo': state.postPhoto=+value;if(+value&&(!state.selectedNode||state.selectedNode==='A'))state.selectedNode=state.attempts.at(-1)?.id||'A';state.modal=null;renderAndSave();return true;
    case 'share-community':beginExperimentPost(state.selectedNode||state.attempts.at(-1)?.id||'A');return true;
    case 'own-post':{const [id,photoId]=value.split(':');openOwnPost(id,photoId);return true;}
    case 'post-tree':state.selectedNode=value;state.treeFromHistory=false;expandPath(value);navigate('tree');return true;
    case 'post':if(!state.question.trim()){fieldError('question','Add a question for your reviewer.');return true;}createOwnPost();return true;
    case 'carousel': state.communityAttempt=Math.max(0,Math.min(+value,critiquePhotos().length-1));renderAndSave();return true;
    case 'critique-prev': state.communityAttempt=Math.max(0,(state.communityAttempt||0)-1);renderAndSave();return true;
    case 'critique-next': state.communityAttempt=Math.min(critiquePhotos().length-1,(state.communityAttempt||0)+1);renderAndSave();return true;
    case 'add-comment':addLocalComment(value);return true;
    case 'focus-comment':{const input=document.querySelector('.comment-composer textarea');input?.scrollIntoView?.({block:'center',behavior:'smooth'});input?.focus?.({preventScroll:true});return true;}
    case 'send-reply':postCommentQuestion();return true;
    case 'reply-to':startCommentQuestion(value);return true;
    case 'cancel-reply':state.replyContext=null;state.reply='';save();renderPreservingScroll();return true;
    case 'human-try': {state.parent=critiquePhotos()[state.communityAttempt||0]||'A';const c=ownCommentsFor(state.parent).find(c=>c.id===value)||ownCommentsFor(state.parent)[0];state.selectedFeedback={id:c.id,author:c.author,body:c.body,photoId:state.parent};state.human=true;state.module=false;state.retry=false;state.newSubject=false;state.conditions='Similar conditions';state.idea=c.idea??1;navigate('capture');return true;}
    case 'definition': if(state.idea!==0){state.modal=state.idea===1?'viewpoint':'foreground';renderAndSave();return true;}return false;
    case 'reset': state.moduleProgress={Lighting:[],Composition:[],Framing:[]};state.expandedNodes=['A'];state.critiquePhotos=[];state.critiqueTarget='A';state.communityAttempt=0;return false;
    default: return false;
  }
}

const communityPosts=[
 {id:'window-portrait',author:'Mina Park',initials:'MP',time:'3 hours ago',following:true,file:'portrait.jpg',alt:'Portrait of a man against a dark background',title:'How much shadow should I keep?',focus:'Lighting',variants:['original','exposure'],feedback:[['Imani Brooks','Keep the shape the shadow creates.','The contrast gives the face depth. Try keeping a little texture in the darker cheek rather than brightening the whole frame.'],['Alex Chen','Check the eyes before the background.','The mood is strong, but make sure the eye on the darker side still has enough detail for the expression to read.']]},
 {id:'city-lines',author:'Noah Patel',initials:'NP',time:'Yesterday',following:false,file:'city.jpg',alt:'Glass skyscrapers converging toward a bright sky',title:'Do the lines lead your eye upward?',focus:'Framing',variants:['original','angle'],feedback:[['Sam Rivera','The lower edge is doing a lot of work.','The warm windows catch my eye before the converging lines. A tighter frame could make the upward movement more deliberate.'],['Mina Park','This crop emphasizes the height.','The towers now feel taller. Consider leaving a little more space at the top if you want a less enclosed feeling.']]},
 {id:'night-colour',author:'Imani Brooks',initials:'IB',time:'Yesterday',following:false,file:'night.jpg',alt:'Night street lit with blue and magenta lights',title:'Keep the colour without losing the street?',focus:'Exposure',variants:['original','exposure'],feedback:[['Noah Patel','Protect the signs, but watch the pavement.','A little less exposure can retain the coloured lights. Check whether the darker street still gives the viewer a path into the scene.'],['Sam Rivera','The colour is clearer in this attempt.','I would keep a little of the brighter pavement from your first shot. It helps the eye move through the frame.']]},
];
const peerPhotoDetails={
 'window-portrait':[{question:'How much shadow should I keep?'},{question:'Does the darker cheek still have enough texture?',notes:'I adjusted the exposure while keeping the shape of the shadow.',conditions:'Similar conditions'}],
 'city-lines':[{question:'Do the lines lead your eye upward?'},{question:'Does this tighter framing make the height clearer?',notes:'I reduced the lower edge to give the converging lines more emphasis.',conditions:'Similar conditions'}],
 'night-colour':[{question:'Keep the colour without losing the street?'},{question:'Are the signs clearer without losing the path through the street?',notes:'I lowered the exposure to retain the coloured lights.',conditions:'Similar conditions'}]
};
const thirdPeerCaptures={
 'city-lines':{variant:'angle exposure',question:'Does a little more space at the top feel better?',notes:'I left more room above the towers while keeping the lower crop.',conditions:'Similar conditions',feedback:['Imani Brooks','The extra space gives the lines room.','The upward direction feels clear without the top feeling cut off. Compare whether the bright sky still pulls attention away from the buildings.']},
};
for(const post of communityPosts){const third=thirdPeerCaptures[post.id];if(!third)continue;post.variants.push(third.variant);post.feedback.push(third.feedback);peerPhotoDetails[post.id].push(third);}

function peerPhotoContext(post,index){
 const details=peerPhotoDetails[post.id]?.[index]||{};
 return {...details,id:String.fromCharCode(65+index),parent:index?String.fromCharCode(64+index):null,feedbackAuthor:index?post.feedback[index-1][0]:null,feedbackText:index?post.feedback[index-1][2]:null,feedbackId:index?`peer-${post.id}-${index-1}-0`:null};
}
function peerPhoto(post,index=0){return `<figure class="photo ${post.variants[index]||'original'} ${post.file==='portrait.jpg'?'portrait-photo':''}"><img src="${asset(post.file)}" alt="${esc(post.alt)}"><figcaption>${attemptLabel(String.fromCharCode(65+index))} · ${post.focus}</figcaption></figure>`;}
function communityScreen(){
 const mine=state.feed==='my-posts',following=state.feed==='following',posts=following?communityPosts.filter(p=>isFollowing(p.author)):communityPosts;
 const own=following?'':state.ownPosts.map(ownPostCard).join('');
 return `${heading('A FRESH PAIR OF EYES','Community Critique')}${go('Post a photo','post')}<div class="segmented">${btn('For you','feed:for-you',!following&&!mine?'selected':'')}${btn('Following','feed:following',following?'selected':'')}${btn('My posts','feed:my-posts',mine?'selected':'')}</div><div class="community-feed">${own}${mine?(state.ownPosts.length?'':card('<h3>Your photographs, your conversations.</h3><p>Post a photograph or share an attempt from your Practice Tree. Your posts will appear here.</p>')):(following&&!posts.length?card('<h3>Begin following photographers</h3><p>Visit a profile in For you and follow someone to see their posts here.</p>'+btn('Explore For you','feed:for-you','secondary'),'empty-following'):'')+posts.map(post=>`<article class="feed-card"><div class="row"><span class="avatar ${post.following?'amber':''}">${post.initials}</span><div><button class="profile-link" data-action="peer-profile:${post.author}">${esc(post.author)}</button><small class="muted">${isFollowing(post.author)?'Following · ':''}${post.time}</small></div></div>${peerPhoto(post)}<h3>${post.title}</h3><p class="small muted">${post.focus} · ${post.variants.length} attempts · ${post.variants.reduce((n,v,i)=>n+peerCommentsFor(post,i).length,0)} comments</p>${btn('View photos & discussion',`peer-post:${post.id}`,'secondary')}</article>`).join('')}</div>`;
}
function peerDiscussionScreen(){
 const post=communityPosts.find(p=>p.id===state.peerPostId)||communityPosts[0],index=Math.min(state.peerAttempt||0,post.variants.length-1),comments=peerCommentsFor(post,index),label=attemptLabel(String.fromCharCode(65+index)),details=peerPhotoContext(post,index);
 return `${heading('COMMUNITY · '+post.focus.toUpperCase(),details.question||post.title)}<div class="row"><span class="avatar amber">${post.initials}</span><div><button class="profile-link" data-action="peer-profile:${post.author}">${esc(post.author)}</button><small class="muted">${post.time}</small></div></div><div class="segmented">${post.variants.map((v,i)=>btn(attemptLabel(String.fromCharCode(65+i)),`peer-attempt:${i}`,i===index?'selected':'')).join('')}</div><section class="carousel-photo-context">${peerPhoto(post,index)}${index===0?'<p class="small muted">Starting photo</p>':''}${photoMetadata(details)}${communityAdviceReference(details,true)}</section><div class="responses-toolbar"><h2 class="responses-heading">${comments.length} responses</h2>${btn('Add a comment','focus-comment','inline')}</div><div class="responses-list">${commentThreads(comments,label)}</div>${commentComposer('peer',post.id,index,label)}`;
}
function homeExperimentCard(){
 const sessions=state.practiceSessions,latest=sessions.find(s=>s.id===state.activePracticeId)||sessions.at(-1),snap=latest?.snapshot,last=snap?.attempts?.find(a=>a.id===snap.selectedNode)||snap?.attempts?.at(-1);
 return card(`<div class="row"><span class="activity-icon">◎</span><div><h3>My Experiments</h3><p class="small muted">${sessions.length?sessions.length+' saved practice '+(sessions.length===1?'session':'sessions'):'Keep your attempts and discoveries together.'}</p></div></div>${latest?`<div class="home-latest">${image(last?variantFor(last):'original','','tiny')}<div><p class="eyebrow">YOUR LAST PRACTICE</p><p>${esc(snap.intent||snap.goal)}</p></div></div>${btn('Continue where you left off',`resume-practice:${latest.id}`,'secondary')}`:''}${btn('View my experiments','experiments:home',latest?'text-button':'secondary')}`,'resume-card');
}

function activeOwnPost(){return (state.ownPosts||[]).find(p=>p.id===state.activeCommunityPostId);}
function createOwnPost(){
 const draft=state.postDraft||{},number=(state.communityPostCounter||0)+1,src=draft.source||photo;
 const post={id:'post-'+number,number,target:'A',photoIds:['A'],photos:[{id:'A',parent:null,idea:null,variant:draft.variant||'original',adjustments:copyValue(draft.adjustments||[]),src,question:state.question,notes:state.photoNotes||'',conditions:state.photoConditions||'Not specified'}],sourceLabel:draft.sourcePhotoId?'Shared from '+branchAttemptLabel(draft.sourcePhotoId):draft.sourceLabel||null,sourceNamingVersion:2,experimentSessionId:state.postOrigin==='experiment'?state.postContext?.sessionId:null,sourceAttemptId:state.postOrigin==='experiment'?draft.sourcePhotoId:null,sourceKind:src!==photo?'upload':'sample',question:state.question,intent:state.intent,audience:'Photography learners',comments:{},savedAdvice:[]};
 state.communityPostCounter=number;state.ownPosts.unshift(post);state.postOrigin=null;state.postDraft=null;state.postContext=null;state.feed='for-you';openOwnPost(post.id);toast('Posted for feedback.');
}

function openOwnPost(id,photoId=null){
 const post=state.ownPosts.find(p=>p.id===id);if(!post)return;
 if(state.communityCapture)restoreCommunityCapture();state.activeCommunityPostId=id;state.communityAttempt=Math.max(0,post.photos.findIndex(p=>p.id===photoId));state.showSavedAdvice=false;navigate('critique');
}

function postOptions(post){return btn('<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M5 6l1 14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-14M10 10v7M14 10v7"/></svg>','delete-post:'+post.id,'delete-post-icon','aria-label="Delete post" title="Delete post"');}

function deletePostDialog(){
 const post=state.ownPosts.find(p=>p.id===state.pendingDeletePostId);
 return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="Delete post"><button class="modal-close" data-action="close" aria-label="Cancel deletion">×</button><h2>Delete this post?</h2><p>This removes the post, its photos and comments.</p>${post?.experimentSessionId?'<p class="small muted">Your private experiment stays saved.</p>':''}<div class="delete-post-actions">${btn('Cancel','close','secondary')}${btn('Delete post','confirm-delete-post','danger')}</div></section></div>`;
}
function deleteOwnPost(){
 if(state.modal!=='delete-post')return;
 const id=state.pendingDeletePostId,post=state.ownPosts.find(p=>p.id===id);if(!post)return;
 const viewing=state.activeCommunityPostId===id&&['critique','carousel'].includes(state.route);
 state.ownPosts=state.ownPosts.filter(p=>p.id!==id);
 for(const key of Object.keys(state))if(key.startsWith('commentDraft:own:'+id+':'))delete state[key];
 for(const key of Object.keys(state.replyDrafts||{}))if(key.startsWith('own:'+id+':'))delete state.replyDrafts[key];
 if(state.replyContext?.scope==='own'&&state.replyContext.postId===id){state.replyContext=null;state.reply='';}
 if(state.activeCommunityPostId===id){state.activeCommunityPostId=null;state.communityAttempt=0;}
 state.pendingDeletePostId=null;state.modal=null;
 if(viewing)navigate('community');else{save();renderPreservingScroll();}
 toast('Post deleted.');
}
function ownPostCard(post){
 const first=post.photos[0];return `<article class="feed-card own-post-card" data-post-id="${post.id}"><div class="row"><span class="avatar amber">${esc(profileInitials())}</span><div><strong>You · ${esc(profileName())}</strong><small class="muted">Posted to community</small></div>${postOptions(post)}</div>${image(variantFor(first),attemptLabel(first.id),'',first.src||photo)}<h3>${esc(post.question)}</h3><p class="small muted">${post.photos.length} photographs · ${post.photos.reduce((n,p,i)=>n+(i===0?6:2)+(post.comments?.[p.id]?.length||0),0)} comments</p>${btn('View my post',`own-post:${post.id}`,'secondary')}</article>`;
}


const peerExtraComments={
 'window-portrait':[
  [['Sam Rivera','Watch the edge of the face.','Keep a little separation between the hair and background so the outline stays readable.'],['Noah Patel','The dark background supports the expression.','I would keep that mood and adjust only the darker cheek, rather than brightening everything.']],
  [['Sam Rivera','The shadow gives it character.','The darker side still needs enough texture to distinguish the cheek from the background.'],['Noah Patel','Compare the catchlights.','The eyes should remain the first place you look. Keep a small highlight in each if the light allows.']]
 ],
 'city-lines':[
  [['Imani Brooks','Check the corners.','The cut-off tower on the right pulls my eye outward. A slight rotation or step to the left could make the framing more deliberate.'],['Alex Chen','The warm windows are useful context.','I would keep some of them if you want the city to feel inhabited, even if the upward lines become less dominant.']],
  [['Imani Brooks','The upward direction is clearer.','Leave a small margin around the top edges so the buildings do not feel accidentally clipped.'],['Alex Chen','This feels more enclosed.','That works if you want to emphasize scale. The wider original gives a stronger sense of place.']]
 ],
 'night-colour':[
  [['Alex Chen','Keep a route through the frame.','The pavement lines give the viewer a path. Preserve enough detail there when reducing exposure.'],['Mina Park','Choose which colour leads.','The blue and magenta compete a little. A small change in viewpoint could give one a clearer role.']],
  [['Alex Chen','The bright signs retain more detail.','Check whether the darker shopfronts still contribute to your intended atmosphere.'],['Mina Park','The quieter foreground helps.','I prefer the stronger colour here, but would keep a little brightness on the street to carry the eye inward.']]
 ]
};
function commentObject([author,title,body],id,idea=1){return {id,author,title,body,idea};}
function peerSampleConversation(post,index){
 if(index!==0)return [];
 const dialogue={
  'window-portrait':['Would you keep both cheeks equally bright?','No. Keep one side darker, but retain some texture so the face still has shape.'],
  'city-lines':['Would you crop the windows out completely?','Leave a little if it helps the setting. Try a tighter crop and compare where your eye goes first.'],
  'night-colour':['Should I brighten the street separately?','First try a smaller exposure change. Check that the street remains readable while the signs keep their colour.']
 }[post.id];
 if(!dialogue)return [];
 const author=post.feedback[0][0],questionId=`peer-${post.id}-0-question`;
 return [{id:questionId,author:post.author,body:dialogue[0],parentCommentId:`peer-${post.id}-0-0`,replyTo:author,kind:'question'},
 {id:`peer-${post.id}-0-answer`,author,body:dialogue[1],parentCommentId:questionId,replyTo:post.author,kind:'reply'}];
}
function peerCommentsFor(post,index){
 const extra=index===2?[['Alex Chen','Compare the whole frame.','The adjustment feels deliberate. Check the edges once more before choosing the version you prefer.'],['Sam Rivera','Keep your intention in view.','This version reads clearly to me. Choose the photograph that gives the scene the feeling you wanted.']]:peerExtraComments[post.id]?.[index]||[];
 const base=[post.feedback[index],...extra].map((c,i)=>commentObject(c,`peer-${post.id}-${index}-${i}`));
 return [...base,...peerSampleConversation(post,index),...(state.peerCommentRecords?.[post.id]?.[index]||[])];
}
function ownCommentsFor(id){
 const first=id===(activeOwnPost()?.target||'A'),profile=critiqueProfile(id);
 const base=[['Alex Chen','1 · '+profile.title,profile.body],['Mina Park',profile.exposed?'Keep the shadow detail.':'Balance bright and dark details.',profile.exposed?'The darker exposure changes the mood. Check the shaded cabin before lowering it further; keep the texture that matters to your intention.':'Try a little less exposure and compare the sky with the shaded subject. Keep the atmosphere you intended.'],...(first?[['Noah Patel',profile.foreground?'Choose the role of the foreground.':'Explore a nearby layer.',profile.foreground?'Decide whether the nearby detail adds depth or competes with your subject. Try keeping it near an edge.':'If depth would support your intention, try a nearby element at the edge. Compare it with this simpler view.']]:[])];
 if(profile.unknown){base[0]=['Alex Chen','Try another viewpoint.','For your next capture, try a small change in viewpoint. Compare which version better serves the intention in your question.'];base[1]=['Mina Park','Compare exposure choices.','Try a small exposure adjustment on your next capture. Compare both versions against your intention.'];if(first)base[2]=['Noah Patel','Explore a foreground layer.','If it suits your scene, try including a nearby element at the edge. Decide whether it helps your subject.'];}
 const comments=base.map((c,i)=>commentObject(c,`own-${id}-${i}`,[1,0,2][i]??1));
 const conversation=first?sampleCommentConversation(id):[];
 return [...comments,...conversation,...(activeOwnPost()?.comments?.[id]||[])];
}
function sampleCommentConversation(id){return [
 {id:`own-${id}-q0`,author:'Noah Patel',body:'Would a small move be enough?',parentCommentId:`own-${id}-0`,replyTo:'Alex Chen',kind:'question'},
 {id:`own-${id}-r0`,author:'Alex Chen',body:'Yes. Start with a small move, then compare the photographs before changing anything else.',parentCommentId:`own-${id}-q0`,replyTo:'Noah Patel',kind:'reply'},
 {id:`own-${id}-q1`,author:'Sam Rivera',body:'How much would you lower the exposure?',parentCommentId:`own-${id}-1`,replyTo:'Mina Park',kind:'question'}
];}
function responseCard(comment,target,apply=false){
 const initials=comment.author==='You'?profileInitials():comment.author.split(' ').map(n=>n[0]).join(''),nested=!!(comment.parentCommentId||comment.replyTo),replyLabel=nested||comment.author==='You'?'Reply':'Ask a question';
 const controls=`<div class="comment-actions">${apply&&!nested&&comment.author!=='You'?btn(`Try ${comment.author.split(' ')[0]}’s advice`,`human-try:${comment.id}`,'secondary'):''}<div class="comment-utilities">${btn(replyLabel,`reply-to:${comment.id}`,'text-button')}</div></div>`;
 return `<article class="critique-card response-card" data-comment-id="${comment.id}"><div class="row"><span class="avatar ${comment.author==='You'?'amber':''}">${initials}</span><div>${comment.author==='You'?`<strong>${esc(profileName())}</strong>`:`<button class="profile-link" data-action="peer-profile:${esc(comment.author)}">${esc(comment.author)}</button>`}<small class="muted">On ${esc(target)}${comment.replyTo?' · Reply to '+esc(comment.replyTo==='You'?profileName():comment.replyTo):''}</small></div></div>${comment.title?`<h3>${esc(comment.title)}</h3>`:''}<p>${esc(comment.body)}</p>${controls}</article>`;
}
function discussionContext(){
 if(state.route==='peer-discussion'){
  const post=communityPosts.find(p=>p.id===state.peerPostId)||communityPosts[0],photoId=Math.min(state.peerAttempt||0,post.variants.length-1);
  return {scope:'peer',postId:post.id,photoId,comments:peerCommentsFor(post,photoId)};
 }
 const post=activeOwnPost();if(!post)return null;
 const photoId=critiquePhotos()[state.communityAttempt||0]||'A';
 return {scope:'own',postId:post.id,photoId,comments:ownCommentsFor(photoId)};
}
function questionContextKey(context){return `${context.scope}:${context.postId}:${context.photoId}:${context.commentId}`;}
function questionForComment(comment){
 const context=discussionContext(),reply=state.replyContext;
 return context&&reply&&reply.scope===context.scope&&reply.postId===context.postId&&String(reply.photoId)===String(context.photoId)&&reply.commentId===comment.id;
}
function commentThreads(comments,target,apply=false){
 const parentOf=comment=>comment.parentCommentId?comments.find(c=>c.id===comment.parentCommentId):comment.replyTo?comments.find(c=>c.author===comment.replyTo&&!c.replyTo&&c.id!==comment.id):null;
 const rendered=new Set();
 function thread(comment){
  if(rendered.has(comment.id))return '';rendered.add(comment.id);
  const children=comments.filter(c=>parentOf(c)?.id===comment.id&&!rendered.has(c.id));
  return `<section class="comment-thread" data-thread-id="${esc(comment.id)}">${responseCard(comment,target,apply)}${children.length?`<details class="comment-replies" data-thread-parent="${esc(comment.id)}"><summary><span class="thread-chevron" aria-hidden="true">›</span>${children.length} ${children.length===1?'reply':'replies'}</summary><div class="comment-children">${children.map(thread).join('')}</div></details>`:''}${questionForComment(comment)?`<div class="comment-children reply-branch"><section class="reply-composer" aria-label="${state.replyContext?.mode==='response'?'Reply to':'Question for'} ${esc(comment.author==='You'?profileName():comment.author)}">${field(state.replyContext?.mode==='response'?'Reply to '+(comment.author==='You'?profileName():comment.author):'Ask '+comment.author+' a question','reply',state.reply||'',state.replyContext?.mode==='response'?'Add your response to this conversation.':'What would you like to clarify about this advice?','textarea')}<div class="reply-actions">${btn(state.replyContext?.mode==='response'?'Post reply':'Post question','send-reply','secondary')}${btn('Cancel','cancel-reply','text-button')}</div></section></div>`:''}</section>`;
 }
 const roots=comments.filter(c=>!parentOf(c));
 return roots.map(thread).join('')+comments.filter(c=>!rendered.has(c.id)).map(thread).join('');
}
function startCommentQuestion(id){
 const context=discussionContext(),comment=context?.comments.find(c=>c.id===id);if(!comment)return;
 state.replyDrafts=state.replyDrafts||{};
 if(state.replyContext)state.replyDrafts[questionContextKey(state.replyContext)]=state.reply||'';
 state.replyContext={scope:context.scope,postId:context.postId,photoId:context.photoId,commentId:comment.id,mode:comment.parentCommentId||comment.replyTo||comment.author==='You'?'response':'question'};
 state.reply=state.replyDrafts[questionContextKey(state.replyContext)]||'';
 state.replyRecipient=comment.author;state.replyCommentId=comment.id;state.replyOn=context.photoId;state.modal=null;
 save();renderPreservingScroll();document.querySelector('.reply-composer textarea')?.focus?.({preventScroll:true});
}
function postCommentQuestion(){
 const context=discussionContext(),reply=state.replyContext,body=(state.reply||'').trim();
 if(!context||!reply||reply.scope!==context.scope||reply.postId!==context.postId||String(reply.photoId)!==String(context.photoId))return;
 const parent=context.comments.find(c=>c.id===reply.commentId);if(!parent)return;
 if(!body){fieldError('reply','Write your response before posting.');return;}
 const comment={id:'local-'+(state.commentCounter=(state.commentCounter||0)+1),author:'You',body,replyTo:parent.author,parentCommentId:parent.id,kind:reply.mode==='response'?'reply':'question'};
 if(context.scope==='peer'){
  state.peerCommentRecords=state.peerCommentRecords||{};const records=state.peerCommentRecords[context.postId]=state.peerCommentRecords[context.postId]||{};
  records[context.photoId]=[...(records[context.photoId]||[]),comment];
 }else{
  const post=activeOwnPost();post.comments=post.comments||{};post.comments[context.photoId]=[...(post.comments[context.photoId]||[]),comment];
 }
 if(state.replyDrafts)delete state.replyDrafts[questionContextKey(reply)];state.replyContext=null;state.reply='';state.modal=null;
 save();renderPreservingScroll();toast(reply.mode==='response'?'Reply posted.':'Question posted.');
}

function commentComposer(scope,postId,photoId,label){
 const key=`commentDraft:${scope}:${postId}:${photoId}`;
 return `<section class="comment-composer">${field(`Comment on ${label}`,key,state[key]||'','Share an observation or a practical suggestion.','textarea')}${btn('Post comment',`add-comment:${scope}:${postId}:${photoId}`,'secondary')}</section>`;
}
function addLocalComment(value){
 const [scope,postId,photoId]=value.split(':'),key=`commentDraft:${scope}:${postId}:${photoId}`,body=(state[key]||'').trim();
 if(!body){fieldError(key,'Write a comment before posting.');return;}
 const comment={id:'local-'+(state.commentCounter=(state.commentCounter||0)+1),author:'You',body};
 if(scope==='peer'){
  state.peerCommentRecords=state.peerCommentRecords||{};state.peerCommentRecords[postId]=state.peerCommentRecords[postId]||{};
  state.peerCommentRecords[postId][photoId]=[...(state.peerCommentRecords[postId][photoId]||[]),comment];
 } else {
  const post=state.ownPosts.find(p=>p.id===postId);if(!post)return;
  post.comments=post.comments||{};post.comments[photoId]=[...(post.comments[photoId]||[]),comment];
 }
 state[key]='';save();renderPreservingScroll();toast('Comment posted.');
}

const copyValue=value=>JSON.parse(JSON.stringify(value));
function helpTopic(){
 if(state.module)return ({Lighting:'definition',Composition:'viewpoint',Framing:'foreground',Depth:'depth-guide'})[state.moduleSkill]||'definition';
 return ['definition','viewpoint','foreground'][state.idea]||'definition';
}
function visualCameraGuide(){
 return `<div class="visual-camera-guide"><div class="guide-photo">${image('exposure','','',asset('lake-base.jpg'))}<span class="guide-focus"></span><span class="guide-sun">☼</span></div><label class="field"><span>Exposure preview</span><input type="range" min="-2" max="2" step="0.1" name="guideExposure" value="${state.guideExposure||0}" aria-label="Exposure preview"></label><div class="row between"><small>Darker</small><small>Brighter</small></div></div>`;
}
function photoFixture(variant,src){
 if(!improved()||src!==photo)return {src,scene:false};
 const angle=variant.split(' ').includes('angle'),foreground=variant.split(' ').includes('foreground');
 return {src:asset(angle?(foreground?'lake-angle.jpg':'lake-wide.jpg'):foreground?'landscape.jpg':'lake-base.jpg'),scene:true};
}
function moduleVariant(skill,step,after=true){
 if(skill==='Lighting')return after?(step>=3?'angle exposure':'exposure'):'original';
 if(skill==='Composition')return after?(step===1?'original':'angle'):'foreground';
 if(skill==='Framing')return after?'foreground':'original';
 return after?(step===1?'angle foreground':'foreground'):'original';
}
function postingReturnRoute(){return ['compare','tree','community','critique'].includes(state.postContext?.route)?state.postContext.route:'community';}
function postingReturnLabel(){return ({compare:'comparison',tree:'practice tree',community:'Community',critique:'photo feedback'})[postingReturnRoute()];}
function postingContext(route){
 const viewport=document.querySelector('.phone .screen-content'),values={};for(const key of ['selectedNode','comparisonFrom','treeFromHistory','parent','idea','conditions','reflection','retry','retryTarget','human','module','question','photoNotes','photoConditions'])values[key]=state[key];
 return {route,sessionId:state.activePracticeId,scrollTop:viewport?.scrollTop||0,values};
}
function beginDirectPost(){
 syncPractice();state.postContext=postingContext('community');state.postOrigin='direct';state.postDraft={ready:false,source:null};state.question='';state.photoNotes='';state.photoConditions='Not specified';navigate('post');
}
function canRequestFeedback(id){return id==='A'?!!state.source||state.attempts.length>0:!!attemptById(id);}
function beginExperimentPost(id){
 if(!canRequestFeedback(id)){toast('Choose a photograph first.');return;}
 syncPractice();state.postContext=postingContext(state.route==='tree'?'tree':'compare');state.postOrigin='experiment';const a=attemptById(id);
 state.postDraft={ready:true,source:id==='A'?(state.source||photo):photo,variant:a?variantFor(a):'original',adjustments:copyValue(a?.adjustments||[]),sourcePhotoId:id,sourceLabel:'Shared from '+branchAttemptLabel(id)};state.question='';state.photoNotes='';state.photoConditions='Not specified';navigate('post');
}
function cancelPost(){
 const context=state.postContext,route=postingReturnRoute();state.postOrigin=null;state.postDraft=null;state.postContext=null;
 if(context?.sessionId&&context.sessionId!==state.activePracticeId)resumePractice(context.sessionId,true);
 if(context?.values)Object.assign(state,context.values);navigate(route);const viewport=document.querySelector('.phone .screen-content');if(viewport)viewport.scrollTop=context?.scrollTop||0;
}
function feedbackPostScreen(){
 if(state.postOrigin==='followup')return followupPostScreen();
 const draft=state.postDraft||{},direct=state.postOrigin!=='experiment';
 return `${heading('COMMUNITY','Ask for feedback')}${direct?directPostSource():`<div class="feedback-photo-preview">${image(draft.variant||'original',branchAttemptLabel(draft.sourcePhotoId||'A'),'',draft.source||photo)}<p class="small muted">Sharing ${branchAttemptLabel(draft.sourcePhotoId||'A')}</p></div>`}${field('Your question · post title (30 characters max)','question',state.question,'For example: Is the framing clear?','textarea')}${photoDetailFields()}<div class="push">${btn('Post to community','post')}</div>`;
}
function openComparison(id,from='tree'){
 const a=attemptById(id);if(!a){toast('Select an attempt to compare.');return;}
 state.selectedNode=id;state.idea=a.idea;state.parent=a.parent;state.comparisonFrom=from;if(from!=='tree')state.treeFromHistory=false;navigate('compare');
}

function postSampleVariant(){const draft=state.postDraft||{};return state.postOrigin==='followup'?(draft.comment?variantFor({adjustments:[...(communityPhoto(draft.parent)?.adjustments||[]),draft.comment.idea??1]}):'angle'):'original';}
function postCameraDialog(){
 return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="Capture photograph"><button class="modal-close" data-action="close" aria-label="Close camera">×</button><p class="eyebrow">CAMERA</p><h2>Your new perspective.</h2>${image(postSampleVariant(),'New photo preview')}${btn('Use this photo','post-use-photo')}${btn('Cancel','close','secondary')}</section></div>`;
}
function directPostSource(){
 const draft=state.postDraft||{};
 return `<div class="source-preview">${draft.ready?image(draft.variant||'original',state.postOrigin==='followup'?'New attempt':'Attempt 1 · Starting photo','',''+(draft.source||photo)):'<div class="empty-photo compact"><span>▧</span><p>Choose the photograph for this post.</p></div>'}</div><div class="two-columns">${btn('Take new photo','post-camera','secondary')}${btn('Upload photo','post-upload','secondary')}</div>${!draft.ready&&state.validationErrors?.postPhoto?'<p class="field-error" role="alert">Choose a photo first.</p>':''}`;
}
function saveSpecificAdvice(commentId){
 const openModal=state.modal,created=ensureFeedbackContext(),id=critiquePhotos()[state.communityAttempt||0],post=activeOwnPost(),comment=resolveAdvice(commentId,id,created);if(!post||!comment)return;
 post.savedAdvice=post.savedAdvice||[];const existing=post.savedAdvice.some(p=>p.photoId===id&&p.comment.id===comment.id);
 if(!existing)post.savedAdvice.push({id:'advice-'+(state.adviceCounter=(state.adviceCounter||0)+1),photoId:id,comment:copyValue(comment)});
 state.modal=openModal;save();if(created)render();const toggle=document.querySelector('.saved-advice-toggle');if(toggle)toggle.textContent=`Saved advice · ${post.savedAdvice.length}`;toast(existing?'Advice already saved.':'Advice saved to this post.');
}

function saveAiSuggestion(){
 const session=activePractice();if(session){session.pendingAction={type:'ai',parent:state.parent,idea:state.idea,intent:state.intent};session.status='saved-for-later';session.resumeRoute='ideas';}
 state.saved=true;navigate('saved');
}
function savedActionScreen(){
 const pending=activePractice()?.pendingAction;
 if(!pending)return `${heading('PRACTICE SAVED','Your practice is saved.')}<div class="saved-icon">✓</div>${go('View My Experiments','experiments','secondary')}`;
 const lesson=pending.type==='lesson',title=lesson?lessonsFor(pending.skill)[pending.step-1][0]:ideas[pending.idea][0];
 return `${heading('READY WHEN YOU ARE',lesson?'Lesson saved.':'Your next step is saved.')}<div class="saved-icon">✓</div>${card(`${lesson?tag(pending.skill+' · Challenge '+pending.step):sourceBadge()}<h3>${esc(title)}</h3>${!lesson?`<p>${ideas[pending.idea][1]}</p><p class="small muted">From ${branchAttemptLabel(pending.parent)}</p>`:''}<p class="intention"><strong>YOUR INTENTION</strong>${esc(pending.intent||state.intent)}</p>`)}${!lesson?'<div class="note"><p>Try this when the original scene or another subject is available.</p></div>':''}<div class="push">${btn(lesson?'Open saved lesson':'Resume this suggestion','resume-pending')}${btn('View My Experiments','experiments:home','text-button')}</div>`;
}
function saveLesson(){
 const lesson={skill:state.moduleSkill,step:state.challenge,context:state.lessonReturn&&state.activePracticeId?{sessionId:state.activePracticeId,parent:state.parent,idea:state.idea}:null};
 state.savedLessons=state.savedLessons||[];const index=state.savedLessons.findIndex(l=>l.skill===lesson.skill&&l.step===lesson.step);
 if(index>=0)state.savedLessons[index]=lesson;else state.savedLessons.push(lesson);
 if(lesson.context){const session=activePractice();session.pendingAction={type:'lesson',...lesson,parent:state.parent,intent:state.intent};session.status='saved-for-later';session.resumeRoute='saved';state.lessonReturn=false;navigate('saved');}
 else {navigate(state.learnReady?'modules':'assessment');toast('Lesson saved.');}
}
function savedLessonCards(){return state.savedLessons?.length?card(`<p class="eyebrow">SAVED LESSONS</p>${state.savedLessons.map(l=>btn(`${l.skill} · ${lessonsFor(l.skill)[l.step-1][0]}`,`resume-lesson:${l.skill}:${l.step}`,'text-button')).join('')}`,'saved-lessons'):'';}
function resumeLesson(skill,step,contextOverride=null){
 const lesson=contextOverride?{skill,step,context:contextOverride}:state.savedLessons?.find(l=>l.skill===skill&&l.step===step);if(!lesson)return;
 if(lesson.context){if(state.activePracticeId!==lesson.context.sessionId)resumePractice(lesson.context.sessionId,true);state.parent=lesson.context.parent;state.idea=lesson.context.idea;}
 state.moduleSkill=skill;state.challenge=step;state.lessonReturn=!!lesson.context;state.module=false;navigate('lesson');
}
function resumePending(){
 const pending=activePractice()?.pendingAction;if(!pending)return;
 if(pending.type==='lesson'){resumeLesson(pending.skill,pending.step,pending.context);return;}
 if(pending.type==='ai'){state.parent=pending.parent;state.idea=pending.idea;state.module=false;state.human=false;navigate('ideas');return;}

}
function historyRecords(skill){
 const records=[];
 for(const session of state.practiceSessions){
  const snapshot=session.id===state.activePracticeId?{...session.snapshot,attempts:state.attempts}:session.snapshot;
  for(const attempt of snapshot.attempts||[]){
   if((attempt.skill||['Lighting','Composition','Framing'][attempt.idea])!==skill)continue;
   records.push({key:session.id+'-'+attempt.id,label:`Practice ${session.number} · ${branchAttemptLabel(attempt.id,snapshot.attempts||[])}`,sourceKind:'experiment',capturedAt:attempt.capturedAt||null,variant:variantFor(attempt),conditions:attempt.conditions||'Not recorded',reflection:attempt.reflection||'',intention:snapshot.intent||'',sequence:attempt.sequence||session.number*100+(attempt.id.charCodeAt(0)-65)});
  }
 }
 for(const attempt of state.moduleAttempts||[])if(attempt.skill===skill)records.push(attempt);
 return records.sort((a,b)=>a.sequence-b.sequence);
}
function comparisonSkills(){return [...new Set([...activeModules(),...(state.moduleAttempts||[]).map(record=>record.skill)])];}
function captureDate(record){
 const time=Number(record.capturedAt)||(record.sequence>1e13?Math.floor(record.sequence/100):0);
 return time&&Number.isFinite(time)?new Intl.DateTimeFormat('en-CA',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(time)):'Date not recorded';
}
function historySelection(skill,records){
 if(records.length===1)return {earlier:records[0]};
 const chosen=state.historySelections?.[skill]||{},earlier=records.find(record=>record.key===chosen.earlier);
 if(!earlier||records.indexOf(earlier)===records.length-1)return {};
 const later=records.find(record=>record.key===chosen.later);
 return {earlier,later:later&&records.indexOf(later)>records.indexOf(earlier)?later:undefined};
}
function setHistoryChoice(skill,side,key){
 if(!['earlier','later'].includes(side))return false;
 const records=historyRecords(skill),record=records.find(record=>record.key===key);if(!record)return false;
 const pair=historySelection(skill,records);
 let selected;
 if(side==='earlier'){
  if(records.indexOf(record)===records.length-1)return false;
  selected={earlier:key,later:pair.later&&records.indexOf(pair.later)>records.indexOf(record)?pair.later.key:null};
 }else{
  if(!pair.earlier||records.indexOf(record)<=records.indexOf(pair.earlier))return false;
  selected={earlier:pair.earlier.key,later:key};
 }
 state.historySelections=state.historySelections||{};state.historySelections[skill]=selected;
 save();renderPreservingScroll();return true;
}

function comparisonRecord(record,side,records=[],other=null){
 const conditions=shootingConditionOptions.find(([value])=>value===record?.conditions)?.[1]||(record?.conditions==='Study sample'?'Sample capture · conditions not recorded':record?.conditions||'Conditions not recorded');
 const first=side==='earlier',firstIndex=other?records.indexOf(other):-1;
 const chooser=records.length>1?`<label class="field comparison-photo-select"><span>${first?'1 · Earlier photo':'2 · Later photo'}</span><select name="historyPick:${state.skill||'Lighting'}:${side}" aria-label="Choose ${side} photograph" ${!first&&!other?'disabled':''}><option value="" disabled ${!record?'selected':''}>${!first&&!other?'Choose earlier photo first':first?'Choose earlier photo':'Choose later photo'}</option>${records.map((option,index)=>`<option value="${esc(option.key)}" ${record?.key===option.key?'selected':''} ${(first?index===records.length-1:!other||index<=firstIndex)?'disabled':''}>${esc(option.label)}</option>`).join('')}</select></label>`:'';
 if(!record)return `<section class="practice-photo-record">${chooser}<div class="comparison-photo-empty"><span>${first?'Select an earlier photo':'Select a later photo'}</span></div></section>`;
 return `<section class="practice-photo-record">${chooser}${image(record.variant,side==='earlier'?'Earlier photo':side==='later'?'Later photo':record.label)}<div class="practice-record-details"><strong>${esc(record.label)}</strong><time>${esc(captureDate(record))}</time><p class="record-conditions">${esc(conditions)}</p>${record.intention?`<p class="record-intention"><span>Focus</span>${esc(record.intention)}</p>`:''}<div class="record-reflection"><span>Reflection at the time</span><p>${esc(record.reflection||'No reflection recorded.')}</p></div></div></section>`;
}
function skillHistoryScreen(){
 const skill=state.skill||'Lighting',records=historyRecords(skill),{earlier,later}=historySelection(skill,records);
 const filters=`<div class="comparison-skill-filter" role="group" aria-label="Skill to compare">${comparisonSkills().map(value=>btn(esc(value),'compare-skill:'+value,'chip '+(value===skill?'selected':''),`aria-pressed="${value===skill}"`)).join('')}</div>`;
 const noteKey=earlier&&later?`historyNote:${skill}:${earlier.key}:${later.key}`:'';
 return `${heading('LOOK ACROSS YOUR PRACTICE','Compare my<br>practice.')}<div class="comparison-skill-heading"><h2>Choose a skill</h2>${filters}</div>${!records.length?card(`<h3>No recorded ${skill.toLowerCase()} attempts yet.</h3><p>Complete a ${skill.toLowerCase()} experiment or challenge to review it here.</p>`,'comparison-empty'):records.length===1?`${comparisonRecord(earlier,'only')}<p class="comparison-hint">One photo so far. Record another ${skill.toLowerCase()} attempt to compare.</p>`:`<div class="comparison history-comparison">${comparisonRecord(earlier,'earlier',records,later)}${comparisonRecord(later,'later',records,earlier)}</div>${earlier&&later?`${earlier.conditions!==later.conditions?'<div class="note comparison-conditions-note"><p>The recorded conditions differ. Consider the scene as well as your technique.</p></div>':''}${field('What changed in your approach?',noteKey,state[noteKey]||'','Consider the subject and conditions.','textarea')}${btn('Save reflection','save-reflection','secondary')}`:''}`}<div class="push">${btn('Practise '+skill,'history-challenge')}</div>`;
}

function recordCapture(){
 state.captureCounter=(state.captureCounter||0)+1;state.captureTime=Date.now();state.captureSequence=state.captureTime*100+state.captureCounter%100;
 if(state.module&&stepUnlocked(state.moduleSkill,state.challenge)){
  state.moduleAttempts=state.moduleAttempts||[];
  state.moduleAttempts.push({key:'module-'+state.captureCounter,label:`${state.moduleSkill} · Challenge ${state.challenge}`,skill:state.moduleSkill,step:state.challenge,capturedAt:state.captureTime,intention:lessonsFor(state.moduleSkill)[state.challenge-1][0],sourceKind:'module',variant:moduleVariant(state.moduleSkill,state.challenge,true)+(state.cameraZoom?' zoom-capture':''),conditions:state.newSubject?'Different subject':'Study sample',reflection:'',sequence:state.captureSequence});
 }
}
function materialAction(type,value){
 if(!improved())return false;
 switch(type){
  case 'create-account':{
   const name=(state.accountName||'').trim().replace(/\s+/g,' '),email=(state.accountEmail||'').trim();
   if(!name){fieldError('accountName','Enter your name.');return true;}
   if(name.length>60){fieldError('accountName','Use a name of 60 characters or fewer.');return true;}
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){fieldError('accountEmail','Enter a valid email address.');return true;}
   state.accountName=name;state.accountEmail=email;state.accountComplete=true;navigate('tour-practice');return true;
  }
  case 'onboarding-finish':state.onboardingComplete=true;navigate('welcome');return true;
  case 'new-community-post':beginDirectPost();return true;
  case 'go':if(value==='post'){beginDirectPost();return true;}if(state.route==='post'&&value===postingReturnRoute()){cancelPost();return true;}if(state.route==='capture'&&state.retry&&value==='compare'){state.retry=false;state.retryTarget=null;}return false;
  case 'cancel-post':cancelPost();return true;
  case 'feedback-photo':beginExperimentPost(value);return true;
  case 'compare-node':openComparison(state.selectedNode,'tree');return true;
  case 'choose-photo':case 'post-photo':return true;
  case 'goal-continue':state.suggestionsFrom=null;return false;
  case 'post-camera':if(state.route==='post'&&state.postOrigin!=='experiment'){state.modal='post-camera';save();render();}return true;
  case 'post-use-photo':if(state.route==='post'&&state.modal==='post-camera'){state.modal=null;action('post-sample');}return true;
  case 'post-sample':if(state.postOrigin==='experiment')return true;state.postDraft={...state.postDraft,ready:true,source:photo,variant:postSampleVariant()};save();render();return true;
  case 'post-upload':{if(state.postOrigin==='experiment')return true;const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=()=>{if(input.files?.length){if(state.route!=='post'||state.postOrigin==='experiment')return;state.postDraft={...state.postDraft,ready:true,source:URL.createObjectURL(input.files[0]),variant:'original'};save();render();}};input.click();return true;}
  case 'photo-condition':if(shootingConditionOptions.some(([id])=>id===value)){state.photoConditions=value;save();render();}return true;
  case 'post':if((state.question||'').length>30){fieldError('question','Keep your question to 30 characters or fewer.');return true;}if(!state.postDraft?.ready){fieldError('postPhoto','Choose a photo first.');return true;}if(state.postOrigin==='followup'){publishFollowup();return true;}return false;
  case 'add-community-attempt':{ensureFeedbackContext();const id=critiquePhotos()[state.communityAttempt||0];beginFollowupPost(activeOwnPost(),id);return true;}
  case 'peer-source-comment':{state.peerAttempt=Number(value.match(/-(\d+)-\d+$/)?.[1]||0);save();render();highlightSourceComment(value);return true;}
  case 'view-source-comment':{const capture=communityPhoto(value);if(!capture?.parent)return true;const index=critiquePhotos().indexOf(capture.parent);if(index<0)return true;state.communityAttempt=index;save();render();const target=[...document.querySelectorAll('[data-comment-id]')].find(el=>el.dataset.commentId===capture.feedbackId);if(target){target.classList.add('source-comment-highlight');target.scrollIntoView({block:'center',behavior:'smooth'});}return true;}
  case 'save-comment':saveSpecificAdvice(value);return true;
  case 'human-try':{const created=ensureFeedbackContext(),id=critiquePhotos()[state.communityAttempt||0],comment=resolveAdvice(value,id,created);if(comment)beginFollowupPost(activeOwnPost(),id,comment);return true;}
  case 'toggle-saved-advice':state.showSavedAdvice=!state.showSavedAdvice;refreshCommunityControls();return true;
  case 'try-saved-advice':{const post=activeOwnPost(),saved=post?.savedAdvice?.find(a=>a.id===value);if(saved)beginAdviceCapture(post,saved.photoId,saved.comment);return true;}
  case 'remove-saved-advice':{const post=activeOwnPost();if(post){post.savedAdvice=(post.savedAdvice||[]).filter(a=>a.id!==value);refreshCommunityControls();toast('Saved advice removed.');}return true;}
  case 'defer':if(state.route==='ideas'){saveAiSuggestion();return true;}return false;
  case 'resume-pending':resumePending();return true;
  case 'save-lesson':saveLesson();return true;
  case 'resume-lesson':{const [skill,step]=value.split(':');resumeLesson(skill,+step);return true;}
  case 'definition':state.modal=helpTopic();save();render();return true;
  case 'save-reflection':save();toast('Reflection saved for these attempts.');return true;
  case 'history-challenge':if(state.learnReady){state.moduleSkill=activeModules().includes(state.skill)?state.skill:'Lighting';state.challenge=moduleSteps(state.moduleSkill).find(s=>!completedSteps().includes(s))||1;state.lessonReturn=false;navigate('module-detail');}else navigate('assessment');return true;
  case 'finish':{const session=activePractice();if(session)delete session.pendingAction;return false;}
  case 'confirm-capture':if(state.communityCapture){confirmCommunityCapture();return true;}if(!state.initialCapture){if(!state.module&&!state.retry){state.comparisonFrom='capture';state.treeFromHistory=false;}recordCapture();}return false;
  default:return false;
 }
}


// Retakes replace a leaf capture; shared posts retain their own photograph copy.
function canRetake(attempt){return !!attempt&&!state.attempts.some(a=>a.parent===attempt.id);}
function captureConditions(){return state.newSubject?'Different subject':state.conditions||'Similar conditions';}
function critiqueProfile(id){
 const variant=communityPhoto(id)?variantFor(communityPhoto(id)):'original',foreground=variant.includes('foreground'),angle=variant.includes('angle'),exposed=variant.includes('exposure');
 const unknown=id==='A'&&activeOwnPost()?.sourceKind==='upload';
 const profile=angle&&foreground?{title:'Give each layer a role.',body:'Check whether the nearby boat leads your eye toward the cabin or competes with it. Try a small change of viewpoint to separate the layers.',x:46,y:70}:foreground?{title:'Keep the frame secondary.',body:'The nearby branches frame the lake. Try a small change of viewpoint and compare whether their edges guide your eye toward the cabin.',x:12,y:12}:angle?{title:'Check the cabin against the shore.',body:'Compare the cabin’s outline with the shoreline behind it. Try a small change of viewpoint and choose the separation that fits your intention.',x:75,y:70}:{title:'Give the cabin room.',body:'The cabin sits close to the surrounding shore and trees. Try a small change of viewpoint while keeping the mountain setting, then compare where your eye goes first.',x:70,y:70};
 return {...profile,unknown,foreground,exposed};
}
function critiqueAnnotation(id){const profile=critiqueProfile(id);return profile.unknown?'':`<button class="annotation-pin" style="left:${profile.x}%;top:${profile.y}%;bottom:auto" data-action="annotation" aria-label="Read Alex’s annotation on ${attemptLabel(id)}">1</button>`;}
function annotationDialog(){
 const id=critiquePhotos()[state.communityAttempt||0],comment=ownCommentsFor(id)[0],variant=communityPhoto(id)?variantFor(communityPhoto(id)):'original';
 return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="Photo annotation"><button class="modal-close" data-action="close" aria-label="Close dialog">×</button><p class="eyebrow">COMMUNITY · ${attemptLabel(id).toUpperCase()}</p>${image(variant,attemptLabel(id),'',communitySource(id))}${responseCard(comment,attemptLabel(id),true)}${btn('Back to critique','close','text-button')}</section></div>`;
}


function ensureFeedbackContext(){
 if(activeOwnPost())return false;state.postOrigin='direct';state.postDraft={ready:true,source:photo};if(!state.question?.trim())state.question='What would you try next?';createOwnPost();return true;
}
function resolveAdvice(commentId,id,created=false){const comments=ownCommentsFor(id);return comments.find(c=>c.id===commentId)||(created&&commentId?.startsWith('own-')?comments[+commentId.split('-').at(-1)]:null)||(!commentId?comments[0]:null);}
function refreshCommunityControls(){const viewport=document.querySelector('.phone .screen-content'),top=viewport?.scrollTop||0;save();render();const next=document.querySelector('.phone .screen-content');if(next)next.scrollTop=top;}
function savedCommunityAdvice(post){
 if(!post)return '';const saved=post.savedAdvice||[];
 return `<section class="saved-community-advice">${btn('Saved advice'+(saved.length?' · '+saved.length:''),'toggle-saved-advice','text-button saved-advice-toggle')}${state.showSavedAdvice?`<div class="saved-advice-list">${saved.length?saved.map(item=>`<div class="card"><p class="small muted">${attemptLabel(item.photoId)} · ${esc(item.comment.author)}</p><p>${esc(item.comment.body)}</p><div class="comment-utilities">${btn('Try this advice',`try-saved-advice:${item.id}`,'inline')}${btn('Remove',`remove-saved-advice:${item.id}`,'text-button')}</div></div>`).join(''):'<p class="small muted">No saved advice yet.</p>'}</div>`:''}</section>`;
}
function beginAdviceCapture(post,photoId,comment){
 if(!post||!communityPhoto(photoId,post))return;if(state.communityCapture)restoreCommunityCapture();
 state.communityReturn={};for(const key of ['idea','parent','selectedFeedback','human','module','newSubject','conditions','retry'])state.communityReturn[key]=state[key];
 state.communityCapture={postId:post.id,parent:photoId,comment:copyValue(comment)};state.parent=photoId;state.idea=comment.idea??1;state.selectedFeedback={postId:post.id,id:comment.id,author:comment.author,body:comment.body,photoId};state.human=true;state.module=false;state.retry=false;state.newSubject=false;state.conditions='Similar conditions';navigate('capture');
}
function restoreCommunityCapture(){if(state.communityReturn)Object.assign(state,state.communityReturn);state.communityCapture=null;delete state.communityReturn;}
function confirmCommunityCapture(){
 const capture=copyValue(state.communityCapture),variant=captureVariant();
 restoreCommunityCapture();const post=state.ownPosts.find(p=>p.id===capture.postId);
 beginFollowupPost(post,capture.parent,capture.comment);state.postDraft={...state.postDraft,ready:true,source:photo,variant};save();render();
}
function completePrivateSuggestion(attempt){const session=activePractice(),pending=session?.pendingAction;if(pending?.type==='ai'&&pending.parent===attempt.parent&&pending.idea===attempt.idea)delete session.pendingAction;}
function initializeCommunityPosts(){
 for(const post of state.ownPosts){
  if(!post.photos){
   const session=state.practiceSessions?.find(s=>s.id===post.sessionId),attempts=post.sessionId===state.activePracticeId?state.attempts:session?.snapshot?.attempts||[],oldIds=post.photoIds||[post.target||'A'],map=Object.fromEntries(oldIds.map((id,i)=>[id,String.fromCharCode(65+i)]));
   post.photos=oldIds.map((oldId,i)=>{const a=attempts.find(a=>a.id===oldId);return {id:map[oldId],parent:i?map[a?.parent]||'A':null,idea:a?.idea??null,adjustments:copyValue(a?.adjustments||[]),variant:a?variantFor(a):'original',src:photo,feedbackAuthor:a?.feedbackAuthor,feedbackId:a?.feedbackId};});
   post.comments=Object.fromEntries(Object.entries(post.comments||{}).map(([id,c])=>[map[id]||id,c]));post.savedAdvice=[];post.sourceLabel=post.sessionId?'Shared from '+attemptLabel(post.target||'A'):null;
   for(const session of state.practiceSessions||[]){const plans=session.plannedAdvice||[session.pendingAction].filter(p=>p?.type==='community');for(const plan of plans)if(plan.postId===post.id)post.savedAdvice.push({id:plan.planId||'advice-'+(state.adviceCounter=(state.adviceCounter||0)+1),photoId:map[plan.photoId]||'A',comment:copyValue(plan.comment)});}
  }
  if(post.sourceNamingVersion!==2){
   if(post.sourceLabel==='Shared from Starting photo')post.sourceLabel='Shared from Attempt 1';
   else if(/^Shared from Attempt \d+(?:\.\d+)*$/.test(post.sourceLabel||''))post.sourceLabel=post.sourceLabel.replace('Shared from Attempt ','Shared from Attempt 1.');
   post.sourceNamingVersion=2;
  }
  if(/^Shared from (?:Attempt [A-Z]|Original A)$/.test(post.sourceLabel||''))post.sourceLabel='Shared from a practice experiment';
  post.target='A';post.photoIds=post.photos.map(p=>p.id);post.savedAdvice=post.savedAdvice||[];delete post.sessionId;
 }
 for(const session of state.practiceSessions||[]){
  if(session.pendingAction?.type==='community'){delete session.pendingAction;session.resumeRoute=session.snapshot?.attempts?.length?'tree':'source';if(session.status!=='completed')session.status='in-progress';}delete session.plannedAdvice;
  for(const key of ['captureDestination','critiqueTarget','critiquePhotos','communityAttempt','communityFollow','activeCommunityPostId','postPhoto','posted','question','audience','reply','replyRecipient','replyCommentId'])if(session.snapshot)delete session.snapshot[key];
 }
 if(state.human&&state.route==='capture'&&!state.communityCapture){state.human=false;state.route='critique';}
 delete state.captureDestination;
}

function restoreFeedbackDraft(){
 if(state.postOrigin!=='experiment'||state.postDraft?.sourcePhotoId)return;
 const id=state.postPhoto?(state.selectedNode||state.attempts.at(-1)?.id||'A'):'A',a=attemptById(id);
 if(canRequestFeedback(id)){state.postDraft={ready:true,source:id==='A'?(state.source||photo):photo,variant:a?variantFor(a):'original',adjustments:copyValue(a?.adjustments||[]),sourcePhotoId:id,sourceLabel:'Shared from '+branchAttemptLabel(id)};state.postContext=state.postContext||postingContext('compare');}
}

function activityTotals(){
 const attempts=state.practiceSessions.reduce((n,session)=>n+(session.id===state.activePracticeId?state.attempts.length:session.snapshot.attempts?.length||0),0),challenges=Object.values(state.moduleProgress).reduce((n,steps)=>n+steps.length,0),modules=Object.values(state.moduleProgress).filter(steps=>steps.length>0).length;
 return {attempts,challenges,modules,posts:state.ownPosts.length};
}
function pendingPracticeCard(){
 const pending=activePractice()?.pendingAction;if(!pending||!['ai','lesson'].includes(pending.type))return '';
 const lesson=pending.type==='lesson',title=lesson?lessonsFor(pending.skill)[pending.step-1][0]:ideas[pending.idea][0];
 return card(`<p class="eyebrow">SAVED FOR LATER</p><h3>${esc(title)}</h3>${btn(lesson?'Open saved lesson':'Resume suggestion','resume-pending','secondary')}`);
}
function achievementScreen(){
 const totals=activityTotals(),count=Math.min(totals.attempts,10),badges=[['◎',totals.attempts,'Photo attempts'],['▤',totals.modules,totals.modules===1?'Module practised':'Modules practised'],['◌',totals.posts,totals.posts===1?'Community post':'Community posts'],['◇',totals.challenges,'Challenges complete']];
 return `${heading('SMALL STEPS, NEW PERSPECTIVES','Your Achievements')}<div class="badges">${badges.map(([icon,n,label])=>`<div class="badge"><span>${icon}</span><strong>${n}</strong><small>${label}</small></div>`).join('')}</div><p class="center muted">${count===10?'Practice milestone reached.':`${count} of 10 photo attempts toward your practice badge.`}</p><div class="progress-track" role="progressbar" aria-label="Practice milestone" aria-valuenow="${count}" aria-valuemin="0" aria-valuemax="10"><span style="width:${count*10}%"></span></div>`;
}

const experienceLevels=['Just starting','Learning the basics','Some practice','Confident hobbyist','Experienced photographer'];
const profileGoalOptions=['Understand my camera','Explore my creativity','Build a practice habit','Get constructive feedback'];
function experienceIndex(value){return Math.max(0,experienceLevels.indexOf(value));}
function profileGoals(){const goals=Array.isArray(state.learningGoals)?state.learningGoals:(state.learningGoal||'').split(', ');return [...new Set(goals.map(goal=>goal==='Improve light and composition'?'Explore my creativity':goal).filter(goal=>profileGoalOptions.includes(goal)))];}
function updateGoalControls(scope,selected){
 document.querySelectorAll(`[data-action^="goal-toggle:${scope}:"]`).forEach(button=>{
  const goal=profileGoalOptions[Number(button.dataset.action.split(':').at(-1))],active=selected.includes(goal);
  button.setAttribute('aria-pressed',String(active));button.classList.toggle('selected',active);
  const mark=button.querySelector('span');if(mark)mark.textContent=active?'✓':'+';
 });
}
function profilePreferences(settings=false){
 const name=settings?'settingsExperience':'experienceRating',rating=Number(settings?state.settingsExperience:state.experienceRating??experienceIndex(state.experience)),selected=settings?state.settingsGoals||[]:profileGoals();
 return `<section class="profile-preferences"><div class="row between"><h2>${settings?'Photography preferences':'A little about you'}</h2></div><label class="field experience-control"><span>Photography experience (optional)</span><output for="${name}">${experienceLevels[rating]}</output><input id="${name}" type="range" min="0" max="${experienceLevels.length-1}" step="1" name="${name}" value="${rating}" aria-valuetext="${experienceLevels[rating]}"><span class="experience-endpoints"><small>Just starting</small><small>Experienced</small></span></label><fieldset class="goal-choices"><legend>What would you like to work on?</legend><p class="small muted">Choose any that fit.</p>${profileGoalOptions.map((goal,index)=>btn(`<span aria-hidden="true">${selected.includes(goal)?'✓':'+'}</span>${goal}`,`goal-toggle:${settings?'settings':'setup'}:${index}`,`goal-chip ${selected.includes(goal)?'selected':''}`,`aria-pressed="${selected.includes(goal)}"`)).join('')}</fieldset></section>`;
}
async function saveAccountSettings(){
 if(state.authBusy)return;
 const name=(state.settingsName||'').trim().replace(/\s+/g,' '),email=(state.settingsEmail||'').trim().toLowerCase(),password=accountPassword;
 if(!name||name.length>60){fieldError('settingsName','Enter a name of 1–60 characters.');return;}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){fieldError('settingsEmail','Enter a valid email address.');return;}
 const accounts=state.localAccounts||[],account=accounts.find(a=>a.email===state.accountEmail);
 if(accounts.some(a=>a!==account&&a.email===email)){fieldError('settingsEmail','Another account on this device uses that email.');return;}
 if(password&&password.length<6){fieldError('accountPassword','Use at least 6 characters for your new password.');return;}
 state.authBusy=true;
 try{
  let credentials=null;
  if(password){const salt=crypto.randomUUID();credentials={salt,digest:await passwordDigest(password,salt)};}
  state.accountName=name;state.accountEmail=email;state.experience=experienceLevels[Number(state.settingsExperience)||0];state.learningGoals=[...(state.settingsGoals||[])];state.learningGoal=state.learningGoals.join(', ');
  if(account)Object.assign(account,{name,email,experience:state.experience,learningGoals:state.learningGoals,learningGoal:state.learningGoal},credentials||{});
  else if(credentials){accounts.push({name,email,experience:state.experience,learningGoals:state.learningGoals,learningGoal:state.learningGoal,...credentials});state.localAccounts=accounts;}
  accountPassword='';state.modal=null;save();render();toast('Account updated.');
 }catch(error){fieldError('accountPassword','Your changes could not be saved. Please try again.');}
 finally{state.authBusy=false;save();}
}
function sharedExperimentLink(post){
 const sessionId=post?.experimentSessionId||post?.sessionId;
 if(!sessionId||!state.practiceSessions.some(session=>session.id===sessionId))return '';
 return btn('View experiment',`open-shared-experiment:${post.id}`,'inline shared-experiment-link');
}
function rememberModuleOrigin(){
 const values={};
 for(const key of [...practiceFields,'expandedNodes','treeFromHistory','cameraZoom'])if(key!=='attempts'&&state[key]!==undefined)values[key]=copyValue(state[key]);
 state.moduleReturnContext={sessionId:state.activePracticeId,route:state.route,scrollTop:document.querySelector('.phone .screen-content')?.scrollTop||0,values};
}
function returnToModuleOrigin(){
 const id=state.moduleFromExperiment,context=state.moduleReturnContext;
 state.moduleFromExperiment=null;state.moduleReturnContext=null;
 if(!id){navigate('tree');return;}
 if(state.activePracticeId!==id)resumePractice(id,true);
 if(context?.sessionId===id){
  Object.assign(state,context.values);state.module=false;state.lessonReturn=false;state.initialCapture=false;
  navigate(['source','goal','ideas','capture','compare','tree','saved'].includes(context.route)?context.route:'tree');
  const viewport=document.querySelector('.phone .screen-content');if(viewport)viewport.scrollTop=context.scrollTop;
 }else resumePractice(id,true);
}
function moduleReturnLink(route){
 if(!improved())return '';
 if(!state.moduleFromExperiment||!state.practiceSessions.some(session=>session.id===state.moduleFromExperiment))return '';
 if(!['assessment','modules','module-detail','lesson','capture','results'].includes(route)||route==='capture'&&!state.module)return '';
 return `<div class="module-origin-link">${btn('‹ Back to experiment','return-experiment','inline')}</div>`;
}

// Shared account, navigation and responsive presentation components.
let accountPassword='';
function accountScreen(){
 const create=state.authMode==='create';
 return `<div class="signup-brand"><img src="${asset('lensup-logo.png')}" alt="LensUp"></div>${heading('WELCOME TO LENSUP','See more in<br>every shot.')}<div class="segmented">${btn('Sign in','auth-mode:signin',!create?'selected':'')}${btn('Create account','auth-mode:create',create?'selected':'')}</div>${create?field('Your name','accountName',state.accountName||'','What should we call you?'):''}${field('Email','accountEmail',state.accountEmail||'','you@example.com','email')}${field('Password','accountPassword',accountPassword,'At least 6 characters','password')}${create?profilePreferences(false):''}<div class="push">${btn(create?'Create account':'Sign in',create?'create-account':'sign-in')}</div>`;
}
async function passwordDigest(password,salt){
 const bytes=new TextEncoder().encode(salt+':'+password);
 return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function authenticate(create){
 if(state.authBusy)return;
 const email=(state.accountEmail||'').trim().toLowerCase(),name=(state.accountName||'').trim().replace(/\s+/g,' '),password=accountPassword;
 if(create&&(!name||name.length>60)){fieldError('accountName','Enter a name of 1–60 characters.');return;}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){fieldError('accountEmail','Enter a valid email address.');return;}
 if(password.length<6){fieldError('accountPassword','Enter a password of at least 6 characters.');return;}
 const accounts=state.localAccounts||[],existing=accounts.find(a=>a.email===email);
 if(create&&existing){fieldError('accountEmail','An account with this email already exists. Sign in instead.');return;}
 if(!create&&!existing){fieldError('accountEmail','No account found on this device. Create an account first.');return;}
 state.authBusy=true;
 try{
  const salt=create?crypto.randomUUID():existing.salt,digest=await passwordDigest(password,salt);
  if(!create&&digest!==existing.digest){fieldError('accountPassword','That password does not match. Try again.');return;}
  const account=create?{email,name,salt,digest,experience:experienceLevels[Number(state.experienceRating??experienceIndex(state.experience))],learningGoals:profileGoals(),learningGoal:profileGoals().join(', ')}:existing;
  if(create)accounts.push(account);
  const version=state.version;
  if(!create&&account.data){for(const key of Object.keys(state))delete state[key];Object.assign(state,initialState(),account.data);}
  else if(create){for(const key of Object.keys(state))delete state[key];Object.assign(state,initialState(),{moduleProgress:{Lighting:[],Composition:[],Framing:[]},practiceSessions:[],activePracticeId:null,practiceCounter:0,ownPosts:[],expandedNodes:['A']});}
  Object.assign(state,{version,view:'prototype',localAccounts:accounts,accountName:account.name,accountEmail:email,experience:account.experience,learningGoal:account.learningGoal,learningGoals:account.learningGoals||profileGoalOptions.filter(goal=>(account.learningGoal||'').includes(goal)),accountComplete:true,signedIn:true});
  accountPassword='';navigate(create?'tour-practice':state.onboardingComplete?'home':'tour-practice');
 }catch(error){fieldError('accountPassword','Sign-in could not finish. Please try again.');}
 finally{state.authBusy=false;save();}
}
function signOut(){
 syncPractice();const accounts=state.localAccounts||[],account=accounts.find(a=>a.email===state.accountEmail);
 if(account){const {localAccounts,authBusy,...data}=state;account.data=copyValue({...data,source:null,modal:null});account.name=state.accountName;account.experience=state.experience;account.learningGoal=state.learningGoal;account.learningGoals=profileGoals();}
 const version=state.version;for(const key of Object.keys(state))delete state[key];
 Object.assign(state,initialState(),{version,localAccounts:accounts,authMode:'signin',signedIn:false,moduleProgress:{Lighting:[],Composition:[],Framing:[]},practiceSessions:[],ownPosts:[],expandedNodes:['A']});accountPassword='';navigate('signup');
}
function settingsDialog(){return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="Account settings"><button class="modal-close" data-action="close" aria-label="Close">×</button><p class="eyebrow">YOUR ACCOUNT</p><h2>Account settings</h2>${field('Your name','settingsName',state.settingsName,'Your name')}${field('Email','settingsEmail',state.settingsEmail,'you@example.com','email')}${field('New password (optional)','accountPassword',accountPassword,'Leave blank to keep your password','password')}${profilePreferences(true)}${btn('Save changes','save-account')}${btn('Sign out','sign-out','secondary')}</section></div>`;}

function isFollowing(name){return state.followedPeople?state.followedPeople.includes(name):communityPosts.some(p=>p.author===name&&p.following);}
function peerProfileDialog(){const name=state.profilePerson||'Mina Park',posts=communityPosts.filter(p=>p.author===name);return `<div class="modal-backdrop"><section class="modal peer-profile" role="dialog" aria-modal="true" aria-label="Photographer profile"><button class="modal-close" data-action="close" aria-label="Close">×</button><span class="avatar amber">${esc(name.split(' ').map(x=>x[0]).join(''))}</span><h2>${esc(name)}</h2><p>Photography learner</p><p class="small muted">${posts.length} community ${posts.length===1?'post':'posts'}</p>${btn(isFollowing(name)?'Following · Unfollow':'Follow',`follow-person:${name}`,isFollowing(name)?'secondary':'primary')}${posts.map(p=>`${peerPhoto(p)}${btn('View post',`peer-post:${p.id}`,'secondary')}`).join('')}</section></div>`;}
function polishAction(type,value){
 switch(type){
 case 'compare-practice':state.moduleFromExperiment=null;state.skill=comparisonSkills().includes(state.skill)?state.skill:'Lighting';navigate('history');return true;
 case 'compare-skill':if(comparisonSkills().includes(value)){state.skill=value;save();renderPreservingScroll();}return true;
 case 'delete-post':if(state.ownPosts.some(p=>p.id===value)){state.pendingDeletePostId=value;state.modal='delete-post';save();renderPreservingScroll();}return true;
 case 'confirm-delete-post':deleteOwnPost();return true;
 case 'goal-toggle':{const [scope,index]=value.split(':');const key=scope==='settings'?'settingsGoals':'learningGoals',selected=scope==='settings'?(state.settingsGoals||[]):profileGoals(),goal=profileGoalOptions[Number(index)];if(goal){state[key]=selected.includes(goal)?selected.filter(x=>x!==goal):[...selected,goal];save();updateGoalControls(scope,state[key]);}return true;}
 case 'open-shared-experiment':{const post=state.ownPosts.find(p=>p.id===value);const sessionId=post?.experimentSessionId||post?.sessionId;if(!post||!state.practiceSessions.some(p=>p.id===sessionId))return true;state.moduleFromExperiment=null;resumePractice(sessionId,true);if(post.sourceAttemptId==='A'||attemptById(post.sourceAttemptId)){state.selectedNode=post.sourceAttemptId;expandPath(state.selectedNode);save();render();}return true;}
 case 'auth-mode':accountPassword='';state.authMode=value;state.skipPreferences=false;state.validationErrors={};save();render();return true;
 case 'create-account':state.authMode='create';authenticate(true);return true;
 case 'sign-in':authenticate(false);return true;
 case 'sign-out':signOut();return true;
 case 'account-menu':{const menu=document.querySelector('.account-menu');if(menu)menu.open=!menu.open;return true;}
 case 'account-settings':accountPassword='';state.settingsName=profileName();state.settingsEmail=state.accountEmail;state.settingsExperience=experienceIndex(state.experience);state.settingsGoals=profileGoals();state.modal='account-settings';render();return true;
 case 'save-account':saveAccountSettings();return true;
 case 'peer-profile':state.profilePerson=value;state.modal='peer-profile';render();return true;
 case 'follow-person':{state.followedPeople=state.followedPeople||communityPosts.filter(p=>p.following).map(p=>p.author);const followed=isFollowing(value);state.followedPeople=followed?state.followedPeople.filter(n=>n!==value):[...state.followedPeople,value];save();render();toast(followed?'Unfollowed '+value+'.':'Following '+value+'.');return true;}
 case 'camera-zoom':state.cameraZoom=!state.cameraZoom;save();render();return true;
 case 'viewpoint-toggle':state.guideAngle=!state.guideAngle;render();return true;
 case 'finish':{const session=activePractice();if(session){session.status='completed';session.resumeRoute='tree';delete session.pendingAction;}state.saved=true;navigate('tree');return true;}
 case 'practice-home':state.modal='exit';render();return true;
 case 'exit':if(state.module||['lesson','results','module-detail'].includes(state.route)){state.module=false;navigate('modules');toast('Progress saved.');return true;}return false;
 case 'open-lesson':rememberModuleOrigin();state.moduleSkill=['Lighting','Composition','Framing'][state.idea]||'Lighting';state.lessonReturn=false;state.moduleFromExperiment=state.activePracticeId;state.moduleReturnSkill=state.moduleSkill;state.challenge=moduleSteps(state.moduleSkill).find(n=>!completedSteps(state.moduleSkill).includes(n))||1;navigate(state.learnReady?'module-detail':'assessment');return true;
 case 'return-experiment':returnToModuleOrigin();return true;
 case 'module-step':state.lastModuleSkill=value.split(':')[0];return false;
 case 'go':if(value==='assessment')state.assessmentFrom=state.learnReady?'modules':'home';if(value==='modules'&&state.route!=='assessment')state.moduleFromExperiment=null;if(!['modules','module-detail','lesson','results','assessment','capture'].includes(value))state.moduleFromExperiment=null;return false;
 case 'history':state.moduleFromExperiment=null;state.skill=value;if(state.learnReady){state.moduleSkill=value;navigate('module-detail');}else navigate('assessment');return true;
 case 'resume-lesson':{state.moduleFromExperiment=null;const [skill]=value.split(':');state.moduleSkill=skill;state.lessonReturn=false;navigate('module-detail');return true;}
 case 'goal-continue':if(!state.intent?.trim())state.intent=state.goal;return false;
 case 'try':case 'retry-experiment':case 'retry-module':state.cameraZoom=false;return false;
 case 'confirm-capture':state.lastCaptureZoom=!!state.cameraZoom;return false;
 default:return false;
 }
}
function headerLogo(){return `<button class="header-logo" data-action="go:home" aria-label="LensUp home"><img class="app-logo" src="${asset('lensup-logo.png')}" alt="LensUp"></button>`;}
function accountDropdown(){return `<details class="account-menu"><summary aria-label="Account menu"><span class="avatar">${esc(profileInitials())}</span></summary><div>${btn('Account settings','account-settings','text-button')}${btn('Sign out','sign-out','text-button')}</div></details>`;}
function comparisonBack(){
 if(state.comparisonFrom==='capture'&&canRetake(attemptById(state.selectedNode)))return {label:'Back to camera',action:'retry-experiment'};
 if(state.comparisonFrom==='ideas')return {label:'Suggestions',action:'go:ideas'};
 return {label:'Practice tree',action:'go:tree'};
}
function top(route){
 if(!improved())return legacyTop(route);
 if(route==='signup'||route==='welcome')return '';
 if(onboardingRoutes.includes(route))return legacyTop(route);
 if(['critique','peer-discussion'].includes(route))return `<div class="app-top">${btn('‹ Community','go:community','text-button')}${route==='critique'&&activeOwnPost()?postOptions(activeOwnPost()):''}</div>`;
 const main=['home','modules','community','progress'];
 if(main.includes(route)||route==='assessment'&&!state.learnReady)return `<div class="app-top">${headerLogo()}${accountDropdown()}</div>`;
 if(route==='history')return `<div class="app-top">${btn('‹ Progress','go:progress','text-button')}${btn('Home','go:home','text-button')}</div>`;
 if(route==='assessment')return `<div class="app-top">${btn('‹ Modules','go:modules','text-button')}</div>`;
 if(route==='compare'){const back=comparisonBack();return `<div class="app-top">${btn('‹ '+back.label,back.action,'text-button')}${btn('Home','practice-home','text-button')}</div>`;}
 if(['source','goal','ideas','capture','tree','compare'].includes(route)){
  const back={source:['My Experiments','experiments'],goal:['Photo','source'],ideas:[state.suggestionsFrom==='tree'?'Practice tree':'Goal',state.suggestionsFrom==='tree'?'tree':'goal'],capture:[state.module?'Lesson':state.retry?'Comparison':'Suggestions',state.module?'lesson':state.retry?'compare':'ideas'],tree:['My Experiments','experiments'],compare:['Practice tree','tree']}[route];
  return `<div class="app-top">${btn('‹ '+back[0],'go:'+back[1],'text-button')}${route==='compare'&&canRetake(attemptById(state.selectedNode))?btn('Retake this photo','retry-experiment','text-button'):state.module?btn('Save & exit','exit','text-button'):btn('Home','practice-home','text-button')}</div>`;
 }
 return legacyTop(route);
}
function viewpointGuide(){return `<p class="eyebrow">TRY A DIFFERENT ANGLE</p><h2>Change what fills the frame.</h2><div class="viewpoint-preview">${image(state.guideAngle?'angle':'original',state.guideAngle?'Less sky · more foreground':'Starting angle')}</div><p>Move your phone to include less sky and more foreground. Keep the cabin visible.</p>${btn(state.guideAngle?'Show starting angle':'Try less sky', 'viewpoint-toggle','secondary')}${btn('Return to practice','close')}`;}
function progressScreen(){const totals=activityTotals();return `${heading('YOUR EYE IS DEVELOPING','My Progress')}<div class="stats">${[[state.practiceSessions.length,'Experiments'],[totals.attempts,'Photo attempts'],[totals.challenges,'Challenges complete']].map(([n,l])=>`<div><strong>${n}</strong><small>${l}</small></div>`).join('')}</div><section class="progress-compare-card"><p class="eyebrow">REFLECT ON YOUR PROGRESS</p><h2>See how your<br>approach is changing.</h2><p>Compare photographs across experiments and challenges.</p>${btn('Compare my practice','compare-practice')}</section><section class="progress-section"><div class="row between"><h2>Achievements</h2>${go('View all','achievements','inline')}</div><div class="achievement-summary">${[[totals.attempts,'Attempts'],[totals.challenges,'Challenges'],[totals.posts,'Posts']].map(([n,l])=>`<div><strong>${n}</strong><small>${l}</small></div>`).join('')}</div></section><section class="progress-section"><h2>Experiments</h2>${btn('View my experiments','experiments:progress','secondary')}${pendingPracticeCard()}</section><section class="progress-section"><h2>Skills</h2>${activeModules().map(skill=>`<button class="activity-card" data-action="history:${skill}"><span class="activity-icon">${({Lighting:'☼',Composition:'▣',Framing:'▧',Depth:'▱'})[skill]}</span><span><strong>${skill}</strong><small>${completedSteps(skill).length} of ${moduleLength(skill)} challenges complete</small></span><span>›</span></button>`).join('')}</section>`;}
function renderPreservingScroll(){
 const viewport=document.querySelector('.phone .screen-content'),top=viewport?.scrollTop||0,left=viewport?.scrollLeft||0;
 const threads=new Map([...document.querySelectorAll('.comment-replies')].map(el=>[el.dataset.threadParent,el.open]));
 render();
 document.querySelectorAll('.comment-replies').forEach(el=>{if(threads.has(el.dataset.threadParent))el.open=threads.get(el.dataset.threadParent);});
 const updated=document.querySelector('.phone .screen-content');if(updated){updated.scrollTop=top;updated.scrollLeft=left;}
}
function growTextarea(el){if(!el?.style)return;el.style.height='auto';el.style.height=Math.max(76,el.scrollHeight)+'px';}
function fitPreview(){const wrap=document.querySelector('.phone-fit');if(!wrap?.style)return;const scale=Math.min(1,Math.max(.25,(window.innerHeight-100)/844),Math.max(.25,(window.innerWidth-32)/390));wrap.style.setProperty('--phone-scale',scale);wrap.style.width=390*scale+'px';wrap.style.height=844*scale+'px';}
function screenNavigator(){
 const groups={onboarding:'Getting started',main:'Practice',modules:'Skill modules',community:'Community critique',progress:'My progress'};
 return `<aside class="demo-screen-nav"><p class="eyebrow">SCREENS</p><nav aria-label="Prototype screens">${Object.entries(groups).map(([group,label],index)=>`<section aria-labelledby="nav-group-${group}"><h2 id="nav-group-${group}"><span class="nav-section-number">${String(index+1).padStart(2,'0')}</span>${label}</h2>${availableRoutes().filter(route=>route[2]===group).map(([id,title])=>`<button data-action="open:${id}" ${state.route===id?'aria-current="page"':''}>${esc(title)}</button>`).join('')}</section>`).join('')}</nav></aside>`;
}
function focusSelectedScreen(previousScroll=0){
 const sidebar=document.querySelector('.demo-screen-nav'),selected=sidebar?.querySelector('[aria-current="page"]');
 if(!sidebar||!selected||!sidebar.clientHeight)return;
 sidebar.scrollTop=previousScroll;
 const bounds=sidebar.getBoundingClientRect(),item=selected.getBoundingClientRect();
 if(item.top<bounds.top+16||item.bottom>bounds.bottom-16)sidebar.scrollTop+=item.top-bounds.top-(sidebar.clientHeight-item.height)/2;
}
function render(){
 const sidebarScroll=document.querySelector('.demo-screen-nav')?.scrollTop||0;
 if(state.view==='screen'){document.body.className='screen-only';$('#app').innerHTML=renderScreen(state.route);}
 else if(state.view==='board'){legacyRender();}
 else{document.body.className='';$('#app').innerHTML=`<div class="demo-shell"><header class="demo-toolbar"><img src="${asset('lensup-logo.png')}" alt="LensUp">${btn('Reset demo','reset','reset-button')}</header><div class="demo-workspace">${screenNavigator()}<main class="demo-layout"><section class="phone-stage"><div class="phone-fit">${renderScreen(state.route)}</div></section><aside class="demo-intro"><img src="${asset('lensup-logo.png')}" alt="LensUp"><h1>See more in<br>every shot.</h1><ol><li><span>01</span><div><h2>Experiment</h2><p>Try one idea. Compare what changes.</p></div></li><li><span>02</span><div><h2>Learn</h2><p>Build your skills, one challenge at a time.</p></div></li><li><span>03</span><div><h2>Connect</h2><p>Share a photograph. Get another perspective.</p></div></li></ol></aside></main></div></div>`;}
 document.querySelectorAll('textarea').forEach(growTextarea);fitPreview();focusSelectedScreen(sidebarScroll);
}
window.addEventListener?.('resize',fitPreview);
document.addEventListener('click',e=>{document.querySelectorAll('.account-menu[open]').forEach(menu=>{if(!menu.contains(e.target))menu.open=false;});});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&state.route==='signup'&&e.target.tagName==='INPUT'){e.preventDefault();authenticate(state.authMode==='create');}if(e.key==='Escape')document.querySelectorAll('.account-menu[open]').forEach(menu=>menu.open=false);});


if(store.route==='modules'){state.moduleUpdateUnread=false;state.moduleNotice='';}
initializeCommunityPosts();
initializePracticeHistory();
restoreFeedbackDraft();
const params=new URLSearchParams(location.search);if(params.has('version'))state.version=params.get('version');if(params.has('screen'))state.route=params.get('screen');if(params.has('view'))state.view=params.get('view');
if(improved()&&!state.onboardingComplete&&onboardingRoutes.includes(store.route)&&!onboardingRoutes.includes(params.get('screen')))state.route=store.route;
if(improved()&&state.route==='welcome'&&!state.accountComplete&&!params.has('screen'))state.route='signup';
syncRouteUrl();
render();
