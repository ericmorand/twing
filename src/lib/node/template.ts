import {Node, NodeEdges} from "../node";
import {Compiler} from "../compiler";
import {ConstantExpressionNode} from "./expression/constant";
import {ImportNode} from "./import";
import {NameExpressionNode} from "./expression/name";
import {AssignNameExpressionNode} from "./expression/assign-name";


import type {Source} from "../source";
import type {BodyNode} from "./body";
import type {TraitNode} from "./trait";

export type TemplateNodeAttributes = {
    source: Source
};

export type TemplateNodeEdges = {
    body: BodyNode,
    blocks: Node,
    macros: Node,
    traits: Node<{}, NodeEdges<TraitNode>>,
    displayStart?: Node,
    displayEnd?: Node,
    constructorStart?: Node,
    constructorEnd?: Node,
    classEnd?: Node,
    parent?: Node
};

export class TemplateNode extends Node<TemplateNodeAttributes, TemplateNodeEdges> {
    compile(compiler: Compiler) {
        this.compileClassHeader(compiler);
        this.compileConstructor(compiler);
        this.compileDoGetParent(compiler);
        this.compileDoGetTraits(compiler);
        this.compileDoDisplay(compiler);
        this.compileIsTraitable(compiler);
        this.compileClassfooter(compiler);
    }

    protected compileClassHeader(compiler: Compiler) {
        compiler
            .write(`class extends Template {\n`)
            .indent();
    }

    protected compileConstructor(compiler: Compiler) {
        compiler
            .write('constructor(environment) {\n')
            .indent();

        if (this.edges.constructorStart) {
            compiler.subCompile(this.edges.constructorStart);
        }

        compiler
            .write('super(environment);\n\n')
            .write('this._source = new this.Source(')
            .string(compiler.getEnvironment().isDebug() || compiler.getEnvironment().isSourceMap() ? this.attributes.source.content : '')
            .raw(', ')
            .string(this.attributes.source.resolvedName)
            .raw(");\n\n")
            .write('let aliases = new this.Context();\n');

        // _self
        const selfImportNode = new ImportNode({global: true}, {
            templateName: new NameExpressionNode({value: '_self'}, null, this.location),
            variable: new AssignNameExpressionNode({value: '_self'}, null, this.location)
        }, this.location);

        compiler.subCompile(selfImportNode);

        // block handlers
        let count: number = this.edges.blocks.edgesCount;

        if (count > 0) {
            compiler
                .write('\n')
                .write('this.blockHandlers = new Map([\n')
                .indent();

            for (let [name, block] of this.edges.blocks) {
                count--;

                compiler.write(`['${name}', `)
                    .subCompile(block)
                    .raw(']');

                if (count > 0) {
                    compiler.raw(',')
                }

                compiler.raw('\n');
            }

            compiler
                .outdent()
                .write(']);\n');
        }

        // macro handlers
        count = this.edges.macros.edgesCount;

        if (count > 0) {
            compiler
                .write('\n')
                .write('this.macroHandlers = new Map([\n')
                .indent();

            for (let [name, macro] of this.edges.macros) {
                count--;

                compiler.write(`['${name}', `)
                    .subCompile(macro)
                    .raw(']');

                if (count > 0) {
                    compiler.raw(',')
                }

                compiler.raw('\n');
            }

            compiler
                .outdent()
                .write(']);\n');
        }

        if (this.edges.constructorEnd) {
            compiler.subCompile(this.edges.constructorEnd);
        }

        compiler
            .outdent()
            .write('}\n\n');
    }

