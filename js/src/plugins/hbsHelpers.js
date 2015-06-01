HandlebarsKB.registerHelper("debug", function (optionalValue) {
  console.log("Current Context");
  console.log("====================");
  console.log(this);
  if (optionalValue) {
    console.log("Value");
    console.log("====================");
    console.log(optionalValue);
  }
});

HandlebarsKB.registerHelper("fieldName", function (base, index, key) {
  return base + "[" + index + "][" + key + "]";
});

HandlebarsKB.registerHelper('trimString', function(passedString, length) {
  length = length || 50;
  var overlength = passedString.length > length;
  var theString = passedString.substring(0,length);

  if (overlength){
    theString = theString + '…';
  }

  return new HandlebarsKB.SafeString(theString)
});