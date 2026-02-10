# Правила тёмной темы для разработчика

Документ задаёт сочетания цветов для тёмной темы и правила реализации, чтобы не оставалось белых блоков, тёмного текста на тёмном фоне и «половинчатой» поддержки темы. Источник палитры и компонентов — [DESIGN_REQUIREMENTS.md](DESIGN_REQUIREMENTS.md).

---

## 1. Почему тёмная тема ломается

В приложении тема переключается через **атрибут `data-theme="dark"`** на `<html>`. Цвета задаются **CSS-переменными** в `style.css` (`:root` и `[data-theme='dark']`).

Если в компонентах используются классы Tailwind вида `dark:bg-gray-800`, `text-gray-900 dark:text-gray-100`, они **не переключаются** при `data-theme="dark"`, потому что Tailwind по умолчанию не привязан к этому атрибуту. В итоге в тёмной теме остаются светлые фоны и тёмный текст на тёмном фоне.

**Вывод:** все цвета, зависящие от темы, должны задаваться **только через CSS-переменные** (`var(--color-...)`), а не через классы Tailwind `gray-*` / `white` / `black` и не через `dark:`.

---

## 2. Палитра тёмной темы (сочетания цветов)

Использовать **только** эти токены в тёмной теме. Не изобретать новые оттенки.

| Токен | HEX | Назначение |
|-------|-----|------------|
| `--color-bg-page` | `#0f172a` | Фон страницы (body, основной контейнер). Самый тёмный слой. |
| `--color-surface` | `#1e293b` | Карточки, хедер, панели, фон полей ввода, модалки, сайдбар. Поверхность «выше» фона страницы. |
| `--color-text-primary` | `#f8fafc` | Основной текст (заголовки, имена, основной контент). Максимальный контраст. |
| `--color-text-secondary` | `#cbd5e1` | Вторичный текст (подписи, даты, мета-инфо). |
| `--color-text-muted` | `#94a3b8` | Подсказки, placeholder, неакцентный вспомогательный текст. |
| `--color-border` | `#334155` | Границы карточек, полей, разделители. |
| `--color-accent-start` | `#2DD4BF` | Начало градиента (кнопки primary, активный пункт меню). |
| `--color-accent-end` | `#34D399` | Конец градиента. |
| `--color-accent-secondary` | `#A78BFA` | Фиолетовый акцент (иконки, доп. элементы). |
| `--color-accent-blue` | `#60A5FA` | Ссылки, вторичные кнопки (обводка и текст). |
| `--color-success` | `#34D399` | Успех, «принято», завершённые. |
| `--color-error` | `#F87171` | Ошибки, опасные действия, «отклонено». |
| `--color-warning` | `#FBBF24` | Ожидание, предупреждение. |
| `--shadow-card` | `0 4px 6px rgba(0, 0, 0, 0.2)` | Тень карточек и хедера в тёмной теме. |

**Правило сочетаний:**

- Текст всегда на контрастном фоне: **primary** на `surface` и `bg-page`; **secondary** и **muted** — на тех же фонах, не на тёмном без переменной.
- Фоны: только **bg-page** (страница) и **surface** (карточки, хедер, инпуты). Не использовать белый, не использовать «случайный» тёмный.
- Границы: только **border**. Не использовать `gray-600` и т.п. вручную.
- Ссылки и вторичные кнопки: **accent-blue** для текста и обводки.

---

## 3. Дополнительные токены (если нужны)

Чтобы не оставалось «некрасивых» мест, в `[data-theme='dark']` можно добавить:

| Токен | HEX | Назначение |
|-------|-----|------------|
| `--color-placeholder` | `#94a3b8` | Цвет placeholder в полях ввода (то же, что text-muted, но явно для placeholder). |
| `--color-focus-ring-offset` | `#0f172a` | Фон под кольцом фокуса (обычно совпадает с bg-page), чтобы кольцо было видно. |

В CSS для тёмной темы:

```css
[data-theme='dark'] {
  /* ... существующие переменные ... */
  --color-placeholder: #94a3b8;
  --color-focus-ring-offset: #0f172a;
}
```

Для полей ввода и textarea задать placeholder через `::placeholder { color: var(--color-placeholder); }` в глобальных стилях или в компоненте.

---

## 4. Правила реализации

### 4.1. Общее правило

**Все цвета, которые должны меняться при переключении темы, задавать только через CSS-переменные.** Не использовать:

- `className="bg-white dark:bg-gray-800"` — заменить на `style={{ backgroundColor: 'var(--color-surface)' }}` или `className="..."` с `background-color: var(--color-surface)`.
- `className="text-gray-900 dark:text-gray-100"` — заменить на `style={{ color: 'var(--color-text-primary)' }}`.
- `className="text-gray-600 dark:text-gray-400"` — заменить на `style={{ color: 'var(--color-text-secondary)' }}` или `var(--color-text-muted)`.
- Жёстко заданные `#fff`, `#000`, `rgb(...)` для фона и текста UI — заменить на переменные.

Tailwind-классы для **не цветовых** вещей (отступы, размеры, flex, grid, rounded) использовать можно. Для цветов (text-*, bg-*, border-*) в компонентах — только через переменные.

### 4.2. Что каким токеном красить

