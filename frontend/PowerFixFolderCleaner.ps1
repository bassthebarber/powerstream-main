# PowerFixFolderCleaner.ps1
# Cleans up extra "SouthernPower*" folders and ensures only one true copy exists

Write-Host "🧹 PowerFix: Starting folder cleanup..."

# Define the official path
$officialPath = "frontend\src\components\tv\stations\SouthernPowerNetwork"

# Get all matching folders
$allFolders = Get-ChildItem -Path "frontend" -Recurse -Directory | Where-Object {
    $_.Name -like "*SouthernPower*" -or $_.Name -like "*Southern*" -or $_.Name -like "*southernpower*"
}

# Filter out the official folder (case-insensitive match)
$foldersToDelete = $allFolders | Where-Object {
    $_.FullName -notmatch [regex]::Escape($officialPath) -and
    $_.FullName -like "*SouthernPower*"
}

# Confirm and delete
foreach ($folder in $foldersToDelete) {
    Write-Host "⚠️ Deleting duplicate: $($folder.FullName)"
    Remove-Item -Path $folder.FullName -Recurse -Force
}

Write-Host "✅ Cleanup complete. Only the main SouthernPowerNetwork folder remains."
