import {Node} from "../node";

import type {NodeChildren} from "../node";

export type TwingNodeExpressionAttributes<A> = A & {
    optimizable?: boolean,
    ignoreStrictCheck?: boolean,
    isDefinedTest?: boolean,
    alwaysDefined?: boolean,
    safe?: boolean
};

/**
 * Abstract class for all nodes that represents an expression.
 */
export abstract class TwingNodeExpression<A, N extends NodeChildren = any> extends Node<TwingNodeExpressionAttributes<A>, N> {

}
