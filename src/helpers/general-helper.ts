import { LoggerFactory } from './logger-factory'

const logger = LoggerFactory.getLogger({ name: 'GeneralHelper' })

/**
 * Wait for provided promise and suppress exception if any.
 * @param promise The promise to wait.
 * @returns A promise that resolves when the operation is complete.
 */
export async function safeWaitFor<T>(promise?: Promise<T>) {
  if (promise == null) {
    return
  }

  try {
    return await promise
  } catch (error: unknown) {
    logger.error(error, 'Error has occurred while waiting for process to complete.')
  }
}

/**
 * 
 * @param ms Waits for specified time in milliseconds.
 * @param signal Abort signal to cancel the operation.
 * @returns A promise that resolves when the operation is complete.
 */
export function waitFor(ms: number, signal?: AbortSignal) {
  return new Promise((resolve, reject) => {
    function abort() {
      clearTimeout(timeout)
      reject(signal?.reason)
    }
    signal?.throwIfAborted()
    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve(undefined)
    }, ms)
    signal?.addEventListener('abort', abort)
  })
}