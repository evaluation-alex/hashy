#!/usr/bin/env node

'use strict'

var yargs = require('yargs')
// TESTABILITY: makes yargs throws instead of exiting.
yargs.fail(function (msg) {
  var help = yargs.help()

  if (msg) {
    help += '\n' + msg
  }

  throw help
})

// --------------------------------------------------------------------

var hashy = require('./')

// ====================================================================

function main (argv) {
  var options = yargs
    .usage('Usage: hashy [<option>...]')
    .example('hashy [ -a <algorithm> ] <secret>', 'hash the secret')
    .example('hashy <secret> <hash>', 'verify the secret using the hash')
    .options({
      a: {
        default: hashy.DEFAULT_ALGO,
        describe: 'algorithm to use for hashing'
      },
      h: {
        alias: 'help',
        boolean: true,
        describe: 'display this help message'
      },
      v: {
        alias: 'version',
        boolean: true,
        describe: 'display the version number'
      },
      c: {
        alias: 'cost',
        describe: 'cost for Bcrypt'
      }
    })
    .parse(argv)

  if (options.help) {
    return yargs.help()
  }

  if (options.version) {
    var pkg = require('./package')
    return 'Hashy version ' + pkg.version
  }

  if (options.cost) {
    hashy.options.bcrypt.cost = +options.cost
  }

  var args = options._

  if (args.length === 1) {
    return hashy.hash(args[0], options.a).then(console.log)
  }

  if (args.length === 2) {
    var password = args[0]
    var hash = args[1]

    return hashy.verify(password, hash).then(function (success) {
      if (success) {
        if (hashy.needsRehash(hash, options.a)) {
          return 'ok but password should be rehashed'
        }

        return 'ok'
      }

      throw new Error('not ok')
    })
  }

  throw new Error('incorrect number of arguments')
}
exports = module.exports = main

// ====================================================================

if (!module.parent) {
  require('exec-promise')(main)
}
