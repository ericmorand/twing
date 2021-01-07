import {TwingNodeExpressionFilter} from "../filter";
import {TwingNode} from "../../../node";
import {TwingNodeExpressionConstant} from "../constant";
import {TwingNodeExpressionTestDefined} from "../test/defined";
import {TwingNodeExpressionConditional} from "../conditional";
import {TwingNodeExpression} from "../../expression";
import {TwingCompiler} from "../../../compiler";
import {type as nameType} from "../name";
import {type as getAttrType} from "../get-attribute";
import {TwingNodeType} from "../../../node-type";

export const type = new TwingNodeType('expression_filter');

export class TwingNodeExpressionFilterDefault extends TwingNodeExpressionFilter {
    constructor(node: TwingNode, filterName: string, filterArguments: TwingNode, line: number, column: number) {
        let defaultNode = new TwingNodeExpressionFilter(node, 'default', filterArguments, node.getLine(), node.getColumn());

        if (filterName === 'default' && (node.is(nameType) || node.is(getAttrType))) {
            let test = new TwingNodeExpressionTestDefined(node.clone() as TwingNodeExpression, 'defined', new TwingNode(null, null), node.getLine(), node.getColumn());
            let falseNode = filterArguments.getNodes().size ? filterArguments.getNode(0) : new TwingNodeExpressionConstant('', node.getLine(), node.getColumn());

            node = new TwingNodeExpressionConditional(test, defaultNode, falseNode as TwingNodeExpression, node.getLine(), node.getColumn());
        } else {
            node = defaultNode;
        }

        super(node, filterName, filterArguments, line, column);
    }

    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        compiler.subcompile(this.getNode('node'));
    }
}
