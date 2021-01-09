import {Compiler} from "./compiler";

const var_export = require('locutus/php/var/var_export');

export type Location = {
  line: number,
  column: number
};

export type NodeAttributes = Record<string, any>;
export type NodeChildren<T extends Node = Node> = Record<string, T>;

export const toTwingNodeNodes = <T extends Node>(map: Map<string, T>): NodeChildren<T> => {
    const nodes: NodeChildren<T> = {};

    for (const [key, value] of map) {
        nodes[key] = value;
    }

    return nodes;
};

export type TwingNodeNodesNode<T> = T extends NodeChildren<infer N> ? N : never;

export class Node<A extends NodeAttributes = any, C extends NodeChildren = any> {
    private readonly _attributes: A;
    private readonly _children: C;
    private readonly _location: Location;
    private readonly _tag: string;
    private readonly _iterator: IterableIterator<[string, any]>;
    private readonly _nodesCount: number;

    private name: string = null;

    /**
     * @param children
     * @param attributes
     * @param location
     * @param tag
     */
    constructor(attributes: A, children: C, location: Location, tag: string = null) {
        this._attributes = attributes;
        this._children = children;
        this._location = location;
        this._tag = tag;

        const nodesMap: Map<string, any> = new Map();

        for (const key in children) {
            nodesMap.set(key, children[key]);
        }

        this._iterator = nodesMap.entries();
        this._nodesCount = nodesMap.size;
    }

    [Symbol.iterator](): IterableIterator<[string, TwingNodeNodesNode<C>]> {
        return this._iterator;
    }

    get nodesCount(): number {
        return this._nodesCount;
    }

    get attributes(): Readonly<A> {
        return this._attributes;
    }

    get children(): Readonly<C> {
        return this._children;
    }

    get location() {
        return this._location:
    }

    get tag() {
        return this._tag;
    }

    get outputs(): boolean {
        return false;
    }

    get captures(): boolean {
        return false;
    }

    clone(): Node<C, A> {
        let result: Node<C, A> = Reflect.construct(this.constructor, []);

        for (let [name, node] of this) {
            result.setNode(name as string, node.clone());
        }

        for (let [name, node] of this.attributes) {
            if (node instanceof Node) {
                node = node.clone();
            }

            result.setAttribute(name, node);
        }

        result.line = this.line;
        result.column = this.column;
        result.tag = this.tag;

        return result;
    }

    toString() {
        let attributes = [];

        for (let [name, value] of this.attributes) {
            let attributeRepr: string;

            if (value instanceof Node) {
                attributeRepr = '' + value.toString();
            } else {
                attributeRepr = '' + var_export(value, true);
            }

            attributes.push(`${name}: ${attributeRepr.replace(/\n/g, '')}`);
        }

        attributes.push(`line: ${this.line}`);
        attributes.push(`column: ${this.column}`);

        let repr = [this.constructor.name + '(' + attributes.join(', ')];

        if (this.nodesCount > 0) {
            for (let [name, node] of this) {
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

    compile(compiler: Compiler): void {
        for (const [, node] of this) {
            node.compile(compiler);
        }
    }

    setTemplateName(name: string) {
        this.name = name;

        for (let node of this.children.values()) {
            node.setTemplateName(name);
        }
    }

    /**
     * @deprecated should be replace by a TwingCompiler getter - i.e. compiler.templateName
     */
    getTemplateName() {
        return this.name;
    }
}
