# command-tags
Parse tags from a discord message and use them for commands, or personal use.

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
``` 
