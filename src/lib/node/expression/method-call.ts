import {TwingNodeExpression} from "../expression";
import {TwingNodeExpressionArray} from "./array";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";
import type {TwingNodeExpressionAssignName} from "./assign-name";

export const type = new TwingNodeType('expression_method_call');

export type Nodes = {
    node: TwingNodeExpressionAssignName,
    arguments: TwingNodeExpressionArray
}

export type Attributes = {
    method: string,
    safe: boolean,
    is_defined_test: boolean
}

export class TwingNodeExpressionMethodCall extends TwingNodeExpression<Nodes, Attributes> {
    constructor(node: TwingNodeExpressionAssignName, method: string, methodArguments: TwingNodeExpressionArray, lineno: number, columnno: number) {
        let nodes = {
            node: node,
            arguments: methodArguments
        };

        let attributes = {
            method: method,
            safe: false,
            is_defined_test: false
        };

        super(nodes, attributes, lineno, columnno);
    }

    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        if (this.getAttribute('is_defined_test')) {
            compiler
                .raw('(await aliases.proxy[')
                .repr(this.getChild('node').getAttribute('name'))
                .raw('].hasMacro(')
                .repr(this.getAttribute('method'))
                .raw('))')
            ;
        }
        else {
            compiler
                .raw('await this.callMacro(aliases.proxy[')
                .repr(this.getChild('node').getAttribute('name'))
                .raw('], ')
                .repr(this.getAttribute('method'))
                .raw(', outputBuffer')
                .raw(', [')
            ;
            let first = true;

            let argumentsNode = this.getChild('arguments');

            for (let pair of argumentsNode.getKeyValuePairs()) {
                if (!first) {
                    compiler.raw(', ');
                }
                first = false;

                compiler.subcompile(pair['value']);
            }

            compiler
                .raw('], ')
                .repr(this.getTemplateLine())
                .raw(', context, this.source)');
        }
    }
}
