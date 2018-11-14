var BaseView = require('../FieldControlBaseView');
var Utilities = require('common/Utilities');
var Config = require('common/Config');
module.exports = BaseView.extend({
  initialize: function () {
    this.uniq = _.uniqueId('map');
    this.marker = null;
    this.render();
  },
  events: {
    'change input': 'updateMarker'
  },
  render: function () {
    var that = this;
    this.$map = this.$('[data-kb-osm-map]').attr('id', this.uniq);
    this.$lat = this.$('[data-kb-osm-lat]');
    this.$lng = this.$('[data-kb-osm-lng]');
    _.defer(function () {
      that.setupMap();
    });
  },
  updateMarker: function () {
    var lat = this.$lat.val();
    var lng = this.$lng.val();
    this.setMarker(lat, lng);
    this.map.setView(this.marker.getLatLng());
  },
  derender: function () {
  },
  setupMap: function () {
    var that = this;
    this.map = L.map(this.uniq).setView([53.551086, 9.993682], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
    }).addTo(this.map);
    L.Control.geocoder(
      {
        collapsed: false,
        defaultMarkGeocode: false
      }
    ).on('markgeocode', function (e) {
      that.map.setView(e.geocode.center, 17);
    })
      .addTo(this.map);

    this.map.on('click', function (e) {
      that.setMarker(e.latlng.lat, e.latlng.lng)
    });
    that.updateMarker();

    $('.leaflet-control-geocoder').on('keydown', function (e) {
      if (e.which === 13) {
        e.stopPropagation();
        e.preventDefault();
      }
    })
  },
  setMarker: function (lat, lng) {
    var that = this;
    if (that.marker) {
      that.map.removeLayer(that.marker);
    }
    //Add a marker to show where you clicked.
    that.marker = L.marker([lat, lng]).addTo(that.map);
    that.$lat.val(lat);
    that.$lng.val(lng);
  },
  toString: function () {
    return '';
  }
});