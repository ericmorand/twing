import {Location, Node} from "../node";
import {ExpressionNode} from "./expression";
import {AssignNameExpressionNode} from "./expression/assign-name";
import {IfNode, IfNodeTestNodeEdges} from "./if";
import {Compiler} from "../compiler";

export type ForNodeAttributes = {
    withLoop: boolean
};

export type ForNodeEdges = {
    targetKey: AssignNameExpressionNode,
    targetValue: AssignNameExpressionNode,
    sequence: ExpressionNode<any>,
    body: Node,
    condition: ExpressionNode<any>,
    else?: Node
};

class ForLoopNode extends Node<{
    // todo: what is withLoop used for?
    withLoop: boolean,
    withCondition: boolean,
    withElse: boolean
}> {
    compile(compiler: Compiler) {
        if (this.attributes.withElse) {
            compiler.write("context.set('_iterated',  true);\n");
        }

        if (this.attributes.withLoop) {
            compiler
                .write("(() => {\n")
                .indent()
                .write("let loop = context.get('loop');\n")
                .write("loop.set('index0', loop.get('index0') + 1);\n")
                .write("loop.set('index', loop.get('index') + 1);\n")
                .write("loop.set('first', false);\n")
            ;

            if (!this.attributes.withCondition) {
                compiler
                    .write("if (loop.has('length')) {\n")
                    .indent()
                    .write("loop.set('revindex0', loop.get('revindex0') - 1);\n")
                    .write("loop.set('revindex', loop.get('revindex') - 1);\n")
                    .write("loop.set('last', loop.get('revindex0') === 0);\n")
                    .outdent()
                    .write("}\n")
                ;
            }

            compiler
                .outdent()
                .write("})();\n")
            ;
        }
    }
}

export class ForNode extends Node<ForNodeAttributes, ForNodeEdges> {
    private loop: ForLoopNode;

    constructor(attributes: ForNodeAttributes, edges: ForNodeEdges, location: Location, tag: string) {
        const loop = new ForLoopNode({
            withElse: edges.else !== null,
            withLoop: attributes.withLoop,
            withCondition: edges.condition !== null
        }, null, location, tag);

        // let bodyNodes = new Map();
        let i: number = 0;

        // bodyNodes.set(i++, body);
        // bodyNodes.set(i++, loop);

        let body: Node;

        // if (attributes.withIf) {
        //     let ifNodes = new Map();
        //     let i: number = 0;
        //
        //     ifNodes.set(i++, ifexpr);
        //     ifNodes.set(i++, body);
        //
        //     body = new TwingNodeIf(new Node(ifNodes), null, lineno, columnno, tag);
        // }
        // else {
        //     body = new Node(null, {
        //         body: edges.body,
        //         loop: loop
        //     }, location);
        // }

        // let nodes = new Map();
        //
        // // nodes.set('key_target', keyTarget);
        // // nodes.set('value_target', valueTarget);
        // // nodes.set('seq', seq);
        // // nodes.set('body', body);
        //
        // if (edges.else) {
        //     nodes.set('else', edges.else);
        // }

        // let attributes = new Map();
        //
        // attributes.set('with_loop', true);
        // attributes.set('ifexpr', ifexpr !== null);
        //
        // super(nodes, attributes, lineno, columnno, tag);
        //
        // this.loop = loop;

        super(attributes, edges, location, tag);
    }

    // constructor(keyTarget: AssignNameExpressionNode, valueTarget: AssignNameExpressionNode, seq: ExpressionNode, ifexpr: ExpressionNode, body: Node, elseNode: Node, lineno: number, columnno: number, tag: string = null) {

    compile(compiler: Compiler) {
        compiler
            .write("context.set('_parent', context.clone());\n\n")
            .write('await (async () => {\n')
            .indent()
            .write('let c = this.ensureTraversable(')
            .subCompile(this.edges.sequence)
            .raw(");\n\n")
            .write('if (c === context) {\n')
            .indent()
            .write("context.set('_seq', context.clone());\n")
            .outdent()
            .write("}\n")
            .write("else {\n")
            .indent()
            .write("context.set('_seq', c);\n")
            .outdent()
            .write("}\n")
            .outdent()
            .write("})();\n\n")
        ;

        if (this.edges.else) {
            compiler.write("context.set('_iterated', false);\n");
        }

        if (this.attributes.withLoop) {
            compiler
                .write("context.set('loop', new Map([\n")
                .write("  ['parent', context.get('_parent')],\n")
                .write("  ['index0', 0],\n")
                .write("  ['index', 1],\n")
                .write("  ['first', true]\n")
                .write("]));\n")
            ;

            if (!this.edges.condition) {
                compiler
                    .write("if ((typeof context.get('_seq') === 'object') && this.isCountable(context.get('_seq'))) {\n")
                    .indent()
                    .write("let length = this.count(context.get('_seq'));\n")
                    .write("let loop = context.get('loop');\n")
                    .write("loop.set('revindex0', length - 1);\n")
                    .write("loop.set('revindex', length);\n")
                    .write("loop.set('length', length);\n")
                    .write("loop.set('last', (length === 1));\n")
                    .outdent()
                    .write("}\n")
                ;
            }
        }

        // this.loop.setAttribute('else', this.hasNode('else'));
        // this.loop.setAttribute('with_loop', this.getAttribute('with_loop'));
        // this.loop.setAttribute('ifexpr', this.getAttribute('ifexpr'));

        let body: Node = this.edges.body;

        if (this.edges.condition) {
            body = new IfNode(null, {
                tests: new Node(null, {
                    '0': new Node<null, IfNodeTestNodeEdges>(null, {
                        condition: this.edges.condition,
                        body
                    }, this.location)
                }, this.location)
            }, this.location)
        } else {
            const loop = new ForLoopNode({
                withElse: this.edges.else !== null,
                withLoop: this.attributes.withLoop,
                withCondition: this.edges.condition !== null
            }, null, this.location);

            body = new Node(null, {
                body,
                loop
            }, this.location);
        }

        compiler
            .write("await this.iterate(context.get('_seq'), async (__key__, __value__) => {\n")
            .indent()
            .subCompile(this.edges.targetKey, false)
            .raw(' = __key__;\n')
            .subCompile(this.edges.targetValue, false)
            .raw(' = __value__;\n')
            .subCompile(body)
            .outdent()
            .write("});\n")
        ;

        if (this.edges.else) {
            compiler
                .write("if (context.get('_iterated') === false) {\n")
                .indent()
                .subCompile(this.edges.else)
                .outdent()
                .write("}\n")
            ;
        }

        compiler
            .write("(() => {\n")
            .indent()
            .write(`let parent = context.get('_parent');\n`)
        ;

        // remove some "private" loop variables (needed for nested loops)
        compiler
            .write('context.delete(\'_seq\');\n')
            .write('context.delete(\'_iterated\');\n')
            .write('context.delete(\'' + this.edges.targetKey.attributes.value + '\');\n')
            .write('context.delete(\'' + this.edges.targetValue.attributes.value + '\');\n')
            .write('context.delete(\'_parent\');\n')
            .write('context.delete(\'loop\');\n')
        ;

        // keep the values set in the inner context for variables defined in the outer context
        compiler
            .write(`for (let [k, v] of parent) {\n`)
            .indent()
            .write('if (!context.has(k)) {\n')
            .indent()
            .write(`context.set(k, v);\n`)
            .outdent()
            .write('}\n')
            .outdent()
            .write('}\n')
        ;

        compiler
            .outdent()
            .write("})();\n")
        ;
    }
}
