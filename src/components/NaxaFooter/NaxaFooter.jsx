const NaxaFooter = () => {
  return (
    <div
      className="w-full min-h-[600px] mt-[100px] bg-cover bg-center flex items-center justify-center px-4 py-10"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format&fit=crop')",
      }}
    >
      <div className="w-full max-w-[1000px] min-h-[300px] bg-[rgba(30,40,35,0.5)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.15)] rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center p-6 md:p-10 gap-6 md:gap-8">
        <h1 className="text-white text-[20px] sm:text-[26px] md:text-[32px] w-full text-center flex items-center justify-center gap-3 sm:gap-6 before:content-[''] before:h-[2px] before:w-[40px] sm:before:w-[80px] md:before:w-[120px] before:bg-white after:content-[''] after:h-[2px] after:w-[40px] sm:after:w-[80px] md:after:w-[120px] after:bg-white">
          ՏԵՂԱԴՐԵԼ ՀԱՅՏԱՐԱՐՈՒԹՅՈՒՆ
        </h1>

        <p className="text-white text-[14px] md:text-[15px] w-full text-center">
          Մուտքագրեք Ձեր տվյալները նշված դաշտերում և մենք կկապնվենք Ձեզ հետ
        </p>

        <div className="w-full flex flex-col md:flex-row items-center gap-4 mt-2">
          <input
            placeholder="Անուն Ազգանուն"
            type="text"
            className="w-full md:flex-1 h-[50px] bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.3)] rounded-[8px] px-[15px] text-white text-[14px] outline-none transition-all duration-300 placeholder-[rgba(255,255,255,0.6)] focus:border-white focus:bg-[rgba(0,0,0,0.5)]"
          />
          <input
            placeholder="Հեռախոսահամար"
            type="text"
            className="w-full md:flex-1 h-[50px] bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.3)] rounded-[8px] px-[15px] text-white text-[14px] outline-none transition-all duration-300 placeholder-[rgba(255,255,255,0.6)] focus:border-white focus:bg-[rgba(0,0,0,0.5)]"
          />
          <input
            placeholder="Էլ հասցե"
            type="text"
            className="w-full md:flex-1 h-[50px] bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.3)] rounded-[8px] px-[15px] text-white text-[14px] outline-none transition-all duration-300 placeholder-[rgba(255,255,255,0.6)] focus:border-white focus:bg-[rgba(0,0,0,0.5)]"
          />
          <button className="w-full md:w-[180px] lg:w-[22%] h-[50px] bg-[#f7941d] text-white border-none rounded-[25px] text-[16px] font-bold cursor-pointer transition-all duration-300 hover:bg-[#e08316] shrink-0">
            Ուղարկել
          </button>
        </div>
      </div>
    </div>
  );
};

export default NaxaFooter;
