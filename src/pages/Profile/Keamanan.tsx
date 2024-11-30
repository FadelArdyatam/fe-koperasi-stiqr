import { ChevronLeft } from "lucide-react"
import { Link } from "react-router-dom"

const Keamanan = () => {
    return (
        <div className='w-full flex flex-col min-h-screen items-center'>
            <div className='w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400'>
                <Link to={'/profile'} className='absolute left-5 bg-transparent hover:bg-transparent'>
                    <ChevronLeft className='scale-[1.3] text-white' />
                </Link>

                <p className='font-semibold m-auto text-xl text-white text-center'>Keamanan</p>
            </div>
        </div>
    )
}

export default Keamanan