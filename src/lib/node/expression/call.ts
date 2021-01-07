import {TwingNodeExpression} from "../expression";
import {TwingNode} from "../../node";
import {TwingErrorSyntax} from "../../error/syntax";
import {TwingNodeExpressionConstant} from "./constant";
import {TwingNodeExpressionArray, TwingNodeExpressionArrayElement} from "./array";
import {TwingCompiler} from "../../compiler";
import {TwingCallableArgument, TwingCallableWrapper} from "../../callable-wrapper";
import {TwingEnvironment} from "../../environment";

import type {TwingNodeExpressionAttributes} from "../expression";

const array_merge = require('locutus/php/array/array_merge');
const snakeCase = require('snake-case');
const capitalize = require('capitalize');

export type TwingNodeExpressionCallAttributes = TwingNodeExpressionAttributes & {
    type: string,
    name: string,
    is_defined_test: boolean
};

export type TwingNodeExpressionCallNodes = {
    node?: TwingNode,
    arguments?: TwingNode
};

export abstract class TwingNodeExpressionCall<A extends TwingNodeExpressionCallAttributes = TwingNodeExpressionCallAttributes, N extends TwingNodeExpressionCallNodes = TwingNodeExpressionCallNodes> extends TwingNodeExpression<A, N> {
    // constructor(node: TwingNode, type: string, name: string, _arguments: TwingNode, line: number, column: number) {
    //     super({
    //         name,
    //         type: type,
    //         is_defined_test: false
    //     }, {
    //         node,
    //         arguments: _arguments
    //     }, line, column);
    // }

    protected abstract getCallableWrapper(environment: TwingEnvironment, name: string): TwingCallableWrapper<any>;

    public compile(compiler: TwingCompiler) {
        const callableWrapper = this.getCallableWrapper(compiler.getEnvironment(), this.getAttribute('name'));
        const callable = callableWrapper.callable;

        if (typeof callable === 'string') {
            compiler.raw(callable);
        } else {
            compiler.raw(`await this.environment.get${capitalize(this.getAttribute('type'))}('${this.getAttribute('name')}').traceableCallable(${this.getLine()}, this.source)`);
        }

        compiler.raw('(...[');

        this.compileArguments(compiler, callableWrapper);

        compiler.raw('])');
    }

    protected compileArguments(compiler: TwingCompiler, callableWrapper: TwingCallableWrapper<any>) {
        let first: boolean = true;

        if (callableWrapper.needsTemplate) {
            compiler.raw('this');

            first = false;
        }

        if (callableWrapper.needsContext) {
            if (!first) {
                compiler.raw(', ');
            }

            compiler.raw('context');

            first = false;
        }

        if (callableWrapper.needsOutputBuffer) {
            if (!first) {
                compiler.raw(', ');
            }

            compiler.raw('outputBuffer');

            first = false;
        }

        if (callableWrapper.arguments) {
            for (let argument_ of callableWrapper.arguments) {
                if (!first) {
                    compiler.raw(', ');
                }

                compiler.string(argument_);

                first = false;
            }
        }

        if (this.hasNode('node')) {
            if (!first) {
                compiler.raw(', ');
            }

            compiler.subcompile(this.getNode('node'));

            first = false;
        }

        if (this.hasNode('arguments')) {
            let arguments_ = this.getArguments(this.getNode('arguments'), callableWrapper);

            for (let node of arguments_) {
                if (!first) {
                    compiler.raw(', ');
                }

                compiler.subcompile(node);

                first = false;
            }
        }
    }

    protected getArguments(argumentsNode: TwingNode, callableWrapper: TwingCallableWrapper<any>): Array<TwingNode> {
        const {line, column} = this;

        let callType = this.attributes.type;
        let callName = this.attributes.name;

        let parameters: Map<string | number, TwingNode> = new Map();
        let named = false;

        for (let [name, node] of argumentsNode.getNodes()) {
            if (typeof name !== 'number') {
                named = true;
                name = this.normalizeName(name);
            } else if (named) {
                throw new TwingErrorSyntax(`Positional arguments cannot be used after named arguments for ${callType} "${callName}".`, line);
            }

            parameters.set(name, node);
        }

        let isVariadic = callableWrapper.isVariadic;

        if (!named && !isVariadic) {
            return [...parameters.values()];
        }

        let callableParameters: TwingCallableArgument[] = callableWrapper.acceptedArguments || [];

        let arguments_: Array<TwingNode> = [];

        let names: Array<string> = [];
        let optionalArguments: Array<string | TwingNodeExpressionConstant> = [];
        let pos = 0;

        for (let callableParameter of callableParameters) {
            let name = '' + this.normalizeName(callableParameter.name);

            names.push(name);

            if (parameters.has(name)) {
                if (parameters.has(pos)) {
                    throw new TwingErrorSyntax(`Argument "${name}" is defined twice for ${callType} "${callName}".`, line);
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
                optionalArguments.push(new TwingNodeExpressionConstant(callableParameter.defaultValue, line, column));
            } else {
                throw new TwingErrorSyntax(`Value for argument "${name}" is required for ${callType} "${callName}".`, line);
            }
        }

        if (isVariadic) {
            const elements: Array<TwingNodeExpressionArrayElement> = [];
            const resolvedKeys: Array<string | number> = [];

            for (let [key, value] of parameters) {
                // todo: ensure that the following lines are useless
                // if (Number.isInteger(key as number)) {
                //     arbitraryArguments.addElement(value);
                // } else {
                //     arbitraryArguments.addElement(value, new TwingNodeExpressionConstant(key, -1, -1));
                // }

                elements.push(value);

                resolvedKeys.push(key);
            }

            const arbitraryArguments = new TwingNodeExpressionArray({elements}, null, line, column);

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

            throw new TwingErrorSyntax(`Unknown argument${parameters.size > 1 ? 's' : ''} "${[...parameters.keys()].join('", "')}" for ${callType} "${callName}(${names.join(', ')})".`, unknownParameter ? unknownParameter.getLine() : this.getLine());
        }

        return arguments_;
    }

    protected normalizeName(name: string) {
        return snakeCase(name).toLowerCase();
    }
}
