/**
 * Represents an import node.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import {Node} from "../node";
import {ExpressionNode, ExpressionNodeAttributes} from "./expression";
import {Compiler} from "../compiler";
import {NameExpressionNode} from "./expression/name";

export type ImportNodeAttributes = {
    global: boolean
};

export type ImportNodeEdges = {
    templateName: ExpressionNode<any>,
    variable: ExpressionNode<ExpressionNodeAttributes<{
        value: string
    }>>
};

export class ImportNode<A extends ImportNodeAttributes = ImportNodeAttributes, N extends ImportNodeEdges = ImportNodeEdges> extends Node<ImportNodeAttributes, ImportNodeEdges> {
    compile(compiler: Compiler) {
        compiler
            .write('aliases.proxy[')
            .repr(this.edges.variable.attributes.value)
            .raw('] = ')
        ;

        if (this.attributes.global) {
            compiler
                .raw('this.aliases.proxy[')
                .repr(this.edges.variable.attributes.value)
                .raw('] = ')
            ;
        }

        const templateName = this.edges.templateName;

        if ((templateName instanceof NameExpressionNode) && (templateName.attributes.value === '_self')) {
            compiler.raw('this');
        } else {
            compiler
                .raw('await this.loadTemplate(')
                .subCompile(this.edges.templateName)
                .raw(', ')
                .repr(this.location)
                .raw(')')
            ;
        }

        compiler.raw(";\n");
    }
}
