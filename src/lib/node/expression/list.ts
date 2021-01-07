import {TwingNodeExpression} from "../expression";
import {TwingCompiler} from "../../compiler";

import type {TwingNodeExpressionAttributes} from "../expression";

export type TwingNodeExpressionListAttributes<K> = TwingNodeExpressionAttributes & {
    elements: Array<[K, TwingNodeExpression]>
};

/**
 * An abstract node representing a list of expressions.
 *
 * @typeParam K The type of the keys used as index.
 */
export abstract class TwingNodeExpressionList<K> extends TwingNodeExpression<TwingNodeExpressionListAttributes<K>, null> {
    get keyValuePairs(): Array<{ key: K, value: TwingNodeExpression }> {
        let pairs: Array<{ key: K, value: TwingNodeExpression }> = [];

        for (let element of this.attributes.elements) {
            pairs.push({
                key: element[0],
                value: element[1]
            });
        }

        return pairs;
    }

    protected abstract compileKey(compiler: TwingCompiler, key: K): void;

    compile(compiler: TwingCompiler) {
        compiler.raw('new Map([');

        let first = true;

        for (let pair of this.keyValuePairs) {
            if (!first) {
                compiler.raw(', ');
            }

            first = false;

            compiler.raw('[');

            this.compileKey(compiler, pair.key);

            compiler
                .raw(', ')
                .subcompile(pair.value)
                .raw(']')
            ;
        }

        compiler.raw('])');
    }
}
