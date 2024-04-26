import {
  Button,
  CredentialCard,
  Header,
  OptionsIcon,
  ScanButton,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  ActivityIndicator,
  concatTestID,
  TouchableOpacity,
} from '@procivis/react-native-components';
import {
  CredentialListIncludeEntityType,
  CredentialListItem,
  CredentialListQuery,
  CredentialStateEnum,
} from '@procivis/react-native-one-core';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { debounce } from 'lodash';
import { observer } from 'mobx-react-lite';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator as LoadingIndicator,
  SectionList,
  SectionListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NoCredentialsIcon } from '../../components/icon/wallet-icon';
import {
  useCredentialDetail,
  usePagedCredentials,
} from '../../hooks/core/credentials';
import { useCredentialStatusCheck } from '../../hooks/revocation/credential-status';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { getCredentialCardPropsFromCredential } from '../../utils/credential';

const WalletScreen: FunctionComponent = observer(() => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RootNavigationProp>();
  const safeAreaInsets = useSafeAreaInsets();
  const {
    locale: { locale },
  } = useStores();
  const [searchPhrase, setSearchPhrase] = useState<string>('');
  const [queryParams, setQueryParams] = useState<Partial<CredentialListQuery>>({
    include: [CredentialListIncludeEntityType.LAYOUT_PROPERTIES],
    status: [
      CredentialStateEnum.ACCEPTED,
      CredentialStateEnum.SUSPENDED,
      CredentialStateEnum.REVOKED,
    ],
  });
  const {
    data: credentialsData,
    fetchNextPage,
    hasNextPage,
  } = usePagedCredentials(queryParams);
  const [isEmpty, setIsEmpty] = useState<boolean>(true);

  useCredentialStatusCheck();

  const credentials = useMemo(
    () => credentialsData?.pages.map((page) => page.values).flat(),
    [credentialsData?.pages],
  );

  const handleEndReached = useCallback(() => {
    const pageParam = credentialsData?.pages.length;
    if (!pageParam) {
      return;
    }
    fetchNextPage({ pageParam });
  }, [fetchNextPage, credentialsData?.pages.length]);

  const handleWalletSettingsClick = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleSearchPhraseChange = useMemo(
    () => debounce(setQueryParams, 500),
    [],
  );
  useEffect(() => {
    handleSearchPhraseChange((prev) => ({
      ...prev,
      name: searchPhrase || undefined,
    }));
  }, [handleSearchPhraseChange, searchPhrase]);

  const handleCredentialPress = useCallback(
    (credentialId: string) => {
      if (credentialId) {
        navigation.navigate('CredentialDetail', {
          params: { credentialId },
          screen: 'Detail',
        });
      }
    },
    [navigation],
  );

  const handleScanPress = useCallback(() => {
    navigation.navigate('Dashboard', { screen: 'QRCodeScanner' });
  }, [navigation]);

  const renderItem = useCallback(
    ({
      item,
      index,
      section,
    }: SectionListRenderItemInfo<CredentialListItem>) => {
      // TODO Fix / discuss. This is ineficient.
      // The list item contains no claims. Without claims we can not render
      // all preview fields (primaryAttribute, photoAttribute, MRZ, etc.)
      const isFocused = useIsFocused();
      const { data: credential } = useCredentialDetail(item.id, isFocused);

      if (!credential) {
        return null;
      }

      const testID = concatTestID('WalletScreen.credential', credential.id);
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => handleCredentialPress(credential.id)}
          style={[
            styles.listItem,
            index === section.data.length - 1 ? styles.listItemLast : undefined,
          ]}
        >
          <CredentialCard
            {...getCredentialCardPropsFromCredential(
              credential,
              credential.claims,
              undefined,
              testID,
            )}
          />
        </TouchableOpacity>
      );
    },
    [handleCredentialPress],
  );

  useEffect(() => {
    setIsEmpty((!credentials || credentials.length === 0) && !searchPhrase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentials]);

  return (
    <View
      style={[styles.background, { backgroundColor: colorScheme.background }]}
      testID="WalletScreen"
    >
      <SectionList
        ListEmptyComponent={
          credentials ? (
            <View style={styles.empty} testID="WalletScreen.credentialList">
              {isEmpty ? (
                <>
                  <Typography
                    align="center"
                    color={colorScheme.text}
                    preset="l/line-height-large"
                    style={styles.emptyTitle}
                  >
                    {translate('wallet.credentialsList.empty.title')}
                  </Typography>
                  <Typography align="center" color={colorScheme.text}>
                    {translate('wallet.credentialsList.empty.subtitle')}
                  </Typography>
                  <NoCredentialsIcon style={styles.emptyIcon} />
                  <Button
                    onPress={handleScanPress}
                    style={[
                      styles.emptyButton,
                      { bottom: Math.max(24, safeAreaInsets.bottom) },
                    ]}
                    testID="OnboardingSetupScreen.setup"
                    title={translate('wallet.credentialsList.empty.scanQrCode')}
                  />
                </>
              ) : (
                <>
                  <Typography
                    align="center"
                    color={colorScheme.text}
                    preset="l/line-height-large"
                    style={styles.emptyTitle}
                  >
                    {translate('wallet.credentialsList.empty.search.title')}
                  </Typography>
                  <Typography align="center" color={colorScheme.text}>
                    {translate('wallet.credentialsList.empty.search.subtitle')}
                  </Typography>
                </>
              )}
            </View>
          ) : (
            <View style={styles.loadingIndicator}>
              <ActivityIndicator />
            </View>
          )
        }
        ListFooterComponent={
          credentials && credentials.length > 0 ? (
            <View style={styles.footer}>
              {hasNextPage && (
                <LoadingIndicator
                  color={colorScheme.accent}
                  style={styles.pageLoadingIndicator}
                />
              )}
            </View>
          ) : undefined
        }
        ListHeaderComponent={
          <Header
            onSearchPhraseChange={!isEmpty ? setSearchPhrase : undefined}
            rightButton={
              <TouchableOpacity
                accessibilityLabel={translate('wallet.settings')}
                onPress={handleWalletSettingsClick}
                style={styles.settingsButton}
                testID="WalletScreen.header.action-settings"
              >
                <OptionsIcon color={colorScheme.text} />
              </TouchableOpacity>
            }
            searchPhrase={searchPhrase}
            testID={'WalletScreen.header'}
            text={{
              searchPlaceholder: translate('wallet.search'),
            }}
            title={translate('wallet.title')}
          />
        }
        ListHeaderComponentStyle={[
          styles.header,
          { paddingTop: safeAreaInsets.top },
        ]}
        contentContainerStyle={styles.contentContainer}
        key={locale}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        renderItem={renderItem}
        sections={
          credentials && credentials.length > 0 ? [{ data: credentials }] : []
        }
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        style={[styles.list, { backgroundColor: colorScheme.background }]}
      />
      {!isEmpty && <ScanButton onPress={handleScanPress} />}
    </View>
  );
});

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    flex: 1,
    marginTop: 84,
  },
  emptyButton: {
    marginBottom: 16,
    position: 'absolute',
    width: '100%',
  },
  emptyIcon: {
    marginTop: -24,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  footer: {
    minHeight: 20,
  },
  header: {
    marginHorizontal: -16,
  },
  itemIcon: {
    borderRadius: 0,
    borderWidth: 0,
  },
  list: {
    flex: 1,
    marginHorizontal: 16,
    overflow: 'visible',
    paddingHorizontal: 0,
  },
  listItem: {
    height: 60,
    marginBottom: 8,
  },
  listItemLast: {
    height: 'auto',
  },
  loadingIndicator: {
    height: '100%',
  },
  pageLoadingIndicator: {
    marginBottom: 20,
    marginTop: 12,
  },
  settingsButton: {
    height: 24,
    width: 24,
  },
  title: {
    borderRadius: 20,
    marginBottom: 0,
    paddingBottom: 4,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  titleWrapper: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default WalletScreen;
