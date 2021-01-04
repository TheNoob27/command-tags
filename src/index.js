/**
 * @typedef {Object} Tag
 * @property {string} tag The tag to recognise.
 * @property {NumberConstructor|StringConstructor|BooleanConstructor|RegExpConstructor|ArrayConstructor|ObjectConstructor|JSON|string} value The value type the tag should have. Accepts String, Number, Boolean, a RegExp, Object/JSON/Array,
 * @property {boolean} [resolve=true] Whether or not to resolve the value property into a proper type before replacing the text. Set to false if you want to use custom regex as your value.
 */

/**
 * @typedef {Object} Options
 * @property {string} string The string to parse command tags from.
 * @property {string|RegExp} [prefix="--"] The prefix that would recognise a word as a tag. This can be a String or Regular Expression. e.g "--big", "--" being the prefix.
 * @property {boolean} [numbersInStrings=true] Whether or not to match numbers too when you pass String into the Tag object. e.g "hello2" will match with this enabled, and won't with this disabled.
 * @property {boolean} [removeAllTags=false] Whether or not it should remove every word that starts with the prefix, but only match valid tags.
 * @property {boolean} [negativeNumbers=true] Whether or not negative numbers can be matched if only looking for a number.
 * @property {boolean} [numberDoubles=false] Whether or not doubles can be matched, such as 23.90
 * @property {Object<string, NumberConstructor|StringConstructor|BooleanConstructor|ObjectConstructor>} [tagData] Default types that matches tags should be parsed into.
 */

/**
 * @typedef {Object} ParsedTags
 * @property {string} string The original string.
 * @property {string} newString The new string with all valid tags removed.
 * @property {string[]} matches All valid tags the string contained.
 * @property {Object<string, number | string | *[]>} data All valid tags that had values and their values that the string contained.
 * @property {Object<string, NumberConstructor|StringConstructor|BooleanConstructor|ObjectConstructor>} tagData The tag data that was used to parse matches.
 */

/**
 * Get custom command tags out of a string.
 * @param {Options|string} options The options to pass in, or the string to parse tags from.
 * @param {...(string|Tag)} tags Tags to recognise. You can pass in "\w+" to recognise anything, or a tag object to make the tag have a value (e.g "--size 10"). Tags with values will be put in the data object.
 * @returns {ParsedTags}
 * @example
 * ```
 * Tagify({
 *   string: "Write text --bold --italic --fontSize 24",
 *   prefix: "--"
 * }, "bold", "italic", "strikethrough", "underline", { fontSize: Number })
 * // -> {
 * //   string: "Write text --bold --italic",
 * //   newString: "Write text",
 * //   matches: ["bold", "italic", "fontSize"],
 * //   data: { fontSize: 24 }
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

  let tagData = options && options.tagData || {}
  let n = tags.length
  while (n--) {
    const t = tags[n]
    if (t && typeof t === "object") {
      if (t.tag) continue;
      const other = Object.keys(t).filter(k => !["tag", "value", "resolve"].includes(k))
      if (other.length) {
        tags.splice(n, 1)
        for (const i of other) tags.push({ tag: i, value: t[i], resolve: t.resolve })
      }
    }
  }

  tags = tags.map(t => {
    if (typeof t === "string" && t.includes(" ")) t = { tag: t.split(/ +/)[0], value: t.split(/ +/)[1] }
    if (typeof t === "string") return t
    if (typeof t === "object" && t) {
      if (t.value == null && t.tag) return t.tag
      if (t.tag && t.value !== null) {
        if (t.resolve !== false) {
          if (t.value === Boolean || typeof t.value === "boolean" || ["true", "false"].includes(t.value)) {
            if (!tagData[t.tag]) tagData[t.tag] = Boolean
            t.value = "(?:true|false|yes|no)"
          }
          else if (t.value === Number || typeof t.value === "number" || !isNaN(t.value)) {
            if (!tagData[t.tag]) tagData[t.tag] = Number
            t.value = options.negativeNumbers ? "-?\\d+" : "\\d+"
            if (options.numberDoubles) t.value += "(?:\.\\d+)?"
          }
          else if (t.value instanceof RegExp) {
            if (!tagData[t.tag]) tagData[t.tag] = RegExp
            t.value = `(?:${t.value.toString().split("/")[1]})`
          }
          else if ([Object, Array, JSON].includes(t.value) || typeof t.value === "object") {
            if (!tagData[t.tag]) tagData[t.tag] = Object
            t.value = t.value === Array || t.value instanceof Array ? "\\[[^]+]" : "{[^]+}"
          }
          else if (t.value === String || typeof t.value === "string") {
            if (!tagData[t.tag]) tagData[t.tag] = String
            t.value = options.numbersInStrings !== false ? "\\w+" : "[A-Za-z]+"
          }
        }

        return t.tag + " " + t.value
      }
    }

    return t
  })

  if (prefix instanceof RegExp) prefix = `(?:${prefix.toString().split("/")[1]})`
  if (prefix.startsWith("^")) prefix = prefix.slice(1)
  const p = new RegExp(`^${prefix}`)
  let newString = tags[0] ? string.replace(new RegExp(` ?(?:${prefix}${tags.join(`|${prefix}`)})${" ".match(p) ? "" : " ?"}`, "g", "i"), t => {
    const old = t
    let spc = false
    
    if (t.startsWith(" ") && t.endsWith(" ") && !string.startsWith(t) && !string.endsWith(t)) spc = true
    t = t.trim().replace(p, "")

    if (tagData[t.split(" ")[0]] || (t.includes(" ") && !tags.includes(t))) {
      t = t.split(/ +/)
      t = [t[0], t.slice(1).join(" ")]

      if (tagData[t[0]] === Number) t[1] = Number(t[1])
      else if (tagData[t[0]] === Boolean) {
        switch (t[1]) {
          case "true": case "yes": t[1] = true; break
          case "false": case "no": t[1] = false; break
        }
      } else if (tagData[t[0]] !== String) {
        try {
          t[1] = t[1].startsWith("{") ? JSON.parse(t[1].replace(/({|\s|,)\w+:/g, w => w[0] + '"' + w.slice(1, w.length - 1) + '":')) : JSON.parse(t[1])
        } catch(err) {
          if (tagData[t[0]] === Object) return options.removeAllTags ? spc ? " " : "" : old
        }
      }

      data[t[0]] = t[1]
      if (!matches.includes(t[0])) matches.push(t[0])
    } else if (!matches.includes(t)) matches.push(t)

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
    data,
    tagData
  }
}

/**
 * The package's version.
 */
module.exports.version = require("../package.json").version