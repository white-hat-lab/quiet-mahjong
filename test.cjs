const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(`${__dirname}/index.html`, 'utf8').split('<script>')[1].split('</script>')[0];
new vm.Script(source);
const context = vm.createContext({ assert });
vm.runInContext(source.slice(0, source.indexOf('function save()')), context);
vm.runInContext(`
board = Array(72).fill(null);
board[18] = 1; board[12] = 2; board[6] = 3;
let plan = pushPlan(18, -6, 1);
assert.equal(plan.values[0], 3);
assert.equal(plan.values[6], 2);
assert.equal(plan.values[12], 1);
assert.equal(plan.values[18], null);
let before = JSON.stringify(board);
assert.equal(attemptPush(18, -6, 1), false);
assert.equal(JSON.stringify(board), before);
board[13] = 1;
assert.equal(attemptPush(18, -6, 1), true);
assert.equal(board[12], null);
assert.equal(board[13], null);
assert.equal(board[0], 3);
assert.equal(board[6], 2);
board = Array(72).fill(null);
board[0] = 1; board[1] = 2; board[2] = 3;
plan = pushPlan(0, 1, 1);
assert.equal(plan.values[1], 1);
assert.equal(plan.values[2], 2);
assert.equal(plan.values[3], 3);
board = Array(72).fill(1);
assert.equal(pushPlan(18, -6, 5).distance, 0);
board = Array(72).fill(null); board[5] = 1;
assert.equal(pushPlan(5, 1, 1).distance, 0);
board = Array(72).fill(null); board[0] = board[7] = 2;
assert.equal(matchMovedTile(0), false);
board = Array(72).fill(null); board[0] = board[5] = 2; board[2] = 1;
assert.equal(matchMovedTile(0), false);
board = Array(72).fill(null);
board[0]=1;board[1]=2;board[7]=1;board[8]=2;
assert.equal(attemptPush(0,1,1),true);
assert.equal(board.filter(v=>v!==null).length,2);
assert.equal(board[7],null);
assert.equal(board[8],2);
for (let n = 0; n < 100; n++) {
  const data = makeBoard(13);
  assert.equal(data.length, 78);
  for (let v = 0; v < faces.length; v++) assert.equal(data.filter(x => x === v).length, v < 3 ? 6 : 4);
  let adjacent = 0;
  for (let i = 0; i < data.length; i++) {
    if (i % W < W - 1 && data[i] === data[i + 1]) adjacent++;
    if (i + W < data.length && data[i] === data[i + W]) adjacent++;
  }
  assert.equal(adjacent, 3);
  assert.equal(new Set(startingPairs(data).flat()).size, 6);
}
// No immediate pair, but sliding can line up the two tiles.
board=Array(78).fill(null);board[0]=1;board[7]=1;
let unchanged=JSON.stringify(board);
assert.equal(moves().length,0);
assert.equal(hasAvailableMove(board),true);
assert.equal(JSON.stringify(board),unchanged);
// A completely blocked board with no adjacent matches has no move.
board=Array.from({length:72},(_,i)=>i%18);
assert.equal(hasAvailableMove(board),false);
// The detector must consider pushed neighbours, not just the dragged tile.
board=Array(78).fill(null);board[0]=1;board[1]=2;board[8]=2;
assert.equal(hasAvailableMove(board),true);
// Empty boards are victories, not stuck boards.
assert.equal(hasAvailableMove(Array(78).fill(null)),false);
const originalRandom=Math.random;
Math.random=()=>0;
assert.ok(goodOpening(makeBoard(13)));
Math.random=originalRandom;
`, context);
console.log('Passed: group movement, rollback, matching, boundaries, and 100 shuffled boards.');

// Verify the visible notice and the automatic restart timing without real waits.
const endSource=source.slice(source.indexOf('function stopRestart()'),source.indexOf('function newGame()'));
const elements={stuck:{hidden:true},confirm:{open:false},main:{inert:false},'restart-now':{focus(){}},'restart-countdown':{textContent:''}};
let timeout,delay,restarted=0;
const endContext=vm.createContext({document:{getElementById:id=>elements[id],querySelector:name=>elements[name]},setTimeout:(fn,ms)=>{timeout=fn;delay=ms;return 1},setInterval:()=>2,clearTimeout:()=>{},clearInterval:()=>{}});
vm.runInContext(`let board=[0,1],restartTimer=null,countdownTimer=null,lastChecked='',selected=0,pendingRows=13;const $=id=>document.getElementById(id);function say(){}function hasAvailableMove(){return false}function newGame(){stopRestart();board=[1,1]}${endSource}checkBoardEnd()`,endContext);
assert.equal(elements.stuck.hidden,false);
assert.equal(elements.main.inert,true);
assert.match(elements['restart-countdown'].textContent,/4 seconds/);
assert.equal(delay,4000);
timeout();
assert.equal(elements.stuck.hidden,true);
assert.equal(elements.main.inert,false);
assert.equal(vm.runInContext('JSON.stringify(board)',endContext),'[1,1]');
console.log('Passed: no-move detection includes pushes, does not alter the board, and restarts after a visible four-second notice.');
