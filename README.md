# anu-linked-earth-data.github.io

This is the client application. Currently it's using a AngularJS and Bootstrap
to display information from Sam's Nectar server. To run the app, use

```
$ npm install     # Development dependencies
$ export PATH="$(npm bin):$PATH"
$ bower install   # Client-side dependencies
$ grunt serve     # Run the dev server
```

`grunt test` will run tests and `grunt build` will produce a minified copy for
distribution. Project structure was generated with [Yeoman](http://yeoman.io/),
so you should check out the readme for
[`generator-angular`](https://github.com/yeoman/generator-angular) if you want
to take advantage of that.

To deploy to Github Pages, try this:

```
$ grunt build               # Build in dist/
$ grunt buildcontrol:pages  # Push to Github gh-pages branch
```
