import {Compiler} from "./compiler";
import {ConstantExpressionNode} from "./node/expression/constant";
import {PrintNode} from "./node/print";

const var_export = require('locutus/php/var/var_export');

export type Location = {
    line: number,
    column: number
};

export type NodeAttributes = Record<string, any>;
export type NodeEdges<T extends Node = Node> = Record<string, T>;

export const toNodeEdges = <T extends Node>(map: Map<string, T>): NodeEdges<T> => {
    const nodes: NodeEdges<T> = {};

    for (const [key, value] of map) {
        nodes[key] = value;
    }

    return nodes;
};

export type Edges<T> = T extends Node<any, infer E> ? E : never;
export type EdgesNode<T> = T extends NodeEdges<infer N> ? N : never;

export type TT = keyof Edges<PrintNode>;

export class Node<A extends NodeAttributes = any, E extends NodeEdges = any> {
    private readonly _attributes: A;
    private readonly _edges: E;
    private readonly _location: Location;
    private readonly _tag: string;
    private readonly _edgesCount: number;
    private readonly _edgesMap: Map<string, any>;

    /**
     * @param edges
     * @param attributes
     * @param location
     * @param tag
     */
    constructor(attributes: A, edges: E, location: Location, tag: string = null) {
        this._attributes = attributes;
        this._edges = edges;
        this._location = location;
        this._tag = tag;
        this._edgesMap = new Map();

        for (const key in edges) {
            this._edgesMap.set(key, edges[key]);
        }

        this._edgesCount = this._edgesMap.size;
    }

    [Symbol.iterator](): IterableIterator<[string, EdgesNode<E>]> {
        return this._edgesMap.entries();
    }

    get edgesCount(): number {
        return this._edgesCount;
    }

    get attributes(): A {
        return this._attributes;
    }

    get edges(): E {
        return this._edges;
    }

    get location() {
        return this._location;
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

    toString() {
        let attributes = [];

        for (let name in this.attributes) {
            const value: any = this.attributes[name];

            let attributeRepr: string;

            if (value instanceof Node) {
                attributeRepr = '' + value.toString();
            } else {
                attributeRepr = '' + var_export(value, true);
            }

            attributes.push(`${name}: ${attributeRepr.replace(/\n/g, '')}`);
        }

        attributes.push(`line: ${this.location.line}`);
        attributes.push(`column: ${this.location.column}`);

        let repr = [this.constructor.name + '(' + attributes.join(', ')];

        if (this.edgesCount > 0) {
            for (let [name, node] of this) {
                if (node) {
                    let len = ('' + name).length + 4;
                    let nodeRepr = [];

                    for (let line of node.toString().split('\n')) {
                        nodeRepr.push(' '.repeat(len) + line);
                    }

                    repr.push(`  ${name}: ${nodeRepr.join('\n').trimLeft()}`);
                } else {
                    repr.push(`  ${name}: ${node}`);
                }
            }

            repr.push(')');
        } else {
            repr[0] += ')';
        }

        return repr.join('\n');
    }

    compile(compiler: Compiler): void {
        for (const [, node] of this) {
            if (node) {
                node.compile(compiler);
            }
        }
    }
}
