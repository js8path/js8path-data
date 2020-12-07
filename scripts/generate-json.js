/*
  Generate JSON version of schema

  usage:
    add this to package.json scripts
      "generate": "node ./scripts/generate-json.js"
    then run with
      yarn run generate
 */

let outputFile = './dist/js8path-data-schema.json'

let fs = require('fs')
// let _ = require('lodash')

// figure out how to do ES6 in a script
let js8pathData = require('../dist/js8path-data.js')

console.log('generating JSON')

let schemaDefs = js8pathData.default.schema.schemaDefs

fs.writeFileSync(
  outputFile,
  JSON.stringify(schemaDefs, null, 2)
)
console.log('done')
