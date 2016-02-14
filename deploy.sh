date_mark=$(date +%Y%m%d_%H%M%S)
echo $date_mark > _VERSION

echo "Clean Up"
rm -f dota2editor.nw
rm -rf dist/res
rm -rf dist/tmp
rm -f dist_*.7z

echo "Group"
mkdir dist/res
cp _VERSION dist/_VERSION
cp -r res/items_game.json dist/res/items_game.json
cp -r res/vsnd_to_soundname_v2.txt dist/res/vsnd_to_soundname_v2.txt
zip -r dota2editor.nw *.html *.json public partials srv icon

mv dota2editor.nw dist/.

echo -n "Compress the dist file (y/n)? "
read answer
if echo "$answer" | grep -iq "^y" ;then
	echo "Compress..."
	7za a -t7z -r "dist_$date_mark.7z" dist/*
else
	echo "Skip compress..."
fi


echo -n "Deploy latest version (y/n)? "
read answer
if echo "$answer" | grep -iq "^y" ;then
	echo "Deploy..."
	cp dist/_VERSION ../nw-dota2editor-dist/dist/.
	cp dist/dota2editor.nw ../nw-dota2editor-dist/dist/.
	cp dist/Dota2KVEditor.exe ../nw-dota2editor-dist/dist/.

	cd ../nw-dota2editor-dist
	git add .
	git commit -m "update latest version"
	git push
else
	echo "Exit"
fi
