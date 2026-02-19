function App() {
  const wallet = '0x0000...'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100/50 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent">
            🧵 ThreadHunt
          </h1>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">ETHDenver 2026</span>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              0
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-purple-100 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Bounties</h3>
            <p className="text-3xl font-black text-purple-600 mt-2">47</p>
          </div>
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-pink-100 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Prize Pool</h3>
            <p className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mt-2">₿ 2.5</p>
          </div>
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-indigo-100 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Your Score</h3>
            <p className="text-3xl font-black text-indigo-600 mt-2">1,247</p>
          </div>
        </div>

        {/* Bounty Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            🎯 Active Bounties
            <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">+12 new</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bounty Card 1 */}
            <div className="group bg-white/80 backdrop-blur-md hover:bg-white transition-all duration-300 border border-purple-100 hover:border-purple-300 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Closes in 3d</p>
                  <p className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">0.25 ₿</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">Build Twitter thread analyzer using Chainlink oracles</h3>
              <p className="text-gray-600 mb-6 line-clamp-3">Create AI-powered sentiment analysis for ETHDenver threads with real-time oracle price feeds</p>
              <div className="flex items-center space-x-2 text-sm text-purple-600 font-semibold">
                <span>🐲 Dragon 🥈</span>
                <span className="px-2 py-1 bg-purple-100 rounded-full text-xs">AI + Oracles</span>
              </div>
            </div>

            {/* Bounty Card 2 */}
            <div className="group bg-white/80 backdrop-blur-md hover:bg-white transition-all duration-300 border border-pink-100 hover:border-pink-300 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">Q</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Closes in 2d</p>
                  <p className="text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">0.5 ₿</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">QuickNode NFT marketplace integration</h3>
              <p className="text-gray-600 mb-6 line-clamp-3">Build bounty-gated NFT drops for ETHDenver winners with live metadata API</p>
              <div className="flex items-center space-x-2 text-sm text-pink-600 font-semibold">
                <span>⚡ QuickNode 🥇</span>
                <span className="px-2 py-1 bg-pink-100 rounded-full text-xs">NFTs</span>
              </div>
            </div>

            {/* Bounty Card 3 */}
            <div className="group bg-white/80 backdrop-blur-md hover:bg-white transition-all duration-300 border border-indigo-100 hover:border-indigo-300 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">U</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Closes in 5d</p>
                  <p className="text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">0.1 ₿</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">Universal Profile bounty submission portal</h3>
              <p className="text-gray-600 mb-6 line-clamp-3">Gasless profile management + bounty claim system using ERC-7579 standard</p>
              <div className="flex items-center space-x-2 text-sm text-indigo-600 font-semibold">
                <span>🆙 Universal 🥉</span>
                <span className="px-2 py-1 bg-indigo-100 rounded-full text-xs">Accounts</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
