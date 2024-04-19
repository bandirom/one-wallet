import {
  Button,
  concatTestID,
  EntityCluster,
  NavigationHeader,
  useBlockOSBackNavigation,
  useMemoAsync,
} from '@procivis/one-react-native-components';
import { ActivityIndicator } from '@procivis/react-native-components';
import {
  CredentialStateEnum,
  OneError,
  OneErrorCode,
  PresentationDefinitionField,
  PresentationDefinitionRequestedCredential,
  PresentationSubmitCredentialRequest,
} from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import { CredentialSelect } from '../../components/proof-request/credential-select';
import { Group } from '../../components/proof-request/group';
import { useONECore } from '../../hooks/core/core-context';
import {
  useCredentialRevocationCheck,
  useCredentials,
} from '../../hooks/core/credentials';
import { useProofDetail, useProofReject } from '../../hooks/core/proofs';
import { useCredentialListExpandedCard } from '../../hooks/credential-card/credential-card-expanding';
import { useBeforeRemove } from '../../hooks/navigation/before-remove';
import { translate } from '../../i18n';
import {
  ShareCredentialNavigationProp,
  ShareCredentialRouteProp,
} from '../../navigators/share-credential/share-credential-routes';
import { reportException } from '../../utils/reporting';

const ProofRequestScreen: FunctionComponent = () => {
  const sharingNavigation =
    useNavigation<ShareCredentialNavigationProp<'ProofRequest'>>();
  const route = useRoute<ShareCredentialRouteProp<'ProofRequest'>>();
  const { top } = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { core } = useONECore();

  useBlockOSBackNavigation();

  const { mutateAsync: checkRevocation } = useCredentialRevocationCheck();
  const { data: allCredentials } = useCredentials();

  const {
    request: { interactionId, proofId },
    selectedCredentialId,
  } = route.params;

  const { mutateAsync: rejectProof } = useProofReject();
  const { data: proof } = useProofDetail(proofId);

  const { expandedCredential, onHeaderPress } = useCredentialListExpandedCard();

  const presentationDefinition = useMemoAsync(async () => {
    const definition = await core.getPresentationDefinition(proofId);

    // refresh revocation status of the applicable credentials
    const credentialIds = new Set<string>(
      definition.requestGroups.flatMap(({ requestedCredentials }) =>
        requestedCredentials.flatMap(
          ({ applicableCredentials }) => applicableCredentials,
        ),
      ),
    );
    await checkRevocation(Array.from(credentialIds)).catch((e) =>
      reportException(e, 'Revocation check failed'),
    );

    return definition;
  }, [checkRevocation, core, proofId]);

  const [selectedCredentials, setSelectedCredentials] = useState<
    Record<
      PresentationDefinitionRequestedCredential['id'],
      PresentationSubmitCredentialRequest | undefined
    >
  >({});

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const infoPressHandler = useCallback(() => {}, []);

  // initial selection of credentials/claims
  useEffect(() => {
    if (!presentationDefinition || !allCredentials) {
      return;
    }

    const preselected: Record<
      PresentationDefinitionRequestedCredential['id'],
      PresentationSubmitCredentialRequest | undefined
    > = {};
    presentationDefinition.requestGroups.forEach((group) =>
      group.requestedCredentials.forEach((credential) => {
        const credentialId =
          allCredentials.find(
            ({ id, state }) =>
              state === CredentialStateEnum.ACCEPTED &&
              credential.applicableCredentials.includes(id),
          )?.id ?? credential.applicableCredentials[0];
        if (!credentialId) {
          preselected[credential.id] = undefined;
          return;
        }

        const requiredClaims = credential.fields
          .filter((field) => field.required)
          .map((field) => field.id);
        preselected[credential.id] = {
          credentialId,
          submitClaims: requiredClaims,
        };
      }),
    );

    setSelectedCredentials(preselected);
  }, [presentationDefinition, allCredentials]);

  // by default the first credential is expanded
  useEffect(() => {
    if (!expandedCredential) {
      const [credentialId] =
        Object.entries(selectedCredentials).find(([_, v]) => v !== undefined) ??
        [];
      onHeaderPress(credentialId);
    }
  }, [expandedCredential, selectedCredentials, onHeaderPress]);

  const [activeSelection, setActiveSelection] =
    useState<PresentationDefinitionRequestedCredential['id']>();
  const onSelectCredential = useCallback(
    (requestCredentialId: PresentationDefinitionRequestedCredential['id']) =>
      () => {
        const requestedCredential =
          presentationDefinition?.requestGroups[0].requestedCredentials.find(
            (credential) => credential.id === requestCredentialId,
          ) as PresentationDefinitionRequestedCredential;

        setActiveSelection(requestCredentialId);
        sharingNavigation.navigate('SelectCredential', {
          preselectedCredentialId: selectedCredentials[requestCredentialId]
            ?.credentialId as string,
          request: requestedCredential,
        });
      },
    [sharingNavigation, presentationDefinition, selectedCredentials],
  );
  // result of selection is propagated using the navigation param `selectedCredentialId`
  useEffect(() => {
    if (selectedCredentialId && activeSelection) {
      setSelectedCredentials((prev) => {
        const prevSelection = prev[
          activeSelection
        ] as PresentationSubmitCredentialRequest;
        return {
          ...prev,
          [activeSelection]: {
            ...prevSelection,
            credentialId: selectedCredentialId,
          },
        };
      });
    }
    // ignore activeSelection changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCredentialId]);

  const onSelectField = useCallback(
    (requestCredentialId: PresentationDefinitionRequestedCredential['id']) =>
      (id: PresentationDefinitionField['id'], selected: boolean) => {
        setSelectedCredentials((prev) => {
          const prevSelection = prev[
            requestCredentialId
          ] as PresentationSubmitCredentialRequest;
          let submitClaims = [...prevSelection.submitClaims];
          if (selected) {
            submitClaims.push(id);
          } else {
            submitClaims = submitClaims.filter((claimId) => claimId !== id);
          }
          return {
            ...prev,
            [requestCredentialId]: { ...prevSelection, submitClaims },
          };
        });
      },
    [],
  );

  const reject = useCallback(() => {
    if (!isFocused) {
      return;
    }
    rejectProof(interactionId).catch((err) => {
      if (
        !(err instanceof OneError) ||
        err.code !== OneErrorCode.NotSupported
      ) {
        reportException(err, 'Reject Proof failure');
      }
    });
  }, [interactionId, isFocused, rejectProof]);

  const onSubmit = useCallback(() => {
    sharingNavigation.navigate('Processing', {
      credentials: selectedCredentials as Record<
        string,
        PresentationSubmitCredentialRequest
      >,
      interactionId: interactionId,
      proofId,
    });
  }, [interactionId, proofId, selectedCredentials, sharingNavigation]);

  useBeforeRemove(reject);

  const allSelectionsValid =
    presentationDefinition &&
    Object.values(selectedCredentials).every(
      (selection) =>
        selection?.credentialId &&
        allCredentials?.some(
          ({ id, state }) =>
            id === selection.credentialId &&
            state === CredentialStateEnum.ACCEPTED,
        ),
    );

  const safeAreaPaddingStyle: ViewStyle | undefined =
    Platform.OS === 'android'
      ? {
          paddingTop: top,
        }
      : undefined;

  return (
    <ScrollView
      contentContainerStyle={[styles.contentContainer, safeAreaPaddingStyle]}
      style={styles.scrollView}
      testID="ProofRequestSharingScreen"
    >
      <NavigationHeader
        leftItem={HeaderCloseModalButton}
        modalHandleVisible={Platform.OS === 'ios'}
        rightItem={<HeaderInfoButton onPress={infoPressHandler} />}
        title={translate('proofRequest.title')}
      />
      <View style={styles.content} testID="ProofRequestSharingScreen.content">
        <EntityCluster
          entityName={
            proof?.verifierDid ?? translate('proofRequest.unknownVerifier')
          }
          style={styles.verifier}
        />
        {!presentationDefinition || !allCredentials ? (
          <ActivityIndicator />
        ) : (
          <>
            {presentationDefinition.requestGroups.map(
              (group, index, { length }) => (
                <Group
                  key={group.id}
                  last={length === index + 1}
                  request={group}
                >
                  {group.requestedCredentials.map(
                    (
                      credential,
                      credentialIndex,
                      { length: credentialsLength },
                    ) => (
                      <CredentialSelect
                        allCredentials={allCredentials}
                        credentialId={credential.id}
                        expanded={expandedCredential === credential.id}
                        key={credential.id}
                        lastItem={credentialIndex === credentialsLength - 1}
                        onHeaderPress={onHeaderPress}
                        onSelectCredential={onSelectCredential(credential.id)}
                        onSelectField={onSelectField(credential.id)}
                        request={credential}
                        selectedCredentialId={
                          selectedCredentials[credential.id]?.credentialId
                        }
                        selectedFields={
                          selectedCredentials[credential.id]?.submitClaims
                        }
                        style={[
                          styles.requestedCredential,
                          credentialsLength === credentialIndex + 1 &&
                            styles.requestedCredentialLast,
                        ]}
                        testID={concatTestID(
                          'ProofRequestSharingScreen.credential',
                          credential.id,
                        )}
                      />
                    ),
                  )}
                </Group>
              ),
            )}
            <SafeAreaView edges={['bottom']} style={styles.bottom}>
              <Button
                disabled={!allSelectionsValid}
                onPress={onSubmit}
                title={translate('proofRequest.confirm')}
              />
            </SafeAreaView>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'android' ? 16 : 0,
    paddingTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    flexGrow: 1,
  },
  requestedCredential: {
    marginBottom: 24,
  },
  requestedCredentialLast: {
    marginBottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  verifier: {
    paddingHorizontal: 0,
    paddingTop: 16,
  },
});

export default ProofRequestScreen;
