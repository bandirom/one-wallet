import { ImagePreviewScreen as ImagePreviewLayout } from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent } from 'react';

import {
  RootNavigationProp,
  RootRouteProp,
} from '../../navigators/root/root-routes';

const ImagePreviewScreen: FunctionComponent = () => {
  const navigation = useNavigation<RootNavigationProp<'ImagePreview'>>();
  const route = useRoute<RootRouteProp<'ImagePreview'>>();
  const { title, image } = route.params;

  return (
    <ImagePreviewLayout
      image={typeof image === 'string' ? { uri: image } : image}
      onBack={navigation.goBack}
      testID="ImagePreviewScreen"
      title={title}
    />
  );
};

export default ImagePreviewScreen;
