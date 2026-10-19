import Link from "next/link";
import { ArrowRight, Check, Images, LayoutDashboard, Users, WalletCards } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/Footer";

const pillars = [
  [LayoutDashboard, "Run the creative business", "Quotes, invoices, contracts, expenses and equipment-assisted pricing in one workspace."],
  [Users, "Manage clients and projects", "Keep relationships, briefs, schedules and deliverables connected from first conversation to final handoff."],
  [Images, "Deliver creative work", "Share private galleries for client access, review, selection and delivery without exposing client work publicly."],
  [WalletCards, "Build a professional portfolio", "Select approved public projects, shape your presentation and publish a shareable creative identity."],
] as const;

export default function HomePage() {
  return <div className=""><Header /><main>
    <section className="">
      <div className=""><p className="ui-eyebrow">Creative business infrastructure</p><h1 className="">Your creative business. One connected workspace.</h1><p className="">Manage clients, projects, creative delivery and business operations from one considered home for your studio.</p><div className=""><Link className="ui-button ui-button-primary ui-button-lg" href="/sign-up">Get started <ArrowRight className="" /></Link><Link className="ui-button ui-button-outline ui-button-lg" href="/workflow">Explore the workflow</Link></div></div>
      <div className=""><div className=""><div className=""><div><p className="">Creator workspace</p><p className="">Today, in focus</p></div><span className="">Private</span></div><div className=""><div className=""><p className="">Active projects</p><p className="">Projects</p><p className="">Briefs, timelines and deliverables</p></div><div className=""><p className="">Creative delivery</p><p className="">Galleries</p><p className="">A calm handoff for every client</p></div></div><div className=""><div className=""><p className="">Connected workflow</p><span className="">On your terms</span></div><div className=""><div className="" /></div></div></div></div>
    </section>
    <section className=""><div className=""><div className=""><p className="ui-eyebrow">Less context switching</p><h2 className="">The work is creative. The operations should feel clear.</h2><p className="">Scattered tools create scattered context. KIPSMTHN keeps client records, project details, documents and delivery close enough to move with confidence.</p></div><div className="">{pillars.map(([Icon,title,description]) => <div key={title} className="ui-card"><Icon className="" /><h3 className="">{title}</h3><p className="">{description}</p></div>)}</div></div></section>
    <section className=""><div className=""><div><p className="ui-eyebrow">One connected workflow</p><h2 className="">From onboarding to a portfolio you are proud to share.</h2><div className="">{["Set up your creative identity", "Connect clients, projects and delivery", "Run the business behind the work", "Publish only the work you explicitly approve"].map(item => <div className="" key={item}><Check className="" /><p className="">{item}</p></div>)}</div></div><div className=""><p className="">Public portfolio</p><p className="">A focused front door for your best work.</p><p className="">Your private client galleries stay private. Your selected, published projects become an editorial portfolio with a URL you control.</p><Link className="" href="/workflow">See how it works <ArrowRight className="" /></Link></div></div></section>
    <section className=""><div className=""><p className="ui-eyebrow">Make space for the work</p><h2 className="">Build a creative business that moves with you.</h2><p className="">Start with the essentials, then shape your workspace and public portfolio as your practice grows.</p><Link className="ui-button ui-button-primary ui-button-lg" href="/sign-up">Get started <ArrowRight className="" /></Link></div></section>
  </main><Footer /></div>;
}
