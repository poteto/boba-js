module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // We need this because of the `.base` modifier in our tsconfig filename.
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.base.json'
    }
  }
};