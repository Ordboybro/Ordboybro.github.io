# Бесплатная регистрация и онлайн для Emoji Drops

GitHub Pages сам по себе не хранит аккаунты и не поддерживает серверные WebSocket-соединения. Для регистрации, входа с разных устройств и Live Drops нужен отдельный backend.

## Рекомендуемый вариант: Supabase Free

Supabase Free сейчас включает бесплатный Postgres, Auth, Realtime и 500 MB базы; бесплатный проект может приостанавливаться после недели без активности. Лимиты подходят для прототипа/небольшого проекта. Не храните пароли самостоятельно и не используйте `localStorage` как источник истины для баланса.

### 1. Создать проект

1. Создать бесплатный проект в Supabase.
2. В Authentication включить Email provider.
3. Включить подтверждение email.
4. Скопировать Project URL и publishable/anon key.
5. Добавить их в отдельный `js/supabase-config.js` (этот файл не должен содержать service-role key).

### 2. Таблицы

Минимальная схема:

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 24),
  balance integer not null default 250 check (balance >= 0),
  created_at timestamptz not null default now()
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null,
  emoji text not null,
  rarity text not null,
  price integer not null check (price >= 0),
  created_at timestamptz not null default now()
);

create table public.live_drops (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  nickname text not null,
  item_key text not null,
  emoji text not null,
  rarity text not null,
  price integer not null check (price >= 0),
  created_at timestamptz not null default now()
);

create index inventory_user_id_idx on public.inventory(user_id);
create index live_drops_created_at_idx on public.live_drops(created_at desc);
```

### 3. RLS

RLS обязателен. Клиентский ключ можно публиковать, `service_role` — никогда.

```sql
alter table public.profiles enable row level security;
alter table public.inventory enable row level security;
alter table public.live_drops enable row level security;

create policy "profiles own row"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles own update"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "inventory own rows"
on public.inventory for select
using (auth.uid() = user_id);

create policy "live drops public read"
on public.live_drops for select
using (true);
```

Изменение баланса, открытие кейса, продажу и Upgrade нельзя доверять клиенту. Для них нужен server-side RPC/Edge Function/Worker, который атомарно проверяет баланс, рассчитывает результат и записывает транзакцию.

## Вход с компьютера на телефон

Пользователь входит через Supabase Auth одним email/паролем на любом устройстве. После входа профиль и инвентарь загружаются по `auth.uid()`. Никакого копирования `localStorage` между устройствами не требуется.

## Настоящий Live Drops

После успешного server-side открытия кейса сервер вставляет строку в `live_drops`. Клиенты подписываются через Supabase Realtime на INSERT и сразу добавляют Drop в ленту.

Поток:

```text
ПК открыл кейс
  -> backend проверил баланс
  -> backend выбрал предмет
  -> transaction записала результат
  -> INSERT live_drops
  -> Realtime
  -> телефон получил INSERT
  -> Live Drops обновился
```

## Онлайн-счётчик

Для небольшого проекта можно использовать Realtime presence: каждый клиент регистрирует presence с коротким session id, а сервер/клиенты получают `sync/join/leave`. Не считайте онлайн как `128 + users.length`: это не количество реально подключённых устройств.

Если нужен более контролируемый счётчик и WebSocket-состояние, бесплатный Cloudflare Workers + SQLite Durable Object тоже подходит: Workers Free даёт 100 000 запросов в сутки, а SQLite Durable Objects доступны на Free. Это хороший вариант именно для presence/live-state, но добавляет отдельный backend.

## Важное про "полностью бесплатно"

Для текущего этапа — да: GitHub Pages + Supabase Free можно использовать без платного сервера. Но бесплатные тарифы имеют лимиты и могут приостанавливать неактивные проекты. При росте проекта расходы могут появиться.

## Что НЕ делать

- Не хранить пароль в `localStorage`.
- Не считать баланс только в JavaScript.
- Не доверять клиентскому `chance`.
- Не принимать от клиента готовый результат Upgrade.
- Не использовать Supabase `service_role` key в браузере.
- Не считать онлайн как фиксированные `128 + users.length`.

## Этапы внедрения

1. Supabase Auth + email confirmation.
2. `profiles` + RLS.
3. Перенос inventory/balance на сервер.
4. Server-side кейс и Upgrade.
5. Realtime Live Drops.
6. Presence для онлайн-счётчика.
7. Только после этого — 2FA и дополнительные антифрод-проверки.
