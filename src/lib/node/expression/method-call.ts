import {TwingNodeExpression} from "../expression";
import {TwingNodeExpressionArray} from "./array";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";
import {TwingNodeExpressionName} from "./name";

import type {TwingNodeExpressionAttributes} from "../expression";

export const type = new TwingNodeType('expression_method_call');

export type TwingNodeExpressionMethodCallAttributes = {
    method: string
};

export type Nodes = {
    node: TwingNodeExpressionName,
    arguments: TwingNodeExpressionArray
};

export class TwingNodeExpressionMethodCall extends TwingNodeExpression<TwingNodeExpressionMethodCallAttributes, Nodes> {
    // constructor(node: TwingNodeExpressionName, method: string, methodArguments: TwingNodeExpressionArray, line: number, column: number) {
    //     super({
    //         node,
    //         arguments: methodArguments
    //     }, {
    //         method,
    //         isDefinedTest: false,
    //         safe: true
    //     }, line, column);
    // }

    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        if (this.attributes.isDefinedTest) {
            compiler
                .raw('(await aliases.proxy[')
                .repr(this.getNode('node').getAttribute('value'))
                .raw('].hasMacro(')
                .repr(this.getAttribute('method'))
                .raw('))')
            ;
        } else {
            compiler
                .raw('await this.callMacro(aliases.proxy[')
                .repr(this.getNode('node').getAttribute('value'))
                .raw('], ')
                .repr(this.getAttribute('method'))
                .raw(', outputBuffer')
                .raw(', [')
            ;
            let first = true;

            let argumentsNode = this.getNode('arguments');

            for (let pair of argumentsNode.keyValuePairs) {
                if (!first) {
                    compiler.raw(', ');
                }

                first = false;

                compiler.subcompile(pair.value);
            }

            compiler
                .raw('], ')
                .repr(this.getLine())
                .raw(', context, this.source)');
        }
    }
}
