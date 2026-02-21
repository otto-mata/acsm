"use client";

import { useState, useEffect } from "react";
import JSZip from "jszip";

interface UploadedFile {
  name: string;
  uploadedAt?: string;
  size?: number;
  type?: "car" | "track";
}

interface StagedFile {
  file: File;
  id: string;
  type: "car" | "track";
}

const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB

export const ContentUpload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileType, setFileType] = useState<"car" | "track">("car");
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [compressing, setCompressing] = useState(false);

  // Fetch list of uploaded files
  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/uploads");
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleAddFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newStagedFiles = Array.from(fileList).map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      type: fileType, // Default type, can be changed individually
    }));

    setStagedFiles((prev) => [...prev, ...newStagedFiles]);
    setMessage(null);
  };

  const updateFileType = (id: string, newType: "car" | "track") => {
    setStagedFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, type: newType } : file)),
    );
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAddFiles(e.target.files);
  };

  const handleFolderInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setCompressing(true);
    setMessage({ type: "success", text: "Compressing folder..." });

    try {
      const zip = new JSZip();
      const folderName = files[0].webkitRelativePath.split("/")[0];

      // Add all files to the zip
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relativePath = file.webkitRelativePath;
        zip.file(relativePath, file);
      }

      // Generate the zip file
      const zipBlob = await zip.generateAsync(
        {
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        },
        (metadata) => {
          // Update progress
          setMessage({
            type: "success",
            text: `Compressing folder... ${metadata.percent.toFixed(0)}%`,
          });
        },
      );

      // Create a File object from the blob
      const zipFile = new File([zipBlob], `${folderName}.zip`, {
        type: "application/zip",
      });

      // Add the zip file to staged files
      const newStagedFile = {
        file: zipFile,
        id: `${zipFile.name}-${Date.now()}-${Math.random()}`,
        type: fileType,
      };

      setStagedFiles((prev) => [...prev, newStagedFile]);
      setMessage({
        type: "success",
        text: `Folder compressed successfully! (${files.length} files → ${(zipBlob.size / 1024 / 1024).toFixed(2)} MB)`,
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error("Compression error:", error);
      setMessage({
        type: "error",
        text:
          "Failed to compress folder: " +
          (error instanceof Error ? error.message : "Unknown error"),
      });
    } finally {
      setCompressing(false);
      // Reset the input
      e.target.value = "";
    }
  };

  const removeStagedFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAllStagedFiles = () => {
    setStagedFiles([]);
  };

  const handleUpload = async () => {
    if (stagedFiles.length === 0) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      stagedFiles.forEach(({ file, type }) => {
        formData.append("file", file);
        formData.append("type", type);
      });

      // Use XMLHttpRequest to track upload progress for large files
      const totalSize = stagedFiles.reduce(
        (sum, { file }) => sum + file.size,
        0,
      );
      const hasLargeFiles = totalSize > LARGE_FILE_THRESHOLD;

      if (hasLargeFiles) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              setUploadProgress({ overall: percentComplete });
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
              const result = JSON.parse(xhr.responseText);
              if (result.success) {
                setMessage({
                  type: "success",
                  text: `Successfully uploaded ${result.count || 1} file(s)`,
                });
                setStagedFiles([]);
                setUploadProgress({});
                setTimeout(() => fetchFiles(), 500);
              } else {
                setMessage({
                  type: "error",
                  text: result.error || "Upload failed",
                });
              }
            } else {
              setMessage({
                type: "error",
                text: "Upload failed with status " + xhr.status,
              });
            }
            setUploading(false);
            resolve(null);
          });

          xhr.addEventListener("error", () => {
            setMessage({
              type: "error",
              text: "Upload error",
            });
            setUploading(false);
            reject(new Error("Upload error"));
          });

          xhr.open("POST", "/api/upload");
          xhr.send(formData);
        });
      } else {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          setMessage({
            type: "success",
            text: `Successfully uploaded ${result.count || 1} file(s)`,
          });
          setStagedFiles([]);
        } else {
          setMessage({
            type: "error",
            text: result.error || "Upload failed",
          });
        }
        setTimeout(() => fetchFiles(), 500);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          "Upload error: " +
          (error instanceof Error ? error.message : "Unknown error"),
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const items = e.dataTransfer.items;
    if (!items) {
      handleAddFiles(e.dataTransfer.files);
      return;
    }

    // Check if any items are directories
    let hasDirectory = false;
    const entries: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          entries.push(entry);
          if (entry.isDirectory) {
            hasDirectory = true;
          }
        }
      }
    }

    if (hasDirectory) {
      // Process directories
      await processDroppedEntries(entries);
    } else {
      // Just regular files
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const processDroppedEntries = async (entries: any[]) => {
    for (const entry of entries) {
      if (entry.isDirectory) {
        await compressDirectory(entry);
      } else if (entry.isFile) {
        // Add individual file
        entry.file((file: File) => {
          const newStagedFile = {
            file,
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            type: fileType,
          };
          setStagedFiles((prev) => [...prev, newStagedFile]);
        });
      }
    }
  };

  const compressDirectory = async (directoryEntry: any) => {
    setCompressing(true);
    setMessage({ type: "success", text: "Compressing folder..." });

    try {
      const zip = new JSZip();
      const folderName = directoryEntry.name;

      // Read all files from directory recursively
      await readDirectory(directoryEntry, zip, "");

      // Generate the zip file
      const zipBlob = await zip.generateAsync(
        {
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        },
        (metadata) => {
          setMessage({
            type: "success",
            text: `Compressing folder... ${metadata.percent.toFixed(0)}%`,
          });
        },
      );

      // Create a File object from the blob
      const zipFile = new File([zipBlob], `${folderName}.zip`, {
        type: "application/zip",
      });

      // Add the zip file to staged files
      const newStagedFile = {
        file: zipFile,
        id: `${zipFile.name}-${Date.now()}-${Math.random()}`,
        type: fileType,
      };

      setStagedFiles((prev) => [...prev, newStagedFile]);
      setMessage({
        type: "success",
        text: `Folder compressed successfully! (${(zipBlob.size / 1024 / 1024).toFixed(2)} MB)`,
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error("Compression error:", error);
      setMessage({
        type: "error",
        text:
          "Failed to compress folder: " +
          (error instanceof Error ? error.message : "Unknown error"),
      });
    } finally {
      setCompressing(false);
    }
  };

  const readDirectory = async (
    directoryEntry: any,
    zip: JSZip,
    path: string,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const dirReader = directoryEntry.createReader();
      const entries: any[] = [];

      const readEntries = () => {
        dirReader.readEntries(
          async (results: any[]) => {
            if (results.length === 0) {
              // Done reading this directory
              for (const entry of entries) {
                if (entry.isFile) {
                  await new Promise<void>((resolveFile) => {
                    entry.file((file: File) => {
                      const filePath = path
                        ? `${directoryEntry.name}/${path}/${file.name}`
                        : `${directoryEntry.name}/${file.name}`;
                      zip.file(filePath, file);
                      resolveFile();
                    });
                  });
                } else if (entry.isDirectory) {
                  const newPath = path ? `${path}/${entry.name}` : entry.name;
                  await readDirectory(entry, zip, newPath);
                }
              }
              resolve();
            } else {
              entries.push(...results);
              readEntries(); // Continue reading
            }
          },
          (error: any) => {
            reject(error);
          },
        );
      };

      readEntries();
    });
  };

  const handleDeleteFile = async (fileName: string, fileType?: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: fileName, type: fileType }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: "File deleted successfully" });
        fetchFiles();
      } else {
        setMessage({ type: "error", text: "Failed to delete file" });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          "Delete error: " +
          (error instanceof Error ? error.message : "Unknown error"),
      });
    }
  };

  const handleMoveFile = async (
    fileName: string,
    currentType: string,
    newType: string,
  ) => {
    if (
      !confirm(
        `Are you sure you want to move "${fileName}" from ${currentType} to ${newType}?`,
      )
    )
      return;

    try {
      const response = await fetch("/api/upload", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: fileName,
          currentType: currentType,
          newType: newType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: `File moved to ${newType} successfully`,
        });
        fetchFiles();
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to move file",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          "Move error: " +
          (error instanceof Error ? error.message : "Unknown error"),
      });
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "Unknown";
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="">
      <div className="max-w-6xl mx-auto">
        {/* Upload Section */}
        <div className=" p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Upload Files
          </h2>

          {/* File Type Selection - Only shown when no files are staged */}
          {stagedFiles.length === 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Default File Type
              </label>
              <div className="flex gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="fileType"
                    value="car"
                    checked={fileType === "car"}
                    onChange={(e) =>
                      setFileType(e.target.value as "car" | "track")
                    }
                    disabled={uploading}
                    className="w-4 h-4 text-indigo-600 cursor-pointer"
                  />
                  <span className="ml-3 text-gray-700 font-medium">🚗 Car</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="fileType"
                    value="track"
                    checked={fileType === "track"}
                    onChange={(e) =>
                      setFileType(e.target.value as "car" | "track")
                    }
                    disabled={uploading}
                    className="w-4 h-4 text-indigo-600 cursor-pointer"
                  />
                  <span className="ml-3 text-gray-700 font-medium">
                    🏁 Track
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                You can change the type for each file individually after adding
                them.
              </p>
            </div>
          )}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              dragActive
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag and drop your files here
            </p>
            <p className="text-gray-500 mb-4">or</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <label className="inline-block">
                <input
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  disabled={uploading || compressing}
                  className="hidden"
                  accept="*/*"
                />
                <span className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer font-medium inline-block disabled:opacity-50">
                  📄 Select Files
                </span>
              </label>
              <label className="inline-block">
                <input
                  type="file"
                  // @ts-ignore - webkitdirectory is not in TypeScript definitions
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleFolderInput}
                  disabled={uploading || compressing}
                  className="hidden"
                />
                <span
                  className={`px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer font-medium inline-block ${
                    uploading || compressing
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {compressing ? "⏳ Compressing..." : "📁 Select Folder"}
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Folders will be automatically compressed before upload
            </p>
          </div>

          {/* Staged Files List */}
          {stagedFiles.length > 0 && (
            <div className="mt-8 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Files to Upload ({stagedFiles.length})
              </h3>
              <div className="space-y-3 mb-6">
                {stagedFiles.map(({ file, id, type }) => (
                  <div
                    key={id}
                    className="flex items-center justify-between bg-white p-4 rounded border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium text-gray-800">
                          {file.name}
                        </p>
                        {file.name.endsWith(".zip") && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">
                            📦 Compressed Folder
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <div className="flex gap-3">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`type-${id}`}
                              value="car"
                              checked={type === "car"}
                              onChange={() => updateFileType(id, "car")}
                              disabled={uploading}
                              className="w-3.5 h-3.5 text-indigo-600 cursor-pointer"
                            />
                            <span className="ml-1.5 text-xs text-gray-700 font-medium">
                              🚗 Car
                            </span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`type-${id}`}
                              value="track"
                              checked={type === "track"}
                              onChange={() => updateFileType(id, "track")}
                              disabled={uploading}
                              className="w-3.5 h-3.5 text-indigo-600 cursor-pointer"
                            />
                            <span className="ml-1.5 text-xs text-gray-700 font-medium">
                              🏁 Track
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeStagedFile(id)}
                      disabled={uploading}
                      className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload Progress Bar */}
              {uploading && uploadProgress.overall !== undefined && (
                <div className="mb-6 p-4 bg-white rounded border border-indigo-200">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      Uploading...
                    </p>
                    <p className="text-sm font-semibold text-indigo-600">
                      {uploadProgress.overall}%
                    </p>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
                      style={{ width: `${uploadProgress.overall}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading || stagedFiles.length === 0}
                  className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading
                    ? `Uploading... ${uploadProgress.overall || 0}%`
                    : "Upload Files"}
                </button>
                <button
                  onClick={clearAllStagedFiles}
                  disabled={uploading}
                  className="flex-1 px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`rounded-lg p-4 mb-8 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Files Section */}
        <div className=" p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Uploaded Files ({files.length})
          </h2>

          {files.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No files uploaded yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      File Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Size
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Uploaded
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr
                      key={file.name}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-800">{file.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium w-fit inline-block ${
                              file.type === "car"
                                ? "bg-blue-100 text-blue-800"
                                : file.type === "track"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {file.type === "car"
                              ? "🚗 Car"
                              : file.type === "track"
                                ? "🏁 Track"
                                : "Unknown"}
                          </span>
                          {file.type &&
                            (file.type === "car" || file.type === "track") && (
                              <button
                                onClick={() =>
                                  handleMoveFile(
                                    file.name,
                                    file.type,
                                    file.type === "car" ? "track" : "car",
                                  )
                                }
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                title={`Move to ${file.type === "car" ? "track" : "car"}`}
                              >
                                ↔️
                              </button>
                            )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {file.uploadedAt
                          ? new Date(file.uploadedAt).toLocaleDateString()
                          : "Unknown"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`/uploads/${encodeURIComponent(file.name)}`}
                          download
                          className="text-indigo-600 hover:text-indigo-800 mr-4 inline-block"
                        >
                          Download
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file.name, file.type)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
