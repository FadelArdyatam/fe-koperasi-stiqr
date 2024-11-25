import { ChevronDown, ChevronLeft } from 'lucide-react'
import logo from '../images/logo.png'
import { Link } from 'react-router-dom'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'

const ForgotPassword = () => {
    const [showInputEmail, setShowInputEmail] = useState(false)
    const [showInputPhone, setShowInputPhone] = useState(false)
    const [showTypeConfirmation, setShowTypeConfirmation] = useState(true)
    const [valueEmail, setValueEmail] = useState('')
    const [valuePhone, setValuePhone] = useState('')

    const FormSchema = z.object({
        typeConfirmation: z.enum(["Email", "No Hp"], {
            message: "Please select the type for the confirmation.",
        }),
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            typeConfirmation: undefined,
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data)

        if (data.typeConfirmation === "Email") {
            setShowInputEmail(true)
            setShowInputPhone(false)
        } else {
            setShowInputPhone(true)
            setShowInputEmail(false)
        }

        setShowTypeConfirmation(false)
    }

    return (
        <div className='w-full flex flex-col min-h-screen items-center justify-center'>
            <div className='fixed w-full top-0 p-5 flex items-center justify-center bg-orange-400'>
                <Link to={'/'} className='absolute left-5 bg-transparent hover:bg-transparent'>
                    <ChevronLeft className='scale-[1.3] text-white' />
                </Link>

                <p className='font-semibold m-auto text-xl text-white text-center'>Lupa Password</p>
            </div>

            <img src={logo} className='w-[80%] mt-32' alt="" />

            <div className='mt-10 text-center p-10'>
                <p className='text-gray-500'>Kami akan mengirimkan konfirmasi ke email Anda untuk mengatur ulang password Anda.</p>

                <div className={`${showTypeConfirmation ? 'block' : 'hidden'}`}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="typeConfirmation"
                                render={({ field }) => (
                                    <FormItem className="w-full mt-10">
                                        <FormControl>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <div className="p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between">
                                                        <button className="">
                                                            {field.value || "- Pilih -"} {/* Display selected value */}
                                                        </button>

                                                        <ChevronDown />
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-[250px] bg-white p-5 border mt-3 rounded-lg flex flex-col gap-3">
                                                    <DropdownMenuItem onSelect={() => field.onChange("Email")} className="w-full">Email</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => field.onChange("No Hp")} className="w-full">No Hp</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="bg-[#7ED321] px-5 py-3 mt-10 w-full text-white rounded-lg">
                                Kirim
                            </Button>
                        </form>
                    </Form>
                </div>

                {showInputEmail && (
                    <form>
                        <input
                            type="email"
                            placeholder="Masukkan Email Anda"
                            className="rounded-sm border border-black px-4 w-full py-3 mt-5"
                            onChange={(e) => setValueEmail(e.target.value)}
                        />

                        <Button className="bg-[#7ED321] px-5 py-3 mt-5 w-full text-white rounded-lg">
                            Kirim
                        </Button>
                    </form>

                )}

                {showInputPhone && (
                    <form>
                        <div className="flex items-center gap-5 mt-5">
                            <div className="w-12 min-w-12 h-12 rounded-sm border border-black flex items-center justify-center">
                                +62
                            </div>

                            <input
                                type="text"
                                placeholder="Masukkan No Hp Anda"
                                className="rounded-sm border border-black px-4 w-full py-3"
                                onChange={(e) => setValuePhone(e.target.value)}
                            />
                        </div>

                        <Button className="bg-[#7ED321] px-5 py-3 mt-5 w-full text-white rounded-lg">
                            Kirim
                        </Button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default ForgotPassword