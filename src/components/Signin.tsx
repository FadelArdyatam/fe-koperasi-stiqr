import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import logo from "../images/logo.png";
import { useState } from "react";
import axios from "axios";

const Signin = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSignin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !password) {
			setError("Email dan password tidak boleh kosong.");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}api/auth/login`,
				{ email, password }
			);

			const token = response.data.access_token;
			localStorage.setItem("token", token);

			sessionStorage.setItem("user", JSON.stringify(response.data.data));

			navigate('/dashboard');
		} catch (err) {
			if (axios.isAxiosError(err)) {
				console.error(err.message);
				setError(err.response?.data?.message || "Login gagal.");
			} else {
				console.error(err);
				setError("Login gagal.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-10 flex flex-col items-center justify-center w-full min-h-screen">
			<img src={logo} className="w-full" alt="Logo" />

			<form
				onSubmit={handleSignin}
				className="flex flex-col items-center mt-10 w-full gap-5"
			>
				{error && <p className="text-red-500 text-sm">{error}</p>}

				<input
					type="text"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Email/No Hp"
					className="w-full border border-black px-4 py-3 rounded-lg"
				/>

				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Password"
					className="w-full border border-black px-4 py-3 rounded-lg"
				/>

				<Link to="/forgot-password" className="text-gray-500 mt-2 text-sm">
					Lupa Password?
				</Link>

				<Button
					type="submit"
					disabled={loading}
					className={`uppercase px-5 py-3 w-full rounded-lg ${loading
						? "bg-gray-300 cursor-not-allowed"
						: "bg-[#7ED321] text-white"
						}`}
				>
					{loading ? "Loading..." : "Masuk"}
				</Button>
			</form>

			<p className="mt-5 text-gray-500">
				Saya belum memiliki{" "}
				<Link to="/signup" className="underline">
					akun
				</Link>
			</p>
		</div>
	);
};

export default Signin;
