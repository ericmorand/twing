import {SandboxSecurityError} from "./security-error";
import {Source} from "../source";

import type {Location} from "../node";

export class NotAllowedTagSandboxSecurityError extends SandboxSecurityError {
    private readonly _tagName: string;

    constructor(message: string, tagName: string, location: Location, source: Source = null) {
        super(message, location, source);

        this._tagName = tagName;
    }

    get name(): string {
        return 'TwingSandboxSecurityNotAllowedTagError';
    }

    get tagName() {
        return this._tagName;
    }
}
