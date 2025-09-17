import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen p-md sm:p-lg md:p-xl bg-background text-foreground font-sans">
      <header className="flex items-center justify-between mb-lg">
        <h1 className="text-h3 sm:text-h2 md:text-h1 font-bold tracking-default">디자인 토큰 쇼케이스</h1>
        <ThemeToggle />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div className="space-y-md">
          <h2 className="text-h4 font-bold">색상(Color)</h2>
          <div className="flex items-center gap-md">
            <div className="w-[48px] h-[48px] rounded-lg bg-black" />
            <div className="w-[48px] h-[48px] rounded-lg bg-white border border-gray-300" />
            <div className="w-[48px] h-[48px] rounded-lg bg-blue-500" />
            <div className="w-[48px] h-[48px] rounded-lg bg-green-500" />
            <div className="w-[48px] h-[48px] rounded-lg bg-test-1" />
          </div>
        </div>

        <div className="space-y-md">
          <h2 className="text-h4 font-bold">간격(Spacing)</h2>
          <div className="flex items-center">
            <div className="bg-gray-300 dark:bg-gray-700 h-[8px] w-xs" />
            <div className="bg-gray-300 dark:bg-gray-700 h-[8px] w-sm ml-sm" />
            <div className="bg-gray-300 dark:bg-gray-700 h-[8px] w-md ml-sm" />
            <div className="bg-gray-300 dark:bg-gray-700 h-[8px] w-lg ml-sm" />
          </div>
        </div>

        <div className="space-y-md">
          <h2 className="text-h4 font-bold">모서리(Border Radius)</h2>
          <div className="flex items-center gap-md">
            <div className="w-[64px] h-[40px] bg-blue-500 rounded-sm opacity-low" />
            <div className="w-[64px] h-[40px] bg-blue-500 rounded-lg opacity-md" />
            <div className="w-[64px] h-[40px] bg-blue-500 rounded-xl opacity-high" />
          </div>
        </div>

        <div className="space-y-md">
          <h2 className="text-h4 font-bold">타이포그래피</h2>
          <p className="text-body leading-body tracking-default">본문 바디 16px</p>
          <p className="text-sm leading-body tracking-increased">스몰 + 자간 늘림</p>
          <p className="text-xs leading-body tracking-decreased">엑스스몰 + 자간 줄임</p>
          <p className="font-heading font-headingBold text-h5">헤딩 볼드 h5</p>
        </div>
      </section>

      <section className="mt-xl space-y-md">
        <h2 className="text-h4 font-bold">버튼 예시</h2>
        <div className="flex flex-wrap gap-sm">
          <button className="px-md py-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition">기본 버튼</button>
          <button className="px-md py-sm rounded-lg bg-green-500 text-white hover:bg-green-600 transition">성공 버튼</button>
          <button className="px-md py-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition">위험 버튼</button>
        </div>
      </section>
    </div>
  );
}
