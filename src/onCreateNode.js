import attachFields from './internal/attachFields'

const onCreateNode = (
  { node, boundActionCreators },
  { context, descriptors }
) => {
  const { createNodeField } = boundActionCreators
  if (descriptors) {
    attachFields(node, createNodeField, descriptors, context)
  }
}

export default onCreateNode
