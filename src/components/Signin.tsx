import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import logo from "../images/logo.png";
import { useState } from "react";
import axios from "axios";

const Signin = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null); // Untuk menampilkan error
	const [loading, setLoading] = useState(false); // Untuk UX feedback (loading)
	const navigate = useNavigate();

	const handleSignin = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validasi input
		if (!email || !password) {
			setError("Email dan password tidak boleh kosong.");
			return;
		}

		setLoading(true); // Tampilkan loading
		setError(null); // Reset error

		try {
			// Menggunakan axios untuk permintaan POST
			const response = await axios.post(
				"https://be-stiqr.dnstech.co.id/api/auth/login",
				{ email, password }, // Data yang dikirimkan
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			console.log("Login berhasil:", response.data);

			// Lakukan sesuatu dengan data login, seperti menyimpan token atau redirect
			localStorage.setItem("token", response.data.access_token);
			navigate('/dashboard')
		} catch (err: any) {
			console.error("Error during login:", err);
			setError(err.response?.data?.message || "Login gagal. Periksa email dan password Anda.");
		} finally {
			setLoading(false); // Sembunyikan loading
		}
	};

	return (
		<div className="p-10 flex flex-col items-center justify-center w-full min-h-screen">
			<img src={logo} className="w-full" alt="Logo" />

			<form
				onSubmit={handleSignin}
				className="flex flex-col items-center mt-10 w-full gap-5"
			>
				{error && <p className="text-red-500 text-sm">{error}</p>} {/* Tampilkan error */}

				<input
					type="text"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Email/No Hp"
					className="w-full border border-black px-4 py-3 rounded-lg"
				/>

				<div className="flex flex-col w-full items-end">
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
				</div>

				<Button
					type="submit"
					disabled={loading} // Nonaktifkan tombol saat loading
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
