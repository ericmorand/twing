import {Error} from "../error";

export class RuntimeError extends Error {
    get name(): string {
        return 'TwingErrorRuntime';
    }
}
