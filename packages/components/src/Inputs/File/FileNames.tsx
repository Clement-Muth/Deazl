import { Chip } from "@heroui/react";
import { Cross } from "lucide-react";

interface FileNamesProps {
  files: File[];
  onClick: (files: File[], i: number) => void;
}

export const FileNames = ({ files, onClick }: FileNamesProps) => (
  <div>
    {files.map((file, i) => (
      <Chip
        key={file.name}
        size="sm"
        endContent={<Cross />}
        onClick={() => onClick(files, i)}
        variant="light"
        color="default"
        className="cursor-pointer z-20"
      >
        {file.name}
      </Chip>
    ))}
  </div>
);
