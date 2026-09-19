/* ================== A JANELA DE ADMINISTRAÇÃO ==================
   Havia dois painéis a disputar o ecrã: os textos numa gaveta à direita e
   as escolas empurradas para o fundo da página. Duas caixas para a mesma
   pessoa, ao mesmo tempo, sem relação visível entre elas.

   Passa a ser uma janela ao centro com separadores. A regra é simples: uma
   coisa de cada vez, e o que está aberto é o que o botão Guardar guarda.

   O que se perdia ao pôr a janela ao centro era a pré-visualização - os
   textos escrevem-se AO VIVO na página por baixo, e uma janela centrada
   tapa-a. Daí o botão Espreitar: enquanto está premido a janela desvanece
   e vê-se o resultado. Sem isso, escrever às cegas.

   Só existe com #admin no endereço. Sem isso, nada disto é construído.
   ================================================================ */
(function () {
  'use strict';

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
  function tok() { try { return sessionStorage.getItem(TOK) || ''; } catch (e) { return ''; } }
  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function $(s) { return document.querySelector(s); }

  /* ---------------- os textos da página ---------------- */
  /* Marcação mínima, de propósito: uma linha em branco separa parágrafos,
     uma quebra simples é uma quebra, e **assim** fica destacado. Não aceita
     HTML - o texto é escapado antes de qualquer coisa. */
  function paraHTML(t) {
    return String(t || '').trim().split(/\n\s*\n/).map(function (p) {
      return '<p>' + esc(p).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }
  function deHTML(el) {
    return Array.prototype.map.call(el.querySelectorAll('p'), function (p) {
      var h = p.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
      var d = document.createElement('div'); d.innerHTML = h;
      return d.textContent;
    }).join('\n\n');
  }
  function campos() { return Array.prototype.slice.call(document.querySelectorAll('[data-txt]')); }
  function aplicar(d) {
    if (!d) return;
    campos().forEach(function (el) {
      var k = el.getAttribute('data-txt');
      if (!(k in d)) return;
      if (el.hasAttribute('data-bloco')) el.innerHTML = paraHTML(d[k]);
      else el.textContent = d[k];
    });
  }
  function lerTextos() {
    var o = {};
    campos().forEach(function (el) {
      o[el.getAttribute('data-txt')] = el.hasAttribute('data-bloco') ? deHTML(el) : el.textContent.trim();
    });
    return o;
  }

  /* os textos do servidor entram mesmo sem #admin: é a página normal */
  rpc('site_ler', { p_chave: CHAVE }).then(aplicar).catch(function () {});

  var ROT = {
    titulo: 'Título', destaque: 'Palavra destacada', abre: 'Abertura',
    c1_rot: 'Rótulo da 1.ª coluna', c1_txt: '1.ª coluna',
    c2_rot: 'Rótulo da 2.ª coluna', c2_txt: '2.ª coluna',
    b_tit: 'Título do bloco do badge', b_txt: 'Bloco do badge'
  };

  /* ---------------- as escolas ---------------- */
  /* A ordem dos grupos é a ordem de quem cria uma escola: primeiro o que se
     vê, depois o que a lei obriga, depois o email, depois a formação.
     A carga horária e o NIF estão cá porque são os dois que escapam sempre -
     o primeiro faz falta ao selo, o segundo ao aviso legal. */
  var GRUPOS = [
    ['Identidade', [['nome', 'Nome da escola'], ['slug', 'Endereço'], ['logo', 'Logótipo'], ['cor', 'Cor principal', 'color']]],
    ['Emails para a turma', [['remetenteNome', 'Nome que aparece nos emails']]],
    ['Formação', [['horas', 'Carga horária (por omissão)'], ['formador', 'Formador (por omissão)']]]
  ];
  var COL = { logo: 'logo_url', legalNome: 'legal_nome', emailContacto: 'email_contacto',
              responsavelDados: 'responsavel_dados', remetenteNome: 'remetente_nome',
              emailResposta: 'email_resposta', seloEmissor: 'selo_emissor' };
  var TURMA_LINHAS = [
    { campos: [['codigo', 'Código da turma'], ['nome', 'Nome da turma']] },
    { titulo: 'Formador', campos: [['fnome', 'Nome'], ['fapelido', 'Apelido'], ['femail', 'Email']] },
    { campos: [['user', 'Utilizador'], ['pass', 'Palavra-passe']] }
  ];

  var escolas = [], sel = '', aba = 'pagina';

  function fichaEscola(e) {
    var v = function (k) { var c = COL[k] || k; return e ? (e[c] == null ? '' : e[c]) : ''; };
    return GRUPOS.map(function (g) {
      var nota = g[0] === 'Formação'
        ? '<p class="ad-nota">Valores de partida para as turmas desta escola. A carga horária e o formador variam de turma para turma - isto é só o que aparece preenchido à partida.</p>'
        : g[0] === 'Emails para a turma'
        ? '<p class="ad-nota">Saem sempre de <code>crm@cr0x.org</code>, e as respostas vêm para lá. O que muda por escola é só ' +
          'o <strong>nome</strong> que aparece na caixa de entrada de quem recebe: <em>IEFP</em> em vez de <em>Escola XPTO</em>.</p>'
        : '';
      return '<p class="ad-grp">' + g[0] + '</p>' + nota + '<div class="ad-grid">' + g[1].map(function (c) {
        if (c[0] === 'logo') {
          var url = v('logo');
          return '<label class="ad-f ad-logo"><span>' + c[1] + '</span>' +
            '<div class="ad-logo-cx">' +
              '<div class="ad-logo-prev" data-logo-prev>' + (url ? '<img src="' + esc(url) + '" alt="">' : '<span>sem logótipo</span>') + '</div>' +
              '<div class="ad-logo-dir">' +
                '<input data-ef="logo" type="text" value="' + esc(url) + '" placeholder="endereço da imagem, ou carrega um ficheiro" spellcheck="false">' +
                '<div class="ad-logo-btns">' +
                  '<button type="button" class="ad-b sec peq" data-ax="logo-escolher">Carregar do computador</button>' +
                  (url ? '<button type="button" class="ad-b sec peq" data-ax="logo-tirar">Remover</button>' : '') +
                '</div>' +
              '</div>' +
            '</div>' +
            '<input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" data-logo-file hidden></label>';
        }
        if (c[2] === 'color') {
          var cor = v(c[0]) || '#0078bf';
          return '<label class="ad-f ad-cor"><span>' + c[1] + '</span><div class="ad-cor-par">' +
            '<input data-cor-amostra type="color" value="' + esc(cor) + '">' +
            '<input data-ef="' + c[0] + '" type="text" value="' + esc(v(c[0])) + '" placeholder="#0078bf" spellcheck="false">' +
            '</div></label>';
        }
        return '<label class="ad-f"><span>' + c[1] + '</span><input data-ef="' + c[0] +
          '" type="' + (c[2] || 'text') + '" value="' + esc(v(c[0])) + '"' +
          (c[0] === 'slug' ? ' placeholder="xpto"' : '') + '></label>';
      }).join('') + '</div>';
    }).join('') +
    '<div class="ad-linha">' +
      (e ? '<button class="ad-b sec" data-ax="turma">Nova turma</button>' +
           '<button class="ad-b sec" data-ax="arquivar">' + (e.arquivado ? 'Reativar' : 'Arquivar') + '</button>' +
           '<a class="ad-b sec" href="/' + esc(e.slug) + '" target="_blank" rel="noopener">Abrir /' + esc(e.slug) + ' &nearr;</a>' : '') +
    '</div><div id="adTurma"></div>';
  }

  var LOGO_MAX_LADO = 320;      /* aparece a 48px; isto chega para ecrãs densos */
  var LOGO_MAX_BYTES = 180 * 1024;

  /* Reduz no browser antes de subir. Sem isto, uma fotografia de 4 MB
     arrastada para aqui ia inteira para a base e voltava em cada abertura
     de página de quem abrisse a escola. */
  function reduzirImagem(ficheiro) {
    return new Promise(function (ok, falha) {
      if (ficheiro.type === 'image/svg+xml') {
        /* vetorial: não há nada a reduzir, e redesenhá-lo perdia a nitidez */
        var rs = new FileReader();
        rs.onload = function () { ok(rs.result); };
        rs.onerror = function () { falha(new Error('não consegui ler o ficheiro')); };
        return rs.readAsDataURL(ficheiro);
      }
      var r = new FileReader();
      r.onload = function () {
        var img = new Image();
        img.onload = function () {
          var e = Math.min(1, LOGO_MAX_LADO / Math.max(img.width, img.height));
          var w = Math.max(1, Math.round(img.width * e)), h = Math.max(1, Math.round(img.height * e));
          var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
          var cd = cv.getContext('2d');
          cd.imageSmoothingQuality = 'high';
          cd.drawImage(img, 0, 0, w, h);
          /* PNG para não perder a transparência, que quase todos os
             logótipos têm e sem a qual ficam num quadrado branco */
          ok(cv.toDataURL('image/png'));
        };
        img.onerror = function () { falha(new Error('isso não parece uma imagem')); };
        img.src = r.result;
      };
      r.onerror = function () { falha(new Error('não consegui ler o ficheiro')); };
      r.readAsDataURL(ficheiro);
    });
  }

  function logoMostrar(url) {
    var prev = document.querySelector('[data-logo-prev]');
    var campo = document.querySelector('[data-ef="logo"]');
    var cx = document.querySelector('.ad-logo-dir');
    if (campo) campo.value = url || '';
    if (prev) prev.innerHTML = url ? '<img src="' + esc(url) + '" alt="">' : '<span>sem logótipo</span>';
    if (!cx) return;
    var ficheiro = /^data:/.test(url || '');
    if (campo) campo.style.display = ficheiro ? 'none' : '';
    var marca = cx.querySelector('.ad-logo-marca');
    if (ficheiro) {
      if (!marca) { marca = document.createElement('p'); marca.className = 'ad-logo-marca'; cx.insertBefore(marca, cx.firstChild); }
      marca.textContent = 'Imagem carregada · ' + Math.round(url.length / 1024) + ' KB';
    } else if (marca) { marca.remove(); }
    var btns = cx.querySelector('.ad-logo-btns');
    if (btns && !btns.querySelector('[data-ax="logo-tirar"]') && url) {
      var t = document.createElement('button');
      t.type = 'button'; t.className = 'ad-b sec peq';
      t.setAttribute('data-ax', 'logo-tirar'); t.textContent = 'Remover';
      btns.appendChild(t);
    } else if (btns && !url) {
      var v = btns.querySelector('[data-ax="logo-tirar"]'); if (v) v.remove();
    }
  }

  function logoAceitar(fich) {
    if (!fich) return;
    estado('a preparar a imagem…');
    reduzirImagem(fich).then(function (url) {
      if (url.length > LOGO_MAX_BYTES) { estado('a imagem ficou grande demais; tenta uma mais simples'); return; }
      logoMostrar(url);
      estado('logótipo pronto - falta Guardar');
    }).catch(function (e) { estado(e.message); });
  }
  function logoEscolher() {
    var f = document.querySelector('[data-logo-file]');
    if (f) { f.value = ''; f.click(); }
  }

  function corpoEscolas() {
    if (!tok()) return '<p class="ad-vazio">Para ver e criar escolas é preciso entrar.<br>' +
      '<button class="ad-b" data-ax="entrar">Entrar</button></p>';
    var e = sel && sel !== 'nova' ? escolas.filter(function (x) { return x.id === sel; })[0] : null;
    return '<label class="ad-f ad-escolher"><span>Escola</span><select id="adSel">' +
      '<option value="">escolher…</option>' +
      escolas.map(function (x) {
        return '<option value="' + esc(x.id) + '"' + (sel === x.id ? ' selected' : '') + '>' +
          esc(x.nome) + '  /' + esc(x.slug) + (x.arquivado ? '  (arquivada)' : '') + '</option>';
      }).join('') +
      '<option value="nova"' + (sel === 'nova' ? ' selected' : '') + '>+ Nova escola</option>' +
      '</select></label>' +
      (sel ? '<div class="ad-ficha">' + fichaEscola(e) + '</div>'
           : '<p class="ad-vazio">' + (escolas.length ? 'Escolhe uma escola acima, ou cria uma nova.'
                                                      : 'Ainda não há escolas. Escolhe <em>+ Nova escola</em>.') + '</p>');
  }

  function corpoPagina() {
    var d = lerTextos();
    return Object.keys(ROT).map(function (k) {
      var alvo = document.querySelector('[data-txt="' + k + '"]');
      var multi = alvo && alvo.hasAttribute('data-bloco');
      return '<label class="ad-f"><span>' + ROT[k] + '</span>' + (multi
        ? '<textarea data-tx="' + k + '" rows="4">' + esc(d[k]) + '</textarea>'
        : '<input data-tx="' + k + '" value="' + esc(d[k]) + '">') + '</label>';
    }).join('') +
    '<p class="ad-dica">Uma linha em branco começa um parágrafo novo. Uma quebra simples fica quebra. ' +
    '<strong>**assim**</strong> fica destacado. O que escreves aparece já na página - usa <em>Espreitar</em> para ver.</p>';
  }

  function pintar() {
    var c = $('#adCorpo'); if (!c) return;
    c.innerHTML = aba === 'pagina' ? corpoPagina() : corpoEscolas();
    Array.prototype.forEach.call(document.querySelectorAll('.ad-tab'), function (b) {
      b.classList.toggle('on', b.dataset.aba === aba);
    });
    var esp = document.querySelector('[data-ax="espreitar"]');
    if (esp) esp.style.display = aba === 'pagina' ? '' : 'none';
    var g = $('#adGuardar');
    if (g) g.style.display = (aba === 'pagina' || (aba === 'escolas' && sel)) ? '' : 'none';
    if (aba === 'pagina') {
      Array.prototype.forEach.call(c.querySelectorAll('[data-tx]'), function (i) {
        i.addEventListener('input', function () { var o = {}; o[this.dataset.tx] = this.value; aplicar(o); });
      });
    }
    /* a amostra e o texto do hex espelham-se um no outro */
    Array.prototype.forEach.call(c.querySelectorAll('.ad-cor-par'), function (par) {
      var am = par.querySelector('[data-cor-amostra]'), tx = par.querySelector('[data-ef]');
      am.addEventListener('input', function () { tx.value = am.value; });
      tx.addEventListener('input', function () {
        if (/^#[0-9a-fA-F]{6}$/.test(tx.value.trim())) am.value = tx.value.trim();
      });
    });
    /* colar um endereço à mão tem de mostrar o mesmo que carregar um
       ficheiro, senão parece que uma das duas vias não funciona */
    if (c.querySelector('[data-ef="logo"]')) logoMostrar(c.querySelector('[data-ef="logo"]').value);
    var cf = c.querySelector('[data-logo-file]');
    if (cf) cf.addEventListener('change', function () { logoAceitar(this.files && this.files[0]); });
    var cl = c.querySelector('[data-ef="logo"]');
    if (cl) cl.addEventListener('input', function () {
      var prev = document.querySelector('[data-logo-prev]');
      if (prev) prev.innerHTML = this.value ? '<img src="' + esc(this.value) + '" alt="">' : '<span>sem logótipo</span>';
    });
    var s = $('#adSel');
    if (s) s.addEventListener('change', function () { sel = this.value; pintar(); });
  }

  function estado(t) { var e = $('#adEstado'); if (e) e.textContent = t || ''; }

  function entrar(depois) {
    var p = prompt('Palavra-passe de administração');
    if (!p) return;
    estado('a entrar…');
    rpc('login_root', { p_password: p }).then(function (d) {
      try { sessionStorage.setItem(TOK, d.token); } catch (e) {}
      estado('sessão aberta');
      carregarEscolas();
      if (depois) depois();
    }).catch(function () { estado('palavra-passe errada'); });
  }

  function carregarEscolas() {
    if (!tok()) { pintar(); return; }
    rpc('espacos_listar', { p_token: tok() })
      .then(function (d) { escolas = d || []; pintar(); })
      .catch(function () { escolas = []; pintar(); });
  }

  function guardar() {
    if (!tok()) return entrar(guardar);
    if (aba === 'pagina') {
      estado('a guardar…');
      return rpc('site_guardar', { p_token: tok(), p_chave: CHAVE, p_dados: lerTextos() })
        .then(function () { estado('guardado às ' + new Date().toTimeString().slice(0, 5)); })
        .catch(function (e) {
          if (String(e.message).indexOf('SEM_PERMISSAO') >= 0) { try { sessionStorage.removeItem(TOK); } catch (x) {} return entrar(guardar); }
          estado('não guardou: ' + e.message);
        });
    }
    guardarEscola();
  }

  function lerFicha(extra) {
    var d = {};
    Array.prototype.forEach.call(document.querySelectorAll('[data-ef]'), function (i) { d[i.dataset.ef] = i.value.trim(); });
    Object.keys(extra || {}).forEach(function (k) { d[k] = extra[k]; });
    return d;
  }
  function guardarEscola(extra) {
    var d = lerFicha(extra);
    if (!d.slug) { estado('falta o endereço'); return; }
    estado('a guardar…');
    rpc('espaco_guardar', { p_token: tok(), p_id: (sel && sel !== 'nova') ? sel : null, p_dados: d })
      .then(function (r) { sel = r && r.id; estado('guardado'); carregarEscolas(); })
      .catch(function (e) { estado('não guardou: ' + e.message); });
  }

  /* O código de recuperação aparece uma vez só: na base fica o resumo
     cifrado. Por isso fica escrito num bloco que não desaparece sozinho. */
  function formTurma() {
    var cx = $('#adTurma');
    if (cx.innerHTML) { cx.innerHTML = ''; return; }
    cx.innerHTML = '<p class="ad-grp">Nova turma</p>' +
      TURMA_LINHAS.map(function (l) {
        return (l.titulo ? '<p class="ad-sub-grp">' + l.titulo + '</p>' : '') +
          '<div class="ad-lin" style="grid-template-columns:repeat(' + l.campos.length + ',1fr)">' +
          l.campos.map(function (c) {
            return '<label class="ad-f"><span>' + c[1] + '</span><input data-tf="' + c[0] + '"' +
              (c[0] === 'pass' ? ' type="text" spellcheck="false"' : '') + '></label>';
          }).join('') + '</div>';
      }).join('') +
      '<div class="ad-linha"><button class="ad-b" data-ax="turma-criar">Criar turma</button></div>';
  }
  function criarTurma() {
    var cx = $('#adTurma');
    var g = function (k) { var i = cx.querySelector('[data-tf="' + k + '"]'); return i ? i.value.trim() : ''; };
    var slug = (document.querySelector('[data-ef="slug"]') || {}).value || '';
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{1,23}$/.test(g('codigo'))) { estado('o código da turma tem 2 a 24 caracteres: letras, números, ponto ou hífen'); return; }
    if (!g('user') || !g('pass')) { estado('faltam as credenciais do formador'); return; }
    estado('a criar…');
    rpc('criar_turma_em', { p_token: tok(), p_slug: slug, p_codigo: g('codigo'), p_nome_turma: g('nome'),
      p_nome: g('fnome'), p_apelido: g('fapelido'), p_email: g('femail'), p_username: g('user'), p_password: g('pass') })
      .then(function (d) {
        estado('turma criada');
        cx.innerHTML = '<div class="ad-ok"><strong>Turma ' + esc(g('codigo')) + ' criada em /' + esc(slug) + '</strong>' +
          '<p>Código de recuperação do formador:</p><code>' + esc((d && d.recovery) || '-') + '</code>' +
          '<p>Guarde-o agora: não volta a ser mostrado.</p></div>';
      })
      .catch(function (e) { estado('não criou: ' + e.message); });
  }

  /* ---------------- a janela ---------------- */
  function montar() {
    if ($('#adJanela')) return;
    var w = document.createElement('div');
    w.id = 'adJanela';
    w.innerHTML =
      '<div class="ad-fundo" data-ax="fechar"></div>' +
      '<div class="ad-cx" role="dialog" aria-label="Administração">' +
        '<div class="ad-top">' +
          '<span class="ad-titulo">Administração</span>' +
          '<div class="ad-tabs">' +
            '<button class="ad-tab on" data-aba="pagina">Página</button>' +
            '<button class="ad-tab" data-aba="escolas">Escolas</button>' +
          '</div>' +
          '<button class="ad-x" data-ax="fechar" aria-label="Fechar">&times;</button>' +
        '</div>' +
        '<div class="ad-corpo" id="adCorpo"></div>' +
        '<div class="ad-pe">' +
          '<button class="ad-b" id="adGuardar" data-ax="guardar">Guardar</button>' +
          '<button class="ad-b sec" data-ax="espreitar">Espreitar</button>' +
          '<span class="ad-estado" id="adEstado"></span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(w);
    pintar();
    if (tok()) carregarEscolas();

    w.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-aba]');
      if (t) { aba = t.dataset.aba; pintar(); if (aba === 'escolas') carregarEscolas(); return; }
      var b = ev.target.closest('[data-ax]'); if (!b) return;
      var ax = b.dataset.ax;
      if (ax === 'fechar') fechar();
      else if (ax === 'guardar') guardar();
      else if (ax === 'entrar') entrar();
      else if (ax === 'logo-escolher') logoEscolher();
      else if (ax === 'logo-tirar') { logoMostrar(''); estado('logótipo removido - falta Guardar'); }
      else if (ax === 'turma') formTurma();
      else if (ax === 'turma-criar') criarTurma();
      else if (ax === 'arquivar') {
        var e = escolas.filter(function (x) { return x.id === sel; })[0];
        guardarEscola({ arquivado: !(e && e.arquivado) });
      }
    });

    /* Espreitar: enquanto está premido, a janela desvanece. É a troca por
       ter posto tudo ao centro - os textos escrevem-se ao vivo por baixo. */
    var esp = w.querySelector('[data-ax="espreitar"]');
    ['mousedown', 'touchstart'].forEach(function (e) { esp.addEventListener(e, function () { w.classList.add('espreita'); }); });
    ['mouseup', 'mouseleave', 'touchend'].forEach(function (e) { esp.addEventListener(e, function () { w.classList.remove('espreita'); }); });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('#adJanela')) fechar(); });
  }

  function fechar() {
    var w = $('#adJanela'); if (w) w.remove();
    history.replaceState(null, '', location.pathname);
  }

  /* quem chegou de um endereço que não é escola nenhuma: dizer-lhe porquê,
     em vez de o deixar a pensar que o link estava errado */
  function avisoDesconhecido() {
    try {
      var q = new URLSearchParams(location.search).get('desconhecido');
      if (!q) return;
      var d = document.createElement('div');
      d.className = 'ad-aviso';
      d.textContent = 'Não existe nenhuma escola em /' + q + '.';
      var alvo = document.querySelector('.folha') || document.body;
      alvo.insertBefore(d, alvo.firstChild);
      history.replaceState(null, '', location.pathname);
    } catch (e) {}
  }

  function arrancar() {
    avisoDesconhecido();
    if (location.hash === '#admin') montar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
  window.addEventListener('hashchange', function () { if (location.hash === '#admin') montar(); });
})();
