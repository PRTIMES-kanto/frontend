import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zodスキーマの定義
const formSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(100, "タイトルは100文字以内で入力してください"),
  lead_paragraph: z.string().max(200, "要約は200文字以内で入力してください"),
  image_url: z.string(),
  body: z
    .string()
    .min(1, "本文は必須です")
    .min(10, "本文は10文字以上で入力してください"),
  contact: z.string().min(1, "連絡先は必須です"),
});

type FormData = z.infer<typeof formSchema>;

const Post = () => {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      lead_paragraph: "",
      image_url: "",
      body: "",
      contact: "",
    },
  });

  // 文字数カウント用
  const watchedFields = watch(["title", "lead_paragraph"]);

  const onSubmit = async (data: FormData) => {
    setSubmitStatus("idle");

    try {
      // 実際のAPI呼び出しをシミュレート
      await new Promise((resolve) => setTimeout(resolve, 2000));
      //   const response = await fetch("https://localhost:10000", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(data),
      //   });
      //   if (!response.ok) {
      //     throw new Error("Network response was not ok");
      //   }

      console.log("フォームデータ:", data);
      setSubmitStatus("success");

      // 成功時はフォームをリセット
      reset();
    } catch (error) {
      setSubmitStatus("error");
      console.error("送信エラー:", error);
    }
  };

  const fieldConfigs = [
    {
      id: "title",
      name: "title" as const,
      label: "タイトル",
      placeholder: "記事のタイトルを入力してください",
      rows: 2,
      required: true,
      maxLength: 100,
      showCharCount: true,
    },
    {
      id: "body",
      name: "body" as const,
      label: "本文",
      placeholder: "記事の本文を入力してください（10文字以上）",
      rows: 8,
      required: true,
    },
    {
      id: "lead_paragraph",
      name: "lead_paragraph" as const,
      label: "リード文",
      placeholder: "リード文を入力してください（任意、200文字以内）",
      rows: 4,
      maxLength: 200,
      showCharCount: true,
    },
    {
      id: "image_url",
      name: "image_url" as const,
      label: "画像URL",
      placeholder:
        "画像URLを入力してください（例: https://example.com/image.jpg）",
      rows: 2,
    },
    {
      id: "contact",
      name: "contact" as const,
      label: "連絡先",
      placeholder: "連絡先を入力してください",
      rows: 3,
    },
  ];

  const formStyles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      marginBottom: "30px",
      textAlign: "center" as const,
      color: "#333",
    },
    form: {
      backgroundColor: "#ffffff",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e1e5e9",
    },
    fieldGroup: {
      marginBottom: "24px",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "600" as const,
      color: "#374151",
      fontSize: "14px",
    },
    textarea: {
      width: "100%",
      padding: "12px 16px",
      border: "2px solid #e5e7eb",
      borderRadius: "8px",
      fontSize: "14px",
      lineHeight: "1.5",
      resize: "vertical" as const,
      transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      fontFamily: "inherit",
      outline: "none",
    },
    textareaError: {
      borderColor: "#ef4444",
    },
    error: {
      color: "#ef4444",
      fontSize: "12px",
      marginTop: "4px",
      display: "block",
    },
    charCount: {
      fontSize: "12px",
      color: "#6b7280",
      textAlign: "right" as const,
      marginTop: "4px",
    },
    submitButton: {
      backgroundColor: isSubmitting ? "#9ca3af" : "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "12px 32px",
      fontSize: "16px",
      fontWeight: "600" as const,
      cursor: isSubmitting ? "not-allowed" : "pointer",
      transition: "all 0.2s ease-in-out",
      minWidth: "120px",
    },
    statusMessage: {
      padding: "12px 16px",
      borderRadius: "8px",
      marginTop: "16px",
      textAlign: "center" as const,
      fontSize: "14px",
      fontWeight: "500" as const,
    },
    successMessage: {
      backgroundColor: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    },
    errorMessage: {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
    },
  };

  return (
    <div style={formStyles.container}>
      <h1 style={formStyles.header}>予稿フォーム</h1>

      <form onSubmit={handleSubmit(onSubmit)} style={formStyles.form}>
        {fieldConfigs.map((field) => {
          const hasError = errors[field.name];
          const currentValue = field.showCharCount
            ? watchedFields[field.name === "title" ? 0 : 1] || ""
            : "";

          return (
            <div key={field.id} style={formStyles.fieldGroup}>
              <label htmlFor={field.id} style={formStyles.label}>
                {field.label}
                {field.required && (
                  <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                )}
              </label>

              <textarea
                id={field.id}
                {...register(field.name)}
                rows={field.rows}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                disabled={isSubmitting}
                style={{
                  ...formStyles.textarea,
                  ...(hasError ? formStyles.textareaError : {}),
                }}
                onFocus={(e) => {
                  if (!hasError) {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  if (!hasError) {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }
                }}
              />

              {hasError && (
                <span style={formStyles.error}>{hasError.message}</span>
              )}

              {field.showCharCount && field.maxLength && (
                <div style={formStyles.charCount}>
                  {currentValue.length} / {field.maxLength} 文字
                </div>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          disabled={isSubmitting}
          style={formStyles.submitButton}
          onMouseOver={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = "#2563eb";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseOut={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = "#3b82f6";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          {isSubmitting ? "送信中..." : "投稿する"}
        </button>

        {submitStatus === "success" && (
          <div
            style={{
              ...formStyles.statusMessage,
              ...formStyles.successMessage,
            }}
          >
            ✓ 予稿が正常に送信されました！
          </div>
        )}

        {submitStatus === "error" && (
          <div
            style={{ ...formStyles.statusMessage, ...formStyles.errorMessage }}
          >
            ✗ 送信中にエラーが発生しました。もう一度お試しください。
          </div>
        )}
      </form>
    </div>
  );
};

export default Post;
