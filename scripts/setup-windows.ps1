# Cal AI — Windows / corporate network setup helper
# Run from project root: powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "==> Node: $(node -v)" -ForegroundColor Cyan
Write-Host "==> npm:  $(npm -v)" -ForegroundColor Cyan

# Optional: set corporate proxy (uncomment and edit)
# npm config set proxy "http://YOUR_PROXY:PORT"
# npm config set https-proxy "http://YOUR_PROXY:PORT"

# Optional: use company root CA instead of strict-ssl=false (recommended for production)
# npm config set cafile "C:\path\to\corp-root-ca.pem"
# npm config set strict-ssl true

Write-Host "==> Cleaning install artifacts..." -ForegroundColor Yellow
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
if (Test-Path package-lock.json) { Remove-Item -Force package-lock.json }
if (Test-Path .expo) { Remove-Item -Recurse -Force .expo }

Write-Host "==> Installing dependencies (SDK 54)..." -ForegroundColor Yellow
npm install

Write-Host "==> Aligning Expo packages..." -ForegroundColor Yellow
npx expo install --fix

Write-Host "==> Running Expo Doctor..." -ForegroundColor Yellow
npx expo-doctor

Write-Host "==> TypeScript check..." -ForegroundColor Yellow
npm run typecheck

Write-Host ""
Write-Host "Done. Start with tunnel:" -ForegroundColor Green
Write-Host "  npx expo start --tunnel --clear" -ForegroundColor Green
