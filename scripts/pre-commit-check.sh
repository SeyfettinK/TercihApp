#!/bin/bash
# Pre-commit güvenlik kontrolü
# Kullanım: bash scripts/pre-commit-check.sh

echo "🔍 GÜVENLİK KONTROLÜ BAŞLIYOR..."
echo ""

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. .env dosyası kontrolü
echo "1️⃣ .env dosyası kontrolü..."
if git ls-files --error-unmatch .env 2>/dev/null; then
    echo -e "${RED}❌ HATA: .env dosyası Git'e eklenmiş!${NC}"
    echo "   Çözüm: git rm --cached .env"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ .env güvenli${NC}"
fi
echo ""

# 2. API Key kontrolü
echo "2️⃣ Gerçek API key kontrolü..."
if git diff --cached | grep -qE "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+"; then
    echo -e "${RED}❌ HATA: Gerçek API key bulundu!${NC}"
    echo "   Lütfen hardcoded key'leri kaldırın"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ API key güvenli${NC}"
fi
echo ""

# 3. Service Role Key kontrolü
echo "3️⃣ Service Role Key kontrolü..."
if git diff --cached scripts/ | grep -E "service_role.*eyJ"; then
    echo -e "${RED}❌ HATA: Service Role Key bulundu!${NC}"
    echo "   Placeholder kullanın: 'YOUR_SERVICE_ROLE_KEY_HERE'"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Service Role Key güvenli${NC}"
fi
echo ""

# 4. node_modules kontrolü
echo "4️⃣ node_modules kontrolü..."
if git ls-files | grep -q "node_modules/"; then
    echo -e "${YELLOW}⚠️  UYARI: node_modules Git'e eklenmiş olabilir${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ node_modules güvenli${NC}"
fi
echo ""

# 5. dist klasörü kontrolü
echo "5️⃣ dist klasörü kontrolü..."
if git diff --cached --name-only | grep -q "^dist/"; then
    echo -e "${YELLOW}⚠️  UYARI: dist klasörü commit edilecek${NC}"
    echo "   Build dosyaları genellikle commit edilmez"
else
    echo -e "${GREEN}✅ dist klasörü temiz${NC}"
fi
echo ""

# Sonuç
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✨ TÜM KONTROLLER BAŞARILI!${NC}"
    echo "Commit yapmaya devam edebilirsiniz."
    exit 0
else
    echo -e "${RED}❌ $ERRORS HATA BULUNDU!${NC}"
    echo "Lütfen hataları düzeltin ve tekrar deneyin."
    exit 1
fi

