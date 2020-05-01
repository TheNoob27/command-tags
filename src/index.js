/**
 * @typedef {Object} Tag
 * @property {string} tag The tag to recognise.
 * @property {Number|String|Boolean|RegExp|string} value The value type the tag should have. Accepts String, Number, Boolean or a RegExp
 * @property {boolean} [resolve=true] Whether or not to resolve the value property into a proper type before replacing the text. Set to false if you want to use custom regex as your value.
 */

/**
 * @typedef {Object} Options
 * @property {string} string The string to parse command tags from.
 * @property {string|RegExp} [prefix="--"] The prefix that would recognise a word as a tag. This can be a String or Regular Expression. e.g "--big", "--" being the prefix.
 */

/**
 * @typedef {Object} ParsedTags
 * @property {string} string The original string.
 * @property {string} newString The new string with all valid tags removed.
 * @property {array} matches All valid tags the string contained.
 * @property {object} data All valid tags thats had values and their values that the string contained.
 */

/**
 * Get custom command tags out of a string.
 * @param {Options|string} options The options to pass in, or the string to parse tags from.
 * @param {...(string|Tag)} tags Tags to recognise. You can pass in "\w+" to recognise anything, or a tag object to make the tag have a value (e.g "--size 10"). Tags with values will be put in the data object.
 * @returns {ParsedTags}
 * @example
 * ```
 * Tagify({
 *   string: "Write text --bold --italic"
 *   prefix: "--"
 * }, "bold", "italic", "strikethrough", "underline")
 * // -> {
 * //   string: "Write text --bold --italic",
 * //   newString: "Write text"
 * //   matches: ["bold", "italic"],
 * //   data: {}
 * // }
 * ```
 */
module.exports = function Tagify(options = {}, ...tags) {
  let matches = []
  let data = {}
  tags = tags.flat()
  
  let string, prefix;
  if (typeof options === "string") {
    string = options
    prefix = "-+"
  } else if (options && typeof options === "object") {
    ({ string, prefix } = options)
  }
  
  if (!string || !prefix) [string, prefix] = [string || "", prefix || "--"]
  
  let newString = tags[0] ? string.replace(new RegExp(" ?(" + prefix + tags.map(t => {
    if (typeof t === "string" && t.includes(" ")) t = {tag: t.split(/ +/)[0], value: t.split(/ +/)[1]}
    if (typeof t === "string") return t
    if (typeof t === "object" && t) {
      let other = Object.keys(t).filter(k => !["tag", "value", "resolve"].includes(k))
      if (other) {
        if (!t.tag) (t.tag = other[0]) && (t.value = t[other[0]])
      }
      
      if (!t.value && t.tag) return t.tag
      if (t.tag && t.value) {
        if (t.resolve !== false) {
          if (t.value === Boolean || typeof t.value === "boolean" || ["true", "false"].includes(t.value)) t.value = "(true|false)"
          else if (t.value === Number || typeof t.value === "number" || !isNaN(t.value)) t.value = "\\d+"
          else if (t.value instanceof Regexp) t.value = t.value.toString().split("/")[1]
          else if (t.value === String || typeof t.value === "string" && !t.value.includes("\\")) t.value = "[A-Za-z]+"
        }
        
        return t.tag + " " + t.value
      }
    }
    
    return t
  }).join("|" + prefix) + ") ?", "g", "i"), t => {
    let spc = false
    if (t.startsWith(" ") && t.endsWith(" ") && !string.startsWith(t) && !string.endsWith(t)) spc = true
    t = t.trim()
    
    if (prefix.includes("|")) t = t.replace(new RegExp(prefix, "i"), "")
    else t = t.slice(prefix.length)
    
    if (t.includes(" ")) {
      t = t.split(/ +/)
      
      if (!isNaN(t[1])) t[1] = Number(t[1])
      else if (t[1] === "true") t[1] = true
      else if (t[1] === "false") t[1] = false
      
      data[t[0]] = t[1]
      matches.push(t[0])
    } else matches.push(t)
    
    return spc ? " " : ""
  }).trim() : string

  return {
    string,
    newString,
    matches,
    data
  }
}
