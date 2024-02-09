import {
  ActionModal,
  Button,
  concatTestID,
  DetailScreen,
  FilterButton,
  ListItemProps,
  ListView,
  RadioGroup,
  RadioGroupItem,
  SearchBar,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import {
  HistoryEntityTypeEnum,
  HistoryListQuery,
} from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import { debounce } from 'lodash';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { Section } from '../../components/common/section';
import { NextIcon } from '../../components/icon/common-icon';
import { useCredentialSchemas } from '../../hooks/credential-schemas';
import { useHistory } from '../../hooks/history';
import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';
import { formatMonth, formatTimestamp } from '../../utils/date';
import { getEntryTitle } from '../../utils/history';

const HistoryScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<SettingsNavigationProp<'History'>>();
  const [isFilterModalOpened, setIsFilterModalOpened] =
    useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [queryParams, setQueryParams] = useState<Partial<HistoryListQuery>>({
    entityTypes: [
      HistoryEntityTypeEnum.CREDENTIAL,
      HistoryEntityTypeEnum.PROOF,
    ],
  });
  const { data: credentialSchemas } = useCredentialSchemas();
  const { data: history } = useHistory(queryParams);

  const handleItemPress = useCallback(
    (entryGroupIndex: number) => (_: ListItemProps, index: number) => {
      navigation.navigate('HistoryDetail', {
        entry: history![entryGroupIndex].entries[index],
      });
    },
    [history, navigation],
  );

  const handleCredentialSchemaChange = useCallback(
    (item: RadioGroupItem) => {
      const credentialSchemaId = `${item.key}` || undefined;
      setQueryParams({ ...queryParams, credentialSchemaId });
    },
    [queryParams],
  );

  const handleSearchTextChange = debounce(setQueryParams, 500);

  useEffect(
    () => {
      handleSearchTextChange({
        ...queryParams,
        searchText: searchText || undefined,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchText],
  );

  if (!history || !credentialSchemas) {
    return <ActivityIndicator />;
  }

  return (
    <>
      <DetailScreen
        onBack={navigation.goBack}
        style={{ backgroundColor: colorScheme.background }}
        testID="HistoryScreen"
        title={translate('history.title')}
      >
        {(history.length > 0 ||
          queryParams.searchText ||
          queryParams.credentialSchemaId) && (
          <View style={styles.actions}>
            <SearchBar
              onSearchPhraseChange={setSearchText}
              placeholder={translate('common.search')}
              searchPhrase={searchText}
              style={styles.searchBar}
              testID="HistoryScreen.search"
            />

            <FilterButton
              enabled={isFilterModalOpened || !!queryParams.credentialSchemaId}
              onPress={() => setIsFilterModalOpened(true)}
              testID="HistoryScreen.filter"
            />
          </View>
        )}

        {history.length === 0 ? (
          <View style={styles.empty}>
            <Typography
              align="center"
              bold
              color={colorScheme.textSecondary}
              size="sml"
              style={styles.emptyTitle}
            >
              {translate('history.empty.title')}
            </Typography>
            <Typography
              align="center"
              color={colorScheme.textSecondary}
              size="sml"
            >
              {translate('history.empty.subtitle')}
            </Typography>
          </View>
        ) : (
          history.map((entryGroup, entryGroupIndex) => (
            <ListView
              emptyListSubtitle={translate('history.empty.subtitle')}
              emptyListTitle={translate('history.empty.title')}
              items={entryGroup.entries.map((entry, index) => {
                return {
                  rightAccessory: <NextIcon color={colorScheme.text} />,
                  style: styles.entry,
                  subtitle: `${formatTimestamp(
                    new Date(entry.createdDate),
                  )} - ${entry.entityId}`,
                  testID: concatTestID(
                    'HistoryScreen.history',
                    index.toString(),
                  ),
                  title: getEntryTitle(entry),
                };
              })}
              key={entryGroup.date}
              onItemSelected={handleItemPress(entryGroupIndex)}
              style={styles.entryList}
              testID="HistoryScreen.list"
              title={formatMonth(new Date(entryGroup.date))}
              titleStyle={styles.entryListTitle}
            />
          ))
        )}
      </DetailScreen>

      <ActionModal
        contentStyle={styles.filterModalContent}
        visible={isFilterModalOpened}
      >
        <ScrollView testID="HistoryScreen.filter.scroll">
          <Section
            title={translate('history.filter.title')}
            titleStyle={styles.filterModalTitle}
          >
            <RadioGroup
              items={[
                {
                  key: '',
                  label: translate('common.all'),
                  style: styles.filterGroupItem,
                },
                ...credentialSchemas.map((credentialSchema) => ({
                  key: credentialSchema.id,
                  label: credentialSchema.name,
                  style: styles.filterGroupItem,
                })),
              ]}
              onDeselected={handleCredentialSchemaChange}
              onSelected={handleCredentialSchemaChange}
              selectedItems={
                queryParams.credentialSchemaId
                  ? [queryParams.credentialSchemaId]
                  : ['']
              }
              style={styles.filterGroup}
            />

            <Button
              onPress={() => setIsFilterModalOpened(false)}
              testID="HistoryScreen.filter.close"
              type="light"
            >
              {translate('common.close')}
            </Button>
          </Section>
        </ScrollView>
      </ActionModal>
    </>
  );
};

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 24,
  },
  emptyTitle: {
    marginBottom: 2,
  },
  entry: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  // eslint-disable-next-line react-native/no-color-literals
  entryList: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 0,
  },
  entryListTitle: {
    marginBottom: 18,
    marginTop: -12,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterGroupItem: {
    marginVertical: 0,
    paddingTop: 8,
  },
  filterModalContent: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    maxHeight: '85%',
    paddingVertical: 12,
  },
  filterModalTitle: {
    marginBottom: 18,
  },
  searchBar: {
    flex: 1,
    marginRight: 12,
  },
});

export default HistoryScreen;