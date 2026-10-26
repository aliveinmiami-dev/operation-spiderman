/* Integrates with the existing workout and weight tracker. */
const XP=SpiderXP,XP_KEY='spiderman-xp-v1';
let xpState;
try{xpState=JSON.parse(localStorage.getItem(XP_KEY)||'null')}catch{xpState=null}
if(!xpState||xpState.version!==1)xpState=XP.fresh();
let previousTotal=null,previousAwards=new Set(),clockWall=Date.now(),clockMono=performance.now(),clockBlocked=false;
function xpToday(){return dateKey(new Date())}
function xpClockOK(){const drift=Date.now()-clockWall-(performance.now()-clockMono);if(Math.abs(drift)>300000)clockBlocked=true;return !clockBlocked}
function saveXP(){try{localStorage.setItem(XP_KEY,JSON.stringify(xpState))}catch{$('xpFeedback').textContent='Storage is unavailable or full. This session may not be saved.'}}
function xpRefresh(){const today=xpToday();xpState=XP.sync(xpState,checks,plan,today,new Date().toISOString());const ledger=XP.ledger(xpState,today),total=ledger.reduce((n,e)=>n+e.xp,0),level=XP.getLevel(total);const unlocked=XP.getUnlockedAchievements(xpState,today);const newAchievements=unlocked.filter(id=>!xpState.achievements.includes(id));xpState.achievements=[...new Set([...xpState.achievements,...unlocked])];saveXP();
$('xpLevel').textContent='LEVEL '+level.level+' — '+level.rank.toUpperCase();$('xpTotal').textContent=total+' / '+level.next+' XP';$('xpFill').style.width=(level.progress/5)+'%';$('xpProgress').setAttribute('aria-valuemax','500');$('xpProgress').setAttribute('aria-valuenow',String(level.progress));$('xpProgress').setAttribute('aria-valuetext',level.remaining+' XP to level '+(level.level+1));$('xpNext').textContent=level.remaining+' XP to '+(level.level<5?level.nextRank:'level '+(level.level+1));
const start=XP.week(key()),mission=[0,2,6].filter(n=>xpState.workouts[XP.add(start,n)]?.completed).length;
$('xpMission').textContent='Week of '+start+': '+mission+'/3 primary strength workouts · Bonus +150 XP';
$('xpNextUnlock').textContent='Next rank: '+(level.level<5?level.nextRank+' at '+level.next+' XP':'Neighborhood Legend retained at level '+(level.level+1));
$('xpAchievements').innerHTML=XP.achievements.map(([id,label])=>'<li class="'+(xpState.achievements.includes(id)?'earned':'')+'">'+(xpState.achievements.includes(id)?'✓ ':'○ ')+label+'</li>').join('');
$('xpActivity').innerHTML=ledger.slice(-8).reverse().map(e=>'<li>'+e.date+' · '+e.label+' <strong>+'+e.xp+' XP</strong></li>').join('')||'<li>Complete a mission to begin.</li>';
$('xpReward').textContent=selected===6?'REGENERATION PROTOCOL · Rest. Recover. Rebuild. · +50 XP':plan[selected].day.toUpperCase()+' — '+(XP.types[selected]==='strength'?'COMBAT MISSION':XP.types[selected].replace('-',' ').toUpperCase())+' · Reward +'+XP.rewards[selected]+' XP when all exercises are complete';
$('regeneration').hidden=selected!==6;$('completeRegeneration').textContent=xpState.recovery[key()]?.completed?'Regeneration complete ✓':'Complete Regeneration';$('completeRegeneration').disabled=!!xpState.recovery[key()]?.completed||key()>today||!xpClockOK();$('undoRegeneration').hidden=!xpState.recovery[key()]?.completed;
const fresh=ledger.filter(e=>!previousAwards.has(e.id));if(previousTotal!==null&&total>previousTotal&&fresh.length){const leveled=XP.getLevel(previousTotal).level<level.level; $('xpFeedback').textContent='Mission complete! +'+(total-previousTotal)+' XP'+(leveled?' · Level '+level.level+' — '+level.rank:'')+(newAchievements.length?' · Achievement unlocked!':'');}previousTotal=total;previousAwards=new Set(ledger.map(e=>e.id));
if(!xpClockOK())$('xpFeedback').textContent='Device time changed. Correct your clock and reopen the app before recording progress.';
}
renderXP=xpRefresh;
dailyXP=function(){const totals={};for(const e of XP.ledger(xpState,xpToday()))totals[e.date]=(totals[e.date]||0)+e.xp;return totals};
$('completeRegeneration').onclick=()=>{if(selected!==6||key()>xpToday()||!xpClockOK())return;xpState.recovery[key()]={completed:true,completedAt:xpState.recovery[key()]?.completedAt||new Date().toISOString()};render()};
$('undoRegeneration').onclick=()=>{if(!xpClockOK())return;delete xpState.recovery[key()];render()};
$('prDate').value=xpToday();$('prDate').max=xpToday();
$('savePR').onclick=()=>{const date=$('prDate').value,exercise=$('prExercise').value,reps=Number($('prReps').value);if(!XP.date(date)||date>xpToday()||!Number.isInteger(reps)||reps<1||reps>1000||!$('prVerified').checked||!xpClockOK()){$('prStatus').textContent='Choose a past or current date, enter whole reps (1–1,000), and confirm a single clean set.';return}const best=Math.max(0,...xpState.personalRecords.filter(p=>p.exercise===exercise&&p.verified).map(p=>p.reps));if(reps<=best){$('prStatus').textContent='Your verified best is '+best+'. A new PR must exceed it.';return}xpState.personalRecords.push({id:crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2),date,exercise,reps,verified:true,recordedAt:new Date().toISOString()});$('prReps').value='';$('prVerified').checked=false;$('prStatus').textContent='Verified PR saved: '+reps+' reps.';render()};
$('resetXP').onclick=()=>{if(!confirm('Reset XP, PRs, regeneration records and achievements? Workout checkmarks and weight history will stay. Already-complete workouts will not automatically earn XP again.'))return;xpState=XP.reset(xpState,checks,plan,xpToday());previousTotal=null;saveXP();$('xpFeedback').textContent='XP progress reset. Your workout and weight history is unchanged.';render()};
render();
