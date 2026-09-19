/* Motor de autoavaliação do manual IEFP CRM.
   A página define window.QUIZ = [{q, opts:[...], correct:idx, exp}] e um <div id="quiz">. */
(function () {
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    var root = document.getElementById('quiz');
    if (!root || !window.QUIZ || !Array.isArray(window.QUIZ)) return;
    var EN = (document.documentElement.lang || 'pt').slice(0,2) === 'en';
    var T = function (pt, en) { return EN ? en : pt; };

    // Baralhar a cada abertura: ordem das perguntas + ordem das opções.
    function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    var Q = shuffle(window.QUIZ.map(function (it) {
      var opts = it.opts.map(function (txt, idx) { return { txt: txt, ok: idx === it.correct }; });
      shuffle(opts);
      return { q: it.q, opts: opts.map(function (o) { return o.txt; }), correct: opts.map(function (o) { return o.ok; }).indexOf(true), exp: it.exp };
    }));
    // Opcional: a página pode definir window.QUIZ_COUNT para mostrar só N perguntas aleatórias.
    if (window.QUIZ_COUNT && window.QUIZ_COUNT < Q.length) Q = Q.slice(0, window.QUIZ_COUNT);

    var answered = 0, score = 0;

    var bar = document.createElement('div');
    bar.className = 'quiz-bar';
    function updateBar() {
      bar.textContent = T('Pontuação','Score') + ': ' + score + ' / ' + Q.length +
        (answered === Q.length ? '   ✓ ' + T('concluído','done') : '');
    }
    root.parentNode.insertBefore(bar, root);

    Q.forEach(function (item, qi) {
      var card = document.createElement('div'); card.className = 'quiz-q';
      var h = document.createElement('p'); h.className = 'quiz-q__title';
      h.textContent = (qi + 1) + '. ' + item.q; card.appendChild(h);

      var exp = document.createElement('div'); exp.className = 'quiz-exp'; exp.textContent = item.exp;

      item.opts.forEach(function (opt, oi) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'quiz-opt'; b.textContent = opt;
        b.addEventListener('click', function () {
          if (card.dataset.done) return;
          card.dataset.done = '1'; answered++;
          if (oi === item.correct) { b.classList.add('correct'); score++; }
          else { b.classList.add('wrong'); card.querySelectorAll('.quiz-opt')[item.correct].classList.add('correct'); }
          card.querySelectorAll('.quiz-opt').forEach(function (x) { x.disabled = true; });
          exp.classList.add('show'); updateBar();
        });
        card.appendChild(b);
      });
      card.appendChild(exp); root.appendChild(card);
    });

    var restart = document.createElement('button');
    restart.type = 'button'; restart.className = 'md-button quiz-restart';
    restart.textContent = T('Recomeçar','Restart');
    restart.addEventListener('click', function () { location.reload(); });
    root.appendChild(restart);

    updateBar();
  });
})();
