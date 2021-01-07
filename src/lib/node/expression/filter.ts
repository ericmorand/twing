import {TwingNodeExpressionCall} from "./call";
import {TwingEnvironment} from "../../environment";

import type {TwingCallableWrapper} from "../../callable-wrapper";
import type {TwingNodeExpressionCallAttributes, TwingNodeExpressionCallNodes} from "./call";

export class TwingNodeExpressionFilter extends TwingNodeExpressionCall {
    constructor(attributes: TwingNodeExpressionCallAttributes, nodes: TwingNodeExpressionCallNodes, line: number, column: number) {
        attributes.type = 'filter';

        super(attributes, nodes, line, column);
    }

    protected getCallableWrapper(environment: TwingEnvironment, name: string): TwingCallableWrapper<any> {
        return environment.getFilter(name);
    }
}
