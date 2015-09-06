var FieldControlModel = require('fields/FieldControlModelModal');
module.exports = FieldControlModel.extend({
  initialize: function(){
    this.cleanUp();
    var module = this.get('fieldId'); // fieldId equals baseId equals the parent object id (Panel or Module)
    if (module && (this.ModuleModel = KB.ObjectProxy.get(module)) && this.getType()) { // if object exists and this field type is valid
      this.set('ModuleModel', this.ModuleModel); // assign the parent object model
      this.setData(); // get data from the parent object and assign to this
      this.bindHandlers(); // attach listeners
      this.setupType(); // create the field view
      this.ModuleModel.attachField(this);
    }
  },
  bindHandlers: function(){
    console.log('where some handlers wuld do their work');
  }
});