/**
 * 알림톡 템플릿 정의
 * 카카오 비즈니스에 등록된 템플릿과 동일해야 함
 */

export enum AlrimtalkTemplateType {
  VerificationCode = 'VerificationCode',
  OrderPurchase = 'OrderPurchase',
  VbankRequest = 'VbankRequest',
}

interface AlrimtalkButton {
  type: string;
  url: string;
  name: string;
}

export interface ITemplateForm {
  code: string;
  title: string;
  message: string;
  buttonJson?: AlrimtalkButton[];
}

export const AlrimtalkTemplate: Record<AlrimtalkTemplateType, ITemplateForm> = {
  [AlrimtalkTemplateType.VerificationCode]: {
    code: 'verify_code',
    title: '[예스트래블] 인증번호',
    message: `[예스트래블] 인증번호는 [#{인증번호}]입니다.
3분 내에 입력해주세요.`,
    buttonJson: [],
  },
  [AlrimtalkTemplateType.OrderPurchase]: {
    code: 'order_confirm',
    title: '[예스트래블] 결제완료',
    message: `[결제완료]
#{고객}님의 상품이 결제되었어요.

- 상품명: #{상품명}
- 주문번호: #{주문번호}
- 결제금액: #{결제금액}원`,
    buttonJson: [
      {
        type: '웹링크',
        name: '주문조회',
        url: '/order/detail/#{주문번호}?secret=#{주문비밀번호}',
      },
    ],
  },
  [AlrimtalkTemplateType.VbankRequest]: {
    code: 'order_vbank',
    title: '[예스트래블] 입금요청',
    message: `[입금요청]
#{상품명}의 결제완료를 위해 #{입금일시}까지 입금해주세요.

- 은행명: #{은행명}
- 계좌번호: #{계좌번호}
- 입금액: #{결제금액}원
- 상품명: #{상품명}
- 주문번호: #{주문번호}

※ 기한 내 미입금시 주문이 취소됩니다.
※ 입금 후 반영까지 10분정도 소요될 수 있습니다.`,
    buttonJson: [
      {
        type: '웹링크',
        name: '주문조회',
        url: '/order/detail/#{주문번호}?secret=#{주문비밀번호}',
      },
    ],
  },
};
