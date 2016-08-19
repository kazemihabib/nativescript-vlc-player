"use strict";

var fs = require('fs-extra');
var path = require('path');
function copyFiles(src,dest,forceOverWrite){
 try{
    fs.emptyDirSync(path.dirname(dest));
    console.log('empty dest folder done');
  } catch(err){
    console.log(err);
  }

  try {
    fs.copySync(src, dest)
    console.log("copy to dest done")
  } catch (err) {
    console.error(err)
  } 
}

function cleanupFiles() {
    try{
        fs.removeSync(__dirname + '/org');
        console.log('./org dir removed');
    }catch(error){
        console.log(err);
    }
}


copyFiles(__dirname + "/org/videolan/vlc/util/VLCOptions.java" ,path.resolve("../../platforms/android/src/main/java/org/videolan/vlc/util/VLCOptions.java"));
cleanupFiles();
