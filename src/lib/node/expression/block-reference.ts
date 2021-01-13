import {ExpressionNode} from "../expression";
import {Node} from "../../node";
import {Compiler} from "../../compiler";

export type BlockReferenceExpressionNodeEdges = {
    name: Node,
    template?: Node
};

export class BlockReferenceExpressionNode extends ExpressionNode<{}, BlockReferenceExpressionNodeEdges> {
    compile(compiler: Compiler) {
        if (this.attributes.isDefinedTest) {
            this.compileTemplateCall(compiler, 'traceableHasBlock', false);
        } else {
            this.compileTemplateCall(compiler, 'traceableRenderBlock', true);
        }
    }

    compileTemplateCall(compiler: Compiler, method: string, needsOutputBuffer: boolean): Compiler {
        compiler.write('await ');

        if (!this.edges.template) {
            compiler.raw('this');
        } else {
            compiler
                .raw('(await this.loadTemplate(')
                .subCompile(this.edges.template)
                .raw(', ')
                .repr(this.location)
                .raw('))')
            ;
        }

        compiler.raw(`.${method}(${this.location}, this.source)`);

        this.compileBlockArguments(compiler, needsOutputBuffer);

        return compiler;
    }

    compileBlockArguments(compiler: Compiler, needsOutputBuffer: boolean) {
        compiler
            .raw('(')
            .subCompile(this.edges.name)
            .raw(', context.clone()');

        if (needsOutputBuffer) {
            compiler.raw(', outputBuffer');
        }

        if (!this.edges.template) {
            compiler.raw(', blocks');
        }

        return compiler.raw(')');
    }
}
