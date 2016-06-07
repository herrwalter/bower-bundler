var argv = require('optimist').argv;
var fs = require("fs");
var path = require("path");
var concat = require("concat-files");

var bowerLibraryPath = argv.libraryPath || "./bower_components";
var pathToDist = argv.distPath || "./dist/lib/";
var bundleName = argv.bundleName || "bower-bundle";
var bowerFileLocation = argv.bowerFile || "./bower.json";

if( path.extname(bowerFileLocation) != ".json"){
    throw new Error("Your bower file must end with .json");
}

var bowerFile = require(bowerFileLocation);
var dependencyBowers = {};
var priorityOrder = [];
var bowerDependencies = bowerFile.dependencies;


var addBowerfile = function (dependencyName) {
    var dependencyBower = require(bowerLibraryPath + "/" + dependencyName + "/.bower.json");
    dependencyBowers[dependencyName] = dependencyBower;
    return dependencyBower;
};

if(bowerDependencies){

    // add all libraries without dependencies
    for(var dependencyName in bowerDependencies){
        var dependencyBower = addBowerfile(dependencyName);

        if(!dependencyBower.dependencies || (dependencyBower.dependencies && Object.keys(dependencyBower.dependencies).length == 0)){
            priorityOrder.push(dependencyName);
        }
    }


    // all all libraries with dependencies
    for(var dependencyName in bowerDependencies){
        var dependencyBower = dependencyBowers[dependencyName];


        if(dependencyBower.dependencies && Object.keys(dependencyBower.dependencies).length > 0){

            for(var childDependencyName in dependencyBower.dependencies ){
                var childDependencyIndex = priorityOrder.indexOf(childDependencyName + "");

                if(childDependencyIndex == -1){
                    addBowerfile(childDependencyName);
                    priorityOrder.push(childDependencyName);
                    priorityOrder.push(dependencyName);
                } else {
                    priorityOrder.splice(childDependencyIndex +1, 0, dependencyName);
                }
            }
        }

    }

    var dependencyMainPaths = {};
    for( var index in priorityOrder ){
        var dependencyName = priorityOrder[index];
        var dependencyBower = dependencyBowers[dependencyName];

        if(  typeof dependencyBower.main == "string" ){
            var libraryPath = dependencyBower.main;
            saveMainFile(bowerLibraryPath + "/" + dependencyName + "/" + libraryPath);
        }
        if( dependencyBower.main instanceof Array){
            for( var mainIndex in dependencyBower.main){
                var libraryPath = dependencyBower.main[mainIndex];
                saveMainFile(bowerLibraryPath + "/" + dependencyName + "/" + libraryPath);
            }
        }
    }

    function saveMainFile(libraryPath){
        if( !dependencyMainPaths[path.extname(libraryPath)] instanceof Array){
            dependencyMainPaths[path.extname(libraryPath)] = [];
        }
        dependencyMainPaths[path.extname(libraryPath)].push(libraryPath);
    }

    for( var fileType in dependencyMainPaths ){
        concat(dependencyMainPaths[fileType], pathToDist + bundleName + fileType);
    }
}


