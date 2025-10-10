import { ChevronLeft, CreditCard, FileText, Home, ScanQrCode, UserRound } from "lucide-react"
import { Link } from "react-router-dom"
import "aos/dist/aos.css";
import wa from '@/images/wa.png'

const HelpCenter = () => {
  const handleRedirect = () => {
    const text = "Halo, saya mengalami kendala saat menggunakan layanan STIQR. Mohon bantuannya untuk menyelesaikan masalah ini. Terima kasih.";
    const url = `https://wa.me/6282118383415?text=${text}`
    window.open(url, "_blank"); // Buka di tab baru
  }
  return (
    <div className='w-full flex flex-col min-h-screen items-center'>
      <div className='w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400'>
        <Link to={'/profile'} className='absolute left-5 bg-transparent hover:bg-transparent'>
          <ChevronLeft className='scale-[1.3] text-white' />
        </Link>

        <p data-aos="zoom-in" className='font-semibold m-auto text-xl text-white text-center'>Pusat Bantuan</p>
      </div>

      <div className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
        <Link to={'/dashboard'} className="flex gap-3 flex-col items-center">
          <Home />

          <p className="uppercase">Home</p>
        </Link>

        <Link to={'/qr-code'} className="flex gap-3 flex-col items-center">
          <ScanQrCode />

          <p className="uppercase">Qr Code</p>
        </Link>

        <Link to={'/settlement'} className="flex relative gap-3 flex-col items-center">
          <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
            <CreditCard />
          </div>

          <p className="uppercase">Penarikan</p>
        </Link>

        <Link to={'/catalog'} className="flex gap-3 flex-col items-center">
          <FileText />

          <p className="uppercase">Catalog</p>
        </Link>

        <Link to={'/profile'} className="flex gap-3 flex-col text-orange-400 items-center">
          <UserRound />

          <p className="uppercase">Profile</p>
        </Link>
      </div>

      <div className={` bg-white w-[90%] p-5 rounded-lg shadow-lg mt-5 -translate-y-20`}>
        <p>Apabila terdapat kendala bisa hubungi tim STIQR melalui nomor berikut</p>
        <div onClick={handleRedirect} className="flex flex-row gap-3 md:w-1/5  cursor-pointer hover:bg-orange-500 hover:text-white transition duration-300 ease-in-out rounded-md p-2 outline outline-orange-500 mt-5 items-center outline-1">
          <img src={wa} className="w-8 h-8" />
          <p >Whatsapp</p>
        </div>
      </div>
    </div >

  )
}

export default HelpCenter
