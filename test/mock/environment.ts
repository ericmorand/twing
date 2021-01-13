import {Source} from "../../src/lib/source";
import {NodeEnvironment} from "../../src/lib/environment/node";
import {LoaderInterface} from "../../src/lib/loader-interface";
import {EnvironmentOptions} from "../../src/lib/environment-options";
import {NullLoader} from "../../src/lib/loader/null";

export class MockEnvironment extends NodeEnvironment {
    constructor(loader?: LoaderInterface, options: EnvironmentOptions = null) {
        super(loader || new NullLoader(), options);
    }

    getTemplateHash(name: string, index: number = 0, from: Source = null) {
        return Promise.resolve(`__TwingTemplate_foo${(index === 0 ? '' : '_' + index)}`);
    }
}