    protected compileDoGetTraits(compiler: Compiler) {
        let count = this.edges.traits.edgesCount;

        if (count > 0) {
            compiler
                .write("async doGetTraits() {\n")
                .indent()
                .write('let traits = new Map();\n\n');

            for (let [i, trait] of this.edges.traits) {
                let node = trait.edges.template;

                compiler
                    .write(`let trait_${i} = await this.loadTemplate(`)
                    .subCompile(node)
                    .raw(', ')
                    .repr(node.location)
                    .raw(");\n\n")
                ;

                compiler
                    .write(`if (!trait_${i}.isTraitable) {\n`)
                    .indent()
                    .write('throw new this.RuntimeError(\'Template ')
                    .subCompile(trait.edges.template)
                    .raw(' cannot be used as a trait.\', ')
                    .repr(node.location)
                    .raw(", this.source);\n")
                    .outdent()
                    .write('}\n\n')
                    .write(`let traits_${i} = this.cloneMap(await trait_${i}.getBlocks());\n\n`)
                ;

                for (let [key, value] of trait.edges.targets) {
                    compiler
                        .write(`if (!traits_${i}.has(`)
                        .string(key as string)
                        .raw(")) {\n")
                        .indent()
                        .write('throw new this.RuntimeError(\'Block ')
                        .string(key as string)
                        .raw(' is not defined in trait ')
                        .subCompile(trait.edges.template)
                        .raw('.\', ')
                        .repr(value.location)
                        .raw(', this.source);\n')
                        .outdent()
                        .write('}\n\n')
                        .write(`traits_${i}.set(`)
                        .subCompile(value)
                        .raw(`, traits_${i}.get(`)
                        .string(key)
                        .raw(`)); traits_${i}.delete(`)
                        .string(key)
                        .raw(');\n\n')
                    ;
                }
            }

            for (let i = 0; i < count; ++i) {
                compiler.write(`traits = this.merge(traits, traits_${i});\n`);
            }

            compiler.write('\n');

            compiler
                .write('return Promise.resolve(traits);\n')
                .outdent()
                .write('}\n\n');
        }
    }

    protected compileDoGetParent(compiler: Compiler) {
        if (this.edges.parent) {
            let parent = this.edges.parent;

            compiler
                .write("doGetParent(context) {\n")
                .indent()
                .write('return this.loadTemplate(')
                .subCompile(parent)
                .raw(', ')
                .repr(parent.location)
                .raw(")")
            ;

            // if the parent name is not dynamic, then we can cache the parent as it will never change
            if (parent instanceof ConstantExpressionNode) {
                compiler
                    .raw('.then((parent) => {\n')
                    .indent()
                    .write('this.parent = parent;\n\n')
                    .write('return parent;\n')
                    .outdent()
                    .write('})')
            }

            compiler
                .raw(';\n')
                .outdent()
                .write("}\n\n")
            ;
        }
    }

    protected compileDoDisplay(compiler: Compiler) {
        compiler
            .write("async doDisplay(context, outputBuffer, blocks = new Map()) {\n")
            .indent()
            .write('let aliases = this.aliases.clone();\n\n')
            .addSourceMapEnter(this);

        if (this.edges.displayStart) {
            compiler.subCompile(this.edges.displayStart);
        }

        compiler.subCompile(this.edges.body);

        if (this.edges.parent) {
            compiler.write('await (await this.getParent(context)).display(context, this.merge(await this.getBlocks(), blocks), outputBuffer);\n');
        }

        if (this.edges.displayEnd) {
            compiler.subCompile(this.edges.displayEnd);
        }

        compiler
            .addSourceMapLeave()
            .outdent()
            .write("}\n\n")
        ;
    }

    protected compileIsTraitable(compiler: Compiler) {
        // A template can be used as a trait if:
        //   * it has no parent
        //   * it has no macros
        //   * it has no body
        //
        // Put another way, a template can be used as a trait if it only contains blocks and use statements.
        let traitable = !this.edges.parent && (this.edges.macros.edgesCount === 0);

        if (traitable) {
            let node = this.edges.body.edges.content;

            if (!node.edgesCount) {
                node = new Node({
                    0: node
                }, null, {line: 1, column: 1});
            }

            for (let [, subNode] of node) {
                if (!subNode.edgesCount) {
                    continue;
                }

                traitable = false;

                break;
            }
        }

        if (traitable) {
            return;
        }

        compiler
            .write("get isTraitable() {\n")
            .indent()
            .write('return false;\n')
            .outdent()
            .write("}\n\n")
        ;
    }

    protected compileClassfooter(compiler: Compiler) {
        if (this.edges.classEnd) {
            compiler.subCompile(this.edges.classEnd);
        }

        compiler
            .outdent()
            .write(`}\n`)
        ;
    }
}
