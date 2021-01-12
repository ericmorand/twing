import {ExpressionNode} from "../expression";
import {ArrayExpressionNode} from "./array";
import {Compiler} from "../../compiler";
import {NameExpressionNode} from "./name";

export type MethodCallExpressionNodeAttributes = {
    method: string
};

export type MethodCallExpressionNodeEdges = {
    template: NameExpressionNode,
    arguments: ArrayExpressionNode
};

export class MethodCallExpressionNode extends ExpressionNode<MethodCallExpressionNodeAttributes, MethodCallExpressionNodeEdges> {
    compile(compiler: Compiler) {
        if (this.attributes.isDefinedTest) {
            compiler
                .raw('(await aliases.proxy[')
                .repr(this.edges.template.attributes.value)
                .raw('].hasMacro(')
                .repr(this.attributes.method)
                .raw('))')
            ;
        } else {
            compiler
                .raw('await this.callMacro(aliases.proxy[')
                .repr(this.edges.template.attributes.value)
                .raw('], ')
                .repr(this.attributes.method)
                .raw(', outputBuffer')
                .raw(', [')
            ;
            let first = true;

            let argumentsNode = this.edges.arguments;

            for (let pair of argumentsNode.keyValuePairs) {
                if (!first) {
                    compiler.raw(', ');
                }

                first = false;

                compiler.subCompile(pair.value);
            }

            compiler
                .raw('], ')
                .repr(this.location)
                .raw(', context, this.source)');
        }
    }
}
