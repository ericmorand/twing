import {ExpressionNode} from "../expression";
import {Compiler} from "../../compiler";

import type {NameExpressionNode} from "./name";
import type {ArgumentsExpressionNode} from "./arguments";

export type MethodCallExpressionNodeAttributes = {
    method: string
};

export type MethodCallExpressionNodeEdges = {
    template: NameExpressionNode,
    arguments: ArgumentsExpressionNode
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
                .raw(', outputBuffer, ')
                .repr(this.location)
                .raw(', context, this.source, ')
                .subCompile(this.edges.arguments)
                .raw(')')
            ;
        }
    }
}
