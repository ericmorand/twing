import {TwingNodeExpression} from "../expression";
import {Compiler} from "../../compiler";

import type {TwingNodeExpressionAttributes} from "../expression";

export const ANY_CALL = 'any';
export const ARRAY_CALL = 'array';
export const METHOD_CALL = 'method';

export type CallType = typeof ANY_CALL | typeof ARRAY_CALL | typeof METHOD_CALL;

export type TwingNodeExpressionGetAttributeAttributes = TwingNodeExpressionAttributes<{
    type: CallType
}>;

export type TwingNodeExpressionGetAttributeNodes = {
    node: TwingNodeExpression<any>,
    attribute: TwingNodeExpression<any>,
    arguments?: TwingNodeExpression<any>
};

export class TwingNodeExpressionGetAttribute extends TwingNodeExpression<TwingNodeExpressionGetAttributeAttributes, TwingNodeExpressionGetAttributeNodes> {
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
        if (this.attributes.optimizable
            && (!env.isStrictVariables() || this.attributes.ignoreStrictCheck)
            && !this.attributes.isDefinedTest
            && this.attributes.type === ARRAY_CALL) {

            compiler
                .raw('await (async () => {let object = ')
                .subcompile(this.children.node)
                .raw('; return this.get(object, ')
                .subcompile(this.children.attribute)
                .raw(');})()')
            ;

            return;
        }

        compiler.raw(`await this.traceableMethod(this.getAttribute, ${this.line}, this.source)(this.environment, `);

        compiler.subcompile(this.children.node);

        compiler.raw(', ').subcompile(this.children.attribute);

        if (this.children.arguments) {
            compiler.raw(', ').subcompile(this.children.arguments);
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
