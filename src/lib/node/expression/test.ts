import {CallExpressionNode} from "./call";
import {TwingEnvironment} from "../../environment";

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

    protected getCallableWrapper(environment: TwingEnvironment, name: string): CallableWrapper<any> {
        return environment.getTest(name);
    }
}
