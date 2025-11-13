# Quick Start for Presentation

Write-Host "🚀 Starting AccuCoder for Presentation..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    pnpm install
}

# Start the development server
Write-Host "🎯 Starting development server..." -ForegroundColor Green
Write-Host ""
Write-Host "✅ AccuCoder will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Presentation Flow:" -ForegroundColor Cyan
Write-Host "  1. Landing Page (/) - Show features and design" -ForegroundColor White
Write-Host "  2. Signup (/signup) - Create demo account" -ForegroundColor White
Write-Host "  3. Login (/login) - Sign in" -ForegroundColor White
Write-Host "  4. Alphabetical Index (/index) - Main app interface" -ForegroundColor White
Write-Host ""
Write-Host "💡 Demo Account: Rohitpekhale690@gmail.com (Superadmin)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server when done." -ForegroundColor Red
Write-Host ""

npm run dev
