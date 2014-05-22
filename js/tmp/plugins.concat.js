/*! alertify - v0.3.11 - 2013-10-08 */
!function(a,b){"use strict";var c,d=a.document;c=function(){var c,e,f,g,h,i,j,k,l,m,n,o,p,q={},r={},s=!1,t={ENTER:13,ESC:27,SPACE:32},u=[];return r={buttons:{holder:'<nav class="alertify-buttons">{{buttons}}</nav>',submit:'<button type="submit" class="alertify-button alertify-button-ok" id="alertify-ok">{{ok}}</button>',ok:'<button class="alertify-button alertify-button-ok" id="alertify-ok">{{ok}}</button>',cancel:'<button class="alertify-button alertify-button-cancel" id="alertify-cancel">{{cancel}}</button>'},input:'<div class="alertify-text-wrapper"><input type="text" class="alertify-text" id="alertify-text"></div>',message:'<p class="alertify-message">{{message}}</p>',log:'<article class="alertify-log{{class}}">{{message}}</article>'},p=function(){var a,c,e=!1,f=d.createElement("fakeelement"),g={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"otransitionend",transition:"transitionend"};for(a in g)if(f.style[a]!==b){c=g[a],e=!0;break}return{type:c,supported:e}},c=function(a){return d.getElementById(a)},q={labels:{ok:"OK",cancel:"Cancel"},delay:5e3,buttonReverse:!1,buttonFocus:"ok",transition:b,addListeners:function(a){var b,c,i,j,k,l="undefined"!=typeof f,m="undefined"!=typeof e,n="undefined"!=typeof o,p="",q=this;b=function(b){return"undefined"!=typeof b.preventDefault&&b.preventDefault(),i(b),"undefined"!=typeof o&&(p=o.value),"function"==typeof a&&("undefined"!=typeof o?a(!0,p):a(!0)),!1},c=function(b){return"undefined"!=typeof b.preventDefault&&b.preventDefault(),i(b),"function"==typeof a&&a(!1),!1},i=function(){q.hide(),q.unbind(d.body,"keyup",j),q.unbind(g,"focus",k),l&&q.unbind(f,"click",b),m&&q.unbind(e,"click",c)},j=function(a){var d=a.keyCode;(d===t.SPACE&&!n||n&&d===t.ENTER)&&b(a),d===t.ESC&&m&&c(a)},k=function(){n?o.focus():!m||q.buttonReverse?f.focus():e.focus()},this.bind(g,"focus",k),this.bind(h,"focus",k),l&&this.bind(f,"click",b),m&&this.bind(e,"click",c),this.bind(d.body,"keyup",j),this.transition.supported||this.setFocus()},bind:function(a,b,c){"function"==typeof a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent&&a.attachEvent("on"+b,c)},handleErrors:function(){if("undefined"!=typeof a.onerror){var b=this;return a.onerror=function(a,c,d){b.error("["+a+" on line "+d+" of "+c+"]",0)},!0}return!1},appendButtons:function(a,b){return this.buttonReverse?b+a:a+b},build:function(a){var b="",c=a.type,d=a.message,e=a.cssClass||"";switch(b+='<div class="alertify-dialog">',b+='<a id="alertify-resetFocusBack" class="alertify-resetFocus" href="#">Reset Focus</a>',"none"===q.buttonFocus&&(b+='<a href="#" id="alertify-noneFocus" class="alertify-hidden"></a>'),"prompt"===c&&(b+='<div id="alertify-form">'),b+='<article class="alertify-inner">',b+=r.message.replace("{{message}}",d),"prompt"===c&&(b+=r.input),b+=r.buttons.holder,b+="</article>","prompt"===c&&(b+="</div>"),b+='<a id="alertify-resetFocus" class="alertify-resetFocus" href="#">Reset Focus</a>',b+="</div>",c){case"confirm":b=b.replace("{{buttons}}",this.appendButtons(r.buttons.cancel,r.buttons.ok)),b=b.replace("{{ok}}",this.labels.ok).replace("{{cancel}}",this.labels.cancel);break;case"prompt":b=b.replace("{{buttons}}",this.appendButtons(r.buttons.cancel,r.buttons.submit)),b=b.replace("{{ok}}",this.labels.ok).replace("{{cancel}}",this.labels.cancel);break;case"alert":b=b.replace("{{buttons}}",r.buttons.ok),b=b.replace("{{ok}}",this.labels.ok)}return l.className="alertify alertify-"+c+" "+e,k.className="alertify-cover",b},close:function(a,b){var c,d,e=b&&!isNaN(b)?+b:this.delay,f=this;this.bind(a,"click",function(){c(a)}),d=function(a){a.stopPropagation(),f.unbind(this,f.transition.type,d),m.removeChild(this),m.hasChildNodes()||(m.className+=" alertify-logs-hidden")},c=function(a){"undefined"!=typeof a&&a.parentNode===m&&(f.transition.supported?(f.bind(a,f.transition.type,d),a.className+=" alertify-log-hide"):(m.removeChild(a),m.hasChildNodes()||(m.className+=" alertify-logs-hidden")))},0!==b&&setTimeout(function(){c(a)},e)},dialog:function(a,b,c,e,f){j=d.activeElement;var g=function(){m&&null!==m.scrollTop&&k&&null!==k.scrollTop||g()};if("string"!=typeof a)throw new Error("message must be a string");if("string"!=typeof b)throw new Error("type must be a string");if("undefined"!=typeof c&&"function"!=typeof c)throw new Error("fn must be a function");return this.init(),g(),u.push({type:b,message:a,callback:c,placeholder:e,cssClass:f}),s||this.setup(),this},extend:function(a){if("string"!=typeof a)throw new Error("extend method must have exactly one paramter");return function(b,c){return this.log(b,a,c),this}},hide:function(){var a,b=this;u.splice(0,1),u.length>0?this.setup(!0):(s=!1,a=function(c){c.stopPropagation(),b.unbind(l,b.transition.type,a)},this.transition.supported?(this.bind(l,this.transition.type,a),l.className="alertify alertify-hide alertify-hidden"):l.className="alertify alertify-hide alertify-hidden alertify-isHidden",k.className="alertify-cover alertify-cover-hidden",j.focus())},init:function(){d.createElement("nav"),d.createElement("article"),d.createElement("section"),null==c("alertify-cover")&&(k=d.createElement("div"),k.setAttribute("id","alertify-cover"),k.className="alertify-cover alertify-cover-hidden",d.body.appendChild(k)),null==c("alertify")&&(s=!1,u=[],l=d.createElement("section"),l.setAttribute("id","alertify"),l.className="alertify alertify-hidden",d.body.appendChild(l)),null==c("alertify-logs")&&(m=d.createElement("section"),m.setAttribute("id","alertify-logs"),m.className="alertify-logs alertify-logs-hidden",d.body.appendChild(m)),d.body.setAttribute("tabindex","0"),this.transition=p()},log:function(a,b,c){var d=function(){m&&null!==m.scrollTop||d()};return this.init(),d(),m.className="alertify-logs",this.notify(a,b,c),this},notify:function(a,b,c){var e=d.createElement("article");e.className="alertify-log"+("string"==typeof b&&""!==b?" alertify-log-"+b:""),e.innerHTML=a,m.appendChild(e),setTimeout(function(){e.className=e.className+" alertify-log-show"},50),this.close(e,c)},set:function(a){var b;if("object"!=typeof a&&a instanceof Array)throw new Error("args must be an object");for(b in a)a.hasOwnProperty(b)&&(this[b]=a[b])},setFocus:function(){o?(o.focus(),o.select()):i.focus()},setup:function(a){var d,j=u[0],k=this;s=!0,d=function(a){a.stopPropagation(),k.setFocus(),k.unbind(l,k.transition.type,d)},this.transition.supported&&!a&&this.bind(l,this.transition.type,d),l.innerHTML=this.build(j),g=c("alertify-resetFocus"),h=c("alertify-resetFocusBack"),f=c("alertify-ok")||b,e=c("alertify-cancel")||b,i="cancel"===q.buttonFocus?e:"none"===q.buttonFocus?c("alertify-noneFocus"):f,o=c("alertify-text")||b,n=c("alertify-form")||b,"string"==typeof j.placeholder&&""!==j.placeholder&&(o.value=j.placeholder),a&&this.setFocus(),this.addListeners(j.callback)},unbind:function(a,b,c){"function"==typeof a.removeEventListener?a.removeEventListener(b,c,!1):a.detachEvent&&a.detachEvent("on"+b,c)}},{alert:function(a,b,c){return q.dialog(a,"alert",b,"",c),this},confirm:function(a,b,c){return q.dialog(a,"confirm",b,"",c),this},extend:q.extend,init:q.init,log:function(a,b,c){return q.log(a,b,c),this},prompt:function(a,b,c,d){return q.dialog(a,"prompt",b,c,d),this},success:function(a,b){return q.log(a,"success",b),this},error:function(a,b){return q.log(a,"error",b),this},set:function(a){q.set(a)},labels:q.labels,debug:q.handleErrors}},"function"==typeof define?define([],function(){return new c}):"undefined"==typeof a.alertify&&(a.alertify=new c)}(this);
/*!Denis Sokolov, http://akral.github.io/details-tag/, denis@sokolov.cc. GPL, MIT */
(function(b){var d="open"in document.createElement("details"),e;b.fn.details=function(a){"open"===a&&(d?this.prop("open",!0):this.trigger("open"));"close"===a&&(d?this.prop("open",!1):this.trigger("close"));"init"===a&&e(b(this));if(!a){if(!d)return this.hasClass("open");var c=!1;this.each(function(){if(this.open)return c=!0,!1});return c}};e=function(a){a=a.not(".details-inited").addClass("details-inited");a.filter(".animated").each(function(){var a=b(this),d=a.children("summary").remove(),e=b("<div>").addClass("details-wrapper").append(a.children());
    a.append(e).prepend(d)});d||(a.each(function(){var a=b(this);a.children("summary").length||a.prepend("<summary>Details</summary>")}).children("summary").filter(":not(tabindex)").attr("tabindex",0).end().end().contents(":not(summary)").filter(function(){return 3===this.nodeType&&/[^\t\n\r ]/.test(this.data)}).wrap("<span>").end().end().filter(":not([open])").prop("open",!1).end().filter("[open]").addClass("open").prop("open",!0).end(),b.browser.msie&&9>b.browser.msie&&a.filter(":not(.open)").children().not("summary").hide())};
    b(function(){b("body").on("open.details","details.animated",function(){var a=b(this),c=a.children(".details-wrapper");c.hide();setTimeout(function(){c.slideDown(a.data("animation-speed"))},0)}).on("close.details","details.animated",function(){var a=b(this),c=a.children(".details-wrapper");setTimeout(function(){a.prop("open",!0).addClass("open");c.slideUp(a.data("animation-speed"),function(){a.prop("open",!1).removeClass("open")})},0)});if(d)b("body").on("click","summary",function(){var a=b(this).parent();
        a.prop("open")?a.trigger("close"):a.trigger("open")});else if(b("html").addClass("no-details"),b("head").prepend('<style>details{display:block}summary{cursor:pointer}details>summary::before{content:"\u25ba"}details.open>summary::before{content:"\u25bc"}details:not(.open)>:not(summary){display:none}</style>'),b("body").on("open.details","details",function(a){b(this).addClass("open").trigger("change.details");a.stopPropagation()}).on("close.details","details",function(a){b(this).removeClass("open").trigger("change.details");
        a.stopPropagation()}).on("toggle.details","details",function(a){var c=b(this);c.hasClass("open")?c.trigger("close"):c.trigger("open");a.stopPropagation()}).on("click","summary",function(){b(this).parent().trigger("toggle")}).on("keyup","summary",function(a){(32===a.keyCode||13===a.keyCode&&!b.browser.opera)&&b(this).parent().trigger("toggle")}),b.browser.msie&&9>b.browser.msie)b("body").on("open.details","details",function(){b(this).children().not("summary").show()}).on("close.details","details",
        function(){b(this).children().not("summary").hide()});e(b("details"))})})(jQuery);
/*!

 handlebars v1.3.0

 Copyright (C) 2011 by Yehuda Katz

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 @license
 */
/* exported Handlebars */
var Handlebars = (function() {
// handlebars/safe-string.js
    var __module4__ = (function() {
        "use strict";
        var __exports__;
        // Build out our basic SafeString type
        function SafeString(string) {
            this.string = string;
        }

        SafeString.prototype.toString = function() {
            return "" + this.string;
        };

        __exports__ = SafeString;
        return __exports__;
    })();

// handlebars/utils.js
    var __module3__ = (function(__dependency1__) {
        "use strict";
        var __exports__ = {};
        /*jshint -W004 */
        var SafeString = __dependency1__;

        var escape = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "`": "&#x60;"
        };

        var badChars = /[&<>"'`]/g;
        var possible = /[&<>"'`]/;

        function escapeChar(chr) {
            return escape[chr] || "&amp;";
        }

        function extend(obj, value) {
            for(var key in value) {
                if(Object.prototype.hasOwnProperty.call(value, key)) {
                    obj[key] = value[key];
                }
            }
        }

        __exports__.extend = extend;var toString = Object.prototype.toString;
        __exports__.toString = toString;
        // Sourced from lodash
        // https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
        var isFunction = function(value) {
            return typeof value === 'function';
        };
        // fallback for older versions of Chrome and Safari
        if (isFunction(/x/)) {
            isFunction = function(value) {
                return typeof value === 'function' && toString.call(value) === '[object Function]';
            };
        }
        var isFunction;
        __exports__.isFunction = isFunction;
        var isArray = Array.isArray || function(value) {
                return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
            };
        __exports__.isArray = isArray;

        function escapeExpression(string) {
            // don't escape SafeStrings, since they're already safe
            if (string instanceof SafeString) {
                return string.toString();
            } else if (!string && string !== 0) {
                return "";
            }

            // Force a string conversion as this will be done by the append regardless and
            // the regex test will do this transparently behind the scenes, causing issues if
            // an object's to string has escaped characters in it.
            string = "" + string;

            if(!possible.test(string)) { return string; }
            return string.replace(badChars, escapeChar);
        }

        __exports__.escapeExpression = escapeExpression;function isEmpty(value) {
            if (!value && value !== 0) {
                return true;
            } else if (isArray(value) && value.length === 0) {
                return true;
            } else {
                return false;
            }
        }

        __exports__.isEmpty = isEmpty;
        return __exports__;
    })(__module4__);

// handlebars/exception.js
    var __module5__ = (function() {
        "use strict";
        var __exports__;

        var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

        function Exception(message, node) {
            var line;
            if (node && node.firstLine) {
                line = node.firstLine;

                message += ' - ' + line + ':' + node.firstColumn;
            }

            var tmp = Error.prototype.constructor.call(this, message);

            // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
            for (var idx = 0; idx < errorProps.length; idx++) {
                this[errorProps[idx]] = tmp[errorProps[idx]];
            }

            if (line) {
                this.lineNumber = line;
                this.column = node.firstColumn;
            }
        }

        Exception.prototype = new Error();

        __exports__ = Exception;
        return __exports__;
    })();

// handlebars/base.js
    var __module2__ = (function(__dependency1__, __dependency2__) {
        "use strict";
        var __exports__ = {};
        var Utils = __dependency1__;
        var Exception = __dependency2__;

        var VERSION = "1.3.0";
        __exports__.VERSION = VERSION;var COMPILER_REVISION = 4;
        __exports__.COMPILER_REVISION = COMPILER_REVISION;
        var REVISION_CHANGES = {
            1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
            2: '== 1.0.0-rc.3',
            3: '== 1.0.0-rc.4',
            4: '>= 1.0.0'
        };
        __exports__.REVISION_CHANGES = REVISION_CHANGES;
        var isArray = Utils.isArray,
            isFunction = Utils.isFunction,
            toString = Utils.toString,
            objectType = '[object Object]';

        function HandlebarsEnvironment(helpers, partials) {
            this.helpers = helpers || {};
            this.partials = partials || {};

            registerDefaultHelpers(this);
        }

        __exports__.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
            constructor: HandlebarsEnvironment,

            logger: logger,
            log: log,

            registerHelper: function(name, fn, inverse) {
                if (toString.call(name) === objectType) {
                    if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
                    Utils.extend(this.helpers, name);
                } else {
                    if (inverse) { fn.not = inverse; }
                    this.helpers[name] = fn;
                }
            },

            registerPartial: function(name, str) {
                if (toString.call(name) === objectType) {
                    Utils.extend(this.partials,  name);
                } else {
                    this.partials[name] = str;
                }
            }
        };

        function registerDefaultHelpers(instance) {
            instance.registerHelper('helperMissing', function(arg) {
                if(arguments.length === 2) {
                    return undefined;
                } else {
                    throw new Exception("Missing helper: '" + arg + "'");
                }
            });

            instance.registerHelper('blockHelperMissing', function(context, options) {
                var inverse = options.inverse || function() {}, fn = options.fn;

                if (isFunction(context)) { context = context.call(this); }

                if(context === true) {
                    return fn(this);
                } else if(context === false || context == null) {
                    return inverse(this);
                } else if (isArray(context)) {
                    if(context.length > 0) {
                        return instance.helpers.each(context, options);
                    } else {
                        return inverse(this);
                    }
                } else {
                    return fn(context);
                }
            });

            instance.registerHelper('each', function(context, options) {
                var fn = options.fn, inverse = options.inverse;
                var i = 0, ret = "", data;

                if (isFunction(context)) { context = context.call(this); }

                if (options.data) {
                    data = createFrame(options.data);
                }

                if(context && typeof context === 'object') {
                    if (isArray(context)) {
                        for(var j = context.length; i<j; i++) {
                            if (data) {
                                data.index = i;
                                data.first = (i === 0);
                                data.last  = (i === (context.length-1));
                            }
                            ret = ret + fn(context[i], { data: data });
                        }
                    } else {
                        for(var key in context) {
                            if(context.hasOwnProperty(key)) {
                                if(data) {
                                    data.key = key;
                                    data.index = i;
                                    data.first = (i === 0);
                                }
                                ret = ret + fn(context[key], {data: data});
                                i++;
                            }
                        }
                    }
                }

                if(i === 0){
                    ret = inverse(this);
                }

                return ret;
            });

            instance.registerHelper('if', function(conditional, options) {
                if (isFunction(conditional)) { conditional = conditional.call(this); }

                // Default behavior is to render the positive path if the value is truthy and not empty.
                // The `includeZero` option may be set to treat the condtional as purely not empty based on the
                // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
                if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
                    return options.inverse(this);
                } else {
                    return options.fn(this);
                }
            });

            instance.registerHelper('unless', function(conditional, options) {
                return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
            });

            instance.registerHelper('with', function(context, options) {
                if (isFunction(context)) { context = context.call(this); }

                if (!Utils.isEmpty(context)) return options.fn(context);
            });

            instance.registerHelper('log', function(context, options) {
                var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
                instance.log(level, context);
            });
        }

        var logger = {
            methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

            // State enum
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            level: 3,

            // can be overridden in the host environment
            log: function(level, obj) {
                if (logger.level <= level) {
                    var method = logger.methodMap[level];
                    if (typeof console !== 'undefined' && console[method]) {
                        console[method].call(console, obj);
                    }
                }
            }
        };
        __exports__.logger = logger;
        function log(level, obj) { logger.log(level, obj); }

        __exports__.log = log;var createFrame = function(object) {
            var obj = {};
            Utils.extend(obj, object);
            return obj;
        };
        __exports__.createFrame = createFrame;
        return __exports__;
    })(__module3__, __module5__);

// handlebars/runtime.js
    var __module6__ = (function(__dependency1__, __dependency2__, __dependency3__) {
        "use strict";
        var __exports__ = {};
        var Utils = __dependency1__;
        var Exception = __dependency2__;
        var COMPILER_REVISION = __dependency3__.COMPILER_REVISION;
        var REVISION_CHANGES = __dependency3__.REVISION_CHANGES;

        function checkRevision(compilerInfo) {
            var compilerRevision = compilerInfo && compilerInfo[0] || 1,
                currentRevision = COMPILER_REVISION;

            if (compilerRevision !== currentRevision) {
                if (compilerRevision < currentRevision) {
                    var runtimeVersions = REVISION_CHANGES[currentRevision],
                        compilerVersions = REVISION_CHANGES[compilerRevision];
                    throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
                    "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
                } else {
                    // Use the embedded version info since the runtime doesn't know about this revision yet
                    throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
                    "Please update your runtime to a newer version ("+compilerInfo[1]+").");
                }
            }
        }

        __exports__.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

        function template(templateSpec, env) {
            if (!env) {
                throw new Exception("No environment passed to template");
            }

            // Note: Using env.VM references rather than local var references throughout this section to allow
            // for external users to override these as psuedo-supported APIs.
            var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
                var result = env.VM.invokePartial.apply(this, arguments);
                if (result != null) { return result; }

                if (env.compile) {
                    var options = { helpers: helpers, partials: partials, data: data };
                    partials[name] = env.compile(partial, { data: data !== undefined }, env);
                    return partials[name](context, options);
                } else {
                    throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
                }
            };

            // Just add water
            var container = {
                escapeExpression: Utils.escapeExpression,
                invokePartial: invokePartialWrapper,
                programs: [],
                program: function(i, fn, data) {
                    var programWrapper = this.programs[i];
                    if(data) {
                        programWrapper = program(i, fn, data);
                    } else if (!programWrapper) {
                        programWrapper = this.programs[i] = program(i, fn);
                    }
                    return programWrapper;
                },
                merge: function(param, common) {
                    var ret = param || common;

                    if (param && common && (param !== common)) {
                        ret = {};
                        Utils.extend(ret, common);
                        Utils.extend(ret, param);
                    }
                    return ret;
                },
                programWithDepth: env.VM.programWithDepth,
                noop: env.VM.noop,
                compilerInfo: null
            };

            return function(context, options) {
                options = options || {};
                var namespace = options.partial ? options : env,
                    helpers,
                    partials;

                if (!options.partial) {
                    helpers = options.helpers;
                    partials = options.partials;
                }
                var result = templateSpec.call(
                    container,
                    namespace, context,
                    helpers,
                    partials,
                    options.data);

                if (!options.partial) {
                    env.VM.checkRevision(container.compilerInfo);
                }

                return result;
            };
        }

        __exports__.template = template;function programWithDepth(i, fn, data /*, $depth */) {
            var args = Array.prototype.slice.call(arguments, 3);

            var prog = function(context, options) {
                options = options || {};

                return fn.apply(this, [context, options.data || data].concat(args));
            };
            prog.program = i;
            prog.depth = args.length;
            return prog;
        }

        __exports__.programWithDepth = programWithDepth;function program(i, fn, data) {
            var prog = function(context, options) {
                options = options || {};

                return fn(context, options.data || data);
            };
            prog.program = i;
            prog.depth = 0;
            return prog;
        }

        __exports__.program = program;function invokePartial(partial, name, context, helpers, partials, data) {
            var options = { partial: true, helpers: helpers, partials: partials, data: data };

            if(partial === undefined) {
                throw new Exception("The partial " + name + " could not be found");
            } else if(partial instanceof Function) {
                return partial(context, options);
            }
        }

        __exports__.invokePartial = invokePartial;function noop() { return ""; }

        __exports__.noop = noop;
        return __exports__;
    })(__module3__, __module5__, __module2__);

// handlebars.runtime.js
    var __module1__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
        "use strict";
        var __exports__;
        /*globals Handlebars: true */
        var base = __dependency1__;

        // Each of these augment the Handlebars object. No need to setup here.
        // (This is done to easily share code between commonjs and browse envs)
        var SafeString = __dependency2__;
        var Exception = __dependency3__;
        var Utils = __dependency4__;
        var runtime = __dependency5__;

        // For compatibility and usage outside of module systems, make the Handlebars object a namespace
        var create = function() {
            var hb = new base.HandlebarsEnvironment();

            Utils.extend(hb, base);
            hb.SafeString = SafeString;
            hb.Exception = Exception;
            hb.Utils = Utils;

            hb.VM = runtime;
            hb.template = function(spec) {
                return runtime.template(spec, hb);
            };

            return hb;
        };

        var Handlebars = create();
        Handlebars.create = create;

        __exports__ = Handlebars;
        return __exports__;
    })(__module2__, __module4__, __module5__, __module3__, __module6__);

// handlebars/compiler/ast.js
    var __module7__ = (function(__dependency1__) {
        "use strict";
        var __exports__;
        var Exception = __dependency1__;

        function LocationInfo(locInfo){
            locInfo = locInfo || {};
            this.firstLine   = locInfo.first_line;
            this.firstColumn = locInfo.first_column;
            this.lastColumn  = locInfo.last_column;
            this.lastLine    = locInfo.last_line;
        }

        var AST = {
            ProgramNode: function(statements, inverseStrip, inverse, locInfo) {
                var inverseLocationInfo, firstInverseNode;
                if (arguments.length === 3) {
                    locInfo = inverse;
                    inverse = null;
                } else if (arguments.length === 2) {
                    locInfo = inverseStrip;
                    inverseStrip = null;
                }

                LocationInfo.call(this, locInfo);
                this.type = "program";
                this.statements = statements;
                this.strip = {};

                if(inverse) {
                    firstInverseNode = inverse[0];
                    if (firstInverseNode) {
                        inverseLocationInfo = {
                            first_line: firstInverseNode.firstLine,
                            last_line: firstInverseNode.lastLine,
                            last_column: firstInverseNode.lastColumn,
                            first_column: firstInverseNode.firstColumn
                        };
                        this.inverse = new AST.ProgramNode(inverse, inverseStrip, inverseLocationInfo);
                    } else {
                        this.inverse = new AST.ProgramNode(inverse, inverseStrip);
                    }
                    this.strip.right = inverseStrip.left;
                } else if (inverseStrip) {
                    this.strip.left = inverseStrip.right;
                }
            },

            MustacheNode: function(rawParams, hash, open, strip, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "mustache";
                this.strip = strip;

                // Open may be a string parsed from the parser or a passed boolean flag
                if (open != null && open.charAt) {
                    // Must use charAt to support IE pre-10
                    var escapeFlag = open.charAt(3) || open.charAt(2);
                    this.escaped = escapeFlag !== '{' && escapeFlag !== '&';
                } else {
                    this.escaped = !!open;
                }

                if (rawParams instanceof AST.SexprNode) {
                    this.sexpr = rawParams;
                } else {
                    // Support old AST API
                    this.sexpr = new AST.SexprNode(rawParams, hash);
                }

                this.sexpr.isRoot = true;

                // Support old AST API that stored this info in MustacheNode
                this.id = this.sexpr.id;
                this.params = this.sexpr.params;
                this.hash = this.sexpr.hash;
                this.eligibleHelper = this.sexpr.eligibleHelper;
                this.isHelper = this.sexpr.isHelper;
            },

            SexprNode: function(rawParams, hash, locInfo) {
                LocationInfo.call(this, locInfo);

                this.type = "sexpr";
                this.hash = hash;

                var id = this.id = rawParams[0];
                var params = this.params = rawParams.slice(1);

                // a mustache is an eligible helper if:
                // * its id is simple (a single part, not `this` or `..`)
                var eligibleHelper = this.eligibleHelper = id.isSimple;

                // a mustache is definitely a helper if:
                // * it is an eligible helper, and
                // * it has at least one parameter or hash segment
                this.isHelper = eligibleHelper && (params.length || hash);

                // if a mustache is an eligible helper but not a definite
                // helper, it is ambiguous, and will be resolved in a later
                // pass or at runtime.
            },

            PartialNode: function(partialName, context, strip, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type         = "partial";
                this.partialName  = partialName;
                this.context      = context;
                this.strip = strip;
            },

            BlockNode: function(mustache, program, inverse, close, locInfo) {
                LocationInfo.call(this, locInfo);

                if(mustache.sexpr.id.original !== close.path.original) {
                    throw new Exception(mustache.sexpr.id.original + " doesn't match " + close.path.original, this);
                }

                this.type = 'block';
                this.mustache = mustache;
                this.program  = program;
                this.inverse  = inverse;

                this.strip = {
                    left: mustache.strip.left,
                    right: close.strip.right
                };

                (program || inverse).strip.left = mustache.strip.right;
                (inverse || program).strip.right = close.strip.left;

                if (inverse && !program) {
                    this.isInverse = true;
                }
            },

            ContentNode: function(string, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "content";
                this.string = string;
            },

            HashNode: function(pairs, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "hash";
                this.pairs = pairs;
            },

            IdNode: function(parts, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "ID";

                var original = "",
                    dig = [],
                    depth = 0;

                for(var i=0,l=parts.length; i<l; i++) {
                    var part = parts[i].part;
                    original += (parts[i].separator || '') + part;

                    if (part === ".." || part === "." || part === "this") {
                        if (dig.length > 0) {
                            throw new Exception("Invalid path: " + original, this);
                        } else if (part === "..") {
                            depth++;
                        } else {
                            this.isScoped = true;
                        }
                    } else {
                        dig.push(part);
                    }
                }

                this.original = original;
                this.parts    = dig;
                this.string   = dig.join('.');
                this.depth    = depth;

                // an ID is simple if it only has one part, and that part is not
                // `..` or `this`.
                this.isSimple = parts.length === 1 && !this.isScoped && depth === 0;

                this.stringModeValue = this.string;
            },

            PartialNameNode: function(name, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "PARTIAL_NAME";
                this.name = name.original;
            },

            DataNode: function(id, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "DATA";
                this.id = id;
            },

            StringNode: function(string, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "STRING";
                this.original =
                    this.string =
                        this.stringModeValue = string;
            },

            IntegerNode: function(integer, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "INTEGER";
                this.original =
                    this.integer = integer;
                this.stringModeValue = Number(integer);
            },

            BooleanNode: function(bool, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "BOOLEAN";
                this.bool = bool;
                this.stringModeValue = bool === "true";
            },

            CommentNode: function(comment, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "comment";
                this.comment = comment;
            }
        };

        // Must be exported as an object rather than the root of the module as the jison lexer
        // most modify the object to operate properly.
        __exports__ = AST;
        return __exports__;
    })(__module5__);

