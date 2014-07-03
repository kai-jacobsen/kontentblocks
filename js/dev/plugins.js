/*! Kontentblocks DevVersion 2014-07-03 */
!function(a, b) {
    "use strict";
    var c, d = a.document;
    c = function() {
        var c, e, f, g, h, i, j, k, l, m, n, o, p, q = {}, r = {}, s = !1, t = {
            ENTER: 13,
            ESC: 27,
            SPACE: 32
        }, u = [];
        return r = {
            buttons: {
                holder: '<nav class="alertify-buttons">{{buttons}}</nav>',
                submit: '<button type="submit" class="alertify-button alertify-button-ok" id="alertify-ok">{{ok}}</button>',
                ok: '<button class="alertify-button alertify-button-ok" id="alertify-ok">{{ok}}</button>',
                cancel: '<button class="alertify-button alertify-button-cancel" id="alertify-cancel">{{cancel}}</button>'
            },
            input: '<div class="alertify-text-wrapper"><input type="text" class="alertify-text" id="alertify-text"></div>',
            message: '<p class="alertify-message">{{message}}</p>',
            log: '<article class="alertify-log{{class}}">{{message}}</article>'
        }, p = function() {
            var a, c, e = !1, f = d.createElement("fakeelement"), g = {
                WebkitTransition: "webkitTransitionEnd",
                MozTransition: "transitionend",
                OTransition: "otransitionend",
                transition: "transitionend"
            };
            for (a in g) if (f.style[a] !== b) {
                c = g[a], e = !0;
                break;
            }
            return {
                type: c,
                supported: e
            };
        }, c = function(a) {
            return d.getElementById(a);
        }, q = {
            labels: {
                ok: "OK",
                cancel: "Cancel"
            },
            delay: 5e3,
            buttonReverse: !1,
            buttonFocus: "ok",
            transition: b,
            addListeners: function(a) {
                var b, c, i, j, k, l = "undefined" != typeof f, m = "undefined" != typeof e, n = "undefined" != typeof o, p = "", q = this;
                b = function(b) {
                    return "undefined" != typeof b.preventDefault && b.preventDefault(), i(b), "undefined" != typeof o && (p = o.value), 
                    "function" == typeof a && ("undefined" != typeof o ? a(!0, p) : a(!0)), !1;
                }, c = function(b) {
                    return "undefined" != typeof b.preventDefault && b.preventDefault(), i(b), "function" == typeof a && a(!1), 
                    !1;
                }, i = function() {
                    q.hide(), q.unbind(d.body, "keyup", j), q.unbind(g, "focus", k), l && q.unbind(f, "click", b), 
                    m && q.unbind(e, "click", c);
                }, j = function(a) {
                    var d = a.keyCode;
                    (d === t.SPACE && !n || n && d === t.ENTER) && b(a), d === t.ESC && m && c(a);
                }, k = function() {
                    n ? o.focus() : !m || q.buttonReverse ? f.focus() : e.focus();
                }, this.bind(g, "focus", k), this.bind(h, "focus", k), l && this.bind(f, "click", b), 
                m && this.bind(e, "click", c), this.bind(d.body, "keyup", j), this.transition.supported || this.setFocus();
            },
            bind: function(a, b, c) {
                "function" == typeof a.addEventListener ? a.addEventListener(b, c, !1) : a.attachEvent && a.attachEvent("on" + b, c);
            },
            handleErrors: function() {
                if ("undefined" != typeof a.onerror) {
                    var b = this;
                    return a.onerror = function(a, c, d) {
                        b.error("[" + a + " on line " + d + " of " + c + "]", 0);
                    }, !0;
                }
                return !1;
            },
            appendButtons: function(a, b) {
                return this.buttonReverse ? b + a : a + b;
            },
            build: function(a) {
                var b = "", c = a.type, d = a.message, e = a.cssClass || "";
                switch (b += '<div class="alertify-dialog">', b += '<a id="alertify-resetFocusBack" class="alertify-resetFocus" href="#">Reset Focus</a>', 
                "none" === q.buttonFocus && (b += '<a href="#" id="alertify-noneFocus" class="alertify-hidden"></a>'), 
                "prompt" === c && (b += '<div id="alertify-form">'), b += '<article class="alertify-inner">', 
                b += r.message.replace("{{message}}", d), "prompt" === c && (b += r.input), b += r.buttons.holder, 
                b += "</article>", "prompt" === c && (b += "</div>"), b += '<a id="alertify-resetFocus" class="alertify-resetFocus" href="#">Reset Focus</a>', 
                b += "</div>", c) {
                  case "confirm":
                    b = b.replace("{{buttons}}", this.appendButtons(r.buttons.cancel, r.buttons.ok)), 
                    b = b.replace("{{ok}}", this.labels.ok).replace("{{cancel}}", this.labels.cancel);
                    break;

                  case "prompt":
                    b = b.replace("{{buttons}}", this.appendButtons(r.buttons.cancel, r.buttons.submit)), 
                    b = b.replace("{{ok}}", this.labels.ok).replace("{{cancel}}", this.labels.cancel);
                    break;

                  case "alert":
                    b = b.replace("{{buttons}}", r.buttons.ok), b = b.replace("{{ok}}", this.labels.ok);
                }
                return l.className = "alertify alertify-" + c + " " + e, k.className = "alertify-cover", 
                b;
            },
            close: function(a, b) {
                var c, d, e = b && !isNaN(b) ? +b : this.delay, f = this;
                this.bind(a, "click", function() {
                    c(a);
                }), d = function(a) {
                    a.stopPropagation(), f.unbind(this, f.transition.type, d), m.removeChild(this), 
                    m.hasChildNodes() || (m.className += " alertify-logs-hidden");
                }, c = function(a) {
                    "undefined" != typeof a && a.parentNode === m && (f.transition.supported ? (f.bind(a, f.transition.type, d), 
                    a.className += " alertify-log-hide") : (m.removeChild(a), m.hasChildNodes() || (m.className += " alertify-logs-hidden")));
                }, 0 !== b && setTimeout(function() {
                    c(a);
                }, e);
            },
            dialog: function(a, b, c, e, f) {
                j = d.activeElement;
                var g = function() {
                    m && null !== m.scrollTop && k && null !== k.scrollTop || g();
                };
                if ("string" != typeof a) throw new Error("message must be a string");
                if ("string" != typeof b) throw new Error("type must be a string");
                if ("undefined" != typeof c && "function" != typeof c) throw new Error("fn must be a function");
                return this.init(), g(), u.push({
                    type: b,
                    message: a,
                    callback: c,
                    placeholder: e,
                    cssClass: f
                }), s || this.setup(), this;
            },
            extend: function(a) {
                if ("string" != typeof a) throw new Error("extend method must have exactly one paramter");
                return function(b, c) {
                    return this.log(b, a, c), this;
                };
            },
            hide: function() {
                var a, b = this;
                u.splice(0, 1), u.length > 0 ? this.setup(!0) : (s = !1, a = function(c) {
                    c.stopPropagation(), b.unbind(l, b.transition.type, a);
                }, this.transition.supported ? (this.bind(l, this.transition.type, a), l.className = "alertify alertify-hide alertify-hidden") : l.className = "alertify alertify-hide alertify-hidden alertify-isHidden", 
                k.className = "alertify-cover alertify-cover-hidden", j.focus());
            },
            init: function() {
                d.createElement("nav"), d.createElement("article"), d.createElement("section"), 
                null == c("alertify-cover") && (k = d.createElement("div"), k.setAttribute("id", "alertify-cover"), 
                k.className = "alertify-cover alertify-cover-hidden", d.body.appendChild(k)), null == c("alertify") && (s = !1, 
                u = [], l = d.createElement("section"), l.setAttribute("id", "alertify"), l.className = "alertify alertify-hidden", 
                d.body.appendChild(l)), null == c("alertify-logs") && (m = d.createElement("section"), 
                m.setAttribute("id", "alertify-logs"), m.className = "alertify-logs alertify-logs-hidden", 
                d.body.appendChild(m)), d.body.setAttribute("tabindex", "0"), this.transition = p();
            },
            log: function(a, b, c) {
                var d = function() {
                    m && null !== m.scrollTop || d();
                };
                return this.init(), d(), m.className = "alertify-logs", this.notify(a, b, c), this;
            },
            notify: function(a, b, c) {
                var e = d.createElement("article");
                e.className = "alertify-log" + ("string" == typeof b && "" !== b ? " alertify-log-" + b : ""), 
                e.innerHTML = a, m.appendChild(e), setTimeout(function() {
                    e.className = e.className + " alertify-log-show";
                }, 50), this.close(e, c);
            },
            set: function(a) {
                var b;
                if ("object" != typeof a && a instanceof Array) throw new Error("args must be an object");
                for (b in a) a.hasOwnProperty(b) && (this[b] = a[b]);
            },
            setFocus: function() {
                o ? (o.focus(), o.select()) : i.focus();
            },
            setup: function(a) {
                var d, j = u[0], k = this;
                s = !0, d = function(a) {
                    a.stopPropagation(), k.setFocus(), k.unbind(l, k.transition.type, d);
                }, this.transition.supported && !a && this.bind(l, this.transition.type, d), l.innerHTML = this.build(j), 
                g = c("alertify-resetFocus"), h = c("alertify-resetFocusBack"), f = c("alertify-ok") || b, 
                e = c("alertify-cancel") || b, i = "cancel" === q.buttonFocus ? e : "none" === q.buttonFocus ? c("alertify-noneFocus") : f, 
                o = c("alertify-text") || b, n = c("alertify-form") || b, "string" == typeof j.placeholder && "" !== j.placeholder && (o.value = j.placeholder), 
                a && this.setFocus(), this.addListeners(j.callback);
            },
            unbind: function(a, b, c) {
                "function" == typeof a.removeEventListener ? a.removeEventListener(b, c, !1) : a.detachEvent && a.detachEvent("on" + b, c);
            }
        }, {
            alert: function(a, b, c) {
                return q.dialog(a, "alert", b, "", c), this;
            },
            confirm: function(a, b, c) {
                return q.dialog(a, "confirm", b, "", c), this;
            },
            extend: q.extend,
            init: q.init,
            log: function(a, b, c) {
                return q.log(a, b, c), this;
            },
            prompt: function(a, b, c, d) {
                return q.dialog(a, "prompt", b, c, d), this;
            },
            success: function(a, b) {
                return q.log(a, "success", b), this;
            },
            error: function(a, b) {
                return q.log(a, "error", b), this;
            },
            set: function(a) {
                q.set(a);
            },
            labels: q.labels,
            debug: q.handleErrors
        };
    }, "function" == typeof define ? define([], function() {
        return new c();
    }) : "undefined" == typeof a.alertify && (a.alertify = new c());
}(this);

(function(b) {
    var d = "open" in document.createElement("details"), e;
    b.fn.details = function(a) {
        "open" === a && (d ? this.prop("open", !0) : this.trigger("open"));
        "close" === a && (d ? this.prop("open", !1) : this.trigger("close"));
        "init" === a && e(b(this));
        if (!a) {
            if (!d) return this.hasClass("open");
            var c = !1;
            this.each(function() {
                if (this.open) return c = !0, !1;
            });
            return c;
        }
    };
    e = function(a) {
        a = a.not(".details-inited").addClass("details-inited");
        a.filter(".animated").each(function() {
            var a = b(this), d = a.children("summary").remove(), e = b("<div>").addClass("details-wrapper").append(a.children());
            a.append(e).prepend(d);
        });
        d || (a.each(function() {
            var a = b(this);
            a.children("summary").length || a.prepend("<summary>Details</summary>");
        }).children("summary").filter(":not(tabindex)").attr("tabindex", 0).end().end().contents(":not(summary)").filter(function() {
            return 3 === this.nodeType && /[^\t\n\r ]/.test(this.data);
        }).wrap("<span>").end().end().filter(":not([open])").prop("open", !1).end().filter("[open]").addClass("open").prop("open", !0).end(), 
        b.browser.msie && 9 > b.browser.msie && a.filter(":not(.open)").children().not("summary").hide());
    };
    b(function() {
        b("body").on("open.details", "details.animated", function() {
            var a = b(this), c = a.children(".details-wrapper");
            c.hide();
            setTimeout(function() {
                c.slideDown(a.data("animation-speed"));
            }, 0);
        }).on("close.details", "details.animated", function() {
            var a = b(this), c = a.children(".details-wrapper");
            setTimeout(function() {
                a.prop("open", !0).addClass("open");
                c.slideUp(a.data("animation-speed"), function() {
                    a.prop("open", !1).removeClass("open");
                });
            }, 0);
        });
        if (d) b("body").on("click", "summary", function() {
            var a = b(this).parent();
            a.prop("open") ? a.trigger("close") : a.trigger("open");
        }); else if (b("html").addClass("no-details"), b("head").prepend('<style>details{display:block}summary{cursor:pointer}details>summary::before{content:"►"}details.open>summary::before{content:"▼"}details:not(.open)>:not(summary){display:none}</style>'), 
        b("body").on("open.details", "details", function(a) {
            b(this).addClass("open").trigger("change.details");
            a.stopPropagation();
        }).on("close.details", "details", function(a) {
            b(this).removeClass("open").trigger("change.details");
            a.stopPropagation();
        }).on("toggle.details", "details", function(a) {
            var c = b(this);
            c.hasClass("open") ? c.trigger("close") : c.trigger("open");
            a.stopPropagation();
        }).on("click", "summary", function() {
            b(this).parent().trigger("toggle");
        }).on("keyup", "summary", function(a) {
            (32 === a.keyCode || 13 === a.keyCode && !b.browser.opera) && b(this).parent().trigger("toggle");
        }), b.browser.msie && 9 > b.browser.msie) b("body").on("open.details", "details", function() {
            b(this).children().not("summary").show();
        }).on("close.details", "details", function() {
            b(this).children().not("summary").hide();
        });
        e(b("details"));
    });
})(jQuery);

