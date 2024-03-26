import { CredentialDetailsCardListItem } from '@procivis/one-react-native-components';
import { PresentationDefinitionRequestedCredential } from '@procivis/react-native-one-core';
import React, { FC } from 'react';
import { StyleSheet } from 'react-native';

import { useCoreConfig } from '../../hooks/core-config';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { useCredentialDetail } from '../../hooks/credentials';
import { selectCredentialCardFromCredential } from '../../utils/credential-sharing';

export const Credential: FC<{
  credentialId: string;
  lastItem: boolean;
  onPress?: () => void;
  request: PresentationDefinitionRequestedCredential;
  selected: boolean;
  testID?: string;
}> = ({ testID, credentialId, selected, lastItem, request, onPress }) => {
  const { data: credential } = useCredentialDetail(credentialId);
  const { data: config } = useCoreConfig();

  const onImagePreview = useCredentialImagePreview();

  if (!credential || !config) {
    return null;
  }

  const { card, attributes } = selectCredentialCardFromCredential(
    credential,
    selected,
    request,
    config,
    testID,
  );

  return (
    <CredentialDetailsCardListItem
      attributes={attributes}
      card={{
        ...card,
        onHeaderPress: onPress,
      }}
      expanded={selected}
      lastItem={lastItem}
      onImagePreview={onImagePreview}
      style={styles.credential}
    />
  );
};

const styles = StyleSheet.create({
  credential: {
    marginBottom: 8,
  },
});
