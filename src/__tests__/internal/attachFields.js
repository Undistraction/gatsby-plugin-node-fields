import { F, lensProp, path, T } from 'ramda'
import { lensEq } from 'ramda-adjunct'
import attachFields from '../../internal/attachFields'

const name1 = `name1`
const name2 = `name2`
const key1 = `key1`
const key2 = `key2`
const value1 = `value1`
const value2 = `value2`
const EMPTY_NODE = {}
const unmatchedDescriptor = {
  predicate: F,
  fields: [],
}
const DEFAULT_CONTEXT = {}

const lensPropEq = (name, value) => lensEq(lensProp(name), value)

describe(`attachFields`, () => {
  let createNode

  beforeEach(() => {
    createNode = jest.fn()
  })

  // ---------------------------------------------------------------------------
  // Descriptor Validation
  // ---------------------------------------------------------------------------

  describe(`throws with invalid descriptors`, () => {
    expect(() =>
      // Missing predicate key on descriptor
      attachFields(EMPTY_NODE, createNode, [{ fields: [] }])
    ).toThrow()
  })

  // ---------------------------------------------------------------------------
  // Descriptor Predicates
  // ---------------------------------------------------------------------------

  describe(`with no descriptors`, () => {
    it(`does nothing`, () => {
      const node = {}

      attachFields(node, createNode)

      expect(createNode).not.toBeCalled()
    })
  })

  describe(`with predicates that don't match`, () => {
    it(`does nothing`, () => {
      const descriptors = [unmatchedDescriptor, unmatchedDescriptor]

      attachFields(EMPTY_NODE, createNode, descriptors)

      expect(createNode).not.toBeCalled()
    })
  })

  describe(`with predicates that match`, () => {
    it(`changes the node using the matching descriptors`, () => {
      const node = {
        [key1]: 1,
        [key2]: true,
      }

      const descriptors = [
        {
          predicate: lensPropEq(key1, 1),
          fields: [
            {
              name: name1,
            },
          ],
        },
        unmatchedDescriptor,
        {
          predicate: lensPropEq(key2, true),
          fields: [
            {
              name: name2,
            },
          ],
        },
      ]

      attachFields(node, createNode, descriptors)

      expect(createNode.mock.calls).toEqual([
        [
          {
            node,
            name: name1,
            value: undefined,
          },
        ],
        [
          {
            node,
            name: name2,
            value: undefined,
          },
        ],
      ])
    })
  })

  // ---------------------------------------------------------------------------
  // name field
  // ---------------------------------------------------------------------------

  describe(`with only a name`, () => {
    it(`will use the node prop of the same name`, () => {
      const node = {
        [name1]: value1,
      }

      const descriptors = [
        {
          predicate: T,
          fields: [
            {
              name: name1,
            },
          ],
        },
      ]

      attachFields(node, createNode, descriptors)

      expect(createNode.mock.calls).toEqual([
        [
          {
            node,
            name: name1,
            value: value1,
          },
        ],
      ])
    })
  })

  describe(`with a getter`, () => {
    it(`will use the getter`, () => {
      const node = {
        [key1]: {
          [key2]: value1,
        },
      }

      const descriptors = [
        {
          predicate: T,
          fields: [
            {
              name: name1,
              getter: path([key1, key2]),
            },
          ],
        },
      ]

      attachFields(node, createNode, descriptors)

      expect(createNode.mock.calls).toEqual([
        [
          {
            node,
            name: name1,
            value: value1,
          },
        ],
      ])
    })
  })

  // ---------------------------------------------------------------------------
  // default field
  // ---------------------------------------------------------------------------

  describe(`when value exits`, () => {
    it(`default isn't used`, () => {
      const node = {
        [name1]: value1,
      }

      const descriptors = [
        {
          predicate: T,
          fields: [
            {
              name: name1,
              default: value2,
            },
          ],
        },
      ]

      attachFields(node, createNode, descriptors)

      expect(createNode.mock.calls).toEqual([
        [
          {
            node,
            name: name1,
            value: value1,
          },
        ],
      ])
    })
  })

  describe(`when value doesn't exist`, () => {
    describe(`when default field is a function`, () => {
      it(`calls the default field value and uses the return value`, () => {
        const defaultF = jest.fn().mockReturnValueOnce(value2)

        const node = {
          [key1]: value1,
        }

        const descriptors = [
          {
            predicate: T,
            fields: [
              {
                name: name1,
                default: defaultF,
              },
            ],
          },
        ]

        attachFields(node, createNode, descriptors)

        expect(defaultF).toBeCalledWith(node, DEFAULT_CONTEXT)
        expect(createNode.mock.calls).toEqual([
          [
            {
              node,
              name: name1,
              value: value2,
            },
          ],
        ])
      })
    })

    describe(`when default field is not a function`, () => {
      it(`uses the default field value`, () => {
        const node = {}

        const descriptors = [
          {
            predicate: T,
            fields: [
              {
                name: name1,
                default: value2,
              },
            ],
          },
        ]

        attachFields(node, createNode, descriptors)

        expect(createNode.mock.calls).toEqual([
          [
            {
              node,
              name: name1,
              value: value2,
            },
          ],
        ])
      })
    })
  })

  // ---------------------------------------------------------------------------
  // transformer Field
  // ---------------------------------------------------------------------------

  describe(`when transformer is defined`, () => {
    it(`transforms the value`, () => {
      const transformer = jest.fn().mockReturnValueOnce(value2)

      const node = {
        [name1]: value1,
      }

      const descriptors = [
        {
          predicate: T,
          fields: [
            {
              name: name1,
              transformer,
            },
          ],
        },
      ]

      attachFields(node, createNode, descriptors)

      expect(transformer).toBeCalledWith(node, DEFAULT_CONTEXT, value1)
      expect(createNode.mock.calls).toEqual([
        [
          {
            node,
            name: name1,
            value: value2,
          },
        ],
      ])
    })
  })

  // ---------------------------------------------------------------------------
  // setter Field
  // ---------------------------------------------------------------------------

  describe(`when setter is defined`, () => {
    describe(`when name is also defined`, () => {
      it(`uses the name setter`, () => {
        const setter = (node, context, createNodeField, value) => {
          createNodeField({
            node,
            name: name2,
            value,
          })
        }

        const node = {
          [name1]: value1,
        }

        const descriptors = [
          {
            predicate: T,
            fields: [
              {
                name: name1,
                setter,
              },
            ],
          },
        ]

        attachFields(node, createNode, descriptors)

        expect(createNode.mock.calls).toEqual([
          [
            {
              node,
              name: name2,
              value: value1,
            },
          ],
        ])
      })
    })

    describe(`when no name is defined`, () => {
      it(`uses the setter`, () => {
        const setter = (node, context, createNodeField, value) => {
          createNodeField({
            node,
            name: name2,
            value,
          })
        }

        const node = {
          [name1]: value1,
        }

        const descriptors = [
          {
            predicate: T,
            fields: [
              {
                getter: () => value1,
                setter,
              },
            ],
          },
        ]

        attachFields(node, createNode, descriptors)

        expect(createNode.mock.calls).toEqual([
          [
            {
              node,
              name: name2,
              value: value1,
            },
          ],
        ])
      })
    })

    describe(`when no name or getter is defined`, () => {
      it(`uses the setter`, () => {
        const setter = (node, context, createNodeField) => {
          createNodeField({
            node,
            name: name2,
            value: value1,
          })
        }

        const node = {
          [name1]: value1,
        }

        const descriptors = [
          {
            predicate: T,
            fields: [
              {
                setter,
              },
            ],
          },
        ]

        attachFields(node, createNode, descriptors)

        expect(createNode.mock.calls).toEqual([
          [
            {
              node,
              name: name2,
              value: value1,
            },
          ],
        ])
      })
    })
  })

  // ---------------------------------------------------------------------------
  // validator
  // ---------------------------------------------------------------------------

  describe(`validator with invalid value`, () => {
    it(`throws`, () => {
      const validator = jest.fn().mockReturnValueOnce(false)

      const descriptors = [
        {
          predicate: T,
          fields: [
            {
              name: name2,
              validator,
            },
          ],
        },
      ]

      expect(() => attachFields(EMPTY_NODE, createNode, descriptors)).toThrow(
        `[gatsby-plugin-node-fields] Invalid Field Error: Validator function for field named 'name2' returned false for field value 'undefined'`
      )
      expect(validator).toBeCalledWith(undefined)
    })
  })

  describe(`validator with valid value`, () => {
    it(`doesn't throw`, () => {
      const validator = jest.fn().mockReturnValueOnce(true)

      const descriptors = [
        {
          predicate: T,
          fields: [
            {
              name: name2,
              default: value1,
              validator,
            },
          ],
        },
      ]

      expect(() =>
        attachFields(EMPTY_NODE, createNode, descriptors)
      ).not.toThrow()
      expect(validator).toBeCalledWith(value1)
    })
  })
})
