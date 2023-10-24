import {
  ActivityIndicator,
  FeatureScreen,
  formatDateTime,
  ListView,
  TextAvatar,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useCallback, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { CredentialStateEnum } from 'react-native-one-core';

import { EmptyIcon, NextIcon, SettingsIcon } from '../../components/icon/wallet-icon';
import { useCredentialRevocationCheck, useCredentials } from '../../hooks/credentials';
import { useDeepLink } from '../../hooks/deep-link';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { reportException } from '../../utils/reporting';
import TabBarAwareContainer from './tab-bar-aware-container';

const WalletScreen: FunctionComponent = observer(() => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RootNavigationProp>();

  const isFocused = useIsFocused();
  useDeepLink(isFocused);

  const {
    locale: { locale },
  } = useStores();

  const { data: credentials } = useCredentials();
  const { mutateAsync: checkRevocation } = useCredentialRevocationCheck();

  const revocationCheckPerformed = useRef<boolean>(false);
  useEffect(() => {
    if (!revocationCheckPerformed.current && credentials?.length) {
      revocationCheckPerformed.current = true;
      checkRevocation(credentials.map(({ id }) => id)).catch((e) => reportException(e, 'Revocation check failed'));
    }
  }, [checkRevocation, credentials]);

  const handleWalletSettingsClick = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleCredentialPress = useCallback(
    (_, index: number) => {
      const credentialId = credentials?.[index]?.id;
      if (credentialId) {
        navigation.navigate('CredentialDetail', { credentialId });
      }
    },
    [credentials, navigation],
  );

  return (
    <FeatureScreen
      testID="WalletScreen"
      key={locale}
      title={translate('wallet.walletScreen.title')}
      headerBackground={colorScheme.lineargradient}
      style={{ backgroundColor: colorScheme.background }}
      actionButtons={[
        {
          key: 'settings',
          accessibilityLabel: translate('wallet.settings.title'),
          content: SettingsIcon,
          onPress: handleWalletSettingsClick,
        },
      ]}>
      <TabBarAwareContainer>
        {credentials ? (
          <ListView
            title={translate(
              credentials.length
                ? 'wallet.walletScreen.credentialsList.title'
                : 'wallet.walletScreen.credentialsList.title.empty',
              { credentialsCount: credentials.length },
            )}
            emptyListIcon={{ component: <EmptyIcon color={colorScheme.lightGrey} /> }}
            emptyListIconStyle={styles.emptyIcon}
            emptyListTitle={translate('wallet.walletScreen.credentialsList.empty.title')}
            emptyListSubtitle={translate('wallet.walletScreen.credentialsList.empty.subtitle')}
            items={credentials.map((credential) => {
              const revoked = credential.state === CredentialStateEnum.REVOKED;
              return {
                title: credential.schema.name,
                subtitle: revoked
                  ? translate('credentialDetail.log.revoke')
                  : formatDateTime(new Date(credential.issuanceDate)),
                subtitleStyle: { color: revoked ? colorScheme.alertText : colorScheme.text },
                icon: { component: <TextAvatar produceInitials={true} text={credential.schema.name} innerSize={48} /> },
                iconStyle: styles.itemIcon,
                rightAccessory: <NextIcon color={colorScheme.text} />,
              };
            })}
            onItemSelected={handleCredentialPress}
          />
        ) : (
          <ActivityIndicator />
        )}
      </TabBarAwareContainer>
    </FeatureScreen>
  );
});

const styles = StyleSheet.create({
  emptyIcon: {
    marginBottom: 2,
  },
  itemIcon: {
    borderRadius: 0,
    borderWidth: 0,
  },
});

export default WalletScreen;
