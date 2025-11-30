Start-Process powershell -ArgumentList "npm run main" -NoNewWindow
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList "npm run studio" -NoNewWindow
