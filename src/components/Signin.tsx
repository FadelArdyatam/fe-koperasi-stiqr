import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import logo from "../images/logo.png";
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import Notification from "./Notification";
import { Eye, EyeOff } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const Signin = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		AOS.init({ duration: 500, once: true });
	}, []);

	const handleSignin = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault(); // Pastikan form tidak refresh

		if (!email || !password) {
			setError("Email dan password tidak boleh kosong.");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/auth/login`,
				{ email, password }
			);
			console.log(response)
			if (response.data.status == 'success') {
				const token = response.data.access_token;
				localStorage.setItem("token", token);
				localStorage.setItem("userID", response.data.data.id);
				sessionStorage.setItem("user", JSON.stringify(response.data.data));
				navigate('/dashboard');
			}
		} catch (err) {
			if (axios.isAxiosError(err)) {
				console.log(err)
				setError(err.response?.data?.message || "Login gagal.");
			} else {
				setError("Login gagal.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-10 flex flex-col items-center justify-center w-full min-h-screen">
			<img src={logo} data-aos="zoom-in" className="md:w-64 w-full" alt="Logo" />

			<form
				action=""
				onSubmit={handleSignin} // Pastikan hanya gunakan handleSignin
				className="flex flex-col items-center mt-10 w-full gap-5"
			>

				{error && (
					<Notification message={error} onClose={() => setError(null)} status="error" />
				)}

				<input
					data-aos="fade-up"
					data-aos-delay="100"
					type="text"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Email"
					className="w-full border border-black px-4 py-3 rounded-lg"
				/>

				<div data-aos="fade-up" data-aos-delay="200" className="w-full relative flex items-center">
					<input
						type={showPassword ? "text" : "password"}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password"
						className="w-full border border-black px-4 py-3 rounded-lg"
					/>

					<button onClick={() => setShowPassword(!showPassword)} type="button" className="absolute right-5">{showPassword ? <EyeOff /> : <Eye />}</button>
				</div>

				<Link data-aos="fade-up" data-aos-delay="300" to="/forgot-password" className="text-gray-500 text-sm">
					Lupa Password?
				</Link>

				<Button
					data-aos="fade-up"
					typeof="button"
					data-aos-delay="300"
					disabled={loading}
					className={`uppercase px-5 py-3 w-full rounded-lg bg-[#7ED321] text-white`}
				>
					Masuk
				</Button>
			</form>

			{loading && (
				<div className="absolute bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
					<div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-orange-500"></div>
				</div>
			)}

			<p data-aos="fade-up" data-aos-delay="300" className="mt-5 text-gray-500">
				Saya belum memiliki{" "}
				<Link to="/signup" className="underline">
					akun
				</Link>
			</p>
		</div>
	);
};

export default Signin;
