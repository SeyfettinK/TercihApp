# Pre-commit güvenlik kontrolü (PowerShell)
# Kullanım: .\scripts\pre-commit-check.ps1

Write-Host "🔍 GÜVENLİK KONTROLÜ BAŞLIYOR..." -ForegroundColor Cyan
Write-Host ""

$ERRORS = 0

# 1. .env dosyası kontrolü
Write-Host "1️⃣ .env dosyası kontrolü..." -ForegroundColor White
$envInGit = git ls-files --error-unmatch .env 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "❌ HATA: .env dosyası Git'e eklenmiş!" -ForegroundColor Red
    Write-Host "   Çözüm: git rm --cached .env" -ForegroundColor Yellow
    $ERRORS++
} else {
    Write-Host "✅ .env güvenli" -ForegroundColor Green
}
Write-Host ""

# 2. API Key kontrolü
Write-Host "2️⃣ Gerçek API key kontrolü..." -ForegroundColor White
$apiKeyFound = git diff --cached | Select-String -Pattern "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+"
if ($apiKeyFound) {
    Write-Host "❌ HATA: Gerçek API key bulundu!" -ForegroundColor Red
    Write-Host "   Lütfen hardcoded key'leri kaldırın" -ForegroundColor Yellow
    $ERRORS++
} else {
    Write-Host "✅ API key güvenli" -ForegroundColor Green
}
Write-Host ""

# 3. Service Role Key kontrolü
Write-Host "3️⃣ Service Role Key kontrolü..." -ForegroundColor White
$serviceKeyFound = git diff --cached scripts/ | Select-String -Pattern "service_role.*eyJ"
if ($serviceKeyFound) {
    Write-Host "❌ HATA: Service Role Key bulundu!" -ForegroundColor Red
    Write-Host "   Placeholder kullanın: 'YOUR_SERVICE_ROLE_KEY_HERE'" -ForegroundColor Yellow
    $ERRORS++
} else {
    Write-Host "✅ Service Role Key güvenli" -ForegroundColor Green
}
Write-Host ""

# 4. node_modules kontrolü
Write-Host "4️⃣ node_modules kontrolü..." -ForegroundColor White
$nodeModulesInGit = git ls-files | Select-String -Pattern "node_modules/"
if ($nodeModulesInGit) {
    Write-Host "⚠️  UYARI: node_modules Git'e eklenmiş olabilir" -ForegroundColor Yellow
    $ERRORS++
} else {
    Write-Host "✅ node_modules güvenli" -ForegroundColor Green
}
Write-Host ""

# 5. dist klasörü kontrolü
Write-Host "5️⃣ dist klasörü kontrolü..." -ForegroundColor White
$distInStaged = git diff --cached --name-only | Select-String -Pattern "^dist/"
if ($distInStaged) {
    Write-Host "⚠️  UYARI: dist klasörü commit edilecek" -ForegroundColor Yellow
    Write-Host "   Build dosyaları genellikle commit edilmez" -ForegroundColor Yellow
} else {
    Write-Host "✅ dist klasörü temiz" -ForegroundColor Green
}
Write-Host ""

# Sonuç
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
if ($ERRORS -eq 0) {
    Write-Host "✨ TÜM KONTROLLER BAŞARILI!" -ForegroundColor Green
    Write-Host "Commit yapmaya devam edebilirsiniz." -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ $ERRORS HATA BULUNDU!" -ForegroundColor Red
    Write-Host "Lütfen hataları düzeltin ve tekrar deneyin." -ForegroundColor Red
    exit 1
}

