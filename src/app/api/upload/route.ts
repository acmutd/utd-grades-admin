import { xlsxToCsv } from '@/app/converter/xlsx-csv';
import { uploadFileToRepo } from '@/app/git/utils';
import { Octokit } from '@octokit/rest';
import { NextResponse } from 'next/server';

interface ReqBodyType {
  buffer: string;
  semester: string;
  year: number;
}

export async function POST(req: Request) {
  try {
    const octo = new Octokit({
      auth: process.env.PERSONAL_ACCESS_TOKEN,
    });
    const body: ReqBodyType = await req.json();
    const xlsxBuffer = Buffer.from(body.buffer, 'base64');
    const csvBuffer = await xlsxToCsv(xlsxBuffer);
    const fileNameWithoutExtension = [body.semester, body.year.toString()].join(" ");
    const branchName = [body.semester, body.year.toString()].join("");
    await uploadFileToRepo(octo, {
        organization: process.env.REPO_ORGANIZATION!,
        repo: process.env.REPO_REPO!,
    }, {
      commitMessage: `feat: added grade distribution for ${body.semester} ${body.year}`,
      fileBuf: csvBuffer,
      filePath: `raw_data/${fileNameWithoutExtension}.csv`, 
      branchName
    })
    return NextResponse.json({ msg: "File added successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}