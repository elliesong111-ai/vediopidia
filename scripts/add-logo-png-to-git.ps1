# Add logo-mage.png to Git and push to main
# Option A: Save logo-mage.png to assets/ (from export-logo-png.html download), then run this script
# Option B: Copy PNG base64 from export page into assets/logo-mage-base64.txt, then run this script

$root = Join-Path $PSScriptRoot ".."
$assets = Join-Path $root "assets"
$pngPath = Join-Path $assets "logo-mage.png"
$base64Path = Join-Path $assets "logo-mage-base64.txt"

Set-Location $root

# If PNG missing but base64 file exists, decode it to PNG
if (-not (Test-Path $pngPath) -and (Test-Path $base64Path)) {
    $base64 = Get-Content $base64Path -Raw
    $base64 = $base64 -replace '\s', ''
    if ($base64.Length -gt 100) {
        [IO.File]::WriteAllBytes($pngPath, [Convert]::FromBase64String($base64))
        Remove-Item $base64Path -Force
        Write-Host "Created logo-mage.png from base64." -ForegroundColor Green
    } else {
        Write-Host "logo-mage-base64.txt seems empty or invalid." -ForegroundColor Yellow
        exit 1
    }
}

if (-not (Test-Path $pngPath)) {
    Write-Host "logo-mage.png not found in assets/." -ForegroundColor Yellow
    Write-Host "1. Open assets/export-logo-png.html in a browser"
    Write-Host "2. Click 'Download logo-mage.png' and save to assets/, OR"
    Write-Host "   Click 'Copy PNG base64', paste into assets/logo-mage-base64.txt, then run this script again"
    exit 1
}

git add assets/logo-mage.png
git add -A
git status
git commit -m "Add logo-mage.png to repo"
git push origin main
Write-Host "Done. logo-mage.png is now in the repo." -ForegroundColor Green
