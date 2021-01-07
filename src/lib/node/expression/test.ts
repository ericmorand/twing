import {TwingNodeExpressionCall} from "./call";
import {TwingEnvironment} from "../../environment";

import type {TwingCallableWrapper} from "../../callable-wrapper";
import type {TwingNodeExpressionCallAttributes, TwingNodeExpressionCallNodes} from "./call";

export class TwingNodeExpressionTest extends TwingNodeExpressionCall {
    constructor(attributes: TwingNodeExpressionCallAttributes, nodes: TwingNodeExpressionCallNodes, line: number, column: number) {
        attributes.type = 'test';

        super(attributes, nodes, line, column);
    }

    protected getCallableWrapper(environment: TwingEnvironment, name: string): TwingCallableWrapper<any> {
        return environment.getTest(name);
    }
}
