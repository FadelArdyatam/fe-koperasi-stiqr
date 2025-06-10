import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { CircleCheck } from "lucide-react";
import Notification from "../components/Notification"; // Import the custom Notification component
import AOS from "aos";
import "aos/dist/aos.css";
import Loading from "./Loading";

interface OTPProps {
	currentSection: number;
	setCreatePin: (createPin: boolean) => void;
	phone: string;
}

const   OTP = ({ currentSection, setCreatePin, phone }: OTPProps) => {
	const [value, setValue] = useState("");
	// const [phoneNumber, setPhoneNumber] = useState("");
	const [codeSent, setCodeSent] = useState(false);
	const [timeLeft, setTimeLeft] = useState(0); // State for the countdown timer
	const [otpId, setOtpId] = useState(""); // State untuk menyimpan OTP ID dari response
	const phoneNumber = phone || localStorage.getItem('phone')
	const [loading, setLoading] = useState(false)

	const [showNotification, setShowNotification] = useState(false);

	const [notification, setNotification] = useState<{
		message: string;
		status: "success" | "error";
	} | null>(null);

	useEffect(() => {
		AOS.init({ duration: 500, once: true });
	}, []);

	const sendCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setLoading(true)
		if (!phoneNumber) {
			setNotification({
				message: "Please enter a valid phone number.",
				status: "error",
			});
			return;
		}

		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/register/get-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ phoneNumber: "0" + phoneNumber }),
			});

			if (response.ok) {
				const responseData = await response.json();
				setOtpId(responseData.data.id);
				setNotification({
					message: `OTP Berhasil terkirim ke 0${phoneNumber}`,
					status: "success",
				});
				setCodeSent(true);
				setTimeLeft(300);
				setLoading(false)
			}
		} catch (error) {
			setLoading(false)
			setNotification({
				message: "Terjadi Kesalahan",
				status: "error",
			});
		}
	};

	const verifyOtp = async () => {
		if (!otpId || !value || !phoneNumber) {
			setNotification({
				message: "Please enter a valid OTP.",
				status: "error",
			});
			return;
		}

		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/register/verif-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					otp_id: otpId,
					otp: value,
					phoneNumber: "0" + phoneNumber,
				}),
			});

			if (response.ok) {
				// const responseData = await response.json();
				setNotification({
					message: "OTP verified successfully!",
					status: "success",
				});

				// Remove the registedID
				localStorage.removeItem("registerID");

				setCreatePin(true);
			} else {
				const errorData = await response.json();
				setNotification({
					message: errorData.message || "Failed to verify OTP.",
					status: "error",
				});
			}
		} catch (error) {
			setNotification({
				message: "Terjadi Kesalahan",
				status: "error",
			});
		}
	};

	useEffect(() => {
		if (timeLeft > 0) {
			const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [timeLeft]);

	useEffect(() => {
		if (value.length === 6) {
			verifyOtp();
		}
	}, [value]);

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = time % 60;
		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	};

	return (
		<div className="mt-10">
			<div
				className={`${currentSection === 3 ? "block" : "hidden"
					} flex flex-col w-full space-y-7`}
			>
				<p data-aos="fade-up" className="font-semibold text-xl text-center">
					Terima Kasih Telah Mendaftar Sebagai Merchant STIQR!
				</p>

				<p data-aos="fade-up" data-aos-delay="100" className="text-md text-gray-500 text-center">
					<span className="font-semibold"> {localStorage.getItem("email")}</span>, Mohon segera melakukan verifikasi kode OTP untuk mengaktifkan akun STIQR Anda dan menjaga keamanannya.				</p>

				<form data-aos="fade-up" data-aos-delay="200" className="mt-10 w-full flex flex-col items-center gap-5">
					<div className="flex items-center gap-5">
						<div className="w-12 min-w-12 h-12 rounded-sm border border-black flex items-center justify-center">
							+62
						</div>

						<input
							type="number"
							value={phoneNumber || ''}
							readOnly
							placeholder="Masukkan No Hp Anda"
							className="rounded-sm border border-black px-4 w-full py-3"
						/>
					</div>

					<Button
						onClick={sendCode}
						className="bg-[#7ED321] px-5 py-3 w-full text-white rounded-lg"
						disabled={timeLeft > 0 || loading} // Disable tombol jika countdown belum selesai
					>
						{timeLeft > 0 ? `Kirim Lagi (${formatTime(timeLeft)})` : "Kirim"}
					</Button>
				</form>

				<div data-aos="fade-up" data-aos-delay="300" className="space-y-2 w-full flex flex-col items-center">
					<InputOTP
						maxLength={6}
						value={value}
						onChange={(value) => {
							// Hanya izinkan angka
							if (/^\d*$/.test(value)) {
								setValue(value);
							}
						}}
					>
						<InputOTPGroup className="flex items-center justify-center gap-2">
							{/* Pastikan InputOTPSlot menerima atribut tambahan */}
							<InputOTPSlot index={0} inputMode="numeric" className="border border-black rounded-md" />
							<InputOTPSlot index={1} inputMode="numeric" className="border border-black rounded-md" />
							<InputOTPSlot index={2} inputMode="numeric" className="border border-black rounded-md" />
							<InputOTPSlot index={3} inputMode="numeric" className="border border-black rounded-md" />
							<InputOTPSlot index={4} inputMode="numeric" className="border border-black rounded-md" />
							<InputOTPSlot index={5} inputMode="numeric" className="border border-black rounded-md" />
						</InputOTPGroup>
					</InputOTP>
					<div className="text-center text-sm">
						{value === "" ? (
							<>Masukkan kode OTP Anda yang telah dikirimkan melalui Whatsapp</>
						) : (
							<>You entered: {value}</>
						)}
					</div>
					{/* Countdown timer display */}
					{codeSent && timeLeft > 0 && (
						<p className="text-center text-sm text-gray-500">
							Time remaining: {formatTime(timeLeft)}
						</p>
					)}
					{codeSent && timeLeft === 0 && (
						<p className="text-center text-sm text-red-500">
							Time expired. Please resend the code.
						</p>
					)}
				</div>

				{notification && (
					<Notification
						message={notification.message}
						status={notification.status}
						onClose={() => setNotification(null)}
					/>
				)}

				{
					loading && <Loading />
				}

				{showNotification && (
					<div className="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
						<div className="bg-white w-[90%] rounded-lg m-auto p-5">
							<CircleCheck className="text-green-500 scale-[3] mt-10 m-auto" />

							<p className="text-green-500 text-sm text-center mt-10">OTP Berhasil terkirim ke +62{phoneNumber}</p>
							<div className="flex items-center gap-5 mt-5">
								<Button onClick={() => setShowNotification(false)} className="w-full bg-green-400">Tutup</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default OTP;
