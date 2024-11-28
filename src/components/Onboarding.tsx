import { useState } from "react";
import { useSwipeable } from "react-swipeable";

const slides = [
    { title: "Title 1", description: "Description for slide 1." },
    { title: "Title 2", description: "Description for slide 2." },
    { title: "Title 3", description: "This is the last slide." },
];

interface OnboardingProps {
    setShowOnboarding: (show: boolean) => void;
}

const Onboarding = ({ setShowOnboarding }: OnboardingProps) => {
    const [slide, setSlide] = useState(0);

    const nextSlide = () => {
        if (slide < slides.length - 1) {
            setSlide(slide + 1);
        } else {
            // Change `showOnboarding` to false when the user finishes onboarding
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
            {/* Slide Container */}
            <div
                {...handlers}
                className="relative w-full h-[500px] bg-gray-200 border border-black rounded-lg overflow-hidden"
            >
                {slides.map((_, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${slide === index
                            ? "translate-x-0"
                            : slide > index
                                ? "-translate-x-full"
                                : "translate-x-full"
                            }`}
                    >
                        <p className="text-4xl font-bold">Slide {index + 1}</p>
                    </div>
                ))}
            </div>

            {/* Text Below */}
            <div className="mt-10 text-center">
                <h2 className="font-semibold text-2xl">{slides[slide].title}</h2>
                <p className="mt-4 text-gray-700">{slides[slide].description}</p>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-10 flex items-center gap-5">
                <button
                    onClick={prevSlide}
                    disabled={slide === 0}
                    className="px-5 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={nextSlide}
                    className={`px-5 py-2 rounded ${slide === slides.length - 1
                        ? "bg-green-500 text-white"
                        : "bg-orange-400 text-white"
                        }`}
                >
                    {slide === slides.length - 1 ? "Get Started" : "Next"}
                </button>
            </div>

            {/* Slide Indicators */}
            <div className="mt-5 flex gap-2">
                {slides.map((_, index) => (
                    <div
                        key={index}
                        onClick={() => setSlide(index)}
                        className={`w-3 h-3 rounded-full cursor-pointer ${slide === index ? "bg-orange-400" : "bg-gray-300"
                            }`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default Onboarding;
