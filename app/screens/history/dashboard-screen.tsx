import {
  BackButton,
  NavigationHeader,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  HistoryEntityTypeEnum,
  HistoryListItem,
  HistoryListQuery,
} from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import { debounce } from 'lodash';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { FoldableSearchHeader } from '../../components/header/foldable-header';
import { CredentialSchemaPicker } from '../../components/history/credential-schema-picker';
import { FilterButton } from '../../components/history/filter-button';
import { HistorySectionList } from '../../components/history/history-list';
import { useListContentInset } from '../../hooks/list/list-content-inset';
import { translate } from '../../i18n';
import { HistoryNavigationProp } from '../../navigators/history/history-routes';

const HistoryDashboardScreen: FC = () => {
  const colorScheme = useAppColorScheme();

  const insets = useListContentInset({
    additionalBottomPadding: 24,
    headerHeight: 100,
  });

  const navigation = useNavigation<HistoryNavigationProp<'HistoryDashboard'>>();
  const [empty, setEmpty] = useState<boolean>();
  const [scrollOffset] = useState(() => new Animated.Value(0));
  const [isFilterModalOpened, setIsFilterModalOpened] =
    useState<boolean>(false);
  const [queryParams, setQueryParams] = useState<Partial<HistoryListQuery>>({
    entityTypes: [
      HistoryEntityTypeEnum.BACKUP,
      HistoryEntityTypeEnum.CREDENTIAL,
      HistoryEntityTypeEnum.PROOF,
    ],
  });

  const handleItemPress = useCallback(
    (entry: HistoryListItem) => {
      navigation.navigate('Detail', { entry });
    },
    [navigation],
  );

  const handleCredentialSchemaChange = useCallback(
    (credentialSchemaId?: string) => {
      setQueryParams((prev) => ({ ...prev, credentialSchemaId }));
    },
    [],
  );

  const [searchPhrase, setSearchPhrase] = useState<string>('');
  const handleSearchPhraseChange = useMemo(
    () =>
      debounce(
        (newSearchPhrase: string | undefined) =>
          setQueryParams((prev) => ({ ...prev, searchText: newSearchPhrase })),
        500,
      ),
    [],
  );
  useEffect(() => {
    handleSearchPhraseChange(searchPhrase || undefined);
  }, [searchPhrase, handleSearchPhraseChange]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorScheme.background,
        },
      ]}
      testID="HistoryScreen"
    >
      {empty && (
        <View
          style={[styles.emptyNotice, { backgroundColor: colorScheme.white }]}
        >
          <Typography align="center" color={colorScheme.text} preset="s">
            {translate('history.empty.title')}
          </Typography>
          <Typography
            align="center"
            color={colorScheme.text}
            preset="s/line-height-small"
            style={styles.shaded}
          >
            {translate('history.empty.subtitle')}
          </Typography>
        </View>
      )}
      <HistorySectionList
        contentContainerStyle={insets}
        itemProps={{ onPress: handleItemPress }}
        onEmpty={setEmpty}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollOffset } } }],
          {
            useNativeDriver: true,
          },
        )}
        query={queryParams}
      />
      <CredentialSchemaPicker
        onClose={() => setIsFilterModalOpened(false)}
        onSelection={handleCredentialSchemaChange}
        selected={queryParams.credentialSchemaId}
        visible={isFilterModalOpened}
      />
      <FoldableSearchHeader
        header={
          <NavigationHeader
            backgroundColor={'transparent'}
            leftItem={
              <BackButton
                onPress={navigation.goBack}
                testID="HistoryScreen.back"
              />
            }
            title={translate('history.title')}
          />
        }
        scrollOffset={scrollOffset}
        searchBar={
          empty
            ? undefined
            : {
                rightButton: (
                  <FilterButton
                    active={Boolean(queryParams.credentialSchemaId)}
                    onPress={() => setIsFilterModalOpened(true)}
                    testID="HistoryScreen.filter"
                  />
                ),
                rightButtonAlwaysVisible: true,
                searchBarProps: {
                  onSearchPhraseChange: setSearchPhrase,
                  placeholder: translate('common.search'),
                  searchPhrase,
                  testID: 'HistoryScreen.search',
                },
              }
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyNotice: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 24,
    paddingBottom: 20,
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  shaded: {
    opacity: 0.7,
  },
});

export default HistoryDashboardScreen;
