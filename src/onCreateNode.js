import attachFields from './internal/attachFields'

const onCreateNode = (
  { node, boundActionCreators },
  { context, descriptors }
) => {
  if (descriptors) {
    attachFields(node, boundActionCreators, descriptors, context)
  }
}

export default onCreateNode
