<#
  ENVIAR UMA CAMPANHA PELO OUTLOOK
  =================================
  O Repo prepara a campanha e descarrega um ficheiro campanha-*.json com
  um email por pessoa ("Olá Ana", e links de Inscrever e de sair da
  lista só dela). Este programa envia-os pelo Outlook clássico, um a um,
  a partir da conta do Turismo de Portugal - cada email fica nos Itens
  Enviados dessa conta, como se tivesse sido escrito à mão.

  Porquê o Outlook: a conta é do Microsoft 365 do Turismo de Portugal, e
  nenhum servidor nosso a pode usar sem autorização da informática
  deles. O Outlook do PC já está autorizado - é o próprio formador.

  COMO USAR
    Duplo clique em "Enviar campanha" no Ambiente de trabalho (é o
    Enviar campanha.cmd, que corre isto com -Menu): vai buscar o
    campanha-*.json mais recente das Transferências e pergunta o que
    fazer - ver o rascunho, enviar um teste, enviar a toda a gente, ou
    (depois de enviar) ver os emails devolvidos.

  Ou à mão, numa consola:
    .\enviar-campanha.ps1 -Rascunho          abre o email no Outlook, sem enviar
    .\enviar-campanha.ps1 -Teste             envia UM, só para a zona de testes
    .\enviar-campanha.ps1 -Enviar -Confirmo  envia a toda a gente da campanha
  O rascunho e o teste vão para o endereço de teste que vem no ficheiro
  (luiz.vale@gmail.com); -Para outro@endereco muda-o.
  Sem -Lote, usa o campanha-*.json mais recente das Transferências.

  Envia um de 2,2 em 2,2 segundos: o Microsoft 365 aceita 30 por minuto.
  Se parar a meio, voltar a correr não repete ninguém - o que já foi
  enviado fica num ficheiro ao lado do campanha-*.json.
#>
param(
  [string]$Lote,
  [string]$Para,
  [switch]$Menu,
  [switch]$Rascunho,
  [switch]$Teste,
  [switch]$Enviar,
  [switch]$Confirmo,
  [double]$Segundos = 2.2
)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Sair([string]$texto) {
  if ($texto) { Write-Host ''; Write-Host $texto -ForegroundColor Red }
  if ($Menu) { Write-Host ''; Read-Host 'Carrega em Enter para fechar' | Out-Null }
  exit
}

if (-not $Lote) {
  $Lote = Get-ChildItem (Join-Path $env:USERPROFILE 'Downloads\campanha-*.json') -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
  if (-not $Lote) { Sair 'Não encontrei nenhuma campanha nas Transferências. No Repo, abre a campanha e carrega em "Preparar envio".' }
}
$l = Get-Content -Raw -Encoding UTF8 $Lote | ConvertFrom-Json
$n = @($l.mensagens).Count
$registo = $Lote + '.enviados.txt'
function JaEnviados { if (Test-Path $registo) { @(Get-Content -Encoding UTF8 $registo) } else { @() } }

try {
  $ol = New-Object -ComObject Outlook.Application
  $conta = $null
  foreach ($a in $ol.Session.Accounts) { if ($a.SmtpAddress -match 'turismodeportugal\.pt$') { $conta = $a; break } }
} catch { Sair ('Não consegui abrir o Outlook: ' + $_.Exception.Message) }
if (-not $conta) { Sair 'A conta do Turismo de Portugal não está no Outlook clássico.' }

# O rascunho e o teste vão para a zona de testes (o endereço vem no
# ficheiro); ficheiros antigos, sem ele, vão para a própria conta.
$paraTeste = if ($Para) { $Para } elseif ($l.email_teste) { $l.email_teste } else { $conta.SmtpAddress }

