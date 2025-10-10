import { ChevronLeft, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import AOS from "aos";
import "aos/dist/aos.css";
import ketentuanUmum from "../data/terms/ketentuan-umum.json";
import ketentuanAkun from "../data/terms/ketentuan-akun.json";
import perangkatLunak from "../data/terms/perangkat-lunak.json";
import tindakanLarangan from "../data/terms/tindakan-larangan.json";
import penggunaanDataPribadi from "../data/terms/penggunaan-data-pribadi.json";
import pengelolaanDataPribadi from "../data/terms/pengelolaan-data-pribadi.json";
import kerahasiaan from "../data/terms/kerahasiaan.json";
import ketentuanQris from "../data/terms/ketentuan-qris.json";
import pencairanPerangkat from "../data/terms/pencairan-perangkat.json";
import layananPpob from "../data/terms/layanan-ppob.json";

interface TermsandConditionProps {
    setShowTermsandConditions: (show: boolean) => void;
    backToPageProfile: boolean;
}

const TermsandCondition = ({ setShowTermsandConditions, backToPageProfile }: TermsandConditionProps) => {
    const [openItem,] = useState<string | null>(null);
    const [checked, setChecked] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    const termsandConditionHandler = () => {
        if (checked === false) {
            const formattedMessage = `Untuk melanjutkan ke tahap selanjutnya dimohon untuk menyetujui syarat dan ketentuan`;
            setErrorMessage(formattedMessage);
            setShowNotification(true);
        } else {
            setErrorMessage("");
            setShowNotification(false);
            setShowTermsandConditions(false);
        }
    };

    return (
        <div className="w-full flex flex-col min-h-screen items-center pb-10">
            <div className="w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400">
                {backToPageProfile ? (
                    <button onClick={() => setShowTermsandConditions(false)} className="absolute left-5 bg-transparent hover:bg-transparent">
                        <ChevronLeft className="scale-[1.3] text-white" />
                    </button>
                ) : (
                    <Link to={"/"} className="absolute left-5 bg-transparent hover:bg-transparent">
                        <ChevronLeft className="scale-[1.3] text-white" />
                    </Link>
                )}

                <p data-aos="zoom-in" className="font-semibold m-auto text-xl text-white text-center">Syarat dan Ketentuan</p>
            </div>

            <div className="w-full -translate-y-28 overflow-y-auto">
                <div className="w-[90%] mx-auto max-h-screen overflow-y-auto bg-white shadow-lg rounded-lg !text-black block p-5 mb-3">
                    <div>
                        <div>
                            <p className="font-semibold text-center text-lg">Ketentuan Umum</p>

                            <ol className="mt-5 list-decimal pl-6 space-y-2">
                                {
                                    ketentuanUmum.map((item, index) => (
                                        <li key={index}>
                                            {item.text}
                                        </li>
                                    ))
                                }
                            </ol>
                        </div>

                        <div className="mt-10">
                            <p className="font-semibold text-lg text-center">Ketentuan Akun STIQR</p>

                            <ol className="mt-5 list-decimal pl-6 space-y-2">
                                {
                                    ketentuanAkun.map((item, index) => (
                                        <li key={index}>
                                            {item.text}
                                        </li>
                                    ))
                                }
                            </ol>
                        </div>

                        <div className="mt-10">
                            <p className="font-semibold text-center text-lg">Perangkat Lunak</p>

                            <ol className="mt-5 list-decimal pl-6 space-y-2">
                                {
                                    perangkatLunak.map((data, index) => (
                                        <li key={index} dangerouslySetInnerHTML={{ __html: data.text }}>
                                        </li>
                                    ))
                                }
                            </ol>
                        </div>

                        <div className="mt-10">
                            <p className="font-semibold text-center text-lg">Tindakan yang Dilarang Dilakukan di Aplikasi STIQR</p>

                            <ol className="mt-5 list-decimal pl-6 space-y-2">
                                {tindakanLarangan.map((data, index) => (
                                    <li key={index}>
                                        <p>{data.text}</p>
                                        <ol className="list-[lower-alpha] pl-6">
                                            {data.list.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ol>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="mt-10">
                            <p className="font-semibold text-center text-lg">Kebijakan Penggunaan Data Pribadi STIQR</p>

                            <p className="mt-5">{penggunaanDataPribadi.title}</p>
                            <ol className="mt-2 list-decimal pl-6 space-y-2">
                                {penggunaanDataPribadi.list.map((data, index) => (
                                    <li key={index}>
                                        {data}
                                    </li>
                                ))}
                            </ol>
                            <p className="mt-2">{penggunaanDataPribadi.footer}</p>
                        </div>

                        <div className="mt-10">
                            <p className="font-semibold text-center text-lg">Kebijakan Pengelolaan Data Pribadi STIQR</p>

                            <p className="mt-5">{pengelolaanDataPribadi.title}</p>
                            <ol className="mt-2 list-decimal pl-6 space-y-2">
                                {pengelolaanDataPribadi.list.map((data, index) => (
                                    <li key={index}>
                                        <p>{data.title}</p>
                                        <p>{data.desc}</p>
                                        <ol className="list-[lower-alpha] pl-6 mt-1 space-y-1">
                                            {data.list.map((item, idx) => (
                                                <li key={idx}>
                                                    {item.text}
                                                    {item.list && (
                                                        <ul className="list-disc pl-6 mt-1 space-y-1">
                                                            {item.list.map((subItem, subIdx) => (
                                                                <li key={subIdx}>{subItem}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </li>
                                            ))}
                                        </ol>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="mt-10">
                            <p className="font-semibold text-center text-lg">Kerahasiaan</p>

                            <ol className="mt-5 list-decimal pl-6 space-y-2">
                                {
                                    kerahasiaan.map((item, index) => (
                                        <li key={index}>
                                            {item.text}
                                            <ol className="list-[lower-alpha] pl-6 mt-1 space-y-1">
                                                {item.list && item.list.map((subItem, subIndex) => (
                                                    <li key={subIndex}>{subItem}</li>
                                                ))}
                                                <ol className="list-[lower-roman] pl-6">
                                                    {
                                                        item.sublist && item.sublist.map((subItem, subIndex) => (
                                                            <li key={subIndex}>{subItem}</li>
                                                        ))
                                                    }
                                                </ol>
                                            </ol>
                                        </li>
                                    ))
                                }
                            </ol>
                        </div>

                        <div className="mt-10">
                            <p className="font-semibold text-center text-lg">Ketentuan QRIS</p>

                            <ol className="mt-5 list-decimal pl-6 space-y-2">
                                {ketentuanQris.map((section, sectionIndex) => (
                                    <li key={sectionIndex}>
                                        <p >{section.title}</p>
                                        <ol className="list-decimal pl-6 space-y-2 mt-2">
                                            {section.subtitle.map((sub, subIndex) => (
                                                <li key={subIndex} className="list-none">
                                                    <p>{sectionIndex + 1}.{subIndex + 1} {sub.title}</p>

                                                    {sub.desc && <p className="mt-1">{sub.desc}</p>}

                                                    {sub.list && (
                                                        <ul className="list-disc pl-5 mt-1 space-y-1 ml-2">
                                                            {sub.list.map((item, i) => (
                                                                <li key={i}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    )}

                                                    {sub.isSpecial && sub.category && (
                                                        <div className="mt-2 space-y-2">
                                                            {sub.category.map((cat, catIndex) => (
                                                                <div key={catIndex}>
                                                                    <p >{cat.title}</p>
                                                                    <ol className="list-[lower-alpha] pl-6 space-y-1 mt-1">
                                                                        {cat.sublist.map((item, idx) => (
                                                                            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
                                                                        ))}
                                                                    </ol>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ol>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="mt-10">
                            <p className="font-semibold text-center text-lg">Ketentuan Pencairan dan Perangkat</p>

                            <ol className="mt-5 list-[upper-alpha] pl-6 space-y-2">
                                {
                                    pencairanPerangkat.map((item, index) => (
                                        <li key={index}>
                                            {item.title}
                                            <ol className="list-decimal pl-6 mt-1 space-y-1">
                                                {item.list && item.list.map((subItem, subIndex) => (
                                                    <>
                                                        <li key={subIndex}>{subItem.text}</li>
                                                        <ol className="list-[lower-alpha] pl-6">
                                                            {
                                                                subItem.list && subItem.list.map((subItem, subIndex) => (
                                                                    <li key={subIndex}>{subItem}</li>
                                                                ))
                                                            }
                                                        </ol>
                                                    </>
                                                ))}

                                            </ol>
                                        </li>
                                    ))
                                }
                            </ol>
                        </div>

                        <div className="mt-10">
                            <p className="font-semibold text-center text-lg">Layanan PPOB (BPJS, PDAM, Listrik, Pulsa, dan Paket Data)</p>

                            <ol className="mt-5 list-decimal pl-6 space-y-2">
                                {layananPpob.map((data, index) => (
                                    <li key={index}>
                                        <p>{data.text}</p>
                                        <ol className="list-[lower-alpha] pl-6">
                                            {data.list && data.list.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ol>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    <div className="mt-10 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={checked}
                            onChange={() => setChecked(!checked)}
                            className="accent-orange-500" // opsional: untuk ganti warna checkbox
                        />
                        <label htmlFor="terms" className="cursor-pointer">
                            Setuju Syarat & Ketentuan
                        </label>
                    </div>
                </div>

            </div>

            <div className={`w-[90%] ${openItem ? 'fixed bottom-4 m-auto' : ''} z-20 -mt-28`}>
                <Button onClick={termsandConditionHandler} className="w-full bg-green-400">Lanjutkan</Button>
            </div>

            {showNotification && (
                <div className="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
                    <div data-aos="zoom-in" className="bg-white w-[90%] rounded-lg m-auto p-5">
                        <div className="flex justify-center p-5">
                            <Info className="text-red-500" size={60} />
                        </div>
                        <p className="text-red-500 text-sm text-center">{errorMessage}</p>
                        <div className="flex items-center gap-5 mt-5">
                            <Button onClick={() => setShowNotification(false)} className="w-full bg-red-400">Tutup</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TermsandCondition;
