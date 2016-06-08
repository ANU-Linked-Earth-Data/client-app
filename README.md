# anu-linked-earth-data.github.io

[![Build Status](https://travis-ci.org/ANU-Linked-Earth-Data/client-app.svg?branch=master)](https://travis-ci.org/ANU-Linked-Earth-Data/client-app)

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
$ grunt build --stage=prod  # Build in dist/ with production config
$ grunt buildcontrol:pages  # Push to Github gh-pages branch
```

## Note on configuration

Configuration is stored in `config/environments/<stage>.json`. You can specify a
configuration stage by supplying the `--stage=<stage>` option to Grunt when
running a built. For instance, `grunt build --stage=prod` makes a production
build (essential for Github Pages!).

At the moment, `dev` and `prod` are the only configurations. The only difference
between the two is that `prod` uses a remote server, whilst `dev` uses a local
SPARQL server, falling back to the remote one if necessary.

## Common Issues

### ```npm install``` not working

```
npm ERR! Failed to parse json
npm ERR! No data, empty input at 1:1
npm ERR! 
npm ERR! ^
```

Fixed by running

```
$ rm -r node_modules
$ npm cache clean
```

Node not found for phantomjs-prebuilt@2.1.7:

Fixed by installing node-legacy via ```sudo apt-get install nodejs-legacy```
