/**
 * Nullish type utility to match Zod's nullish() behavior
 * This type allows a value to be T, null, or undefined
 * Used for optional fields in entities to align with Zod schema definitions
 */
export type Nullish<T> = T | null | undefined;