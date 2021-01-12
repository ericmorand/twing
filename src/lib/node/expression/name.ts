import {ExpressionNode} from "../expression";
import {Compiler} from "../../compiler";

import type {ExpressionNodeAttributes} from "../expression";
import type {Location} from "../../node";

export type TwingNodeExpressionNameAttributes = {
    value: string
};

export class NameExpressionNode extends ExpressionNode<TwingNodeExpressionNameAttributes> {
    private specialVars: Map<string, string>;

    constructor(attributes: ExpressionNodeAttributes<TwingNodeExpressionNameAttributes>, nodes: null, location: Location) {
        super(attributes, nodes, location);

        this.specialVars = new Map([
            ['_self', 'this.templateName'],
            ['_context', 'context'],
            ['_charset', 'this.environment.getCharset()']
        ]);
    }

    compile(compiler: Compiler) {
        const name = this.attributes.value;

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
                const {line, column} = this.location;

                compiler
                    .raw('(context.has(')
                    .string(name)
                    .raw(') ? context.get(')
                    .string(name)
                    .raw(') : (() => { throw new this.RuntimeError(\'Variable ')
                    .string(name)
                    .raw(' does not exist.\', ')
                    .raw(`{line: ${line}, column: ${column}}, `)
                    .raw('this.source); })()')
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
