import {Environment} from "../../src/lib/environment";
import {Compiler} from "../../src/lib/compiler";
import {MockLoader} from "./loader";
import {MockEnvironment} from "./environment";

export class MockCompiler extends Compiler {
    constructor(env: Environment = null) {
        let loader = new MockLoader();

        super(env ? env : new MockEnvironment(loader));
    }
}
