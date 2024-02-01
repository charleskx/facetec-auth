import type { FaceTecSDK as TFaceTecSDK } from '@sdk/FaceTecSDK.js/FaceTecSDK'

import { config } from '@/configs/faceTec'
import { Enrollment } from '@/services/processors/enrollment'
import { Authenticate } from '@/services/processors/authenticate'
import {
  enableAllButtons,
  displayStatus,
  formatUIForDevice,
  fadeOutMainUIAndPrepareForSession,
  handleErrorGettingServerSessionToken,
  showMainUI,
} from '@/helpers/faceTecUtilities'

type TResult = string | null

type TCallbackGetSession = (token: string) => void

declare let FaceTecSDK: typeof TFaceTecSDK

let identifier: string = ''
let processor: Enrollment | Authenticate | undefined
let result: TResult = null
let IDScanResult: TResult = null

window.onload = function (): void {
  FaceTecSDK.setResourceDirectory('../../core-sdk/FaceTecSDK.js/resources')
  FaceTecSDK.setImagesDirectory('../../core-sdk/FaceTec_images')

  FaceTecSDK.initializeInDevelopmentMode(
    config.DeviceKeyIdentifier,
    config.PublicFaceScanEncryptionKey,
    (successful: boolean) => {
      if (successful) {
        enableAllButtons()
      }

      displayStatus(
        FaceTecSDK.getFriendlyDescriptionForFaceTecSDKStatus(
          FaceTecSDK.getStatus(),
        ),
      )
    },
  )

  formatUIForDevice()
}

export function onRegister(IDUser: string): void {
  fadeOutMainUIAndPrepareForSession()

  getSessionToken((token: string) => {
    identifier = IDUser

    processor = new Enrollment(token, {
      getLatestEnrollmentIdentifier,
      onComplete,
      clearLatestEnrollmentIdentifier,
    })
  })
}

export function onLogIn(IDUser: string): void {
  fadeOutMainUIAndPrepareForSession()

  getSessionToken((token: string) => {
    identifier = IDUser

    processor = new Authenticate(token, {
      getLatestEnrollmentIdentifier,
      onComplete,
      clearLatestEnrollmentIdentifier,
    })
  })
}

function onComplete(): void {
  showMainUI()
  enableAllButtons()

  if (!processor?.isSuccess()) {
    clearLatestEnrollmentIdentifier()

    displayStatus('Session exited early, see logs for more details.')

    return
  }

  displayStatus('Success')
}

function getSessionToken(callback: TCallbackGetSession): void {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', `${config.BaseURL}/session-token`)
  xhr.setRequestHeader('X-Device-Key', config.DeviceKeyIdentifier)
  xhr.setRequestHeader(
    'X-User-Agent',
    FaceTecSDK.createFaceTecAPIUserAgentString(''),
  )

  xhr.onreadystatechange = function (): void {
    if (this.readyState === XMLHttpRequest.DONE) {
      let sessionToken = ''

      try {
        sessionToken = JSON.parse(this.responseText).sessionToken

        if (typeof sessionToken !== 'string') {
          onServerSessionTokenError()
          return
        }
      } catch {
        onServerSessionTokenError()
        return
      }

      callback(sessionToken)
    }
  }

  xhr.onerror = function (): void {
    onServerSessionTokenError()
  }

  xhr.send()
}

function onServerSessionTokenError(): void {
  handleErrorGettingServerSessionToken()
}

export function setLatestSessionResult(sessionResult: TResult): void {
  result = sessionResult
}

export function getLatstSessionResult(): TResult {
  return result
}

export function setIDScanResult(idScanResult: TResult): void {
  IDScanResult = idScanResult
}

export function getIDScanResult(): TResult {
  return IDScanResult
}

function getLatestEnrollmentIdentifier(): string {
  return identifier
}

export function setLatestServerResult(responseJSON: string): void {
  console.log(responseJSON)
}

export function clearLatestEnrollmentIdentifier(): void {
  identifier = ''
}
