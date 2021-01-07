import {TwingNode} from "../node";
import {TwingNodeExpression} from "./expression";

export class TwingNodeTrait extends TwingNode<{
    template: TwingNodeExpression,
    targets: TwingNode
}> {
    constructor(template: TwingNodeExpression, targets: TwingNode, line: number, column: number) {
        super({template, targets}, line, column);
    }
}
