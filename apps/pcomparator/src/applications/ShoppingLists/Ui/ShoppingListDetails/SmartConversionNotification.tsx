"use client";

import { Button, Card, CardBody, Chip } from "@heroui/react";
import { SparklesIcon, XIcon } from "lucide-react";

interface SmartConversionNotificationProps {
  itemName: string;
  confidence: number;
  suggestionsCount: number;
  onShow: () => void;
  onDismiss: () => void;
}

export const SmartConversionNotification = ({
  itemName,
  confidence,
  suggestionsCount,
  onShow,
  onDismiss
}: SmartConversionNotificationProps) => {
  return (
    <Card className="mb-4 border border-primary-200 bg-gradient-to-r from-primary-50 to-blue-50">
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary-100">
              <SparklesIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900">Smart Product Suggestion</h4>
              <p className="text-xs text-gray-600 mt-1">
                Found {suggestionsCount} product matches for "{itemName}"
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Chip
                  size="sm"
                  variant="flat"
                  color={confidence > 80 ? "success" : confidence > 60 ? "primary" : "warning"}
                >
                  {Math.round(confidence)}% confidence
                </Chip>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" color="primary" variant="flat" onPress={onShow}>
              View Suggestions
            </Button>
            <Button size="sm" variant="light" isIconOnly onPress={onDismiss}>
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
