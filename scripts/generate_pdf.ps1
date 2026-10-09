$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) {
    $chrome = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
}

$reportHtml = "http://localhost:3000/docs/report.html?t=" + (Get-Date -UFormat %s)
$destPdf = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\docs\Project_Customer_Orders_Report.pdf"))
$tempPdf = "$env:TEMP\Project_Customer_Orders_Report_temp.pdf"

if (Test-Path $tempPdf) {
    Remove-Item $tempPdf -Force
}

Write-Host "Target Chrome: $chrome"
Write-Host "Printing from: $reportHtml"
Write-Host "Temp Path:     $tempPdf"
Write-Host "Destination:   $destPdf"

$argList = @(
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--run-all-compositor-stages-before-draw",
    "--virtual-time-budget=5000",
    "--print-to-pdf=$tempPdf",
    $reportHtml
)

Start-Process -FilePath $chrome -ArgumentList $argList -Wait -NoNewWindow

if (Test-Path $tempPdf) {
    $size = (Get-Item $tempPdf).Length
    Write-Host "Successfully generated PDF in temp: $size bytes"
    Copy-Item -Path $tempPdf -Destination $destPdf -Force
    Remove-Item $tempPdf -Force
    Write-Host "Copied to destination successfully: $destPdf"
    (Get-Item $destPdf) | Select-Object Name, Length, LastWriteTime
} else {
    Write-Error "Chrome failed to produce $tempPdf"
}
