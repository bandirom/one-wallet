import {
  Accordion,
  Button,
  concatTestID,
  DetailScreen,
  formatDateTime,
  Selector,
  SelectorStatus,
  TextAvatar,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CredentialStateEnum, PresentationDefinitionRequestedCredential } from 'react-native-one-core';

import { useCredentialDetail, useCredentials } from '../../hooks/credentials';
import { translate } from '../../i18n';
import {
  ShareCredentialNavigationProp,
  ShareCredentialNavigatorParamList,
  ShareCredentialRouteProp,
} from '../../navigators/share-credential/share-credential-routes';
import { formatClaimValue } from '../../utils/credential';

const DataItem: FunctionComponent<{
  attribute: string;
  value: string;
}> = ({ attribute, value }) => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={styles.dataItem}>
      <Typography color={colorScheme.textSecondary} size="sml" style={styles.dataItemLabel}>
        {attribute}
      </Typography>
      <Typography color={colorScheme.text}>{value}</Typography>
    </View>
  );
};

const Credential: FunctionComponent<{
  testID?: string;
  credentialId: string;
  selected: boolean;
  request: PresentationDefinitionRequestedCredential;
  onPress?: () => void;
}> = ({ testID, credentialId, selected, request, onPress }) => {
  const { data: credential } = useCredentialDetail(credentialId);
  return credential ? (
    <Accordion
      testID={testID}
      title={credential.schema.name}
      titleStyle={{ testID: concatTestID(testID, selected ? 'selected' : 'unselected') }}
      accessibilityState={{ selected }}
      expanded={selected}
      onPress={onPress}
      subtitle={translate('proofRequest.selectCredential.issued', {
        date: formatDateTime(new Date(credential.issuanceDate)),
      })}
      icon={{ component: <TextAvatar produceInitials={true} text={credential.schema.name} innerSize={48} /> }}
      rightAccessory={<Selector status={selected ? SelectorStatus.SelectedRadio : SelectorStatus.Unselected} />}
      contentStyle={styles.itemContent}>
      {request.fields.map((field) => {
        const claim = credential.claims.find(({ key }) => key === field.keyMap[credentialId]);
        return (
          <DataItem
            key={field.id}
            attribute={field.name ?? claim?.key ?? field.id ?? ''}
            value={claim ? formatClaimValue(claim) : '-'}
          />
        );
      })}
    </Accordion>
  ) : null;
};

const SelectCredentialScreen: FunctionComponent = () => {
  const navigation = useNavigation<ShareCredentialNavigationProp<'SelectCredential'>>();
  const route = useRoute<ShareCredentialRouteProp<'SelectCredential'>>();
  const { data: allCredentials } = useCredentials();

  const { preselectedCredentialId, request } = route.params;

  const [selectedCredentialId, setSelectedCredentialId] = useState<string>(preselectedCredentialId);
  const onConfirm = useCallback(() => {
    navigation.navigate({
      name: 'ProofRequest',
      merge: true,
      params: {
        selectedCredentialId,
      } as ShareCredentialNavigatorParamList['ProofRequest'],
    });
  }, [navigation, selectedCredentialId]);

  const selectionOptions = useMemo(
    () =>
      request.applicableCredentials.filter((credentialId) =>
        allCredentials?.some(({ id, state }) => id === credentialId && state === CredentialStateEnum.ACCEPTED),
      ),
    [allCredentials, request],
  );

  return (
    <DetailScreen
      testID="ProofRequestSelectCredentialScreen"
      onBack={navigation.goBack}
      title={translate('proofRequest.selectCredential.title')}>
      {selectionOptions.map((credentialId) => {
        const selected = selectedCredentialId === credentialId;
        return (
          <View key={credentialId} style={styles.item}>
            <Credential
              testID={concatTestID('ProofRequestSelectCredentialScreen.credential', credentialId)}
              selected={selected}
              onPress={selected ? undefined : () => setSelectedCredentialId(credentialId)}
              credentialId={credentialId}
              request={request}
            />
          </View>
        );
      })}

      <View style={styles.bottom}>
        <Button testID="ProofRequestSelectCredentialScreen.confirm" onPress={onConfirm}>
          {translate('proofRequest.selectCredential.select')}
        </Button>
      </View>
    </DetailScreen>
  );
};

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dataItem: {
    marginBottom: 3,
    marginTop: 12,
  },
  dataItemLabel: {
    marginBottom: 2,
  },
  item: {
    marginBottom: 12,
  },
  itemContent: {
    paddingBottom: 12,
  },
});

export default SelectCredentialScreen;
