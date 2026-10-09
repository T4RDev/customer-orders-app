# Ultra-fast script to package clean project into Zip excluding node_modules, dist, and .git
$projectRoot = Split-Path -Parent $PSScriptRoot
$zipOutputPath = Join-Path $projectRoot "docs\Customer_Orders_Source.zip"
$rootZipPath = Join-Path $projectRoot "Customer_Orders_Source.zip"

Write-Host "Creating clean staging directory..."
$tempDir = Join-Path $env:TEMP "Customer_Orders_Clean_$(Get-Random)"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Use robocopy to mirror files while explicitly excluding heavy directories
$excludeDirs = @("node_modules", ".angular", "dist", ".git")
$cmdArgs = @(
    $projectRoot,
    $tempDir,
    "/E",
    "/XD", "node_modules", ".angular", "dist", ".git",
    "/XF", "*.zip", "customer_orders.db", "*.log",
    "/NFL", "/NDL", "/NJH", "/NJS", "/nc", "/ns", "/np"
)

Write-Host "Syncing files (skipping node_modules and cache)..."
& robocopy.exe @cmdArgs | Out-Null

# Remove any existing zip
if (Test-Path $zipOutputPath) { Remove-Item -Force $zipOutputPath }
if (Test-Path $rootZipPath) { Remove-Item -Force $rootZipPath }

Write-Host "Creating Zip archive..."
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipOutputPath -CompressionLevel Optimal
Copy-Item -Path $zipOutputPath -Destination $rootZipPath -Force

Write-Host "Cleaning up staging directory..."
Remove-Item -Recurse -Force $tempDir

$zipSize = (Get-Item $zipOutputPath).Length / 1MB
Write-Host "SUCCESS: Created $zipOutputPath ($([math]::Round($zipSize, 2)) MB)"
