import {TwingNodeExpression} from "../expression";
import {Node} from "../../node";
import {Compiler} from "../../compiler";

export type TwingNodeExpressionBlockReferenceNodes = {
    name: Node,
    template?: Node
};

export class TwingNodeExpressionBlockReference extends TwingNodeExpression<{}, TwingNodeExpressionBlockReferenceNodes> {
    compile(compiler: Compiler) {
        if (this.attributes.isDefinedTest) {
            this.compileTemplateCall(compiler, 'traceableHasBlock', false);
        } else {
            this.compileTemplateCall(compiler, 'traceableRenderBlock', true);
        }
    }

    compileTemplateCall(compiler: Compiler, method: string, needsOutputBuffer: boolean): Compiler {
        compiler.write('await ');

        if (!this.children.template) {
            compiler.raw('this');
        } else {
            compiler
                .raw('(await this.loadTemplate(')
                .subcompile(this.children.template)
                .raw(', ')
                .repr(this.line)
                .raw('))')
            ;
        }

        compiler.raw(`.${method}(${this.line}, this.source)`);

        this.compileBlockArguments(compiler, needsOutputBuffer);

        return compiler;
    }

    compileBlockArguments(compiler: Compiler, needsOutputBuffer: boolean) {
        compiler
            .raw('(')
            .subcompile(this.children.name)
            .raw(', context.clone()');

        if (needsOutputBuffer) {
            compiler.raw(', outputBuffer');
        }

        if (!this.children.template) {
            compiler.raw(', blocks');
        }

        return compiler.raw(')');
    }
}
