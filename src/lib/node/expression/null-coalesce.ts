import {ConditionalExpressionNode} from "./conditional";
import {ExpressionNode} from "../expression";
import {DefinedTestExpressionNode} from "./test/defined";
import {NotUnaryExpressionNode} from "./unary/not";
import {Location, Node} from "../../node";
import {AndBinaryExpressionNode} from "./binary/and";
import {Compiler} from "../../compiler";
import {TestExpressionNode} from "./test";

export class NullCoalesceExpressionNode extends ConditionalExpressionNode {
    constructor(nodes: [Node, Node], location: Location) {
        // todo: restore
        // let left = nodes[0];
        // let right = nodes[1];
        //
        // let test = new TwingNodeExpressionBinaryAnd(
        //     [
        //         new TwingNodeExpressionTestDefined(<ExpressionNode>left.clone(), 'defined', new Node(), left.getLine(), left.getColumn()),
        //         new TwingNodeExpressionUnaryNot(
        //             new TestExpressionNode(left, 'null', new Node(), left.getLine(), left.getColumn()),
        //             left.getLine(),
        //             left.getColumn()
        //         )
        //     ],
        //     left.getLine(),
        //     left.getColumn()
        // );

        super({}, {expr1: null, expr2: null, expr3: null}, location);
    }

    compile(compiler: Compiler) {
        // todo: restore
        // if (this.edges.expr2.is(nameType)) {
        //     this.edges.expr2.setAttribute('always_defined', true);
        // }

        return super.compile(compiler);
    }
}
