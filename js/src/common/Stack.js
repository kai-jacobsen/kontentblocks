function Stack() {
  this.items = [];
}

Stack.prototype.append = function (item) {
  this.items.push(item);
};

Stack.prototype.prepend = function (item) {
  this.items.unshift(item);
};

Stack.prototype.reset = function () {
  this.items = [];
};

Stack.prototype.length = function () {
  return this.items.length;
};

Stack.prototype.hasItems = function () {
  return (this.items.length > 0);
};

Stack.prototype.first = function () {
  if (this.items.length > 0) {
    return this.items.shift();
  }
  return null;
};

Stack.prototype.last = function () {
  if (this.items.length > 0) {
    return this.items.pop();
  }
  return null;
};

module.exports = Stack;