[CmdletBinding()]
param(
    [string]$OutputPath = [System.IO.Path]::Combine([System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::MyDocuments), "cely_bubakov.txt")
)

$ErrorActionPreference = "Stop"
$rootDir = (Get-Location).Path

$configFiles = @(
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
    "eslint.config.js",
    "GLOSSARY.md"
)

$docFiles = Get-ChildItem -Path "docs/adr/*.md", "docs/specs/*.md" -ErrorAction SilentlyContinue | ForEach-Object {
    $_.FullName.Substring($rootDir.Length + 1).Replace('\', '/')
}

$srcFiles = Get-ChildItem -Path "src" -Recurse -File | Where-Object {
    $rel = $_.FullName.Substring($rootDir.Length + 1).Replace('\', '/')
    $rel -notmatch '^src/i18n/locales/' -and
    $rel -notmatch '^src/components/(AnimationTesterModal|TestModeModal|SettingsDevModal|KronikaChanges)\.tsx$' -and
    $rel -notmatch '\.test\.ts$'
} | ForEach-Object {
    $_.FullName.Substring($rootDir.Length + 1).Replace('\', '/')
}

$perfTests = @(
    "tests/zeroAllocationRender.test.ts",
    "tests/arenaRenderer.test.ts",
    "tests/chunkCache.test.ts",
    "tests/glyphAtlas.test.ts",
    "tests/downscaledLighting.test.ts"
)

$selectedFiles = @($configFiles) + @($docFiles) + @($srcFiles) + @($perfTests)

$outDir = [System.IO.Path]::GetDirectoryName($OutputPath)
if (-not [string]::IsNullOrEmpty($outDir) -and -not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$sw = New-Object System.IO.StreamWriter($OutputPath, $false, $utf8NoBom)

try {
    $count = 0
    foreach ($relPath in $selectedFiles) {
        $fullPath = Join-Path $rootDir $relPath
        if (Test-Path $fullPath) {
            $sw.WriteLine("`n====================")
            $sw.WriteLine("SOUBOR: $relPath")
            $sw.WriteLine("====================`n")
            
            $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
            $sw.Write($content)
            if (-not $content.EndsWith("`n")) {
                $sw.WriteLine()
            }
            $count++
        }
    }
} finally {
    $sw.Dispose()
}

$fileInfo = Get-Item $OutputPath
Write-Host "Export dokoncen: $($fileInfo.FullName)"
Write-Host "Zahrnuto souboru: $count"
Write-Host "Velikost: $([math]::Round($fileInfo.Length / 1MB, 2)) MB ($($fileInfo.Length) bajtu)"
