import {CallExpressionNode} from "./call";
import {Environment} from "../../environment";

import type {CallExpressionNodeEdges} from "./call";
import type {Location} from "../../node";
import type {Test} from "../../test";

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

    protected getCallableWrapper(environment: Environment, name: string): Test {
        return environment.getTest(name);
    }
}
