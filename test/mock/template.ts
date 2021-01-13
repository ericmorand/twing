import {Environment} from "../../src/lib/environment";
import {MockEnvironment} from "./environment";
import {Template} from "../../src/lib/template";
import {MockLoader} from "./loader";
import {OutputBuffer} from "../../src/lib/output-buffer";
import {Source} from "../../src/lib/source";

export class MockTemplate extends Template {
    protected _mySource: Source;

    constructor(env?: Environment, source?: Source) {
        if (!env) {
            env = new MockEnvironment(new MockLoader());
        }

        super(env);

        if (!source) {
            source = new Source('', 'foo.html.twig');
        }

        this._mySource = source;
    }

    get source() {
        return this._mySource;
    }

    doDisplay(context: {}, outputBuffer: OutputBuffer, blocks: Map<string, Array<any>>): Promise<void> {
        return Promise.resolve();
    }
}
