var fs = require("fs");
var bowerFile = require("./bower.json");
var priorityOrder = [];

var bowerLibraryPath = "./bower_components";
var pathToDist = "./dist/lib/";
var bundleName = "bowerify-bundle";

var dependencyBowers = {};
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

    var concat = require("concat-files");
    // find all the main paths
    var dependencyMainJSPaths = [];
    var dependencyMainCssPaths = [];
    for( var index in priorityOrder ){
        var dependencyName = priorityOrder[index];
        var dependencyBower = dependencyBowers[dependencyName];

        if(  typeof dependencyBower.main == "string" ){
            var path = dependencyBower.main;
            if( path.indexOf(".js") ){
                dependencyMainJSPaths.push(bowerLibraryPath + "/" + dependencyName + "/" + path);
            }
            if( path.indexOf(".css") ){
                dependencyMainCssPaths.push(bowerLibraryPath + "/" + dependencyName + "/" + path);
            }
        }
        if( dependencyBower.main instanceof Array){
            var paths = dependencyBower.main;
            for( var index in paths){
                var path = paths[index];
                if ( path.indexOf(".js") ){
                    dependencyMainJSPaths.push(bowerLibraryPath + "/" + dependencyName + "/" + path);
                }
                if( path.indexOf(".css") ){
                    dependencyMainCssPaths.push(bowerLibraryPath + "/" + dependencyName + "/" + path);
                }
            }
        }
    }

    if( dependencyMainJSPaths.length > 0 ){
        concat(dependencyMainJSPaths, pathToDist + bundleName + ".js");
    }
    if( dependencyMainCssPaths > 0 ){
        concat(dependencyMainCssPaths, pathToDist + bundleName + ".css");
    }
}


