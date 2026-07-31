"use client";

import { useState } from "react";
import { Icon, type IconName } from "./Icons";

export type AllAppGroup = {
  eyebrow: string;
  title: string;
  apps: Array<{
    href: string;
    label: string;
    description: string;
    icon: IconName;
  }>;
};

export function AppFolder({ groups }: { groups: AllAppGroup[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="app-launcher-card app-launcher-more app-folder-trigger"
        aria-expanded={open}
        aria-controls="all-meemon-apps"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="app-launcher-art">
          <img
            src="/v2/assets/app-icons/more.png"
            alt=""
            width="640"
            height="640"
          />
        </span>
        <span className="app-launcher-copy">
          <small>EXPLORE</small>
          <strong>แอปอื่น ๆ</strong>
        </span>
      </button>

      <div className="all-apps-panel" id="all-meemon-apps" hidden={!open}>
        <div className="all-apps-heading">
          <div>
            <div className="eyebrow">ALL MEEMON APPS</div>
            <h2>ทุกแอป รวมอยู่ตรงนี้</h2>
          </div>
          <p>กด “แอปอื่น ๆ” อีกครั้งเพื่อปิดโฟลเดอร์</p>
        </div>
        <div className="all-apps-groups">
          {groups.map((group) => (
            <section className="all-app-group" key={group.title}>
              <div className="all-app-group-heading">
                <small>{group.eyebrow}</small>
                <h3>{group.title}</h3>
              </div>
              <div className="all-app-list">
                {group.apps.map((app) => (
                  <a href={app.href} className="all-app-link" key={app.href}>
                    <span className="all-app-icon">
                      <Icon name={app.icon} />
                    </span>
                    <span>
                      <strong>{app.label}</strong>
                      <small>{app.description}</small>
                    </span>
                    <Icon name="arrow-up-right" />
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
