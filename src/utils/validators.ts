/**
 * Utility functions for validation
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Parses and validates an ID parameter from a request
 * @param idParam - The ID parameter from the request
 * @param entityName - The name of the entity (for error messages)
 * @returns The parsed ID as a number
 * @throws ValidationError if the ID is invalid
 */
export const parseId = (
  idParam: string | undefined,
  entityName: string
): number => {
  if (!idParam || !/^\d+$/.test(idParam)) {
    throw new ValidationError(`Invalid ${entityName} id`);
  }
  return Number.parseInt(idParam, 10);
};

/**
 * Validates that required fields are present in an object
 * @param data - The object to validate
 * @param requiredFields - Array of required field names
 * @returns Array of missing field names
 */
export const getMissingFields = (
  data: Record<string, any>,
  requiredFields: string[]
): string[] => {
  return requiredFields.filter((field) => !data[field]);
};
