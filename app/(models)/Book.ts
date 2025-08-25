import mongoose, { Schema } from "mongoose";

export interface IBook extends mongoose.Document {
  manage_id: string;
  title: string;
  author: string;
  img_url: string;
  reg_date: Date;
  comments: string;
  rental_info: {
    rent_available: boolean;
    rent_date: Date | null;
    expected_return_date: Date | null;
    return_date: Date | null;
    user_name: string;
    user_email: string;
  };
}

export interface IBookInternal {
  manage_id: string;
  title: string;
  author: string;
  img_url: string;
  reg_date: Date;
  comments: string;
  rental_info: {
    rent_available: boolean;
    rent_date: Date | null;
    expected_return_date: Date | null;
    return_date: Date | null;
    user_name: string;
    user_email: string;
  };
}

// mongoose 연결 확인 및 설정
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODB_URI!);
}
mongoose.Promise = global.Promise;

const bookSchema = new Schema(
  {
    manage_id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    img_url: { type: String, required: false, default: "" },
    reg_date: { type: Date, required: true, default: null },
    comments: { type: String, required: false, default: "" },
    rental_info: {
      rent_available: { type: Boolean, required: false, default: true },
      rent_date: { type: Date, required: false, default: null },
      expected_return_date: { type: Date, required: false, default: null },
      return_date: { type: Date, required: false, default: null },
      user_name: { type: String, required: false, default: "" },
      user_email: { type: String, required: false, default: "" },
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 추가
    // 가상 필드 추가 (대여 상태 확인용)
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 가상 필드: 대여 상태 확인
bookSchema.virtual("isRented").get(function () {
  return !this.rental_info.rent_available;
});

// 가상 필드: 연체 상태 확인
bookSchema.virtual("isOverdue").get(function () {
  if (
    !this.rental_info.expected_return_date ||
    this.rental_info.rent_available
  ) {
    return false;
  }
  return new Date() > this.rental_info.expected_return_date;
});

// 가상 필드: 반납 완료 상태 확인
bookSchema.virtual("isReturned").get(function () {
  return (
    this.rental_info.rent_available && this.rental_info.return_date !== null
  );
});

const Book = mongoose.models.Book || mongoose.model("Book", bookSchema);
export default Book;
