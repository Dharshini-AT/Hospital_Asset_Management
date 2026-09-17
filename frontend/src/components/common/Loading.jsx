import { Loader2 } from "lucide-react";

const Loading = ({
  message = "Loading...",
  fullScreen = false,
}) => {
  return (
    <div
      className={`
        flex
        items-center
        justify-center

        ${
          fullScreen
            ? "min-h-[calc(100vh-72px)]"
            : "min-h-[220px]"
        }
      `}
    >
      <div className="flex flex-col items-center">

        {/* Animated loader */}
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center

            rounded-2xl

            bg-blue-50
            text-blue-600

            shadow-sm
          "
        >
          <Loader2
            size={24}
            className="animate-spin"
          />
        </div>

        <p
          className="
            mt-3
            text-xs
            font-medium
            text-slate-500
          "
        >
          {message}
        </p>

      </div>
    </div>
  );
};

export default Loading;