# ---------- Os links do email ----------
# Abre-se cada link de inscrição (e o LinkedIn) como um browser, antes de
# enviar: um link com gralha, ou uma inscrição já fechada, num email que
# já saiu não se corrige. 404/410 ou um endereço que não existe = partido.
# Alguns sites recusam programas (o LinkedIn responde 999, outros 403):
# esses ficam "não deu para confirmar", não "partido".
function VerificarLinks {
  if (-not $l.links) { return @() }
  $ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
  $res = @()
  foreach ($k in @($l.links)) {
    $estado = 'ok'; $nota = ''
    try {
      [void](Invoke-WebRequest -Uri $k.url -Method Get -UseBasicParsing -MaximumRedirection 8 -TimeoutSec 20 -UserAgent $ua)
    } catch {
      $c = $null; try { $c = [int]$_.Exception.Response.StatusCode } catch {}
      if ($c -eq 404 -or $c -eq 410) { $estado = 'mal'; $nota = 'a página não existe (' + $c + ')' }
      elseif ($c) { $estado = 'duvida'; $nota = 'o site não deixou confirmar (' + $c + ')' }
      else { $estado = 'mal'; $nota = 'não abre: ' + $_.Exception.Message }
    }
    $res += [pscustomobject]@{ nome = $k.nome; url = $k.url; estado = $estado; nota = $nota }
  }
  return $res
}
function MostrarLinks {
  if ($null -eq $script:links) { return }
  if (-not @($script:links).Count) { Write-Host '  Links    : (este ficheiro não traz os links para verificar)' -ForegroundColor DarkGray; return }
  $bons = @($script:links | Where-Object { $_.estado -eq 'ok' }).Count
  $tot = @($script:links).Count
  Write-Host ('  Links    : ' + $bons + ' de ' + $tot + ' a funcionar') -ForegroundColor $(if ($bons -eq $tot) { 'Green' } else { 'Yellow' })
  foreach ($k in $script:links) {
    if ($k.estado -eq 'mal') { Write-Host ('             PARTIDO  ' + $k.nome + ': ' + $k.nota) -ForegroundColor Red; Write-Host ('                      ' + $k.url) -ForegroundColor Red }
    elseif ($k.estado -eq 'duvida') { Write-Host ('             ?        ' + $k.nome + ': ' + $k.nota) -ForegroundColor DarkYellow }
  }
}
$links = $null

function Cabecalho {
  $feitos = (JaEnviados).Count
  Write-Host ''
  Write-Host '  ENVIAR CAMPANHA' -ForegroundColor Cyan
  Write-Host ''
  Write-Host ('  Campanha : ' + $l.assunto)
  Write-Host ('  Para     : ' + $n + $(if ($n -eq 1) { ' pessoa' } else { ' pessoas' }) +
    $(if ($feitos) { '  (' + $feitos + $(if ($feitos -eq 1) { ' já enviado)' } else { ' já enviados)' }) } else { '' }))
  Write-Host ('  Sai de   : ' + $conta.SmtpAddress)
  Write-Host ('  Preparada: ' + (Get-Item $Lote).LastWriteTime.ToString('dd/MM/yyyy HH:mm'))
  MostrarLinks
  Write-Host ''
}

function Novo([string]$para, [string]$assunto, [string]$html, [string]$nome = '') {
  $m = $ol.CreateItem(0)
  # SendUsingAccount por InvokeMember: a atribuição directa às vezes não
  # pega no PowerShell, e o email sairia pela conta por omissão
  [void]$m.GetType().InvokeMember('SendUsingAccount', [Reflection.BindingFlags]::SetProperty, $null, $m, @($conta))
  # Destinatário com nome ("Ana <ana@...>") e resolvido: com o endereço
  # solto no .To, o Outlook punha-o entre plicas no nome
  $r = $m.Recipients.Add($(if ($nome) { $nome + ' <' + $para + '>' } else { $para }))
  [void]$r.Resolve()
  $m.Subject = $assunto
  $m.HTMLBody = $html
  return $m
}
function Repo([string]$funcao, $dados) {
  $corpo = $dados | ConvertTo-Json -Compress
  Invoke-RestMethod -Method Post -Uri ($l.supa_url + '/rest/v1/rpc/' + $funcao) `
    -Headers @{ apikey = $l.supa_key; Authorization = ('Bearer ' + $l.supa_key) } `
    -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($corpo))
}
function Marcar([string]$token, [bool]$ok, [string]$erro) {
  try {
    $r = Repo 'campanha_envio_marcar' @{ p_token = $token; p_ok = $ok; p_erro = $erro }
    if (-not $r.ok) { Write-Host '   (o email saiu, mas o Repo não o reconheceu: o ficheiro já não é o da campanha)' -ForegroundColor Yellow }
  } catch { Write-Host ('   (o email saiu, mas não consegui avisar o Repo: ' + $_.Exception.Message + ')') -ForegroundColor Yellow }
}
# O ficheiro ainda é o da campanha? Se a campanha foi gravada outra vez
# no Repo depois de preparada, os códigos de cada pessoa mudaram: os
# emails deste ficheiro sairiam com links que já não registam nada.
# Pergunta-se ao Repo pelo código do primeiro email (só lê).
function FicheiroValido {
  try { return [bool](Repo 'campanha_sair_ver' @{ p_token = @($l.mensagens)[0].token }).ok }
  catch { return $null }   # sem internet: não se sabe
}

