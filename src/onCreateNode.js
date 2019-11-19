import attachFields from './internal/attachFields'

const onCreateNode = ({ node, actions, getNode }, { context, descriptors }) => {
  if (descriptors) {
    attachFields(node, actions, getNode, descriptors, context)
  }
}

export default onCreateNode
