import {FilterExpressionNode} from "../filter";
import {Node} from "../../../node";
import {ConstantExpressionNode} from "../constant";
import {DefinedTestExpressionNode} from "../test/defined";
import {ConditionalExpressionNode} from "../conditional";
import {ExpressionNode} from "../../expression";
import {Compiler} from "../../../compiler";

import type {HashExpressionNode} from "../hash";

export class DefaultFilterExpressionNode extends FilterExpressionNode {
    constructor(node: Node, filterName: string, filterArguments: HashExpressionNode, line: number, column: number) {
        // todo: restore
        // let defaultNode = new FilterExpressionNode(node, 'default', filterArguments, node.getLine(), node.getColumn());

        // if (filterName === 'default' && (node.is(nameType) || node.is(getAttrType))) {
        //     let test = new TwingNodeExpressionTestDefined(node.clone() as ExpressionNode, 'defined', new Node(null, null), node.getLine(), node.getColumn());
        //     let falseNode = filterArguments.getNodes().size ? filterArguments.getNode(0) : new ConstantExpressionNode('', node.getLine(), node.getColumn());
        //
        //     node = new ConditionalExpressionNode(test, defaultNode, falseNode as ExpressionNode, node.getLine(), node.getColumn());
        // } else {
        //     node = defaultNode;
        // }

        super({name: filterName}, {node, arguments: filterArguments}, {line, column});
    }

    compile(compiler: Compiler) {
        compiler.subCompile(this.edges.node);
    }
}
