import { Accordion } from "@radix-ui/react-accordion";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button } from "./ui/button";
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
import { TermsList } from "./TermsList";

interface TermsandConditionInProfileProps {
    setShowTermsandConditions: React.Dispatch<React.SetStateAction<boolean>>;
}

const TermsandConditionInProfile: React.FC<TermsandConditionInProfileProps> = ({ setShowTermsandConditions }) => {
    const [openItem, setOpenItem] = useState<string | null>(null);

    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    const handleAccordionChange = (value: string) => {
        setOpenItem((prev) => (prev === value ? null : value));
    };

    return (
        <div className="w-full flex flex-col min-h-screen items-center">
            <div className="w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400">
                <Button onClick={() => setShowTermsandConditions(false)} className="absolute left-5 bg-transparent hover:bg-transparent">
                    <ChevronLeft className="scale-[1.7] text-white" />
                </Button>

                <p data-aos="zoom-in" className="font-semibold m-auto text-xl text-white text-center">Syarat dan Ketentuan</p>
            </div>

            <div className="fixed w-full h-[calc(100vh-64px)] top-16 overflow-y-auto pb-24">
                <div className="w-[90%] mx-auto bg-white shadow-lg rounded-lg !text-black block p-2">
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full flex flex-col gap-2"
                        value={openItem || ""}
                        onValueChange={handleAccordionChange}
                    >
                        <TermsList
                            title={"Ketentuan Umum"}
                            openItem={openItem}
                            item={"item-1"}>
                            <ol className="list-decimal pl-6 space-y-2">
                                {
                                    ketentuanUmum.map((item, index) => (
                                        <li key={index}>
                                            {item.text}
                                        </li>
                                    ))
                                }
                            </ol>
                        </TermsList>
                        <TermsList
                            title={"Ketentuan Akun STIQR"}
                            openItem={openItem}
                            item={"item-2"}>
                            <ol className="list-decimal pl-6 space-y-2">
                                {
                                    ketentuanAkun.map((item, index) => (
                                        <li key={index}>
                                            {item.text}
                                        </li>
                                    ))
                                }
                            </ol>
                        </TermsList>
                        <TermsList
                            title={"Perangkat Lunak"}
                            openItem={openItem}
                            item={"item-3"}>
                            <ol className="list-decimal pl-6 space-y-2">
                                {
                                    perangkatLunak.map((data, index) => (
                                        <li key={index} dangerouslySetInnerHTML={{ __html: data.text }}>
                                        </li>
                                    ))
                                }
                            </ol>
                        </TermsList>
                        <TermsList
                            title={"Tindakan yang Dilarang Dilakukan di Aplikasi STIQR"}
                            openItem={openItem}
                            item={"item-4"}>
                            <ol className="list-decimal pl-6 space-y-2">
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
                        </TermsList>
                        <TermsList
                            title={"Kebijakan Penggunaan Data Pribadi STIQR"}
                            openItem={openItem}
                            item={"item-5"}>
                            <p>{penggunaanDataPribadi.title}</p>
                            <ol className="list-decimal pl-6 space-y-2">
                                {penggunaanDataPribadi.list.map((data, index) => (
                                    <li key={index}>
                                        {data}
                                    </li>
                                ))}
                            </ol>
                            <p>{penggunaanDataPribadi.footer}</p>
                        </TermsList>
                        <TermsList
                            title={"Kebijakan Pengelolaan Data Pribadi STIQR"}
                            openItem={openItem}
                            item={"item-6"}>
                            <p>{pengelolaanDataPribadi.title}</p>
                            <ol className="list-decimal pl-6 space-y-2">
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
                        </TermsList>
                        <TermsList
                            title={"Kerahasiaan"}
                            openItem={openItem}
                            item={"item-7"}>
                            <ol className="list-decimal pl-6 space-y-2">
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
                        </TermsList>
                        <TermsList
                            title={"Ketentuan QRIS"}
                            openItem={openItem}
                            item={"item-8"}>
                            <ol className="list-decimal pl-6 space-y-2">
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
                        </TermsList>

                        <TermsList
                            title={"Ketentuan Pencairan dan Perangkat"}
                            openItem={openItem}
                            item={"item-9"}>
                            <ol className="list-[upper-alpha] pl-6 space-y-2">
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
                        </TermsList>

                        <TermsList
                            title={"Layanan PPOB (BPJS, PDAM, Listrik, Pulsa, dan Paket Data)"}
                            openItem={openItem}
                            item={"item-10"}>
                            <ol className="list-decimal pl-6 space-y-2">
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
                        </TermsList>
                    </Accordion>
                </div>
            </div>
        </div>
    );
}

export default TermsandConditionInProfile