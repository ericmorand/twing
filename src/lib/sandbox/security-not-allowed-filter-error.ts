import {SandboxSecurityError} from "./security-error";
import {Source} from "../source";

import type {Location} from "../node";

/**
 * Exception thrown when a not allowed filter is used in a template.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class NotAllowedFilterSandboxSecurityError extends SandboxSecurityError {
    private readonly _filterName: string;

    constructor(message: string, filterName: string, location: Location, source: Source = null) {
        super(message, location, source);

        this._filterName = filterName;
    }

    get name(): string {
        return 'TwingSandboxSecurityNotAllowedFilterError';
    }

    get filterName() {
        return this._filterName;
    }
}
