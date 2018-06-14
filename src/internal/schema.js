import Joi from 'joi'

const field = Joi.object()
  .keys({
    name: Joi.string(),
    getter: Joi.func(),
    default: Joi.any(),
    validator: Joi.func(),
    transformer: Joi.func(),
    setter: Joi.func(),
  })
  .or(`name`, `setter`)

const descriptor = Joi.object().keys({
  predicate: Joi.func().required(),
  fields: Joi.array()
    .items(field)
    .required(),
})

const schema = Joi.array()
  .items(descriptor)
  .required()

export default schema
