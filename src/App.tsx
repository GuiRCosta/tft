import './App.css';

function App() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-[#f0e6d2] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#c8aa6e] mb-4">
          TFT Companion Overlay
        </h1>
        <p className="text-[#a09b8c] text-lg">
          Aguardando League Client...
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <div className="px-4 py-2 rounded-lg bg-[#1a1a25] border border-[#463714] text-sm">
            Status: Desconectado
          </div>
          <div className="px-4 py-2 rounded-lg bg-[#1a1a25] border border-[#463714] text-sm">
            v0.1.0
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
