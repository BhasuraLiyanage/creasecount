let matchState = {
  currentInnings: 1,
  1: { runs: 0, wickets: 0, totalBalls: 0, ballHistory: [] },
  2: { runs: 0, wickets: 0, totalBalls: 0, ballHistory: [] },
  target: null
};
let actionHistory = [];
let pendingActionType = null;

const setupScreen = document.getElementById("setup-screen");
const matchScreen = document.getElementById("match-screen");
const runsModal = document.getElementById("runs-modal");
const oversModal = document.getElementById("overs-modal");
const oversLogContainer = document.getElementById("overs-log-container");

function captureState() {
  actionHistory.push(JSON.parse(JSON.stringify(matchState)));
}

document.getElementById("start-match-btn").addEventListener("click", () => {
  captureState();
  setupScreen.classList.add("hidden");
  matchScreen.classList.remove("hidden");
  renderScoreboard();
});

function handleScoreAction(runsToAdd, ballsCounted, specialLabel = null) {
  captureState();
  const inn = matchState.currentInnings;
  matchState[inn].runs += runsToAdd;
  matchState[inn].totalBalls += ballsCounted;
  matchState[inn].ballHistory.push({ runs: runsToAdd, ballsCounted: ballsCounted, label: specialLabel });
  renderScoreboard();
}

function openRunsModal(type) {
  pendingActionType = type;
  const desc = document.getElementById("modal-desc");
  const zeroBtn = document.getElementById("zero-run-opt");
  if (type === 'out') {
    desc.innerText = "Select additional runs scored during the wicket event.";
    zeroBtn.classList.remove("hidden");
  } else {
    desc.innerText = "Select the penalty runs associated with this Extra.";
    zeroBtn.classList.add("hidden");
  }
  runsModal.classList.remove("hidden");
}

function submitModalRuns(runsSelected) {
  runsModal.classList.add("hidden");
  const inn = matchState.currentInnings;
  
  if (pendingActionType === 'out') {
    captureState();
    matchState[inn].runs += runsSelected;
    matchState[inn].wickets = Math.min(10, matchState[inn].wickets + 1);
    matchState[inn].totalBalls += 1;
    matchState[inn].ballHistory.push({ 
      runs: runsSelected, 
      ballsCounted: 1, 
      label: runsSelected > 0 ? `W+${runsSelected}` : "W" 
    });
  } else if (pendingActionType === 'ex') {
    handleScoreAction(runsSelected, 0, `E${runsSelected}`);
  }
  renderScoreboard();
}

function formatOvers(balls) {
  return Math.floor(balls / 6) + "." + (balls % 6);
}

function renderScoreboard() {
  const inn = matchState.currentInnings;
  document.getElementById("innings-title").innerText = `${inn}${inn === 1 ? 'st' : 'nd'} Innings`;
  document.getElementById("display-runs").innerText = matchState[inn].runs;
  document.getElementById("display-wickets").innerText = matchState[inn].wickets;
  document.getElementById("display-overs").innerText = formatOvers(matchState[inn].totalBalls);
  
  const targetContainer = document.getElementById("target-container");
  if (matchState.target !== null) {
    targetContainer.classList.remove("hidden");
    document.getElementById("display-target").innerText = matchState.target;
  } else {
    targetContainer.classList.add("hidden");
  }
}

document.getElementById("complete-btn").addEventListener("click", () => {
  if (matchState.currentInnings === 1) {
    captureState();
    matchState.target = matchState[1].runs + 1;
    matchState.currentInnings = 2;
    renderScoreboard();
  }
});

document.getElementById("undo-btn").addEventListener("click", () => {
  if (actionHistory.length > 0) {
    matchState = actionHistory.pop();
    renderScoreboard();
  }
});

document.getElementById("reset-btn").addEventListener("click", () => {
  actionHistory = [];
  matchState = {
    currentInnings: 1,
    1: { runs: 0, wickets: 0, totalBalls: 0, ballHistory: [] },
    2: { runs: 0, wickets: 0, totalBalls: 0, ballHistory: [] },
    target: null
  };
  matchScreen.classList.add("hidden");
  setupScreen.classList.remove("hidden");
});

document.getElementById("overs-view-btn").addEventListener("click", () => {
  const inn = matchState.currentInnings;
  const history = matchState[inn].ballHistory;
  oversLogContainer.innerHTML = "";
  let rowsHTML = ""; let currentOverBalls = []; let overNumber = 1; let validBallsInCurrentOver = 0;
  
  history.forEach((event) => {
    let displayLabel = event.label ? event.label : event.runs;
    currentOverBalls.push(displayLabel);
    if (event.ballsCounted > 0) validBallsInCurrentOver++;
    if (validBallsInCurrentOver === 6) {
      rowsHTML += generateOverRowHTML(overNumber, currentOverBalls);
      overNumber++; currentOverBalls = []; validBallsInCurrentOver = 0;
    }
  });
  if (currentOverBalls.length > 0) rowsHTML += generateOverRowHTML(overNumber, currentOverBalls);
  oversLogContainer.innerHTML = rowsHTML || "<div style='padding:20px; color:#94a3b8;'>No balls delivered yet.</div>";
  oversModal.classList.remove("hidden");
});

function generateOverRowHTML(num, ballLabels) {
  let badges = ballLabels.map(l => `<span class="badge">${l}</span>`).join(" ");
  return `<div class="log-row"><div>Over ${num}</div><div class="ball-badges">${badges}</div></div>`;
}

document.getElementById("close-overs-btn").addEventListener("click", () => {
  oversModal.classList.add("hidden");
});

document.getElementById("support-trigger").addEventListener("click", () => {
  window.open("https://ko-fi.com/your_username_here", "_blank");
});
