import mongoose, { Schema } from "mongoose";

export interface IUser {
  _id?: string;
  real_name: string; // 실명 (한글)
  email: string;
  company_email: string; // 회사 이메일 (@gehealthcare.com)
  google_id: string;
  registered_at: Date;
  banned: boolean; // 강제 탈퇴 여부
  admin: boolean; // 관리자 권한 여부
}

export interface IUserInternal {
  real_name: string;
  email: string;
  company_email: string;
  google_id: string;
  registered_at: Date;
  banned: boolean;
  admin: boolean;
}

// mongoose 연결 확인 및 설정
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODB_URI!);
}
mongoose.Promise = global.Promise;

const userSchema = new Schema({
  real_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  company_email: { type: String, required: true },
  google_id: { type: String, required: true, unique: true },
  registered_at: { type: Date, required: true, default: Date.now },
  banned: { type: Boolean, default: false }, // 강제탈퇴 상태
  admin: { type: Boolean, default: false }, // 관리자 권한
});

const LibraryUser =
  mongoose.models.LibraryUser || mongoose.model("LibraryUser", userSchema);
export default LibraryUser;