// handlebars/compiler/parser.js
    var __module9__ = (function() {
        "use strict";
        var __exports__;
        /* jshint ignore:start */
        /* Jison generated parser */
        var handlebars = (function(){
            var parser = {trace: function trace() { },
                yy: {},
                symbols_: {"error":2,"root":3,"statements":4,"EOF":5,"program":6,"simpleInverse":7,"statement":8,"openInverse":9,"closeBlock":10,"openBlock":11,"mustache":12,"partial":13,"CONTENT":14,"COMMENT":15,"OPEN_BLOCK":16,"sexpr":17,"CLOSE":18,"OPEN_INVERSE":19,"OPEN_ENDBLOCK":20,"path":21,"OPEN":22,"OPEN_UNESCAPED":23,"CLOSE_UNESCAPED":24,"OPEN_PARTIAL":25,"partialName":26,"partial_option0":27,"sexpr_repetition0":28,"sexpr_option0":29,"dataName":30,"param":31,"STRING":32,"INTEGER":33,"BOOLEAN":34,"OPEN_SEXPR":35,"CLOSE_SEXPR":36,"hash":37,"hash_repetition_plus0":38,"hashSegment":39,"ID":40,"EQUALS":41,"DATA":42,"pathSegments":43,"SEP":44,"$accept":0,"$end":1},
                terminals_: {2:"error",5:"EOF",14:"CONTENT",15:"COMMENT",16:"OPEN_BLOCK",18:"CLOSE",19:"OPEN_INVERSE",20:"OPEN_ENDBLOCK",22:"OPEN",23:"OPEN_UNESCAPED",24:"CLOSE_UNESCAPED",25:"OPEN_PARTIAL",32:"STRING",33:"INTEGER",34:"BOOLEAN",35:"OPEN_SEXPR",36:"CLOSE_SEXPR",40:"ID",41:"EQUALS",42:"DATA",44:"SEP"},
                productions_: [0,[3,2],[3,1],[6,2],[6,3],[6,2],[6,1],[6,1],[6,0],[4,1],[4,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,4],[7,2],[17,3],[17,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,3],[37,1],[39,3],[26,1],[26,1],[26,1],[30,2],[21,1],[43,3],[43,1],[27,0],[27,1],[28,0],[28,2],[29,0],[29,1],[38,1],[38,2]],
                performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

                    var $0 = $$.length - 1;
                    switch (yystate) {
                        case 1: return new yy.ProgramNode($$[$0-1], this._$);
                            break;
                        case 2: return new yy.ProgramNode([], this._$);
                            break;
                        case 3:this.$ = new yy.ProgramNode([], $$[$0-1], $$[$0], this._$);
                            break;
                        case 4:this.$ = new yy.ProgramNode($$[$0-2], $$[$0-1], $$[$0], this._$);
                            break;
                        case 5:this.$ = new yy.ProgramNode($$[$0-1], $$[$0], [], this._$);
                            break;
                        case 6:this.$ = new yy.ProgramNode($$[$0], this._$);
                            break;
                        case 7:this.$ = new yy.ProgramNode([], this._$);
                            break;
                        case 8:this.$ = new yy.ProgramNode([], this._$);
                            break;
                        case 9:this.$ = [$$[$0]];
                            break;
                        case 10: $$[$0-1].push($$[$0]); this.$ = $$[$0-1];
                            break;
                        case 11:this.$ = new yy.BlockNode($$[$0-2], $$[$0-1].inverse, $$[$0-1], $$[$0], this._$);
                            break;
                        case 12:this.$ = new yy.BlockNode($$[$0-2], $$[$0-1], $$[$0-1].inverse, $$[$0], this._$);
                            break;
                        case 13:this.$ = $$[$0];
                            break;
                        case 14:this.$ = $$[$0];
                            break;
                        case 15:this.$ = new yy.ContentNode($$[$0], this._$);
                            break;
                        case 16:this.$ = new yy.CommentNode($$[$0], this._$);
                            break;
                        case 17:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
                            break;
                        case 18:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
                            break;
                        case 19:this.$ = {path: $$[$0-1], strip: stripFlags($$[$0-2], $$[$0])};
                            break;
                        case 20:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
                            break;
                        case 21:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
                            break;
                        case 22:this.$ = new yy.PartialNode($$[$0-2], $$[$0-1], stripFlags($$[$0-3], $$[$0]), this._$);
                            break;
                        case 23:this.$ = stripFlags($$[$0-1], $$[$0]);
                            break;
                        case 24:this.$ = new yy.SexprNode([$$[$0-2]].concat($$[$0-1]), $$[$0], this._$);
                            break;
                        case 25:this.$ = new yy.SexprNode([$$[$0]], null, this._$);
                            break;
                        case 26:this.$ = $$[$0];
                            break;
                        case 27:this.$ = new yy.StringNode($$[$0], this._$);
                            break;
                        case 28:this.$ = new yy.IntegerNode($$[$0], this._$);
                            break;
                        case 29:this.$ = new yy.BooleanNode($$[$0], this._$);
                            break;
                        case 30:this.$ = $$[$0];
                            break;
                        case 31:$$[$0-1].isHelper = true; this.$ = $$[$0-1];
                            break;
                        case 32:this.$ = new yy.HashNode($$[$0], this._$);
                            break;
                        case 33:this.$ = [$$[$0-2], $$[$0]];
                            break;
                        case 34:this.$ = new yy.PartialNameNode($$[$0], this._$);
                            break;
                        case 35:this.$ = new yy.PartialNameNode(new yy.StringNode($$[$0], this._$), this._$);
                            break;
                        case 36:this.$ = new yy.PartialNameNode(new yy.IntegerNode($$[$0], this._$));
                            break;
                        case 37:this.$ = new yy.DataNode($$[$0], this._$);
                            break;
                        case 38:this.$ = new yy.IdNode($$[$0], this._$);
                            break;
                        case 39: $$[$0-2].push({part: $$[$0], separator: $$[$0-1]}); this.$ = $$[$0-2];
                            break;
                        case 40:this.$ = [{part: $$[$0]}];
                            break;
                        case 43:this.$ = [];
                            break;
                        case 44:$$[$0-1].push($$[$0]);
                            break;
                        case 47:this.$ = [$$[$0]];
                            break;
                        case 48:$$[$0-1].push($$[$0]);
                            break;
                    }
                },
                table: [{3:1,4:2,5:[1,3],8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],25:[1,15]},{1:[3]},{5:[1,16],8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],25:[1,15]},{1:[2,2]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],25:[2,9]},{4:20,6:18,7:19,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,8],22:[1,13],23:[1,14],25:[1,15]},{4:20,6:22,7:19,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,8],22:[1,13],23:[1,14],25:[1,15]},{5:[2,13],14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],25:[2,13]},{5:[2,14],14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],25:[2,14]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],25:[2,15]},{5:[2,16],14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],25:[2,16]},{17:23,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:29,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:30,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:31,21:24,30:25,40:[1,28],42:[1,27],43:26},{21:33,26:32,32:[1,34],33:[1,35],40:[1,28],43:26},{1:[2,1]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],25:[2,10]},{10:36,20:[1,37]},{4:38,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,7],22:[1,13],23:[1,14],25:[1,15]},{7:39,8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,6],22:[1,13],23:[1,14],25:[1,15]},{17:23,18:[1,40],21:24,30:25,40:[1,28],42:[1,27],43:26},{10:41,20:[1,37]},{18:[1,42]},{18:[2,43],24:[2,43],28:43,32:[2,43],33:[2,43],34:[2,43],35:[2,43],36:[2,43],40:[2,43],42:[2,43]},{18:[2,25],24:[2,25],36:[2,25]},{18:[2,38],24:[2,38],32:[2,38],33:[2,38],34:[2,38],35:[2,38],36:[2,38],40:[2,38],42:[2,38],44:[1,44]},{21:45,40:[1,28],43:26},{18:[2,40],24:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],40:[2,40],42:[2,40],44:[2,40]},{18:[1,46]},{18:[1,47]},{24:[1,48]},{18:[2,41],21:50,27:49,40:[1,28],43:26},{18:[2,34],40:[2,34]},{18:[2,35],40:[2,35]},{18:[2,36],40:[2,36]},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],25:[2,11]},{21:51,40:[1,28],43:26},{8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,3],22:[1,13],23:[1,14],25:[1,15]},{4:52,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,5],22:[1,13],23:[1,14],25:[1,15]},{14:[2,23],15:[2,23],16:[2,23],19:[2,23],20:[2,23],22:[2,23],23:[2,23],25:[2,23]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],25:[2,12]},{14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],25:[2,18]},{18:[2,45],21:56,24:[2,45],29:53,30:60,31:54,32:[1,57],33:[1,58],34:[1,59],35:[1,61],36:[2,45],37:55,38:62,39:63,40:[1,64],42:[1,27],43:26},{40:[1,65]},{18:[2,37],24:[2,37],32:[2,37],33:[2,37],34:[2,37],35:[2,37],36:[2,37],40:[2,37],42:[2,37]},{14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],25:[2,17]},{5:[2,20],14:[2,20],15:[2,20],16:[2,20],19:[2,20],20:[2,20],22:[2,20],23:[2,20],25:[2,20]},{5:[2,21],14:[2,21],15:[2,21],16:[2,21],19:[2,21],20:[2,21],22:[2,21],23:[2,21],25:[2,21]},{18:[1,66]},{18:[2,42]},{18:[1,67]},{8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,4],22:[1,13],23:[1,14],25:[1,15]},{18:[2,24],24:[2,24],36:[2,24]},{18:[2,44],24:[2,44],32:[2,44],33:[2,44],34:[2,44],35:[2,44],36:[2,44],40:[2,44],42:[2,44]},{18:[2,46],24:[2,46],36:[2,46]},{18:[2,26],24:[2,26],32:[2,26],33:[2,26],34:[2,26],35:[2,26],36:[2,26],40:[2,26],42:[2,26]},{18:[2,27],24:[2,27],32:[2,27],33:[2,27],34:[2,27],35:[2,27],36:[2,27],40:[2,27],42:[2,27]},{18:[2,28],24:[2,28],32:[2,28],33:[2,28],34:[2,28],35:[2,28],36:[2,28],40:[2,28],42:[2,28]},{18:[2,29],24:[2,29],32:[2,29],33:[2,29],34:[2,29],35:[2,29],36:[2,29],40:[2,29],42:[2,29]},{18:[2,30],24:[2,30],32:[2,30],33:[2,30],34:[2,30],35:[2,30],36:[2,30],40:[2,30],42:[2,30]},{17:68,21:24,30:25,40:[1,28],42:[1,27],43:26},{18:[2,32],24:[2,32],36:[2,32],39:69,40:[1,70]},{18:[2,47],24:[2,47],36:[2,47],40:[2,47]},{18:[2,40],24:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],40:[2,40],41:[1,71],42:[2,40],44:[2,40]},{18:[2,39],24:[2,39],32:[2,39],33:[2,39],34:[2,39],35:[2,39],36:[2,39],40:[2,39],42:[2,39],44:[2,39]},{5:[2,22],14:[2,22],15:[2,22],16:[2,22],19:[2,22],20:[2,22],22:[2,22],23:[2,22],25:[2,22]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],25:[2,19]},{36:[1,72]},{18:[2,48],24:[2,48],36:[2,48],40:[2,48]},{41:[1,71]},{21:56,30:60,31:73,32:[1,57],33:[1,58],34:[1,59],35:[1,61],40:[1,28],42:[1,27],43:26},{18:[2,31],24:[2,31],32:[2,31],33:[2,31],34:[2,31],35:[2,31],36:[2,31],40:[2,31],42:[2,31]},{18:[2,33],24:[2,33],36:[2,33],40:[2,33]}],
                defaultActions: {3:[2,2],16:[2,1],50:[2,42]},
                parseError: function parseError(str, hash) {
                    throw new Error(str);
                },
                parse: function parse(input) {
                    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
                    this.lexer.setInput(input);
                    this.lexer.yy = this.yy;
                    this.yy.lexer = this.lexer;
                    this.yy.parser = this;
                    if (typeof this.lexer.yylloc == "undefined")
                        this.lexer.yylloc = {};
                    var yyloc = this.lexer.yylloc;
                    lstack.push(yyloc);
                    var ranges = this.lexer.options && this.lexer.options.ranges;
                    if (typeof this.yy.parseError === "function")
                        this.parseError = this.yy.parseError;
                    function popStack(n) {
                        stack.length = stack.length - 2 * n;
                        vstack.length = vstack.length - n;
                        lstack.length = lstack.length - n;
                    }
                    function lex() {
                        var token;
                        token = self.lexer.lex() || 1;
                        if (typeof token !== "number") {
                            token = self.symbols_[token] || token;
                        }
                        return token;
                    }
                    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
                    while (true) {
                        state = stack[stack.length - 1];
                        if (this.defaultActions[state]) {
                            action = this.defaultActions[state];
                        } else {
                            if (symbol === null || typeof symbol == "undefined") {
                                symbol = lex();
                            }
                            action = table[state] && table[state][symbol];
                        }
                        if (typeof action === "undefined" || !action.length || !action[0]) {
                            var errStr = "";
                            if (!recovering) {
                                expected = [];
                                for (p in table[state])
                                    if (this.terminals_[p] && p > 2) {
                                        expected.push("'" + this.terminals_[p] + "'");
                                    }
                                if (this.lexer.showPosition) {
                                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                                } else {
                                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                                }
                                this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
                            }
                        }
                        if (action[0] instanceof Array && action.length > 1) {
                            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
                        }
                        switch (action[0]) {
                            case 1:
                                stack.push(symbol);
                                vstack.push(this.lexer.yytext);
                                lstack.push(this.lexer.yylloc);
                                stack.push(action[1]);
                                symbol = null;
                                if (!preErrorSymbol) {
                                    yyleng = this.lexer.yyleng;
                                    yytext = this.lexer.yytext;
                                    yylineno = this.lexer.yylineno;
                                    yyloc = this.lexer.yylloc;
                                    if (recovering > 0)
                                        recovering--;
                                } else {
                                    symbol = preErrorSymbol;
                                    preErrorSymbol = null;
                                }
                                break;
                            case 2:
                                len = this.productions_[action[1]][1];
                                yyval.$ = vstack[vstack.length - len];
                                yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
                                if (ranges) {
                                    yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
                                }
                                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
                                if (typeof r !== "undefined") {
                                    return r;
                                }
                                if (len) {
                                    stack = stack.slice(0, -1 * len * 2);
                                    vstack = vstack.slice(0, -1 * len);
                                    lstack = lstack.slice(0, -1 * len);
                                }
                                stack.push(this.productions_[action[1]][0]);
                                vstack.push(yyval.$);
                                lstack.push(yyval._$);
                                newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                                stack.push(newState);
                                break;
                            case 3:
                                return true;
                        }
                    }
                    return true;
                }
            };


            function stripFlags(open, close) {
                return {
                    left: open.charAt(2) === '~',
                    right: close.charAt(0) === '~' || close.charAt(1) === '~'
                };
            }

            /* Jison generated lexer */
            var lexer = (function(){
                var lexer = ({EOF:1,
                    parseError:function parseError(str, hash) {
                        if (this.yy.parser) {
                            this.yy.parser.parseError(str, hash);
                        } else {
                            throw new Error(str);
                        }
                    },
                    setInput:function (input) {
                        this._input = input;
                        this._more = this._less = this.done = false;
                        this.yylineno = this.yyleng = 0;
                        this.yytext = this.matched = this.match = '';
                        this.conditionStack = ['INITIAL'];
                        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
                        if (this.options.ranges) this.yylloc.range = [0,0];
                        this.offset = 0;
                        return this;
                    },
                    input:function () {
                        var ch = this._input[0];
                        this.yytext += ch;
                        this.yyleng++;
                        this.offset++;
                        this.match += ch;
                        this.matched += ch;
                        var lines = ch.match(/(?:\r\n?|\n).*/g);
                        if (lines) {
                            this.yylineno++;
                            this.yylloc.last_line++;
                        } else {
                            this.yylloc.last_column++;
                        }
                        if (this.options.ranges) this.yylloc.range[1]++;

                        this._input = this._input.slice(1);
                        return ch;
                    },
                    unput:function (ch) {
                        var len = ch.length;
                        var lines = ch.split(/(?:\r\n?|\n)/g);

                        this._input = ch + this._input;
                        this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
                        //this.yyleng -= len;
                        this.offset -= len;
                        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
                        this.match = this.match.substr(0, this.match.length-1);
                        this.matched = this.matched.substr(0, this.matched.length-1);

                        if (lines.length-1) this.yylineno -= lines.length-1;
                        var r = this.yylloc.range;

                        this.yylloc = {first_line: this.yylloc.first_line,
                            last_line: this.yylineno+1,
                            first_column: this.yylloc.first_column,
                            last_column: lines ?
                            (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
                            this.yylloc.first_column - len
                        };

                        if (this.options.ranges) {
                            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
                        }
                        return this;
                    },
                    more:function () {
                        this._more = true;
                        return this;
                    },
                    less:function (n) {
                        this.unput(this.match.slice(n));
                    },
                    pastInput:function () {
                        var past = this.matched.substr(0, this.matched.length - this.match.length);
                        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
                    },
                    upcomingInput:function () {
                        var next = this.match;
                        if (next.length < 20) {
                            next += this._input.substr(0, 20-next.length);
                        }
                        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
                    },
                    showPosition:function () {
                        var pre = this.pastInput();
                        var c = new Array(pre.length + 1).join("-");
                        return pre + this.upcomingInput() + "\n" + c+"^";
                    },
                    next:function () {
                        if (this.done) {
                            return this.EOF;
                        }
                        if (!this._input) this.done = true;

                        var token,
                            match,
                            tempMatch,
                            index,
                            col,
                            lines;
                        if (!this._more) {
                            this.yytext = '';
                            this.match = '';
                        }
                        var rules = this._currentRules();
                        for (var i=0;i < rules.length; i++) {
                            tempMatch = this._input.match(this.rules[rules[i]]);
                            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                                match = tempMatch;
                                index = i;
                                if (!this.options.flex) break;
                            }
                        }
                        if (match) {
                            lines = match[0].match(/(?:\r\n?|\n).*/g);
                            if (lines) this.yylineno += lines.length;
                            this.yylloc = {first_line: this.yylloc.last_line,
                                last_line: this.yylineno+1,
                                first_column: this.yylloc.last_column,
                                last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
                            this.yytext += match[0];
                            this.match += match[0];
                            this.matches = match;
                            this.yyleng = this.yytext.length;
                            if (this.options.ranges) {
                                this.yylloc.range = [this.offset, this.offset += this.yyleng];
                            }
                            this._more = false;
                            this._input = this._input.slice(match[0].length);
                            this.matched += match[0];
                            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
                            if (this.done && this._input) this.done = false;
                            if (token) return token;
                            else return;
                        }
                        if (this._input === "") {
                            return this.EOF;
                        } else {
                            return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                                {text: "", token: null, line: this.yylineno});
                        }
                    },
                    lex:function lex() {
                        var r = this.next();
                        if (typeof r !== 'undefined') {
                            return r;
                        } else {
                            return this.lex();
                        }
                    },
                    begin:function begin(condition) {
                        this.conditionStack.push(condition);
                    },
                    popState:function popState() {
                        return this.conditionStack.pop();
                    },
                    _currentRules:function _currentRules() {
                        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
                    },
                    topState:function () {
                        return this.conditionStack[this.conditionStack.length-2];
                    },
                    pushState:function begin(condition) {
                        this.begin(condition);
                    }});
                lexer.options = {};
                lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {


                    function strip(start, end) {
                        return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng-end);
                    }


                    var YYSTATE=YY_START
                    switch($avoiding_name_collisions) {
                        case 0:
                            if(yy_.yytext.slice(-2) === "\\\\") {
                                strip(0,1);
                                this.begin("mu");
                            } else if(yy_.yytext.slice(-1) === "\\") {
                                strip(0,1);
                                this.begin("emu");
                            } else {
                                this.begin("mu");
                            }
                            if(yy_.yytext) return 14;

                            break;
                        case 1:return 14;
                            break;
                        case 2:
                            this.popState();
                            return 14;

                            break;
                        case 3:strip(0,4); this.popState(); return 15;
                            break;
                        case 4:return 35;
                            break;
                        case 5:return 36;
                            break;
                        case 6:return 25;
                            break;
                        case 7:return 16;
                            break;
                        case 8:return 20;
                            break;
                        case 9:return 19;
                            break;
                        case 10:return 19;
                            break;
                        case 11:return 23;
                            break;
                        case 12:return 22;
                            break;
                        case 13:this.popState(); this.begin('com');
                            break;
                        case 14:strip(3,5); this.popState(); return 15;
                            break;
                        case 15:return 22;
                            break;
                        case 16:return 41;
                            break;
                        case 17:return 40;
                            break;
                        case 18:return 40;
                            break;
                        case 19:return 44;
                            break;
                        case 20:// ignore whitespace
                            break;
                        case 21:this.popState(); return 24;
                            break;
                        case 22:this.popState(); return 18;
                            break;
                        case 23:yy_.yytext = strip(1,2).replace(/\\"/g,'"'); return 32;
                            break;
                        case 24:yy_.yytext = strip(1,2).replace(/\\'/g,"'"); return 32;
                            break;
                        case 25:return 42;
                            break;
                        case 26:return 34;
                            break;
                        case 27:return 34;
                            break;
                        case 28:return 33;
                            break;
                        case 29:return 40;
                            break;
                        case 30:yy_.yytext = strip(1,2); return 40;
                            break;
                        case 31:return 'INVALID';
                            break;
                        case 32:return 5;
                            break;
                    }
                };
                lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{(~)?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:-?[0-9]+(?=([~}\s)])))/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)]))))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:$)/];
                lexer.conditions = {"mu":{"rules":[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],"inclusive":false},"emu":{"rules":[2],"inclusive":false},"com":{"rules":[3],"inclusive":false},"INITIAL":{"rules":[0,1,32],"inclusive":true}};
                return lexer;})()
            parser.lexer = lexer;
            function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
            return new Parser;
        })();__exports__ = handlebars;
        /* jshint ignore:end */
        return __exports__;
    })();

// handlebars/compiler/base.js
    var __module8__ = (function(__dependency1__, __dependency2__) {
        "use strict";
        var __exports__ = {};
        var parser = __dependency1__;
        var AST = __dependency2__;

        __exports__.parser = parser;

        function parse(input) {
            // Just return if an already-compile AST was passed in.
            if(input.constructor === AST.ProgramNode) { return input; }

            parser.yy = AST;
            return parser.parse(input);
        }

        __exports__.parse = parse;
        return __exports__;
    })(__module9__, __module7__);

// handlebars/compiler/compiler.js
    var __module10__ = (function(__dependency1__) {
        "use strict";
        var __exports__ = {};
        var Exception = __dependency1__;

        function Compiler() {}

        __exports__.Compiler = Compiler;// the foundHelper register will disambiguate helper lookup from finding a
        // function in a context. This is necessary for mustache compatibility, which
        // requires that context functions in blocks are evaluated by blockHelperMissing,
        // and then proceed as if the resulting value was provided to blockHelperMissing.

        Compiler.prototype = {
            compiler: Compiler,

            disassemble: function() {
                var opcodes = this.opcodes, opcode, out = [], params, param;

                for (var i=0, l=opcodes.length; i<l; i++) {
                    opcode = opcodes[i];

                    if (opcode.opcode === 'DECLARE') {
                        out.push("DECLARE " + opcode.name + "=" + opcode.value);
                    } else {
                        params = [];
                        for (var j=0; j<opcode.args.length; j++) {
                            param = opcode.args[j];
                            if (typeof param === "string") {
                                param = "\"" + param.replace("\n", "\\n") + "\"";
                            }
                            params.push(param);
                        }
                        out.push(opcode.opcode + " " + params.join(" "));
                    }
                }

                return out.join("\n");
            },

            equals: function(other) {
                var len = this.opcodes.length;
                if (other.opcodes.length !== len) {
                    return false;
                }

                for (var i = 0; i < len; i++) {
                    var opcode = this.opcodes[i],
                        otherOpcode = other.opcodes[i];
                    if (opcode.opcode !== otherOpcode.opcode || opcode.args.length !== otherOpcode.args.length) {
                        return false;
                    }
                    for (var j = 0; j < opcode.args.length; j++) {
                        if (opcode.args[j] !== otherOpcode.args[j]) {
                            return false;
                        }
                    }
                }

                len = this.children.length;
                if (other.children.length !== len) {
                    return false;
                }
                for (i = 0; i < len; i++) {
                    if (!this.children[i].equals(other.children[i])) {
                        return false;
                    }
                }

                return true;
            },

            guid: 0,

            compile: function(program, options) {
                this.opcodes = [];
                this.children = [];
                this.depths = {list: []};
                this.options = options;

                // These changes will propagate to the other compiler components
                var knownHelpers = this.options.knownHelpers;
                this.options.knownHelpers = {
                    'helperMissing': true,
                    'blockHelperMissing': true,
                    'each': true,
                    'if': true,
                    'unless': true,
                    'with': true,
                    'log': true
                };
                if (knownHelpers) {
                    for (var name in knownHelpers) {
                        this.options.knownHelpers[name] = knownHelpers[name];
                    }
                }

                return this.accept(program);
            },

            accept: function(node) {
                var strip = node.strip || {},
                    ret;
                if (strip.left) {
                    this.opcode('strip');
                }

                ret = this[node.type](node);

                if (strip.right) {
                    this.opcode('strip');
                }

                return ret;
            },

            program: function(program) {
                var statements = program.statements;

                for(var i=0, l=statements.length; i<l; i++) {
                    this.accept(statements[i]);
                }
                this.isSimple = l === 1;

                this.depths.list = this.depths.list.sort(function(a, b) {
                    return a - b;
                });

                return this;
            },

            compileProgram: function(program) {
                var result = new this.compiler().compile(program, this.options);
                var guid = this.guid++, depth;

                this.usePartial = this.usePartial || result.usePartial;

                this.children[guid] = result;

                for(var i=0, l=result.depths.list.length; i<l; i++) {
                    depth = result.depths.list[i];

                    if(depth < 2) { continue; }
                    else { this.addDepth(depth - 1); }
                }

                return guid;
            },

            block: function(block) {
                var mustache = block.mustache,
                    program = block.program,
                    inverse = block.inverse;

                if (program) {
                    program = this.compileProgram(program);
                }

                if (inverse) {
                    inverse = this.compileProgram(inverse);
                }

                var sexpr = mustache.sexpr;
                var type = this.classifySexpr(sexpr);

                if (type === "helper") {
                    this.helperSexpr(sexpr, program, inverse);
                } else if (type === "simple") {
                    this.simpleSexpr(sexpr);

                    // now that the simple mustache is resolved, we need to
                    // evaluate it by executing `blockHelperMissing`
                    this.opcode('pushProgram', program);
                    this.opcode('pushProgram', inverse);
                    this.opcode('emptyHash');
                    this.opcode('blockValue');
                } else {
                    this.ambiguousSexpr(sexpr, program, inverse);

                    // now that the simple mustache is resolved, we need to
                    // evaluate it by executing `blockHelperMissing`
                    this.opcode('pushProgram', program);
                    this.opcode('pushProgram', inverse);
                    this.opcode('emptyHash');
                    this.opcode('ambiguousBlockValue');
                }

                this.opcode('append');
            },

            hash: function(hash) {
                var pairs = hash.pairs, pair, val;

                this.opcode('pushHash');

                for(var i=0, l=pairs.length; i<l; i++) {
                    pair = pairs[i];
                    val  = pair[1];

                    if (this.options.stringParams) {
                        if(val.depth) {
                            this.addDepth(val.depth);
                        }
                        this.opcode('getContext', val.depth || 0);
                        this.opcode('pushStringParam', val.stringModeValue, val.type);

                        if (val.type === 'sexpr') {
                            // Subexpressions get evaluated and passed in
                            // in string params mode.
                            this.sexpr(val);
                        }
                    } else {
                        this.accept(val);
                    }

                    this.opcode('assignToHash', pair[0]);
                }
                this.opcode('popHash');
            },

            partial: function(partial) {
                var partialName = partial.partialName;
                this.usePartial = true;

                if(partial.context) {
                    this.ID(partial.context);
                } else {
                    this.opcode('push', 'depth0');
                }

                this.opcode('invokePartial', partialName.name);
                this.opcode('append');
            },

            content: function(content) {
                this.opcode('appendContent', content.string);
            },

            mustache: function(mustache) {
                this.sexpr(mustache.sexpr);

                if(mustache.escaped && !this.options.noEscape) {
                    this.opcode('appendEscaped');
                } else {
                    this.opcode('append');
                }
            },

            ambiguousSexpr: function(sexpr, program, inverse) {
                var id = sexpr.id,
                    name = id.parts[0],
                    isBlock = program != null || inverse != null;

                this.opcode('getContext', id.depth);

                this.opcode('pushProgram', program);
                this.opcode('pushProgram', inverse);

                this.opcode('invokeAmbiguous', name, isBlock);
            },

            simpleSexpr: function(sexpr) {
                var id = sexpr.id;

                if (id.type === 'DATA') {
                    this.DATA(id);
                } else if (id.parts.length) {
                    this.ID(id);
                } else {
                    // Simplified ID for `this`
                    this.addDepth(id.depth);
                    this.opcode('getContext', id.depth);
                    this.opcode('pushContext');
                }

                this.opcode('resolvePossibleLambda');
            },

            helperSexpr: function(sexpr, program, inverse) {
                var params = this.setupFullMustacheParams(sexpr, program, inverse),
                    name = sexpr.id.parts[0];

                if (this.options.knownHelpers[name]) {
                    this.opcode('invokeKnownHelper', params.length, name);
                } else if (this.options.knownHelpersOnly) {
                    throw new Exception("You specified knownHelpersOnly, but used the unknown helper " + name, sexpr);
                } else {
                    this.opcode('invokeHelper', params.length, name, sexpr.isRoot);
                }
            },

            sexpr: function(sexpr) {
                var type = this.classifySexpr(sexpr);

                if (type === "simple") {
                    this.simpleSexpr(sexpr);
                } else if (type === "helper") {
                    this.helperSexpr(sexpr);
                } else {
                    this.ambiguousSexpr(sexpr);
                }
            },

            ID: function(id) {
                this.addDepth(id.depth);
                this.opcode('getContext', id.depth);

                var name = id.parts[0];
                if (!name) {
                    this.opcode('pushContext');
                } else {
                    this.opcode('lookupOnContext', id.parts[0]);
                }

                for(var i=1, l=id.parts.length; i<l; i++) {
                    this.opcode('lookup', id.parts[i]);
                }
            },

            DATA: function(data) {
                this.options.data = true;
                if (data.id.isScoped || data.id.depth) {
                    throw new Exception('Scoped data references are not supported: ' + data.original, data);
                }

                this.opcode('lookupData');
                var parts = data.id.parts;
                for(var i=0, l=parts.length; i<l; i++) {
                    this.opcode('lookup', parts[i]);
                }
            },

            STRING: function(string) {
                this.opcode('pushString', string.string);
            },

            INTEGER: function(integer) {
                this.opcode('pushLiteral', integer.integer);
            },

            BOOLEAN: function(bool) {
                this.opcode('pushLiteral', bool.bool);
            },

            comment: function() {},

            // HELPERS
            opcode: function(name) {
                this.opcodes.push({ opcode: name, args: [].slice.call(arguments, 1) });
            },

            declare: function(name, value) {
                this.opcodes.push({ opcode: 'DECLARE', name: name, value: value });
            },

            addDepth: function(depth) {
                if(depth === 0) { return; }

                if(!this.depths[depth]) {
                    this.depths[depth] = true;
                    this.depths.list.push(depth);
                }
            },

            classifySexpr: function(sexpr) {
                var isHelper   = sexpr.isHelper;
                var isEligible = sexpr.eligibleHelper;
                var options    = this.options;

                // if ambiguous, we can possibly resolve the ambiguity now
                if (isEligible && !isHelper) {
                    var name = sexpr.id.parts[0];

                    if (options.knownHelpers[name]) {
                        isHelper = true;
                    } else if (options.knownHelpersOnly) {
                        isEligible = false;
                    }
                }

                if (isHelper) { return "helper"; }
                else if (isEligible) { return "ambiguous"; }
                else { return "simple"; }
            },

            pushParams: function(params) {
                var i = params.length, param;

                while(i--) {
                    param = params[i];

                    if(this.options.stringParams) {
                        if(param.depth) {
                            this.addDepth(param.depth);
                        }

                        this.opcode('getContext', param.depth || 0);
                        this.opcode('pushStringParam', param.stringModeValue, param.type);

                        if (param.type === 'sexpr') {
                            // Subexpressions get evaluated and passed in
                            // in string params mode.
                            this.sexpr(param);
                        }
                    } else {
                        this[param.type](param);
                    }
                }
            },

            setupFullMustacheParams: function(sexpr, program, inverse) {
                var params = sexpr.params;
                this.pushParams(params);

                this.opcode('pushProgram', program);
                this.opcode('pushProgram', inverse);

                if (sexpr.hash) {
                    this.hash(sexpr.hash);
                } else {
                    this.opcode('emptyHash');
                }

                return params;
            }
        };

        function precompile(input, options, env) {
            if (input == null || (typeof input !== 'string' && input.constructor !== env.AST.ProgramNode)) {
                throw new Exception("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
            }

            options = options || {};
            if (!('data' in options)) {
                options.data = true;
            }

            var ast = env.parse(input);
            var environment = new env.Compiler().compile(ast, options);
            return new env.JavaScriptCompiler().compile(environment, options);
        }

        __exports__.precompile = precompile;function compile(input, options, env) {
            if (input == null || (typeof input !== 'string' && input.constructor !== env.AST.ProgramNode)) {
                throw new Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
            }

            options = options || {};

            if (!('data' in options)) {
                options.data = true;
            }

            var compiled;

            function compileInput() {
                var ast = env.parse(input);
                var environment = new env.Compiler().compile(ast, options);
                var templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
                return env.template(templateSpec);
            }

            // Template is only compiled on first use and cached after that point.
            return function(context, options) {
                if (!compiled) {
                    compiled = compileInput();
                }
                return compiled.call(this, context, options);
            };
        }

        __exports__.compile = compile;
        return __exports__;
    })(__module5__);

// handlebars/compiler/javascript-compiler.js
    var __module11__ = (function(__dependency1__, __dependency2__) {
        "use strict";
        var __exports__;
        var COMPILER_REVISION = __dependency1__.COMPILER_REVISION;
        var REVISION_CHANGES = __dependency1__.REVISION_CHANGES;
        var log = __dependency1__.log;
        var Exception = __dependency2__;

        function Literal(value) {
            this.value = value;
        }

        function JavaScriptCompiler() {}

        JavaScriptCompiler.prototype = {
            // PUBLIC API: You can override these methods in a subclass to provide
            // alternative compiled forms for name lookup and buffering semantics
            nameLookup: function(parent, name /* , type*/) {
                var wrap,
                    ret;
                if (parent.indexOf('depth') === 0) {
                    wrap = true;
                }

                if (/^[0-9]+$/.test(name)) {
                    ret = parent + "[" + name + "]";
                } else if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
                    ret = parent + "." + name;
                }
                else {
                    ret = parent + "['" + name + "']";
                }

                if (wrap) {
                    return '(' + parent + ' && ' + ret + ')';
                } else {
                    return ret;
                }
            },

            compilerInfo: function() {
                var revision = COMPILER_REVISION,
                    versions = REVISION_CHANGES[revision];
                return "this.compilerInfo = ["+revision+",'"+versions+"'];\n";
            },

            appendToBuffer: function(string) {
                if (this.environment.isSimple) {
                    return "return " + string + ";";
                } else {
                    return {
                        appendToBuffer: true,
                        content: string,
                        toString: function() { return "buffer += " + string + ";"; }
                    };
                }
            },

            initializeBuffer: function() {
                return this.quotedString("");
            },

            namespace: "Handlebars",
            // END PUBLIC API

            compile: function(environment, options, context, asObject) {
                this.environment = environment;
                this.options = options || {};

                log('debug', this.environment.disassemble() + "\n\n");

                this.name = this.environment.name;
                this.isChild = !!context;
                this.context = context || {
                    programs: [],
                    environments: [],
                    aliases: { }
                };

                this.preamble();

                this.stackSlot = 0;
                this.stackVars = [];
                this.registers = { list: [] };
                this.hashes = [];
                this.compileStack = [];
                this.inlineStack = [];

                this.compileChildren(environment, options);

                var opcodes = environment.opcodes, opcode;

                this.i = 0;

                for(var l=opcodes.length; this.i<l; this.i++) {
                    opcode = opcodes[this.i];

                    if(opcode.opcode === 'DECLARE') {
                        this[opcode.name] = opcode.value;
                    } else {
                        this[opcode.opcode].apply(this, opcode.args);
                    }

                    // Reset the stripNext flag if it was not set by this operation.
                    if (opcode.opcode !== this.stripNext) {
                        this.stripNext = false;
                    }
                }

                // Flush any trailing content that might be pending.
                this.pushSource('');

                if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
                    throw new Exception('Compile completed with content left on stack');
                }

                return this.createFunctionContext(asObject);
            },

            preamble: function() {
                var out = [];

                if (!this.isChild) {
                    var namespace = this.namespace;

                    var copies = "helpers = this.merge(helpers, " + namespace + ".helpers);";
                    if (this.environment.usePartial) { copies = copies + " partials = this.merge(partials, " + namespace + ".partials);"; }
                    if (this.options.data) { copies = copies + " data = data || {};"; }
                    out.push(copies);
                } else {
                    out.push('');
                }

                if (!this.environment.isSimple) {
                    out.push(", buffer = " + this.initializeBuffer());
                } else {
                    out.push("");
                }

                // track the last context pushed into place to allow skipping the
                // getContext opcode when it would be a noop
                this.lastContext = 0;
                this.source = out;
            },

            createFunctionContext: function(asObject) {
                var locals = this.stackVars.concat(this.registers.list);

                if(locals.length > 0) {
                    this.source[1] = this.source[1] + ", " + locals.join(", ");
                }

                // Generate minimizer alias mappings
                if (!this.isChild) {
                    for (var alias in this.context.aliases) {
                        if (this.context.aliases.hasOwnProperty(alias)) {
                            this.source[1] = this.source[1] + ', ' + alias + '=' + this.context.aliases[alias];
                        }
                    }
                }

                if (this.source[1]) {
                    this.source[1] = "var " + this.source[1].substring(2) + ";";
                }

                // Merge children
                if (!this.isChild) {
                    this.source[1] += '\n' + this.context.programs.join('\n') + '\n';
                }

                if (!this.environment.isSimple) {
                    this.pushSource("return buffer;");
                }

                var params = this.isChild ? ["depth0", "data"] : ["Handlebars", "depth0", "helpers", "partials", "data"];

                for(var i=0, l=this.environment.depths.list.length; i<l; i++) {
                    params.push("depth" + this.environment.depths.list[i]);
                }

                // Perform a second pass over the output to merge content when possible
                var source = this.mergeSource();

                if (!this.isChild) {
                    source = this.compilerInfo()+source;
                }

                if (asObject) {
                    params.push(source);

                    return Function.apply(this, params);
                } else {
                    var functionSource = 'function ' + (this.name || '') + '(' + params.join(',') + ') {\n  ' + source + '}';
                    log('debug', functionSource + "\n\n");
                    return functionSource;
                }
            },
            mergeSource: function() {
                // WARN: We are not handling the case where buffer is still populated as the source should
                // not have buffer append operations as their final action.
                var source = '',
                    buffer;
                for (var i = 0, len = this.source.length; i < len; i++) {
                    var line = this.source[i];
                    if (line.appendToBuffer) {
                        if (buffer) {
                            buffer = buffer + '\n    + ' + line.content;
                        } else {
                            buffer = line.content;
                        }
                    } else {
                        if (buffer) {
                            source += 'buffer += ' + buffer + ';\n  ';
                            buffer = undefined;
                        }
                        source += line + '\n  ';
                    }
                }
                return source;
            },

            // [blockValue]
            //
            // On stack, before: hash, inverse, program, value
            // On stack, after: return value of blockHelperMissing
            //
            // The purpose of this opcode is to take a block of the form
            // `{{#foo}}...{{/foo}}`, resolve the value of `foo`, and
            // replace it on the stack with the result of properly
            // invoking blockHelperMissing.
            blockValue: function() {
                this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

                var params = ["depth0"];
                this.setupParams(0, params);

                this.replaceStack(function(current) {
                    params.splice(1, 0, current);
                    return "blockHelperMissing.call(" + params.join(", ") + ")";
                });
            },

            // [ambiguousBlockValue]
            //
            // On stack, before: hash, inverse, program, value
            // Compiler value, before: lastHelper=value of last found helper, if any
            // On stack, after, if no lastHelper: same as [blockValue]
            // On stack, after, if lastHelper: value
            ambiguousBlockValue: function() {
                this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

                var params = ["depth0"];
                this.setupParams(0, params);

                var current = this.topStack();
                params.splice(1, 0, current);

                this.pushSource("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
            },

            // [appendContent]
            //
            // On stack, before: ...
            // On stack, after: ...
            //
            // Appends the string value of `content` to the current buffer
            appendContent: function(content) {
                if (this.pendingContent) {
                    content = this.pendingContent + content;
                }
                if (this.stripNext) {
                    content = content.replace(/^\s+/, '');
                }

                this.pendingContent = content;
            },

            // [strip]
            //
            // On stack, before: ...
            // On stack, after: ...
            //
            // Removes any trailing whitespace from the prior content node and flags
            // the next operation for stripping if it is a content node.
            strip: function() {
                if (this.pendingContent) {
                    this.pendingContent = this.pendingContent.replace(/\s+$/, '');
                }
                this.stripNext = 'strip';
            },

            // [append]
            //
            // On stack, before: value, ...
            // On stack, after: ...
            //
            // Coerces `value` to a String and appends it to the current buffer.
            //
            // If `value` is truthy, or 0, it is coerced into a string and appended
            // Otherwise, the empty string is appended
            append: function() {
                // Force anything that is inlined onto the stack so we don't have duplication
                // when we examine local
                this.flushInline();
                var local = this.popStack();
                this.pushSource("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }");
                if (this.environment.isSimple) {
                    this.pushSource("else { " + this.appendToBuffer("''") + " }");
                }
            },

            // [appendEscaped]
            //
            // On stack, before: value, ...
            // On stack, after: ...
            //
            // Escape `value` and append it to the buffer
            appendEscaped: function() {
                this.context.aliases.escapeExpression = 'this.escapeExpression';

                this.pushSource(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
            },

            // [getContext]
            //
            // On stack, before: ...
            // On stack, after: ...
            // Compiler value, after: lastContext=depth
            //
            // Set the value of the `lastContext` compiler value to the depth
            getContext: function(depth) {
                if(this.lastContext !== depth) {
                    this.lastContext = depth;
                }
            },

            // [lookupOnContext]
            //
            // On stack, before: ...
            // On stack, after: currentContext[name], ...
            //
            // Looks up the value of `name` on the current context and pushes
            // it onto the stack.
            lookupOnContext: function(name) {
                this.push(this.nameLookup('depth' + this.lastContext, name, 'context'));
            },

            // [pushContext]
            //
            // On stack, before: ...
            // On stack, after: currentContext, ...
            //
            // Pushes the value of the current context onto the stack.
            pushContext: function() {
                this.pushStackLiteral('depth' + this.lastContext);
            },

            // [resolvePossibleLambda]
            //
            // On stack, before: value, ...
            // On stack, after: resolved value, ...
            //
            // If the `value` is a lambda, replace it on the stack by
            // the return value of the lambda
            resolvePossibleLambda: function() {
                this.context.aliases.functionType = '"function"';

                this.replaceStack(function(current) {
                    return "typeof " + current + " === functionType ? " + current + ".apply(depth0) : " + current;
                });
            },

            // [lookup]
            //
            // On stack, before: value, ...
            // On stack, after: value[name], ...
            //
            // Replace the value on the stack with the result of looking
            // up `name` on `value`
            lookup: function(name) {
                this.replaceStack(function(current) {
                    return current + " == null || " + current + " === false ? " + current + " : " + this.nameLookup(current, name, 'context');
                });
            },

            // [lookupData]
            //
            // On stack, before: ...
            // On stack, after: data, ...
            //
            // Push the data lookup operator
            lookupData: function() {
                this.pushStackLiteral('data');
            },

            // [pushStringParam]
            //
            // On stack, before: ...
            // On stack, after: string, currentContext, ...
            //
            // This opcode is designed for use in string mode, which
            // provides the string value of a parameter along with its
            // depth rather than resolving it immediately.
            pushStringParam: function(string, type) {
                this.pushStackLiteral('depth' + this.lastContext);

                this.pushString(type);

                // If it's a subexpression, the string result
                // will be pushed after this opcode.
                if (type !== 'sexpr') {
                    if (typeof string === 'string') {
                        this.pushString(string);
                    } else {
                        this.pushStackLiteral(string);
                    }
                }
            },

            emptyHash: function() {
                this.pushStackLiteral('{}');

                if (this.options.stringParams) {
                    this.push('{}'); // hashContexts
                    this.push('{}'); // hashTypes
                }
            },
            pushHash: function() {
                if (this.hash) {
                    this.hashes.push(this.hash);
                }
                this.hash = {values: [], types: [], contexts: []};
            },
            popHash: function() {
                var hash = this.hash;
                this.hash = this.hashes.pop();

                if (this.options.stringParams) {
                    this.push('{' + hash.contexts.join(',') + '}');
                    this.push('{' + hash.types.join(',') + '}');
                }

                this.push('{\n    ' + hash.values.join(',\n    ') + '\n  }');
            },

            // [pushString]
            //
            // On stack, before: ...
            // On stack, after: quotedString(string), ...
            //
            // Push a quoted version of `string` onto the stack
            pushString: function(string) {
                this.pushStackLiteral(this.quotedString(string));
            },

            // [push]
            //
            // On stack, before: ...
            // On stack, after: expr, ...
            //
            // Push an expression onto the stack
            push: function(expr) {
                this.inlineStack.push(expr);
                return expr;
            },

            // [pushLiteral]
            //
            // On stack, before: ...
            // On stack, after: value, ...
            //
            // Pushes a value onto the stack. This operation prevents
            // the compiler from creating a temporary variable to hold
            // it.
            pushLiteral: function(value) {
                this.pushStackLiteral(value);
            },

            // [pushProgram]
            //
            // On stack, before: ...
            // On stack, after: program(guid), ...
            //
            // Push a program expression onto the stack. This takes
            // a compile-time guid and converts it into a runtime-accessible
            // expression.
            pushProgram: function(guid) {
                if (guid != null) {
                    this.pushStackLiteral(this.programExpression(guid));
                } else {
                    this.pushStackLiteral(null);
                }
            },

            // [invokeHelper]
            //
            // On stack, before: hash, inverse, program, params..., ...
            // On stack, after: result of helper invocation
            //
            // Pops off the helper's parameters, invokes the helper,
            // and pushes the helper's return value onto the stack.
            //
            // If the helper is not found, `helperMissing` is called.
            invokeHelper: function(paramSize, name, isRoot) {
                this.context.aliases.helperMissing = 'helpers.helperMissing';
                this.useRegister('helper');

                var helper = this.lastHelper = this.setupHelper(paramSize, name, true);
                var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');

                var lookup = 'helper = ' + helper.name + ' || ' + nonHelper;
                if (helper.paramsInit) {
                    lookup += ',' + helper.paramsInit;
                }

                this.push(
                    '('
                    + lookup
                    + ',helper '
                    + '? helper.call(' + helper.callParams + ') '
                    + ': helperMissing.call(' + helper.helperMissingParams + '))');

                // Always flush subexpressions. This is both to prevent the compounding size issue that
                // occurs when the code has to be duplicated for inlining and also to prevent errors
                // due to the incorrect options object being passed due to the shared register.
                if (!isRoot) {
                    this.flushInline();
                }
            },

            // [invokeKnownHelper]
            //
            // On stack, before: hash, inverse, program, params..., ...
            // On stack, after: result of helper invocation
            //
            // This operation is used when the helper is known to exist,
            // so a `helperMissing` fallback is not required.
            invokeKnownHelper: function(paramSize, name) {
                var helper = this.setupHelper(paramSize, name);
                this.push(helper.name + ".call(" + helper.callParams + ")");
            },

            // [invokeAmbiguous]
            //
            // On stack, before: hash, inverse, program, params..., ...
            // On stack, after: result of disambiguation
            //
            // This operation is used when an expression like `{{foo}}`
            // is provided, but we don't know at compile-time whether it
            // is a helper or a path.
            //
            // This operation emits more code than the other options,
            // and can be avoided by passing the `knownHelpers` and
            // `knownHelpersOnly` flags at compile-time.
            invokeAmbiguous: function(name, helperCall) {
                this.context.aliases.functionType = '"function"';
                this.useRegister('helper');

                this.emptyHash();
                var helper = this.setupHelper(0, name, helperCall);

                var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

                var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');
                var nextStack = this.nextStack();

                if (helper.paramsInit) {
                    this.pushSource(helper.paramsInit);
                }
                this.pushSource('if (helper = ' + helperName + ') { ' + nextStack + ' = helper.call(' + helper.callParams + '); }');
                this.pushSource('else { helper = ' + nonHelper + '; ' + nextStack + ' = typeof helper === functionType ? helper.call(' + helper.callParams + ') : helper; }');
            },

            // [invokePartial]
            //
            // On stack, before: context, ...
            // On stack after: result of partial invocation
            //
            // This operation pops off a context, invokes a partial with that context,
            // and pushes the result of the invocation back.
            invokePartial: function(name) {
                var params = [this.nameLookup('partials', name, 'partial'), "'" + name + "'", this.popStack(), "helpers", "partials"];

                if (this.options.data) {
                    params.push("data");
                }

                this.context.aliases.self = "this";
                this.push("self.invokePartial(" + params.join(", ") + ")");
            },

            // [assignToHash]
            //
            // On stack, before: value, hash, ...
            // On stack, after: hash, ...
            //
            // Pops a value and hash off the stack, assigns `hash[key] = value`
            // and pushes the hash back onto the stack.
            assignToHash: function(key) {
                var value = this.popStack(),
                    context,
                    type;

                if (this.options.stringParams) {
                    type = this.popStack();
                    context = this.popStack();
                }

                var hash = this.hash;
                if (context) {
                    hash.contexts.push("'" + key + "': " + context);
                }
                if (type) {
                    hash.types.push("'" + key + "': " + type);
                }
                hash.values.push("'" + key + "': (" + value + ")");
            },

            // HELPERS

            compiler: JavaScriptCompiler,

            compileChildren: function(environment, options) {
                var children = environment.children, child, compiler;

                for(var i=0, l=children.length; i<l; i++) {
                    child = children[i];
                    compiler = new this.compiler();

                    var index = this.matchExistingProgram(child);

                    if (index == null) {
                        this.context.programs.push('');     // Placeholder to prevent name conflicts for nested children
                        index = this.context.programs.length;
                        child.index = index;
                        child.name = 'program' + index;
                        this.context.programs[index] = compiler.compile(child, options, this.context);
                        this.context.environments[index] = child;
                    } else {
                        child.index = index;
                        child.name = 'program' + index;
                    }
                }
            },
            matchExistingProgram: function(child) {
                for (var i = 0, len = this.context.environments.length; i < len; i++) {
                    var environment = this.context.environments[i];
                    if (environment && environment.equals(child)) {
                        return i;
                    }
                }
            },

            programExpression: function(guid) {
                this.context.aliases.self = "this";

                if(guid == null) {
                    return "self.noop";
                }

                var child = this.environment.children[guid],
                    depths = child.depths.list, depth;

                var programParams = [child.index, child.name, "data"];

                for(var i=0, l = depths.length; i<l; i++) {
                    depth = depths[i];

                    if(depth === 1) { programParams.push("depth0"); }
                    else { programParams.push("depth" + (depth - 1)); }
                }

                return (depths.length === 0 ? "self.program(" : "self.programWithDepth(") + programParams.join(", ") + ")";
            },

            register: function(name, val) {
                this.useRegister(name);
                this.pushSource(name + " = " + val + ";");
            },

            useRegister: function(name) {
                if(!this.registers[name]) {
                    this.registers[name] = true;
                    this.registers.list.push(name);
                }
            },

            pushStackLiteral: function(item) {
                return this.push(new Literal(item));
            },

            pushSource: function(source) {
                if (this.pendingContent) {
                    this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent)));
                    this.pendingContent = undefined;
                }

                if (source) {
                    this.source.push(source);
                }
            },

            pushStack: function(item) {
                this.flushInline();

                var stack = this.incrStack();
                if (item) {
                    this.pushSource(stack + " = " + item + ";");
                }
                this.compileStack.push(stack);
                return stack;
            },

            replaceStack: function(callback) {
                var prefix = '',
                    inline = this.isInline(),
                    stack,
                    createdStack,
                    usedLiteral;

                // If we are currently inline then we want to merge the inline statement into the
                // replacement statement via ','
                if (inline) {
                    var top = this.popStack(true);

                    if (top instanceof Literal) {
                        // Literals do not need to be inlined
                        stack = top.value;
                        usedLiteral = true;
                    } else {
                        // Get or create the current stack name for use by the inline
                        createdStack = !this.stackSlot;
                        var name = !createdStack ? this.topStackName() : this.incrStack();

                        prefix = '(' + this.push(name) + ' = ' + top + '),';
                        stack = this.topStack();
                    }
                } else {
                    stack = this.topStack();
                }

                var item = callback.call(this, stack);

                if (inline) {
                    if (!usedLiteral) {
                        this.popStack();
                    }
                    if (createdStack) {
                        this.stackSlot--;
                    }
                    this.push('(' + prefix + item + ')');
                } else {
                    // Prevent modification of the context depth variable. Through replaceStack
                    if (!/^stack/.test(stack)) {
                        stack = this.nextStack();
                    }

                    this.pushSource(stack + " = (" + prefix + item + ");");
                }
                return stack;
            },

            nextStack: function() {
                return this.pushStack();
            },

            incrStack: function() {
                this.stackSlot++;
                if(this.stackSlot > this.stackVars.length) { this.stackVars.push("stack" + this.stackSlot); }
                return this.topStackName();
            },
            topStackName: function() {
                return "stack" + this.stackSlot;
            },
            flushInline: function() {
                var inlineStack = this.inlineStack;
                if (inlineStack.length) {
                    this.inlineStack = [];
                    for (var i = 0, len = inlineStack.length; i < len; i++) {
                        var entry = inlineStack[i];
                        if (entry instanceof Literal) {
                            this.compileStack.push(entry);
                        } else {
                            this.pushStack(entry);
                        }
                    }
                }
            },
            isInline: function() {
                return this.inlineStack.length;
            },

            popStack: function(wrapped) {
                var inline = this.isInline(),
                    item = (inline ? this.inlineStack : this.compileStack).pop();

                if (!wrapped && (item instanceof Literal)) {
                    return item.value;
                } else {
                    if (!inline) {
                        if (!this.stackSlot) {
                            throw new Exception('Invalid stack pop');
                        }
                        this.stackSlot--;
                    }
                    return item;
                }
            },

            topStack: function(wrapped) {
                var stack = (this.isInline() ? this.inlineStack : this.compileStack),
                    item = stack[stack.length - 1];

                if (!wrapped && (item instanceof Literal)) {
                    return item.value;
                } else {
                    return item;
                }
            },

            quotedString: function(str) {
                return '"' + str
                    .replace(/\\/g, '\\\\')
                    .replace(/"/g, '\\"')
                    .replace(/\n/g, '\\n')
                    .replace(/\r/g, '\\r')
                    .replace(/\u2028/g, '\\u2028')   // Per Ecma-262 7.3 + 7.8.4
                    .replace(/\u2029/g, '\\u2029') + '"';
            },

            setupHelper: function(paramSize, name, missingParams) {
                var params = [],
                    paramsInit = this.setupParams(paramSize, params, missingParams);
                var foundHelper = this.nameLookup('helpers', name, 'helper');

                return {
                    params: params,
                    paramsInit: paramsInit,
                    name: foundHelper,
                    callParams: ["depth0"].concat(params).join(", "),
                    helperMissingParams: missingParams && ["depth0", this.quotedString(name)].concat(params).join(", ")
                };
            },

            setupOptions: function(paramSize, params) {
                var options = [], contexts = [], types = [], param, inverse, program;

                options.push("hash:" + this.popStack());

                if (this.options.stringParams) {
                    options.push("hashTypes:" + this.popStack());
                    options.push("hashContexts:" + this.popStack());
                }

                inverse = this.popStack();
                program = this.popStack();

                // Avoid setting fn and inverse if neither are set. This allows
                // helpers to do a check for `if (options.fn)`
                if (program || inverse) {
                    if (!program) {
                        this.context.aliases.self = "this";
                        program = "self.noop";
                    }

                    if (!inverse) {
                        this.context.aliases.self = "this";
                        inverse = "self.noop";
                    }

                    options.push("inverse:" + inverse);
                    options.push("fn:" + program);
                }

                for(var i=0; i<paramSize; i++) {
                    param = this.popStack();
                    params.push(param);

                    if(this.options.stringParams) {
                        types.push(this.popStack());
                        contexts.push(this.popStack());
                    }
                }

                if (this.options.stringParams) {
                    options.push("contexts:[" + contexts.join(",") + "]");
                    options.push("types:[" + types.join(",") + "]");
                }

                if(this.options.data) {
                    options.push("data:data");
                }

                return options;
            },

            // the params and contexts arguments are passed in arrays
            // to fill in
            setupParams: function(paramSize, params, useRegister) {
                var options = '{' + this.setupOptions(paramSize, params).join(',') + '}';

                if (useRegister) {
                    this.useRegister('options');
                    params.push('options');
                    return 'options=' + options;
                } else {
                    params.push(options);
                    return '';
                }
            }
        };

        var reservedWords = (
        "break else new var" +
        " case finally return void" +
        " catch for switch while" +
        " continue function this with" +
        " default if throw" +
        " delete in try" +
        " do instanceof typeof" +
        " abstract enum int short" +
        " boolean export interface static" +
        " byte extends long super" +
        " char final native synchronized" +
        " class float package throws" +
        " const goto private transient" +
        " debugger implements protected volatile" +
        " double import public let yield"
        ).split(" ");

        var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

        for(var i=0, l=reservedWords.length; i<l; i++) {
            compilerWords[reservedWords[i]] = true;
        }

        JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
            if(!JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name)) {
                return true;
            }
            return false;
        };

        __exports__ = JavaScriptCompiler;
        return __exports__;
    })(__module2__, __module5__);

