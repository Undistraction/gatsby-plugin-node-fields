import attachFields from './attachFields'

// eslint-disable-next-line import/prefer-default-export
export const onCreateNode = (
  { node, boundActionCreators },
  { context, descriptors }
) => {
  const { createNodeField } = boundActionCreators
  if (descriptors) {
    attachFields(node, createNodeField, descriptors, context)
  }
}
