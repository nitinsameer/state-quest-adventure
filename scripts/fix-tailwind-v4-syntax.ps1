# Fix inert Tailwind v3 syntax to v4 syntax
# Converts property-[--variable] to property-(--variable)

$files = Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts,*.jsx,*.js

$totalFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    $pattern = '([a-z-]+)-\[(--[a-z0-9-]+)\]'
    $replacement = '$1-($2)'
    
    $content = $content -replace $pattern, $replacement
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $replacementCount = ([regex]::Matches($originalContent, $pattern)).Count
        $totalReplacements += $replacementCount
        $totalFiles++
        Write-Host "Modified $($file.Name): $replacementCount replacements"
    }
}

Write-Host "Files modified: $totalFiles"
Write-Host "Total replacements: $totalReplacements"