# ---------- Emails devolvidos ----------
# Quando um endereço já não existe, o Microsoft 365 devolve um aviso
# ("Não é possível entregar", em inglês "Undeliverable") à caixa do
# Turismo de Portugal. Às vezes é o servidor do outro lado que responde,
# com um email normal do MAILER-DAEMON. Lê-se a Caixa de Entrada e o Lixo
# desde que o ficheiro foi preparado, e procura-se em cada aviso o
# endereço de alguém desta campanha.
$PADRAO_AVISO = '(?i)undeliverable|undelivered|não é possível entregar|nao e possivel entregar|não foi possível entregar|' +
  'delivery status notification \(failure\)|mail delivery failed|delivery has failed|returned mail|falha na entrega|não entregue'
function MotivoDe([string]$texto) {
  $c = ([regex]::Match($texto, '\b5\.\d{1,3}\.\d{1,3}\b')).Value
  # 5.1.x e o 5.4.1 do Microsoft 365: "não foi encontrado" (o endereço não existe)
  if ($c -match '^5\.1\.' -or $c -eq '5.4.1') { return $c + ' o endereço não existe' }
  if ($c -eq '5.2.2') { return $c + ' caixa cheia' }
  if ($c -match '^5\.4\.') { return $c + ' o servidor do destino não aceitou' }
  if ($c) { return $c + ' recusado' }
  return 'devolvido'
}
# Pura (sem Outlook): recebe os itens, devolve @{ email = motivo }.
function AnalisarDevolucoes($itens, [datetime]$desde, [hashtable]$por) {
  $achados = @{}
  foreach ($it in $itens) {
    # os avisos do Microsoft 365 não têm data de receção, só de criação
    $quando = $null
    try { $quando = $it.ReceivedTime } catch {}
    if (-not $quando) { try { $quando = $it.CreationTime } catch {} }
    if (-not $quando -or [datetime]$quando -lt $desde) { continue }
    $classe = [string]$it.MessageClass; $assunto = [string]$it.Subject
    $aviso = ($classe -like 'REPORT.IPM.Note.NDR*') -or ($classe -like 'IPM.Note*' -and $assunto -match $PADRAO_AVISO)
    if (-not $aviso) { continue }
    $corpo = ''; try { $corpo = [string]$it.Body } catch {}
    foreach ($m in [regex]::Matches($assunto + ' ' + $corpo, '[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}')) {
      $e = $m.Value.ToLower().TrimEnd('.')
      if ($por.ContainsKey($e) -and -not $achados.ContainsKey($e)) { $achados[$e] = MotivoDe $corpo }
    }
  }
  return $achados
}
function FazerDevolvidos {
  $por = @{}; foreach ($m in $l.mensagens) { $por[$m.email.ToLower()] = $m }
  $desde = (Get-Item $Lote).LastWriteTime.AddMinutes(-5)
  $achados = @{}
  foreach ($n_pasta in 6, 23) {   # Caixa de Entrada, Lixo
    try {
      $itens = $conta.DeliveryStore.GetDefaultFolder($n_pasta).Items
      $itens.Sort('[CreationTime]', $true)
      $a = AnalisarDevolucoes $itens $desde $por
      foreach ($k in $a.Keys) { if (-not $achados.ContainsKey($k)) { $achados[$k] = $a[$k] } }
    } catch { Write-Host ('  Não consegui ler uma pasta do Outlook: ' + $_.Exception.Message) -ForegroundColor Yellow }
  }
  if (-not $achados.Count) {
    Write-Host '  Nenhum email devolvido desta campanha, até agora.' -ForegroundColor Green
    Write-Host '  Os avisos chegam normalmente em minutos, às vezes horas depois: podes voltar a ver mais tarde.'
    return
  }
  Write-Host ('  Encontrei ' + $achados.Count + $(if ($achados.Count -eq 1) { ' email devolvido:' } else { ' emails devolvidos:' }))
  foreach ($k in $achados.Keys) { Write-Host ('    ' + $k + '  (' + $achados[$k] + ')') }
  Write-Host ''
  $r = Read-Host '  Marcar no Repo? As campanhas seguintes deixam de lhes enviar (S/N)'
  if ($r.Trim() -notmatch '^(?i)s') { Write-Host '  Não marquei nada.'; return }
  $ok = 0
  foreach ($k in $achados.Keys) {
    try {
      $res = Repo 'campanha_devolvido' @{ p_token = $por[$k].token; p_motivo = $achados[$k] }
      if ($res.ok) { $ok++ } else { Write-Host ('    ' + $k + ': o Repo não reconheceu este email') -ForegroundColor Yellow }
    } catch {
      if ("$_" -match '404|PGRST202') { Write-Host '  Falta correr o 14-campanhas-devolvidos.sql no Supabase.' -ForegroundColor Red; return }
      Write-Host ('    ' + $k + ': ' + $_.Exception.Message) -ForegroundColor Red
    }
  }
  Write-Host ('  Marquei ' + $ok + ' no Repo. Vês na campanha e nos Formandos (filtro "Email devolvido").') -ForegroundColor Green
}

