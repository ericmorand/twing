import {Node} from "../node";

import type {NodeEdges} from "../node";

export type ExpressionNodeAttributes<A> = A & {
    optimizable?: boolean,
    ignoreStrictCheck?: boolean,
    isDefinedTest?: boolean,
    alwaysDefined?: boolean,
    safe?: boolean
};

/**
 * Abstract class for all nodes that represents an expression.
 */
export abstract class ExpressionNode<A, N extends NodeEdges = any> extends Node<ExpressionNodeAttributes<A>, N> {

}
