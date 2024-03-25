"use client";
import React, { useState, useCallback, useRef } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";

interface DataRow {
  [key: string]: string;
}

const Home: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const fileList = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...fileList]);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files) {
      const fileList = Array.from(event.dataTransfer.files);
      setFiles((prevFiles) => [...prevFiles, ...fileList]);
    }
  }, []);

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
    },
    []
  );

  const handleDropAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (files.length === 0) return;

    const mergedData: { [url: string]: DataRow } = {};
    for (const file of files) {
      const text = await file.text();
      const result = Papa.parse<DataRow>(text, { header: true });
      result.data.forEach((row) => {
        const url = row.URL?.trim();
        if (url?.includes("amazon") && row.Body?.length > 1) {
          mergedData[url] = { ...mergedData[url], ...row };
        }
      });
    }

    const mergedArray = Object.values(mergedData);
    const csv = Papa.unparse(mergedArray);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "merged.csv");
  };

  return (
    <div className="h-dvh flex flex-col justify-between">
      <form onSubmit={handleFormSubmit} className="h-3/6 flex flex-col">
        <div
          onClick={handleDropAreaClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-dashed border-2 border-sky-500 p-8 m-2 h-full flex justify-center items-center  rounded-xl"
          style={{ cursor: "pointer" }}
        >
          Drag and drop, or click to select files
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {files.length ? (
          <div className="flex justify-center">
            <Button
              className="bg-sky-600 hover:bg-sky-700 p-8 m-4 rounded-xl font-semibold"
              type="submit"
            >
              Merge and Download CSV
            </Button>
          </div>
        ) : null}{" "}
      </form>
      {files.length > 0 && (
        <div className="grow flex flex-col justify-center items-center">
          <div>
            <p className="font-semibold py-2">Uploaded Files:</p>
            <ul>
              {files.map((file, index) => (
                <li key={index}>
                  <span className=" text-slate-400">{index + 1 + ". "}</span>
                  {file.name}
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="mt-8"
              onClick={clearFiles}
            >
              Clear files
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
