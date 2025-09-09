import z from "zod";

// 予稿稿のZodスキーマ
export const formSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(100, "タイトルは100文字以内で入力してください"),
  lead_paragraph: z.string().max(200, "要約は200文字以内で入力してください"),
  body: z
    .string()
    .min(1, "本文は必須です")
    .min(10, "本文は10文字以上で入力してください"),
  main_image_url: z.string().url("正しいURLを入力してください"),
});

export type ArticleData = z.infer<typeof formSchema>;
