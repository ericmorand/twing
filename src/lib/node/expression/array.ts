import {TwingNodeExpression} from "../expression";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";

let array_chunk = require('locutus/php/array/array_chunk');

export const type = new TwingNodeType('expression_array');

export type Nodes = {
    [k: number]: TwingNodeExpression
};

export class TwingNodeExpressionArray<N = Nodes> extends TwingNodeExpression<Nodes> {
    constructor(elements: Nodes, lineno: number, columno: number) {
        super(elements, new Map(), lineno, columno);
    }

    get type() {
        return type;
    }

    getKeyValuePairs(): Array<{ key: TwingNodeExpression, value: TwingNodeExpression }> {
        let pairs: Array<{ key: TwingNodeExpression, value: TwingNodeExpression }> = [];

        array_chunk(Array.from(this.children.values()), 2).forEach(function (pair: Array<TwingNodeExpression>) {
            pairs.push({
                key: pair[0],
                value: pair[1]
            });
        });

        return pairs;
    }

    compile(compiler: TwingCompiler) {
        compiler.raw('new Map([');

        let first = true;

        for (let pair of this.getKeyValuePairs()) {
            if (!first) {
                compiler.raw(', ');
            }

            first = false;

            compiler
                .raw('[')
                .subcompile(pair.key)
                .raw(', ')
                .subcompile(pair.value)
                .raw(']')
        }

        compiler.raw('])');
    }
}
