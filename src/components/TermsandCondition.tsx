import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@radix-ui/react-accordion";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "./ui/button";

interface TermsandConditionProps {
    setShowTermsandConditions: (show: boolean) => void;
}

const TermsandCondition = ({ setShowTermsandConditions }: TermsandConditionProps) => {
    const [openItem, setOpenItem] = useState<string | null>(null);

    const handleAccordionChange = (value: string) => {
        setOpenItem((prev) => (prev === value ? null : value));
    };

    return (
        <div className="w-full flex flex-col min-h-screen items-center">
            <div className="w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400">
                <Link to={"/"} className="absolute left-5 bg-transparent hover:bg-transparent">
                    <ChevronLeft className="scale-[1.3] text-white" />
                </Link>

                <p className="font-semibold m-auto text-xl text-white text-center">Syarat dan Ketentuan</p>
            </div>

            <div className="absolute w-[90%] top-20 bg-white shadow-lg rounded-lg !text-black block p-2">
                <Accordion
                    type="single"
                    collapsible
                    className="w-full flex flex-col gap-2"
                    value={openItem || ""}
                    onValueChange={handleAccordionChange}
                >
                    <AccordionItem value="item-1" className="w-full border-b pb-2">
                        <AccordionTrigger className="flex items-center text-start justify-between w-full py-2 px-4 gap-5">
                            <span>Ketentuan Umum</span>
                            <ChevronDown
                                className={`transform transition-transform duration-200 ${openItem === "item-1" ? "rotate-180" : "rotate-0"
                                    }`}
                            />
                        </AccordionTrigger>
                        <AccordionContent className="py-2 px-4">
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>
                                    Ketentuan Pemakaian STIQR ini merupakan kesepakatan antara Pemilik Merchant dan PT Digital Nusantara Digital (DNS) yang mengatur akses dan pemakaian aplikasi, situs web, serta produk yang disediakan oleh DNS, termasuk pemesanan, pembayaran, atau pemakaian layanan yang ada di aplikasi STIQR.
                                </li>
                                <li>
                                    Dengan mengakses aplikasi STIQR dan memiliki Akun STIQR, Pemilik Usaha dianggap telah menyetujui Ketentuan Pemakaian STIQR, termasuk menyetujui SOP, Syarat dan Ketentuan khusus setiap Layanan yang dipilih, serta perubahannya, yang merupakan bagian tidak terpisahkan dari Ketentuan Pemakaian STIQR ini.
                                </li>
                                <li>
                                    Pemilik Merchant menyetujui bahwa Ketentuan Pemakaian STIQR ini diterima secara elektronik sesuai dengan Undang-Undang Republik Indonesia No. 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik, serta Peraturan Pemerintah No. 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik beserta perubahannya.
                                </li>
                                <li>
                                    DNS memiliki wewenang untuk mengubah, menambah, atau menghapus bagian dari Ketentuan Pemakaian STIQR kapan saja dengan memberikan pemberitahuan melalui Aplikasi STIQR atau cara lain yang dipilih oleh DNS.
                                </li>
                                <li>
                                    DNS dan Pemilik Merchant masing-masing disebut sebagai "Pihak" dan secara bersama-sama disebut sebagai "Para Pihak."
                                </li>
                                <li>
                                    Dengan memperhatikan seluruh ketentuan dalam Ketentuan Pemakaian STIQR, Para Pihak sepakat pada Ketentuan Pemakaian STIQR ini.
                                </li>
                            </ol>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="w-full border-b pb-2">
                        <AccordionTrigger className="flex items-center justify-between w-full py-2 px-4">
                            <span>Ketentuan Akun Stiqr</span>
                            <ChevronDown
                                className={`transform transition-transform duration-200 ${openItem === "item-2" ? "rotate-180" : "rotate-0"
                                    }`}
                            />
                        </AccordionTrigger>
                        <AccordionContent className="py-2 px-4">
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>
                                    Akun STIQR yang dimiliki oleh Pemilik Merchant hanya boleh digunakan oleh Pemilik Merchant itu sendiri dan tidak bisa dipindahkan kepada pihak ketiga dalam situasi apa pun. DNS berhak menolak pesanan jika diketahui atau ada kecurigaan bahwa Akun STIQR digunakan oleh pihak lain selain Pemilik Merchant. Pemilik Merchant juga dilarang menggunakan akun pribadinya atau akun orang lain untuk memesan Layanan yang akan diterimanya sendiri sebagai Penyedia Layanan.
                                </li>
                                <li>
                                    Keamanan dan kerahasiaan dari Akun STIQR, termasuk nama, alamat email, nomor telepon, rincian pembayaran, dan Metode Pembayaran yang digunakan serta kode verifikasi yang dihasilkan oleh sistem DNS atau Penyedia Metode Pembayaran sepenuhnya merupakan tanggung jawab Pemilik Merchant. Segala risiko dan kerugian akibat kelalaian dalam menjaga informasi tersebut akan ditanggung oleh Pemilik Merchant sendiri. Dalam hal ini, DNS akan menganggap setiap aktivitas di akun tersebut sebagai permintaan resmi dari Pemilik Merchant.
                                </li>
                                <li>
                                    Pemilik Merchant memahami bahwa DNS hanya menyediakan Aplikasi STIQR sebagaimana adanya dan tidak menjamin atau bertanggung jawab atas keandalan, ketepatan waktu, kualitas, atau keamanan aplikasi untuk memenuhi kebutuhan Pemilik Merchant. Layanan, Konten Pihak Ketiga, Promosi, dan Metode Pembayaran sepenuhnya menjadi tanggung jawab Penyedia Layanan, Penyedia Konten, Penyedia Promosi, dan Penyedia Metode Pembayaran.
                                </li>
                                <li>
                                    DNS tidak berkewajiban untuk memantau pemakaian Aplikasi STIQR oleh Pemilik Merchant, tetapi DNS tetap berhak melakukan pengawasan untuk memastikan kelancaran pemakaian aplikasi dan memastikan kepatuhan terhadap Ketentuan Pemakaian STIQR, hukum yang berlaku, serta keputusan otoritas terkait.
                                </li>
                                <li>
                                    Jika Pemilik Merchant menduga bahwa akun mereka telah digunakan tanpa izin, mereka wajib melaporkannya kepada DNS. DNS akan mengambil tindakan yang diperlukan, seperti menghentikan akses akun atau bekerja sama dengan Penyedia Layanan untuk menghentikan Layanan yang diberikan.
                                </li>
                                <li>
                                    DNS tidak memiliki kewajiban untuk menangani atau menyelesaikan perselisihan antara Pemilik Merchant dan Penyedia Layanan, Konten Pihak Ketiga, Promosi, atau Penyedia Metode Pembayaran.
                                </li>
                                <li>
                                    Pemilik Merchant setuju untuk menggunakan Aplikasi STIQR, Layanan, Konten Pihak Ketiga, Promosi, atau Metode Pembayaran sesuai dengan tujuan yang telah ditentukan, dan tidak untuk tujuan penipuan atau tindakan lain yang dapat merugikan orang lain.
                                </li>
                                <li>
                                    Pemilik Merchant juga memahami dan menyetujui peran yang melekat pada setiap Akun STIQR serta tunduk pada Syarat dan Ketentuan Penunjukan Peran Akun STIQR yang merupakan bagian dari Ketentuan Pemakaian ini.
                                </li>
                            </ol>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3" className="w-full border-b pb-2">
                        <AccordionTrigger className="flex items-center justify-between w-full py-2 px-4">
                            <span>Perangkat Lunak Aplikasi Stiqr</span>
                            <ChevronDown
                                className={`transform transition-transform duration-200 ${openItem === "item-3" ? "rotate-180" : "rotate-0"
                                    }`}
                            />
                        </AccordionTrigger>
                        <AccordionContent className="py-2 px-4">
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>
                                    DNS hanya menyediakan portal web STIQR melalui browser
                                </li>
                                <li>
                                    Aplikasi STIQR hanya boleh digunakan pada perangkat telepon genggam, tablet, laptop, atau komputer.
                                </li>
                                <li>
                                    Pemakaian web STIQR dari sumber selain browser resmi dan/atau pada perangkat yang tidak sesuai (selain perangkat telepon genggam, tablet, laptop, atau komputer.) dianggap sebagai pelanggaran terhadap Ketentuan Pemakaian STIQR dan hak kekayaan intelektual DNS.
                                </li>
                            </ol>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4" className="w-full border-b pb-2">
                        <AccordionTrigger className="flex items-center justify-between w-full py-2 px-4">
                            <span>Perangkat Stiqr</span>
                            <ChevronDown
                                className={`transform transition-transform duration-200 ${openItem === "item-4" ? "rotate-180" : "rotate-0"
                                    }`}
                            />
                        </AccordionTrigger>
                        <AccordionContent className="py-2 px-4">
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>
                                    Jika menggunakan perangkat STIQR yang disediakan oleh DNS dan/atau Afiliasinya, Pemilik Merchant wajib:
                                    <ol className="list-disc pl-6 space-y-2">
                                        <li>
                                            Mengamankan perangkat sesuai ketentuan yang ditetapkan oleh DNS dan/atau Afiliasinya, baik secara verbal saat pemasangan maupun melalui media komunikasi lainnya.
                                        </li>
                                        <li>
                                            Segera memberi tahu DNS dan/atau Afiliasinya jika perangkat STIQR mengalami gangguan sistem atau kendala, agar dapat diperbaiki.
                                        </li>
                                        <li>
                                            Bertanggung jawab atas kerugian yang dialami oleh DNS dan/atau Afiliasinya dan/atau Pelanggan akibat penyalahgunaan perangkat STIQR oleh Pemilik Merchant, karyawannya, atau pihak ketiga yang ditunjuk.
                                        </li>
                                    </ol>
                                </li>
                                <li>
                                    Pemilik Merchant dilarang melakukan hal-hal berikut tanpa persetujuan tertulis dari DNS dan/atau Afiliasinya:
                                    <ol className="list-disc pl-6 space-y-2">
                                        <li>Memindahkan perangkat STIQR dari lokasi Gerai Pemilik Merchant.</li>
                                        <li>Memperbaiki atau mengganti perangkat STIQR.</li>
                                        <li>
                                            Menggunakan perangkat STIQR untuk tujuan lain yang tidak diatur, termasuk tetapi tidak terbatas pada online video streaming, akses media sosial, permainan, dan lainnya.
                                        </li>
                                        <li>Melakukan tindakan yang dapat merusak perangkat STIQR atau sistem di dalamnya.</li>
                                    </ol>
                                </li>
                                <li>
                                    Biaya perbaikan atau penggantian perangkat STIQR yang rusak diatur sesuai kebijakan DNS.
                                </li>
                                <li>
                                    Kerusakan yang disebabkan oleh kelalaian, kesalahan, penanganan yang tidak tepat, penyalahgunaan, atau modifikasi tanpa persetujuan dianggap sebagai tanggung jawab Pemilik Merchant.
                                </li>
                                <li>
                                    Pemilik Merchant bertanggung jawab atas kehilangan atau kerusakan perangkat STIQR yang tidak dapat diperbaiki.
                                </li>
                                <li>
                                    Pemilik Merchant wajib memberi tahu DNS dan/atau Afiliasinya tentang kehilangan atau kerusakan dan bertanggung jawab atas biaya yang ditetapkan.
                                </li>
                            </ol>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5" className="w-full border-b pb-2">
                        <AccordionTrigger className="flex items-center justify-between w-full py-2 px-4">
                            <span>Tindakan Kecurangan</span>
                            <ChevronDown
                                className={`transform transition-transform duration-200 ${openItem === "item-5" ? "rotate-180" : "rotate-0"
                                    }`}
                            />
                        </AccordionTrigger>
                        <AccordionContent className="py-2 px-4">
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>
                                    Berikut adalah beberapa contoh yang termasuk dalam definisi "Tindakan Kecurangan":
                                    <ol className="list-disc pl-6 space-y-2">
                                        <li>
                                            Transaksi Mencurigakan: Adanya transaksi yang tidak sesuai dengan pola atau kebiasaan transaksi yang biasa dilakukan oleh Pemilik Merchant.
                                        </li>
                                        <li>
                                            Penyalahgunaan dan/atau Transaksi Fiktif: Meliputi tindakan yang dilakukan oleh Pemilik Merchant atau karyawannya yang bertujuan untuk memperoleh keuntungan secara tidak sah, seperti membuat transaksi yang tidak nyata.
                                        </li>
                                        <li>
                                            Kerja Sama dengan Penipu: Pemilik Merchant yang berkolaborasi atau terlibat dengan individu atau kelompok yang diketahui melakukan penipuan.
                                        </li>
                                        <li>
                                            Penipuan: Tindakan penipuan yang dilakukan oleh Pemilik Merchant atau karyawannya, baik terhadap DNS maupun pihak ketiga.
                                        </li>
                                    </ol>
                                </li>
                                <li>
                                    Berikut adalah beberapa tindakan yang dapat diambil oleh DNS jika terdapat indikasi dan/atau terbukti terjadinya Tindakan Kecurangan:
                                    <ol className="list-disc pl-6 space-y-2">
                                        <li>
                                            Menghentikan Kegiatan Promosi dan/atau Pemasaran: DNS dapat menghentikan semua kegiatan promosi dan pemasaran yang berkaitan dengan Pemilik Merchant.
                                        </li>
                                        <li>
                                            Menghentikan Sementara Layanan: DNS berhak untuk menghentikan sementara layanan yang diberikan kepada Pemilik Merchant berdasarkan Syarat dan Ketentuan Umum.
                                        </li>
                                        <li>
                                            Menahan dan/atau Menangguhkan Dana Settlement: DNS dapat menahan dana yang seharusnya dibayarkan kepada Pemilik Merchant hingga masalah kecurangan diselesaikan.
                                        </li>
                                        <li>
                                            Menolak Pembayaran dan/atau Memotong Bagian dari Dana Settlement: DNS berhak untuk menolak pembayaran atau memotong sebagian dari dana yang harus dibayarkan sebagai pemulihan atas kerugian yang dialami.
                                        </li>
                                        <li>
                                            Memasukkan Pemilik Merchant ke Dalam Daftar Hitam: DNS dapat memutuskan untuk memasukkan Pemilik Merchant ke dalam daftar hitam, yang berarti Pemilik Merchant tidak akan lagi dapat berpartisipasi dalam program atau layanan DNS.
                                        </li>
                                        <li>
                                            Mengajukan Klaim atau Tuntutan Hukum: DNS berhak untuk mengajukan klaim, gugatan, atau tuntutan hukum atas kerugian yang dialami akibat tindakan kecurangan.
                                        </li>
                                    </ol>
                                </li>
                                <li>
                                    DNS berhak meminta Pemilik Merchant untuk menyerahkan bukti pendukung sebagai bagian dari proses banding terkait tindakan yang diambil. Bukti pendukung tersebut harus diserahkan dalam waktu 7 (tujuh) hari kerja kalender setelah permintaan dari DNS. Setelah menerima bukti tersebut, DNS akan melakukan penilaian dan, berdasarkan kebijakannya sendiri, akan memutuskan apakah akan melanjutkan proses penyelesaian atau tetap menggunakan hak-haknya yang telah ditetapkan.
                                </li>
                            </ol>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-6" className="w-full border-b pb-2">
                        <AccordionTrigger className="flex items-center justify-between w-full py-2 px-4">
                            <span>Kerahasiaan</span>
                            <ChevronDown
                                className={`transform transition-transform duration-200 ${openItem === "item-6" ? "rotate-180" : "rotate-0"
                                    }`}
                            />
                        </AccordionTrigger>
                        <AccordionContent className="py-2 px-4">
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>
                                    Salah satu Pihak dapat menyampaikan Informasi Rahasia kepada Pihak lainnya sesuai dengan Ketentuan Pemakaian STIQR ini. Kedua Pihak setuju bahwa pengungkapan, penerimaan, dan pemanfaatan Informasi Rahasia tersebut akan dilakukan sesuai dengan ketentuan yang diatur dalam pasal ini.
                                </li>
                                <li>
                                    Semua Informasi Rahasia dan data yang berkaitan dengan Ketentuan STIQR ini yang diterima oleh Para Pihak harus dirahasiakan, dan Para Pihak sepakat untuk tidak mengungkapkan atau memberikan data tersebut, baik sebagian maupun seluruhnya, kepada pihak ketiga mana pun. Selain itu, mereka tidak boleh menggunakan informasi dan data tersebut untuk kepentingan yang tidak terkait dengan Ketentuan Pemakaian STIQR ini, kecuali:
                                    <ol className="list-disc pl-6 space-y-2">
                                        <li>
                                            Dengan adanya persetujuan tertulis dari Pihak lainnya.
                                        </li>
                                        <li>
                                            Informasi yang disampaikan oleh salah satu Pihak kepada pegawai, bank, konsultan finansial, konsultan hukum, atau konsultan lain terkait dengan Ketentuan Pemakaian STIQR ini.
                                        </li>
                                        <li>
                                            Data tersebut sudah menjadi informasi yang umum dan tidak disebabkan oleh kesalahan Pihak yang menerima informasi.
                                        </li>
                                        <li>
                                            Berdasarkan putusan dari pengadilan atau proses arbitrase.
                                        </li>
                                        <li>
                                            Diberikan oleh DNS kepada Afiliasinya, Penyedia Layanan, dan/atau pihak yang memiliki kerjasama dengan DNS untuk mendukung penyediaan Aplikasi STIQR dan/atau Layanan, serta untuk menawarkan produk atau layanan lain dari DNS.
                                        </li>
                                    </ol>
                                </li>
                                <li>
                                    Pemilik Merchant setuju bahwa DNS memiliki hak untuk: (1) menginformasikan semua data dan Informasi Rahasia kepada vendor, subkontraktor, agen, atau konsultan hanya untuk tujuan pelaksanaan Ketentuan Pemakaian STIQR ini; dan/atau (2) mengolah serta memanfaatkan data Pemilik Merchant untuk (a) meningkatkan layanan yang diberikan oleh DNS, Afiliasinya, atau Penyedia Layanan kepada Pemilik Merchant (termasuk untuk sistem deteksi penipuan, aturan penipuan, dan kebutuhan audit korporasi); serta (b) untuk menawarkan produk dan/atau layanan DNS, Afiliasinya, atau Penyedia Layanan lainnya kepada Pemilik Merchant.
                                </li>
                            </ol>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            <div className="fixed bottom-10 w-[90%] m-auto">
                <Button onClick={() => setShowTermsandConditions(false)} className="w-full bg-green-400">Lanjutkan</Button>
            </div>
        </div>
    );
};

export default TermsandCondition;
