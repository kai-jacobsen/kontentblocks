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