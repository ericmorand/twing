import {TwingNodeExpressionArray} from "./array";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";
import {TwingNodeExpression} from "../expression";

export const type = new TwingNodeType('expression_hash');

export type Nodes = {
    [k: string]: TwingNodeExpression
};

export class TwingNodeExpressionHash extends TwingNodeExpressionArray<Nodes> {
    get type() {
        return type;
    }

    /**
     * hash node is also an array node.
     *
     * @param type
     */
    is(type: TwingNodeType): boolean {
        return (type === super.type) || super.is(type);
    }
}
