import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getDateString } from "@/app/(general)/datetime";
import { getServerSession } from "next-auth";
import LibraryUser from "@/app/(models)/User";

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

// 이메일 템플릿 생성
const generateOverdueEmailHtml = (
  bookData: any,
  userData: any,
  overdueDays: number
) => {
  const rentDate = getDateString(new Date(bookData.rent_date));
  const expectedReturnDate = getDateString(
    new Date(bookData.expected_return_date)
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Malgun Gothic', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0891b2, #0e7490); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .book-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
        .urgent { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .overdue-badge { background: #dc2626; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 GEUK 도서관</h1>
          <h2>도서 연체 알림</h2>
        </div>
        
        <div class="content">
          <p>안녕하세요, <strong>${userData.real_name}</strong>님</p>
          
          <div class="urgent">
            <p><strong>⚠️ 중요 알림</strong></p>
            <p>대여하신 도서가 <span class="overdue-badge">${overdueDays}일 연체</span>되었습니다.</p>
          </div>
          
          <div class="book-info">
            <h3>📖 연체 도서 정보</h3>
            <p><strong>도서번호:</strong> ${bookData.manage_id}</p>
            <p><strong>도서명:</strong> ${bookData.title}</p>
            <p><strong>저자:</strong> ${bookData.author}</p>
            <p><strong>대여일:</strong> ${rentDate}</p>
            <p><strong>반납 예정일:</strong> ${expectedReturnDate}</p>
            <p><strong>연체 일수:</strong> <span style="color: #dc2626; font-weight: bold;">${overdueDays}일</span></p>
          </div>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📌 안내사항</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>가능한 한 빠른 시일 내에 반납해 주시기 바랍니다.</li>
              <li>연체 기간이 길어질 경우 추가 제재가 있을 수 있습니다.</li>
              <li>반납 후에도 연체 기록이 남을 수 있습니다.</li>
              <li>문의사항이 있으시면 도서관 관리자에게 연락해 주세요.</li>
            </ul>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <strong>빠른 반납 부탁드립니다. 🙏</strong>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>GEUK 도서관 시스템</strong></p>
          <p>© Ultrasound Korea, GE Healthcare</p>
          <p style="margin-top: 10px; font-size: 11px;">
            이 이메일은 자동으로 발송되었습니다. 회신하지 마세요.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// 연체 알림 이메일 발송
export async function POST(req: NextRequest) {
  try {
    console.log("=== 연체 알림 이메일 발송 시작 ===");

    const { overdueBooks, testMode = true } = await req.json();

    if (!overdueBooks || overdueBooks.length === 0) {
      return NextResponse.json({
        success: false,
        message: "발송할 연체 도서가 없습니다.",
      });
    }

    // 테스트 모드일 때 사용할 관리자 이메일 조회
    let testRecipientEmail = "sanggeon.oh@gehealthcare.com"; // 기본값
    if (testMode) {
      try {
        const session = await getServerSession();
        if (session?.user?.email) {
          const adminUser = await LibraryUser.findOne({
            email: session.user.email,
          });
          if (adminUser?.company_email) {
            testRecipientEmail = adminUser.company_email;
            console.log(
              `테스트 발송 대상: ${testRecipientEmail} (로그인 관리자)`
            );
          } else {
            console.log(
              `관리자의 company_email이 없어 기본값 사용: ${testRecipientEmail}`
            );
          }
        }
      } catch (error) {
        console.warn("관리자 이메일 조회 실패, 기본값 사용:", error);
      }
    }

    const transporter = createTransporter();

    // 이메일 인증 테스트
    try {
      await transporter.verify();
      console.log("Gmail SMTP 연결 성공");
    } catch (error) {
      console.error("Gmail SMTP 연결 실패:", error);
      return NextResponse.json(
        {
          success: false,
          error: "이메일 서버 연결에 실패했습니다. Gmail 설정을 확인해주세요.",
          details: (error as Error)?.message,
        },
        { status: 500 }
      );
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    console.log(`${overdueBooks.length}건의 연체 알림 발송 시작`);

    // 순차적으로 이메일 발송
    for (let i = 0; i < overdueBooks.length; i++) {
      const item = overdueBooks[i];
      const { book, user, overdue_days } = item;

      try {
        // 테스트 모드일 때는 로그인된 관리자의 이메일로 발송
        // 운영 모드일 때는 company_email이 있으면 사용하고, 없으면 개인 이메일 사용
        const recipientEmail = testMode
          ? testRecipientEmail
          : user.company_email || user.email;

        const emailHtml = generateOverdueEmailHtml(book, user, overdue_days);

        const mailOptions = {
          from: `"GEUK 도서관" <${
            process.env.EMAIL_USER || "geuklibrary@gmail.com"
          }>`,
          to: recipientEmail,
          subject: `[GEUK 도서관] 도서 연체 알림 - ${book.title} (${overdue_days}일 연체)`,
          html: emailHtml,
        };

        await transporter.sendMail(mailOptions);

        results.push({
          user_name: user.real_name,
          book_title: book.title,
          email: recipientEmail,
          status: "success",
          overdue_days: overdue_days,
        });

        successCount++;
        console.log(
          `${i + 1}/${overdueBooks.length} 발송 완료: ${user.real_name} (${
            book.title
          }) -> ${recipientEmail}`
        );

        // Gmail 제한을 고려한 지연 (마지막이 아닌 경우)
        if (i < overdueBooks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기
        }
      } catch (error) {
        console.error(`이메일 발송 실패: ${user.real_name}`, error);

        results.push({
          user_name: user.real_name,
          book_title: book.title,
          email: user.company_email,
          status: "failed",
          error: (error as Error)?.message,
          overdue_days: overdue_days,
        });

        failCount++;
      }
    }

    // 연결 종료
    transporter.close();

    console.log(
      `연체 알림 발송 완료: 성공 ${successCount}건, 실패 ${failCount}건`
    );

    return NextResponse.json({
      success: true,
      message: `연체 알림 발송 완료: 성공 ${successCount}건, 실패 ${failCount}건`,
      total: overdueBooks.length,
      success_count: successCount,
      fail_count: failCount,
      test_mode: testMode,
      results: results,
    });
  } catch (error) {
    console.error("이메일 발송 시스템 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "이메일 발송 시스템에 오류가 발생했습니다.",
        details: (error as Error)?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
