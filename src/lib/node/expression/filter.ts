import {CallExpressionNode} from "./call";
import {Environment} from "../../environment";

import type {Location} from "../../node";
import type {CallExpressionNodeEdges} from "./call";
import type {Filter} from "../../filter";

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

    protected getCallableWrapper(environment: Environment, name: string): Filter {
        return environment.getFilter(name);
    }
}
