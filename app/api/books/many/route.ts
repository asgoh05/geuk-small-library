import { NextRequest, NextResponse } from "next/server";
import Book, { IBook } from "@/app/(models)/Book";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await Book.insertMany(body);

    return NextResponse.json({ message: "Books Created" }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const deleteQuery = {
      manage_id: {
        $in: body.map((x: IBook) => x.manage_id),
      },
    };
    await Book.deleteMany(deleteQuery);
    await Book.insertMany(body);

    return NextResponse.json({ message: "Books Updated" }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const deleteQuery = {
      manage_id: {
        $in: body.map((x: IBook) => x.manage_id),
      },
    };
    await Book.deleteMany(deleteQuery);

    return NextResponse.json({ message: "Books Deleted" }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}
