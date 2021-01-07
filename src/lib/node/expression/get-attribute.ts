import {TwingNodeExpression} from "../expression";
import {TwingTemplate} from "../../template";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";

import type {TwingNodeExpressionAttributes} from "../expression";

export const type = new TwingNodeType('expression_get_attribute');

type Nodes = {
    node: TwingNodeExpression,
    attribute: TwingNodeExpression,
    arguments?: TwingNodeExpression
};

type Attributes = TwingNodeExpressionAttributes & {
    type: string,
    is_defined_test: boolean
};

export class TwingNodeExpressionGetAttribute extends TwingNodeExpression<Nodes, Attributes> {
    constructor(node: TwingNodeExpression, attribute: TwingNodeExpression, methodArguments: TwingNodeExpression, type: string, line: number, column: number) {
        super({
            node,
            attribute,
            arguments: methodArguments
        }, {
            type,
            is_defined_test: false,
            optimizable: true
        }, line, column);
    }

    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        let env = compiler.getEnvironment();

        // optimize array, hash and Map calls
        if (this.getAttribute('optimizable')
            && (!env.isStrictVariables() || this.getAttribute('ignore_strict_check'))
            && !this.getAttribute('is_defined_test')
            && this.getAttribute('type') === TwingTemplate.ARRAY_CALL) {

            compiler
                .raw('await (async () => {let object = ')
                .subcompile(this.getNode('node'))
                .raw('; return this.get(object, ')
                .subcompile(this.getNode('attribute'))
                .raw(');})()')
            ;

            return;
        }

        compiler.raw(`await this.traceableMethod(this.getAttribute, ${this.getLine()}, this.source)(this.environment, `);

        if (this.getAttribute('ignore_strict_check')) {
            this.getNode('node').setAttribute('ignore_strict_check', true);
        }

        compiler.subcompile(this.getNode('node'));

        compiler.raw(', ').subcompile(this.getNode('attribute'));

        if (this.hasNode('arguments')) {
            compiler.raw(', ').subcompile(this.getNode('arguments'));
        } else {
            compiler.raw(', new Map()');
        }

        compiler
            .raw(', ').repr(this.getAttribute('type'))
            .raw(', ').repr(this.getAttribute('is_defined_test'))
            .raw(', ').repr(this.getAttribute('ignore_strict_check'))
            .raw(', ').repr(env.isSandboxed())
            .raw(')');
    }
}
