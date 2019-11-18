import attachFields from './internal/attachFields'

const onCreateNode = (
  { node, actions },
  { context, descriptors }
) => {
  const { createNodeField } = actions
  if (descriptors) {
    attachFields(node, createNodeField, descriptors, context)
  }
}

export default onCreateNode
