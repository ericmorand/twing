import {Node, NodeEdges} from "../node";
import {Compiler} from "../compiler";
import {ExpressionNode} from "./expression";

export type IfNodeEdges = {
    tests: Node<null, NodeEdges<IfNodeTestNode>>,
    else?: Node
};

export type IfNodeTestNodeEdges = {
    condition: ExpressionNode<any>,
    body: Node
};

export type IfNodeTestNode = Node<null, IfNodeTestNodeEdges>;

export class IfNode extends Node<null, IfNodeEdges> {
    compile(compiler: Compiler) {
        let i: number = 0;

        for (let [, test] of this.edges.tests) {
            if (i > 0) {
                compiler
                    .outdent()
                    .write('}\n')
                    .write('else if (')
                ;
            } else {
                compiler
                    .write('if (')
                ;
            }

            compiler
                .subCompile(test.edges.condition)
                .raw(") {\n")
                .indent()
                .subCompile(test.edges.body)
            ;

            i++;
        }

        if (this.edges.else) {
            compiler
                .outdent()
                .write("}\n")
                .write("else {\n")
                .indent()
                .subCompile(this.edges.else)
            ;
        }

        compiler
            .outdent()
            .write("}\n");
    }
}
