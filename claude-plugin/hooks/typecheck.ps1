# Stop hook — corre el type-check UNA vez al terminar el turno si hubo cambios .ts/.vue.
# Si falla, devuelve {"decision":"block","reason":...} para que Claude lo corrija antes de terminar.
# Fail-open: ante cualquier problema NO bloquea (exit 0).

try {
    $raw = [Console]::In.ReadToEnd()
    $data = if ([string]::IsNullOrWhiteSpace($raw)) { $null } else { $raw | ConvertFrom-Json }
} catch { $data = $null }

# Evita bucles: si ya venimos de un bloqueo de Stop, no vuelvas a bloquear.
if ($null -ne $data -and $data.stop_hook_active -eq $true) { exit 0 }

$projectDir = $env:CLAUDE_PROJECT_DIR
if ([string]::IsNullOrWhiteSpace($projectDir)) { $projectDir = (Get-Location).Path }
Set-Location $projectDir

# Solo corre si hay cambios .ts/.vue (barato en turnos sin código).
$changed = @()
try {
    $changed = @(git status --porcelain 2>$null | Where-Object { $_ -match '\.(ts|vue)(\s|$)' })
} catch { $changed = @() }
if ($changed.Count -eq 0) { exit 0 }

$tsc = Join-Path $projectDir 'node_modules/vue-tsc/bin/vue-tsc.js'
if (-not (Test-Path $tsc)) { exit 0 }

try {
    $out = (& node $tsc --noEmit 2>&1 | Out-String)
    $code = $LASTEXITCODE
} catch { exit 0 }

if ($code -ne 0) {
    $trimmed = $out.Trim()
    if ($trimmed.Length -gt 6000) { $trimmed = $trimmed.Substring(0, 6000) + "`n... (truncado)" }
    $reason = "vue-tsc encontró errores de tipo. Corrígelos antes de terminar:`n$trimmed"
    $payload = @{ decision = 'block'; reason = $reason } | ConvertTo-Json -Compress
    [Console]::Out.WriteLine($payload)
    exit 0
}

exit 0
