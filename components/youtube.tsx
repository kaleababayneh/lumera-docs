export function YouTube({
  id,
  title,
}: {
  id: string;
  title?: string;
}) {
  return (
    <figure className="my-6 not-prose mx-auto w-full">
      <div className="relative w-full overflow-hidden rounded-xl border border-fd-foreground/10 aspect-video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title || "YouTube video"}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </figure>
  );
}
