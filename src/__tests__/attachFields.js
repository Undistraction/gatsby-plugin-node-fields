import attachFields from '../attachFields'

describe(`attachFields`, () => {
  describe(`with no descriptors`, () => {
    it(`adds no fields`, () => {
      const node = {}
      const createNode = jest.fn()
      attachFields(node, createNode)
      expect(node).toEqual({})
      expect(createNode).not.toBeCalled()
    })
  })
})
