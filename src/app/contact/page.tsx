import { Mail, MapPin, Phone } from "lucide-react";
import { readData } from "@/lib/db";
import { SocialLinks } from "@/components/SocialLinks";

export default async function ContactPage() {
  const { settings } = await readData();

  return (
    <section className="luxury-container grid gap-10 py-12 lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        <p className="fine-label text-plum">Contact</p>
        <h1 className="serif-title mt-3 text-5xl text-aubergine">Speak with Molarè</h1>
        <p className="mt-5 text-lg leading-8 text-onyx/70">For appointments, product questions, and order support, contact the atelier directly.</p>
      </div>
      <div className="grid gap-4">
        {[
          { Icon: Phone, label: "Phone", value: settings.contactPhone, href: `tel:${settings.contactPhone}` },
          { Icon: Mail, label: "Email", value: settings.contactEmail, href: `mailto:${settings.contactEmail}` },
          { Icon: MapPin, label: "Address", value: settings.storeAddress, href: "" }
        ].map(({ Icon, label, value, href }) => (
          <div key={label} className="flex gap-4 border border-aubergine/30 bg-ivory p-5">
            <Icon className="text-plum" />
            <div>
              <p className="fine-label text-aubergine">{label}</p>
              {href ? <a className="mt-2 block text-onyx/74" href={href}>{value}</a> : <p className="mt-2 text-onyx/74">{value}</p>}
            </div>
          </div>
        ))}
        <SocialLinks settings={settings} />
      </div>
    </section>
  );
}
