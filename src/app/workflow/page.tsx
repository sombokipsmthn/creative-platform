import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/Footer";

export const metadata = { title: "Workflow | KIPSMTHN", description: "A connected workflow for creative businesses." };
const stages = [
  ["01", "Set up your creative identity", "Start with the essentials: your name, handle and core profile. Business details, biography, branding and portfolio preferences remain editable in the workspace."],
  ["02", "Manage clients and projects", "Keep each client connected to multiple projects. Capture briefs, status, timelines, locations, services and project stories without rebuilding context."],
  ["03", "Deliver creative work", "Create private galleries for client access, review and selection. Client delivery permissions remain separate from the work you choose to publish publicly."],
  ["04", "Run the business", "Move from quote to invoice and contract while tracking expenses, schedules and equipment-assisted quotation workflows inside the workspace."],
  ["05", "Publish your portfolio", "Select eligible public projects, order them, preview the actual renderer and publish a shareable portfolio URL when the story is ready."],
] as const;
export default function WorkflowPage() { return <div className=""><Header /><main><section className=""><p className="ui-eyebrow">The KIPSMTHN workflow</p><h1 className="">The operational details, connected to the creative work.</h1><p className="">A clear path from first setup to a public portfolio, with private client delivery and business administration kept in their proper place.</p></section><section className=""><div className="">{stages.map(([number,title,description], index) => <article className="" key={number}><p className="">{number}</p><h2 className="">{title}</h2><p className="">{description}</p></article>)}</div></section><section className=""><div className=""><p className="">Designed for separation</p><h2 className="">Private delivery is not public publishing.</h2><p className="">A client gallery can be PIN-protected, unlisted or private. Only explicitly selected projects with public visibility can appear in a published creator portfolio.</p><div className=""><Link className="ui-button ui-button-secondary" href="/sign-up">Get started <ArrowRight className="" /></Link><Link className="" href="/">Back home</Link></div></div></section></main><Footer /></div>; }
