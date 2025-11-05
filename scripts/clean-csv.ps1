# Clean CSV for Supabase import
$csvFile = "C:\Users\rusha\Downloads\AccuCoder\icd10cm_drug_2026_clean.csv"
$outputFile = "C:\Users\rusha\Downloads\AccuCoder\icd10cm_drug_2026_final.csv"

Write-Host "Reading CSV file..." -ForegroundColor Cyan

# Read all lines
$lines = Get-Content $csvFile

# Skip the first line (title row), keep from line 2 onwards
$cleanLines = $lines | Select-Object -Skip 1

# Write to new file
$cleanLines | Set-Content $outputFile -Encoding UTF8

Write-Host "Removed title row" -ForegroundColor Green

# Now read as CSV and clean data
$data = Import-Csv $outputFile

Write-Host "Original row count: $($data.Count)" -ForegroundColor Yellow

# Clean the data - remove rows with empty substance or #NAME?
$cleanData = $data | Where-Object { 
    $_.Substance -and 
    $_.Substance -ne '#NAME?' -and 
    $_.Substance.Trim() -ne ''
}

# Replace '--' with empty string in all columns
$cleanData = $cleanData | ForEach-Object {
    $row = $_
    $row.'Poisoning Accidental (unintentional)' = if ($row.'Poisoning Accidental (unintentional)' -eq '--') { '' } else { $row.'Poisoning Accidental (unintentional)' }
    $row.'Poisoning Intentional self-harm' = if ($row.'Poisoning Intentional self-harm' -eq '--') { '' } else { $row.'Poisoning Intentional self-harm' }
    $row.'Poisoning Assault' = if ($row.'Poisoning Assault' -eq '--') { '' } else { $row.'Poisoning Assault' }
    $row.'Poisoning Undetermined' = if ($row.'Poisoning Undetermined' -eq '--') { '' } else { $row.'Poisoning Undetermined' }
    $row.'Adverse effect' = if ($row.'Adverse effect' -eq '--') { '' } else { $row.'Adverse effect' }
    $row.'Underdosing' = if ($row.'Underdosing' -eq '--') { '' } else { $row.'Underdosing' }
    $row
}

# Rename columns to match database
$finalData = $cleanData | Select-Object @{
    Name='substance'; Expression={$_.Substance}
}, @{
    Name='poisoning_accidental_unintentional'; Expression={$_.'Poisoning Accidental (unintentional)'}
}, @{
    Name='poisoning_intentional_self_harm'; Expression={$_.'Poisoning Intentional self-harm'}
}, @{
    Name='poisoning_assault'; Expression={$_.'Poisoning Assault'}
}, @{
    Name='poisoning_undetermined'; Expression={$_.'Poisoning Undetermined'}
}, @{
    Name='adverse_effect'; Expression={$_.'Adverse effect'}
}, @{
    Name='underdosing'; Expression={$_.'Underdosing'}
}

Write-Host "Clean row count: $($finalData.Count)" -ForegroundColor Green

# Export
$finalData | Export-Csv -Path $outputFile -NoTypeInformation -Encoding UTF8

Write-Host "`nFinal CSV saved to: $outputFile" -ForegroundColor Green
Write-Host "Ready to import to Supabase!" -ForegroundColor Cyan
Write-Host "`nFirst 3 substances:" -ForegroundColor Yellow
$finalData | Select-Object -First 3 | ForEach-Object { Write-Host "  - $($_.substance)" }
