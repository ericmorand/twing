import {ExpressionNode} from "../expression";
import {Compiler} from "../../compiler";
import {Node, NodeEdges} from "../../node";
import {ConstantExpressionNode} from "./constant";

export type ListExpressionNodeEdge = Node<null, {
    key: ConstantExpressionNode<string | number>,
    value: ExpressionNode<any>
}>;

export type ListExpressionNodeEdges = NodeEdges<ListExpressionNodeEdge>;

/**
 * An abstract node representing a list of expressions.
 *
 * @typeParam K The type of the keys used as index.
 */
export abstract class ListExpressionNode extends ExpressionNode<{}, ListExpressionNodeEdges> {
    get keyValuePairs(): Array<{ key: string | number, value: ExpressionNode<any> }> {
        let pairs: Array<{ key: string | number, value: ExpressionNode<any> }> = [];

        for (let [, element] of this) {
            pairs.push({
                key: element.edges.key.attributes.value,
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
                .repr(pair.key)
                .raw(', ')
                .subCompile(pair.value)
                .raw(']')
            ;
        }

        compiler.raw('])');
    }
}
