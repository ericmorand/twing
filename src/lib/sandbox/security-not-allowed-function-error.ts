import {SandboxSecurityError} from "./security-error";
import {Source} from "../source";

import type {Location} from "../node";

export class NotAllowedFunctionSandboxSecurityError extends SandboxSecurityError {
    private readonly _functionName: string;

    constructor(message: string, functionName: string, location: Location, source: Source = null) {
        super(message, location, source);

        this._functionName = functionName;
    }

    get name(): string {
        return 'TwingSandboxSecurityNotAllowedFunctionError';
    }

    get functionName() {
        return this._functionName;
    }
}
