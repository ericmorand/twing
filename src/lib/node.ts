import {TwingCompiler} from "./compiler";

const var_export = require('locutus/php/var/var_export');

export type AnonymousNodes<T extends TwingNode = TwingNode> = Record<string, T>;
export type AnonymousAttributes = Record<string, any>;

export const toAnonymousNodes = <T extends TwingNode>(map: Map<string, T>): AnonymousNodes<T> => {
    const nodes: AnonymousNodes<T> = {};

    for (const [key, value] of map) {
        nodes[key] = value;
    }

    return nodes;
};

export class TwingNode<A extends AnonymousAttributes = any, N extends AnonymousNodes = any> {
    protected _attributes: A;
    protected _nodes: N;
    protected _line: number;
    protected _column: number;
    protected _tag: string;

    private name: string = null;

    /**
     * @param nodes
     * @param attributes
     * @param line The line number
     * @param column The column number
     * @param tag The tag name associated with the Node
     */
    constructor(attributes: A, nodes: N, line: number = 0, column: number = 0, tag: string = null) {
        this._attributes = attributes;
        this._nodes = nodes;
        this._line = line;
        this._column = column;
        this._tag = tag;
    }

    get attributes(): A {
        return this._attributes;
    }

    get nodes(): N {
        return this._nodes;
    }

    get line() {
        return this._line;
    }

    get column() {
        return this._column;
    }

    get tag() {
        return this._tag;
    }

    clone(): TwingNode<N, A> {
        let result: TwingNode<N, A> = Reflect.construct(this.constructor, []);

        for (let [name, node] of this.getNodes()) {
            result.setNode(name as string, node.clone());
        }

        for (let [name, node] of this.attributes) {
            if (node instanceof TwingNode) {
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

            if (value instanceof TwingNode) {
                attributeRepr = '' + value.toString();
            } else {
                attributeRepr = '' + var_export(value, true);
            }

            attributes.push(`${name}: ${attributeRepr.replace(/\n/g, '')}`);
        }

        attributes.push(`line: ${this.line}`);
        attributes.push(`column: ${this.column}`);

        let repr = [this.constructor.name + '(' + attributes.join(', ')];

        if (this.nodes.size > 0) {
            for (let [name, node] of this.nodes) {
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

    compile(compiler: TwingCompiler): void {
        for (let node of this.nodes.values()) {
            node.compile(compiler);
        }
    }

    get count(): number {
        return this.nodes.size;
    }

    setTemplateName(name: string) {
        this.name = name;

        for (let node of this.nodes.values()) {
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
