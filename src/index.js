module.exports = function Tagify(options = {}, ...tags) {
  let matches = []
  let data = {}
  tags = tags.flat()
  
  let string, prefix;
  if (typeof options === "string") {
    string = options
    prefix = "(-|--)"
  } else if (options && typeof options === "object") {
    { string, prefix } = options
  } else [string, prefix] = ["", "--"]
  
  let newString = tags[0] ? string.replace(new RegExp(" ?(" + prefix + tags.map(t => {
    if (typeof t === "string" && t.includes(" ")) t = {tag: t.split(/ +/)[0], value: t.split(/ +/)[1]}
    if (typeof t === "string") return t
    if (typeof t === "object" && t) {
      if (t.tag && t.value) {
        if (t.value === Number || typeof t.value === "number" || !isNaN(t.value)) t.value = "\\d+"
        else if (t.value === String || typeof t.value === "string" && !t.value.includes("\\")) t.value = "\\w+"
        
        return t.tag + " " + t.value
      }
    }
    
    return t
  }).join("|" + prefix) + ") ?", "g", "i"), t => {
    t = t.trim().slice(prefix.length)
    if (t.split(/ +/)[1]) {
      t = t.split(/ +/)
      data[t[0]] = t[1]
      matches.push(t[0])
    } else matches.push(t)
    
    return ""
  }).trim() : string

  return {
    string,
    newString,
    matches,
    data
  }
}
