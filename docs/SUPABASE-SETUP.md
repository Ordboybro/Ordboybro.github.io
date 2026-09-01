# Бесплатная регистрация и онлайн для Emoji Drops

## 1. Создать бесплатный backend

Используй Supabase Free. Для этого нужен бесплатный аккаунт на https://supabase.com/.

Создай новый проект и открой **Project Settings → API**.

В `js/supabase-config.js` вставь:

```js
window.EMOJI_DROPS_SUPABASE = Object.freeze({
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_PUBLISHABLE_OR_ANON_KEY'
});
```

Использовать `service_role`/secret key в GitHub Pages **нельзя**.

## 2. Auth

В Supabase открой **Authentication → Providers → Email** и включи Email provider.

Для нормальной регистрации включи подтверждение email. В URL settings добавь:

- `https://ordboybro.github.io`
- `https://ordboybro.github.io/`

После этого `js/supabase-auth.js` предоставляет:

- `EmojiDropsAuth.signUp(email, password, nickname)`
- `EmojiDropsAuth.signIn(email, password)`
- `EmojiDropsAuth.signOut()`
- `EmojiDropsAuth.resetPassword(email)`
- `EmojiDropsAuth.getSession()`

Сессия сохраняется Supabase Auth и может использоваться на ПК и телефоне одним аккаунтом.

## 3. База данных

Не хранить баланс/инвентарь как доверенные данные в `localStorage`. Для production нужны таблицы минимум:

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default 'Игрок',
  balance bigint not null default 250,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  case_id text,
  emoji text not null,
  rarity text not null,
  value bigint not null check (value >= 0),
  created_at timestamptz not null default now()
);

create table public.live_drops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  nickname text,
  case_id text not null,
  item_id text not null,
  emoji text not null,
  rarity text not null,
  value bigint not null check (value >= 0),
  created_at timestamptz not null default now()
);
```

Включить RLS на всех трёх таблицах. Пользователь должен иметь доступ только к своей строке `profiles` и своим `inventory`. `live_drops` можно читать всем авторизованным пользователям.

## 4. Серверная экономика

**Не переносить** открытие кейса и Upgrade просто в клиентский JS.

Нужны Postgres Functions/RPC (или Edge Functions), которые атомарно:

1. проверяют сессию;
2. проверяют баланс;
3. выбирают результат по серверному seed;
4. списывают цену;
5. добавляют предмет;
6. записывают live drop;
7. возвращают результат.

Именно это закрывает чит через DevTools.

## 5. Реальный онлайн

Для онлайн использовать Supabase Realtime Presence:

```js
const channel = EmojiDropsAuth.onlineChannel();

await channel.subscribe(async status => {
  if (status === 'SUBSCRIBED') {
    await channel.track({
      user_id: (await EmojiDropsAuth.getSession())?.user?.id ?? null,
      page: location.pathname,
      connected_at: new Date().toISOString()
    });
  }
});

channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState();
  const online = Object.values(state).reduce((n, arr) => n + arr.length, 0);
  const el = document.querySelector('#onlineCount');
  if (el) el.textContent = String(online);
});
```

Это будет реальный count подключённых вкладок/устройств, а не `128 + users.length`.

## 6. Live Drops между устройствами

После серверного открытия кейса вставлять строку в `live_drops`.

Клиенты подписываются на INSERT:

```js
const channel = EmojiDropsAuth.liveDropsChannel();
channel
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'live_drops'
  }, payload => {
    window.dispatchEvent(new CustomEvent('emoji-drops-live-drop', {
      detail: payload.new
    }));
  })
  .subscribe();
```

Тогда схема будет:

`ПК открыл кейс → RPC → DB INSERT → Realtime → телефон увидел Live Drop`.

## 7. Бесплатность

На старте достаточно Supabase Free + GitHub Pages. Платный сервер для прототипа не нужен.

Но бесплатный тариф имеет лимиты и не является гарантией бесплатности при большом реальном трафике. Перед публичным запуском нужно проверить актуальные лимиты в панели Supabase.

## 8. Безопасность

Нельзя:

- хранить service role key в репозитории;
- доверять `localStorage.balance`;
- рассчитывать выигрыш только в браузере;
- позволять клиенту напрямую менять `profiles.balance`;
- считать онлайн количеством зарегистрированных пользователей.

Для настоящего проекта эти правила обязательны.
