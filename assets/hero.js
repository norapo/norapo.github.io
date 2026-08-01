// ヒーローの目的地ローテーション
// 目的: 「共有するだけでどんな場所でも目的地になる」を見せる説明アニメーション。
// 方針（emil-design-eng）: transition ベース（中断時も滑らかに再ターゲット）、
// transform / opacity / filter のみ、reduced-motion では動きを除去して opacity フェードだけ残す。
(function () {
  'use strict';

  var DESTS = [
    { name: '喫茶 よりみち', meters: 640, angle: 24 },
    { name: '古書 みちくさ', meters: 280, angle: -52 },
    { name: 'スーパー ことぶき', meters: 450, angle: 68 },
    { name: '亀の湯', meters: 1100, angle: -18 },
    { name: 'レコードショップ 波音', meters: 320, angle: 132 },
    { name: '三日月神社', meters: 780, angle: -96 },
    { name: 'かもめフェリー乗り場', meters: 2400, angle: 44 },
    { name: '若葉城 大手門', meters: 1800, angle: -140 },
    { name: '洋食 コトコト', meters: 520, angle: 84 },
    { name: 'ラーメン こむぎ', meters: 370, angle: -64 },
    { name: 'あおばモール', meters: 1500, angle: 156 },
    { name: 'みはらし公園', meters: 900, angle: -28 },
    { name: '月見台駅', meters: 750, angle: 108 },
    { name: '若葉市役所', meters: 1300, angle: -116 },
    { name: 'かなでホール', meters: 680, angle: 52 },
    { name: 'しおかぜ博物館', meters: 2100, angle: -76 },
    { name: 'みなも美術館', meters: 950, angle: 20 },
    { name: '鈴音寺', meters: 430, angle: -160 },
  ];

  // ページ表示ごとに順番をシャッフル（Fisher–Yates）
  for (var s = DESTS.length - 1; s > 0; s--) {
    var r = Math.floor(Math.random() * (s + 1));
    var tmp = DESTS[s];
    DESTS[s] = DESTS[r];
    DESTS[r] = tmp;
  }
  // 初期表示は settle アニメーションの着地角（24°）に合わせる
  DESTS[0] = { name: DESTS[0].name, meters: DESTS[0].meters, angle: 24 };
  var INTERVAL_MS = 4000;
  var ROTATE_MS = 900;
  var COUNT_MS = 700;

  var nameEl = document.getElementById('hero-dest');
  var arrowEl = document.getElementById('hero-arrow');
  var distEl = document.getElementById('hero-distance');
  var toggleEl = document.getElementById('hero-toggle');
  if (!nameEl || !arrowEl || !distEl || !toggleEl) return;

  var unitEl = distEl.querySelector('tspan');
  var valueNode = distEl.firstChild; // "640" のテキストノード
  // ?reduce-motion は OS 設定なしで reduced-motion 経路を検証するためのテストフック
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || new URLSearchParams(window.location.search).has('reduce-motion');

  var index = 0;
  var currentMeters = DESTS[0].meters;
  var countRaf = 0;
  var playing = !reduceMotion; // reduced-motion ではデフォルト停止

  // シャッフル後の先頭を初期表示に反映（アニメーションなし。関数宣言は巻き上げ済み）
  nameEl.textContent = DESTS[0].name;
  renderDistance(currentMeters);

  function setPlaying(next) {
    playing = next;
    toggleEl.dataset.playing = String(next);
    toggleEl.setAttribute(
      'aria-label',
      next ? '目的地の切り替えアニメーションを一時停止' : '目的地の切り替えアニメーションを再生'
    );
  }

  function format(meters) {
    if (meters < 1000) return { value: String(Math.round(meters)), unit: 'm' };
    var km = meters / 1000;
    return { value: km < 10 ? km.toFixed(1) : String(Math.round(km)), unit: 'km' };
  }

  function renderDistance(meters) {
    var f = format(meters);
    valueNode.nodeValue = f.value;
    unitEl.textContent = f.unit;
  }

  function animateDistance(toMeters) {
    cancelAnimationFrame(countRaf);
    if (reduceMotion) {
      currentMeters = toMeters;
      renderDistance(toMeters);
      return;
    }
    var fromMeters = currentMeters;
    var start = performance.now();
    function tick(now) {
      var t = Math.min(1, (now - start) / COUNT_MS);
      var eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      renderDistance(fromMeters + (toMeters - fromMeters) * eased);
      if (t < 1) {
        countRaf = requestAnimationFrame(tick);
      } else {
        currentMeters = toMeters;
      }
    }
    countRaf = requestAnimationFrame(tick);
  }

  function swapName(nextName) {
    nameEl.style.opacity = '0';
    if (!reduceMotion) nameEl.style.filter = 'blur(2px)'; // クロスフェードの継ぎ目を隠す
    setTimeout(function () {
      nameEl.textContent = nextName;
      nameEl.style.opacity = '1';
      nameEl.style.filter = 'none';
    }, 260);
  }

  function rotateArrow(angle) {
    if (reduceMotion) {
      arrowEl.style.transition = 'none';
    } else if (!arrowEl.style.transition) {
      // 着地スプリング相当のオーバーシュート付きカーブ（アプリの減衰スプリングに合わせる）
      arrowEl.style.transition = 'transform ' + ROTATE_MS + 'ms cubic-bezier(0.34, 1.4, 0.64, 1)';
    }
    arrowEl.style.transform = 'rotate(' + angle + 'deg)';
  }

  function next() {
    if (!playing || document.hidden) return; // 一時停止中・タブ非表示中は進めない
    index = (index + 1) % DESTS.length;
    var d = DESTS[index];
    swapName(d.name);
    rotateArrow(d.angle);
    animateDistance(d.meters);
  }

  // 初期ロードの settle アニメーション終了後にローテーションを引き継ぐ
  function armArrow() {
    arrowEl.classList.remove('settle');
    arrowEl.style.transform = 'rotate(' + DESTS[0].angle + 'deg)';
  }
  if (reduceMotion) {
    armArrow();
  } else {
    arrowEl.addEventListener('animationend', armArrow, { once: true });
    setTimeout(armArrow, 2000); // animationend が来ない環境の保険
  }

  setPlaying(playing);
  toggleEl.addEventListener('click', function () {
    setPlaying(!playing);
  });

  setInterval(next, INTERVAL_MS);
})();
