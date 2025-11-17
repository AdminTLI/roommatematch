import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ApplyProcessFAQ() {
  return (
    <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Application process</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
            <li>Apply with your track, skills, and interest</li>
            <li>30‑min alignment sync with the founder</li>
            <li>Scoped project or issues to start contributing</li>
          </ol>
          <p className="text-xs text-muted-foreground">
            We review applications weekly. Typical contributions are 3–5 hrs/week with clear deliverables.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="paid">
              <AccordionTrigger>Is this paid?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                This is a volunteer builder program. You get mentorship, portfolio work, and a strong reference;
                early contributors may be considered for equity/future roles.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="exams">
              <AccordionTrigger>What if I have exams?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We scope contributions to be flexible. Pause or slow down during exams; pick up after.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="references">
              <AccordionTrigger>Do you provide references?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes—based on shipped contributions and collaboration, we provide references/letters.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}


