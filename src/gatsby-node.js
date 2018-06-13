import attachFields from '../src/attachFields'

const onCreateNode = async (
  { node, boundActionCreators },
  { context, descriptors }
) => {
  const { createNodeField } = boundActionCreators
  if (descriptors) {
    attachFields(node, createNodeField, descriptors, context)
  }
}

export default onCreateNode
