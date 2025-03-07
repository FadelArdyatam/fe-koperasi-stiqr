import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import intro1 from "../images/intro1.png";
import intro2 from "../images/intro2.png";
import intro3 from "../images/intro3.png";
import AOS from "aos";
import "aos/dist/aos.css";

const slides = [
    { image: intro1, title: "Bisnis Makin Lancar, Tanpa Biaya Besar", description: "Mulai kelola bisnis Anda tanpa khawatir biaya tambahan. STIQR 100% Gratis!" },
    { image: intro2, title: "Mudah, Cepat, Tanpa Ribet", description: "Kelola bisnismu dengan mudah hanya dengan satu aplikasi." },
    { image: intro3, title: "Saatnya Tumbuh Bersama STIQR!", description: "Bersama kami wujudkan bisnis impian Anda." },
];

interface OnboardingProps {
    setShowOnboarding: (show: boolean) => void;
}

const Onboarding = ({ setShowOnboarding }: OnboardingProps) => {
    const [slide, setSlide] = useState(0);
    const [animateKey, setAnimateKey] = useState(0); // Key untuk trigger ulang animasi

    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);

    useEffect(() => {
        AOS.refresh(); // Refresh AOS setiap kali slide berubah
        setAnimateKey(prevKey => prevKey + 1); // Update key untuk trigger ulang animasi
    }, [slide]);

    const nextSlide = () => {
        if (slide < slides.length - 1) {
            setSlide(slide + 1);
        } else {
            setShowOnboarding(false);
        }
    };

    const prevSlide = () => {
        if (slide > 0) setSlide(slide - 1);
    };

    const handlers = useSwipeable({
        onSwipedLeft: nextSlide,
        onSwipedRight: prevSlide,
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    return (
        <div className="flex flex-col items-center justify-center p-10">
            {/* Tombol Lewati */}
            <button className={`${slide <= 1 ? 'block' : 'hidden'} absolute top-14 right-10 z-10`} onClick={() => setShowOnboarding(false)}>
                Lewati
            </button>

            {/* Container Slide */}
            <div {...handlers} className="relative w-full h-[400px] overflow-hidden">
                {slides.map((item, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${slide === index ? "translate-x-0" : slide > index ? "-translate-x-full" : "translate-x-full"
                            }`}
                    >
                        <img className="h-min" data-aos="zoom-in" key={animateKey} src={item.image} alt="" />
                    </div>
                ))}
            </div>

            {/* Text & Animasi */}
            <div className="text-center" key={animateKey}>
                <h2 className="font-semibold text-2xl" data-aos="fade-up" data-aos-delay="300">{slides[slide].title}</h2>
                <p className="mt-4 text-gray-700" data-aos="fade-up" data-aos-delay="600">{slides[slide].description}</p>
            </div>

            {/* Tombol Navigasi */}
            <div className="mt-10 flex items-center gap-5">
                <button onClick={prevSlide} disabled={slide === 0} className="px-5 py-2 bg-gray-300 rounded disabled:opacity-50">
                    Sebelumnya
                </button>
                <button onClick={nextSlide} className={`px-5 py-2 rounded ${slide === slides.length - 1 ? "bg-green-500 text-white" : "bg-orange-400 text-white"}`}>
                    {slide === slides.length - 1 ? "Ayo Mulai!" : "Selanjutnya"}
                </button>
            </div>

            {/* Indikator Slide */}
            <div className="mt-5 flex gap-2">
                {slides.map((_, index) => (
                    <div
                        key={index}
                        onClick={() => setSlide(index)}
                        className={`w-3 h-3 rounded-full cursor-pointer ${slide === index ? "bg-orange-400" : "bg-gray-300"}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default Onboarding;
