const screens = Array.from(document.querySelectorAll('.screen'));
const steps = ['welcome', 'needs', 'result'];
const buyers = { name: '', household: '1', needs: [], budget: 2500000 };

const nameInput = document.getElementById('buyerName');
const nameErr = document.getElementById('buyerNameErr');
const householdButtons = document.querySelectorAll('[data-household]');
const needButtons = document.querySelectorAll('.need');
const needCount = document.getElementById('needCount');
const budgetInput = document.getElementById('budgetInput');
const resultTitle = document.getElementById('resultTitle');
const resultName = document.getElementById('resultName');
const resultTimeline = document.getElementById('resultTimeline');
const resultBudget = document.getElementById('resultBudget');
const summaryText = document.getElementById('summaryText');
const priorityList = document.getElementById('priorityList');
const resultPriority = document.getElementById('resultPriority');
const resultEmoji = document.getElementById('resultEmoji');
const spendBar = document.getElementById('spendBar');
const barText = document.getElementById('barText');

function setScreen(screenName) {
  screens.forEach((screen) => {
    const isActive = screen.dataset.screen === screenName;
    screen.classList.toggle('active', isActive);
    screen.classList.toggle('back', !isActive && screen.classList.contains('active'));
  });
}

function initHousehold() {
  householdButtons.forEach((button) => {
    button.addEventListener('click', () => {
      householdButtons.forEach((btn) => btn.classList.toggle('on', btn === button));
      buyers.household = button.dataset.household;
    });
  });
}

function updateNeedCount() {
  const count = buyers.needs.length;
  needCount.textContent = `${count}/6`;
}

function syncNeeds() {
  needButtons.forEach((btn) => {
    const active = buyers.needs.includes(btn.dataset.need);
    btn.classList.toggle('on', active);
  });
  updateNeedCount();
}

function collectNeeds() {
  buyers.needs = Array.from(document.querySelectorAll('.need.on')).map((item) => item.dataset.need);
  syncNeeds();
}

function validateScreenOne() {
  const value = nameInput.value.trim();
  if (!value) {
    nameInput.classList.add('err');
    nameErr.classList.add('show');
    return false;
  }

  nameInput.classList.remove('err');
  nameErr.classList.remove('show');
  buyers.name = value;
  return true;
}

function getBudgetRecommendations() {
  const budget = Number(budgetInput.value || 0);
  buyers.budget = budget;

  const maxPriority = Math.min(6, Math.max(3, Math.round(budget / 500000)));
  const heavy = budget * 0.45;
  const balance = budget * 0.35;
  const essential = budget * 0.2;

  return { heavy, balance, essential, maxPriority };
}

function getSelectedNeedText() {
  if (!buyers.needs.length) return 'Nhu cầu thiết yếu';
  return buyers.needs.slice(0, 2).join(', ');
}

function renderResult() {
  const name = buyers.name || 'Bạn';
  const budget = Number(budgetInput.value || 0);
  const timelineValue = document.getElementById('purchaseWindow').value;
  const timelineText = {
    now: 'mua trong 2 tuần',
    month: 'mua trong 1 tháng',
    quarter: 'mua trong 3 tháng',
  }[timelineValue] || 'mua sớm';

  resultName.textContent = name;
  resultTimeline.textContent = timelineText;
  resultBudget.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(budget);

  const priorityItems = buyers.needs.length ? buyers.needs.slice(0, 3) : ['Đồ ăn', 'Thiết bị', 'Chăm sóc'];
  const topPriority = priorityItems[0];

  resultPriority.textContent = `Ưu tiên số 1: ${topPriority}`;
  summaryText.textContent = `${name} nên ưu tiên ${topPriority.toLowerCase()} trước, rồi tăng dần các khoản còn lại để tránh mua bừa và kiểm soát ngân sách.`;

  resultEmoji.textContent = topPriority === 'Thiết bị' ? '🧰' : topPriority === 'Sắc đẹp' ? '💄' : topPriority === 'Gia đình' ? '🏡' : topPriority === 'Học tập' ? '📚' : topPriority === 'Đồ ăn' ? '🍲' : '🧴';

  const recommendations = [
    `Mua ${topPriority.toLowerCase()} trong giai đoạn ưu tiên này`,
    `Giữ 35% ngân sách cho các mục tiêu không bắt buộc`,
    `Đặt giới hạn chi tối đa ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.round(budget * 0.75))}`,
  ];

  priorityList.innerHTML = '';
  recommendations.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    priorityList.appendChild(li);
  });

  const ratio = Math.min(100, Math.max(25, (budget / 5000000) * 100));
  spendBar.style.width = `${ratio}%`;
  barText.textContent = `Chi nhẹ: ${Math.round(ratio)}% ngân sách – đã nằm trong vùng an toàn.`;
  resultTitle.textContent = `Lộ trình mua sắm ${timelineText}`;
}

function setupFlow() {
  document.querySelectorAll('.next-step').forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.next;
      if (next === 'needs' && !validateScreenOne()) return;
      if (next === 'result') {
        if (buyers.needs.length < 2) {
          const selected = document.querySelectorAll('.need.on');
          if (selected.length < 2) {
            needCount.style.color = 'var(--red)';
            return;
          }
        }
        renderResult();
      }
      setScreen(next);
    });
  });

  document.querySelectorAll('.prev-step').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.target;
      setScreen(target);
    });
  });

  needButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const need = button.dataset.need;
      if (buyers.needs.includes(need)) {
        buyers.needs = buyers.needs.filter((item) => item !== need);
      } else {
        buyers.needs.push(need);
      }
      if (buyers.needs.length > 6) buyers.needs = buyers.needs.slice(-6);
      syncNeeds();
      needCount.style.color = 'var(--g900)';
    });
  });

  budgetInput.addEventListener('input', () => {
    const val = Number(budgetInput.value || 0);
    if (val < 0) budgetInput.value = 0;
  });

  document.getElementById('startOverBtn').addEventListener('click', () => {
    buyers.needs = [];
    buyers.name = '';
    buyers.household = '1';
    nameInput.value = '';
    budgetInput.value = '2500000';
    householdButtons.forEach((btn) => btn.classList.toggle('on', btn.dataset.household === '1'));
    syncNeeds();
    setScreen('welcome');
  });
}

initHousehold();
setupFlow();
setScreen('welcome');
nameInput.value = '';
renderResult();
