import {CallExpressionNode} from "./call";
import {Environment} from "../../environment";

import type {Location} from "../../node";
import type {CallableWrapper} from "../../callable-wrapper";
import type {CallExpressionNodeEdges} from "./call";

export type FilterExpressionNodeAttributes = {
    name: string
}

export class FilterExpressionNode extends CallExpressionNode {
    constructor(attributes: FilterExpressionNodeAttributes, edges: CallExpressionNodeEdges, location: Location) {
        super({
            type: 'filter',
            name: attributes.name
        }, edges, location);
    }

    protected getCallableWrapper(environment: Environment, name: string): CallableWrapper<any> {
        return environment.getFilter(name);
    }
}
