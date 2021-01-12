import {Location, Node} from "../node";
import {Compiler} from "../compiler";
import {ConstantExpressionNode} from "./expression/constant";
import {TwingNodeText} from "./text";

export type SetNodeAttributes = {
    capture: boolean,
    safe?: boolean
};

export type SetNodeEdges = {
    names: Node,
    values: Node
};

export class SetNode extends Node<SetNodeAttributes, SetNodeEdges> {
    constructor(attributes: SetNodeAttributes, edges: SetNodeEdges, location: Location, tag: string) {
        /*
         * Optimizes the node when capture is used for a large block of text.
         *
         * {% set foo %}foo{% endset %} is compiled to $context['foo'] = new Twig_Markup("foo");
         */
        if (attributes.capture) {
            attributes.safe = true;

            let values = edges.values;

            if (values instanceof TwingNodeText) {
                edges.values = new ConstantExpressionNode({value: values.attributes.data}, null, values.location);

                attributes.capture = false;
            }
        }

        super(attributes, edges, location, tag);
    }

    get captures(): boolean {
        return true;
    }

    compile(compiler: Compiler) {
        if (this.edges.names.edgesCount > 1) {
            compiler.write('[');

            let i: number = 0;

            for (let [, node] of this.edges.names) {
                if (i > 0) {
                    compiler.raw(', ');
                }

                compiler.subCompile(node);

                i++;
            }

            compiler.raw(']');
        } else {
            if (this.attributes.capture) {
                compiler
                    .write("outputBuffer.start();\n")
                    .subCompile(this.edges.values)
                ;
            }

            compiler.subCompile(this.edges.names, false);

            if (this.attributes.capture) {
                compiler
                    .raw(" = (() => {let tmp = outputBuffer.getAndClean(); return tmp === '' ? '' : new this.Markup(tmp, this.environment.getCharset());})()")
                ;
            }
        }

        if (!this.attributes.capture) {
            compiler.raw(' = ');

            if (this.edges.names.edgesCount > 1) {
                compiler.raw('[');

                let i: number = 0;

                for (let [, value] of this.edges.values) {
                    if (i > 0) {
                        compiler.raw(', ');
                    }

                    compiler.subCompile(value);

                    i++;
                }

                compiler.raw(']');
            } else {
                if (this.attributes.safe) {
                    compiler
                        .raw("await (async () => {let tmp = ")
                        .subCompile(this.edges.values)
                        .raw("; return tmp === '' ? '' : new this.Markup(tmp, this.environment.getCharset());})()")
                    ;
                } else {
                    compiler.subCompile(this.edges.values);
                }
            }
        }

        compiler.raw(';\n');
    }
}
