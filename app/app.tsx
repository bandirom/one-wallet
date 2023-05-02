/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
import './utils/ignore-warnings';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { AccessibilityFocusHistoryProvider, ColorSchemeProvider } from '@procivis/react-native-components';
import * as Sentry from '@sentry/react-native';
import React, { useEffect, useState } from 'react';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import Config from 'react-native-ultimate-config';

import { registerTimeAgoLocales } from './i18n';
import { RootStore, RootStoreProvider, setupRootStore } from './models';
import { AppNavigator, canExit, useBackButtonHandler } from './navigators';
import { ErrorBoundary } from './screens';
import { AppColorScheme, useFlavorColorScheme } from './theme';
import { initFonts } from './theme/fonts'; // expo
import { reportException } from './utils/reporting';

if (!__DEV__ && Config.DEV_CONFIG !== 'true') {
  Sentry.init({
    dsn: 'https://b98a05fd083c47f1a770d74d04df0425@o153694.ingest.sentry.io/4505114160201728',
    environment: Config.CONFIG_NAME,

    // Sentry event payload is limited to 200KB, if exceeded, the event report is dumped -> minimize reported data
    maxBreadcrumbs: 50,
    beforeBreadcrumb: (breadcrumb: Sentry.Breadcrumb) => {
      if (breadcrumb.category === 'console') {
        breadcrumb.data = {};
        breadcrumb.message = breadcrumb.message?.substring(0, 50);
      }
      return breadcrumb;
    },
  });
}

/**
 * This is the root component of our app.
 */
function App() {
  const [rootStore, setRootStore] = useState<RootStore | undefined>(undefined);

  useEffect(() => {
    registerTimeAgoLocales();
  }, []);
  useBackButtonHandler(canExit);

  // Kick off initial async loading actions, like loading fonts and RootStore
  useEffect(() => {
    (async () => {
      await initFonts(); // expo
      setupRootStore()
        .then(setRootStore)
        .catch((e) => {
          reportException(e, 'setup mobx store failure');
        });
    })();
  }, []);

  const colorScheme = useFlavorColorScheme();

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  // In iOS: application:didFinishLaunchingWithOptions:
  // In Android: https://stackoverflow.com/a/45838109/204044
  // You can replace with your own loading component if you wish.
  if (!rootStore) return null;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <RootStoreProvider value={rootStore}>
        <ErrorBoundary catchErrors={'always'}>
          <ActionSheetProvider>
            <AccessibilityFocusHistoryProvider>
              <ColorSchemeProvider<AppColorScheme> colorScheme={colorScheme}>
                <AppNavigator />
              </ColorSchemeProvider>
            </AccessibilityFocusHistoryProvider>
          </ActionSheetProvider>
        </ErrorBoundary>
      </RootStoreProvider>
    </SafeAreaProvider>
  );
}

export default App;
