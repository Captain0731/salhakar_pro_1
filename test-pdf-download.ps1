# PowerShell script to test PDF download from backend
# Usage: .\test-pdf-download.ps1 <judgment_id> [token]

param(
    [string]$JudgmentId = "1",
    [string]$Token = ""
)

$ApiBaseUrl = "https://unquestioned-gunnar-medially.ngrok-free.dev"
$OutputFile = "test_judgment_$JudgmentId.pdf"

Write-Host "Testing PDF download from backend..." -ForegroundColor Cyan
Write-Host "Judgment ID: $JudgmentId"
Write-Host "API URL: $ApiBaseUrl"
Write-Host ""

# Build headers
$headers = @{
    "Accept" = "application/pdf"
    "ngrok-skip-browser-warning" = "true"
}

if ($Token) {
    $headers["Authorization"] = "Bearer $Token"
}

try {
    $url = "$ApiBaseUrl/api/judgements/$JudgmentId?format=pdf"
    Write-Host "Downloading from: $url" -ForegroundColor Yellow
    Write-Host ""
    
    # Download PDF
    $response = Invoke-WebRequest -Uri $url -Method Get -Headers $headers -OutFile $OutputFile
    
    Write-Host "HTTP Status: $($response.StatusCode)" -ForegroundColor Green
    
    if (Test-Path $OutputFile) {
        $fileInfo = Get-Item $OutputFile
        $fileSize = $fileInfo.Length
        $fileSizeKB = [math]::Round($fileSize / 1024, 2)
        $fileSizeMB = [math]::Round($fileSize / 1024 / 1024, 2)
        
        Write-Host ""
        Write-Host "✅ PDF downloaded successfully!" -ForegroundColor Green
        Write-Host "File: $OutputFile"
        Write-Host "Size: $fileSize bytes ($fileSizeKB KB / $fileSizeMB MB)" -ForegroundColor Cyan
        
        # Check if it's a valid PDF (check first few bytes)
        $pdfHeader = Get-Content $OutputFile -TotalCount 1 -Encoding Byte -ErrorAction SilentlyContinue
        if ($pdfHeader -and $pdfHeader[0] -eq 0x25 -and $pdfHeader[1] -eq 0x50 -and $pdfHeader[2] -eq 0x44 -and $pdfHeader[3] -eq 0x46) {
            Write-Host "✅ Valid PDF file (PDF header detected)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Warning: File may not be a valid PDF" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ PDF file was not created" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error downloading PDF:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

