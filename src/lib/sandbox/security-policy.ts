import {SandboxSecurityPolicyInterface} from "./security-policy-interface";
import {NotAllowedFilterSandboxSecurityError} from "./security-not-allowed-filter-error";
import {NotAllowedTagSandboxSecurityError} from "./security-not-allowed-tag-error";
import {NotAllowedFunctionSandboxSecurityError} from "./security-not-allowed-function-error";
import {NotAllowedPropertySandboxSecurityError} from "./security-not-allowed-property-error";
import {NotAllowedMethodSandboxSecurityError} from "./security-not-allowed-method-error";
import {Template} from "../template";
import {Markup} from "../markup";

export class SandboxSecurityPolicy implements SandboxSecurityPolicyInterface {
    private allowedTags: Array<string>;
    private allowedFilters: Array<string>;
    private allowedMethods: Map<ObjectConstructor, Array<string>>;
    private allowedProperties: Map<ObjectConstructor, string>;
    private allowedFunctions: Array<string>;

    constructor(allowedTags: Array<string> = [], allowedFilters: Array<string> = [], allowedMethods: Map<any, string> = new Map(), allowedProperties: Map<any, string> = new Map(), allowedFunctions: Array<string> = []) {
        this.allowedTags = allowedTags;
        this.allowedFilters = allowedFilters;
        this.setAllowedMethods(allowedMethods);
        this.allowedProperties = allowedProperties;
        this.allowedFunctions = allowedFunctions;
    }

    setAllowedTags(tags: Array<string>) {
        this.allowedTags = tags;
    }

    setAllowedFilters(filters: Array<string>) {
        this.allowedFilters = filters;
    }

    setAllowedMethods(methods: Map<any, string | Array<string>>) {
        this.allowedMethods = new Map();
        for (let [class_, m] of methods) {
            this.allowedMethods.set(class_, (Array.isArray(m) ? m : [m]).map(function (item) {
                return item.toLowerCase();
            }));
        }
    }

    setAllowedProperties(properties: Map<any, string>) {
        this.allowedProperties = properties;
    }

    setAllowedFunctions(functions: Array<string>) {
        this.allowedFunctions = functions;
    }

    checkSecurity(tags: string[], filters: string[], functions: string[]): void {
        let self = this;

        for (let tag of tags) {
            if (!self.allowedTags.includes(tag)) {
                throw new NotAllowedTagSandboxSecurityError(`Tag "${tag}" is not allowed.`, tag, null);
            }
        }

        for (let filter of filters) {
            if (!self.allowedFilters.includes(filter)) {
                throw new NotAllowedFilterSandboxSecurityError(`Filter "${filter}" is not allowed.`, filter, null);
            }
        }

        for (let function_ of functions) {
            if (!self.allowedFunctions.includes(function_)) {
                throw new NotAllowedFunctionSandboxSecurityError(`Function "${function_}" is not allowed.`, function_, null);
            }
        }
    }

    checkMethodAllowed(obj: any, method: string): void {
        if (obj instanceof Template || obj instanceof Markup) {
            return;
        }

        let allowed = false;
        let candidate = method.toLowerCase();

        for (let [constructorName, methods] of this.allowedMethods) {
            if (obj instanceof constructorName) {
                allowed = methods.includes(candidate);

                break;
            }
        }

        if (!allowed) {
            throw new NotAllowedMethodSandboxSecurityError(`Calling "${method}" method on a "${obj.constructor.name}" is not allowed.`, null);
        }
    }

    checkPropertyAllowed(obj: any, property: string): void {
        let allowed = false;

        for (let [class_, properties] of this.allowedProperties) {
            if (obj instanceof class_) {
                allowed = (Array.isArray(properties) ? properties : [properties]).includes(property);

                break;
            }
        }

        if (!allowed) {
            throw new NotAllowedPropertySandboxSecurityError(`Calling "${property}" property on a "${obj.constructor.name}" is not allowed.`, null);
        }
    }
}
