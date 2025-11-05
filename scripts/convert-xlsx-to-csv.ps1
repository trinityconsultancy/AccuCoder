# Convert XLSX to CSV properly
$excelFile = "C:\Users\rusha\OneDrive\Desktop\icd10cm_drug_2026.xlsx"
$csvFile = "C:\Users\rusha\Downloads\AccuCoder\icd10cm_drug_2026_clean.csv"

Write-Host "Converting XLSX to CSV..." -ForegroundColor Cyan

# Create Excel COM object
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    # Open the workbook
    $workbook = $excel.Workbooks.Open($excelFile)
    $worksheet = $workbook.Worksheets.Item(1)
    
    # Get used range
    $usedRange = $worksheet.UsedRange
    $rowCount = $usedRange.Rows.Count
    $colCount = $usedRange.Columns.Count
    
    Write-Host "Found $rowCount rows and $colCount columns" -ForegroundColor Green
    
    # Save as CSV
    $workbook.SaveAs($csvFile, 6) # 6 = CSV format
    $workbook.Close($false)
    
    Write-Host "Successfully converted to: $csvFile" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
} finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    Remove-Variable excel
}

Write-Host "`nNow cleaning the CSV file..." -ForegroundColor Cyan

# Read and clean the CSV
$data = Import-Csv $csvFile

Write-Host "Original row count: $($data.Count)" -ForegroundColor Yellow

# Get the header names
$headers = $data[0].PSObject.Properties.Name
Write-Host "Headers: $($headers -join ', ')" -ForegroundColor Yellow

# Rename headers to match database schema
$cleanData = $data | Select-Object @{
    Name='substance'; Expression={$_.$($headers[0])}
}, @{
    Name='poisoning_accidental_unintentional'; Expression={
        $val = $_.$($headers[1])
        if ($val -eq '--' -or $val -eq '#NAME?' -or [string]::IsNullOrWhiteSpace($val)) { '' } else { $val }
    }
}, @{
    Name='poisoning_intentional_self_harm'; Expression={
        $val = $_.$($headers[2])
        if ($val -eq '--' -or $val -eq '#NAME?' -or [string]::IsNullOrWhiteSpace($val)) { '' } else { $val }
    }
}, @{
    Name='poisoning_assault'; Expression={
        $val = $_.$($headers[3])
        if ($val -eq '--' -or $val -eq '#NAME?' -or [string]::IsNullOrWhiteSpace($val)) { '' } else { $val }
    }
}, @{
    Name='poisoning_undetermined'; Expression={
        $val = $_.$($headers[4])
        if ($val -eq '--' -or $val -eq '#NAME?' -or [string]::IsNullOrWhiteSpace($val)) { '' } else { $val }
    }
}, @{
    Name='adverse_effect'; Expression={
        $val = $_.$($headers[5])
        if ($val -eq '--' -or $val -eq '#NAME?' -or [string]::IsNullOrWhiteSpace($val)) { '' } else { $val }
    }
}, @{
    Name='underdosing'; Expression={
        $val = $_.$($headers[6])
        if ($val -eq '--' -or $val -eq '#NAME?' -or [string]::IsNullOrWhiteSpace($val)) { '' } else { $val }
    }
}

# Remove rows where substance is empty, #NAME?, or "Substance" (header row)
$cleanData = $cleanData | Where-Object { 
    $_.substance -and 
    $_.substance -ne '#NAME?' -and 
    $_.substance -ne 'Substance' -and
    $_.substance.Trim() -ne ''
}

Write-Host "Clean row count: $($cleanData.Count)" -ForegroundColor Green

# Export cleaned data
$outputFile = "C:\Users\rusha\Downloads\AccuCoder\icd10cm_drug_2026_final.csv"
$cleanData | Export-Csv -Path $outputFile -NoTypeInformation -Encoding UTF8

Write-Host "`nCleaned CSV saved to: $outputFile" -ForegroundColor Green
Write-Host "Ready to import to Supabase!" -ForegroundColor Cyan
