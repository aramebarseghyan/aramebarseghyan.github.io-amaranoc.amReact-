import {
  FiPhone,
  FiMail,
  FiInstagram,
  FiFacebook,
  FiMapPin,
} from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="w-full min-h-[450px] bg-[#0c121e] text-white font-sans flex flex-col items-center pt-16 z-0">
      <h2 className="text-[28px] md:text-[34px] font-bold tracking-[1px] whitespace-nowrap mb-10 md:mb-16">
        ԿՈՆՏԱԿՏՆԵՐ
      </h2>

      <div className="w-[90%] max-w-[1200px] flex flex-col md:flex-row flex-wrap justify-center lg:justify-between items-center gap-5 md:gap-8 mb-12">
        <div className="flex items-center gap-2.5 text-[13px] lg:text-[14px] font-medium uppercase">
          <FiPhone className="text-[18px] text-white shrink-0" />
          <span className="whitespace-nowrap">041-611-611 / 044-611</span>
        </div>
        <div className="flex items-center gap-2.5 text-[13px] lg:text-[14px] font-medium uppercase">
          <FiMail className="text-[18px] text-white shrink-0" />
          <span className="whitespace-nowrap">AMARANOC@GMAIL.COM</span>
        </div>
        <div className="flex items-center gap-2.5 text-[13px] lg:text-[14px] font-medium uppercase">
          <FiInstagram className="text-[18px] text-white shrink-0" />
          <span className="whitespace-nowrap">AMARANOC.AM</span>
        </div>
        <div className="flex items-center gap-2.5 text-[13px] lg:text-[14px] font-medium uppercase">
          <FiFacebook className="text-[18px] text-white shrink-0" />
          <span className="whitespace-nowrap">AMARANOC.AM</span>
        </div>
        <div className="flex items-center gap-2.5 text-[13px] lg:text-[14px] font-medium uppercase">
          <FiMapPin className="text-[18px] text-white shrink-0" />
          <span className="whitespace-nowrap">ԹՈՒՄԱՆՅԱՆ 5</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 text-center mb-8">
        <a
          href="#"
          className="text-white underline text-[13px] md:text-[14px] transition-colors duration-300 hover:text-[#f7941d]"
        >
          Գաղտնիության քաղաքականություն
        </a>
        <p className="text-[12px] md:text-[13px] text-[#d1d5db]">
          Ամարանոց ՍՊԸ | Amaranoc LLC | Амараноц ООО
        </p>
      </div>

      <div
        className="w-full h-[150px] sm:h-[200px] mt-auto bg-cover bg-bottom bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://amaranoc.am/_next/image?url=%2Fimages%2Ffooter%2Ffooter-background.png&w=1920&q=75')",
        }}
      ></div>

      <div className="fixed right-0 top-[60%] -translate-y-1/2 w-[40px] md:w-[50px] bg-[#fca34d] rounded-l-[12px] z-[100] shadow-[-4px_4px_15px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center gap-6 py-4">
        <a
          href="tel:041611611"
          className="text-white text-[18px] md:text-[22px] transition-transform duration-200 hover:scale-[1.15]"
        >
          <FiPhone />
        </a>
        <a
          href="mailto:AMARANOC.INFO@GMAIL.COM"
          className="text-white text-[18px] md:text-[22px] transition-transform duration-200 hover:scale-[1.15]"
        >
          <FiMail />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
