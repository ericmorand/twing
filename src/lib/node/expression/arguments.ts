import {Node} from "../../node";

import type {NodeEdges} from "../../node";
import type {Compiler} from "../../compiler";
import type {ArgumentExpressionNode} from "./argument";

export type ArgumentsExpressionNodeEdges = NodeEdges<ArgumentExpressionNode>;

export class ArgumentsExpressionNode extends Node<any, ArgumentsExpressionNodeEdges> {
    compile(compiler: Compiler) {
        let first: boolean = true;

        for (const [, argument] of this) {
            if (!first) {
                compiler.raw(', ');
            }

            compiler.subCompile(argument);

            first = false;
        }
    }
}
