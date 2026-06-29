import { ThreadPlayground } from "@/components/thread-playground";

export function Page() {
  return (
    <ThreadPlayground
      className="size-full"
      initialValue={{
        model: {
          id: "deepseek-v4-flash",
          provider: "deepseek",
        },
      }}
    />
  );
}
