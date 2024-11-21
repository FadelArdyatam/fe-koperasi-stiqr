import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp"
import { useState } from "react"

const OTP = () => {
	const [value, setValue] = useState("")

	console.log(value)

	return (
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
		</div>
	)
}

export default OTP