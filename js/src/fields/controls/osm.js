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
    this.default = {
      road: '',
      postcode: '',
      village: '',
      state: '',
      house_number: ''
    }
    this.$map = this.$('[data-kb-osm-map]').attr('id', this.uniq);
    this.$lat = this.$('[data-kb-osm-lat]');
    this.$lng = this.$('[data-kb-osm-lng]');
    this.$road = this.$('[data-kb-osm-road]');
    this.$postcode = this.$('[data-kb-osm-postcode]');
    this.$village = this.$('[data-kb-osm-village]');
    this.$state = this.$('[data-kb-osm-state]');
    this.$housenumber = this.$('[data-kb-osm-housenumber]');
    _.defer(function () {
      that.setupMap();
      _.defer(function () {
        that.map.invalidateSize();
      });
    });

    this.$map.on('mouseenter', function () {
      that.map.invalidateSize();
    })

  },
  updateMarker: function () {
    var lat = this.$lat.val();
    var lng = this.$lng.val();
    this.setMarker(lat, lng, this.default, false);
    this.map.setView(this.marker.getLatLng());
  },
  derender: function () {
  },

  reverseGeocode: function (lat, lng, cb) {
    var that = this;
    var GeoCRev = new L.Control.Geocoder.Nominatim({
      collapsed: false,
      defaultMarkGeocode: false
    });
    GeoCRev.reverse(L.latLng(lat, lng), 18, function (res) {
      cb.call(that, res)
    });
  },

  setupMap: function () {
    var that = this;
    this.map = L.map(this.uniq).setView([53.551086, 9.993682], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
    }).addTo(this.map);

    var GeoC = new L.Control.Geocoder({
      collapsed: false,
      defaultMarkGeocode: false
    });

    GeoC.on('markgeocode', function (e) {
      that.map.setView(e.geocode.center, 17);
      that.setMarker(e.geocode.properties.lat, e.geocode.properties.lon, Object.assign({}, that.default, e.geocode.properties.address), true)

    });
    GeoC.addTo(this.map);

    this.map.on('click', function (e) {
      that.reverseGeocode(e.latlng.lat, e.latlng.lng, function (res) {
        var result = res[0];
        if (!result || !result.properties) {
          that.setMarker(e.latlng.lat, e.latlng.lng, that.default, true)
        }
        that.setMarker(e.latlng.lat, e.latlng.lng, Object.assign({}, that.default, {
          road: result.properties.address.footway || result.properties.address.pedestrian || result.properties.address.road,
          postcode: result.properties.address.postcode,
          village: result.properties.address.city || result.properties.address.town,
          state: result.properties.address.state || result.properties.address.city,
          house_number: result.properties.address.house_number || ''
        }), true)
      })
    });
    this.updateMarker();
    this.$('.leaflet-control-geocoder,[data-prevent-send]').on('keydown', function (e) {
      if (e.which === 13) {
        e.stopPropagation();
        e.preventDefault();
      }
    })

  },
  setMarker: function (lat, lng, properties, setDetails) {
    var that = this;
    setDetails = setDetails || false;
    if (that.marker) {
      that.map.removeLayer(that.marker);
    }
    //Add a marker to show where you clicked.
    that.marker = L.marker([lat, lng]).addTo(that.map);
    that.$lat.val(lat);
    that.$lng.val(lng);
    if (setDetails) {
      that.$road.val(properties.road);
      that.$village.val(properties.village);
      that.$postcode.val(properties.postcode);
      that.$state.val(properties.state);
      that.$housenumber.val(properties.house_number);
    }

  },
  toString: function () {
    return '';
  }
});