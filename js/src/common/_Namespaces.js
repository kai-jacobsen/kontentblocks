var KB = KB || {};
KB.Config = {};
KB.Backbone = {
  Backend: {},
  Frontend: {},
  Shared: {},
  Common: {},
  Sidebar: {
    AreaOverview: {},
    AreaDetails: {},
    PanelOverview: {}
  },
  Inline: {}
};
KB.Fields = {};
KB.Utils = {};
KB.Ext = {};
KB.OSConfig = {};
KB.IEdit = {};
KB.Events = {};

_.extend(KB, Backbone.Events);
_.extend(KB.Events, Backbone.Events);