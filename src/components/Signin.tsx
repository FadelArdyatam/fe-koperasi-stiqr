import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import logo from '../images/logo.jpg'

const Signin = () => {
  return (
    <div className='p-10 flex flex-col items-center justify-center w-full min-h-screen'>
      	<img src={logo} className='w-full' alt="" />

		<form className='flex flex-col items-center mt-10 w-full gap-5'>
			<input type="text" placeholder='Email/No Hp' className='w-full border border-black px-4 py-3 rounded-lg'/>

			<div className='flex flex-col w-full items-end'>
				<input type="password" placeholder='Password' className='w-full border border-black px-4 py-3 rounded-lg'/>
				
				<Link to={"/forgot-password"} className='text-gray-500 mt-2 text-sm'>Lupa Password?</Link>
			</div>

			<Button className='uppercase bg-[#7ED321] px-5 py-3 text-white w-full rounded-lg'>Masuk</Button>
		</form>

		<p className='mt-5 text-gray-500'>Saya belum memiliki <Link to={"/signup"} className='underline'>akun</Link></p>
    </div>
  )
}

export default Signin