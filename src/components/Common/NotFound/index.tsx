import type { FC } from "react";

const NotFound: FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="flex flex-col gap-1 items-center">
        <h1 className="ml-4 text-3xl font-extrabold text-red-900">
          Сторінку не знайдено
        </h1>

        <span className="ml-4 text-red-800">
          {"Схоже, сторінка, яку ви шукаєте, не існує."}
        </span>

        <code className="rounded bg-red-100 px-2 py-1 font-bold text-sm text-red-800">
          404 Not Found
        </code>
      </div>
    </div>
  );
};

export default NotFound;
