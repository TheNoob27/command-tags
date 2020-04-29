# command-tags
Parse tags from a discord message and use them for commands, or personal use.

# Examples
```js
const Tagify = require("command-tags")

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



Tagify({
  string: "Draw -name Painting -price 20 -width 1080 -heigth 1440 -paintbrush",
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



Tagify("Does fhing work lol --invalidtag wait its --tag1 isnt it!", "tag1")

/*
{
  string: "Does fhing work lol --invalidtag wait its --tag1 isnt it!"
  newString: "Does fhing work lol --invalidtag wait its isnt it!"
  matches: ["tag1"]
  data: {}
}
*/



Tagify({
  string: "Hello --tag1 --tag2",
  prefix: "--"
}, "\w+")

/*
Returns:
{
  string: "Hello --tag1 --tag2",
  newString: "Hello",
  matches: ["tag1", "tag2"],
  data: {}
}
*/
``` 
