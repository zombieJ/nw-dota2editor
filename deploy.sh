date_mark=$(date +%Y%m%d_%H%M%S)
echo $date_mark > _VERSION

echo "Clean Up"
rm -f dota2editor.nw
rm -rf dist/res
rm -f dist_*.7z

echo "Group"
mkdir dist/res
cp -r icon dist/.
cp -r res/items_game.json dist/res/items_game.json
cp -r res/vsnd_to_soundname_v2.txt dist/res/vsnd_to_soundname_v2.txt
zip -r dota2editor.nw *.html *.json public partials srv icon _VERSION

#echo "Merge"
#cp nw.exe dota2editor.exe
#cat dota2editor.nw >> dota2editor.exe

#mv dota2editor.exe dist/.
mv dota2editor.nw dist/.

echo -n "Compress the dist file (y/n)? "
read answer
if echo "$answer" | grep -iq "^y" ;then
	echo "Compress..."
	#zip -r "dist_$(date +%Y%m%d).zip" dist
	7za a -t7z -r "dist_$date_mark.7z" dist/*
else
	echo "Exit"
fi
