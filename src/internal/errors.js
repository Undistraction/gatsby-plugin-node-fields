const ERROR_PREFIX = `[gatsby-plugin-node-fields]`
const INVALID_FIELD_ERROR_PREFIX = `Invalid Field Error`

const throwLibError = message => {
  throw new Error(`${ERROR_PREFIX} ${message}`)
}

const throwPrefixedError = (prefix, message) =>
  throwLibError(`${prefix}: ${message}`)

// eslint-disable-next-line import/prefer-default-export
export const throwInvalidFieldError = (fieldName, fieldValue) => {
  throwPrefixedError(
    INVALID_FIELD_ERROR_PREFIX,
    `Validator function for field named '${fieldName}' returned false for field value '${fieldValue}'`
  )
}

export const throwSchemaValidationError = error =>
  throwLibError(error.toString())
