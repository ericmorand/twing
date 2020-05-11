import {TwingCompiler} from "./compiler";
import {TwingNodeType} from "./node-type";

const var_export = require('locutus/php/var/var_export');

export type Children = Partial<{
    [k: string]: TwingNode
}>;

export type Attributes = Partial<{
    [k: string]: number | string | boolean
}>;

export class TwingNode<C extends Children = Children, A extends Attributes = Attributes> {
    protected lineno: number;
    protected columnno: number;
    protected tag: string;

    private name: string = null;
    private readonly _children: Map<keyof C, TwingNode>;
    private readonly _attributes: Map<keyof A, number | string | boolean>;

    /**
     * Constructor.
     *
     * @param children A map of named nodes
     * @param attributes A map of attributes (should not be nodes)
     * @param lineno The line number
     * @param columnno The column number
     * @param tag The tag name associated with the Node
     */
    constructor(children: C = null, attributes: A = null, lineno: number = 0, columnno: number = 0, tag: string = null) {
        // attributes
        this._attributes = new Map();

        for (let key in attributes) {
            this._attributes.set(key, attributes[key]);
        }

        // children
        this._children = new Map();

        for (let key in children) {
            this._children.set(key, children[key]);
        }

        this.lineno = lineno;
        this.columnno = columnno;
        this.tag = tag;
    }

    get attributes(): Map<keyof A, any> {
        return this._attributes;
    }

    /**
     * @returns boolean
     */
    hasAttribute<K extends keyof A>(name: K) {
        return this.attributes.has(name);
    }

    /**
     * @param {string} name
     * @param {*} value
     */
    setAttribute<K extends keyof A>(name: K, value: any): void {
        this.attributes.set(name, value);
    }

    /**
     *
     * @param {string} name
     * @returns any
     */
    getAttribute<K extends keyof A>(name: K): A[K] {
        if (!this._attributes.has(name)) {
            throw new Error(`Attribute "${name}" does not exist for Node "${this.constructor.name}".`);
        }

        return this._attributes.get(name);
    }

    get children(): Map<keyof C, TwingNode> {
        return this._children;
    }

    /**
     * @return bool
     */
    hasChild<K extends keyof C>(name: K) {
        return this.children.has(name);
    }

    /**
     * @return TwingNode
     */
    getChild<K extends keyof C>(name: K): C[K] {
        if (!this.children.has(name)) {
            throw new Error(`Node "${name}" does not exist for Node "${this.constructor.name}".`);
        }

        return this._children.get(name);
    }

    setChild<K extends keyof C>(name: K, node: TwingNode) {
        this.children.set(name, node);
    }

    // removeNode(name: string) {
    //     delete this.nodes[name];
    // }

    /**
     * @returns {TwingNode}
     */
    clone(): TwingNode {
        let result: TwingNode = Reflect.construct(this.constructor, []);

        for (let [name, node] of this.getNodes()) {
            result.setChild(name as string, node.clone());
        }

        for (let [name, node] of this.attributes) {
            if (node instanceof TwingNode) {
                node = node.clone();
            }

            result.setAttribute(name, node);
        }

        result.lineno = this.lineno;
        result.columnno = this.columnno;
        result.tag = this.tag;

        return result;
    }

    toString() {
        let attributes = [];

        for (let [name, value] of this.attributes) {
            let attributeRepr: string;

            if (value instanceof TwingNode) {
                attributeRepr = '' + value.toString();
            } else {
                attributeRepr = '' + var_export(value, true);
            }

            attributes.push(`${name}: ${attributeRepr.replace(/\n/g, '')}`);
        }

        attributes.push(`line: ${this.getTemplateLine()}`);
        attributes.push(`column: ${this.getTemplateColumn()}`);

        let repr = [this.constructor.name + '(' + attributes.join(', ')];

        if (this.children.size > 0) {
            for (let [name, node] of this.children) {
                let len = ('' + name).length + 4;
                let nodeRepr = [];

                for (let line of node.toString().split('\n')) {
                    nodeRepr.push(' '.repeat(len) + line);
                }

                repr.push(`  ${name}: ${nodeRepr.join('\n').trimLeft()}`);
            }

            repr.push(')');
        } else {
            repr[0] += ')';
        }

        return repr.join('\n');
    }

    get type(): TwingNodeType {
        return null;
    }

    is(type: TwingNodeType): boolean {
        return this.type === type;
    }

    compile(compiler: TwingCompiler): void {
        for (let node of this.children.values()) {
            node.compile(compiler);
        }
    }

    getTemplateLine() {
        return this.lineno;
    }

    getTemplateColumn() {
        return this.columnno;
    }

    getNodeTag() {
        return this.tag;
    }

    count() {
        return this.children.size;
    }

    setTemplateName(name: string) {
        this.name = name;

        for (let [k, node] of this.children) {
            node.setTemplateName(name);
        }
    }

    getTemplateName() {
        return this.name;
    }
}
