import {CallExpressionNode} from "./call";
import {Environment} from "../../environment";

import type {Location} from "../../node";
import type {CallableWrapper} from "../../callable-wrapper";
import type {CallExpressionNodeEdges} from "./call";

export type FunctionExpressionNodeAttributes = {
    name: string
};

export class FunctionExpressionNode extends CallExpressionNode {
    constructor(attributes: FunctionExpressionNodeAttributes, edges: CallExpressionNodeEdges, location: Location) {
        super({
            type: 'function',
            name: attributes.name
        }, edges, location);
    }

    protected getCallableWrapper(environment: Environment, name: string): CallableWrapper<any> {
        return environment.getFunction(name);
    }
}
