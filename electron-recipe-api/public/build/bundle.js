
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

    const apikeys = {
        openweathermap: {
            api_key:'4c92609677c2fd4514e1b03c47ab1036'   
        },

        unsplash: {
            api_key: 'W0KNq2vRXukBjVzXTTwOG1lyMSc9FqDS57fn3Socbi0',
            secret:'IzKu6lkQ8IOhXcD3NrXG5cGWm2edCDi3dZiCuT6jsN0'
        },
        mapbox:{
            api_key:'pk.eyJ1Ijoic2ltbW9lIiwiYSI6ImNrNzNhem81ZjA4aWEzZnM1ZzJlcGo0YzIifQ.ydTMVEfBU_I_mXDxHwfY8Q' 
        },
        giphy:{
            api_key:'xLNiiuCTPYTZA4gHLsiuUk67YYS6K4tz'
        },
        oxford:{
            base_url:'https://od-api.oxforddictionaries.com/api/v2',
            app_id:'46b7f185',
            app_key:'b0c747f6ecd5d547bc76cbb121380b11'
        },
        worldnews:{
            api_key:'ed87ebff01bb4f5998eed5fb8a0aba89' 
        },
        merrianwebster:{
            thesaurus:'6bee06be-3b53-4940-b051-26aee090936a',
            dictionary:'974433d0-206b-45e4-beb3-32ff3fdb027b'
        },
        wordnik:{
            api_key:'fxq4h9kmmr7xjq88rujiubj1r8gi48pjq246muecwzisv5iac'
        },
        spoonacular:{
            api_key: '385e8eeaca954d7385cdc0e96582aa67',
        },
        freeapis:[
            'http://www.datamuse.com/api/',   
            'https://deckofcardsapi.com/',
        ]
    };

    /* src/App.svelte generated by Svelte v3.19.1 */
    const file = "src/App.svelte";

    // (31:1) {#if recipe}
    function create_if_block(ctx) {
    	let h1;
    	let t0_value = /*recipe*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			attr_dev(h1, "class", "svelte-2x1evt");
    			add_location(h1, file, 31, 2, 964);
    			if (img.src !== (img_src_value = /*recipe*/ ctx[0].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*recipe*/ ctx[0].title);
    			add_location(img, file, 32, 2, 990);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*recipe*/ 1 && t0_value !== (t0_value = /*recipe*/ ctx[0].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*recipe*/ 1 && img.src !== (img_src_value = /*recipe*/ ctx[0].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*recipe*/ 1 && img_alt_value !== (img_alt_value = /*recipe*/ ctx[0].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(31:1) {#if recipe}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let h3;
    	let t3;
    	let label0;
    	let t5;
    	let input0;
    	let t6;
    	let label1;
    	let t8;
    	let input1;
    	let t9;
    	let label2;
    	let t11;
    	let input2;
    	let t12;
    	let hr0;
    	let t13;
    	let button;
    	let t15;
    	let hr1;
    	let t16;
    	let dispose;
    	let if_block = /*recipe*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Hello cookie!";
    			t1 = space();
    			h3 = element("h3");
    			h3.textContent = "Whats in the fridge?";
    			t3 = space();
    			label0 = element("label");
    			label0.textContent = "sukker";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			label1 = element("label");
    			label1.textContent = "mel";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			label2 = element("label");
    			label2.textContent = "epler";
    			t11 = space();
    			input2 = element("input");
    			t12 = space();
    			hr0 = element("hr");
    			t13 = space();
    			button = element("button");
    			button.textContent = "finn oppskrift";
    			t15 = space();
    			hr1 = element("hr");
    			t16 = space();
    			if (if_block) if_block.c();
    			attr_dev(h1, "class", "svelte-2x1evt");
    			add_location(h1, file, 19, 1, 568);
    			add_location(h3, file, 20, 1, 592);
    			attr_dev(label0, "for", "sugar");
    			add_location(label0, file, 21, 1, 623);
    			attr_dev(input0, "id", "+sugar");
    			attr_dev(input0, "type", "checkbox");
    			add_location(input0, file, 22, 1, 658);
    			attr_dev(label1, "for", "flour");
    			add_location(label1, file, 23, 1, 710);
    			attr_dev(input1, "id", "+flour");
    			attr_dev(input1, "type", "checkbox");
    			add_location(input1, file, 24, 1, 742);
    			attr_dev(label2, "for", "apples");
    			add_location(label2, file, 25, 1, 794);
    			attr_dev(input2, "id", "+apples");
    			attr_dev(input2, "type", "checkbox");
    			add_location(input2, file, 26, 1, 829);
    			add_location(hr0, file, 27, 1, 882);
    			add_location(button, file, 28, 1, 888);
    			add_location(hr1, file, 29, 1, 943);
    			attr_dev(main, "class", "svelte-2x1evt");
    			add_location(main, file, 18, 0, 560);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, h3);
    			append_dev(main, t3);
    			append_dev(main, label0);
    			append_dev(main, t5);
    			append_dev(main, input0);
    			append_dev(main, t6);
    			append_dev(main, label1);
    			append_dev(main, t8);
    			append_dev(main, input1);
    			append_dev(main, t9);
    			append_dev(main, label2);
    			append_dev(main, t11);
    			append_dev(main, input2);
    			append_dev(main, t12);
    			append_dev(main, hr0);
    			append_dev(main, t13);
    			append_dev(main, button);
    			append_dev(main, t15);
    			append_dev(main, hr1);
    			append_dev(main, t16);
    			if (if_block) if_block.m(main, null);

    			dispose = [
    				listen_dev(input0, "click", /*add*/ ctx[2], false, false, false),
    				listen_dev(input1, "click", /*add*/ ctx[2], false, false, false),
    				listen_dev(input2, "click", /*add*/ ctx[2], false, false, false),
    				listen_dev(button, "click", /*getRecipes*/ ctx[1], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*recipe*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
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
    	let ingredients = [];
    	let recipe;
    	const apikey = apikeys.spoonacular.api_key;

    	const getRecipes = () => {
    		fetch(`https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apikey}&ingredients=${ingredients}&number=1`).then(res => res.json()).then(json => $$invalidate(0, recipe = json[0]));
    	};

    	const add = e => {
    		e.target.checked
    		? $$invalidate(3, ingredients = [...ingredients, e.target.id])
    		: ingredients.filter(i => i != e.target.id);
    	};

    	$$self.$capture_state = () => ({
    		apikeys,
    		ingredients,
    		recipe,
    		apikey,
    		getRecipes,
    		add,
    		console,
    		fetch
    	});

    	$$self.$inject_state = $$props => {
    		if ("ingredients" in $$props) $$invalidate(3, ingredients = $$props.ingredients);
    		if ("recipe" in $$props) $$invalidate(0, recipe = $$props.recipe);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*ingredients*/ 8) {
    			 console.log(ingredients.toString());
    		}
    	};

    	return [recipe, getRecipes, add];
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
