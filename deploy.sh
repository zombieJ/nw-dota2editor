rm -f dota2editor.nw
zip -r dota2editor.nw *.html *.json public partials

D:/sdks/nwjs-v0.12.3-win-ia32/nw.exe dota2editor.nw
