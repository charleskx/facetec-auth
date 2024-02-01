import type {
  FaceTecFaceScanProcessor,
  FaceTecFaceScanResultCallback,
  FaceTecIDScanResult,
  FaceTecSessionResult,
} from '@sdk/FaceTecSDK.js/FaceTecPublicApi'
import type { FaceTecSDK as TFaceTecSDK } from '@sdk/FaceTecSDK.js/FaceTecSDK'

import { config } from '@/configs/faceTec'
import { TFaceTecReference } from '@/@types/faceTec'

export type TReferenceProps = {
  getLatestEnrollmentIdentifier: () => string
  clearLatestEnrollmentIdentifier: () => void
  onComplete: (
    session: FaceTecSessionResult | null,
    scan: FaceTecIDScanResult | null,
    response: number,
  ) => void
}

declare let FaceTecSDK: typeof TFaceTecSDK

export class Enrollment implements FaceTecFaceScanProcessor {
  public latestSessionResult: FaceTecSessionResult | null
  private cancelledDueToNetworkError: boolean

  sampleAppControllerReference: TFaceTecReference
  success: boolean

  latestNetworkRequest: XMLHttpRequest = new XMLHttpRequest()

  constructor(token: string, reference: TReferenceProps) {
    this.latestSessionResult = null
    this.cancelledDueToNetworkError = false
    this.success = false
    this.sampleAppControllerReference = reference as TFaceTecReference

    // eslint-disable-next-line no-new
    new FaceTecSDK.FaceTecSession(this, token)
  }

  public processSessionResultWhileFaceTecSDKWaits = (
    sessionResult: FaceTecSessionResult,
    faceScanResultCallback: FaceTecFaceScanResultCallback,
  ): void => {
    this.latestSessionResult = sessionResult

    if (
      sessionResult.status !==
      FaceTecSDK.FaceTecSessionStatus.SessionCompletedSuccessfully
    ) {
      const error = FaceTecSDK.FaceTecSessionStatus[sessionResult.status]

      console.log(`Sessão não foi concluída com êxito. ${error}`)

      this.latestNetworkRequest.abort()
      faceScanResultCallback.cancel()
      return
    }

    const parameters = {
      faceScan: sessionResult.faceScan,
      auditTrailImage: sessionResult.auditTrail[0],
      lowQualityAuditTrailImage: sessionResult.lowQualityAuditTrail[0],
      sessionId: sessionResult.sessionId,
      externalDatabaseRefID:
        this.sampleAppControllerReference.getLatestEnrollmentIdentifier(),
    }

    this.latestNetworkRequest = new XMLHttpRequest()
    this.latestNetworkRequest.open('POST', `${config.BaseURL}/enrollment-3d`)
    this.latestNetworkRequest.setRequestHeader(
      'Content-Type',
      'application/json',
    )

    this.latestNetworkRequest.setRequestHeader(
      'X-Device-Key',
      config.DeviceKeyIdentifier,
    )

    this.latestNetworkRequest.setRequestHeader(
      'X-User-Agent',
      FaceTecSDK.createFaceTecAPIUserAgentString(
        sessionResult.sessionId as string,
      ),
    )

    this.latestNetworkRequest.onreadystatechange = (): void => {
      if (this.latestNetworkRequest.readyState === XMLHttpRequest.DONE) {
        try {
          const responseJSON = JSON.parse(
            this.latestNetworkRequest.responseText,
          )
          const scanResultBlob = responseJSON.scanResultBlob

          if (responseJSON.wasProcessed) {
            FaceTecSDK.FaceTecCustomization.setOverrideResultScreenSuccessMessage(
              'Liveness\nConfirmed',
            )

            faceScanResultCallback.proceedToNextStep(scanResultBlob)
          } else {
            this.cancelDueToNetworkError(
              'Unexpected API response, cancelling out.',
              faceScanResultCallback,
            )
          }
        } catch (_e) {
          this.cancelDueToNetworkError(
            'Exception while handling API response, cancelling out.',
            faceScanResultCallback,
          )
        }
      }
    }

    this.latestNetworkRequest.onerror = (): void => {
      this.cancelDueToNetworkError(
        'XHR error, cancelling.',
        faceScanResultCallback,
      )
    }

    this.latestNetworkRequest.upload.onprogress = (
      event: ProgressEvent,
    ): void => {
      const progress = event.loaded / event.total
      faceScanResultCallback.uploadProgress(progress)
    }

    const jsonStringToUpload = JSON.stringify(parameters)
    this.latestNetworkRequest.send(jsonStringToUpload)

    window.setTimeout(() => {
      if (this.latestNetworkRequest.readyState === XMLHttpRequest.DONE) {
        return
      }

      faceScanResultCallback.uploadMessageOverride('Still Uploading...')
    }, 6000)
  }

  public onFaceTecSDKCompletelyDone = (): void => {
    this.success = this.latestSessionResult!.isCompletelyDone

    if (this.success) {
      // TODO: callback de sucesso!
      console.log('Sucesso!')
    } else {
      this.sampleAppControllerReference.clearLatestEnrollmentIdentifier()
    }

    this.sampleAppControllerReference.onComplete(
      this.latestSessionResult,
      null,
      this.latestNetworkRequest.status,
    )
  }

  private cancelDueToNetworkError = (
    networkErrorMessage: string,
    faceScanResultCallback: FaceTecFaceScanResultCallback,
  ): void => {
    if (this.cancelledDueToNetworkError === false) {
      console.log(networkErrorMessage)

      this.cancelledDueToNetworkError = true

      faceScanResultCallback.cancel()
    }
  }

  public isSuccess = (): boolean => {
    return this.success
  }
}
