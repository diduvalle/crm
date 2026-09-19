/* Analítica de primeira-parte do manual IEFP CRM.
   Sem cookies, sem dados pessoais, sem terceiros — regista só a visita
   (página, idioma, dispositivo, host de origem) e os "play" dos vídeos.
   Falha em silêncio se a tabela ainda não existir / sem rede. */
(function () {
  var U = 'https://qgfzbyhfyqvmmmdiqycu.supabase.co';
  var K = 'sb_publishable_atlEEoeN4-CWY8mD7KQNsw_m1cXjdIE';
  function host(u) { try { return new URL(u).host; } catch (e) { return ''; } }
  function device() { try { return matchMedia('(max-width:48em)').matches ? 'mobile' : 'desktop'; } catch (e) { return ''; } }
  function send(rec) {
    try {
      fetch(U + '/rest/v1/site_views', {
        method: 'POST',
        headers: { 'apikey': K, 'Authorization': 'Bearer ' + K, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify(rec), keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }
  var lang = (document.documentElement.lang || 'pt').slice(0, 2);
  function tzone() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } }
  send({ site: 'manual', kind: 'pageview', path: location.pathname, ref: host(document.referrer), lang: lang, device: device(), tz: tzone() });
  // "play" de vídeos (top vídeos)
  document.addEventListener('play', function (e) {
    var v = e.target;
    if (v && v.tagName === 'VIDEO') {
      send({ site: 'manual', kind: 'video', path: location.pathname, label: (v.currentSrc || '').split('/').pop() || '', lang: lang, device: device() });
    }
  }, true);
})();
