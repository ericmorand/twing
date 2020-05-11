import {TwingNodeExpression} from "../expression";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";

export const type = new TwingNodeType('expression_temp_name');

export type Attributes = {
    declaration: boolean,
    name: string
};

export class TwingNodeExpressionTempName extends TwingNodeExpression<{}, Attributes> {
    constructor(name: string, declaration: boolean, lineno: number, columno: number) {
        let attributes = {
            declaration: declaration,
            name: name
        };

        super({}, attributes, lineno, columno);
    }

    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        compiler
            .raw(`${this.getAttribute('declaration') ? 'let ' : ''}$_`)
            .raw(this.getAttribute('name'))
            .raw('_')
        ;
    }
}
