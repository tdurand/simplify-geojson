# simplify-geojson

forked for 3d paths

-t : tolerance lat, lng
-z : tolerance Z (elevation)

```
cat track.json | node cli.js -t 0.0001 -z 100 > track-simplified.json
```