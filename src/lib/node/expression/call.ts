import {TwingNodeExpression} from "../expression";
import {TwingNode} from "../../node";
import {TwingErrorSyntax} from "../../error/syntax";
import {TwingNodeExpressionConstant} from "./constant";
import {TwingNodeExpressionHash, Nodes as HashNodes} from "./hash";
import {TwingCompiler} from "../../compiler";
import {TwingCallable, TwingCallableArgument, TwingCallableWrapper} from "../../callable-wrapper";
import {TwingNodeType} from "../../node-type";

const array_merge = require('locutus/php/array/array_merge');
const snakeCase = require('snake-case');
const capitalize = require('capitalize');

export const type = new TwingNodeType('expression_call');

export type Nodes = Partial<{
    arguments: TwingNode,
    node?: TwingNode
}>;

export type Attributes = Partial<{
    accepted_arguments: Array<TwingCallableArgument>,
    arguments: Array<string>,
    callable: TwingCallable<any>,
    is_defined_test: boolean,
    is_variadic: boolean,
    name: string,
    needs_context: boolean,
    needs_output_buffer: boolean,
    needs_template: boolean,
    type: string
}>;

export abstract class TwingNodeExpressionCall<N extends Nodes = Nodes> extends TwingNodeExpression<N, Attributes> {
    constructor(nodes: N, type: string, name: string, lineno: number, columnno: number) {
        super(nodes, {type: type, name: name}, lineno, columnno);
    }

    get type() {
        return type;
    }

    protected abstract getCallableWrapper(name: string, compiler: TwingCompiler): TwingCallableWrapper<any>;

    compile(compiler: TwingCompiler): void {
        let callableWrapper = this.getCallableWrapper(this.getAttribute('name'), compiler);
        let callable = callableWrapper.getCallable();

        this.setAttribute('needs_template', callableWrapper.needsTemplate());
        this.setAttribute('needs_context', callableWrapper.needsContext());
        this.setAttribute('needs_output_buffer', callableWrapper.needsOutputBuffer());
        this.setAttribute('arguments', callableWrapper.getArguments());
        this.setAttribute('callable', callable);
        this.setAttribute('is_variadic', callableWrapper.isVariadic());
        this.setAttribute('accepted_arguments', callableWrapper.getAcceptedArgments());

        this.compileCallable(compiler);
    }

    protected compileCallable(compiler: TwingCompiler) {
        let callable = this.getAttribute('callable');

        if (typeof callable === 'string') {
            compiler.raw(callable);
        } else {
            compiler.raw(`await this.environment.get${capitalize(this.getAttribute('type'))}('${this.getAttribute('name')}').traceableCallable(${this.getTemplateLine()}, this.source)`);
        }

        compiler.raw('(...[');

        this.compileArguments(compiler);

        compiler.raw('])');
    }

    protected compileArguments(compiler: TwingCompiler) {
        let first: boolean = true;

        if (this.hasAttribute('needs_template') && this.getAttribute('needs_template')) {
            compiler.raw('this');

            first = false;
        }

        if (this.hasAttribute('needs_context') && this.getAttribute('needs_context')) {
            if (!first) {
                compiler.raw(', ');
            }

            compiler.raw('context');

            first = false;
        }

        if (this.hasAttribute('needs_output_buffer') && this.getAttribute('needs_output_buffer')) {
            if (!first) {
                compiler.raw(', ');
            }

            compiler.raw('outputBuffer');

            first = false;
        }

        if (this.hasAttribute('arguments')) {
            for (let argument_ of this.getAttribute('arguments')) {
                if (!first) {
                    compiler.raw(', ');
                }

                compiler.string(argument_);

                first = false;
            }
        }

        if (this.hasChild('node')) {
            if (!first) {
                compiler.raw(', ');
            }

            compiler.subcompile(this.getChild('node'));

            first = false;
        }

        if (this.hasChild('arguments')) {
            let callable = this.getAttribute('callable');
            let arguments_ = this.getArguments(callable, this.getChild('arguments'));

            for (let node of arguments_) {
                if (!first) {
                    compiler.raw(', ');
                }

                compiler.subcompile(node);

                first = false;
            }
        }
    }

