module.exports = {
  textNum: function (str) {
    var text = str
    if (text.length > 6) {
      text = text.substring(0, 6) + '...'
    }
    return text
  },
}
