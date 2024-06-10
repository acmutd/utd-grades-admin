import { xlsxToCsv } from '@/app/converter/xlsx-csv';
import { uploadToRepo } from '@/app/git/utils';
import { Octokit } from '@octokit/rest';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const octo = new Octokit({
      auth: process.env.PERSONAL_ACCESS_TOKEN,
    });
    const body = await req.json();
    const xlsxBuffer = Buffer.from(body.buffer, 'base64');
    const csvBuffer = await xlsxToCsv(xlsxBuffer);
    await uploadToRepo(octo, csvBuffer, "test file.csv", "fall2023", {
      organization: process.env.REPO_ORGANIZATION!,
      repo: process.env.REPO_REPO!,
    })
    return NextResponse.json({ msg: "File added successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}