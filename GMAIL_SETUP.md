# Gmail SMTP 연체 알림 시스템 설정 가이드

## 🚀 시스템 개요

이 시스템은 도서관의 연체된 도서에 대해 사용자의 회사 이메일(`company_email`)로 자동 알림을 보내는 기능입니다.

**테스트 모드**: 현재 `sanggeon.oh@gehealthcare.com`로만 발송되도록 설정되어 있습니다.

## ⚙️ Gmail SMTP 설정 방법

### 1. Gmail 앱 비밀번호 생성

1. **Google 계정 설정** 접속

   - [https://myaccount.google.com/](https://myaccount.google.com/) 방문
   - 도서관 Gmail 계정으로 로그인

2. **2단계 인증 활성화**

   - 좌측 메뉴에서 `보안` 클릭
   - `2단계 인증`을 활성화 (필수)

3. **앱 비밀번호 생성**
   - `보안` > `앱 비밀번호` 클릭
   - `앱 선택` > `메일` 선택
   - `기기 선택` > `기타(맞춤 이름)` 선택
   - 이름: `GEUK Library System` 입력
   - `생성` 버튼 클릭
   - **생성된 16자리 비밀번호를 복사해 둡니다**

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Gmail SMTP 설정
EMAIL_USER=your_gmail_account@gmail.com
EMAIL_PASSWORD=your_16_digit_app_password_here

# 기타 기존 환경 변수들...
MONGODB_URI=your_mongodb_uri
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**중요**: `EMAIL_PASSWORD`에는 Gmail 계정의 일반 비밀번호가 아닌, 위에서 생성한 16자리 앱 비밀번호를 입력해야 합니다.

## 📧 이메일 발송 방법

### 관리자 페이지에서 수동 발송

1. 관리자 권한으로 로그인
2. `/admin` 페이지 접속
3. "빠른 작업" 섹션에서 **"연체 알림 발송"** 버튼 클릭
4. 확인 대화상자에서 `확인` 클릭
5. 발송 완료 메시지 확인

### 발송 과정

1. **연체 도서 확인**: 시스템이 자동으로 연체된 도서를 검색
2. **사용자 정보 조회**: 연체 사용자의 `company_email` 정보 수집
3. **이메일 발송**: Gmail SMTP를 통해 개별 발송 (2초 간격)
4. **결과 보고**: 성공/실패 건수 리포트

## 🧪 테스트 모드

현재 시스템은 **테스트 모드**로 설정되어 있습니다:

- 모든 이메일이 `sanggeon.oh@gehealthcare.com`으로 발송됩니다
- 실제 사용자의 `company_email`로는 발송되지 않습니다
- 테스트 완료 후 실제 운영 모드로 전환 가능합니다

### 실제 운영 모드로 전환하기

`app/api/admin/send-overdue-emails/route.ts` 파일에서:

```typescript
// 현재 (테스트 모드)
const recipientEmail = testMode
  ? "sanggeon.oh@gehealthcare.com"
  : user.company_email;

// 실제 운영 시 변경
const recipientEmail = user.company_email;
```

## 📋 이메일 템플릿 내용

발송되는 이메일에는 다음 정보가 포함됩니다:

- **연체 사용자 실명**
- **도서 정보** (번호, 제목, 저자)
- **대여일 및 반납 예정일**
- **연체 일수**
- **안내사항 및 주의사항**

## 🔍 문제 해결

### 1. "Gmail SMTP 연결 실패" 오류

**원인**: 잘못된 이메일 계정 정보 또는 앱 비밀번호

**해결방법**:

- `.env.local` 파일의 `EMAIL_USER`와 `EMAIL_PASSWORD` 확인
- Gmail 앱 비밀번호가 올바르게 입력되었는지 확인
- 2단계 인증이 활성화되어 있는지 확인

### 2. "연체된 도서가 없습니다" 메시지

**원인**: 실제로 연체된 도서가 없는 상태

**확인방법**:

- 관리자 페이지에서 연체 도서 통계 확인
- 테스트를 위해 임시로 도서의 반납 예정일을 과거로 설정

### 3. 이메일이 스팸함으로 분류

**원인**: Gmail SMTP의 대량 발송 제한

**해결방법**:

- 발송 간격이 2초로 설정되어 있는지 확인
- 일일 발송량이 Gmail 제한(500건)을 초과하지 않도록 관리
- 필요시 다른 이메일 서비스 고려 (SendGrid, AWS SES 등)

## 🚦 발송 제한사항

### Gmail SMTP 제한

- **일일 발송 한도**: 500건
- **분당 발송 한도**: 약 100건
- **시스템 설정**: 2초 간격으로 순차 발송

### 현재 구현 사항

- 연체 도서별로 개별 이메일 발송
- 발송 실패 시 에러 로깅 및 계속 진행
- 발송 완료 후 상세한 결과 리포트 제공

## 📞 지원

문제가 발생하거나 추가 설정이 필요한 경우:

1. **로그 확인**: 브라우저 개발자 도구 콘솔 확인
2. **환경 변수**: `.env.local` 파일 설정 재확인
3. **Gmail 설정**: 앱 비밀번호 재생성 시도

---

✅ **설정 완료 후 테스트를 통해 정상 작동을 확인하세요!**
