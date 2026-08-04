import Link from "next/link";
import type { ContentModule } from "@/lib/types";

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
      {modules.map((module) => (
        <Link href={module.href} className="module-card" key={module.href}>
          <span className="module-icon">{module.icon}</span>
          <div>
            <small>{module.eyebrow}</small>
            <h3>{module.title}</h3>
            <p>{module.description}</p>
          </div>
          <span className="module-arrow">↗</span>
        </Link>
      ))}
    </div>
  );
}

export function BackLink({ href, label = "ย้อนกลับ" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="back-link">
      ← {label}
    </Link>
  );
}
