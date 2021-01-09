import {Node} from "../node";
import {TwingNodeExpression} from "./expression";

export class TwingNodeTrait extends Node<{
    template: TwingNodeExpression,
    targets: Node
}> {
    constructor(template: TwingNodeExpression, targets: Node, line: number, column: number) {
        super({template, targets}, line, column);
    }
}
