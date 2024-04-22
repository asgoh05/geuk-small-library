import { NextRequest, NextResponse } from "next/server";
import Book from "@/app/(models)/Book";

interface InsertBook {
  manage_id: String;
  title: String;
  author: String;
  reg_date: Date;
  comments: String;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const books = body as Array<InsertBook>;

    books.forEach(async (book) => {
      const exist = await Book.findOne({ manage_id: book.manage_id });

      if (exist === null) {
        const insertData = {
          manage_id: book.manage_id,
          title: book.title,
          author: book.author,
          img_url: "",
          reg_date: book.reg_date,
          comments: book.comments,
          rental_info: {
            rent_available: true,
            rent_date: null,
            return_date: null,
            user_name: "",
            user_email: "",
          },
        };
        await Book.create(insertData);
      } else {
        exist.manage_id = book.manage_id;
        exist.title = book.title;
        exist.author = book.author;
        exist.reg_date = book.reg_date;
        exist.comments = book.comments;
        await exist.save();
      }
    });

    // (body as ExcelBulkData).rows.forEach(async (book) => {
    //   const foundBook = await Book.findOne({ manage_id: book.manage_id });

    // console.log(foundBook);
    // if (foundBook) {
    //   const updateBook = foundBook as IBook;
    //   updateBook.title = book.title;
    //   updateBook.author = book.author;
    //   updateBook.reg_date = book.reg_date;
    //   updateBook.comments = book.comments;
    //   await updateBook.save();
    // } else {
    //   await Book.create({
    //     manage_id: book.manage_id,
    //     title: book.title,
    //     author: book.author,
    //     img_url: "",
    //     reg_date: book.reg_date,
    //     comments: book.comments,
    //     rental_info: {
    //       rent_available: true,
    //       rent_date: null,
    //       expected_return_date: null,
    //       return_date: null,
    //       user_name: "",
    //       user_email: "",
    //     },
    //   });
    // }
    // });

    return NextResponse.json({ message: "All Books Created" }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}
