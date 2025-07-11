/**
 * @fileoverview バリデーション機能モジュール
 * @description 全ツール共通のバリデーション機能を提供
 * @since 1.0.0
 */

import { z } from "zod";
import { ErrorManager, DetailedError } from "../error/index.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * Validation result type definition
 * @description Type representing the result of validation processing (defined directly to avoid circular references)
 *
 * @template T - Type of data to be validated
 *
 * @example
 * ```typescript
 * // Success example
 * const successResult: ValidationResult<User> = {
 *   success: true,
 *   data: { id: 1, name: "John" }
 * };
 *
 * // Failure example
 * const errorResult: ValidationResult<User> = {
 *   success: false,
 *   error: "name: Required field is missing"
 * };
 * ```
 */
export type ValidationResult<T> =
    | {
          success: true;
          data: T;
      }
    | {
          success: false;
          error: string;
      };

/**
 * Generic validation function
 * @description Common validation processing used by all tools
 *
 * @template T - Type of data to be validated
 * @param {z.ZodSchema<T>} schema - Zod validation schema
 * @param {unknown} args - Data to be validated
 * @returns {ValidationResult<T>} Validation result
 *
 * @example
 * ```typescript
 * import { z } from "zod";
 *
 * const userSchema = z.object({
 *   name: z.string().min(1, "Name is required"),
 *   age: z.number().min(0, "Age must be 0 or greater")
 * });
 *
 * const result = validateArgs(userSchema, { name: "John", age: 25 });
 *
 * if (result.success) {
 *   console.log("Validation successful:", result.data);
 * } else {
 *   console.error("Validation error:", result.error);
 * }
 * ```
 *
 * @throws {Error} When an error other than Zod schema occurs
 * @since 1.0.0
 */
export function validateArgs<T>(
    schema: z.ZodSchema<T>,
    args: unknown
): ValidationResult<T> {
    try {
        const data = schema.parse(args);
        return { success: true, data };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: formatZodErrors(error.errors),
            };
        }
        return {
            success: false,
            error:
                error instanceof Error ? error.message : "Validation error",
        };
    }
}

/**
 * Enhanced validation function
 * @description Validation processing that provides detailed error messages and solutions
 *
 * @template T - Type of data to be validated
 * @param {z.ZodSchema<T>} schema - Zod validation schema
 * @param {unknown} args - Data to be validated
 * @param {string} [context] - Validation context (tool name, etc.)
 * @returns {T | CallToolResult} Data on validation success, CallToolResult on failure
 */
export function validateArgsWithDetails<T>(
    schema: z.ZodSchema<T>,
    args: unknown,
    context?: string
): T | CallToolResult {
    try {
        console.log(`🔍 Validation started${context ? ` [${context}]` : ""}`);
        console.log(`📋 Input data: ${JSON.stringify(args, null, 2)}`);

        const data = schema.parse(args);

        console.log(`✅ Validation successful${context ? ` [${context}]` : ""}`);
        return data;
    } catch (error) {
        if (error instanceof z.ZodError) {
            const detailedError = ErrorManager.createValidationError(
                "SCHEMA_VALIDATION",
                formatZodErrors(error.errors),
                {
                    originalError: error,
                    technicalDetails: `Validation target: ${JSON.stringify(
                        args,
                        null,
                        2
                    )}\nSchema errors: ${error.errors.length}`,
                    context: {
                        inputData: args,
                        errorCount: error.errors.length,
                        validationContext: context,
                        operation: "validateArgsWithDetails",
                    },
                }
            );

            ErrorManager.logError(detailedError, context || "Validation");
            return ErrorManager.toCallToolResult(detailedError);
        }

        const detailedError = ErrorManager.createInternalError(
            "VALIDATION_FAILURE",
            "An unexpected error occurred during validation processing",
            {
                originalError:
                    error instanceof Error ? error : new Error(String(error)),
                technicalDetails: `Input data: ${JSON.stringify(
                    args,
                    null,
                    2
                )}\nError: ${
                    error instanceof Error ? error.message : String(error)
                }`,
                context: {
                    inputData: args,
                    validationContext: context,
                    operation: "validateArgsWithDetails",
                },
            }
        );

        ErrorManager.logError(detailedError, context || "Validation");
        return ErrorManager.toCallToolResult(detailedError);
    }
}

/**
 * Format Zod errors into clear English messages
 */
function formatZodErrors(errors: z.ZodIssue[]): string {
    const messages = errors.map((error) => {
        const path = error.path.length > 0 ? `'${error.path.join(".")}' ` : "";

        switch (error.code) {
            case z.ZodIssueCode.invalid_type:
                return `${path}has incorrect type. Expected: ${error.expected}, received: ${error.received}`;

            case z.ZodIssueCode.invalid_string:
                if (error.validation === "email") {
                    return `${path}must be a valid email address format`;
                }
                if (error.validation === "url") {
                    return `${path}must be a valid URL format`;
                }
                return `${path}has incorrect string format`;

            case z.ZodIssueCode.too_small:
                if (error.type === "string") {
                    return `${path}must be at least ${error.minimum} characters`;
                }
                if (error.type === "number") {
                    return `${path}must be at least ${error.minimum}`;
                }
                if (error.type === "array") {
                    return `${path}must have at least ${error.minimum} elements`;
                }
                return `${path}value is too small`;

            case z.ZodIssueCode.too_big:
                if (error.type === "string") {
                    return `${path}must be at most ${error.maximum} characters`;
                }
                if (error.type === "number") {
                    return `${path}must be at most ${error.maximum}`;
                }
                if (error.type === "array") {
                    return `${path}must have at most ${error.maximum} elements`;
                }
                return `${path}value is too large`;

            case z.ZodIssueCode.invalid_enum_value:
                return `${path}must be one of: ${error.options.join(
                    ", "
                )}`;

            case z.ZodIssueCode.unrecognized_keys:
                return `Unrecognized keys: ${error.keys.join(", ")}`;

            case z.ZodIssueCode.invalid_arguments:
                return `${path}has invalid arguments`;

            case z.ZodIssueCode.invalid_return_type:
                return `${path}has invalid return type`;

            case z.ZodIssueCode.invalid_date:
                return `${path}must be a valid date format`;

            case z.ZodIssueCode.invalid_union:
                return `${path}does not match any of the expected types`;

            case z.ZodIssueCode.invalid_intersection_types:
                return `${path}must satisfy all conditions`;

            case z.ZodIssueCode.not_multiple_of:
                return `${path}must be a multiple of ${error.multipleOf}`;

            case z.ZodIssueCode.not_finite:
                return `${path}must be a finite number`;

            default:
                return `${path}${error.message}`;
        }
    });

    return messages.join(", ");
}
