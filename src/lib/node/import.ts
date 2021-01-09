/**
 * Represents an import node.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import {Node} from "../node";
import {TwingNodeExpression, TwingNodeExpressionAttributes} from "./expression";
import {Compiler} from "../compiler";
import {TwingNodeExpressionName} from "./expression/name";

export type TwingNodeImportAttributes = {
    global: boolean
};

export type TwingNodeImportNodes = {
    templateName: TwingNodeExpression,
    variable: TwingNodeExpression<TwingNodeExpressionAttributes & {
        value: string
    }>
};

export class TwingNodeImport<A extends TwingNodeImportAttributes = TwingNodeImportAttributes, N extends TwingNodeImportNodes = TwingNodeImportNodes> extends Node<TwingNodeImportAttributes, TwingNodeImportNodes> {
    compile(compiler: Compiler) {
        compiler
            .write('aliases.proxy[')
            .repr(this.getNode('variable').getAttribute('value'))
            .raw('] = ')
        ;

        if (this.getAttribute('global')) {
            compiler
                .raw('this.aliases.proxy[')
                .repr(this.getNode('variable').getAttribute('value'))
                .raw('] = ')
            ;
        }

        const templateName = this.getNode('templateName');

        if ((templateName instanceof TwingNodeExpressionName) && (templateName.getAttribute('value') === '_self')) {
            compiler.raw('this');
        } else {
            compiler
                .raw('await this.loadTemplate(')
                .subcompile(this.getNode('templateName'))
                .raw(', ')
                .repr(this.line)
                .raw(')')
            ;
        }

        compiler.raw(";\n");
    }
}
