import Link from "next/link";
import { readData } from "@/lib/db";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";

export async function Footer() {
  const { settings } = await readData();

  return (
    <footer className="mt-20 border-t border-champagne/30 bg-aubergine text-ivory">
      <div className="luxury-container grid gap-10 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="grid gap-5">
          <Logo compact inverted />
          <p className="max-w-sm text-sm leading-7 text-ivory/78">Quiet luxury clothing shaped for modern wardrobes, precise occasions, and refined everyday character.</p>
          <p className="fine-label text-champagne">Powered by Zaher Alsehli</p>
        </div>
        <div className="grid content-start gap-3 text-sm text-ivory/82">
          <h3 className="fine-label text-champagne">Contact</h3>
          <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>
          <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          <p>{settings.storeAddress}</p>
        </div>
        <div className="grid content-start gap-4">
          <h3 className="fine-label text-champagne">Explore</h3>
          <div className="grid gap-2 text-sm text-ivory/82">
            <Link href="/shop">Shop Collection</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/cart">Shopping Cart</Link>
          </div>
          <SocialLinks settings={settings} />
        </div>
      </div>
    </footer>
  );
}
