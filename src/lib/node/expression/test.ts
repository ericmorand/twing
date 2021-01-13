import {CallExpressionNode} from "./call";
import {Environment} from "../../environment";

import type {CallableWrapper} from "../../callable-wrapper";
import type {CallExpressionNodeEdges} from "./call";
import type {Location} from "../../node";

export type TestExpressionNodeAttributes = {
    name: string
};

export class TestExpressionNode extends CallExpressionNode {
    constructor(attributes: TestExpressionNodeAttributes, edges: CallExpressionNodeEdges, location: Location) {
        super({
            name: attributes.name,
            type: 'test'
        }, edges, location);
    }

    protected getCallableWrapper(environment: Environment, name: string): CallableWrapper<any> {
        return environment.getTest(name);
    }
}
