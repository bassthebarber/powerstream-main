; Make F12 always open Chrome DevTools
#IfWinActive ahk_exe chrome.exe
F12::
    Send ^+i   ; Ctrl+Shift+I (opens DevTools)
return
#IfWinActive
