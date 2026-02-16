# Script para corregir indentación a 4 espacios
# Regulado por 06-CODE-STYLING-STANDARDS § 6.1.1

Write-Host "Corrigiendo indentación a 4 espacios en archivos .ts y .vue..." -ForegroundColor Cyan

$files = Get-ChildItem -Path ".\src" -Include "*.ts","*.vue" -Recurse -File

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content) {
        # Convertir tabs a espacios
        $content = $content -replace "`t", "    "
        
        # Reindenter líneas con 2 espacios a 4 espacios
        # Esto es un heurístico simple: reemplaza pares de espacios al inicio de línea
        $lines = $content -split "`r?`n"
        $fixedLines = @()
        
        foreach ($line in $lines) {
            if ($line -match "^( +)(.*)$") {
                $spaces = $matches[1]
                $rest = $matches[2]
                $numSpaces = $spaces.Length
                
                # Si es múltiplo de 2 pero no de 4, convertir
                if (($numSpaces % 2 -eq 0) -and ($numSpaces % 4 -ne 0)) {
                    $newIndent = " " * (($numSpaces / 2) * 4)
                    $fixedLines += $newIndent + $rest
                } else {
                    $fixedLines += $line
                }
            } else {
                $fixedLines += $line
            }
        }
        
        $newContent = $fixedLines -join "`n"
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        $count++
    }
}

Write-Host "✓ Corregidos $count archivos" -ForegroundColor Green
