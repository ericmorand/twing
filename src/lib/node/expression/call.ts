import {ExpressionNode} from "../expression";
import {Node, toNodeEdges} from "../../node";
import {SyntaxError} from "../../error/syntax";
import {ConstantExpressionNode} from "./constant";
import {ArrayExpressionNode} from "./array";
import {Compiler} from "../../compiler";
import {CallableWrapper} from "../../callable-wrapper";
import {Environment} from "../../environment";
import {HashExpressionNode} from "./hash";

import type {ExpressionNodeAttributes} from "../expression";
import type {HashExpressionNodeEdge} from "./hash";
import {ArgumentsExpressionNode} from "./arguments";

const array_merge = require('locutus/php/array/array_merge');
const snakeCase = require('snake-case');
const capitalize = require('capitalize');

export type CallExpressionNodeAttributes = ExpressionNodeAttributes<{
    type: string,
    name: string
}>;

export type CallExpressionNodeEdges = {
    node?: Node,
    arguments?: ArgumentsExpressionNode
};

export abstract class CallExpressionNode extends ExpressionNode<CallExpressionNodeAttributes, CallExpressionNodeEdges> {
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

    protected abstract getCallableWrapper(environment: Environment, name: string): CallableWrapper<any, any>;

    public compile(compiler: Compiler) {
        const callableWrapper = this.getCallableWrapper(compiler.getEnvironment(), this.attributes.name);
        const callable = callableWrapper.callable;

        if (typeof callable === 'string') {
            compiler.raw(callable);
        } else {
            compiler
                .raw(`await this.environment.get${capitalize(this.attributes.type)}('${this.attributes.name}').traceableCallable(`)
                .repr(this.location)
                .raw(', this.source)');
        }

        compiler.raw('(...[');

        this.compileArguments(compiler, callableWrapper);

        compiler.raw('])');
    }

    protected compileArguments(compiler: Compiler, callableWrapper: CallableWrapper<any, any>) {
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

        if (this.edges.node) {
            if (!first) {
                compiler.raw(', ');
            }

            compiler.subCompile(this.edges.node);

            first = false;
        }

        if (this.edges.arguments) {
            if (!first) {
                compiler.raw(', ');
            }

            //let arguments_ = this.getArguments(this.edges.arguments, callableWrapper);

            console.log(this.edges.arguments.toString());

            compiler.subCompile(this.edges.arguments);


            // for (let node of arguments_) {
            //     if (!first) {
            //         compiler.raw(', ');
            //     }
            //
            //     compiler.subCompile(node.edges.value);
            //
            //     first = false;
            // }
        }
    }

    // todo: this should be done at the parser level: checking the nnumber of argument,s reordering them based on name for named arguments, checking that named arguments precede positioned one...
    protected getArguments(argumentsNode: HashExpressionNode, callableWrapper: CallableWrapper<any, any>): Array<Node<null, {
        key: Node,
        value: Node
    }>> {
        let callType = this.attributes.type;
        let callName = this.attributes.name;

        let parameters: Map<string, Node> = new Map();
        let named = false;

        // todo: should be at the parser level

        for (let [key, node] of argumentsNode) {
            //let key = node.edges.key.attributes.value;

            if (typeof key !== 'number') {
                named = true;
                key = this.normalizeName(key);
            } else if (named) {
                // todo: should be at the parser level
                throw new SyntaxError(`Positional arguments cannot be used after named arguments for ${callType} "${callName}".`, null, this.location);
            }

            parameters.set(`${key}`, node);
        }

        let isVariadic = callableWrapper.isVariadic;

        if (!named && !isVariadic) {
            return [...parameters.values()];
        }

        let callableParameters = callableWrapper.acceptedArguments || [];

        let arguments_: Array<Node> = [];

        let names: Array<string> = [];
        let optionalArguments: Array<string | ConstantExpressionNode> = [];
        let pos = 0;

        for (let callableParameter of callableParameters) {
            let name = this.normalizeName(callableParameter.name);

            names.push(name);

            if (parameters.has(name)) {
                if (parameters.has(`${pos}`)) {
                    throw new SyntaxError(`Argument "${name}" is defined twice for ${callType} "${callName}".`, null, this.location);
                }

                arguments_ = array_merge(arguments_, optionalArguments);
                arguments_.push(parameters.get(name));
                parameters.delete(name);
                optionalArguments = [];
            } else if (parameters.has(`${pos}`)) {
                arguments_ = array_merge(arguments_, optionalArguments);
                arguments_.push(parameters.get(`${pos}`));
                parameters.delete(`${pos}`);
                optionalArguments = [];
                pos++;
            } else if (callableParameter.defaultValue !== undefined) {
                optionalArguments.push(new ConstantExpressionNode({value: callableParameter.defaultValue}, null, this.location));
            } else {
                throw new SyntaxError(`Value for argument "${name}" is required for ${callType} "${callName}".`, null, this.location);
            }
        }

        if (isVariadic) {
            const elements: Map<string, HashExpressionNodeEdge> = new Map();
            const resolvedKeys: Array<string> = [];

            for (let [key, value] of parameters) {
                // todo: ensure that the following lines are useless
                // if (Number.isInteger(key as number)) {
                //     arbitraryArguments.addElement(value);
                // } else {
                //     arbitraryArguments.addElement(value, new TwingNodeExpressionConstant(key, -1, -1));
                // }

                elements.set(key, new Node(null, {
                    key: new ConstantExpressionNode({value: key}, null, value.location),
                    value
                }, value.location));

                resolvedKeys.push(key);
            }

            const arbitraryArguments = new ArrayExpressionNode({}, toNodeEdges(elements), this.location);

            for (let key of resolvedKeys) {
                parameters.delete(key);
            }

            if (arbitraryArguments.edgesCount) {
                arguments_ = array_merge(arguments_, optionalArguments);
                arguments_.push(arbitraryArguments);
            }
        }

        if (parameters.size > 0) {
            let unknownParameter = [...parameters.values()].find((parameter) => {
                // todo: what other type of data can parameter be?
                return parameter instanceof Node;
            });

            throw new SyntaxError(`Unknown argument${parameters.size > 1 ? 's' : ''} "${[...parameters.keys()].join('", "')}" for ${callType} "${callName}(${names.join(', ')})".`, null, unknownParameter ? unknownParameter.location : this.location);
        }

        return arguments_;
    }

    protected normalizeName(name: string): string {
        return snakeCase(name).toLowerCase();
    }
}
