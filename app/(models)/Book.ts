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
    rent_date: Date;
    return_date: Date;
    user_name: string;
    user_email: string;
  };
}

mongoose.connect(process.env.MONGODB_URI!);
mongoose.Promise = global.Promise;

const bookSchema = new Schema({
  manage_id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  img_url: { type: String, required: false },
  reg_date: { type: Date, required: false },
  comments: { type: String, required: false },
  rental_info: {
    rent_available: Boolean,
    rent_date: Date,
    return_date: Date,
    user_name: String,
    user_email: String,
  },
});

const Book = mongoose.models.Book || mongoose.model("Book", bookSchema);
export default Book;
