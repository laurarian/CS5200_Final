import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center">
            <img
              src="/favicon.svg"
              alt="Book Library Icon"
              className="h-8 w-8 mr-2"
            />
            <Link href="/">Book Library</Link>
          </h1>
        </div>

        <div className="flex-2 flex justify-center text-xl font-bold">
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="hover:text-gray-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-gray-300 mx-10">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/all-books" className="hover:text-gray-300">
                  All Books
                </Link>
              </li>
              <li>
                <Link href="/add" className="hover:text-gray-300 mx-10">
                  Add Book
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex-1"></div>
      </div>
    </header>
  );
};

export default Header;
