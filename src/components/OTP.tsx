import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

interface OTPProps {
	currentSection: number;
	setCreatePin: (createPin: boolean) => void;
}

const OTP = ({ currentSection, setCreatePin }: OTPProps) => {
	const [value, setValue] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [codeSent, setCodeSent] = useState(false);
	// const [code, setCode] = useState("");
	const [timeLeft, setTimeLeft] = useState(0); // State for the countdown timer

	// console.log(phoneNumber);

	const sendCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		if (!phoneNumber) {
			alert("Please enter a valid phone number.");
			return;
		}

		setCreatePin(true)

		console.log(phoneNumber)

		// try {
		// 	const response = await fetch("http://localhost:3000/api/send-code", {
		// 		method: "POST",
		// 		headers: {
		// 			"Content-Type": "application/json",
		// 		},
		// 		body: JSON.stringify({ phoneNumber }),
		// 	});

		// 	console.log("Response:", response);

		// 	if (response.ok) {
		// 		const responseData = await response.json();
		// 		console.log("Response Data:", responseData);
		// 		alert("Verification code sent successfully");
		// 		setCodeSent(true);
		// 		setTimeLeft(120); // Start the countdown (120 seconds)
		// 	} else {
		// 		const errorData = await response.json();
		// 		console.error("Error Response Data:", errorData);
		// 		alert("Failed to send verification code. Please try again.");
		// 	}
		// } catch (error) {
		// 	console.error("Network or Unexpected Error:", error);
		// 	alert("An unexpected error occurred. Please check your connection and try again.");
		// }
	};

	// Countdown timer logic
	useEffect(() => {
		if (timeLeft > 0) {
			const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
			return () => clearTimeout(timer); // Cleanup the timer on unmount
		}
	}, [timeLeft]);

	// Format the timer as MM:SS
	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = time % 60;
		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	};

	return (
		<div className="mt-10">
			<div
				className={`${currentSection === 2 ? "block" : "hidden"
					} flex flex-col items-end w-full md:w-2/3 space-y-7`}
			>
				<p className="font-semibold text-xl text-center">
					Terima Kasih Telah Mendaftar Sebagai Merchant STIQR!
				</p>

				<p className="text-md text-gray-500 text-center">
					Untuk keamanan akun anda, mohon masukkan kode OTP yang telah kami kirimkan.
				</p>

				<form className="mt-10 w-full flex flex-col items-center gap-5">
					<div className="flex items-center gap-5">
						<div className="w-12 min-w-12 h-12 rounded-sm border border-black flex items-center justify-center">
							+62
						</div>

						<input
							type="text"
							onChange={(e) => setPhoneNumber(e.target.value)}
							placeholder="Masukkan No Hp Anda"
							className="rounded-sm border border-black px-4 w-full py-3"
						/>
					</div>

					<Button
						onClick={sendCode}
						className="bg-[#7ED321] px-5 py-3 w-full text-white rounded-lg"
					>
						Kirim
					</Button>
				</form>

				<div className="space-y-2 w-full flex flex-col items-center">
					<InputOTP
						maxLength={6}
						value={value}
						onChange={(value) => setValue(value)}
					>
						<InputOTPGroup>
							<InputOTPSlot index={0} />
							<InputOTPSlot index={1} />
							<InputOTPSlot index={2} />
							<InputOTPSlot index={3} />
							<InputOTPSlot index={4} />
							<InputOTPSlot index={5} />
						</InputOTPGroup>
					</InputOTP>
					<div className="text-center text-sm">
						{value === "" ? (
							<>Enter your one-time password.</>
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
			</div>
		</div>
	);
};

export default OTP;
