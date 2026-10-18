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

  COMO USAR (por esta ordem)
    .\enviar-campanha.ps1 -Rascunho          abre o email no Outlook, sem enviar
    .\enviar-campanha.ps1 -Teste             envia UM, só para a zona de testes
  O rascunho e o teste vão para o endereço de teste que vem no ficheiro
  (luiz.vale@gmail.com); -Para outro@endereco muda-o.
    .\enviar-campanha.ps1 -Enviar -Confirmo  envia a toda a gente da campanha
  Sem -Lote, usa o campanha-*.json mais recente das Transferências.
  Sem nenhum modo, só diz o que está no ficheiro e por que conta sairia.

  Envia um de 2,2 em 2,2 segundos: o Microsoft 365 aceita 30 por minuto.
  Se parar a meio, voltar a correr não repete ninguém - o que já foi
  enviado fica num ficheiro ao lado do campanha-*.json.
#>
param(
  [string]$Lote,
  [string]$Para,
  [switch]$Rascunho,
  [switch]$Teste,
  [switch]$Enviar,
  [switch]$Confirmo,
  [double]$Segundos = 2.2
)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

if (-not $Lote) {
  $Lote = Get-ChildItem (Join-Path $env:USERPROFILE 'Downloads\campanha-*.json') -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
  if (-not $Lote) { throw 'Não encontrei nenhum campanha-*.json nas Transferências.' }
}
$l = Get-Content -Raw -Encoding UTF8 $Lote | ConvertFrom-Json
$n = @($l.mensagens).Count
Write-Host ''
Write-Host ('Campanha : ' + $l.assunto)
Write-Host ('Ficheiro : ' + (Split-Path $Lote -Leaf) + '  (' + $n + $(if ($n -eq 1) { ' email)' } else { ' emails)' }))

$ol = New-Object -ComObject Outlook.Application
$conta = $null
foreach ($a in $ol.Session.Accounts) { if ($a.SmtpAddress -match 'turismodeportugal\.pt$') { $conta = $a; break } }
if (-not $conta) { throw 'A conta do Turismo de Portugal não está no Outlook clássico.' }
Write-Host ('Sai de   : ' + $conta.SmtpAddress)
Write-Host ''

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
function Marcar([string]$token, [bool]$ok, [string]$erro) {
  $corpo = @{ p_token = $token; p_ok = $ok; p_erro = $erro } | ConvertTo-Json -Compress
  try {
    Invoke-RestMethod -Method Post -Uri ($l.supa_url + '/rest/v1/rpc/campanha_envio_marcar') `
      -Headers @{ apikey = $l.supa_key; Authorization = ('Bearer ' + $l.supa_key) } `
      -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($corpo)) | Out-Null
  } catch { Write-Host ('   (o email saiu, mas não consegui avisar o Repo: ' + $_.Exception.Message + ')') -ForegroundColor Yellow }
}

# O rascunho e o teste vão para a zona de testes (o endereço vem no
# ficheiro); ficheiros antigos, sem ele, vão para a própria conta.
$paraTeste = if ($Para) { $Para } elseif ($l.email_teste) { $l.email_teste } else { $conta.SmtpAddress }

if ($Rascunho) {
  $m = Novo $paraTeste ('[RASCUNHO] ' + $l.assunto) $l.html_teste
  $m.Save()
  $m.Display()
  Write-Host 'Abri o email no Outlook, sem o enviar. Fecha a janela quando acabares de ver.'
  return
}
if ($Teste) {
  $m = Novo $paraTeste ('[TESTE] ' + $l.assunto) $l.html_teste
  $m.Send()
  Write-Host ('Enviei um email de teste para ' + $paraTeste + '. Os links dele não registam nada.')
  return
}
if (-not $Enviar) {
  Write-Host 'Nada enviado. Modos: -Rascunho, -Teste, ou -Enviar -Confirmo.'
  return
}
if (-not $Confirmo) {
  Write-Host ('Isto envia ' + $n + ' emails a partir de ' + $conta.SmtpAddress + '.')
  Write-Host 'Para enviar mesmo, corre outra vez com -Enviar -Confirmo.'
  return
}

$registo = $Lote + '.enviados.txt'
$feitos = @(); if (Test-Path $registo) { $feitos = @(Get-Content -Encoding UTF8 $registo) }
$i = 0; $ok = 0; $mal = 0; $saltados = 0
foreach ($msg in $l.mensagens) {
  $i++
  if ($feitos -contains $msg.email) { $saltados++; continue }
  try {
    $m = Novo $msg.email $l.assunto $msg.html $msg.nome
    $m.Send()
    Add-Content -Encoding UTF8 $registo $msg.email
    $ok++
    Write-Host ('[' + $i + '/' + $n + '] enviado  ' + $msg.email)
    Marcar $msg.token $true ''
  } catch {
    $mal++
    Write-Host ('[' + $i + '/' + $n + '] ERRO     ' + $msg.email + '  ' + $_.Exception.Message) -ForegroundColor Red
    Marcar $msg.token $false $_.Exception.Message
  }
  Start-Sleep -Milliseconds ([int]($Segundos * 1000))
}
Write-Host ''
Write-Host ('Fim: ' + $ok + ' enviados, ' + $mal + ' com erro' + $(if ($saltados) { ', ' + $saltados + ' já tinham sido enviados antes' } else { '' }) + '.')
Write-Host 'Os emails ficam na Caixa de Saída do Outlook até ele os entregar - deixa o Outlook aberto uns minutos.'
