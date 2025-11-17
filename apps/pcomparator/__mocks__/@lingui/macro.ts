export const t = (arg1: object) => {
  if (typeof arg1 === "object") {
    return (literals: string[], ...placeholders: string[]) => {
      return literals.reduce((result: string, literal: string, i: number) => {
        return result + literal + (placeholders[i] || "");
      }, "");
    };
  }
  return arg1;
};

export const Trans  = ({ children }: { children: React.ReactNode }) => children;
