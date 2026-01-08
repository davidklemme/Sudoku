import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="z-10 max-w-2xl w-full items-center justify-center text-center">
        <div className="mb-6 text-8xl">🎓</div>

        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-800">
          RnS SuDoCoach
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Learn Sudoku with your personal coach!
        </p>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-700">
            Choose Your Challenge
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-100 rounded-2xl p-4 border-2 border-green-200">
              <div className="text-4xl mb-2">🌟</div>
              <div className="font-bold text-lg text-green-700">4×4</div>
              <div className="text-sm text-green-600">Starter</div>
            </div>
            <div className="bg-yellow-100 rounded-2xl p-4 border-2 border-yellow-200">
              <div className="text-4xl mb-2">⭐</div>
              <div className="font-bold text-lg text-yellow-700">6×6</div>
              <div className="text-sm text-yellow-600">Growing</div>
            </div>
            <div className="bg-purple-100 rounded-2xl p-4 border-2 border-purple-200">
              <div className="text-4xl mb-2">🏆</div>
              <div className="font-bold text-lg text-purple-700">9×9</div>
              <div className="text-sm text-purple-600">Champion</div>
            </div>
          </div>
        </div>

        <Link
          href="/play"
          className="inline-block px-12 py-6 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-2xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
        >
          Start Learning! 🚀
        </Link>

        <div className="mt-8 text-sm text-gray-500">
          <p>Made with ❤️ for Ruben & Sammy</p>
        </div>
      </div>
    </main>
  );
}
