import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "What counts as one request?",
    a: "A request is one change, feature, or fix — e.g. \"add a pricing page\" or \"fix the mobile nav\". On Build, we work one active request at a time, but you can queue as many as you like.",
  },
  {
    q: "Can I switch between Build and Maintain?",
    a: "Yes, anytime from your billing settings. If you switch mid-cycle we prorate the difference.",
  },
  {
    q: "What if I'm on Maintain and need a new feature?",
    a: "Maintain covers hosting, monitoring, security patches, and bug fixes only. New features require Build — you can upgrade with one click from the request form.",
  },
  {
    q: "Where does my project deploy?",
    a: "Every project deploys to Vercel. You get a production URL, and every deploy shows up in your chat in real time.",
  },
  {
    q: "Do I own the code?",
    a: "Yes. Your repository and production deployment are yours.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-y border-hairline bg-white/60 py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQS.map((item) => (
            <AccordionItem key={item.q} value={item.q} className="border-hairline">
              <AccordionTrigger className="text-left font-display text-base font-medium text-ink">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-ink">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
