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
    fazer - ver o rascunho, enviar um teste, ou enviar a toda a gente.

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

function Cabecalho {
  $feitos = (JaEnviados).Count
  Write-Host ''
  Write-Host '  ENVIAR CAMPANHA' -ForegroundColor Cyan
  Write-Host ''
  Write-Host ('  Campanha : ' + $l.assunto)
  Write-Host ('  Para     : ' + $n + $(if ($n -eq 1) { ' pessoa' } else { ' pessoas' }) +
    $(if ($feitos) { '  (' + $feitos + ' já enviados)' } else { '' }))
  Write-Host ('  Sai de   : ' + $conta.SmtpAddress)
  Write-Host ('  Preparada: ' + (Get-Item $Lote).LastWriteTime.ToString('dd/MM/yyyy HH:mm'))
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
function Marcar([string]$token, [bool]$ok, [string]$erro) {
  $corpo = @{ p_token = $token; p_ok = $ok; p_erro = $erro } | ConvertTo-Json -Compress
  try {
    Invoke-RestMethod -Method Post -Uri ($l.supa_url + '/rest/v1/rpc/campanha_envio_marcar') `
      -Headers @{ apikey = $l.supa_key; Authorization = ('Bearer ' + $l.supa_key) } `
      -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($corpo)) | Out-Null
  } catch { Write-Host ('   (o email saiu, mas não consegui avisar o Repo: ' + $_.Exception.Message + ')') -ForegroundColor Yellow }
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
  while ($true) {
    Clear-Host
    Cabecalho
    $falta = $n - (JaEnviados).Count
    Write-Host '  1  Ver o rascunho no Outlook (não envia nada)'
    Write-Host ('  2  Enviar um teste para ' + $paraTeste)
    if ($falta -gt 0) { Write-Host ('  3  Enviar a ' + $falta + $(if ($falta -eq 1) { ' pessoa' } else { ' pessoas' })) }
    else { Write-Host '  3  (já foi enviada a toda a gente)' -ForegroundColor DarkGray }
    Write-Host '  0  Sair'
    Write-Host ''
    $o = (Read-Host '  Escolhe').Trim()
    Write-Host ''
    try {
      if ($o -eq '0' -or $o -eq '') { break }
      elseif ($o -eq '1') { FazerRascunho }
      elseif ($o -eq '2') { FazerTeste }
      elseif ($o -eq '3' -and $falta -gt 0) {
        Write-Host ('  Isto envia ' + $falta + $(if ($falta -eq 1) { ' email' } else { ' emails' }) + ' a partir de ' + $conta.SmtpAddress + '.') -ForegroundColor Yellow
        $c = Read-Host '  Para confirmar, escreve ENVIAR'
        if ($c.Trim() -ceq 'ENVIAR') { Write-Host ''; FazerEnvio }
        else { Write-Host '  Não enviei nada.' }
      }
      else { Write-Host '  Escolhe 1, 2, 3 ou 0.' }
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
FazerEnvio
