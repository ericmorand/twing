import {Node} from "../../node";

import type {Compiler} from "../../compiler";

export type ArgumentsExpressionNodeAttributes = {
    name?: string
};

export type ArgumentsExpressionNodeEdges = {
    value: Node
};

export class ArgumentExpressionNode extends Node<ArgumentsExpressionNodeAttributes, ArgumentsExpressionNodeEdges> {
    compile(compiler: Compiler) {
        super.compile(compiler);
    }
}