var Handlebars = function() {
    var __module4__ = function() {
        "use strict";
        var __exports__;
        function SafeString(string) {
            this.string = string;
        }
        SafeString.prototype.toString = function() {
            return "" + this.string;
        };
        __exports__ = SafeString;
        return __exports__;
    }();
    var __module3__ = function(__dependency1__) {
        "use strict";
        var __exports__ = {};
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
            for (var key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    obj[key] = value[key];
                }
            }
        }
        __exports__.extend = extend;
        var toString = Object.prototype.toString;
        __exports__.toString = toString;
        var isFunction = function(value) {
            return typeof value === "function";
        };
        if (isFunction(/x/)) {
            isFunction = function(value) {
                return typeof value === "function" && toString.call(value) === "[object Function]";
            };
        }
        var isFunction;
        __exports__.isFunction = isFunction;
        var isArray = Array.isArray || function(value) {
            return value && typeof value === "object" ? toString.call(value) === "[object Array]" : false;
        };
        __exports__.isArray = isArray;
        function escapeExpression(string) {
            if (string instanceof SafeString) {
                return string.toString();
            } else if (!string && string !== 0) {
                return "";
            }
            string = "" + string;
            if (!possible.test(string)) {
                return string;
            }
            return string.replace(badChars, escapeChar);
        }
        __exports__.escapeExpression = escapeExpression;
        function isEmpty(value) {
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
    }(__module4__);
    var __module5__ = function() {
        "use strict";
        var __exports__;
        var errorProps = [ "description", "fileName", "lineNumber", "message", "name", "number", "stack" ];
        function Exception(message, node) {
            var line;
            if (node && node.firstLine) {
                line = node.firstLine;
                message += " - " + line + ":" + node.firstColumn;
            }
            var tmp = Error.prototype.constructor.call(this, message);
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
    }();
    var __module2__ = function(__dependency1__, __dependency2__) {
        "use strict";
        var __exports__ = {};
        var Utils = __dependency1__;
        var Exception = __dependency2__;
        var VERSION = "1.3.0";
        __exports__.VERSION = VERSION;
        var COMPILER_REVISION = 4;
        __exports__.COMPILER_REVISION = COMPILER_REVISION;
        var REVISION_CHANGES = {
            1: "<= 1.0.rc.2",
            2: "== 1.0.0-rc.3",
            3: "== 1.0.0-rc.4",
            4: ">= 1.0.0"
        };
        __exports__.REVISION_CHANGES = REVISION_CHANGES;
        var isArray = Utils.isArray, isFunction = Utils.isFunction, toString = Utils.toString, objectType = "[object Object]";
        function HandlebarsEnvironment(helpers, partials) {
            this.helpers = helpers || {};
            this.partials = partials || {};
            registerDefaultHelpers(this);
        }
        __exports__.HandlebarsEnvironment = HandlebarsEnvironment;
        HandlebarsEnvironment.prototype = {
            constructor: HandlebarsEnvironment,
            logger: logger,
            log: log,
            registerHelper: function(name, fn, inverse) {
                if (toString.call(name) === objectType) {
                    if (inverse || fn) {
                        throw new Exception("Arg not supported with multiple helpers");
                    }
                    Utils.extend(this.helpers, name);
                } else {
                    if (inverse) {
                        fn.not = inverse;
                    }
                    this.helpers[name] = fn;
                }
            },
            registerPartial: function(name, str) {
                if (toString.call(name) === objectType) {
                    Utils.extend(this.partials, name);
                } else {
                    this.partials[name] = str;
                }
            }
        };
        function registerDefaultHelpers(instance) {
            instance.registerHelper("helperMissing", function(arg) {
                if (arguments.length === 2) {
                    return undefined;
                } else {
                    throw new Exception("Missing helper: '" + arg + "'");
                }
            });
            instance.registerHelper("blockHelperMissing", function(context, options) {
                var inverse = options.inverse || function() {}, fn = options.fn;
                if (isFunction(context)) {
                    context = context.call(this);
                }
                if (context === true) {
                    return fn(this);
                } else if (context === false || context == null) {
                    return inverse(this);
                } else if (isArray(context)) {
                    if (context.length > 0) {
                        return instance.helpers.each(context, options);
                    } else {
                        return inverse(this);
                    }
                } else {
                    return fn(context);
                }
            });
            instance.registerHelper("each", function(context, options) {
                var fn = options.fn, inverse = options.inverse;
                var i = 0, ret = "", data;
                if (isFunction(context)) {
                    context = context.call(this);
                }
                if (options.data) {
                    data = createFrame(options.data);
                }
                if (context && typeof context === "object") {
                    if (isArray(context)) {
                        for (var j = context.length; i < j; i++) {
                            if (data) {
                                data.index = i;
                                data.first = i === 0;
                                data.last = i === context.length - 1;
                            }
                            ret = ret + fn(context[i], {
                                data: data
                            });
                        }
                    } else {
                        for (var key in context) {
                            if (context.hasOwnProperty(key)) {
                                if (data) {
                                    data.key = key;
                                    data.index = i;
                                    data.first = i === 0;
                                }
                                ret = ret + fn(context[key], {
                                    data: data
                                });
                                i++;
                            }
                        }
                    }
                }
                if (i === 0) {
                    ret = inverse(this);
                }
                return ret;
            });
            instance.registerHelper("if", function(conditional, options) {
                if (isFunction(conditional)) {
                    conditional = conditional.call(this);
                }
                if (!options.hash.includeZero && !conditional || Utils.isEmpty(conditional)) {
                    return options.inverse(this);
                } else {
                    return options.fn(this);
                }
            });
            instance.registerHelper("unless", function(conditional, options) {
                return instance.helpers["if"].call(this, conditional, {
                    fn: options.inverse,
                    inverse: options.fn,
                    hash: options.hash
                });
            });
            instance.registerHelper("with", function(context, options) {
                if (isFunction(context)) {
                    context = context.call(this);
                }
                if (!Utils.isEmpty(context)) return options.fn(context);
            });
            instance.registerHelper("log", function(context, options) {
                var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
                instance.log(level, context);
            });
        }
        var logger = {
            methodMap: {
                0: "debug",
                1: "info",
                2: "warn",
                3: "error"
            },
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            level: 3,
            log: function(level, obj) {
                if (logger.level <= level) {
                    var method = logger.methodMap[level];
                    if (typeof console !== "undefined" && console[method]) {
                        console[method].call(console, obj);
                    }
                }
            }
        };
        __exports__.logger = logger;
        function log(level, obj) {
            logger.log(level, obj);
        }
        __exports__.log = log;
        var createFrame = function(object) {
            var obj = {};
            Utils.extend(obj, object);
            return obj;
        };
        __exports__.createFrame = createFrame;
        return __exports__;
    }(__module3__, __module5__);
    var __module6__ = function(__dependency1__, __dependency2__, __dependency3__) {
        "use strict";
        var __exports__ = {};
        var Utils = __dependency1__;
        var Exception = __dependency2__;
        var COMPILER_REVISION = __dependency3__.COMPILER_REVISION;
        var REVISION_CHANGES = __dependency3__.REVISION_CHANGES;
        function checkRevision(compilerInfo) {
            var compilerRevision = compilerInfo && compilerInfo[0] || 1, currentRevision = COMPILER_REVISION;
            if (compilerRevision !== currentRevision) {
                if (compilerRevision < currentRevision) {
                    var runtimeVersions = REVISION_CHANGES[currentRevision], compilerVersions = REVISION_CHANGES[compilerRevision];
                    throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. " + "Please update your precompiler to a newer version (" + runtimeVersions + ") or downgrade your runtime to an older version (" + compilerVersions + ").");
                } else {
                    throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. " + "Please update your runtime to a newer version (" + compilerInfo[1] + ").");
                }
            }
        }
        __exports__.checkRevision = checkRevision;
        function template(templateSpec, env) {
            if (!env) {
                throw new Exception("No environment passed to template");
            }
            var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
                var result = env.VM.invokePartial.apply(this, arguments);
                if (result != null) {
                    return result;
                }
                if (env.compile) {
                    var options = {
                        helpers: helpers,
                        partials: partials,
                        data: data
                    };
                    partials[name] = env.compile(partial, {
                        data: data !== undefined
                    }, env);
                    return partials[name](context, options);
                } else {
                    throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
                }
            };
            var container = {
                escapeExpression: Utils.escapeExpression,
                invokePartial: invokePartialWrapper,
                programs: [],
                program: function(i, fn, data) {
                    var programWrapper = this.programs[i];
                    if (data) {
                        programWrapper = program(i, fn, data);
                    } else if (!programWrapper) {
                        programWrapper = this.programs[i] = program(i, fn);
                    }
                    return programWrapper;
                },
                merge: function(param, common) {
                    var ret = param || common;
                    if (param && common && param !== common) {
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
                var namespace = options.partial ? options : env, helpers, partials;
                if (!options.partial) {
                    helpers = options.helpers;
                    partials = options.partials;
                }
                var result = templateSpec.call(container, namespace, context, helpers, partials, options.data);
                if (!options.partial) {
                    env.VM.checkRevision(container.compilerInfo);
                }
                return result;
            };
        }
        __exports__.template = template;
        function programWithDepth(i, fn, data) {
            var args = Array.prototype.slice.call(arguments, 3);
            var prog = function(context, options) {
                options = options || {};
                return fn.apply(this, [ context, options.data || data ].concat(args));
            };
            prog.program = i;
            prog.depth = args.length;
            return prog;
        }
        __exports__.programWithDepth = programWithDepth;
        function program(i, fn, data) {
            var prog = function(context, options) {
                options = options || {};
                return fn(context, options.data || data);
            };
            prog.program = i;
            prog.depth = 0;
            return prog;
        }
        __exports__.program = program;
        function invokePartial(partial, name, context, helpers, partials, data) {
            var options = {
                partial: true,
                helpers: helpers,
                partials: partials,
                data: data
            };
            if (partial === undefined) {
                throw new Exception("The partial " + name + " could not be found");
            } else if (partial instanceof Function) {
                return partial(context, options);
            }
        }
        __exports__.invokePartial = invokePartial;
        function noop() {
            return "";
        }
        __exports__.noop = noop;
        return __exports__;
    }(__module3__, __module5__, __module2__);
    var __module1__ = function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
        "use strict";
        var __exports__;
        var base = __dependency1__;
        var SafeString = __dependency2__;
        var Exception = __dependency3__;
        var Utils = __dependency4__;
        var runtime = __dependency5__;
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
    }(__module2__, __module4__, __module5__, __module3__, __module6__);
    var __module7__ = function(__dependency1__) {
        "use strict";
        var __exports__;
        var Exception = __dependency1__;
        function LocationInfo(locInfo) {
            locInfo = locInfo || {};
            this.firstLine = locInfo.first_line;
            this.firstColumn = locInfo.first_column;
            this.lastColumn = locInfo.last_column;
            this.lastLine = locInfo.last_line;
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
                if (inverse) {
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
                if (open != null && open.charAt) {
                    var escapeFlag = open.charAt(3) || open.charAt(2);
                    this.escaped = escapeFlag !== "{" && escapeFlag !== "&";
                } else {
                    this.escaped = !!open;
                }
                if (rawParams instanceof AST.SexprNode) {
                    this.sexpr = rawParams;
                } else {
                    this.sexpr = new AST.SexprNode(rawParams, hash);
                }
                this.sexpr.isRoot = true;
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
                var eligibleHelper = this.eligibleHelper = id.isSimple;
                this.isHelper = eligibleHelper && (params.length || hash);
            },
            PartialNode: function(partialName, context, strip, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "partial";
                this.partialName = partialName;
                this.context = context;
                this.strip = strip;
            },
            BlockNode: function(mustache, program, inverse, close, locInfo) {
                LocationInfo.call(this, locInfo);
                if (mustache.sexpr.id.original !== close.path.original) {
                    throw new Exception(mustache.sexpr.id.original + " doesn't match " + close.path.original, this);
                }
                this.type = "block";
                this.mustache = mustache;
                this.program = program;
                this.inverse = inverse;
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
                var original = "", dig = [], depth = 0;
                for (var i = 0, l = parts.length; i < l; i++) {
                    var part = parts[i].part;
                    original += (parts[i].separator || "") + part;
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
                this.parts = dig;
                this.string = dig.join(".");
                this.depth = depth;
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
                this.original = this.string = this.stringModeValue = string;
            },
            IntegerNode: function(integer, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "INTEGER";
                this.original = this.integer = integer;
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
        __exports__ = AST;
        return __exports__;
    }(__module5__);
    var __module9__ = function() {
        "use strict";
        var __exports__;
        var handlebars = function() {
            var parser = {
                trace: function trace() {},
                yy: {},
                symbols_: {
                    error: 2,
                    root: 3,
                    statements: 4,
                    EOF: 5,
                    program: 6,
                    simpleInverse: 7,
                    statement: 8,
                    openInverse: 9,
                    closeBlock: 10,
                    openBlock: 11,
                    mustache: 12,
                    partial: 13,
                    CONTENT: 14,
                    COMMENT: 15,
                    OPEN_BLOCK: 16,
                    sexpr: 17,
                    CLOSE: 18,
                    OPEN_INVERSE: 19,
                    OPEN_ENDBLOCK: 20,
                    path: 21,
                    OPEN: 22,
                    OPEN_UNESCAPED: 23,
                    CLOSE_UNESCAPED: 24,
                    OPEN_PARTIAL: 25,
                    partialName: 26,
                    partial_option0: 27,
                    sexpr_repetition0: 28,
                    sexpr_option0: 29,
                    dataName: 30,
                    param: 31,
                    STRING: 32,
                    INTEGER: 33,
                    BOOLEAN: 34,
                    OPEN_SEXPR: 35,
                    CLOSE_SEXPR: 36,
                    hash: 37,
                    hash_repetition_plus0: 38,
                    hashSegment: 39,
                    ID: 40,
                    EQUALS: 41,
                    DATA: 42,
                    pathSegments: 43,
                    SEP: 44,
                    $accept: 0,
                    $end: 1
                },
                terminals_: {
                    2: "error",
                    5: "EOF",
                    14: "CONTENT",
                    15: "COMMENT",
                    16: "OPEN_BLOCK",
                    18: "CLOSE",
                    19: "OPEN_INVERSE",
                    20: "OPEN_ENDBLOCK",
                    22: "OPEN",
                    23: "OPEN_UNESCAPED",
                    24: "CLOSE_UNESCAPED",
                    25: "OPEN_PARTIAL",
                    32: "STRING",
                    33: "INTEGER",
                    34: "BOOLEAN",
                    35: "OPEN_SEXPR",
                    36: "CLOSE_SEXPR",
                    40: "ID",
                    41: "EQUALS",
                    42: "DATA",
                    44: "SEP"
                },
                productions_: [ 0, [ 3, 2 ], [ 3, 1 ], [ 6, 2 ], [ 6, 3 ], [ 6, 2 ], [ 6, 1 ], [ 6, 1 ], [ 6, 0 ], [ 4, 1 ], [ 4, 2 ], [ 8, 3 ], [ 8, 3 ], [ 8, 1 ], [ 8, 1 ], [ 8, 1 ], [ 8, 1 ], [ 11, 3 ], [ 9, 3 ], [ 10, 3 ], [ 12, 3 ], [ 12, 3 ], [ 13, 4 ], [ 7, 2 ], [ 17, 3 ], [ 17, 1 ], [ 31, 1 ], [ 31, 1 ], [ 31, 1 ], [ 31, 1 ], [ 31, 1 ], [ 31, 3 ], [ 37, 1 ], [ 39, 3 ], [ 26, 1 ], [ 26, 1 ], [ 26, 1 ], [ 30, 2 ], [ 21, 1 ], [ 43, 3 ], [ 43, 1 ], [ 27, 0 ], [ 27, 1 ], [ 28, 0 ], [ 28, 2 ], [ 29, 0 ], [ 29, 1 ], [ 38, 1 ], [ 38, 2 ] ],
                performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
                    var $0 = $$.length - 1;
                    switch (yystate) {
                      case 1:
                        return new yy.ProgramNode($$[$0 - 1], this._$);
                        break;

                      case 2:
                        return new yy.ProgramNode([], this._$);
                        break;

                      case 3:
                        this.$ = new yy.ProgramNode([], $$[$0 - 1], $$[$0], this._$);
                        break;

                      case 4:
                        this.$ = new yy.ProgramNode($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
                        break;

                      case 5:
                        this.$ = new yy.ProgramNode($$[$0 - 1], $$[$0], [], this._$);
                        break;

                      case 6:
                        this.$ = new yy.ProgramNode($$[$0], this._$);
                        break;

                      case 7:
                        this.$ = new yy.ProgramNode([], this._$);
                        break;

                      case 8:
                        this.$ = new yy.ProgramNode([], this._$);
                        break;

                      case 9:
                        this.$ = [ $$[$0] ];
                        break;

                      case 10:
                        $$[$0 - 1].push($$[$0]);
                        this.$ = $$[$0 - 1];
                        break;

                      case 11:
                        this.$ = new yy.BlockNode($$[$0 - 2], $$[$0 - 1].inverse, $$[$0 - 1], $$[$0], this._$);
                        break;

                      case 12:
                        this.$ = new yy.BlockNode($$[$0 - 2], $$[$0 - 1], $$[$0 - 1].inverse, $$[$0], this._$);
                        break;

                      case 13:
                        this.$ = $$[$0];
                        break;

                      case 14:
                        this.$ = $$[$0];
                        break;

                      case 15:
                        this.$ = new yy.ContentNode($$[$0], this._$);
                        break;

                      case 16:
                        this.$ = new yy.CommentNode($$[$0], this._$);
                        break;

                      case 17:
                        this.$ = new yy.MustacheNode($$[$0 - 1], null, $$[$0 - 2], stripFlags($$[$0 - 2], $$[$0]), this._$);
                        break;

                      case 18:
                        this.$ = new yy.MustacheNode($$[$0 - 1], null, $$[$0 - 2], stripFlags($$[$0 - 2], $$[$0]), this._$);
                        break;

                      case 19:
                        this.$ = {
                            path: $$[$0 - 1],
                            strip: stripFlags($$[$0 - 2], $$[$0])
                        };
                        break;

                      case 20:
                        this.$ = new yy.MustacheNode($$[$0 - 1], null, $$[$0 - 2], stripFlags($$[$0 - 2], $$[$0]), this._$);
                        break;

                      case 21:
                        this.$ = new yy.MustacheNode($$[$0 - 1], null, $$[$0 - 2], stripFlags($$[$0 - 2], $$[$0]), this._$);
                        break;

                      case 22:
                        this.$ = new yy.PartialNode($$[$0 - 2], $$[$0 - 1], stripFlags($$[$0 - 3], $$[$0]), this._$);
                        break;

                      case 23:
                        this.$ = stripFlags($$[$0 - 1], $$[$0]);
                        break;

                      case 24:
                        this.$ = new yy.SexprNode([ $$[$0 - 2] ].concat($$[$0 - 1]), $$[$0], this._$);
                        break;

                      case 25:
                        this.$ = new yy.SexprNode([ $$[$0] ], null, this._$);
                        break;

                      case 26:
                        this.$ = $$[$0];
                        break;

                      case 27:
                        this.$ = new yy.StringNode($$[$0], this._$);
                        break;

                      case 28:
                        this.$ = new yy.IntegerNode($$[$0], this._$);
                        break;

                      case 29:
                        this.$ = new yy.BooleanNode($$[$0], this._$);
                        break;

                      case 30:
                        this.$ = $$[$0];
                        break;

                      case 31:
                        $$[$0 - 1].isHelper = true;
                        this.$ = $$[$0 - 1];
                        break;

                      case 32:
                        this.$ = new yy.HashNode($$[$0], this._$);
                        break;

                      case 33:
                        this.$ = [ $$[$0 - 2], $$[$0] ];
                        break;

                      case 34:
                        this.$ = new yy.PartialNameNode($$[$0], this._$);
                        break;

                      case 35:
                        this.$ = new yy.PartialNameNode(new yy.StringNode($$[$0], this._$), this._$);
                        break;

                      case 36:
                        this.$ = new yy.PartialNameNode(new yy.IntegerNode($$[$0], this._$));
                        break;

                      case 37:
                        this.$ = new yy.DataNode($$[$0], this._$);
                        break;

                      case 38:
                        this.$ = new yy.IdNode($$[$0], this._$);
                        break;

                      case 39:
                        $$[$0 - 2].push({
                            part: $$[$0],
                            separator: $$[$0 - 1]
                        });
                        this.$ = $$[$0 - 2];
                        break;

                      case 40:
                        this.$ = [ {
                            part: $$[$0]
                        } ];
                        break;

                      case 43:
                        this.$ = [];
                        break;

                      case 44:
                        $$[$0 - 1].push($$[$0]);
                        break;

                      case 47:
                        this.$ = [ $$[$0] ];
                        break;

                      case 48:
                        $$[$0 - 1].push($$[$0]);
                        break;
                    }
                },
                table: [ {
                    3: 1,
                    4: 2,
                    5: [ 1, 3 ],
                    8: 4,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 11 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    1: [ 3 ]
                }, {
                    5: [ 1, 16 ],
                    8: 17,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 11 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    1: [ 2, 2 ]
                }, {
                    5: [ 2, 9 ],
                    14: [ 2, 9 ],
                    15: [ 2, 9 ],
                    16: [ 2, 9 ],
                    19: [ 2, 9 ],
                    20: [ 2, 9 ],
                    22: [ 2, 9 ],
                    23: [ 2, 9 ],
                    25: [ 2, 9 ]
                }, {
                    4: 20,
                    6: 18,
                    7: 19,
                    8: 4,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 21 ],
                    20: [ 2, 8 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    4: 20,
                    6: 22,
                    7: 19,
                    8: 4,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 21 ],
                    20: [ 2, 8 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    5: [ 2, 13 ],
                    14: [ 2, 13 ],
                    15: [ 2, 13 ],
                    16: [ 2, 13 ],
                    19: [ 2, 13 ],
                    20: [ 2, 13 ],
                    22: [ 2, 13 ],
                    23: [ 2, 13 ],
                    25: [ 2, 13 ]
                }, {
                    5: [ 2, 14 ],
                    14: [ 2, 14 ],
                    15: [ 2, 14 ],
                    16: [ 2, 14 ],
                    19: [ 2, 14 ],
                    20: [ 2, 14 ],
                    22: [ 2, 14 ],
                    23: [ 2, 14 ],
                    25: [ 2, 14 ]
                }, {
                    5: [ 2, 15 ],
                    14: [ 2, 15 ],
                    15: [ 2, 15 ],
                    16: [ 2, 15 ],
                    19: [ 2, 15 ],
                    20: [ 2, 15 ],
                    22: [ 2, 15 ],
                    23: [ 2, 15 ],
                    25: [ 2, 15 ]
                }, {
                    5: [ 2, 16 ],
                    14: [ 2, 16 ],
                    15: [ 2, 16 ],
                    16: [ 2, 16 ],
                    19: [ 2, 16 ],
                    20: [ 2, 16 ],
                    22: [ 2, 16 ],
                    23: [ 2, 16 ],
                    25: [ 2, 16 ]
                }, {
                    17: 23,
                    21: 24,
                    30: 25,
                    40: [ 1, 28 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    17: 29,
                    21: 24,
                    30: 25,
                    40: [ 1, 28 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    17: 30,
                    21: 24,
                    30: 25,
                    40: [ 1, 28 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    17: 31,
                    21: 24,
                    30: 25,
                    40: [ 1, 28 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    21: 33,
                    26: 32,
                    32: [ 1, 34 ],
                    33: [ 1, 35 ],
                    40: [ 1, 28 ],
                    43: 26
                }, {
                    1: [ 2, 1 ]
                }, {
                    5: [ 2, 10 ],
                    14: [ 2, 10 ],
                    15: [ 2, 10 ],
                    16: [ 2, 10 ],
                    19: [ 2, 10 ],
                    20: [ 2, 10 ],
                    22: [ 2, 10 ],
                    23: [ 2, 10 ],
                    25: [ 2, 10 ]
                }, {
                    10: 36,
                    20: [ 1, 37 ]
                }, {
                    4: 38,
                    8: 4,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 11 ],
                    20: [ 2, 7 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    7: 39,
                    8: 17,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 21 ],
                    20: [ 2, 6 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    17: 23,
                    18: [ 1, 40 ],
                    21: 24,
                    30: 25,
                    40: [ 1, 28 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    10: 41,
                    20: [ 1, 37 ]
                }, {
                    18: [ 1, 42 ]
                }, {
                    18: [ 2, 43 ],
                    24: [ 2, 43 ],
                    28: 43,
                    32: [ 2, 43 ],
                    33: [ 2, 43 ],
                    34: [ 2, 43 ],
                    35: [ 2, 43 ],
                    36: [ 2, 43 ],
                    40: [ 2, 43 ],
                    42: [ 2, 43 ]
                }, {
                    18: [ 2, 25 ],
                    24: [ 2, 25 ],
                    36: [ 2, 25 ]
                }, {
                    18: [ 2, 38 ],
                    24: [ 2, 38 ],
                    32: [ 2, 38 ],
                    33: [ 2, 38 ],
                    34: [ 2, 38 ],
                    35: [ 2, 38 ],
                    36: [ 2, 38 ],
                    40: [ 2, 38 ],
                    42: [ 2, 38 ],
                    44: [ 1, 44 ]
                }, {
                    21: 45,
                    40: [ 1, 28 ],
                    43: 26
                }, {
                    18: [ 2, 40 ],
                    24: [ 2, 40 ],
                    32: [ 2, 40 ],
                    33: [ 2, 40 ],
                    34: [ 2, 40 ],
                    35: [ 2, 40 ],
                    36: [ 2, 40 ],
                    40: [ 2, 40 ],
                    42: [ 2, 40 ],
                    44: [ 2, 40 ]
                }, {
                    18: [ 1, 46 ]
                }, {
                    18: [ 1, 47 ]
                }, {
                    24: [ 1, 48 ]
                }, {
                    18: [ 2, 41 ],
                    21: 50,
                    27: 49,
                    40: [ 1, 28 ],
                    43: 26
                }, {
                    18: [ 2, 34 ],
                    40: [ 2, 34 ]
                }, {
                    18: [ 2, 35 ],
                    40: [ 2, 35 ]
                }, {
                    18: [ 2, 36 ],
                    40: [ 2, 36 ]
                }, {
                    5: [ 2, 11 ],
                    14: [ 2, 11 ],
                    15: [ 2, 11 ],
                    16: [ 2, 11 ],
                    19: [ 2, 11 ],
                    20: [ 2, 11 ],
                    22: [ 2, 11 ],
                    23: [ 2, 11 ],
                    25: [ 2, 11 ]
                }, {
                    21: 51,
                    40: [ 1, 28 ],
                    43: 26
                }, {
                    8: 17,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 11 ],
                    20: [ 2, 3 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    4: 52,
                    8: 4,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 11 ],
                    20: [ 2, 5 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    14: [ 2, 23 ],
                    15: [ 2, 23 ],
                    16: [ 2, 23 ],
                    19: [ 2, 23 ],
                    20: [ 2, 23 ],
                    22: [ 2, 23 ],
                    23: [ 2, 23 ],
                    25: [ 2, 23 ]
                }, {
                    5: [ 2, 12 ],
                    14: [ 2, 12 ],
                    15: [ 2, 12 ],
                    16: [ 2, 12 ],
                    19: [ 2, 12 ],
                    20: [ 2, 12 ],
                    22: [ 2, 12 ],
                    23: [ 2, 12 ],
                    25: [ 2, 12 ]
                }, {
                    14: [ 2, 18 ],
                    15: [ 2, 18 ],
                    16: [ 2, 18 ],
                    19: [ 2, 18 ],
                    20: [ 2, 18 ],
                    22: [ 2, 18 ],
                    23: [ 2, 18 ],
                    25: [ 2, 18 ]
                }, {
                    18: [ 2, 45 ],
                    21: 56,
                    24: [ 2, 45 ],
                    29: 53,
                    30: 60,
                    31: 54,
                    32: [ 1, 57 ],
                    33: [ 1, 58 ],
                    34: [ 1, 59 ],
                    35: [ 1, 61 ],
                    36: [ 2, 45 ],
                    37: 55,
                    38: 62,
                    39: 63,
                    40: [ 1, 64 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    40: [ 1, 65 ]
                }, {
                    18: [ 2, 37 ],
                    24: [ 2, 37 ],
                    32: [ 2, 37 ],
                    33: [ 2, 37 ],
                    34: [ 2, 37 ],
                    35: [ 2, 37 ],
                    36: [ 2, 37 ],
                    40: [ 2, 37 ],
                    42: [ 2, 37 ]
                }, {
                    14: [ 2, 17 ],
                    15: [ 2, 17 ],
                    16: [ 2, 17 ],
                    19: [ 2, 17 ],
                    20: [ 2, 17 ],
                    22: [ 2, 17 ],
                    23: [ 2, 17 ],
                    25: [ 2, 17 ]
                }, {
                    5: [ 2, 20 ],
                    14: [ 2, 20 ],
                    15: [ 2, 20 ],
                    16: [ 2, 20 ],
                    19: [ 2, 20 ],
                    20: [ 2, 20 ],
                    22: [ 2, 20 ],
                    23: [ 2, 20 ],
                    25: [ 2, 20 ]
                }, {
                    5: [ 2, 21 ],
                    14: [ 2, 21 ],
                    15: [ 2, 21 ],
                    16: [ 2, 21 ],
                    19: [ 2, 21 ],
                    20: [ 2, 21 ],
                    22: [ 2, 21 ],
                    23: [ 2, 21 ],
                    25: [ 2, 21 ]
                }, {
                    18: [ 1, 66 ]
                }, {
                    18: [ 2, 42 ]
                }, {
                    18: [ 1, 67 ]
                }, {
                    8: 17,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 11 ],
                    20: [ 2, 4 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    18: [ 2, 24 ],
                    24: [ 2, 24 ],
                    36: [ 2, 24 ]
                }, {
                    18: [ 2, 44 ],
                    24: [ 2, 44 ],
                    32: [ 2, 44 ],
                    33: [ 2, 44 ],
                    34: [ 2, 44 ],
                    35: [ 2, 44 ],
                    36: [ 2, 44 ],
                    40: [ 2, 44 ],
                    42: [ 2, 44 ]
                }, {
                    18: [ 2, 46 ],
                    24: [ 2, 46 ],
                    36: [ 2, 46 ]
                }, {
                    18: [ 2, 26 ],
                    24: [ 2, 26 ],
                    32: [ 2, 26 ],
                    33: [ 2, 26 ],
                    34: [ 2, 26 ],
                    35: [ 2, 26 ],
                    36: [ 2, 26 ],
                    40: [ 2, 26 ],
                    42: [ 2, 26 ]
                }, {
                    18: [ 2, 27 ],
                    24: [ 2, 27 ],
                    32: [ 2, 27 ],
                    33: [ 2, 27 ],
                    34: [ 2, 27 ],
                    35: [ 2, 27 ],
                    36: [ 2, 27 ],
                    40: [ 2, 27 ],
                    42: [ 2, 27 ]
                }, {
                    18: [ 2, 28 ],
                    24: [ 2, 28 ],
                    32: [ 2, 28 ],
                    33: [ 2, 28 ],
                    34: [ 2, 28 ],
                    35: [ 2, 28 ],
                    36: [ 2, 28 ],
                    40: [ 2, 28 ],
                    42: [ 2, 28 ]
                }, {
                    18: [ 2, 29 ],
                    24: [ 2, 29 ],
                    32: [ 2, 29 ],
                    33: [ 2, 29 ],
                    34: [ 2, 29 ],
                    35: [ 2, 29 ],
                    36: [ 2, 29 ],
                    40: [ 2, 29 ],
                    42: [ 2, 29 ]
                }, {
                    18: [ 2, 30 ],
                    24: [ 2, 30 ],
                    32: [ 2, 30 ],
                    33: [ 2, 30 ],
                    34: [ 2, 30 ],
                    35: [ 2, 30 ],
                    36: [ 2, 30 ],
                    40: [ 2, 30 ],
                    42: [ 2, 30 ]
                }, {
                    17: 68,
                    21: 24,
                    30: 25,
                    40: [ 1, 28 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    18: [ 2, 32 ],
                    24: [ 2, 32 ],
                    36: [ 2, 32 ],
                    39: 69,
                    40: [ 1, 70 ]
                }, {
                    18: [ 2, 47 ],
                    24: [ 2, 47 ],
                    36: [ 2, 47 ],
                    40: [ 2, 47 ]
                }, {
                    18: [ 2, 40 ],
                    24: [ 2, 40 ],
                    32: [ 2, 40 ],
                    33: [ 2, 40 ],
                    34: [ 2, 40 ],
                    35: [ 2, 40 ],
                    36: [ 2, 40 ],
                    40: [ 2, 40 ],
                    41: [ 1, 71 ],
                    42: [ 2, 40 ],
                    44: [ 2, 40 ]
                }, {
                    18: [ 2, 39 ],
                    24: [ 2, 39 ],
                    32: [ 2, 39 ],
                    33: [ 2, 39 ],
                    34: [ 2, 39 ],
                    35: [ 2, 39 ],
                    36: [ 2, 39 ],
                    40: [ 2, 39 ],
                    42: [ 2, 39 ],
                    44: [ 2, 39 ]
                }, {
                    5: [ 2, 22 ],
                    14: [ 2, 22 ],
                    15: [ 2, 22 ],
                    16: [ 2, 22 ],
                    19: [ 2, 22 ],
                    20: [ 2, 22 ],
                    22: [ 2, 22 ],
                    23: [ 2, 22 ],
                    25: [ 2, 22 ]
                }, {
                    5: [ 2, 19 ],
                    14: [ 2, 19 ],
                    15: [ 2, 19 ],
                    16: [ 2, 19 ],
                    19: [ 2, 19 ],
                    20: [ 2, 19 ],
                    22: [ 2, 19 ],
                    23: [ 2, 19 ],
                    25: [ 2, 19 ]
                }, {
                    36: [ 1, 72 ]
                }, {
                    18: [ 2, 48 ],
                    24: [ 2, 48 ],
                    36: [ 2, 48 ],
                    40: [ 2, 48 ]
                }, {
                    41: [ 1, 71 ]
                }, {
                    21: 56,
                    30: 60,
                    31: 73,
                    32: [ 1, 57 ],
                    33: [ 1, 58 ],
                    34: [ 1, 59 ],
                    35: [ 1, 61 ],
                    40: [ 1, 28 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    18: [ 2, 31 ],
                    24: [ 2, 31 ],
                    32: [ 2, 31 ],
                    33: [ 2, 31 ],
                    34: [ 2, 31 ],
                    35: [ 2, 31 ],
                    36: [ 2, 31 ],
                    40: [ 2, 31 ],
                    42: [ 2, 31 ]
                }, {
                    18: [ 2, 33 ],
                    24: [ 2, 33 ],
                    36: [ 2, 33 ],
                    40: [ 2, 33 ]
                } ],
                defaultActions: {
                    3: [ 2, 2 ],
                    16: [ 2, 1 ],
                    50: [ 2, 42 ]
                },
                parseError: function parseError(str, hash) {
                    throw new Error(str);
                },
                parse: function parse(input) {
                    var self = this, stack = [ 0 ], vstack = [ null ], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
                    this.lexer.setInput(input);
                    this.lexer.yy = this.yy;
                    this.yy.lexer = this.lexer;
                    this.yy.parser = this;
                    if (typeof this.lexer.yylloc == "undefined") this.lexer.yylloc = {};
                    var yyloc = this.lexer.yylloc;
                    lstack.push(yyloc);
                    var ranges = this.lexer.options && this.lexer.options.ranges;
                    if (typeof this.yy.parseError === "function") this.parseError = this.yy.parseError;
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
                                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                                    expected.push("'" + this.terminals_[p] + "'");
                                }
                                if (this.lexer.showPosition) {
                                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                                } else {
                                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1 ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
                                }
                                this.parseError(errStr, {
                                    text: this.lexer.match,
                                    token: this.terminals_[symbol] || symbol,
                                    line: this.lexer.yylineno,
                                    loc: yyloc,
                                    expected: expected
                                });
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
                                if (recovering > 0) recovering--;
                            } else {
                                symbol = preErrorSymbol;
                                preErrorSymbol = null;
                            }
                            break;

                          case 2:
                            len = this.productions_[action[1]][1];
                            yyval.$ = vstack[vstack.length - len];
                            yyval._$ = {
                                first_line: lstack[lstack.length - (len || 1)].first_line,
                                last_line: lstack[lstack.length - 1].last_line,
                                first_column: lstack[lstack.length - (len || 1)].first_column,
                                last_column: lstack[lstack.length - 1].last_column
                            };
                            if (ranges) {
                                yyval._$.range = [ lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1] ];
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
                    left: open.charAt(2) === "~",
                    right: close.charAt(0) === "~" || close.charAt(1) === "~"
                };
            }
            var lexer = function() {
                var lexer = {
                    EOF: 1,
                    parseError: function parseError(str, hash) {
                        if (this.yy.parser) {
                            this.yy.parser.parseError(str, hash);
                        } else {
                            throw new Error(str);
                        }
                    },
                    setInput: function(input) {
                        this._input = input;
                        this._more = this._less = this.done = false;
                        this.yylineno = this.yyleng = 0;
                        this.yytext = this.matched = this.match = "";
                        this.conditionStack = [ "INITIAL" ];
                        this.yylloc = {
                            first_line: 1,
                            first_column: 0,
                            last_line: 1,
                            last_column: 0
                        };
                        if (this.options.ranges) this.yylloc.range = [ 0, 0 ];
                        this.offset = 0;
                        return this;
                    },
                    input: function() {
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
                    unput: function(ch) {
                        var len = ch.length;
                        var lines = ch.split(/(?:\r\n?|\n)/g);
                        this._input = ch + this._input;
                        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
                        this.offset -= len;
                        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
                        this.match = this.match.substr(0, this.match.length - 1);
                        this.matched = this.matched.substr(0, this.matched.length - 1);
                        if (lines.length - 1) this.yylineno -= lines.length - 1;
                        var r = this.yylloc.range;
                        this.yylloc = {
                            first_line: this.yylloc.first_line,
                            last_line: this.yylineno + 1,
                            first_column: this.yylloc.first_column,
                            last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
                        };
                        if (this.options.ranges) {
                            this.yylloc.range = [ r[0], r[0] + this.yyleng - len ];
                        }
                        return this;
                    },
                    more: function() {
                        this._more = true;
                        return this;
                    },
                    less: function(n) {
                        this.unput(this.match.slice(n));
                    },
                    pastInput: function() {
                        var past = this.matched.substr(0, this.matched.length - this.match.length);
                        return (past.length > 20 ? "..." : "") + past.substr(-20).replace(/\n/g, "");
                    },
                    upcomingInput: function() {
                        var next = this.match;
                        if (next.length < 20) {
                            next += this._input.substr(0, 20 - next.length);
                        }
                        return (next.substr(0, 20) + (next.length > 20 ? "..." : "")).replace(/\n/g, "");
                    },
                    showPosition: function() {
                        var pre = this.pastInput();
                        var c = new Array(pre.length + 1).join("-");
                        return pre + this.upcomingInput() + "\n" + c + "^";
                    },
                    next: function() {
                        if (this.done) {
                            return this.EOF;
                        }
                        if (!this._input) this.done = true;
                        var token, match, tempMatch, index, col, lines;
                        if (!this._more) {
                            this.yytext = "";
                            this.match = "";
                        }
                        var rules = this._currentRules();
                        for (var i = 0; i < rules.length; i++) {
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
                            this.yylloc = {
                                first_line: this.yylloc.last_line,
                                last_line: this.yylineno + 1,
                                first_column: this.yylloc.last_column,
                                last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length
                            };
                            this.yytext += match[0];
                            this.match += match[0];
                            this.matches = match;
                            this.yyleng = this.yytext.length;
                            if (this.options.ranges) {
                                this.yylloc.range = [ this.offset, this.offset += this.yyleng ];
                            }
                            this._more = false;
                            this._input = this._input.slice(match[0].length);
                            this.matched += match[0];
                            token = this.performAction.call(this, this.yy, this, rules[index], this.conditionStack[this.conditionStack.length - 1]);
                            if (this.done && this._input) this.done = false;
                            if (token) return token; else return;
                        }
                        if (this._input === "") {
                            return this.EOF;
                        } else {
                            return this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), {
                                text: "",
                                token: null,
                                line: this.yylineno
                            });
                        }
                    },
                    lex: function lex() {
                        var r = this.next();
                        if (typeof r !== "undefined") {
                            return r;
                        } else {
                            return this.lex();
                        }
                    },
                    begin: function begin(condition) {
                        this.conditionStack.push(condition);
                    },
                    popState: function popState() {
                        return this.conditionStack.pop();
                    },
                    _currentRules: function _currentRules() {
                        return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
                    },
                    topState: function() {
                        return this.conditionStack[this.conditionStack.length - 2];
                    },
                    pushState: function begin(condition) {
                        this.begin(condition);
                    }
                };
                lexer.options = {};
                lexer.performAction = function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
                    function strip(start, end) {
                        return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng - end);
                    }
                    var YYSTATE = YY_START;
                    switch ($avoiding_name_collisions) {
                      case 0:
                        if (yy_.yytext.slice(-2) === "\\\\") {
                            strip(0, 1);
                            this.begin("mu");
                        } else if (yy_.yytext.slice(-1) === "\\") {
                            strip(0, 1);
                            this.begin("emu");
                        } else {
                            this.begin("mu");
                        }
                        if (yy_.yytext) return 14;
                        break;

                      case 1:
                        return 14;
                        break;

                      case 2:
                        this.popState();
                        return 14;
                        break;

                      case 3:
                        strip(0, 4);
                        this.popState();
                        return 15;
                        break;

                      case 4:
                        return 35;
                        break;

                      case 5:
                        return 36;
                        break;

                      case 6:
                        return 25;
                        break;

                      case 7:
                        return 16;
                        break;

                      case 8:
                        return 20;
                        break;

                      case 9:
                        return 19;
                        break;

                      case 10:
                        return 19;
                        break;

                      case 11:
                        return 23;
                        break;

                      case 12:
                        return 22;
                        break;

                      case 13:
                        this.popState();
                        this.begin("com");
                        break;

                      case 14:
                        strip(3, 5);
                        this.popState();
                        return 15;
                        break;

                      case 15:
                        return 22;
                        break;

                      case 16:
                        return 41;
                        break;

                      case 17:
                        return 40;
                        break;

                      case 18:
                        return 40;
                        break;

                      case 19:
                        return 44;
                        break;

                      case 20:
                        break;

                      case 21:
                        this.popState();
                        return 24;
                        break;

                      case 22:
                        this.popState();
                        return 18;
                        break;

                      case 23:
                        yy_.yytext = strip(1, 2).replace(/\\"/g, '"');
                        return 32;
                        break;

                      case 24:
                        yy_.yytext = strip(1, 2).replace(/\\'/g, "'");
                        return 32;
                        break;

                      case 25:
                        return 42;
                        break;

                      case 26:
                        return 34;
                        break;

                      case 27:
                        return 34;
                        break;

                      case 28:
                        return 33;
                        break;

                      case 29:
                        return 40;
                        break;

                      case 30:
                        yy_.yytext = strip(1, 2);
                        return 40;
                        break;

                      case 31:
                        return "INVALID";
                        break;

                      case 32:
                        return 5;
                        break;
                    }
                };
                lexer.rules = [ /^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:[\s\S]*?--\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{!--)/, /^(?:\{\{![\s\S]*?\}\})/, /^(?:\{\{(~)?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)])))/, /^(?:false(?=([~}\s)])))/, /^(?:-?[0-9]+(?=([~}\s)])))/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)]))))/, /^(?:\[[^\]]*\])/, /^(?:.)/, /^(?:$)/ ];
                lexer.conditions = {
                    mu: {
                        rules: [ 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32 ],
                        inclusive: false
                    },
                    emu: {
                        rules: [ 2 ],
                        inclusive: false
                    },
                    com: {
                        rules: [ 3 ],
                        inclusive: false
                    },
                    INITIAL: {
                        rules: [ 0, 1, 32 ],
                        inclusive: true
                    }
                };
                return lexer;
            }();
            parser.lexer = lexer;
            function Parser() {
                this.yy = {};
            }
            Parser.prototype = parser;
            parser.Parser = Parser;
            return new Parser();
        }();
        __exports__ = handlebars;
        return __exports__;
    }();
    var __module8__ = function(__dependency1__, __dependency2__) {
        "use strict";
        var __exports__ = {};
        var parser = __dependency1__;
        var AST = __dependency2__;
        __exports__.parser = parser;
        function parse(input) {
            if (input.constructor === AST.ProgramNode) {
                return input;
            }
            parser.yy = AST;
            return parser.parse(input);
        }
        __exports__.parse = parse;
        return __exports__;
    }(__module9__, __module7__);
    var __module10__ = function(__dependency1__) {
        "use strict";
        var __exports__ = {};
        var Exception = __dependency1__;
        function Compiler() {}
        __exports__.Compiler = Compiler;
        Compiler.prototype = {
            compiler: Compiler,
            disassemble: function() {
                var opcodes = this.opcodes, opcode, out = [], params, param;
                for (var i = 0, l = opcodes.length; i < l; i++) {
                    opcode = opcodes[i];
                    if (opcode.opcode === "DECLARE") {
                        out.push("DECLARE " + opcode.name + "=" + opcode.value);
                    } else {
                        params = [];
                        for (var j = 0; j < opcode.args.length; j++) {
                            param = opcode.args[j];
                            if (typeof param === "string") {
                                param = '"' + param.replace("\n", "\\n") + '"';
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
                    var opcode = this.opcodes[i], otherOpcode = other.opcodes[i];
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
                this.depths = {
                    list: []
                };
                this.options = options;
                var knownHelpers = this.options.knownHelpers;
                this.options.knownHelpers = {
                    helperMissing: true,
                    blockHelperMissing: true,
                    each: true,
                    "if": true,
                    unless: true,
                    "with": true,
                    log: true
                };
                if (knownHelpers) {
                    for (var name in knownHelpers) {
                        this.options.knownHelpers[name] = knownHelpers[name];
                    }
                }
                return this.accept(program);
            },
            accept: function(node) {
                var strip = node.strip || {}, ret;
                if (strip.left) {
                    this.opcode("strip");
                }
                ret = this[node.type](node);
                if (strip.right) {
                    this.opcode("strip");
                }
                return ret;
            },
            program: function(program) {
                var statements = program.statements;
                for (var i = 0, l = statements.length; i < l; i++) {
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
                for (var i = 0, l = result.depths.list.length; i < l; i++) {
                    depth = result.depths.list[i];
                    if (depth < 2) {
                        continue;
                    } else {
                        this.addDepth(depth - 1);
                    }
                }
                return guid;
            },
            block: function(block) {
                var mustache = block.mustache, program = block.program, inverse = block.inverse;
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
                    this.opcode("pushProgram", program);
                    this.opcode("pushProgram", inverse);
                    this.opcode("emptyHash");
                    this.opcode("blockValue");
                } else {
                    this.ambiguousSexpr(sexpr, program, inverse);
                    this.opcode("pushProgram", program);
                    this.opcode("pushProgram", inverse);
                    this.opcode("emptyHash");
                    this.opcode("ambiguousBlockValue");
                }
                this.opcode("append");
            },
            hash: function(hash) {
                var pairs = hash.pairs, pair, val;
                this.opcode("pushHash");
                for (var i = 0, l = pairs.length; i < l; i++) {
                    pair = pairs[i];
                    val = pair[1];
                    if (this.options.stringParams) {
                        if (val.depth) {
                            this.addDepth(val.depth);
                        }
                        this.opcode("getContext", val.depth || 0);
                        this.opcode("pushStringParam", val.stringModeValue, val.type);
                        if (val.type === "sexpr") {
                            this.sexpr(val);
                        }
                    } else {
                        this.accept(val);
                    }
                    this.opcode("assignToHash", pair[0]);
                }
                this.opcode("popHash");
            },
            partial: function(partial) {
                var partialName = partial.partialName;
                this.usePartial = true;
                if (partial.context) {
                    this.ID(partial.context);
                } else {
                    this.opcode("push", "depth0");
                }
                this.opcode("invokePartial", partialName.name);
                this.opcode("append");
            },
            content: function(content) {
                this.opcode("appendContent", content.string);
            },
            mustache: function(mustache) {
                this.sexpr(mustache.sexpr);
                if (mustache.escaped && !this.options.noEscape) {
                    this.opcode("appendEscaped");
                } else {
                    this.opcode("append");
                }
            },
            ambiguousSexpr: function(sexpr, program, inverse) {
                var id = sexpr.id, name = id.parts[0], isBlock = program != null || inverse != null;
                this.opcode("getContext", id.depth);
                this.opcode("pushProgram", program);
                this.opcode("pushProgram", inverse);
                this.opcode("invokeAmbiguous", name, isBlock);
            },
            simpleSexpr: function(sexpr) {
                var id = sexpr.id;
                if (id.type === "DATA") {
                    this.DATA(id);
                } else if (id.parts.length) {
                    this.ID(id);
                } else {
                    this.addDepth(id.depth);
                    this.opcode("getContext", id.depth);
                    this.opcode("pushContext");
                }
                this.opcode("resolvePossibleLambda");
            },
            helperSexpr: function(sexpr, program, inverse) {
                var params = this.setupFullMustacheParams(sexpr, program, inverse), name = sexpr.id.parts[0];
                if (this.options.knownHelpers[name]) {
                    this.opcode("invokeKnownHelper", params.length, name);
                } else if (this.options.knownHelpersOnly) {
                    throw new Exception("You specified knownHelpersOnly, but used the unknown helper " + name, sexpr);
                } else {
                    this.opcode("invokeHelper", params.length, name, sexpr.isRoot);
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
                this.opcode("getContext", id.depth);
                var name = id.parts[0];
                if (!name) {
                    this.opcode("pushContext");
                } else {
                    this.opcode("lookupOnContext", id.parts[0]);
                }
                for (var i = 1, l = id.parts.length; i < l; i++) {
                    this.opcode("lookup", id.parts[i]);
                }
            },
            DATA: function(data) {
                this.options.data = true;
                if (data.id.isScoped || data.id.depth) {
                    throw new Exception("Scoped data references are not supported: " + data.original, data);
                }
                this.opcode("lookupData");
                var parts = data.id.parts;
                for (var i = 0, l = parts.length; i < l; i++) {
                    this.opcode("lookup", parts[i]);
                }
            },
            STRING: function(string) {
                this.opcode("pushString", string.string);
            },
            INTEGER: function(integer) {
                this.opcode("pushLiteral", integer.integer);
            },
            BOOLEAN: function(bool) {
                this.opcode("pushLiteral", bool.bool);
            },
            comment: function() {},
            opcode: function(name) {
                this.opcodes.push({
                    opcode: name,
                    args: [].slice.call(arguments, 1)
                });
            },
            declare: function(name, value) {
                this.opcodes.push({
                    opcode: "DECLARE",
                    name: name,
                    value: value
                });
            },
            addDepth: function(depth) {
                if (depth === 0) {
                    return;
                }
                if (!this.depths[depth]) {
                    this.depths[depth] = true;
                    this.depths.list.push(depth);
                }
            },
            classifySexpr: function(sexpr) {
                var isHelper = sexpr.isHelper;
                var isEligible = sexpr.eligibleHelper;
                var options = this.options;
                if (isEligible && !isHelper) {
                    var name = sexpr.id.parts[0];
                    if (options.knownHelpers[name]) {
                        isHelper = true;
                    } else if (options.knownHelpersOnly) {
                        isEligible = false;
                    }
                }
                if (isHelper) {
                    return "helper";
                } else if (isEligible) {
                    return "ambiguous";
                } else {
                    return "simple";
                }
            },
            pushParams: function(params) {
                var i = params.length, param;
                while (i--) {
                    param = params[i];
                    if (this.options.stringParams) {
                        if (param.depth) {
                            this.addDepth(param.depth);
                        }
                        this.opcode("getContext", param.depth || 0);
                        this.opcode("pushStringParam", param.stringModeValue, param.type);
                        if (param.type === "sexpr") {
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
                this.opcode("pushProgram", program);
                this.opcode("pushProgram", inverse);
                if (sexpr.hash) {
                    this.hash(sexpr.hash);
                } else {
                    this.opcode("emptyHash");
                }
                return params;
            }
        };
        function precompile(input, options, env) {
            if (input == null || typeof input !== "string" && input.constructor !== env.AST.ProgramNode) {
                throw new Exception("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
            }
            options = options || {};
            if (!("data" in options)) {
                options.data = true;
            }
            var ast = env.parse(input);
            var environment = new env.Compiler().compile(ast, options);
            return new env.JavaScriptCompiler().compile(environment, options);
        }
        __exports__.precompile = precompile;
        function compile(input, options, env) {
            if (input == null || typeof input !== "string" && input.constructor !== env.AST.ProgramNode) {
                throw new Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
            }
            options = options || {};
            if (!("data" in options)) {
                options.data = true;
            }
            var compiled;
            function compileInput() {
                var ast = env.parse(input);
                var environment = new env.Compiler().compile(ast, options);
                var templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
                return env.template(templateSpec);
            }
            return function(context, options) {
                if (!compiled) {
                    compiled = compileInput();
                }
                return compiled.call(this, context, options);
            };
        }
        __exports__.compile = compile;
        return __exports__;
    }(__module5__);
    var __module11__ = function(__dependency1__, __dependency2__) {
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
            nameLookup: function(parent, name) {
                var wrap, ret;
                if (parent.indexOf("depth") === 0) {
                    wrap = true;
                }
                if (/^[0-9]+$/.test(name)) {
                    ret = parent + "[" + name + "]";
                } else if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
                    ret = parent + "." + name;
                } else {
                    ret = parent + "['" + name + "']";
                }
                if (wrap) {
                    return "(" + parent + " && " + ret + ")";
                } else {
                    return ret;
                }
            },
            compilerInfo: function() {
                var revision = COMPILER_REVISION, versions = REVISION_CHANGES[revision];
                return "this.compilerInfo = [" + revision + ",'" + versions + "'];\n";
            },
            appendToBuffer: function(string) {
                if (this.environment.isSimple) {
                    return "return " + string + ";";
                } else {
                    return {
                        appendToBuffer: true,
                        content: string,
                        toString: function() {
                            return "buffer += " + string + ";";
                        }
                    };
                }
            },
            initializeBuffer: function() {
                return this.quotedString("");
            },
            namespace: "Handlebars",
            compile: function(environment, options, context, asObject) {
                this.environment = environment;
                this.options = options || {};
                log("debug", this.environment.disassemble() + "\n\n");
                this.name = this.environment.name;
                this.isChild = !!context;
                this.context = context || {
                    programs: [],
                    environments: [],
                    aliases: {}
                };
                this.preamble();
                this.stackSlot = 0;
                this.stackVars = [];
                this.registers = {
                    list: []
                };
                this.hashes = [];
                this.compileStack = [];
                this.inlineStack = [];
                this.compileChildren(environment, options);
                var opcodes = environment.opcodes, opcode;
                this.i = 0;
                for (var l = opcodes.length; this.i < l; this.i++) {
                    opcode = opcodes[this.i];
                    if (opcode.opcode === "DECLARE") {
                        this[opcode.name] = opcode.value;
                    } else {
                        this[opcode.opcode].apply(this, opcode.args);
                    }
                    if (opcode.opcode !== this.stripNext) {
                        this.stripNext = false;
                    }
                }
                this.pushSource("");
                if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
                    throw new Exception("Compile completed with content left on stack");
                }
                return this.createFunctionContext(asObject);
            },
            preamble: function() {
                var out = [];
                if (!this.isChild) {
                    var namespace = this.namespace;
                    var copies = "helpers = this.merge(helpers, " + namespace + ".helpers);";
                    if (this.environment.usePartial) {
                        copies = copies + " partials = this.merge(partials, " + namespace + ".partials);";
                    }
                    if (this.options.data) {
                        copies = copies + " data = data || {};";
                    }
                    out.push(copies);
                } else {
                    out.push("");
                }
                if (!this.environment.isSimple) {
                    out.push(", buffer = " + this.initializeBuffer());
                } else {
                    out.push("");
                }
                this.lastContext = 0;
                this.source = out;
            },
            createFunctionContext: function(asObject) {
                var locals = this.stackVars.concat(this.registers.list);
                if (locals.length > 0) {
                    this.source[1] = this.source[1] + ", " + locals.join(", ");
                }
                if (!this.isChild) {
                    for (var alias in this.context.aliases) {
                        if (this.context.aliases.hasOwnProperty(alias)) {
                            this.source[1] = this.source[1] + ", " + alias + "=" + this.context.aliases[alias];
                        }
                    }
                }
                if (this.source[1]) {
                    this.source[1] = "var " + this.source[1].substring(2) + ";";
                }
                if (!this.isChild) {
                    this.source[1] += "\n" + this.context.programs.join("\n") + "\n";
                }
                if (!this.environment.isSimple) {
                    this.pushSource("return buffer;");
                }
                var params = this.isChild ? [ "depth0", "data" ] : [ "Handlebars", "depth0", "helpers", "partials", "data" ];
                for (var i = 0, l = this.environment.depths.list.length; i < l; i++) {
                    params.push("depth" + this.environment.depths.list[i]);
                }
                var source = this.mergeSource();
                if (!this.isChild) {
                    source = this.compilerInfo() + source;
                }
                if (asObject) {
                    params.push(source);
                    return Function.apply(this, params);
                } else {
                    var functionSource = "function " + (this.name || "") + "(" + params.join(",") + ") {\n  " + source + "}";
                    log("debug", functionSource + "\n\n");
                    return functionSource;
                }
            },
            mergeSource: function() {
                var source = "", buffer;
                for (var i = 0, len = this.source.length; i < len; i++) {
                    var line = this.source[i];
                    if (line.appendToBuffer) {
                        if (buffer) {
                            buffer = buffer + "\n    + " + line.content;
                        } else {
                            buffer = line.content;
                        }
                    } else {
                        if (buffer) {
                            source += "buffer += " + buffer + ";\n  ";
                            buffer = undefined;
                        }
                        source += line + "\n  ";
                    }
                }
                return source;
            },
            blockValue: function() {
                this.context.aliases.blockHelperMissing = "helpers.blockHelperMissing";
                var params = [ "depth0" ];
                this.setupParams(0, params);
                this.replaceStack(function(current) {
                    params.splice(1, 0, current);
                    return "blockHelperMissing.call(" + params.join(", ") + ")";
                });
            },
            ambiguousBlockValue: function() {
                this.context.aliases.blockHelperMissing = "helpers.blockHelperMissing";
                var params = [ "depth0" ];
                this.setupParams(0, params);
                var current = this.topStack();
                params.splice(1, 0, current);
                this.pushSource("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
            },
            appendContent: function(content) {
                if (this.pendingContent) {
                    content = this.pendingContent + content;
                }
                if (this.stripNext) {
                    content = content.replace(/^\s+/, "");
                }
                this.pendingContent = content;
            },
            strip: function() {
                if (this.pendingContent) {
                    this.pendingContent = this.pendingContent.replace(/\s+$/, "");
                }
                this.stripNext = "strip";
            },
            append: function() {
                this.flushInline();
                var local = this.popStack();
                this.pushSource("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }");
                if (this.environment.isSimple) {
                    this.pushSource("else { " + this.appendToBuffer("''") + " }");
                }
            },
            appendEscaped: function() {
                this.context.aliases.escapeExpression = "this.escapeExpression";
                this.pushSource(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
            },
            getContext: function(depth) {
                if (this.lastContext !== depth) {
                    this.lastContext = depth;
                }
            },
            lookupOnContext: function(name) {
                this.push(this.nameLookup("depth" + this.lastContext, name, "context"));
            },
            pushContext: function() {
                this.pushStackLiteral("depth" + this.lastContext);
            },
            resolvePossibleLambda: function() {
                this.context.aliases.functionType = '"function"';
                this.replaceStack(function(current) {
                    return "typeof " + current + " === functionType ? " + current + ".apply(depth0) : " + current;
                });
            },
            lookup: function(name) {
                this.replaceStack(function(current) {
                    return current + " == null || " + current + " === false ? " + current + " : " + this.nameLookup(current, name, "context");
                });
            },
            lookupData: function() {
                this.pushStackLiteral("data");
            },
            pushStringParam: function(string, type) {
                this.pushStackLiteral("depth" + this.lastContext);
                this.pushString(type);
                if (type !== "sexpr") {
                    if (typeof string === "string") {
                        this.pushString(string);
                    } else {
                        this.pushStackLiteral(string);
                    }
                }
            },
            emptyHash: function() {
                this.pushStackLiteral("{}");
                if (this.options.stringParams) {
                    this.push("{}");
                    this.push("{}");
                }
            },
            pushHash: function() {
                if (this.hash) {
                    this.hashes.push(this.hash);
                }
                this.hash = {
                    values: [],
                    types: [],
                    contexts: []
                };
            },
            popHash: function() {
                var hash = this.hash;
                this.hash = this.hashes.pop();
                if (this.options.stringParams) {
                    this.push("{" + hash.contexts.join(",") + "}");
                    this.push("{" + hash.types.join(",") + "}");
                }
                this.push("{\n    " + hash.values.join(",\n    ") + "\n  }");
            },
            pushString: function(string) {
                this.pushStackLiteral(this.quotedString(string));
            },
            push: function(expr) {
                this.inlineStack.push(expr);
                return expr;
            },
            pushLiteral: function(value) {
                this.pushStackLiteral(value);
            },
            pushProgram: function(guid) {
                if (guid != null) {
                    this.pushStackLiteral(this.programExpression(guid));
                } else {
                    this.pushStackLiteral(null);
                }
            },
            invokeHelper: function(paramSize, name, isRoot) {
                this.context.aliases.helperMissing = "helpers.helperMissing";
                this.useRegister("helper");
                var helper = this.lastHelper = this.setupHelper(paramSize, name, true);
                var nonHelper = this.nameLookup("depth" + this.lastContext, name, "context");
                var lookup = "helper = " + helper.name + " || " + nonHelper;
                if (helper.paramsInit) {
                    lookup += "," + helper.paramsInit;
                }
                this.push("(" + lookup + ",helper " + "? helper.call(" + helper.callParams + ") " + ": helperMissing.call(" + helper.helperMissingParams + "))");
                if (!isRoot) {
                    this.flushInline();
                }
            },
            invokeKnownHelper: function(paramSize, name) {
                var helper = this.setupHelper(paramSize, name);
                this.push(helper.name + ".call(" + helper.callParams + ")");
            },
            invokeAmbiguous: function(name, helperCall) {
                this.context.aliases.functionType = '"function"';
                this.useRegister("helper");
                this.emptyHash();
                var helper = this.setupHelper(0, name, helperCall);
                var helperName = this.lastHelper = this.nameLookup("helpers", name, "helper");
                var nonHelper = this.nameLookup("depth" + this.lastContext, name, "context");
                var nextStack = this.nextStack();
                if (helper.paramsInit) {
                    this.pushSource(helper.paramsInit);
                }
                this.pushSource("if (helper = " + helperName + ") { " + nextStack + " = helper.call(" + helper.callParams + "); }");
                this.pushSource("else { helper = " + nonHelper + "; " + nextStack + " = typeof helper === functionType ? helper.call(" + helper.callParams + ") : helper; }");
            },
            invokePartial: function(name) {
                var params = [ this.nameLookup("partials", name, "partial"), "'" + name + "'", this.popStack(), "helpers", "partials" ];
                if (this.options.data) {
                    params.push("data");
                }
                this.context.aliases.self = "this";
                this.push("self.invokePartial(" + params.join(", ") + ")");
            },
            assignToHash: function(key) {
                var value = this.popStack(), context, type;
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
            compiler: JavaScriptCompiler,
            compileChildren: function(environment, options) {
                var children = environment.children, child, compiler;
                for (var i = 0, l = children.length; i < l; i++) {
                    child = children[i];
                    compiler = new this.compiler();
                    var index = this.matchExistingProgram(child);
                    if (index == null) {
                        this.context.programs.push("");
                        index = this.context.programs.length;
                        child.index = index;
                        child.name = "program" + index;
                        this.context.programs[index] = compiler.compile(child, options, this.context);
                        this.context.environments[index] = child;
                    } else {
                        child.index = index;
                        child.name = "program" + index;
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
                if (guid == null) {
                    return "self.noop";
                }
                var child = this.environment.children[guid], depths = child.depths.list, depth;
                var programParams = [ child.index, child.name, "data" ];
                for (var i = 0, l = depths.length; i < l; i++) {
                    depth = depths[i];
                    if (depth === 1) {
                        programParams.push("depth0");
                    } else {
                        programParams.push("depth" + (depth - 1));
                    }
                }
                return (depths.length === 0 ? "self.program(" : "self.programWithDepth(") + programParams.join(", ") + ")";
            },
            register: function(name, val) {
                this.useRegister(name);
                this.pushSource(name + " = " + val + ";");
            },
            useRegister: function(name) {
                if (!this.registers[name]) {
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
                var prefix = "", inline = this.isInline(), stack, createdStack, usedLiteral;
                if (inline) {
                    var top = this.popStack(true);
                    if (top instanceof Literal) {
                        stack = top.value;
                        usedLiteral = true;
                    } else {
                        createdStack = !this.stackSlot;
                        var name = !createdStack ? this.topStackName() : this.incrStack();
                        prefix = "(" + this.push(name) + " = " + top + "),";
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
                    this.push("(" + prefix + item + ")");
                } else {
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
                if (this.stackSlot > this.stackVars.length) {
                    this.stackVars.push("stack" + this.stackSlot);
                }
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
                var inline = this.isInline(), item = (inline ? this.inlineStack : this.compileStack).pop();
                if (!wrapped && item instanceof Literal) {
                    return item.value;
                } else {
                    if (!inline) {
                        if (!this.stackSlot) {
                            throw new Exception("Invalid stack pop");
                        }
                        this.stackSlot--;
                    }
                    return item;
                }
            },
            topStack: function(wrapped) {
                var stack = this.isInline() ? this.inlineStack : this.compileStack, item = stack[stack.length - 1];
                if (!wrapped && item instanceof Literal) {
                    return item.value;
                } else {
                    return item;
                }
            },
            quotedString: function(str) {
                return '"' + str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") + '"';
            },
            setupHelper: function(paramSize, name, missingParams) {
                var params = [], paramsInit = this.setupParams(paramSize, params, missingParams);
                var foundHelper = this.nameLookup("helpers", name, "helper");
                return {
                    params: params,
                    paramsInit: paramsInit,
                    name: foundHelper,
                    callParams: [ "depth0" ].concat(params).join(", "),
                    helperMissingParams: missingParams && [ "depth0", this.quotedString(name) ].concat(params).join(", ")
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
                for (var i = 0; i < paramSize; i++) {
                    param = this.popStack();
                    params.push(param);
                    if (this.options.stringParams) {
                        types.push(this.popStack());
                        contexts.push(this.popStack());
                    }
                }
                if (this.options.stringParams) {
                    options.push("contexts:[" + contexts.join(",") + "]");
                    options.push("types:[" + types.join(",") + "]");
                }
                if (this.options.data) {
                    options.push("data:data");
                }
                return options;
            },
            setupParams: function(paramSize, params, useRegister) {
                var options = "{" + this.setupOptions(paramSize, params).join(",") + "}";
                if (useRegister) {
                    this.useRegister("options");
                    params.push("options");
                    return "options=" + options;
                } else {
                    params.push(options);
                    return "";
                }
            }
        };
        var reservedWords = ("break else new var" + " case finally return void" + " catch for switch while" + " continue function this with" + " default if throw" + " delete in try" + " do instanceof typeof" + " abstract enum int short" + " boolean export interface static" + " byte extends long super" + " char final native synchronized" + " class float package throws" + " const goto private transient" + " debugger implements protected volatile" + " double import public let yield").split(" ");
        var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};
        for (var i = 0, l = reservedWords.length; i < l; i++) {
            compilerWords[reservedWords[i]] = true;
        }
        JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
            if (!JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name)) {
                return true;
            }
            return false;
        };
        __exports__ = JavaScriptCompiler;
        return __exports__;
    }(__module2__, __module5__);
    var __module0__ = function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
        "use strict";
        var __exports__;
        var Handlebars = __dependency1__;
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
            hb.precompile = function(input, options) {
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
    }(__module1__, __module7__, __module8__, __module10__, __module11__);
    return __module0__;
}();

(function($) {
    $.fn.hoverIntent = function(handlerIn, handlerOut, selector) {
        var cfg = {
            interval: 100,
            sensitivity: 7,
            timeout: 0
        };
        if (typeof handlerIn === "object") {
            cfg = $.extend(cfg, handlerIn);
        } else if ($.isFunction(handlerOut)) {
            cfg = $.extend(cfg, {
                over: handlerIn,
                out: handlerOut,
                selector: selector
            });
        } else {
            cfg = $.extend(cfg, {
                over: handlerIn,
                out: handlerIn,
                selector: handlerOut
            });
        }
        var cX, cY, pX, pY;
        var track = function(ev) {
            cX = ev.pageX;
            cY = ev.pageY;
        };
        var compare = function(ev, ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            if (Math.abs(pX - cX) + Math.abs(pY - cY) < cfg.sensitivity) {
                $(ob).off("mousemove.hoverIntent", track);
                ob.hoverIntent_s = 1;
                return cfg.over.apply(ob, [ ev ]);
            } else {
                pX = cX;
                pY = cY;
                ob.hoverIntent_t = setTimeout(function() {
                    compare(ev, ob);
                }, cfg.interval);
            }
        };
        var delay = function(ev, ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            ob.hoverIntent_s = 0;
            return cfg.out.apply(ob, [ ev ]);
        };
        var handleHover = function(e) {
            var ev = jQuery.extend({}, e);
            var ob = this;
            if (ob.hoverIntent_t) {
                ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            }
            if (e.type == "mouseenter") {
                pX = ev.pageX;
                pY = ev.pageY;
                $(ob).on("mousemove.hoverIntent", track);
                if (ob.hoverIntent_s != 1) {
                    ob.hoverIntent_t = setTimeout(function() {
                        compare(ev, ob);
                    }, cfg.interval);
                }
            } else {
                $(ob).off("mousemove.hoverIntent", track);
                if (ob.hoverIntent_s == 1) {
                    ob.hoverIntent_t = setTimeout(function() {
                        delay(ev, ob);
                    }, cfg.timeout);
                }
            }
        };
        return this.on({
            "mouseenter.hoverIntent": handleHover,
            "mouseleave.hoverIntent": handleHover
        }, cfg.selector);
    };
})(jQuery);

(function(c) {
    var S = 0, J = function() {
        var c = navigator.userAgent, a = /msie\s\d+/i;
        return 0 < c.search(a) ? (c = a.exec(c).toString(), c = c.split(" ")[1], 9 > c ? !0 : !1) : !1;
    }(), E;
    try {
        document.createEvent("TouchEvent"), E = !0;
    } catch (da) {
        E = !1;
    }
    var I = {
        init: function(m) {
            var a = c.extend({
                min: 10,
                max: 100,
                from: null,
                to: null,
                type: "single",
                step: 1,
                prefix: "",
                postfix: "",
                hasGrid: !1,
                hideText: !1,
                prettify: !0,
                onChange: null,
                onFinish: null
            }, m), r = '<span class="irs">', r = r + '<span class="irs-line"><span class="irs-line-left"></span><span class="irs-line-mid"></span><span class="irs-line-right"></span></span>', r = r + '<span class="irs-min">0</span><span class="irs-max">1</span>', r = r + '<span class="irs-from">0</span><span class="irs-to">0</span><span class="irs-single">0</span>', r = r + "</span>", r = r + '<span class="irs-grid"></span>', F = '<span class="irs-diapason"></span>', F = F + '<span class="irs-slider from"></span>', F = F + '<span class="irs-slider to"></span>';
            return this.each(function() {
                var e = c(this);
                if (!e.data("isActive")) {
                    e.data("isActive", !0);
                    S++;
                    this.pluginCount = S;
                    "number" !== typeof a.from && (a.from = a.min);
                    "number" !== typeof a.to && (a.to = a.max);
                    e.attr("value") && (a.min = parseInt(e.attr("value").split(";")[0], 10), a.max = parseInt(e.attr("value").split(";")[1], 10));
                    "number" === typeof e.data("from") && (a.from = parseInt(e.data("from"), 10));
                    "number" === typeof e.data("to") && (a.to = parseInt(e.data("to"), 10));
                    e.data("step") && (a.step = parseFloat(e.data("step")));
                    e.data("type") && (a.type = e.data("type"));
                    e.data("prefix") && (a.prefix = e.data("prefix"));
                    e.data("postfix") && (a.postfix = e.data("postfix"));
                    e.data("hasgrid") && (a.hasGrid = e.data("hasgrid"));
                    e.data("hidetext") && (a.hideText = e.data("hidetext"));
                    e.data("prettify") && (a.prettify = e.data("prettify"));
                    a.from < a.min && (a.from = a.min);
                    a.to > a.max && (a.to = a.max);
                    "double" === a.type && (a.from > a.to && (a.from = a.to), a.to < a.from && (a.to = a.from));
                    var m = function(b) {
                        b = b.toString();
                        a.prettify && (b = b.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1 "));
                        return b;
                    }, I = '<span class="irs" id="irs-' + this.pluginCount + '"></span>';
                    e[0].style.display = "none";
                    e.before(I);
                    var w = c("#irs-" + this.pluginCount), T = c(document.body), U = c(window), f, B, C, x, y, t, z, n, s, u, P, V, q = !1, v = !1, W = !0, g = {}, Q = 0, K = 0, L = 0, k = 0, A = 0, G = 0, R = 0, M = 0, N = 0, X = 0, p = 0;
                    parseInt(a.step, 10) !== parseFloat(a.step) && (p = a.step.toString().split(".")[1], 
                    p = Math.pow(10, p.length));
                    this.updateData = function(b) {
                        a = c.extend(a, b);
                        w.find("*").off();
                        w.html("");
                        Y();
                    };
                    this.removeSlider = function() {
                        w.find("*").off();
                        w.html("").remove();
                        e.data("isActive", !1);
                        e.show();
                    };
                    var Y = function() {
                        w.html(r);
                        f = w.find(".irs");
                        B = f.find(".irs-min");
                        C = f.find(".irs-max");
                        x = f.find(".irs-from");
                        y = f.find(".irs-to");
                        t = f.find(".irs-single");
                        V = w.find(".irs-grid");
                        a.hideText ? (B[0].style.display = "none", C[0].style.display = "none", x[0].style.display = "none", 
                        y[0].style.display = "none", t[0].style.display = "none") : (B.html(a.prefix + m(a.min) + a.postfix), 
                        C.html(a.prefix + m(a.max) + a.postfix));
                        K = B.outerWidth();
                        L = C.outerWidth();
                        if ("single" === a.type) {
                            if (f.append('<span class="irs-slider single"></span>'), z = f.find(".single"), 
                            z.on("mousedown", function(a) {
                                a.preventDefault();
                                a.stopPropagation();
                                D(a, c(this), null);
                                v = q = !0;
                                J && c("*").prop("unselectable", !0);
                            }), E) z.on("touchstart", function(a) {
                                a.preventDefault();
                                a.stopPropagation();
                                D(a.originalEvent.touches[0], c(this), null);
                                v = q = !0;
                            });
                        } else "double" === a.type && (f.append(F), n = f.find(".from"), s = f.find(".to"), 
                        P = f.find(".irs-diapason"), H(), n.on("mousedown", function(a) {
                            a.preventDefault();
                            a.stopPropagation();
                            c(this).addClass("last");
                            s.removeClass("last");
                            D(a, c(this), "from");
                            v = q = !0;
                            J && c("*").prop("unselectable", !0);
                        }), s.on("mousedown", function(a) {
                            a.preventDefault();
                            a.stopPropagation();
                            c(this).addClass("last");
                            n.removeClass("last");
                            D(a, c(this), "to");
                            v = q = !0;
                            J && c("*").prop("unselectable", !0);
                        }), E && (n.on("touchstart", function(a) {
                            a.preventDefault();
                            a.stopPropagation();
                            c(this).addClass("last");
                            s.removeClass("last");
                            D(a.originalEvent.touches[0], c(this), "from");
                            v = q = !0;
                        }), s.on("touchstart", function(a) {
                            a.preventDefault();
                            a.stopPropagation();
                            c(this).addClass("last");
                            n.removeClass("last");
                            D(a.originalEvent.touches[0], c(this), "to");
                            v = q = !0;
                        })), a.to === a.max && n.addClass("last"));
                        T.on("mouseup", function() {
                            q && (q = v = !1, u.removeAttr("id"), u = null, "double" === a.type && H(), O(), 
                            J && c("*").prop("unselectable", !1));
                        });
                        T.on("mousemove", function(a) {
                            q && (Q = a.pageX, Z());
                        });
                        E && (U.on("touchend", function() {
                            q && (q = v = !1, u.removeAttr("id"), u = null, "double" === a.type && H(), O());
                        }), U.on("touchmove", function(a) {
                            q && (Q = a.originalEvent.touches[0].pageX, Z());
                        }));
                        $();
                        ba();
                        a.hasGrid && ca();
                    }, $ = function() {
                        k = f.width();
                        G = z ? z.width() : n.width();
                        A = k - G;
                    }, D = function(b, d, l) {
                        $();
                        W = !1;
                        u = d;
                        u.attr("id", "irs-active-slider");
                        d = u.offset().left;
                        X = d + (b.pageX - d) - u.position().left;
                        "single" === a.type ? R = f.width() - G : "double" === a.type && ("from" === l ? (M = 0, 
                        N = parseInt(s.css("left"), 10)) : (M = parseInt(n.css("left"), 10), N = f.width() - G));
                    }, H = function() {
                        var a = n.width(), d = parseInt(n[0].style.left, 10) || n.position().left, l = (parseInt(s[0].style.left, 10) || s.position().left) - d;
                        P[0].style.left = d + a / 2 + "px";
                        P[0].style.width = l + "px";
                    }, Z = function() {
                        var b = Math.round(Q - X);
                        "single" === a.type ? (0 > b && (b = 0), b > R && (b = R), O()) : "double" === a.type && (b < M && (b = M), 
                        b > N && (b = N), O(), H());
                        u[0].style.left = b + "px";
                    }, O = function() {
                        var b = {
                            fromNumber: 0,
                            toNumber: 0,
                            fromPers: 0,
                            toPers: 0,
                            fromX: 0,
                            toX: 0
                        }, d = a.max - a.min, l;
                        "single" === a.type ? (b.fromX = parseInt(z[0].style.left, 10) || z.position().left, 
                        b.fromPers = 100 * (b.fromX / A), l = d / 100 * b.fromPers + parseInt(a.min, 10), 
                        b.fromNumber = Math.round(l / a.step) * a.step, p && (b.fromNumber = parseInt(b.fromNumber * p, 10) / p)) : "double" === a.type && (b.fromX = parseInt(n[0].style.left, 10) || n.position().left, 
                        b.fromPers = 100 * (b.fromX / A), l = d / 100 * b.fromPers + parseInt(a.min, 10), 
                        b.fromNumber = Math.round(l / a.step) * a.step, b.toX = parseInt(s[0].style.left, 10) || s.position().left, 
                        b.toPers = 100 * (b.toX / A), d = d / 100 * b.toPers + parseInt(a.min, 10), b.toNumber = Math.round(d / a.step) * a.step, 
                        p && (b.fromNumber = parseInt(b.fromNumber * p, 10) / p, b.toNumber = parseInt(b.toNumber * p, 10) / p));
                        g = b;
                        aa();
                    }, ba = function() {
                        var b = {
                            fromNumber: a.from,
                            toNumber: a.to,
                            fromPers: 0,
                            toPers: 0,
                            fromX: 0,
                            toX: 0
                        }, d = a.max - a.min;
                        "single" === a.type ? (b.fromPers = 100 * ((b.fromNumber - a.min) / d), b.fromX = Math.round(A / 100 * b.fromPers), 
                        z[0].style.left = b.fromX + "px") : "double" === a.type && (b.fromPers = 100 * ((b.fromNumber - a.min) / d), 
                        b.fromX = Math.round(A / 100 * b.fromPers), n[0].style.left = b.fromX + "px", b.toPers = 100 * ((b.toNumber - a.min) / d), 
                        b.toX = Math.round(A / 100 * b.toPers), s[0].style.left = b.toX + "px", H());
                        g = b;
                        aa();
                    }, aa = function() {
                        var b, d, l, c, f, h;
                        h = G / 2;
                        "single" === a.type ? (a.hideText || (x[0].style.display = "none", y[0].style.display = "none", 
                        l = a.prefix + m(g.fromNumber) + a.postfix, t.html(l), f = t.outerWidth(), h = g.fromX - f / 2 + h, 
                        0 > h && (h = 0), h > k - f && (h = k - f), t[0].style.left = h + "px", B[0].style.display = h < K ? "none" : "block", 
                        C[0].style.display = h + f > k - L ? "none" : "block"), e.attr("value", parseInt(g.fromNumber, 10))) : "double" === a.type && (a.hideText || (b = a.prefix + m(g.fromNumber) + a.postfix, 
                        d = a.prefix + m(g.toNumber) + a.postfix, l = g.fromNumber != g.toNumber ? a.prefix + m(g.fromNumber) + " — " + a.prefix + m(g.toNumber) + a.postfix : a.prefix + m(g.fromNumber) + a.postfix, 
                        x.html(b), y.html(d), t.html(l), b = x.outerWidth(), d = g.fromX - b / 2 + h, 0 > d && (d = 0), 
                        d > k - b && (d = k - b), x[0].style.left = d + "px", l = y.outerWidth(), c = g.toX - l / 2 + h, 
                        0 > c && (c = 0), c > k - l && (c = k - l), y[0].style.left = c + "px", f = t.outerWidth(), 
                        h = g.fromX + (g.toX - g.fromX) / 2 - f / 2 + h, 0 > h && (h = 0), h > k - f && (h = k - f), 
                        t[0].style.left = h + "px", d + b < c ? (t[0].style.display = "none", x[0].style.display = "block", 
                        y[0].style.display = "block") : (t[0].style.display = "block", x[0].style.display = "none", 
                        y[0].style.display = "none"), B[0].style.display = h < K || d < K ? "none" : "block", 
                        C[0].style.display = h + f > k - L || c + l > k - L ? "none" : "block"), e.attr("value", parseInt(g.fromNumber, 10) + ";" + parseInt(g.toNumber, 10)));
                        "function" === typeof a.onChange && a.onChange.call(this, g);
                        "function" !== typeof a.onFinish || v || W || a.onFinish.call(this, g);
                    }, ca = function() {
                        w.addClass("irs-with-grid");
                        var b, d = "", c = 0, c = 0, e = "";
                        for (b = 0; 20 >= b; b++) c = Math.floor(k / 20 * b), c >= k && (c = k - 1), e += '<span class="irs-grid-pol small" style="left: ' + c + 'px;"></span>';
                        for (b = 0; 4 >= b; b++) c = Math.floor(k / 4 * b), c >= k && (c = k - 1), e += '<span class="irs-grid-pol" style="left: ' + c + 'px;"></span>', 
                        p ? (d = a.min + (a.max - a.min) / 4 * b, d = d / a.step * a.step, d = parseInt(d * p, 10) / p) : (d = Math.round(a.min + (a.max - a.min) / 4 * b), 
                        d = Math.round(d / a.step) * a.step, d = m(d)), 0 === b ? e += '<span class="irs-grid-text" style="left: ' + c + 'px; text-align: left;">' + d + "</span>" : 4 === b ? (c -= 100, 
                        e += '<span class="irs-grid-text" style="left: ' + c + 'px; text-align: right;">' + d + "</span>") : (c -= 50, 
                        e += '<span class="irs-grid-text" style="left: ' + c + 'px;">' + d + "</span>");
                        V.html(e);
                    };
                    Y();
                }
            });
        },
        update: function(c) {
            return this.each(function() {
                this.updateData(c);
            });
        },
        remove: function() {
            return this.each(function() {
                this.removeSlider();
            });
        }
    };
    c.fn.ionRangeSlider = function(m) {
        if (I[m]) return I[m].apply(this, Array.prototype.slice.call(arguments, 1));
        if ("object" !== typeof m && m) c.error("Method " + m + " does not exist for jQuery.ionRangeSlider"); else return I.init.apply(this, arguments);
    };
})(jQuery);

(function($) {
    "use strict";
    var default_options = {
        i18n: {
            bg: {
                months: [ "Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември" ],
                dayOfWeek: [ "Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб" ]
            },
            ru: {
                months: [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ],
                dayOfWeek: [ "Вск", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб" ]
            },
            en: {
                months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
                dayOfWeek: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ]
            },
            de: {
                months: [ "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember" ],
                dayOfWeek: [ "So", "Mo", "Di", "Mi", "Do", "Fr", "Sa" ]
            },
            nl: {
                months: [ "januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december" ],
                dayOfWeek: [ "zo", "ma", "di", "wo", "do", "vr", "za" ]
            },
            tr: {
                months: [ "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" ],
                dayOfWeek: [ "Paz", "Pts", "Sal", "Çar", "Per", "Cum", "Cts" ]
            },
            fr: {
                months: [ "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre" ],
                dayOfWeek: [ "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam" ]
            },
            es: {
                months: [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ],
                dayOfWeek: [ "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb" ]
            },
            th: {
                months: [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม" ],
                dayOfWeek: [ "อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส." ]
            },
            pl: {
                months: [ "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień" ],
                dayOfWeek: [ "nd", "pn", "wt", "śr", "cz", "pt", "sb" ]
            },
            pt: {
                months: [ "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro" ],
                dayOfWeek: [ "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab" ]
            },
            ch: {
                months: [ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ],
                dayOfWeek: [ "日", "一", "二", "三", "四", "五", "六" ]
            },
            se: {
                months: [ "Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December" ],
                dayOfWeek: [ "Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör" ]
            },
            kr: {
                months: [ "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월" ],
                dayOfWeek: [ "일", "월", "화", "수", "목", "금", "토" ]
            },
            it: {
                months: [ "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre" ],
                dayOfWeek: [ "Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab" ]
            },
            da: {
                months: [ "January", "Februar", "Marts", "April", "Maj", "Juni", "July", "August", "September", "Oktober", "November", "December" ],
                dayOfWeek: [ "Søn", "Man", "Tir", "ons", "Tor", "Fre", "lør" ]
            },
            ja: {
                months: [ "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月" ],
                dayOfWeek: [ "日", "月", "火", "水", "木", "金", "土" ]
            },
            vi: {
                months: [ "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12" ],
                dayOfWeek: [ "CN", "T2", "T3", "T4", "T5", "T6", "T7" ]
            }
        },
        value: "",
        lang: "en",
        format: "Y/m/d H:i",
        formatTime: "H:i",
        formatDate: "Y/m/d",
        startDate: false,
        step: 60,
        closeOnDateSelect: false,
        closeOnWithoutClick: true,
        timepicker: true,
        datepicker: true,
        minDate: false,
        maxDate: false,
        minTime: false,
        maxTime: false,
        allowTimes: [],
        opened: false,
        initTime: true,
        inline: false,
        onSelectDate: function() {},
        onSelectTime: function() {},
        onChangeMonth: function() {},
        onChangeDateTime: function() {},
        onShow: function() {},
        onClose: function() {},
        onGenerate: function() {},
        withoutCopyright: true,
        inverseButton: false,
        hours12: false,
        next: "xdsoft_next",
        prev: "xdsoft_prev",
        dayOfWeekStart: 0,
        timeHeightInTimePicker: 25,
        timepickerScrollbar: true,
        todayButton: true,
        defaultSelect: true,
        scrollMonth: true,
        scrollTime: true,
        scrollInput: true,
        lazyInit: false,
        mask: false,
        validateOnBlur: true,
        allowBlank: true,
        yearStart: 1950,
        yearEnd: 2050,
        style: "",
        id: "",
        roundTime: "round",
        className: "",
        weekends: [],
        yearOffset: 0
    };
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(obj, start) {
            for (var i = start || 0, j = this.length; i < j; i++) {
                if (this[i] === obj) {
                    return i;
                }
            }
            return -1;
        };
    }
    $.fn.xdsoftScroller = function(_percent) {
        return this.each(function() {
            var timeboxparent = $(this);
            if (!$(this).hasClass("xdsoft_scroller_box")) {
                var pointerEventToXY = function(e) {
                    var out = {
                        x: 0,
                        y: 0
                    };
                    if (e.type == "touchstart" || e.type == "touchmove" || e.type == "touchend" || e.type == "touchcancel") {
                        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                        out.x = touch.pageX;
                        out.y = touch.pageY;
                    } else if (e.type == "mousedown" || e.type == "mouseup" || e.type == "mousemove" || e.type == "mouseover" || e.type == "mouseout" || e.type == "mouseenter" || e.type == "mouseleave") {
                        out.x = e.pageX;
                        out.y = e.pageY;
                    }
                    return out;
                }, move = 0, timebox = timeboxparent.children().eq(0), parentHeight = timeboxparent[0].clientHeight, height = timebox[0].offsetHeight, scrollbar = $('<div class="xdsoft_scrollbar"></div>'), scroller = $('<div class="xdsoft_scroller"></div>'), maximumOffset = 100, start = false;
                scrollbar.append(scroller);
                timeboxparent.addClass("xdsoft_scroller_box").append(scrollbar);
                scroller.on("mousedown.xdsoft_scroller", function(event) {
                    if (!parentHeight) timeboxparent.trigger("resize_scroll.xdsoft_scroller", [ _percent ]);
                    var pageY = event.pageY, top = parseInt(scroller.css("margin-top")), h1 = scrollbar[0].offsetHeight;
                    $(document.body).addClass("xdsoft_noselect");
                    $([ document.body, window ]).on("mouseup.xdsoft_scroller", function arguments_callee() {
                        $([ document.body, window ]).off("mouseup.xdsoft_scroller", arguments_callee).off("mousemove.xdsoft_scroller", move).removeClass("xdsoft_noselect");
                    });
                    $(document.body).on("mousemove.xdsoft_scroller", move = function(event) {
                        var offset = event.pageY - pageY + top;
                        if (offset < 0) offset = 0;
                        if (offset + scroller[0].offsetHeight > h1) offset = h1 - scroller[0].offsetHeight;
                        timeboxparent.trigger("scroll_element.xdsoft_scroller", [ maximumOffset ? offset / maximumOffset : 0 ]);
                    });
                });
                timeboxparent.on("scroll_element.xdsoft_scroller", function(event, percent) {
                    if (!parentHeight) timeboxparent.trigger("resize_scroll.xdsoft_scroller", [ percent, true ]);
                    percent = percent > 1 ? 1 : percent < 0 || isNaN(percent) ? 0 : percent;
                    scroller.css("margin-top", maximumOffset * percent);
                    timebox.css("marginTop", -parseInt((height - parentHeight) * percent));
                }).on("resize_scroll.xdsoft_scroller", function(event, _percent, noTriggerScroll) {
                    parentHeight = timeboxparent[0].clientHeight;
                    height = timebox[0].offsetHeight;
                    var percent = parentHeight / height, sh = percent * scrollbar[0].offsetHeight;
                    if (percent > 1) scroller.hide(); else {
                        scroller.show();
                        scroller.css("height", parseInt(sh > 10 ? sh : 10));
                        maximumOffset = scrollbar[0].offsetHeight - scroller[0].offsetHeight;
                        if (noTriggerScroll !== true) timeboxparent.trigger("scroll_element.xdsoft_scroller", [ _percent ? _percent : Math.abs(parseInt(timebox.css("marginTop"))) / (height - parentHeight) ]);
                    }
                });
                timeboxparent.mousewheel && timeboxparent.mousewheel(function(event, delta, deltaX, deltaY) {
                    var top = Math.abs(parseInt(timebox.css("marginTop")));
                    timeboxparent.trigger("scroll_element.xdsoft_scroller", [ (top - delta * 20) / (height - parentHeight) ]);
                    event.stopPropagation();
                    return false;
                });
                timeboxparent.on("touchstart", function(event) {
                    start = pointerEventToXY(event);
                });
                timeboxparent.on("touchmove", function(event) {
                    if (start) {
                        var coord = pointerEventToXY(event), top = Math.abs(parseInt(timebox.css("marginTop")));
                        timeboxparent.trigger("scroll_element.xdsoft_scroller", [ (top - (coord.y - start.y)) / (height - parentHeight) ]);
                        event.stopPropagation();
                        event.preventDefault();
                    }
                });
                timeboxparent.on("touchend touchcancel", function(event) {
                    start = false;
                });
            }
            timeboxparent.trigger("resize_scroll.xdsoft_scroller", [ _percent ]);
        });
    };
    $.fn.datetimepicker = function(opt) {
        var KEY0 = 48, KEY9 = 57, _KEY0 = 96, _KEY9 = 105, CTRLKEY = 17, DEL = 46, ENTER = 13, ESC = 27, BACKSPACE = 8, ARROWLEFT = 37, ARROWUP = 38, ARROWRIGHT = 39, ARROWDOWN = 40, TAB = 9, F5 = 116, AKEY = 65, CKEY = 67, VKEY = 86, ZKEY = 90, YKEY = 89, ctrlDown = false, options = $.isPlainObject(opt) || !opt ? $.extend(true, {}, default_options, opt) : $.extend({}, default_options), lazyInitTimer = 0, lazyInit = function(input) {
            input.on("open.xdsoft focusin.xdsoft mousedown.xdsoft", function initOnActionCallback(event) {
                if (input.is(":disabled") || input.is(":hidden") || !input.is(":visible") || input.data("xdsoft_datetimepicker")) return;
                clearTimeout(lazyInitTimer);
                lazyInitTimer = setTimeout(function() {
                    if (!input.data("xdsoft_datetimepicker")) createDateTimePicker(input);
                    input.off("open.xdsoft focusin.xdsoft mousedown.xdsoft", initOnActionCallback).trigger("open.xdsoft");
                }, 100);
            });
        }, createDateTimePicker = function(input) {
            var datetimepicker = $("<div " + (options.id ? 'id="' + options.id + '"' : "") + " " + (options.style ? 'style="' + options.style + '"' : "") + ' class="xdsoft_datetimepicker xdsoft_noselect ' + options.className + '"></div>'), xdsoft_copyright = $('<div class="xdsoft_copyright"><a target="_blank" href="http://xdsoft.net/jqplugins/datetimepicker/">xdsoft.net</a></div>'), datepicker = $('<div class="xdsoft_datepicker active"></div>'), mounth_picker = $('<div class="xdsoft_mounthpicker"><button type="button" class="xdsoft_prev"></button><button type="button" class="xdsoft_today_button"></button><div class="xdsoft_label xdsoft_month"><span></span></div><div class="xdsoft_label xdsoft_year"><span></span></div><button type="button" class="xdsoft_next"></button></div>'), calendar = $('<div class="xdsoft_calendar"></div>'), timepicker = $('<div class="xdsoft_timepicker active"><button type="button" class="xdsoft_prev"></button><div class="xdsoft_time_box"></div><button type="button" class="xdsoft_next"></button></div>'), timeboxparent = timepicker.find(".xdsoft_time_box").eq(0), timebox = $('<div class="xdsoft_time_variant"></div>'), scrollbar = $('<div class="xdsoft_scrollbar"></div>'), scroller = $('<div class="xdsoft_scroller"></div>'), monthselect = $('<div class="xdsoft_select xdsoft_monthselect"><div></div></div>'), yearselect = $('<div class="xdsoft_select xdsoft_yearselect"><div></div></div>');
            mounth_picker.find(".xdsoft_month span").after(monthselect);
            mounth_picker.find(".xdsoft_year span").after(yearselect);
            mounth_picker.find(".xdsoft_month,.xdsoft_year").on("mousedown.xdsoft", function(event) {
                mounth_picker.find(".xdsoft_select").hide();
                var select = $(this).find(".xdsoft_select").eq(0), val = 0, top = 0;
                if (_xdsoft_datetime.currentTime) val = _xdsoft_datetime.currentTime[$(this).hasClass("xdsoft_month") ? "getMonth" : "getFullYear"]();
                select.show();
                for (var items = select.find("div.xdsoft_option"), i = 0; i < items.length; i++) {
                    if (items.eq(i).data("value") == val) {
                        break;
                    } else top += items[0].offsetHeight;
                }
                select.xdsoftScroller(top / (select.children()[0].offsetHeight - select[0].clientHeight));
                event.stopPropagation();
                return false;
            });
            mounth_picker.find(".xdsoft_select").xdsoftScroller().on("mousedown.xdsoft", function(event) {
                event.stopPropagation();
                event.preventDefault();
            }).on("mousedown.xdsoft", ".xdsoft_option", function(event) {
                if (_xdsoft_datetime && _xdsoft_datetime.currentTime) _xdsoft_datetime.currentTime[$(this).parent().parent().hasClass("xdsoft_monthselect") ? "setMonth" : "setFullYear"]($(this).data("value"));
                $(this).parent().parent().hide();
                datetimepicker.trigger("xchange.xdsoft");
                options.onChangeMonth && options.onChangeMonth.call && options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data("input"));
            });
            datetimepicker.setOptions = function(_options) {
                options = $.extend(true, {}, options, _options);
                if (_options.allowTimes && $.isArray(_options.allowTimes) && _options.allowTimes.length) {
                    options["allowTimes"] = $.extend(true, [], _options.allowTimes);
                }
                if (_options.weekends && $.isArray(_options.weekends) && _options.weekends.length) {
                    options["weekends"] = $.extend(true, [], _options.weekends);
                }
                if ((options.open || options.opened) && !options.inline) {
                    input.trigger("open.xdsoft");
                }
                if (options.inline) {
                    datetimepicker.addClass("xdsoft_inline");
                    input.after(datetimepicker).hide();
                    datetimepicker.trigger("afterOpen.xdsoft");
                }
                if (options.inverseButton) {
                    options.next = "xdsoft_prev";
                    options.prev = "xdsoft_next";
                }
                if (options.datepicker) datepicker.addClass("active"); else datepicker.removeClass("active");
                if (options.timepicker) timepicker.addClass("active"); else timepicker.removeClass("active");
                if (options.value) {
                    input && input.val && input.val(options.value);
                    _xdsoft_datetime.setCurrentTime(options.value);
                }
                if (isNaN(options.dayOfWeekStart) || parseInt(options.dayOfWeekStart) < 0 || parseInt(options.dayOfWeekStart) > 6) options.dayOfWeekStart = 0; else options.dayOfWeekStart = parseInt(options.dayOfWeekStart);
                if (!options.timepickerScrollbar) scrollbar.hide();
                if (options.minDate && /^-(.*)$/.test(options.minDate)) {
                    options.minDate = _xdsoft_datetime.strToDateTime(options.minDate).dateFormat(options.formatDate);
                }
                if (options.maxDate && /^\+(.*)$/.test(options.maxDate)) {
                    options.maxDate = _xdsoft_datetime.strToDateTime(options.maxDate).dateFormat(options.formatDate);
                }
                mounth_picker.find(".xdsoft_today_button").css("visibility", !options.todayButton ? "hidden" : "visible");
                if (options.mask) {
                    var e, getCaretPos = function(input) {
                        try {
                            if (document.selection && document.selection.createRange) {
                                var range = document.selection.createRange();
                                return range.getBookmark().charCodeAt(2) - 2;
                            } else if (input.setSelectionRange) return input.selectionStart;
                        } catch (e) {
                            return 0;
                        }
                    }, setCaretPos = function(node, pos) {
                        var node = typeof node == "string" || node instanceof String ? document.getElementById(node) : node;
                        if (!node) {
                            return false;
                        } else if (node.createTextRange) {
                            var textRange = node.createTextRange();
                            textRange.collapse(true);
                            textRange.moveEnd(pos);
                            textRange.moveStart(pos);
                            textRange.select();
                            return true;
                        } else if (node.setSelectionRange) {
                            node.setSelectionRange(pos, pos);
                            return true;
                        }
                        return false;
                    }, isValidValue = function(mask, value) {
                        var reg = mask.replace(/([\[\]\/\{\}\(\)\-\.\+]{1})/g, "\\$1").replace(/_/g, "{digit+}").replace(/([0-9]{1})/g, "{digit$1}").replace(/\{digit([0-9]{1})\}/g, "[0-$1_]{1}").replace(/\{digit[\+]\}/g, "[0-9_]{1}");
                        return RegExp(reg).test(value);
                    };
                    input.off("keydown.xdsoft");
                    switch (true) {
                      case options.mask === true:
                        options.mask = options.format.replace(/Y/g, "9999").replace(/F/g, "9999").replace(/m/g, "19").replace(/d/g, "39").replace(/H/g, "29").replace(/i/g, "59").replace(/s/g, "59");

                      case $.type(options.mask) == "string":
                        if (!isValidValue(options.mask, input.val())) input.val(options.mask.replace(/[0-9]/g, "_"));
                        input.on("keydown.xdsoft", function(event) {
                            var val = this.value, key = event.which;
                            switch (true) {
                              case key >= KEY0 && key <= KEY9 || key >= _KEY0 && key <= _KEY9 || key == BACKSPACE || key == DEL:
                                var pos = getCaretPos(this), digit = key != BACKSPACE && key != DEL ? String.fromCharCode(_KEY0 <= key && key <= _KEY9 ? key - KEY0 : key) : "_";
                                if ((key == BACKSPACE || key == DEL) && pos) {
                                    pos--;
                                    digit = "_";
                                }
                                while (/[^0-9_]/.test(options.mask.substr(pos, 1)) && pos < options.mask.length && pos > 0) pos += key == BACKSPACE || key == DEL ? -1 : 1;
                                val = val.substr(0, pos) + digit + val.substr(pos + 1);
                                if ($.trim(val) == "") {
                                    val = options.mask.replace(/[0-9]/g, "_");
                                } else {
                                    if (pos == options.mask.length) break;
                                }
                                pos += key == BACKSPACE || key == DEL ? 0 : 1;
                                while (/[^0-9_]/.test(options.mask.substr(pos, 1)) && pos < options.mask.length && pos > 0) pos += key == BACKSPACE || key == DEL ? -1 : 1;
                                if (isValidValue(options.mask, val)) {
                                    this.value = val;
                                    setCaretPos(this, pos);
                                } else if ($.trim(val) == "") this.value = options.mask.replace(/[0-9]/g, "_"); else {
                                    input.trigger("error_input.xdsoft");
                                }
                                break;

                              case !!~[ AKEY, CKEY, VKEY, ZKEY, YKEY ].indexOf(key) && ctrlDown:
                              case !!~[ ESC, ARROWUP, ARROWDOWN, ARROWLEFT, ARROWRIGHT, F5, CTRLKEY, TAB, ENTER ].indexOf(key):
                                return true;
                            }
                            event.preventDefault();
                            return false;
                        });
                        break;
                    }
                }
                if (options.validateOnBlur) {
                    input.off("blur.xdsoft").on("blur.xdsoft", function() {
                        if (options.allowBlank && !$.trim($(this).val()).length) {
                            $(this).val(null);
                            datetimepicker.data("xdsoft_datetime").empty();
                        } else if (!Date.parseDate($(this).val(), options.format)) {
                            $(this).val(_xdsoft_datetime.now().dateFormat(options.format));
                            datetimepicker.data("xdsoft_datetime").setCurrentTime($(this).val());
                        } else {
                            datetimepicker.data("xdsoft_datetime").setCurrentTime($(this).val());
                        }
                        datetimepicker.trigger("changedatetime.xdsoft");
                    });
                }
                options.dayOfWeekStartPrev = options.dayOfWeekStart == 0 ? 6 : options.dayOfWeekStart - 1;
                datetimepicker.trigger("xchange.xdsoft");
            };
            datetimepicker.data("options", options).on("mousedown.xdsoft", function(event) {
                event.stopPropagation();
                event.preventDefault();
                yearselect.hide();
                monthselect.hide();
                return false;
            });
            var scroll_element = timepicker.find(".xdsoft_time_box");
            scroll_element.append(timebox);
            scroll_element.xdsoftScroller();
            datetimepicker.on("afterOpen.xdsoft", function() {
                scroll_element.xdsoftScroller();
            });
            datetimepicker.append(datepicker).append(timepicker);
            if (options.withoutCopyright !== true) datetimepicker.append(xdsoft_copyright);
            datepicker.append(mounth_picker).append(calendar);
            $("body").append(datetimepicker);
            var _xdsoft_datetime = new function() {
                var _this = this;
                _this.now = function() {
                    var d = new Date();
                    if (options.yearOffset) d.setFullYear(d.getFullYear() + options.yearOffset);
                    return d;
                };
                _this.currentTime = this.now();
                _this.isValidDate = function(d) {
                    if (Object.prototype.toString.call(d) !== "[object Date]") return false;
                    return !isNaN(d.getTime());
                };
                _this.setCurrentTime = function(dTime) {
                    _this.currentTime = typeof dTime == "string" ? _this.strToDateTime(dTime) : _this.isValidDate(dTime) ? dTime : _this.now();
                    datetimepicker.trigger("xchange.xdsoft");
                };
                _this.empty = function() {
                    _this.currentTime = null;
                };
                _this.getCurrentTime = function(dTime) {
                    return _this.currentTime;
                };
                _this.nextMonth = function() {
                    var month = _this.currentTime.getMonth() + 1;
                    if (month == 12) {
                        _this.currentTime.setFullYear(_this.currentTime.getFullYear() + 1);
                        month = 0;
                    }
                    _this.currentTime.setDate(Math.min(Date.daysInMonth[month], _this.currentTime.getDate()));
                    _this.currentTime.setMonth(month);
                    options.onChangeMonth && options.onChangeMonth.call && options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data("input"));
                    datetimepicker.trigger("xchange.xdsoft");
                    return month;
                };
                _this.prevMonth = function() {
                    var month = _this.currentTime.getMonth() - 1;
                    if (month == -1) {
                        _this.currentTime.setFullYear(_this.currentTime.getFullYear() - 1);
                        month = 11;
                    }
                    _this.currentTime.setDate(Math.min(Date.daysInMonth[month], _this.currentTime.getDate()));
                    _this.currentTime.setMonth(month);
                    options.onChangeMonth && options.onChangeMonth.call && options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data("input"));
                    datetimepicker.trigger("xchange.xdsoft");
                    return month;
                };
                _this.strToDateTime = function(sDateTime) {
                    var tmpDate = [], timeOffset, currentTime;
                    if ((tmpDate = /^(\+|\-)(.*)$/.exec(sDateTime)) && (tmpDate[2] = Date.parseDate(tmpDate[2], options.formatDate))) {
                        timeOffset = tmpDate[2].getTime() - 1 * tmpDate[2].getTimezoneOffset() * 6e4;
                        currentTime = new Date(_xdsoft_datetime.now().getTime() + parseInt(tmpDate[1] + "1") * timeOffset);
                    } else currentTime = sDateTime ? Date.parseDate(sDateTime, options.format) : _this.now();
                    if (!_this.isValidDate(currentTime)) currentTime = _this.now();
                    return currentTime;
                };
                _this.strtodate = function(sDate) {
                    var currentTime = sDate ? Date.parseDate(sDate, options.formatDate) : _this.now();
                    if (!_this.isValidDate(currentTime)) currentTime = _this.now();
                    return currentTime;
                };
                _this.strtotime = function(sTime) {
                    var currentTime = sTime ? Date.parseDate(sTime, options.formatTime) : _this.now();
                    if (!_this.isValidDate(currentTime)) currentTime = _this.now();
                    return currentTime;
                };
                _this.str = function() {
                    return _this.currentTime.dateFormat(options.format);
                };
            }();
            mounth_picker.find(".xdsoft_today_button").on("mousedown.xdsoft", function() {
                datetimepicker.data("changed", true);
                _xdsoft_datetime.setCurrentTime(0);
                datetimepicker.trigger("afterOpen.xdsoft");
            }).on("dblclick.xdsoft", function() {
                input.val(_xdsoft_datetime.str());
                datetimepicker.trigger("close.xdsoft");
            });
            mounth_picker.find(".xdsoft_prev,.xdsoft_next").on("mousedown.xdsoft", function() {
                var $this = $(this), timer = 0, stop = false;
                (function arguments_callee1(v) {
                    var month = _xdsoft_datetime.currentTime.getMonth();
                    if ($this.hasClass(options.next)) {
                        _xdsoft_datetime.nextMonth();
                    } else if ($this.hasClass(options.prev)) {
                        _xdsoft_datetime.prevMonth();
                    }
                    !stop && (timer = setTimeout(arguments_callee1, v ? v : 100));
                })(500);
                $([ document.body, window ]).on("mouseup.xdsoft", function arguments_callee2() {
                    clearTimeout(timer);
                    stop = true;
                    $([ document.body, window ]).off("mouseup.xdsoft", arguments_callee2);
                });
            });
            timepicker.find(".xdsoft_prev,.xdsoft_next").on("mousedown.xdsoft", function() {
                var $this = $(this), timer = 0, stop = false, period = 110;
                (function arguments_callee4(v) {
                    var pheight = timeboxparent[0].clientHeight, height = timebox[0].offsetHeight, top = Math.abs(parseInt(timebox.css("marginTop")));
                    if ($this.hasClass(options.next) && height - pheight - options.timeHeightInTimePicker >= top) {
                        timebox.css("marginTop", "-" + (top + options.timeHeightInTimePicker) + "px");
                    } else if ($this.hasClass(options.prev) && top - options.timeHeightInTimePicker >= 0) {
                        timebox.css("marginTop", "-" + (top - options.timeHeightInTimePicker) + "px");
                    }
                    timeboxparent.trigger("scroll_element.xdsoft_scroller", [ Math.abs(parseInt(timebox.css("marginTop")) / (height - pheight)) ]);
                    period = period > 10 ? 10 : period - 10;
                    !stop && (timer = setTimeout(arguments_callee4, v ? v : period));
                })(500);
                $([ document.body, window ]).on("mouseup.xdsoft", function arguments_callee5() {
                    clearTimeout(timer);
                    stop = true;
                    $([ document.body, window ]).off("mouseup.xdsoft", arguments_callee5);
                });
            });
            var xchangeTimer = 0;
            datetimepicker.on("xchange.xdsoft", function(event) {
                clearTimeout(xchangeTimer);
                xchangeTimer = setTimeout(function() {
                    var table = "", start = new Date(_xdsoft_datetime.currentTime.getFullYear(), _xdsoft_datetime.currentTime.getMonth(), 1, 12, 0, 0), i = 0, today = _xdsoft_datetime.now();
                    while (start.getDay() != options.dayOfWeekStart) start.setDate(start.getDate() - 1);
                    table += "<table><thead><tr>";
                    for (var j = 0; j < 7; j++) {
                        table += "<th>" + options.i18n[options.lang].dayOfWeek[j + options.dayOfWeekStart > 6 ? 0 : j + options.dayOfWeekStart] + "</th>";
                    }
                    table += "</tr></thead>";
                    table += "<tbody><tr>";
                    var maxDate = false, minDate = false;
                    if (options.maxDate !== false) {
                        maxDate = _xdsoft_datetime.strtodate(options.maxDate);
                        maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 999);
                    }
                    if (options.minDate !== false) {
                        minDate = _xdsoft_datetime.strtodate(options.minDate);
                        minDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                    }
                    var d, y, m, classes = [];
                    while (i < _xdsoft_datetime.currentTime.getDaysInMonth() || start.getDay() != options.dayOfWeekStart || _xdsoft_datetime.currentTime.getMonth() == start.getMonth()) {
                        classes = [];
                        i++;
                        d = start.getDate();
                        y = start.getFullYear();
                        m = start.getMonth();
                        classes.push("xdsoft_date");
                        if (maxDate !== false && start > maxDate || minDate !== false && start < minDate) {
                            classes.push("xdsoft_disabled");
                        }
                        if (_xdsoft_datetime.currentTime.getMonth() != m) {
                            classes.push("xdsoft_other_month");
                        }
                        if ((options.defaultSelect || datetimepicker.data("changed")) && _xdsoft_datetime.currentTime.dateFormat("d.m.Y") == start.dateFormat("d.m.Y")) {
                            classes.push("xdsoft_current");
                        }
                        if (today.dateFormat("d.m.Y") == start.dateFormat("d.m.Y")) {
                            classes.push("xdsoft_today");
                        }
                        if (start.getDay() == 0 || start.getDay() == 6 || ~options.weekends.indexOf(start.dateFormat("d.m.Y"))) {
                            classes.push("xdsoft_weekend");
                        }
                        if (options.beforeShowDay && typeof options.beforeShowDay == "function") {
                            classes.push(options.beforeShowDay(start));
                        }
                        table += '<td data-date="' + d + '" data-month="' + m + '" data-year="' + y + '"' + ' class="xdsoft_date xdsoft_day_of_week' + start.getDay() + " " + classes.join(" ") + '">' + "<div>" + d + "</div>" + "</td>";
                        if (start.getDay() == options.dayOfWeekStartPrev) {
                            table += "</tr>";
                        }
                        start.setDate(d + 1);
                    }
                    table += "</tbody></table>";
                    calendar.html(table);
                    mounth_picker.find(".xdsoft_label span").eq(0).text(options.i18n[options.lang].months[_xdsoft_datetime.currentTime.getMonth()]);
                    mounth_picker.find(".xdsoft_label span").eq(1).text(_xdsoft_datetime.currentTime.getFullYear());
                    var time = "", h = "", m = "", line_time = function line_time(h, m) {
                        var now = _xdsoft_datetime.now();
                        now.setHours(h);
                        h = parseInt(now.getHours());
                        now.setMinutes(m);
                        m = parseInt(now.getMinutes());
                        classes = [];
                        if (options.maxTime !== false && _xdsoft_datetime.strtotime(options.maxTime).getTime() < now.getTime() || options.minTime !== false && _xdsoft_datetime.strtotime(options.minTime).getTime() > now.getTime()) classes.push("xdsoft_disabled");
                        if ((options.initTime || options.defaultSelect || datetimepicker.data("changed")) && parseInt(_xdsoft_datetime.currentTime.getHours()) == parseInt(h) && (options.step > 59 || Math[options.roundTime](_xdsoft_datetime.currentTime.getMinutes() / options.step) * options.step == parseInt(m))) {
                            if (options.defaultSelect || datetimepicker.data("changed")) {
                                classes.push("xdsoft_current");
                            } else if (options.initTime) {
                                classes.push("xdsoft_init_time");
                            }
                        }
                        if (parseInt(today.getHours()) == parseInt(h) && parseInt(today.getMinutes()) == parseInt(m)) classes.push("xdsoft_today");
                        time += '<div class="xdsoft_time ' + classes.join(" ") + '" data-hour="' + h + '" data-minute="' + m + '">' + now.dateFormat(options.formatTime) + "</div>";
                    };
                    if (!options.allowTimes || !$.isArray(options.allowTimes) || !options.allowTimes.length) {
                        for (var i = 0, j = 0; i < (options.hours12 ? 12 : 24); i++) {
                            for (j = 0; j < 60; j += options.step) {
                                h = (i < 10 ? "0" : "") + i;
                                m = (j < 10 ? "0" : "") + j;
                                line_time(h, m);
                            }
                        }
                    } else {
                        for (var i = 0; i < options.allowTimes.length; i++) {
                            h = _xdsoft_datetime.strtotime(options.allowTimes[i]).getHours();
                            m = _xdsoft_datetime.strtotime(options.allowTimes[i]).getMinutes();
                            line_time(h, m);
                        }
                    }
                    timebox.html(time);
                    var opt = "", i = 0;
                    for (i = parseInt(options.yearStart, 10) + options.yearOffset; i <= parseInt(options.yearEnd, 10) + options.yearOffset; i++) {
                        opt += '<div class="xdsoft_option ' + (_xdsoft_datetime.currentTime.getFullYear() == i ? "xdsoft_current" : "") + '" data-value="' + i + '">' + i + "</div>";
                    }
                    yearselect.children().eq(0).html(opt);
                    for (i = 0, opt = ""; i <= 11; i++) {
                        opt += '<div class="xdsoft_option ' + (_xdsoft_datetime.currentTime.getMonth() == i ? "xdsoft_current" : "") + '" data-value="' + i + '">' + options.i18n[options.lang].months[i] + "</div>";
                    }
                    monthselect.children().eq(0).html(opt);
                    $(this).trigger("generate.xdsoft");
                }, 10);
                event.stopPropagation();
            }).on("afterOpen.xdsoft", function() {
                if (options.timepicker) {
                    var classType;
                    if (timebox.find(".xdsoft_current").length) {
                        classType = ".xdsoft_current";
                    } else if (timebox.find(".xdsoft_init_time").length) {
                        classType = ".xdsoft_init_time";
                    }
                    if (classType) {
                        var pheight = timeboxparent[0].clientHeight, height = timebox[0].offsetHeight, top = timebox.find(classType).index() * options.timeHeightInTimePicker + 1;
                        if (height - pheight < top) top = height - pheight;
                        timebox.css("marginTop", "-" + parseInt(top) + "px");
                        timeboxparent.trigger("scroll_element.xdsoft_scroller", [ parseInt(top) / (height - pheight) ]);
                    }
                }
            });
            var timerclick = 0;
            calendar.on("click.xdsoft", "td", function(xdevent) {
                xdevent.stopPropagation();
                timerclick++;
                var $this = $(this), currentTime = _xdsoft_datetime.currentTime;
                if ($this.hasClass("xdsoft_disabled")) return false;
                currentTime.setDate($this.data("date"));
                currentTime.setMonth($this.data("month"));
                currentTime.setFullYear($this.data("year"));
                datetimepicker.trigger("select.xdsoft", [ currentTime ]);
                input.val(_xdsoft_datetime.str());
                if ((timerclick > 1 || options.closeOnDateSelect === true || options.closeOnDateSelect === 0 && !options.timepicker) && !options.inline) {
                    datetimepicker.trigger("close.xdsoft");
                }
                if (options.onSelectDate && options.onSelectDate.call) {
                    options.onSelectDate.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data("input"));
                }
                datetimepicker.data("changed", true);
                datetimepicker.trigger("xchange.xdsoft");
                datetimepicker.trigger("changedatetime.xdsoft");
                setTimeout(function() {
                    timerclick = 0;
                }, 200);
            });
            timebox.on("click.xdsoft", "div", function(xdevent) {
                xdevent.stopPropagation();
                var $this = $(this), currentTime = _xdsoft_datetime.currentTime;
                if ($this.hasClass("xdsoft_disabled")) return false;
                currentTime.setHours($this.data("hour"));
                currentTime.setMinutes($this.data("minute"));
                datetimepicker.trigger("select.xdsoft", [ currentTime ]);
                datetimepicker.data("input").val(_xdsoft_datetime.str());
                !options.inline && datetimepicker.trigger("close.xdsoft");
                if (options.onSelectTime && options.onSelectTime.call) {
                    options.onSelectTime.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data("input"));
                }
                datetimepicker.data("changed", true);
                datetimepicker.trigger("xchange.xdsoft");
                datetimepicker.trigger("changedatetime.xdsoft");
            });
            datetimepicker.mousewheel && datepicker.mousewheel(function(event, delta, deltaX, deltaY) {
                if (!options.scrollMonth) return true;
                if (delta < 0) _xdsoft_datetime.nextMonth(); else _xdsoft_datetime.prevMonth();
                return false;
            });
            datetimepicker.mousewheel && timeboxparent.unmousewheel().mousewheel(function(event, delta, deltaX, deltaY) {
                if (!options.scrollTime) return true;
                var pheight = timeboxparent[0].clientHeight, height = timebox[0].offsetHeight, top = Math.abs(parseInt(timebox.css("marginTop"))), fl = true;
                if (delta < 0 && height - pheight - options.timeHeightInTimePicker >= top) {
                    timebox.css("marginTop", "-" + (top + options.timeHeightInTimePicker) + "px");
                    fl = false;
                } else if (delta > 0 && top - options.timeHeightInTimePicker >= 0) {
                    timebox.css("marginTop", "-" + (top - options.timeHeightInTimePicker) + "px");
                    fl = false;
                }
                timeboxparent.trigger("scroll_element.xdsoft_scroller", [ Math.abs(parseInt(timebox.css("marginTop")) / (height - pheight)) ]);
                event.stopPropagation();
                return fl;
            });
            datetimepicker.on("changedatetime.xdsoft", function() {
                if (options.onChangeDateTime && options.onChangeDateTime.call) {
                    var $input = datetimepicker.data("input");
                    options.onChangeDateTime.call(datetimepicker, _xdsoft_datetime.currentTime, $input);
                    $input.trigger("change");
                }
            }).on("generate.xdsoft", function() {
                if (options.onGenerate && options.onGenerate.call) options.onGenerate.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data("input"));
            });
            var current_time_index = 0;
            input.mousewheel && input.mousewheel(function(event, delta, deltaX, deltaY) {
                if (!options.scrollInput) return true;
                if (!options.datepicker && options.timepicker) {
                    current_time_index = timebox.find(".xdsoft_current").length ? timebox.find(".xdsoft_current").eq(0).index() : 0;
                    if (current_time_index + delta >= 0 && current_time_index + delta < timebox.children().length) current_time_index += delta;
                    timebox.children().eq(current_time_index).length && timebox.children().eq(current_time_index).trigger("mousedown");
                    return false;
                } else if (options.datepicker && !options.timepicker) {
                    datepicker.trigger(event, [ delta, deltaX, deltaY ]);
                    input.val && input.val(_xdsoft_datetime.str());
                    datetimepicker.trigger("changedatetime.xdsoft");
                    return false;
                }
            });
            var setPos = function() {
                var offset = datetimepicker.data("input").offset(), top = offset.top + datetimepicker.data("input")[0].offsetHeight - 1, left = offset.left;
                if (top + datetimepicker[0].offsetHeight > $(window).height() + $(window).scrollTop()) top = offset.top - datetimepicker[0].offsetHeight + 1;
                if (top < 0) top = 0;
                if (left + datetimepicker[0].offsetWidth > $(window).width()) left = offset.left - datetimepicker[0].offsetWidth + datetimepicker.data("input")[0].offsetWidth;
                datetimepicker.css({
                    left: left,
                    top: top
                });
            };
            datetimepicker.on("open.xdsoft", function() {
                var onShow = true;
                if (options.onShow && options.onShow.call) {
                    onShow = options.onShow.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data("input"));
                }
                if (onShow !== false) {
                    datetimepicker.show();
                    datetimepicker.trigger("afterOpen.xdsoft");
                    setPos();
                    $(window).off("resize.xdsoft", setPos).on("resize.xdsoft", setPos);
                    if (options.closeOnWithoutClick) {
                        $([ document.body, window ]).on("mousedown.xdsoft", function arguments_callee6() {
                            datetimepicker.trigger("close.xdsoft");
                            $([ document.body, window ]).off("mousedown.xdsoft", arguments_callee6);
                        });
                    }
                }
            }).on("close.xdsoft", function(event) {
                var onClose = true;
                if (options.onClose && options.onClose.call) {
                    onClose = options.onClose.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data("input"));
                }
                if (onClose !== false && !options.opened && !options.inline) {
                    datetimepicker.hide();
                }
                event.stopPropagation();
            }).data("input", input);
            var timer = 0, timer1 = 0;
            datetimepicker.data("xdsoft_datetime", _xdsoft_datetime);
            datetimepicker.setOptions(options);
            function getCurrentValue() {
                var ct = options.value ? options.value : input && input.val && input.val() ? input.val() : "";
                if (ct && _xdsoft_datetime.isValidDate(ct = Date.parseDate(ct, options.format))) {
                    datetimepicker.data("changed", true);
                } else ct = "";
                if (!ct && options.startDate !== false) {
                    ct = _xdsoft_datetime.strToDateTime(options.startDate);
                }
                return ct ? ct : 0;
            }
            _xdsoft_datetime.setCurrentTime(getCurrentValue());
            datetimepicker.trigger("afterOpen.xdsoft");
            input.data("xdsoft_datetimepicker", datetimepicker).on("open.xdsoft focusin.xdsoft mousedown.xdsoft", function(event) {
                if (input.is(":disabled") || input.is(":hidden") || !input.is(":visible")) return;
                clearTimeout(timer);
                timer = setTimeout(function() {
                    if (input.is(":disabled") || input.is(":hidden") || !input.is(":visible")) return;
                    _xdsoft_datetime.setCurrentTime(getCurrentValue());
                    datetimepicker.trigger("open.xdsoft");
                }, 100);
            }).on("keydown.xdsoft", function(event) {
                var val = this.value, key = event.which;
                switch (true) {
                  case !!~[ ENTER ].indexOf(key):
                    var elementSelector = $("input:visible,textarea:visible");
                    datetimepicker.trigger("close.xdsoft");
                    elementSelector.eq(elementSelector.index(this) + 1).focus();
                    return false;

                  case !!~[ TAB ].indexOf(key):
                    datetimepicker.trigger("close.xdsoft");
                    return true;
                }
            });
        }, destroyDateTimePicker = function(input) {
            var datetimepicker = input.data("xdsoft_datetimepicker");
            if (datetimepicker) {
                datetimepicker.data("xdsoft_datetime", null);
                datetimepicker.remove();
                input.data("xdsoft_datetimepicker", null).off("open.xdsoft focusin.xdsoft focusout.xdsoft mousedown.xdsoft blur.xdsoft keydown.xdsoft");
                $(window).off("resize.xdsoft");
                $([ window, document.body ]).off("mousedown.xdsoft");
                input.unmousewheel && input.unmousewheel();
            }
        };
        $(document).off("keydown.xdsoftctrl keyup.xdsoftctrl").on("keydown.xdsoftctrl", function(e) {
            if (e.keyCode == CTRLKEY) ctrlDown = true;
        }).on("keyup.xdsoftctrl", function(e) {
            if (e.keyCode == CTRLKEY) ctrlDown = false;
        });
        return this.each(function() {
            var datetimepicker;
            if (datetimepicker = $(this).data("xdsoft_datetimepicker")) {
                if ($.type(opt) === "string") {
                    switch (opt) {
                      case "show":
                        $(this).select().focus();
                        datetimepicker.trigger("open.xdsoft");
                        break;

                      case "hide":
                        datetimepicker.trigger("close.xdsoft");
                        break;

                      case "destroy":
                        destroyDateTimePicker($(this));
                        break;

                      case "reset":
                        this.value = this.defaultValue;
                        if (!this.value || !datetimepicker.data("xdsoft_datetime").isValidDate(Date.parseDate(this.value, options.format))) datetimepicker.data("changed", false);
                        datetimepicker.data("xdsoft_datetime").setCurrentTime(this.value);
                        break;
                    }
                } else {
                    datetimepicker.setOptions(opt);
                }
                return 0;
            } else if ($.type(opt) !== "string") {
                if (!options.lazyInit || options.open || options.inline) {
                    createDateTimePicker($(this));
                } else lazyInit($(this));
            }
        });
    };
})(jQuery);

Date.parseFunctions = {
    count: 0
};

Date.parseRegexes = [];

Date.formatFunctions = {
    count: 0
};

Date.prototype.dateFormat = function(b) {
    if (b == "unixtime") {
        return parseInt(this.getTime() / 1e3);
    }
    if (Date.formatFunctions[b] == null) {
        Date.createNewFormat(b);
    }
    var a = Date.formatFunctions[b];
    return this[a]();
};

Date.createNewFormat = function(format) {
    var funcName = "format" + Date.formatFunctions.count++;
    Date.formatFunctions[format] = funcName;
    var code = "Date.prototype." + funcName + " = function() {return ";
    var special = false;
    var ch = "";
    for (var i = 0; i < format.length; ++i) {
        ch = format.charAt(i);
        if (!special && ch == "\\") {
            special = true;
        } else {
            if (special) {
                special = false;
                code += "'" + String.escape(ch) + "' + ";
            } else {
                code += Date.getFormatCode(ch);
            }
        }
    }
    eval(code.substring(0, code.length - 3) + ";}");
};

Date.getFormatCode = function(a) {
    switch (a) {
      case "d":
        return "String.leftPad(this.getDate(), 2, '0') + ";

      case "D":
        return "Date.dayNames[this.getDay()].substring(0, 3) + ";

      case "j":
        return "this.getDate() + ";

      case "l":
        return "Date.dayNames[this.getDay()] + ";

      case "S":
        return "this.getSuffix() + ";

      case "w":
        return "this.getDay() + ";

      case "z":
        return "this.getDayOfYear() + ";

      case "W":
        return "this.getWeekOfYear() + ";

      case "F":
        return "Date.monthNames[this.getMonth()] + ";

      case "m":
        return "String.leftPad(this.getMonth() + 1, 2, '0') + ";

      case "M":
        return "Date.monthNames[this.getMonth()].substring(0, 3) + ";

      case "n":
        return "(this.getMonth() + 1) + ";

      case "t":
        return "this.getDaysInMonth() + ";

      case "L":
        return "(this.isLeapYear() ? 1 : 0) + ";

      case "Y":
        return "this.getFullYear() + ";

      case "y":
        return "('' + this.getFullYear()).substring(2, 4) + ";

      case "a":
        return "(this.getHours() < 12 ? 'am' : 'pm') + ";

      case "A":
        return "(this.getHours() < 12 ? 'AM' : 'PM') + ";

      case "g":
        return "((this.getHours() %12) ? this.getHours() % 12 : 12) + ";

      case "G":
        return "this.getHours() + ";

      case "h":
        return "String.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + ";

      case "H":
        return "String.leftPad(this.getHours(), 2, '0') + ";

      case "i":
        return "String.leftPad(this.getMinutes(), 2, '0') + ";

      case "s":
        return "String.leftPad(this.getSeconds(), 2, '0') + ";

      case "O":
        return "this.getGMTOffset() + ";

      case "T":
        return "this.getTimezone() + ";

      case "Z":
        return "(this.getTimezoneOffset() * -60) + ";

      default:
        return "'" + String.escape(a) + "' + ";
    }
};

Date.parseDate = function(a, c) {
    if (c == "unixtime") {
        return new Date(!isNaN(parseInt(a)) ? parseInt(a) * 1e3 : 0);
    }
    if (Date.parseFunctions[c] == null) {
        Date.createParser(c);
    }
    var b = Date.parseFunctions[c];
    return Date[b](a);
};

Date.createParser = function(format) {
    var funcName = "parse" + Date.parseFunctions.count++;
    var regexNum = Date.parseRegexes.length;
    var currentGroup = 1;
    Date.parseFunctions[format] = funcName;
    var code = "Date." + funcName + " = function(input) {\nvar y = -1, m = -1, d = -1, h = -1, i = -1, s = -1, z = -1;\nvar d = new Date();\ny = d.getFullYear();\nm = d.getMonth();\nd = d.getDate();\nvar results = input.match(Date.parseRegexes[" + regexNum + "]);\nif (results && results.length > 0) {";
    var regex = "";
    var special = false;
    var ch = "";
    for (var i = 0; i < format.length; ++i) {
        ch = format.charAt(i);
        if (!special && ch == "\\") {
            special = true;
        } else {
            if (special) {
                special = false;
                regex += String.escape(ch);
            } else {
                obj = Date.formatCodeToRegex(ch, currentGroup);
                currentGroup += obj.g;
                regex += obj.s;
                if (obj.g && obj.c) {
                    code += obj.c;
                }
            }
        }
    }
    code += "if (y > 0 && z > 0){\nvar doyDate = new Date(y,0);\ndoyDate.setDate(z);\nm = doyDate.getMonth();\nd = doyDate.getDate();\n}";
    code += "if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)\n{return new Date(y, m, d, h, i, s);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)\n{return new Date(y, m, d, h, i);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0)\n{return new Date(y, m, d, h);}\nelse if (y > 0 && m >= 0 && d > 0)\n{return new Date(y, m, d);}\nelse if (y > 0 && m >= 0)\n{return new Date(y, m);}\nelse if (y > 0)\n{return new Date(y);}\n}return null;}";
    Date.parseRegexes[regexNum] = new RegExp("^" + regex + "$");
    eval(code);
};

Date.formatCodeToRegex = function(b, a) {
    switch (b) {
      case "D":
        return {
            g: 0,
            c: null,
            s: "(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)"
        };

      case "j":
      case "d":
        return {
            g: 1,
            c: "d = parseInt(results[" + a + "], 10);\n",
            s: "(\\d{1,2})"
        };

      case "l":
        return {
            g: 0,
            c: null,
            s: "(?:" + Date.dayNames.join("|") + ")"
        };

      case "S":
        return {
            g: 0,
            c: null,
            s: "(?:st|nd|rd|th)"
        };

      case "w":
        return {
            g: 0,
            c: null,
            s: "\\d"
        };

      case "z":
        return {
            g: 1,
            c: "z = parseInt(results[" + a + "], 10);\n",
            s: "(\\d{1,3})"
        };

      case "W":
        return {
            g: 0,
            c: null,
            s: "(?:\\d{2})"
        };

      case "F":
        return {
            g: 1,
            c: "m = parseInt(Date.monthNumbers[results[" + a + "].substring(0, 3)], 10);\n",
            s: "(" + Date.monthNames.join("|") + ")"
        };

      case "M":
        return {
            g: 1,
            c: "m = parseInt(Date.monthNumbers[results[" + a + "]], 10);\n",
            s: "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
        };

      case "n":
      case "m":
        return {
            g: 1,
            c: "m = parseInt(results[" + a + "], 10) - 1;\n",
            s: "(\\d{1,2})"
        };

      case "t":
        return {
            g: 0,
            c: null,
            s: "\\d{1,2}"
        };

      case "L":
        return {
            g: 0,
            c: null,
            s: "(?:1|0)"
        };

      case "Y":
        return {
            g: 1,
            c: "y = parseInt(results[" + a + "], 10);\n",
            s: "(\\d{4})"
        };

      case "y":
        return {
            g: 1,
            c: "var ty = parseInt(results[" + a + "], 10);\ny = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n",
            s: "(\\d{1,2})"
        };

      case "a":
        return {
            g: 1,
            c: "if (results[" + a + "] == 'am') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}",
            s: "(am|pm)"
        };

      case "A":
        return {
            g: 1,
            c: "if (results[" + a + "] == 'AM') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}",
            s: "(AM|PM)"
        };

      case "g":
      case "G":
      case "h":
      case "H":
        return {
            g: 1,
            c: "h = parseInt(results[" + a + "], 10);\n",
            s: "(\\d{1,2})"
        };

      case "i":
        return {
            g: 1,
            c: "i = parseInt(results[" + a + "], 10);\n",
            s: "(\\d{2})"
        };

      case "s":
        return {
            g: 1,
            c: "s = parseInt(results[" + a + "], 10);\n",
            s: "(\\d{2})"
        };

      case "O":
        return {
            g: 0,
            c: null,
            s: "[+-]\\d{4}"
        };

      case "T":
        return {
            g: 0,
            c: null,
            s: "[A-Z]{3}"
        };

      case "Z":
        return {
            g: 0,
            c: null,
            s: "[+-]\\d{1,5}"
        };

      default:
        return {
            g: 0,
            c: null,
            s: String.escape(b)
        };
    }
};

Date.prototype.getTimezone = function() {
    return this.toString().replace(/^.*? ([A-Z]{3}) [0-9]{4}.*$/, "$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, "$1$2$3");
};

Date.prototype.getGMTOffset = function() {
    return (this.getTimezoneOffset() > 0 ? "-" : "+") + String.leftPad(Math.floor(Math.abs(this.getTimezoneOffset()) / 60), 2, "0") + String.leftPad(Math.abs(this.getTimezoneOffset()) % 60, 2, "0");
};

Date.prototype.getDayOfYear = function() {
    var a = 0;
    Date.daysInMonth[1] = this.isLeapYear() ? 29 : 28;
    for (var b = 0; b < this.getMonth(); ++b) {
        a += Date.daysInMonth[b];
    }
    return a + this.getDate();
};

Date.prototype.getWeekOfYear = function() {
    var b = this.getDayOfYear() + (4 - this.getDay());
    var a = new Date(this.getFullYear(), 0, 1);
    var c = 7 - a.getDay() + 4;
    return String.leftPad(Math.ceil((b - c) / 7) + 1, 2, "0");
};

Date.prototype.isLeapYear = function() {
    var a = this.getFullYear();
    return (a & 3) == 0 && (a % 100 || a % 400 == 0 && a);
};

Date.prototype.getFirstDayOfMonth = function() {
    var a = (this.getDay() - (this.getDate() - 1)) % 7;
    return a < 0 ? a + 7 : a;
};

Date.prototype.getLastDayOfMonth = function() {
    var a = (this.getDay() + (Date.daysInMonth[this.getMonth()] - this.getDate())) % 7;
    return a < 0 ? a + 7 : a;
};

Date.prototype.getDaysInMonth = function() {
    Date.daysInMonth[1] = this.isLeapYear() ? 29 : 28;
    return Date.daysInMonth[this.getMonth()];
};

Date.prototype.getSuffix = function() {
    switch (this.getDate()) {
      case 1:
      case 21:
      case 31:
        return "st";

      case 2:
      case 22:
        return "nd";

      case 3:
      case 23:
        return "rd";

      default:
        return "th";
    }
};

String.escape = function(a) {
    return a.replace(/('|\\)/g, "\\$1");
};

String.leftPad = function(d, b, c) {
    var a = new String(d);
    if (c == null) {
        c = " ";
    }
    while (a.length < b) {
        a = c + a;
    }
    return a;
};

Date.daysInMonth = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

Date.monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

Date.dayNames = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];

Date.y2kYear = 50;

Date.monthNumbers = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11
};

Date.patterns = {
    ISO8601LongPattern: "Y-m-d H:i:s",
    ISO8601ShortPattern: "Y-m-d",
    ShortDatePattern: "n/j/Y",
    LongDatePattern: "l, F d, Y",
    FullDateTimePattern: "l, F d, Y g:i:s A",
    MonthDayPattern: "F d",
    ShortTimePattern: "g:i A",
    LongTimePattern: "g:i:s A",
    SortableDateTimePattern: "Y-m-d\\TH:i:s",
    UniversalSortableDateTimePattern: "Y-m-d H:i:sO",
    YearMonthPattern: "F, Y"
};

(function(factory) {
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else if (typeof exports === "object") {
        module.exports = factory;
    } else {
        factory(jQuery);
    }
})(function($) {
    var toFix = [ "wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll" ];
    var toBind = "onwheel" in document || document.documentMode >= 9 ? [ "wheel" ] : [ "mousewheel", "DomMouseScroll", "MozMousePixelScroll" ];
    var lowestDelta, lowestDeltaXY;
    if ($.event.fixHooks) {
        for (var i = toFix.length; i; ) {
            $.event.fixHooks[toFix[--i]] = $.event.mouseHooks;
        }
    }
    $.event.special.mousewheel = {
        setup: function() {
            if (this.addEventListener) {
                for (var i = toBind.length; i; ) {
                    this.addEventListener(toBind[--i], handler, false);
                }
            } else {
                this.onmousewheel = handler;
            }
        },
        teardown: function() {
            if (this.removeEventListener) {
                for (var i = toBind.length; i; ) {
                    this.removeEventListener(toBind[--i], handler, false);
                }
            } else {
                this.onmousewheel = null;
            }
        }
    };
    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
        },
        unmousewheel: function(fn) {
            return this.unbind("mousewheel", fn);
        }
    });
    function handler(event) {
        var orgEvent = event || window.event, args = [].slice.call(arguments, 1), delta = 0, deltaX = 0, deltaY = 0, absDelta = 0, absDeltaXY = 0, fn;
        event = $.event.fix(orgEvent);
        event.type = "mousewheel";
        if (orgEvent.wheelDelta) {
            delta = orgEvent.wheelDelta;
        }
        if (orgEvent.detail) {
            delta = orgEvent.detail * -1;
        }
        if (orgEvent.deltaY) {
            deltaY = orgEvent.deltaY * -1;
            delta = deltaY;
        }
        if (orgEvent.deltaX) {
            deltaX = orgEvent.deltaX;
            delta = deltaX * -1;
        }
        if (orgEvent.wheelDeltaY !== undefined) {
            deltaY = orgEvent.wheelDeltaY;
        }
        if (orgEvent.wheelDeltaX !== undefined) {
            deltaX = orgEvent.wheelDeltaX * -1;
        }
        absDelta = Math.abs(delta);
        if (!lowestDelta || absDelta < lowestDelta) {
            lowestDelta = absDelta;
        }
        absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
        if (!lowestDeltaXY || absDeltaXY < lowestDeltaXY) {
            lowestDeltaXY = absDeltaXY;
        }
        fn = delta > 0 ? "floor" : "ceil";
        delta = Math[fn](delta / lowestDelta);
        deltaX = Math[fn](deltaX / lowestDeltaXY);
        deltaY = Math[fn](deltaY / lowestDeltaXY);
        args.unshift(event, delta, deltaX, deltaY);
        return ($.event.dispatch || $.event.handle).apply(this, args);
    }
});

(function($) {
    "use strict";
    var defaults = {
        theme: "fip-grey",
        source: false,
        emptyIcon: true,
        emptyIconValue: "",
        iconsPerPage: 20,
        hasSearch: true,
        searchSource: false,
        useAttribute: false,
        attributeName: "data-icon",
        convertToHex: true,
        allCategoryText: "From all categories",
        unCategorizedText: "Uncategorized"
    };
    function Plugin(element, options) {
        this.element = $(element);
        this.settings = $.extend({}, defaults, options);
        if (this.settings.emptyIcon) {
            this.settings.iconsPerPage--;
        }
        this.iconPicker = $("<div/>", {
            "class": "icons-selector",
            style: "position: relative",
            html: '<div class="selector">' + '<span class="selected-icon">' + '<i class="fip-icon-block"></i>' + "</span>" + '<span class="selector-button">' + '<i class="fip-icon-down-dir"></i>' + "</span>" + "</div>" + '<div class="selector-popup" style="display: none;">' + (this.settings.hasSearch ? '<div class="selector-search">' + '<input type="text" name="" value="" placeholder="Search icon" class="icons-search-input"/>' + '<i class="fip-icon-search"></i>' + "</div>" : "") + '<div class="selector-category">' + '<select name="" class="icon-category-select" style="display: none">' + "</select>" + "</div>" + '<div class="fip-icons-container"></div>' + '<div class="selector-footer" style="display:none;">' + '<span class="selector-pages">1/2</span>' + '<span class="selector-arrows">' + '<span class="selector-arrow-left" style="display:none;">' + '<i class="fip-icon-left-dir"></i>' + "</span>" + '<span class="selector-arrow-right">' + '<i class="fip-icon-right-dir"></i>' + "</span>" + "</span>" + "</div>" + "</div>"
        });
        this.iconContainer = this.iconPicker.find(".fip-icons-container");
        this.searchIcon = this.iconPicker.find(".selector-search i");
        this.iconsSearched = [];
        this.isSearch = false;
        this.totalPage = 1;
        this.currentPage = 1;
        this.currentIcon = false;
        this.iconsCount = 0;
        this.open = false;
        this.searchValues = [];
        this.availableCategoriesSearch = [];
        this.triggerEvent = null;
        this.backupSource = [];
        this.backupSearch = [];
        this.isCategorized = false;
        this.selectCategory = this.iconPicker.find(".icon-category-select");
        this.selectedCategory = false;
        this.availableCategories = [];
        this.unCategorizedKey = null;
        this.init();
    }
    Plugin.prototype = {
        init: function() {
            this.iconPicker.addClass(this.settings.theme);
            this.iconPicker.css({
                left: -9999
            }).appendTo("body");
            var iconPickerHeight = this.iconPicker.outerHeight(), iconPickerWidth = this.iconPicker.outerWidth();
            this.iconPicker.css({
                left: ""
            });
            this.element.before(this.iconPicker);
            this.element.css({
                visibility: "hidden",
                top: 0,
                position: "relative",
                zIndex: "-1",
                left: "-" + iconPickerWidth + "px",
                display: "inline-block",
                height: iconPickerHeight + "px",
                width: iconPickerWidth + "px",
                padding: "0",
                margin: "0 -" + iconPickerWidth + "px 0 0",
                border: "0 none",
                verticalAlign: "top"
            });
            if (!this.element.is("select")) {
                var ieVersion = function() {
                    var v = 3, div = document.createElement("div"), a = div.all || [];
                    while (div.innerHTML = "<!--[if gt IE " + ++v + "]><br><![endif]-->", a[0]) ;
                    return v > 4 ? v : !v;
                }();
                var el = document.createElement("div");
                this.triggerEvent = ieVersion === 9 || !("oninput" in el) ? [ "keyup" ] : [ "input", "keyup" ];
            }
            if (!this.settings.source && this.element.is("select")) {
                this.settings.source = [];
                this.settings.searchSource = [];
                if (this.element.find("optgroup").length) {
                    this.isCategorized = true;
                    this.element.find("optgroup").each($.proxy(function(i, el) {
                        var thisCategoryKey = this.availableCategories.length, categoryOption = $("<option />");
                        categoryOption.attr("value", thisCategoryKey);
                        categoryOption.html($(el).attr("label"));
                        this.selectCategory.append(categoryOption);
                        this.availableCategories[thisCategoryKey] = [];
                        this.availableCategoriesSearch[thisCategoryKey] = [];
                        $(el).find("option").each($.proxy(function(i, cel) {
                            var newIconValue = $(cel).val(), newIconLabel = $(cel).html();
                            if (newIconValue && newIconValue !== this.settings.emptyIconValue) {
                                this.settings.source.push(newIconValue);
                                this.availableCategories[thisCategoryKey].push(newIconValue);
                                this.searchValues.push(newIconLabel);
                                this.availableCategoriesSearch[thisCategoryKey].push(newIconLabel);
                            }
                        }, this));
                    }, this));
                    if (this.element.find("> option").length) {
                        this.element.find("> option").each($.proxy(function(i, el) {
                            var newIconValue = $(el).val(), newIconLabel = $(el).html();
                            if (!newIconValue || newIconValue === "" || newIconValue == this.settings.emptyIconValue) {
                                return true;
                            }
                            if (this.unCategorizedKey === null) {
                                this.unCategorizedKey = this.availableCategories.length;
                                this.availableCategories[this.unCategorizedKey] = [];
                                this.availableCategoriesSearch[this.unCategorizedKey] = [];
                                $("<option />").attr("value", this.unCategorizedKey).html(this.settings.unCategorizedText).appendTo(this.selectCategory);
                            }
                            this.settings.source.push(newIconValue);
                            this.availableCategories[this.unCategorizedKey].push(newIconValue);
                            this.searchValues.push(newIconLabel);
                            this.availableCategoriesSearch[this.unCategorizedKey].push(newIconLabel);
                        }, this));
                    }
                } else {
                    this.element.find("option").each($.proxy(function(i, el) {
                        var newIconValue = $(el).val(), newIconLabel = $(el).html();
                        if (newIconValue) {
                            this.settings.source.push(newIconValue);
                            this.searchValues.push(newIconLabel);
                        }
                    }, this));
                }
                this.backupSource = this.settings.source.slice(0);
                this.backupSearch = this.searchValues.slice(0);
                this.loadCategories();
            } else {
                this.initSourceIndex();
            }
            this.loadIcons();
            this.selectCategory.on("change keyup", $.proxy(function(e) {
                if (this.isCategorized === false) {
                    return false;
                }
                var targetSelect = $(e.currentTarget), currentCategory = targetSelect.val();
                if (targetSelect.val() === "all") {
                    this.settings.source = this.backupSource;
                    this.searchValues = this.backupSearch;
                } else {
                    var key = parseInt(currentCategory, 10);
                    if (this.availableCategories[key]) {
                        this.settings.source = this.availableCategories[key];
                        this.searchValues = this.availableCategoriesSearch[key];
                    }
                }
                this.resetSearch();
                this.loadIcons();
            }, this));
            this.iconPicker.find(".selector-button").click($.proxy(function() {
                this.toggleIconSelector();
            }, this));
            this.iconPicker.find(".selector-arrow-right").click($.proxy(function(e) {
                if (this.currentPage < this.totalPage) {
                    this.iconPicker.find(".selector-arrow-left").show();
                    this.currentPage = this.currentPage + 1;
                    this.renderIconContainer();
                }
                if (this.currentPage === this.totalPage) {
                    $(e.currentTarget).hide();
                }
            }, this));
            this.iconPicker.find(".selector-arrow-left").click($.proxy(function(e) {
                if (this.currentPage > 1) {
                    this.iconPicker.find(".selector-arrow-right").show();
                    this.currentPage = this.currentPage - 1;
                    this.renderIconContainer();
                }
                if (this.currentPage === 1) {
                    $(e.currentTarget).hide();
                }
            }, this));
            this.iconPicker.find(".icons-search-input").keyup($.proxy(function(e) {
                var searchString = $(e.currentTarget).val();
                if (searchString === "") {
                    this.resetSearch();
                    return;
                }
                this.searchIcon.removeClass("fip-icon-search");
                this.searchIcon.addClass("fip-icon-cancel");
                this.isSearch = true;
                this.currentPage = 1;
                this.iconsSearched = [];
                $.grep(this.searchValues, $.proxy(function(n, i) {
                    if (n.toLowerCase().search(searchString.toLowerCase()) >= 0) {
                        this.iconsSearched[this.iconsSearched.length] = this.settings.source[i];
                        return true;
                    }
                }, this));
                this.renderIconContainer();
            }, this));
            this.iconPicker.find(".selector-search").on("click", ".fip-icon-cancel", $.proxy(function() {
                this.iconPicker.find(".icons-search-input").focus();
                this.resetSearch();
            }, this));
            this.iconContainer.on("click", ".fip-box", $.proxy(function(e) {
                this.setSelectedIcon($(e.currentTarget).find("i").attr("data-fip-value"));
                this.toggleIconSelector();
            }, this));
            this.iconPicker.click(function(event) {
                event.stopPropagation();
                return false;
            });
            $("html").click($.proxy(function() {
                if (this.open) {
                    this.toggleIconSelector();
                }
            }, this));
        },
        initSourceIndex: function() {
            if (typeof this.settings.source !== "object") {
                return;
            }
            if ($.isArray(this.settings.source)) {
                this.isCategorized = false;
                this.selectCategory.html("").hide();
                this.settings.source = $.map(this.settings.source, function(e, i) {
                    if (typeof e.toString == "function") {
                        return e.toString();
                    } else {
                        return e;
                    }
                });
                if ($.isArray(this.settings.searchSource)) {
                    this.searchValues = $.map(this.settings.searchSource, function(e, i) {
                        if (typeof e.toString == "function") {
                            return e.toString();
                        } else {
                            return e;
                        }
                    });
                } else {
                    this.searchValues = this.settings.source.slice(0);
                }
            } else {
                var originalSource = $.extend(true, {}, this.settings.source);
                this.settings.source = [];
                this.searchValues = [];
                this.availableCategoriesSearch = [];
                this.selectedCategory = false;
                this.availableCategories = [];
                this.unCategorizedKey = null;
                this.isCategorized = true;
                this.selectCategory.html("");
                for (var categoryLabel in originalSource) {
                    var thisCategoryKey = this.availableCategories.length, categoryOption = $("<option />");
                    categoryOption.attr("value", thisCategoryKey);
                    categoryOption.html(categoryLabel);
                    this.selectCategory.append(categoryOption);
                    this.availableCategories[thisCategoryKey] = [];
                    this.availableCategoriesSearch[thisCategoryKey] = [];
                    for (var newIconKey in originalSource[categoryLabel]) {
                        var newIconValue = originalSource[categoryLabel][newIconKey];
                        var newIconLabel = this.settings.searchSource && this.settings.searchSource[categoryLabel] && this.settings.searchSource[categoryLabel][newIconKey] ? this.settings.searchSource[categoryLabel][newIconKey] : newIconValue;
                        if (typeof newIconValue.toString == "function") {
                            newIconValue = newIconValue.toString();
                        }
                        if (newIconValue && newIconValue !== this.settings.emptyIconValue) {
                            this.settings.source.push(newIconValue);
                            this.availableCategories[thisCategoryKey].push(newIconValue);
                            this.searchValues.push(newIconLabel);
                            this.availableCategoriesSearch[thisCategoryKey].push(newIconLabel);
                        }
                    }
                }
            }
            this.backupSource = this.settings.source.slice(0);
            this.backupSearch = this.searchValues.slice(0);
            this.loadCategories();
        },
        loadCategories: function() {
            if (this.isCategorized === false) {
                return;
            }
            $('<option value="all">' + this.settings.allCategoryText + "</option>").prependTo(this.selectCategory);
            this.selectCategory.show().val("all").trigger("change");
        },
        loadIcons: function() {
            this.iconContainer.html('<i class="fip-icon-spin3 animate-spin loading"></i>');
            if (this.settings.source instanceof Array) {
                this.renderIconContainer();
            }
        },
        renderIconContainer: function() {
            var offset, iconsPaged = [];
            if (this.isSearch) {
                iconsPaged = this.iconsSearched;
            } else {
                iconsPaged = this.settings.source;
            }
            this.iconsCount = iconsPaged.length;
            this.totalPage = Math.ceil(this.iconsCount / this.settings.iconsPerPage);
            if (this.totalPage > 1) {
                this.iconPicker.find(".selector-footer").show();
            } else {
                this.iconPicker.find(".selector-footer").hide();
            }
            this.iconPicker.find(".selector-pages").html(this.currentPage + "/" + this.totalPage + " <em>(" + this.iconsCount + ")</em>");
            offset = (this.currentPage - 1) * this.settings.iconsPerPage;
            if (this.settings.emptyIcon) {
                this.iconContainer.html('<span class="fip-box"><i class="fip-icon-block" data-fip-value="fip-icon-block"></i></span>');
            } else if (iconsPaged.length < 1) {
                this.iconContainer.html('<span class="icons-picker-error"><i class="fip-icon-block" data-fip-value="fip-icon-block"></i></span>');
                return;
            } else {
                this.iconContainer.html("");
            }
            iconsPaged = iconsPaged.slice(offset, offset + this.settings.iconsPerPage);
            for (var i = 0, item; item = iconsPaged[i++]; ) {
                var flipBoxTitle = item;
                $.grep(this.settings.source, $.proxy(function(e, i) {
                    if (e === item) {
                        flipBoxTitle = this.searchValues[i];
                        return true;
                    }
                    return false;
                }, this));
                $("<span/>", {
                    html: '<i data-fip-value="' + item + '" ' + (this.settings.useAttribute ? this.settings.attributeName + '="' + (this.settings.convertToHex ? "&#x" + parseInt(item, 10).toString(16) + ";" : item) + '"' : 'class="' + item + '"') + "></i>",
                    "class": "fip-box",
                    title: flipBoxTitle
                }).appendTo(this.iconContainer);
            }
            if (!this.settings.emptyIcon && (!this.element.val() || $.inArray(this.element.val(), this.settings.source) === -1)) {
                this.setSelectedIcon(iconsPaged[0]);
            } else if ($.inArray(this.element.val(), this.settings.source) === -1) {
                this.setSelectedIcon();
            } else {
                this.setSelectedIcon(this.element.val());
            }
        },
        setHighlightedIcon: function() {
            this.iconContainer.find(".current-icon").removeClass("current-icon");
            if (this.currentIcon) {
                this.iconContainer.find('[data-fip-value="' + this.currentIcon + '"]').parent("span").addClass("current-icon");
            }
        },
        setSelectedIcon: function(theIcon) {
            if (theIcon === "fip-icon-block") {
                theIcon = "";
            }
            if (this.settings.useAttribute) {
                if (theIcon) {
                    this.iconPicker.find(".selected-icon").html("<i " + this.settings.attributeName + '="' + (this.settings.convertToHex ? "&#x" + parseInt(theIcon, 10).toString(16) + ";" : theIcon) + '"></i>');
                } else {
                    this.iconPicker.find(".selected-icon").html('<i class="fip-icon-block"></i>');
                }
            } else {
                this.iconPicker.find(".selected-icon").html('<i class="' + (theIcon || "fip-icon-block") + '"></i>');
            }
            this.element.val(theIcon === "" ? this.settings.emptyIconValue : theIcon).trigger("change");
            if (this.triggerEvent !== null) {
                for (var eventKey in this.triggerEvent) {
                    this.element.trigger(this.triggerEvent[eventKey]);
                }
            }
            this.currentIcon = theIcon;
            this.setHighlightedIcon();
        },
        toggleIconSelector: function() {
            this.open = !this.open ? 1 : 0;
            this.iconPicker.find(".selector-popup").slideToggle(300);
            this.iconPicker.find(".selector-button i").toggleClass("fip-icon-down-dir");
            this.iconPicker.find(".selector-button i").toggleClass("fip-icon-up-dir");
            if (this.open) {
                this.iconPicker.find(".icons-search-input").focus().select();
            }
        },
        resetSearch: function() {
            this.iconPicker.find(".icons-search-input").val("");
            this.searchIcon.removeClass("fip-icon-cancel");
            this.searchIcon.addClass("fip-icon-search");
            this.iconPicker.find(".selector-arrow-left").hide();
            this.currentPage = 1;
            this.isSearch = false;
            this.renderIconContainer();
            if (this.totalPage > 1) {
                this.iconPicker.find(".selector-arrow-right").show();
            }
        }
    };
    $.fn.fontIconPicker = function(options) {
        this.each(function() {
            if (!$.data(this, "fontIconPicker")) {
                $.data(this, "fontIconPicker", new Plugin(this, options));
            }
        });
        this.setIcons = $.proxy(function(newIcons, iconSearch) {
            if (undefined === newIcons) {
                newIcons = false;
            }
            if (undefined === iconSearch) {
                iconSearch = false;
            }
            this.each(function() {
                $.data(this, "fontIconPicker").settings.source = newIcons;
                $.data(this, "fontIconPicker").settings.searchSource = iconSearch;
                $.data(this, "fontIconPicker").initSourceIndex();
                $.data(this, "fontIconPicker").resetSearch();
                $.data(this, "fontIconPicker").loadIcons();
            });
        }, this);
        this.destroyPicker = $.proxy(function() {
            this.each(function() {
                if (!$.data(this, "fontIconPicker")) {
                    return;
                }
                $.data(this, "fontIconPicker").iconPicker.remove();
                $.data(this, "fontIconPicker").element.css({
                    visibility: "",
                    top: "",
                    position: "",
                    zIndex: "",
                    left: "",
                    display: "",
                    height: "",
                    width: "",
                    padding: "",
                    margin: "",
                    border: "",
                    verticalAlign: ""
                });
                $.removeData(this, "fontIconPicker");
            });
        }, this);
        this.refreshPicker = $.proxy(function(newOptions) {
            if (!newOptions) {
                newOptions = options;
            }
            this.destroyPicker();
            this.each(function() {
                if (!$.data(this, "fontIconPicker")) {
                    $.data(this, "fontIconPicker", new Plugin(this, newOptions));
                }
            });
        }, this);
        return this;
    };
})(jQuery);

(function(window) {
    "use strict";
    var Logger = {};
    Logger.VERSION = "0.9.2";
    var logHandler;
    var contextualLoggersByNameMap = {};
    var bind = function(scope, func) {
        return function() {
            return func.apply(scope, arguments);
        };
    };
    var merge = function() {
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
    var defineLogLevel = function(value, name) {
        return {
            value: value,
            name: name
        };
    };
    Logger.DEBUG = defineLogLevel(1, "DEBUG");
    Logger.INFO = defineLogLevel(2, "INFO");
    Logger.WARN = defineLogLevel(4, "WARN");
    Logger.ERROR = defineLogLevel(8, "ERROR");
    Logger.OFF = defineLogLevel(99, "OFF");
    var ContextualLogger = function(defaultContext) {
        this.context = defaultContext;
        this.setLevel(defaultContext.filterLevel);
        this.log = this.info;
    };
    ContextualLogger.prototype = {
        setLevel: function(newLevel) {
            if (newLevel && "value" in newLevel) {
                this.context.filterLevel = newLevel;
            }
        },
        enabledFor: function(lvl) {
            var filterLevel = this.context.filterLevel;
            return lvl.value >= filterLevel.value;
        },
        debug: function() {
            this.invoke(Logger.DEBUG, arguments);
        },
        info: function() {
            this.invoke(Logger.INFO, arguments);
        },
        warn: function() {
            this.invoke(Logger.WARN, arguments);
        },
        error: function() {
            this.invoke(Logger.ERROR, arguments);
        },
        invoke: function(level, msgArgs) {
            if (logHandler && this.enabledFor(level)) {
                logHandler(msgArgs, merge({
                    level: level
                }, this.context));
            }
        }
    };
    var globalLogger = new ContextualLogger({
        filterLevel: Logger.OFF
    });
    (function() {
        var L = Logger;
        L.enabledFor = bind(globalLogger, globalLogger.enabledFor);
        L.debug = bind(globalLogger, globalLogger.debug);
        L.info = bind(globalLogger, globalLogger.info);
        L.warn = bind(globalLogger, globalLogger.warn);
        L.error = bind(globalLogger, globalLogger.error);
        L.log = L.info;
    })();
    Logger.setHandler = function(func) {
        logHandler = func;
    };
    Logger.setLevel = function(level) {
        globalLogger.setLevel(level);
        for (var key in contextualLoggersByNameMap) {
            if (contextualLoggersByNameMap.hasOwnProperty(key)) {
                contextualLoggersByNameMap[key].setLevel(level);
            }
        }
    };
    Logger.get = function(name) {
        return contextualLoggersByNameMap[name] || (contextualLoggersByNameMap[name] = new ContextualLogger(merge({
            name: name
        }, globalLogger.context)));
    };
    Logger.useDefaults = function(defaultLevel) {
        if (!("console" in window)) {
            return;
        }
        Logger.setLevel(defaultLevel || Logger.DEBUG);
        Logger.setHandler(function(messages, context) {
            var console = window.console;
            var hdlr = console.log;
            if (context.name) {
                messages[0] = "[" + context.name + "] " + messages[0];
            }
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
    if (typeof define === "function" && define.amd) {
        define(Logger);
    } else if (typeof module !== "undefined" && module.exports) {
        module.exports = Logger;
    } else {
        window["Logger"] = Logger;
    }
})(window);

!function(t) {
    function e(t, e) {
        return function(n) {
            return u(t.call(this, n), e);
        };
    }
    function n(t, e) {
        return function(n) {
            return this.lang().ordinal(t.call(this, n), e);
        };
    }
    function s() {}
    function i(t) {
        a(this, t);
    }
    function r(t) {
        var e = t.years || t.year || t.y || 0, n = t.months || t.month || t.M || 0, s = t.weeks || t.week || t.w || 0, i = t.days || t.day || t.d || 0, r = t.hours || t.hour || t.h || 0, a = t.minutes || t.minute || t.m || 0, o = t.seconds || t.second || t.s || 0, u = t.milliseconds || t.millisecond || t.ms || 0;
        this._input = t, this._milliseconds = u + 1e3 * o + 6e4 * a + 36e5 * r, this._days = i + 7 * s, 
        this._months = n + 12 * e, this._data = {}, this._bubble();
    }
    function a(t, e) {
        for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
        return t;
    }
    function o(t) {
        return 0 > t ? Math.ceil(t) : Math.floor(t);
    }
    function u(t, e) {
        for (var n = t + ""; n.length < e; ) n = "0" + n;
        return n;
    }
    function h(t, e, n, s) {
        var i, r, a = e._milliseconds, o = e._days, u = e._months;
        a && t._d.setTime(+t._d + a * n), (o || u) && (i = t.minute(), r = t.hour()), o && t.date(t.date() + o * n), 
        u && t.month(t.month() + u * n), a && !s && H.updateOffset(t), (o || u) && (t.minute(i), 
        t.hour(r));
    }
    function d(t) {
        return "[object Array]" === Object.prototype.toString.call(t);
    }
    function c(t, e) {
        var n, s = Math.min(t.length, e.length), i = Math.abs(t.length - e.length), r = 0;
        for (n = 0; s > n; n++) ~~t[n] !== ~~e[n] && r++;
        return r + i;
    }
    function f(t) {
        return t ? ie[t] || t.toLowerCase().replace(/(.)s$/, "$1") : t;
    }
    function l(t, e) {
        return e.abbr = t, x[t] || (x[t] = new s()), x[t].set(e), x[t];
    }
    function _(t) {
        if (!t) return H.fn._lang;
        if (!x[t] && A) try {
            require("./lang/" + t);
        } catch (e) {
            return H.fn._lang;
        }
        return x[t];
    }
    function m(t) {
        return t.match(/\[.*\]/) ? t.replace(/^\[|\]$/g, "") : t.replace(/\\/g, "");
    }
    function y(t) {
        var e, n, s = t.match(E);
        for (e = 0, n = s.length; n > e; e++) s[e] = ue[s[e]] ? ue[s[e]] : m(s[e]);
        return function(i) {
            var r = "";
            for (e = 0; n > e; e++) r += s[e] instanceof Function ? s[e].call(i, t) : s[e];
            return r;
        };
    }
    function M(t, e) {
        function n(e) {
            return t.lang().longDateFormat(e) || e;
        }
        for (var s = 5; s-- && N.test(e); ) e = e.replace(N, n);
        return re[e] || (re[e] = y(e)), re[e](t);
    }
    function g(t, e) {
        switch (t) {
          case "DDDD":
            return V;

          case "YYYY":
            return X;

          case "YYYYY":
            return $;

          case "S":
          case "SS":
          case "SSS":
          case "DDD":
            return I;

          case "MMM":
          case "MMMM":
          case "dd":
          case "ddd":
          case "dddd":
            return R;

          case "a":
          case "A":
            return _(e._l)._meridiemParse;

          case "X":
            return B;

          case "Z":
          case "ZZ":
            return j;

          case "T":
            return q;

          case "MM":
          case "DD":
          case "YY":
          case "HH":
          case "hh":
          case "mm":
          case "ss":
          case "M":
          case "D":
          case "d":
          case "H":
          case "h":
          case "m":
          case "s":
            return J;

          default:
            return new RegExp(t.replace("\\", ""));
        }
    }
    function p(t) {
        var e = (j.exec(t) || [])[0], n = (e + "").match(ee) || [ "-", 0, 0 ], s = +(60 * n[1]) + ~~n[2];
        return "+" === n[0] ? -s : s;
    }
    function D(t, e, n) {
        var s, i = n._a;
        switch (t) {
          case "M":
          case "MM":
            i[1] = null == e ? 0 : ~~e - 1;
            break;

          case "MMM":
          case "MMMM":
            s = _(n._l).monthsParse(e), null != s ? i[1] = s : n._isValid = !1;
            break;

          case "D":
          case "DD":
          case "DDD":
          case "DDDD":
            null != e && (i[2] = ~~e);
            break;

          case "YY":
            i[0] = ~~e + (~~e > 68 ? 1900 : 2e3);
            break;

          case "YYYY":
          case "YYYYY":
            i[0] = ~~e;
            break;

          case "a":
          case "A":
            n._isPm = _(n._l).isPM(e);
            break;

          case "H":
          case "HH":
          case "h":
          case "hh":
            i[3] = ~~e;
            break;

          case "m":
          case "mm":
            i[4] = ~~e;
            break;

          case "s":
          case "ss":
            i[5] = ~~e;
            break;

          case "S":
          case "SS":
          case "SSS":
            i[6] = ~~(1e3 * ("0." + e));
            break;

          case "X":
            n._d = new Date(1e3 * parseFloat(e));
            break;

          case "Z":
          case "ZZ":
            n._useUTC = !0, n._tzm = p(e);
        }
        null == e && (n._isValid = !1);
    }
    function Y(t) {
        var e, n, s = [];
        if (!t._d) {
            for (e = 0; 7 > e; e++) t._a[e] = s[e] = null == t._a[e] ? 2 === e ? 1 : 0 : t._a[e];
            s[3] += ~~((t._tzm || 0) / 60), s[4] += ~~((t._tzm || 0) % 60), n = new Date(0), 
            t._useUTC ? (n.setUTCFullYear(s[0], s[1], s[2]), n.setUTCHours(s[3], s[4], s[5], s[6])) : (n.setFullYear(s[0], s[1], s[2]), 
            n.setHours(s[3], s[4], s[5], s[6])), t._d = n;
        }
    }
    function w(t) {
        var e, n, s = t._f.match(E), i = t._i;
        for (t._a = [], e = 0; e < s.length; e++) n = (g(s[e], t).exec(i) || [])[0], n && (i = i.slice(i.indexOf(n) + n.length)), 
        ue[s[e]] && D(s[e], n, t);
        i && (t._il = i), t._isPm && t._a[3] < 12 && (t._a[3] += 12), t._isPm === !1 && 12 === t._a[3] && (t._a[3] = 0), 
        Y(t);
    }
    function k(t) {
        var e, n, s, r, o, u = 99;
        for (r = 0; r < t._f.length; r++) e = a({}, t), e._f = t._f[r], w(e), n = new i(e), 
        o = c(e._a, n.toArray()), n._il && (o += n._il.length), u > o && (u = o, s = n);
        a(t, s);
    }
    function v(t) {
        var e, n = t._i, s = K.exec(n);
        if (s) {
            for (t._f = "YYYY-MM-DD" + (s[2] || " "), e = 0; 4 > e; e++) if (te[e][1].exec(n)) {
                t._f += te[e][0];
                break;
            }
            j.exec(n) && (t._f += " Z"), w(t);
        } else t._d = new Date(n);
    }
    function T(e) {
        var n = e._i, s = G.exec(n);
        n === t ? e._d = new Date() : s ? e._d = new Date(+s[1]) : "string" == typeof n ? v(e) : d(n) ? (e._a = n.slice(0), 
        Y(e)) : e._d = n instanceof Date ? new Date(+n) : new Date(n);
    }
    function b(t, e, n, s, i) {
        return i.relativeTime(e || 1, !!n, t, s);
    }
    function S(t, e, n) {
        var s = W(Math.abs(t) / 1e3), i = W(s / 60), r = W(i / 60), a = W(r / 24), o = W(a / 365), u = 45 > s && [ "s", s ] || 1 === i && [ "m" ] || 45 > i && [ "mm", i ] || 1 === r && [ "h" ] || 22 > r && [ "hh", r ] || 1 === a && [ "d" ] || 25 >= a && [ "dd", a ] || 45 >= a && [ "M" ] || 345 > a && [ "MM", W(a / 30) ] || 1 === o && [ "y" ] || [ "yy", o ];
        return u[2] = e, u[3] = t > 0, u[4] = n, b.apply({}, u);
    }
    function F(t, e, n) {
        var s, i = n - e, r = n - t.day();
        return r > i && (r -= 7), i - 7 > r && (r += 7), s = H(t).add("d", r), {
            week: Math.ceil(s.dayOfYear() / 7),
            year: s.year()
        };
    }
    function O(t) {
        var e = t._i, n = t._f;
        return null === e || "" === e ? null : ("string" == typeof e && (t._i = e = _().preparse(e)), 
        H.isMoment(e) ? (t = a({}, e), t._d = new Date(+e._d)) : n ? d(n) ? k(t) : w(t) : T(t), 
        new i(t));
    }
    function z(t, e) {
        H.fn[t] = H.fn[t + "s"] = function(t) {
            var n = this._isUTC ? "UTC" : "";
            return null != t ? (this._d["set" + n + e](t), H.updateOffset(this), this) : this._d["get" + n + e]();
        };
    }
    function C(t) {
        H.duration.fn[t] = function() {
            return this._data[t];
        };
    }
    function L(t, e) {
        H.duration.fn["as" + t] = function() {
            return +this / e;
        };
    }
    for (var H, P, U = "2.1.0", W = Math.round, x = {}, A = "undefined" != typeof module && module.exports, G = /^\/?Date\((\-?\d+)/i, Z = /(\-)?(\d*)?\.?(\d+)\:(\d+)\:(\d+)\.?(\d{3})?/, E = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g, N = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g, J = /\d\d?/, I = /\d{1,3}/, V = /\d{3}/, X = /\d{1,4}/, $ = /[+\-]?\d{1,6}/, R = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, j = /Z|[\+\-]\d\d:?\d\d/i, q = /T/i, B = /[\+\-]?\d+(\.\d{1,3})?/, K = /^\s*\d{4}-\d\d-\d\d((T| )(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/, Q = "YYYY-MM-DDTHH:mm:ssZ", te = [ [ "HH:mm:ss.S", /(T| )\d\d:\d\d:\d\d\.\d{1,3}/ ], [ "HH:mm:ss", /(T| )\d\d:\d\d:\d\d/ ], [ "HH:mm", /(T| )\d\d:\d\d/ ], [ "HH", /(T| )\d\d/ ] ], ee = /([\+\-]|\d\d)/gi, ne = "Date|Hours|Minutes|Seconds|Milliseconds".split("|"), se = {
        Milliseconds: 1,
        Seconds: 1e3,
        Minutes: 6e4,
        Hours: 36e5,
        Days: 864e5,
        Months: 2592e6,
        Years: 31536e6
    }, ie = {
        ms: "millisecond",
        s: "second",
        m: "minute",
        h: "hour",
        d: "day",
        w: "week",
        M: "month",
        y: "year"
    }, re = {}, ae = "DDD w W M D d".split(" "), oe = "M D H h m s w W".split(" "), ue = {
        M: function() {
            return this.month() + 1;
        },
        MMM: function(t) {
            return this.lang().monthsShort(this, t);
        },
        MMMM: function(t) {
            return this.lang().months(this, t);
        },
        D: function() {
            return this.date();
        },
        DDD: function() {
            return this.dayOfYear();
        },
        d: function() {
            return this.day();
        },
        dd: function(t) {
            return this.lang().weekdaysMin(this, t);
        },
        ddd: function(t) {
            return this.lang().weekdaysShort(this, t);
        },
        dddd: function(t) {
            return this.lang().weekdays(this, t);
        },
        w: function() {
            return this.week();
        },
        W: function() {
            return this.isoWeek();
        },
        YY: function() {
            return u(this.year() % 100, 2);
        },
        YYYY: function() {
            return u(this.year(), 4);
        },
        YYYYY: function() {
            return u(this.year(), 5);
        },
        gg: function() {
            return u(this.weekYear() % 100, 2);
        },
        gggg: function() {
            return this.weekYear();
        },
        ggggg: function() {
            return u(this.weekYear(), 5);
        },
        GG: function() {
            return u(this.isoWeekYear() % 100, 2);
        },
        GGGG: function() {
            return this.isoWeekYear();
        },
        GGGGG: function() {
            return u(this.isoWeekYear(), 5);
        },
        e: function() {
            return this.weekday();
        },
        E: function() {
            return this.isoWeekday();
        },
        a: function() {
            return this.lang().meridiem(this.hours(), this.minutes(), !0);
        },
        A: function() {
            return this.lang().meridiem(this.hours(), this.minutes(), !1);
        },
        H: function() {
            return this.hours();
        },
        h: function() {
            return this.hours() % 12 || 12;
        },
        m: function() {
            return this.minutes();
        },
        s: function() {
            return this.seconds();
        },
        S: function() {
            return ~~(this.milliseconds() / 100);
        },
        SS: function() {
            return u(~~(this.milliseconds() / 10), 2);
        },
        SSS: function() {
            return u(this.milliseconds(), 3);
        },
        Z: function() {
            var t = -this.zone(), e = "+";
            return 0 > t && (t = -t, e = "-"), e + u(~~(t / 60), 2) + ":" + u(~~t % 60, 2);
        },
        ZZ: function() {
            var t = -this.zone(), e = "+";
            return 0 > t && (t = -t, e = "-"), e + u(~~(10 * t / 6), 4);
        },
        z: function() {
            return this.zoneAbbr();
        },
        zz: function() {
            return this.zoneName();
        },
        X: function() {
            return this.unix();
        }
    }; ae.length; ) P = ae.pop(), ue[P + "o"] = n(ue[P], P);
    for (;oe.length; ) P = oe.pop(), ue[P + P] = e(ue[P], 2);
    for (ue.DDDD = e(ue.DDD, 3), s.prototype = {
        set: function(t) {
            var e, n;
            for (n in t) e = t[n], "function" == typeof e ? this[n] = e : this["_" + n] = e;
        },
        _months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        months: function(t) {
            return this._months[t.month()];
        },
        _monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        monthsShort: function(t) {
            return this._monthsShort[t.month()];
        },
        monthsParse: function(t) {
            var e, n, s;
            for (this._monthsParse || (this._monthsParse = []), e = 0; 12 > e; e++) if (this._monthsParse[e] || (n = H([ 2e3, e ]), 
            s = "^" + this.months(n, "") + "|^" + this.monthsShort(n, ""), this._monthsParse[e] = new RegExp(s.replace(".", ""), "i")), 
            this._monthsParse[e].test(t)) return e;
        },
        _weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdays: function(t) {
            return this._weekdays[t.day()];
        },
        _weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysShort: function(t) {
            return this._weekdaysShort[t.day()];
        },
        _weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        weekdaysMin: function(t) {
            return this._weekdaysMin[t.day()];
        },
        weekdaysParse: function(t) {
            var e, n, s;
            for (this._weekdaysParse || (this._weekdaysParse = []), e = 0; 7 > e; e++) if (this._weekdaysParse[e] || (n = H([ 2e3, 1 ]).day(e), 
            s = "^" + this.weekdays(n, "") + "|^" + this.weekdaysShort(n, "") + "|^" + this.weekdaysMin(n, ""), 
            this._weekdaysParse[e] = new RegExp(s.replace(".", ""), "i")), this._weekdaysParse[e].test(t)) return e;
        },
        _longDateFormat: {
            LT: "h:mm A",
            L: "MM/DD/YYYY",
            LL: "MMMM D YYYY",
            LLL: "MMMM D YYYY LT",
            LLLL: "dddd, MMMM D YYYY LT"
        },
        longDateFormat: function(t) {
            var e = this._longDateFormat[t];
            return !e && this._longDateFormat[t.toUpperCase()] && (e = this._longDateFormat[t.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function(t) {
                return t.slice(1);
            }), this._longDateFormat[t] = e), e;
        },
        isPM: function(t) {
            return "p" === (t + "").toLowerCase()[0];
        },
        _meridiemParse: /[ap]\.?m?\.?/i,
        meridiem: function(t, e, n) {
            return t > 11 ? n ? "pm" : "PM" : n ? "am" : "AM";
        },
        _calendar: {
            sameDay: "[Today at] LT",
            nextDay: "[Tomorrow at] LT",
            nextWeek: "dddd [at] LT",
            lastDay: "[Yesterday at] LT",
            lastWeek: "[Last] dddd [at] LT",
            sameElse: "L"
        },
        calendar: function(t, e) {
            var n = this._calendar[t];
            return "function" == typeof n ? n.apply(e) : n;
        },
        _relativeTime: {
            future: "in %s",
            past: "%s ago",
            s: "a few seconds",
            m: "a minute",
            mm: "%d minutes",
            h: "an hour",
            hh: "%d hours",
            d: "a day",
            dd: "%d days",
            M: "a month",
            MM: "%d months",
            y: "a year",
            yy: "%d years"
        },
        relativeTime: function(t, e, n, s) {
            var i = this._relativeTime[n];
            return "function" == typeof i ? i(t, e, n, s) : i.replace(/%d/i, t);
        },
        pastFuture: function(t, e) {
            var n = this._relativeTime[t > 0 ? "future" : "past"];
            return "function" == typeof n ? n(e) : n.replace(/%s/i, e);
        },
        ordinal: function(t) {
            return this._ordinal.replace("%d", t);
        },
        _ordinal: "%d",
        preparse: function(t) {
            return t;
        },
        postformat: function(t) {
            return t;
        },
        week: function(t) {
            return F(t, this._week.dow, this._week.doy).week;
        },
        _week: {
            dow: 0,
            doy: 6
        }
    }, H = function(t, e, n) {
        return O({
            _i: t,
            _f: e,
            _l: n,
            _isUTC: !1
        });
    }, H.utc = function(t, e, n) {
        return O({
            _useUTC: !0,
            _isUTC: !0,
            _l: n,
            _i: t,
            _f: e
        });
    }, H.unix = function(t) {
        return H(1e3 * t);
    }, H.duration = function(t, e) {
        var n, s, i = H.isDuration(t), a = "number" == typeof t, o = i ? t._input : a ? {} : t, u = Z.exec(t);
        return a ? e ? o[e] = t : o.milliseconds = t : u && (n = "-" === u[1] ? -1 : 1, 
        o = {
            y: 0,
            d: ~~u[2] * n,
            h: ~~u[3] * n,
            m: ~~u[4] * n,
            s: ~~u[5] * n,
            ms: ~~u[6] * n
        }), s = new r(o), i && t.hasOwnProperty("_lang") && (s._lang = t._lang), s;
    }, H.version = U, H.defaultFormat = Q, H.updateOffset = function() {}, H.lang = function(t, e) {
        return t ? (e ? l(t, e) : x[t] || _(t), H.duration.fn._lang = H.fn._lang = _(t), 
        void 0) : H.fn._lang._abbr;
    }, H.langData = function(t) {
        return t && t._lang && t._lang._abbr && (t = t._lang._abbr), _(t);
    }, H.isMoment = function(t) {
        return t instanceof i;
    }, H.isDuration = function(t) {
        return t instanceof r;
    }, H.fn = i.prototype = {
        clone: function() {
            return H(this);
        },
        valueOf: function() {
            return +this._d + 6e4 * (this._offset || 0);
        },
        unix: function() {
            return Math.floor(+this / 1e3);
        },
        toString: function() {
            return this.format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        },
        toDate: function() {
            return this._offset ? new Date(+this) : this._d;
        },
        toISOString: function() {
            return M(H(this).utc(), "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
        },
        toArray: function() {
            var t = this;
            return [ t.year(), t.month(), t.date(), t.hours(), t.minutes(), t.seconds(), t.milliseconds() ];
        },
        isValid: function() {
            return null == this._isValid && (this._isValid = this._a ? !c(this._a, (this._isUTC ? H.utc(this._a) : H(this._a)).toArray()) : !isNaN(this._d.getTime())), 
            !!this._isValid;
        },
        utc: function() {
            return this.zone(0);
        },
        local: function() {
            return this.zone(0), this._isUTC = !1, this;
        },
        format: function(t) {
            var e = M(this, t || H.defaultFormat);
            return this.lang().postformat(e);
        },
        add: function(t, e) {
            var n;
            return n = "string" == typeof t ? H.duration(+e, t) : H.duration(t, e), h(this, n, 1), 
            this;
        },
        subtract: function(t, e) {
            var n;
            return n = "string" == typeof t ? H.duration(+e, t) : H.duration(t, e), h(this, n, -1), 
            this;
        },
        diff: function(t, e, n) {
            var s, i, r = this._isUTC ? H(t).zone(this._offset || 0) : H(t).local(), a = 6e4 * (this.zone() - r.zone());
            return e = f(e), "year" === e || "month" === e ? (s = 432e5 * (this.daysInMonth() + r.daysInMonth()), 
            i = 12 * (this.year() - r.year()) + (this.month() - r.month()), i += (this - H(this).startOf("month") - (r - H(r).startOf("month"))) / s, 
            i -= 6e4 * (this.zone() - H(this).startOf("month").zone() - (r.zone() - H(r).startOf("month").zone())) / s, 
            "year" === e && (i /= 12)) : (s = this - r, i = "second" === e ? s / 1e3 : "minute" === e ? s / 6e4 : "hour" === e ? s / 36e5 : "day" === e ? (s - a) / 864e5 : "week" === e ? (s - a) / 6048e5 : s), 
            n ? i : o(i);
        },
        from: function(t, e) {
            return H.duration(this.diff(t)).lang(this.lang()._abbr).humanize(!e);
        },
        fromNow: function(t) {
            return this.from(H(), t);
        },
        calendar: function() {
            var t = this.diff(H().startOf("day"), "days", !0), e = -6 > t ? "sameElse" : -1 > t ? "lastWeek" : 0 > t ? "lastDay" : 1 > t ? "sameDay" : 2 > t ? "nextDay" : 7 > t ? "nextWeek" : "sameElse";
            return this.format(this.lang().calendar(e, this));
        },
        isLeapYear: function() {
            var t = this.year();
            return 0 === t % 4 && 0 !== t % 100 || 0 === t % 400;
        },
        isDST: function() {
            return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone();
        },
        day: function(t) {
            var e = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            return null != t ? "string" == typeof t && (t = this.lang().weekdaysParse(t), "number" != typeof t) ? this : this.add({
                d: t - e
            }) : e;
        },
        month: function(t) {
            var e, n = this._isUTC ? "UTC" : "";
            return null != t ? "string" == typeof t && (t = this.lang().monthsParse(t), "number" != typeof t) ? this : (e = this.date(), 
            this.date(1), this._d["set" + n + "Month"](t), this.date(Math.min(e, this.daysInMonth())), 
            H.updateOffset(this), this) : this._d["get" + n + "Month"]();
        },
        startOf: function(t) {
            switch (t = f(t)) {
              case "year":
                this.month(0);

              case "month":
                this.date(1);

              case "week":
              case "day":
                this.hours(0);

              case "hour":
                this.minutes(0);

              case "minute":
                this.seconds(0);

              case "second":
                this.milliseconds(0);
            }
            return "week" === t && this.weekday(0), this;
        },
        endOf: function(t) {
            return this.startOf(t).add(t, 1).subtract("ms", 1);
        },
        isAfter: function(t, e) {
            return e = "undefined" != typeof e ? e : "millisecond", +this.clone().startOf(e) > +H(t).startOf(e);
        },
        isBefore: function(t, e) {
            return e = "undefined" != typeof e ? e : "millisecond", +this.clone().startOf(e) < +H(t).startOf(e);
        },
        isSame: function(t, e) {
            return e = "undefined" != typeof e ? e : "millisecond", +this.clone().startOf(e) === +H(t).startOf(e);
        },
        min: function(t) {
            return t = H.apply(null, arguments), this > t ? this : t;
        },
        max: function(t) {
            return t = H.apply(null, arguments), t > this ? this : t;
        },
        zone: function(t) {
            var e = this._offset || 0;
            return null == t ? this._isUTC ? e : this._d.getTimezoneOffset() : ("string" == typeof t && (t = p(t)), 
            Math.abs(t) < 16 && (t = 60 * t), this._offset = t, this._isUTC = !0, e !== t && h(this, H.duration(e - t, "m"), 1, !0), 
            this);
        },
        zoneAbbr: function() {
            return this._isUTC ? "UTC" : "";
        },
        zoneName: function() {
            return this._isUTC ? "Coordinated Universal Time" : "";
        },
        daysInMonth: function() {
            return H.utc([ this.year(), this.month() + 1, 0 ]).date();
        },
        dayOfYear: function(t) {
            var e = W((H(this).startOf("day") - H(this).startOf("year")) / 864e5) + 1;
            return null == t ? e : this.add("d", t - e);
        },
        weekYear: function(t) {
            var e = F(this, this.lang()._week.dow, this.lang()._week.doy).year;
            return null == t ? e : this.add("y", t - e);
        },
        isoWeekYear: function(t) {
            var e = F(this, 1, 4).year;
            return null == t ? e : this.add("y", t - e);
        },
        week: function(t) {
            var e = this.lang().week(this);
            return null == t ? e : this.add("d", 7 * (t - e));
        },
        isoWeek: function(t) {
            var e = F(this, 1, 4).week;
            return null == t ? e : this.add("d", 7 * (t - e));
        },
        weekday: function(t) {
            var e = (this._d.getDay() + 7 - this.lang()._week.dow) % 7;
            return null == t ? e : this.add("d", t - e);
        },
        isoWeekday: function(t) {
            return null == t ? this.day() || 7 : this.day(this.day() % 7 ? t : t - 7);
        },
        lang: function(e) {
            return e === t ? this._lang : (this._lang = _(e), this);
        }
    }, P = 0; P < ne.length; P++) z(ne[P].toLowerCase().replace(/s$/, ""), ne[P]);
    z("year", "FullYear"), H.fn.days = H.fn.day, H.fn.months = H.fn.month, H.fn.weeks = H.fn.week, 
    H.fn.isoWeeks = H.fn.isoWeek, H.fn.toJSON = H.fn.toISOString, H.duration.fn = r.prototype = {
        _bubble: function() {
            var t, e, n, s, i = this._milliseconds, r = this._days, a = this._months, u = this._data;
            u.milliseconds = i % 1e3, t = o(i / 1e3), u.seconds = t % 60, e = o(t / 60), u.minutes = e % 60, 
            n = o(e / 60), u.hours = n % 24, r += o(n / 24), u.days = r % 30, a += o(r / 30), 
            u.months = a % 12, s = o(a / 12), u.years = s;
        },
        weeks: function() {
            return o(this.days() / 7);
        },
        valueOf: function() {
            return this._milliseconds + 864e5 * this._days + 2592e6 * (this._months % 12) + 31536e6 * ~~(this._months / 12);
        },
        humanize: function(t) {
            var e = +this, n = S(e, !t, this.lang());
            return t && (n = this.lang().pastFuture(e, n)), this.lang().postformat(n);
        },
        add: function(t, e) {
            var n = H.duration(t, e);
            return this._milliseconds += n._milliseconds, this._days += n._days, this._months += n._months, 
            this._bubble(), this;
        },
        subtract: function(t, e) {
            var n = H.duration(t, e);
            return this._milliseconds -= n._milliseconds, this._days -= n._days, this._months -= n._months, 
            this._bubble(), this;
        },
        get: function(t) {
            return t = f(t), this[t.toLowerCase() + "s"]();
        },
        as: function(t) {
            return t = f(t), this["as" + t.charAt(0).toUpperCase() + t.slice(1) + "s"]();
        },
        lang: H.fn.lang
    };
    for (P in se) se.hasOwnProperty(P) && (L(P, se[P]), C(P.toLowerCase()));
    L("Weeks", 6048e5), H.duration.fn.asMonths = function() {
        return (+this - 31536e6 * this.years()) / 2592e6 + 12 * this.years();
    }, H.lang("en", {
        ordinal: function(t) {
            var e = t % 10, n = 1 === ~~(t % 100 / 10) ? "th" : 1 === e ? "st" : 2 === e ? "nd" : 3 === e ? "rd" : "th";
            return t + n;
        }
    }), A && (module.exports = H), "undefined" == typeof ender && (this.moment = H), 
    "function" == typeof define && define.amd && define("moment", [], function() {
        return H;
    });
}.call(this);

!function(a, b, c) {
    "use strict";
    var d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x;
    w = {
        paneClass: "pane",
        sliderClass: "slider",
        contentClass: "content",
        iOSNativeScrolling: !1,
        preventPageScrolling: !1,
        disableResize: !1,
        alwaysVisible: !1,
        flashDelay: 1500,
        sliderMinHeight: 20,
        sliderMaxHeight: null,
        documentContext: null,
        windowContext: null
    }, s = "scrollbar", r = "scroll", k = "mousedown", l = "mousemove", n = "mousewheel", 
    m = "mouseup", q = "resize", h = "drag", u = "up", p = "panedown", f = "DOMMouseScroll", 
    g = "down", v = "wheel", i = "keydown", j = "keyup", t = "touchmove", d = "Microsoft Internet Explorer" === b.navigator.appName && /msie 7./i.test(b.navigator.appVersion) && b.ActiveXObject, 
    e = null, x = function() {
        var a, b, d;
        return a = c.createElement("div"), b = a.style, b.position = "absolute", b.width = "100px", 
        b.height = "100px", b.overflow = r, b.top = "-9999px", c.body.appendChild(a), d = a.offsetWidth - a.clientWidth, 
        c.body.removeChild(a), d;
    }, o = function() {
        function i(d, f) {
            this.el = d, this.options = f, e || (e = x()), this.$el = a(this.el), this.doc = a(this.options.documentContext || c), 
            this.win = a(this.options.windowContext || b), this.$content = this.$el.children("." + f.contentClass), 
            this.$content.attr("tabindex", this.options.tabIndex || 0), this.content = this.$content[0], 
            this.options.iOSNativeScrolling && null != this.el.style.WebkitOverflowScrolling ? this.nativeScrolling() : this.generate(), 
            this.createEvents(), this.addEvents(), this.reset();
        }
        return i.prototype.preventScrolling = function(a, b) {
            if (this.isActive) if (a.type === f) (b === g && a.originalEvent.detail > 0 || b === u && a.originalEvent.detail < 0) && a.preventDefault(); else if (a.type === n) {
                if (!a.originalEvent || !a.originalEvent.wheelDelta) return;
                (b === g && a.originalEvent.wheelDelta < 0 || b === u && a.originalEvent.wheelDelta > 0) && a.preventDefault();
            }
        }, i.prototype.nativeScrolling = function() {
            this.$content.css({
                WebkitOverflowScrolling: "touch"
            }), this.iOSNativeScrolling = !0, this.isActive = !0;
        }, i.prototype.updateScrollValues = function() {
            var a;
            a = this.content, this.maxScrollTop = a.scrollHeight - a.clientHeight, this.prevScrollTop = this.contentScrollTop || 0, 
            this.contentScrollTop = a.scrollTop, this.iOSNativeScrolling || (this.maxSliderTop = this.paneHeight - this.sliderHeight, 
            this.sliderTop = 0 === this.maxScrollTop ? 0 : this.contentScrollTop * this.maxSliderTop / this.maxScrollTop);
        }, i.prototype.createEvents = function() {
            var a = this;
            this.events = {
                down: function(b) {
                    return a.isBeingDragged = !0, a.offsetY = b.pageY - a.slider.offset().top, a.pane.addClass("active"), 
                    a.doc.bind(l, a.events[h]).bind(m, a.events[u]), !1;
                },
                drag: function(b) {
                    return a.sliderY = b.pageY - a.$el.offset().top - a.offsetY, a.scroll(), a.updateScrollValues(), 
                    a.contentScrollTop >= a.maxScrollTop && a.prevScrollTop !== a.maxScrollTop ? a.$el.trigger("scrollend") : 0 === a.contentScrollTop && 0 !== a.prevScrollTop && a.$el.trigger("scrolltop"), 
                    !1;
                },
                up: function() {
                    return a.isBeingDragged = !1, a.pane.removeClass("active"), a.doc.unbind(l, a.events[h]).unbind(m, a.events[u]), 
                    !1;
                },
                resize: function() {
                    a.reset();
                },
                panedown: function(b) {
                    return a.sliderY = (b.offsetY || b.originalEvent.layerY) - .5 * a.sliderHeight, 
                    a.scroll(), a.events.down(b), !1;
                },
                scroll: function(b) {
                    a.isBeingDragged || (a.updateScrollValues(), a.iOSNativeScrolling || (a.sliderY = a.sliderTop, 
                    a.slider.css({
                        top: a.sliderTop
                    })), null != b && (a.contentScrollTop >= a.maxScrollTop ? (a.options.preventPageScrolling && a.preventScrolling(b, g), 
                    a.prevScrollTop !== a.maxScrollTop && a.$el.trigger("scrollend")) : 0 === a.contentScrollTop && (a.options.preventPageScrolling && a.preventScrolling(b, u), 
                    0 !== a.prevScrollTop && a.$el.trigger("scrolltop"))));
                },
                wheel: function(b) {
                    var c;
                    if (null != b) return c = b.delta || b.wheelDelta || b.originalEvent && b.originalEvent.wheelDelta || -b.detail || b.originalEvent && -b.originalEvent.detail, 
                    c && (a.sliderY += -c / 3), a.scroll(), !1;
                }
            };
        }, i.prototype.addEvents = function() {
            var a;
            this.removeEvents(), a = this.events, this.options.disableResize || this.win.bind(q, a[q]), 
            this.iOSNativeScrolling || (this.slider.bind(k, a[g]), this.pane.bind(k, a[p]).bind("" + n + " " + f, a[v])), 
            this.$content.bind("" + r + " " + n + " " + f + " " + t, a[r]);
        }, i.prototype.removeEvents = function() {
            var a;
            a = this.events, this.win.unbind(q, a[q]), this.iOSNativeScrolling || (this.slider.unbind(), 
            this.pane.unbind()), this.$content.unbind("" + r + " " + n + " " + f + " " + t, a[r]);
        }, i.prototype.generate = function() {
            var a, b, c, d, f;
            return c = this.options, d = c.paneClass, f = c.sliderClass, a = c.contentClass, 
            this.$el.find("" + d).length || this.$el.find("" + f).length || this.$el.append('<div class="' + d + '"><div class="' + f + '" /></div>'), 
            this.pane = this.$el.children("." + d), this.slider = this.pane.find("." + f), e && (b = {
                right: -e
            }, this.$el.addClass("has-scrollbar")), null != b && this.$content.css(b), this;
        }, i.prototype.restore = function() {
            this.stopped = !1, this.pane.show(), this.addEvents();
        }, i.prototype.reset = function() {
            var a, b, c, f, g, h, i, j, k, l;
            return this.iOSNativeScrolling ? (this.contentHeight = this.content.scrollHeight, 
            void 0) : (this.$el.find("." + this.options.paneClass).length || this.generate().stop(), 
            this.stopped && this.restore(), a = this.content, c = a.style, f = c.overflowY, 
            d && this.$content.css({
                height: this.$content.height()
            }), b = a.scrollHeight + e, k = parseInt(this.$el.css("max-height"), 10), k > 0 && (this.$el.height(""), 
            this.$el.height(a.scrollHeight > k ? k : a.scrollHeight)), h = this.pane.outerHeight(!1), 
            j = parseInt(this.pane.css("top"), 10), g = parseInt(this.pane.css("bottom"), 10), 
            i = h + j + g, l = Math.round(i / b * i), l < this.options.sliderMinHeight ? l = this.options.sliderMinHeight : null != this.options.sliderMaxHeight && l > this.options.sliderMaxHeight && (l = this.options.sliderMaxHeight), 
            f === r && c.overflowX !== r && (l += e), this.maxSliderTop = i - l, this.contentHeight = b, 
            this.paneHeight = h, this.paneOuterHeight = i, this.sliderHeight = l, this.slider.height(l), 
            this.events.scroll(), this.pane.show(), this.isActive = !0, a.scrollHeight === a.clientHeight || this.pane.outerHeight(!0) >= a.scrollHeight && f !== r ? (this.pane.hide(), 
            this.isActive = !1) : this.el.clientHeight === a.scrollHeight && f === r ? this.slider.hide() : this.slider.show(), 
            this.pane.css({
                opacity: this.options.alwaysVisible ? 1 : "",
                visibility: this.options.alwaysVisible ? "visible" : ""
            }), this);
        }, i.prototype.scroll = function() {
            return this.isActive ? (this.sliderY = Math.max(0, this.sliderY), this.sliderY = Math.min(this.maxSliderTop, this.sliderY), 
            this.$content.scrollTop(-1 * ((this.paneHeight - this.contentHeight + e) * this.sliderY / this.maxSliderTop)), 
            this.iOSNativeScrolling || this.slider.css({
                top: this.sliderY
            }), this) : void 0;
        }, i.prototype.scrollBottom = function(a) {
            return this.isActive ? (this.reset(), this.$content.scrollTop(this.contentHeight - this.$content.height() - a).trigger(n), 
            this) : void 0;
        }, i.prototype.scrollTop = function(a) {
            return this.isActive ? (this.reset(), this.$content.scrollTop(+a).trigger(n), this) : void 0;
        }, i.prototype.scrollTo = function(b) {
            return this.isActive ? (this.reset(), this.scrollTop(a(b).get(0).offsetTop), this) : void 0;
        }, i.prototype.stop = function() {
            return this.stopped = !0, this.removeEvents(), this.pane.hide(), this;
        }, i.prototype.destroy = function() {
            return this.stopped || this.stop(), this.pane.length && this.pane.remove(), d && this.$content.height(""), 
            this.$content.removeAttr("tabindex"), this.$el.hasClass("has-scrollbar") && (this.$el.removeClass("has-scrollbar"), 
            this.$content.css({
                right: ""
            })), this;
        }, i.prototype.flash = function() {
            var a = this;
            if (this.isActive) return this.reset(), this.pane.addClass("flashed"), setTimeout(function() {
                a.pane.removeClass("flashed");
            }, this.options.flashDelay), this;
        }, i;
    }(), a.fn.nanoScroller = function(b) {
        return this.each(function() {
            var c, d;
            if ((d = this.nanoscroller) || (c = a.extend({}, w, b), this.nanoscroller = d = new o(this, c)), 
            b && "object" == typeof b) {
                if (a.extend(d.options, b), b.scrollBottom) return d.scrollBottom(b.scrollBottom);
                if (b.scrollTop) return d.scrollTop(b.scrollTop);
                if (b.scrollTo) return d.scrollTo(b.scrollTo);
                if ("bottom" === b.scroll) return d.scrollBottom(0);
                if ("top" === b.scroll) return d.scrollTop(0);
                if (b.scroll && b.scroll instanceof a) return d.scrollTo(b.scroll);
                if (b.stop) return d.stop();
                if (b.destroy) return d.destroy();
                if (b.flash) return d.flash();
            }
            return d.reset();
        });
    }, a.fn.nanoScroller.Constructor = o;
}(jQuery, window, document);

(function(e) {
    "function" == typeof define && define.amd ? define([ "jquery" ], e) : e(jQuery);
})(function(e) {
    function t() {
        var t = this;
        t.top = "auto", t.left = "auto", t.right = "auto", t.bottom = "auto", t.set = function(o, n) {
            e.isNumeric(n) && (t[o] = Math.round(n));
        };
    }
    function o(e, t, o) {
        function n(n, i) {
            r(), e.data(v) || (n ? (i && e.data(m, !0), o.showTip(e)) : (P.tipOpenImminent = !0, 
            l = setTimeout(function() {
                l = null, s();
            }, t.intentPollInterval)));
        }
        function i(n) {
            r(), P.tipOpenImminent = !1, e.data(v) && (e.data(m, !1), n ? o.hideTip(e) : (P.delayInProgress = !0, 
            l = setTimeout(function() {
                l = null, o.hideTip(e), P.delayInProgress = !1;
            }, t.closeDelay)));
        }
        function s() {
            var i = Math.abs(P.previousX - P.currentX), s = Math.abs(P.previousY - P.currentY), r = i + s;
            t.intentSensitivity > r ? o.showTip(e) : (P.previousX = P.currentX, P.previousY = P.currentY, 
            n());
        }
        function r() {
            l = clearTimeout(l), P.delayInProgress = !1;
        }
        function a() {
            o.resetPosition(e);
        }
        var l = null;
        this.show = n, this.hide = i, this.cancel = r, this.resetPosition = a;
    }
    function n() {
        function e(e, i, r, a, l) {
            var p, c = i.split("-")[0], u = new t();
            switch (p = s(e) ? n(e, c) : o(e, c), i) {
              case "n":
                u.set("left", p.left - r / 2), u.set("bottom", P.windowHeight - p.top + l);
                break;

              case "e":
                u.set("left", p.left + l), u.set("top", p.top - a / 2);
                break;

              case "s":
                u.set("left", p.left - r / 2), u.set("top", p.top + l);
                break;

              case "w":
                u.set("top", p.top - a / 2), u.set("right", P.windowWidth - p.left + l);
                break;

              case "nw":
                u.set("bottom", P.windowHeight - p.top + l), u.set("right", P.windowWidth - p.left - 20);
                break;

              case "nw-alt":
                u.set("left", p.left), u.set("bottom", P.windowHeight - p.top + l);
                break;

              case "ne":
                u.set("left", p.left - 20), u.set("bottom", P.windowHeight - p.top + l);
                break;

              case "ne-alt":
                u.set("bottom", P.windowHeight - p.top + l), u.set("right", P.windowWidth - p.left);
                break;

              case "sw":
                u.set("top", p.top + l), u.set("right", P.windowWidth - p.left - 20);
                break;

              case "sw-alt":
                u.set("left", p.left), u.set("top", p.top + l);
                break;

              case "se":
                u.set("left", p.left - 20), u.set("top", p.top + l);
                break;

              case "se-alt":
                u.set("top", p.top + l), u.set("right", P.windowWidth - p.left);
            }
            return u;
        }
        function o(e, t) {
            var o, n, i = e.offset(), s = e.outerWidth(), r = e.outerHeight();
            switch (t) {
              case "n":
                o = i.left + s / 2, n = i.top;
                break;

              case "e":
                o = i.left + s, n = i.top + r / 2;
                break;

              case "s":
                o = i.left + s / 2, n = i.top + r;
                break;

              case "w":
                o = i.left, n = i.top + r / 2;
                break;

              case "nw":
                o = i.left, n = i.top;
                break;

              case "ne":
                o = i.left + s, n = i.top;
                break;

              case "sw":
                o = i.left, n = i.top + r;
                break;

              case "se":
                o = i.left + s, n = i.top + r;
            }
            return {
                top: n,
                left: o
            };
        }
        function n(e, t) {
            function o() {
                d.push(p.matrixTransform(u));
            }
            var n, i, s, r, a = e.closest("svg")[0], l = e[0], p = a.createSVGPoint(), c = l.getBBox(), u = l.getScreenCTM(), f = c.width / 2, w = c.height / 2, d = [], h = [ "nw", "n", "ne", "e", "se", "s", "sw", "w" ];
            if (p.x = c.x, p.y = c.y, o(), p.x += f, o(), p.x += f, o(), p.y += w, o(), p.y += w, 
            o(), p.x -= f, o(), p.x -= f, o(), p.y -= w, o(), d[0].y !== d[1].y || d[0].x !== d[7].x) for (i = Math.atan2(u.b, u.a) * O, 
            s = Math.ceil((i % 360 - 22.5) / 45), 1 > s && (s += 8); s--; ) h.push(h.shift());
            for (r = 0; d.length > r; r++) if (h[r] === t) {
                n = d[r];
                break;
            }
            return {
                top: n.y + P.scrollTop,
                left: n.x + P.scrollLeft
            };
        }
        this.compute = e;
    }
    function i(o) {
        function i(e) {
            e.data(v, !0), O.queue(function(t) {
                s(e), t();
            });
        }
        function s(e) {
            var t;
            if (e.data(v)) {
                if (P.isTipOpen) return P.isClosing || r(P.activeHover), O.delay(100).queue(function(t) {
                    s(e), t();
                }), void 0;
                e.trigger("powerTipPreRender"), t = p(e), t && (O.empty().append(t), e.trigger("powerTipRender"), 
                P.activeHover = e, P.isTipOpen = !0, O.data(g, o.mouseOnToPopup), o.followMouse ? a() : (b(e), 
                P.isFixedTipOpen = !0), O.fadeIn(o.fadeInTime, function() {
                    P.desyncTimeout || (P.desyncTimeout = setInterval(H, 500)), e.trigger("powerTipOpen");
                }));
            }
        }
        function r(e) {
            P.isClosing = !0, P.activeHover = null, P.isTipOpen = !1, P.desyncTimeout = clearInterval(P.desyncTimeout), 
            e.data(v, !1), e.data(m, !1), O.fadeOut(o.fadeOutTime, function() {
                var n = new t();
                P.isClosing = !1, P.isFixedTipOpen = !1, O.removeClass(), n.set("top", P.currentY + o.offset), 
                n.set("left", P.currentX + o.offset), O.css(n), e.trigger("powerTipClose");
            });
        }
        function a() {
            if (!P.isFixedTipOpen && (P.isTipOpen || P.tipOpenImminent && O.data(T))) {
                var e, n, i = O.outerWidth(), s = O.outerHeight(), r = new t();
                r.set("top", P.currentY + o.offset), r.set("left", P.currentX + o.offset), e = c(r, i, s), 
                e !== I.none && (n = u(e), 1 === n ? e === I.right ? r.set("left", P.windowWidth - i) : e === I.bottom && r.set("top", P.scrollTop + P.windowHeight - s) : (r.set("left", P.currentX - i - o.offset), 
                r.set("top", P.currentY - s - o.offset))), O.css(r);
            }
        }
        function b(t) {
            var n, i;
            o.smartPlacement ? (n = e.fn.powerTip.smartPlacementLists[o.placement], e.each(n, function(e, o) {
                var n = c(y(t, o), O.outerWidth(), O.outerHeight());
                return i = o, n === I.none ? !1 : void 0;
            })) : (y(t, o.placement), i = o.placement), O.addClass(i);
        }
        function y(e, n) {
            var i, s, r = 0, a = new t();
            a.set("top", 0), a.set("left", 0), O.css(a);
            do i = O.outerWidth(), s = O.outerHeight(), a = k.compute(e, n, i, s, o.offset), 
            O.css(a); while (5 >= ++r && (i !== O.outerWidth() || s !== O.outerHeight()));
            return a;
        }
        function H() {
            var e = !1;
            !P.isTipOpen || P.isClosing || P.delayInProgress || (P.activeHover.data(v) === !1 || P.activeHover.is(":disabled") ? e = !0 : l(P.activeHover) || P.activeHover.is(":focus") || P.activeHover.data(m) || (O.data(g) ? l(O) || (e = !0) : e = !0), 
            e && r(P.activeHover));
        }
        var k = new n(), O = e("#" + o.popupId);
        0 === O.length && (O = e("<div/>", {
            id: o.popupId
        }), 0 === d.length && (d = e("body")), d.append(O)), o.followMouse && (O.data(T) || (f.on("mousemove", a), 
        w.on("scroll", a), O.data(T, !0))), o.mouseOnToPopup && O.on({
            mouseenter: function() {
                O.data(g) && P.activeHover && P.activeHover.data(h).cancel();
            },
            mouseleave: function() {
                P.activeHover && P.activeHover.data(h).hide();
            }
        }), this.showTip = i, this.hideTip = r, this.resetPosition = b;
    }
    function s(e) {
        return window.SVGElement && e[0] instanceof SVGElement;
    }
    function r() {
        P.mouseTrackingActive || (P.mouseTrackingActive = !0, e(function() {
            P.scrollLeft = w.scrollLeft(), P.scrollTop = w.scrollTop(), P.windowWidth = w.width(), 
            P.windowHeight = w.height();
        }), f.on("mousemove", a), w.on({
            resize: function() {
                P.windowWidth = w.width(), P.windowHeight = w.height();
            },
            scroll: function() {
                var e = w.scrollLeft(), t = w.scrollTop();
                e !== P.scrollLeft && (P.currentX += e - P.scrollLeft, P.scrollLeft = e), t !== P.scrollTop && (P.currentY += t - P.scrollTop, 
                P.scrollTop = t);
            }
        }));
    }
    function a(e) {
        P.currentX = e.pageX, P.currentY = e.pageY;
    }
    function l(e) {
        var t = e.offset(), o = e[0].getBoundingClientRect(), n = o.right - o.left, i = o.bottom - o.top;
        return P.currentX >= t.left && P.currentX <= t.left + n && P.currentY >= t.top && P.currentY <= t.top + i;
    }
    function p(t) {
        var o, n, i = t.data(y), s = t.data(H), r = t.data(k);
        return i ? (e.isFunction(i) && (i = i.call(t[0])), n = i) : s ? (e.isFunction(s) && (s = s.call(t[0])), 
        s.length > 0 && (n = s.clone(!0, !0))) : r && (o = e("#" + r), o.length > 0 && (n = o.html())), 
        n;
    }
    function c(e, t, o) {
        var n = P.scrollTop, i = P.scrollLeft, s = n + P.windowHeight, r = i + P.windowWidth, a = I.none;
        return (n > e.top || n > Math.abs(e.bottom - P.windowHeight) - o) && (a |= I.top), 
        (e.top + o > s || Math.abs(e.bottom - P.windowHeight) > s) && (a |= I.bottom), (i > e.left || e.right + t > r) && (a |= I.left), 
        (e.left + t > r || i > e.right) && (a |= I.right), a;
    }
    function u(e) {
        for (var t = 0; e; ) e &= e - 1, t++;
        return t;
    }
    var f = e(document), w = e(window), d = e("body"), h = "displayController", v = "hasActiveHover", m = "forcedOpen", T = "hasMouseMove", g = "mouseOnToPopup", b = "originalTitle", y = "powertip", H = "powertipjq", k = "powertiptarget", O = 180 / Math.PI, P = {
        isTipOpen: !1,
        isFixedTipOpen: !1,
        isClosing: !1,
        tipOpenImminent: !1,
        activeHover: null,
        currentX: 0,
        currentY: 0,
        previousX: 0,
        previousY: 0,
        desyncTimeout: null,
        mouseTrackingActive: !1,
        delayInProgress: !1,
        windowWidth: 0,
        windowHeight: 0,
        scrollTop: 0,
        scrollLeft: 0
    }, I = {
        none: 0,
        top: 1,
        bottom: 2,
        left: 4,
        right: 8
    };
    e.fn.powerTip = function(t, n) {
        if (!this.length) return this;
        if ("string" === e.type(t) && e.powerTip[t]) return e.powerTip[t].call(this, this, n);
        var s = e.extend({}, e.fn.powerTip.defaults, t), a = new i(s);
        return r(), this.each(function() {
            var t, n = e(this), i = n.data(y), r = n.data(H), l = n.data(k);
            n.data(h) && e.powerTip.destroy(n), t = n.attr("title"), i || l || r || !t || (n.data(y, t), 
            n.data(b, t), n.removeAttr("title")), n.data(h, new o(n, s, a));
        }), s.manual || this.on({
            "mouseenter.powertip": function(t) {
                e.powerTip.show(this, t);
            },
            "mouseleave.powertip": function() {
                e.powerTip.hide(this);
            },
            "focus.powertip": function() {
                e.powerTip.show(this);
            },
            "blur.powertip": function() {
                e.powerTip.hide(this, !0);
            },
            "keydown.powertip": function(t) {
                27 === t.keyCode && e.powerTip.hide(this, !0);
            }
        }), this;
    }, e.fn.powerTip.defaults = {
        fadeInTime: 200,
        fadeOutTime: 100,
        followMouse: !1,
        popupId: "powerTip",
        intentSensitivity: 7,
        intentPollInterval: 100,
        closeDelay: 100,
        placement: "n",
        smartPlacement: !1,
        offset: 10,
        mouseOnToPopup: !1,
        manual: !1
    }, e.fn.powerTip.smartPlacementLists = {
        n: [ "n", "ne", "nw", "s" ],
        e: [ "e", "ne", "se", "w", "nw", "sw", "n", "s", "e" ],
        s: [ "s", "se", "sw", "n" ],
        w: [ "w", "nw", "sw", "e", "ne", "se", "n", "s", "w" ],
        nw: [ "nw", "w", "sw", "n", "s", "se", "nw" ],
        ne: [ "ne", "e", "se", "n", "s", "sw", "ne" ],
        sw: [ "sw", "w", "nw", "s", "n", "ne", "sw" ],
        se: [ "se", "e", "ne", "s", "n", "nw", "se" ],
        "nw-alt": [ "nw-alt", "n", "ne-alt", "sw-alt", "s", "se-alt", "w", "e" ],
        "ne-alt": [ "ne-alt", "n", "nw-alt", "se-alt", "s", "sw-alt", "e", "w" ],
        "sw-alt": [ "sw-alt", "s", "se-alt", "nw-alt", "n", "ne-alt", "w", "e" ],
        "se-alt": [ "se-alt", "s", "sw-alt", "ne-alt", "n", "nw-alt", "e", "w" ]
    }, e.powerTip = {
        show: function(t, o) {
            return o ? (a(o), P.previousX = o.pageX, P.previousY = o.pageY, e(t).data(h).show()) : e(t).first().data(h).show(!0, !0), 
            t;
        },
        reposition: function(t) {
            return e(t).first().data(h).resetPosition(), t;
        },
        hide: function(t, o) {
            return t ? e(t).first().data(h).hide(o) : P.activeHover && P.activeHover.data(h).hide(!0), 
            t;
        },
        destroy: function(t) {
            return e(t).off(".powertip").each(function() {
                var t = e(this), o = [ b, h, v, m ];
                t.data(b) && (t.attr("title", t.data(b)), o.push(y)), t.removeData(o);
            }), t;
        }
    }, e.powerTip.showTip = e.powerTip.show, e.powerTip.closeTip = e.powerTip.hide;
});

(function(win) {
    var store = {}, doc = win.document, localStorageName = "localStorage", scriptTag = "script", storage;
    store.disabled = false;
    store.set = function(key, value) {};
    store.get = function(key) {};
    store.remove = function(key) {};
    store.clear = function() {};
    store.transact = function(key, defaultVal, transactionFn) {
        var val = store.get(key);
        if (transactionFn == null) {
            transactionFn = defaultVal;
            defaultVal = null;
        }
        if (typeof val == "undefined") {
            val = defaultVal || {};
        }
        transactionFn(val);
        store.set(key, val);
    };
    store.getAll = function() {};
    store.forEach = function() {};
    store.serialize = function(value) {
        return JSON.stringify(value);
    };
    store.deserialize = function(value) {
        if (typeof value != "string") {
            return undefined;
        }
        try {
            return JSON.parse(value);
        } catch (e) {
            return value || undefined;
        }
    };
    function isLocalStorageNameSupported() {
        try {
            return localStorageName in win && win[localStorageName];
        } catch (err) {
            return false;
        }
    }
    if (isLocalStorageNameSupported()) {
        storage = win[localStorageName];
        store.set = function(key, val) {
            if (val === undefined) {
                return store.remove(key);
            }
            storage.setItem(key, store.serialize(val));
            return val;
        };
        store.get = function(key) {
            return store.deserialize(storage.getItem(key));
        };
        store.remove = function(key) {
            storage.removeItem(key);
        };
        store.clear = function() {
            storage.clear();
        };
        store.getAll = function() {
            var ret = {};
            store.forEach(function(key, val) {
                ret[key] = val;
            });
            return ret;
        };
        store.forEach = function(callback) {
            for (var i = 0; i < storage.length; i++) {
                var key = storage.key(i);
                callback(key, store.get(key));
            }
        };
    } else if (doc.documentElement.addBehavior) {
        var storageOwner, storageContainer;
        try {
            storageContainer = new ActiveXObject("htmlfile");
            storageContainer.open();
            storageContainer.write("<" + scriptTag + ">document.w=window</" + scriptTag + '><iframe src="/favicon.ico"></iframe>');
            storageContainer.close();
            storageOwner = storageContainer.w.frames[0].document;
            storage = storageOwner.createElement("div");
        } catch (e) {
            storage = doc.createElement("div");
            storageOwner = doc.body;
        }
        function withIEStorage(storeFunction) {
            return function() {
                var args = Array.prototype.slice.call(arguments, 0);
                args.unshift(storage);
                storageOwner.appendChild(storage);
                storage.addBehavior("#default#userData");
                storage.load(localStorageName);
                var result = storeFunction.apply(store, args);
                storageOwner.removeChild(storage);
                return result;
            };
        }
        var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");
        function ieKeyFix(key) {
            return key.replace(forbiddenCharsRegex, "___");
        }
        store.set = withIEStorage(function(storage, key, val) {
            key = ieKeyFix(key);
            if (val === undefined) {
                return store.remove(key);
            }
            storage.setAttribute(key, store.serialize(val));
            storage.save(localStorageName);
            return val;
        });
        store.get = withIEStorage(function(storage, key) {
            key = ieKeyFix(key);
            return store.deserialize(storage.getAttribute(key));
        });
        store.remove = withIEStorage(function(storage, key) {
            key = ieKeyFix(key);
            storage.removeAttribute(key);
            storage.save(localStorageName);
        });
        store.clear = withIEStorage(function(storage) {
            var attributes = storage.XMLDocument.documentElement.attributes;
            storage.load(localStorageName);
            for (var i = 0, attr; attr = attributes[i]; i++) {
                storage.removeAttribute(attr.name);
            }
            storage.save(localStorageName);
        });
        store.getAll = function(storage) {
            var ret = {};
            store.forEach(function(key, val) {
                ret[key] = val;
            });
            return ret;
        };
        store.forEach = withIEStorage(function(storage, callback) {
            var attributes = storage.XMLDocument.documentElement.attributes;
            for (var i = 0, attr; attr = attributes[i]; ++i) {
                callback(attr.name, store.deserialize(storage.getAttribute(attr.name)));
            }
        });
    }
    try {
        var testKey = "__storejs__";
        store.set(testKey, testKey);
        if (store.get(testKey) != testKey) {
            store.disabled = true;
        }
        store.remove(testKey);
    } catch (e) {
        store.disabled = true;
    }
    store.enabled = !store.disabled;
    if (typeof module != "undefined" && module.exports) {
        module.exports = store;
    } else if (typeof define === "function" && define.amd) {
        define(store);
    } else {
        win.store = store;
    }
})(this.window || global);

(function($) {
    $.support.touch = "ontouchend" in document;
    if (!$.support.touch) {
        return;
    }
    var mouseProto = $.ui.mouse.prototype, _mouseInit = mouseProto._mouseInit, touchHandled;
    function simulateMouseEvent(event, simulatedType) {
        if (event.originalEvent.touches.length > 1) {
            return;
        }
        event.preventDefault();
        var touch = event.originalEvent.changedTouches[0], simulatedEvent = document.createEvent("MouseEvents");
        simulatedEvent.initMouseEvent(simulatedType, true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
        event.target.dispatchEvent(simulatedEvent);
    }
    mouseProto._touchStart = function(event) {
        var self = this;
        if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
            return;
        }
        touchHandled = true;
        self._touchMoved = false;
        simulateMouseEvent(event, "mouseover");
        simulateMouseEvent(event, "mousemove");
        simulateMouseEvent(event, "mousedown");
    };
    mouseProto._touchMove = function(event) {
        if (!touchHandled) {
            return;
        }
        this._touchMoved = true;
        simulateMouseEvent(event, "mousemove");
    };
    mouseProto._touchEnd = function(event) {
        if (!touchHandled) {
            return;
        }
        simulateMouseEvent(event, "mouseup");
        simulateMouseEvent(event, "mouseout");
        if (!this._touchMoved) {
            simulateMouseEvent(event, "click");
        }
        touchHandled = false;
    };
    mouseProto._mouseInit = function() {
        var self = this;
        self.element.bind("touchstart", $.proxy(self, "_touchStart")).bind("touchmove", $.proxy(self, "_touchMove")).bind("touchend", $.proxy(self, "_touchEnd"));
        _mouseInit.call(self);
    };
})(jQuery);

(function($) {
    "use strict";
    $.Zebra_DatePicker = function(element, options) {
        var defaults = {
            always_visible: false,
            days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
            days_abbr: false,
            direction: 0,
            disabled_dates: false,
            enabled_dates: false,
            first_day_of_week: 1,
            format: "Y-m-d",
            header_navigation: [ "&#171;", "&#187;" ],
            inside: true,
            lang_clear_date: "Clear date",
            months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
            months_abbr: false,
            offset: [ 5, -5 ],
            pair: false,
            readonly_element: true,
            select_other_months: false,
            show_clear_date: 0,
            show_icon: true,
            show_other_months: true,
            show_select_today: "Today",
            show_week_number: false,
            start_date: false,
            strict: false,
            view: "days",
            weekend_days: [ 0, 6 ],
            zero_pad: false,
            onChange: null,
            onClear: null,
            onSelect: null
        };
        var view, datepicker, icon, header, daypicker, monthpicker, yearpicker, cleardate, current_system_month, current_system_year, current_system_day, first_selectable_month, first_selectable_year, first_selectable_day, selected_month, selected_year, default_day, default_month, default_year, enabled_dates, disabled_dates, shim, start_date, end_date, last_selectable_day, last_selectable_year, last_selectable_month, daypicker_cells, monthpicker_cells, yearpicker_cells, views, clickables, selecttoday, footer, show_select_today, timeout;
        var plugin = this;
        plugin.settings = {};
        var $element = $(element);
        var init = function(update) {
            if (!update) {
                plugin.settings = $.extend({}, defaults, options);
                for (var data in $element.data()) if (data.indexOf("zdp_") === 0) {
                    data = data.replace(/^zdp\_/, "");
                    if (undefined !== defaults[data]) plugin.settings[data] = $element.data("zdp_" + data);
                }
            }
            if (plugin.settings.readonly_element) $element.attr("readonly", "readonly");
            var date_chars = {
                days: [ "d", "j", "D" ],
                months: [ "F", "m", "M", "n", "t" ],
                years: [ "o", "Y", "y" ]
            }, has_days = false, has_months = false, has_years = false, type = null;
            for (type in date_chars) $.each(date_chars[type], function(index, character) {
                if (plugin.settings.format.indexOf(character) > -1) if (type == "days") has_days = true; else if (type == "months") has_months = true; else if (type == "years") has_years = true;
            });
            if (has_days && has_months && has_years) views = [ "years", "months", "days" ]; else if (!has_days && has_months && has_years) views = [ "years", "months" ]; else if (!has_days && !has_months && has_years) views = [ "years" ]; else if (!has_days && has_months && !has_years) views = [ "months" ]; else views = [ "years", "months", "days" ];
            if ($.inArray(plugin.settings.view, views) == -1) plugin.settings.view = views[views.length - 1];
            disabled_dates = [];
            enabled_dates = [];
            var dates;
            for (var l = 0; l < 2; l++) {
                if (l === 0) dates = plugin.settings.disabled_dates; else dates = plugin.settings.enabled_dates;
                if ($.isArray(dates) && dates.length > 0) $.each(dates, function() {
                    var rules = this.split(" ");
                    for (var i = 0; i < 4; i++) {
                        if (!rules[i]) rules[i] = "*";
                        rules[i] = rules[i].indexOf(",") > -1 ? rules[i].split(",") : new Array(rules[i]);
                        for (var j = 0; j < rules[i].length; j++) if (rules[i][j].indexOf("-") > -1) {
                            var limits = rules[i][j].match(/^([0-9]+)\-([0-9]+)/);
                            if (null !== limits) {
                                for (var k = to_int(limits[1]); k <= to_int(limits[2]); k++) if ($.inArray(k, rules[i]) == -1) rules[i].push(k + "");
                                rules[i].splice(j, 1);
                            }
                        }
                        for (j = 0; j < rules[i].length; j++) rules[i][j] = isNaN(to_int(rules[i][j])) ? rules[i][j] : to_int(rules[i][j]);
                    }
                    if (l === 0) disabled_dates.push(rules); else enabled_dates.push(rules);
                });
            }
            var date = new Date(), reference_date = !plugin.settings.reference_date ? $element.data("zdp_reference_date") && undefined !== $element.data("zdp_reference_date") ? $element.data("zdp_reference_date") : date : plugin.settings.reference_date, tmp_start_date, tmp_end_date;
            start_date = undefined;
            end_date = undefined;
            first_selectable_month = reference_date.getMonth();
            current_system_month = date.getMonth();
            first_selectable_year = reference_date.getFullYear();
            current_system_year = date.getFullYear();
            first_selectable_day = reference_date.getDate();
            current_system_day = date.getDate();
            if (plugin.settings.direction === true) start_date = reference_date; else if (plugin.settings.direction === false) {
                end_date = reference_date;
                last_selectable_month = end_date.getMonth();
                last_selectable_year = end_date.getFullYear();
                last_selectable_day = end_date.getDate();
            } else if (!$.isArray(plugin.settings.direction) && is_integer(plugin.settings.direction) && to_int(plugin.settings.direction) > 0 || $.isArray(plugin.settings.direction) && ((tmp_start_date = check_date(plugin.settings.direction[0])) || plugin.settings.direction[0] === true || is_integer(plugin.settings.direction[0]) && plugin.settings.direction[0] > 0) && ((tmp_end_date = check_date(plugin.settings.direction[1])) || plugin.settings.direction[1] === false || is_integer(plugin.settings.direction[1]) && plugin.settings.direction[1] >= 0)) {
                if (tmp_start_date) start_date = tmp_start_date; else start_date = new Date(first_selectable_year, first_selectable_month, first_selectable_day + (!$.isArray(plugin.settings.direction) ? to_int(plugin.settings.direction) : to_int(plugin.settings.direction[0] === true ? 0 : plugin.settings.direction[0])));
                first_selectable_month = start_date.getMonth();
                first_selectable_year = start_date.getFullYear();
                first_selectable_day = start_date.getDate();
                if (tmp_end_date && +tmp_end_date >= +start_date) end_date = tmp_end_date; else if (!tmp_end_date && plugin.settings.direction[1] !== false && $.isArray(plugin.settings.direction)) end_date = new Date(first_selectable_year, first_selectable_month, first_selectable_day + to_int(plugin.settings.direction[1]));
                if (end_date) {
                    last_selectable_month = end_date.getMonth();
                    last_selectable_year = end_date.getFullYear();
                    last_selectable_day = end_date.getDate();
                }
            } else if (!$.isArray(plugin.settings.direction) && is_integer(plugin.settings.direction) && to_int(plugin.settings.direction) < 0 || $.isArray(plugin.settings.direction) && (plugin.settings.direction[0] === false || is_integer(plugin.settings.direction[0]) && plugin.settings.direction[0] < 0) && ((tmp_start_date = check_date(plugin.settings.direction[1])) || is_integer(plugin.settings.direction[1]) && plugin.settings.direction[1] >= 0)) {
                end_date = new Date(first_selectable_year, first_selectable_month, first_selectable_day + (!$.isArray(plugin.settings.direction) ? to_int(plugin.settings.direction) : to_int(plugin.settings.direction[0] === false ? 0 : plugin.settings.direction[0])));
                last_selectable_month = end_date.getMonth();
                last_selectable_year = end_date.getFullYear();
                last_selectable_day = end_date.getDate();
                if (tmp_start_date && +tmp_start_date < +end_date) start_date = tmp_start_date; else if (!tmp_start_date && $.isArray(plugin.settings.direction)) start_date = new Date(last_selectable_year, last_selectable_month, last_selectable_day - to_int(plugin.settings.direction[1]));
                if (start_date) {
                    first_selectable_month = start_date.getMonth();
                    first_selectable_year = start_date.getFullYear();
                    first_selectable_day = start_date.getDate();
                }
            } else if ($.isArray(plugin.settings.disabled_dates) && plugin.settings.disabled_dates.length > 0) for (var interval in disabled_dates) if (disabled_dates[interval][0] == "*" && disabled_dates[interval][1] == "*" && disabled_dates[interval][2] == "*" && disabled_dates[interval][3] == "*") {
                var tmpDates = [];
                $.each(enabled_dates, function() {
                    var rule = this;
                    if (rule[2][0] != "*") tmpDates.push(parseInt(rule[2][0] + (rule[1][0] == "*" ? "12" : str_pad(rule[1][0], 2)) + (rule[0][0] == "*" ? rule[1][0] == "*" ? "31" : new Date(rule[2][0], rule[1][0], 0).getDate() : str_pad(rule[0][0], 2)), 10));
                });
                tmpDates.sort();
                if (tmpDates.length > 0) {
                    var matches = (tmpDates[0] + "").match(/([0-9]{4})([0-9]{2})([0-9]{2})/);
                    first_selectable_year = parseInt(matches[1], 10);
                    first_selectable_month = parseInt(matches[2], 10) - 1;
                    first_selectable_day = parseInt(matches[3], 10);
                }
                break;
            }
            if (is_disabled(first_selectable_year, first_selectable_month, first_selectable_day)) {
                while (is_disabled(first_selectable_year)) {
                    if (!start_date) {
                        first_selectable_year--;
                        first_selectable_month = 11;
                    } else {
                        first_selectable_year++;
                        first_selectable_month = 0;
                    }
                }
                while (is_disabled(first_selectable_year, first_selectable_month)) {
                    if (!start_date) {
                        first_selectable_month--;
                        first_selectable_day = new Date(first_selectable_year, first_selectable_month + 1, 0).getDate();
                    } else {
                        first_selectable_month++;
                        first_selectable_day = 1;
                    }
                    if (first_selectable_month > 11) {
                        first_selectable_year++;
                        first_selectable_month = 0;
                        first_selectable_day = 1;
                    } else if (first_selectable_month < 0) {
                        first_selectable_year--;
                        first_selectable_month = 11;
                        first_selectable_day = new Date(first_selectable_year, first_selectable_month + 1, 0).getDate();
                    }
                }
                while (is_disabled(first_selectable_year, first_selectable_month, first_selectable_day)) {
                    if (!start_date) first_selectable_day--; else first_selectable_day++;
                    date = new Date(first_selectable_year, first_selectable_month, first_selectable_day);
                    first_selectable_year = date.getFullYear();
                    first_selectable_month = date.getMonth();
                    first_selectable_day = date.getDate();
                }
                date = new Date(first_selectable_year, first_selectable_month, first_selectable_day);
                first_selectable_year = date.getFullYear();
                first_selectable_month = date.getMonth();
                first_selectable_day = date.getDate();
            }
            var default_date = check_date($element.val() || (plugin.settings.start_date ? plugin.settings.start_date : ""));
            if (default_date && plugin.settings.strict && is_disabled(default_date.getFullYear(), default_date.getMonth(), default_date.getDate())) $element.val("");
            if (!update) update_dependent(start_date);
            if (!plugin.settings.always_visible) {
                if (!update) {
                    if (plugin.settings.show_icon) {
                        if (browser.name == "firefox" && $element.is('input[type="text"]') && $element.css("display") == "inline") $element.css("display", "inline-block");
                        var icon_wrapper = jQuery('<span class="Zebra_DatePicker_Icon_Wrapper"></span>').css({
                            display: $element.css("display"),
                            position: $element.css("position") == "static" ? "relative" : $element.css("position"),
                            "float": $element.css("float"),
                            top: $element.css("top"),
                            right: $element.css("right"),
                            bottom: $element.css("bottom"),
                            left: $element.css("left")
                        });
                        $element.wrap(icon_wrapper).css({
                            position: "relative",
                            top: "auto",
                            right: "auto",
                            bottom: "auto",
                            left: "auto"
                        });
                        icon = jQuery('<button type="button" class="Zebra_DatePicker_Icon' + ($element.attr("disabled") == "disabled" ? " Zebra_DatePicker_Icon_Disabled" : "") + '">Pick a date</button>');
                        plugin.icon = icon;
                        clickables = icon.add($element);
                    } else clickables = $element;
                    clickables.bind("click", function(e) {
                        e.preventDefault();
                        if (!$element.attr("disabled")) if (datepicker.css("display") != "none") plugin.hide(); else plugin.show();
                    });
                    if (undefined !== icon) icon.insertAfter($element);
                }
                if (undefined !== icon) {
                    icon.attr("style", "");
                    if (plugin.settings.inside) icon.addClass("Zebra_DatePicker_Icon_Inside");
                    var element_width = $element.outerWidth(), element_height = $element.outerHeight(), element_margin_left = parseInt($element.css("marginLeft"), 10) || 0, element_margin_top = parseInt($element.css("marginTop"), 10) || 0, icon_width = icon.outerWidth(), icon_height = icon.outerHeight(), icon_margin_left = parseInt(icon.css("marginLeft"), 10) || 0, icon_margin_right = parseInt(icon.css("marginRight"), 10) || 0;
                    if (plugin.settings.inside) icon.css({
                        top: element_margin_top + (element_height - icon_height) / 2,
                        left: element_margin_left + (element_width - icon_width - icon_margin_right)
                    }); else icon.css({
                        top: element_margin_top + (element_height - icon_height) / 2,
                        left: element_margin_left + element_width + icon_margin_left
                    });
                }
            }
            show_select_today = plugin.settings.show_select_today !== false && $.inArray("days", views) > -1 && !is_disabled(current_system_year, current_system_month, current_system_day) ? plugin.settings.show_select_today : false;
            if (update) return;
            $(window).bind("resize.Zebra_DatePicker", function() {
                plugin.hide();
                if (icon !== undefined) {
                    clearTimeout(timeout);
                    timeout = setTimeout(function() {
                        plugin.update();
                    }, 100);
                }
            });
            var html = "" + '<div class="Zebra_DatePicker">' + '<table class="dp_header">' + "<tr>" + '<td class="dp_previous">' + plugin.settings.header_navigation[0] + "</td>" + '<td class="dp_caption">&#032;</td>' + '<td class="dp_next">' + plugin.settings.header_navigation[1] + "</td>" + "</tr>" + "</table>" + '<table class="dp_daypicker"></table>' + '<table class="dp_monthpicker"></table>' + '<table class="dp_yearpicker"></table>' + '<table class="dp_footer"><tr>' + '<td class="dp_today"' + (plugin.settings.show_clear_date !== false ? ' style="width:50%"' : "") + ">" + show_select_today + "</td>" + '<td class="dp_clear"' + (show_select_today !== false ? ' style="width:50%"' : "") + ">" + plugin.settings.lang_clear_date + "</td>" + "</tr></table>" + "</div>";
            datepicker = $(html);
            plugin.datepicker = datepicker;
            header = $("table.dp_header", datepicker);
            daypicker = $("table.dp_daypicker", datepicker);
            monthpicker = $("table.dp_monthpicker", datepicker);
            yearpicker = $("table.dp_yearpicker", datepicker);
            footer = $("table.dp_footer", datepicker);
            selecttoday = $("td.dp_today", footer);
            cleardate = $("td.dp_clear", footer);
            if (!plugin.settings.always_visible) $("body").append(datepicker); else if (!$element.attr("disabled")) {
                plugin.settings.always_visible.append(datepicker);
                plugin.show();
            }
            datepicker.delegate("td:not(.dp_disabled, .dp_weekend_disabled, .dp_not_in_month, .dp_blocked, .dp_week_number)", "mouseover", function() {
                $(this).addClass("dp_hover");
            }).delegate("td:not(.dp_disabled, .dp_weekend_disabled, .dp_not_in_month, .dp_blocked, .dp_week_number)", "mouseout", function() {
                $(this).removeClass("dp_hover");
            });
            disable_text_select($("td", header));
            $(".dp_previous", header).bind("click", function() {
                if (!$(this).hasClass("dp_blocked")) {
                    if (view == "months") selected_year--; else if (view == "years") selected_year -= 12; else if (--selected_month < 0) {
                        selected_month = 11;
                        selected_year--;
                    }
                    manage_views();
                }
            });
            $(".dp_caption", header).bind("click", function() {
                if (view == "days") view = $.inArray("months", views) > -1 ? "months" : $.inArray("years", views) > -1 ? "years" : "days"; else if (view == "months") view = $.inArray("years", views) > -1 ? "years" : $.inArray("days", views) > -1 ? "days" : "months"; else view = $.inArray("days", views) > -1 ? "days" : $.inArray("months", views) > -1 ? "months" : "years";
                manage_views();
            });
            $(".dp_next", header).bind("click", function() {
                if (!$(this).hasClass("dp_blocked")) {
                    if (view == "months") selected_year++; else if (view == "years") selected_year += 12; else if (++selected_month == 12) {
                        selected_month = 0;
                        selected_year++;
                    }
                    manage_views();
                }
            });
            daypicker.delegate("td:not(.dp_disabled, .dp_weekend_disabled, .dp_not_in_month, .dp_week_number)", "click", function() {
                if (plugin.settings.select_other_months && null !== (matches = $(this).attr("class").match(/date\_([0-9]{4})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])/))) select_date(matches[1], matches[2] - 1, matches[3], "days", $(this)); else select_date(selected_year, selected_month, to_int($(this).html()), "days", $(this));
            });
            monthpicker.delegate("td:not(.dp_disabled)", "click", function() {
                var matches = $(this).attr("class").match(/dp\_month\_([0-9]+)/);
                selected_month = to_int(matches[1]);
                if ($.inArray("days", views) == -1) select_date(selected_year, selected_month, 1, "months", $(this)); else {
                    view = "days";
                    if (plugin.settings.always_visible) $element.val("");
                    manage_views();
                }
            });
            yearpicker.delegate("td:not(.dp_disabled)", "click", function() {
                selected_year = to_int($(this).html());
                if ($.inArray("months", views) == -1) select_date(selected_year, 1, 1, "years", $(this)); else {
                    view = "months";
                    if (plugin.settings.always_visible) $element.val("");
                    manage_views();
                }
            });
            $(selecttoday).bind("click", function(e) {
                e.preventDefault();
                select_date(current_system_year, current_system_month, current_system_day, "days", $(".dp_current", daypicker));
                if (plugin.settings.always_visible) plugin.show();
                plugin.hide();
            });
            $(cleardate).bind("click", function(e) {
                e.preventDefault();
                $element.val("");
                if (!plugin.settings.always_visible) {
                    default_day = null;
                    default_month = null;
                    default_year = null;
                    selected_month = null;
                    selected_year = null;
                } else {
                    default_day = null;
                    default_month = null;
                    default_year = null;
                    $("td.dp_selected", datepicker).removeClass("dp_selected");
                }
                plugin.hide();
                if (plugin.settings.onClear && typeof plugin.settings.onClear == "function") plugin.settings.onClear($element);
            });
            if (!plugin.settings.always_visible) $(document).bind({
                "mousedown.Zebra_DatePicker": function(e) {
                    if (datepicker.css("display") == "block") {
                        if (plugin.settings.show_icon && $(e.target).get(0) === icon.get(0)) return true;
                        if ($(e.target).parents().filter(".Zebra_DatePicker").length === 0) plugin.hide();
                    }
                },
                "keyup.Zebra_DatePicker": function(e) {
                    if (datepicker.css("display") == "block" && e.which == 27) plugin.hide();
                }
            });
            manage_views();
        };
        plugin.destroy = function() {
            if (undefined !== plugin.icon) plugin.icon.remove();
            plugin.datepicker.remove();
            $(document).unbind("keyup.Zebra_DatePicker");
            $(document).unbind("mousedown.Zebra_DatePicker");
            $(window).unbind("resize.Zebra_DatePicker");
            $element.removeData("Zebra_DatePicker");
        };
        plugin.hide = function() {
            if (!plugin.settings.always_visible) {
                iframeShim("hide");
                datepicker.hide();
            }
        };
        plugin.show = function() {
            view = plugin.settings.view;
            var default_date = check_date($element.val() || (plugin.settings.start_date ? plugin.settings.start_date : ""));
            if (default_date) {
                default_month = default_date.getMonth();
                selected_month = default_date.getMonth();
                default_year = default_date.getFullYear();
                selected_year = default_date.getFullYear();
                default_day = default_date.getDate();
                if (is_disabled(default_year, default_month, default_day)) {
                    if (plugin.settings.strict) $element.val("");
                    selected_month = first_selectable_month;
                    selected_year = first_selectable_year;
                }
            } else {
                selected_month = first_selectable_month;
                selected_year = first_selectable_year;
            }
            manage_views();
            if (!plugin.settings.always_visible) {
                var datepicker_width = datepicker.outerWidth(), datepicker_height = datepicker.outerHeight(), left = (undefined !== icon ? icon.offset().left + icon.outerWidth(true) : $element.offset().left + $element.outerWidth(true)) + plugin.settings.offset[0], top = (undefined !== icon ? icon.offset().top : $element.offset().top) - datepicker_height + plugin.settings.offset[1], window_width = $(window).width(), window_height = $(window).height(), window_scroll_top = $(window).scrollTop(), window_scroll_left = $(window).scrollLeft();
                if (left + datepicker_width > window_scroll_left + window_width) left = window_scroll_left + window_width - datepicker_width;
                if (left < window_scroll_left) left = window_scroll_left;
                if (top + datepicker_height > window_scroll_top + window_height) top = window_scroll_top + window_height - datepicker_height;
                if (top < window_scroll_top) top = window_scroll_top;
                datepicker.css({
                    left: left,
                    top: top
                });
                datepicker.fadeIn(browser.name == "explorer" && browser.version < 9 ? 0 : 150, "linear");
                iframeShim();
            } else datepicker.show();
        };
        plugin.update = function(values) {
            if (plugin.original_direction) plugin.original_direction = plugin.direction;
            plugin.settings = $.extend(plugin.settings, values);
            init(true);
        };
        var check_date = function(str_date) {
            str_date += "";
            if ($.trim(str_date) !== "") {
                var format = escape_regexp(plugin.settings.format), format_chars = [ "d", "D", "j", "l", "N", "S", "w", "F", "m", "M", "n", "Y", "y" ], matches = [], regexp = [], position = null, segments = null;
                for (var i = 0; i < format_chars.length; i++) if ((position = format.indexOf(format_chars[i])) > -1) matches.push({
                    character: format_chars[i],
                    position: position
                });
                matches.sort(function(a, b) {
                    return a.position - b.position;
                });
                $.each(matches, function(index, match) {
                    switch (match.character) {
                      case "d":
                        regexp.push("0[1-9]|[12][0-9]|3[01]");
                        break;

                      case "D":
                        regexp.push("[a-z]{3}");
                        break;

                      case "j":
                        regexp.push("[1-9]|[12][0-9]|3[01]");
                        break;

                      case "l":
                        regexp.push("[a-z]+");
                        break;

                      case "N":
                        regexp.push("[1-7]");
                        break;

                      case "S":
                        regexp.push("st|nd|rd|th");
                        break;

                      case "w":
                        regexp.push("[0-6]");
                        break;

                      case "F":
                        regexp.push("[a-z]+");
                        break;

                      case "m":
                        regexp.push("0[1-9]|1[012]+");
                        break;

                      case "M":
                        regexp.push("[a-z]{3}");
                        break;

                      case "n":
                        regexp.push("[1-9]|1[012]");
                        break;

                      case "Y":
                        regexp.push("[0-9]{4}");
                        break;

                      case "y":
                        regexp.push("[0-9]{2}");
                        break;
                    }
                });
                if (regexp.length) {
                    matches.reverse();
                    $.each(matches, function(index, match) {
                        format = format.replace(match.character, "(" + regexp[regexp.length - index - 1] + ")");
                    });
                    regexp = new RegExp("^" + format + "$", "ig");
                    if (segments = regexp.exec(str_date)) {
                        var tmpdate = new Date(), original_day = tmpdate.getDate(), original_month = tmpdate.getMonth() + 1, original_year = tmpdate.getFullYear(), english_days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ], english_months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ], iterable, valid = true;
                        matches.reverse();
                        $.each(matches, function(index, match) {
                            if (!valid) return true;
                            switch (match.character) {
                              case "m":
                              case "n":
                                original_month = to_int(segments[index + 1]);
                                break;

                              case "d":
                              case "j":
                                original_day = to_int(segments[index + 1]);
                                break;

                              case "D":
                              case "l":
                              case "F":
                              case "M":
                                if (match.character == "D" || match.character == "l") iterable = plugin.settings.days; else iterable = plugin.settings.months;
                                valid = false;
                                $.each(iterable, function(key, value) {
                                    if (valid) return true;
                                    if (segments[index + 1].toLowerCase() == value.substring(0, match.character == "D" || match.character == "M" ? 3 : value.length).toLowerCase()) {
                                        switch (match.character) {
                                          case "D":
                                            segments[index + 1] = english_days[key].substring(0, 3);
                                            break;

                                          case "l":
                                            segments[index + 1] = english_days[key];
                                            break;

                                          case "F":
                                            segments[index + 1] = english_months[key];
                                            original_month = key + 1;
                                            break;

                                          case "M":
                                            segments[index + 1] = english_months[key].substring(0, 3);
                                            original_month = key + 1;
                                            break;
                                        }
                                        valid = true;
                                    }
                                });
                                break;

                              case "Y":
                                original_year = to_int(segments[index + 1]);
                                break;

                              case "y":
                                original_year = "19" + to_int(segments[index + 1]);
                                break;
                            }
                        });
                        if (valid) {
                            var date = new Date(original_year, (original_month || 1) - 1, original_day || 1);
                            if (date.getFullYear() == original_year && date.getDate() == (original_day || 1) && date.getMonth() == (original_month || 1) - 1) return date;
                        }
                    }
                }
                return false;
            }
        };
        var disable_text_select = function(el) {
            if (browser.name == "firefox") el.css("MozUserSelect", "none"); else if (browser.name == "explorer") el.bind("selectstart", function() {
                return false;
            }); else el.mousedown(function() {
                return false;
            });
        };
        var escape_regexp = function(str) {
            return str.replace(/([-.,*+?^${}()|[\]\/\\])/g, "\\$1");
        };
        var format = function(date) {
            var result = "", j = date.getDate(), w = date.getDay(), l = plugin.settings.days[w], n = date.getMonth() + 1, f = plugin.settings.months[n - 1], y = date.getFullYear() + "";
            for (var i = 0; i < plugin.settings.format.length; i++) {
                var chr = plugin.settings.format.charAt(i);
                switch (chr) {
                  case "y":
                    y = y.substr(2);

                  case "Y":
                    result += y;
                    break;

                  case "m":
                    n = str_pad(n, 2);

                  case "n":
                    result += n;
                    break;

                  case "M":
                    f = $.isArray(plugin.settings.months_abbr) && undefined !== plugin.settings.months_abbr[n - 1] ? plugin.settings.months_abbr[n - 1] : plugin.settings.months[n - 1].substr(0, 3);

                  case "F":
                    result += f;
                    break;

                  case "d":
                    j = str_pad(j, 2);

                  case "j":
                    result += j;
                    break;

                  case "D":
                    l = $.isArray(plugin.settings.days_abbr) && undefined !== plugin.settings.days_abbr[w] ? plugin.settings.days_abbr[w] : plugin.settings.days[w].substr(0, 3);

                  case "l":
                    result += l;
                    break;

                  case "N":
                    w++;

                  case "w":
                    result += w;
                    break;

                  case "S":
                    if (j % 10 == 1 && j != "11") result += "st"; else if (j % 10 == 2 && j != "12") result += "nd"; else if (j % 10 == 3 && j != "13") result += "rd"; else result += "th";
                    break;

                  default:
                    result += chr;
                }
            }
            return result;
        };
        var generate_daypicker = function() {
            var days_in_month = new Date(selected_year, selected_month + 1, 0).getDate(), first_day = new Date(selected_year, selected_month, 1).getDay(), days_in_previous_month = new Date(selected_year, selected_month, 0).getDate(), days_from_previous_month = first_day - plugin.settings.first_day_of_week;
            days_from_previous_month = days_from_previous_month < 0 ? 7 + days_from_previous_month : days_from_previous_month;
            manage_header(plugin.settings.months[selected_month] + ", " + selected_year);
            var html = "<tr>";
            if (plugin.settings.show_week_number) html += "<th>" + plugin.settings.show_week_number + "</th>";
            for (var i = 0; i < 7; i++) html += "<th>" + ($.isArray(plugin.settings.days_abbr) && undefined !== plugin.settings.days_abbr[(plugin.settings.first_day_of_week + i) % 7] ? plugin.settings.days_abbr[(plugin.settings.first_day_of_week + i) % 7] : plugin.settings.days[(plugin.settings.first_day_of_week + i) % 7].substr(0, 2)) + "</th>";
            html += "</tr><tr>";
            for (i = 0; i < 42; i++) {
                if (i > 0 && i % 7 === 0) html += "</tr><tr>";
                if (i % 7 === 0 && plugin.settings.show_week_number) html += '<td class="dp_week_number">' + getWeekNumber(new Date(selected_year, selected_month, i - days_from_previous_month + 1)) + "</td>";
                var day = i - days_from_previous_month + 1;
                if (plugin.settings.select_other_months && (i < days_from_previous_month || day > days_in_month)) {
                    var real_date = new Date(selected_year, selected_month, day), real_year = real_date.getFullYear(), real_month = real_date.getMonth(), real_day = real_date.getDate();
                    real_date = real_year + str_pad(real_month + 1, 2) + str_pad(real_day, 2);
                }
                if (i < days_from_previous_month) html += '<td class="' + (plugin.settings.select_other_months && !is_disabled(real_year, real_month, real_day) ? "dp_not_in_month_selectable date_" + real_date : "dp_not_in_month") + '">' + (plugin.settings.select_other_months || plugin.settings.show_other_months ? str_pad(days_in_previous_month - days_from_previous_month + i + 1, plugin.settings.zero_pad ? 2 : 0) : "&nbsp;") + "</td>"; else if (day > days_in_month) html += '<td class="' + (plugin.settings.select_other_months && !is_disabled(real_year, real_month, real_day) ? "dp_not_in_month_selectable date_" + real_date : "dp_not_in_month") + '">' + (plugin.settings.select_other_months || plugin.settings.show_other_months ? str_pad(day - days_in_month, plugin.settings.zero_pad ? 2 : 0) : "&nbsp;") + "</td>"; else {
                    var weekday = (plugin.settings.first_day_of_week + i) % 7, class_name = "";
                    if (is_disabled(selected_year, selected_month, day)) {
                        if ($.inArray(weekday, plugin.settings.weekend_days) > -1) class_name = "dp_weekend_disabled"; else class_name += " dp_disabled";
                        if (selected_month == current_system_month && selected_year == current_system_year && current_system_day == day) class_name += " dp_disabled_current";
                    } else {
                        if ($.inArray(weekday, plugin.settings.weekend_days) > -1) class_name = "dp_weekend";
                        if (selected_month == default_month && selected_year == default_year && default_day == day) class_name += " dp_selected";
                        if (selected_month == current_system_month && selected_year == current_system_year && current_system_day == day) class_name += " dp_current";
                    }
                    html += "<td" + (class_name !== "" ? ' class="' + $.trim(class_name) + '"' : "") + ">" + (plugin.settings.zero_pad ? str_pad(day, 2) : day) + "</td>";
                }
            }
            html += "</tr>";
            daypicker.html($(html));
            if (plugin.settings.always_visible) daypicker_cells = $("td:not(.dp_disabled, .dp_weekend_disabled, .dp_not_in_month, .dp_blocked, .dp_week_number)", daypicker);
            daypicker.show();
        };
        var generate_monthpicker = function() {
            manage_header(selected_year);
            var html = "<tr>";
            for (var i = 0; i < 12; i++) {
                if (i > 0 && i % 3 === 0) html += "</tr><tr>";
                var class_name = "dp_month_" + i;
                if (is_disabled(selected_year, i)) class_name += " dp_disabled"; else if (default_month !== false && default_month == i && selected_year == default_year) class_name += " dp_selected"; else if (current_system_month == i && current_system_year == selected_year) class_name += " dp_current";
                html += '<td class="' + $.trim(class_name) + '">' + ($.isArray(plugin.settings.months_abbr) && undefined !== plugin.settings.months_abbr[i] ? plugin.settings.months_abbr[i] : plugin.settings.months[i].substr(0, 3)) + "</td>";
            }
            html += "</tr>";
            monthpicker.html($(html));
            if (plugin.settings.always_visible) monthpicker_cells = $("td:not(.dp_disabled)", monthpicker);
            monthpicker.show();
        };
        var generate_yearpicker = function() {
            manage_header(selected_year - 7 + " - " + (selected_year + 4));
            var html = "<tr>";
            for (var i = 0; i < 12; i++) {
                if (i > 0 && i % 3 === 0) html += "</tr><tr>";
                var class_name = "";
                if (is_disabled(selected_year - 7 + i)) class_name += " dp_disabled"; else if (default_year && default_year == selected_year - 7 + i) class_name += " dp_selected"; else if (current_system_year == selected_year - 7 + i) class_name += " dp_current";
                html += "<td" + ($.trim(class_name) !== "" ? ' class="' + $.trim(class_name) + '"' : "") + ">" + (selected_year - 7 + i) + "</td>";
            }
            html += "</tr>";
            yearpicker.html($(html));
            if (plugin.settings.always_visible) yearpicker_cells = $("td:not(.dp_disabled)", yearpicker);
            yearpicker.show();
        };
        var iframeShim = function(action) {
            if (browser.name == "explorer" && browser.version == 6) {
                if (!shim) {
                    var zIndex = to_int(datepicker.css("zIndex")) - 1;
                    shim = jQuery("<iframe>", {
                        src: 'javascript:document.write("")',
                        scrolling: "no",
                        frameborder: 0,
                        allowtransparency: "true",
                        css: {
                            zIndex: zIndex,
                            position: "absolute",
                            top: -1e3,
                            left: -1e3,
                            width: datepicker.outerWidth(),
                            height: datepicker.outerHeight(),
                            filter: "progid:DXImageTransform.Microsoft.Alpha(opacity=0)",
                            display: "none"
                        }
                    });
                    $("body").append(shim);
                }
                switch (action) {
                  case "hide":
                    shim.hide();
                    break;

                  default:
                    var offset = datepicker.offset();
                    shim.css({
                        top: offset.top,
                        left: offset.left,
                        display: "block"
                    });
                }
            }
        };
        var is_disabled = function(year, month, day) {
            if ((undefined === year || isNaN(year)) && (undefined === month || isNaN(month)) && (undefined === day || isNaN(day))) return false;
            if (!(!$.isArray(plugin.settings.direction) && to_int(plugin.settings.direction) === 0)) {
                var now = to_int(str_concat(year, typeof month != "undefined" ? str_pad(month, 2) : "", typeof day != "undefined" ? str_pad(day, 2) : "")), len = (now + "").length;
                if (len == 8 && (typeof start_date != "undefined" && now < to_int(str_concat(first_selectable_year, str_pad(first_selectable_month, 2), str_pad(first_selectable_day, 2))) || typeof end_date != "undefined" && now > to_int(str_concat(last_selectable_year, str_pad(last_selectable_month, 2), str_pad(last_selectable_day, 2))))) return true; else if (len == 6 && (typeof start_date != "undefined" && now < to_int(str_concat(first_selectable_year, str_pad(first_selectable_month, 2))) || typeof end_date != "undefined" && now > to_int(str_concat(last_selectable_year, str_pad(last_selectable_month, 2))))) return true; else if (len == 4 && (typeof start_date != "undefined" && now < first_selectable_year || typeof end_date != "undefined" && now > last_selectable_year)) return true;
            }
            if (typeof month != "undefined") month = month + 1;
            var disabled = false, enabled = false;
            if (disabled_dates) $.each(disabled_dates, function() {
                if (disabled) return;
                var rule = this;
                if ($.inArray(year, rule[2]) > -1 || $.inArray("*", rule[2]) > -1) if (typeof month != "undefined" && $.inArray(month, rule[1]) > -1 || $.inArray("*", rule[1]) > -1) if (typeof day != "undefined" && $.inArray(day, rule[0]) > -1 || $.inArray("*", rule[0]) > -1) {
                    if (rule[3] == "*") return disabled = true;
                    var weekday = new Date(year, month - 1, day).getDay();
                    if ($.inArray(weekday, rule[3]) > -1) return disabled = true;
                }
            });
            if (enabled_dates) $.each(enabled_dates, function() {
                if (enabled) return;
                var rule = this;
                if ($.inArray(year, rule[2]) > -1 || $.inArray("*", rule[2]) > -1) {
                    enabled = true;
                    if (typeof month != "undefined") {
                        enabled = true;
                        if ($.inArray(month, rule[1]) > -1 || $.inArray("*", rule[1]) > -1) {
                            if (typeof day != "undefined") {
                                enabled = true;
                                if ($.inArray(day, rule[0]) > -1 || $.inArray("*", rule[0]) > -1) {
                                    if (rule[3] == "*") return enabled = true;
                                    var weekday = new Date(year, month - 1, day).getDay();
                                    if ($.inArray(weekday, rule[3]) > -1) return enabled = true;
                                    enabled = false;
                                } else enabled = false;
                            }
                        } else enabled = false;
                    }
                }
            });
            if (enabled_dates && enabled) return false; else if (disabled_dates && disabled) return true;
            return false;
        };
        var is_integer = function(value) {
            return (value + "").match(/^\-?[0-9]+$/) ? true : false;
        };
        var manage_header = function(caption) {
            $(".dp_caption", header).html(caption);
            if (!(!$.isArray(plugin.settings.direction) && to_int(plugin.settings.direction) === 0) || views.length == 1 && views[0] == "months") {
                var year = selected_year, month = selected_month, next, previous;
                if (view == "days") {
                    previous = !is_disabled(month - 1 < 0 ? str_concat(year - 1, "11") : str_concat(year, str_pad(month - 1, 2)));
                    next = !is_disabled(month + 1 > 11 ? str_concat(year + 1, "00") : str_concat(year, str_pad(month + 1, 2)));
                } else if (view == "months") {
                    if (!start_date || start_date.getFullYear() <= year - 1) previous = true;
                    if (!end_date || end_date.getFullYear() >= year + 1) next = true;
                } else if (view == "years") {
                    if (!start_date || start_date.getFullYear() < year - 7) previous = true;
                    if (!end_date || end_date.getFullYear() > year + 4) next = true;
                }
                if (!previous) {
                    $(".dp_previous", header).addClass("dp_blocked");
                    $(".dp_previous", header).removeClass("dp_hover");
                } else $(".dp_previous", header).removeClass("dp_blocked");
                if (!next) {
                    $(".dp_next", header).addClass("dp_blocked");
                    $(".dp_next", header).removeClass("dp_hover");
                } else $(".dp_next", header).removeClass("dp_blocked");
            }
        };
        var manage_views = function() {
            if (daypicker.text() === "" || view == "days") {
                if (daypicker.text() === "") {
                    if (!plugin.settings.always_visible) datepicker.css("left", -1e3);
                    datepicker.show();
                    generate_daypicker();
                    var width = daypicker.outerWidth(), height = daypicker.outerHeight();
                    monthpicker.css({
                        width: width,
                        height: height
                    });
                    yearpicker.css({
                        width: width,
                        height: height
                    });
                    header.css("width", width);
                    footer.css("width", width);
                    datepicker.hide();
                } else generate_daypicker();
                monthpicker.hide();
                yearpicker.hide();
            } else if (view == "months") {
                generate_monthpicker();
                daypicker.hide();
                yearpicker.hide();
            } else if (view == "years") {
                generate_yearpicker();
                daypicker.hide();
                monthpicker.hide();
            }
            if (plugin.settings.onChange && typeof plugin.settings.onChange == "function" && undefined !== view) {
                var elements = view == "days" ? daypicker.find("td:not(.dp_disabled, .dp_weekend_disabled, .dp_not_in_month, .dp_blocked)") : view == "months" ? monthpicker.find("td:not(.dp_disabled, .dp_weekend_disabled, .dp_not_in_month, .dp_blocked)") : yearpicker.find("td:not(.dp_disabled, .dp_weekend_disabled, .dp_not_in_month, .dp_blocked)");
                elements.each(function() {
                    if (view == "days") {
                        if ($(this).hasClass("dp_not_in_month_selectable")) {
                            var matches = $(this).attr("class").match(/date\_([0-9]{4})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])/);
                            $(this).data("date", matches[1] + "-" + matches[2] + "-" + matches[3]);
                        } else $(this).data("date", selected_year + "-" + str_pad(selected_month + 1, 2) + "-" + str_pad(to_int($(this).text()), 2));
                    } else if (view == "months") {
                        var matches = $(this).attr("class").match(/dp\_month\_([0-9]+)/);
                        $(this).data("date", selected_year + "-" + str_pad(to_int(matches[1]) + 1, 2));
                    } else $(this).data("date", to_int($(this).text()));
                });
                plugin.settings.onChange(view, elements, $element);
            }
            footer.show();
            if (plugin.settings.show_clear_date === true || plugin.settings.show_clear_date === 0 && $element.val() !== "" || plugin.settings.always_visible && plugin.settings.show_clear_date !== false) {
                cleardate.show();
                if (show_select_today) {
                    selecttoday.css("width", "50%");
                    cleardate.css("width", "50%");
                } else {
                    selecttoday.hide();
                    cleardate.css("width", "100%");
                }
            } else {
                cleardate.hide();
                if (show_select_today) selecttoday.show().css("width", "100%"); else footer.hide();
            }
        };
        var select_date = function(year, month, day, view, cell) {
            var default_date = new Date(year, month, day, 12, 0, 0), view_cells = view == "days" ? daypicker_cells : view == "months" ? monthpicker_cells : yearpicker_cells, selected_value = format(default_date);
            $element.val(selected_value);
            if (plugin.settings.always_visible) {
                default_month = default_date.getMonth();
                selected_month = default_date.getMonth();
                default_year = default_date.getFullYear();
                selected_year = default_date.getFullYear();
                default_day = default_date.getDate();
                view_cells.removeClass("dp_selected");
                cell.addClass("dp_selected");
                if (view == "days" && cell.hasClass("dp_not_in_month_selectable")) plugin.show();
            }
            plugin.hide();
            update_dependent(default_date);
            if (plugin.settings.onSelect && typeof plugin.settings.onSelect == "function") plugin.settings.onSelect(selected_value, year + "-" + str_pad(month + 1, 2) + "-" + str_pad(day, 2), default_date, $element);
            $element.focus();
        };
        var str_concat = function() {
            var str = "";
            for (var i = 0; i < arguments.length; i++) str += arguments[i] + "";
            return str;
        };
        var str_pad = function(str, len) {
            str += "";
            while (str.length < len) str = "0" + str;
            return str;
        };
        var to_int = function(str) {
            return parseInt(str, 10);
        };
        var update_dependent = function(date) {
            if (plugin.settings.pair) {
                $.each(plugin.settings.pair, function() {
                    var $pair = $(this);
                    if (!($pair.data && $pair.data("Zebra_DatePicker"))) $pair.data("zdp_reference_date", date); else {
                        var dp = $pair.data("Zebra_DatePicker");
                        dp.update({
                            reference_date: date,
                            direction: dp.settings.direction === 0 ? 1 : dp.settings.direction
                        });
                        if (dp.settings.always_visible) dp.show();
                    }
                });
            }
        };
        var getWeekNumber = function(date) {
            var y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate(), a, b, c, s, e, f, g, n, w;
            if (m < 3) {
                a = y - 1;
                b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
                c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
                s = b - c;
                e = 0;
                f = d - 1 + 31 * (m - 1);
            } else {
                a = y;
                b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
                c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
                s = b - c;
                e = s + 1;
                f = d + ((153 * (m - 3) + 2) / 5 | 0) + 58 + s;
            }
            g = (a + b) % 7;
            d = (f + g - e) % 7;
            n = f + 3 - d;
            if (n < 0) w = 53 - ((g - s) / 5 | 0); else if (n > 364 + s) w = 1; else w = (n / 7 | 0) + 1;
            return w;
        };
        var browser = {
            init: function() {
                this.name = this.searchString(this.dataBrowser) || "";
                this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "";
            },
            searchString: function(data) {
                for (var i = 0; i < data.length; i++) {
                    var dataString = data[i].string;
                    var dataProp = data[i].prop;
                    this.versionSearchString = data[i].versionSearch || data[i].identity;
                    if (dataString) {
                        if (dataString.indexOf(data[i].subString) != -1) return data[i].identity;
                    } else if (dataProp) return data[i].identity;
                }
            },
            searchVersion: function(dataString) {
                var index = dataString.indexOf(this.versionSearchString);
                if (index == -1) return;
                return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
            },
            dataBrowser: [ {
                string: navigator.userAgent,
                subString: "Firefox",
                identity: "firefox"
            }, {
                string: navigator.userAgent,
                subString: "MSIE",
                identity: "explorer",
                versionSearch: "MSIE"
            } ]
        };
        browser.init();
        init();
    };
    $.fn.Zebra_DatePicker = function(options) {
        return this.each(function() {
            if (undefined !== $(this).data("Zebra_DatePicker")) $(this).data("Zebra_DatePicker").destroy();
            var plugin = new $.Zebra_DatePicker(this, options);
            $(this).data("Zebra_DatePicker", plugin);
        });
    };
})(jQuery);