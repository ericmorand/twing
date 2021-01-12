import {Node} from "../node";
import {ExpressionNode} from "./expression";

export class TraitNode extends Node<null, {
    template: ExpressionNode<any>,
    targets: Node
}> {

}
