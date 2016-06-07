#!/usr/bin/env node
var cli = require("cli").enable("status", "version");
var fs = require("fs");
var path = require("path");
var concat = require("concat-files");

cli.parse({
    bowerLibraryPath: ['bower-components', 'Path to your bower_components', 'path', './bower_components'],
    pathToDist: ['dist', 'Path to concat the libraries to', 'path', './'],
    bundleName: ['name', 'Name of the bundle (will return in outputfile: [bundle-name].js)', 'string', 'bower-bundle'],
    bowerFileLocation: ['bower-file', 'Path to your bower file', 'path', './bower.json']
});

cli.main(function(args, options){
    var cwd = process.cwd();

    options.bowerFileLocation = path.resolve(cwd, options.bowerFileLocation);
    options.pathToDist = path.resolve(cwd, options.pathToDist);
    options.bowerLibraryPath = path.resolve(cwd, options.bowerLibraryPath);

    if( path.extname(options.bowerFileLocation) != ".json"){
        cli.error("Your bower file must end with .json");
    }

    var bowerFile = require(options.bowerFileLocation);
    var dependencyBowers = {};
    var priorityOrder = [];
    var bowerDependencies = bowerFile.dependencies;

    var addBowerfile = function (dependencyName) {
        var dependencyBower = require(options.bowerLibraryPath + "/" + dependencyName + "/.bower.json");
        dependencyBowers[dependencyName] = dependencyBower;
        return dependencyBower;
    };

    if(bowerDependencies){

        cli.info("determining the dependency priorities..")
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

        cli.info("gathering the main paths..");
        var dependencyMainPaths = {};
        for( var index in priorityOrder ){
            var dependencyName = priorityOrder[index];
            var dependencyBower = dependencyBowers[dependencyName];

            if(  typeof dependencyBower.main == "string" ){
                var libraryPath = dependencyBower.main;
                saveMainFile(options.bowerLibraryPath + "/" + dependencyName + "/" + libraryPath);
            }
            if( dependencyBower.main instanceof Array){
                for( var mainIndex in dependencyBower.main){
                    var libraryPath = dependencyBower.main[mainIndex];
                    saveMainFile(options.bowerLibraryPath + "/" + dependencyName + "/" + libraryPath);
                }
            }
        }

        function saveMainFile(libraryPath){
            var ext = path.extname(libraryPath);
            if( !dependencyMainPaths[ext] ){
                dependencyMainPaths[ext] = [];
            }
            dependencyMainPaths[ext].push(libraryPath);
        }

        cli.info("concatting the libraries..");
        for( var fileType in dependencyMainPaths ){
            concat(dependencyMainPaths[fileType], path.resolve(options.pathToDist, options.bundleName + fileType));
        }
        cli.info("DONE");
    }


});
