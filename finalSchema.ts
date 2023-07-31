import { Kind, buildSchema, graphql, parse } from "graphql";

export const schema = `
type Collar {
  id: ID!
  pet: Pet!
}

type Pet {
  id: ID!
  name: String!
  human: Human! # Many to One
  collar: Collar! # One to One
}

type Human {
  id: ID!
  fullName: String!
  starships: [Starship!]! # Many to Many
  pets: [Pet!]! # One to Many  
}

type Starship {
  id: ID!
  name: String!
  owners: [Human!]! # Many to Many
}

type Query {
  starships: [Starship!]!
  starship(id: ID!): Starship!
  humans: [Human!]!
  human(id: ID!): Human!
  pets: [Pet!]!
  pet(id: ID!): Pet!
  collars: [Collar!]!
  collar(id: ID!): Collar!
}

type Mutation {
  createStarship(input: CreateStarshipInput!): Starship!
  createHuman(input: CreateHumanInput!): Human!
  createPet(input: CreatePetInput!): Pet!
  createCollar(input: CreateCollarInput!): Collar!
}

input CreateStarshipInput {
  id: ID!
  name: String!
  owners: [ID!]!
}

input CreateHumanInput {
  id: ID!
  fullName: String!
  starships: [ID!]!
  pets: [ID!]!
}

input CreatePetInput {
  id: ID!
  name: String!
  human: ID!
  collar: ID!
}

input CreateCollarInput {
  id: ID!
  pet: ID!
}
`;

export const getStarships = `
  query GetStarships {
    starships {
      id
      name
      owners {
        id
        fullName
        starships {
          id
          name
        }
        pets {
          id
          name
          human {
            id
            fullName
          }
          collar {
            id
            pet {
              id
              name
            }
          }
        }
      }
    }
  }
`;

export const getStarship = `
  query GetStarship($id: ID!) {
    starship(id: $id) {
      id
      name
      owners {
        id
        fullName
        starships {
          id
          name
        }
        pets {
          id
          name
          human {
            id
            fullName
          }
          collar {
            id
            pet {
              id
              name
            }
          }
        }
      }
    }
  }
`;

export const getHumans = `
  query GetHumans {
    humans {
      id
      fullName
      starships {
        id
        name
      }
      pets {
        id
        name
        human {
          id
          fullName
        }
        collar {
          id
          pet {
            id
            name
          }
        }
      }
    }
  }
`;

export const getHuman = `
  query GetHuman($id: ID!) {
    human(id: $id) {
      id
      fullName
      starships {
        id
        name
      }
      pets {
        id
        name
        human {
          id
          fullName
        }
        collar {
          id
          pet {
            id
            name
          }
        }
      }
    }
  }
`;

export const getPets = `
  query GetPets {
    pets {
      id
      name
      human {
        id
        fullName
        starships {
          id
          name
        }
        pets {
          id
          name
          human {
            id
            fullName
          }
          collar {
            id
            pet {
              id
              name
            }
          }
        }
      }
      collar {
        id
        pet {
          id
          name
        }
      }
    }
  }
`;

export const getPet = `
  query GetPet($id: ID!) {
    pet(id: $id) {
      id
      name
      human {
        id
        fullName
        starships {
          id
          name
        }
        pets {
          id
          name
          human {
            id
            fullName
          }
          collar {
            id
            pet {
              id
              name
            }
          }
        }
      }
      collar {
        id
        pet {
          id
          name
        }
      }
    }
  }
`;

export const getCollars = `
  query GetCollars {
    collars {
      id
      pet {
        id
        name
        human {
          id
          fullName
          starships {
            id
            name
          }
          pets {
            id
            name
            human {
              id
              fullName
            }
            collar {
              id
              pet {
                id
                name
              }
            }
          }
        }
        collar {
          id
          pet {
            id
            name
          }
        }
      }
    }
  }
`;

export const getCollar = `
  query GetCollar($id: ID!) {
    collar(id: $id) {
      id
      pet {
        id
        name
        human {
          id
          fullName
          starships {
            id
            name
          }
          pets {
            id
            name
            human {
              id
              fullName
            }
            collar {
              id
              pet {
                id
                name
              }
            }
          }
        }
        collar {
          id
          pet {
            id
            name
          }
        }
      }
    }
  }
`;

export const parsed = buildSchema(schema);

export const finalSchema = parsed;
