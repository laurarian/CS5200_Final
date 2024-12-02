const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-8">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <p>
          &copy; {new Date().getFullYear()} Book Library. Created by Junyu She
        </p>
        <div>
          <a href="#" className="hover:text-gray-400 mx-2">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-gray-400 mx-2">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
