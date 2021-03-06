module.exports =
{
  fields: {},
  register: function (obj) {
    var id = obj.prototype.type;
    this.fields[id] = obj;
  },
  get: function (field) {
    return new this.fields[field.model.get('type')]({model: new Backbone.Model(field.model.toJSON())});
  },
  getRefByType: function(type, data){
    return new this.fields[type]({model: new Backbone.Model(data)});
  }
};