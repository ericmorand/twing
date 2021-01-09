import {TwingNodeExpression} from "../expression";
import {Compiler} from "../../compiler";

export type TwingNodeExpressionListAttributes<K> = {
    elements: Array<[K, TwingNodeExpression<any>]>
};

/**
 * An abstract node representing a list of expressions.
 *
 * @typeParam K The type of the keys used as index.
 */
export abstract class TwingNodeExpressionList<K> extends TwingNodeExpression<TwingNodeExpressionListAttributes<K>, null> {
    get keyValuePairs(): Array<{ key: K, value: TwingNodeExpression<any> }> {
        let pairs: Array<{ key: K, value: TwingNodeExpression<any> }> = [];

        for (let element of this.attributes.elements) {
            pairs.push({
                key: element[0],
                value: element[1]
            });
        }

        return pairs;
    }

    protected abstract compileKey(compiler: Compiler, key: K): void;

    compile(compiler: Compiler) {
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
