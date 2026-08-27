/* ================== TEXTOS DO SERVIDOR, E O EDITOR ==================
   A página nasce com os textos escritos no próprio ficheiro. Se o servidor
   tiver outros, substitui - e se não responder, fica o que cá está. Nunca
   há página vazia, que é a diferença entre isto e ir buscar tudo lá fora.

   O editor só existe com #admin no endereço. Sem isso, nem é construído.
   Gravar exige a palavra-passe de administração, a mesma do Repo.
   ==================================================================== */
(function () {
  var API = 'https://qgfzbyhfyqvmmmdiqycu.supabase.co/rest/v1/rpc/';
  var KEY = 'sb_publishable_atlEEoeN4-CWY8mD7KQNsw_m1cXjdIE';
  var CHAVE = 'landing';
  var TOK = 'crm-root-token';

  function rpc(nome, args) {
    return fetch(API + nome, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(args || {})
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok) throw new Error((d && (d.message || d.hint)) || 'ERRO');
        return d;
      });
    });
  }

  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Marcação mínima, de propósito: uma linha em branco separa parágrafos,
     uma quebra simples é uma quebra, e **assim** fica destacado. Não aceita
     HTML - o texto é escapado antes de qualquer coisa. */
  function paraHTML(t) {
    return String(t || '').trim().split(/\n\s*\n/).map(function (p) {
      return '<p>' + esc(p)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  function deHTML(el) {
    return Array.prototype.map.call(el.querySelectorAll('p'), function (p) {
      var h = p.innerHTML
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
      var d = document.createElement('div');
      d.innerHTML = h;
      return d.textContent.trim();
    }).join('\n\n');
  }

  function campos() {
    return Array.prototype.slice.call(document.querySelectorAll('[data-txt]'));
  }

  function aplicar(d) {
    if (!d) return;
    campos().forEach(function (el) {
      var k = el.getAttribute('data-txt');
      if (!(k in d)) return;
      if (el.hasAttribute('data-bloco')) el.innerHTML = paraHTML(d[k]);
      else el.textContent = d[k];
    });
  }

  function ler() {
    var o = {};
    campos().forEach(function (el) {
      o[el.getAttribute('data-txt')] =
        el.hasAttribute('data-bloco') ? deHTML(el) : el.textContent.trim();
    });
    return o;
  }

  rpc('site_ler', { p_chave: CHAVE }).then(aplicar).catch(function () {});

  if (location.hash !== '#admin') return;

  var rot = {
    titulo: 'Título', destaque: 'Palavra destacada', abre: 'Abertura',
    c1_rot: 'Rótulo da 1.ª coluna', c1_txt: '1.ª coluna',
    c2_rot: 'Rótulo da 2.ª coluna', c2_txt: '2.ª coluna',
    b_tit: 'Título do bloco do badge', b_txt: 'Bloco do badge'
  };

  function estado(t) {
    var e = document.getElementById('ed_e');
    if (e) e.textContent = t || '';
  }

  function entrar(depois) {
    var p = prompt('Palavra-passe de administração');
    if (!p) return;
    estado('a entrar…');
    rpc('login_root', { p_password: p })
      .then(function (d) {
        sessionStorage.setItem(TOK, d.token);
        estado('sessão aberta');
        if (depois) depois();
      })
      .catch(function () { estado('palavra-passe errada'); });
  }

  function guardar() {
    var t = sessionStorage.getItem(TOK);
    if (!t) return entrar(guardar);
    estado('a guardar…');
    rpc('site_guardar', { p_token: t, p_chave: CHAVE, p_dados: ler() })
      .then(function () {
        estado('guardado às ' + new Date().toTimeString().slice(0, 5));
      })
      .catch(function (e) {
        if (String(e.message).indexOf('SEM_PERMISSAO') >= 0) {
          sessionStorage.removeItem(TOK);
          return entrar(guardar);
        }
        estado('não guardou: ' + e.message);
      });
  }

  function montar() {
    var d = ler();
    var painel = document.createElement('aside');
    painel.id = 'ed';
    var linhas = Object.keys(rot).map(function (k) {
      var alvo = document.querySelector('[data-txt="' + k + '"]');
      var multi = alvo && alvo.hasAttribute('data-bloco');
      return '<label for="f_' + k + '">' + rot[k] + '</label>' + (multi
        ? '<textarea id="f_' + k + '">' + esc(d[k]) + '</textarea>'
        : '<input id="f_' + k + '" value="' + esc(d[k]).replace(/"/g, '&quot;') + '">');
    }).join('');

    painel.innerHTML =
      '<header><h2>Textos da página</h2>' +
      '<div class="sub">o que escreves aparece já aqui ao lado</div></header>' +
      '<div class="corpo">' + linhas +
      '<p class="dica">Uma linha em branco começa um parágrafo novo. ' +
      'Uma quebra simples fica quebra. <strong>**assim**</strong> fica destacado.</p></div>' +
      '<div class="pe"><button id="ed_g">Guardar</button>' +
      '<button class="sec" id="ed_x">Fechar</button>' +
      '<span class="estado" id="ed_e"></span></div>';

    document.body.appendChild(painel);
    document.body.classList.add('editando');

    Object.keys(rot).forEach(function (k) {
      document.getElementById('f_' + k).addEventListener('input', function () {
        var o = {};
        o[k] = this.value;
        aplicar(o);
      });
    });
    document.getElementById('ed_x').addEventListener('click', function () {
      painel.remove();
      document.body.classList.remove('editando');
      history.replaceState(null, '', location.pathname);
    });
    document.getElementById('ed_g').addEventListener('click', guardar);
  }

  montar();
})();
