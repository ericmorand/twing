import {TwingNodeExpression} from "../expression";
import {TwingCompiler} from "../../compiler";

import type {TwingNodeExpressionAttributes} from "../expression";

export type TwingNodeExpressionNameAttributes = TwingNodeExpressionAttributes & {
    value: string
};

export class TwingNodeExpressionName<A extends TwingNodeExpressionNameAttributes = TwingNodeExpressionNameAttributes> extends TwingNodeExpression<A> {
    private specialVars: Map<string, string>;

    constructor(attributes: A, nodes: null, line: number, column: number) {
        super(attributes, null, line, column);

        this.specialVars = new Map([
            ['_self', 'this.templateName'],
            ['_context', 'context'],
            ['_charset', 'this.environment.getCharset()']
        ]);
    }

    compile(compiler: TwingCompiler) {
        let name = this.attributes.value;

        if (this.attributes.isDefinedTest) {
            if (this.isSpecial()) {
                compiler.repr(true);
            }
            else {
                compiler.raw('(context.has(').repr(name).raw('))');
            }
        }
        else if (this.isSpecial()) {
            compiler.raw(this.specialVars.get(name));
        }
        else if (this.attributes.alwaysDefined) {
            compiler
                .raw('context.get(')
                .string(name)
                .raw(')')
            ;
        }
        else {
            if (this.attributes.ignoreStrictCheck || !compiler.getEnvironment().isStrictVariables()) {
                compiler
                    .raw('(context.has(')
                    .string(name)
                    .raw(') ? context.get(')
                    .string(name)
                    .raw(') : null)')
                ;
            }
            else {
                compiler
                    .raw('(context.has(')
                    .string(name)
                    .raw(') ? context.get(')
                    .string(name)
                    .raw(') : (() => { throw new this.RuntimeError(\'Variable ')
                    .string(name)
                    .raw(' does not exist.\', ')
                    .repr(this.line)
                    .raw(', this.source); })()')
                    .raw(')')
                ;
            }
        }
    }

    isSpecial() {
        return this.specialVars.has(this.attributes.value);
    }

    isSimple() {
        return !this.isSpecial() && !this.attributes.isDefinedTest;
    }
}
