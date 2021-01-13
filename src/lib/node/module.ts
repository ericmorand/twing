import {Node} from "../node";
import {Compiler} from "../compiler";
import {TemplateNode} from "./template";
import {EmbeddedTemplateNode} from "./embeddedTemplate";

/**
 * Represents a module node that compiles into a JavaScript module.
 */
export type ModuleNodeAttributes = {
    embeddedTemplates: Array<EmbeddedTemplateNode>
};

export type ModuleNodeEdges = {
    template: TemplateNode
};

export class ModuleNode extends Node<ModuleNodeAttributes, ModuleNodeEdges> {
    compile(compiler: Compiler) {
        compiler
            .write('module.exports = (Template) => {\n')
            .indent()
            .write('return new Map([\n')
            .indent()
        ;

        const compileTemplate = (template: Node, index: number) => {
            compiler
                .write(`[${index},\n`)
                .indent()
                .subCompile(template)
                .outdent()
                .write(`],\n`);
        }

        compileTemplate(this.edges.template, 0);

        for (let template of this.attributes.embeddedTemplates) {
            compileTemplate(template, template.attributes.index);
        }

        compiler
            .outdent()
            .write(']);\n')
            .outdent()
            .write('};')
        ;
    }
}