// handlebars.js
    var __module0__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
        "use strict";
        var __exports__;
        /*globals Handlebars: true */
        var Handlebars = __dependency1__;

        // Compiler imports
        var AST = __dependency2__;
        var Parser = __dependency3__.parser;
        var parse = __dependency3__.parse;
        var Compiler = __dependency4__.Compiler;
        var compile = __dependency4__.compile;
        var precompile = __dependency4__.precompile;
        var JavaScriptCompiler = __dependency5__;

        var _create = Handlebars.create;
        var create = function() {
            var hb = _create();

            hb.compile = function(input, options) {
                return compile(input, options, hb);
            };
            hb.precompile = function (input, options) {
                return precompile(input, options, hb);
            };

            hb.AST = AST;
            hb.Compiler = Compiler;
            hb.JavaScriptCompiler = JavaScriptCompiler;
            hb.Parser = Parser;
            hb.parse = parse;

            return hb;
        };

        Handlebars = create();
        Handlebars.create = create;

        __exports__ = Handlebars;
        return __exports__;
    })(__module1__, __module7__, __module8__, __module10__, __module11__);

    return __module0__;
})();
/*!
 * hoverIntent r7 // 2013.03.11 // jQuery 1.9.1+
 * http://cherne.net/brian/resources/jquery.hoverIntent.html
 *
 * You may use hoverIntent under the terms of the MIT license. Basically that
 * means you are free to use hoverIntent as long as this header is left intact.
 * Copyright 2007, 2013 Brian Cherne
 */

/* hoverIntent is similar to jQuery's built-in "hover" method except that
 * instead of firing the handlerIn function immediately, hoverIntent checks
 * to see if the user's mouse has slowed down (beneath the sensitivity
 * threshold) before firing the event. The handlerOut function is only
 * called after a matching handlerIn.
 *
 * // basic usage ... just like .hover()
 * .hoverIntent( handlerIn, handlerOut )
 * .hoverIntent( handlerInOut )
 *
 * // basic usage ... with event delegation!
 * .hoverIntent( handlerIn, handlerOut, selector )
 * .hoverIntent( handlerInOut, selector )
 *
 * // using a basic configuration object
 * .hoverIntent( config )
 *
 * @param  handlerIn   function OR configuration object
 * @param  handlerOut  function OR selector for delegation OR undefined
 * @param  selector    selector OR undefined
 * @author Brian Cherne <brian(at)cherne(dot)net>
 */
(function($) {
    $.fn.hoverIntent = function(handlerIn,handlerOut,selector) {

        // default configuration values
        var cfg = {
            interval: 100,
            sensitivity: 7,
            timeout: 0
        };

        if ( typeof handlerIn === "object" ) {
            cfg = $.extend(cfg, handlerIn );
        } else if ($.isFunction(handlerOut)) {
            cfg = $.extend(cfg, { over: handlerIn, out: handlerOut, selector: selector } );
        } else {
            cfg = $.extend(cfg, { over: handlerIn, out: handlerIn, selector: handlerOut } );
        }

        // instantiate variables
        // cX, cY = current X and Y position of mouse, updated by mousemove event
        // pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
        var cX, cY, pX, pY;

        // A private function for getting mouse position
        var track = function(ev) {
            cX = ev.pageX;
            cY = ev.pageY;
        };

        // A private function for comparing current and previous mouse position
        var compare = function(ev,ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            // compare mouse positions to see if they've crossed the threshold
            if ( ( Math.abs(pX-cX) + Math.abs(pY-cY) ) < cfg.sensitivity ) {
                $(ob).off("mousemove.hoverIntent",track);
                // set hoverIntent state to true (so mouseOut can be called)
                ob.hoverIntent_s = 1;
                return cfg.over.apply(ob,[ev]);
            } else {
                // set previous coordinates for next time
                pX = cX; pY = cY;
                // use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
                ob.hoverIntent_t = setTimeout( function(){compare(ev, ob);} , cfg.interval );
            }
        };

        // A private function for delaying the mouseOut function
        var delay = function(ev,ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            ob.hoverIntent_s = 0;
            return cfg.out.apply(ob,[ev]);
        };

        // A private function for handling mouse 'hovering'
        var handleHover = function(e) {
            // copy objects to be passed into t (required for event object to be passed in IE)
            var ev = jQuery.extend({},e);
            var ob = this;

            // cancel hoverIntent timer if it exists
            if (ob.hoverIntent_t) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); }

            // if e.type == "mouseenter"
            if (e.type == "mouseenter") {
                // set "previous" X and Y position based on initial entry point
                pX = ev.pageX; pY = ev.pageY;
                // update "current" X and Y position based on mousemove
                $(ob).on("mousemove.hoverIntent",track);
                // start polling interval (self-calling timeout) to compare mouse coordinates over time
                if (ob.hoverIntent_s != 1) { ob.hoverIntent_t = setTimeout( function(){compare(ev,ob);} , cfg.interval );}

                // else e.type == "mouseleave"
            } else {
                // unbind expensive mousemove event
                $(ob).off("mousemove.hoverIntent",track);
                // if hoverIntent state is true, then call the mouseOut function after the specified delay
                if (ob.hoverIntent_s == 1) { ob.hoverIntent_t = setTimeout( function(){delay(ev,ob);} , cfg.timeout );}
            }
        };

        // listen for mouseenter and mouseleave
        return this.on({'mouseenter.hoverIntent':handleHover,'mouseleave.hoverIntent':handleHover}, cfg.selector);
    };
})(jQuery);
// Ion.RangeSlider
// version 1.7.2
// https://github.com/IonDen/ion.rangeSlider
(function(c){var S=0,J=function(){var c=navigator.userAgent,a=/msie\s\d+/i;return 0<c.search(a)?(c=a.exec(c).toString(),c=c.split(" ")[1],9>c?!0:!1):!1}(),E;try{document.createEvent("TouchEvent"),E=!0}catch(da){E=!1}var I={init:function(m){var a=c.extend({min:10,max:100,from:null,to:null,type:"single",step:1,prefix:"",postfix:"",hasGrid:!1,hideText:!1,prettify:!0,onChange:null,onFinish:null},m),r='<span class="irs">',r=r+'<span class="irs-line"><span class="irs-line-left"></span><span class="irs-line-mid"></span><span class="irs-line-right"></span></span>',
r=r+'<span class="irs-min">0</span><span class="irs-max">1</span>',r=r+'<span class="irs-from">0</span><span class="irs-to">0</span><span class="irs-single">0</span>',r=r+"</span>",r=r+'<span class="irs-grid"></span>',F='<span class="irs-diapason"></span>',F=F+'<span class="irs-slider from"></span>',F=F+'<span class="irs-slider to"></span>';return this.each(function(){var e=c(this);if(!e.data("isActive")){e.data("isActive",!0);S++;this.pluginCount=S;"number"!==typeof a.from&&(a.from=a.min);"number"!==
typeof a.to&&(a.to=a.max);e.attr("value")&&(a.min=parseInt(e.attr("value").split(";")[0],10),a.max=parseInt(e.attr("value").split(";")[1],10));"number"===typeof e.data("from")&&(a.from=parseInt(e.data("from"),10));"number"===typeof e.data("to")&&(a.to=parseInt(e.data("to"),10));e.data("step")&&(a.step=parseFloat(e.data("step")));e.data("type")&&(a.type=e.data("type"));e.data("prefix")&&(a.prefix=e.data("prefix"));e.data("postfix")&&(a.postfix=e.data("postfix"));e.data("hasgrid")&&(a.hasGrid=e.data("hasgrid"));
e.data("hidetext")&&(a.hideText=e.data("hidetext"));e.data("prettify")&&(a.prettify=e.data("prettify"));a.from<a.min&&(a.from=a.min);a.to>a.max&&(a.to=a.max);"double"===a.type&&(a.from>a.to&&(a.from=a.to),a.to<a.from&&(a.to=a.from));var m=function(b){b=b.toString();a.prettify&&(b=b.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g,"$1 "));return b},I='<span class="irs" id="irs-'+this.pluginCount+'"></span>';e[0].style.display="none";e.before(I);var w=c("#irs-"+this.pluginCount),T=c(document.body),U=c(window),
f,B,C,x,y,t,z,n,s,u,P,V,q=!1,v=!1,W=!0,g={},Q=0,K=0,L=0,k=0,A=0,G=0,R=0,M=0,N=0,X=0,p=0;parseInt(a.step,10)!==parseFloat(a.step)&&(p=a.step.toString().split(".")[1],p=Math.pow(10,p.length));this.updateData=function(b){a=c.extend(a,b);w.find("*").off();w.html("");Y()};this.removeSlider=function(){w.find("*").off();w.html("").remove();e.data("isActive",!1);e.show()};var Y=function(){w.html(r);f=w.find(".irs");B=f.find(".irs-min");C=f.find(".irs-max");x=f.find(".irs-from");y=f.find(".irs-to");t=f.find(".irs-single");
V=w.find(".irs-grid");a.hideText?(B[0].style.display="none",C[0].style.display="none",x[0].style.display="none",y[0].style.display="none",t[0].style.display="none"):(B.html(a.prefix+m(a.min)+a.postfix),C.html(a.prefix+m(a.max)+a.postfix));K=B.outerWidth();L=C.outerWidth();if("single"===a.type){if(f.append('<span class="irs-slider single"></span>'),z=f.find(".single"),z.on("mousedown",function(a){a.preventDefault();a.stopPropagation();D(a,c(this),null);v=q=!0;J&&c("*").prop("unselectable",!0)}),E)z.on("touchstart",
function(a){a.preventDefault();a.stopPropagation();D(a.originalEvent.touches[0],c(this),null);v=q=!0})}else"double"===a.type&&(f.append(F),n=f.find(".from"),s=f.find(".to"),P=f.find(".irs-diapason"),H(),n.on("mousedown",function(a){a.preventDefault();a.stopPropagation();c(this).addClass("last");s.removeClass("last");D(a,c(this),"from");v=q=!0;J&&c("*").prop("unselectable",!0)}),s.on("mousedown",function(a){a.preventDefault();a.stopPropagation();c(this).addClass("last");n.removeClass("last");D(a,c(this),
"to");v=q=!0;J&&c("*").prop("unselectable",!0)}),E&&(n.on("touchstart",function(a){a.preventDefault();a.stopPropagation();c(this).addClass("last");s.removeClass("last");D(a.originalEvent.touches[0],c(this),"from");v=q=!0}),s.on("touchstart",function(a){a.preventDefault();a.stopPropagation();c(this).addClass("last");n.removeClass("last");D(a.originalEvent.touches[0],c(this),"to");v=q=!0})),a.to===a.max&&n.addClass("last"));T.on("mouseup",function(){q&&(q=v=!1,u.removeAttr("id"),u=null,"double"===a.type&&
H(),O(),J&&c("*").prop("unselectable",!1))});T.on("mousemove",function(a){q&&(Q=a.pageX,Z())});E&&(U.on("touchend",function(){q&&(q=v=!1,u.removeAttr("id"),u=null,"double"===a.type&&H(),O())}),U.on("touchmove",function(a){q&&(Q=a.originalEvent.touches[0].pageX,Z())}));$();ba();a.hasGrid&&ca()},$=function(){k=f.width();G=z?z.width():n.width();A=k-G},D=function(b,d,l){$();W=!1;u=d;u.attr("id","irs-active-slider");d=u.offset().left;X=d+(b.pageX-d)-u.position().left;"single"===a.type?R=f.width()-G:"double"===
a.type&&("from"===l?(M=0,N=parseInt(s.css("left"),10)):(M=parseInt(n.css("left"),10),N=f.width()-G))},H=function(){var a=n.width(),d=parseInt(n[0].style.left,10)||n.position().left,l=(parseInt(s[0].style.left,10)||s.position().left)-d;P[0].style.left=d+a/2+"px";P[0].style.width=l+"px"},Z=function(){var b=Math.round(Q-X);"single"===a.type?(0>b&&(b=0),b>R&&(b=R),O()):"double"===a.type&&(b<M&&(b=M),b>N&&(b=N),O(),H());u[0].style.left=b+"px"},O=function(){var b={fromNumber:0,toNumber:0,fromPers:0,toPers:0,
fromX:0,toX:0},d=a.max-a.min,l;"single"===a.type?(b.fromX=parseInt(z[0].style.left,10)||z.position().left,b.fromPers=100*(b.fromX/A),l=d/100*b.fromPers+parseInt(a.min,10),b.fromNumber=Math.round(l/a.step)*a.step,p&&(b.fromNumber=parseInt(b.fromNumber*p,10)/p)):"double"===a.type&&(b.fromX=parseInt(n[0].style.left,10)||n.position().left,b.fromPers=100*(b.fromX/A),l=d/100*b.fromPers+parseInt(a.min,10),b.fromNumber=Math.round(l/a.step)*a.step,b.toX=parseInt(s[0].style.left,10)||s.position().left,b.toPers=
100*(b.toX/A),d=d/100*b.toPers+parseInt(a.min,10),b.toNumber=Math.round(d/a.step)*a.step,p&&(b.fromNumber=parseInt(b.fromNumber*p,10)/p,b.toNumber=parseInt(b.toNumber*p,10)/p));g=b;aa()},ba=function(){var b={fromNumber:a.from,toNumber:a.to,fromPers:0,toPers:0,fromX:0,toX:0},d=a.max-a.min;"single"===a.type?(b.fromPers=100*((b.fromNumber-a.min)/d),b.fromX=Math.round(A/100*b.fromPers),z[0].style.left=b.fromX+"px"):"double"===a.type&&(b.fromPers=100*((b.fromNumber-a.min)/d),b.fromX=Math.round(A/100*b.fromPers),
n[0].style.left=b.fromX+"px",b.toPers=100*((b.toNumber-a.min)/d),b.toX=Math.round(A/100*b.toPers),s[0].style.left=b.toX+"px",H());g=b;aa()},aa=function(){var b,d,l,c,f,h;h=G/2;"single"===a.type?(a.hideText||(x[0].style.display="none",y[0].style.display="none",l=a.prefix+m(g.fromNumber)+a.postfix,t.html(l),f=t.outerWidth(),h=g.fromX-f/2+h,0>h&&(h=0),h>k-f&&(h=k-f),t[0].style.left=h+"px",B[0].style.display=h<K?"none":"block",C[0].style.display=h+f>k-L?"none":"block"),e.attr("value",parseInt(g.fromNumber,
10))):"double"===a.type&&(a.hideText||(b=a.prefix+m(g.fromNumber)+a.postfix,d=a.prefix+m(g.toNumber)+a.postfix,l=g.fromNumber!=g.toNumber?a.prefix+m(g.fromNumber)+" \u2014 "+a.prefix+m(g.toNumber)+a.postfix:a.prefix+m(g.fromNumber)+a.postfix,x.html(b),y.html(d),t.html(l),b=x.outerWidth(),d=g.fromX-b/2+h,0>d&&(d=0),d>k-b&&(d=k-b),x[0].style.left=d+"px",l=y.outerWidth(),c=g.toX-l/2+h,0>c&&(c=0),c>k-l&&(c=k-l),y[0].style.left=c+"px",f=t.outerWidth(),h=g.fromX+(g.toX-g.fromX)/2-f/2+h,0>h&&(h=0),h>k-f&&
(h=k-f),t[0].style.left=h+"px",d+b<c?(t[0].style.display="none",x[0].style.display="block",y[0].style.display="block"):(t[0].style.display="block",x[0].style.display="none",y[0].style.display="none"),B[0].style.display=h<K||d<K?"none":"block",C[0].style.display=h+f>k-L||c+l>k-L?"none":"block"),e.attr("value",parseInt(g.fromNumber,10)+";"+parseInt(g.toNumber,10)));"function"===typeof a.onChange&&a.onChange.call(this,g);"function"!==typeof a.onFinish||v||W||a.onFinish.call(this,g)},ca=function(){w.addClass("irs-with-grid");
var b,d="",c=0,c=0,e="";for(b=0;20>=b;b++)c=Math.floor(k/20*b),c>=k&&(c=k-1),e+='<span class="irs-grid-pol small" style="left: '+c+'px;"></span>';for(b=0;4>=b;b++)c=Math.floor(k/4*b),c>=k&&(c=k-1),e+='<span class="irs-grid-pol" style="left: '+c+'px;"></span>',p?(d=a.min+(a.max-a.min)/4*b,d=d/a.step*a.step,d=parseInt(d*p,10)/p):(d=Math.round(a.min+(a.max-a.min)/4*b),d=Math.round(d/a.step)*a.step,d=m(d)),0===b?e+='<span class="irs-grid-text" style="left: '+c+'px; text-align: left;">'+d+"</span>":4===
b?(c-=100,e+='<span class="irs-grid-text" style="left: '+c+'px; text-align: right;">'+d+"</span>"):(c-=50,e+='<span class="irs-grid-text" style="left: '+c+'px;">'+d+"</span>");V.html(e)};Y()}})},update:function(c){return this.each(function(){this.updateData(c)})},remove:function(){return this.each(function(){this.removeSlider()})}};c.fn.ionRangeSlider=function(m){if(I[m])return I[m].apply(this,Array.prototype.slice.call(arguments,1));if("object"!==typeof m&&m)c.error("Method "+m+" does not exist for jQuery.ionRangeSlider");
else return I.init.apply(this,arguments)}})(jQuery);
/**
 * @preserve jQuery DateTimePicker plugin v2.2.5
 * @homepage http://xdsoft.net/jqplugins/datetimepicker/
 * (c) 2014, Chupurnov Valeriy.
 */
