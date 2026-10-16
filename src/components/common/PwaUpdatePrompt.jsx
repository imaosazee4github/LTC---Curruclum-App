
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PwaUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
  })

  const closePrompt = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
    >
      <p className="font-semibold text-slate-900">
        {offlineReady
          ? 'LTC Pioneer is ready for offline use.'
          : 'A new version of LTC Pioneer is available.'}
      </p>

      <p className="mt-1 text-sm text-slate-600">
        {offlineReady
          ? 'The app shell has been cached on this device.'
          : 'Update the app to load the latest version.'}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {needRefresh && (
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900"
          >
            Update now
          </button>
        )}

        <button
          type="button"
          onClick={closePrompt}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {needRefresh ? 'Later' : 'Dismiss'}
        </button>
      </div>
    </div>
  )
}
