/*! Kontentblocks DevVersion 2016-01-02 */
!function(a) {
    "use strict";
    function b(a, b) {
        a.className += " " + b;
    }
    function c(a, b) {
        for (var c = b.split(" "), d = 0; d < c.length; d += 1) a.className = a.className.replace(" " + c[d], "");
    }
    function d() {
        return "rtl" === a.getComputedStyle(document.body).direction;
    }
    function e() {
        return document.documentElement && document.documentElement.scrollTop || document.body.scrollTop;
    }
    function f() {
        return document.documentElement && document.documentElement.scrollLeft || document.body.scrollLeft;
    }
    function g(a) {
        for (;a.lastChild; ) a.removeChild(a.lastChild);
    }
    function h(a, b) {
        return function() {
            if (arguments.length > 0) {
                for (var c = [], d = 0; d < arguments.length; d += 1) c.push(arguments[d]);
                return c.push(a), b.apply(a, c);
            }
            return b.apply(a, [ null, a ]);
        };
    }
    function i(a, b) {
        return {
            index: a,
            button: b,
            cancel: !1
        };
    }
    function j() {
        function a(a, b) {
            for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
            return a;
        }
        function b(a) {
            var b = d[a].dialog;
            return b && "function" == typeof b.__init && b.__init(b), b;
        }
        function c(b, c, e, f) {
            var g = {
                dialog: null,
                factory: c
            };
            return void 0 !== f && (g.factory = function() {
                return a(new d[f].factory(), new c());
            }), e || (g.dialog = a(new g.factory(), q)), d[b] = g;
        }
        var d = {};
        return {
            defaults: l,
            dialog: function(d, e, f, g) {
                if ("function" != typeof e) return b(d);
                if (this.hasOwnProperty(d)) throw new Error("alertify.dialog: name already exists");
                var h = c(d, e, f, g);
                f ? this[d] = function() {
                    if (0 === arguments.length) return h.dialog;
                    var b = a(new h.factory(), q);
                    return b && "function" == typeof b.__init && b.__init(b), b.main.apply(b, arguments), 
                    b.show.apply(b);
                } : this[d] = function() {
                    if (h.dialog && "function" == typeof h.dialog.__init && h.dialog.__init(h.dialog), 
                    0 === arguments.length) return h.dialog;
                    var a = h.dialog;
                    return a.main.apply(h.dialog, arguments), a.show.apply(h.dialog);
                };
            },
            closeAll: function(a) {
                for (var b = m.slice(0), c = 0; c < b.length; c += 1) {
                    var d = b[c];
                    (void 0 === a || a !== d) && d.close();
                }
            },
            setting: function(a, c, d) {
                if ("notifier" === a) return r.setting(c, d);
                var e = b(a);
                return e ? e.setting(c, d) : void 0;
            },
            set: function(a, b, c) {
                return this.setting(a, b, c);
            },
            get: function(a, b) {
                return this.setting(a, b);
            },
            notify: function(a, b, c, d) {
                return r.create(b, d).push(a, c);
            },
            message: function(a, b, c) {
                return r.create(null, c).push(a, b);
            },
            success: function(a, b, c) {
                return r.create("success", c).push(a, b);
            },
            error: function(a, b, c) {
                return r.create("error", c).push(a, b);
            },
            warning: function(a, b, c) {
                return r.create("warning", c).push(a, b);
            },
            dismissAll: function() {
                r.dismissAll();
            }
        };
    }
    var k = {
        ENTER: 13,
        ESC: 27,
        F1: 112,
        F12: 123,
        LEFT: 37,
        RIGHT: 39
    }, l = {
        modal: !0,
        basic: !1,
        frameless: !1,
        movable: !0,
        resizable: !0,
        closable: !0,
        closableByDimmer: !0,
        maximizable: !0,
        startMaximized: !1,
        pinnable: !0,
        pinned: !0,
        padding: !0,
        overflow: !0,
        maintainFocus: !0,
        transition: "pulse",
        autoReset: !0,
        notifier: {
            delay: 5,
            position: "bottom-right"
        },
        glossary: {
            title: "AlertifyJS",
            ok: "OK",
            cancel: "Cancel",
            acccpt: "Accept",
            deny: "Deny",
            confirm: "Confirm",
            decline: "Decline",
            close: "Close",
            maximize: "Maximize",
            restore: "Restore"
        },
        theme: {
            input: "ajs-input",
            ok: "ajs-ok",
            cancel: "ajs-cancel"
        }
    }, m = [], n = function() {
        return document.addEventListener ? function(a, b, c, d) {
            a.addEventListener(b, c, d === !0);
        } : document.attachEvent ? function(a, b, c) {
            a.attachEvent("on" + b, c);
        } : void 0;
    }(), o = function() {
        return document.removeEventListener ? function(a, b, c, d) {
            a.removeEventListener(b, c, d === !0);
        } : document.detachEvent ? function(a, b, c) {
            a.detachEvent("on" + b, c);
        } : void 0;
    }(), p = function() {
        var a, b, c = !1, d = {
            animation: "animationend",
            OAnimation: "oAnimationEnd oanimationend",
            msAnimation: "MSAnimationEnd",
            MozAnimation: "animationend",
            WebkitAnimation: "webkitAnimationEnd"
        };
        for (a in d) if (void 0 !== document.documentElement.style[a]) {
            b = d[a], c = !0;
            break;
        }
        return {
            type: b,
            supported: c
        };
    }(), q = function() {
        function j(a) {
            if (!a.__internal) {
                delete a.__init, null === ua && document.body.setAttribute("tabindex", "0");
                var c;
                "function" == typeof a.setup ? (c = a.setup(), c.options = c.options || {}, c.focus = c.focus || {}) : c = {
                    buttons: [],
                    focus: {
                        element: null,
                        select: !1
                    },
                    options: {}
                }, "object" != typeof a.hooks && (a.hooks = {});
                var d = [];
                if (Array.isArray(c.buttons)) for (var e = 0; e < c.buttons.length; e += 1) {
                    var f = c.buttons[e], g = {};
                    for (var i in f) f.hasOwnProperty(i) && (g[i] = f[i]);
                    d.push(g);
                }
                var j = a.__internal = {
                    isOpen: !1,
                    activeElement: document.body,
                    timerIn: void 0,
                    timerOut: void 0,
                    buttons: d,
                    focus: c.focus,
                    options: {
                        title: void 0,
                        modal: void 0,
                        basic: void 0,
                        frameless: void 0,
                        pinned: void 0,
                        movable: void 0,
                        resizable: void 0,
                        autoReset: void 0,
                        closable: void 0,
                        closableByDimmer: void 0,
                        maximizable: void 0,
                        startMaximized: void 0,
                        pinnable: void 0,
                        transition: void 0,
                        padding: void 0,
                        overflow: void 0,
                        onshow: void 0,
                        onclose: void 0,
                        onfocus: void 0
                    },
                    resetHandler: void 0,
                    beginMoveHandler: void 0,
                    beginResizeHandler: void 0,
                    bringToFrontHandler: void 0,
                    modalClickHandler: void 0,
                    buttonsClickHandler: void 0,
                    commandsClickHandler: void 0,
                    transitionInHandler: void 0,
                    transitionOutHandler: void 0
                }, k = {};
                k.root = document.createElement("div"), k.root.className = xa.base + " " + xa.hidden + " ", 
                k.root.innerHTML = wa.dimmer + wa.modal, k.dimmer = k.root.firstChild, k.modal = k.root.lastChild, 
                k.modal.innerHTML = wa.dialog, k.dialog = k.modal.firstChild, k.dialog.innerHTML = wa.reset + wa.commands + wa.header + wa.body + wa.footer + wa.resizeHandle + wa.reset, 
                k.reset = [], k.reset.push(k.dialog.firstChild), k.reset.push(k.dialog.lastChild), 
                k.commands = {}, k.commands.container = k.reset[0].nextSibling, k.commands.pin = k.commands.container.firstChild, 
                k.commands.maximize = k.commands.pin.nextSibling, k.commands.close = k.commands.maximize.nextSibling, 
                k.header = k.commands.container.nextSibling, k.body = k.header.nextSibling, k.body.innerHTML = wa.content, 
                k.content = k.body.firstChild, k.footer = k.body.nextSibling, k.footer.innerHTML = wa.buttons.auxiliary + wa.buttons.primary, 
                k.resizeHandle = k.footer.nextSibling, k.buttons = {}, k.buttons.auxiliary = k.footer.firstChild, 
                k.buttons.primary = k.buttons.auxiliary.nextSibling, k.buttons.primary.innerHTML = wa.button, 
                k.buttonTemplate = k.buttons.primary.firstChild, k.buttons.primary.removeChild(k.buttonTemplate);
                for (var l = 0; l < a.__internal.buttons.length; l += 1) {
                    var m = a.__internal.buttons[l];
                    ta.indexOf(m.key) < 0 && ta.push(m.key), m.element = k.buttonTemplate.cloneNode(), 
                    m.element.innerHTML = m.text, "string" == typeof m.className && "" !== m.className && b(m.element, m.className);
                    for (var n in m.attrs) "className" !== n && m.attrs.hasOwnProperty(n) && m.element.setAttribute(n, m.attrs[n]);
                    "auxiliary" === m.scope ? k.buttons.auxiliary.appendChild(m.element) : k.buttons.primary.appendChild(m.element);
                }
                a.elements = k, j.resetHandler = h(a, T), j.beginMoveHandler = h(a, X), j.beginResizeHandler = h(a, ba), 
                j.bringToFrontHandler = h(a, x), j.modalClickHandler = h(a, N), j.buttonsClickHandler = h(a, P), 
                j.commandsClickHandler = h(a, B), j.transitionInHandler = h(a, U), j.transitionOutHandler = h(a, V), 
                a.set("title", void 0 === c.options.title ? s.defaults.glossary.title : c.options.title), 
                a.set("modal", void 0 === c.options.modal ? s.defaults.modal : c.options.modal), 
                a.set("basic", void 0 === c.options.basic ? s.defaults.basic : c.options.basic), 
                a.set("frameless", void 0 === c.options.frameless ? s.defaults.frameless : c.options.frameless), 
                a.set("movable", void 0 === c.options.movable ? s.defaults.movable : c.options.movable), 
                a.set("resizable", void 0 === c.options.resizable ? s.defaults.resizable : c.options.resizable), 
                a.set("autoReset", void 0 === c.options.autoReset ? s.defaults.autoReset : c.options.autoReset), 
                a.set("closable", void 0 === c.options.closable ? s.defaults.closable : c.options.closable), 
                a.set("closableByDimmer", void 0 === c.options.closableByDimmer ? s.defaults.closableByDimmer : c.options.closableByDimmer), 
                a.set("maximizable", void 0 === c.options.maximizable ? s.defaults.maximizable : c.options.maximizable), 
                a.set("startMaximized", void 0 === c.options.startMaximized ? s.defaults.startMaximized : c.options.startMaximized), 
                a.set("pinnable", void 0 === c.options.pinnable ? s.defaults.pinnable : c.options.pinnable), 
                a.set("pinned", void 0 === c.options.pinned ? s.defaults.pinned : c.options.pinned), 
                a.set("transition", void 0 === c.options.transition ? s.defaults.transition : c.options.transition), 
                a.set("padding", void 0 === c.options.padding ? s.defaults.padding : c.options.padding), 
                a.set("overflow", void 0 === c.options.overflow ? s.defaults.overflow : c.options.overflow), 
                "function" == typeof a.build && a.build();
            }
            document.body.appendChild(a.elements.root);
        }
        function l() {
            ra = a.scrollX, sa = a.scrollY;
        }
        function q() {
            a.scrollTo(ra, sa);
        }
        function r() {
            for (var a = 0, d = 0; d < m.length; d += 1) {
                var e = m[d];
                (e.isModal() || e.isMaximized()) && (a += 1);
            }
            0 === a ? c(document.body, xa.noOverflow) : a > 0 && document.body.className.indexOf(xa.noOverflow) < 0 && b(document.body, xa.noOverflow);
        }
        function t(a, d, e) {
            "string" == typeof e && c(a.elements.root, xa.prefix + e), b(a.elements.root, xa.prefix + d), 
            ua = a.elements.root.offsetWidth;
        }
        function u(a) {
            a.get("modal") ? (c(a.elements.root, xa.modeless), a.isOpen() && (ka(a), J(a), r())) : (b(a.elements.root, xa.modeless), 
            a.isOpen() && (ja(a), J(a), r()));
        }
        function v(a) {
            a.get("basic") ? b(a.elements.root, xa.basic) : c(a.elements.root, xa.basic);
        }
        function w(a) {
            a.get("frameless") ? b(a.elements.root, xa.frameless) : c(a.elements.root, xa.frameless);
        }
        function x(a, b) {
            for (var c = m.indexOf(b), d = c + 1; d < m.length; d += 1) if (m[d].isModal()) return;
            return document.body.lastChild !== b.elements.root && (document.body.appendChild(b.elements.root), 
            m.splice(m.indexOf(b), 1), m.push(b), S(b)), !1;
        }
        function y(a, d, e, f) {
            switch (d) {
              case "title":
                a.setHeader(f);
                break;

              case "modal":
                u(a);
                break;

              case "basic":
                v(a);
                break;

              case "frameless":
                w(a);
                break;

              case "pinned":
                K(a);
                break;

              case "closable":
                M(a);
                break;

              case "maximizable":
                L(a);
                break;

              case "pinnable":
                G(a);
                break;

              case "movable":
                _(a);
                break;

              case "resizable":
                fa(a);
                break;

              case "transition":
                t(a, f, e);
                break;

              case "padding":
                f ? c(a.elements.root, xa.noPadding) : a.elements.root.className.indexOf(xa.noPadding) < 0 && b(a.elements.root, xa.noPadding);
                break;

              case "overflow":
                f ? c(a.elements.root, xa.noOverflow) : a.elements.root.className.indexOf(xa.noOverflow) < 0 && b(a.elements.root, xa.noOverflow);
                break;

              case "transition":
                t(a, f, e);
            }
            "function" == typeof a.hooks.onupdate && a.hooks.onupdate.call(a, d, e, f);
        }
        function z(a, b, c, d, e) {
            var f = {
                op: void 0,
                items: []
            };
            if ("undefined" == typeof e && "string" == typeof d) f.op = "get", b.hasOwnProperty(d) ? (f.found = !0, 
            f.value = b[d]) : (f.found = !1, f.value = void 0); else {
                var g;
                if (f.op = "set", "object" == typeof d) {
                    var h = d;
                    for (var i in h) b.hasOwnProperty(i) ? (b[i] !== h[i] && (g = b[i], b[i] = h[i], 
                    c.call(a, i, g, h[i])), f.items.push({
                        key: i,
                        value: h[i],
                        found: !0
                    })) : f.items.push({
                        key: i,
                        value: h[i],
                        found: !1
                    });
                } else {
                    if ("string" != typeof d) throw new Error("args must be a string or object");
                    b.hasOwnProperty(d) ? (b[d] !== e && (g = b[d], b[d] = e, c.call(a, d, g, e)), f.items.push({
                        key: d,
                        value: e,
                        found: !0
                    })) : f.items.push({
                        key: d,
                        value: e,
                        found: !1
                    });
                }
            }
            return f;
        }
        function A(a) {
            var b;
            O(a, function(a) {
                return b = a.invokeOnClose === !0;
            }), !b && a.isOpen() && a.close();
        }
        function B(a, b) {
            var c = a.srcElement || a.target;
            switch (c) {
              case b.elements.commands.pin:
                b.isPinned() ? D(b) : C(b);
                break;

              case b.elements.commands.maximize:
                b.isMaximized() ? F(b) : E(b);
                break;

              case b.elements.commands.close:
                A(b);
            }
            return !1;
        }
        function C(a) {
            a.set("pinned", !0);
        }
        function D(a) {
            a.set("pinned", !1);
        }
        function E(a) {
            b(a.elements.root, xa.maximized), a.isOpen() && r();
        }
        function F(a) {
            c(a.elements.root, xa.maximized), a.isOpen() && r();
        }
        function G(a) {
            a.get("pinnable") ? b(a.elements.root, xa.pinnable) : c(a.elements.root, xa.pinnable);
        }
        function H(a) {
            var b = f();
            a.elements.modal.style.marginTop = e() + "px", a.elements.modal.style.marginLeft = b + "px", 
            a.elements.modal.style.marginRight = -b + "px";
        }
        function I(a) {
            var b = parseInt(a.elements.modal.style.marginTop, 10), c = parseInt(a.elements.modal.style.marginLeft, 10);
            if (a.elements.modal.style.marginTop = "", a.elements.modal.style.marginLeft = "", 
            a.elements.modal.style.marginRight = "", a.isOpen()) {
                var d = 0, g = 0;
                "" !== a.elements.dialog.style.top && (d = parseInt(a.elements.dialog.style.top, 10)), 
                a.elements.dialog.style.top = d + (b - e()) + "px", "" !== a.elements.dialog.style.left && (g = parseInt(a.elements.dialog.style.left, 10)), 
                a.elements.dialog.style.left = g + (c - f()) + "px";
            }
        }
        function J(a) {
            a.get("modal") || a.get("pinned") ? I(a) : H(a);
        }
        function K(a) {
            a.get("pinned") ? (c(a.elements.root, xa.unpinned), a.isOpen() && I(a)) : (b(a.elements.root, xa.unpinned), 
            a.isOpen() && !a.isModal() && H(a));
        }
        function L(a) {
            a.get("maximizable") ? b(a.elements.root, xa.maximizable) : c(a.elements.root, xa.maximizable);
        }
        function M(a) {
            a.get("closable") ? (b(a.elements.root, xa.closable), pa(a)) : (c(a.elements.root, xa.closable), 
            qa(a));
        }
        function N(a, b) {
            var c = a.srcElement || a.target;
            return ya || c !== b.elements.modal || b.get("closableByDimmer") !== !0 || A(b), 
            ya = !1, !1;
        }
        function O(a, b) {
            for (var c = 0; c < a.__internal.buttons.length; c += 1) {
                var d = a.__internal.buttons[c];
                if (!d.element.disabled && b(d)) {
                    var e = i(c, d);
                    "function" == typeof a.callback && a.callback.apply(a, [ e ]), e.cancel === !1 && a.close();
                    break;
                }
            }
        }
        function P(a, b) {
            var c = a.srcElement || a.target;
            O(b, function(a) {
                return a.element === c && (za = !0);
            });
        }
        function Q(a) {
            if (za) return void (za = !1);
            var b = m[m.length - 1], c = a.keyCode;
            return 0 === b.__internal.buttons.length && c === k.ESC && b.get("closable") === !0 ? (A(b), 
            !1) : ta.indexOf(c) > -1 ? (O(b, function(a) {
                return a.key === c;
            }), !1) : void 0;
        }
        function R(a) {
            var b = m[m.length - 1], c = a.keyCode;
            if (c === k.LEFT || c === k.RIGHT) {
                for (var d = b.__internal.buttons, e = 0; e < d.length; e += 1) if (document.activeElement === d[e].element) switch (c) {
                  case k.LEFT:
                    return void d[(e || d.length) - 1].element.focus();

                  case k.RIGHT:
                    return void d[(e + 1) % d.length].element.focus();
                }
            } else if (c < k.F12 + 1 && c > k.F1 - 1 && ta.indexOf(c) > -1) return a.preventDefault(), 
            a.stopPropagation(), O(b, function(a) {
                return a.key === c;
            }), !1;
        }
        function S(a, b) {
            if (b) b.focus(); else {
                var c = a.__internal.focus, d = c.element;
                switch (typeof c.element) {
                  case "number":
                    a.__internal.buttons.length > c.element && (d = a.get("basic") === !0 ? a.elements.reset[0] : a.__internal.buttons[c.element].element);
                    break;

                  case "string":
                    d = a.elements.body.querySelector(c.element);
                    break;

                  case "function":
                    d = c.element.call(a);
                }
                "undefined" != typeof d && null !== d || 0 !== a.__internal.buttons.length || (d = a.elements.reset[0]), 
                d && d.focus && (d.focus(), c.select && d.select && d.select());
            }
        }
        function T(a, b) {
            if (!b) for (var c = m.length - 1; c > -1; c -= 1) if (m[c].isModal()) {
                b = m[c];
                break;
            }
            if (b && b.isModal()) {
                var d, e = a.srcElement || a.target, f = e === b.elements.reset[1] || 0 === b.__internal.buttons.length && e === document.body;
                f && (b.get("maximizable") ? d = b.elements.commands.maximize : b.get("closable") && (d = b.elements.commands.close)), 
                void 0 === d && ("number" == typeof b.__internal.focus.element ? e === b.elements.reset[0] ? d = b.elements.buttons.auxiliary.firstChild || b.elements.buttons.primary.firstChild : f && (d = b.elements.reset[0]) : e === b.elements.reset[0] && (d = b.elements.buttons.primary.lastChild || b.elements.buttons.auxiliary.lastChild)), 
                S(b, d);
            }
        }
        function U(a, b) {
            clearTimeout(b.__internal.timerIn), S(b), q(), za = !1, "function" == typeof b.get("onfocus") && b.get("onfocus").call(b), 
            o(b.elements.dialog, p.type, b.__internal.transitionInHandler), c(b.elements.root, xa.animationIn);
        }
        function V(a, b) {
            clearTimeout(b.__internal.timerOut), o(b.elements.dialog, p.type, b.__internal.transitionOutHandler), 
            $(b), ea(b), b.isMaximized() && !b.get("startMaximized") && F(b), s.defaults.maintainFocus && b.__internal.activeElement && (b.__internal.activeElement.focus(), 
            b.__internal.activeElement = null);
        }
        function W(a, b) {
            b.style.left = a[Da] - Ba + "px", b.style.top = a[Ea] - Ca + "px";
        }
        function X(a, c) {
            if (null === Fa && !c.isMaximized() && c.get("movable")) {
                var d;
                if ("touchstart" === a.type ? (a.preventDefault(), d = a.targetTouches[0], Da = "clientX", 
                Ea = "clientY") : 0 === a.button && (d = a), d) {
                    Aa = c, Ba = d[Da], Ca = d[Ea];
                    var e = c.elements.dialog;
                    return b(e, xa.capture), e.style.left && (Ba -= parseInt(e.style.left, 10)), e.style.top && (Ca -= parseInt(e.style.top, 10)), 
                    W(d, e), b(document.body, xa.noSelection), !1;
                }
            }
        }
        function Y(a) {
            if (Aa) {
                var b;
                "touchmove" === a.type ? (a.preventDefault(), b = a.targetTouches[0]) : 0 === a.button && (b = a), 
                b && W(b, Aa.elements.dialog);
            }
        }
        function Z() {
            if (Aa) {
                var a = Aa.elements.dialog;
                Aa = null, c(document.body, xa.noSelection), c(a, xa.capture);
            }
        }
        function $(a) {
            Aa = null;
            var b = a.elements.dialog;
            b.style.left = b.style.top = "";
        }
        function _(a) {
            a.get("movable") ? (b(a.elements.root, xa.movable), a.isOpen() && la(a)) : ($(a), 
            c(a.elements.root, xa.movable), a.isOpen() && ma(a));
        }
        function aa(a, b, c) {
            var e = b, f = 0, g = 0;
            do f += e.offsetLeft, g += e.offsetTop; while (e = e.offsetParent);
            var h, i;
            c === !0 ? (h = a.pageX, i = a.pageY) : (h = a.clientX, i = a.clientY);
            var j = d();
            if (j && (h = document.body.offsetWidth - h, isNaN(Ga) || (f = document.body.offsetWidth - f - b.offsetWidth)), 
            b.style.height = i - g + Ja + "px", b.style.width = h - f + Ja + "px", !isNaN(Ga)) {
                var k = .5 * Math.abs(b.offsetWidth - Ha);
                j && (k *= -1), b.offsetWidth > Ha ? b.style.left = Ga + k + "px" : b.offsetWidth >= Ia && (b.style.left = Ga - k + "px");
            }
        }
        function ba(a, c) {
            if (!c.isMaximized()) {
                var d;
                if ("touchstart" === a.type ? (a.preventDefault(), d = a.targetTouches[0]) : 0 === a.button && (d = a), 
                d) {
                    Fa = c, Ja = c.elements.resizeHandle.offsetHeight / 2;
                    var e = c.elements.dialog;
                    return b(e, xa.capture), Ga = parseInt(e.style.left, 10), e.style.height = e.offsetHeight + "px", 
                    e.style.minHeight = c.elements.header.offsetHeight + c.elements.footer.offsetHeight + "px", 
                    e.style.width = (Ha = e.offsetWidth) + "px", "none" !== e.style.maxWidth && (e.style.minWidth = (Ia = e.offsetWidth) + "px"), 
                    e.style.maxWidth = "none", b(document.body, xa.noSelection), !1;
                }
            }
        }
        function ca(a) {
            if (Fa) {
                var b;
                "touchmove" === a.type ? (a.preventDefault(), b = a.targetTouches[0]) : 0 === a.button && (b = a), 
                b && aa(b, Fa.elements.dialog, !Fa.get("modal") && !Fa.get("pinned"));
            }
        }
        function da() {
            if (Fa) {
                var a = Fa.elements.dialog;
                Fa = null, c(document.body, xa.noSelection), c(a, xa.capture), ya = !0;
            }
        }
        function ea(a) {
            Fa = null;
            var b = a.elements.dialog;
            "none" === b.style.maxWidth && (b.style.maxWidth = b.style.minWidth = b.style.width = b.style.height = b.style.minHeight = b.style.left = "", 
            Ga = Number.Nan, Ha = Ia = Ja = 0);
        }
        function fa(a) {
            a.get("resizable") ? (b(a.elements.root, xa.resizable), a.isOpen() && na(a)) : (ea(a), 
            c(a.elements.root, xa.resizable), a.isOpen() && oa(a));
        }
        function ga() {
            for (var a = 0; a < m.length; a += 1) {
                var b = m[a];
                b.get("autoReset") && ($(b), ea(b));
            }
        }
        function ha(b) {
            1 === m.length && (n(a, "resize", ga), n(document.body, "keyup", Q), n(document.body, "keydown", R), 
            n(document.body, "focus", T), n(document.documentElement, "mousemove", Y), n(document.documentElement, "touchmove", Y), 
            n(document.documentElement, "mouseup", Z), n(document.documentElement, "touchend", Z), 
            n(document.documentElement, "mousemove", ca), n(document.documentElement, "touchmove", ca), 
            n(document.documentElement, "mouseup", da), n(document.documentElement, "touchend", da)), 
            n(b.elements.commands.container, "click", b.__internal.commandsClickHandler), n(b.elements.footer, "click", b.__internal.buttonsClickHandler), 
            n(b.elements.reset[0], "focus", b.__internal.resetHandler), n(b.elements.reset[1], "focus", b.__internal.resetHandler), 
            za = !0, n(b.elements.dialog, p.type, b.__internal.transitionInHandler), b.get("modal") || ja(b), 
            b.get("resizable") && na(b), b.get("movable") && la(b);
        }
        function ia(b) {
            1 === m.length && (o(a, "resize", ga), o(document.body, "keyup", Q), o(document.body, "keydown", R), 
            o(document.body, "focus", T), o(document.documentElement, "mousemove", Y), o(document.documentElement, "mouseup", Z), 
            o(document.documentElement, "mousemove", ca), o(document.documentElement, "mouseup", da)), 
            o(b.elements.commands.container, "click", b.__internal.commandsClickHandler), o(b.elements.footer, "click", b.__internal.buttonsClickHandler), 
            o(b.elements.reset[0], "focus", b.__internal.resetHandler), o(b.elements.reset[1], "focus", b.__internal.resetHandler), 
            n(b.elements.dialog, p.type, b.__internal.transitionOutHandler), b.get("modal") || ka(b), 
            b.get("movable") && ma(b), b.get("resizable") && oa(b);
        }
        function ja(a) {
            n(a.elements.dialog, "focus", a.__internal.bringToFrontHandler, !0);
        }
        function ka(a) {
            o(a.elements.dialog, "focus", a.__internal.bringToFrontHandler, !0);
        }
        function la(a) {
            n(a.elements.header, "mousedown", a.__internal.beginMoveHandler), n(a.elements.header, "touchstart", a.__internal.beginMoveHandler);
        }
        function ma(a) {
            o(a.elements.header, "mousedown", a.__internal.beginMoveHandler), o(a.elements.header, "touchstart", a.__internal.beginMoveHandler);
        }
        function na(a) {
            n(a.elements.resizeHandle, "mousedown", a.__internal.beginResizeHandler), n(a.elements.resizeHandle, "touchstart", a.__internal.beginResizeHandler);
        }
        function oa(a) {
            o(a.elements.resizeHandle, "mousedown", a.__internal.beginResizeHandler), o(a.elements.resizeHandle, "touchstart", a.__internal.beginResizeHandler);
        }
        function pa(a) {
            n(a.elements.modal, "click", a.__internal.modalClickHandler);
        }
        function qa(a) {
            o(a.elements.modal, "click", a.__internal.modalClickHandler);
        }
        var ra, sa, ta = [], ua = null, va = a.navigator.userAgent.indexOf("Safari") > -1 && a.navigator.userAgent.indexOf("Chrome") < 0, wa = {
            dimmer: '<div class="ajs-dimmer"></div>',
            modal: '<div class="ajs-modal" tabindex="0"></div>',
            dialog: '<div class="ajs-dialog" tabindex="0"></div>',
            reset: '<button class="ajs-reset"></button>',
            commands: '<div class="ajs-commands"><button class="ajs-pin"></button><button class="ajs-maximize"></button><button class="ajs-close"></button></div>',
            header: '<div class="ajs-header"></div>',
            body: '<div class="ajs-body"></div>',
            content: '<div class="ajs-content"></div>',
            footer: '<div class="ajs-footer"></div>',
            buttons: {
                primary: '<div class="ajs-primary ajs-buttons"></div>',
                auxiliary: '<div class="ajs-auxiliary ajs-buttons"></div>'
            },
            button: '<button class="ajs-button"></button>',
            resizeHandle: '<div class="ajs-handle"></div>'
        }, xa = {
            base: "alertify",
            prefix: "ajs-",
            hidden: "ajs-hidden",
            noSelection: "ajs-no-selection",
            noOverflow: "ajs-no-overflow",
            noPadding: "ajs-no-padding",
            modeless: "ajs-modeless",
            movable: "ajs-movable",
            resizable: "ajs-resizable",
            capture: "ajs-capture",
            fixed: "ajs-fixed",
            closable: "ajs-closable",
            maximizable: "ajs-maximizable",
            maximize: "ajs-maximize",
            restore: "ajs-restore",
            pinnable: "ajs-pinnable",
            unpinned: "ajs-unpinned",
            pin: "ajs-pin",
            maximized: "ajs-maximized",
            animationIn: "ajs-in",
            animationOut: "ajs-out",
            shake: "ajs-shake",
            basic: "ajs-basic",
            frameless: "ajs-frameless"
        }, ya = !1, za = !1, Aa = null, Ba = 0, Ca = 0, Da = "pageX", Ea = "pageY", Fa = null, Ga = Number.Nan, Ha = 0, Ia = 0, Ja = 0;
        return {
            __init: j,
            isOpen: function() {
                return this.__internal.isOpen;
            },
            isModal: function() {
                return this.elements.root.className.indexOf(xa.modeless) < 0;
            },
            isMaximized: function() {
                return this.elements.root.className.indexOf(xa.maximized) > -1;
            },
            isPinned: function() {
                return this.elements.root.className.indexOf(xa.unpinned) < 0;
            },
            maximize: function() {
                return this.isMaximized() || E(this), this;
            },
            restore: function() {
                return this.isMaximized() && F(this), this;
            },
            pin: function() {
                return this.isPinned() || C(this), this;
            },
            unpin: function() {
                return this.isPinned() && D(this), this;
            },
            moveTo: function(a, b) {
                if (!isNaN(a) && !isNaN(b)) {
                    var c = this.elements.dialog, e = c, f = 0, g = 0;
                    c.style.left && (f -= parseInt(c.style.left, 10)), c.style.top && (g -= parseInt(c.style.top, 10));
                    do f += e.offsetLeft, g += e.offsetTop; while (e = e.offsetParent);
                    var h = a - f, i = b - g;
                    d() && (h *= -1), c.style.left = h + "px", c.style.top = i + "px";
                }
                return this;
            },
            resizeTo: function(a, b) {
                var c = parseFloat(a), d = parseFloat(b), e = /(\d*\.\d+|\d+)%/;
                if (!isNaN(c) && !isNaN(d) && this.get("resizable") === !0) {
                    ("" + a).match(e) && (c = c / 100 * document.documentElement.clientWidth), ("" + b).match(e) && (d = d / 100 * document.documentElement.clientHeight);
                    var f = this.elements.dialog;
                    "none" !== f.style.maxWidth && (f.style.minWidth = (Ia = f.offsetWidth) + "px"), 
                    f.style.maxWidth = "none", f.style.minHeight = this.elements.header.offsetHeight + this.elements.footer.offsetHeight + "px", 
                    f.style.width = c + "px", f.style.height = d + "px";
                }
                return this;
            },
            setting: function(a, b) {
                var c = this, d = z(this, this.__internal.options, function(a, b, d) {
                    y(c, a, b, d);
                }, a, b);
                if ("get" === d.op) return d.found ? d.value : "undefined" != typeof this.settings ? z(this, this.settings, this.settingUpdated || function() {}, a, b).value : void 0;
                if ("set" === d.op) {
                    if (d.items.length > 0) for (var e = this.settingUpdated || function() {}, f = 0; f < d.items.length; f += 1) {
                        var g = d.items[f];
                        g.found || "undefined" == typeof this.settings || z(this, this.settings, e, g.key, g.value);
                    }
                    return this;
                }
            },
            set: function(a, b) {
                return this.setting(a, b), this;
            },
            get: function(a) {
                return this.setting(a);
            },
            setHeader: function(b) {
                return "string" == typeof b ? (g(this.elements.header), this.elements.header.innerHTML = b) : b instanceof a.HTMLElement && this.elements.header.firstChild !== b && (g(this.elements.header), 
                this.elements.header.appendChild(b)), this;
            },
            setContent: function(b) {
                return "string" == typeof b ? (g(this.elements.content), this.elements.content.innerHTML = b) : b instanceof a.HTMLElement && this.elements.content.firstChild !== b && (g(this.elements.content), 
                this.elements.content.appendChild(b)), this;
            },
            showModal: function(a) {
                return this.show(!0, a);
            },
            show: function(a, d) {
                if (j(this), this.__internal.isOpen) {
                    $(this), ea(this), b(this.elements.dialog, xa.shake);
                    var e = this;
                    setTimeout(function() {
                        c(e.elements.dialog, xa.shake);
                    }, 200);
                } else {
                    if (this.__internal.isOpen = !0, m.push(this), s.defaults.maintainFocus && (this.__internal.activeElement = document.activeElement), 
                    "function" == typeof this.prepare && this.prepare(), ha(this), void 0 !== a && this.set("modal", a), 
                    l(), r(), "string" == typeof d && "" !== d && (this.__internal.className = d, b(this.elements.root, d)), 
                    this.get("startMaximized") ? this.maximize() : this.isMaximized() && F(this), J(this), 
                    c(this.elements.root, xa.animationOut), b(this.elements.root, xa.animationIn), clearTimeout(this.__internal.timerIn), 
                    this.__internal.timerIn = setTimeout(this.__internal.transitionInHandler, p.supported ? 1e3 : 100), 
                    va) {
                        var f = this.elements.root;
                        f.style.display = "none", setTimeout(function() {
                            f.style.display = "block";
                        }, 0);
                    }
                    ua = this.elements.root.offsetWidth, c(this.elements.root, xa.hidden), "function" == typeof this.hooks.onshow && this.hooks.onshow.call(this), 
                    "function" == typeof this.get("onshow") && this.get("onshow").call(this);
                }
                return this;
            },
            close: function() {
                return this.__internal.isOpen && (ia(this), c(this.elements.root, xa.animationIn), 
                b(this.elements.root, xa.animationOut), clearTimeout(this.__internal.timerOut), 
                this.__internal.timerOut = setTimeout(this.__internal.transitionOutHandler, p.supported ? 1e3 : 100), 
                b(this.elements.root, xa.hidden), ua = this.elements.modal.offsetWidth, "undefined" != typeof this.__internal.className && "" !== this.__internal.className && c(this.elements.root, this.__internal.className), 
                "function" == typeof this.hooks.onclose && this.hooks.onclose.call(this), "function" == typeof this.get("onclose") && this.get("onclose").call(this), 
                m.splice(m.indexOf(this), 1), this.__internal.isOpen = !1, r()), this;
            },
            closeOthers: function() {
                return s.closeAll(this), this;
            }
        };
    }(), r = function() {
        function d(a) {
            a.__internal || (a.__internal = {
                position: s.defaults.notifier.position,
                delay: s.defaults.notifier.delay
            }, l = document.createElement("DIV"), i(a)), l.parentNode !== document.body && document.body.appendChild(l);
        }
        function e(a) {
            a.__internal.pushed = !0, m.push(a);
        }
        function f(a) {
            m.splice(m.indexOf(a), 1), a.__internal.pushed = !1;
        }
        function i(a) {
            switch (l.className = q.base, a.__internal.position) {
              case "top-right":
                b(l, q.top + " " + q.right);
                break;

              case "top-left":
                b(l, q.top + " " + q.left);
                break;

              case "bottom-left":
                b(l, q.bottom + " " + q.left);
                break;

              default:
              case "bottom-right":
                b(l, q.bottom + " " + q.right);
            }
        }
        function j(d, i) {
            function j(a, b) {
                b.dismiss(!0);
            }
            function m(a, b) {
                o(b.element, p.type, m), l.removeChild(b.element);
            }
            function s(a) {
                return a.__internal || (a.__internal = {
                    pushed: !1,
                    delay: void 0,
                    timer: void 0,
                    clickHandler: void 0,
                    transitionEndHandler: void 0,
                    transitionTimeout: void 0
                }, a.__internal.clickHandler = h(a, j), a.__internal.transitionEndHandler = h(a, m)), 
                a;
            }
            function t(a) {
                clearTimeout(a.__internal.timer), clearTimeout(a.__internal.transitionTimeout);
            }
            return s({
                element: d,
                push: function(a, c) {
                    if (!this.__internal.pushed) {
                        e(this), t(this);
                        var d, f;
                        switch (arguments.length) {
                          case 0:
                            f = this.__internal.delay;
                            break;

                          case 1:
                            "number" == typeof a ? f = a : (d = a, f = this.__internal.delay);
                            break;

                          case 2:
                            d = a, f = c;
                        }
                        return "undefined" != typeof d && this.setContent(d), r.__internal.position.indexOf("top") < 0 ? l.appendChild(this.element) : l.insertBefore(this.element, l.firstChild), 
                        k = this.element.offsetWidth, b(this.element, q.visible), n(this.element, "click", this.__internal.clickHandler), 
                        this.delay(f);
                    }
                    return this;
                },
                ondismiss: function() {},
                callback: i,
                dismiss: function(a) {
                    return this.__internal.pushed && (t(this), ("function" != typeof this.ondismiss || this.ondismiss.call(this) !== !1) && (o(this.element, "click", this.__internal.clickHandler), 
                    "undefined" != typeof this.element && this.element.parentNode === l && (this.__internal.transitionTimeout = setTimeout(this.__internal.transitionEndHandler, p.supported ? 1e3 : 100), 
                    c(this.element, q.visible), "function" == typeof this.callback && this.callback.call(this, a)), 
                    f(this))), this;
                },
                delay: function(a) {
                    if (t(this), this.__internal.delay = "undefined" == typeof a || isNaN(+a) ? r.__internal.delay : +a, 
                    this.__internal.delay > 0) {
                        var b = this;
                        this.__internal.timer = setTimeout(function() {
                            b.dismiss();
                        }, 1e3 * this.__internal.delay);
                    }
                    return this;
                },
                setContent: function(b) {
                    return "string" == typeof b ? (g(this.element), this.element.innerHTML = b) : b instanceof a.HTMLElement && this.element.firstChild !== b && (g(this.element), 
                    this.element.appendChild(b)), this;
                },
                dismissOthers: function() {
                    return r.dismissAll(this), this;
                }
            });
        }
        var k, l, m = [], q = {
            base: "alertify-notifier",
            message: "ajs-message",
            top: "ajs-top",
            right: "ajs-right",
            bottom: "ajs-bottom",
            left: "ajs-left",
            visible: "ajs-visible",
            hidden: "ajs-hidden"
        };
        return {
            setting: function(a, b) {
                if (d(this), "undefined" == typeof b) return this.__internal[a];
                switch (a) {
                  case "position":
                    this.__internal.position = b, i(this);
                    break;

                  case "delay":
                    this.__internal.delay = b;
                }
                return this;
            },
            set: function(a, b) {
                return this.setting(a, b), this;
            },
            get: function(a) {
                return this.setting(a);
            },
            create: function(a, b) {
                d(this);
                var c = document.createElement("div");
                return c.className = q.message + ("string" == typeof a && "" !== a ? " ajs-" + a : ""), 
                j(c, b);
            },
            dismissAll: function(a) {
                for (var b = m.slice(0), c = 0; c < b.length; c += 1) {
                    var d = b[c];
                    (void 0 === a || a !== d) && d.dismiss();
                }
            }
        };
    }(), s = new j();
    s.dialog("alert", function() {
        return {
            main: function(a, b, c) {
                var d, e, f;
                switch (arguments.length) {
                  case 1:
                    e = a;
                    break;

                  case 2:
                    "function" == typeof b ? (e = a, f = b) : (d = a, e = b);
                    break;

                  case 3:
                    d = a, e = b, f = c;
                }
                return this.set("title", d), this.set("message", e), this.set("onok", f), this;
            },
            setup: function() {
                return {
                    buttons: [ {
                        text: s.defaults.glossary.ok,
                        key: k.ESC,
                        invokeOnClose: !0,
                        className: s.defaults.theme.ok
                    } ],
                    focus: {
                        element: 0,
                        select: !1
                    },
                    options: {
                        maximizable: !1,
                        resizable: !1
                    }
                };
            },
            build: function() {},
            prepare: function() {},
            setMessage: function(a) {
                this.setContent(a);
            },
            settings: {
                message: void 0,
                onok: void 0,
                label: void 0
            },
            settingUpdated: function(a, b, c) {
                switch (a) {
                  case "message":
                    this.setMessage(c);
                    break;

                  case "label":
                    this.__internal.buttons[0].element && (this.__internal.buttons[0].element.innerHTML = c);
                }
            },
            callback: function(a) {
                if ("function" == typeof this.get("onok")) {
                    var b = this.get("onok").call(this, a);
                    "undefined" != typeof b && (a.cancel = !b);
                }
            }
        };
    }), s.dialog("confirm", function() {
        function a(a) {
            null !== c.timer && (clearInterval(c.timer), c.timer = null, a.__internal.buttons[c.index].element.innerHTML = c.text);
        }
        function b(b, d, e) {
            a(b), c.duration = e, c.index = d, c.text = b.__internal.buttons[d].element.innerHTML, 
            c.timer = setInterval(h(b, c.task), 1e3), c.task(null, b);
        }
        var c = {
            timer: null,
            index: null,
            text: null,
            duration: null,
            task: function(b, d) {
                if (d.isOpen()) {
                    if (d.__internal.buttons[c.index].element.innerHTML = c.text + " (&#8207;" + c.duration + "&#8207;) ", 
                    c.duration -= 1, -1 === c.duration) {
                        a(d);
                        var e = d.__internal.buttons[c.index], f = i(c.index, e);
                        "function" == typeof d.callback && d.callback.apply(d, [ f ]), f.close !== !1 && d.close();
                    }
                } else a(d);
            }
        };
        return {
            main: function(a, b, c, d) {
                var e, f, g, h;
                switch (arguments.length) {
                  case 1:
                    f = a;
                    break;

                  case 2:
                    f = a, g = b;
                    break;

                  case 3:
                    f = a, g = b, h = c;
                    break;

                  case 4:
                    e = a, f = b, g = c, h = d;
                }
                return this.set("title", e), this.set("message", f), this.set("onok", g), this.set("oncancel", h), 
                this;
            },
            setup: function() {
                return {
                    buttons: [ {
                        text: s.defaults.glossary.ok,
                        key: k.ENTER,
                        className: s.defaults.theme.ok
                    }, {
                        text: s.defaults.glossary.cancel,
                        key: k.ESC,
                        invokeOnClose: !0,
                        className: s.defaults.theme.cancel
                    } ],
                    focus: {
                        element: 0,
                        select: !1
                    },
                    options: {
                        maximizable: !1,
                        resizable: !1
                    }
                };
            },
            build: function() {},
            prepare: function() {},
            setMessage: function(a) {
                this.setContent(a);
            },
            settings: {
                message: null,
                labels: null,
                onok: null,
                oncancel: null,
                defaultFocus: null,
                reverseButtons: null
            },
            settingUpdated: function(a, b, c) {
                switch (a) {
                  case "message":
                    this.setMessage(c);
                    break;

                  case "labels":
                    "ok" in c && this.__internal.buttons[0].element && (this.__internal.buttons[0].text = c.ok, 
                    this.__internal.buttons[0].element.innerHTML = c.ok), "cancel" in c && this.__internal.buttons[1].element && (this.__internal.buttons[1].text = c.cancel, 
                    this.__internal.buttons[1].element.innerHTML = c.cancel);
                    break;

                  case "reverseButtons":
                    this.elements.buttons.primary.appendChild(c === !0 ? this.__internal.buttons[0].element : this.__internal.buttons[1].element);
                    break;

                  case "defaultFocus":
                    this.__internal.focus.element = "ok" === c ? 0 : 1;
                }
            },
            callback: function(b) {
                a(this);
                var c;
                switch (b.index) {
                  case 0:
                    "function" == typeof this.get("onok") && (c = this.get("onok").call(this, b), "undefined" != typeof c && (b.cancel = !c));
                    break;

                  case 1:
                    "function" == typeof this.get("oncancel") && (c = this.get("oncancel").call(this, b), 
                    "undefined" != typeof c && (b.cancel = !c));
                }
            },
            autoOk: function(a) {
                return b(this, 0, a), this;
            },
            autoCancel: function(a) {
                return b(this, 1, a), this;
            }
        };
    }), s.dialog("prompt", function() {
        var b = document.createElement("INPUT"), c = document.createElement("P");
        return {
            main: function(a, b, c, d, e) {
                var f, g, h, i, j;
                switch (arguments.length) {
                  case 1:
                    g = a;
                    break;

                  case 2:
                    g = a, h = b;
                    break;

                  case 3:
                    g = a, h = b, i = c;
                    break;

                  case 4:
                    g = a, h = b, i = c, j = d;
                    break;

                  case 5:
                    f = a, g = b, h = c, i = d, j = e;
                }
                return this.set("title", f), this.set("message", g), this.set("value", h), this.set("onok", i), 
                this.set("oncancel", j), this;
            },
            setup: function() {
                return {
                    buttons: [ {
                        text: s.defaults.glossary.ok,
                        key: k.ENTER,
                        className: s.defaults.theme.ok
                    }, {
                        text: s.defaults.glossary.cancel,
                        key: k.ESC,
                        invokeOnClose: !0,
                        className: s.defaults.theme.cancel
                    } ],
                    focus: {
                        element: b,
                        select: !0
                    },
                    options: {
                        maximizable: !1,
                        resizable: !1
                    }
                };
            },
            build: function() {
                b.className = s.defaults.theme.input, b.setAttribute("type", "text"), b.value = this.get("value"), 
                this.elements.content.appendChild(c), this.elements.content.appendChild(b);
            },
            prepare: function() {},
            setMessage: function(b) {
                "string" == typeof b ? (g(c), c.innerHTML = b) : b instanceof a.HTMLElement && c.firstChild !== b && (g(c), 
                c.appendChild(b));
            },
            settings: {
                message: void 0,
                labels: void 0,
                onok: void 0,
                oncancel: void 0,
                value: "",
                type: "text",
                reverseButtons: void 0
            },
            settingUpdated: function(a, c, d) {
                switch (a) {
                  case "message":
                    this.setMessage(d);
                    break;

                  case "value":
                    b.value = d;
                    break;

                  case "type":
                    switch (d) {
                      case "text":
                      case "color":
                      case "date":
                      case "datetime-local":
                      case "email":
                      case "month":
                      case "number":
                      case "password":
                      case "search":
                      case "tel":
                      case "time":
                      case "week":
                        b.type = d;
                        break;

                      default:
                        b.type = "text";
                    }
                    break;

                  case "labels":
                    d.ok && this.__internal.buttons[0].element && (this.__internal.buttons[0].element.innerHTML = d.ok), 
                    d.cancel && this.__internal.buttons[1].element && (this.__internal.buttons[1].element.innerHTML = d.cancel);
                    break;

                  case "reverseButtons":
                    this.elements.buttons.primary.appendChild(d === !0 ? this.__internal.buttons[0].element : this.__internal.buttons[1].element);
                }
            },
            callback: function(a) {
                var c;
                switch (a.index) {
                  case 0:
                    this.settings.value = b.value, "function" == typeof this.get("onok") && (c = this.get("onok").call(this, a, this.settings.value), 
                    "undefined" != typeof c && (a.cancel = !c));
                    break;

                  case 1:
                    "function" == typeof this.get("oncancel") && (c = this.get("oncancel").call(this, a), 
                    "undefined" != typeof c && (a.cancel = !c));
                }
            }
        };
    }), "object" == typeof module && "object" == typeof module.exports ? module.exports = s : "function" == typeof define && define.amd ? define([], function() {
        return s;
    }) : a.alertify || (a.alertify = s);
}("undefined" != typeof window ? window : this);

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

