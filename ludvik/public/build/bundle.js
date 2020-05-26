
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const info = [
            {
                "Region": "Region Sør",
                "Tidsrom": "1. oktober klokka 08:00 til og med 30. november",
                "Minstemål": " 25 centimeter lang NB! Sjekk under",
                "Nødutgong": "Opning på minst 60mm i tilegg til bommulstråd til luke",
                "Søknad": "Påmelding her https://bit.ly/2TBKcpX"
            },
            {
              "Region": "Region Nord",
              "Tidsrom": "1. oktober klokka 08:00 til og med  31. desember.",
              "Minstemål": " 25 centimeter lang",
              "Nødutgong": "Opning på minst 60mm i tilegg til bommulstråd til luke",
              "Søknad": "Påmelding her https://bit.ly/2TBKcpX"
            }
    ];

    /* src/App.svelte generated by Svelte v3.19.1 */
    const file = "src/App.svelte";

    // (69:1) {:else}
    function create_else_block(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Klikk på knappene for å vise info";
    			add_location(h2, file, 69, 2, 1636);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(69:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:1) {#if region}
    function create_if_block(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*region*/ ctx[0].Region + "";
    	let t0;
    	let t1;
    	let p0;
    	let t2_value = /*region*/ ctx[0].Tidsrom + "";
    	let t2;
    	let t3;
    	let p1;
    	let t4_value = /*region*/ ctx[0].Minstemål + "";
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p1 = element("p");
    			t4 = text(t4_value);
    			add_location(h2, file, 64, 3, 1535);
    			add_location(p0, file, 65, 3, 1563);
    			add_location(p1, file, 66, 3, 1590);
    			attr_dev(div, "class", "region");
    			add_location(div, file, 63, 2, 1511);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(p0, t2);
    			append_dev(div, t3);
    			append_dev(div, p1);
    			append_dev(p1, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*region*/ 1 && t0_value !== (t0_value = /*region*/ ctx[0].Region + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*region*/ 1 && t2_value !== (t2_value = /*region*/ ctx[0].Tidsrom + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*region*/ 1 && t4_value !== (t4_value = /*region*/ ctx[0].Minstemål + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(63:1) {#if region}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let script0;
    	let script0_src_value;
    	let script1;
    	let script1_src_value;
    	let link0;
    	let link1;
    	let t0;
    	let main;
    	let div1;
    	let div0;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*region*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			script0 = element("script");
    			script1 = element("script");
    			link0 = element("link");
    			link1 = element("link");
    			t0 = space();
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "sør";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "nord";
    			t5 = space();
    			if_block.c();
    			if (script0.src !== (script0_src_value = "https://api.mapbox.com/mapbox-gl-js/v1.8.0/mapbox-gl.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file, 47, 1, 894);
    			if (script1.src !== (script1_src_value = "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.0.2/mapbox-gl-directions.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file, 48, 1, 990);
    			attr_dev(link0, "href", "https://api.mapbox.com/mapbox-gl-js/v1.8.0/mapbox-gl.css");
    			attr_dev(link0, "rel", "stylesheet");
    			add_location(link0, file, 50, 1, 1113);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.0.2/mapbox-gl-directions.css");
    			attr_dev(link1, "type", "text/css");
    			add_location(link1, file, 51, 1, 1204);
    			attr_dev(div0, "id", "map");
    			attr_dev(div0, "class", "svelte-f4fmv9");
    			add_location(div0, file, 58, 2, 1386);
    			add_location(button0, file, 59, 2, 1405);
    			add_location(button1, file, 60, 2, 1446);
    			add_location(div1, file, 57, 1, 1378);
    			attr_dev(main, "class", "svelte-f4fmv9");
    			add_location(main, file, 56, 0, 1370);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, script0);
    			append_dev(document.head, script1);
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			append_dev(div1, button0);
    			append_dev(div1, t3);
    			append_dev(div1, button1);
    			append_dev(main, t5);
    			if_block.m(main, null);

    			dispose = [
    				listen_dev(script0, "load", /*init*/ ctx[1], false, false, false),
    				listen_dev(button0, "click", /*flySor*/ ctx[2], false, false, false),
    				listen_dev(button1, "click", /*flyNord*/ ctx[3], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(main, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(script0);
    			detach_dev(script1);
    			detach_dev(link0);
    			detach_dev(link1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if_block.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let map;

    	const init = () => {
    		mapboxgl.accessToken = "pk.eyJ1IjoibHVkdmlra3ZhbHN2aWsiLCJhIjoiY2s5NGFnOG45MDVjMzNvbnhoanBzb3BoNCJ9.UyR6o9v82LFpr3naB6_YLg";

    		map = new mapboxgl.Map({
    				container: "map",
    				style: "mapbox://styles/mapbox/satellite-v9",
    				zoom: 2.5,
    				center: [6.856797, 66.597289]
    			});

    		map.addControl(new mapboxgl.GeolocateControl({
    				positionOptions: { enableHighAccuracy: true },
    				trackUserLocation: true
    			}));

    		var nav = new mapboxgl.NavigationControl();
    		map.addControl(nav, "bottom-right");
    	};

    	let region;

    	const flySor = () => {
    		$$invalidate(0, region = info[0]);

    		map.flyTo({
    			center: [6.282324, 60.254881],
    			zoom: 4.65
    		});
    	};

    	const flyNord = () => {
    		$$invalidate(0, region = info[1]);

    		map.flyTo({
    			center: [13.07152, 68.925976],
    			zoom: 3.65
    		});
    	};

    	$$self.$capture_state = () => ({
    		info,
    		map,
    		init,
    		region,
    		flySor,
    		flyNord,
    		mapboxgl,
    		console
    	});

    	$$self.$inject_state = $$props => {
    		if ("map" in $$props) map = $$props.map;
    		if ("region" in $$props) $$invalidate(0, region = $$props.region);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*region*/ 1) {
    			 console.log(region);
    		}
    	};

    	return [region, init, flySor, flyNord];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
