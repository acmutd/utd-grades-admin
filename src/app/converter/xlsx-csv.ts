import { Workbook } from "exceljs";

export async function xlsxToCsv(xlsxBuffer: Buffer) {
  const workbook = new Workbook();
  await workbook.xlsx.load(xlsxBuffer);
  const worksheet = workbook.getWorksheet("GradeDist")!;
  worksheet!.getCell("B1").value = "Catalog Nbr";
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber == 1) return;
    ["W", "X", "Y", "Z", "AA"].forEach((rowIndex) => {
      if (row.getCell(rowIndex) === null) {
        row.getCell(rowIndex).value = " ";
      }
  })
  })
  const countNumDelimiter = (row: string): number => {
    let numComma = 0, stackCounter = 0; 
    for (let i = 0; i < row.length; i++) {
      if (row.charAt(i) == '"') {
        if (stackCounter % 2 == 0) stackCounter++;
        else stackCounter--;
      }
      else if (row.charAt(i) == ",") {
        if (stackCounter == 0) numComma++;
      }
    }
    return numComma;
  }
  const newBuf = Buffer.from(await workbook.csv.writeBuffer()).toString().split("\n").map((row, idx) => {
    if (idx === 0) return row;
    let numComma = countNumDelimiter(row);
    while (numComma < 26) {
      row = row + ","
      numComma++;
    }
    return row;
  }).join("\n");
  return Buffer.from(newBuf);
}