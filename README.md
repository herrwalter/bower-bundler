**Bower bundler**


This plugin will help you bundle your bower libraries.
When you have node installed, simply use `node index.js` in the root folder where you're bower file is located.

If your bower file is located somewhere else than default "./bower.json" use
```
--bowerFile="path/to/bowerfile/from/projectroot.json"
```


!Note that the file should end with .json

If your bower_components folder is named differently or its located somewhere else use
```
--libraryPath="path/to/bower_components"
```

If you want a other bundle name than "bower-bundle" use
```
--name="MyAwesomeName"
```

The bundle will be distributed by default in the same folder. That's not what I liked for my projects so use
```
--distPath="path/to/dist"
```
