# PreToolUse hook (Write|Edit) — bloquea violaciones de arquitectura/estilo.
# Lee el JSON del hook por stdin. exit 2 = bloquea (stderr va a Claude). exit 0 = permite.
# Fail-open: ante cualquier error inesperado NO bloquea (exit 0).

try {
    $raw = [Console]::In.ReadToEnd()
    if ([string]::IsNullOrWhiteSpace($raw)) { exit 0 }
    $data = $raw | ConvertFrom-Json
} catch { exit 0 }

$ti = $data.tool_input
if ($null -eq $ti) { exit 0 }

$path = [string]$ti.file_path
if ([string]::IsNullOrWhiteSpace($path)) { exit 0 }

# Contenido nuevo: Write -> content ; Edit -> new_string
$content = ''
if ($null -ne $ti.content) { $content = [string]$ti.content }
elseif ($null -ne $ti.new_string) { $content = [string]$ti.new_string }

$p = $path -replace '\\', '/'
$lower = $p.ToLower()
$fileName = ($p -split '/')[-1]

$inSrc = $lower -match '/src/'
$isTs = $lower.EndsWith('.ts')
$isVue = $lower.EndsWith('.vue')
$isCss = $lower.EndsWith('.css')

$violations = @()

# 1) Prohibido 'any' en TS/Vue dentro de src/
if ($inSrc -and ($isTs -or $isVue) -and $content.Length -gt 0) {
    if ($content -match ':\s*any\b' -or $content -match '\bas\s+any\b' -or $content -match '<\s*any\s*[>,]' -or $content -match ',\s*any\s*>') {
        $violations += "Uso de 'any' prohibido (usa 'unknown' + narrowing). Ver .claude/rules/style.md"
    }
}

# 2) Prohibido README.md / INDEX.md dentro de src/
if ($inSrc -and ($lower -match '/(readme|index)\.md$')) {
    $violations += "Prohibido README.md/INDEX.md dentro de src/. La doc va en docs/generated/."
}

# 3) Prohibido import directo de axios fuera de src/models/application.ts
if ($inSrc -and $isTs -and ($lower -notmatch '/src/models/application\.ts$') -and $content.Length -gt 0) {
    if ($content -match "from\s+['""]axios['""]" -or $content -match "import\s+axios\b" -or $content -match "require\(\s*['""]axios['""]") {
        $violations += "Import directo de 'axios' prohibido fuera de src/models/application.ts. Usa Application.axiosInstance."
    }
}

# 4) Las entidades deben extends BaseEntity
if (($lower -match '/src/entities/') -and $isTs -and ($lower -notmatch '/base_entity\.ts$') -and $content.Length -gt 0) {
    if ($content -match 'export\s+class\s+\w+' -and $content -notmatch 'extends\s+BaseEntity') {
        $violations += "Las entidades deben 'extends BaseEntity'. Ver .claude/rules/entities.md"
    }
}

# 5) CSS: prohibido !important
if (($isVue -or $isCss) -and $content -match '!important') {
    $violations += "Prohibido '!important' en CSS. Usa especificidad/tokens. Ver .claude/rules/components.md"
}

# 6) No escribir archivos .env (excepto .env.example)
if (($fileName -eq '.env') -or ($fileName -like '.env.*' -and $fileName -ne '.env.example')) {
    $violations += "No se permite escribir/editar archivos .env desde el agente."
}

if ($violations.Count -gt 0) {
    [Console]::Error.WriteLine("BLOQUEADO por saas-framework-kit (PreToolUse) en $path")
    foreach ($v in $violations) { [Console]::Error.WriteLine(" - $v") }
    exit 2
}

exit 0
