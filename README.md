# command-tags
Parse custom tags/input that appear anywhere in a string.

# Options
**string**: The string to parse command tags from.

**prefix**: The prefix that would recognise a word as a tag. This can be a String or Regular Expression. e.g "--big", "--" being the prefix. Set to match any amount of `-`s by default.

**numbersInStrings**: Whether or not to match numbers too when you pass String into the Tag object. e.g "hello2" will match the whole word with this enabled, and will just match "hello" with this disabled. Set to true by default.

**removeAllTags**: Whether or not to should remove every word that starts with the prefix, but only match valid tags. Invalid tags will be removed but not added to the matches array. Set to false by default.

**negativeNumbers** Whether or not negative numbers can be matched if only looking for a number. Set to true by default.

**numberDoubles** Whether or not doubles can be matched, such as 23.90. Set to false by default.

# Examples
```js
const Tagify = require("command-tags")

// Check for tags
Tagify({
  string: "Hello world! --bold --underline",
  prefix: "--"
}, "bold", "italic", "strikethrough", "underline")

/*
Returns:
{
  string: "Hello world! --bold --underline",
  newString: "Hello world!",
  matches: ["bold", "underline"]
  data: {}
}
*/


// Check for tags and values
Tagify({
  string: "Draw -name Painting -price 20 -width 1080 -height 1440 -paintbrush",
  prefix: "-"
}, "paintbrush", {tag: "price", value: Number}, {tag: "width", value: Number}, {tag: "name", value: String}, {tag: "height", value: Number})

// or..
Tagify({
  string: "Draw -name Painting -price 20 -width 1080 -height 1440 -paintbrush",
  prefix: "-"
}, "paintbrush", {price: Number}, {width: Number}, {name: String}, {height: Number})

/*
Returns:
{
  string: "Draw -name Painting -price 20 -width 1080 -height 1440",
  newString: "Draw",
  matches: ["name", "price", "width", "height", "paintbrush"]
  data: {name: "Painting", price: 20, width: 1080, height: 1440}
}
*/



// Invalid tag use example
Tagify("Does fhing work lol --invalidtag wait its --tag1 isnt it!", "tag1")

/*
{
  string: "Does fhing work lol --invalidtag wait its --tag1 isnt it!"
  newString: "Does fhing work lol --invalidtag wait its isnt it!"
  matches: ["tag1"]
  data: {}
}
*/
// Invalid tag use example, but with removeAllTags option enabled.
Tagify({
  string: "Does fhing work lol --invalidtag wait its --tag1 isnt it!",
  removeAllTags: true
}, "tag1")

/*
{
  string: "Does fhing work lol --invalidtag wait its --tag1 isnt it!"
  newString: "Does fhing work lol wait its isnt it!"
  matches: ["tag1"]
  data: {}
}
*/


// Match any tag
Tagify({
  string: "Hello --tag1 --tag2",
  prefix: "--"
}, "\\w+")

/*
Returns:
{
  string: "Hello --tag1 --tag2",
  newString: "Hello",
  matches: ["tag1", "tag2"],
  data: {}
}
*/


// Match any tag with values. Set resolve to false in the tag object to avoid resolving the value to match a string.
Tagify({
  string: "Hello --tag1 1 --tag2 1",
  prefix: "--"
}, {tag: "\\w+", value: "\\d+", resolve: false})

/*
Returns:
{
  string: "Hello --tag1 1 --tag2 1",
  newString: "Hello",
  matches: ["tag1", "tag2"],
  data: {tag1: 1, tag2: 1}
}
*/

// Match values of different types
Tagify({
  string: "Convert colours --rgb [255, 53, 179] --num 519340 --hexes {\"hexadecimal\": \"0xFFFFFE\", \"hex\": \"#ec0d23\"}",
  prefix: "--",
  numbersInStrings: true
}, {rgb: Array}, {num: Number}, {hexes: Object})

/*
{
  string: "Convert colours --rgb [255, 53, 179] --num 519340 --hexes {\"hexadecimal\": \"0xFFFFFE\", \"hex\": \"#ec0d23\"}",
  newString: "Convert colours",
  matches: ["rgb", "num", "hexes"],
  data: {
    rgb: [255, 53, 179], 
    num: 519340, 
    hexes: {
      hexadecimal: "0xFFFFFE", hex: "#ec0d23"
    }
  }
}
*/
```