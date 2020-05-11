import {TwingNodeExpressionFilter} from "../filter";
import {TwingNode} from "../../../node";
import {TwingNodeExpressionTestDefined} from "../test/defined";
import {TwingNodeExpressionConditional} from "../conditional";
import {TwingNodeExpression} from "../../expression";
import {TwingCompiler} from "../../../compiler";
import {type as nameType} from "../name";
import {type as getAttrType} from "../get-attribute";
import {TwingNodeType} from "../../../node-type";
import {TwingNodeExpressionConstantString} from "../constant/string";

export const type = new TwingNodeType('expression_filter');

export class TwingNodeExpressionFilterDefault extends TwingNodeExpressionFilter {
    constructor(node: TwingNode, filterName: TwingNodeExpressionConstantString, methodArguments: TwingNode, lineno: number, columnno: number, tag: string = null) {
        let defaultNode = new TwingNodeExpressionFilter(node, 'default', methodArguments, node.getTemplateLine(), node.getTemplateColumn());

        // if (filterName.getAttribute('value') === 'default' && (node.is(nameType) || node.is(getAttrType))) {
        //     let test = new TwingNodeExpressionTestDefined(node.clone() as TwingNodeExpression, 'defined', new TwingNode(), node.getTemplateLine(), node.getTemplateColumn());
        //     let falseNode = methodArguments.nodes.size ? methodArguments.getNode(0) : new TwingNodeExpressionConstantString('', node.getTemplateLine(), node.getTemplateColumn());
        //
        //     node = new TwingNodeExpressionConditional(test, defaultNode, falseNode, node.getTemplateLine(), node.getTemplateColumn());
        // }
        // else {
        //     node = defaultNode;
        // }

        super(node, 'default', methodArguments, lineno, columnno);
    }

    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        compiler.subcompile(this.getChild('node'));
    }
}
