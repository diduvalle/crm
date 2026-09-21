/* ================== A FACHADA DOS VÍDEOS ==================
   Os vídeos saíram do repositório e vivem num canal. Mas um <iframe> da
   YouTube contacta a Google e entrega o IP de quem abre a página ANTES de
   alguém carregar em play - e o youtube-nocookie adia os cookies, não o IP.

   Num manual que ensina RGPD isso lê-se mal. Aqui não há iframe nenhum até
   ao clique: o que está na página é uma imagem local e um botão. Quem não
   carregar, não fala com a Google.

   É também a razão de o aviso estar à vista em vez de escondido: a página
   pode dizer o que faz, e isso é mais didático do que a nota de rodapé de
   uma política de privacidade.
   =========================================================== */
(function () {
  'use strict';

  /* chave do vídeo -> id no canal, POR LÍNGUA: a app foi gravada em
     português e em inglês, e são vídeos diferentes. Sem isto, quem
     lesse o manual em inglês via a interface em português.

     Preenchido pelo subir.mjs depois do upload. Enquanto estiver vazio,
     o bloco diz que o vídeo ainda não subiu em vez de mostrar um leitor
     partido. */
  var IDS = {
    pt: {
      'alertas': 'ArliXZBsNAs',
      'analytics': 'UNTQuTNSnY0',
      'aprovacao-propostas': '1KkhA-ZLc1k',
      'automacao-comportamental': 'QiLgIEObU0E',
      'campanhas': '2MdKxo9ZlYU',
      'casos': '2JXGX1DQC-U',
      'comunicacao': 'dpbVcQ-FjaM',
      'contactos': 'qwYMYBv0tnY',
      'criar-proposta': 'GLqJF6Foz9c',
      'dashboard': 'rqy65kPbe3w',
      'decisao': 'CPVdww5FjnQ',
      'definicoes': 'cc1dhcaadPs',
      'entrar': 'HV-0xVSf_j0',
      'gestao-leads': 'I10cslnEXQc',
      'importar': 'AA6TfoEf36w',
      'jornadas': 'Y-WV2_ciVbA',
      'linhas': 'sKl69Pklxj8',
      'modelos': 'hTID0WdCf2E',
      'montar-turma': 'mtgScO1bc9Q',
      'pdf': 'mwthYzRE0UM',
      'produtos': 'HkSiPFNTpOg',
      'proposta-online': 'BsAMiiS37Wo',
      'propostas': 'OyeA_f_8XdY',
      'recuperar': 'lTdDYkYe7qw',
      'resumo': 'oFIAE6lJFIg',
      'retencao': 'Xn2vwlDL41c',
      'rgpd': '3dPSFJnO0nI',
      'submeter': 'nSjEZ0at-hU',
      'web-to-lead': 'Xu097I1onDo',
    },
    en: {
      'alertas': 'fNp3qt_2zHE',
      'analytics': 'm6xesPmrIME',
      'aprovacao-propostas': 'b10hBeB8A-g',
      'automacao-comportamental': 'gZI-cf4N2YQ',
      'campanhas': 'QzfcdUHoYKw',
      'casos': '_yoMYNZKclk',
      'comunicacao': 'ZH6TFMfMD9s',
      'contactos': 'vHnxB1GHhe8',
      'criar-proposta': 'dloHwcE47hU',
      'dashboard': 'DRE8xQXkjZc',
      'decisao': '_OGP3c0b9V4',
      'definicoes': '5FxEXdtXoaI',
      'entrar': 'bVcxr2mg29I',
      'gestao-leads': '3_49drTSTt0',
      'importar': 'uhsl6s9ww0c',
      'jornadas': 'DHNlmWJqO9A',
      'linhas': 'psQ2LynEZ4Q',
      'modelos': 'fK1ph-L69eg',
      'montar-turma': '20YZ8eJT49U',
      'pdf': 'i4gfuQ9bjwY',
      'produtos': 'eMD0G8ttmg4',
      'proposta-online': '4TCfEWO4Opw',
      'propostas': 'f6ljeuiRQQM',
      'recuperar': 'ktxptFvwDXU',
      'resumo': '7J5YXRBeZ9w',
      'retencao': 'SwshKZimhZ8',
      'rgpd': 'XhIsCB_27eE',
      'submeter': 'wXxey56F-f8',
      'web-to-lead': '_wAPfsFMzvc',
    }
  };

  var TXT = {
    pt: { ver: 'Ver o vídeo', aviso: 'Ao carregar, o vídeo é pedido à YouTube e o seu endereço IP é partilhado com a Google. Até lá, esta página não comunica com ninguém.', falta: 'Vídeo ainda não publicado.' },
    en: { ver: 'Play video', aviso: 'Playing loads the video from YouTube and shares your IP address with Google. Until then, this page contacts no one.', falta: 'Video not published yet.' }
  };

  function lingua(el) {
    var h = document.documentElement.getAttribute('lang') || '';
    if (/^en/i.test(h)) return 'en';
    return /\/en\//.test(location.pathname) ? 'en' : 'pt';
  }

  function montar(fig) {
    var chave = fig.getAttribute('data-video');
    if (!chave) return;
    if (fig.querySelector('.vfachada')) return;   /* ja montada */
    var lg = lingua(fig);
    var t = TXT[lg];
    /* sem versão na língua da página, usa-se a portuguesa - é melhor um
       vídeo em português do que nenhum */
    var id = (IDS[lg] && IDS[lg][chave]) || IDS.pt[chave];
    var legenda = fig.querySelector('figcaption');
    var titulo = legenda ? legenda.textContent.trim() : chave;
    /* sem data-poster, tenta-se a capa com o nome da chave: é o que a
       galeria usa, onde as figuras só trazem a chave */
    var poster = fig.getAttribute('data-poster') ||
      ('/manual/assets/screens/' + chave + '.png');

    var cx = document.createElement('div');
    cx.className = 'vfachada';
    if (!id) {
      cx.innerHTML = '<div class="vfachada-falta">' + t.falta + '</div>';
      fig.insertBefore(cx, legenda);
      return;
    }
    cx.innerHTML =
      '<button type="button" class="vfachada-btn" aria-label="' + t.ver + ': ' + titulo + '"' +
      (poster ? ' style="background-image:url(\'' + poster + '\')"' : '') + '>' +
      '<span class="vfachada-play" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>' +
      '</span></button>' +
      '<p class="vfachada-nota">' + t.aviso + '</p>';

    cx.querySelector('.vfachada-btn').addEventListener('click', function () {
      var f = document.createElement('iframe');
      /* nocookie + sem sugestões de outros canais no fim */
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1';
      f.title = titulo;
      f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      f.loading = 'lazy';
      f.className = 'vfachada-frame';
      cx.innerHTML = '';
      cx.appendChild(f);
    });

    fig.insertBefore(cx, legenda);
  }

  function arrancar() {
    var figs = document.querySelectorAll('figure[data-video]');
    for (var i = 0; i < figs.length; i++) montar(figs[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();

  /* o MkDocs Material troca de página sem recarregar */
  if (window.document$ && window.document$.subscribe) window.document$.subscribe(arrancar);
})();
