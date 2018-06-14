import validateDescriptors from '../../internal/validateDescriptors'

const stubFunction = () => {}

describe(`validate descriptors`, () => {
  it(`is valid for empty array`, () => {
    const descriptors = []
    expect(() => validateDescriptors(descriptors)).not.toThrow()
  })

  describe(`invalid descriptors`, () => {
    it(`is throws for missing 'fields'`, () => {
      const descriptors = [
        {
          predicate: stubFunction,
        },
      ]
      expect(() => validateDescriptors(descriptors)).toThrow(
        `[gatsby-plugin-node-fields] ValidationError: "value" at position 0 fails because [child "fields" fails because ["fields" is required]]`
      )
    })

    it(`is throws for missing 'predicate'`, () => {
      const descriptors = [
        {
          fields: [{ setter: stubFunction }],
        },
      ]
      expect(() => validateDescriptors(descriptors)).toThrow(
        `[gatsby-plugin-node-fields] ValidationError: "value" at position 0 fails because [child "predicate" fails because ["predicate" is required]]`
      )
    })

    it(`is throws for name not string`, () => {
      const descriptors = [
        {
          predicate: stubFunction,
          fields: [
            {
              setter: stubFunction,
              name: stubFunction,
            },
          ],
        },
      ]
      expect(() => validateDescriptors(descriptors)).toThrow(
        `[gatsby-plugin-node-fields] ValidationError: "value" at position 0 fails because [child "fields" fails because ["fields" at position 0 fails because [child "name" fails because ["name" must be a string]]]]`
      )
    })

    it(`is throws for name not string`, () => {
      const descriptors = [
        {
          predicate: stubFunction,
          fields: [
            {
              setter: stubFunction,
              name: stubFunction,
            },
          ],
        },
      ]
      expect(() => validateDescriptors(descriptors)).toThrow(
        `[gatsby-plugin-node-fields] ValidationError: "value" at position 0 fails because [child "fields" fails because ["fields" at position 0 fails because [child "name" fails because ["name" must be a string]]]]`
      )
    })

    it(`is throws for setter not a function`, () => {
      const descriptors = [
        {
          predicate: stubFunction,
          fields: [
            {
              setter: ``,
            },
          ],
        },
      ]
      expect(() => validateDescriptors(descriptors)).toThrow(
        `[gatsby-plugin-node-fields] ValidationError: "value" at position 0 fails because [child "fields" fails because ["fields" at position 0 fails because [child "setter" fails because ["setter" must be a Function]]]]`
      )
    })

    it(`is throws for getter not a function`, () => {
      const descriptors = [
        {
          predicate: stubFunction,
          fields: [
            {
              setter: stubFunction,
              getter: ``,
            },
          ],
        },
      ]
      expect(() => validateDescriptors(descriptors)).toThrow(
        `[gatsby-plugin-node-fields] ValidationError: "value" at position 0 fails because [child "fields" fails because ["fields" at position 0 fails because [child "getter" fails because ["getter" must be a Function]]]]`
      )
    })

    it(`is throws for validator not a function`, () => {
      const descriptors = [
        {
          predicate: stubFunction,
          fields: [
            {
              setter: stubFunction,
              validator: ``,
            },
          ],
        },
      ]
      expect(() => validateDescriptors(descriptors)).toThrow(
        `[gatsby-plugin-node-fields] ValidationError: "value" at position 0 fails because [child "fields" fails because ["fields" at position 0 fails because [child "validator" fails because ["validator" must be a Function]]]]`
      )
    })

    it(`is throws for transformer not a function`, () => {
      const descriptors = [
        {
          predicate: stubFunction,
          fields: [
            {
              setter: stubFunction,
              transformer: ``,
            },
          ],
        },
      ]
      expect(() => validateDescriptors(descriptors)).toThrow(
        `[gatsby-plugin-node-fields] ValidationError: "value" at position 0 fails because [child "fields" fails because ["fields" at position 0 fails because [child "transformer" fails because ["transformer" must be a Function]]]]`
      )
    })
  })

  describe(`minimal valid descriptors`, () => {
    it(`is valid for a field with only a 'setter'`, () => {
      const descriptors = [
        {
          predicate: stubFunction,
          fields: [{ setter: stubFunction }],
        },
      ]
      expect(() => validateDescriptors(descriptors)).not.toThrow()
    })

    it(`is valid for a field with only a 'name'`, () => {
      const descriptors = [
        {
          predicate: stubFunction,
          fields: [{ name: `name` }],
        },
      ]
      expect(() => validateDescriptors(descriptors)).not.toThrow()
    })
  })

  it(`is valid for a field with 'defaultValue' as function`, () => {
    const descriptors = [
      {
        predicate: stubFunction,
        fields: [{ name: `name`, defaultValue: stubFunction }],
      },
    ]
    expect(() => validateDescriptors(descriptors)).not.toThrow()
  })

  it(`is valid for a field with validator as function`, () => {
    const descriptors = [
      {
        predicate: stubFunction,
        fields: [{ name: `name`, validator: stubFunction }],
      },
    ]
    expect(() => validateDescriptors(descriptors)).not.toThrow()
  })

  it(`is valid for a field with transformer as function`, () => {
    const descriptors = [
      {
        predicate: stubFunction,
        fields: [{ name: `name`, transformer: stubFunction }],
      },
    ]
    expect(() => validateDescriptors(descriptors)).not.toThrow()
  })
})