(function( $ ) {
    'use strict'
    var default_options  = {
        i18n:{
            bg:{ // Bulgarian
                months:[
                    "Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
                ],
                dayOfWeek:[
                    "Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"
                ]
            },
            ru:{ // Russian
                months:[
                    'Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
                ],
                dayOfWeek:[
                    "Вск", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"
                ]
            },
            en:{ // English
                months: [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ],
                dayOfWeek: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
                ]
            },
            de:{ // German
                months:[
                    'Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'
                ],
                dayOfWeek:[
                    "So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"
                ]
            },
            nl:{ // Dutch
                months:[
                    "januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"
                ],
                dayOfWeek:[
                    "zo", "ma", "di", "wo", "do", "vr", "za"
                ]
            },
            tr:{ // Turkish
                months:[
                    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
                ],
                dayOfWeek:[
                    "Paz", "Pts", "Sal", "Çar", "Per", "Cum", "Cts"
                ]
            },
            fr:{ //French
                months:[
                    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
                ],
                dayOfWeek:[
                    "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"
                ]
            },
            es:{ // Spanish
                months: [
                    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ],
                dayOfWeek: [
                    "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"
                ]
            },
            th:{ // Thai
                months:[
                    'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
                ],
                dayOfWeek:[
                    'อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'
                ]
            },
            pl:{ // Polish
                months: [
                    "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"
                ],
                dayOfWeek: [
                    "nd", "pn", "wt", "śr", "cz", "pt", "sb"
                ]
            },
            pt:{ // Portuguese
                months: [
                    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                ],
                dayOfWeek: [
                    "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"
                ]
            },
            ch:{ // Simplified Chinese
                months: [
                    "一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"
                ],
                dayOfWeek: [
                    "日", "一","二","三","四","五","六"
                ]
            },
            se:{ // Swedish
                months: [
                    "Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September","Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"
                ]
            },
            kr:{ // Korean
                months: [
                    "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
                ],
                dayOfWeek: [
                    "일", "월", "화", "수", "목", "금", "토"
                ]
            },
            it:{ // Italian
                months: [
                    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
                ],
                dayOfWeek: [
                    "Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"
                ]
            },
            da:{ // Dansk
                months: [
                    "January", "Februar", "Marts", "April", "Maj", "Juni", "July", "August", "September", "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Søn", "Man", "Tir", "ons", "Tor", "Fre", "lør"
                ]
            },
            ja:{ // Japanese
                months: [
                    "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"
                ],
                dayOfWeek: [
                    "日", "月", "火", "水", "木", "金", "土"
                ]
            },
            vi:{ // Vietnamese
                months: [
                    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
                ],
                dayOfWeek: [
                    "CN", "T2", "T3", "T4", "T5", "T6", "T7"
                ]
            },
        },
        value:'',
        lang:				'en',

        format:			'Y/m/d H:i',
        formatTime:	'H:i',
        formatDate:	'Y/m/d',

        startDate:	false, // new Date(), '1986/12/08', '-1970/01/05','-1970/01/05',

        //fromUnixtime:	false,

        step:60,

        closeOnDateSelect:false,
        closeOnWithoutClick:true,

        timepicker:true,
        datepicker:true,

        minDate:false,
        maxDate:false,
        minTime:false,
        maxTime:false,

        allowTimes:[],
        opened:false,
        initTime:true,
        inline:false,

        onSelectDate:function() {},
        onSelectTime:function() {},
        onChangeMonth:function() {},
        onChangeDateTime:function() {},
        onShow:function() {},
        onClose:function() {},
        onGenerate:function() {},

        withoutCopyright:true,

        inverseButton:false,
        hours12:false,
        next:	'xdsoft_next',
        prev : 'xdsoft_prev',
        dayOfWeekStart:0,

        timeHeightInTimePicker:25,
        timepickerScrollbar:true,

        todayButton:true, // 2.1.0
        defaultSelect:true, // 2.1.0

        scrollMonth:true,
        scrollTime:true,
        scrollInput:true,

        lazyInit:false,

        mask:false,
        validateOnBlur:true,
        allowBlank:true,

        yearStart:1950,
        yearEnd:2050,

        style:'',
        id:'',

        roundTime:'round', // ceil, floor
        className:'',

        weekends	: 	[],
        yearOffset:0
    };

    // fix for ie8
    if ( !Array.prototype.indexOf ) {
        Array.prototype.indexOf = function(obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) { return i; }
            }
            return -1;
        }
    };

    $.fn.xdsoftScroller = function( _percent ) {
        return this.each(function() {
            var timeboxparent = $(this);
            if( !$(this).hasClass('xdsoft_scroller_box') ) {
                var pointerEventToXY = function( e ) {
                        var out = {x:0, y:0};
                        if( e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel' ) {
                            var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                            out.x = touch.pageX;
                            out.y = touch.pageY;
                        }else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
                            out.x = e.pageX;
                            out.y = e.pageY;
                        }
                        return out;
                    },
                    move = 0,
                    timebox = timeboxparent.children().eq(0),
                    parentHeight = timeboxparent[0].clientHeight,
                    height = timebox[0].offsetHeight,
                    scrollbar = $('<div class="xdsoft_scrollbar"></div>'),
                    scroller = $('<div class="xdsoft_scroller"></div>'),
                    maximumOffset = 100,
                    start = false;

                scrollbar.append(scroller);

                timeboxparent.addClass('xdsoft_scroller_box').append(scrollbar);
                scroller.on('mousedown.xdsoft_scroller',function ( event ) {
                    if( !parentHeight )
                        timeboxparent.trigger('resize_scroll.xdsoft_scroller',[_percent]);
                    var pageY = event.pageY,
                        top = parseInt(scroller.css('margin-top')),
                        h1 = scrollbar[0].offsetHeight;
                    $(document.body).addClass('xdsoft_noselect');
                    $([document.body,window]).on('mouseup.xdsoft_scroller',function arguments_callee() {
                        $([document.body,window]).off('mouseup.xdsoft_scroller',arguments_callee)
                            .off('mousemove.xdsoft_scroller',move)
                            .removeClass('xdsoft_noselect');
                    });
                    $(document.body).on('mousemove.xdsoft_scroller',move = function(event) {
                        var offset = event.pageY-pageY+top;
                        if( offset<0 )
                            offset = 0;
                        if( offset+scroller[0].offsetHeight>h1 )
                            offset = h1-scroller[0].offsetHeight;
                        timeboxparent.trigger('scroll_element.xdsoft_scroller',[maximumOffset?offset/maximumOffset:0]);
                    });
                });

                timeboxparent
                    .on('scroll_element.xdsoft_scroller',function( event,percent ) {
                        if( !parentHeight )
                            timeboxparent.trigger('resize_scroll.xdsoft_scroller',[percent,true]);
                        percent = percent>1?1:(percent<0||isNaN(percent))?0:percent;
                        scroller.css('margin-top',maximumOffset*percent);
                        timebox.css('marginTop',-parseInt((height-parentHeight)*percent))
                    })
                    .on('resize_scroll.xdsoft_scroller',function( event,_percent,noTriggerScroll ) {
                        parentHeight = timeboxparent[0].clientHeight;
                        height = timebox[0].offsetHeight;
                        var percent = parentHeight/height,
                            sh = percent*scrollbar[0].offsetHeight;
                        if( percent>1 )
                            scroller.hide();
                        else{
                            scroller.show();
                            scroller.css('height',parseInt(sh>10?sh:10));
                            maximumOffset = scrollbar[0].offsetHeight-scroller[0].offsetHeight;
                            if( noTriggerScroll!==true )
                                timeboxparent.trigger('scroll_element.xdsoft_scroller',[_percent?_percent:Math.abs(parseInt(timebox.css('marginTop')))/(height-parentHeight)]);
                        }
                    });
                timeboxparent.mousewheel&&timeboxparent.mousewheel(function(event, delta, deltaX, deltaY) {
                    var top = Math.abs(parseInt(timebox.css('marginTop')));
                    timeboxparent.trigger('scroll_element.xdsoft_scroller',[(top-delta*20)/(height-parentHeight)]);
                    event.stopPropagation();
                    return false;
                });
                timeboxparent.on('touchstart',function( event ) {
                    start = pointerEventToXY(event);
                });
                timeboxparent.on('touchmove',function( event ) {
                    if( start ) {
                        var coord = pointerEventToXY(event), top = Math.abs(parseInt(timebox.css('marginTop')));
                        timeboxparent.trigger('scroll_element.xdsoft_scroller',[(top-(coord.y-start.y))/(height-parentHeight)]);
                        event.stopPropagation();
                        event.preventDefault();
                    };
                });
                timeboxparent.on('touchend touchcancel',function( event ) {
                    start = false;
                });
            }
            timeboxparent.trigger('resize_scroll.xdsoft_scroller',[_percent]);
        });
    };
    $.fn.datetimepicker = function( opt ) {
        var KEY0 = 48,
            KEY9 = 57,
            _KEY0 = 96,
            _KEY9 = 105,
            CTRLKEY = 17,
            DEL = 46,
            ENTER = 13,
            ESC = 27,
            BACKSPACE = 8,
            ARROWLEFT = 37,
            ARROWUP = 38,
            ARROWRIGHT = 39,
            ARROWDOWN = 40,
            TAB = 9,
            F5 = 116,
            AKEY = 65,
            CKEY = 67,
            VKEY = 86,
            ZKEY = 90,
            YKEY = 89,
            ctrlDown	=	false,
            options = ($.isPlainObject(opt)||!opt)?$.extend(true,{},default_options,opt):$.extend({},default_options),

            lazyInitTimer = 0,

            lazyInit = function( input ){
                input
                    .on('open.xdsoft focusin.xdsoft mousedown.xdsoft',function initOnActionCallback(event) {
                        if( input.is(':disabled')||input.is(':hidden')||!input.is(':visible')||input.data( 'xdsoft_datetimepicker') )
                            return;

                        clearTimeout(lazyInitTimer);

                        lazyInitTimer = setTimeout(function() {

                            if( !input.data( 'xdsoft_datetimepicker') )
                                createDateTimePicker(input);

                            input
                                .off('open.xdsoft focusin.xdsoft mousedown.xdsoft',initOnActionCallback)
                                .trigger('open.xdsoft');
                        },100);

                    });
            },

            createDateTimePicker = function( input ) {

                var datetimepicker = $('<div '+(options.id?'id="'+options.id+'"':'')+' '+(options.style?'style="'+options.style+'"':'')+' class="xdsoft_datetimepicker xdsoft_noselect '+options.className+'"></div>'),
                    xdsoft_copyright = $('<div class="xdsoft_copyright"><a target="_blank" href="http://xdsoft.net/jqplugins/datetimepicker/">xdsoft.net</a></div>'),
                    datepicker = $('<div class="xdsoft_datepicker active"></div>'),
                    mounth_picker = $('<div class="xdsoft_mounthpicker"><button type="button" class="xdsoft_prev"></button><button type="button" class="xdsoft_today_button"></button><div class="xdsoft_label xdsoft_month"><span></span></div><div class="xdsoft_label xdsoft_year"><span></span></div><button type="button" class="xdsoft_next"></button></div>'),
                    calendar = $('<div class="xdsoft_calendar"></div>'),
                    timepicker = $('<div class="xdsoft_timepicker active"><button type="button" class="xdsoft_prev"></button><div class="xdsoft_time_box"></div><button type="button" class="xdsoft_next"></button></div>'),
                    timeboxparent = timepicker.find('.xdsoft_time_box').eq(0),
                    timebox = $('<div class="xdsoft_time_variant"></div>'),
                    scrollbar = $('<div class="xdsoft_scrollbar"></div>'),
                    scroller = $('<div class="xdsoft_scroller"></div>'),
                    monthselect =$('<div class="xdsoft_select xdsoft_monthselect"><div></div></div>'),
                    yearselect =$('<div class="xdsoft_select xdsoft_yearselect"><div></div></div>');

                //constructor lego
                mounth_picker
                    .find('.xdsoft_month span')
                    .after(monthselect);
                mounth_picker
                    .find('.xdsoft_year span')
                    .after(yearselect);

                mounth_picker
                    .find('.xdsoft_month,.xdsoft_year')
                    .on('mousedown.xdsoft',function(event) {
                        mounth_picker
                            .find('.xdsoft_select')
                            .hide();

                        var select = $(this).find('.xdsoft_select').eq(0),
                            val = 0,
                            top = 0;

                        if( _xdsoft_datetime.currentTime )
                            val = _xdsoft_datetime.currentTime[$(this).hasClass('xdsoft_month')?'getMonth':'getFullYear']();

                        select.show();

                        for(var items = select.find('div.xdsoft_option'),i = 0;i<items.length;i++) {
                            if( items.eq(i).data('value')==val ) {
                                break;
                            }else top+=items[0].offsetHeight;
                        }

                        select.xdsoftScroller(top/(select.children()[0].offsetHeight-(select[0].clientHeight)));
                        event.stopPropagation();

                        return false;
                    });

                mounth_picker
                    .find('.xdsoft_select')
                    .xdsoftScroller()
                    .on('mousedown.xdsoft',function( event ) {
                        event.stopPropagation();
                        event.preventDefault();
                    })
                    .on('mousedown.xdsoft','.xdsoft_option',function( event ) {
                        if( _xdsoft_datetime&&_xdsoft_datetime.currentTime )
                            _xdsoft_datetime.currentTime[$(this).parent().parent().hasClass('xdsoft_monthselect')?'setMonth':'setFullYear']($(this).data('value'));

                        $(this).parent().parent().hide();

                        datetimepicker.trigger('xchange.xdsoft');
                        options.onChangeMonth&&options.onChangeMonth.call&&options.onChangeMonth.call(datetimepicker,_xdsoft_datetime.currentTime,datetimepicker.data('input'));
                    });


                // set options
                datetimepicker.setOptions = function( _options ) {
                    options = $.extend(true,{},options,_options);

                    if( _options.allowTimes && $.isArray(_options.allowTimes) && _options.allowTimes.length ){
                        options['allowTimes'] = $.extend(true,[],_options.allowTimes);
                    }

                    if( _options.weekends && $.isArray(_options.weekends) && _options.weekends.length ){
                        options['weekends'] = $.extend(true,[],_options.weekends);
                    }

                    if( (options.open||options.opened)&&(!options.inline) ) {
                        input.trigger('open.xdsoft');
                    }

                    if( options.inline ) {
                        datetimepicker.addClass('xdsoft_inline');
                        input.after(datetimepicker).hide();
                        datetimepicker.trigger('afterOpen.xdsoft');
                    }

                    if( options.inverseButton ) {
                        options.next = 'xdsoft_prev';
                        options.prev = 'xdsoft_next';
                    }

                    if( options.datepicker )
                        datepicker.addClass('active');
                    else
                        datepicker.removeClass('active');

                    if( options.timepicker )
                        timepicker.addClass('active');
                    else
                        timepicker.removeClass('active');

                    if( options.value ){
                        input&&input.val&&input.val(options.value);
                        _xdsoft_datetime.setCurrentTime(options.value);
                    }

                    if( isNaN(options.dayOfWeekStart)||parseInt(options.dayOfWeekStart)<0||parseInt(options.dayOfWeekStart)>6 )
                        options.dayOfWeekStart = 0;
                    else
                        options.dayOfWeekStart = parseInt(options.dayOfWeekStart);

                    if( !options.timepickerScrollbar )
                        scrollbar.hide();

                    if( options.minDate && /^-(.*)$/.test(options.minDate) ){
                        options.minDate = _xdsoft_datetime.strToDateTime(options.minDate).dateFormat( options.formatDate );
                    }

                    if( options.maxDate &&  /^\+(.*)$/.test(options.maxDate) ) {
                        options.maxDate = _xdsoft_datetime.strToDateTime(options.maxDate).dateFormat( options.formatDate );
                    }

                    mounth_picker
                        .find('.xdsoft_today_button')
                        .css('visibility',!options.todayButton?'hidden':'visible');

                    if( options.mask ) {
                        var e,
                            getCaretPos = function ( input ) {
                                try{
                                    if ( document.selection && document.selection.createRange ) {
                                        var range = document.selection.createRange();
                                        return range.getBookmark().charCodeAt(2) - 2;
                                    }else
                                    if ( input.setSelectionRange )
                                        return input.selectionStart;
                                }catch(e) {
                                    return 0;
                                }
                            },
                            setCaretPos = function ( node,pos ) {
                                var node = (typeof node == "string" || node instanceof String) ? document.getElementById(node) : node;
                                if(!node) {
                                    return false;
                                }else if(node.createTextRange) {
                                    var textRange = node.createTextRange();
                                    textRange.collapse(true);
                                    textRange.moveEnd(pos);
                                    textRange.moveStart(pos);
                                    textRange.select();
                                    return true;
                                }else if(node.setSelectionRange) {
                                    node.setSelectionRange(pos,pos);
                                    return true;
                                }
                                return false;
                            },
                            isValidValue = function ( mask,value ) {
                                var reg = mask
                                    .replace(/([\[\]\/\{\}\(\)\-\.\+]{1})/g,'\\$1')
                                    .replace(/_/g,'{digit+}')
                                    .replace(/([0-9]{1})/g,'{digit$1}')
                                    .replace(/\{digit([0-9]{1})\}/g,'[0-$1_]{1}')
                                    .replace(/\{digit[\+]\}/g,'[0-9_]{1}');
                                return RegExp(reg).test(value);
                            };
                        input.off('keydown.xdsoft');
                        switch(true) {
                            case ( options.mask===true ):

                                options.mask = options.format
                                    .replace(/Y/g,'9999')
                                    .replace(/F/g,'9999')
                                    .replace(/m/g,'19')
                                    .replace(/d/g,'39')
                                    .replace(/H/g,'29')
                                    .replace(/i/g,'59')
                                    .replace(/s/g,'59');

                            case ( $.type(options.mask) == 'string' ):

                                if( !isValidValue( options.mask,input.val() ) )
                                    input.val(options.mask.replace(/[0-9]/g,'_'));

                                input.on('keydown.xdsoft',function( event ) {
                                    var val = this.value,
                                        key = event.which;

                                    switch(true) {
                                        case (( key>=KEY0&&key<=KEY9 )||( key>=_KEY0&&key<=_KEY9 ))||(key==BACKSPACE||key==DEL):
                                            var pos = getCaretPos(this),
                                                digit = ( key!=BACKSPACE&&key!=DEL )?String.fromCharCode((_KEY0 <= key && key <= _KEY9)? key-KEY0 : key):'_';

                                            if( (key==BACKSPACE||key==DEL)&&pos ) {
                                                pos--;
                                                digit='_';
                                            }

                                            while( /[^0-9_]/.test(options.mask.substr(pos,1))&&pos<options.mask.length&&pos>0 )
                                                pos+=( key==BACKSPACE||key==DEL )?-1:1;

                                            val = val.substr(0,pos)+digit+val.substr(pos+1);
                                            if( $.trim(val)=='' ){
                                                val = options.mask.replace(/[0-9]/g,'_');
                                            }else{
                                                if( pos==options.mask.length )
                                                    break;
                                            }

                                            pos+=(key==BACKSPACE||key==DEL)?0:1;
                                            while( /[^0-9_]/.test(options.mask.substr(pos,1))&&pos<options.mask.length&&pos>0 )
                                                pos+=(key==BACKSPACE||key==DEL)?-1:1;

                                            if( isValidValue( options.mask,val ) ) {
                                                this.value = val;
                                                setCaretPos(this,pos);
                                            }else if( $.trim(val)=='' )
                                                this.value = options.mask.replace(/[0-9]/g,'_');
                                            else{
                                                input.trigger('error_input.xdsoft');
                                            }
                                            break;
                                        case ( !!~([AKEY,CKEY,VKEY,ZKEY,YKEY].indexOf(key))&&ctrlDown ):
                                        case !!~([ESC,ARROWUP,ARROWDOWN,ARROWLEFT,ARROWRIGHT,F5,CTRLKEY,TAB,ENTER].indexOf(key)):
                                            return true;
                                    }
                                    event.preventDefault();
                                    return false;
                                });
                                break;
                        }
                    }
                    if( options.validateOnBlur ) {
                        input
                            .off('blur.xdsoft')
                            .on('blur.xdsoft', function() {
                                if( options.allowBlank && !$.trim($(this).val()).length ) {
                                    $(this).val(null);
                                    datetimepicker.data('xdsoft_datetime').empty();
                                }else if( !Date.parseDate( $(this).val(), options.format ) ) {
                                    $(this).val((_xdsoft_datetime.now()).dateFormat( options.format ));
                                    datetimepicker.data('xdsoft_datetime').setCurrentTime($(this).val());
                                }
                                else{
                                    datetimepicker.data('xdsoft_datetime').setCurrentTime($(this).val());
                                }
                                datetimepicker.trigger('changedatetime.xdsoft');
                            });
                    }
                    options.dayOfWeekStartPrev = (options.dayOfWeekStart==0)?6:options.dayOfWeekStart-1;
                    datetimepicker
                        .trigger('xchange.xdsoft');
                };

                datetimepicker
                    .data('options',options)
                    .on('mousedown.xdsoft',function( event ) {
                        event.stopPropagation();
                        event.preventDefault();
                        yearselect.hide();
                        monthselect.hide();
                        return false;
                    });

                var scroll_element = timepicker.find('.xdsoft_time_box');
                scroll_element.append(timebox);
                scroll_element.xdsoftScroller();
                datetimepicker.on('afterOpen.xdsoft',function() {
                    scroll_element.xdsoftScroller();
                });

                datetimepicker
                    .append(datepicker)
                    .append(timepicker);

                if( options.withoutCopyright!==true )
                    datetimepicker
                        .append(xdsoft_copyright);

                datepicker
                    .append(mounth_picker)
                    .append(calendar);

                $('body').append(datetimepicker);

                var _xdsoft_datetime = new function() {
                    var _this = this;
                    _this.now = function() {
                        var d = new Date();
                        if( options.yearOffset )
                            d.setFullYear(d.getFullYear()+options.yearOffset);
                        return d;
                    };

                    _this.currentTime = this.now();
                    _this.isValidDate = function (d) {
                        if ( Object.prototype.toString.call(d) !== "[object Date]" )
                            return false;
                        return !isNaN(d.getTime());
                    };

                    _this.setCurrentTime = function( dTime) {
                        _this.currentTime = (typeof dTime == 'string')? _this.strToDateTime(dTime) : _this.isValidDate(dTime) ? dTime: _this.now();
                        datetimepicker.trigger('xchange.xdsoft');
                    };

                    _this.empty = function() {
                        _this.currentTime = null;
                    };

                    _this.getCurrentTime = function( dTime) {
                        return _this.currentTime;
                    };

                    _this.nextMonth = function() {
                        var month = _this.currentTime.getMonth()+1;
                        if( month==12 ) {
                            _this.currentTime.setFullYear(_this.currentTime.getFullYear()+1);
                            month = 0;
                        }
                        _this.currentTime.setDate(
                            Math.min(
                                Date.daysInMonth[month],
                                _this.currentTime.getDate()
                            )
                        )
                        _this.currentTime.setMonth(month);
                        options.onChangeMonth&&options.onChangeMonth.call&&options.onChangeMonth.call(datetimepicker,_xdsoft_datetime.currentTime,datetimepicker.data('input'));
                        datetimepicker.trigger('xchange.xdsoft');
                        return month;
                    };

                    _this.prevMonth = function() {
                        var month = _this.currentTime.getMonth()-1;
                        if( month==-1 ) {
                            _this.currentTime.setFullYear(_this.currentTime.getFullYear()-1);
                            month = 11;
                        }
                        _this.currentTime.setDate(
                            Math.min(
                                Date.daysInMonth[month],
                                _this.currentTime.getDate()
                            )
                        )
                        _this.currentTime.setMonth(month);
                        options.onChangeMonth&&options.onChangeMonth.call&&options.onChangeMonth.call(datetimepicker,_xdsoft_datetime.currentTime,datetimepicker.data('input'));
                        datetimepicker.trigger('xchange.xdsoft');
                        return month;
                    };

                    _this.strToDateTime = function( sDateTime ) {
                        var tmpDate = [],timeOffset,currentTime;

                        if( ( tmpDate = /^(\+|\-)(.*)$/.exec(sDateTime) )  && ( tmpDate[2]=Date.parseDate(tmpDate[2], options.formatDate) ) ) {
                            timeOffset = tmpDate[2].getTime()-1*(tmpDate[2].getTimezoneOffset())*60000;
                            currentTime = new Date((_xdsoft_datetime.now()).getTime()+parseInt(tmpDate[1]+'1')*timeOffset);
                        }else
                            currentTime = sDateTime?Date.parseDate(sDateTime, options.format):_this.now();

                        if( !_this.isValidDate(currentTime) )
                            currentTime = _this.now();

                        return currentTime;
                    };

                    _this.strtodate = function( sDate ) {
                        var currentTime = sDate?Date.parseDate(sDate, options.formatDate):_this.now();
                        if( !_this.isValidDate(currentTime) )
                            currentTime = _this.now();
                        return currentTime;
                    };

                    _this.strtotime = function( sTime ) {
                        var currentTime = sTime?Date.parseDate(sTime, options.formatTime):_this.now();
                        if( !_this.isValidDate(currentTime) )
                            currentTime = _this.now();
                        return currentTime;
                    };

                    _this.str = function() {
                        return _this.currentTime.dateFormat(options.format);
                    };
                };
                mounth_picker
                    .find('.xdsoft_today_button')
                    .on('mousedown.xdsoft',function() {
                        datetimepicker.data('changed',true);
                        _xdsoft_datetime.setCurrentTime(0);
                        datetimepicker.trigger('afterOpen.xdsoft');
                    }).on('dblclick.xdsoft',function(){
                        input.val( _xdsoft_datetime.str() );
                        datetimepicker.trigger('close.xdsoft');
                    });
                mounth_picker
                    .find('.xdsoft_prev,.xdsoft_next')
                    .on('mousedown.xdsoft',function() {
                        var $this = $(this),
                            timer = 0,
                            stop = false;

                        (function arguments_callee1(v) {
                            var month =  _xdsoft_datetime.currentTime.getMonth();
                            if( $this.hasClass( options.next ) ) {
                                _xdsoft_datetime.nextMonth();
                            }else if( $this.hasClass( options.prev ) ) {
                                _xdsoft_datetime.prevMonth();
                            }
                            !stop&&(timer = setTimeout(arguments_callee1,v?v:100));
                        })(500);

                        $([document.body,window]).on('mouseup.xdsoft',function arguments_callee2() {
                            clearTimeout(timer);
                            stop = true;
                            $([document.body,window]).off('mouseup.xdsoft',arguments_callee2);
                        });
                    });

                timepicker
                    .find('.xdsoft_prev,.xdsoft_next')
                    .on('mousedown.xdsoft',function() {
                        var $this = $(this),
                            timer = 0,
                            stop = false,
                            period = 110;
                        (function arguments_callee4(v) {
                            var pheight = timeboxparent[0].clientHeight,
                                height = timebox[0].offsetHeight,
                                top = Math.abs(parseInt(timebox.css('marginTop')));
                            if( $this.hasClass(options.next) && (height-pheight)- options.timeHeightInTimePicker>=top ) {
                                timebox.css('marginTop','-'+(top+options.timeHeightInTimePicker)+'px')
                            }else if( $this.hasClass(options.prev) && top-options.timeHeightInTimePicker>=0  ) {
                                timebox.css('marginTop','-'+(top-options.timeHeightInTimePicker)+'px')
                            }
                            timeboxparent.trigger('scroll_element.xdsoft_scroller',[Math.abs(parseInt(timebox.css('marginTop'))/(height-pheight))]);
                            period= ( period>10 )?10:period-10;
                            !stop&&(timer = setTimeout(arguments_callee4,v?v:period));
                        })(500);
                        $([document.body,window]).on('mouseup.xdsoft',function arguments_callee5() {
                            clearTimeout(timer);
                            stop = true;
                            $([document.body,window])
                                .off('mouseup.xdsoft',arguments_callee5);
                        });
                    });

                var xchangeTimer = 0;
                // base handler - generating a calendar and timepicker
                datetimepicker
                    .on('xchange.xdsoft',function( event ) {
                        clearTimeout(xchangeTimer);
                        xchangeTimer = setTimeout(function(){
                            var table 	=	'',
                                start	= new Date(_xdsoft_datetime.currentTime.getFullYear(),_xdsoft_datetime.currentTime.getMonth(),1, 12, 0, 0),
                                i = 0,
                                today = _xdsoft_datetime.now();

                            while( start.getDay()!=options.dayOfWeekStart )
                                start.setDate(start.getDate()-1);

                            //generate calendar
                            table+='<table><thead><tr>';

                            // days
                            for(var j = 0; j<7; j++) {
                                table+='<th>'+options.i18n[options.lang].dayOfWeek[(j+options.dayOfWeekStart)>6?0:j+options.dayOfWeekStart]+'</th>';
                            }

                            table+='</tr></thead>';
                            table+='<tbody><tr>';
                            var maxDate = false, minDate = false;

                            if( options.maxDate!==false ) {
                                maxDate = _xdsoft_datetime.strtodate(options.maxDate);
                                maxDate = new Date(maxDate.getFullYear(),maxDate.getMonth(),maxDate.getDate(),23,59,59,999);
                            }

                            if( options.minDate!==false ) {
                                minDate = _xdsoft_datetime.strtodate(options.minDate);
                                minDate = new Date(minDate.getFullYear(),minDate.getMonth(),minDate.getDate());
                            }

                            var d,y,m,classes = [];

                            while( i<_xdsoft_datetime.currentTime.getDaysInMonth()||start.getDay()!=options.dayOfWeekStart||_xdsoft_datetime.currentTime.getMonth()==start.getMonth() ) {
                                classes = [];
                                i++;

                                d = start.getDate(); y = start.getFullYear(); m = start.getMonth();

                                classes.push('xdsoft_date');

                                if( ( maxDate!==false && start > maxDate )||(  minDate!==false && start < minDate ) ){
                                    classes.push('xdsoft_disabled');
                                }

                                if( _xdsoft_datetime.currentTime.getMonth()!=m ){
                                    classes.push('xdsoft_other_month');
                                }

                                if( (options.defaultSelect||datetimepicker.data('changed')) && _xdsoft_datetime.currentTime.dateFormat('d.m.Y')==start.dateFormat('d.m.Y') ) {
                                    classes.push('xdsoft_current');
                                }

                                if( today.dateFormat('d.m.Y')==start.dateFormat('d.m.Y') ) {
                                    classes.push('xdsoft_today');
                                }

                                if( start.getDay()==0||start.getDay()==6||~options.weekends.indexOf(start.dateFormat('d.m.Y')) ) {
                                    classes.push('xdsoft_weekend');
                                }

                                if(options.beforeShowDay && typeof options.beforeShowDay == 'function')
                                {
                                    classes.push(options.beforeShowDay(start))
                                }

                                table+='<td data-date="'+d+'" data-month="'+m+'" data-year="'+y+'"'+' class="xdsoft_date xdsoft_day_of_week'+start.getDay()+' '+ classes.join(' ')+'">'+
                                '<div>'+d+'</div>'+
                                '</td>';

                                if( start.getDay()==options.dayOfWeekStartPrev ) {
                                    table+='</tr>';
                                }

                                start.setDate(d+1);
                            }
                            table+='</tbody></table>';

                            calendar.html(table);

                            mounth_picker.find('.xdsoft_label span').eq(0).text(options.i18n[options.lang].months[_xdsoft_datetime.currentTime.getMonth()]);
                            mounth_picker.find('.xdsoft_label span').eq(1).text(_xdsoft_datetime.currentTime.getFullYear());

                            // generate timebox
                            var time = '',
                                h = '',
                                m ='',
                                line_time = function line_time( h,m ) {
                                    var now = _xdsoft_datetime.now();
                                    now.setHours(h);
                                    h = parseInt(now.getHours());
                                    now.setMinutes(m);
                                    m = parseInt(now.getMinutes());

                                    classes = [];
                                    if( (options.maxTime!==false&&_xdsoft_datetime.strtotime(options.maxTime).getTime()<now.getTime())||(options.minTime!==false&&_xdsoft_datetime.strtotime(options.minTime).getTime()>now.getTime()))
                                        classes.push('xdsoft_disabled');
                                    if( (options.initTime||options.defaultSelect||datetimepicker.data('changed')) && parseInt(_xdsoft_datetime.currentTime.getHours())==parseInt(h)&&(options.step>59||Math[options.roundTime](_xdsoft_datetime.currentTime.getMinutes()/options.step)*options.step==parseInt(m))) {
                                        if( options.defaultSelect||datetimepicker.data('changed')) {
                                            classes.push('xdsoft_current');
                                        } else if( options.initTime ) {
                                            classes.push('xdsoft_init_time');
                                        }
                                    }
                                    if( parseInt(today.getHours())==parseInt(h)&&parseInt(today.getMinutes())==parseInt(m))
                                        classes.push('xdsoft_today');
                                    time+= '<div class="xdsoft_time '+classes.join(' ')+'" data-hour="'+h+'" data-minute="'+m+'">'+now.dateFormat(options.formatTime)+'</div>';
                                };

                            if( !options.allowTimes || !$.isArray(options.allowTimes) || !options.allowTimes.length ) {
                                for( var i=0,j=0;i<(options.hours12?12:24);i++ ) {
                                    for( j=0;j<60;j+=options.step ) {
                                        h = (i<10?'0':'')+i;
                                        m = (j<10?'0':'')+j;
                                        line_time( h,m );
                                    }
                                }
                            }else{
                                for( var i=0;i<options.allowTimes.length;i++ ) {
                                    h = _xdsoft_datetime.strtotime(options.allowTimes[i]).getHours();
                                    m = _xdsoft_datetime.strtotime(options.allowTimes[i]).getMinutes();
                                    line_time( h,m );
                                }
                            }

                            timebox.html(time);

                            var opt = '',
                                i = 0;

                            for( i = parseInt(options.yearStart,10)+options.yearOffset;i<= parseInt(options.yearEnd,10)+options.yearOffset;i++ ) {
                                opt+='<div class="xdsoft_option '+(_xdsoft_datetime.currentTime.getFullYear()==i?'xdsoft_current':'')+'" data-value="'+i+'">'+i+'</div>';
                            }
                            yearselect.children().eq(0)
                                .html(opt);

                            for( i = 0,opt = '';i<= 11;i++ ) {
                                opt+='<div class="xdsoft_option '+(_xdsoft_datetime.currentTime.getMonth()==i?'xdsoft_current':'')+'" data-value="'+i+'">'+options.i18n[options.lang].months[i]+'</div>';
                            }
                            monthselect.children().eq(0).html(opt);
                            $(this).trigger('generate.xdsoft');
                        },10);
                        event.stopPropagation();
                    })
                    .on('afterOpen.xdsoft',function() {
                        if( options.timepicker ) {
                            var classType;
                            if( timebox.find('.xdsoft_current').length ) {
                                classType = '.xdsoft_current';
                            } else if( timebox.find('.xdsoft_init_time').length ) {
                                classType = '.xdsoft_init_time';
                            }

                            if( classType ) {
                                var pheight = timeboxparent[0].clientHeight,
                                    height = timebox[0].offsetHeight,
                                    top = timebox.find(classType).index()*options.timeHeightInTimePicker+1;
                                if( (height-pheight)<top )
                                    top = height-pheight;
                                timebox.css('marginTop','-'+parseInt(top)+'px');
                                timeboxparent.trigger('scroll_element.xdsoft_scroller',[parseInt(top)/(height-pheight)]);
                            }
                        }
                    });

                var timerclick = 0;

                calendar
                    .on('click.xdsoft', 'td', function (xdevent) {
                        xdevent.stopPropagation();  // Prevents closing of Pop-ups, Modals and Flyouts in Bootstrap
                        timerclick++;
                        var $this = $(this),
                            currentTime = _xdsoft_datetime.currentTime;
                        if( $this.hasClass('xdsoft_disabled') )
                            return false;

                        currentTime.setDate( $this.data('date') );
                        currentTime.setMonth( $this.data('month') );
                        currentTime.setFullYear( $this.data('year') );

                        datetimepicker.trigger('select.xdsoft',[currentTime]);

                        input.val( _xdsoft_datetime.str() );
                        if( (timerclick>1||(options.closeOnDateSelect===true||( options.closeOnDateSelect===0&&!options.timepicker )))&&!options.inline ) {
                            datetimepicker.trigger('close.xdsoft');
                        }

                        if( options.onSelectDate &&	options.onSelectDate.call ) {
                            options.onSelectDate.call(datetimepicker,_xdsoft_datetime.currentTime,datetimepicker.data('input'));
                        }

                        datetimepicker.data('changed',true);
                        datetimepicker.trigger('xchange.xdsoft');
                        datetimepicker.trigger('changedatetime.xdsoft');
                        setTimeout(function(){
                            timerclick = 0;
                        },200);
                    });

                timebox
                    .on('click.xdsoft', 'div', function (xdevent) {
                        xdevent.stopPropagation(); // NAJ: Prevents closing of Pop-ups, Modals and Flyouts
                        var $this = $(this),
                            currentTime = _xdsoft_datetime.currentTime;
                        if( $this.hasClass('xdsoft_disabled') )
                            return false;
                        currentTime.setHours($this.data('hour'));
                        currentTime.setMinutes($this.data('minute'));
                        datetimepicker.trigger('select.xdsoft',[currentTime]);

                        datetimepicker.data('input').val( _xdsoft_datetime.str() );

                        !options.inline&&datetimepicker.trigger('close.xdsoft');

                        if( options.onSelectTime&&options.onSelectTime.call ) {
                            options.onSelectTime.call(datetimepicker,_xdsoft_datetime.currentTime,datetimepicker.data('input'));
                        }
                        datetimepicker.data('changed',true);
                        datetimepicker.trigger('xchange.xdsoft');
                        datetimepicker.trigger('changedatetime.xdsoft');
                    });

                datetimepicker.mousewheel&&datepicker.mousewheel(function(event, delta, deltaX, deltaY) {
                    if( !options.scrollMonth )
                        return true;
                    if( delta<0 )
                        _xdsoft_datetime.nextMonth();
                    else
                        _xdsoft_datetime.prevMonth();
                    return false;
                });

                datetimepicker.mousewheel&&timeboxparent.unmousewheel().mousewheel(function(event, delta, deltaX, deltaY) {
                    if( !options.scrollTime )
                        return true;
                    var pheight = timeboxparent[0].clientHeight,
                        height = timebox[0].offsetHeight,
                        top = Math.abs(parseInt(timebox.css('marginTop'))),
                        fl = true;
                    if( delta<0 && (height-pheight)-options.timeHeightInTimePicker>=top ) {
                        timebox.css('marginTop','-'+(top+options.timeHeightInTimePicker)+'px');
                        fl = false;
                    }else if( delta>0&&top-options.timeHeightInTimePicker>=0 ) {
                        timebox.css('marginTop','-'+(top-options.timeHeightInTimePicker)+'px');
                        fl = false;
                    }
                    timeboxparent.trigger('scroll_element.xdsoft_scroller',[Math.abs(parseInt(timebox.css('marginTop'))/(height-pheight))]);
                    event.stopPropagation();
                    return fl;
                });

                datetimepicker
                    .on('changedatetime.xdsoft',function() {
                        if( options.onChangeDateTime&&options.onChangeDateTime.call ) {
                            var $input = datetimepicker.data('input');
                            options.onChangeDateTime.call(datetimepicker, _xdsoft_datetime.currentTime, $input);
                            $input.trigger('change');
                        }
                    })
                    .on('generate.xdsoft',function() {
                        if( options.onGenerate&&options.onGenerate.call )
                            options.onGenerate.call(datetimepicker,_xdsoft_datetime.currentTime,datetimepicker.data('input'));
                    });

                var current_time_index = 0;
                input.mousewheel&&input.mousewheel(function( event, delta, deltaX, deltaY ) {
                    if( !options.scrollInput )
                        return true;
                    if( !options.datepicker && options.timepicker ) {
                        current_time_index = timebox.find('.xdsoft_current').length?timebox.find('.xdsoft_current').eq(0).index():0;
                        if( current_time_index+delta>=0&&current_time_index+delta<timebox.children().length )
                            current_time_index+=delta;
                        timebox.children().eq(current_time_index).length&&timebox.children().eq(current_time_index).trigger('mousedown');
                        return false;
                    }else if( options.datepicker && !options.timepicker ) {
                        datepicker.trigger( event, [delta, deltaX, deltaY]);
                        input.val&&input.val( _xdsoft_datetime.str() );
                        datetimepicker.trigger('changedatetime.xdsoft');
                        return false;
                    }
                });
                var setPos = function() {
                    var offset = datetimepicker.data('input').offset(), top = offset.top+datetimepicker.data('input')[0].offsetHeight-1, left = offset.left;
                    if( top+datetimepicker[0].offsetHeight>$(window).height()+$(window).scrollTop() )
                        top = offset.top-datetimepicker[0].offsetHeight+1;
                    if (top < 0)
                        top = 0;
                    if( left+datetimepicker[0].offsetWidth>$(window).width() )
                        left = offset.left-datetimepicker[0].offsetWidth+datetimepicker.data('input')[0].offsetWidth;
                    datetimepicker.css({
                        left:left,
                        top:top
                    });
                };
                datetimepicker
                    .on('open.xdsoft', function() {
                        var onShow = true;
                        if( options.onShow&&options.onShow.call) {
                            onShow = options.onShow.call(datetimepicker,_xdsoft_datetime.currentTime,datetimepicker.data('input'));
                        }
                        if( onShow!==false ) {
                            datetimepicker.show();
                            datetimepicker.trigger('afterOpen.xdsoft');
                            setPos();
                            $(window)
                                .off('resize.xdsoft',setPos)
                                .on('resize.xdsoft',setPos);

                            if( options.closeOnWithoutClick ) {
                                $([document.body,window]).on('mousedown.xdsoft',function arguments_callee6() {
                                    datetimepicker.trigger('close.xdsoft');
                                    $([document.body,window]).off('mousedown.xdsoft',arguments_callee6);
                                });
                            }
                        }
                    })
                    .on('close.xdsoft', function( event ) {
                        var onClose = true;
                        if( options.onClose&&options.onClose.call ) {
                            onClose=options.onClose.call(datetimepicker,_xdsoft_datetime.currentTime,datetimepicker.data('input'));
                        }
                        if( onClose!==false&&!options.opened&&!options.inline ) {
                            datetimepicker.hide();
                        }
                        event.stopPropagation();
                    })
                    .data('input',input);

                var timer = 0,
                    timer1 = 0;

                datetimepicker.data('xdsoft_datetime',_xdsoft_datetime);
                datetimepicker.setOptions(options);

                function getCurrentValue(){
                    var ct = options.value?options.value:(input&&input.val&&input.val())?input.val():'';

                    if( ct && _xdsoft_datetime.isValidDate(ct = Date.parseDate(ct, options.format)) ) {
                        datetimepicker.data('changed',true);
                    }else
                        ct = '';

                    if( !ct && options.startDate!==false ){
                        ct = _xdsoft_datetime.strToDateTime(options.startDate);
                    }

                    return ct?ct:0;
                }

                _xdsoft_datetime.setCurrentTime( getCurrentValue() );

                datetimepicker.trigger('afterOpen.xdsoft');

                input
                    .data( 'xdsoft_datetimepicker',datetimepicker )
                    .on('open.xdsoft focusin.xdsoft mousedown.xdsoft',function(event) {
                        if( input.is(':disabled')||input.is(':hidden')||!input.is(':visible') )
                            return;
                        clearTimeout(timer);
                        timer = setTimeout(function() {
                            if( input.is(':disabled')||input.is(':hidden')||!input.is(':visible') )
                                return;
                            _xdsoft_datetime.setCurrentTime(getCurrentValue());

                            datetimepicker.trigger('open.xdsoft');
                        },100);
                    })
                    .on('keydown.xdsoft',function( event ) {
                        var val = this.value,
                            key = event.which;
                        switch(true) {
                            case !!~([ENTER].indexOf(key)):
                                var elementSelector = $("input:visible,textarea:visible");
                                datetimepicker.trigger('close.xdsoft');
                                elementSelector.eq(elementSelector.index(this) + 1).focus();
                                return false;
                            case !!~[TAB].indexOf(key):
                                datetimepicker.trigger('close.xdsoft');
                                return true;
                        }
                    });
            },
            destroyDateTimePicker = function( input ) {
                var datetimepicker = input.data('xdsoft_datetimepicker');
                if( datetimepicker ) {
                    datetimepicker.data('xdsoft_datetime',null);
                    datetimepicker.remove();
                    input
                        .data( 'xdsoft_datetimepicker',null )
                        .off( 'open.xdsoft focusin.xdsoft focusout.xdsoft mousedown.xdsoft blur.xdsoft keydown.xdsoft' );
                    $(window).off('resize.xdsoft');
                    $([window,document.body]).off('mousedown.xdsoft');
                    input.unmousewheel&&input.unmousewheel();
                }
            };
        $(document)
            .off('keydown.xdsoftctrl keyup.xdsoftctrl')
            .on('keydown.xdsoftctrl',function(e) {
                if ( e.keyCode == CTRLKEY )
                    ctrlDown = true;
            })
            .on('keyup.xdsoftctrl',function(e) {
                if ( e.keyCode == CTRLKEY )
                    ctrlDown = false;
            });
        return this.each(function() {
            var datetimepicker;
            if( datetimepicker = $(this).data('xdsoft_datetimepicker') ) {
                if( $.type(opt) === 'string' ) {
                    switch(opt) {
                        case 'show':
                            $(this).select().focus();
                            datetimepicker.trigger( 'open.xdsoft' );
                            break;
                        case 'hide':
                            datetimepicker.trigger('close.xdsoft');
                            break;
                        case 'destroy':
                            destroyDateTimePicker($(this));
                            break;
                        case 'reset':
                            this.value = this.defaultValue;
                            if(!this.value || !datetimepicker.data('xdsoft_datetime').isValidDate(Date.parseDate(this.value, options.format)))
                                datetimepicker.data('changed',false);
                            datetimepicker.data('xdsoft_datetime').setCurrentTime(this.value);
                            break;
                    }
                }else{
                    datetimepicker
                        .setOptions(opt);
                }
                return 0;
            }else
            if( ($.type(opt) !== 'string') ){
                if( !options.lazyInit||options.open||options.inline ){
                    createDateTimePicker($(this));
                }else
                    lazyInit($(this));
            }
        });
    };
})( jQuery );

//http://www.xaprb.com/blog/2005/12/12/javascript-closures-for-runtime-efficiency/
/*
 * Copyright (C) 2004 Baron Schwartz <baron at sequent dot org>
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, version 2.1.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
 * details.
 */
