export type EngineeringNode = { id: string; label: string; detail: string; edgeCase: string };
export type ProjectEngineering = { title: string; nodes: EngineeringNode[]; sources: { label: string; url: string }[] };

const augustSources = [
  { label: 'useVKAuth.js', url: 'https://github.com/ItsZeroFour/vk_miniapp/blob/main/client/src/hooks/useVKAuth.js' },
  { label: 'VKControllers.js', url: 'https://github.com/ItsZeroFour/vk_miniapp/blob/main/server/components/VKControllers.js' },
];
const aiSources = [
  { label: 'UploadImage.jsx', url: 'https://github.com/ItsZeroFour/binomo_neyro/blob/main/client/src/screens/upload_image/UploadImage.jsx' },
  { label: 'NeyroImageGenerate.jsx', url: 'https://github.com/ItsZeroFour/binomo_neyro/blob/main/client/src/screens/neyro_image_generate/NeyroImageGenerate.jsx' },
];

export const projectEngineering: Record<string, Record<'ru' | 'en', ProjectEngineering>> = {
  'avgust-promo': {
    ru: {
      title: 'От запуска до выполненного задания',
      sources: augustSources,
      nodes: [
        { id: 'launch', label: 'VK Bridge', detail: 'Хук запрашивает параметры запуска у VK Bridge. Идентификатор пользователя и подпись передаются серверу для входа.', edgeCase: 'Ошибка Bridge хранится отдельно от состояния загрузки; загрузка завершается и при неудаче.' },
        { id: 'api', label: 'VK API', detail: 'Node.js проверяет подписку, комментарий и репост через методы VK API. У каждого действия свой запрос и результат.', edgeCase: 'Без токена и идентификатора пользователя сервер возвращает 401 до обращения к VK API.' },
        { id: 'tasks', label: 'Статусы заданий', detail: 'Кастомные хуки связывают ответы API с состоянием пользователя. Подтверждённое действие записывается на сервер.', edgeCase: 'Сохранённая подписка сразу даёт выполненный статус: повторная проверка для неё не нужна.' },
        { id: 'games', label: 'Прогресс игр', detail: 'Результаты трёх мини-игр хранятся отдельно. Сервер проверяет условие завершения каждой игры перед записью прогресса.', edgeCase: 'Невыполненное условие победы возвращает 403, а не успешный результат.' },
      ],
    },
    en: {
      title: 'From launch to completed task',
      sources: augustSources,
      nodes: [
        { id: 'launch', label: 'VK Bridge', detail: 'A hook requests launch parameters from VK Bridge. The user ID and signature go to the server to sign in.', edgeCase: 'Bridge errors are stored separately from loading; loading also ends after a failed request.' },
        { id: 'api', label: 'VK API', detail: 'Node.js checks subscriptions, comments and reposts through VK API methods. Each action has its own request and result.', edgeCase: 'Requests without a token and user ID return 401 before reaching the VK API.' },
        { id: 'tasks', label: 'Task states', detail: 'Custom hooks connect API responses to user state. Confirmed actions are persisted on the server.', edgeCase: 'A saved subscription immediately counts as complete, without another subscription check.' },
        { id: 'games', label: 'Game progress', detail: 'The three mini-games have separate completion states. The server checks each game’s completion condition before recording progress.', edgeCase: 'An unmet win condition returns 403 instead of a successful result.' },
      ],
    },
  },
  'credit-applications': {
    ru: {
      title: 'Как снимок попадает в заявку',
      sources: [],
      nodes: [
        { id: 'camera', label: 'Камера', detail: 'На телефоне открывается камера с рамкой документа. На широком экране тот же компонент принимает готовый файл.', edgeCase: 'Отказ в доступе или отсутствие камеры закрывает модальное окно и показывает причину.' },
        { id: 'crop', label: 'Координаты', detail: 'Положение рамки переводится из координат экрана в координаты исходного видео. Canvas вырезает только эту область.', edgeCase: 'Расчёт учитывает object-fit: cover: отдельно для видео, обрезанного по бокам или по высоте.' },
        { id: 'preview', label: 'Предпросмотр', detail: 'После съёмки появляется JPEG и два действия: подтвердить или переснять. Пересъёмка возвращает к камере.', edgeCase: 'Перед подтверждением проверяется размер файла. Лимит снимка — 10 МБ.' },
        { id: 'upload', label: 'Отправка', detail: 'Redux thunk отправляет FormData. Полученный путь к файлу записывается в соответствующее поле фотографий пользователя.', edgeCase: 'Pending, fulfilled и rejected раздельно управляют загрузкой, результатом и ошибкой.' },
      ],
    },
    en: {
      title: 'From camera frame to application',
      sources: [],
      nodes: [
        { id: 'camera', label: 'Camera', detail: 'On a phone, a camera opens with a document frame. On a wide screen, the same component accepts an existing file.', edgeCase: 'Denied access or a missing camera closes the modal and explains the reason.' },
        { id: 'crop', label: 'Coordinates', detail: 'The document frame is mapped from screen coordinates to the original video. Canvas crops that region into a photo.', edgeCase: 'The calculation accounts for object-fit: cover, whether the video is cropped horizontally or vertically.' },
        { id: 'preview', label: 'Preview', detail: 'The captured JPEG has two actions: confirm or retake. Retaking returns to the camera.', edgeCase: 'The file size is checked before confirmation. Photos have a 10 MB limit.' },
        { id: 'upload', label: 'Upload', detail: 'A Redux thunk sends FormData. The returned file path is written to the matching field in the user’s photos.', edgeCase: 'Pending, fulfilled and rejected manage loading, success and errors separately.' },
      ],
    },
  },
  'retail-promo-game': {
    ru: {
      title: 'Игровая попытка и награда',
      sources: [],
      nodes: [
        { id: 'balance', label: 'Баланс попыток', detail: 'При старте уровня сервер сначала списывает обычную попытку, затем бонусную. Новый баланс возвращается в ответе.', edgeCase: 'При нулевом балансе уровень не запускается: ответ содержит отказ и остатки обоих типов попыток.' },
        { id: 'quiz', label: 'Ежедневный квиз', detail: 'Когда попытки закончились, доступен следующий активный вопрос. Сервер исключает вопросы, на которые пользователь уже ответил.', edgeCase: 'Повторный ответ в тот же московский день отклоняется. Если вопросы закончились, квиз также недоступен.' },
        { id: 'reward', label: 'Начисление', detail: 'Правильный ответ добавляет одну попытку и запись в журнал начислений. Ответ на вопрос сохраняется независимо от результата.', edgeCase: 'Сервер проверяет, что присланный вопрос действительно следующий, а вариант ответа принадлежит этому вопросу.' },
        { id: 'prize', label: 'Приз уровня', detail: 'Награда берётся из настроек админки: бустер или промокод. Результат уровня и выдача сохраняются в профиле пользователя.', edgeCase: 'Повторно полученный промокод не выдаётся ещё раз; отсутствие настроенного приза возвращает ошибку.' },
      ],
    },
    en: {
      title: 'A game attempt and its reward',
      sources: [],
      nodes: [
        { id: 'balance', label: 'Attempt balance', detail: 'Starting a level spends a regular attempt first, then a bonus attempt. The response returns the updated balance.', edgeCase: 'With no attempts left, the level does not start. The response includes both remaining balances.' },
        { id: 'quiz', label: 'Daily quiz', detail: 'When attempts run out, the next active question becomes available. Previously answered questions are excluded.', edgeCase: 'Another answer on the same Moscow calendar day is rejected. The quiz is also unavailable when no questions remain.' },
        { id: 'reward', label: 'Accrual', detail: 'A correct answer adds one attempt and an accrual log entry. The answer is recorded whether it is correct or not.', edgeCase: 'The server checks that the submitted question is next and that the answer belongs to that question.' },
        { id: 'prize', label: 'Level prize', detail: 'Admin settings define a booster or promo code. The level result and reward are stored in the user profile.', edgeCase: 'An existing promo code is not issued again; an unconfigured prize returns an error.' },
      ],
    },
  },
  'ai-image-platform': {
    ru: {
      title: 'От фотографии до генерации',
      sources: aiSources,
      nodes: [
        { id: 'input', label: 'Фотография', detail: 'Пользователь выбирает файл или делает снимок. На экране выбора изображение сжимается в браузере до отправки.', edgeCase: 'Файлы больше 5 МБ отклоняются; доступность камеры проверяется через mediaDevices.' },
        { id: 'workflow', label: 'Workflow', detail: 'Node.js принимает фотографию и подготавливает граф обработки ComfyUI. Затем изображение передаётся на сервер генерации.', edgeCase: 'Запрос без файла возвращает ошибку; неудачная загрузка на сервер генерации получает отдельный ответ.' },
        { id: 'generation', label: 'ComfyUI', detail: 'ComfyUIClient подключается к серверу, ожидает изображения, сохраняет их и закрывает соединение.', edgeCase: 'Переход к результату запускается полученным именем изображения, а не окончанием экранного таймера.' },
        { id: 'result', label: 'Результат', detail: 'Готовую картинку можно скачать или открыть по ссылке. Имя изображения принимается из состояния маршрута или query-параметра.', edgeCase: 'Если имени изображения нет, страница результата возвращает пользователя к загрузке фотографии.' },
      ],
    },
    en: {
      title: 'From photo to generated image',
      sources: aiSources,
      nodes: [
        { id: 'input', label: 'Photo', detail: 'Users choose a file or take a photo. The upload screen compresses the image in the browser before sending it.', edgeCase: 'Files over 5 MB are rejected; camera availability is checked through mediaDevices.' },
        { id: 'workflow', label: 'Workflow', detail: 'Node.js accepts the photo and prepares a ComfyUI processing graph. The image is then sent to the generation server.', edgeCase: 'A request without a file returns an error; an upstream upload failure has a separate response.' },
        { id: 'generation', label: 'ComfyUI', detail: 'ComfyUIClient connects to the server, waits for images, saves them and closes the connection.', edgeCase: 'Navigation to the result depends on a returned image filename, rather than the screen’s countdown.' },
        { id: 'result', label: 'Result', detail: 'The image can be downloaded or opened through a shared link. Its filename comes from route state or a query parameter.', edgeCase: 'Without an image filename, the result page returns the user to photo upload.' },
      ],
    },
  },
  'state-education-site': {
    ru: {
      title: 'Как редактор публикует страницу',
      sources: [],
      nodes: [
        { id: 'page', label: 'Загрузка', detail: 'Редактор находит страницу по адресу и получает её содержимое, заголовок и тип через API.', edgeCase: 'Относительные ссылки на загруженные файлы дополняются адресом сервера для редактирования.' },
        { id: 'state', label: 'История правок', detail: 'Текст и изображения хранятся в Redux. Reducer обёрнут в redux-undo, а кнопки отправляют действия undo и redo.', edgeCase: 'Редактор читает текущее содержимое из present, отдельно от истории предыдущих состояний.' },
        { id: 'preview', label: 'Редактор в iframe', detail: 'После загрузки iframe текущее содержимое отправляется ему через postMessage на заданный домен редактора.', edgeCase: 'Обработчик загрузки снимается при размонтировании компонента.' },
        { id: 'publish', label: 'Публикация', detail: 'Перед PUT-запросом адреса текущего сервера и сайта убираются из HTML. В API уходят текст, заголовок, тип и адрес страницы.', edgeCase: 'Интерфейс различает успешное сохранение, ответ 208 с сообщением и ошибку API.' },
      ],
    },
    en: {
      title: 'How the editor publishes a page',
      sources: [],
      nodes: [
        { id: 'page', label: 'Load', detail: 'The editor finds a page by its URL and fetches its content, title and type from the API.', edgeCase: 'Relative uploaded-file links receive the server URL so they can be used while editing.' },
        { id: 'state', label: 'Edit history', detail: 'Text and images live in Redux. The reducer is wrapped in redux-undo; the controls dispatch undo and redo actions.', edgeCase: 'The editor reads current content from present, separately from the history of earlier states.' },
        { id: 'preview', label: 'Iframe editor', detail: 'After the iframe loads, current content is sent through postMessage to the configured editor domain.', edgeCase: 'The load listener is removed when the component unmounts.' },
        { id: 'publish', label: 'Publish', detail: 'Current server and site URLs are removed from the HTML before a PUT request sends the content, title, type and page URL.', edgeCase: 'The UI distinguishes successful saves, a 208 response with a message, and API failures.' },
      ],
    },
  },
};
