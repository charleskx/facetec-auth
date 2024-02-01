import {
  FaceTecIDScanResult,
  FaceTecSessionResult,
} from '@sdk/FaceTecSDK.js/FaceTecPublicApi'

export type TOnComplete = (
  sessionResult: FaceTecSessionResult | null,
  idScanResult: FaceTecIDScanResult | null,
  latestNetworkResponseStatus: number,
) => void

export type TGetLatestEnrollmentIdentifier = () => string

export type TClearLatestEnrollmentIdentifier = () => void

export type TFaceTecReference = {
  onComplete: TOnComplete
  getLatestEnrollmentIdentifier: TGetLatestEnrollmentIdentifier
  clearLatestEnrollmentIdentifier: TClearLatestEnrollmentIdentifier
}
