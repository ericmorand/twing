import {TwingNodeExpression} from "../expression";
import {TwingNode} from "../../node";
import {TwingCompiler} from "../../compiler";
²
export type TwingNodeExpressionBlockReferenceNodes = {
    name: TwingNode,
    template?: TwingNode
};

export class TwingNodeExpressionBlockReference extends TwingNodeExpression<{}, TwingNodeExpressionBlockReferenceNodes> {
    compile(compiler: TwingCompiler) {
        if (this.attributes.isDefinedTest) {
            this.compileTemplateCall(compiler, 'traceableHasBlock', false);
        } else {
            this.compileTemplateCall(compiler, 'traceableRenderBlock', true);
        }
    }

    compileTemplateCall(compiler: TwingCompiler, method: string, needsOutputBuffer: boolean): TwingCompiler {
        compiler.write('await ');

        if (!this.nodes.template) {
            compiler.raw('this');
        } else {
            compiler
                .raw('(await this.loadTemplate(')
                .subcompile(this.nodes.template)
                .raw(', ')
                .repr(this.line)
                .raw('))')
            ;
        }

        compiler.raw(`.${method}(${this.line}, this.source)`);

        this.compileBlockArguments(compiler, needsOutputBuffer);

        return compiler;
    }

    compileBlockArguments(compiler: TwingCompiler, needsOutputBuffer: boolean) {
        compiler
            .raw('(')
            .subcompile(this.nodes.name)
            .raw(', context.clone()');

        if (needsOutputBuffer) {
            compiler.raw(', outputBuffer');
        }

        if (!this.nodes.template) {
            compiler.raw(', blocks');
        }

        return compiler.raw(')');
    }
}
