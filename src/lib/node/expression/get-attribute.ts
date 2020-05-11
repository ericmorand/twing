import {TwingNodeExpression} from "../expression";
import {TwingTemplate} from "../../template";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";

export const type = new TwingNodeType('expression_get_attribute');

export type Nodes = {
    node: TwingNodeExpression,
    attribute: TwingNodeExpression,
    arguments: TwingNodeExpression
};

export type Attributes = {
    ignore_strict_check: boolean,
    is_defined_test: boolean,
    optimizable: boolean,
    type: string
};

export class TwingNodeExpressionGetAttribute extends TwingNodeExpression<Nodes, Attributes> {
    constructor(node: TwingNodeExpression, attribute: TwingNodeExpression, methodArguments: TwingNodeExpression, type: string, lineno: number, columnno: number) {
        const nodes = {
            node: node,
            attribute: attribute,
            arguments: methodArguments
        };

        const attributes = {
            type: type,
            is_defined_test: false,
            ignore_strict_check: false,
            optimizable: true
        };

        super(nodes, attributes, lineno, columnno);
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
                .subcompile(this.getChild('node'))
                .raw('; return this.get(object, ')
                .subcompile(this.getChild('attribute'))
                .raw(');})()')
            ;

            return;
        }

        compiler.raw(`await this.traceableMethod(this.getAttribute, ${this.getTemplateLine()}, this.source)(this.environment, `);

        if (this.getAttribute('ignore_strict_check')) {
            this.getChild('node').setAttribute('ignore_strict_check', true);
        }

        compiler.subcompile(this.getChild('node'));

        compiler.raw(', ').subcompile(this.getChild('attribute'));

        if (this.hasChild('arguments')) {
            compiler.raw(', ').subcompile(this.getChild('arguments'));
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
