import {TwingNodeExpression} from "../expression";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";

export const type = new TwingNodeType('expression_name');

export type Attributes = {
    always_defined: boolean,
    ignore_strict_check: boolean,
    is_defined_test: boolean,
    name: string,
}

export class TwingNodeExpressionName extends TwingNodeExpression<{}, Attributes> {
    private specialVars: Map<string, string>;

    constructor(name: string, lineno: number, columnno: number) {
        let attributes = {
            always_defined: false,
            ignore_strict_check: false,
            is_defined_test: false,
            name: name,
        };

        super({}, attributes, lineno, columnno);

        this.specialVars = new Map([
            ['_self', 'this.templateName'],
            ['_context', 'context'],
            ['_charset', 'this.environment.getCharset()']
        ]);
    }

    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        let name: string = this.getAttribute('name');

        if (this.getAttribute('is_defined_test')) {
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
        else if (this.getAttribute('always_defined')) {
            compiler
                .raw('context.get(')
                .string(name)
                .raw(')')
            ;
        }
        else {
            if (this.getAttribute('ignore_strict_check') || !compiler.getEnvironment().isStrictVariables()) {
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
                    .repr(this.lineno)
                    .raw(', this.source); })()')
                    .raw(')')
                ;
            }
        }
    }

    isSpecial() {
        return this.specialVars.has(this.getAttribute('name'));
    }

    isSimple() {
        return !this.isSpecial() && !this.getAttribute('is_defined_test');
    }
}
