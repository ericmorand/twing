import {ExpressionNode} from "../expression";

import {ListExpressionNodeEdge, ListExpressionNode} from "./list";

export type HashExpressionNodeEdge = ListExpressionNodeEdge<ExpressionNode<any>>;

export class HashExpressionNode extends ListExpressionNode<ExpressionNode<any>> {

}