| Элемент | Фон | Текст | Граница | Примечание |
|---------|-----|-------|---------|------------|
| Страница (body, main-контейнер) | `--color-bg-page` | `--color-text-primary` | — | У body в style.css уже заданы background и color. |
| Хедер, карточка, модалка, сайдбар | `--color-surface` | наследует или `--color-text-primary` | `--color-border` при необходимости | |
| Поле ввода (input, textarea) | `--color-surface` | `--color-text-primary` | `--color-border`; при ошибке `--color-error` | Placeholder: `--color-text-muted` или `--color-placeholder`. |
| Подпись поля (label) | — | `--color-text-secondary` | — | |
| Основной текст, заголовки | — | `--color-text-primary` | — | |
| Вторичный текст, даты | — | `--color-text-secondary` | — | |
| Подсказки, hint, «необязательно» | — | `--color-text-muted` | — | |
| Ссылки | — | `--color-accent-blue` | — | Hover можно opacity или ярче. |
| Кнопка primary | градиент (accent-start → accent-end) | белый | — | Текст кнопки белый. |
| Кнопка secondary | прозрачный / обводка | `--color-accent-blue` | `--color-accent-blue` | |
| Кнопка danger | `--color-error` | белый | — | |
| Сообщение об ошибке | — | `--color-error` | — | |
| Успех (бейдж, статус) | — | `--color-success` | — | |
| Разделитель, border у блока | — | — | `--color-border` | |
| Оверлей модалки | `rgba(0,0,0,0.5)` | — | — | Допустимо фиксированное значение. |
| Focus ring (outline) | — | — | `--color-accent-end` или accent-start | ring-offset: `--color-focus-ring-offset` или `--color-bg-page`. |
| Disabled кнопка/поле | без смены фона | без смены цвета | — | opacity 0.5–0.6. |
| Чип/тег (нейтральный) | лёгкий слой surface или border | `--color-text-secondary` | `--color-border` | Не белый и не жёсткий серый. |

### 4.3. Иконки и SVG

- Иконки, которые должны быть «цветом текста»: `currentColor` и у родителя задать `color: var(--color-text-primary)` или `--color-text-secondary`.
- Акцентные иконки: обернуть в span с `color: var(--color-accent-secondary)` или `--color-accent-blue)`.

### 4.4. Градиент для primary-кнопки и активного пункта меню

В тёмной теме переменные `--color-accent-start` и `--color-accent-end` уже заданы. Использовать один и тот же класс/стиль в обеих темах:

```css
background: linear-gradient(to right, var(--color-accent-start), var(--color-accent-end));
color: white;
```

Не хардкодить градиент под светлую тему.

---

## 5. Чек-лист при реализации и ревью

- [ ] В `style.css` в `[data-theme='dark']` заданы все переменные из раздела 2; при необходимости добавлены `--color-placeholder` и `--color-focus-ring-offset`.
- [ ] У `body` в любом месте не переопределяются фон и цвет на фиксированные (остаются `var(--color-bg-page)` и `var(--color-text-primary)`).
- [ ] Все карточки, хедер, модалки, сайдбар используют `background: var(--color-surface)` (или эквивалент). Нигде нет `bg-white` или `dark:bg-gray-800` для этих блоков.
- [ ] Все поля ввода и textarea: фон `--color-surface`, текст `--color-text-primary`, граница `--color-border`, placeholder — `--color-text-muted` или `--color-placeholder`. Нет классов `text-gray-900`, `dark:bg-gray-800` и т.п.
- [ ] Весь текст: только переменные `--color-text-primary`, `--color-text-secondary`, `--color-text-muted` (и семантика: success, error, warning). Нет `text-gray-*`.
- [ ] Ссылки и вторичные кнопки: цвет и обводка `--color-accent-blue`.
- [ ] Границы: только `--color-border` (и `--color-error` для полей с ошибкой).
- [ ] Тени карточек/хедера в тёмной теме не «выбиваются» — используется `--shadow-card`, который в dark переопределён на `0 4px 6px rgba(0,0,0,0.2)`.
- [ ] Компоненты из shared (Button, Input, Card, Textarea, ErrorMessage и т.д.) не содержат Tailwind `gray-*` / `white` / `black` для цветов; только переменные или классы, использующие var().
- [ ] Поиск по коду: нет оставшихся `dark:text-gray-`, `dark:bg-gray-`, `text-gray-900`, `bg-white` в UI-компонентах и страницах (кроме допустимых исключений, если они явно не про тему).

---

## 6. Как править уже сломанные места

1. **Найти все вхождения** Tailwind-цветов, зависящих от темы: `text-gray-*`, `bg-gray-*`, `bg-white`, `border-gray-*`, `dark:*`. Особенно в: Textarea, Input, Card, модалки, страницы (Connections, Requests, Profile, Auth layouts и т.д.).
2. **Заменить по таблице из п. 4.2:**  
   - фон блоков → `style={{ backgroundColor: 'var(--color-surface)' }}` или класс с `var(--color-surface)`;  
   - основной текст → `var(--color-text-primary)`;  
   - вторичный → `var(--color-text-secondary)`;  
   - приглушённый/placeholder → `var(--color-text-muted)`;  
   - границы → `var(--color-border)`;  
   - ошибки → `var(--color-error)`.
3. **Placeholder:** в глобальном CSS добавить, например:
   ```css
   [data-theme='dark'] input::placeholder,
   [data-theme='dark'] textarea::placeholder {
     color: var(--color-placeholder);
   }
   ```
   и убрать из компонентов `placeholder-gray-500` / `dark:placeholder-gray-400`.
4. **Focus ring offset:** у кнопок и полей с `focus:ring-offset-2` задать offset цветом `var(--color-bg-page)` или `var(--color-focus-ring-offset)`, чтобы кольцо было видно на тёмном фоне.

После этих шагов тёмная тема должна быть единообразной: без белых «пятен» и без тёмного текста на тёмном фоне.
