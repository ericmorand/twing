import {TwingNode} from "../node";

import type {AnonymousNodes} from "../node";

export type TwingNodeExpressionAttributes = {
    optimizable?: boolean,
    ignoreStrictCheck?: boolean,
    isDefinedTest?: boolean,
    alwaysDefined?: boolean,
    safe?: boolean
};

/**
 * Abstract class for all nodes that represents an expression.
 */
export abstract class TwingNodeExpression<A extends TwingNodeExpressionAttributes = TwingNodeExpressionAttributes, N extends AnonymousNodes = any> extends TwingNode<A, N> {

}
