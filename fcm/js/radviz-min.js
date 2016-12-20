var utils = {
		merge: function(e, n) {
			for (var t in n) n[t] && n[t].constructor == Object && e[t] ? this.merge(e[t], n[t]) : e[t] = n[t]
		},
		mergeAll: function() {
			for (var e = {}, n = arguments, t = 0; t < n.length; t++) this.merge(e, n[t]);
			return e
		},
		htmlToNode: function(e, n) {
			for (; n.lastChild;) n.removeChild(n.lastChild);
			return this.appendHtmlToNode(e, n)
		},
		appendHtmlToNode: function(e, n) {
			return n.appendChild(document.importNode((new DOMParser).parseFromString(e, "text/html").body.childNodes[0], !0))
		}
	},
	radvizComponent = function() {
		var e = {
				el: null,
				size: 400,
				margin: 50,
				colorScale: d3.scale.ordinal().range(["skyblue", "orange", "lime"]),
				colorAccessor: null,
				dimensions: [],
				drawLinks: !0,
				zoomFactor: 1,
				dotRadius: 6,
				useRepulsion: !1,
				useTooltip: !0,
				tooltipFormatter: function(e) {
					return e
				}
			},
			n = d3.dispatch("panelEnter", "panelLeave", "dotEnter", "dotLeave"),
			t = d3.layout.force().chargeDistance(0).charge(-60).friction(.5),
			r = function(r) {
				r = i(r);
				var o = "_normalized",
					a = e.dimensions.map(function(e) {
						return e + o
					}),
					c = d3.scale.linear().domain([0, a.length]).range([0, 2 * Math.PI]),
					s = e.size / 2 - e.margin,
					l = r.length,
					u = e.size - 2 * e.margin,
					d = e.dimensions.map(function(n, t) {
						var r = c(t),
							o = s + Math.cos(r) * s * e.zoomFactor,
							i = s + Math.sin(r) * s * e.zoomFactor;
						return {
							index: l + t,
							x: o,
							y: i,
							fixed: !0,
							name: n
						}
					}),
					f = [];
				r.forEach(function(e, n) {
					a.forEach(function(t, r) {
						f.push({
							source: n,
							target: l + r,
							value: e[t]
						})
					})
				}), t.size([u, u]).linkStrength(function(e) {
					return e.value
				}).nodes(r.concat(d)).links(f).start();
				var p = d3.select(e.el).append("svg").attr({
					width: e.size,
					height: e.size
				});
				p.append("rect").classed("bg", !0).attr({
					width: e.size,
					height: e.size
				}); {
					var m = p.append("g").attr({
						transform: "translate(" + [e.margin, e.margin] + ")"
					});
					m.append("circle").classed("panel", !0).attr({
						r: s,
						cx: s,
						cy: s
					})
				}
				if (e.useRepulsion && (m.on("mouseenter", function() {
						t.chargeDistance(80).alpha(.2), n.panelEnter()
					}), m.on("mouseleave", function() {
						t.chargeDistance(0).resume(), n.panelLeave()
					})), e.drawLinks) var h = m.selectAll(".link").data(f).enter().append("line").classed("link", !0); {
					var g = m.selectAll("circle.dot").data(r).enter().append("circle").classed("dot", !0).attr({
						r: e.dotRadius,
						fill: function(n) {
							return e.colorScale(e.colorAccessor(n))
						}
					}).on("mouseenter", function(t) {
						if (e.useTooltip) {
							var r = d3.mouse(e.el);
							v.setText(e.tooltipFormatter(t)).setPosition(r[0], r[1]).show()
						}
						n.dotEnter(t), this.classList.add("active")
					}).on("mouseout", function(t) {
						e.useTooltip && v.hide(), n.dotLeave(t), this.classList.remove("active")
					});
					m.selectAll("circle.label-node").data(d).enter().append("circle").classed("label-node", !0).attr({
						cx: function(e) {
							return e.x
						},
						cy: function(e) {
							return e.y
						},
						r: 4
					}), m.selectAll("text.label").data(d).enter().append("text").classed("label", !0).attr({
						x: function(e) {
							return e.x
						},
						y: function(e) {
							return e.y
						},
						"text-anchor": function(e) {
							return e.x > .4 * u && e.x < .6 * u ? "middle" : e.x > u / 2 ? "start" : "end"
						},
						"dominant-baseline": function(e) {
							return e.y > .6 * u ? "hanging" : "auto"
						},
						dx: function(e) {
							return e.x > u / 2 ? "6px" : "-6px"
						},
						dy: function(e) {
							return e.y > .6 * u ? "6px" : "-6px"
						}
					}).text(function(e) {
						return e.name
					})
				}
				t.on("tick", function() {
					e.drawLinks && h.attr({
						x1: function(e) {
							return e.source.x
						},
						y1: function(e) {
							return e.source.y
						},
						x2: function(e) {
							return e.target.x
						},
						y2: function(e) {
							return e.target.y
						}
					}), g.attr({
						cx: function(e) {
							return e.x
						},
						cy: function(e) {
							return e.y
						}
					})
				});
				var x = d3.select(e.el).append("div").attr({
						id: "radviz-tooltip"
					}),
					v = tooltipComponent(x.node());
				return this
			},
			o = function(n) {
				return e = utils.mergeAll(e, n), this
			},
			i = function(n) {
				n.forEach(function(n) {
					e.dimensions.forEach(function(e) {
						n[e] = +n[e]
					})
				});
				var t = {};
				return e.dimensions.forEach(function(e) {
					t[e] = d3.scale.linear().domain(d3.extent(n.map(function(n) {
						return n[e]
					}))).range([0, 1])
				}), n.forEach(function(n) {
					e.dimensions.forEach(function(e) {
						n[e + "_normalized"] = t[e](n[e])
					})
				}), n
			},
			a = {
				config: o,
				render: r
			};
		return d3.rebind(a, n, "on"), a
	},
	tooltipComponent = function(e) {
		var n = d3.select(e).style({
				position: "absolute",
				"pointer-events": "none"
			}),
			t = function(e) {
				return n.html(e), this
			},
			r = function(e, t) {
				return n.style({
					left: e + "px",
					top: t + "px"
				}), this
			},
			o = function() {
				return n.style({
					display: "block"
				}), this
			},
			i = function() {
				return n.style({
					display: "none"
				}), this
			};
		return {
			setText: t,
			setPosition: r,
			show: o,
			hide: i
		}
	};