    protected getArguments(callable: Function, argumentsNode: TwingNode): Array<TwingNode> {
        let callType = this.getAttribute('type');
        let callName = this.getAttribute('name');

        let namedParameters: Map<string, TwingNode> = new Map();
        let parameters: Map<number, TwingNode> = new Map();
        let named = false;

        for (let [name, node] of argumentsNode.children) {
            // if (!isNumber(name)) {
            //     named = true;
                name = this.normalizeName(name);
            // } else if (named) {
            //     // todo: should be at parser level!!!
            //     throw new TwingErrorSyntax(`Positional arguments cannot be used after named arguments for ${callType} "${callName}".`, this.getTemplateLine());
            // }

            parameters.set(name, node);
        }

        let isVariadic = this.hasAttribute('is_variadic') && this.getAttribute('is_variadic');

        if (!named && !isVariadic) {
            return [...parameters.values()];
        }

        let message: string;

        if (!callable) {
            if (named) {
                message = `Named arguments are not supported for ${callType} "${callName}".`;
            } else {
                message = `Arbitrary positional arguments are not supported for ${callType} "${callName}".`;
            }

            throw new Error(message);
        }

        let callableParameters = this.hasAttribute('accepted_arguments') ? this.getAttribute('accepted_arguments') : [];

        let arguments_: Array<TwingNode> = [];

        let names: Array<string> = [];
        let optionalArguments: Array<string | TwingNodeExpressionConstant> = [];
        let pos = 0;

        for (let callableParameter of callableParameters) {
            let name = this.normalizeName(callableParameter.name);

            names.push(name);

            if (parameters.has(name)) {
                if (parameters.has(pos)) {
                    throw new TwingErrorSyntax(`Argument "${name}" is defined twice for ${callType} "${callName}".`, this.getTemplateLine());
                }

                arguments_ = array_merge(arguments_, optionalArguments);
                arguments_.push(parameters.get(name));
                parameters.delete(name);
                optionalArguments = [];
            } else if (parameters.has(pos)) {
                arguments_ = array_merge(arguments_, optionalArguments);
                arguments_.push(parameters.get(pos));
                parameters.delete(pos);
                optionalArguments = [];
                ++pos;
            } else if (callableParameter.defaultValue !== undefined) {
                optionalArguments.push(new TwingNodeExpressionConstant(callableParameter.defaultValue, -1, -1));
            } else {
                throw new TwingErrorSyntax(`Value for argument "${name}" is required for ${callType} "${callName}".`, this.getTemplateLine());
            }
        }

        if (isVariadic) {
            let elements: HashNodes = {};
            let resolvedKeys: Array<any> = [];

            for (let [key, value] of parameters) {
                elements[key] = value;

                resolvedKeys.push(key);
            }

            let arbitraryArguments = new TwingNodeExpressionHash(elements, -1, -1);

            for (let key of resolvedKeys) {
                parameters.delete(key);
            }

            if (arbitraryArguments.count()) {
                arguments_ = array_merge(arguments_, optionalArguments);
                arguments_.push(arbitraryArguments);
            }
        }

        if (parameters.size > 0) {
            let unknownParameter = [...parameters.values()].find(function (parameter) {
                // todo: what other type of data can parameter be?
                return parameter instanceof TwingNode;
            });

            throw new TwingErrorSyntax(`Unknown argument${parameters.size > 1 ? 's' : ''} "${[...parameters.keys()].join('", "')}" for ${callType} "${callName}(${names.join(', ')})".`, unknownParameter ? unknownParameter.getTemplateLine() : this.getTemplateLine());
        }

        return arguments_;
    }

    protected normalizeName(name: string) {
        return snakeCase(name).toLowerCase();
    }
}
