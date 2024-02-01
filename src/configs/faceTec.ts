type TFaceTecConfig = {
  DeviceKeyIdentifier: string
  BaseURL: string
  PublicFaceScanEncryptionKey: string
}

export const config: TFaceTecConfig = {
  DeviceKeyIdentifier: import.meta.env.VITE_APP_KEY_IDENTIFIER,
  BaseURL: import.meta.env.VITE_APP_BASE_URL,
  PublicFaceScanEncryptionKey: '',
}
