import Link from "next/link";
import type { ContentModule } from "@/lib/types";
import { Icon } from "./Icons";

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className="page-hero">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
      {actions ? <div className="hero-actions">{actions}</div> : null}
    </section>
  );
}

export function ModuleGrid({ modules }: { modules: ContentModule[] }) {
  return (
    <div className="module-grid">
      {modules.map((module) => {
        const content = (
          <>
          <span className="module-icon"><Icon name={module.icon} /></span>
          <div>
            <small>{module.eyebrow}</small>
            <h3>{module.title}</h3>
            <p>{module.description}</p>
          </div>
          <span className="module-arrow"><Icon name="arrow-up-right" /></span>
          </>
        );

        return module.legacy ? (
          <a href={module.href} className="module-card" key={module.href}>
            {content}
          </a>
        ) : (
          <Link href={module.href} className="module-card" key={module.href}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}

export function BackLink({ href, label = "ย้อนกลับ" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="back-link">
      <Icon name="arrow-left" />
      {label}
    </Link>
  );
}
