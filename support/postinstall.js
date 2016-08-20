"use strict";

var fs = require('fs');
var path = require('path');
var pathSep = require('path').sep;

function mkdir(path){
	var dirs = path.split(pathSep);
	var root = "";
	while (dirs.length > 0) {
		var dir = dirs.shift();
		if (dir === "") {// If directory starts with a /, the first path will be an empty string.
			root = pathSep;
		}
		if (!fs.existsSync(root + dir)) {
			fs.mkdirSync(root + dir);
		}
		root += dir + pathSep;
	}
};


function copyFile(src, dest, forceOverWrite) {
    var dirname = path.dirname(dest);
    mkdir(dirname); 

    if (!forceOverWrite && fs.existsSync(dest)) return;
    var buffer = fs.readFileSync(src);
    fs.writeFileSync(dest, buffer);

    clean();
}

function clean(){
  fs.unlinkSync(__dirname + "/VLCOptions.java"); 
}

copyFile(__dirname + '/VLCOptions.java',path.resolve("../../platforms/android/src/main/java/org/videolan/vlc/util/VLCOptions.java"),true);