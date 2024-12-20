// eslint-disable-next-line no-restricted-imports
import * as ReactNative from 'react-native';

import mockFile from './mock-file';

jest.doMock('react-native', () => {
  // Extend ReactNative
  return Object.setPrototypeOf(
    {
      Image: {
        ...ReactNative.Image,
        getSize: jest.fn(
          (
            uri: string,
            success: (width: number, height: number) => void,
            failure?: (error: unknown) => void, // eslint-disable-line @typescript-eslint/no-unused-vars
          ) => success(100, 100),
        ),
        resolveAssetSource: jest.fn((source) => mockFile), // eslint-disable-line @typescript-eslint/no-unused-vars
      },
      StyleSheet: ReactNative.StyleSheet,
    },
    ReactNative,
  );
});
