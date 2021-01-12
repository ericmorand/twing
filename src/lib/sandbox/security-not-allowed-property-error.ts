import {SandboxSecurityError} from "./security-error";
import {Source} from "../source";

import type {Location} from "../node";

/**
 * Exception thrown when a not allowed class property is used in a template.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class NotAllowedPropertySandboxSecurityError extends SandboxSecurityError {
    constructor(message: string, location: Location, source: Source = null) {
        super(message, location, source);
    }

    get name(): string {
        return 'TwingSandboxSecurityNotAllowedPropertyError';
    }
}
