create table if not exists public.homepage_content (
  id text primary key default 'default',
  hero_image_url text not null default '',
  hero_kicker text not null default 'LUXURY ITALIAN SARTORIAL FASHION',
  hero_title text not null default 'Refined Clothing for a Modern Wardrobe',
  hero_subtitle text not null default 'Sartorial elegance, polished into character.',
  primary_cta_label text not null default 'Shop Collection',
  primary_cta_href text not null default '/shop',
  secondary_cta_label text not null default 'Contact Us',
  secondary_cta_href text not null default '/contact',
  feature_1_text text not null default 'Aubergine tailoring',
  feature_2_text text not null default 'Purple accents',
  feature_3_text text not null default 'Clean ivory restraint',
  updated_at timestamptz not null default now(),
  constraint homepage_content_singleton check (id = 'default')
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_homepage_content_updated_at on public.homepage_content;
create trigger set_homepage_content_updated_at
before update on public.homepage_content
for each row
execute function public.set_updated_at();

insert into public.homepage_content (id)
values ('default')
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
