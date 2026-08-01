import { AdminClient } from "../../components/AdminClient";

export const metadata = { title: "Meemon Admin", robots: { index: false, follow: false } };

export default function Page() {
  return <section className="content-section admin-page"><AdminClient /></section>;
}

