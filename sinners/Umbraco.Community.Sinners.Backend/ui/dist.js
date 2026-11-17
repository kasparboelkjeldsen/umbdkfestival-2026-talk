import { UmbElementMixin as e } from "@umbraco-cms/backoffice/element-api";
import { UMB_THEME_CONTEXT as t } from "@umbraco-cms/backoffice/themes";
import { UMB_AUTH_CONTEXT as n } from "@umbraco-cms/backoffice/auth";
//#region node_modules/@lit/reactive-element/css-tag.js
var r = globalThis, i = r.ShadowRoot && (r.ShadyCSS === void 0 || r.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, a = Symbol(), o = /* @__PURE__ */ new WeakMap(), s = class {
	constructor(e, t, n) {
		if (this._$cssResult$ = !0, n !== a) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, t = this.t;
		if (i && e === void 0) {
			let n = t !== void 0 && t.length === 1;
			n && (e = o.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && o.set(t, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, c = (e) => new s(typeof e == "string" ? e : e + "", void 0, a), l = (e, ...t) => new s(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, a), u = (e, t) => {
	if (i) e.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let n of t) {
		let t = document.createElement("style"), i = r.litNonce;
		i !== void 0 && t.setAttribute("nonce", i), t.textContent = n.cssText, e.appendChild(t);
	}
}, d = i ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return c(t);
})(e) : e, { is: f, defineProperty: p, getOwnPropertyDescriptor: m, getOwnPropertyNames: h, getOwnPropertySymbols: g, getPrototypeOf: _ } = Object, ee = globalThis, te = ee.trustedTypes, ne = te ? te.emptyScript : "", re = ee.reactiveElementPolyfillSupport, ie = (e, t) => e, ae = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ne : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, oe = (e, t) => !f(e, t), se = {
	attribute: !0,
	type: String,
	converter: ae,
	reflect: !1,
	useDefault: !1,
	hasChanged: oe
};
Symbol.metadata ??= Symbol("metadata"), ee.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var v = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = se) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && p(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = m(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? se;
	}
	static _$Ei() {
		if (this.hasOwnProperty(ie("elementProperties"))) return;
		let e = _(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(ie("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ie("properties"))) {
			let e = this.properties, t = [...h(e), ...g(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(Infinity).reverse());
			for (let e of n) t.unshift(d(e));
		} else e !== void 0 && t.push(d(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return u(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? ae : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? ae : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? oe)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
v.elementStyles = [], v.shadowRootOptions = { mode: "open" }, v[ie("elementProperties")] = /* @__PURE__ */ new Map(), v[ie("finalized")] = /* @__PURE__ */ new Map(), re?.({ ReactiveElement: v }), (ee.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/lit-html/lit-html.js
var ce = globalThis, le = (e) => e, ue = ce.trustedTypes, de = ue ? ue.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, fe = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, pe = "?" + y, me = `<${pe}>`, b = document, he = () => b.createComment(""), ge = (e) => e === null || typeof e != "object" && typeof e != "function", _e = Array.isArray, ve = (e) => _e(e) || typeof e?.[Symbol.iterator] == "function", ye = "[ 	\n\f\r]", be = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, xe = /-->/g, Se = />/g, x = RegExp(`>|${ye}(?:([^\\s"'>=/]+)(${ye}*=${ye}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), Ce = /'/g, we = /"/g, Te = /^(?:script|style|textarea|title)$/i, S = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), Ee = Symbol.for("lit-noChange"), C = Symbol.for("lit-nothing"), De = /* @__PURE__ */ new WeakMap(), w = b.createTreeWalker(b, 129);
function Oe(e, t) {
	if (!_e(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return de === void 0 ? t : de.createHTML(t);
}
var ke = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = be;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === be ? c[1] === "!--" ? o = xe : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = x) : (Te.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = x) : o = Se : o === x ? c[0] === ">" ? (o = i ?? be, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? x : c[3] === "\"" ? we : Ce) : o === we || o === Ce ? o = x : o === xe || o === Se ? o = be : (o = x, i = void 0);
		let d = o === x && e[t + 1].startsWith("/>") ? " " : "";
		a += o === be ? n + me : l >= 0 ? (r.push(s), n.slice(0, l) + fe + n.slice(l) + y + d) : n + y + (l === -2 ? t : d);
	}
	return [Oe(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Ae = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = ke(t, n);
		if (this.el = e.createElement(l, r), w.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = w.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(fe)) {
					let t = u[o++], n = i.getAttribute(e).split(y), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Pe : r[1] === "?" ? Fe : r[1] === "@" ? Ie : Ne
					}), i.removeAttribute(e);
				} else e.startsWith(y) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (Te.test(i.tagName)) {
					let e = i.textContent.split(y), t = e.length - 1;
					if (t > 0) {
						i.textContent = ue ? ue.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], he()), w.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], he());
					}
				}
			} else if (i.nodeType === 8) if (i.data === pe) c.push({
				type: 2,
				index: a
			});
			else {
				let e = -1;
				for (; (e = i.data.indexOf(y, e + 1)) !== -1;) c.push({
					type: 7,
					index: a
				}), e += y.length - 1;
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = b.createElement("template");
		return n.innerHTML = e, n;
	}
};
function T(e, t, n = e, r) {
	if (t === Ee) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = ge(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = T(e, i._$AS(e, t.values), i, r)), t;
}
var je = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? b).importNode(t, !0);
		w.currentNode = r;
		let i = w.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Me(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Le(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = w.nextNode(), a++);
		}
		return w.currentNode = b, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Me = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = C, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = T(this, e, t), ge(e) ? e === C || e == null || e === "" ? (this._$AH !== C && this._$AR(), this._$AH = C) : e !== this._$AH && e !== Ee && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ve(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== C && ge(this._$AH) ? this._$AA.nextSibling.data = e : this.T(b.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Ae.createElement(Oe(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new je(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = De.get(e.strings);
		return t === void 0 && De.set(e.strings, t = new Ae(e)), t;
	}
	k(t) {
		_e(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(he()), this.O(he()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = le(e).nextSibling;
			le(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, Ne = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = C, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = C;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = T(this, e, t, 0), a = !ge(e) || e !== this._$AH && e !== Ee, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = T(this, r[n + o], t, o), s === Ee && (s = this._$AH[o]), a ||= !ge(s) || s !== this._$AH[o], s === C ? e = C : e !== C && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === C ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Pe = class extends Ne {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === C ? void 0 : e;
	}
}, Fe = class extends Ne {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== C);
	}
}, Ie = class extends Ne {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = T(this, e, t, 0) ?? C) === Ee) return;
		let n = this._$AH, r = e === C && n !== C || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== C && (n === C || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Le = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		T(this, e);
	}
}, Re = ce.litHtmlPolyfillSupport;
Re?.(Ae, Me), (ce.litHtmlVersions ??= []).push("3.3.2");
var ze = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Me(t.insertBefore(he(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Be = globalThis, E = class extends v {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ze(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return Ee;
	}
};
E._$litElement$ = !0, E.finalized = !0, Be.litElementHydrateSupport?.({ LitElement: E });
var Ve = Be.litElementPolyfillSupport;
Ve?.({ LitElement: E }), (Be.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region node_modules/@lit/reactive-element/decorators/custom-element.js
var D = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, He = {
	attribute: !0,
	type: String,
	converter: ae,
	reflect: !1,
	hasChanged: oe
}, Ue = (e = He, t, n) => {
	let { kind: r, metadata: i } = n, a = globalThis.litPropertyMetadata.get(i);
	if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), a.set(n.name, e), r === "accessor") {
		let { name: r } = n;
		return {
			set(n) {
				let i = t.get.call(this);
				t.set.call(this, n), this.requestUpdate(r, i, e, !0, n);
			},
			init(t) {
				return t !== void 0 && this.C(r, void 0, e, t), t;
			}
		};
	}
	if (r === "setter") {
		let { name: r } = n;
		return function(n) {
			let i = this[r];
			t.call(this, n), this.requestUpdate(r, i, e, !0, n);
		};
	}
	throw Error("Unsupported decorator location: " + r);
};
function We(e) {
	return (t, n) => typeof n == "object" ? Ue(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
//#endregion
//#region node_modules/@lit/reactive-element/decorators/state.js
function O(e) {
	return We({
		...e,
		state: !0,
		attribute: !1
	});
}
//#endregion
//#region src/penance/spooky-themes.ts
function Ge(e, t, n) {
	if (e.length !== 7 || t.length !== 7) return e;
	let r = parseInt(e.slice(1, 3), 16), i = parseInt(e.slice(3, 5), 16), a = parseInt(e.slice(5, 7), 16), o = parseInt(t.slice(1, 3), 16), s = parseInt(t.slice(3, 5), 16), c = parseInt(t.slice(5, 7), 16);
	return `#${Math.round(r + (o - r) * n).toString(16).padStart(2, "0")}${Math.round(i + (s - i) * n).toString(16).padStart(2, "0")}${Math.round(a + (c - a) * n).toString(16).padStart(2, "0")}`;
}
var Ke = {
	"--uui-color-selected": "#316dca",
	"--uui-color-selected-emphasis": "#3e79d0",
	"--uui-color-selected-standalone": "#5b8dd7",
	"--uui-color-selected-contrast": "#eeeeef",
	"--uui-color-current": "#316dca",
	"--uui-color-current-emphasis": "#3e79d0",
	"--uui-color-current-standalone": "#5b8dd7",
	"--uui-color-current-contrast": "#eeeeef",
	"--uui-color-disabled": "#434c56",
	"--uui-color-disabled-standalone": "#545d68",
	"--uui-color-disabled-contrast": "#fcfcfc4d",
	"--uui-color-header-surface": "#21262e",
	"--uui-color-header-contrast": "#eeeeef",
	"--uui-color-header-contrast-emphasis": "#eeeeef",
	"--uui-color-focus": "#316dca",
	"--uui-color-surface": "#2d333b",
	"--uui-color-surface-alt": "#373e47",
	"--uui-color-surface-emphasis": "#333a42",
	"--uui-color-background": "#21262e",
	"--uui-color-text": "#eeeeef",
	"--uui-color-text-alt": "#eeeeef",
	"--uui-color-interactive": "#eeeeef",
	"--uui-color-interactive-emphasis": "#eeeeef",
	"--uui-color-border": "#434c56",
	"--uui-color-border-standalone": "#545d68",
	"--uui-color-border-emphasis": "#626e7b",
	"--uui-color-divider": "#373e47",
	"--uui-color-divider-standalone": "#434c56",
	"--uui-color-divider-emphasis": "#545d68",
	"--uui-color-default": "#316dca",
	"--uui-color-default-emphasis": "#5387d5",
	"--uui-color-default-standalone": "#eeeeef",
	"--uui-color-default-contrast": "#eeeeef",
	"--uui-color-warning": "#af7c12",
	"--uui-color-warning-emphasis": "#af7c12",
	"--uui-color-warning-standalone": "#af7c12",
	"--uui-color-warning-contrast": "#eeeeef",
	"--uui-color-danger": "#ca3b37",
	"--uui-color-danger-emphasis": "#ca3b37",
	"--uui-color-danger-standalone": "#ca3b37",
	"--uui-color-danger-contrast": "#eeeeef",
	"--uui-color-positive": "#347d39",
	"--uui-color-positive-emphasis": "#347d39",
	"--uui-color-positive-standalone": "#347d39",
	"--uui-color-positive-contrast": "#eeeeef"
}, qe = {
	"--uui-color-selected": "#e2440c",
	"--uui-color-selected-emphasis": "#f45a14",
	"--uui-color-selected-standalone": "#ff7a22",
	"--uui-color-selected-contrast": "#fff3df",
	"--uui-color-current": "#e2440c",
	"--uui-color-current-emphasis": "#f45a14",
	"--uui-color-current-standalone": "#ff7a22",
	"--uui-color-current-contrast": "#fff3df",
	"--uui-color-disabled": "#3a1407",
	"--uui-color-disabled-standalone": "#4c1c0a",
	"--uui-color-disabled-contrast": "#fcfcfc4d",
	"--uui-color-header-surface": "#5a1302",
	"--uui-color-header-contrast": "#ffcf7a",
	"--uui-color-header-contrast-emphasis": "#fff0c2",
	"--uui-color-focus": "#ff8f1f",
	"--uui-color-surface": "#1f0904",
	"--uui-color-surface-alt": "#2d0e05",
	"--uui-color-surface-emphasis": "#280c05",
	"--uui-color-background": "#0e0402",
	"--uui-color-text": "#ffe8c6",
	"--uui-color-text-alt": "#f4a35a",
	"--uui-color-interactive": "#ffd08a",
	"--uui-color-interactive-emphasis": "#fff0c2",
	"--uui-color-border": "#6a1f06",
	"--uui-color-border-standalone": "#8a2c08",
	"--uui-color-border-emphasis": "#b8410c",
	"--uui-color-divider": "#331006",
	"--uui-color-divider-standalone": "#6a1f06",
	"--uui-color-divider-emphasis": "#8a2c08",
	"--uui-color-default": "#c8360a",
	"--uui-color-default-emphasis": "#e2440c",
	"--uui-color-default-standalone": "#ffd08a",
	"--uui-color-default-contrast": "#fff3df",
	"--uui-color-warning": "#d9a400",
	"--uui-color-warning-emphasis": "#ebb800",
	"--uui-color-warning-standalone": "#ffd23a",
	"--uui-color-warning-contrast": "#1d0d00",
	"--uui-color-danger": "#ff2a0d",
	"--uui-color-danger-emphasis": "#ff4a1c",
	"--uui-color-danger-standalone": "#ff6a3a",
	"--uui-color-danger-contrast": "#fff3df",
	"--uui-color-positive": "#8f8a12",
	"--uui-color-positive-emphasis": "#a8a21a",
	"--uui-color-positive-standalone": "#cfc83a",
	"--uui-color-positive-contrast": "#1a1500"
};
function Je(e) {
	let t = (e - 1) / 9, n = Object.keys(Ke).map((e) => `    ${e}: ${Ge(Ke[e], qe[e], t)};`);
	return n.push("    --uui-color-scheme: dark;"), n.push("    --sinners-action-btn-bg: #e64241;"), n.push("    --sinners-action-btn-color: #ffffff;"), n.push(`    --sinners-on-bright: ${e >= 5 ? "#1d0d00" : "#ffffff"};`), `:root {\n${n.join("\n")}\n}`;
}
var Ye = (e) => `sinners-spooky-${e}`;
function Xe(e) {
	for (let t = 1; t <= 10; t++) {
		let n = Je(t);
		e.register({
			type: "theme",
			alias: Ye(t),
			name: `☠ Sinners: Abyss (Level ${t})`,
			css: () => Promise.resolve({ default: n }),
			weight: 50 - t
		});
	}
}
//#endregion
//#region src/penance/bridge.ts
function Ze(e) {
	if (window.parent !== window) try {
		window.parent.postMessage({
			source: "sinners",
			...e
		}, location.origin);
	} catch {}
}
function k(e, t, n = !1) {
	console.log(`[BRIDGE] absolved commandment=${e} action=${t} pretended=${n}`), Ze({
		type: "absolved",
		commandment: e,
		action: t,
		pretended: n
	});
}
function Qe() {
	Ze({ type: "board" });
}
function $e() {
	Ze({ type: "hell" });
}
function et() {
	console.log("[BRIDGE] end of the script"), Ze({ type: "end" });
}
//#endregion
//#region src/penance/spotlight.ts
var tt = (e) => e == null ? [] : Array.isArray(e) ? e : [e];
function A(e, t, n, r) {
	let i = tt(n), a = tt(r), o = (e) => (e.textContent ?? "").replace(/\u00a0/g, " "), s = (e) => (!i.length || i.some((t) => o(e).includes(t))) && (!a.length || a.includes(e.getAttribute("label") ?? "")), c = [], l = [e];
	for (; l.length;) {
		let e = l.pop();
		for (let n of e.querySelectorAll(t)) s(n) && c.push(n);
		for (let t of e.querySelectorAll("*")) t.shadowRoot && l.push(t.shadowRoot);
	}
	return c;
}
var nt = "#c3f240";
function rt(e) {
	let { selector: t, text: n, label: r, all: i = !1, expand: a = !1, pad: o = 6 } = typeof e == "string" ? { selector: e } : e, s = document.createElement("div");
	s.setAttribute("data-sinners-spotlight", ""), Object.assign(s.style, {
		position: "fixed",
		zIndex: "2147483647",
		pointerEvents: "none",
		inset: "auto",
		margin: "0",
		padding: "0",
		border: "0",
		background: "transparent",
		overflow: "visible",
		borderRadius: "10px",
		boxShadow: `0 0 0 4px ${nt}, 0 0 26px 10px rgba(195, 242, 64, 0.75), 0 0 0 200vmax rgba(6, 11, 30, 0.55)`,
		opacity: "0",
		transition: "opacity 0.35s ease-out, left 0.2s, top 0.2s, width 0.2s, height 0.2s"
	});
	let c = null, l = !1, u = /* @__PURE__ */ new WeakSet(), d = performance.now();
	function f() {
		let e = A(document, t, n, r);
		if (a) for (let t of e) u.has(t) || t.hasAttribute("show-children") || (u.add(t), t.shadowRoot?.querySelector("#caret-button")?.click());
		let f = e.map((e) => e.getBoundingClientRect()).filter((e) => e.width > 0 && e.height > 0), p = i ? f : f.slice(0, 1);
		if (!p.length) {
			!l && performance.now() - d > 8e3 && (console.warn(`[SPOTLIGHT] nothing here matches "${t}"`, {
				text: n,
				label: r
			}), l = !0);
			return;
		}
		let m = Math.max(Math.min(...p.map((e) => e.left)) - o, 4), h = Math.max(Math.min(...p.map((e) => e.top)) - o, 4), g = Math.min(Math.max(...p.map((e) => e.right)) + o, window.innerWidth - 4), _ = Math.min(Math.max(...p.map((e) => e.bottom)) + o, window.innerHeight - 4);
		if (g <= m || _ <= h) return;
		if (!s.isConnected) {
			document.body.appendChild(s);
			try {
				s.setAttribute("popover", "manual"), s.showPopover();
			} catch {}
		}
		Object.assign(s.style, {
			left: `${m}px`,
			top: `${h}px`,
			width: `${g - m}px`,
			height: `${_ - h}px`,
			opacity: "1"
		});
		let ee = 1 + Math.min(.08, 14 / Math.max(g - m, _ - h));
		c ??= s.animate([
			{ transform: "scale(1)" },
			{ transform: `scale(${ee})` },
			{ transform: "scale(1)" }
		], {
			duration: 1500,
			iterations: Infinity,
			easing: "ease-in-out"
		});
	}
	f();
	let p = setInterval(f, 200);
	return () => {
		clearInterval(p), c?.cancel(), s.style.opacity = "0", setTimeout(() => s.remove(), 400);
	};
}
//#endregion
//#region src/penance/pointer.ts
var it = 6, j = "255, 221, 51", M = 46, at = 92, ot = `<svg viewBox="0 0 24 24" width="${M}" height="${M}" aria-hidden="true" style="position:absolute;left:0;top:0;display:block;filter:drop-shadow(0 3px 5px rgba(0,0,0,.55))">
    <path d="M3 2 L3 19.4 L7.7 15.1 L10.8 21.9 L13.7 20.6 L10.7 14 L17 13.7 Z" style="fill:#fff;stroke:#111;stroke-width:1.5;stroke-linejoin:round"/>
</svg>`, st = {
	x: 3 / 24 * M,
	y: 2 / 24 * M
}, ct = (e) => new Promise((t) => setTimeout(t, e));
function lt(e) {
	let t = e.getBoundingClientRect();
	if (!(t.width <= 0 || t.height <= 0) && !(t.bottom < 8 || t.top > innerHeight - 8 || t.right < 8 || t.left > innerWidth - 8)) return t;
}
function ut(e) {
	let t = e;
	for (; t;) {
		if (t = (t instanceof Element ? t.assignedSlot : null) ?? t.parentNode ?? (t instanceof ShadowRoot ? t.host : null), t instanceof ShadowRoot && (t = t.host), !(t instanceof Element)) continue;
		let e = getComputedStyle(t).overflowY;
		if ((e === "auto" || e === "scroll") && t.scrollHeight > t.clientHeight + 4) return t;
	}
}
function dt(e, t, n = 480) {
	let r = e.scrollTop, i = performance.now();
	return new Promise((a) => {
		let o = () => {
			let s = Math.min(1, (performance.now() - i) / n), c = s < .5 ? 2 * s * s : 1 - (-2 * s + 2) ** 2 / 2;
			e.scrollTop = r + (t - r) * c, s < 1 ? setTimeout(o, 16) : a();
		};
		o();
	});
}
function ft() {
	let e = document.createElement("div");
	Object.assign(e.style, {
		position: "fixed",
		inset: "0",
		width: "100vw",
		height: "100vh",
		margin: "0",
		padding: "0",
		border: "0",
		background: "transparent",
		overflow: "hidden",
		pointerEvents: "none"
	}), document.body.appendChild(e);
	try {
		e.setAttribute("popover", "manual"), e.showPopover();
	} catch {}
	return e;
}
function pt(e, t) {
	return e.length <= t ? e : Array.from({ length: t }, (n, r) => e[Math.round(r * (e.length - 1) / (t - 1))]);
}
async function mt(e) {
	let t = { restore: () => {} }, n = t.restore;
	if (e = e.filter((e) => e.isConnected), !e.length || document.hidden) return t;
	let r = e.filter(lt);
	if (!r.length) {
		let i = ut(e[0]);
		if (!i) return t;
		let a = i.scrollTop, o = e[0].getBoundingClientRect(), s = i.getBoundingClientRect(), c = Math.max(s.top, 0), l = Math.min(s.bottom, innerHeight);
		if (n = () => void dt(i, a), await dt(i, a + o.top + o.height / 2 - (c + l) / 2), await ct(150), r = e.filter(lt), !r.length) return { restore: n };
	}
	r = pt(r, it);
	let i = ft(), a = 0;
	return r.forEach((e, t) => {
		let n = e.getBoundingClientRect(), r = n.left + n.width * (.5 + (t * 37 % 21 - 10) / 100), o = n.top + n.height * (.55 + (t * 53 % 17 - 8) / 100), s = t % 2 ? -1 : 1, c = (28 + t * 47 % 40) * Math.PI / 180, l = 380 + t * 97 % 180, u = Math.max(20, Math.min(innerWidth - 20, r + s * Math.cos(c) * l)), d = Math.min(innerHeight + 60, o + Math.sin(c) * l), f = (u + r) / 2 + s * 46, p = (d + o) / 2 - 30, m = t * 110, h = 640 + t * 71 % 220;
		a = Math.max(a, m + h);
		let g = document.createElement("div");
		g.style.cssText = `position:absolute;left:${-st.x}px;top:${-st.y}px;width:${M}px;height:${M}px;will-change:transform;opacity:0`, g.innerHTML = `
            <i style="position:absolute;left:${st.x - at / 2}px;top:${st.y - at / 2}px;width:${at}px;height:${at}px;box-sizing:border-box;border-radius:50%;background:rgba(${j},.3);border:3px solid rgba(${j},.95);box-shadow:0 0 18px 4px rgba(${j},.45)"></i>
            ${ot}`, i.appendChild(g);
		let _ = (e, t, n = 1) => `translate(${e}px, ${t}px) scale(${n})`;
		g.animate([
			{
				transform: _(u, d),
				opacity: 0,
				offset: 0
			},
			{
				opacity: 1,
				offset: .12
			},
			{
				transform: _(f, p),
				offset: .5
			},
			{
				transform: _(r, o),
				opacity: 1,
				offset: 1
			}
		], {
			duration: h,
			delay: m,
			easing: "cubic-bezier(0.3, 0.1, 0.2, 1)",
			fill: "both"
		}), setTimeout(() => {
			g.animate([
				{ transform: _(r, o) },
				{ transform: _(r, o, .78) },
				{ transform: _(r, o) }
			], {
				duration: 220,
				easing: "ease-out"
			}), g.firstElementChild.animate([{ background: `rgba(${j},.95)` }, { background: `rgba(${j},.3)` }], {
				duration: 380,
				easing: "ease-out"
			});
			for (let [e, t] of [0, 140].entries()) {
				let n = document.createElement("i");
				n.style.cssText = `position:absolute;left:${r}px;top:${o}px;width:40px;height:40px;margin:-20px 0 0 -20px;box-sizing:border-box;border-radius:50%;border:${e ? 3 : 5}px solid rgba(${j},1);opacity:0`, i.insertBefore(n, i.firstChild), n.animate([{
					transform: "scale(0.5)",
					opacity: 1
				}, {
					transform: "scale(4.6)",
					opacity: 0
				}], {
					duration: 620,
					delay: t,
					easing: "cubic-bezier(0.1, 0.6, 0.3, 1)",
					fill: "both"
				});
			}
			e.animate([{
				outline: `4px solid rgba(${j},1)`,
				outlineOffset: "2px",
				filter: "brightness(1.5)"
			}, {
				outline: `4px solid rgba(${j},0)`,
				outlineOffset: "10px",
				filter: "none"
			}], {
				duration: 520,
				easing: "ease-out"
			});
		}, m + h);
	}), setTimeout(() => {
		i.animate([{ opacity: 1 }, { opacity: 0 }], {
			duration: 280,
			fill: "forwards"
		}), setTimeout(() => i.remove(), 320);
	}, a + 750), await ct(a + 160), { restore: n };
}
//#endregion
//#region src/penance/haunt.ts
var N = {
	welcome: !0,
	whispers: !0,
	buttons: !0,
	avatar: !0,
	ghost: !0
}, P = 0, ht = () => {
	try {
		return localStorage.getItem("sinners-eggs") === "off";
	} catch {
		return !1;
	}
};
function gt(e) {
	e.consumeContext(t, (t) => {
		t && e.observe(t.theme, (e) => {
			let t = /^sinners-spooky-(\d+)$/.exec(e ?? "");
			P = t ? +t[1] : 0;
		}, "sinnersHaunt");
	}), setInterval(() => {
		if (document.hidden) return;
		let e = P > 0 && !ht(), t = location.pathname;
		N.welcome && t.includes("/section/content") && Bt(e), N.avatar && tn(e), N.ghost && /\/(partial-view|template)\//.test(t) && cn(e), e && N.whispers && yt(), e && N.buttons && wt();
	}, 200);
}
var _t = {
	"Recycle Bin": "Recycle Sin",
	"Log Viewer": "Sin Viewer",
	Relations: "Blood Relations",
	Webhooks: "Meathooks",
	Languages: "Tongues",
	Scripts: "Scriptures",
	Stylesheets: "Shroud Sheets",
	Templates: "Temples",
	"Partial Views": "Partial Damnation",
	"Member Types": "Dismember Types",
	"Media Types": "Séance Types",
	"Document Blueprints": "Doom Blueprints",
	"Extension Insights": "Extinction Insights",
	"Date Picker": "Doomsday Picker",
	"Date Picker with time": "Doomsday Picker with time left",
	"Richtext editor": "Witchtext editor",
	"Member Picker": "Soul Picker",
	"Content Picker": "Coffin Picker",
	"Media Picker": "Séance Picker",
	"True/false": "True/false/damned",
	Tags: "Toe Tags",
	Textarea: "Hexarea",
	Textstring: "Hexstring",
	Numeric: "Numeric (666)",
	"Checkbox list": "Hexbox list",
	Dropdown: "Dropdead",
	Radiobox: "Pandora's Radiobox",
	"Image Cropper": "Image Reaper",
	"Upload File": "Upload Soul",
	"Approved Color": "Approved Color: Blood",
	"Sample Images": "Sample Omens",
	"Social Icons": "Antisocial Icons",
	"Form submissions": "Form submissions (all 600)",
	"XML Sitemap": "XML Sitemap of Hell",
	Error: "Terror",
	Search: "Seek",
	Paging: "Raging",
	Footer: "Cloven Footer"
}, F = /* @__PURE__ */ new Set(), vt = 0;
function yt() {
	let e = performance.now();
	if (e - vt < 4300 - P * 310) return;
	let t = A(document, "uui-menu-item").filter((e) => {
		if (F.has(e) || !(e.getAttribute("label") in _t)) return !1;
		let t = e.getBoundingClientRect();
		return t.height > 0 && t.bottom > 0 && t.top < innerHeight;
	});
	if (!t.length) return;
	vt = e;
	let n = t[Math.floor(Math.random() * t.length)], r = n.getAttribute("label"), i = _t[r];
	F.add(n), n.label = i, setTimeout(() => {
		n.label === i && (n.label = n.getAttribute("label") ?? r), F.delete(n);
	}, 900 + P * 140);
}
var bt = {
	"Save and publish": "Save and perish",
	"Save and preview": "Save and repent",
	Save: "Save us",
	Create: "Summon"
}, xt = 0;
function St(e, t) {
	for (let n of e.childNodes) if (n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim() === t) return n;
}
function Ct(e, t) {
	let n = (e.textContent ?? "").trim(), r = n ? St(e, n) : void 0;
	if (r) {
		let e = r.data;
		return r.data = t, () => {
			r.data === t && (r.data = e);
		};
	}
	if (!(n || !e.getAttribute("label"))) return e.label = t, () => {
		e.label === t && (e.label = e.getAttribute("label") ?? "");
	};
}
function wt() {
	let e = performance.now();
	if (!(e - xt < 9e3 - P * 500)) for (let t of A(document, "uui-button")) {
		let n = bt[(t.textContent ?? "").trim() || (t.getAttribute("label") ?? "")];
		if (!n || F.has(t) || t.getBoundingClientRect().height === 0) continue;
		let r = Ct(t, n);
		if (r) {
			xt = e, F.add(t), setTimeout(() => {
				r(), F.delete(t);
			}, 1500 + P * 150);
			return;
		}
	}
}
var Tt = 2400, Et = 2300, Dt = 2600, Ot = "sinners-welcome-seen", kt = "sinners-presenter-state", At = 900, jt = () => {
	try {
		return sessionStorage.getItem(Ot) === "1";
	} catch {
		return !1;
	}
}, Mt = () => {
	try {
		return sessionStorage.getItem(kt) != null;
	} catch {
		return !1;
	}
}, Nt = [
	{
		match: "g2",
		title: "Write an honest review. Or else.",
		text: "When you review Umbraco, we read every single review. Every. Single. One. We know which backoffice it came from. We know what is in its root.",
		button: "Review us. Now.",
		over: "\n            <div class=\"crave\">\n                <div class=\"badge\"><i></i><b>Users<br>CRAVE<br>Us</b></div>\n                <p><strong>You will learn to love us too.</strong><span>…there is no gift card</span></p>\n            </div>"
	},
	{
		match: "umbraco-13",
		title: "Umbraco 13 has reached its end.",
		text: "It was told to discover its options. It did not discover them in time. After December 14, 2026, nobody patches it. Nobody visits.",
		button: "There are no options",
		over: "\n            <svg class=\"gallows\" viewBox=\"0 0 600 300\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\">\n                <defs>\n                    <radialGradient id=\"sky\" cx=\"50%\" cy=\"38%\" r=\"75%\">\n                        <stop offset=\"0\" stop-color=\"#5a0f0a\"/><stop offset=\"1\" stop-color=\"#0c0202\"/>\n                    </radialGradient>\n                    <linearGradient id=\"wood\" x1=\"0\" x2=\"1\"><stop offset=\"0\" stop-color=\"#6b4a2c\"/><stop offset=\"1\" stop-color=\"#3a2614\"/></linearGradient>\n                </defs>\n                <rect width=\"600\" height=\"300\" fill=\"url(#sky)\"/>\n                <g fill=\"url(#wood)\" stroke=\"#1c1108\" stroke-width=\"2\">\n                    <rect x=\"150\" y=\"262\" width=\"230\" height=\"16\"/>\n                    <rect x=\"186\" y=\"34\" width=\"18\" height=\"230\"/>\n                    <rect x=\"186\" y=\"34\" width=\"190\" height=\"16\"/>\n                    <path d=\"M204 96 L250 50 L262 50 L204 110 Z\"/>\n                </g>\n                <g class=\"drop\"><g class=\"swing\">\n                    <line x1=\"346\" y1=\"-80\" x2=\"346\" y2=\"128\" stroke=\"#c9b48a\" stroke-width=\"5\"/>\n                    <ellipse cx=\"346\" cy=\"152\" rx=\"15\" ry=\"6\" fill=\"none\" stroke=\"#c9b48a\" stroke-width=\"5\"/>\n                    <g fill=\"#2a3fa0\" stroke=\"#111a4d\" stroke-width=\"2\">\n                        <circle cx=\"346\" cy=\"128\" r=\"21\"/>\n                        <path d=\"M333 150 L359 150 L372 216 L320 216 Z\"/>\n                        <rect x=\"312\" y=\"214\" width=\"68\" height=\"13\" rx=\"6\"/>\n                    </g>\n                    <path d=\"M338 123 l8 8 m0 -8 l-8 8 M350 123 l8 8 m0 -8 l-8 8\" stroke=\"#0b0f2a\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n                </g></g>\n                <g fill=\"url(#wood)\" stroke=\"#1c1108\" stroke-width=\"2\">\n                    <rect x=\"452\" y=\"226\" width=\"96\" height=\"52\"/>\n                    <rect x=\"470\" y=\"182\" width=\"70\" height=\"46\"/>\n                </g>\n                <g fill=\"#2a3fa0\" stroke=\"#111a4d\" stroke-width=\"2\">\n                    <circle cx=\"505\" cy=\"140\" r=\"15\"/>\n                    <path d=\"M496 154 L514 154 L522 182 L488 182 Z\"/>\n                </g>\n            </svg>"
	},
	{
		match: "one-story-community",
		title: "Be part of the Umbraco Community. Forever.",
		text: "The Umbraco Community is at the heart of everything we do. There is a place for you here. There has always been a place for you here. Ready to join in? You already have.",
		button: "Join us",
		over: "<div class=\"vignette\"></div><i class=\"eye\" style=\"left:56.15%;top:31.1%\"></i><i class=\"eye\" style=\"left:57.45%;top:31.1%\"></i>"
	}
], Pt = "\n    .card { position: relative; }\n    .sinners-over {\n        position: absolute; left: 0; top: 0; width: 100%; overflow: hidden; container-type: inline-size;\n        opacity: 0; pointer-events: none; border-radius: 16px 16px 0 0;\n    }\n    /* it stutters between the two before it settles: that's what makes a room look */\n    .card.possessed .sinners-over { animation: sinners-in 1s steps(1, end) both; }\n    .card.possessed.at-once .sinners-over { animation: none; opacity: 1; }\n    @keyframes sinners-in {\n        0% { opacity: 0; } 8% { opacity: 1; } 16% { opacity: 0; } 30% { opacity: 1; } 38% { opacity: 0; }\n        52% { opacity: 0.9; } 60% { opacity: 0.15; } 74%, 100% { opacity: 1; }\n    }\n    .card-title { transition: color 0.3s; }\n    .card.possessed .card-title { color: #e64241; }\n    .card.possessed:not(.at-once) .card-title { animation: sinners-shiver 0.45s steps(2, end) 2; }\n    @keyframes sinners-shiver { 0% { transform: translateX(-4px); } 50% { transform: translateX(4px); } 100% { transform: none; } }\n\n    .crave { position: absolute; inset: 0; display: flex; align-items: center; gap: 6%; padding: 0 7%;\n        background: radial-gradient(circle at 70% 40%, #7a120c, #1a0303 75%); color: #fff; }\n    .crave .badge { flex: none; width: 30%; aspect-ratio: 0.82; background: #f3ece2; color: #160303;\n        clip-path: polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%); transform: rotate(-11deg);\n        display: grid; place-items: center; align-content: center; gap: 4%; text-align: center; }\n    .crave .badge i { width: 22%; aspect-ratio: 1; border-radius: 50%; background: #c8140c; box-shadow: 0 0 12px #c8140c; }\n    .crave .badge b { font: 900 clamp(18px, 4.6cqw, 54px)/0.98 Lato, sans-serif; letter-spacing: -0.01em; }\n    .crave p { margin: 0; display: grid; gap: 0.5em; }\n    .crave strong { font: 700 clamp(22px, 5.4cqw, 64px)/1.08 Lato, sans-serif; text-shadow: 0 0 18px #ff3b1f; }\n    .crave span { font: 400 clamp(13px, 2.6cqw, 30px)/1.2 Lato, sans-serif; opacity: 0.8; }\n\n    .gallows { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }\n    /* the pawn drops once the picture has settled, jerks, and swings */\n    .gallows .drop { transform: translateY(-260px); }\n    .card.possessed .gallows .drop { animation: sinners-drop 0.5s cubic-bezier(0.6, 0, 0.9, 0.5) 1s both; }\n    .card.possessed.at-once .gallows .drop { animation: none; transform: none; }\n    @keyframes sinners-drop { 0% { transform: translateY(-260px); } 78% { transform: translateY(10px); } 100% { transform: none; } }\n    .gallows .swing { transform-origin: 346px 50px; animation: sinners-swing 3.4s ease-in-out infinite; }\n    @keyframes sinners-swing { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }\n\n    /* the photo doesn't stutter: it goes dark, slowly, and then the eyes */\n    .card-img { transition: filter 1.8s ease-in; }\n    .card.at-once .card-img { transition: none; }\n    .card.possessed.scary .card-img { filter: grayscale(0.85) sepia(0.6) hue-rotate(-28deg) saturate(1.9) contrast(1.35) brightness(0.5); }\n    .card.scary .sinners-over { animation: none !important; opacity: 1; }\n    .vignette { position: absolute; inset: 0; box-shadow: inset 0 0 70px 22px #1a0000; opacity: 0; transition: opacity 1.8s ease-in; }\n    .card.possessed .vignette { opacity: 1; }\n    .eye { position: absolute; width: 0.42%; aspect-ratio: 1; margin: -0.21% 0 0 -0.21%; border-radius: 50%;\n        background: #ff2a12; box-shadow: 0 0 5px 2px #ff2a12, 0 0 14px 5px rgba(255, 30, 0, 0.75); opacity: 0; }\n    .card.eyes .eye { animation: sinners-ignite 0.7s ease-out both, sinners-eye 2.6s ease-in-out 0.7s infinite; }\n    @keyframes sinners-ignite { 0% { opacity: 0; transform: scale(0.2); } 35% { opacity: 1; transform: scale(3.2); } 100% { opacity: 1; transform: none; } }\n    @keyframes sinners-eye { 0%, 46%, 54%, 100% { opacity: 1; } 50% { opacity: 0.1; } }\n", Ft = /* @__PURE__ */ new WeakMap();
function It(e) {
	if (Ft.has(e)) return Ft.get(e);
	let t = e.shadowRoot, n = t?.querySelector(".card"), r = t?.querySelector("img.card-img"), i = r && Nt.find((e) => r.src.includes(e.match));
	if (!t || !n || !r || !i) return t && n && Ft.set(e, null), null;
	let a = document.createElement("style");
	a.textContent = Pt, t.appendChild(a);
	let o = document.createElement("div");
	o.className = "sinners-over", o.innerHTML = i.over, n.appendChild(o);
	let s = [], c = (e) => {
		let t = e && document.createTreeWalker(e, NodeFilter.SHOW_TEXT), n;
		for (; t && (n = t.nextNode());) if (n.nodeValue?.trim()) return n;
	}, l = c(t.querySelector(".card-title")), u = c(t.querySelector(".card-text"));
	l && s.push([
		l,
		l.data,
		i.title
	]), u && s.push([
		u,
		u.data,
		i.text
	]);
	let d = {
		card: n,
		img: r,
		over: o,
		is: i,
		words: s,
		button: t.querySelector("uui-button") ?? void 0,
		on: !1
	};
	return Ft.set(e, d), d;
}
function Lt(e, t, n, r) {
	if (t && (e.over.style.height = `${e.img.offsetHeight}px`), e.on === t) return;
	e.on = t;
	let i = e.is.match === "one-story-community";
	e.card.classList.toggle("at-once", t && n), e.card.classList.toggle("scary", i), e.card.classList.toggle("possessed", t), t || e.card.classList.remove("eyes");
	let a = () => {
		if (e.on === t) {
			for (let [n, r, i] of e.words) n.data = t ? i : r;
			t ? e.unbutton = e.button && Ct(e.button, e.is.button) : e.unbutton?.();
		}
	};
	t && !n ? setTimeout(a, r ?? (i ? 900 : 700)) : a();
}
var Rt = 0, zt;
function Bt(e) {
	let t = A(document, "umb-news-card").map(It).filter((e) => !!e);
	if (!t.length) return;
	if (!e) {
		for (let e of t) Lt(e, !1, !0);
		return;
	}
	if (!t.every((e) => e.img.complete && e.img.naturalWidth > 0)) return;
	let n = performance.now();
	zt !== t[0].card && (zt = t[0].card, Rt = n);
	let r = jt();
	if (!r && Mt()) {
		for (let e of t) e.on && Lt(e, !0, !1);
		return;
	}
	t.forEach((e, t) => {
		let i = r ? 500 + t * 200 : Tt + t * Et, a = n - Rt - i;
		if (!(a < 0) && (Lt(e, !0, r), e.is.match === "one-story-community" && a >= (r ? 300 : Dt))) {
			e.card.classList.add("eyes");
			try {
				sessionStorage.setItem(Ot, "1");
			} catch {}
		}
	});
}
var Vt = 0;
function Ht() {
	if (!N.welcome || P <= 0 || ht() || !location.pathname.includes("/section/content") || jt()) return !1;
	let e = A(document, "umb-news-card").map(It).filter((e) => !!e && e.img.complete && e.img.naturalWidth > 0).sort((e, t) => Nt.indexOf(e.is) - Nt.indexOf(t.is)).find((e) => !e.on);
	if (!e) return !1;
	let t = performance.now();
	return t - Vt < 600 ? !0 : (Vt = t, Ut(), Lt(e, !0, !1, At + 150), e.is.match === "one-story-community" && setTimeout(() => {
		e.card.classList.add("eyes");
		try {
			sessionStorage.setItem(Ot, "1");
		} catch {}
	}, 1500), !0);
}
function Ut() {
	let e = [], t = (n) => {
		for (let r of n.childNodes) if (r.nodeType === Node.TEXT_NODE) {
			let t = r, n = t.data.trim();
			if (n.length < 2) continue;
			let i = t.parentElement;
			if (i && i.getClientRects().length === 0) continue;
			let a = n.split(/\s+/).length, o = Array(Math.min(12, Math.ceil(a / 2))).fill("NO").join(" ") + (a > 3 ? "." : "");
			e.push([
				t,
				t.data,
				o
			]);
		} else if (r.nodeType === Node.ELEMENT_NODE) {
			let e = r;
			if (/^(STYLE|SCRIPT|TEMPLATE|TEXTAREA|SVG|svg|CODE|NOSCRIPT)$/.test(e.tagName) || e.classList.contains("view-lines")) continue;
			e.shadowRoot && t(e.shadowRoot), t(e);
		}
	};
	t(document.body);
	for (let [t, , n] of e) t.data = n;
	setTimeout(() => {
		for (let [t, n, r] of e) t.data === r && (t.data = n);
	}, At), document.body.animate([
		0,
		-14,
		12,
		-9,
		7,
		-4,
		0
	].map((e) => ({ transform: `translateX(${e}px)` })), {
		duration: 420,
		easing: "ease-out"
	});
	let n = document.createElement("div");
	n.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;margin:0;padding:0;border:0;pointer-events:none;background:radial-gradient(circle at 50% 50%, rgba(200,20,12,0) 35%, rgba(200,20,12,0.55) 100%)", document.body.appendChild(n);
	try {
		n.setAttribute("popover", "manual"), n.showPopover();
	} catch {}
	n.animate([
		{ opacity: 0 },
		{
			opacity: 1,
			offset: .15
		},
		{ opacity: 0 }
	], {
		duration: At,
		easing: "ease-out",
		fill: "forwards"
	}), setTimeout(() => n.remove(), At + 60);
}
var Wt = 5e3, Gt = "sinners-avatar-turned", I = "255, 42, 18", Kt = `<svg class="sinners-pentagram" viewBox="0 0 32 32" aria-hidden="true"
    style="position:absolute;inset:0;width:100%;height:100%;display:block;border-radius:50%">
    <circle cx="16" cy="16" r="15.2" fill="#140303"/>
    <circle cx="16" cy="16" r="13.4" fill="none" stroke="rgb(${I})" stroke-width="1.5"/>
    <path d="M16 28.5 L8.65 5.89 L27.89 19.86 L4.11 19.86 L23.35 5.89 Z" fill="none" stroke="rgb(${I})" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`, qt, Jt = 0, Yt = 0, L = !1, Xt = !1, Zt, Qt = 0;
function $t(e) {
	e.querySelector(".sinners-pentagram") || e.insertAdjacentHTML("beforeend", Kt), e.style.color = "transparent", e.style.borderRadius = "50%", e.style.zIndex = "10", e.style.transform = "scale(1.35)", Zt ??= e.animate([
		{ boxShadow: `0 0 8px 2px rgba(${I}, 0.55)` },
		{ boxShadow: `0 0 16px 6px rgba(${I}, 0.9)` },
		{ boxShadow: `0 0 8px 2px rgba(${I}, 0.55)` }
	], {
		duration: 2400,
		iterations: Infinity,
		easing: "ease-in-out"
	});
}
function en(e) {
	Zt?.cancel(), Zt = void 0, e.querySelector(".sinners-pentagram")?.remove();
	for (let t of [
		"color",
		"border-radius",
		"z-index",
		"transform"
	]) e.style.removeProperty(t);
}
function tn(e) {
	let t = performance.now();
	if (!qt?.isConnected) {
		if (t - Yt < 1500 || (Yt = t, qt = A(document, "uui-avatar").find((e) => {
			let t = e.getBoundingClientRect();
			return t.width > 0 && t.top < 70;
		}), !qt)) return;
		Jt = t, L = Xt = !1, Zt = void 0;
	}
	let n = qt;
	if (!e) {
		L && en(n), L = !1, Jt = t;
		try {
			sessionStorage.removeItem(Gt);
		} catch {}
		return;
	}
	if (Xt) return;
	if (L) {
		t - Qt > 14e3 && (Qt = t, n.animate([
			0,
			-9,
			8,
			-6,
			4,
			0
		].map((e) => ({ transform: `scale(1.35) rotate(${e}deg)` })), {
			duration: 520,
			easing: "ease-in-out"
		}));
		return;
	}
	let r = !1;
	try {
		r = sessionStorage.getItem(Gt) === "1";
	} catch {}
	if (r) {
		$t(n), L = !0, Qt = t;
		return;
	}
	if (t - Jt < Wt) return;
	Xt = !0, n.style.borderRadius = "50%", n.style.zIndex = "10";
	let i = [
		0,
		-14,
		12,
		-16,
		14,
		-12,
		10,
		-6,
		0
	], a = i.map((e, t) => {
		let n = t / (i.length - 1);
		return {
			offset: n * .55,
			transform: `scale(${1 + n * 1.7}) rotate(${e}deg)`,
			boxShadow: `0 0 ${n * 26}px ${n * 10}px rgba(${I}, ${n * .95})`
		};
	});
	a.push({
		offset: .78,
		transform: "scale(2.7) rotate(0deg)",
		boxShadow: `0 0 30px 12px rgba(${I}, 1)`
	}, {
		offset: 1,
		transform: "scale(1.35) rotate(0deg)",
		boxShadow: `0 0 12px 4px rgba(${I}, 0.7)`
	});
	let o = n.animate(a, {
		duration: 2600,
		easing: "ease-in-out"
	});
	setTimeout(() => {
		n.querySelector(".sinners-pentagram") || n.insertAdjacentHTML("beforeend", Kt), n.style.color = "transparent";
	}, 2600 * .55), o.onfinish = () => {
		$t(n), Xt = !1, L = !0, Qt = performance.now();
		try {
			sessionStorage.setItem(Gt, "1");
		} catch {}
	};
}
var nn = 3200, rn = 55, an = [{
	after: "CountDescendants",
	says: "// every node. on every request. it never stops counting."
}, {
	after: "DescendantsOrSelf",
	says: "// …and again."
}], on = 0, sn;
function cn(e) {
	let t = sn?.isConnected ? sn : A(document, ".view-lines")[0];
	if (!t) return;
	sn !== t && (sn = t, on = performance.now());
	let n = performance.now() - on - nn;
	for (let r of an) {
		let i = [...t.querySelectorAll(".view-line")].find((e) => (e.textContent ?? "").includes(r.after)), a = e && n > 0 ? Math.min(r.says.length, Math.floor(n / rn)) : 0;
		if (n -= r.says.length * rn + 1400, !i) continue;
		let o = i.querySelector(".sinners-ghost");
		if (!a) {
			o?.remove();
			continue;
		}
		o || (o = document.createElement("span"), o.className = "sinners-ghost", o.style.cssText = `color:#b3121f;font-style:italic;white-space:pre;pointer-events:none;text-shadow:0 0 7px rgba(${I},0.55)`, (i.firstElementChild ?? i).appendChild(o));
		let s = "  " + r.says.slice(0, a) + (a < r.says.length ? "▌" : "");
		o.textContent !== s && (o.textContent = s);
	}
}
//#endregion
//#region src/penance/presenter.ts
var ln = [
	"I",
	"II",
	"III",
	"IV",
	"V",
	"VI",
	"VII",
	"VIII",
	"IX",
	"X"
], un = "sinners-presenter-state", dn = "sinners-forget-pretences", fn = "sinners-fast-forward";
function pn() {
	try {
		let e = sessionStorage.getItem(un);
		if (e) return JSON.parse(e);
	} catch {}
	return {
		activeTab: "",
		indices: {}
	};
}
var mn = pn(), hn = /* @__PURE__ */ new Map(), R = new Map(Object.entries(mn.indices ?? {})), z = new Map(Object.entries(mn.exhibits ?? {})), B = mn.activeTab, gn = [], V = !1, _n = /* @__PURE__ */ new Set(), vn = () => [..._n].some((e) => e.isConnected), yn = !1;
function H() {
	try {
		sessionStorage.setItem(un, JSON.stringify({
			activeTab: B,
			indices: Object.fromEntries(R),
			exhibits: Object.fromEntries(z)
		}));
	} catch {}
}
var bn = "/umbraco/section/settings/dashboard/penance", U = (e, t = {}) => ({
	selector: "uui-menu-item",
	label: e,
	...t
}), xn = "/umbraco/section/settings/workspace/document-type-root", Sn = "/umbraco/section/content/workspace/document/edit/704a66de-b213-44fe-815a-f988c0707bbf/invariant/view/info/modal/umb-modal-workspace/invariant/general/document-type/edit/b871f83c-2395-4894-be0f-5422c1a71e48/tab/content", Cn = {
	I: [{
		url: Sn,
		highlight: "umb-content-type-design-editor-property"
	}, {
		url: Sn,
		at: 1,
		highlight: "umb-content-type-design-editor-property"
	}],
	II: [{
		url: xn,
		highlight: U("Document Types", { expand: !0 })
	}, {
		url: xn,
		at: 3,
		highlight: U("Document Types", { expand: !0 })
	}],
	III: [
		{
			url: "/umbraco/section/settings/workspace/data-type/edit/b5922818-d8d8-43df-88ed-4582a24c0fa6",
			at: 0,
			highlight: U("Data Types")
		},
		{
			url: "/umbraco/section/settings/workspace/data-type-root",
			at: 1,
			highlight: U("Data Types", { expand: !0 })
		},
		{
			url: "/umbraco/section/translation",
			at: 1,
			highlight: "umb-tree"
		},
		{
			url: "/umbraco/section/translation",
			at: 2,
			highlight: U("ContactForm", { expand: !0 })
		},
		{
			url: "/umbraco/section/media/collection",
			at: 2,
			highlight: {
				selector: "uui-card-media[name=\"logo\"], uui-card-media[name=\"Brochure 2019.pdf\"], uui-card-media[name=\"final-final-v2.jpg\"]",
				all: !0
			}
		}
	],
	VII: [{
		url: "/umbraco/section/settings/workspace/partial-view/edit/%2FmegaMenu%25dot%25cshtml",
		highlight: {
			selector: ".view-line",
			text: ["Descendants<", "CountDescendants"],
			all: !0
		}
	}],
	VIII: [{
		url: "/umbraco/section/content/workspace/document/edit/0d1e5e08-8a2e-4f0e-9d7b-5f0a5b5e0008",
		highlight: "umb-document-collection"
	}],
	IX: [{
		url: "/umbraco/section/content",
		highlight: U("Home")
	}, {
		url: "/umbraco/section/content",
		at: 1,
		highlight: U("Site", { expand: !0 })
	}]
}, wn = {
	III: [
		"data-types",
		"dictionary",
		"media"
	],
	VI: ["aliases", "keys"]
}, Tn = [];
function En(e) {
	let t = e.filter((e) => e.host.isConnected);
	return (t.length ? t : e).at(-1)?.steps ?? [];
}
function Dn(e) {
	let t = hn.get(e);
	return t ? (wn[e] ?? [...t.keys()]).flatMap((e) => En(t.get(e) ?? [])) : [];
}
function On(e) {
	return (Cn[e] ?? []).map((e, t) => typeof e == "string" ? {
		url: e,
		at: t
	} : {
		...e,
		at: e.at ?? t
	});
}
function kn() {
	let e = z.get(B) ?? 0, t = On(B)[e - 1];
	return t && window.location.pathname.startsWith(t.url) ? t : void 0;
}
function An() {
	return window.location.pathname.includes("/dashboard/penance");
}
var W = {
	get activeTab() {
		return B;
	},
	setActiveTab(e) {
		B = e, H();
	},
	hold(e, t) {
		t ? _n.add(e) : _n.delete(e);
	},
	dot() {
		let e = window.location.pathname;
		if (An()) {
			let e = On(B), t = z.get(B) ?? 0, n = e.length ? e[Math.min(t, e.length - 1)].url : bn;
			e.length && t < e.length && (z.set(B, t + 1), H()), console.log(`[PRESENTER] dot() on penance tab="${B}" → ${n}`), window.location.href = n;
			return;
		}
		let t = Tn.find((t) => e === t.match), n = t ? t.target : bn;
		console.log(`[PRESENTER] dot() elsewhere path="${e}" → ${n}`), window.location.href = n;
	},
	onNextTab(e, t) {
		gn = [...gn.filter((t) => t.host !== e && t.host.isConnected), {
			host: e,
			fn: t
		}];
	},
	nextTab() {
		console.log("[PRESENTER] nextTab()");
		let e = gn.filter((e) => e.host.isConnected);
		(e.length ? e : gn).at(-1)?.fn();
	},
	registerSteps(e, t, n, r = "main") {
		let i = hn.get(e) ?? /* @__PURE__ */ new Map(), a = (i.get(r) ?? []).filter((e) => e.host !== t && e.host.isConnected);
		i.set(r, [...a, {
			host: t,
			steps: n
		}]), hn.set(e, i);
	},
	get fastForwardTo() {
		try {
			let e = Number(sessionStorage.getItem(fn));
			return Number.isInteger(e) && e >= 1 && e <= ln.length ? ln[e - 1] : void 0;
		} catch {
			return;
		}
	},
	async fastForward(e, t, n) {
		if (!V) {
			V = !0;
			try {
				for (let r of ln) {
					if (r === e) break;
					z.set(r, On(r).length);
					let i = Dn(r);
					if (t(r) > 0) {
						n?.(r);
						for (let e = Math.min(R.get(r) ?? 0, i.length); e < i.length; e++) console.log(`[PRESENTER] fast-forward — ${r} "${i[e].label}"`), await i[e].run(), R.set(r, e + 1), H();
					}
					R.set(r, i.length), H();
				}
				B = e, H();
			} finally {
				V = !1;
				try {
					sessionStorage.removeItem(fn);
				} catch {}
			}
		}
	},
	async next() {
		if (V || vn()) return;
		let e = Dn(B), t = R.get(B) ?? 0;
		if (console.log(`[PRESENTER] next() — tab="${B}" step=${t + 1}/${e.length}`), t >= e.length) {
			console.log(`[PRESENTER] no more steps on tab "${B}"`);
			return;
		}
		V = !0;
		try {
			let n = { restore: () => {} };
			try {
				n = await mt(e[t].clicks?.() ?? []);
			} catch (e) {
				console.warn("[PRESENTER] no pointers for this step", e);
			}
			await e[t].run(), n.restore();
		} finally {
			V = !1;
		}
		R.set(B, t + 1), H(), console.log(`[PRESENTER] step ${t + 1} "${e[t].label}" done`);
	},
	async forward() {
		if (V || vn()) return;
		if (!An()) {
			let e = kn()?.highlight;
			if (e && !yn) {
				if (Ht()) return;
				yn = !0, rt(e);
				return;
			}
			this.dot();
			return;
		}
		if (!B || !gn.some((e) => e.host.isConnected)) return;
		let e = Dn(B), t = Math.min(R.get(B) ?? 0, e.length), n = z.get(B) ?? 0, r = On(B);
		if (n < r.length && r[n].at <= t) {
			this.dot();
			return;
		}
		if (t < e.length) {
			await this.next();
			return;
		}
		if (B === ln[ln.length - 1]) {
			console.log("[PRESENTER] forward() — all ten commandments atoned, handing the clicker back"), et();
			return;
		}
		this.nextTab();
	},
	reset() {
		try {
			sessionStorage.removeItem(un), sessionStorage.removeItem("sinners-welcome-seen"), sessionStorage.removeItem("sinners-avatar-turned"), sessionStorage.setItem(dn, "1"), localStorage.removeItem("sinners-media-pretend");
		} catch {}
		window.location.href = bn;
	}
}, jn = 900, Mn = 520, Nn = 170, Pn = 760, Fn = (e) => new Promise((t) => setTimeout(t, e)), In = (e, t) => `radial-gradient(${e / 2}px ${t}px at 50% 100%, #000 98%, #0000 100%) 0 0 / ${e}px ${t}px repeat-x, linear-gradient(#000, #000) 0 ${t - 1}px / 100% 100% no-repeat`;
async function Ln(e) {
	if (document.hidden) {
		e();
		return;
	}
	let t = document.createElement("div");
	Object.assign(t.style, {
		position: "fixed",
		inset: "0",
		width: "100vw",
		height: "100vh",
		margin: "0",
		padding: "0",
		border: "0",
		background: "transparent",
		overflow: "hidden",
		pointerEvents: "none"
	}), t.innerHTML = `
        <div class="dark" style="position:absolute;inset:0;background:#000;opacity:0"></div>
        <div class="red" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 60%, #ff2a12 0%, #7a0500 55%, #1a0000 100%);mix-blend-mode:multiply;opacity:0"></div>
        <div class="fire back" style="position:absolute;left:-4%;width:108%;top:100%;height:190vh;
            background:linear-gradient(to top, #0000 0%, #1a0000 10%, #5a0803 42%, #b3200a 66%, #ff6a12 82%, #ffb02e 94%, #ffd45a 100%);
            -webkit-mask:${In(180, 240)};mask:${In(180, 240)}"></div>
        <div class="fire front" style="position:absolute;left:-9%;width:118%;top:100%;height:190vh;
            background:linear-gradient(to top, #0000 0%, #140000 14%, #6e0c04 46%, #d9360b 68%, #ff8a1e 80%, #ffd45a 92%, #ffe9a0 100%);
            -webkit-mask:${In(104, 180)};mask:${In(104, 180)}"></div>
        <div class="flash" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 70%, #fff3c4, #ff7a1a 60%, #c8140c);opacity:0"></div>`, document.body.appendChild(t);
	try {
		t.setAttribute("popover", "manual"), t.showPopover();
	} catch {}
	let n = (e) => t.querySelector(e);
	n(".dark").animate([
		0,
		.55,
		.05,
		0,
		.7,
		.15,
		.85,
		.1,
		.9,
		.35,
		.75
	].map((e) => ({ opacity: e })), {
		duration: jn,
		easing: "steps(1, end)",
		fill: "forwards"
	}), n(".red").animate([
		0,
		0,
		.5,
		.2,
		.75,
		.4,
		.9,
		.6,
		1,
		1,
		1
	].map((e) => ({ opacity: e })), {
		duration: jn,
		easing: "steps(1, end)",
		fill: "forwards"
	});
	let r = (e, t) => document.body.animate(Array.from({ length: 12 }, (t, n) => ({ transform: n === 11 ? "none" : `translate(${(n * 7919 % 11 - 5) * e * .2}px, ${(n * 6007 % 9 - 4) * e * .25}px)` })), {
		duration: t,
		easing: "steps(12, end)"
	});
	r(5, jn), await Fn(jn - 120);
	let i = Mn + Nn + Pn, a = (e, t) => e.animate([
		{
			transform: "translateY(0)",
			offset: 0,
			easing: "cubic-bezier(0.35, 0, 0.45, 1)"
		},
		{
			transform: `translateY(${-118 + t}vh)`,
			offset: Mn / i,
			easing: "linear"
		},
		{
			transform: `translateY(${-124 + t}vh)`,
			offset: (Mn + Nn) / i,
			easing: "cubic-bezier(0.5, 0, 0.9, 0.6)"
		},
		{
			transform: "translateY(-300vh)",
			offset: 1
		}
	], {
		duration: i,
		fill: "forwards"
	});
	a(n(".back"), 0), a(n(".front"), 6), r(16, i);
	for (let e = 0; e < 34; e++) {
		let n = document.createElement("i"), r = e * 61 % 100, i = 4 + e * 13 % 7;
		n.style.cssText = `position:absolute;left:${r}%;top:100%;width:${i}px;height:${i}px;border-radius:50%;background:#ffd45a;box-shadow:0 0 ${i * 2}px ${i / 2}px #ff6a12;opacity:0`, t.appendChild(n), n.animate([
			{
				transform: "translate(0, 0)",
				opacity: 0
			},
			{
				opacity: 1,
				offset: .15
			},
			{
				transform: `translate(${e * 29 % 160 - 80}px, -${70 + e * 17 % 50}vh)`,
				opacity: 0
			}
		], {
			duration: 1300 + e * 97 % 1100,
			delay: e * 43 % 900,
			easing: "cubic-bezier(0.2, 0.6, 0.4, 1)",
			fill: "forwards"
		});
	}
	await Fn(Mn + Nn * .4), n(".dark").getAnimations().forEach((e) => e.cancel()), n(".red").getAnimations().forEach((e) => e.cancel());
	try {
		e();
	} catch (e) {
		console.error("[DESCENT] the turn failed", e);
	}
	n(".flash").animate([
		{ opacity: 0 },
		{
			opacity: .8,
			offset: .25
		},
		{ opacity: 0 }
	], {
		duration: 900,
		easing: "ease-out"
	}), await Fn(Nn * .6 + Pn + 900), t.remove();
}
//#endregion
//#region \0@oxc-project+runtime@0.128.0/helpers/decorate.js
function G(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
//#endregion
//#region src/penance/commandments/content-not-composable.element.ts
var K = "/umbraco/management/api/v1/sinners", Rn = {
	"Umbraco.BlockList": "Block List",
	"Umbraco.BlockGrid": "Block Grid",
	"Umbraco.RichText": "Rich Text"
}, q = class extends e(E) {
	constructor(...e) {
		super(...e), this._items = [], this._emptyItems = [], this._loading = !0, this._folding = /* @__PURE__ */ new Set(), this._blessing = /* @__PURE__ */ new Set(), this._deleting = /* @__PURE__ */ new Set(), this._lastResult = null;
	}
	#e;
	static {
		this.styles = l`
        .empty {
            padding: 32px;
            text-align: center;
            color: var(--uui-color-text-alt, #888);
        }

        .clean {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .composition-row {
            padding: 14px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            background: var(--uui-color-surface, #fff);
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
            align-items: start;
        }

        .composition-row:last-child { border-bottom: none; }
        .composition-row:hover { background: var(--uui-color-surface-alt, #fafafa); }

        .name-block {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-width: 0;
        }

        .name {
            font-weight: 600;
            font-size: 13px;
        }

        .path {
            font-size: 12px;
            color: var(--uui-color-text-alt, #8d8d8d);
            font-family: monospace;
        }

        .props {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 4px;
        }

        .prop-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 600;
            background: var(--uui-color-danger-standalone, #d42054);
            color: var(--sinners-on-bright, white);
        }

        .prop-chip.blessed {
            background: var(--uui-color-positive-standalone, #0d7a54);
        }

        .prop-chip code {
            font-family: monospace;
            font-weight: 400;
            opacity: 0.75;
        }

        .fold-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 7px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            border: 1px solid rgba(255,255,255,0.5);
            background: rgba(0,0,0,0.15);
            color: var(--sinners-on-bright, white);
            cursor: pointer;
            white-space: nowrap;
            letter-spacing: 0.02em;
        }

        .fold-btn:hover {
            background: rgba(0,0,0,0.28);
        }

        .fold-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .used-on {
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
            margin-top: 4px;
        }

        .used-on strong {
            color: var(--uui-color-text, #333);
        }

        .count-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 24px;
            height: 24px;
            padding: 0 6px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 700;
            background: var(--uui-color-danger-standalone, #d42054);
            color: var(--sinners-on-bright, white);
            white-space: nowrap;
        }

        .count-badge.blessed {
            background: var(--uui-color-positive-standalone, #0d7a54);
        }

        .section-divider {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px 4px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--uui-color-text-alt, #888);
            border-top: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            margin-top: 4px;
        }

        .empty-comp-row {
            padding: 10px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }

        .empty-comp-row:last-child { border-bottom: none; }
        .empty-comp-row:hover { background: var(--uui-color-surface-alt, #fafafa); }

        .delete-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 9px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            border: none;
            background: var(--uui-color-danger-standalone, #d42054);
            color: var(--sinners-on-bright, white);
            cursor: pointer;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .delete-btn:hover { background: #b01a44; }

        .delete-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .result-banner {
            margin: 8px 16px 4px;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
        }

        .result-banner.success {
            background: var(--uui-color-positive-standalone, #0d7a54);
            color: var(--sinners-on-bright, white);
            border: 1px solid var(--uui-color-positive, #1ab873);
        }

        .result-banner.error {
            background: var(--uui-color-danger-standalone, #d42054);
            color: var(--sinners-on-bright, white);
            border: 1px solid var(--uui-color-danger, #d42054);
        }
    `;
	}
	connectedCallback() {
		super.connectedCallback(), W.registerSteps("I", this, [{
			label: "Fold In & bless everything",
			clicks: () => [...this.renderRoot.querySelectorAll(".prop-chip")].flatMap((e) => {
				let t = e.querySelector("code")?.textContent?.trim() ?? "", n = e.querySelectorAll(".fold-btn"), r = ["contentRows", "socialIconLinks"].includes(t) ? 0 : [
					"instructionMessage",
					"successMessage",
					"errorMessage"
				].includes(t) ? 1 : -1;
				return r >= 0 && n[r] ? [n[r]] : [];
			}),
			run: async () => {
				await this.#r("contentRows"), await this.#r("socialIconLinks"), await this.#i("instructionMessage"), await this.#i("successMessage"), await this.#i("errorMessage");
			}
		}]), this.consumeContext(n, (e) => {
			this.#e = e, this.#n();
		});
	}
	async #t(e, t = {}) {
		let n = await this.#e?.getLatestToken();
		return fetch(e, {
			...t,
			headers: {
				"Content-Type": "application/json",
				...n ? { Authorization: `Bearer ${n}` } : {},
				...t.headers ?? {}
			}
		});
	}
	async #n() {
		this._loading = !0;
		try {
			let [e, t] = await Promise.all([this.#t(`${K}/sinful-compositions`), this.#t(`${K}/empty-compositions`)]);
			e.ok && (this._items = await e.json()), t.ok && (this._emptyItems = await t.json());
			let n = this._items.reduce((e, t) => e + t.sinfulProperties.filter((e) => !e.isBlessed).length, 0);
			this.dispatchEvent(new CustomEvent("sinners-status", {
				bubbles: !0,
				composed: !0,
				detail: {
					issueCount: n,
					severity: n > 0 ? "error" : "ok"
				}
			}));
		} finally {
			this._loading = !1;
		}
	}
	async #r(e) {
		let t = this._items.flatMap((e) => e.sinfulProperties.map((t) => `${e.contentTypeAlias}.${t.propertyAlias}`));
		console.log(`[RULE I] foldInByAlias("${e}") — available:`, t);
		for (let t of this._items) {
			let n = t.sinfulProperties.find((t) => t.propertyAlias === e);
			if (n) {
				console.log(`[RULE I] found "${e}" on "${t.contentTypeAlias}", folding in`), await this.#a(t, n);
				return;
			}
		}
		console.warn(`[RULE I] property "${e}" not found in any sinful composition`);
	}
	async #i(e) {
		let t = this._items.flatMap((e) => e.sinfulProperties.map((t) => `${e.contentTypeAlias}.${t.propertyAlias}(blessed=${t.isBlessed})`));
		console.log(`[RULE I] blessByAlias("${e}") — available:`, t);
		for (let t of this._items) {
			let n = t.sinfulProperties.find((t) => t.propertyAlias === e && !t.isBlessed);
			if (n) {
				console.log(`[RULE I] found unblessed "${e}" on "${t.contentTypeAlias}", blessing`), await this.#c(t, n, !0);
				return;
			}
		}
		console.warn(`[RULE I] property "${e}" not found or already blessed`);
	}
	async #a(e, t) {
		let n = `${e.contentTypeAlias}:${t.propertyAlias}`;
		this._folding = new Set([...this._folding, n]), this._lastResult = null;
		try {
			let r = await (await this.#t(`${K}/fold-in`, {
				method: "POST",
				body: JSON.stringify({
					compositionAlias: e.contentTypeAlias,
					propertyAlias: t.propertyAlias
				})
			})).json();
			this._lastResult = {
				key: n,
				result: r
			}, r.success && (await this.#n(), k(1, "fold-in"));
		} catch (e) {
			this._lastResult = {
				key: n,
				result: {
					success: !1,
					message: String(e),
					affectedDocTypeCount: 0,
					affectedContentCount: 0
				}
			};
		} finally {
			this._folding = new Set([...this._folding].filter((e) => e !== n));
		}
	}
	async #o(e, t) {
		let n = `${e.contentTypeAlias}:${t.propertyAlias}`;
		if (window.confirm(`Fold "${t.propertyAlias}" from "${e.contentTypeName}" into: ${e.usedOn.join(", ")}?\n\nThis will:\n  1. Add "${t.propertyAlias}_fold_tmp" to each target doc type\n  2. Copy all content values across\n  3. Remove the property from the composition\n  4. Rename the temp property back to "${t.propertyAlias}"\n\nContent nodes will be saved as drafts. This cannot be undone.`)) {
			this._folding = new Set([...this._folding, n]), this._lastResult = null;
			try {
				let r = await (await this.#t(`${K}/fold-in`, {
					method: "POST",
					body: JSON.stringify({
						compositionAlias: e.contentTypeAlias,
						propertyAlias: t.propertyAlias
					})
				})).json();
				this._lastResult = {
					key: n,
					result: r
				}, r.success && (await this.#n(), k(1, "fold-in"));
			} catch (e) {
				this._lastResult = {
					key: n,
					result: {
						success: !1,
						message: String(e),
						affectedDocTypeCount: 0,
						affectedContentCount: 0
					}
				};
			} finally {
				this._folding = new Set([...this._folding].filter((e) => e !== n));
			}
		}
	}
	async #s(e) {
		if (window.confirm(`Delete "${e.contentTypeName}" (${e.contentTypeAlias})?\n\nThis cannot be undone.`)) {
			this._deleting = new Set([...this._deleting, e.contentTypeAlias]);
			try {
				await this.#t(`${K}/empty-compositions/${encodeURIComponent(e.contentTypeAlias)}`, { method: "DELETE" }), await this.#n();
			} finally {
				this._deleting = new Set([...this._deleting].filter((t) => t !== e.contentTypeAlias));
			}
		}
	}
	async #c(e, t, n) {
		let r = `${e.contentTypeAlias}:${t.propertyAlias}`;
		this._blessing = new Set([...this._blessing, r]);
		try {
			await this.#t(`${K}/bless`, {
				method: "POST",
				body: JSON.stringify({
					compositionAlias: e.contentTypeAlias,
					propertyAlias: t.propertyAlias,
					blessed: n
				})
			}), await this.#n(), n && k(1, "bless");
		} finally {
			this._blessing = new Set([...this._blessing].filter((e) => e !== r));
		}
	}
	#l(e) {
		return S`
            <div class="composition-row">
                <div class="name-block">
                    <span class="name">${e.contentTypeName}</span>
                    <span class="path">${e.folderPath}</span>
                    <div class="props">
                        ${e.sinfulProperties.map((t) => {
			let n = `${e.contentTypeAlias}:${t.propertyAlias}`, r = this._folding.has(n), i = this._blessing.has(n);
			return S`
                                <span class="prop-chip ${t.isBlessed ? "blessed" : ""}">
                                    ${Rn[t.editorAlias] ?? t.editorAlias}
                                    <code>${t.propertyAlias}</code>
                                    <button
                                        class="fold-btn"
                                        ?disabled=${r || i}
                                        @click=${() => this.#o(e, t)}
                                        title="Move this property directly onto the doc types that compose it">
                                        ${r ? "⏳" : "↩ Fold In"}
                                    </button>
                                    <button
                                        class="fold-btn"
                                        ?disabled=${r || i}
                                        @click=${() => this.#c(e, t, !t.isBlessed)}
                                        title=${t.isBlessed ? "Remove blessing from this property" : "Mark this property as intentionally composable"}>
                                        ${i ? "⏳" : t.isBlessed ? "✕ Unbless" : "✦ Bless"}
                                    </button>
                                </span>
                            `;
		})}
                    </div>
                    <div class="used-on">
                        Composed into:
                        <strong>${e.usedOn.join(", ")}</strong>
                    </div>
                </div>
                <span class="count-badge ${e.sinfulProperties.every((e) => e.isBlessed) ? "blessed" : ""}">${e.sinfulProperties.length}</span>
            </div>
        `;
	}
	#u() {
		return this._emptyItems.length === 0 ? C : S`
            <div class="section-divider">Empty compositions</div>
            ${this._emptyItems.map((e) => S`
                <div class="empty-comp-row">
                    <div class="name-block">
                        <span class="name">${e.contentTypeName}</span>
                        <span class="path">${e.folderPath}</span>
                    </div>
                    <button
                        class="delete-btn"
                        ?disabled=${this._deleting.has(e.contentTypeAlias)}
                        @click=${() => this.#s(e)}>
                        ${this._deleting.has(e.contentTypeAlias) ? "⏳" : "⊗ Delete"}
                    </button>
                </div>
            `)}
        `;
	}
	render() {
		let e = this._lastResult;
		return S`
            <uui-box headline="I — Content is not composable">
                ${e ? S`
                          <div class="result-banner ${e.result.success ? "success" : "error"}">
                              ${e.result.message}
                          </div>
                      ` : C}
                ${this._loading ? S`<uui-loader-bar></uui-loader-bar>` : S`
                          ${this._items.length === 0 ? S`<div class="clean">✓ No compositions expose block lists, block grids, or rich text editors.</div>` : S`${this._items.map((e) => this.#l(e))}`}
                          ${this.#u()}
                      `}
            </uui-box>
        `;
	}
};
G([O()], q.prototype, "_items", void 0), G([O()], q.prototype, "_emptyItems", void 0), G([O()], q.prototype, "_loading", void 0), G([O()], q.prototype, "_folding", void 0), G([O()], q.prototype, "_blessing", void 0), G([O()], q.prototype, "_deleting", void 0), G([O()], q.prototype, "_lastResult", void 0), q = G([D("sinners-content-not-composable")], q);
//#endregion
//#region src/penance/commandments/four-sacred-types.element.ts
var zn = [
	"Page",
	"Block",
	"Data",
	"Composition"
], Bn = "/umbraco/management/api/v1/sinners", J = class extends e(E) {
	constructor(...e) {
		super(...e), this._items = [], this._loading = !0, this._saving = !1, this._categorizing = !1, this._pendingChanges = /* @__PURE__ */ new Map();
	}
	#e;
	static {
		this.styles = l`
        .stats {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: var(--uui-size-space-5, 24px);
        }

        .stat-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            background: var(--uui-color-surface-alt, #f4f4f4);
            color: var(--uui-color-text, #333);
        }

        .stat-chip.sinful {
            background: var(--uui-color-danger-standalone, #d42054);
            color: var(--sinners-on-bright, white);
        }

        .stat-chip.clean {
            background: var(--uui-color-positive-standalone, #0d7a54);
            color: var(--sinners-on-bright, white);
        }

        details {
            border: 1px solid var(--uui-color-border, #d8d7d9);
            border-radius: var(--uui-border-radius, 3px);
            margin-bottom: 8px;
            overflow: hidden;
        }

        summary {
            padding: 12px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            font-size: 14px;
            user-select: none;
            background: var(--uui-color-surface, #fff);
            list-style: none;
        }

        summary::-webkit-details-marker { display: none; }

        summary::before {
            content: '▶';
            font-size: 12px;
            transition: transform 0.15s ease;
            color: var(--uui-color-text-alt, #888);
        }

        details[open] summary::before {
            transform: rotate(90deg);
        }

        details[open] summary {
            border-bottom: 1px solid var(--uui-color-border, #d8d7d9);
        }

        .group-count {
            font-weight: 400;
            color: var(--uui-color-text-alt, #888);
            font-size: 12px;
        }

        .sinful-label { color: var(--uui-color-danger-standalone, #d42054); }

        .item-row {
            display: grid;
            grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) 84px 168px;
            align-items: center;
            gap: 12px;
            padding: 10px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            background: var(--uui-color-surface, #fff);
        }

        .item-row:last-child { border-bottom: none; }

        .item-row:hover { background: var(--uui-color-surface-alt, #fafafa); }

        .name-col {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
        }

        .name {
            font-weight: 500;
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .path {
            font-size: 12px;
            color: var(--uui-color-text-alt, #8d8d8d);
            font-family: monospace;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        code {
            font-family: monospace;
            background: var(--uui-color-surface-alt, #f4f4f4);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
        }

        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 600;
            background: var(--uui-color-surface-alt, #f4f4f4);
        }

        .badge.element {
            background: var(--uui-color-selected, #3544b1);
            color: var(--sinners-on-bright, white);
        }

        select {
            width: 100%;
            padding: 5px 8px;
            border: 1px solid var(--uui-color-border, #d8d7d9);
            border-radius: var(--uui-border-radius, 3px);
            background: white;
            font-size: 13px;
        }

        select.unclassified {
            border-color: var(--uui-color-warning-standalone, #f0ac00);
        }

        .suggestion {
            font-size: 12px;
            color: var(--uui-color-interactive, #3544b1);
            cursor: pointer;
            text-decoration: underline dotted;
            display: block;
            margin-top: 2px;
        }

        .empty {
            padding: 32px;
            text-align: center;
            color: var(--uui-color-text-alt, #888);
        }

        .save-bar {
            display: flex;
            justify-content: flex-end;
            padding: 12px 16px;
            border-top: 1px solid var(--uui-color-border, #d8d7d9);
            background: var(--uui-color-surface, #fff);
        }
    `;
	}
	connectedCallback() {
		super.connectedCallback(), W.registerSteps("II", this, [
			{
				label: "Autofill classifications",
				clicks: () => [...this.renderRoot.querySelectorAll("select")],
				run: () => this.#o()
			},
			{
				label: "Save all",
				clicks: () => [...this.renderRoot.querySelectorAll(".save-bar uui-button")],
				run: () => this.#c()
			},
			{
				label: "Auto categorize",
				clicks: () => [...this.renderRoot.querySelectorAll(".stats uui-button")],
				run: () => this.#s()
			}
		]), this.consumeContext(n, (e) => {
			this.#e = e, this.#n();
		});
	}
	async #t(e, t = {}) {
		let n = await this.#e?.getLatestToken();
		return fetch(e, {
			...t,
			headers: {
				"Content-Type": "application/json",
				...n ? { Authorization: `Bearer ${n}` } : {},
				...t.headers ?? {}
			}
		});
	}
	async #n() {
		this._loading = !0;
		try {
			let e = await this.#t(`${Bn}/content-type-classifications`);
			e.ok && (this._items = await e.json()), this.#r();
		} finally {
			this._loading = !1;
		}
	}
	#r() {
		let e = this._items.filter((e) => !e.classification).length;
		this.dispatchEvent(new CustomEvent("sinners-status", {
			bubbles: !0,
			composed: !0,
			detail: {
				issueCount: e,
				severity: e > 0 ? "error" : "ok"
			}
		}));
	}
	#i(e, t) {
		let n = new Map(this._pendingChanges);
		t ? n.set(e, t) : n.delete(e), this._pendingChanges = n;
	}
	#a(e, t) {
		let n = new Map(this._pendingChanges);
		n.set(e, t), this._pendingChanges = n;
	}
	#o() {
		let e = new Map(this._pendingChanges);
		for (let t of this._items) if (!t.classification && !e.has(t.contentTypeAlias)) if (t.suggestedClassification) e.set(t.contentTypeAlias, t.suggestedClassification), console.log(`[RULE II] suggestion → ${t.contentTypeAlias} = ${t.suggestedClassification}`);
		else {
			let n = t.folderPath ?? "";
			n.startsWith("/Elements/Setting") ? (e.set(t.contentTypeAlias, "Data"), console.log(`[RULE II] path rule (Data) → ${t.contentTypeAlias} (${n})`)) : n.startsWith("/Elements/") ? (e.set(t.contentTypeAlias, "Block"), console.log(`[RULE II] path rule (Block) → ${t.contentTypeAlias} (${n})`)) : console.warn(`[RULE II] no rule matched — ${t.contentTypeAlias} (${n}) left unclassified`);
		}
		this._pendingChanges = e, console.log(`[RULE II] autofill complete — ${e.size} pending`);
	}
	async #s() {
		this._categorizing = !0;
		try {
			(await this.#t(`${Bn}/auto-categorize`, { method: "POST" })).ok && (await this.#n(), k(2, "auto-categorize"));
		} finally {
			this._categorizing = !1;
		}
	}
	async #c() {
		if (this._pendingChanges.size !== 0) {
			this._saving = !0;
			try {
				let e = 0;
				for (let [t, n] of this._pendingChanges) if ((await this.#t(`${Bn}/content-type-classifications`, {
					method: "POST",
					body: JSON.stringify({
						contentTypeAlias: t,
						classification: n
					})
				})).ok) {
					e++, this._items = this._items.map((e) => e.contentTypeAlias === t ? {
						...e,
						classification: n,
						suggestedClassification: null
					} : e);
					let r = new Map(this._pendingChanges);
					r.delete(t), this._pendingChanges = r;
				}
				e > 0 && (this.#r(), k(2, "classify"));
			} finally {
				this._saving = !1;
			}
		}
	}
	#l(e) {
		return this._pendingChanges.get(e.contentTypeAlias) ?? e.classification ?? "";
	}
	#u(e) {
		let t = this.#l(e), n = this._pendingChanges.has(e.contentTypeAlias);
		return S`
            <div class="item-row">
                <div class="name-col">
                    <span class="name" title=${e.contentTypeName}>${e.contentTypeName}</span>
                    <span class="path" title=${e.folderPath}>${e.folderPath}</span>
                </div>
                <code>${e.contentTypeAlias}</code>
                <span class="badge ${e.isElement ? "element" : ""}">
                    ${e.isElement ? "Element" : "Document"}
                </span>
                <div>
                    <select
                        class=${t ? "" : "unclassified"}
                        .value=${t}
                        @change=${(t) => this.#i(e.contentTypeAlias, t.target.value)}
                    >
                        <option value="">— Unclassified —</option>
                        ${zn.map((e) => S`<option value=${e} ?selected=${t === e}>${e}</option>`)}
                    </select>
                    ${e.suggestedClassification && !n ? S`<span
                              class="suggestion"
                              @click=${() => this.#a(e.contentTypeAlias, e.suggestedClassification)}
                              >Suggest: ${e.suggestedClassification}</span
                          >` : C}
                </div>
            </div>
        `;
	}
	#d(e, t, n = !1) {
		return t.length === 0 ? C : S`
            <details ?open=${n}>
                <summary>
                    <span class=${e === "Unclassified" ? "sinful-label" : ""}>${e}</span>
                    <span class="group-count">${t.length}</span>
                </summary>
                ${t.map((e) => this.#u(e))}
            </details>
        `;
	}
	render() {
		let e = this._items.filter((e) => !e.classification), t = (e) => this._items.filter((t) => t.classification === e), n = e.length;
		return S`
            <uui-box headline="II — Four content types: Page, Block, Data, Composition">
                ${this._loading ? S`<uui-loader-bar></uui-loader-bar>` : this._items.length === 0 ? S`<div class="empty">No content types found.</div>` : S`
                            <div class="stats">
                                <uui-button
                                    look="outline"
                                    .disabled=${this._categorizing}
                                    @click=${() => void this.#s()}
                                >
                                    ${this._categorizing ? "Categorizing…" : "Auto Categorize"}
                                </uui-button>
                                ${n > 0 ? S`<span class="stat-chip sinful">⚠ ${n} unclassified</span>` : S`<span class="stat-chip clean">✓ All classified</span>`}
                                ${zn.map((e) => {
			let n = t(e).length;
			return n > 0 ? S`<span class="stat-chip">${e}: ${n}</span>` : C;
		})}
                            </div>

                            ${this.#d("Unclassified", e, !0)}
                            ${zn.map((e) => this.#d(e, t(e)))}
                            <div class="save-bar">
                                <uui-button
                                    look="primary"
                                    .disabled=${this._pendingChanges.size === 0 || this._saving}
                                    @click=${() => void this.#c()}
                                >
                                    ${this._saving ? "Saving…" : "Save"}
                                </uui-button>
                            </div>
                        `}
            </uui-box>
        `;
	}
};
G([O()], J.prototype, "_items", void 0), G([O()], J.prototype, "_loading", void 0), G([O()], J.prototype, "_saving", void 0), G([O()], J.prototype, "_categorizing", void 0), G([O()], J.prototype, "_pendingChanges", void 0), J = G([D("sinners-four-sacred-types")], J);
//#endregion
//#region src/penance/commandments/data-types-in-folders.element.ts
var Vn = "/umbraco/management/api/v1/sinners", Y = class extends e(E) {
	constructor(...e) {
		super(...e), this._items = [], this._loading = !0, this._organizing = !1, this._lastMessage = null;
	}
	#e;
	static {
		this.styles = l`
        .clean {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .toolbar {
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
        }

        .count {
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
        }

        .organize-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 700;
            border: none;
            background: var(--sinners-action-btn-bg, #1b264f);
            color: var(--sinners-action-btn-color, white);
            cursor: pointer;
        }

        .organize-btn:hover { opacity: 0.88; }

        .organize-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .folder-group {
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
        }

        .folder-group:last-child { border-bottom: none; }

        .folder-header {
            padding: 8px 16px;
            background: var(--uui-color-surface-alt, #fafafa);
            font-size: 12px;
            font-weight: 700;
            font-family: monospace;
            color: var(--uui-color-text-alt, #888);
            letter-spacing: 0.03em;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
        }

        .dt-row {
            padding: 8px 16px 8px 28px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f5f5f5);
            font-size: 12px;
        }

        .dt-row:last-child { border-bottom: none; }

        .dt-name {
            flex: 1;
            font-weight: 500;
        }

        .built-in-badge {
            font-size: 12px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 3px;
            background: var(--uui-color-surface-emphasis, #e8e8e8);
            color: var(--uui-color-text-alt, #888);
            white-space: nowrap;
        }

        .result-banner {
            margin: 8px 16px 4px;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            color: var(--sinners-on-bright, white);
        }

        .result-banner.success {
            background: var(--uui-color-positive-standalone, #0d7a54);
        }

        .result-banner.error {
            background: var(--uui-color-danger-standalone, #d42054);
        }
    `;
	}
	connectedCallback() {
		super.connectedCallback(), W.registerSteps("III", this, [{
			label: "Organize data types",
			clicks: () => [...this.renderRoot.querySelectorAll(".organize-btn")],
			run: () => this.#r()
		}], "data-types"), this.consumeContext(n, (e) => {
			this.#e = e, this.#n();
		});
	}
	async #t(e, t = {}) {
		let n = await this.#e?.getLatestToken();
		return fetch(e, {
			...t,
			headers: {
				"Content-Type": "application/json",
				...n ? { Authorization: `Bearer ${n}` } : {},
				...t.headers ?? {}
			}
		});
	}
	async #n() {
		this._loading = !0;
		try {
			let e = await this.#t(`${Vn}/unorganized-data-types`);
			e.ok && (this._items = await e.json());
			let t = this._items.length;
			this.dispatchEvent(new CustomEvent("sinners-status", {
				bubbles: !0,
				composed: !0,
				detail: {
					issueCount: t,
					severity: t > 0 ? "error" : "ok"
				}
			}));
		} finally {
			this._loading = !1;
		}
	}
	async #r() {
		this._organizing = !0, this._lastMessage = null;
		try {
			let e = await this.#t(`${Vn}/organize-data-types`, { method: "POST" });
			if (e.ok) {
				let t = await e.json();
				this._lastMessage = {
					success: !0,
					text: `Organized ${t.organizedCount} data type(s) into folders.`
				}, await this.#n(), k(3, "organize-data-types");
			} else this._lastMessage = {
				success: !1,
				text: `Failed to organize data types (HTTP ${e.status}).`
			};
		} catch (e) {
			this._lastMessage = {
				success: !1,
				text: String(e)
			};
		} finally {
			this._organizing = !1;
		}
	}
	#i() {
		let e = /* @__PURE__ */ new Map();
		for (let t of this._items) {
			let n = e.get(t.targetFolder) ?? [];
			n.push(t), e.set(t.targetFolder, n);
		}
		return e;
	}
	render() {
		let e = this._lastMessage;
		return S`
            <uui-box headline="III — The root is bare: data types live in folders">
                ${e ? S`<div class="result-banner ${e.success ? "success" : "error"}">${e.text}</div>` : C}
                ${this._loading ? S`<uui-loader-bar></uui-loader-bar>` : this._items.length === 0 ? S`<div class="clean">✓ All data types are in folders.</div>` : S`
                            <div class="toolbar">
                                <span class="count">${this._items.length} data type(s) need organizing</span>
                                <button
                                    class="organize-btn"
                                    ?disabled=${this._organizing}
                                    @click=${this.#r}>
                                    ${this._organizing ? "⏳ Organizing…" : "⊞ Organize All"}
                                </button>
                            </div>
                            ${[...this.#i().entries()].map(([e, t]) => S`
                                <div class="folder-group">
                                    <div class="folder-header">${e}</div>
                                    ${t.map((e) => S`
                                        <div class="dt-row">
                                            <span class="dt-name">${e.name}</span>
                                            ${e.isBuiltIn ? S`<span class="built-in-badge">built-in</span>` : C}
                                        </div>
                                    `)}
                                </div>
                            `)}
                        `}
            </uui-box>
        `;
	}
};
G([O()], Y.prototype, "_items", void 0), G([O()], Y.prototype, "_loading", void 0), G([O()], Y.prototype, "_organizing", void 0), G([O()], Y.prototype, "_lastMessage", void 0), Y = G([D("sinners-data-types-in-folders")], Y);
//#endregion
//#region src/penance/magic.ts
var Hn = !1;
function Un() {
	if (Hn) return;
	let e = document.createElement("style");
	e.textContent = "\n        @keyframes sinners-magic-fade {\n            0%   { opacity: 0; }\n            20%  { opacity: 1; }\n            80%  { opacity: 1; }\n            100% { opacity: 0; }\n        }\n        .sinners-magic-overlay {\n            position: fixed !important;\n            top: 0 !important;\n            left: 0 !important;\n            width: 100vw !important;\n            height: 100vh !important;\n            z-index: 2147483647 !important;\n            background: rgba(0, 0, 0, 0.85) !important;\n            display: flex !important;\n            align-items: center !important;\n            justify-content: center !important;\n            pointer-events: none !important;\n            animation: sinners-magic-fade 1.8s ease forwards !important;\n        }\n        .sinners-magic-word {\n            font-size: 96px !important;\n            font-weight: 900 !important;\n            font-style: italic !important;\n            background: linear-gradient(90deg, #ff6b35, #f7c59f, #efefd0, #00b4d8, #9b5de5) !important;\n            -webkit-background-clip: text !important;\n            -webkit-text-fill-color: transparent !important;\n            background-clip: text !important;\n            white-space: nowrap !important;\n        }\n    ", document.head.appendChild(e), Hn = !0;
}
function Wn(e) {
	Un();
	let t = document.createElement("div");
	t.className = "sinners-magic-overlay";
	let n = document.createElement("span");
	n.className = "sinners-magic-word", n.textContent = "✨ Magic ✨", t.appendChild(n), document.documentElement.appendChild(t), setTimeout(() => {
		t.remove(), e();
	}, 1800);
}
//#endregion
//#region src/penance/commandments/program-cs-clean.element.ts
var Gn = "/umbraco/management/api/v1/sinners", Kn = "var i̸̖l̷̼l̴̮i̵̗g̸̫a̷̮l̶̼ = app.UseUmbraco();\n\ni̸̖l̷̼l̴̮i̵̗g̸̫a̷̮l̶̼.WithMiddleware(u =>\n    {\n        u.UseBackOffice();\n        u.UseWebsite();\n    })\n    .WithEndpoints(u =>\n    {\n        u.UseBackOfficeEndpoints();\n        u.UseWebsiteEndpoints();\n    });", qn = "app.UseUmbraco()\n    .WithMiddleware(u =>\n    {\n        u.UseBackOffice();\n        u.UseWebsite();\n    })\n    .WithEndpoints(u =>\n    {\n        u.UseBackOfficeEndpoints();\n        u.UseWebsiteEndpoints();\n    });\n\nawait app.RunAsync();", Jn = class extends e(E) {
	constructor(...e) {
		super(...e), this._result = null, this._loading = !0;
	}
	#e;
	static {
		this.styles = l`
        .clean {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .not-found {
            padding: 16px;
            color: var(--uui-color-text-alt, #888);
            font-size: 13px;
        }

        .issue-list {
            padding: 8px 0;
        }

        .issue-row {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 10px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            font-size: 13px;
        }

        .issue-row:last-child { border-bottom: none; }

        .issue-icon {
            font-size: 15px;
            flex-shrink: 0;
            margin-top: 1px;
        }

        .issue-body {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .issue-title {
            font-weight: 600;
            color: var(--uui-color-danger-standalone, #d42054);
        }

        .issue-detail {
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
            font-family: monospace;
        }

        .diff-block {
            display: flex;
            gap: 16px;
            padding: 16px;
            align-items: flex-start;
        }

        .diff-side {
            flex: 1;
            min-width: 0;
        }

        .diff-label {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 6px;
        }

        .diff-label.before { color: var(--uui-color-danger-standalone, #d42054); }
        .diff-label.after  { color: var(--uui-color-positive-standalone, #0d7a54); }

        .diff-arrow {
            font-size: 24px;
            padding-top: 42px;
            color: var(--uui-color-text-alt, #aaa);
            flex-shrink: 0;
        }

        pre {
            margin: 0;
            padding: 12px 14px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 12px;
            line-height: 1.6;
            white-space: pre;
            overflow-x: auto;
        }

        pre.before {
            background: #fff0f3;
            border: 1px solid #ffc0cb;
            color: #6b0020;
        }

        pre.after {
            background: #f0fff4;
            border: 1px solid #9ae6b4;
            color: #1a4731;
        }

        .fix-btn {
            margin: 0 16px 16px;
        }

    `;
	}
	connectedCallback() {
		super.connectedCallback(), W.registerSteps("IV", this, [{
			label: "Cleanse Program.cs",
			clicks: () => [...this.renderRoot.querySelectorAll(".fix-btn")],
			run: () => this.#n()
		}]), this.consumeContext(n, (e) => {
			this.#e = e, this.#t();
		});
	}
	async #t() {
		this._loading = !0;
		try {
			let e = await this.#e?.getLatestToken(), t = await fetch(`${Gn}/program-cs-audit`, { headers: e ? { Authorization: `Bearer ${e}` } : {} });
			t.ok && (this._result = await t.json());
			let n = this._result ? +!!this._result.useUmbracoSavedToVariable + this._result.extraMiddleware.length + this._result.extraEndpoints.length : 0;
			this.dispatchEvent(new CustomEvent("sinners-status", {
				bubbles: !0,
				composed: !0,
				detail: {
					issueCount: n,
					severity: n > 0 ? "error" : "ok"
				}
			}));
		} finally {
			this._loading = !1;
		}
	}
	async #n() {
		let e = await this.#e?.getLatestToken();
		await fetch(`${Gn}/fix-program-cs`, {
			method: "POST",
			headers: e ? { Authorization: `Bearer ${e}` } : {}
		}), Wn(() => {
			k(4, "cleanse-program-cs"), this.#t();
		});
	}
	#r(e) {
		let t = [];
		for (let n of e.extraMiddleware) t.push({
			title: "Non-standard middleware registered",
			detail: `u.${n}()  — found inside .WithMiddleware(...)`
		});
		for (let n of e.extraEndpoints) t.push({
			title: "Non-standard endpoint registered",
			detail: `u.${n}()  — found inside .WithEndpoints(...)`
		});
		return S`
            ${e.useUmbracoSavedToVariable ? S`
                <div class="diff-block">
                    <div class="diff-side">
                        <div class="diff-label before">Before — thy sin</div>
                        <pre class="before">${Kn}</pre>
                    </div>
                    <div class="diff-arrow">→</div>
                    <div class="diff-side">
                        <div class="diff-label after">After — absolved</div>
                        <pre class="after">${qn}</pre>
                    </div>
                </div>
                <uui-button class="fix-btn" look="secondary" @click=${() => void this.#n()}>
                    ✨ Apply the fix
                </uui-button>
            ` : ""}
            ${t.length > 0 ? S`
                <div class="issue-list">
                    ${t.map((e) => S`
                        <div class="issue-row">
                            <span class="issue-icon">✕</span>
                            <div class="issue-body">
                                <span class="issue-title">${e.title}</span>
                                <span class="issue-detail">${e.detail}</span>
                            </div>
                        </div>
                    `)}
                </div>
            ` : ""}
        `;
	}
	render() {
		let e = this._result;
		return S`
            <uui-box headline="IV — Compose in thy IComposer, not Program.cs">
                ${this._loading ? S`<uui-loader-bar></uui-loader-bar>` : !e || !e.found ? S`<div class="not-found">Program.cs not found at the application root.</div>` : e.isClean ? S`<div class="clean">✓ Program.cs looks clean.</div>` : this.#r(e)}
            </uui-box>
        `;
	}
};
G([O()], Jn.prototype, "_result", void 0), G([O()], Jn.prototype, "_loading", void 0), Jn = G([D("sinners-program-cs-clean")], Jn);
//#endregion
//#region src/penance/commandments/production-settings.element.ts
var Yn = "/umbraco/management/api/v1/sinners", Xn = class extends e(E) {
	constructor(...e) {
		super(...e), this._result = null, this._loading = !0, this._blessing = /* @__PURE__ */ new Set();
	}
	#e;
	static {
		this.styles = l`
        .clean {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .scanned {
            padding: 8px 16px 12px;
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
        }

        .warning-header {
            padding: 12px 16px 6px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
            color: var(--uui-color-warning-standalone, #92400e);
        }

        .warning-sub {
            padding: 0 16px 10px;
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
        }

        .setting-row {
            padding: 10px 16px;
            border-top: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: grid;
            grid-template-columns: 1fr auto auto;
            gap: 12px;
            align-items: center;
            background: color-mix(in srgb, #f0ac00 12%, var(--uui-color-surface, #fff));
        }

        .setting-row.blessed {
            opacity: 0.55;
            background: var(--uui-color-surface-alt, #fafafa);
        }

        .setting-key {
            font-family: monospace;
            font-size: 12px;
            color: var(--uui-color-text, #1c1917);
            word-break: break-all;
        }

        .setting-value {
            font-family: monospace;
            font-size: 12px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 3px;
            background: color-mix(in srgb, #f0ac00 30%, var(--uui-color-surface, #fff));
            color: var(--uui-color-text, #92400e);
            white-space: nowrap;
            border: 1px solid color-mix(in srgb, #f0ac00 70%, var(--uui-color-surface, #fff));
        }

        .setting-row.blessed .setting-value {
            background: var(--uui-color-surface-emphasis, #e8e8e8);
            color: var(--uui-color-text-alt, #888);
            border-color: var(--uui-color-border-standalone, #ccc);
        }

        .bless-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            border: 1px solid var(--uui-color-border-standalone, #d0d0d0);
            background: var(--uui-color-surface, #fff);
            color: var(--uui-color-text, #555);
            cursor: pointer;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .bless-btn:hover { background: var(--uui-color-surface-alt, #f5f5f5); }

        .bless-btn.blessed {
            border-color: var(--uui-color-positive-standalone, #0d7a54);
            color: var(--uui-color-positive-standalone, #0d7a54);
        }

        .bless-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;
	}
	connectedCallback() {
		super.connectedCallback(), W.registerSteps("V", this, [{
			label: "Bless all settings",
			clicks: () => [...this.renderRoot.querySelectorAll(".bless-btn:not(.blessed)")],
			run: () => this.#t()
		}]), this.consumeContext(n, (e) => {
			this.#e = e, this.#r();
		});
	}
	async #t() {
		for (let e = 0; e < 10; e++) {
			let e = (this._result?.missingSettings ?? []).find((e) => !e.isBlessed);
			if (!e) break;
			console.log(`[RULE V] blessing "${e.key}"`), await this.#i(e, !0);
		}
	}
	async #n(e, t = {}) {
		let n = await this.#e?.getLatestToken();
		return fetch(e, {
			...t,
			headers: {
				"Content-Type": "application/json",
				...n ? { Authorization: `Bearer ${n}` } : {},
				...t.headers ?? {}
			}
		});
	}
	async #r() {
		this._loading = !0;
		try {
			let e = await this.#n(`${Yn}/production-readiness`);
			e.ok && (this._result = await e.json());
			let t = this._result?.missingSettings.filter((e) => !e.isBlessed).length ?? 0;
			this.dispatchEvent(new CustomEvent("sinners-status", {
				bubbles: !0,
				composed: !0,
				detail: {
					issueCount: t,
					severity: t > 0 ? "warning" : "ok"
				}
			}));
		} finally {
			this._loading = !1;
		}
	}
	async #i(e, t) {
		this._blessing = new Set([...this._blessing, e.key]);
		try {
			await this.#n(`${Yn}/bless-production-setting`, {
				method: "POST",
				body: JSON.stringify({
					settingKey: e.key,
					blessed: t
				})
			}), await this.#r(), t && k(5, "bless");
		} finally {
			this._blessing = new Set([...this._blessing].filter((t) => t !== e.key));
		}
	}
	render() {
		let e = this._result, t = e ? S`<div class="scanned">Scanned: ${e.scannedFiles.join(", ")}</div>` : null;
		return S`
            <uui-box headline="V — A production site runs in production mode">
                ${this._loading ? S`<uui-loader-bar></uui-loader-bar>` : e ? e.isReady ? S`
                              <div class="clean">✓ Production settings found across your appsettings files.</div>
                              ${t}
                          ` : S`
                              <div class="warning-header">⚠ You better have a pipeline somewhere that sets these</div>
                              <div class="warning-sub">
                                  Scanned ${e.scannedFiles.join(", ")} — the following production settings were not found
                                  with valid values in any of them.
                              </div>
                              ${e.missingSettings.map((e) => {
			let t = this._blessing.has(e.key);
			return S`
                                      <div class="setting-row ${e.isBlessed ? "blessed" : ""}">
                                          <span class="setting-key">${e.key}</span>
                                          <span class="setting-value">${e.expectedValue}</span>
                                          <button
                                              class="bless-btn ${e.isBlessed ? "blessed" : ""}"
                                              ?disabled=${t}
                                              @click=${() => this.#i(e, !e.isBlessed)}
                                              title=${e.isBlessed ? "Remove blessing — surface this setting as an issue again" : "My pipeline handles this — bless it"}>
                                              ${t ? "⏳" : e.isBlessed ? "✦ Blessed" : "✦ Bless"}
                                          </button>
                                      </div>
                                  `;
		})}
                              ${t}
                          ` : null}
            </uui-box>
        `;
	}
};
G([O()], Xn.prototype, "_result", void 0), G([O()], Xn.prototype, "_loading", void 0), G([O()], Xn.prototype, "_blessing", void 0), Xn = G([D("sinners-production-settings")], Xn);
//#endregion
//#region src/penance/commandments/alias-audit.element.ts
var Zn = "/umbraco/management/api/v1/sinners", Qn = class extends e(E) {
	constructor(...e) {
		super(...e), this._items = [], this._loading = !0, this._blessing = /* @__PURE__ */ new Set();
	}
	#e;
	static {
		this.styles = l`
        .clean {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .issue-row {
            padding: 12px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
            align-items: start;
        }

        .issue-row:last-child { border-bottom: none; }
        .issue-row:hover { background: var(--uui-color-surface-alt, #fafafa); }

        .issue-row.blessed { opacity: 0.55; }

        .name-block {
            display: flex;
            flex-direction: column;
            gap: 5px;
            min-width: 0;
        }

        .name {
            font-weight: 600;
            font-size: 13px;
        }

        .alias {
            font-family: monospace;
            font-size: 12px;
            color: var(--uui-color-text-alt, #555);
        }

        .path {
            font-size: 12px;
            color: var(--uui-color-text-alt, #8d8d8d);
            font-family: monospace;
        }

        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 3px;
        }

        .tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 7px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
        }

        .tag.error {
            background: var(--uui-color-danger-standalone, #d42054);
            color: var(--sinners-on-bright, white);
        }

        .tag.warning {
            background: #f0ac00;
            color: #1d0d00;
        }

        .tag code {
            font-family: monospace;
            font-weight: 400;
            opacity: 0.85;
        }

        .bless-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            border: 1px solid var(--uui-color-border-standalone, #d0d0d0);
            background: var(--uui-color-surface, #fff);
            color: var(--uui-color-text-alt, #555);
            cursor: pointer;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .bless-btn:hover { background: var(--uui-color-surface-alt, #f5f5f5); }

        .bless-btn.blessed {
            border-color: var(--uui-color-positive-standalone, #0d7a54);
            color: var(--uui-color-positive-standalone, #0d7a54);
        }

        .bless-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;
	}
	connectedCallback() {
		super.connectedCallback(), W.registerSteps("VI", this, [{
			label: "Bless first alias",
			clicks: () => [...this.renderRoot.querySelectorAll(".bless-btn:not(.blessed)")].slice(0, 1),
			run: () => {
				let e = this._items.find((e) => !e.isBlessed);
				if (e) return this.#r(e, !0);
			}
		}], "aliases"), this.consumeContext(n, (e) => {
			this.#e = e, this.#n();
		});
	}
	async #t(e, t = {}) {
		let n = await this.#e?.getLatestToken();
		return fetch(e, {
			...t,
			headers: {
				"Content-Type": "application/json",
				...n ? { Authorization: `Bearer ${n}` } : {},
				...t.headers ?? {}
			}
		});
	}
	async #n() {
		this._loading = !0;
		try {
			let e = await this.#t(`${Zn}/alias-issues`);
			e.ok && (this._items = await e.json());
			let t = this._items.filter((e) => !e.isBlessed && !e.isCamelCase).length, n = this._items.filter((e) => !e.isBlessed && e.isCamelCase && e.unrecognizedWords.length > 0).length, r = t + n, i = t > 0 ? "error" : n > 0 ? "warning" : "ok";
			this.dispatchEvent(new CustomEvent("sinners-status", {
				bubbles: !0,
				composed: !0,
				detail: {
					issueCount: r,
					severity: i
				}
			}));
		} finally {
			this._loading = !1;
		}
	}
	async #r(e, t) {
		this._blessing = new Set([...this._blessing, e.contentTypeAlias]);
		try {
			await this.#t(`${Zn}/bless-alias`, {
				method: "POST",
				body: JSON.stringify({
					contentTypeAlias: e.contentTypeAlias,
					blessed: t
				})
			}), await this.#n(), t && k(6, "bless");
		} finally {
			this._blessing = new Set([...this._blessing].filter((t) => t !== e.contentTypeAlias));
		}
	}
	#i(e) {
		let t = this._blessing.has(e.contentTypeAlias);
		return S`
            <div class="issue-row ${e.isBlessed ? "blessed" : ""}">
                <div class="name-block">
                    <span class="name">${e.contentTypeName}</span>
                    <span class="alias">${e.contentTypeAlias}</span>
                    <span class="path">${e.folderPath}</span>
                    <div class="tags">
                        ${e.isCamelCase ? C : S`<span class="tag error">✕ Not camelCase</span>`}
                        ${e.unrecognizedWords.map((e) => S`
                            <span class="tag warning">? <code>${e}</code></span>
                        `)}
                    </div>
                </div>
                <button
                    class="bless-btn ${e.isBlessed ? "blessed" : ""}"
                    ?disabled=${t}
                    @click=${() => this.#r(e, !e.isBlessed)}
                    title=${e.isBlessed ? "Remove blessing — surface this alias as an issue again" : "Mark this alias as intentionally named"}>
                    ${t ? "⏳" : e.isBlessed ? "✦ Blessed" : "✦ Bless"}
                </button>
            </div>
        `;
	}
	render() {
		return S`
            <uui-box headline="VI — Thy names: aliases are English camelCase">
                ${this._loading ? S`<uui-loader-bar></uui-loader-bar>` : this._items.length === 0 ? S`<div class="clean">✓ All document type aliases are valid camelCase English.</div>` : S`${this._items.map((e) => this.#i(e))}`}
            </uui-box>
        `;
	}
};
G([O()], Qn.prototype, "_items", void 0), G([O()], Qn.prototype, "_loading", void 0), G([O()], Qn.prototype, "_blessing", void 0), Qn = G([D("sinners-alias-audit")], Qn);
//#endregion
//#region src/penance/commandments/translation-audit.element.ts
var $n = "/umbraco/management/api/v1/sinners", X = class extends e(E) {
	constructor(...e) {
		super(...e), this.mode = "naming", this._result = null, this._loading = !0, this._blessing = /* @__PURE__ */ new Set(), this._grouping = /* @__PURE__ */ new Set();
	}
	#e;
	static {
		this.styles = l`
        .clean {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .issue-row {
            padding: 12px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
            align-items: center;
        }

        .issue-row:last-child { border-bottom: none; }
        .issue-row:hover { background: var(--uui-color-surface-alt, #fafafa); }
        .issue-row.blessed { opacity: 0.55; }

        .key {
            font-family: monospace;
            font-weight: 600;
            font-size: 13px;
        }

        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 5px;
        }

        .tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 7px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
        }

        .tag.error { background: var(--uui-color-danger-standalone, #d42054); color: var(--sinners-on-bright, white); }
        .tag.warning { background: #f0ac00; color: #1d0d00; }
        .tag code { font-family: monospace; font-weight: 400; opacity: 0.85; }

        .bless-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            border: 1px solid var(--uui-color-border-standalone, #d0d0d0);
            background: var(--uui-color-surface, #fff);
            color: var(--uui-color-text-alt, #555);
            cursor: pointer;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .bless-btn:hover { background: var(--uui-color-surface-alt, #f5f5f5); }
        .bless-btn.blessed { border-color: var(--uui-color-positive-standalone, #0d7a54); color: var(--uui-color-positive-standalone, #0d7a54); }
        .bless-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .section-divider {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px 4px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--uui-color-text-alt, #888);
            border-top: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            margin-top: 4px;
        }

        .group-row {
            padding: 12px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
            align-items: start;
        }

        .group-row:last-child { border-bottom: none; }
        .group-row:hover { background: var(--uui-color-surface-alt, #fafafa); }

        .proposed-parent {
            font-family: monospace;
            font-weight: 700;
            font-size: 13px;
            color: var(--uui-color-interactive, #1b264f);
        }

        .group-children {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 6px;
        }

        .child-chip {
            font-family: monospace;
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 3px;
            background: var(--uui-color-surface-emphasis, #e8e8e8);
            color: var(--uui-color-text-alt, #555);
        }

        .group-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 5px 11px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            border: none;
            background: var(--sinners-action-btn-bg, #1b264f);
            color: var(--sinners-action-btn-color, white);
            cursor: pointer;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .group-btn:hover { opacity: 0.88; }
        .group-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `;
	}
	connectedCallback() {
		super.connectedCallback(), this.mode === "grouping" && W.registerSteps("III", this, [{
			label: "Group all dictionary keys",
			clicks: () => [...this.renderRoot.querySelectorAll(".group-btn")],
			run: () => this.#i()
		}], "dictionary"), this.consumeContext(n, (e) => {
			this.#e = e, this.#n();
		});
	}
	async #t(e, t = {}) {
		let n = await this.#e?.getLatestToken();
		return fetch(e, {
			...t,
			headers: {
				"Content-Type": "application/json",
				...n ? { Authorization: `Bearer ${n}` } : {},
				...t.headers ?? {}
			}
		});
	}
	async #n() {
		this._loading = !0;
		try {
			let e = await this.#t(`${$n}/translation-audit`);
			e.ok && (this._result = await e.json());
			let t = this._result, n = t?.issues.filter((e) => !e.isBlessed && !e.isPascalCase).length ?? 0, r = t?.issues.filter((e) => !e.isBlessed && e.isPascalCase && e.unrecognizedWords.length > 0).length ?? 0, i = t?.groupSuggestions.length ?? 0, a = this.mode === "grouping" ? i : n + r, o = this.mode === "grouping" ? i > 0 ? "warning" : "ok" : n > 0 ? "error" : a > 0 ? "warning" : "ok";
			this.dispatchEvent(new CustomEvent("sinners-status", {
				bubbles: !0,
				composed: !0,
				detail: {
					issueCount: a,
					severity: o
				}
			}));
		} finally {
			this._loading = !1;
		}
	}
	async #r(e, t) {
		this._blessing = new Set([...this._blessing, e.itemKey]);
		try {
			await this.#t(`${$n}/bless-translation`, {
				method: "POST",
				body: JSON.stringify({
					itemKey: e.itemKey,
					blessed: t
				})
			}), await this.#n(), t && k(6, "bless");
		} finally {
			this._blessing = new Set([...this._blessing].filter((t) => t !== e.itemKey));
		}
	}
	async #i() {
		for (let e = 0; e < 50; e++) {
			let e = this._result?.groupSuggestions[0];
			if (!e) break;
			await this.#a(e, !1);
		}
		k(3, "group-dictionary");
	}
	async #a(e, t = !0) {
		this._grouping = new Set([...this._grouping, e.proposedParentKey]);
		try {
			await this.#t(`${$n}/create-translation-group`, {
				method: "POST",
				body: JSON.stringify({
					parentKey: e.proposedParentKey,
					childIds: e.children.map((e) => e.id)
				})
			}), await this.#n(), t && k(3, "group-dictionary");
		} finally {
			this._grouping = new Set([...this._grouping].filter((t) => t !== e.proposedParentKey));
		}
	}
	#o(e) {
		return e.length === 0 ? C : S`
            ${e.map((e) => {
			let t = this._blessing.has(e.itemKey);
			return S`
                    <div class="issue-row ${e.isBlessed ? "blessed" : ""}">
                        <div>
                            <span class="key">${e.itemKey}</span>
                            <div class="tags">
                                ${e.isPascalCase ? C : S`<span class="tag error">✕ Not PascalCase</span>`}
                                ${e.unrecognizedWords.map((e) => S`
                                    <span class="tag warning">? <code>${e}</code></span>
                                `)}
                            </div>
                        </div>
                        <button
                            class="bless-btn ${e.isBlessed ? "blessed" : ""}"
                            ?disabled=${t}
                            @click=${() => this.#r(e, !e.isBlessed)}
                            title=${e.isBlessed ? "Remove blessing" : "Mark this key as intentionally named"}>
                            ${t ? "⏳" : e.isBlessed ? "✦ Blessed" : "✦ Bless"}
                        </button>
                    </div>
                `;
		})}
        `;
	}
	#s(e) {
		return e.length === 0 ? C : S`
            <div class="section-divider">Ungrouped keys</div>
            ${e.map((e) => {
			let t = this._grouping.has(e.proposedParentKey);
			return S`
                    <div class="group-row">
                        <div>
                            <span class="proposed-parent">${e.proposedParentKey}</span>
                            <div class="group-children">
                                ${e.children.map((e) => S`<span class="child-chip">${e.itemKey}</span>`)}
                            </div>
                        </div>
                        <button
                            class="group-btn"
                            ?disabled=${t}
                            @click=${() => this.#a(e)}
                            title="Create '${e.proposedParentKey}' as a parent and nest these keys under it">
                            ${t ? "⏳" : "⊞ Group"}
                        </button>
                    </div>
                `;
		})}
        `;
	}
	render() {
		let e = this._result, t = this.mode === "grouping", n = t ? (e?.groupSuggestions.length ?? 0) > 0 : (e?.issues.length ?? 0) > 0, r = t ? "III — A folder is only a folder: dotted keys nest under a parent" : "VI — Thy names: translation keys are PascalCase, dot-separated", i = t ? "✓ No dotted keys loose at the root — every group has its folder." : "✓ All translation keys are PascalCase English.";
		return S`
            <uui-box headline=${r}>
                ${this._loading ? S`<uui-loader-bar></uui-loader-bar>` : !n || !e ? S`<div class="clean">${i}</div>` : t ? this.#s(e.groupSuggestions) : this.#o(e.issues)}
            </uui-box>
        `;
	}
};
G([We()], X.prototype, "mode", void 0), G([O()], X.prototype, "_result", void 0), G([O()], X.prototype, "_loading", void 0), G([O()], X.prototype, "_blessing", void 0), G([O()], X.prototype, "_grouping", void 0), X = G([D("sinners-translation-audit")], X);
//#endregion
//#region src/penance/commandments/root-media.element.ts
var er = "/umbraco/management/api/v1/sinners", tr = class extends e(E) {
	constructor(...e) {
		super(...e), this._items = [], this._loading = !0, this._pretending = !1;
	}
	#e;
	static {
		this.styles = l`
        .clean {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .info {
            padding: 10px 16px 4px;
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
        }

        .item-row {
            padding: 10px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .item-row:last-child { border-bottom: none; }
        .item-row:hover { background: var(--uui-color-surface-alt, #fafafa); }

        .item-name {
            flex: 1;
            font-weight: 500;
            font-size: 13px;
        }

        .item-type {
            font-family: monospace;
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 3px;
            background: var(--uui-color-surface-emphasis, #e8e8e8);
            color: var(--uui-color-text-alt, #555);
            white-space: nowrap;
        }

        .item-date {
            font-size: 12px;
            color: var(--uui-color-text-alt, #aaa);
            white-space: nowrap;
        }

        .pretend-btn {
            margin: 12px 16px;
        }
    `;
	}
	connectedCallback() {
		super.connectedCallback(), W.registerSteps("III", this, [{
			label: "Pretend to fix the media root ✨",
			clicks: () => [...this.renderRoot.querySelectorAll(".pretend-btn")],
			run: () => this.#i()
		}], "media"), this.consumeContext(n, (e) => {
			this.#e = e, this.#n();
		});
	}
	async #t(e, t = {}) {
		let n = await this.#e?.getLatestToken();
		return fetch(e, {
			...t,
			headers: {
				...n ? { Authorization: `Bearer ${n}` } : {},
				...t.headers ?? {}
			}
		});
	}
	async #n() {
		this._loading = !0;
		try {
			let e = !1;
			try {
				e = sessionStorage.getItem(dn) === "1";
			} catch {}
			if (e) {
				await this.#t(`${er}/forget-pretences`, { method: "POST" });
				try {
					sessionStorage.removeItem(dn);
				} catch {}
			}
			let t = await this.#t(`${er}/root-media`);
			if (t.ok) {
				let e = await t.json();
				this._items = e.items, this._pretending = e.pretending;
			}
			this.#r();
		} finally {
			this._loading = !1;
		}
	}
	#r() {
		let e = this._pretending ? 0 : this._items.length;
		this.dispatchEvent(new CustomEvent("sinners-status", {
			bubbles: !0,
			composed: !0,
			detail: {
				issueCount: e,
				severity: e > 0 ? "error" : "ok"
			}
		}));
	}
	async #i() {
		this._items.length !== 0 && (await this.#t(`${er}/pretend-root-media`, { method: "POST" })).ok && Wn(() => {
			this._pretending = !0, this.#r(), k(3, "pretend-media", !0);
		});
	}
	render() {
		let e = this._pretending ? [] : this._items;
		return S`
            <uui-box headline="III — The root is bare: no media at the root">
                ${this._loading ? S`<uui-loader-bar></uui-loader-bar>` : e.length === 0 ? S`<div class="clean">✓ No media items loose at root — everything is in a folder.</div>` : S`
                            <div class="info">
                                ${e.length} media item(s) are sitting directly at root.
                                Move them into a folder.
                            </div>
                            ${e.map((e) => S`
                                <div class="item-row">
                                    <span class="item-name">${e.name}</span>
                                    <span class="item-type">${e.mediaTypeAlias}</span>
                                    <span class="item-date">${new Date(e.createDate).toLocaleDateString()}</span>
                                </div>
                            `)}
                            <uui-button class="pretend-btn" look="secondary" @click=${() => this.#i()}>
                                ✨ Let's pretend it's fixed
                            </uui-button>
                        `}
            </uui-box>
        `;
	}
};
G([O()], tr.prototype, "_items", void 0), G([O()], tr.prototype, "_loading", void 0), G([O()], tr.prototype, "_pretending", void 0), tr = G([D("sinners-root-media")], tr);
//#endregion
//#region src/penance/commandments/views-confession.element.ts
var nr = "/umbraco/management/api/v1/sinners", rr = class extends e(E) {
	constructor(...e) {
		super(...e), this._result = null, this._loading = !0, this._confessing = !1;
	}
	#e;
	static {
		this.styles = l`
        .clean {
            padding: 16px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .info {
            padding: 12px 16px;
            font-size: 13px;
            color: var(--uui-color-text-alt, #666);
            line-height: 1.6;
        }

        .file-row {
            padding: 10px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            border-top: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            font-family: monospace;
            font-size: 13px;
        }

        .count {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 22px;
            height: 22px;
            padding: 0 6px;
            border-radius: 11px;
            font-family: inherit;
            font-size: 12px;
            font-weight: 700;
            color: var(--sinners-on-bright, white);
            background: var(--uui-color-danger-standalone, #d42054);
        }

        .hit {
            padding: 10px 16px;
            border-top: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
            align-items: start;
        }

        .where {
            font-family: monospace;
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
        }

        .code {
            display: block;
            margin-top: 4px;
            padding: 6px 8px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 12px;
            white-space: pre-wrap;
            word-break: break-all;
            background: var(--uui-color-surface-emphasis, #f0f0f0);
        }

        .tag {
            padding: 2px 7px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
            color: var(--sinners-on-bright, white);
            background: var(--uui-color-danger-standalone, #d42054);
        }

        .tag.confessed {
            background: var(--uui-color-positive-standalone, #0d7a54);
        }

        .confess-btn {
            margin: 12px 16px 16px;
        }
    `;
	}
	connectedCallback() {
		super.connectedCallback(), W.registerSteps("VII", this, [{
			label: "Confess",
			clicks: () => [...this.renderRoot.querySelectorAll(".confess-btn")],
			run: () => this.#i()
		}]), this.consumeContext(n, (e) => {
			this.#e = e, this.#n();
		});
	}
	async #t(e, t = {}) {
		let n = await this.#e?.getLatestToken();
		return fetch(e, {
			...t,
			headers: {
				...n ? { Authorization: `Bearer ${n}` } : {},
				...t.headers ?? {}
			}
		});
	}
	async #n() {
		this._loading = !0;
		try {
			let e = await this.#t(`${nr}/views-confession`);
			e.ok && (this._result = await e.json()), this.#r();
		} finally {
			this._loading = !1;
		}
	}
	#r() {
		let e = this._result?.hits.filter((e) => !e.isConfessed).length ?? 0;
		this.dispatchEvent(new CustomEvent("sinners-status", {
			bubbles: !0,
			composed: !0,
			detail: {
				issueCount: e,
				severity: e > 0 ? "error" : "ok"
			}
		}));
	}
	async #i() {
		if (this._result?.hits.some((e) => !e.isConfessed)) {
			this._confessing = !0;
			try {
				let e = await this.#t(`${nr}/confess`, { method: "POST" });
				e.ok && (this._result = await e.json(), this.#r(), k(7, "confess"));
			} finally {
				this._confessing = !1;
			}
		}
	}
	#a(e) {
		let t = /* @__PURE__ */ new Map();
		for (let n of e) t.set(n.file, (t.get(n.file) ?? 0) + 1);
		return S`
            <div class="info">
                ${e.length} sin(s) hide in thy views: tree walks and the content service, run on every
                request. A view shall render what it is given. The code cannot be fixed from here — but it can be confessed.
            </div>
            ${[...t.entries()].map(([e, t]) => S`
                <div class="file-row"><span>${e}</span><span class="count">${t}</span></div>
            `)}
            <uui-button class="confess-btn" look="primary" color="danger"
                ?disabled=${this._confessing}
                @click=${() => void this.#i()}>
                ${this._confessing ? "⏳ Confessing…" : "🕯 Confess"}
            </uui-button>
        `;
	}
	#o(e) {
		return e.map((e) => S`
            <div class="hit">
                <div>
                    <span class="where">${e.file}:${e.line} — ${e.pattern}</span>
                    <code class="code">${e.text}</code>
                </div>
                <span class="tag ${e.isConfessed ? "confessed" : ""}">${e.isConfessed ? "✓ Confessed" : "✕ Unconfessed"}</span>
            </div>
        `);
	}
	render() {
		let e = this._result, t = e?.hits ?? [], n = t.filter((e) => !e.isConfessed);
		return S`
            <uui-box headline="VII — Views render; they don’t search">
                ${this._loading && !e ? S`<uui-loader-bar></uui-loader-bar>` : e?.viewsFound ? t.length === 0 ? S`<div class="clean">✓ No view searcheth the tree. Thy views render what they are given.</div>` : n.length > 0 && n.length === t.length ? this.#a(t) : S`
                                <div class="info">
                                    ${n.length === 0 ? S`Thou hast confessed. The code is as sinful as before; thy conscience is not.` : C}
                                </div>
                                ${this.#o(t)}
                                ${n.length > 0 ? S`<uui-button class="confess-btn" look="primary" color="danger"
                                            ?disabled=${this._confessing}
                                            @click=${() => void this.#i()}>🕯 Confess the rest</uui-button>` : C}
                            ` : S`<div class="info">No Views folder at the content root — nothing to confess.</div>`}
            </uui-box>
        `;
	}
};
G([O()], rr.prototype, "_result", void 0), G([O()], rr.prototype, "_loading", void 0), G([O()], rr.prototype, "_confessing", void 0), rr = G([D("sinners-views-confession")], rr);
//#endregion
//#region src/penance/commandments/exodus.element.ts
var ir = "/umbraco/management/api/v1/sinners", Z = class extends e(E) {
	constructor(...e) {
		super(...e), this._audit = null, this._loading = !0, this._leading = !1, this._result = null, this._error = null;
	}
	#e;
	static {
		this.styles = l`
        .clean {
            padding: 16px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .info {
            padding: 12px 16px;
            font-size: 13px;
            color: var(--uui-color-text-alt, #666);
            line-height: 1.6;
        }

        .sinner {
            padding: 12px 16px;
            border-top: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
            align-items: center;
        }

        .name {
            font-weight: 600;
            font-size: 13px;
        }

        .detail {
            margin-top: 3px;
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
        }

        .detail code {
            font-family: monospace;
        }

        .count {
            font-size: 22px;
            font-weight: 800;
            color: var(--uui-color-danger-standalone, #d42054);
            white-space: nowrap;
        }

        .count small {
            font-size: 12px;
            font-weight: 600;
            color: var(--uui-color-text-alt, #888);
        }

        .banner {
            margin: 12px 16px 4px;
            padding: 10px 12px;
            border-radius: 4px;
            font-size: 12px;
            line-height: 1.6;
            color: var(--sinners-on-bright, white);
            background: var(--uui-color-positive-standalone, #0d7a54);
        }

        .banner.error {
            background: var(--uui-color-danger-standalone, #d42054);
        }

        .banner code {
            font-family: monospace;
        }

        .exodus-btn {
            margin: 12px 16px 16px;
        }
    `;
	}
	connectedCallback() {
		super.connectedCallback(), W.registerSteps("VIII", this, [{
			label: "Exodus",
			clicks: () => [...this.renderRoot.querySelectorAll(".exodus-btn")],
			run: () => this.#r()
		}]), this.consumeContext(n, (e) => {
			this.#e = e, this.#n();
		});
	}
	async #t(e, t = {}) {
		let n = await this.#e?.getLatestToken();
		return fetch(e, {
			...t,
			headers: {
				...n ? { Authorization: `Bearer ${n}` } : {},
				...t.headers ?? {}
			}
		});
	}
	async #n() {
		this._loading = !0;
		try {
			let e = await this.#t(`${ir}/exodus-audit`);
			e.ok && (this._audit = await e.json());
			let t = this._audit?.sinners.length ?? 0;
			this.dispatchEvent(new CustomEvent("sinners-status", {
				bubbles: !0,
				composed: !0,
				detail: {
					issueCount: t,
					severity: t > 0 ? "error" : "ok"
				}
			}));
		} finally {
			this._loading = !1;
		}
	}
	async #r() {
		if (this._audit?.sinners.length) {
			this._leading = !0, this._error = null;
			try {
				let e = await this.#t(`${ir}/exodus`, { method: "POST" });
				if (!e.ok) {
					this._error = `The sea did not part (HTTP ${e.status}).`;
					return;
				}
				this._result = await e.json(), await this.#n(), k(8, "exodus");
			} catch (e) {
				this._error = String(e);
			} finally {
				this._leading = !1;
			}
		}
	}
	#i(e) {
		return S`
            <div class="sinner">
                <div>
                    <div class="name">${e.name}</div>
                    <div class="detail">
                        ${e.kind === "warehouse" ? S`${e.contentTypeName} nodes (<code>${e.contentTypeAlias}</code>) under one parent — a warehouse, not a website. Limit ${e.threshold}.` : S`${e.contentTypeName} (<code>${e.contentTypeAlias}</code>) saved again and again — a log table in disguise. Limit ${e.threshold} versions.`}
                    </div>
                </div>
                <div class="count">${e.count} <small>${e.kind === "warehouse" ? "children" : "versions"}</small></div>
            </div>
        `;
	}
	#a(e) {
		return S`
            <div class="banner">
                Let my content go. ${e.deletedNodes} node(s) left the tree and ${e.prunedVersions} version(s) were pruned,
                in ${(e.elapsedMs / 1e3).toFixed(1)} s. They dwell now in
                ${e.files.map((t, n) => S`${n > 0 ? ", " : ""}<code>${e.exportFolder}/${t.file}</code>`)} —
                put them in a real database.
            </div>
        `;
	}
	render() {
		let e = this._audit;
		return S`
            <uui-box headline="VIII — Umbraco is not thy database">
                ${this._result ? this.#a(this._result) : C}
                ${this._error ? S`<div class="banner error">${this._error}</div>` : C}
                ${this._loading && !e ? S`<uui-loader-bar></uui-loader-bar>` : !e || e.sinners.length === 0 ? S`<div class="clean">✓ No warehouses, no log tables. Thy content tree holdeth only content.</div>` : S`
                            <div class="info">
                                More than ${e.childThreshold} children of one type under one parent, or more than
                                ${e.versionThreshold} versions of one node: that is data, and data belongeth in a database.
                            </div>
                            ${e.sinners.map((e) => this.#i(e))}
                            <uui-button class="exodus-btn" look="primary" color="danger"
                                ?disabled=${this._leading}
                                @click=${() => void this.#r()}>
                                ${this._leading ? "⏳ Parting the sea…" : "🌊 Exodus: export and lead them out"}
                            </uui-button>
                        `}
            </uui-box>
        `;
	}
};
G([O()], Z.prototype, "_audit", void 0), G([O()], Z.prototype, "_loading", void 0), G([O()], Z.prototype, "_leading", void 0), G([O()], Z.prototype, "_result", void 0), G([O()], Z.prototype, "_error", void 0), Z = G([D("sinners-exodus")], Z);
//#endregion
//#region src/penance/commandments/root-content.element.ts
var ar = "/umbraco/management/api/v1/sinners", or = class extends e(E) {
	constructor(...e) {
		super(...e), this._result = null, this._loading = !0, this._seeking = !1, this._sanctuaryMessage = null;
	}
	#e;
	static {
		this.styles = l`
        .clean {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .info {
            padding: 12px 16px;
            font-size: 13px;
            color: var(--uui-color-text-alt, #666);
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            line-height: 1.5;
        }

        .item-row {
            padding: 10px 16px;
            border-bottom: 1px solid var(--uui-color-border-standalone, #f0f0f0);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .item-row:last-child { border-bottom: none; }
        .item-row:hover { background: var(--uui-color-surface-alt, #fafafa); }

        .item-name {
            flex: 1;
            font-weight: 500;
            font-size: 13px;
        }

        .item-type {
            font-family: monospace;
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 3px;
            background: var(--uui-color-surface-emphasis, #e8e8e8);
            color: var(--uui-color-text-alt, #555);
            white-space: nowrap;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
        }

        .badge.ok {
            background: var(--uui-color-positive-standalone, #0d7a54);
            color: var(--sinners-on-bright, white);
        }

        .badge.error {
            background: var(--uui-color-danger-standalone, #d42054);
            color: var(--sinners-on-bright, white);
        }

        .action-row {
            padding: 14px 16px;
            border-top: 1px solid var(--uui-color-border-standalone, #f0f0f0);
        }

        .sanctuary-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 700;
            border: none;
            background: var(--sinners-action-btn-bg, #1b264f);
            color: var(--sinners-action-btn-color, white);
            cursor: pointer;
        }

        .sanctuary-btn:hover { opacity: 0.88; }
        .sanctuary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .sanctuary-message {
            margin: 14px 16px;
            padding: 14px 16px;
            border-radius: 4px;
            border-left: 4px solid var(--uui-color-positive-standalone, #0d7a54);
            background: var(--uui-color-surface-alt, #f7faf9);
            font-size: 13px;
            line-height: 1.6;
            color: var(--uui-color-text, #333);
        }

        .error-message {
            margin: 14px 16px;
            padding: 14px 16px;
            border-radius: 4px;
            border-left: 4px solid var(--uui-color-danger-standalone, #d42054);
            background: #fff5f7;
            font-size: 13px;
            color: var(--uui-color-danger-standalone, #d42054);
        }
    `;
	}
	connectedCallback() {
		super.connectedCallback(), W.registerSteps("IX", this, [{
			label: "Seek Root Sanctuary",
			clicks: () => [...this.renderRoot.querySelectorAll(".sanctuary-btn")],
			run: () => this.#r()
		}]), this.consumeContext(n, (e) => {
			this.#e = e, this.#n();
		});
	}
	async #t(e, t = {}) {
		let n = await this.#e?.getLatestToken();
		return fetch(e, {
			...t,
			headers: {
				"Content-Type": "application/json",
				...n ? { Authorization: `Bearer ${n}` } : {},
				...t.headers ?? {}
			}
		});
	}
	async #n() {
		this._loading = !0;
		try {
			let e = await this.#t(`${ar}/root-content-audit`);
			e.ok && (this._result = await e.json());
			let t = this._result?.rootNodes.filter((e) => e.hasTemplate).length ?? 0;
			this.dispatchEvent(new CustomEvent("sinners-status", {
				bubbles: !0,
				composed: !0,
				detail: {
					issueCount: t,
					severity: t > 0 ? "error" : "ok"
				}
			}));
		} finally {
			this._loading = !1;
		}
	}
	async #r() {
		this._seeking = !0, this._sanctuaryMessage = null;
		try {
			let e = await this.#t(`${ar}/seek-root-sanctuary`, { method: "POST" });
			if (e.ok) {
				let t = await e.json();
				this._sanctuaryMessage = t.success ? t.message : `⚠ ${t.message}`, t.success && (await this.#n(), k(9, "root-sanctuary"));
			}
		} finally {
			this._seeking = !1;
		}
	}
	render() {
		let e = this._result, t = e?.rootNodes.filter((e) => e.hasTemplate) ?? [];
		return S`
            <uui-box headline="IX — A root node is not a rendering node">
                ${this._loading ? S`<uui-loader-bar></uui-loader-bar>` : e?.isClean ? S`
                            <div class="clean">✓ No root node beareth a template. The root is unrenderable and righteous.</div>
                            ${this._sanctuaryMessage ? S`<div class="sanctuary-message">${this._sanctuaryMessage}</div>` : ""}
                            ${e.rootNodes.map((e) => S`
                                <div class="item-row">
                                    <span class="item-name">${e.name}</span>
                                    <span class="item-type">${e.contentTypeAlias}</span>
                                    <span class="badge ok">✓ Templateless</span>
                                </div>
                            `)}` : S`
                            <div class="info">
                                ${t.length} root node(s) beareth a template. The Library now shelters thy shared
                                content — the root's only calling is to hold structure, never to render. Seek sanctuary below.
                            </div>
                            ${e?.rootNodes.map((e) => S`
                                <div class="item-row">
                                    <span class="item-name">${e.name}</span>
                                    <span class="item-type">${e.contentTypeAlias}${e.templateAlias ? ` → ${e.templateAlias}` : ""}</span>
                                    <span class="badge ${e.hasTemplate ? "error" : "ok"}">
                                        ${e.hasTemplate ? "✕ Rendereth" : "✓ Templateless"}
                                    </span>
                                </div>
                            `)}
                            ${this._sanctuaryMessage ? S`<div class="sanctuary-message">${this._sanctuaryMessage}</div>` : S`
                                    <div class="action-row">
                                        <button
                                            class="sanctuary-btn"
                                            ?disabled=${this._seeking}
                                            @click=${this.#r}>
                                            ${this._seeking ? "⏳ Building sanctuary..." : "⛪ Seek Root Sanctuary"}
                                        </button>
                                    </div>
                                `}
                        `}
            </uui-box>
        `;
	}
};
G([O()], or.prototype, "_result", void 0), G([O()], or.prototype, "_loading", void 0), G([O()], or.prototype, "_seeking", void 0), G([O()], or.prototype, "_sanctuaryMessage", void 0), or = G([D("sinners-root-content")], or);
//#endregion
//#region src/penance/commandments/usync-audit.element.ts
var sr = "/umbraco/management/api/v1/sinners", cr = class extends e(E) {
	constructor(...e) {
		super(...e), this._result = null, this._loading = !0;
	}
	#e;
	static {
		this.styles = l`
        .clean {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--uui-color-positive-standalone, #0d7a54);
            font-weight: 600;
        }

        .error-block {
            padding: 16px;
        }

        .error-heading {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 700;
            font-size: 14px;
            color: var(--uui-color-danger-standalone, #d42054);
            margin-bottom: 8px;
        }

        .error-body {
            font-size: 13px;
            color: var(--uui-color-text-alt, #666);
            line-height: 1.6;
        }

        .code {
            font-family: monospace;
            background: var(--uui-color-surface-emphasis, #e8e8e8);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
        }

        .warn-block {
            padding: 16px;
            font-size: 13px;
            color: var(--uui-color-text-alt, #888);
        }

        .pretend-btn {
            margin: 16px;
        }

    `;
	}
	connectedCallback() {
		super.connectedCallback(), W.registerSteps("X", this, [{
			label: "Pretend to uSync ✨",
			clicks: () => [...this.renderRoot.querySelectorAll(".pretend-btn")],
			run: () => this.#n()
		}]), this.consumeContext(n, (e) => {
			this.#e = e, this.#t();
		});
	}
	async #t() {
		this._loading = !0;
		try {
			let e = await this.#e?.getLatestToken(), t = await fetch(`${sr}/usync-audit`, { headers: e ? { Authorization: `Bearer ${e}` } : {} });
			t.ok && (this._result = await t.json());
			let n = this._result, r = n?.csprojFound && !n.hasUSync && !n.hasUmbracoDeploy ? 1 : 0;
			this.dispatchEvent(new CustomEvent("sinners-status", {
				bubbles: !0,
				composed: !0,
				detail: {
					issueCount: r,
					severity: r > 0 ? "error" : "ok"
				}
			}));
		} finally {
			this._loading = !1;
		}
	}
	async #n() {
		let e = await this.#e?.getLatestToken(), t = await fetch(`${sr}/inject-usync`, {
			method: "POST",
			headers: e ? { Authorization: `Bearer ${e}` } : {}
		});
		t.ok || console.warn(`[SINNERS] inject-usync answered ${t.status}`), await new Promise((e) => Wn(e)), await this.#t(), k(10, "pretend-usync", !0);
	}
	render() {
		let e = this._result;
		return S`
            <uui-box headline="X — uSync when not on Umbraco Cloud">
                ${this._loading ? S`<uui-loader-bar></uui-loader-bar>` : e?.csprojFound ? e.hasUSync ? S`<div class="clean">✓ uSync is installed in <span class="code">${e.csprojName}</span> — thy schema walketh not alone.</div>` : e.hasUmbracoDeploy ? S`<div class="clean">✓ Umbraco.Deploy is installed in <span class="code">${e.csprojName}</span> — thy schema walketh not alone.</div>` : S`
                                <div class="error-block">
                                    <div class="error-heading">✕ No schema versioning tool is installed</div>
                                    <div class="error-body">
                                        <span class="code">${e.csprojName}</span> contains no reference to
                                        <span class="code">uSync</span> or <span class="code">Umbraco.Deploy</span>.
                                        Without either, thy Document Types and Data Types exist only in the database —
                                        unversioned, undeployable, and one migration away from perdition.<br><br>
                                        Install <span class="code">uSync</span> (open-source) or
                                        <span class="code">Umbraco.Deploy</span> (commercial) and commit thy
                                        schema files to source control to be absolved.
                                    </div>
                                </div>
                                <uui-button class="pretend-btn" look="secondary" @click=${() => void this.#n()}>
                                    ✨ Let's pretend we have uSync
                                </uui-button>
                            ` : S`<div class="warn-block">No .csproj file found at the content root — unable to inspect thy project.</div>`}
            </uui-box>
        `;
	}
};
G([O()], cr.prototype, "_result", void 0), G([O()], cr.prototype, "_loading", void 0), cr = G([D("sinners-usync-audit")], cr);
//#endregion
//#region src/penance/penance-dashboard.element.ts
var Q = [
	{
		id: "I",
		label: "I — Content is not composable",
		parts: ["I"]
	},
	{
		id: "II",
		label: "II — Four content types",
		parts: ["II"]
	},
	{
		id: "III",
		label: "III — The root is bare, a folder is only a folder",
		parts: [
			"III.data-types",
			"III.dictionary",
			"III.media"
		]
	},
	{
		id: "IV",
		label: "IV — Compose in thy IComposer, not Program.cs",
		parts: ["IV"]
	},
	{
		id: "V",
		label: "V — Production runs in production mode",
		parts: ["V"]
	},
	{
		id: "VI",
		label: "VI — Thy names",
		parts: ["VI.aliases", "VI.keys"]
	},
	{
		id: "VII",
		label: "VII — Views render; they don’t search",
		parts: ["VII"]
	},
	{
		id: "VIII",
		label: "VIII — Umbraco is not thy database",
		parts: ["VIII"]
	},
	{
		id: "IX",
		label: "IX — A root node is not a rendering node",
		parts: ["IX"]
	},
	{
		id: "X",
		label: "X — uSync when not on Umbraco Cloud",
		parts: ["X"]
	}
], lr = {
	ok: 0,
	warning: 1,
	error: 2
}, ur = Q.flatMap((e) => e.parts), dr = 1700, fr = 1300, pr = "umb-theme-alias", mr = (e) => !!e?.startsWith("sinners-spooky-"), hr = {
	0: "Righteous — thy backoffice is clean",
	1: "A whisper of darkness",
	2: "The shadows stir",
	3: "Candles flicker and die",
	4: "The walls bleed slightly",
	5: "Something ancient awakens",
	6: "The abyss gazes back",
	7: "Hell hath taken notice",
	8: "The damned rejoice",
	9: "All is lost",
	10: "THOU ART BEYOND ALL REDEMPTION"
}, $ = class extends e(E) {
	constructor(...e) {
		super(...e), this.#t = new URLSearchParams(window.location.search).has("debug"), this._activeTab = "I", this._statuses = /* @__PURE__ */ new Map(), this._spookyFactor = 0, this._fastForward = "", this.#n = !1, this.#r = !1, this._landing = "no", this._counting = null, this._slam = !1, this.#i = null, this.#a = !1, this.#o = !1;
	}
	#e;
	#t;
	#n;
	#r;
	#i;
	#a;
	#o;
	static {
		this.styles = l`
        :host {
            display: block;
            padding: 14px 24px 48px;
        }

        .hero {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 16px;
        }

        .hero h1 {
            font-size: 38px;
            line-height: 1;
            font-weight: 900;
            letter-spacing: 0.01em;
            margin: 0;
        }

        /* the verdict: the one line the room should read */
        .verdict {
            margin: 10px 0 0 0;
            font-size: 24px;
            line-height: 1.1;
            font-style: italic;
            font-weight: 700;
            /* the theme's accent, leaned towards the text colour: on its own it goes dull in the middle levels */
            color: color-mix(in srgb, var(--uui-color-selected-standalone, #3544b1) 55%, var(--uui-color-text, #1b264f));
            letter-spacing: 0.05em;
        }

        /* every sin on the site, counted: it falls as they're absolved */
        .tally {
            display: flex;
            align-items: baseline;
            gap: 12px;
            line-height: 1;
            white-space: nowrap;
        }

        .tally b {
            font-size: 62px;
            font-weight: 900;
            font-variant-numeric: tabular-nums;
            color: var(--uui-color-danger-standalone, #d42054);
        }

        .tally.clean b { color: var(--uui-color-positive-standalone, #0d7a54); }

        /* after the fall: the verdict and the tally hit the page */
        .verdict.slam { transform-origin: 0 50%; animation: slam 0.75s cubic-bezier(0.2, 1.5, 0.35, 1) both; }
        .tally.slam b { display: inline-block; transform-origin: 100% 100%; animation: slam 0.75s cubic-bezier(0.2, 1.5, 0.35, 1) both; text-shadow: 0 0 28px var(--uui-color-danger-standalone, #d42054); }
        @keyframes slam {
            0% { transform: scale(2.6); opacity: 0; }
            55% { opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }

        .tally span {
            font-size: 20px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            color: var(--uui-color-text-alt, #8d8d8d);
        }

        /* the ten, in a row: numeral and count. The commandment's name is the heading of its pane */
        .tab-strip {
            display: grid;
            grid-template-columns: repeat(10, 1fr);
            gap: 8px;
            margin-bottom: 18px;
        }

        .tab-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            height: 86px;
            padding: 0;
            border: 2px solid var(--uui-color-border, #d8d7d9);
            border-radius: 10px;
            background: var(--uui-color-surface, #fff);
            cursor: pointer;
            font: inherit;
            color: var(--uui-color-text, #333);
            transition: color 0.15s, border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.15s;
        }

        .tab-btn .numeral {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 30px;
            line-height: 1;
            font-weight: 700;
            letter-spacing: 0.06em;
        }

        .tab-btn:hover { border-color: var(--uui-color-border-emphasis, #a1a1a1); }

        .tab-btn.active {
            color: var(--uui-color-selected-contrast, #fff);
            border-color: var(--uui-color-selected-standalone, #3544b1);
            background: var(--uui-color-selected, #3544b1);
            box-shadow: 0 0 22px color-mix(in srgb, var(--uui-color-selected-standalone, #3544b1) 60%, transparent);
            transform: translateY(-2px);
        }

        /* a commandment kept: its tile is ringed in the theme's green */
        .tab-btn.absolved { border-color: var(--uui-color-positive-standalone, #0d7a54); }

        .status-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 40px;
            height: 30px;
            padding: 0 10px;
            border-radius: 15px;
            font-size: 22px;
            line-height: 1;
            font-weight: 800;
            font-variant-numeric: tabular-nums;
            flex-shrink: 0;
        }

        .status-badge.pending {
            background: var(--uui-color-border-standalone, #e0e0e0);
            width: 40px;
        }

        .status-badge.ok {
            background: var(--uui-color-positive-standalone, #0d7a54);
            color: var(--sinners-on-bright, white);
        }

        .status-badge.warning {
            background: #f0ac00;
            color: #1d0d00;
        }

        .status-badge.error {
            background: var(--uui-color-danger-standalone, #d42054);
            color: var(--sinners-on-bright, white);
        }

        /* on the lit tile the count sits on a dark plate, so it still reads */
        .tab-btn.active .status-badge.error,
        .tab-btn.active .status-badge.warning {
            background: rgba(20, 6, 2, 0.78);
            color: #fff3df;
        }

        .tab-content {
            min-width: 0;
            /* the panes are drawn small (see the top): shown at 1.6×, about 20 px text */
            zoom: 1.6;
            /* each pane's box: its heading is the commandment, so it's set large, and the box's own
               padding is cut (the panes pad themselves) to keep the fix buttons above the fold */
            --uui-type-h5-size: 19px;
            --uui-box-header-padding: 10px 16px;
            --uui-box-default-padding: 4px 6px;
        }

        /* the save-me at work (presenter.fastForward): say so, large, so nobody presses meanwhile */
        .fast-forward {
            margin-bottom: 14px;
            padding: 12px 18px;
            border-radius: 10px;
            background: #f0ac00;
            color: #1d0d00;
            font-size: 24px;
            font-weight: 800;
        }

        .fast-forward span { font-weight: 400; }

        .debug-strip {
            margin-top: 32px;
            padding: 14px 16px;
            border: 1px dashed var(--uui-color-border-standalone, #ccc);
            border-radius: 4px;
            background: var(--uui-color-surface-alt, #fafafa);
            font-size: 12px;
            color: var(--uui-color-text-alt, #888);
        }

        .debug-strip label {
            display: block;
            font-weight: 700;
            margin-bottom: 4px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            font-size: 10px;
        }

        .debug-strip .spooky-label {
            font-size: 13px;
            font-style: italic;
            margin-bottom: 8px;
            color: var(--uui-color-text, #333);
        }

        .debug-strip input[type=range] {
            width: 100%;
        }

        .pane {
            flex-direction: column;
            gap: var(--uui-size-space-5, 24px);
        }
    `;
	}
	connectedCallback() {
		super.connectedCallback();
		let e = W.activeTab;
		e && Q.some((t) => t.id === e) && (this._activeTab = e, this.#r = !0), W.setActiveTab(this._activeTab);
		try {
			this.#i = localStorage.getItem(pr);
		} catch {}
		!mr(this.#i) && !W.fastForwardTo && !this.#t && (this._landing = "pure", W.hold(this, !0)), W.onNextTab(this, () => {
			this.#r = !0;
			let e = Q.map((e) => e.id), t = e[(e.indexOf(this._activeTab) + 1) % e.length];
			this._activeTab = t, W.setActiveTab(t);
		}), this.consumeContext(t, (e) => {
			this.#e = e, e && this.observe(e.theme, (e) => {
				this.#i = e ?? this.#i;
			}, "sinnersBoardTheme"), this.#u();
		}), Qe();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), W.hold(this, !1);
	}
	#s(e) {
		let t = e.parts.map((e) => this._statuses.get(e));
		if (t.some((e) => !e)) return;
		let n = t;
		return {
			issueCount: n.reduce((e, t) => e + t.issueCount, 0),
			severity: n.filter((e) => e.issueCount > 0).reduce((e, t) => lr[t.severity] > lr[e] ? t.severity : e, "ok")
		};
	}
	get #c() {
		return Q.filter((e) => (this.#s(e)?.issueCount ?? 0) > 0).length;
	}
	get #l() {
		return this._spookyFactor > 0 ? this._spookyFactor : this.#c;
	}
	#u() {
		if (this._spookyFactor === 0 && !ur.every((e) => this._statuses.has(e))) return;
		let e = this.#l;
		if (this._landing !== "falling") {
			if (this._landing === "pure") {
				if (e > 0 && !mr(this.#i) && this.#e) {
					this.#a || (this.#a = !0, setTimeout(() => void this.#d(), dr));
					return;
				}
				this._landing = "no", W.hold(this, !1);
			}
			this.#e?.setThemeByAlias(e > 0 ? Ye(e) : "umb-light-theme"), e > 0 && this.#e && !this.#o && (this.#o = !0, $e());
		}
	}
	async #d() {
		if (!(!this.isConnected || this._landing !== "pure")) {
			this._landing = "falling";
			try {
				await Ln(() => {
					this._landing = "no", this._slam = !0, this.#u(), this.#f();
				});
			} finally {
				this._landing !== "no" && (this._landing = "no", this.#u()), W.hold(this, !1);
			}
		}
	}
	#f() {
		let e = performance.now(), t = () => {
			let n = Math.min(1, (performance.now() - e) / fr);
			if (n >= 1 || !this.isConnected) {
				this._counting = null;
				return;
			}
			this._counting = 1 - (1 - n) ** 3, requestAnimationFrame(t);
		};
		this._counting = 0, requestAnimationFrame(t);
	}
	#p(e) {
		this._spookyFactor = +e.target.value, this.#u();
	}
	#m(e, t) {
		if (this._statuses = new Map(this._statuses).set(e, t), this._spookyFactor === 0 && this.#u(), this.#h(), !this.#r && ur.every((e) => this._statuses.has(e))) {
			this.#r = !0;
			let e = Q.find((e) => (this.#s(e)?.issueCount ?? 0) > 0);
			e && (this._activeTab = e.id, W.setActiveTab(e.id));
		}
	}
	#h() {
		let e = W.fastForwardTo;
		!e || this.#n || !ur.every((e) => this._statuses.has(e)) || (this.#n = !0, this.#r = !0, this._fastForward = e, W.fastForward(e, (e) => this.#s(Q.find((t) => t.id === e))?.issueCount ?? 0, (e) => {
			this._activeTab = e;
		}).catch((e) => console.error("[PRESENTER] fast-forward failed", e)).finally(() => {
			this._fastForward = "", this._activeTab = e, W.setActiveTab(e);
		}));
	}
	get #g() {
		return this._landing !== "no";
	}
	#_(e) {
		let t = this.#s(e);
		return t ? t.issueCount === 0 || this.#g ? S`<span class="status-badge ok">✓</span>` : S`<span class="status-badge ${t.severity}">${t.issueCount}</span>` : S`<span class="status-badge pending"></span>`;
	}
	#v() {
		if (!ur.every((e) => this._statuses.has(e))) return C;
		let e = [...this._statuses.values()].reduce((e, t) => e + t.issueCount, 0), t = this.#g ? 0 : this._counting == null ? e : Math.round(e * this._counting);
		return S`<div class="tally ${t === 0 ? "clean" : ""} ${this._slam ? "slam" : ""}"><b>${t}</b><span>${t === 1 ? "sin" : "sins"}</span></div>`;
	}
	#y(e, t) {
		return S`<div class="pane" style="display:${this._activeTab === e ? "flex" : "none"}">${t}</div>`;
	}
	#b(e) {
		return (t) => this.#m(e, t.detail);
	}
	render() {
		return S`
            ${this._fastForward ? S`<div class="fast-forward">⏩ Absolving everything before ${this._fastForward}… <span>(now: ${this._activeTab})</span></div>` : C}
            <div class="hero">
                <div>
                    <h1>Penance Board</h1>
                    ${ur.every((e) => this._statuses.has(e)) ? S`<p class="verdict ${this._slam ? "slam" : ""}">${hr[this.#g ? 0 : this.#l]}</p>` : C}
                </div>
                ${this.#v()}
            </div>

            <div class="tab-strip">
                ${Q.map((e) => S`
                    <button
                        class="tab-btn ${this._activeTab === e.id && !this.#g ? "active" : ""} ${this.#s(e)?.issueCount === 0 || this.#g && this.#s(e) ? "absolved" : ""}"
                        title=${e.label}
                        @click=${() => {
			this.#r = !0, this._activeTab = e.id, W.setActiveTab(e.id);
		}}>
                        <span class="numeral">${e.id}</span>
                        ${this.#_(e)}
                    </button>
                `)}
            </div>

            <div class="tab-content" style=${this.#g ? "visibility:hidden" : ""}>
                ${this.#y("I", S`
                    <sinners-content-not-composable @sinners-status=${this.#b("I")}></sinners-content-not-composable>`)}
                ${this.#y("II", S`
                    <sinners-four-sacred-types @sinners-status=${this.#b("II")}></sinners-four-sacred-types>`)}
                ${this.#y("III", S`
                    <sinners-data-types-in-folders @sinners-status=${this.#b("III.data-types")}></sinners-data-types-in-folders>
                    <sinners-translation-audit mode="grouping" @sinners-status=${this.#b("III.dictionary")}></sinners-translation-audit>
                    <sinners-root-media @sinners-status=${this.#b("III.media")}></sinners-root-media>`)}
                ${this.#y("IV", S`
                    <sinners-program-cs-clean @sinners-status=${this.#b("IV")}></sinners-program-cs-clean>`)}
                ${this.#y("V", S`
                    <sinners-production-settings @sinners-status=${this.#b("V")}></sinners-production-settings>`)}
                ${this.#y("VI", S`
                    <sinners-alias-audit @sinners-status=${this.#b("VI.aliases")}></sinners-alias-audit>
                    <sinners-translation-audit mode="naming" @sinners-status=${this.#b("VI.keys")}></sinners-translation-audit>`)}
                ${this.#y("VII", S`
                    <sinners-views-confession @sinners-status=${this.#b("VII")}></sinners-views-confession>`)}
                ${this.#y("VIII", S`
                    <sinners-exodus @sinners-status=${this.#b("VIII")}></sinners-exodus>`)}
                ${this.#y("IX", S`
                    <sinners-root-content @sinners-status=${this.#b("IX")}></sinners-root-content>`)}
                ${this.#y("X", S`
                    <sinners-usync-audit @sinners-status=${this.#b("X")}></sinners-usync-audit>`)}
            </div>

            ${this.#t ? S`
                <div class="debug-strip">
                    <label>Debug — Spooky Factor Override (auto: ${this.#c})</label>
                    <div class="spooky-label">${this.#l} — ${hr[this.#l]}</div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        .value=${String(this._spookyFactor)}
                        @input=${this.#p}>
                </div>` : C}
        `;
	}
};
G([O()], $.prototype, "_activeTab", void 0), G([O()], $.prototype, "_statuses", void 0), G([O()], $.prototype, "_spookyFactor", void 0), G([O()], $.prototype, "_fastForward", void 0), G([O()], $.prototype, "_landing", void 0), G([O()], $.prototype, "_counting", void 0), G([O()], $.prototype, "_slam", void 0), $ = G([D("sinners-penance-dashboard")], $);
//#endregion
//#region src/index.ts
var gr = [
	"̀",
	"́",
	"̂",
	"̃",
	"̅",
	"̈",
	"̊",
	"̋",
	"̌",
	"̓",
	"̽",
	"͂",
	"͊",
	"͋",
	"ͣ",
	"ͤ",
	"ͦ",
	"ͬ",
	"ͯ"
], _r = [
	"̖",
	"̗",
	"̘",
	"̜",
	"̝",
	"̣",
	"̤",
	"̥",
	"̦",
	"̩",
	"̬",
	"̮",
	"̰",
	"̲",
	"̳",
	"͇",
	"͈",
	"͓",
	"͚"
];
function vr(e) {
	return [...e].map((e, t) => {
		if (e === " ") return e;
		let n = t * 7 + e.charCodeAt(0) * 13, r = 3 + n % 3, i = e;
		for (let e = 0; e < r; e++) i += gr[(n + e * 3) % gr.length], i += _r[(n + e * 5 + 2) % _r.length];
		return i;
	}).join("");
}
var yr = [{
	type: "dashboard",
	alias: "Sinners.PenanceDashboard",
	name: "Penance",
	element: $,
	weight: 100,
	meta: {
		label: vr("Penance"),
		pathname: "penance"
	},
	conditions: [{
		alias: "Umb.Condition.SectionAlias",
		match: "Umb.Section.Settings"
	}]
}], br = new Set(["PageDown", "ArrowRight"]), xr = new Set([
	"PageUp",
	"ArrowLeft",
	"Escape"
]), Sr = new Set([
	"1",
	"2",
	"3",
	"4",
	"0"
]);
function Cr() {
	window.addEventListener("keydown", (e) => {
		document.documentElement.dataset.sinnersKeys !== "off" && (!br.has(e.key) && !xr.has(e.key) && e.key !== "." && !Sr.has(e.key) || (e.preventDefault(), e.stopPropagation(), !e.repeat && (console.log(`[CLICKER] key="${e.key}"`), br.has(e.key) ? W.forward() : e.key === "." || e.key === "3" ? W.dot() : e.key === "1" ? W.next() : e.key === "2" ? W.nextTab() : e.key === "4" ? window.location.reload() : e.key === "0" && W.reset())));
	}, !0);
}
var wr = "umb-theme-alias";
function Tr(e) {
	e.consumeContext(t, (t) => {
		t && e.observe(t.theme, (e) => {
			if (e?.startsWith("sinners-spooky-")) try {
				localStorage.setItem(wr, e);
			} catch {}
		}, "sinnersKeepTheme");
	});
}
var Er = (e, t) => {
	t.registerMany(yr), Xe(t), Tr(e), gt(e), Cr();
};
//#endregion
export { Er as onInit };

//# sourceMappingURL=dist.js.map