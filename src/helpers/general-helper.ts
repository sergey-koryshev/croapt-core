/**
 * Write error object in console.
 * @param message Message to log with the error.
 * @param err Error object.
 */
export function logError(message: string, err: unknown) {
  if (err instanceof Error) {
    console.log(`${message}${message.endsWith('.') ? '' : '.'} Error details: ${err.stack ?? err}`)
  } else {
    console.log(message)
  }
}

/**
 * Wait for provided promise and suppress exception if any.
 * @param promise The promise to wait.
 * @param errorPrefix Error prefix to provide in log message.
 * @returns A promise that resolves when the operation is complete.
 */
export async function safeWaitFor<T>(promise?: Promise<T>, errorPrefix?: string) {
  if (promise == null) {
    return
  }

  try {
    return await promise
  } catch (error: unknown) {
    logError(errorPrefix ?? 'Error has occurred while waiting for process to complete.', error)
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