var HandlebarsKB = function() {
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
        var HandlebarsKB = create();
        HandlebarsKB.create = create;
        __exports__ = HandlebarsKB;
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
        var handlebarsKB = function() {
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
        __exports__ = handlebarsKB;
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
            namespace: "HandlebarsKB",
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
                var params = this.isChild ? [ "depth0", "data" ] : [ "HandlebarsKB", "depth0", "helpers", "partials", "data" ];
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
        var HandlebarsKB = __dependency1__;
        var AST = __dependency2__;
        var Parser = __dependency3__.parser;
        var parse = __dependency3__.parse;
        var Compiler = __dependency4__.Compiler;
        var compile = __dependency4__.compile;
        var precompile = __dependency4__.precompile;
        var JavaScriptCompiler = __dependency5__;
        var _create = HandlebarsKB.create;
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
        HandlebarsKB = create();
        HandlebarsKB.create = create;
        __exports__ = HandlebarsKB;
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
                              case key >= KEY0 && key <= KEY9 || key >= _KEY0 && key <= _KEY9 || (key == BACKSPACE || key == DEL):
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
                if ((timerclick > 1 || (options.closeOnDateSelect === true || options.closeOnDateSelect === 0 && !options.timepicker)) && !options.inline) {
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

(function(window, document, undefined) {
    (function(factory) {
        "use strict";
        if (typeof define === "function" && define.amd) {
            define([ "jquery" ], factory);
        } else if (jQuery && !jQuery.fn.qtip) {
            factory(jQuery);
        }
    })(function($) {
        "use strict";
        var TRUE = true, FALSE = false, NULL = null, X = "x", Y = "y", WIDTH = "width", HEIGHT = "height", TOP = "top", LEFT = "left", BOTTOM = "bottom", RIGHT = "right", CENTER = "center", FLIP = "flip", FLIPINVERT = "flipinvert", SHIFT = "shift", QTIP, PROTOTYPE, CORNER, CHECKS, PLUGINS = {}, NAMESPACE = "qtip", ATTR_HAS = "data-hasqtip", ATTR_ID = "data-qtip-id", WIDGET = [ "ui-widget", "ui-tooltip" ], SELECTOR = "." + NAMESPACE, INACTIVE_EVENTS = "click dblclick mousedown mouseup mousemove mouseleave mouseenter".split(" "), CLASS_FIXED = NAMESPACE + "-fixed", CLASS_DEFAULT = NAMESPACE + "-default", CLASS_FOCUS = NAMESPACE + "-focus", CLASS_HOVER = NAMESPACE + "-hover", CLASS_DISABLED = NAMESPACE + "-disabled", replaceSuffix = "_replacedByqTip", oldtitle = "oldtitle", trackingBound, BROWSER = {
            ie: function() {
                for (var v = 4, i = document.createElement("div"); (i.innerHTML = "<!--[if gt IE " + v + "]><i></i><![endif]-->") && i.getElementsByTagName("i")[0]; v += 1) {}
                return v > 4 ? v : NaN;
            }(),
            iOS: parseFloat(("" + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [ 0, "" ])[1]).replace("undefined", "3_2").replace("_", ".").replace("_", "")) || FALSE
        };
        function QTip(target, options, id, attr) {
            this.id = id;
            this.target = target;
            this.tooltip = NULL;
            this.elements = {
                target: target
            };
            this._id = NAMESPACE + "-" + id;
            this.timers = {
                img: {}
            };
            this.options = options;
            this.plugins = {};
            this.cache = {
                event: {},
                target: $(),
                disabled: FALSE,
                attr: attr,
                onTooltip: FALSE,
                lastClass: ""
            };
            this.rendered = this.destroyed = this.disabled = this.waiting = this.hiddenDuringWait = this.positioning = this.triggering = FALSE;
        }
        PROTOTYPE = QTip.prototype;
        PROTOTYPE._when = function(deferreds) {
            return $.when.apply($, deferreds);
        };
        PROTOTYPE.render = function(show) {
            if (this.rendered || this.destroyed) {
                return this;
            }
            var self = this, options = this.options, cache = this.cache, elements = this.elements, text = options.content.text, title = options.content.title, button = options.content.button, posOptions = options.position, namespace = "." + this._id + " ", deferreds = [], tooltip;
            $.attr(this.target[0], "aria-describedby", this._id);
            cache.posClass = this._createPosClass((this.position = {
                my: posOptions.my,
                at: posOptions.at
            }).my);
            this.tooltip = elements.tooltip = tooltip = $("<div/>", {
                id: this._id,
                "class": [ NAMESPACE, CLASS_DEFAULT, options.style.classes, cache.posClass ].join(" "),
                width: options.style.width || "",
                height: options.style.height || "",
                tracking: posOptions.target === "mouse" && posOptions.adjust.mouse,
                role: "alert",
                "aria-live": "polite",
                "aria-atomic": FALSE,
                "aria-describedby": this._id + "-content",
                "aria-hidden": TRUE
            }).toggleClass(CLASS_DISABLED, this.disabled).attr(ATTR_ID, this.id).data(NAMESPACE, this).appendTo(posOptions.container).append(elements.content = $("<div />", {
                "class": NAMESPACE + "-content",
                id: this._id + "-content",
                "aria-atomic": TRUE
            }));
            this.rendered = -1;
            this.positioning = TRUE;
            if (title) {
                this._createTitle();
                if (!$.isFunction(title)) {
                    deferreds.push(this._updateTitle(title, FALSE));
                }
            }
            if (button) {
                this._createButton();
            }
            if (!$.isFunction(text)) {
                deferreds.push(this._updateContent(text, FALSE));
            }
            this.rendered = TRUE;
            this._setWidget();
            $.each(PLUGINS, function(name) {
                var instance;
                if (this.initialize === "render" && (instance = this(self))) {
                    self.plugins[name] = instance;
                }
            });
            this._unassignEvents();
            this._assignEvents();
            this._when(deferreds).then(function() {
                self._trigger("render");
                self.positioning = FALSE;
                if (!self.hiddenDuringWait && (options.show.ready || show)) {
                    self.toggle(TRUE, cache.event, FALSE);
                }
                self.hiddenDuringWait = FALSE;
            });
            QTIP.api[this.id] = this;
            return this;
        };
        PROTOTYPE.destroy = function(immediate) {
            if (this.destroyed) {
                return this.target;
            }
            function process() {
                if (this.destroyed) {
                    return;
                }
                this.destroyed = TRUE;
                var target = this.target, title = target.attr(oldtitle), timer;
                if (this.rendered) {
                    this.tooltip.stop(1, 0).find("*").remove().end().remove();
                }
                $.each(this.plugins, function(name) {
                    this.destroy && this.destroy();
                });
                for (timer in this.timers) {
                    clearTimeout(this.timers[timer]);
                }
                target.removeData(NAMESPACE).removeAttr(ATTR_ID).removeAttr(ATTR_HAS).removeAttr("aria-describedby");
                if (this.options.suppress && title) {
                    target.attr("title", title).removeAttr(oldtitle);
                }
                this._unassignEvents();
                this.options = this.elements = this.cache = this.timers = this.plugins = this.mouse = NULL;
                delete QTIP.api[this.id];
            }
            if ((immediate !== TRUE || this.triggering === "hide") && this.rendered) {
                this.tooltip.one("tooltiphidden", $.proxy(process, this));
                !this.triggering && this.hide();
            } else {
                process.call(this);
            }
            return this.target;
        };
        function invalidOpt(a) {
            return a === NULL || $.type(a) !== "object";
        }
        function invalidContent(c) {
            return !($.isFunction(c) || c && c.attr || c.length || $.type(c) === "object" && (c.jquery || c.then));
        }
        function sanitizeOptions(opts) {
            var content, text, ajax, once;
            if (invalidOpt(opts)) {
                return FALSE;
            }
            if (invalidOpt(opts.metadata)) {
                opts.metadata = {
                    type: opts.metadata
                };
            }
            if ("content" in opts) {
                content = opts.content;
                if (invalidOpt(content) || content.jquery || content.done) {
                    content = opts.content = {
                        text: text = invalidContent(content) ? FALSE : content
                    };
                } else {
                    text = content.text;
                }
                if ("ajax" in content) {
                    ajax = content.ajax;
                    once = ajax && ajax.once !== FALSE;
                    delete content.ajax;
                    content.text = function(event, api) {
                        var loading = text || $(this).attr(api.options.content.attr) || "Loading...", deferred = $.ajax($.extend({}, ajax, {
                            context: api
                        })).then(ajax.success, NULL, ajax.error).then(function(content) {
                            if (content && once) {
                                api.set("content.text", content);
                            }
                            return content;
                        }, function(xhr, status, error) {
                            if (api.destroyed || xhr.status === 0) {
                                return;
                            }
                            api.set("content.text", status + ": " + error);
                        });
                        return !once ? (api.set("content.text", loading), deferred) : loading;
                    };
                }
                if ("title" in content) {
                    if ($.isPlainObject(content.title)) {
                        content.button = content.title.button;
                        content.title = content.title.text;
                    }
                    if (invalidContent(content.title || FALSE)) {
                        content.title = FALSE;
                    }
                }
            }
            if ("position" in opts && invalidOpt(opts.position)) {
                opts.position = {
                    my: opts.position,
                    at: opts.position
                };
            }
            if ("show" in opts && invalidOpt(opts.show)) {
                opts.show = opts.show.jquery ? {
                    target: opts.show
                } : opts.show === TRUE ? {
                    ready: TRUE
                } : {
                    event: opts.show
                };
            }
            if ("hide" in opts && invalidOpt(opts.hide)) {
                opts.hide = opts.hide.jquery ? {
                    target: opts.hide
                } : {
                    event: opts.hide
                };
            }
            if ("style" in opts && invalidOpt(opts.style)) {
                opts.style = {
                    classes: opts.style
                };
            }
            $.each(PLUGINS, function() {
                this.sanitize && this.sanitize(opts);
            });
            return opts;
        }
        CHECKS = PROTOTYPE.checks = {
            builtin: {
                "^id$": function(obj, o, v, prev) {
                    var id = v === TRUE ? QTIP.nextid : v, new_id = NAMESPACE + "-" + id;
                    if (id !== FALSE && id.length > 0 && !$("#" + new_id).length) {
                        this._id = new_id;
                        if (this.rendered) {
                            this.tooltip[0].id = this._id;
                            this.elements.content[0].id = this._id + "-content";
                            this.elements.title[0].id = this._id + "-title";
                        }
                    } else {
                        obj[o] = prev;
                    }
                },
                "^prerender": function(obj, o, v) {
                    v && !this.rendered && this.render(this.options.show.ready);
                },
                "^content.text$": function(obj, o, v) {
                    this._updateContent(v);
                },
                "^content.attr$": function(obj, o, v, prev) {
                    if (this.options.content.text === this.target.attr(prev)) {
                        this._updateContent(this.target.attr(v));
                    }
                },
                "^content.title$": function(obj, o, v) {
                    if (!v) {
                        return this._removeTitle();
                    }
                    v && !this.elements.title && this._createTitle();
                    this._updateTitle(v);
                },
                "^content.button$": function(obj, o, v) {
                    this._updateButton(v);
                },
                "^content.title.(text|button)$": function(obj, o, v) {
                    this.set("content." + o, v);
                },
                "^position.(my|at)$": function(obj, o, v) {
                    "string" === typeof v && (this.position[o] = obj[o] = new CORNER(v, o === "at"));
                },
                "^position.container$": function(obj, o, v) {
                    this.rendered && this.tooltip.appendTo(v);
                },
                "^show.ready$": function(obj, o, v) {
                    v && (!this.rendered && this.render(TRUE) || this.toggle(TRUE));
                },
                "^style.classes$": function(obj, o, v, p) {
                    this.rendered && this.tooltip.removeClass(p).addClass(v);
                },
                "^style.(width|height)": function(obj, o, v) {
                    this.rendered && this.tooltip.css(o, v);
                },
                "^style.widget|content.title": function() {
                    this.rendered && this._setWidget();
                },
                "^style.def": function(obj, o, v) {
                    this.rendered && this.tooltip.toggleClass(CLASS_DEFAULT, !!v);
                },
                "^events.(render|show|move|hide|focus|blur)$": function(obj, o, v) {
                    this.rendered && this.tooltip[($.isFunction(v) ? "" : "un") + "bind"]("tooltip" + o, v);
                },
                "^(show|hide|position).(event|target|fixed|inactive|leave|distance|viewport|adjust)": function() {
                    if (!this.rendered) {
                        return;
                    }
                    var posOptions = this.options.position;
                    this.tooltip.attr("tracking", posOptions.target === "mouse" && posOptions.adjust.mouse);
                    this._unassignEvents();
                    this._assignEvents();
                }
            }
        };
        function convertNotation(options, notation) {
            var i = 0, obj, option = options, levels = notation.split(".");
            while (option = option[levels[i++]]) {
                if (i < levels.length) {
                    obj = option;
                }
            }
            return [ obj || options, levels.pop() ];
        }
        PROTOTYPE.get = function(notation) {
            if (this.destroyed) {
                return this;
            }
            var o = convertNotation(this.options, notation.toLowerCase()), result = o[0][o[1]];
            return result.precedance ? result.string() : result;
        };
        function setCallback(notation, args) {
            var category, rule, match;
            for (category in this.checks) {
                for (rule in this.checks[category]) {
                    if (match = new RegExp(rule, "i").exec(notation)) {
                        args.push(match);
                        if (category === "builtin" || this.plugins[category]) {
                            this.checks[category][rule].apply(this.plugins[category] || this, args);
                        }
                    }
                }
            }
        }
        var rmove = /^position\.(my|at|adjust|target|container|viewport)|style|content|show\.ready/i, rrender = /^prerender|show\.ready/i;
        PROTOTYPE.set = function(option, value) {
            if (this.destroyed) {
                return this;
            }
            var rendered = this.rendered, reposition = FALSE, options = this.options, checks = this.checks, name;
            if ("string" === typeof option) {
                name = option;
                option = {};
                option[name] = value;
            } else {
                option = $.extend({}, option);
            }
            $.each(option, function(notation, value) {
                if (rendered && rrender.test(notation)) {
                    delete option[notation];
                    return;
                }
                var obj = convertNotation(options, notation.toLowerCase()), previous;
                previous = obj[0][obj[1]];
                obj[0][obj[1]] = value && value.nodeType ? $(value) : value;
                reposition = rmove.test(notation) || reposition;
                option[notation] = [ obj[0], obj[1], value, previous ];
            });
            sanitizeOptions(options);
            this.positioning = TRUE;
            $.each(option, $.proxy(setCallback, this));
            this.positioning = FALSE;
            if (this.rendered && this.tooltip[0].offsetWidth > 0 && reposition) {
                this.reposition(options.position.target === "mouse" ? NULL : this.cache.event);
            }
            return this;
        };
        PROTOTYPE._update = function(content, element, reposition) {
            var self = this, cache = this.cache;
            if (!this.rendered || !content) {
                return FALSE;
            }
            if ($.isFunction(content)) {
                content = content.call(this.elements.target, cache.event, this) || "";
            }
            if ($.isFunction(content.then)) {
                cache.waiting = TRUE;
                return content.then(function(c) {
                    cache.waiting = FALSE;
                    return self._update(c, element);
                }, NULL, function(e) {
                    return self._update(e, element);
                });
            }
            if (content === FALSE || !content && content !== "") {
                return FALSE;
            }
            if (content.jquery && content.length > 0) {
                element.empty().append(content.css({
                    display: "block",
                    visibility: "visible"
                }));
            } else {
                element.html(content);
            }
            return this._waitForContent(element).then(function(images) {
                if (self.rendered && self.tooltip[0].offsetWidth > 0) {
                    self.reposition(cache.event, !images.length);
                }
            });
        };
        PROTOTYPE._waitForContent = function(element) {
            var cache = this.cache;
            cache.waiting = TRUE;
            return ($.fn.imagesLoaded ? element.imagesLoaded() : $.Deferred().resolve([])).done(function() {
                cache.waiting = FALSE;
            }).promise();
        };
        PROTOTYPE._updateContent = function(content, reposition) {
            this._update(content, this.elements.content, reposition);
        };
        PROTOTYPE._updateTitle = function(content, reposition) {
            if (this._update(content, this.elements.title, reposition) === FALSE) {
                this._removeTitle(FALSE);
            }
        };
        PROTOTYPE._createTitle = function() {
            var elements = this.elements, id = this._id + "-title";
            if (elements.titlebar) {
                this._removeTitle();
            }
            elements.titlebar = $("<div />", {
                "class": NAMESPACE + "-titlebar " + (this.options.style.widget ? createWidgetClass("header") : "")
            }).append(elements.title = $("<div />", {
                id: id,
                "class": NAMESPACE + "-title",
                "aria-atomic": TRUE
            })).insertBefore(elements.content).delegate(".qtip-close", "mousedown keydown mouseup keyup mouseout", function(event) {
                $(this).toggleClass("ui-state-active ui-state-focus", event.type.substr(-4) === "down");
            }).delegate(".qtip-close", "mouseover mouseout", function(event) {
                $(this).toggleClass("ui-state-hover", event.type === "mouseover");
            });
            if (this.options.content.button) {
                this._createButton();
            }
        };
        PROTOTYPE._removeTitle = function(reposition) {
            var elements = this.elements;
            if (elements.title) {
                elements.titlebar.remove();
                elements.titlebar = elements.title = elements.button = NULL;
                if (reposition !== FALSE) {
                    this.reposition();
                }
            }
        };
        PROTOTYPE._createPosClass = function(my) {
            return NAMESPACE + "-pos-" + (my || this.options.position.my).abbrev();
        };
        PROTOTYPE.reposition = function(event, effect) {
            if (!this.rendered || this.positioning || this.destroyed) {
                return this;
            }
            this.positioning = TRUE;
            var cache = this.cache, tooltip = this.tooltip, posOptions = this.options.position, target = posOptions.target, my = posOptions.my, at = posOptions.at, viewport = posOptions.viewport, container = posOptions.container, adjust = posOptions.adjust, method = adjust.method.split(" "), tooltipWidth = tooltip.outerWidth(FALSE), tooltipHeight = tooltip.outerHeight(FALSE), targetWidth = 0, targetHeight = 0, type = tooltip.css("position"), position = {
                left: 0,
                top: 0
            }, visible = tooltip[0].offsetWidth > 0, isScroll = event && event.type === "scroll", win = $(window), doc = container[0].ownerDocument, mouse = this.mouse, pluginCalculations, offset, adjusted, newClass;
            if ($.isArray(target) && target.length === 2) {
                at = {
                    x: LEFT,
                    y: TOP
                };
                position = {
                    left: target[0],
                    top: target[1]
                };
            } else if (target === "mouse") {
                at = {
                    x: LEFT,
                    y: TOP
                };
                if ((!adjust.mouse || this.options.hide.distance) && cache.origin && cache.origin.pageX) {
                    event = cache.origin;
                } else if (!event || event && (event.type === "resize" || event.type === "scroll")) {
                    event = cache.event;
                } else if (mouse && mouse.pageX) {
                    event = mouse;
                }
                if (type !== "static") {
                    position = container.offset();
                }
                if (doc.body.offsetWidth !== (window.innerWidth || doc.documentElement.clientWidth)) {
                    offset = $(document.body).offset();
                }
                position = {
                    left: event.pageX - position.left + (offset && offset.left || 0),
                    top: event.pageY - position.top + (offset && offset.top || 0)
                };
                if (adjust.mouse && isScroll && mouse) {
                    position.left -= (mouse.scrollX || 0) - win.scrollLeft();
                    position.top -= (mouse.scrollY || 0) - win.scrollTop();
                }
            } else {
                if (target === "event") {
                    if (event && event.target && event.type !== "scroll" && event.type !== "resize") {
                        cache.target = $(event.target);
                    } else if (!event.target) {
                        cache.target = this.elements.target;
                    }
                } else if (target !== "event") {
                    cache.target = $(target.jquery ? target : this.elements.target);
                }
                target = cache.target;
                target = $(target).eq(0);
                if (target.length === 0) {
                    return this;
                } else if (target[0] === document || target[0] === window) {
                    targetWidth = BROWSER.iOS ? window.innerWidth : target.width();
                    targetHeight = BROWSER.iOS ? window.innerHeight : target.height();
                    if (target[0] === window) {
                        position = {
                            top: (viewport || target).scrollTop(),
                            left: (viewport || target).scrollLeft()
                        };
                    }
                } else if (PLUGINS.imagemap && target.is("area")) {
                    pluginCalculations = PLUGINS.imagemap(this, target, at, PLUGINS.viewport ? method : FALSE);
                } else if (PLUGINS.svg && target && target[0].ownerSVGElement) {
                    pluginCalculations = PLUGINS.svg(this, target, at, PLUGINS.viewport ? method : FALSE);
                } else {
                    targetWidth = target.outerWidth(FALSE);
                    targetHeight = target.outerHeight(FALSE);
                    position = target.offset();
                }
                if (pluginCalculations) {
                    targetWidth = pluginCalculations.width;
                    targetHeight = pluginCalculations.height;
                    offset = pluginCalculations.offset;
                    position = pluginCalculations.position;
                }
                position = this.reposition.offset(target, position, container);
                if (BROWSER.iOS > 3.1 && BROWSER.iOS < 4.1 || BROWSER.iOS >= 4.3 && BROWSER.iOS < 4.33 || !BROWSER.iOS && type === "fixed") {
                    position.left -= win.scrollLeft();
                    position.top -= win.scrollTop();
                }
                if (!pluginCalculations || pluginCalculations && pluginCalculations.adjustable !== FALSE) {
                    position.left += at.x === RIGHT ? targetWidth : at.x === CENTER ? targetWidth / 2 : 0;
                    position.top += at.y === BOTTOM ? targetHeight : at.y === CENTER ? targetHeight / 2 : 0;
                }
            }
            position.left += adjust.x + (my.x === RIGHT ? -tooltipWidth : my.x === CENTER ? -tooltipWidth / 2 : 0);
            position.top += adjust.y + (my.y === BOTTOM ? -tooltipHeight : my.y === CENTER ? -tooltipHeight / 2 : 0);
            if (PLUGINS.viewport) {
                adjusted = position.adjusted = PLUGINS.viewport(this, position, posOptions, targetWidth, targetHeight, tooltipWidth, tooltipHeight);
                if (offset && adjusted.left) {
                    position.left += offset.left;
                }
                if (offset && adjusted.top) {
                    position.top += offset.top;
                }
                if (adjusted.my) {
                    this.position.my = adjusted.my;
                }
            } else {
                position.adjusted = {
                    left: 0,
                    top: 0
                };
            }
            if (cache.posClass !== (newClass = this._createPosClass(this.position.my))) {
                tooltip.removeClass(cache.posClass).addClass(cache.posClass = newClass);
            }
            if (!this._trigger("move", [ position, viewport.elem || viewport ], event)) {
                return this;
            }
            delete position.adjusted;
            if (effect === FALSE || !visible || isNaN(position.left) || isNaN(position.top) || target === "mouse" || !$.isFunction(posOptions.effect)) {
                tooltip.css(position);
            } else if ($.isFunction(posOptions.effect)) {
                posOptions.effect.call(tooltip, this, $.extend({}, position));
                tooltip.queue(function(next) {
                    $(this).css({
                        opacity: "",
                        height: ""
                    });
                    if (BROWSER.ie) {
                        this.style.removeAttribute("filter");
                    }
                    next();
                });
            }
            this.positioning = FALSE;
            return this;
        };
        PROTOTYPE.reposition.offset = function(elem, pos, container) {
            if (!container[0]) {
                return pos;
            }
            var ownerDocument = $(elem[0].ownerDocument), quirks = !!BROWSER.ie && document.compatMode !== "CSS1Compat", parent = container[0], scrolled, position, parentOffset, overflow;
            function scroll(e, i) {
                pos.left += i * e.scrollLeft();
                pos.top += i * e.scrollTop();
            }
            do {
                if ((position = $.css(parent, "position")) !== "static") {
                    if (position === "fixed") {
                        parentOffset = parent.getBoundingClientRect();
                        scroll(ownerDocument, -1);
                    } else {
                        parentOffset = $(parent).position();
                        parentOffset.left += parseFloat($.css(parent, "borderLeftWidth")) || 0;
                        parentOffset.top += parseFloat($.css(parent, "borderTopWidth")) || 0;
                    }
                    pos.left -= parentOffset.left + (parseFloat($.css(parent, "marginLeft")) || 0);
                    pos.top -= parentOffset.top + (parseFloat($.css(parent, "marginTop")) || 0);
                    if (!scrolled && (overflow = $.css(parent, "overflow")) !== "hidden" && overflow !== "visible") {
                        scrolled = $(parent);
                    }
                }
            } while (parent = parent.offsetParent);
            if (scrolled && (scrolled[0] !== ownerDocument[0] || quirks)) {
                scroll(scrolled, 1);
            }
            return pos;
        };
        var C = (CORNER = PROTOTYPE.reposition.Corner = function(corner, forceY) {
            corner = ("" + corner).replace(/([A-Z])/, " $1").replace(/middle/gi, CENTER).toLowerCase();
            this.x = (corner.match(/left|right/i) || corner.match(/center/) || [ "inherit" ])[0].toLowerCase();
            this.y = (corner.match(/top|bottom|center/i) || [ "inherit" ])[0].toLowerCase();
            this.forceY = !!forceY;
            var f = corner.charAt(0);
            this.precedance = f === "t" || f === "b" ? Y : X;
        }).prototype;
        C.invert = function(z, center) {
            this[z] = this[z] === LEFT ? RIGHT : this[z] === RIGHT ? LEFT : center || this[z];
        };
        C.string = function(join) {
            var x = this.x, y = this.y;
            var result = x !== y ? x === "center" || y !== "center" && (this.precedance === Y || this.forceY) ? [ y, x ] : [ x, y ] : [ x ];
            return join !== false ? result.join(" ") : result;
        };
        C.abbrev = function() {
            var result = this.string(false);
            return result[0].charAt(0) + (result[1] && result[1].charAt(0) || "");
        };
        C.clone = function() {
            return new CORNER(this.string(), this.forceY);
        };
        PROTOTYPE.toggle = function(state, event) {
            var cache = this.cache, options = this.options, tooltip = this.tooltip;
            if (event) {
                if (/over|enter/.test(event.type) && cache.event && /out|leave/.test(cache.event.type) && options.show.target.add(event.target).length === options.show.target.length && tooltip.has(event.relatedTarget).length) {
                    return this;
                }
                cache.event = $.event.fix(event);
            }
            this.waiting && !state && (this.hiddenDuringWait = TRUE);
            if (!this.rendered) {
                return state ? this.render(1) : this;
            } else if (this.destroyed || this.disabled) {
                return this;
            }
            var type = state ? "show" : "hide", opts = this.options[type], otherOpts = this.options[!state ? "show" : "hide"], posOptions = this.options.position, contentOptions = this.options.content, width = this.tooltip.css("width"), visible = this.tooltip.is(":visible"), animate = state || opts.target.length === 1, sameTarget = !event || opts.target.length < 2 || cache.target[0] === event.target, identicalState, allow, showEvent, delay, after;
            if ((typeof state).search("boolean|number")) {
                state = !visible;
            }
            identicalState = !tooltip.is(":animated") && visible === state && sameTarget;
            allow = !identicalState ? !!this._trigger(type, [ 90 ]) : NULL;
            if (this.destroyed) {
                return this;
            }
            if (allow !== FALSE && state) {
                this.focus(event);
            }
            if (!allow || identicalState) {
                return this;
            }
            $.attr(tooltip[0], "aria-hidden", !!!state);
            if (state) {
                this.mouse && (cache.origin = $.event.fix(this.mouse));
                if ($.isFunction(contentOptions.text)) {
                    this._updateContent(contentOptions.text, FALSE);
                }
                if ($.isFunction(contentOptions.title)) {
                    this._updateTitle(contentOptions.title, FALSE);
                }
                if (!trackingBound && posOptions.target === "mouse" && posOptions.adjust.mouse) {
                    $(document).bind("mousemove." + NAMESPACE, this._storeMouse);
                    trackingBound = TRUE;
                }
                if (!width) {
                    tooltip.css("width", tooltip.outerWidth(FALSE));
                }
                this.reposition(event, arguments[2]);
                if (!width) {
                    tooltip.css("width", "");
                }
                if (!!opts.solo) {
                    (typeof opts.solo === "string" ? $(opts.solo) : $(SELECTOR, opts.solo)).not(tooltip).not(opts.target).qtip("hide", $.Event("tooltipsolo"));
                }
            } else {
                clearTimeout(this.timers.show);
                delete cache.origin;
                if (trackingBound && !$(SELECTOR + '[tracking="true"]:visible', opts.solo).not(tooltip).length) {
                    $(document).unbind("mousemove." + NAMESPACE);
                    trackingBound = FALSE;
                }
                this.blur(event);
            }
            after = $.proxy(function() {
                if (state) {
                    if (BROWSER.ie) {
                        tooltip[0].style.removeAttribute("filter");
                    }
                    tooltip.css("overflow", "");
                    if ("string" === typeof opts.autofocus) {
                        $(this.options.show.autofocus, tooltip).focus();
                    }
                    this.options.show.target.trigger("qtip-" + this.id + "-inactive");
                } else {
                    tooltip.css({
                        display: "",
                        visibility: "",
                        opacity: "",
                        left: "",
                        top: ""
                    });
                }
                this._trigger(state ? "visible" : "hidden");
            }, this);
            if (opts.effect === FALSE || animate === FALSE) {
                tooltip[type]();
                after();
            } else if ($.isFunction(opts.effect)) {
                tooltip.stop(1, 1);
                opts.effect.call(tooltip, this);
                tooltip.queue("fx", function(n) {
                    after();
                    n();
                });
            } else {
                tooltip.fadeTo(90, state ? 1 : 0, after);
            }
            if (state) {
                opts.target.trigger("qtip-" + this.id + "-inactive");
            }
            return this;
        };
        PROTOTYPE.show = function(event) {
            return this.toggle(TRUE, event);
        };
        PROTOTYPE.hide = function(event) {
            return this.toggle(FALSE, event);
        };
        PROTOTYPE.focus = function(event) {
            if (!this.rendered || this.destroyed) {
                return this;
            }
            var qtips = $(SELECTOR), tooltip = this.tooltip, curIndex = parseInt(tooltip[0].style.zIndex, 10), newIndex = QTIP.zindex + qtips.length, focusedElem;
            if (!tooltip.hasClass(CLASS_FOCUS)) {
                if (this._trigger("focus", [ newIndex ], event)) {
                    if (curIndex !== newIndex) {
                        qtips.each(function() {
                            if (this.style.zIndex > curIndex) {
                                this.style.zIndex = this.style.zIndex - 1;
                            }
                        });
                        qtips.filter("." + CLASS_FOCUS).qtip("blur", event);
                    }
                    tooltip.addClass(CLASS_FOCUS)[0].style.zIndex = newIndex;
                }
            }
            return this;
        };
        PROTOTYPE.blur = function(event) {
            if (!this.rendered || this.destroyed) {
                return this;
            }
            this.tooltip.removeClass(CLASS_FOCUS);
            this._trigger("blur", [ this.tooltip.css("zIndex") ], event);
            return this;
        };
        PROTOTYPE.disable = function(state) {
            if (this.destroyed) {
                return this;
            }
            if (state === "toggle") {
                state = !(this.rendered ? this.tooltip.hasClass(CLASS_DISABLED) : this.disabled);
            } else if ("boolean" !== typeof state) {
                state = TRUE;
            }
            if (this.rendered) {
                this.tooltip.toggleClass(CLASS_DISABLED, state).attr("aria-disabled", state);
            }
            this.disabled = !!state;
            return this;
        };
        PROTOTYPE.enable = function() {
            return this.disable(FALSE);
        };
        PROTOTYPE._createButton = function() {
            var self = this, elements = this.elements, tooltip = elements.tooltip, button = this.options.content.button, isString = typeof button === "string", close = isString ? button : "Close tooltip";
            if (elements.button) {
                elements.button.remove();
            }
            if (button.jquery) {
                elements.button = button;
            } else {
                elements.button = $("<a />", {
                    "class": "qtip-close " + (this.options.style.widget ? "" : NAMESPACE + "-icon"),
                    title: close,
                    "aria-label": close
                }).prepend($("<span />", {
                    "class": "ui-icon ui-icon-close",
                    html: "&times;"
                }));
            }
            elements.button.appendTo(elements.titlebar || tooltip).attr("role", "button").click(function(event) {
                if (!tooltip.hasClass(CLASS_DISABLED)) {
                    self.hide(event);
                }
                return FALSE;
            });
        };
        PROTOTYPE._updateButton = function(button) {
            if (!this.rendered) {
                return FALSE;
            }
            var elem = this.elements.button;
            if (button) {
                this._createButton();
            } else {
                elem.remove();
            }
        };
        function createWidgetClass(cls) {
            return WIDGET.concat("").join(cls ? "-" + cls + " " : " ");
        }
        PROTOTYPE._setWidget = function() {
            var on = this.options.style.widget, elements = this.elements, tooltip = elements.tooltip, disabled = tooltip.hasClass(CLASS_DISABLED);
            tooltip.removeClass(CLASS_DISABLED);
            CLASS_DISABLED = on ? "ui-state-disabled" : "qtip-disabled";
            tooltip.toggleClass(CLASS_DISABLED, disabled);
            tooltip.toggleClass("ui-helper-reset " + createWidgetClass(), on).toggleClass(CLASS_DEFAULT, this.options.style.def && !on);
            if (elements.content) {
                elements.content.toggleClass(createWidgetClass("content"), on);
            }
            if (elements.titlebar) {
                elements.titlebar.toggleClass(createWidgetClass("header"), on);
            }
            if (elements.button) {
                elements.button.toggleClass(NAMESPACE + "-icon", !on);
            }
        };
        function delay(callback, duration) {
            if (duration > 0) {
                return setTimeout($.proxy(callback, this), duration);
            } else {
                callback.call(this);
            }
        }
        function showMethod(event) {
            if (this.tooltip.hasClass(CLASS_DISABLED)) {
                return;
            }
            clearTimeout(this.timers.show);
            clearTimeout(this.timers.hide);
            this.timers.show = delay.call(this, function() {
                this.toggle(TRUE, event);
            }, this.options.show.delay);
        }
        function hideMethod(event) {
            if (this.tooltip.hasClass(CLASS_DISABLED) || this.destroyed) {
                return;
            }
            var relatedTarget = $(event.relatedTarget), ontoTooltip = relatedTarget.closest(SELECTOR)[0] === this.tooltip[0], ontoTarget = relatedTarget[0] === this.options.show.target[0];
            clearTimeout(this.timers.show);
            clearTimeout(this.timers.hide);
            if (this !== relatedTarget[0] && (this.options.position.target === "mouse" && ontoTooltip) || this.options.hide.fixed && (/mouse(out|leave|move)/.test(event.type) && (ontoTooltip || ontoTarget))) {
                try {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                } catch (e) {}
                return;
            }
            this.timers.hide = delay.call(this, function() {
                this.toggle(FALSE, event);
            }, this.options.hide.delay, this);
        }
        function inactiveMethod(event) {
            if (this.tooltip.hasClass(CLASS_DISABLED) || !this.options.hide.inactive) {
                return;
            }
            clearTimeout(this.timers.inactive);
            this.timers.inactive = delay.call(this, function() {
                this.hide(event);
            }, this.options.hide.inactive);
        }
        function repositionMethod(event) {
            if (this.rendered && this.tooltip[0].offsetWidth > 0) {
                this.reposition(event);
            }
        }
        PROTOTYPE._storeMouse = function(event) {
            (this.mouse = $.event.fix(event)).type = "mousemove";
            return this;
        };
        PROTOTYPE._bind = function(targets, events, method, suffix, context) {
            if (!targets || !method || !events.length) {
                return;
            }
            var ns = "." + this._id + (suffix ? "-" + suffix : "");
            $(targets).bind((events.split ? events : events.join(ns + " ")) + ns, $.proxy(method, context || this));
            return this;
        };
        PROTOTYPE._unbind = function(targets, suffix) {
            targets && $(targets).unbind("." + this._id + (suffix ? "-" + suffix : ""));
            return this;
        };
        function delegate(selector, events, method) {
            $(document.body).delegate(selector, (events.split ? events : events.join("." + NAMESPACE + " ")) + "." + NAMESPACE, function() {
                var api = QTIP.api[$.attr(this, ATTR_ID)];
                api && !api.disabled && method.apply(api, arguments);
            });
        }
        PROTOTYPE._trigger = function(type, args, event) {
            var callback = $.Event("tooltip" + type);
            callback.originalEvent = event && $.extend({}, event) || this.cache.event || NULL;
            this.triggering = type;
            this.tooltip.trigger(callback, [ this ].concat(args || []));
            this.triggering = FALSE;
            return !callback.isDefaultPrevented();
        };
        PROTOTYPE._bindEvents = function(showEvents, hideEvents, showTargets, hideTargets, showMethod, hideMethod) {
            var similarTargets = showTargets.filter(hideTargets).add(hideTargets.filter(showTargets)), toggleEvents = [];
            if (similarTargets.length) {
                $.each(hideEvents, function(i, type) {
                    var showIndex = $.inArray(type, showEvents);
                    showIndex > -1 && toggleEvents.push(showEvents.splice(showIndex, 1)[0]);
                });
                if (toggleEvents.length) {
                    this._bind(similarTargets, toggleEvents, function(event) {
                        var state = this.rendered ? this.tooltip[0].offsetWidth > 0 : false;
                        (state ? hideMethod : showMethod).call(this, event);
                    });
                    showTargets = showTargets.not(similarTargets);
                    hideTargets = hideTargets.not(similarTargets);
                }
            }
            this._bind(showTargets, showEvents, showMethod);
            this._bind(hideTargets, hideEvents, hideMethod);
        };
        PROTOTYPE._assignInitialEvents = function(event) {
            var options = this.options, showTarget = options.show.target, hideTarget = options.hide.target, showEvents = options.show.event ? $.trim("" + options.show.event).split(" ") : [], hideEvents = options.hide.event ? $.trim("" + options.hide.event).split(" ") : [];
            this._bind(this.elements.target, [ "remove", "removeqtip" ], function(event) {
                this.destroy(true);
            }, "destroy");
            if (/mouse(over|enter)/i.test(options.show.event) && !/mouse(out|leave)/i.test(options.hide.event)) {
                hideEvents.push("mouseleave");
            }
            this._bind(showTarget, "mousemove", function(event) {
                this._storeMouse(event);
                this.cache.onTarget = TRUE;
            });
            function hoverIntent(event) {
                if (this.disabled || this.destroyed) {
                    return FALSE;
                }
                this.cache.event = event && $.event.fix(event);
                this.cache.target = event && $(event.target);
                clearTimeout(this.timers.show);
                this.timers.show = delay.call(this, function() {
                    this.render(typeof event === "object" || options.show.ready);
                }, options.prerender ? 0 : options.show.delay);
            }
            this._bindEvents(showEvents, hideEvents, showTarget, hideTarget, hoverIntent, function() {
                if (!this.timers) {
                    return FALSE;
                }
                clearTimeout(this.timers.show);
            });
            if (options.show.ready || options.prerender) {
                hoverIntent.call(this, event);
            }
        };
        PROTOTYPE._assignEvents = function() {
            var self = this, options = this.options, posOptions = options.position, tooltip = this.tooltip, showTarget = options.show.target, hideTarget = options.hide.target, containerTarget = posOptions.container, viewportTarget = posOptions.viewport, documentTarget = $(document), bodyTarget = $(document.body), windowTarget = $(window), showEvents = options.show.event ? $.trim("" + options.show.event).split(" ") : [], hideEvents = options.hide.event ? $.trim("" + options.hide.event).split(" ") : [];
            $.each(options.events, function(name, callback) {
                self._bind(tooltip, name === "toggle" ? [ "tooltipshow", "tooltiphide" ] : [ "tooltip" + name ], callback, null, tooltip);
            });
            if (/mouse(out|leave)/i.test(options.hide.event) && options.hide.leave === "window") {
                this._bind(documentTarget, [ "mouseout", "blur" ], function(event) {
                    if (!/select|option/.test(event.target.nodeName) && !event.relatedTarget) {
                        this.hide(event);
                    }
                });
            }
            if (options.hide.fixed) {
                hideTarget = hideTarget.add(tooltip.addClass(CLASS_FIXED));
            } else if (/mouse(over|enter)/i.test(options.show.event)) {
                this._bind(hideTarget, "mouseleave", function() {
                    clearTimeout(this.timers.show);
                });
            }
            if (("" + options.hide.event).indexOf("unfocus") > -1) {
                this._bind(containerTarget.closest("html"), [ "mousedown", "touchstart" ], function(event) {
                    var elem = $(event.target), enabled = this.rendered && !this.tooltip.hasClass(CLASS_DISABLED) && this.tooltip[0].offsetWidth > 0, isAncestor = elem.parents(SELECTOR).filter(this.tooltip[0]).length > 0;
                    if (elem[0] !== this.target[0] && elem[0] !== this.tooltip[0] && !isAncestor && !this.target.has(elem[0]).length && enabled) {
                        this.hide(event);
                    }
                });
            }
            if ("number" === typeof options.hide.inactive) {
                this._bind(showTarget, "qtip-" + this.id + "-inactive", inactiveMethod, "inactive");
                this._bind(hideTarget.add(tooltip), QTIP.inactiveEvents, inactiveMethod);
            }
            this._bindEvents(showEvents, hideEvents, showTarget, hideTarget, showMethod, hideMethod);
            this._bind(showTarget.add(tooltip), "mousemove", function(event) {
                if ("number" === typeof options.hide.distance) {
                    var origin = this.cache.origin || {}, limit = this.options.hide.distance, abs = Math.abs;
                    if (abs(event.pageX - origin.pageX) >= limit || abs(event.pageY - origin.pageY) >= limit) {
                        this.hide(event);
                    }
                }
                this._storeMouse(event);
            });
            if (posOptions.target === "mouse") {
                if (posOptions.adjust.mouse) {
                    if (options.hide.event) {
                        this._bind(showTarget, [ "mouseenter", "mouseleave" ], function(event) {
                            if (!this.cache) {
                                return FALSE;
                            }
                            this.cache.onTarget = event.type === "mouseenter";
                        });
                    }
                    this._bind(documentTarget, "mousemove", function(event) {
                        if (this.rendered && this.cache.onTarget && !this.tooltip.hasClass(CLASS_DISABLED) && this.tooltip[0].offsetWidth > 0) {
                            this.reposition(event);
                        }
                    });
                }
            }
            if (posOptions.adjust.resize || viewportTarget.length) {
                this._bind($.event.special.resize ? viewportTarget : windowTarget, "resize", repositionMethod);
            }
            if (posOptions.adjust.scroll) {
                this._bind(windowTarget.add(posOptions.container), "scroll", repositionMethod);
            }
        };
        PROTOTYPE._unassignEvents = function() {
            var options = this.options, showTargets = options.show.target, hideTargets = options.hide.target, targets = $.grep([ this.elements.target[0], this.rendered && this.tooltip[0], options.position.container[0], options.position.viewport[0], options.position.container.closest("html")[0], window, document ], function(i) {
                return typeof i === "object";
            });
            if (showTargets && showTargets.toArray) {
                targets = targets.concat(showTargets.toArray());
            }
            if (hideTargets && hideTargets.toArray) {
                targets = targets.concat(hideTargets.toArray());
            }
            this._unbind(targets)._unbind(targets, "destroy")._unbind(targets, "inactive");
        };
        $(function() {
            delegate(SELECTOR, [ "mouseenter", "mouseleave" ], function(event) {
                var state = event.type === "mouseenter", tooltip = $(event.currentTarget), target = $(event.relatedTarget || event.target), options = this.options;
                if (state) {
                    this.focus(event);
                    tooltip.hasClass(CLASS_FIXED) && !tooltip.hasClass(CLASS_DISABLED) && clearTimeout(this.timers.hide);
                } else {
                    if (options.position.target === "mouse" && options.position.adjust.mouse && options.hide.event && options.show.target && !target.closest(options.show.target[0]).length) {
                        this.hide(event);
                    }
                }
                tooltip.toggleClass(CLASS_HOVER, state);
            });
            delegate("[" + ATTR_ID + "]", INACTIVE_EVENTS, inactiveMethod);
        });
        function init(elem, id, opts) {
            var obj, posOptions, attr, config, title, docBody = $(document.body), newTarget = elem[0] === document ? docBody : elem, metadata = elem.metadata ? elem.metadata(opts.metadata) : NULL, metadata5 = opts.metadata.type === "html5" && metadata ? metadata[opts.metadata.name] : NULL, html5 = elem.data(opts.metadata.name || "qtipopts");
            try {
                html5 = typeof html5 === "string" ? $.parseJSON(html5) : html5;
            } catch (e) {}
            config = $.extend(TRUE, {}, QTIP.defaults, opts, typeof html5 === "object" ? sanitizeOptions(html5) : NULL, sanitizeOptions(metadata5 || metadata));
            posOptions = config.position;
            config.id = id;
            if ("boolean" === typeof config.content.text) {
                attr = elem.attr(config.content.attr);
                if (config.content.attr !== FALSE && attr) {
                    config.content.text = attr;
                } else {
                    return FALSE;
                }
            }
            if (!posOptions.container.length) {
                posOptions.container = docBody;
            }
            if (posOptions.target === FALSE) {
                posOptions.target = newTarget;
            }
            if (config.show.target === FALSE) {
                config.show.target = newTarget;
            }
            if (config.show.solo === TRUE) {
                config.show.solo = posOptions.container.closest("body");
            }
            if (config.hide.target === FALSE) {
                config.hide.target = newTarget;
            }
            if (config.position.viewport === TRUE) {
                config.position.viewport = posOptions.container;
            }
            posOptions.container = posOptions.container.eq(0);
            posOptions.at = new CORNER(posOptions.at, TRUE);
            posOptions.my = new CORNER(posOptions.my);
            if (elem.data(NAMESPACE)) {
                if (config.overwrite) {
                    elem.qtip("destroy", true);
                } else if (config.overwrite === FALSE) {
                    return FALSE;
                }
            }
            elem.attr(ATTR_HAS, id);
            if (config.suppress && (title = elem.attr("title"))) {
                elem.removeAttr("title").attr(oldtitle, title).attr("title", "");
            }
            obj = new QTip(elem, config, id, !!attr);
            elem.data(NAMESPACE, obj);
            return obj;
        }
        QTIP = $.fn.qtip = function(options, notation, newValue) {
            var command = ("" + options).toLowerCase(), returned = NULL, args = $.makeArray(arguments).slice(1), event = args[args.length - 1], opts = this[0] ? $.data(this[0], NAMESPACE) : NULL;
            if (!arguments.length && opts || command === "api") {
                return opts;
            } else if ("string" === typeof options) {
                this.each(function() {
                    var api = $.data(this, NAMESPACE);
                    if (!api) {
                        return TRUE;
                    }
                    if (event && event.timeStamp) {
                        api.cache.event = event;
                    }
                    if (notation && (command === "option" || command === "options")) {
                        if (newValue !== undefined || $.isPlainObject(notation)) {
                            api.set(notation, newValue);
                        } else {
                            returned = api.get(notation);
                            return FALSE;
                        }
                    } else if (api[command]) {
                        api[command].apply(api, args);
                    }
                });
                return returned !== NULL ? returned : this;
            } else if ("object" === typeof options || !arguments.length) {
                opts = sanitizeOptions($.extend(TRUE, {}, options));
                return this.each(function(i) {
                    var api, id;
                    id = $.isArray(opts.id) ? opts.id[i] : opts.id;
                    id = !id || id === FALSE || id.length < 1 || QTIP.api[id] ? QTIP.nextid++ : id;
                    api = init($(this), id, opts);
                    if (api === FALSE) {
                        return TRUE;
                    } else {
                        QTIP.api[id] = api;
                    }
                    $.each(PLUGINS, function() {
                        if (this.initialize === "initialize") {
                            this(api);
                        }
                    });
                    api._assignInitialEvents(event);
                });
            }
        };
        $.qtip = QTip;
        QTIP.api = {};
        $.each({
            attr: function(attr, val) {
                if (this.length) {
                    var self = this[0], title = "title", api = $.data(self, "qtip");
                    if (attr === title && api && "object" === typeof api && api.options.suppress) {
                        if (arguments.length < 2) {
                            return $.attr(self, oldtitle);
                        }
                        if (api && api.options.content.attr === title && api.cache.attr) {
                            api.set("content.text", val);
                        }
                        return this.attr(oldtitle, val);
                    }
                }
                return $.fn["attr" + replaceSuffix].apply(this, arguments);
            },
            clone: function(keepData) {
                var titles = $([]), title = "title", elems = $.fn["clone" + replaceSuffix].apply(this, arguments);
                if (!keepData) {
                    elems.filter("[" + oldtitle + "]").attr("title", function() {
                        return $.attr(this, oldtitle);
                    }).removeAttr(oldtitle);
                }
                return elems;
            }
        }, function(name, func) {
            if (!func || $.fn[name + replaceSuffix]) {
                return TRUE;
            }
            var old = $.fn[name + replaceSuffix] = $.fn[name];
            $.fn[name] = function() {
                return func.apply(this, arguments) || old.apply(this, arguments);
            };
        });
        if (!$.ui) {
            $["cleanData" + replaceSuffix] = $.cleanData;
            $.cleanData = function(elems) {
                for (var i = 0, elem; (elem = $(elems[i])).length; i++) {
                    if (elem.attr(ATTR_HAS)) {
                        try {
                            elem.triggerHandler("removeqtip");
                        } catch (e) {}
                    }
                }
                $["cleanData" + replaceSuffix].apply(this, arguments);
            };
        }
        QTIP.version = "2.2.1";
        QTIP.nextid = 0;
        QTIP.inactiveEvents = INACTIVE_EVENTS;
        QTIP.zindex = 15e3;
        QTIP.defaults = {
            prerender: FALSE,
            id: FALSE,
            overwrite: TRUE,
            suppress: TRUE,
            content: {
                text: TRUE,
                attr: "title",
                title: FALSE,
                button: FALSE
            },
            position: {
                my: "top left",
                at: "bottom right",
                target: FALSE,
                container: FALSE,
                viewport: FALSE,
                adjust: {
                    x: 0,
                    y: 0,
                    mouse: TRUE,
                    scroll: TRUE,
                    resize: TRUE,
                    method: "flipinvert flipinvert"
                },
                effect: function(api, pos, viewport) {
                    $(this).animate(pos, {
                        duration: 200,
                        queue: FALSE
                    });
                }
            },
            show: {
                target: FALSE,
                event: "mouseenter",
                effect: TRUE,
                delay: 90,
                solo: FALSE,
                ready: FALSE,
                autofocus: FALSE
            },
            hide: {
                target: FALSE,
                event: "mouseleave",
                effect: TRUE,
                delay: 0,
                fixed: FALSE,
                inactive: FALSE,
                leave: "window",
                distance: FALSE
            },
            style: {
                classes: "",
                widget: FALSE,
                width: FALSE,
                height: FALSE,
                def: TRUE
            },
            events: {
                render: NULL,
                move: NULL,
                show: NULL,
                hide: NULL,
                toggle: NULL,
                visible: NULL,
                hidden: NULL,
                focus: NULL,
                blur: NULL
            }
        };
        PLUGINS.viewport = function(api, position, posOptions, targetWidth, targetHeight, elemWidth, elemHeight) {
            var target = posOptions.target, tooltip = api.elements.tooltip, my = posOptions.my, at = posOptions.at, adjust = posOptions.adjust, method = adjust.method.split(" "), methodX = method[0], methodY = method[1] || method[0], viewport = posOptions.viewport, container = posOptions.container, cache = api.cache, adjusted = {
                left: 0,
                top: 0
            }, fixed, newMy, containerOffset, containerStatic, viewportWidth, viewportHeight, viewportScroll, viewportOffset;
            if (!viewport.jquery || target[0] === window || target[0] === document.body || adjust.method === "none") {
                return adjusted;
            }
            containerOffset = container.offset() || adjusted;
            containerStatic = container.css("position") === "static";
            fixed = tooltip.css("position") === "fixed";
            viewportWidth = viewport[0] === window ? viewport.width() : viewport.outerWidth(FALSE);
            viewportHeight = viewport[0] === window ? viewport.height() : viewport.outerHeight(FALSE);
            viewportScroll = {
                left: fixed ? 0 : viewport.scrollLeft(),
                top: fixed ? 0 : viewport.scrollTop()
            };
            viewportOffset = viewport.offset() || adjusted;
            function calculate(side, otherSide, type, adjust, side1, side2, lengthName, targetLength, elemLength) {
                var initialPos = position[side1], mySide = my[side], atSide = at[side], isShift = type === SHIFT, myLength = mySide === side1 ? elemLength : mySide === side2 ? -elemLength : -elemLength / 2, atLength = atSide === side1 ? targetLength : atSide === side2 ? -targetLength : -targetLength / 2, sideOffset = viewportScroll[side1] + viewportOffset[side1] - (containerStatic ? 0 : containerOffset[side1]), overflow1 = sideOffset - initialPos, overflow2 = initialPos + elemLength - (lengthName === WIDTH ? viewportWidth : viewportHeight) - sideOffset, offset = myLength - (my.precedance === side || mySide === my[otherSide] ? atLength : 0) - (atSide === CENTER ? targetLength / 2 : 0);
                if (isShift) {
                    offset = (mySide === side1 ? 1 : -1) * myLength;
                    position[side1] += overflow1 > 0 ? overflow1 : overflow2 > 0 ? -overflow2 : 0;
                    position[side1] = Math.max(-containerOffset[side1] + viewportOffset[side1], initialPos - offset, Math.min(Math.max(-containerOffset[side1] + viewportOffset[side1] + (lengthName === WIDTH ? viewportWidth : viewportHeight), initialPos + offset), position[side1], mySide === "center" ? initialPos - myLength : 1e9));
                } else {
                    adjust *= type === FLIPINVERT ? 2 : 0;
                    if (overflow1 > 0 && (mySide !== side1 || overflow2 > 0)) {
                        position[side1] -= offset + adjust;
                        newMy.invert(side, side1);
                    } else if (overflow2 > 0 && (mySide !== side2 || overflow1 > 0)) {
                        position[side1] -= (mySide === CENTER ? -offset : offset) + adjust;
                        newMy.invert(side, side2);
                    }
                    if (position[side1] < viewportScroll && -position[side1] > overflow2) {
                        position[side1] = initialPos;
                        newMy = my.clone();
                    }
                }
                return position[side1] - initialPos;
            }
            if (methodX !== "shift" || methodY !== "shift") {
                newMy = my.clone();
            }
            adjusted = {
                left: methodX !== "none" ? calculate(X, Y, methodX, adjust.x, LEFT, RIGHT, WIDTH, targetWidth, elemWidth) : 0,
                top: methodY !== "none" ? calculate(Y, X, methodY, adjust.y, TOP, BOTTOM, HEIGHT, targetHeight, elemHeight) : 0,
                my: newMy
            };
            return adjusted;
        };
    });
})(window, document);

(function($) {
    "use strict";
    $.fn.serializeJSON = function(options) {
        var serializedObject, formAsArray, keys, value, f, opts;
        f = $.serializeJSON;
        formAsArray = this.serializeArray();
        opts = f.optsWithDefaults(options);
        serializedObject = {};
        $.each(formAsArray, function(i, input) {
            keys = f.splitInputNameIntoKeysArray(input.name);
            value = f.parseValue(input.value, opts);
            if (opts.parseWithFunction) value = opts.parseWithFunction(value);
            f.deepSet(serializedObject, keys, value, opts);
        });
        return serializedObject;
    };
    $.serializeJSON = {
        defaultOptions: {
            parseNumbers: false,
            parseBooleans: false,
            parseNulls: false,
            parseAll: false,
            parseWithFunction: null,
            useIntKeysAsArrayIndex: false
        },
        optsWithDefaults: function(options) {
            var f, parseAll;
            if (options == null) options = {};
            f = $.serializeJSON;
            parseAll = f.optWithDefaults("parseAll", options);
            return {
                parseNumbers: parseAll || f.optWithDefaults("parseNumbers", options),
                parseBooleans: parseAll || f.optWithDefaults("parseBooleans", options),
                parseNulls: parseAll || f.optWithDefaults("parseNulls", options),
                parseWithFunction: f.optWithDefaults("parseWithFunction", options),
                useIntKeysAsArrayIndex: f.optWithDefaults("useIntKeysAsArrayIndex", options)
            };
        },
        optWithDefaults: function(key, options) {
            return options[key] !== false && (options[key] || $.serializeJSON.defaultOptions[key]);
        },
        parseValue: function(str, opts) {
            var value, f;
            f = $.serializeJSON;
            if (opts.parseNumbers && f.isNumeric(str)) return Number(str);
            if (opts.parseBooleans && (str === "true" || str === "false")) return str === "true";
            if (opts.parseNulls && str == "null") return null;
            return str;
        },
        isObject: function(obj) {
            return obj === Object(obj);
        },
        isUndefined: function(obj) {
            return obj === void 0;
        },
        isValidArrayIndex: function(val) {
            return /^[0-9]+$/.test(String(val));
        },
        isNumeric: function(obj) {
            return obj - parseFloat(obj) >= 0;
        },
        splitInputNameIntoKeysArray: function(name) {
            var keys, last, f;
            f = $.serializeJSON;
            if (f.isUndefined(name)) {
                throw new Error("ArgumentError: param 'name' expected to be a string, found undefined");
            }
            keys = $.map(name.split("["), function(key) {
                last = key[key.length - 1];
                return last === "]" ? key.substring(0, key.length - 1) : key;
            });
            if (keys[0] === "") {
                keys.shift();
            }
            return keys;
        },
        deepSet: function(o, keys, value, opts) {
            var key, nextKey, tail, lastIdx, lastVal, f;
            if (opts == null) opts = {};
            f = $.serializeJSON;
            if (f.isUndefined(o)) {
                throw new Error("ArgumentError: param 'o' expected to be an object or array, found undefined");
            }
            if (!keys || keys.length === 0) {
                throw new Error("ArgumentError: param 'keys' expected to be an array with least one element");
            }
            key = keys[0];
            if (keys.length === 1) {
                if (key === "") {
                    o.push(value);
                } else {
                    o[key] = value;
                }
            } else {
                nextKey = keys[1];
                if (key === "") {
                    lastIdx = o.length - 1;
                    lastVal = o[lastIdx];
                    if (f.isObject(lastVal) && (f.isUndefined(lastVal[nextKey]) || keys.length > 2)) {
                        key = lastIdx;
                    } else {
                        key = lastIdx + 1;
                    }
                }
                if (f.isUndefined(o[key])) {
                    if (nextKey === "") {
                        o[key] = [];
                    } else if (opts.useIntKeysAsArrayIndex && f.isValidArrayIndex(nextKey)) {
                        o[key] = [];
                    } else {
                        o[key] = {};
                    }
                }
                tail = keys.slice(1);
                f.deepSet(o[key], tail, value, opts);
            }
        }
    };
})(window.jQuery || window.Zepto || window.$);

(function($) {
    var $w = $(window);
    $.fn.visible = function(partial, hidden, direction) {
        if (this.length < 1) return;
        var $t = this.length > 1 ? this.eq(0) : this, t = $t.get(0), vpWidth = $w.width(), vpHeight = $w.height(), direction = direction ? direction : "both", clientSize = hidden === true ? t.offsetWidth * t.offsetHeight : true;
        if (typeof t.getBoundingClientRect === "function") {
            var rec = t.getBoundingClientRect(), tViz = rec.top >= 0 && rec.top < vpHeight, bViz = rec.bottom > 0 && rec.bottom <= vpHeight, mVis = rec.top < 0 && rec.bottom > vpHeight, lViz = rec.left >= 0 && rec.left < vpWidth, rViz = rec.right > 0 && rec.right <= vpWidth, hmVis = rec.left < 0 && rec.right > vpWidth, vVisible = partial ? tViz || bViz || mVis : tViz && bViz, hVisible = partial ? lViz || lViz || hmVis : lViz && rViz;
            if (direction === "both") return clientSize && vVisible && hVisible; else if (direction === "vertical") return clientSize && vVisible; else if (direction === "horizontal") return clientSize && hVisible;
        } else {
            var viewTop = $w.scrollTop(), viewBottom = viewTop + vpHeight, viewLeft = $w.scrollLeft(), viewRight = viewLeft + vpWidth, offset = $t.offset(), _top = offset.top, _bottom = _top + $t.height(), _left = offset.left, _right = _left + $t.width(), compareTop = partial === true ? _bottom : _top, compareBottom = partial === true ? _top : _bottom, compareLeft = partial === true ? _right : _left, compareRight = partial === true ? _left : _right;
            if (direction === "both") return !!clientSize && (compareBottom <= viewBottom && compareTop >= viewTop || partial === true && compareTop > ViewBottom && CompareBottom < viewTop) && (compareRight <= viewRight && compareLeft >= viewLeft || partial === true && compareLeft > ViewRight && CompareRight < viewLeft); else if (direction === "vertical") return !!clientSize && (compareBottom <= viewBottom && compareTop >= viewTop || partial === true && compareTop > ViewBottom && CompareBottom < viewTop); else if (direction === "horizontal") return !!clientSize && (compareRight <= viewRight && compareLeft >= viewLeft || partial === true && compareLeft > ViewRight && CompareRight < viewLeft);
        }
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