Date.parseFunctions={count:0};Date.parseRegexes=[];Date.formatFunctions={count:0};Date.prototype.dateFormat=function(b){if(b=="unixtime"){return parseInt(this.getTime()/1000);}if(Date.formatFunctions[b]==null){Date.createNewFormat(b);}var a=Date.formatFunctions[b];return this[a]();};Date.createNewFormat=function(format){var funcName="format"+Date.formatFunctions.count++;Date.formatFunctions[format]=funcName;var code="Date.prototype."+funcName+" = function() {return ";var special=false;var ch="";for(var i=0;i<format.length;++i){ch=format.charAt(i);if(!special&&ch=="\\"){special=true;}else{if(special){special=false;code+="'"+String.escape(ch)+"' + ";}else{code+=Date.getFormatCode(ch);}}}eval(code.substring(0,code.length-3)+";}");};Date.getFormatCode=function(a){switch(a){case"d":return"String.leftPad(this.getDate(), 2, '0') + ";case"D":return"Date.dayNames[this.getDay()].substring(0, 3) + ";case"j":return"this.getDate() + ";case"l":return"Date.dayNames[this.getDay()] + ";case"S":return"this.getSuffix() + ";case"w":return"this.getDay() + ";case"z":return"this.getDayOfYear() + ";case"W":return"this.getWeekOfYear() + ";case"F":return"Date.monthNames[this.getMonth()] + ";case"m":return"String.leftPad(this.getMonth() + 1, 2, '0') + ";case"M":return"Date.monthNames[this.getMonth()].substring(0, 3) + ";case"n":return"(this.getMonth() + 1) + ";case"t":return"this.getDaysInMonth() + ";case"L":return"(this.isLeapYear() ? 1 : 0) + ";case"Y":return"this.getFullYear() + ";case"y":return"('' + this.getFullYear()).substring(2, 4) + ";case"a":return"(this.getHours() < 12 ? 'am' : 'pm') + ";case"A":return"(this.getHours() < 12 ? 'AM' : 'PM') + ";case"g":return"((this.getHours() %12) ? this.getHours() % 12 : 12) + ";case"G":return"this.getHours() + ";case"h":return"String.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + ";case"H":return"String.leftPad(this.getHours(), 2, '0') + ";case"i":return"String.leftPad(this.getMinutes(), 2, '0') + ";case"s":return"String.leftPad(this.getSeconds(), 2, '0') + ";case"O":return"this.getGMTOffset() + ";case"T":return"this.getTimezone() + ";case"Z":return"(this.getTimezoneOffset() * -60) + ";default:return"'"+String.escape(a)+"' + ";}};Date.parseDate=function(a,c){if(c=="unixtime"){return new Date(!isNaN(parseInt(a))?parseInt(a)*1000:0);}if(Date.parseFunctions[c]==null){Date.createParser(c);}var b=Date.parseFunctions[c];return Date[b](a);};Date.createParser=function(format){var funcName="parse"+Date.parseFunctions.count++;var regexNum=Date.parseRegexes.length;var currentGroup=1;Date.parseFunctions[format]=funcName;var code="Date."+funcName+" = function(input) {\nvar y = -1, m = -1, d = -1, h = -1, i = -1, s = -1, z = -1;\nvar d = new Date();\ny = d.getFullYear();\nm = d.getMonth();\nd = d.getDate();\nvar results = input.match(Date.parseRegexes["+regexNum+"]);\nif (results && results.length > 0) {";var regex="";var special=false;var ch="";for(var i=0;i<format.length;++i){ch=format.charAt(i);if(!special&&ch=="\\"){special=true;}else{if(special){special=false;regex+=String.escape(ch);}else{obj=Date.formatCodeToRegex(ch,currentGroup);currentGroup+=obj.g;regex+=obj.s;if(obj.g&&obj.c){code+=obj.c;}}}}code+="if (y > 0 && z > 0){\nvar doyDate = new Date(y,0);\ndoyDate.setDate(z);\nm = doyDate.getMonth();\nd = doyDate.getDate();\n}";code+="if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)\n{return new Date(y, m, d, h, i, s);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)\n{return new Date(y, m, d, h, i);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0)\n{return new Date(y, m, d, h);}\nelse if (y > 0 && m >= 0 && d > 0)\n{return new Date(y, m, d);}\nelse if (y > 0 && m >= 0)\n{return new Date(y, m);}\nelse if (y > 0)\n{return new Date(y);}\n}return null;}";Date.parseRegexes[regexNum]=new RegExp("^"+regex+"$");eval(code);};Date.formatCodeToRegex=function(b,a){switch(b){case"D":return{g:0,c:null,s:"(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)"};case"j":case"d":return{g:1,c:"d = parseInt(results["+a+"], 10);\n",s:"(\\d{1,2})"};case"l":return{g:0,c:null,s:"(?:"+Date.dayNames.join("|")+")"};case"S":return{g:0,c:null,s:"(?:st|nd|rd|th)"};case"w":return{g:0,c:null,s:"\\d"};case"z":return{g:1,c:"z = parseInt(results["+a+"], 10);\n",s:"(\\d{1,3})"};case"W":return{g:0,c:null,s:"(?:\\d{2})"};case"F":return{g:1,c:"m = parseInt(Date.monthNumbers[results["+a+"].substring(0, 3)], 10);\n",s:"("+Date.monthNames.join("|")+")"};case"M":return{g:1,c:"m = parseInt(Date.monthNumbers[results["+a+"]], 10);\n",s:"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"};case"n":case"m":return{g:1,c:"m = parseInt(results["+a+"], 10) - 1;\n",s:"(\\d{1,2})"};case"t":return{g:0,c:null,s:"\\d{1,2}"};case"L":return{g:0,c:null,s:"(?:1|0)"};case"Y":return{g:1,c:"y = parseInt(results["+a+"], 10);\n",s:"(\\d{4})"};case"y":return{g:1,c:"var ty = parseInt(results["+a+"], 10);\ny = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n",s:"(\\d{1,2})"};case"a":return{g:1,c:"if (results["+a+"] == 'am') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}",s:"(am|pm)"};case"A":return{g:1,c:"if (results["+a+"] == 'AM') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}",s:"(AM|PM)"};case"g":case"G":case"h":case"H":return{g:1,c:"h = parseInt(results["+a+"], 10);\n",s:"(\\d{1,2})"};case"i":return{g:1,c:"i = parseInt(results["+a+"], 10);\n",s:"(\\d{2})"};case"s":return{g:1,c:"s = parseInt(results["+a+"], 10);\n",s:"(\\d{2})"};case"O":return{g:0,c:null,s:"[+-]\\d{4}"};case"T":return{g:0,c:null,s:"[A-Z]{3}"};case"Z":return{g:0,c:null,s:"[+-]\\d{1,5}"};default:return{g:0,c:null,s:String.escape(b)};}};Date.prototype.getTimezone=function(){return this.toString().replace(/^.*? ([A-Z]{3}) [0-9]{4}.*$/,"$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/,"$1$2$3");};Date.prototype.getGMTOffset=function(){return(this.getTimezoneOffset()>0?"-":"+")+String.leftPad(Math.floor(Math.abs(this.getTimezoneOffset())/60),2,"0")+String.leftPad(Math.abs(this.getTimezoneOffset())%60,2,"0");};Date.prototype.getDayOfYear=function(){var a=0;Date.daysInMonth[1]=this.isLeapYear()?29:28;for(var b=0;b<this.getMonth();++b){a+=Date.daysInMonth[b];}return a+this.getDate();};Date.prototype.getWeekOfYear=function(){var b=this.getDayOfYear()+(4-this.getDay());var a=new Date(this.getFullYear(),0,1);var c=(7-a.getDay()+4);return String.leftPad(Math.ceil((b-c)/7)+1,2,"0");};Date.prototype.isLeapYear=function(){var a=this.getFullYear();return((a&3)==0&&(a%100||(a%400==0&&a)));};Date.prototype.getFirstDayOfMonth=function(){var a=(this.getDay()-(this.getDate()-1))%7;return(a<0)?(a+7):a;};Date.prototype.getLastDayOfMonth=function(){var a=(this.getDay()+(Date.daysInMonth[this.getMonth()]-this.getDate()))%7;return(a<0)?(a+7):a;};Date.prototype.getDaysInMonth=function(){Date.daysInMonth[1]=this.isLeapYear()?29:28;return Date.daysInMonth[this.getMonth()];};Date.prototype.getSuffix=function(){switch(this.getDate()){case 1:case 21:case 31:return"st";case 2:case 22:return"nd";case 3:case 23:return"rd";default:return"th";}};String.escape=function(a){return a.replace(/('|\\)/g,"\\$1");};String.leftPad=function(d,b,c){var a=new String(d);if(c==null){c=" ";}while(a.length<b){a=c+a;}return a;};Date.daysInMonth=[31,28,31,30,31,30,31,31,30,31,30,31];Date.monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];Date.dayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];Date.y2kYear=50;Date.monthNumbers={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};Date.patterns={ISO8601LongPattern:"Y-m-d H:i:s",ISO8601ShortPattern:"Y-m-d",ShortDatePattern:"n/j/Y",LongDatePattern:"l, F d, Y",FullDateTimePattern:"l, F d, Y g:i:s A",MonthDayPattern:"F d",ShortTimePattern:"g:i A",LongTimePattern:"g:i:s A",SortableDateTimePattern:"Y-m-d\\TH:i:s",UniversalSortableDateTimePattern:"Y-m-d H:i:sO",YearMonthPattern:"F, Y"};
/*
 * Copyright (c) 2013 Brandon Aaron (http://brandonaaron.net)
 *
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.1.3
 *
 * Requires: 1.2.2+
 */
(function(factory) {if(typeof define==='function'&&define.amd) {define(['jquery'],factory)}else if(typeof exports==='object') {module.exports=factory}else{factory(jQuery)}}(function($) {var toFix=['wheel','mousewheel','DOMMouseScroll','MozMousePixelScroll'];var toBind='onwheel'in document||document.documentMode>=9?['wheel']:['mousewheel','DomMouseScroll','MozMousePixelScroll'];var lowestDelta,lowestDeltaXY;if($.event.fixHooks) {for(var i=toFix.length;i;) {$.event.fixHooks[toFix[--i]]=$.event.mouseHooks}}$.event.special.mousewheel={setup:function() {if(this.addEventListener) {for(var i=toBind.length;i;) {this.addEventListener(toBind[--i],handler,false)}}else{this.onmousewheel=handler}},teardown:function() {if(this.removeEventListener) {for(var i=toBind.length;i;) {this.removeEventListener(toBind[--i],handler,false)}}else{this.onmousewheel=null}}};$.fn.extend({mousewheel:function(fn) {return fn?this.bind("mousewheel",fn):this.trigger("mousewheel")},unmousewheel:function(fn) {return this.unbind("mousewheel",fn)}});function handler(event) {var orgEvent=event||window.event,args=[].slice.call(arguments,1),delta=0,deltaX=0,deltaY=0,absDelta=0,absDeltaXY=0,fn;event=$.event.fix(orgEvent);event.type="mousewheel";if(orgEvent.wheelDelta) {delta=orgEvent.wheelDelta}if(orgEvent.detail) {delta=orgEvent.detail*-1}if(orgEvent.deltaY) {deltaY=orgEvent.deltaY*-1;delta=deltaY}if(orgEvent.deltaX) {deltaX=orgEvent.deltaX;delta=deltaX*-1}if(orgEvent.wheelDeltaY!==undefined) {deltaY=orgEvent.wheelDeltaY}if(orgEvent.wheelDeltaX!==undefined) {deltaX=orgEvent.wheelDeltaX*-1}absDelta=Math.abs(delta);if(!lowestDelta||absDelta<lowestDelta) {lowestDelta=absDelta}absDeltaXY=Math.max(Math.abs(deltaY),Math.abs(deltaX));if(!lowestDeltaXY||absDeltaXY<lowestDeltaXY) {lowestDeltaXY=absDeltaXY}fn=delta>0?'floor':'ceil';delta=Math[fn](delta/lowestDelta);deltaX=Math[fn](deltaX/lowestDeltaXY);deltaY=Math[fn](deltaY/lowestDeltaXY);args.unshift(event,delta,deltaX,deltaY);return($.event.dispatch||$.event.handle).apply(this,args)}}));
/*!
 * js-logger - http://github.com/jonnyreeves/js-logger 
 * Jonny Reeves, http://jonnyreeves.co.uk/
 * js-logger may be freely distributed under the MIT license. 
 */

/*jshint sub:true*/
/*global window:true,define:true, module:true*/
(function (window) {
    "use strict";

    // Top level module for the global, static logger instance.
    var Logger = { };

    // For those that are at home that are keeping score.
    Logger.VERSION = "0.9.2";

    // Function which handles all incoming log messages.
    var logHandler;

    // Map of ContextualLogger instances by name; used by Logger.get() to return the same named instance.
    var contextualLoggersByNameMap = {};

    // Polyfill for ES5's Function.bind.
    var bind = function(scope, func) {
        return function() {
            return func.apply(scope, arguments);
        };
    };

    // Super exciting object merger-matron 9000 adding another 100 bytes to your download.
    var merge = function () {
        var args = arguments, target = args[0], key, i;
        for (i = 1; i < args.length; i++) {
            for (key in args[i]) {
                if (!(key in target) && args[i].hasOwnProperty(key)) {
                    target[key] = args[i][key];
                }
            }
        }
        return target;
    };

    // Helper to define a logging level object; helps with optimisation.
    var defineLogLevel = function(value, name) {
        return { value: value, name: name };
    };

    // Predefined logging levels.
    Logger.DEBUG = defineLogLevel(1, 'DEBUG');
    Logger.INFO = defineLogLevel(2, 'INFO');
    Logger.WARN = defineLogLevel(4, 'WARN');
    Logger.ERROR = defineLogLevel(8, 'ERROR');
    Logger.OFF = defineLogLevel(99, 'OFF');

    // Inner class which performs the bulk of the work; ContextualLogger instances can be configured independently
    // of each other.
    var ContextualLogger = function(defaultContext) {
        this.context = defaultContext;
        this.setLevel(defaultContext.filterLevel);
        this.log = this.info;  // Convenience alias.
    };

    ContextualLogger.prototype = {
        // Changes the current logging level for the logging instance.
        setLevel: function(newLevel) {
            // Ensure the supplied Level object looks valid.
            if (newLevel && "value" in newLevel) {
                this.context.filterLevel = newLevel;
            }
        },

        // Is the logger configured to output messages at the supplied level?
        enabledFor: function (lvl) {
            var filterLevel = this.context.filterLevel;
            return lvl.value >= filterLevel.value;
        },

        debug: function () {
            this.invoke(Logger.DEBUG, arguments);
        },

        info: function () {
            this.invoke(Logger.INFO, arguments);
        },

        warn: function () {
            this.invoke(Logger.WARN, arguments);
        },

        error: function () {
            this.invoke(Logger.ERROR, arguments);
        },

        // Invokes the logger callback if it's not being filtered.
        invoke: function (level, msgArgs) {
            if (logHandler && this.enabledFor(level)) {
                logHandler(msgArgs, merge({ level: level }, this.context));
            }
        }
    };

    // Protected instance which all calls to the to level `Logger` module will be routed through.
    var globalLogger = new ContextualLogger({ filterLevel: Logger.OFF });

    // Configure the global Logger instance.
    (function() {
        // Shortcut for optimisers.
        var L = Logger;

        L.enabledFor = bind(globalLogger, globalLogger.enabledFor);
        L.debug = bind(globalLogger, globalLogger.debug);
        L.info = bind(globalLogger, globalLogger.info);
        L.warn = bind(globalLogger, globalLogger.warn);
        L.error = bind(globalLogger, globalLogger.error);

        // Don't forget the convenience alias!
        L.log = L.info;
    }());

    // Set the global logging handler.  The supplied function should expect two arguments, the first being an arguments
    // object with the supplied log messages and the second being a context object which contains a hash of stateful
    // parameters which the logging function can consume.
    Logger.setHandler = function (func) {
        logHandler = func;
    };

    // Sets the global logging filter level which applies to *all* previously registred, and future Logger instances.
    // (note that named loggers (retrieved via `Logger.get`) can be configured indendently if required).
    Logger.setLevel = function(level) {
        // Set the globalLogger's level.
        globalLogger.setLevel(level);

        // Apply this level to all registered contextual loggers.
        for (var key in contextualLoggersByNameMap) {
            if (contextualLoggersByNameMap.hasOwnProperty(key)) {
                contextualLoggersByNameMap[key].setLevel(level);
            }
        }
    };

    // Retrieve a ContextualLogger instance.  Note that named loggers automatically inherit the global logger's level,
    // default context and log handler.
    Logger.get = function (name) {
        // All logger instances are cached so they can be configured ahead of use.
        return contextualLoggersByNameMap[name] ||
            (contextualLoggersByNameMap[name] = new ContextualLogger(merge({ name: name }, globalLogger.context)));
    };

    // Configure and example a Default implementation which writes to the `window.console` (if present).
    Logger.useDefaults = function(defaultLevel) {
        // Check for the presence of a logger.
        if (!("console" in window)) {
            return;
        }

        Logger.setLevel(defaultLevel || Logger.DEBUG);
        Logger.setHandler(function(messages, context) {
            var console = window.console;
            var hdlr = console.log;

            // Prepend the logger's name to the log message for easy identification.
            if (context.name) {
                messages[0] = "[" + context.name + "] " + messages[0];
            }

            // Delegate through to custom warn/error loggers if present on the console.
            if (context.level === Logger.WARN && console.warn) {
                hdlr = console.warn;
            } else if (context.level === Logger.ERROR && console.error) {
                hdlr = console.error;
            } else if (context.level === Logger.INFO && console.info) {
                hdlr = console.info;
            }

            hdlr.apply(console, messages);
        });
    };


    // Export to popular environments boilerplate.
    if (typeof define === 'function' && define.amd) {
        define(Logger);
    }
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = Logger;
    }
    else {
        window['Logger'] = Logger;
    }
}(window));

// -----------------------------------------------------------------------


// moment.js
// version : 2.1.0
// author : Tim Wood
// license : MIT
// momentjs.com
!function(t){function e(t,e){return function(n){return u(t.call(this,n),e)}}function n(t,e){return function(n){return this.lang().ordinal(t.call(this,n),e)}}function s(){}function i(t){a(this,t)}function r(t){var e=t.years||t.year||t.y||0,n=t.months||t.month||t.M||0,s=t.weeks||t.week||t.w||0,i=t.days||t.day||t.d||0,r=t.hours||t.hour||t.h||0,a=t.minutes||t.minute||t.m||0,o=t.seconds||t.second||t.s||0,u=t.milliseconds||t.millisecond||t.ms||0;this._input=t,this._milliseconds=u+1e3*o+6e4*a+36e5*r,this._days=i+7*s,this._months=n+12*e,this._data={},this._bubble()}function a(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);return t}function o(t){return 0>t?Math.ceil(t):Math.floor(t)}function u(t,e){for(var n=t+"";n.length<e;)n="0"+n;return n}function h(t,e,n,s){var i,r,a=e._milliseconds,o=e._days,u=e._months;a&&t._d.setTime(+t._d+a*n),(o||u)&&(i=t.minute(),r=t.hour()),o&&t.date(t.date()+o*n),u&&t.month(t.month()+u*n),a&&!s&&H.updateOffset(t),(o||u)&&(t.minute(i),t.hour(r))}function d(t){return"[object Array]"===Object.prototype.toString.call(t)}function c(t,e){var n,s=Math.min(t.length,e.length),i=Math.abs(t.length-e.length),r=0;for(n=0;s>n;n++)~~t[n]!==~~e[n]&&r++;return r+i}function f(t){return t?ie[t]||t.toLowerCase().replace(/(.)s$/,"$1"):t}function l(t,e){return e.abbr=t,x[t]||(x[t]=new s),x[t].set(e),x[t]}function _(t){if(!t)return H.fn._lang;if(!x[t]&&A)try{require("./lang/"+t)}catch(e){return H.fn._lang}return x[t]}function m(t){return t.match(/\[.*\]/)?t.replace(/^\[|\]$/g,""):t.replace(/\\/g,"")}function y(t){var e,n,s=t.match(E);for(e=0,n=s.length;n>e;e++)s[e]=ue[s[e]]?ue[s[e]]:m(s[e]);return function(i){var r="";for(e=0;n>e;e++)r+=s[e]instanceof Function?s[e].call(i,t):s[e];return r}}function M(t,e){function n(e){return t.lang().longDateFormat(e)||e}for(var s=5;s--&&N.test(e);)e=e.replace(N,n);return re[e]||(re[e]=y(e)),re[e](t)}function g(t,e){switch(t){case"DDDD":return V;case"YYYY":return X;case"YYYYY":return $;case"S":case"SS":case"SSS":case"DDD":return I;case"MMM":case"MMMM":case"dd":case"ddd":case"dddd":return R;case"a":case"A":return _(e._l)._meridiemParse;case"X":return B;case"Z":case"ZZ":return j;case"T":return q;case"MM":case"DD":case"YY":case"HH":case"hh":case"mm":case"ss":case"M":case"D":case"d":case"H":case"h":case"m":case"s":return J;default:return new RegExp(t.replace("\\",""))}}function p(t){var e=(j.exec(t)||[])[0],n=(e+"").match(ee)||["-",0,0],s=+(60*n[1])+~~n[2];return"+"===n[0]?-s:s}function D(t,e,n){var s,i=n._a;switch(t){case"M":case"MM":i[1]=null==e?0:~~e-1;break;case"MMM":case"MMMM":s=_(n._l).monthsParse(e),null!=s?i[1]=s:n._isValid=!1;break;case"D":case"DD":case"DDD":case"DDDD":null!=e&&(i[2]=~~e);break;case"YY":i[0]=~~e+(~~e>68?1900:2e3);break;case"YYYY":case"YYYYY":i[0]=~~e;break;case"a":case"A":n._isPm=_(n._l).isPM(e);break;case"H":case"HH":case"h":case"hh":i[3]=~~e;break;case"m":case"mm":i[4]=~~e;break;case"s":case"ss":i[5]=~~e;break;case"S":case"SS":case"SSS":i[6]=~~(1e3*("0."+e));break;case"X":n._d=new Date(1e3*parseFloat(e));break;case"Z":case"ZZ":n._useUTC=!0,n._tzm=p(e)}null==e&&(n._isValid=!1)}function Y(t){var e,n,s=[];if(!t._d){for(e=0;7>e;e++)t._a[e]=s[e]=null==t._a[e]?2===e?1:0:t._a[e];s[3]+=~~((t._tzm||0)/60),s[4]+=~~((t._tzm||0)%60),n=new Date(0),t._useUTC?(n.setUTCFullYear(s[0],s[1],s[2]),n.setUTCHours(s[3],s[4],s[5],s[6])):(n.setFullYear(s[0],s[1],s[2]),n.setHours(s[3],s[4],s[5],s[6])),t._d=n}}function w(t){var e,n,s=t._f.match(E),i=t._i;for(t._a=[],e=0;e<s.length;e++)n=(g(s[e],t).exec(i)||[])[0],n&&(i=i.slice(i.indexOf(n)+n.length)),ue[s[e]]&&D(s[e],n,t);i&&(t._il=i),t._isPm&&t._a[3]<12&&(t._a[3]+=12),t._isPm===!1&&12===t._a[3]&&(t._a[3]=0),Y(t)}function k(t){var e,n,s,r,o,u=99;for(r=0;r<t._f.length;r++)e=a({},t),e._f=t._f[r],w(e),n=new i(e),o=c(e._a,n.toArray()),n._il&&(o+=n._il.length),u>o&&(u=o,s=n);a(t,s)}function v(t){var e,n=t._i,s=K.exec(n);if(s){for(t._f="YYYY-MM-DD"+(s[2]||" "),e=0;4>e;e++)if(te[e][1].exec(n)){t._f+=te[e][0];break}j.exec(n)&&(t._f+=" Z"),w(t)}else t._d=new Date(n)}function T(e){var n=e._i,s=G.exec(n);n===t?e._d=new Date:s?e._d=new Date(+s[1]):"string"==typeof n?v(e):d(n)?(e._a=n.slice(0),Y(e)):e._d=n instanceof Date?new Date(+n):new Date(n)}function b(t,e,n,s,i){return i.relativeTime(e||1,!!n,t,s)}function S(t,e,n){var s=W(Math.abs(t)/1e3),i=W(s/60),r=W(i/60),a=W(r/24),o=W(a/365),u=45>s&&["s",s]||1===i&&["m"]||45>i&&["mm",i]||1===r&&["h"]||22>r&&["hh",r]||1===a&&["d"]||25>=a&&["dd",a]||45>=a&&["M"]||345>a&&["MM",W(a/30)]||1===o&&["y"]||["yy",o];return u[2]=e,u[3]=t>0,u[4]=n,b.apply({},u)}function F(t,e,n){var s,i=n-e,r=n-t.day();return r>i&&(r-=7),i-7>r&&(r+=7),s=H(t).add("d",r),{week:Math.ceil(s.dayOfYear()/7),year:s.year()}}function O(t){var e=t._i,n=t._f;return null===e||""===e?null:("string"==typeof e&&(t._i=e=_().preparse(e)),H.isMoment(e)?(t=a({},e),t._d=new Date(+e._d)):n?d(n)?k(t):w(t):T(t),new i(t))}function z(t,e){H.fn[t]=H.fn[t+"s"]=function(t){var n=this._isUTC?"UTC":"";return null!=t?(this._d["set"+n+e](t),H.updateOffset(this),this):this._d["get"+n+e]()}}function C(t){H.duration.fn[t]=function(){return this._data[t]}}function L(t,e){H.duration.fn["as"+t]=function(){return+this/e}}for(var H,P,U="2.1.0",W=Math.round,x={},A="undefined"!=typeof module&&module.exports,G=/^\/?Date\((\-?\d+)/i,Z=/(\-)?(\d*)?\.?(\d+)\:(\d+)\:(\d+)\.?(\d{3})?/,E=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g,N=/(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,J=/\d\d?/,I=/\d{1,3}/,V=/\d{3}/,X=/\d{1,4}/,$=/[+\-]?\d{1,6}/,R=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,j=/Z|[\+\-]\d\d:?\d\d/i,q=/T/i,B=/[\+\-]?\d+(\.\d{1,3})?/,K=/^\s*\d{4}-\d\d-\d\d((T| )(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,Q="YYYY-MM-DDTHH:mm:ssZ",te=[["HH:mm:ss.S",/(T| )\d\d:\d\d:\d\d\.\d{1,3}/],["HH:mm:ss",/(T| )\d\d:\d\d:\d\d/],["HH:mm",/(T| )\d\d:\d\d/],["HH",/(T| )\d\d/]],ee=/([\+\-]|\d\d)/gi,ne="Date|Hours|Minutes|Seconds|Milliseconds".split("|"),se={Milliseconds:1,Seconds:1e3,Minutes:6e4,Hours:36e5,Days:864e5,Months:2592e6,Years:31536e6},ie={ms:"millisecond",s:"second",m:"minute",h:"hour",d:"day",w:"week",M:"month",y:"year"},re={},ae="DDD w W M D d".split(" "),oe="M D H h m s w W".split(" "),ue={M:function(){return this.month()+1},MMM:function(t){return this.lang().monthsShort(this,t)},MMMM:function(t){return this.lang().months(this,t)},D:function(){return this.date()},DDD:function(){return this.dayOfYear()},d:function(){return this.day()},dd:function(t){return this.lang().weekdaysMin(this,t)},ddd:function(t){return this.lang().weekdaysShort(this,t)},dddd:function(t){return this.lang().weekdays(this,t)},w:function(){return this.week()},W:function(){return this.isoWeek()},YY:function(){return u(this.year()%100,2)},YYYY:function(){return u(this.year(),4)},YYYYY:function(){return u(this.year(),5)},gg:function(){return u(this.weekYear()%100,2)},gggg:function(){return this.weekYear()},ggggg:function(){return u(this.weekYear(),5)},GG:function(){return u(this.isoWeekYear()%100,2)},GGGG:function(){return this.isoWeekYear()},GGGGG:function(){return u(this.isoWeekYear(),5)},e:function(){return this.weekday()},E:function(){return this.isoWeekday()},a:function(){return this.lang().meridiem(this.hours(),this.minutes(),!0)},A:function(){return this.lang().meridiem(this.hours(),this.minutes(),!1)},H:function(){return this.hours()},h:function(){return this.hours()%12||12},m:function(){return this.minutes()},s:function(){return this.seconds()},S:function(){return~~(this.milliseconds()/100)},SS:function(){return u(~~(this.milliseconds()/10),2)},SSS:function(){return u(this.milliseconds(),3)},Z:function(){var t=-this.zone(),e="+";return 0>t&&(t=-t,e="-"),e+u(~~(t/60),2)+":"+u(~~t%60,2)},ZZ:function(){var t=-this.zone(),e="+";return 0>t&&(t=-t,e="-"),e+u(~~(10*t/6),4)},z:function(){return this.zoneAbbr()},zz:function(){return this.zoneName()},X:function(){return this.unix()}};ae.length;)P=ae.pop(),ue[P+"o"]=n(ue[P],P);for(;oe.length;)P=oe.pop(),ue[P+P]=e(ue[P],2);for(ue.DDDD=e(ue.DDD,3),s.prototype={set:function(t){var e,n;for(n in t)e=t[n],"function"==typeof e?this[n]=e:this["_"+n]=e},_months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),months:function(t){return this._months[t.month()]},_monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),monthsShort:function(t){return this._monthsShort[t.month()]},monthsParse:function(t){var e,n,s;for(this._monthsParse||(this._monthsParse=[]),e=0;12>e;e++)if(this._monthsParse[e]||(n=H([2e3,e]),s="^"+this.months(n,"")+"|^"+this.monthsShort(n,""),this._monthsParse[e]=new RegExp(s.replace(".",""),"i")),this._monthsParse[e].test(t))return e},_weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdays:function(t){return this._weekdays[t.day()]},_weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysShort:function(t){return this._weekdaysShort[t.day()]},_weekdaysMin:"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),weekdaysMin:function(t){return this._weekdaysMin[t.day()]},weekdaysParse:function(t){var e,n,s;for(this._weekdaysParse||(this._weekdaysParse=[]),e=0;7>e;e++)if(this._weekdaysParse[e]||(n=H([2e3,1]).day(e),s="^"+this.weekdays(n,"")+"|^"+this.weekdaysShort(n,"")+"|^"+this.weekdaysMin(n,""),this._weekdaysParse[e]=new RegExp(s.replace(".",""),"i")),this._weekdaysParse[e].test(t))return e},_longDateFormat:{LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D YYYY",LLL:"MMMM D YYYY LT",LLLL:"dddd, MMMM D YYYY LT"},longDateFormat:function(t){var e=this._longDateFormat[t];return!e&&this._longDateFormat[t.toUpperCase()]&&(e=this._longDateFormat[t.toUpperCase()].replace(/MMMM|MM|DD|dddd/g,function(t){return t.slice(1)}),this._longDateFormat[t]=e),e},isPM:function(t){return"p"===(t+"").toLowerCase()[0]},_meridiemParse:/[ap]\.?m?\.?/i,meridiem:function(t,e,n){return t>11?n?"pm":"PM":n?"am":"AM"},_calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},calendar:function(t,e){var n=this._calendar[t];return"function"==typeof n?n.apply(e):n},_relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},relativeTime:function(t,e,n,s){var i=this._relativeTime[n];return"function"==typeof i?i(t,e,n,s):i.replace(/%d/i,t)},pastFuture:function(t,e){var n=this._relativeTime[t>0?"future":"past"];return"function"==typeof n?n(e):n.replace(/%s/i,e)},ordinal:function(t){return this._ordinal.replace("%d",t)},_ordinal:"%d",preparse:function(t){return t},postformat:function(t){return t},week:function(t){return F(t,this._week.dow,this._week.doy).week},_week:{dow:0,doy:6}},H=function(t,e,n){return O({_i:t,_f:e,_l:n,_isUTC:!1})},H.utc=function(t,e,n){return O({_useUTC:!0,_isUTC:!0,_l:n,_i:t,_f:e})},H.unix=function(t){return H(1e3*t)},H.duration=function(t,e){var n,s,i=H.isDuration(t),a="number"==typeof t,o=i?t._input:a?{}:t,u=Z.exec(t);return a?e?o[e]=t:o.milliseconds=t:u&&(n="-"===u[1]?-1:1,o={y:0,d:~~u[2]*n,h:~~u[3]*n,m:~~u[4]*n,s:~~u[5]*n,ms:~~u[6]*n}),s=new r(o),i&&t.hasOwnProperty("_lang")&&(s._lang=t._lang),s},H.version=U,H.defaultFormat=Q,H.updateOffset=function(){},H.lang=function(t,e){return t?(e?l(t,e):x[t]||_(t),H.duration.fn._lang=H.fn._lang=_(t),void 0):H.fn._lang._abbr},H.langData=function(t){return t&&t._lang&&t._lang._abbr&&(t=t._lang._abbr),_(t)},H.isMoment=function(t){return t instanceof i},H.isDuration=function(t){return t instanceof r},H.fn=i.prototype={clone:function(){return H(this)},valueOf:function(){return+this._d+6e4*(this._offset||0)},unix:function(){return Math.floor(+this/1e3)},toString:function(){return this.format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")},toDate:function(){return this._offset?new Date(+this):this._d},toISOString:function(){return M(H(this).utc(),"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]")},toArray:function(){var t=this;return[t.year(),t.month(),t.date(),t.hours(),t.minutes(),t.seconds(),t.milliseconds()]},isValid:function(){return null==this._isValid&&(this._isValid=this._a?!c(this._a,(this._isUTC?H.utc(this._a):H(this._a)).toArray()):!isNaN(this._d.getTime())),!!this._isValid},utc:function(){return this.zone(0)},local:function(){return this.zone(0),this._isUTC=!1,this},format:function(t){var e=M(this,t||H.defaultFormat);return this.lang().postformat(e)},add:function(t,e){var n;return n="string"==typeof t?H.duration(+e,t):H.duration(t,e),h(this,n,1),this},subtract:function(t,e){var n;return n="string"==typeof t?H.duration(+e,t):H.duration(t,e),h(this,n,-1),this},diff:function(t,e,n){var s,i,r=this._isUTC?H(t).zone(this._offset||0):H(t).local(),a=6e4*(this.zone()-r.zone());return e=f(e),"year"===e||"month"===e?(s=432e5*(this.daysInMonth()+r.daysInMonth()),i=12*(this.year()-r.year())+(this.month()-r.month()),i+=(this-H(this).startOf("month")-(r-H(r).startOf("month")))/s,i-=6e4*(this.zone()-H(this).startOf("month").zone()-(r.zone()-H(r).startOf("month").zone()))/s,"year"===e&&(i/=12)):(s=this-r,i="second"===e?s/1e3:"minute"===e?s/6e4:"hour"===e?s/36e5:"day"===e?(s-a)/864e5:"week"===e?(s-a)/6048e5:s),n?i:o(i)},from:function(t,e){return H.duration(this.diff(t)).lang(this.lang()._abbr).humanize(!e)},fromNow:function(t){return this.from(H(),t)},calendar:function(){var t=this.diff(H().startOf("day"),"days",!0),e=-6>t?"sameElse":-1>t?"lastWeek":0>t?"lastDay":1>t?"sameDay":2>t?"nextDay":7>t?"nextWeek":"sameElse";return this.format(this.lang().calendar(e,this))},isLeapYear:function(){var t=this.year();return 0===t%4&&0!==t%100||0===t%400},isDST:function(){return this.zone()<this.clone().month(0).zone()||this.zone()<this.clone().month(5).zone()},day:function(t){var e=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=t?"string"==typeof t&&(t=this.lang().weekdaysParse(t),"number"!=typeof t)?this:this.add({d:t-e}):e},month:function(t){var e,n=this._isUTC?"UTC":"";return null!=t?"string"==typeof t&&(t=this.lang().monthsParse(t),"number"!=typeof t)?this:(e=this.date(),this.date(1),this._d["set"+n+"Month"](t),this.date(Math.min(e,this.daysInMonth())),H.updateOffset(this),this):this._d["get"+n+"Month"]()},startOf:function(t){switch(t=f(t)){case"year":this.month(0);case"month":this.date(1);case"week":case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===t&&this.weekday(0),this},endOf:function(t){return this.startOf(t).add(t,1).subtract("ms",1)},isAfter:function(t,e){return e="undefined"!=typeof e?e:"millisecond",+this.clone().startOf(e)>+H(t).startOf(e)},isBefore:function(t,e){return e="undefined"!=typeof e?e:"millisecond",+this.clone().startOf(e)<+H(t).startOf(e)},isSame:function(t,e){return e="undefined"!=typeof e?e:"millisecond",+this.clone().startOf(e)===+H(t).startOf(e)},min:function(t){return t=H.apply(null,arguments),this>t?this:t},max:function(t){return t=H.apply(null,arguments),t>this?this:t},zone:function(t){var e=this._offset||0;return null==t?this._isUTC?e:this._d.getTimezoneOffset():("string"==typeof t&&(t=p(t)),Math.abs(t)<16&&(t=60*t),this._offset=t,this._isUTC=!0,e!==t&&h(this,H.duration(e-t,"m"),1,!0),this)},zoneAbbr:function(){return this._isUTC?"UTC":""},zoneName:function(){return this._isUTC?"Coordinated Universal Time":""},daysInMonth:function(){return H.utc([this.year(),this.month()+1,0]).date()},dayOfYear:function(t){var e=W((H(this).startOf("day")-H(this).startOf("year"))/864e5)+1;return null==t?e:this.add("d",t-e)},weekYear:function(t){var e=F(this,this.lang()._week.dow,this.lang()._week.doy).year;return null==t?e:this.add("y",t-e)},isoWeekYear:function(t){var e=F(this,1,4).year;return null==t?e:this.add("y",t-e)},week:function(t){var e=this.lang().week(this);return null==t?e:this.add("d",7*(t-e))},isoWeek:function(t){var e=F(this,1,4).week;return null==t?e:this.add("d",7*(t-e))},weekday:function(t){var e=(this._d.getDay()+7-this.lang()._week.dow)%7;return null==t?e:this.add("d",t-e)},isoWeekday:function(t){return null==t?this.day()||7:this.day(this.day()%7?t:t-7)},lang:function(e){return e===t?this._lang:(this._lang=_(e),this)}},P=0;P<ne.length;P++)z(ne[P].toLowerCase().replace(/s$/,""),ne[P]);z("year","FullYear"),H.fn.days=H.fn.day,H.fn.months=H.fn.month,H.fn.weeks=H.fn.week,H.fn.isoWeeks=H.fn.isoWeek,H.fn.toJSON=H.fn.toISOString,H.duration.fn=r.prototype={_bubble:function(){var t,e,n,s,i=this._milliseconds,r=this._days,a=this._months,u=this._data;u.milliseconds=i%1e3,t=o(i/1e3),u.seconds=t%60,e=o(t/60),u.minutes=e%60,n=o(e/60),u.hours=n%24,r+=o(n/24),u.days=r%30,a+=o(r/30),u.months=a%12,s=o(a/12),u.years=s},weeks:function(){return o(this.days()/7)},valueOf:function(){return this._milliseconds+864e5*this._days+2592e6*(this._months%12)+31536e6*~~(this._months/12)},humanize:function(t){var e=+this,n=S(e,!t,this.lang());return t&&(n=this.lang().pastFuture(e,n)),this.lang().postformat(n)},add:function(t,e){var n=H.duration(t,e);return this._milliseconds+=n._milliseconds,this._days+=n._days,this._months+=n._months,this._bubble(),this},subtract:function(t,e){var n=H.duration(t,e);return this._milliseconds-=n._milliseconds,this._days-=n._days,this._months-=n._months,this._bubble(),this},get:function(t){return t=f(t),this[t.toLowerCase()+"s"]()},as:function(t){return t=f(t),this["as"+t.charAt(0).toUpperCase()+t.slice(1)+"s"]()},lang:H.fn.lang};for(P in se)se.hasOwnProperty(P)&&(L(P,se[P]),C(P.toLowerCase()));L("Weeks",6048e5),H.duration.fn.asMonths=function(){return(+this-31536e6*this.years())/2592e6+12*this.years()},H.lang("en",{ordinal:function(t){var e=t%10,n=1===~~(t%100/10)?"th":1===e?"st":2===e?"nd":3===e?"rd":"th";return t+n}}),A&&(module.exports=H),"undefined"==typeof ender&&(this.moment=H),"function"==typeof define&&define.amd&&define("moment",[],function(){return H})}.call(this);
/*! nanoScrollerJS - v0.7.4 - (c) 2013 James Florentino; Licensed MIT */
!function(a,b,c){"use strict";var d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x;w={paneClass:"pane",sliderClass:"slider",contentClass:"content",iOSNativeScrolling:!1,preventPageScrolling:!1,disableResize:!1,alwaysVisible:!1,flashDelay:1500,sliderMinHeight:20,sliderMaxHeight:null,documentContext:null,windowContext:null},s="scrollbar",r="scroll",k="mousedown",l="mousemove",n="mousewheel",m="mouseup",q="resize",h="drag",u="up",p="panedown",f="DOMMouseScroll",g="down",v="wheel",i="keydown",j="keyup",t="touchmove",d="Microsoft Internet Explorer"===b.navigator.appName&&/msie 7./i.test(b.navigator.appVersion)&&b.ActiveXObject,e=null,x=function(){var a,b,d;return a=c.createElement("div"),b=a.style,b.position="absolute",b.width="100px",b.height="100px",b.overflow=r,b.top="-9999px",c.body.appendChild(a),d=a.offsetWidth-a.clientWidth,c.body.removeChild(a),d},o=function(){function i(d,f){this.el=d,this.options=f,e||(e=x()),this.$el=a(this.el),this.doc=a(this.options.documentContext||c),this.win=a(this.options.windowContext||b),this.$content=this.$el.children("."+f.contentClass),this.$content.attr("tabindex",this.options.tabIndex||0),this.content=this.$content[0],this.options.iOSNativeScrolling&&null!=this.el.style.WebkitOverflowScrolling?this.nativeScrolling():this.generate(),this.createEvents(),this.addEvents(),this.reset()}return i.prototype.preventScrolling=function(a,b){if(this.isActive)if(a.type===f)(b===g&&a.originalEvent.detail>0||b===u&&a.originalEvent.detail<0)&&a.preventDefault();else if(a.type===n){if(!a.originalEvent||!a.originalEvent.wheelDelta)return;(b===g&&a.originalEvent.wheelDelta<0||b===u&&a.originalEvent.wheelDelta>0)&&a.preventDefault()}},i.prototype.nativeScrolling=function(){this.$content.css({WebkitOverflowScrolling:"touch"}),this.iOSNativeScrolling=!0,this.isActive=!0},i.prototype.updateScrollValues=function(){var a;a=this.content,this.maxScrollTop=a.scrollHeight-a.clientHeight,this.prevScrollTop=this.contentScrollTop||0,this.contentScrollTop=a.scrollTop,this.iOSNativeScrolling||(this.maxSliderTop=this.paneHeight-this.sliderHeight,this.sliderTop=0===this.maxScrollTop?0:this.contentScrollTop*this.maxSliderTop/this.maxScrollTop)},i.prototype.createEvents=function(){var a=this;this.events={down:function(b){return a.isBeingDragged=!0,a.offsetY=b.pageY-a.slider.offset().top,a.pane.addClass("active"),a.doc.bind(l,a.events[h]).bind(m,a.events[u]),!1},drag:function(b){return a.sliderY=b.pageY-a.$el.offset().top-a.offsetY,a.scroll(),a.updateScrollValues(),a.contentScrollTop>=a.maxScrollTop&&a.prevScrollTop!==a.maxScrollTop?a.$el.trigger("scrollend"):0===a.contentScrollTop&&0!==a.prevScrollTop&&a.$el.trigger("scrolltop"),!1},up:function(){return a.isBeingDragged=!1,a.pane.removeClass("active"),a.doc.unbind(l,a.events[h]).unbind(m,a.events[u]),!1},resize:function(){a.reset()},panedown:function(b){return a.sliderY=(b.offsetY||b.originalEvent.layerY)-.5*a.sliderHeight,a.scroll(),a.events.down(b),!1},scroll:function(b){a.isBeingDragged||(a.updateScrollValues(),a.iOSNativeScrolling||(a.sliderY=a.sliderTop,a.slider.css({top:a.sliderTop})),null!=b&&(a.contentScrollTop>=a.maxScrollTop?(a.options.preventPageScrolling&&a.preventScrolling(b,g),a.prevScrollTop!==a.maxScrollTop&&a.$el.trigger("scrollend")):0===a.contentScrollTop&&(a.options.preventPageScrolling&&a.preventScrolling(b,u),0!==a.prevScrollTop&&a.$el.trigger("scrolltop"))))},wheel:function(b){var c;if(null!=b)return c=b.delta||b.wheelDelta||b.originalEvent&&b.originalEvent.wheelDelta||-b.detail||b.originalEvent&&-b.originalEvent.detail,c&&(a.sliderY+=-c/3),a.scroll(),!1}}},i.prototype.addEvents=function(){var a;this.removeEvents(),a=this.events,this.options.disableResize||this.win.bind(q,a[q]),this.iOSNativeScrolling||(this.slider.bind(k,a[g]),this.pane.bind(k,a[p]).bind(""+n+" "+f,a[v])),this.$content.bind(""+r+" "+n+" "+f+" "+t,a[r])},i.prototype.removeEvents=function(){var a;a=this.events,this.win.unbind(q,a[q]),this.iOSNativeScrolling||(this.slider.unbind(),this.pane.unbind()),this.$content.unbind(""+r+" "+n+" "+f+" "+t,a[r])},i.prototype.generate=function(){var a,b,c,d,f;return c=this.options,d=c.paneClass,f=c.sliderClass,a=c.contentClass,this.$el.find(""+d).length||this.$el.find(""+f).length||this.$el.append('<div class="'+d+'"><div class="'+f+'" /></div>'),this.pane=this.$el.children("."+d),this.slider=this.pane.find("."+f),e&&(b={right:-e},this.$el.addClass("has-scrollbar")),null!=b&&this.$content.css(b),this},i.prototype.restore=function(){this.stopped=!1,this.pane.show(),this.addEvents()},i.prototype.reset=function(){var a,b,c,f,g,h,i,j,k,l;return this.iOSNativeScrolling?(this.contentHeight=this.content.scrollHeight,void 0):(this.$el.find("."+this.options.paneClass).length||this.generate().stop(),this.stopped&&this.restore(),a=this.content,c=a.style,f=c.overflowY,d&&this.$content.css({height:this.$content.height()}),b=a.scrollHeight+e,k=parseInt(this.$el.css("max-height"),10),k>0&&(this.$el.height(""),this.$el.height(a.scrollHeight>k?k:a.scrollHeight)),h=this.pane.outerHeight(!1),j=parseInt(this.pane.css("top"),10),g=parseInt(this.pane.css("bottom"),10),i=h+j+g,l=Math.round(i/b*i),l<this.options.sliderMinHeight?l=this.options.sliderMinHeight:null!=this.options.sliderMaxHeight&&l>this.options.sliderMaxHeight&&(l=this.options.sliderMaxHeight),f===r&&c.overflowX!==r&&(l+=e),this.maxSliderTop=i-l,this.contentHeight=b,this.paneHeight=h,this.paneOuterHeight=i,this.sliderHeight=l,this.slider.height(l),this.events.scroll(),this.pane.show(),this.isActive=!0,a.scrollHeight===a.clientHeight||this.pane.outerHeight(!0)>=a.scrollHeight&&f!==r?(this.pane.hide(),this.isActive=!1):this.el.clientHeight===a.scrollHeight&&f===r?this.slider.hide():this.slider.show(),this.pane.css({opacity:this.options.alwaysVisible?1:"",visibility:this.options.alwaysVisible?"visible":""}),this)},i.prototype.scroll=function(){return this.isActive?(this.sliderY=Math.max(0,this.sliderY),this.sliderY=Math.min(this.maxSliderTop,this.sliderY),this.$content.scrollTop(-1*((this.paneHeight-this.contentHeight+e)*this.sliderY/this.maxSliderTop)),this.iOSNativeScrolling||this.slider.css({top:this.sliderY}),this):void 0},i.prototype.scrollBottom=function(a){return this.isActive?(this.reset(),this.$content.scrollTop(this.contentHeight-this.$content.height()-a).trigger(n),this):void 0},i.prototype.scrollTop=function(a){return this.isActive?(this.reset(),this.$content.scrollTop(+a).trigger(n),this):void 0},i.prototype.scrollTo=function(b){return this.isActive?(this.reset(),this.scrollTop(a(b).get(0).offsetTop),this):void 0},i.prototype.stop=function(){return this.stopped=!0,this.removeEvents(),this.pane.hide(),this},i.prototype.destroy=function(){return this.stopped||this.stop(),this.pane.length&&this.pane.remove(),d&&this.$content.height(""),this.$content.removeAttr("tabindex"),this.$el.hasClass("has-scrollbar")&&(this.$el.removeClass("has-scrollbar"),this.$content.css({right:""})),this},i.prototype.flash=function(){var a=this;if(this.isActive)return this.reset(),this.pane.addClass("flashed"),setTimeout(function(){a.pane.removeClass("flashed")},this.options.flashDelay),this},i}(),a.fn.nanoScroller=function(b){return this.each(function(){var c,d;if((d=this.nanoscroller)||(c=a.extend({},w,b),this.nanoscroller=d=new o(this,c)),b&&"object"==typeof b){if(a.extend(d.options,b),b.scrollBottom)return d.scrollBottom(b.scrollBottom);if(b.scrollTop)return d.scrollTop(b.scrollTop);if(b.scrollTo)return d.scrollTo(b.scrollTo);if("bottom"===b.scroll)return d.scrollBottom(0);if("top"===b.scroll)return d.scrollTop(0);if(b.scroll&&b.scroll instanceof a)return d.scrollTo(b.scroll);if(b.stop)return d.stop();if(b.destroy)return d.destroy();if(b.flash)return d.flash()}return d.reset()})},a.fn.nanoScroller.Constructor=o}(jQuery,window,document);
//# sourceMappingURL=jquery.nanoscroller.min.js.map
/*!
 PowerTip - v1.2.0 - 2013-04-03
 http://stevenbenner.github.com/jquery-powertip/
 Copyright (c) 2013 Steven Benner (http://stevenbenner.com/).
 Released under MIT license.
 https://raw.github.com/stevenbenner/jquery-powertip/master/LICENSE.txt
 */
(function(e){"function"==typeof define&&define.amd?define(["jquery"],e):e(jQuery)})(function(e){function t(){var t=this;t.top="auto",t.left="auto",t.right="auto",t.bottom="auto",t.set=function(o,n){e.isNumeric(n)&&(t[o]=Math.round(n))}}function o(e,t,o){function n(n,i){r(),e.data(v)||(n?(i&&e.data(m,!0),o.showTip(e)):(P.tipOpenImminent=!0,l=setTimeout(function(){l=null,s()},t.intentPollInterval)))}function i(n){r(),P.tipOpenImminent=!1,e.data(v)&&(e.data(m,!1),n?o.hideTip(e):(P.delayInProgress=!0,l=setTimeout(function(){l=null,o.hideTip(e),P.delayInProgress=!1},t.closeDelay)))}function s(){var i=Math.abs(P.previousX-P.currentX),s=Math.abs(P.previousY-P.currentY),r=i+s;t.intentSensitivity>r?o.showTip(e):(P.previousX=P.currentX,P.previousY=P.currentY,n())}function r(){l=clearTimeout(l),P.delayInProgress=!1}function a(){o.resetPosition(e)}var l=null;this.show=n,this.hide=i,this.cancel=r,this.resetPosition=a}function n(){function e(e,i,r,a,l){var p,c=i.split("-")[0],u=new t;switch(p=s(e)?n(e,c):o(e,c),i){case"n":u.set("left",p.left-r/2),u.set("bottom",P.windowHeight-p.top+l);break;case"e":u.set("left",p.left+l),u.set("top",p.top-a/2);break;case"s":u.set("left",p.left-r/2),u.set("top",p.top+l);break;case"w":u.set("top",p.top-a/2),u.set("right",P.windowWidth-p.left+l);break;case"nw":u.set("bottom",P.windowHeight-p.top+l),u.set("right",P.windowWidth-p.left-20);break;case"nw-alt":u.set("left",p.left),u.set("bottom",P.windowHeight-p.top+l);break;case"ne":u.set("left",p.left-20),u.set("bottom",P.windowHeight-p.top+l);break;case"ne-alt":u.set("bottom",P.windowHeight-p.top+l),u.set("right",P.windowWidth-p.left);break;case"sw":u.set("top",p.top+l),u.set("right",P.windowWidth-p.left-20);break;case"sw-alt":u.set("left",p.left),u.set("top",p.top+l);break;case"se":u.set("left",p.left-20),u.set("top",p.top+l);break;case"se-alt":u.set("top",p.top+l),u.set("right",P.windowWidth-p.left)}return u}function o(e,t){var o,n,i=e.offset(),s=e.outerWidth(),r=e.outerHeight();switch(t){case"n":o=i.left+s/2,n=i.top;break;case"e":o=i.left+s,n=i.top+r/2;break;case"s":o=i.left+s/2,n=i.top+r;break;case"w":o=i.left,n=i.top+r/2;break;case"nw":o=i.left,n=i.top;break;case"ne":o=i.left+s,n=i.top;break;case"sw":o=i.left,n=i.top+r;break;case"se":o=i.left+s,n=i.top+r}return{top:n,left:o}}function n(e,t){function o(){d.push(p.matrixTransform(u))}var n,i,s,r,a=e.closest("svg")[0],l=e[0],p=a.createSVGPoint(),c=l.getBBox(),u=l.getScreenCTM(),f=c.width/2,w=c.height/2,d=[],h=["nw","n","ne","e","se","s","sw","w"];if(p.x=c.x,p.y=c.y,o(),p.x+=f,o(),p.x+=f,o(),p.y+=w,o(),p.y+=w,o(),p.x-=f,o(),p.x-=f,o(),p.y-=w,o(),d[0].y!==d[1].y||d[0].x!==d[7].x)for(i=Math.atan2(u.b,u.a)*O,s=Math.ceil((i%360-22.5)/45),1>s&&(s+=8);s--;)h.push(h.shift());for(r=0;d.length>r;r++)if(h[r]===t){n=d[r];break}return{top:n.y+P.scrollTop,left:n.x+P.scrollLeft}}this.compute=e}function i(o){function i(e){e.data(v,!0),O.queue(function(t){s(e),t()})}function s(e){var t;if(e.data(v)){if(P.isTipOpen)return P.isClosing||r(P.activeHover),O.delay(100).queue(function(t){s(e),t()}),void 0;e.trigger("powerTipPreRender"),t=p(e),t&&(O.empty().append(t),e.trigger("powerTipRender"),P.activeHover=e,P.isTipOpen=!0,O.data(g,o.mouseOnToPopup),o.followMouse?a():(b(e),P.isFixedTipOpen=!0),O.fadeIn(o.fadeInTime,function(){P.desyncTimeout||(P.desyncTimeout=setInterval(H,500)),e.trigger("powerTipOpen")}))}}function r(e){P.isClosing=!0,P.activeHover=null,P.isTipOpen=!1,P.desyncTimeout=clearInterval(P.desyncTimeout),e.data(v,!1),e.data(m,!1),O.fadeOut(o.fadeOutTime,function(){var n=new t;P.isClosing=!1,P.isFixedTipOpen=!1,O.removeClass(),n.set("top",P.currentY+o.offset),n.set("left",P.currentX+o.offset),O.css(n),e.trigger("powerTipClose")})}function a(){if(!P.isFixedTipOpen&&(P.isTipOpen||P.tipOpenImminent&&O.data(T))){var e,n,i=O.outerWidth(),s=O.outerHeight(),r=new t;r.set("top",P.currentY+o.offset),r.set("left",P.currentX+o.offset),e=c(r,i,s),e!==I.none&&(n=u(e),1===n?e===I.right?r.set("left",P.windowWidth-i):e===I.bottom&&r.set("top",P.scrollTop+P.windowHeight-s):(r.set("left",P.currentX-i-o.offset),r.set("top",P.currentY-s-o.offset))),O.css(r)}}function b(t){var n,i;o.smartPlacement?(n=e.fn.powerTip.smartPlacementLists[o.placement],e.each(n,function(e,o){var n=c(y(t,o),O.outerWidth(),O.outerHeight());return i=o,n===I.none?!1:void 0})):(y(t,o.placement),i=o.placement),O.addClass(i)}function y(e,n){var i,s,r=0,a=new t;a.set("top",0),a.set("left",0),O.css(a);do i=O.outerWidth(),s=O.outerHeight(),a=k.compute(e,n,i,s,o.offset),O.css(a);while(5>=++r&&(i!==O.outerWidth()||s!==O.outerHeight()));return a}function H(){var e=!1;!P.isTipOpen||P.isClosing||P.delayInProgress||(P.activeHover.data(v)===!1||P.activeHover.is(":disabled")?e=!0:l(P.activeHover)||P.activeHover.is(":focus")||P.activeHover.data(m)||(O.data(g)?l(O)||(e=!0):e=!0),e&&r(P.activeHover))}var k=new n,O=e("#"+o.popupId);0===O.length&&(O=e("<div/>",{id:o.popupId}),0===d.length&&(d=e("body")),d.append(O)),o.followMouse&&(O.data(T)||(f.on("mousemove",a),w.on("scroll",a),O.data(T,!0))),o.mouseOnToPopup&&O.on({mouseenter:function(){O.data(g)&&P.activeHover&&P.activeHover.data(h).cancel()},mouseleave:function(){P.activeHover&&P.activeHover.data(h).hide()}}),this.showTip=i,this.hideTip=r,this.resetPosition=b}function s(e){return window.SVGElement&&e[0]instanceof SVGElement}function r(){P.mouseTrackingActive||(P.mouseTrackingActive=!0,e(function(){P.scrollLeft=w.scrollLeft(),P.scrollTop=w.scrollTop(),P.windowWidth=w.width(),P.windowHeight=w.height()}),f.on("mousemove",a),w.on({resize:function(){P.windowWidth=w.width(),P.windowHeight=w.height()},scroll:function(){var e=w.scrollLeft(),t=w.scrollTop();e!==P.scrollLeft&&(P.currentX+=e-P.scrollLeft,P.scrollLeft=e),t!==P.scrollTop&&(P.currentY+=t-P.scrollTop,P.scrollTop=t)}}))}function a(e){P.currentX=e.pageX,P.currentY=e.pageY}function l(e){var t=e.offset(),o=e[0].getBoundingClientRect(),n=o.right-o.left,i=o.bottom-o.top;return P.currentX>=t.left&&P.currentX<=t.left+n&&P.currentY>=t.top&&P.currentY<=t.top+i}function p(t){var o,n,i=t.data(y),s=t.data(H),r=t.data(k);return i?(e.isFunction(i)&&(i=i.call(t[0])),n=i):s?(e.isFunction(s)&&(s=s.call(t[0])),s.length>0&&(n=s.clone(!0,!0))):r&&(o=e("#"+r),o.length>0&&(n=o.html())),n}function c(e,t,o){var n=P.scrollTop,i=P.scrollLeft,s=n+P.windowHeight,r=i+P.windowWidth,a=I.none;return(n>e.top||n>Math.abs(e.bottom-P.windowHeight)-o)&&(a|=I.top),(e.top+o>s||Math.abs(e.bottom-P.windowHeight)>s)&&(a|=I.bottom),(i>e.left||e.right+t>r)&&(a|=I.left),(e.left+t>r||i>e.right)&&(a|=I.right),a}function u(e){for(var t=0;e;)e&=e-1,t++;return t}var f=e(document),w=e(window),d=e("body"),h="displayController",v="hasActiveHover",m="forcedOpen",T="hasMouseMove",g="mouseOnToPopup",b="originalTitle",y="powertip",H="powertipjq",k="powertiptarget",O=180/Math.PI,P={isTipOpen:!1,isFixedTipOpen:!1,isClosing:!1,tipOpenImminent:!1,activeHover:null,currentX:0,currentY:0,previousX:0,previousY:0,desyncTimeout:null,mouseTrackingActive:!1,delayInProgress:!1,windowWidth:0,windowHeight:0,scrollTop:0,scrollLeft:0},I={none:0,top:1,bottom:2,left:4,right:8};e.fn.powerTip=function(t,n){if(!this.length)return this;if("string"===e.type(t)&&e.powerTip[t])return e.powerTip[t].call(this,this,n);var s=e.extend({},e.fn.powerTip.defaults,t),a=new i(s);return r(),this.each(function(){var t,n=e(this),i=n.data(y),r=n.data(H),l=n.data(k);n.data(h)&&e.powerTip.destroy(n),t=n.attr("title"),i||l||r||!t||(n.data(y,t),n.data(b,t),n.removeAttr("title")),n.data(h,new o(n,s,a))}),s.manual||this.on({"mouseenter.powertip":function(t){e.powerTip.show(this,t)},"mouseleave.powertip":function(){e.powerTip.hide(this)},"focus.powertip":function(){e.powerTip.show(this)},"blur.powertip":function(){e.powerTip.hide(this,!0)},"keydown.powertip":function(t){27===t.keyCode&&e.powerTip.hide(this,!0)}}),this},e.fn.powerTip.defaults={fadeInTime:200,fadeOutTime:100,followMouse:!1,popupId:"powerTip",intentSensitivity:7,intentPollInterval:100,closeDelay:100,placement:"n",smartPlacement:!1,offset:10,mouseOnToPopup:!1,manual:!1},e.fn.powerTip.smartPlacementLists={n:["n","ne","nw","s"],e:["e","ne","se","w","nw","sw","n","s","e"],s:["s","se","sw","n"],w:["w","nw","sw","e","ne","se","n","s","w"],nw:["nw","w","sw","n","s","se","nw"],ne:["ne","e","se","n","s","sw","ne"],sw:["sw","w","nw","s","n","ne","sw"],se:["se","e","ne","s","n","nw","se"],"nw-alt":["nw-alt","n","ne-alt","sw-alt","s","se-alt","w","e"],"ne-alt":["ne-alt","n","nw-alt","se-alt","s","sw-alt","e","w"],"sw-alt":["sw-alt","s","se-alt","nw-alt","n","ne-alt","w","e"],"se-alt":["se-alt","s","sw-alt","ne-alt","n","nw-alt","e","w"]},e.powerTip={show:function(t,o){return o?(a(o),P.previousX=o.pageX,P.previousY=o.pageY,e(t).data(h).show()):e(t).first().data(h).show(!0,!0),t},reposition:function(t){return e(t).first().data(h).resetPosition(),t},hide:function(t,o){return t?e(t).first().data(h).hide(o):P.activeHover&&P.activeHover.data(h).hide(!0),t},destroy:function(t){return e(t).off(".powertip").each(function(){var t=e(this),o=[b,h,v,m];t.data(b)&&(t.attr("title",t.data(b)),o.push(y)),t.removeData(o)}),t}},e.powerTip.showTip=e.powerTip.show,e.powerTip.closeTip=e.powerTip.hide});
;(function(win){
    var store = {},
        doc = win.document,
        localStorageName = 'localStorage',
        scriptTag = 'script',
        storage

    store.disabled = false
    store.set = function(key, value) {}
    store.get = function(key) {}
    store.remove = function(key) {}
    store.clear = function() {}
    store.transact = function(key, defaultVal, transactionFn) {
        var val = store.get(key)
        if (transactionFn == null) {
            transactionFn = defaultVal
            defaultVal = null
        }
        if (typeof val == 'undefined') { val = defaultVal || {} }
        transactionFn(val)
        store.set(key, val)
    }
    store.getAll = function() {}
    store.forEach = function() {}

    store.serialize = function(value) {
        return JSON.stringify(value)
    }
    store.deserialize = function(value) {
        if (typeof value != 'string') { return undefined }
        try { return JSON.parse(value) }
        catch(e) { return value || undefined }
    }

    // Functions to encapsulate questionable FireFox 3.6.13 behavior
    // when about.config::dom.storage.enabled === false
    // See https://github.com/marcuswestin/store.js/issues#issue/13
    function isLocalStorageNameSupported() {
        try { return (localStorageName in win && win[localStorageName]) }
        catch(err) { return false }
    }

    if (isLocalStorageNameSupported()) {
        storage = win[localStorageName]
        store.set = function(key, val) {
            if (val === undefined) { return store.remove(key) }
            storage.setItem(key, store.serialize(val))
            return val
        }
        store.get = function(key) { return store.deserialize(storage.getItem(key)) }
        store.remove = function(key) { storage.removeItem(key) }
        store.clear = function() { storage.clear() }
        store.getAll = function() {
            var ret = {}
            store.forEach(function(key, val) {
                ret[key] = val
            })
            return ret
        }
        store.forEach = function(callback) {
            for (var i=0; i<storage.length; i++) {
                var key = storage.key(i)
                callback(key, store.get(key))
            }
        }
    } else if (doc.documentElement.addBehavior) {
        var storageOwner,
            storageContainer
        // Since #userData storage applies only to specific paths, we need to
        // somehow link our data to a specific path.  We choose /favicon.ico
        // as a pretty safe option, since all browsers already make a request to
        // this URL anyway and being a 404 will not hurt us here.  We wrap an
        // iframe pointing to the favicon in an ActiveXObject(htmlfile) object
        // (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
        // since the iframe access rules appear to allow direct access and
        // manipulation of the document element, even for a 404 page.  This
        // document can be used instead of the current document (which would
        // have been limited to the current path) to perform #userData storage.
        try {
            storageContainer = new ActiveXObject('htmlfile')
            storageContainer.open()
            storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>')
            storageContainer.close()
            storageOwner = storageContainer.w.frames[0].document
            storage = storageOwner.createElement('div')
        } catch(e) {
            // somehow ActiveXObject instantiation failed (perhaps some special
            // security settings or otherwse), fall back to per-path storage
            storage = doc.createElement('div')
            storageOwner = doc.body
        }
        function withIEStorage(storeFunction) {
            return function() {
                var args = Array.prototype.slice.call(arguments, 0)
                args.unshift(storage)
                // See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
                // and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
                storageOwner.appendChild(storage)
                storage.addBehavior('#default#userData')
                storage.load(localStorageName)
                var result = storeFunction.apply(store, args)
                storageOwner.removeChild(storage)
                return result
            }
        }

        // In IE7, keys may not contain special chars. See all of https://github.com/marcuswestin/store.js/issues/40
        var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
        function ieKeyFix(key) {
            return key.replace(forbiddenCharsRegex, '___')
        }
        store.set = withIEStorage(function(storage, key, val) {
            key = ieKeyFix(key)
            if (val === undefined) { return store.remove(key) }
            storage.setAttribute(key, store.serialize(val))
            storage.save(localStorageName)
            return val
        })
        store.get = withIEStorage(function(storage, key) {
            key = ieKeyFix(key)
            return store.deserialize(storage.getAttribute(key))
        })
        store.remove = withIEStorage(function(storage, key) {
            key = ieKeyFix(key)
            storage.removeAttribute(key)
            storage.save(localStorageName)
        })
        store.clear = withIEStorage(function(storage) {
            var attributes = storage.XMLDocument.documentElement.attributes
            storage.load(localStorageName)
            for (var i=0, attr; attr=attributes[i]; i++) {
                storage.removeAttribute(attr.name)
            }
            storage.save(localStorageName)
        })
        store.getAll = function(storage) {
            var ret = {}
            store.forEach(function(key, val) {
                ret[key] = val
            })
            return ret
        }
        store.forEach = withIEStorage(function(storage, callback) {
            var attributes = storage.XMLDocument.documentElement.attributes
            for (var i=0, attr; attr=attributes[i]; ++i) {
                callback(attr.name, store.deserialize(storage.getAttribute(attr.name)))
            }
        })
    }

    try {
        var testKey = '__storejs__'
        store.set(testKey, testKey);
        if (store.get(testKey) != testKey) { store.disabled = true }
        store.remove(testKey)
    } catch(e) {
        store.disabled = true
    }
    store.enabled = !store.disabled;

    if (typeof module != 'undefined' && module.exports) { module.exports = store }
    else if (typeof define === 'function' && define.amd) { define(store) }
    else { win.store = store }

})(this.window || global);

// touch punch

/*!
 * jQuery UI Touch Punch 0.2.2
 *
 * Copyright 2011, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */
(function ($) {
    
  // Detect touch support
  $.support.touch = 'ontouchend' in document;

  // Ignore browsers without touch support
  if (!$.support.touch) {
    return;
  }

  var mouseProto = $.ui.mouse.prototype,
      _mouseInit = mouseProto._mouseInit,
      touchHandled;

  /**
   * Simulate a mouse event based on a corresponding touch event
   * @param {Object} event A touch event
   * @param {String} simulatedType The corresponding mouse event
   */
  function simulateMouseEvent (event, simulatedType) {

    // Ignore multi-touch events
    if (event.originalEvent.touches.length > 1) {
      return;
    }

    event.preventDefault();

    var touch = event.originalEvent.changedTouches[0],
        simulatedEvent = document.createEvent('MouseEvents');
    
    // Initialize the simulated mouse event using the touch event's coordinates
    simulatedEvent.initMouseEvent(
      simulatedType,    // type
      true,             // bubbles                    
      true,             // cancelable                 
      window,           // view                       
      1,                // detail                     
      touch.screenX,    // screenX                    
      touch.screenY,    // screenY                    
      touch.clientX,    // clientX                    
      touch.clientY,    // clientY                    
      false,            // ctrlKey                    
      false,            // altKey                     
      false,            // shiftKey                   
      false,            // metaKey                    
      0,                // button                     
      null              // relatedTarget              
    );

    // Dispatch the simulated event to the target element
    event.target.dispatchEvent(simulatedEvent);
  }

  /**
   * Handle the jQuery UI widget's touchstart events
   * @param {Object} event The widget element's touchstart event
   */
  mouseProto._touchStart = function (event) {

    var self = this;

    // Ignore the event if another widget is already being handled
    if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
      return;
    }

    // Set the flag to prevent other widgets from inheriting the touch event
    touchHandled = true;

    // Track movement to determine if interaction was a click
    self._touchMoved = false;

    // Simulate the mouseover event
    simulateMouseEvent(event, 'mouseover');

    // Simulate the mousemove event
    simulateMouseEvent(event, 'mousemove');

    // Simulate the mousedown event
    simulateMouseEvent(event, 'mousedown');
  };

  /**
   * Handle the jQuery UI widget's touchmove events
   * @param {Object} event The document's touchmove event
   */
  mouseProto._touchMove = function (event) {

    // Ignore event if not handled
    if (!touchHandled) {
      return;
    }

    // Interaction was not a click
    this._touchMoved = true;

    // Simulate the mousemove event
    simulateMouseEvent(event, 'mousemove');
  };

  /**
   * Handle the jQuery UI widget's touchend events
   * @param {Object} event The document's touchend event
   */
  mouseProto._touchEnd = function (event) {

    // Ignore event if not handled
    if (!touchHandled) {
      return;
    }

    // Simulate the mouseup event
    simulateMouseEvent(event, 'mouseup');

    // Simulate the mouseout event
    simulateMouseEvent(event, 'mouseout');

    // If the touch interaction did not move, it should trigger a click
    if (!this._touchMoved) {

      // Simulate the click event
      simulateMouseEvent(event, 'click');
    }

    // Unset the flag to allow other widgets to inherit the touch event
    touchHandled = false;
  };

  /**
   * A duck punch of the $.ui.mouse _mouseInit method to support touch events.
   * This method extends the widget with bound touch event handlers that
   * translate touch events to mouse events and pass them to the widget's
   * original mouse event handling methods.
   */
  mouseProto._mouseInit = function () {
    
    var self = this;

    // Delegate the touch handlers to the widget's element
    self.element
      .bind('touchstart', $.proxy(self, '_touchStart'))
      .bind('touchmove', $.proxy(self, '_touchMove'))
      .bind('touchend', $.proxy(self, '_touchEnd'));

    // Call the original $.ui.mouse init method
    _mouseInit.call(self);
  };

})(jQuery);

/**
 *  Zebra_DatePicker
 *
 *  Zebra_DatePicker is a small, compact and highly configurable date picker plugin for jQuery
 *
 *  Visit {@link http://stefangabos.ro/jquery/zebra-datepicker/} for more information.
 *
 *  For more resources visit {@link http://stefangabos.ro/}
 *
 *  @author     Stefan Gabos <contact@stefangabos.ro>
 *  @version    1.8.8 (last revision: December 16, 2013)
 *  @copyright  (c) 2011 - 2013 Stefan Gabos
 *  @license    http://www.gnu.org/licenses/lgpl-3.0.txt GNU LESSER GENERAL PUBLIC LICENSE
 *  @package    Zebra_DatePicker
 */
;
(function($) {

	'use strict';

	$.Zebra_DatePicker = function(element, options) {

		var defaults = {
			//  setting this property to a jQuery element, will result in the date picker being always visible, the indicated
			//  element being the date picker's container;
			always_visible: false,
			//  days of the week; Sunday to Saturday
			days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			//  by default, the abbreviated name of a day consists of the first 2 letters from the day's full name;
			//  while this is common for most languages, there are also exceptions for languages like Thai, Loa, Myanmar,
			//  etc. where this is not correct; for these cases, specify an array with the abbreviations to be used for
			//  the 7 days of the week; leave it FALSE to use the first 2 letters of a day's name as the abbreviation.
			//
			//  default is FALSE
			days_abbr: false,
			//  direction of the calendar
			//
			//  a positive or negative integer: n (a positive integer) creates a future-only calendar beginning at n days
			//  after today; -n (a negative integer); if n is 0, the calendar has no restrictions. use boolean true for
			//  a future-only calendar starting with today and use boolean false for a past-only calendar ending today.
			//
			//  you may also set this property to an array with two elements in the following combinations:
			//
			//  -   first item is boolean TRUE (calendar starts today), an integer > 0 (calendar starts n days after
			//      today), or a valid date given in the format defined by the "format" attribute, using English for
			//      month names (calendar starts at the specified date), and the second item is boolean FALSE (the calendar
			//      has no ending date), an integer > 0 (calendar ends n days after the starting date), or a valid date
			//      given in the format defined by the "format" attribute, using English for month names, and which occurs
			//      after the starting date (calendar ends at the specified date)
			//
			//  -   first item is boolean FALSE (calendar ends today), an integer < 0 (calendar ends n days before today),
			//      or a valid date given in the format defined by the "format" attribute, using English for month names
			//      (calendar ends at the specified date), and the second item is an integer > 0 (calendar ends n days
			//      before the ending date), or a valid date given in the format defined by the "format" attribute, using
			//      English for month names  and which occurs before the starting date (calendar starts at the specified
			//      date)
			//
			//  [1, 7] - calendar starts tomorrow and ends seven days after that
			//  [true, 7] - calendar starts today and ends seven days after that
			//  ['2013-01-01', false] - calendar starts on January 1st 2013 and has no ending date ("format" is YYYY-MM-DD)
			//  [false, '2012-01-01'] - calendar ends today and starts on January 1st 2012 ("format" is YYYY-MM-DD)
			//
			//  note that "disabled_dates" property will still apply!
			//
			//  default is 0 (no restrictions)
			direction: 0,
			//  an array of disabled dates in the following format: 'day month year weekday' where "weekday" is optional
			//  and can be 0-6 (Saturday to Sunday); the syntax is similar to cron's syntax: the values are separated by
			//  spaces and may contain * (asterisk) - (dash) and , (comma) delimiters:
			//
			//  ['1 1 2012'] would disable January 1, 2012;
			//  ['* 1 2012'] would disable all days in January 2012;
			//  ['1-10 1 2012'] would disable January 1 through 10 in 2012;
			//  ['1,10 1 2012'] would disable January 1 and 10 in 2012;
			//  ['1-10,20,22,24 1-3 *'] would disable 1 through 10, plus the 22nd and 24th of January through March for every year;
			//  ['* * * 0,6'] would disable all Saturdays and Sundays;
			//  ['01 07 2012', '02 07 2012', '* 08 2012'] would disable 1st and 2nd of July 2012, and all of August of 2012
			//
			//  default is FALSE, no disabled dates
			disabled_dates: false,
			//  an array of enabled dates in the same format as required for "disabled_dates" property.
			//  to be used together with the "disabled_dates" property by first setting the "disabled_dates" property to
			//  something like "[* * * *]" (which will disable everything) and the setting the "enabled_dates" property to,
			//  say, "[* * * 0,6]" to enable just weekends.
			enabled_dates: false,
			//  week's starting day
			//
			//  valid values are 0 to 6, Sunday to Saturday
			//
			//  default is 1, Monday
			first_day_of_week: 1,
			//  format of the returned date
			//
			//  accepts the following characters for date formatting: d, D, j, l, N, w, S, F, m, M, n, Y, y borrowing
			//  syntax from (PHP's date function)
			//
			//  note that when setting a date format without days ('d', 'j'), the users will be able to select only years
			//  and months, and when setting a format without months and days ('F', 'm', 'M', 'n', 'd', 'j'), the
			//  users will be able to select only years; likewise, when setting a date format with just months ('F', 'm',
			//  'M', 'n') or just years ('Y', 'y'), users will be able to select only months and years, respectively.
			//
			//  also note that the value of the "view" property (see below) may be overridden if it is the case: a value of
			//  "days" for the "view" property makes no sense if the date format doesn't allow the selection of days.
			//
			//  default is Y-m-d
			format: 'Y-m-d',
			//  HTML to be used for the previous month/next month buttons
			//
			//  default is ['&#171;','&#187;']
			header_navigation: ['&#171;', '&#187;'],
			//  should the icon for opening the datepicker be inside the element?
			//  if set to FALSE, the icon will be placed to the right of the parent element, while if set to TRUE it will
			//  be placed to the right of the parent element, but *inside* the element itself
			//
			//  default is TRUE
			inside: true,
			//  the caption for the "Clear" button
			lang_clear_date: 'Clear date',
			//  months names
			months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			//  by default, the abbreviated name of a month consists of the first 3 letters from the month's full name;
			//  while this is common for most languages, there are also exceptions for languages like Thai, Loa, Myanmar,
			//  etc. where this is not correct; for these cases, specify an array with the abbreviations to be used for
			//  the months of the year; leave it FALSE to use the first 3 letters of a month's name as the abbreviation.
			//
			//  default is FALSE
			months_abbr: false,
			//  the offset, in pixels (x, y), to shift the date picker's position relative to the top-right of the icon
			//  that toggles the date picker or, if the icon is disabled, relative to the top-right corner of the element
			//  the plugin is attached to.
			//
			//  note that this only applies if the position of element relative to the browser's viewport doesn't require
			//  the date picker to be placed automatically so that it is visible!
			//
			//  default is [5, -5]
			offset: [5, -5],
			//  if set as a jQuery element with a Zebra_DatePicker attached, that particular date picker will use the
			//  current date picker's value as starting date
			//  note that the rules set in the "direction" property will still apply, only that the reference date will
			//  not be the current system date but the value selected in the current date picker
			//  default is FALSE (not paired with another date picker)
			pair: false,
			//  should the element the calendar is attached to, be read-only?
			//  if set to TRUE, a date can be set only through the date picker and cannot be entered manually
			//
			//  default is TRUE
			readonly_element: true,
			//  should days from previous and/or next month be selectable when visible?
			//  note that if the value of this property is set to TRUE, the value of "show_other_months" will be considered
			//  TRUE regardless of the actual value!
			//
			//  default is FALSE
			select_other_months: false,
			//  should the "Clear date" button be visible?
			//
			//  accepted values are:
			//
			//  - 0 (zero) - the button for clearing a previously selected date is shown only if a previously selected date
			//  already exists; this means that if the input the date picker is attached to is empty, and the user selects
			//  a date for the first time, this button will not be visible; once the user picked a date and opens the date
			//  picker again, this time the button will be visible.
			//
			//  - TRUE will make the button visible all the time
			//
			//  - FALSE will disable the button
			//
			//  default is "0" (without quotes)
			show_clear_date: 0,
			//  should a calendar icon be added to the elements the plugin is attached to?
			//
			//  default is TRUE
			show_icon: true,
			//  should days from previous and/or next month be visible?
			//
			//  default is TRUE
			show_other_months: true,
			//  should the "Today" button be visible?
			//  setting it to anything but boolean FALSE will enable the button and will use the property's value as
			//  caption for the button; setting it to FALSE will disable the button
			//
			//  default is "Today"
			show_select_today: 'Today',
			//  should an extra column be shown, showing the number of each week?
			//  anything other than FALSE will enable this feature, and use the given value as column title
			//  i.e. show_week_number: 'Wk' would enable this feature and have "Wk" as the column's title
			//
			//  default is FALSE
			show_week_number: false,
			//  a default date to start the date picker with
			//  must be specified in the format defined by the "format" property, or it will be ignored!
			//  note that this value is used only if there is no value in the field the date picker is attached to!
			start_date: false,
			//  should default values, in the input field the date picker is attached to, be deleted if they are not valid
			//  according to "direction" and/or "disabled_dates"?
			//
			//  default is FALSE
			strict: false,
			//  how should the date picker start; valid values are "days", "months" and "years"
			//  note that the date picker is always cycling days-months-years when clicking in the date picker's header,
			//  and years-months-days when selecting dates (unless one or more of the views are missing due to the date's
			//  format)
			//
			//  also note that the value of the "view" property may be overridden if the date's format requires so! (i.e.
			//  "days" for the "view" property makes no sense if the date format doesn't allow the selection of days)
			//
			//  default is "days"
			view: 'days',
			//  days of the week that are considered "weekend days"
			//  valid values are 0 to 6, Sunday to Saturday
			//
			//  default values are 0 and 6 (Saturday and Sunday)
			weekend_days: [0, 6],
			//  when set to TRUE, day numbers < 10 will be prefixed with 0; set to FALSE if you don't want that
			//
			//  default is TRUE
			zero_pad: false,
			//  callback function to be executed whenever the user changes the view (days/months/years), as well as when
			//  the user navigates by clicking on the "next"/"previous" icons in any of the views;
			//
			//  the callback function called by this event takes 3 arguments - the first argument represents the current
			//  view (can be "days", "months" or "years"), the second argument represents an array containing the "active"
			//  elements (not disabled) from the view, as jQuery elements, allowing for easy customization and interaction
			//  with particular cells in the date picker's view, while the third argument is a reference to the element
			//  the date picker is attached to, as a jQuery object
			//
			//  for simplifying searching for particular dates, each element in the second argument will also have a
			//  "date" data attribute whose format depends on the value of the "view" argument:
			//  - YYYY-MM-DD for elements in the "days" view
			//  - YYYY-MM for elements in the "months" view
			//  - YYYY for elements in the "years" view
			onChange: null,
			//  callback function to be executed when the user clicks the "Clear" button
			//  the callback function takes a single argument:
			//  -   a reference to the element the date picker is attached to, as a jQuery object
			onClear: null,
			//  callback function to be executed when a date is selected
			//  the callback function takes 4 arguments:
			//  -   the date in the format specified by the "format" attribute;
			//  -   the date in YYYY-MM-DD format
			//  -   the date as a JavaScript Date object
			//  -   a reference to the element the date picker is attached to, as a jQuery object
			onSelect: null

		};

		// private properties
		var view, datepicker, icon, header, daypicker, monthpicker, yearpicker, cleardate, current_system_month, current_system_year,
				current_system_day, first_selectable_month, first_selectable_year, first_selectable_day, selected_month, selected_year,
				default_day, default_month, default_year, enabled_dates, disabled_dates, shim, start_date, end_date, last_selectable_day,
				last_selectable_year, last_selectable_month, daypicker_cells, monthpicker_cells, yearpicker_cells, views, clickables,
				selecttoday, footer, show_select_today, timeout;

		var plugin = this;

		plugin.settings = {};

		// the jQuery version of the element
		// "element" (without the $) will point to the DOM element
		var $element = $(element);

		/**
		 *  Constructor method. Initializes the date picker.
		 *
		 *  @return void
		 */
		var init = function(update) {

			// unless we're just updating settings
			if (!update) {

				// merge default settings with user-settings (
				plugin.settings = $.extend({}, defaults, options);

				// iterate through the element's data attributes (if any)
				for (var data in $element.data())
					// if data attribute's name starts with "zdp_"
					if (data.indexOf('zdp_') === 0) {

						// remove the "zdp_" prefix
						data = data.replace(/^zdp\_/, '');

						// if such a property exists
						if (undefined !== defaults[data])
							// update the property's value
							plugin.settings[data] = $element.data('zdp_' + data);

					}

			}

			// if the element should be read-only, set the "readonly" attribute
			if (plugin.settings.readonly_element)
				$element.attr('readonly', 'readonly');

			// determine the views the user can cycle through, depending on the format
			// that is, if the format doesn't contain the day, the user will be able to cycle only through years and months,
			// whereas if the format doesn't contain months nor days, the user will only be able to select years

			var
					// the characters that may be present in the date format and that represent days, months and years
					date_chars = {
						days: ['d', 'j', 'D'],
						months: ['F', 'm', 'M', 'n', 't'],
						years: ['o', 'Y', 'y']
					},
			// some defaults
			has_days = false,
					has_months = false,
					has_years = false,
					type = null;

			// iterate through all the character blocks
			for (type in date_chars)
				// iterate through the characters of each block
				$.each(date_chars[type], function(index, character) {

					// if current character exists in the "format" property
					if (plugin.settings.format.indexOf(character) > -1)
						// set to TRUE the appropriate flag
						if (type == 'days')
							has_days = true;
						else if (type == 'months')
							has_months = true;
						else if (type == 'years')
							has_years = true;

				});

			// if user can cycle through all the views, set the flag accordingly
			if (has_days && has_months && has_years)
				views = ['years', 'months', 'days'];

			// if user can cycle only through year and months, set the flag accordingly
			else if (!has_days && has_months && has_years)
				views = ['years', 'months'];

			// if user can only see the year picker, set the flag accordingly
			else if (!has_days && !has_months && has_years)
				views = ['years'];

			// if user can only see the month picker, set the flag accordingly
			else if (!has_days && has_months && !has_years)
				views = ['months'];

			// if invalid format (no days, no months, no years) use the default where the user is able to cycle through
			// all the views
			else
				views = ['years', 'months', 'days'];

			// if the starting view is not amongst the views the user can cycle through, set the correct starting view
			if ($.inArray(plugin.settings.view, views) == -1)
				plugin.settings.view = views[views.length - 1];

			// parse the rules for disabling dates and turn them into arrays of arrays

			// array that will hold the rules for enabling/disabling dates
			disabled_dates = [];
			enabled_dates = [];

			var dates;

			// it's the same logic for preparing the enabled/disable dates...
			for (var l = 0; l < 2; l++) {

				// first time we're doing disabled dates,
				if (l === 0)
					dates = plugin.settings.disabled_dates;

				// second time we're doing enabled_dates
				else
					dates = plugin.settings.enabled_dates;

				// if we have a non-empty array
				if ($.isArray(dates) && dates.length > 0)
					// iterate through the rules
					$.each(dates, function() {

						// split the values in rule by white space
						var rules = this.split(' ');

						// there can be a maximum of 4 rules (days, months, years and, optionally, day of the week)
						for (var i = 0; i < 4; i++) {

							// if one of the values is not available
							// replace it with a * (wildcard)
							if (!rules[i])
								rules[i] = '*';

							// if rule contains a comma, create a new array by splitting the rule by commas
							// if there are no commas create an array containing the rule's string
							rules[i] = (rules[i].indexOf(',') > -1 ? rules[i].split(',') : new Array(rules[i]));

							// iterate through the items in the rule
							for (var j = 0; j < rules[i].length; j++)
								// if item contains a dash (defining a range)
								if (rules[i][j].indexOf('-') > -1) {

									// get the lower and upper limits of the range
									var limits = rules[i][j].match(/^([0-9]+)\-([0-9]+)/);

									// if range is valid
									if (null !== limits) {

										// iterate through the range
										for (var k = to_int(limits[1]); k <= to_int(limits[2]); k++)
											// if value is not already among the values of the rule
											// add it to the rule
											if ($.inArray(k, rules[i]) == -1)
												rules[i].push(k + '');

										// remove the range indicator
										rules[i].splice(j, 1);

									}

								}

							// iterate through the items in the rule
							// and make sure that numbers are numbers
							for (j = 0; j < rules[i].length; j++)
								rules[i][j] = (isNaN(to_int(rules[i][j])) ? rules[i][j] : to_int(rules[i][j]));

						}

						// add to the correct list of processed rules
						// first time we're doing disabled dates,
						if (l === 0)
							disabled_dates.push(rules);

						// second time we're doing enabled_dates
						else
							enabled_dates.push(rules);

					});

			}

			var
					// cache the current system date
					date = new Date(),
					// when the date picker's starting date depends on the value of another date picker, this value will be
					// set by the other date picker
					// this value will be used as base for all calculations (if not set, will be the same as the current
					// system date)
					reference_date = (!plugin.settings.reference_date ? ($element.data('zdp_reference_date') && undefined !== $element.data('zdp_reference_date') ? $element.data('zdp_reference_date') : date) : plugin.settings.reference_date),
					tmp_start_date, tmp_end_date;

			// reset these values here as this method might be called more than once during a date picker's lifetime
			// (when the selectable dates depend on the values from another date picker)
			start_date = undefined;
			end_date = undefined;

			// extract the date parts
			// also, save the current system month/day/year - we'll use them to highlight the current system date
			first_selectable_month = reference_date.getMonth();
			current_system_month = date.getMonth();
			first_selectable_year = reference_date.getFullYear();
			current_system_year = date.getFullYear();
			first_selectable_day = reference_date.getDate();
			current_system_day = date.getDate();

			// check if the calendar has any restrictions

			// calendar is future-only, starting today
			// it means we have a starting date (the current system date), but no ending date
			if (plugin.settings.direction === true)
				start_date = reference_date;

			// calendar is past only, ending today
			else if (plugin.settings.direction === false) {

				// it means we have an ending date (the reference date), but no starting date
				end_date = reference_date;

				// extract the date parts
				last_selectable_month = end_date.getMonth();
				last_selectable_year = end_date.getFullYear();
				last_selectable_day = end_date.getDate();

			} else if (
					// if direction is not given as an array and the value is an integer > 0
							(!$.isArray(plugin.settings.direction) && is_integer(plugin.settings.direction) && to_int(plugin.settings.direction) > 0) ||
							// or direction is given as an array
									($.isArray(plugin.settings.direction) && (
											// and first entry is a valid date
													(tmp_start_date = check_date(plugin.settings.direction[0])) ||
													// or a boolean TRUE
													plugin.settings.direction[0] === true ||
													// or an integer > 0
															(is_integer(plugin.settings.direction[0]) && plugin.settings.direction[0] > 0)

															) && (
													// and second entry is a valid date
															(tmp_end_date = check_date(plugin.settings.direction[1])) ||
															// or a boolean FALSE
															plugin.settings.direction[1] === false ||
															// or integer >= 0
																	(is_integer(plugin.settings.direction[1]) && plugin.settings.direction[1] >= 0)

																	))

													) {

												// if an exact starting date was given, use that as a starting date
												if (tmp_start_date)
													start_date = tmp_start_date;

												// otherwise
												else
													// figure out the starting date
													// use the Date object to normalize the date
													// for example, 2011 05 33 will be transformed to 2011 06 02
													start_date = new Date(
															first_selectable_year,
															first_selectable_month,
															first_selectable_day + (!$.isArray(plugin.settings.direction) ? to_int(plugin.settings.direction) : to_int(plugin.settings.direction[0] === true ? 0 : plugin.settings.direction[0]))
															);

												// re-extract the date parts
												first_selectable_month = start_date.getMonth();
												first_selectable_year = start_date.getFullYear();
												first_selectable_day = start_date.getDate();

												// if an exact ending date was given and the date is after the starting date, use that as a ending date
												if (tmp_end_date && +tmp_end_date >= +start_date)
													end_date = tmp_end_date;

												// if have information about the ending date
												else if (!tmp_end_date && plugin.settings.direction[1] !== false && $.isArray(plugin.settings.direction))
													// figure out the ending date
													// use the Date object to normalize the date
													// for example, 2011 05 33 will be transformed to 2011 06 02
													end_date = new Date(
															first_selectable_year,
															first_selectable_month,
															first_selectable_day + to_int(plugin.settings.direction[1])
															);

												// if a valid ending date exists
												if (end_date) {

													// extract the date parts
													last_selectable_month = end_date.getMonth();
													last_selectable_year = end_date.getFullYear();
													last_selectable_day = end_date.getDate();

												}

											} else if (
													// if direction is not given as an array and the value is an integer < 0
															(!$.isArray(plugin.settings.direction) && is_integer(plugin.settings.direction) && to_int(plugin.settings.direction) < 0) ||
															// or direction is given as an array
																	($.isArray(plugin.settings.direction) && (
																			// and first entry is boolean FALSE
																			plugin.settings.direction[0] === false ||
																			// or an integer < 0
																					(is_integer(plugin.settings.direction[0]) && plugin.settings.direction[0] < 0)

																					) && (
																			// and second entry is a valid date
																					(tmp_start_date = check_date(plugin.settings.direction[1])) ||
																					// or an integer >= 0
																							(is_integer(plugin.settings.direction[1]) && plugin.settings.direction[1] >= 0)

																							))

																			) {

																		// figure out the ending date
																		// use the Date object to normalize the date
																		// for example, 2011 05 33 will be transformed to 2011 06 02
																		end_date = new Date(
																				first_selectable_year,
																				first_selectable_month,
																				first_selectable_day + (!$.isArray(plugin.settings.direction) ? to_int(plugin.settings.direction) : to_int(plugin.settings.direction[0] === false ? 0 : plugin.settings.direction[0]))
																				);

																		// re-extract the date parts
																		last_selectable_month = end_date.getMonth();
																		last_selectable_year = end_date.getFullYear();
																		last_selectable_day = end_date.getDate();

																		// if an exact starting date was given, and the date is before the ending date, use that as a starting date
																		if (tmp_start_date && +tmp_start_date < +end_date)
																			start_date = tmp_start_date;

																		// if have information about the starting date
																		else if (!tmp_start_date && $.isArray(plugin.settings.direction))
																			// figure out the staring date
																			// use the Date object to normalize the date
																			// for example, 2011 05 33 will be transformed to 2011 06 02
																			start_date = new Date(
																					last_selectable_year,
																					last_selectable_month,
																					last_selectable_day - to_int(plugin.settings.direction[1])
																					);

																		// if a valid starting date exists
																		if (start_date) {

																			// extract the date parts
																			first_selectable_month = start_date.getMonth();
																			first_selectable_year = start_date.getFullYear();
																			first_selectable_day = start_date.getDate();

																		}

																		// if there are disabled dates
																	} else if ($.isArray(plugin.settings.disabled_dates) && plugin.settings.disabled_dates.length > 0)
																		// iterate through the rules for disabling dates
																		for (var interval in disabled_dates)
																			// only if there is a rule that disables *everything*
																			if (disabled_dates[interval][0] == '*' && disabled_dates[interval][1] == '*' && disabled_dates[interval][2] == '*' && disabled_dates[interval][3] == '*') {

																				var tmpDates = [];

																				// iterate through the rules for enabling dates
																				// looking for the minimum/maximum selectable date (if it's the case)
																				$.each(enabled_dates, function() {

																					var rule = this;

																					// if the rule doesn't apply to all years
																					if (rule[2][0] != '*')
																						// format date and store it in our stack
																						tmpDates.push(parseInt(
																								rule[2][0] +
																								(rule[1][0] == '*' ? '12' : str_pad(rule[1][0], 2)) +
																								(rule[0][0] == '*' ? (rule[1][0] == '*' ? '31' : new Date(rule[2][0], rule[1][0], 0).getDate()) : str_pad(rule[0][0], 2)), 10));

																				});

																				// sort dates ascending
																				tmpDates.sort();

																				// if we have any rules
																				if (tmpDates.length > 0) {

																					// get date parts
																					var matches = (tmpDates[0] + '').match(/([0-9]{4})([0-9]{2})([0-9]{2})/);

																					// assign the date parts to the appropriate variables
																					first_selectable_year = parseInt(matches[1], 10);
																					first_selectable_month = parseInt(matches[2], 10) - 1;
																					first_selectable_day = parseInt(matches[3], 10);

																				}

																				// don't look further
																				break;

																			}

																	// if first selectable date exists but is disabled, find the actual first selectable date
																	if (is_disabled(first_selectable_year, first_selectable_month, first_selectable_day)) {

																		// loop until we find the first selectable year
																		while (is_disabled(first_selectable_year)) {

																			// if calendar is past-only,
																			if (!start_date) {

																				// decrement the year
																				first_selectable_year--;

																				// because we've changed years, reset the month to December
																				first_selectable_month = 11;

																				// otherwise
																			} else {

																				// increment the year
																				first_selectable_year++;

																				// because we've changed years, reset the month to January
																				first_selectable_month = 0;

																			}

																		}

																		// loop until we find the first selectable month
																		while (is_disabled(first_selectable_year, first_selectable_month)) {

																			// if calendar is past-only
																			if (!start_date) {

																				// decrement the month
																				first_selectable_month--;

																				// because we've changed months, reset the day to the last day of the month
																				first_selectable_day = new Date(first_selectable_year, first_selectable_month + 1, 0).getDate();

																				// otherwise
																			} else {

																				// increment the month
																				first_selectable_month++;

																				// because we've changed months, reset the day to the first day of the month
																				first_selectable_day = 1;

																			}

																			// if we moved to a following year
																			if (first_selectable_month > 11) {

																				// increment the year
																				first_selectable_year++;

																				// reset the month to January
																				first_selectable_month = 0;

																				// because we've changed months, reset the day to the first day of the month
																				first_selectable_day = 1;

																				// if we moved to a previous year
																			} else if (first_selectable_month < 0) {

																				// decrement the year
																				first_selectable_year--;

																				// reset the month to December
																				first_selectable_month = 11;

																				// because we've changed months, reset the day to the last day of the month
																				first_selectable_day = new Date(first_selectable_year, first_selectable_month + 1, 0).getDate();

																			}

																		}

																		// loop until we find the first selectable day
																		while (is_disabled(first_selectable_year, first_selectable_month, first_selectable_day)) {

																			// if calendar is past-only, decrement the day
																			if (!start_date)
																				first_selectable_day--;

																			// otherwise, increment the day
																			else
																				first_selectable_day++;

																			// use the Date object to normalize the date
																			// for example, 2011 05 33 will be transformed to 2011 06 02
																			date = new Date(first_selectable_year, first_selectable_month, first_selectable_day);

																			// re-extract date parts from the normalized date
																			// as we use them in the current loop
																			first_selectable_year = date.getFullYear();
																			first_selectable_month = date.getMonth();
																			first_selectable_day = date.getDate();

																		}

																		// use the Date object to normalize the date
																		// for example, 2011 05 33 will be transformed to 2011 06 02
																		date = new Date(first_selectable_year, first_selectable_month, first_selectable_day);

																		// re-extract date parts from the normalized date
																		// as we use them in the current loop
																		first_selectable_year = date.getFullYear();
																		first_selectable_month = date.getMonth();
																		first_selectable_day = date.getDate();

																	}

																	// get the default date, from the element, and check if it represents a valid date, according to the required format
																	var default_date = check_date($element.val() || (plugin.settings.start_date ? plugin.settings.start_date : ''));

																	// if there is a default date, date picker is in "strict" mode, and the default date is disabled
																	if (default_date && plugin.settings.strict && is_disabled(default_date.getFullYear(), default_date.getMonth(), default_date.getDate()))
																		// clear the value of the parent element
																		$element.val('');

																	// updates value for the date picker whose starting date depends on the selected date (if any)
																	if (!update)
																		update_dependent(start_date);

																	// if date picker is not always visible
																	if (!plugin.settings.always_visible) {

																		// if we're just creating the date picker
																		if (!update) {

																			// if a calendar icon should be added to the element the plugin is attached to, create the icon now
																			if (plugin.settings.show_icon) {

																				// strangely, in Firefox 21+ (or maybe even earlier) input elements have their "display" property
																				// set to "inline" instead of "inline-block" as do all the other browsers.
																				// because this behavior brakes the positioning of the icon, we'll set the "display" property to
																				// "inline-block" before anything else;
																				if (browser.name == 'firefox' && $element.is('input[type="text"]') && $element.css('display') == 'inline')
																					$element.css('display', 'inline-block');

																				// we create a wrapper for the parent element so that we can later position the icon
																				// also, make sure the wrapper inherits some important css properties of the parent element
																				var icon_wrapper = jQuery('<span class="Zebra_DatePicker_Icon_Wrapper"></span>').css({
																					'display': $element.css('display'),
																					'position': $element.css('position') == 'static' ? 'relative' : $element.css('position'),
																					'float': $element.css('float'),
																					'top': $element.css('top'),
																					'right': $element.css('right'),
																					'bottom': $element.css('bottom'),
																					'left': $element.css('left')
																				});

																				// put wrapper around the element
																				// also, make sure we set some important css properties for it
																				$element.wrap(icon_wrapper).css({
																					'position': 'relative',
																					'top': 'auto',
																					'right': 'auto',
																					'bottom': 'auto',
																					'left': 'auto'
																				});

																				// create the actual calendar icon (show a disabled icon if the element is disabled)
																				icon = jQuery('<button type="button" class="Zebra_DatePicker_Icon' + ($element.attr('disabled') == 'disabled' ? ' Zebra_DatePicker_Icon_Disabled' : '') + '">Pick a date</button>');

																				// a reference to the icon, as a global property
																				plugin.icon = icon;

																				// the date picker will open when clicking both the icon and the element the plugin is attached to
																				clickables = icon.add($element);

																				// if calendar icon is not visible, the date picker will open when clicking the element
																			} else
																				clickables = $element;

																			// attach the click event to the clickable elements (icon and/or element)
																			clickables.bind('click', function(e) {

																				e.preventDefault();

																				// if element is not disabled
																				if (!$element.attr('disabled'))
																					// if the date picker is visible, hide it
																					if (datepicker.css('display') != 'none')
																						plugin.hide();

																					// if the date picker is not visible, show it
																					else
																						plugin.show();

																			});

																			// if icon exists, inject it into the DOM, right after the parent element (and inside the wrapper)
																			if (undefined !== icon)
																				icon.insertAfter($element);

																		}

																		// if calendar icon exists
																		if (undefined !== icon) {

																			// needed when updating: remove any inline style set previously by library,
																			// so we get the right values below
																			icon.attr('style', '');

																			// if calendar icon is to be placed *inside* the element
																			// add an extra class to the icon
																			if (plugin.settings.inside)
																				icon.addClass('Zebra_DatePicker_Icon_Inside');

																			var
																					// get element' width and height (including margins)
																					element_width = $element.outerWidth(),
																					element_height = $element.outerHeight(),
																					element_margin_left = parseInt($element.css('marginLeft'), 10) || 0,
																					element_margin_top = parseInt($element.css('marginTop'), 10) || 0,
																					// get icon's width, height and margins
																					icon_width = icon.outerWidth(),
																					icon_height = icon.outerHeight(),
																					icon_margin_left = parseInt(icon.css('marginLeft'), 10) || 0,
																					icon_margin_right = parseInt(icon.css('marginRight'), 10) || 0;

																			// if icon is to be placed *inside* the element
																			// position the icon accordingly
																			if (plugin.settings.inside)
																				icon.css({
																					'top': element_margin_top + ((element_height - icon_height) / 2),
																					'left': element_margin_left + (element_width - icon_width - icon_margin_right)
																				});

																			// if icon is to be placed to the right of the element
																			// position the icon accordingly
																			else
																				icon.css({
																					'top': element_margin_top + ((element_height - icon_height) / 2),
																					'left': element_margin_left + element_width + icon_margin_left
																				});

																		}

																	}

																	// if the "Today" button is to be shown and it makes sense to be shown
																	// (the "days" view is available and "today" is not a disabled date)
																	show_select_today = (plugin.settings.show_select_today !== false && $.inArray('days', views) > -1 && !is_disabled(current_system_year, current_system_month, current_system_day) ? plugin.settings.show_select_today : false);

																	// if we just needed to recompute the things above, return now
																	if (update)
																		return;

																	// update icon/date picker position on resize
																	$(window).bind('resize.Zebra_DatePicker', function() {

																		// hide the date picker
																		plugin.hide();

																		// if the icon is visible, update its position as the parent element might have changed position
																		if (icon !== undefined) {

																			// we use timeouts so that we do not call the "update" method on *every* step of the resize event

																			// clear a previously set timeout
																			clearTimeout(timeout);

																			// set timeout again
																			timeout = setTimeout(function() {

																				// update the date picker
																				plugin.update();

																			}, 100);

																		}

																	});

																	// generate the container that will hold everything
																	var html = '' +
																			'<div class="Zebra_DatePicker">' +
																			'<table class="dp_header">' +
																			'<tr>' +
																			'<td class="dp_previous">' + plugin.settings.header_navigation[0] + '</td>' +
																			'<td class="dp_caption">&#032;</td>' +
																			'<td class="dp_next">' + plugin.settings.header_navigation[1] + '</td>' +
																			'</tr>' +
																			'</table>' +
																			'<table class="dp_daypicker"></table>' +
																			'<table class="dp_monthpicker"></table>' +
																			'<table class="dp_yearpicker"></table>' +
																			'<table class="dp_footer"><tr>' +
																			'<td class="dp_today"' + (plugin.settings.show_clear_date !== false ? ' style="width:50%"' : '') + '>' + show_select_today + '</td>' +
																			'<td class="dp_clear"' + (show_select_today !== false ? ' style="width:50%"' : '') + '>' + plugin.settings.lang_clear_date + '</td>' +
																			'</tr></table>' +
																			'</div>';

																	// create a jQuery object out of the HTML above and create a reference to it
																	datepicker = $(html);

																	// a reference to the calendar, as a global property
																	plugin.datepicker = datepicker;

																	// create references to the different parts of the date picker
																	header = $('table.dp_header', datepicker);
																	daypicker = $('table.dp_daypicker', datepicker);
																	monthpicker = $('table.dp_monthpicker', datepicker);
																	yearpicker = $('table.dp_yearpicker', datepicker);
																	footer = $('table.dp_footer', datepicker);
																	selecttoday = $('td.dp_today', footer);
																	cleardate = $('td.dp_clear', footer);

																	// if date picker is not always visible
																	if (!plugin.settings.always_visible)
																		// inject the container into the DOM
																		$('body').append(datepicker);

																	// otherwise, if element is not disabled
																	else if (!$element.attr('disabled')) {

																		// inject the date picker into the designated container element
																		plugin.settings.always_visible.append(datepicker);

																		// and make it visible right away
																		plugin.show();

																	}

																	// add the mouseover/mousevents to all to the date picker's cells
																	// except those that are not selectable
																	datepicker.
																			delegate('td:not(.dp_disabled, .dp_weekend_disabled, .dp_not_in_month, .dp_blocked, .dp_week_number)', 'mouseover', function() {
																				$(this).addClass('dp_hover');
																			}).
																			delegate('td:not(.dp_disabled, .dp_weekend_disabled, .dp_not_in_month, .dp_blocked, .dp_week_number)', 'mouseout', function() {
																				$(this).removeClass('dp_hover');
																			});

																	// prevent text highlighting for the text in the header
																	// (for the case when user keeps clicking the "next" and "previous" buttons)
																	disable_text_select($('td', header));

																	// event for when clicking the "previous" button
																	$('.dp_previous', header).bind('click', function() {

																		// if button is not disabled
																		if (!$(this).hasClass('dp_blocked')) {

																			// if view is "months"
																			// decrement year by one
																			if (view == 'months')
																				selected_year--;

																			// if view is "years"
																			// decrement years by 12
																			else if (view == 'years')
																				selected_year -= 12;

																			// if view is "days"
																			// decrement the month and
																			// if month is out of range
																			else if (--selected_month < 0) {

																				// go to the last month of the previous year
																				selected_month = 11;
																				selected_year--;

																			}

																			// generate the appropriate view
																			manage_views();

																		}

																	});

																	// attach a click event to the caption in header
																	$('.dp_caption', header).bind('click', function() {

																		// if current view is "days", take the user to the next view, depending on the format
																		if (view == 'days')
																			view = ($.inArray('months', views) > -1 ? 'months' : ($.inArray('years', views) > -1 ? 'years' : 'days'));

																		// if current view is "months", take the user to the next view, depending on the format
																		else if (view == 'months')
																			view = ($.inArray('years', views) > -1 ? 'years' : ($.inArray('days', views) > -1 ? 'days' : 'months'));

																		// if current view is "years", take the user to the next view, depending on the format
																		else
																			view = ($.inArray('days', views) > -1 ? 'days' : ($.inArray('months', views) > -1 ? 'months' : 'years'));

																		// generate the appropriate view
																		manage_views();

																	});

																	// event for when clicking the "next" button
																	$('.dp_next', header).bind('click', function() {

																		// if button is not disabled
																		if (!$(this).hasClass('dp_blocked')) {

																			// if view is "months"
																			// increment year by 1
																			if (view == 'months')
																				selected_year++;

																			// if view is "years"
																			// increment years by 12
																			else if (view == 'years')
																				selected_year += 12;

																			// if view is "days"
																			// increment the month and
																			// if month is out of range
																			else if (++selected_month == 12) {

																				// go to the first month of the next year
																				selected_month = 0;
																				selected_year++;

																			}

																			// generate the appropriate view
																			manage_views();

																		}

																	});

																	// attach a click event for the cells in the day picker
																	daypicker.delegate('td:not(.dp_disabled, .dp_weekend_disabled, .dp_not_in_month, .dp_week_number)', 'click', function() {

																		// if other months are selectable and currently clicked cell contains a class with the cell's date
																		if (plugin.settings.select_other_months && null !== (matches = $(this).attr('class').match(/date\_([0-9]{4})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])/)))
																			// use the stored date
																			select_date(matches[1], matches[2] - 1, matches[3], 'days', $(this));

																		// put selected date in the element the plugin is attached to, and hide the date picker
																		else
																			select_date(selected_year, selected_month, to_int($(this).html()), 'days', $(this));

																	});

																	// attach a click event for the cells in the month picker
																	monthpicker.delegate('td:not(.dp_disabled)', 'click', function() {

																		// get the month we've clicked on
																		var matches = $(this).attr('class').match(/dp\_month\_([0-9]+)/);

																		// set the selected month
																		selected_month = to_int(matches[1]);

																		// if user can select only years and months
																		if ($.inArray('days', views) == -1)
																			// put selected date in the element the plugin is attached to, and hide the date picker
																			select_date(selected_year, selected_month, 1, 'months', $(this));

																		else {

																			// direct the user to the "days" view
																			view = 'days';

																			// if date picker is always visible
																			// empty the value in the text box the date picker is attached to
																			if (plugin.settings.always_visible)
																				$element.val('');

																			// generate the appropriate view
																			manage_views();

																		}

																	});

																	// attach a click event for the cells in the year picker
																	yearpicker.delegate('td:not(.dp_disabled)', 'click', function() {

																		// set the selected year
																		selected_year = to_int($(this).html());

																		// if user can select only years
																		if ($.inArray('months', views) == -1)
																			// put selected date in the element the plugin is attached to, and hide the date picker
																			select_date(selected_year, 1, 1, 'years', $(this));

																		else {

																			// direct the user to the "months" view
																			view = 'months';

																			// if date picker is always visible
																			// empty the value in the text box the date picker is attached to
																			if (plugin.settings.always_visible)
																				$element.val('');

																			// generate the appropriate view
																			manage_views();

																		}

																	});

																	// function to execute when the "Today" button is clicked
																	$(selecttoday).bind('click', function(e) {

																		e.preventDefault();

																		// select the current date
																		select_date(current_system_year, current_system_month, current_system_day, 'days', $('.dp_current', daypicker));

																		// if date picker is always visible
																		if (plugin.settings.always_visible)
																			// repaint the datepicker so it centers on the currently selected date
																			plugin.show();

																		// hide the date picker
																		plugin.hide();

																	});

																	// function to execute when the "Clear" button is clicked
																	$(cleardate).bind('click', function(e) {

																		e.preventDefault();

																		// clear the element's value
																		$element.val('');

																		// if date picker is not always visible
																		if (!plugin.settings.always_visible) {

																			// reset these values
																			default_day = null;
																			default_month = null;
																			default_year = null;
																			selected_month = null;
																			selected_year = null;

																			// if date picker is always visible
																		} else {

																			// reset these values
																			default_day = null;
																			default_month = null;
																			default_year = null;

																			// remove the "selected" class from all cells that have it
																			$('td.dp_selected', datepicker).removeClass('dp_selected');

																		}

																		// hide the date picker
																		plugin.hide();

																		// if a callback function exists for when clearing a date
																		if (plugin.settings.onClear && typeof plugin.settings.onClear == 'function')
																			// execute the callback function and pass as argument the element the plugin is attached to
																			plugin.settings.onClear($element);

																	});

																	// if date picker is not always visible
																	if (!plugin.settings.always_visible)
																		// bind some events to the document
																		$(document).bind({
																			//whenever anything is clicked on the page
																			'mousedown.Zebra_DatePicker': function(e) {

																				// if the date picker is visible
																				if (datepicker.css('display') == 'block') {

																					// if the calendar icon is visible and we clicked it, let the onClick event of the icon to handle the event
																					// (we want it to toggle the date picker)
																					if (plugin.settings.show_icon && $(e.target).get(0) === icon.get(0))
																						return true;

																					// if what's clicked is not inside the date picker
																					// hide the date picker
																					if ($(e.target).parents().filter('.Zebra_DatePicker').length === 0)
																						plugin.hide();

																				}

																			},
																			//whenever a key is pressed on the page
																			'keyup.Zebra_DatePicker': function(e) {

																				// if the date picker is visible
																				// and the pressed key is ESC
																				// hide the date picker
																				if (datepicker.css('display') == 'block' && e.which == 27)
																					plugin.hide();

																			}

																		});

																	// last thing is to pre-render some of the date picker right away
																	manage_views();

																};

																/**
																 *  Destroys the date picker.
																 *
																 *  @return void
																 */
																plugin.destroy = function() {

																	// remove the attached icon (if it exists)...
																	if (undefined !== plugin.icon)
																		plugin.icon.remove();

																	// ...and the calendar
																	plugin.datepicker.remove();

																	// remove associated event handlers from the document
																	$(document).unbind('keyup.Zebra_DatePicker');
																	$(document).unbind('mousedown.Zebra_DatePicker');
																	$(window).unbind('resize.Zebra_DatePicker');

																	// remove association with the element
																	$element.removeData('Zebra_DatePicker');

																};

																/**
																 *  Hides the date picker.
																 *
																 *  @return void
																 */
																plugin.hide = function() {

																	// if date picker is not always visible
																	if (!plugin.settings.always_visible) {

																		// hide the iFrameShim in Internet Explorer 6
																		iframeShim('hide');

																		// hide the date picker
																		datepicker.hide();

																	}

																};

																/**
																 *  Shows the date picker.
																 *
																 *  @return void
																 */
																plugin.show = function() {

																	// always show the view defined in settings
																	view = plugin.settings.view;

																	// get the default date, from the element, and check if it represents a valid date, according to the required format
																	var default_date = check_date($element.val() || (plugin.settings.start_date ? plugin.settings.start_date : ''));

																	// if the value represents a valid date
																	if (default_date) {

																		// extract the date parts
																		// we'll use these to highlight the default date in the date picker and as starting point to
																		// what year and month to start the date picker with
																		// why separate values? because selected_* will change as user navigates within the date picker
																		default_month = default_date.getMonth();
																		selected_month = default_date.getMonth();
																		default_year = default_date.getFullYear();
																		selected_year = default_date.getFullYear();
																		default_day = default_date.getDate();

																		// if the default date represents a disabled date
																		if (is_disabled(default_year, default_month, default_day)) {

																			// if date picker is in "strict" mode, clear the value of the parent element
																			if (plugin.settings.strict)
																				$element.val('');

																			// the calendar will start with the first selectable year/month
																			selected_month = first_selectable_month;
																			selected_year = first_selectable_year;

																		}

																		// if a default value is not available, or value does not represent a valid date
																	} else {

																		// the calendar will start with the first selectable year/month
																		selected_month = first_selectable_month;
																		selected_year = first_selectable_year;

																	}

																	// generate the appropriate view
																	manage_views();

																	// if date picker is not always visible and the calendar icon is visible
																	if (!plugin.settings.always_visible) {

																		var
																				// get the date picker width and height
																				datepicker_width = datepicker.outerWidth(),
																				datepicker_height = datepicker.outerHeight(),
																				// compute the date picker's default left and top
																				// this will be computed relative to the icon's top-right corner (if the calendar icon exists), or
																				// relative to the element's top-right corner otherwise, to which the offsets given at initialization
																				// are added/subtracted
																				left = (undefined !== icon ? icon.offset().left + icon.outerWidth(true) : $element.offset().left + $element.outerWidth(true)) + plugin.settings.offset[0],
																				top = (undefined !== icon ? icon.offset().top : $element.offset().top) - datepicker_height + plugin.settings.offset[1],
																				// get browser window's width and height
																				window_width = $(window).width(),
																				window_height = $(window).height(),
																				// get browser window's horizontal and vertical scroll offsets
																				window_scroll_top = $(window).scrollTop(),
																				window_scroll_left = $(window).scrollLeft();

																		// if date picker is outside the viewport, adjust its position so that it is visible
																		if (left + datepicker_width > window_scroll_left + window_width)
																			left = window_scroll_left + window_width - datepicker_width;
																		if (left < window_scroll_left)
																			left = window_scroll_left;
																		if (top + datepicker_height > window_scroll_top + window_height)
																			top = window_scroll_top + window_height - datepicker_height;
																		if (top < window_scroll_top)
																			top = window_scroll_top;

																		// make the date picker visible
																		datepicker.css({
																			'left': left,
																			'top': top
																		});

																		// fade-in the date picker
																		// for Internet Explorer < 9 show the date picker instantly or fading alters the font's weight
																		datepicker.fadeIn(browser.name == 'explorer' && browser.version < 9 ? 0 : 150, 'linear');

																		// show the iFrameShim in Internet Explorer 6
																		iframeShim();

																		// if date picker is always visible, show it
																	} else
																		datepicker.show();

																};

																/**
																 *  Updates the configuration options given as argument
																 *
																 *  @param  object  values  An object containing any number of configuration options to be updated
																 *
																 *  @return void
																 */
																plugin.update = function(values) {

																	// if original direction not saved, save it now
																	if (plugin.original_direction)
																		plugin.original_direction = plugin.direction;

																	// update configuration options
																	plugin.settings = $.extend(plugin.settings, values);

																	// reinitialize the object with the new options
																	init(true);

																};

																/**
																 *  Checks if a string represents a valid date according to the format defined by the "format" property.
																 *
																 *  @param  string  str_date    A string representing a date, formatted accordingly to the "format" property.
																 *                              For example, if "format" is "Y-m-d" the string should look like "2011-06-01"
																 *
																 *  @return mixed               Returns a JavaScript Date object if string represents a valid date according
																 *                              formatted according to the "format" property, or FALSE otherwise.
																 *
																 *  @access private
																 */
																var check_date = function(str_date) {

																	// treat argument as a string
																	str_date += '';

																	// if value is given
																	if ($.trim(str_date) !== '') {

																		var
																				// prepare the format by removing white space from it
																				// and also escape characters that could have special meaning in a regular expression
																				format = escape_regexp(plugin.settings.format),
																				// allowed characters in date's format
																				format_chars = ['d', 'D', 'j', 'l', 'N', 'S', 'w', 'F', 'm', 'M', 'n', 'Y', 'y'],
																				// "matches" will contain the characters defining the date's format
																				matches = [],
																				// "regexp" will contain the regular expression built for each of the characters used in the date's format
																				regexp = [],
																				// "position" will contain the position of the caracter found in the date's format
																				position = null,
																				// "segments" will contain the matches of the regular expression
																				segments = null;

																		// iterate through the allowed characters in date's format
																		for (var i = 0; i < format_chars.length; i++)
																			// if character is found in the date's format
																			if ((position = format.indexOf(format_chars[i])) > -1)
																				// save it, alongside the character's position
																				matches.push({character: format_chars[i], position: position});

																		// sort characters defining the date's format based on their position, ascending
																		matches.sort(function(a, b) {
																			return a.position - b.position;
																		});

																		// iterate through the characters defining the date's format
																		$.each(matches, function(index, match) {

																			// add to the array of regular expressions, based on the character
																			switch (match.character) {

																				case 'd':
																					regexp.push('0[1-9]|[12][0-9]|3[01]');
																					break;
																				case 'D':
																					regexp.push('[a-z]{3}');
																					break;
																				case 'j':
																					regexp.push('[1-9]|[12][0-9]|3[01]');
																					break;
																				case 'l':
																					regexp.push('[a-z]+');
																					break;
																				case 'N':
																					regexp.push('[1-7]');
																					break;
																				case 'S':
																					regexp.push('st|nd|rd|th');
																					break;
																				case 'w':
																					regexp.push('[0-6]');
																					break;
																				case 'F':
																					regexp.push('[a-z]+');
																					break;
																				case 'm':
																					regexp.push('0[1-9]|1[012]+');
																					break;
																				case 'M':
																					regexp.push('[a-z]{3}');
																					break;
																				case 'n':
																					regexp.push('[1-9]|1[012]');
																					break;
																				case 'Y':
																					regexp.push('[0-9]{4}');
																					break;
																				case 'y':
																					regexp.push('[0-9]{2}');
																					break;

																			}

																		});

																		// if we have an array of regular expressions
																		if (regexp.length) {

																			// we will replace characters in the date's format in reversed order
																			matches.reverse();

																			// iterate through the characters in date's format
																			$.each(matches, function(index, match) {

																				// replace each character with the appropriate regular expression
																				format = format.replace(match.character, '(' + regexp[regexp.length - index - 1] + ')');

																			});

																			// the final regular expression
																			regexp = new RegExp('^' + format + '$', 'ig');

																			// if regular expression was matched
																			if ((segments = regexp.exec(str_date))) {

																				// check if date is a valid date (i.e. there's no February 31)

																				var tmpdate = new Date(),
																						original_day = tmpdate.getDate(),
																						original_month = tmpdate.getMonth() + 1,
																						original_year = tmpdate.getFullYear(),
																						english_days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
																						english_months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
																						iterable,
																						// by default, we assume the date is valid
																						valid = true;

																				// reverse back the characters in the date's format
																				matches.reverse();

																				// iterate through the characters in the date's format
																				$.each(matches, function(index, match) {

																					// if the date is not valid, don't look further
																					if (!valid)
																						return true;

																					// based on the character
																					switch (match.character) {

																						case 'm':
																						case 'n':

																							// extract the month from the value entered by the user
																							original_month = to_int(segments[index + 1]);

																							break;

																						case 'd':
																						case 'j':

																							// extract the day from the value entered by the user
																							original_day = to_int(segments[index + 1]);

																							break;

																						case 'D':
																						case 'l':
																						case 'F':
																						case 'M':

																							// if day is given as day name, we'll check against the names in the used languages
																							if (match.character == 'D' || match.character == 'l')
																								iterable = plugin.settings.days;

																							// if month is given as month name, we'll check against the names in the used languages
																							else
																								iterable = plugin.settings.months;

																							// by default, we assume the day or month was not entered correctly
																							valid = false;

																							// iterate through the month/days in the used languages
																							$.each(iterable, function(key, value) {

																								// if month/day was entered correctly, don't look further
																								if (valid)
																									return true;

																								// if month/day was entered correctly
																								if (segments[index + 1].toLowerCase() == value.substring(0, (match.character == 'D' || match.character == 'M' ? 3 : value.length)).toLowerCase()) {

																									// extract the day/month from the value entered by the user
																									switch (match.character) {

																										case 'D':
																											segments[index + 1] = english_days[key].substring(0, 3);
																											break;
																										case 'l':
																											segments[index + 1] = english_days[key];
																											break;
																										case 'F':
																											segments[index + 1] = english_months[key];
																											original_month = key + 1;
																											break;
																										case 'M':
																											segments[index + 1] = english_months[key].substring(0, 3);
																											original_month = key + 1;
																											break;

																									}

																									// day/month value is valid
																									valid = true;

																								}

																							});

																							break;

																						case 'Y':

																							// extract the year from the value entered by the user
																							original_year = to_int(segments[index + 1]);

																							break;

																						case 'y':

																							// extract the year from the value entered by the user
																							original_year = '19' + to_int(segments[index + 1]);

																							break;

																					}
																				});

																				// if everything is ok so far
																				if (valid) {

																					// generate a Date object using the values entered by the user
																					// (handle also the case when original_month and/or original_day are undefined - i.e date format is "Y-m" or "Y")
																					var date = new Date(original_year, (original_month || 1) - 1, original_day || 1);

																					// if, after that, the date is the same as the date entered by the user
																					if (date.getFullYear() == original_year && date.getDate() == (original_day || 1) && date.getMonth() == ((original_month || 1) - 1))
																						// return the date as JavaScript date object
																						return date;

																				}

																			}

																		}

																		// if script gets this far, return false as something must've went wrong
																		return false;

																	}

																};

																/**
																 *  Prevents the possibility of selecting text on a given element. Used on the "previous" and "next" buttons
																 *  where text might get accidentally selected when user quickly clicks on the buttons.
																 *
																 *  Code by http://chris-barr.com/index.php/entry/disable_text_selection_with_jquery/
																 *
																 *  @param  jQuery Element  el  A jQuery element on which to prevents text selection.
																 *
																 *  @return void
																 *
																 *  @access private
																 */
																var disable_text_select = function(el) {

																	// if browser is Firefox
																	if (browser.name == 'firefox')
																		el.css('MozUserSelect', 'none');

																	// if browser is Internet Explorer
																	else if (browser.name == 'explorer')
																		el.bind('selectstart', function() {
																			return false;
																		});

																	// for the other browsers
																	else
																		el.mousedown(function() {
																			return false;
																		});

																};

																/**
																 *  Escapes special characters in a string, preparing it for use in a regular expression.
																 *
																 *  @param  string  str     The string in which special characters should be escaped.
																 *
																 *  @return string          Returns the string with escaped special characters.
																 *
																 *  @access private
																 */
																var escape_regexp = function(str) {

																	// return string with special characters escaped
																	return str.replace(/([-.,*+?^${}()|[\]\/\\])/g, '\\$1');

																};

																/**
																 *  Formats a JavaScript date object to the format specified by the "format" property.
																 *  Code taken from http://electricprism.com/aeron/calendar/
																 *
																 *  @param  date    date    A valid JavaScript date object
																 *
																 *  @return string          Returns a string containing the formatted date
																 *
																 *  @access private
																 */
																var format = function(date) {

																	var result = '',
																			// extract parts of the date:
																			// day number, 1 - 31
																			j = date.getDate(),
																			// day of the week, 0 - 6, Sunday - Saturday
																			w = date.getDay(),
																			// the name of the day of the week Sunday - Saturday
																			l = plugin.settings.days[w],
																			// the month number, 1 - 12
																			n = date.getMonth() + 1,
																			// the month name, January - December
																			f = plugin.settings.months[n - 1],
																			// the year (as a string)
																			y = date.getFullYear() + '';

																	// iterate through the characters in the format
																	for (var i = 0; i < plugin.settings.format.length; i++) {

																		// extract the current character
																		var chr = plugin.settings.format.charAt(i);

																		// see what character it is
																		switch (chr) {

																			// year as two digits
																			case 'y':
																				y = y.substr(2);

																				// year as four digits
																			case 'Y':
																				result += y;
																				break;

																				// month number, prefixed with 0
																			case 'm':
																				n = str_pad(n, 2);

																				// month number, not prefixed with 0
																			case 'n':
																				result += n;
																				break;

																				// month name, three letters
																			case 'M':
																				f = ($.isArray(plugin.settings.months_abbr) && undefined !== plugin.settings.months_abbr[n - 1] ? plugin.settings.months_abbr[n - 1] : plugin.settings.months[n - 1].substr(0, 3));

																				// full month name
																			case 'F':
																				result += f;
																				break;

																				// day number, prefixed with 0
																			case 'd':
																				j = str_pad(j, 2);

																				// day number not prefixed with 0
																			case 'j':
																				result += j;
																				break;

																				// day name, three letters
																			case 'D':
																				l = ($.isArray(plugin.settings.days_abbr) && undefined !== plugin.settings.days_abbr[w] ? plugin.settings.days_abbr[w] : plugin.settings.days[w].substr(0, 3));

																				// full day name
																			case 'l':
																				result += l;
																				break;

																				// ISO-8601 numeric representation of the day of the week, 1 - 7
																			case 'N':
																				w++;

																				// day of the week, 0 - 6
																			case 'w':
																				result += w;
																				break;

																				// English ordinal suffix for the day of the month, 2 characters
																				// (st, nd, rd or th (works well with j))
																			case 'S':

																				if (j % 10 == 1 && j != '11')
																					result += 'st';

																				else if (j % 10 == 2 && j != '12')
																					result += 'nd';

																				else if (j % 10 == 3 && j != '13')
																					result += 'rd';

																				else
																					result += 'th';

																				break;

																				// this is probably the separator
																			default:
																				result += chr;

																		}

																	}

																	// return formated date
																	return result;

																};

																/**
																 *  Generates the day picker view, and displays it
																 *
																 *  @return void
																 *
																 *  @access private
																 */
																var generate_daypicker = function() {

																	var
																			// get the number of days in the selected month
																			days_in_month = new Date(selected_year, selected_month + 1, 0).getDate(),
																			// get the selected month's starting day (from 0 to 6)
																			first_day = new Date(selected_year, selected_month, 1).getDay(),
																			// how many days are there in the previous month
																			days_in_previous_month = new Date(selected_year, selected_month, 0).getDate(),
																			// how many days are there to be shown from the previous month
																			days_from_previous_month = first_day - plugin.settings.first_day_of_week;

																	// the final value of how many days are there to be shown from the previous month
																	days_from_previous_month = days_from_previous_month < 0 ? 7 + days_from_previous_month : days_from_previous_month;

																	// manage header caption and enable/disable navigation buttons if necessary
																	manage_header(plugin.settings.months[selected_month] + ', ' + selected_year);

																	// start generating the HTML
																	var html = '<tr>';

																	// if a column featuring the number of the week is to be shown
																	if (plugin.settings.show_week_number)
																		// column title
																		html += '<th>' + plugin.settings.show_week_number + '</th>';

																	// name of week days
																	// show the abbreviated day names (or only the first two letters of the full name if no abbreviations are specified)
																	// and also, take in account the value of the "first_day_of_week" property
																	for (var i = 0; i < 7; i++)
																		html += '<th>' + ($.isArray(plugin.settings.days_abbr) && undefined !== plugin.settings.days_abbr[(plugin.settings.first_day_of_week + i) % 7] ? plugin.settings.days_abbr[(plugin.settings.first_day_of_week + i) % 7] : plugin.settings.days[(plugin.settings.first_day_of_week + i) % 7].substr(0, 2)) + '</th>';

																	html += '</tr><tr>';

																	// the calendar shows a total of 42 days
																	for (i = 0; i < 42; i++) {

																		// seven days per row
																		if (i > 0 && i % 7 === 0)
																			html += '</tr><tr>';

																		// if week number is to be shown
																		if (i % 7 === 0 && plugin.settings.show_week_number)
																			// show ISO 8601 week number
																			html += '<td class="dp_week_number">' + getWeekNumber(new Date(selected_year, selected_month, (i - days_from_previous_month + 1))) + '</td>';

																		// the number of the day in month
																		var day = (i - days_from_previous_month + 1);

																		// if dates in previous/next month can be selected, and this is one of those days
																		if (plugin.settings.select_other_months && (i < days_from_previous_month || day > days_in_month)) {

																			// use the Date object to normalize the date
																			// for example, 2011 05 33 will be transformed to 2011 06 02
																			var real_date = new Date(selected_year, selected_month, day),
																					real_year = real_date.getFullYear(),
																					real_month = real_date.getMonth(),
																					real_day = real_date.getDate();

																			// extract normalized date parts and merge them
																			real_date = real_year + str_pad(real_month + 1, 2) + str_pad(real_day, 2);

																		}

																		// if this is a day from the previous month
																		if (i < days_from_previous_month)
																			html += '<td class="' + (plugin.settings.select_other_months && !is_disabled(real_year, real_month, real_day) ? 'dp_not_in_month_selectable date_' + real_date : 'dp_not_in_month') + '">' + (plugin.settings.select_other_months || plugin.settings.show_other_months ? str_pad(days_in_previous_month - days_from_previous_month + i + 1, plugin.settings.zero_pad ? 2 : 0) : '&nbsp;') + '</td>';

																		// if this is a day from the next month
																		else if (day > days_in_month)
																			html += '<td class="' + (plugin.settings.select_other_months && !is_disabled(real_year, real_month, real_day) ? 'dp_not_in_month_selectable date_' + real_date : 'dp_not_in_month') + '">' + (plugin.settings.select_other_months || plugin.settings.show_other_months ? str_pad(day - days_in_month, plugin.settings.zero_pad ? 2 : 0) : '&nbsp;') + '</td>';

																		// if this is a day from the current month
																		else {

																			var
																					// get the week day (0 to 6, Sunday to Saturday)
																					weekday = (plugin.settings.first_day_of_week + i) % 7,
																					class_name = '';

																			// if date needs to be disabled
																			if (is_disabled(selected_year, selected_month, day)) {

																				// if day is in weekend
																				if ($.inArray(weekday, plugin.settings.weekend_days) > -1)
																					class_name = 'dp_weekend_disabled';

																				// if work day
																				else
																					class_name += ' dp_disabled';

																				// highlight the current system date
																				if (selected_month == current_system_month && selected_year == current_system_year && current_system_day == day)
																					class_name += ' dp_disabled_current';

																				// if there are no restrictions
																			} else {

																				// if day is in weekend
																				if ($.inArray(weekday, plugin.settings.weekend_days) > -1)
																					class_name = 'dp_weekend';

																				// highlight the currently selected date
																				if (selected_month == default_month && selected_year == default_year && default_day == day)
																					class_name += ' dp_selected';

																				// highlight the current system date
																				if (selected_month == current_system_month && selected_year == current_system_year && current_system_day == day)
																					class_name += ' dp_current';

																			}

																			// print the day of the month
																			html += '<td' + (class_name !== '' ? ' class="' + $.trim(class_name) + '"' : '') + '>' + (plugin.settings.zero_pad ? str_pad(day, 2) : day) + '</td>';

																		}

																	}

																	// wrap up generating the day picker
																	html += '</tr>';

																	// inject the day picker into the DOM
																	daypicker.html($(html));

																	// if date picker is always visible
																	if (plugin.settings.always_visible)
																		// cache all the cells
																		// (we need them so that we can easily remove the "dp_selected" class from all of them when user selects a date)
																		daypicker_cells = $('td:not(.dp_disabled, .dp_weekend_disabled, .dp_not_in_month, .dp_blocked, .dp_week_number)', daypicker);

																	// make the day picker visible
																	daypicker.show();

																};

																/**
																 *  Generates the month picker view, and displays it
																 *
																 *  @return void
																 *
																 *  @access private
																 */
																var generate_monthpicker = function() {

																	// manage header caption and enable/disable navigation buttons if necessary
																	manage_header(selected_year);

																	// start generating the HTML
																	var html = '<tr>';

																	// iterate through all the months
																	for (var i = 0; i < 12; i++) {

																		// three month per row
																		if (i > 0 && i % 3 === 0)
																			html += '</tr><tr>';

																		var class_name = 'dp_month_' + i;

																		// if month needs to be disabled
																		if (is_disabled(selected_year, i))
																			class_name += ' dp_disabled';

																		// else, if a date is already selected and this is that particular month, highlight it
																		else if (default_month !== false && default_month == i && selected_year == default_year)
																			class_name += ' dp_selected';

																		// else, if this the current system month, highlight it
																		else if (current_system_month == i && current_system_year == selected_year)
																			class_name += ' dp_current';

																		// first three letters of the month's name
																		html += '<td class="' + $.trim(class_name) + '">' + ($.isArray(plugin.settings.months_abbr) && undefined !== plugin.settings.months_abbr[i] ? plugin.settings.months_abbr[i] : plugin.settings.months[i].substr(0, 3)) + '</td>';

																	}

																	// wrap up
																	html += '</tr>';

																	// inject into the DOM
																	monthpicker.html($(html));

																	// if date picker is always visible
																	if (plugin.settings.always_visible)
																		// cache all the cells
																		// (we need them so that we can easily remove the "dp_selected" class from all of them when user selects a month)
																		monthpicker_cells = $('td:not(.dp_disabled)', monthpicker);

																	// make the month picker visible
																	monthpicker.show();

																};

																/**
																 *  Generates the year picker view, and displays it
																 *
																 *  @return void
																 *
																 *  @access private
																 */
																var generate_yearpicker = function() {

																	// manage header caption and enable/disable navigation buttons if necessary
																	manage_header(selected_year - 7 + ' - ' + (selected_year + 4));

																	// start generating the HTML
																	var html = '<tr>';

																	// we're showing 9 years at a time, current year in the middle
																	for (var i = 0; i < 12; i++) {

																		// three years per row
																		if (i > 0 && i % 3 === 0)
																			html += '</tr><tr>';

																		var class_name = '';

																		// if year needs to be disabled
																		if (is_disabled(selected_year - 7 + i))
																			class_name += ' dp_disabled';

																		// else, if a date is already selected and this is that particular year, highlight it
																		else if (default_year && default_year == selected_year - 7 + i)
																			class_name += ' dp_selected';

																		// else, if this is the current system year, highlight it
																		else if (current_system_year == (selected_year - 7 + i))
																			class_name += ' dp_current';

																		// first three letters of the month's name
																		html += '<td' + ($.trim(class_name) !== '' ? ' class="' + $.trim(class_name) + '"' : '') + '>' + (selected_year - 7 + i) + '</td>';

																	}

																	// wrap up
																	html += '</tr>';

																	// inject into the DOM
																	yearpicker.html($(html));

																	// if date picker is always visible
																	if (plugin.settings.always_visible)
																		// cache all the cells
																		// (we need them so that we can easily remove the "dp_selected" class from all of them when user selects a year)
																		yearpicker_cells = $('td:not(.dp_disabled)', yearpicker);

																	// make the year picker visible
																	yearpicker.show();

																};

																/**
																 *  Generates an iFrame shim in Internet Explorer 6 so that the date picker appears above select boxes.
																 *
																 *  @return void
																 *
																 *  @access private
																 */
																var iframeShim = function(action) {

																	// this is necessary only if browser is Internet Explorer 6
																	if (browser.name == 'explorer' && browser.version == 6) {

																		// if the iFrame was not yet created
																		// "undefined" evaluates as FALSE
																		if (!shim) {

																			// the iFrame has to have the element's zIndex minus 1
																			var zIndex = to_int(datepicker.css('zIndex')) - 1;

																			// create the iFrame
																			shim = jQuery('<iframe>', {
																				'src': 'javascript:document.write("")',
																				'scrolling': 'no',
																				'frameborder': 0,
																				'allowtransparency': 'true',
																				css: {
																					'zIndex': zIndex,
																					'position': 'absolute',
																					'top': -1000,
																					'left': -1000,
																					'width': datepicker.outerWidth(),
																					'height': datepicker.outerHeight(),
																					'filter': 'progid:DXImageTransform.Microsoft.Alpha(opacity=0)',
																					'display': 'none'
																				}
																			});

																			// inject iFrame into DOM
																			$('body').append(shim);

																		}

																		// what do we need to do
																		switch (action) {

																			// hide the iFrame?
																			case 'hide':

																				// set the iFrame's display property to "none"
																				shim.hide();

																				break;

																				// show the iFrame?
																			default:

																				// get date picker top and left position
																				var offset = datepicker.offset();

																				// position the iFrame shim right underneath the date picker
																				// and set its display to "block"
																				shim.css({
																					'top': offset.top,
																					'left': offset.left,
																					'display': 'block'
																				});

																		}

																	}

																};

																/**
																 *  Checks if, according to the restrictions of the calendar and/or the values defined by the "disabled_dates"
																 *  property, a day, a month or a year needs to be disabled.
																 *
																 *  @param  integer     year    The year to check
																 *  @param  integer     month   The month to check
																 *  @param  integer     day     The day to check
																 *
																 *  @return boolean         Returns TRUE if the given value is not disabled or FALSE otherwise
																 *
																 *  @access private
																 */
																var is_disabled = function(year, month, day) {

																	// don't check bogus values
																	if ((undefined === year || isNaN(year)) && (undefined === month || isNaN(month)) && (undefined === day || isNaN(day)))
																		return false;

																	// if calendar has direction restrictions
																	if (!(!$.isArray(plugin.settings.direction) && to_int(plugin.settings.direction) === 0)) {

																		var
																				// normalize and merge arguments then transform the result to an integer
																				now = to_int(str_concat(year, (typeof month != 'undefined' ? str_pad(month, 2) : ''), (typeof day != 'undefined' ? str_pad(day, 2) : ''))),
																				// get the length of the argument
																				len = (now + '').length;

																		// if we're checking days
																		if (len == 8 && (
																				// day is before the first selectable date
																						(typeof start_date != 'undefined' && now < to_int(str_concat(first_selectable_year, str_pad(first_selectable_month, 2), str_pad(first_selectable_day, 2)))) ||
																						// or day is after the last selectable date
																								(typeof end_date != 'undefined' && now > to_int(str_concat(last_selectable_year, str_pad(last_selectable_month, 2), str_pad(last_selectable_day, 2))))

																								// day needs to be disabled
																								))
																			return true;

																		// if we're checking months
																		else if (len == 6 && (
																				// month is before the first selectable month
																						(typeof start_date != 'undefined' && now < to_int(str_concat(first_selectable_year, str_pad(first_selectable_month, 2)))) ||
																						// or day is after the last selectable date
																								(typeof end_date != 'undefined' && now > to_int(str_concat(last_selectable_year, str_pad(last_selectable_month, 2))))

																								// month needs to be disabled
																								))
																			return true;

																		// if we're checking years
																		else if (len == 4 && (
																				// year is before the first selectable year
																						(typeof start_date != 'undefined' && now < first_selectable_year) ||
																						// or day is after the last selectable date
																								(typeof end_date != 'undefined' && now > last_selectable_year)

																								// year needs to be disabled
																								))
																			return true;

																	}

																	// if month is given as argument, increment it (as JavaScript uses 0 for January, 1 for February...)
																	if (typeof month != 'undefined')
																		month = month + 1;

																	// by default, we assume the day/month/year is not enabled nor disabled
																	var disabled = false, enabled = false;

																	// if there are rules for disabling dates
																	if (disabled_dates)
																		// iterate through the rules for disabling dates
																		$.each(disabled_dates, function() {

																			// if the date is to be disabled, don't look any further
																			if (disabled)
																				return;

																			var rule = this;

																			// if the rules apply for the current year
																			if ($.inArray(year, rule[2]) > -1 || $.inArray('*', rule[2]) > -1)
																				// if the rules apply for the current month
																				if ((typeof month != 'undefined' && $.inArray(month, rule[1]) > -1) || $.inArray('*', rule[1]) > -1)
																					// if the rules apply for the current day
																					if ((typeof day != 'undefined' && $.inArray(day, rule[0]) > -1) || $.inArray('*', rule[0]) > -1) {

																						// if day is to be disabled whatever the day
																						// don't look any further
																						if (rule[3] == '*')
																							return (disabled = true);

																						// get the weekday
																						var weekday = new Date(year, month - 1, day).getDay();

																						// if weekday is to be disabled
																						// don't look any further
																						if ($.inArray(weekday, rule[3]) > -1)
																							return (disabled = true);

																					}

																		});

																	// if there are rules that explicitly enable dates
																	if (enabled_dates)
																		// iterate through the rules for enabling dates
																		$.each(enabled_dates, function() {

																			// if the date is to be enabled, don't look any further
																			if (enabled)
																				return;

																			var rule = this;

																			// if the rules apply for the current year
																			if ($.inArray(year, rule[2]) > -1 || $.inArray('*', rule[2]) > -1) {

																				// the year is enabled
																				enabled = true;

																				// if we're also checking months
																				if (typeof month != 'undefined') {

																					// we assume the month is enabled
																					enabled = true;

																					// if the rules apply for the current month
																					if ($.inArray(month, rule[1]) > -1 || $.inArray('*', rule[1]) > -1) {

																						// if we're also checking days
																						if (typeof day != 'undefined') {

																							// we assume the day is enabled
																							enabled = true;

																							// if the rules apply for the current day
																							if ($.inArray(day, rule[0]) > -1 || $.inArray('*', rule[0]) > -1) {

																								// if day is to be enabled whatever the day
																								// don't look any further
																								if (rule[3] == '*')
																									return (enabled = true);

																								// get the weekday
																								var weekday = new Date(year, month - 1, day).getDay();

																								// if weekday is to be enabled
																								// don't look any further
																								if ($.inArray(weekday, rule[3]) > -1)
																									return (enabled = true);

																								// if we get this far, it means the day is not enabled
																								enabled = false;

																								// if day is not enabled
																							} else
																								enabled = false;

																						}

																						// if month is not enabled
																					} else
																						enabled = false;

																				}

																			}

																		});

																	// if checked date is enabled, return false
																	if (enabled_dates && enabled)
																		return false;

																	// if checked date is disabled return false
																	else if (disabled_dates && disabled)
																		return true;

																	// if script gets this far it means that the day/month/year doesn't need to be disabled
																	return false;

																};

																/**
																 *  Checks whether a value is an integer number.
																 *
																 *  @param  mixed   value   Value to check
																 *
																 *  @return                 Returns TRUE if the value represents an integer number, or FALSE otherwise
																 *
																 *  @access private
																 */
																var is_integer = function(value) {

																	// return TRUE if value represents an integer number, or FALSE otherwise
																	return (value + '').match(/^\-?[0-9]+$/) ? true : false;

																};

																/**
																 *  Sets the caption in the header of the date picker and enables or disables navigation buttons when necessary.
																 *
																 *  @param  string  caption     String that needs to be displayed in the header
																 *
																 *  @return void
																 *
																 *  @access private
																 */
																var manage_header = function(caption) {

																	// update the caption in the header
																	$('.dp_caption', header).html(caption);

																	// if calendar has direction restrictions or we're looking only at months
																	if (!(!$.isArray(plugin.settings.direction) && to_int(plugin.settings.direction) === 0) || (views.length == 1 && views[0] == 'months')) {

																		// get the current year and month
																		var year = selected_year,
																				month = selected_month,
																				next, previous;

																		// if current view is showing days
																		if (view == 'days') {

																			// check if we can click on the "previous" button
																			previous = !is_disabled(month - 1 < 0 ? str_concat(year - 1, '11') : str_concat(year, str_pad(month - 1, 2)));

																			// check if we can click on the "next" button
																			next = !is_disabled(month + 1 > 11 ? str_concat(year + 1, '00') : str_concat(year, str_pad(month + 1, 2)));

																			// if current view is showing months
																		} else if (view == 'months') {

																			// check if we can click on the "previous" button
																			if (!start_date || start_date.getFullYear() <= year - 1)
																				previous = true;

																			// check if we can click on the "next" button
																			if (!end_date || end_date.getFullYear() >= year + 1)
																				next = true;

																			// if current view is showing years
																		} else if (view == 'years') {

																			// check if we can click on the "previous" button
																			if (!start_date || start_date.getFullYear() < year - 7)
																				previous = true;

																			// check if we can click on the "next" button
																			if (!end_date || end_date.getFullYear() > year + 4)
																				next = true;

																		}

																		// if we cannot click on the "previous" button
																		if (!previous) {

																			// disable the "previous" button
																			$('.dp_previous', header).addClass('dp_blocked');
																			$('.dp_previous', header).removeClass('dp_hover');

																			// otherwise enable the "previous" button
																		} else
																			$('.dp_previous', header).removeClass('dp_blocked');

																		// if we cannot click on the "next" button
																		if (!next) {

																			// disable the "next" button
																			$('.dp_next', header).addClass('dp_blocked');
																			$('.dp_next', header).removeClass('dp_hover');

																			// otherwise enable the "next" button
																		} else
																			$('.dp_next', header).removeClass('dp_blocked');

																	}

																};

																/**
																 *  Shows the appropriate view (days, months or years) according to the current value of the "view" property.
																 *
																 *  @return void
																 *
																 *  @access private
																 */
																var manage_views = function() {

																	// if the day picker was not yet generated
																	if (daypicker.text() === '' || view == 'days') {

																		// if the day picker was not yet generated
																		if (daypicker.text() === '') {

																			// if date picker is not always visible
																			if (!plugin.settings.always_visible)
																				// temporarily set the date picker's left outside of view
																				// so that we can later grab its width and height
																				datepicker.css('left', -1000);

																			// temporarily make the date picker visible
																			// so that we can later grab its width and height
																			datepicker.show();

																			// generate the day picker
																			generate_daypicker();

																			// get the day picker's width and height
																			var width = daypicker.outerWidth(),
																					height = daypicker.outerHeight();

																			// make the month picker have the same size as the day picker
																			monthpicker.css({
																				'width': width,
																				'height': height
																			});

																			// make the year picker have the same size as the day picker
																			yearpicker.css({
																				'width': width,
																				'height': height
																			});

																			// make the header and the footer have the same size as the day picker
																			header.css('width', width);
																			footer.css('width', width);

																			// hide the date picker again
																			datepicker.hide();

																			// if the day picker was previously generated at least once
																			// generate the day picker
																		} else
																			generate_daypicker();

																		// hide the year and the month pickers
																		monthpicker.hide();
																		yearpicker.hide();

																		// if the view is "months"
																	} else if (view == 'months') {

																		// generate the month picker
																		generate_monthpicker();

																		// hide the day and the year pickers
																		daypicker.hide();
																		yearpicker.hide();

																		// if the view is "years"
																	} else if (view == 'years') {

																		// generate the year picker
																		generate_yearpicker();

																		// hide the day and the month pickers
																		daypicker.hide();
																		monthpicker.hide();

																	}

																	// if a callback function exists for when navigating through months/years
																	if (plugin.settings.onChange && typeof plugin.settings.onChange == 'function' && undefined !== view) {

																		// get the "active" elements in the view (ignoring the disabled ones)
																		var elements = (view == 'days' ?
																				daypicker.find('td:not(.dp_disabled, .dp_weekend_disabled, .dp_not_in_month, .dp_blocked)') :
																				(view == 'months' ?
																						monthpicker.find('td:not(.dp_disabled, .dp_weekend_disabled, .dp_not_in_month, .dp_blocked)') :
																						yearpicker.find('td:not(.dp_disabled, .dp_weekend_disabled, .dp_not_in_month, .dp_blocked)')));

																		// iterate through the active elements
																		// and attach a "date" data attribute to each element in the form of
																		// YYYY-MM-DD if the view is "days"
																		// YYYY-MM if the view is "months"
																		// YYYY if the view is "years"
																		// so it's easy to identify elements in the list
																		elements.each(function() {

																			// if view is "days"
																			if (view == 'days') {

																				// if date is from a next/previous month and is selectable
																				if ($(this).hasClass('dp_not_in_month_selectable')) {

																					// extract date from the attached class
																					var matches = $(this).attr('class').match(/date\_([0-9]{4})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])/);

																					// attach a "date" data attribute to each element in the form of of YYYY-MM-DD for easily identifying sought elements
																					$(this).data('date', matches[1] + '-' + matches[2] + '-' + matches[3]);

																					// if date is from the currently selected month
																				} else
																					// attach a "date" data attribute to each element in the form of of YYYY-MM-DD for easily identifying sought elements
																					$(this).data('date', selected_year + '-' + str_pad(selected_month + 1, 2) + '-' + str_pad(to_int($(this).text()), 2));

																				// if view is "months"
																			} else if (view == 'months') {

																				// get the month's number for the element's class
																				var matches = $(this).attr('class').match(/dp\_month\_([0-9]+)/);

																				// attach a "date" data attribute to each element in the form of of YYYY-MM for easily identifying sought elements
																				$(this).data('date', selected_year + '-' + str_pad(to_int(matches[1]) + 1, 2));

																				// if view is "years"
																			} else
																				// attach a "date" data attribute to each element in the form of of YYYY for easily identifying sought elements
																				$(this).data('date', to_int($(this).text()));

																		});

																		// execute the callback function and send as arguments the current view, the elements in the view, and
																		// the element the plugin is attached to
																		plugin.settings.onChange(view, elements, $element);

																	}

																	// assume the footer is visible
																	footer.show();

																	// if the button for clearing a previously selected date needs to be visible all the time,
																	// or the "Clear" button needs to be shown only when a date was previously selected, and now it's the case,
																	// or the date picker is always visible and the "Clear" button was not explicitly disabled
																	if (
																			plugin.settings.show_clear_date === true ||
																			(plugin.settings.show_clear_date === 0 && $element.val() !== '') ||
																			(plugin.settings.always_visible && plugin.settings.show_clear_date !== false)
																			) {

																		// show the "Clear" button
																		cleardate.show();

																		// if the "Today" button is visible
																		if (show_select_today) {

																			// show it, and set it's width to 50% of the available space
																			selecttoday.css('width', '50%');

																			// the "Clear date" button only takes up 50% of the available space
																			cleardate.css('width', '50%');

																			// if the "Today" button is not visible
																		} else {

																			// hide the "Today" button
																			selecttoday.hide();

																			// the "Clear date" button takes up 100% of the available space
																			cleardate.css('width', '100%');

																		}

																		// otherwise
																	} else {

																		// hide the "Clear" button
																		cleardate.hide();

																		// if the "Today" button is visible, it will now take up all the available space
																		if (show_select_today)
																			selecttoday.show().css('width', '100%');

																		// if the "Today" button is also not visible, hide the footer entirely
																		else
																			footer.hide();

																	}


																};

																/**
																 *  Puts the specified date in the element the plugin is attached to, and hides the date picker.
																 *
																 *  @param  integer     year    The year
																 *
																 *  @param  integer     month   The month
																 *
																 *  @param  integer     day     The day
																 *
																 *  @param  string      view    The view from where the method was called
																 *
																 *  @param  object      cell    The element that was clicked
																 *
																 *  @return void
																 *
																 *  @access private
																 */
																var select_date = function(year, month, day, view, cell) {

																	var
																			// construct a new date object from the arguments
																			default_date = new Date(year, month, day, 12, 0, 0),
																			// pointer to the cells in the current view
																			view_cells = (view == 'days' ? daypicker_cells : (view == 'months' ? monthpicker_cells : yearpicker_cells)),
																			// the selected date, formatted correctly
																			selected_value = format(default_date);

																	// set the currently selected and formated date as the value of the element the plugin is attached to
																	$element.val(selected_value);

																	// if date picker is always visible
																	if (plugin.settings.always_visible) {

																		// extract the date parts and reassign values to these variables
																		// so that everything will be correctly highlighted
																		default_month = default_date.getMonth();
																		selected_month = default_date.getMonth();
																		default_year = default_date.getFullYear();
																		selected_year = default_date.getFullYear();
																		default_day = default_date.getDate();

																		// remove the "selected" class from all cells in the current view
																		view_cells.removeClass('dp_selected');

																		// add the "selected" class to the currently selected cell
																		cell.addClass('dp_selected');

																		// if we're on the "days" view and days from other months are selectable and one of those days was
																		// selected, repaint the datepicker so it will take us to the selected month
																		if (view == 'days' && cell.hasClass('dp_not_in_month_selectable'))
																			plugin.show();

																	}

																	// hide the date picker
																	plugin.hide();

																	// updates value for the date picker whose starting date depends on the selected date (if any)
																	update_dependent(default_date);

																	// if a callback function exists for when selecting a date
																	if (plugin.settings.onSelect && typeof plugin.settings.onSelect == 'function')
																		// execute the callback function
																		plugin.settings.onSelect(selected_value, year + '-' + str_pad(month + 1, 2) + '-' + str_pad(day, 2), default_date, $element);

																	// move focus to the element the plugin is attached to
																	$element.focus();

																};

																/**
																 *  Concatenates any number of arguments and returns them as string.
																 *
																 *  @return string  Returns the concatenated values.
																 *
																 *  @access private
																 */
																var str_concat = function() {

																	var str = '';

																	// concatenate as string
																	for (var i = 0; i < arguments.length; i++)
																		str += (arguments[i] + '');

																	// return the concatenated values
																	return str;

																};

																/**
																 *  Left-pad a string to a certain length with zeroes.
																 *
																 *  @param  string  str     The string to be padded.
																 *
																 *  @param  integer len     The length to which the string must be padded
																 *
																 *  @return string          Returns the string left-padded with leading zeroes
																 *
																 *  @access private
																 */
																var str_pad = function(str, len) {

																	// make sure argument is a string
																	str += '';

																	// pad with leading zeroes until we get to the desired length
																	while (str.length < len)
																		str = '0' + str;

																	// return padded string
																	return str;

																};

																/**
																 *  Returns the integer representation of a string
																 *
																 *  @return int     Returns the integer representation of the string given as argument
																 *
																 *  @access private
																 */
																var to_int = function(str) {

																	// return the integer representation of the string given as argument
																	return parseInt(str, 10);

																};

																/**
																 *  Updates the paired date picker (whose starting date depends on the value of the current date picker)
																 *
																 *  @param  date    date    A JavaScript date object representing the currently selected date
																 *
																 *  @return void
																 *
																 *  @access private
																 */
																var update_dependent = function(date) {

																	// if the pair element exists
																	if (plugin.settings.pair) {

																		// iterate through the pair elements (as there may be more than just one)
																		$.each(plugin.settings.pair, function() {

																			var $pair = $(this);

																			// chances are that in the beginning the pair element doesn't have the Zebra_DatePicker attached to it yet
																			// (as the "start" element is usually created before the "end" element)
																			// so we'll have to rely on "data" to send the starting date to the pair element

																			// therefore, if Zebra_DatePicker is not yet attached
																			if (!($pair.data && $pair.data('Zebra_DatePicker')))
																				// set the starting date like this
																				$pair.data('zdp_reference_date', date);

																			// if Zebra_DatePicker is attached to the pair element
																			else {

																				// reference the date picker object attached to the other element
																				var dp = $pair.data('Zebra_DatePicker');

																				// update the other date picker's starting date
																				// the value depends on the original value of the "direction" attribute
																				// (also, if the pair date picker does not have a direction, set it to 1)
																				dp.update({
																					'reference_date': date,
																					'direction': dp.settings.direction === 0 ? 1 : dp.settings.direction
																				});

																				// if the other date picker is always visible, update the visuals now
																				if (dp.settings.always_visible)
																					dp.show();

																			}

																		});

																	}

																};

																/**
																 *  Calculate the ISO 8601 week number for a given date.
																 *
																 *  Code is based on the algorithm at http://www.tondering.dk/claus/cal/week.php#calcweekno
																 */
																var getWeekNumber = function(date) {

																	var y = date.getFullYear(),
																			m = date.getMonth() + 1,
																			d = date.getDate(),
																			a, b, c, s, e, f, g, n, w;

																	// If month jan. or feb.
																	if (m < 3) {

																		a = y - 1;
																		b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
																		c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
																		s = b - c;
																		e = 0;
																		f = d - 1 + 31 * (m - 1);

																		// If month mar. through dec.
																	} else {

																		a = y;
																		b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
																		c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
																		s = b - c;
																		e = s + 1;
																		f = d + ((153 * (m - 3) + 2) / 5 | 0) + 58 + s;

																	}

																	g = (a + b) % 7;
																	// ISO Weekday (0 is monday, 1 is tuesday etc.)
																	d = (f + g - e) % 7;
																	n = f + 3 - d;

																	if (n < 0)
																		w = 53 - ((g - s) / 5 | 0);

																	else if (n > 364 + s)
																		w = 1;

																	else
																		w = (n / 7 | 0) + 1;

																	return w;

																};

																// since with jQuery 1.9.0 the $.browser object was removed, we rely on this piece of code from
																// http://www.quirksmode.org/js/detect.html to detect the browser
																var browser = {
																	init: function() {
																		this.name = this.searchString(this.dataBrowser) || '';
																		this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || '';
																	},
																	searchString: function(data) {
																		for (var i = 0; i < data.length; i++) {
																			var dataString = data[i].string;
																			var dataProp = data[i].prop;
																			this.versionSearchString = data[i].versionSearch || data[i].identity;
																			if (dataString) {
																				if (dataString.indexOf(data[i].subString) != -1)
																					return data[i].identity;
																			}
																			else if (dataProp)
																				return data[i].identity;
																		}
																	},
																	searchVersion: function(dataString) {
																		var index = dataString.indexOf(this.versionSearchString);
																		if (index == -1)
																			return;
																		return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
																	},
																	dataBrowser: [
																		{
																			string: navigator.userAgent,
																			subString: 'Firefox',
																			identity: 'firefox'
																		},
																		{
																			string: navigator.userAgent,
																			subString: 'MSIE',
																			identity: 'explorer',
																			versionSearch: 'MSIE'
																		}
																	]
																};

																browser.init();

																// initialize the plugin
																init();

															};

															$.fn.Zebra_DatePicker = function(options) {

																// iterate through all the elements to which we need to attach the date picker to
																return this.each(function() {

																	// if element has a date picker already attached
																	if (undefined !== $(this).data('Zebra_DatePicker'))
																		// remove the attached date picker
																		$(this).data('Zebra_DatePicker').destroy();

																	// create an instance of the plugin
																	var plugin = new $.Zebra_DatePicker(this, options);

																	// save a reference to the newly created object
																	$(this).data('Zebra_DatePicker', plugin);

																});

															};

														})(jQuery);