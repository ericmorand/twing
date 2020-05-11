import {Attributes, Children, TwingNode} from "../node";

/**
 * Abstract class for all nodes that represents an expression.
 */
export abstract class TwingNodeExpression<N = Children, A = Attributes> extends TwingNode<N, A> {
}
