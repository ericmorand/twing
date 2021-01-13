import {ExpressionNode} from "../expression";
import {Compiler} from "../../compiler";
import {ArrayExpressionNode} from "./array";

import type {ExpressionNodeAttributes} from "../expression";

export const ANY_CALL = 'any';
export const ARRAY_CALL = 'array';
export const METHOD_CALL = 'method';

export type CallType = typeof ANY_CALL | typeof ARRAY_CALL | typeof METHOD_CALL;

export type GetAttributeExpressionNodeAttributes = ExpressionNodeAttributes<{
    type: CallType
}>;

export type GetAttributeExpressionNodeEdges = {
    object: ExpressionNode<any>,
    attribute: ExpressionNode<any>,
    arguments?: ArrayExpressionNode
};

export class GetAttributeExpressionNode extends ExpressionNode<GetAttributeExpressionNodeAttributes, GetAttributeExpressionNodeEdges> {
    // constructor(node: TwingNodeExpression, attribute: TwingNodeExpression, methodArguments: TwingNodeExpression, type: string, line: number, column: number) {
    //     super({
    //         node,
    //         attribute,
    //         arguments: methodArguments
    //     }, {
    //         type,
    //         is_defined_test: false,
    //         optimizable: true
    //     }, line, column);
    // }

    // constructor(attributes: TwingNodeExpressionGetAttributeAttributes, nodes: TwingNodeExpressionGetAttributeNodes, line: number, column: number) {
    //     // todo: replace this, nodes are immutable
    //     // if (this.attributes.ignoreStrictCheck) {
    //     //     this.nodes.node.setAttribute('ignore_strict_check', true);
    //     // }
    //
    //     super(attributes, nodes, line, column);
    // }

    compile(compiler: Compiler) {
        let env = compiler.getEnvironment();

        // optimize array, hash and Map calls
        if (this.attributes.isOptimizable
            && (!env.isStrictVariables() || this.attributes.ignoreStrictCheck)
            && !this.attributes.isDefinedTest
            && this.attributes.type === ARRAY_CALL) {

            compiler
                .raw('await (async () => {let object = ')
                .subCompile(this.edges.object)
                .raw('; return this.get(object, ')
                .subCompile(this.edges.attribute)
                .raw(');})()')
            ;

            return;
        }

        compiler
            .raw(`await this.traceableMethod(this.getAttribute, `)
            .repr(this.location)
            .raw(`, this.source)(this.environment, `);

        compiler.subCompile(this.edges.object);

        compiler.raw(', ').subCompile(this.edges.attribute);

        if (this.edges.arguments) {
            compiler.raw(', ').subCompile(this.edges.arguments);
        } else {
            compiler.raw(', new Map()');
        }

        compiler
            .raw(', ').repr(this.attributes.type)
            .raw(', ').repr(this.attributes.isDefinedTest)
            .raw(', ').repr(this.attributes.ignoreStrictCheck)
            .raw(', ').repr(env.isSandboxed())
            .raw(')');
    }
}