function FazerRascunho {
  $m = Novo $paraTeste ('[RASCUNHO] ' + $l.assunto) $l.html_teste
  $m.Save()
  $m.Display()
  Write-Host '  Abri o email no Outlook, sem o enviar. Fecha a janela dele quando acabares de ver.' -ForegroundColor Green
}
function FazerTeste {
  $m = Novo $paraTeste ('[TESTE] ' + $l.assunto) $l.html_teste
  $m.Send()
  Write-Host ('  Enviei um email de teste para ' + $paraTeste + '. Os links dele não registam nada.') -ForegroundColor Green
}
function FazerEnvio {
  $feitos = JaEnviados
  $i = 0; $ok = 0; $mal = 0; $saltados = 0
  foreach ($msg in $l.mensagens) {
    $i++
    if ($feitos -contains $msg.email) { $saltados++; continue }
    try {
      $m = Novo $msg.email $l.assunto $msg.html $msg.nome
      $m.Send()
      Add-Content -Encoding UTF8 $registo $msg.email
      $ok++
      Write-Host ('  [' + $i + '/' + $n + '] enviado  ' + $msg.email)
      Marcar $msg.token $true ''
    } catch {
      $mal++
      Write-Host ('  [' + $i + '/' + $n + '] ERRO     ' + $msg.email + '  ' + $_.Exception.Message) -ForegroundColor Red
      Marcar $msg.token $false $_.Exception.Message
    }
    Start-Sleep -Milliseconds ([int]($Segundos * 1000))
  }
  Write-Host ''
  Write-Host ('  Fim: ' + $ok + ' enviados, ' + $mal + ' com erro' + $(if ($saltados) { ', ' + $saltados + ' já tinham sido enviados antes' } else { '' }) + '.') -ForegroundColor Green
  Write-Host '  Os emails ficam na Caixa de Saída do Outlook até ele os entregar - deixa o Outlook aberto uns minutos.'
}

