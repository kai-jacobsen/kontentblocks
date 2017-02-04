var TabSection = require('./TabSection');
module.exports = Backbone.View.extend({

  initialize: function (options) {
    this.controller = options.controller;
    this.$navList = this.$('.kb-status-settings--tab-nav-list');
    this.sections = {};
  },
  addItem: function (section, view) {
    var sectionView = this.createSection(section);
    sectionView.addField(view);
  },
  render: function () {

  },
  createSection: function (section) {
    if (!this.sections[section.id]) {
      var target = this.model.get('mid') + '_tab_' + section.id;
      var sectionView = new TabSection({
        model: this.model,
        sectionId: section.id,
        containerId: target,
        id: target
      });
      this.$el.append(sectionView.$el);
      this.$navList.append('<li><a href="#'+target+'">' + section.label + '</a></li>');
      this.sections[section.id] = sectionView;
    }
    return this.sections[section.id];
  }

});