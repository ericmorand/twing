import {TwingNode} from "../node";
import {TwingCompiler} from "../compiler";
import {TwingNodeExpressionConstant} from "./expression/constant";
import {TwingNodeText} from "./text";

export type TwingNodeSetAttributes = {
    capture: boolean,
    safe?: boolean
};

export type TwingNodeSetNodes = {
    names: TwingNode,
    values: TwingNode
};

export class TwingNodeSet extends TwingNode<TwingNodeSetAttributes, TwingNodeSetNodes> {
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

    compile(compiler: TwingCompiler) {
        if (this.nodes.names.nodesCount > 1) {
            compiler.write('[');

            let i: number = 0;

            for (let [, node] of this.nodes.names) {
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
                    .subcompile(this.nodes.values)
                ;
            }

            compiler.subcompile(this.nodes.names, false);

            if (this.attributes.capture) {
                compiler
                    .raw(" = (() => {let tmp = outputBuffer.getAndClean(); return tmp === '' ? '' : new this.Markup(tmp, this.environment.getCharset());})()")
                ;
            }
        }

        if (!this.attributes.capture) {
            compiler.raw(' = ');

            if (this.nodes.names.nodesCount > 1) {
                compiler.raw('[');

                let i: number = 0;

                for (let [, value] of this.nodes.values) {
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
                        .subcompile(this.nodes.values)
                        .raw("; return tmp === '' ? '' : new this.Markup(tmp, this.environment.getCharset());})()")
                    ;
                } else {
                    compiler.subcompile(this.nodes.values);
                }
            }
        }

        compiler.raw(';\n');
    }
}
