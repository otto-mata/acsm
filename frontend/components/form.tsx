"use client";

export const Form = () => {
  let fileInput: HTMLInputElement | null = null;
  return (
    <form
      action={async (formData) => {
        console.log(formData);
        // if (e.target.files) {
        //   const formData = new FormData();
        //   Object.values(e.target.files).forEach((file) => {
        //     formData.append("file", file);
        //   });

        //   const response = await fetch("/api/upload", {
        //     method: "POST",
        //     body: formData,
        //   });

        //   const result = await response.json();
        //   if (result.success) {
        //     alert("Upload ok : " + result.name);
        //   } else {
        //     alert("Upload failed");
        //   }
        // }
      }}
    >
      <input
        type="file"
        name="file"
        ref={(input) => {
          fileInput = input;
        }}
      />
      <input type="submit" value="submit" />
    </form>
  );
};
