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

  /* chave do vídeo -> id no canal. Preenchido depois do upload.
     Enquanto estiver vazio, o bloco mostra que o vídeo ainda não subiu em
     vez de mostrar um leitor partido. */
  var IDS = {
    // 'resumo': 'xxxxxxxxxxx',
    // 'dashboard': 'xxxxxxxxxxx',
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
    var t = TXT[lingua(fig)];
    var id = IDS[chave];
    var legenda = fig.querySelector('figcaption');
    var titulo = legenda ? legenda.textContent.trim() : chave;
    var poster = fig.getAttribute('data-poster') || '';

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
