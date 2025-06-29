module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleNameMapper: {
    '\\.(css)$': 'identity-obj-proxy',
    '^react$': require.resolve('react'),
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1' // Добавьте алиас для путей
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.app.json',
        diagnostics: {
          ignoreCodes: [151001]
        }
      }
    ]
  },
  globals: {
    Uint8Array: Uint8Array,
    ArrayBuffer: ArrayBuffer,
  }
};