import {
  Inbox,
  SearchX,
} from "lucide-react";

const EmptyState = ({
  title = "No records found",
  description = "There are no records to display at the moment.",
  search = false,
  action,
}) => {
  const Icon = search ? SearchX : Inbox;

  return (
    <div
      className="
        flex
        min-h-[280px]
        flex-col
        items-center
        justify-center

        rounded-2xl
        border
        border-dashed
        border-slate-200

        bg-white

        px-6
        py-10

        text-center
      "
    >

      {/* Icon */}
      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center

          rounded-2xl

          bg-slate-50
          text-slate-400
        "
      >
        <Icon size={26} />
      </div>

      <h3
        className="
          mt-4
          text-sm
          font-bold
          text-slate-800
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-1.5
          max-w-md

          text-xs
          leading-5

          text-slate-500
        "
      >
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}

    </div>
  );
};

export default EmptyState;