# ---------- O menu (duplo clique no Ambiente de trabalho) ----------
if ($Menu) {
  Write-Host ''
  Write-Host '  A verificar os links do email...'
  $links = VerificarLinks
  while ($true) {
    Clear-Host
    Cabecalho
    $falta = $n - (JaEnviados).Count
    $valido = FicheiroValido
    if ($valido -eq $false) {
      Write-Host '  ESTE FICHEIRO JÁ NÃO SERVE.' -ForegroundColor Red
      Write-Host '  A campanha foi mudada no Repo depois de o descarregares. No Repo, abre-a' -ForegroundColor Red
      Write-Host '  e carrega em "Preparar envio" para descarregar o ficheiro novo.' -ForegroundColor Red
      Write-Host ''
    } elseif ($null -eq $valido) {
      Write-Host '  Não consegui falar com o Repo (sem internet?). Só envio quando conseguir.' -ForegroundColor Yellow
      Write-Host ''
    }
    Write-Host '  1  Ver o rascunho no Outlook (não envia nada)'
    Write-Host ('  2  Enviar um teste para ' + $paraTeste)
    if (-not $valido) { Write-Host '  3  (enviar: só com um ficheiro válido)' -ForegroundColor DarkGray; $falta = 0 }
    elseif ($falta -gt 0) { Write-Host ('  3  Enviar a ' + $falta + $(if ($falta -eq 1) { ' pessoa' } else { ' pessoas' })) }
    else { Write-Host '  3  (já foi enviada a toda a gente)' -ForegroundColor DarkGray }
    if ($valido) { Write-Host '  4  Ver emails devolvidos desta campanha' } else { Write-Host '  4  (devolvidos: só com um ficheiro válido)' -ForegroundColor DarkGray }
    Write-Host '  0  Sair'
    Write-Host ''
    $o = (Read-Host '  Escolhe').Trim()
    Write-Host ''
    try {
      if ($o -eq '0' -or $o -eq '') { break }
      elseif ($o -eq '1') { FazerRascunho }
      elseif ($o -eq '2') { FazerTeste }
      elseif ($o -eq '3' -and $falta -gt 0) {
        if (@($links | Where-Object { $_.estado -eq 'mal' }).Count) {
          Write-Host '  ATENÇÃO: há links partidos no email (ver acima). O melhor é corrigir no Repo e preparar outra vez.' -ForegroundColor Red
        }
        Write-Host ('  Isto envia ' + $falta + $(if ($falta -eq 1) { ' email' } else { ' emails' }) + ' a partir de ' + $conta.SmtpAddress + '.') -ForegroundColor Yellow
        $c = Read-Host '  Para confirmar, escreve ENVIAR'
        if ($c.Trim() -ceq 'ENVIAR') { Write-Host ''; FazerEnvio }
        else { Write-Host '  Não enviei nada.' }
      }
      elseif ($o -eq '3') { Write-Host '  Com este ficheiro não há nada para enviar.' }
      elseif ($o -eq '4' -and $valido) { FazerDevolvidos }
      elseif ($o -eq '4') { Write-Host '  Com este ficheiro não consigo marcar nada no Repo.' }
      else { Write-Host '  Escolhe 1, 2, 3, 4 ou 0.' }
    } catch { Write-Host ('  Correu mal: ' + $_.Exception.Message) -ForegroundColor Red }
    Write-Host ''
    Read-Host '  Carrega em Enter para voltar ao menu' | Out-Null
  }
  exit
}

# ---------- À mão, numa consola ----------
Cabecalho
if ($Rascunho) { FazerRascunho; return }
if ($Teste) { FazerTeste; return }
if (-not $Enviar) {
  Write-Host 'Nada enviado. Modos: -Menu, -Rascunho, -Teste, ou -Enviar -Confirmo.'
  return
}
if (-not $Confirmo) {
  Write-Host ('Isto envia ' + $n + ' emails a partir de ' + $conta.SmtpAddress + '.')
  Write-Host 'Para enviar mesmo, corre outra vez com -Enviar -Confirmo.'
  return
}
$valido = FicheiroValido
if ($valido -eq $false) { Write-Host 'Este ficheiro já não serve: a campanha foi mudada no Repo depois de preparada. Prepara outra vez.' -ForegroundColor Red; return }
if ($null -eq $valido) { Write-Host 'Não consegui falar com o Repo. Não enviei nada.' -ForegroundColor Yellow; return }
FazerEnvio
