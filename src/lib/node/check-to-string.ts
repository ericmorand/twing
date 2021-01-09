import {Node} from "../node";
import {TwingNodeExpression} from "./expression";
import {Compiler} from "../compiler";
import {TwingNodeType} from "../node-type";

export const type = new TwingNodeType('check_to_string');

/**
 * Checks if casting an expression to toString() is allowed by the sandbox.
 *
 * For instance, when there is a simple Print statement, like {{ article }},
 * and if the sandbox is enabled, we need to check that the toString()
 * method is allowed if 'article' is an object. The same goes for {{ article|upper }}
 * or {{ random(article) }}.
 */
export class TwingNodeCheckToString extends Node {
    constructor(expression: TwingNodeExpression) {
        super(new Map([['expr', expression]]), new Map(), expression.getLine(), expression.getColumn());
    }

    get type() {
        return type;
    }

    compile(compiler: Compiler) {
        compiler
            .raw('this.environment.ensureToStringAllowed(')
            .subcompile(this.getNode('expr'))
            .raw(')')
        ;
    }
}

