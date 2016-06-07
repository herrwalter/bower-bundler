bower-bundler
=========================================================
This plugin will help you bundle your bower libraries to a giving path with the knowledge of the dependecy priorities.

**Installation**

```
npm install -g bower-bundler
```


**Usage**

When you have node installed, simply use `bower-bundler` in the root folder where you're bower file is located.

If your bower file is located somewhere else than default "./bower.json" use
```
bower-bundler --bower-file="path/to/bowerfile/from/projectroot.json"
```
!Note that the file should end with .json


If your bower_components folder is named differently or its located somewhere else use
```
bower-bundler --bower-components="path/to/bower_components"
```


If you want a other bundle name than "bower-bundle" use
```
bower-bundler --name="MyAwesomeName"
```


The bundle will be distributed by default in the same folder. That's not what I liked for my projects so use
```
bower-bundler --dist="path/to/dist"
```

**Bugs?**
Please create an issue

**Pull requests welcome**

