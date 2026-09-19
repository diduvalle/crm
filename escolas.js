/* ================== AS ESCOLAS, NO #ADMIN ==================
   Gerir escolas é um nível acima de qualquer escola - por isso vive aqui,
   na porta de casa, e não dentro do CRM de uma delas. Obrigar a entrar numa
   turma para criar outra escola era o caminho errado.

   Só aparece com #admin no endereço, tal como o editor dos textos, e
   partilha com ele a mesma sessão de administração: quem entrou para
   corrigir uma frase já está dentro, e não volta a escrever a palavra-passe.
   ============================================================ */
(function () {
  'use strict';

  var API = 'https://qgfzbyhfyqvmmmdiqycu.supabase.co/rest/v1/rpc/';
  var KEY = 'sb_publishable_atlEEoeN4-CWY8mD7KQNsw_m1cXjdIE';
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
  function token() { try { return sessionStorage.getItem(TOK) || localStorage.getItem(TOK) || ''; } catch (e) { return ''; } }
  function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* Os campos, por ordem de quem está a criar uma escola: primeiro o que se
     vê, depois o que a lei obriga, depois o email, depois a formação.
     A carga horária e o NIF estão aqui porque são os dois que escapam
     sempre - o primeiro faz falta ao selo, o segundo ao aviso legal. */
  var GRUPOS = [
    ['Identidade', [['nome', 'Nome da escola'], ['slug', 'Endereço'], ['logo', 'Logótipo (URL)'], ['cor', 'Cor principal', 'color']]],
    ['Legal', [['legalNome', 'Designação legal'], ['nif', 'NIF'], ['morada', 'Morada'], ['emailContacto', 'Email de contacto'], ['responsavelDados', 'Responsável pelos dados']]],
    ['Email', [['remetenteNome', 'Nome do remetente'], ['emailResposta', 'Email de resposta']]],
    ['Formação', [['modulos', 'Módulos'], ['horas', 'Carga horária'], ['formador', 'Formador'], ['seloEmissor', 'Emissor do selo']]]
  ];
  /* a coluna da base tem outro nome em alguns casos */
  var COL = { logo: 'logo_url', legalNome: 'legal_nome', emailContacto: 'email_contacto',
              responsavelDados: 'responsavel_dados', remetenteNome: 'remetente_nome',
              emailResposta: 'email_resposta', seloEmissor: 'selo_emissor' };

  var escolas = [], aberta = null;

  function campo(k, rot, tipo, val) {
    var t = tipo || 'text';
    return '<label class="ad-f"><span>' + rot + '</span>' +
      '<input data-ef="' + k + '" type="' + t + '" value="' + esc(val || '') + '"' +
      (k === 'slug' ? ' placeholder="xpto" pattern="[a-z0-9][a-z0-9-]{1,30}"' : '') + '></label>';
  }

  function fichaHTML(e) {
    var v = function (k) { var c = COL[k] || k; return e ? (e[c] == null ? '' : e[c]) : ''; };
    return '<div class="ad-ficha" data-id="' + esc(e ? e.id : '') + '">' +
      GRUPOS.map(function (g) {
        return '<p class="ad-grp">' + g[0] + '</p><div class="ad-grid">' +
          g[1].map(function (c) { return campo(c[0], c[1], c[2], v(c[0])); }).join('') + '</div>';
      }).join('') +
      '<div class="ad-acts">' +
        '<button class="ad-btn" data-ax="guardar">Guardar</button>' +
        (e ? '<button class="ad-btn sec" data-ax="turma">Nova turma</button>' +
             '<button class="ad-btn sec" data-ax="arquivar">' + (e.arquivado ? 'Reativar' : 'Arquivar') + '</button>' +
             '<a class="ad-btn sec" href="/' + esc(e.slug) + '" target="_blank" rel="noopener">Abrir /' + esc(e.slug) + '</a>' : '') +
      '</div><div class="ad-turma"></div></div>';
  }

  function listaHTML() {
    return '<div class="ad-esc-lista">' +
      escolas.map(function (e) {
        return '<button class="ad-chip' + (aberta === e.id ? ' on' : '') + (e.arquivado ? ' off' : '') +
          '" data-abrir="' + esc(e.id) + '">' + esc(e.nome) + '<em>/' + esc(e.slug) + '</em></button>';
      }).join('') +
      '<button class="ad-chip novo' + (aberta === 'novo' ? ' on' : '') + '" data-abrir="novo">+ Nova escola</button></div>';
  }

  function pintar() {
    var box = document.getElementById('adEscolas');
    if (!box) return;
    var e = aberta && aberta !== 'novo' ? escolas.filter(function (x) { return x.id === aberta; })[0] : null;
    box.innerHTML = listaHTML() + (aberta ? fichaHTML(e) : '');
  }

  function carregar() {
    var t = token();
    if (!t) {
      var box = document.getElementById('adEscolas');
      if (box) box.innerHTML = '<p class="ad-sub">Para ver e criar escolas, entre como administrador.</p>' +
        '<button class="ad-btn" data-entrar="1">Entrar</button>';
      return;
    }
    rpc('espacos_listar', { p_token: t })
      .then(function (d) { escolas = d || []; pintar(); })
      .catch(function () { escolas = []; pintar(); });
  }

  function entrar() {
    var p = prompt('Palavra-passe de administração');
    if (!p) return;
    rpc('login_root', { p_password: p })
      .then(function (d) {
        try{ sessionStorage.setItem(TOK, d.token); }catch(x){}
        carregar();
      })
      .catch(function () { alert('Palavra-passe errada.'); });
  }

  function ler(ficha) {
    var d = {};
    Array.prototype.forEach.call(ficha.querySelectorAll('[data-ef]'), function (i) { d[i.dataset.ef] = i.value.trim(); });
    return d;
  }

  function guardar(ficha, extra) {
    var t = token(); if (!t) { alert('Entre como administrador primeiro.'); return; }
    var d = ler(ficha), id = ficha.dataset.id || null;
    if (!d.slug) { alert('Falta o endereço da escola.'); return; }
    Object.keys(extra || {}).forEach(function (k) { d[k] = extra[k]; });
    rpc('espaco_guardar', { p_token: t, p_id: id || null, p_dados: d })
      .then(function (r) { aberta = r && r.id; carregar(); })
      .catch(function (e) { alert('Não guardou: ' + e.message); });
  }

  /* O formador não se inscreve, é criado - e o código de recuperação só
     aparece uma vez, por isso fica num bloco que não desaparece sozinho. */
  var TCAMPOS = [['codigo', 'Número da turma'], ['nome', 'Nome da turma'], ['fnome', 'Nome do formador'],
                 ['fapelido', 'Apelido'], ['femail', 'Email'], ['user', 'Utilizador'], ['pass', 'Palavra-passe']];
  function formTurma(ficha) {
    var cx = ficha.querySelector('.ad-turma');
    if (cx.innerHTML) { cx.innerHTML = ''; return; }
    cx.innerHTML = '<p class="ad-grp">Nova turma</p><div class="ad-grid">' +
      TCAMPOS.map(function (c) { return '<label class="ad-f"><span>' + c[1] + '</span><input data-tf="' + c[0] + '"></label>'; }).join('') +
      '</div><div class="ad-acts"><button class="ad-btn" data-ax="turma-criar">Criar turma</button></div>';
  }

  function criarTurma(ficha) {
    var t = token(); if (!t) return;
    var cx = ficha.querySelector('.ad-turma');
    var g = function (k) { var i = cx.querySelector('[data-tf="' + k + '"]'); return i ? i.value.trim() : ''; };
    var slug = (ficha.querySelector('[data-ef="slug"]') || {}).value || '';
    if (!/^[0-9]{8}$/.test(g('codigo'))) { alert('O número da turma são 8 dígitos.'); return; }
    if (!g('user') || !g('pass')) { alert('Utilizador e palavra-passe são obrigatórios.'); return; }
    rpc('criar_turma_em', { p_token: t, p_slug: slug, p_codigo: g('codigo'), p_nome_turma: g('nome'),
      p_nome: g('fnome'), p_apelido: g('fapelido'), p_email: g('femail'),
      p_username: g('user'), p_password: g('pass') })
      .then(function (d) {
        cx.innerHTML = '<div class="ad-ok"><strong>Turma ' + esc(g('codigo')) + ' criada em /' + esc(slug) + '.</strong>' +
          '<p>Código de recuperação do formador:</p><code>' + esc((d && d.recovery) || '-') + '</code>' +
          '<p>Guarde-o agora: não volta a ser mostrado.</p></div>';
      })
      .catch(function (e) { alert('Não criou: ' + e.message); });
  }

  function ligar() {
    document.addEventListener('click', function (ev) {
      if (ev.target.closest && ev.target.closest('[data-entrar]')) { entrar(); return; }
      var chip = ev.target.closest && ev.target.closest('[data-abrir]');
      if (chip) { aberta = chip.dataset.abrir; pintar(); return; }
      var b = ev.target.closest && ev.target.closest('[data-ax]');
      if (!b) return;
      var ficha = b.closest('.ad-ficha'); if (!ficha) return;
      var ax = b.dataset.ax;
      if (ax === 'guardar') guardar(ficha);
      else if (ax === 'arquivar') {
        var e = escolas.filter(function (x) { return x.id === ficha.dataset.id; })[0];
        guardar(ficha, { arquivado: !(e && e.arquivado) });
      }
      else if (ax === 'turma') formTurma(ficha);
      else if (ax === 'turma-criar') criarTurma(ficha);
    });
  }

  function arrancar() {
    if (location.hash !== '#admin') return;
    var alvo = document.querySelector('.folha') || document.body;
    var sec = document.createElement('section');
    sec.id = 'adEscolasWrap';
    sec.innerHTML = '<hr class="regua"><h2 class="ad-h2">Escolas</h2>' +
      '<p class="ad-sub">Cada escola tem o seu endereço, a sua marca e as suas turmas. ' +
      'O que aqui se define é o que a plataforma veste quando alguém abre <code>/nome-da-escola</code>.</p>' +
      '<div id="adEscolas"><p class="ad-sub">A carregar…</p></div>';
    alvo.appendChild(sec);
    ligar();
    carregar();
    /* o editor dos textos autentica-se à parte; quando isso acontecer,
       a lista aparece sem ser preciso recarregar a página */
    window.addEventListener('crm-root-entrou', carregar);
  }

  function avisoDesconhecido(){
    try{
      var q = new URLSearchParams(location.search).get('desconhecido');
      if(!q) return;
      var d = document.createElement('div');
      d.className = 'ad-aviso';
      d.textContent = 'Não existe nenhuma escola em /' + q + '.';
      var alvo = document.querySelector('.folha') || document.body;
      alvo.insertBefore(d, alvo.firstChild);
      history.replaceState(null, '', location.pathname);
    }catch(e){}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avisoDesconhecido);
  else avisoDesconhecido();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
  window.addEventListener('hashchange', function () {
    if (location.hash === '#admin' && !document.getElementById('adEscolasWrap')) arrancar();
  });
})();
