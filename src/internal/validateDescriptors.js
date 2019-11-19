import { throwSchemaValidationError } from './errors'
import schema from './schema'

const validateDescriptors = descriptors => {
  const { error, value } = schema.validate(descriptors)
  if (error) {
    throwSchemaValidationError(error)
  }

  return value
}

export default validateDescriptors
