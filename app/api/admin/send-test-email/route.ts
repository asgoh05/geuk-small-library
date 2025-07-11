import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Gmail SMTP 설정
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "geuklibrary@gmail.com",
      pass: process.env.EMAIL_PASSWORD, // Gmail App Password 필요
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
};

// 테스트 이메일 템플릿
const generateTestEmailHtml = () => {
  const currentTime = new Date().toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Seoul",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Malgun Gothic', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; display: inline-block; margin: 10px 0; }
        .info-box { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0891b2; }
        .footer { background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        .test-info { background: #fefce8; border: 1px solid #fde047; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 GEUK 도서관</h1>
          <h2>Gmail SMTP 테스트</h2>
        </div>
        
        <div class="content">
          <div style="text-align: center; margin-bottom: 20px;">
            <span class="success-badge">✅ 테스트 성공!</span>
          </div>
          
          <p>안녕하세요! 👋</p>
          <p>GEUK 도서관 시스템의 Gmail SMTP 설정이 <strong>정상적으로 작동</strong>하고 있습니다.</p>
          
          <div class="test-info">
            <h3>🧪 테스트 정보</h3>
            <p><strong>발송 시간:</strong> ${currentTime}</p>
            <p><strong>발송 서버:</strong> Gmail SMTP (smtp.gmail.com)</p>
            <p><strong>발송 계정:</strong> ${
              process.env.EMAIL_USER || "geuklibrary@gmail.com"
            }</p>
            <p><strong>수신 이메일:</strong> sanggeon.oh@gehealthcare.com</p>
          </div>
          
          <div class="info-box">
            <h3>📋 확인 사항</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Gmail SMTP 연결 ✅</li>
              <li>이메일 발송 기능 ✅</li>
              <li>HTML 템플릿 렌더링 ✅</li>
              <li>환경 변수 설정 ✅</li>
            </ul>
          </div>
          
          <p style="text-align: center; margin: 30px 0; padding: 20px; background: #ecfdf5; border-radius: 8px;">
            <strong>🎉 이제 연체 알림 시스템을 안전하게 사용할 수 있습니다!</strong>
          </p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>다음 단계:</h4>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>연체된 도서가 있는지 확인</li>
              <li>실제 연체 알림 발송 테스트</li>
              <li>필요시 운영 모드로 전환</li>
            </ol>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>GEUK 도서관 시스템</strong></p>
          <p>© Ultrasound Korea, GE Healthcare</p>
          <p style="margin-top: 10px; font-size: 11px;">
            이 이메일은 시스템 테스트용으로 발송되었습니다.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// 테스트 이메일 발송
export async function POST(req: NextRequest) {
  try {
    console.log("=== Gmail SMTP 테스트 이메일 발송 시작 ===");

    const transporter = createTransporter();

    // Gmail SMTP 연결 테스트
    try {
      await transporter.verify();
      console.log("Gmail SMTP 연결 성공 ✅");
    } catch (error) {
      console.error("Gmail SMTP 연결 실패 ❌:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Gmail SMTP 연결에 실패했습니다.",
          details: (error as Error)?.message,
          troubleshooting: {
            steps: [
              "1. .env.local 파일에 EMAIL_USER와 EMAIL_PASSWORD가 올바르게 설정되어 있는지 확인",
              "2. Gmail 계정에서 2단계 인증이 활성화되어 있는지 확인",
              "3. Gmail 앱 비밀번호가 올바르게 생성되고 입력되었는지 확인",
              "4. 방화벽이나 네트워크에서 Gmail SMTP 포트(587)를 차단하지 않는지 확인",
            ],
          },
        },
        { status: 500 }
      );
    }

    // 테스트 이메일 발송
    const testEmailHtml = generateTestEmailHtml();
    const currentTime = new Date().toLocaleString("ko-KR");

    const mailOptions = {
      from: `"GEUK 도서관 시스템" <${
        process.env.EMAIL_USER || "geuklibrary@gmail.com"
      }>`,
      to: "sanggeon.oh@gehealthcare.com",
      subject: `[GEUK 도서관] Gmail SMTP 테스트 성공! - ${currentTime}`,
      html: testEmailHtml,
    };

    console.log("테스트 이메일 발송 중...");
    await transporter.sendMail(mailOptions);

    // 연결 종료
    transporter.close();

    console.log("테스트 이메일 발송 완료 ✅");

    return NextResponse.json({
      success: true,
      message: "Gmail SMTP 테스트 이메일이 성공적으로 발송되었습니다! 📧",
      details: {
        recipient: "sanggeon.oh@gehealthcare.com",
        sent_at: currentTime,
        smtp_server: "Gmail SMTP",
        from_account: process.env.EMAIL_USER || "geuklibrary@gmail.com",
      },
    });
  } catch (error) {
    console.error("테스트 이메일 발송 오류 ❌:", error);
    return NextResponse.json(
      {
        success: false,
        error: "테스트 이메일 발송에 실패했습니다.",
        details: (error as Error)?.message || "Unknown error",
        troubleshooting: {
          common_issues: [
            "Gmail 앱 비밀번호가 잘못된 경우",
            "인터넷 연결 문제",
            "Gmail 계정 보안 설정 문제",
            "환경 변수 설정 오류",
          ],
        },
      },
      { status: 500 }
    );
  }
}
