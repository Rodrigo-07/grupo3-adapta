function Home() {
  return (
    <div className="min-h-screen text-gray-900">
      <header className="max-w-7xl mx-auto px-6 py-24 flex justify-center items-center">
        <h1 className="text-5xl font-bold">⚡️ MyApp</h1>
      </header>

      <main className="flex flex-col items-center justify-center text-center px-6 pb-24">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Build Fast. Launch Faster.
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          A modern starter template using React, Vite, and Tailwind to help you ship faster than ever.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#"
            className="inline-block px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Get Started
          </a>
          <a
            href="#"
            className="inline-block px-6 py-3 bg-white text-sm font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Learn More
          </a>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-500 py-8">
        © 2025 MyApp. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;
