import { useAppColorScheme } from '@procivis/react-native-components';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StatusBar } from 'react-native';

import { useAutomaticPinCodeCoverLogic } from '../../components/pin-code/pin-code-check';
import CredentialDetailScreen from '../../screens/credential/credential-detail-screen';
import PinCodeCheckScreen from '../../screens/onboarding/pin-code-check-screen';
import { AppColorScheme } from '../../theme';
import IssueCredentialNavigator from '../issue-credential/issue-credential-navigator';
import OnboardingNavigator from '../onboarding/onboarding-navigator';
import SettingsNavigator from '../settings/settings-navigator';
import TabsNavigator from '../tabs/tabs-navigator';
import { hideSplashScreen, useInitialRoute } from './initialRoute';
import { RootNavigatorParamList } from './root-navigator-routes';

const RootStack = createNativeStackNavigator<RootNavigatorParamList>();

const RootNavigator = () => {
  const { darkMode } = useAppColorScheme<AppColorScheme>();
  const initialRouteName = useInitialRoute();
  useAutomaticPinCodeCoverLogic(initialRouteName === 'Tabs');

  return initialRouteName ? (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        animated={true}
      />
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          animationTypeForReplace: 'push',
        }}
        initialRouteName={initialRouteName}>
        <RootStack.Screen
          name="PinCodeCheck"
          component={PinCodeCheckScreen}
          options={{ animation: 'fade' }}
          listeners={{ transitionEnd: () => hideSplashScreen() }}
        />
        <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        <RootStack.Screen name="Tabs" component={TabsNavigator} />
        <RootStack.Screen name="Settings" component={SettingsNavigator} />
        <RootStack.Screen name="CredentialDetail" component={CredentialDetailScreen} />
        <RootStack.Screen name="IssueCredential" component={IssueCredentialNavigator} />
      </RootStack.Navigator>
    </>
  ) : null;
};

export default RootNavigator;
