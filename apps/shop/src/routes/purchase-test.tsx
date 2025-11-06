import type { PaymentRequest } from '@portone/browser-sdk/dist/v2/request/PaymentRequest';
import * as PortOne from '@portone/browser-sdk/v2';
import { createFileRoute } from '@tanstack/react-router';
import axios from 'axios';
import dayjs from 'dayjs';
import { useState } from 'react';

import { API_BASEURL } from '@/constants';

export const Route = createFileRoute('/purchase-test')({
  component: PurchaseTestPage,
});

/**
 * 결제 테스트 페이지
 *
 * Purchase 결제를 테스트하기 위한 페이지입니다.
 */
function PurchaseTestPage() {
  const [selectedMethod, setSelectedMethod] = useState<'CARD' | 'VBANK'>(
    'CARD'
  );
  const [amount, setAmount] = useState(50000);

  // 구매자 정보
  const [customerName, setCustomerName] = useState('홍길동');
  const [customerEmail, setCustomerEmail] = useState('test@example.com');
  const [customerPhone, setCustomerPhone] = useState('01012345678');

  // TODO: API 연동
  const handlePayment = async () => {
    function randomId() {
      return [...crypto.getRandomValues(new Uint32Array(2))]
        .map(word => word.toString(16).padStart(8, '0'))
        .join('');
    }

    try {
      const paymentMethod: PaymentRequest = {
        storeId: 'store-225e8f7c-301b-421e-bd54-189066bbb97e',
        channelKey: 'channel-key-be836e0a-6537-4a86-bf9d-f99211e0be6c', // 테스트 키
        paymentId: randomId(),
        orderName: `Yestravel 테스트결제 - ${amount.toLocaleString()}원`,
        totalAmount: amount,
        currency: 'KRW',
        payMethod: selectedMethod === 'CARD' ? 'CARD' : 'VIRTUAL_ACCOUNT',
        customer: {
          customerId: 'test-customer',
          fullName: customerName,
          email: customerEmail,
          phoneNumber: customerPhone,
        },
      };
      switch (selectedMethod) {
        case 'VBANK':
          paymentMethod.virtualAccount = {
            accountExpiry: {
              dueDate: dayjs().add(1, 'day').endOf('day').toISOString(), // 익일 자정 전까지
            },
          };
          break;
      }
      console.log(paymentMethod);
      const response = await PortOne.requestPayment(paymentMethod);

      console.log(response);
      if (!response || response.code === 'FAILURE_TYPE_PG') {
        alert('결제 실패');
        return;
      }

      // TODO: 결제 완료 API 호출
      console.log('결제 응답:', response);
      paymentComplete(response);
    } catch (error) {
      console.error('결제 오류:', error);
      // alert('결제 중 오류가 발생했습니다.');
    }
  };

  function paymentComplete(paymentResult: unknown) {
    axios.post(`${API_BASEURL}/trpc/shopPayment.complete`, paymentResult, {
      withCredentials: true,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="w-full max-w-md px-4">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">결제 테스트</h1>
        </div>

        {/* 결제 정보 */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* 결제 금액 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              결제 금액
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="금액 입력"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                원
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {amount.toLocaleString()}원
            </p>
          </div>

          {/* 구매자 정보 */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-900">구매자 정보</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="이름 입력"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="이메일 입력"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="01012345678"
              />
            </div>
          </div>

          {/* 결제 수단 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              결제 수단
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedMethod('CARD')}
                className={`py-4 px-4 rounded-lg border-2 transition-colors ${
                  selectedMethod === 'CARD'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                💳 카드 결제
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('VBANK')}
                className={`py-4 px-4 rounded-lg border-2 transition-colors ${
                  selectedMethod === 'VBANK'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                🏦 가상계좌
              </button>
            </div>
          </div>

          {/* 결제 버튼 */}
          <button
            type="button"
            onClick={handlePayment}
            className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {amount.toLocaleString()}원 결제하기
          </button>
        </div>
      </div>
    </div>
  );
}
