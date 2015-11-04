rm -f dota2editor.nw
zip -r dota2editor.nw *.html *.json public partials srv

#D:/sdks/nwjs-v0.12.3-win-ia32/nw.exe dota2editor.nw
C:/sdks/nwjs/nwjs-v0.12.3-win-x64/nw.exe dota2editor.nw


#copy /b nw.exe+dota2editor.nw dota2editor.exe