import Joi from 'joi'
import { throwSchemaValidationError } from './errors'
import schema from './schema'

const validateDescriptors = descriptors => {
  Joi.validate(descriptors, schema, { convert: false }, (error, value) => {
    if (error) {
      throwSchemaValidationError(error)
    }
    return value
  })
}

export default validateDescriptors
