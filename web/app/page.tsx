import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="z-10 max-w-2xl w-full items-center justify-center text-center">
        <div className="mb-6 text-8xl">🎨</div>

        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
          Sudoku Fun!
        </h1>

        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          Learn number puzzles while having fun! 🧩
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            Pick Your Size! 📏
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-2xl p-4">
              <div className="text-4xl mb-2">🌟</div>
              <div className="font-bold text-lg text-green-800 dark:text-green-200">4×4</div>
              <div className="text-sm text-green-700 dark:text-green-300">Tiny</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-2xl p-4">
              <div className="text-4xl mb-2">😊</div>
              <div className="font-bold text-lg text-yellow-800 dark:text-yellow-200">6×6</div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Medium</div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-2xl p-4">
              <div className="text-4xl mb-2">🔥</div>
              <div className="font-bold text-lg text-purple-800 dark:text-purple-200">9×9</div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Big</div>
            </div>
          </div>
        </div>

        <Link
          href="/play"
          className="inline-block px-12 py-6 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-bold text-2xl transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95"
        >
          Let's Play! 🎮
        </Link>

        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          <p>✨ Colorful numbers ✨ Fun animations ✨ Learn as you play ✨</p>
        </div>
      </div>
    </main>
  )
}
