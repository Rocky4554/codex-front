import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-sans antialiased selection:bg-emerald-500 selection:text-white">

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
              <span className="material-symbols-outlined text-[20px]">code</span>
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">Codex</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" href="/problems">Problems</Link>
            <Link className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" href="#">Contests</Link>
            <Link className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" href="#">Discuss</Link>
            <Link className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" href="#">Pricing</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="hidden sm:flex text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all">
                Log In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-500/90 font-bold transition-all">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32">
          {/* Background Gradients */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 -mr-40 -mt-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 -ml-40 -mb-40 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[100px]"></div>
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">

              <div className="flex flex-col gap-6 text-left">
                <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500 w-fit">
                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  New: System Design Course
                </div>
                <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Master Coding <br />
                  <span className="text-emerald-500">Interviews</span>
                </h1>
                <p className="max-w-xl text-lg text-zinc-400 leading-relaxed">
                  Join the premier community for developers. Practice curated problems, compete in weekly contests, and land your dream job at top tech companies.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/problems">
                    <Button size="lg" className="bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-500/90 transition-all hover:scale-105 font-bold px-8">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/problems">
                    <Button size="lg" variant="outline" className="border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800 transition-all font-medium px-8">
                      View Problems
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-4 pt-4 text-sm text-zinc-400">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full border-2 border-zinc-950 bg-gray-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <div className="h-8 w-8 rounded-full border-2 border-zinc-950 bg-gray-500 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <div className="h-8 w-8 rounded-full border-2 border-zinc-950 bg-gray-400 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                  </div>
                  <p>Joined by 10,000+ developers</p>
                </div>
              </div>

              <div className="relative lg:h-auto lg:w-full">
                {/* Abstract Code visual */}
                <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl overflow-hidden aspect-video lg:aspect-square">
                  <div className="absolute top-0 left-0 w-full h-10 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="p-6 pt-16 font-mono text-sm text-zinc-400 space-y-2 opacity-80">
                    <div className="flex"><span className="text-emerald-500 mr-2">def</span> <span className="text-yellow-300">solve_problem</span>(input):</div>
                    <div className="pl-4 text-gray-400"># Optimized solution O(n)</div>
                    <div className="pl-4"><span className="text-purple-400">if</span> not input:</div>
                    <div className="pl-8"><span className="text-purple-400">return</span> 0</div>
                    <div className="pl-4">result = []</div>
                    <div className="pl-4"><span className="text-purple-400">for</span> item <span className="text-purple-400">in</span> input:</div>
                    <div className="pl-8">current = process(item)</div>
                    <div className="pl-8">result.append(current)</div>
                    <div className="pl-4"><span className="text-purple-400">return</span> result</div>
                    <br />
                    <div className="flex text-green-400">&gt; Tests passed (12/12)</div>
                    <div className="flex text-green-400">&gt; Runtime: 42ms (Beats 98%)</div>
                  </div>
                  {/* Floating Card */}
                  <div className="absolute bottom-6 right-6 p-4 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl flex items-center gap-3 animate-bounce duration-[3000ms]">
                    <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Accepted</div>
                      <div className="text-xs text-zinc-400">You beat 92% of users</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-zinc-900/30 border-y border-zinc-800/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 md:text-center max-w-3xl mx-auto">
              <h2 className="text-base font-semibold text-emerald-500 uppercase tracking-wider mb-2">Platform Features</h2>
              <h3 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything you need to excel</h3>
              <p className="mt-4 text-lg text-zinc-400">Designed by engineers for engineers. We provide the tools, environment, and community you need to succeed in your career.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900 p-8 transition-all hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
                  <span className="material-symbols-outlined text-[28px]">format_list_bulleted</span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">Curated Problems</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Access thousands of hand-picked questions from top tech company interviews. Filter by difficulty, topic, or company tags.
                </p>
              </div>

              <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900 p-8 transition-all hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
                  <span className="material-symbols-outlined text-[28px]">terminal</span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">Real-time Execution</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Run code instantly in our cloud-based IDE with support for 20+ languages including Python, Java, C++, and JavaScript.
                </p>
              </div>

              <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900 p-8 transition-all hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
                  <span className="material-symbols-outlined text-[28px]">emoji_events</span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">Competitive Ranking</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Compete with developers worldwide in weekly contests. Climb the global leaderboard and showcase your skills to recruiters.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-zinc-950 to-zinc-950"></div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 px-6 py-16 text-center shadow-2xl sm:px-12 lg:py-20 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl"></div>
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to start your journey?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
                Join thousands of developers leveling up their skills today. Start for free and upgrade anytime.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-500/90 transition-all hover:-translate-y-0.5 font-bold px-8">
                    Join Now
                  </Button>
                </Link>
                <Link href="/problems">
                  <Button size="lg" variant="outline" className="border-zinc-800 bg-transparent text-white hover:bg-zinc-800 transition-all font-medium px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 bg-zinc-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/20 text-emerald-500">
                <span className="material-symbols-outlined text-[16px]">code</span>
              </div>
              <span className="font-display text-lg font-bold text-white">Codex</span>
            </div>
            <p className="text-sm text-zinc-400">
              © 2024 Codex Platform. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a className="text-zinc-400 hover:text-emerald-500 transition-colors" href="#">
                <span className="sr-only">Twitter</span>
                <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a className="text-zinc-400 hover:text-emerald-500 transition-colors" href="#">
                <span className="sr-only">GitHub</span>
                <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}