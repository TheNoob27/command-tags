/**
 * @typedef {Object} Tag
 * @property {string} tag The tag to recognise.
 * @property {Number|String|Boolean|RegExp|Array|Object|JSON|string} value The value type the tag should have. Accepts String, Number, Boolean, a RegExp, Object/JSON/Array,
 * @property {boolean} [resolve=true] Whether or not to resolve the value property into a proper type before replacing the text. Set to false if you want to use custom regex as your value.
 */

/**
 * @typedef {Object} Options
 * @property {string} string The string to parse command tags from.
 * @property {string|RegExp} [prefix="--"] The prefix that would recognise a word as a tag. This can be a String or Regular Expression. e.g "--big", "--" being the prefix.
 * @property {boolean} [silenceJSONErrors=false] Whether or not to silence errors when converting a string to a JSON object.
 * @property {boolean} [numbersInStrings=true] Whether or not to match numbers too when you pass String into the Tag object. e.g "hello2" will match with this enabled, and won't with this disabled.
 * @property {boolean} [removeAllTags=false] Whether or not it should remove every word that starts with the prefix, but only match valid tags.
 */

/**
 * @typedef {Object} ParsedTags
 * @property {string} string The original string.
 * @property {string} newString The new string with all valid tags removed.
 * @property {array} matches All valid tags the string contained.
 * @property {object} data All valid tags that had values and their values that the string contained.
 */

/**
 * Get custom command tags out of a string.
 * @param {Options|string} options The options to pass in, or the string to parse tags from.
 * @param {...(string|Tag)} tags Tags to recognise. You can pass in "\w+" to recognise anything, or a tag object to make the tag have a value (e.g "--size 10"). Tags with values will be put in the data object.
 * @returns {ParsedTags}
 * @example
 * ```
 * Tagify({
 *   string: "Write text --bold --italic",
 *   prefix: "--"
 * }, "bold", "italic", "strikethrough", "underline")
 * // -> {
 * //   string: "Write text --bold --italic",
 * //   newString: "Write text",
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

  if (!string || !prefix) [string, prefix] = [string || "", prefix || "-+"]

  let tagData = {}
  tags = tags.map(t => {
    if (typeof t === "string" && t.includes(" ")) t = {tag: t.split(/ +/)[0], value: t.split(/ +/)[1]}
    if (typeof t === "string") return t
    if (typeof t === "object" && t) {
      let other = Object.keys(t).filter(k => !["tag", "value", "resolve"].includes(k))
      if (other[0]) {
        if (!t.tag) (t.tag = other[0]) && (t.value = t[other[0]])
      }

      if (!t.value && t.tag) return t.tag
      if (t.tag && t.value) {
        if (t.resolve !== false) {
          if (t.value === Boolean || typeof t.value === "boolean" || ["true", "false"].includes(t.value)) {
            tagData[t.tag] = Boolean
            t.value = "(true|false)"
          }
          else if (t.value === Number || typeof t.value === "number" || !isNaN(t.value)) {
            tagData[t.tag] = Number
            t.value = "\\d+"
          }
          else if (t.value instanceof RegExp) {
            tagData[t.tag] = RegExp
            t.value = t.value.toString().split("/")[1]
          }
          else if ([Object, Array, JSON].includes(t.value) || typeof t.value === "object") {
            tagData[t.tag] = Object
            t.value = t.value === Array || t.value instanceof Array ? "\\[[^]+]" : "{[^]+}"
          }
          else if (t.value === String || typeof t.value === "string" && !t.value.includes("\\")) {
            tagData[t.tag] = String
            t.value = options.numbersInStrings ? "\\w+" : "[A-Za-z]+"
          }
        }

        return t.tag + " " + t.value
      }
    }

    return t
  })

  let newString = tags[0] ? string.replace(new RegExp(` ?(${prefix}${tags.join("|" + prefix)}) ?`, "g", "i"), t => {
    let spc = false
    if (t.startsWith(" ") && t.endsWith(" ") && !string.startsWith(t) && !string.endsWith(t)) spc = true
    let old = t
    t = t.trim()

    if (prefix.includes("|")) t = t.replace(new RegExp(prefix, "i"), "")
    else t = t.slice(prefix.length)

    if (tagData[t.split(" ")[0]]) {
      t = t.split(/ +/)
      t = [t[0], t.slice(1).join(" ")]

      if (tagData[t[0]] === Number) t[1] = Number(t[1])
      else if (tagData[t[0]] === Boolean) {
        if (t[1] === "true") t[1] = true
        else if (t[1] === "false") t[1] = false
      } else if (tagData[t[0]] === Object) {
        try {
          t[1] = t[1].startsWith("{") ? JSON.parse(t[1].replace(/({|\s|,)\w+:/g, w => w[0] + '"' + w.slice(1, w.length - 1) + '":')) : JSON.parse(t[1])
        } catch(err) {
          if (!options.silenceJSONErrors) throw err;
          return old
        }
      }

      data[t[0]] = t[1]
      matches.push(t[0])
    } else matches.push(t)

    return spc ? " " : ""
  }).trim() : string

  if (options.removeAllTags) {
    newString = newString.replace(new RegExp(` ?${prefix}\\w+ ?`, "g", "i"), t => {
      return t.startsWith(" ") && t.endsWith(" ") && !string.startsWith(t) && !string.endsWith(t) ? " " : ""
    })
  }

  return {
    string,
    newString,
    matches,
    data
  }
}