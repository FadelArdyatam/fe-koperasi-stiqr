import { AccordionContent, AccordionItem, AccordionTrigger } from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'

interface TermsListProps {
    title: string;
    handleCheckboxChange: (item: string) => void;
    children: React.ReactNode;
    openItem?: string | null;
    item: string;
    checkedItems: Record<string, boolean>;
}

export const TermsList = ({ title, handleCheckboxChange, children, openItem, item, checkedItems }: TermsListProps) => {
    return (
        <div>
            <AccordionItem value={item} className="w-full border-b pb-2">
                <AccordionTrigger className="flex items-center text-start justify-between w-full py-2 px-4 gap-5">
                    <span>{title}</span>
                    <ChevronDown
                        className={`transform transition-transform duration-200 ${openItem === item ? "rotate-180" : "rotate-0"
                            }`}
                    />
                </AccordionTrigger>
                <AccordionContent className="py-2 px-4">
                    {children}

                    <div className="flex items-center gap-5 mt-5">
                        <input
                            type="checkbox"
                            id={`${item}-checkbox`}
                            checked={checkedItems[item] || false}
                            onChange={() => handleCheckboxChange(item)}
                            className="mt-1"
                        />
                        <p>Saya telah membaca dan menyetujui Syarat dan Ketentuan</p>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </div>
    )
}
