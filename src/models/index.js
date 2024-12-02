import BooksCsv from "./BooksCsv";
import BooksMarc from "./BooksMarc";
import BooksOnix from "./BooksOnix";
import CsvIssuesLog from "./CsvIssuesLog";
import MarcIssuesLog from "./MarcIssuesLog";
import OnixIssuesLog from "./OnixIssuesLog";

const models = {
  books_csv: BooksCsv,
  books_marc: BooksMarc,
  books_onix: BooksOnix,
  csvIssuesLog: CsvIssuesLog,
  marcIssuesLog: MarcIssuesLog,
  onixIssuesLog: OnixIssuesLog,
};

export default models;
