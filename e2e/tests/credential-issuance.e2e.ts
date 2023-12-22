import { expect } from 'detox';

import CredentialAcceptProcessScreen from '../page-objects/CredentialAcceptProcessScreen';
import CredentialDetailScreen from '../page-objects/CredentialDetailScreen';
import CredentialOfferScreen from '../page-objects/CredentialOfferScreen';
import PinCodeScreen from '../page-objects/PinCodeScreen';
import WalletScreen from '../page-objects/WalletScreen';
import {
  bffLogin,
  createCredential,
  createCredentialSchema,
  offerCredential,
  revokeCredential,
} from '../utils/bff-api';
import { CredentialFormat, Transport } from '../utils/enums';
import { pinSetup } from '../utils/init';
import { scanURL } from '../utils/scan';

describe('ONE-601: Credential issuance', () => {
  let authToken: string;
  let credentialSchemaJWT: Record<string, any>;
  let credentialSchemaSD_JWT: Record<string, any>;

  beforeAll(async () => {
    await device.launchApp({ permissions: { camera: 'YES' } });
    await pinSetup();
    authToken = await bffLogin();
    credentialSchemaJWT = await createCredentialSchema(authToken, {
      format: CredentialFormat.JWT,
    });
    credentialSchemaSD_JWT = await createCredentialSchema(authToken, {
      format: CredentialFormat.SDJWT,
    });
  });

  describe('Credential offer', () => {
    let credentialId: string;

    const issueCredentialTestCase = async (redirectUri?: string | null) => {
      credentialId = await createCredential(authToken, credentialSchemaJWT, { redirectUri });
      const invitationUrl = await offerCredential(credentialId, authToken);
      await scanURL(invitationUrl);
      await expect(CredentialOfferScreen.screen).toBeVisible();
    };

    it('Accept credential issuance', async () => {
      await issueCredentialTestCase();
      await CredentialOfferScreen.acceptButton.tap();

      await expect(CredentialAcceptProcessScreen.screen).toBeVisible();
      await expect(CredentialAcceptProcessScreen.status.success).toBeVisible();

      await CredentialAcceptProcessScreen.closeButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
    });

    it('Accept credential issuance with redirect URI', async () => {
      await issueCredentialTestCase('https://example.com');
      await CredentialOfferScreen.acceptButton.tap();

      await expect(CredentialAcceptProcessScreen.screen).toBeVisible();
      await expect(CredentialAcceptProcessScreen.status.success).toBeVisible();
      await expect(CredentialAcceptProcessScreen.ctaButton).toBeVisible();
    });

    it('Reject credential issuance', async () => {
      await issueCredentialTestCase();
      await CredentialOfferScreen.rejectButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });
  });

  describe('ONE-620: Credential revocation', () => {
    let credentialId: string;

    beforeAll(async () => {
      credentialId = await createCredential(authToken, credentialSchemaJWT);
      const invitationUrl = await offerCredential(credentialId, authToken);
      await scanURL(invitationUrl);

      await expect(CredentialOfferScreen.screen).toBeVisible();
      await CredentialOfferScreen.acceptButton.tap();
      await expect(CredentialAcceptProcessScreen.screen).toBeVisible();
      await expect(CredentialAcceptProcessScreen.status.success).toBeVisible();
      await CredentialAcceptProcessScreen.closeButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });

    it('Credential not revoked initially', async () => {
      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
      await expect(WalletScreen.credential(credentialId).revokedLabel).not.toExist();
    });

    it('Credential revoked remotely', async () => {
      await revokeCredential(credentialId, authToken);
      await device.launchApp({ newInstance: true });
      await expect(PinCodeScreen.Check.screen).toBeVisible();
      await PinCodeScreen.Check.digit(1).multiTap(6);
      await expect(WalletScreen.screen).toBeVisible();

      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
      await expect(WalletScreen.credential(credentialId).revokedLabel).toExist();
    });

    it('Revoked credential detail screen', async () => {
      await WalletScreen.credential(credentialId).element.tap();
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await expect(CredentialDetailScreen.status.element).toBeVisible();
      await expect(CredentialDetailScreen.status.value).toHaveText('Revoked');
      await expect(CredentialDetailScreen.log('revoked')).toExist();
    });
  });

  describe('ONE-796: OpenID4VC Credential transport', () => {
    const issueCredentialTestCase = async (credentialSchema: Record<string, any>) => {
      const credentialId = await createCredential(authToken, credentialSchema, { transport: Transport.OPENID4VC });

      const invitationUrl = await offerCredential(credentialId, authToken);
      await scanURL(invitationUrl);

      await expect(CredentialOfferScreen.screen).toBeVisible();
      await CredentialOfferScreen.acceptButton.tap();

      await expect(CredentialAcceptProcessScreen.screen).toBeVisible();
      await expect(CredentialAcceptProcessScreen.status.success).toBeVisible();
      await CredentialAcceptProcessScreen.closeButton.tap();

      await expect(WalletScreen.screen).toBeVisible();
      // TODO: Find a way how to determine OpenID4VC credential in list.
      // await expect(WalletScreen.credential(credentialId).element).toBeVisible();
    };

    // eslint-disable-next-line jest/expect-expect
    it('Issue credential: JWT schema', async () => {
      await issueCredentialTestCase(credentialSchemaJWT);
    });

    // eslint-disable-next-line jest/expect-expect
    it('Issue credential: SD_JWT schema', async () => {
      await issueCredentialTestCase(credentialSchemaSD_JWT);
    });
  });
});
