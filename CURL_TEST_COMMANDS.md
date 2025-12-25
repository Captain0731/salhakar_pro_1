# PDF Download Test Commands

## Test PDF Download from Backend

### Using curl (Linux/Mac/Git Bash)

```bash
# Basic test (replace JUDGMENT_ID with actual ID)
curl -X GET "https://unquestioned-gunnar-medially.ngrok-free.dev/api/judgements/JUDGMENT_ID?format=pdf" \
  -H "Accept: application/pdf" \
  -H "ngrok-skip-browser-warning: true" \
  -o test_judgment.pdf \
  -w "\nHTTP Status: %{http_code}\nSize: %{size_download} bytes (%.2f KB)\nTime: %{time_total}s\n"

# With authentication token
curl -X GET "https://unquestioned-gunnar-medially.ngrok-free.dev/api/judgements/JUDGMENT_ID?format=pdf" \
  -H "Accept: application/pdf" \
  -H "ngrok-skip-browser-warning: true" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -o test_judgment.pdf \
  -w "\nHTTP Status: %{http_code}\nSize: %{size_download} bytes\nTime: %{time_total}s\n"

# With language parameter (for translated PDF)
curl -X GET "https://unquestioned-gunnar-medially.ngrok-free.dev/api/judgements/JUDGMENT_ID?format=pdf&language=hi" \
  -H "Accept: application/pdf" \
  -H "ngrok-skip-browser-warning: true" \
  -o test_judgment_hi.pdf \
  -w "\nHTTP Status: %{http_code}\nSize: %{size_download} bytes\nTime: %{time_total}s\n"
```

### Using PowerShell (Windows)

```powershell
# Basic test
$judgmentId = "1"  # Replace with actual judgment ID
$url = "https://unquestioned-gunnar-medially.ngrok-free.dev/api/judgements/$judgmentId?format=pdf"
$outputFile = "test_judgment.pdf"

$headers = @{
    "Accept" = "application/pdf"
    "ngrok-skip-browser-warning" = "true"
}

# Optional: Add token if needed
# $token = "YOUR_TOKEN_HERE"
# $headers["Authorization"] = "Bearer $token"

Invoke-WebRequest -Uri $url -Method Get -Headers $headers -OutFile $outputFile

# Check file size
$fileInfo = Get-Item $outputFile
Write-Host "File size: $($fileInfo.Length) bytes ($([math]::Round($fileInfo.Length / 1024, 2)) KB)"
```

### Example with actual judgment ID

Replace `JUDGMENT_ID` with an actual judgment ID from your database:

```bash
# Example: Download PDF for judgment ID 123
curl -X GET "https://unquestioned-gunnar-medially.ngrok-free.dev/api/judgements/123?format=pdf" \
  -H "Accept: application/pdf" \
  -H "ngrok-skip-browser-warning: true" \
  -o judgment_123.pdf \
  -w "\nHTTP Status: %{http_code}\nSize: %{size_download} bytes\nTime: %{time_total}s\n"
```

## Expected Response

- **Content-Type**: `application/pdf`
- **Status Code**: `200 OK` (if successful)
- **File Size**: Varies based on content length (typically 100KB - 5MB for markdown content)

## Notes

- The backend should handle markdown rendering and PDF generation
- Language parameter is optional (defaults to English if not provided)
- Authentication token may be required depending on backend configuration

