const MapsData = () => {
  return (
    <div className="flex items-center gap-[15px] mt-[20px]">
      <div className="font-sans flex items-center border border-black w-[110px] h-[40px] rounded-[22px] cursor-pointer px-[15px] justify-between">
        <span className="ml-[8px]">Քարտեզ</span>
        <img
          src="https://png.pngtree.com/png-vector/20190409/ourmid/pngtree-map-icon-vector-illustration-in-line-style-for-any-purpose-png-image_924190.jpg"
          alt="map"
          className="w-[25px] h-[25px]"
        />
      </div>
      <div className="flex items-center justify-center border border-black w-[44px] h-[40px] rounded-[22px] cursor-pointer">
        <img
          className="w-[25px] h-[25px]"
          src="https://media.istockphoto.com/id/1212381977/vector/simple-flat-design-calendar-icon.jpg?s=612x612&w=0&k=20&c=lkzyW-wiFd-uHLJ9tRkLYzWA5joCCuJ4d_tifuHdANs="
          alt="calendar"
        />
      </div>
    </div>
  );
};

export default MapsData;
