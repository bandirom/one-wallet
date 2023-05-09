import { useEffect, useState } from 'react';
import TouchID from 'react-native-touch-id';

import { reportException } from '../../utils/reporting';

export enum Biometry {
  FaceID = 'faceID',
  Other = 'other',
}

export async function getBiometricType(): Promise<Biometry | null> {
  try {
    const type = await TouchID.isSupported().catch(() => false);
    if (!type) return null;

    if (type === 'FaceID') {
      return Biometry.FaceID;
    } else {
      return Biometry.Other;
    }
  } catch (e) {
    reportException(e, 'Unable to find biometric type');
  }
  return null;
}

export async function biometricAuthenticate(
  options: { cancelLabel?: string; promptMessage?: string } = {},
): Promise<void> {
  await TouchID.authenticate(options.promptMessage, { cancelText: options.cancelLabel });
}

export const useBiometricType = (): Biometry | null => {
  const [biometry, setBiometry] = useState<Biometry | null>(null);
  useEffect(() => {
    getBiometricType().then(setBiometry);
  }, []);
  return biometry;
};
