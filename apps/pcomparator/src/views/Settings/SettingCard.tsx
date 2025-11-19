import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import type { ReactNode } from "react";

interface SettingCardProps {
  title: ReactNode;
  subTitle: ReactNode;
  children: ReactNode;
}

export const SettingCard = ({ title, subTitle, children }: SettingCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-col items-start">
        <h2 className="text-base md:text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-xs md:text-sm text-gray-400 mt-1">{subTitle}</p>
      </CardHeader>
      <Divider />
      <CardBody>{children}</CardBody>
    </Card>
  );
};
