import {Node} from "../node";
import {Compiler} from "../compiler";
import {TwingNodeExpressionConstant} from "./expression/constant";
import {TwingNodeText} from "./text";

export type TwingNodeSetAttributes = {
    capture: boolean,
    safe?: boolean
};

export type TwingNodeSetNodes = {
    names: Node,
    values: Node
};

export class TwingNodeSet extends Node<TwingNodeSetAttributes, TwingNodeSetNodes> {
    constructor(attributes: TwingNodeSetAttributes, nodes: TwingNodeSetNodes, line: number, column: number, tag: string) {
        /*
         * Optimizes the node when capture is used for a large block of text.
         *
         * {% set foo %}foo{% endset %} is compiled to $context['foo'] = new Twig_Markup("foo");
         */
        if (attributes.capture) {
            attributes.safe = true;

            let values = nodes.values;

            if (values instanceof TwingNodeText) {
                nodes.values = new TwingNodeExpressionConstant({value: values.attributes.data}, null, values.line, values.column);

                attributes.capture = false;
            }
        }

        super(attributes, nodes, line, column, tag);
    }

    get captures(): boolean {
        return true;
    }

    compile(compiler: Compiler) {
        if (this.children.names.nodesCount > 1) {
            compiler.write('[');

            let i: number = 0;

            for (let [, node] of this.children.names) {
                if (i > 0) {
                    compiler.raw(', ');
                }

                compiler.subcompile(node);

                i++;
            }

            compiler.raw(']');
        } else {
            if (this.attributes.capture) {
                compiler
                    .write("outputBuffer.start();\n")
                    .subcompile(this.children.values)
                ;
            }

            compiler.subcompile(this.children.names, false);

            if (this.attributes.capture) {
                compiler
                    .raw(" = (() => {let tmp = outputBuffer.getAndClean(); return tmp === '' ? '' : new this.Markup(tmp, this.environment.getCharset());})()")
                ;
            }
        }

        if (!this.attributes.capture) {
            compiler.raw(' = ');

            if (this.children.names.nodesCount > 1) {
                compiler.raw('[');

                let i: number = 0;

                for (let [, value] of this.children.values) {
                    if (i > 0) {
                        compiler.raw(', ');
                    }

                    compiler.subcompile(value);

                    i++;
                }

                compiler.raw(']');
            } else {
                if (this.attributes.safe) {
                    compiler
                        .raw("await (async () => {let tmp = ")
                        .subcompile(this.children.values)
                        .raw("; return tmp === '' ? '' : new this.Markup(tmp, this.environment.getCharset());})()")
                    ;
                } else {
                    compiler.subcompile(this.children.values);
                }
            }
        }

        compiler.raw(';\n');
    }
}
