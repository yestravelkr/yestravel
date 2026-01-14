import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                YesTravel Shop
              </h1>
            </div>
            <nav className="flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-gray-900">
                상품
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                여행지
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                이벤트
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">
              특별한 여행을 시작하세요
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              세계 곳곳의 아름다운 여행지와 특별한 경험을 만나보세요
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              여행 상품 보기
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              왜 YesTravel을 선택해야 할까요?
            </h3>
            <p className="text-lg text-gray-600">
              고객님의 완벽한 여행을 위한 모든 것을 준비했습니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">다양한 여행지</h4>
              <p className="text-gray-600">
                전 세계 수많은 여행지에서 당신만의 특별한 추억을 만들어보세요
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">프리미엄 서비스</h4>
              <p className="text-gray-600">
                최고 품질의 서비스와 세심한 케어로 완벽한 여행을 제공합니다
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">안전한 여행</h4>
              <p className="text-gray-600">
                24시간 고객 지원과 완벽한 여행 보험으로 안심하고 떠나세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2024 YesTravel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
