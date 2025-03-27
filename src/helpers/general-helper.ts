export function logError(message: string, err: unknown) {
  if (err instanceof Error) {
    console.log(`${message}${message.endsWith('.') ? '' : '.'} Error details: ${err.stack ?? err}`)
  } else {
    console.log(message)
  }
}

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