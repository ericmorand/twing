import {AnonymousNodes, TwingNode} from "../node";
import {TwingSource} from "../source";
import {TwingCompiler} from "../compiler";
import {type as constantType} from "./expression/constant";
import {TwingNodeBody, type as bodyType} from "./body";
import {TwingNodeType} from "../node-type";
import {TwingNodeTrait} from "./trait";

export const type = new TwingNodeType('module');

/**
 * Represents a module node that compiles into a JavaScript module.
 */
export class TwingNodeModule extends TwingNode<{
    body: TwingNodeBody,
    blocks: TwingNode,
    macros: TwingNode,
    traits: TwingNode<AnonymousNodes<TwingNodeTrait>>,
    display_start: TwingNode,
    display_end: TwingNode,
    constructor_start: TwingNode,
    constructor_end: TwingNode,
    class_end: TwingNode,
    parent?: TwingNode
}, {
    index: number,
    embedded_templates: Array<any>
}> {
    public source: TwingSource;

    constructor(body: TwingNodeBody, parent: TwingNode, blocks: TwingNode, macros: TwingNode, traits: TwingNode<AnonymousNodes<TwingNodeTrait>>, embeddedTemplates: Array<{}>, source: TwingSource) {
        super({
            body,
            blocks,
            macros,
            traits,
            display_start: new TwingNode({}, {}),
            display_end: new TwingNode({}, {}),
            constructor_start: new TwingNode({}, {}),
            constructor_end: new TwingNode({}, {}),
            class_end: new TwingNode({}, {}),
            parent
        }, {
            index: 0,
            embedded_templates: embeddedTemplates // embedded templates are set as attributes so that they are only visited once by the visitors
        }, 1, 1);

        this.source = source;

        // populate the template name of all node children
        this.setTemplateName(this.source.getName());
    }

    get type() {
        return type;
    }

    setIndex(index: number) {
        this.setAttribute('index', index);
    }

    compile(compiler: TwingCompiler) {
        let index: number = this.getAttribute('index');

        if (index === 0) {
            compiler
                .write('module.exports = (TwingTemplate) => {\n')
                .indent()
                .write('return new Map([\n')
                .indent()
            ;
        }

        this.compileTemplate(compiler);

        for (let template of this.getAttribute('embedded_templates')) {
            compiler.subcompile(template);
        }

        if (index === 0) {
            compiler
                .outdent()
                .write(']);\n')
                .outdent()
                .write('};')
            ;
        }
    }

    protected compileTemplate(compiler: TwingCompiler) {
        this.compileClassHeader(compiler);
        this.compileConstructor(compiler);
        this.compileDoGetParent(compiler);
        this.compileDoGetTraits(compiler);
        this.compileDoDisplay(compiler);
        this.compileIsTraitable(compiler);
        this.compileClassfooter(compiler);
    }

    protected compileClassHeader(compiler: TwingCompiler) {
        let index: number = this.getAttribute('index');

        compiler
            .write(`[${index}, class extends TwingTemplate {\n`)
            .indent();
    }

    protected compileConstructor(compiler: TwingCompiler) {
        compiler
            .write('constructor(environment) {\n')
            .indent()
            .subcompile(this.getNode('constructor_start'))
            .write('super(environment);\n\n')
            .write('this._source = new this.Source(')
            .string(compiler.getEnvironment().isDebug() || compiler.getEnvironment().isSourceMap() ? this.source.getCode() : '')
            .raw(', ')
            .string(this.source.getResolvedName())
            .raw(");\n\n")
            .write('let aliases = new this.Context();\n')
        ;

        // block handlers
        let count: number = this.getNode('blocks').getNodes().size;

        if (count > 0) {
            compiler
                .write('\n')
                .write('this.blockHandlers = new Map([\n')
                .indent();

            for (let [name, node] of this.getNode('blocks').getNodes()) {
                count--;

                compiler.write(`['${name}', `)
                    .subcompile(node)
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
        count = this.getNode('macros').getNodes().size;

        if (count > 0) {
            compiler
                .write('\n')
                .write('this.macroHandlers = new Map([\n')
                .indent();

            for (let [name, node] of this.getNode('macros').getNodes()) {
                count--;

                compiler.write(`['${name}', `)
                    .subcompile(node)
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

        compiler
            .subcompile(this.getNode('constructor_end'))
            .outdent()
            .write('}\n\n');
    }

    protected compileDoGetTraits(compiler: TwingCompiler) {
        let count = this.getNode('traits').getNodes().size;

        if (count > 0) {
            compiler
                .write("async doGetTraits() {\n")
                .indent()
                .write('let traits = new Map();\n\n');

            for (let [i, trait] of this.getNode('traits').getNodes()) {
                let node = trait.getNode('template');

                compiler
                    .write(`let trait_${i} = await this.loadTemplate(`)
                    .subcompile(node)
                    .raw(', ')
                    .repr(node.getTemplateLine())
                    .raw(");\n\n")
                ;

                compiler
                    .write(`if (!trait_${i}.isTraitable) {\n`)
                    .indent()
                    .write('throw new this.RuntimeError(\'Template ')
                    .subcompile(trait.getNode('template'))
                    .raw(' cannot be used as a trait.\', ')
                    .repr(node.getTemplateLine())
                    .raw(", this.source);\n")
                    .outdent()
                    .write('}\n\n')
                    .write(`let traits_${i} = this.cloneMap(await trait_${i}.getBlocks());\n\n`)
                ;

                for (let [key, value] of trait.getNode('targets').getNodes()) {
                    compiler
                        .write(`if (!traits_${i}.has(`)
                        .string(key as string)
                        .raw(")) {\n")
                        .indent()
                        .write('throw new this.RuntimeError(\'Block ')
                        .string(key as string)
                        .raw(' is not defined in trait ')
                        .subcompile(trait.getNode('template'))
                        .raw('.\', ')
                        .repr(value.getTemplateLine())
                        .raw(', this.source);\n')
                        .outdent()
                        .write('}\n\n')
                        .write(`traits_${i}.set(`)
                        .subcompile(value)
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

    protected compileDoGetParent(compiler: TwingCompiler) {
        if (this.hasNode('parent')) {
            let parent = this.getNode('parent');

            compiler
                .write("doGetParent(context) {\n")
                .indent()
                .write('return this.loadTemplate(')
                .subcompile(parent)
                .raw(', ')
                .repr(parent.getTemplateLine())
                .raw(")")
            ;

            // if the parent name is not dynamic, then we can cache the parent as it will never change
            if (parent.is(constantType)) {
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

    protected compileDoDisplay(compiler: TwingCompiler) {
        compiler
            .write("async doDisplay(context, outputBuffer, blocks = new Map()) {\n")
            .indent()
            .write('let aliases = this.aliases.clone();\n\n')
            .addSourceMapEnter(this)
            .subcompile(this.getNode('display_start'))
            .subcompile(this.getNode('body'))
        ;

        if (this.hasNode('parent')) {
            compiler.write('await (await this.getParent(context)).display(context, this.merge(await this.getBlocks(), blocks), outputBuffer);\n');
        }

        compiler
            .subcompile(this.getNode('display_end'))
            .addSourceMapLeave()
            .outdent()
            .write("}\n\n")
        ;
    }

    protected compileIsTraitable(compiler: TwingCompiler) {
        // A template can be used as a trait if:
        //   * it has no parent
        //   * it has no macros
        //   * it has no body
        //
        // Put another way, a template can be used as a trait if it only contains blocks and use statements.
        let traitable = !this.hasNode('parent') && (this.getNode('macros').getNodes().size === 0);

        if (traitable) {
            let node = this.getNode('body').getNode('node');

            if (!node.getNodes().size) {
                node = new TwingNode({
                    0: node
                }, null, 1, 1);
            }

            for (let subNode of node.getNodes().values()) {
                if (!subNode.getNodes().size) {
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

    protected compileClassfooter(compiler: TwingCompiler) {
        compiler
            .subcompile(this.getNode('class_end'))
            .outdent()
            .write(`}],\n`)
        ;
    }
}
