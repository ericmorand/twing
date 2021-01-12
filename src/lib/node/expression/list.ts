import {ExpressionNode} from "../expression";
import {Compiler} from "../../compiler";
import {Node, NodeEdges} from "../../node";

export type ListExpressionNodeEdge<K extends Node> = Node<null, {
    key: K,
    value: ExpressionNode<any>
}>;

export type ListExpressionNodeEdges<K extends Node> = NodeEdges<ListExpressionNodeEdge<K>>;

/**
 * An abstract node representing a list of expressions.
 *
 * @typeParam K The type of the keys used as index.
 */
export abstract class ListExpressionNode<K extends Node> extends ExpressionNode<{}, ListExpressionNodeEdges<K>> {
    get keyValuePairs(): Array<{ key: K, value: ExpressionNode<any> }> {
        let pairs: Array<{ key: K, value: ExpressionNode<any> }> = [];

        for (let [, element] of this) {
            pairs.push({
                key: element.edges.key,
                value: element.edges.value
            });
        }

        return pairs;
    }

    compile(compiler: Compiler) {
        compiler.raw('new Map([');

        let first = true;

        for (let pair of this.keyValuePairs) {
            if (!first) {
                compiler.raw(', ');
            }

            first = false;

            compiler
                .raw('[')
                .subCompile(pair.key)
                .raw(', ')
                .subCompile(pair.value)
                .raw(']')
            ;
        }

        compiler.raw('])');
    }
}
