/*! Kontentblocks DevVersion 2014-04-10 */
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