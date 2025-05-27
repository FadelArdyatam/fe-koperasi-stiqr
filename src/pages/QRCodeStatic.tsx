import { useEffect } from 'react'
import qrisImg from '../images/qris-static-dns.jpeg'
import { Button } from '@/components/ui/button'
import { getSocket } from '@/hooks/websocket'
import { Edit } from 'lucide-react'
import successAudio from '../images/sound.mp3'
import { useNavigate } from 'react-router-dom'

interface QRCodeStaticProps {
    setIsQrisStatic: (value: boolean) => void;
}

export const QRCodeStatic = ({ setIsQrisStatic }: QRCodeStaticProps) => {

    const navigate = useNavigate()
    useEffect(() => {
        const socket = getSocket()

        const handlePaymentSuccess = (data: ({ subMerchantId: string; status: string; amount?: number })) => {
            if (data.subMerchantId === '25032500000004' && data.status === 'SUCCESS') {
                const audio = new Audio(successAudio)
                audio.play()
                navigate('/payment-success', {
                    state: {
                        orderId: "No Order ID",
                        amount: data.amount ?? 0,
                    },
                });
            }
        }
        socket.on('payment:static:success', handlePaymentSuccess)
        return () => {
            socket.off('payment:static:success', handlePaymentSuccess)
        }
    }, [])

    return (
        <div className="flex flex-col gap-3 justify-center items-center w-full pb-10">
            <img
                src={qrisImg}
                className="w-full max-w-xs h-auto mt-5 md:z-20 rounded-md md:p-6 border md:bg-white"
                alt="QRIS"
            />
            <Button onClick={() => setIsQrisStatic(false)} className="md:max-w-xs w-full md:mb-10 bg-orange-500 h-8">
                <Edit /> Atur Nominal
            </Button>
        </div>
    )
}
