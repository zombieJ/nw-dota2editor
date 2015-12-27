rm -f dota2editor.nw
rm -rf dist/res
cp -r res dist/.
rm -f dist_*.zip
zip -r dota2editor.nw *.html *.json public partials srv

echo "Merge"
cp nw.exe dota2editor.exe
cat dota2editor.nw >> dota2editor.exe

mv dota2editor.exe dist/.

echo -n "Compress the dist file (y/n)? "
read answer
if echo "$answer" | grep -iq "^y" ;then
	echo "Compress..."
	#zip -r "dist_$(date +%Y%m%d).zip" dist
	7za a -t7z -r "dist_$(date +%Y%m%d).7z" dist/*
else
	echo "Exit"
fi
