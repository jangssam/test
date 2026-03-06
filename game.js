(function () {
  const EMOJIS = ['🌟', '🎮', '🎵', '🎨', '🚀', '🌈', '🍕', '🎯', '⚽', '🎪', '🎭', '🎸'];
  const PAIRS = 8; // 4x4 = 16장, 8쌍

  const board = document.getElementById('board');
  const movesEl = document.getElementById('moves');
  const timerEl = document.getElementById('timer');
  const restartBtn = document.getElementById('restart');
  const restartFromWinBtn = document.getElementById('restartFromWin');
  const messageOverlay = document.getElementById('messageOverlay');
  const messageTitle = document.getElementById('messageTitle');
  const messageText = document.getElementById('messageText');
  const messageStats = document.getElementById('messageStats');

  let cards = [];
  let flipped = [];
  let moves = 0;
  let timerInterval = null;
  let seconds = 0;
  let lock = false;

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function createCards() {
    const emojiSet = EMOJIS.slice(0, PAIRS);
    const pair = [...emojiSet, ...emojiSet];
    return shuffle(pair);
  }

  function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
      seconds++;
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function checkWin() {
    const allMatched = cards.every(c => c.matched);
    if (allMatched) {
      stopTimer();
      messageTitle.textContent = '축하합니다! 🎉';
      messageText.textContent = '모든 카드를 맞췄어요!';
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      messageStats.textContent = `이동 ${moves}번 · ${m}분 ${s}초`;
      messageOverlay.classList.add('show');
    }
  }

  function flipBack() {
    lock = true;
    setTimeout(() => {
      flipped[0].querySelector('.card').classList.remove('flipped');
      flipped[1].querySelector('.card').classList.remove('flipped');
      flipped = [];
      lock = false;
    }, 700);
  }

  function onCardClick(e) {
    if (lock) return;
    const cardEl = e.currentTarget;
    const wrapper = cardEl.closest('.card-wrapper');
    const idx = parseInt(wrapper.dataset.index, 10);
    const cardData = cards[idx];
    if (cardData.matched || cardEl.classList.contains('flipped')) return;

    startTimer();
    cardEl.classList.add('flipped');
    flipped.push(wrapper);

    if (flipped.length === 2) {
      moves++;
      movesEl.textContent = `이동: ${moves}`;
      const [first, second] = [cards[parseInt(flipped[0].dataset.index, 10)], cards[parseInt(flipped[1].dataset.index, 10)]];
      if (first.emoji === second.emoji) {
        first.matched = true;
        second.matched = true;
        flipped[0].querySelector('.card').classList.add('matched');
        flipped[1].querySelector('.card').classList.add('matched');
        flipped = [];
        checkWin();
      } else {
        flipBack();
      }
    }
  }

  function render() {
    board.innerHTML = '';
    cards.forEach((card, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'card-wrapper';
      wrapper.dataset.index = i;
      wrapper.innerHTML = `
        <div class="card">
          <div class="card-back"></div>
          <div class="card-front">${card.emoji}</div>
        </div>
      `;
      wrapper.querySelector('.card').addEventListener('click', onCardClick);
      board.appendChild(wrapper);
    });
  }

  function init() {
    stopTimer();
    seconds = 0;
    moves = 0;
    flipped = [];
    lock = false;
    timerEl.textContent = '00:00';
    movesEl.textContent = '이동: 0';
    messageOverlay.classList.remove('show');

    const values = createCards();
    cards = values.map(emoji => ({ emoji, matched: false }));
    render();
  }

  restartBtn.addEventListener('click', init);
  restartFromWinBtn.addEventListener('click', () => {
    messageOverlay.classList.remove('show');
    init();
  });

  init();
})();
