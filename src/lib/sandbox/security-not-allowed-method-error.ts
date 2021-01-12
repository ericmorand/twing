import {SandboxSecurityError} from "./security-error";
import {Source} from "../source";

import type {Location} from "../node";

export class NotAllowedMethodSandboxSecurityError extends SandboxSecurityError {
    constructor(message: string, location: Location, source: Source = null) {
        super(message, location, source);
    }

    get name(): string {
        return 'TwingSandboxSecurityNotAllowedMethodError';
    }
}
