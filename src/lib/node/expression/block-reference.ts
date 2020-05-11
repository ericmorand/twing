import {TwingNodeExpression} from "../expression";
import {TwingNode} from "../../node";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";

export const type = new TwingNodeType('expression_block_reference');

export type Nodes = {
    name: TwingNode,
    template: TwingNode
}

export type Attributes = {
    is_defined_test: boolean,
    output: boolean
}

export class TwingNodeExpressionBlockReference extends TwingNodeExpression<Nodes, Attributes> {
    constructor(name: TwingNode, template: TwingNode, lineno: number, columnno: number, tag: string = null) {
        let nodes: Nodes = {
            name: name,
            template: template
        };

        let attributes = {
            is_defined_test: false,
            output: false
        };

        super(nodes, attributes, lineno, columnno, tag);
    }

    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        if (this.getAttribute('is_defined_test')) {
            this.compileTemplateCall(compiler, 'traceableHasBlock', false);
        } else {
            this.compileTemplateCall(compiler, 'traceableRenderBlock', true);
        }
    }

    compileTemplateCall(compiler: TwingCompiler, method: string, needsOutputBuffer: boolean): TwingCompiler {
        compiler.write('await ');

        if (!this.hasChild('template')) {
            compiler.raw('this');
        } else {
            compiler
                .raw('(await this.loadTemplate(')
                .subcompile(this.getChild('template'))
                .raw(', ')
                .repr(this.getTemplateLine())
                .raw('))')
            ;
        }

        compiler.raw(`.${method}(${this.getTemplateLine()}, this.source)`);

        this.compileBlockArguments(compiler, needsOutputBuffer);

        return compiler;
    }

    compileBlockArguments(compiler: TwingCompiler, needsOutputBuffer: boolean) {
        compiler
            .raw('(')
            .subcompile(this.getChild('name'))
            .raw(', context.clone()');

        if (needsOutputBuffer) {
            compiler.raw(', outputBuffer');
        }

        if (!this.hasChild('template')) {
            compiler.raw(', blocks');
        }

        return compiler.raw(')');
    }
}
