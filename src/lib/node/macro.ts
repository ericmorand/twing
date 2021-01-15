/**
 * Represents a macro node.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import {Location, Node, NodeEdges} from "../node";
import {SyntaxError} from "../error/syntax";
import {Compiler} from "../compiler";
import {BodyNode} from "./body";

import type {ArgumentsExpressionNode} from "./expression/arguments";

export type MacroNodeAttributes = {
    name: string
};

export type MacroNodeEdges = {
    body: BodyNode,
    arguments: ArgumentsExpressionNode
};

export class MacroNode extends Node<MacroNodeAttributes, MacroNodeEdges> {
    static VARARGS_NAME = 'varargs';

    constructor(attributes: MacroNodeAttributes, edges: MacroNodeEdges, location: Location, tag: string = null) {
        for (let [argumentName, macroArgument] of edges.arguments) {
            if (argumentName === MacroNode.VARARGS_NAME) {
                throw new SyntaxError(`The argument "${MacroNode.VARARGS_NAME}" in macro "${attributes.name}" cannot be defined because the variable "${MacroNode.VARARGS_NAME}" is reserved for arbitrary arguments.`, null, macroArgument.location);
            }
        }

        super(attributes, edges, location, tag);
    }

    compile(compiler: Compiler) {
        compiler
            .raw(`async (`)
            .raw('outputBuffer, ')
        ;

        let count = this.edges.arguments.edgesCount;
        let pos = 0;

        for (let [name, defaultValue] of this.edges.arguments) {
            compiler
                .raw('__' + name + '__ = ')
                .subCompile(defaultValue)
            ;

            if (++pos < count) {
                compiler.raw(', ');
            }
        }

        if (count) {
            compiler.raw(', ');
        }

        compiler
            .raw('...__varargs__')
            .raw(") => {\n")
            .indent()
            .write('let aliases = this.aliases.clone();\n')
            .write("let context = new this.Context(this.environment.mergeGlobals(new Map([\n")
            .indent()
        ;

        let first = true;

        for (let [name] of this.edges.arguments) {
            if (!first) {
                compiler.raw(',\n');
            }

            first = false;

            compiler
                .write('[')
                .string(name)
                .raw(', __' + name + '__]')
            ;
        }

        if (!first) {
            compiler.raw(',\n');
        }

        compiler
            .write('[')
            .string(MacroNode.VARARGS_NAME)
            .raw(', ')
        ;

        compiler
            .raw("\__varargs__]\n")
            .outdent()
            .write("])));\n\n")
            .write("let blocks = new Map();\n")
            .write('let result;\n')
            .write('let error;\n\n')
            .write("outputBuffer.start();\n")
            .write("try {\n")
            .indent()
            .subCompile(this.edges.body)
            .raw("\n")
            .write('let tmp = outputBuffer.getContents();\n')
            .write("result = (tmp === '') ? '' : new this.Markup(tmp, this.environment.getCharset());\n")
            .outdent()
            .write("}\n")
            .write('catch (e) {\n')
            .indent()
            .write('error = e;\n')
            .outdent()
            .write('}\n\n')
            .write("outputBuffer.endAndClean();\n\n")
            .write('if (error) {\n')
            .indent()
            .write('throw error;\n')
            .outdent()
            .write('}\n')
            .write('return result;\n')
            .outdent()
            .write("}")
        ;
    }
}
