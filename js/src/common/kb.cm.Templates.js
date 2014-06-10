KB.Templates = (function ($) {

    var tmpl_cache = {};
    var hlpf_cache = {};

    function getTmplCache() {
        return tmpl_cache;
    }

    function render(tmpl_name, tmpl_data) {
        var tmpl_string;
        if (!tmpl_cache[tmpl_name]) {
            var tmpl_dir = kontentblocks.config.url + 'js/templates';

            var tmpl_url = tmpl_dir + '/' + tmpl_name + '.hbs?'+ kontentblocks.config.hash;

            // if a full url is given, tmpl_url will be overwritten
            var pat = /^https?:\/\//i;
            if (pat.test(tmpl_name)) {
                tmpl_url = tmpl_name;
            }

            if (KB.Util.stex.get(tmpl_url)) {
                tmpl_string = KB.Util.stex.get(tmpl_url);
            } else {
                $.ajax({
                    url: tmpl_url,
                    method: 'GET',
                    async: false,
                    success: function (data) {
                        tmpl_string = data;
                        KB.Util.stex.set(tmpl_url, tmpl_string, 2 * 1000 * 60);
                    }
                });
            }
            tmpl_cache[tmpl_name] = Handlebars.compile(tmpl_string);
        }
        return tmpl_cache[tmpl_name](tmpl_data);
    }

    function helpfile(hlpf_url) {
        if (!hlpf_cache[hlpf_url]) {

            var hlpf_string;
            $.ajax({
                url: hlpf_url,
                method: 'GET',
                async: false,
                dataType: 'html',
                success: function (data) {
                    hlpf_string = data;
                }
            });

            hlpf_cache[hlpf_url] = hlpf_url;
        }
        return hlpf_cache[hlpf_url];
    };

    return {
        render: render,
        helpfile: helpfile
    };
}(jQuery));